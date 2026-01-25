import React, { useState, useMemo } from 'react';
import {
  Plus, Search, Eye, Edit2, X, CheckCircle, Circle, Clock, Calendar,
  User, Users, Briefcase, Flag, Tag, Filter, MoreVertical, ChevronDown,
  ChevronRight, AlertTriangle, ArrowUp, ArrowRight, ArrowDown, Trash2,
  Download, Link, Building, Phone, Mail, ExternalLink, Zap, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/*
 * PROJECT TASK MANAGEMENT - ENHANCED WITH RESPONSIBLE PARTY TRACKING
 *
 * Key Features:
 * 1. Tasks can be assigned to internal users OR external project contacts
 * 2. External contacts are linked from the project's contact list
 * 3. Tasks auto-generated from workflow templates show their source
 * 4. Milestone integration for tracking critical deadlines
 * 5. Module source tracking (which module triggered the task)
 *
 * Responsible Party Types:
 * - Internal User: Team member from user directory
 * - Internal Team: Functional team (Finance, Sales, etc.)
 * - External Contact: Third-party from project contacts (Contractor, Attorney, etc.)
 */

// Mock project contacts (would come from projectContactsService)
const mockProjectContacts = [
  { id: 'pc-1', category: 'contractor', firstName: 'Mike', lastName: 'Johnson', company: 'Johnson Builders', email: 'mike@jbuilders.com', phone: '(864) 555-0102' },
  { id: 'pc-2', category: 'legal_title', firstName: 'Jennifer', lastName: 'Taylor', company: 'Taylor Law Firm', email: 'jen@taylorlaw.com', phone: '(864) 555-0105' },
  { id: 'pc-3', category: 'survey', firstName: 'Tom', lastName: 'Harris', company: 'Harris Surveying', email: 'tom@harrissurvey.com', phone: '(864) 555-0106' },
  { id: 'pc-4', category: 'lender', firstName: 'Sarah', lastName: 'Williams', company: 'First National Bank', email: 'sarah@fnb.com', phone: '(864) 555-0103' },
  { id: 'pc-5', category: 'engineer', firstName: 'Robert', lastName: 'Brown', company: 'Brown Civil Engineering', email: 'robert@brownce.com', phone: '(864) 555-0104' },
];

// Mock internal users
const mockInternalUsers = [
  { id: 'u-1', name: 'Bryan VanRock', role: 'Project Manager', email: 'bryan@atlas.com' },
  { id: 'u-2', name: 'Sarah Mitchell', role: 'Operations Manager', email: 'sarah@atlas.com' },
  { id: 'u-3', name: 'Mike Chen', role: 'Construction Manager', email: 'mike@atlas.com' },
  { id: 'u-4', name: 'Lisa Wang', role: 'Finance Director', email: 'lisa@atlas.com' },
];

const mockTasks = [
  {
    id: 'TSK-001',
    title: 'Submit Building Permit Application',
    description: 'Submit complete building permit application package to city planning department',
    category: 'permitting',
    status: 'in-progress',
    priority: 'critical',
    dueDate: '2024-03-15',
    createdDate: '2024-01-15',
    responsiblePartyType: 'external_contact',
    responsiblePartyId: 'pc-1',
    sourceModule: 'workflow',
    sourceTemplate: 'Scattered Lot - Standard Acquisition',
    triggerEvent: 'contract_executed',
    triggerDate: '2024-01-15',
    milestoneId: 'ms-1',
    checklist: [
      { text: 'Complete application form', done: true },
      { text: 'Attach site plan', done: true },
      { text: 'Include engineering drawings', done: false },
      { text: 'Pay application fee', done: false },
    ],
    comments: [
      { user: 'Bryan VanRock', text: 'Engineering drawings should be ready by Friday', date: '2024-02-01' }
    ]
  },
  {
    id: 'TSK-002',
    title: 'Order Title Commitment',
    description: 'Request title commitment from title company for closing preparation',
    category: 'acquisition',
    status: 'completed',
    priority: 'high',
    dueDate: '2024-01-20',
    completedDate: '2024-01-18',
    createdDate: '2024-01-15',
    responsiblePartyType: 'external_contact',
    responsiblePartyId: 'pc-2',
    sourceModule: 'workflow',
    sourceTemplate: 'Scattered Lot - Standard Acquisition',
    triggerEvent: 'contract_executed',
    triggerDate: '2024-01-15',
    milestoneId: null,
    checklist: [],
    comments: []
  },
  {
    id: 'TSK-003',
    title: 'Complete Property Survey',
    description: 'Obtain boundary and topographic survey for permit application',
    category: 'acquisition',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2024-02-01',
    createdDate: '2024-01-15',
    responsiblePartyType: 'external_contact',
    responsiblePartyId: 'pc-3',
    sourceModule: 'workflow',
    sourceTemplate: 'Scattered Lot - Standard Acquisition',
    triggerEvent: 'contract_executed',
    triggerDate: '2024-01-15',
    milestoneId: null,
    checklist: [
      { text: 'Schedule survey date', done: true },
      { text: 'Field work complete', done: true },
      { text: 'Receive final plat', done: false },
    ],
    comments: []
  },
  {
    id: 'TSK-004',
    title: 'Review and Approve Construction Budget',
    description: 'Final review and approval of construction budget before loan closing',
    category: 'finance',
    status: 'todo',
    priority: 'high',
    dueDate: '2024-02-10',
    createdDate: '2024-01-20',
    responsiblePartyType: 'internal_user',
    responsiblePartyId: 'u-1',
    sourceModule: 'manual',
    sourceTemplate: null,
    triggerEvent: null,
    triggerDate: null,
    milestoneId: 'ms-2',
    checklist: [],
    comments: []
  },
  {
    id: 'TSK-005',
    title: 'Schedule Pre-Construction Meeting',
    description: 'Coordinate pre-construction meeting with all key stakeholders',
    category: 'construction',
    status: 'todo',
    priority: 'medium',
    dueDate: '2024-02-20',
    createdDate: '2024-01-25',
    responsiblePartyType: 'internal_user',
    responsiblePartyId: 'u-3',
    sourceModule: 'workflow',
    sourceTemplate: 'Construction Start Checklist',
    triggerEvent: 'permit_approved',
    triggerDate: null,
    milestoneId: null,
    checklist: [
      { text: 'Book meeting room', done: false },
      { text: 'Send calendar invites', done: false },
      { text: 'Prepare agenda', done: false },
    ],
    comments: []
  },
  {
    id: 'TSK-006',
    title: 'Finalize Construction Loan Documents',
    description: 'Review and execute construction loan documents with lender',
    category: 'finance',
    status: 'todo',
    priority: 'high',
    dueDate: '2024-02-28',
    createdDate: '2024-01-15',
    responsiblePartyType: 'external_contact',
    responsiblePartyId: 'pc-4',
    sourceModule: 'workflow',
    sourceTemplate: 'Scattered Lot - Standard Acquisition',
    triggerEvent: 'contract_executed',
    triggerDate: '2024-01-15',
    milestoneId: 'ms-2',
    checklist: [],
    comments: []
  },
];

const mockMilestones = [
  { id: 'ms-1', name: 'Permit Approval', dueDate: '2024-03-30', status: 'at-risk' },
  { id: 'ms-2', name: 'Loan Closing', dueDate: '2024-02-28', status: 'on-track' },
  { id: 'ms-3', name: 'Construction Start', dueDate: '2024-04-01', status: 'pending' },
];

const categories = [
  { id: 'acquisition', name: 'Acquisition', color: 'bg-blue-500' },
  { id: 'permitting', name: 'Permitting', color: 'bg-purple-500' },
  { id: 'construction', name: 'Construction', color: 'bg-orange-500' },
  { id: 'finance', name: 'Finance', color: 'bg-green-500' },
  { id: 'sales', name: 'Sales', color: 'bg-pink-500' },
  { id: 'admin', name: 'Administrative', color: 'bg-gray-500' },
];

const statusConfig = {
  'todo': { label: 'To Do', color: 'bg-gray-100 text-gray-700' },
  'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  'completed': { label: 'Completed', color: 'bg-green-100 text-green-700' },
  'blocked': { label: 'Blocked', color: 'bg-red-100 text-red-700' },
  'on-hold': { label: 'On Hold', color: 'bg-yellow-100 text-yellow-700' },
};

const priorityConfig = {
  critical: { label: 'Critical', color: 'text-red-600', icon: AlertTriangle },
  high: { label: 'High', color: 'text-orange-500', icon: ArrowUp },
  medium: { label: 'Medium', color: 'text-yellow-500', icon: ArrowRight },
  low: { label: 'Low', color: 'text-gray-400', icon: ArrowDown },
};

export default function TaskManagementPage({ projectId }) {
  const [tasks, setTasks] = useState(mockTasks);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterResponsibleType, setFilterResponsibleType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(['permitting', 'acquisition', 'finance']);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'by-responsible', 'by-milestone'

  // Get responsible party details
  const getResponsibleParty = (task) => {
    if (task.responsiblePartyType === 'external_contact') {
      const contact = mockProjectContacts.find(c => c.id === task.responsiblePartyId);
      return contact ? {
        type: 'external',
        name: `${contact.firstName} ${contact.lastName}`,
        company: contact.company,
        email: contact.email,
        phone: contact.phone,
        category: contact.category,
      } : null;
    } else {
      const user = mockInternalUsers.find(u => u.id === task.responsiblePartyId);
      return user ? {
        type: 'internal',
        name: user.name,
        role: user.role,
        email: user.email,
      } : null;
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filterStatus !== 'all' && task.status !== filterStatus) return false;
      if (filterCategory !== 'all' && task.category !== filterCategory) return false;
      if (filterResponsibleType !== 'all') {
        if (filterResponsibleType === 'internal' && task.responsiblePartyType !== 'internal_user') return false;
        if (filterResponsibleType === 'external' && task.responsiblePartyType !== 'external_contact') return false;
      }
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [tasks, filterStatus, filterCategory, filterResponsibleType, searchQuery]);

  const stats = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.status !== 'completed' && new Date(t.dueDate) < new Date()).length,
    externalTasks: tasks.filter(t => t.responsiblePartyType === 'external_contact').length,
    internalTasks: tasks.filter(t => t.responsiblePartyType === 'internal_user').length,
  }), [tasks]);

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(c => c !== categoryId) : [...prev, categoryId]
    );
  };

  const isOverdue = (dueDate, status) => {
    if (status === 'completed') return false;
    return new Date(dueDate) < new Date();
  };

  const isDueSoon = (dueDate, status) => {
    if (status === 'completed') return false;
    const due = new Date(dueDate);
    const today = new Date();
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diff <= 7 && diff >= 0;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Task Management</h1>
          <p className="text-sm text-gray-500">
            {tasks.length} tasks • {stats.externalTasks} assigned to contacts • {stats.internalTasks} internal
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button variant="outline" size="sm"><Zap className="w-4 h-4 mr-1" />Generate from Template</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowAddTask(true)}>
            <Plus className="w-4 h-4 mr-1" />Add Task
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-7 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Total</p>
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
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-purple-500">
          <p className="text-xs text-gray-500">External</p>
          <p className="text-2xl font-semibold text-purple-600">{stats.externalTasks}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-teal-500">
          <p className="text-xs text-gray-500">Internal</p>
          <p className="text-2xl font-semibold text-teal-600">{stats.internalTasks}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={filterResponsibleType}
            onChange={(e) => setFilterResponsibleType(e.target.value)}
          >
            <option value="all">All Assignees</option>
            <option value="internal">Internal Only</option>
            <option value="external">External Contacts Only</option>
          </select>
          <div className="border-l pl-4 flex gap-1">
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
            >
              By Category
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'by-responsible' ? 'default' : 'outline'}
              onClick={() => setViewMode('by-responsible')}
            >
              By Assignee
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'by-milestone' ? 'default' : 'outline'}
              onClick={() => setViewMode('by-milestone')}
            >
              By Milestone
            </Button>
          </div>
        </div>
      </div>

      {/* Task List by Category */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {categories.map(category => {
            const categoryTasks = filteredTasks.filter(t => t.category === category.id);
            const isExpanded = expandedCategories.includes(category.id);

            if (categoryTasks.length === 0 && filterCategory !== 'all') return null;

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
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{categoryTasks.filter(t => t.status === 'completed').length} completed</span>
                    <span>{categoryTasks.filter(t => t.responsiblePartyType === 'external_contact').length} external</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="divide-y">
                    {categoryTasks.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">No tasks in this category</div>
                    ) : (
                      categoryTasks.map(task => {
                        const responsible = getResponsibleParty(task);
                        const PriorityIcon = priorityConfig[task.priority].icon;
                        const milestone = task.milestoneId ? mockMilestones.find(m => m.id === task.milestoneId) : null;

                        return (
                          <div
                            key={task.id}
                            className={cn(
                              "flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer",
                              task.status === 'completed' && "opacity-60"
                            )}
                            onClick={() => setSelectedTask(task)}
                          >
                            <button onClick={(e) => { e.stopPropagation(); }}>
                              {task.status === 'completed' ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-300 hover:text-gray-400" />
                              )}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={cn("font-medium", task.status === 'completed' && "line-through text-gray-500")}>
                                  {task.title}
                                </p>
                                <PriorityIcon className={cn("w-4 h-4", priorityConfig[task.priority].color)} />
                                {isOverdue(task.dueDate, task.status) && (
                                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">Overdue</span>
                                )}
                                {isDueSoon(task.dueDate, task.status) && !isOverdue(task.dueDate, task.status) && (
                                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">Due Soon</span>
                                )}
                                {task.sourceModule === 'workflow' && (
                                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded flex items-center gap-1">
                                    <Zap className="w-3 h-3" />Auto
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {task.dueDate}
                                </span>
                                {milestone && (
                                  <span className="flex items-center gap-1">
                                    <Target className="w-3 h-3" />
                                    {milestone.name}
                                  </span>
                                )}
                                {task.checklist.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    {task.checklist.filter(c => c.done).length}/{task.checklist.length}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Responsible Party */}
                            <div className="flex items-center gap-3 min-w-[200px]">
                              {responsible ? (
                                <div className="flex items-center gap-2">
                                  <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                                    responsible.type === 'external'
                                      ? "bg-purple-100 text-purple-700"
                                      : "bg-blue-100 text-blue-700"
                                  )}>
                                    {responsible.name.split(' ').map(n => n[0]).join('')}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">{responsible.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {responsible.type === 'external' ? responsible.company : responsible.role}
                                    </p>
                                  </div>
                                  {responsible.type === 'external' && (
                                    <Briefcase className="w-4 h-4 text-purple-400 ml-1" />
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">Unassigned</span>
                              )}
                            </div>

                            <span className={cn("px-2 py-1 rounded text-xs capitalize", statusConfig[task.status].color)}>
                              {statusConfig[task.status].label}
                            </span>

                            <button className="p-1 hover:bg-gray-100 rounded">
                              <Eye className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Task List by Responsible Party */}
      {viewMode === 'by-responsible' && (
        <div className="space-y-6">
          {/* External Contacts */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-600" />
              External Contacts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockProjectContacts.map(contact => {
                const contactTasks = filteredTasks.filter(
                  t => t.responsiblePartyType === 'external_contact' && t.responsiblePartyId === contact.id
                );
                if (contactTasks.length === 0) return null;

                return (
                  <div key={contact.id} className="bg-white border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-medium">
                        {contact.firstName[0]}{contact.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                        <p className="text-xs text-gray-500">{contact.company}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {contactTasks.map(task => (
                        <div
                          key={task.id}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                          onClick={() => setSelectedTask(task)}
                        >
                          {task.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-300 shrink-0" />
                          )}
                          <span className={cn("text-sm flex-1 truncate", task.status === 'completed' && "line-through text-gray-500")}>
                            {task.title}
                          </span>
                          <span className="text-xs text-gray-500">{task.dueDate}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      {contactTasks.filter(t => t.status === 'completed').length} of {contactTasks.length} completed
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Internal Users */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Internal Team
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockInternalUsers.map(user => {
                const userTasks = filteredTasks.filter(
                  t => t.responsiblePartyType === 'internal_user' && t.responsiblePartyId === user.id
                );
                if (userTasks.length === 0) return null;

                return (
                  <div key={user.id} className="bg-white border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.role}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {userTasks.map(task => (
                        <div
                          key={task.id}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                          onClick={() => setSelectedTask(task)}
                        >
                          {task.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-300 shrink-0" />
                          )}
                          <span className={cn("text-sm flex-1 truncate", task.status === 'completed' && "line-through text-gray-500")}>
                            {task.title}
                          </span>
                          <span className="text-xs text-gray-500">{task.dueDate}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      {userTasks.filter(t => t.status === 'completed').length} of {userTasks.length} completed
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Task List by Milestone */}
      {viewMode === 'by-milestone' && (
        <div className="space-y-4">
          {mockMilestones.map(milestone => {
            const milestoneTasks = filteredTasks.filter(t => t.milestoneId === milestone.id);
            return (
              <div key={milestone.id} className="bg-white border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Target className={cn(
                      "w-5 h-5",
                      milestone.status === 'on-track' ? 'text-green-600' :
                      milestone.status === 'at-risk' ? 'text-red-600' : 'text-gray-400'
                    )} />
                    <div>
                      <span className="font-semibold">{milestone.name}</span>
                      <span className="text-sm text-gray-500 ml-2">Due: {milestone.dueDate}</span>
                    </div>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-xs capitalize",
                      milestone.status === 'on-track' ? 'bg-green-100 text-green-700' :
                      milestone.status === 'at-risk' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                    )}>
                      {milestone.status.replace('-', ' ')}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{milestoneTasks.length} tasks</span>
                </div>
                <div className="divide-y">
                  {milestoneTasks.map(task => {
                    const responsible = getResponsibleParty(task);
                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedTask(task)}
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300" />
                        )}
                        <div className="flex-1">
                          <p className={cn("font-medium", task.status === 'completed' && "line-through text-gray-500")}>
                            {task.title}
                          </p>
                          <p className="text-xs text-gray-500">Due: {task.dueDate}</p>
                        </div>
                        {responsible && (
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                              responsible.type === 'external' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                            )}>
                              {responsible.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-sm">{responsible.name}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Tasks without milestones */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-gray-50">
              <div className="flex items-center gap-3">
                <Circle className="w-5 h-5 text-gray-400" />
                <span className="font-semibold text-gray-600">No Milestone</span>
              </div>
              <span className="text-sm text-gray-500">
                {filteredTasks.filter(t => !t.milestoneId).length} tasks
              </span>
            </div>
            <div className="divide-y">
              {filteredTasks.filter(t => !t.milestoneId).map(task => {
                const responsible = getResponsibleParty(task);
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedTask(task)}
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300" />
                    )}
                    <div className="flex-1">
                      <p className={cn("font-medium", task.status === 'completed' && "line-through text-gray-500")}>
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-500">Due: {task.dueDate}</p>
                    </div>
                    {responsible && (
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                          responsible.type === 'external' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                        )}>
                          {responsible.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm">{responsible.name}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 font-mono">{selectedTask.id}</span>
                {selectedTask.sourceModule === 'workflow' && (
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {selectedTask.sourceTemplate}
                  </span>
                )}
              </div>
              <button onClick={() => setSelectedTask(null)}><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">{selectedTask.title}</h2>
                <p className="text-gray-600">{selectedTask.description}</p>
              </div>

              {/* Status and Priority */}
              <div className="flex gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span className={cn("px-3 py-1 rounded text-sm", statusConfig[selectedTask.status].color)}>
                    {statusConfig[selectedTask.status].label}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Priority</p>
                  <span className={cn("px-3 py-1 rounded text-sm capitalize",
                    selectedTask.priority === 'critical' ? 'bg-red-100 text-red-700' :
                    selectedTask.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  )}>
                    {selectedTask.priority}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Category</p>
                  <span className="px-3 py-1 rounded text-sm bg-gray-100 capitalize">
                    {selectedTask.category}
                  </span>
                </div>
              </div>

              {/* Responsible Party */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-2 uppercase font-medium">Responsible Party</p>
                {(() => {
                  const responsible = getResponsibleParty(selectedTask);
                  if (!responsible) return <p className="text-gray-500">Unassigned</p>;

                  return (
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium",
                        responsible.type === 'external' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                      )}>
                        {responsible.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{responsible.name}</p>
                        <p className="text-sm text-gray-500">
                          {responsible.type === 'external' ? responsible.company : responsible.role}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs">
                          <span className="flex items-center gap-1 text-gray-500">
                            <Mail className="w-3 h-3" />{responsible.email}
                          </span>
                          {responsible.phone && (
                            <span className="flex items-center gap-1 text-gray-500">
                              <Phone className="w-3 h-3" />{responsible.phone}
                            </span>
                          )}
                        </div>
                      </div>
                      {responsible.type === 'external' && (
                        <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-700 flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />External Contact
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Due Date</p>
                  <p className="font-medium">{selectedTask.dueDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="font-medium">{selectedTask.createdDate}</p>
                </div>
                {selectedTask.completedDate && (
                  <div>
                    <p className="text-xs text-gray-500">Completed</p>
                    <p className="font-medium text-green-600">{selectedTask.completedDate}</p>
                  </div>
                )}
              </div>

              {/* Workflow Source */}
              {selectedTask.sourceModule === 'workflow' && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-xs text-purple-700 mb-2 uppercase font-medium flex items-center gap-1">
                    <Zap className="w-3 h-3" />Auto-Generated Task
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Template</p>
                      <p className="font-medium">{selectedTask.sourceTemplate}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Trigger Event</p>
                      <p className="font-medium capitalize">{selectedTask.triggerEvent?.replace('_', ' ')}</p>
                    </div>
                    {selectedTask.triggerDate && (
                      <div>
                        <p className="text-gray-500">Triggered On</p>
                        <p className="font-medium">{selectedTask.triggerDate}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Checklist */}
              {selectedTask.checklist.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">
                    Checklist ({selectedTask.checklist.filter(c => c.done).length}/{selectedTask.checklist.length})
                  </p>
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

              {/* Comments */}
              {selectedTask.comments.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Comments</p>
                  <div className="space-y-3">
                    {selectedTask.comments.map((comment, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{comment.user}</span>
                          <span className="text-xs text-gray-500">{comment.date}</span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center p-4 border-t bg-gray-50 sticky bottom-0">
              <Button variant="outline" size="sm" className="text-red-600">
                <Trash2 className="w-4 h-4 mr-1" />Delete
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedTask(null)}>Close</Button>
                <Button className="bg-[#047857] hover:bg-[#065f46]">
                  <Edit2 className="w-4 h-4 mr-1" />Edit Task
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">Add Task</h3>
              <button onClick={() => setShowAddTask(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Title *</label>
                <Input placeholder="Task title" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description</label>
                <textarea className="w-full border rounded-md px-3 py-2" rows={3} placeholder="Task description..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Category</label>
                  <select className="w-full border rounded-md px-3 py-2">
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Priority</label>
                  <select className="w-full border rounded-md px-3 py-2">
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              {/* Responsible Party Selection */}
              <div>
                <label className="text-sm font-medium block mb-1">Assign To</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <User className="w-4 h-4 mr-1" />Internal User
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Briefcase className="w-4 h-4 mr-1" />Project Contact
                    </Button>
                  </div>
                  <select className="w-full border rounded-md px-3 py-2">
                    <option value="">Select assignee...</option>
                    <optgroup label="Internal Users">
                      {mockInternalUsers.map(user => (
                        <option key={user.id} value={`internal:${user.id}`}>{user.name} - {user.role}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Project Contacts">
                      {mockProjectContacts.map(contact => (
                        <option key={contact.id} value={`external:${contact.id}`}>
                          {contact.firstName} {contact.lastName} - {contact.company}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Due Date</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Link to Milestone</label>
                  <select className="w-full border rounded-md px-3 py-2">
                    <option value="">No milestone</option>
                    {mockMilestones.map(ms => (
                      <option key={ms.id} value={ms.id}>{ms.name} - {ms.dueDate}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 sticky bottom-0">
              <Button variant="outline" onClick={() => setShowAddTask(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]">Add Task</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
