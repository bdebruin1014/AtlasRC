import React, { useState, useRef } from 'react';
import DOMPurify from 'dompurify';
import { useParams, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FileText, Download, Calendar, DollarSign, Clock, AlertTriangle,
  Users, Mail, ChevronDown, ChevronRight, Printer, RefreshCw, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

// Demo AR aging data for fallback
const demoAgingData = [
  {
    id: 'cust-1',
    customer_name: 'ABC Investments LLC',
    contact_email: 'accounts@abcinvest.com',
    current: 0,
    days_1_30: 0,
    days_31_60: 0,
    days_61_90: 0,
    days_over_90: 0,
    total: 0,
    invoices: [],
  },
  {
    id: 'cust-2',
    customer_name: 'Smith Family Trust',
    contact_email: 'trust@smithfamily.com',
    current: 25000,
    days_1_30: 0,
    days_31_60: 0,
    days_61_90: 0,
    days_over_90: 0,
    total: 25000,
    invoices: [
      { invoice_number: 'INV-2024-002', invoice_date: '2024-12-10', due_date: '2025-01-09', amount: 25000, age_days: 5, bucket: 'current' },
    ],
  },
  {
    id: 'cust-3',
    customer_name: 'Denver RE Partners',
    contact_email: 'ap@denverrepart.com',
    current: 0,
    days_1_30: 85000,
    days_31_60: 0,
    days_61_90: 0,
    days_over_90: 0,
    total: 85000,
    invoices: [
      { invoice_number: 'INV-2024-003', invoice_date: '2024-12-15', due_date: '2025-01-14', amount: 85000, age_days: 20, bucket: 'days_1_30' },
    ],
  },
  {
    id: 'cust-5',
    customer_name: 'Mountain View Builders',
    contact_email: 'billing@mvbuilders.com',
    current: 0,
    days_1_30: 0,
    days_31_60: 45000,
    days_61_90: 0,
    days_over_90: 50000,
    total: 95000,
    invoices: [
      { invoice_number: 'INV-2024-006', invoice_date: '2024-11-15', due_date: '2024-12-15', amount: 45000, age_days: 50, bucket: 'days_31_60' },
      { invoice_number: 'INV-2024-001', invoice_date: '2024-09-01', due_date: '2024-10-01', amount: 50000, age_days: 125, bucket: 'days_over_90' },
    ],
  },
  {
    id: 'cust-6',
    customer_name: 'Quick Close Homes LLC',
    contact_email: 'orders@quickclose.com',
    current: 80000,
    days_1_30: 80000,
    days_31_60: 0,
    days_61_90: 0,
    days_over_90: 0,
    total: 160000,
    invoices: [
      { invoice_number: 'INV-2024-008', invoice_date: '2025-01-05', due_date: '2025-02-04', amount: 80000, age_days: 0, bucket: 'current' },
      { invoice_number: 'INV-2024-005', invoice_date: '2024-12-20', due_date: '2025-01-19', amount: 80000, age_days: 15, bucket: 'days_1_30' },
    ],
  },
  {
    id: 'cust-7',
    customer_name: 'Riverside Development Corp',
    contact_email: 'finance@riverside.com',
    current: 0,
    days_1_30: 0,
    days_31_60: 0,
    days_61_90: 75000,
    days_over_90: 0,
    total: 75000,
    invoices: [
      { invoice_number: 'INV-2024-004', invoice_date: '2024-10-20', due_date: '2024-11-19', amount: 75000, age_days: 77, bucket: 'days_61_90' },
    ],
  },
];

const AGING_BUCKETS = [
  { key: 'current', label: 'Current', color: 'text-green-600', bgColor: 'bg-green-100' },
  { key: 'days_1_30', label: '1-30 Days', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { key: 'days_31_60', label: '31-60 Days', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  { key: 'days_61_90', label: '61-90 Days', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { key: 'days_over_90', label: '90+ Days', color: 'text-red-600', bgColor: 'bg-red-100' },
];

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const fetchAgingData = async (entityId) => {
  try {
    const { data, error } = await supabase
      .from('ar_aging_view')
      .select('*')
      .eq('entity_id', entityId);

    if (data && !error) return data;
  } catch (err) {
    console.error('Error fetching AR aging:', err);
  }
  return demoAgingData;
};

export default function ARAgingReportPage() {
  const { entityId } = useParams();
  const context = useOutletContext();
  const entity = context?.entity;
  const printRef = useRef(null);

  const [expandedCustomers, setExpandedCustomers] = useState(new Set());
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterBucket, setFilterBucket] = useState('all');
  const [statementModal, setStatementModal] = useState({ open: false, customer: null });

  const { data: agingData = [], isLoading, refetch } = useQuery({
    queryKey: ['ar-aging', entityId, asOfDate],
    queryFn: () => fetchAgingData(entityId),
    enabled: !!entityId,
  });

  // Filter out customers with zero balances and apply bucket filter
  const filteredData = agingData.filter(customer => {
    if (customer.total === 0) return false;
    if (filterBucket === 'all') return true;
    return customer[filterBucket] > 0;
  });

  // Calculate totals
  const totals = agingData.reduce((acc, customer) => ({
    current: acc.current + (customer.current || 0),
    days_1_30: acc.days_1_30 + (customer.days_1_30 || 0),
    days_31_60: acc.days_31_60 + (customer.days_31_60 || 0),
    days_61_90: acc.days_61_90 + (customer.days_61_90 || 0),
    days_over_90: acc.days_over_90 + (customer.days_over_90 || 0),
    total: acc.total + (customer.total || 0),
  }), { current: 0, days_1_30: 0, days_31_60: 0, days_61_90: 0, days_over_90: 0, total: 0 });

  const toggleCustomer = (customerId) => {
    setExpandedCustomers(prev => {
      const next = new Set(prev);
      if (next.has(customerId)) {
        next.delete(customerId);
      } else {
        next.add(customerId);
      }
      return next;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Customer', 'Current', '1-30 Days', '31-60 Days', '61-90 Days', '90+ Days', 'Total'];
    const rows = filteredData.map(c => [
      c.customer_name,
      c.current,
      c.days_1_30,
      c.days_31_60,
      c.days_61_90,
      c.days_over_90,
      c.total,
    ]);
    rows.push(['TOTAL', totals.current, totals.days_1_30, totals.days_31_60, totals.days_61_90, totals.days_over_90, totals.total]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ar-aging-${asOfDate}.csv`;
    a.click();
  };

  const handleGenerateStatement = (customer) => {
    setStatementModal({ open: true, customer });
  };

  const handlePrintStatement = () => {
    const customer = statementModal.customer;
    if (!customer) return;

    const printContent = `
      <html>
        <head>
          <title>Statement - ${customer.customer_name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f5f5f5; }
            .text-right { text-align: right; }
            .totals { margin-top: 20px; font-size: 18px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Statement of Account</h1>
          <p><strong>Customer:</strong> ${customer.customer_name}</p>
          <p><strong>Email:</strong> ${customer.contact_email || '-'}</p>
          <p><strong>Statement Date:</strong> ${formatDate(asOfDate)}</p>

          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Due Date</th>
                <th>Age (Days)</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${customer.invoices?.map(inv => `
                <tr>
                  <td>${inv.invoice_number}</td>
                  <td>${formatDate(inv.due_date)}</td>
                  <td>${inv.age_days} days</td>
                  <td class="text-right">${formatCurrency(inv.amount)}</td>
                </tr>
              `).join('') || '<tr><td colspan="4">No invoices</td></tr>'}
            </tbody>
          </table>

          <p class="totals">Total Balance Due: ${formatCurrency(customer.total)}</p>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(DOMPurify.sanitize(printContent, { WHOLE_DOCUMENT: true }));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="p-6" ref={printRef}>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 print:mb-4">
        <div>
          <h1 className="text-2xl font-bold">AR Aging Report</h1>
          <p className="text-muted-foreground">
            Accounts receivable aging analysis for {entity?.name || entity?.short_name || 'this entity'}
          </p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
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

      {/* Report Filters */}
      <div className="flex items-center justify-between mb-6 print:mb-4">
        <div className="flex items-center gap-4 print:hidden">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">As of:</span>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterBucket} onValueChange={setFilterBucket}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Buckets</SelectItem>
                <SelectItem value="current">Current Only</SelectItem>
                <SelectItem value="days_1_30">1-30 Days</SelectItem>
                <SelectItem value="days_31_60">31-60 Days</SelectItem>
                <SelectItem value="days_61_90">61-90 Days</SelectItem>
                <SelectItem value="days_over_90">90+ Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="hidden print:block text-sm text-muted-foreground">
          As of: {formatDate(asOfDate)}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6 print:grid-cols-6 print:gap-2 print:mb-4">
        {AGING_BUCKETS.map(bucket => (
          <Card key={bucket.key} className="print:border-0 print:shadow-none">
            <CardContent className="p-4 print:p-2">
              <p className="text-xs text-muted-foreground">{bucket.label}</p>
              <p className={cn("text-xl font-bold print:text-base", bucket.color)}>
                {formatCurrency(totals[bucket.key])}
              </p>
            </CardContent>
          </Card>
        ))}
        <Card className="bg-muted/50 print:border-0 print:shadow-none">
          <CardContent className="p-4 print:p-2">
            <p className="text-xs text-muted-foreground">Total Outstanding</p>
            <p className="text-xl font-bold print:text-base">{formatCurrency(totals.total)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Aging Distribution Chart */}
      {totals.total > 0 && (
        <Card className="mb-6 print:hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Aging Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-8 rounded-lg overflow-hidden">
              {AGING_BUCKETS.map(bucket => {
                const percentage = totals.total > 0 ? (totals[bucket.key] / totals.total) * 100 : 0;
                if (percentage === 0) return null;
                return (
                  <div
                    key={bucket.key}
                    className={cn("flex items-center justify-center text-xs font-medium", bucket.bgColor, bucket.color)}
                    style={{ width: `${percentage}%` }}
                    title={`${bucket.label}: ${formatCurrency(totals[bucket.key])} (${percentage.toFixed(1)}%)`}
                  >
                    {percentage >= 10 && `${percentage.toFixed(0)}%`}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              {AGING_BUCKETS.map(bucket => (
                <div key={bucket.key} className="flex items-center gap-2 text-sm">
                  <div className={cn("w-3 h-3 rounded", bucket.bgColor)} />
                  <span className="text-muted-foreground">{bucket.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Aging Detail Table */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader className="print:hidden">
          <CardTitle className="text-base">Aging by Customer</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted border-b print:bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium print:px-2 print:py-1">Customer</th>
                  <th className="text-right px-4 py-3 font-medium print:px-2 print:py-1">Current</th>
                  <th className="text-right px-4 py-3 font-medium print:px-2 print:py-1">1-30</th>
                  <th className="text-right px-4 py-3 font-medium print:px-2 print:py-1">31-60</th>
                  <th className="text-right px-4 py-3 font-medium print:px-2 print:py-1">61-90</th>
                  <th className="text-right px-4 py-3 font-medium print:px-2 print:py-1">90+</th>
                  <th className="text-right px-4 py-3 font-medium print:px-2 print:py-1">Total</th>
                  <th className="w-24 print:hidden"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No outstanding receivables</p>
                      <p className="text-sm">All customer accounts are current</p>
                    </td>
                  </tr>
                ) : (
                  <>
                    {filteredData.map((customer) => {
                      const isExpanded = expandedCustomers.has(customer.id);
                      const hasInvoices = customer.invoices?.length > 0;

                      return (
                        <React.Fragment key={customer.id}>
                          <tr
                            className={cn(
                              "hover:bg-muted/50 cursor-pointer print:cursor-default",
                              customer.days_over_90 > 0 && "bg-red-50"
                            )}
                            onClick={() => hasInvoices && toggleCustomer(customer.id)}
                          >
                            <td className="px-4 py-3 print:px-2 print:py-1">
                              <div className="flex items-center gap-2">
                                {hasInvoices && (
                                  <span className="print:hidden">
                                    {isExpanded ? (
                                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </span>
                                )}
                                <div>
                                  <p className="font-medium">{customer.customer_name}</p>
                                  <p className="text-xs text-muted-foreground print:hidden">{customer.contact_email}</p>
                                </div>
                                {customer.days_over_90 > 0 && (
                                  <AlertTriangle className="h-4 w-4 text-red-500 print:hidden" />
                                )}
                              </div>
                            </td>
                            <td className={cn("px-4 py-3 text-right print:px-2 print:py-1", customer.current > 0 && "text-green-600 font-medium")}>
                              {customer.current > 0 ? formatCurrency(customer.current) : '-'}
                            </td>
                            <td className={cn("px-4 py-3 text-right print:px-2 print:py-1", customer.days_1_30 > 0 && "text-blue-600 font-medium")}>
                              {customer.days_1_30 > 0 ? formatCurrency(customer.days_1_30) : '-'}
                            </td>
                            <td className={cn("px-4 py-3 text-right print:px-2 print:py-1", customer.days_31_60 > 0 && "text-amber-600 font-medium")}>
                              {customer.days_31_60 > 0 ? formatCurrency(customer.days_31_60) : '-'}
                            </td>
                            <td className={cn("px-4 py-3 text-right print:px-2 print:py-1", customer.days_61_90 > 0 && "text-orange-600 font-medium")}>
                              {customer.days_61_90 > 0 ? formatCurrency(customer.days_61_90) : '-'}
                            </td>
                            <td className={cn("px-4 py-3 text-right print:px-2 print:py-1", customer.days_over_90 > 0 && "text-red-600 font-medium")}>
                              {customer.days_over_90 > 0 ? formatCurrency(customer.days_over_90) : '-'}
                            </td>
                            <td className="px-4 py-3 text-right font-bold print:px-2 print:py-1">
                              {formatCurrency(customer.total)}
                            </td>
                            <td className="px-4 py-3 print:hidden" onClick={(e) => e.stopPropagation()}>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleGenerateStatement(customer)}
                                  title="Print Statement"
                                >
                                  <Printer className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" title="Email Statement">
                                  <Mail className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                          {/* Expanded Invoice Details */}
                          {isExpanded && customer.invoices?.map((invoice) => (
                            <tr key={invoice.invoice_number} className="bg-muted/30 print:hidden">
                              <td className="px-4 py-2 pl-12">
                                <div className="flex items-center gap-3">
                                  <span className="text-primary font-medium">{invoice.invoice_number}</span>
                                  <span className="text-muted-foreground text-xs">
                                    Due: {formatDate(invoice.due_date)}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {invoice.age_days} days
                                  </Badge>
                                </div>
                              </td>
                              <td className="px-4 py-2 text-right">
                                {invoice.bucket === 'current' ? formatCurrency(invoice.amount) : '-'}
                              </td>
                              <td className="px-4 py-2 text-right">
                                {invoice.bucket === 'days_1_30' ? formatCurrency(invoice.amount) : '-'}
                              </td>
                              <td className="px-4 py-2 text-right">
                                {invoice.bucket === 'days_31_60' ? formatCurrency(invoice.amount) : '-'}
                              </td>
                              <td className="px-4 py-2 text-right">
                                {invoice.bucket === 'days_61_90' ? formatCurrency(invoice.amount) : '-'}
                              </td>
                              <td className="px-4 py-2 text-right">
                                {invoice.bucket === 'days_over_90' ? formatCurrency(invoice.amount) : '-'}
                              </td>
                              <td className="px-4 py-2 text-right font-medium">
                                {formatCurrency(invoice.amount)}
                              </td>
                              <td></td>
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })}
                    {/* Totals Row */}
                    <tr className="bg-muted font-bold border-t-2">
                      <td className="px-4 py-3 print:px-2 print:py-1">TOTAL</td>
                      <td className={cn("px-4 py-3 text-right print:px-2 print:py-1", totals.current > 0 && "text-green-600")}>
                        {formatCurrency(totals.current)}
                      </td>
                      <td className={cn("px-4 py-3 text-right print:px-2 print:py-1", totals.days_1_30 > 0 && "text-blue-600")}>
                        {formatCurrency(totals.days_1_30)}
                      </td>
                      <td className={cn("px-4 py-3 text-right print:px-2 print:py-1", totals.days_31_60 > 0 && "text-amber-600")}>
                        {formatCurrency(totals.days_31_60)}
                      </td>
                      <td className={cn("px-4 py-3 text-right print:px-2 print:py-1", totals.days_61_90 > 0 && "text-orange-600")}>
                        {formatCurrency(totals.days_61_90)}
                      </td>
                      <td className={cn("px-4 py-3 text-right print:px-2 print:py-1", totals.days_over_90 > 0 && "text-red-600")}>
                        {formatCurrency(totals.days_over_90)}
                      </td>
                      <td className="px-4 py-3 text-right print:px-2 print:py-1">
                        {formatCurrency(totals.total)}
                      </td>
                      <td className="print:hidden"></td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Print Footer */}
      <div className="hidden print:block mt-8 pt-4 border-t text-xs text-muted-foreground">
        <p>Generated on {new Date().toLocaleString()} | {entity?.name || 'Entity'} | AR Aging Report</p>
      </div>

      {/* Statement Modal */}
      <Dialog open={statementModal.open} onOpenChange={(open) => setStatementModal({ open, customer: null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Statement</DialogTitle>
          </DialogHeader>

          {statementModal.customer && (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h2 className="text-lg font-bold">Statement of Account</h2>
                <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Customer:</p>
                    <p className="font-semibold">{statementModal.customer.customer_name}</p>
                    <p className="text-muted-foreground">{statementModal.customer.contact_email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">Statement Date:</p>
                    <p className="font-semibold">{formatDate(asOfDate)}</p>
                    <p className="text-muted-foreground mt-2">Balance Due:</p>
                    <p className="text-xl font-bold text-primary">{formatCurrency(statementModal.customer.total)}</p>
                  </div>
                </div>
              </div>

              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left">Invoice #</th>
                    <th className="px-3 py-2 text-left">Due Date</th>
                    <th className="px-3 py-2 text-right">Age</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {statementModal.customer.invoices?.map((inv) => (
                    <tr key={inv.invoice_number}>
                      <td className="px-3 py-2">{inv.invoice_number}</td>
                      <td className="px-3 py-2">{formatDate(inv.due_date)}</td>
                      <td className="px-3 py-2 text-right">{inv.age_days} days</td>
                      <td className="px-3 py-2 text-right font-medium">{formatCurrency(inv.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted font-bold">
                  <tr>
                    <td colSpan={3} className="px-3 py-2 text-right">Total Balance Due:</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(statementModal.customer.total)}</td>
                  </tr>
                </tfoot>
              </table>

              <div className="bg-muted/50 p-3 rounded-lg text-sm">
                <p className="font-medium mb-2">Aging Summary</p>
                <div className="grid grid-cols-5 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Current</p>
                    <p className="font-medium text-green-600">{formatCurrency(statementModal.customer.current)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">1-30 Days</p>
                    <p className="font-medium text-blue-600">{formatCurrency(statementModal.customer.days_1_30)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">31-60 Days</p>
                    <p className="font-medium text-amber-600">{formatCurrency(statementModal.customer.days_31_60)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">61-90 Days</p>
                    <p className="font-medium text-orange-600">{formatCurrency(statementModal.customer.days_61_90)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">90+ Days</p>
                    <p className="font-medium text-red-600">{formatCurrency(statementModal.customer.days_over_90)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setStatementModal({ open: false, customer: null })}>
              Close
            </Button>
            <Button variant="outline" onClick={handlePrintStatement}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button>
              <Mail className="w-4 h-4 mr-2" />
              Email Statement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
