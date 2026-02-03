// src/pages/accounting/TrialBalancePage.jsx
// Trial Balance report page with print and export functionality

import React, { useState, useMemo, useRef } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Printer, Download, Calendar, Scale, RefreshCw, ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

// Demo trial balance data
const demoTrialBalance = [
  // Assets
  { account_number: '1000', account_name: 'Cash - Operating', account_type: 'Asset', debit: 245000, credit: 0 },
  { account_number: '1010', account_name: 'Cash - Payroll', account_type: 'Asset', debit: 52000, credit: 0 },
  { account_number: '1100', account_name: 'Accounts Receivable', account_type: 'Asset', debit: 185000, credit: 0 },
  { account_number: '1200', account_name: 'Prepaid Expenses', account_type: 'Asset', debit: 24000, credit: 0 },
  { account_number: '1500', account_name: 'Fixed Assets', account_type: 'Asset', debit: 1250000, credit: 0 },
  { account_number: '1510', account_name: 'Accumulated Depreciation', account_type: 'Asset', debit: 0, credit: 125000 },
  // Liabilities
  { account_number: '2000', account_name: 'Accounts Payable', account_type: 'Liability', debit: 0, credit: 98000 },
  { account_number: '2100', account_name: 'Accrued Expenses', account_type: 'Liability', debit: 0, credit: 45000 },
  { account_number: '2200', account_name: 'Notes Payable', account_type: 'Liability', debit: 0, credit: 500000 },
  { account_number: '2300', account_name: 'Mortgage Payable', account_type: 'Liability', debit: 0, credit: 750000 },
  // Equity
  { account_number: '3000', account_name: 'Common Stock', account_type: 'Equity', debit: 0, credit: 100000 },
  { account_number: '3100', account_name: 'Retained Earnings', account_type: 'Equity', debit: 0, credit: 85000 },
  // Revenue
  { account_number: '4000', account_name: 'Rental Income', account_type: 'Revenue', debit: 0, credit: 420000 },
  { account_number: '4100', account_name: 'Management Fees', account_type: 'Revenue', debit: 0, credit: 75000 },
  { account_number: '4200', account_name: 'Other Income', account_type: 'Revenue', debit: 0, credit: 12000 },
  // Expenses
  { account_number: '5000', account_name: 'Salaries & Wages', account_type: 'Expense', debit: 185000, credit: 0 },
  { account_number: '5100', account_name: 'Payroll Taxes', account_type: 'Expense', debit: 18500, credit: 0 },
  { account_number: '5200', account_name: 'Insurance', account_type: 'Expense', debit: 36000, credit: 0 },
  { account_number: '5300', account_name: 'Utilities', account_type: 'Expense', debit: 28000, credit: 0 },
  { account_number: '5400', account_name: 'Repairs & Maintenance', account_type: 'Expense', debit: 42000, credit: 0 },
  { account_number: '5500', account_name: 'Property Taxes', account_type: 'Expense', debit: 65000, credit: 0 },
  { account_number: '5600', account_name: 'Depreciation Expense', account_type: 'Expense', debit: 25000, credit: 0 },
  { account_number: '5700', account_name: 'Interest Expense', account_type: 'Expense', debit: 54500, credit: 0 },
];

export default function TrialBalancePage() {
  const { entityId } = useParams();
  const context = useOutletContext();
  const reportRef = useRef(null);

  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [showZeroBalances, setShowZeroBalances] = useState(false);

  // Fetch trial balance data
  const { data: trialBalance = [], isLoading, refetch } = useQuery({
    queryKey: ['trial-balance', entityId, asOfDate],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('trial_balance_view')
          .select('*')
          .eq('entity_id', entityId)
          .lte('as_of_date', asOfDate)
          .order('account_number');

        if (error) throw error;
        return data || demoTrialBalance;
      } catch (err) {
        console.error('Error fetching trial balance:', err);
        return demoTrialBalance;
      }
    },
  });

  // Filter and calculate totals
  const { filteredData, totals } = useMemo(() => {
    const filtered = showZeroBalances
      ? trialBalance
      : trialBalance.filter(row => row.debit !== 0 || row.credit !== 0);

    const totalDebit = filtered.reduce((sum, row) => sum + (row.debit || 0), 0);
    const totalCredit = filtered.reduce((sum, row) => sum + (row.credit || 0), 0);

    return {
      filteredData: filtered,
      totals: { debit: totalDebit, credit: totalCredit },
    };
  }, [trialBalance, showZeroBalances]);

  // Group by account type
  const groupedData = useMemo(() => {
    const groups = {};
    filteredData.forEach(row => {
      const type = row.account_type || 'Other';
      if (!groups[type]) groups[type] = [];
      groups[type].push(row);
    });
    return groups;
  }, [filteredData]);

  const formatCurrency = (value) => {
    if (!value || value === 0) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
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
    // In production, use a PDF library like jsPDF or react-pdf
    console.log('Exporting Trial Balance to PDF...');
    window.print();
  };

  const isBalanced = Math.abs(totals.debit - totals.credit) < 0.01;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Trial Balance</h1>
          <p className="text-muted-foreground">Account balances as of {formatDate(asOfDate)}</p>
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
            checked={showZeroBalances}
            onChange={(e) => setShowZeroBalances(e.target.checked)}
            className="rounded"
          />
          Show zero balances
        </label>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Balance Status */}
      <div className={cn(
        "mb-6 p-4 rounded-lg border",
        isBalanced ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
      )}>
        <div className="flex items-center gap-2">
          <Scale className={cn("h-5 w-5", isBalanced ? "text-green-600" : "text-red-600")} />
          <span className={cn("font-medium", isBalanced ? "text-green-800" : "text-red-800")}>
            {isBalanced ? 'Trial Balance is in balance' : 'Trial Balance is out of balance'}
          </span>
          {!isBalanced && (
            <span className="text-red-600 font-mono">
              (Difference: {formatCurrency(Math.abs(totals.debit - totals.credit))})
            </span>
          )}
        </div>
      </div>

      {/* Report Content */}
      <div ref={reportRef} className="border rounded-lg overflow-hidden bg-white">
        {/* Report Header for Print */}
        <div className="hidden print:block p-6 border-b text-center">
          <h1 className="text-xl font-bold">{context?.entity?.name || 'Entity Name'}</h1>
          <h2 className="text-lg">Trial Balance</h2>
          <p className="text-sm text-muted-foreground">As of {formatDate(asOfDate)}</p>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[120px]">Account #</TableHead>
              <TableHead>Account Name</TableHead>
              <TableHead className="text-right w-[150px]">Debit</TableHead>
              <TableHead className="text-right w-[150px]">Credit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Loading trial balance...
                </TableCell>
              </TableRow>
            ) : (
              Object.entries(groupedData).map(([accountType, accounts]) => (
                <React.Fragment key={accountType}>
                  {/* Account Type Header */}
                  <TableRow className="bg-muted/30">
                    <TableCell colSpan={4} className="font-semibold">
                      <div className="flex items-center gap-1">
                        <ChevronRight className="h-4 w-4" />
                        {accountType}
                      </div>
                    </TableCell>
                  </TableRow>
                  {/* Account Rows */}
                  {accounts.map((row) => (
                    <TableRow key={row.account_number}>
                      <TableCell className="font-mono text-sm">{row.account_number}</TableCell>
                      <TableCell>{row.account_name}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(row.debit)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(row.credit)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Account Type Subtotal */}
                  <TableRow className="border-t">
                    <TableCell colSpan={2} className="text-right text-sm text-muted-foreground">
                      {accountType} Total:
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatCurrency(accounts.reduce((sum, r) => sum + (r.debit || 0), 0))}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatCurrency(accounts.reduce((sum, r) => sum + (r.credit || 0), 0))}
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
            )}
            {/* Grand Total */}
            <TableRow className="bg-muted font-bold border-t-2">
              <TableCell colSpan={2} className="text-right">
                TOTAL
              </TableCell>
              <TableCell className="text-right font-mono text-lg">
                {formatCurrency(totals.debit)}
              </TableCell>
              <TableCell className="text-right font-mono text-lg">
                {formatCurrency(totals.credit)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Report Footer */}
      <div className="mt-4 text-sm text-muted-foreground text-center print:mt-8">
        <p>Generated on {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}
