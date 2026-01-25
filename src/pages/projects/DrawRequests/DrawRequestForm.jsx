// src/pages/projects/DrawRequests/DrawRequestForm.jsx
// Modal form for creating new draw requests with line item selection

import React, { useState, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Upload, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDrawRequestActions } from '@/hooks/useDrawRequests';
import { getBudgetLineItems } from '@/services/budgetService';
import { getDrawRequestItems } from '@/services/drawRequestService';

const formatCurrency = (amount) => {
  if (!amount) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};

const DrawRequestForm = ({ open, projectId, nextDrawNumber, loanInfo, budgetRemaining, onCreated, onClose }) => {
  const { create, saving } = useDrawRequestActions(projectId);

  const [form, setForm] = useState({
    draw_number: nextDrawNumber,
    request_date: new Date().toISOString().split('T')[0],
    period_start: '',
    period_end: '',
    retainage_percentage: loanInfo?.retainage_percentage || 5,
    lender_name: loanInfo?.lender_name || '',
    notes: '',
  });

  const [lineItems, setLineItems] = useState([]);
  const [budgetItems, setBudgetItems] = useState([]);
  const [budgetLoaded, setBudgetLoaded] = useState(false);
  const [documents, setDocuments] = useState([]);

  // Load budget line items for selection
  React.useEffect(() => {
    (async () => {
      try {
        const items = await getBudgetLineItems('budget-1'); // Active budget
        setBudgetItems(items);
        setBudgetLoaded(true);
      } catch (err) {
        console.error('Error loading budget items:', err);
        setBudgetLoaded(true);
      }
    })();
  }, []);

  // Calculate totals
  const requestedTotal = useMemo(() =>
    lineItems.reduce((s, li) => s + (parseFloat(li.current_request) || 0), 0), [lineItems]
  );

  const retainageAmount = useMemo(() =>
    requestedTotal * (form.retainage_percentage / 100), [requestedTotal, form.retainage_percentage]
  );

  const netAmount = requestedTotal - retainageAmount;

  const addLineItem = useCallback(() => {
    setLineItems(prev => [...prev, {
      id: `new-${Date.now()}`,
      budget_line_item_id: '',
      cost_code: '',
      description: '',
      budget_amount: 0,
      previously_drawn: 0,
      current_request: 0,
      percent_complete: 0,
    }]);
  }, []);

  const updateLineItem = useCallback((idx, field, value) => {
    setLineItems(prev => prev.map((li, i) => {
      if (i !== idx) return li;
      const updated = { ...li, [field]: value };

      // If selecting a budget item, populate fields
      if (field === 'budget_line_item_id' && value) {
        const budgetItem = budgetItems.find(bi => bi.id === value);
        if (budgetItem) {
          updated.cost_code = budgetItem.line_item_code;
          updated.description = budgetItem.line_item_name;
          updated.budget_amount = budgetItem.budget_amount || 0;
          updated.previously_drawn = budgetItem.actual_amount || 0;
        }
      }
      return updated;
    }));
  }, [budgetItems]);

  const removeLineItem = useCallback((idx) => {
    setLineItems(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const addDocument = useCallback(() => {
    setDocuments(prev => [...prev, {
      id: `doc-${Date.now()}`,
      document_type: 'invoice',
      file_name: '',
    }]);
  }, []);

  const removeDocument = useCallback((idx) => {
    setDocuments(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.request_date || lineItems.length === 0) return;

    const drawData = {
      ...form,
      draw_number: parseInt(form.draw_number),
      requested_amount: requestedTotal,
      retainage_amount: retainageAmount,
      net_amount: netAmount,
      retainage_percentage: parseFloat(form.retainage_percentage),
      budget_id: 'budget-1', // Active budget
    };

    await create(drawData);
    onCreated?.();
  };

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  // Available budget items (not already added)
  const availableBudgetItems = useMemo(() => {
    const usedIds = lineItems.map(li => li.budget_line_item_id).filter(Boolean);
    return budgetItems.filter(bi => !usedIds.includes(bi.id));
  }, [budgetItems, lineItems]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Draw Request</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 py-4">
            {/* Draw Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-800">Draw #{form.draw_number}</p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    Available to draw: {formatCurrency(budgetRemaining)}
                  </p>
                </div>
                {requestedTotal > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-blue-600">Requesting</p>
                    <p className="text-lg font-bold text-blue-800">{formatCurrency(requestedTotal)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="request-date">Request Date *</Label>
                <Input
                  id="request-date"
                  type="date"
                  value={form.request_date}
                  onChange={(e) => update('request_date', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="period-start">Period Start</Label>
                <Input
                  id="period-start"
                  type="date"
                  value={form.period_start}
                  onChange={(e) => update('period_start', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="period-end">Period End</Label>
                <Input
                  id="period-end"
                  type="date"
                  value={form.period_end}
                  onChange={(e) => update('period_end', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="retainage">Retainage %</Label>
                <Input
                  id="retainage"
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={form.retainage_percentage}
                  onChange={(e) => update('retainage_percentage', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lender">Lender</Label>
                <Input
                  id="lender"
                  value={form.lender_name}
                  onChange={(e) => update('lender_name', e.target.value)}
                  placeholder="Lender name..."
                  className="mt-1"
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700">Line Items</h4>
                <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                  <Plus className="w-3 h-3 mr-1" /> Add Item
                </Button>
              </div>

              {lineItems.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400">
                  Add budget line items to this draw request.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {lineItems.map((li, idx) => (
                    <div key={li.id} className="p-3 bg-white">
                      <div className="grid grid-cols-12 gap-2 items-end">
                        {/* Budget Item Selector */}
                        <div className="col-span-5">
                          {idx === 0 && <Label className="text-xs text-gray-500 mb-1 block">Budget Line Item</Label>}
                          <select
                            value={li.budget_line_item_id}
                            onChange={(e) => updateLineItem(idx, 'budget_line_item_id', e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                          >
                            <option value="">Select budget item...</option>
                            {[...availableBudgetItems, ...(li.budget_line_item_id ? budgetItems.filter(b => b.id === li.budget_line_item_id) : [])].map(bi => (
                              <option key={bi.id} value={bi.id}>
                                {bi.line_item_code} - {bi.line_item_name} ({formatCurrency(bi.budget_amount)})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Previously Drawn */}
                        <div className="col-span-2">
                          {idx === 0 && <Label className="text-xs text-gray-500 mb-1 block">Prev. Drawn</Label>}
                          <Input
                            type="number"
                            value={li.previously_drawn}
                            disabled
                            className="text-xs h-8 bg-gray-50"
                          />
                        </div>

                        {/* This Request */}
                        <div className="col-span-2">
                          {idx === 0 && <Label className="text-xs text-gray-500 mb-1 block">This Request *</Label>}
                          <Input
                            type="number"
                            min={0}
                            value={li.current_request}
                            onChange={(e) => updateLineItem(idx, 'current_request', e.target.value)}
                            className="text-xs h-8"
                          />
                        </div>

                        {/* % Complete */}
                        <div className="col-span-2">
                          {idx === 0 && <Label className="text-xs text-gray-500 mb-1 block">% Complete</Label>}
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={li.percent_complete}
                            onChange={(e) => updateLineItem(idx, 'percent_complete', e.target.value)}
                            className="text-xs h-8"
                          />
                        </div>

                        {/* Remove */}
                        <div className="col-span-1 flex justify-center">
                          <button
                            type="button"
                            onClick={() => removeLineItem(idx)}
                            className="p-1 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Line Items Summary */}
              {lineItems.length > 0 && (
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Requested:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(requestedTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-gray-500">Retainage ({form.retainage_percentage}%):</span>
                    <span className="text-amber-600">-{formatCurrency(retainageAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1 pt-1 border-t border-gray-200">
                    <span className="font-medium text-gray-700">Net Draw Amount:</span>
                    <span className="font-bold text-green-700">{formatCurrency(netAmount)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Supporting Documents */}
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
                      <FileText className="w-4 h-4 text-gray-400" />
                      <select
                        value={doc.document_type}
                        onChange={(e) => {
                          setDocuments(prev => prev.map((d, i) => i === idx ? { ...d, document_type: e.target.value } : d));
                        }}
                        className="text-xs border border-gray-200 rounded px-1.5 py-1"
                      >
                        <option value="invoice">Invoice</option>
                        <option value="lien_waiver">Lien Waiver</option>
                        <option value="inspection_report">Inspection Report</option>
                        <option value="photo">Progress Photo</option>
                        <option value="other">Other</option>
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
                <p className="text-xs text-gray-400">No documents attached. Add invoices, lien waivers, or photos.</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="draw-notes">Notes</Label>
              <textarea
                id="draw-notes"
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-[#2F855A] focus:border-transparent"
                rows={3}
                placeholder="Draw request notes..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              className="bg-[#2F855A] hover:bg-[#276749]"
              disabled={saving || lineItems.length === 0 || requestedTotal === 0}
            >
              {saving ? 'Creating...' : 'Create Draw Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DrawRequestForm;
