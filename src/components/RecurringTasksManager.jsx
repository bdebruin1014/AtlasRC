import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';
import {
  Repeat,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  X,
  Settings,
  Bell,
  CalendarDays,
  CalendarClock
} from 'lucide-react';

// Demo recurring tasks
const DEMO_RECURRING_TASKS = [
  {
    id: 'rt-1',
    title: 'Weekly Site Inspection',
    description: 'Conduct comprehensive site walkthrough and document progress',
    frequency: 'weekly',
    frequency_value: 1,
    day_of_week: 'monday',
    time: '09:00',
    assignee_id: 'user-1',
    assignee_name: 'John Smith',
    project_id: 'proj-1',
    project_name: 'Sunset Apartments',
    category: 'inspection',
    priority: 'high',
    estimated_duration: 120,
    notifications: true,
    notify_before_minutes: 60,
    is_active: true,
    last_generated: '2026-01-20T09:00:00Z',
    next_occurrence: '2026-01-27T09:00:00Z',
    instances_created: 12,
    instances_completed: 10,
    completion_rate: 83.3,
    created_at: '2025-10-15T00:00:00Z'
  },
  {
    id: 'rt-2',
    title: 'Monthly Budget Review',
    description: 'Review project financials, compare actuals to budget, and update forecasts',
    frequency: 'monthly',
    frequency_value: 1,
    day_of_month: 1,
    time: '10:00',
    assignee_id: 'user-2',
    assignee_name: 'Sarah Johnson',
    project_id: 'proj-1',
    project_name: 'Sunset Apartments',
    category: 'financial',
    priority: 'high',
    estimated_duration: 180,
    notifications: true,
    notify_before_minutes: 1440,
    is_active: true,
    last_generated: '2026-01-01T10:00:00Z',
    next_occurrence: '2026-02-01T10:00:00Z',
    instances_created: 4,
    instances_completed: 4,
    completion_rate: 100,
    created_at: '2025-10-01T00:00:00Z'
  },
  {
    id: 'rt-3',
    title: 'Daily Safety Checklist',
    description: 'Complete daily safety inspection checklist before work begins',
    frequency: 'daily',
    frequency_value: 1,
    time: '07:00',
    exclude_weekends: true,
    assignee_id: 'user-3',
    assignee_name: 'Mike Williams',
    project_id: 'proj-1',
    project_name: 'Sunset Apartments',
    category: 'safety',
    priority: 'high',
    estimated_duration: 30,
    notifications: true,
    notify_before_minutes: 30,
    is_active: true,
    last_generated: '2026-01-24T07:00:00Z',
    next_occurrence: '2026-01-27T07:00:00Z',
    instances_created: 65,
    instances_completed: 63,
    completion_rate: 96.9,
    created_at: '2025-11-01T00:00:00Z'
  },
  {
    id: 'rt-4',
    title: 'Quarterly Insurance Review',
    description: 'Review and verify all insurance policies and coverage limits',
    frequency: 'quarterly',
    frequency_value: 1,
    month_of_quarter: 1,
    day_of_month: 15,
    time: '14:00',
    assignee_id: 'user-2',
    assignee_name: 'Sarah Johnson',
    project_id: null,
    project_name: 'All Projects',
    category: 'compliance',
    priority: 'medium',
    estimated_duration: 240,
    notifications: true,
    notify_before_minutes: 10080,
    is_active: true,
    last_generated: '2026-01-15T14:00:00Z',
    next_occurrence: '2026-04-15T14:00:00Z',
    instances_created: 2,
    instances_completed: 2,
    completion_rate: 100,
    created_at: '2025-07-01T00:00:00Z'
  },
  {
    id: 'rt-5',
    title: 'Bi-Weekly Vendor Status Meeting',
    description: 'Meet with key vendors to discuss progress and address concerns',
    frequency: 'biweekly',
    frequency_value: 2,
    day_of_week: 'wednesday',
    time: '15:00',
    assignee_id: 'user-1',
    assignee_name: 'John Smith',
    project_id: 'proj-1',
    project_name: 'Sunset Apartments',
    category: 'meeting',
    priority: 'medium',
    estimated_duration: 90,
    notifications: true,
    notify_before_minutes: 60,
    is_active: false,
    last_generated: '2026-01-15T15:00:00Z',
    next_occurrence: null,
    instances_created: 8,
    instances_completed: 7,
    completion_rate: 87.5,
    created_at: '2025-09-01T00:00:00Z'
  }
];

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' }
];

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
];

const CATEGORIES = [
  { value: 'inspection', label: 'Inspection', color: 'bg-blue-100 text-blue-800' },
  { value: 'financial', label: 'Financial', color: 'bg-green-100 text-green-800' },
  { value: 'safety', label: 'Safety', color: 'bg-red-100 text-red-800' },
  { value: 'compliance', label: 'Compliance', color: 'bg-purple-100 text-purple-800' },
  { value: 'meeting', label: 'Meeting', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-orange-100 text-orange-800' },
  { value: 'reporting', label: 'Reporting', color: 'bg-teal-100 text-teal-800' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
];

const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const getNextOccurrenceText = (nextDate) => {
  if (!nextDate) return 'Not scheduled';
  const next = new Date(nextDate);
  const now = new Date();
  const diffMs = next - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < 14) return 'Next week';
  return next.toLocaleDateString();
};

const RecurringTasksManager = ({ projectId = null }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'weekly',
    frequency_value: 1,
    day_of_week: 'monday',
    day_of_month: 1,
    time: '09:00',
    assignee_name: '',
    category: 'inspection',
    priority: 'medium',
    estimated_duration: 60,
    notifications: true,
    notify_before_minutes: 60,
    exclude_weekends: false
  });

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      if (isDemoMode()) {
        let data = [...DEMO_RECURRING_TASKS];
        if (projectId) {
          data = data.filter(t => t.project_id === projectId || t.project_id === null);
        }
        setTasks(data);
      } else {
        let query = supabase
          .from('recurring_tasks')
          .select('*')
          .order('next_occurrence', { ascending: true });

        if (projectId) {
          query = query.or(`project_id.eq.${projectId},project_id.is.null`);
        }

        const { data, error } = await query;
        if (error) throw error;
        setTasks(data || []);
      }
    } catch (error) {
      console.error('Error loading recurring tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matches =
          task.title?.toLowerCase().includes(search) ||
          task.description?.toLowerCase().includes(search) ||
          task.assignee_name?.toLowerCase().includes(search);
        if (!matches) return false;
      }

      if (selectedCategory !== 'all' && task.category !== selectedCategory) {
        return false;
      }

      if (showActiveOnly && !task.is_active) {
        return false;
      }

      return true;
    });
  }, [tasks, searchTerm, selectedCategory, showActiveOnly]);

  const toggleTaskActive = (taskId) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, is_active: !t.is_active } : t
    ));
  };

  const handleSaveTask = () => {
    if (!formData.title) return;

    const newTask = {
      id: editingTask?.id || `rt-${Date.now()}`,
      ...formData,
      project_id: projectId,
      project_name: projectId ? 'Current Project' : 'All Projects',
      is_active: true,
      last_generated: null,
      next_occurrence: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      instances_created: 0,
      instances_completed: 0,
      completion_rate: 0,
      created_at: editingTask?.created_at || new Date().toISOString()
    };

    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? newTask : t));
    } else {
      setTasks(prev => [...prev, newTask]);
    }

    setShowModal(false);
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      frequency: 'weekly',
      frequency_value: 1,
      day_of_week: 'monday',
      day_of_month: 1,
      time: '09:00',
      assignee_name: '',
      category: 'inspection',
      priority: 'medium',
      estimated_duration: 60,
      notifications: true,
      notify_before_minutes: 60,
      exclude_weekends: false
    });
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      frequency: task.frequency,
      frequency_value: task.frequency_value || 1,
      day_of_week: task.day_of_week || 'monday',
      day_of_month: task.day_of_month || 1,
      time: task.time || '09:00',
      assignee_name: task.assignee_name || '',
      category: task.category || 'inspection',
      priority: task.priority || 'medium',
      estimated_duration: task.estimated_duration || 60,
      notifications: task.notifications !== false,
      notify_before_minutes: task.notify_before_minutes || 60,
      exclude_weekends: task.exclude_weekends || false
    });
    setShowModal(true);
  };

  const handleDeleteTask = (taskId) => {
    if (confirm('Are you sure you want to delete this recurring task?')) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Repeat className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Recurring Tasks</h2>
              <p className="text-sm text-gray-500">
                {tasks.filter(t => t.is_active).length} active schedules
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingTask(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Schedule
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-600">Active only</span>
          </label>
        </div>
      </div>

      {/* Task List */}
      <div className="p-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Repeat className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No recurring tasks found</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 text-teal-600 hover:text-teal-700"
            >
              Create your first recurring task
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => {
              const category = CATEGORIES.find(c => c.value === task.category);

              return (
                <div
                  key={task.id}
                  className={`border rounded-lg p-4 transition-all ${
                    task.is_active
                      ? 'border-gray-200 hover:border-gray-300'
                      : 'border-gray-100 bg-gray-50 opacity-75'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Status Toggle */}
                    <button
                      onClick={() => toggleTaskActive(task.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        task.is_active
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                      }`}
                    >
                      {task.is_active ? (
                        <Play className="w-5 h-5" />
                      ) : (
                        <Pause className="w-5 h-5" />
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-gray-900">{task.title}</h3>
                        {category && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${category.color}`}>
                            {category.label}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          task.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : task.priority === 'low'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {task.priority}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <CalendarClock className="w-4 h-4" />
                          {FREQUENCY_OPTIONS.find(f => f.value === task.frequency)?.label}
                          {task.day_of_week && ` on ${task.day_of_week}s`}
                          {task.day_of_month && ` on day ${task.day_of_month}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {task.time} ({formatDuration(task.estimated_duration)})
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {task.assignee_name || 'Unassigned'}
                        </span>
                        {task.notifications && (
                          <span className="flex items-center gap-1 text-teal-600">
                            <Bell className="w-4 h-4" />
                            Notifications on
                          </span>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6 mt-3 pt-3 border-t border-gray-100">
                        <div className="text-sm">
                          <span className="text-gray-500">Next: </span>
                          <span className={`font-medium ${task.is_active ? 'text-teal-600' : 'text-gray-400'}`}>
                            {task.is_active ? getNextOccurrenceText(task.next_occurrence) : 'Paused'}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Created: </span>
                          <span className="font-medium">{task.instances_created}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Completed: </span>
                          <span className="font-medium text-green-600">{task.instances_completed}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Rate: </span>
                          <span className={`font-medium ${
                            task.completion_rate >= 90 ? 'text-green-600' :
                            task.completion_rate >= 70 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {task.completion_rate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {editingTask ? 'Edit Recurring Task' : 'Create Recurring Task'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingTask(null);
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Weekly Site Inspection"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    {FREQUENCY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {['weekly', 'biweekly'].includes(formData.frequency) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                    <select
                      value={formData.day_of_week}
                      onChange={(e) => setFormData(prev => ({ ...prev, day_of_week: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    >
                      {DAYS_OF_WEEK.map(day => (
                        <option key={day.value} value={day.value}>{day.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {['monthly', 'quarterly', 'yearly'].includes(formData.frequency) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Day of Month</label>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={formData.day_of_month}
                      onChange={(e) => setFormData(prev => ({ ...prev, day_of_month: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    min={15}
                    step={15}
                    value={formData.estimated_duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                <input
                  type="text"
                  value={formData.assignee_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, assignee_name: e.target.value }))}
                  placeholder="Enter assignee name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notifications}
                    onChange={(e) => setFormData(prev => ({ ...prev, notifications: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">Send notifications</span>
                </label>

                {formData.frequency === 'daily' && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.exclude_weekends}
                      onChange={(e) => setFormData(prev => ({ ...prev, exclude_weekends: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">Exclude weekends</span>
                  </label>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingTask(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTask}
                disabled={!formData.title}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                {editingTask ? 'Save Changes' : 'Create Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringTasksManager;
