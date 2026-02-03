import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
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

export function SplitTransactionModal({ open, onClose, transaction, entityId }) {
  const queryClient = useQueryClient();
  const [splits, setSplits] = useState([
    { amount: '', account_id: '', description: '' }
  ]);

  const { data: accounts = [] } = useQuery({
    queryKey: ['chart-of-accounts', entityId],
    queryFn: () => coaService.getChartOfAccounts(entityId),
    enabled: open && !!entityId
  });

  const splitMutation = useMutation({
    mutationFn: () => bankService.splitTransaction(transaction.id, splits.map(s => ({
      ...s,
      amount: parseFloat(s.amount)
    }))),
    onSuccess: () => {
      queryClient.invalidateQueries(['bank-transactions']);
      onClose();
    }
  });

  const addSplit = () => {
    setSplits([...splits, { amount: '', account_id: '', description: '' }]);
  };

  const removeSplit = (index) => {
    setSplits(splits.filter((_, i) => i !== index));
  };

  const updateSplit = (index, field, value) => {
    const newSplits = [...splits];
    newSplits[index][field] = value;
    setSplits(newSplits);
  };

  const totalSplit = splits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
  const remaining = Math.abs(transaction?.amount || 0) - totalSplit;
  const isBalanced = Math.abs(remaining) < 0.01;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isBalanced) return;
    splitMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Split Transaction</DialogTitle>
        </DialogHeader>

        {transaction && (
          <div className="bg-muted p-3 rounded-lg mb-4">
            <p className="font-medium">{transaction.description}</p>
            <p className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
              Total: {formatCurrency(Math.abs(transaction.amount))}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {splits.map((split, index) => (
              <div key={index} className="flex items-end gap-2 p-3 border rounded-lg">
                <div className="flex-1">
                  <Label className="text-xs">Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={split.amount}
                    onChange={(e) => updateSplit(index, 'amount', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex-[2]">
                  <Label className="text-xs">Account</Label>
                  <Select
                    value={split.account_id}
                    onValueChange={(value) => updateSplit(index, 'account_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account..." />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(a => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.account_number} - {a.account_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label className="text-xs">Description</Label>
                  <Input
                    value={split.description}
                    onChange={(e) => updateSplit(index, 'description', e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                {splits.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSplit(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" onClick={addSplit}>
            <Plus className="h-4 w-4 mr-2" />
            Add Split
          </Button>

          <div className={`p-3 rounded-lg ${isBalanced ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex justify-between text-sm">
              <span>Split Total:</span>
              <span className="font-medium">{formatCurrency(totalSplit)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Remaining:</span>
              <span className={isBalanced ? 'text-green-600' : 'text-red-600'}>
                {formatCurrency(remaining)}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isBalanced || splitMutation.isPending}>
              {splitMutation.isPending ? 'Saving...' : 'Save Split'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
