// src/services/routineMeetingsService.js
// Routine Meetings (Team Cadence) Service
// Manages recurring team meetings with EOS integration

import { supabase, isDemoMode } from '@/lib/supabase';

/*
 * ROUTINE MEETINGS SERVICE
 *
 * Handles:
 * 1. Meeting Series (recurring meeting definitions)
 * 2. Meeting Instances (individual meeting records)
 * 3. Meeting Items (tasks, issues, rocks, notes, headlines)
 * 4. Team and participant management
 * 5. Meeting templates and agendas
 */

// Meeting Cadence Types
export const CADENCE_TYPES = {
  WEEKLY: 'weekly',
  BIWEEKLY: 'biweekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
};

// Meeting Series Status
export const SERIES_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  ARCHIVED: 'archived',
};

// Meeting Instance Status
export const INSTANCE_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  RESCHEDULED: 'rescheduled',
};

// Item Types for meeting records
export const ITEM_TYPES = {
  TASK: 'task',
  ISSUE: 'issue',
  ROCK: 'rock',
  HEADLINE: 'headline',
  NOTE: 'note',
  DELIVERABLE: 'deliverable',
  SUCCESS: 'success',
  DECISION: 'decision',
};

// Item Status
export const ITEM_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  COMPLETED: 'completed',
  DROPPED: 'dropped',
  DEFERRED: 'deferred',
};

// Item Priority
export const ITEM_PRIORITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

// Meeting Templates
export const MEETING_TEMPLATES = {
  L10: {
    id: 'l10',
    name: 'Level 10 Meeting',
    description: 'EOS Level 10 weekly leadership meeting',
    duration: 90,
    agenda: [
      { order: 1, name: 'Segue', duration: 5, description: 'Personal and professional good news' },
      { order: 2, name: 'Scorecard Review', duration: 5, description: 'Review weekly metrics' },
      { order: 3, name: 'Rock Review', duration: 5, description: 'Check rock progress (on/off track)' },
      { order: 4, name: 'Customer/Employee Headlines', duration: 5, description: 'Share updates' },
      { order: 5, name: 'To-Do List', duration: 5, description: 'Review last week\'s to-dos' },
      { order: 6, name: 'IDS (Issues)', duration: 60, description: 'Identify, Discuss, Solve' },
      { order: 7, name: 'Conclude', duration: 5, description: 'Recap to-dos, rate meeting, cascading messages' },
    ],
  },
  WEEKLY_TEAM: {
    id: 'weekly_team',
    name: 'Weekly Team Sync',
    description: 'Standard weekly team coordination meeting',
    duration: 60,
    agenda: [
      { order: 1, name: 'Check-in', duration: 5, description: 'Quick wins and blockers' },
      { order: 2, name: 'Pipeline Review', duration: 15, description: 'Review opportunities and projects' },
      { order: 3, name: 'Task Review', duration: 10, description: 'Review outstanding tasks' },
      { order: 4, name: 'Issues & Blockers', duration: 20, description: 'Discuss and resolve issues' },
      { order: 5, name: 'Action Items', duration: 10, description: 'Assign new tasks and next steps' },
    ],
  },
  PROJECT_STATUS: {
    id: 'project_status',
    name: 'Project Status Meeting',
    description: 'Project-focused status and coordination',
    duration: 45,
    agenda: [
      { order: 1, name: 'Budget/Schedule Overview', duration: 10, description: 'Financial and timeline status' },
      { order: 2, name: 'Active Issues', duration: 15, description: 'Current blockers and risks' },
      { order: 3, name: 'Upcoming Milestones', duration: 10, description: 'Next deadlines and deliverables' },
      { order: 4, name: 'Action Items', duration: 10, description: 'Assignments and follow-ups' },
    ],
  },
  OPERATIONS_REVIEW: {
    id: 'operations_review',
    name: 'Operations Review',
    description: 'Monthly operations and performance review',
    duration: 90,
    agenda: [
      { order: 1, name: 'KPI Review', duration: 20, description: 'Review key performance indicators' },
      { order: 2, name: 'Department Updates', duration: 30, description: 'Updates from each department' },
      { order: 3, name: 'Strategic Issues', duration: 25, description: 'Discuss strategic concerns' },
      { order: 4, name: 'Resource Planning', duration: 15, description: 'Staffing and resource needs' },
    ],
  },
};

// Mock data for demo mode
let mockMeetingSeries = [
  {
    id: 'series-1',
    name: 'Scattered Lot Team Weekly',
    description: 'Weekly coordination for NC/SC scattered lot acquisition and development team',
    cadence: CADENCE_TYPES.WEEKLY,
    dayOfWeek: 1, // Monday
    time: '09:00',
    duration: 60,
    timezone: 'America/New_York',
    status: SERIES_STATUS.ACTIVE,
    templateId: 'weekly_team',
    teams: ['team-scattered-lot'],
    teamNames: ['Scattered Lot Team'],
    regions: ['NC', 'SC'],
    participants: [
      { id: 'user-1', name: 'John Smith', role: 'Team Lead', email: 'john@example.com' },
      { id: 'user-2', name: 'Sarah Johnson', role: 'Acquisition Manager', email: 'sarah@example.com' },
      { id: 'user-3', name: 'Mike Williams', role: 'Project Manager', email: 'mike@example.com' },
      { id: 'user-4', name: 'Lisa Chen', role: 'Construction Coordinator', email: 'lisa@example.com' },
    ],
    facilitator: { id: 'user-1', name: 'John Smith' },
    stats: {
      totalMeetings: 48,
      meetingsThisQuarter: 12,
      avgAttendance: 92,
      avgRating: 8.5,
      openIssues: 5,
      completedTasks: 156,
      activeRocks: 3,
    },
    nextMeeting: '2025-01-27T09:00:00',
    lastMeeting: '2025-01-20T09:00:00',
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'series-2',
    name: 'Leadership L10',
    description: 'Executive leadership weekly Level 10 meeting following EOS methodology',
    cadence: CADENCE_TYPES.WEEKLY,
    dayOfWeek: 4, // Thursday
    time: '08:00',
    duration: 90,
    timezone: 'America/New_York',
    status: SERIES_STATUS.ACTIVE,
    templateId: 'l10',
    teams: ['team-leadership'],
    teamNames: ['Executive Team'],
    regions: [],
    participants: [
      { id: 'user-5', name: 'Robert Van', role: 'CEO/Visionary', email: 'robert@example.com' },
      { id: 'user-6', name: 'Emily Davis', role: 'COO/Integrator', email: 'emily@example.com' },
      { id: 'user-1', name: 'John Smith', role: 'VP Development', email: 'john@example.com' },
      { id: 'user-7', name: 'David Brown', role: 'CFO', email: 'david@example.com' },
      { id: 'user-8', name: 'Amanda Wilson', role: 'VP Sales', email: 'amanda@example.com' },
    ],
    facilitator: { id: 'user-6', name: 'Emily Davis' },
    stats: {
      totalMeetings: 96,
      meetingsThisQuarter: 12,
      avgAttendance: 98,
      avgRating: 9.2,
      openIssues: 8,
      completedTasks: 312,
      activeRocks: 5,
    },
    nextMeeting: '2025-01-30T08:00:00',
    lastMeeting: '2025-01-23T08:00:00',
    created_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'series-3',
    name: 'Construction Team Sync',
    description: 'Weekly construction operations and project coordination',
    cadence: CADENCE_TYPES.WEEKLY,
    dayOfWeek: 2, // Tuesday
    time: '07:30',
    duration: 45,
    timezone: 'America/New_York',
    status: SERIES_STATUS.ACTIVE,
    templateId: 'project_status',
    teams: ['team-construction'],
    teamNames: ['Construction Team'],
    regions: ['NC', 'SC', 'GA'],
    participants: [
      { id: 'user-3', name: 'Mike Williams', role: 'Construction Director', email: 'mike@example.com' },
      { id: 'user-4', name: 'Lisa Chen', role: 'Project Coordinator', email: 'lisa@example.com' },
      { id: 'user-9', name: 'Tom Anderson', role: 'Site Supervisor - NC', email: 'tom@example.com' },
      { id: 'user-10', name: 'Chris Martinez', role: 'Site Supervisor - SC', email: 'chris@example.com' },
    ],
    facilitator: { id: 'user-3', name: 'Mike Williams' },
    stats: {
      totalMeetings: 72,
      meetingsThisQuarter: 12,
      avgAttendance: 88,
      avgRating: 8.1,
      openIssues: 12,
      completedTasks: 234,
      activeRocks: 4,
    },
    nextMeeting: '2025-01-28T07:30:00',
    lastMeeting: '2025-01-21T07:30:00',
    created_at: '2023-06-01T00:00:00Z',
  },
  {
    id: 'series-4',
    name: 'Monthly Operations Review',
    description: 'Monthly all-hands operations review and planning session',
    cadence: CADENCE_TYPES.MONTHLY,
    dayOfMonth: 1, // First of month
    weekOfMonth: 1, // First week
    dayOfWeek: 3, // Wednesday
    time: '14:00',
    duration: 90,
    timezone: 'America/New_York',
    status: SERIES_STATUS.ACTIVE,
    templateId: 'operations_review',
    teams: ['team-leadership', 'team-scattered-lot', 'team-construction'],
    teamNames: ['Executive Team', 'Scattered Lot Team', 'Construction Team'],
    regions: [],
    participants: [
      { id: 'user-5', name: 'Robert Van', role: 'CEO', email: 'robert@example.com' },
      { id: 'user-6', name: 'Emily Davis', role: 'COO', email: 'emily@example.com' },
      { id: 'user-1', name: 'John Smith', role: 'VP Development', email: 'john@example.com' },
      { id: 'user-3', name: 'Mike Williams', role: 'Construction Director', email: 'mike@example.com' },
    ],
    facilitator: { id: 'user-6', name: 'Emily Davis' },
    stats: {
      totalMeetings: 24,
      meetingsThisQuarter: 3,
      avgAttendance: 95,
      avgRating: 8.8,
      openIssues: 3,
      completedTasks: 89,
      activeRocks: 8,
    },
    nextMeeting: '2025-02-05T14:00:00',
    lastMeeting: '2025-01-08T14:00:00',
    created_at: '2023-01-01T00:00:00Z',
  },
];

let mockMeetingInstances = [
  // Recent meetings for Scattered Lot Team
  {
    id: 'meeting-1',
    seriesId: 'series-1',
    seriesName: 'Scattered Lot Team Weekly',
    date: '2025-01-20',
    startTime: '09:00',
    endTime: '10:05',
    actualDuration: 65,
    status: INSTANCE_STATUS.COMPLETED,
    attendees: ['user-1', 'user-2', 'user-3', 'user-4'],
    absentees: [],
    facilitator: { id: 'user-1', name: 'John Smith' },
    rating: 9,
    notes: 'Productive meeting. Closed 2 deals in Charlotte. Need to accelerate permitting for Greenville project.',
    headlines: [
      { id: 'h1', text: 'Closed Oak Street acquisition - $285K under budget', type: 'success' },
      { id: 'h2', text: 'New contractor partnership with BuildRight Inc.', type: 'success' },
    ],
    scorecardReview: {
      metricsOnTrack: 8,
      metricsOffTrack: 2,
      notes: 'Permit timeline slipping on 2 projects',
    },
    rocksReview: [
      { rockId: 'rock-1', name: 'Q1 Acquisition Target (15 lots)', status: 'on_track', progress: 73 },
      { rockId: 'rock-2', name: 'Reduce avg permit time to 45 days', status: 'off_track', progress: 40 },
      { rockId: 'rock-3', name: 'Launch SC market expansion', status: 'on_track', progress: 85 },
    ],
    todoReview: {
      completedFromLast: 8,
      carriedOver: 2,
      newAssigned: 6,
    },
    idsDiscussed: 3,
    created_at: '2025-01-20T10:05:00Z',
  },
  {
    id: 'meeting-2',
    seriesId: 'series-1',
    seriesName: 'Scattered Lot Team Weekly',
    date: '2025-01-13',
    startTime: '09:00',
    endTime: '09:58',
    actualDuration: 58,
    status: INSTANCE_STATUS.COMPLETED,
    attendees: ['user-1', 'user-2', 'user-4'],
    absentees: ['user-3'],
    facilitator: { id: 'user-1', name: 'John Smith' },
    rating: 8,
    notes: 'Mike out sick. Good progress on pipeline review. Identified issue with county inspector delays.',
    headlines: [
      { id: 'h3', text: 'Added 3 new properties to pipeline', type: 'update' },
    ],
    scorecardReview: {
      metricsOnTrack: 7,
      metricsOffTrack: 3,
      notes: 'Inspection delays affecting close dates',
    },
    rocksReview: [
      { rockId: 'rock-1', name: 'Q1 Acquisition Target (15 lots)', status: 'on_track', progress: 60 },
      { rockId: 'rock-2', name: 'Reduce avg permit time to 45 days', status: 'off_track', progress: 35 },
      { rockId: 'rock-3', name: 'Launch SC market expansion', status: 'on_track', progress: 70 },
    ],
    todoReview: {
      completedFromLast: 7,
      carriedOver: 3,
      newAssigned: 5,
    },
    idsDiscussed: 4,
    created_at: '2025-01-13T09:58:00Z',
  },
  {
    id: 'meeting-3',
    seriesId: 'series-1',
    seriesName: 'Scattered Lot Team Weekly',
    date: '2025-01-06',
    startTime: '09:00',
    endTime: '10:02',
    actualDuration: 62,
    status: INSTANCE_STATUS.COMPLETED,
    attendees: ['user-1', 'user-2', 'user-3', 'user-4'],
    absentees: [],
    facilitator: { id: 'user-1', name: 'John Smith' },
    rating: 9,
    notes: 'First meeting of Q1. Set quarterly rocks and reviewed annual targets. Team energized.',
    headlines: [
      { id: 'h4', text: 'Exceeded Q4 target by 12%', type: 'success' },
      { id: 'h5', text: 'New CRM system live this month', type: 'update' },
    ],
    scorecardReview: {
      metricsOnTrack: 9,
      metricsOffTrack: 1,
      notes: 'Strong start to quarter',
    },
    rocksReview: [
      { rockId: 'rock-1', name: 'Q1 Acquisition Target (15 lots)', status: 'on_track', progress: 0 },
      { rockId: 'rock-2', name: 'Reduce avg permit time to 45 days', status: 'on_track', progress: 0 },
      { rockId: 'rock-3', name: 'Launch SC market expansion', status: 'on_track', progress: 20 },
    ],
    todoReview: {
      completedFromLast: 5,
      carriedOver: 0,
      newAssigned: 8,
    },
    idsDiscussed: 5,
    created_at: '2025-01-06T10:02:00Z',
  },
];

let mockMeetingItems = [
  // Tasks from recent meetings
  {
    id: 'item-1',
    seriesId: 'series-1',
    meetingId: 'meeting-1',
    type: ITEM_TYPES.TASK,
    title: 'Follow up with Greenville permit office',
    description: 'Call inspector about delayed permit review for 123 Oak Street',
    status: ITEM_STATUS.IN_PROGRESS,
    priority: ITEM_PRIORITY.HIGH,
    assignee: { id: 'user-3', name: 'Mike Williams' },
    dueDate: '2025-01-24',
    createdAt: '2025-01-20',
    completedAt: null,
  },
  {
    id: 'item-2',
    seriesId: 'series-1',
    meetingId: 'meeting-1',
    type: ITEM_TYPES.TASK,
    title: 'Send LOI for Maple Avenue property',
    description: 'Prepare and send LOI based on approved terms',
    status: ITEM_STATUS.COMPLETED,
    priority: ITEM_PRIORITY.HIGH,
    assignee: { id: 'user-2', name: 'Sarah Johnson' },
    dueDate: '2025-01-22',
    createdAt: '2025-01-20',
    completedAt: '2025-01-21',
  },
  {
    id: 'item-3',
    seriesId: 'series-1',
    meetingId: 'meeting-1',
    type: ITEM_TYPES.ISSUE,
    title: 'County inspector availability causing delays',
    description: 'Mecklenburg County has 3-week backlog for inspections',
    status: ITEM_STATUS.OPEN,
    priority: ITEM_PRIORITY.CRITICAL,
    assignee: { id: 'user-1', name: 'John Smith' },
    dueDate: null,
    createdAt: '2025-01-20',
    resolution: null,
    idsNotes: 'Identified: Inspector shortage at county. Discussed: Options include expedited review fee, alternative inspectors. Solve: John to escalate to county building dept head.',
  },
  {
    id: 'item-4',
    seriesId: 'series-1',
    meetingId: 'meeting-1',
    type: ITEM_TYPES.ROCK,
    title: 'Q1 Acquisition Target - 15 Lots',
    description: 'Acquire 15 scattered lots in NC/SC markets by end of Q1',
    status: ITEM_STATUS.IN_PROGRESS,
    priority: ITEM_PRIORITY.HIGH,
    assignee: { id: 'user-2', name: 'Sarah Johnson' },
    dueDate: '2025-03-31',
    createdAt: '2025-01-06',
    progress: 73,
    milestones: [
      { name: '5 lots acquired', completed: true },
      { name: '10 lots acquired', completed: true },
      { name: '15 lots acquired', completed: false },
    ],
  },
  {
    id: 'item-5',
    seriesId: 'series-1',
    meetingId: 'meeting-1',
    type: ITEM_TYPES.DELIVERABLE,
    title: 'SC Market Analysis Report',
    description: 'Complete market analysis for South Carolina expansion targets',
    status: ITEM_STATUS.COMPLETED,
    priority: ITEM_PRIORITY.MEDIUM,
    assignee: { id: 'user-2', name: 'Sarah Johnson' },
    dueDate: '2025-01-15',
    createdAt: '2025-01-06',
    completedAt: '2025-01-14',
  },
  {
    id: 'item-6',
    seriesId: 'series-1',
    meetingId: 'meeting-1',
    type: ITEM_TYPES.SUCCESS,
    title: 'Oak Street acquisition closed under budget',
    description: 'Closed acquisition $285K under projected budget with better terms',
    status: ITEM_STATUS.COMPLETED,
    priority: ITEM_PRIORITY.LOW,
    assignee: { id: 'user-2', name: 'Sarah Johnson' },
    createdAt: '2025-01-20',
    metrics: { budgetSaved: 285000, daysAhead: 5 },
  },
  {
    id: 'item-7',
    seriesId: 'series-1',
    meetingId: 'meeting-2',
    type: ITEM_TYPES.ISSUE,
    title: 'Contractor pricing increases',
    description: 'BuildRight notified of 8% price increase effective Feb 1',
    status: ITEM_STATUS.RESOLVED,
    priority: ITEM_PRIORITY.HIGH,
    assignee: { id: 'user-3', name: 'Mike Williams' },
    createdAt: '2025-01-13',
    resolution: 'Negotiated to 5% increase with volume commitment. Locked in rates through Q2.',
    resolvedAt: '2025-01-17',
  },
  {
    id: 'item-8',
    seriesId: 'series-1',
    meetingId: null,
    type: ITEM_TYPES.NOTE,
    title: 'Team vacation schedule Q1',
    description: 'Sarah OOO Feb 10-14, Mike OOO Mar 1-5',
    status: ITEM_STATUS.OPEN,
    priority: ITEM_PRIORITY.LOW,
    assignee: null,
    createdAt: '2025-01-20',
  },
];

// ============================================
// MEETING SERIES FUNCTIONS
// ============================================

/**
 * Get all meeting series
 */
export async function getMeetingSeries(filters = {}) {
  if (isDemoMode) {
    let series = [...mockMeetingSeries];
    if (filters.status) series = series.filter(s => s.status === filters.status);
    if (filters.teamId) series = series.filter(s => s.teams.includes(filters.teamId));
    if (filters.cadence) series = series.filter(s => s.cadence === filters.cadence);
    return series;
  }

  let query = supabase.from('meeting_series').select('*');
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.cadence) query = query.eq('cadence', filters.cadence);

  const { data, error } = await query.order('name');
  if (error) throw error;
  return data;
}

/**
 * Get meeting series by ID
 */
export async function getMeetingSeriesById(seriesId) {
  if (isDemoMode) {
    return mockMeetingSeries.find(s => s.id === seriesId) || null;
  }

  const { data, error } = await supabase
    .from('meeting_series')
    .select('*')
    .eq('id', seriesId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new meeting series
 */
export async function createMeetingSeries(seriesData) {
  const series = {
    id: `series-${Date.now()}`,
    ...seriesData,
    status: SERIES_STATUS.ACTIVE,
    stats: {
      totalMeetings: 0,
      meetingsThisQuarter: 0,
      avgAttendance: 0,
      avgRating: 0,
      openIssues: 0,
      completedTasks: 0,
      activeRocks: 0,
    },
    created_at: new Date().toISOString(),
  };

  if (isDemoMode) {
    mockMeetingSeries.push(series);
    return series;
  }

  const { data, error } = await supabase
    .from('meeting_series')
    .insert([series])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update meeting series
 */
export async function updateMeetingSeries(seriesId, updates) {
  if (isDemoMode) {
    const idx = mockMeetingSeries.findIndex(s => s.id === seriesId);
    if (idx >= 0) {
      mockMeetingSeries[idx] = { ...mockMeetingSeries[idx], ...updates };
      return mockMeetingSeries[idx];
    }
    return null;
  }

  const { data, error } = await supabase
    .from('meeting_series')
    .update(updates)
    .eq('id', seriesId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// MEETING INSTANCE FUNCTIONS
// ============================================

/**
 * Get meeting instances for a series
 */
export async function getMeetingInstances(seriesId, options = {}) {
  if (isDemoMode) {
    let instances = mockMeetingInstances.filter(m => m.seriesId === seriesId);
    if (options.status) instances = instances.filter(m => m.status === options.status);
    if (options.limit) instances = instances.slice(0, options.limit);
    return instances.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  let query = supabase
    .from('meeting_instances')
    .select('*')
    .eq('series_id', seriesId);

  if (options.status) query = query.eq('status', options.status);
  if (options.limit) query = query.limit(options.limit);

  const { data, error } = await query.order('date', { ascending: false });
  if (error) throw error;
  return data;
}

/**
 * Get all upcoming meetings across all series
 */
export async function getUpcomingMeetings(days = 7) {
  if (isDemoMode) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return mockMeetingSeries
      .filter(s => s.status === SERIES_STATUS.ACTIVE)
      .map(s => ({
        seriesId: s.id,
        seriesName: s.name,
        nextMeeting: s.nextMeeting,
        teams: s.teamNames,
        participants: s.participants.length,
        facilitator: s.facilitator,
      }))
      .filter(m => new Date(m.nextMeeting) <= futureDate)
      .sort((a, b) => new Date(a.nextMeeting) - new Date(b.nextMeeting));
  }

  const { data, error } = await supabase
    .from('meeting_series')
    .select('id, name, next_meeting, teams, participants')
    .eq('status', 'active')
    .order('next_meeting');

  if (error) throw error;
  return data;
}

/**
 * Get meeting instance by ID
 */
export async function getMeetingInstanceById(meetingId) {
  if (isDemoMode) {
    return mockMeetingInstances.find(m => m.id === meetingId) || null;
  }

  const { data, error } = await supabase
    .from('meeting_instances')
    .select('*')
    .eq('id', meetingId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new meeting instance
 */
export async function createMeetingInstance(seriesId, meetingData) {
  const series = await getMeetingSeriesById(seriesId);
  if (!series) throw new Error('Meeting series not found');

  const meeting = {
    id: `meeting-${Date.now()}`,
    seriesId,
    seriesName: series.name,
    status: INSTANCE_STATUS.SCHEDULED,
    ...meetingData,
    created_at: new Date().toISOString(),
  };

  if (isDemoMode) {
    mockMeetingInstances.push(meeting);
    return meeting;
  }

  const { data, error } = await supabase
    .from('meeting_instances')
    .insert([meeting])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update meeting instance
 */
export async function updateMeetingInstance(meetingId, updates) {
  if (isDemoMode) {
    const idx = mockMeetingInstances.findIndex(m => m.id === meetingId);
    if (idx >= 0) {
      mockMeetingInstances[idx] = { ...mockMeetingInstances[idx], ...updates };
      return mockMeetingInstances[idx];
    }
    return null;
  }

  const { data, error } = await supabase
    .from('meeting_instances')
    .update(updates)
    .eq('id', meetingId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Complete a meeting
 */
export async function completeMeeting(meetingId, completionData) {
  return updateMeetingInstance(meetingId, {
    status: INSTANCE_STATUS.COMPLETED,
    endTime: completionData.endTime || new Date().toISOString(),
    actualDuration: completionData.actualDuration,
    rating: completionData.rating,
    notes: completionData.notes,
  });
}

// ============================================
// MEETING ITEMS FUNCTIONS
// ============================================

/**
 * Get items for a meeting series
 */
export async function getSeriesItems(seriesId, filters = {}) {
  if (isDemoMode) {
    let items = mockMeetingItems.filter(i => i.seriesId === seriesId);
    if (filters.type) items = items.filter(i => i.type === filters.type);
    if (filters.status) items = items.filter(i => i.status === filters.status);
    if (filters.assigneeId) items = items.filter(i => i.assignee?.id === filters.assigneeId);
    return items;
  }

  let query = supabase.from('meeting_items').select('*').eq('series_id', seriesId);
  if (filters.type) query = query.eq('type', filters.type);
  if (filters.status) query = query.eq('status', filters.status);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

/**
 * Get items for a specific meeting instance
 */
export async function getMeetingItems(meetingId) {
  if (isDemoMode) {
    return mockMeetingItems.filter(i => i.meetingId === meetingId);
  }

  const { data, error } = await supabase
    .from('meeting_items')
    .select('*')
    .eq('meeting_id', meetingId)
    .order('created_at');

  if (error) throw error;
  return data;
}

/**
 * Create a meeting item
 */
export async function createMeetingItem(itemData) {
  const item = {
    id: `item-${Date.now()}`,
    ...itemData,
    status: itemData.status || ITEM_STATUS.OPEN,
    createdAt: new Date().toISOString(),
  };

  if (isDemoMode) {
    mockMeetingItems.push(item);
    return item;
  }

  const { data, error } = await supabase
    .from('meeting_items')
    .insert([item])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a meeting item
 */
export async function updateMeetingItem(itemId, updates) {
  if (isDemoMode) {
    const idx = mockMeetingItems.findIndex(i => i.id === itemId);
    if (idx >= 0) {
      mockMeetingItems[idx] = { ...mockMeetingItems[idx], ...updates };
      return mockMeetingItems[idx];
    }
    return null;
  }

  const { data, error } = await supabase
    .from('meeting_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Complete a task/item
 */
export async function completeItem(itemId) {
  return updateMeetingItem(itemId, {
    status: ITEM_STATUS.COMPLETED,
    completedAt: new Date().toISOString(),
  });
}

/**
 * Resolve an issue
 */
export async function resolveIssue(itemId, resolution) {
  return updateMeetingItem(itemId, {
    status: ITEM_STATUS.RESOLVED,
    resolution,
    resolvedAt: new Date().toISOString(),
  });
}

// ============================================
// STATISTICS & ANALYTICS
// ============================================

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  if (isDemoMode) {
    const activeSeries = mockMeetingSeries.filter(s => s.status === SERIES_STATUS.ACTIVE);
    const recentMeetings = mockMeetingInstances.filter(m => m.status === INSTANCE_STATUS.COMPLETED);
    const openItems = mockMeetingItems.filter(i =>
      i.status === ITEM_STATUS.OPEN || i.status === ITEM_STATUS.IN_PROGRESS
    );

    return {
      activeMeetingSeries: activeSeries.length,
      meetingsThisWeek: 4,
      meetingsThisMonth: 16,
      avgMeetingRating: 8.7,
      openTasks: openItems.filter(i => i.type === ITEM_TYPES.TASK).length,
      openIssues: openItems.filter(i => i.type === ITEM_TYPES.ISSUE).length,
      activeRocks: openItems.filter(i => i.type === ITEM_TYPES.ROCK).length,
      completionRate: 87,
      totalParticipants: [...new Set(activeSeries.flatMap(s => s.participants.map(p => p.id)))].length,
    };
  }

  // Would aggregate from database
  return {};
}

/**
 * Get series statistics
 */
export async function getSeriesStats(seriesId) {
  const series = await getMeetingSeriesById(seriesId);
  const items = await getSeriesItems(seriesId);
  const meetings = await getMeetingInstances(seriesId, { limit: 12 });

  const openTasks = items.filter(i => i.type === ITEM_TYPES.TASK &&
    (i.status === ITEM_STATUS.OPEN || i.status === ITEM_STATUS.IN_PROGRESS));
  const openIssues = items.filter(i => i.type === ITEM_TYPES.ISSUE &&
    (i.status === ITEM_STATUS.OPEN || i.status === ITEM_STATUS.IN_PROGRESS));
  const activeRocks = items.filter(i => i.type === ITEM_TYPES.ROCK &&
    i.status === ITEM_STATUS.IN_PROGRESS);

  return {
    ...series?.stats,
    openTasks: openTasks.length,
    openIssues: openIssues.length,
    activeRocks: activeRocks.length,
    recentMeetings: meetings,
    taskCompletionRate: calculateCompletionRate(items.filter(i => i.type === ITEM_TYPES.TASK)),
  };
}

function calculateCompletionRate(items) {
  if (items.length === 0) return 0;
  const completed = items.filter(i => i.status === ITEM_STATUS.COMPLETED).length;
  return Math.round((completed / items.length) * 100);
}

// ============================================
// EXPORTS
// ============================================

export default {
  CADENCE_TYPES,
  SERIES_STATUS,
  INSTANCE_STATUS,
  ITEM_TYPES,
  ITEM_STATUS,
  ITEM_PRIORITY,
  MEETING_TEMPLATES,
  getMeetingSeries,
  getMeetingSeriesById,
  createMeetingSeries,
  updateMeetingSeries,
  getMeetingInstances,
  getUpcomingMeetings,
  getMeetingInstanceById,
  createMeetingInstance,
  updateMeetingInstance,
  completeMeeting,
  getSeriesItems,
  getMeetingItems,
  createMeetingItem,
  updateMeetingItem,
  completeItem,
  resolveIssue,
  getDashboardStats,
  getSeriesStats,
};
