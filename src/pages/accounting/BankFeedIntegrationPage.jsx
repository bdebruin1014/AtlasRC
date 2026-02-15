import React, { useState, useMemo, useEffect } from 'react';
import {
  Link2, Building, DollarSign, CheckCircle, XCircle, Clock,
  AlertTriangle, RefreshCw, Search, ArrowDownUp, Eye, Zap,
  Calendar, Shield, AlertCircle, Check, X, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getBankAccounts, getBankTransactions } from '@/services/bankAccountsService';

const statusConfig = {
  connected: { label: 'Connected', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  syncing: { label: 'Syncing', color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
  error: { label: 'Error', color: 'bg-red-100 text-red-800', icon: AlertCircle },
  disconnected: { label: 'Disconnected', color: 'bg-gray-100 text-gray-800', icon: XCircle }
};

export default function BankFeedIntegrationPage() {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showUnmatchedOnly, setShowUnmatchedOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAccounts() {
      try {
        // Fetch all bank accounts across entities for the integration overview
        const data = await getBankAccounts(undefined, { includeInactive: false });
        if (data?.length) {
          const mapped = data.map(a => ({
            id: a.id,
            bankName: a.bank_name || a.plaid_connection?.institution_name || 'Bank',
            accountName: a.account_name || a.name || 'Account',
            accountNumber: `****${a.account_number_last4 || '0000'}`,
            entity: a.entity_name || '',
            currentBalance: a.current_balance || 0,
            lastSync: a.last_synced_at || 'Never',
            status: a.plaid_connection?.status || 'connected',
            pendingTransactions: 0,
            unmatchedTransactions: 0,
          }));
          setBankAccounts(mapped);
          setSelectedAccount(mapped[0]);
        }
      } catch {
        // No accounts available
      } finally {
        setLoading(false);
      }
    }
    loadAccounts();
  }, []);

  useEffect(() => {
    async function loadTransactions() {
      if (!selectedAccount?.id) return;
      try {
        const data = await getBankTransactions(selectedAccount.id);
        if (data?.length) {
          setTransactions(data.map(t => ({
            id: t.id,
            date: t.date || t.transaction_date,
            description: t.description || t.name || '',
            amount: t.amount || 0,
            type: t.amount < 0 ? 'debit' : 'credit',
            matched: t.match_status === 'matched',
            matchedTo: t.matched_transaction_id || null,
            suggestedMatch: null,
            confidence: t.match_status === 'matched' ? 100 : 0,
          })));
        } else {
          setTransactions([]);
        }
      } catch {
        setTransactions([]);
      }
    }
    loadTransactions();
  }, [selectedAccount?.id]);

  const filteredTransactions = useMemo(() => {
    if (showUnmatchedOnly) return transactions.filter(t => !t.matched);
    return transactions;
  }, [showUnmatchedOnly, transactions]);

  const stats = useMemo(() => ({
    totalAccounts: bankAccounts.length,
    connected: bankAccounts.filter(a => a.status === 'connected').length,
    errors: bankAccounts.filter(a => a.status === 'error').length,
    totalBalance: bankAccounts.reduce((sum, a) => sum + a.currentBalance, 0),
    pendingTransactions: bankAccounts.reduce((sum, a) => sum + a.pendingTransactions, 0),
    unmatchedTransactions: bankAccounts.reduce((sum, a) => sum + a.unmatchedTransactions, 0)
  }), [bankAccounts]);

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
          {bankAccounts.map((account) => (
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
