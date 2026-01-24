// src/pages/projects/Schedule/TaskList.jsx
// Table/list view of schedule tasks grouped by phase

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Edit2, Trash2, Flag, Link2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TASK_STATUSES, DEPENDENCY_TYPES } from '@/services/scheduleService';

const STATUS_BADGE_STYLES = {
  not_started: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  delayed: 'bg-amber-100 text-amber-700',
  blocked: 'bg-red-100 text-red-700',
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const TaskList = ({ tasksByPhase, tasks, onEditTask, onDeleteTask, onStatusChange }) => {
  const [expandedPhases, setExpandedPhases] = useState(new Set(tasksByPhase.map(p => p.id)));

  const togglePhase = (phaseId) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      next.has(phaseId) ? next.delete(phaseId) : next.add(phaseId);
      return next;
    });
  };

  const getPredecessorName = (predecessorId) => {
    if (!predecessorId) return null;
    const pred = tasks.find(t => t.id === predecessorId);
    return pred?.name || null;
  };

  const handleStatusClick = (task) => {
    const statusOrder = ['not_started', 'in_progress', 'completed'];
    const currentIdx = statusOrder.indexOf(task.status);
    const nextIdx = (currentIdx + 1) % statusOrder.length;
    const newStatus = statusOrder[nextIdx];
    const pct = newStatus === 'completed' ? 100 : newStatus === 'in_progress' ? 50 : 0;
    onStatusChange(task.id, newStatus, pct);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
            <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase w-24">Status</th>
            <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase w-16">Days</th>
            <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase w-24">Start</th>
            <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase w-24">End</th>
            <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase w-32">Predecessor</th>
            <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase w-28">Assigned</th>
            <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase w-16">%</th>
            <th className="px-3 py-2.5 w-16" />
          </tr>
        </thead>
        <tbody>
          {tasksByPhase.map(phase => {
            const isExpanded = expandedPhases.has(phase.id);
            const completedCount = phase.tasks.filter(t => t.status === 'completed').length;
            return (
              <React.Fragment key={phase.id}>
                {/* Phase Row */}
                <tr
                  className="bg-gray-50/70 cursor-pointer hover:bg-gray-100 border-t border-gray-200"
                  onClick={() => togglePhase(phase.id)}
                >
                  <td className="px-4 py-2.5" colSpan={9}>
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                      <span className="font-semibold text-gray-800">{phase.name}</span>
                      <span className="text-xs text-gray-400">
                        ({completedCount}/{phase.tasks.length} complete)
                      </span>
                    </div>
                  </td>
                </tr>

                {/* Task Rows */}
                {isExpanded && phase.tasks.map(task => {
                  const predecessorName = getPredecessorName(task.predecessor_id);
                  return (
                    <tr key={task.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-2 pl-10">
                        <div className="flex items-center gap-2">
                          {task.is_milestone && <Flag className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                          {task.is_critical_path && <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" title="Critical Path" />}
                          <span className={cn("text-gray-700", task.status === 'completed' && "line-through text-gray-400")}>
                            {task.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button onClick={(e) => { e.stopPropagation(); handleStatusClick(task); }}>
                          <Badge className={cn("text-[10px] cursor-pointer", STATUS_BADGE_STYLES[task.status])}>
                            {task.status?.replace(/_/g, ' ')}
                          </Badge>
                        </button>
                      </td>
                      <td className="px-3 py-2 text-center text-gray-600 font-mono text-xs">{task.duration_days}</td>
                      <td className="px-3 py-2 text-center text-gray-600 text-xs">{formatDate(task.scheduled_start)}</td>
                      <td className="px-3 py-2 text-center text-gray-600 text-xs">{formatDate(task.scheduled_end)}</td>
                      <td className="px-3 py-2 text-xs">
                        {predecessorName && (
                          <div className="flex items-center gap-1 text-gray-500">
                            <Link2 className="w-3 h-3" />
                            <span className="truncate max-w-[100px]" title={predecessorName}>{predecessorName}</span>
                            {task.predecessor_type && (
                              <span className="text-[9px] font-mono text-gray-400">
                                {task.predecessor_type}{task.lag_days > 0 ? `+${task.lag_days}` : task.lag_days < 0 ? task.lag_days : ''}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600 truncate">{task.assigned_to_name || '—'}</td>
                      <td className="px-3 py-2 text-center">
                        <div className="w-8 h-1.5 bg-gray-100 rounded-full overflow-hidden mx-auto">
                          <div className="h-full bg-[#2F855A] rounded-full" style={{ width: `${task.percent_complete}%` }} />
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1 justify-center">
                          <button onClick={() => onEditTask(task)} className="p-1 text-gray-400 hover:text-blue-600">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => onDeleteTask(task.id)} className="p-1 text-gray-400 hover:text-red-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TaskList;
