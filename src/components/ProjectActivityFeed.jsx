import React, { useState, useEffect, useMemo } from 'react';
import { supabase, isDemoMode } from '@/lib/supabase';
import {
  Activity,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  FileText,
  Edit,
  Plus,
  Trash2,
  ArrowRight,
  Users,
  Calendar,
  DollarSign,
  Upload,
  Download,
  Flag,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Eye,
  Bell,
  Briefcase,
  Building
} from 'lucide-react';

// Demo data for project activity
const generateDemoActivities = (projectId) => [
  {
    id: '1',
    project_id: projectId,
    user_id: 'user-1',
    user_name: 'John Smith',
    user_avatar: null,
    activity_type: 'task_completed',
    title: 'Completed task',
    description: 'Marked "Foundation inspection" as complete',
    entity_type: 'task',
    entity_id: 'task-1',
    entity_name: 'Foundation inspection',
    metadata: { old_status: 'in_progress', new_status: 'completed' },
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    id: '2',
    project_id: projectId,
    user_id: 'user-2',
    user_name: 'Sarah Johnson',
    user_avatar: null,
    activity_type: 'comment_added',
    title: 'Added a comment',
    description: 'Commented on "Electrical rough-in"',
    entity_type: 'task',
    entity_id: 'task-2',
    entity_name: 'Electrical rough-in',
    metadata: { comment: 'Need to confirm wire gauge with inspector before proceeding.' },
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: '3',
    project_id: projectId,
    user_id: 'user-3',
    user_name: 'Mike Williams',
    user_avatar: null,
    activity_type: 'issue_reported',
    title: 'Reported an issue',
    description: 'Flagged potential issue with concrete delivery schedule',
    entity_type: 'issue',
    entity_id: 'issue-1',
    entity_name: 'Concrete delivery delay',
    metadata: { priority: 'high', category: 'schedule' },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: '4',
    project_id: projectId,
    user_id: 'user-1',
    user_name: 'John Smith',
    user_avatar: null,
    activity_type: 'task_assigned',
    title: 'Assigned a task',
    description: 'Assigned "HVAC installation" to Mike Williams',
    entity_type: 'task',
    entity_id: 'task-3',
    entity_name: 'HVAC installation',
    metadata: { assignee: 'Mike Williams', assignee_id: 'user-3' },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
  },
  {
    id: '5',
    project_id: projectId,
    user_id: 'user-2',
    user_name: 'Sarah Johnson',
    user_avatar: null,
    activity_type: 'document_uploaded',
    title: 'Uploaded a document',
    description: 'Uploaded "Building Permit - Approved.pdf"',
    entity_type: 'document',
    entity_id: 'doc-1',
    entity_name: 'Building Permit - Approved.pdf',
    metadata: { file_size: '2.4 MB', file_type: 'pdf' },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  },
  {
    id: '6',
    project_id: projectId,
    user_id: 'user-3',
    user_name: 'Mike Williams',
    user_avatar: null,
    activity_type: 'budget_updated',
    title: 'Updated budget',
    description: 'Modified "Framing" budget line item',
    entity_type: 'budget',
    entity_id: 'budget-1',
    entity_name: 'Framing',
    metadata: { old_amount: 85000, new_amount: 92000, change_reason: 'Material cost increase' },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
  },
  {
    id: '7',
    project_id: projectId,
    user_id: 'user-1',
    user_name: 'John Smith',
    user_avatar: null,
    activity_type: 'task_created',
    title: 'Created a task',
    description: 'Created new task "Landscaping design review"',
    entity_type: 'task',
    entity_id: 'task-4',
    entity_name: 'Landscaping design review',
    metadata: { due_date: '2026-02-15', priority: 'normal' },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  },
  {
    id: '8',
    project_id: projectId,
    user_id: 'user-2',
    user_name: 'Sarah Johnson',
    user_avatar: null,
    activity_type: 'draw_request_submitted',
    title: 'Submitted draw request',
    description: 'Submitted Draw Request #003 for $125,000',
    entity_type: 'draw_request',
    entity_id: 'draw-3',
    entity_name: 'Draw Request #003',
    metadata: { amount: 125000, status: 'submitted' },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: '9',
    project_id: projectId,
    user_id: 'user-3',
    user_name: 'Mike Williams',
    user_avatar: null,
    activity_type: 'issue_resolved',
    title: 'Resolved an issue',
    description: 'Resolved "Permit delay" issue',
    entity_type: 'issue',
    entity_id: 'issue-2',
    entity_name: 'Permit delay',
    metadata: { resolution: 'Expedited review approved by city' },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString()
  },
  {
    id: '10',
    project_id: projectId,
    user_id: 'user-1',
    user_name: 'John Smith',
    user_avatar: null,
    activity_type: 'milestone_completed',
    title: 'Completed milestone',
    description: 'Marked "Foundation Complete" milestone as achieved',
    entity_type: 'milestone',
    entity_id: 'milestone-1',
    entity_name: 'Foundation Complete',
    metadata: { completion_date: '2026-01-20' },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  },
  {
    id: '11',
    project_id: projectId,
    user_id: 'user-2',
    user_name: 'Sarah Johnson',
    user_avatar: null,
    activity_type: 'vendor_added',
    title: 'Added vendor',
    description: 'Added "Elite Electric LLC" as project vendor',
    entity_type: 'vendor',
    entity_id: 'vendor-1',
    entity_name: 'Elite Electric LLC',
    metadata: { vendor_type: 'Electrical Contractor' },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()
  },
  {
    id: '12',
    project_id: projectId,
    user_id: 'user-3',
    user_name: 'Mike Williams',
    user_avatar: null,
    activity_type: 'schedule_updated',
    title: 'Updated schedule',
    description: 'Modified project schedule - added 5 days buffer',
    entity_type: 'schedule',
    entity_id: 'schedule-1',
    entity_name: 'Project Schedule',
    metadata: { change_type: 'buffer_added', days: 5 },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString()
  }
];

const ACTIVITY_TYPES = [
  { value: 'all', label: 'All Activities' },
  { value: 'task', label: 'Tasks' },
  { value: 'comment', label: 'Comments' },
  { value: 'issue', label: 'Issues' },
  { value: 'document', label: 'Documents' },
  { value: 'budget', label: 'Budget' },
  { value: 'milestone', label: 'Milestones' }
];

const getActivityIcon = (type) => {
  const iconMap = {
    task_completed: { icon: CheckCircle2, color: 'text-green-600 bg-green-100' },
    task_created: { icon: Plus, color: 'text-blue-600 bg-blue-100' },
    task_assigned: { icon: Users, color: 'text-purple-600 bg-purple-100' },
    task_updated: { icon: Edit, color: 'text-gray-600 bg-gray-100' },
    comment_added: { icon: MessageSquare, color: 'text-indigo-600 bg-indigo-100' },
    issue_reported: { icon: AlertCircle, color: 'text-red-600 bg-red-100' },
    issue_resolved: { icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-100' },
    document_uploaded: { icon: Upload, color: 'text-cyan-600 bg-cyan-100' },
    document_downloaded: { icon: Download, color: 'text-cyan-600 bg-cyan-100' },
    budget_updated: { icon: DollarSign, color: 'text-amber-600 bg-amber-100' },
    draw_request_submitted: { icon: FileText, color: 'text-orange-600 bg-orange-100' },
    draw_request_approved: { icon: CheckCircle2, color: 'text-green-600 bg-green-100' },
    milestone_completed: { icon: Flag, color: 'text-teal-600 bg-teal-100' },
    vendor_added: { icon: Briefcase, color: 'text-violet-600 bg-violet-100' },
    schedule_updated: { icon: Calendar, color: 'text-pink-600 bg-pink-100' },
    default: { icon: Activity, color: 'text-gray-600 bg-gray-100' }
  };
  return iconMap[type] || iconMap.default;
};

const formatTimeAgo = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const ProjectActivityFeed = ({
  projectId = null,
  userId = null,
  limit = 50,
  showFilters = true,
  showHeader = true,
  compact = false
}) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadActivities();
  }, [projectId, userId]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      if (isDemoMode()) {
        const data = generateDemoActivities(projectId || 'demo-project');
        setActivities(data);

        const uniqueUsers = [...new Set(data.map(a => a.user_name))].filter(Boolean);
        setUsers(uniqueUsers);
      } else {
        let query = supabase
          .from('project_activities')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (projectId) {
          query = query.eq('project_id', projectId);
        }
        if (userId) {
          query = query.eq('user_id', userId);
        }

        const { data, error } = await query;
        if (error) throw error;
        setActivities(data || []);

        const uniqueUsers = [...new Set((data || []).map(a => a.user_name))].filter(Boolean);
        setUsers(uniqueUsers);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          activity.title?.toLowerCase().includes(search) ||
          activity.description?.toLowerCase().includes(search) ||
          activity.user_name?.toLowerCase().includes(search) ||
          activity.entity_name?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Type filter
      if (selectedType !== 'all') {
        const typeMap = {
          task: ['task_completed', 'task_created', 'task_assigned', 'task_updated'],
          comment: ['comment_added'],
          issue: ['issue_reported', 'issue_resolved'],
          document: ['document_uploaded', 'document_downloaded'],
          budget: ['budget_updated', 'draw_request_submitted', 'draw_request_approved'],
          milestone: ['milestone_completed']
        };
        if (!typeMap[selectedType]?.includes(activity.activity_type)) {
          return false;
        }
      }

      // User filter
      if (selectedUser !== 'all' && activity.user_name !== selectedUser) {
        return false;
      }

      // Date range filter
      if (dateRange.start) {
        const activityDate = new Date(activity.created_at);
        const startDate = new Date(dateRange.start);
        if (activityDate < startDate) return false;
      }
      if (dateRange.end) {
        const activityDate = new Date(activity.created_at);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        if (activityDate > endDate) return false;
      }

      return true;
    });
  }, [activities, searchTerm, selectedType, selectedUser, dateRange]);

  // Group activities by date
  const groupedActivities = useMemo(() => {
    const groups = {};
    filteredActivities.forEach(activity => {
      const date = new Date(activity.created_at).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });
    return groups;
  }, [filteredActivities]);

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const renderMetadataDetails = (activity) => {
    const { metadata, activity_type } = activity;
    if (!metadata || Object.keys(metadata).length === 0) return null;

    switch (activity_type) {
      case 'task_completed':
        return (
          <div className="text-sm text-gray-500">
            Status: <span className="line-through">{metadata.old_status}</span>
            <ArrowRight className="w-3 h-3 inline mx-1" />
            <span className="text-green-600 font-medium">{metadata.new_status}</span>
          </div>
        );
      case 'budget_updated':
        return (
          <div className="text-sm">
            <div className="text-gray-500">
              Amount: <span className="line-through">{formatCurrency(metadata.old_amount)}</span>
              <ArrowRight className="w-3 h-3 inline mx-1" />
              <span className="text-amber-600 font-medium">{formatCurrency(metadata.new_amount)}</span>
            </div>
            {metadata.change_reason && (
              <div className="text-gray-500 mt-1">Reason: {metadata.change_reason}</div>
            )}
          </div>
        );
      case 'comment_added':
        return (
          <div className="text-sm text-gray-600 bg-gray-50 rounded p-2 mt-1 italic">
            "{metadata.comment}"
          </div>
        );
      case 'issue_reported':
        return (
          <div className="text-sm text-gray-500">
            Priority: <span className={`font-medium ${metadata.priority === 'high' ? 'text-red-600' : 'text-gray-600'}`}>
              {metadata.priority}
            </span>
            {metadata.category && <span className="ml-2">Category: {metadata.category}</span>}
          </div>
        );
      case 'issue_resolved':
        return (
          <div className="text-sm text-gray-500">
            Resolution: {metadata.resolution}
          </div>
        );
      case 'draw_request_submitted':
        return (
          <div className="text-sm text-gray-500">
            Amount: <span className="font-medium text-orange-600">{formatCurrency(metadata.amount)}</span>
          </div>
        );
      case 'task_assigned':
        return (
          <div className="text-sm text-gray-500">
            Assigned to: <span className="font-medium text-purple-600">{metadata.assignee}</span>
          </div>
        );
      case 'document_uploaded':
        return (
          <div className="text-sm text-gray-500">
            Size: {metadata.file_size} | Type: {metadata.file_type?.toUpperCase()}
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className={compact ? '' : 'bg-white rounded-xl shadow-sm border border-gray-200'}>
      {/* Header */}
      {showHeader && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Activity Feed</h2>
                <p className="text-sm text-gray-500">
                  {filteredActivities.length} activities
                </p>
              </div>
            </div>
            <button
              onClick={loadActivities}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="p-4 border-b border-gray-200 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {ACTIVITY_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Team Members</option>
              {users.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
                setSelectedUser('all');
                setDateRange({ start: '', end: '' });
              }}
              className="px-3 py-2 text-gray-600 hover:text-gray-800"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Activity List */}
      <div className={compact ? '' : 'p-4'}>
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No activities found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedActivities).map(([date, dayActivities]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-gray-500 mb-3 sticky top-0 bg-white py-1">
                  {date}
                </h3>
                <div className="space-y-3">
                  {dayActivities.map((activity) => {
                    const { icon: Icon, color } = getActivityIcon(activity.activity_type);
                    const isExpanded = expandedItems.has(activity.id);

                    return (
                      <div
                        key={activity.id}
                        className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => toggleExpanded(activity.id)}
                      >
                        {/* Icon */}
                        <div className={`p-2 rounded-lg flex-shrink-0 ${color}`}>
                          <Icon className="w-4 h-4" />
                        </div>

                        {/* Content */}
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {activity.user_name}
                            </span>
                            <span className="text-gray-500 text-sm">
                              {activity.title}
                            </span>
                          </div>

                          <p className="text-gray-600 text-sm mt-0.5">
                            {activity.description}
                          </p>

                          {/* Entity Link */}
                          {activity.entity_name && (
                            <div className="flex items-center gap-1 mt-1">
                              <Eye className="w-3 h-3 text-gray-400" />
                              <span className="text-sm text-blue-600 hover:underline">
                                {activity.entity_name}
                              </span>
                            </div>
                          )}

                          {/* Expanded Metadata */}
                          {isExpanded && renderMetadataDetails(activity)}

                          {/* Timestamp */}
                          <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(activity.created_at)}
                            <span className="mx-1">•</span>
                            {new Date(activity.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>

                        {/* Expand Icon */}
                        <div className="flex-shrink-0 text-gray-400">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Activity Summary */}
      {showHeader && users.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Team Activity Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {users.slice(0, 4).map(userName => {
              const userActivities = activities.filter(a => a.user_name === userName);
              const tasksCompleted = userActivities.filter(a => a.activity_type === 'task_completed').length;
              const issuesReported = userActivities.filter(a => a.activity_type === 'issue_reported').length;
              const comments = userActivities.filter(a => a.activity_type === 'comment_added').length;

              return (
                <div key={userName} className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-sm text-gray-900 truncate">{userName}</span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Tasks completed</span>
                      <span className="font-medium text-green-600">{tasksCompleted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Issues reported</span>
                      <span className="font-medium text-red-600">{issuesReported}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Comments</span>
                      <span className="font-medium text-indigo-600">{comments}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectActivityFeed;
