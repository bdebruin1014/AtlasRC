// src/services/contractAssemblerService.js
// Service layer for the Contract Assembler wizard — builds Red Cedar Homes construction contracts

import { supabase, isDemoMode } from '@/lib/supabase';

// ─── Default Draw Schedule ───────────────────────────────────────────────────

const DEFAULT_DRAW_PERCENTAGES = [
  { draw: 1, milestone: 'Pre-Construction / Deposit', pct: 10 },
  { draw: 2, milestone: 'Foundation Complete', pct: 20 },
  { draw: 3, milestone: 'Framing / Dried In', pct: 25 },
  { draw: 4, milestone: 'Drywall / Interior Trim', pct: 25 },
  { draw: 5, milestone: 'Final / Certificate of Occupancy', pct: 20 },
];

const DEFAULT_TERMS = {
  build_duration_days: 180,
  warranty_period_months: 12,
  structural_warranty_years: 0,
  change_order_policy: 'Written approval required before work begins',
  dispute_resolution: 'Mediation then Litigation',
  jurisdiction: 'Greenville County, South Carolina',
  builders_risk: 'Included by Builder',
  permit_responsibility: 'Builder obtains all permits',
  allowances: { lighting: 0, appliance: 0, landscaping: 0, flooring: 0 },
};

// ─── Demo Data ───────────────────────────────────────────────────────────────

const DEMO_BUDGET_ITEMS = [
  { category: 'General Conditions', item: 'Dumpster', amount: 800 },
  { category: 'General Conditions', item: 'Temporary Utilities', amount: 1200 },
  { category: 'General Conditions', item: 'Portable Toilet', amount: 600 },
  { category: 'General Conditions', item: 'Permits & Fees', amount: 4500 },
  { category: 'Site Work', item: 'Clearing & Grubbing', amount: 3500 },
  { category: 'Site Work', item: 'Grading & Fill', amount: 4200 },
  { category: 'Site Work', item: 'Erosion Control', amount: 1800 },
  { category: 'Site Work', item: 'Driveway — Gravel (temp)', amount: 1500 },
  { category: 'Site Work', item: 'Sewer / Septic', amount: 6500 },
  { category: 'Site Work', item: 'Water Tap & Line', amount: 4800 },
  { category: 'Foundation', item: 'Foundation (crawl space)', amount: 18500 },
  { category: 'Foundation', item: 'Waterproofing', amount: 2100 },
  { category: 'Foundation', item: 'Termite Pre-treat', amount: 800 },
  { category: 'Framing', item: 'Lumber — All Floors', amount: 24000 },
  { category: 'Framing', item: 'Framing Labor', amount: 18000 },
  { category: 'Framing', item: 'Trusses', amount: 8500 },
  { category: 'Framing', item: 'Windows', amount: 6200 },
  { category: 'Framing', item: 'Exterior Doors', amount: 3200 },
  { category: 'Exterior', item: 'Siding (Hardie)', amount: 12000 },
  { category: 'Exterior', item: 'Roofing', amount: 9500 },
  { category: 'Exterior', item: 'Gutters', amount: 2200 },
  { category: 'Exterior', item: 'Brick / Stone Accent', amount: 4500 },
  { category: 'Rough-Ins', item: 'Plumbing Rough', amount: 8500 },
  { category: 'Rough-Ins', item: 'Electrical Rough', amount: 7200 },
  { category: 'Rough-Ins', item: 'HVAC', amount: 11000 },
  { category: 'Rough-Ins', item: 'Insulation', amount: 4800 },
  { category: 'Interior', item: 'Drywall (hang + finish)', amount: 12500 },
  { category: 'Interior', item: 'Interior Trim & Doors', amount: 8000 },
  { category: 'Interior', item: 'Cabinets', amount: 9500 },
  { category: 'Interior', item: 'Countertops', amount: 5500 },
  { category: 'Interior', item: 'Tile / Backsplash', amount: 4200 },
  { category: 'Interior', item: 'Paint (interior)', amount: 5800 },
  { category: 'Flooring', item: 'LVP — Main Living', amount: 6500 },
  { category: 'Flooring', item: 'Carpet — Bedrooms', amount: 3200 },
  { category: 'Flooring', item: 'Tile — Wet Areas', amount: 2800 },
  { category: 'Fixtures', item: 'Plumbing Fixtures', amount: 4200 },
  { category: 'Fixtures', item: 'Lighting Fixtures', amount: 3500 },
  { category: 'Fixtures', item: 'Hardware (knobs, pulls)', amount: 1200 },
  { category: 'Fixtures', item: 'Mirrors', amount: 800 },
  { category: 'Appliances', item: 'Appliance Package', amount: 4500 },
  { category: 'Final', item: 'Driveway — Concrete', amount: 5500 },
  { category: 'Final', item: 'Landscaping', amount: 6000 },
  { category: 'Final', item: 'Final Clean', amount: 1500 },
  { category: 'Final', item: 'Surveys & Inspections', amount: 2800 },
  { category: 'Soft Costs', item: 'Architecture / Plans', amount: 3500 },
  { category: 'Soft Costs', item: 'Engineering', amount: 2500 },
  { category: 'Soft Costs', item: "Builder's Risk Insurance", amount: 2800 },
  { category: 'Soft Costs', item: 'Loan Interest (est.)', amount: 8500 },
  { category: 'Soft Costs', item: 'Real Estate Commission', amount: 12000 },
  { category: 'Soft Costs', item: 'Closing Costs', amount: 4500 },
];

const DEMO_SELECTIONS = {
  exterior: {
    siding: 'Hardie Plank — Evening Blue',
    trim: 'Hardie Trim — Arctic White',
    shutters: 'Louvered — Black',
    front_door: 'Therma-Tru Fiberglass — Flagstone',
    stone_accent: 'Cultured Stone — Southern Ledge',
    roof_shingles: 'GAF Timberline — Charcoal',
  },
  interior: {
    wall_color: 'SW 7015 Repose Gray',
    trim_color: 'SW 7006 Extra White',
    cabinets: 'Shaker — Painted White',
    countertops: 'Quartz — Calacatta Gold',
    backsplash: 'Subway Tile — White Matte 3x6',
  },
  flooring: {
    main_living: 'LVP — Antique Hickory',
    bedrooms: 'Carpet — Soft Beige',
    wet_areas: 'Porcelain Tile — Carrara Look',
  },
  fixtures: {
    plumbing: 'Moen Align — Brushed Nickel',
    lighting: 'Progress Lighting — Modern Farmhouse',
    hardware: 'Amerock — Brushed Nickel Bar Pulls',
  },
};

const DEMO_ELIGIBLE_HOUSES = [
  {
    id: 'house-4',
    house_name: 'Lot 4 - Atlas',
    plan_name: 'Atlas',
    plan_sqft: 2800,
    current_milestone: 'pre_contract',
    buyer_name: null,
    project: { name: 'Magnolia Grove' },
  },
  {
    id: 'house-demo-14',
    house_name: 'Lot 14 - Magnolia A',
    plan_name: 'Magnolia',
    plan_sqft: 1800,
    current_milestone: 'pre_contract',
    buyer_name: 'John & Sarah Mitchell',
    project: { name: 'Ambleside Phase 1' },
  },
];

function getDemoContractData(houseId) {
  const isLot14 = houseId === 'house-demo-14';
  return {
    house: {
      id: isLot14 ? 'house-demo-14' : 'house-4',
      house_name: isLot14 ? 'Lot 14 - Magnolia A' : 'Lot 4 - Atlas',
      house_number: isLot14 ? '14' : '4',
      address: isLot14 ? '214 Ambleside Dr' : '104 Magnolia Way',
      city: 'Greenville',
      state: 'SC',
      zip_code: '29607',
      county: 'Greenville',
      subdivision: isLot14 ? 'Ambleside' : 'Magnolia Grove',
      lot_size_acres: 0.28,
      lot_premium: isLot14 ? 3000 : 10000,
      lot_cost: isLot14 ? 55000 : 65000,
      plan_name: isLot14 ? 'Magnolia' : 'Atlas',
      plan_id: isLot14 ? 'plan-magnolia' : 'plan-atlas',
      elevation: isLot14 ? 'A' : 'B',
      upgrade_package: isLot14 ? 'Classic' : null,
      color_selections: isLot14 ? DEMO_SELECTIONS : {},
      base_build_cost: isLot14 ? 198500 : 275000,
      lot_prep_cost: isLot14 ? 22000 : 28000,
      soft_costs: isLot14 ? 33800 : 42000,
      upgrade_cost: isLot14 ? 12000 : 0,
      total_budget: isLot14 ? 269300 : 345000,
      municipality: 'City of Greenville',
      permit_number: null,
      buyer_name: isLot14 ? 'John & Sarah Mitchell' : null,
      buyer_contact_id: isLot14 ? 'contact-mitchell' : null,
      current_milestone: 'pre_contract',
      status: 'active',
    },
    buyer: isLot14 ? {
      id: 'contact-mitchell',
      full_name: 'John & Sarah Mitchell',
      email: 'mitchells@email.com',
      phone: '(864) 555-0142',
      address: '45 Oak Street, Greenville, SC 29601',
    } : null,
    plan: {
      id: isLot14 ? 'plan-magnolia' : 'plan-atlas',
      plan_code: isLot14 ? 'MAG-1800' : 'ATL-2800',
      plan_name: isLot14 ? 'Magnolia' : 'Atlas',
      square_footage: isLot14 ? 1800 : 2800,
      bedrooms: isLot14 ? 3 : 4,
      bathrooms: isLot14 ? 2.5 : 3.0,
      garage_type: '2-Car Attached',
      stories: isLot14 ? 1 : 2,
      standard_build_days: isLot14 ? 150 : 180,
    },
    budgetItems: DEMO_BUDGET_ITEMS,
    selections: isLot14 ? DEMO_SELECTIONS : {},
  };
}

// ─── Service Functions ───────────────────────────────────────────────────────

export const contractAssemblerService = {
  /**
   * Get houses eligible for contract generation (pre_contract milestone, no active contract)
   */
  async getEligibleHouses() {
    if (isDemoMode) {
      return DEMO_ELIGIBLE_HOUSES;
    }

    // Get houses at pre_contract that don't have a non-cancelled contract
    const { data: houses, error } = await supabase
      .from('construction_houses')
      .select('id, house_name, house_number, plan_name, plan_sqft, current_milestone, buyer_name, project:projects(name)')
      .eq('current_milestone', 'pre_contract')
      .eq('status', 'active')
      .order('house_name');

    if (error) throw error;

    // Filter out houses that already have an active contract
    const { data: contracts } = await supabase
      .from('construction_contracts')
      .select('house_id')
      .not('status', 'eq', 'cancelled');

    const contractedHouseIds = new Set((contracts || []).map(c => c.house_id));
    return (houses || []).filter(h => !contractedHouseIds.has(h.id));
  },

  /**
   * Aggregate all data needed for a contract from house, buyer, plan, budget
   */
  async assembleContractData(houseId) {
    if (isDemoMode) {
      return getDemoContractData(houseId);
    }

    // Fetch house with project relation
    const { data: house, error: houseErr } = await supabase
      .from('construction_houses')
      .select('*, project:projects(name)')
      .eq('id', houseId)
      .single();

    if (houseErr) throw houseErr;

    // Fetch buyer contact if exists
    let buyer = null;
    if (house.buyer_contact_id) {
      const { data } = await supabase
        .from('contacts')
        .select('id, full_name, first_name, last_name, email, phone, address')
        .eq('id', house.buyer_contact_id)
        .single();
      buyer = data;
      if (buyer && !buyer.full_name) {
        buyer.full_name = [buyer.first_name, buyer.last_name].filter(Boolean).join(' ');
      }
    }

    // Fetch floor plan if exists
    let plan = null;
    if (house.plan_id) {
      const { data } = await supabase
        .from('floor_plans')
        .select('*')
        .eq('id', house.plan_id)
        .single();
      plan = data;
    }

    // Fetch budget items
    const { data: budgetItems } = await supabase
      .from('construction_budget_items')
      .select('*')
      .eq('house_id', houseId)
      .order('category')
      .order('display_order');

    // Fetch selections from house record
    const selections = house.color_selections || {};

    return {
      house,
      buyer,
      plan,
      budgetItems: budgetItems || [],
      selections,
    };
  },

  /**
   * Get existing draft contract for a house
   */
  async getDraftContract(houseId) {
    if (isDemoMode) {
      return null; // No drafts in demo
    }

    const { data, error } = await supabase
      .from('construction_contracts')
      .select('*')
      .eq('house_id', houseId)
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data || null;
  },

  /**
   * Get contract by ID
   */
  async getContract(contractId) {
    if (isDemoMode) return null;

    const { data, error } = await supabase
      .from('construction_contracts')
      .select('*, house:construction_houses(house_name, address, buyer_name)')
      .eq('id', contractId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Save or update a contract draft
   */
  async saveContractDraft(houseId, data) {
    if (isDemoMode) {
      return { id: 'draft-demo-001', house_id: houseId, status: 'draft', ...data };
    }

    // Check for existing draft
    const existing = await this.getDraftContract(houseId);

    if (existing) {
      const { data: updated, error } = await supabase
        .from('construction_contracts')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    }

    // Create new draft
    const { data: created, error } = await supabase
      .from('construction_contracts')
      .insert({ house_id: houseId, status: 'draft', ...data })
      .select()
      .single();
    if (error) throw error;
    return created;
  },

  /**
   * Generate contract (freeze snapshots, set status to 'generated')
   */
  async generateContract(houseId, contractData) {
    if (isDemoMode) {
      return {
        id: 'contract-demo-001',
        house_id: houseId,
        contract_number: 'RCH-2026-001',
        status: 'generated',
        generated_at: new Date().toISOString(),
        ...contractData,
      };
    }

    const payload = {
      ...contractData,
      status: 'generated',
      generated_at: new Date().toISOString(),
    };

    // Check for existing draft to update
    const existing = await this.getDraftContract(houseId);

    if (existing) {
      const { data, error } = await supabase
        .from('construction_contracts')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const { data, error } = await supabase
      .from('construction_contracts')
      .insert({ house_id: houseId, ...payload })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Update contract status
   */
  async updateContractStatus(contractId, status) {
    if (isDemoMode) {
      return { id: contractId, status };
    }

    const { data, error } = await supabase
      .from('construction_contracts')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', contractId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Calculate draw schedule amounts from total price and percentages
   */
  calculateDrawSchedule(totalPrice, draws = DEFAULT_DRAW_PERCENTAGES) {
    return draws.map(d => ({
      ...d,
      amount: Math.round((totalPrice * d.pct) / 100 * 100) / 100,
    }));
  },

  /**
   * Get default terms — pulls from most recent contract or returns defaults
   */
  async getDefaultTerms() {
    if (isDemoMode) {
      return { ...DEFAULT_TERMS };
    }

    const { data } = await supabase
      .from('construction_contracts')
      .select('change_order_policy, dispute_resolution, jurisdiction, builders_risk, permit_responsibility, warranty_period_months, structural_warranty_years, allowances, build_duration_days')
      .not('status', 'eq', 'draft')
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();

    if (data) {
      return {
        build_duration_days: data.build_duration_days || DEFAULT_TERMS.build_duration_days,
        warranty_period_months: data.warranty_period_months || DEFAULT_TERMS.warranty_period_months,
        structural_warranty_years: data.structural_warranty_years ?? DEFAULT_TERMS.structural_warranty_years,
        change_order_policy: data.change_order_policy || DEFAULT_TERMS.change_order_policy,
        dispute_resolution: data.dispute_resolution || DEFAULT_TERMS.dispute_resolution,
        jurisdiction: data.jurisdiction || DEFAULT_TERMS.jurisdiction,
        builders_risk: data.builders_risk || DEFAULT_TERMS.builders_risk,
        permit_responsibility: data.permit_responsibility || DEFAULT_TERMS.permit_responsibility,
        allowances: data.allowances || DEFAULT_TERMS.allowances,
      };
    }

    return { ...DEFAULT_TERMS };
  },

  /**
   * Get the default draw percentages
   */
  getDefaultDrawSchedule() {
    return [...DEFAULT_DRAW_PERCENTAGES];
  },
};

export default contractAssemblerService;
