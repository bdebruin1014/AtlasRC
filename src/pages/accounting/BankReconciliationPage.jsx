import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle, AlertCircle, ArrowRight, Calendar, DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import * as reconciliationService from '@/services/reconciliationService';
import * as bankService from '@/services/bankAccountsService';

export default function BankReconciliationPage() {
  const { entityId, bankAccountId, reconciliationId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form state for new reconciliation
  const [formData, setFormData] = useState({
    statementDate: new Date().toISOString().split('T')[0],
    statementEndingBalance: '',
    periodStartDate: '',
    periodEndDate: ''
  });

  const { data: bankAccount } = useQuery({
    queryKey: ['bank-account', bankAccountId],
    queryFn: () => bankService.getBankAccount(bankAccountId)
  });

  const { data: lastReconciliation } = useQuery({
    queryKey: ['last-reconciliation', bankAccountId],
    queryFn: () => reconciliationService.getLastReconciliation(bankAccountId)
  });

  const { data: reconciliation, isLoading: loadingRecon } = useQuery({
    queryKey: ['reconciliation', reconciliationId],
    queryFn: () => reconciliationService.getReconciliation(reconciliationId),
    enabled: !!reconciliationId
  });

  const startMutation = useMutation({
    mutationFn: (data) => reconciliationService.startReconciliation(data),
    onSuccess: (data) => {
      navigate(`/accounting/entities/${entityId}/bank-accounts/${bankAccountId}/reconcile/${data.id}`);
    }
  });

  const toggleClearedMutation = useMutation({
    mutationFn: ({ transactionId, isCleared }) =>
      reconciliationService.toggleTransactionCleared(reconciliationId, transactionId, isCleared),
    onSuccess: () => {
      queryClient.invalidateQueries(['reconciliation', reconciliationId]);
    }
  });

  const completeMutation = useMutation({
    mutationFn: () => reconciliationService.completeReconciliation(reconciliationId, 'current-user-id'),
    onSuccess: () => {
      navigate(`/accounting/entities/${entityId}/bank-accounts/${bankAccountId}`);
    }
  });

  const handleStartReconciliation = () => {
    startMutation.mutate({
      bankAccountId,
      entityId,
      statementDate: formData.statementDate,
      statementEndingBalance: parseFloat(formData.statementEndingBalance),
      periodStartDate: formData.periodStartDate,
      periodEndDate: formData.periodEndDate
    });
  };

  // Calculate summary
  const summary = useMemo(() => {
    if (!reconciliation) return null;

    const items = reconciliation.items || [];
    const clearedDeposits = items
      .filter(i => i.is_cleared && i.transaction?.amount > 0)
      .reduce((sum, i) => sum + i.transaction.amount, 0);
    const clearedWithdrawals = items
      .filter(i => i.is_cleared && i.transaction?.amount < 0)
      .reduce((sum, i) => sum + Math.abs(i.transaction.amount), 0);

    const clearedBalance = reconciliation.beginning_balance + clearedDeposits - clearedWithdrawals;
    const difference = reconciliation.statement_ending_balance - clearedBalance;

    return {
      beginningBalance: reconciliation.beginning_balance,
      clearedDeposits,
      clearedWithdrawals,
      clearedBalance,
      statementBalance: reconciliation.statement_ending_balance,
      difference,
      isBalanced: Math.abs(difference) < 0.01
    };
  }, [reconciliation]);

  // If no reconciliation ID, show start form
  if (!reconciliationId) {
    return (
      <div className="p-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Start Bank Reconciliation</h1>
        <p className="text-muted-foreground mb-6">
          {bankAccount?.account_name}
        </p>

        {lastReconciliation && (
          <Card className="mb-6 bg-blue-50">
            <CardContent className="p-4">
              <p className="text-sm">
                Last reconciled: <strong>{formatDate(lastReconciliation.statement_date)}</strong>
                <br />
                Ending balance: <strong>{formatCurrency(lastReconciliation.statement_ending_balance)}</strong>
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Statement Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Statement Date</Label>
              <Input
                type="date"
                value={formData.statementDate}
                onChange={(e) => setFormData({ ...formData, statementDate: e.target.value })}
              />
            </div>

            <div>
              <Label>Statement Ending Balance</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.statementEndingBalance}
                onChange={(e) => setFormData({ ...formData, statementEndingBalance: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Period Start Date</Label>
                <Input
                  type="date"
                  value={formData.periodStartDate}
                  onChange={(e) => setFormData({ ...formData, periodStartDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Period End Date</Label>
                <Input
                  type="date"
                  value={formData.periodEndDate}
                  onChange={(e) => setFormData({ ...formData, periodEndDate: e.target.value })}
                />
              </div>
            </div>

            <Button
              onClick={handleStartReconciliation}
              disabled={!formData.statementEndingBalance || startMutation.isPending}
              className="w-full"
            >
              Start Reconciliation
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingRecon) {
    return <div className="p-6">Loading reconciliation...</div>;
  }

  // Active reconciliation view
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bank Reconciliation</h1>
          <p className="text-muted-foreground">
            {bankAccount?.account_name} • Statement Date: {formatDate(reconciliation.statement_date)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            onClick={() => completeMutation.mutate()}
            disabled={!summary?.isBalanced || completeMutation.isPending}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Finish Reconciliation
          </Button>
        </div>
      </div>

      {/* Summary Panel */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Reconciliation Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Beginning Balance</span>
              <span>{formatCurrency(summary?.beginningBalance || 0)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>+ Cleared Deposits</span>
              <span>{formatCurrency(summary?.clearedDeposits || 0)}</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>- Cleared Withdrawals</span>
              <span>{formatCurrency(summary?.clearedWithdrawals || 0)}</span>
            </div>
            <div className="flex justify-between font-medium border-t pt-2">
              <span>Cleared Balance</span>
              <span>{formatCurrency(summary?.clearedBalance || 0)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(summary?.isBalanced ? 'bg-green-50' : 'bg-red-50')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Difference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Statement Balance</p>
                <p className="text-xl font-bold">{formatCurrency(summary?.statementBalance || 0)}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Cleared Balance</p>
                <p className="text-xl font-bold">{formatCurrency(summary?.clearedBalance || 0)}</p>
              </div>
            </div>

            <div className={cn(
              "text-center p-3 rounded-lg",
              summary?.isBalanced ? 'bg-green-100' : 'bg-red-100'
            )}>
              {summary?.isBalanced ? (
                <div className="flex items-center justify-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Balanced!</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">
                    Difference: {formatCurrency(summary?.difference || 0)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions to Clear</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Clear</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Deposit</TableHead>
                <TableHead className="text-right">Withdrawal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reconciliation.items?.map((item) => (
                <TableRow key={item.id} className={cn(item.is_cleared && 'bg-green-50')}>
                  <TableCell>
                    <Checkbox
                      checked={item.is_cleared}
                      onCheckedChange={(checked) =>
                        toggleClearedMutation.mutate({
                          transactionId: item.bank_transaction_id,
                          isCleared: checked
                        })
                      }
                    />
                  </TableCell>
                  <TableCell>{formatDate(item.transaction?.transaction_date)}</TableCell>
                  <TableCell>{item.transaction?.description}</TableCell>
                  <TableCell className="text-right text-green-600">
                    {item.transaction?.amount > 0 ? formatCurrency(item.transaction.amount) : ''}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    {item.transaction?.amount < 0 ? formatCurrency(Math.abs(item.transaction.amount)) : ''}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
