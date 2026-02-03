import React, { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Plus, Search, Download, Filter, Eye, Edit2, ChevronDown,
  Receipt, FileText, BookOpen, DollarSign, ArrowUpRight, ArrowDownRight,
  ArrowRightLeft, MoreHorizontal
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
import ExpenseFormModal from '@/components/accounting/ExpenseFormModal';

// Demo transactions for fallback
const demoTransactions = [
  { id: 'TXN-001', transaction_date: '2024-12-28', transaction_type: 'deposit', description: 'Rental Income - December', account_name: 'Operating Account', amount: 145000, category: 'Revenue', status: 'posted' },
  { id: 'TXN-002', transaction_date: '2024-12-27', transaction_type: 'payment', description: 'Smith Construction - Draw #5', account_name: 'Construction Account', amount: -850000, category: 'Construction', status: 'posted' },
  { id: 'TXN-003', transaction_date: '2024-12-26', transaction_type: 'payment', description: 'Property Tax Payment - Q4', account_name: 'Operating Account', amount: -45000, category: 'Operating Expenses', status: 'posted' },
  { id: 'TXN-004', transaction_date: '2024-12-25', transaction_type: 'deposit', description: 'Management Fee Income - Dec', account_name: 'Operating Account', amount: 35000, category: 'Revenue', status: 'posted' },
  { id: 'TXN-005', transaction_date: '2024-12-24', transaction_type: 'deposit', description: 'Lot Sale - Lot 15', account_name: 'Construction Account', amount: 285000, category: 'Revenue', status: 'posted' },
  { id: 'TXN-006', transaction_date: '2024-12-23', transaction_type: 'expense', description: 'Ferguson Supply - Plumbing Materials', account_name: 'Construction Account', amount: -48500, category: 'Construction', status: 'pending' },
  { id: 'TXN-007', transaction_date: '2024-12-22', transaction_type: 'transfer', description: 'Transfer to Payroll Account', account_name: 'Operating Account', amount: -75000, category: 'Transfer', status: 'posted' },
  { id: 'TXN-008', transaction_date: '2024-12-22', transaction_type: 'deposit', description: 'Construction Loan Draw', account_name: 'Construction Account', amount: 500000, category: 'Financing', status: 'posted' },
  { id: 'TXN-009', transaction_date: '2024-12-20', transaction_type: 'expense', description: 'Insurance Premium - Annual', account_name: 'Operating Account', amount: -28500, category: 'Operating Expenses', status: 'posted' },
  { id: 'TXN-010', transaction_date: '2024-12-19', transaction_type: 'expense', description: 'Legal Fees - Contract Review', account_name: 'Operating Account', amount: -15000, category: 'Professional Services', status: 'posted' },
];

const TYPE_CONFIG = {
  deposit: { color: 'bg-green-100 text-green-700', icon: ArrowDownRight },
  payment: { color: 'bg-red-100 text-red-700', icon: ArrowUpRight },
  expense: { color: 'bg-orange-100 text-orange-700', icon: ArrowUpRight },
  transfer: { color: 'bg-blue-100 text-blue-700', icon: ArrowRightLeft },
  journal: { color: 'bg-purple-100 text-purple-700', icon: BookOpen },
  invoice: { color: 'bg-cyan-100 text-cyan-700', icon: FileText },
  bill: { color: 'bg-amber-100 text-amber-700', icon: Receipt },
};

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.abs(val) || 0);

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const fetchTransactions = async (entityId) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('entity_id', entityId)
      .order('transaction_date', { ascending: false })
      .limit(100);

    if (data && !error) return data;
  } catch (err) {
    console.error('Error fetching transactions:', err);
  }
  return demoTransactions;
};

export default function TransactionsPage() {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const context = useOutletContext();
  const entity = context?.entity;

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const basePath = `/accounting/entities/${entityId}`;

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['entity-transactions', entityId],
    queryFn: () => fetchTransactions(entityId),
    enabled: !!entityId,
  });

  const filteredTransactions = transactions.filter(tx => {
    if (filterType !== 'all' && tx.transaction_type !== filterType) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        tx.description?.toLowerCase().includes(term) ||
        tx.vendor_name?.toLowerCase().includes(term) ||
        tx.category?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const totalDeposits = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalPayments = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const netChange = totalDeposits - totalPayments;

  const handleExport = () => {
    // Export functionality
    const csvContent = [
      ['Date', 'Type', 'Description', 'Account', 'Amount', 'Status'].join(','),
      ...filteredTransactions.map(tx => [
        tx.transaction_date,
        tx.transaction_type,
        `"${tx.description}"`,
        tx.account_name || '',
        tx.amount,
        tx.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${entityId}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">All Transactions</h1>
          <p className="text-muted-foreground">
            View all financial transactions for {entity?.name || entity?.short_name || 'this entity'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Transaction
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`${basePath}/bills/new`)}>
                <Receipt className="h-4 w-4 mr-2" />
                New Bill
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`${basePath}/invoices/new`)}>
                <FileText className="h-4 w-4 mr-2" />
                New Invoice
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`${basePath}/journal-entries/new`)}>
                <BookOpen className="h-4 w-4 mr-2" />
                Journal Entry
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowExpenseModal(true)}>
                <DollarSign className="h-4 w-4 mr-2" />
                Record Expense
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{transactions.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Deposits</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalDeposits)}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Payments</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalPayments)}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Change</p>
                <p className={cn("text-2xl font-bold", netChange >= 0 ? "text-green-600" : "text-red-600")}>
                  {netChange >= 0 ? '+' : '-'}{formatCurrency(netChange)}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="border rounded-md px-3 py-2 text-sm bg-background"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="deposit">Deposits</option>
              <option value="payment">Payments</option>
              <option value="expense">Expenses</option>
              <option value="transfer">Transfers</option>
              <option value="journal">Journal Entries</option>
              <option value="invoice">Invoices</option>
              <option value="bill">Bills</option>
            </select>
            <select className="border rounded-md px-3 py-2 text-sm bg-background">
              <option value="">All Accounts</option>
              <option>Operating Account</option>
              <option>Construction Account</option>
              <option>Payroll Account</option>
            </select>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-1" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
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
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-left px-4 py-3 font-medium">Description</th>
                  <th className="text-left px-4 py-3 font-medium">Account</th>
                  <th className="text-right px-4 py-3 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No transactions found</p>
                      <p className="text-sm">Create your first transaction to get started</p>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const typeConfig = TYPE_CONFIG[tx.transaction_type] || TYPE_CONFIG.payment;
                    const TypeIcon = typeConfig.icon;

                    return (
                      <tr key={tx.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3">{formatDate(tx.transaction_date)}</td>
                        <td className="px-4 py-3">
                          <Badge className={cn("capitalize", typeConfig.color)}>
                            <TypeIcon className="w-3 h-3 mr-1" />
                            {tx.transaction_type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{tx.description}</p>
                            {tx.vendor_name && (
                              <p className="text-xs text-muted-foreground">{tx.vendor_name}</p>
                            )}
                            {tx.category && (
                              <p className="text-xs text-muted-foreground">{tx.category}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{tx.account_name || '-'}</td>
                        <td className={cn(
                          "px-4 py-3 text-right font-medium",
                          tx.amount > 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {tx.amount > 0 ? '+' : '-'}{formatCurrency(tx.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={cn(
                            tx.status === 'posted' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                          )}>
                            {tx.status}
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
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
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

      {/* Expense Modal */}
      <ExpenseFormModal
        open={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        entityId={entityId}
      />
    </div>
  );
}
