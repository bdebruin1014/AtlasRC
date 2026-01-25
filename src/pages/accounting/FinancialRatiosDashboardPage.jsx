import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Info, Download, RefreshCw, Calendar, AlertTriangle, CheckCircle, Target, Gauge, DollarSign, Percent, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const FinancialRatiosDashboardPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [selectedEntity, setSelectedEntity] = useState('all');
  const [showDetails, setShowDetails] = useState(null);

  const ratioCategories = [
    {
      id: 'liquidity',
      name: 'Liquidity Ratios',
      description: 'Measure ability to meet short-term obligations',
      icon: DollarSign,
      color: 'blue',
      ratios: [
        {
          id: 'current-ratio',
          name: 'Current Ratio',
          formula: 'Current Assets / Current Liabilities',
          value: 2.45,
          previousValue: 2.32,
          benchmark: 2.0,
          status: 'good',
          interpretation: 'Strong liquidity position. Well above industry standard.',
        },
        {
          id: 'quick-ratio',
          name: 'Quick Ratio (Acid Test)',
          formula: '(Current Assets - Inventory) / Current Liabilities',
          value: 1.85,
          previousValue: 1.72,
          benchmark: 1.5,
          status: 'good',
          interpretation: 'Good quick liquidity without relying on inventory.',
        },
        {
          id: 'cash-ratio',
          name: 'Cash Ratio',
          formula: 'Cash & Equivalents / Current Liabilities',
          value: 0.95,
          previousValue: 0.88,
          benchmark: 0.5,
          status: 'good',
          interpretation: 'Strong cash position to cover immediate obligations.',
        },
      ],
    },
    {
      id: 'profitability',
      name: 'Profitability Ratios',
      description: 'Measure ability to generate earnings',
      icon: TrendingUp,
      color: 'green',
      ratios: [
        {
          id: 'gross-margin',
          name: 'Gross Profit Margin',
          formula: '(Revenue - COGS) / Revenue',
          value: 32.5,
          previousValue: 30.8,
          benchmark: 28.0,
          unit: '%',
          status: 'good',
          interpretation: 'Above industry average gross margins.',
        },
        {
          id: 'net-margin',
          name: 'Net Profit Margin',
          formula: 'Net Income / Revenue',
          value: 14.2,
          previousValue: 12.5,
          benchmark: 12.0,
          unit: '%',
          status: 'good',
          interpretation: 'Healthy net margins above target.',
        },
        {
          id: 'roe',
          name: 'Return on Equity (ROE)',
          formula: 'Net Income / Shareholders Equity',
          value: 18.5,
          previousValue: 16.2,
          benchmark: 15.0,
          unit: '%',
          status: 'good',
          interpretation: 'Strong returns for equity investors.',
        },
        {
          id: 'roa',
          name: 'Return on Assets (ROA)',
          formula: 'Net Income / Total Assets',
          value: 8.2,
          previousValue: 7.5,
          benchmark: 7.0,
          unit: '%',
          status: 'good',
          interpretation: 'Efficient asset utilization.',
        },
      ],
    },
    {
      id: 'leverage',
      name: 'Leverage Ratios',
      description: 'Measure financial risk and debt levels',
      icon: Gauge,
      color: 'amber',
      ratios: [
        {
          id: 'debt-ratio',
          name: 'Debt to Assets',
          formula: 'Total Debt / Total Assets',
          value: 55.2,
          previousValue: 58.5,
          benchmark: 60.0,
          unit: '%',
          status: 'good',
          interpretation: 'Moderate leverage, within acceptable range.',
        },
        {
          id: 'debt-equity',
          name: 'Debt to Equity',
          formula: 'Total Debt / Total Equity',
          value: 1.23,
          previousValue: 1.41,
          benchmark: 1.5,
          status: 'good',
          interpretation: 'Improving debt position.',
        },
        {
          id: 'interest-coverage',
          name: 'Interest Coverage',
          formula: 'EBIT / Interest Expense',
          value: 4.8,
          previousValue: 4.2,
          benchmark: 3.0,
          status: 'good',
          interpretation: 'Strong ability to service debt.',
        },
        {
          id: 'ltv',
          name: 'Loan to Value (LTV)',
          formula: 'Total Loans / Property Value',
          value: 68.5,
          previousValue: 72.0,
          benchmark: 75.0,
          unit: '%',
          status: 'warning',
          interpretation: 'Within limits but monitor closely.',
        },
      ],
    },
    {
      id: 'efficiency',
      name: 'Efficiency Ratios',
      description: 'Measure operational efficiency',
      icon: BarChart3,
      color: 'purple',
      ratios: [
        {
          id: 'asset-turnover',
          name: 'Asset Turnover',
          formula: 'Revenue / Average Total Assets',
          value: 0.58,
          previousValue: 0.52,
          benchmark: 0.50,
          status: 'good',
          interpretation: 'Good revenue generation from assets.',
        },
        {
          id: 'inventory-turnover',
          name: 'Inventory Turnover (Lots)',
          formula: 'COGS / Average Inventory',
          value: 2.8,
          previousValue: 2.5,
          benchmark: 2.0,
          status: 'good',
          interpretation: 'Healthy lot turnover rate.',
        },
        {
          id: 'ar-days',
          name: 'Days Sales Outstanding',
          formula: '(Accounts Receivable / Revenue) x 365',
          value: 32,
          previousValue: 38,
          benchmark: 45,
          unit: ' days',
          status: 'good',
          interpretation: 'Excellent collection performance.',
        },
        {
          id: 'ap-days',
          name: 'Days Payable Outstanding',
          formula: '(Accounts Payable / COGS) x 365',
          value: 45,
          previousValue: 42,
          benchmark: 30,
          unit: ' days',
          status: 'warning',
          interpretation: 'Longer payment cycle than ideal.',
        },
      ],
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-amber-200 bg-amber-50';
      case 'critical': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getCategoryBg = (color) => {
    switch (color) {
      case 'blue': return 'bg-blue-50';
      case 'green': return 'bg-green-50';
      case 'amber': return 'bg-amber-50';
      case 'purple': return 'bg-purple-50';
      default: return 'bg-gray-50';
    }
  };

  const getTrendDirection = (current, previous) => {
    if (current > previous) return { icon: TrendingUp, color: 'text-green-500', label: 'up' };
    if (current < previous) return { icon: TrendingDown, color: 'text-red-500', label: 'down' };
    return { icon: null, color: 'text-gray-500', label: 'unchanged' };
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Financial Ratios Dashboard</h1>
            <p className="text-sm text-gray-500">Key performance indicators and financial health metrics</p>
          </div>
          <div className="flex gap-2">
            <select className="border rounded-md px-3 py-1.5 text-sm" value={selectedEntity} onChange={(e) => setSelectedEntity(e.target.value)}>
              <option value="all">All Entities (Consolidated)</option>
              <option value="vanrock">VanRock Development</option>
              <option value="watson">Watson Project SPE</option>
              <option value="sunset">Sunset Ridge SPE</option>
            </select>
            <select className="border rounded-md px-3 py-1.5 text-sm" value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
              <option value="current">Current Period</option>
              <option value="q4">Q4 2024</option>
              <option value="q3">Q3 2024</option>
              <option value="ytd">Year to Date</option>
            </select>
            <Button variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-1" />Refresh</Button>
            <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="grid grid-cols-4 gap-4">
          {ratioCategories.map((cat) => {
            const goodCount = cat.ratios.filter(r => r.status === 'good').length;
            const totalCount = cat.ratios.length;
            const Icon = cat.icon;
            return (
              <div key={cat.id} className={cn("rounded-lg p-3", getCategoryBg(cat.color))}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={cn("w-5 h-5", `text-${cat.color}-600`)} />
                  <span className="font-medium text-sm">{cat.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{goodCount}/{totalCount}</span>
                  <span className="text-xs text-gray-500">ratios healthy</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {ratioCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.id} className="bg-white border rounded-lg overflow-hidden">
                <div className={cn("px-4 py-3 border-b flex items-center gap-3", getCategoryBg(category.color))}>
                  <Icon className={cn("w-5 h-5", `text-${category.color}-600`)} />
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-xs text-gray-500">{category.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                  {category.ratios.map((ratio) => {
                    const trend = getTrendDirection(ratio.value, ratio.previousValue);
                    const TrendIcon = trend.icon;
                    const changePercent = ratio.previousValue !== 0
                      ? (((ratio.value - ratio.previousValue) / ratio.previousValue) * 100).toFixed(1)
                      : 0;

                    return (
                      <div
                        key={ratio.id}
                        className={cn("border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow", getStatusColor(ratio.status))}
                        onClick={() => setShowDetails(showDetails === ratio.id ? null : ratio.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">{ratio.name}</span>
                          {getStatusIcon(ratio.status)}
                        </div>
                        <div className="flex items-end gap-2 mb-2">
                          <span className="text-2xl font-bold">
                            {ratio.value}{ratio.unit || ''}
                          </span>
                          {TrendIcon && (
                            <span className={cn("flex items-center text-xs", trend.color)}>
                              <TrendIcon className="w-3 h-3 mr-0.5" />
                              {Math.abs(changePercent)}%
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Target: {ratio.benchmark}{ratio.unit || ''}</span>
                          <span>Prev: {ratio.previousValue}{ratio.unit || ''}</span>
                        </div>

                        {showDetails === ratio.id && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-gray-600 mb-2">
                              <strong>Formula:</strong> {ratio.formula}
                            </p>
                            <p className="text-xs text-gray-600">
                              <strong>Analysis:</strong> {ratio.interpretation}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Trend Analysis */}
        <div className="mt-6 bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Ratio Trend Analysis (Last 4 Quarters)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Ratio</th>
                  <th className="text-right px-4 py-2 font-medium">Q1 2024</th>
                  <th className="text-right px-4 py-2 font-medium">Q2 2024</th>
                  <th className="text-right px-4 py-2 font-medium">Q3 2024</th>
                  <th className="text-right px-4 py-2 font-medium">Q4 2024</th>
                  <th className="text-center px-4 py-2 font-medium">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-2">Current Ratio</td>
                  <td className="px-4 py-2 text-right">2.15</td>
                  <td className="px-4 py-2 text-right">2.22</td>
                  <td className="px-4 py-2 text-right">2.32</td>
                  <td className="px-4 py-2 text-right font-medium">2.45</td>
                  <td className="px-4 py-2 text-center"><TrendingUp className="w-4 h-4 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-2">Net Profit Margin</td>
                  <td className="px-4 py-2 text-right">11.5%</td>
                  <td className="px-4 py-2 text-right">12.0%</td>
                  <td className="px-4 py-2 text-right">12.5%</td>
                  <td className="px-4 py-2 text-right font-medium">14.2%</td>
                  <td className="px-4 py-2 text-center"><TrendingUp className="w-4 h-4 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-2">Debt to Equity</td>
                  <td className="px-4 py-2 text-right">1.52</td>
                  <td className="px-4 py-2 text-right">1.48</td>
                  <td className="px-4 py-2 text-right">1.41</td>
                  <td className="px-4 py-2 text-right font-medium">1.23</td>
                  <td className="px-4 py-2 text-center"><TrendingDown className="w-4 h-4 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-2">ROE</td>
                  <td className="px-4 py-2 text-right">14.8%</td>
                  <td className="px-4 py-2 text-right">15.5%</td>
                  <td className="px-4 py-2 text-right">16.2%</td>
                  <td className="px-4 py-2 text-right font-medium">18.5%</td>
                  <td className="px-4 py-2 text-center"><TrendingUp className="w-4 h-4 text-green-500 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialRatiosDashboardPage;
