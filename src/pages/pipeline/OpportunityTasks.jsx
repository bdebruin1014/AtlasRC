import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, Clock, AlertCircle, Plus, Edit2, Trash2,
  MoreVertical, Calendar, User, Flag, Loader2, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const TASK_STATUSES = [
  { id: 'pending', name: 'Pending', icon: AlertCircle, color: 'bg-gray-100 text-gray-600' },
  { id: 'in-progress', name: 'In Progress', icon: Clock, color: 'bg-blue-100 text-blue-600' },
  { id: 'complete', name: 'Complete', icon: CheckCircle2, color: 'bg-green-100 text-green-600' },
];

const TASK_PRIORITIES = [
  { id: 'low', name: 'Low', color: 'bg-gray-100 text-gray-600' },
  { id: 'medium', name: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'high', name: 'High', color: 'bg-red-100 text-red-700' },
];

const DD_TASK_TEMPLATES = [
  { task: 'Order Phase I Environmental', category: 'Environmental' },
  { task: 'Review title commitment', category: 'Title' },
  { task: 'Order survey', category: 'Survey' },
  { task: 'Geotechnical study', category: 'Engineering' },
  { task: 'Traffic impact analysis', category: 'Engineering' },
  { task: 'Utility availability letters', category: 'Utilities' },
  { task: 'Preliminary site plan', category: 'Design' },
  { task: 'Zoning verification', category: 'Entitlements' },
  { task: 'HOA/Restrictions review', category: 'Legal' },
  { task: 'Boundary confirmation', category: 'Survey' },
];

export default function OpportunityTasks({ opportunity }) {
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // Dialog state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    task: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: '',
    assigned_to: '',
  });

  const opportunityId = opportunity?.id;

  // Load tasks
  useEffect(() => {
    if (opportunityId) {
      loadTasks();
    } else {
      setTasks(getDemoTasks());
      setLoading(false);
    }
  }, [opportunityId]);

  const getDemoTasks = () => [
    { id: '1', task: 'Order Phase I Environmental', status: 'complete', due_date: '2025-01-20', priority: 'high', assigned_to: 'John Smith' },
    { id: '2', task: 'Review title commitment', status: 'complete', due_date: '2025-01-22', priority: 'high', assigned_to: 'Jane Doe' },
    { id: '3', task: 'Survey ordered', status: 'in-progress', due_date: '2025-02-05', priority: 'medium', assigned_to: 'John Smith' },
    { id: '4', task: 'Geotechnical study', status: 'in-progress', due_date: '2025-02-08', priority: 'medium', assigned_to: 'Field Team' },
    { id: '5', task: 'Traffic impact analysis', status: 'pending', due_date: '2025-02-10', priority: 'low', assigned_to: '' },
    { id: '6', task: 'Utility availability letters', status: 'pending', due_date: '2025-02-12', priority: 'medium', assigned_to: '' },
    { id: '7', task: 'Preliminary site plan', status: 'pending', due_date: '2025-02-14', priority: 'low', assigned_to: '' },
  ];

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('opportunity_tasks')
        .select('*')
        .eq('opportunity_id', opportunityId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setTasks(getDemoTasks());
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      task: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      due_date: '',
      assigned_to: '',
    });
  };

  const handleAdd = () => {
    resetForm();
    setEditingTask(null);
    setShowAddDialog(true);
  };

  const handleEdit = (task) => {
    setFormData({
      task: task.task || '',
      description: task.description || '',
      status: task.status || 'pending',
      priority: task.priority || 'medium',
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      assigned_to: task.assigned_to || '',
    });
    setEditingTask(task);
    setShowAddDialog(true);
  };

  const handleSave = async () => {
    if (!formData.task.trim()) {
      toast({ title: 'Task required', description: 'Please enter a task description.', variant: 'destructive' });
      return;
    }

    setSaving(true);

    try {
      const taskData = {
        opportunity_id: opportunityId,
        task: formData.task,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date || null,
        assigned_to: formData.assigned_to,
      };

      if (editingTask) {
        if (opportunityId && supabase) {
          const { error } = await supabase
            .from('opportunity_tasks')
            .update(taskData)
            .eq('id', editingTask.id);
          if (error) throw error;
        }

        setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...taskData } : t));
        toast({ title: 'Task Updated', description: 'Task has been updated.' });
      } else {
        let newTask;

        if (opportunityId && supabase) {
          const { data, error } = await supabase
            .from('opportunity_tasks')
            .insert(taskData)
            .select()
            .single();
          if (error) throw error;
          newTask = data;
        } else {
          newTask = { id: Date.now(), ...taskData, created_at: new Date().toISOString() };
        }

        setTasks(prev => [...prev, newTask]);
        toast({ title: 'Task Added', description: 'New task has been added.' });
      }

      setShowAddDialog(false);
      resetForm();
      setEditingTask(null);

    } catch (err) {
      console.error('Save error:', err);
      toast({ title: 'Save Failed', description: 'There was an error saving the task.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (task) => {
    if (!confirm(`Are you sure you want to delete "${task.task}"?`)) return;

    try {
      if (opportunityId && supabase) {
        const { error } = await supabase.from('opportunity_tasks').delete().eq('id', task.id);
        if (error) throw error;
      }

      setTasks(prev => prev.filter(t => t.id !== task.id));
      toast({ title: 'Task Deleted', description: 'Task has been removed.' });
    } catch (err) {
      console.error('Delete error:', err);
      toast({ title: 'Delete Failed', description: 'There was an error deleting the task.', variant: 'destructive' });
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      if (opportunityId && supabase) {
        const { error } = await supabase
          .from('opportunity_tasks')
          .update({ status: newStatus })
          .eq('id', task.id);
        if (error) throw error;
      }

      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
      toast({ title: 'Status Updated', description: `Task marked as ${newStatus.replace('-', ' ')}.` });
    } catch (err) {
      console.error('Status change error:', err);
    }
  };

  const handleAddFromTemplate = async (template) => {
    const taskData = {
      opportunity_id: opportunityId,
      task: template.task,
      description: `${template.category} - Due diligence task`,
      status: 'pending',
      priority: 'medium',
      due_date: null,
      assigned_to: '',
    };

    let newTask;

    if (opportunityId && supabase) {
      try {
        const { data, error } = await supabase
          .from('opportunity_tasks')
          .insert(taskData)
          .select()
          .single();
        if (error) throw error;
        newTask = data;
      } catch (err) {
        newTask = { id: Date.now(), ...taskData, created_at: new Date().toISOString() };
      }
    } else {
      newTask = { id: Date.now(), ...taskData, created_at: new Date().toISOString() };
    }

    setTasks(prev => [...prev, newTask]);
    toast({ title: 'Task Added', description: `"${template.task}" has been added.` });
  };

  const filteredTasks = tasks.filter(task =>
    filterStatus === 'all' || task.status === filterStatus
  );

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const statusOrder = { 'in-progress': 0, 'pending': 1, 'complete': 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (dateStr, status) => {
    if (!dateStr || status === 'complete') return false;
    return new Date(dateStr) < new Date();
  };

  const getStatusIcon = (status) => {
    const statusConfig = TASK_STATUSES.find(s => s.id === status);
    return statusConfig?.icon || AlertCircle;
  };

  const getStatusColor = (status) => {
    const statusConfig = TASK_STATUSES.find(s => s.id === status);
    return statusConfig?.color || 'bg-gray-100 text-gray-600';
  };

  const getPriorityColor = (priority) => {
    const priorityConfig = TASK_PRIORITIES.find(p => p.id === priority);
    return priorityConfig?.color || 'bg-gray-100 text-gray-600';
  };

  const completedCount = tasks.filter(t => t.status === 'complete').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading tasks...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Tasks & Checklist</h2>
          <p className="text-sm text-gray-500">
            {completedCount} of {tasks.length} tasks complete ({progressPercent}%)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowTemplateDialog(true)}>
            <Plus className="w-4 h-4 mr-1" />
            From Template
          </Button>
          <Button onClick={handleAdd} className="bg-[#047857] hover:bg-[#065f46]">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Due Diligence Progress</span>
          <span className="text-sm text-gray-500">{progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#047857] h-2 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4 mb-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="complete">Complete</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {sortedTasks.map((task) => {
          const StatusIcon = getStatusIcon(task.status);
          const overdue = isOverdue(task.due_date, task.status);

          return (
            <div
              key={task.id}
              className={cn(
                "bg-white border rounded-lg p-4 flex items-center justify-between",
                task.status === 'complete' && "opacity-60"
              )}
            >
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => {
                    const nextStatus = task.status === 'pending' ? 'in-progress' :
                      task.status === 'in-progress' ? 'complete' : 'pending';
                    handleStatusChange(task, nextStatus);
                  }}
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                    getStatusColor(task.status)
                  )}
                >
                  <StatusIcon className="w-4 h-4" />
                </button>
                <div className="flex-1">
                  <span className={cn(
                    "font-medium",
                    task.status === 'complete' && 'line-through text-gray-400'
                  )}>
                    {task.task}
                  </span>
                  {task.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {task.priority && (
                  <Badge className={cn("text-xs", getPriorityColor(task.priority))}>
                    {task.priority}
                  </Badge>
                )}
                {task.assigned_to && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <User className="w-3 h-3" />
                    {task.assigned_to}
                  </div>
                )}
                <div className={cn(
                  "flex items-center gap-1 text-sm",
                  overdue ? "text-red-600 font-medium" : "text-gray-500"
                )}>
                  <Calendar className="w-3 h-3" />
                  {formatDate(task.due_date)}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(task)}>
                      <Edit2 className="w-4 h-4 mr-2" />Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleStatusChange(task, 'pending')}>
                      <AlertCircle className="w-4 h-4 mr-2" />Mark Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(task, 'in-progress')}>
                      <Clock className="w-4 h-4 mr-2" />Mark In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(task, 'complete')}>
                      <CheckCircle2 className="w-4 h-4 mr-2" />Mark Complete
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(task)}>
                      <Trash2 className="w-4 h-4 mr-2" />Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}

        {sortedTasks.length === 0 && (
          <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No tasks yet</p>
            <p className="text-sm mt-1">Add tasks to track due diligence items and deadlines.</p>
            <div className="flex justify-center gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowTemplateDialog(true)}>
                <Plus className="w-4 h-4 mr-1" />From Template
              </Button>
              <Button onClick={handleAdd} className="bg-[#047857] hover:bg-[#065f46]">
                <Plus className="w-4 h-4 mr-2" />Add Task
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Add Task'}</DialogTitle>
            <DialogDescription>
              {editingTask ? 'Update task details' : 'Add a new task for this opportunity'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Task *</Label>
              <Input
                value={formData.task}
                onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                placeholder="Task description"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional details..."
                className="mt-1"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TASK_STATUSES.map(s => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TASK_PRIORITIES.map(p => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Assigned To</Label>
                <Input
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                  placeholder="Team member"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#047857] hover:bg-[#065f46]">
              {saving ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>) : (editingTask ? 'Update Task' : 'Add Task')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add from Templates</DialogTitle>
            <DialogDescription>
              Quick-add common due diligence tasks
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 max-h-80 overflow-y-auto">
            <div className="space-y-2">
              {DD_TASK_TEMPLATES.map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    handleAddFromTemplate(template);
                  }}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                >
                  <div>
                    <p className="font-medium text-gray-900">{template.task}</p>
                    <p className="text-xs text-gray-500">{template.category}</p>
                  </div>
                  <Plus className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
