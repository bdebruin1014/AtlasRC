import React, { useState, useMemo } from 'react';
import {
  Key, CheckCircle, XCircle, Clock, AlertTriangle, Building,
  DollarSign, Calendar, FileText, User, Users, Phone, Mail,
  ChevronDown, ChevronRight, MapPin, CheckSquare, Square
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const mockClosings = [
  {
    id: 'CLOSE-2024-0008',
    property: 'Metro Industrial Complex',
    address: '2200 Commerce Way, Dallas, TX',
    purchasePrice: 30500000,
    scheduledDate: '2024-03-15',
    status: 'on_track',
    daysUntilClose: 52,
    escrowAgent: 'First American Title',
    escrowContact: 'Maria Santos',
    escrowPhone: '(214) 555-0123',
    lender: 'Wells Fargo Commercial',
    lenderContact: 'James Wilson',
    lenderPhone: '(214) 555-0456',
    team: [
      { name: 'Sarah Johnson', role: 'Lead', email: 'sjohnson@atlas.com' },
      { name: 'John Smith', role: 'Analyst', email: 'jsmith@atlas.com' },
      { name: 'Legal Team', role: 'Legal', email: 'legal@atlas.com' }
    ],
    checklist: [
      {
        category: 'Due Diligence Completion',
        items: [
          { task: 'Title commitment received and reviewed', status: 'completed', dueDate: '2024-02-15', assignee: 'Legal Team' },
          { task: 'Survey completed and approved', status: 'completed', dueDate: '2024-02-20', assignee: 'John Smith' },
          { task: 'Phase I environmental cleared', status: 'completed', dueDate: '2024-02-10', assignee: 'John Smith' },
          { task: 'Property condition report finalized', status: 'in_progress', dueDate: '2024-02-25', assignee: 'John Smith' },
          { task: 'Estoppel certificates collected', status: 'in_progress', dueDate: '2024-02-28', assignee: 'Sarah Johnson' }
        ]
      },
      {
        category: 'Financing',
        items: [
          { task: 'Loan commitment received', status: 'completed', dueDate: '2024-02-28', assignee: 'Sarah Johnson' },
          { task: 'Appraisal completed', status: 'completed', dueDate: '2024-02-25', assignee: 'Lender' },
          { task: 'Loan documents prepared', status: 'pending', dueDate: '2024-03-08', assignee: 'Lender' },
          { task: 'Insurance binder obtained', status: 'pending', dueDate: '2024-03-10', assignee: 'Risk Team' }
        ]
      },
      {
        category: 'Legal & Documentation',
        items: [
          { task: 'PSA fully executed', status: 'completed', dueDate: '2024-01-25', assignee: 'Legal Team' },
          { task: 'Assignment documents prepared', status: 'pending', dueDate: '2024-03-05', assignee: 'Legal Team' },
          { task: 'Entity formation/qualification', status: 'completed', dueDate: '2024-02-15', assignee: 'Legal Team' },
          { task: 'Closing documents reviewed', status: 'pending', dueDate: '2024-03-10', assignee: 'Legal Team' },
          { task: 'FIRPTA compliance verified', status: 'pending', dueDate: '2024-03-12', assignee: 'Legal Team' }
        ]
      },
      {
        category: 'Closing Day',
        items: [
          { task: 'Final walk-through completed', status: 'pending', dueDate: '2024-03-14', assignee: 'John Smith' },
          { task: 'Wire transfer instructions confirmed', status: 'pending', dueDate: '2024-03-14', assignee: 'Finance Team' },
          { task: 'Closing funds wired', status: 'pending', dueDate: '2024-03-15', assignee: 'Finance Team' },
          { task: 'Documents executed', status: 'pending', dueDate: '2024-03-15', assignee: 'Sarah Johnson' },
          { task: 'Keys and access transferred', status: 'pending', dueDate: '2024-03-15', assignee: 'Sarah Johnson' },
          { task: 'Recording confirmed', status: 'pending', dueDate: '2024-03-15', assignee: 'Escrow' }
        ]
      }
    ],
    funds: {
      purchasePrice: 30500000,
      earnestMoney: 500000,
      closingCosts: 185000,
      loanAmount: 21350000,
      equityRequired: 9835000
    }
  },
  {
    id: 'CLOSE-2024-0007',
    property: 'Harbor View Apartments',
    address: '850 Harbor Way, San Diego, CA',
    purchasePrice: 42500000,
    scheduledDate: '2024-04-01',
    status: 'pending',
    daysUntilClose: 69,
    escrowAgent: 'Chicago Title',
    escrowContact: 'Linda Park',
    escrowPhone: '(619) 555-0789',
    lender: 'Bank of America',
    lenderContact: 'Michael Brown',
    lenderPhone: '(619) 555-0321',
    team: [
      { name: 'John Smith', role: 'Lead', email: 'jsmith@atlas.com' },
      { name: 'Lisa Wang', role: 'Analyst', email: 'lwang@atlas.com' }
    ],
    checklist: [
      {
        category: 'Due Diligence Completion',
        items: [
          { task: 'Title commitment received', status: 'pending', dueDate: '2024-03-01', assignee: 'Legal Team' },
          { task: 'Survey ordered', status: 'pending', dueDate: '2024-02-25', assignee: 'John Smith' }
        ]
      }
    ],
    funds: {
      purchasePrice: 42500000,
      earnestMoney: 750000,
      closingCosts: 255000,
      loanAmount: 29750000,
      equityRequired: 13755000
    }
  }
];

const statusConfig = {
  on_track: { label: 'On Track', color: 'bg-green-100 text-green-800' },
  at_risk: { label: 'At Risk', color: 'bg-yellow-100 text-yellow-800' },
  delayed: { label: 'Delayed', color: 'bg-red-100 text-red-800' },
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-800' },
  closed: { label: 'Closed', color: 'bg-blue-100 text-blue-800' }
};

export default function ClosingCoordinationWorkflowPage() {
  const [selectedClosing, setSelectedClosing] = useState(mockClosings[0]);
  const [expandedCategories, setExpandedCategories] = useState(['Due Diligence Completion', 'Financing']);

  const toggleCategory = (category) => {
    setExpandedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const getChecklistStats = (checklist) => {
    const allItems = checklist.flatMap(c => c.items);
    return {
      total: allItems.length,
      completed: allItems.filter(i => i.status === 'completed').length,
      inProgress: allItems.filter(i => i.status === 'in_progress').length,
      pending: allItems.filter(i => i.status === 'pending').length
    };
  };

  const stats = useMemo(() => {
    const checklistStats = getChecklistStats(selectedClosing.checklist);
    return {
      progress: Math.round((checklistStats.completed / checklistStats.total) * 100),
      ...checklistStats
    };
  }, [selectedClosing]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Closing Coordination</h1>
          <p className="text-gray-600">Track and manage property closings</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <FileText className="w-4 h-4 mr-2" />Closing Checklist Template
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1 space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900">Upcoming Closings</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {mockClosings.map((closing) => (
                <div
                  key={closing.id}
                  onClick={() => setSelectedClosing(closing)}
                  className={cn(
                    "p-4 cursor-pointer hover:bg-gray-50 transition-colors",
                    selectedClosing?.id === closing.id && "bg-blue-50 border-l-4 border-blue-500"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-gray-900 text-sm">{closing.property}</p>
                    <span className={cn("px-2 py-0.5 rounded text-xs", statusConfig[closing.status].color)}>{statusConfig[closing.status].label}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">${(closing.purchasePrice / 1000000).toFixed(1)}M</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{closing.scheduledDate}</span>
                    <span className="text-xs font-medium text-blue-600">{closing.daysUntilClose}d</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-3 space-y-4">
          {selectedClosing && (
            <>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-gray-900">{selectedClosing.property}</h2>
                      <span className={cn("px-2 py-1 rounded-full text-xs", statusConfig[selectedClosing.status].color)}>{statusConfig[selectedClosing.status].label}</span>
                    </div>
                    <p className="text-gray-600 flex items-center gap-1"><MapPin className="w-4 h-4" />{selectedClosing.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Closing Date</p>
                    <p className="text-xl font-bold text-gray-900">{selectedClosing.scheduledDate}</p>
                    <p className="text-sm text-blue-600">{selectedClosing.daysUntilClose} days remaining</p>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Purchase Price</p>
                    <p className="text-lg font-bold text-gray-900">${(selectedClosing.funds.purchasePrice / 1000000).toFixed(1)}M</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Loan Amount</p>
                    <p className="text-lg font-bold text-gray-900">${(selectedClosing.funds.loanAmount / 1000000).toFixed(1)}M</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Equity Required</p>
                    <p className="text-lg font-bold text-gray-900">${(selectedClosing.funds.equityRequired / 1000000).toFixed(1)}M</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Earnest Money</p>
                    <p className="text-lg font-bold text-green-600">${(selectedClosing.funds.earnestMoney / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Closing Costs</p>
                    <p className="text-lg font-bold text-gray-900">${(selectedClosing.funds.closingCosts / 1000).toFixed(0)}K</p>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Checklist Progress</span>
                    <span className="font-medium">{stats.completed}/{stats.total} tasks ({stats.progress}%)</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${stats.progress}%` }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Building className="w-4 h-4" />Escrow Agent</h3>
                  <p className="font-medium text-gray-900">{selectedClosing.escrowAgent}</p>
                  <p className="text-sm text-gray-600">{selectedClosing.escrowContact}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Phone className="w-3 h-3" />{selectedClosing.escrowPhone}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4" />Lender</h3>
                  <p className="font-medium text-gray-900">{selectedClosing.lender}</p>
                  <p className="text-sm text-gray-600">{selectedClosing.lenderContact}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Phone className="w-3 h-3" />{selectedClosing.lenderPhone}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Users className="w-4 h-4" />Internal Team</h3>
                  {selectedClosing.team.map((member, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-900">{member.name}</span>
                      <span className="text-gray-500">{member.role}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {selectedClosing.checklist.map((category) => {
                  const isExpanded = expandedCategories.includes(category.category);
                  const completedCount = category.items.filter(i => i.status === 'completed').length;

                  return (
                    <div key={category.category} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleCategory(category.category)}
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          <h3 className="font-semibold text-gray-900">{category.category}</h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">{completedCount}/{category.items.length}</span>
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${(completedCount / category.items.length) * 100}%` }} />
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-gray-200">
                          {category.items.map((item, idx) => (
                            <div key={idx} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 border-b border-gray-100 last:border-0">
                              <div className="flex items-center gap-3">
                                {item.status === 'completed' ? (
                                  <CheckSquare className="w-5 h-5 text-green-600" />
                                ) : item.status === 'in_progress' ? (
                                  <Clock className="w-5 h-5 text-blue-600" />
                                ) : (
                                  <Square className="w-5 h-5 text-gray-400" />
                                )}
                                <div>
                                  <p className={cn("text-sm", item.status === 'completed' && "text-gray-500")}>{item.task}</p>
                                  <p className="text-xs text-gray-500">{item.assignee}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={cn(
                                  "text-xs",
                                  new Date(item.dueDate) < new Date() && item.status !== 'completed' ? "text-red-600" : "text-gray-500"
                                )}>
                                  Due: {item.dueDate}
                                </span>
                                {item.status === 'pending' && <Button size="sm" variant="outline">Start</Button>}
                                {item.status === 'in_progress' && <Button size="sm" variant="outline" className="text-green-600">Complete</Button>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
