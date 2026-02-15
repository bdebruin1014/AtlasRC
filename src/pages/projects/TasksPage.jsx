import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit2, X, CheckCircle, Circle, Calendar, User, ChevronDown, ChevronRight, ArrowUp, ArrowRight, ArrowDown, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getTasks, createTask, deleteTask, toggleTaskStatus as toggleTaskStatusService, getTaskStats, TASK_CATEGORIES } from '@/services/taskService';

const TasksPage = ({ projectId }) => {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState(['construction', 'sales', 'admin', 'finance', 'legal', 'other']);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, completed: 0, overdue: 0 });

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const [tasksData, statsData] = await Promise.all([
        getTasks(projectId),
        getTaskStats(projectId),
      ]);
      setTasks(tasksData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
    setLoading(false);
  };

  const categories = [
    { id: 'construction', name: 'Construction', color: 'bg-orange-500' },
    { id: 'sales', name: 'Sales & Marketing', color: 'bg-pink-500' },
    { id: 'admin', name: 'Administrative', color: 'bg-purple-500' },
    { id: 'finance', name: 'Finance', color: 'bg-green-500' },
    { id: 'legal', name: 'Legal', color: 'bg-blue-500' },
    { id: 'other', name: 'Other', color: 'bg-gray-500' },
  ];

  const assignees = ['Bryan De Bruin', 'Mike Williams', 'Sarah Mitchell', 'Sarah Agent', 'Dave Brown'];

  const [newTask, setNewTask] = useState({
    title: '',
    category: 'construction',
    priority: 'medium',
    assignee: '',
    dueDate: '',
    description: '',
    tags: '',
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'todo': return 'bg-gray-100 text-gray-700';
      case 'blocked': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return <ArrowUp className="w-4 h-4 text-red-600" />;
      case 'high': return <ArrowUp className="w-4 h-4 text-red-500" />;
      case 'medium': return <ArrowRight className="w-4 h-4 text-amber-500" />;
      case 'low': return <ArrowDown className="w-4 h-4 text-gray-400" />;
      default: return <ArrowRight className="w-4 h-4 text-gray-400" />;
    }
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(c => c !== categoryId) : [...prev, categoryId]
    );
  };

  const handleToggleTaskStatus = async (taskId, currentStatus) => {
    try {
      await toggleTaskStatusService(taskId, currentStatus);
      await loadTasks();
      // Update selectedTask if it's the one being toggled
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(prev => ({
          ...prev,
          status: currentStatus === 'completed' ? 'todo' : 'completed',
          completed_date: currentStatus === 'completed' ? null : new Date().toISOString().split('T')[0],
        }));
      }
    } catch (error) {
      console.error('Error toggling task status:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      setSelectedTask(null);
      await loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesAssignee = filterAssignee === 'all' || task.assigned_to_name === filterAssignee;
    return matchesStatus && matchesPriority && matchesAssignee;
  });

  const isOverdue = (dueDate, status) => {
    if (status === 'completed' || !dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const isDueSoon = (dueDate, status) => {
    if (status === 'completed' || !dueDate) return false;
    const due = new Date(dueDate);
    const today = new Date();
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diff <= 3 && diff >= 0;
  };

  const handleCreateTask = async () => {
    try {
      await createTask({
        project_id: projectId,
        title: newTask.title,
        category: newTask.category,
        priority: newTask.priority,
        assigned_to_name: newTask.assignee,
        due_date: newTask.dueDate || null,
        description: newTask.description,
        tags: newTask.tags ? newTask.tags.split(',').map(t => t.trim()) : [],
      });
      setShowTaskModal(false);
      setNewTask({ title: '', category: 'construction', priority: 'medium', assignee: '', dueDate: '', description: '', tags: '' });
      await loadTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Tasks</h1>
          <p className="text-sm text-gray-500">{stats.total} tasks • {stats.overdue > 0 && <span className="text-red-500">{stats.overdue} overdue</span>}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowTaskModal(true)}>
            <Plus className="w-4 h-4 mr-1" />Add Task
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Total Tasks</p>
          <p className="text-2xl font-semibold">{stats.total}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-gray-400">
          <p className="text-xs text-gray-500">To Do</p>
          <p className="text-2xl font-semibold">{stats.todo}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-xs text-gray-500">In Progress</p>
          <p className="text-2xl font-semibold text-blue-600">{stats.inProgress}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-xs text-gray-500">Completed</p>
          <p className="text-2xl font-semibold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-red-500">
          <p className="text-xs text-gray-500">Overdue</p>
          <p className="text-2xl font-semibold text-red-600">{stats.overdue}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search tasks..." className="pl-9" />
          </div>
          <select className="border rounded-md px-3 py-2 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>
          <select className="border rounded-md px-3 py-2 text-sm" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select className="border rounded-md px-3 py-2 text-sm" value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)}>
            <option value="all">All Assignees</option>
            {assignees.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List by Category */}
      <div className="space-y-4">
        {categories.map(category => {
          const categoryTasks = filteredTasks.filter(t => t.category === category.id);
          const isExpanded = expandedCategories.includes(category.id);

          if (categoryTasks.length === 0 && !isExpanded) return null;

          return (
            <div key={category.id} className="bg-white border rounded-lg overflow-hidden">
              <div
                className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <div className={cn("w-3 h-3 rounded-full", category.color)}></div>
                  <span className="font-semibold">{category.name}</span>
                  <span className="text-sm text-gray-500">({categoryTasks.length})</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{categoryTasks.filter(t => t.status === 'completed').length} completed</span>
                </div>
              </div>

              {isExpanded && (
                <div className="divide-y">
                  {categoryTasks.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">No tasks in this category</div>
                  ) : (
                    categoryTasks.map(task => (
                      <div key={task.id} className={cn("flex items-center gap-4 p-4 hover:bg-gray-50", task.status === 'completed' && "opacity-60")}>
                        <button onClick={() => handleToggleTaskStatus(task.id, task.status)}>
                          {task.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300 hover:text-gray-400" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={cn("font-medium", task.status === 'completed' && "line-through text-gray-500")}>{task.title}</p>
                            {getPriorityIcon(task.priority)}
                            {isOverdue(task.due_date, task.status) && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">Overdue</span>
                            )}
                            {isDueSoon(task.due_date, task.status) && !isOverdue(task.due_date, task.status) && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">Due Soon</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            {task.assigned_to_name && <span className="flex items-center gap-1"><User className="w-3 h-3" />{task.assigned_to_name}</span>}
                            {task.due_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{task.due_date}</span>}
                            {task.checklist && task.checklist.length > 0 && (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                {task.checklist.filter(c => c.done).length}/{task.checklist.length}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(task.status))}>
                          {task.status.replace('-', ' ')}
                        </span>
                        <button className="p-1 hover:bg-gray-100 rounded" onClick={() => setSelectedTask(task)}>
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">Add Task</h3>
              <button onClick={() => setShowTaskModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Title *</label>
                <Input value={newTask.title} onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))} placeholder="Task title" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Category</label>
                  <select className="w-full border rounded-md px-3 py-2" value={newTask.category} onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value }))}>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Priority</label>
                  <select className="w-full border rounded-md px-3 py-2" value={newTask.priority} onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Assignee</label>
                  <select className="w-full border rounded-md px-3 py-2" value={newTask.assignee} onChange={(e) => setNewTask(prev => ({ ...prev, assignee: e.target.value }))}>
                    <option value="">Select...</option>
                    {assignees.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Due Date</label>
                  <Input type="date" value={newTask.dueDate} onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description</label>
                <textarea className="w-full border rounded-md px-3 py-2" rows={3} value={newTask.description} onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))} placeholder="Task description..." />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Tags</label>
                <Input value={newTask.tags} onChange={(e) => setNewTask(prev => ({ ...prev, tags: e.target.value }))} placeholder="inspection, urgent, etc. (comma separated)" />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 sticky bottom-0">
              <Button variant="outline" onClick={() => setShowTaskModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleCreateTask} disabled={!newTask.title.trim()}>Add Task</Button>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{selectedTask.task_number || selectedTask.id}</span>
                {getPriorityIcon(selectedTask.priority)}
              </div>
              <button onClick={() => setSelectedTask(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <button onClick={() => handleToggleTaskStatus(selectedTask.id, selectedTask.status)}>
                  {selectedTask.status === 'completed' ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-300" />
                  )}
                </button>
                <h3 className={cn("text-lg font-semibold", selectedTask.status === 'completed' && "line-through text-gray-500")}>
                  {selectedTask.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(selectedTask.status))}>
                  {selectedTask.status.replace('-', ' ')}
                </span>
                <span className="px-2 py-1 rounded text-xs bg-gray-100 capitalize">{selectedTask.priority} priority</span>
                {isOverdue(selectedTask.due_date, selectedTask.status) && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">Overdue</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Assignee</p>
                  <p className="font-medium">{selectedTask.assigned_to_name || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Due Date</p>
                  <p className="font-medium">{selectedTask.due_date || 'No date'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Created</p>
                  <p className="font-medium">{selectedTask.created_at ? new Date(selectedTask.created_at).toLocaleDateString() : '-'}</p>
                </div>
                {selectedTask.completed_date && (
                  <div>
                    <p className="text-gray-500">Completed</p>
                    <p className="font-medium">{selectedTask.completed_date}</p>
                  </div>
                )}
              </div>

              {selectedTask.description && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-sm">{selectedTask.description}</p>
                </div>
              )}

              {selectedTask.checklist && selectedTask.checklist.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Checklist ({selectedTask.checklist.filter(c => c.done).length}/{selectedTask.checklist.length})</p>
                  <div className="space-y-2">
                    {selectedTask.checklist.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {item.done ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-300" />
                        )}
                        <span className={cn("text-sm", item.done && "line-through text-gray-500")}>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTask.tags && selectedTask.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {selectedTask.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
              <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDeleteTask(selectedTask.id)}>
                <Trash2 className="w-4 h-4 mr-1" />Delete
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedTask(null)}>Close</Button>
                <Button className="bg-[#047857] hover:bg-[#065f46]"><Edit2 className="w-4 h-4 mr-1" />Edit</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
