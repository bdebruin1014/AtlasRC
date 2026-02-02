// src/services/dueDiligenceService.js
// Due Diligence Management Service

import { supabase, isDemoMode } from '@/lib/supabase';

export const DD_CATEGORIES = [
  { id: 'environmental', label: 'Environmental', icon: '🌿' },
  { id: 'survey', label: 'Survey & Boundaries', icon: '📐' },
  { id: 'title', label: 'Title & Legal', icon: '⚖️' },
  { id: 'zoning', label: 'Zoning & Entitlements', icon: '🏛️' },
  { id: 'utilities', label: 'Utilities', icon: '⚡' },
  { id: 'geotechnical', label: 'Geotechnical', icon: '🪨' },
  { id: 'financial', label: 'Financial', icon: '💰' },
  { id: 'inspections', label: 'Inspections', icon: '🔍' },
  { id: 'permits', label: 'Permits & Approvals', icon: '📋' },
  { id: 'other', label: 'Other', icon: '📁' },
];

const mockItems = [
  { id: 'dd-1', project_id: 'proj-1', category: 'environmental', title: 'Phase I ESA', description: 'Environmental Site Assessment', status: 'completed', priority: 'high', due_date: '2025-02-01', completed_date: '2025-01-28' },
  { id: 'dd-2', project_id: 'proj-1', category: 'survey', title: 'ALTA Survey', description: 'Boundary and topographic survey', status: 'completed', priority: 'high', due_date: '2025-02-05', completed_date: '2025-02-03' },
  { id: 'dd-3', project_id: 'proj-1', category: 'title', title: 'Title Search', description: 'Full title search and commitment', status: 'in_progress', priority: 'high', due_date: '2025-02-10' },
  { id: 'dd-4', project_id: 'proj-1', category: 'zoning', title: 'Zoning Verification', description: 'Confirm permitted use and density', status: 'completed', priority: 'medium', due_date: '2025-01-25', completed_date: '2025-01-24' },
  { id: 'dd-5', project_id: 'proj-1', category: 'utilities', title: 'Utility Availability', description: 'Confirm water, sewer, electric availability', status: 'pending', priority: 'medium', due_date: '2025-02-15' },
  { id: 'dd-6', project_id: 'proj-1', category: 'geotechnical', title: 'Soil Testing', description: 'Geotechnical report and soil borings', status: 'pending', priority: 'high', due_date: '2025-02-20' },
  { id: 'dd-7', project_id: 'proj-1', category: 'financial', title: 'Appraisal', description: 'As-is and as-complete appraisal', status: 'pending', priority: 'medium', due_date: '2025-02-25' },
  { id: 'dd-8', project_id: 'proj-1', category: 'inspections', title: 'Property Inspection', description: 'General property condition assessment', status: 'completed', priority: 'high', due_date: '2025-01-30', completed_date: '2025-01-29' },
];

export async function getDueDiligenceItems(projectId, filters = {}) {
  if (isDemoMode) {
    let items = mockItems.filter(i => !projectId || i.project_id === projectId || projectId === 'proj-1');
    if (filters.category) items = items.filter(i => i.category === filters.category);
    if (filters.status) items = items.filter(i => i.status === filters.status);
    return items;
  }

  let query = supabase
    .from('due_diligence_items')
    .select('*')
    .eq('project_id', projectId);

  if (filters.category) query = query.eq('category', filters.category);
  if (filters.status) query = query.eq('status', filters.status);

  const { data, error } = await query.order('sort_order').order('due_date');
  if (error) throw error;
  return data;
}

export async function createDueDiligenceItem(projectId, itemData) {
  if (isDemoMode) {
    const newItem = { id: `dd-${Date.now()}`, project_id: projectId, ...itemData, created_at: new Date().toISOString() };
    mockItems.push(newItem);
    return newItem;
  }

  const { data, error } = await supabase
    .from('due_diligence_items')
    .insert([{ project_id: projectId, ...itemData, created_at: new Date().toISOString() }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateDueDiligenceItem(itemId, updates) {
  if (isDemoMode) {
    const idx = mockItems.findIndex(i => i.id === itemId);
    if (idx >= 0) mockItems[idx] = { ...mockItems[idx], ...updates };
    return mockItems[idx];
  }

  const { data, error } = await supabase
    .from('due_diligence_items')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDueDiligenceItem(itemId) {
  if (isDemoMode) {
    const idx = mockItems.findIndex(i => i.id === itemId);
    if (idx >= 0) mockItems.splice(idx, 1);
    return true;
  }

  const { error } = await supabase
    .from('due_diligence_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
  return true;
}

export async function getDueDiligenceSummary(projectId) {
  const items = await getDueDiligenceItems(projectId);
  return {
    total: items.length,
    completed: items.filter(i => i.status === 'completed').length,
    in_progress: items.filter(i => i.status === 'in_progress').length,
    pending: items.filter(i => i.status === 'pending').length,
    overdue: items.filter(i => i.status !== 'completed' && i.due_date && new Date(i.due_date) < new Date()).length,
    byCategory: DD_CATEGORIES.map(cat => ({
      ...cat,
      items: items.filter(i => i.category === cat.id),
      completed: items.filter(i => i.category === cat.id && i.status === 'completed').length,
      total: items.filter(i => i.category === cat.id).length,
    })),
  };
}
