// src/pages/accounting/BatchPaymentsPage.jsx
// Batch payment processing for AP

import React, { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreditCard, CheckCircle2, Clock, DollarSign, FileText, Plus,
  Printer, Send, AlertTriangle, Building2, Calendar, Search, Download,
  MoreHorizontal, Eye, Trash2, RefreshCw, Loader2, Layers, Banknote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import BatchPaymentWizardModal from '@/components/accounting/BatchPaymentWizardModal';

// Demo data for development
const demoBatches = [
  {
    id: 'batch-1',
    batch_name: 'Weekly Vendor Payments',
    batch_date: '2025-01-27',
    payment_method: 'check',
    bill_count: 12,
    total_amount: 45670.00,
    status: 'processed',
    processed_at: '2025-01-27T14:30:00Z',
    check_start_number: 1001,
    check_end_number: 1012,
    created_by: 'John Smith',
  },
  {
    id: 'batch-2',
    batch_name: 'Subcontractor ACH',
    batch_date: '2025-01-28',
    payment_method: 'ach',
    bill_count: 8,
    total_amount: 28450.00,
    status: 'pending',
    processed_at: null,
    ach_file_created: false,
    created_by: 'Jane Doe',
  },
  {
    id: 'batch-3',
    batch_name: 'Material Suppliers',
    batch_date: '2025-01-25',
    payment_method: 'check',
    bill_count: 15,
    total_amount: 67890.00,
    status: 'processed',
    processed_at: '2025-01-25T10:15:00Z',
    check_start_number: 989,
    check_end_number: 1000,
    created_by: 'John Smith',
  },
  {
    id: 'batch-4',
    batch_name: 'Equipment Rentals',
    batch_date: '2025-01-29',
    payment_method: 'ach',
    bill_count: 5,
    total_amount: 12500.00,
    status: 'draft',
    processed_at: null,
    created_by: 'Mike Johnson',
  },
];

const demoPendingBills = [
  { id: 'bill-1', vendor_name: 'ABC Lumber', bill_number: 'INV-5001', due_date: '2025-02-01', balance_due: 4500.00, discount_amount: 90.00, discount_date: '2025-01-30' },
  { id: 'bill-2', vendor_name: 'Smith Electric', bill_number: 'SE-2024-789', due_date: '2025-02-05', balance_due: 8750.00, discount_amount: 0, discount_date: null },
  { id: 'bill-3', vendor_name: 'Pro Plumbing', bill_number: 'PP-1122', due_date: '2025-01-30', balance_due: 3200.00, discount_amount: 64.00, discount_date: '2025-01-28' },
  { id: 'bill-4', vendor_name: 'Concrete Solutions', bill_number: 'CS-4455', due_date: '2025-02-10', balance_due: 15000.00, discount_amount: 0, discount_date: null },
  { id: 'bill-5', vendor_name: 'HVAC Masters', bill_number: 'HM-889', due_date: '2025-02-03', balance_due: 6800.00, discount_amount: 136.00, discount_date: '2025-02-01' },
];

export default function BatchPaymentsPage() {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const context = useOutletContext();
  const entity = context?.entity;
  const basePath = `/accounting/entities/${entityId}`;

  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [checkStartNumber, setCheckStartNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('batches');

  // Fetch batch payments
  const { data: batches = [], isLoading } = useQuery({
    queryKey: ['payment-batches', entityId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('payment_batches')
          .select('*')
          .eq('entity_id', entityId)
          .order('batch_date', { ascending: false });

        if (error) throw error;
        return data || demoBatches;
      } catch (err) {
        console.error('Error fetching batches:', err);
        return demoBatches;
      }
    },
  });

  // Fetch pending bills for quick stats
  const { data: pendingBills = [] } = useQuery({
    queryKey: ['pending-bills', entityId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('bills')
          .select('*')
          .eq('entity_id', entityId)
          .eq('status', 'approved')
          .gt('balance_due', 0);

        if (error) throw error;
        return data || demoPendingBills;
      } catch (err) {
        return demoPendingBills;
      }
    },
  });

  // Process batch mutation
  const processMutation = useMutation({
    mutationFn: async ({ batchId, checkStart }) => {
      const { error } = await supabase
        .from('payment_batches')
        .update({
          status: 'processed',
          processed_at: new Date().toISOString(),
          check_start_number: checkStart || null,
        })
        .eq('id', batchId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['payment-batches', entityId]);
      setShowProcessModal(false);
      setSelectedBatch(null);
      setCheckStartNumber('');
    },
  });

  // Delete batch mutation
  const deleteMutation = useMutation({
    mutationFn: async (batchId) => {
      const { error } = await supabase
        .from('payment_batches')
        .delete()
        .eq('id', batchId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['payment-batches', entityId]);
    },
  });

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

  const handleExportACH = () => {
    // Filter for ACH batches that are pending
    const achBatches = batches.filter(b =>
      b.payment_method === 'ach' && b.status === 'pending'
    );

    if (achBatches.length === 0) {
      alert('No pending ACH batches to export');
      return;
    }

    // Generate NACHA format file (simplified)
    const content = `ACH Export - ${new Date().toISOString()}\n` +
      achBatches.map(b => `Batch: ${b.batch_name}, Amount: ${formatCurrency(b.total_amount)}`).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ach-export-${new Date().toISOString().split('T')[0]}.ach`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleProcessBatch = () => {
    if (!selectedBatch) return;
    processMutation.mutate({
      batchId: selectedBatch.id,
      checkStart: checkStartNumber ? parseInt(checkStartNumber) : null,
    });
  };

  const handleDeleteBatch = (batch) => {
    if (batch.status === 'processed') {
      alert('Cannot delete a processed batch');
      return;
    }
    if (confirm(`Delete batch "${batch.batch_name}"?`)) {
      deleteMutation.mutate(batch.id);
    }
  };

  // Filter batches
  const filteredBatches = batches.filter(batch => {
    const matchesSearch = !searchTerm ||
      batch.batch_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.created_by?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || batch.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate summary stats
  const stats = {
    totalBatches: batches.length,
    pendingBatches: batches.filter(b => b.status === 'pending').length,
    processedThisMonth: batches.filter(b => {
      const batchDate = new Date(b.batch_date);
      const now = new Date();
      return b.status === 'processed' &&
        batchDate.getMonth() === now.getMonth() &&
        batchDate.getFullYear() === now.getFullYear();
    }).length,
    totalProcessed: batches
      .filter(b => b.status === 'processed')
      .reduce((sum, b) => sum + (b.total_amount || 0), 0),
    pendingBillsCount: pendingBills.length,
    pendingBillsTotal: pendingBills.reduce((sum, b) => sum + (b.balance_due || 0), 0),
    availableDiscounts: pendingBills
      .filter(b => b.discount_amount > 0 && new Date(b.discount_date) > new Date())
      .reduce((sum, b) => sum + (b.discount_amount || 0), 0),
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'processed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Processed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800"><FileText className="h-3 w-3 mr-1" />Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Batch Payments</h1>
          <p className="text-muted-foreground">Process multiple payments at once</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportACH}>
            <Download className="h-4 w-4 mr-2" />
            Export ACH
          </Button>
          <Button onClick={() => setShowBatchModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Batch
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Batches</p>
                <p className="text-2xl font-bold">{stats.pendingBatches}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ready to process
                </p>
              </div>
              <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Processed This Month</p>
                <p className="text-2xl font-bold">{stats.processedThisMonth}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(stats.totalProcessed)} total
                </p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bills Awaiting Payment</p>
                <p className="text-2xl font-bold">{stats.pendingBillsCount}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(stats.pendingBillsTotal)} total
                </p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Layers className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Discounts</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.availableDiscounts)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Pay early to save
                </p>
              </div>
              <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search batches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processed">Processed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Batches Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Batch Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Method</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Bills</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Processed</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredBatches.map((batch) => (
                <tr key={batch.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{batch.batch_name}</p>
                      <p className="text-xs text-muted-foreground">by {batch.created_by}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(batch.batch_date)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="capitalize">
                      {batch.payment_method === 'ach' ? (
                        <><Banknote className="h-3 w-3 mr-1" />ACH</>
                      ) : (
                        <><CreditCard className="h-3 w-3 mr-1" />Check</>
                      )}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">{batch.bill_count}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(batch.total_amount)}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(batch.status)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {batch.processed_at ? formatDate(batch.processed_at) : '-'}
                    {batch.check_start_number && (
                      <p className="text-xs">
                        Checks #{batch.check_start_number}-{batch.check_end_number}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`${basePath}/batch-payments/${batch.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {batch.status === 'pending' && (
                          <DropdownMenuItem onClick={() => {
                            setSelectedBatch(batch);
                            setShowProcessModal(true);
                          }}>
                            <Printer className="h-4 w-4 mr-2" />
                            Process Batch
                          </DropdownMenuItem>
                        )}
                        {batch.payment_method === 'ach' && batch.status === 'pending' && (
                          <DropdownMenuItem onClick={handleExportACH}>
                            <Download className="h-4 w-4 mr-2" />
                            Export ACH File
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {batch.status !== 'processed' && (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteBatch(batch)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Batch
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {filteredBatches.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    <CreditCard className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="font-medium">No payment batches found</p>
                    <p className="text-sm">Create a new batch to start processing payments</p>
                    <Button
                      className="mt-4"
                      onClick={() => setShowBatchModal(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Batch
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Batch Payment Wizard Modal */}
      <BatchPaymentWizardModal
        open={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        entityId={entityId}
      />

      {/* Process Batch Modal */}
      <Dialog open={showProcessModal} onOpenChange={setShowProcessModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Payment Batch</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedBatch?.payment_method === 'check' && (
              <div>
                <label className="block text-sm font-medium mb-1">Starting Check Number</label>
                <Input
                  type="number"
                  value={checkStartNumber}
                  onChange={(e) => setCheckStartNumber(e.target.value)}
                  placeholder="e.g., 1001"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Leave blank if not printing checks
                </p>
              </div>
            )}

            {selectedBatch && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Batch Name:</span>
                  <span className="font-medium">{selectedBatch.batch_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-medium capitalize">{selectedBatch.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bills to Process:</span>
                  <span className="font-medium">{selectedBatch.bill_count}</span>
                </div>
                <div className="flex justify-between text-lg pt-2 border-t">
                  <span>Total Amount:</span>
                  <span className="font-bold">{formatCurrency(selectedBatch.total_amount)}</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowProcessModal(false);
              setSelectedBatch(null);
              setCheckStartNumber('');
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleProcessBatch}
              disabled={processMutation.isPending}
            >
              {processMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Process Payments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
