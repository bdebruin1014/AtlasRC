// src/pages/projects/Schedule/SchedulePage.jsx
// Main Schedule Module with Gantt, List, and Milestone views

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, List, Flag, Plus, RefreshCw, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useScheduleData } from '@/hooks/useSchedule';
import { useProject } from '@/hooks/useProjects';
import { createScheduleFromTemplate } from '@/services/scheduleService';
import GanttChart from './GanttChart';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import MilestoneView from './MilestoneView';

const VIEW_MODES = [
  { id: 'gantt', label: 'Gantt', icon: Calendar },
  { id: 'list', label: 'List', icon: List },
  { id: 'milestones', label: 'Milestones', icon: Flag },
];

const SchedulePage = ({ projectId: propProjectId }) => {
  const { projectId: paramProjectId } = useParams();
  const projectId = propProjectId || paramProjectId || 'demo-project-1';

  const [viewMode, setViewMode] = useState('gantt');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [seeding, setSeeding] = useState(false);

  const { project } = useProject(projectId);

  const {
    schedule,
    phases,
    tasks,
    tasksByPhase,
    milestones,
    progress,
    loading,
    addTask,
    editTask,
    removeTask,
    recalculate,
    refetchAll,
  } = useScheduleData(projectId);

  // Auto-seed a schedule from the default template for the project type when none exists
  useEffect(() => {
    if (loading || seeding || schedule || !project) return;

    (async () => {
      try {
        setSeeding(true);
        await createScheduleFromTemplate(projectId, project.project_type);
        await refetchAll();
      } finally {
        setSeeding(false);
      }
    })();
  }, [loading, seeding, schedule, project, projectId, refetchAll]);

  const handleAddTask = () => {
    setEditingTask(null);
    setShowTaskForm(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleSaveTask = async (taskData) => {
    if (editingTask) {
      await editTask(editingTask.id, taskData);
    } else {
      await addTask(taskData);
    }
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task? This may affect dependent tasks.')) return;
    await removeTask(taskId);
  };

  const handleStatusChange = async (taskId, newStatus, percentComplete) => {
    await editTask(taskId, { status: newStatus, percent_complete: percentComplete });
  };

  if (loading || seeding) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F855A]" />
      </div>
    );
  }

  const formatDateRange = () => {
    if (!schedule) return '';
    const start = new Date(schedule.project_start_date);
    const end = new Date(schedule.projected_end_date);
    const days = Math.round((end - start) / 86400000);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} → ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} (${days} days)`;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Project Schedule</h2>
          {schedule && (
            <p className="text-sm text-gray-500 mt-1">{formatDateRange()}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Progress Indicator */}
          <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#2F855A] rounded-full" style={{ width: `${progress.overall}%` }} />
            </div>
            <span className="text-xs font-medium text-gray-600">{progress.overall.toFixed(0)}%</span>
          </div>

          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            {VIEW_MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-r last:border-r-0 border-gray-300",
                  viewMode === mode.id
                    ? "bg-[#2F855A] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                )}
              >
                <mode.icon className="w-3.5 h-3.5" />
                {mode.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <Button variant="outline" size="sm" onClick={recalculate} title="Recalculate dates">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button size="sm" className="bg-[#2F855A] hover:bg-[#276749]" onClick={handleAddTask}>
            <Plus className="w-4 h-4 mr-1" /> Add Task
          </Button>
        </div>
      </div>

      {/* Schedule Status Bar */}
      {schedule && (
        <div className="flex items-center gap-4 mb-4 text-xs">
          <Badge variant="outline" className={cn(
            schedule.status === 'active' ? 'border-green-300 text-green-700 bg-green-50' :
            schedule.status === 'on_hold' ? 'border-amber-300 text-amber-700 bg-amber-50' :
            'border-gray-300 text-gray-600'
          )}>
            {schedule.status?.charAt(0).toUpperCase() + schedule.status?.slice(1)}
          </Badge>
          <span className="text-gray-400">
            {tasks.length} tasks &middot; {milestones.length} milestones &middot;{' '}
            {tasks.filter(t => t.status === 'completed').length} completed
          </span>
        </div>
      )}

      {/* View Content */}
      {viewMode === 'gantt' && (
        <GanttChart
          schedule={schedule}
          tasksByPhase={tasksByPhase}
          tasks={tasks}
          onEditTask={handleEditTask}
          onStatusChange={handleStatusChange}
        />
      )}

      {viewMode === 'list' && (
        <TaskList
          tasksByPhase={tasksByPhase}
          tasks={tasks}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onStatusChange={handleStatusChange}
        />
      )}

      {viewMode === 'milestones' && (
        <MilestoneView
          milestones={milestones}
          schedule={schedule}
        />
      )}

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          open={showTaskForm}
          task={editingTask}
          phases={phases}
          tasks={tasks}
          onSave={handleSaveTask}
          onClose={() => { setShowTaskForm(false); setEditingTask(null); }}
        />
      )}
    </div>
  );
};

export default SchedulePage;
