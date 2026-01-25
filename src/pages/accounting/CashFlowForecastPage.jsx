import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Filter, Download, Plus, AlertTriangle, ChevronRight, ArrowUpRight, ArrowDownRight, RefreshCw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CashFlowForecastPage = () => {
  const [forecastPeriod, setForecastPeriod] = useState('90days');
  const [selectedScenario, setSelectedScenario] = useState('base');
  const [showAddInflow, setShowAddInflow] = useState(false);

  const currentCash = 4250000;

  const scenarios = [
    { id: 'optimistic', name: 'Optimistic', color: 'green', endingCash: 6850000 },
    { id: 'base', name: 'Base Case', color: 'blue', endingCash: 5420000 },
    { id: 'conservative', name: 'Conservative', color: 'amber', endingCash: 3980000 },
  ];

  const weeklyForecast = [
    { week: 'Week 1', startDate: 'Dec 30', inflows: 485000, outflows: 320000, net: 165000, endingCash: 4415000 },
    { week: 'Week 2', startDate: 'Jan 6', inflows: 125000, outflows: 580000, net: -455000, endingCash: 3960000 },
    { week: 'Week 3', startDate: 'Jan 13', inflows: 750000, outflows: 285000, net: 465000, endingCash: 4425000 },
    { week: 'Week 4', startDate: 'Jan 20', inflows: 320000, outflows: 445000, net: -125000, endingCash: 4300000 },
    { week: 'Week 5', startDate: 'Jan 27', inflows: 890000, outflows: 375000, net: 515000, endingCash: 4815000 },
    { week: 'Week 6', startDate: 'Feb 3', inflows: 215000, outflows: 520000, net: -305000, endingCash: 4510000 },
    { week: 'Week 7', startDate: 'Feb 10', inflows: 680000, outflows: 295000, net: 385000, endingCash: 4895000 },
    { week: 'Week 8', startDate: 'Feb 17', inflows: 445000, outflows: 380000, net: 65000, endingCash: 4960000 },
    { week: 'Week 9', startDate: 'Feb 24', inflows: 580000, outflows: 425000, net: 155000, endingCash: 5115000 },
    { week: 'Week 10', startDate: 'Mar 3', inflows: 725000, outflows: 290000, net: 435000, endingCash: 5550000 },
    { week: 'Week 11', startDate: 'Mar 10', inflows: 185000, outflows: 485000, net: -300000, endingCash: 5250000 },
    { week: 'Week 12', startDate: 'Mar 17', inflows: 420000, outflows: 250000, net: 170000, endingCash: 5420000 },
  ];

  const upcomingInflows = [
    { id: 'in-1', date: '2025-01-02', description: 'Rental Income - January', amount: 285000, probability: 95, source: 'Recurring' },
    { id: 'in-2', date: '2025-01-05', description: 'Lot Sale - Lot 18 Sunset Ridge', amount: 185000, probability: 85, source: 'Sale' },
    { id: 'in-3', date: '2025-01-15', description: 'Construction Draw - Watson Project', amount: 450000, probability: 90, source: 'Loan' },
    { id: 'in-4', date: '2025-01-20', description: 'Management Fee - Q4', amount: 125000, probability: 100, source: 'Fee' },
    { id: 'in-5', date: '2025-02-01', description: 'Rental Income - February', amount: 285000, probability: 95, source: 'Recurring' },
    { id: 'in-6', date: '2025-02-10', description: 'Home Sale - Lot 12 Completed', amount: 485000, probability: 75, source: 'Sale' },
  ];

  const upcomingOutflows = [
    { id: 'out-1', date: '2025-01-03', description: 'Smith Construction - Draw #7', amount: 185000, type: 'AP', status: 'scheduled' },
    { id: 'out-2', date: '2025-01-05', description: 'Payroll', amount: 95000, type: 'Payroll', status: 'recurring' },
    { id: 'out-3', date: '2025-01-10', description: 'Property Tax - Q1', amount: 125000, type: 'Tax', status: 'scheduled' },
    { id: 'out-4', date: '2025-01-15', description: 'Construction Loan Interest', amount: 78500, type: 'Debt', status: 'recurring' },
    { id: 'out-5', date: '2025-01-20', description: 'Ferguson Supply - Materials', amount: 68000, type: 'AP', status: 'scheduled' },
    { id: 'out-6', date: '2025-01-25', description: 'Insurance Premium', amount: 42000, type: 'Insurance', status: 'recurring' },
  ];

  const minCashPoint = Math.min(...weeklyForecast.map(w => w.endingCash));
  const maxCashPoint = Math.max(...weeklyForecast.map(w => w.endingCash));

  const getProbabilityColor = (prob) => {
    if (prob >= 90) return 'bg-green-100 text-green-700';
    if (prob >= 75) return 'bg-blue-100 text-blue-700';
    if (prob >= 50) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Cash Flow Forecast</h1>
            <p className="text-sm text-gray-500">Projected cash position and upcoming transactions</p>
          </div>
          <div className="flex gap-2">
            <select className="border rounded-md px-3 py-1.5 text-sm" value={forecastPeriod} onChange={(e) => setForecastPeriod(e.target.value)}>
              <option value="30days">30 Days</option>
              <option value="90days">90 Days</option>
              <option value="6months">6 Months</option>
              <option value="12months">12 Months</option>
            </select>
            <Button variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-1" />Refresh</Button>
            <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
            <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm"><Settings className="w-4 h-4 mr-1" />Settings</Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Current Cash</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">${(currentCash / 1000000).toFixed(2)}M</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Projected Inflows</span>
            </div>
            <p className="text-2xl font-bold text-green-700">${(upcomingInflows.reduce((s, i) => s + i.amount, 0) / 1000000).toFixed(2)}M</p>
            <p className="text-xs text-green-600 mt-1">Next 90 days</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownRight className="w-5 h-5 text-red-600" />
              <span className="text-sm text-gray-600">Projected Outflows</span>
            </div>
            <p className="text-2xl font-bold text-red-700">${(upcomingOutflows.reduce((s, o) => s + o.amount, 0) / 1000000).toFixed(2)}M</p>
            <p className="text-xs text-red-600 mt-1">Next 90 days</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-600">Ending Cash (Base)</span>
            </div>
            <p className="text-2xl font-bold text-purple-700">${(scenarios.find(s => s.id === 'base').endingCash / 1000000).toFixed(2)}M</p>
            <p className="text-xs text-purple-600 mt-1">+{(((scenarios.find(s => s.id === 'base').endingCash - currentCash) / currentCash) * 100).toFixed(1)}%</p>
          </div>
          <div className={cn("rounded-lg p-4", minCashPoint < 1000000 ? "bg-amber-50" : "bg-gray-50")}>
            <div className="flex items-center gap-2 mb-2">
              {minCashPoint < 1000000 ? <AlertTriangle className="w-5 h-5 text-amber-600" /> : <DollarSign className="w-5 h-5 text-gray-500" />}
              <span className="text-sm text-gray-600">Minimum Cash</span>
            </div>
            <p className={cn("text-2xl font-bold", minCashPoint < 1000000 ? "text-amber-700" : "text-gray-700")}>${(minCashPoint / 1000000).toFixed(2)}M</p>
            <p className="text-xs text-gray-500 mt-1">Week 2 (Jan 6)</p>
          </div>
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-4">
        <span className="text-sm font-medium text-gray-600">Scenario:</span>
        <div className="flex gap-2">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => setSelectedScenario(scenario.id)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                selectedScenario === scenario.id
                  ? scenario.color === 'green' ? "bg-green-600 text-white"
                    : scenario.color === 'blue' ? "bg-blue-600 text-white"
                      : "bg-amber-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {scenario.name}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-1" />Add Scenario</Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chart Area */}
        <div className="flex-1 p-4 overflow-y-auto">
          {/* Weekly Forecast Table */}
          <div className="bg-white border rounded-lg overflow-hidden mb-4">
            <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
              <h3 className="font-semibold">Weekly Cash Flow Forecast</h3>
              <div className="text-xs text-gray-500">12-week projection</div>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Week</th>
                  <th className="text-left px-4 py-3 font-medium">Start Date</th>
                  <th className="text-right px-4 py-3 font-medium text-green-600">Inflows</th>
                  <th className="text-right px-4 py-3 font-medium text-red-600">Outflows</th>
                  <th className="text-right px-4 py-3 font-medium">Net Change</th>
                  <th className="text-right px-4 py-3 font-medium">Ending Cash</th>
                  <th className="w-32 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {weeklyForecast.map((week, idx) => (
                  <tr key={week.week} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{week.week}</td>
                    <td className="px-4 py-3 text-gray-500">{week.startDate}</td>
                    <td className="px-4 py-3 text-right text-green-600">+${(week.inflows / 1000).toFixed(0)}K</td>
                    <td className="px-4 py-3 text-right text-red-600">-${(week.outflows / 1000).toFixed(0)}K</td>
                    <td className={cn("px-4 py-3 text-right font-medium", week.net >= 0 ? "text-green-600" : "text-red-600")}>
                      {week.net >= 0 ? '+' : ''}{(week.net / 1000).toFixed(0)}K
                    </td>
                    <td className="px-4 py-3 text-right font-bold">${(week.endingCash / 1000000).toFixed(2)}M</td>
                    <td className="px-4 py-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={cn("h-2 rounded-full", week.endingCash < 2000000 ? "bg-red-500" : week.endingCash < 4000000 ? "bg-amber-500" : "bg-green-500")}
                          style={{ width: `${(week.endingCash / maxCashPoint) * 100}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel - Upcoming Transactions */}
        <div className="w-96 border-l bg-white overflow-y-auto">
          {/* Inflows */}
          <div className="border-b">
            <div className="px-4 py-3 bg-green-50 flex items-center justify-between">
              <h3 className="font-semibold text-green-800 flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4" />
                Upcoming Inflows
              </h3>
              <Button variant="ghost" size="sm" className="text-green-700" onClick={() => setShowAddInflow(true)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="divide-y">
              {upcomingInflows.map((item) => (
                <div key={item.id} className="p-3 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{item.date}</span>
                        <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded">{item.source}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">+${item.amount.toLocaleString()}</p>
                      <span className={cn("text-xs px-1.5 py-0.5 rounded", getProbabilityColor(item.probability))}>
                        {item.probability}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Outflows */}
          <div>
            <div className="px-4 py-3 bg-red-50 flex items-center justify-between">
              <h3 className="font-semibold text-red-800 flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4" />
                Upcoming Outflows
              </h3>
              <Button variant="ghost" size="sm" className="text-red-700">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="divide-y">
              {upcomingOutflows.map((item) => (
                <div key={item.id} className="p-3 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{item.date}</span>
                        <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded">{item.type}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">-${item.amount.toLocaleString()}</p>
                      <span className={cn("text-xs px-1.5 py-0.5 rounded",
                        item.status === 'recurring' ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                      )}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlowForecastPage;
