import React, { useState, useEffect, useMemo } from 'react';
import { Bell, X, Plus, Clock, Check, Trash2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';

// Demo reminders data
const demoReminders = [
  {
    id: 'rem-001',
    title: 'Follow up with Robert Williams',
    description: 'Call about the downtown properties he mentioned',
    dueDate: '2026-01-25T14:00:00Z',
    entityType: 'contact',
    entityId: 'cnt-456',
    entityName: 'Robert Williams',
    priority: 'high',
    isRecurring: false,
    recurringPattern: null,
    status: 'pending',
    snoozedUntil: null,
    createdAt: '2026-01-24T10:00:00Z'
  },
  {
    id: 'rem-002',
    title: 'Review Highland Park financials',
    description: 'Quarterly budget review due',
    dueDate: '2026-01-25T17:00:00Z',
    entityType: 'project',
    entityId: 'proj-123',
    entityName: 'Highland Park Development',
    priority: 'medium',
    isRecurring: false,
    recurringPattern: null,
    status: 'pending',
    snoozedUntil: null,
    createdAt: '2026-01-23T09:00:00Z'
  },
  {
    id: 'rem-003',
    title: 'Weekly team standup',
    description: 'Monday morning sync with the team',
    dueDate: '2026-01-27T09:00:00Z',
    entityType: null,
    entityId: null,
    entityName: null,
    priority: 'medium',
    isRecurring: true,
    recurringPattern: 'weekly',
    status: 'pending',
    snoozedUntil: null,
    createdAt: '2026-01-01T09:00:00Z'
  },
  {
    id: 'rem-004',
    title: 'Submit permit application',
    description: 'Building permit for Riverside Commons',
    dueDate: '2026-01-26T12:00:00Z',
    entityType: 'project',
    entityId: 'proj-124',
    entityName: 'Riverside Commons',
    priority: 'high',
    isRecurring: false,
    recurringPattern: null,
    status: 'pending',
    snoozedUntil: null,
    createdAt: '2026-01-20T15:00:00Z'
  },
  {
    id: 'rem-005',
    title: 'Insurance renewal review',
    description: 'Annual policy review for all properties',
    dueDate: '2026-01-28T10:00:00Z',
    entityType: null,
    entityId: null,
    entityName: null,
    priority: 'low',
    isRecurring: true,
    recurringPattern: 'yearly',
    status: 'pending',
    snoozedUntil: null,
    createdAt: '2025-12-15T10:00:00Z'
  }
];

const priorityColors = {
  high: 'text-red-600 bg-red-50',
  medium: 'text-yellow-600 bg-yellow-50',
  low: 'text-gray-600 bg-gray-50'
};

const ReminderWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState('upcoming');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '09:00',
    priority: 'medium',
    isRecurring: false,
    recurringPattern: 'daily'
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  async function fetchReminders() {
    try {
      if (isDemoMode()) {
        setReminders(demoReminders);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('status', 'pending')
        .order('due_date', { ascending: true });

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      setReminders(demoReminders);
    } finally {
      setLoading(false);
    }
  }

  const filteredReminders = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return reminders.filter(reminder => {
      if (reminder.status === 'completed') return filter === 'completed';
      if (filter === 'completed') return false;

      const dueDate = new Date(reminder.dueDate);

      switch (filter) {
        case 'today':
          return dueDate >= today && dueDate < tomorrow;
        case 'week':
          return dueDate >= today && dueDate < weekEnd;
        case 'overdue':
          return dueDate < now && reminder.status === 'pending';
        default:
          return reminder.status === 'pending';
      }
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [reminders, filter]);

  const overdueCount = useMemo(() => {
    const now = new Date();
    return reminders.filter(r =>
      r.status === 'pending' && new Date(r.dueDate) < now
    ).length;
  }, [reminders]);

  const todayCount = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return reminders.filter(r => {
      const dueDate = new Date(r.dueDate);
      return r.status === 'pending' && dueDate >= today && dueDate < tomorrow;
    }).length;
  }, [reminders]);

  function formatDueDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    if (dueDay < today) {
      const days = Math.floor((today - dueDay) / (1000 * 60 * 60 * 24));
      return { text: `${days}d overdue`, class: 'text-red-600 font-medium' };
    } else if (dueDay.getTime() === today.getTime()) {
      return { text: `Today at ${time}`, class: 'text-orange-600 font-medium' };
    } else if (dueDay.getTime() === tomorrow.getTime()) {
      return { text: `Tomorrow at ${time}`, class: 'text-blue-600' };
    } else {
      return { text: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ` at ${time}`, class: 'text-gray-600' };
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime}`);

    if (isDemoMode()) {
      const newReminder = {
        id: `rem-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        dueDate: dueDateTime.toISOString(),
        entityType: null,
        entityId: null,
        entityName: null,
        priority: formData.priority,
        isRecurring: formData.isRecurring,
        recurringPattern: formData.isRecurring ? formData.recurringPattern : null,
        status: 'pending',
        snoozedUntil: null,
        createdAt: new Date().toISOString()
      };
      setReminders(prev => [...prev, newReminder].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)));
      setShowAddForm(false);
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        dueTime: '09:00',
        priority: 'medium',
        isRecurring: false,
        recurringPattern: 'daily'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('reminders')
        .insert({
          title: formData.title,
          description: formData.description,
          due_date: dueDateTime.toISOString(),
          priority: formData.priority,
          is_recurring: formData.isRecurring,
          recurring_pattern: formData.isRecurring ? formData.recurringPattern : null,
          status: 'pending'
        });

      if (error) throw error;
      fetchReminders();
      setShowAddForm(false);
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        dueTime: '09:00',
        priority: 'medium',
        isRecurring: false,
        recurringPattern: 'daily'
      });
    } catch (error) {
      console.error('Error creating reminder:', error);
    }
  }

  async function completeReminder(reminder) {
    if (isDemoMode()) {
      if (reminder.isRecurring) {
        // For recurring reminders, create a new one for the next occurrence
        const nextDate = new Date(reminder.dueDate);
        switch (reminder.recurringPattern) {
          case 'daily':
            nextDate.setDate(nextDate.getDate() + 1);
            break;
          case 'weekly':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
          case 'yearly':
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
        }
        setReminders(prev => prev.map(r =>
          r.id === reminder.id ? { ...r, dueDate: nextDate.toISOString() } : r
        ));
      } else {
        setReminders(prev => prev.map(r =>
          r.id === reminder.id ? { ...r, status: 'completed' } : r
        ));
      }
      return;
    }

    try {
      const { error } = await supabase
        .from('reminders')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', reminder.id);

      if (error) throw error;
      fetchReminders();
    } catch (error) {
      console.error('Error completing reminder:', error);
    }
  }

  async function snoozeReminder(reminder, hours) {
    const snoozeUntil = new Date();
    snoozeUntil.setHours(snoozeUntil.getHours() + hours);

    if (isDemoMode()) {
      setReminders(prev => prev.map(r =>
        r.id === reminder.id ? { ...r, dueDate: snoozeUntil.toISOString() } : r
      ));
      return;
    }

    try {
      const { error } = await supabase
        .from('reminders')
        .update({ due_date: snoozeUntil.toISOString() })
        .eq('id', reminder.id);

      if (error) throw error;
      fetchReminders();
    } catch (error) {
      console.error('Error snoozing reminder:', error);
    }
  }

  async function deleteReminder(reminder) {
    if (isDemoMode()) {
      setReminders(prev => prev.filter(r => r.id !== reminder.id));
      return;
    }

    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminder.id);

      if (error) throw error;
      fetchReminders();
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  }

  const totalBadgeCount = overdueCount + todayCount;

  return (
    <>
      {/* Reminder Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full z-50 transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="w-96 h-full bg-white shadow-xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Reminders</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1">
                <span className="font-bold">{overdueCount}</span>
                <span className="opacity-80">overdue</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold">{todayCount}</span>
                <span className="opacity-80">today</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-2 border-b flex gap-1 bg-gray-50">
            {['upcoming', 'today', 'week', 'overdue'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-lg capitalize transition-colors",
                  filter === f
                    ? "bg-amber-100 text-amber-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {showAddForm ? (
              <form onSubmit={handleSubmit} className="p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Reminder title"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional details"
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.dueTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueTime: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isRecurring}
                      onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Recurring reminder</span>
                  </label>
                  {formData.isRecurring && (
                    <select
                      value={formData.recurringPattern}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurringPattern: e.target.value }))}
                      className="w-full mt-2 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm"
                  >
                    Add Reminder
                  </button>
                </div>
              </form>
            ) : loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
              </div>
            ) : filteredReminders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No reminders {filter !== 'upcoming' ? `${filter}` : ''}</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredReminders.map(reminder => {
                  const dueInfo = formatDueDate(reminder.dueDate);
                  return (
                    <div
                      key={reminder.id}
                      className="p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex gap-3">
                        <button
                          onClick={() => completeReminder(reminder)}
                          className="w-5 h-5 mt-0.5 rounded-full border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 flex-shrink-0 flex items-center justify-center transition-colors"
                          title="Mark complete"
                        >
                          <Check className="w-3 h-3 text-transparent hover:text-green-500" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-gray-900 text-sm truncate">
                              {reminder.title}
                            </h4>
                            <span className={cn(
                              "px-1.5 py-0.5 rounded text-xs flex-shrink-0",
                              priorityColors[reminder.priority]
                            )}>
                              {reminder.priority}
                            </span>
                          </div>
                          {reminder.description && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                              {reminder.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className={cn("text-xs", dueInfo.class)}>
                              {dueInfo.text}
                            </span>
                            {reminder.isRecurring && (
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <RefreshCw className="w-3 h-3" />
                                {reminder.recurringPattern}
                              </span>
                            )}
                          </div>
                          {reminder.entityName && (
                            <div className="text-xs text-blue-600 mt-1">
                              {reminder.entityType}: {reminder.entityName}
                            </div>
                          )}
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => snoozeReminder(reminder, 1)}
                              className="text-xs text-gray-500 hover:text-amber-600"
                            >
                              +1hr
                            </button>
                            <button
                              onClick={() => snoozeReminder(reminder, 24)}
                              className="text-xs text-gray-500 hover:text-amber-600"
                            >
                              +1day
                            </button>
                            <button
                              onClick={() => deleteReminder(reminder)}
                              className="text-xs text-gray-500 hover:text-red-600 ml-auto"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer - Add Button */}
          {!showAddForm && (
            <div className="p-3 border-t bg-gray-50">
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Reminder
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Button - positioned to the left of chat */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed bottom-6 right-24 w-14 h-14 rounded-full shadow-lg z-40",
            "bg-amber-500 hover:bg-amber-600 text-white",
            "flex items-center justify-center transition-all",
            "hover:scale-105"
          )}
        >
          <Bell className="w-6 h-6" />
          {totalBadgeCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-medium">
              {totalBadgeCount > 9 ? '9+' : totalBadgeCount}
            </span>
          )}
        </button>
      )}
    </>
  );
};

export default ReminderWidget;
