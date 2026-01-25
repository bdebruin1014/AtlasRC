import React, { useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Download, Filter, ChevronDown, ChevronRight, Calendar, BarChart3, PieChart, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const BudgetVsActualPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('ytd');
  const [selectedEntity, setSelectedEntity] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState(['income', 'cogs']);
  const [viewMode, setViewMode] = useState('variance');

  const periodOptions = [
    { id: 'ytd', label: 'Year to Date' },
    { id: 'q4', label: 'Q4 2024' },
    { id: 'q3', label: 'Q3 2024' },
    { id: 'monthly', label: 'Monthly' },
  ];

  const summary = {
    totalBudget: 12500000,
    totalActual: 11850000,
    variance: -650000,
    variancePercent: -5.2,
    favorableCount: 8,
    unfavorableCount: 4,
  };

  const categories = [
    {
      id: 'income',
      name: 'Revenue',
      budget: 8500000,
      actual: 8125000,
      type: 'revenue',
      items: [
        { id: 'r1', name: 'Lot Sales', budget: 4200000, actual: 3850000, notes: '2 lots delayed to Q1' },
        { id: 'r2', name: 'Home Sales', budget: 2800000, actual: 2975000, notes: 'Strong Q4 closings' },
        { id: 'r3', name: 'Rental Income', budget: 1200000, actual: 1050000, notes: 'Vacancy higher than expected' },
        { id: 'r4', name: 'Management Fees', budget: 300000, actual: 250000, notes: '' },
      ],
    },
    {
      id: 'cogs',
      name: 'Cost of Goods Sold',
      budget: 5200000,
      actual: 4850000,
      type: 'expense',
      items: [
        { id: 'c1', name: 'Land Costs', budget: 1800000, actual: 1750000, notes: '' },
        { id: 'c2', name: 'Construction Costs', budget: 2400000, actual: 2200000, notes: 'Better pricing from subs' },
        { id: 'c3', name: 'Development Costs', budget: 800000, actual: 750000, notes: '' },
        { id: 'c4', name: 'Carrying Costs', budget: 200000, actual: 150000, notes: 'Lower interest rates' },
      ],
    },
    {
      id: 'opex',
      name: 'Operating Expenses',
      budget: 1850000,
      actual: 2125000,
      type: 'expense',
      items: [
        { id: 'o1', name: 'Salaries & Wages', budget: 850000, actual: 920000, notes: 'New hires in Q3' },
        { id: 'o2', name: 'Marketing', budget: 250000, actual: 285000, notes: 'Additional campaigns' },
        { id: 'o3', name: 'Professional Services', budget: 350000, actual: 420000, notes: 'Legal fees for deals' },
        { id: 'o4', name: 'Office & Admin', budget: 200000, actual: 245000, notes: '' },
        { id: 'o5', name: 'Insurance', budget: 125000, actual: 155000, notes: 'Rate increases' },
        { id: 'o6', name: 'Utilities', budget: 75000, actual: 100000, notes: '' },
      ],
    },
    {
      id: 'other',
      name: 'Other Income/Expense',
      budget: -450000,
      actual: -525000,
      type: 'other',
      items: [
        { id: 'ot1', name: 'Interest Income', budget: 50000, actual: 45000, notes: '' },
        { id: 'ot2', name: 'Interest Expense', budget: -400000, actual: -480000, notes: 'Higher loan balances' },
        { id: 'ot3', name: 'Other Income', budget: 25000, actual: 35000, notes: '' },
        { id: 'ot4', name: 'Depreciation', budget: -125000, actual: -125000, notes: '' },
      ],
    },
  ];

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    );
  };

  const calculateVariance = (budget, actual, type) => {
    const variance = actual - budget;
    const isFavorable = type === 'revenue'
      ? variance >= 0
      : variance <= 0;
    return { variance, isFavorable };
  };

  const getVarianceColor = (variance, isFavorable) => {
    if (Math.abs(variance) < 1000) return 'text-gray-500';
    return isFavorable ? 'text-green-600' : 'text-red-600';
  };

  const getVarianceBg = (variance, isFavorable) => {
    if (Math.abs(variance) < 1000) return 'bg-gray-50';
    return isFavorable ? 'bg-green-50' : 'bg-red-50';
  };

  const netIncome = {
    budget: categories.find(c => c.id === 'income').budget - categories.find(c => c.id === 'cogs').budget - categories.find(c => c.id === 'opex').budget + categories.find(c => c.id === 'other').budget,
    actual: categories.find(c => c.id === 'income').actual - categories.find(c => c.id === 'cogs').actual - categories.find(c => c.id === 'opex').actual + categories.find(c => c.id === 'other').actual,
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Budget vs Actual Analysis</h1>
            <p className="text-sm text-gray-500">Compare budgeted amounts to actual performance</p>
          </div>
          <div className="flex gap-2">
            <select className="border rounded-md px-3 py-1.5 text-sm" value={selectedEntity} onChange={(e) => setSelectedEntity(e.target.value)}>
              <option value="all">All Entities</option>
              <option value="vanrock">VanRock Development</option>
              <option value="watson">Watson Project SPE</option>
              <option value="sunset">Sunset Ridge SPE</option>
            </select>
            <div className="flex border rounded-md overflow-hidden">
              {periodOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedPeriod(opt.id)}
                  className={cn(
                    "px-3 py-1.5 text-sm",
                    selectedPeriod === opt.id ? "bg-[#047857] text-white" : "bg-white hover:bg-gray-50"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-6 gap-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Total Budget</p>
            <p className="text-lg font-bold text-blue-700">${(summary.totalBudget / 1000000).toFixed(2)}M</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Total Actual</p>
            <p className="text-lg font-bold text-purple-700">${(summary.totalActual / 1000000).toFixed(2)}M</p>
          </div>
          <div className={cn("rounded-lg p-3 text-center", summary.variance >= 0 ? "bg-green-50" : "bg-red-50")}>
            <p className="text-xs text-gray-500">Variance</p>
            <p className={cn("text-lg font-bold", summary.variance >= 0 ? "text-green-700" : "text-red-700")}>
              {summary.variance >= 0 ? '+' : ''}{(summary.variance / 1000000).toFixed(2)}M
            </p>
          </div>
          <div className={cn("rounded-lg p-3 text-center", summary.variancePercent >= 0 ? "bg-green-50" : "bg-red-50")}>
            <p className="text-xs text-gray-500">Variance %</p>
            <p className={cn("text-lg font-bold flex items-center justify-center gap-1", summary.variancePercent >= 0 ? "text-green-700" : "text-red-700")}>
              {summary.variancePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {summary.variancePercent >= 0 ? '+' : ''}{summary.variancePercent}%
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Favorable</p>
            <p className="text-lg font-bold text-green-700 flex items-center justify-center gap-1">
              <CheckCircle className="w-4 h-4" />{summary.favorableCount}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Unfavorable</p>
            <p className="text-lg font-bold text-red-700 flex items-center justify-center gap-1">
              <AlertTriangle className="w-4 h-4" />{summary.unfavorableCount}
            </p>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="bg-white border-b px-4 py-2 flex items-center gap-4">
        <span className="text-sm font-medium text-gray-600">View:</span>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('variance')}
            className={cn("px-3 py-1 rounded text-sm", viewMode === 'variance' ? "bg-gray-200" : "hover:bg-gray-100")}
          >
            Variance
          </button>
          <button
            onClick={() => setViewMode('percentage')}
            className={cn("px-3 py-1 rounded text-sm", viewMode === 'percentage' ? "bg-gray-200" : "hover:bg-gray-100")}
          >
            % of Budget
          </button>
          <button
            onClick={() => setViewMode('trend')}
            className={cn("px-3 py-1 rounded text-sm", viewMode === 'trend' ? "bg-gray-200" : "hover:bg-gray-100")}
          >
            Trend
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Category / Line Item</th>
                <th className="text-right px-4 py-3 font-medium">Budget</th>
                <th className="text-right px-4 py-3 font-medium">Actual</th>
                <th className="text-right px-4 py-3 font-medium">Variance ($)</th>
                <th className="text-right px-4 py-3 font-medium">Variance (%)</th>
                <th className="w-40 px-4 py-3 font-medium">Progress</th>
                <th className="text-left px-4 py-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map((category) => {
                const { variance, isFavorable } = calculateVariance(category.budget, category.actual, category.type);
                const variancePercent = category.budget !== 0 ? ((variance / Math.abs(category.budget)) * 100).toFixed(1) : 0;
                const actualPercent = category.budget !== 0 ? ((category.actual / Math.abs(category.budget)) * 100).toFixed(1) : 0;

                return (
                  <React.Fragment key={category.id}>
                    {/* Category Row */}
                    <tr
                      className={cn("bg-gray-50 cursor-pointer hover:bg-gray-100", getVarianceBg(variance, isFavorable))}
                      onClick={() => toggleCategory(category.id)}
                    >
                      <td className="px-4 py-3 font-semibold">
                        <div className="flex items-center gap-2">
                          {expandedCategories.includes(category.id) ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                          {category.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">${Math.abs(category.budget).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-semibold">${Math.abs(category.actual).toLocaleString()}</td>
                      <td className={cn("px-4 py-3 text-right font-semibold", getVarianceColor(variance, isFavorable))}>
                        {variance >= 0 ? '+' : ''}{variance.toLocaleString()}
                      </td>
                      <td className={cn("px-4 py-3 text-right font-semibold", getVarianceColor(variance, isFavorable))}>
                        {variance >= 0 ? '+' : ''}{variancePercent}%
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={cn("h-2 rounded-full", isFavorable ? "bg-green-500" : "bg-red-500")}
                            style={{ width: `${Math.min(parseFloat(actualPercent), 150)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{actualPercent}%</span>
                      </td>
                      <td className="px-4 py-3"></td>
                    </tr>

                    {/* Line Items */}
                    {expandedCategories.includes(category.id) && category.items.map((item) => {
                      const itemVariance = calculateVariance(item.budget, item.actual, category.type);
                      const itemVariancePercent = item.budget !== 0 ? ((itemVariance.variance / Math.abs(item.budget)) * 100).toFixed(1) : 0;
                      const itemActualPercent = item.budget !== 0 ? ((item.actual / Math.abs(item.budget)) * 100).toFixed(1) : 0;

                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 pl-12 text-gray-600">{item.name}</td>
                          <td className="px-4 py-2 text-right">${Math.abs(item.budget).toLocaleString()}</td>
                          <td className="px-4 py-2 text-right">${Math.abs(item.actual).toLocaleString()}</td>
                          <td className={cn("px-4 py-2 text-right", getVarianceColor(itemVariance.variance, itemVariance.isFavorable))}>
                            {itemVariance.variance >= 0 ? '+' : ''}{itemVariance.variance.toLocaleString()}
                          </td>
                          <td className={cn("px-4 py-2 text-right", getVarianceColor(itemVariance.variance, itemVariance.isFavorable))}>
                            {itemVariance.variance >= 0 ? '+' : ''}{itemVariancePercent}%
                          </td>
                          <td className="px-4 py-2">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className={cn("h-1.5 rounded-full", itemVariance.isFavorable ? "bg-green-400" : "bg-red-400")}
                                style={{ width: `${Math.min(parseFloat(itemActualPercent), 150)}%` }}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-2 text-xs text-gray-500">{item.notes}</td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}

              {/* Net Income Row */}
              <tr className="bg-blue-50 border-t-2 border-blue-200">
                <td className="px-4 py-3 font-bold text-blue-800">Net Income</td>
                <td className="px-4 py-3 text-right font-bold text-blue-800">${netIncome.budget.toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-bold text-blue-800">${netIncome.actual.toLocaleString()}</td>
                <td className={cn("px-4 py-3 text-right font-bold", netIncome.actual - netIncome.budget >= 0 ? "text-green-700" : "text-red-700")}>
                  {netIncome.actual - netIncome.budget >= 0 ? '+' : ''}{(netIncome.actual - netIncome.budget).toLocaleString()}
                </td>
                <td className={cn("px-4 py-3 text-right font-bold", netIncome.actual - netIncome.budget >= 0 ? "text-green-700" : "text-red-700")}>
                  {netIncome.budget !== 0 ? (((netIncome.actual - netIncome.budget) / Math.abs(netIncome.budget)) * 100).toFixed(1) : 0}%
                </td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BudgetVsActualPage;
