import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import * as bankService from '@/services/bankAccountsService';
import * as coaService from '@/services/chartOfAccountsService';

export function CategorizeTransactionModal({
  open,
  onClose,
  transaction,
  entityId,
  transactionIds // For bulk categorization
}) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    account_id: '',
    vendor_id: '',
    customer_id: '',
    project_id: '',
    memo: ''
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['chart-of-accounts', entityId],
    queryFn: () => coaService.getChartOfAccounts(entityId),
    enabled: open && !!entityId
  });

  const categorizeMutation = useMutation({
    mutationFn: async () => {
      const ids = transactionIds || [transaction?.id];
      for (const id of ids) {
        await bankService.categorizeTransaction(id, formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bank-transactions']);
      onClose();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    categorizeMutation.mutate();
  };

  // Group accounts by type
  const expenseAccounts = accounts.filter(a => a.account_type === 'expense');
  const revenueAccounts = accounts.filter(a => a.account_type === 'revenue');
  const assetAccounts = accounts.filter(a => a.account_type === 'asset');

  const isBulk = transactionIds && transactionIds.length > 1;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isBulk ? `Categorize ${transactionIds.length} Transactions` : 'Categorize Transaction'}
          </DialogTitle>
        </DialogHeader>

        {transaction && !isBulk && (
          <div className="bg-muted p-3 rounded-lg mb-4">
            <p className="font-medium">{transaction.description}</p>
            <p className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
              {formatCurrency(transaction.amount)}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Category Account</Label>
            <Select
              value={formData.account_id}
              onValueChange={(value) => setFormData({ ...formData, account_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account..." />
              </SelectTrigger>
              <SelectContent>
                {expenseAccounts.length > 0 && (
                  <>
                    <SelectItem value="" disabled className="font-semibold">Expenses</SelectItem>
                    {expenseAccounts.map(a => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.account_number} - {a.account_name}
                      </SelectItem>
                    ))}
                  </>
                )}
                {revenueAccounts.length > 0 && (
                  <>
                    <SelectItem value="" disabled className="font-semibold">Revenue</SelectItem>
                    {revenueAccounts.map(a => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.account_number} - {a.account_name}
                      </SelectItem>
                    ))}
                  </>
                )}
                {assetAccounts.length > 0 && (
                  <>
                    <SelectItem value="" disabled className="font-semibold">Assets</SelectItem>
                    {assetAccounts.map(a => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.account_number} - {a.account_name}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Memo (optional)</Label>
            <Input
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              placeholder="Add a note..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.account_id || categorizeMutation.isPending}>
              {categorizeMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
