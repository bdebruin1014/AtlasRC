import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Plus, Search, Filter, CheckSquare, Circle, Clock, AlertCircle,
  Calendar, User, Tag, MoreVertical, ChevronDown, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const EntityTasksPage = () => {
  const { entityId } = useParams();
  const [filter, setFilter] = useState('all');
  const [showCompleted, setShowCompleted] = useState(false);

  const tasks = [
    {
      id: 'task-001',
      title: 'Reconcile December bank statement',
      description: 'Complete bank reconciliation for all accounts for December 2024',
      status: 'in_progress',
      priority: 'high',
      dueDate: '2024-12-31',
      assignee: 'Sarah Johnson',
      category: 'reconciliation',
      completedDate: null,
    },
    {
      id: 'task-002',
      title: 'Review Q4 journal entries',
      description: 'Review and approve all journal entries posted in Q4',
      status: 'pending',
      priority: 'medium',
      dueDate: '2025-01-05',
      assignee: 'Mike Roberts',
      category: 'journal_entries',
      completedDate: null,
    },
    {
      id: 'task-003',
      title: 'Process vendor invoices',
      description: 'Enter and code all pending vendor invoices',
      status: 'pending',
      priority: 'medium',
      dueDate: '2025-01-02',
      assignee: 'Sarah Johnson',
      category: 'payables',
      completedDate: null,
    },
    {
      id: 'task-004',
      title: 'Prepare year-end accruals',
      description: 'Calculate and post all year-end accrual entries',
      status: 'pending',
      priority: 'high',
      dueDate: '2024-12-31',
      assignee: 'CPA Team',
      category: 'journal_entries',
      completedDate: null,
    },
    {
      id: 'task-005',
      title: 'Submit 1099 information',
      description: 'Compile and submit 1099 vendor information for tax filing',
      status: 'pending',
      priority: 'high',
      dueDate: '2025-01-15',
      assignee: 'Sarah Johnson',
      category: 'compliance',
      completedDate: null,
    },
    {
      id: 'task-006',
      title: 'Review intercompany balances',
      description: 'Reconcile all intercompany due to/from balances',
      status: 'pending',
      priority: 'medium',
      dueDate: '2025-01-10',
      assignee: 'Mike Roberts',
      category: 'intercompany',
      completedDate: null,
    },
    {
      id: 'task-007',
      title: 'November bank reconciliation',
      description: 'Complete bank reconciliation for November 2024',
      status: 'completed',
      priority: 'high',
      dueDate: '2024-12-15',
      assignee: 'Sarah Johnson',
      category: 'reconciliation',
      completedDate: '2024-12-14',
    },
    {
      id: 'task-008',
      title: 'Update chart of accounts',
      description: 'Add new expense accounts for 2025 budget categories',
      status: 'completed',
      priority: 'low',
      dueDate: '2024-12-20',
      assignee: 'Mike Roberts',
      category: 'setup',
      completedDate: '2024-12-18',
    },
  ];

  const categories = [
    { value: 'all', label: 'All Tasks' },
    { value: 'reconciliation', label: 'Reconciliation' },
    { value: 'journal_entries', label: 'Journal Entries' },
    { value: 'payables', label: 'Payables' },
    { value: 'receivables', label: 'Receivables' },
    { value: 'intercompany', label: 'Intercompany' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'reporting', label: 'Reporting' },
  ];

  const getPriorityConfig = (priority) => ({
    high: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: 'High' },
    medium: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Medium' },
    low: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Low' },
  }[priority] || { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500', label: priority });

  const getStatusConfig = (status) => ({
    pending: { icon: Circle, color: 'text-gray-400', label: 'Pending' },
    in_progress: { icon: Clock, color: 'text-blue-500', label: 'In Progress' },
    completed: { icon: CheckSquare, color: 'text-green-500', label: 'Completed' },
    overdue: { icon: AlertCircle, color: 'text-red-500', label: 'Overdue' },
  }[status] || { icon: Circle, color: 'text-gray-400', label: status });

  const isOverdue = (dueDate, status) => {
    if (status === 'completed') return false;
    return new Date(dueDate) < new Date();
  };

  const filteredTasks = tasks.filter(task => {
    if (!showCompleted && task.status === 'completed') return false;
    if (filter !== 'all' && task.category !== filter) return false;
    return true;
  });

  const pendingCount = tasks.filter(t => t.status !== 'completed').length;
  const overdueCount = tasks.filter(t => isOverdue(t.dueDate, t.status)).length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Entity Tasks</h1>
          <p className="text-sm text-gray-500">Manage accounting tasks for this entity</p>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]">
          <Plus className="w-4 h-4 mr-2" />Add Task
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tasks.length}</p>
              <p className="text-sm text-gray-500">Total Tasks</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{overdueCount}</p>
              <p className="text-sm text-gray-500">Overdue</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'completed').length}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search tasks..." className="pl-9" />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input 
            type="checkbox" 
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="rounded"
          />
          Show completed
        </label>
      </div>

      {/* Task List */}
      <div className="bg-white border rounded-lg">
        <div className="divide-y">
          {filteredTasks.map(task => {
            const priorityConfig = getPriorityConfig(task.priority);
            const statusConfig = getStatusConfig(task.status);
            const StatusIcon = statusConfig.icon;
            const overdue = isOverdue(task.dueDate, task.status);

            return (
              <div 
                key={task.id} 
                className={cn(
                  "p-4 flex items-start gap-4 hover:bg-gray-50",
                  task.status === 'completed' && "opacity-60"
                )}
              >
                <button className="mt-1">
                  <StatusIcon className={cn("w-5 h-5", statusConfig.color)} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn("font-medium", task.status === 'completed' && "line-through")}>{task.title}</p>
                    <span className={cn("px-1.5 py-0.5 rounded text-xs font-medium", priorityConfig.bg, priorityConfig.text)}>
                      {priorityConfig.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span className={cn(overdue && "text-red-600 font-medium")}>
                        {overdue ? 'Overdue: ' : 'Due: '}{task.dueDate}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {task.assignee}
                    </span>
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {task.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12 bg-white border rounded-lg">
          <CheckSquare className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-1">No tasks found</h3>
          <p className="text-sm text-gray-500 mb-4">Create your first task to get started</p>
          <Button className="bg-[#047857] hover:bg-[#065f46]">
            <Plus className="w-4 h-4 mr-2" />Add Task
          </Button>
        </div>
      )}
    </div>
  );
};

export default EntityTasksPage;
