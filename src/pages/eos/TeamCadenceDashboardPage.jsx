// src/pages/eos/TeamCadenceDashboardPage.jsx
// Team Cadence Dashboard - Overview of all routine meetings

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Users, Target, CheckSquare, AlertTriangle,
  Plus, Search, Filter, MoreVertical, ChevronRight, Play, Pause,
  BarChart3, TrendingUp, Star, RefreshCw, Video, MapPin, Building2,
  Flag, ListTodo, MessageSquare, Award, Edit2, Trash2, Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/*
 * TEAM CADENCE DASHBOARD
 *
 * Features:
 * 1. Overview of all routine meeting series
 * 2. Upcoming meetings calendar view
 * 3. Quick stats and health indicators
 * 4. Create new meeting series
 * 5. Filter by team, cadence, status
 */

const TeamCadenceDashboardPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCadence, setFilterCadence] = useState('all');
  const [filterStatus, setFilterStatus] = useState('active');
  const [viewMode, setViewMode] = useState('cards'); // 'cards', 'list', 'calendar'
  const [showNewSeriesModal, setShowNewSeriesModal] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState(null);

  // Mock meeting series data
  const meetingSeries = [
    {
      id: 'series-1',
      name: 'Scattered Lot Team Weekly',
      description: 'Weekly coordination for NC/SC scattered lot acquisition and development team',
      cadence: 'weekly',
      dayOfWeek: 1,
      time: '09:00',
      duration: 60,
      status: 'active',
      templateType: 'weekly_team',
      teams: ['Scattered Lot Team'],
      regions: ['NC', 'SC'],
      participants: [
        { id: 'u1', name: 'John Smith', role: 'Team Lead', avatar: 'JS' },
        { id: 'u2', name: 'Sarah Johnson', role: 'Acquisition Manager', avatar: 'SJ' },
        { id: 'u3', name: 'Mike Williams', role: 'Project Manager', avatar: 'MW' },
        { id: 'u4', name: 'Lisa Chen', role: 'Construction Coordinator', avatar: 'LC' },
      ],
      facilitator: { id: 'u1', name: 'John Smith' },
      stats: {
        totalMeetings: 48,
        avgRating: 8.5,
        avgAttendance: 92,
        streak: 12,
        openIssues: 5,
        openTasks: 8,
        activeRocks: 3,
      },
      nextMeeting: '2025-01-27T09:00:00',
      lastMeeting: '2025-01-20T09:00:00',
      lastMeetingRating: 9,
    },
    {
      id: 'series-2',
      name: 'Leadership L10',
      description: 'Executive leadership weekly Level 10 meeting following EOS methodology',
      cadence: 'weekly',
      dayOfWeek: 4,
      time: '08:00',
      duration: 90,
      status: 'active',
      templateType: 'l10',
      teams: ['Executive Team'],
      regions: [],
      participants: [
        { id: 'u5', name: 'Robert Van', role: 'CEO/Visionary', avatar: 'RV' },
        { id: 'u6', name: 'Emily Davis', role: 'COO/Integrator', avatar: 'ED' },
        { id: 'u1', name: 'John Smith', role: 'VP Development', avatar: 'JS' },
        { id: 'u7', name: 'David Brown', role: 'CFO', avatar: 'DB' },
        { id: 'u8', name: 'Amanda Wilson', role: 'VP Sales', avatar: 'AW' },
      ],
      facilitator: { id: 'u6', name: 'Emily Davis' },
      stats: {
        totalMeetings: 96,
        avgRating: 9.2,
        avgAttendance: 98,
        streak: 24,
        openIssues: 8,
        openTasks: 12,
        activeRocks: 5,
      },
      nextMeeting: '2025-01-30T08:00:00',
      lastMeeting: '2025-01-23T08:00:00',
      lastMeetingRating: 9,
    },
    {
      id: 'series-3',
      name: 'Construction Team Sync',
      description: 'Weekly construction operations and project coordination',
      cadence: 'weekly',
      dayOfWeek: 2,
      time: '07:30',
      duration: 45,
      status: 'active',
      templateType: 'project_status',
      teams: ['Construction Team'],
      regions: ['NC', 'SC', 'GA'],
      participants: [
        { id: 'u3', name: 'Mike Williams', role: 'Construction Director', avatar: 'MW' },
        { id: 'u4', name: 'Lisa Chen', role: 'Project Coordinator', avatar: 'LC' },
        { id: 'u9', name: 'Tom Anderson', role: 'Site Supervisor - NC', avatar: 'TA' },
        { id: 'u10', name: 'Chris Martinez', role: 'Site Supervisor - SC', avatar: 'CM' },
      ],
      facilitator: { id: 'u3', name: 'Mike Williams' },
      stats: {
        totalMeetings: 72,
        avgRating: 8.1,
        avgAttendance: 88,
        streak: 8,
        openIssues: 12,
        openTasks: 15,
        activeRocks: 4,
      },
      nextMeeting: '2025-01-28T07:30:00',
      lastMeeting: '2025-01-21T07:30:00',
      lastMeetingRating: 8,
    },
    {
      id: 'series-4',
      name: 'Monthly Operations Review',
      description: 'Monthly all-hands operations review and planning session',
      cadence: 'monthly',
      dayOfMonth: 1,
      weekOfMonth: 1,
      dayOfWeek: 3,
      time: '14:00',
      duration: 90,
      status: 'active',
      templateType: 'operations_review',
      teams: ['Executive Team', 'Scattered Lot Team', 'Construction Team'],
      regions: [],
      participants: [
        { id: 'u5', name: 'Robert Van', role: 'CEO', avatar: 'RV' },
        { id: 'u6', name: 'Emily Davis', role: 'COO', avatar: 'ED' },
        { id: 'u1', name: 'John Smith', role: 'VP Development', avatar: 'JS' },
        { id: 'u3', name: 'Mike Williams', role: 'Construction Director', avatar: 'MW' },
      ],
      facilitator: { id: 'u6', name: 'Emily Davis' },
      stats: {
        totalMeetings: 24,
        avgRating: 8.8,
        avgAttendance: 95,
        streak: 12,
        openIssues: 3,
        openTasks: 6,
        activeRocks: 8,
      },
      nextMeeting: '2025-02-05T14:00:00',
      lastMeeting: '2025-01-08T14:00:00',
      lastMeetingRating: 9,
    },
    {
      id: 'series-5',
      name: 'Permitting Team Standup',
      description: 'Daily standup for permitting coordination',
      cadence: 'weekly',
      dayOfWeek: 1,
      time: '08:00',
      duration: 15,
      status: 'paused',
      templateType: 'standup',
      teams: ['Permitting Team'],
      regions: ['NC'],
      participants: [
        { id: 'u11', name: 'Jennifer Lee', role: 'Permit Coordinator', avatar: 'JL' },
        { id: 'u12', name: 'Mark Thompson', role: 'Permit Specialist', avatar: 'MT' },
      ],
      facilitator: { id: 'u11', name: 'Jennifer Lee' },
      stats: {
        totalMeetings: 45,
        avgRating: 7.5,
        avgAttendance: 85,
        streak: 0,
        openIssues: 2,
        openTasks: 4,
        activeRocks: 1,
      },
      nextMeeting: null,
      lastMeeting: '2024-12-15T08:00:00',
      lastMeetingRating: 7,
    },
  ];

  // Dashboard statistics
  const dashboardStats = useMemo(() => {
    const active = meetingSeries.filter(s => s.status === 'active');
    return {
      activeSeries: active.length,
      totalParticipants: [...new Set(meetingSeries.flatMap(s => s.participants.map(p => p.id)))].length,
      meetingsThisWeek: active.filter(s => s.cadence === 'weekly').length,
      avgRating: (active.reduce((sum, s) => sum + s.stats.avgRating, 0) / active.length).toFixed(1),
      openIssues: active.reduce((sum, s) => sum + s.stats.openIssues, 0),
      openTasks: active.reduce((sum, s) => sum + s.stats.openTasks, 0),
      activeRocks: active.reduce((sum, s) => sum + s.stats.activeRocks, 0),
    };
  }, [meetingSeries]);

  // Filter series
  const filteredSeries = useMemo(() => {
    return meetingSeries.filter(series => {
      const matchesSearch = series.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        series.teams.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCadence = filterCadence === 'all' || series.cadence === filterCadence;
      const matchesStatus = filterStatus === 'all' || series.status === filterStatus;
      return matchesSearch && matchesCadence && matchesStatus;
    });
  }, [meetingSeries, searchQuery, filterCadence, filterStatus]);

  // Upcoming meetings (next 7 days)
  const upcomingMeetings = useMemo(() => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return meetingSeries
      .filter(s => s.status === 'active' && s.nextMeeting)
      .map(s => ({
        seriesId: s.id,
        seriesName: s.name,
        date: new Date(s.nextMeeting),
        time: s.time,
        duration: s.duration,
        teams: s.teams,
        participants: s.participants.length,
        facilitator: s.facilitator,
      }))
      .filter(m => m.date <= weekFromNow)
      .sort((a, b) => a.date - b.date);
  }, [meetingSeries]);

  const getDayName = (dayNum) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNum];
  };

  const getCadenceBadge = (cadence) => {
    const styles = {
      weekly: 'bg-blue-100 text-blue-700',
      biweekly: 'bg-purple-100 text-purple-700',
      monthly: 'bg-green-100 text-green-700',
      quarterly: 'bg-amber-100 text-amber-700',
    };
    return styles[cadence] || 'bg-gray-100 text-gray-700';
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      paused: 'bg-amber-100 text-amber-700',
      archived: 'bg-gray-100 text-gray-600',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };
  };

  const getTimeUntil = (dateStr) => {
    const now = new Date();
    const target = new Date(dateStr);
    const diff = target - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Soon';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Cadence</h1>
          <p className="text-gray-500 mt-1">Manage routine meetings and team coordination</p>
        </div>
        <Button
          onClick={() => setShowNewSeriesModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Meeting Series
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Calendar className="w-4 h-4" />
            Active Series
          </div>
          <div className="text-2xl font-bold text-gray-900">{dashboardStats.activeSeries}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <RefreshCw className="w-4 h-4" />
            This Week
          </div>
          <div className="text-2xl font-bold text-gray-900">{dashboardStats.meetingsThisWeek}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Users className="w-4 h-4" />
            Participants
          </div>
          <div className="text-2xl font-bold text-gray-900">{dashboardStats.totalParticipants}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Star className="w-4 h-4" />
            Avg Rating
          </div>
          <div className="text-2xl font-bold text-emerald-600">{dashboardStats.avgRating}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <AlertTriangle className="w-4 h-4" />
            Open Issues
          </div>
          <div className="text-2xl font-bold text-amber-600">{dashboardStats.openIssues}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <ListTodo className="w-4 h-4" />
            Open Tasks
          </div>
          <div className="text-2xl font-bold text-blue-600">{dashboardStats.openTasks}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Target className="w-4 h-4" />
            Active Rocks
          </div>
          <div className="text-2xl font-bold text-purple-600">{dashboardStats.activeRocks}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meeting Series List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-lg border p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search meetings or teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                value={filterCadence}
                onChange={(e) => setFilterCadence(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Cadences</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Series Cards */}
          <div className="space-y-4">
            {filteredSeries.map((series) => {
              const nextMeetingInfo = series.nextMeeting ? formatDateTime(series.nextMeeting) : null;

              return (
                <div
                  key={series.id}
                  className="bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/eos/cadence/${series.id}`)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{series.name}</h3>
                          <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getCadenceBadge(series.cadence))}>
                            {series.cadence}
                          </span>
                          <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getStatusBadge(series.status))}>
                            {series.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-1">{series.description}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSeries(series);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>

                    {/* Teams & Schedule */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {series.teams.join(', ')}
                      </div>
                      {series.regions.length > 0 && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {series.regions.join(', ')}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {getDayName(series.dayOfWeek)}s @ {series.time} ({series.duration}min)
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{series.stats.totalMeetings} meetings</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500" />
                        <span className="font-medium">{series.stats.avgRating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-600">{series.stats.streak} week streak</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span className="text-gray-600">{series.stats.openIssues} issues</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckSquare className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-600">{series.stats.openTasks} tasks</span>
                      </div>
                    </div>

                    {/* Participants & Next Meeting */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {series.participants.slice(0, 4).map((p, idx) => (
                            <div
                              key={p.id}
                              className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium"
                              title={p.name}
                            >
                              {p.avatar}
                            </div>
                          ))}
                          {series.participants.length > 4 && (
                            <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500">
                              +{series.participants.length - 4}
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {series.participants.length} participants
                        </span>
                      </div>
                      {nextMeetingInfo && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Next:</span>
                          <span className="text-sm font-medium text-gray-700">
                            {nextMeetingInfo.date} @ {nextMeetingInfo.time}
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs font-medium">
                            {getTimeUntil(series.nextMeeting)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredSeries.length === 0 && (
              <div className="bg-white rounded-lg border p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 mb-1">No meeting series found</h3>
                <p className="text-sm text-gray-500">
                  {searchQuery || filterCadence !== 'all' || filterStatus !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create your first routine meeting series to get started'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Upcoming Meetings & Quick Actions */}
        <div className="space-y-6">
          {/* Upcoming Meetings */}
          <div className="bg-white rounded-lg border">
            <div className="px-4 py-3 border-b">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                Upcoming This Week
              </h3>
            </div>
            <div className="divide-y max-h-[400px] overflow-auto">
              {upcomingMeetings.length > 0 ? (
                upcomingMeetings.map((meeting, idx) => {
                  const meetingDate = formatDateTime(meeting.date);
                  return (
                    <div
                      key={idx}
                      className="p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/eos/cadence/${meeting.seriesId}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">{meeting.seriesName}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {meetingDate.date} @ {meetingDate.time}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">
                              {meeting.teams.join(', ')}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                            {getTimeUntil(meeting.date)}
                          </span>
                          <div className="text-xs text-gray-400 mt-1">
                            {meeting.duration}min
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">
                  No meetings scheduled this week
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border">
            <div className="px-4 py-3 border-b">
              <h3 className="font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-3 space-y-2">
              <button
                onClick={() => setShowNewSeriesModal(true)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Create Meeting Series</div>
                  <div className="text-xs text-gray-500">Set up a new routine meeting</div>
                </div>
              </button>
              <button
                onClick={() => navigate('/eos')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Target className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">EOS Programs</div>
                  <div className="text-xs text-gray-500">View EOS implementation</div>
                </div>
              </button>
              <button
                onClick={() => navigate('/operations/tasks')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <ListTodo className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Global Tasks</div>
                  <div className="text-xs text-gray-500">View all team tasks</div>
                </div>
              </button>
            </div>
          </div>

          {/* Meeting Templates */}
          <div className="bg-white rounded-lg border">
            <div className="px-4 py-3 border-b">
              <h3 className="font-semibold text-gray-900">Meeting Templates</h3>
            </div>
            <div className="p-3 space-y-2">
              {[
                { id: 'l10', name: 'Level 10 (L10)', desc: 'EOS weekly leadership', color: 'purple' },
                { id: 'weekly_team', name: 'Weekly Team Sync', desc: 'Standard team meeting', color: 'blue' },
                { id: 'project_status', name: 'Project Status', desc: 'Project coordination', color: 'green' },
                { id: 'operations_review', name: 'Ops Review', desc: 'Monthly operations', color: 'amber' },
              ].map((template) => (
                <div
                  key={template.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setShowNewSeriesModal(true);
                    // Would pre-select template
                  }}
                >
                  <div className={cn('w-2 h-8 rounded-full', `bg-${template.color}-500`)} />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{template.name}</div>
                    <div className="text-xs text-gray-500">{template.desc}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Series Modal */}
      {showNewSeriesModal && (
        <NewSeriesModal
          onClose={() => setShowNewSeriesModal(false)}
          onSave={(series) => {
            console.log('Creating series:', series);
            setShowNewSeriesModal(false);
          }}
        />
      )}
    </div>
  );
};

// New Series Modal Component
const NewSeriesModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cadence: 'weekly',
    dayOfWeek: 1,
    time: '09:00',
    duration: 60,
    templateId: 'weekly_team',
    teams: [],
    regions: [],
  });

  const templates = [
    { id: 'l10', name: 'Level 10 Meeting', duration: 90 },
    { id: 'weekly_team', name: 'Weekly Team Sync', duration: 60 },
    { id: 'project_status', name: 'Project Status', duration: 45 },
    { id: 'operations_review', name: 'Operations Review', duration: 90 },
  ];

  const teams = [
    { id: 'team-1', name: 'Executive Team' },
    { id: 'team-2', name: 'Scattered Lot Team' },
    { id: 'team-3', name: 'Construction Team' },
    { id: 'team-4', name: 'Sales Team' },
    { id: 'team-5', name: 'Permitting Team' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-auto">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Create Meeting Series</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Series Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Scattered Lot Team Weekly"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this meeting series..."
              className="w-full border rounded-md px-3 py-2 text-sm"
              rows={2}
            />
          </div>

          {/* Template */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Template</label>
            <select
              value={formData.templateId}
              onChange={(e) => {
                const template = templates.find(t => t.id === e.target.value);
                setFormData({
                  ...formData,
                  templateId: e.target.value,
                  duration: template?.duration || 60,
                });
              }}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.duration}min)</option>
              ))}
            </select>
          </div>

          {/* Cadence & Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cadence</label>
              <select
                value={formData.cadence}
                onChange={(e) => setFormData({ ...formData, cadence: e.target.value })}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
              </select>
            </div>
          </div>

          {/* Time & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                min={15}
                max={180}
                step={15}
              />
            </div>
          </div>

          {/* Teams */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teams</label>
            <div className="space-y-2 max-h-32 overflow-auto border rounded-md p-2">
              {teams.map((team) => (
                <label key={team.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.teams.includes(team.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, teams: [...formData.teams, team.id] });
                      } else {
                        setFormData({ ...formData, teams: formData.teams.filter(t => t !== team.id) });
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{team.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => onSave(formData)}
            disabled={!formData.name || formData.teams.length === 0}
          >
            Create Series
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TeamCadenceDashboardPage;
