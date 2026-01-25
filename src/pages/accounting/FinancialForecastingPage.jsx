import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  Filter,
  Settings,
  Plus,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Target,
  Layers,
  Building2,
  Briefcase,
  Clock,
  Calculator,
  FileText,
  Copy,
  Eye
} from 'lucide-react';

const FinancialForecastingPage = () => {
  const [timeHorizon, setTimeHorizon] = useState('12');
  const [scenario, setScenario] = useState('base');
  const [selectedProjects, setSelectedProjects] = useState('all');
  const [showScenarioBuilder, setShowScenarioBuilder] = useState(false);

  // Mock forecast data
  const forecastData = {
    summary: {
      projectedRevenue: 42500000,
      projectedExpenses: 34800000,
      projectedNetIncome: 7700000,
      projectedCashFlow: 5200000,
      revenueGrowth: 18.5,
      marginImprovement: 2.3,
    },
    scenarios: [
      { id: 'base', name: 'Base Case', probability: 60, revenue: 42500000, netIncome: 7700000 },
      { id: 'optimistic', name: 'Optimistic', probability: 25, revenue: 52000000, netIncome: 11200000 },
      { id: 'conservative', name: 'Conservative', probability: 15, revenue: 35000000, netIncome: 4500000 },
    ],
    monthlyProjections: [
      { month: 'Feb 25', revenue: 3200000, expenses: 2650000, cashFlow: 420000, cumulative: 420000 },
      { month: 'Mar 25', revenue: 3450000, expenses: 2820000, cashFlow: 480000, cumulative: 900000 },
      { month: 'Apr 25', revenue: 3650000, expenses: 2950000, cashFlow: 520000, cumulative: 1420000 },
      { month: 'May 25', revenue: 3800000, expenses: 3100000, cashFlow: 510000, cumulative: 1930000 },
      { month: 'Jun 25', revenue: 4100000, expenses: 3280000, cashFlow: 580000, cumulative: 2510000 },
      { month: 'Jul 25', revenue: 3950000, expenses: 3150000, cashFlow: 560000, cumulative: 3070000 },
      { month: 'Aug 25', revenue: 3750000, expenses: 3050000, cashFlow: 490000, cumulative: 3560000 },
      { month: 'Sep 25', revenue: 3600000, expenses: 2920000, cashFlow: 470000, cumulative: 4030000 },
      { month: 'Oct 25', revenue: 3850000, expenses: 3100000, cashFlow: 520000, cumulative: 4550000 },
      { month: 'Nov 25', revenue: 3500000, expenses: 2850000, cashFlow: 450000, cumulative: 5000000 },
      { month: 'Dec 25', revenue: 3200000, expenses: 2680000, cashFlow: 380000, cumulative: 5380000 },
      { month: 'Jan 26', revenue: 2450000, expenses: 2250000, cashFlow: 150000, cumulative: 5530000 },
    ],
    revenueBreakdown: [
      { category: 'Property Sales', amount: 28500000, percentage: 67, growth: 22 },
      { category: 'Rental Income', amount: 8200000, percentage: 19, growth: 8 },
      { category: 'Development Fees', amount: 4100000, percentage: 10, growth: 15 },
      { category: 'Other Income', amount: 1700000, percentage: 4, growth: 5 },
    ],
    expenseBreakdown: [
      { category: 'Construction Costs', amount: 18500000, percentage: 53, growth: 12 },
      { category: 'Land Acquisition', amount: 8200000, percentage: 24, growth: 25 },
      { category: 'Operating Expenses', amount: 4800000, percentage: 14, growth: 8 },
      { category: 'Interest & Financing', amount: 2100000, percentage: 6, growth: -5 },
      { category: 'G&A', amount: 1200000, percentage: 3, growth: 3 },
    ],
    projectForecasts: [
      { id: 1, name: 'Oakwood Estates Phase 2', revenue: 12500000, expenses: 9800000, profit: 2700000, completion: 'Jun 25' },
      { id: 2, name: 'Charlotte Scattered Lots', revenue: 8200000, expenses: 6100000, profit: 2100000, completion: 'Mar 25' },
      { id: 3, name: 'Downtown Mixed-Use', revenue: 15000000, expenses: 12500000, profit: 2500000, completion: 'Dec 25' },
      { id: 4, name: 'Lake Norman Waterfront', revenue: 6800000, expenses: 5200000, profit: 1600000, completion: 'Apr 25' },
    ],
    keyMetrics: [
      { name: 'Gross Margin', current: 22.5, projected: 24.2, target: 25, trend: 'up' },
      { name: 'Operating Margin', current: 15.8, projected: 17.1, target: 18, trend: 'up' },
      { name: 'ROE', current: 18.2, projected: 20.5, target: 22, trend: 'up' },
      { name: 'Debt/Equity', current: 1.8, projected: 1.5, target: 1.2, trend: 'down' },
    ],
    alerts: [
      { type: 'warning', message: 'Construction costs projected to increase 12% YoY', impact: 'High' },
      { type: 'info', message: 'Q2 revenue expected to peak due to seasonal sales', impact: 'Medium' },
      { type: 'success', message: 'Interest expenses projected to decrease 5%', impact: 'Medium' },
    ],
  };

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const maxProjection = Math.max(...forecastData.monthlyProjections.map(m => Math.max(m.revenue, m.expenses)));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <TrendingUp className="w-7 h-7 text-blue-600" />
                Financial Forecasting
              </h1>
              <p className="text-gray-600 mt-1">
                Cash flow projections and scenario modeling
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => setShowScenarioBuilder(!showScenarioBuilder)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                New Scenario
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Forecast:</span>
            </div>
            <select
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
              <option value="12">12 Months</option>
              <option value="24">24 Months</option>
            </select>
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {forecastData.scenarios.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <select
              value={selectedProjects}
              onChange={(e) => setSelectedProjects(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Projects</option>
              <option value="active">Active Projects</option>
              <option value="pipeline">Pipeline Only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Projected Revenue</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(forecastData.summary.projectedRevenue)}</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-4 h-4" />
                  +{forecastData.summary.revenueGrowth}% YoY
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Projected Expenses</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(forecastData.summary.projectedExpenses)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  82% of revenue
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Net Income</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(forecastData.summary.projectedNetIncome)}</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-4 h-4" />
                  +{forecastData.summary.marginImprovement}% margin
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cash Flow</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(forecastData.summary.projectedCashFlow)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  12-month projection
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Scenario Comparison */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Scenario Comparison
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {forecastData.scenarios.map(s => (
              <div
                key={s.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  scenario === s.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setScenario(s.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{s.name}</h4>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {s.probability}% likely
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    Revenue: <span className="font-semibold text-gray-900">{formatCurrency(s.revenue)}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Net Income: <span className="font-semibold text-green-600">{formatCurrency(s.netIncome)}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Projections Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Cash Flow Projection</h3>
          <div className="flex items-end gap-2 h-64">
            {forecastData.monthlyProjections.map((month, idx) => {
              const revenueHeight = (month.revenue / maxProjection) * 100;
              const expenseHeight = (month.expenses / maxProjection) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex gap-1 items-end justify-center h-48">
                    <div className="flex flex-col items-center w-2/5">
                      <div
                        className="w-full bg-green-400 rounded-t"
                        style={{ height: `${revenueHeight}%` }}
                        title={`Revenue: ${formatCurrency(month.revenue)}`}
                      />
                    </div>
                    <div className="flex flex-col items-center w-2/5">
                      <div
                        className="w-full bg-red-400 rounded-t"
                        style={{ height: `${expenseHeight}%` }}
                        title={`Expenses: ${formatCurrency(month.expenses)}`}
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-xs font-medium text-gray-700">{month.month}</p>
                    <p className="text-xs text-green-600">{formatCurrency(month.cashFlow)}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-400 rounded" />
              <span className="text-sm text-gray-600">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-400 rounded" />
              <span className="text-sm text-gray-600">Expenses</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue Breakdown */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-green-600" />
              Revenue Breakdown
            </h3>
            <div className="space-y-3">
              {forecastData.revenueBreakdown.map((item, idx) => {
                const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500'];
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{item.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                        <span className={`text-xs ${item.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.growth >= 0 ? '+' : ''}{item.growth}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${colors[idx]}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-red-600" />
              Expense Breakdown
            </h3>
            <div className="space-y-3">
              {forecastData.expenseBreakdown.map((item, idx) => {
                const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-pink-500', 'bg-rose-500'];
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{item.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                        <span className={`text-xs ${item.growth <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.growth >= 0 ? '+' : ''}{item.growth}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${colors[idx]}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Key Financial Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {forecastData.keyMetrics.map((metric, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">{metric.name}</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-gray-900">{metric.projected}%</span>
                  <span className={`text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Current: {metric.current}%</span>
                    <span>Target: {metric.target}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        metric.projected >= metric.target ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${(metric.projected / metric.target) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Forecasts */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-600" />
            Project-Level Forecasts
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Project</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">Revenue</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">Expenses</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">Profit</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">Margin</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-700">Completion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {forecastData.projectForecasts.map(project => {
                  const margin = ((project.profit / project.revenue) * 100).toFixed(1);
                  return (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{project.name}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(project.revenue)}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(project.expenses)}</td>
                      <td className="px-4 py-3 text-right font-medium text-green-600">{formatCurrency(project.profit)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`${parseFloat(margin) >= 20 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {margin}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {project.completion}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            Forecast Alerts & Insights
          </h3>
          <div className="space-y-3">
            {forecastData.alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.type === 'warning'
                    ? 'bg-yellow-50 border-l-yellow-500'
                    : alert.type === 'success'
                    ? 'bg-green-50 border-l-green-500'
                    : 'bg-blue-50 border-l-blue-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className={`text-sm ${
                    alert.type === 'warning'
                      ? 'text-yellow-800'
                      : alert.type === 'success'
                      ? 'text-green-800'
                      : 'text-blue-800'
                  }`}>
                    {alert.message}
                  </p>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    alert.impact === 'High'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {alert.impact} Impact
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialForecastingPage;
