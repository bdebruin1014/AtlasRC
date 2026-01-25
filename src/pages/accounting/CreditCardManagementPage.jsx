import React, { useState, useMemo } from 'react';
import {
  CreditCard, CheckCircle, XCircle, Clock, AlertTriangle, User,
  DollarSign, Calendar, Search, Shield, AlertCircle, Receipt,
  Upload, Eye, Lock, Unlock, FileText, Ban, CheckSquare, Square
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/*
 * CREDIT CARD SAFETY PROCEDURES & BEST PRACTICES
 *
 * 1. SEGREGATION OF DUTIES
 *    - Card issuance must be approved by finance director
 *    - Card limit changes require dual approval
 *    - Expense reviewers cannot approve their own expenses
 *
 * 2. TRANSACTION CONTROLS
 *    - All transactions over $500 require receipt upload within 48 hours
 *    - Transactions over $2,500 require manager pre-approval
 *    - Restricted merchant categories are auto-flagged
 *
 * 3. RECONCILIATION REQUIREMENTS
 *    - All cardholders must reconcile weekly
 *    - Monthly statement reconciliation due by 5th of following month
 *    - Unreconciled cards are automatically suspended
 *
 * 4. POLICY ENFORCEMENT
 *    - Personal expenses are strictly prohibited
 *    - Entertainment expenses require business purpose documentation
 *    - Travel expenses must comply with company travel policy
 */

const mockCreditCards = [
  {
    id: 'CC-001',
    cardNumber: '****4521',
    cardHolder: 'Sarah Johnson',
    department: 'Acquisitions',
    entity: 'Atlas Holdings LLC',
    creditLimit: 25000,
    currentBalance: 8450.00,
    availableCredit: 16550.00,
    status: 'active',
    lastReconciled: '2024-01-28',
    pendingReceipts: 2,
    flaggedTransactions: 0
  },
  {
    id: 'CC-002',
    cardNumber: '****7832',
    cardHolder: 'John Smith',
    department: 'Acquisitions',
    entity: 'Atlas Holdings LLC',
    creditLimit: 15000,
    currentBalance: 12350.00,
    availableCredit: 2650.00,
    status: 'active',
    lastReconciled: '2024-01-25',
    pendingReceipts: 5,
    flaggedTransactions: 1
  },
  {
    id: 'CC-003',
    cardNumber: '****9156',
    cardHolder: 'Tom Davis',
    department: 'Asset Management',
    entity: 'Atlas Management Co.',
    creditLimit: 10000,
    currentBalance: 3200.00,
    availableCredit: 6800.00,
    status: 'suspended',
    suspendedReason: 'Pending receipt submission overdue',
    lastReconciled: '2024-01-15',
    pendingReceipts: 8,
    flaggedTransactions: 2
  },
  {
    id: 'CC-004',
    cardNumber: '****2847',
    cardHolder: 'Lisa Wang',
    department: 'Finance',
    entity: 'Atlas Holdings LLC',
    creditLimit: 20000,
    currentBalance: 5680.00,
    availableCredit: 14320.00,
    status: 'active',
    lastReconciled: '2024-01-30',
    pendingReceipts: 0,
    flaggedTransactions: 0
  }
];

const mockTransactions = [
  {
    id: 'TXN-001',
    cardId: 'CC-002',
    cardHolder: 'John Smith',
    date: '2024-01-29',
    merchant: 'Delta Airlines',
    category: 'Travel',
    amount: 1250.00,
    status: 'pending_receipt',
    receiptUploaded: false,
    flagged: false,
    approvalRequired: false,
    businessPurpose: 'Site visit - Dallas property inspection'
  },
  {
    id: 'TXN-002',
    cardId: 'CC-002',
    cardHolder: 'John Smith',
    date: '2024-01-28',
    merchant: 'Marriott Hotels',
    category: 'Travel',
    amount: 485.00,
    status: 'pending_receipt',
    receiptUploaded: false,
    flagged: false,
    approvalRequired: false,
    businessPurpose: 'Site visit - Dallas property inspection'
  },
  {
    id: 'TXN-003',
    cardId: 'CC-002',
    cardHolder: 'John Smith',
    date: '2024-01-27',
    merchant: 'Liquor Store',
    category: 'Restricted',
    amount: 85.00,
    status: 'flagged',
    receiptUploaded: false,
    flagged: true,
    flagReason: 'Restricted merchant category - requires justification',
    approvalRequired: true,
    businessPurpose: null
  },
  {
    id: 'TXN-004',
    cardId: 'CC-001',
    cardHolder: 'Sarah Johnson',
    date: '2024-01-30',
    merchant: 'Conference Registration',
    category: 'Professional Development',
    amount: 2800.00,
    status: 'approved',
    receiptUploaded: true,
    flagged: false,
    approvalRequired: true,
    approvedBy: 'Mike Chen',
    approvedDate: '2024-01-29',
    businessPurpose: 'ICSC Conference - Las Vegas'
  },
  {
    id: 'TXN-005',
    cardId: 'CC-003',
    cardHolder: 'Tom Davis',
    date: '2024-01-20',
    merchant: 'Office Depot',
    category: 'Office Supplies',
    amount: 320.00,
    status: 'pending_receipt',
    receiptUploaded: false,
    flagged: true,
    flagReason: 'Receipt overdue (10+ days)',
    approvalRequired: false,
    businessPurpose: 'Office supplies for property'
  }
];

const safetyPolicies = [
  {
    id: 'POL-001',
    name: 'Receipt Upload Requirement',
    description: 'All transactions over $50 require receipt upload within 48 hours',
    threshold: 50,
    enforcement: 'auto_flag'
  },
  {
    id: 'POL-002',
    name: 'Pre-Approval Threshold',
    description: 'Transactions over $2,500 require manager pre-approval',
    threshold: 2500,
    enforcement: 'block_without_approval'
  },
  {
    id: 'POL-003',
    name: 'Restricted Merchants',
    description: 'Certain merchant categories require additional justification',
    categories: ['Liquor Stores', 'Casinos', 'Personal Services'],
    enforcement: 'flag_and_review'
  },
  {
    id: 'POL-004',
    name: 'Card Suspension Policy',
    description: 'Cards with 5+ pending receipts over 7 days are auto-suspended',
    enforcement: 'auto_suspend'
  }
];

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  suspended: { label: 'Suspended', color: 'bg-red-100 text-red-800', icon: Ban },
  pending_activation: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock }
};

const txnStatusConfig = {
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
  pending_receipt: { label: 'Pending Receipt', color: 'bg-yellow-100 text-yellow-800' },
  pending_approval: { label: 'Pending Approval', color: 'bg-blue-100 text-blue-800' },
  flagged: { label: 'Flagged', color: 'bg-red-100 text-red-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' }
};

export default function CreditCardManagementPage() {
  const [view, setView] = useState('cards');
  const [selectedCard, setSelectedCard] = useState(mockCreditCards[0]);
  const [txnFilter, setTxnFilter] = useState('all');

  const stats = useMemo(() => ({
    totalCards: mockCreditCards.length,
    activeCards: mockCreditCards.filter(c => c.status === 'active').length,
    suspendedCards: mockCreditCards.filter(c => c.status === 'suspended').length,
    totalBalance: mockCreditCards.reduce((sum, c) => sum + c.currentBalance, 0),
    pendingReceipts: mockCreditCards.reduce((sum, c) => sum + c.pendingReceipts, 0),
    flaggedTransactions: mockTransactions.filter(t => t.flagged).length
  }), []);

  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter(txn => {
      if (txnFilter === 'all') return true;
      if (txnFilter === 'flagged') return txn.flagged;
      if (txnFilter === 'pending') return txn.status === 'pending_receipt' || txn.status === 'pending_approval';
      return txn.status === txnFilter;
    });
  }, [txnFilter]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Credit Card Management</h1>
          <p className="text-gray-600">Manage corporate cards with safety controls and policy enforcement</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Shield className="w-4 h-4 mr-2" />View Policies</Button>
          <Button className="bg-blue-600 hover:bg-blue-700"><CreditCard className="w-4 h-4 mr-2" />Request New Card</Button>
        </div>
      </div>

      {/* Safety Alert Banner */}
      {(stats.suspendedCards > 0 || stats.flaggedTransactions > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div className="flex-1">
              <p className="font-semibold text-red-900">Action Required</p>
              <p className="text-sm text-red-700">
                {stats.suspendedCards > 0 && `${stats.suspendedCards} card(s) suspended. `}
                {stats.flaggedTransactions > 0 && `${stats.flaggedTransactions} transaction(s) flagged for review.`}
              </p>
            </div>
            <Button variant="outline" className="border-red-300 text-red-700">Review Now</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-6 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><CreditCard className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCards}</p>
              <p className="text-sm text-gray-600">Total Cards</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.activeCards}</p>
              <p className="text-sm text-gray-600">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg"><Ban className="w-5 h-5 text-red-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.suspendedCards}</p>
              <p className="text-sm text-gray-600">Suspended</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><DollarSign className="w-5 h-5 text-purple-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${(stats.totalBalance / 1000).toFixed(1)}K</p>
              <p className="text-sm text-gray-600">Total Balance</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg"><Receipt className="w-5 h-5 text-yellow-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingReceipts}</p>
              <p className="text-sm text-gray-600">Pending Receipts</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg"><AlertTriangle className="w-5 h-5 text-orange-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.flaggedTransactions}</p>
              <p className="text-sm text-gray-600">Flagged</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 pb-4">
        <Button variant={view === 'cards' ? 'default' : 'outline'} onClick={() => setView('cards')}>Card Management</Button>
        <Button variant={view === 'transactions' ? 'default' : 'outline'} onClick={() => setView('transactions')}>Transactions</Button>
        <Button variant={view === 'policies' ? 'default' : 'outline'} onClick={() => setView('policies')}>Safety Policies</Button>
      </div>

      {view === 'cards' && (
        <div className="grid grid-cols-2 gap-6">
          {mockCreditCards.map((card) => (
            <div key={card.id} className={cn("bg-white rounded-lg border p-6", card.status === 'suspended' && "border-red-300 bg-red-50")}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-3 rounded-lg", card.status === 'suspended' ? "bg-red-100" : "bg-blue-100")}>
                    <CreditCard className={cn("w-6 h-6", card.status === 'suspended' ? "text-red-600" : "text-blue-600")} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{card.cardHolder}</p>
                    <p className="text-sm text-gray-500">{card.cardNumber} • {card.department}</p>
                  </div>
                </div>
                <span className={cn("px-2 py-1 rounded-full text-xs", statusConfig[card.status].color)}>
                  {statusConfig[card.status].label}
                </span>
              </div>

              {card.status === 'suspended' && (
                <div className="bg-red-100 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-800"><AlertCircle className="w-4 h-4 inline mr-1" />{card.suspendedReason}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Credit Limit</p>
                  <p className="font-semibold text-gray-900">${card.creditLimit.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Current Balance</p>
                  <p className="font-semibold text-gray-900">${card.currentBalance.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Available</p>
                  <p className={cn("font-semibold", card.availableCredit < card.creditLimit * 0.2 ? "text-red-600" : "text-green-600")}>
                    ${card.availableCredit.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4 text-sm">
                  {card.pendingReceipts > 0 && (
                    <span className="text-yellow-600 flex items-center gap-1">
                      <Receipt className="w-4 h-4" />{card.pendingReceipts} pending receipts
                    </span>
                  )}
                  {card.flaggedTransactions > 0 && (
                    <span className="text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />{card.flaggedTransactions} flagged
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {card.status === 'suspended' ? (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <Unlock className="w-4 h-4 mr-1" />Reactivate
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />View Details
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'transactions' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {['all', 'pending', 'flagged', 'approved'].map((f) => (
              <Button key={f} variant={txnFilter === f ? 'default' : 'outline'} size="sm" onClick={() => setTxnFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-sm text-gray-500">
                  <th className="p-4">Date</th>
                  <th className="p-4">Cardholder</th>
                  <th className="p-4">Merchant</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((txn) => (
                  <tr key={txn.id} className={cn("border-b hover:bg-gray-50", txn.flagged && "bg-red-50")}>
                    <td className="p-4 text-sm">{txn.date}</td>
                    <td className="p-4 text-sm">{txn.cardHolder}</td>
                    <td className="p-4">
                      <p className="text-sm font-medium">{txn.merchant}</p>
                      {txn.businessPurpose && <p className="text-xs text-gray-500">{txn.businessPurpose}</p>}
                    </td>
                    <td className="p-4">
                      <span className={cn("px-2 py-0.5 rounded text-xs", txn.category === 'Restricted' ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800")}>
                        {txn.category}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-right font-medium">${txn.amount.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={cn("px-2 py-0.5 rounded text-xs", txnStatusConfig[txn.status].color)}>
                        {txnStatusConfig[txn.status].label}
                      </span>
                      {txn.flagReason && <p className="text-xs text-red-600 mt-1">{txn.flagReason}</p>}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {txn.status === 'pending_receipt' && (
                          <Button size="sm" variant="outline"><Upload className="w-3 h-3 mr-1" />Upload</Button>
                        )}
                        {txn.flagged && (
                          <Button size="sm" variant="outline" className="text-red-600">Review</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === 'policies' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5" />Credit Card Safety & Best Practices
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• All transactions require valid business purpose documentation</li>
              <li>• Receipts must be uploaded within 48 hours of transaction</li>
              <li>• Personal use of corporate cards is strictly prohibited</li>
              <li>• Cards may be suspended automatically for policy violations</li>
              <li>• Monthly reconciliation required by the 5th of following month</li>
            </ul>
          </div>

          {safetyPolicies.map((policy) => (
            <div key={policy.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{policy.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{policy.description}</p>
                    {policy.threshold && (
                      <p className="text-sm text-gray-500 mt-2">Threshold: ${policy.threshold.toLocaleString()}</p>
                    )}
                    {policy.categories && (
                      <div className="flex gap-2 mt-2">
                        {policy.categories.map((cat, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-800">{cat}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs",
                  policy.enforcement === 'auto_suspend' ? "bg-red-100 text-red-800" :
                  policy.enforcement === 'block_without_approval' ? "bg-orange-100 text-orange-800" :
                  "bg-yellow-100 text-yellow-800"
                )}>
                  {policy.enforcement.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
