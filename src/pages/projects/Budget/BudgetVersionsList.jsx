// src/pages/projects/Budget/BudgetVersionsList.jsx
// List of all budget versions for a project with star/active management

import React from 'react';
import { Star, Plus, Edit2, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useBudgetActions } from '@/hooks/useBudget';

const formatCurrency = (amount) => {
  if (!amount) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const BudgetVersionsList = ({ projectId, budgets, activeBudgetId, loading, onActiveChanged, onCreateNew }) => {
  const { setActive, remove, saving } = useBudgetActions(projectId);

  const handleSetActive = async (budgetId) => {
    await setActive(budgetId);
    onActiveChanged?.();
  };

  const handleDelete = async (budgetId) => {
    if (!confirm('Delete this budget version? This cannot be undone.')) return;
    await remove(budgetId);
    onActiveChanged?.();
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
        <h3 className="text-lg font-semibold text-gray-900">Project Budgets</h3>
        <Button className="bg-[#2F855A] hover:bg-[#276749]" size="sm" onClick={onCreateNew}>
          <Plus className="w-4 h-4 mr-2" /> Create New Budget
        </Button>
      </div>

      {budgets.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p className="mb-4">No budgets created yet.</p>
          <Button variant="outline" onClick={onCreateNew}>Create First Budget</Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-14">Active</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan Name</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Budget Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {budgets.map(budget => (
                <tr key={budget.id} className={cn("hover:bg-gray-50", budget.is_active && "bg-yellow-50/30")}>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleSetActive(budget.id)}
                      disabled={saving || budget.is_active}
                      className={cn(
                        "p-1 rounded transition-colors",
                        budget.is_active
                          ? "text-yellow-500 cursor-default"
                          : "text-gray-300 hover:text-yellow-400"
                      )}
                      title={budget.is_active ? "Active budget" : "Set as active"}
                    >
                      <Star className={cn("w-5 h-5", budget.is_active && "fill-current")} />
                    </button>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{budget.budget_name}</td>
                  <td className="px-4 py-3 text-gray-600">{budget.plan_name || '—'}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-800">{formatCurrency(budget.total_budget)}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(budget.created_at)}</td>
                  <td className="px-4 py-3 text-gray-600">{budget.created_by_name || '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={cn(
                      "text-xs",
                      budget.status === 'approved' ? 'border-green-300 text-green-700' :
                      budget.status === 'locked' ? 'border-gray-300 text-gray-600' :
                      'border-blue-300 text-blue-700'
                    )}>
                      {budget.status?.charAt(0).toUpperCase() + budget.status?.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1 text-gray-400 hover:text-blue-600" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-blue-600" title="Duplicate">
                        <Copy className="w-4 h-4" />
                      </button>
                      {!budget.is_active && (
                        <button onClick={() => handleDelete(budget.id)} className="p-1 text-gray-400 hover:text-red-600" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BudgetVersionsList;
