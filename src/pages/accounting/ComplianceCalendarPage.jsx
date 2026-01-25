import React, { useState, useMemo } from 'react';
import {
  Calendar, CheckCircle, Clock, AlertTriangle, AlertCircle,
  ChevronLeft, ChevronRight, FileText, Bell, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const mockDeadlines = [
  { id: 1, task: 'Monthly Bank Reconciliations', dueDate: '2024-02-05', entity: 'All Entities', category: 'Reconciliation', status: 'upcoming', assignee: 'Mike Chen', recurring: 'Monthly' },
  { id: 2, task: 'Property Tax Payment - Riverside', dueDate: '2024-02-01', entity: 'Riverside Plaza LLC', category: 'Tax', status: 'due_today', assignee: 'Lisa Wang', recurring: 'Quarterly' },
  { id: 3, task: 'Quarterly Sales Tax Filing - TX', dueDate: '2024-02-15', entity: 'Atlas Holdings LLC', category: 'Tax', status: 'upcoming', assignee: 'John Smith', recurring: 'Quarterly' },
  { id: 4, task: 'W-2 Distribution to Employees', dueDate: '2024-01-31', entity: 'All Entities', category: 'Payroll', status: 'completed', assignee: 'HR Team', recurring: 'Annual' },
  { id: 5, task: 'Monthly Financial Close', dueDate: '2024-02-10', entity: 'All Entities', category: 'Close', status: 'upcoming', assignee: 'Controller', recurring: 'Monthly' },
  { id: 6, task: '1099 Filing Deadline', dueDate: '2024-01-31', entity: 'All Entities', category: 'Tax', status: 'completed', assignee: 'John Smith', recurring: 'Annual' },
  { id: 7, task: 'Quarterly LP Reporting', dueDate: '2024-02-15', entity: 'All Funds', category: 'Reporting', status: 'upcoming', assignee: 'Sarah Johnson', recurring: 'Quarterly' },
  { id: 8, task: 'Insurance Renewal - Downtown Tower', dueDate: '2024-02-28', entity: 'Downtown Tower LLC', category: 'Insurance', status: 'upcoming', assignee: 'Risk Team', recurring: 'Annual' },
  { id: 9, task: 'Mortgage Payment - Riverside', dueDate: '2024-02-01', entity: 'Riverside Plaza LLC', category: 'Debt Service', status: 'due_today', assignee: 'Treasury', recurring: 'Monthly' },
  { id: 10, task: 'Credit Card Statement Reconciliation', dueDate: '2024-01-28', entity: 'All Entities', category: 'Reconciliation', status: 'overdue', assignee: 'Tom Davis', recurring: 'Monthly' }
];

const categoryColors = {
  'Tax': 'bg-red-100 text-red-800',
  'Reconciliation': 'bg-blue-100 text-blue-800',
  'Payroll': 'bg-green-100 text-green-800',
  'Close': 'bg-purple-100 text-purple-800',
  'Reporting': 'bg-orange-100 text-orange-800',
  'Insurance': 'bg-teal-100 text-teal-800',
  'Debt Service': 'bg-yellow-100 text-yellow-800'
};

const statusConfig = {
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  due_today: { label: 'Due Today', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
  upcoming: { label: 'Upcoming', color: 'bg-blue-100 text-blue-800', icon: Clock },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-800', icon: AlertCircle }
};

export default function ComplianceCalendarPage() {
  const [selectedMonth, setSelectedMonth] = useState('February 2024');
  const [filter, setFilter] = useState('all');

  const filteredDeadlines = useMemo(() => {
    if (filter === 'all') return mockDeadlines;
    return mockDeadlines.filter(d => d.status === filter);
  }, [filter]);

  const stats = useMemo(() => ({
    dueToday: mockDeadlines.filter(d => d.status === 'due_today').length,
    overdue: mockDeadlines.filter(d => d.status === 'overdue').length,
    upcoming: mockDeadlines.filter(d => d.status === 'upcoming').length,
    completed: mockDeadlines.filter(d => d.status === 'completed').length
  }), []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Calendar</h1>
          <p className="text-gray-600">Track regulatory and operational deadlines</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Bell className="w-4 h-4 mr-2" />Manage Reminders</Button>
          <Button className="bg-blue-600 hover:bg-blue-700"><Calendar className="w-4 h-4 mr-2" />Add Deadline</Button>
        </div>
      </div>

      {(stats.overdue > 0 || stats.dueToday > 0) && (
        <div className={cn("border rounded-lg p-4", stats.overdue > 0 ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-200")}>
          <div className="flex items-center gap-3">
            <AlertCircle className={cn("w-6 h-6", stats.overdue > 0 ? "text-red-600" : "text-orange-600")} />
            <div>
              <p className={cn("font-semibold", stats.overdue > 0 ? "text-red-900" : "text-orange-900")}>
                {stats.overdue > 0 ? `${stats.overdue} Overdue Item(s)` : `${stats.dueToday} Item(s) Due Today`}
              </p>
              <p className={cn("text-sm", stats.overdue > 0 ? "text-red-700" : "text-orange-700")}>
                Please review and complete these items urgently.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-orange-600">{stats.dueToday}</p>
          <p className="text-sm text-gray-600">Due Today</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
          <p className="text-sm text-gray-600">Overdue</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
          <p className="text-sm text-gray-600">Upcoming</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-sm text-gray-600">Completed</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['all', 'due_today', 'overdue', 'upcoming', 'completed'].map((f) => (
            <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f === 'due_today' ? 'Due Today' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><ChevronLeft className="w-4 h-4" /></Button>
          <span className="font-medium text-gray-900">{selectedMonth}</span>
          <Button variant="outline" size="sm"><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-sm text-gray-500">
              <th className="p-4">Task</th>
              <th className="p-4">Due Date</th>
              <th className="p-4">Entity</th>
              <th className="p-4">Category</th>
              <th className="p-4">Assignee</th>
              <th className="p-4">Frequency</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeadlines.map((deadline) => (
              <tr key={deadline.id} className={cn("border-b hover:bg-gray-50", deadline.status === 'overdue' && "bg-red-50")}>
                <td className="p-4 font-medium text-gray-900">{deadline.task}</td>
                <td className="p-4 text-sm">
                  <span className={cn(deadline.status === 'overdue' && "text-red-600 font-medium")}>{deadline.dueDate}</span>
                </td>
                <td className="p-4 text-sm text-gray-600">{deadline.entity}</td>
                <td className="p-4">
                  <span className={cn("px-2 py-0.5 rounded text-xs", categoryColors[deadline.category])}>
                    {deadline.category}
                  </span>
                </td>
                <td className="p-4 text-sm">{deadline.assignee}</td>
                <td className="p-4 text-sm text-gray-500">{deadline.recurring}</td>
                <td className="p-4">
                  <span className={cn("px-2 py-0.5 rounded text-xs flex items-center gap-1 w-fit", statusConfig[deadline.status].color)}>
                    {React.createElement(statusConfig[deadline.status].icon, { className: "w-3 h-3" })}
                    {statusConfig[deadline.status].label}
                  </span>
                </td>
                <td className="p-4">
                  {deadline.status !== 'completed' && (
                    <Button size="sm" variant="outline" className="text-green-600">Mark Complete</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
