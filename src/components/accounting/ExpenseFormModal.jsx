import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';

const EXPENSE_CATEGORIES = [
  { value: 'office_supplies', label: 'Office Supplies' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'professional_services', label: 'Professional Services' },
  { value: 'repairs_maintenance', label: 'Repairs & Maintenance' },
  { value: 'travel', label: 'Travel & Entertainment' },
  { value: 'marketing', label: 'Marketing & Advertising' },
  { value: 'software', label: 'Software & Subscriptions' },
  { value: 'taxes', label: 'Taxes & Fees' },
  { value: 'other', label: 'Other' },
];

const PAYMENT_METHODS = [
  { value: 'check', label: 'Check' },
  { value: 'ach', label: 'ACH/Bank Transfer' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'other', label: 'Other' },
];

// Demo accounts for fallback
const demoAccounts = [
  { id: 'acc-1', account_name: 'Operating Account', account_number: '1000' },
  { id: 'acc-2', account_name: 'Payroll Account', account_number: '1010' },
];

const demoExpenseAccounts = [
  { id: 'exp-6000', account_number: '6000', account_name: 'Office Expenses' },
  { id: 'exp-6100', account_number: '6100', account_name: 'Utilities Expense' },
  { id: 'exp-6200', account_number: '6200', account_name: 'Insurance Expense' },
  { id: 'exp-6300', account_number: '6300', account_name: 'Professional Fees' },
  { id: 'exp-6400', account_number: '6400', account_name: 'Repairs & Maintenance' },
];

export default function ExpenseFormModal({ open, onClose, expense, entityId }) {
  const queryClient = useQueryClient();
  const isEditing = !!expense?.id;

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    vendor_name: '',
    description: '',
    amount: '',
    category: 'other',
    expense_account_id: '',
    payment_account_id: '',
    payment_method: 'check',
    reference_number: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (expense) {
      setFormData({
        date: expense.date || new Date().toISOString().split('T')[0],
        vendor_name: expense.vendor_name || '',
        description: expense.description || '',
        amount: expense.amount?.toString() || '',
        category: expense.category || 'other',
        expense_account_id: expense.expense_account_id || '',
        payment_account_id: expense.payment_account_id || '',
        payment_method: expense.payment_method || 'check',
        reference_number: expense.reference_number || '',
        notes: expense.notes || '',
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        vendor_name: '',
        description: '',
        amount: '',
        category: 'other',
        expense_account_id: '',
        payment_account_id: '',
        payment_method: 'check',
        reference_number: '',
        notes: '',
      });
    }
  }, [expense, open]);

  const { data: bankAccounts = demoAccounts } = useQuery({
    queryKey: ['bank-accounts', entityId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('bank_accounts')
          .select('*')
          .eq('entity_id', entityId)
          .neq('account_type', 'credit_card')
          .order('account_name');

        if (data && !error) return data;
      } catch (err) {
        console.error('Error fetching bank accounts:', err);
      }
      return demoAccounts;
    },
    enabled: open && !!entityId
  });

  const { data: expenseAccounts = demoExpenseAccounts } = useQuery({
    queryKey: ['expense-accounts', entityId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('chart_of_accounts')
          .select('*')
          .eq('entity_id', entityId)
          .eq('account_type', 'expense')
          .order('account_number');

        if (data && !error) return data;
      } catch (err) {
        console.error('Error fetching expense accounts:', err);
      }
      return demoExpenseAccounts;
    },
    enabled: open && !!entityId
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const { data: result, error } = await supabase
        .from('transactions')
        .insert([{
          entity_id: entityId,
          transaction_type: 'expense',
          transaction_date: data.date,
          description: data.description,
          vendor_name: data.vendor_name,
          amount: -Math.abs(parseFloat(data.amount) || 0),
          category: data.category,
          expense_account_id: data.expense_account_id || null,
          payment_account_id: data.payment_account_id || null,
          payment_method: data.payment_method,
          reference_number: data.reference_number || null,
          notes: data.notes || null,
          status: 'posted',
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions', entityId]);
      queryClient.invalidateQueries(['entity-transactions', entityId]);
      handleClose();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const { data: result, error } = await supabase
        .from('transactions')
        .update({
          transaction_date: data.date,
          description: data.description,
          vendor_name: data.vendor_name,
          amount: -Math.abs(parseFloat(data.amount) || 0),
          category: data.category,
          expense_account_id: data.expense_account_id || null,
          payment_account_id: data.payment_account_id || null,
          payment_method: data.payment_method,
          reference_number: data.reference_number || null,
          notes: data.notes || null,
        })
        .eq('id', expense.id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions', entityId]);
      queryClient.invalidateQueries(['entity-transactions', entityId]);
      handleClose();
    }
  });

  const handleClose = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      vendor_name: '',
      description: '',
      amount: '',
      category: 'other',
      expense_account_id: '',
      payment_account_id: '',
      payment_method: 'check',
      reference_number: '',
      notes: '',
    });
    setErrors({});
    onClose();
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.vendor_name.trim()) {
      newErrors.vendor_name = 'Vendor name is required';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditing) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Expense' : 'Record Expense'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the expense details below.' : 'Record a new expense transaction.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor_name">Vendor/Payee *</Label>
            <Input
              id="vendor_name"
              value={formData.vendor_name}
              onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
              placeholder="Enter vendor name"
              className={errors.vendor_name ? 'border-red-500' : ''}
            />
            {errors.vendor_name && <p className="text-xs text-red-500">{errors.vendor_name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter expense description"
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(pm => (
                    <SelectItem key={pm.value} value={pm.value}>
                      {pm.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Expense Account</Label>
              <Select
                value={formData.expense_account_id}
                onValueChange={(value) => setFormData({ ...formData, expense_account_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account..." />
                </SelectTrigger>
                <SelectContent>
                  {expenseAccounts.map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.account_number} - {a.account_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Paid From</Label>
              <Select
                value={formData.payment_account_id}
                onValueChange={(value) => setFormData({ ...formData, payment_account_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account..." />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.account_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference_number">Reference/Check Number</Label>
            <Input
              id="reference_number"
              value={formData.reference_number}
              onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
              placeholder="Optional"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : (isEditing ? 'Update Expense' : 'Record Expense')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
