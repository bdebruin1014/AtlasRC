// src/pages/accounting/BalanceSheetPage.jsx
// Balance Sheet report page with print and export functionality

import React, { useState, useMemo, useRef } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Printer, Download, Calendar, Scale, RefreshCw,
  ChevronRight, ChevronDown, Building2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

// Demo balance sheet data
const demoBalanceSheet = {
  assets: {
    current: [
      { account_number: '1000', name: 'Cash - Operating', balance: 245000 },
      { account_number: '1010', name: 'Cash - Payroll', balance: 52000 },
      { account_number: '1100', name: 'Accounts Receivable', balance: 185000 },
      { account_number: '1150', name: 'Allowance for Doubtful Accounts', balance: -5000 },
      { account_number: '1200', name: 'Prepaid Expenses', balance: 24000 },
      { account_number: '1250', name: 'Prepaid Insurance', balance: 12000 },
    ],
    fixed: [
      { account_number: '1500', name: 'Land', balance: 500000 },
      { account_number: '1510', name: 'Buildings', balance: 1250000 },
      { account_number: '1520', name: 'Accumulated Depreciation - Buildings', balance: -125000 },
      { account_number: '1530', name: 'Equipment', balance: 85000 },
      { account_number: '1540', name: 'Accumulated Depreciation - Equipment', balance: -25000 },
      { account_number: '1550', name: 'Vehicles', balance: 45000 },
      { account_number: '1560', name: 'Accumulated Depreciation - Vehicles', balance: -15000 },
    ],
    other: [
      { account_number: '1800', name: 'Security Deposits', balance: 18000 },
      { account_number: '1850', name: 'Intangible Assets', balance: 10000 },
    ],
  },
  liabilities: {
    current: [
      { account_number: '2000', name: 'Accounts Payable', balance: 98000 },
      { account_number: '2100', name: 'Accrued Expenses', balance: 45000 },
      { account_number: '2150', name: 'Accrued Payroll', balance: 22000 },
      { account_number: '2200', name: 'Current Portion of Long-Term Debt', balance: 35000 },
      { account_number: '2250', name: 'Deferred Revenue', balance: 15000 },
      { account_number: '2300', name: 'Payroll Taxes Payable', balance: 8500 },
    ],
    longTerm: [
      { account_number: '2500', name: 'Notes Payable', balance: 465000 },
      { account_number: '2600', name: 'Mortgage Payable', balance: 750000 },
      { account_number: '2700', name: 'Bonds Payable', balance: 200000 },
    ],
  },
  equity: [
    { account_number: '3000', name: 'Common Stock', balance: 100000 },
    { account_number: '3100', name: 'Additional Paid-in Capital', balance: 150000 },
    { account_number: '3200', name: 'Retained Earnings', balance: 227500 },
    { account_number: '3300', name: 'Current Year Earnings', balance: 142500 },
  ],
};

export default function BalanceSheetPage() {
  const { entityId } = useParams();
  const context = useOutletContext();
  const reportRef = useRef(null);

  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [compareDate, setCompareDate] = useState('');
  const [showDetails, setShowDetails] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    currentAssets: true,
    fixedAssets: true,
    otherAssets: true,
    currentLiabilities: true,
    longTermLiabilities: true,
    equity: true,
  });

  // Fetch balance sheet data
  const { data: balanceSheet = demoBalanceSheet, isLoading, refetch } = useQuery({
    queryKey: ['balance-sheet', entityId, asOfDate],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('balance_sheet_view')
          .select('*')
          .eq('entity_id', entityId)
          .lte('as_of_date', asOfDate);

        if (error) throw error;
        return data ? processBalanceSheetData(data) : demoBalanceSheet;
      } catch (err) {
        console.error('Error fetching balance sheet:', err);
        return demoBalanceSheet;
      }
    },
  });

  const processBalanceSheetData = (data) => {
    // In production, transform raw data into balance sheet format
    return demoBalanceSheet;
  };

  // Calculate totals
  const totals = useMemo(() => {
    const currentAssets = balanceSheet.assets.current.reduce((sum, a) => sum + a.balance, 0);
    const fixedAssets = balanceSheet.assets.fixed.reduce((sum, a) => sum + a.balance, 0);
    const otherAssets = balanceSheet.assets.other.reduce((sum, a) => sum + a.balance, 0);
    const totalAssets = currentAssets + fixedAssets + otherAssets;

    const currentLiabilities = balanceSheet.liabilities.current.reduce((sum, l) => sum + l.balance, 0);
    const longTermLiabilities = balanceSheet.liabilities.longTerm.reduce((sum, l) => sum + l.balance, 0);
    const totalLiabilities = currentLiabilities + longTermLiabilities;

    const totalEquity = balanceSheet.equity.reduce((sum, e) => sum + e.balance, 0);

    return {
      currentAssets,
      fixedAssets,
      otherAssets,
      totalAssets,
      currentLiabilities,
      longTermLiabilities,
      totalLiabilities,
      totalEquity,
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
    };
  }, [balanceSheet]);

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    console.log('Exporting Balance Sheet to PDF...');
    window.print();
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderAccountSection = (title, accounts, sectionKey, subtotal) => {
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
          <span className="font-mono font-medium">{formatCurrency(subtotal)}</span>
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
                <span className={cn(
                  "font-mono",
                  account.balance < 0 && "text-red-600"
                )}>
                  {formatCurrency(account.balance)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const isBalanced = Math.abs(totals.totalAssets - totals.totalLiabilitiesAndEquity) < 0.01;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Balance Sheet</h1>
          <p className="text-muted-foreground">As of {formatDate(asOfDate)}</p>
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
          <span className="text-sm font-medium">As of Date:</span>
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className="px-3 py-1.5 border rounded-md text-sm"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showDetails}
            onChange={(e) => setShowDetails(e.target.checked)}
            className="rounded"
          />
          Show account numbers
        </label>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Balance Check */}
      <div className={cn(
        "mb-6 p-4 rounded-lg border",
        isBalanced ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
      )}>
        <div className="flex items-center gap-2">
          <Scale className={cn("h-5 w-5", isBalanced ? "text-green-600" : "text-red-600")} />
          <span className={cn("font-medium", isBalanced ? "text-green-800" : "text-red-800")}>
            {isBalanced ? 'Balance Sheet is in balance' : 'Balance Sheet is out of balance'}
          </span>
          {!isBalanced && (
            <span className="text-red-600 font-mono">
              (Difference: {formatCurrency(Math.abs(totals.totalAssets - totals.totalLiabilitiesAndEquity))})
            </span>
          )}
        </div>
      </div>

      {/* Report Content */}
      <div ref={reportRef} className="border rounded-lg overflow-hidden bg-white">
        {/* Report Header for Print */}
        <div className="hidden print:block p-6 border-b text-center">
          <h1 className="text-xl font-bold">{context?.entity?.name || 'Entity Name'}</h1>
          <h2 className="text-lg">Balance Sheet</h2>
          <p className="text-sm text-muted-foreground">As of {formatDate(asOfDate)}</p>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading balance sheet...
          </div>
        ) : (
          <div className="grid md:grid-cols-2 divide-x">
            {/* Assets Column */}
            <div>
              <div className="px-4 py-3 bg-blue-50 border-b">
                <h3 className="font-bold text-blue-900">ASSETS</h3>
              </div>

              {renderAccountSection(
                'Current Assets',
                balanceSheet.assets.current,
                'currentAssets',
                totals.currentAssets
              )}

              {renderAccountSection(
                'Fixed Assets',
                balanceSheet.assets.fixed,
                'fixedAssets',
                totals.fixedAssets
              )}

              {renderAccountSection(
                'Other Assets',
                balanceSheet.assets.other,
                'otherAssets',
                totals.otherAssets
              )}

              {/* Total Assets */}
              <div className="flex items-center justify-between px-4 py-3 bg-blue-100 font-bold">
                <span>TOTAL ASSETS</span>
                <span className="font-mono text-lg">{formatCurrency(totals.totalAssets)}</span>
              </div>
            </div>

            {/* Liabilities & Equity Column */}
            <div>
              <div className="px-4 py-3 bg-amber-50 border-b">
                <h3 className="font-bold text-amber-900">LIABILITIES & EQUITY</h3>
              </div>

              {/* Liabilities */}
              <div className="px-4 py-2 bg-muted/10 border-b">
                <span className="font-semibold text-sm text-muted-foreground">Liabilities</span>
              </div>

              {renderAccountSection(
                'Current Liabilities',
                balanceSheet.liabilities.current,
                'currentLiabilities',
                totals.currentLiabilities
              )}

              {renderAccountSection(
                'Long-Term Liabilities',
                balanceSheet.liabilities.longTerm,
                'longTermLiabilities',
                totals.longTermLiabilities
              )}

              {/* Total Liabilities */}
              <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b">
                <span className="font-semibold">Total Liabilities</span>
                <span className="font-mono font-semibold">{formatCurrency(totals.totalLiabilities)}</span>
              </div>

              {/* Equity */}
              {renderAccountSection(
                "Stockholders' Equity",
                balanceSheet.equity,
                'equity',
                totals.totalEquity
              )}

              {/* Total Liabilities & Equity */}
              <div className="flex items-center justify-between px-4 py-3 bg-amber-100 font-bold">
                <span>TOTAL LIABILITIES & EQUITY</span>
                <span className="font-mono text-lg">{formatCurrency(totals.totalLiabilitiesAndEquity)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 print:hidden">
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Assets</p>
          <p className="text-xl font-bold text-blue-600">{formatCurrency(totals.totalAssets)}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Liabilities</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(totals.totalLiabilities)}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Equity</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(totals.totalEquity)}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Debt-to-Equity Ratio</p>
          <p className="text-xl font-bold">
            {totals.totalEquity !== 0
              ? (totals.totalLiabilities / totals.totalEquity).toFixed(2)
              : 'N/A'}
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
