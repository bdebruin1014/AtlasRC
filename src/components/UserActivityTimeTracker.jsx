import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';
import {
  Clock,
  Activity,
  Users,
  TrendingUp,
  BarChart2,
  PieChart,
  Calendar,
  Filter,
  Download,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  MousePointer,
  FileText,
  FolderOpen,
  MessageSquare,
  CheckSquare,
  Building2,
  DollarSign,
  Settings,
  Search,
  RefreshCw,
  Info
} from 'lucide-react';

// Demo user activity data - automatic time tracking
const demoUserActivities = [
  {
    id: 1,
    userId: 1,
    userName: 'John Smith',
    avatar: 'JS',
    role: 'Project Manager',
    department: 'Operations',
    totalTimeToday: 6.5,
    totalTimeWeek: 32.4,
    totalTimeMonth: 142.8,
    avgSessionDuration: 45,
    sessionsToday: 8,
    lastActive: '2024-01-20T14:30:00Z',
    moduleBreakdown: {
      projects: { time: 2.5, percentage: 38, actions: 45 },
      properties: { time: 1.8, percentage: 28, actions: 32 },
      pipeline: { time: 1.2, percentage: 18, actions: 24 },
      documents: { time: 0.6, percentage: 9, actions: 18 },
      settings: { time: 0.4, percentage: 6, actions: 8 }
    },
    taskMetrics: {
      avgCompletionTime: 28,
      tasksCompleted: 12,
      fastestTask: 5,
      slowestTask: 120
    },
    activityTrend: 'up',
    trendPercentage: 12
  },
  {
    id: 2,
    userId: 2,
    userName: 'Sarah Johnson',
    avatar: 'SJ',
    role: 'Financial Analyst',
    department: 'Finance',
    totalTimeToday: 5.2,
    totalTimeWeek: 28.6,
    totalTimeMonth: 118.4,
    avgSessionDuration: 52,
    sessionsToday: 6,
    lastActive: '2024-01-20T13:45:00Z',
    moduleBreakdown: {
      budget: { time: 2.1, percentage: 40, actions: 38 },
      reports: { time: 1.5, percentage: 29, actions: 22 },
      properties: { time: 0.9, percentage: 17, actions: 15 },
      contracts: { time: 0.5, percentage: 10, actions: 12 },
      documents: { time: 0.2, percentage: 4, actions: 6 }
    },
    taskMetrics: {
      avgCompletionTime: 35,
      tasksCompleted: 8,
      fastestTask: 10,
      slowestTask: 90
    },
    activityTrend: 'stable',
    trendPercentage: 2
  },
  {
    id: 3,
    userId: 3,
    userName: 'Mike Chen',
    avatar: 'MC',
    role: 'Sales Lead',
    department: 'Sales',
    totalTimeToday: 7.8,
    totalTimeWeek: 38.2,
    totalTimeMonth: 165.6,
    avgSessionDuration: 38,
    sessionsToday: 12,
    lastActive: '2024-01-20T14:55:00Z',
    moduleBreakdown: {
      pipeline: { time: 3.2, percentage: 41, actions: 68 },
      contacts: { time: 2.0, percentage: 26, actions: 45 },
      properties: { time: 1.4, percentage: 18, actions: 28 },
      documents: { time: 0.8, percentage: 10, actions: 16 },
      calendar: { time: 0.4, percentage: 5, actions: 10 }
    },
    taskMetrics: {
      avgCompletionTime: 22,
      tasksCompleted: 18,
      fastestTask: 3,
      slowestTask: 65
    },
    activityTrend: 'up',
    trendPercentage: 18
  },
  {
    id: 4,
    userId: 4,
    userName: 'Lisa Wang',
    avatar: 'LW',
    role: 'Contract Specialist',
    department: 'Legal',
    totalTimeToday: 4.5,
    totalTimeWeek: 24.8,
    totalTimeMonth: 108.2,
    avgSessionDuration: 65,
    sessionsToday: 4,
    lastActive: '2024-01-20T12:30:00Z',
    moduleBreakdown: {
      contracts: { time: 2.2, percentage: 49, actions: 28 },
      documents: { time: 1.2, percentage: 27, actions: 22 },
      properties: { time: 0.6, percentage: 13, actions: 12 },
      contacts: { time: 0.3, percentage: 7, actions: 8 },
      settings: { time: 0.2, percentage: 4, actions: 4 }
    },
    taskMetrics: {
      avgCompletionTime: 45,
      tasksCompleted: 6,
      fastestTask: 15,
      slowestTask: 180
    },
    activityTrend: 'down',
    trendPercentage: -8
  },
  {
    id: 5,
    userId: 5,
    userName: 'David Brown',
    avatar: 'DB',
    role: 'Property Manager',
    department: 'Operations',
    totalTimeToday: 6.0,
    totalTimeWeek: 31.5,
    totalTimeMonth: 138.4,
    avgSessionDuration: 42,
    sessionsToday: 9,
    lastActive: '2024-01-20T14:10:00Z',
    moduleBreakdown: {
      properties: { time: 2.8, percentage: 47, actions: 52 },
      projects: { time: 1.5, percentage: 25, actions: 28 },
      documents: { time: 0.9, percentage: 15, actions: 18 },
      contacts: { time: 0.5, percentage: 8, actions: 12 },
      settings: { time: 0.3, percentage: 5, actions: 6 }
    },
    taskMetrics: {
      avgCompletionTime: 32,
      tasksCompleted: 10,
      fastestTask: 8,
      slowestTask: 95
    },
    activityTrend: 'up',
    trendPercentage: 5
  }
];

// Demo activity timeline
const demoActivityTimeline = [
  { hour: 8, users: 2, actions: 45 },
  { hour: 9, users: 5, actions: 128 },
  { hour: 10, users: 5, actions: 156 },
  { hour: 11, users: 5, actions: 142 },
  { hour: 12, users: 3, actions: 68 },
  { hour: 13, users: 4, actions: 95 },
  { hour: 14, users: 5, actions: 134 },
  { hour: 15, users: 5, actions: 148 },
  { hour: 16, users: 4, actions: 112 },
  { hour: 17, users: 3, actions: 76 }
];

// Demo module statistics
const demoModuleStats = [
  { module: 'Projects', icon: FolderOpen, color: '#3B82F6', totalTime: 42.5, users: 4, avgTime: 10.6, actions: 245 },
  { module: 'Properties', icon: Building2, color: '#10B981', totalTime: 38.2, users: 5, avgTime: 7.6, actions: 198 },
  { module: 'Pipeline', icon: TrendingUp, color: '#8B5CF6', totalTime: 28.4, users: 3, avgTime: 9.5, actions: 156 },
  { module: 'Documents', icon: FileText, color: '#F59E0B', totalTime: 22.8, users: 5, avgTime: 4.6, actions: 132 },
  { module: 'Contracts', icon: CheckSquare, color: '#EF4444', totalTime: 18.5, users: 2, avgTime: 9.3, actions: 88 },
  { module: 'Budget', icon: DollarSign, color: '#06B6D4', totalTime: 15.2, users: 2, avgTime: 7.6, actions: 72 },
  { module: 'Contacts', icon: Users, color: '#EC4899', totalTime: 12.8, users: 4, avgTime: 3.2, actions: 98 },
  { module: 'Settings', icon: Settings, color: '#6B7280', totalTime: 4.2, users: 3, avgTime: 1.4, actions: 28 }
];

// Demo recent activities
const demoRecentActivities = [
  { id: 1, user: 'Mike Chen', action: 'Completed task', module: 'Pipeline', duration: 12, timestamp: '2024-01-20T14:55:00Z' },
  { id: 2, user: 'John Smith', action: 'Updated project', module: 'Projects', duration: 8, timestamp: '2024-01-20T14:48:00Z' },
  { id: 3, user: 'Sarah Johnson', action: 'Generated report', module: 'Budget', duration: 25, timestamp: '2024-01-20T14:32:00Z' },
  { id: 4, user: 'David Brown', action: 'Added property', module: 'Properties', duration: 15, timestamp: '2024-01-20T14:28:00Z' },
  { id: 5, user: 'Mike Chen', action: 'Moved deal stage', module: 'Pipeline', duration: 3, timestamp: '2024-01-20T14:22:00Z' },
  { id: 6, user: 'Lisa Wang', action: 'Reviewed contract', module: 'Contracts', duration: 45, timestamp: '2024-01-20T14:15:00Z' },
  { id: 7, user: 'John Smith', action: 'Uploaded document', module: 'Documents', duration: 5, timestamp: '2024-01-20T14:08:00Z' },
  { id: 8, user: 'Sarah Johnson', action: 'Updated budget', module: 'Budget', duration: 18, timestamp: '2024-01-20T13:55:00Z' }
];

export default function UserActivityTimeTracker() {
  const [userActivities, setUserActivities] = useState([]);
  const [moduleStats, setModuleStats] = useState([]);
  const [activityTimeline, setActivityTimeline] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [sortBy, setSortBy] = useState('totalTimeToday');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchActivityData();
  }, [dateRange]);

  const fetchActivityData = async () => {
    if (isDemoMode()) {
      setUserActivities(demoUserActivities);
      setModuleStats(demoModuleStats);
      setActivityTimeline(demoActivityTimeline);
      setRecentActivities(demoRecentActivities);
      setLoading(false);
      return;
    }

    try {
      // Fetch user activity data from database
      const { data: activities, error } = await supabase
        .from('user_activity_tracking')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserActivities(activities || demoUserActivities);
      setModuleStats(demoModuleStats);
      setActivityTimeline(demoActivityTimeline);
      setRecentActivities(demoRecentActivities);
    } catch (error) {
      console.error('Error fetching activity data:', error);
      setUserActivities(demoUserActivities);
      setModuleStats(demoModuleStats);
      setActivityTimeline(demoActivityTimeline);
      setRecentActivities(demoRecentActivities);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    let filtered = [...userActivities];

    if (selectedUser !== 'all') {
      filtered = filtered.filter(u => u.userId.toString() === selectedUser);
    }

    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(u => u.department === selectedDepartment);
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortBy] || 0;
      const bVal = b[sortBy] || 0;
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    return filtered;
  }, [userActivities, selectedUser, selectedDepartment, sortBy, sortOrder]);

  const totalStats = useMemo(() => {
    const totals = {
      totalTime: 0,
      totalSessions: 0,
      totalTasks: 0,
      avgTaskTime: 0,
      activeUsers: userActivities.length
    };

    userActivities.forEach(user => {
      totals.totalTime += user.totalTimeToday;
      totals.totalSessions += user.sessionsToday;
      totals.totalTasks += user.taskMetrics.tasksCompleted;
    });

    if (totals.totalTasks > 0) {
      const totalTaskTime = userActivities.reduce((sum, u) =>
        sum + (u.taskMetrics.avgCompletionTime * u.taskMetrics.tasksCompleted), 0);
      totals.avgTaskTime = Math.round(totalTaskTime / totals.totalTasks);
    }

    return totals;
  }, [userActivities]);

  const formatTime = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const formatMinutes = (mins) => {
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h}h ${m}m`;
    }
    return `${mins}m`;
  };

  const formatRelativeTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getTrendIcon = (trend, percentage) => {
    if (trend === 'up') return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const departments = [...new Set(userActivities.map(u => u.department))];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Time Tracker</h1>
          <p className="text-gray-600">Automatic tracking of user time and activities across the platform</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchActivityData()}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{formatTime(totalStats.totalTime)}</div>
              <div className="text-sm text-gray-500">Total Time Today</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalStats.activeUsers}</div>
              <div className="text-sm text-gray-500">Active Users</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalStats.totalSessions}</div>
              <div className="text-sm text-gray-500">Sessions Today</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CheckSquare className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalStats.totalTasks}</div>
              <div className="text-sm text-gray-500">Tasks Completed</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{formatMinutes(totalStats.avgTaskTime)}</div>
              <div className="text-sm text-gray-500">Avg Task Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Users</option>
            {userActivities.map(u => (
              <option key={u.userId} value={u.userId}>{u.userName}</option>
            ))}
          </select>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="totalTimeToday">Sort by Time Today</option>
            <option value="totalTimeWeek">Sort by Time This Week</option>
            <option value="sessionsToday">Sort by Sessions</option>
            <option value="taskMetrics.tasksCompleted">Sort by Tasks</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* User Activity Cards */}
        <div className="col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">User Activity Breakdown</h2>
          {filteredUsers.map(user => (
            <div key={user.id} className="bg-white rounded-lg border p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                    {user.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{user.userName}</h3>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{user.role}</span>
                    </div>
                    <p className="text-sm text-gray-500">{user.department} • Last active {formatRelativeTime(user.lastActive)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  {getTrendIcon(user.activityTrend, user.trendPercentage)}
                  <span className={
                    user.activityTrend === 'up' ? 'text-green-600' :
                    user.activityTrend === 'down' ? 'text-red-600' : 'text-gray-500'
                  }>
                    {Math.abs(user.trendPercentage)}% vs last week
                  </span>
                </div>
              </div>

              {/* Time Stats */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-900">{formatTime(user.totalTimeToday)}</div>
                  <div className="text-xs text-gray-500">Today</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-900">{formatTime(user.totalTimeWeek)}</div>
                  <div className="text-xs text-gray-500">This Week</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-900">{user.sessionsToday}</div>
                  <div className="text-xs text-gray-500">Sessions</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-900">{user.avgSessionDuration}m</div>
                  <div className="text-xs text-gray-500">Avg Session</div>
                </div>
              </div>

              {/* Module Breakdown */}
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Time by Module</div>
                <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
                  {Object.entries(user.moduleBreakdown).map(([module, data], idx) => (
                    <div
                      key={module}
                      className={`h-full ${
                        idx === 0 ? 'bg-blue-500' :
                        idx === 1 ? 'bg-green-500' :
                        idx === 2 ? 'bg-purple-500' :
                        idx === 3 ? 'bg-orange-500' :
                        'bg-gray-400'
                      }`}
                      style={{ width: `${data.percentage}%` }}
                      title={`${module}: ${formatTime(data.time)} (${data.percentage}%)`}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 mt-2">
                  {Object.entries(user.moduleBreakdown).slice(0, 4).map(([module, data], idx) => (
                    <div key={module} className="flex items-center gap-1 text-xs">
                      <div className={`w-2 h-2 rounded-full ${
                        idx === 0 ? 'bg-blue-500' :
                        idx === 1 ? 'bg-green-500' :
                        idx === 2 ? 'bg-purple-500' :
                        'bg-orange-500'
                      }`} />
                      <span className="text-gray-600 capitalize">{module}</span>
                      <span className="text-gray-400">{formatTime(data.time)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Task Metrics */}
              <div className="grid grid-cols-4 gap-2 p-3 bg-blue-50 rounded-lg">
                <div className="text-center">
                  <div className="text-sm font-semibold text-blue-900">{user.taskMetrics.tasksCompleted}</div>
                  <div className="text-xs text-blue-600">Tasks Done</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-blue-900">{formatMinutes(user.taskMetrics.avgCompletionTime)}</div>
                  <div className="text-xs text-blue-600">Avg Time</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-blue-900">{formatMinutes(user.taskMetrics.fastestTask)}</div>
                  <div className="text-xs text-blue-600">Fastest</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-blue-900">{formatMinutes(user.taskMetrics.slowestTask)}</div>
                  <div className="text-xs text-blue-600">Slowest</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Activity by Hour */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Activity by Hour</h3>
            <div className="space-y-2">
              {activityTimeline.map(hour => (
                <div key={hour.hour} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-12">{hour.hour}:00</span>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(hour.actions / 160) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-8">{hour.actions}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Module Stats */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Time by Module</h3>
            <div className="space-y-3">
              {moduleStats.slice(0, 6).map(stat => {
                const Icon = stat.icon;
                return (
                  <div key={stat.module} className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${stat.color}20` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: stat.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{stat.module}</span>
                        <span className="text-sm text-gray-900">{formatTime(stat.totalTime)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{stat.users} users</span>
                        <span>{stat.actions} actions</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Activities</h3>
            <div className="space-y-3">
              {recentActivities.slice(0, 6).map(activity => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">{activity.user}</span>
                      <span className="text-gray-600"> {activity.action}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{activity.module}</span>
                      <span>•</span>
                      <span>{formatMinutes(activity.duration)}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(activity.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-blue-900">Automatic Time Tracking</h4>
          <p className="text-sm text-blue-700">
            This dashboard automatically tracks user activity across the platform. Time is recorded when users
            interact with different modules, complete tasks, and navigate through the system. No manual time
            entry is required.
          </p>
        </div>
      </div>
    </div>
  );
}
