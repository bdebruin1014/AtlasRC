import React, { useState, useMemo } from 'react';
import {
  Building, CheckCircle, XCircle, Clock, AlertTriangle, User,
  DollarSign, Calendar, FileText, MapPin, ChevronRight, Play,
  Pause, ArrowRight, Flag, ClipboardCheck, Scale, Key
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const mockAcquisitions = [
  {
    id: 'ACQ-2024-0012',
    property: 'Metro Industrial Complex',
    address: '2200 Commerce Way, Dallas, TX',
    type: 'Industrial',
    purchasePrice: 30500000,
    status: 'in_progress',
    currentPhase: 'due_diligence',
    startDate: '2024-01-18',
    targetCloseDate: '2024-03-15',
    acquisitionTeam: ['Sarah Johnson', 'John Smith', 'Legal Team'],
    phases: [
      {
        name: 'LOI & IC Approval',
        status: 'completed',
        startDate: '2024-01-10',
        endDate: '2024-01-17',
        tasks: [
          { task: 'Investment Committee Presentation', status: 'completed', assignee: 'Sarah Johnson', date: '2024-01-15' },
          { task: 'IC Approval Obtained', status: 'completed', assignee: 'Mike Chen', date: '2024-01-17' },
          { task: 'LOI Drafted and Sent', status: 'completed', assignee: 'Legal Team', date: '2024-01-17' },
          { task: 'LOI Executed', status: 'completed', assignee: 'Sarah Johnson', date: '2024-01-18' }
        ]
      },
      {
        name: 'Due Diligence',
        status: 'in_progress',
        startDate: '2024-01-18',
        endDate: '2024-02-28',
        tasks: [
          { task: 'Title Search & Review', status: 'completed', assignee: 'Legal Team', date: '2024-01-22' },
          { task: 'Environmental Phase I', status: 'completed', assignee: 'Environmental Consultant', date: '2024-01-25' },
          { task: 'Property Condition Assessment', status: 'in_progress', assignee: 'Engineering Firm', date: null },
          { task: 'Financial Audit (Rent Roll, Leases)', status: 'in_progress', assignee: 'John Smith', date: null },
          { task: 'Zoning & Entitlement Review', status: 'pending', assignee: 'Legal Team', date: null },
          { task: 'Survey Review', status: 'pending', assignee: 'Legal Team', date: null },
          { task: 'Insurance Review', status: 'pending', assignee: 'Risk Team', date: null }
        ]
      },
      {
        name: 'Financing',
        status: 'pending',
        startDate: '2024-02-01',
        endDate: '2024-03-01',
        tasks: [
          { task: 'Lender Selection & Term Sheet', status: 'pending', assignee: 'Sarah Johnson', date: null },
          { task: 'Loan Application Submitted', status: 'pending', assignee: 'Finance Team', date: null },
          { task: 'Appraisal Completed', status: 'pending', assignee: 'Lender', date: null },
          { task: 'Loan Commitment Received', status: 'pending', assignee: 'Lender', date: null }
        ]
      },
      {
        name: 'PSA & Closing',
        status: 'pending',
        startDate: '2024-02-15',
        endDate: '2024-03-15',
        tasks: [
          { task: 'PSA Negotiation & Execution', status: 'pending', assignee: 'Legal Team', date: null },
          { task: 'Earnest Money Deposit', status: 'pending', assignee: 'Finance Team', date: null },
          { task: 'Closing Documents Preparation', status: 'pending', assignee: 'Legal Team', date: null },
          { task: 'Final Walk-Through', status: 'pending', assignee: 'John Smith', date: null },
          { task: 'Closing & Funding', status: 'pending', assignee: 'All Teams', date: null },
          { task: 'Property Handoff to Asset Management', status: 'pending', assignee: 'Sarah Johnson', date: null }
        ]
      }
    ],
    keyDates: [
      { name: 'LOI Expiration', date: '2024-01-25', status: 'completed' },
      { name: 'DD Period End', date: '2024-02-28', status: 'upcoming' },
      { name: 'Financing Commitment', date: '2024-03-01', status: 'upcoming' },
      { name: 'Target Close', date: '2024-03-15', status: 'upcoming' }
    ]
  },
  {
    id: 'ACQ-2024-0011',
    property: 'Harbor View Apartments',
    address: '850 Harbor Way, San Diego, CA',
    type: 'Multifamily',
    purchasePrice: 42500000,
    status: 'pending',
    currentPhase: 'loi_approval',
    startDate: '2024-01-20',
    targetCloseDate: '2024-04-01',
    acquisitionTeam: ['John Smith', 'Lisa Wang'],
    phases: [
      {
        name: 'LOI & IC Approval',
        status: 'in_progress',
        startDate: '2024-01-20',
        endDate: null,
        tasks: [
          { task: 'Investment Committee Presentation', status: 'pending', assignee: 'John Smith', date: null },
          { task: 'IC Approval Obtained', status: 'pending', assignee: 'Mike Chen', date: null },
          { task: 'LOI Drafted and Sent', status: 'pending', assignee: 'Legal Team', date: null },
          { task: 'LOI Executed', status: 'pending', assignee: 'John Smith', date: null }
        ]
      },
      { name: 'Due Diligence', status: 'pending', tasks: [] },
      { name: 'Financing', status: 'pending', tasks: [] },
      { name: 'PSA & Closing', status: 'pending', tasks: [] }
    ],
    keyDates: []
  }
];

const phaseIcons = {
  'LOI & IC Approval': Scale,
  'Due Diligence': ClipboardCheck,
  'Financing': DollarSign,
  'PSA & Closing': Key
};

const statusConfig = {
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-800' },
  at_risk: { label: 'At Risk', color: 'bg-red-100 text-red-800' }
};

export default function PropertyAcquisitionWorkflowPage() {
  const [selectedAcquisition, setSelectedAcquisition] = useState(mockAcquisitions[0]);
  const [expandedPhases, setExpandedPhases] = useState(['Due Diligence']);

  const togglePhase = (phaseName) => {
    setExpandedPhases(prev =>
      prev.includes(phaseName) ? prev.filter(p => p !== phaseName) : [...prev, phaseName]
    );
  };

  const getPhaseProgress = (phase) => {
    if (!phase.tasks.length) return 0;
    const completed = phase.tasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / phase.tasks.length) * 100);
  };

  const overallProgress = useMemo(() => {
    const allTasks = selectedAcquisition.phases.flatMap(p => p.tasks);
    if (!allTasks.length) return 0;
    const completed = allTasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / allTasks.length) * 100);
  }, [selectedAcquisition]);

  const stats = useMemo(() => ({
    active: mockAcquisitions.filter(a => a.status === 'in_progress').length,
    totalValue: mockAcquisitions.reduce((sum, a) => sum + a.purchasePrice, 0),
    avgDaysToClose: 60
  }), []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Acquisition Workflow</h1>
          <p className="text-gray-600">Track acquisitions from LOI to close</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Play className="w-4 h-4 mr-2" />Start New Acquisition
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Building className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-sm text-gray-600">Active Acquisitions</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><DollarSign className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${(stats.totalValue / 1000000).toFixed(0)}M</p>
              <p className="text-sm text-gray-600">Total Pipeline Value</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><Calendar className="w-5 h-5 text-purple-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.avgDaysToClose}</p>
              <p className="text-sm text-gray-600">Avg Days to Close</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg"><ClipboardCheck className="w-5 h-5 text-orange-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{overallProgress}%</p>
              <p className="text-sm text-gray-600">Current Progress</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1 space-y-2">
          {mockAcquisitions.map((acq) => (
            <div
              key={acq.id}
              onClick={() => setSelectedAcquisition(acq)}
              className={cn(
                "bg-white rounded-lg border p-4 cursor-pointer hover:border-blue-300 transition-colors",
                selectedAcquisition?.id === acq.id ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="font-medium text-gray-900">{acq.property}</p>
                <span className={cn("px-2 py-0.5 rounded text-xs", statusConfig[acq.status].color)}>{statusConfig[acq.status].label}</span>
              </div>
              <p className="text-sm text-gray-500 mb-2">{acq.address.split(',')[1]?.trim()}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">${(acq.purchasePrice / 1000000).toFixed(1)}M</span>
                <span className="text-xs text-gray-500">Close: {acq.targetCloseDate}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-3 space-y-4">
          {selectedAcquisition && (
            <>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedAcquisition.property}</h2>
                    <p className="text-gray-600 flex items-center gap-1"><MapPin className="w-4 h-4" />{selectedAcquisition.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">${(selectedAcquisition.purchasePrice / 1000000).toFixed(1)}M</p>
                    <p className="text-sm text-gray-500">Target Close: {selectedAcquisition.targetCloseDate}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="font-medium">{overallProgress}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {selectedAcquisition.phases.map((phase, idx) => {
                    const Icon = phaseIcons[phase.name] || FileText;
                    return (
                      <React.Fragment key={phase.name}>
                        <div className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap",
                          phase.status === 'completed' ? "bg-green-100 text-green-800" :
                          phase.status === 'in_progress' ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"
                        )}>
                          <Icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{phase.name}</span>
                          {phase.status === 'completed' && <CheckCircle className="w-4 h-4" />}
                        </div>
                        {idx < selectedAcquisition.phases.length - 1 && <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {selectedAcquisition.keyDates.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Key Dates</h3>
                  <div className="flex gap-4 overflow-x-auto">
                    {selectedAcquisition.keyDates.map((kd, idx) => (
                      <div key={idx} className={cn(
                        "px-4 py-2 rounded-lg text-center min-w-[120px]",
                        kd.status === 'completed' ? "bg-green-50 border border-green-200" :
                        kd.status === 'upcoming' ? "bg-yellow-50 border border-yellow-200" : "bg-red-50 border border-red-200"
                      )}>
                        <p className="text-xs text-gray-500">{kd.name}</p>
                        <p className="font-semibold">{kd.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {selectedAcquisition.phases.filter(p => p.tasks.length > 0).map((phase) => {
                  const Icon = phaseIcons[phase.name] || FileText;
                  const progress = getPhaseProgress(phase);
                  const isExpanded = expandedPhases.includes(phase.name);

                  return (
                    <div key={phase.name} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                        onClick={() => togglePhase(phase.name)}
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? <ChevronRight className="w-5 h-5 rotate-90" /> : <ChevronRight className="w-5 h-5" />}
                          <Icon className="w-5 h-5 text-gray-600" />
                          <div>
                            <h3 className="font-semibold text-gray-900">{phase.name}</h3>
                            <p className="text-sm text-gray-500">{phase.startDate} - {phase.endDate || 'TBD'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-32">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span>{phase.tasks.filter(t => t.status === 'completed').length}/{phase.tasks.length}</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className={cn("h-full rounded-full", phase.status === 'completed' ? "bg-green-500" : "bg-blue-500")} style={{ width: `${progress}%` }} />
                            </div>
                          </div>
                          <span className={cn("px-2 py-1 rounded text-xs", statusConfig[phase.status].color)}>{statusConfig[phase.status].label}</span>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-gray-200 divide-y divide-gray-100">
                          {phase.tasks.map((task, idx) => (
                            <div key={idx} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                              <div className="flex items-center gap-3">
                                {task.status === 'completed' ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : task.status === 'in_progress' ? (
                                  <Clock className="w-5 h-5 text-blue-600" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                                )}
                                <div>
                                  <p className={cn("text-sm", task.status === 'completed' && "text-gray-500")}>{task.task}</p>
                                  <p className="text-xs text-gray-500">{task.assignee}</p>
                                </div>
                              </div>
                              {task.date && <span className="text-xs text-gray-500">{task.date}</span>}
                              {task.status === 'pending' && <Button size="sm" variant="outline">Start</Button>}
                              {task.status === 'in_progress' && <Button size="sm" variant="outline" className="text-green-600">Complete</Button>}
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
