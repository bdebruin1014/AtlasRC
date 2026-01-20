// src/pages/accounting/ExpenseManagementPage.jsx
// Expense Tracking and Reimbursement

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Receipt, DollarSign, Clock, CheckCircle2, XCircle, Plus,
  Upload, Calendar, Filter, Search, Building2, Car, Utensils,
  Plane, ShoppingBag, MoreHorizontal, Eye, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  getExpenseDashboard,
  getExpenses,
  getExpenseById,
  createExpense,
  submitExpense,
  approveExpense,
  rejectExpense,
  getPendingApprovals,
  getExpenseCategories,
  createMileageExpense,
  EXPENSE_STATUS,
  EXPENSE_TYPE,
  PAYMENT_METHOD,
} from '@/services/expenseService';

const ExpenseManagementPage = () => {
  const { entityId } = useParams();
  const [dashboard, setDashboard] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [expenseType, setExpenseType] = useState('regular'); // regular or mileage
  const [searchTerm, setSearchTerm] = useState('');

  // New expense form
  const [newExpense, setNewExpense] = useState({
    expense_date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category_id: '',
    payment_method: PAYMENT_METHOD.PERSONAL_CARD,
    is_reimbursable: true,
    project_id: '',
    job_id: '',
    notes: '',
    // Mileage fields
    miles: '',
    mileage_from: '',
    mileage_to: '',
  });

  useEffect(() => {
    loadData();
  }, [entityId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashboardData, expensesData, categoriesData, approvalsData] = await Promise.all([
        getExpenseDashboard(entityId),
        getExpenses(entityId),
        getExpenseCategories(entityId),
        getPendingApprovals(entityId),
      ]);
      setDashboard(dashboardData);
      setExpenses(expensesData || []);
      setCategories(categoriesData || []);
      setPendingApprovals(approvalsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async () => {
    try {
      if (expenseType === 'mileage') {
        await createMileageExpense(entityId, {
          expense_date: newExpense.expense_date,
          miles: parseFloat(newExpense.miles),
          from_location: newExpense.mileage_from,
          to_location: newExpense.mileage_to,
          category_id: newExpense.category_id,
          project_id: newExpense.project_id || null,
          job_id: newExpense.job_id || null,
          notes: newExpense.notes,
        });
      } else {
        await createExpense({
          entity_id: entityId,
          ...newExpense,
          amount: parseFloat(newExpense.amount),
        });
      }
      
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error creating expense:', error);
    }
  };

  const handleSubmitExpense = async (expenseId) => {
    try {
      await submitExpense(expenseId);
      loadData();
    } catch (error) {
      console.error('Error submitting expense:', error);
    }
  };

  const handleApproveExpense = async (expenseId) => {
    try {
      await approveExpense(expenseId, 'current-user-id');
      loadData();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error approving expense:', error);
    }
  };

  const handleRejectExpense = async (expenseId, reason) => {
    try {
      await rejectExpense(expenseId, 'current-user-id', reason || 'Rejected');
      loadData();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error rejecting expense:', error);
    }
  };

  const handleViewExpense = async (expenseId) => {
    try {
      const expense = await getExpenseById(expenseId);
      setSelectedExpense(expense);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error loading expense:', error);
    }
  };

  const resetForm = () => {
    setNewExpense({
      expense_date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      category_id: '',
      payment_method: PAYMENT_METHOD.PERSONAL_CARD,
      is_reimbursable: true,
      project_id: '',
      job_id: '',
      notes: '',
      miles: '',
      mileage_from: '',
      mileage_to: '',
    });
    setExpenseType('regular');
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

  const getStatusBadge = (status) => {
    const config = {
      [EXPENSE_STATUS.DRAFT]: { color: 'bg-gray-100 text-gray-800', icon: Clock },
      [EXPENSE_STATUS.SUBMITTED]: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      [EXPENSE_STATUS.APPROVED]: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      [EXPENSE_STATUS.REJECTED]: { color: 'bg-red-100 text-red-800', icon: XCircle },
      [EXPENSE_STATUS.REIMBURSED]: { color: 'bg-blue-100 text-blue-800', icon: DollarSign },
    };
    const c = config[status] || config[EXPENSE_STATUS.DRAFT];
    const Icon = c.icon;
    return (
      <Badge className={cn(c.color, "flex items-center gap-1")}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeIcon = (type) => {
    const icons = {
      [EXPENSE_TYPE.MILEAGE]: Car,
      [EXPENSE_TYPE.MEALS]: Utensils,
      [EXPENSE_TYPE.TRAVEL]: Plane,
      [EXPENSE_TYPE.SUPPLIES]: ShoppingBag,
    };
    return icons[type] || Receipt;
  };

  const filteredExpenses = expenses.filter(exp => {
    if (activeTab !== 'all' && exp.status !== activeTab) return false;
    if (searchTerm) {
      return exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             exp.vendor?.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Receipt className="w-7 h-7 text-orange-600" />
            Expenses
          </h1>
          <p className="text-gray-500 mt-1">Track expenses and reimbursements</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Pending Approvals Alert */}
      {pendingApprovals.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600" />
              <div className="flex-1">
                <p className="font-medium text-amber-800">
                  {pendingApprovals.length} expense{pendingApprovals.length > 1 ? 's' : ''} pending approval
                </p>
                <p className="text-sm text-amber-700">
                  Total: {formatCurrency(dashboard?.pending_amount)}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-amber-400 text-amber-700"
                onClick={() => setActiveTab('submitted')}
              >
                Review Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-2xl font-bold">{formatCurrency(dashboard?.month_total)}</p>
                <p className="text-xs text-gray-500">{dashboard?.month_count} expenses</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">YTD Total</p>
                <p className="text-2xl font-bold">{formatCurrency(dashboard?.year_total)}</p>
                <p className="text-xs text-gray-500">{dashboard?.year_count} expenses</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Approval</p>
                <p className="text-2xl font-bold text-amber-600">{dashboard?.pending_count || 0}</p>
                <p className="text-xs text-gray-500">{formatCurrency(dashboard?.pending_amount)}</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Awaiting Reimburse</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(dashboard?.pending_reimbursement)}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Receipt className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      {dashboard?.by_category && Object.keys(dashboard.by_category).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">This Month by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(dashboard.by_category).slice(0, 4).map(([category, data]) => (
                <div key={category} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">{category}</p>
                  <p className="text-lg font-bold mt-1">{formatCurrency(data.amount)}</p>
                  <p className="text-xs text-gray-500">{data.count} expense{data.count > 1 ? 's' : ''}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs & Filter */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['all', 'draft', 'submitted', 'approved', 'reimbursed'].map((tab) => (
            <button
              key={tab}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                activeTab === tab 
                  ? "bg-orange-100 text-orange-700" 
                  : "text-gray-500 hover:bg-gray-100"
              )}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-2 border rounded-lg text-sm w-48"
          />
        </div>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Description</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Category</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Amount</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                <th className="w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredExpenses.map((expense) => {
                const TypeIcon = getTypeIcon(expense.category?.expense_type);
                return (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{formatDate(expense.expense_date)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <TypeIcon className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{expense.description}</p>
                          {expense.project && (
                            <p className="text-xs text-gray-500">{expense.project.name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{expense.category?.name || '-'}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(expense.amount)}
                      {expense.is_reimbursable && (
                        <span className="ml-1 text-xs text-blue-600">*</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(expense.status)}</td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewExpense(expense.id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {expense.status === EXPENSE_STATUS.DRAFT && (
                            <DropdownMenuItem onClick={() => handleSubmitExpense(expense.id)}>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Submit
                            </DropdownMenuItem>
                          )}
                          {expense.status === EXPENSE_STATUS.SUBMITTED && (
                            <>
                              <DropdownMenuItem onClick={() => handleApproveExpense(expense.id)}>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRejectExpense(expense.id, 'Rejected')}>
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No expenses found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Create Expense Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Expense Type Toggle */}
            <div className="flex gap-2">
              <button
                className={cn(
                  "flex-1 py-2 rounded-lg border text-sm font-medium transition-colors",
                  expenseType === 'regular' 
                    ? "bg-orange-100 border-orange-300 text-orange-700"
                    : "hover:bg-gray-50"
                )}
                onClick={() => setExpenseType('regular')}
              >
                <Receipt className="w-4 h-4 inline mr-2" />
                Regular Expense
              </button>
              <button
                className={cn(
                  "flex-1 py-2 rounded-lg border text-sm font-medium transition-colors",
                  expenseType === 'mileage' 
                    ? "bg-orange-100 border-orange-300 text-orange-700"
                    : "hover:bg-gray-50"
                )}
                onClick={() => setExpenseType('mileage')}
              >
                <Car className="w-4 h-4 inline mr-2" />
                Mileage
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={newExpense.expense_date}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, expense_date: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={newExpense.category_id}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, category_id: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {expenseType === 'regular' ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input
                    type="text"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter expense description"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Payment Method</label>
                    <select
                      value={newExpense.payment_method}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, payment_method: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value={PAYMENT_METHOD.PERSONAL_CARD}>Personal Card</option>
                      <option value={PAYMENT_METHOD.COMPANY_CARD}>Company Card</option>
                      <option value={PAYMENT_METHOD.CASH}>Cash</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Miles Driven</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newExpense.miles}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, miles: e.target.value }))}
                    placeholder="Enter miles"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">From</label>
                    <input
                      type="text"
                      value={newExpense.mileage_from}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, mileage_from: e.target.value }))}
                      placeholder="Starting location"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">To</label>
                    <input
                      type="text"
                      value={newExpense.mileage_to}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, mileage_to: e.target.value }))}
                      placeholder="Ending location"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Rate: $0.67/mile (2024 IRS rate)
                </p>
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={newExpense.notes}
                onChange={(e) => setNewExpense(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes..."
                className="w-full px-3 py-2 border rounded-lg"
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="reimbursable"
                checked={newExpense.is_reimbursable}
                onChange={(e) => setNewExpense(prev => ({ ...prev, is_reimbursable: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="reimbursable" className="text-sm">This expense is reimbursable</label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateModal(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreateExpense}>
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expense Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
          </DialogHeader>
          
          {selectedExpense && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-gray-500">{selectedExpense.expense_number}</span>
                {getStatusBadge(selectedExpense.status)}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{formatDate(selectedExpense.expense_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-xl font-bold">{formatCurrency(selectedExpense.amount)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-medium">{selectedExpense.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{selectedExpense.category?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium capitalize">{selectedExpense.payment_method?.replace('_', ' ')}</p>
                </div>
              </div>

              {selectedExpense.project && (
                <div>
                  <p className="text-sm text-gray-500">Project</p>
                  <p className="font-medium">{selectedExpense.project.name}</p>
                </div>
              )}

              {selectedExpense.notes && (
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p>{selectedExpense.notes}</p>
                </div>
              )}

              {selectedExpense.receipts?.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Receipts</p>
                  <div className="flex gap-2">
                    {selectedExpense.receipts.map((receipt) => (
                      <a
                        key={receipt.id}
                        href={receipt.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 border rounded hover:bg-gray-50"
                      >
                        <Receipt className="w-6 h-6 text-gray-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              Close
            </Button>
            {selectedExpense?.status === EXPENSE_STATUS.SUBMITTED && (
              <>
                <Button 
                  variant="outline"
                  onClick={() => handleRejectExpense(selectedExpense.id, 'Rejected')}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button onClick={() => handleApproveExpense(selectedExpense.id)}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpenseManagementPage;
