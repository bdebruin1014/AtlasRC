// src/pages/projects/ChangeOrders/ChangeOrderForm.jsx
// Modal form for creating new change orders with contractor and budget item selection

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, Trash2 } from 'lucide-react';
import { useChangeOrderActions } from '@/hooks/useChangeOrders';
import { CO_REASONS, CO_DOCUMENT_TYPES, formatCONumber, getContractors } from '@/services/changeOrderService';
import { getBudgetLineItems } from '@/services/budgetService';

const formatCurrency = (amount) => {
  if (!amount) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.abs(amount));
};

const ChangeOrderForm = ({ open, projectId, nextCONumber, onCreated, onClose }) => {
  const { create, saving } = useChangeOrderActions(projectId);
  const contractors = getContractors();

  const [form, setForm] = useState({
    co_number: nextCONumber,
    title: '',
    description: '',
    reason: '',
    contractor_id: '',
    contractor_name: '',
    contractor_reference: '',
    amount: '',
    amount_type: 'add', // 'add' or 'deduct'
    budget_line_item_id: '',
    budget_line_item_name: '',
    submitted_date: new Date().toISOString().split('T')[0],
    approval_deadline: '',
    notes: '',
  });

  const [budgetItems, setBudgetItems] = useState([]);
  const [documents, setDocuments] = useState([]);

  // Load budget line items
  useEffect(() => {
    (async () => {
      try {
        const items = await getBudgetLineItems('budget-1');
        setBudgetItems(items);
      } catch (err) {
        console.error('Error loading budget items:', err);
      }
    })();
  }, []);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleContractorChange = (contractorId) => {
    const contractor = contractors.find(c => c.id === contractorId);
    setForm(prev => ({
      ...prev,
      contractor_id: contractorId,
      contractor_name: contractor?.name || '',
    }));
  };

  const handleBudgetItemChange = (itemId) => {
    const item = budgetItems.find(bi => bi.id === itemId);
    setForm(prev => ({
      ...prev,
      budget_line_item_id: itemId,
      budget_line_item_name: item ? `${item.line_item_code} - ${item.line_item_name}` : '',
    }));
  };

  const addDocument = () => {
    setDocuments(prev => [...prev, {
      id: `doc-${Date.now()}`,
      document_type: 'proposal',
      file_name: '',
    }]);
  };

  const removeDocument = (idx) => {
    setDocuments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.reason || !form.contractor_name || !form.amount) return;

    const amount = parseFloat(form.amount);
    const signedAmount = form.amount_type === 'deduct' ? -Math.abs(amount) : Math.abs(amount);

    const coData = {
      co_number: parseInt(form.co_number),
      title: form.title,
      description: form.description,
      reason: form.reason,
      contractor_id: form.contractor_id || null,
      contractor_name: form.contractor_name,
      contractor_reference: form.contractor_reference || null,
      amount: signedAmount,
      budget_line_item_id: form.budget_line_item_id || null,
      budget_line_item_name: form.budget_line_item_name || null,
      budget_id: 'budget-1',
      submitted_date: form.submitted_date,
      approval_deadline: form.approval_deadline || null,
      notes: form.notes || null,
    };

    await create(coData);
    onCreated?.();
  };

  const isValid = form.title && form.description && form.reason && form.contractor_name && form.amount;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Change Order</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* CO Number Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-blue-800">{formatCONumber(form.co_number)}</span>
              <span className="text-xs text-blue-600">Status: Pending</span>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="co-title">Title *</Label>
              <Input
                id="co-title"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="Brief title for this change order..."
                className="mt-1"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="co-desc">Description *</Label>
              <textarea
                id="co-desc"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-[#2F855A] focus:border-transparent"
                rows={3}
                placeholder="Detailed description of the change..."
              />
            </div>

            {/* Reason */}
            <div>
              <Label>Reason for Change *</Label>
              <Select value={form.reason} onValueChange={(v) => update('reason', v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select reason..." /></SelectTrigger>
                <SelectContent>
                  {CO_REASONS.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Contractor */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contractor *</Label>
                <Select value={form.contractor_id} onValueChange={handleContractorChange}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select contractor..." /></SelectTrigger>
                  <SelectContent>
                    {contractors.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="co-ref">Contractor Reference</Label>
                <Input
                  id="co-ref"
                  value={form.contractor_reference}
                  onChange={(e) => update('contractor_reference', e.target.value)}
                  placeholder="Their CO/PO #..."
                  className="mt-1"
                />
              </div>
            </div>

            {/* Amount */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={form.amount_type} onValueChange={(v) => update('amount_type', v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Add (Cost Increase)</SelectItem>
                    <SelectItem value="deduct">Deduct (Credit)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="co-amount">Amount *</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <Input
                    id="co-amount"
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.amount}
                    onChange={(e) => update('amount', e.target.value)}
                    className="pl-7"
                    placeholder="0.00"
                  />
                </div>
                {form.amount && (
                  <p className="text-xs mt-1">
                    <span className={form.amount_type === 'deduct' ? 'text-green-600' : 'text-red-600'}>
                      {form.amount_type === 'deduct' ? 'Credit: -' : 'Cost increase: +'}
                      {formatCurrency(form.amount)}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Budget Line Item */}
            <div>
              <Label>Budget Line Item Affected</Label>
              <Select value={form.budget_line_item_id} onValueChange={handleBudgetItemChange}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select budget item..." /></SelectTrigger>
                <SelectContent>
                  {budgetItems.map(bi => (
                    <SelectItem key={bi.id} value={bi.id}>
                      {bi.line_item_code} - {bi.line_item_name} ({formatCurrency(bi.budget_amount)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">Approved COs will update this budget line item.</p>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="co-submitted">Submitted Date *</Label>
                <Input
                  id="co-submitted"
                  type="date"
                  value={form.submitted_date}
                  onChange={(e) => update('submitted_date', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="co-deadline">Approval Deadline</Label>
                <Input
                  id="co-deadline"
                  type="date"
                  value={form.approval_deadline}
                  onChange={(e) => update('approval_deadline', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Documents */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm">Supporting Documents</Label>
                <Button type="button" variant="ghost" size="sm" onClick={addDocument}>
                  <Upload className="w-3 h-3 mr-1" /> Attach
                </Button>
              </div>
              {documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc, idx) => (
                    <div key={doc.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                      <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <select
                        value={doc.document_type}
                        onChange={(e) => {
                          setDocuments(prev => prev.map((d, i) => i === idx ? { ...d, document_type: e.target.value } : d));
                        }}
                        className="text-xs border border-gray-200 rounded px-1.5 py-1"
                      >
                        {CO_DOCUMENT_TYPES.map(dt => (
                          <option key={dt.value} value={dt.value}>{dt.label}</option>
                        ))}
                      </select>
                      <Input
                        placeholder="File name..."
                        value={doc.file_name}
                        onChange={(e) => {
                          setDocuments(prev => prev.map((d, i) => i === idx ? { ...d, file_name: e.target.value } : d));
                        }}
                        className="flex-1 h-7 text-xs"
                      />
                      <button type="button" onClick={() => removeDocument(idx)} className="text-gray-400 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No documents attached. Add proposals, estimates, or photos.</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="co-notes">Notes</Label>
              <Input
                id="co-notes"
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                placeholder="Additional notes..."
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              className="bg-[#2F855A] hover:bg-[#276749]"
              disabled={saving || !isValid}
            >
              {saving ? 'Creating...' : 'Submit Change Order'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeOrderForm;
