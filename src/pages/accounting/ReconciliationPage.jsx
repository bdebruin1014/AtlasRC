import React, { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Plus, CheckCircle, AlertTriangle, Clock, Calendar, DollarSign,
  Wallet, MoreHorizontal, Eye, FileText, Download
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
import { supabase } from '@/lib/supabase';
import SelectAccountModal from '@/components/accounting/SelectAccountModal';

// Demo reconciliation history for fallback
const demoReconciliations = [
  { id: 'rec-1', account_name: 'Operating Account', bank_name: 'Chase Bank', statement_date: '2024-12-31', statement_balance: 485000, reconciled_at: '2025-01-05', reconciled_by: 'John Smith', status: 'completed', difference: 0 },
  { id: 'rec-2', account_name: 'Payroll Account', bank_name: 'Chase Bank', statement_date: '2024-12-31', statement_balance: 125000, reconciled_at: '2025-01-04', reconciled_by: 'Sarah Johnson', status: 'completed', difference: 0 },
  { id: 'rec-3', account_name: 'Construction Account', bank_name: 'First National', statement_date: '2024-12-31', statement_balance: 1850000, reconciled_at: null, reconciled_by: null, status: 'in_progress', difference: 2500 },
  { id: 'rec-4', account_name: 'Operating Account', bank_name: 'Chase Bank', statement_date: '2024-11-30', statement_balance: 412000, reconciled_at: '2024-12-05', reconciled_by: 'John Smith', status: 'completed', difference: 0 },
  { id: 'rec-5', account_name: 'Payroll Account', bank_name: 'Chase Bank', statement_date: '2024-11-30', statement_balance: 98000, reconciled_at: '2024-12-03', reconciled_by: 'Sarah Johnson', status: 'completed', difference: 0 },
  { id: 'rec-6', account_name: 'Operating Account', bank_name: 'Chase Bank', statement_date: '2024-10-31', statement_balance: 385000, reconciled_at: '2024-11-05', reconciled_by: 'Mike Roberts', status: 'completed', difference: 0 },
];

// Demo accounts needing reconciliation
const demoAccountsNeedingReconciliation = [
  { id: 'acc-1', account_name: 'Construction Account', bank_name: 'First National', last_reconciled: '2024-11-30', current_balance: 1850000, unreconciled_count: 24 },
  { id: 'acc-2', account_name: 'Savings Reserve', bank_name: 'Bank of America', last_reconciled: '2024-11-15', current_balance: 250000, unreconciled_count: 8 },
];

const STATUS_CONFIG = {
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: Clock },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
};

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const fetchReconciliations = async (entityId) => {
  try {
    const { data, error } = await supabase
      .from('reconciliations')
      .select('*')
      .eq('entity_id', entityId)
      .order('statement_date', { ascending: false })
      .limit(50);

    if (data && !error) return data;
  } catch (err) {
    console.error('Error fetching reconciliations:', err);
  }
  return demoReconciliations;
};

export default function ReconciliationPage() {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const context = useOutletContext();
  const entity = context?.entity;

  const [showReconcileModal, setShowReconcileModal] = useState(false);

  const basePath = `/accounting/entities/${entityId}`;

  const { data: reconciliations = [], isLoading } = useQuery({
    queryKey: ['reconciliations', entityId],
    queryFn: () => fetchReconciliations(entityId),
    enabled: !!entityId,
  });

  const stats = {
    total: reconciliations.length,
    completed: reconciliations.filter(r => r.status === 'completed').length,
    inProgress: reconciliations.filter(r => r.status === 'in_progress').length,
    needsAttention: demoAccountsNeedingReconciliation.length,
  };

  const handleAccountSelect = (accountId) => {
    navigate(`${basePath}/bank-accounts/${accountId}/reconcile`);
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reconciliation</h1>
          <p className="text-muted-foreground">
            Bank account reconciliation history for {entity?.name || entity?.short_name || 'this entity'}
          </p>
        </div>
        <Button onClick={() => setShowReconcileModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Reconciliation
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reconciliations</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Needs Attention</p>
                <p className="text-2xl font-bold text-amber-600">{stats.needsAttention}</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts Needing Reconciliation */}
      {demoAccountsNeedingReconciliation.length > 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
              Accounts Needing Reconciliation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {demoAccountsNeedingReconciliation.map(account => (
                <div
                  key={account.id}
                  className="bg-white border rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Wallet className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium">{account.account_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {account.bank_name} • Last reconciled: {formatDate(account.last_reconciled)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(account.current_balance)}</p>
                    <p className="text-xs text-amber-600">{account.unreconciled_count} unreconciled items</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reconciliation History */}
      <Card>
        <CardHeader>
          <CardTitle>Reconciliation History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Account</th>
                  <th className="text-left px-4 py-3 font-medium">Statement Date</th>
                  <th className="text-right px-4 py-3 font-medium">Statement Balance</th>
                  <th className="text-left px-4 py-3 font-medium">Reconciled</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reconciliations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No reconciliations yet</p>
                      <p className="text-sm">Start a new reconciliation to get started</p>
                    </td>
                  </tr>
                ) : (
                  reconciliations.map((rec) => {
                    const statusConfig = STATUS_CONFIG[rec.status] || STATUS_CONFIG.pending;
                    const StatusIcon = statusConfig.icon;

                    return (
                      <tr key={rec.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{rec.account_name}</p>
                            <p className="text-xs text-muted-foreground">{rec.bank_name}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {formatDate(rec.statement_date)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(rec.statement_balance)}
                        </td>
                        <td className="px-4 py-3">
                          {rec.reconciled_at ? (
                            <div>
                              <p className="text-sm">{formatDate(rec.reconciled_at)}</p>
                              <p className="text-xs text-muted-foreground">by {rec.reconciled_by}</p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={statusConfig.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                          {rec.difference !== 0 && rec.status !== 'completed' && (
                            <p className="text-xs text-red-600 mt-1">
                              Difference: {formatCurrency(rec.difference)}
                            </p>
                          )}
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
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {rec.status === 'in_progress' && (
                                <DropdownMenuItem>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Continue
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Export Report
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Select Account Modal */}
      <SelectAccountModal
        open={showReconcileModal}
        onClose={() => setShowReconcileModal(false)}
        onSelect={handleAccountSelect}
        entityId={entityId}
        title="Start Reconciliation"
        description="Select a bank account to reconcile"
      />
    </div>
  );
}
