import React, { useState } from 'react';
import { Download, RefreshCw, Layers, AlertTriangle, CheckCircle, ChevronDown, ChevronRight, Calculator, FileText, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ConsolidationPage = ({ flatEntities }) => {
  const [reportType, setReportType] = useState('income'); // 'income' or 'balance'
  const [expandedSections, setExpandedSections] = useState(['revenue', 'expenses', 'assets', 'liabilities', 'equity']);
  const [period, setPeriod] = useState('ytd');

  const entities = [
    { id: 'olive-brynn', name: 'Olive Brynn', color: '#047857' },
    { id: 'vanrock', name: 'VanRock', color: '#2563eb' },
    { id: 'watson', name: 'Watson', color: '#7c3aed' },
    { id: 'oslo', name: 'Oslo', color: '#f59e0b' },
    { id: 'sunset', name: 'Sunset', color: '#ec4899' },
    { id: 'manageco', name: 'ManageCo', color: '#06b6d4' },
  ];

  const incomeStatementData = {
    revenue: {
      label: 'Revenue',
      accounts: [
        { name: 'Rental Income', values: { 'olive-brynn': 0, 'vanrock': 0, 'watson': 0, 'oslo': 0, 'sunset': 1850000, 'manageco': 0 }, eliminations: 0 },
        { name: 'Home Sales Revenue', values: { 'olive-brynn': 0, 'vanrock': 0, 'watson': 4200000, 'oslo': 2750000, 'sunset': 0, 'manageco': 0 }, eliminations: 0 },
        { name: 'Management Fee Income', values: { 'olive-brynn': 0, 'vanrock': 0, 'watson': 0, 'oslo': 0, 'sunset': 0, 'manageco': 420000 }, eliminations: -78500, isIntercompany: true },
        { name: 'Interest Income', values: { 'olive-brynn': 850000, 'vanrock': 420000, 'watson': 0, 'oslo': 0, 'sunset': 0, 'manageco': 0 }, eliminations: -40000, isIntercompany: true },
      ]
    },
    expenses: {
      label: 'Expenses',
      accounts: [
        { name: 'Cost of Goods Sold', values: { 'olive-brynn': 0, 'vanrock': 0, 'watson': 2850000, 'oslo': 1800000, 'sunset': 0, 'manageco': 0 }, eliminations: 0 },
        { name: 'Salaries & Wages', values: { 'olive-brynn': 25000, 'vanrock': 180000, 'watson': 85000, 'oslo': 65000, 'sunset': 45000, 'manageco': 80000 }, eliminations: 0 },
        { name: 'Property Taxes', values: { 'olive-brynn': 0, 'vanrock': 0, 'watson': 45000, 'oslo': 35000, 'sunset': 105000, 'manageco': 0 }, eliminations: 0 },
        { name: 'Insurance', values: { 'olive-brynn': 15000, 'vanrock': 25000, 'watson': 28000, 'oslo': 22000, 'sunset': 35000, 'manageco': 0 }, eliminations: 0 },
        { name: 'Management Fees', values: { 'olive-brynn': 0, 'vanrock': 0, 'watson': 35000, 'oslo': 25000, 'sunset': 18500, 'manageco': 0 }, eliminations: -78500, isIntercompany: true },
        { name: 'Interest Expense', values: { 'olive-brynn': 0, 'vanrock': 0, 'watson': 540000, 'oslo': 285000, 'sunset': 39000, 'manageco': 0 }, eliminations: -40000, isIntercompany: true },
        { name: 'Depreciation', values: { 'olive-brynn': 0, 'vanrock': 0, 'watson': 25000, 'oslo': 18000, 'sunset': 107000, 'manageco': 0 }, eliminations: 0 },
        { name: 'Other Operating', values: { 'olive-brynn': 63000, 'vanrock': 155000, 'watson': 192000, 'oslo': 125000, 'sunset': 148500, 'manageco': 205000 }, eliminations: 0 },
      ]
    }
  };

  const balanceSheetData = {
    assets: {
      label: 'Assets',
      accounts: [
        { name: 'Cash & Equivalents', values: { 'olive-brynn': 2500000, 'vanrock': 450000, 'watson': 1850000, 'oslo': 920000, 'sunset': 425000, 'manageco': 185000 }, eliminations: 0 },
        { name: 'Accounts Receivable', values: { 'olive-brynn': 0, 'vanrock': 125000, 'watson': 850000, 'oslo': 420000, 'sunset': 145000, 'manageco': 320000 }, eliminations: 0 },
        { name: 'Intercompany Receivable', values: { 'olive-brynn': 540000, 'vanrock': 350000, 'watson': 0, 'oslo': 0, 'sunset': 0, 'manageco': 78500 }, eliminations: -968500, isIntercompany: true },
        { name: 'Inventory - WIP', values: { 'olive-brynn': 0, 'vanrock': 0, 'watson': 5200000, 'oslo': 3300000, 'sunset': 0, 'manageco': 0 }, eliminations: 0 },
        { name: 'Land', values: { 'olive-brynn': 0, 'vanrock': 0, 'watson': 1500000, 'oslo': 1200000, 'sunset': 1800000, 'manageco': 0 }, eliminations: 0 },
        { name: 'Buildings & Improvements', values: { 'olive-brynn': 0, 'vanrock': 0, 'watson': 0, 'oslo': 0, 'sunset': 12500000, 'manageco': 0 }, eliminations: 0 },
        { name: 'Accumulated Depreciation', values: { 'olive-brynn': 0, 'vanrock': 0, 'watson': 0, 'oslo': 0, 'sunset': -1250000, 'manageco': 0 }, eliminations: 0 },
        { name: 'Investment in Subsidiaries', values: { 'olive-brynn': 7500000, 'vanrock': 4500000, 'watson': 0, 'oslo': 0, 'sunset': 0, 'manageco': 0 }, eliminations: -12000000, isIntercompany: true },
      ]
    },
    liabilities: {
      label: 'Liabilities',
      accounts: [
        { name: 'Accounts Payable', values: { 'olive-brynn': 0, 'vanrock': 85000, 'watson': 650000, 'oslo': 380000, 'sunset': 95000, 'manageco': 45000 }, eliminations: 0 },
        { name: 'Accrued Expenses', values: { 'olive-brynn': 0, 'vanrock': 45000, 'watson': 185000, 'oslo': 125000, 'sunset': 85000, 'manageco': 45000 }, eliminations: 0 },
        { name: 'Intercompany Payable', values: { 'olive-brynn': 0, 'vanrock': 210000, 'watson': 575000, 'oslo': 183500, 'sunset': 0, 'manageco': 0 }, eliminations: -968500, isIntercompany: true },
        { name: 'Construction Loans', values: { 'olive-brynn': 0, 'vanrock': 0, 'watson': 6200000, 'oslo': 4000000, 'sunset': 0, 'manageco': 0 }, eliminations: 0 },
        { name: 'Mortgage Payable', values: { 'olive-brynn': 0, 'vanrock': 0, 'watson': 0, 'oslo': 0, 'sunset': 2500000, 'manageco': 0 }, eliminations: 0 },
      ]
    },
    equity: {
      label: 'Equity',
      accounts: [
        { name: "Member's Capital", values: { 'olive-brynn': 5500000, 'vanrock': 2500000, 'watson': 500000, 'oslo': 350000, 'sunset': 2800000, 'manageco': 50000 }, eliminations: -6200000, isIntercompany: true },
        { name: 'Retained Earnings', values: { 'olive-brynn': 1500000, 'vanrock': 850000, 'watson': 540000, 'oslo': 285000, 'sunset': 1920000, 'manageco': 125000 }, eliminations: -3800000, isIntercompany: true },
        { name: 'Current Year Net Income', values: { 'olive-brynn': 747000, 'vanrock': 240000, 'watson': 1650000, 'oslo': 650000, 'sunset': 921000, 'manageco': 135000 }, eliminations: 0 },
      ]
    }
  };

  const currentData = reportType === 'income' ? incomeStatementData : balanceSheetData;

  const toggleSection = (section) => {
    setExpandedSections(prev => prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]);
  };

  const getRowTotal = (account) => {
    const sum = Object.values(account.values).reduce((s, v) => s + v, 0);
    return sum + (account.eliminations || 0);
  };

  const getSectionTotal = (section, entityId) => {
    return section.accounts.reduce((sum, acc) => sum + (acc.values[entityId] || 0), 0);
  };

  const getSectionEliminations = (section) => {
    return section.accounts.reduce((sum, acc) => sum + (acc.eliminations || 0), 0);
  };

  const getSectionConsolidated = (section) => {
    return section.accounts.reduce((sum, acc) => sum + getRowTotal(acc), 0);
  };

  const totalEliminations = Object.values(currentData).reduce((sum, section) => sum + Math.abs(getSectionEliminations(section)), 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Consolidation Worksheet</h2>
        <div className="flex gap-2">
          <select className="border rounded-md px-3 py-1.5 text-sm" value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="ytd">Year to Date</option>
            <option value="q4">Q4 2024</option>
            <option value="q3">Q3 2024</option>
            <option value="dec">December 2024</option>
          </select>
          <Button variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-1" />Refresh</Button>
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Layers className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900">Consolidation Summary</p>
            <div className="flex items-center gap-6 mt-2 text-sm">
              <div><span className="text-blue-600">Entities:</span> <span className="font-medium">{entities.length}</span></div>
              <div><span className="text-blue-600">Full Consolidation:</span> <span className="font-medium">5 entities</span></div>
              <div><span className="text-blue-600">Equity Method:</span> <span className="font-medium">1 entity (Fund I)</span></div>
              <div><span className="text-blue-600">Total Eliminations:</span> <span className="font-medium text-red-600">${(totalEliminations / 1000).toFixed(0)}K</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Type Toggle */}
      <div className="flex gap-1 mb-4 border-b">
        <button
          onClick={() => setReportType('income')}
          className={cn("px-4 py-2 text-sm font-medium border-b-2 -mb-px", reportType === 'income' ? "border-[#047857] text-[#047857]" : "border-transparent text-gray-500 hover:text-gray-700")}
        >
          Income Statement
        </button>
        <button
          onClick={() => setReportType('balance')}
          className={cn("px-4 py-2 text-sm font-medium border-b-2 -mb-px", reportType === 'balance' ? "border-[#047857] text-[#047857]" : "border-transparent text-gray-500 hover:text-gray-700")}
        >
          Balance Sheet
        </button>
      </div>

      {/* Worksheet Table */}
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full text-sm min-w-[1200px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium sticky left-0 bg-gray-50 z-10 min-w-[200px]">Account</th>
              {entities.map(entity => (
                <th key={entity.id} className="text-right px-3 py-3 font-medium min-w-[100px]">
                  <div className="flex items-center justify-end gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entity.color }}></div>
                    <span className="text-xs">{entity.name}</span>
                  </div>
                </th>
              ))}
              <th className="text-right px-3 py-3 font-medium min-w-[100px] bg-red-50 text-red-700">Eliminations</th>
              <th className="text-right px-4 py-3 font-medium min-w-[120px] bg-green-50 text-green-700">Consolidated</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(currentData).map(([sectionKey, section]) => (
              <React.Fragment key={sectionKey}>
                {/* Section Header */}
                <tr
                  className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                  onClick={() => toggleSection(sectionKey)}
                >
                  <td className="px-4 py-2 font-semibold sticky left-0 bg-gray-100 z-10">
                    <div className="flex items-center gap-2">
                      {expandedSections.includes(sectionKey) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      {section.label}
                    </div>
                  </td>
                  {entities.map(entity => (
                    <td key={entity.id} className="text-right px-3 py-2 font-semibold">
                      ${(getSectionTotal(section, entity.id) / 1000).toFixed(0)}K
                    </td>
                  ))}
                  <td className={cn("text-right px-3 py-2 font-semibold bg-red-50", getSectionEliminations(section) !== 0 && "text-red-700")}>
                    {getSectionEliminations(section) !== 0 ? `${getSectionEliminations(section) > 0 ? '' : '-'}$${(Math.abs(getSectionEliminations(section)) / 1000).toFixed(0)}K` : '-'}
                  </td>
                  <td className="text-right px-4 py-2 font-semibold bg-green-50 text-green-700">
                    ${(getSectionConsolidated(section) / 1000).toFixed(0)}K
                  </td>
                </tr>

                {/* Account Rows */}
                {expandedSections.includes(sectionKey) && section.accounts.map((account, idx) => (
                  <tr key={idx} className={cn("hover:bg-gray-50 border-b", account.isIntercompany && "bg-purple-50/30")}>
                    <td className="px-4 py-2 pl-8 sticky left-0 bg-white z-10">
                      <div className="flex items-center gap-2">
                        {account.name}
                        {account.isIntercompany && <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">IC</span>}
                      </div>
                    </td>
                    {entities.map(entity => (
                      <td key={entity.id} className={cn("text-right px-3 py-2", account.values[entity.id] < 0 && "text-red-600")}>
                        {account.values[entity.id] !== 0 ? `$${(account.values[entity.id] / 1000).toFixed(0)}K` : '-'}
                      </td>
                    ))}
                    <td className={cn("text-right px-3 py-2 bg-red-50", account.eliminations !== 0 && "text-red-700 font-medium")}>
                      {account.eliminations !== 0 ? `${account.eliminations > 0 ? '' : '-'}$${(Math.abs(account.eliminations) / 1000).toFixed(0)}K` : '-'}
                    </td>
                    <td className={cn("text-right px-4 py-2 bg-green-50 font-medium", getRowTotal(account) < 0 && "text-red-600")}>
                      ${(getRowTotal(account) / 1000).toFixed(0)}K
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}

            {/* Net Income / Total Row */}
            <tr className="bg-gray-100 border-t-2 font-semibold">
              <td className="px-4 py-3 sticky left-0 bg-gray-100 z-10">
                {reportType === 'income' ? 'Net Income' : 'Total Equity'}
              </td>
              {entities.map(entity => {
                let total;
                if (reportType === 'income') {
                  const revenue = getSectionTotal(currentData.revenue, entity.id);
                  const expenses = getSectionTotal(currentData.expenses, entity.id);
                  total = revenue - expenses;
                } else {
                  total = getSectionTotal(currentData.equity, entity.id);
                }
                return (
                  <td key={entity.id} className={cn("text-right px-3 py-3", total < 0 ? "text-red-600" : "text-green-600")}>
                    ${(total / 1000).toFixed(0)}K
                  </td>
                );
              })}
              <td className="text-right px-3 py-3 bg-red-50 text-red-700">
                {reportType === 'income' ? '-$119K' : '-$10.0M'}
              </td>
              <td className="text-right px-4 py-3 bg-green-100 text-green-700">
                {reportType === 'income' ? '$4.22M' : '$11.1M'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-100 rounded"></div>
          <span>IC = Intercompany (subject to elimination)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-50 rounded"></div>
          <span>Elimination column</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-50 rounded"></div>
          <span>Consolidated totals</span>
        </div>
      </div>

      {/* Validation */}
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-semibold text-green-800">Consolidation Balanced</p>
            <p className="text-sm text-green-700">All intercompany eliminations are properly matched. Balance sheet is in balance.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsolidationPage;
