import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Filter, MoreHorizontal, Eye, Edit, 
  Trash2, CheckCircle, Clock, AlertCircle, Plus 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { billService } from '@/services/billService';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-800', icon: AlertCircle },
  void: { label: 'Void', color: 'bg-gray-100 text-gray-500', icon: Trash2 },
};

const BillsList = ({ entityId, onSelectBill, onNewBill, onPayBill }) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadBills();
  }, [entityId]);

  const loadBills = async () => {
    setLoading(true);
    try {
      const { data, error } = await billService.getAll(entityId);
      if (error) throw error;
      setBills(data || []);
    } catch (error) {
      console.error('Error loading bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = 
      bill.vendor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.bill_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totals = {
    all: bills.length,
    pending: bills.filter(b => b.status === 'pending').length,
    overdue: bills.filter(b => b.status === 'overdue').length,
    totalAmount: bills.filter(b => ['pending', 'approved', 'overdue'].includes(b.status))
      .reduce((sum, b) => sum + (b.amount || 0), 0),
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">Total Bills</p>
          <p className="text-2xl font-bold">{totals.all}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{totals.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">Overdue</p>
          <p className="text-2xl font-bold text-red-600">{totals.overdue}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">Total Outstanding</p>
          <p className="text-2xl font-bold">{formatCurrency(totals.totalAmount)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search bills..."
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
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={onNewBill} className="bg-[#2F855A] hover:bg-[#276749]">
            <Plus className="w-4 h-4 mr-2" /> New Bill
          </Button>
        </div>

        {/* Table */}
        {filteredBills.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Bills Found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Get started by creating your first bill'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button onClick={onNewBill} className="bg-[#2F855A] hover:bg-[#276749]">
                Create Bill
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill #</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBills.map((bill) => {
                const status = statusConfig[bill.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                return (
                  <TableRow 
                    key={bill.id} 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => onSelectBill(bill)}
                  >
                    <TableCell className="font-medium">{bill.bill_number}</TableCell>
                    <TableCell>{bill.vendor_name}</TableCell>
                    <TableCell>{formatDate(bill.bill_date)}</TableCell>
                    <TableCell>{formatDate(bill.due_date)}</TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs gap-1', status.color)}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(bill.amount)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(bill.balance || bill.amount)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelectBill(bill); }}>
                            <Eye className="w-4 h-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelectBill(bill); }}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          {bill.status !== 'paid' && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPayBill?.(bill); }}>
                              <CheckCircle className="w-4 h-4 mr-2" /> Record Payment
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
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

export default BillsList;
