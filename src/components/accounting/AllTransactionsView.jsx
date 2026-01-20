import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, Calendar, ArrowUpRight, 
  ArrowDownLeft, MoreHorizontal, Eye 
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

// Mock transactions data
const mockTransactions = [
  {
    id: 1,
    date: '2024-12-20',
    type: 'bill_payment',
    type_label: 'Bill Payment',
    reference: 'PAY-001',
    description: 'Payment to BuildRight Construction',
    account: 'Chase Operating',
    debit: 12500.00,
    credit: 0,
    balance: 232500.00,
  },
  {
    id: 2,
    date: '2024-12-18',
    type: 'deposit',
    type_label: 'Deposit',
    reference: 'DEP-005',
    description: 'Investor capital contribution',
    account: 'Chase Operating',
    debit: 0,
    credit: 50000.00,
    balance: 245000.00,
  },
  {
    id: 3,
    date: '2024-12-15',
    type: 'journal_entry',
    type_label: 'Journal Entry',
    reference: 'JE-2024-001',
    description: 'Monthly depreciation',
    account: 'Depreciation Expense',
    debit: 5000.00,
    credit: 0,
    balance: null,
  },
  {
    id: 4,
    date: '2024-12-10',
    type: 'bill',
    type_label: 'Bill',
    reference: 'BILL-003',
    description: 'Metro Electric - Electrical work',
    account: 'Accounts Payable',
    debit: 0,
    credit: 8750.00,
    balance: 43750.00,
  },
  {
    id: 5,
    date: '2024-12-05',
    type: 'transfer',
    type_label: 'Transfer',
    reference: 'TRF-001',
    description: 'Transfer to payroll account',
    account: 'Chase Operating',
    debit: 25000.00,
    credit: 0,
    balance: 195000.00,
  },
  {
    id: 6,
    date: '2024-12-01',
    type: 'distribution',
    type_label: 'Distribution',
    reference: 'DIST-001',
    description: 'Q4 member distribution',
    account: 'Member Capital',
    debit: 15000.00,
    credit: 0,
    balance: 485000.00,
  },
];

const typeColors = {
  bill: 'bg-yellow-100 text-yellow-800',
  bill_payment: 'bg-green-100 text-green-800',
  deposit: 'bg-blue-100 text-blue-800',
  journal_entry: 'bg-purple-100 text-purple-800',
  transfer: 'bg-gray-100 text-gray-800',
  distribution: 'bg-red-100 text-red-800',
  contribution: 'bg-emerald-100 text-emerald-800',
};

const AllTransactionsView = ({ entityId, onSelectTransaction }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    loadTransactions();
  }, [entityId, typeFilter, dateRange]);

  const loadTransactions = async () => {
    setLoading(true);
    // In production, this would call a unified transactions service
    setTimeout(() => {
      setTransactions(mockTransactions);
      setLoading(false);
    }, 500);
  };

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = 
      txn.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.reference?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || txn.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const totals = {
    debits: filteredTransactions.reduce((sum, t) => sum + (t.debit || 0), 0),
    credits: filteredTransactions.reduce((sum, t) => sum + (t.credit || 0), 0),
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
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">Total Transactions</p>
          <p className="text-2xl font-bold">{filteredTransactions.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">Total Debits</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totals.debits)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">Total Credits</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.credits)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="bill">Bills</SelectItem>
              <SelectItem value="bill_payment">Payments</SelectItem>
              <SelectItem value="deposit">Deposits</SelectItem>
              <SelectItem value="journal_entry">Journal Entries</SelectItem>
              <SelectItem value="transfer">Transfers</SelectItem>
              <SelectItem value="distribution">Distributions</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">This year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>

        {/* Table */}
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Transactions</h3>
            <p className="text-gray-500">No transactions found for the selected filters.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Account</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((txn) => (
                <TableRow 
                  key={txn.id} 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onSelectTransaction?.(txn)}
                >
                  <TableCell>{formatDate(txn.date)}</TableCell>
                  <TableCell>
                    <Badge className={cn('text-xs', typeColors[txn.type])}>
                      {txn.type_label}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{txn.reference}</TableCell>
                  <TableCell>{txn.description}</TableCell>
                  <TableCell className="text-gray-500">{txn.account}</TableCell>
                  <TableCell className="text-right font-mono">
                    {txn.debit > 0 ? (
                      <span className="text-red-600">{formatCurrency(txn.debit)}</span>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {txn.credit > 0 ? (
                      <span className="text-green-600">{formatCurrency(txn.credit)}</span>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" /> View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default AllTransactionsView;
