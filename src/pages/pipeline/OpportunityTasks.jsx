// src/pages/pipeline/OpportunityTasks.jsx
// Task management panel for opportunity detail page

import React, { useState, useEffect } from 'react';
import {
  Plus, CheckCircle2, Circle, Clock, AlertTriangle, Trash2,
  ChevronDown, ChevronUp, Calendar, User, Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from '@/services/opportunityTasksService';

const OpportunityTasks = ({ opportunity }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState('all'); // all, todo, in-progress, completed
  const [newTask, setNewTask] = useState({
    title: '',
    category: 'due-diligence',
    priority: 'medium',
    status: 'todo',
    assigned_to: '',
    due_date: '',
    description: '',
  });

  const oppId = opportunity?.id || 'demo';

  useEffect(() => {
    loadTasks();
  }, [oppId]);

  const loadTasks = async () => {
    setLoading(true);
    const data = await getTasks(oppId);
    setTasks(data);
    setLoading(false);
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;
    const created = await createTask(oppId, newTask);
    setTasks(prev => [...prev, created]);
    setNewTask({
      title: '',
      category: 'due-diligence',
      priority: 'medium',
      status: 'todo',
      assigned_to: '',
      due_date: '',
      description: '',
    });
    setShowAddForm(false);
  };

  const handleToggle = async (task) => {
    const updated = await toggleTask(task.id, task.status);
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, ...updated } : t));
  };

  const handleDelete = async (taskId) => {
    await deleteTask(taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const filteredTasks = tasks.filter(t => filter === 'all' || t.status === filter);

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalCount = tasks.length;

  const getPriorityBadge = (priority) => {
    const p = TASK_PRIORITIES.find(tp => tp.id === priority);
    return p ? (
      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', p.bgColor)}>
        {p.label}
      </span>
    ) : null;
  };

  const getCategoryBadge = (category) => {
    const c = TASK_CATEGORIES.find(tc => tc.id === category);
    return c ? (
      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium text-white', c.color)}>
        {c.label}
      </span>
    ) : null;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Tasks</h2>
          <p className="text-sm text-gray-500">
            {completedCount} of {totalCount} tasks completed
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-1" /> Add Task
        </Button>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 rounded-full h-2 transition-all"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 border-b pb-2">
        {[
          { value: 'all', label: `All (${tasks.length})` },
          { value: 'todo', label: `To Do (${tasks.filter(t => t.status === 'todo').length})` },
          { value: 'in-progress', label: `In Progress (${tasks.filter(t => t.status === 'in-progress').length})` },
          { value: 'completed', label: `Done (${completedCount})` },
        ].map(f => (
          <button
            key={f.value}
            className={cn(
              'px-3 py-1 text-sm rounded-md transition-colors',
              filter === f.value ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500 hover:text-gray-700'
            )}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
          <input
            className="w-full border rounded-md px-3 py-2 text-sm"
            placeholder="Task title..."
            value={newTask.title}
            onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              className="border rounded-md px-3 py-2 text-sm"
              value={newTask.category}
              onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value }))}
            >
              {TASK_CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <select
              className="border rounded-md px-3 py-2 text-sm"
              value={newTask.priority}
              onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
            >
              {TASK_PRIORITIES.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            <input
              type="text"
              className="border rounded-md px-3 py-2 text-sm"
              placeholder="Assigned to..."
              value={newTask.assigned_to}
              onChange={(e) => setNewTask(prev => ({ ...prev, assigned_to: e.target.value }))}
            />
            <input
              type="date"
              className="border rounded-md px-3 py-2 text-sm"
              value={newTask.due_date}
              onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
            />
          </div>
          <textarea
            className="w-full border rounded-md px-3 py-2 text-sm"
            placeholder="Description (optional)..."
            rows={2}
            value={newTask.description}
            onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAddTask} disabled={!newTask.title.trim()}>Add Task</Button>
          </div>
        </div>
      )}

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p>{filter === 'all' ? 'No tasks yet. Add one to get started.' : `No ${filter} tasks.`}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map(task => (
            <div
              key={task.id}
              className={cn(
                'border rounded-lg p-3 flex items-start gap-3 transition-colors',
                task.status === 'completed' ? 'bg-gray-50 opacity-75' : 'bg-white hover:bg-gray-50'
              )}
            >
              <button
                className="mt-0.5 flex-shrink-0"
                onClick={() => handleToggle(task)}
              >
                {task.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : task.status === 'in-progress' ? (
                  <Clock className="w-5 h-5 text-blue-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300 hover:text-gray-500" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm font-medium',
                  task.status === 'completed' && 'line-through text-gray-400'
                )}>
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{task.description}</p>
                )}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {getCategoryBadge(task.category)}
                  {getPriorityBadge(task.priority)}
                  {task.assigned_to && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <User className="w-3 h-3" /> {task.assigned_to}
                    </span>
                  )}
                  {task.due_date && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" /> {task.due_date}
                    </span>
                  )}
                </div>
              </div>
              <button
                className="text-gray-400 hover:text-red-500 flex-shrink-0"
                onClick={() => handleDelete(task.id)}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OpportunityTasks;
