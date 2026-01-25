import React, { useState, useMemo } from 'react';
import {
  ArrowLeftRight, Building2, DollarSign, CheckCircle, XCircle, Clock,
  AlertTriangle, User, Shield, Lock, FileText, Search, Eye, Send,
  AlertCircle, CheckSquare, Square, UserCheck, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/*
 * INTERCOMPANY CASH TRANSFER SAFETY PROCEDURES
 *
 * 1. DUAL APPROVAL REQUIREMENT
 *    - All IC transfers require approval from both sending and receiving entity controllers
 *    - Transfers over $100,000 require CFO approval
 *    - Same-day transfers over $500,000 require CEO approval
 *
 * 2. DOCUMENTATION REQUIREMENTS
 *    - Business purpose must be documented for every transfer
 *    - Supporting documentation required for loan advances, capital calls, distributions
 *    - IC agreements must be on file and current
 *
 * 3. RECONCILIATION CONTROLS
 *    - IC balances must net to zero across all entities
 *    - Monthly IC reconciliation required by 5th of following month
 *    - Unmatched IC transactions flagged for immediate investigation
 *
 * 4. AUDIT TRAIL
 *    - Full audit trail of all IC transfers with timestamps
 *    - Approval chain documented with electronic signatures
 *    - Changes to IC transfers after approval are prohibited
 */

const mockEntities = [
  { id: 'E-001', name: 'Atlas Holdings LLC', type: 'Parent', bankAccount: '****4521' },
  { id: 'E-002', name: 'Riverside Plaza LLC', type: 'Property', bankAccount: '****7832' },
  { id: 'E-003', name: 'Downtown Tower LLC', type: 'Property', bankAccount: '****9156' },
  { id: 'E-004', name: 'Oak Street Partners LP', type: 'Property', bankAccount: '****2847' },
  { id: 'E-005', name: 'Atlas Management Co.', type: 'OpCo', bankAccount: '****6293' }
];

const mockTransfers = [
  {
    id: 'ICT-2024-0089',
    fromEntity: 'Atlas Holdings LLC',
    toEntity: 'Riverside Plaza LLC',
    type: 'Loan Advance',
    amount: 750000.00,
    requestDate: '2024-01-30',
    requestedBy: 'Sarah Johnson',
    businessPurpose: 'Construction draw funding for Phase 2 renovation',
    status: 'pending_approval',
    urgency: 'normal',
    approvalChain: [
      { role: 'Sending Controller', name: 'Mike Chen', entity: 'Atlas Holdings LLC', status: 'approved', date: '2024-01-30', comment: 'Approved - sufficient cash available' },
      { role: 'Receiving Controller', name: 'Lisa Wang', entity: 'Riverside Plaza LLC', status: 'pending', date: null, comment: null },
      { role: 'CFO', name: 'Robert Johnson', entity: 'Corporate', status: 'pending', date: null, comment: null }
    ],
    supportingDocs: ['Loan Agreement.pdf', 'Draw Request.pdf', 'Budget Approval.pdf'],
    icAgreementOnFile: true,
    scheduledDate: '2024-02-01'
  },
  {
    id: 'ICT-2024-0088',
    fromEntity: 'Downtown Tower LLC',
    toEntity: 'Atlas Holdings LLC',
    type: 'Distribution',
    amount: 500000.00,
    requestDate: '2024-01-28',
    requestedBy: 'Tom Davis',
    businessPurpose: 'Q4 2023 quarterly distribution to parent',
    status: 'approved',
    urgency: 'normal',
    approvalChain: [
      { role: 'Sending Controller', name: 'Tom Davis', entity: 'Downtown Tower LLC', status: 'approved', date: '2024-01-28', comment: 'Distribution per partnership agreement' },
      { role: 'Receiving Controller', name: 'Mike Chen', entity: 'Atlas Holdings LLC', status: 'approved', date: '2024-01-28', comment: 'Approved' },
      { role: 'CFO', name: 'Robert Johnson', entity: 'Corporate', status: 'approved', date: '2024-01-29', comment: 'Approved for execution' }
    ],
    supportingDocs: ['Distribution Calculation.xlsx', 'Board Resolution.pdf'],
    icAgreementOnFile: true,
    executedDate: '2024-01-30',
    confirmationNumber: 'WIRE-2024-0156'
  },
  {
    id: 'ICT-2024-0087',
    fromEntity: 'Atlas Holdings LLC',
    toEntity: 'Oak Street Partners LP',
    type: 'Capital Contribution',
    amount: 2500000.00,
    requestDate: '2024-01-25',
    requestedBy: 'Sarah Johnson',
    businessPurpose: 'Acquisition closing equity contribution',
    status: 'executed',
    urgency: 'urgent',
    approvalChain: [
      { role: 'Sending Controller', name: 'Mike Chen', entity: 'Atlas Holdings LLC', status: 'approved', date: '2024-01-25', comment: 'Urgent - closing scheduled' },
      { role: 'Receiving Controller', name: 'External GP', entity: 'Oak Street Partners LP', status: 'approved', date: '2024-01-25', comment: 'Confirmed receipt expected' },
      { role: 'CFO', name: 'Robert Johnson', entity: 'Corporate', status: 'approved', date: '2024-01-25', comment: 'Approved - acquisition closing' },
      { role: 'CEO', name: 'David Williams', entity: 'Corporate', status: 'approved', date: '2024-01-25', comment: 'Approved for same-day execution' }
    ],
    supportingDocs: ['Capital Call Notice.pdf', 'PSA.pdf', 'IC Agreement.pdf'],
    icAgreementOnFile: true,
    executedDate: '2024-01-25',
    confirmationNumber: 'WIRE-2024-0148'
  },
  {
    id: 'ICT-2024-0086',
    fromEntity: 'Atlas Management Co.',
    toEntity: 'Atlas Holdings LLC',
    type: 'Reimbursement',
    amount: 45000.00,
    requestDate: '2024-01-22',
    requestedBy: 'Lisa Wang',
    businessPurpose: 'Reimbursement for shared corporate expenses - Q4 2023',
    status: 'pending_docs',
    urgency: 'normal',
    approvalChain: [
      { role: 'Sending Controller', name: 'Lisa Wang', entity: 'Atlas Management Co.', status: 'pending', date: null, comment: null }
    ],
    supportingDocs: [],
    icAgreementOnFile: true,
    missingDocs: ['Expense allocation schedule', 'Supporting invoices']
  }
];

const transferTypes = [
  { value: 'Loan Advance', label: 'Loan Advance', requiresCFO: true, color: 'bg-blue-100 text-blue-800' },
  { value: 'Loan Repayment', label: 'Loan Repayment', requiresCFO: true, color: 'bg-green-100 text-green-800' },
  { value: 'Capital Contribution', label: 'Capital Contribution', requiresCFO: true, color: 'bg-purple-100 text-purple-800' },
  { value: 'Distribution', label: 'Distribution', requiresCFO: true, color: 'bg-teal-100 text-teal-800' },
  { value: 'Management Fee', label: 'Management Fee', requiresCFO: false, color: 'bg-orange-100 text-orange-800' },
  { value: 'Reimbursement', label: 'Reimbursement', requiresCFO: false, color: 'bg-gray-100 text-gray-800' }
];

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
  pending_docs: { label: 'Pending Docs', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  pending_approval: { label: 'Pending Approval', color: 'bg-blue-100 text-blue-800', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  executed: { label: 'Executed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle }
};

export default function IntercompanyCashTransferWorkflowPage() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransfer, setSelectedTransfer] = useState(mockTransfers[0]);

  const filteredTransfers = useMemo(() => {
    return mockTransfers.filter(t => {
      const matchesFilter = filter === 'all' || t.status === filter;
      const matchesSearch = t.fromEntity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.toEntity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchTerm]);

  const stats = useMemo(() => ({
    pending: mockTransfers.filter(t => t.status === 'pending_approval' || t.status === 'pending_docs').length,
    approved: mockTransfers.filter(t => t.status === 'approved').length,
    executed: mockTransfers.filter(t => t.status === 'executed').length,
    totalPendingValue: mockTransfers.filter(t => t.status === 'pending_approval').reduce((sum, t) => sum + t.amount, 0)
  }), []);

  const getTypeConfig = (type) => transferTypes.find(t => t.value === type) || transferTypes[5];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Intercompany Cash Transfers</h1>
          <p className="text-gray-600">Manage IC cash movements with dual approval controls</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <ArrowLeftRight className="w-4 h-4 mr-2" />New Transfer Request
        </Button>
      </div>

      {/* Safety Controls Banner */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-purple-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-purple-900">Transfer Safety Controls Active</h3>
            <ul className="text-sm text-purple-700 mt-1 space-y-1">
              <li>• Dual approval required from both sending and receiving entity controllers</li>
              <li>• Transfers over $100,000 require CFO approval</li>
              <li>• Same-day transfers over $500,000 require CEO approval</li>
              <li>• Supporting documentation required before approval</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg"><Clock className="w-5 h-5 text-yellow-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending Approval</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              <p className="text-sm text-gray-600">Ready to Execute</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Send className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.executed}</p>
              <p className="text-sm text-gray-600">Executed (MTD)</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><DollarSign className="w-5 h-5 text-purple-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${(stats.totalPendingValue / 1000).toFixed(0)}K</p>
              <p className="text-sm text-gray-600">Pending Value</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="Search transfers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          {['all', 'pending_approval', 'approved', 'executed'].map((f) => (
            <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f === 'pending_approval' ? 'Pending' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
          {filteredTransfers.map((transfer) => (
            <div
              key={transfer.id}
              onClick={() => setSelectedTransfer(transfer)}
              className={cn(
                "bg-white rounded-lg border p-4 cursor-pointer hover:border-blue-300 transition-colors",
                selectedTransfer?.id === transfer.id ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-medium text-gray-900">{transfer.id}</span>
                <span className={cn("px-2 py-0.5 rounded text-xs", statusConfig[transfer.status].color)}>
                  {statusConfig[transfer.status].label}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2 text-sm">
                <span className="text-gray-600">{transfer.fromEntity.split(' ')[0]}</span>
                <ArrowLeftRight className="w-3 h-3 text-gray-400" />
                <span className="text-gray-600">{transfer.toEntity.split(' ')[0]}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={cn("px-2 py-0.5 rounded text-xs", getTypeConfig(transfer.type).color)}>
                  {transfer.type}
                </span>
                <span className="font-semibold text-gray-900">${transfer.amount.toLocaleString()}</span>
              </div>
              {transfer.urgency === 'urgent' && (
                <div className="mt-2 flex items-center gap-1 text-orange-600">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="text-xs">Urgent</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="col-span-2">
          {selectedTransfer && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-gray-900">{selectedTransfer.id}</h2>
                      <span className={cn("px-2 py-1 rounded-full text-xs", statusConfig[selectedTransfer.status].color)}>
                        {statusConfig[selectedTransfer.status].label}
                      </span>
                      {selectedTransfer.urgency === 'urgent' && (
                        <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">Urgent</span>
                      )}
                    </div>
                    <p className="text-gray-600">{selectedTransfer.businessPurpose}</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">${selectedTransfer.amount.toLocaleString()}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <p className="text-xs text-gray-500">From</p>
                      <p className="font-semibold text-gray-900">{selectedTransfer.fromEntity}</p>
                    </div>
                    <div className="px-6">
                      <ArrowLeftRight className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-xs text-gray-500">To</p>
                      <p className="font-semibold text-gray-900">{selectedTransfer.toEntity}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Missing Documents Warning */}
              {selectedTransfer.status === 'pending_docs' && selectedTransfer.missingDocs && (
                <div className="p-4 bg-yellow-50 border-b border-yellow-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-semibold text-yellow-900">Documentation Required</p>
                      <p className="text-sm text-yellow-700">Missing: {selectedTransfer.missingDocs.join(', ')}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Approval Chain */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />Approval Chain (Dual Approval Required)
                </h3>
                <div className="space-y-3">
                  {selectedTransfer.approvalChain.map((approval, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        approval.status === 'approved' ? "bg-green-100" :
                        approval.status === 'rejected' ? "bg-red-100" : "bg-gray-200"
                      )}>
                        {approval.status === 'approved' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                         approval.status === 'rejected' ? <XCircle className="w-4 h-4 text-red-600" /> :
                         <Clock className="w-4 h-4 text-gray-400" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{approval.role}</p>
                            <p className="text-sm text-gray-500">{approval.name} • {approval.entity}</p>
                          </div>
                          {approval.date && <span className="text-sm text-gray-500">{approval.date}</span>}
                        </div>
                        {approval.comment && (
                          <p className="text-sm text-gray-600 mt-1 italic">"{approval.comment}"</p>
                        )}
                      </div>
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

              {/* Supporting Documents */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Supporting Documentation</h3>
                {selectedTransfer.supportingDocs.length > 0 ? (
                  <div className="space-y-2">
                    {selectedTransfer.supportingDocs.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{doc}</span>
                        </div>
                        <Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No documents uploaded</p>
                )}
                <div className="flex items-center gap-2 mt-3 text-sm">
                  {selectedTransfer.icAgreementOnFile ? (
                    <span className="text-green-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" />IC Agreement on file</span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />IC Agreement missing</span>
                  )}
                </div>
              </div>

              {/* Execution Details */}
              {selectedTransfer.status === 'executed' && (
                <div className="p-6 bg-green-50">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">Transfer Executed</p>
                      <p className="text-sm text-green-700">
                        Executed on {selectedTransfer.executedDate} • Confirmation: {selectedTransfer.confirmationNumber}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedTransfer.status === 'approved' && (
                <div className="p-6 bg-gray-50 flex justify-end gap-3">
                  <Button variant="outline">Schedule for Later</Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Send className="w-4 h-4 mr-2" />Execute Transfer
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
