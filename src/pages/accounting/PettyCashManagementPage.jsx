import React, { useState, useMemo } from 'react';
import {
  Wallet, Plus, DollarSign, FileText, CheckCircle, Clock,
  AlertCircle, User, Calendar, Receipt, ArrowUpRight, ArrowDownRight,
  RefreshCw, Lock, Unlock, Search, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/*
 * PETTY CASH MANAGEMENT - SAFETY PROCEDURES & BEST PRACTICES
 *
 * 1. FUND LIMITS
 *    - Maximum fund size: $500 per location
 *    - Single disbursement limit: $50 (requires receipt)
 *    - Over $50 requires manager pre-approval
 *    - Over $100 MUST use regular AP process
 *
 * 2. CUSTODIAN CONTROLS
 *    - Designated custodian for each fund
 *    - Custodian cannot approve own reimbursements
 *    - Background check required for custodians
 *    - Annual rotation of custodians recommended
 *
 * 3. RECONCILIATION REQUIREMENTS
 *    - Weekly count by custodian
 *    - Monthly surprise count by supervisor
 *    - Cash + receipts must equal fund amount
 *    - Variances over $5 require investigation
 *
 * 4. DOCUMENTATION REQUIREMENTS
 *    - Itemized receipt required for ALL disbursements
 *    - Business purpose must be documented
 *    - Recipient signature required
 *    - Date and amount on all vouchers
 *
 * 5. REPLENISHMENT CONTROLS
 *    - Replenishment when fund reaches 25%
 *    - Approved receipts required for replenishment
 *    - Dual approval for replenishment over $200
 *    - Check made to custodian, not cash
 *
 * 6. PROHIBITED USES
 *    - Personal loans or advances
 *    - Salary or wage payments
 *    - Travel advances
 *    - Purchases that should go through AP
 */

const mockPettyCashFunds = [
  {
    id: 1,
    location: 'Corporate Office',
    custodian: 'Maria Garcia',
    fundAmount: 500,
    currentBalance: 245.50,
    lastCount: '2024-02-01',
    lastReplenishment: '2024-01-25',
    status: 'active',
    countStatus: 'current'
  },
  {
    id: 2,
    location: 'Riverside Plaza Office',
    custodian: 'Tom Wilson',
    fundAmount: 300,
    currentBalance: 78.25,
    lastCount: '2024-02-01',
    lastReplenishment: '2024-01-28',
    status: 'active',
    countStatus: 'needs_replenishment'
  },
  {
    id: 3,
    location: 'Downtown Tower',
    custodian: 'Sarah Chen',
    fundAmount: 500,
    currentBalance: 412.00,
    lastCount: '2024-01-28',
    lastReplenishment: '2024-01-15',
    status: 'active',
    countStatus: 'count_overdue'
  }
];

const mockTransactions = [
  { id: 1, fundId: 1, date: '2024-02-02', description: 'Office supplies - pens, paper', amount: 24.50, recipient: 'John Smith', approver: 'Maria Garcia', hasReceipt: true, category: 'Supplies' },
  { id: 2, fundId: 1, date: '2024-02-01', description: 'Parking for client meeting', amount: 15.00, recipient: 'Lisa Wang', approver: 'Maria Garcia', hasReceipt: true, category: 'Travel' },
  { id: 3, fundId: 2, date: '2024-02-02', description: 'Emergency plumbing supplies', amount: 45.75, recipient: 'Mike Chen', approver: 'Tom Wilson', hasReceipt: true, category: 'Maintenance' },
  { id: 4, fundId: 1, date: '2024-01-31', description: 'Courier service - urgent delivery', amount: 35.00, recipient: 'Admin Team', approver: 'Maria Garcia', hasReceipt: true, category: 'Delivery' },
  { id: 5, fundId: 3, date: '2024-01-30', description: 'Coffee supplies for meeting', amount: 28.00, recipient: 'Reception', approver: 'Sarah Chen', hasReceipt: true, category: 'Refreshments' },
  { id: 6, fundId: 2, date: '2024-01-29', description: 'Postage stamps', amount: 22.00, recipient: 'Admin', approver: 'Tom Wilson', hasReceipt: true, category: 'Postage' }
];

const mockPendingDisbursements = [
  { id: 1, fundId: 1, requestor: 'James Brown', description: 'Office plant purchase', amount: 35.00, requestDate: '2024-02-02', status: 'pending_approval' },
  { id: 2, fundId: 2, requestor: 'Anna Lee', description: 'Emergency lock replacement', amount: 65.00, requestDate: '2024-02-02', status: 'pending_approval', requiresManagerApproval: true }
];

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800', icon: Unlock },
  locked: { label: 'Locked', color: 'bg-red-100 text-red-800', icon: Lock },
  pending_count: { label: 'Count Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock }
};

const countStatusConfig = {
  current: { label: 'Current', color: 'bg-green-100 text-green-800' },
  needs_replenishment: { label: 'Needs Replenishment', color: 'bg-orange-100 text-orange-800' },
  count_overdue: { label: 'Count Overdue', color: 'bg-red-100 text-red-800' }
};

export default function PettyCashManagementPage() {
  const [activeTab, setActiveTab] = useState('funds');
  const [selectedFund, setSelectedFund] = useState(null);
  const [showDisbursementModal, setShowDisbursementModal] = useState(false);
  const [showCountModal, setShowCountModal] = useState(false);

  const stats = useMemo(() => ({
    totalFunds: mockPettyCashFunds.length,
    totalCashOnHand: mockPettyCashFunds.reduce((sum, f) => sum + f.currentBalance, 0),
    needsReplenishment: mockPettyCashFunds.filter(f => f.countStatus === 'needs_replenishment').length,
    countOverdue: mockPettyCashFunds.filter(f => f.countStatus === 'count_overdue').length,
    pendingDisbursements: mockPendingDisbursements.length
  }), []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Petty Cash Management</h1>
          <p className="text-gray-600">Manage petty cash funds with proper controls and documentation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><RefreshCw className="w-4 h-4 mr-2" />Surprise Count</Button>
          <Button className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />New Fund</Button>
        </div>
      </div>

      {/* Alerts */}
      {(stats.countOverdue > 0 || stats.needsReplenishment > 0) && (
        <div className="space-y-2">
          {stats.countOverdue > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">{stats.countOverdue} Fund(s) Overdue for Count</p>
                <p className="text-sm text-red-700">Weekly count required per petty cash policy</p>
              </div>
              <Button size="sm" className="ml-auto bg-red-600 hover:bg-red-700">Schedule Count</Button>
            </div>
          )}
          {stats.needsReplenishment > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
              <Wallet className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-900">{stats.needsReplenishment} Fund(s) Need Replenishment</p>
                <p className="text-sm text-orange-700">Fund balance below 25% threshold</p>
              </div>
              <Button size="sm" variant="outline" className="ml-auto border-orange-600 text-orange-600">Request Replenishment</Button>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Wallet className="w-4 h-4" />
            <span className="text-sm">Total Funds</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalFunds}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Cash on Hand</span>
          </div>
          <p className="text-2xl font-bold text-green-600">${stats.totalCashOnHand.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <ArrowDownRight className="w-4 h-4" />
            <span className="text-sm">Needs Replenishment</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.needsReplenishment}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Count Overdue</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.countOverdue}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-sm">Pending Disbursements</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.pendingDisbursements}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {['funds', 'transactions', 'pending', 'counts'].map((tab) => (
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
            {tab === 'funds' && 'Petty Cash Funds'}
            {tab === 'transactions' && 'Recent Transactions'}
            {tab === 'pending' && `Pending Approval (${stats.pendingDisbursements})`}
            {tab === 'counts' && 'Cash Counts'}
          </button>
        ))}
      </div>

      {/* Funds Tab */}
      {activeTab === 'funds' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockPettyCashFunds.map((fund) => {
            const balancePercent = (fund.currentBalance / fund.fundAmount) * 100;
            return (
              <div key={fund.id} className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{fund.location}</h3>
                  <span className={cn("px-2 py-0.5 rounded text-xs", statusConfig[fund.status].color)}>
                    {statusConfig[fund.status].label}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>Custodian: {fund.custodian}</span>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Balance</span>
                      <span className="font-medium">${fund.currentBalance.toFixed(2)} / ${fund.fundAmount}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={cn(
                          "h-2 rounded-full",
                          balancePercent > 50 ? "bg-green-500" : balancePercent > 25 ? "bg-yellow-500" : "bg-red-500"
                        )}
                        style={{ width: `${balancePercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Last Count: {fund.lastCount}</span>
                    <span className={cn("px-2 py-0.5 rounded text-xs", countStatusConfig[fund.countStatus].color)}>
                      {countStatusConfig[fund.countStatus].label}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Receipt className="w-3 h-3 mr-1" />Disburse
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <RefreshCw className="w-3 h-3 mr-1" />Count
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-sm text-gray-500">
                <th className="p-4">Date</th>
                <th className="p-4">Description</th>
                <th className="p-4">Category</th>
                <th className="p-4">Recipient</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Receipt</th>
                <th className="p-4">Approver</th>
              </tr>
            </thead>
            <tbody>
              {mockTransactions.map((txn) => (
                <tr key={txn.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-sm">{txn.date}</td>
                  <td className="p-4 text-sm font-medium">{txn.description}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">{txn.category}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{txn.recipient}</td>
                  <td className="p-4 text-sm font-medium text-red-600">-${txn.amount.toFixed(2)}</td>
                  <td className="p-4">
                    {txn.hasReceipt ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-600">{txn.approver}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pending Disbursements Tab */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-sm text-gray-500">
                <th className="p-4">Request Date</th>
                <th className="p-4">Requestor</th>
                <th className="p-4">Description</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Approval Required</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockPendingDisbursements.map((req) => (
                <tr key={req.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-sm">{req.requestDate}</td>
                  <td className="p-4 text-sm font-medium">{req.requestor}</td>
                  <td className="p-4 text-sm">{req.description}</td>
                  <td className="p-4 text-sm font-medium">${req.amount.toFixed(2)}</td>
                  <td className="p-4">
                    {req.requiresManagerApproval ? (
                      <span className="px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-800">Manager Required (Over $50)</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">Custodian</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">Approve</Button>
                      <Button size="sm" variant="outline" className="text-red-600">Deny</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Counts Tab */}
      {activeTab === 'counts' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Petty Cash Count Policy</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Weekly count by custodian (every Monday)</li>
              <li>• Monthly surprise count by supervisor</li>
              <li>• Cash + unprocessed receipts must equal fund amount</li>
              <li>• Variances over $5.00 require written explanation and investigation</li>
              <li>• Two consecutive variances require fund audit and potential custodian review</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold">Recent Cash Counts</h3>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-sm text-gray-500">
                  <th className="p-4">Date</th>
                  <th className="p-4">Fund</th>
                  <th className="p-4">Counted By</th>
                  <th className="p-4">Expected</th>
                  <th className="p-4">Actual</th>
                  <th className="p-4">Variance</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4 text-sm">2024-02-01</td>
                  <td className="p-4 text-sm font-medium">Corporate Office</td>
                  <td className="p-4 text-sm">Maria Garcia</td>
                  <td className="p-4 text-sm">$500.00</td>
                  <td className="p-4 text-sm">$500.00</td>
                  <td className="p-4 text-sm text-green-600">$0.00</td>
                  <td className="p-4"><span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">Balanced</span></td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 text-sm">2024-02-01</td>
                  <td className="p-4 text-sm font-medium">Riverside Plaza</td>
                  <td className="p-4 text-sm">Tom Wilson</td>
                  <td className="p-4 text-sm">$300.00</td>
                  <td className="p-4 text-sm">$300.00</td>
                  <td className="p-4 text-sm text-green-600">$0.00</td>
                  <td className="p-4"><span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">Balanced</span></td>
                </tr>
                <tr className="border-b bg-yellow-50">
                  <td className="p-4 text-sm">2024-01-25</td>
                  <td className="p-4 text-sm font-medium">Downtown Tower</td>
                  <td className="p-4 text-sm">Supervisor (Surprise)</td>
                  <td className="p-4 text-sm">$500.00</td>
                  <td className="p-4 text-sm">$497.50</td>
                  <td className="p-4 text-sm text-red-600">-$2.50</td>
                  <td className="p-4"><span className="px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-800">Minor Variance</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
