import React, { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

const InvoicePaymentForm = ({ entityId, invoiceId, onCancel, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(invoiceId || '');
  const [formData, setFormData] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'check',
    reference_number: '',
    notes: '',
  });

  useEffect(() => {
    if (!invoiceId) {
      loadOpenInvoices();
    }
  }, [entityId]);

  const loadOpenInvoices = async () => {
    const { data } = await supabase
      .from('invoices')
      .select('id, invoice_number, customer_id, total_amount, balance_due')
      .eq('entity_id', entityId)
      .gt('balance_due', 0)
      .not('status', 'in', '("paid","void")')
      .order('invoice_date', { ascending: false });

    setInvoices(data || []);
  };

  const selectedInvoice = invoices.find(i => i.id === selectedInvoiceId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInvoiceId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select an invoice' });
      return;
    }

    setLoading(true);
    try {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid payment amount');
      }

      // Record the payment
      const { error: paymentError } = await supabase
        .from('invoice_payments')
        .insert({
          invoice_id: selectedInvoiceId,
          entity_id: entityId,
          amount,
          payment_date: formData.payment_date,
          payment_method: formData.payment_method,
          reference_number: formData.reference_number,
          notes: formData.notes,
        });

      if (paymentError) throw paymentError;

      // Update invoice balance
      const invoice = selectedInvoice || { balance_due: amount };
      const newBalance = Math.max(0, (invoice.balance_due || 0) - amount);

      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          balance_due: newBalance,
          status: newBalance <= 0 ? 'paid' : 'partial',
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedInvoiceId);

      if (updateError) throw updateError;

      toast({ title: 'Payment Recorded', description: `Payment of ${formatCurrency(amount)} applied successfully.` });
      onSuccess?.();
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to record payment' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Receive Payment</h2>
          <p className="text-sm text-gray-500">Record a customer payment against an invoice</p>
        </div>
      </div>

      {!invoiceId && (
        <div className="space-y-2">
          <Label>Invoice</Label>
          <Select value={selectedInvoiceId} onValueChange={setSelectedInvoiceId}>
            <SelectTrigger>
              <SelectValue placeholder="Select an invoice..." />
            </SelectTrigger>
            <SelectContent>
              {invoices.map(inv => (
                <SelectItem key={inv.id} value={inv.id}>
                  {inv.invoice_number} — Balance: {formatCurrency(inv.balance_due)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Amount</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
          {selectedInvoice && (
            <p className="text-xs text-gray-500">Balance due: {formatCurrency(selectedInvoice.balance_due)}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Payment Date</Label>
          <Input
            type="date"
            value={formData.payment_date}
            onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Payment Method</Label>
          <Select value={formData.payment_method} onValueChange={(v) => setFormData({ ...formData, payment_method: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="check">Check</SelectItem>
              <SelectItem value="ach">ACH / Bank Transfer</SelectItem>
              <SelectItem value="wire">Wire Transfer</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Reference / Check #</Label>
          <Input
            placeholder="e.g. CHK-1234"
            value={formData.reference_number}
            onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea
          placeholder="Optional payment notes..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading} className="bg-[#2F855A] hover:bg-[#276749]">
          {loading ? 'Recording...' : 'Record Payment'}
        </Button>
      </div>
    </form>
  );
};

export default InvoicePaymentForm;
