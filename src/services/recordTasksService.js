// src/services/recordTasksService.js
// Record Tasks Service — manages tasks attached to specific records across any module.
// Supports ad-hoc task creation and workflow template application.

import { supabase } from '@/lib/supabase';
import { getTemplateById } from '@/services/workflowTemplateService';

// ============================================
// CONSTANTS
// ============================================

export const TASK_STATUSES = [
  { id: 'todo', label: 'To Do', icon: 'circle', color: 'text-gray-400' },
  { id: 'in-progress', label: 'In Progress', icon: 'clock', color: 'text-blue-500' },
  { id: 'completed', label: 'Completed', icon: 'check-circle', color: 'text-green-500' },
];

export const TASK_PRIORITIES = [
  { id: 'low', label: 'Low', color: 'text-gray-500', bgColor: 'bg-gray-100 text-gray-700' },
  { id: 'medium', label: 'Medium', color: 'text-blue-500', bgColor: 'bg-blue-100 text-blue-700' },
  { id: 'high', label: 'High', color: 'text-amber-500', bgColor: 'bg-amber-100 text-amber-700' },
  { id: 'urgent', label: 'Urgent', color: 'text-red-500', bgColor: 'bg-red-100 text-red-700' },
];

// ============================================
// MOCK DATA (fallback for demo mode)
// ============================================

let mockRecordTasks = [
  // --- Opportunities (record_id: 'demo') ---
  {
    id: 'rt-opp-1',
    module: 'opportunities',
    record_id: 'demo',
    title: 'Order title search',
    description: 'Contact title company and order a full title search and commitment for the property.',
    status: 'completed',
    priority: 'high',
    category: 'due-diligence',
    assigned_to: 'Bryan De Bruin',
    assigned_role: null,
    due_date: '2026-02-08',
    completed_date: '2026-02-07',
    completed_by: null,
    sort_order: 1,
    source_template_id: null,
    source_template_name: null,
    source_group_id: null,
    source_group_name: null,
    source_milestone_id: null,
    source_milestone_name: null,
    is_required: false,
    checklist: null,
    notes: null,
    created_by: null,
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-02-07T15:30:00Z',
  },
  {
    id: 'rt-opp-2',
    module: 'opportunities',
    record_id: 'demo',
    title: 'Schedule property inspection',
    description: 'Coordinate with licensed inspector to conduct a full property inspection before the contingency deadline.',
    status: 'in-progress',
    priority: 'urgent',
    category: 'inspection',
    assigned_to: 'Mike Williams',
    assigned_role: null,
    due_date: '2026-02-18',
    completed_date: null,
    completed_by: null,
    sort_order: 2,
    source_template_id: null,
    source_template_name: null,
    source_group_id: null,
    source_group_name: null,
    source_milestone_id: null,
    source_milestone_name: null,
    is_required: true,
    checklist: [
      { text: 'Confirm inspector availability', done: true },
      { text: 'Send property access instructions', done: false },
      { text: 'Review inspection report', done: false },
    ],
    notes: 'Inspector confirmed for Feb 17 morning slot.',
    created_by: null,
    created_at: '2026-02-02T09:00:00Z',
    updated_at: '2026-02-10T11:00:00Z',
  },
  {
    id: 'rt-opp-3',
    module: 'opportunities',
    record_id: 'demo',
    title: 'Submit earnest money deposit',
    description: 'Wire earnest money to the escrow agent within 3 business days of contract execution.',
    status: 'todo',
    priority: 'high',
    category: 'finance',
    assigned_to: 'Bryan De Bruin',
    assigned_role: null,
    due_date: '2026-02-22',
    completed_date: null,
    completed_by: null,
    sort_order: 3,
    source_template_id: null,
    source_template_name: null,
    source_group_id: null,
    source_group_name: null,
    source_milestone_id: null,
    source_milestone_name: null,
    is_required: true,
    checklist: null,
    notes: null,
    created_by: null,
    created_at: '2026-02-03T14:00:00Z',
    updated_at: '2026-02-03T14:00:00Z',
  },
  {
    id: 'rt-opp-4',
    module: 'opportunities',
    record_id: 'demo',
    title: 'Review purchase contract with attorney',
    description: 'Send executed contract to real estate attorney for legal review and flag any concerning clauses.',
    status: 'todo',
    priority: 'medium',
    category: 'legal',
    assigned_to: 'Jennifer Taylor',
    assigned_role: null,
    due_date: '2026-03-01',
    completed_date: null,
    completed_by: null,
    sort_order: 4,
    source_template_id: null,
    source_template_name: null,
    source_group_id: null,
    source_group_name: null,
    source_milestone_id: null,
    source_milestone_name: null,
    is_required: false,
    checklist: [
      { text: 'Email contract to attorney', done: false },
      { text: 'Confirm contingency dates are correct', done: false },
    ],
    notes: null,
    created_by: null,
    created_at: '2026-02-04T08:00:00Z',
    updated_at: '2026-02-04T08:00:00Z',
  },

  // --- Projects (record_id: 'demo') ---
  {
    id: 'rt-proj-1',
    module: 'projects',
    record_id: 'demo',
    title: 'Complete preliminary budget review',
    description: 'Review the preliminary construction budget with the project manager and flag any line items over 10% of comparable projects.',
    status: 'in-progress',
    priority: 'high',
    category: 'finance',
    assigned_to: 'Bryan De Bruin',
    assigned_role: 'Project Manager',
    due_date: '2026-02-20',
    completed_date: null,
    completed_by: null,
    sort_order: 1,
    source_template_id: null,
    source_template_name: null,
    source_group_id: null,
    source_group_name: null,
    source_milestone_id: null,
    source_milestone_name: null,
    is_required: true,
    checklist: [
      { text: 'Pull comparable project budgets', done: true },
      { text: 'Compare line items side-by-side', done: false },
      { text: 'Flag variances over 10%', done: false },
    ],
    notes: null,
    created_by: null,
    created_at: '2026-02-05T09:00:00Z',
    updated_at: '2026-02-12T10:00:00Z',
  },
  {
    id: 'rt-proj-2',
    module: 'projects',
    record_id: 'demo',
    title: 'Update master schedule with new subcontractor dates',
    description: 'Coordinate with framing and electrical subs to confirm availability and update the master project schedule.',
    status: 'todo',
    priority: 'medium',
    category: 'construction',
    assigned_to: 'Mike Williams',
    assigned_role: 'Superintendent',
    due_date: '2026-02-25',
    completed_date: null,
    completed_by: null,
    sort_order: 2,
    source_template_id: null,
    source_template_name: null,
    source_group_id: null,
    source_group_name: null,
    source_milestone_id: null,
    source_milestone_name: null,
    is_required: false,
    checklist: null,
    notes: null,
    created_by: null,
    created_at: '2026-02-06T11:00:00Z',
    updated_at: '2026-02-06T11:00:00Z',
  },
  {
    id: 'rt-proj-3',
    module: 'projects',
    record_id: 'demo',
    title: 'Follow up on building permit status',
    description: 'Contact the city planning office to check on the status of the building permit application submitted two weeks ago.',
    status: 'todo',
    priority: 'urgent',
    category: 'permitting',
    assigned_to: 'Jennifer Taylor',
    assigned_role: null,
    due_date: '2026-02-16',
    completed_date: null,
    completed_by: null,
    sort_order: 3,
    source_template_id: null,
    source_template_name: null,
    source_group_id: null,
    source_group_name: null,
    source_milestone_id: null,
    source_milestone_name: null,
    is_required: true,
    checklist: null,
    notes: 'Permit number: BP-2026-04412',
    created_by: null,
    created_at: '2026-02-07T08:00:00Z',
    updated_at: '2026-02-07T08:00:00Z',
  },

  // --- Construction (record_id: 'demo') ---
  {
    id: 'rt-con-1',
    module: 'construction',
    record_id: 'demo',
    title: 'Schedule framing inspection',
    description: 'Framing is complete on Lot 12. Call the building department to schedule the framing rough-in inspection.',
    status: 'in-progress',
    priority: 'high',
    category: 'inspection',
    assigned_to: 'Mike Williams',
    assigned_role: 'Superintendent',
    due_date: '2026-02-17',
    completed_date: null,
    completed_by: null,
    sort_order: 1,
    source_template_id: null,
    source_template_name: null,
    source_group_id: null,
    source_group_name: null,
    source_milestone_id: null,
    source_milestone_name: null,
    is_required: true,
    checklist: [
      { text: 'Verify all framing complete', done: true },
      { text: 'Check nailing schedule', done: true },
      { text: 'Call building dept for appointment', done: false },
    ],
    notes: null,
    created_by: null,
    created_at: '2026-02-08T07:00:00Z',
    updated_at: '2026-02-13T09:00:00Z',
  },
  {
    id: 'rt-con-2',
    module: 'construction',
    record_id: 'demo',
    title: 'Order kitchen appliances',
    description: 'Place the order for the kitchen appliance package. Confirm 4-week lead time with the supplier.',
    status: 'todo',
    priority: 'medium',
    category: 'procurement',
    assigned_to: 'Bryan De Bruin',
    assigned_role: null,
    due_date: '2026-03-01',
    completed_date: null,
    completed_by: null,
    sort_order: 2,
    source_template_id: null,
    source_template_name: null,
    source_group_id: null,
    source_group_name: null,
    source_milestone_id: null,
    source_milestone_name: null,
    is_required: false,
    checklist: [
      { text: 'Confirm model numbers with designer', done: false },
      { text: 'Get delivery date estimate', done: false },
    ],
    notes: 'Supplier: Home Pro Appliances, Rep: Sarah K.',
    created_by: null,
    created_at: '2026-02-09T10:00:00Z',
    updated_at: '2026-02-09T10:00:00Z',
  },
  {
    id: 'rt-con-3',
    module: 'construction',
    record_id: 'demo',
    title: 'Foundation compaction test review',
    description: 'Review the geotechnical compaction test results for the foundation and confirm soil bearing capacity meets structural requirements.',
    status: 'completed',
    priority: 'high',
    category: 'inspection',
    assigned_to: 'Mike Williams',
    assigned_role: 'Superintendent',
    due_date: '2026-02-10',
    completed_date: '2026-02-09',
    completed_by: null,
    sort_order: 3,
    source_template_id: null,
    source_template_name: null,
    source_group_id: null,
    source_group_name: null,
    source_milestone_id: null,
    source_milestone_name: null,
    is_required: true,
    checklist: null,
    notes: 'Results: 2,500 PSF bearing capacity — meets structural spec.',
    created_by: null,
    created_at: '2026-02-03T08:00:00Z',
    updated_at: '2026-02-09T16:00:00Z',
  },

  // --- Accounting (record_id: 'demo') ---
  {
    id: 'rt-acct-1',
    module: 'accounting',
    record_id: 'demo',
    title: 'Setup chart of accounts for new entity',
    description: 'Create the chart of accounts for the newly formed LLC using the standard real estate developer template.',
    status: 'in-progress',
    priority: 'high',
    category: 'setup',
    assigned_to: 'Jennifer Taylor',
    assigned_role: 'Controller',
    due_date: '2026-02-19',
    completed_date: null,
    completed_by: null,
    sort_order: 1,
    source_template_id: null,
    source_template_name: null,
    source_group_id: null,
    source_group_name: null,
    source_milestone_id: null,
    source_milestone_name: null,
    is_required: true,
    checklist: [
      { text: 'Import COA template', done: true },
      { text: 'Customize for entity type', done: false },
      { text: 'Map to consolidated parent', done: false },
    ],
    notes: null,
    created_by: null,
    created_at: '2026-02-05T13:00:00Z',
    updated_at: '2026-02-11T09:00:00Z',
  },
  {
    id: 'rt-acct-2',
    module: 'accounting',
    record_id: 'demo',
    title: 'File annual report with Secretary of State',
    description: 'Prepare and file the annual report for the entity. Deadline is end of February.',
    status: 'todo',
    priority: 'urgent',
    category: 'compliance',
    assigned_to: 'Bryan De Bruin',
    assigned_role: null,
    due_date: '2026-02-28',
    completed_date: null,
    completed_by: null,
    sort_order: 2,
    source_template_id: null,
    source_template_name: null,
    source_group_id: null,
    source_group_name: null,
    source_milestone_id: null,
    source_milestone_name: null,
    is_required: true,
    checklist: null,
    notes: 'Filing fee: $138.75',
    created_by: null,
    created_at: '2026-02-06T10:00:00Z',
    updated_at: '2026-02-06T10:00:00Z',
  },
  {
    id: 'rt-acct-3',
    module: 'accounting',
    record_id: 'demo',
    title: 'Complete January bank reconciliation',
    description: 'Reconcile all bank accounts for January. Match cleared transactions and investigate any outstanding items over 30 days.',
    status: 'todo',
    priority: 'medium',
    category: 'reconciliation',
    assigned_to: 'Jennifer Taylor',
    assigned_role: 'Controller',
    due_date: '2026-02-20',
    completed_date: null,
    completed_by: null,
    sort_order: 3,
    source_template_id: null,
    source_template_name: null,
    source_group_id: null,
    source_group_name: null,
    source_milestone_id: null,
    source_milestone_name: null,
    is_required: false,
    checklist: [
      { text: 'Download January bank statements', done: false },
      { text: 'Match cleared transactions', done: false },
      { text: 'Investigate outstanding checks > 30 days', done: false },
      { text: 'Post adjusting entries', done: false },
    ],
    notes: null,
    created_by: null,
    created_at: '2026-02-07T11:00:00Z',
    updated_at: '2026-02-07T11:00:00Z',
  },
];

let mockWorkflowInstances = [
  {
    id: 'rwi-1',
    module: 'opportunities',
    record_id: 'demo',
    template_id: 'tpl-acq-standard',
    template_name: 'Standard Acquisition Workflow',
    applied_at: '2026-02-01T10:00:00Z',
    applied_by: null,
    start_date: '2026-02-01',
    total_tasks: 8,
    completed_tasks: 3,
  },
  {
    id: 'rwi-2',
    module: 'projects',
    record_id: 'demo',
    template_id: 'tpl-pre-con',
    template_name: 'Pre-Construction Checklist',
    applied_at: '2026-02-05T09:00:00Z',
    applied_by: null,
    start_date: '2026-02-05',
    total_tasks: 12,
    completed_tasks: 5,
  },
];

// ============================================
// HELPER — filter mock tasks
// ============================================

function filterMockTasks(tasks, filters = {}) {
  let result = [...tasks];
  if (filters.status && filters.status !== 'all') {
    result = result.filter(t => t.status === filters.status);
  }
  if (filters.category && filters.category !== 'all') {
    result = result.filter(t => t.category === filters.category);
  }
  if (filters.priority && filters.priority !== 'all') {
    result = result.filter(t => t.priority === filters.priority);
  }
  // Sort by sort_order first, then due_date
  result.sort((a, b) => {
    if ((a.sort_order || 0) !== (b.sort_order || 0)) {
      return (a.sort_order || 0) - (b.sort_order || 0);
    }
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date) - new Date(b.due_date);
  });
  return result;
}

// ============================================
// TASK CRUD OPERATIONS
// ============================================

/**
 * Get all tasks for a specific record, with optional filters.
 * @param {string} module - 'opportunities' | 'projects' | 'construction' | 'accounting'
 * @param {string} recordId - UUID of the record
 * @param {object} filters - optional { status, category, priority }
 * @returns {Promise<Array>}
 */
export async function getRecordTasks(module, recordId, filters = {}) {
  try {
    let query = supabase
      .from('record_tasks')
      .select('*')
      .eq('module', module)
      .eq('record_id', recordId)
      .order('sort_order', { ascending: true })
      .order('due_date', { ascending: true, nullsFirst: false });

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }
    if (filters.priority && filters.priority !== 'all') {
      query = query.eq('priority', filters.priority);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching record tasks:', error);
    const moduleTasks = mockRecordTasks.filter(
      t => t.module === module && t.record_id === recordId
    );
    return filterMockTasks(moduleTasks, filters);
  }
}

/**
 * Create an ad-hoc task on a record.
 * @param {string} module
 * @param {string} recordId
 * @param {object} taskData
 * @returns {Promise<object>}
 */
export async function createRecordTask(module, recordId, taskData) {
  try {
    const now = new Date().toISOString();
    const payload = {
      ...taskData,
      module,
      record_id: recordId,
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      sort_order: taskData.sort_order || 0,
      is_required: taskData.is_required || false,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from('record_tasks')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating record task:', error);
    const now = new Date().toISOString();
    const newTask = {
      id: `rt-${Date.now()}`,
      module,
      record_id: recordId,
      status: 'todo',
      priority: 'medium',
      sort_order: 0,
      is_required: false,
      source_template_id: null,
      source_template_name: null,
      source_group_id: null,
      source_group_name: null,
      source_milestone_id: null,
      source_milestone_name: null,
      checklist: null,
      notes: null,
      completed_date: null,
      completed_by: null,
      created_by: null,
      created_at: now,
      updated_at: now,
      ...taskData,
      module,
      record_id: recordId,
    };
    mockRecordTasks.push(newTask);
    return newTask;
  }
}

/**
 * Update an existing task.
 * @param {string} taskId
 * @param {object} updates
 * @returns {Promise<object>}
 */
export async function updateRecordTask(taskId, updates) {
  try {
    const { data, error } = await supabase
      .from('record_tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating record task:', error);
    const idx = mockRecordTasks.findIndex(t => t.id === taskId);
    if (idx >= 0) {
      mockRecordTasks[idx] = {
        ...mockRecordTasks[idx],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return mockRecordTasks[idx];
    }
    return { id: taskId, ...updates };
  }
}

/**
 * Delete a task.
 * @param {string} taskId
 * @returns {Promise<boolean>}
 */
export async function deleteRecordTask(taskId) {
  try {
    const { error } = await supabase
      .from('record_tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting record task:', error);
    const idx = mockRecordTasks.findIndex(t => t.id === taskId);
    if (idx >= 0) {
      mockRecordTasks.splice(idx, 1);
    }
    return true;
  }
}

/**
 * Toggle a task between 'todo' and 'completed'.
 * Sets completed_date when completing, clears it when reverting.
 * @param {string} taskId
 * @param {string} currentStatus
 * @returns {Promise<object>}
 */
export async function toggleRecordTask(taskId, currentStatus) {
  const newStatus = currentStatus === 'completed' ? 'todo' : 'completed';
  const updates = {
    status: newStatus,
    completed_date: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null,
    completed_by: newStatus === 'completed' ? (await getCurrentUserId()) : null,
  };
  return updateRecordTask(taskId, updates);
}

/**
 * Get task statistics for a record.
 * @param {string} module
 * @param {string} recordId
 * @returns {Promise<object>} { total, todo, inProgress, completed, overdue }
 */
export async function getRecordTaskStats(module, recordId) {
  const tasks = await getRecordTasks(module, recordId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t =>
      t.status !== 'completed' && t.due_date && new Date(t.due_date) < today
    ).length,
  };
}

// ============================================
// WORKFLOW APPLICATION
// ============================================

/**
 * Apply a workflow template to a record.
 * Fetches the template, creates a workflow instance record, and creates
 * all template tasks as live tasks on the record with calculated due dates.
 *
 * @param {string} module
 * @param {string} recordId
 * @param {string} templateId
 * @param {string} startDate - anchor date string (YYYY-MM-DD) for offset calculations
 * @returns {Promise<object>} { instance, tasks }
 */
export async function applyWorkflowToRecord(module, recordId, templateId, startDate) {
  // 1. Fetch the workflow template
  let template;
  try {
    template = await getTemplateById(templateId);
  } catch (err) {
    console.error('Error fetching workflow template:', err);
    template = null;
  }

  if (!template) {
    throw new Error(`Workflow template not found: ${templateId}`);
  }

  const templateTasks = template.tasks || [];
  const templateGroups = template.groups || [];
  const templateMilestones = template.milestones || [];

  // Build lookup maps for groups and milestones
  const groupMap = {};
  for (const group of templateGroups) {
    groupMap[group.id] = group;
  }
  const milestoneMap = {};
  for (const milestone of templateMilestones) {
    milestoneMap[milestone.id] = milestone;
  }

  // 2. Create the workflow instance record
  const now = new Date().toISOString();
  let instance;

  try {
    const instancePayload = {
      module,
      record_id: recordId,
      template_id: templateId,
      template_name: template.name,
      applied_at: now,
      applied_by: await getCurrentUserId(),
      start_date: startDate,
      total_tasks: templateTasks.length,
      completed_tasks: 0,
    };

    const { data, error } = await supabase
      .from('record_workflow_instances')
      .insert(instancePayload)
      .select()
      .single();

    if (error) throw error;
    instance = data;
  } catch (error) {
    console.error('Error creating workflow instance:', error);
    instance = {
      id: `rwi-${Date.now()}`,
      module,
      record_id: recordId,
      template_id: templateId,
      template_name: template.name,
      applied_at: now,
      applied_by: null,
      start_date: startDate,
      total_tasks: templateTasks.length,
      completed_tasks: 0,
    };
    mockWorkflowInstances.push(instance);
  }

  // 3. Create all tasks from the template
  const createdTasks = [];
  const anchorDate = new Date(startDate);

  for (let i = 0; i < templateTasks.length; i++) {
    const tplTask = templateTasks[i];

    // Calculate due_date from startDate + offset_days
    let dueDate = null;
    if (tplTask.offset_days !== undefined && tplTask.offset_days !== null) {
      const d = new Date(anchorDate);
      d.setDate(d.getDate() + tplTask.offset_days);
      dueDate = d.toISOString().split('T')[0];
    }

    // Resolve group and milestone names
    const group = tplTask.group_id ? groupMap[tplTask.group_id] : null;
    const milestone = tplTask.milestone_id ? milestoneMap[tplTask.milestone_id] : null;

    const taskData = {
      title: tplTask.title || tplTask.name || 'Untitled Task',
      description: tplTask.description || '',
      status: 'todo',
      priority: tplTask.priority || 'medium',
      category: tplTask.category || null,
      assigned_to: tplTask.assigned_to || null,
      assigned_role: tplTask.assigned_role || null,
      due_date: dueDate,
      completed_date: null,
      completed_by: null,
      sort_order: tplTask.sort_order || i + 1,
      source_template_id: templateId,
      source_template_name: template.name,
      source_group_id: tplTask.group_id || null,
      source_group_name: group ? (group.name || group.title) : null,
      source_milestone_id: tplTask.milestone_id || null,
      source_milestone_name: milestone ? (milestone.name || milestone.title) : null,
      is_required: tplTask.is_required || false,
      checklist: tplTask.checklist || null,
      notes: tplTask.notes || null,
    };

    const created = await createRecordTask(module, recordId, taskData);
    createdTasks.push(created);
  }

  return { instance, tasks: createdTasks };
}

/**
 * Get all workflow instances applied to a record.
 * @param {string} module
 * @param {string} recordId
 * @returns {Promise<Array>}
 */
export async function getRecordWorkflowInstances(module, recordId) {
  try {
    const { data, error } = await supabase
      .from('record_workflow_instances')
      .select('*')
      .eq('module', module)
      .eq('record_id', recordId)
      .order('applied_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching workflow instances:', error);
    return mockWorkflowInstances.filter(
      i => i.module === module && i.record_id === recordId
    );
  }
}

/**
 * Remove a workflow instance and all its associated tasks.
 * Deletes tasks by matching source_template_id against the instance's template_id.
 * @param {string} instanceId
 * @returns {Promise<boolean>}
 */
export async function removeWorkflowInstance(instanceId) {
  try {
    // First, fetch the instance to get the template_id and record scope
    const { data: instance, error: fetchError } = await supabase
      .from('record_workflow_instances')
      .select('*')
      .eq('id', instanceId)
      .single();

    if (fetchError) throw fetchError;

    // Delete all tasks that came from this template on this record
    const { error: tasksError } = await supabase
      .from('record_tasks')
      .delete()
      .eq('module', instance.module)
      .eq('record_id', instance.record_id)
      .eq('source_template_id', instance.template_id);

    if (tasksError) throw tasksError;

    // Delete the instance itself
    const { error: instanceError } = await supabase
      .from('record_workflow_instances')
      .delete()
      .eq('id', instanceId);

    if (instanceError) throw instanceError;
    return true;
  } catch (error) {
    console.error('Error removing workflow instance:', error);
    // Demo fallback: find instance and remove matching tasks
    const instIdx = mockWorkflowInstances.findIndex(i => i.id === instanceId);
    if (instIdx >= 0) {
      const instance = mockWorkflowInstances[instIdx];
      mockRecordTasks = mockRecordTasks.filter(
        t => !(
          t.module === instance.module &&
          t.record_id === instance.record_id &&
          t.source_template_id === instance.template_id
        )
      );
      mockWorkflowInstances.splice(instIdx, 1);
    }
    return true;
  }
}

/**
 * Get progress for a specific workflow instance.
 * @param {string} instanceId
 * @returns {Promise<object>} { total, completed, percentage }
 */
export async function getWorkflowProgress(instanceId) {
  try {
    // Fetch the instance
    const { data: instance, error: fetchError } = await supabase
      .from('record_workflow_instances')
      .select('*')
      .eq('id', instanceId)
      .single();

    if (fetchError) throw fetchError;

    // Count tasks for this template on this record
    const { data: tasks, error: tasksError } = await supabase
      .from('record_tasks')
      .select('id, status')
      .eq('module', instance.module)
      .eq('record_id', instance.record_id)
      .eq('source_template_id', instance.template_id);

    if (tasksError) throw tasksError;

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, percentage };
  } catch (error) {
    console.error('Error getting workflow progress:', error);
    // Demo fallback
    const instance = mockWorkflowInstances.find(i => i.id === instanceId);
    if (instance) {
      const tasks = mockRecordTasks.filter(
        t =>
          t.module === instance.module &&
          t.record_id === instance.record_id &&
          t.source_template_id === instance.template_id
      );
      const total = tasks.length || instance.total_tasks || 0;
      const completed = tasks.length > 0
        ? tasks.filter(t => t.status === 'completed').length
        : instance.completed_tasks || 0;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { total, completed, percentage };
    }
    return { total: 0, completed: 0, percentage: 0 };
  }
}

// ============================================
// CHECKLIST OPERATIONS
// ============================================

/**
 * Update the embedded checklist JSON on a task.
 * @param {string} taskId
 * @param {Array} checklist - [{text: string, done: boolean}]
 * @returns {Promise<object>}
 */
export async function updateTaskChecklist(taskId, checklist) {
  return updateRecordTask(taskId, { checklist });
}

// ============================================
// INTERNAL HELPERS
// ============================================

/**
 * Attempt to get the current authenticated user ID from Supabase.
 * Returns null on failure (e.g. demo mode).
 */
async function getCurrentUserId() {
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id || null;
  } catch {
    return null;
  }
}

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
  TASK_STATUSES,
  TASK_PRIORITIES,
  getRecordTasks,
  createRecordTask,
  updateRecordTask,
  deleteRecordTask,
  toggleRecordTask,
  getRecordTaskStats,
  applyWorkflowToRecord,
  getRecordWorkflowInstances,
  removeWorkflowInstance,
  getWorkflowProgress,
  updateTaskChecklist,
};
