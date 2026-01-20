import React, { useState } from 'react';
import { Plus, Search, Eye, Edit2, X, CheckCircle, Circle, Clock, Calendar, User, Flag, Tag, Filter, MoreVertical, ChevronDown, ChevronRight, AlertTriangle, ArrowUp, ArrowRight, ArrowDown, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const TasksPage = ({ projectId }) => {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'board'
  const [expandedCategories, setExpandedCategories] = useState(['construction', 'sales', 'admin']);

  const [tasks, setTasks] = useState([
    // Construction Tasks
    { id: 'TSK-001', title: 'Schedule Unit 5 framing inspection', category: 'construction', status: 'in-progress', priority: 'high', assignee: 'Mike Johnson', dueDate: '2024-12-30', createdDate: '2024-12-27', description: 'Framing is complete on Unit 5. Need to schedule inspection with city.', tags: ['inspection', 'framing'], checklist: [{ text: 'Verify framing complete', done: true }, { text: 'Call building dept', done: true }, { text: 'Confirm date/time', done: false }] },
    { id: 'TSK-002', title: 'Coordinate HVAC rough-in for Unit 4', category: 'construction', status: 'todo', priority: 'high', assignee: 'Dave Brown', dueDate: '2024-12-31', createdDate: '2024-12-26', description: 'HVAC contractor ready to start rough-in on Unit 4.', tags: ['hvac'], checklist: [] },
    { id: 'TSK-003', title: 'Order appliances for Units 2-4', category: 'construction', status: 'todo', priority: 'medium', assignee: 'Sarah Mitchell', dueDate: '2025-01-05', createdDate: '2024-12-20', description: 'Need to finalize appliance selections and place order. Lead time is 3-4 weeks.', tags: ['appliances', 'ordering'], checklist: [{ text: 'Confirm selections with buyer', done: false }, { text: 'Get final pricing', done: false }, { text: 'Place order', done: false }] },
    { id: 'TSK-004', title: 'Review electrical change order for Unit 4', category: 'construction', status: 'in-progress', priority: 'medium', assignee: 'Bryan VanRock', dueDate: '2024-12-29', createdDate: '2024-12-24', description: 'Sparks Electric submitted CO for additional circuits. Review and approve/reject.', tags: ['electrical', 'change-order'], checklist: [] },
    { id: 'TSK-005', title: 'Schedule bank inspection for Draw #13', category: 'construction', status: 'todo', priority: 'high', assignee: 'Bryan VanRock', dueDate: '2025-01-02', createdDate: '2024-12-28', description: 'Need to schedule bank inspection for next draw request.', tags: ['draw', 'inspection'], checklist: [] },
    
    // Sales Tasks
    { id: 'TSK-006', title: 'Follow up with Jennifer Martinez', category: 'sales', status: 'in-progress', priority: 'high', assignee: 'Sarah Agent', dueDate: '2024-12-29', createdDate: '2024-12-27', description: 'Hot lead interested in Unit 3. Showing scheduled for 12/29. Follow up after.', tags: ['lead', 'unit-3'], checklist: [{ text: 'Confirm showing time', done: true }, { text: 'Prepare unit for showing', done: false }, { text: 'Follow up call', done: false }] },
    { id: 'TSK-007', title: 'Update MLS listings with new photos', category: 'sales', status: 'todo', priority: 'low', assignee: 'Sarah Agent', dueDate: '2025-01-03', createdDate: '2024-12-20', description: 'Add December progress photos to all active listings.', tags: ['marketing', 'photos'], checklist: [] },
    { id: 'TSK-008', title: 'Schedule closing for Unit 2', category: 'sales', status: 'in-progress', priority: 'high', assignee: 'Sarah Agent', dueDate: '2025-01-25', createdDate: '2024-12-18', description: 'Unit 2 under contract. Coordinate closing with title company.', tags: ['closing', 'unit-2'], checklist: [{ text: 'Send docs to title', done: true }, { text: 'Confirm closing date', done: true }, { text: 'Schedule walkthrough', done: false }, { text: 'Prepare closing docs', done: false }] },
    
    // Admin Tasks
    { id: 'TSK-009', title: 'Prepare Q4 investor report', category: 'admin', status: 'completed', priority: 'high', assignee: 'Bryan VanRock', dueDate: '2024-12-28', completedDate: '2024-12-28', createdDate: '2024-12-15', description: 'Quarterly report for LP investors with progress update and financials.', tags: ['investor', 'report'], checklist: [{ text: 'Gather financials', done: true }, { text: 'Write narrative', done: true }, { text: 'Add photos', done: true }, { text: 'Review and send', done: true }] },
    { id: 'TSK-010', title: 'Process January distribution', category: 'admin', status: 'todo', priority: 'high', assignee: 'Bryan VanRock', dueDate: '2025-01-15', createdDate: '2024-12-22', description: 'Process distribution of Unit 1 closing proceeds to investors.', tags: ['distribution', 'investor'], checklist: [{ text: 'Calculate allocations', done: false }, { text: 'Prepare statements', done: false }, { text: 'Process payments', done: false }] },
    { id: 'TSK-011', title: 'Renew builder insurance policy', category: 'admin', status: 'todo', priority: 'medium', assignee: 'Sarah Mitchell', dueDate: '2025-01-15', createdDate: '2024-12-20', description: 'Current policy expires 1/31. Get renewal quote and process.', tags: ['insurance'], checklist: [] },
    { id: 'TSK-012', title: 'Update COI for Premium Cabinets', category: 'admin', status: 'todo', priority: 'medium', assignee: 'Sarah Mitchell', dueDate: '2025-01-10', createdDate: '2024-12-26', description: 'Request updated certificate of insurance from vendor.', tags: ['vendor', 'insurance'], checklist: [] },
    
    // Completed
    { id: 'TSK-013', title: 'Close Unit 1 sale', category: 'sales', status: 'completed', priority: 'high', assignee: 'Sarah Agent', dueDate: '2024-12-20', completedDate: '2024-12-20', createdDate: '2024-11-15', description: 'First unit closing!', tags: ['closing', 'unit-1'], checklist: [] },
    { id: 'TSK-014', title: 'Submit Draw #12 request', category: 'construction', status: 'completed', priority: 'high', assignee: 'Bryan VanRock', dueDate: '2024-12-10', completedDate: '2024-12-08', createdDate: '2024-12-01', description: 'Monthly draw request submitted and approved.', tags: ['draw'], checklist: [] },
  ]);

  const categories = [
    { id: 'construction', name: 'Construction', color: 'bg-orange-500' },
    { id: 'sales', name: 'Sales & Marketing', color: 'bg-pink-500' },
    { id: 'admin', name: 'Administrative', color: 'bg-purple-500' },
    { id: 'finance', name: 'Finance', color: 'bg-green-500' },
  ];

  const assignees = ['Bryan VanRock', 'Sarah Mitchell', 'Mike Johnson', 'Sarah Agent', 'Dave Brown'];

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

  const toggleTaskStatus = (taskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const newStatus = t.status === 'completed' ? 'todo' : 'completed';
        return { ...t, status: newStatus, completedDate: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null };
      }
      return t;
    }));
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesAssignee = filterAssignee === 'all' || task.assignee === filterAssignee;
    return matchesStatus && matchesPriority && matchesAssignee;
  });

  const todoCount = tasks.filter(t => t.status === 'todo').length;
  const inProgressCount = tasks.filter(t => t.status === 'in-progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const overdueCount = tasks.filter(t => t.status !== 'completed' && new Date(t.dueDate) < new Date()).length;

  const isOverdue = (dueDate, status) => {
    if (status === 'completed') return false;
    return new Date(dueDate) < new Date();
  };

  const isDueSoon = (dueDate, status) => {
    if (status === 'completed') return false;
    const due = new Date(dueDate);
    const today = new Date();
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diff <= 3 && diff >= 0;
  };

  const handleSaveTask = () => {
    const task = {
      id: `TSK-${String(tasks.length + 1).padStart(3, '0')}`,
      ...newTask,
      status: 'todo',
      createdDate: new Date().toISOString().split('T')[0],
      tags: newTask.tags.split(',').map(t => t.trim()).filter(t => t),
      checklist: [],
    };
    setTasks(prev => [...prev, task]);
    setShowTaskModal(false);
    setNewTask({ title: '', category: 'construction', priority: 'medium', assignee: '', dueDate: '', description: '', tags: '' });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Tasks</h1>
          <p className="text-sm text-gray-500">{tasks.length} tasks • {overdueCount > 0 && <span className="text-red-500">{overdueCount} overdue</span>}</p>
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
          <p className="text-2xl font-semibold">{tasks.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-gray-400">
          <p className="text-xs text-gray-500">To Do</p>
          <p className="text-2xl font-semibold">{todoCount}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-xs text-gray-500">In Progress</p>
          <p className="text-2xl font-semibold text-blue-600">{inProgressCount}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-xs text-gray-500">Completed</p>
          <p className="text-2xl font-semibold text-green-600">{completedCount}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-red-500">
          <p className="text-xs text-gray-500">Overdue</p>
          <p className="text-2xl font-semibold text-red-600">{overdueCount}</p>
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
          </select>
          <select className="border rounded-md px-3 py-2 text-sm" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
            <option value="all">All Priority</option>
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
                        <button onClick={() => toggleTaskStatus(task.id)}>
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
                            {isOverdue(task.dueDate, task.status) && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">Overdue</span>
                            )}
                            {isDueSoon(task.dueDate, task.status) && !isOverdue(task.dueDate, task.status) && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">Due Soon</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><User className="w-3 h-3" />{task.assignee}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{task.dueDate}</span>
                            {task.checklist.length > 0 && (
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
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleSaveTask}>Add Task</Button>
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
                <span className="text-sm text-gray-500">{selectedTask.id}</span>
                {getPriorityIcon(selectedTask.priority)}
              </div>
              <button onClick={() => setSelectedTask(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <button onClick={() => toggleTaskStatus(selectedTask.id)}>
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
                {isOverdue(selectedTask.dueDate, selectedTask.status) && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">Overdue</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Assignee</p>
                  <p className="font-medium">{selectedTask.assignee}</p>
                </div>
                <div>
                  <p className="text-gray-500">Due Date</p>
                  <p className="font-medium">{selectedTask.dueDate}</p>
                </div>
                <div>
                  <p className="text-gray-500">Created</p>
                  <p className="font-medium">{selectedTask.createdDate}</p>
                </div>
                {selectedTask.completedDate && (
                  <div>
                    <p className="text-gray-500">Completed</p>
                    <p className="font-medium">{selectedTask.completedDate}</p>
                  </div>
                )}
              </div>

              {selectedTask.description && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-sm">{selectedTask.description}</p>
                </div>
              )}

              {selectedTask.checklist.length > 0 && (
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

              {selectedTask.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {selectedTask.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
              <Button variant="outline" size="sm" className="text-red-600">
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
