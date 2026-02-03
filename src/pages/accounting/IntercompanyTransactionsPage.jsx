// src/pages/accounting/IntercompanyTransactionsPage.jsx
// Intercompany Transactions Management

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeftRight, Building2, DollarSign, Calendar, Search,
  CheckCircle, Clock, AlertTriangle, Plus, FileText, RefreshCw,
  Eye, Link2, MoreHorizontal, Loader2, CheckCircle2, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import IntercompanyTransferModal from '@/components/accounting/IntercompanyTransferModal';

// Demo data for development
const demoTransactions = [
  {
    id: 'IC-2024-0089',
    transfer_date: '2025-01-20',
    from_entity_id: 'E-001',
    from_entity_name: 'Atlas Holdings LLC',
    to_entity_id: 'E-002',
    to_entity_name: 'Riverside Plaza LLC',
    transfer_type: 'loan_advance',
    description: 'Construction loan draw #5',
    amount: 500000.00,
    status: 'posted',
    reference_number: 'DRAW-RSP-005',
    matched: true,
  },
  {
    id: 'IC-2024-0088',
    transfer_date: '2025-01-18',
    from_entity_id: 'E-005',
    from_entity_name: 'Atlas Management Co.',
    to_entity_id: 'E-002',
    to_entity_name: 'Riverside Plaza LLC',
    transfer_type: 'management_fee',
    description: 'January 2025 property management fee',
    amount: 15000.00,
    status: 'posted',
    reference_number: 'MGT-JAN-RSP',
    matched: true,
  },
  {
    id: 'IC-2024-0087',
    transfer_date: '2025-01-18',
    from_entity_id: 'E-005',
    from_entity_name: 'Atlas Management Co.',
    to_entity_id: 'E-003',
    to_entity_name: 'Downtown Tower LLC',
    transfer_type: 'management_fee',
    description: 'January 2025 property management fee',
    amount: 22500.00,
    status: 'posted',
    reference_number: 'MGT-JAN-DWT',
    matched: true,
  },
  {
    id: 'IC-2024-0086',
    transfer_date: '2025-01-15',
    from_entity_id: 'E-003',
    from_entity_name: 'Downtown Tower LLC',
    to_entity_id: 'E-001',
    to_entity_name: 'Atlas Holdings LLC',
    transfer_type: 'distribution',
    description: 'Q4 2024 cash distribution',
    amount: 250000.00,
    status: 'posted',
    reference_number: 'DIST-Q4-DWT',
    matched: true,
  },
  {
    id: 'IC-2024-0085',
    transfer_date: '2025-01-12',
    from_entity_id: 'E-001',
    from_entity_name: 'Atlas Holdings LLC',
    to_entity_id: 'E-004',
    to_entity_name: 'Oak Street Partners LP',
    transfer_type: 'capital_contribution',
    description: 'Acquisition equity contribution',
    amount: 2500000.00,
    status: 'pending',
    reference_number: 'CAP-OAK-001',
    matched: false,
  },
  {
    id: 'IC-2024-0084',
    transfer_date: '2025-01-10',
    from_entity_id: 'E-002',
    from_entity_name: 'Riverside Plaza LLC',
    to_entity_id: 'E-001',
    to_entity_name: 'Atlas Holdings LLC',
    transfer_type: 'interest_payment',
    description: 'December 2024 intercompany loan interest',
    amount: 18750.00,
    status: 'posted',
    reference_number: 'INT-DEC-RSP',
    matched: true,
  },
];

const demoBalances = [
  { from_entity: 'Atlas Holdings LLC', to_entity: 'Riverside Plaza LLC', receivable: 2850000, payable: 0 },
  { from_entity: 'Atlas Holdings LLC', to_entity: 'Downtown Tower LLC', receivable: 0, payable: 450000 },
  { from_entity: 'Atlas Holdings LLC', to_entity: 'Oak Street Partners LP', receivable: 2500000, payable: 0 },
  { from_entity: 'Atlas Management Co.', to_entity: 'Riverside Plaza LLC', receivable: 45000, payable: 0 },
  { from_entity: 'Atlas Management Co.', to_entity: 'Downtown Tower LLC', receivable: 67500, payable: 0 },
];

const typeConfig = {
  loan_advance: { label: 'Loan Advance', color: 'bg-blue-100 text-blue-800' },
  loan_repayment: { label: 'Loan Repayment', color: 'bg-blue-100 text-blue-800' },
  interest_payment: { label: 'Interest Payment', color: 'bg-yellow-100 text-yellow-800' },
  management_fee: { label: 'Management Fee', color: 'bg-purple-100 text-purple-800' },
  distribution: { label: 'Distribution', color: 'bg-green-100 text-green-800' },
  capital_contribution: { label: 'Capital Contribution', color: 'bg-orange-100 text-orange-800' },
  reimbursement: { label: 'Reimbursement', color: 'bg-gray-100 text-gray-800' },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-800' },
};

export default function IntercompanyTransactionsPage() {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const context = useOutletContext();
  const entity = context?.entity;
  const basePath = `/accounting/entities/${entityId}`;

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeView, setActiveView] = useState('transactions');

  // Fetch intercompany transactions
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['intercompany-transactions', entityId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('intercompany_transactions')
          .select(`
            *,
            from_entity:entities!from_entity_id(name),
            to_entity:entities!to_entity_id(name)
          `)
          .or(`from_entity_id.eq.${entityId},to_entity_id.eq.${entityId}`)
          .order('transfer_date', { ascending: false });

        if (error) throw error;

        return (data || []).map(t => ({
          ...t,
          from_entity_name: t.from_entity?.name || t.from_entity_name,
          to_entity_name: t.to_entity?.name || t.to_entity_name,
        }));
      } catch (err) {
        console.error('Error fetching IC transactions:', err);
        return demoTransactions;
      }
    },
  });

  // Fetch IC balances
  const { data: balances = [] } = useQuery({
    queryKey: ['intercompany-balances', entityId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('intercompany_balances')
          .select('*')
          .or(`from_entity_id.eq.${entityId},to_entity_id.eq.${entityId}`);

        if (error) throw error;
        return data || demoBalances;
      } catch (err) {
        return demoBalances;
      }
    },
  });

  // Post transaction mutation
  const postMutation = useMutation({
    mutationFn: async (txnId) => {
      const { error } = await supabase
        .from('intercompany_transactions')
        .update({ status: 'posted', matched: true })
        .eq('id', txnId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['intercompany-transactions']);
    },
  });

  // Run matching mutation
  const matchMutation = useMutation({
    mutationFn: async () => {
      // Simulate matching process
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { matched: 3, unmatched: 1 };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['intercompany-transactions']);
    },
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(txn => {
      const matchesSearch = !searchTerm ||
        txn.from_entity_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.to_entity_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || txn.status === statusFilter;
      const matchesType = typeFilter === 'all' || txn.transfer_type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [transactions, searchTerm, statusFilter, typeFilter]);

  // Calculate stats
  const stats = useMemo(() => ({
    totalTransactions: transactions.length,
    totalVolume: transactions.reduce((sum, t) => sum + (t.amount || 0), 0),
    pending: transactions.filter(t => t.status === 'pending').length,
    unmatched: transactions.filter(t => !t.matched).length,
  }), [transactions]);

  const getStatusBadge = (status, matched) => {
    if (status === 'posted') {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Posted
        </Badge>
      );
    }
    if (status === 'pending') {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Intercompany Transactions</h1>
          <p className="text-muted-foreground">Transfers between related entities</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => matchMutation.mutate()}
            disabled={matchMutation.isPending}
          >
            {matchMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Run Matching
          </Button>
          <Button onClick={() => setShowTransferModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Transfer
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{stats.totalTransactions}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This period
                </p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ArrowLeftRight className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalVolume)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  All transfers
                </p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Awaiting posting
                </p>
              </div>
              <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unmatched</p>
                <p className="text-2xl font-bold text-red-600">{stats.unmatched}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Need reconciliation
                </p>
              </div>
              <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unmatched Alert */}
      {stats.unmatched > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-amber-800">
              {stats.unmatched} unmatched transaction{stats.unmatched > 1 ? 's' : ''}
            </p>
            <p className="text-sm text-amber-700">
              Run matching to automatically reconcile intercompany balances
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-amber-300 text-amber-700"
            onClick={() => matchMutation.mutate()}
            disabled={matchMutation.isPending}
          >
            Run Matching
          </Button>
        </div>
      )}

      {/* View Toggle and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex gap-2">
          <Button
            variant={activeView === 'transactions' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('transactions')}
          >
            Transactions
          </Button>
          <Button
            variant={activeView === 'balances' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('balances')}
          >
            IC Balances
          </Button>
        </div>

        {activeView === 'transactions' && (
          <>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="posted">Posted</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(typeConfig).map(([value, { label }]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
      </div>

      {/* Transactions View */}
      {activeView === 'transactions' && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">ID / Date</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">From</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground"></th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">To</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <p className="font-medium font-mono text-sm">{txn.id}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(txn.transfer_date)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{txn.from_entity_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ArrowLeftRight className="h-4 w-4 text-muted-foreground mx-auto" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{txn.to_entity_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={typeConfig[txn.transfer_type]?.color || 'bg-gray-100 text-gray-800'}>
                        {typeConfig[txn.transfer_type]?.label || txn.transfer_type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(txn.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(txn.status, txn.matched)}
                        {txn.matched && <Link2 className="h-4 w-4 text-green-600" />}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`${basePath}/intercompany/${txn.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {txn.status === 'pending' && (
                            <>
                              <DropdownMenuItem onClick={() => postMutation.mutate(txn.id)}>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Post Transaction
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                      <ArrowLeftRight className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                      <p className="font-medium">No transactions found</p>
                      <p className="text-sm">Create a new intercompany transfer</p>
                      <Button className="mt-4" onClick={() => setShowTransferModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Transfer
                      </Button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Balances View */}
      {activeView === 'balances' && (
        <Card>
          <CardContent className="p-0">
            <div className="px-4 py-3 bg-muted/50 border-b">
              <h3 className="font-medium">Intercompany Balance Summary</h3>
            </div>
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">From Entity</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">To Entity</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">IC Receivable</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">IC Payable</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Net Position</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {balances.map((bal, idx) => {
                  const netPosition = (bal.receivable || 0) - (bal.payable || 0);
                  return (
                    <tr key={idx} className="hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{bal.from_entity}</td>
                      <td className="px-4 py-3">{bal.to_entity}</td>
                      <td className="px-4 py-3 text-right text-green-600">
                        {formatCurrency(bal.receivable)}
                      </td>
                      <td className="px-4 py-3 text-right text-red-600">
                        {formatCurrency(bal.payable)}
                      </td>
                      <td className={cn(
                        "px-4 py-3 text-right font-semibold",
                        netPosition >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {formatCurrency(netPosition)}
                      </td>
                    </tr>
                  );
                })}
                {balances.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                      <Building2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                      <p className="font-medium">No intercompany balances</p>
                      <p className="text-sm">Balances will appear after transfers are posted</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Intercompany Transfer Modal */}
      <IntercompanyTransferModal
        open={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        entityId={entityId}
      />
    </div>
  );
}
