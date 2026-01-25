import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';
import {
  Activity,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  Eye,
  Edit,
  FileText,
  Building2,
  DollarSign,
  CheckCircle2,
  LogIn,
  Search,
  Download,
  Filter,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  User,
  MousePointer,
  Zap
} from 'lucide-react';

// Demo analytics data
const demoAnalytics = {
  summary: {
    active_users_today: 12,
    active_users_week: 28,
    total_actions_today: 456,
    total_actions_week: 2834,
    avg_session_duration: '24 min',
    pages_per_session: 8.5
  },
  trends: {
    users: { current: 28, previous: 24, change: 16.7 },
    actions: { current: 2834, previous: 2456, change: 15.4 },
    sessions: { current: 89, previous: 76, change: 17.1 },
    engagement: { current: 72, previous: 68, change: 5.9 }
  },
  activityByHour: [
    { hour: '6am', actions: 45 },
    { hour: '8am', actions: 120 },
    { hour: '10am', actions: 185 },
    { hour: '12pm', actions: 95 },
    { hour: '2pm', actions: 210 },
    { hour: '4pm', actions: 175 },
    { hour: '6pm', actions: 85 },
    { hour: '8pm', actions: 40 }
  ],
  activityByDay: [
    { day: 'Mon', actions: 520 },
    { day: 'Tue', actions: 480 },
    { day: 'Wed', actions: 590 },
    { day: 'Thu', actions: 445 },
    { day: 'Fri', actions: 380 },
    { day: 'Sat', actions: 120 },
    { day: 'Sun', actions: 95 }
  ],
  topUsers: [
    { id: '1', name: 'John Smith', email: 'john@example.com', actions: 245, sessions: 12, last_active: '2026-01-25T14:30:00Z' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', actions: 198, sessions: 10, last_active: '2026-01-25T13:45:00Z' },
    { id: '3', name: 'Mike Chen', email: 'mike@example.com', actions: 156, sessions: 8, last_active: '2026-01-25T12:00:00Z' },
    { id: '4', name: 'Lisa Park', email: 'lisa@example.com', actions: 134, sessions: 7, last_active: '2026-01-25T11:30:00Z' },
    { id: '5', name: 'David Lee', email: 'david@example.com', actions: 112, sessions: 6, last_active: '2026-01-24T16:00:00Z' }
  ],
  actionTypes: [
    { type: 'View', count: 1245, icon: Eye, color: '#3b82f6' },
    { type: 'Edit', count: 567, icon: Edit, color: '#10b981' },
    { type: 'Create', count: 234, icon: FileText, color: '#8b5cf6' },
    { type: 'Delete', count: 45, icon: CheckCircle2, color: '#ef4444' },
    { type: 'Export', count: 123, icon: Download, color: '#f59e0b' },
    { type: 'Search', count: 620, icon: Search, color: '#06b6d4' }
  ],
  moduleUsage: [
    { module: 'Projects', usage: 35, color: '#3b82f6' },
    { module: 'Contacts', usage: 25, color: '#10b981' },
    { module: 'Documents', usage: 18, color: '#8b5cf6' },
    { module: 'Accounting', usage: 12, color: '#f59e0b' },
    { module: 'Reports', usage: 10, color: '#ef4444' }
  ],
  recentActivity: [
    { id: '1', user: 'John Smith', action: 'Updated', target: 'Sunset Towers budget', module: 'Projects', time: '5 min ago' },
    { id: '2', user: 'Sarah Johnson', action: 'Created', target: 'new expense entry', module: 'Accounting', time: '12 min ago' },
    { id: '3', user: 'Mike Chen', action: 'Viewed', target: 'Q4 Financial Report', module: 'Reports', time: '18 min ago' },
    { id: '4', user: 'Lisa Park', action: 'Uploaded', target: '3 documents', module: 'Documents', time: '25 min ago' },
    { id: '5', user: 'David Lee', action: 'Completed', target: 'Due diligence checklist', module: 'Projects', time: '32 min ago' },
    { id: '6', user: 'John Smith', action: 'Exported', target: 'Contact list', module: 'Contacts', time: '45 min ago' },
    { id: '7', user: 'Sarah Johnson', action: 'Logged in', target: '', module: 'System', time: '1 hour ago' },
    { id: '8', user: 'Mike Chen', action: 'Created', target: 'new project', module: 'Projects', time: '1.5 hours ago' }
  ]
};

export default function UserActivityAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      if (isDemoMode()) {
        setAnalytics(demoAnalytics);
      } else {
        // In production, fetch from analytics API
        setAnalytics(demoAnalytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics(demoAnalytics);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hours ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTrendIcon = (change) => {
    if (change > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  const maxHourlyActions = Math.max(...(analytics?.activityByHour?.map(h => h.actions) || [0]));
  const maxDailyActions = Math.max(...(analytics?.activityByDay?.map(d => d.actions) || [0]));

  if (loading || !analytics) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="h-7 w-7 text-blue-600" />
            User Activity Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track user engagement and platform usage metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-5 w-5 text-blue-600" />
            <div className="flex items-center gap-1 text-sm">
              {getTrendIcon(analytics.trends.users.change)}
              <span className={analytics.trends.users.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                {analytics.trends.users.change}%
              </span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {analytics.summary.active_users_week}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <MousePointer className="h-5 w-5 text-green-600" />
            <div className="flex items-center gap-1 text-sm">
              {getTrendIcon(analytics.trends.actions.change)}
              <span className={analytics.trends.actions.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                {analytics.trends.actions.change}%
              </span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {analytics.summary.total_actions_week.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Actions</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {analytics.summary.avg_session_duration}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Session</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            <div className="flex items-center gap-1 text-sm">
              {getTrendIcon(analytics.trends.engagement.change)}
              <span className={analytics.trends.engagement.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                {analytics.trends.engagement.change}%
              </span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {analytics.summary.pages_per_session}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pages/Session</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Activity by Hour */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Activity by Hour</h3>
            <div className="h-48 flex items-end justify-between gap-2">
              {analytics.activityByHour.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                    style={{ height: `${(item.actions / maxHourlyActions) * 100}%`, minHeight: '4px' }}
                    title={`${item.actions} actions`}
                  />
                  <span className="text-xs text-gray-500 mt-2">{item.hour}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity by Day */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Activity by Day</h3>
            <div className="h-48 flex items-end justify-between gap-4">
              {analytics.activityByDay.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {item.actions}
                  </div>
                  <div
                    className="w-full bg-green-500 rounded-t transition-all hover:bg-green-600"
                    style={{ height: `${(item.actions / maxDailyActions) * 100}%`, minHeight: '4px' }}
                  />
                  <span className="text-xs text-gray-500 mt-2">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Types */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Action Types</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {analytics.actionTypes.map(action => {
                const IconComponent = action.icon;
                return (
                  <div key={action.type} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${action.color}20` }}>
                      <IconComponent className="h-5 w-5" style={{ color: action.color }} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{action.count.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{action.type}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Module Usage */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Module Usage</h3>
            <div className="space-y-3">
              {analytics.moduleUsage.map(module => (
                <div key={module.module}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{module.module}</span>
                    <span className="text-gray-500">{module.usage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${module.usage}%`, backgroundColor: module.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Users */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Top Users</h3>
            <div className="space-y-3">
              {analytics.topUsers.map((user, idx) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm font-medium text-blue-600">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white truncate">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.actions} actions</div>
                  </div>
                  <div className="text-xs text-gray-500">{formatDate(user.last_active)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
            <div className="space-y-3 max-h-[400px] overflow-auto">
              {analytics.recentActivity.map(activity => (
                <div key={activity.id} className="flex items-start gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">{activity.user}</span>
                      <span className="text-gray-600 dark:text-gray-400"> {activity.action.toLowerCase()} </span>
                      {activity.target && (
                        <span className="text-gray-700 dark:text-gray-300">{activity.target}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <span>{activity.module}</span>
                      <span>•</span>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
