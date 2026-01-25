// src/services/scheduleService.js
// Schedule Module Service - project schedules, phases, tasks, and templates

import { supabase, isDemoMode } from '@/lib/supabase';

// ─── DEMO DATA ───────────────────────────────────────────────────────────────

const today = new Date();
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};
const formatDate = (d) => d.toISOString().split('T')[0];

const DEMO_PHASES = [
  { id: 'phase-1', schedule_id: 'schedule-1', name: 'Pre-Construction', sort_order: 1, start_date: formatDate(addDays(today, -60)), end_date: formatDate(addDays(today, -15)), percent_complete: 100 },
  { id: 'phase-2', schedule_id: 'schedule-1', name: 'Site Work & Foundation', sort_order: 2, start_date: formatDate(addDays(today, -14)), end_date: formatDate(addDays(today, 21)), percent_complete: 65 },
  { id: 'phase-3', schedule_id: 'schedule-1', name: 'Framing & Rough-In', sort_order: 3, start_date: formatDate(addDays(today, 22)), end_date: formatDate(addDays(today, 72)), percent_complete: 0 },
  { id: 'phase-4', schedule_id: 'schedule-1', name: 'Finishes', sort_order: 4, start_date: formatDate(addDays(today, 73)), end_date: formatDate(addDays(today, 118)), percent_complete: 0 },
  { id: 'phase-5', schedule_id: 'schedule-1', name: 'Closeout', sort_order: 5, start_date: formatDate(addDays(today, 119)), end_date: formatDate(addDays(today, 140)), percent_complete: 0 },
];

const DEMO_TASKS = [
  // Pre-Construction
  { id: 'task-1', schedule_id: 'schedule-1', phase_id: 'phase-1', name: 'Land Acquisition Closing', category: 'acquisition', duration_days: 1, duration_type: 'fixed', predecessor_id: null, predecessor_type: null, lag_days: 0, scheduled_start: formatDate(addDays(today, -60)), scheduled_end: formatDate(addDays(today, -59)), actual_start: formatDate(addDays(today, -60)), actual_end: formatDate(addDays(today, -59)), status: 'completed', percent_complete: 100, is_milestone: true, is_critical_path: true, is_date_fixed: true, fixed_date: formatDate(addDays(today, -60)), sort_order: 1, assigned_to_name: 'Bryan VanRock' },
  { id: 'task-2', schedule_id: 'schedule-1', phase_id: 'phase-1', name: 'Site Survey & Topo', category: 'due_diligence', duration_days: 14, duration_type: 'calculated', predecessor_id: 'task-1', predecessor_type: 'FS', lag_days: 2, scheduled_start: formatDate(addDays(today, -57)), scheduled_end: formatDate(addDays(today, -43)), actual_start: formatDate(addDays(today, -57)), actual_end: formatDate(addDays(today, -44)), status: 'completed', percent_complete: 100, is_milestone: false, is_critical_path: true, is_date_fixed: false, sort_order: 2, assigned_to_name: 'Alex Johnson' },
  { id: 'task-3', schedule_id: 'schedule-1', phase_id: 'phase-1', name: 'Architecture & Engineering', category: 'design', duration_days: 30, duration_type: 'calculated', predecessor_id: 'task-2', predecessor_type: 'SS', lag_days: 5, scheduled_start: formatDate(addDays(today, -52)), scheduled_end: formatDate(addDays(today, -22)), actual_start: formatDate(addDays(today, -52)), actual_end: formatDate(addDays(today, -20)), status: 'completed', percent_complete: 100, is_milestone: false, is_critical_path: true, is_date_fixed: false, sort_order: 3, assigned_to_name: 'Sarah Mitchell' },
  { id: 'task-4', schedule_id: 'schedule-1', phase_id: 'phase-1', name: 'Permits Submitted', category: 'permits', duration_days: 1, duration_type: 'fixed', predecessor_id: 'task-3', predecessor_type: 'FS', lag_days: 0, scheduled_start: formatDate(addDays(today, -21)), scheduled_end: formatDate(addDays(today, -20)), actual_start: formatDate(addDays(today, -21)), actual_end: formatDate(addDays(today, -20)), status: 'completed', percent_complete: 100, is_milestone: true, is_critical_path: true, is_date_fixed: false, sort_order: 4, assigned_to_name: 'Sarah Mitchell' },
  { id: 'task-5', schedule_id: 'schedule-1', phase_id: 'phase-1', name: 'Permits Approved', category: 'permits', duration_days: 5, duration_type: 'calculated', predecessor_id: 'task-4', predecessor_type: 'FS', lag_days: 0, scheduled_start: formatDate(addDays(today, -20)), scheduled_end: formatDate(addDays(today, -15)), actual_start: formatDate(addDays(today, -20)), actual_end: formatDate(addDays(today, -15)), status: 'completed', percent_complete: 100, is_milestone: true, is_critical_path: true, is_date_fixed: false, sort_order: 5, assigned_to_name: 'Sarah Mitchell' },

  // Site Work & Foundation
  { id: 'task-6', schedule_id: 'schedule-1', phase_id: 'phase-2', name: 'Site Clearing & Grading', category: 'sitework', duration_days: 10, duration_type: 'calculated', predecessor_id: 'task-5', predecessor_type: 'FS', lag_days: 1, scheduled_start: formatDate(addDays(today, -14)), scheduled_end: formatDate(addDays(today, -4)), actual_start: formatDate(addDays(today, -14)), actual_end: formatDate(addDays(today, -5)), status: 'completed', percent_complete: 100, is_milestone: false, is_critical_path: true, is_date_fixed: false, sort_order: 6, assigned_to_name: 'Mike Roberts' },
  { id: 'task-7', schedule_id: 'schedule-1', phase_id: 'phase-2', name: 'Utilities Rough-In', category: 'sitework', duration_days: 7, duration_type: 'calculated', predecessor_id: 'task-6', predecessor_type: 'FS', lag_days: 0, scheduled_start: formatDate(addDays(today, -4)), scheduled_end: formatDate(addDays(today, 3)), actual_start: formatDate(addDays(today, -5)), actual_end: null, status: 'in_progress', percent_complete: 80, is_milestone: false, is_critical_path: true, is_date_fixed: false, sort_order: 7, assigned_to_name: 'Mike Roberts' },
  { id: 'task-8', schedule_id: 'schedule-1', phase_id: 'phase-2', name: 'Foundation Excavation', category: 'foundation', duration_days: 5, duration_type: 'calculated', predecessor_id: 'task-7', predecessor_type: 'FS', lag_days: 0, scheduled_start: formatDate(addDays(today, 4)), scheduled_end: formatDate(addDays(today, 9)), status: 'not_started', percent_complete: 0, is_milestone: false, is_critical_path: true, is_date_fixed: false, sort_order: 8, assigned_to_name: 'Mike Roberts' },
  { id: 'task-9', schedule_id: 'schedule-1', phase_id: 'phase-2', name: 'Foundation Pour', category: 'foundation', duration_days: 3, duration_type: 'calculated', predecessor_id: 'task-8', predecessor_type: 'FS', lag_days: 0, scheduled_start: formatDate(addDays(today, 10)), scheduled_end: formatDate(addDays(today, 13)), status: 'not_started', percent_complete: 0, is_milestone: false, is_critical_path: true, is_date_fixed: false, sort_order: 9, assigned_to_name: 'Mike Roberts' },
  { id: 'task-10', schedule_id: 'schedule-1', phase_id: 'phase-2', name: 'Foundation Cure & Inspection', category: 'foundation', duration_days: 7, duration_type: 'calculated', predecessor_id: 'task-9', predecessor_type: 'FS', lag_days: 0, scheduled_start: formatDate(addDays(today, 14)), scheduled_end: formatDate(addDays(today, 21)), status: 'not_started', percent_complete: 0, is_milestone: false, is_critical_path: true, is_date_fixed: false, sort_order: 10, assigned_to_name: 'Mike Roberts' },

  // Framing & Rough-In
  { id: 'task-11', schedule_id: 'schedule-1', phase_id: 'phase-3', name: 'Framing - 1st Floor', category: 'framing', duration_days: 12, duration_type: 'calculated', predecessor_id: 'task-10', predecessor_type: 'FS', lag_days: 1, scheduled_start: formatDate(addDays(today, 22)), scheduled_end: formatDate(addDays(today, 34)), status: 'not_started', percent_complete: 0, is_milestone: false, is_critical_path: true, is_date_fixed: false, sort_order: 11, assigned_to_name: 'Mike Roberts' },
  { id: 'task-12', schedule_id: 'schedule-1', phase_id: 'phase-3', name: 'Framing - 2nd Floor & Roof', category: 'framing', duration_days: 10, duration_type: 'calculated', predecessor_id: 'task-11', predecessor_type: 'FS', lag_days: 0, scheduled_start: formatDate(addDays(today, 35)), scheduled_end: formatDate(addDays(today, 45)), status: 'not_started', percent_complete: 0, is_milestone: false, is_critical_path: true, is_date_fixed: false, sort_order: 12, assigned_to_name: 'Mike Roberts' },
  { id: 'task-13', schedule_id: 'schedule-1', phase_id: 'phase-3', name: 'Roofing', category: 'exterior', duration_days: 5, duration_type: 'calculated', predecessor_id: 'task-12', predecessor_type: 'FS', lag_days: 0, scheduled_start: formatDate(addDays(today, 46)), scheduled_end: formatDate(addDays(today, 51)), status: 'not_started', percent_complete: 0, is_milestone: false, is_critical_path: false, is_date_fixed: false, sort_order: 13, assigned_to_name: 'Alex Johnson' },
  { id: 'task-14', schedule_id: 'schedule-1', phase_id: 'phase-3', name: 'Plumbing Rough-In', category: 'mechanical', duration_days: 8, duration_type: 'calculated', predecessor_id: 'task-12', predecessor_type: 'FS', lag_days: 0, scheduled_start: formatDate(addDays(today, 46)), scheduled_end: formatDate(addDays(today, 54)), status: 'not_started', percent_complete: 0, is_milestone: false, is_critical_path: true, is_date_fixed: false, sort_order: 14, assigned_to_name: 'Alex Johnson' },
  { id: 'task-15', schedule_id: 'schedule-1', phase_id: 'phase-3', name: 'Electrical Rough-In', category: 'mechanical', duration_days: 8, duration_type: 'calculated', predecessor_id: 'task-12', predecessor_type: 'FS', lag_days: 0, scheduled_start: formatDate(addDays(today, 46)), scheduled_end: formatDate(addDays(today, 54)), status: 'not_started', percent_complete: 0, is_milestone: false, is_critical_path: false, is_date_fixed: false, sort_order: 15, assigned_to_name: 'Alex Johnson' },
  { id: 'task-16', schedule_id: 'schedule-1', phase_id: 'phase-3', name: 'HVAC Rough-In', category: 'mechanical', duration_days: 6, duration_type: 'calculated', predecessor_id: 'task-14', predecessor_type: 'SS', lag_days: 2, scheduled_start: formatDate(addDays(today, 48)), scheduled_end: formatDate(addDays(today, 54)), status: 'not_started', percent_complete: 0, is_milestone: false, is_critical_path: false, is_date_fixed: false, sort_order: 16, assigned_to_name: 'Alex Johnson' },
  { id: 'task-17', schedule_id: 'schedule-1', phase_id: 'phase-3', name: 'Insulation', category: 'mechanical', duration_days: 4, duration_type: 'calculated', predecessor_id: 'task-14', predecessor_type: 'FS', lag_days: 0, scheduled_start: formatDate(addDays(today, 55)), scheduled_end: formatDate(addDays(today, 59)), status: 'not_started', percent_complete: 0, is_milestone: false, is_critical_path: true, is_date_fixed: false, sort_order: 17, assigned_to_name: 'Mike Roberts' },
  { id: 'task-18', schedule_id: 'schedule-1', phase_id: 'phase-3', name: 'Drywall', category: 'interior', duration_days: 12, duration_type: 'calculated', predecessor_id: 'task-17', predecessor_type: 'FS', lag_days: 1, scheduled_start: formatDate(addDays(today, 60)), scheduled_end: formatDate(addDays(today, 72)), status: 'not_started', percent_complete: 0, is_milestone: false, is_critical_path: true, is_date_fixed: false, sort_order: 18, assigned_to_name: 'Mike Roberts' },

  // Finishes
  { id: 'task-19', schedule_id: 'schedule-1', phase_id: 'phase-4', name: 'Interior Trim & Doors', category: 'interior', duration_days: 10, duration_type: 'calculated', predecessor_id: 'task-18', predecessor_type: 'FS', lag_days: 1, scheduled_start: formatDate(addDays(today, 73)), scheduled_end: formatDate(addDays(today, 83)), status: 'not_started', percent_complete: 0, is_milestone: false, is_critical_path: true, is_date_fixed: false, sort_order: 19, assigned_to_name: 'Alex Johnson' },
  { id: 'task-20', schedule_id: 'schedule-1', phase_id: 'phase-4', name: 'Cabinets & Countertops', category: 'interior', duration_days: 8, duration_type: 'calculated', predecessor_id: 'task-19', predecessor_type: 'FS', lag_days: 0, scheduled_start: formatDate(addDays(today, 84)), scheduled_end: formatDate(addDays(today, 92)), status: 'not_started', percent_complete: 0, is_milestone: false, is_critical_path: true, is_date_fixed: false, sort_order: 20, assigned_to_name: 'Alex Johnson' },
  { id: 'task-21', schedule_id: 'schedule-1', phase_id: 'phase-4', name: 'Flooring', category: 'interior', duration_days: 7, duration_type: 'calculated', predecessor_id: 'task-20', predecessor_type: 'FS', lag_days: 0, scheduled_start: formatDate(addDays(today, 93)), scheduled_end: formatDate(addDays(today, 100)), status: 'not_started', percent_complete: 0, is_milestone: false, is_critical_path: true, is_date_fixed: false, sort_order: 21, assigned_to_name: 'Alex Johnson' },
  { id: 'task-22', schedule_id: 'schedule-1', phase_id: 'phase-4', name: 'Paint', category: 'interior', duration_days: 7, duration_type: 'calculated', predecessor_id: 'task-21', predecessor_type: 'SS', lag_days: 3, scheduled_start: formatDate(addDays(today, 96)), scheduled_end: formatDate(addDays(today, 103)), status: 'not_started', percent_complete: 0, is_milestone: false, is_critical_path: false, is_date_fixed: false, sort_order: 22, assigned_to_name: 'Mike Roberts' },
  { id: 'task-23', schedule_id: 'schedule-1', phase_id: 'phase-4', name: 'Plumbing & Electrical Finish', category: 'mechanical', duration_days: 5, duration_type: 'calculated', predecessor_id: 'task-21', predecessor_type: 'FS', lag_days: 0, scheduled_start: formatDate(addDays(today, 101)), scheduled_end: formatDate(addDays(today, 106)), status: 'not_started', percent_complete: 0, is_milestone: false, is_critical_path: true, is_date_fixed: false, sort_order: 23, assigned_to_name: 'Alex Johnson' },
  { id: 'task-24', schedule_id: 'schedule-1', phase_id: 'phase-4', name: 'Appliances & Hardware', category: 'interior', duration_days: 3, duration_type: 'calculated', predecessor_id: 'task-23', predecessor_type: 'FS', lag_days: 0, scheduled_start: formatDate(addDays(today, 107)), scheduled_end: formatDate(addDays(today, 110)), status: 'not_started', percent_complete: 0, is_milestone: false, is_critical_path: true, is_date_fixed: false, sort_order: 24, assigned_to_name: 'Alex Johnson' },
  { id: 'task-25', schedule_id: 'schedule-1', phase_id: 'phase-4', name: 'Exterior Siding & Paint', category: 'exterior', duration_days: 12, duration_type: 'calculated', predecessor_id: 'task-13', predecessor_type: 'FS', lag_days: 5, scheduled_start: formatDate(addDays(today, 56)), scheduled_end: formatDate(addDays(today, 68)), status: 'not_started', percent_complete: 0, is_milestone: false, is_critical_path: false, is_date_fixed: false, sort_order: 25, assigned_to_name: 'Mike Roberts' },
  { id: 'task-26', schedule_id: 'schedule-1', phase_id: 'phase-4', name: 'Landscaping & Driveway', category: 'exterior', duration_days: 8, duration_type: 'calculated', predecessor_id: 'task-24', predecessor_type: 'SS', lag_days: 0, scheduled_start: formatDate(addDays(today, 107)), scheduled_end: formatDate(addDays(today, 115)), status: 'not_started', percent_complete: 0, is_milestone: false, is_critical_path: false, is_date_fixed: false, sort_order: 26, assigned_to_name: 'Mike Roberts' },

  // Closeout
  { id: 'task-27', schedule_id: 'schedule-1', phase_id: 'phase-5', name: 'Final Cleaning', category: 'closeout', duration_days: 3, duration_type: 'calculated', predecessor_id: 'task-24', predecessor_type: 'FS', lag_days: 3, scheduled_start: formatDate(addDays(today, 113)), scheduled_end: formatDate(addDays(today, 116)), status: 'not_started', percent_complete: 0, is_milestone: false, is_critical_path: true, is_date_fixed: false, sort_order: 27, assigned_to_name: 'Mike Roberts' },
  { id: 'task-28', schedule_id: 'schedule-1', phase_id: 'phase-5', name: 'Final Inspections', category: 'closeout', duration_days: 5, duration_type: 'calculated', predecessor_id: 'task-27', predecessor_type: 'FS', lag_days: 0, scheduled_start: formatDate(addDays(today, 117)), scheduled_end: formatDate(addDays(today, 122)), status: 'not_started', percent_complete: 0, is_milestone: false, is_critical_path: true, is_date_fixed: false, sort_order: 28, assigned_to_name: 'Sarah Mitchell' },
  { id: 'task-29', schedule_id: 'schedule-1', phase_id: 'phase-5', name: 'Punch List', category: 'closeout', duration_days: 7, duration_type: 'calculated', predecessor_id: 'task-28', predecessor_type: 'FS', lag_days: 0, scheduled_start: formatDate(addDays(today, 123)), scheduled_end: formatDate(addDays(today, 130)), status: 'not_started', percent_complete: 0, is_milestone: false, is_critical_path: true, is_date_fixed: false, sort_order: 29, assigned_to_name: 'Mike Roberts' },
  { id: 'task-30', schedule_id: 'schedule-1', phase_id: 'phase-5', name: 'Certificate of Occupancy', category: 'closeout', duration_days: 1, duration_type: 'fixed', predecessor_id: 'task-29', predecessor_type: 'FS', lag_days: 5, scheduled_start: formatDate(addDays(today, 135)), scheduled_end: formatDate(addDays(today, 136)), status: 'not_started', percent_complete: 0, is_milestone: true, is_critical_path: true, is_date_fixed: false, sort_order: 30, assigned_to_name: 'Bryan VanRock' },
];

const DEMO_SCHEDULE = {
  id: 'schedule-1',
  project_id: 'demo-project-1',
  template_id: 'sched-tmpl-1',
  project_start_date: formatDate(addDays(today, -60)),
  projected_end_date: formatDate(addDays(today, 136)),
  actual_end_date: null,
  status: 'active',
};

const DEMO_TEMPLATES = [
  {
    id: 'sched-tmpl-1',
    name: 'Standard New Construction',
    description: 'Default schedule for spec home / new construction projects',
    project_type: 'spec_home',
    total_duration_days: 200,
    is_default: true,
    is_active: true,
    phases: [
      { id: 'tp-1', name: 'Pre-Construction', sort_order: 1, tasks: [
        { name: 'Land Acquisition Closing', duration_days: 1, is_milestone: true, predecessor_type: null },
        { name: 'Site Survey & Topo', duration_days: 14, predecessor_type: 'FS', lag_days: 2 },
        { name: 'Architecture & Engineering', duration_days: 30, predecessor_type: 'SS', lag_days: 5 },
        { name: 'Permits', duration_days: 21, predecessor_type: 'FS' },
      ]},
      { id: 'tp-2', name: 'Site Work & Foundation', sort_order: 2, tasks: [
        { name: 'Site Clearing & Grading', duration_days: 10, predecessor_type: 'FS', lag_days: 1 },
        { name: 'Utilities Rough-In', duration_days: 7, predecessor_type: 'FS' },
        { name: 'Foundation', duration_days: 15, predecessor_type: 'FS' },
      ]},
      { id: 'tp-3', name: 'Framing & Rough-In', sort_order: 3, tasks: [
        { name: 'Framing', duration_days: 22, predecessor_type: 'FS', lag_days: 1 },
        { name: 'Roofing', duration_days: 5, predecessor_type: 'FS' },
        { name: 'Mechanicals Rough-In', duration_days: 10, predecessor_type: 'FS' },
        { name: 'Insulation & Drywall', duration_days: 16, predecessor_type: 'FS', lag_days: 1 },
      ]},
      { id: 'tp-4', name: 'Finishes', sort_order: 4, tasks: [
        { name: 'Interior Trim', duration_days: 10, predecessor_type: 'FS', lag_days: 1 },
        { name: 'Cabinets & Countertops', duration_days: 8, predecessor_type: 'FS' },
        { name: 'Flooring & Paint', duration_days: 10, predecessor_type: 'FS' },
        { name: 'Fixture & Appliance Install', duration_days: 5, predecessor_type: 'FS' },
        { name: 'Exterior Finishes', duration_days: 14, predecessor_type: 'SS' },
      ]},
      { id: 'tp-5', name: 'Closeout', sort_order: 5, tasks: [
        { name: 'Final Cleaning', duration_days: 3, predecessor_type: 'FS', lag_days: 3 },
        { name: 'Final Inspections', duration_days: 5, predecessor_type: 'FS' },
        { name: 'Punch List', duration_days: 7, predecessor_type: 'FS' },
        { name: 'CO Issued', duration_days: 1, is_milestone: true, predecessor_type: 'FS', lag_days: 5 },
      ]},
    ],
  },
  {
    id: 'sched-tmpl-2',
    name: 'Lot Development',
    description: 'Horizontal development schedule (no vertical construction)',
    project_type: 'lot_development',
    total_duration_days: 180,
    is_default: true,
    is_active: true,
    phases: [
      { id: 'tp-6', name: 'Entitlements', sort_order: 1, tasks: [
        { name: 'Land Acquisition', duration_days: 1, is_milestone: true },
        { name: 'Zoning & Entitlements', duration_days: 60, predecessor_type: 'FS' },
        { name: 'Civil Engineering', duration_days: 45, predecessor_type: 'SS', lag_days: 15 },
      ]},
      { id: 'tp-7', name: 'Infrastructure', sort_order: 2, tasks: [
        { name: 'Mass Grading', duration_days: 20, predecessor_type: 'FS' },
        { name: 'Roads & Curbs', duration_days: 30, predecessor_type: 'FS' },
        { name: 'Water & Sewer', duration_days: 25, predecessor_type: 'SS', lag_days: 5 },
        { name: 'Electrical & Gas', duration_days: 20, predecessor_type: 'SS', lag_days: 10 },
      ]},
      { id: 'tp-8', name: 'Final', sort_order: 3, tasks: [
        { name: 'Landscaping & Common Areas', duration_days: 15, predecessor_type: 'FS' },
        { name: 'Final Inspections', duration_days: 5, predecessor_type: 'FS' },
        { name: 'Plat Recordation', duration_days: 1, is_milestone: true, predecessor_type: 'FS', lag_days: 10 },
      ]},
    ],
  },
];

// ─── PROJECT SCHEDULE SERVICE ────────────────────────────────────────────────

export async function getProjectSchedule(projectId) {
  if (isDemoMode) {
    return DEMO_SCHEDULE.project_id === projectId || projectId === 'demo-project-1'
      ? DEMO_SCHEDULE : null;
  }
  const { data, error } = await supabase
    .from('project_schedules')
    .select('*')
    .eq('project_id', projectId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function createProjectSchedule(projectId, scheduleData) {
  if (isDemoMode) {
    return { id: `schedule-${Date.now()}`, project_id: projectId, ...scheduleData, status: 'draft', created_at: new Date().toISOString() };
  }
  const { data, error } = await supabase.from('project_schedules')
    .insert({ project_id: projectId, ...scheduleData }).select().single();
  if (error) throw error;
  return data;
}

export async function updateProjectSchedule(scheduleId, updates) {
  if (isDemoMode) {
    return { id: scheduleId, ...DEMO_SCHEDULE, ...updates };
  }
  const { data, error } = await supabase.from('project_schedules')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', scheduleId).select().single();
  if (error) throw error;
  return data;
}

// ─── PHASES SERVICE ──────────────────────────────────────────────────────────

export async function getSchedulePhases(scheduleId) {
  if (isDemoMode) {
    return DEMO_PHASES.filter(p => p.schedule_id === scheduleId).sort((a, b) => a.sort_order - b.sort_order);
  }
  const { data, error } = await supabase.from('schedule_phases')
    .select('*').eq('schedule_id', scheduleId).order('sort_order');
  if (error) throw error;
  return data || [];
}

export async function createPhase(scheduleId, phaseData) {
  if (isDemoMode) {
    const newPhase = { id: `phase-${Date.now()}`, schedule_id: scheduleId, ...phaseData };
    DEMO_PHASES.push(newPhase);
    return newPhase;
  }
  const { data, error } = await supabase.from('schedule_phases')
    .insert({ schedule_id: scheduleId, ...phaseData }).select().single();
  if (error) throw error;
  return data;
}

// ─── TASKS SERVICE ───────────────────────────────────────────────────────────

export async function getScheduleTasks(scheduleId) {
  if (isDemoMode) {
    return DEMO_TASKS.filter(t => t.schedule_id === scheduleId).sort((a, b) => a.sort_order - b.sort_order);
  }
  const { data, error } = await supabase.from('schedule_tasks')
    .select('*').eq('schedule_id', scheduleId).order('sort_order');
  if (error) throw error;
  return data || [];
}

export async function createTask(scheduleId, taskData) {
  if (isDemoMode) {
    const newTask = { id: `task-${Date.now()}`, schedule_id: scheduleId, status: 'not_started', percent_complete: 0, ...taskData };
    DEMO_TASKS.push(newTask);
    return newTask;
  }
  const { data, error } = await supabase.from('schedule_tasks')
    .insert({ schedule_id: scheduleId, ...taskData }).select().single();
  if (error) throw error;
  return data;
}

export async function updateTask(taskId, updates) {
  if (isDemoMode) {
    const idx = DEMO_TASKS.findIndex(t => t.id === taskId);
    if (idx >= 0) Object.assign(DEMO_TASKS[idx], updates);
    return DEMO_TASKS[idx] || { id: taskId, ...updates };
  }
  const { data, error } = await supabase.from('schedule_tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', taskId).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTask(taskId) {
  if (isDemoMode) {
    const idx = DEMO_TASKS.findIndex(t => t.id === taskId);
    if (idx >= 0) DEMO_TASKS.splice(idx, 1);
    return true;
  }
  const { error } = await supabase.from('schedule_tasks').delete().eq('id', taskId);
  if (error) throw error;
  return true;
}

// ─── TEMPLATES SERVICE ───────────────────────────────────────────────────────

export async function getScheduleTemplates(projectType) {
  if (isDemoMode) {
    if (!projectType) return DEMO_TEMPLATES.filter(t => t.is_active);
    return DEMO_TEMPLATES.filter(t => t.is_active && t.project_type === projectType);
  }
  let query = supabase.from('schedule_templates').select('*').eq('is_active', true);
  if (projectType) query = query.eq('project_type', projectType);
  const { data, error } = await query.order('name');
  if (error) throw error;
  return data || [];
}

// ─── SCHEDULE CALCULATION ────────────────────────────────────────────────────

export function recalculateTaskDates(tasks, projectStartDate) {
  const startDate = new Date(projectStartDate);
  const taskMap = {};
  tasks.forEach(t => { taskMap[t.id] = { ...t }; });

  // Topological sort: process tasks without predecessors first
  const processed = new Set();
  const result = [];

  const processTask = (taskId) => {
    if (processed.has(taskId)) return;
    const task = taskMap[taskId];
    if (!task) return;

    // Process predecessor first
    if (task.predecessor_id && !processed.has(task.predecessor_id)) {
      processTask(task.predecessor_id);
    }

    let taskStart;
    if (task.is_date_fixed && task.fixed_date) {
      taskStart = new Date(task.fixed_date);
    } else if (task.predecessor_id && taskMap[task.predecessor_id]) {
      const pred = taskMap[task.predecessor_id];
      const predEnd = new Date(pred.scheduled_end);
      const predStart = new Date(pred.scheduled_start);
      const lag = task.lag_days || 0;

      switch (task.predecessor_type) {
        case 'FS':
          taskStart = addDays(predEnd, lag);
          break;
        case 'SS':
          taskStart = addDays(predStart, lag);
          break;
        case 'FF':
          taskStart = addDays(predEnd, lag - task.duration_days);
          break;
        case 'SF':
          taskStart = addDays(predStart, lag - task.duration_days);
          break;
        default:
          taskStart = addDays(predEnd, lag);
      }
    } else {
      taskStart = new Date(startDate);
    }

    task.scheduled_start = formatDate(taskStart);
    task.scheduled_end = formatDate(addDays(taskStart, task.duration_days));
    taskMap[taskId] = task;
    processed.add(taskId);
    result.push(task);
  };

  Object.keys(taskMap).forEach(processTask);
  return result;
}

export function calculateScheduleProgress(tasks) {
  if (!tasks || tasks.length === 0) return { overall: 0, byPhase: {} };
  const totalWeight = tasks.reduce((sum, t) => sum + t.duration_days, 0);
  const completedWeight = tasks.reduce((sum, t) => sum + (t.duration_days * (t.percent_complete / 100)), 0);
  const overall = totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;

  const byPhase = {};
  tasks.forEach(t => {
    if (!byPhase[t.phase_id]) byPhase[t.phase_id] = { total: 0, completed: 0 };
    byPhase[t.phase_id].total += t.duration_days;
    byPhase[t.phase_id].completed += t.duration_days * (t.percent_complete / 100);
  });
  Object.keys(byPhase).forEach(k => {
    byPhase[k].percent = byPhase[k].total > 0 ? (byPhase[k].completed / byPhase[k].total) * 100 : 0;
  });

  return { overall, byPhase };
}

export function getTasksByPhase(tasks, phases) {
  const phaseMap = {};
  phases.forEach(p => { phaseMap[p.id] = { ...p, tasks: [] }; });
  tasks.forEach(t => {
    if (phaseMap[t.phase_id]) phaseMap[t.phase_id].tasks.push(t);
  });
  return Object.values(phaseMap).sort((a, b) => a.sort_order - b.sort_order);
}

export const DEPENDENCY_TYPES = [
  { value: 'FS', label: 'Finish-to-Start', desc: 'Task starts when predecessor finishes' },
  { value: 'SS', label: 'Start-to-Start', desc: 'Task starts when predecessor starts' },
  { value: 'FF', label: 'Finish-to-Finish', desc: 'Task finishes when predecessor finishes' },
  { value: 'SF', label: 'Start-to-Finish', desc: 'Task finishes when predecessor starts' },
];

export const TASK_STATUSES = [
  { value: 'not_started', label: 'Not Started', color: 'gray' },
  { value: 'in_progress', label: 'In Progress', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'delayed', label: 'Delayed', color: 'amber' },
  { value: 'blocked', label: 'Blocked', color: 'red' },
];
