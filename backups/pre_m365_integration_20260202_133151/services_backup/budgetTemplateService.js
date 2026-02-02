// src/services/budgetTemplateService.js
// Budget Template Management Service

import { supabase, isDemoMode } from '@/lib/supabase';

const mockTemplates = [
  {
    id: 'bt-1',
    name: 'Standard Spec Home',
    description: 'Budget template for standard spec home builds',
    project_type: 'spec-home',
    is_default: true,
    is_active: true,
    version: 1,
    usage_count: 12,
    categories: [
      { id: 'land', name: 'Land & Acquisition', sort_order: 0 },
      { id: 'hard', name: 'Hard Costs', sort_order: 1 },
      { id: 'soft', name: 'Soft Costs', sort_order: 2 },
      { id: 'financing', name: 'Financing', sort_order: 3 },
    ],
    line_items: [
      { id: 'li-1', category_id: 'land', name: 'Land Purchase', default_amount: 0 },
      { id: 'li-2', category_id: 'land', name: 'Closing Costs', default_amount: 5000 },
      { id: 'li-3', category_id: 'hard', name: 'Site Work', default_amount: 15000 },
      { id: 'li-4', category_id: 'hard', name: 'Foundation', default_amount: 25000 },
      { id: 'li-5', category_id: 'hard', name: 'Framing', default_amount: 45000 },
      { id: 'li-6', category_id: 'hard', name: 'Roofing', default_amount: 12000 },
      { id: 'li-7', category_id: 'hard', name: 'Plumbing', default_amount: 18000 },
      { id: 'li-8', category_id: 'hard', name: 'Electrical', default_amount: 15000 },
      { id: 'li-9', category_id: 'hard', name: 'HVAC', default_amount: 12000 },
      { id: 'li-10', category_id: 'soft', name: 'Architecture & Design', default_amount: 8000 },
      { id: 'li-11', category_id: 'soft', name: 'Permits & Fees', default_amount: 6000 },
      { id: 'li-12', category_id: 'soft', name: 'Insurance', default_amount: 4000 },
      { id: 'li-13', category_id: 'financing', name: 'Construction Interest', default_amount: 15000 },
      { id: 'li-14', category_id: 'financing', name: 'Loan Origination', default_amount: 3000 },
    ],
    created_at: '2024-06-01T00:00:00Z',
  },
  {
    id: 'bt-2',
    name: 'Lot Development',
    description: 'Horizontal development budget template',
    project_type: 'lot-development',
    is_default: true,
    is_active: true,
    version: 2,
    usage_count: 5,
    categories: [
      { id: 'land', name: 'Land Acquisition', sort_order: 0 },
      { id: 'infra', name: 'Infrastructure', sort_order: 1 },
      { id: 'soft', name: 'Soft Costs', sort_order: 2 },
    ],
    line_items: [
      { id: 'li-20', category_id: 'land', name: 'Raw Land', default_amount: 0 },
      { id: 'li-21', category_id: 'infra', name: 'Roads & Paving', default_amount: 100000 },
      { id: 'li-22', category_id: 'infra', name: 'Water & Sewer', default_amount: 80000 },
      { id: 'li-23', category_id: 'infra', name: 'Storm Drainage', default_amount: 50000 },
      { id: 'li-24', category_id: 'soft', name: 'Engineering', default_amount: 30000 },
      { id: 'li-25', category_id: 'soft', name: 'Permits', default_amount: 15000 },
    ],
    created_at: '2024-07-15T00:00:00Z',
  },
];

export async function getBudgetTemplates(filters = {}) {
  if (isDemoMode) {
    let templates = [...mockTemplates];
    if (filters.project_type) templates = templates.filter(t => t.project_type === filters.project_type);
    if (filters.is_active !== undefined) templates = templates.filter(t => t.is_active === filters.is_active);
    return templates;
  }

  let query = supabase.from('budget_templates').select('*');
  if (filters.project_type) query = query.eq('project_type', filters.project_type);
  if (filters.is_active !== undefined) query = query.eq('is_active', filters.is_active);

  const { data, error } = await query.order('name');
  if (error) throw error;
  return data;
}

export async function getBudgetTemplateById(templateId) {
  if (isDemoMode) {
    return mockTemplates.find(t => t.id === templateId) || null;
  }

  const { data, error } = await supabase
    .from('budget_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (error) throw error;
  return data;
}

export async function createBudgetTemplate(templateData) {
  if (isDemoMode) {
    const newTemplate = { id: `bt-${Date.now()}`, ...templateData, version: 1, usage_count: 0, created_at: new Date().toISOString() };
    mockTemplates.push(newTemplate);
    return newTemplate;
  }

  const { data, error } = await supabase
    .from('budget_templates')
    .insert([{ ...templateData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBudgetTemplate(templateId, updates) {
  if (isDemoMode) {
    const idx = mockTemplates.findIndex(t => t.id === templateId);
    if (idx >= 0) mockTemplates[idx] = { ...mockTemplates[idx], ...updates };
    return mockTemplates[idx];
  }

  const { data, error } = await supabase
    .from('budget_templates')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', templateId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBudgetTemplate(templateId) {
  if (isDemoMode) {
    const idx = mockTemplates.findIndex(t => t.id === templateId);
    if (idx >= 0) mockTemplates.splice(idx, 1);
    return true;
  }

  const { error } = await supabase
    .from('budget_templates')
    .delete()
    .eq('id', templateId);

  if (error) throw error;
  return true;
}

export async function duplicateBudgetTemplate(templateId, newName) {
  const original = await getBudgetTemplateById(templateId);
  if (!original) throw new Error('Template not found');

  const { id, created_at, updated_at, usage_count, ...copyData } = original;
  return createBudgetTemplate({
    ...copyData,
    name: newName || `${original.name} (Copy)`,
    is_default: false,
    version: 1,
  });
}
