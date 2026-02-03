// src/pages/accounting/CashFlowStatementPage.jsx
// Cash Flow Statement report page with print and export functionality

import React, { useState, useMemo, useRef } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Printer, Download, Calendar, TrendingUp, TrendingDown, RefreshCw,
  ChevronRight, ChevronDown, ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

// Demo cash flow data
const demoCashFlowData = {
  operating: {
    title: 'Cash Flows from Operating Activities',
    items: [
      { label: 'Net Income', amount: 142500, isSubtotal: false },
      { label: 'Adjustments to reconcile net income:', amount: null, isHeader: true },
      { label: 'Depreciation & Amortization', amount: 25000, indent: true },
      { label: 'Changes in operating assets and liabilities:', amount: null, isHeader: true },
      { label: 'Accounts Receivable', amount: -15000, indent: true },
      { label: 'Prepaid Expenses', amount: -4000, indent: true },
      { label: 'Accounts Payable', amount: 12000, indent: true },
      { label: 'Accrued Expenses', amount: 8500, indent: true },
    ],
    subtotal: 169000,
  },
  investing: {
    title: 'Cash Flows from Investing Activities',
    items: [
      { label: 'Purchase of Equipment', amount: -45000 },
      { label: 'Purchase of Property', amount: -250000 },
      { label: 'Proceeds from Sale of Assets', amount: 15000 },
    ],
    subtotal: -280000,
  },
  financing: {
    title: 'Cash Flows from Financing Activities',
    items: [
      { label: 'Proceeds from Notes Payable', amount: 100000 },
      { label: 'Principal Payments on Debt', amount: -35000 },
      { label: 'Distributions to Owners', amount: -50000 },
      { label: 'Capital Contributions', amount: 25000 },
    ],
    subtotal: 40000,
  },
  summary: {
    netChange: -71000,
    beginningCash: 368000,
    endingCash: 297000,
  },
};

const periodOptions = [
  { value: 'mtd', label: 'Month to Date' },
  { value: 'qtd', label: 'Quarter to Date' },
  { value: 'ytd', label: 'Year to Date' },
  { value: 'custom', label: 'Custom Period' },
];

export default function CashFlowStatementPage() {
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
  const [expandedSections, setExpandedSections] = useState({
    operating: true,
    investing: true,
    financing: true,
  });

  // Fetch cash flow data
  const { data: cashFlowData = demoCashFlowData, isLoading, refetch } = useQuery({
    queryKey: ['cash-flow-statement', entityId, period, startDate, endDate],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('cash_flow_statement_view')
          .select('*')
          .eq('entity_id', entityId)
          .gte('date', startDate)
          .lte('date', endDate);

        if (error) throw error;
        // Process data into statement format
        return data ? processCashFlowData(data) : demoCashFlowData;
      } catch (err) {
        console.error('Error fetching cash flow:', err);
        return demoCashFlowData;
      }
    },
  });

  const processCashFlowData = (data) => {
    // In production, transform raw data into statement format
    return demoCashFlowData;
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '';
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

  const getPeriodLabel = () => {
    if (period === 'custom') {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
    const labels = {
      mtd: 'Month to Date',
      qtd: 'Quarter to Date',
      ytd: 'Year to Date',
    };
    return labels[period] || period;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    console.log('Exporting Cash Flow Statement to PDF...');
    window.print();
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderCashFlowSection = (key, data) => {
    const isExpanded = expandedSections[key];
    const isPositive = data.subtotal >= 0;

    return (
      <div key={key} className="border-b last:border-b-0">
        {/* Section Header */}
        <div
          className="flex items-center justify-between p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 print:cursor-default"
          onClick={() => toggleSection(key)}
        >
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 print:hidden" />
            ) : (
              <ChevronRight className="h-4 w-4 print:hidden" />
            )}
            <span className="font-semibold">{data.title}</span>
          </div>
          <div className={cn(
            "font-bold font-mono",
            isPositive ? "text-green-600" : "text-red-600"
          )}>
            {formatCurrency(data.subtotal)}
          </div>
        </div>

        {/* Section Items */}
        {(isExpanded || true) && (
          <div className={cn("print:block", !isExpanded && "hidden print:block")}>
            {data.items.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center justify-between px-4 py-2",
                  item.isHeader && "bg-muted/10 font-medium text-sm",
                  item.indent && "pl-8"
                )}
              >
                <span className={cn(
                  item.isHeader ? "text-muted-foreground" : "",
                  item.isSubtotal && "font-semibold"
                )}>
                  {item.label}
                </span>
                {item.amount !== null && (
                  <span className={cn(
                    "font-mono",
                    item.amount < 0 ? "text-red-600" : item.amount > 0 ? "text-green-600" : ""
                  )}>
                    {formatCurrency(item.amount)}
                  </span>
                )}
              </div>
            ))}
            {/* Section Subtotal */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/20 border-t">
              <span className="font-semibold text-sm">
                Net Cash {isPositive ? 'Provided by' : 'Used in'} {data.title.replace('Cash Flows from ', '')}
              </span>
              <span className={cn(
                "font-bold font-mono",
                isPositive ? "text-green-600" : "text-red-600"
              )}>
                {formatCurrency(data.subtotal)}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Cash Flow Statement</h1>
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
            <SelectTrigger className="w-[160px]">
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
          <h2 className="text-lg">Statement of Cash Flows</h2>
          <p className="text-sm text-muted-foreground">{getPeriodLabel()}</p>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading cash flow statement...
          </div>
        ) : (
          <>
            {/* Operating Activities */}
            {renderCashFlowSection('operating', cashFlowData.operating)}

            {/* Investing Activities */}
            {renderCashFlowSection('investing', cashFlowData.investing)}

            {/* Financing Activities */}
            {renderCashFlowSection('financing', cashFlowData.financing)}

            {/* Summary Section */}
            <div className="bg-muted p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Net Change in Cash</span>
                <span className={cn(
                  "font-bold font-mono text-lg",
                  cashFlowData.summary.netChange >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {formatCurrency(cashFlowData.summary.netChange)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Cash at Beginning of Period</span>
                <span className="font-mono">{formatCurrency(cashFlowData.summary.beginningCash)}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-3">
                <span className="font-bold">Cash at End of Period</span>
                <span className="font-bold font-mono text-lg">
                  {formatCurrency(cashFlowData.summary.endingCash)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Cash Flow Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 print:hidden">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Operating Cash Flow</p>
              <p className={cn(
                "text-xl font-bold",
                cashFlowData.operating.subtotal >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {formatCurrency(cashFlowData.operating.subtotal)}
              </p>
            </div>
            <div className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center",
              cashFlowData.operating.subtotal >= 0 ? "bg-green-100" : "bg-red-100"
            )}>
              {cashFlowData.operating.subtotal >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Investing Cash Flow</p>
              <p className={cn(
                "text-xl font-bold",
                cashFlowData.investing.subtotal >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {formatCurrency(cashFlowData.investing.subtotal)}
              </p>
            </div>
            <div className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center",
              cashFlowData.investing.subtotal >= 0 ? "bg-green-100" : "bg-red-100"
            )}>
              {cashFlowData.investing.subtotal >= 0 ? (
                <ArrowUp className="h-5 w-5 text-green-600" />
              ) : (
                <ArrowDown className="h-5 w-5 text-red-600" />
              )}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Financing Cash Flow</p>
              <p className={cn(
                "text-xl font-bold",
                cashFlowData.financing.subtotal >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {formatCurrency(cashFlowData.financing.subtotal)}
              </p>
            </div>
            <div className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center",
              cashFlowData.financing.subtotal >= 0 ? "bg-green-100" : "bg-red-100"
            )}>
              {cashFlowData.financing.subtotal >= 0 ? (
                <ArrowUp className="h-5 w-5 text-green-600" />
              ) : (
                <ArrowDown className="h-5 w-5 text-red-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Footer */}
      <div className="mt-4 text-sm text-muted-foreground text-center print:mt-8">
        <p>Generated on {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}
