import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Download, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Banknote, CreditCard, PiggyBank } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CashFlowPage = ({ projectId }) => {
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' or 'cumulative'
  const [showActuals, setShowActuals] = useState(true);

  const cashFlowData = {
    projectStart: '2024-01',
    projectEnd: '2025-06',
    months: [
      { month: '2024-01', label: 'Jan 24', sources: { equity: 1200000, loan: 0, sales: 0 }, uses: { land: 2575000, hard: 0, soft: 85000, financing: 58000 }, isActual: true },
      { month: '2024-02', label: 'Feb 24', sources: { equity: 800000, loan: 500000, sales: 0 }, uses: { land: 45000, hard: 125000, soft: 45000, financing: 8500 }, isActual: true },
      { month: '2024-03', label: 'Mar 24', sources: { equity: 500000, loan: 650000, sales: 0 }, uses: { land: 0, hard: 385000, soft: 35000, financing: 12000 }, isActual: true },
      { month: '2024-04', label: 'Apr 24', sources: { equity: 0, loan: 420000, sales: 0 }, uses: { land: 0, hard: 295000, soft: 28000, financing: 18500 }, isActual: true },
      { month: '2024-05', label: 'May 24', sources: { equity: 0, loan: 380000, sales: 0 }, uses: { land: 0, hard: 310000, soft: 22000, financing: 22000 }, isActual: true },
      { month: '2024-06', label: 'Jun 24', sources: { equity: 0, loan: 425000, sales: 0 }, uses: { land: 0, hard: 365000, soft: 25000, financing: 25500 }, isActual: true },
      { month: '2024-07', label: 'Jul 24', sources: { equity: 0, loan: 380000, sales: 0 }, uses: { land: 0, hard: 320000, soft: 18000, financing: 28000 }, isActual: true },
      { month: '2024-08', label: 'Aug 24', sources: { equity: 0, loan: 350000, sales: 0 }, uses: { land: 0, hard: 295000, soft: 15000, financing: 30500 }, isActual: true },
      { month: '2024-09', label: 'Sep 24', sources: { equity: 0, loan: 420000, sales: 0 }, uses: { land: 0, hard: 345000, soft: 22000, financing: 33000 }, isActual: true },
      { month: '2024-10', label: 'Oct 24', sources: { equity: 0, loan: 380000, sales: 0 }, uses: { land: 0, hard: 310000, soft: 28000, financing: 35500 }, isActual: true },
      { month: '2024-11', label: 'Nov 24', sources: { equity: 0, loan: 450000, sales: 0 }, uses: { land: 0, hard: 385000, soft: 25000, financing: 38000 }, isActual: true },
      { month: '2024-12', label: 'Dec 24', sources: { equity: 0, loan: 445000, sales: 0 }, uses: { land: 0, hard: 368000, soft: 32000, financing: 40500 }, isActual: true },
      { month: '2025-01', label: 'Jan 25', sources: { equity: 0, loan: 0, sales: 585000 }, uses: { land: 0, hard: 180000, soft: 65000, financing: 42000 }, isActual: false },
      { month: '2025-02', label: 'Feb 25', sources: { equity: 0, loan: 0, sales: 1267000 }, uses: { land: 0, hard: 95000, soft: 145000, financing: 38000 }, isActual: false },
      { month: '2025-03', label: 'Mar 25', sources: { equity: 0, loan: 0, sales: 1449000 }, uses: { land: 0, hard: 45000, soft: 185000, financing: 32000 }, isActual: false },
      { month: '2025-04', label: 'Apr 25', sources: { equity: 0, loan: 0, sales: 1534000 }, uses: { land: 0, hard: 0, soft: 210000, financing: 25000 }, isActual: false },
      { month: '2025-05', label: 'May 25', sources: { equity: 0, loan: 0, sales: 1449000 }, uses: { land: 0, hard: 0, soft: 195000, financing: 18000 }, isActual: false },
      { month: '2025-06', label: 'Jun 25', sources: { equity: 0, loan: 0, sales: 1556000 }, uses: { land: 0, hard: 0, soft: 218400, financing: 10000 }, isActual: false },
    ],
  };

  // Calculate totals and running balance
  let runningBalance = 0;
  const processedData = cashFlowData.months.map(m => {
    const totalSources = m.sources.equity + m.sources.loan + m.sources.sales;
    const totalUses = m.uses.land + m.uses.hard + m.uses.soft + m.uses.financing;
    const netCashFlow = totalSources - totalUses;
    runningBalance += netCashFlow;
    return {
      ...m,
      totalSources,
      totalUses,
      netCashFlow,
      cumulativeBalance: runningBalance,
    };
  });

  const grandTotals = processedData.reduce((acc, m) => ({
    equity: acc.equity + m.sources.equity,
    loan: acc.loan + m.sources.loan,
    sales: acc.sales + m.sources.sales,
    land: acc.land + m.uses.land,
    hard: acc.hard + m.uses.hard,
    soft: acc.soft + m.uses.soft,
    financing: acc.financing + m.uses.financing,
    totalSources: acc.totalSources + m.totalSources,
    totalUses: acc.totalUses + m.totalUses,
  }), { equity: 0, loan: 0, sales: 0, land: 0, hard: 0, soft: 0, financing: 0, totalSources: 0, totalUses: 0 });

  const maxCashFlow = Math.max(...processedData.map(m => Math.max(m.totalSources, m.totalUses)));
  const minBalance = Math.min(...processedData.map(m => m.cumulativeBalance));
  const maxBalance = Math.max(...processedData.map(m => m.cumulativeBalance));

  const peakEquityNeed = Math.abs(minBalance);
  const currentMonth = '2024-12';

  const formatCurrency = (value) => {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Cash Flow</h1>
          <p className="text-sm text-gray-500">Project cash flow projections and tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight className="w-4 h-4 text-green-500" />
            <p className="text-xs text-gray-500">Total Sources</p>
          </div>
          <p className="text-xl font-semibold text-green-600">{formatCurrency(grandTotals.totalSources)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-red-500">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownRight className="w-4 h-4 text-red-500" />
            <p className="text-xs text-gray-500">Total Uses</p>
          </div>
          <p className="text-xl font-semibold text-red-600">{formatCurrency(grandTotals.totalUses)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-2 mb-1">
            <Banknote className="w-4 h-4 text-blue-500" />
            <p className="text-xs text-gray-500">Net Profit</p>
          </div>
          <p className="text-xl font-semibold text-blue-600">{formatCurrency(grandTotals.totalSources - grandTotals.totalUses)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center gap-2 mb-1">
            <PiggyBank className="w-4 h-4 text-purple-500" />
            <p className="text-xs text-gray-500">Peak Equity Need</p>
          </div>
          <p className="text-xl font-semibold text-purple-600">{formatCurrency(peakEquityNeed)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-4 h-4 text-gray-500" />
            <p className="text-xs text-gray-500">Max Loan Balance</p>
          </div>
          <p className="text-xl font-semibold">{formatCurrency(grandTotals.loan)}</p>
        </div>
      </div>

      {/* Cash Flow Chart */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Cash Flow Chart</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode('monthly')} 
              className={cn("px-3 py-1 rounded text-sm", viewMode === 'monthly' ? "bg-[#047857] text-white" : "bg-gray-100")}
            >
              Monthly
            </button>
            <button 
              onClick={() => setViewMode('cumulative')} 
              className={cn("px-3 py-1 rounded text-sm", viewMode === 'cumulative' ? "bg-[#047857] text-white" : "bg-gray-100")}
            >
              Cumulative
            </button>
          </div>
        </div>
        
        {/* Simple Bar Chart */}
        <div className="relative h-64">
          <div className="absolute inset-0 flex items-end justify-between gap-1 pb-6">
            {processedData.map((m, idx) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                {viewMode === 'monthly' ? (
                  <>
                    <div 
                      className={cn("w-full rounded-t", m.isActual ? "bg-green-500" : "bg-green-300")}
                      style={{ height: `${(m.totalSources / maxCashFlow) * 180}px` }}
                      title={`Sources: ${formatCurrency(m.totalSources)}`}
                    ></div>
                    <div 
                      className={cn("w-full rounded-t", m.isActual ? "bg-red-500" : "bg-red-300")}
                      style={{ height: `${(m.totalUses / maxCashFlow) * 180}px`, marginTop: '-100%', position: 'relative' }}
                      title={`Uses: ${formatCurrency(m.totalUses)}`}
                    ></div>
                  </>
                ) : (
                  <div 
                    className={cn("w-full rounded-t", m.cumulativeBalance >= 0 ? (m.isActual ? "bg-blue-500" : "bg-blue-300") : (m.isActual ? "bg-orange-500" : "bg-orange-300"))}
                    style={{ 
                      height: `${Math.abs(m.cumulativeBalance) / (maxBalance - minBalance) * 180}px`,
                      marginTop: m.cumulativeBalance < 0 ? 'auto' : '0'
                    }}
                    title={`Balance: ${formatCurrency(m.cumulativeBalance)}`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 border-t pt-1">
            {processedData.map((m, idx) => (
              <div key={m.month} className={cn("flex-1 text-center", m.month === currentMonth && "font-bold text-[#047857]")}>
                {m.label}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex gap-4 mt-4 text-xs justify-center">
          {viewMode === 'monthly' ? (
            <>
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded"></div>Sources (Actual)</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-300 rounded"></div>Sources (Projected)</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded"></div>Uses (Actual)</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-300 rounded"></div>Uses (Projected)</span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded"></div>Positive Balance (Actual)</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-300 rounded"></div>Positive Balance (Projected)</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-500 rounded"></div>Negative Balance (Actual)</span>
            </>
          )}
        </div>
      </div>

      {/* Cash Flow Table */}
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full text-sm min-w-[1200px]">
          <thead className="bg-gray-50 border-b sticky top-0">
            <tr>
              <th className="text-left px-3 py-3 font-medium sticky left-0 bg-gray-50 z-10">Category</th>
              {processedData.map(m => (
                <th key={m.month} className={cn("text-right px-2 py-3 font-medium min-w-[80px]", m.month === currentMonth && "bg-green-50", !m.isActual && "text-gray-400")}>
                  {m.label}
                  {m.month === currentMonth && <span className="block text-xs text-green-600">Current</span>}
                </th>
              ))}
              <th className="text-right px-3 py-3 font-medium bg-gray-100">Total</th>
            </tr>
          </thead>
          <tbody>
            {/* Sources Section */}
            <tr className="bg-green-50 font-semibold">
              <td className="px-3 py-2 sticky left-0 bg-green-50">SOURCES</td>
              {processedData.map(m => (
                <td key={m.month} className={cn("px-2 py-2 text-right", m.month === currentMonth && "bg-green-100")}>
                  {formatCurrency(m.totalSources)}
                </td>
              ))}
              <td className="px-3 py-2 text-right bg-green-100">{formatCurrency(grandTotals.totalSources)}</td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-1.5 pl-6 text-gray-600 sticky left-0 bg-white">Equity</td>
              {processedData.map(m => (
                <td key={m.month} className={cn("px-2 py-1.5 text-right text-gray-600", m.month === currentMonth && "bg-green-50")}>
                  {m.sources.equity > 0 ? formatCurrency(m.sources.equity) : '-'}
                </td>
              ))}
              <td className="px-3 py-1.5 text-right bg-gray-50">{formatCurrency(grandTotals.equity)}</td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-1.5 pl-6 text-gray-600 sticky left-0 bg-white">Loan Draws</td>
              {processedData.map(m => (
                <td key={m.month} className={cn("px-2 py-1.5 text-right text-gray-600", m.month === currentMonth && "bg-green-50")}>
                  {m.sources.loan > 0 ? formatCurrency(m.sources.loan) : '-'}
                </td>
              ))}
              <td className="px-3 py-1.5 text-right bg-gray-50">{formatCurrency(grandTotals.loan)}</td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-1.5 pl-6 text-gray-600 sticky left-0 bg-white">Sales Proceeds</td>
              {processedData.map(m => (
                <td key={m.month} className={cn("px-2 py-1.5 text-right text-gray-600", m.month === currentMonth && "bg-green-50")}>
                  {m.sources.sales > 0 ? formatCurrency(m.sources.sales) : '-'}
                </td>
              ))}
              <td className="px-3 py-1.5 text-right bg-gray-50">{formatCurrency(grandTotals.sales)}</td>
            </tr>

            {/* Uses Section */}
            <tr className="bg-red-50 font-semibold">
              <td className="px-3 py-2 sticky left-0 bg-red-50">USES</td>
              {processedData.map(m => (
                <td key={m.month} className={cn("px-2 py-2 text-right", m.month === currentMonth && "bg-red-100")}>
                  {formatCurrency(m.totalUses)}
                </td>
              ))}
              <td className="px-3 py-2 text-right bg-red-100">{formatCurrency(grandTotals.totalUses)}</td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-1.5 pl-6 text-gray-600 sticky left-0 bg-white">Land & Acquisition</td>
              {processedData.map(m => (
                <td key={m.month} className={cn("px-2 py-1.5 text-right text-gray-600", m.month === currentMonth && "bg-red-50")}>
                  {m.uses.land > 0 ? formatCurrency(m.uses.land) : '-'}
                </td>
              ))}
              <td className="px-3 py-1.5 text-right bg-gray-50">{formatCurrency(grandTotals.land)}</td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-1.5 pl-6 text-gray-600 sticky left-0 bg-white">Hard Costs</td>
              {processedData.map(m => (
                <td key={m.month} className={cn("px-2 py-1.5 text-right text-gray-600", m.month === currentMonth && "bg-red-50")}>
                  {m.uses.hard > 0 ? formatCurrency(m.uses.hard) : '-'}
                </td>
              ))}
              <td className="px-3 py-1.5 text-right bg-gray-50">{formatCurrency(grandTotals.hard)}</td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-1.5 pl-6 text-gray-600 sticky left-0 bg-white">Soft Costs</td>
              {processedData.map(m => (
                <td key={m.month} className={cn("px-2 py-1.5 text-right text-gray-600", m.month === currentMonth && "bg-red-50")}>
                  {m.uses.soft > 0 ? formatCurrency(m.uses.soft) : '-'}
                </td>
              ))}
              <td className="px-3 py-1.5 text-right bg-gray-50">{formatCurrency(grandTotals.soft)}</td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-1.5 pl-6 text-gray-600 sticky left-0 bg-white">Financing Costs</td>
              {processedData.map(m => (
                <td key={m.month} className={cn("px-2 py-1.5 text-right text-gray-600", m.month === currentMonth && "bg-red-50")}>
                  {m.uses.financing > 0 ? formatCurrency(m.uses.financing) : '-'}
                </td>
              ))}
              <td className="px-3 py-1.5 text-right bg-gray-50">{formatCurrency(grandTotals.financing)}</td>
            </tr>

            {/* Net Cash Flow */}
            <tr className="bg-blue-50 font-semibold border-t-2">
              <td className="px-3 py-2 sticky left-0 bg-blue-50">NET CASH FLOW</td>
              {processedData.map(m => (
                <td key={m.month} className={cn("px-2 py-2 text-right", m.netCashFlow >= 0 ? "text-green-600" : "text-red-600", m.month === currentMonth && "bg-blue-100")}>
                  {formatCurrency(m.netCashFlow)}
                </td>
              ))}
              <td className="px-3 py-2 text-right bg-blue-100 text-green-600">{formatCurrency(grandTotals.totalSources - grandTotals.totalUses)}</td>
            </tr>

            {/* Cumulative Balance */}
            <tr className="bg-gray-100 font-semibold">
              <td className="px-3 py-2 sticky left-0 bg-gray-100">CUMULATIVE BALANCE</td>
              {processedData.map(m => (
                <td key={m.month} className={cn("px-2 py-2 text-right", m.cumulativeBalance >= 0 ? "text-blue-600" : "text-orange-600", m.month === currentMonth && "bg-gray-200")}>
                  {formatCurrency(m.cumulativeBalance)}
                </td>
              ))}
              <td className="px-3 py-2 text-right bg-gray-200"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CashFlowPage;
