import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Plus, Search, Filter, CheckSquare, Circle, Clock, AlertCircle,
  Calendar, User, Tag, MoreVertical, ChevronDown, Check, Users, DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const DealTasksPage = () => {
  const { dealId } = useParams();
  const [filter, setFilter] = useState('all');
  const [showCompleted, setShowCompleted] = useState(false);

  const tasks = [
    {
      id: 'task-001',
      title: 'Follow up with pending investors',
      description: 'Contact investors who have not returned subscription documents',
      status: 'in_progress',
      priority: 'high',
      dueDate: '2024-12-30',
      assignee: 'Sarah Johnson',
      category: 'investor_relations',
      completedDate: null,
    },
    {
      id: 'task-002',
      title: 'Process Q4 distributions',
      description: 'Calculate and process Q4 2024 distributions for all investors',
      status: 'pending',
      priority: 'high',
      dueDate: '2025-01-05',
      assignee: 'Mike Roberts',
      category: 'distributions',
      completedDate: null,
    },
    {
      id: 'task-003',
      title: 'Send investor update report',
      description: 'Draft and send monthly investor update with project progress',
      status: 'pending',
      priority: 'medium',
      dueDate: '2025-01-10',
      assignee: 'Sarah Johnson',
      category: 'reporting',
      completedDate: null,
    },
    {
      id: 'task-004',
      title: 'Review subscription documents',
      description: 'Review and countersign new investor subscription agreements',
      status: 'pending',
      priority: 'low',
      dueDate: '2025-01-15',
      assignee: 'Legal Team',
      category: 'subscriptions',
      completedDate: null,
    },
    {
      id: 'task-005',
      title: 'Prepare K-1 estimates',
      description: 'Work with CPA to prepare K-1 estimates for investors',
      status: 'pending',
      priority: 'high',
      dueDate: '2025-02-01',
      assignee: 'CPA Team',
      category: 'tax',
      completedDate: null,
    },
    {
      id: 'task-006',
      title: 'Capital call - 2nd tranche',
      description: 'Prepare and send capital call notices for second funding tranche',
      status: 'pending',
      priority: 'high',
      dueDate: '2025-01-20',
      assignee: 'Mike Roberts',
      category: 'capital_calls',
      completedDate: null,
    },
    {
      id: 'task-007',
      title: 'Update investor portal',
      description: 'Upload new project photos and financial reports to portal',
      status: 'pending',
      priority: 'medium',
      dueDate: '2025-01-08',
      assignee: 'Sarah Johnson',
      category: 'portal',
      completedDate: null,
    },
    {
      id: 'task-008',
      title: 'Q3 distribution processing',
      description: 'Process Q3 2024 distributions',
      status: 'completed',
      priority: 'high',
      dueDate: '2024-10-05',
      assignee: 'Mike Roberts',
      category: 'distributions',
      completedDate: '2024-10-03',
    },
    {
      id: 'task-009',
      title: 'New investor onboarding - Smith Trust',
      description: 'Complete onboarding for Smith Family Trust investor',
      status: 'completed',
      priority: 'medium',
      dueDate: '2024-12-15',
      assignee: 'Sarah Johnson',
      category: 'subscriptions',
      completedDate: '2024-12-14',
    },
  ];

  const categories = [
    { value: 'all', label: 'All Tasks' },
    { value: 'investor_relations', label: 'Investor Relations' },
    { value: 'subscriptions', label: 'Subscriptions' },
    { value: 'capital_calls', label: 'Capital Calls' },
    { value: 'distributions', label: 'Distributions' },
    { value: 'reporting', label: 'Reporting' },
    { value: 'tax', label: 'Tax' },
    { value: 'portal', label: 'Portal' },
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

  const getCategoryIcon = (category) => ({
    investor_relations: Users,
    subscriptions: Users,
    capital_calls: DollarSign,
    distributions: DollarSign,
    reporting: Tag,
    tax: Tag,
    portal: Tag,
  }[category] || Tag);

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
          <h1 className="text-2xl font-bold">Deal Tasks</h1>
          <p className="text-sm text-gray-500">Manage investor and deal-related tasks</p>
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
            const CategoryIcon = getCategoryIcon(task.category);
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
                      <CategoryIcon className="w-3 h-3" />
                      {task.category.replace(/_/g, ' ')}
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

export default DealTasksPage;
