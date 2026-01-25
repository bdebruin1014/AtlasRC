import React, { useState, useMemo } from 'react';
import {
  CheckCircle, XCircle, Clock, AlertTriangle, Calendar, Lock,
  User, FileText, RefreshCw, ChevronDown, ChevronRight, Search,
  CheckSquare, Square, AlertCircle, Unlock, Building, DollarSign,
  ArrowRight, Eye, Upload, Download, Filter, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Auto-workflow: All accounts must be reconciled by the 5th of every month
const RECONCILIATION_DEADLINE_DAY = 5;

const mockAccounts = [
  {
    id: 'ACC-1000',
    accountNumber: '1000',
    accountName: 'Operating Cash - Chase',
    accountType: 'Asset',
    entity: 'Atlas Holdings LLC',
    glBalance: 2450000.00,
    bankBalance: 2450000.00,
    lastReconciled: '2024-01-05',
    reconciledBy: 'Sarah Johnson',
    status: 'reconciled',
    period: 'January 2024',
    variance: 0,
    outstandingItems: []
  },
  {
    id: 'ACC-1010',
    accountNumber: '1010',
    accountName: 'Payroll Account - Chase',
    accountType: 'Asset',
    entity: 'Atlas Holdings LLC',
    glBalance: 185000.00,
    bankBalance: 185000.00,
    lastReconciled: '2024-01-04',
    reconciledBy: 'Tom Davis',
    status: 'reconciled',
    period: 'January 2024',
    variance: 0,
    outstandingItems: []
  },
  {
    id: 'ACC-1020',
    accountNumber: '1020',
    accountName: 'Security Deposits - Wells Fargo',
    accountType: 'Asset',
    entity: 'Riverside Plaza LLC',
    glBalance: 425000.00,
    bankBalance: 428500.00,
    lastReconciled: null,
    reconciledBy: null,
    status: 'in_progress',
    period: 'January 2024',
    variance: 3500.00,
    currentStep: 3,
    outstandingItems: [
      { type: 'deposit_in_transit', description: 'Tenant deposit - Unit 305', amount: 2500, date: '2024-01-28' },
      { type: 'deposit_in_transit', description: 'Tenant deposit - Unit 412', amount: 1000, date: '2024-01-29' }
    ],
    reconciliationSteps: [
      { step: 1, name: 'Download Bank Statement', status: 'completed', completedDate: '2024-01-30', completedBy: 'Lisa Wang' },
      { step: 2, name: 'Import Bank Transactions', status: 'completed', completedDate: '2024-01-30', completedBy: 'System' },
      { step: 3, name: 'Match Transactions', status: 'in_progress', completedDate: null, completedBy: null },
      { step: 4, name: 'Identify Outstanding Items', status: 'pending', completedDate: null, completedBy: null },
      { step: 5, name: 'Investigate Variances', status: 'pending', completedDate: null, completedBy: null },
      { step: 6, name: 'Post Adjusting Entries', status: 'pending', completedDate: null, completedBy: null },
      { step: 7, name: 'Manager Review & Approval', status: 'pending', completedDate: null, completedBy: null },
      { step: 8, name: 'Lock Reconciliation', status: 'pending', completedDate: null, completedBy: null }
    ]
  },
  {
    id: 'ACC-1100',
    accountNumber: '1100',
    accountName: 'Accounts Receivable',
    accountType: 'Asset',
    entity: 'Atlas Holdings LLC',
    glBalance: 892000.00,
    subledgerBalance: 892000.00,
    lastReconciled: null,
    reconciledBy: null,
    status: 'not_started',
    period: 'January 2024',
    variance: 0,
    reconciliationType: 'subledger',
    outstandingItems: []
  },
  {
    id: 'ACC-2000',
    accountNumber: '2000',
    accountName: 'Accounts Payable',
    accountType: 'Liability',
    entity: 'Atlas Holdings LLC',
    glBalance: 456000.00,
    subledgerBalance: 458500.00,
    lastReconciled: null,
    reconciledBy: null,
    status: 'variance',
    period: 'January 2024',
    variance: 2500.00,
    reconciliationType: 'subledger',
    outstandingItems: [
      { type: 'unrecorded_invoice', description: 'Missing invoice - ABC Supplies', amount: 2500, date: '2024-01-25' }
    ]
  },
  {
    id: 'ACC-1350',
    accountNumber: '1350',
    accountName: 'Intercompany Receivable - Riverside',
    accountType: 'Asset',
    entity: 'Atlas Holdings LLC',
    glBalance: 2850000.00,
    counterpartyBalance: 2850000.00,
    lastReconciled: '2024-01-03',
    reconciledBy: 'Mike Chen',
    status: 'reconciled',
    period: 'January 2024',
    variance: 0,
    reconciliationType: 'intercompany',
    counterpartyEntity: 'Riverside Plaza LLC',
    counterpartyAccount: '2350 - IC Payable - Holdings',
    outstandingItems: []
  },
  {
    id: 'ACC-6100',
    accountNumber: '6100',
    accountName: 'Corporate Credit Card',
    accountType: 'Liability',
    entity: 'Atlas Holdings LLC',
    glBalance: 45200.00,
    statementBalance: 47800.00,
    lastReconciled: null,
    reconciledBy: null,
    status: 'overdue',
    period: 'January 2024',
    variance: 2600.00,
    reconciliationType: 'credit_card',
    daysOverdue: 3,
    outstandingItems: [
      { type: 'pending_receipt', description: 'Travel expense - J. Smith', amount: 1200, date: '2024-01-22' },
      { type: 'pending_receipt', description: 'Office supplies', amount: 850, date: '2024-01-24' },
      { type: 'unrecorded', description: 'Conference registration', amount: 550, date: '2024-01-26' }
    ]
  }
];

const statusConfig = {
  reconciled: { label: 'Reconciled', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
  not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-800', icon: Clock },
  variance: { label: 'Variance', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-800', icon: AlertCircle }
};

const accountTypeColors = {
  Asset: 'bg-blue-100 text-blue-800',
  Liability: 'bg-purple-100 text-purple-800',
  Equity: 'bg-green-100 text-green-800',
  Revenue: 'bg-teal-100 text-teal-800',
  Expense: 'bg-orange-100 text-orange-800'
};

export default function AccountReconciliationWorkflowPage() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(mockAccounts[2]);
  const [selectedPeriod, setSelectedPeriod] = useState('January 2024');

  const filteredAccounts = useMemo(() => {
    return mockAccounts.filter(acc => {
      const matchesFilter = filter === 'all' || acc.status === filter;
      const matchesSearch = acc.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.accountNumber.includes(searchTerm);
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchTerm]);

  const stats = useMemo(() => {
    const total = mockAccounts.length;
    const reconciled = mockAccounts.filter(a => a.status === 'reconciled').length;
    const inProgress = mockAccounts.filter(a => a.status === 'in_progress').length;
    const overdue = mockAccounts.filter(a => a.status === 'overdue').length;
    const withVariance = mockAccounts.filter(a => a.variance > 0).length;

    // Calculate days until deadline (5th of next month)
    const today = new Date();
    const deadline = new Date(today.getFullYear(), today.getMonth() + 1, RECONCILIATION_DEADLINE_DAY);
    const daysUntilDeadline = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

    return { total, reconciled, inProgress, overdue, withVariance, daysUntilDeadline };
  }, []);

  const getStepProgress = (steps) => {
    if (!steps) return 0;
    const completed = steps.filter(s => s.status === 'completed').length;
    return Math.round((completed / steps.length) * 100);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account Reconciliation Workflow</h1>
          <p className="text-gray-600">All accounts must be reconciled by the 5th of each month</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={cn(
            "px-4 py-2 rounded-lg flex items-center gap-2",
            stats.daysUntilDeadline <= 3 ? "bg-red-100" : stats.daysUntilDeadline <= 7 ? "bg-yellow-100" : "bg-green-100"
          )}>
            <Bell className={cn("w-5 h-5", stats.daysUntilDeadline <= 3 ? "text-red-600" : stats.daysUntilDeadline <= 7 ? "text-yellow-600" : "text-green-600")} />
            <span className={cn("font-semibold", stats.daysUntilDeadline <= 3 ? "text-red-700" : stats.daysUntilDeadline <= 7 ? "text-yellow-700" : "text-green-700")}>
              {stats.daysUntilDeadline} days until deadline
            </span>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="w-4 h-4 mr-2" />Start Reconciliation
          </Button>
        </div>
      </div>

      {/* Deadline Warning Banner */}
      {stats.overdue > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <p className="font-semibold text-red-900">{stats.overdue} Account(s) Past Reconciliation Deadline</p>
              <p className="text-sm text-red-700">These accounts require immediate attention to maintain compliance with accounting policies.</p>
            </div>
          </div>
          <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
            View Overdue
          </Button>
        </div>
      )}

      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><FileText className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Accounts</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.reconciled}/{stats.total}</p>
              <p className="text-sm text-gray-600">Reconciled</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg"><RefreshCw className="w-5 h-5 text-yellow-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg"><AlertTriangle className="w-5 h-5 text-orange-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.withVariance}</p>
              <p className="text-sm text-gray-600">With Variances</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg"><AlertCircle className="w-5 h-5 text-red-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
              <p className="text-sm text-gray-600">Overdue</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="Search accounts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          {['all', 'reconciled', 'in_progress', 'not_started', 'overdue'].map((f) => (
            <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f === 'not_started' ? 'Not Started' : f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
          {filteredAccounts.map((account) => (
            <div
              key={account.id}
              onClick={() => setSelectedAccount(account)}
              className={cn(
                "bg-white rounded-lg border p-4 cursor-pointer hover:border-blue-300 transition-colors",
                selectedAccount?.id === account.id ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-900">{account.accountNumber} - {account.accountName}</p>
                  <p className="text-sm text-gray-500">{account.entity}</p>
                </div>
                <span className={cn("px-2 py-0.5 rounded text-xs", statusConfig[account.status].color)}>
                  {statusConfig[account.status].label}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={cn("px-2 py-0.5 rounded text-xs", accountTypeColors[account.accountType])}>
                  {account.accountType}
                </span>
                {account.variance > 0 && (
                  <span className="text-orange-600 font-medium">${account.variance.toLocaleString()} variance</span>
                )}
              </div>
              {account.status === 'overdue' && (
                <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{account.daysOverdue} days overdue
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="col-span-2">
          {selectedAccount && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-gray-900">{selectedAccount.accountNumber} - {selectedAccount.accountName}</h2>
                      <span className={cn("px-2 py-1 rounded-full text-xs", statusConfig[selectedAccount.status].color)}>
                        {statusConfig[selectedAccount.status].label}
                      </span>
                    </div>
                    <p className="text-gray-600">{selectedAccount.entity} • {selectedAccount.period}</p>
                  </div>
                  {selectedAccount.status === 'reconciled' && (
                    <div className="flex items-center gap-2 text-green-600">
                      <Lock className="w-5 h-5" />
                      <span className="text-sm font-medium">Locked</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">GL Balance</p>
                    <p className="text-xl font-bold text-gray-900">${selectedAccount.glBalance.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">
                      {selectedAccount.reconciliationType === 'subledger' ? 'Subledger Balance' :
                       selectedAccount.reconciliationType === 'intercompany' ? 'Counterparty Balance' :
                       selectedAccount.reconciliationType === 'credit_card' ? 'Statement Balance' : 'Bank Balance'}
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      ${(selectedAccount.bankBalance || selectedAccount.subledgerBalance || selectedAccount.counterpartyBalance || selectedAccount.statementBalance || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className={cn("p-4 rounded-lg", selectedAccount.variance > 0 ? "bg-orange-50" : "bg-green-50")}>
                    <p className="text-sm text-gray-500">Variance</p>
                    <p className={cn("text-xl font-bold", selectedAccount.variance > 0 ? "text-orange-600" : "text-green-600")}>
                      ${selectedAccount.variance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reconciliation Steps */}
              {selectedAccount.reconciliationSteps && (
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Reconciliation Steps</h3>
                    <span className="text-sm text-gray-500">{getStepProgress(selectedAccount.reconciliationSteps)}% Complete</span>
                  </div>
                  <div className="space-y-3">
                    {selectedAccount.reconciliationSteps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                          step.status === 'completed' ? "bg-green-100 text-green-700" :
                          step.status === 'in_progress' ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-500"
                        )}>
                          {step.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : step.step}
                        </div>
                        <div className="flex-1">
                          <p className={cn("text-sm", step.status === 'completed' ? "text-gray-500" : "text-gray-900")}>{step.name}</p>
                          {step.completedDate && (
                            <p className="text-xs text-gray-500">{step.completedDate} by {step.completedBy}</p>
                          )}
                        </div>
                        {step.status === 'in_progress' && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Continue</Button>
                        )}
                        {step.status === 'pending' && selectedAccount.reconciliationSteps[idx - 1]?.status === 'completed' && (
                          <Button size="sm" variant="outline">Start</Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Outstanding Items */}
              {selectedAccount.outstandingItems && selectedAccount.outstandingItems.length > 0 && (
                <div className="p-6 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Outstanding Items ({selectedAccount.outstandingItems.length})</h3>
                  <div className="space-y-2">
                    {selectedAccount.outstandingItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.description}</p>
                          <p className="text-xs text-gray-500">{item.type.replace(/_/g, ' ')} • {item.date}</p>
                        </div>
                        <span className="font-semibold text-gray-900">${item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reconciliation History */}
              {selectedAccount.status === 'reconciled' && (
                <div className="p-6 bg-green-50">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">Account Reconciled</p>
                      <p className="text-sm text-green-700">
                        Reconciled on {selectedAccount.lastReconciled} by {selectedAccount.reconciledBy}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedAccount.status !== 'reconciled' && (
                <div className="p-6 bg-gray-50 flex justify-end gap-3">
                  <Button variant="outline"><Upload className="w-4 h-4 mr-2" />Import Statement</Button>
                  <Button variant="outline"><Eye className="w-4 h-4 mr-2" />View Transactions</Button>
                  {selectedAccount.status === 'in_progress' && (
                    <Button className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="w-4 h-4 mr-2" />Complete Reconciliation
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
