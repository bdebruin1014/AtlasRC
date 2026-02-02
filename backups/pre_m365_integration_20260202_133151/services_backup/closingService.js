// src/services/closingService.js
// Closing Management Service

import { supabase, isDemoMode } from '@/lib/supabase';

export const CLOSING_CATEGORIES = [
  { id: 'pre_closing', label: 'Pre-Closing', icon: '📋' },
  { id: 'title_review', label: 'Title Review', icon: '📜' },
  { id: 'lender_requirements', label: 'Lender Requirements', icon: '🏦' },
  { id: 'documents', label: 'Document Preparation', icon: '📄' },
  { id: 'financial', label: 'Financial', icon: '💰' },
  { id: 'closing_day', label: 'Closing Day', icon: '✅' },
  { id: 'post_closing', label: 'Post-Closing', icon: '📬' },
];

const mockClosingItems = [
  { id: 'cl-1', project_id: 'proj-1', category: 'pre_closing', title: 'Schedule closing date', status: 'completed', due_date: '2025-03-01', completed_date: '2025-02-28', responsible_party: 'Attorney' },
  { id: 'cl-2', project_id: 'proj-1', category: 'pre_closing', title: 'Confirm all contingencies met', status: 'completed', due_date: '2025-03-05', completed_date: '2025-03-04', responsible_party: 'Buyer' },
  { id: 'cl-3', project_id: 'proj-1', category: 'title_review', title: 'Title commitment review', status: 'in_progress', due_date: '2025-03-08', responsible_party: 'Title Company' },
  { id: 'cl-4', project_id: 'proj-1', category: 'title_review', title: 'Resolve title exceptions', status: 'pending', due_date: '2025-03-10', responsible_party: 'Attorney' },
  { id: 'cl-5', project_id: 'proj-1', category: 'lender_requirements', title: 'Final loan approval', status: 'pending', due_date: '2025-03-10', responsible_party: 'Lender' },
  { id: 'cl-6', project_id: 'proj-1', category: 'lender_requirements', title: 'Appraisal completed', status: 'completed', due_date: '2025-03-05', completed_date: '2025-03-03', responsible_party: 'Lender' },
  { id: 'cl-7', project_id: 'proj-1', category: 'documents', title: 'Prepare closing disclosure', status: 'pending', due_date: '2025-03-12', responsible_party: 'Settlement Agent' },
  { id: 'cl-8', project_id: 'proj-1', category: 'documents', title: 'Prepare deed', status: 'pending', due_date: '2025-03-12', responsible_party: 'Attorney' },
  { id: 'cl-9', project_id: 'proj-1', category: 'financial', title: 'Wire transfer instructions', status: 'pending', due_date: '2025-03-14', responsible_party: 'Settlement Agent' },
  { id: 'cl-10', project_id: 'proj-1', category: 'closing_day', title: 'Execute closing documents', status: 'pending', due_date: '2025-03-15', responsible_party: 'All Parties' },
  { id: 'cl-11', project_id: 'proj-1', category: 'post_closing', title: 'Record deed', status: 'pending', due_date: '2025-03-16', responsible_party: 'Title Company' },
  { id: 'cl-12', project_id: 'proj-1', category: 'post_closing', title: 'Disburse funds', status: 'pending', due_date: '2025-03-16', responsible_party: 'Settlement Agent' },
];

export async function getClosingItems(projectId, filters = {}) {
  if (isDemoMode) {
    let items = mockClosingItems.filter(i => !projectId || i.project_id === projectId || projectId === 'proj-1');
    if (filters.category) items = items.filter(i => i.category === filters.category);
    if (filters.status) items = items.filter(i => i.status === filters.status);
    return items;
  }

  let query = supabase
    .from('closing_items')
    .select('*')
    .eq('project_id', projectId);

  if (filters.category) query = query.eq('category', filters.category);
  if (filters.status) query = query.eq('status', filters.status);

  const { data, error } = await query.order('sort_order').order('due_date');
  if (error) throw error;
  return data;
}

export async function createClosingItem(projectId, itemData) {
  if (isDemoMode) {
    const newItem = { id: `cl-${Date.now()}`, project_id: projectId, ...itemData, created_at: new Date().toISOString() };
    mockClosingItems.push(newItem);
    return newItem;
  }

  const { data, error } = await supabase
    .from('closing_items')
    .insert([{ project_id: projectId, ...itemData }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateClosingItem(itemId, updates) {
  if (isDemoMode) {
    const idx = mockClosingItems.findIndex(i => i.id === itemId);
    if (idx >= 0) mockClosingItems[idx] = { ...mockClosingItems[idx], ...updates };
    return mockClosingItems[idx];
  }

  const { data, error } = await supabase
    .from('closing_items')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteClosingItem(itemId) {
  if (isDemoMode) {
    const idx = mockClosingItems.findIndex(i => i.id === itemId);
    if (idx >= 0) mockClosingItems.splice(idx, 1);
    return true;
  }

  const { error } = await supabase
    .from('closing_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
  return true;
}

export async function getClosingSummary(projectId) {
  const items = await getClosingItems(projectId);
  return {
    total: items.length,
    completed: items.filter(i => i.status === 'completed').length,
    in_progress: items.filter(i => i.status === 'in_progress').length,
    pending: items.filter(i => i.status === 'pending').length,
    byCategory: CLOSING_CATEGORIES.map(cat => ({
      ...cat,
      items: items.filter(i => i.category === cat.id),
      completed: items.filter(i => i.category === cat.id && i.status === 'completed').length,
      total: items.filter(i => i.category === cat.id).length,
    })),
  };
}
