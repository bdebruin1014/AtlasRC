import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreditCard, RefreshCw, Link2, Check, X, AlertTriangle,
  Building2, DollarSign, ArrowUpRight, ArrowDownRight, Search,
  CheckCircle2, XCircle, MoreHorizontal, Plus, Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import ImportTransactionsModal from '@/components/accounting/ImportTransactionsModal';

// Demo data
const demoDashboard = {
  totalBalance: 485000,
  accounts: [
    { id: 'acc-1', name: 'Operating Account', mask: '4521', current_balance: 385000 },
    { id: 'acc-2', name: 'Payroll Account', mask: '7832', current_balance: 100000 },
  ],
  connections: [
    { id: 'conn-1', institution_name: 'Chase Bank', status: 'connected', bank_accounts: [{}, {}] },
  ],
  unmatchedCount: 12,
  errorConnections: 0,
};

const demoTransactions = [
  { id: 1, date: '2024-12-28', merchant_name: 'ABC Investments LLC', description: 'Management fee payment', amount: 15000, match_status: 'unmatched' },
  { id: 2, date: '2024-12-27', merchant_name: 'Smith Framing LLC', description: 'Invoice #1042 payment', amount: -8500, match_status: 'matched' },
  { id: 3, date: '2024-12-26', merchant_name: 'Duke Energy', description: 'Utility payment - December', amount: -450, match_status: 'unmatched' },
  { id: 4, date: '2024-12-25', merchant_name: 'Home Depot', description: 'Building supplies', amount: -1250, match_status: 'unmatched' },
  { id: 5, date: '2024-12-24', merchant_name: 'Insurance Co', description: 'Q1 premium payment', amount: -3200, match_status: 'matched' },
  { id: 6, date: '2024-12-23', merchant_name: 'Tenant - Unit 101', description: 'Rent payment January', amount: 2500, match_status: 'unmatched' },
];

const MATCH_STATUS = {
  MATCHED: 'matched',
  UNMATCHED: 'unmatched',
  EXCLUDED: 'excluded',
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount || 0);

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function BankFeedsPage() {
  const { entityId } = useParams();
  const context = useOutletContext();
  const entity = context?.entity;
  const queryClient = useQueryClient();

  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [filter, setFilter] = useState('unmatched');
  const [searchTerm, setSearchTerm] = useState('');
  const [syncing, setSyncing] = useState(false);

  // Fetch dashboard data
  const { data: dashboard = demoDashboard, isLoading } = useQuery({
    queryKey: ['bank-feeds-dashboard', entityId],
    queryFn: async () => {
      try {
        // Fetch bank accounts
        const { data: accounts } = await supabase
          .from('bank_accounts')
          .select('*')
          .eq('entity_id', entityId);

        // Fetch unmatched count
        const { count: unmatchedCount } = await supabase
          .from('bank_transactions')
          .select('*', { count: 'exact', head: true })
          .eq('entity_id', entityId)
          .eq('match_status', 'unmatched');

        if (accounts?.length) {
          const totalBalance = accounts.reduce((sum, a) => sum + (a.current_balance || 0), 0);
          return {
            totalBalance,
            accounts: accounts.map(a => ({
              id: a.id,
              name: a.account_name,
              mask: a.account_number_last4 || '****',
              current_balance: a.current_balance,
            })),
            connections: [],
            unmatchedCount: unmatchedCount || 0,
            errorConnections: 0,
          };
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      }
      return demoDashboard;
    },
    enabled: !!entityId,
  });

  // Fetch transactions
  const { data: transactions = demoTransactions } = useQuery({
    queryKey: ['bank-transactions', entityId, selectedAccount?.id, filter],
    queryFn: async () => {
      try {
        let query = supabase
          .from('bank_transactions')
          .select('*')
          .eq('entity_id', entityId)
          .order('date', { ascending: false });

        if (selectedAccount?.id) {
          query = query.eq('bank_account_id', selectedAccount.id);
        }
        if (filter !== 'all') {
          query = query.eq('match_status', filter);
        }

        const { data } = await query.limit(50);
        if (data?.length) return data;
      } catch (err) {
        console.error('Error fetching transactions:', err);
      }
      return demoTransactions.filter(t => filter === 'all' || t.match_status === filter);
    },
    enabled: !!entityId,
  });

  useEffect(() => {
    if (dashboard?.accounts?.length > 0 && !selectedAccount) {
      setSelectedAccount(dashboard.accounts[0]);
    }
  }, [dashboard, selectedAccount]);

  const handleSyncAll = async () => {
    setSyncing(true);
    // In production, this would trigger Plaid sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    queryClient.invalidateQueries(['bank-feeds-dashboard', entityId]);
    queryClient.invalidateQueries(['bank-transactions', entityId]);
    setSyncing(false);
  };

  const excludeMutation = useMutation({
    mutationFn: async (transactionId) => {
      const { error } = await supabase
        .from('bank_transactions')
        .update({ match_status: 'excluded' })
        .eq('id', transactionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bank-transactions', entityId]);
      queryClient.invalidateQueries(['bank-feeds-dashboard', entityId]);
    },
  });

  const filteredTransactions = transactions.filter(txn =>
    txn.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    txn.merchant_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const config = {
      connected: { color: 'bg-green-100 text-green-800', label: 'Connected' },
      error: { color: 'bg-red-100 text-red-800', label: 'Error' },
      requires_reauth: { color: 'bg-yellow-100 text-yellow-800', label: 'Needs Login' },
      disconnected: { color: 'bg-gray-100 text-gray-800', label: 'Disconnected' },
    };
    const c = config[status] || config.disconnected;
    return <Badge className={c.color}>{c.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bank Feeds</h1>
          <p className="text-muted-foreground">
            Review and categorize transactions for {entity?.name || entity?.short_name || 'this entity'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSyncAll} disabled={syncing}>
            <RefreshCw className={cn("h-4 w-4 mr-2", syncing && "animate-spin")} />
            Sync All
          </Button>
          <Button onClick={() => setShowImportModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(dashboard?.totalBalance)}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Connected Accounts</p>
                <p className="text-2xl font-bold">{dashboard?.accounts?.length || 0}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Link2 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unmatched</p>
                <p className="text-2xl font-bold text-amber-600">{dashboard?.unmatchedCount || 0}</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Needs Attention</p>
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
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">{conn.institution_name}</span>
                    </div>
                    {getStatusBadge(conn.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {conn.bank_accounts?.length || 0} account(s)
                  </p>
                  <Button size="sm" variant="outline" disabled={syncing}>
                    <RefreshCw className={cn("w-3 h-3 mr-1", syncing && "animate-spin")} />
                    Sync
                  </Button>
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
              <span className="text-muted-foreground ml-2">****{account.mask}</span>
              <span className="ml-2 font-semibold">{formatCurrency(account.current_balance)}</span>
            </button>
          ))}
        </div>
      )}

      {/* Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Transactions {selectedAccount && `- ${selectedAccount.name}`}
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
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-48"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-muted border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Description</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredTransactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm">{formatDate(txn.date || txn.transaction_date)}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{txn.merchant_name || txn.name || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-md">{txn.description}</p>
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
                        <DropdownMenuItem onClick={() => excludeMutation.mutate(txn.id)}>
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
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No transactions found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Empty State - No Accounts */}
      {!dashboard?.accounts?.length && (
        <Card className="py-12">
          <CardContent className="text-center">
            <Link2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="text-lg font-medium mb-2">No Bank Accounts Connected</h3>
            <p className="text-muted-foreground mb-4">
              Connect your bank accounts to automatically import transactions
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Connect Your First Bank
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Import Modal */}
      <ImportTransactionsModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        entityId={entityId}
        bankAccountId={selectedAccount?.id}
      />
    </div>
  );
}
