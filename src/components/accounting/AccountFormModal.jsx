// src/components/accounting/AccountFormModal.jsx
// Modal for adding or editing chart of accounts entries

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { BookOpen, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const ACCOUNT_TYPES = [
  { value: 'Asset', label: 'Asset', color: 'bg-blue-100 text-blue-700' },
  { value: 'Liability', label: 'Liability', color: 'bg-red-100 text-red-700' },
  { value: 'Equity', label: 'Equity', color: 'bg-purple-100 text-purple-700' },
  { value: 'Revenue', label: 'Revenue', color: 'bg-green-100 text-green-700' },
  { value: 'Expense', label: 'Expense', color: 'bg-orange-100 text-orange-700' },
];

const SUBTYPES = {
  Asset: [
    { value: 'Current Asset', label: 'Current Asset' },
    { value: 'Fixed Asset', label: 'Fixed Asset' },
    { value: 'Other Asset', label: 'Other Asset' },
    { value: 'Bank', label: 'Bank' },
    { value: 'Accounts Receivable', label: 'Accounts Receivable' },
    { value: 'Inventory', label: 'Inventory' },
  ],
  Liability: [
    { value: 'Current Liability', label: 'Current Liability' },
    { value: 'Long-Term Liability', label: 'Long-Term Liability' },
    { value: 'Accounts Payable', label: 'Accounts Payable' },
    { value: 'Credit Card', label: 'Credit Card' },
  ],
  Equity: [
    { value: 'Owners Equity', label: 'Owners Equity' },
    { value: 'Retained Earnings', label: 'Retained Earnings' },
    { value: 'Partner Contributions', label: 'Partner Contributions' },
    { value: 'Partner Distributions', label: 'Partner Distributions' },
  ],
  Revenue: [
    { value: 'Operating Revenue', label: 'Operating Revenue' },
    { value: 'Other Income', label: 'Other Income' },
    { value: 'Sales Revenue', label: 'Sales Revenue' },
    { value: 'Service Revenue', label: 'Service Revenue' },
  ],
  Expense: [
    { value: 'Operating Expense', label: 'Operating Expense' },
    { value: 'Cost of Goods Sold', label: 'Cost of Goods Sold' },
    { value: 'Payroll Expense', label: 'Payroll Expense' },
    { value: 'Other Expense', label: 'Other Expense' },
  ],
};

export default function AccountFormModal({ open, onClose, entityId, account = null }) {
  const queryClient = useQueryClient();
  const isEditing = !!account;

  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    account_number: '',
    account_name: '',
    account_type: 'Asset',
    account_subtype: 'Current Asset',
    description: '',
    parent_account_id: '',
    is_active: true,
    is_header: false,
    tax_line: '',
  });

  // Reset form when modal opens or account changes
  useEffect(() => {
    if (open) {
      if (account) {
        setFormData({
          account_number: account.number || account.account_number || '',
          account_name: account.name || account.account_name || '',
          account_type: account.type || account.account_type || 'Asset',
          account_subtype: account.subtype || account.account_subtype || 'Current Asset',
          description: account.description || '',
          parent_account_id: account.parent_account_id || '',
          is_active: account.is_active !== false,
          is_header: account.is_header || false,
          tax_line: account.tax_line || '',
        });
      } else {
        setFormData({
          account_number: '',
          account_name: '',
          account_type: 'Asset',
          account_subtype: 'Current Asset',
          description: '',
          parent_account_id: '',
          is_active: true,
          is_header: false,
          tax_line: '',
        });
      }
      setError(null);
    }
  }, [open, account]);

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Reset subtype when type changes
      if (field === 'account_type') {
        const subtypes = SUBTYPES[value];
        updated.account_subtype = subtypes?.[0]?.value || '';
      }
      return updated;
    });
    setError(null);
  };

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const accountData = {
        entity_id: entityId,
        account_number: data.account_number,
        account_name: data.account_name,
        account_type: data.account_type,
        account_subtype: data.account_subtype,
        description: data.description || null,
        parent_account_id: data.parent_account_id || null,
        is_active: data.is_active,
        is_header: data.is_header,
        tax_line: data.tax_line || null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('entity_accounts')
          .update(accountData)
          .eq('id', account.id);
        if (error) throw error;
      } else {
        accountData.created_at = new Date().toISOString();
        accountData.balance = 0;
        const { error } = await supabase
          .from('entity_accounts')
          .insert([accountData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['entity-accounts', entityId]);
      onClose();
    },
    onError: (err) => {
      setError(err.message || 'Failed to save account');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.account_number.trim()) {
      setError('Account number is required');
      return;
    }
    if (!formData.account_name.trim()) {
      setError('Account name is required');
      return;
    }
    if (!formData.account_type) {
      setError('Account type is required');
      return;
    }

    saveMutation.mutate(formData);
  };

  const selectedType = ACCOUNT_TYPES.find(t => t.value === formData.account_type);
  const availableSubtypes = SUBTYPES[formData.account_type] || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {isEditing ? 'Edit Account' : 'Add Account'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Account Number & Name */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="account_number">Account Number *</Label>
              <Input
                id="account_number"
                value={formData.account_number}
                onChange={(e) => handleChange('account_number', e.target.value)}
                placeholder="1000"
                className="font-mono"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="account_name">Account Name *</Label>
              <Input
                id="account_name"
                value={formData.account_name}
                onChange={(e) => handleChange('account_name', e.target.value)}
                placeholder="e.g., Cash, Accounts Receivable"
              />
            </div>
          </div>

          {/* Account Type */}
          <div className="space-y-2">
            <Label>Account Type *</Label>
            <div className="grid grid-cols-5 gap-2">
              {ACCOUNT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleChange('account_type', type.value)}
                  className={cn(
                    "px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                    formData.account_type === type.value
                      ? `${type.color} border-current`
                      : "border-gray-200 hover:bg-gray-50"
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subtype */}
          <div className="space-y-2">
            <Label>Account Subtype</Label>
            <Select
              value={formData.account_subtype}
              onValueChange={(value) => handleChange('account_subtype', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subtype" />
              </SelectTrigger>
              <SelectContent>
                {availableSubtypes.map((subtype) => (
                  <SelectItem key={subtype.value} value={subtype.value}>
                    {subtype.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Optional description for this account..."
              rows={2}
            />
          </div>

          {/* Tax Line */}
          <div className="space-y-2">
            <Label htmlFor="tax_line">Tax Line Mapping</Label>
            <Input
              id="tax_line"
              value={formData.tax_line}
              onChange={(e) => handleChange('tax_line', e.target.value)}
              placeholder="e.g., Schedule C Line 1, Form 1065 Line 4"
            />
            <p className="text-xs text-gray-500">Map this account to a tax form line for reporting</p>
          </div>

          {/* Switches */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <Label>Active Account</Label>
                <p className="text-xs text-gray-500">Inactive accounts won't appear in dropdowns</p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => handleChange('is_active', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Header Account</Label>
                <p className="text-xs text-gray-500">Header accounts group other accounts and cannot have transactions</p>
              </div>
              <Switch
                checked={formData.is_header}
                onCheckedChange={(checked) => handleChange('is_header', checked)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="bg-[#047857] hover:bg-[#065f46]"
            >
              {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Add Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
