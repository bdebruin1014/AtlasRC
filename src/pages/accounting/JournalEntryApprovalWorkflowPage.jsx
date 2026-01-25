import React, { useState, useMemo } from 'react';
import {
  FileText, CheckCircle, XCircle, Clock, AlertTriangle, User,
  DollarSign, Calendar, Search, Eye, Shield, Edit, Plus,
  ArrowRight, Lock, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const mockJournalEntries = [
  {
    id: 'JE-2024-0892',
    date: '2024-01-30',
    description: 'Month-end accrual - Property taxes',
    type: 'Accrual',
    status: 'pending_approval',
    entity: 'Riverside Plaza LLC',
    createdBy: 'John Smith',
    totalDebits: 125000.00,
    totalCredits: 125000.00,
    lineItems: [
      { account: '6500 - Property Tax Expense', debit: 125000.00, credit: 0 },
      { account: '2100 - Property Tax Payable', debit: 0, credit: 125000.00 }
    ],
    supportingDocs: ['Tax Assessment.pdf', 'Calculation.xlsx'],
    approvalChain: [
      { role: 'Preparer', name: 'John Smith', status: 'submitted', date: '2024-01-30' },
      { role: 'Reviewer', name: 'Lisa Wang', status: 'pending', date: null }
    ],
    reversing: false
  },
  {
    id: 'JE-2024-0891',
    date: '2024-01-30',
    description: 'Correction - Misclassified expense',
    type: 'Reclassification',
    status: 'pending_approval',
    entity: 'Atlas Holdings LLC',
    createdBy: 'Tom Davis',
    totalDebits: 8500.00,
    totalCredits: 8500.00,
    lineItems: [
      { account: '6200 - Office Supplies', debit: 8500.00, credit: 0 },
      { account: '6100 - Professional Fees', debit: 0, credit: 8500.00 }
    ],
    supportingDocs: ['Original Invoice.pdf'],
    approvalChain: [
      { role: 'Preparer', name: 'Tom Davis', status: 'submitted', date: '2024-01-30' },
      { role: 'Reviewer', name: 'Mike Chen', status: 'pending', date: null }
    ],
    reversing: false
  },
  {
    id: 'JE-2024-0890',
    date: '2024-01-29',
    description: 'Intercompany loan interest - January 2024',
    type: 'Recurring',
    status: 'approved',
    entity: 'Atlas Holdings LLC',
    createdBy: 'System',
    totalDebits: 18750.00,
    totalCredits: 18750.00,
    lineItems: [
      { account: '4200 - Interest Income', debit: 0, credit: 18750.00 },
      { account: '1350 - IC Receivable - Riverside', debit: 18750.00, credit: 0 }
    ],
    supportingDocs: ['Loan Agreement.pdf', 'Interest Calc.xlsx'],
    approvalChain: [
      { role: 'Preparer', name: 'System', status: 'auto-generated', date: '2024-01-29' },
      { role: 'Reviewer', name: 'Mike Chen', status: 'approved', date: '2024-01-29' }
    ],
    reversing: false,
    postedDate: '2024-01-29'
  },
  {
    id: 'JE-2024-0889',
    date: '2024-01-28',
    description: 'Adjusting entry - Bad debt reserve',
    type: 'Adjustment',
    status: 'approved',
    entity: 'Downtown Tower LLC',
    createdBy: 'Lisa Wang',
    totalDebits: 45000.00,
    totalCredits: 45000.00,
    lineItems: [
      { account: '7100 - Bad Debt Expense', debit: 45000.00, credit: 0 },
      { account: '1199 - Allowance for Doubtful Accounts', debit: 0, credit: 45000.00 }
    ],
    supportingDocs: ['AR Aging.xlsx', 'Reserve Analysis.pdf'],
    approvalChain: [
      { role: 'Preparer', name: 'Lisa Wang', status: 'submitted', date: '2024-01-28' },
      { role: 'Reviewer', name: 'Mike Chen', status: 'approved', date: '2024-01-28' },
      { role: 'Controller', name: 'Robert Johnson', status: 'approved', date: '2024-01-28' }
    ],
    reversing: false,
    postedDate: '2024-01-28'
  }
];

const typeColors = {
  'Accrual': 'bg-blue-100 text-blue-800',
  'Reclassification': 'bg-purple-100 text-purple-800',
  'Recurring': 'bg-green-100 text-green-800',
  'Adjustment': 'bg-orange-100 text-orange-800',
  'Reversing': 'bg-yellow-100 text-yellow-800'
};

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  pending_approval: { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
  posted: { label: 'Posted', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' }
};

export default function JournalEntryApprovalWorkflowPage() {
  const [filter, setFilter] = useState('all');
  const [selectedJE, setSelectedJE] = useState(mockJournalEntries[0]);

  const filteredEntries = useMemo(() => {
    if (filter === 'all') return mockJournalEntries;
    if (filter === 'pending') return mockJournalEntries.filter(je => je.status === 'pending_approval');
    return mockJournalEntries.filter(je => je.status === filter);
  }, [filter]);

  const stats = useMemo(() => ({
    pending: mockJournalEntries.filter(je => je.status === 'pending_approval').length,
    approved: mockJournalEntries.filter(je => je.status === 'approved' || je.status === 'posted').length,
    totalPending: mockJournalEntries.filter(je => je.status === 'pending_approval').reduce((sum, je) => sum + je.totalDebits, 0)
  }), []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Journal Entry Approval</h1>
          <p className="text-gray-600">Review and approve manual journal entries</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />New Journal Entry
        </Button>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-purple-600" />
          <div>
            <h3 className="font-semibold text-purple-900">Journal Entry Controls</h3>
            <p className="text-sm text-purple-700">• Preparers cannot approve their own entries (SOD enforced)</p>
            <p className="text-sm text-purple-700">• Entries over $50K require Controller approval</p>
            <p className="text-sm text-purple-700">• Supporting documentation required for all manual entries</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-sm text-gray-600">Pending Approval</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          <p className="text-sm text-gray-600">Approved (MTD)</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">${(stats.totalPending / 1000).toFixed(0)}K</p>
          <p className="text-sm text-gray-600">Pending Value</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{mockJournalEntries.length}</p>
          <p className="text-sm text-gray-600">Total Entries</p>
        </div>
      </div>

      <div className="flex gap-2">
        {['all', 'pending', 'approved'].map((f) => (
          <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
            {f === 'pending' ? 'Pending Approval' : f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
          {filteredEntries.map((je) => (
            <div
              key={je.id}
              onClick={() => setSelectedJE(je)}
              className={cn(
                "bg-white rounded-lg border p-4 cursor-pointer hover:border-blue-300 transition-colors",
                selectedJE?.id === je.id ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-medium text-gray-900">{je.id}</span>
                <span className={cn("px-2 py-0.5 rounded text-xs", statusConfig[je.status].color)}>
                  {statusConfig[je.status].label}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2 line-clamp-1">{je.description}</p>
              <div className="flex items-center justify-between">
                <span className={cn("px-2 py-0.5 rounded text-xs", typeColors[je.type])}>
                  {je.type}
                </span>
                <span className="font-semibold text-gray-900">${je.totalDebits.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-2">
          {selectedJE && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-gray-900">{selectedJE.id}</h2>
                      <span className={cn("px-2 py-1 rounded-full text-xs", statusConfig[selectedJE.status].color)}>
                        {statusConfig[selectedJE.status].label}
                      </span>
                      <span className={cn("px-2 py-1 rounded-full text-xs", typeColors[selectedJE.type])}>
                        {selectedJE.type}
                      </span>
                    </div>
                    <p className="text-gray-600">{selectedJE.description}</p>
                  </div>
                  {selectedJE.status === 'approved' && (
                    <div className="flex items-center gap-2 text-green-600">
                      <Lock className="w-5 h-5" />
                      <span className="text-sm font-medium">Posted</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Entity</p>
                    <p className="font-medium text-gray-900">{selectedJE.entity}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="font-medium text-gray-900">{selectedJE.date}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Created By</p>
                    <p className="font-medium text-gray-900">{selectedJE.createdBy}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Journal Entry Lines</h3>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-gray-500">
                      <th className="p-3">Account</th>
                      <th className="p-3 text-right">Debit</th>
                      <th className="p-3 text-right">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedJE.lineItems.map((line, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-3">{line.account}</td>
                        <td className="p-3 text-right">{line.debit > 0 ? `$${line.debit.toLocaleString()}` : ''}</td>
                        <td className="p-3 text-right">{line.credit > 0 ? `$${line.credit.toLocaleString()}` : ''}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-semibold">
                      <td className="p-3">Total</td>
                      <td className="p-3 text-right">${selectedJE.totalDebits.toLocaleString()}</td>
                      <td className="p-3 text-right">${selectedJE.totalCredits.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Approval Workflow</h3>
                <div className="space-y-3">
                  {selectedJE.approvalChain.map((approval, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        ['approved', 'submitted', 'auto-generated'].includes(approval.status) ? "bg-green-100" : "bg-gray-200"
                      )}>
                        {['approved', 'submitted', 'auto-generated'].includes(approval.status) ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{approval.role}</p>
                        <p className="text-sm text-gray-500">{approval.name}</p>
                      </div>
                      {approval.date && <span className="text-sm text-gray-500">{approval.date}</span>}
                      {approval.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="text-red-600">Reject</Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">Approve</Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {selectedJE.supportingDocs.length > 0 && (
                <div className="p-6 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 mb-3">Supporting Documentation</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJE.supportingDocs.map((doc, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white border rounded-lg text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-500" />{doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
