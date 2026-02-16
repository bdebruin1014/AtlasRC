// src/services/taskService.js
// Project Task Management Service — connects to project_tasks table

import { supabase } from '@/lib/supabase';

// ============================================
// CONSTANTS
// ============================================

export const TASK_CATEGORIES = [
  { id: 'construction', label: 'Construction', color: 'bg-orange-500' },
  { id: 'sales', label: 'Sales & Marketing', color: 'bg-pink-500' },
  { id: 'admin', label: 'Administrative', color: 'bg-purple-500' },
  { id: 'finance', label: 'Finance', color: 'bg-green-500' },
  { id: 'legal', label: 'Legal', color: 'bg-blue-500' },
  { id: 'other', label: 'Other', color: 'bg-gray-500' },
];

export const TASK_PRIORITIES = [
  { id: 'low', label: 'Low', color: 'text-gray-500' },
  { id: 'medium', label: 'Medium', color: 'text-blue-500' },
  { id: 'high', label: 'High', color: 'text-amber-500' },
  { id: 'urgent', label: 'Urgent', color: 'text-red-500' },
];

export const TASK_STATUSES = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'blocked', label: 'Blocked' },
];

// ============================================
// MOCK DATA (fallback)
// ============================================

const mockTasks = [
  { id: 'mock-task-1', project_id: 'mock-1', task_number: 'TSK-001', title: 'Schedule framing inspection', category: 'construction', status: 'in-progress', priority: 'high', assigned_to_name: 'Mike Williams', due_date: '2026-02-20', description: 'Framing complete, need inspection.', checklist: [{ text: 'Verify framing complete', done: true }, { text: 'Call building dept', done: false }], created_at: new Date().toISOString() },
  { id: 'mock-task-2', project_id: 'mock-1', task_number: 'TSK-002', title: 'Order appliances', category: 'construction', status: 'todo', priority: 'medium', assigned_to_name: 'Bryan De Bruin', due_date: '2026-03-01', description: '4 week lead time.', checklist: [], created_at: new Date().toISOString() },
  { id: 'mock-task-3', project_id: 'mock-1', task_number: 'TSK-003', title: 'Update MLS listing', category: 'sales', status: 'todo', priority: 'low', assigned_to_name: 'Bryan De Bruin', due_date: '2026-03-15', description: 'Add new progress photos.', checklist: [], created_at: new Date().toISOString() },
];

// ============================================
// CRUD OPERATIONS
// ============================================

export async function getTasks(projectId, filters = {}) {
  try {
    let query = supabase
      .from('project_tasks')
      .select('*')
      .order('due_date', { ascending: true, nullsFirst: false });

    if (projectId) query = query.eq('project_id', projectId);
    if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
    if (filters.category && filters.category !== 'all') query = query.eq('category', filters.category);
    if (filters.priority && filters.priority !== 'all') query = query.eq('priority', filters.priority);
    if (filters.assigned_to) query = query.eq('assigned_to', filters.assigned_to);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching tasks:', error);
    let tasks = projectId ? mockTasks.filter(t => t.project_id === projectId) : mockTasks;
    if (filters.status && filters.status !== 'all') tasks = tasks.filter(t => t.status === filters.status);
    if (filters.category && filters.category !== 'all') tasks = tasks.filter(t => t.category === filters.category);
    if (filters.priority && filters.priority !== 'all') tasks = tasks.filter(t => t.priority === filters.priority);
    return tasks;
  }
}

export async function getTaskById(taskId) {
  try {
    const { data, error } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching task:', error);
    return mockTasks.find(t => t.id === taskId) || null;
  }
}

export async function createTask(taskData) {
  try {
    const { data, error } = await supabase
      .from('project_tasks')
      .insert(taskData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating task:', error);
    return { ...taskData, id: `mock-${Date.now()}`, task_number: `TSK-${Date.now()}`, created_at: new Date().toISOString() };
  }
}

export async function updateTask(taskId, updates) {
  try {
    const { data, error } = await supabase
      .from('project_tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating task:', error);
    return { id: taskId, ...updates };
  }
}

export async function deleteTask(taskId) {
  try {
    const { error } = await supabase
      .from('project_tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    return true;
  }
}

export async function toggleTaskStatus(taskId, currentStatus) {
  const newStatus = currentStatus === 'completed' ? 'todo' : 'completed';
  const updates = {
    status: newStatus,
    completed_date: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null,
  };
  return updateTask(taskId, updates);
}

export async function updateChecklist(taskId, checklist) {
  return updateTask(taskId, { checklist });
}

export async function getTaskStats(projectId) {
  const tasks = await getTasks(projectId);
  return {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.status !== 'completed' && t.due_date && new Date(t.due_date) < new Date()).length,
    highPriority: tasks.filter(t => ['high', 'urgent'].includes(t.priority) && t.status !== 'completed').length,
  };
}

export default {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  updateChecklist,
  getTaskStats,
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TASK_STATUSES,
};
