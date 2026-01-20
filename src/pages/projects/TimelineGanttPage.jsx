import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Download, Filter, ZoomIn, ZoomOut, Settings, CheckCircle, Clock, AlertTriangle, Play, Pause, ChevronDown, ChevronUp, Milestone, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TimelineGanttPage = ({ projectId }) => {
  const [zoomLevel, setZoomLevel] = useState('month'); // 'week', 'month', 'quarter'
  const [currentDate, setCurrentDate] = useState(new Date('2024-12-01'));
  const [expandedPhases, setExpandedPhases] = useState(['preconstruction', 'construction', 'sales']);
  const [showMilestones, setShowMilestones] = useState(true);

  const phases = [
    {
      id: 'preconstruction',
      name: 'Pre-Construction',
      startDate: '2024-01-15',
      endDate: '2024-03-15',
      progress: 100,
      status: 'complete',
      tasks: [
        { id: 'task-1', name: 'Land Acquisition', startDate: '2024-01-15', endDate: '2024-01-15', progress: 100, status: 'complete', assignee: 'Bryan VanRock' },
        { id: 'task-2', name: 'Due Diligence', startDate: '2024-01-16', endDate: '2024-02-15', progress: 100, status: 'complete', assignee: 'Bryan VanRock' },
        { id: 'task-3', name: 'Architecture & Design', startDate: '2024-01-20', endDate: '2024-02-28', progress: 100, status: 'complete', assignee: 'Robert Chen' },
        { id: 'task-4', name: 'Engineering', startDate: '2024-02-01', endDate: '2024-03-01', progress: 100, status: 'complete', assignee: 'Civil Engineering Co' },
        { id: 'task-5', name: 'Permitting', startDate: '2024-02-15', endDate: '2024-03-15', progress: 100, status: 'complete', assignee: 'Bryan VanRock' },
      ],
    },
    {
      id: 'sitework',
      name: 'Site Work',
      startDate: '2024-03-15',
      endDate: '2024-05-15',
      progress: 100,
      status: 'complete',
      tasks: [
        { id: 'task-6', name: 'Clearing & Grading', startDate: '2024-03-15', endDate: '2024-04-01', progress: 100, status: 'complete', assignee: 'Johnson Construction' },
        { id: 'task-7', name: 'Utilities Rough-in', startDate: '2024-04-01', endDate: '2024-04-30', progress: 100, status: 'complete', assignee: 'Johnson Construction' },
        { id: 'task-8', name: 'Storm Water System', startDate: '2024-04-15', endDate: '2024-05-15', progress: 100, status: 'complete', assignee: 'Johnson Construction' },
      ],
    },
    {
      id: 'construction',
      name: 'Construction',
      startDate: '2024-05-01',
      endDate: '2025-06-30',
      progress: 68,
      status: 'in-progress',
      tasks: [
        { id: 'task-9', name: 'Foundation - All Units', startDate: '2024-05-01', endDate: '2024-07-15', progress: 100, status: 'complete', assignee: 'Foundation Masters' },
        { id: 'task-10', name: 'Framing - Units 1-6', startDate: '2024-07-01', endDate: '2024-09-30', progress: 100, status: 'complete', assignee: 'Johnson Construction' },
        { id: 'task-11', name: 'Framing - Units 7-12', startDate: '2024-09-01', endDate: '2024-12-15', progress: 85, status: 'in-progress', assignee: 'Johnson Construction' },
        { id: 'task-12', name: 'Roofing', startDate: '2024-08-15', endDate: '2024-11-30', progress: 100, status: 'complete', assignee: 'Top Roofing' },
        { id: 'task-13', name: 'MEP Rough-in', startDate: '2024-09-01', endDate: '2025-01-31', progress: 75, status: 'in-progress', assignee: 'Various' },
        { id: 'task-14', name: 'Insulation & Drywall', startDate: '2024-10-15', endDate: '2025-02-28', progress: 60, status: 'in-progress', assignee: 'Johnson Construction' },
        { id: 'task-15', name: 'Interior Finishes', startDate: '2024-11-15', endDate: '2025-04-30', progress: 40, status: 'in-progress', assignee: 'Various' },
        { id: 'task-16', name: 'Exterior Finishes', startDate: '2024-12-01', endDate: '2025-03-31', progress: 25, status: 'in-progress', assignee: 'Johnson Construction' },
        { id: 'task-17', name: 'Landscaping', startDate: '2025-03-01', endDate: '2025-05-31', progress: 0, status: 'not-started', assignee: 'Green Landscaping' },
        { id: 'task-18', name: 'Final Punch & Cleanup', startDate: '2025-05-01', endDate: '2025-06-30', progress: 0, status: 'not-started', assignee: 'Johnson Construction' },
      ],
    },
    {
      id: 'sales',
      name: 'Sales & Disposition',
      startDate: '2024-09-01',
      endDate: '2025-09-30',
      progress: 15,
      status: 'in-progress',
      tasks: [
        { id: 'task-19', name: 'Pre-Sales Marketing', startDate: '2024-09-01', endDate: '2024-11-30', progress: 100, status: 'complete', assignee: 'Sarah Agent' },
        { id: 'task-20', name: 'Model Home Setup', startDate: '2024-11-15', endDate: '2024-12-15', progress: 100, status: 'complete', assignee: 'Sarah Agent' },
        { id: 'task-21', name: 'Unit 1 Sale', startDate: '2024-10-01', endDate: '2024-12-20', progress: 100, status: 'complete', assignee: 'Sarah Agent' },
        { id: 'task-22', name: 'Unit 2 Sale', startDate: '2024-11-01', endDate: '2025-01-25', progress: 75, status: 'in-progress', assignee: 'Sarah Agent' },
        { id: 'task-23', name: 'Units 3-12 Sales', startDate: '2025-01-01', endDate: '2025-09-30', progress: 0, status: 'not-started', assignee: 'Sarah Agent' },
      ],
    },
  ];

  const milestones = [
    { id: 'm1', name: 'Land Acquisition', date: '2024-01-15', status: 'complete' },
    { id: 'm2', name: 'Permits Approved', date: '2024-03-15', status: 'complete' },
    { id: 'm3', name: 'Construction Start', date: '2024-03-15', status: 'complete' },
    { id: 'm4', name: 'Foundation Complete', date: '2024-07-15', status: 'complete' },
    { id: 'm5', name: 'Framing Complete (50%)', date: '2024-09-30', status: 'complete' },
    { id: 'm6', name: 'Roofing Complete', date: '2024-11-30', status: 'complete' },
    { id: 'm7', name: 'First Unit Closing', date: '2024-12-20', status: 'complete' },
    { id: 'm8', name: 'Framing Complete (100%)', date: '2024-12-31', status: 'in-progress' },
    { id: 'm9', name: 'MEP Complete', date: '2025-01-31', status: 'upcoming' },
    { id: 'm10', name: 'Construction Complete', date: '2025-06-30', status: 'upcoming' },
    { id: 'm11', name: 'Project Sellout', date: '2025-09-30', status: 'upcoming' },
  ];

  const togglePhase = (phaseId) => {
    setExpandedPhases(prev =>
      prev.includes(phaseId) ? prev.filter(p => p !== phaseId) : [...prev, phaseId]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'delayed': return 'bg-red-500';
      case 'not-started': return 'bg-gray-300';
      default: return 'bg-gray-300';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'complete': return 'bg-green-100';
      case 'in-progress': return 'bg-blue-100';
      case 'delayed': return 'bg-red-100';
      case 'not-started': return 'bg-gray-100';
      default: return 'bg-gray-100';
    }
  };

  // Generate months for the timeline header
  const generateMonths = () => {
    const months = [];
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2025-12-31');
    
    let current = new Date(startDate);
    while (current <= endDate) {
      months.push({
        date: new Date(current),
        label: current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      });
      current.setMonth(current.getMonth() + 1);
    }
    return months;
  };

  const months = generateMonths();

  // Calculate bar position and width
  const getBarStyle = (startDate, endDate) => {
    const timelineStart = new Date('2024-01-01');
    const timelineEnd = new Date('2025-12-31');
    const totalDays = (timelineEnd - timelineStart) / (1000 * 60 * 60 * 24);
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startOffset = Math.max(0, (start - timelineStart) / (1000 * 60 * 60 * 24));
    const duration = (end - start) / (1000 * 60 * 60 * 24);
    
    const leftPercent = (startOffset / totalDays) * 100;
    const widthPercent = (duration / totalDays) * 100;
    
    return {
      left: `${leftPercent}%`,
      width: `${Math.max(widthPercent, 0.5)}%`,
    };
  };

  // Calculate milestone position
  const getMilestonePosition = (date) => {
    const timelineStart = new Date('2024-01-01');
    const timelineEnd = new Date('2025-12-31');
    const totalDays = (timelineEnd - timelineStart) / (1000 * 60 * 60 * 24);
    
    const milestoneDate = new Date(date);
    const offset = (milestoneDate - timelineStart) / (1000 * 60 * 60 * 24);
    
    return `${(offset / totalDays) * 100}%`;
  };

  // Today line position
  const getTodayPosition = () => {
    const timelineStart = new Date('2024-01-01');
    const timelineEnd = new Date('2025-12-31');
    const totalDays = (timelineEnd - timelineStart) / (1000 * 60 * 60 * 24);
    
    const today = new Date('2024-12-28'); // Current date from context
    const offset = (today - timelineStart) / (1000 * 60 * 60 * 24);
    
    return `${(offset / totalDays) * 100}%`;
  };

  const overallProgress = Math.round(phases.reduce((sum, p) => sum + p.progress, 0) / phases.length);

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Project Timeline</h1>
          <p className="text-sm text-gray-500">Gantt chart view • {overallProgress}% overall progress</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowMilestones(!showMilestones)}>
            <Flag className={cn("w-4 h-4 mr-1", showMilestones && "text-[#047857]")} />
            Milestones
          </Button>
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button variant="outline" size="sm"><Settings className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Project Duration</p>
          <p className="text-xl font-semibold">21 months</p>
          <p className="text-xs text-gray-400">Jan 2024 - Sep 2025</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-xs text-gray-500">Phases Complete</p>
          <p className="text-xl font-semibold text-green-600">2 / 4</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-xs text-gray-500">Tasks In Progress</p>
          <p className="text-xl font-semibold text-blue-600">8</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Milestones Hit</p>
          <p className="text-xl font-semibold">7 / 11</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Est. Completion</p>
          <p className="text-xl font-semibold">Sep 2025</p>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {/* Timeline Header */}
        <div className="flex border-b">
          <div className="w-72 flex-shrink-0 p-3 bg-gray-50 border-r font-medium text-sm">
            Task / Phase
          </div>
          <div className="flex-1 overflow-x-auto">
            <div className="flex min-w-[1200px]">
              {months.map((month, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "flex-1 text-center text-xs py-2 border-r border-gray-100",
                    month.date.getFullYear() === 2024 ? "bg-gray-50" : "bg-blue-50/30"
                  )}
                >
                  {month.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Milestone Row */}
        {showMilestones && (
          <div className="flex border-b bg-amber-50/50">
            <div className="w-72 flex-shrink-0 p-2 border-r flex items-center gap-2">
              <Flag className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium">Milestones</span>
            </div>
            <div className="flex-1 relative h-8 overflow-x-auto">
              <div className="min-w-[1200px] h-full relative">
                {milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group cursor-pointer z-10"
                    style={{ left: getMilestonePosition(milestone.date) }}
                  >
                    <div className={cn(
                      "w-4 h-4 rotate-45 border-2",
                      milestone.status === 'complete' ? "bg-green-500 border-green-600" :
                      milestone.status === 'in-progress' ? "bg-blue-500 border-blue-600" :
                      "bg-gray-300 border-gray-400"
                    )}></div>
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      {milestone.name}<br />
                      <span className="text-gray-400">{milestone.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Phases and Tasks */}
        {phases.map((phase) => {
          const isExpanded = expandedPhases.includes(phase.id);
          
          return (
            <React.Fragment key={phase.id}>
              {/* Phase Row */}
              <div className="flex border-b hover:bg-gray-50 cursor-pointer" onClick={() => togglePhase(phase.id)}>
                <div className="w-72 flex-shrink-0 p-3 border-r flex items-center gap-2">
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4 rotate-180" />}
                  <span className={cn("w-2 h-2 rounded-full", getStatusColor(phase.status))}></span>
                  <span className="font-medium text-sm">{phase.name}</span>
                  <span className="text-xs text-gray-500">({phase.progress}%)</span>
                </div>
                <div className="flex-1 relative h-10 overflow-x-auto">
                  <div className="min-w-[1200px] h-full relative">
                    {/* Today line */}
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                      style={{ left: getTodayPosition() }}
                    >
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[10px] text-red-500 font-medium">Today</div>
                    </div>
                    
                    {/* Phase bar */}
                    <div 
                      className={cn("absolute top-2 h-6 rounded", getStatusBg(phase.status))}
                      style={getBarStyle(phase.startDate, phase.endDate)}
                    >
                      <div 
                        className={cn("h-full rounded", getStatusColor(phase.status))}
                        style={{ width: `${phase.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Task Rows */}
              {isExpanded && phase.tasks.map((task) => (
                <div key={task.id} className="flex border-b bg-gray-50/50 hover:bg-gray-100/50">
                  <div className="w-72 flex-shrink-0 p-2 pl-10 border-r">
                    <div className="flex items-center gap-2">
                      {task.status === 'complete' ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      ) : task.status === 'in-progress' ? (
                        <Play className="w-3 h-3 text-blue-500" />
                      ) : (
                        <Clock className="w-3 h-3 text-gray-400" />
                      )}
                      <span className="text-sm truncate">{task.name}</span>
                    </div>
                    <p className="text-xs text-gray-400 pl-5 truncate">{task.assignee}</p>
                  </div>
                  <div className="flex-1 relative h-12 overflow-x-auto">
                    <div className="min-w-[1200px] h-full relative">
                      {/* Task bar */}
                      <div 
                        className={cn("absolute top-3 h-5 rounded-sm", getStatusBg(task.status))}
                        style={getBarStyle(task.startDate, task.endDate)}
                      >
                        <div 
                          className={cn("h-full rounded-sm", getStatusColor(task.status))}
                          style={{ width: `${task.progress}%` }}
                        ></div>
                        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] font-medium text-gray-600">
                          {task.progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span>Complete</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500"></div>
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gray-300"></div>
          <span>Not Started</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span>Delayed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rotate-45 border-2 border-amber-500 bg-amber-100"></div>
          <span>Milestone</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-0.5 h-4 bg-red-500"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

export default TimelineGanttPage;
