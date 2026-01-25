import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';
import {
  Bell,
  BellOff,
  Mail,
  Smartphone,
  Monitor,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  DollarSign,
  FileText,
  Users,
  Building2,
  MessageSquare,
  Briefcase,
  Shield,
  ChevronDown,
  ChevronUp,
  Info,
  X,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';

// Demo notification settings
const demoNotificationSettings = {
  // Delivery channels
  channels: {
    email: true,
    push: true,
    in_app: true,
    sms: false
  },
  // Email digest preferences
  email_digest: {
    enabled: true,
    frequency: 'daily', // daily, weekly, realtime
    time: '09:00'
  },
  // Quiet hours
  quiet_hours: {
    enabled: true,
    start: '22:00',
    end: '08:00',
    days: ['saturday', 'sunday']
  },
  // Notification categories
  categories: {
    tasks: {
      enabled: true,
      email: true,
      push: true,
      events: {
        task_assigned: true,
        task_due_soon: true,
        task_overdue: true,
        task_completed: true,
        task_comment: true
      }
    },
    projects: {
      enabled: true,
      email: true,
      push: true,
      events: {
        project_update: true,
        budget_alert: true,
        milestone_reached: true,
        document_added: true,
        team_change: false
      }
    },
    transactions: {
      enabled: true,
      email: true,
      push: false,
      events: {
        payment_received: true,
        payment_due: true,
        expense_approved: true,
        budget_exceeded: true
      }
    },
    contacts: {
      enabled: true,
      email: false,
      push: true,
      events: {
        new_contact: false,
        contact_update: false,
        meeting_reminder: true,
        follow_up_due: true
      }
    },
    approvals: {
      enabled: true,
      email: true,
      push: true,
      events: {
        approval_required: true,
        approval_completed: true,
        approval_rejected: true
      }
    },
    system: {
      enabled: true,
      email: true,
      push: false,
      events: {
        security_alert: true,
        login_new_device: true,
        password_change: true,
        system_maintenance: true
      }
    }
  }
};

const categoryIcons = {
  tasks: CheckCircle2,
  projects: Building2,
  transactions: DollarSign,
  contacts: Users,
  approvals: Briefcase,
  system: Shield
};

const categoryDescriptions = {
  tasks: 'Get notified about task assignments, due dates, and completions',
  projects: 'Stay updated on project changes, budgets, and milestones',
  transactions: 'Receive alerts for payments, expenses, and budget items',
  contacts: 'Get reminders for meetings and follow-ups with contacts',
  approvals: 'Be notified when approvals are needed or completed',
  system: 'Important security and system-related notifications'
};

export default function NotificationPreferences() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      if (isDemoMode()) {
        setSettings(demoNotificationSettings);
      } else {
        const { data, error } = await supabase
          .from('user_notification_settings')
          .select('*')
          .single();

        if (error) throw error;
        setSettings(data?.settings || demoNotificationSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setSettings(demoNotificationSettings);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      if (!isDemoMode()) {
        await supabase
          .from('user_notification_settings')
          .upsert({ settings });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateChannel = (channel, enabled) => {
    setSettings(prev => ({
      ...prev,
      channels: { ...prev.channels, [channel]: enabled }
    }));
  };

  const updateEmailDigest = (key, value) => {
    setSettings(prev => ({
      ...prev,
      email_digest: { ...prev.email_digest, [key]: value }
    }));
  };

  const updateQuietHours = (key, value) => {
    setSettings(prev => ({
      ...prev,
      quiet_hours: { ...prev.quiet_hours, [key]: value }
    }));
  };

  const updateCategory = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: {
          ...prev.categories[category],
          [key]: value
        }
      }
    }));
  };

  const updateCategoryEvent = (category, event, enabled) => {
    setSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: {
          ...prev.categories[category],
          events: {
            ...prev.categories[category].events,
            [event]: enabled
          }
        }
      }
    }));
  };

  const formatEventName = (event) => {
    return event
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading || !settings) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="h-7 w-7 text-blue-600" />
            Notification Preferences
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Customize how and when you receive notifications
          </p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Delivery Channels */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delivery Channels</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Choose how you want to receive notifications
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: 'email', name: 'Email', icon: Mail, desc: 'Receive via email' },
            { id: 'push', name: 'Push', icon: Smartphone, desc: 'Browser notifications' },
            { id: 'in_app', name: 'In-App', icon: Monitor, desc: 'Notifications in app' },
            { id: 'sms', name: 'SMS', icon: MessageSquare, desc: 'Text messages' }
          ].map(channel => (
            <div
              key={channel.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                settings.channels[channel.id]
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
              onClick={() => updateChannel(channel.id, !settings.channels[channel.id])}
            >
              <div className="flex items-center justify-between mb-2">
                <channel.icon className={`h-5 w-5 ${settings.channels[channel.id] ? 'text-blue-600' : 'text-gray-400'}`} />
                <div className={`w-10 h-6 rounded-full relative transition-colors ${
                  settings.channels[channel.id] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.channels[channel.id] ? 'right-1' : 'left-1'
                  }`} />
                </div>
              </div>
              <div className="font-medium text-gray-900 dark:text-white">{channel.name}</div>
              <div className="text-xs text-gray-500">{channel.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Email Digest */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Email Digest</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Receive a summary of notifications instead of individual emails
            </p>
          </div>
          <div
            className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors ${
              settings.email_digest.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
            onClick={() => updateEmailDigest('enabled', !settings.email_digest.enabled)}
          >
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
              settings.email_digest.enabled ? 'right-1' : 'left-1'
            }`} />
          </div>
        </div>

        {settings.email_digest.enabled && (
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Frequency
              </label>
              <select
                value={settings.email_digest.frequency}
                onChange={(e) => updateEmailDigest('frequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="realtime">Real-time (no digest)</option>
                <option value="daily">Daily Digest</option>
                <option value="weekly">Weekly Digest</option>
              </select>
            </div>
            {settings.email_digest.frequency !== 'realtime' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Delivery Time
                </label>
                <input
                  type="time"
                  value={settings.email_digest.time}
                  onChange={(e) => updateEmailDigest('time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quiet Hours */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <VolumeX className="h-5 w-5" />
              Quiet Hours
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Pause non-urgent notifications during specific times
            </p>
          </div>
          <div
            className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors ${
              settings.quiet_hours.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
            onClick={() => updateQuietHours('enabled', !settings.quiet_hours.enabled)}
          >
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
              settings.quiet_hours.enabled ? 'right-1' : 'left-1'
            }`} />
          </div>
        </div>

        {settings.quiet_hours.enabled && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={settings.quiet_hours.start}
                  onChange={(e) => updateQuietHours('start', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={settings.quiet_hours.end}
                  onChange={(e) => updateQuietHours('end', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Also mute all day on:
              </label>
              <div className="flex flex-wrap gap-2">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                  <button
                    key={day}
                    onClick={() => {
                      const days = settings.quiet_hours.days || [];
                      updateQuietHours('days',
                        days.includes(day)
                          ? days.filter(d => d !== day)
                          : [...days, day]
                      );
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm capitalize transition-colors ${
                      settings.quiet_hours.days?.includes(day)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notification Categories */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Categories</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Fine-tune which notifications you receive for each category
          </p>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {Object.entries(settings.categories).map(([key, category]) => {
            const IconComponent = categoryIcons[key] || Bell;
            const isExpanded = expandedCategory === key;

            return (
              <div key={key}>
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  onClick={() => setExpandedCategory(isExpanded ? null : key)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${category.enabled ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                      <IconComponent className={`h-5 w-5 ${category.enabled ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white capitalize">{key}</div>
                      <div className="text-sm text-gray-500">{categoryDescriptions[key]}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-6 rounded-full relative transition-colors ${
                        category.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateCategory(key, 'enabled', !category.enabled);
                      }}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        category.enabled ? 'right-1' : 'left-1'
                      }`} />
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {isExpanded && category.enabled && (
                  <div className="px-4 pb-4 bg-gray-50 dark:bg-gray-900">
                    {/* Channel toggles for this category */}
                    <div className="flex items-center gap-4 mb-4 pt-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Deliver via:</span>
                      {[
                        { id: 'email', icon: Mail },
                        { id: 'push', icon: Smartphone }
                      ].map(ch => (
                        <button
                          key={ch.id}
                          onClick={() => updateCategory(key, ch.id, !category[ch.id])}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                            category[ch.id]
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <ch.icon className="h-3 w-3" />
                          {ch.id}
                        </button>
                      ))}
                    </div>

                    {/* Event toggles */}
                    <div className="space-y-2">
                      {Object.entries(category.events).map(([event, enabled]) => (
                        <div
                          key={event}
                          className="flex items-center justify-between py-2 px-3 bg-white dark:bg-gray-800 rounded-lg"
                        >
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {formatEventName(event)}
                          </span>
                          <div
                            className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${
                              enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                            onClick={() => updateCategoryEvent(key, event, !enabled)}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              enabled ? 'right-1' : 'left-1'
                            }`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">About Notifications</p>
            <p>
              Changes to your notification preferences will take effect immediately.
              Some critical system notifications (like security alerts) cannot be disabled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
