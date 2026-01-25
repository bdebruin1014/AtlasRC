// src/pages/eos/TeamCadenceDetailPage.jsx
// Team Cadence Detail Page - Individual meeting series view

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Users, Target, CheckSquare, AlertTriangle, Plus,
  ChevronLeft, ChevronRight, Play, Pause, Settings, MoreVertical,
  Star, TrendingUp, MessageSquare, Award, Flag, FileText, Edit2,
  Trash2, CheckCircle, Circle, ArrowRight, Video, ExternalLink,
  Filter, Search, Download, RefreshCw, Bell, History, Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/*
 * TEAM CADENCE DETAIL PAGE
 *
 * Shows details for a specific routine meeting series:
 * 1. Series overview & stats
 * 2. Past meetings history
 * 3. Tasks/To-Dos
 * 4. Issues (IDS - Identify, Discuss, Solve)
 * 5. Rocks (quarterly goals)
 * 6. Deliverables
 * 7. Notes & Headlines
 * 8. Successes & Wins
 */

const TeamCadenceDetailPage = () => {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [newItemType, setNewItemType] = useState(null);

  // Mock series data
  const series = {
    id: seriesId || 'series-1',
    name: 'Scattered Lot Team Weekly',
    description: 'Weekly coordination for NC/SC scattered lot acquisition and development team. Review pipeline, active projects, and resolve blockers.',
    cadence: 'weekly',
    dayOfWeek: 1,
    time: '09:00',
    duration: 60,
    timezone: 'America/New_York',
    status: 'active',
    templateType: 'weekly_team',
    teams: ['Scattered Lot Team'],
    regions: ['NC', 'SC'],
    participants: [
      { id: 'u1', name: 'John Smith', role: 'Team Lead', email: 'john@example.com', avatar: 'JS' },
      { id: 'u2', name: 'Sarah Johnson', role: 'Acquisition Manager', email: 'sarah@example.com', avatar: 'SJ' },
      { id: 'u3', name: 'Mike Williams', role: 'Project Manager', email: 'mike@example.com', avatar: 'MW' },
      { id: 'u4', name: 'Lisa Chen', role: 'Construction Coordinator', email: 'lisa@example.com', avatar: 'LC' },
    ],
    facilitator: { id: 'u1', name: 'John Smith' },
    stats: {
      totalMeetings: 48,
      avgRating: 8.5,
      avgAttendance: 92,
      streak: 12,
    },
    agenda: [
      { order: 1, name: 'Check-in', duration: 5, description: 'Quick wins and blockers' },
      { order: 2, name: 'Pipeline Review', duration: 15, description: 'Review opportunities and projects' },
      { order: 3, name: 'Task Review', duration: 10, description: 'Review outstanding tasks' },
      { order: 4, name: 'Issues & Blockers', duration: 20, description: 'Discuss and resolve issues' },
      { order: 5, name: 'Action Items', duration: 10, description: 'Assign new tasks and next steps' },
    ],
    nextMeeting: '2025-01-27T09:00:00',
    lastMeeting: '2025-01-20T09:00:00',
  };

  // Past meetings
  const meetings = [
    {
      id: 'm1',
      date: '2025-01-20',
      startTime: '09:00',
      endTime: '10:05',
      status: 'completed',
      rating: 9,
      attendees: 4,
      absentees: 0,
      facilitator: 'John Smith',
      notes: 'Productive meeting. Closed 2 deals in Charlotte. Need to accelerate permitting for Greenville project.',
      tasksCreated: 6,
      issuesDiscussed: 3,
      issuesResolved: 2,
    },
    {
      id: 'm2',
      date: '2025-01-13',
      startTime: '09:00',
      endTime: '09:58',
      status: 'completed',
      rating: 8,
      attendees: 3,
      absentees: 1,
      facilitator: 'John Smith',
      notes: 'Mike out sick. Good progress on pipeline review. Identified issue with county inspector delays.',
      tasksCreated: 5,
      issuesDiscussed: 4,
      issuesResolved: 3,
    },
    {
      id: 'm3',
      date: '2025-01-06',
      startTime: '09:00',
      endTime: '10:02',
      status: 'completed',
      rating: 9,
      attendees: 4,
      absentees: 0,
      facilitator: 'John Smith',
      notes: 'First meeting of Q1. Set quarterly rocks and reviewed annual targets. Team energized.',
      tasksCreated: 8,
      issuesDiscussed: 5,
      issuesResolved: 4,
    },
    {
      id: 'm4',
      date: '2024-12-30',
      startTime: '09:00',
      endTime: '09:45',
      status: 'completed',
      rating: 8,
      attendees: 3,
      absentees: 1,
      facilitator: 'John Smith',
      notes: 'Short meeting due to holidays. EOY wrap-up and 2025 planning preview.',
      tasksCreated: 3,
      issuesDiscussed: 2,
      issuesResolved: 2,
    },
  ];

  // Tasks/To-Dos
  const tasks = [
    {
      id: 't1',
      title: 'Follow up with Greenville permit office',
      description: 'Call inspector about delayed permit review for 123 Oak Street',
      status: 'in_progress',
      priority: 'high',
      assignee: { id: 'u3', name: 'Mike Williams', avatar: 'MW' },
      dueDate: '2025-01-24',
      createdAt: '2025-01-20',
      meetingId: 'm1',
    },
    {
      id: 't2',
      title: 'Send LOI for Maple Avenue property',
      description: 'Prepare and send LOI based on approved terms',
      status: 'completed',
      priority: 'high',
      assignee: { id: 'u2', name: 'Sarah Johnson', avatar: 'SJ' },
      dueDate: '2025-01-22',
      createdAt: '2025-01-20',
      completedAt: '2025-01-21',
      meetingId: 'm1',
    },
    {
      id: 't3',
      title: 'Schedule contractor walkthrough for Pine Street',
      description: 'Coordinate with BuildRight for initial site assessment',
      status: 'open',
      priority: 'medium',
      assignee: { id: 'u4', name: 'Lisa Chen', avatar: 'LC' },
      dueDate: '2025-01-28',
      createdAt: '2025-01-20',
      meetingId: 'm1',
    },
    {
      id: 't4',
      title: 'Update proforma for Cedar Lane project',
      description: 'Revise numbers based on new contractor bids',
      status: 'in_progress',
      priority: 'medium',
      assignee: { id: 'u1', name: 'John Smith', avatar: 'JS' },
      dueDate: '2025-01-25',
      createdAt: '2025-01-13',
      meetingId: 'm2',
    },
    {
      id: 't5',
      title: 'Finalize SC market analysis report',
      description: 'Complete analysis for board presentation',
      status: 'completed',
      priority: 'high',
      assignee: { id: 'u2', name: 'Sarah Johnson', avatar: 'SJ' },
      dueDate: '2025-01-15',
      createdAt: '2025-01-06',
      completedAt: '2025-01-14',
      meetingId: 'm3',
    },
  ];

  // Issues (IDS)
  const issues = [
    {
      id: 'i1',
      title: 'County inspector availability causing delays',
      description: 'Mecklenburg County has 3-week backlog for inspections',
      status: 'open',
      priority: 'critical',
      assignee: { id: 'u1', name: 'John Smith', avatar: 'JS' },
      createdAt: '2025-01-20',
      meetingId: 'm1',
      idsNotes: 'Identified: Inspector shortage at county. Discussed: Options include expedited review fee, alternative inspectors. Solve: John to escalate to county building dept head.',
    },
    {
      id: 'i2',
      title: 'Contractor pricing increases',
      description: 'BuildRight notified of 8% price increase effective Feb 1',
      status: 'resolved',
      priority: 'high',
      assignee: { id: 'u3', name: 'Mike Williams', avatar: 'MW' },
      createdAt: '2025-01-13',
      resolvedAt: '2025-01-17',
      meetingId: 'm2',
      resolution: 'Negotiated to 5% increase with volume commitment. Locked in rates through Q2.',
    },
    {
      id: 'i3',
      title: 'Survey delays on Elm Street property',
      description: 'Surveyor backed up, pushing closing timeline',
      status: 'in_progress',
      priority: 'high',
      assignee: { id: 'u2', name: 'Sarah Johnson', avatar: 'SJ' },
      createdAt: '2025-01-13',
      meetingId: 'm2',
      idsNotes: 'Identified: Current surveyor has 2-week backlog. Discussed: Find alternative or expedite. Solve: Sarah reaching out to backup surveyor.',
    },
    {
      id: 'i4',
      title: 'Loan approval timeline concern',
      description: 'Lender processing slower than expected for Q1 deals',
      status: 'resolved',
      priority: 'medium',
      assignee: { id: 'u1', name: 'John Smith', avatar: 'JS' },
      createdAt: '2025-01-06',
      resolvedAt: '2025-01-10',
      meetingId: 'm3',
      resolution: 'Added second lender relationship. Now have capacity for parallel processing.',
    },
  ];

  // Rocks (Quarterly Goals)
  const rocks = [
    {
      id: 'r1',
      title: 'Q1 Acquisition Target - 15 Lots',
      description: 'Acquire 15 scattered lots in NC/SC markets by end of Q1',
      status: 'on_track',
      progress: 73,
      owner: { id: 'u2', name: 'Sarah Johnson', avatar: 'SJ' },
      dueDate: '2025-03-31',
      milestones: [
        { name: '5 lots acquired', completed: true, date: '2025-01-15' },
        { name: '10 lots acquired', completed: true, date: '2025-01-20' },
        { name: '15 lots acquired', completed: false, date: '2025-03-31' },
      ],
      currentValue: 11,
      targetValue: 15,
    },
    {
      id: 'r2',
      title: 'Reduce avg permit time to 45 days',
      description: 'Streamline permitting process to achieve 45-day average',
      status: 'off_track',
      progress: 40,
      owner: { id: 'u3', name: 'Mike Williams', avatar: 'MW' },
      dueDate: '2025-03-31',
      milestones: [
        { name: 'Document current process', completed: true, date: '2025-01-10' },
        { name: 'Identify bottlenecks', completed: true, date: '2025-01-15' },
        { name: 'Implement improvements', completed: false, date: '2025-02-28' },
        { name: 'Achieve 45-day target', completed: false, date: '2025-03-31' },
      ],
      currentValue: 58,
      targetValue: 45,
      unit: 'days',
    },
    {
      id: 'r3',
      title: 'Launch SC market expansion',
      description: 'Establish presence in Charleston and Greenville markets',
      status: 'on_track',
      progress: 85,
      owner: { id: 'u1', name: 'John Smith', avatar: 'JS' },
      dueDate: '2025-03-31',
      milestones: [
        { name: 'Market analysis complete', completed: true, date: '2025-01-14' },
        { name: 'First LOI sent', completed: true, date: '2025-01-18' },
        { name: 'First acquisition closed', completed: false, date: '2025-02-15' },
        { name: 'Local contractor network', completed: false, date: '2025-03-15' },
      ],
    },
  ];

  // Successes/Headlines
  const headlines = [
    { id: 'h1', text: 'Closed Oak Street acquisition - $285K under budget', type: 'success', date: '2025-01-20', meetingId: 'm1' },
    { id: 'h2', text: 'New contractor partnership with BuildRight Inc.', type: 'success', date: '2025-01-20', meetingId: 'm1' },
    { id: 'h3', text: 'Exceeded Q4 target by 12%', type: 'success', date: '2025-01-06', meetingId: 'm3' },
    { id: 'h4', text: 'Added 3 new properties to pipeline', type: 'update', date: '2025-01-13', meetingId: 'm2' },
    { id: 'h5', text: 'Team member Sarah completed EOS certification', type: 'achievement', date: '2025-01-06', meetingId: 'm3' },
  ];

  // Notes
  const notes = [
    { id: 'n1', text: 'Team vacation schedule: Sarah OOO Feb 10-14, Mike OOO Mar 1-5', date: '2025-01-20', author: 'John Smith' },
    { id: 'n2', text: 'Q2 planning session scheduled for March 25', date: '2025-01-06', author: 'John Smith' },
    { id: 'n3', text: 'New CRM system training scheduled for Feb 5', date: '2025-01-06', author: 'Lisa Chen' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'meetings', label: 'Meetings', icon: Calendar, count: meetings.length },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: tasks.filter(t => t.status !== 'completed').length },
    { id: 'issues', label: 'Issues', icon: AlertTriangle, count: issues.filter(i => i.status === 'open' || i.status === 'in_progress').length },
    { id: 'rocks', label: 'Rocks', icon: Target, count: rocks.length },
    { id: 'headlines', label: 'Headlines', icon: Award },
    { id: 'notes', label: 'Notes', icon: MessageSquare },
  ];

  const getDayName = (dayNum) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNum];
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-gray-100 text-gray-700',
      in_progress: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      resolved: 'bg-green-100 text-green-700',
      on_track: 'bg-green-100 text-green-700',
      off_track: 'bg-red-100 text-red-700',
      at_risk: 'bg-amber-100 text-amber-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'text-red-600',
      high: 'text-orange-600',
      medium: 'text-amber-600',
      low: 'text-gray-500',
    };
    return colors[priority] || 'text-gray-500';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTimeUntil = (dateStr) => {
    const now = new Date();
    const target = new Date(dateStr);
    const diff = target - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `${days} days`;
    return `${Math.floor(days / 7)} weeks`;
  };

  const BarChart3Icon = BarChart3;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/eos/cadence')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">{series.name}</h1>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {series.status}
                </span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {series.cadence}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{series.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" size="sm">
                <Play className="w-4 h-4 mr-2" />
                Start Meeting
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{getDayName(series.dayOfWeek)}s @ {series.time}</span>
              <span className="text-gray-400">({series.duration}min)</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{series.participants.length} participants</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{series.stats.totalMeetings} meetings</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              <span className="font-medium">{series.stats.avgRating}</span>
              <span className="text-gray-400">avg rating</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-600 font-medium">{series.stats.streak} week streak</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 flex items-center gap-1 border-t">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={cn(
                    'px-1.5 py-0.5 rounded-full text-xs',
                    activeTab === tab.id ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Next Meeting */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  Next Meeting
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatDate(series.nextMeeting)}
                    </div>
                    <div className="text-gray-500">
                      {new Date(series.nextMeeting).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      {' '}({series.duration} min)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
                      {getTimeUntil(series.nextMeeting)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Facilitated by {series.facilitator.name}
                    </div>
                  </div>
                </div>
              </div>

              {/* Agenda */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Meeting Agenda</h3>
                <div className="space-y-3">
                  {series.agenda.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-medium flex-shrink-0">
                        {item.order}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{item.name}</span>
                          <span className="text-sm text-gray-500">{item.duration} min</span>
                        </div>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {[...tasks, ...issues].slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                        'type' in item && item.type === 'issue' ? 'bg-amber-100' : 'bg-blue-100'
                      )}>
                        {issues.includes(item) ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                        ) : (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 truncate">{item.title}</span>
                          <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getStatusColor(item.status))}>
                            {item.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                          <span>{item.assignee?.name}</span>
                          <span>•</span>
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Participants */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-400" />
                    Participants
                  </span>
                  <button className="text-sm text-emerald-600 hover:text-emerald-700">Edit</button>
                </h3>
                <div className="space-y-3">
                  {series.participants.map((p) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                        {p.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{p.name}</span>
                          {p.id === series.facilitator.id && (
                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                              Facilitator
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{p.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Open Tasks</span>
                    <span className="font-medium text-blue-600">
                      {tasks.filter(t => t.status !== 'completed').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Open Issues</span>
                    <span className="font-medium text-amber-600">
                      {issues.filter(i => i.status === 'open' || i.status === 'in_progress').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Active Rocks</span>
                    <span className="font-medium text-purple-600">{rocks.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Avg Attendance</span>
                    <span className="font-medium text-gray-900">{series.stats.avgAttendance}%</span>
                  </div>
                </div>
              </div>

              {/* Rocks Progress */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Q1 Rocks
                </h3>
                <div className="space-y-4">
                  {rocks.map((rock) => (
                    <div key={rock.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 truncate">{rock.title}</span>
                        <span className={cn('px-2 py-0.5 rounded text-xs font-medium', getStatusColor(rock.status))}>
                          {rock.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              rock.status === 'on_track' ? 'bg-emerald-500' : 'bg-red-500'
                            )}
                            style={{ width: `${rock.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-10 text-right">{rock.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Meetings Tab */}
        {activeTab === 'meetings' && (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/eos/cadence/${seriesId}/meeting/${meeting.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-900">{formatDate(meeting.date)}</span>
                      <span className="text-gray-500">{meeting.startTime} - {meeting.endTime}</span>
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getStatusColor(meeting.status))}>
                        {meeting.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{meeting.notes}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {meeting.attendees}/{meeting.attendees + meeting.absentees} attended
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckSquare className="w-4 h-4" />
                        {meeting.tasksCreated} tasks
                      </span>
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {meeting.issuesResolved}/{meeting.issuesDiscussed} issues resolved
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="font-bold text-lg">{meeting.rating}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">rating</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {tasks.filter(t => t.status !== 'completed').length} open, {tasks.filter(t => t.status === 'completed').length} completed
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setNewItemType('task');
                  setShowNewItemModal(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Task
              </Button>
            </div>

            {tasks.map((task) => (
              <div key={task.id} className="bg-white rounded-lg border p-4">
                <div className="flex items-start gap-3">
                  <button className={cn(
                    'mt-0.5 flex-shrink-0',
                    task.status === 'completed' ? 'text-green-500' : 'text-gray-300 hover:text-gray-400'
                  )}>
                    {task.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        'font-medium',
                        task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'
                      )}>
                        {task.title}
                      </span>
                      <span className={cn('text-xs font-medium', getPriorityColor(task.priority))}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{task.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                          {task.assignee.avatar}
                        </div>
                        {task.assignee.name}
                      </div>
                      <span>Due {formatDate(task.dueDate)}</span>
                    </div>
                  </div>
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getStatusColor(task.status))}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Issues Tab */}
        {activeTab === 'issues' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {issues.filter(i => i.status === 'open' || i.status === 'in_progress').length} open, {issues.filter(i => i.status === 'resolved').length} resolved
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setNewItemType('issue');
                  setShowNewItemModal(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Issue
              </Button>
            </div>

            {issues.map((issue) => (
              <div key={issue.id} className="bg-white rounded-lg border p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={cn('w-5 h-5', getPriorityColor(issue.priority))} />
                    <span className="font-medium text-gray-900">{issue.title}</span>
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getStatusColor(issue.status))}>
                      {issue.status}
                    </span>
                  </div>
                  <span className={cn('text-xs font-medium', getPriorityColor(issue.priority))}>
                    {issue.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{issue.description}</p>

                {issue.idsNotes && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                    <div className="text-xs font-medium text-amber-700 mb-1">IDS Notes</div>
                    <p className="text-sm text-amber-900">{issue.idsNotes}</p>
                  </div>
                )}

                {issue.resolution && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                    <div className="text-xs font-medium text-green-700 mb-1">Resolution</div>
                    <p className="text-sm text-green-900">{issue.resolution}</p>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                      {issue.assignee.avatar}
                    </div>
                    {issue.assignee.name}
                  </div>
                  <span>Created {formatDate(issue.createdAt)}</span>
                  {issue.resolvedAt && <span>Resolved {formatDate(issue.resolvedAt)}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rocks Tab */}
        {activeTab === 'rocks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Q1 2025 Rocks</h3>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Rock
              </Button>
            </div>

            {rocks.map((rock) => (
              <div key={rock.id} className="bg-white rounded-lg border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-gray-900">{rock.title}</span>
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getStatusColor(rock.status))}>
                        {rock.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{rock.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{rock.progress}%</div>
                    <div className="text-sm text-gray-500">complete</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        rock.status === 'on_track' ? 'bg-emerald-500' : 'bg-red-500'
                      )}
                      style={{ width: `${rock.progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {rock.currentValue !== undefined && (
                    <div>
                      <div className="text-sm text-gray-500">Current</div>
                      <div className="font-semibold text-gray-900">
                        {rock.currentValue}{rock.unit ? ` ${rock.unit}` : ''}
                      </div>
                    </div>
                  )}
                  {rock.targetValue !== undefined && (
                    <div>
                      <div className="text-sm text-gray-500">Target</div>
                      <div className="font-semibold text-gray-900">
                        {rock.targetValue}{rock.unit ? ` ${rock.unit}` : ''}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-gray-500">Owner</div>
                    <div className="font-medium text-gray-900">{rock.owner.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Due Date</div>
                    <div className="font-medium text-gray-900">{formatDate(rock.dueDate)}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Milestones</div>
                  <div className="space-y-2">
                    {rock.milestones.map((ms, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {ms.completed ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-300" />
                        )}
                        <span className={cn(
                          'text-sm flex-1',
                          ms.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                        )}>
                          {ms.name}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(ms.date)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Headlines Tab */}
        {activeTab === 'headlines' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Headlines & Successes</h3>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Headline
              </Button>
            </div>

            {headlines.map((headline) => (
              <div key={headline.id} className="bg-white rounded-lg border p-4 flex items-start gap-3">
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                  headline.type === 'success' ? 'bg-green-100' :
                  headline.type === 'achievement' ? 'bg-purple-100' : 'bg-blue-100'
                )}>
                  {headline.type === 'success' ? (
                    <Award className="w-4 h-4 text-green-600" />
                  ) : headline.type === 'achievement' ? (
                    <Star className="w-4 h-4 text-purple-600" />
                  ) : (
                    <Lightbulb className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">{headline.text}</p>
                  <span className="text-sm text-gray-500">{formatDate(headline.date)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notes</h3>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Note
              </Button>
            </div>

            {notes.map((note) => (
              <div key={note.id} className="bg-white rounded-lg border p-4">
                <p className="text-gray-900 mb-2">{note.text}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{note.author}</span>
                  <span>•</span>
                  <span>{formatDate(note.date)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamCadenceDetailPage;
