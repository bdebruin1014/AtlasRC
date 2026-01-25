import React, { useState, useMemo } from 'react';
import {
  FileText, Plus, Settings, Play, Pause, Clock, CheckCircle, AlertTriangle,
  Building, User, Users, Briefcase, Calendar, ChevronRight, ChevronDown,
  Copy, Edit, Trash2, Link, Target, ArrowRight, Zap, Filter, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/*
 * TASK WORKFLOW TEMPLATES - PROJECT TYPE TASK GENERATION
 *
 * Templates define standard tasks that are auto-generated when:
 * 1. A new project is created (based on project type)
 * 2. A project enters a new phase
 * 3. A milestone is triggered
 * 4. A module event occurs (e.g., contract executed)
 *
 * Each task template includes:
 * - Task details (title, description, category)
 * - Default responsible party role (can be internal user or external contact category)
 * - Due date calculation (relative to trigger date or milestone)
 * - Dependencies (tasks that must complete first)
 * - Auto-assignment rules
 */

// Project types that have different task templates
const PROJECT_TYPES = [
  { id: 'scattered_lot', name: 'Scattered Lot', description: 'Individual lot acquisition and development' },
  { id: 'subdivision', name: 'Subdivision', description: 'Multi-lot subdivision development' },
  { id: 'multifamily', name: 'Multifamily', description: 'Apartment or condo development' },
  { id: 'commercial', name: 'Commercial', description: 'Commercial property development' },
  { id: 'land_bank', name: 'Land Bank', description: 'Land acquisition for future development' },
];

// Responsible party types
const RESPONSIBLE_PARTY_TYPES = [
  { id: 'internal_user', name: 'Internal User', icon: User },
  { id: 'internal_team', name: 'Internal Team', icon: Users },
  { id: 'external_contact', name: 'Project Contact', icon: Briefcase },
];

// Contact categories that can be assigned tasks
const CONTACT_CATEGORIES = [
  { id: 'architect', name: 'Architect' },
  { id: 'contractor', name: 'General Contractor' },
  { id: 'engineer', name: 'Engineer' },
  { id: 'legal_title', name: 'Attorney/Title' },
  { id: 'lender', name: 'Lender' },
  { id: 'survey', name: 'Surveyor' },
  { id: 'government', name: 'Government/Municipality' },
];

const mockTemplates = [
  {
    id: 1,
    name: 'Scattered Lot - Standard Acquisition',
    projectType: 'scattered_lot',
    triggerEvent: 'contract_executed',
    description: 'Standard task sequence for scattered lot acquisitions after contract execution',
    isActive: true,
    tasks: [
      { id: 't1', title: 'Order Title Commitment', category: 'acquisition', daysFromTrigger: 3, responsiblePartyType: 'external_contact', responsiblePartyRole: 'legal_title', priority: 'high', dependencies: [] },
      { id: 't2', title: 'Order Survey', category: 'acquisition', daysFromTrigger: 5, responsiblePartyType: 'external_contact', responsiblePartyRole: 'survey', priority: 'high', dependencies: [] },
      { id: 't3', title: 'Submit Permit Application', category: 'permitting', daysFromTrigger: 60, responsiblePartyType: 'external_contact', responsiblePartyRole: 'contractor', priority: 'critical', dependencies: ['t1', 't2'] },
      { id: 't4', title: 'Finalize Construction Loan', category: 'finance', daysFromTrigger: 45, responsiblePartyType: 'internal_user', responsiblePartyRole: 'project_manager', priority: 'high', dependencies: ['t1'] },
      { id: 't5', title: 'Review Title Exceptions', category: 'acquisition', daysFromTrigger: 14, responsiblePartyType: 'external_contact', responsiblePartyRole: 'legal_title', priority: 'medium', dependencies: ['t1'] },
      { id: 't6', title: 'Obtain Utility Tap Fees Quote', category: 'permitting', daysFromTrigger: 30, responsiblePartyType: 'external_contact', responsiblePartyRole: 'contractor', priority: 'medium', dependencies: [] },
      { id: 't7', title: 'Schedule Pre-Construction Meeting', category: 'construction', daysFromTrigger: 55, responsiblePartyType: 'internal_user', responsiblePartyRole: 'project_manager', priority: 'high', dependencies: ['t3'] },
    ],
    createdBy: 'System',
    lastUpdated: '2024-01-15'
  },
  {
    id: 2,
    name: 'Subdivision - Site Plan Approval',
    projectType: 'subdivision',
    triggerEvent: 'project_created',
    description: 'Tasks for subdivision site plan approval process',
    isActive: true,
    tasks: [
      { id: 't1', title: 'Engage Civil Engineer', category: 'design', daysFromTrigger: 7, responsiblePartyType: 'internal_user', responsiblePartyRole: 'project_manager', priority: 'high', dependencies: [] },
      { id: 't2', title: 'Complete Topographic Survey', category: 'design', daysFromTrigger: 21, responsiblePartyType: 'external_contact', responsiblePartyRole: 'survey', priority: 'high', dependencies: [] },
      { id: 't3', title: 'Submit Preliminary Plat', category: 'permitting', daysFromTrigger: 45, responsiblePartyType: 'external_contact', responsiblePartyRole: 'engineer', priority: 'critical', dependencies: ['t1', 't2'] },
      { id: 't4', title: 'Environmental Assessment', category: 'due_diligence', daysFromTrigger: 30, responsiblePartyType: 'external_contact', responsiblePartyRole: 'consultant', priority: 'high', dependencies: [] },
      { id: 't5', title: 'Traffic Impact Study', category: 'permitting', daysFromTrigger: 35, responsiblePartyType: 'external_contact', responsiblePartyRole: 'engineer', priority: 'medium', dependencies: [] },
    ],
    createdBy: 'Admin',
    lastUpdated: '2024-01-20'
  },
  {
    id: 3,
    name: 'Construction Start Checklist',
    projectType: 'scattered_lot',
    triggerEvent: 'permit_approved',
    description: 'Tasks triggered when building permit is approved',
    isActive: true,
    tasks: [
      { id: 't1', title: 'Schedule Foundation Inspection', category: 'construction', daysFromTrigger: 14, responsiblePartyType: 'external_contact', responsiblePartyRole: 'contractor', priority: 'high', dependencies: [] },
      { id: 't2', title: 'Order Materials Package', category: 'construction', daysFromTrigger: 3, responsiblePartyType: 'external_contact', responsiblePartyRole: 'contractor', priority: 'critical', dependencies: [] },
      { id: 't3', title: 'Notify Lender of Permit', category: 'finance', daysFromTrigger: 2, responsiblePartyType: 'internal_user', responsiblePartyRole: 'project_manager', priority: 'high', dependencies: [] },
      { id: 't4', title: 'Update Project Schedule', category: 'admin', daysFromTrigger: 5, responsiblePartyType: 'internal_user', responsiblePartyRole: 'project_manager', priority: 'medium', dependencies: [] },
    ],
    createdBy: 'System',
    lastUpdated: '2024-02-01'
  },
];

const TRIGGER_EVENTS = [
  { id: 'project_created', name: 'Project Created', module: 'Opportunities' },
  { id: 'contract_executed', name: 'Contract Executed', module: 'Opportunities' },
  { id: 'due_diligence_complete', name: 'Due Diligence Complete', module: 'Opportunities' },
  { id: 'closing_complete', name: 'Closing Complete', module: 'Opportunities' },
  { id: 'permit_submitted', name: 'Permit Submitted', module: 'Permitting' },
  { id: 'permit_approved', name: 'Permit Approved', module: 'Permitting' },
  { id: 'construction_start', name: 'Construction Start', module: 'Construction' },
  { id: 'phase_complete', name: 'Construction Phase Complete', module: 'Construction' },
  { id: 'co_issued', name: 'Certificate of Occupancy Issued', module: 'Construction' },
  { id: 'listing_active', name: 'Listing Activated', module: 'Sales' },
  { id: 'under_contract', name: 'Unit Under Contract', module: 'Sales' },
  { id: 'sale_closed', name: 'Sale Closed', module: 'Sales' },
];

const categoryColors = {
  acquisition: 'bg-blue-100 text-blue-800',
  permitting: 'bg-purple-100 text-purple-800',
  construction: 'bg-orange-100 text-orange-800',
  finance: 'bg-green-100 text-green-800',
  design: 'bg-indigo-100 text-indigo-800',
  due_diligence: 'bg-yellow-100 text-yellow-800',
  admin: 'bg-gray-100 text-gray-800',
};

const priorityColors = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-gray-100 text-gray-600',
};

export default function TaskWorkflowTemplatesPage() {
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [expandedTemplates, setExpandedTemplates] = useState([1]);
  const [filterProjectType, setFilterProjectType] = useState('all');
  const [showAddTemplate, setShowAddTemplate] = useState(false);

  const filteredTemplates = useMemo(() => {
    if (filterProjectType === 'all') return mockTemplates;
    return mockTemplates.filter(t => t.projectType === filterProjectType);
  }, [filterProjectType]);

  const stats = useMemo(() => ({
    totalTemplates: mockTemplates.length,
    activeTemplates: mockTemplates.filter(t => t.isActive).length,
    totalTasks: mockTemplates.reduce((sum, t) => sum + t.tasks.length, 0),
    projectTypesWithTemplates: [...new Set(mockTemplates.map(t => t.projectType))].length,
  }), []);

  const toggleExpanded = (id) => {
    setExpandedTemplates(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Workflow Templates</h1>
          <p className="text-gray-600">Define task sequences that auto-generate based on project events</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Settings className="w-4 h-4 mr-2" />Settings</Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddTemplate(true)}>
            <Plus className="w-4 h-4 mr-2" />New Template
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">Automated Task Generation</h3>
            <p className="text-sm text-blue-800 mt-1">
              Templates automatically create tasks when trigger events occur. For example, when a scattered lot
              contract is executed, the system generates permitting tasks due within 60 days, assigns them to the
              appropriate contractor contact, and tracks completion.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-sm">Total Templates</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalTemplates}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Play className="w-4 h-4" />
            <span className="text-sm">Active</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.activeTemplates}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Total Tasks Defined</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.totalTasks}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Building className="w-4 h-4" />
            <span className="text-sm">Project Types</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats.projectTypesWithTemplates}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {['templates', 'triggers', 'responsible_parties'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px",
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {tab === 'templates' && 'Workflow Templates'}
            {tab === 'triggers' && 'Trigger Events'}
            {tab === 'responsible_parties' && 'Responsible Party Roles'}
          </button>
        ))}
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex gap-4 items-center">
            <select
              value={filterProjectType}
              onChange={(e) => setFilterProjectType(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Project Types</option>
              {PROJECT_TYPES.map(pt => (
                <option key={pt.id} value={pt.id}>{pt.name}</option>
              ))}
            </select>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search templates..." className="pl-10" />
            </div>
          </div>

          {/* Template List */}
          <div className="space-y-4">
            {filteredTemplates.map((template) => {
              const isExpanded = expandedTemplates.includes(template.id);
              const projectType = PROJECT_TYPES.find(pt => pt.id === template.projectType);
              const triggerEvent = TRIGGER_EVENTS.find(te => te.id === template.triggerEvent);

              return (
                <div key={template.id} className="bg-white rounded-lg border overflow-hidden">
                  {/* Header */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleExpanded(template.id)}
                  >
                    <div className="flex items-center gap-4">
                      {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{template.name}</h3>
                          {template.isActive ? (
                            <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-800 flex items-center gap-1">
                              <Play className="w-3 h-3" />Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 flex items-center gap-1">
                              <Pause className="w-3 h-3" />Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{template.tasks.length} tasks</p>
                        <p className="text-xs text-gray-500">{projectType?.name}</p>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-lg">
                        <Zap className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-purple-700">{triggerEvent?.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t">
                      <div className="p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-700">Task Sequence</h4>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline"><Copy className="w-3 h-3 mr-1" />Duplicate</Button>
                            <Button size="sm" variant="outline"><Edit className="w-3 h-3 mr-1" />Edit</Button>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg border overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                              <tr className="text-left text-gray-500">
                                <th className="p-3 w-8">#</th>
                                <th className="p-3">Task</th>
                                <th className="p-3">Category</th>
                                <th className="p-3">Due (Days)</th>
                                <th className="p-3">Responsible Party</th>
                                <th className="p-3">Priority</th>
                                <th className="p-3">Dependencies</th>
                              </tr>
                            </thead>
                            <tbody>
                              {template.tasks.map((task, idx) => (
                                <tr key={task.id} className="border-b hover:bg-gray-50">
                                  <td className="p-3 text-gray-400">{idx + 1}</td>
                                  <td className="p-3 font-medium text-gray-900">{task.title}</td>
                                  <td className="p-3">
                                    <span className={cn("px-2 py-0.5 rounded text-xs capitalize", categoryColors[task.category])}>
                                      {task.category.replace('_', ' ')}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-gray-400" />
                                      <span>+{task.daysFromTrigger} days</span>
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <div className="flex items-center gap-2">
                                      {task.responsiblePartyType === 'external_contact' ? (
                                        <Briefcase className="w-4 h-4 text-purple-500" />
                                      ) : (
                                        <User className="w-4 h-4 text-blue-500" />
                                      )}
                                      <span className="text-gray-700 capitalize">
                                        {task.responsiblePartyRole.replace('_', ' ')}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <span className={cn("px-2 py-0.5 rounded text-xs capitalize", priorityColors[task.priority])}>
                                      {task.priority}
                                    </span>
                                  </td>
                                  <td className="p-3 text-gray-500">
                                    {task.dependencies.length > 0 ? (
                                      <span className="text-xs">After: {task.dependencies.join(', ')}</span>
                                    ) : (
                                      <span className="text-xs text-gray-400">None</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Triggers Tab */}
      {activeTab === 'triggers' && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">Trigger Events</h3>
            <p className="text-sm text-yellow-800">
              Trigger events are system actions that automatically generate tasks from templates.
              When an event fires, all active templates matching that event will create tasks.
            </p>
          </div>

          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-sm text-gray-500">
                  <th className="p-4">Event</th>
                  <th className="p-4">Module</th>
                  <th className="p-4">Active Templates</th>
                  <th className="p-4">Total Tasks Generated</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {TRIGGER_EVENTS.map((event) => {
                  const templatesForEvent = mockTemplates.filter(t => t.triggerEvent === event.id && t.isActive);
                  const tasksCount = templatesForEvent.reduce((sum, t) => sum + t.tasks.length, 0);
                  return (
                    <tr key={event.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-purple-500" />
                          <span className="font-medium">{event.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">{event.module}</span>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "font-medium",
                          templatesForEvent.length > 0 ? "text-green-600" : "text-gray-400"
                        )}>
                          {templatesForEvent.length}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">{tasksCount} tasks</td>
                      <td className="p-4">
                        <Button size="sm" variant="outline">View Templates</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Responsible Parties Tab */}
      {activeTab === 'responsible_parties' && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">Responsible Party Assignment</h3>
            <p className="text-sm text-green-800">
              Tasks can be assigned to internal users/teams OR external project contacts.
              When a task is generated, the system looks up the project's contacts to find the
              appropriate party (e.g., the project's "Contractor" contact for construction tasks).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Internal Roles */}
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Internal Roles</h3>
              </div>
              <div className="space-y-2">
                {[
                  { role: 'project_manager', name: 'Project Manager', description: 'Primary project oversight' },
                  { role: 'construction_manager', name: 'Construction Manager', description: 'On-site construction oversight' },
                  { role: 'finance_team', name: 'Finance Team', description: 'Budget and draw management' },
                  { role: 'sales_agent', name: 'Sales Agent', description: 'Sales and marketing tasks' },
                  { role: 'admin', name: 'Administrative', description: 'General admin tasks' },
                ].map((item) => (
                  <div key={item.role} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                    <Button size="sm" variant="ghost"><Edit className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
            </div>

            {/* External Contact Categories */}
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold">External Contact Categories</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Tasks assigned to these categories will be assigned to the matching project contact.
              </p>
              <div className="space-y-2">
                {CONTACT_CATEGORIES.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{cat.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">Project Contact</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Template Modal */}
      {showAddTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">Create Workflow Template</h3>
              <button onClick={() => setShowAddTemplate(false)} className="text-gray-500 hover:text-gray-700">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Template Name *</label>
                <Input placeholder="e.g., Scattered Lot - Standard Acquisition" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Project Type</label>
                  <select className="w-full border rounded-md px-3 py-2">
                    {PROJECT_TYPES.map(pt => (
                      <option key={pt.id} value={pt.id}>{pt.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Trigger Event</label>
                  <select className="w-full border rounded-md px-3 py-2">
                    {TRIGGER_EVENTS.map(te => (
                      <option key={te.id} value={te.id}>{te.name} ({te.module})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description</label>
                <textarea className="w-full border rounded-md px-3 py-2" rows={2} placeholder="Describe when this template should be used..." />
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Tasks</h4>
                  <Button size="sm" variant="outline"><Plus className="w-3 h-3 mr-1" />Add Task</Button>
                </div>
                <p className="text-sm text-gray-500">Add tasks that will be auto-generated when this template triggers.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setShowAddTemplate(false)}>Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700">Create Template</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
