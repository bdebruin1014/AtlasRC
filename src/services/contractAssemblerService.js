import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';

// =====================================================
// MOCK DATA — realistic demo fallback
// =====================================================

const MOCK_HOUSE = {
  id: 'house-lot-14',
  lot_number: '14',
  lot_label: 'Lot 14 - Magnolia A',
  subdivision: 'Magnolia Ridge',
  street_address: '2814 Magnolia Ridge Dr',
  city: 'Cedar Park',
  state: 'TX',
  zip: '78613',
  lot_size_sqft: 12500,
  lot_premium: 5000,
  plan_id: 'plan-magnolia-a',
  buyer_contact_id: 'contact-mitchell',
  upgrade_package_id: 'pkg-magnolia-lot14',
  current_milestone: 'pre_contract',
  project_id: 'proj-magnolia-ridge',
  status: 'active',
  created_at: '2026-01-10T12:00:00Z',
  updated_at: '2026-02-10T09:30:00Z',
};

const MOCK_BUYER = {
  id: 'contact-mitchell',
  first_name: 'John',
  last_name: 'Mitchell',
  display_name: 'John & Sarah Mitchell',
  email: 'john.mitchell@email.com',
  phone: '(512) 555-0147',
  secondary_contact_name: 'Sarah Mitchell',
  secondary_contact_email: 'sarah.mitchell@email.com',
  secondary_contact_phone: '(512) 555-0148',
  mailing_address: '1402 Elm Street, Austin, TX 78701',
  type: 'buyer',
};

const MOCK_PLAN = {
  id: 'plan-magnolia-a',
  name: 'Magnolia A',
  code: 'MAG-A',
  sqft: 1800,
  bedrooms: 3,
  bathrooms: 2.5,
  stories: 2,
  garage_spaces: 2,
  description: 'Magnolia A — 1,800 sf, 3 bed / 2.5 bath, 2-story with open concept living',
  base_price: 325000,
  is_active: true,
};

const MOCK_BUDGET_ITEMS = [
  { id: 'bi-1', house_id: 'house-lot-14', category: 'Foundation', description: 'Slab on grade — post-tension', amount: 18500, display_order: 1 },
  { id: 'bi-2', house_id: 'house-lot-14', category: 'Foundation', description: 'Plumbing rough-in (under slab)', amount: 4200, display_order: 2 },
  { id: 'bi-3', house_id: 'house-lot-14', category: 'Framing', description: 'Framing labor & material', amount: 38000, display_order: 3 },
  { id: 'bi-4', house_id: 'house-lot-14', category: 'Framing', description: 'Trusses / engineered lumber', amount: 12500, display_order: 4 },
  { id: 'bi-5', house_id: 'house-lot-14', category: 'Mechanical', description: 'HVAC — 2-zone system', amount: 9800, display_order: 5 },
  { id: 'bi-6', house_id: 'house-lot-14', category: 'Mechanical', description: 'Electrical rough & finish', amount: 8500, display_order: 6 },
  { id: 'bi-7', house_id: 'house-lot-14', category: 'Mechanical', description: 'Plumbing top-out & finish', amount: 7200, display_order: 7 },
  { id: 'bi-8', house_id: 'house-lot-14', category: 'Exterior', description: 'Roofing — 30-yr architectural', amount: 9200, display_order: 8 },
  { id: 'bi-9', house_id: 'house-lot-14', category: 'Exterior', description: 'Brick & stone veneer', amount: 14000, display_order: 9 },
  { id: 'bi-10', house_id: 'house-lot-14', category: 'Exterior', description: 'Windows & exterior doors', amount: 8800, display_order: 10 },
  { id: 'bi-11', house_id: 'house-lot-14', category: 'Interior', description: 'Drywall — hang, tape, texture', amount: 11500, display_order: 11 },
  { id: 'bi-12', house_id: 'house-lot-14', category: 'Interior', description: 'Interior trim & doors', amount: 7800, display_order: 12 },
  { id: 'bi-13', house_id: 'house-lot-14', category: 'Interior', description: 'Cabinets & countertops', amount: 14200, display_order: 13 },
  { id: 'bi-14', house_id: 'house-lot-14', category: 'Interior', description: 'Flooring — LVP & tile', amount: 9500, display_order: 14 },
  { id: 'bi-15', house_id: 'house-lot-14', category: 'Interior', description: 'Paint — interior', amount: 5200, display_order: 15 },
  { id: 'bi-16', house_id: 'house-lot-14', category: 'Interior', description: 'Appliance package', amount: 4800, display_order: 16 },
  { id: 'bi-17', house_id: 'house-lot-14', category: 'Site Work', description: 'Lot clearing & grading', amount: 3500, display_order: 17 },
  { id: 'bi-18', house_id: 'house-lot-14', category: 'Site Work', description: 'Driveway & flatwork', amount: 4800, display_order: 18 },
  { id: 'bi-19', house_id: 'house-lot-14', category: 'Site Work', description: 'Landscaping & sod', amount: 3500, display_order: 19 },
  { id: 'bi-20', house_id: 'house-lot-14', category: 'Soft Costs', description: 'Permits & impact fees', amount: 6500, display_order: 20 },
  { id: 'bi-21', house_id: 'house-lot-14', category: 'Soft Costs', description: 'Architectural & engineering', amount: 3500, display_order: 21 },
  { id: 'bi-22', house_id: 'house-lot-14', category: 'Soft Costs', description: 'Builder risk insurance', amount: 1800, display_order: 22 },
  { id: 'bi-23', house_id: 'house-lot-14', category: 'Soft Costs', description: 'Survey & stakeout', amount: 1200, display_order: 23 },
];

const MOCK_UPGRADE_PACKAGE = {
  id: 'pkg-magnolia-lot14',
  name: 'Magnolia Lot 14 Premium Package',
  description: 'Buyer-selected upgrades for Lot 14',
  total_price: 24500,
  items: [
    { name: 'Quartz countertops (kitchen & baths)', price: 6500 },
    { name: 'Hardwood stair treads', price: 2800 },
    { name: 'Extended covered patio (12×16)', price: 8500 },
    { name: 'Upgraded lighting package', price: 3200 },
    { name: 'Tankless water heater', price: 1800 },
    { name: 'Smart home pre-wire package', price: 1700 },
  ],
};

const MOCK_LOT_CONDITION = {
  lot_number: '14',
  subdivision: 'Magnolia Ridge',
  lot_size_sqft: 12500,
  lot_width_ft: 62,
  lot_depth_ft: 125,
  topography: 'level',
  soil_type: 'clay loam',
  tree_removal_required: false,
  retaining_wall_required: false,
  fill_dirt_required: false,
  drainage_notes: 'Standard sheet flow to rear — no special drainage needed',
  utility_access: 'All utilities available at lot line',
  easements: 'Standard 10ft utility easement along rear property line',
  setbacks: { front: 25, rear: 10, left: 5, right: 5 },
  survey_date: '2025-12-15',
  surveyor: 'Austin Land Surveying, Inc.',
};

const DEFAULT_DRAW_MILESTONES = [
  'Pre-Construction',
  'Foundation Complete',
  'Framing & Dry-In',
  'Mechanical Rough-In Complete',
  'Final Completion',
];

const DEFAULT_TERMS = `CONSTRUCTION AGREEMENT TERMS AND CONDITIONS

1. SCOPE OF WORK
Builder agrees to construct the residence in accordance with the approved plans and specifications, subject to the terms of this agreement.

2. PAYMENT SCHEDULE
Buyer agrees to make progress payments per the 5-draw schedule attached as Exhibit A. Each draw is due within 10 business days of milestone completion notification.

3. CHANGE ORDERS
Any modifications to the approved plans or specifications must be documented via a written change order signed by both parties. Change orders may affect the contract price and completion timeline.

4. CONSTRUCTION TIMELINE
Builder estimates construction completion within 180 calendar days from the date of permit issuance, subject to weather delays, material availability, and buyer-requested changes.

5. WARRANTY
Builder provides a 1-year workmanship warranty and passes through all manufacturer warranties on materials, appliances, and mechanical systems. Structural warranty per state requirements.

6. DISPUTE RESOLUTION
Any disputes arising under this agreement shall first be subject to mediation before either party may pursue binding arbitration or litigation.

7. PERMITS & INSPECTIONS
Builder is responsible for obtaining all required building permits and scheduling all required inspections. Buyer shall have reasonable access to the property for walk-throughs upon prior arrangement.

8. INSURANCE
Builder shall maintain builder's risk insurance and general liability insurance throughout the construction period. Buyer is responsible for homeowner's insurance effective at closing.`;

// =====================================================
// SERVICE FUNCTIONS
// =====================================================

/**
 * Assemble all contract data for a given house.
 * Fetches and joins: construction_houses, contacts, floor_plans, 
 * construction_budget_items, upgrade_packages.
 * Returns a single flattened object.
 */
export const assembleContractData = async (houseId) => {
  if (isDemoMode()) {
    const budgetTotal = MOCK_BUDGET_ITEMS.reduce((sum, i) => sum + i.amount, 0);
    const totalPrice = MOCK_PLAN.base_price + (MOCK_UPGRADE_PACKAGE.total_price || 0) + (MOCK_HOUSE.lot_premium || 0);
    return {
      house: MOCK_HOUSE,
      buyer: MOCK_BUYER,
      plan: MOCK_PLAN,
      budgetItems: MOCK_BUDGET_ITEMS,
      budgetTotal,
      upgradePackage: MOCK_UPGRADE_PACKAGE,
      lotCondition: MOCK_LOT_CONDITION,
      basePrice: MOCK_PLAN.base_price,
      upgradeTotal: MOCK_UPGRADE_PACKAGE.total_price,
      lotPremium: MOCK_HOUSE.lot_premium,
      totalContractPrice: totalPrice,
      drawSchedule: calculateDrawSchedule(totalPrice),
    };
  }

  // Fetch house with related data
  const { data: house, error: houseErr } = await supabase
    .from('construction_houses')
    .select('*')
    .eq('id', houseId)
    .single();
  if (houseErr) throw houseErr;

  // Fetch buyer contact
  let buyer = null;
  if (house.buyer_contact_id) {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', house.buyer_contact_id)
      .single();
    if (!error) buyer = data;
  }

  // Fetch floor plan
  let plan = null;
  if (house.plan_id) {
    const { data, error } = await supabase
      .from('floor_plans')
      .select('*')
      .eq('id', house.plan_id)
      .single();
    if (!error) plan = data;
  }

  // Fetch budget items
  const { data: budgetItems, error: budgetErr } = await supabase
    .from('construction_budget_items')
    .select('*')
    .eq('house_id', houseId)
    .order('category')
    .order('display_order');
  if (budgetErr) throw budgetErr;

  // Fetch upgrade package
  let upgradePackage = null;
  if (house.upgrade_package_id) {
    const { data, error } = await supabase
      .from('upgrade_packages')
      .select('*')
      .eq('id', house.upgrade_package_id)
      .single();
    if (!error) upgradePackage = data;
  }

  const budgetTotal = (budgetItems || []).reduce((sum, i) => sum + (i.amount || 0), 0);
  const basePrice = plan?.base_price || 0;
  const upgradeTotal = upgradePackage?.total_price || 0;
  const lotPremium = house.lot_premium || 0;
  const totalContractPrice = basePrice + upgradeTotal + lotPremium;

  return {
    house,
    buyer,
    plan,
    budgetItems: budgetItems || [],
    budgetTotal,
    upgradePackage,
    lotCondition: house.lot_condition_report || {},
    basePrice,
    upgradeTotal,
    lotPremium,
    totalContractPrice,
    drawSchedule: calculateDrawSchedule(totalContractPrice),
  };
};

/**
 * Get houses eligible for contract assembly.
 * Eligible = current_milestone is 'pre_contract' and no active construction_contracts record.
 */
export const getEligibleHouses = async () => {
  if (isDemoMode()) {
    return [MOCK_HOUSE];
  }

  // Get houses at pre_contract milestone
  const { data: houses, error: housesErr } = await supabase
    .from('construction_houses')
    .select('*')
    .eq('current_milestone', 'pre_contract');
  if (housesErr) throw housesErr;

  if (!houses || houses.length === 0) return [];

  // Get house IDs that already have a non-cancelled contract
  const houseIds = houses.map(h => h.id);
  const { data: existingContracts, error: contractErr } = await supabase
    .from('construction_contracts')
    .select('house_id, status')
    .in('house_id', houseIds)
    .neq('status', 'cancelled');
  if (contractErr) throw contractErr;

  const contractedHouseIds = new Set((existingContracts || []).map(c => c.house_id));
  return houses.filter(h => !contractedHouseIds.has(h.id));
};

/**
 * Save or update a contract draft.
 * Upserts a construction_contracts record with status 'draft'.
 */
export const saveContractDraft = async (houseId, data) => {
  if (isDemoMode()) {
    return {
      id: 'contract-draft-' + houseId,
      house_id: houseId,
      status: 'draft',
      ...data,
      updated_at: new Date().toISOString(),
    };
  }

  // Check for existing draft
  const { data: existing } = await supabase
    .from('construction_contracts')
    .select('id')
    .eq('house_id', houseId)
    .eq('status', 'draft')
    .maybeSingle();

  const record = {
    house_id: houseId,
    status: 'draft',
    buyer_contact_id: data.buyer_contact_id || null,
    plan_id: data.plan_id || null,
    upgrade_package_id: data.upgrade_package_id || null,
    project_id: data.project_id || null,
    base_price: data.base_price || null,
    upgrade_total: data.upgrade_total || 0,
    lot_premium: data.lot_premium || 0,
    total_contract_price: data.total_contract_price || null,
    draw_schedule: data.draw_schedule || [],
    lot_condition_report: data.lot_condition_report || {},
    terms_and_conditions: data.terms_and_conditions || null,
    warranty_terms: data.warranty_terms || null,
    special_provisions: data.special_provisions || null,
    contingencies: data.contingencies || null,
    internal_notes: data.internal_notes || null,
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    // Update existing draft
    const { data: updated, error } = await supabase
      .from('construction_contracts')
      .update(record)
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return updated;
  } else {
    // Insert new draft
    const { data: inserted, error } = await supabase
      .from('construction_contracts')
      .insert(record)
      .select()
      .single();
    if (error) throw error;
    return inserted;
  }
};

/**
 * Get an existing draft contract for a house.
 */
export const getDraftContract = async (houseId) => {
  if (isDemoMode()) {
    return null; // No draft in demo mode by default
  }

  const { data, error } = await supabase
    .from('construction_contracts')
    .select('*')
    .eq('house_id', houseId)
    .eq('status', 'draft')
    .maybeSingle();

  if (error) throw error;
  return data;
};

/**
 * Generate a contract — creates or updates the construction_contracts record
 * with status 'generated', snapshots budget + selections + lot report,
 * sets generated_at and generated_by.
 */
export const generateContract = async (houseId, contractData) => {
  if (isDemoMode()) {
    const budgetTotal = MOCK_BUDGET_ITEMS.reduce((sum, i) => sum + i.amount, 0);
    const totalPrice = MOCK_PLAN.base_price + MOCK_UPGRADE_PACKAGE.total_price + (MOCK_HOUSE.lot_premium || 0);
    return {
      id: 'contract-gen-' + houseId,
      contract_number: 'CC-2026-0001',
      house_id: houseId,
      status: 'generated',
      base_price: MOCK_PLAN.base_price,
      upgrade_total: MOCK_UPGRADE_PACKAGE.total_price,
      lot_premium: MOCK_HOUSE.lot_premium,
      total_contract_price: totalPrice,
      draw_schedule: contractData.draw_schedule || calculateDrawSchedule(totalPrice),
      budget_snapshot: MOCK_BUDGET_ITEMS,
      selections_snapshot: {
        upgrades: MOCK_UPGRADE_PACKAGE.items,
        package_name: MOCK_UPGRADE_PACKAGE.name,
        package_total: MOCK_UPGRADE_PACKAGE.total_price,
      },
      lot_condition_report: MOCK_LOT_CONDITION,
      terms_and_conditions: contractData.terms_and_conditions || DEFAULT_TERMS,
      generated_at: new Date().toISOString(),
      generated_by: 'demo-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // Assemble current data for snapshots
  const assembled = await assembleContractData(houseId);

  const record = {
    house_id: houseId,
    status: 'generated',
    buyer_contact_id: assembled.buyer?.id || contractData.buyer_contact_id || null,
    plan_id: assembled.plan?.id || contractData.plan_id || null,
    upgrade_package_id: assembled.upgradePackage?.id || contractData.upgrade_package_id || null,
    project_id: assembled.house?.project_id || contractData.project_id || null,
    base_price: assembled.basePrice,
    upgrade_total: assembled.upgradeTotal,
    lot_premium: assembled.lotPremium,
    total_contract_price: assembled.totalContractPrice,
    draw_schedule: contractData.draw_schedule || assembled.drawSchedule,
    budget_snapshot: assembled.budgetItems,
    selections_snapshot: assembled.upgradePackage
      ? {
          upgrades: assembled.upgradePackage.items || [],
          package_name: assembled.upgradePackage.name,
          package_total: assembled.upgradePackage.total_price,
        }
      : {},
    lot_condition_report: contractData.lot_condition_report || assembled.lotCondition,
    terms_and_conditions: contractData.terms_and_conditions || null,
    warranty_terms: contractData.warranty_terms || null,
    special_provisions: contractData.special_provisions || null,
    contingencies: contractData.contingencies || null,
    internal_notes: contractData.internal_notes || null,
    generated_at: new Date().toISOString(),
    generated_by: contractData.generated_by || null,
    updated_at: new Date().toISOString(),
  };

  // Check for existing draft to upgrade
  const { data: existing } = await supabase
    .from('construction_contracts')
    .select('id')
    .eq('house_id', houseId)
    .in('status', ['draft', 'generated'])
    .maybeSingle();

  if (existing?.id) {
    const { data: updated, error } = await supabase
      .from('construction_contracts')
      .update(record)
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return updated;
  } else {
    const { data: inserted, error } = await supabase
      .from('construction_contracts')
      .insert(record)
      .select()
      .single();
    if (error) throw error;
    return inserted;
  }
};

/**
 * Calculate a 5-draw schedule from total price and percentages.
 * @param {number} totalPrice — total contract price
 * @param {number[]} percentages — defaults to [10, 20, 25, 25, 20]
 * @returns {Array<{draw: number, milestone: string, pct: number, amount: number}>}
 */
export const calculateDrawSchedule = (totalPrice, percentages = [10, 20, 25, 25, 20]) => {
  return percentages.map((pct, idx) => ({
    draw: idx + 1,
    milestone: DEFAULT_DRAW_MILESTONES[idx] || `Draw ${idx + 1}`,
    pct,
    amount: Math.round((totalPrice * pct) / 100 * 100) / 100,
  }));
};

/**
 * Get default terms from the most recently generated contract.
 * Falls back to built-in defaults if no previous contracts exist.
 */
export const getDefaultTerms = async () => {
  if (isDemoMode()) {
    return {
      terms_and_conditions: DEFAULT_TERMS,
      warranty_terms: 'Standard 1-year workmanship warranty. 10-year structural warranty. All manufacturer warranties passed through.',
      special_provisions: '',
      contingencies: '',
    };
  }

  const { data, error } = await supabase
    .from('construction_contracts')
    .select('terms_and_conditions, warranty_terms, special_provisions, contingencies')
    .eq('status', 'generated')
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return {
      terms_and_conditions: DEFAULT_TERMS,
      warranty_terms: 'Standard 1-year workmanship warranty. 10-year structural warranty. All manufacturer warranties passed through.',
      special_provisions: '',
      contingencies: '',
    };
  }

  return {
    terms_and_conditions: data.terms_and_conditions || DEFAULT_TERMS,
    warranty_terms: data.warranty_terms || '',
    special_provisions: data.special_provisions || '',
    contingencies: data.contingencies || '',
  };
};

/**
 * Update a contract's status.
 */
export const updateContractStatus = async (contractId, status) => {
  if (isDemoMode()) {
    return { id: contractId, status, updated_at: new Date().toISOString() };
  }

  const updates = { status, updated_at: new Date().toISOString() };

  // Set timestamp fields based on status transitions
  if (status === 'sent') {
    updates.sent_at = new Date().toISOString();
  } else if (status === 'executed') {
    updates.executed_at = new Date().toISOString();
  } else if (status === 'cancelled') {
    updates.cancelled_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('construction_contracts')
    .update(updates)
    .eq('id', contractId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
