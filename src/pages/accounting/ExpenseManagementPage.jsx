// src/pages/accounting/ExpenseManagementPage.jsx
// Expense Tracking and Reimbursement

import React, { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Receipt, DollarSign, Clock, CheckCircle2, XCircle, Plus,
  Upload, Calendar, Filter, Search, Building2, Car, Utensils,
  Plane, ShoppingBag, MoreHorizontal, Eye, AlertCircle, Loader2,
  Edit, Trash2, FileText, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import ExpenseFormModal from '@/components/accounting/ExpenseFormModal';

// Demo expenses for development
const demoExpenses = [
  {
    id: 'exp-1',
    expense_date: '2025-01-28',
    description: 'Office Supplies - Project materials',
    vendor_name: 'Office Depot',
    amount: 245.50,
    category: 'office_supplies',
    status: 'approved',
    payment_method: 'company_card',
    is_reimbursable: false,
    project_name: 'Downtown Office Building',
  },
  {
    id: 'exp-2',
    expense_date: '2025-01-27',
    description: 'Client Lunch Meeting',
    vendor_name: 'The Capital Grille',
    amount: 187.25,
    category: 'travel',
    status: 'submitted',
    payment_method: 'personal_card',
    is_reimbursable: true,
    project_name: 'Tech Park Phase 2',
  },
  {
    id: 'exp-3',
    expense_date: '2025-01-26',
    description: 'Equipment Rental - Excavator',
    vendor_name: 'United Rentals',
    amount: 1250.00,
    category: 'repairs_maintenance',
    status: 'approved',
    payment_method: 'check',
    is_reimbursable: false,
    project_name: 'Riverside Apartments',
  },
  {
    id: 'exp-4',
    expense_date: '2025-01-25',
    description: 'Software Subscription - AutoCAD',
    vendor_name: 'Autodesk',
    amount: 299.00,
    category: 'software',
    status: 'pending',
    payment_method: 'company_card',
    is_reimbursable: false,
    project_name: null,
  },
  {
    id: 'exp-5',
    expense_date: '2025-01-24',
    description: 'Site Visit - Mileage Reimbursement',
    vendor_name: 'Employee Expense',
    amount: 67.50,
    category: 'travel',
    status: 'reimbursed',
    payment_method: 'personal_card',
    is_reimbursable: true,
    project_name: 'Community Center Renovation',
  },
  {
    id: 'exp-6',
    expense_date: '2025-01-23',
    description: 'Building Materials',
    vendor_name: 'Home Depot',
    amount: 892.45,
    category: 'other',
    status: 'draft',
    payment_method: 'company_card',
    is_reimbursable: false,
    project_name: 'Tech Park Phase 2',
  },
];

const EXPENSE_CATEGORIES = {
  office_supplies: 'Office Supplies',
  utilities: 'Utilities',
  insurance: 'Insurance',
  professional_services: 'Professional Services',
  repairs_maintenance: 'Repairs & Maintenance',
  travel: 'Travel & Entertainment',
  marketing: 'Marketing & Advertising',
  software: 'Software & Subscriptions',
  taxes: 'Taxes & Fees',
  other: 'Other',
};

export default function ExpenseManagementPage() {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const context = useOutletContext();
  const entity = context?.entity;
  const basePath = `/accounting/entities/${entityId}`;

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Fetch expenses
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses', entityId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('entity_id', entityId)
          .eq('transaction_type', 'expense')
          .order('transaction_date', { ascending: false });

        if (error) throw error;

        return (data || []).map(t => ({
          id: t.id,
          expense_date: t.transaction_date,
          description: t.description,
          vendor_name: t.vendor_name,
          amount: Math.abs(t.amount || 0),
          category: t.category,
          status: t.status || 'pending',
          payment_method: t.payment_method,
          is_reimbursable: t.is_reimbursable || false,
          project_name: t.project_name,
          reference_number: t.reference_number,
          notes: t.notes,
        }));
      } catch (err) {
        console.error('Error fetching expenses:', err);
        return demoExpenses;
      }
    },
  });

  // Delete expense mutation
  const deleteMutation = useMutation({
    mutationFn: async (expenseId) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', expenseId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['expenses', entityId]);
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ expenseId, status }) => {
      const { error } = await supabase
        .from('transactions')
        .update({ status })
        .eq('id', expenseId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['expenses', entityId]);
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

  const handleEditExpense = (expense) => {
    setSelectedExpense(expense);
    setShowExpenseModal(true);
  };

  const handleDeleteExpense = (expense) => {
    if (confirm(`Delete expense "${expense.description}"?`)) {
      deleteMutation.mutate(expense.id);
    }
  };

  const handleApprove = (expense) => {
    updateStatusMutation.mutate({ expenseId: expense.id, status: 'approved' });
  };

  const handleReject = (expense) => {
    updateStatusMutation.mutate({ expenseId: expense.id, status: 'rejected' });
  };

  // Filter expenses
  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = !searchTerm ||
      exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || exp.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || exp.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Calculate summary stats
  const stats = {
    totalExpenses: expenses.length,
    totalAmount: expenses.reduce((sum, e) => sum + e.amount, 0),
    pendingApproval: expenses.filter(e => e.status === 'submitted' || e.status === 'pending').length,
    pendingAmount: expenses
      .filter(e => e.status === 'submitted' || e.status === 'pending')
      .reduce((sum, e) => sum + e.amount, 0),
    pendingReimbursement: expenses
      .filter(e => e.is_reimbursable && e.status === 'approved')
      .reduce((sum, e) => sum + e.amount, 0),
    thisMonth: expenses
      .filter(e => {
        const expDate = new Date(e.expense_date);
        const now = new Date();
        return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, e) => sum + e.amount, 0),
  };

  const getStatusBadge = (status) => {
    const config = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: FileText },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      submitted: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      reimbursed: { color: 'bg-purple-100 text-purple-800', icon: DollarSign },
      posted: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    };
    const c = config[status] || config.pending;
    const Icon = c.icon;
    return (
      <Badge className={cn(c.color, "flex items-center gap-1")}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
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
          <h1 className="text-2xl font-bold">Expenses</h1>
          <p className="text-muted-foreground">Track and manage expenses</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowImportModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => { setSelectedExpense(null); setShowExpenseModal(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            New Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.thisMonth)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {expenses.filter(e => {
                    const expDate = new Date(e.expense_date);
                    const now = new Date();
                    return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
                  }).length} expenses
                </p>
              </div>
              <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalExpenses} records
                </p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pendingApproval}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(stats.pendingAmount)}
                </p>
              </div>
              <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Awaiting Reimburse</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.pendingReimbursement)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Approved & reimbursable
                </p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Receipt className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert for pending approvals */}
      {stats.pendingApproval > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-amber-800">
              {stats.pendingApproval} expense{stats.pendingApproval > 1 ? 's' : ''} pending approval
            </p>
            <p className="text-sm text-amber-700">
              Total: {formatCurrency(stats.pendingAmount)}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-amber-300 text-amber-700"
            onClick={() => setStatusFilter('pending')}
          >
            Review Now
          </Button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="reimbursed">Reimbursed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(EXPENSE_CATEGORIES).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Description</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Vendor</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm">{formatDate(expense.expense_date)}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      {expense.project_name && (
                        <p className="text-xs text-muted-foreground">{expense.project_name}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{expense.vendor_name || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    {EXPENSE_CATEGORIES[expense.category] || expense.category || '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-medium">{formatCurrency(expense.amount)}</span>
                    {expense.is_reimbursable && (
                      <span className="ml-1 text-xs text-blue-600">*</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(expense.status)}</td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditExpense(expense)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View/Edit
                        </DropdownMenuItem>
                        {(expense.status === 'pending' || expense.status === 'submitted') && (
                          <>
                            <DropdownMenuItem onClick={() => handleApprove(expense)}>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReject(expense)}>
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteExpense(expense)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <Receipt className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="font-medium">No expenses found</p>
                    <p className="text-sm">Add a new expense to get started</p>
                    <Button
                      className="mt-4"
                      onClick={() => { setSelectedExpense(null); setShowExpenseModal(true); }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Expense
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">* Reimbursable expense</p>

      {/* Expense Form Modal */}
      <ExpenseFormModal
        open={showExpenseModal}
        onClose={() => { setShowExpenseModal(false); setSelectedExpense(null); }}
        entityId={entityId}
        expense={selectedExpense}
      />
    </div>
  );
}
