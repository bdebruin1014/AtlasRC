// src/services/dispositionAutomationService.js
// Automates the Construction -> Disposition -> Accounting flow.
//
// This service bridges three modules:
//   1. Construction  – houses reaching "complete" milestone
//   2. Disposition   – sales records and settlement statements
//   3. Accounting    – journal entries that book revenue, COGS, and closing costs
//
// All Supabase queries are inline (no cross-service imports) to avoid circular
// dependencies.  Each public function follows the Supabase-first / demo-fallback
// pattern used throughout the codebase.

import { supabase } from '@/lib/supabase';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generate a human-readable JE number based on the current timestamp.
 * Format: JE-YYYY-NNN  (NNN = sequential placeholder when in demo mode)
 */
function generateEntryNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const seq = String(Math.floor(Math.random() * 900) + 100); // 100-999
  return `JE-${year}-${seq}`;
}

/**
 * Today's date as YYYY-MM-DD.
 */
function todayISO() {
  return new Date().toISOString().split('T')[0];
}

// ─── 1. onHouseComplete ───────────────────────────────────────────────────────

/**
 * Called when a construction house reaches the "complete" milestone.
 *
 * Steps:
 *   a) Fetch the house record from construction_houses.
 *   b) If the house has a buyer_name, auto-create a sale in the `sales` table
 *      with status "under_contract".
 *   c) Create (or upsert) a disposition settlement tied to the project so the
 *      closing team has a settlement stub ready to populate.
 *   d) Return { house, sale, settlement } with whatever was created.
 *
 * @param {string} houseId   – UUID of the construction house
 * @param {string} projectId – UUID of the project
 * @param {string} entityId  – UUID of the owning entity (for accounting)
 * @returns {Promise<{house: object, sale: object|null, settlement: object|null}>}
 */
export async function onHouseComplete(houseId, projectId, entityId) {
  try {
    // ── a) Fetch house data ────────────────────────────────────────────────
    const { data: house, error: houseError } = await supabase
      .from('construction_houses')
      .select('*')
      .eq('id', houseId)
      .single();

    if (houseError) throw houseError;

    let sale = null;
    let settlement = null;

    // ── b) Auto-create sale if buyer exists ────────────────────────────────
    if (house.buyer_name) {
      const salePayload = {
        project_id: projectId,
        entity_id: entityId,
        house_id: houseId,
        unit_identifier: house.house_name || `Lot ${house.house_number}`,
        property_type: 'home',
        buyer_name: house.buyer_name,
        list_price: parseFloat(house.contract_price) || 0,
        sale_price: parseFloat(house.contract_price) || 0,
        status: 'under_contract',
        listing_date: house.completion_date || todayISO(),
        notes: `Auto-created from construction house ${house.house_name || houseId} completion.`,
      };

      const { data: createdSale, error: saleError } = await supabase
        .from('sales')
        .insert(salePayload)
        .select()
        .single();

      if (saleError) throw saleError;
      sale = createdSale;
    }

    // ── c) Create a disposition settlement stub ────────────────────────────
    const settlementPayload = {
      project_id: projectId,
      entity_id: entityId,
      house_id: houseId,
      sale_id: sale?.id || null,
      buyer_name: house.buyer_name || null,
      status: 'draft',
      closing_date: null, // To be filled by closing team
      sale_price: parseFloat(house.contract_price) || 0,
      actual_cost: parseFloat(house.actual_cost) || 0,
      notes: `Auto-created on house completion for ${house.house_name || houseId}.`,
    };

    const { data: createdSettlement, error: settlementError } = await supabase
      .from('disposition_settlements')
      .insert(settlementPayload)
      .select()
      .single();

    if (settlementError) throw settlementError;
    settlement = createdSettlement;

    return { house, sale, settlement };
  } catch (err) {
    console.error('onHouseComplete error:', err);

    // ── Demo / fallback result ─────────────────────────────────────────────
    const demoHouse = {
      id: houseId,
      house_name: 'Demo House',
      house_number: '1',
      project_id: projectId,
      entity_id: entityId,
      buyer_name: 'Demo Buyer',
      contract_price: 400000,
      actual_cost: 288000,
      current_milestone: 'complete',
      completion_date: todayISO(),
    };

    const demoSale = {
      id: `sale-${Date.now()}`,
      project_id: projectId,
      entity_id: entityId,
      house_id: houseId,
      unit_identifier: demoHouse.house_name,
      property_type: 'home',
      buyer_name: demoHouse.buyer_name,
      list_price: demoHouse.contract_price,
      sale_price: demoHouse.contract_price,
      status: 'under_contract',
      listing_date: todayISO(),
      created_at: new Date().toISOString(),
    };

    const demoSettlement = {
      id: `settlement-${Date.now()}`,
      project_id: projectId,
      entity_id: entityId,
      house_id: houseId,
      sale_id: demoSale.id,
      buyer_name: demoHouse.buyer_name,
      status: 'draft',
      sale_price: demoHouse.contract_price,
      actual_cost: demoHouse.actual_cost,
      created_at: new Date().toISOString(),
    };

    return { house: demoHouse, sale: demoSale, settlement: demoSettlement };
  }
}

// ─── 2. onSaleClosed ──────────────────────────────────────────────────────────

/**
 * Called when a sale's status changes to "closed".
 *
 * Creates a compound journal entry that books:
 *   Line 1  – DR  Cash / Accounts Receivable        (sale_price)
 *   Line 2  – CR  Revenue – Home Sales               (gross_proceeds)
 *   Line 3  – DR  Cost of Goods Sold                 (actual_cost from house)
 *   Line 4  – CR  Construction in Progress            (actual_cost)
 *   Line 5  – DR  Selling Expenses                    (broker_commission + closing_costs)
 *   Line 6  – CR  Cash                               (broker_commission + closing_costs)
 *
 * @param {string} saleId    – UUID of the sale record
 * @param {string} projectId – UUID of the project
 * @param {string} entityId  – UUID of the owning entity
 * @returns {Promise<{sale: object, journalEntry: object}>}
 */
export async function onSaleClosed(saleId, projectId, entityId) {
  try {
    // ── Fetch the sale record ──────────────────────────────────────────────
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .select('*')
      .eq('id', saleId)
      .single();

    if (saleError) throw saleError;

    // ── Fetch the related house to get actual_cost ─────────────────────────
    // The sale may carry a house_id linking it back to construction_houses.
    let actualCost = 0;
    if (sale.house_id) {
      const { data: house, error: houseError } = await supabase
        .from('construction_houses')
        .select('actual_cost, estimated_cost')
        .eq('id', sale.house_id)
        .single();

      if (!houseError && house) {
        // Prefer actual_cost; fall back to estimated_cost
        actualCost = parseFloat(house.actual_cost) || parseFloat(house.estimated_cost) || 0;
      }
    }

    // ── Derive financial amounts ───────────────────────────────────────────
    const salePrice = parseFloat(sale.sale_price) || parseFloat(sale.list_price) || 0;
    const grossProceeds = parseFloat(sale.gross_proceeds) || salePrice;
    const brokerCommission = parseFloat(sale.broker_commission) || 0;
    const closingCosts = parseFloat(sale.closing_costs) || 0;
    const sellingExpenses = brokerCommission + closingCosts;

    // ── Build the journal entry ────────────────────────────────────────────
    const today = todayISO();
    const entryNumber = generateEntryNumber();

    const journalEntryPayload = {
      entity_id: entityId,
      project_id: projectId,
      sale_id: saleId,
      entry_number: entryNumber,
      date: sale.actual_closing_date || sale.closing_date || today,
      description: `Home sale closing – ${sale.buyer_name || sale.unit_identifier || saleId}`,
      status: 'draft',
      total_debit: salePrice + actualCost + sellingExpenses,
      total_credit: grossProceeds + actualCost + sellingExpenses,
      source: 'disposition_automation',
    };

    const { data: newEntry, error: entryError } = await supabase
      .from('journal_entries')
      .insert(journalEntryPayload)
      .select()
      .single();

    if (entryError) throw entryError;

    // ── Build the journal entry lines ──────────────────────────────────────
    const lines = [];

    // Line 1: DR Cash / Accounts Receivable — buyer pays sale price
    lines.push({
      journal_entry_id: newEntry.id,
      account_name: 'Cash / Accounts Receivable',
      description: 'Proceeds received from home sale',
      debit: salePrice,
      credit: 0,
    });

    // Line 2: CR Revenue – Home Sales — recognize gross proceeds as revenue
    lines.push({
      journal_entry_id: newEntry.id,
      account_name: 'Revenue - Home Sales',
      description: 'Gross proceeds from home sale',
      debit: 0,
      credit: grossProceeds,
    });

    if (actualCost > 0) {
      // Line 3: DR Cost of Goods Sold — expense the construction cost
      lines.push({
        journal_entry_id: newEntry.id,
        account_name: 'Cost of Goods Sold',
        description: 'Actual construction cost of home sold',
        debit: actualCost,
        credit: 0,
      });

      // Line 4: CR Construction in Progress — relieve the CIP asset
      lines.push({
        journal_entry_id: newEntry.id,
        account_name: 'Construction in Progress',
        description: 'Relieve CIP for completed and sold home',
        debit: 0,
        credit: actualCost,
      });
    }

    if (sellingExpenses > 0) {
      // Line 5: DR Selling Expenses — commissions and closing costs
      lines.push({
        journal_entry_id: newEntry.id,
        account_name: 'Selling Expenses',
        description: `Broker commission ($${brokerCommission.toLocaleString()}) + closing costs ($${closingCosts.toLocaleString()})`,
        debit: sellingExpenses,
        credit: 0,
      });

      // Line 6: CR Cash — cash outflow for selling expenses
      lines.push({
        journal_entry_id: newEntry.id,
        account_name: 'Cash',
        description: 'Cash paid for broker commission and closing costs',
        debit: 0,
        credit: sellingExpenses,
      });
    }

    // Insert all lines at once
    if (lines.length > 0) {
      const { error: linesError } = await supabase
        .from('journal_entry_lines')
        .insert(lines);

      if (linesError) throw linesError;
    }

    return { sale, journalEntry: { ...newEntry, lines } };
  } catch (err) {
    console.error('onSaleClosed error:', err);

    // ── Demo / fallback result ─────────────────────────────────────────────
    const demoSalePrice = 400000;
    const demoActualCost = 288000;
    const demoBrokerCommission = 12000;
    const demoClosingCosts = 8000;
    const demoSellingExpenses = demoBrokerCommission + demoClosingCosts;

    const demoSale = {
      id: saleId,
      project_id: projectId,
      entity_id: entityId,
      buyer_name: 'Demo Buyer',
      sale_price: demoSalePrice,
      gross_proceeds: demoSalePrice,
      broker_commission: demoBrokerCommission,
      closing_costs: demoClosingCosts,
      status: 'closed',
      actual_closing_date: todayISO(),
    };

    const demoJE = {
      id: `je-${Date.now()}`,
      entity_id: entityId,
      project_id: projectId,
      sale_id: saleId,
      entry_number: generateEntryNumber(),
      date: todayISO(),
      description: `Home sale closing – Demo Buyer`,
      status: 'draft',
      total_debit: demoSalePrice + demoActualCost + demoSellingExpenses,
      total_credit: demoSalePrice + demoActualCost + demoSellingExpenses,
      source: 'disposition_automation',
      lines: [
        {
          account_name: 'Cash / Accounts Receivable',
          description: 'Proceeds received from home sale',
          debit: demoSalePrice,
          credit: 0,
        },
        {
          account_name: 'Revenue - Home Sales',
          description: 'Gross proceeds from home sale',
          debit: 0,
          credit: demoSalePrice,
        },
        {
          account_name: 'Cost of Goods Sold',
          description: 'Actual construction cost of home sold',
          debit: demoActualCost,
          credit: 0,
        },
        {
          account_name: 'Construction in Progress',
          description: 'Relieve CIP for completed and sold home',
          debit: 0,
          credit: demoActualCost,
        },
        {
          account_name: 'Selling Expenses',
          description: `Broker commission ($${demoBrokerCommission.toLocaleString()}) + closing costs ($${demoClosingCosts.toLocaleString()})`,
          debit: demoSellingExpenses,
          credit: 0,
        },
        {
          account_name: 'Cash',
          description: 'Cash paid for broker commission and closing costs',
          debit: 0,
          credit: demoSellingExpenses,
        },
      ],
    };

    return { sale: demoSale, journalEntry: demoJE };
  }
}

// ─── 3. generateDispositionJE ─────────────────────────────────────────────────

/**
 * Manual trigger: create accounting entries from an existing disposition
 * settlement.  This is useful when the settlement was created outside of
 * the automation flow (e.g. manually via the Disposition UI) and the user
 * now wants to generate the matching journal entry.
 *
 * The function reads the settlement and its line items, then creates a JE
 * that mirrors the same debit/credit structure as onSaleClosed:
 *   - DR Cash (sale_price)
 *   - CR Revenue – Home Sales (sale_price)
 *   - DR COGS (actual_cost)
 *   - CR CIP (actual_cost)
 *   - DR Selling Expenses (sum of settlement items marked as selling expense)
 *   - CR Cash (selling expenses total)
 *
 * @param {string} settlementId – UUID of the disposition_settlement
 * @param {string} entityId     – UUID of the owning entity
 * @returns {Promise<{settlement: object, journalEntry: object}>}
 */
export async function generateDispositionJE(settlementId, entityId) {
  try {
    // ── Fetch settlement with its line items ───────────────────────────────
    const { data: settlement, error: settlementError } = await supabase
      .from('disposition_settlements')
      .select(`
        *,
        items:disposition_settlement_items(*)
      `)
      .eq('id', settlementId)
      .single();

    if (settlementError) throw settlementError;

    // ── Derive financial amounts from the settlement ───────────────────────
    const salePrice = parseFloat(settlement.sale_price) || 0;
    const actualCost = parseFloat(settlement.actual_cost) || 0;

    // Sum settlement items that represent selling expenses (commissions, fees, etc.)
    const items = settlement.items || [];
    const sellingExpenseTotal = items
      .filter(item => item.category === 'selling_expense' || item.category === 'commission' || item.category === 'closing_cost')
      .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    // If there are no categorized items, try to read broker_commission / closing_costs
    // directly from the settlement (some schemas store them as top-level fields).
    const brokerCommission = parseFloat(settlement.broker_commission) || 0;
    const closingCosts = parseFloat(settlement.closing_costs) || 0;
    const sellingExpenses = sellingExpenseTotal || (brokerCommission + closingCosts);

    // ── Build the journal entry ────────────────────────────────────────────
    const today = todayISO();
    const entryNumber = generateEntryNumber();

    const journalEntryPayload = {
      entity_id: entityId,
      project_id: settlement.project_id,
      settlement_id: settlementId,
      entry_number: entryNumber,
      date: settlement.closing_date || today,
      description: `Disposition settlement – ${settlement.buyer_name || settlementId}`,
      status: 'draft',
      total_debit: salePrice + actualCost + sellingExpenses,
      total_credit: salePrice + actualCost + sellingExpenses,
      source: 'disposition_automation',
    };

    const { data: newEntry, error: entryError } = await supabase
      .from('journal_entries')
      .insert(journalEntryPayload)
      .select()
      .single();

    if (entryError) throw entryError;

    // ── Build journal entry lines ──────────────────────────────────────────
    const lines = [];

    // Line 1: DR Cash / Accounts Receivable — proceeds from disposition
    lines.push({
      journal_entry_id: newEntry.id,
      account_name: 'Cash / Accounts Receivable',
      description: 'Disposition proceeds received',
      debit: salePrice,
      credit: 0,
    });

    // Line 2: CR Revenue – Home Sales — recognize revenue
    lines.push({
      journal_entry_id: newEntry.id,
      account_name: 'Revenue - Home Sales',
      description: 'Revenue recognized from disposition',
      debit: 0,
      credit: salePrice,
    });

    if (actualCost > 0) {
      // Line 3: DR Cost of Goods Sold — expense the build cost
      lines.push({
        journal_entry_id: newEntry.id,
        account_name: 'Cost of Goods Sold',
        description: 'Construction cost of disposed property',
        debit: actualCost,
        credit: 0,
      });

      // Line 4: CR Construction in Progress — relieve CIP asset
      lines.push({
        journal_entry_id: newEntry.id,
        account_name: 'Construction in Progress',
        description: 'Relieve CIP for disposed property',
        debit: 0,
        credit: actualCost,
      });
    }

    if (sellingExpenses > 0) {
      // Line 5: DR Selling Expenses — commissions, closing costs, fees
      lines.push({
        journal_entry_id: newEntry.id,
        account_name: 'Selling Expenses',
        description: 'Commissions and closing costs from disposition settlement',
        debit: sellingExpenses,
        credit: 0,
      });

      // Line 6: CR Cash — outflow for selling expenses
      lines.push({
        journal_entry_id: newEntry.id,
        account_name: 'Cash',
        description: 'Cash paid for disposition selling expenses',
        debit: 0,
        credit: sellingExpenses,
      });
    }

    // Insert all lines
    if (lines.length > 0) {
      const { error: linesError } = await supabase
        .from('journal_entry_lines')
        .insert(lines);

      if (linesError) throw linesError;
    }

    return { settlement, journalEntry: { ...newEntry, lines } };
  } catch (err) {
    console.error('generateDispositionJE error:', err);

    // ── Demo / fallback result ─────────────────────────────────────────────
    const demoSalePrice = 400000;
    const demoActualCost = 288000;
    const demoSellingExpenses = 20000;

    const demoSettlement = {
      id: settlementId,
      entity_id: entityId,
      project_id: 'demo-project-1',
      buyer_name: 'Demo Buyer',
      sale_price: demoSalePrice,
      actual_cost: demoActualCost,
      status: 'draft',
      closing_date: todayISO(),
      items: [],
    };

    const demoJE = {
      id: `je-${Date.now()}`,
      entity_id: entityId,
      project_id: 'demo-project-1',
      settlement_id: settlementId,
      entry_number: generateEntryNumber(),
      date: todayISO(),
      description: `Disposition settlement – Demo Buyer`,
      status: 'draft',
      total_debit: demoSalePrice + demoActualCost + demoSellingExpenses,
      total_credit: demoSalePrice + demoActualCost + demoSellingExpenses,
      source: 'disposition_automation',
      lines: [
        {
          account_name: 'Cash / Accounts Receivable',
          description: 'Disposition proceeds received',
          debit: demoSalePrice,
          credit: 0,
        },
        {
          account_name: 'Revenue - Home Sales',
          description: 'Revenue recognized from disposition',
          debit: 0,
          credit: demoSalePrice,
        },
        {
          account_name: 'Cost of Goods Sold',
          description: 'Construction cost of disposed property',
          debit: demoActualCost,
          credit: 0,
        },
        {
          account_name: 'Construction in Progress',
          description: 'Relieve CIP for disposed property',
          debit: 0,
          credit: demoActualCost,
        },
        {
          account_name: 'Selling Expenses',
          description: 'Commissions and closing costs from disposition settlement',
          debit: demoSellingExpenses,
          credit: 0,
        },
        {
          account_name: 'Cash',
          description: 'Cash paid for disposition selling expenses',
          debit: 0,
          credit: demoSellingExpenses,
        },
      ],
    };

    return { settlement: demoSettlement, journalEntry: demoJE };
  }
}
