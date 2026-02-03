import React, { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Plus, Search, Eye, Edit2, CreditCard, Download, DollarSign, Clock,
  CheckCircle, AlertTriangle, FileText, Calendar, Building2, MoreHorizontal, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import PayBillsModal from '@/components/accounting/PayBillsModal';

// Demo bills for fallback
const demoBills = [
  {
    id: 'bill-1',
    bill_number: 'SF-2024-156',
    vendor_name: 'Smith Framing LLC',
    project_name: 'Watson Creek',
    bill_date: '2024-12-15',
    due_date: '2024-12-30',
    status: 'pending',
    paid_date: null,
    items: [
      { description: 'Framing labor - Building A', quantity: 1, rate: 45000, amount: 45000, cost_code: '06-100' },
      { description: 'Material handling', quantity: 1, rate: 2500, amount: 2500, cost_code: '06-100' },
    ],
    total_amount: 47500,
    amount_paid: 0,
    balance_due: 47500,
    payment_terms: 'Net 15',
    is_intercompany: false,
  },
  {
    id: 'bill-2',
    bill_number: 'INV-8834',
    vendor_name: 'ABC Plumbing',
    project_name: 'Watson Creek',
    bill_date: '2024-12-10',
    due_date: '2024-12-25',
    status: 'approved',
    paid_date: null,
    items: [
      { description: 'Rough plumbing - Units 1-6', quantity: 6, rate: 4500, amount: 27000, cost_code: '22-100' },
      { description: 'Water heater installation', quantity: 6, rate: 850, amount: 5100, cost_code: '22-200' },
    ],
    total_amount: 32100,
    amount_paid: 0,
    balance_due: 32100,
    payment_terms: 'Net 15',
    is_intercompany: false,
  },
  {
    id: 'bill-3',
    bill_number: 'SE-12445',
    vendor_name: 'Sparks Electric',
    project_name: 'Oslo Ridge',
    bill_date: '2024-12-01',
    due_date: '2024-12-15',
    status: 'paid',
    paid_date: '2024-12-14',
    items: [
      { description: 'Rough electrical - Phase 1', quantity: 1, rate: 28000, amount: 28000, cost_code: '26-100' },
    ],
    total_amount: 28000,
    amount_paid: 28000,
    balance_due: 0,
    payment_terms: 'Net 15',
    is_intercompany: false,
  },
  {
    id: 'bill-4',
    bill_number: 'MC-Q4-2024',
    vendor_name: 'ManageCo',
    project_name: null,
    bill_date: '2024-12-01',
    due_date: '2024-12-31',
    status: 'paid',
    paid_date: '2024-12-20',
    items: [
      { description: 'Q4 2024 Management Fee', quantity: 1, rate: 45000, amount: 45000, cost_code: '01-200' },
      { description: 'Asset Management - Watson Creek', quantity: 1, rate: 12500, amount: 12500, cost_code: '01-200' },
    ],
    total_amount: 67500,
    amount_paid: 67500,
    balance_due: 0,
    payment_terms: 'Net 30',
    is_intercompany: true,
  },
  {
    id: 'bill-5',
    bill_number: 'RMC-78432',
    vendor_name: 'Ready Mix Concrete',
    project_name: 'Watson Creek',
    bill_date: '2024-11-20',
    due_date: '2024-12-05',
    status: 'overdue',
    paid_date: null,
    items: [
      { description: 'Concrete - 4000 PSI (125 cy)', quantity: 125, rate: 165, amount: 20625, cost_code: '03-300' },
      { description: 'Pump truck - 4 hours', quantity: 4, rate: 275, amount: 1100, cost_code: '03-300' },
    ],
    total_amount: 22225,
    amount_paid: 0,
    balance_due: 22225,
    payment_terms: 'Net 15',
    is_intercompany: false,
  },
  {
    id: 'bill-6',
    bill_number: 'CA-2024-892',
    vendor_name: 'Cool Air HVAC',
    project_name: 'Oslo Ridge',
    bill_date: '2024-12-18',
    due_date: '2025-01-02',
    status: 'pending',
    paid_date: null,
    items: [
      { description: 'HVAC rough-in - Units 1-4', quantity: 4, rate: 6500, amount: 26000, cost_code: '23-100' },
      { description: 'Ductwork materials', quantity: 1, rate: 8500, amount: 8500, cost_code: '23-100' },
    ],
    total_amount: 34500,
    amount_paid: 0,
    balance_due: 34500,
    payment_terms: 'Net 15',
    is_intercompany: false,
  },
];

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-600', icon: Clock },
  approved: { label: 'Approved', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  partial: { label: 'Partial', color: 'bg-amber-100 text-amber-700', icon: DollarSign },
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

const fetchBills = async (entityId) => {
  try {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('entity_id', entityId)
      .order('bill_date', { ascending: false })
      .limit(100);

    if (data && !error) return data;
  } catch (err) {
    console.error('Error fetching bills:', err);
  }
  return demoBills;
};

export default function BillsPage() {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const context = useOutletContext();
  const entity = context?.entity;

  const [showPayBillsModal, setShowPayBillsModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const basePath = `/accounting/entities/${entityId}`;

  const { data: bills = [], isLoading } = useQuery({
    queryKey: ['bills', entityId],
    queryFn: () => fetchBills(entityId),
    enabled: !!entityId,
  });

  const filteredBills = bills.filter(bill => {
    const matchesStatus = filterStatus === 'all' || bill.status === filterStatus;
    const matchesSearch = !searchTerm ||
      bill.bill_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    totalPayable: bills.filter(b => b.status !== 'paid').reduce((sum, b) => sum + (b.balance_due || 0), 0),
    overdue: bills.filter(b => b.status === 'overdue').reduce((sum, b) => sum + (b.balance_due || 0), 0),
    paidThisMonth: bills.filter(b => b.status === 'paid' && b.paid_date?.startsWith('2024-12')).reduce((sum, b) => sum + (b.total_amount || 0), 0),
    pendingApproval: bills.filter(b => b.status === 'pending').length,
  };

  // AP Aging buckets
  const aging = {
    current: bills.filter(b => b.status !== 'paid' && new Date(b.due_date) >= new Date()).reduce((s, b) => s + (b.balance_due || 0), 0),
    days_1_30: bills.filter(b => b.status === 'overdue').reduce((s, b) => s + (b.balance_due || 0), 0),
    days_31_60: 0,
    days_61_90: 0,
    days_over_90: 0,
  };

  const handleExport = () => {
    const headers = ['Bill #', 'Vendor', 'Project', 'Date', 'Due Date', 'Total', 'Balance', 'Status'];
    const rows = filteredBills.map(b => [
      b.bill_number,
      b.vendor_name,
      b.project_name || '',
      b.bill_date,
      b.due_date,
      b.total_amount,
      b.balance_due,
      b.status,
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bills-${entityId}.csv`;
    a.click();
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bills</h1>
          <p className="text-muted-foreground">
            Vendor bills and accounts payable for {entity?.name || entity?.short_name || 'this entity'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => setShowPayBillsModal(true)}>
            <CreditCard className="h-4 w-4 mr-2" />
            Pay Bills
          </Button>
          <Button onClick={() => navigate(`${basePath}/bills/new`)}>
            <Plus className="h-4 w-4 mr-2" />
            New Bill
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Payable</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalPayable)}</p>
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
                <p className="text-sm text-muted-foreground">Paid This Month</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.paidThisMonth)}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pendingApproval}</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* A/P Aging Summary */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">A/P Aging Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">Current</p>
              <p className="text-lg font-bold text-green-700">{formatCurrency(aging.current)}</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">1-30 Days</p>
              <p className="text-lg font-bold text-amber-700">{formatCurrency(aging.days_1_30)}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">31-60 Days</p>
              <p className="text-lg font-bold text-orange-700">{formatCurrency(aging.days_31_60)}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">61-90 Days</p>
              <p className="text-lg font-bold text-red-700">{formatCurrency(aging.days_61_90)}</p>
            </div>
            <div className="bg-red-100 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">90+ Days</p>
              <p className="text-lg font-bold text-red-800">{formatCurrency(aging.days_over_90)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search bills..."
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
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Bills Table */}
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
                  <th className="text-left px-4 py-3 font-medium">Bill #</th>
                  <th className="text-left px-4 py-3 font-medium">Vendor</th>
                  <th className="text-left px-4 py-3 font-medium">Project</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Due Date</th>
                  <th className="text-right px-4 py-3 font-medium">Total</th>
                  <th className="text-right px-4 py-3 font-medium">Balance</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No bills found</p>
                      <p className="text-sm">Create a new bill to get started</p>
                    </td>
                  </tr>
                ) : (
                  filteredBills.map((bill) => {
                    const statusConfig = STATUS_CONFIG[bill.status] || STATUS_CONFIG.pending;
                    const StatusIcon = statusConfig.icon;

                    return (
                      <tr
                        key={bill.id}
                        className={cn(
                          "hover:bg-muted/50",
                          bill.status === 'overdue' && "bg-red-50"
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-primary">{bill.bill_number}</span>
                            {bill.is_intercompany && (
                              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">IC</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">{bill.vendor_name}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {bill.project_name || '-'}
                        </td>
                        <td className="px-4 py-3">{formatDate(bill.bill_date)}</td>
                        <td className="px-4 py-3">
                          <span className={cn(bill.status === 'overdue' && "text-red-600 font-medium")}>
                            {formatDate(bill.due_date)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(bill.total_amount)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={cn(
                            "font-medium",
                            bill.balance_due > 0 ? "text-amber-600" : "text-green-600"
                          )}>
                            {formatCurrency(bill.balance_due)}
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
                              <DropdownMenuItem onClick={() => setSelectedBill(bill)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {bill.status === 'pending' && (
                                <DropdownMenuItem onClick={() => navigate(`${basePath}/bills/${bill.id}/edit`)}>
                                  <Edit2 className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {bill.status === 'pending' && (
                                <DropdownMenuItem>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                              )}
                              {(bill.status === 'approved' || bill.status === 'overdue') && (
                                <DropdownMenuItem onClick={() => setShowPayBillsModal(true)}>
                                  <CreditCard className="w-4 h-4 mr-2" />
                                  Pay Bill
                                </DropdownMenuItem>
                              )}
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

      {/* Bill Detail Modal */}
      {selectedBill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <div>
                <h3 className="font-semibold">{selectedBill.bill_number}</h3>
                <p className="text-sm text-muted-foreground">{selectedBill.vendor_name}</p>
              </div>
              <button onClick={() => setSelectedBill(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <Badge className={STATUS_CONFIG[selectedBill.status]?.color || 'bg-gray-100'}>
                  {selectedBill.status}
                </Badge>
                {selectedBill.paid_date && (
                  <span className="text-sm text-green-600">Paid on {formatDate(selectedBill.paid_date)}</span>
                )}
                {selectedBill.is_intercompany && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Intercompany</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Vendor</p>
                  <p className="font-semibold">{selectedBill.vendor_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Project</p>
                  <p className="font-semibold">{selectedBill.project_name || '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Bill Date</p>
                  <p className="font-medium">{formatDate(selectedBill.bill_date)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p className={cn("font-medium", selectedBill.status === 'overdue' && "text-red-600")}>
                    {formatDate(selectedBill.due_date)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Terms</p>
                  <p className="font-medium">{selectedBill.payment_terms}</p>
                </div>
              </div>

              {/* Line Items */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left px-3 py-2">Description</th>
                      <th className="text-left px-3 py-2">Cost Code</th>
                      <th className="text-right px-3 py-2">Qty</th>
                      <th className="text-right px-3 py-2">Rate</th>
                      <th className="text-right px-3 py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBill.items?.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-3 py-2">{item.description}</td>
                        <td className="px-3 py-2 font-mono text-xs">{item.cost_code}</td>
                        <td className="px-3 py-2 text-right">{item.quantity}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.rate)}</td>
                        <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted">
                    <tr className="border-t">
                      <td colSpan={4} className="px-3 py-2 text-right font-semibold">Total</td>
                      <td className="px-3 py-2 text-right font-semibold">{formatCurrency(selectedBill.total_amount)}</td>
                    </tr>
                    {selectedBill.amount_paid > 0 && (
                      <tr>
                        <td colSpan={4} className="px-3 py-2 text-right text-green-600">Paid</td>
                        <td className="px-3 py-2 text-right text-green-600">-{formatCurrency(selectedBill.amount_paid)}</td>
                      </tr>
                    )}
                    <tr className="border-t">
                      <td colSpan={4} className="px-3 py-2 text-right font-semibold">Balance Due</td>
                      <td className={cn(
                        "px-3 py-2 text-right font-semibold",
                        selectedBill.balance_due > 0 ? "text-amber-600" : "text-green-600"
                      )}>
                        {formatCurrency(selectedBill.balance_due)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <div className="flex justify-between items-center p-4 border-t bg-muted/50">
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-1" />View Attachment
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedBill(null)}>Close</Button>
                {selectedBill.status === 'pending' && (
                  <Button>
                    <CheckCircle className="w-4 h-4 mr-1" />Approve
                  </Button>
                )}
                {(selectedBill.status === 'approved' || selectedBill.status === 'overdue') && (
                  <Button onClick={() => { setSelectedBill(null); setShowPayBillsModal(true); }}>
                    <CreditCard className="w-4 h-4 mr-1" />Pay Bill
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pay Bills Modal */}
      <PayBillsModal
        open={showPayBillsModal}
        onClose={() => setShowPayBillsModal(false)}
        entityId={entityId}
      />
    </div>
  );
}
