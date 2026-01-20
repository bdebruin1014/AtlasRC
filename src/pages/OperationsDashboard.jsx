import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { 
  CheckSquare, Home, Users, TrendingUp, Activity, 
  Clock, ArrowRight, Plus, Calendar as CalendarIcon, AlertCircle,
  ListChecks, FileText, Briefcase, PieChart, MapPin,
  DollarSign, CheckCircle2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const OperationsDashboard = () => {
  const navigate = useNavigate();

  // Mock Data - Summary Stats
  const stats = [
    { label: 'Open Tasks', value: '47', subtext: '12 overdue', icon: ListChecks, color: 'blue' },
    { label: 'Due Today', value: '8', subtext: '3 overdue', icon: AlertCircle, color: 'red' },
    { label: 'Active Listings', value: '15', subtext: '+2 this week', icon: Home, color: 'emerald' },
    { label: 'Showings This Week', value: '12', subtext: 'Next: 2:00 PM', icon: Users, color: 'purple' },
  ];

  // Mock Data - Tasks
  const myTasks = [
    { id: 1, title: 'Review Purchase Agreement', project: '124 Highland Ave', due: 'Today', priority: 'High' },
    { id: 2, title: 'Approve Electrical Invoice', project: 'Riverside Commercial', due: 'Today', priority: 'Medium' },
    { id: 3, title: 'Update Investor Q3 Report', project: 'General', due: 'Tomorrow', priority: 'High' },
    { id: 4, title: 'Site Inspection Walkthrough', project: 'Oakwood Residencies', due: 'Oct 12', priority: 'Low' },
    { id: 5, title: 'Call Vendor - Plumbing', project: 'Riverside Commercial', due: 'Oct 14', priority: 'Medium' },
  ];

  // Mock Data - Activity
  const recentActivity = [
    { id: 1, type: 'listing', text: 'Sarah Jenkins added new listing', detail: '124 Highland Ave, Unit 4B', time: '10 mins ago' },
    { id: 2, type: 'task', text: 'Mike Ross completed task', detail: 'Review Inspection Report', time: '45 mins ago' },
    { id: 3, type: 'offer', text: 'New Offer Received', detail: '$445k for Unit 4B', time: '2 hours ago' },
    { id: 4, type: 'showing', text: 'Showing Scheduled', detail: '88 Riverside Dr (2:00 PM)', time: '3 hours ago' },
    { id: 5, type: 'document', text: 'Document Uploaded', detail: 'Riverside_Permits_Final.pdf', time: '5 hours ago' },
    { id: 6, type: 'task', text: 'Sarah Jenkins assigned task', detail: 'Prepare Open House Material', time: 'Yesterday' },
    { id: 7, type: 'system', text: 'System Maintenance', detail: 'Scheduled for Sunday 2AM', time: 'Yesterday' },
  ];

  // Mock Data - Calendar
  const upcomingEvents = [
    { id: 1, title: 'Weekly Ops Meeting', time: '10:00 AM', type: 'meeting' },
    { id: 2, title: 'Showing - 124 Highland', time: '2:00 PM', type: 'showing' },
    { id: 3, title: 'Permit Deadline - Riverside', time: 'All Day', type: 'deadline' },
    { id: 4, title: 'Investor Call - Blackstone', time: 'Tomorrow, 11:00 AM', type: 'meeting' },
    { id: 5, title: 'Open House - Oakwood', time: 'Saturday, 1:00 PM', type: 'showing' },
  ];

  // Mock Data - Sales Pipeline
  const salesPipeline = [
    { label: 'Active', count: 15, color: 'bg-emerald-500' },
    { label: 'Under Contract', count: 6, color: 'bg-blue-500' },
    { label: 'Pending', count: 3, color: 'bg-amber-500' },
    { label: 'Closed (Mo)', count: 4, color: 'bg-purple-500' },
  ];

  return (
    <>
      <Helmet>
        <title>Operations Dashboard | AtlasDev</title>
      </Helmet>

      <div className="flex flex-col h-full bg-[#F7FAFC] overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 bg-white border-b border-gray-200 flex justify-between items-center shrink-0">
           <div>
              <h1 className="text-2xl font-bold text-gray-900">Operations Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Central command for tasks, sales, and daily activities.</p>
           </div>
           <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/operations/calendar')}>
                 <CalendarIcon className="w-4 h-4 mr-2" /> View Calendar
              </Button>
              <Button variant="outline" onClick={() => navigate('/operations/sales/listings')}>
                 <Plus className="w-4 h-4 mr-2" /> New Listing
              </Button>
              <Button className="bg-[#2F855A] hover:bg-[#276749] text-white shadow-sm" onClick={() => navigate('/operations/tasks')}>
                 <Plus className="w-4 h-4 mr-2" /> New Task
              </Button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
           
           {/* Quick Access Cards */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div 
                onClick={() => navigate('/operations/tasks')}
                className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-200 cursor-pointer transition-all flex items-center gap-4 group"
              >
                 <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <CheckSquare className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">Task Manager</h3>
                    <p className="text-xs text-gray-500">View your daily tasks</p>
                 </div>
              </div>

              <div 
                onClick={() => navigate('/operations/calendar')}
                className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-200 cursor-pointer transition-all flex items-center gap-4 group"
              >
                 <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                    <CalendarIcon className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">Calendar</h3>
                    <p className="text-xs text-gray-500">Schedule & events</p>
                 </div>
              </div>

              <div 
                onClick={() => navigate('/operations/sales')}
                className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-200 cursor-pointer transition-all flex items-center gap-4 group"
              >
                 <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                    <TrendingUp className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">Sales Dashboard</h3>
                    <p className="text-xs text-gray-500">Pipeline & performance</p>
                 </div>
              </div>
           </div>

           {/* Summary Cards */}
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, i) => (
                 <Card key={i} className="border-gray-200 shadow-sm">
                    <CardContent className="p-6">
                       <div className="flex justify-between items-start">
                          <div>
                             <p className="text-xs font-bold text-gray-500 uppercase">{stat.label}</p>
                             <h3 className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                             <p className={cn("text-xs mt-1 font-medium", 
                                stat.color === 'red' ? "text-red-600" : 
                                stat.color === 'blue' ? "text-blue-600" : 
                                stat.color === 'emerald' ? "text-emerald-600" : "text-gray-500"
                             )}>
                                {stat.subtext}
                             </p>
                          </div>
                          <div className={cn("p-3 rounded-xl", 
                             stat.color === 'blue' ? "bg-blue-50 text-blue-600" :
                             stat.color === 'red' ? "bg-red-50 text-red-600" :
                             stat.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                             "bg-purple-50 text-purple-600"
                          )}>
                             <stat.icon className="w-5 h-5" />
                          </div>
                       </div>
                    </CardContent>
                 </Card>
              ))}
           </div>

           <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-8">
              
              {/* Left Column (60%) */}
              <div className="xl:col-span-7 space-y-8">
                 
                 {/* My Tasks Due Soon */}
                 <Card className="border-gray-200 shadow-sm">
                    <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between">
                       <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <CheckSquare className="w-5 h-5 text-gray-400" /> My Tasks Due Soon
                       </CardTitle>
                       <Button variant="ghost" size="sm" onClick={() => navigate('/operations/tasks')} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-xs h-8">
                          View All Tasks <ArrowRight className="w-3 h-3 ml-1" />
                       </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                       <div className="divide-y divide-gray-100">
                          {myTasks.map(task => (
                             <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors flex items-start gap-3 group">
                                <input type="checkbox" className="mt-1 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
                                <div className="flex-1 min-w-0">
                                   <p className="text-sm font-medium text-gray-900 group-hover:text-emerald-700 transition-colors truncate">{task.title}</p>
                                   <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                      <Briefcase className="w-3 h-3" /> {task.project}
                                   </p>
                                </div>
                                <div className="text-right shrink-0">
                                   <span className={cn("text-xs font-bold block", task.due === 'Today' ? "text-red-600" : "text-gray-600")}>{task.due}</span>
                                   <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal mt-1 bg-white text-gray-500 border-gray-200">{task.priority}</Badge>
                                </div>
                             </div>
                          ))}
                       </div>
                    </CardContent>
                 </Card>

                 {/* Recent Activity */}
                 <Card className="border-gray-200 shadow-sm">
                    <CardHeader className="pb-3 border-b border-gray-100">
                       <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <Activity className="w-5 h-5 text-gray-400" /> Recent Activity
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                       <div className="relative pl-4 border-l border-gray-200 space-y-6">
                          {recentActivity.map((item, i) => (
                             <div key={i} className="relative pl-6 group">
                                <div className={cn(
                                   "absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 bg-white transition-colors",
                                   item.type === 'listing' ? "border-emerald-500 group-hover:bg-emerald-500" : 
                                   item.type === 'offer' ? "border-purple-500 group-hover:bg-purple-500" : 
                                   item.type === 'showing' ? "border-blue-500 group-hover:bg-blue-500" : 
                                   "border-gray-400 group-hover:bg-gray-400"
                                )} />
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                   <div>
                                      <p className="text-sm font-bold text-gray-900">{item.text}</p>
                                      <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
                                   </div>
                                   <span className="text-[10px] text-gray-400 whitespace-nowrap">{item.time}</span>
                                </div>
                             </div>
                          ))}
                       </div>
                       <Button variant="ghost" className="w-full mt-6 text-xs text-gray-400 hover:text-gray-600">View Full Activity Log</Button>
                    </CardContent>
                 </Card>

              </div>

              {/* Right Column (40%) */}
              <div className="xl:col-span-5 space-y-8">
                 
                 {/* Tasks by Module Pie Chart Simulation */}
                 <Card className="border-gray-200 shadow-sm">
                    <CardHeader className="pb-2 border-b border-gray-100">
                       <CardTitle className="text-lg font-bold text-gray-900">Tasks by Module</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                       <div className="flex items-center gap-8">
                          <div className="relative w-40 h-40 rounded-full shrink-0" 
                             style={{ 
                                background: 'conic-gradient(#10B981 0% 25%, #3B82F6 25% 45%, #F59E0B 45% 60%, #8B5CF6 60% 80%, #EF4444 80% 90%, #6B7280 90% 100%)' 
                             }}
                          >
                             <div className="absolute inset-8 bg-white rounded-full flex items-center justify-center flex-col">
                                <span className="text-2xl font-bold text-gray-900">47</span>
                                <span className="text-[10px] text-gray-500 uppercase font-bold">Total</span>
                             </div>
                          </div>
                          <div className="space-y-2 text-xs flex-1">
                             <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full" /> <span>Acquisition (25%)</span></div></div>
                             <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full" /> <span>Construction (20%)</span></div></div>
                             <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2 h-2 bg-amber-500 rounded-full" /> <span>Finance (15%)</span></div></div>
                             <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2 h-2 bg-purple-500 rounded-full" /> <span>Sales (20%)</span></div></div>
                             <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full" /> <span>Investors (10%)</span></div></div>
                             <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2 h-2 bg-gray-500 rounded-full" /> <span>Admin (10%)</span></div></div>
                          </div>
                       </div>
                    </CardContent>
                 </Card>

                 {/* Upcoming Calendar */}
                 <Card className="border-gray-200 shadow-sm">
                    <CardHeader className="pb-3 border-b border-gray-100">
                       <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <CalendarIcon className="w-5 h-5 text-gray-400" /> Upcoming
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                       <div className="divide-y divide-gray-100">
                          {upcomingEvents.map(evt => (
                             <div key={evt.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-bold text-lg border",
                                   evt.type === 'meeting' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                   evt.type === 'showing' ? "bg-purple-50 text-purple-600 border-purple-100" :
                                   "bg-red-50 text-red-600 border-red-100"
                                )}>
                                   {evt.time.includes('All Day') ? '!' : evt.time.split(' ')[0].split(':')[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                   <p className="text-sm font-bold text-gray-900 truncate">{evt.title}</p>
                                   <p className="text-xs text-gray-500">{evt.time}</p>
                                </div>
                             </div>
                          ))}
                       </div>
                    </CardContent>
                 </Card>

                 {/* Sales Pipeline Mini */}
                 <Card className="border-gray-200 shadow-sm">
                    <CardHeader className="pb-3 border-b border-gray-100">
                       <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-gray-400" /> Sales Pipeline
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                       <div className="grid grid-cols-2 gap-3">
                          {salesPipeline.map((stage, i) => (
                             <div key={i} className="p-3 bg-gray-50 rounded border border-gray-100 text-center">
                                <div className={cn("w-2 h-2 rounded-full mx-auto mb-1", stage.color)} />
                                <div className="text-xl font-bold text-gray-900">{stage.count}</div>
                                <div className="text-[10px] text-gray-500 uppercase font-bold">{stage.label}</div>
                             </div>
                          ))}
                       </div>
                    </CardContent>
                 </Card>

              </div>
           </div>

           {/* Quick Links Grid - Still keeping it as an additional resource, but renamed to "More Tools" */}
           <div className="mt-8">
               <h3 className="text-lg font-bold text-gray-900 mb-4">More Tools</h3>
               <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                     { label: 'Manage Tasks', icon: CheckSquare, path: '/operations/tasks', color: 'text-blue-600' },
                     { label: 'View Listings', icon: Home, path: '/operations/sales/listings', color: 'text-emerald-600' },
                     { label: 'Manage Agents', icon: Users, path: '/operations/sales/agents', color: 'text-amber-600' },
                     { label: 'View Calendar', icon: CalendarIcon, path: '/operations/calendar', color: 'text-purple-600' },
                     { label: 'Run Report', icon: FileText, path: '/reports', color: 'text-gray-600' },
                  ].map((link, i) => (
                     <div 
                        key={i} 
                        onClick={() => navigate(link.path)}
                        className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group"
                     >
                        <div className={cn("p-2 rounded-full bg-gray-50 group-hover:bg-white group-hover:scale-110 transition-all", link.color)}>
                           <link.icon className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">{link.label}</span>
                     </div>
                  ))}
               </div>
           </div>
        </div>
      </div>
    </>
  );
};

export default OperationsDashboard;