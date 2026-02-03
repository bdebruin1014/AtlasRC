import React, { useState, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import * as bankService from '@/services/bankAccountsService';
import * as coaService from '@/services/chartOfAccountsService';

const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
  { value: 'money_market', label: 'Money Market' },
  { value: 'credit_card', label: 'Credit Card' }
];

export function BankAccountModal({ open, onClose, account, entityId }) {
  const queryClient = useQueryClient();
  const isEditing = account?.id;

  const [formData, setFormData] = useState({
    account_name: '',
    account_type: 'checking',
    bank_name: '',
    account_number_last4: '',
    routing_number: '',
    gl_account_id: '',
    current_balance: '',
    credit_limit: '',
    is_primary: false
  });

  useEffect(() => {
    if (account) {
      setFormData({
        account_name: account.account_name || '',
        account_type: account.account_type || 'checking',
        bank_name: account.bank_name || '',
        account_number_last4: account.account_number_last4 || '',
        routing_number: account.routing_number || '',
        gl_account_id: account.gl_account_id || '',
        current_balance: account.current_balance || '',
        credit_limit: account.credit_limit || '',
        is_primary: account.is_primary || false
      });
    } else {
      setFormData({
        account_name: '',
        account_type: 'checking',
        bank_name: '',
        account_number_last4: '',
        routing_number: '',
        gl_account_id: '',
        current_balance: '',
        credit_limit: '',
        is_primary: false
      });
    }
  }, [account]);

  const { data: glAccounts = [] } = useQuery({
    queryKey: ['chart-of-accounts', entityId],
    queryFn: () => coaService.getChartOfAccounts(entityId),
    enabled: open && !!entityId
  });

  const createMutation = useMutation({
    mutationFn: (data) => bankService.createBankAccount({
      ...data,
      entity_id: entityId,
      current_balance: parseFloat(data.current_balance) || 0,
      credit_limit: data.account_type === 'credit_card' ? parseFloat(data.credit_limit) || null : null
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['bank-accounts', entityId]);
      onClose();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => bankService.updateBankAccount(account.id, {
      ...data,
      current_balance: parseFloat(data.current_balance) || 0,
      credit_limit: data.account_type === 'credit_card' ? parseFloat(data.credit_limit) || null : null
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['bank-accounts', entityId]);
      onClose();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const bankGLAccounts = glAccounts.filter(a =>
    a.account_type === 'asset' || a.account_type === 'liability'
  );

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Bank Account' : 'Add Bank Account'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Account Name *</Label>
            <Input
              value={formData.account_name}
              onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
              placeholder="e.g., Operating Account"
              required
            />
          </div>

          <div>
            <Label>Account Type *</Label>
            <Select
              value={formData.account_type}
              onValueChange={(value) => setFormData({ ...formData, account_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Bank Name</Label>
            <Input
              value={formData.bank_name}
              onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
              placeholder="e.g., Chase Bank"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Last 4 Digits</Label>
              <Input
                value={formData.account_number_last4}
                onChange={(e) => setFormData({ ...formData, account_number_last4: e.target.value.slice(0, 4) })}
                placeholder="1234"
                maxLength={4}
              />
            </div>
            <div>
              <Label>Routing Number</Label>
              <Input
                value={formData.routing_number}
                onChange={(e) => setFormData({ ...formData, routing_number: e.target.value.slice(0, 9) })}
                placeholder="123456789"
                maxLength={9}
              />
            </div>
          </div>

          <div>
            <Label>GL Account</Label>
            <Select
              value={formData.gl_account_id}
              onValueChange={(value) => setFormData({ ...formData, gl_account_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Link to GL account..." />
              </SelectTrigger>
              <SelectContent>
                {bankGLAccounts.map(a => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.account_number} - {a.account_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Current Balance</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.current_balance}
              onChange={(e) => setFormData({ ...formData, current_balance: e.target.value })}
              placeholder="0.00"
            />
          </div>

          {formData.account_type === 'credit_card' && (
            <div>
              <Label>Credit Limit</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.credit_limit}
                onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                placeholder="0.00"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <Checkbox
              id="is_primary"
              checked={formData.is_primary}
              onCheckedChange={(checked) => setFormData({ ...formData, is_primary: checked })}
            />
            <Label htmlFor="is_primary" className="cursor-pointer">
              Set as primary account
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.account_name || isPending}>
              {isPending ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
