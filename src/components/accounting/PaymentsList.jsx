import React, { useState, useEffect } from 'react';
import {
  CreditCard, Search, MoreHorizontal, Eye,
  CheckCircle, Clock, AlertCircle, Plus, Ban
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800', icon: AlertCircle },
  voided: { label: 'Voided', color: 'bg-gray-100 text-gray-500', icon: Ban },
};

const PaymentsList = ({ entityId, onSelectPayment, onNewPayment }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadPayments();
  }, [entityId]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bill_payments')
        .select(`
          *,
          bill:bills(id, bill_number, vendor_id),
          vendor:vendors(id, company_name, name)
        `)
        .eq('entity_id', entityId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const vendorName = payment.vendor?.company_name || payment.vendor?.name || '';
    const matchesSearch =
      vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.reference_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.payment_method?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totals = {
    all: payments.length,
    totalAmount: payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0),
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">Total Payments</p>
          <p className="text-2xl font-bold">{totals.all}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">Total Paid</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.totalAmount)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">This Month</p>
          <p className="text-2xl font-bold">
            {payments.filter(p => {
              const d = new Date(p.payment_date);
              const now = new Date();
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search payments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="voided">Voided</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={onNewPayment} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" /> Record Payment
          </Button>
        </div>

        {/* Table */}
        {filteredPayments.length === 0 ? (
          <div className="p-8 text-center">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Payments Found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Record your first payment to get started'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button onClick={onNewPayment} className="bg-emerald-600 hover:bg-emerald-700">
                Record Payment
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Bill #</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => {
                const status = statusConfig[payment.status] || statusConfig.completed;
                const StatusIcon = status.icon;
                return (
                  <TableRow
                    key={payment.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => onSelectPayment?.(payment)}
                  >
                    <TableCell>{formatDate(payment.payment_date)}</TableCell>
                    <TableCell>{payment.vendor?.company_name || payment.vendor?.name || '—'}</TableCell>
                    <TableCell className="font-medium">{payment.bill?.bill_number || '—'}</TableCell>
                    <TableCell className="capitalize">{payment.payment_method || '—'}</TableCell>
                    <TableCell>{payment.reference_number || '—'}</TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs gap-1', status.color)}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelectPayment?.(payment); }}>
                            <Eye className="w-4 h-4 mr-2" /> View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default PaymentsList;
