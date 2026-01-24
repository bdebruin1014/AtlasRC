// src/pages/projects/Schedule/GanttChart.jsx
// Gantt chart visualization with phase grouping and task bars

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Flag, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_COLORS = {
  not_started: 'bg-gray-300',
  in_progress: 'bg-blue-500',
  completed: 'bg-emerald-500',
  delayed: 'bg-amber-500',
  blocked: 'bg-red-500',
};

const STATUS_BAR_COLORS = {
  not_started: '#D1D5DB',
  in_progress: '#3B82F6',
  completed: '#10B981',
  delayed: '#F59E0B',
  blocked: '#EF4444',
};

const GanttChart = ({ schedule, tasksByPhase, tasks, onEditTask, onStatusChange }) => {
  const [expandedPhases, setExpandedPhases] = useState(new Set(tasksByPhase.map(p => p.id)));

  const togglePhase = (phaseId) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      next.has(phaseId) ? next.delete(phaseId) : next.add(phaseId);
      return next;
    });
  };

  // Calculate timeline bounds
  const { minDate, maxDate, totalDays } = useMemo(() => {
    if (!schedule || tasks.length === 0) {
      return { minDate: new Date(), maxDate: new Date(), totalDays: 1 };
    }
    const starts = tasks.map(t => new Date(t.scheduled_start)).filter(d => !isNaN(d));
    const ends = tasks.map(t => new Date(t.scheduled_end)).filter(d => !isNaN(d));
    const min = new Date(Math.min(...starts));
    const max = new Date(Math.max(...ends));
    // Add padding
    min.setDate(min.getDate() - 3);
    max.setDate(max.getDate() + 7);
    const days = Math.max(Math.round((max - min) / 86400000), 1);
    return { minDate: min, maxDate: max, totalDays: days };
  }, [schedule, tasks]);

  // Generate month headers
  const monthHeaders = useMemo(() => {
    const months = [];
    const cursor = new Date(minDate);
    cursor.setDate(1);
    while (cursor <= maxDate) {
      const monthStart = new Date(cursor);
      cursor.setMonth(cursor.getMonth() + 1);
      const monthEnd = new Date(Math.min(cursor - 1, maxDate));
      const startOffset = Math.max(0, (monthStart - minDate) / 86400000);
      const endOffset = (monthEnd - minDate) / 86400000;
      const width = ((endOffset - startOffset) / totalDays) * 100;
      months.push({
        label: monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        left: (startOffset / totalDays) * 100,
        width,
      });
    }
    return months;
  }, [minDate, maxDate, totalDays]);

  // Today marker
  const todayOffset = useMemo(() => {
    const today = new Date();
    const offset = (today - minDate) / 86400000;
    return (offset / totalDays) * 100;
  }, [minDate, totalDays]);

  const getBarStyle = (task) => {
    const start = new Date(task.scheduled_start);
    const end = new Date(task.scheduled_end);
    const left = ((start - minDate) / 86400000 / totalDays) * 100;
    const width = Math.max(((end - start) / 86400000 / totalDays) * 100, 0.5);
    return { left: `${left}%`, width: `${width}%` };
  };

  if (!schedule || tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
        No schedule data available. Create tasks to see the Gantt chart.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Month Headers */}
      <div className="border-b border-gray-200 bg-gray-50 relative h-8">
        {monthHeaders.map((m, i) => (
          <div
            key={i}
            className="absolute top-0 h-full flex items-center px-2 text-xs font-medium text-gray-500 border-l border-gray-200"
            style={{ left: `calc(250px + ${m.left}% * (100% - 250px) / 100)`, width: `calc(${m.width}% * (100% - 250px) / 100)` }}
          >
            {m.label}
          </div>
        ))}
      </div>

      {/* Tasks */}
      <div className="overflow-y-auto max-h-[600px]">
        {tasksByPhase.map(phase => (
          <div key={phase.id}>
            {/* Phase Header */}
            <div
              className="flex items-center h-9 bg-gray-50/80 border-b border-gray-100 cursor-pointer hover:bg-gray-100"
              onClick={() => togglePhase(phase.id)}
            >
              <div className="w-[250px] shrink-0 px-3 flex items-center gap-2">
                {expandedPhases.has(phase.id) ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                <span className="text-sm font-semibold text-gray-700 truncate">{phase.name}</span>
                <span className="text-[10px] text-gray-400 ml-1">({phase.tasks.length})</span>
              </div>
              <div className="flex-1 relative h-full" />
            </div>

            {/* Tasks in Phase */}
            {expandedPhases.has(phase.id) && phase.tasks.map(task => {
              const barStyle = getBarStyle(task);
              return (
                <div
                  key={task.id}
                  className="flex items-center h-8 border-b border-gray-50 hover:bg-blue-50/30 group"
                  onClick={() => onEditTask(task)}
                >
                  {/* Task Name */}
                  <div className="w-[250px] shrink-0 px-3 pl-8 flex items-center gap-2 cursor-pointer">
                    {task.is_milestone && <Flag className="w-3 h-3 text-amber-500 shrink-0" />}
                    <span className={cn(
                      "text-xs truncate",
                      task.status === 'completed' ? "text-gray-400 line-through" : "text-gray-700"
                    )}>
                      {task.name}
                    </span>
                  </div>

                  {/* Gantt Bar */}
                  <div className="flex-1 relative h-full px-1">
                    {task.is_milestone ? (
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rotate-45 bg-amber-500 border border-amber-600"
                        style={{ left: barStyle.left }}
                      />
                    ) : (
                      <div
                        className={cn("absolute top-1.5 h-5 rounded-sm cursor-pointer transition-opacity group-hover:opacity-90")}
                        style={{ ...barStyle, backgroundColor: STATUS_BAR_COLORS[task.status] || STATUS_BAR_COLORS.not_started }}
                        title={`${task.name}: ${task.scheduled_start} → ${task.scheduled_end} (${task.duration_days}d)`}
                      >
                        {/* Progress within bar */}
                        {task.percent_complete > 0 && task.percent_complete < 100 && (
                          <div
                            className="absolute top-0 left-0 h-full rounded-sm opacity-40 bg-white"
                            style={{ width: `${100 - task.percent_complete}%`, right: 0, left: 'auto' }}
                          />
                        )}
                        {/* Duration label on bar */}
                        {parseFloat(barStyle.width) > 3 && (
                          <span className="absolute inset-0 flex items-center justify-center text-[9px] text-white font-medium">
                            {task.duration_days}d
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Today Line (overlay) */}
      {todayOffset > 0 && todayOffset < 100 && (
        <div
          className="absolute top-0 bottom-0 w-px bg-red-400 pointer-events-none z-10"
          style={{ left: `calc(250px + ${todayOffset}% * (100% - 250px) / 100)` }}
        />
      )}

      {/* Legend */}
      <div className="border-t border-gray-200 px-4 py-2 flex items-center gap-4 bg-gray-50">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5 text-[10px] text-gray-500">
            <div className={cn("w-3 h-2 rounded-sm", color)} />
            {status.replace(/_/g, ' ')}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 ml-2">
          <div className="w-2 h-2 rotate-45 bg-amber-500" />
          milestone
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
