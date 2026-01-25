// src/pages/eos/MeetingInstancePage.jsx
// Individual Meeting Record Page

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Users, Target, CheckSquare, AlertTriangle, Plus,
  ChevronLeft, Star, MessageSquare, Award, Edit2, Save, X,
  CheckCircle, Circle, Play, Pause, Timer, FileText, Download,
  Video, Mic, MicOff, Volume2, VolumeX, MoreVertical, ArrowRight,
  ThumbsUp, ThumbsDown, Flag, Lightbulb, TrendingUp, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/*
 * MEETING INSTANCE PAGE
 *
 * Shows details for a specific meeting occurrence:
 * 1. Meeting summary & rating
 * 2. Attendees & participation
 * 3. Agenda progress
 * 4. Scorecard review
 * 5. Rocks review
 * 6. Issues discussed (IDS)
 * 7. Tasks/To-Dos created
 * 8. Headlines shared
 * 9. Meeting notes
 */

const MeetingInstancePage = () => {
  const { seriesId, meetingId } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState('summary');

  // Mock meeting data
  const meeting = {
    id: meetingId || 'm1',
    seriesId: seriesId || 'series-1',
    seriesName: 'Scattered Lot Team Weekly',
    date: '2025-01-20',
    scheduledStart: '09:00',
    actualStart: '09:02',
    scheduledEnd: '10:00',
    actualEnd: '10:05',
    duration: 63,
    status: 'completed',
    rating: 9,
    facilitator: { id: 'u1', name: 'John Smith', avatar: 'JS' },
    attendees: [
      { id: 'u1', name: 'John Smith', role: 'Team Lead', avatar: 'JS', present: true, onTime: true },
      { id: 'u2', name: 'Sarah Johnson', role: 'Acquisition Manager', avatar: 'SJ', present: true, onTime: true },
      { id: 'u3', name: 'Mike Williams', role: 'Project Manager', avatar: 'MW', present: true, onTime: false, lateMinutes: 5 },
      { id: 'u4', name: 'Lisa Chen', role: 'Construction Coordinator', avatar: 'LC', present: true, onTime: true },
    ],
    absentees: [],
    notes: 'Productive meeting. Closed 2 deals in Charlotte. Need to accelerate permitting for Greenville project. Team morale high after Q4 performance.',
    summary: 'Strong week with two closings. Main focus on permitting delays affecting Q1 timeline. New contractor partnership announced.',
  };

  // Agenda items with progress
  const agenda = [
    { order: 1, name: 'Check-in', duration: 5, actualDuration: 6, completed: true, notes: 'Everyone shared quick wins. Mike mentioned contractor partnership opportunity.' },
    { order: 2, name: 'Pipeline Review', duration: 15, actualDuration: 18, completed: true, notes: 'Reviewed 8 active opportunities. 2 deals closing this week.' },
    { order: 3, name: 'Task Review', duration: 10, actualDuration: 8, completed: true, notes: '8 of 10 tasks completed from last week. 2 carried over.' },
    { order: 4, name: 'Issues & Blockers', duration: 20, actualDuration: 25, completed: true, notes: 'Discussed 3 issues. Resolved contractor pricing, escalated inspector availability.' },
    { order: 5, name: 'Action Items', duration: 10, actualDuration: 6, completed: true, notes: '6 new tasks assigned. Clear owners and due dates.' },
  ];

  // Scorecard metrics
  const scorecard = {
    metricsOnTrack: 8,
    metricsOffTrack: 2,
    metrics: [
      { name: 'Weekly Acquisitions', target: 2, actual: 3, status: 'above', trend: 'up' },
      { name: 'Pipeline Value', target: 2000000, actual: 2450000, status: 'above', trend: 'up', format: 'currency' },
      { name: 'Avg Days to Close', target: 45, actual: 42, status: 'above', trend: 'stable', format: 'days' },
      { name: 'Permit Submissions', target: 3, actual: 2, status: 'below', trend: 'down' },
      { name: 'Active Projects', target: 12, actual: 14, status: 'above', trend: 'up' },
      { name: 'Construction Starts', target: 2, actual: 2, status: 'on_target', trend: 'stable' },
      { name: 'Avg Permit Time', target: 45, actual: 58, status: 'below', trend: 'down', format: 'days' },
      { name: 'Budget Variance', target: 0, actual: -2.5, status: 'above', trend: 'up', format: 'percent' },
    ],
  };

  // Rocks reviewed
  const rocksReview = [
    { id: 'r1', name: 'Q1 Acquisition Target (15 lots)', owner: 'Sarah Johnson', status: 'on_track', progress: 73, lastWeek: 60, notes: 'Added 2 lots this week. On pace for Q1 target.' },
    { id: 'r2', name: 'Reduce avg permit time to 45 days', owner: 'Mike Williams', status: 'off_track', progress: 40, lastWeek: 35, notes: 'Inspector availability impacting timeline. Escalating to county.' },
    { id: 'r3', name: 'Launch SC market expansion', owner: 'John Smith', status: 'on_track', progress: 85, lastWeek: 70, notes: 'First SC LOI sent. Market analysis complete.' },
  ];

  // Issues discussed (IDS)
  const issuesDiscussed = [
    {
      id: 'i1',
      title: 'County inspector availability causing delays',
      status: 'escalated',
      priority: 'critical',
      owner: { name: 'John Smith', avatar: 'JS' },
      identified: 'Mecklenburg County has 3-week backlog for inspections affecting 4 projects.',
      discussed: 'Options: expedited review fee ($500/inspection), alternative third-party inspectors, escalate to building dept head.',
      solved: 'John to schedule meeting with county building department head. Budget approved for expedited fees if needed.',
      outcome: 'escalated',
      nextSteps: 'Meeting scheduled for 1/24. Will report back next week.',
    },
    {
      id: 'i2',
      title: 'BuildRight pricing increase',
      status: 'resolved',
      priority: 'high',
      owner: { name: 'Mike Williams', avatar: 'MW' },
      identified: 'BuildRight notified of 8% price increase effective Feb 1.',
      discussed: 'Counter-offer options, volume commitment, alternative contractors.',
      solved: 'Negotiated to 5% with volume commitment (10 projects/quarter). Rates locked through Q2.',
      outcome: 'resolved',
      nextSteps: 'Mike to get updated MSA signed by 1/25.',
    },
    {
      id: 'i3',
      title: 'Pipeline CRM data quality',
      status: 'dropped',
      priority: 'low',
      owner: { name: 'Sarah Johnson', avatar: 'SJ' },
      identified: 'Some pipeline entries missing key fields.',
      discussed: 'Not urgent - new CRM launching Feb 5 will address.',
      solved: 'Defer to new CRM rollout.',
      outcome: 'dropped',
      nextSteps: 'Will be addressed in new system.',
    },
  ];

  // Tasks/To-Dos created
  const tasksCreated = [
    { id: 't1', title: 'Follow up with Greenville permit office', assignee: 'Mike Williams', dueDate: '2025-01-24', priority: 'high' },
    { id: 't2', title: 'Send LOI for Maple Avenue property', assignee: 'Sarah Johnson', dueDate: '2025-01-22', priority: 'high' },
    { id: 't3', title: 'Schedule contractor walkthrough for Pine Street', assignee: 'Lisa Chen', dueDate: '2025-01-28', priority: 'medium' },
    { id: 't4', title: 'Get BuildRight MSA signed', assignee: 'Mike Williams', dueDate: '2025-01-25', priority: 'high' },
    { id: 't5', title: 'Schedule meeting with county building dept', assignee: 'John Smith', dueDate: '2025-01-22', priority: 'critical' },
    { id: 't6', title: 'Update SC market analysis presentation', assignee: 'Sarah Johnson', dueDate: '2025-01-27', priority: 'medium' },
  ];

  // Tasks from last week
  const tasksFromLastWeek = [
    { id: 'lt1', title: 'Finalize Oak Street closing docs', assignee: 'Sarah Johnson', status: 'completed' },
    { id: 'lt2', title: 'Review BuildRight bid for Cedar Lane', assignee: 'Mike Williams', status: 'completed' },
    { id: 'lt3', title: 'Submit permit for 456 Elm Street', assignee: 'Lisa Chen', status: 'completed' },
    { id: 'lt4', title: 'Update proforma for Pine Street', assignee: 'John Smith', status: 'carried_over' },
    { id: 'lt5', title: 'Call county about inspection backlog', assignee: 'Mike Williams', status: 'carried_over' },
  ];

  // Headlines shared
  const headlines = [
    { id: 'h1', type: 'success', text: 'Closed Oak Street acquisition - $285K under budget', sharedBy: 'Sarah Johnson' },
    { id: 'h2', type: 'success', text: 'New contractor partnership with BuildRight Inc.', sharedBy: 'Mike Williams' },
    { id: 'h3', type: 'customer', text: 'Positive feedback from Greenville seller on closing experience', sharedBy: 'Sarah Johnson' },
    { id: 'h4', type: 'employee', text: 'Lisa completed project management certification', sharedBy: 'John Smith' },
  ];

  const sections = [
    { id: 'summary', label: 'Summary', icon: BarChart3 },
    { id: 'attendees', label: 'Attendees', icon: Users },
    { id: 'agenda', label: 'Agenda', icon: FileText },
    { id: 'scorecard', label: 'Scorecard', icon: TrendingUp },
    { id: 'rocks', label: 'Rocks', icon: Target },
    { id: 'issues', label: 'IDS', icon: AlertTriangle },
    { id: 'tasks', label: 'To-Dos', icon: CheckSquare },
    { id: 'headlines', label: 'Headlines', icon: Award },
  ];

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      on_track: 'bg-green-100 text-green-700',
      off_track: 'bg-red-100 text-red-700',
      at_risk: 'bg-amber-100 text-amber-700',
      resolved: 'bg-green-100 text-green-700',
      escalated: 'bg-purple-100 text-purple-700',
      dropped: 'bg-gray-100 text-gray-600',
      completed: 'bg-green-100 text-green-700',
      carried_over: 'bg-amber-100 text-amber-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'text-red-600 bg-red-50',
      high: 'text-orange-600 bg-orange-50',
      medium: 'text-amber-600 bg-amber-50',
      low: 'text-gray-500 bg-gray-50',
    };
    return colors[priority] || 'text-gray-500 bg-gray-50';
  };

  const formatMetricValue = (value, format) => {
    if (format === 'currency') return `$${(value / 1000000).toFixed(2)}M`;
    if (format === 'percent') return `${value > 0 ? '+' : ''}${value}%`;
    if (format === 'days') return `${value} days`;
    return value;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4 mb-3">
            <button
              onClick={() => navigate(`/eos/cadence/${seriesId}`)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">{meeting.seriesName}</h1>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {meeting.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{formatDate(meeting.date)}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-500 fill-current" />
                <span className="text-2xl font-bold text-gray-900">{meeting.rating}</span>
                <span className="text-gray-500">/10</span>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{meeting.actualStart} - {meeting.actualEnd}</span>
              <span className="text-gray-400">({meeting.duration} min)</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{meeting.attendees.length} attendees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{tasksCreated.length} tasks created</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{issuesDiscussed.length} issues discussed</span>
            </div>
          </div>
        </div>

        {/* Section Nav */}
        <div className="px-6 flex items-center gap-1 border-t overflow-x-auto">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors',
                  activeSection === section.id
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                <Icon className="w-4 h-4" />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-5xl mx-auto">
        {/* Summary Section */}
        {activeSection === 'summary' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Meeting Summary</h3>
              <p className="text-gray-700 leading-relaxed">{meeting.summary}</p>
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Detailed Notes</h4>
                <p className="text-gray-600 text-sm">{meeting.notes}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border p-4 text-center">
                <div className="text-3xl font-bold text-emerald-600">{meeting.rating}</div>
                <div className="text-sm text-gray-500">Meeting Rating</div>
              </div>
              <div className="bg-white rounded-lg border p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{scorecard.metricsOnTrack}/{scorecard.metrics.length}</div>
                <div className="text-sm text-gray-500">Metrics On Track</div>
              </div>
              <div className="bg-white rounded-lg border p-4 text-center">
                <div className="text-3xl font-bold text-purple-600">{rocksReview.filter(r => r.status === 'on_track').length}/{rocksReview.length}</div>
                <div className="text-sm text-gray-500">Rocks On Track</div>
              </div>
              <div className="bg-white rounded-lg border p-4 text-center">
                <div className="text-3xl font-bold text-amber-600">{issuesDiscussed.filter(i => i.status === 'resolved').length}/{issuesDiscussed.length}</div>
                <div className="text-sm text-gray-500">Issues Resolved</div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Key Takeaways</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Closed 2 deals in Charlotte, $285K under budget on Oak Street</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Secured BuildRight contractor partnership with favorable pricing</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Inspector availability issue escalated - meeting scheduled with county</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">SC market expansion on track - first LOI sent</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Attendees Section */}
        {activeSection === 'attendees' && (
          <div className="bg-white rounded-lg border">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900">Attendance ({meeting.attendees.filter(a => a.present).length}/{meeting.attendees.length})</h3>
            </div>
            <div className="divide-y">
              {meeting.attendees.map((attendee) => (
                <div key={attendee.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                      {attendee.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{attendee.name}</span>
                        {attendee.id === meeting.facilitator.id && (
                          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                            Facilitator
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{attendee.role}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {attendee.present ? (
                      <>
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          Present
                        </span>
                        {!attendee.onTime && (
                          <span className="text-sm text-amber-600">+{attendee.lateMinutes}min late</span>
                        )}
                      </>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600">
                        <X className="w-4 h-4" />
                        Absent
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agenda Section */}
        {activeSection === 'agenda' && (
          <div className="space-y-4">
            {agenda.map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg border p-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {item.order}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{item.name}</span>
                        {item.completed && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Planned: {item.duration}min</span>
                        <span className={cn(
                          'font-medium',
                          item.actualDuration > item.duration ? 'text-amber-600' : 'text-green-600'
                        )}>
                          Actual: {item.actualDuration}min
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{item.notes}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <div className="text-sm text-gray-600">
                Total Duration: <span className="font-medium">{meeting.duration} minutes</span>
                {' '}(Planned: {agenda.reduce((sum, a) => sum + a.duration, 0)} min)
              </div>
            </div>
          </div>
        )}

        {/* Scorecard Section */}
        {activeSection === 'scorecard' && (
          <div className="bg-white rounded-lg border">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Weekly Scorecard</h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-green-600 font-medium">{scorecard.metricsOnTrack} on track</span>
                <span className="text-red-600 font-medium">{scorecard.metricsOffTrack} off track</span>
              </div>
            </div>
            <div className="divide-y">
              {scorecard.metrics.map((metric, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">{metric.name}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Target</div>
                      <div className="font-medium">{formatMetricValue(metric.target, metric.format)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Actual</div>
                      <div className={cn(
                        'font-medium',
                        metric.status === 'above' ? 'text-green-600' :
                        metric.status === 'below' ? 'text-red-600' : 'text-gray-900'
                      )}>
                        {formatMetricValue(metric.actual, metric.format)}
                      </div>
                    </div>
                    <div className="w-20">
                      {metric.trend === 'up' && <TrendingUp className="w-5 h-5 text-green-500" />}
                      {metric.trend === 'down' && <TrendingUp className="w-5 h-5 text-red-500 rotate-180" />}
                      {metric.trend === 'stable' && <ArrowRight className="w-5 h-5 text-gray-400" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rocks Section */}
        {activeSection === 'rocks' && (
          <div className="space-y-4">
            {rocksReview.map((rock) => (
              <div key={rock.id} className="bg-white rounded-lg border p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-900">{rock.name}</span>
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getStatusColor(rock.status))}>
                      {rock.status.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{rock.owner}</span>
                </div>
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium">{rock.progress}% (last week: {rock.lastWeek}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        rock.status === 'on_track' ? 'bg-emerald-500' : 'bg-red-500'
                      )}
                      style={{ width: `${rock.progress}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600">{rock.notes}</p>
              </div>
            ))}
          </div>
        )}

        {/* IDS Section */}
        {activeSection === 'issues' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-1">IDS Process</h4>
              <p className="text-sm text-blue-700">
                <strong>I</strong>dentify the real issue, <strong>D</strong>iscuss possible solutions, <strong>S</strong>olve with a clear decision and owner.
              </p>
            </div>

            {issuesDiscussed.map((issue) => (
              <div key={issue.id} className="bg-white rounded-lg border">
                <div className="p-4 border-b">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      <span className="font-medium text-gray-900">{issue.title}</span>
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getStatusColor(issue.status))}>
                        {issue.status}
                      </span>
                    </div>
                    <span className={cn('px-2 py-0.5 rounded text-xs font-medium', getPriorityColor(issue.priority))}>
                      {issue.priority}
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">I</span>
                      Identify
                    </div>
                    <p className="text-sm text-gray-600 ml-8">{issue.identified}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">D</span>
                      Discuss
                    </div>
                    <p className="text-sm text-gray-600 ml-8">{issue.discussed}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">S</span>
                      Solve
                    </div>
                    <p className="text-sm text-gray-600 ml-8">{issue.solved}</p>
                  </div>
                  {issue.nextSteps && (
                    <div className="ml-8 bg-gray-50 rounded-lg p-3">
                      <div className="text-xs font-medium text-gray-500 mb-1">Next Steps</div>
                      <p className="text-sm text-gray-700">{issue.nextSteps}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tasks Section */}
        {activeSection === 'tasks' && (
          <div className="space-y-6">
            {/* Last Week's Tasks */}
            <div className="bg-white rounded-lg border">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-900">Last Week's To-Dos</h3>
              </div>
              <div className="divide-y">
                {tasksFromLastWeek.map((task) => (
                  <div key={task.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {task.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <ArrowRight className="w-5 h-5 text-amber-500" />
                      )}
                      <span className={cn(
                        task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'
                      )}>
                        {task.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">{task.assignee}</span>
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getStatusColor(task.status))}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* New Tasks Created */}
            <div className="bg-white rounded-lg border">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-900">New To-Dos Created ({tasksCreated.length})</h3>
              </div>
              <div className="divide-y">
                {tasksCreated.map((task) => (
                  <div key={task.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Circle className="w-5 h-5 text-gray-300" />
                      <span className="text-gray-900">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">{task.assignee}</span>
                      <span className="text-sm text-gray-500">Due {task.dueDate}</span>
                      <span className={cn('px-2 py-0.5 rounded text-xs font-medium', getPriorityColor(task.priority))}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Headlines Section */}
        {activeSection === 'headlines' && (
          <div className="space-y-4">
            {headlines.map((headline) => (
              <div key={headline.id} className="bg-white rounded-lg border p-4 flex items-start gap-3">
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                  headline.type === 'success' ? 'bg-green-100' :
                  headline.type === 'customer' ? 'bg-blue-100' :
                  headline.type === 'employee' ? 'bg-purple-100' : 'bg-gray-100'
                )}>
                  {headline.type === 'success' && <Award className="w-4 h-4 text-green-600" />}
                  {headline.type === 'customer' && <ThumbsUp className="w-4 h-4 text-blue-600" />}
                  {headline.type === 'employee' && <Star className="w-4 h-4 text-purple-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">{headline.text}</p>
                  <span className="text-sm text-gray-500">Shared by {headline.sharedBy}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingInstancePage;
