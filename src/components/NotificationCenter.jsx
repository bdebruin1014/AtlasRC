// src/components/NotificationCenter.jsx
// Notification bell and dropdown for the top navigation

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, X, Check, CheckCheck, Archive, Settings, Clock,
  DollarSign, FileCheck, AlertTriangle, CheckSquare,
  Landmark, FileEdit, Flag, Info, CheckCircle, XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  NOTIFICATION_TYPES,
  PRIORITY_LEVELS,
} from '@/services/notificationService';

// Icon mapping for notification types
const TYPE_ICONS = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  alert: Bell,
  budget_alert: DollarSign,
  approval_request: CheckSquare,
  task_due: Clock,
  document_signed: FileCheck,
  draw_request: Landmark,
  change_order: FileEdit,
  permit_expiring: AlertTriangle,
  milestone_complete: Flag,
};

// Color mapping for notification types
const TYPE_COLORS = {
  info: 'text-blue-400 bg-blue-500/20',
  success: 'text-green-400 bg-green-500/20',
  warning: 'text-yellow-400 bg-yellow-500/20',
  error: 'text-red-400 bg-red-500/20',
  alert: 'text-orange-400 bg-orange-500/20',
  budget_alert: 'text-red-400 bg-red-500/20',
  approval_request: 'text-purple-400 bg-purple-500/20',
  task_due: 'text-blue-400 bg-blue-500/20',
  document_signed: 'text-green-400 bg-green-500/20',
  draw_request: 'text-indigo-400 bg-indigo-500/20',
  change_order: 'text-orange-400 bg-orange-500/20',
  permit_expiring: 'text-yellow-400 bg-yellow-500/20',
  milestone_complete: 'text-green-400 bg-green-500/20',
};

const PRIORITY_BADGES = {
  low: 'bg-gray-600 text-gray-200',
  normal: 'hidden',
  high: 'bg-orange-600 text-white',
  urgent: 'bg-red-600 text-white animate-pulse',
};

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationCenter() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread
  const dropdownRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const [notifs, count] = await Promise.all([
        getNotifications({ includeRead: true, limit: 20 }),
        getUnreadCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and polling
  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      getUnreadCount().then(setUnreadCount);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Fetch full list when opening
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    if (notification.action_url) {
      navigate(notification.action_url);
      setIsOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
    );
    setUnreadCount(0);
  };

  const handleArchive = async (e, notificationId) => {
    e.stopPropagation();
    await archiveNotification(notificationId);
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    const notification = notifications.find((n) => n.id === notificationId);
    if (notification && !notification.is_read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative p-1.5 rounded transition-colors',
          isOpen ? 'text-white bg-gray-700' : 'text-gray-400 hover:text-white'
        )}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-[#2a2a2a] border border-gray-700 rounded-lg shadow-2xl overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-[#1f1f1f]">
            <h3 className="font-semibold text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => {
                  navigate('/settings/notifications');
                  setIsOpen(false);
                }}
                className="text-gray-400 hover:text-white p-1"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'flex-1 py-2 text-xs font-medium transition-colors',
                filter === 'all'
                  ? 'text-white border-b-2 border-emerald-500'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={cn(
                'flex-1 py-2 text-xs font-medium transition-colors',
                filter === 'unread'
                  ? 'text-white border-b-2 border-emerald-500'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin w-6 h-6 border-2 border-gray-600 border-t-emerald-500 rounded-full mx-auto" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const Icon = TYPE_ICONS[notification.type] || Bell;
                const colorClass = TYPE_COLORS[notification.type] || 'text-gray-400 bg-gray-500/20';
                const priorityBadge = PRIORITY_BADGES[notification.priority];

                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      'flex gap-3 p-3 cursor-pointer transition-colors border-b border-gray-800 last:border-0',
                      notification.is_read
                        ? 'bg-transparent hover:bg-gray-800/50'
                        : 'bg-gray-800/30 hover:bg-gray-800/60'
                    )}
                  >
                    {/* Icon */}
                    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', colorClass)}>
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            'text-sm font-medium truncate',
                            notification.is_read ? 'text-gray-300' : 'text-white'
                          )}
                        >
                          {notification.title}
                        </p>
                        {priorityBadge !== 'hidden' && (
                          <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', priorityBadge)}>
                            {notification.priority}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{notification.message}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[10px] text-gray-500">{formatTimeAgo(notification.created_at)}</span>
                        <div className="flex items-center gap-1">
                          {!notification.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationClick({ ...notification, action_url: null });
                              }}
                              className="p-1 text-gray-500 hover:text-white rounded"
                              title="Mark as read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleArchive(e, notification.id)}
                            className="p-1 text-gray-500 hover:text-white rounded"
                            title="Archive"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Unread indicator */}
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-700 p-2 bg-[#1f1f1f]">
              <button
                onClick={() => {
                  navigate('/notifications');
                  setIsOpen(false);
                }}
                className="w-full py-2 text-xs text-center text-gray-400 hover:text-white transition-colors"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Compact notification badge for other places in the UI
export function NotificationBadge({ count, className }) {
  if (!count || count === 0) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full',
        className
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}
