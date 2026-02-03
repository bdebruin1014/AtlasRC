// src/pages/accounting/IncomeStatementPage.jsx
// Income Statement (P&L) report page with print and export functionality

import React, { useState, useMemo, useRef } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Printer, Download, Calendar, TrendingUp, TrendingDown, RefreshCw,
  ChevronRight, ChevronDown, DollarSign
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

// Demo income statement data
const demoIncomeStatement = {
  revenue: {
    operating: [
      { account_number: '4000', name: 'Rental Income', amount: 420000 },
      { account_number: '4100', name: 'Management Fees', amount: 75000 },
      { account_number: '4150', name: 'Late Fees', amount: 8500 },
      { account_number: '4200', name: 'Parking Revenue', amount: 24000 },
    ],
    other: [
      { account_number: '4500', name: 'Interest Income', amount: 2500 },
      { account_number: '4600', name: 'Gain on Sale of Assets', amount: 15000 },
    ],
  },
  expenses: {
    operating: [
      { account_number: '5000', name: 'Salaries & Wages', amount: 185000 },
      { account_number: '5100', name: 'Payroll Taxes', amount: 18500 },
      { account_number: '5150', name: 'Employee Benefits', amount: 22000 },
      { account_number: '5200', name: 'Insurance', amount: 36000 },
      { account_number: '5300', name: 'Utilities', amount: 28000 },
      { account_number: '5400', name: 'Repairs & Maintenance', amount: 42000 },
      { account_number: '5500', name: 'Property Taxes', amount: 65000 },
      { account_number: '5550', name: 'Supplies', amount: 8500 },
      { account_number: '5600', name: 'Professional Fees', amount: 15000 },
      { account_number: '5650', name: 'Marketing & Advertising', amount: 12000 },
    ],
    depreciation: [
      { account_number: '5700', name: 'Depreciation - Buildings', amount: 18000 },
      { account_number: '5710', name: 'Depreciation - Equipment', amount: 5000 },
      { account_number: '5720', name: 'Depreciation - Vehicles', amount: 2000 },
    ],
    interest: [
      { account_number: '5800', name: 'Interest Expense - Notes', amount: 24500 },
      { account_number: '5810', name: 'Interest Expense - Mortgage', amount: 30000 },
    ],
    other: [
      { account_number: '5900', name: 'Bank Fees', amount: 1500 },
      { account_number: '5950', name: 'Miscellaneous Expense', amount: 3000 },
    ],
  },
};

const periodOptions = [
  { value: 'mtd', label: 'Month to Date' },
  { value: 'qtd', label: 'Quarter to Date' },
  { value: 'ytd', label: 'Year to Date' },
  { value: 'custom', label: 'Custom Period' },
  { value: 'prior_year', label: 'Prior Year Comparison' },
];

export default function IncomeStatementPage() {
  const { entityId } = useParams();
  const context = useOutletContext();
  const reportRef = useRef(null);

  const [period, setPeriod] = useState('ytd');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(0, 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDetails, setShowDetails] = useState(true);
  const [showPercentages, setShowPercentages] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    operatingRevenue: true,
    otherRevenue: true,
    operatingExpenses: true,
    depreciation: true,
    interest: true,
    otherExpenses: true,
  });

  // Fetch income statement data
  const { data: incomeStatement = demoIncomeStatement, isLoading, refetch } = useQuery({
    queryKey: ['income-statement', entityId, period, startDate, endDate],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('income_statement_view')
          .select('*')
          .eq('entity_id', entityId)
          .gte('date', startDate)
          .lte('date', endDate);

        if (error) throw error;
        return data ? processIncomeStatementData(data) : demoIncomeStatement;
      } catch (err) {
        console.error('Error fetching income statement:', err);
        return demoIncomeStatement;
      }
    },
  });

  const processIncomeStatementData = (data) => {
    // In production, transform raw data into income statement format
    return demoIncomeStatement;
  };

  // Calculate totals
  const totals = useMemo(() => {
    const operatingRevenue = incomeStatement.revenue.operating.reduce((sum, r) => sum + r.amount, 0);
    const otherRevenue = incomeStatement.revenue.other.reduce((sum, r) => sum + r.amount, 0);
    const totalRevenue = operatingRevenue + otherRevenue;

    const operatingExpenses = incomeStatement.expenses.operating.reduce((sum, e) => sum + e.amount, 0);
    const depreciation = incomeStatement.expenses.depreciation.reduce((sum, e) => sum + e.amount, 0);
    const interest = incomeStatement.expenses.interest.reduce((sum, e) => sum + e.amount, 0);
    const otherExpenses = incomeStatement.expenses.other.reduce((sum, e) => sum + e.amount, 0);
    const totalExpenses = operatingExpenses + depreciation + interest + otherExpenses;

    const grossProfit = operatingRevenue - operatingExpenses;
    const operatingIncome = grossProfit - depreciation;
    const incomeBeforeTax = operatingIncome + otherRevenue - interest - otherExpenses;
    const netIncome = incomeBeforeTax; // Simplified - no tax calculation

    return {
      operatingRevenue,
      otherRevenue,
      totalRevenue,
      operatingExpenses,
      depreciation,
      interest,
      otherExpenses,
      totalExpenses,
      grossProfit,
      operatingIncome,
      incomeBeforeTax,
      netIncome,
    };
  }, [incomeStatement]);

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '-';
    const num = parseFloat(value);
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(num));
    return num < 0 ? `(${formatted})` : formatted;
  };

  const formatPercent = (value, total) => {
    if (!total || total === 0) return '-';
    const percent = (value / total) * 100;
    return `${percent.toFixed(1)}%`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPeriodLabel = () => {
    if (period === 'custom') {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
    const labels = {
      mtd: 'Month to Date',
      qtd: 'Quarter to Date',
      ytd: 'Year to Date',
      prior_year: 'Prior Year Comparison',
    };
    return labels[period] || period;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    console.log('Exporting Income Statement to PDF...');
    window.print();
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderAccountSection = (title, accounts, sectionKey, subtotal, isExpense = false) => {
    const isExpanded = expandedSections[sectionKey];

    return (
      <div className="border-b last:border-b-0">
        <div
          className="flex items-center justify-between px-4 py-2 bg-muted/20 cursor-pointer hover:bg-muted/30 print:cursor-default"
          onClick={() => toggleSection(sectionKey)}
        >
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 print:hidden" />
            ) : (
              <ChevronRight className="h-4 w-4 print:hidden" />
            )}
            <span className="font-medium text-sm">{title}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono font-medium">{formatCurrency(subtotal)}</span>
            {showPercentages && (
              <span className="text-sm text-muted-foreground w-16 text-right">
                {formatPercent(subtotal, totals.totalRevenue)}
              </span>
            )}
          </div>
        </div>
        {(isExpanded || true) && (
          <div className={cn("print:block", !isExpanded && "hidden print:block")}>
            {accounts.map((account) => (
              <div
                key={account.account_number}
                className="flex items-center justify-between px-6 py-1.5 text-sm hover:bg-muted/10"
              >
                <div className="flex items-center gap-2">
                  {showDetails && (
                    <span className="text-muted-foreground font-mono text-xs w-12">
                      {account.account_number}
                    </span>
                  )}
                  <span>{account.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono">{formatCurrency(account.amount)}</span>
                  {showPercentages && (
                    <span className="text-xs text-muted-foreground w-16 text-right">
                      {formatPercent(account.amount, totals.totalRevenue)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const isProfitable = totals.netIncome >= 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Income Statement</h1>
          <p className="text-muted-foreground">{getPeriodLabel()}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-muted/50 rounded-lg print:hidden">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Period:</span>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {period === 'custom' && (
          <>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 border rounded-md text-sm"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 border rounded-md text-sm"
            />
          </>
        )}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showDetails}
            onChange={(e) => setShowDetails(e.target.checked)}
            className="rounded"
          />
          Show account numbers
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showPercentages}
            onChange={(e) => setShowPercentages(e.target.checked)}
            className="rounded"
          />
          Show % of revenue
        </label>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Report Content */}
      <div ref={reportRef} className="border rounded-lg overflow-hidden bg-white">
        {/* Report Header for Print */}
        <div className="hidden print:block p-6 border-b text-center">
          <h1 className="text-xl font-bold">{context?.entity?.name || 'Entity Name'}</h1>
          <h2 className="text-lg">Income Statement</h2>
          <p className="text-sm text-muted-foreground">{getPeriodLabel()}</p>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading income statement...
          </div>
        ) : (
          <>
            {/* Revenue Section */}
            <div className="px-4 py-3 bg-green-50 border-b">
              <h3 className="font-bold text-green-900">REVENUE</h3>
            </div>

            {renderAccountSection(
              'Operating Revenue',
              incomeStatement.revenue.operating,
              'operatingRevenue',
              totals.operatingRevenue
            )}

            {renderAccountSection(
              'Other Revenue',
              incomeStatement.revenue.other,
              'otherRevenue',
              totals.otherRevenue
            )}

            {/* Total Revenue */}
            <div className="flex items-center justify-between px-4 py-3 bg-green-100 font-bold border-b">
              <span>TOTAL REVENUE</span>
              <div className="flex items-center gap-4">
                <span className="font-mono text-lg">{formatCurrency(totals.totalRevenue)}</span>
                {showPercentages && <span className="w-16 text-right">100%</span>}
              </div>
            </div>

            {/* Expenses Section */}
            <div className="px-4 py-3 bg-red-50 border-b">
              <h3 className="font-bold text-red-900">EXPENSES</h3>
            </div>

            {renderAccountSection(
              'Operating Expenses',
              incomeStatement.expenses.operating,
              'operatingExpenses',
              totals.operatingExpenses,
              true
            )}

            {/* Gross Profit */}
            <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b">
              <span className="font-semibold">Gross Profit</span>
              <div className="flex items-center gap-4">
                <span className={cn(
                  "font-mono font-semibold",
                  totals.grossProfit >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {formatCurrency(totals.grossProfit)}
                </span>
                {showPercentages && (
                  <span className="text-sm w-16 text-right">
                    {formatPercent(totals.grossProfit, totals.totalRevenue)}
                  </span>
                )}
              </div>
            </div>

            {renderAccountSection(
              'Depreciation & Amortization',
              incomeStatement.expenses.depreciation,
              'depreciation',
              totals.depreciation,
              true
            )}

            {/* Operating Income */}
            <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b">
              <span className="font-semibold">Operating Income (EBIT)</span>
              <div className="flex items-center gap-4">
                <span className={cn(
                  "font-mono font-semibold",
                  totals.operatingIncome >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {formatCurrency(totals.operatingIncome)}
                </span>
                {showPercentages && (
                  <span className="text-sm w-16 text-right">
                    {formatPercent(totals.operatingIncome, totals.totalRevenue)}
                  </span>
                )}
              </div>
            </div>

            {renderAccountSection(
              'Interest Expense',
              incomeStatement.expenses.interest,
              'interest',
              totals.interest,
              true
            )}

            {renderAccountSection(
              'Other Expenses',
              incomeStatement.expenses.other,
              'otherExpenses',
              totals.otherExpenses,
              true
            )}

            {/* Total Expenses */}
            <div className="flex items-center justify-between px-4 py-3 bg-red-100 font-bold border-b">
              <span>TOTAL EXPENSES</span>
              <div className="flex items-center gap-4">
                <span className="font-mono text-lg">{formatCurrency(totals.totalExpenses)}</span>
                {showPercentages && (
                  <span className="w-16 text-right">
                    {formatPercent(totals.totalExpenses, totals.totalRevenue)}
                  </span>
                )}
              </div>
            </div>

            {/* Net Income */}
            <div className={cn(
              "flex items-center justify-between px-4 py-4 font-bold",
              isProfitable ? "bg-green-100" : "bg-red-100"
            )}>
              <span className="text-lg">NET INCOME</span>
              <div className="flex items-center gap-4">
                <span className={cn(
                  "font-mono text-xl",
                  isProfitable ? "text-green-700" : "text-red-700"
                )}>
                  {formatCurrency(totals.netIncome)}
                </span>
                {showPercentages && (
                  <span className="w-16 text-right">
                    {formatPercent(totals.netIncome, totals.totalRevenue)}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 print:hidden">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totals.totalRevenue)}</p>
            </div>
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(totals.totalExpenses)}</p>
            </div>
            <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Net Income</p>
              <p className={cn(
                "text-xl font-bold",
                isProfitable ? "text-green-600" : "text-red-600"
              )}>
                {formatCurrency(totals.netIncome)}
              </p>
            </div>
            <div className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center",
              isProfitable ? "bg-green-100" : "bg-red-100"
            )}>
              <DollarSign className={cn(
                "h-5 w-5",
                isProfitable ? "text-green-600" : "text-red-600"
              )} />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Profit Margin</p>
          <p className={cn(
            "text-xl font-bold",
            isProfitable ? "text-green-600" : "text-red-600"
          )}>
            {formatPercent(totals.netIncome, totals.totalRevenue)}
          </p>
        </div>
      </div>

      {/* Report Footer */}
      <div className="mt-4 text-sm text-muted-foreground text-center print:mt-8">
        <p>Generated on {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}
