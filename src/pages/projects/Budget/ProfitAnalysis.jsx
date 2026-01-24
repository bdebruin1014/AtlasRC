// src/pages/projects/Budget/ProfitAnalysis.jsx
// Profit analysis view based on active budget data

import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Percent, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useBudgetLineItems } from '@/hooks/useBudget';

const formatCurrency = (amount) => {
  if (!amount) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};

// Demo revenue assumptions
const REVENUE_ASSUMPTIONS = {
  salePrice: 2450000,
  sellerClosingCosts: 73500, // 3%
  commissions: 122500, // 5%
  netRevenue: 2254000,
};

const ProfitAnalysis = ({ budget, project }) => {
  const { totals } = useBudgetLineItems(budget?.id);

  if (!budget) {
    return (
      <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
        <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Active Budget</h3>
        <p className="text-sm text-gray-500">Create and activate a budget to see profit analysis.</p>
      </div>
    );
  }

  const totalCosts = totals.totalBudget || budget.total_budget || 0;
  const grossProfit = REVENUE_ASSUMPTIONS.netRevenue - totalCosts;
  const grossMargin = REVENUE_ASSUMPTIONS.netRevenue > 0 ? (grossProfit / REVENUE_ASSUMPTIONS.netRevenue) * 100 : 0;
  const roi = totalCosts > 0 ? (grossProfit / totalCosts) * 100 : 0;
  const costPerSF = project?.square_footage ? totalCosts / project.square_footage : totalCosts / 2400;

  const metrics = [
    { label: 'Sale Price', value: formatCurrency(REVENUE_ASSUMPTIONS.salePrice), icon: DollarSign, color: 'bg-blue-50 text-blue-600' },
    { label: 'Net Revenue', value: formatCurrency(REVENUE_ASSUMPTIONS.netRevenue), icon: DollarSign, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Total Costs', value: formatCurrency(totalCosts), icon: DollarSign, color: 'bg-gray-50 text-gray-600' },
    { label: 'Gross Profit', value: formatCurrency(grossProfit), icon: grossProfit >= 0 ? TrendingUp : TrendingDown, color: grossProfit >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600' },
    { label: 'Gross Margin', value: `${grossMargin.toFixed(1)}%`, icon: Percent, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'ROI', value: `${roi.toFixed(1)}%`, icon: Target, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map(m => (
          <Card key={m.label} className="border-gray-200">
            <CardContent className="p-4">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", m.color)}>
                <m.icon className="w-4 h-4" />
              </div>
              <p className="text-xs text-gray-500 font-medium">{m.label}</p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-base">Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm py-2 border-b border-gray-100">
              <span className="text-gray-600">Gross Sale Price</span>
              <span className="font-medium">{formatCurrency(REVENUE_ASSUMPTIONS.salePrice)}</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-gray-100">
              <span className="text-gray-600">Less: Seller Closing Costs (3%)</span>
              <span className="font-medium text-red-600">({formatCurrency(REVENUE_ASSUMPTIONS.sellerClosingCosts)})</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-gray-100">
              <span className="text-gray-600">Less: Commissions (5%)</span>
              <span className="font-medium text-red-600">({formatCurrency(REVENUE_ASSUMPTIONS.commissions)})</span>
            </div>
            <div className="flex justify-between text-sm py-2 font-bold">
              <span className="text-gray-900">Net Revenue</span>
              <span className="text-gray-900">{formatCurrency(REVENUE_ASSUMPTIONS.netRevenue)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-base">Cost Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(totals.categories).map(([cat, data]) => (
              <div key={cat} className="flex justify-between text-sm py-2 border-b border-gray-100">
                <span className="text-gray-600">{cat}</span>
                <span className="font-medium">{formatCurrency(data.budget)}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm py-2 font-bold">
              <span className="text-gray-900">Total Project Costs</span>
              <span className="text-gray-900">{formatCurrency(totalCosts)}</span>
            </div>
            <div className="flex justify-between text-sm py-2 mt-2 pt-2 border-t-2 border-gray-200 font-bold">
              <span className={cn(grossProfit >= 0 ? "text-green-700" : "text-red-700")}>
                {grossProfit >= 0 ? 'Profit' : 'Loss'}
              </span>
              <span className={cn(grossProfit >= 0 ? "text-green-700" : "text-red-700")}>
                {formatCurrency(Math.abs(grossProfit))}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per Unit / Per SF */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-base">Unit Economics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Cost per SF</p>
              <p className="text-lg font-bold text-gray-900">${costPerSF.toFixed(0)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Revenue per SF</p>
              <p className="text-lg font-bold text-gray-900">${(REVENUE_ASSUMPTIONS.salePrice / 2400).toFixed(0)}</p>
            </div>
            {project?.lot_count > 1 && (
              <>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Cost per Lot</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(totalCosts / project.lot_count)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Profit per Lot</p>
                  <p className="text-lg font-bold text-green-700">{formatCurrency(grossProfit / project.lot_count)}</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfitAnalysis;
