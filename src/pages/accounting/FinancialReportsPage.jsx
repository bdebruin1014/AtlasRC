import React, { useState } from 'react';
import { Download, Printer, Calendar, Building2, ChevronDown, TrendingUp, TrendingDown, FileText, BarChart3, PieChart, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const FinancialReportsPage = ({ selectedEntity, viewMode, flatEntities }) => {
  const [activeReport, setActiveReport] = useState('income-statement');
  const [period, setPeriod] = useState('ytd');
  const [compareToast, setCompareToast] = useState('prior-year');

  const reportTypes = [
    { id: 'income-statement', label: 'Income Statement (P&L)', icon: TrendingUp },
    { id: 'balance-sheet', label: 'Balance Sheet', icon: Layers },
    { id: 'cash-flow', label: 'Cash Flow Statement', icon: BarChart3 },
    { id: 'trial-balance', label: 'Trial Balance', icon: FileText },
    { id: 'ar-aging', label: 'A/R Aging', icon: TrendingDown },
    { id: 'ap-aging', label: 'A/P Aging', icon: TrendingDown },
  ];

  const incomeStatementData = {
    revenue: [
      { name: 'Rental Income', current: 1850000, prior: 1720000 },
      { name: 'Home Sales Revenue', current: 6950000, prior: 5200000 },
      { name: 'Management Fee Income', current: 420000, prior: 380000, elimination: 78500 },
      { name: 'Interest Income', current: 1270000, prior: 950000, elimination: 40000 },
    ],
    expenses: [
      { name: 'Cost of Goods Sold', current: 4650000, prior: 3800000 },
      { name: 'Operating Expenses', current: 1497000, prior: 1320000, elimination: 78500 },
      { name: 'Payroll Expense', current: 480000, prior: 420000 },
      { name: 'Property Taxes', current: 185000, prior: 175000 },
      { name: 'Insurance', current: 125000, prior: 115000 },
      { name: 'Depreciation', current: 150000, prior: 150000 },
      { name: 'Interest Expense', current: 864000, prior: 720000, elimination: 40000 },
    ],
  };

  const balanceSheetData = {
    assets: {
      current: [
        { name: 'Cash & Equivalents', amount: 6450000 },
        { name: 'Accounts Receivable', amount: 1860000 },
        { name: 'Inventory (WIP)', amount: 8500000 },
        { name: 'Prepaid Expenses', amount: 125000 },
      ],
      fixed: [
        { name: 'Land', amount: 4500000 },
        { name: 'Buildings & Improvements', amount: 12500000 },
        { name: 'Accumulated Depreciation', amount: -1250000 },
        { name: 'Equipment', amount: 350000 },
      ],
      other: [
        { name: 'Investment in Subsidiaries', amount: viewMode === 'consolidated' ? 0 : 7500000, elimination: viewMode === 'consolidated' },
        { name: 'Intercompany Receivables', amount: viewMode === 'consolidated' ? 0 : 540000, elimination: viewMode === 'consolidated' },
      ],
    },
    liabilities: {
      current: [
        { name: 'Accounts Payable', amount: 1270000 },
        { name: 'Accrued Expenses', amount: 485000 },
        { name: 'Intercompany Payables', amount: viewMode === 'consolidated' ? 0 : 540000, elimination: viewMode === 'consolidated' },
        { name: 'Current Portion - Long Term Debt', amount: 450000 },
      ],
      longTerm: [
        { name: 'Construction Loans', amount: 10200000 },
        { name: 'Mortgage Payable', amount: 2500000 },
      ],
    },
    equity: [
      { name: "Member's Capital", amount: 5500000 },
      { name: 'Retained Earnings', amount: 2150000 },
      { name: 'Current Year Net Income', amount: 3479000 },
    ],
  };

  const totalRevenue = incomeStatementData.revenue.reduce((s, r) => s + r.current - (viewMode === 'consolidated' ? (r.elimination || 0) : 0), 0);
  const totalExpenses = incomeStatementData.expenses.reduce((s, e) => s + e.current - (viewMode === 'consolidated' ? (e.elimination || 0) : 0), 0);
  const netIncome = totalRevenue - totalExpenses;

  const totalAssets = [...balanceSheetData.assets.current, ...balanceSheetData.assets.fixed, ...balanceSheetData.assets.other].reduce((s, a) => s + a.amount, 0);
  const totalLiabilities = [...balanceSheetData.liabilities.current, ...balanceSheetData.liabilities.longTerm].reduce((s, l) => s + l.amount, 0);
  const totalEquity = balanceSheetData.equity.reduce((s, e) => s + e.amount, 0);

  const renderIncomeStatement = () => (
    <div className="bg-white border rounded-lg">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-semibold text-center">Income Statement (Profit & Loss)</h3>
        <p className="text-sm text-gray-500 text-center">
          {flatEntities?.find(e => e.id === selectedEntity)?.name || 'All Entities'} 
          {viewMode === 'consolidated' && ' (Consolidated)'}
          {' • '}{period === 'ytd' ? 'Year to Date' : period}
        </p>
      </div>
      <div className="p-4">
        <table className="w-full text-sm">
          <thead className="text-xs text-gray-500 uppercase">
            <tr>
              <th className="text-left py-2">Account</th>
              <th className="text-right py-2">Current Period</th>
              <th className="text-right py-2">Prior Year</th>
              <th className="text-right py-2">Variance</th>
              <th className="text-right py-2">% Change</th>
            </tr>
          </thead>
          <tbody>
            <tr className="font-semibold bg-emerald-50">
              <td colSpan={5} className="py-2 px-2">REVENUE</td>
            </tr>
            {incomeStatementData.revenue.map((item, i) => {
              const current = item.current - (viewMode === 'consolidated' ? (item.elimination || 0) : 0);
              const variance = current - item.prior;
              const pctChange = ((variance / item.prior) * 100).toFixed(1);
              return (
                <tr key={i} className="hover:bg-gray-50 border-b">
                  <td className="py-2 pl-6">{item.name}{item.elimination && viewMode === 'consolidated' && <span className="text-xs text-blue-500 ml-2">(-${(item.elimination/1000).toFixed(0)}K elim)</span>}</td>
                  <td className="py-2 text-right">${current.toLocaleString()}</td>
                  <td className="py-2 text-right text-gray-500">${item.prior.toLocaleString()}</td>
                  <td className={cn("py-2 text-right", variance >= 0 ? "text-green-600" : "text-red-600")}>{variance >= 0 ? '+' : ''}${variance.toLocaleString()}</td>
                  <td className={cn("py-2 text-right", variance >= 0 ? "text-green-600" : "text-red-600")}>{variance >= 0 ? '+' : ''}{pctChange}%</td>
                </tr>
              );
            })}
            <tr className="font-semibold bg-emerald-100">
              <td className="py-2 px-2">Total Revenue</td>
              <td className="py-2 text-right">${totalRevenue.toLocaleString()}</td>
              <td className="py-2 text-right">${incomeStatementData.revenue.reduce((s, r) => s + r.prior, 0).toLocaleString()}</td>
              <td className="py-2 text-right text-green-600">+${(totalRevenue - incomeStatementData.revenue.reduce((s, r) => s + r.prior, 0)).toLocaleString()}</td>
              <td className="py-2 text-right text-green-600">+{(((totalRevenue - incomeStatementData.revenue.reduce((s, r) => s + r.prior, 0)) / incomeStatementData.revenue.reduce((s, r) => s + r.prior, 0)) * 100).toFixed(1)}%</td>
            </tr>
            <tr className="font-semibold bg-red-50">
              <td colSpan={5} className="py-2 px-2">EXPENSES</td>
            </tr>
            {incomeStatementData.expenses.map((item, i) => {
              const current = item.current - (viewMode === 'consolidated' ? (item.elimination || 0) : 0);
              const variance = current - item.prior;
              const pctChange = ((variance / item.prior) * 100).toFixed(1);
              return (
                <tr key={i} className="hover:bg-gray-50 border-b">
                  <td className="py-2 pl-6">{item.name}{item.elimination && viewMode === 'consolidated' && <span className="text-xs text-blue-500 ml-2">(-${(item.elimination/1000).toFixed(0)}K elim)</span>}</td>
                  <td className="py-2 text-right">${current.toLocaleString()}</td>
                  <td className="py-2 text-right text-gray-500">${item.prior.toLocaleString()}</td>
                  <td className={cn("py-2 text-right", variance <= 0 ? "text-green-600" : "text-red-600")}>{variance >= 0 ? '+' : ''}${variance.toLocaleString()}</td>
                  <td className={cn("py-2 text-right", variance <= 0 ? "text-green-600" : "text-red-600")}>{variance >= 0 ? '+' : ''}{pctChange}%</td>
                </tr>
              );
            })}
            <tr className="font-semibold bg-red-100">
              <td className="py-2 px-2">Total Expenses</td>
              <td className="py-2 text-right">${totalExpenses.toLocaleString()}</td>
              <td className="py-2 text-right">${incomeStatementData.expenses.reduce((s, e) => s + e.prior, 0).toLocaleString()}</td>
              <td className="py-2 text-right"></td>
              <td className="py-2 text-right"></td>
            </tr>
            <tr className="font-bold text-lg bg-blue-100">
              <td className="py-3 px-2">NET INCOME</td>
              <td className="py-3 text-right text-[#047857]">${netIncome.toLocaleString()}</td>
              <td className="py-3 text-right">${(incomeStatementData.revenue.reduce((s, r) => s + r.prior, 0) - incomeStatementData.expenses.reduce((s, e) => s + e.prior, 0)).toLocaleString()}</td>
              <td className="py-3 text-right text-green-600">+${(netIncome - (incomeStatementData.revenue.reduce((s, r) => s + r.prior, 0) - incomeStatementData.expenses.reduce((s, e) => s + e.prior, 0))).toLocaleString()}</td>
              <td className="py-3 text-right text-green-600">+{(((netIncome - (incomeStatementData.revenue.reduce((s, r) => s + r.prior, 0) - incomeStatementData.expenses.reduce((s, e) => s + e.prior, 0))) / (incomeStatementData.revenue.reduce((s, r) => s + r.prior, 0) - incomeStatementData.expenses.reduce((s, e) => s + e.prior, 0))) * 100).toFixed(1)}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBalanceSheet = () => (
    <div className="bg-white border rounded-lg">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-semibold text-center">Balance Sheet</h3>
        <p className="text-sm text-gray-500 text-center">
          {flatEntities?.find(e => e.id === selectedEntity)?.name || 'All Entities'} 
          {viewMode === 'consolidated' && ' (Consolidated)'}
          {' • '}As of December 31, 2024
        </p>
      </div>
      <div className="p-4">
        <table className="w-full text-sm">
          <tbody>
            <tr className="font-semibold bg-blue-50"><td colSpan={2} className="py-2 px-2">ASSETS</td></tr>
            <tr className="font-medium bg-blue-50/50"><td colSpan={2} className="py-2 px-4">Current Assets</td></tr>
            {balanceSheetData.assets.current.map((item, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="py-2 pl-8">{item.name}</td>
                <td className="py-2 text-right">${item.amount.toLocaleString()}</td>
              </tr>
            ))}
            <tr className="font-medium border-b">
              <td className="py-2 pl-4">Total Current Assets</td>
              <td className="py-2 text-right">${balanceSheetData.assets.current.reduce((s, a) => s + a.amount, 0).toLocaleString()}</td>
            </tr>
            <tr className="font-medium bg-blue-50/50"><td colSpan={2} className="py-2 px-4">Fixed Assets</td></tr>
            {balanceSheetData.assets.fixed.map((item, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="py-2 pl-8">{item.name}</td>
                <td className="py-2 text-right">{item.amount < 0 ? `(${Math.abs(item.amount).toLocaleString()})` : `$${item.amount.toLocaleString()}`}</td>
              </tr>
            ))}
            <tr className="font-medium border-b">
              <td className="py-2 pl-4">Total Fixed Assets</td>
              <td className="py-2 text-right">${balanceSheetData.assets.fixed.reduce((s, a) => s + a.amount, 0).toLocaleString()}</td>
            </tr>
            {balanceSheetData.assets.other.filter(a => a.amount !== 0).length > 0 && (
              <>
                <tr className="font-medium bg-blue-50/50"><td colSpan={2} className="py-2 px-4">Other Assets</td></tr>
                {balanceSheetData.assets.other.filter(a => a.amount !== 0).map((item, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="py-2 pl-8">{item.name}{item.elimination && <span className="text-xs text-blue-500 ml-2">(eliminated)</span>}</td>
                    <td className="py-2 text-right">${item.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </>
            )}
            <tr className="font-bold bg-blue-100">
              <td className="py-3 px-2">TOTAL ASSETS</td>
              <td className="py-3 text-right">${totalAssets.toLocaleString()}</td>
            </tr>

            <tr><td colSpan={2} className="py-2"></td></tr>

            <tr className="font-semibold bg-red-50"><td colSpan={2} className="py-2 px-2">LIABILITIES</td></tr>
            <tr className="font-medium bg-red-50/50"><td colSpan={2} className="py-2 px-4">Current Liabilities</td></tr>
            {balanceSheetData.liabilities.current.filter(l => l.amount !== 0).map((item, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="py-2 pl-8">{item.name}{item.elimination && <span className="text-xs text-blue-500 ml-2">(eliminated)</span>}</td>
                <td className="py-2 text-right">${item.amount.toLocaleString()}</td>
              </tr>
            ))}
            <tr className="font-medium border-b">
              <td className="py-2 pl-4">Total Current Liabilities</td>
              <td className="py-2 text-right">${balanceSheetData.liabilities.current.reduce((s, l) => s + l.amount, 0).toLocaleString()}</td>
            </tr>
            <tr className="font-medium bg-red-50/50"><td colSpan={2} className="py-2 px-4">Long-Term Liabilities</td></tr>
            {balanceSheetData.liabilities.longTerm.map((item, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="py-2 pl-8">{item.name}</td>
                <td className="py-2 text-right">${item.amount.toLocaleString()}</td>
              </tr>
            ))}
            <tr className="font-bold bg-red-100">
              <td className="py-3 px-2">TOTAL LIABILITIES</td>
              <td className="py-3 text-right">${totalLiabilities.toLocaleString()}</td>
            </tr>

            <tr><td colSpan={2} className="py-2"></td></tr>

            <tr className="font-semibold bg-emerald-50"><td colSpan={2} className="py-2 px-2">EQUITY</td></tr>
            {balanceSheetData.equity.map((item, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="py-2 pl-8">{item.name}</td>
                <td className="py-2 text-right">${item.amount.toLocaleString()}</td>
              </tr>
            ))}
            <tr className="font-bold bg-emerald-100">
              <td className="py-3 px-2">TOTAL EQUITY</td>
              <td className="py-3 text-right">${totalEquity.toLocaleString()}</td>
            </tr>

            <tr className="font-bold text-lg bg-gray-200">
              <td className="py-3 px-2">TOTAL LIABILITIES & EQUITY</td>
              <td className="py-3 text-right">${(totalLiabilities + totalEquity).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReport = () => {
    switch (activeReport) {
      case 'income-statement': return renderIncomeStatement();
      case 'balance-sheet': return renderBalanceSheet();
      default: return (
        <div className="bg-white border rounded-lg p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 font-medium">{reportTypes.find(r => r.id === activeReport)?.label}</p>
          <p className="text-gray-400 text-sm mt-2">Mock data interface - Real integration coming</p>
        </div>
      );
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Financial Reports</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Printer className="w-4 h-4 mr-1" />Print</Button>
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export PDF</Button>
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export Excel</Button>
        </div>
      </div>

      {/* Report Selector & Filters */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex gap-4 items-center">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Report Type</label>
            <select 
              className="border rounded-md px-3 py-2 text-sm w-56"
              value={activeReport}
              onChange={(e) => setActiveReport(e.target.value)}
            >
              {reportTypes.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Period</label>
            <select 
              className="border rounded-md px-3 py-2 text-sm"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="ytd">Year to Date (2024)</option>
              <option value="q4">Q4 2024</option>
              <option value="q3">Q3 2024</option>
              <option value="dec">December 2024</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Compare To</label>
            <select 
              className="border rounded-md px-3 py-2 text-sm"
              value={compareToast}
              onChange={(e) => setCompareToast(e.target.value)}
            >
              <option value="prior-year">Prior Year</option>
              <option value="prior-period">Prior Period</option>
              <option value="budget">Budget</option>
              <option value="none">No Comparison</option>
            </select>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-gray-500">View:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button className={cn("px-3 py-1 text-sm rounded", viewMode === 'consolidated' ? "bg-white shadow" : "")}>Consolidated</button>
              <button className={cn("px-3 py-1 text-sm rounded", viewMode === 'standalone' ? "bg-white shadow" : "")}>Standalone</button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {renderReport()}
    </div>
  );
};

export default FinancialReportsPage;
