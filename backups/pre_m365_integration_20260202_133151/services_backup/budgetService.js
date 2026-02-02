// src/services/budgetService.js
// Budget Module Service - project budgets, line items, and plans

import { supabase, isDemoMode } from '@/lib/supabase';

// ─── DEMO DATA ───────────────────────────────────────────────────────────────

const DEMO_PLANS = [
  {
    id: 'plan-1',
    name: 'The Charleston 2400',
    description: '4BR/2.5BA two-story with front porch',
    square_footage: 2400,
    bedrooms: 4,
    bathrooms: 2.5,
    garage_spaces: 2,
    stories: 2,
    project_types: ['btr', 'spec_home', 'scattered_lot'],
    base_cost: 285000,
    cost_per_sf: 118.75,
    cost_breakdown: {
      foundation: 18000,
      framing: 52000,
      roofing: 14000,
      plumbing_rough: 9500,
      electrical_rough: 8500,
      hvac_rough: 11000,
      insulation: 5500,
      drywall: 22000,
      interior_trim: 14000,
      cabinets: 18000,
      countertops: 9500,
      flooring: 16000,
      plumbing_finish: 7000,
      electrical_finish: 6500,
      hvac_finish: 3500,
      paint: 9500,
      appliances: 7000,
      landscaping: 10000,
      driveway: 6000,
      cleanup: 3000,
    },
    is_active: true,
    created_at: '2024-06-01T00:00:00Z',
  },
  {
    id: 'plan-2',
    name: 'The Savannah 1800',
    description: '3BR/2BA single-story ranch',
    square_footage: 1800,
    bedrooms: 3,
    bathrooms: 2,
    garage_spaces: 2,
    stories: 1,
    project_types: ['btr', 'spec_home', 'scattered_lot'],
    base_cost: 225000,
    cost_per_sf: 125.00,
    cost_breakdown: {
      foundation: 22000,
      framing: 38000,
      roofing: 16000,
      plumbing_rough: 8000,
      electrical_rough: 7000,
      hvac_rough: 10000,
      insulation: 4500,
      drywall: 18000,
      interior_trim: 11000,
      cabinets: 14000,
      countertops: 7500,
      flooring: 13000,
      plumbing_finish: 6000,
      electrical_finish: 5500,
      hvac_finish: 3000,
      paint: 7500,
      appliances: 6500,
      landscaping: 8500,
      driveway: 5500,
      cleanup: 2500,
    },
    is_active: true,
    created_at: '2024-06-01T00:00:00Z',
  },
  {
    id: 'plan-3',
    name: 'The Augusta 3200',
    description: '5BR/3.5BA two-story executive',
    square_footage: 3200,
    bedrooms: 5,
    bathrooms: 3.5,
    garage_spaces: 3,
    stories: 2,
    project_types: ['spec_home', 'fix_and_flip'],
    base_cost: 395000,
    cost_per_sf: 123.44,
    cost_breakdown: {
      foundation: 24000,
      framing: 68000,
      roofing: 18000,
      plumbing_rough: 12000,
      electrical_rough: 11000,
      hvac_rough: 14000,
      insulation: 7000,
      drywall: 28000,
      interior_trim: 18000,
      cabinets: 24000,
      countertops: 13000,
      flooring: 22000,
      plumbing_finish: 9000,
      electrical_finish: 8000,
      hvac_finish: 4500,
      paint: 12000,
      appliances: 9000,
      landscaping: 12000,
      driveway: 7000,
      cleanup: 3500,
    },
    is_active: true,
    created_at: '2024-07-01T00:00:00Z',
  },
];

const DEMO_BUDGETS = [
  {
    id: 'budget-1',
    project_id: 'demo-project-1',
    budget_name: 'Highland Park - Budget - V1',
    version_number: 1,
    plan_id: 'plan-1',
    plan_name: 'The Charleston 2400',
    template_id: 'bt-1',
    is_active: true,
    status: 'approved',
    total_budget: 1845000,
    total_actual: 1256000,
    total_variance: 589000,
    created_at: '2024-01-15T00:00:00Z',
    created_by_name: 'Bryan VanRock',
  },
  {
    id: 'budget-2',
    project_id: 'demo-project-1',
    budget_name: 'Highland Park - Budget - V2',
    version_number: 2,
    plan_id: 'plan-1',
    plan_name: 'The Charleston 2400',
    template_id: 'bt-1',
    is_active: false,
    status: 'draft',
    total_budget: 1920000,
    total_actual: 0,
    total_variance: 1920000,
    created_at: '2024-09-15T00:00:00Z',
    created_by_name: 'Alex Johnson',
  },
];

const DEMO_LINE_ITEMS = [
  // Land Costs
  { id: 'li-1', budget_id: 'budget-1', category: 'Land & Acquisition', line_item_code: '01-001', line_item_name: 'Land Purchase', budget_amount: 1200000, actual_amount: 1200000, committed_amount: 1200000, calculation_type: 'fixed', is_from_template: false, source_field: 'purchase_contract.price', sort_order: 1 },
  { id: 'li-2', budget_id: 'budget-1', category: 'Land & Acquisition', line_item_code: '01-002', line_item_name: 'Buyer Closing Costs', budget_amount: 24000, actual_amount: 23500, committed_amount: 24000, calculation_type: 'fixed', is_from_template: false, source_field: 'purchase_contract.closing_costs', sort_order: 2 },
  { id: 'li-3', budget_id: 'budget-1', category: 'Land & Acquisition', line_item_code: '01-003', line_item_name: 'Due Diligence', budget_amount: 15000, actual_amount: 12800, committed_amount: 15000, calculation_type: 'fixed', is_from_template: true, sort_order: 3 },
  { id: 'li-4', budget_id: 'budget-1', category: 'Land & Acquisition', line_item_code: '01-004', line_item_name: 'Survey', budget_amount: 8500, actual_amount: 8500, committed_amount: 8500, calculation_type: 'fixed', is_from_template: true, sort_order: 4 },
  // Hard Costs
  { id: 'li-5', budget_id: 'budget-1', category: 'Hard Costs', line_item_code: '02-001', line_item_name: 'Site Work & Grading', budget_amount: 45000, actual_amount: 42000, committed_amount: 45000, calculation_type: 'fixed', is_from_template: true, sort_order: 5 },
  { id: 'li-6', budget_id: 'budget-1', category: 'Hard Costs', line_item_code: '02-002', line_item_name: 'Foundation', budget_amount: 18000, actual_amount: 18000, committed_amount: 18000, calculation_type: 'fixed', is_from_plan: true, sort_order: 6 },
  { id: 'li-7', budget_id: 'budget-1', category: 'Hard Costs', line_item_code: '02-003', line_item_name: 'Framing', budget_amount: 52000, actual_amount: 52000, committed_amount: 52000, calculation_type: 'fixed', is_from_plan: true, sort_order: 7 },
  { id: 'li-8', budget_id: 'budget-1', category: 'Hard Costs', line_item_code: '02-004', line_item_name: 'Roofing', budget_amount: 14000, actual_amount: 13500, committed_amount: 14000, calculation_type: 'fixed', is_from_plan: true, sort_order: 8 },
  { id: 'li-9', budget_id: 'budget-1', category: 'Hard Costs', line_item_code: '02-005', line_item_name: 'Plumbing (Rough & Finish)', budget_amount: 16500, actual_amount: 15200, committed_amount: 16500, calculation_type: 'fixed', is_from_plan: true, sort_order: 9 },
  { id: 'li-10', budget_id: 'budget-1', category: 'Hard Costs', line_item_code: '02-006', line_item_name: 'Electrical (Rough & Finish)', budget_amount: 15000, actual_amount: 14800, committed_amount: 15000, calculation_type: 'fixed', is_from_plan: true, sort_order: 10 },
  { id: 'li-11', budget_id: 'budget-1', category: 'Hard Costs', line_item_code: '02-007', line_item_name: 'HVAC', budget_amount: 14500, actual_amount: 14500, committed_amount: 14500, calculation_type: 'fixed', is_from_plan: true, sort_order: 11 },
  { id: 'li-12', budget_id: 'budget-1', category: 'Hard Costs', line_item_code: '02-008', line_item_name: 'Insulation & Drywall', budget_amount: 27500, actual_amount: 26000, committed_amount: 27500, calculation_type: 'fixed', is_from_plan: true, sort_order: 12 },
  { id: 'li-13', budget_id: 'budget-1', category: 'Hard Costs', line_item_code: '02-009', line_item_name: 'Interior Finishes', budget_amount: 62000, actual_amount: 58000, committed_amount: 62000, calculation_type: 'fixed', is_from_plan: true, sort_order: 13 },
  { id: 'li-14', budget_id: 'budget-1', category: 'Hard Costs', line_item_code: '02-010', line_item_name: 'Exterior & Landscaping', budget_amount: 25000, actual_amount: 18000, committed_amount: 22000, calculation_type: 'fixed', is_from_plan: true, sort_order: 14 },
  // Soft Costs
  { id: 'li-15', budget_id: 'budget-1', category: 'Soft Costs', line_item_code: '03-001', line_item_name: 'Architecture & Design', budget_amount: 35000, actual_amount: 35000, committed_amount: 35000, calculation_type: 'fixed', is_from_template: true, sort_order: 15 },
  { id: 'li-16', budget_id: 'budget-1', category: 'Soft Costs', line_item_code: '03-002', line_item_name: 'Engineering', budget_amount: 18000, actual_amount: 18000, committed_amount: 18000, calculation_type: 'fixed', is_from_template: true, sort_order: 16 },
  { id: 'li-17', budget_id: 'budget-1', category: 'Soft Costs', line_item_code: '03-003', line_item_name: 'Permits & Fees', budget_amount: 22000, actual_amount: 21500, committed_amount: 22000, calculation_type: 'fixed', is_from_template: true, sort_order: 17 },
  { id: 'li-18', budget_id: 'budget-1', category: 'Soft Costs', line_item_code: '03-004', line_item_name: 'Insurance', budget_amount: 12000, actual_amount: 11800, committed_amount: 12000, calculation_type: 'fixed', is_from_template: true, sort_order: 18 },
  { id: 'li-19', budget_id: 'budget-1', category: 'Soft Costs', line_item_code: '03-005', line_item_name: 'Legal', budget_amount: 15000, actual_amount: 9200, committed_amount: 12000, calculation_type: 'fixed', is_from_template: true, sort_order: 19 },
  // Financing
  { id: 'li-20', budget_id: 'budget-1', category: 'Financing', line_item_code: '04-001', line_item_name: 'Construction Loan Interest', budget_amount: 85000, actual_amount: 62000, committed_amount: 85000, calculation_type: 'fixed', is_from_template: true, sort_order: 20 },
  { id: 'li-21', budget_id: 'budget-1', category: 'Financing', line_item_code: '04-002', line_item_name: 'Loan Origination Fee', budget_amount: 18000, actual_amount: 18000, committed_amount: 18000, calculation_type: 'fixed', is_from_template: true, sort_order: 21 },
  { id: 'li-22', budget_id: 'budget-1', category: 'Financing', line_item_code: '04-003', line_item_name: 'Appraisal & Inspections', budget_amount: 5000, actual_amount: 4800, committed_amount: 5000, calculation_type: 'fixed', is_from_template: true, sort_order: 22 },
  // Contingency
  { id: 'li-23', budget_id: 'budget-1', category: 'Contingency', line_item_code: '05-001', line_item_name: 'Hard Cost Contingency (5%)', budget_amount: 55000, actual_amount: 0, committed_amount: 0, calculation_type: 'percentage', calculation_basis: 'hard_costs', sort_order: 23 },
  { id: 'li-24', budget_id: 'budget-1', category: 'Contingency', line_item_code: '05-002', line_item_name: 'Soft Cost Contingency (3%)', budget_amount: 18000, actual_amount: 0, committed_amount: 0, calculation_type: 'percentage', calculation_basis: 'soft_costs', sort_order: 24 },
];

// ─── PLANS SERVICE ───────────────────────────────────────────────────────────

export async function getPlans(projectType) {
  if (isDemoMode) {
    if (!projectType) return DEMO_PLANS.filter(p => p.is_active);
    return DEMO_PLANS.filter(p => p.is_active && p.project_types.includes(projectType));
  }
  let query = supabase.from('plans').select('*').eq('is_active', true);
  if (projectType) query = query.contains('project_types', [projectType]);
  const { data, error } = await query.order('name');
  if (error) throw error;
  return data;
}

export async function getPlanById(planId) {
  if (isDemoMode) return DEMO_PLANS.find(p => p.id === planId) || null;
  const { data, error } = await supabase.from('plans').select('*').eq('id', planId).single();
  if (error) throw error;
  return data;
}

export async function createPlan(planData) {
  if (isDemoMode) {
    return { id: `plan-${Date.now()}`, ...planData, created_at: new Date().toISOString() };
  }
  const { data, error } = await supabase.from('plans').insert(planData).select().single();
  if (error) throw error;
  return data;
}

export async function updatePlan(planId, updates) {
  if (isDemoMode) return { id: planId, ...updates };
  const { data, error } = await supabase.from('plans').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', planId).select().single();
  if (error) throw error;
  return data;
}

// ─── PROJECT BUDGETS SERVICE ─────────────────────────────────────────────────

export async function getProjectBudgets(projectId) {
  if (isDemoMode) {
    return DEMO_BUDGETS.filter(b => b.project_id === projectId || projectId === 'demo-project-1');
  }
  const { data, error } = await supabase
    .from('project_budgets')
    .select('*, plans(name)')
    .eq('project_id', projectId)
    .order('version_number', { ascending: false });
  if (error) throw error;
  return (data || []).map(b => ({ ...b, plan_name: b.plans?.name || null }));
}

export async function getActiveBudget(projectId) {
  if (isDemoMode) {
    const active = DEMO_BUDGETS.find(b => (b.project_id === projectId || projectId === 'demo-project-1') && b.is_active);
    return active || null;
  }
  const { data, error } = await supabase
    .from('project_budgets')
    .select('*, plans(name)')
    .eq('project_id', projectId)
    .eq('is_active', true)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data ? { ...data, plan_name: data.plans?.name || null } : null;
}

export async function getBudgetById(budgetId) {
  if (isDemoMode) return DEMO_BUDGETS.find(b => b.id === budgetId) || null;
  const { data, error } = await supabase.from('project_budgets').select('*, plans(name)').eq('id', budgetId).single();
  if (error) throw error;
  return data ? { ...data, plan_name: data.plans?.name || null } : null;
}

export async function createBudget(projectId, budgetData) {
  if (isDemoMode) {
    const existing = DEMO_BUDGETS.filter(b => b.project_id === projectId);
    const nextVersion = (existing.length > 0 ? Math.max(...existing.map(b => b.version_number)) : 0) + 1;
    const newBudget = {
      id: `budget-${Date.now()}`,
      project_id: projectId,
      version_number: nextVersion,
      budget_name: budgetData.budget_name || `Budget - V${nextVersion}`,
      plan_id: budgetData.plan_id || null,
      template_id: budgetData.template_id || null,
      is_active: budgetData.is_active ?? true,
      status: 'draft',
      total_budget: 0,
      total_actual: 0,
      total_variance: 0,
      created_at: new Date().toISOString(),
      created_by_name: 'Demo User',
    };
    DEMO_BUDGETS.push(newBudget);
    return newBudget;
  }

  // Get next version number
  const { data: existing } = await supabase
    .from('project_budgets')
    .select('version_number')
    .eq('project_id', projectId)
    .order('version_number', { ascending: false })
    .limit(1);

  const nextVersion = (existing?.[0]?.version_number || 0) + 1;

  const { data, error } = await supabase.from('project_budgets').insert({
    project_id: projectId,
    version_number: nextVersion,
    budget_name: budgetData.budget_name || `Budget - V${nextVersion}`,
    plan_id: budgetData.plan_id || null,
    template_id: budgetData.template_id || null,
    is_active: budgetData.is_active ?? true,
    status: 'draft',
    created_by_name: budgetData.created_by_name || 'Unknown',
  }).select().single();
  if (error) throw error;
  return data;
}

export async function updateBudget(budgetId, updates) {
  if (isDemoMode) {
    const idx = DEMO_BUDGETS.findIndex(b => b.id === budgetId);
    if (idx >= 0) Object.assign(DEMO_BUDGETS[idx], updates);
    return DEMO_BUDGETS[idx] || { id: budgetId, ...updates };
  }
  const { data, error } = await supabase.from('project_budgets')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', budgetId).select().single();
  if (error) throw error;
  return data;
}

export async function setActiveBudget(projectId, budgetId) {
  if (isDemoMode) {
    DEMO_BUDGETS.forEach(b => {
      if (b.project_id === projectId || projectId === 'demo-project-1') {
        b.is_active = b.id === budgetId;
      }
    });
    return DEMO_BUDGETS.find(b => b.id === budgetId);
  }
  // The trigger handles deactivating others
  const { data, error } = await supabase.from('project_budgets')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('id', budgetId).select().single();
  if (error) throw error;
  return data;
}

export async function deleteBudget(budgetId) {
  if (isDemoMode) {
    const idx = DEMO_BUDGETS.findIndex(b => b.id === budgetId);
    if (idx >= 0) DEMO_BUDGETS.splice(idx, 1);
    return true;
  }
  const { error } = await supabase.from('project_budgets').delete().eq('id', budgetId);
  if (error) throw error;
  return true;
}

// ─── BUDGET LINE ITEMS SERVICE ───────────────────────────────────────────────

export async function getBudgetLineItems(budgetId) {
  if (isDemoMode) {
    return DEMO_LINE_ITEMS.filter(li => li.budget_id === budgetId).sort((a, b) => a.sort_order - b.sort_order);
  }
  const { data, error } = await supabase
    .from('budget_line_items')
    .select('*')
    .eq('budget_id', budgetId)
    .order('sort_order');
  if (error) throw error;
  return data || [];
}

export async function createLineItem(budgetId, lineItemData) {
  if (isDemoMode) {
    const newItem = { id: `li-${Date.now()}`, budget_id: budgetId, ...lineItemData, created_at: new Date().toISOString() };
    DEMO_LINE_ITEMS.push(newItem);
    return newItem;
  }
  const { data, error } = await supabase.from('budget_line_items')
    .insert({ budget_id: budgetId, ...lineItemData }).select().single();
  if (error) throw error;
  return data;
}

export async function updateLineItem(lineItemId, updates) {
  if (isDemoMode) {
    const idx = DEMO_LINE_ITEMS.findIndex(li => li.id === lineItemId);
    if (idx >= 0) Object.assign(DEMO_LINE_ITEMS[idx], updates);
    return DEMO_LINE_ITEMS[idx] || { id: lineItemId, ...updates };
  }
  const { data, error } = await supabase.from('budget_line_items')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', lineItemId).select().single();
  if (error) throw error;
  return data;
}

export async function deleteLineItem(lineItemId) {
  if (isDemoMode) {
    const idx = DEMO_LINE_ITEMS.findIndex(li => li.id === lineItemId);
    if (idx >= 0) DEMO_LINE_ITEMS.splice(idx, 1);
    return true;
  }
  const { error } = await supabase.from('budget_line_items').delete().eq('id', lineItemId);
  if (error) throw error;
  return true;
}

export async function bulkCreateLineItems(budgetId, lineItems) {
  if (isDemoMode) {
    const created = lineItems.map((li, i) => ({
      id: `li-${Date.now()}-${i}`,
      budget_id: budgetId,
      ...li,
      created_at: new Date().toISOString(),
    }));
    DEMO_LINE_ITEMS.push(...created);
    return created;
  }
  const rows = lineItems.map(li => ({ budget_id: budgetId, ...li }));
  const { data, error } = await supabase.from('budget_line_items').insert(rows).select();
  if (error) throw error;
  return data;
}

// ─── TEMPLATE APPLICATION ────────────────────────────────────────────────────

export function applyTemplateToLineItems(template) {
  if (!template?.line_items) return [];
  return template.line_items.map((li, i) => ({
    category: li.category_id ? template.categories?.find(c => c.id === li.category_id)?.name || li.category_id : li.category || 'Uncategorized',
    line_item_code: li.code || `${String(i + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
    line_item_name: li.name || li.line_item_name,
    budget_amount: li.default_amount || 0,
    actual_amount: 0,
    committed_amount: 0,
    calculation_type: li.calculation_type || 'fixed',
    is_from_template: true,
    sort_order: li.sort_order || i + 1,
  }));
}

export function applyPlanCostBreakdown(plan) {
  if (!plan?.cost_breakdown) return [];
  const entries = Object.entries(plan.cost_breakdown);
  return entries.map(([key, value], i) => ({
    category: 'Hard Costs',
    subcategory: 'Vertical Construction',
    line_item_code: `02-${String(i + 1).padStart(3, '0')}`,
    line_item_name: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    budget_amount: value,
    actual_amount: 0,
    committed_amount: 0,
    calculation_type: 'fixed',
    is_from_plan: true,
    sort_order: 100 + i,
  }));
}

// ─── BUDGET TOTALS ───────────────────────────────────────────────────────────

export function calculateBudgetTotals(lineItems) {
  const categories = {};
  let totalBudget = 0;
  let totalActual = 0;
  let totalCommitted = 0;

  lineItems.forEach(li => {
    const cat = li.category || 'Uncategorized';
    if (!categories[cat]) {
      categories[cat] = { budget: 0, actual: 0, committed: 0, items: 0 };
    }
    categories[cat].budget += li.budget_amount || 0;
    categories[cat].actual += li.actual_amount || 0;
    categories[cat].committed += li.committed_amount || 0;
    categories[cat].items += 1;
    totalBudget += li.budget_amount || 0;
    totalActual += li.actual_amount || 0;
    totalCommitted += li.committed_amount || 0;
  });

  return {
    categories,
    totalBudget,
    totalActual,
    totalCommitted,
    totalVariance: totalBudget - totalActual,
    percentUsed: totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0,
  };
}

// ─── BUDGET NAME GENERATION ──────────────────────────────────────────────────

export function generateBudgetName(projectName, versionNumber) {
  return `${projectName} - Budget - V${versionNumber}`;
}
