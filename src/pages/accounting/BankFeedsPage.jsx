// src/pages/accounting/BankFeedsPage.jsx
// Bank Feeds with Plaid integration

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  CreditCard, RefreshCw, Link2, Unlink, Check, X, AlertTriangle,
  Building2, DollarSign, ArrowUpRight, ArrowDownRight, Filter, Search,
  CheckCircle2, XCircle, MoreHorizontal, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  getBankingDashboard,
  getBankTransactions,
  matchTransactionToBill,
  matchTransactionToInvoice,
  excludeTransaction,
  createTransactionFromBank,
  refreshPlaidConnection,
  applyMatchingRules,
  PLAID_STATUS,
  MATCH_STATUS,
} from '@/services/plaidService';

const BankFeedsPage = () => {
  const { entityId } = useParams();
  const [dashboard, setDashboard] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState('unmatched');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDashboard();
  }, [entityId]);

  useEffect(() => {
    if (selectedAccount) {
      loadTransactions();
    }
  }, [selectedAccount, filter]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await getBankingDashboard(entityId);
      setDashboard(data);
      if (data.accounts?.length > 0) {
        setSelectedAccount(data.accounts[0]);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    if (!selectedAccount) return;
    try {
      const data = await getBankTransactions(selectedAccount.id, {
        matchStatus: filter === 'all' ? null : filter,
      });
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const handleSync = async (connectionId) => {
    try {
      setSyncing(true);
      await refreshPlaidConnection(connectionId);
      await loadDashboard();
      await loadTransactions();
    } catch (error) {
      console.error('Error syncing:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleAutoMatch = async () => {
    try {
      const result = await applyMatchingRules(entityId);
      alert(`Matched ${result.matched} of ${result.total} transactions`);
      await loadTransactions();
    } catch (error) {
      console.error('Error auto-matching:', error);
    }
  };

  const handleExclude = async (transactionId) => {
    try {
      await excludeTransaction(transactionId, 'Manual exclusion');
      await loadTransactions();
    } catch (error) {
      console.error('Error excluding:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const config = {
      [PLAID_STATUS.CONNECTED]: { color: 'bg-green-100 text-green-800', label: 'Connected' },
      [PLAID_STATUS.ERROR]: { color: 'bg-red-100 text-red-800', label: 'Error' },
      [PLAID_STATUS.REQUIRES_REAUTH]: { color: 'bg-yellow-100 text-yellow-800', label: 'Needs Login' },
      [PLAID_STATUS.DISCONNECTED]: { color: 'bg-gray-100 text-gray-800', label: 'Disconnected' },
    };
    const c = config[status] || config[PLAID_STATUS.DISCONNECTED];
    return <Badge className={c.color}>{c.label}</Badge>;
  };

  const filteredTransactions = transactions.filter(txn =>
    txn.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    txn.merchant_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-blue-600" />
            Bank Feeds
          </h1>
          <p className="text-gray-500 mt-1">Connect and sync bank accounts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAutoMatch}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Auto-Match
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Connect Bank
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(dashboard?.totalBalance)}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Connected Accounts</p>
                <p className="text-2xl font-bold">{dashboard?.accounts?.length || 0}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Link2 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Unmatched</p>
                <p className="text-2xl font-bold text-amber-600">{dashboard?.unmatchedCount || 0}</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Needs Attention</p>
                <p className="text-2xl font-bold text-red-600">{dashboard?.errorConnections || 0}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connected Banks */}
      {dashboard?.connections?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Connected Banks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dashboard.connections.map((conn) => (
                <div
                  key={conn.id}
                  className="p-4 border rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-gray-600" />
                      <span className="font-medium">{conn.institution_name}</span>
                    </div>
                    {getStatusBadge(conn.status)}
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    {conn.bank_accounts?.length || 0} account(s)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSync(conn.id)}
                      disabled={syncing}
                    >
                      <RefreshCw className={cn("w-3 h-3 mr-1", syncing && "animate-spin")} />
                      Sync
                    </Button>
                    {conn.status === PLAID_STATUS.REQUIRES_REAUTH && (
                      <Button size="sm" variant="outline">
                        <Link2 className="w-3 h-3 mr-1" />
                        Reconnect
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Tabs */}
      {dashboard?.accounts?.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dashboard.accounts.map((account) => (
            <button
              key={account.id}
              onClick={() => setSelectedAccount(account)}
              className={cn(
                "px-4 py-2 rounded-lg border whitespace-nowrap transition-colors",
                selectedAccount?.id === account.id
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "bg-white hover:bg-gray-50"
              )}
            >
              <span className="font-medium">{account.name}</span>
              <span className="text-gray-500 ml-2">****{account.mask}</span>
              <span className="ml-2 font-semibold">{formatCurrency(account.current_balance)}</span>
            </button>
          ))}
        </div>
      )}

      {/* Transactions */}
      {selectedAccount && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Transactions - {selectedAccount.name}
              </CardTitle>
              <div className="flex gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-1.5 border rounded-lg text-sm"
                >
                  <option value="unmatched">Unmatched</option>
                  <option value="matched">Matched</option>
                  <option value="excluded">Excluded</option>
                  <option value="all">All</option>
                </select>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 border rounded-lg text-sm w-48"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Description</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Amount</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                  <th className="w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{formatDate(txn.date)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{txn.merchant_name || txn.name}</p>
                      <p className="text-sm text-gray-500 truncate max-w-md">{txn.description}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn(
                        "font-medium flex items-center justify-end gap-1",
                        txn.amount < 0 ? "text-red-600" : "text-green-600"
                      )}>
                        {txn.amount < 0 ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                        {formatCurrency(Math.abs(txn.amount))}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={cn(
                        txn.match_status === MATCH_STATUS.MATCHED && "bg-green-100 text-green-800",
                        txn.match_status === MATCH_STATUS.UNMATCHED && "bg-yellow-100 text-yellow-800",
                        txn.match_status === MATCH_STATUS.EXCLUDED && "bg-gray-100 text-gray-800",
                      )}>
                        {txn.match_status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Check className="w-4 h-4 mr-2" />
                            Match to Bill
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Check className="w-4 h-4 mr-2" />
                            Match to Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Expense
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExclude(txn.id)}>
                            <X className="w-4 h-4 mr-2" />
                            Exclude
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                      <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No transactions found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Empty State - No Connections */}
      {!dashboard?.connections?.length && (
        <Card className="py-12">
          <CardContent className="text-center">
            <Link2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No Bank Accounts Connected</h3>
            <p className="text-gray-500 mb-4">
              Connect your bank accounts to automatically import transactions
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Connect Your First Bank
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BankFeedsPage;
