// src/services/opportunityTasksService.js
// Opportunity Task Management Service — connects to opportunity_tasks table

import { supabase, isDemoMode } from '@/lib/supabase';

// ============================================
// CONSTANTS
// ============================================

export const TASK_CATEGORIES = [
  { id: 'due-diligence', label: 'Due Diligence', color: 'bg-blue-500' },
  { id: 'legal', label: 'Legal', color: 'bg-purple-500' },
  { id: 'finance', label: 'Finance', color: 'bg-green-500' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-amber-500' },
  { id: 'inspection', label: 'Inspection', color: 'bg-orange-500' },
  { id: 'admin', label: 'Administrative', color: 'bg-gray-500' },
  { id: 'other', label: 'Other', color: 'bg-slate-500' },
];

export const TASK_PRIORITIES = [
  { id: 'low', label: 'Low', color: 'text-gray-500', bgColor: 'bg-gray-100 text-gray-700' },
  { id: 'medium', label: 'Medium', color: 'text-blue-500', bgColor: 'bg-blue-100 text-blue-700' },
  { id: 'high', label: 'High', color: 'text-amber-500', bgColor: 'bg-amber-100 text-amber-700' },
  { id: 'urgent', label: 'Urgent', color: 'text-red-500', bgColor: 'bg-red-100 text-red-700' },
];

export const TASK_STATUSES = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
];

// ============================================
// MOCK DATA (fallback)
// ============================================

const mockTasks = [
  {
    id: 'opp-task-1',
    opportunity_id: 'demo',
    title: 'Order title search',
    category: 'due-diligence',
    status: 'completed',
    priority: 'high',
    assigned_to: 'Bryan De Bruin',
    due_date: '2026-02-10',
    description: 'Contact title company to run full title search on the property.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'opp-task-2',
    opportunity_id: 'demo',
    title: 'Schedule property inspection',
    category: 'inspection',
    status: 'in-progress',
    priority: 'urgent',
    assigned_to: 'Mike Williams',
    due_date: '2026-02-18',
    description: 'Coordinate with inspector for full property assessment.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'opp-task-3',
    opportunity_id: 'demo',
    title: 'Submit earnest money deposit',
    category: 'finance',
    status: 'todo',
    priority: 'high',
    assigned_to: 'Bryan De Bruin',
    due_date: '2026-02-22',
    description: 'Wire earnest money to escrow agent within 3 business days of contract execution.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'opp-task-4',
    opportunity_id: 'demo',
    title: 'Review seller disclosures',
    category: 'legal',
    status: 'todo',
    priority: 'medium',
    assigned_to: 'Jennifer Taylor',
    due_date: '2026-03-01',
    description: 'Review all seller disclosure documents for potential issues.',
    created_at: new Date().toISOString(),
  },
];

// ============================================
// CRUD OPERATIONS
// ============================================

export async function getTasks(opportunityId) {
  try {
    const { data, error } = await supabase
      .from('opportunity_tasks')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .order('due_date', { ascending: true, nullsFirst: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching opportunity tasks:', error);
    return mockTasks.map(t => ({ ...t, opportunity_id: opportunityId }));
  }
}

export async function createTask(opportunityId, taskData) {
  try {
    const payload = {
      ...taskData,
      opportunity_id: opportunityId,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('opportunity_tasks')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating opportunity task:', error);
    return {
      ...taskData,
      id: `opp-task-${Date.now()}`,
      opportunity_id: opportunityId,
      created_at: new Date().toISOString(),
    };
  }
}

export async function updateTask(taskId, updates) {
  try {
    const { data, error } = await supabase
      .from('opportunity_tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating opportunity task:', error);
    return { id: taskId, ...updates };
  }
}

export async function deleteTask(taskId) {
  try {
    const { error } = await supabase
      .from('opportunity_tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting opportunity task:', error);
    return true;
  }
}

export async function toggleTask(taskId, currentStatus) {
  const newStatus = currentStatus === 'completed' ? 'todo' : 'completed';
  const updates = {
    status: newStatus,
    completed_date: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null,
  };
  return updateTask(taskId, updates);
}

export default {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TASK_STATUSES,
};
