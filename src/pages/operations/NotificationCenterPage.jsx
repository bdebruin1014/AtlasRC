import React, { useState, useMemo } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Search,
  Settings,
  Clock,
  AlertTriangle,
  DollarSign,
  FileText,
  Calendar,
  Users,
  Building2,
  Briefcase,
  MessageSquare,
  Mail,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  X,
  Star,
  Archive,
  RefreshCw,
  Volume2,
  VolumeX,
  Eye,
  ExternalLink
} from 'lucide-react';

const NotificationCenterPage = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [showSettings, setShowSettings] = useState(false);

  // Mock notification data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'deal',
      category: 'opportunity',
      title: 'New Lead Assigned',
      message: 'You have been assigned to opportunity "456 Oak Street" by Sarah Johnson',
      timestamp: '2025-01-25T14:30:00',
      read: false,
      starred: true,
      priority: 'high',
      link: '/opportunity/1',
      sender: 'Sarah Johnson',
    },
    {
      id: 2,
      type: 'task',
      category: 'project',
      title: 'Task Due Tomorrow',
      message: 'Task "Complete title search" for Oakwood Estates is due tomorrow',
      timestamp: '2025-01-25T12:00:00',
      read: false,
      starred: false,
      priority: 'high',
      link: '/project/1/tasks',
      sender: 'System',
    },
    {
      id: 3,
      type: 'financial',
      category: 'accounting',
      title: 'Budget Alert',
      message: 'Project "Downtown Mixed-Use" has exceeded 90% of allocated budget',
      timestamp: '2025-01-25T10:15:00',
      read: false,
      starred: false,
      priority: 'urgent',
      link: '/project/3/budget',
      sender: 'System',
    },
    {
      id: 4,
      type: 'document',
      category: 'documents',
      title: 'Document Signed',
      message: 'Purchase agreement for "Riverside Lot 15" has been signed by all parties',
      timestamp: '2025-01-25T09:45:00',
      read: true,
      starred: false,
      priority: 'normal',
      link: '/project/2/documents',
      sender: 'DocuSign',
    },
    {
      id: 5,
      type: 'meeting',
      category: 'calendar',
      title: 'Meeting Reminder',
      message: 'Weekly L10 meeting starts in 30 minutes',
      timestamp: '2025-01-25T09:30:00',
      read: true,
      starred: false,
      priority: 'normal',
      link: '/eos/cadence/1',
      sender: 'Calendar',
    },
    {
      id: 6,
      type: 'comment',
      category: 'collaboration',
      title: 'New Comment',
      message: 'John Smith commented on "Charlotte Scattered Lots - Q1": "Updated the pro forma with new estimates"',
      timestamp: '2025-01-24T16:20:00',
      read: true,
      starred: false,
      priority: 'normal',
      link: '/project/4',
      sender: 'John Smith',
    },
    {
      id: 7,
      type: 'approval',
      category: 'workflow',
      title: 'Approval Required',
      message: 'Draw request #DR-2025-042 requires your approval ($125,000)',
      timestamp: '2025-01-24T14:00:00',
      read: false,
      starred: true,
      priority: 'high',
      link: '/project/1/draw-requests',
      sender: 'Finance Team',
    },
    {
      id: 8,
      type: 'system',
      category: 'system',
      title: 'Report Generated',
      message: 'Monthly financial report for January 2025 is ready for download',
      timestamp: '2025-01-24T08:00:00',
      read: true,
      starred: false,
      priority: 'low',
      link: '/reports',
      sender: 'System',
    },
    {
      id: 9,
      type: 'deal',
      category: 'opportunity',
      title: 'Deal Stage Changed',
      message: '"789 Pine Avenue" moved from Analysis to LOI stage',
      timestamp: '2025-01-23T15:30:00',
      read: true,
      starred: false,
      priority: 'normal',
      link: '/opportunity/2',
      sender: 'System',
    },
    {
      id: 10,
      type: 'team',
      category: 'collaboration',
      title: 'Team Update',
      message: 'Emily Chen joined the Acquisitions team',
      timestamp: '2025-01-23T10:00:00',
      read: true,
      starred: false,
      priority: 'low',
      link: '/admin/teams',
      sender: 'HR System',
    },
  ]);

  const notificationTypes = {
    deal: { label: 'Deals', icon: Briefcase, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    task: { label: 'Tasks', icon: Check, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    financial: { label: 'Financial', icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-100' },
    document: { label: 'Documents', icon: FileText, color: 'text-orange-600', bgColor: 'bg-orange-100' },
    meeting: { label: 'Meetings', icon: Calendar, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
    comment: { label: 'Comments', icon: MessageSquare, color: 'text-pink-600', bgColor: 'bg-pink-100' },
    approval: { label: 'Approvals', icon: CheckCheck, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    system: { label: 'System', icon: Bell, color: 'text-gray-600', bgColor: 'bg-gray-100' },
    team: { label: 'Team', icon: Users, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  };

  const priorityColors = {
    urgent: 'border-l-red-500 bg-red-50',
    high: 'border-l-orange-500 bg-orange-50',
    normal: 'border-l-transparent bg-white',
    low: 'border-l-transparent bg-white',
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      // Filter by type
      if (filter === 'unread' && notification.read) return false;
      if (filter === 'starred' && !notification.starred) return false;
      if (filter !== 'all' && filter !== 'unread' && filter !== 'starred' && notification.type !== filter) return false;

      // Filter by search
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          notification.title.toLowerCase().includes(search) ||
          notification.message.toLowerCase().includes(search) ||
          notification.sender.toLowerCase().includes(search)
        );
      }

      return true;
    });
  }, [notifications, filter, searchTerm]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const starredCount = notifications.filter(n => n.starred).length;

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const toggleRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: !n.read } : n)
    );
  };

  const toggleStar = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, starred: !n.starred } : n)
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleSelect = (id) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n.id)));
    }
  };

  const deleteSelected = () => {
    setNotifications(prev => prev.filter(n => !selectedNotifications.has(n.id)));
    setSelectedNotifications(new Set());
  };

  const markSelectedAsRead = () => {
    setNotifications(prev =>
      prev.map(n => selectedNotifications.has(n.id) ? { ...n, read: true } : n)
    );
    setSelectedNotifications(new Set());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Bell className="w-7 h-7 text-blue-600" />
                Notification Center
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 bg-red-500 text-white text-sm font-medium rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="text-gray-600 mt-1">
                Stay updated on deals, tasks, and team activity
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <CheckCheck className="w-4 h-4" />
                Mark All Read
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                  filter === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-1 ${
                  filter === 'unread' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Unread
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">{unreadCount}</span>
                )}
              </button>
              <button
                onClick={() => setFilter('starred')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-1 ${
                  filter === 'starred' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Star className="w-4 h-4" />
                Starred
              </button>
            </div>
          </div>

          {/* Type Filters */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {Object.entries(notificationTypes).map(([type, info]) => {
              const count = notifications.filter(n => n.type === type).length;
              const IconComponent = info.icon;
              return (
                <button
                  key={type}
                  onClick={() => setFilter(filter === type ? 'all' : type)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter === type
                      ? `${info.bgColor} ${info.color}`
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {info.label}
                  <span className="text-xs opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Bulk Actions */}
        {selectedNotifications.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedNotifications.size} notification{selectedNotifications.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={markSelectedAsRead}
                className="px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100 rounded-lg"
              >
                Mark as Read
              </button>
              <button
                onClick={deleteSelected}
                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-100 rounded-lg"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedNotifications(new Set())}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Select All Header */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedNotifications.size === filteredNotifications.length && filteredNotifications.length > 0}
                onChange={selectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Select All</span>
            </label>
            <span className="text-sm text-gray-500">
              {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Notification Items */}
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map(notification => {
              const typeInfo = notificationTypes[notification.type];
              const IconComponent = typeInfo.icon;

              return (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 border-l-4 transition-colors hover:bg-gray-50 ${
                    priorityColors[notification.priority]
                  } ${!notification.read ? 'bg-blue-50/50' : ''}`}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedNotifications.has(notification.id)}
                    onChange={() => toggleSelect(notification.id)}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />

                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full ${typeInfo.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className={`w-5 h-5 ${typeInfo.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-0.5">{notification.message}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(notification.timestamp)}
                          </span>
                          <span>from {notification.sender}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => toggleStar(notification.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            notification.starred
                              ? 'text-yellow-500 hover:bg-yellow-100'
                              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                          }`}
                        >
                          <Star className={`w-4 h-4 ${notification.starred ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => toggleRead(notification.id)}
                          className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg"
                          title={notification.read ? 'Mark as unread' : 'Mark as read'}
                        >
                          {notification.read ? <Eye className="w-4 h-4" /> : <CheckCheck className="w-4 h-4" />}
                        </button>
                        <a
                          href={notification.link}
                          className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 rounded-lg"
                          title="View"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1.5 text-gray-400 hover:bg-red-100 hover:text-red-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Unread indicator */}
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>
              );
            })}

            {filteredNotifications.length === 0 && (
              <div className="p-12 text-center">
                <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
                <p className="text-gray-500">
                  {filter === 'unread'
                    ? "You're all caught up!"
                    : filter === 'starred'
                    ? 'No starred notifications'
                    : 'No notifications match your filters'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-600" />
              Notification Preferences
            </h3>
            <div className="space-y-4">
              {Object.entries(notificationTypes).map(([type, info]) => {
                const IconComponent = info.icon;
                return (
                  <div key={type} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${info.bgColor} flex items-center justify-center`}>
                        <IconComponent className={`w-4 h-4 ${info.color}`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{info.label}</p>
                        <p className="text-xs text-gray-500">Receive notifications for {info.label.toLowerCase()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                        In-app
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                        Email
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenterPage;
