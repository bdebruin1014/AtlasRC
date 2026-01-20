import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { 
  CheckSquare, Plus, Filter, Search, 
  LayoutList, KanbanSquare, Calendar as CalendarIcon, GanttChartSquare,
  Clock, AlertCircle, CheckCircle2, MoreHorizontal,
  Paperclip, MessageSquare, ArrowRight, X, ChevronDown, UserCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import EditableField from '@/components/EditableField';

const TASKS_DATA = [
  { id: 'T-101', title: 'Review Highland Park Permits', module: 'Construction', status: 'In Progress', priority: 'High', due: 'Today', assignee: 'Alex J.', subtasks: { total: 5, completed: 3 } },
  { id: 'T-102', title: 'Finalize Q3 Investor Report', module: 'Investor Relations', status: 'Review', priority: 'High', due: 'Today', assignee: 'Sarah M.', subtasks: { total: 2, completed: 2 } },
  { id: 'T-103', title: 'Update Riverside Budget', module: 'Finance', status: 'To Do', priority: 'Medium', due: 'Tomorrow', assignee: 'Mike R.', subtasks: { total: 0, completed: 0 } },
  { id: 'T-104', title: 'Call City Planner', module: 'Acquisition', status: 'Overdue', priority: 'Urgent', due: 'Yesterday', assignee: 'Alex J.', subtasks: { total: 1, completed: 0 } },
  { id: 'T-105', title: 'Draft Purchase Agreement', module: 'Acquisition', status: 'To Do', priority: 'High', due: 'Dec 05', assignee: 'Legal Team', subtasks: { total: 0, completed: 0 } },
  { id: 'T-106', title: 'Site Inspection - Oakwood', module: 'Construction', status: 'Scheduled', priority: 'Medium', due: 'Dec 06', assignee: 'Site Mgr', subtasks: { total: 8, completed: 0 } },
  { id: 'T-107', title: 'Prepare Board Deck', module: 'Administrative', status: 'In Progress', priority: 'High', due: 'Dec 10', assignee: 'Alex J.', subtasks: { total: 12, completed: 4 } },
  { id: 'T-108', title: 'Approve Monthly Invoices', module: 'Finance', status: 'To Do', priority: 'Low', due: 'Dec 08', assignee: 'Finance Dept', subtasks: { total: 0, completed: 0 } },
  { id: 'T-109', title: 'Update Website Listings', module: 'Sales', status: 'To Do', priority: 'Low', due: 'Dec 12', assignee: 'Marketing', subtasks: { total: 3, completed: 0 } },
  { id: 'T-110', title: 'Send K-1 Distributions', module: 'Investor Relations', status: 'Done', priority: 'High', due: 'Oct 15', assignee: 'Sarah M.', subtasks: { total: 45, completed: 45 } },
  { id: 'T-111', title: 'Order Steel Package', module: 'Construction', status: 'Blocked', priority: 'Urgent', due: 'Tomorrow', assignee: 'Procurement', subtasks: { total: 1, completed: 0 } },
  { id: 'T-112', title: 'Schedule Open House', module: 'Sales', status: 'To Do', priority: 'Medium', due: 'Dec 15', assignee: 'Agent A', subtasks: { total: 5, completed: 1 } },
  { id: 'T-113', title: 'Renew Insurance Policy', module: 'Administrative', status: 'In Progress', priority: 'High', due: 'Dec 20', assignee: 'Ops Team', subtasks: { total: 2, completed: 0 } },
  { id: 'T-114', title: 'Evaluate New CRM', module: 'Sales', status: 'Backlog', priority: 'Low', due: 'Jan 15', assignee: 'Tech Lead', subtasks: { total: 0, completed: 0 } },
  { id: 'T-115', title: 'Employee Performance Reviews', module: 'Administrative', status: 'Draft', priority: 'High', due: 'Dec 31', assignee: 'HR', subtasks: { total: 10, completed: 0 } },
];

const GlobalTasksPage = () => {
  const [view, setView] = useState('list');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const getModuleColor = (mod) => {
    switch(mod) {
      case 'Acquisition': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Construction': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Finance': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Investor Relations': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Sales': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (p) => {
    if (p === 'Urgent') return <AlertCircle className="w-4 h-4 text-red-600" />;
    if (p === 'High') return <ArrowRight className="w-4 h-4 text-orange-500 -rotate-45" />;
    if (p === 'Medium') return <ArrowRight className="w-4 h-4 text-yellow-500" />;
    return <ArrowRight className="w-4 h-4 text-blue-400 rotate-45" />;
  };

  return (
    <>
      <Helmet>
        <title>Tasks & Operations | AtlasDev</title>
      </Helmet>

      <div className="flex flex-col h-full bg-[#EDF2F7] overflow-hidden relative">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center shrink-0">
           <div>
              <h1 className="text-2xl font-bold text-gray-900">Tasks & Operations</h1>
              <p className="text-sm text-gray-500 mt-1">Manage tasks across all departments and projects.</p>
           </div>
           <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link to="/operations/tasks/templates">Templates</Link>
              </Button>
              <Button onClick={() => setIsAddOpen(true)} className="bg-[#2F855A] hover:bg-[#276749] text-white shadow-sm">
                 <Plus className="w-4 h-4 mr-2" /> New Task
              </Button>
           </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
           {/* Stats & Filters */}
           <div className="px-8 py-6 pb-0 space-y-6 shrink-0">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                 {[
                    { label: 'Total Tasks', val: '115', icon: CheckSquare, color: 'blue' },
                    { label: 'Due Today', val: '8', icon: Clock, color: 'orange' },
                    { label: 'Overdue', val: '3', icon: AlertCircle, color: 'red' },
                    { label: 'This Week', val: '24', icon: CalendarIcon, color: 'purple' },
                    { label: 'My Tasks', val: '12', icon: UserCircle, color: 'emerald' },
                 ].map((s, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                       <div className="flex justify-between items-start">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{s.label}</p>
                          <s.icon className={cn("w-4 h-4", `text-${s.color}-500`)} />
                       </div>
                       <h3 className="text-2xl font-bold text-gray-900 mt-2">{s.val}</h3>
                    </div>
                 ))}
              </div>

              {/* Toolbar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                 <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                    <Tabs value={view} onValueChange={setView} className="w-auto">
                       <TabsList className="bg-white border border-gray-200 p-1 h-auto">
                          <TabsTrigger value="list" className="text-xs px-3 py-1.5 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"><LayoutList className="w-3.5 h-3.5 mr-2" /> List</TabsTrigger>
                          <TabsTrigger value="kanban" className="text-xs px-3 py-1.5 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"><KanbanSquare className="w-3.5 h-3.5 mr-2" /> Board</TabsTrigger>
                          <TabsTrigger value="calendar" className="text-xs px-3 py-1.5 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"><CalendarIcon className="w-3.5 h-3.5 mr-2" /> Calendar</TabsTrigger>
                          <TabsTrigger value="timeline" className="text-xs px-3 py-1.5 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"><GanttChartSquare className="w-3.5 h-3.5 mr-2" /> Timeline</TabsTrigger>
                       </TabsList>
                    </Tabs>
                    <div className="h-6 w-px bg-gray-300 mx-2 hidden lg:block" />
                    <div className="flex items-center gap-2">
                       {['Acquisition', 'Construction', 'Finance', 'Sales'].map(mod => (
                          <Badge key={mod} variant="outline" className="cursor-pointer hover:bg-gray-50 bg-white text-gray-600 font-normal whitespace-nowrap">
                             {mod}
                          </Badge>
                       ))}
                       <Button variant="ghost" size="sm" className="text-xs text-gray-500"><Filter className="w-3 h-3 mr-1" /> More</Button>
                    </div>
                 </div>

                 <div className="flex items-center gap-2 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-64">
                       <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                       <input type="text" placeholder="Search tasks..." className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                    </div>
                 </div>
              </div>
           </div>

           {/* View Content */}
           <div className="flex-1 overflow-hidden p-8 pt-4">
              {view === 'list' && (
                 <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="overflow-auto flex-1">
                       <table className="w-full text-sm text-left">
                          <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 sticky top-0 z-10">
                             <tr>
                                <th className="px-6 py-3 w-8"><input type="checkbox" className="rounded border-gray-300 text-emerald-600" /></th>
                                <th className="px-6 py-3">Task Name</th>
                                <th className="px-6 py-3">Module</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Priority</th>
                                <th className="px-6 py-3">Due Date</th>
                                <th className="px-6 py-3">Assignee</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                             {TASKS_DATA.map(task => (
                                <tr key={task.id} className="hover:bg-gray-50 cursor-pointer group" onClick={() => setSelectedTask(task)}>
                                   <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="rounded border-gray-300 text-emerald-600" /></td>
                                   <td className="px-6 py-3">
                                      <div className="font-medium text-gray-900">{task.title}</div>
                                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                         <span>{task.id}</span>
                                         {task.subtasks.total > 0 && (
                                            <span className="flex items-center gap-1"><CheckSquare className="w-3 h-3" /> {task.subtasks.completed}/{task.subtasks.total}</span>
                                         )}
                                      </div>
                                   </td>
                                   <td className="px-6 py-3">
                                      <Badge variant="outline" className={cn("font-normal text-[10px]", getModuleColor(task.module))}>
                                         {task.module}
                                      </Badge>
                                   </td>
                                   <td className="px-6 py-3">
                                      <span className={cn(
                                         "text-xs font-medium px-2 py-1 rounded-full",
                                         task.status === 'Done' ? "bg-emerald-100 text-emerald-700" :
                                         task.status === 'In Progress' ? "bg-blue-100 text-blue-700" :
                                         task.status === 'Overdue' ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                                      )}>
                                         {task.status}
                                      </span>
                                   </td>
                                   <td className="px-6 py-3">
                                      <div className="flex items-center gap-2">
                                         {getPriorityIcon(task.priority)}
                                         <span className="text-gray-600">{task.priority}</span>
                                      </div>
                                   </td>
                                   <td className="px-6 py-3 text-gray-600 font-medium">{task.due}</td>
                                   <td className="px-6 py-3">
                                      <div className="flex items-center gap-2">
                                         <Avatar className="w-6 h-6">
                                            <AvatarFallback className="text-[10px] bg-emerald-100 text-emerald-700">{task.assignee.charAt(0)}</AvatarFallback>
                                         </Avatar>
                                         <span className="text-gray-600">{task.assignee}</span>
                                      </div>
                                   </td>
                                   <td className="px-6 py-3 text-right">
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"><MoreHorizontal className="w-4 h-4" /></Button>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                    <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between items-center text-xs text-gray-500">
                       <div>Showing 15 of 115 tasks</div>
                       <div className="flex gap-2">
                          <Button variant="outline" size="sm" disabled>Previous</Button>
                          <Button variant="outline" size="sm">Next</Button>
                       </div>
                    </div>
                 </div>
              )}

              {view === 'kanban' && (
                 <div className="flex gap-6 h-full overflow-x-auto pb-4">
                    {['To Do', 'In Progress', 'Review', 'Done'].map(col => (
                       <div key={col} className="flex-1 min-w-[300px] bg-gray-100/50 rounded-xl p-4 flex flex-col border border-gray-200/60">
                          <div className="flex justify-between items-center mb-4">
                             <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                                <div className={cn("w-2 h-2 rounded-full", 
                                   col === 'Done' ? 'bg-emerald-500' : col === 'Review' ? 'bg-purple-500' : col === 'In Progress' ? 'bg-blue-500' : 'bg-gray-400'
                                )} />
                                {col}
                             </h3>
                             <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                                {TASKS_DATA.filter(t => (col === 'To Do' ? ['To Do', 'Draft', 'Scheduled'].includes(t.status) : t.status === col)).length}
                             </span>
                          </div>
                          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                             {TASKS_DATA.filter(t => (col === 'To Do' ? ['To Do', 'Draft', 'Scheduled', 'Blocked'].includes(t.status) : t.status === col)).map(task => (
                                <div key={task.id} onClick={() => setSelectedTask(task)} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                                   <div className="flex justify-between items-start mb-2">
                                      <Badge variant="outline" className={cn("text-[10px] font-normal py-0 h-5", getModuleColor(task.module))}>
                                         {task.module}
                                      </Badge>
                                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"><MoreHorizontal className="w-3 h-3" /></Button>
                                   </div>
                                   <h4 className="text-sm font-bold text-gray-900 mb-3 leading-snug">{task.title}</h4>
                                   <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                         <Avatar className="w-5 h-5"><AvatarFallback className="text-[9px]">{task.assignee.charAt(0)}</AvatarFallback></Avatar>
                                         {task.due}
                                      </div>
                                      {getPriorityIcon(task.priority)}
                                   </div>
                                </div>
                             ))}
                          </div>
                          <Button variant="ghost" className="w-full mt-3 text-gray-500 text-xs hover:bg-gray-200/50 border border-dashed border-gray-300"><Plus className="w-3 h-3 mr-2" /> Add Task</Button>
                       </div>
                    ))}
                 </div>
              )}

              {view === 'calendar' && (
                 <div className="bg-white border border-gray-200 rounded-xl shadow-sm h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                       <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                       <h3 className="font-bold text-gray-900">Calendar View</h3>
                       <p className="text-sm">Calendar visualization is not fully implemented in this demo.</p>
                    </div>
                 </div>
              )}

              {view === 'timeline' && (
                 <div className="bg-white border border-gray-200 rounded-xl shadow-sm h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                       <GanttChartSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                       <h3 className="font-bold text-gray-900">Gantt Timeline</h3>
                       <p className="text-sm">Project timeline visualization is not fully implemented in this demo.</p>
                    </div>
                 </div>
              )}
           </div>
        </div>

        {/* Task Detail Drawer (Slide-over) */}
        {selectedTask && (
           <div className="absolute inset-0 z-50 flex justify-end">
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSelectedTask(null)} />
              <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                 <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <Badge variant="outline" className="bg-white border-gray-300 font-mono">{selectedTask.id}</Badge>
                       <span className={cn("w-2 h-2 rounded-full", selectedTask.status === 'Done' ? 'bg-emerald-500' : 'bg-blue-500')} />
                       <span className="text-sm font-medium text-gray-600">{selectedTask.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Button variant="ghost" size="sm"><MoreHorizontal className="w-4 h-4" /></Button>
                       <Button variant="ghost" size="sm" onClick={() => setSelectedTask(null)}><X className="w-4 h-4" /></Button>
                    </div>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">{selectedTask.title}</h2>
                    
                    <div className="grid grid-cols-3 gap-6 mb-8">
                       <div>
                          <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Assignee</label>
                          <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer border border-transparent hover:border-gray-200 transition-colors">
                             <Avatar className="w-6 h-6"><AvatarFallback className="text-xs bg-emerald-100 text-emerald-700">{selectedTask.assignee.charAt(0)}</AvatarFallback></Avatar>
                             <span className="text-sm font-medium">{selectedTask.assignee}</span>
                          </div>
                       </div>
                       <div>
                          <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Due Date</label>
                          <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer border border-transparent hover:border-gray-200 transition-colors">
                             <Clock className="w-4 h-4 text-gray-400" />
                             <span className="text-sm font-medium">{selectedTask.due}</span>
                          </div>
                       </div>
                       <div>
                          <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Priority</label>
                          <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer border border-transparent hover:border-gray-200 transition-colors">
                             {getPriorityIcon(selectedTask.priority)}
                             <span className="text-sm font-medium">{selectedTask.priority}</span>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-8">
                       <section>
                          <h3 className="text-sm font-bold text-gray-900 mb-3">Description</h3>
                          <div className="text-sm text-gray-600 leading-relaxed p-4 bg-gray-50 rounded-lg border border-gray-200 min-h-[100px]">
                             Review all permit applications for the Highland Park Phase 2 expansion. Ensure structural engineering stamps are present and correct. Coordinate with the city planner if any variances are required.
                          </div>
                       </section>

                       <section>
                          <h3 className="text-sm font-bold text-gray-900 mb-3 flex justify-between items-center">
                             <span>Subtasks</span>
                             <span className="text-xs font-normal text-gray-500">3 of 5 completed</span>
                          </h3>
                          <div className="space-y-2">
                             {[
                                { txt: 'Review structural drawings', done: true },
                                { txt: 'Check zoning compliance', done: true },
                                { txt: 'Submit initial application', done: true },
                                { txt: 'Respond to city comments', done: false },
                                { txt: 'Pay permit fees', done: false },
                             ].map((st, i) => (
                                <div key={i} className="flex items-center gap-3 group">
                                   <input type="checkbox" defaultChecked={st.done} className="rounded text-emerald-600 focus:ring-emerald-500 border-gray-300" />
                                   <span className={cn("text-sm flex-1", st.done ? "text-gray-400 line-through" : "text-gray-700")}>{st.txt}</span>
                                   <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"><X className="w-3 h-3 text-gray-400" /></Button>
                                </div>
                             ))}
                             <Button variant="ghost" size="sm" className="pl-0 text-gray-500 hover:text-emerald-600"><Plus className="w-4 h-4 mr-2" /> Add subtask</Button>
                          </div>
                       </section>

                       <section>
                          <h3 className="text-sm font-bold text-gray-900 mb-3">Attachments</h3>
                          <div className="grid grid-cols-2 gap-3">
                             <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-white hover:border-emerald-500 cursor-pointer transition-colors">
                                <div className="p-2 bg-red-50 text-red-600 rounded"><Paperclip className="w-4 h-4" /></div>
                                <div className="overflow-hidden">
                                   <p className="text-sm font-medium truncate">Permit_App_v2.pdf</p>
                                   <p className="text-xs text-gray-500">2.4 MB • PDF</p>
                                </div>
                             </div>
                          </div>
                       </section>

                       <section>
                          <h3 className="text-sm font-bold text-gray-900 mb-3">Activity</h3>
                          <div className="space-y-4 relative pl-4 border-l border-gray-200">
                             {[
                                { user: 'Alex J.', action: 'completed subtask', target: 'Review structural drawings', time: '2h ago' },
                                { user: 'Sarah M.', action: 'commented', target: 'Waiting on engineering stamp', time: '5h ago' },
                                { user: 'System', action: 'created task', target: '', time: 'Yesterday' },
                             ].map((act, i) => (
                                <div key={i} className="relative text-sm">
                                   <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-gray-300 ring-4 ring-white" />
                                   <p className="text-gray-900"><span className="font-semibold">{act.user}</span> {act.action} <span className="text-gray-600">{act.target}</span></p>
                                   <p className="text-xs text-gray-400 mt-0.5">{act.time}</p>
                                </div>
                             ))}
                          </div>
                          <div className="mt-4 flex gap-3">
                             <Avatar className="w-8 h-8"><AvatarFallback>AJ</AvatarFallback></Avatar>
                             <div className="flex-1 relative">
                                <input type="text" placeholder="Write a comment..." className="w-full pl-4 pr-10 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:border-emerald-500" />
                                <Button size="sm" variant="ghost" className="absolute right-1 top-1 h-7 w-7 p-0 rounded-full"><ArrowRight className="w-4 h-4" /></Button>
                             </div>
                          </div>
                       </section>
                    </div>
                 </div>
                 
                 <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setSelectedTask(null)}>Close</Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Mark Complete</Button>
                 </div>
              </div>
           </div>
        )}
        
        {/* Add Task Modal */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
           <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                 <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                 <EditableField label="Task Title" placeholder="e.g., Review Q3 Financials" />
                 <div className="grid grid-cols-2 gap-4">
                    <EditableField label="Module" type="select" options={['Acquisition', 'Construction', 'Finance', 'Investor Relations', 'Sales', 'Administrative']} />
                    <EditableField label="Priority" type="select" options={['Low', 'Medium', 'High', 'Urgent']} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <EditableField label="Due Date" placeholder="Select date..." />
                    <EditableField label="Assignee" placeholder="Search user..." />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <textarea className="w-full border border-gray-300 rounded-md p-3 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Add details..." />
                 </div>
              </div>
              <DialogFooter>
                 <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                 <Button className="bg-[#2F855A] hover:bg-[#276749] text-white">Create Task</Button>
              </DialogFooter>
           </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default GlobalTasksPage;