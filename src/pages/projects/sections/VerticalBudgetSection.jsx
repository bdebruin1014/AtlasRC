import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, Download, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';

const defaultCategories = [
  { id: 1, category: 'Foundation',                budget: 540000,  actual: 528000 },
  { id: 2, category: 'Framing',                   budget: 720000,  actual: 695000 },
  { id: 3, category: 'Roofing',                   budget: 360000,  actual: 372000 },
  { id: 4, category: 'MEP (Mechanical/Electrical/Plumbing)', budget: 648000, actual: 210000 },
  { id: 5, category: 'Insulation & Drywall',      budget: 432000,  actual: 85000 },
  { id: 6, category: 'Interior Finishes',         budget: 756000,  actual: 0 },
  { id: 7, category: 'Exterior',                  budget: 396000,  actual: 0 },
  { id: 8, category: 'Landscaping',               budget: 288000,  actual: 0 },
  { id: 9, category: 'Permits & Fees',            budget: 180000,  actual: 0 },
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function VerticalBudgetSection({ projectId }) {
  const [categories] = useState(defaultCategories);

  const totalBudget = categories.reduce((sum, c) => sum + c.budget, 0);
  const totalActual = categories.reduce((sum, c) => sum + c.actual, 0);
  const totalRemaining = totalBudget - totalActual;
  const avgCostPerHouse = Math.round(totalBudget / 24);

  const kpis = [
    { label: 'Total Vertical Budget', value: formatCurrency(totalBudget), color: 'text-gray-900' },
    { label: 'Spent to Date', value: formatCurrency(totalActual), color: 'text-blue-600' },
    { label: 'Remaining', value: formatCurrency(totalRemaining), color: 'text-[#047857]' },
    { label: 'Avg Cost / House', value: formatCurrency(avgCostPerHouse), color: 'text-gray-900' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-[#047857]" />
          Vertical Budget
        </h2>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Budget
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-500">{kpi.label}</p>
            <p className={`text-2xl font-semibold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Overall Progress */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">Overall Budget Utilization</p>
          <p className="text-sm text-gray-500">
            {totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0}% used
          </p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="h-3 rounded-full bg-[#047857] transition-all"
            style={{ width: `${totalBudget > 0 ? Math.min((totalActual / totalBudget) * 100, 100) : 0}%` }}
          />
        </div>
      </div>

      {/* Budget Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="text-xs text-gray-500 uppercase border-b bg-gray-50">
            <tr>
              <th className="text-left p-3">Category</th>
              <th className="text-right p-3">Budget</th>
              <th className="text-right p-3">Actual</th>
              <th className="text-right p-3">Variance</th>
              <th className="text-right p-3">% Used</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((item) => {
              const variance = item.budget - item.actual;
              const pctUsed = item.budget > 0 ? Math.round((item.actual / item.budget) * 100) : 0;
              const isOverBudget = variance < 0;

              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">{item.category}</td>
                  <td className="p-3 text-right text-gray-700">{formatCurrency(item.budget)}</td>
                  <td className="p-3 text-right text-gray-700">{formatCurrency(item.actual)}</td>
                  <td className={`p-3 text-right font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                    <span className="flex items-center justify-end gap-1">
                      {isOverBudget ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {isOverBudget ? '-' : '+'}{formatCurrency(Math.abs(variance))}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            pctUsed > 100
                              ? 'bg-red-500'
                              : pctUsed > 75
                              ? 'bg-amber-500'
                              : 'bg-[#047857]'
                          }`}
                          style={{ width: `${Math.min(pctUsed, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">{pctUsed}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t-2 bg-gray-50 font-semibold">
            <tr>
              <td className="p-3 text-gray-900">Total</td>
              <td className="p-3 text-right text-gray-900">{formatCurrency(totalBudget)}</td>
              <td className="p-3 text-right text-gray-900">{formatCurrency(totalActual)}</td>
              <td className={`p-3 text-right ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalRemaining >= 0 ? '+' : '-'}{formatCurrency(Math.abs(totalRemaining))}
              </td>
              <td className="p-3 text-right text-gray-900">
                {totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0}%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
