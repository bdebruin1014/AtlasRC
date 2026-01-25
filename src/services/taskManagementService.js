// src/services/taskManagementService.js
// Task Management Service with Responsible Party and Workflow Integration

import { supabase, isDemoMode } from '@/lib/supabase';

/*
 * TASK MANAGEMENT SERVICE
 *
 * Handles:
 * 1. Task CRUD operations
 * 2. Responsible party assignment (internal users or external contacts)
 * 3. Workflow template task generation
 * 4. Milestone-task relationships
 * 5. Task status and progress tracking
 */

// Responsible Party Types
export const RESPONSIBLE_PARTY_TYPES = {
  INTERNAL_USER: 'internal_user',
  INTERNAL_TEAM: 'internal_team',
  EXTERNAL_CONTACT: 'external_contact',
};

// Task Categories
export const TASK_CATEGORIES = [
  { id: 'acquisition', label: 'Acquisition', color: 'blue' },
  { id: 'permitting', label: 'Permitting', color: 'purple' },
  { id: 'construction', label: 'Construction', color: 'orange' },
  { id: 'finance', label: 'Finance', color: 'green' },
  { id: 'sales', label: 'Sales', color: 'pink' },
  { id: 'admin', label: 'Administrative', color: 'gray' },
  { id: 'design', label: 'Design', color: 'indigo' },
  { id: 'due_diligence', label: 'Due Diligence', color: 'yellow' },
];

// Task Statuses
export const TASK_STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  REVIEW: 'review',
  COMPLETED: 'completed',
  BLOCKED: 'blocked',
  ON_HOLD: 'on-hold',
};

// Task Priorities
export const TASK_PRIORITIES = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

// Workflow Trigger Events
export const WORKFLOW_TRIGGER_EVENTS = [
  { id: 'project_created', name: 'Project Created', module: 'Opportunities' },
  { id: 'contract_executed', name: 'Contract Executed', module: 'Opportunities' },
  { id: 'due_diligence_complete', name: 'Due Diligence Complete', module: 'Opportunities' },
  { id: 'closing_complete', name: 'Closing Complete', module: 'Opportunities' },
  { id: 'permit_submitted', name: 'Permit Submitted', module: 'Permitting' },
  { id: 'permit_approved', name: 'Permit Approved', module: 'Permitting' },
  { id: 'construction_start', name: 'Construction Start', module: 'Construction' },
  { id: 'phase_complete', name: 'Construction Phase Complete', module: 'Construction' },
  { id: 'co_issued', name: 'Certificate of Occupancy Issued', module: 'Construction' },
  { id: 'listing_active', name: 'Listing Activated', module: 'Sales' },
  { id: 'under_contract', name: 'Unit Under Contract', module: 'Sales' },
  { id: 'sale_closed', name: 'Sale Closed', module: 'Sales' },
];

// Mock data for demo mode
const mockTasks = [];
const mockTemplates = [];

/**
 * Get all tasks for a project
 */
export async function getProjectTasks(projectId, filters = {}) {
  if (isDemoMode) {
    let tasks = mockTasks.filter(t => t.project_id === projectId);

    if (filters.status) tasks = tasks.filter(t => t.status === filters.status);
    if (filters.category) tasks = tasks.filter(t => t.category === filters.category);
    if (filters.responsiblePartyType) {
      tasks = tasks.filter(t => t.responsible_party_type === filters.responsiblePartyType);
    }
    if (filters.milestoneId) tasks = tasks.filter(t => t.milestone_id === filters.milestoneId);

    return tasks;
  }

  let query = supabase
    .from('project_tasks')
    .select(`
      *,
      milestone:milestones(id, name, due_date),
      internal_user:users(id, name, email, role),
      external_contact:project_contacts(id, first_name, last_name, company_name, email, phone, category)
    `)
    .eq('project_id', projectId);

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.category) query = query.eq('category', filters.category);
  if (filters.responsiblePartyType) query = query.eq('responsible_party_type', filters.responsiblePartyType);
  if (filters.milestoneId) query = query.eq('milestone_id', filters.milestoneId);

  const { data, error } = await query.order('due_date', { ascending: true });
  if (error) throw error;
  return data;
}

/**
 * Get all tasks across all projects (global view)
 */
export async function getAllTasks(filters = {}) {
  if (isDemoMode) {
    let tasks = [...mockTasks];
    if (filters.status) tasks = tasks.filter(t => t.status === filters.status);
    if (filters.module) tasks = tasks.filter(t => t.source_module === filters.module);
    if (filters.assignedToMe && filters.userId) {
      tasks = tasks.filter(t => t.responsible_party_id === filters.userId);
    }
    return tasks;
  }

  let query = supabase
    .from('project_tasks')
    .select(`
      *,
      project:projects(id, name, type),
      milestone:milestones(id, name, due_date),
      internal_user:users(id, name, email),
      external_contact:project_contacts(id, first_name, last_name, company_name)
    `);

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.module) query = query.eq('source_module', filters.module);

  const { data, error } = await query.order('due_date', { ascending: true });
  if (error) throw error;
  return data;
}

/**
 * Create a new task
 */
export async function createTask(taskData) {
  const task = {
    id: `task-${Date.now()}`,
    ...taskData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isDemoMode) {
    mockTasks.push(task);
    return task;
  }

  const { data, error } = await supabase
    .from('project_tasks')
    .insert([task])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a task
 */
export async function updateTask(taskId, updates) {
  if (isDemoMode) {
    const idx = mockTasks.findIndex(t => t.id === taskId);
    if (idx >= 0) {
      mockTasks[idx] = { ...mockTasks[idx], ...updates, updated_at: new Date().toISOString() };
      return mockTasks[idx];
    }
    return null;
  }

  const { data, error } = await supabase
    .from('project_tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a task
 */
export async function deleteTask(taskId) {
  if (isDemoMode) {
    const idx = mockTasks.findIndex(t => t.id === taskId);
    if (idx >= 0) mockTasks.splice(idx, 1);
    return true;
  }

  const { error } = await supabase
    .from('project_tasks')
    .delete()
    .eq('id', taskId);

  if (error) throw error;
  return true;
}

/**
 * Assign task to responsible party
 */
export async function assignTask(taskId, responsiblePartyType, responsiblePartyId) {
  return updateTask(taskId, {
    responsible_party_type: responsiblePartyType,
    responsible_party_id: responsiblePartyId,
  });
}

/**
 * Generate tasks from workflow template
 * Called when a trigger event fires
 */
export async function generateTasksFromTemplate(templateId, projectId, triggerDate, projectContacts = []) {
  // Get template
  const template = await getWorkflowTemplate(templateId);
  if (!template || !template.is_active) return [];

  const generatedTasks = [];

  for (const taskTemplate of template.tasks) {
    // Calculate due date
    const dueDate = new Date(triggerDate);
    dueDate.setDate(dueDate.getDate() + taskTemplate.days_from_trigger);

    // Resolve responsible party
    let responsiblePartyId = null;
    if (taskTemplate.responsible_party_type === RESPONSIBLE_PARTY_TYPES.EXTERNAL_CONTACT) {
      // Find project contact by category
      const contact = projectContacts.find(c => c.category === taskTemplate.responsible_party_role);
      responsiblePartyId = contact?.id || null;
    } else if (taskTemplate.responsible_party_type === RESPONSIBLE_PARTY_TYPES.INTERNAL_USER) {
      // Would look up internal user by role
      responsiblePartyId = taskTemplate.responsible_party_role;
    }

    const task = await createTask({
      project_id: projectId,
      title: taskTemplate.title,
      description: taskTemplate.description,
      category: taskTemplate.category,
      priority: taskTemplate.priority,
      status: TASK_STATUSES.TODO,
      due_date: dueDate.toISOString().split('T')[0],
      responsible_party_type: taskTemplate.responsible_party_type,
      responsible_party_id: responsiblePartyId,
      responsible_party_role: taskTemplate.responsible_party_role,
      source_module: 'workflow',
      source_template_id: templateId,
      source_template_name: template.name,
      trigger_event: template.trigger_event,
      trigger_date: triggerDate,
      milestone_id: taskTemplate.milestone_id || null,
    });

    generatedTasks.push(task);
  }

  return generatedTasks;
}

/**
 * Get workflow template by ID
 */
export async function getWorkflowTemplate(templateId) {
  if (isDemoMode) {
    return mockTemplates.find(t => t.id === templateId) || null;
  }

  const { data, error } = await supabase
    .from('workflow_templates')
    .select('*, tasks:workflow_template_tasks(*)')
    .eq('id', templateId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all workflow templates
 */
export async function getWorkflowTemplates(filters = {}) {
  if (isDemoMode) {
    let templates = [...mockTemplates];
    if (filters.projectType) templates = templates.filter(t => t.project_type === filters.projectType);
    if (filters.triggerEvent) templates = templates.filter(t => t.trigger_event === filters.triggerEvent);
    if (filters.isActive !== undefined) templates = templates.filter(t => t.is_active === filters.isActive);
    return templates;
  }

  let query = supabase
    .from('workflow_templates')
    .select('*, tasks:workflow_template_tasks(*)');

  if (filters.projectType) query = query.eq('project_type', filters.projectType);
  if (filters.triggerEvent) query = query.eq('trigger_event', filters.triggerEvent);
  if (filters.isActive !== undefined) query = query.eq('is_active', filters.isActive);

  const { data, error } = await query.order('name');
  if (error) throw error;
  return data;
}

/**
 * Fire a workflow trigger event
 * This should be called when module events occur
 */
export async function fireWorkflowTrigger(eventId, projectId, projectType, triggerDate, projectContacts = []) {
  // Get all active templates for this event and project type
  const templates = await getWorkflowTemplates({
    triggerEvent: eventId,
    projectType: projectType,
    isActive: true,
  });

  const allGeneratedTasks = [];

  for (const template of templates) {
    const tasks = await generateTasksFromTemplate(template.id, projectId, triggerDate, projectContacts);
    allGeneratedTasks.push(...tasks);
  }

  return allGeneratedTasks;
}

/**
 * Get task statistics for a project
 */
export async function getTaskStats(projectId) {
  const tasks = await getProjectTasks(projectId);

  return {
    total: tasks.length,
    todo: tasks.filter(t => t.status === TASK_STATUSES.TODO).length,
    inProgress: tasks.filter(t => t.status === TASK_STATUSES.IN_PROGRESS).length,
    completed: tasks.filter(t => t.status === TASK_STATUSES.COMPLETED).length,
    blocked: tasks.filter(t => t.status === TASK_STATUSES.BLOCKED).length,
    overdue: tasks.filter(t => t.status !== TASK_STATUSES.COMPLETED && new Date(t.due_date) < new Date()).length,
    internal: tasks.filter(t => t.responsible_party_type === RESPONSIBLE_PARTY_TYPES.INTERNAL_USER).length,
    external: tasks.filter(t => t.responsible_party_type === RESPONSIBLE_PARTY_TYPES.EXTERNAL_CONTACT).length,
    fromWorkflow: tasks.filter(t => t.source_module === 'workflow').length,
  };
}

/**
 * Get tasks by responsible party
 */
export async function getTasksByResponsibleParty(projectId) {
  const tasks = await getProjectTasks(projectId);

  const byParty = {};

  for (const task of tasks) {
    const key = `${task.responsible_party_type}:${task.responsible_party_id}`;
    if (!byParty[key]) {
      byParty[key] = {
        type: task.responsible_party_type,
        id: task.responsible_party_id,
        tasks: [],
      };
    }
    byParty[key].tasks.push(task);
  }

  return Object.values(byParty);
}

/**
 * Get tasks by milestone
 */
export async function getTasksByMilestone(projectId) {
  const tasks = await getProjectTasks(projectId);

  const byMilestone = {
    unassigned: [],
  };

  for (const task of tasks) {
    if (task.milestone_id) {
      if (!byMilestone[task.milestone_id]) {
        byMilestone[task.milestone_id] = [];
      }
      byMilestone[task.milestone_id].push(task);
    } else {
      byMilestone.unassigned.push(task);
    }
  }

  return byMilestone;
}

export default {
  RESPONSIBLE_PARTY_TYPES,
  TASK_CATEGORIES,
  TASK_STATUSES,
  TASK_PRIORITIES,
  WORKFLOW_TRIGGER_EVENTS,
  getProjectTasks,
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  assignTask,
  generateTasksFromTemplate,
  getWorkflowTemplate,
  getWorkflowTemplates,
  fireWorkflowTrigger,
  getTaskStats,
  getTasksByResponsibleParty,
  getTasksByMilestone,
};
