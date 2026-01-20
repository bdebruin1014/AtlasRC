import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';

// =====================================================
// STICKS & BRICKS LINE ITEMS
// =====================================================

export const getSticksBricksLineItems = async () => {
  if (isDemoMode()) {
    return MOCK_LINE_ITEMS;
  }

  const { data, error } = await supabase
    .from('sticks_bricks_line_items')
    .select('*')
    .eq('is_active', true)
    .order('display_order');
  
  if (error) throw error;
  return data;
};

// =====================================================
// PLAN BASE PRICING
// =====================================================

export const getPlanBasePricing = async (floorPlanId) => {
  if (isDemoMode()) {
    return MOCK_PLAN_PRICING.filter(p => p.floor_plan_id === floorPlanId);
  }

  const { data, error } = await supabase
    .from('plan_base_pricing')
    .select(`
      *,
      line_item:sticks_bricks_line_items(*)
    `)
    .eq('floor_plan_id', floorPlanId)
    .order('effective_date', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const updatePlanPricing = async (floorPlanId, lineItemId, newCost, userId) => {
  if (isDemoMode()) {
    const pricing = MOCK_PLAN_PRICING.find(p => 
      p.floor_plan_id === floorPlanId && p.line_item_id === lineItemId
    );
    if (pricing) {
      pricing.base_cost = newCost;
      pricing.updated_at = new Date().toISOString();
    }
    return pricing;
  }

  // Insert new pricing record with current date
  const { data, error } = await supabase
    .from('plan_base_pricing')
    .upsert({
      floor_plan_id: floorPlanId,
      line_item_id: lineItemId,
      base_cost: newCost,
      effective_date: new Date().toISOString().split('T')[0],
      updated_by: userId
    }, {
      onConflict: 'floor_plan_id,line_item_id,effective_date'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const calculatePlanTotal = async (floorPlanId) => {
  if (isDemoMode()) {
    const pricing = MOCK_PLAN_PRICING.filter(p => p.floor_plan_id === floorPlanId);
    return pricing.reduce((sum, item) => sum + parseFloat(item.base_cost || 0), 0);
  }

  const pricing = await getPlanBasePricing(floorPlanId);
  return pricing.reduce((sum, item) => sum + parseFloat(item.base_cost || 0), 0);
};

// =====================================================
// UPGRADE PACKAGES
// =====================================================

export const getUpgradePackages = async () => {
  if (isDemoMode()) {
    return MOCK_UPGRADE_PACKAGES;
  }

  const { data, error } = await supabase
    .from('upgrade_packages')
    .select('*')
    .eq('is_active', true)
    .order('package_name');
  
  if (error) throw error;
  return data;
};

export const getPlanUpgradePricing = async (floorPlanId) => {
  if (isDemoMode()) {
    return MOCK_UPGRADE_PRICING.filter(p => p.floor_plan_id === floorPlanId);
  }

  const { data, error } = await supabase
    .from('plan_upgrade_pricing')
    .select(`
      *,
      upgrade:upgrade_packages(*)
    `)
    .eq('floor_plan_id', floorPlanId)
    .order('effective_date', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const updateUpgradePricing = async (floorPlanId, upgradePackageId, price) => {
  if (isDemoMode()) {
    const pricing = MOCK_UPGRADE_PRICING.find(p =>
      p.floor_plan_id === floorPlanId && p.upgrade_package_id === upgradePackageId
    );
    if (pricing) {
      pricing.price = price;
      pricing.updated_at = new Date().toISOString();
    }
    return pricing;
  }

  const { data, error } = await supabase
    .from('plan_upgrade_pricing')
    .upsert({
      floor_plan_id: floorPlanId,
      upgrade_package_id: upgradePackageId,
      price,
      effective_date: new Date().toISOString().split('T')[0]
    }, {
      onConflict: 'floor_plan_id,upgrade_package_id,effective_date'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// =====================================================
// MUNICIPALITIES & FEES
// =====================================================

export const getMunicipalities = async () => {
  if (isDemoMode()) {
    return MOCK_MUNICIPALITIES;
  }

  const { data, error } = await supabase
    .from('municipalities')
    .select('*')
    .eq('is_active', true)
    .order('municipality_name');
  
  if (error) throw error;
  return data;
};

export const getMunicipalityFees = async (municipalityId) => {
  if (isDemoMode()) {
    return MOCK_MUNICIPALITY_FEES.filter(f => f.municipality_id === municipalityId);
  }

  const { data, error } = await supabase
    .from('municipality_fees')
    .select('*')
    .eq('municipality_id', municipalityId)
    .order('effective_date', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const createMunicipality = async (municipalityData) => {
  if (isDemoMode()) {
    const newMuni = {
      id: `muni-${Date.now()}`,
      ...municipalityData,
      created_at: new Date().toISOString()
    };
    MOCK_MUNICIPALITIES.push(newMuni);
    return newMuni;
  }

  const { data, error } = await supabase
    .from('municipalities')
    .insert([municipalityData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateMunicipalityFee = async (municipalityId, feeType, feeData) => {
  if (isDemoMode()) {
    const fee = MOCK_MUNICIPALITY_FEES.find(f =>
      f.municipality_id === municipalityId && f.fee_type === feeType
    );
    if (fee) {
      Object.assign(fee, feeData);
    }
    return fee;
  }

  const { data, error } = await supabase
    .from('municipality_fees')
    .upsert({
      municipality_id: municipalityId,
      fee_type: feeType,
      ...feeData,
      effective_date: new Date().toISOString().split('T')[0]
    }, {
      onConflict: 'municipality_id,fee_type,effective_date'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// =====================================================
// COST ESTIMATE CALCULATION
// =====================================================

export const calculateCostEstimate = async (params) => {
  const {
    floorPlanId,
    elevationId,
    municipalityId,
    selectedUpgrades = [],
    lotPrepAmount = 15000,
    siteAdjustments = 0,
    squareFootage
  } = params;

  // Category 1: Sticks & Bricks
  const sticksBricks = await calculatePlanTotal(floorPlanId);
  
  // Add elevation adder
  let elevationAdder = 0;
  if (elevationId && isDemoMode()) {
    const { MOCK_ELEVATIONS } = await import('./floorPlanService');
    const elevation = MOCK_ELEVATIONS.find(e => e.id === elevationId);
    if (elevation) elevationAdder = elevation.elevation_adder;
  }
  
  const sticksBricksTotal = sticksBricks + elevationAdder;

  // Category 2: Upgrades
  let upgradesTotal = 0;
  for (const upgradeId of selectedUpgrades) {
    if (isDemoMode()) {
      const pricing = MOCK_UPGRADE_PRICING.find(p =>
        p.floor_plan_id === floorPlanId && p.upgrade_package_id === upgradeId
      );
      if (pricing) upgradesTotal += parseFloat(pricing.price);
    }
  }

  // Category 3: Lot Prep (minimum $15,000)
  const lotPrepTotal = Math.max(15000, lotPrepAmount);

  // Category 4: Site Adjustments
  const siteAdjustmentsTotal = siteAdjustments;

  // Category 5: Soft Costs (minimum $15,000)
  let softCostsTotal = 15000;
  if (municipalityId && isDemoMode()) {
    const fees = MOCK_MUNICIPALITY_FEES.filter(f => f.municipality_id === municipalityId);
    const municipalityFeesTotal = fees.reduce((sum, fee) => {
      if (fee.calculation_method === 'fixed') {
        return sum + parseFloat(fee.base_amount || 0);
      } else if (fee.calculation_method === 'per_sqft' && squareFootage) {
        return sum + (parseFloat(fee.calculation_rate || 0) * squareFootage);
      }
      return sum;
    }, 0);
    softCostsTotal = Math.max(15000, 7000 + municipalityFeesTotal); // Base soft costs + fees
  }

  // Category 6: Contingency (lower of $10,000 or 5% of categories 1-5)
  const subtotal = sticksBricksTotal + upgradesTotal + lotPrepTotal + siteAdjustmentsTotal + softCostsTotal;
  const contingency = Math.min(10000, subtotal * 0.05);

  // Category 7: Builder Fee (fixed)
  const builderFee = 25000;

  // Total
  const totalCost = sticksBricksTotal + upgradesTotal + lotPrepTotal + siteAdjustmentsTotal + 
                    softCostsTotal + contingency + builderFee;

  return {
    sticks_bricks_total: sticksBricksTotal,
    upgrades_total: upgradesTotal,
    lot_prep_total: lotPrepTotal,
    site_adjustments_total: siteAdjustmentsTotal,
    soft_costs_total: softCostsTotal,
    contingency,
    builder_fee: builderFee,
    total_cost: totalCost,
    breakdown: {
      category1: { name: 'Sticks & Bricks (Guaranteed)', amount: sticksBricksTotal },
      category2: { name: 'Upgrades to Base Construction (Guaranteed)', amount: upgradesTotal },
      category3: { name: 'Lot Preparation (Estimate)', amount: lotPrepTotal },
      category4: { name: 'Site-Specific Construction Adjustments (Estimate)', amount: siteAdjustmentsTotal },
      category5: { name: 'Soft Costs (Estimate)', amount: softCostsTotal },
      category6: { name: 'Contingency (Calculated)', amount: contingency },
      category7: { name: 'Builder Fee (Fixed)', amount: builderFee }
    }
  };
};

// =====================================================
// MOCK DATA
// =====================================================

const MOCK_LINE_ITEMS = [
  { id: 'item-1', item_code: 'DUMP', item_name: 'Dumpster', category: 'general', scaling_type: 'fixed', display_order: 1, is_active: true },
  { id: 'item-2', item_code: 'UTIL', item_name: 'Utilities', category: 'general', scaling_type: 'fixed', display_order: 2, is_active: true },
  { id: 'item-3', item_code: 'LUMB', item_name: 'Lumber All Floors', category: 'lumber', scaling_type: 'per_sqft', display_order: 6, is_active: true },
  { id: 'item-4', item_code: 'FRAM', item_name: 'Framing Labor', category: 'labor', scaling_type: 'per_sqft', display_order: 7, is_active: true },
  { id: 'item-5', item_code: 'ROOF', item_name: 'Roofing Shingle', category: 'exterior', scaling_type: 'per_sqft', display_order: 11, is_active: true },
  { id: 'item-6', item_code: 'HVAC', item_name: 'HVAC', category: 'mechanical', scaling_type: 'per_sqft', display_order: 21, is_active: true },
  { id: 'item-7', item_code: 'ELEC', item_name: 'Electrical Rough & Trim', category: 'mechanical', scaling_type: 'per_sqft', display_order: 22, is_active: true },
  { id: 'item-8', item_code: 'PLMB', item_name: 'Plumbing Turnkey', category: 'mechanical', scaling_type: 'per_bathroom', display_order: 20, is_active: true },
  { id: 'item-9', item_code: 'CABM', item_name: 'Cabinet Labor & Material', category: 'finishes', scaling_type: 'per_sqft', display_order: 36, is_active: true },
  { id: 'item-10', item_code: 'FNDN', item_name: 'Foundation', category: 'foundation', scaling_type: 'per_sqft', display_order: 46, is_active: true }
];

const MOCK_PLAN_PRICING = [
  { id: 'price-1', floor_plan_id: 'plan-1', line_item_id: 'item-1', base_cost: 800, effective_date: '2025-01-01' },
  { id: 'price-2', floor_plan_id: 'plan-1', line_item_id: 'item-2', base_cost: 1200, effective_date: '2025-01-01' },
  { id: 'price-3', floor_plan_id: 'plan-1', line_item_id: 'item-3', base_cost: 18500, effective_date: '2025-01-01' },
  { id: 'price-4', floor_plan_id: 'plan-1', line_item_id: 'item-4', base_cost: 27750, effective_date: '2025-01-01' },
  { id: 'price-5', floor_plan_id: 'plan-1', line_item_id: 'item-5', base_cost: 9250, effective_date: '2025-01-01' },
  { id: 'price-6', floor_plan_id: 'plan-1', line_item_id: 'item-6', base_cost: 9250, effective_date: '2025-01-01' },
  { id: 'price-7', floor_plan_id: 'plan-1', line_item_id: 'item-7', base_cost: 11100, effective_date: '2025-01-01' },
  { id: 'price-8', floor_plan_id: 'plan-1', line_item_id: 'item-8', base_cost: 12500, effective_date: '2025-01-01' },
  { id: 'price-9', floor_plan_id: 'plan-1', line_item_id: 'item-9', base_cost: 16650, effective_date: '2025-01-01' },
  { id: 'price-10', floor_plan_id: 'plan-1', line_item_id: 'item-10', base_cost: 22200, effective_date: '2025-01-01' }
];

const MOCK_UPGRADE_PACKAGES = [
  { id: 'upg-1', package_code: 'HARDIE', package_name: 'Hardie Color-Plus Siding', category: 'exterior', is_active: true },
  { id: 'upg-2', package_code: 'FOX_CLS', package_name: 'Foxcroft Classic', category: 'interior_classic', is_active: true },
  { id: 'upg-3', package_code: 'MID_CLS', package_name: 'Midwood Classic', category: 'interior_classic', is_active: true },
  { id: 'upg-4', package_code: 'FOX_ELG', package_name: 'Foxcroft Elegance', category: 'interior_elegance', is_active: true }
];

const MOCK_UPGRADE_PRICING = [
  { id: 'upgprice-1', floor_plan_id: 'plan-1', upgrade_package_id: 'upg-1', price: 8500, effective_date: '2025-01-01' },
  { id: 'upgprice-2', floor_plan_id: 'plan-1', upgrade_package_id: 'upg-2', price: 12000, effective_date: '2025-01-01' },
  { id: 'upgprice-3', floor_plan_id: 'plan-1', upgrade_package_id: 'upg-3', price: 15000, effective_date: '2025-01-01' },
  { id: 'upgprice-4', floor_plan_id: 'plan-1', upgrade_package_id: 'upg-4', price: 22000, effective_date: '2025-01-01' }
];

const MOCK_MUNICIPALITIES = [
  { id: 'muni-1', municipality_code: 'CLT', municipality_name: 'City of Charlotte', county: 'Mecklenburg', state: 'NC', is_active: true },
  { id: 'muni-2', municipality_code: 'CONC', municipality_name: 'City of Concord', county: 'Cabarrus', state: 'NC', is_active: true },
  { id: 'muni-3', municipality_code: 'GVLCTY', municipality_name: 'City of Greenville', county: 'Greenville', state: 'SC', is_active: true }
];

const MOCK_MUNICIPALITY_FEES = [
  { id: 'fee-1', municipality_id: 'muni-1', fee_type: 'water_tap', fee_name: 'Water Tap Fee', base_amount: 2500, calculation_method: 'fixed', effective_date: '2025-01-01' },
  { id: 'fee-2', municipality_id: 'muni-1', fee_type: 'sewer_tap', fee_name: 'Sewer Tap Fee', base_amount: 3000, calculation_method: 'fixed', effective_date: '2025-01-01' },
  { id: 'fee-3', municipality_id: 'muni-1', fee_type: 'building_permit', fee_name: 'Building Permit', base_amount: 0, calculation_method: 'per_sqft', calculation_rate: 0.75, effective_date: '2025-01-01' }
];

export { MOCK_LINE_ITEMS, MOCK_PLAN_PRICING, MOCK_UPGRADE_PACKAGES, MOCK_UPGRADE_PRICING, MOCK_MUNICIPALITIES, MOCK_MUNICIPALITY_FEES };
