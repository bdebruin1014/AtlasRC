import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  ListTodo,
  CalendarDays,
  User,
  AlertCircle,
  X,
  Workflow,
  Asterisk,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

import {
  getRecordTasks,
  createRecordTask,
  updateRecordTask,
  deleteRecordTask,
  toggleRecordTask,
  getRecordTaskStats,
  applyWorkflowToRecord,
  getRecordWorkflowInstances,
} from '@/services/recordTasksService';

import {
  getTemplatesForModule,
  TASK_PRIORITIES,
  TASK_CATEGORIES,
} from '@/services/workflowTemplateService';

// ============================================
// PRIORITY COLOR CONFIG
// ============================================

const priorityColorMap = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
};

// ============================================
// CATEGORY COLOR CONFIG
// ============================================

const categoryColorMap = {
  'due-diligence': 'bg-blue-50 text-blue-700',
  legal: 'bg-purple-50 text-purple-700',
  finance: 'bg-green-50 text-green-700',
  negotiation: 'bg-amber-50 text-amber-700',
  inspection: 'bg-orange-50 text-orange-700',
  admin: 'bg-gray-50 text-gray-600',
  other: 'bg-slate-50 text-slate-600',
  construction: 'bg-cyan-50 text-cyan-700',
  permitting: 'bg-rose-50 text-rose-700',
  design: 'bg-indigo-50 text-indigo-700',
  accounting: 'bg-emerald-50 text-emerald-700',
};

// ============================================
// HELPERS
// ============================================

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  const due = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

function getPriorityBadgeClass(priorityId) {
  return priorityColorMap[priorityId] || 'bg-gray-100 text-gray-700';
}

function getCategoryBadgeClass(categoryId) {
  return categoryColorMap[categoryId] || 'bg-gray-50 text-gray-600';
}

function getCategoryLabel(categoryId) {
  const found = TASK_CATEGORIES?.find((c) => c.id === categoryId);
  return found ? found.label : categoryId || '';
}

function getPriorityLabel(priorityId) {
  const found = TASK_PRIORITIES?.find((p) => p.id === priorityId);
  return found ? found.label : priorityId || '';
}

// ============================================
// COMPONENT
// ============================================

export default function RecordTasksPanel({
  module,
  recordId,
  recordName,
  compact = false,
}) {
  const { toast } = useToast();

  // ---- State ----
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
  });
  const [filter, setFilter] = useState('all');
  const [showAddTask, setShowAddTask] = useState(false);
  const [showApplyWorkflow, setShowApplyWorkflow] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [workflowInstances, setWorkflowInstances] = useState([]);
  const [workflowSectionOpen, setWorkflowSectionOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmRemoveInstanceId, setConfirmRemoveInstanceId] = useState(null);
  const [applyingWorkflow, setApplyingWorkflow] = useState(null);
  const [workflowStartDate, setWorkflowStartDate] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    category: '',
    priority: 'medium',
    due_date: '',
    assigned_to: '',
    description: '',
  });

  // ---- Data loading ----
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [tasksData, statsData, instancesData] = await Promise.all([
        getRecordTasks(module, recordId),
        getRecordTaskStats(module, recordId),
        getRecordWorkflowInstances(module, recordId),
      ]);
      setTasks(tasksData || []);
      setStats(
        statsData || {
          total: 0,
          todo: 0,
          inProgress: 0,
          completed: 0,
          overdue: 0,
        }
      );
      setWorkflowInstances(instancesData || []);
    } catch (error) {
      console.error('Error loading record tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tasks. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [module, recordId, toast]);

  useEffect(() => {
    if (module && recordId) {
      loadData();
    }
  }, [module, recordId, loadData]);

  // ---- Filtered tasks ----
  const filteredTasks = useMemo(() => {
    if (filter === 'all') return tasks;
    return tasks.filter((t) => t.status === filter);
  }, [tasks, filter]);

  // ---- Group tasks by milestone for workflow-sourced tasks ----
  const groupedTasks = useMemo(() => {
    const milestoneGroups = {};
    const ungrouped = [];

    filteredTasks.forEach((task) => {
      if (task.source_milestone_name) {
        if (!milestoneGroups[task.source_milestone_name]) {
          milestoneGroups[task.source_milestone_name] = [];
        }
        milestoneGroups[task.source_milestone_name].push(task);
      } else {
        ungrouped.push(task);
      }
    });

    return { milestoneGroups, ungrouped };
  }, [filteredTasks]);

  // ---- Filter counts ----
  const filterCounts = useMemo(() => {
    return {
      all: tasks.length,
      todo: tasks.filter((t) => t.status === 'todo').length,
      'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
    };
  }, [tasks]);

  // ---- Handlers ----
  const handleToggleTask = async (task) => {
    try {
      const nextStatus =
        task.status === 'todo'
          ? 'in-progress'
          : task.status === 'in-progress'
          ? 'completed'
          : 'todo';

      await toggleRecordTask(module, recordId, task.id, nextStatus);
      await loadData();
    } catch (error) {
      console.error('Error toggling task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task status.',
        variant: 'destructive',
      });
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;

    setSaving(true);
    try {
      await createRecordTask(module, recordId, {
        ...newTask,
        status: 'todo',
      });
      setNewTask({
        title: '',
        category: '',
        priority: 'medium',
        due_date: '',
        assigned_to: '',
        description: '',
      });
      setShowAddTask(false);
      await loadData();
      toast({
        title: 'Task created',
        description: `"${newTask.title}" has been added.`,
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteRecordTask(module, recordId, taskId);
      setConfirmDeleteId(null);
      await loadData();
      toast({ title: 'Task deleted', description: 'Task has been removed.' });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task.',
        variant: 'destructive',
      });
    }
  };

  const handleOpenApplyWorkflow = async () => {
    try {
      const templates = await getTemplatesForModule(module);
      setAvailableTemplates(templates || []);
      setShowApplyWorkflow(true);
      setSelectedTemplateId(null);
      setWorkflowStartDate('');
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load workflow templates.',
        variant: 'destructive',
      });
    }
  };

  const handleApplyWorkflow = async (templateId) => {
    if (!workflowStartDate) {
      setSelectedTemplateId(templateId);
      return;
    }

    setApplyingWorkflow(templateId);
    try {
      await applyWorkflowToRecord(module, recordId, templateId, {
        start_date: workflowStartDate,
        record_name: recordName,
      });
      setShowApplyWorkflow(false);
      setSelectedTemplateId(null);
      setWorkflowStartDate('');
      await loadData();
      toast({
        title: 'Workflow applied',
        description: 'Tasks from the workflow template have been created.',
      });
    } catch (error) {
      console.error('Error applying workflow:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply workflow.',
        variant: 'destructive',
      });
    } finally {
      setApplyingWorkflow(null);
    }
  };

  const handleRemoveWorkflowInstance = async (instanceId) => {
    try {
      // Removing means we delete the instance record; the service handles cleanup
      const { deleteRecordWorkflowInstance } = await import(
        '@/services/recordTasksService'
      );
      if (deleteRecordWorkflowInstance) {
        await deleteRecordWorkflowInstance(module, recordId, instanceId);
      }
      setConfirmRemoveInstanceId(null);
      await loadData();
      toast({
        title: 'Workflow removed',
        description: 'Workflow instance and its tasks have been removed.',
      });
    } catch (error) {
      console.error('Error removing workflow instance:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove workflow instance.',
        variant: 'destructive',
      });
    }
  };

  // ---- Status icon ----
  const StatusIcon = ({ status, className }) => {
    if (status === 'completed') {
      return (
        <CheckCircle2
          className={cn('w-5 h-5 text-green-600', className)}
        />
      );
    }
    if (status === 'in-progress') {
      return (
        <Clock className={cn('w-5 h-5 text-blue-500', className)} />
      );
    }
    return (
      <Circle className={cn('w-5 h-5 text-gray-400', className)} />
    );
  };

  // ---- Loading state ----
  if (loading) {
    return (
      <div className="bg-white border rounded-lg p-8">
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading tasks...</span>
        </div>
      </div>
    );
  }

  // ---- Empty state ----
  if (tasks.length === 0 && !showAddTask && !showApplyWorkflow) {
    return (
      <div className="bg-white border rounded-lg p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="p-3 bg-gray-100 rounded-full mb-4">
            <ListTodo className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            No tasks yet
          </h3>
          <p className="text-sm text-gray-500 mb-4 max-w-xs">
            Add individual tasks or apply a workflow template to get started
            with {recordName || 'this record'}.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenApplyWorkflow}
            >
              <Workflow className="w-4 h-4 mr-1" />
              Apply Workflow
            </Button>
            <Button
              size="sm"
              className="bg-[#047857] hover:bg-[#065f46] text-white"
              onClick={() => setShowAddTask(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Task
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Task row renderer ----
  const renderTaskRow = (task) => {
    const taskOverdue =
      task.status !== 'completed' && isOverdue(task.due_date);

    return (
      <div
        key={task.id}
        className="flex items-start gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-md group transition-colors"
      >
        {/* Status toggle */}
        <button
          onClick={() => handleToggleTask(task)}
          className="mt-0.5 flex-shrink-0 focus:outline-none"
          title={`Status: ${task.status}. Click to advance.`}
        >
          <StatusIcon status={task.status} />
        </button>

        {/* Task content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                'text-sm font-medium text-gray-900',
                task.status === 'completed' && 'line-through text-gray-400'
              )}
            >
              {task.title}
            </span>

            {task.is_required && (
              <Asterisk className="w-3 h-3 text-red-500 flex-shrink-0" />
            )}

            {task.priority && (
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                  getPriorityBadgeClass(task.priority)
                )}
              >
                {getPriorityLabel(task.priority)}
              </span>
            )}

            {task.category && (
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                  getCategoryBadgeClass(task.category)
                )}
              >
                {getCategoryLabel(task.category)}
              </span>
            )}

            {task.source_template_name && (
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-violet-50 text-violet-600 border border-violet-200">
                {task.source_template_name}
              </span>
            )}
          </div>

          {/* Meta row */}
          {!compact && (
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {task.due_date && (
                <span
                  className={cn(
                    'flex items-center gap-1 text-xs',
                    taskOverdue ? 'text-red-600 font-medium' : 'text-gray-500'
                  )}
                >
                  <CalendarDays className="w-3 h-3" />
                  {formatDate(task.due_date)}
                  {taskOverdue && ' (overdue)'}
                </span>
              )}

              {task.assigned_to && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <User className="w-3 h-3" />
                  {task.assigned_to}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Delete button */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {confirmDeleteId === task.id ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="text-xs text-red-600 hover:text-red-700 font-medium px-1.5 py-0.5 rounded hover:bg-red-50"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="text-xs text-gray-500 hover:text-gray-700 px-1.5 py-0.5 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDeleteId(task.id)}
              className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-red-50"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  // ---- Main render ----
  return (
    <div className="bg-white border rounded-lg">
      {/* ========== Header Bar ========== */}
      <div className="px-4 py-3 border-b">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-gray-900">Tasks</h3>
            <Badge variant="secondary" className="text-xs">
              {stats.total}
            </Badge>

            {/* Stats summary */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-300" />
                {stats.todo} To Do
              </span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                {stats.inProgress} In Progress
              </span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {stats.completed} Completed
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenApplyWorkflow}
            >
              <Workflow className="w-4 h-4 mr-1" />
              Apply Workflow
            </Button>
            <Button
              size="sm"
              className="bg-[#047857] hover:bg-[#065f46] text-white"
              onClick={() => setShowAddTask(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Task
            </Button>
          </div>
        </div>
      </div>

      {/* ========== Workflow Instances Section ========== */}
      {workflowInstances.length > 0 && (
        <div className="border-b">
          <button
            onClick={() => setWorkflowSectionOpen(!workflowSectionOpen)}
            className="w-full flex items-center justify-between px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <Workflow className="w-3.5 h-3.5" />
              Active Workflows ({workflowInstances.length})
            </span>
            {workflowSectionOpen ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>

          {workflowSectionOpen && (
            <div className="px-4 pb-3 space-y-2">
              {workflowInstances.map((instance) => {
                const completedCount = instance.completed_count || 0;
                const totalCount = instance.total_count || 1;
                const percentage = Math.round(
                  (completedCount / totalCount) * 100
                );

                return (
                  <div
                    key={instance.id}
                    className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-md"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-800 truncate">
                          {instance.template_name}
                        </span>
                        <span className="text-xs text-gray-400">
                          Applied {formatDate(instance.applied_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#047857] rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {completedCount}/{totalCount} ({percentage}%)
                        </span>
                      </div>
                    </div>

                    {confirmRemoveInstanceId === instance.id ? (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() =>
                            handleRemoveWorkflowInstance(instance.id)
                          }
                          className="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmRemoveInstanceId(null)}
                          className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          setConfirmRemoveInstanceId(instance.id)
                        }
                        className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 flex-shrink-0"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========== Apply Workflow Modal ========== */}
      {showApplyWorkflow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[80vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-sm font-semibold text-gray-900">
                Apply Workflow Template
              </h3>
              <button
                onClick={() => {
                  setShowApplyWorkflow(false);
                  setSelectedTemplateId(null);
                  setWorkflowStartDate('');
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {availableTemplates.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Workflow className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">
                    No workflow templates available for this module.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={cn(
                        'border rounded-lg p-4 transition-colors',
                        selectedTemplateId === template.id
                          ? 'border-[#047857] bg-emerald-50'
                          : 'hover:border-gray-300'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900">
                            {template.name}
                          </h4>
                          {template.description && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                              {template.description}
                            </p>
                          )}
                          <span className="text-xs text-gray-400 mt-1 inline-block">
                            {template.task_count || template.tasks?.length || 0}{' '}
                            tasks
                          </span>
                        </div>

                        {selectedTemplateId === template.id ? (
                          <div className="flex flex-col gap-2">
                            <div>
                              <label className="text-xs text-gray-600 block mb-1">
                                Start date
                              </label>
                              <Input
                                type="date"
                                value={workflowStartDate}
                                onChange={(e) =>
                                  setWorkflowStartDate(e.target.value)
                                }
                                className="h-8 text-xs w-36"
                              />
                            </div>
                            <Button
                              size="sm"
                              className="bg-[#047857] hover:bg-[#065f46] text-white h-8 text-xs"
                              disabled={
                                !workflowStartDate ||
                                applyingWorkflow === template.id
                              }
                              onClick={() => handleApplyWorkflow(template.id)}
                            >
                              {applyingWorkflow === template.id ? (
                                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                              ) : null}
                              Apply
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => handleApplyWorkflow(template.id)}
                          >
                            Select
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-5 py-3 border-t flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowApplyWorkflow(false);
                  setSelectedTemplateId(null);
                  setWorkflowStartDate('');
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========== Filter Tabs ========== */}
      <div className="flex items-center gap-1 px-4 py-2 border-b overflow-x-auto">
        {[
          { key: 'all', label: 'All' },
          { key: 'todo', label: 'To Do' },
          { key: 'in-progress', label: 'In Progress' },
          { key: 'completed', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap',
              filter === tab.key
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            {tab.label}
            <span
              className={cn(
                'ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-xs px-1',
                filter === tab.key
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-500'
              )}
            >
              {filterCounts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* ========== Add Task Form ========== */}
      {showAddTask && (
        <div className="px-4 py-4 border-b bg-gray-50">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                value={newTask.title}
                onChange={(e) =>
                  setNewTask((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter task title"
                className="h-9 text-sm"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newTask.category}
                  onChange={(e) =>
                    setNewTask((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select category</option>
                  {TASK_CATEGORIES?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask((prev) => ({
                      ...prev,
                      priority: e.target.value,
                    }))
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {TASK_PRIORITIES?.map((pri) => (
                    <option key={pri.id} value={pri.id}>
                      {pri.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <Input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) =>
                    setNewTask((prev) => ({
                      ...prev,
                      due_date: e.target.value,
                    }))
                  }
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <Input
                  value={newTask.assigned_to}
                  onChange={(e) =>
                    setNewTask((prev) => ({
                      ...prev,
                      assigned_to: e.target.value,
                    }))
                  }
                  placeholder="Person or team"
                  className="h-9 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Optional description"
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                className="bg-[#047857] hover:bg-[#065f46] text-white"
                disabled={!newTask.title.trim() || saving}
                onClick={handleAddTask}
              >
                {saving && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                Save Task
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddTask(false);
                  setNewTask({
                    title: '',
                    category: '',
                    priority: 'medium',
                    due_date: '',
                    assigned_to: '',
                    description: '',
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========== Task List ========== */}
      <div className="divide-y divide-gray-100">
        {filteredTasks.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 opacity-40" />
            <p className="text-sm">
              No {filter !== 'all' ? filter.replace('-', ' ') + ' ' : ''}tasks
              found.
            </p>
          </div>
        ) : (
          <>
            {/* Ungrouped tasks */}
            {groupedTasks.ungrouped.length > 0 && (
              <div className="px-1 py-1">
                {groupedTasks.ungrouped.map((task) => renderTaskRow(task))}
              </div>
            )}

            {/* Milestone-grouped tasks */}
            {Object.entries(groupedTasks.milestoneGroups).map(
              ([milestoneName, milestoneTasks]) => (
                <div key={milestoneName} className="px-1 py-1">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <div className="w-1 h-4 bg-violet-400 rounded-full" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {milestoneName}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({milestoneTasks.length})
                    </span>
                  </div>
                  {milestoneTasks.map((task) => renderTaskRow(task))}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
