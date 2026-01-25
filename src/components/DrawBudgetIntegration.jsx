// src/components/DrawBudgetIntegration.jsx
// Draw Request to Budget integration component
// Links draw request line items to budget line items for tracking and reconciliation

import { useState, useMemo, useEffect } from 'react';
import {
  Link2, Unlink, DollarSign, AlertTriangle, CheckCircle,
  ChevronDown, ChevronUp, Search, Plus, X, Info,
  ArrowRight, Landmark, FileText, TrendingUp, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const formatPercent = (value) => `${(value || 0).toFixed(1)}%`;

// ============================================
// DEMO DATA
// ============================================

const DEMO_BUDGET_ITEMS = [
  { id: 'bl-1', code: '01-100', name: 'Site Work', budgeted: 125000, committed: 95000, spent: 78000, available: 47000 },
  { id: 'bl-2', code: '01-200', name: 'Foundations', budgeted: 285000, committed: 260000, spent: 185000, available: 25000 },
  { id: 'bl-3', code: '01-300', name: 'Framing', budgeted: 420000, committed: 380000, spent: 225000, available: 40000 },
  { id: 'bl-4', code: '01-400', name: 'Roofing', budgeted: 95000, committed: 85000, spent: 42000, available: 10000 },
  { id: 'bl-5', code: '01-500', name: 'Plumbing', budgeted: 165000, committed: 155000, spent: 98000, available: 10000 },
  { id: 'bl-6', code: '01-600', name: 'Electrical', budgeted: 185000, committed: 170000, spent: 112000, available: 15000 },
  { id: 'bl-7', code: '01-700', name: 'HVAC', budgeted: 145000, committed: 140000, spent: 95000, available: 5000 },
  { id: 'bl-8', code: '01-800', name: 'Drywall', budgeted: 78000, committed: 65000, spent: 32000, available: 13000 },
  { id: 'bl-9', code: '01-900', name: 'Finishes', budgeted: 195000, committed: 120000, spent: 45000, available: 75000 },
  { id: 'bl-10', code: '02-100', name: 'Soft Costs', budgeted: 85000, committed: 72000, spent: 58000, available: 13000 },
];

// ============================================
// BUDGET LINE ITEM SELECTOR
// ============================================

function BudgetLineItemSelector({ budgetItems, selectedItems, onSelect, onDeselect }) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(true);

  const filteredItems = useMemo(() => {
    if (!search) return budgetItems;
    const searchLower = search.toLowerCase();
    return budgetItems.filter(
      (item) =>
        item.name.toLowerCase().includes(searchLower) ||
        item.code.toLowerCase().includes(searchLower)
    );
  }, [budgetItems, search]);

  const selectedIds = selectedItems.map((i) => i.budgetLineId);

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Search */}
      <div className="p-3 border-b bg-gray-50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search budget line items..."
            className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Items List */}
      <div className="max-h-[300px] overflow-y-auto divide-y">
        {filteredItems.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          const utilizationPercent = (item.spent / item.budgeted) * 100;
          const isOverBudget = utilizationPercent > 100;
          const isNearLimit = utilizationPercent > 80;

          return (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-3 p-3 cursor-pointer transition-colors',
                isSelected ? 'bg-emerald-50' : 'hover:bg-gray-50'
              )}
              onClick={() => (isSelected ? onDeselect(item.id) : onSelect(item))}
            >
              {/* Checkbox */}
              <div
                className={cn(
                  'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0',
                  isSelected
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-gray-300 hover:border-emerald-500'
                )}
              >
                {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
              </div>

              {/* Item Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-500">{item.code}</span>
                  <span className="font-medium text-gray-900 truncate">{item.name}</span>
                  {isOverBudget && (
                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  )}
                  {!isOverBudget && isNearLimit && (
                    <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  <span>Budget: {formatCurrency(item.budgeted)}</span>
                  <span>Spent: {formatCurrency(item.spent)}</span>
                  <span
                    className={cn(
                      'font-medium',
                      isOverBudget
                        ? 'text-red-600'
                        : isNearLimit
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    )}
                  >
                    Available: {formatCurrency(item.available)}
                  </span>
                </div>
              </div>

              {/* Utilization */}
              <div className="w-20 text-right">
                <span
                  className={cn(
                    'text-sm font-medium',
                    isOverBudget ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-gray-600'
                  )}
                >
                  {formatPercent(utilizationPercent)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// DRAW LINE ITEM ENTRY
// ============================================

function DrawLineItemEntry({
  item,
  budgetItems,
  onUpdate,
  onRemove,
  onLinkBudget,
  onUnlinkBudget,
}) {
  const [showBudgetSelector, setShowBudgetSelector] = useState(false);

  const linkedBudgetItem = budgetItems.find((b) => b.id === item.budgetLineId);

  const exceedsAvailable = linkedBudgetItem && item.amount > linkedBudgetItem.available;

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-start gap-4">
        {/* Description */}
        <div className="flex-1">
          <input
            type="text"
            value={item.description}
            onChange={(e) => onUpdate({ ...item, description: e.target.value })}
            placeholder="Description"
            className="w-full font-medium text-gray-900 border-0 border-b border-transparent focus:border-gray-300 focus:ring-0 px-0 py-1"
          />

          {/* Linked Budget Item */}
          {linkedBudgetItem ? (
            <div className="flex items-center gap-2 mt-2">
              <Link2 className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-gray-600">
                Linked to: <span className="font-medium">{linkedBudgetItem.code}</span> -{' '}
                {linkedBudgetItem.name}
              </span>
              <span className="text-xs text-gray-400">
                ({formatCurrency(linkedBudgetItem.available)} available)
              </span>
              <button
                onClick={() => onUnlinkBudget(item.id)}
                className="p-1 text-gray-400 hover:text-red-500"
                title="Unlink from budget"
              >
                <Unlink className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowBudgetSelector(true)}
              className="flex items-center gap-2 mt-2 text-sm text-gray-500 hover:text-emerald-600"
            >
              <Plus className="h-4 w-4" />
              Link to budget line item
            </button>
          )}

          {/* Warning if exceeds available */}
          {exceedsAvailable && (
            <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
              <AlertTriangle className="h-4 w-4" />
              Amount exceeds available budget by {formatCurrency(item.amount - linkedBudgetItem.available)}
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="w-32">
          <label className="text-xs text-gray-500">Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number"
              value={item.amount || ''}
              onChange={(e) => onUpdate({ ...item, amount: parseFloat(e.target.value) || 0 })}
              className={cn(
                'w-full pl-7 pr-3 py-2 text-right font-mono border rounded-lg focus:outline-none focus:ring-2',
                exceedsAvailable
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-emerald-500'
              )}
              placeholder="0"
            />
          </div>
        </div>

        {/* Remove */}
        <button
          onClick={() => onRemove(item.id)}
          className="p-2 text-gray-400 hover:text-red-500 mt-4"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Budget Selector Modal */}
      {showBudgetSelector && (
        <div className="mt-4 p-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <p className="font-medium text-gray-900">Select Budget Line Item</p>
            <button
              onClick={() => setShowBudgetSelector(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {budgetItems.map((budgetItem) => {
              const utilizationPercent = (budgetItem.spent / budgetItem.budgeted) * 100;
              const isNearLimit = utilizationPercent > 80;

              return (
                <button
                  key={budgetItem.id}
                  onClick={() => {
                    onLinkBudget(item.id, budgetItem.id);
                    setShowBudgetSelector(false);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 text-left"
                >
                  <div>
                    <span className="text-xs font-mono text-gray-500">{budgetItem.code}</span>
                    <span className="ml-2 font-medium text-gray-900">{budgetItem.name}</span>
                  </div>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isNearLimit ? 'text-amber-600' : 'text-emerald-600'
                    )}
                  >
                    {formatCurrency(budgetItem.available)} avail.
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// BUDGET IMPACT SUMMARY
// ============================================

function BudgetImpactSummary({ drawItems, budgetItems }) {
  const impact = useMemo(() => {
    const impactByBudget = {};

    drawItems.forEach((item) => {
      if (item.budgetLineId && item.amount) {
        if (!impactByBudget[item.budgetLineId]) {
          impactByBudget[item.budgetLineId] = {
            budgetItem: budgetItems.find((b) => b.id === item.budgetLineId),
            totalDrawAmount: 0,
            drawItems: [],
          };
        }
        impactByBudget[item.budgetLineId].totalDrawAmount += item.amount;
        impactByBudget[item.budgetLineId].drawItems.push(item);
      }
    });

    return Object.values(impactByBudget);
  }, [drawItems, budgetItems]);

  const totalDrawAmount = drawItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const linkedAmount = impact.reduce((sum, i) => sum + i.totalDrawAmount, 0);
  const unlinkedAmount = totalDrawAmount - linkedAmount;

  const hasOverages = impact.some((i) => i.totalDrawAmount > i.budgetItem?.available);

  return (
    <div className="bg-gray-50 rounded-lg p-4 border">
      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4" />
        Budget Impact Summary
      </h4>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-white rounded-lg border">
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalDrawAmount)}</p>
          <p className="text-xs text-gray-500">Total Draw</p>
        </div>
        <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
          <p className="text-2xl font-bold text-emerald-700">{formatCurrency(linkedAmount)}</p>
          <p className="text-xs text-emerald-600">Linked to Budget</p>
        </div>
        <div
          className={cn(
            'text-center p-3 rounded-lg border',
            unlinkedAmount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'
          )}
        >
          <p className={cn('text-2xl font-bold', unlinkedAmount > 0 ? 'text-amber-700' : 'text-gray-400')}>
            {formatCurrency(unlinkedAmount)}
          </p>
          <p className={cn('text-xs', unlinkedAmount > 0 ? 'text-amber-600' : 'text-gray-500')}>
            Unlinked
          </p>
        </div>
      </div>

      {/* Impact by Budget Line */}
      {impact.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Impact by Budget Line:</p>
          {impact.map((i) => {
            const newSpent = (i.budgetItem?.spent || 0) + i.totalDrawAmount;
            const newPercent = (newSpent / i.budgetItem?.budgeted) * 100;
            const exceedsAvailable = i.totalDrawAmount > i.budgetItem?.available;

            return (
              <div
                key={i.budgetItem?.id}
                className={cn(
                  'flex items-center justify-between p-2 rounded-lg',
                  exceedsAvailable ? 'bg-red-50' : 'bg-white'
                )}
              >
                <div className="flex items-center gap-2">
                  {exceedsAvailable ? (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  )}
                  <span className="text-sm font-medium">{i.budgetItem?.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-500">
                    {formatPercent((i.budgetItem?.spent / i.budgetItem?.budgeted) * 100)}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <span
                    className={cn(
                      'font-medium',
                      exceedsAvailable
                        ? 'text-red-600'
                        : newPercent > 90
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    )}
                  >
                    {formatPercent(newPercent)}
                  </span>
                  <span className="text-gray-600">(+{formatCurrency(i.totalDrawAmount)})</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Warnings */}
      {hasOverages && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Budget Overage Warning</p>
              <p className="text-sm text-red-600 mt-1">
                One or more line items exceed available budget. Consider adjusting amounts or
                reallocating budget before submitting.
              </p>
            </div>
          </div>
        </div>
      )}

      {unlinkedAmount > 0 && (
        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Unlinked Line Items</p>
              <p className="text-sm text-amber-600 mt-1">
                {formatCurrency(unlinkedAmount)} is not linked to any budget line item. Link all
                items for accurate budget tracking.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function DrawBudgetIntegration({
  projectId,
  drawRequestId,
  budgetItems = DEMO_BUDGET_ITEMS,
  initialDrawItems = [],
  onSave,
  onCancel,
}) {
  const [drawItems, setDrawItems] = useState(
    initialDrawItems.length > 0
      ? initialDrawItems
      : [{ id: 'new-1', description: '', amount: 0, budgetLineId: null }]
  );

  // Add new draw line item
  const handleAddItem = () => {
    setDrawItems((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, description: '', amount: 0, budgetLineId: null },
    ]);
  };

  // Update draw line item
  const handleUpdateItem = (updatedItem) => {
    setDrawItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
  };

  // Remove draw line item
  const handleRemoveItem = (itemId) => {
    setDrawItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Link to budget
  const handleLinkBudget = (drawItemId, budgetLineId) => {
    setDrawItems((prev) =>
      prev.map((item) => (item.id === drawItemId ? { ...item, budgetLineId } : item))
    );
  };

  // Unlink from budget
  const handleUnlinkBudget = (drawItemId) => {
    setDrawItems((prev) =>
      prev.map((item) => (item.id === drawItemId ? { ...item, budgetLineId: null } : item))
    );
  };

  // Calculate totals
  const totalAmount = drawItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const linkedCount = drawItems.filter((item) => item.budgetLineId).length;

  // Handle save
  const handleSave = () => {
    if (onSave) {
      onSave(drawItems);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Draw Request Line Items</h3>
          <p className="text-sm text-gray-500">
            Link each line item to a budget category for accurate tracking
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-500">
            {linkedCount} of {drawItems.length} linked
          </span>
          <span className="font-semibold text-gray-900">Total: {formatCurrency(totalAmount)}</span>
        </div>
      </div>

      {/* Draw Line Items */}
      <div className="space-y-3">
        {drawItems.map((item) => (
          <DrawLineItemEntry
            key={item.id}
            item={item}
            budgetItems={budgetItems}
            onUpdate={handleUpdateItem}
            onRemove={handleRemoveItem}
            onLinkBudget={handleLinkBudget}
            onUnlinkBudget={handleUnlinkBudget}
          />
        ))}

        <Button variant="outline" onClick={handleAddItem} className="w-full border-dashed">
          <Plus className="h-4 w-4 mr-2" />
          Add Line Item
        </Button>
      </div>

      {/* Budget Impact Summary */}
      <BudgetImpactSummary drawItems={drawItems} budgetItems={budgetItems} />

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button onClick={handleSave} className="bg-[#2F855A] hover:bg-[#276749] text-white">
          <Landmark className="h-4 w-4 mr-2" />
          Save Draw Request
        </Button>
      </div>
    </div>
  );
}

// ============================================
// COMPACT BUDGET LINK INDICATOR
// ============================================

export function DrawBudgetLinkStatus({ drawItems, budgetItems }) {
  const linkedCount = drawItems.filter((item) => item.budgetLineId).length;
  const totalCount = drawItems.length;
  const allLinked = linkedCount === totalCount && totalCount > 0;

  const hasOverages = drawItems.some((item) => {
    if (!item.budgetLineId || !item.amount) return false;
    const budgetItem = budgetItems.find((b) => b.id === item.budgetLineId);
    return budgetItem && item.amount > budgetItem.available;
  });

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
        hasOverages
          ? 'bg-red-100 text-red-700'
          : allLinked
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-amber-100 text-amber-700'
      )}
    >
      {hasOverages ? (
        <>
          <AlertCircle className="h-4 w-4" />
          Budget Overage
        </>
      ) : allLinked ? (
        <>
          <Link2 className="h-4 w-4" />
          All Linked
        </>
      ) : (
        <>
          <AlertTriangle className="h-4 w-4" />
          {linkedCount}/{totalCount} Linked
        </>
      )}
    </div>
  );
}
