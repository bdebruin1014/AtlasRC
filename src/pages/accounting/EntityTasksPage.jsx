import React, { useState } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, CheckCircle2, Clock, AlertCircle, MoreHorizontal,
  Calendar, User, Tag, Trash2, Edit, CheckSquare, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import TaskFormModal from '@/components/accounting/TaskFormModal';

// Demo tasks for fallback
const demoTasks = [
  { id: 1, title: 'Complete Q4 reconciliation', description: 'Reconcile all bank accounts for Q4', status: 'in_progress', priority: 'high', category: 'reconciliation', due_date: '2024-12-31', assigned_to: 'John Smith', created_at: '2024-12-15' },
  { id: 2, title: 'Review expense reports', description: 'Review and approve pending expense reports', status: 'pending', priority: 'medium', category: 'accounting', due_date: '2024-12-28', assigned_to: 'Jane Doe', created_at: '2024-12-20' },
  { id: 3, title: 'Prepare tax documents', description: 'Gather documents for annual tax filing', status: 'pending', priority: 'high', category: 'tax', due_date: '2025-01-15', assigned_to: 'Mike Johnson', created_at: '2024-12-22' },
  { id: 4, title: 'Update vendor records', description: 'Update W-9 forms for active vendors', status: 'completed', priority: 'low', category: 'compliance', due_date: '2024-12-20', assigned_to: 'Sarah Williams', created_at: '2024-12-10' },
  { id: 5, title: 'Generate monthly financial report', description: 'Create December financial statements', status: 'pending', priority: 'urgent', category: 'reporting', due_date: '2025-01-05', assigned_to: 'John Smith', created_at: '2024-12-25' },
];

const priorityColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const statusConfig = {
  pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50', label: 'Pending' },
  in_progress: { icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-50', label: 'In Progress' },
  completed: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50', label: 'Completed' },
  cancelled: { icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-50', label: 'Cancelled' },
};

const fetchTasks = async (entityId) => {
  try {
    const { data, error } = await supabase
      .from('entity_tasks')
      .select('*')
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (data && !error) {
      return data;
    }
  } catch (err) {
    console.error('Error fetching tasks:', err);
  }

  // Return demo data as fallback
  return demoTasks;
};

export default function EntityTasksPage() {
  const { entityId } = useParams();
  const context = useOutletContext();
  const entity = context?.entity;
  const queryClient = useQueryClient();

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['entity-tasks', entityId],
    queryFn: () => fetchTasks(entityId),
    enabled: !!entityId,
  });

  const deleteTask = useMutation({
    mutationFn: async (taskId) => {
      const { error } = await supabase
        .from('entity_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['entity-tasks', entityId]);
      queryClient.invalidateQueries(['entity-task-count', entityId]);
    },
  });

  const toggleComplete = useMutation({
    mutationFn: async ({ taskId, currentStatus }) => {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      const { data, error } = await supabase
        .from('entity_tasks')
        .update({ status: newStatus })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['entity-tasks', entityId]);
      queryClient.invalidateQueries(['entity-task-count', entityId]);
    },
  });

  const filteredTasks = tasks.filter((task) => {
    // Apply status filter
    if (filter === 'active' && (task.status === 'completed' || task.status === 'cancelled')) return false;
    if (filter === 'completed' && task.status !== 'completed') return false;
    if (filter !== 'all' && filter !== 'active' && filter !== 'completed' && task.status !== filter) return false;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        task.title?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.assigned_to?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleCloseModal = () => {
    setShowTaskModal(false);
    setEditingTask(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'completed' || status === 'cancelled') return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">
            Manage tasks for {entity?.name || entity?.short_name || 'this entity'}
          </p>
        </div>
        <Button onClick={() => setShowTaskModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{taskStats.total}</p>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{taskStats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{taskStats.inProgress}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{taskStats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'active', label: 'Active' },
            { key: 'pending', label: 'Pending' },
            { key: 'in_progress', label: 'In Progress' },
            { key: 'completed', label: 'Completed' },
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={filter === tab.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks ({filteredTasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No tasks found</h3>
              <p className="text-muted-foreground mb-4">
                {filter === 'all' && !searchQuery
                  ? 'Create your first task to get started.'
                  : 'No tasks match the current filter.'}
              </p>
              {filter === 'all' && !searchQuery && (
                <Button onClick={() => setShowTaskModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {filteredTasks.map((task) => {
                const StatusIcon = statusConfig[task.status]?.icon || Clock;
                const overdue = isOverdue(task.due_date, task.status);

                return (
                  <div
                    key={task.id}
                    className={cn(
                      "py-4 flex items-start gap-4",
                      task.status === 'completed' && 'opacity-60'
                    )}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleComplete.mutate({ taskId: task.id, currentStatus: task.status })}
                      className={cn(
                        "mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                        task.status === 'completed'
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 hover:border-green-500'
                      )}
                    >
                      {task.status === 'completed' && (
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      )}
                    </button>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className={cn(
                            "font-medium",
                            task.status === 'completed' && 'line-through'
                          )}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditTask(task)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteTask.mutate(task.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <Badge variant="outline" className={priorityColors[task.priority]}>
                          {task.priority}
                        </Badge>

                        <Badge variant="outline" className={cn(statusConfig[task.status]?.bg, statusConfig[task.status]?.color)}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig[task.status]?.label}
                        </Badge>

                        {task.category && (
                          <span className="flex items-center text-xs text-muted-foreground">
                            <Tag className="w-3 h-3 mr-1" />
                            {task.category}
                          </span>
                        )}

                        {task.due_date && (
                          <span className={cn(
                            "flex items-center text-xs",
                            overdue ? 'text-red-600 font-medium' : 'text-muted-foreground'
                          )}>
                            <Calendar className="w-3 h-3 mr-1" />
                            {overdue && 'Overdue: '}
                            {formatDate(task.due_date)}
                          </span>
                        )}

                        {task.assigned_to && (
                          <span className="flex items-center text-xs text-muted-foreground">
                            <User className="w-3 h-3 mr-1" />
                            {task.assigned_to}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Form Modal */}
      <TaskFormModal
        open={showTaskModal}
        onClose={handleCloseModal}
        entityId={entityId}
        task={editingTask}
      />
    </div>
  );
}
