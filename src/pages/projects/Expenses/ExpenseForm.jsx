// src/pages/projects/Expenses/ExpenseForm.jsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EXPENSE_TYPES } from '@/services/projectExpenseService';
import { useExpenseActions } from '@/hooks/useProjectExpenses';

export default function ExpenseForm({ open, projectId, expense, onClose, onSaved }) {
  const { create, update, saving } = useExpenseActions(projectId);
  const isEdit = !!expense;

  const [form, setForm] = useState({
    description: expense?.description || '',
    expense_type: expense?.expense_type || 'materials',
    vendor_name: expense?.vendor_name || '',
    invoice_number: expense?.invoice_number || '',
    amount: expense?.amount?.toString() || '',
    tax_amount: expense?.tax_amount?.toString() || '0',
    expense_date: expense?.expense_date || new Date().toISOString().split('T')[0],
    due_date: expense?.due_date || '',
    requires_approval: expense?.requires_approval !== false,
    notes: expense?.notes || '',
  });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await update(expense.id, form);
      } else {
        await create(form);
      }
      onSaved();
    } catch (err) {
      console.error('Error saving expense:', err);
    }
  };

  const totalAmount = (parseFloat(form.amount) || 0) + (parseFloat(form.tax_amount) || 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Expense' : 'New Expense'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Description */}
          <div>
            <Label>Description *</Label>
            <Input
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Enter expense description"
              required
            />
          </div>

          {/* Type */}
          <div>
            <Label>Expense Type</Label>
            <select
              value={form.expense_type}
              onChange={(e) => set('expense_type', e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              {EXPENSE_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Vendor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Vendor Name</Label>
              <Input
                value={form.vendor_name}
                onChange={(e) => set('vendor_name', e.target.value)}
                placeholder="Vendor"
              />
            </div>
            <div>
              <Label>Invoice Number</Label>
              <Input
                value={form.invoice_number}
                onChange={(e) => set('invoice_number', e.target.value)}
                placeholder="INV-001"
              />
            </div>
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Amount *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <Input
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => set('amount', e.target.value)}
                  className="pl-7"
                  required
                />
              </div>
            </div>
            <div>
              <Label>Tax Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <Input
                  type="number"
                  step="0.01"
                  value={form.tax_amount}
                  onChange={(e) => set('tax_amount', e.target.value)}
                  className="pl-7"
                />
              </div>
            </div>
            <div>
              <Label>Total</Label>
              <div className="border rounded-md px-3 py-2 text-sm bg-gray-50 font-medium">
                ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Expense Date *</Label>
              <Input
                type="date"
                value={form.expense_date}
                onChange={(e) => set('expense_date', e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={form.due_date}
                onChange={(e) => set('due_date', e.target.value)}
              />
            </div>
          </div>

          {/* Approval */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="requires_approval"
              checked={form.requires_approval}
              onChange={(e) => set('requires_approval', e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="requires_approval" className="text-sm cursor-pointer">
              Requires approval before payment
            </Label>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Additional notes..."
              rows={3}
              className="w-full border rounded-md px-3 py-2 text-sm resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-[#2F855A] hover:bg-[#276749]" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Update Expense' : 'Create Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
