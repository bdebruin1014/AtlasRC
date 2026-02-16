// src/services/stageTaskService.js
// CRUD service for opportunity stage tasks (persistent per-stage checklists)

import { supabase, isDemoMode } from '@/lib/supabase';

// Mock task data matching the seed templates from 20260216_opportunity_enhancements.sql
const mockTemplates = [
  // PROSPECTING
  { stage: 'Prospecting', task_text: 'Property details verified in county records', is_required: true, display_order: 1 },
  { stage: 'Prospecting', task_text: 'Ownership confirmed (who is on title)', is_required: true, display_order: 2 },
  { stage: 'Prospecting', task_text: 'Initial skip trace completed', is_required: false, display_order: 3 },
  { stage: 'Prospecting', task_text: 'Comparable sales pulled (6 months, 0.5 mile)', is_required: true, display_order: 4 },
  { stage: 'Prospecting', task_text: 'Drive-by property inspection done', is_required: false, display_order: 5 },
  { stage: 'Prospecting', task_text: 'Estimated value determined', is_required: true, display_order: 6 },
  { stage: 'Prospecting', task_text: 'Mail piece / marketing sent', is_required: false, display_order: 7 },

  // CONTACTED
  { stage: 'Contacted', task_text: 'Initial contact made (call/text/door knock)', is_required: true, display_order: 1 },
  { stage: 'Contacted', task_text: 'Seller motivation discussed and rated', is_required: true, display_order: 2 },
  { stage: 'Contacted', task_text: 'Property condition assessed (seller description)', is_required: false, display_order: 3 },
  { stage: 'Contacted', task_text: 'Seller asking price obtained', is_required: true, display_order: 4 },
  { stage: 'Contacted', task_text: 'Timeline to sell established', is_required: false, display_order: 5 },
  { stage: 'Contacted', task_text: 'Follow-up date scheduled', is_required: true, display_order: 6 },
  { stage: 'Contacted', task_text: 'Added to CRM follow-up sequence', is_required: false, display_order: 7 },

  // QUALIFIED
  { stage: 'Qualified', task_text: 'Seller motivation confirmed (score >= 6)', is_required: true, display_order: 1 },
  { stage: 'Qualified', task_text: 'Price expectations are within range', is_required: true, display_order: 2 },
  { stage: 'Qualified', task_text: 'Property meets investment criteria', is_required: true, display_order: 3 },
  { stage: 'Qualified', task_text: 'Preliminary title check (no major liens)', is_required: false, display_order: 4 },
  { stage: 'Qualified', task_text: 'MAO calculated (70% rule or build analysis)', is_required: true, display_order: 5 },
  { stage: 'Qualified', task_text: 'Comparable analysis completed', is_required: true, display_order: 6 },
  { stage: 'Qualified', task_text: 'Exit strategy determined (wholesale/flip/develop/hold)', is_required: true, display_order: 7 },
  { stage: 'Qualified', task_text: 'Offer prepared', is_required: false, display_order: 8 },

  // NEGOTIATING
  { stage: 'Negotiating', task_text: 'Initial offer presented to seller', is_required: true, display_order: 1 },
  { stage: 'Negotiating', task_text: 'Offer follow-up call made', is_required: false, display_order: 2 },
  { stage: 'Negotiating', task_text: 'Counter offer received/addressed', is_required: false, display_order: 3 },
  { stage: 'Negotiating', task_text: 'Final price agreed', is_required: true, display_order: 4 },
  { stage: 'Negotiating', task_text: 'Earnest money amount confirmed', is_required: true, display_order: 5 },
  { stage: 'Negotiating', task_text: 'Contract terms discussed (DD period, closing date)', is_required: true, display_order: 6 },
  { stage: 'Negotiating', task_text: 'Contract prepared for signatures', is_required: true, display_order: 7 },

  // UNDER CONTRACT
  { stage: 'Under Contract', task_text: 'Purchase contract fully executed', is_required: true, display_order: 1 },
  { stage: 'Under Contract', task_text: 'Earnest money deposited', is_required: true, display_order: 2 },
  { stage: 'Under Contract', task_text: 'Title search ordered', is_required: true, display_order: 3 },
  { stage: 'Under Contract', task_text: 'Survey ordered (if needed)', is_required: false, display_order: 4 },
  { stage: 'Under Contract', task_text: 'Due diligence inspection completed', is_required: true, display_order: 5 },
  { stage: 'Under Contract', task_text: 'Soil/geotech test ordered (if vacant lot)', is_required: false, display_order: 6 },
  { stage: 'Under Contract', task_text: 'Zoning verification completed', is_required: true, display_order: 7 },
  { stage: 'Under Contract', task_text: 'Utility availability confirmed', is_required: false, display_order: 8 },
  { stage: 'Under Contract', task_text: 'End buyer identified (if wholesale)', is_required: false, display_order: 9 },
  { stage: 'Under Contract', task_text: 'Assignment contract executed (if wholesale)', is_required: false, display_order: 10 },
  { stage: 'Under Contract', task_text: 'Closing scheduled', is_required: true, display_order: 11 },
  { stage: 'Under Contract', task_text: 'Funds wired / closing completed', is_required: true, display_order: 12 },
];

// In-memory store for demo mode (keyed by opportunityId)
const mockTaskStore = {};

function getMockTasks(opportunityId, stage) {
  const key = `${opportunityId}::${stage}`;
  if (!mockTaskStore[key]) {
    // Auto-populate from templates
    mockTaskStore[key] = mockTemplates
      .filter(t => t.stage === stage)
      .map((t, idx) => ({
        id: `mock-${stage}-${idx}-${Date.now()}`,
        opportunity_id: opportunityId,
        stage: t.stage,
        task_text: t.task_text,
        is_required: t.is_required,
        is_complete: false,
        completed_by: null,
        completed_at: null,
        display_order: t.display_order,
        notes: null,
        created_at: new Date().toISOString(),
      }));
  }
  return mockTaskStore[key];
}

/**
 * Get all tasks for a specific opportunity + stage
 */
export async function getStageTasks(opportunityId, stage) {
  try {
    const { data, error } = await supabase
      .from('opportunity_stage_tasks')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .eq('stage', stage)
      .order('display_order');

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching stage tasks:', err);
    return getMockTasks(opportunityId, stage);
  }
}

/**
 * Get all tasks across all stages for an opportunity (grouped by stage)
 */
export async function getAllStageTasks(opportunityId) {
  try {
    const { data, error } = await supabase
      .from('opportunity_stage_tasks')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .order('display_order');

    if (error) throw error;

    const grouped = {};
    for (const task of data) {
      if (!grouped[task.stage]) grouped[task.stage] = [];
      grouped[task.stage].push(task);
    }
    return grouped;
  } catch (err) {
    console.error('Error fetching all stage tasks:', err);
    const stages = ['Prospecting', 'Contacted', 'Qualified', 'Negotiating', 'Under Contract'];
    const grouped = {};
    for (const stage of stages) {
      grouped[stage] = getMockTasks(opportunityId, stage);
    }
    return grouped;
  }
}

/**
 * Toggle task completion -- sets completed_at and completed_by
 */
export async function toggleTask(taskId, isComplete) {
  try {
    const updates = {
      is_complete: isComplete,
      completed_at: isComplete ? new Date().toISOString() : null,
      completed_by: isComplete ? (await supabase.auth.getUser()).data?.user?.id || null : null,
    };

    const { data, error } = await supabase
      .from('opportunity_stage_tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error toggling task:', err);
    for (const key of Object.keys(mockTaskStore)) {
      const tasks = mockTaskStore[key];
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        task.is_complete = isComplete;
        task.completed_at = isComplete ? new Date().toISOString() : null;
        task.completed_by = isComplete ? 'demo-user' : null;
        return task;
      }
    }
    return null;
  }
}

/**
 * Create a custom task for an opportunity stage
 */
export async function createTask(taskData) {
  try {
    const { data, error } = await supabase
      .from('opportunity_stage_tasks')
      .insert([{
        ...taskData,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error creating task:', err);
    const key = `${taskData.opportunity_id}::${taskData.stage}`;
    const tasks = getMockTasks(taskData.opportunity_id, taskData.stage);
    const newTask = {
      id: `mock-custom-${Date.now()}`,
      is_complete: false,
      completed_by: null,
      completed_at: null,
      notes: null,
      display_order: tasks.length + 1,
      created_at: new Date().toISOString(),
      ...taskData,
    };
    mockTaskStore[key].push(newTask);
    return newTask;
  }
}

/**
 * Delete a task
 */
export async function deleteTask(taskId) {
  try {
    const { error } = await supabase
      .from('opportunity_stage_tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting task:', err);
    for (const key of Object.keys(mockTaskStore)) {
      const idx = mockTaskStore[key].findIndex(t => t.id === taskId);
      if (idx >= 0) {
        mockTaskStore[key].splice(idx, 1);
        return true;
      }
    }
    return false;
  }
}

/**
 * Get progress stats for a specific stage
 * Returns { total, completed, requiredTotal, requiredCompleted, pct }
 */
export async function getStageProgress(opportunityId, stage) {
  const tasks = await getStageTasks(opportunityId, stage);

  const total = tasks.length;
  const completed = tasks.filter(t => t.is_complete).length;
  const requiredTotal = tasks.filter(t => t.is_required).length;
  const requiredCompleted = tasks.filter(t => t.is_required && t.is_complete).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, requiredTotal, requiredCompleted, pct };
}

/**
 * Manually populate tasks for a stage from templates
 * (The DB trigger does this automatically, but this is useful for demo mode
 *  or when manually triggering population)
 */
export async function populateTasksForStage(opportunityId, stage) {
  try {
    // Fetch active templates for the stage
    const { data: templates, error: tplError } = await supabase
      .from('opportunity_stage_task_templates')
      .select('*')
      .eq('stage', stage)
      .eq('is_active', true)
      .order('display_order');

    if (tplError) throw tplError;

    // Fetch existing tasks to avoid duplicates
    const { data: existing, error: existError } = await supabase
      .from('opportunity_stage_tasks')
      .select('task_text')
      .eq('opportunity_id', opportunityId)
      .eq('stage', stage);

    if (existError) throw existError;

    const existingTexts = new Set(existing.map(t => t.task_text));
    const newTasks = templates
      .filter(t => !existingTexts.has(t.task_text))
      .map(t => ({
        opportunity_id: opportunityId,
        stage: t.stage,
        task_text: t.task_text,
        is_required: t.is_required,
        display_order: t.display_order,
        created_at: new Date().toISOString(),
      }));

    if (newTasks.length === 0) return [];

    const { data, error } = await supabase
      .from('opportunity_stage_tasks')
      .insert(newTasks)
      .select();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error populating tasks for stage:', err);
    // Reset and re-populate from templates
    const key = `${opportunityId}::${stage}`;
    delete mockTaskStore[key];
    return getMockTasks(opportunityId, stage);
  }
}
