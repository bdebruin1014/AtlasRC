import React, { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Plus, Search, Eye, Send, Download, Printer, DollarSign, Clock,
  CheckCircle, AlertTriangle, FileText, Mail, MoreHorizontal, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import InvoicePaymentModal from '@/components/accounting/InvoicePaymentModal';

// Demo invoices for fallback
const demoInvoices = [
  {
    id: 'inv-1',
    invoice_number: 'INV-2024-001',
    customer_name: 'ABC Investments LLC',
    customer_email: 'accounts@abcinvest.com',
    project_name: 'Watson Creek',
    invoice_date: '2024-12-01',
    due_date: '2024-12-31',
    status: 'paid',
    paid_date: '2024-12-15',
    items: [
      { description: 'Lot 1 - Final Payment', quantity: 1, rate: 125000, amount: 125000 },
      { description: 'HOA Setup Fee', quantity: 1, rate: 2500, amount: 2500 },
    ],
    subtotal: 127500,
    tax: 0,
    total_amount: 127500,
    amount_paid: 127500,
    balance_due: 0,
    notes: 'Thank you for your purchase!',
    is_intercompany: false,
  },
  {
    id: 'inv-2',
    invoice_number: 'INV-2024-002',
    customer_name: 'Smith Family Trust',
    customer_email: 'trust@smithfamily.com',
    project_name: 'Watson Creek',
    invoice_date: '2024-12-10',
    due_date: '2025-01-09',
    status: 'sent',
    paid_date: null,
    items: [
      { description: 'Lot 5 - Earnest Money', quantity: 1, rate: 25000, amount: 25000 },
    ],
    subtotal: 25000,
    tax: 0,
    total_amount: 25000,
    amount_paid: 0,
    balance_due: 25000,
    notes: 'Earnest money deposit for Lot 5',
    is_intercompany: false,
  },
  {
    id: 'inv-3',
    invoice_number: 'INV-2024-003',
    customer_name: 'Denver RE Partners',
    customer_email: 'ap@denverrepart.com',
    project_name: 'Oslo Ridge',
    invoice_date: '2024-12-15',
    due_date: '2025-01-14',
    status: 'sent',
    paid_date: null,
    items: [
      { description: 'Unit 3 - Progress Draw #2', quantity: 1, rate: 85000, amount: 85000 },
    ],
    subtotal: 85000,
    tax: 0,
    total_amount: 85000,
    amount_paid: 0,
    balance_due: 85000,
    notes: '',
    is_intercompany: false,
  },
  {
    id: 'inv-4',
    invoice_number: 'INV-2024-004',
    customer_name: 'VanRock Holdings',
    customer_email: 'accounting@vanrock.com',
    project_name: null,
    invoice_date: '2024-12-01',
    due_date: '2024-12-31',
    status: 'paid',
    paid_date: '2024-12-20',
    items: [
      { description: 'Q4 2024 Management Fee', quantity: 1, rate: 45000, amount: 45000 },
      { description: 'Asset Management - Watson Creek', quantity: 1, rate: 12500, amount: 12500 },
      { description: 'Asset Management - Oslo Ridge', quantity: 1, rate: 10000, amount: 10000 },
    ],
    subtotal: 67500,
    tax: 0,
    total_amount: 67500,
    amount_paid: 67500,
    balance_due: 0,
    notes: 'Quarterly management services',
    is_intercompany: true,
  },
  {
    id: 'inv-5',
    invoice_number: 'INV-2024-005',
    customer_name: 'Quick Close Homes',
    customer_email: 'orders@quickclose.com',
    project_name: 'Watson Creek',
    invoice_date: '2024-12-20',
    due_date: '2025-01-19',
    status: 'draft',
    paid_date: null,
    items: [
      { description: 'Lot 8 - Contract Price', quantity: 1, rate: 145000, amount: 145000 },
      { description: 'Premium Lot Fee', quantity: 1, rate: 15000, amount: 15000 },
    ],
    subtotal: 160000,
    tax: 0,
    total_amount: 160000,
    amount_paid: 0,
    balance_due: 160000,
    notes: 'Pending contract execution',
    is_intercompany: false,
  },
  {
    id: 'inv-6',
    invoice_number: 'INV-2024-006',
    customer_name: 'Mountain View Builders',
    customer_email: 'billing@mvbuilders.com',
    project_name: 'Sunset Farms',
    invoice_date: '2024-11-15',
    due_date: '2024-12-15',
    status: 'overdue',
    paid_date: null,
    items: [
      { description: 'Lot 12 - Balance Due', quantity: 1, rate: 95000, amount: 95000 },
    ],
    subtotal: 95000,
    tax: 0,
    total_amount: 95000,
    amount_paid: 0,
    balance_due: 95000,
    notes: 'OVERDUE - Please remit immediately',
    is_intercompany: false,
  },
];

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600', icon: FileText },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700', icon: Send },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  partial: { label: 'Partial', color: 'bg-amber-100 text-amber-700', icon: Clock },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
};

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

const fetchInvoices = async (entityId) => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('entity_id', entityId)
      .order('invoice_date', { ascending: false })
      .limit(100);

    if (data && !error) return data;
  } catch (err) {
    console.error('Error fetching invoices:', err);
  }
  return demoInvoices;
};

export default function InvoicesPage() {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const context = useOutletContext();
  const entity = context?.entity;

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const basePath = `/accounting/entities/${entityId}`;

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices', entityId],
    queryFn: () => fetchInvoices(entityId),
    enabled: !!entityId,
  });

  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
    const matchesSearch = !searchTerm ||
      inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    outstanding: invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + (i.balance_due || 0), 0),
    overdue: invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + (i.balance_due || 0), 0),
    paidThisMonth: invoices.filter(i => i.status === 'paid' && i.paid_date?.startsWith('2024-12')).reduce((sum, i) => sum + (i.total_amount || 0), 0),
    draftCount: invoices.filter(i => i.status === 'draft').length,
  };

  const handleExport = () => {
    const headers = ['Invoice #', 'Customer', 'Date', 'Due Date', 'Total', 'Balance', 'Status'];
    const rows = filteredInvoices.map(inv => [
      inv.invoice_number,
      inv.customer_name,
      inv.invoice_date,
      inv.due_date,
      inv.total_amount,
      inv.balance_due,
      inv.status,
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices-${entityId}.csv`;
    a.click();
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">
            Customer invoices and receivables for {entity?.name || entity?.short_name || 'this entity'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => setShowPaymentModal(true)}>
            <DollarSign className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
          <Button onClick={() => navigate(`${basePath}/invoices/new`)}>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.outstanding)}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.overdue)}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Collected This Month</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.paidThisMonth)}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold">{stats.draftCount}</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="border rounded-md px-3 py-2 text-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Invoice #</th>
                  <th className="text-left px-4 py-3 font-medium">Customer</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Due Date</th>
                  <th className="text-right px-4 py-3 font-medium">Total</th>
                  <th className="text-right px-4 py-3 font-medium">Balance</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No invoices found</p>
                      <p className="text-sm">Create a new invoice to get started</p>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => {
                    const statusConfig = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.draft;
                    const StatusIcon = statusConfig.icon;

                    return (
                      <tr
                        key={invoice.id}
                        className={cn(
                          "hover:bg-muted/50",
                          invoice.status === 'overdue' && "bg-red-50"
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-primary">{invoice.invoice_number}</span>
                            {invoice.is_intercompany && (
                              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">IC</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{invoice.customer_name}</p>
                            {invoice.project_name && (
                              <p className="text-xs text-muted-foreground">{invoice.project_name}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">{formatDate(invoice.invoice_date)}</td>
                        <td className="px-4 py-3">
                          <span className={cn(invoice.status === 'overdue' && "text-red-600 font-medium")}>
                            {formatDate(invoice.due_date)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(invoice.total_amount)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={cn(
                            "font-medium",
                            invoice.balance_due > 0 ? "text-amber-600" : "text-green-600"
                          )}>
                            {formatCurrency(invoice.balance_due)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={statusConfig.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedInvoice(invoice)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {invoice.status === 'draft' && (
                                <DropdownMenuItem onClick={() => navigate(`${basePath}/invoices/${invoice.id}/edit`)}>
                                  <Send className="w-4 h-4 mr-2" />
                                  Send Invoice
                                </DropdownMenuItem>
                              )}
                              {invoice.balance_due > 0 && invoice.status !== 'draft' && (
                                <DropdownMenuItem onClick={() => setShowPaymentModal(true)}>
                                  <DollarSign className="w-4 h-4 mr-2" />
                                  Record Payment
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <Printer className="w-4 h-4 mr-2" />
                                Print
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="w-4 h-4 mr-2" />
                                Email
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <div>
                <h3 className="font-semibold">{selectedInvoice.invoice_number}</h3>
                {selectedInvoice.is_intercompany && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Intercompany</span>
                )}
              </div>
              <button onClick={() => setSelectedInvoice(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <Badge className={STATUS_CONFIG[selectedInvoice.status]?.color || 'bg-gray-100'}>
                  {selectedInvoice.status}
                </Badge>
                {selectedInvoice.paid_date && (
                  <span className="text-sm text-green-600">Paid on {formatDate(selectedInvoice.paid_date)}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Bill To</p>
                  <p className="font-semibold">{selectedInvoice.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedInvoice.customer_email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Project</p>
                  <p className="font-semibold">{selectedInvoice.project_name || '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Invoice Date</p>
                  <p className="font-medium">{formatDate(selectedInvoice.invoice_date)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p className={cn("font-medium", selectedInvoice.status === 'overdue' && "text-red-600")}>
                    {formatDate(selectedInvoice.due_date)}
                  </p>
                </div>
              </div>

              {/* Line Items */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left px-3 py-2">Description</th>
                      <th className="text-right px-3 py-2">Qty</th>
                      <th className="text-right px-3 py-2">Rate</th>
                      <th className="text-right px-3 py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items?.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-3 py-2">{item.description}</td>
                        <td className="px-3 py-2 text-right">{item.quantity}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.rate)}</td>
                        <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted">
                    <tr className="border-t">
                      <td colSpan={3} className="px-3 py-2 text-right">Subtotal</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(selectedInvoice.subtotal)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-3 py-2 text-right font-semibold">Total</td>
                      <td className="px-3 py-2 text-right font-semibold">{formatCurrency(selectedInvoice.total_amount)}</td>
                    </tr>
                    {selectedInvoice.amount_paid > 0 && (
                      <tr>
                        <td colSpan={3} className="px-3 py-2 text-right text-green-600">Paid</td>
                        <td className="px-3 py-2 text-right text-green-600">-{formatCurrency(selectedInvoice.amount_paid)}</td>
                      </tr>
                    )}
                    <tr className="border-t">
                      <td colSpan={3} className="px-3 py-2 text-right font-semibold">Balance Due</td>
                      <td className={cn(
                        "px-3 py-2 text-right font-semibold",
                        selectedInvoice.balance_due > 0 ? "text-amber-600" : "text-green-600"
                      )}>
                        {formatCurrency(selectedInvoice.balance_due)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {selectedInvoice.notes && (
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center p-4 border-t bg-muted/50">
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Printer className="w-4 h-4 mr-1" />Print
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-1" />Email
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedInvoice(null)}>Close</Button>
                {selectedInvoice.balance_due > 0 && (
                  <Button onClick={() => { setSelectedInvoice(null); setShowPaymentModal(true); }}>
                    Record Payment
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Payment Modal */}
      <InvoicePaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        entityId={entityId}
      />
    </div>
  );
}
