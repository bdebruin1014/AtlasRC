// src/components/accounting/BankAccountFormModal.jsx
// Modal for adding or editing bank accounts

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
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
import {
  CreditCard, Loader2, AlertCircle, Link2,
  DollarSign, Banknote, PiggyBank
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking', icon: CreditCard, description: 'Standard checking account' },
  { value: 'savings', label: 'Savings', icon: PiggyBank, description: 'Savings or money market' },
  { value: 'money_market', label: 'Money Market', icon: DollarSign, description: 'High-yield money market' },
  { value: 'credit_card', label: 'Credit Card', icon: CreditCard, description: 'Business credit card' },
  { value: 'line_of_credit', label: 'Line of Credit', icon: Banknote, description: 'Business line of credit' },
];

const BANKS = [
  'Chase',
  'Bank of America',
  'Wells Fargo',
  'Citibank',
  'US Bank',
  'PNC Bank',
  'Capital One',
  'TD Bank',
  'Truist',
  'Fifth Third Bank',
  'Other',
];

export default function BankAccountFormModal({ open, onClose, entityId, bankAccount = null, account = null }) {
  const queryClient = useQueryClient();
  // Support both bankAccount and account prop names
  const existingAccount = bankAccount || account;
  const isEditing = !!existingAccount?.id;

  const [error, setError] = useState(null);
  const [showOtherBank, setShowOtherBank] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bank_name: '',
    other_bank_name: '',
    account_type: 'checking',
    account_number: '',
    routing_number: '',
    opening_balance: '',
    opening_balance_date: new Date().toISOString().split('T')[0],
    gl_account_id: '',
    description: '',
    is_primary: false,
    auto_import: false,
    low_balance_alert: false,
    low_balance_threshold: '',
  });

  // Fetch GL accounts for linking
  const { data: glAccounts = [] } = useQuery({
    queryKey: ['entity-accounts', entityId, 'bank'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entity_accounts')
        .select('*')
        .eq('entity_id', entityId)
        .in('account_subtype', ['Bank', 'Current Asset', 'Credit Card'])
        .eq('is_active', true)
        .order('account_number');

      if (error) throw error;
      return data || [];
    },
    enabled: open && !!entityId,
  });

  // Reset form when modal opens or account changes
  useEffect(() => {
    if (open) {
      if (existingAccount) {
        const bankName = existingAccount.bank || existingAccount.bank_name || '';
        const isOther = bankName && !BANKS.includes(bankName);
        setShowOtherBank(isOther);
        setFormData({
          name: existingAccount.name || existingAccount.account_name || '',
          bank_name: isOther ? 'Other' : bankName,
          other_bank_name: isOther ? bankName : '',
          account_type: existingAccount.type || existingAccount.account_type || 'checking',
          account_number: existingAccount.accountNumber || existingAccount.account_number || existingAccount.account_number_last4 || '',
          routing_number: existingAccount.routing_number || '',
          opening_balance: existingAccount.opening_balance?.toString() || existingAccount.balance?.toString() || existingAccount.current_balance?.toString() || '',
          opening_balance_date: existingAccount.opening_balance_date || new Date().toISOString().split('T')[0],
          gl_account_id: existingAccount.gl_account_id || '',
          description: existingAccount.description || '',
          is_primary: existingAccount.is_primary || false,
          auto_import: existingAccount.auto_import || existingAccount.connected || false,
          low_balance_alert: existingAccount.low_balance_alert || false,
          low_balance_threshold: existingAccount.low_balance_threshold?.toString() || '',
        });
      } else {
        setShowOtherBank(false);
        setFormData({
          name: '',
          bank_name: '',
          other_bank_name: '',
          account_type: 'checking',
          account_number: '',
          routing_number: '',
          opening_balance: '',
          opening_balance_date: new Date().toISOString().split('T')[0],
          gl_account_id: '',
          description: '',
          is_primary: false,
          auto_import: false,
          low_balance_alert: false,
          low_balance_threshold: '',
        });
      }
      setError(null);
    }
  }, [open, existingAccount]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);

    if (field === 'bank_name') {
      setShowOtherBank(value === 'Other');
      if (value !== 'Other') {
        setFormData(prev => ({ ...prev, other_bank_name: '' }));
      }
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const bankData = {
        entity_id: entityId,
        name: data.name,
        account_name: data.name,
        bank_name: data.bank_name === 'Other' ? data.other_bank_name : data.bank_name,
        account_type: data.account_type,
        account_number: data.account_number,
        account_number_last4: data.account_number.slice(-4),
        routing_number: data.routing_number || null,
        opening_balance: data.opening_balance ? parseFloat(data.opening_balance) : 0,
        opening_balance_date: data.opening_balance_date,
        current_balance: data.opening_balance ? parseFloat(data.opening_balance) : 0,
        gl_account_id: data.gl_account_id || null,
        description: data.description || null,
        is_primary: data.is_primary,
        auto_import: data.auto_import,
        low_balance_alert: data.low_balance_alert,
        low_balance_threshold: data.low_balance_threshold ? parseFloat(data.low_balance_threshold) : null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('entity_bank_accounts')
          .update(bankData)
          .eq('id', existingAccount.id);
        if (error) {
          // Try alternate table name
          const { error: error2 } = await supabase
            .from('bank_accounts')
            .update(bankData)
            .eq('id', existingAccount.id);
          if (error2) throw error2;
        }
      } else {
        bankData.created_at = new Date().toISOString();
        bankData.is_connected = false;
        const { error } = await supabase
          .from('entity_bank_accounts')
          .insert([bankData]);
        if (error) {
          // Try alternate table name
          const { error: error2 } = await supabase
            .from('bank_accounts')
            .insert([bankData]);
          if (error2) throw error2;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['entity-bank-accounts', entityId]);
      queryClient.invalidateQueries(['bank-accounts', entityId]);
      onClose();
    },
    onError: (err) => {
      setError(err.message || 'Failed to save bank account');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Account nickname is required');
      return;
    }
    if (!formData.bank_name || (formData.bank_name === 'Other' && !formData.other_bank_name.trim())) {
      setError('Bank name is required');
      return;
    }
    if (!formData.account_number.trim()) {
      setError('Account number is required');
      return;
    }

    saveMutation.mutate(formData);
  };

  const maskAccountNumber = (num) => {
    if (!num || num.length < 4) return num;
    return '****' + num.slice(-4);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {isEditing ? 'Edit Bank Account' : 'Add Bank Account'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Account Type */}
          <div className="space-y-2">
            <Label>Account Type *</Label>
            <div className="grid grid-cols-3 gap-2">
              {ACCOUNT_TYPES.slice(0, 3).map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleChange('account_type', type.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors",
                      formData.account_type === type.value
                        ? "border-[#047857] bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5",
                      formData.account_type === type.value ? "text-[#047857]" : "text-gray-500"
                    )} />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ACCOUNT_TYPES.slice(3).map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleChange('account_type', type.value)}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border-2 transition-colors",
                      formData.account_type === type.value
                        ? "border-[#047857] bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5",
                      formData.account_type === type.value ? "text-[#047857]" : "text-gray-500"
                    )} />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account Name & Bank */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Account Nickname *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Operating Account"
              />
            </div>
            <div className="space-y-2">
              <Label>Bank *</Label>
              <Select
                value={formData.bank_name}
                onValueChange={(value) => handleChange('bank_name', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent>
                  {BANKS.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {showOtherBank && (
            <div className="space-y-2">
              <Label htmlFor="other_bank_name">Bank Name *</Label>
              <Input
                id="other_bank_name"
                value={formData.other_bank_name}
                onChange={(e) => handleChange('other_bank_name', e.target.value)}
                placeholder="Enter bank name"
              />
            </div>
          )}

          {/* Account & Routing Numbers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="account_number">Account Number *</Label>
              <Input
                id="account_number"
                value={formData.account_number}
                onChange={(e) => handleChange('account_number', e.target.value)}
                placeholder="Enter account number"
                className="font-mono"
              />
              <p className="text-xs text-gray-500">
                Stored securely. Display: {maskAccountNumber(formData.account_number)}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="routing_number">Routing Number</Label>
              <Input
                id="routing_number"
                value={formData.routing_number}
                onChange={(e) => handleChange('routing_number', e.target.value)}
                placeholder="9 digit routing number"
                maxLength={9}
                className="font-mono"
              />
            </div>
          </div>

          {/* Opening Balance */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Opening Balance</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="opening_balance">Balance Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="opening_balance"
                    type="number"
                    step="0.01"
                    value={formData.opening_balance}
                    onChange={(e) => handleChange('opening_balance', e.target.value)}
                    placeholder="0.00"
                    className="pl-7"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="opening_balance_date">As of Date</Label>
                <Input
                  id="opening_balance_date"
                  type="date"
                  value={formData.opening_balance_date}
                  onChange={(e) => handleChange('opening_balance_date', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* GL Account Link */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Link to GL Account
            </Label>
            <Select
              value={formData.gl_account_id}
              onValueChange={(value) => handleChange('gl_account_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select GL account (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No GL Account</SelectItem>
                {glAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.account_number} - {account.account_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Link this bank account to a General Ledger account for automatic reconciliation
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Purpose of this account..."
              rows={2}
            />
          </div>

          {/* Settings */}
          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Primary Account</Label>
                <p className="text-xs text-gray-500">Default account for payments and receipts</p>
              </div>
              <Switch
                checked={formData.is_primary}
                onCheckedChange={(checked) => handleChange('is_primary', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-import Transactions</Label>
                <p className="text-xs text-gray-500">Automatically import transactions daily</p>
              </div>
              <Switch
                checked={formData.auto_import}
                onCheckedChange={(checked) => handleChange('auto_import', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Low Balance Alert</Label>
                <p className="text-xs text-gray-500">Get notified when balance is low</p>
              </div>
              <Switch
                checked={formData.low_balance_alert}
                onCheckedChange={(checked) => handleChange('low_balance_alert', checked)}
              />
            </div>
            {formData.low_balance_alert && (
              <div className="space-y-2 ml-4">
                <Label htmlFor="low_balance_threshold">Alert Threshold</Label>
                <div className="relative w-48">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="low_balance_threshold"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.low_balance_threshold}
                    onChange={(e) => handleChange('low_balance_threshold', e.target.value)}
                    placeholder="5000"
                    className="pl-7"
                  />
                </div>
              </div>
            )}
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
              {isEditing ? 'Save Changes' : 'Add Bank Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
