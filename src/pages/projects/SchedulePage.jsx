import React, { useState } from 'react';
import { Plus, Calendar, ChevronDown, ChevronRight, Clock, AlertTriangle, CheckCircle, Play, Pause, MoreHorizontal, Download, Upload, Filter, Search, Users, Edit2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const SchedulePage = ({ projectId }) => {
  const [viewMode, setViewMode] = useState('gantt'); // 'gantt', 'list', 'calendar'
  const [expandedPhases, setExpandedPhases] = useState(['sitework', 'foundation', 'framing']);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const phases = [
    {
      id: 'sitework',
      name: 'Site Work',
      startDate: '2024-01-15',
      endDate: '2024-02-28',
      progress: 100,
      status: 'complete',
      tasks: [
        { id: 'SW-001', name: 'Clearing & Grubbing', startDate: '2024-01-15', endDate: '2024-01-22', duration: 7, progress: 100, status: 'complete', assignee: 'Site Prep Inc', predecessors: [] },
        { id: 'SW-002', name: 'Rough Grading', startDate: '2024-01-23', endDate: '2024-02-05', duration: 14, progress: 100, status: 'complete', assignee: 'Site Prep Inc', predecessors: ['SW-001'] },
        { id: 'SW-003', name: 'Utility Trenching', startDate: '2024-02-06', endDate: '2024-02-19', duration: 14, progress: 100, status: 'complete', assignee: 'Underground Utils', predecessors: ['SW-002'] },
        { id: 'SW-004', name: 'Storm Drainage', startDate: '2024-02-20', endDate: '2024-02-28', duration: 9, progress: 100, status: 'complete', assignee: 'Underground Utils', predecessors: ['SW-003'] },
      ]
    },
    {
      id: 'foundation',
      name: 'Foundation',
      startDate: '2024-03-01',
      endDate: '2024-04-15',
      progress: 100,
      status: 'complete',
      tasks: [
        { id: 'FD-001', name: 'Excavation', startDate: '2024-03-01', endDate: '2024-03-08', duration: 7, progress: 100, status: 'complete', assignee: 'Foundation Pro', predecessors: ['SW-004'] },
        { id: 'FD-002', name: 'Footings', startDate: '2024-03-09', endDate: '2024-03-18', duration: 10, progress: 100, status: 'complete', assignee: 'Foundation Pro', predecessors: ['FD-001'] },
        { id: 'FD-003', name: 'Foundation Walls', startDate: '2024-03-19', endDate: '2024-04-01', duration: 14, progress: 100, status: 'complete', assignee: 'Foundation Pro', predecessors: ['FD-002'] },
        { id: 'FD-004', name: 'Waterproofing', startDate: '2024-04-02', endDate: '2024-04-08', duration: 7, progress: 100, status: 'complete', assignee: 'Waterproof LLC', predecessors: ['FD-003'] },
        { id: 'FD-005', name: 'Backfill', startDate: '2024-04-09', endDate: '2024-04-15', duration: 7, progress: 100, status: 'complete', assignee: 'Site Prep Inc', predecessors: ['FD-004'] },
      ]
    },
    {
      id: 'framing',
      name: 'Framing',
      startDate: '2024-04-16',
      endDate: '2024-06-30',
      progress: 75,
      status: 'in-progress',
      tasks: [
        { id: 'FR-001', name: 'First Floor Framing', startDate: '2024-04-16', endDate: '2024-05-06', duration: 21, progress: 100, status: 'complete', assignee: 'Smith Framing', predecessors: ['FD-005'] },
        { id: 'FR-002', name: 'Second Floor Framing', startDate: '2024-05-07', endDate: '2024-05-27', duration: 21, progress: 100, status: 'complete', assignee: 'Smith Framing', predecessors: ['FR-001'] },
        { id: 'FR-003', name: 'Roof Framing', startDate: '2024-05-28', endDate: '2024-06-17', duration: 21, progress: 60, status: 'in-progress', assignee: 'Smith Framing', predecessors: ['FR-002'] },
        { id: 'FR-004', name: 'Sheathing', startDate: '2024-06-18', endDate: '2024-06-30', duration: 13, progress: 0, status: 'not-started', assignee: 'Smith Framing', predecessors: ['FR-003'] },
      ]
    },
    {
      id: 'mechanicals',
      name: 'Mechanicals (Rough)',
      startDate: '2024-07-01',
      endDate: '2024-08-15',
      progress: 0,
      status: 'not-started',
      tasks: [
        { id: 'ME-001', name: 'Plumbing Rough', startDate: '2024-07-01', endDate: '2024-07-21', duration: 21, progress: 0, status: 'not-started', assignee: 'ABC Plumbing', predecessors: ['FR-004'] },
        { id: 'ME-002', name: 'Electrical Rough', startDate: '2024-07-08', endDate: '2024-07-28', duration: 21, progress: 0, status: 'not-started', assignee: 'Sparks Electric', predecessors: ['FR-004'] },
        { id: 'ME-003', name: 'HVAC Rough', startDate: '2024-07-15', endDate: '2024-08-04', duration: 21, progress: 0, status: 'not-started', assignee: 'Cool Air HVAC', predecessors: ['FR-004'] },
        { id: 'ME-004', name: 'Inspections', startDate: '2024-08-05', endDate: '2024-08-15', duration: 11, progress: 0, status: 'not-started', assignee: 'City Inspector', predecessors: ['ME-001', 'ME-002', 'ME-003'] },
      ]
    },
    {
      id: 'exterior',
      name: 'Exterior Finishes',
      startDate: '2024-08-16',
      endDate: '2024-09-30',
      progress: 0,
      status: 'not-started',
      tasks: [
        { id: 'EX-001', name: 'Roofing', startDate: '2024-08-16', endDate: '2024-08-30', duration: 15, progress: 0, status: 'not-started', assignee: 'Top Roofing', predecessors: ['ME-004'] },
        { id: 'EX-002', name: 'Siding', startDate: '2024-08-31', endDate: '2024-09-20', duration: 21, progress: 0, status: 'not-started', assignee: 'Siding Pros', predecessors: ['EX-001'] },
        { id: 'EX-003', name: 'Windows & Doors', startDate: '2024-09-01', endDate: '2024-09-14', duration: 14, progress: 0, status: 'not-started', assignee: 'Glass Masters', predecessors: ['EX-001'] },
        { id: 'EX-004', name: 'Exterior Paint', startDate: '2024-09-21', endDate: '2024-09-30', duration: 10, progress: 0, status: 'not-started', assignee: 'Paint Crew', predecessors: ['EX-002', 'EX-003'] },
      ]
    },
  ];

  const togglePhase = (phaseId) => {
    setExpandedPhases(prev => prev.includes(phaseId) ? prev.filter(p => p !== phaseId) : [...prev, phaseId]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'delayed': return 'bg-red-100 text-red-700';
      case 'not-started': return 'bg-gray-100 text-gray-500';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  const getProgressColor = (progress) => {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress > 0) return 'bg-amber-500';
    return 'bg-gray-300';
  };

  const totalTasks = phases.reduce((sum, p) => sum + p.tasks.length, 0);
  const completedTasks = phases.reduce((sum, p) => sum + p.tasks.filter(t => t.status === 'complete').length, 0);
  const inProgressTasks = phases.reduce((sum, p) => sum + p.tasks.filter(t => t.status === 'in-progress').length, 0);
  const overallProgress = Math.round((completedTasks / totalTasks) * 100);

  // Calculate months for Gantt header
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const ganttMonths = months.slice(0, 10); // Jan - Oct 2024

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Construction Schedule</h1>
          <p className="text-sm text-gray-500">Project timeline and task management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button variant="outline" size="sm"><Upload className="w-4 h-4 mr-1" />Import</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-1" />Add Task
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Overall Progress</p>
          <p className="text-2xl font-semibold">{overallProgress}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className={cn("h-2 rounded-full", getProgressColor(overallProgress))} style={{ width: `${overallProgress}%` }}></div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Tasks</p>
          <p className="text-2xl font-semibold">{totalTasks}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-semibold text-green-600">{completedTasks}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-semibold text-blue-600">{inProgressTasks}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-amber-500">
          <p className="text-sm text-gray-500">Est. Completion</p>
          <p className="text-2xl font-semibold">Sep 30</p>
        </div>
      </div>

      {/* View Toggle & Filters */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button onClick={() => setViewMode('gantt')} className={cn("px-3 py-1.5 rounded text-sm", viewMode === 'gantt' ? "bg-[#047857] text-white" : "bg-gray-100")}>Gantt</button>
            <button onClick={() => setViewMode('list')} className={cn("px-3 py-1.5 rounded text-sm", viewMode === 'list' ? "bg-[#047857] text-white" : "bg-gray-100")}>List</button>
            <button onClick={() => setViewMode('calendar')} className={cn("px-3 py-1.5 rounded text-sm", viewMode === 'calendar' ? "bg-[#047857] text-white" : "bg-gray-100")}>Calendar</button>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search tasks..." className="pl-9 w-64" />
            </div>
            <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-1" />Filter</Button>
          </div>
        </div>
      </div>

      {/* Schedule View */}
      {viewMode === 'gantt' ? (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1400px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium w-[300px] sticky left-0 bg-gray-50 z-10">Task</th>
                  <th className="text-left px-2 py-3 font-medium w-[100px]">Assignee</th>
                  <th className="text-center px-2 py-3 font-medium w-[80px]">Progress</th>
                  {ganttMonths.map(month => (
                    <th key={month} className="text-center px-1 py-3 font-medium w-[100px] border-l">{month} 2024</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {phases.map((phase) => (
                  <React.Fragment key={phase.id}>
                    {/* Phase Row */}
                    <tr className="bg-gray-100 cursor-pointer hover:bg-gray-200" onClick={() => togglePhase(phase.id)}>
                      <td className="px-4 py-2 font-semibold sticky left-0 bg-gray-100 z-10">
                        <div className="flex items-center gap-2">
                          {expandedPhases.includes(phase.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          {phase.name}
                          <span className={cn("px-2 py-0.5 rounded text-xs ml-2", getStatusColor(phase.status))}>
                            {phase.status.replace('-', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-xs text-gray-500">{phase.tasks.length} tasks</td>
                      <td className="px-2 py-2 text-center">
                        <span className="text-xs font-medium">{phase.progress}%</span>
                      </td>
                      {ganttMonths.map((month, idx) => (
                        <td key={month} className="px-1 py-2 border-l">
                          {/* Phase bar */}
                        </td>
                      ))}
                    </tr>
                    {/* Task Rows */}
                    {expandedPhases.includes(phase.id) && phase.tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50 border-b cursor-pointer" onClick={() => setSelectedTask(task)}>
                        <td className="px-4 py-2 pl-10 sticky left-0 bg-white z-10">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-xs font-mono">{task.id}</span>
                            <span>{task.name}</span>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-xs text-gray-600">{task.assignee}</td>
                        <td className="px-2 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-12 bg-gray-200 rounded-full h-1.5">
                              <div className={cn("h-1.5 rounded-full", getProgressColor(task.progress))} style={{ width: `${task.progress}%` }}></div>
                            </div>
                            <span className="text-xs">{task.progress}%</span>
                          </div>
                        </td>
                        {ganttMonths.map((month, idx) => {
                          const taskStart = new Date(task.startDate);
                          const taskEnd = new Date(task.endDate);
                          const monthStart = new Date(2024, idx, 1);
                          const monthEnd = new Date(2024, idx + 1, 0);
                          const isInMonth = taskStart <= monthEnd && taskEnd >= monthStart;
                          
                          return (
                            <td key={month} className="px-1 py-2 border-l relative">
                              {isInMonth && (
                                <div 
                                  className={cn("h-4 rounded", getProgressColor(task.progress))}
                                  style={{ opacity: task.progress === 0 ? 0.3 : 1 }}
                                ></div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Task ID</th>
                <th className="text-left px-4 py-3 font-medium">Task Name</th>
                <th className="text-left px-4 py-3 font-medium">Phase</th>
                <th className="text-left px-4 py-3 font-medium">Start</th>
                <th className="text-left px-4 py-3 font-medium">End</th>
                <th className="text-left px-4 py-3 font-medium">Duration</th>
                <th className="text-left px-4 py-3 font-medium">Assignee</th>
                <th className="text-left px-4 py-3 font-medium">Progress</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {phases.flatMap(phase => phase.tasks.map(task => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{task.id}</td>
                  <td className="px-4 py-3 font-medium">{task.name}</td>
                  <td className="px-4 py-3 text-gray-500">{phase.name}</td>
                  <td className="px-4 py-3">{task.startDate}</td>
                  <td className="px-4 py-3">{task.endDate}</td>
                  <td className="px-4 py-3">{task.duration} days</td>
                  <td className="px-4 py-3 text-xs">{task.assignee}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className={cn("h-2 rounded-full", getProgressColor(task.progress))} style={{ width: `${task.progress}%` }}></div>
                      </div>
                      <span className="text-xs">{task.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(task.status))}>
                      {task.status.replace('-', ' ')}
                    </span>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border rounded-lg p-6 text-center text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">Calendar view - Mock visualization coming</p>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Add Task</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Phase *</label>
                <select className="w-full border rounded-md px-3 py-2">
                  {phases.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Task Name *</label>
                <Input placeholder="Enter task name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Start Date *</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">End Date *</label>
                  <Input type="date" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Assignee</label>
                <Input placeholder="Contractor or team" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Predecessors</label>
                <select className="w-full border rounded-md px-3 py-2" multiple>
                  {phases.flatMap(p => p.tasks.map(t => <option key={t.id} value={t.id}>{t.id} - {t.name}</option>))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Notes</label>
                <textarea className="w-full border rounded-md px-3 py-2" rows={2} placeholder="Additional notes..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]">Add Task</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
