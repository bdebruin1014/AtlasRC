// src/components/GanttChart.jsx
// Interactive Gantt chart for project timeline visualization

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Calendar,
  CheckCircle, Clock, AlertTriangle, Milestone, Flag,
  ChevronDown, ChevronUp, Maximize2, Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================
// CONSTANTS
// ============================================

const ZOOM_LEVELS = {
  day: { label: 'Day', days: 1, width: 40 },
  week: { label: 'Week', days: 7, width: 100 },
  month: { label: 'Month', days: 30, width: 150 },
  quarter: { label: 'Quarter', days: 90, width: 200 },
};

const TASK_COLORS = {
  default: 'bg-blue-500',
  on_track: 'bg-emerald-500',
  at_risk: 'bg-amber-500',
  delayed: 'bg-red-500',
  completed: 'bg-gray-400',
  milestone: 'bg-purple-600',
};

// ============================================
// DEMO DATA
// ============================================

const DEMO_TASKS = [
  {
    id: 'phase-1',
    name: 'Pre-Construction',
    type: 'phase',
    start_date: '2025-01-01',
    end_date: '2025-02-15',
    progress: 100,
    status: 'completed',
    children: [
      { id: 't-1', name: 'Site Survey', start_date: '2025-01-01', end_date: '2025-01-10', progress: 100, status: 'completed' },
      { id: 't-2', name: 'Permit Applications', start_date: '2025-01-08', end_date: '2025-01-31', progress: 100, status: 'completed' },
      { id: 't-3', name: 'Design Finalization', start_date: '2025-01-15', end_date: '2025-02-10', progress: 100, status: 'completed' },
      { id: 'm-1', name: 'Design Approval', type: 'milestone', date: '2025-02-15', status: 'completed' },
    ],
  },
  {
    id: 'phase-2',
    name: 'Site Work',
    type: 'phase',
    start_date: '2025-02-15',
    end_date: '2025-04-15',
    progress: 75,
    status: 'on_track',
    children: [
      { id: 't-4', name: 'Clearing & Grading', start_date: '2025-02-15', end_date: '2025-03-01', progress: 100, status: 'completed' },
      { id: 't-5', name: 'Utility Installation', start_date: '2025-02-25', end_date: '2025-03-20', progress: 100, status: 'completed' },
      { id: 't-6', name: 'Foundation Prep', start_date: '2025-03-15', end_date: '2025-04-05', progress: 60, status: 'on_track' },
      { id: 'm-2', name: 'Site Ready', type: 'milestone', date: '2025-04-15', status: 'pending' },
    ],
  },
  {
    id: 'phase-3',
    name: 'Foundation',
    type: 'phase',
    start_date: '2025-04-01',
    end_date: '2025-05-30',
    progress: 25,
    status: 'on_track',
    children: [
      { id: 't-7', name: 'Footings', start_date: '2025-04-01', end_date: '2025-04-20', progress: 80, status: 'on_track' },
      { id: 't-8', name: 'Foundation Walls', start_date: '2025-04-15', end_date: '2025-05-10', progress: 20, status: 'on_track' },
      { id: 't-9', name: 'Slab Pour', start_date: '2025-05-05', end_date: '2025-05-20', progress: 0, status: 'pending' },
      { id: 'm-3', name: 'Foundation Complete', type: 'milestone', date: '2025-05-30', status: 'pending' },
    ],
  },
  {
    id: 'phase-4',
    name: 'Framing',
    type: 'phase',
    start_date: '2025-05-25',
    end_date: '2025-08-15',
    progress: 0,
    status: 'pending',
    children: [
      { id: 't-10', name: 'First Floor Framing', start_date: '2025-05-25', end_date: '2025-06-20', progress: 0, status: 'pending' },
      { id: 't-11', name: 'Second Floor Framing', start_date: '2025-06-15', end_date: '2025-07-15', progress: 0, status: 'pending' },
      { id: 't-12', name: 'Roof Framing', start_date: '2025-07-10', end_date: '2025-08-05', progress: 0, status: 'pending' },
      { id: 'm-4', name: 'Dry-In', type: 'milestone', date: '2025-08-15', status: 'pending' },
    ],
  },
  {
    id: 'phase-5',
    name: 'MEP Rough-In',
    type: 'phase',
    start_date: '2025-08-01',
    end_date: '2025-10-15',
    progress: 0,
    status: 'pending',
    children: [
      { id: 't-13', name: 'Electrical Rough', start_date: '2025-08-01', end_date: '2025-09-01', progress: 0, status: 'pending' },
      { id: 't-14', name: 'Plumbing Rough', start_date: '2025-08-10', end_date: '2025-09-15', progress: 0, status: 'pending' },
      { id: 't-15', name: 'HVAC Rough', start_date: '2025-08-20', end_date: '2025-10-01', progress: 0, status: 'pending' },
      { id: 'm-5', name: 'Rough Inspections', type: 'milestone', date: '2025-10-15', status: 'pending' },
    ],
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

const parseDate = (dateStr) => new Date(dateStr);

const formatDate = (date) => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getDaysBetween = (start, end) => {
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const getMonthsInRange = (start, end) => {
  const months = [];
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  while (current <= end) {
    months.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
  }
  return months;
};

const getWeeksInRange = (start, end) => {
  const weeks = [];
  const current = new Date(start);
  current.setDate(current.getDate() - current.getDay()); // Start of week
  while (current <= end) {
    weeks.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }
  return weeks;
};

// ============================================
// SUB-COMPONENTS
// ============================================

function TimelineHeader({ startDate, endDate, zoom, scrollLeft, containerWidth }) {
  const zoomConfig = ZOOM_LEVELS[zoom];
  const totalDays = getDaysBetween(startDate, endDate);

  // Generate header based on zoom level
  const renderMonthHeaders = () => {
    const months = getMonthsInRange(startDate, endDate);
    return months.map((month, idx) => {
      const monthStart = Math.max(0, getDaysBetween(startDate, month));
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      const daysInMonth = getDaysBetween(month, monthEnd) + 1;
      const width = (daysInMonth / totalDays) * (totalDays * zoomConfig.width / zoomConfig.days);

      return (
        <div
          key={idx}
          className="flex-shrink-0 border-r border-gray-200 text-center py-1 text-sm font-medium text-gray-700"
          style={{ width: `${width}px` }}
        >
          {month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        </div>
      );
    });
  };

  const renderWeekHeaders = () => {
    const weeks = getWeeksInRange(startDate, endDate);
    return weeks.map((week, idx) => {
      const width = zoomConfig.width;
      return (
        <div
          key={idx}
          className="flex-shrink-0 border-r border-gray-200 text-center py-1 text-xs text-gray-600"
          style={{ width: `${width}px` }}
        >
          {formatDate(week)}
        </div>
      );
    });
  };

  return (
    <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
      <div className="flex">
        {zoom === 'day' || zoom === 'week' ? renderWeekHeaders() : renderMonthHeaders()}
      </div>
    </div>
  );
}

function TaskRow({ task, level, startDate, endDate, zoom, isExpanded, onToggle, onTaskClick }) {
  const zoomConfig = ZOOM_LEVELS[zoom];
  const totalDays = getDaysBetween(startDate, endDate);
  const totalWidth = (totalDays * zoomConfig.width) / zoomConfig.days;

  const isMilestone = task.type === 'milestone';
  const isPhase = task.type === 'phase';
  const hasChildren = task.children && task.children.length > 0;

  // Calculate task position and width
  const taskStart = isMilestone ? parseDate(task.date) : parseDate(task.start_date);
  const taskEnd = isMilestone ? parseDate(task.date) : parseDate(task.end_date);
  const leftOffset = (getDaysBetween(startDate, taskStart) / totalDays) * totalWidth;
  const taskWidth = isMilestone ? 20 : Math.max(20, (getDaysBetween(taskStart, taskEnd) / totalDays) * totalWidth);

  const statusColor = TASK_COLORS[task.status] || TASK_COLORS.default;

  return (
    <div className="flex border-b border-gray-100 hover:bg-gray-50">
      {/* Task name column */}
      <div
        className="w-72 flex-shrink-0 flex items-center gap-2 px-3 py-2 border-r border-gray-200 bg-white sticky left-0 z-20"
        style={{ paddingLeft: `${12 + level * 20}px` }}
      >
        {hasChildren && (
          <button onClick={() => onToggle?.(task.id)} className="p-0.5 hover:bg-gray-100 rounded">
            {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
          </button>
        )}
        {isMilestone && <Flag className="h-4 w-4 text-purple-600 flex-shrink-0" />}
        <span
          className={cn(
            'text-sm truncate cursor-pointer hover:text-emerald-600',
            isPhase && 'font-semibold',
            task.status === 'completed' && 'text-gray-500'
          )}
          onClick={() => onTaskClick?.(task)}
        >
          {task.name}
        </span>
      </div>

      {/* Gantt bar area */}
      <div className="flex-1 relative h-10" style={{ minWidth: `${totalWidth}px` }}>
        {/* Today line */}
        {(() => {
          const today = new Date();
          if (today >= startDate && today <= endDate) {
            const todayOffset = (getDaysBetween(startDate, today) / totalDays) * totalWidth;
            return (
              <div
                className="absolute top-0 bottom-0 w-px bg-red-400 z-10"
                style={{ left: `${todayOffset}px` }}
              />
            );
          }
          return null;
        })()}

        {/* Task bar */}
        <div
          className="absolute top-1/2 -translate-y-1/2 flex items-center"
          style={{ left: `${leftOffset}px`, width: isMilestone ? 'auto' : `${taskWidth}px` }}
        >
          {isMilestone ? (
            <div className="w-4 h-4 rotate-45 bg-purple-600" />
          ) : (
            <div className="relative w-full h-6 rounded overflow-hidden cursor-pointer" onClick={() => onTaskClick?.(task)}>
              {/* Background */}
              <div className={cn('absolute inset-0', statusColor, isPhase && 'opacity-70')} />

              {/* Progress */}
              {task.progress > 0 && task.progress < 100 && (
                <div
                  className="absolute inset-y-0 left-0 bg-black/20"
                  style={{ width: `${task.progress}%` }}
                />
              )}

              {/* Label */}
              {taskWidth > 60 && (
                <div className="absolute inset-0 flex items-center px-2">
                  <span className="text-xs text-white font-medium truncate">
                    {isPhase ? task.name : `${task.progress}%`}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function GanttChart({
  tasks = DEMO_TASKS,
  onTaskClick,
  onTaskUpdate,
}) {
  const [zoom, setZoom] = useState('week');
  const [expandedPhases, setExpandedPhases] = useState(new Set(tasks.filter((t) => t.type === 'phase').map((t) => t.id)));
  const containerRef = useRef(null);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Calculate date range
  const { startDate, endDate } = useMemo(() => {
    let minDate = new Date();
    let maxDate = new Date();

    const processTask = (task) => {
      if (task.type === 'milestone') {
        const date = parseDate(task.date);
        if (date < minDate) minDate = date;
        if (date > maxDate) maxDate = date;
      } else {
        const start = parseDate(task.start_date);
        const end = parseDate(task.end_date);
        if (start < minDate) minDate = start;
        if (end > maxDate) maxDate = end;
      }
      task.children?.forEach(processTask);
    };

    tasks.forEach(processTask);

    // Add padding
    minDate = addDays(minDate, -14);
    maxDate = addDays(maxDate, 30);

    return { startDate: minDate, endDate: maxDate };
  }, [tasks]);

  // Flatten tasks based on expansion state
  const flatTasks = useMemo(() => {
    const result = [];

    const addTask = (task, level) => {
      result.push({ ...task, level });

      if (task.children && expandedPhases.has(task.id)) {
        task.children.forEach((child) => addTask(child, level + 1));
      }
    };

    tasks.forEach((task) => addTask(task, 0));
    return result;
  }, [tasks, expandedPhases]);

  const handleToggle = (taskId) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const handleScroll = (e) => {
    setScrollLeft(e.target.scrollLeft);
  };

  const scrollToToday = () => {
    const zoomConfig = ZOOM_LEVELS[zoom];
    const totalDays = getDaysBetween(startDate, endDate);
    const totalWidth = (totalDays * zoomConfig.width) / zoomConfig.days;
    const todayOffset = (getDaysBetween(startDate, new Date()) / totalDays) * totalWidth;

    if (containerRef.current) {
      containerRef.current.scrollLeft = todayOffset - containerRef.current.clientWidth / 2;
    }
  };

  const zoomConfig = ZOOM_LEVELS[zoom];
  const totalDays = getDaysBetween(startDate, endDate);
  const totalWidth = (totalDays * zoomConfig.width) / zoomConfig.days;

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">Project Timeline</h3>
          <span className="text-sm text-gray-500">
            {formatDate(startDate)} - {formatDate(endDate)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-white rounded-lg border p-1">
            {Object.entries(ZOOM_LEVELS).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setZoom(key)}
                className={cn(
                  'px-2 py-1 text-xs font-medium rounded transition-colors',
                  zoom === key ? 'bg-emerald-100 text-emerald-700' : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {value.label}
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={scrollToToday}>
            <Calendar className="h-4 w-4 mr-1" />
            Today
          </Button>

          <Button variant="outline" size="sm">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 border-b bg-gray-50 text-xs">
        <span className="text-gray-500">Status:</span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-emerald-500" /> On Track
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-amber-500" /> At Risk
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-500" /> Delayed
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gray-400" /> Completed
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rotate-45 bg-purple-600" /> Milestone
        </span>
        <span className="flex items-center gap-1 ml-4">
          <span className="w-4 h-px bg-red-400" /> Today
        </span>
      </div>

      {/* Chart area */}
      <div ref={containerRef} className="overflow-auto max-h-[600px]" onScroll={handleScroll}>
        {/* Header */}
        <div className="flex">
          <div className="w-72 flex-shrink-0 bg-gray-100 border-r border-gray-200 px-3 py-2 sticky left-0 z-30">
            <span className="text-sm font-medium text-gray-700">Task</span>
          </div>
          <div style={{ minWidth: `${totalWidth}px` }}>
            <TimelineHeader
              startDate={startDate}
              endDate={endDate}
              zoom={zoom}
              scrollLeft={scrollLeft}
              containerWidth={containerRef.current?.clientWidth || 0}
            />
          </div>
        </div>

        {/* Tasks */}
        <div>
          {flatTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              level={task.level}
              startDate={startDate}
              endDate={endDate}
              zoom={zoom}
              isExpanded={expandedPhases.has(task.id)}
              onToggle={handleToggle}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50 text-sm">
        <span className="text-gray-600">{flatTasks.length} tasks</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-emerald-600">
            <CheckCircle className="h-4 w-4" />
            {flatTasks.filter((t) => t.status === 'completed').length} completed
          </span>
          <span className="flex items-center gap-1 text-amber-600">
            <Clock className="h-4 w-4" />
            {flatTasks.filter((t) => t.status === 'on_track' || t.status === 'at_risk').length} in progress
          </span>
          <span className="flex items-center gap-1 text-gray-500">
            <AlertTriangle className="h-4 w-4" />
            {flatTasks.filter((t) => t.status === 'delayed').length} delayed
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPACT TIMELINE VIEW
// ============================================

export function CompactTimeline({ tasks = [], height = 80 }) {
  const { minDate, maxDate, totalDays } = useMemo(() => {
    let min = new Date();
    let max = new Date();

    tasks.forEach((task) => {
      if (task.type === 'milestone') {
        const date = new Date(task.date);
        if (date < min) min = date;
        if (date > max) max = date;
      } else {
        const start = new Date(task.start_date);
        const end = new Date(task.end_date);
        if (start < min) min = start;
        if (end > max) max = end;
      }
    });

    return {
      minDate: addDays(min, -7),
      maxDate: addDays(max, 14),
      totalDays: getDaysBetween(addDays(min, -7), addDays(max, 14)),
    };
  }, [tasks]);

  const today = new Date();
  const todayPosition = (getDaysBetween(minDate, today) / totalDays) * 100;

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2 text-xs text-gray-500">
        <span>{formatDate(minDate)}</span>
        <span>{formatDate(maxDate)}</span>
      </div>

      <div className="relative" style={{ height: `${height}px` }}>
        {/* Today marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10"
          style={{ left: `${todayPosition}%` }}
        />

        {/* Task bars */}
        {tasks.filter((t) => t.type !== 'milestone').map((task, idx) => {
          const start = new Date(task.start_date);
          const end = new Date(task.end_date);
          const leftPos = (getDaysBetween(minDate, start) / totalDays) * 100;
          const width = (getDaysBetween(start, end) / totalDays) * 100;

          return (
            <div
              key={task.id}
              className={cn(
                'absolute h-3 rounded-full',
                TASK_COLORS[task.status] || TASK_COLORS.default
              )}
              style={{
                left: `${leftPos}%`,
                width: `${Math.max(width, 1)}%`,
                top: `${(idx % 5) * 16 + 4}px`,
              }}
              title={task.name}
            />
          );
        })}
      </div>
    </div>
  );
}
