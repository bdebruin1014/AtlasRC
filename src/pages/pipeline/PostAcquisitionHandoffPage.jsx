import React, { useState, useMemo } from 'react';
import {
  ArrowRight, Building, CheckCircle, Clock, AlertTriangle, Users,
  FileText, Key, DollarSign, ClipboardCheck, ChevronDown, ChevronRight,
  User, Calendar, MapPin, Briefcase, Settings, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const mockHandoffs = [
  {
    id: 'HAND-2024-0005',
    property: 'Metro Industrial Complex',
    address: '2200 Commerce Way, Dallas, TX',
    type: 'Industrial',
    purchasePrice: 30500000,
    closingDate: '2024-03-15',
    status: 'in_progress',
    progress: 45,
    acquisitionLead: 'Sarah Johnson',
    assetManager: 'Mike Rodriguez',
    propertyManager: 'Elite Property Services',
    categories: [
      {
        name: 'Legal & Documentation',
        icon: 'FileText',
        items: [
          { task: 'Transfer closing documents to asset management', status: 'completed', assignee: 'Legal Team', dueDate: '2024-03-16' },
          { task: 'Provide lease abstracts for all tenants', status: 'completed', assignee: 'John Smith', dueDate: '2024-03-18' },
          { task: 'Transfer insurance policies', status: 'in_progress', assignee: 'Risk Team', dueDate: '2024-03-20' },
          { task: 'Transfer vendor contracts', status: 'pending', assignee: 'Sarah Johnson', dueDate: '2024-03-22' },
          { task: 'Provide title insurance policy', status: 'completed', assignee: 'Legal Team', dueDate: '2024-03-16' }
        ]
      },
      {
        name: 'Financial Setup',
        icon: 'DollarSign',
        items: [
          { task: 'Set up property in accounting system', status: 'completed', assignee: 'Accounting Team', dueDate: '2024-03-16' },
          { task: 'Create chart of accounts', status: 'completed', assignee: 'Accounting Team', dueDate: '2024-03-17' },
          { task: 'Transfer security deposits to operating account', status: 'in_progress', assignee: 'Finance Team', dueDate: '2024-03-20' },
          { task: 'Set up tenant billing', status: 'pending', assignee: 'Property Manager', dueDate: '2024-03-22' },
          { task: 'Transfer operating budget', status: 'pending', assignee: 'John Smith', dueDate: '2024-03-25' },
          { task: 'Provide capital expenditure plan', status: 'pending', assignee: 'Sarah Johnson', dueDate: '2024-03-25' }
        ]
      },
      {
        name: 'Operations Transition',
        icon: 'Settings',
        items: [
          { task: 'Transfer utility accounts', status: 'pending', assignee: 'Property Manager', dueDate: '2024-03-18' },
          { task: 'Introduce asset manager to tenants', status: 'pending', assignee: 'Mike Rodriguez', dueDate: '2024-03-20' },
          { task: 'Transfer maintenance contracts', status: 'pending', assignee: 'Property Manager', dueDate: '2024-03-22' },
          { task: 'Provide property condition report', status: 'completed', assignee: 'John Smith', dueDate: '2024-03-16' },
          { task: 'Transfer access credentials and keys', status: 'pending', assignee: 'Sarah Johnson', dueDate: '2024-03-15' }
        ]
      },
      {
        name: 'Team Introduction',
        icon: 'Users',
        items: [
          { task: 'Schedule acquisition-to-AM kickoff meeting', status: 'completed', assignee: 'Sarah Johnson', dueDate: '2024-03-14' },
          { task: 'Complete property walkthrough with AM', status: 'in_progress', assignee: 'Mike Rodriguez', dueDate: '2024-03-18' },
          { task: 'Introduce PM to asset manager', status: 'pending', assignee: 'Sarah Johnson', dueDate: '2024-03-18' },
          { task: 'Transfer key contacts list', status: 'completed', assignee: 'John Smith', dueDate: '2024-03-16' }
        ]
      },
      {
        name: 'Business Plan Handoff',
        icon: 'Briefcase',
        items: [
          { task: 'Present investment thesis and strategy', status: 'completed', assignee: 'Sarah Johnson', dueDate: '2024-03-14' },
          { task: 'Transfer underwriting model', status: 'completed', assignee: 'John Smith', dueDate: '2024-03-15' },
          { task: 'Provide market research and comps', status: 'completed', assignee: 'John Smith', dueDate: '2024-03-16' },
          { task: 'Review leasing strategy', status: 'in_progress', assignee: 'Mike Rodriguez', dueDate: '2024-03-20' },
          { task: 'Define year-1 KPIs and targets', status: 'pending', assignee: 'Mike Rodriguez', dueDate: '2024-03-25' }
        ]
      }
    ],
    notes: 'Priority focus on tenant retention and executing repositioning strategy per investment memo.'
  },
  {
    id: 'HAND-2024-0004',
    property: 'Riverside Plaza Phase 2',
    address: '200 Riverside Dr, Austin, TX',
    type: 'Mixed-Use',
    purchasePrice: 28000000,
    closingDate: '2024-02-28',
    status: 'completed',
    progress: 100,
    acquisitionLead: 'Lisa Wang',
    assetManager: 'Tom Davis',
    propertyManager: 'Atlas Management Co.',
    categories: [],
    notes: 'Handoff completed successfully.'
  }
];

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-800' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800' }
};

const categoryIcons = {
  'Legal & Documentation': FileText,
  'Financial Setup': DollarSign,
  'Operations Transition': Settings,
  'Team Introduction': Users,
  'Business Plan Handoff': Briefcase
};

export default function PostAcquisitionHandoffPage() {
  const [selectedHandoff, setSelectedHandoff] = useState(mockHandoffs[0]);
  const [expandedCategories, setExpandedCategories] = useState(['Legal & Documentation', 'Financial Setup', 'Team Introduction']);

  const toggleCategory = (category) => {
    setExpandedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const getCategoryProgress = (items) => {
    const completed = items.filter(i => i.status === 'completed').length;
    return Math.round((completed / items.length) * 100);
  };

  const stats = useMemo(() => ({
    active: mockHandoffs.filter(h => h.status === 'in_progress').length,
    completed: mockHandoffs.filter(h => h.status === 'completed').length,
    tasksRemaining: mockHandoffs
      .filter(h => h.status === 'in_progress')
      .flatMap(h => h.categories.flatMap(c => c.items))
      .filter(i => i.status !== 'completed').length,
    overdue: mockHandoffs
      .filter(h => h.status === 'in_progress')
      .flatMap(h => h.categories.flatMap(c => c.items))
      .filter(i => i.status !== 'completed' && new Date(i.dueDate) < new Date()).length
  }), []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Post-Acquisition Handoff</h1>
          <p className="text-gray-600">Transition properties from acquisitions to asset management</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Play className="w-4 h-4 mr-2" />Start Handoff
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><ArrowRight className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-sm text-gray-600">Active Handoffs</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg"><ClipboardCheck className="w-5 h-5 text-yellow-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.tasksRemaining}</p>
              <p className="text-sm text-gray-600">Tasks Remaining</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
              <p className="text-sm text-gray-600">Overdue Tasks</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1 space-y-2">
          {mockHandoffs.map((handoff) => (
            <div
              key={handoff.id}
              onClick={() => setSelectedHandoff(handoff)}
              className={cn(
                "bg-white rounded-lg border p-4 cursor-pointer hover:border-blue-300 transition-colors",
                selectedHandoff?.id === handoff.id ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="font-medium text-gray-900">{handoff.property}</p>
                <span className={cn("px-2 py-0.5 rounded text-xs", statusConfig[handoff.status].color)}>{statusConfig[handoff.status].label}</span>
              </div>
              <p className="text-sm text-gray-500 mb-2">{handoff.type} • ${(handoff.purchasePrice / 1000000).toFixed(1)}M</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", handoff.progress === 100 ? "bg-green-500" : "bg-blue-500")} style={{ width: `${handoff.progress}%` }} />
                </div>
                <span className="text-sm text-gray-600">{handoff.progress}%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-3 space-y-4">
          {selectedHandoff && (
            <>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-gray-900">{selectedHandoff.property}</h2>
                      <span className={cn("px-2 py-1 rounded-full text-xs", statusConfig[selectedHandoff.status].color)}>{statusConfig[selectedHandoff.status].label}</span>
                    </div>
                    <p className="text-gray-600 flex items-center gap-1"><MapPin className="w-4 h-4" />{selectedHandoff.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Closed</p>
                    <p className="text-lg font-bold text-gray-900">{selectedHandoff.closingDate}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Acquisitions Lead</p>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{selectedHandoff.acquisitionLead}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Asset Manager</p>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-gray-900">{selectedHandoff.assetManager}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Property Manager</p>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{selectedHandoff.propertyManager}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-8 py-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Briefcase className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">Acquisitions</p>
                  </div>
                  <ArrowRight className="w-8 h-8 text-blue-500" />
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Building className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">Asset Management</p>
                  </div>
                </div>
              </div>

              {selectedHandoff.status !== 'completed' && (
                <div className="space-y-3">
                  {selectedHandoff.categories.map((category) => {
                    const Icon = categoryIcons[category.name] || FileText;
                    const isExpanded = expandedCategories.includes(category.name);
                    const progress = getCategoryProgress(category.items);

                    return (
                      <div key={category.name} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div
                          className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                          onClick={() => toggleCategory(category.name)}
                        >
                          <div className="flex items-center gap-3">
                            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                            <Icon className="w-5 h-5 text-gray-600" />
                            <h3 className="font-semibold text-gray-900">{category.name}</h3>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-32">
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className={cn("h-full rounded-full", progress === 100 ? "bg-green-500" : "bg-blue-500")} style={{ width: `${progress}%` }} />
                              </div>
                            </div>
                            <span className="text-sm text-gray-600">{category.items.filter(i => i.status === 'completed').length}/{category.items.length}</span>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="border-t border-gray-200 divide-y divide-gray-100">
                            {category.items.map((item, idx) => {
                              const isOverdue = item.status !== 'completed' && new Date(item.dueDate) < new Date();
                              return (
                                <div key={idx} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                                  <div className="flex items-center gap-3">
                                    {item.status === 'completed' ? (
                                      <CheckCircle className="w-5 h-5 text-green-600" />
                                    ) : item.status === 'in_progress' ? (
                                      <Clock className="w-5 h-5 text-blue-600" />
                                    ) : (
                                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                                    )}
                                    <div>
                                      <p className={cn("text-sm", item.status === 'completed' && "text-gray-500")}>{item.task}</p>
                                      <p className="text-xs text-gray-500">{item.assignee}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className={cn("text-xs", isOverdue ? "text-red-600 font-medium" : "text-gray-500")}>
                                      {isOverdue && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                                      {item.dueDate}
                                    </span>
                                    {item.status === 'pending' && <Button size="sm" variant="outline">Start</Button>}
                                    {item.status === 'in_progress' && <Button size="sm" variant="outline" className="text-green-600">Complete</Button>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedHandoff.status === 'completed' && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Handoff Complete</h3>
                      <p className="text-sm text-gray-600">Property successfully transitioned to asset management</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 bg-green-50 p-4 rounded-lg">{selectedHandoff.notes}</p>
                </div>
              )}

              {selectedHandoff.notes && selectedHandoff.status !== 'completed' && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 bg-yellow-50">
                  <h3 className="font-semibold text-gray-900 mb-2">Handoff Notes</h3>
                  <p className="text-sm text-gray-700">{selectedHandoff.notes}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
