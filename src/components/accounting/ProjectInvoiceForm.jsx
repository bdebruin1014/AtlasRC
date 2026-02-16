import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2 } from 'lucide-react';
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

const ProjectInvoiceForm = ({ entityId, invoice, onCancel, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    customer_id: invoice?.customer_id || '',
    invoice_date: invoice?.invoice_date || new Date().toISOString().split('T')[0],
    due_date: invoice?.due_date || '',
    description: invoice?.description || '',
    notes: invoice?.notes || '',
  });
  const [lineItems, setLineItems] = useState(
    invoice?.line_items || [{ description: '', quantity: 1, unit_price: '', amount: 0 }]
  );

  useEffect(() => {
    loadCustomers();
    // Default due date to 30 days from invoice date
    if (!formData.due_date) {
      const due = new Date();
      due.setDate(due.getDate() + 30);
      setFormData(prev => ({ ...prev, due_date: due.toISOString().split('T')[0] }));
    }
  }, [entityId]);

  const loadCustomers = async () => {
    const { data } = await supabase
      .from('customers')
      .select('id, company_name, name, email')
      .eq('entity_id', entityId)
      .order('company_name');
    setCustomers(data || []);
  };

  const updateLineItem = (index, field, value) => {
    setLineItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };
      if (field === 'quantity' || field === 'unit_price') {
        updated.amount = (parseFloat(updated.quantity) || 0) * (parseFloat(updated.unit_price) || 0);
      }
      return updated;
    }));
  };

  const addLineItem = () => {
    setLineItems(prev => [...prev, { description: '', quantity: 1, unit_price: '', amount: 0 }]);
  };

  const removeLineItem = (index) => {
    if (lineItems.length <= 1) return;
    setLineItems(prev => prev.filter((_, i) => i !== index));
  };

  const totalAmount = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_id) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a customer' });
      return;
    }

    setLoading(true);
    try {
      // Generate invoice number
      const { data: lastInv } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextNumber = lastInv
        ? parseInt(lastInv.invoice_number.replace(/\D/g, '')) + 1
        : 1001;

      const invoiceData = {
        entity_id: entityId,
        customer_id: formData.customer_id,
        invoice_number: `INV-${nextNumber}`,
        invoice_date: formData.invoice_date,
        due_date: formData.due_date,
        description: formData.description,
        notes: formData.notes,
        total_amount: totalAmount,
        balance_due: totalAmount,
        status: 'draft',
      };

      if (invoice?.id) {
        // Update existing
        const { error } = await supabase
          .from('invoices')
          .update({ ...invoiceData, updated_at: new Date().toISOString() })
          .eq('id', invoice.id);
        if (error) throw error;
      } else {
        // Create new
        const { data: newInvoice, error } = await supabase
          .from('invoices')
          .insert(invoiceData)
          .select()
          .single();
        if (error) throw error;

        // Insert line items
        if (lineItems.length > 0) {
          const lines = lineItems.map((item, idx) => ({
            invoice_id: newInvoice.id,
            description: item.description,
            quantity: parseFloat(item.quantity) || 1,
            unit_price: parseFloat(item.unit_price) || 0,
            amount: item.amount || 0,
            line_number: idx + 1,
          }));

          const { error: linesError } = await supabase
            .from('invoice_line_items')
            .insert(lines);
          if (linesError) console.error('Error inserting line items:', linesError);
        }
      }

      toast({ title: invoice?.id ? 'Invoice Updated' : 'Invoice Created', description: `Invoice ${invoiceData.invoice_number} saved.` });
      onSuccess?.();
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to save invoice' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{invoice?.id ? 'Edit Invoice' : 'New Invoice'}</h2>
          <p className="text-sm text-gray-500">Create a customer invoice for billing</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <Label>Customer</Label>
          <Select value={formData.customer_id} onValueChange={(v) => setFormData({ ...formData, customer_id: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select customer..." />
            </SelectTrigger>
            <SelectContent>
              {customers.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.company_name || c.name} {c.email ? `(${c.email})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Invoice Date</Label>
          <Input
            type="date"
            value={formData.invoice_date}
            onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Due Date</Label>
          <Input
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          placeholder="Invoice description..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={2}
        />
      </div>

      {/* Line Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Line Items</Label>
          <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
            <Plus className="w-4 h-4 mr-1" /> Add Line
          </Button>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-1">
            <div className="col-span-5">Description</div>
            <div className="col-span-2">Qty</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-1"></div>
          </div>
          {lineItems.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <Input
                className="col-span-5"
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
              />
              <Input
                className="col-span-2"
                type="number"
                step="1"
                min="1"
                value={item.quantity}
                onChange={(e) => updateLineItem(idx, 'quantity', e.target.value)}
              />
              <Input
                className="col-span-2"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={item.unit_price}
                onChange={(e) => updateLineItem(idx, 'unit_price', e.target.value)}
              />
              <div className="col-span-2 text-right font-mono text-sm">
                {formatCurrency(item.amount)}
              </div>
              <div className="col-span-1 flex justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLineItem(idx)}
                  disabled={lineItems.length <= 1}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2 border-t">
          <div className="text-right">
            <span className="text-sm text-gray-500 mr-4">Total:</span>
            <span className="text-lg font-bold">{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea
          placeholder="Notes visible on invoice..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading} className="bg-[#2F855A] hover:bg-[#276749]">
          {loading ? 'Saving...' : (invoice?.id ? 'Update Invoice' : 'Create Invoice')}
        </Button>
      </div>
    </form>
  );
};

export default ProjectInvoiceForm;
