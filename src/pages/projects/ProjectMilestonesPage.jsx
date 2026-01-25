import React, { useState, useMemo } from 'react';
import {
  Target, Plus, Calendar, CheckCircle, Clock, AlertTriangle,
  ChevronRight, ChevronDown, User, Briefcase, Flag, Link,
  Edit, Trash2, Eye, MoreVertical, Zap, ArrowRight, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/*
 * PROJECT MILESTONES - CRITICAL DEADLINE TRACKING
 *
 * Milestones are key project deadlines that:
 * 1. Have associated tasks that must complete before the milestone
 * 2. Can trigger automatic task generation when reached
 * 3. Are calculated relative to reference dates (contract date, permit date, etc.)
 * 4. Alert on risk when dependent tasks are behind schedule
 *
 * Example: "Permit Approval" milestone:
 * - Due 60 days from contract effective date
 * - Requires completion of: survey, title commitment, permit application
 * - When at risk, sends alerts to project manager and contractor
 */

const mockMilestones = [
  {
    id: 'ms-1',
    name: 'Due Diligence Complete',
    description: 'All due diligence items completed and reviewed',
    category: 'acquisition',
    dueDate: '2024-02-15',
    calculatedFrom: 'contract_date',
    daysFromReference: 30,
    status: 'completed',
    completedDate: '2024-02-12',
    progress: 100,
    dependentTasks: [
      { id: 't1', title: 'Order Title Commitment', status: 'completed', responsible: 'Taylor Law Firm' },
      { id: 't2', title: 'Complete Property Survey', status: 'completed', responsible: 'Harris Surveying' },
      { id: 't3', title: 'Environmental Review', status: 'completed', responsible: 'Bryan VanRock' },
    ],
    triggeredBy: null,
    triggers: ['contract_executed'],
    owner: { type: 'internal', name: 'Bryan VanRock', role: 'Project Manager' }
  },
  {
    id: 'ms-2',
    name: 'Construction Loan Closing',
    description: 'Close on construction financing',
    category: 'finance',
    dueDate: '2024-02-28',
    calculatedFrom: 'contract_date',
    daysFromReference: 45,
    status: 'on-track',
    completedDate: null,
    progress: 75,
    dependentTasks: [
      { id: 't4', title: 'Finalize Loan Documents', status: 'in-progress', responsible: 'First National Bank' },
      { id: 't5', title: 'Insurance Certificate', status: 'completed', responsible: 'Sarah Mitchell' },
      { id: 't6', title: 'Title Insurance Commitment', status: 'completed', responsible: 'Taylor Law Firm' },
    ],
    triggeredBy: 'ms-1',
    triggers: ['loan_closed'],
    owner: { type: 'external', name: 'Sarah Williams', company: 'First National Bank' }
  },
  {
    id: 'ms-3',
    name: 'Permit Approval',
    description: 'Building permit approved by city - CRITICAL: 60 days from contract',
    category: 'permitting',
    dueDate: '2024-03-15',
    calculatedFrom: 'contract_date',
    daysFromReference: 60,
    status: 'at-risk',
    completedDate: null,
    progress: 45,
    dependentTasks: [
      { id: 't7', title: 'Submit Building Permit Application', status: 'in-progress', responsible: 'Johnson Builders' },
      { id: 't8', title: 'Engineering Drawings Approved', status: 'todo', responsible: 'Brown Civil Engineering' },
      { id: 't9', title: 'Zoning Verification', status: 'completed', responsible: 'Bryan VanRock' },
      { id: 't10', title: 'Utility Tap Fee Payment', status: 'todo', responsible: 'Sarah Mitchell' },
    ],
    triggeredBy: null,
    triggers: ['permit_approved', 'construction_start'],
    owner: { type: 'external', name: 'Mike Johnson', company: 'Johnson Builders' }
  },
  {
    id: 'ms-4',
    name: 'Construction Start',
    description: 'Break ground and begin construction',
    category: 'construction',
    dueDate: '2024-04-01',
    calculatedFrom: 'permit_date',
    daysFromReference: 15,
    status: 'pending',
    completedDate: null,
    progress: 0,
    dependentTasks: [
      { id: 't11', title: 'Pre-Construction Meeting', status: 'todo', responsible: 'Mike Chen' },
      { id: 't12', title: 'Order Materials Package', status: 'todo', responsible: 'Johnson Builders' },
      { id: 't13', title: 'Mobilize Site', status: 'todo', responsible: 'Johnson Builders' },
    ],
    triggeredBy: 'ms-3',
    triggers: ['construction_started'],
    owner: { type: 'external', name: 'Mike Johnson', company: 'Johnson Builders' }
  },
  {
    id: 'ms-5',
    name: 'Framing Complete',
    description: 'All framing and rough-in inspections passed',
    category: 'construction',
    dueDate: '2024-06-15',
    calculatedFrom: 'construction_start',
    daysFromReference: 75,
    status: 'pending',
    completedDate: null,
    progress: 0,
    dependentTasks: [],
    triggeredBy: 'ms-4',
    triggers: ['framing_complete'],
    owner: { type: 'external', name: 'Mike Johnson', company: 'Johnson Builders' }
  },
  {
    id: 'ms-6',
    name: 'Certificate of Occupancy',
    description: 'Receive CO and property ready for sale/occupancy',
    category: 'construction',
    dueDate: '2024-09-01',
    calculatedFrom: 'construction_start',
    daysFromReference: 150,
    status: 'pending',
    completedDate: null,
    progress: 0,
    dependentTasks: [],
    triggeredBy: 'ms-5',
    triggers: ['co_issued', 'listing_ready'],
    owner: { type: 'internal', name: 'Bryan VanRock', role: 'Project Manager' }
  },
];

const statusConfig = {
  'completed': { label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, dotColor: 'bg-green-500' },
  'on-track': { label: 'On Track', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: TrendingUp, dotColor: 'bg-blue-500' },
  'at-risk': { label: 'At Risk', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle, dotColor: 'bg-red-500' },
  'pending': { label: 'Pending', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: Clock, dotColor: 'bg-gray-400' },
};

const categoryConfig = {
  'acquisition': { label: 'Acquisition', color: 'bg-blue-500' },
  'permitting': { label: 'Permitting', color: 'bg-purple-500' },
  'construction': { label: 'Construction', color: 'bg-orange-500' },
  'finance': { label: 'Finance', color: 'bg-green-500' },
  'sales': { label: 'Sales', color: 'bg-pink-500' },
};

export default function ProjectMilestonesPage({ projectId }) {
  const [milestones] = useState(mockMilestones);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [expandedMilestones, setExpandedMilestones] = useState(['ms-3']);
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline', 'list', 'gantt'
  const [showAddMilestone, setShowAddMilestone] = useState(false);

  const stats = useMemo(() => ({
    total: milestones.length,
    completed: milestones.filter(m => m.status === 'completed').length,
    onTrack: milestones.filter(m => m.status === 'on-track').length,
    atRisk: milestones.filter(m => m.status === 'at-risk').length,
    pending: milestones.filter(m => m.status === 'pending').length,
    overallProgress: Math.round(milestones.reduce((sum, m) => sum + m.progress, 0) / milestones.length),
  }), [milestones]);

  const toggleExpanded = (id) => {
    setExpandedMilestones(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Project Milestones
          </h1>
          <p className="text-sm text-gray-500">
            Track critical deadlines and their dependent tasks
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Zap className="w-4 h-4 mr-1" />Auto-Calculate Dates</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowAddMilestone(true)}>
            <Plus className="w-4 h-4 mr-1" />Add Milestone
          </Button>
        </div>
      </div>

      {/* At-Risk Alert */}
      {stats.atRisk > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <div className="flex-1">
            <p className="font-medium text-red-900">{stats.atRisk} Milestone(s) At Risk</p>
            <p className="text-sm text-red-700">
              Dependent tasks are behind schedule. Review and take action to avoid delays.
            </p>
          </div>
          <Button size="sm" className="bg-red-600 hover:bg-red-700">View At-Risk Items</Button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Total Milestones</p>
          <p className="text-2xl font-semibold">{stats.total}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-xs text-gray-500">Completed</p>
          <p className="text-2xl font-semibold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-xs text-gray-500">On Track</p>
          <p className="text-2xl font-semibold text-blue-600">{stats.onTrack}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-red-500">
          <p className="text-xs text-gray-500">At Risk</p>
          <p className="text-2xl font-semibold text-red-600">{stats.atRisk}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-gray-400">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-2xl font-semibold text-gray-600">{stats.pending}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Overall Progress</p>
          <p className="text-2xl font-semibold">{stats.overallProgress}%</p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 mb-4">
        <Button
          size="sm"
          variant={viewMode === 'timeline' ? 'default' : 'outline'}
          onClick={() => setViewMode('timeline')}
        >
          Timeline
        </Button>
        <Button
          size="sm"
          variant={viewMode === 'list' ? 'default' : 'outline'}
          onClick={() => setViewMode('list')}
        >
          List View
        </Button>
      </div>

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="bg-white border rounded-lg p-6">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

            <div className="space-y-6">
              {milestones.map((milestone, idx) => {
                const status = statusConfig[milestone.status];
                const category = categoryConfig[milestone.category];
                const isExpanded = expandedMilestones.includes(milestone.id);
                const daysRemaining = getDaysRemaining(milestone.dueDate);

                return (
                  <div key={milestone.id} className="relative pl-16">
                    {/* Timeline dot */}
                    <div className={cn(
                      "absolute left-4 w-5 h-5 rounded-full border-4 border-white shadow-sm",
                      status.dotColor
                    )} />

                    {/* Connector line to next milestone */}
                    {milestone.triggeredBy && (
                      <div className="absolute left-6 -top-3 w-px h-3 bg-gray-300" />
                    )}

                    {/* Milestone card */}
                    <div className={cn(
                      "border rounded-lg overflow-hidden",
                      milestone.status === 'at-risk' && "border-red-300 bg-red-50"
                    )}>
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleExpanded(milestone.id)}
                      >
                        <div className="flex items-center gap-4">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{milestone.name}</h3>
                              <span className={cn("px-2 py-0.5 rounded text-xs", status.color)}>
                                {status.label}
                              </span>
                              <span className={cn("px-2 py-0.5 rounded text-xs text-white", category.color)}>
                                {category.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{milestone.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="font-medium">{milestone.dueDate}</p>
                            <p className={cn(
                              "text-xs",
                              daysRemaining < 0 ? "text-red-600" :
                              daysRemaining <= 7 ? "text-orange-600" : "text-gray-500"
                            )}>
                              {milestone.status === 'completed' ? 'Completed' :
                               daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` :
                               `${daysRemaining} days remaining`}
                            </p>
                          </div>
                          <div className="w-32">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Progress</span>
                              <span>{milestone.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={cn(
                                  "h-2 rounded-full",
                                  milestone.status === 'completed' ? "bg-green-500" :
                                  milestone.status === 'at-risk' ? "bg-red-500" : "bg-blue-500"
                                )}
                                style={{ width: `${milestone.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="border-t bg-white p-4">
                          <div className="grid grid-cols-2 gap-6">
                            {/* Dependent Tasks */}
                            <div>
                              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-gray-400" />
                                Dependent Tasks ({milestone.dependentTasks.filter(t => t.status === 'completed').length}/{milestone.dependentTasks.length})
                              </h4>
                              <div className="space-y-2">
                                {milestone.dependentTasks.map(task => (
                                  <div key={task.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                    {task.status === 'completed' ? (
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : task.status === 'in-progress' ? (
                                      <Clock className="w-4 h-4 text-blue-500" />
                                    ) : (
                                      <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                                    )}
                                    <div className="flex-1">
                                      <p className={cn("text-sm", task.status === 'completed' && "line-through text-gray-500")}>
                                        {task.title}
                                      </p>
                                      <p className="text-xs text-gray-500">{task.responsible}</p>
                                    </div>
                                    <span className={cn(
                                      "text-xs px-2 py-0.5 rounded capitalize",
                                      task.status === 'completed' ? "bg-green-100 text-green-700" :
                                      task.status === 'in-progress' ? "bg-blue-100 text-blue-700" :
                                      "bg-gray-100 text-gray-600"
                                    )}>
                                      {task.status.replace('-', ' ')}
                                    </span>
                                  </div>
                                ))}
                                {milestone.dependentTasks.length === 0 && (
                                  <p className="text-sm text-gray-500 italic">No dependent tasks defined</p>
                                )}
                              </div>
                            </div>

                            {/* Milestone Details */}
                            <div className="space-y-4">
                              {/* Owner */}
                              <div>
                                <h4 className="font-medium text-sm mb-2">Milestone Owner</h4>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                                  <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                                    milestone.owner.type === 'external' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                                  )}>
                                    {milestone.owner.name.split(' ').map(n => n[0]).join('')}
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{milestone.owner.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {milestone.owner.type === 'external' ? milestone.owner.company : milestone.owner.role}
                                    </p>
                                  </div>
                                  {milestone.owner.type === 'external' && (
                                    <Briefcase className="w-4 h-4 text-purple-400 ml-auto" />
                                  )}
                                </div>
                              </div>

                              {/* Triggers */}
                              {milestone.triggers.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                                    <Zap className="w-4 h-4 text-purple-500" />
                                    Workflow Triggers
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {milestone.triggers.map(trigger => (
                                      <span key={trigger} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded capitalize">
                                        {trigger.replace('_', ' ')}
                                      </span>
                                    ))}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    When this milestone completes, these workflow events will fire
                                  </p>
                                </div>
                              )}

                              {/* Date Calculation */}
                              <div>
                                <h4 className="font-medium text-sm mb-2">Date Calculation</h4>
                                <p className="text-sm text-gray-600">
                                  {milestone.daysFromReference} days from <span className="font-medium capitalize">{milestone.calculatedFrom.replace('_', ' ')}</span>
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                            <Button size="sm" variant="outline"><Edit className="w-3 h-3 mr-1" />Edit</Button>
                            <Button size="sm" variant="outline" className="text-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />Mark Complete
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-sm text-gray-500">
                <th className="p-4">Milestone</th>
                <th className="p-4">Category</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Days</th>
                <th className="p-4">Progress</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {milestones.map(milestone => {
                const status = statusConfig[milestone.status];
                const category = categoryConfig[milestone.category];
                const daysRemaining = getDaysRemaining(milestone.dueDate);

                return (
                  <tr key={milestone.id} className={cn(
                    "border-b hover:bg-gray-50",
                    milestone.status === 'at-risk' && "bg-red-50"
                  )}>
                    <td className="p-4">
                      <p className="font-medium">{milestone.name}</p>
                      <p className="text-xs text-gray-500">{milestone.dependentTasks.length} tasks</p>
                    </td>
                    <td className="p-4">
                      <span className={cn("px-2 py-0.5 rounded text-xs text-white", category.color)}>
                        {category.label}
                      </span>
                    </td>
                    <td className="p-4">{milestone.dueDate}</td>
                    <td className="p-4">
                      <span className={cn(
                        "text-sm font-medium",
                        daysRemaining < 0 ? "text-red-600" :
                        daysRemaining <= 7 ? "text-orange-600" : "text-gray-600"
                      )}>
                        {milestone.status === 'completed' ? '-' :
                         daysRemaining < 0 ? `${Math.abs(daysRemaining)}d late` :
                         `${daysRemaining}d`}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={cn("h-2 rounded-full", status.dotColor)}
                            style={{ width: `${milestone.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{milestone.progress}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                          milestone.owner.type === 'external' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                        )}>
                          {milestone.owner.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm">{milestone.owner.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={cn("px-2 py-0.5 rounded text-xs", status.color)}>
                        {status.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedMilestone(milestone)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Milestone Modal */}
      {showAddMilestone && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">Add Milestone</h3>
              <button onClick={() => setShowAddMilestone(false)}>×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Milestone Name *</label>
                <Input placeholder="e.g., Permit Approval" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description</label>
                <textarea className="w-full border rounded-md px-3 py-2" rows={2} placeholder="Describe this milestone..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Category</label>
                  <select className="w-full border rounded-md px-3 py-2">
                    {Object.entries(categoryConfig).map(([id, cat]) => (
                      <option key={id} value={id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Due Date</label>
                  <Input type="date" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Calculate From</label>
                  <select className="w-full border rounded-md px-3 py-2">
                    <option value="contract_date">Contract Date</option>
                    <option value="permit_date">Permit Date</option>
                    <option value="construction_start">Construction Start</option>
                    <option value="manual">Manual Date</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Days From Reference</label>
                  <Input type="number" placeholder="e.g., 60" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Milestone Owner</label>
                <select className="w-full border rounded-md px-3 py-2">
                  <option value="">Select owner...</option>
                  <optgroup label="Internal Team">
                    <option value="internal:1">Bryan VanRock - Project Manager</option>
                    <option value="internal:2">Mike Chen - Construction Manager</option>
                  </optgroup>
                  <optgroup label="Project Contacts">
                    <option value="external:1">Mike Johnson - Johnson Builders</option>
                    <option value="external:2">Jennifer Taylor - Taylor Law Firm</option>
                  </optgroup>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setShowAddMilestone(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]">Add Milestone</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
