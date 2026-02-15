// src/services/constructionService.js
// Service layer for Construction Management module with demo data

import { supabase } from '@/lib/supabase';

// ─── Constants ────────────────────────────────────────────────────────────────

export const MILESTONES = [
  { key: 'pre_contract', label: 'Pre-Contract', dateField: 'contract_date' },
  { key: 'permitting', label: 'Permitting', dateField: 'permit_submitted_date' },
  { key: 'mobilized', label: 'Mobilized', dateField: 'mobilization_date' },
  { key: 'foundation', label: 'Foundation', dateField: 'foundation_date' },
  { key: 'framing', label: 'Framing', dateField: 'framing_date' },
  { key: 'sheetrock', label: 'Sheetrock', dateField: 'sheetrock_date' },
  { key: 'co', label: 'CO', dateField: 'co_date' },
  { key: 'warranty', label: 'Warranty', dateField: 'warranty_start_date' },
  { key: 'complete', label: 'Complete', dateField: 'completion_date' },
];

export function getMilestoneLabel(key) {
  return MILESTONES.find(m => m.key === key)?.label || key;
}

export function getMilestoneDateField(key) {
  return MILESTONES.find(m => m.key === key)?.dateField || null;
}

export function getMilestoneIndex(key) {
  return MILESTONES.findIndex(m => m.key === key);
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

const DEMO_HOUSES = [
  {
    id: 'house-1',
    house_name: 'Lot 1 - Magnolia',
    house_number: '1',
    address: '101 Magnolia Way',
    city: 'Greenville',
    state: 'SC',
    zip_code: '29601',
    project_id: null,
    plan_id: null,
    entity_id: null,
    current_milestone: 'framing',
    contract_date: '2025-09-15',
    permit_submitted_date: '2025-10-01',
    permit_approved_date: '2025-10-20',
    mobilization_date: '2025-11-01',
    foundation_date: '2025-11-15',
    framing_date: '2025-12-10',
    sheetrock_date: null,
    co_date: null,
    warranty_start_date: null,
    warranty_end_date: null,
    completion_date: null,
    contract_price: 425000,
    estimated_cost: 310000,
    actual_cost: 185000,
    buyer_name: 'John & Sarah Mitchell',
    buyer_contact_id: null,
    status: 'active',
    notes: null,
    plan_name: 'Magnolia',
    plan_sqft: 2400,
    bedrooms: 4,
    bathrooms: 2.5,
    garage_spaces: 2,
    lot_premium: 5000,
    upgrade_total: 12000,
    created_at: '2025-09-01T10:00:00Z',
    updated_at: '2025-12-10T14:00:00Z',
    project: { name: 'Magnolia Grove' },
  },
  {
    id: 'house-2',
    house_name: 'Lot 2 - Dogwood',
    house_number: '2',
    address: '102 Magnolia Way',
    city: 'Greenville',
    state: 'SC',
    zip_code: '29601',
    project_id: null,
    plan_id: null,
    entity_id: null,
    current_milestone: 'foundation',
    contract_date: '2025-10-01',
    permit_submitted_date: '2025-10-15',
    permit_approved_date: '2025-11-05',
    mobilization_date: '2025-11-20',
    foundation_date: '2025-12-05',
    sheetrock_date: null,
    co_date: null,
    warranty_start_date: null,
    warranty_end_date: null,
    completion_date: null,
    contract_price: 375000,
    estimated_cost: 275000,
    actual_cost: 95000,
    buyer_name: 'David Chen',
    buyer_contact_id: null,
    status: 'active',
    notes: null,
    plan_name: 'Dogwood',
    plan_sqft: 1800,
    bedrooms: 3,
    bathrooms: 2.0,
    garage_spaces: 2,
    lot_premium: 0,
    upgrade_total: 8000,
    created_at: '2025-09-15T10:00:00Z',
    updated_at: '2025-12-05T14:00:00Z',
    project: { name: 'Magnolia Grove' },
  },
  {
    id: 'house-3',
    house_name: 'Lot 3 - Palmetto',
    house_number: '3',
    address: '103 Magnolia Way',
    city: 'Greenville',
    state: 'SC',
    zip_code: '29601',
    project_id: null,
    plan_id: null,
    entity_id: null,
    current_milestone: 'permitting',
    contract_date: '2025-11-01',
    permit_submitted_date: '2025-11-15',
    permit_approved_date: null,
    mobilization_date: null,
    foundation_date: null,
    sheetrock_date: null,
    co_date: null,
    warranty_start_date: null,
    warranty_end_date: null,
    completion_date: null,
    contract_price: 395000,
    estimated_cost: 290000,
    actual_cost: 0,
    buyer_name: null,
    buyer_contact_id: null,
    status: 'active',
    notes: 'Waiting on permit approval',
    plan_name: 'Palmetto',
    plan_sqft: 2100,
    bedrooms: 3,
    bathrooms: 2.5,
    garage_spaces: 2,
    lot_premium: 3000,
    upgrade_total: 0,
    created_at: '2025-10-15T10:00:00Z',
    updated_at: '2025-11-15T14:00:00Z',
    project: { name: 'Magnolia Grove' },
  },
  {
    id: 'house-4',
    house_name: 'Lot 4 - Atlas',
    house_number: '4',
    address: '104 Magnolia Way',
    city: 'Greenville',
    state: 'SC',
    zip_code: '29601',
    project_id: null,
    plan_id: null,
    entity_id: null,
    current_milestone: 'pre_contract',
    contract_date: null,
    permit_submitted_date: null,
    permit_approved_date: null,
    mobilization_date: null,
    foundation_date: null,
    sheetrock_date: null,
    co_date: null,
    warranty_start_date: null,
    warranty_end_date: null,
    completion_date: null,
    contract_price: 475000,
    estimated_cost: 350000,
    actual_cost: 0,
    buyer_name: null,
    buyer_contact_id: null,
    status: 'active',
    notes: 'Spec home — no buyer yet',
    plan_name: 'Atlas',
    plan_sqft: 2800,
    bedrooms: 4,
    bathrooms: 3.0,
    garage_spaces: 2,
    lot_premium: 10000,
    upgrade_total: 0,
    created_at: '2025-11-01T10:00:00Z',
    updated_at: '2025-11-01T10:00:00Z',
    project: { name: 'Magnolia Grove' },
  },
  {
    id: 'house-5',
    house_name: 'Lot 5 - Juniper',
    house_number: '5',
    address: '105 Magnolia Way',
    city: 'Greenville',
    state: 'SC',
    zip_code: '29601',
    project_id: null,
    plan_id: null,
    entity_id: null,
    current_milestone: 'sheetrock',
    contract_date: '2025-08-01',
    permit_submitted_date: '2025-08-15',
    permit_approved_date: '2025-09-01',
    mobilization_date: '2025-09-15',
    foundation_date: '2025-10-01',
    framing_date: '2025-10-20',
    sheetrock_date: '2025-11-15',
    co_date: null,
    warranty_start_date: null,
    warranty_end_date: null,
    completion_date: null,
    contract_price: 410000,
    estimated_cost: 300000,
    actual_cost: 230000,
    buyer_name: 'Karen & Tom Williams',
    buyer_contact_id: null,
    status: 'active',
    notes: null,
    plan_name: 'Juniper',
    plan_sqft: 2200,
    bedrooms: 3,
    bathrooms: 2.5,
    garage_spaces: 2,
    lot_premium: 2000,
    upgrade_total: 15000,
    created_at: '2025-07-15T10:00:00Z',
    updated_at: '2025-11-15T14:00:00Z',
    project: { name: 'Magnolia Grove' },
  },
  {
    id: 'house-6',
    house_name: 'Lot 6 - Magnolia',
    house_number: '6',
    address: '106 Magnolia Way',
    city: 'Greenville',
    state: 'SC',
    zip_code: '29601',
    project_id: null,
    plan_id: null,
    entity_id: null,
    current_milestone: 'co',
    contract_date: '2025-06-01',
    permit_submitted_date: '2025-06-15',
    permit_approved_date: '2025-07-01',
    mobilization_date: '2025-07-15',
    foundation_date: '2025-08-01',
    framing_date: '2025-08-20',
    sheetrock_date: '2025-09-15',
    co_date: '2025-11-01',
    warranty_start_date: null,
    warranty_end_date: null,
    completion_date: null,
    contract_price: 430000,
    estimated_cost: 315000,
    actual_cost: 305000,
    buyer_name: 'Michael & Lisa Brown',
    buyer_contact_id: null,
    status: 'active',
    notes: 'CO received, awaiting final punch list',
    plan_name: 'Magnolia',
    plan_sqft: 2400,
    bedrooms: 4,
    bathrooms: 2.5,
    garage_spaces: 2,
    lot_premium: 5000,
    upgrade_total: 18000,
    created_at: '2025-05-15T10:00:00Z',
    updated_at: '2025-11-01T14:00:00Z',
    project: { name: 'Magnolia Grove' },
  },
  {
    id: 'house-7',
    house_name: 'Lot 7 - Dogwood',
    house_number: '7',
    address: '107 Magnolia Way',
    city: 'Greenville',
    state: 'SC',
    zip_code: '29601',
    project_id: null,
    plan_id: null,
    entity_id: null,
    current_milestone: 'warranty',
    contract_date: '2025-04-01',
    permit_submitted_date: '2025-04-15',
    permit_approved_date: '2025-05-01',
    mobilization_date: '2025-05-15',
    foundation_date: '2025-06-01',
    framing_date: '2025-06-20',
    sheetrock_date: '2025-07-15',
    co_date: '2025-09-01',
    warranty_start_date: '2025-09-15',
    warranty_end_date: '2026-09-15',
    completion_date: null,
    contract_price: 380000,
    estimated_cost: 278000,
    actual_cost: 272000,
    buyer_name: 'Robert & Amy Davis',
    buyer_contact_id: null,
    status: 'active',
    notes: 'In warranty period',
    plan_name: 'Dogwood',
    plan_sqft: 1800,
    bedrooms: 3,
    bathrooms: 2.0,
    garage_spaces: 2,
    lot_premium: 0,
    upgrade_total: 6000,
    created_at: '2025-03-15T10:00:00Z',
    updated_at: '2025-09-15T14:00:00Z',
    project: { name: 'Magnolia Grove' },
  },
  {
    id: 'house-8',
    house_name: 'Lot 8 - Palmetto',
    house_number: '8',
    address: '108 Magnolia Way',
    city: 'Greenville',
    state: 'SC',
    zip_code: '29601',
    project_id: null,
    plan_id: null,
    entity_id: null,
    current_milestone: 'complete',
    contract_date: '2025-01-15',
    permit_submitted_date: '2025-02-01',
    permit_approved_date: '2025-02-15',
    mobilization_date: '2025-03-01',
    foundation_date: '2025-03-15',
    framing_date: '2025-04-05',
    sheetrock_date: '2025-05-01',
    co_date: '2025-07-01',
    warranty_start_date: '2025-07-15',
    warranty_end_date: '2026-07-15',
    completion_date: '2025-08-01',
    contract_price: 400000,
    estimated_cost: 292000,
    actual_cost: 288000,
    buyer_name: 'James & Patricia Lee',
    buyer_contact_id: null,
    status: 'complete',
    notes: 'Closed and warranty complete',
    plan_name: 'Palmetto',
    plan_sqft: 2100,
    bedrooms: 3,
    bathrooms: 2.5,
    garage_spaces: 2,
    lot_premium: 3000,
    upgrade_total: 9500,
    created_at: '2025-01-01T10:00:00Z',
    updated_at: '2025-08-01T14:00:00Z',
    project: { name: 'Magnolia Grove' },
  },
];

const DEMO_MILESTONE_LOG = [
  { id: 'ml-1', house_id: 'house-1', milestone: 'permitting', previous_milestone: 'pre_contract', milestone_date: '2025-10-01', created_at: '2025-10-01T10:00:00Z' },
  { id: 'ml-2', house_id: 'house-1', milestone: 'mobilized', previous_milestone: 'permitting', milestone_date: '2025-11-01', created_at: '2025-11-01T10:00:00Z' },
  { id: 'ml-3', house_id: 'house-1', milestone: 'foundation', previous_milestone: 'mobilized', milestone_date: '2025-11-15', created_at: '2025-11-15T10:00:00Z' },
  { id: 'ml-4', house_id: 'house-1', milestone: 'framing', previous_milestone: 'foundation', milestone_date: '2025-12-10', created_at: '2025-12-10T10:00:00Z' },
  { id: 'ml-5', house_id: 'house-5', milestone: 'sheetrock', previous_milestone: 'framing', milestone_date: '2025-11-15', created_at: '2025-11-15T10:00:00Z' },
  { id: 'ml-6', house_id: 'house-6', milestone: 'co', previous_milestone: 'sheetrock', milestone_date: '2025-11-01', created_at: '2025-11-01T10:00:00Z' },
  { id: 'ml-7', house_id: 'house-7', milestone: 'warranty', previous_milestone: 'co', milestone_date: '2025-09-15', created_at: '2025-09-15T10:00:00Z' },
  { id: 'ml-8', house_id: 'house-8', milestone: 'complete', previous_milestone: 'warranty', milestone_date: '2025-08-01', created_at: '2025-08-01T10:00:00Z' },
];

const DEMO_PURCHASE_ORDERS = [
  { id: 'po-1', house_id: 'house-1', po_number: 'PO-001', vendor_name: 'Solid Ground Foundations', description: 'Foundation pour and finish', category: 'Foundation', amount: 42000, status: 'complete', issued_date: '2025-11-01', due_date: '2025-11-15', completed_date: '2025-11-14', notes: null, created_at: '2025-11-01T10:00:00Z' },
  { id: 'po-2', house_id: 'house-1', po_number: 'PO-002', vendor_name: 'Hill Country Framing', description: 'Framing package — lumber and labor', category: 'Framing', amount: 68000, status: 'in_progress', issued_date: '2025-12-01', due_date: '2026-01-15', completed_date: null, notes: 'Trusses delivered 12/8', created_at: '2025-12-01T10:00:00Z' },
  { id: 'po-3', house_id: 'house-1', po_number: 'PO-003', vendor_name: 'Spark Electric', description: 'Rough-in electrical', category: 'Electrical', amount: 18500, status: 'draft', issued_date: null, due_date: null, completed_date: null, notes: null, created_at: '2025-12-10T10:00:00Z' },
  { id: 'po-4', house_id: 'house-5', po_number: 'PO-010', vendor_name: 'Pro Drywall Inc.', description: 'Hang and finish sheetrock', category: 'Sheetrock', amount: 22000, status: 'in_progress', issued_date: '2025-11-10', due_date: '2025-12-01', completed_date: null, notes: null, created_at: '2025-11-10T10:00:00Z' },
  { id: 'po-5', house_id: 'house-2', po_number: 'PO-005', vendor_name: 'Solid Ground Foundations', description: 'Foundation pour', category: 'Foundation', amount: 38000, status: 'accepted', issued_date: '2025-11-25', due_date: '2025-12-15', completed_date: null, notes: null, created_at: '2025-11-25T10:00:00Z' },
];

const DEMO_DAILY_LOGS = [
  { id: 'dl-1', house_id: 'house-1', log_date: '2025-12-10', weather: 'Clear', temperature_high: 58, temperature_low: 35, crew_count: 6, work_performed: 'Completed roof trusses installation. Started sheathing on east wall.', materials_delivered: '40 sheets OSB, 2 bundles roof sheathing', issues: null, safety_incidents: null, photos: [], created_at: '2025-12-10T17:00:00Z' },
  { id: 'dl-2', house_id: 'house-1', log_date: '2025-12-09', weather: 'Partly Cloudy', temperature_high: 62, temperature_low: 38, crew_count: 5, work_performed: 'Continued wall framing. Set trusses on garage.', materials_delivered: null, issues: 'Minor delay waiting on crane for trusses', safety_incidents: null, photos: [], created_at: '2025-12-09T17:00:00Z' },
  { id: 'dl-3', house_id: 'house-1', log_date: '2025-12-08', weather: 'Rain AM / Clear PM', temperature_high: 55, temperature_low: 40, crew_count: 4, work_performed: 'Rain delay until 11am. Completed interior wall layout and framing.', materials_delivered: 'Truss delivery — 14 roof trusses', issues: 'Rain delay — 3 hours lost', safety_incidents: null, photos: [], created_at: '2025-12-08T17:00:00Z' },
  { id: 'dl-4', house_id: 'house-5', log_date: '2025-12-10', weather: 'Clear', temperature_high: 60, temperature_low: 36, crew_count: 3, work_performed: 'Drywall finishing — second coat mud on main level.', materials_delivered: null, issues: null, safety_incidents: null, photos: [], created_at: '2025-12-10T17:00:00Z' },
];

const DEMO_INSPECTIONS = [
  { id: 'insp-1', house_id: 'house-1', inspection_type: 'Foundation', inspector_name: 'County Building Dept', scheduled_date: '2025-11-14', completed_date: '2025-11-14', status: 'passed', result_notes: 'Foundation approved. Rebar and footings per plan.', deficiencies: [], photos: [], created_at: '2025-11-14T10:00:00Z' },
  { id: 'insp-2', house_id: 'house-1', inspection_type: 'Framing', inspector_name: 'County Building Dept', scheduled_date: '2025-12-15', completed_date: null, status: 'scheduled', result_notes: null, deficiencies: [], photos: [], created_at: '2025-12-10T10:00:00Z' },
  { id: 'insp-3', house_id: 'house-5', inspection_type: 'Rough-in Mechanical', inspector_name: 'County Building Dept', scheduled_date: '2025-11-10', completed_date: '2025-11-10', status: 'passed', result_notes: 'HVAC, plumbing, electrical rough-in approved.', deficiencies: [], photos: [], created_at: '2025-11-10T10:00:00Z' },
  { id: 'insp-4', house_id: 'house-6', inspection_type: 'Final', inspector_name: 'County Building Dept', scheduled_date: '2025-10-28', completed_date: '2025-10-28', status: 'passed', result_notes: 'Final inspection passed. CO issued.', deficiencies: [], photos: [], created_at: '2025-10-28T10:00:00Z' },
];

const DEMO_WARRANTY_ITEMS = [
  { id: 'wi-1', house_id: 'house-7', reported_date: '2025-10-15', category: 'Plumbing', description: 'Slow drain in master bathroom sink', priority: 'low', status: 'complete', assigned_vendor_id: null, scheduled_date: '2025-10-20', completed_date: '2025-10-20', resolution_notes: 'Cleared P-trap blockage', photos: [], cost: 0, created_at: '2025-10-15T10:00:00Z' },
  { id: 'wi-2', house_id: 'house-7', reported_date: '2025-11-05', category: 'HVAC', description: 'Upstairs thermostat not responding', priority: 'medium', status: 'scheduled', assigned_vendor_id: null, scheduled_date: '2025-12-12', completed_date: null, resolution_notes: null, photos: [], cost: 0, created_at: '2025-11-05T10:00:00Z' },
  { id: 'wi-3', house_id: 'house-7', reported_date: '2025-12-01', category: 'Structural', description: 'Hairline crack in garage slab — cosmetic', priority: 'low', status: 'reported', assigned_vendor_id: null, scheduled_date: null, completed_date: null, resolution_notes: null, photos: [], cost: 0, created_at: '2025-12-01T10:00:00Z' },
  { id: 'wi-4', house_id: 'house-8', reported_date: '2025-08-20', category: 'Electrical', description: 'GFCI outlet tripping in kitchen', priority: 'high', status: 'complete', assigned_vendor_id: null, scheduled_date: '2025-08-22', completed_date: '2025-08-22', resolution_notes: 'Replaced defective GFCI outlet', photos: [], cost: 45, created_at: '2025-08-20T10:00:00Z' },
];

// ─── Houses CRUD ──────────────────────────────────────────────────────────────

export async function getHouses(filters = {}) {
  try {
    let query = supabase
      .from('construction_houses')
      .select(`
        *,
        project:projects(id, name, project_type)
      `);

    if (filters.project_id) query = query.eq('project_id', filters.project_id);
    if (filters.current_milestone) query = query.eq('current_milestone', filters.current_milestone);
    if (filters.status) query = query.eq('status', filters.status);

    const { data, error } = await query.order('house_number', { ascending: true });
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('getHouses error:', err);
    // Fallback to demo data
    let houses = [...DEMO_HOUSES];
    if (filters.project_id) houses = houses.filter(h => h.project_id === filters.project_id);
    if (filters.current_milestone) houses = houses.filter(h => h.current_milestone === filters.current_milestone);
    if (filters.status) houses = houses.filter(h => h.status === filters.status);
    houses.sort((a, b) => (a.house_number || '').localeCompare(b.house_number || '', undefined, { numeric: true }));
    return { data: houses, error: null };
  }
}

export async function getHouseById(id) {
  try {
    const { data: house, error: houseError } = await supabase
      .from('construction_houses')
      .select(`
        *,
        project:projects(id, name, project_type)
      `)
      .eq('id', id)
      .single();

    if (houseError) throw houseError;

    const { data: milestoneLog } = await supabase
      .from('construction_milestone_log')
      .select('*')
      .eq('house_id', id)
      .order('created_at', { ascending: false });

    return { data: { ...house, milestone_log: milestoneLog || [] }, error: null };
  } catch (err) {
    console.error('getHouseById error:', err);
    // Fallback to demo data
    const house = DEMO_HOUSES.find(h => h.id === id) || null;
    if (!house) return { data: null, error: { message: 'House not found' } };
    const milestoneLog = DEMO_MILESTONE_LOG
      .filter(m => m.house_id === id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { data: { ...house, milestone_log: milestoneLog }, error: null };
  }
}

export async function createHouse(houseData) {
  try {
    const { data, error } = await supabase
      .from('construction_houses')
      .insert([houseData])
      .select(`
        *,
        project:projects(id, name, project_type)
      `)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('createHouse error:', err);
    // Fallback to demo data
    const newHouse = {
      id: `house-${Date.now()}`,
      ...houseData,
      current_milestone: houseData.current_milestone || 'pre_contract',
      status: houseData.status || 'active',
      actual_cost: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      project: { name: 'Demo Project' },
    };
    DEMO_HOUSES.push(newHouse);
    return { data: newHouse, error: null };
  }
}

export async function updateHouse(id, updates) {
  try {
    const { data, error } = await supabase
      .from('construction_houses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        project:projects(id, name, project_type)
      `)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('updateHouse error:', err);
    // Fallback to demo data
    const idx = DEMO_HOUSES.findIndex(h => h.id === id);
    if (idx === -1) return { data: null, error: { message: 'House not found' } };
    DEMO_HOUSES[idx] = { ...DEMO_HOUSES[idx], ...updates, updated_at: new Date().toISOString() };
    return { data: DEMO_HOUSES[idx], error: null };
  }
}

export async function deleteHouse(id) {
  try {
    const { error } = await supabase
      .from('construction_houses')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { data: true, error: null };
  } catch (err) {
    console.error('deleteHouse error:', err);
    // Fallback to demo data
    const idx = DEMO_HOUSES.findIndex(h => h.id === id);
    if (idx !== -1) DEMO_HOUSES.splice(idx, 1);
    return { data: true, error: null };
  }
}

export async function advanceMilestone(id, newMilestone, notes = null) {
  try {
    const dateField = getMilestoneDateField(newMilestone);
    const today = new Date().toISOString().split('T')[0];

    const updates = {
      current_milestone: newMilestone,
      updated_at: new Date().toISOString(),
    };
    if (dateField) updates[dateField] = today;
    if (newMilestone === 'complete') updates.status = 'complete';

    const { data, error } = await supabase
      .from('construction_houses')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        project:projects(id, name, project_type)
      `)
      .single();

    if (error) throw error;

    // The DB trigger auto-logs the milestone change, but add notes separately if provided
    if (notes) {
      await supabase
        .from('construction_milestone_log')
        .update({ notes })
        .eq('house_id', id)
        .eq('milestone', newMilestone)
        .order('created_at', { ascending: false })
        .limit(1);
    }

    return { data, error: null };
  } catch (err) {
    console.error('advanceMilestone error:', err);
    // Fallback to demo data
    const idx = DEMO_HOUSES.findIndex(h => h.id === id);
    if (idx === -1) return { data: null, error: { message: 'House not found' } };

    const house = DEMO_HOUSES[idx];
    const previousMilestone = house.current_milestone;
    const dateField = getMilestoneDateField(newMilestone);
    const today = new Date().toISOString().split('T')[0];

    const updates = {
      current_milestone: newMilestone,
      updated_at: new Date().toISOString(),
    };
    if (dateField) updates[dateField] = today;
    if (newMilestone === 'complete') updates.status = 'complete';

    DEMO_HOUSES[idx] = { ...house, ...updates };

    DEMO_MILESTONE_LOG.push({
      id: `ml-${Date.now()}`,
      house_id: id,
      milestone: newMilestone,
      previous_milestone: previousMilestone,
      notes,
      milestone_date: today,
      created_at: new Date().toISOString(),
    });

    return { data: DEMO_HOUSES[idx], error: null };
  }
}

// ─── Milestone Helpers ────────────────────────────────────────────────────────

export async function getMilestoneLog(houseId) {
  try {
    const { data, error } = await supabase
      .from('construction_milestone_log')
      .select('*')
      .eq('house_id', houseId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('getMilestoneLog error:', err);
    // Fallback to demo data
    const log = DEMO_MILESTONE_LOG
      .filter(m => m.house_id === houseId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { data: log, error: null };
  }
}

export async function getMilestoneSummary() {
  try {
    const { data, error } = await supabase
      .from('construction_houses')
      .select('current_milestone');

    if (error) throw error;

    const summary = {};
    MILESTONES.forEach(m => { summary[m.key] = 0; });
    data.forEach(h => {
      if (summary[h.current_milestone] !== undefined) {
        summary[h.current_milestone]++;
      }
    });
    return { data: summary, error: null };
  } catch (err) {
    console.error('getMilestoneSummary error:', err);
    // Fallback to demo data
    const summary = {};
    MILESTONES.forEach(m => { summary[m.key] = 0; });
    DEMO_HOUSES.forEach(h => {
      if (summary[h.current_milestone] !== undefined) {
        summary[h.current_milestone]++;
      }
    });
    return { data: summary, error: null };
  }
}

// ─── Purchase Orders ──────────────────────────────────────────────────────────

export async function getPurchaseOrders(houseId) {
  try {
    const { data, error } = await supabase
      .from('construction_purchase_orders')
      .select(`
        *,
        vendor:contacts(id, first_name, last_name, company)
      `)
      .eq('house_id', houseId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('getPurchaseOrders error:', err);
    // Fallback to demo data
    const pos = DEMO_PURCHASE_ORDERS
      .filter(po => po.house_id === houseId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { data: pos, error: null };
  }
}

export async function createPurchaseOrder(poData) {
  try {
    const { data, error } = await supabase
      .from('construction_purchase_orders')
      .insert([poData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('createPurchaseOrder error:', err);
    // Fallback to demo data
    const newPO = {
      id: `po-${Date.now()}`,
      ...poData,
      status: poData.status || 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    DEMO_PURCHASE_ORDERS.push(newPO);
    return { data: newPO, error: null };
  }
}

export async function updatePurchaseOrder(id, updates) {
  try {
    const { data, error } = await supabase
      .from('construction_purchase_orders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('updatePurchaseOrder error:', err);
    // Fallback to demo data
    const idx = DEMO_PURCHASE_ORDERS.findIndex(po => po.id === id);
    if (idx === -1) return { data: null, error: { message: 'Purchase order not found' } };
    DEMO_PURCHASE_ORDERS[idx] = { ...DEMO_PURCHASE_ORDERS[idx], ...updates, updated_at: new Date().toISOString() };
    return { data: DEMO_PURCHASE_ORDERS[idx], error: null };
  }
}

// ─── Daily Logs ───────────────────────────────────────────────────────────────

export async function getDailyLogs(houseId, limit = 30) {
  try {
    const { data, error } = await supabase
      .from('construction_daily_logs')
      .select('*')
      .eq('house_id', houseId)
      .order('log_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('getDailyLogs error:', err);
    // Fallback to demo data
    const logs = DEMO_DAILY_LOGS
      .filter(l => l.house_id === houseId)
      .sort((a, b) => new Date(b.log_date) - new Date(a.log_date))
      .slice(0, limit);
    return { data: logs, error: null };
  }
}

export async function createDailyLog(logData) {
  try {
    const { data, error } = await supabase
      .from('construction_daily_logs')
      .insert([logData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('createDailyLog error:', err);
    // Fallback to demo data
    const newLog = {
      id: `dl-${Date.now()}`,
      ...logData,
      log_date: logData.log_date || new Date().toISOString().split('T')[0],
      photos: logData.photos || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    DEMO_DAILY_LOGS.push(newLog);
    return { data: newLog, error: null };
  }
}

// ─── Inspections ──────────────────────────────────────────────────────────────

export async function getInspections(houseId) {
  try {
    const { data, error } = await supabase
      .from('construction_inspections')
      .select(`
        *,
        inspector:contacts(id, first_name, last_name, company)
      `)
      .eq('house_id', houseId)
      .order('scheduled_date', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('getInspections error:', err);
    // Fallback to demo data
    const inspections = DEMO_INSPECTIONS
      .filter(i => i.house_id === houseId)
      .sort((a, b) => new Date(b.scheduled_date || b.created_at) - new Date(a.scheduled_date || a.created_at));
    return { data: inspections, error: null };
  }
}

export async function createInspection(data) {
  try {
    const { data: result, error } = await supabase
      .from('construction_inspections')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return { data: result, error: null };
  } catch (err) {
    console.error('createInspection error:', err);
    // Fallback to demo data
    const newInspection = {
      id: `insp-${Date.now()}`,
      ...data,
      status: data.status || 'scheduled',
      deficiencies: data.deficiencies || [],
      photos: data.photos || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    DEMO_INSPECTIONS.push(newInspection);
    return { data: newInspection, error: null };
  }
}

export async function updateInspection(id, updates) {
  try {
    const { data, error } = await supabase
      .from('construction_inspections')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('updateInspection error:', err);
    // Fallback to demo data
    const idx = DEMO_INSPECTIONS.findIndex(i => i.id === id);
    if (idx === -1) return { data: null, error: { message: 'Inspection not found' } };
    DEMO_INSPECTIONS[idx] = { ...DEMO_INSPECTIONS[idx], ...updates, updated_at: new Date().toISOString() };
    return { data: DEMO_INSPECTIONS[idx], error: null };
  }
}

// ─── Warranty Items ───────────────────────────────────────────────────────────

export async function getWarrantyItems(houseId) {
  try {
    const { data, error } = await supabase
      .from('construction_warranty_items')
      .select(`
        *,
        vendor:contacts(id, first_name, last_name, company)
      `)
      .eq('house_id', houseId)
      .order('reported_date', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('getWarrantyItems error:', err);
    // Fallback to demo data
    const items = DEMO_WARRANTY_ITEMS
      .filter(w => w.house_id === houseId)
      .sort((a, b) => new Date(b.reported_date) - new Date(a.reported_date));
    return { data: items, error: null };
  }
}

export async function createWarrantyItem(data) {
  try {
    const { data: result, error } = await supabase
      .from('construction_warranty_items')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return { data: result, error: null };
  } catch (err) {
    console.error('createWarrantyItem error:', err);
    // Fallback to demo data
    const newItem = {
      id: `wi-${Date.now()}`,
      ...data,
      reported_date: data.reported_date || new Date().toISOString().split('T')[0],
      priority: data.priority || 'medium',
      status: data.status || 'reported',
      photos: data.photos || [],
      cost: data.cost || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    DEMO_WARRANTY_ITEMS.push(newItem);
    return { data: newItem, error: null };
  }
}

export async function updateWarrantyItem(id, updates) {
  try {
    const { data, error } = await supabase
      .from('construction_warranty_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('updateWarrantyItem error:', err);
    // Fallback to demo data
    const idx = DEMO_WARRANTY_ITEMS.findIndex(w => w.id === id);
    if (idx === -1) return { data: null, error: { message: 'Warranty item not found' } };
    DEMO_WARRANTY_ITEMS[idx] = { ...DEMO_WARRANTY_ITEMS[idx], ...updates, updated_at: new Date().toISOString() };
    return { data: DEMO_WARRANTY_ITEMS[idx], error: null };
  }
}
