// src/pages/projects/Budget/BudgetSummary.jsx
// Sidebar summary showing totals by category and overall metrics

import React from 'react';
import { DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBudgetLineItems } from '@/hooks/useBudget';

const formatCurrency = (amount) => {
  if (!amount) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};

const BudgetSummary = ({ budgetId }) => {
  const { lineItems, totals } = useBudgetLineItems(budgetId);

  const overBudgetItems = lineItems.filter(li => (li.actual_amount || 0) > (li.budget_amount || 0));

  return (
    <div className="space-y-4">
      {/* Overall Totals */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Budget Summary</h4>
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600 font-medium">Total Budget</p>
            <p className="text-lg font-bold text-blue-800">{formatCurrency(totals.totalBudget)}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 font-medium">Total Actual</p>
            <p className="text-lg font-bold text-gray-800">{formatCurrency(totals.totalActual)}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg">
            <p className="text-xs text-emerald-600 font-medium">Committed</p>
            <p className="text-lg font-bold text-emerald-800">{formatCurrency(totals.totalCommitted)}</p>
          </div>
          <div className={cn("p-3 rounded-lg", totals.totalVariance >= 0 ? "bg-green-50" : "bg-red-50")}>
            <p className={cn("text-xs font-medium", totals.totalVariance >= 0 ? "text-green-600" : "text-red-600")}>
              Variance
            </p>
            <p className={cn("text-lg font-bold", totals.totalVariance >= 0 ? "text-green-800" : "text-red-800")}>
              {formatCurrency(totals.totalVariance)}
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Budget Progress</h4>
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Used</span>
            <span>{totals.percentUsed.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all",
                totals.percentUsed > 100 ? "bg-red-500" :
                totals.percentUsed > 90 ? "bg-amber-500" :
                "bg-[#2F855A]"
              )}
              style={{ width: `${Math.min(totals.percentUsed, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">By Category</h4>
        <div className="space-y-2">
          {Object.entries(totals.categories).map(([cat, data]) => {
            const pct = data.budget > 0 ? ((data.actual / data.budget) * 100).toFixed(0) : 0;
            return (
              <div key={cat} className="flex items-center justify-between text-xs">
                <span className="text-gray-600 truncate max-w-[120px]" title={cat}>{cat}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", pct > 100 ? "bg-red-500" : "bg-[#2F855A]")}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <span className="font-mono text-gray-700 w-8 text-right">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Over Budget Alerts */}
      {overBudgetItems.length > 0 && (
        <div className="bg-white rounded-lg border border-red-200 shadow-sm p-4">
          <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            Over Budget ({overBudgetItems.length})
          </h4>
          <div className="space-y-1.5">
            {overBudgetItems.slice(0, 5).map(item => (
              <div key={item.id} className="text-xs flex justify-between">
                <span className="text-gray-700 truncate max-w-[140px]">{item.line_item_name}</span>
                <span className="text-red-600 font-mono">
                  +{formatCurrency((item.actual_amount || 0) - (item.budget_amount || 0))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetSummary;
