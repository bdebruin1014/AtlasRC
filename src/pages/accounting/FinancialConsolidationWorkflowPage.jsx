import React, { useState, useMemo } from 'react';
import {
  Layers, Building2, DollarSign, Calendar, CheckCircle, Clock,
  AlertTriangle, Play, RefreshCw, ChevronDown, ChevronRight,
  FileText, Download, Eye, Link2, XCircle, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const mockEntities = [
  { id: 'E-001', name: 'Atlas Holdings LLC', type: 'Parent', status: 'ready', totalAssets: 45000000, netIncome: 2500000 },
  { id: 'E-002', name: 'Riverside Plaza LLC', type: 'Property', status: 'ready', totalAssets: 22000000, netIncome: 1200000 },
  { id: 'E-003', name: 'Downtown Tower LLC', type: 'Property', status: 'ready', totalAssets: 18500000, netIncome: 950000 },
  { id: 'E-004', name: 'Oak Street Partners LP', type: 'Property', status: 'pending_close', totalAssets: 8500000, netIncome: 0 },
  { id: 'E-005', name: 'Atlas Management Co.', type: 'OpCo', status: 'ready', totalAssets: 2500000, netIncome: 450000 }
];

const mockConsolidationPeriods = [
  {
    id: 'CONS-2024-01',
    period: 'January 2024',
    status: 'in_progress',
    startDate: '2024-02-05',
    targetDate: '2024-02-15',
    progress: 65,
    steps: [
      { name: 'Entity Close Verification', status: 'completed', completedDate: '2024-02-06', assignee: 'Mike Chen' },
      { name: 'Trial Balance Import', status: 'completed', completedDate: '2024-02-07', assignee: 'System' },
      { name: 'Intercompany Matching', status: 'completed', completedDate: '2024-02-08', assignee: 'Sarah Johnson' },
      { name: 'Elimination Entries', status: 'in_progress', completedDate: null, assignee: 'Mike Chen' },
      { name: 'Minority Interest Calculation', status: 'pending', completedDate: null, assignee: 'Mike Chen' },
      { name: 'Consolidating Adjustments', status: 'pending', completedDate: null, assignee: 'Mike Chen' },
      { name: 'Final Review & Approval', status: 'pending', completedDate: null, assignee: 'CFO' }
    ],
    eliminations: [
      { description: 'Eliminate IC - Holdings to Riverside', debit: 'IC Payable', credit: 'IC Receivable', amount: 2850000 },
      { description: 'Eliminate IC - Holdings to Downtown', debit: 'IC Receivable', credit: 'IC Payable', amount: 450000 },
      { description: 'Eliminate Management Fee Income/Expense', debit: 'Mgmt Fee Income', credit: 'Mgmt Fee Expense', amount: 112500 },
      { description: 'Eliminate Investment in Subsidiaries', debit: 'Equity', credit: 'Investment', amount: 35000000 }
    ]
  },
  {
    id: 'CONS-2023-12',
    period: 'December 2023',
    status: 'completed',
    startDate: '2024-01-05',
    targetDate: '2024-01-15',
    completedDate: '2024-01-14',
    progress: 100,
    steps: []
  },
  {
    id: 'CONS-2023-11',
    period: 'November 2023',
    status: 'completed',
    startDate: '2023-12-05',
    targetDate: '2023-12-15',
    completedDate: '2023-12-13',
    progress: 100,
    steps: []
  }
];

const mockConsolidatedTB = [
  { account: '1000 - Cash', parent: 5000000, riverside: 850000, downtown: 620000, oak: 0, management: 450000, eliminations: 0, consolidated: 6920000 },
  { account: '1200 - Accounts Receivable', parent: 250000, riverside: 180000, downtown: 145000, oak: 0, management: 85000, eliminations: 0, consolidated: 660000 },
  { account: '1350 - IC Receivable', parent: 5350000, riverside: 0, downtown: 450000, oak: 0, management: 112500, eliminations: -5912500, consolidated: 0 },
  { account: '1600 - Investment in Subs', parent: 35000000, riverside: 0, downtown: 0, oak: 0, management: 0, eliminations: -35000000, consolidated: 0 },
  { account: '1700 - Fixed Assets', parent: 500000, riverside: 20500000, downtown: 17500000, oak: 8500000, management: 1850000, eliminations: 0, consolidated: 48850000 }
];

const statusConfig = {
  ready: { label: 'Ready', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  pending_close: { label: 'Pending Close', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  error: { label: 'Error', color: 'bg-red-100 text-red-800', icon: XCircle }
};

export default function FinancialConsolidationWorkflowPage() {
  const [selectedPeriod, setSelectedPeriod] = useState(mockConsolidationPeriods[0]);
  const [view, setView] = useState('workflow');
  const [expandedSections, setExpandedSections] = useState(['eliminations']);

  const toggleSection = (section) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const stats = useMemo(() => ({
    totalEntities: mockEntities.length,
    readyEntities: mockEntities.filter(e => e.status === 'ready').length,
    totalAssets: mockEntities.reduce((sum, e) => sum + e.totalAssets, 0),
    totalNetIncome: mockEntities.reduce((sum, e) => sum + e.netIncome, 0)
  }), []);

  const stepStats = useMemo(() => {
    if (!selectedPeriod.steps.length) return { completed: 0, total: 0 };
    return {
      completed: selectedPeriod.steps.filter(s => s.status === 'completed').length,
      total: selectedPeriod.steps.length
    };
  }, [selectedPeriod]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Consolidation</h1>
          <p className="text-gray-600">Consolidate financial statements across entities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export Package</Button>
          <Button className="bg-blue-600 hover:bg-blue-700"><Play className="w-4 h-4 mr-2" />Run Consolidation</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Building2 className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.readyEntities}/{stats.totalEntities}</p>
              <p className="text-sm text-gray-600">Entities Ready</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><DollarSign className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${(stats.totalAssets / 1000000).toFixed(0)}M</p>
              <p className="text-sm text-gray-600">Total Assets</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><Layers className="w-5 h-5 text-purple-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${(stats.totalNetIncome / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-gray-600">Net Income</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg"><Clock className="w-5 h-5 text-yellow-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stepStats.completed}/{stepStats.total}</p>
              <p className="text-sm text-gray-600">Steps Complete</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1 space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900">Consolidation Periods</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {mockConsolidationPeriods.map((period) => (
                <div
                  key={period.id}
                  onClick={() => setSelectedPeriod(period)}
                  className={cn(
                    "p-4 cursor-pointer hover:bg-gray-50 transition-colors",
                    selectedPeriod?.id === period.id && "bg-blue-50 border-l-4 border-blue-500"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{period.period}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", period.progress === 100 ? "bg-green-500" : "bg-blue-500")} style={{ width: `${period.progress}%` }} />
                    </div>
                    <span className="text-sm text-gray-600">{period.progress}%</span>
                  </div>
                  <span className={cn("px-2 py-0.5 rounded text-xs", statusConfig[period.status].color)}>{statusConfig[period.status].label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900">Entity Status</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {mockEntities.map((entity) => (
                <div key={entity.id} className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{entity.name.split(' ')[0]}</p>
                    <p className="text-xs text-gray-500">{entity.type}</p>
                  </div>
                  <span className={cn("px-2 py-0.5 rounded text-xs", statusConfig[entity.status].color)}>
                    {statusConfig[entity.status].label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-3 space-y-4">
          <div className="flex gap-2">
            <Button variant={view === 'workflow' ? 'default' : 'outline'} size="sm" onClick={() => setView('workflow')}>Workflow</Button>
            <Button variant={view === 'trialbalance' ? 'default' : 'outline'} size="sm" onClick={() => setView('trialbalance')}>Consolidated TB</Button>
            <Button variant={view === 'eliminations' ? 'default' : 'outline'} size="sm" onClick={() => setView('eliminations')}>Eliminations</Button>
          </div>

          {view === 'workflow' && selectedPeriod.status !== 'completed' && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{selectedPeriod.period} Consolidation</h2>
                    <p className="text-sm text-gray-600">Target: {selectedPeriod.targetDate}</p>
                  </div>
                  <span className={cn("px-3 py-1 rounded-full text-sm", statusConfig[selectedPeriod.status].color)}>
                    {statusConfig[selectedPeriod.status].label}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {selectedPeriod.steps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        step.status === 'completed' ? "bg-green-100" :
                        step.status === 'in_progress' ? "bg-blue-100" : "bg-gray-200"
                      )}>
                        {step.status === 'completed' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                         step.status === 'in_progress' ? <RefreshCw className="w-4 h-4 text-blue-600" /> :
                         <Clock className="w-4 h-4 text-gray-400" />}
                      </div>
                      <div className="flex-1">
                        <p className={cn("font-medium", step.status === 'completed' ? "text-gray-500" : "text-gray-900")}>{step.name}</p>
                        <p className="text-sm text-gray-500">Assignee: {step.assignee}</p>
                      </div>
                      <div className="text-right">
                        {step.completedDate && <p className="text-sm text-gray-500">{step.completedDate}</p>}
                        {step.status === 'in_progress' && <Button size="sm" variant="outline">Complete</Button>}
                        {step.status === 'pending' && <Button size="sm" variant="ghost" disabled>Pending</Button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {view === 'workflow' && selectedPeriod.status === 'completed' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Consolidation Complete</h3>
                  <p className="text-sm text-gray-600">Completed on {selectedPeriod.completedDate}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline"><Eye className="w-4 h-4 mr-2" />View Reports</Button>
                <Button variant="outline"><Download className="w-4 h-4 mr-2" />Download Package</Button>
              </div>
            </div>
          )}

          {view === 'trialbalance' && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-900">Consolidating Trial Balance - {selectedPeriod.period}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b bg-gray-50">
                      <th className="p-3">Account</th>
                      <th className="p-3 text-right">Parent</th>
                      <th className="p-3 text-right">Riverside</th>
                      <th className="p-3 text-right">Downtown</th>
                      <th className="p-3 text-right">Oak St</th>
                      <th className="p-3 text-right">Mgmt Co</th>
                      <th className="p-3 text-right">Eliminations</th>
                      <th className="p-3 text-right font-semibold">Consolidated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockConsolidatedTB.map((row, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3 font-medium">{row.account}</td>
                        <td className="p-3 text-right">${(row.parent / 1000).toFixed(0)}K</td>
                        <td className="p-3 text-right">${(row.riverside / 1000).toFixed(0)}K</td>
                        <td className="p-3 text-right">${(row.downtown / 1000).toFixed(0)}K</td>
                        <td className="p-3 text-right">${(row.oak / 1000).toFixed(0)}K</td>
                        <td className="p-3 text-right">${(row.management / 1000).toFixed(0)}K</td>
                        <td className={cn("p-3 text-right", row.eliminations !== 0 && "text-red-600")}>
                          {row.eliminations !== 0 ? `(${Math.abs(row.eliminations / 1000).toFixed(0)}K)` : '-'}
                        </td>
                        <td className="p-3 text-right font-semibold">${(row.consolidated / 1000).toFixed(0)}K</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {view === 'eliminations' && selectedPeriod.eliminations && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-900">Elimination Entries - {selectedPeriod.period}</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {selectedPeriod.eliminations.map((elim, idx) => (
                  <div key={idx} className="p-4">
                    <p className="font-medium text-gray-900 mb-2">{elim.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Dr.</span>
                        <span className="font-medium">{elim.debit}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Cr.</span>
                        <span className="font-medium">{elim.credit}</span>
                      </div>
                      <span className="ml-auto font-semibold">${elim.amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
