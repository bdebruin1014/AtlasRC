import { supabase, isDemoMode } from '@/lib/supabase';
import { entityRelationshipService } from './entityRelationshipService';
import { accountService } from './accountService';

// Mock consolidated data for demo mode
const mockConsolidatedData = {
  entities: [
    { id: 'entity-1', name: 'Atlas Holdings LLC', entity_purpose: 'holding_company' },
    { id: 'entity-2', name: 'Atlas Operations Inc', entity_purpose: 'operating_company' },
    { id: 'entity-3', name: 'Sunrise Development SPE', entity_purpose: 'spe', project_type: 'lot_development' },
  ],
  intercompanyTransactions: [
    {
      id: 'ic-1',
      from_entity_id: 'entity-1',
      from_entity_name: 'Atlas Holdings LLC',
      to_entity_id: 'entity-2',
      to_entity_name: 'Atlas Operations Inc',
      amount: 50000,
      description: 'Management fee allocation',
      transaction_date: '2024-12-15',
      status: 'pending_elimination',
    },
    {
      id: 'ic-2',
      from_entity_id: 'entity-2',
      from_entity_name: 'Atlas Operations Inc',
      to_entity_id: 'entity-3',
      to_entity_name: 'Sunrise Development SPE',
      amount: 25000,
      description: 'Project funding transfer',
      transaction_date: '2024-12-10',
      status: 'pending_elimination',
    },
  ],
};

export const consolidationService = {
  // Get consolidated ownership structure with roll-up calculations
  async getConsolidatedOwnership(topEntityId) {
    const { data: tree, error } = await entityRelationshipService.getSubsidiaryTree(topEntityId);
    if (error) return { data: null, error };

    // Calculate effective ownership percentages through the chain
    const calculateEffectiveOwnership = (node, parentEffective = 100) => {
      const directOwnership = node.ownership_percentage || 100;
      const effectiveOwnership = (directOwnership * parentEffective) / 100;

      return {
        ...node,
        direct_ownership: directOwnership,
        effective_ownership: effectiveOwnership,
        children: node.children?.map(child =>
          calculateEffectiveOwnership(child, effectiveOwnership)
        ) || [],
      };
    };

    const consolidatedTree = calculateEffectiveOwnership({
      entity_id: topEntityId,
      entity: tree.entity,
      ownership_percentage: 100,
      children: tree.children || [],
    });

    return { data: consolidatedTree, error: null };
  },

  // Get flat list of all entities in consolidation group with effective ownership
  async getConsolidationGroup(topEntityId) {
    const { data: tree, error } = await this.getConsolidatedOwnership(topEntityId);
    if (error) return { data: null, error };

    const flattenTree = (node, result = []) => {
      result.push({
        entity_id: node.entity_id || node.entity?.id,
        entity_name: node.entity?.name,
        entity_purpose: node.entity?.entity_purpose,
        project_type: node.entity?.project_type,
        direct_ownership: node.direct_ownership,
        effective_ownership: node.effective_ownership,
        level: result.length === 0 ? 0 : (result.find(r =>
          r.entity_id === node.parent_entity_id
        )?.level || 0) + 1,
      });

      for (const child of node.children || []) {
        flattenTree(child, result);
      }

      return result;
    };

    return { data: flattenTree(tree), error: null };
  },

  // Detect intercompany transactions between related entities
  async detectIntercompanyTransactions(entityIds, options = {}) {
    const { startDate, endDate } = options;

    if (isDemoMode) {
      let transactions = [...mockConsolidatedData.intercompanyTransactions];

      if (startDate) {
        transactions = transactions.filter(t => t.transaction_date >= startDate);
      }
      if (endDate) {
        transactions = transactions.filter(t => t.transaction_date <= endDate);
      }

      return { data: transactions, error: null };
    }

    // Get journal entries between related entities
    let query = supabase
      .from('journal_entries')
      .select(`
        *,
        entity:entities(id, name),
        lines:journal_entry_lines(
          *,
          account:accounts(id, account_number, account_name, entity_id)
        )
      `)
      .in('entity_id', entityIds)
      .eq('is_intercompany', true);

    if (startDate) {
      query = query.gte('entry_date', startDate);
    }
    if (endDate) {
      query = query.lte('entry_date', endDate);
    }

    const { data: entries, error } = await query;
    if (error) return { data: null, error };

    // Transform into intercompany transaction format
    const transactions = entries.map(entry => ({
      id: entry.id,
      from_entity_id: entry.entity_id,
      from_entity_name: entry.entity?.name,
      to_entity_id: entry.counterparty_entity_id,
      amount: entry.lines?.reduce((sum, line) => sum + Math.abs(line.debit_amount || 0), 0) || 0,
      description: entry.description,
      transaction_date: entry.entry_date,
      status: entry.elimination_status || 'pending_elimination',
      journal_entry_id: entry.id,
    }));

    return { data: transactions, error: null };
  },

  // Flag a journal entry as intercompany
  async flagAsIntercompany(journalEntryId, counterpartyEntityId) {
    if (isDemoMode) {
      return { data: { id: journalEntryId, is_intercompany: true, counterparty_entity_id: counterpartyEntityId }, error: null };
    }

    return await supabase
      .from('journal_entries')
      .update({
        is_intercompany: true,
        counterparty_entity_id: counterpartyEntityId,
      })
      .eq('id', journalEntryId)
      .select()
      .single();
  },

  // Mark intercompany transactions as eliminated for consolidation
  async markEliminated(transactionIds) {
    if (isDemoMode) {
      mockConsolidatedData.intercompanyTransactions =
        mockConsolidatedData.intercompanyTransactions.map(t =>
          transactionIds.includes(t.id)
            ? { ...t, status: 'eliminated' }
            : t
        );
      return { data: { eliminated: transactionIds.length }, error: null };
    }

    const { error } = await supabase
      .from('journal_entries')
      .update({ elimination_status: 'eliminated' })
      .in('id', transactionIds);

    if (error) return { data: null, error };

    return { data: { eliminated: transactionIds.length }, error: null };
  },

  // Get consolidated trial balance for a group of entities
  async getConsolidatedTrialBalance(topEntityId, options = {}) {
    const { includeEliminations = true } = options;

    // Get all entities in consolidation group
    const { data: group, error: groupError } = await this.getConsolidationGroup(topEntityId);
    if (groupError) return { data: null, error: groupError };

    const entityIds = group.map(e => e.entity_id);

    // Get trial balances for all entities
    const trialBalances = await Promise.all(
      entityIds.map(async (entityId) => {
        const { data } = await accountService.getTrialBalance(entityId);
        const entity = group.find(e => e.entity_id === entityId);
        return {
          entity_id: entityId,
          entity_name: entity?.entity_name,
          effective_ownership: entity?.effective_ownership || 100,
          ...data,
        };
      })
    );

    // Consolidate accounts by account number
    const consolidatedAccounts = {};

    for (const tb of trialBalances) {
      if (!tb.accounts) continue;

      const ownershipFactor = tb.effective_ownership / 100;

      for (const type in tb.accounts) {
        for (const account of tb.accounts[type]) {
          const key = account.account_number;

          if (!consolidatedAccounts[key]) {
            consolidatedAccounts[key] = {
              account_number: account.account_number,
              account_name: account.account_name,
              account_type: account.account_type,
              is_header: account.is_header,
              consolidated_balance: 0,
              entity_balances: [],
            };
          }

          const adjustedBalance = (account.current_balance || 0) * ownershipFactor;
          consolidatedAccounts[key].consolidated_balance += adjustedBalance;
          consolidatedAccounts[key].entity_balances.push({
            entity_id: tb.entity_id,
            entity_name: tb.entity_name,
            original_balance: account.current_balance || 0,
            ownership_percentage: tb.effective_ownership,
            adjusted_balance: adjustedBalance,
          });
        }
      }
    }

    // Get intercompany eliminations if requested
    let eliminations = [];
    if (includeEliminations) {
      const { data: icTransactions } = await this.detectIntercompanyTransactions(entityIds);
      eliminations = (icTransactions || []).filter(t => t.status === 'pending_elimination');
    }

    // Organize by account type
    const accountsList = Object.values(consolidatedAccounts);
    const organized = {
      assets: accountsList.filter(a => a.account_type === 'asset'),
      liabilities: accountsList.filter(a => a.account_type === 'liability'),
      equity: accountsList.filter(a => a.account_type === 'equity'),
      revenue: accountsList.filter(a => a.account_type === 'revenue'),
      cogs: accountsList.filter(a => a.account_type === 'cogs'),
      expenses: accountsList.filter(a => a.account_type === 'expense'),
      otherIncome: accountsList.filter(a => a.account_type === 'other_income'),
      otherExpense: accountsList.filter(a => a.account_type === 'other_expense'),
    };

    // Calculate totals
    const totals = {
      totalDebits: accountsList.reduce((sum, acc) => {
        if (['asset', 'expense', 'cogs', 'other_expense'].includes(acc.account_type) && !acc.is_header) {
          return sum + acc.consolidated_balance;
        }
        return sum;
      }, 0),
      totalCredits: accountsList.reduce((sum, acc) => {
        if (['liability', 'equity', 'revenue', 'other_income'].includes(acc.account_type) && !acc.is_header) {
          return sum + acc.consolidated_balance;
        }
        return sum;
      }, 0),
      pendingEliminations: eliminations.reduce((sum, e) => sum + e.amount, 0),
    };

    return {
      data: {
        consolidation_group: group,
        accounts: organized,
        totals,
        eliminations,
        entity_count: entityIds.length,
      },
      error: null,
    };
  },

  // Get consolidated financial summary
  async getConsolidatedSummary(topEntityId) {
    const { data: tb, error } = await this.getConsolidatedTrialBalance(topEntityId);
    if (error) return { data: null, error };

    const accounts = [
      ...(tb.accounts.assets || []),
      ...(tb.accounts.liabilities || []),
      ...(tb.accounts.equity || []),
      ...(tb.accounts.revenue || []),
      ...(tb.accounts.cogs || []),
      ...(tb.accounts.expenses || []),
      ...(tb.accounts.otherIncome || []),
      ...(tb.accounts.otherExpense || []),
    ];

    const summary = {
      totalAssets: accounts
        .filter(a => a.account_type === 'asset' && !a.is_header)
        .reduce((sum, a) => sum + a.consolidated_balance, 0),
      totalLiabilities: accounts
        .filter(a => a.account_type === 'liability' && !a.is_header)
        .reduce((sum, a) => sum + a.consolidated_balance, 0),
      totalEquity: accounts
        .filter(a => a.account_type === 'equity' && !a.is_header)
        .reduce((sum, a) => sum + a.consolidated_balance, 0),
      totalRevenue: accounts
        .filter(a => a.account_type === 'revenue' && !a.is_header)
        .reduce((sum, a) => sum + a.consolidated_balance, 0),
      totalExpenses: accounts
        .filter(a => ['expense', 'cogs', 'other_expense'].includes(a.account_type) && !a.is_header)
        .reduce((sum, a) => sum + a.consolidated_balance, 0),
      entityCount: tb.entity_count,
      pendingEliminations: tb.totals.pendingEliminations,
    };

    summary.netIncome = summary.totalRevenue - summary.totalExpenses;
    summary.netWorth = summary.totalAssets - summary.totalLiabilities;

    return { data: summary, error: null };
  },

  // Auto-detect potential intercompany transactions
  async autoDetectIntercompany(entityIds) {
    if (isDemoMode) {
      return { data: mockConsolidatedData.intercompanyTransactions, error: null };
    }

    // Find journal entries where accounts reference multiple entities
    const { data: entries, error } = await supabase
      .from('journal_entries')
      .select(`
        *,
        entity:entities(id, name),
        lines:journal_entry_lines(
          *,
          account:accounts(id, account_number, account_name, entity_id)
        )
      `)
      .in('entity_id', entityIds)
      .eq('is_intercompany', false); // Only look at non-flagged entries

    if (error) return { data: null, error };

    // Filter for entries that might be intercompany based on description patterns
    const intercompanyPatterns = [
      /transfer/i,
      /intercompany/i,
      /inter-company/i,
      /ic\s/i,
      /management fee/i,
      /allocation/i,
      /due to/i,
      /due from/i,
      /loan to/i,
      /loan from/i,
      /receivable from/i,
      /payable to/i,
    ];

    const potentialIntercompany = entries.filter(entry => {
      const description = entry.description || '';
      return intercompanyPatterns.some(pattern => pattern.test(description));
    });

    return {
      data: potentialIntercompany.map(entry => ({
        id: entry.id,
        entity_id: entry.entity_id,
        entity_name: entry.entity?.name,
        description: entry.description,
        entry_date: entry.entry_date,
        amount: entry.lines?.reduce((sum, line) => sum + Math.abs(line.debit_amount || 0), 0) || 0,
        suggested: true,
      })),
      error: null,
    };
  },

  // Get elimination entries needed for consolidation
  async generateEliminationEntries(topEntityId, asOfDate = null) {
    const { data: icTransactions, error } = await this.detectIntercompanyTransactions(
      await this.getConsolidationGroup(topEntityId).then(r => r.data?.map(e => e.entity_id) || []),
      { endDate: asOfDate }
    );

    if (error) return { data: null, error };

    const pendingEliminations = icTransactions.filter(t => t.status === 'pending_elimination');

    // Generate elimination journal entries
    const eliminationEntries = pendingEliminations.map(transaction => ({
      type: 'elimination',
      original_transaction_id: transaction.id,
      description: `Elimination: ${transaction.description}`,
      amount: transaction.amount,
      from_entity: transaction.from_entity_name,
      to_entity: transaction.to_entity_name,
      // Elimination debits the liability/expense side and credits the asset/revenue side
      entries: [
        {
          description: `Eliminate intercompany ${transaction.description}`,
          debit_account: 'Intercompany Payable (elimination)',
          credit_account: 'Intercompany Receivable (elimination)',
          amount: transaction.amount,
        },
      ],
    }));

    return {
      data: {
        eliminations: eliminationEntries,
        total_amount: pendingEliminations.reduce((sum, t) => sum + t.amount, 0),
        count: eliminationEntries.length,
      },
      error: null,
    };
  },
};

export default consolidationService;
