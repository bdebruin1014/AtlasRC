import React, { useState, useMemo } from 'react';
import {
  User, DollarSign, CheckCircle, XCircle, Clock, AlertTriangle,
  Shield, FileText, Search, Eye, Upload, Receipt, Calendar,
  AlertCircle, UserCheck, Building, CreditCard, ArrowRight, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/*
 * MANAGING MEMBER REIMBURSEMENT SAFETY PROCEDURES
 *
 * 1. ENHANCED APPROVAL REQUIREMENTS
 *    - All managing member expenses require independent review
 *    - Expenses over $1,000 require CFO approval
 *    - Expenses over $5,000 require Board/LP approval
 *    - Self-approval is strictly prohibited
 *
 * 2. DOCUMENTATION STANDARDS
 *    - Itemized receipts required for all expenses
 *    - Business purpose must be documented in detail
 *    - Related party disclosures required for vendor relationships
 *    - Travel expenses require pre-approval for out-of-policy items
 *
 * 3. PROHIBITED TRANSACTIONS
 *    - Personal expenses disguised as business
 *    - Excessive entertainment without proper justification
 *    - Transactions with undisclosed related parties
 *    - Splitting transactions to avoid approval thresholds
 *
 * 4. AUDIT & COMPLIANCE
 *    - Quarterly audit of managing member expenses
 *    - Annual disclosure to Limited Partners
 *    - Comparison to budget and prior periods
 *    - Compliance with Operating Agreement limits
 */

const mockManagingMembers = [
  { id: 'MM-001', name: 'David Williams', title: 'CEO / Managing Member', entity: 'Atlas Holdings LLC' },
  { id: 'MM-002', name: 'Robert Johnson', title: 'CFO / Managing Member', entity: 'Atlas Holdings LLC' },
  { id: 'MM-003', name: 'Michael Chen', title: 'COO / Managing Member', entity: 'Atlas Holdings LLC' }
];

const mockReimbursements = [
  {
    id: 'RMB-2024-0156',
    managingMember: 'David Williams',
    memberId: 'MM-001',
    submitDate: '2024-01-28',
    totalAmount: 8500.00,
    status: 'pending_board',
    category: 'Travel & Entertainment',
    description: 'Investor relations trip - NYC meetings',
    expenses: [
      { item: 'Airfare - Austin to NYC roundtrip', amount: 1200.00, receipt: true, approved: true },
      { item: 'Hotel - The Plaza (3 nights)', amount: 4500.00, receipt: true, approved: true },
      { item: 'Client dinner - Eleven Madison Park', amount: 1800.00, receipt: true, approved: false, flag: 'Exceeds per-person limit' },
      { item: 'Ground transportation', amount: 650.00, receipt: true, approved: true },
      { item: 'Miscellaneous', amount: 350.00, receipt: false, approved: false, flag: 'Missing receipt' }
    ],
    approvalChain: [
      { role: 'Independent Reviewer', name: 'Sarah Johnson', status: 'approved', date: '2024-01-29', comment: 'Business purpose verified, flagged items noted' },
      { role: 'CFO', name: 'Robert Johnson', status: 'approved', date: '2024-01-29', comment: 'Approved with noted exceptions' },
      { role: 'Board/LP Representative', name: 'External LP', status: 'pending', date: null, comment: null }
    ],
    relatedPartyDisclosure: false,
    budgetComparison: { ytdSpend: 45000, annualBudget: 100000, percentUsed: 45 }
  },
  {
    id: 'RMB-2024-0155',
    managingMember: 'Robert Johnson',
    memberId: 'MM-002',
    submitDate: '2024-01-25',
    totalAmount: 2200.00,
    status: 'approved',
    category: 'Professional Development',
    description: 'Real Estate Finance Conference attendance',
    expenses: [
      { item: 'Conference registration', amount: 1500.00, receipt: true, approved: true },
      { item: 'Airfare - Austin to Chicago', amount: 450.00, receipt: true, approved: true },
      { item: 'Hotel - Hyatt Regency (2 nights)', amount: 250.00, receipt: true, approved: true }
    ],
    approvalChain: [
      { role: 'Independent Reviewer', name: 'Lisa Wang', status: 'approved', date: '2024-01-26', comment: 'Within policy limits' },
      { role: 'CEO', name: 'David Williams', status: 'approved', date: '2024-01-26', comment: 'Approved - professional development' }
    ],
    relatedPartyDisclosure: false,
    budgetComparison: { ytdSpend: 15000, annualBudget: 50000, percentUsed: 30 },
    paidDate: '2024-01-28',
    paymentMethod: 'Direct Deposit'
  },
  {
    id: 'RMB-2024-0154',
    managingMember: 'Michael Chen',
    memberId: 'MM-003',
    submitDate: '2024-01-20',
    totalAmount: 12500.00,
    status: 'rejected',
    category: 'Equipment & Technology',
    description: 'Home office setup and technology upgrade',
    expenses: [
      { item: 'MacBook Pro 16"', amount: 4500.00, receipt: true, approved: false, flag: 'Not pre-approved' },
      { item: 'Home office furniture', amount: 6000.00, receipt: true, approved: false, flag: 'Personal benefit - requires proration' },
      { item: 'Monitor and accessories', amount: 2000.00, receipt: true, approved: false, flag: 'Exceeds equipment policy' }
    ],
    approvalChain: [
      { role: 'Independent Reviewer', name: 'Tom Davis', status: 'flagged', date: '2024-01-21', comment: 'Multiple policy violations - recommend rejection' },
      { role: 'CFO', name: 'Robert Johnson', status: 'rejected', date: '2024-01-22', comment: 'Equipment not pre-approved, home office requires 50% personal contribution per policy' }
    ],
    relatedPartyDisclosure: false,
    rejectionReason: 'Equipment purchases require pre-approval. Home office expenses require 50% personal contribution per Managing Member Agreement.'
  },
  {
    id: 'RMB-2024-0153',
    managingMember: 'David Williams',
    memberId: 'MM-001',
    submitDate: '2024-01-15',
    totalAmount: 3200.00,
    status: 'pending_cfo',
    category: 'Business Development',
    description: 'Prospective investor entertainment',
    expenses: [
      { item: 'Golf outing - Austin CC', amount: 800.00, receipt: true, approved: true },
      { item: 'Dinner - Uchi', amount: 1200.00, receipt: true, approved: true },
      { item: 'Tickets - UT Football', amount: 1200.00, receipt: true, approved: false, flag: 'Entertainment requires business purpose detail' }
    ],
    approvalChain: [
      { role: 'Independent Reviewer', name: 'Sarah Johnson', status: 'approved', date: '2024-01-16', comment: 'Verified investor meeting, tickets need detail' },
      { role: 'CFO', name: 'Robert Johnson', status: 'pending', date: null, comment: null }
    ],
    relatedPartyDisclosure: true,
    relatedPartyDetail: 'Investor is brother-in-law - disclosed per policy',
    budgetComparison: { ytdSpend: 45000, annualBudget: 100000, percentUsed: 45 }
  }
];

const categoryColors = {
  'Travel & Entertainment': 'bg-blue-100 text-blue-800',
  'Professional Development': 'bg-green-100 text-green-800',
  'Equipment & Technology': 'bg-purple-100 text-purple-800',
  'Business Development': 'bg-orange-100 text-orange-800',
  'Office & Administrative': 'bg-gray-100 text-gray-800'
};

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
  pending_review: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  pending_cfo: { label: 'Pending CFO', color: 'bg-blue-100 text-blue-800', icon: UserCheck },
  pending_board: { label: 'Pending Board', color: 'bg-purple-100 text-purple-800', icon: UserCheck },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-800', icon: DollarSign }
};

export default function ManagingMemberReimbursementPage() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReimbursement, setSelectedReimbursement] = useState(mockReimbursements[0]);

  const filteredReimbursements = useMemo(() => {
    return mockReimbursements.filter(r => {
      const matchesFilter = filter === 'all' || r.status === filter ||
        (filter === 'pending' && r.status.startsWith('pending'));
      const matchesSearch = r.managingMember.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchTerm]);

  const stats = useMemo(() => ({
    pending: mockReimbursements.filter(r => r.status.startsWith('pending')).length,
    approved: mockReimbursements.filter(r => r.status === 'approved' || r.status === 'paid').length,
    rejected: mockReimbursements.filter(r => r.status === 'rejected').length,
    totalPending: mockReimbursements.filter(r => r.status.startsWith('pending')).reduce((sum, r) => sum + r.totalAmount, 0),
    flaggedExpenses: mockReimbursements.flatMap(r => r.expenses).filter(e => e.flag).length
  }), []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Managing Member Reimbursements</h1>
          <p className="text-gray-600">Enhanced controls for managing member expense reimbursements</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Receipt className="w-4 h-4 mr-2" />Submit Reimbursement
        </Button>
      </div>

      {/* Safety Controls Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900">Enhanced Approval Controls for Managing Members</h3>
            <ul className="text-sm text-amber-700 mt-1 space-y-1">
              <li>• All expenses require independent reviewer approval (self-approval prohibited)</li>
              <li>• Expenses over $1,000 require CFO approval</li>
              <li>• Expenses over $5,000 require Board/LP Representative approval</li>
              <li>• Related party transactions must be disclosed</li>
              <li>• Quarterly audit and annual LP disclosure required</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg"><Clock className="w-5 h-5 text-yellow-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg"><XCircle className="w-5 h-5 text-red-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><DollarSign className="w-5 h-5 text-purple-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${(stats.totalPending / 1000).toFixed(1)}K</p>
              <p className="text-sm text-gray-600">Pending Value</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg"><AlertTriangle className="w-5 h-5 text-orange-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.flaggedExpenses}</p>
              <p className="text-sm text-gray-600">Flagged Items</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="Search reimbursements..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((f) => (
            <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
          {filteredReimbursements.map((reimbursement) => (
            <div
              key={reimbursement.id}
              onClick={() => setSelectedReimbursement(reimbursement)}
              className={cn(
                "bg-white rounded-lg border p-4 cursor-pointer hover:border-blue-300 transition-colors",
                selectedReimbursement?.id === reimbursement.id ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200",
                reimbursement.status === 'rejected' && "border-red-200 bg-red-50"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-900">{reimbursement.id}</p>
                  <p className="text-sm text-gray-500">{reimbursement.managingMember}</p>
                </div>
                <span className={cn("px-2 py-0.5 rounded text-xs", statusConfig[reimbursement.status].color)}>
                  {statusConfig[reimbursement.status].label}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2 line-clamp-1">{reimbursement.description}</p>
              <div className="flex items-center justify-between">
                <span className={cn("px-2 py-0.5 rounded text-xs", categoryColors[reimbursement.category])}>
                  {reimbursement.category}
                </span>
                <span className="font-semibold text-gray-900">${reimbursement.totalAmount.toLocaleString()}</span>
              </div>
              {reimbursement.relatedPartyDisclosure && (
                <div className="mt-2 flex items-center gap-1 text-amber-600">
                  <AlertCircle className="w-3 h-3" />
                  <span className="text-xs">Related Party</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="col-span-2">
          {selectedReimbursement && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-gray-900">{selectedReimbursement.id}</h2>
                      <span className={cn("px-2 py-1 rounded-full text-xs", statusConfig[selectedReimbursement.status].color)}>
                        {statusConfig[selectedReimbursement.status].label}
                      </span>
                    </div>
                    <p className="text-gray-600">{selectedReimbursement.description}</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">${selectedReimbursement.totalAmount.toLocaleString()}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Managing Member</p>
                    <p className="font-semibold text-gray-900">{selectedReimbursement.managingMember}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Submit Date</p>
                    <p className="font-semibold text-gray-900">{selectedReimbursement.submitDate}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Category</p>
                    <p className="font-semibold text-gray-900">{selectedReimbursement.category}</p>
                  </div>
                </div>

                {/* Budget Comparison */}
                {selectedReimbursement.budgetComparison && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-blue-800">YTD Spend vs Annual Budget</span>
                      <span className="text-sm font-medium text-blue-900">
                        ${selectedReimbursement.budgetComparison.ytdSpend.toLocaleString()} / ${selectedReimbursement.budgetComparison.annualBudget.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", selectedReimbursement.budgetComparison.percentUsed > 75 ? "bg-orange-500" : "bg-blue-500")}
                        style={{ width: `${selectedReimbursement.budgetComparison.percentUsed}%` }}
                      />
                    </div>
                    <p className="text-xs text-blue-700 mt-1">{selectedReimbursement.budgetComparison.percentUsed}% of annual budget used</p>
                  </div>
                )}
              </div>

              {/* Related Party Disclosure */}
              {selectedReimbursement.relatedPartyDisclosure && (
                <div className="p-4 bg-amber-50 border-b border-amber-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="font-semibold text-amber-900">Related Party Transaction Disclosed</p>
                      <p className="text-sm text-amber-700">{selectedReimbursement.relatedPartyDetail}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedReimbursement.status === 'rejected' && selectedReimbursement.rejectionReason && (
                <div className="p-4 bg-red-50 border-b border-red-200">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-semibold text-red-900">Rejection Reason</p>
                      <p className="text-sm text-red-700">{selectedReimbursement.rejectionReason}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Expense Line Items */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Expense Line Items</h3>
                <div className="space-y-2">
                  {selectedReimbursement.expenses.map((expense, idx) => (
                    <div key={idx} className={cn("flex items-center justify-between p-3 rounded-lg", expense.flag ? "bg-red-50" : "bg-gray-50")}>
                      <div className="flex items-center gap-3">
                        {expense.approved ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : expense.flag ? (
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-gray-400" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{expense.item}</p>
                          {expense.flag && <p className="text-xs text-red-600">{expense.flag}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {expense.receipt ? (
                          <span className="text-xs text-green-600 flex items-center gap-1"><Receipt className="w-3 h-3" />Receipt</span>
                        ) : (
                          <span className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />No Receipt</span>
                        )}
                        <span className="font-semibold text-gray-900">${expense.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Approval Chain */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />Approval Chain (Independent Review Required)
                </h3>
                <div className="space-y-3">
                  {selectedReimbursement.approvalChain.map((approval, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        approval.status === 'approved' ? "bg-green-100" :
                        approval.status === 'rejected' || approval.status === 'flagged' ? "bg-red-100" : "bg-gray-200"
                      )}>
                        {approval.status === 'approved' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                         approval.status === 'rejected' ? <XCircle className="w-4 h-4 text-red-600" /> :
                         approval.status === 'flagged' ? <AlertTriangle className="w-4 h-4 text-orange-600" /> :
                         <Clock className="w-4 h-4 text-gray-400" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{approval.role}</p>
                            <p className="text-sm text-gray-500">{approval.name}</p>
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

              {/* Payment Info */}
              {selectedReimbursement.status === 'approved' && selectedReimbursement.paidDate && (
                <div className="p-6 bg-green-50">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">Reimbursement Paid</p>
                      <p className="text-sm text-green-700">
                        Paid on {selectedReimbursement.paidDate} via {selectedReimbursement.paymentMethod}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedReimbursement.status.startsWith('pending') && (
                <div className="p-6 bg-gray-50 flex justify-end gap-3">
                  <Button variant="outline"><Eye className="w-4 h-4 mr-2" />View Receipts</Button>
                  <Button variant="outline" className="text-red-600">Reject All</Button>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />Approve & Forward
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
