// src/services/notificationTriggerService.js
// Automated notification triggers — call these from UI actions/hooks
// when key events happen (stage changes, task assignments, milestones, etc.)
//
// Pattern: Supabase-first with demo/fallback (returns a mock notification
// object in the catch block so callers always get something back).

import { supabase } from '@/lib/supabase';

// ============================================
// 1. Stage Change
// ============================================

/**
 * Creates a notification when an opportunity changes pipeline stages.
 * Priority is 'high' when moving to "Under Contract", otherwise 'medium'.
 */
export async function notifyStageChange(opportunityId, opportunityName, oldStage, newStage, triggeredBy) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        type: 'stage_change',
        title: `Stage Changed: ${opportunityName}`,
        message: `Opportunity moved from ${oldStage} to ${newStage}`,
        priority: newStage === 'Under Contract' ? 'high' : 'medium',
        entity_type: 'opportunity',
        entity_id: opportunityId,
        triggered_by: triggeredBy,
        created_at: new Date().toISOString(),
        is_read: false,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('notifyStageChange error:', err);
    return {
      id: `notif-${Date.now()}`,
      type: 'stage_change',
      title: `Stage Changed: ${opportunityName}`,
      message: `Opportunity moved from ${oldStage} to ${newStage}`,
      priority: newStage === 'Under Contract' ? 'high' : 'medium',
      entity_type: 'opportunity',
      entity_id: opportunityId,
      triggered_by: triggeredBy,
      created_at: new Date().toISOString(),
      is_read: false,
    };
  }
}

// ============================================
// 2. Task Assigned
// ============================================

/**
 * Creates a notification when a task is assigned to a user.
 */
export async function notifyTaskAssigned(taskId, taskTitle, assignedTo, assignedBy) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        type: 'task_assigned',
        title: `Task Assigned: ${taskTitle}`,
        message: `You have been assigned a new task by ${assignedBy}`,
        priority: 'medium',
        entity_type: 'task',
        entity_id: taskId,
        triggered_by: assignedBy,
        assigned_to: assignedTo,
        created_at: new Date().toISOString(),
        is_read: false,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('notifyTaskAssigned error:', err);
    return {
      id: `notif-${Date.now()}`,
      type: 'task_assigned',
      title: `Task Assigned: ${taskTitle}`,
      message: `You have been assigned a new task by ${assignedBy}`,
      priority: 'medium',
      entity_type: 'task',
      entity_id: taskId,
      triggered_by: assignedBy,
      assigned_to: assignedTo,
      created_at: new Date().toISOString(),
      is_read: false,
    };
  }
}

// ============================================
// 3. Task Due Soon (within 24 hours)
// ============================================

/**
 * Creates a notification when a task is due within 24 hours.
 */
export async function notifyTaskDueSoon(taskId, taskTitle, dueDate, assignedTo) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        type: 'task_due_soon',
        title: `Task Due Soon: ${taskTitle}`,
        message: `Task "${taskTitle}" is due on ${new Date(dueDate).toLocaleDateString()}`,
        priority: 'high',
        entity_type: 'task',
        entity_id: taskId,
        assigned_to: assignedTo,
        created_at: new Date().toISOString(),
        is_read: false,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('notifyTaskDueSoon error:', err);
    return {
      id: `notif-${Date.now()}`,
      type: 'task_due_soon',
      title: `Task Due Soon: ${taskTitle}`,
      message: `Task "${taskTitle}" is due on ${new Date(dueDate).toLocaleDateString()}`,
      priority: 'high',
      entity_type: 'task',
      entity_id: taskId,
      assigned_to: assignedTo,
      created_at: new Date().toISOString(),
      is_read: false,
    };
  }
}

// ============================================
// 4. Task Overdue
// ============================================

/**
 * Creates a notification when a task is past its due date.
 */
export async function notifyTaskOverdue(taskId, taskTitle, dueDate, assignedTo) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        type: 'task_overdue',
        title: `Task Overdue: ${taskTitle}`,
        message: `Task "${taskTitle}" was due on ${new Date(dueDate).toLocaleDateString()} and is now overdue`,
        priority: 'urgent',
        entity_type: 'task',
        entity_id: taskId,
        assigned_to: assignedTo,
        created_at: new Date().toISOString(),
        is_read: false,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('notifyTaskOverdue error:', err);
    return {
      id: `notif-${Date.now()}`,
      type: 'task_overdue',
      title: `Task Overdue: ${taskTitle}`,
      message: `Task "${taskTitle}" was due on ${new Date(dueDate).toLocaleDateString()} and is now overdue`,
      priority: 'urgent',
      entity_type: 'task',
      entity_id: taskId,
      assigned_to: assignedTo,
      created_at: new Date().toISOString(),
      is_read: false,
    };
  }
}

// ============================================
// 5. Milestone Reached (Construction)
// ============================================

/**
 * Creates a notification when a construction house reaches a new milestone.
 */
export async function notifyMilestoneReached(houseId, houseName, milestone, projectId) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        type: 'milestone_complete',
        title: `Milestone Reached: ${houseName}`,
        message: `${houseName} has advanced to the "${milestone}" milestone`,
        priority: milestone === 'complete' ? 'high' : 'medium',
        entity_type: 'house',
        entity_id: houseId,
        project_id: projectId,
        created_at: new Date().toISOString(),
        is_read: false,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('notifyMilestoneReached error:', err);
    return {
      id: `notif-${Date.now()}`,
      type: 'milestone_complete',
      title: `Milestone Reached: ${houseName}`,
      message: `${houseName} has advanced to the "${milestone}" milestone`,
      priority: milestone === 'complete' ? 'high' : 'medium',
      entity_type: 'house',
      entity_id: houseId,
      project_id: projectId,
      created_at: new Date().toISOString(),
      is_read: false,
    };
  }
}

// ============================================
// 6. Due Diligence Item Overdue
// ============================================

/**
 * Creates a notification when a due-diligence item is past its due date.
 */
export async function notifyDueDiligenceOverdue(itemId, itemTitle, dueDate, projectId) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        type: 'dd_overdue',
        title: `DD Overdue: ${itemTitle}`,
        message: `Due-diligence item "${itemTitle}" was due on ${new Date(dueDate).toLocaleDateString()} and is now overdue`,
        priority: 'urgent',
        entity_type: 'due_diligence',
        entity_id: itemId,
        project_id: projectId,
        created_at: new Date().toISOString(),
        is_read: false,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('notifyDueDiligenceOverdue error:', err);
    return {
      id: `notif-${Date.now()}`,
      type: 'dd_overdue',
      title: `DD Overdue: ${itemTitle}`,
      message: `Due-diligence item "${itemTitle}" was due on ${new Date(dueDate).toLocaleDateString()} and is now overdue`,
      priority: 'urgent',
      entity_type: 'due_diligence',
      entity_id: itemId,
      project_id: projectId,
      created_at: new Date().toISOString(),
      is_read: false,
    };
  }
}

// ============================================
// 7. Opportunity Created
// ============================================

/**
 * Creates a notification when a new opportunity is added to the pipeline.
 */
export async function notifyOpportunityCreated(opportunityId, name, type, createdBy) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        type: 'opportunity_created',
        title: `New Opportunity: ${name}`,
        message: `A new ${type || 'opportunity'} "${name}" has been created by ${createdBy}`,
        priority: 'normal',
        entity_type: 'opportunity',
        entity_id: opportunityId,
        triggered_by: createdBy,
        created_at: new Date().toISOString(),
        is_read: false,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('notifyOpportunityCreated error:', err);
    return {
      id: `notif-${Date.now()}`,
      type: 'opportunity_created',
      title: `New Opportunity: ${name}`,
      message: `A new ${type || 'opportunity'} "${name}" has been created by ${createdBy}`,
      priority: 'normal',
      entity_type: 'opportunity',
      entity_id: opportunityId,
      triggered_by: createdBy,
      created_at: new Date().toISOString(),
      is_read: false,
    };
  }
}

// ============================================
// 8. Project Created
// ============================================

/**
 * Creates a notification when a new project is created.
 */
export async function notifyProjectCreated(projectId, name, type, createdBy) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        type: 'project_created',
        title: `New Project: ${name}`,
        message: `A new ${type || 'project'} "${name}" has been created by ${createdBy}`,
        priority: 'normal',
        entity_type: 'project',
        entity_id: projectId,
        triggered_by: createdBy,
        created_at: new Date().toISOString(),
        is_read: false,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('notifyProjectCreated error:', err);
    return {
      id: `notif-${Date.now()}`,
      type: 'project_created',
      title: `New Project: ${name}`,
      message: `A new ${type || 'project'} "${name}" has been created by ${createdBy}`,
      priority: 'normal',
      entity_type: 'project',
      entity_id: projectId,
      triggered_by: createdBy,
      created_at: new Date().toISOString(),
      is_read: false,
    };
  }
}

// ============================================
// 9. Batch: Check Due-Date Alerts
// ============================================

/**
 * Batch function that queries all tasks and due-diligence items for
 * upcoming (within 24 hours) and overdue dates, then creates the
 * appropriate notifications.
 *
 * Returns { dueSoon: [...], overdue: [...] } arrays of created notifications.
 */
export async function checkDueDateAlerts() {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const results = { dueSoon: [], overdue: [] };

  // --- Tasks -----------------------------------------------------------
  try {
    // Fetch tasks that are not yet completed and have a due date
    const { data: tasks, error: taskError } = await supabase
      .from('tasks')
      .select('id, title, due_date, assigned_to')
      .not('status', 'eq', 'completed')
      .not('due_date', 'is', null);

    if (taskError) throw taskError;

    for (const task of (tasks || [])) {
      const due = new Date(task.due_date);

      if (due < now) {
        // Overdue
        const notif = await notifyTaskOverdue(task.id, task.title, task.due_date, task.assigned_to);
        results.overdue.push(notif);
      } else if (due <= in24h) {
        // Due within 24 hours
        const notif = await notifyTaskDueSoon(task.id, task.title, task.due_date, task.assigned_to);
        results.dueSoon.push(notif);
      }
    }
  } catch (err) {
    console.error('checkDueDateAlerts — tasks error:', err);
    // Demo fallback: return empty arrays (no tasks table in demo)
  }

  // --- Due-Diligence Items ---------------------------------------------
  try {
    const { data: ddItems, error: ddError } = await supabase
      .from('due_diligence_items')
      .select('id, title, due_date, project_id')
      .not('status', 'eq', 'completed')
      .not('due_date', 'is', null);

    if (ddError) throw ddError;

    for (const item of (ddItems || [])) {
      const due = new Date(item.due_date);

      if (due < now) {
        const notif = await notifyDueDiligenceOverdue(item.id, item.title, item.due_date, item.project_id);
        results.overdue.push(notif);
      }
      // DD items only fire overdue notifications (no "due soon" for DD)
    }
  } catch (err) {
    console.error('checkDueDateAlerts — due_diligence_items error:', err);
    // Demo fallback: return empty arrays
  }

  return results;
}

// ============================================
// Default export
// ============================================

export default {
  notifyStageChange,
  notifyTaskAssigned,
  notifyTaskDueSoon,
  notifyTaskOverdue,
  notifyMilestoneReached,
  notifyDueDiligenceOverdue,
  notifyOpportunityCreated,
  notifyProjectCreated,
  checkDueDateAlerts,
};
