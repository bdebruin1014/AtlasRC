// src/pages/accounting/ARAgingReportPage.jsx
// Accounts Receivable Aging Report with enhanced features

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  FileText, Download, Calendar, DollarSign, Clock, AlertTriangle,
  TrendingUp, Users, Mail, ChevronDown, ChevronRight, Printer, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  getARAgingReport,
  generateStatement,
  processAutoLateFees,
  getEntityAccountingSettings,
} from '@/services/accountingEnhancedService';

const ARAgingReportPage = () => {
  const { entityId } = useParams();
  const [report, setReport] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedCustomers, setExpandedCustomers] = useState({});
  const [processingLateFees, setProcessingLateFees] = useState(false);
  const [statementModal, setStatementModal] = useState({ open: false, statement: null, customerId: null });
  const statementRef = useRef(null);

  useEffect(() => {
    loadReport();
  }, [entityId, asOfDate]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const [reportData, settingsData] = await Promise.all([
        getARAgingReport(entityId, new Date(asOfDate)),
        getEntityAccountingSettings(entityId),
      ]);
      setReport(reportData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessLateFees = async () => {
    try {
      setProcessingLateFees(true);
      const result = await processAutoLateFees(entityId);
      alert(`Processed ${result.processed} late fee(s)`);
      loadReport();
    } catch (error) {
      console.error('Error processing late fees:', error);
    } finally {
      setProcessingLateFees(false);
    }
  };

  const handleGenerateStatement = async (customerId) => {
    try {
      const statement = await generateStatement(customerId, entityId, new Date(asOfDate));
      // Open statement preview modal with generated data
      setStatementModal({
        open: true,
        statement,
        customerId,
      });
    } catch (error) {
      console.error('Error generating statement:', error);
    }
  };

  const handlePrintStatement = () => {
    if (statementRef.current) {
      const printContent = statementRef.current.innerHTML;
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Customer Statement</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; }
              .header { margin-bottom: 20px; }
              .header h1 { margin: 0; }
              .totals { margin-top: 20px; font-weight: bold; }
              .overdue { color: #dc2626; }
              .text-right { text-align: right; }
              @media print { body { padding: 0; } }
            </style>
          </head>
          <body>${printContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  const handleDownloadStatement = () => {
    if (!statementModal.statement) return;
    const { statement } = statementModal;

    // Build CSV content
    const rows = [
      ['Customer Statement'],
      ['Customer:', statement.customer?.name || 'Unknown'],
      ['Statement Date:', formatDate(statement.statement_date)],
      [''],
      ['Invoice #', 'Date', 'Due Date', 'Original Amount', 'Paid', 'Balance Due', 'Days Overdue'],
    ];

    statement.invoices?.forEach(inv => {
      rows.push([
        inv.invoice_number,
        formatDate(inv.invoice_date),
        formatDate(inv.due_date),
        inv.total_amount?.toFixed(2) || '0.00',
        inv.amount_paid?.toFixed(2) || '0.00',
        inv.balance_due?.toFixed(2) || '0.00',
        inv.days_overdue?.toString() || '0',
      ]);
    });

    rows.push(['']);
    rows.push(['', '', '', '', 'Total Balance Due:', statement.total_balance?.toFixed(2) || '0.00', '']);

    const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `statement-${statement.customer?.name || 'customer'}-${asOfDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleCustomer = (customerId) => {
    setExpandedCustomers(prev => ({
      ...prev,
      [customerId]: !prev[customerId],
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Group invoices by customer
  const groupedByCustomer = report?.details?.reduce((acc, inv) => {
    const customerId = inv.customer_id;
    if (!acc[customerId]) {
      acc[customerId] = {
        customer: inv.customer,
        invoices: [],
        totals: { current: 0, days_1_30: 0, days_31_60: 0, days_61_90: 0, over_90: 0, total: 0 },
      };
    }
    acc[customerId].invoices.push(inv);
    acc[customerId].totals[inv.aging_bucket] += inv.balance_due;
    acc[customerId].totals.total += inv.balance_due;
    return acc;
  }, {}) || {};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const summary = report?.summary || {};
  const overdueTotal = (summary.days_1_30 || 0) + (summary.days_31_60 || 0) + 
                       (summary.days_61_90 || 0) + (summary.over_90 || 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-600" />
            AR Aging Report
          </h1>
          <p className="text-gray-500 mt-1">Accounts Receivable by aging bucket</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {settings?.late_fee_enabled && (
            <Button 
              variant="outline"
              onClick={handleProcessLateFees}
              disabled={processingLateFees}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Apply Late Fees
            </Button>
          )}
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4">
            <p className="text-sm text-green-700">Current</p>
            <p className="text-xl font-bold text-green-800">{formatCurrency(summary.current)}</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-4">
            <p className="text-sm text-yellow-700">1-30 Days</p>
            <p className="text-xl font-bold text-yellow-800">{formatCurrency(summary.days_1_30)}</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-4">
            <p className="text-sm text-orange-700">31-60 Days</p>
            <p className="text-xl font-bold text-orange-800">{formatCurrency(summary.days_31_60)}</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-4">
            <p className="text-sm text-red-700">61-90 Days</p>
            <p className="text-xl font-bold text-red-800">{formatCurrency(summary.days_61_90)}</p>
          </CardContent>
        </Card>
        <Card className="bg-red-100 border-red-300">
          <CardContent className="pt-4">
            <p className="text-sm text-red-800">Over 90 Days</p>
            <p className="text-xl font-bold text-red-900">{formatCurrency(summary.over_90)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-600">Total AR</p>
            <p className="text-xl font-bold">{formatCurrency(summary.total)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Aging Distribution Bar */}
      {summary.total > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Aging Distribution</span>
              <span className="text-sm text-gray-500">
                ({((overdueTotal / summary.total) * 100).toFixed(1)}% overdue)
              </span>
            </div>
            <div className="flex h-4 rounded-full overflow-hidden">
              <div 
                className="bg-green-500" 
                style={{ width: `${(summary.current / summary.total) * 100}%` }}
                title={`Current: ${formatCurrency(summary.current)}`}
              />
              <div 
                className="bg-yellow-500" 
                style={{ width: `${(summary.days_1_30 / summary.total) * 100}%` }}
                title={`1-30: ${formatCurrency(summary.days_1_30)}`}
              />
              <div 
                className="bg-orange-500" 
                style={{ width: `${(summary.days_31_60 / summary.total) * 100}%` }}
                title={`31-60: ${formatCurrency(summary.days_31_60)}`}
              />
              <div 
                className="bg-red-500" 
                style={{ width: `${(summary.days_61_90 / summary.total) * 100}%` }}
                title={`61-90: ${formatCurrency(summary.days_61_90)}`}
              />
              <div 
                className="bg-red-700" 
                style={{ width: `${(summary.over_90 / summary.total) * 100}%` }}
                title={`Over 90: ${formatCurrency(summary.over_90)}`}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded" /> Current
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded" /> 1-30
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-500 rounded" /> 31-60
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded" /> 61-90
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-700 rounded" /> 90+
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Report by Customer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aging by Customer</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Customer</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Current</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">1-30</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">31-60</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">61-90</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">90+</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Total</th>
                <th className="w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {Object.entries(groupedByCustomer).map(([customerId, data]) => (
                <React.Fragment key={customerId}>
                  <tr 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleCustomer(customerId)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {expandedCustomers[customerId] ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="font-medium">{data.customer?.name || 'Unknown'}</span>
                        <Badge variant="outline" className="text-xs">
                          {data.invoices.length} invoice{data.invoices.length > 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">{formatCurrency(data.totals.current)}</td>
                    <td className="px-4 py-3 text-right text-yellow-600">{formatCurrency(data.totals.days_1_30)}</td>
                    <td className="px-4 py-3 text-right text-orange-600">{formatCurrency(data.totals.days_31_60)}</td>
                    <td className="px-4 py-3 text-right text-red-600">{formatCurrency(data.totals.days_61_90)}</td>
                    <td className="px-4 py-3 text-right text-red-700 font-medium">{formatCurrency(data.totals.over_90)}</td>
                    <td className="px-4 py-3 text-right font-bold">{formatCurrency(data.totals.total)}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleGenerateStatement(customerId)}
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Mail className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {expandedCustomers[customerId] && data.invoices.map(inv => (
                    <tr key={inv.id} className="bg-gray-50">
                      <td className="px-4 py-2 pl-12">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{inv.invoice_number}</span>
                          <span className="text-xs text-gray-500">
                            Due: {formatDate(inv.due_date)}
                          </span>
                          {inv.days_overdue > 0 && (
                            <Badge className="bg-red-100 text-red-800 text-xs">
                              {inv.days_overdue} days overdue
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-right text-sm">
                        {inv.aging_bucket === 'current' ? formatCurrency(inv.balance_due) : '-'}
                      </td>
                      <td className="px-4 py-2 text-right text-sm">
                        {inv.aging_bucket === 'days_1_30' ? formatCurrency(inv.balance_due) : '-'}
                      </td>
                      <td className="px-4 py-2 text-right text-sm">
                        {inv.aging_bucket === 'days_31_60' ? formatCurrency(inv.balance_due) : '-'}
                      </td>
                      <td className="px-4 py-2 text-right text-sm">
                        {inv.aging_bucket === 'days_61_90' ? formatCurrency(inv.balance_due) : '-'}
                      </td>
                      <td className="px-4 py-2 text-right text-sm">
                        {inv.aging_bucket === 'over_90' ? formatCurrency(inv.balance_due) : '-'}
                      </td>
                      <td className="px-4 py-2 text-right text-sm font-medium">
                        {formatCurrency(inv.balance_due)}
                      </td>
                      <td></td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
              {Object.keys(groupedByCustomer).length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No outstanding receivables</p>
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-gray-100 border-t-2 font-bold">
              <tr>
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3 text-right">{formatCurrency(summary.current)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(summary.days_1_30)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(summary.days_31_60)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(summary.days_61_90)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(summary.over_90)}</td>
                <td className="px-4 py-3 text-right text-lg">{formatCurrency(summary.total)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>

      {/* Statement Preview Modal */}
      <Dialog open={statementModal.open} onOpenChange={(open) => setStatementModal(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Customer Statement
            </DialogTitle>
          </DialogHeader>

          <div ref={statementRef} className="statement-content">
            {statementModal.statement && (
              <div className="space-y-4">
                {/* Statement Header */}
                <div className="header border-b pb-4">
                  <h1 className="text-xl font-bold">Statement of Account</h1>
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Bill To:</p>
                      <p className="font-semibold">{statementModal.statement.customer?.name || 'Customer'}</p>
                      {statementModal.statement.customer?.address && (
                        <p>{statementModal.statement.customer.address}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500">Statement Date:</p>
                      <p className="font-semibold">{formatDate(statementModal.statement.statement_date || asOfDate)}</p>
                      <p className="text-gray-500 mt-2">Account Balance:</p>
                      <p className="text-xl font-bold text-blue-600">
                        {formatCurrency(statementModal.statement.total_balance || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Invoices Table */}
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Invoice #</th>
                      <th className="px-3 py-2 text-left font-medium">Date</th>
                      <th className="px-3 py-2 text-left font-medium">Due Date</th>
                      <th className="px-3 py-2 text-right font-medium">Amount</th>
                      <th className="px-3 py-2 text-right font-medium">Paid</th>
                      <th className="px-3 py-2 text-right font-medium">Balance</th>
                      <th className="px-3 py-2 text-right font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(statementModal.statement.invoices || []).map((inv, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-3 py-2">{inv.invoice_number}</td>
                        <td className="px-3 py-2">{formatDate(inv.invoice_date)}</td>
                        <td className="px-3 py-2">{formatDate(inv.due_date)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(inv.total_amount)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(inv.amount_paid)}</td>
                        <td className="px-3 py-2 text-right font-medium">{formatCurrency(inv.balance_due)}</td>
                        <td className="px-3 py-2 text-right">
                          {inv.days_overdue > 0 ? (
                            <span className="overdue text-red-600">{inv.days_overdue} days overdue</span>
                          ) : (
                            <span className="text-green-600">Current</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 font-bold">
                    <tr>
                      <td colSpan={5} className="px-3 py-2 text-right">Total Balance Due:</td>
                      <td className="px-3 py-2 text-right text-lg">{formatCurrency(statementModal.statement.total_balance)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>

                {/* Aging Summary */}
                {statementModal.statement.aging_summary && (
                  <div className="totals bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold mb-2">Aging Summary</p>
                    <div className="grid grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Current</p>
                        <p>{formatCurrency(statementModal.statement.aging_summary.current)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">1-30 Days</p>
                        <p>{formatCurrency(statementModal.statement.aging_summary.days_1_30)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">31-60 Days</p>
                        <p>{formatCurrency(statementModal.statement.aging_summary.days_31_60)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">61-90 Days</p>
                        <p>{formatCurrency(statementModal.statement.aging_summary.days_61_90)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Over 90 Days</p>
                        <p className="text-red-600 font-bold">{formatCurrency(statementModal.statement.aging_summary.over_90)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Terms */}
                <div className="text-sm text-gray-600 pt-4 border-t">
                  <p>Please remit payment to the address above. For questions regarding this statement, please contact our accounts receivable department.</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleDownloadStatement}>
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
            <Button variant="outline" onClick={handlePrintStatement}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button onClick={() => setStatementModal({ open: false, statement: null, customerId: null })}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ARAgingReportPage;
