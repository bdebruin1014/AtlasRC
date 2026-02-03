import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, FileText, Loader2, CheckCircle, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

// Demo unpaid invoices for fallback
const demoUnpaidInvoices = [
  { id: 'inv-1', invoice_number: 'INV-2024-001', customer_name: 'Acme Corp', total_amount: 15000, amount_paid: 0, balance_due: 15000, due_date: '2025-02-15' },
  { id: 'inv-2', invoice_number: 'INV-2024-002', customer_name: 'Smith Construction', total_amount: 8500, amount_paid: 2000, balance_due: 6500, due_date: '2025-02-10' },
  { id: 'inv-3', invoice_number: 'INV-2024-003', customer_name: 'Johnson & Associates', total_amount: 22000, amount_paid: 0, balance_due: 22000, due_date: '2025-02-20' },
  { id: 'inv-4', invoice_number: 'INV-2024-004', customer_name: 'Metro Development', total_amount: 45000, amount_paid: 20000, balance_due: 25000, due_date: '2025-01-30' },
];

const PAYMENT_METHODS = [
  { value: 'check', label: 'Check' },
  { value: 'ach', label: 'ACH Transfer' },
  { value: 'wire', label: 'Wire Transfer' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'other', label: 'Other' },
];

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val || 0);

export default function InvoicePaymentModal({ open, onClose, entityId, preselectedInvoiceId }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    invoice_id: preselectedInvoiceId || '',
    payment_date: new Date().toISOString().split('T')[0],
    amount: '',
    payment_method: '',
    reference_number: '',
    deposit_account: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  const { data: unpaidInvoices = demoUnpaidInvoices, isLoading: loadingInvoices } = useQuery({
    queryKey: ['unpaid-invoices', entityId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select('*')
          .eq('entity_id', entityId)
          .in('status', ['sent', 'partial', 'overdue'])
          .gt('balance_due', 0)
          .order('due_date');

        if (data && !error) return data;
      } catch (err) {
        console.error('Error fetching unpaid invoices:', err);
      }
      return demoUnpaidInvoices;
    },
    enabled: open && !!entityId
  });

  const { data: bankAccounts = [] } = useQuery({
    queryKey: ['bank-accounts', entityId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('bank_accounts')
          .select('*')
          .eq('entity_id', entityId)
          .order('account_name');

        if (data && !error) return data;
      } catch (err) {
        console.error('Error fetching bank accounts:', err);
      }
      return [
        { id: 'acc-1', account_name: 'Operating Account' },
        { id: 'acc-2', account_name: 'Savings Account' },
      ];
    },
    enabled: open && !!entityId
  });

  const filteredInvoices = unpaidInvoices.filter(inv => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      inv.invoice_number?.toLowerCase().includes(term) ||
      inv.customer_name?.toLowerCase().includes(term)
    );
  });

  const selectedInvoice = unpaidInvoices.find(inv => inv.id === formData.invoice_id);

  const paymentMutation = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('invoice_payments')
        .insert([{
          entity_id: entityId,
          invoice_id: data.invoice_id,
          payment_date: data.payment_date,
          amount: parseFloat(data.amount),
          payment_method: data.payment_method,
          reference_number: data.reference_number,
          deposit_account_id: data.deposit_account || null,
          notes: data.notes,
        }]);

      if (error) throw error;

      // Update invoice balance
      const invoice = unpaidInvoices.find(i => i.id === data.invoice_id);
      if (invoice) {
        const newAmountPaid = (invoice.amount_paid || 0) + parseFloat(data.amount);
        const newBalance = invoice.total_amount - newAmountPaid;
        const newStatus = newBalance <= 0 ? 'paid' : 'partial';

        await supabase
          .from('invoices')
          .update({
            amount_paid: newAmountPaid,
            balance_due: newBalance,
            status: newStatus,
          })
          .eq('id', data.invoice_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['invoices', entityId]);
      queryClient.invalidateQueries(['unpaid-invoices', entityId]);
      handleClose();
    }
  });

  const validate = () => {
    const newErrors = {};
    if (!formData.invoice_id) newErrors.invoice_id = 'Please select an invoice';
    if (!formData.payment_date) newErrors.payment_date = 'Payment date is required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (selectedInvoice && parseFloat(formData.amount) > selectedInvoice.balance_due) {
      newErrors.amount = 'Amount exceeds balance due';
    }
    if (!formData.payment_method) newErrors.payment_method = 'Payment method is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    paymentMutation.mutate(formData);
  };

  const handleClose = () => {
    setFormData({
      invoice_id: '',
      payment_date: new Date().toISOString().split('T')[0],
      amount: '',
      payment_method: '',
      reference_number: '',
      deposit_account: '',
      notes: ''
    });
    setErrors({});
    setSearchTerm('');
    onClose();
  };

  const handleInvoiceSelect = (invoice) => {
    setFormData(prev => ({
      ...prev,
      invoice_id: invoice.id,
      amount: invoice.balance_due.toString()
    }));
    setSearchTerm('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a payment received for an invoice
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Invoice Selection */}
          <div className="space-y-2">
            <Label>Invoice *</Label>
            {selectedInvoice ? (
              <div className="border rounded-lg p-3 bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedInvoice.invoice_number}</p>
                    <p className="text-sm text-muted-foreground">{selectedInvoice.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(selectedInvoice.balance_due)}</p>
                    <p className="text-xs text-muted-foreground">Balance Due</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="mt-1 p-0 h-auto"
                  onClick={() => setFormData(prev => ({ ...prev, invoice_id: '', amount: '' }))}
                >
                  Change invoice
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto border rounded-lg divide-y">
                  {loadingInvoices ? (
                    <div className="p-4 text-center text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    </div>
                  ) : filteredInvoices.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      No unpaid invoices found
                    </div>
                  ) : (
                    filteredInvoices.map(invoice => (
                      <button
                        key={invoice.id}
                        type="button"
                        onClick={() => handleInvoiceSelect(invoice)}
                        className="w-full p-2 text-left hover:bg-muted/50 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-sm">{invoice.invoice_number}</p>
                          <p className="text-xs text-muted-foreground">{invoice.customer_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">{formatCurrency(invoice.balance_due)}</p>
                          <p className="text-xs text-muted-foreground">
                            Due: {new Date(invoice.due_date).toLocaleDateString()}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
            {errors.invoice_id && (
              <p className="text-sm text-red-500">{errors.invoice_id}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Payment Date */}
            <div className="space-y-2">
              <Label htmlFor="payment_date">Payment Date *</Label>
              <Input
                id="payment_date"
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
                className={errors.payment_date ? 'border-red-500' : ''}
              />
              {errors.payment_date && (
                <p className="text-sm text-red-500">{errors.payment_date}</p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className={cn("pl-9", errors.amount ? 'border-red-500' : '')}
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Payment Method */}
            <div className="space-y-2">
              <Label>Payment Method *</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
              >
                <SelectTrigger className={errors.payment_method ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(method => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.payment_method && (
                <p className="text-sm text-red-500">{errors.payment_method}</p>
              )}
            </div>

            {/* Reference Number */}
            <div className="space-y-2">
              <Label htmlFor="reference_number">Reference #</Label>
              <Input
                id="reference_number"
                placeholder="Check # or ref"
                value={formData.reference_number}
                onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
              />
            </div>
          </div>

          {/* Deposit Account */}
          <div className="space-y-2">
            <Label>Deposit To</Label>
            <Select
              value={formData.deposit_account}
              onValueChange={(value) => setFormData(prev => ({ ...prev, deposit_account: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select deposit account" />
              </SelectTrigger>
              <SelectContent>
                {bankAccounts.map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.account_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Optional payment notes..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={paymentMutation.isPending}>
              {paymentMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Record Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
