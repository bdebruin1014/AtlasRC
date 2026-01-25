import React, { useState, useMemo } from 'react';
import {
  Link2, Building, DollarSign, CheckCircle, XCircle, Clock,
  AlertTriangle, RefreshCw, Search, ArrowDownUp, Eye, Zap,
  Calendar, Shield, AlertCircle, Check, X, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const mockBankAccounts = [
  {
    id: 'BANK-001',
    bankName: 'Chase',
    accountName: 'Operating Account',
    accountNumber: '****4521',
    entity: 'Atlas Holdings LLC',
    currentBalance: 2450000.00,
    lastSync: '2024-01-30 14:32',
    status: 'connected',
    pendingTransactions: 12,
    unmatchedTransactions: 3
  },
  {
    id: 'BANK-002',
    bankName: 'Chase',
    accountNumber: '****7832',
    accountName: 'Payroll Account',
    entity: 'Atlas Holdings LLC',
    currentBalance: 185000.00,
    lastSync: '2024-01-30 14:32',
    status: 'connected',
    pendingTransactions: 5,
    unmatchedTransactions: 0
  },
  {
    id: 'BANK-003',
    bankName: 'Wells Fargo',
    accountNumber: '****9156',
    accountName: 'Security Deposits',
    entity: 'Riverside Plaza LLC',
    currentBalance: 428500.00,
    lastSync: '2024-01-30 08:15',
    status: 'connected',
    pendingTransactions: 8,
    unmatchedTransactions: 2
  },
  {
    id: 'BANK-004',
    bankName: 'Bank of America',
    accountNumber: '****2847',
    accountName: 'Construction Account',
    entity: 'Oak Street Partners LP',
    currentBalance: 1250000.00,
    lastSync: '2024-01-29 22:00',
    status: 'error',
    errorMessage: 'Authentication expired - please reconnect',
    pendingTransactions: 0,
    unmatchedTransactions: 0
  }
];

const mockTransactions = [
  { id: 'TXN-001', date: '2024-01-30', description: 'Wire Transfer - Metro Industrial', amount: -500000.00, type: 'debit', matched: true, matchedTo: 'JE-2024-0892', confidence: 100 },
  { id: 'TXN-002', date: '2024-01-30', description: 'ACH Credit - Riverside Rent Collection', amount: 125000.00, type: 'credit', matched: true, matchedTo: 'AR-2024-0445', confidence: 98 },
  { id: 'TXN-003', date: '2024-01-29', description: 'Check #4521 - ABC Contractors', amount: -45000.00, type: 'debit', matched: true, matchedTo: 'AP-2024-0312', confidence: 100 },
  { id: 'TXN-004', date: '2024-01-29', description: 'Wire Transfer - Unknown Sender', amount: 75000.00, type: 'credit', matched: false, suggestedMatch: null, confidence: 0 },
  { id: 'TXN-005', date: '2024-01-28', description: 'Service Charge', amount: -45.00, type: 'debit', matched: false, suggestedMatch: 'Create Bank Fee JE', confidence: 95 },
  { id: 'TXN-006', date: '2024-01-28', description: 'Interest Earned', amount: 1250.00, type: 'credit', matched: false, suggestedMatch: 'Create Interest Income JE', confidence: 95 }
];

const statusConfig = {
  connected: { label: 'Connected', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  syncing: { label: 'Syncing', color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
  error: { label: 'Error', color: 'bg-red-100 text-red-800', icon: AlertCircle },
  disconnected: { label: 'Disconnected', color: 'bg-gray-100 text-gray-800', icon: XCircle }
};

export default function BankFeedIntegrationPage() {
  const [selectedAccount, setSelectedAccount] = useState(mockBankAccounts[0]);
  const [showUnmatchedOnly, setShowUnmatchedOnly] = useState(false);

  const filteredTransactions = useMemo(() => {
    if (showUnmatchedOnly) return mockTransactions.filter(t => !t.matched);
    return mockTransactions;
  }, [showUnmatchedOnly]);

  const stats = useMemo(() => ({
    totalAccounts: mockBankAccounts.length,
    connected: mockBankAccounts.filter(a => a.status === 'connected').length,
    errors: mockBankAccounts.filter(a => a.status === 'error').length,
    totalBalance: mockBankAccounts.reduce((sum, a) => sum + a.currentBalance, 0),
    pendingTransactions: mockBankAccounts.reduce((sum, a) => sum + a.pendingTransactions, 0),
    unmatchedTransactions: mockBankAccounts.reduce((sum, a) => sum + a.unmatchedTransactions, 0)
  }), []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bank Feed Integration</h1>
          <p className="text-gray-600">Auto-import and match bank transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Link2 className="w-4 h-4 mr-2" />Connect New Account</Button>
          <Button className="bg-blue-600 hover:bg-blue-700"><RefreshCw className="w-4 h-4 mr-2" />Sync All</Button>
        </div>
      </div>

      {stats.errors > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <p className="font-semibold text-red-900">{stats.errors} Bank Connection(s) Need Attention</p>
              <p className="text-sm text-red-700">Please reconnect to continue receiving bank feeds.</p>
            </div>
          </div>
          <Button variant="outline" className="border-red-300 text-red-700">Fix Now</Button>
        </div>
      )}

      <div className="grid grid-cols-6 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Building className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAccounts}</p>
              <p className="text-sm text-gray-600">Bank Accounts</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><Link2 className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.connected}</p>
              <p className="text-sm text-gray-600">Connected</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><DollarSign className="w-5 h-5 text-purple-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${(stats.totalBalance / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-gray-600">Total Balance</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg"><Clock className="w-5 h-5 text-yellow-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingTransactions}</p>
              <p className="text-sm text-gray-600">Pending Review</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg"><AlertTriangle className="w-5 h-5 text-orange-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.unmatchedTransactions}</p>
              <p className="text-sm text-gray-600">Unmatched</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg"><AlertCircle className="w-5 h-5 text-red-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.errors}</p>
              <p className="text-sm text-gray-600">Errors</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1 space-y-2">
          <h3 className="font-semibold text-gray-900 mb-3">Bank Accounts</h3>
          {mockBankAccounts.map((account) => (
            <div
              key={account.id}
              onClick={() => setSelectedAccount(account)}
              className={cn(
                "bg-white rounded-lg border p-4 cursor-pointer hover:border-blue-300 transition-colors",
                selectedAccount?.id === account.id ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200",
                account.status === 'error' && "border-red-300 bg-red-50"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-900">{account.accountName}</p>
                  <p className="text-sm text-gray-500">{account.bankName} {account.accountNumber}</p>
                </div>
                <span className={cn("px-2 py-0.5 rounded text-xs", statusConfig[account.status].color)}>
                  {statusConfig[account.status].label}
                </span>
              </div>
              <p className="text-lg font-semibold text-gray-900">${account.currentBalance.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Last sync: {account.lastSync}</p>
              {account.unmatchedTransactions > 0 && (
                <p className="text-xs text-orange-600 mt-1">{account.unmatchedTransactions} unmatched</p>
              )}
            </div>
          ))}
        </div>

        <div className="col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Transactions - {selectedAccount?.accountName}</h3>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={showUnmatchedOnly} onChange={(e) => setShowUnmatchedOnly(e.target.checked)} className="rounded" />
                  Unmatched only
                </label>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Zap className="w-4 h-4 mr-1" />Auto-Match
                </Button>
              </div>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-sm text-gray-500">
                  <th className="p-4">Date</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4">Match Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((txn) => (
                  <tr key={txn.id} className={cn("border-b hover:bg-gray-50", !txn.matched && "bg-yellow-50")}>
                    <td className="p-4 text-sm">{txn.date}</td>
                    <td className="p-4 text-sm">{txn.description}</td>
                    <td className={cn("p-4 text-sm text-right font-medium", txn.amount < 0 ? "text-red-600" : "text-green-600")}>
                      {txn.amount < 0 ? '-' : '+'}${Math.abs(txn.amount).toLocaleString()}
                    </td>
                    <td className="p-4">
                      {txn.matched ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-700">{txn.matchedTo}</span>
                        </div>
                      ) : txn.suggestedMatch ? (
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-700">{txn.suggestedMatch} ({txn.confidence}%)</span>
                        </div>
                      ) : (
                        <span className="text-sm text-orange-600">Unmatched</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {!txn.matched && txn.suggestedMatch && (
                          <Button size="sm" variant="ghost" className="text-green-600"><Check className="w-4 h-4" /></Button>
                        )}
                        {!txn.matched && (
                          <Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
