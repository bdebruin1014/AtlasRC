import { supabase } from '@/lib/supabase';

// =====================================================
// STICKS & BRICKS LINE ITEMS
// =====================================================

export const getSticksBricksLineItems = async () => {
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
  const pricing = await getPlanBasePricing(floorPlanId);
  return pricing.reduce((sum, item) => sum + parseFloat(item.base_cost || 0), 0);
};

// =====================================================
// UPGRADE PACKAGES
// =====================================================

export const getUpgradePackages = async () => {
  const { data, error } = await supabase
    .from('upgrade_packages')
    .select('*')
    .eq('is_active', true)
    .order('package_name');

  if (error) throw error;
  return data;
};

export const getPlanUpgradePricing = async (floorPlanId) => {
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
  const { data, error } = await supabase
    .from('municipalities')
    .select('*')
    .eq('is_active', true)
    .order('municipality_name');

  if (error) throw error;
  return data;
};

export const getMunicipalityFees = async (municipalityId) => {
  const { data, error } = await supabase
    .from('municipality_fees')
    .select('*')
    .eq('municipality_id', municipalityId)
    .order('effective_date', { ascending: false });

  if (error) throw error;
  return data;
};

export const createMunicipality = async (municipalityData) => {
  const { data, error } = await supabase
    .from('municipalities')
    .insert([municipalityData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateMunicipalityFee = async (municipalityId, feeType, feeData) => {
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
  if (elevationId) {
    const { data: elevation, error } = await supabase
      .from('plan_elevations')
      .select('elevation_adder')
      .eq('id', elevationId)
      .single();
    if (!error && elevation) elevationAdder = elevation.elevation_adder;
  }

  const sticksBricksTotal = sticksBricks + elevationAdder;

  // Category 2: Upgrades
  let upgradesTotal = 0;
  for (const upgradeId of selectedUpgrades) {
    const { data: pricing, error } = await supabase
      .from('plan_upgrade_pricing')
      .select('price')
      .eq('floor_plan_id', floorPlanId)
      .eq('upgrade_package_id', upgradeId)
      .order('effective_date', { ascending: false })
      .limit(1)
      .single();
    if (!error && pricing) upgradesTotal += parseFloat(pricing.price);
  }

  // Category 3: Lot Prep (minimum $15,000)
  const lotPrepTotal = Math.max(15000, lotPrepAmount);

  // Category 4: Site Adjustments
  const siteAdjustmentsTotal = siteAdjustments;

  // Category 5: Soft Costs (minimum $15,000)
  let softCostsTotal = 15000;
  if (municipalityId) {
    const { data: fees, error } = await supabase
      .from('municipality_fees')
      .select('*')
      .eq('municipality_id', municipalityId);
    if (!error && fees) {
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
