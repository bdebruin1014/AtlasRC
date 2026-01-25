// src/pages/projects/Budget/BudgetLineItems.jsx
// Editable table of budget line items grouped by category

import React, { useState } from 'react';
import { Plus, ChevronDown, ChevronRight, Trash2, Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useBudgetLineItems } from '@/hooks/useBudget';

const formatCurrency = (amount) => {
  if (amount == null) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};

const CATEGORY_ORDER = ['Land & Acquisition', 'Hard Costs', 'Soft Costs', 'Financing', 'Contingency'];

const BudgetLineItems = ({ budgetId, budget, project }) => {
  const { lineItems, loading, totals, addLineItem, editLineItem, removeLineItem } = useBudgetLineItems(budgetId);
  const [expandedCategories, setExpandedCategories] = useState(new Set(CATEGORY_ORDER));
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [showAddRow, setShowAddRow] = useState(null); // category name
  const [newItem, setNewItem] = useState({ line_item_name: '', budget_amount: '', line_item_code: '' });

  const isLocked = budget?.status === 'locked';

  const toggleCategory = (cat) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  // Group line items by category
  const grouped = {};
  lineItems.forEach(li => {
    const cat = li.category || 'Uncategorized';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(li);
  });

  // Sort categories
  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a);
    const ib = CATEGORY_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditValues({
      line_item_name: item.line_item_name,
      budget_amount: item.budget_amount || 0,
      actual_amount: item.actual_amount || 0,
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await editLineItem(editingId, {
      line_item_name: editValues.line_item_name,
      budget_amount: parseFloat(editValues.budget_amount) || 0,
      actual_amount: parseFloat(editValues.actual_amount) || 0,
    });
    setEditingId(null);
  };

  const handleAddItem = async (category) => {
    if (!newItem.line_item_name) return;
    await addLineItem({
      category,
      line_item_name: newItem.line_item_name,
      line_item_code: newItem.line_item_code,
      budget_amount: parseFloat(newItem.budget_amount) || 0,
      actual_amount: 0,
      committed_amount: 0,
      calculation_type: 'fixed',
      sort_order: (grouped[category]?.length || 0) + 1,
    });
    setNewItem({ line_item_name: '', budget_amount: '', line_item_code: '' });
    setShowAddRow(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F855A]" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">Line Items</h3>
        {!isLocked && (
          <Badge variant="outline" className="text-xs text-gray-500">
            {lineItems.length} items
          </Badge>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-16">Code</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase w-28">Budget</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase w-28">Actual</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase w-28">Variance</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase w-20">Source</th>
              {!isLocked && <th className="px-4 py-2 w-20" />}
            </tr>
          </thead>
          <tbody>
            {sortedCategories.map(category => {
              const items = grouped[category];
              const catTotals = totals.categories[category] || { budget: 0, actual: 0 };
              const isExpanded = expandedCategories.has(category);

              return (
                <React.Fragment key={category}>
                  {/* Category Header */}
                  <tr
                    className="bg-gray-50/80 cursor-pointer hover:bg-gray-100 border-t border-gray-200"
                    onClick={() => toggleCategory(category)}
                  >
                    <td colSpan={2} className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                        <span className="font-semibold text-gray-800">{category}</span>
                        <Badge variant="outline" className="text-[10px] ml-1">{items.length}</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold text-gray-800">{formatCurrency(catTotals.budget)}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-gray-800">{formatCurrency(catTotals.actual)}</td>
                    <td className={cn("px-4 py-2.5 text-right font-semibold", (catTotals.budget - catTotals.actual) >= 0 ? 'text-green-700' : 'text-red-700')}>
                      {formatCurrency(catTotals.budget - catTotals.actual)}
                    </td>
                    <td className="px-4 py-2.5" />
                    {!isLocked && <td className="px-4 py-2.5" />}
                  </tr>

                  {/* Line Items */}
                  {isExpanded && items.map(item => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      {editingId === item.id ? (
                        <>
                          <td className="px-4 py-1.5 text-xs text-gray-400">{item.line_item_code}</td>
                          <td className="px-4 py-1.5">
                            <Input value={editValues.line_item_name} onChange={(e) => setEditValues(prev => ({ ...prev, line_item_name: e.target.value }))} className="h-7 text-sm" />
                          </td>
                          <td className="px-4 py-1.5">
                            <Input type="number" value={editValues.budget_amount} onChange={(e) => setEditValues(prev => ({ ...prev, budget_amount: e.target.value }))} className="h-7 text-sm text-right" />
                          </td>
                          <td className="px-4 py-1.5">
                            <Input type="number" value={editValues.actual_amount} onChange={(e) => setEditValues(prev => ({ ...prev, actual_amount: e.target.value }))} className="h-7 text-sm text-right" />
                          </td>
                          <td className="px-4 py-1.5" />
                          <td className="px-4 py-1.5" />
                          <td className="px-4 py-1.5">
                            <div className="flex gap-1 justify-end">
                              <button onClick={saveEdit} className="p-1 text-green-600 hover:text-green-800"><Save className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-2 text-xs text-gray-400 font-mono">{item.line_item_code}</td>
                          <td className="px-4 py-2 text-gray-700">{item.line_item_name}</td>
                          <td className="px-4 py-2 text-right font-mono text-gray-800">{formatCurrency(item.budget_amount)}</td>
                          <td className="px-4 py-2 text-right font-mono text-gray-700">{formatCurrency(item.actual_amount)}</td>
                          <td className={cn("px-4 py-2 text-right font-mono", (item.budget_amount - item.actual_amount) >= 0 ? 'text-green-700' : 'text-red-600')}>
                            {formatCurrency((item.budget_amount || 0) - (item.actual_amount || 0))}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {item.is_from_plan && <Badge variant="outline" className="text-[9px] px-1">Plan</Badge>}
                            {item.is_from_template && <Badge variant="outline" className="text-[9px] px-1">Tmpl</Badge>}
                          </td>
                          {!isLocked && (
                            <td className="px-4 py-2">
                              <div className="flex gap-1 justify-end">
                                <button onClick={() => startEdit(item)} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 className="w-3.5 h-3.5" /></button>
                                <button onClick={() => removeLineItem(item.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </td>
                          )}
                        </>
                      )}
                    </tr>
                  ))}

                  {/* Add Row */}
                  {isExpanded && !isLocked && showAddRow === category && (
                    <tr className="border-b border-gray-100 bg-green-50/30">
                      <td className="px-4 py-1.5">
                        <Input value={newItem.line_item_code} onChange={(e) => setNewItem(prev => ({ ...prev, line_item_code: e.target.value }))} placeholder="Code" className="h-7 text-xs w-16" />
                      </td>
                      <td className="px-4 py-1.5">
                        <Input value={newItem.line_item_name} onChange={(e) => setNewItem(prev => ({ ...prev, line_item_name: e.target.value }))} placeholder="Line item description" className="h-7 text-sm" />
                      </td>
                      <td className="px-4 py-1.5">
                        <Input type="number" value={newItem.budget_amount} onChange={(e) => setNewItem(prev => ({ ...prev, budget_amount: e.target.value }))} placeholder="0" className="h-7 text-sm text-right" />
                      </td>
                      <td colSpan={2} className="px-4 py-1.5" />
                      <td className="px-4 py-1.5" />
                      <td className="px-4 py-1.5">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => handleAddItem(category)} className="p-1 text-green-600 hover:text-green-800"><Save className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setShowAddRow(null)} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Add button for category */}
                  {isExpanded && !isLocked && showAddRow !== category && (
                    <tr className="border-b border-gray-100">
                      <td colSpan={7} className="px-4 py-1.5">
                        <button
                          onClick={() => setShowAddRow(category)}
                          className="text-xs text-[#2F855A] hover:text-[#276749] flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add line item
                        </button>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {/* Grand Total */}
            <tr className="bg-gray-100 border-t-2 border-gray-300">
              <td colSpan={2} className="px-4 py-3 font-bold text-gray-900">TOTAL</td>
              <td className="px-4 py-3 text-right font-bold text-gray-900">{formatCurrency(totals.totalBudget)}</td>
              <td className="px-4 py-3 text-right font-bold text-gray-900">{formatCurrency(totals.totalActual)}</td>
              <td className={cn("px-4 py-3 text-right font-bold", totals.totalVariance >= 0 ? 'text-green-700' : 'text-red-700')}>
                {formatCurrency(totals.totalVariance)}
              </td>
              <td className="px-4 py-3" />
              {!isLocked && <td className="px-4 py-3" />}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BudgetLineItems;
