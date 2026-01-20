import React, { useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, DollarSign, Percent, Download, Filter, ChevronDown, ChevronRight, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const ActualsVsBudgetPage = ({ projectId }) => {
  const [expandedCategories, setExpandedCategories] = useState(['hard-costs', 'soft-costs']);
  const [viewMode, setViewMode] = useState('detailed'); // 'detailed' or 'summary'
  const [showVarianceOnly, setShowVarianceOnly] = useState(false);

  const budgetData = {
    asOfDate: '2024-12-28',
    projectCompletion: 68,
    
    categories: [
      {
        id: 'land',
        name: 'Land & Acquisition',
        items: [
          { code: '01-100', name: 'Land Purchase', budget: 2500000, committed: 2500000, actual: 2500000, projected: 2500000 },
          { code: '01-200', name: 'Closing Costs', budget: 75000, committed: 75000, actual: 72450, projected: 72450 },
          { code: '01-300', name: 'Due Diligence', budget: 25000, committed: 24500, actual: 24500, projected: 24500 },
          { code: '01-400', name: 'Carrying Costs', budget: 45000, committed: 32000, actual: 28000, projected: 42000 },
        ]
      },
      {
        id: 'hard-costs',
        name: 'Hard Costs',
        items: [
          { code: '02-100', name: 'Site Work', budget: 450000, committed: 445000, actual: 438500, projected: 445000 },
          { code: '02-200', name: 'Foundation', budget: 380000, committed: 392000, actual: 392000, projected: 392000 },
          { code: '02-300', name: 'Framing', budget: 720000, committed: 715000, actual: 542000, projected: 728000 },
          { code: '02-400', name: 'Roofing', budget: 185000, committed: 182000, actual: 45000, projected: 182000 },
          { code: '02-500', name: 'Plumbing', budget: 195000, committed: 195000, actual: 98000, projected: 198000 },
          { code: '02-600', name: 'Electrical', budget: 210000, committed: 218000, actual: 112000, projected: 224000 },
          { code: '02-700', name: 'HVAC', budget: 245000, committed: 245000, actual: 78000, projected: 245000 },
          { code: '02-800', name: 'Insulation', budget: 85000, committed: 82000, actual: 0, projected: 82000 },
          { code: '02-900', name: 'Drywall', budget: 165000, committed: 0, actual: 0, projected: 168000 },
          { code: '02-1000', name: 'Interior Finishes', budget: 320000, committed: 45000, actual: 12000, projected: 325000 },
          { code: '02-1100', name: 'Exterior Finishes', budget: 195000, committed: 88000, actual: 22000, projected: 195000 },
          { code: '02-1200', name: 'Landscaping', budget: 180000, committed: 0, actual: 0, projected: 180000 },
          { code: '02-1300', name: 'Contingency', budget: 328000, committed: 85000, actual: 85000, projected: 165000 },
        ]
      },
      {
        id: 'soft-costs',
        name: 'Soft Costs',
        items: [
          { code: '03-100', name: 'Architecture', budget: 185000, committed: 185000, actual: 185000, projected: 185000 },
          { code: '03-200', name: 'Engineering', budget: 95000, committed: 95000, actual: 95000, projected: 95000 },
          { code: '03-300', name: 'Permits & Fees', budget: 120000, committed: 118500, actual: 118500, projected: 118500 },
          { code: '03-400', name: 'Insurance', budget: 85000, committed: 85000, actual: 62000, projected: 85000 },
          { code: '03-500', name: 'Legal', budget: 45000, committed: 38000, actual: 32000, projected: 45000 },
          { code: '03-600', name: 'Marketing', budget: 125000, committed: 45000, actual: 28000, projected: 125000 },
          { code: '03-700', name: 'Realtor Commissions', budget: 488400, committed: 0, actual: 0, projected: 488400 },
          { code: '03-800', name: 'Miscellaneous', budget: 75000, committed: 42000, actual: 35000, projected: 72000 },
        ]
      },
      {
        id: 'financing',
        name: 'Financing Costs',
        items: [
          { code: '04-100', name: 'Loan Origination', budget: 58000, committed: 58000, actual: 58000, projected: 58000 },
          { code: '04-200', name: 'Interest Reserve', budget: 450000, committed: 285000, actual: 285000, projected: 420000 },
          { code: '04-300', name: 'Loan Fees', budget: 12000, committed: 12000, actual: 12000, projected: 12000 },
        ]
      },
    ]
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) ? prev.filter(c => c !== categoryId) : [...prev, categoryId]
    );
  };

  // Calculate totals
  const calculateCategoryTotals = (category) => {
    return category.items.reduce((acc, item) => ({
      budget: acc.budget + item.budget,
      committed: acc.committed + item.committed,
      actual: acc.actual + item.actual,
      projected: acc.projected + item.projected,
    }), { budget: 0, committed: 0, actual: 0, projected: 0 });
  };

  const grandTotals = budgetData.categories.reduce((acc, cat) => {
    const catTotals = calculateCategoryTotals(cat);
    return {
      budget: acc.budget + catTotals.budget,
      committed: acc.committed + catTotals.committed,
      actual: acc.actual + catTotals.actual,
      projected: acc.projected + catTotals.projected,
    };
  }, { budget: 0, committed: 0, actual: 0, projected: 0 });

  const totalVariance = grandTotals.projected - grandTotals.budget;
  const variancePercent = (totalVariance / grandTotals.budget) * 100;
  const remainingBudget = grandTotals.budget - grandTotals.actual;
  const percentSpent = (grandTotals.actual / grandTotals.budget) * 100;

  const getVarianceColor = (projected, budget) => {
    const variance = projected - budget;
    const pct = (variance / budget) * 100;
    if (pct > 5) return 'text-red-600';
    if (pct > 0) return 'text-amber-600';
    if (pct < -2) return 'text-green-600';
    return 'text-gray-600';
  };

  const getVarianceIcon = (projected, budget) => {
    const variance = projected - budget;
    if (variance > 0) return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (variance < 0) return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <CheckCircle className="w-4 h-4 text-gray-400" />;
  };

  const formatCurrency = (value) => {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  const formatVariance = (variance) => {
    const prefix = variance > 0 ? '+' : '';
    return `${prefix}${formatCurrency(variance)}`;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Actuals vs Budget</h1>
          <p className="text-sm text-gray-500">As of {budgetData.asOfDate} • {budgetData.projectCompletion}% Complete</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Original Budget</p>
          <p className="text-xl font-semibold">{formatCurrency(grandTotals.budget)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Committed</p>
          <p className="text-xl font-semibold">{formatCurrency(grandTotals.committed)}</p>
          <p className="text-xs text-gray-400">{((grandTotals.committed / grandTotals.budget) * 100).toFixed(0)}% of budget</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-xs text-gray-500">Actual Spent</p>
          <p className="text-xl font-semibold text-blue-600">{formatCurrency(grandTotals.actual)}</p>
          <p className="text-xs text-gray-400">{percentSpent.toFixed(0)}% of budget</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Remaining</p>
          <p className="text-xl font-semibold">{formatCurrency(remainingBudget)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-purple-500">
          <p className="text-xs text-gray-500">Projected Final</p>
          <p className="text-xl font-semibold text-purple-600">{formatCurrency(grandTotals.projected)}</p>
        </div>
        <div className={cn("bg-white border rounded-lg p-4 border-l-4", totalVariance > 0 ? "border-l-red-500" : "border-l-green-500")}>
          <p className="text-xs text-gray-500">Variance</p>
          <p className={cn("text-xl font-semibold", totalVariance > 0 ? "text-red-600" : "text-green-600")}>
            {formatVariance(totalVariance)}
          </p>
          <p className={cn("text-xs", totalVariance > 0 ? "text-red-500" : "text-green-500")}>
            {variancePercent > 0 ? '+' : ''}{variancePercent.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Budget Progress Bar */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Budget Utilization</span>
          <span className="text-sm text-gray-500">{formatCurrency(grandTotals.actual)} of {formatCurrency(grandTotals.budget)}</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-blue-500" 
            style={{ width: `${Math.min(percentSpent, 100)}%` }}
            title={`Actual: ${formatCurrency(grandTotals.actual)}`}
          ></div>
          <div 
            className="h-full bg-blue-200" 
            style={{ width: `${Math.max(0, Math.min(((grandTotals.committed - grandTotals.actual) / grandTotals.budget) * 100, 100 - percentSpent))}%` }}
            title={`Committed: ${formatCurrency(grandTotals.committed - grandTotals.actual)}`}
          ></div>
        </div>
        <div className="flex gap-4 mt-2 text-xs">
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded"></div>Actual Spent</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-200 rounded"></div>Committed (Not Paid)</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-200 rounded"></div>Remaining</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode('detailed')} 
              className={cn("px-3 py-1.5 rounded text-sm", viewMode === 'detailed' ? "bg-[#047857] text-white" : "bg-gray-100")}
            >
              Detailed View
            </button>
            <button 
              onClick={() => setViewMode('summary')} 
              className={cn("px-3 py-1.5 rounded text-sm", viewMode === 'summary' ? "bg-[#047857] text-white" : "bg-gray-100")}
            >
              Summary View
            </button>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input 
              type="checkbox" 
              checked={showVarianceOnly} 
              onChange={(e) => setShowVarianceOnly(e.target.checked)}
              className="rounded"
            />
            Show variances only
          </label>
        </div>
      </div>

      {/* Budget Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Code</th>
              <th className="text-left px-4 py-3 font-medium">Description</th>
              <th className="text-right px-4 py-3 font-medium">Budget</th>
              <th className="text-right px-4 py-3 font-medium">Committed</th>
              <th className="text-right px-4 py-3 font-medium">Actual</th>
              <th className="text-right px-4 py-3 font-medium">Projected</th>
              <th className="text-right px-4 py-3 font-medium">Variance</th>
              <th className="text-right px-4 py-3 font-medium">%</th>
              <th className="w-10 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {budgetData.categories.map((category) => {
              const catTotals = calculateCategoryTotals(category);
              const catVariance = catTotals.projected - catTotals.budget;
              const catVariancePct = (catVariance / catTotals.budget) * 100;

              const filteredItems = showVarianceOnly 
                ? category.items.filter(item => Math.abs(item.projected - item.budget) > 0)
                : category.items;

              if (showVarianceOnly && filteredItems.length === 0) return null;

              return (
                <React.Fragment key={category.id}>
                  {/* Category Row */}
                  <tr 
                    className="bg-gray-100 cursor-pointer hover:bg-gray-200 font-medium"
                    onClick={() => toggleCategory(category.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {expandedCategories.includes(category.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </td>
                    <td className="px-4 py-3">{category.name}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(catTotals.budget)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(catTotals.committed)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(catTotals.actual)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(catTotals.projected)}</td>
                    <td className={cn("px-4 py-3 text-right", getVarianceColor(catTotals.projected, catTotals.budget))}>
                      {formatVariance(catVariance)}
                    </td>
                    <td className={cn("px-4 py-3 text-right", getVarianceColor(catTotals.projected, catTotals.budget))}>
                      {catVariancePct > 0 ? '+' : ''}{catVariancePct.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3">{getVarianceIcon(catTotals.projected, catTotals.budget)}</td>
                  </tr>

                  {/* Line Items */}
                  {expandedCategories.includes(category.id) && viewMode === 'detailed' && filteredItems.map((item) => {
                    const variance = item.projected - item.budget;
                    const variancePct = (variance / item.budget) * 100;

                    return (
                      <tr key={item.code} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 pl-10 text-gray-500 font-mono text-xs">{item.code}</td>
                        <td className="px-4 py-2">{item.name}</td>
                        <td className="px-4 py-2 text-right">${item.budget.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right">${item.committed.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right">${item.actual.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right">${item.projected.toLocaleString()}</td>
                        <td className={cn("px-4 py-2 text-right", getVarianceColor(item.projected, item.budget))}>
                          {formatVariance(variance)}
                        </td>
                        <td className={cn("px-4 py-2 text-right text-xs", getVarianceColor(item.projected, item.budget))}>
                          {variancePct > 0 ? '+' : ''}{variancePct.toFixed(1)}%
                        </td>
                        <td className="px-4 py-2">
                          {Math.abs(variancePct) > 5 && (
                            <AlertTriangle className={cn("w-4 h-4", variancePct > 5 ? "text-red-500" : "text-green-500")} />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}

            {/* Grand Total */}
            <tr className="bg-gray-800 text-white font-semibold">
              <td className="px-4 py-3"></td>
              <td className="px-4 py-3">GRAND TOTAL</td>
              <td className="px-4 py-3 text-right">{formatCurrency(grandTotals.budget)}</td>
              <td className="px-4 py-3 text-right">{formatCurrency(grandTotals.committed)}</td>
              <td className="px-4 py-3 text-right">{formatCurrency(grandTotals.actual)}</td>
              <td className="px-4 py-3 text-right">{formatCurrency(grandTotals.projected)}</td>
              <td className={cn("px-4 py-3 text-right", totalVariance > 0 ? "text-red-300" : "text-green-300")}>
                {formatVariance(totalVariance)}
              </td>
              <td className={cn("px-4 py-3 text-right", totalVariance > 0 ? "text-red-300" : "text-green-300")}>
                {variancePercent > 0 ? '+' : ''}{variancePercent.toFixed(1)}%
              </td>
              <td className="px-4 py-3"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Variance Summary */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        {/* Over Budget Items */}
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold">Over Budget Items</h3>
          </div>
          <div className="space-y-2">
            {budgetData.categories.flatMap(cat => 
              cat.items.filter(item => item.projected > item.budget)
            ).sort((a, b) => (b.projected - b.budget) - (a.projected - a.budget))
            .slice(0, 5)
            .map(item => (
              <div key={item.code} className="flex items-center justify-between p-2 bg-red-50 rounded">
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.code}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">+${(item.projected - item.budget).toLocaleString()}</p>
                  <p className="text-xs text-red-500">+{(((item.projected - item.budget) / item.budget) * 100).toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Under Budget Items */}
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold">Under Budget Items</h3>
          </div>
          <div className="space-y-2">
            {budgetData.categories.flatMap(cat => 
              cat.items.filter(item => item.projected < item.budget)
            ).sort((a, b) => (a.projected - a.budget) - (b.projected - b.budget))
            .slice(0, 5)
            .map(item => (
              <div key={item.code} className="flex items-center justify-between p-2 bg-green-50 rounded">
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.code}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">-${Math.abs(item.projected - item.budget).toLocaleString()}</p>
                  <p className="text-xs text-green-500">{(((item.projected - item.budget) / item.budget) * 100).toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActualsVsBudgetPage;
