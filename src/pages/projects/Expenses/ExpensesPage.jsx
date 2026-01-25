// src/pages/projects/Expenses/ExpensesPage.jsx
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DollarSign, Plus, Search, Filter, AlertCircle, CheckCircle2,
  Clock, XCircle, CreditCard, FileText,
} from 'lucide-react';
import { useProjectExpenses } from '@/hooks/useProjectExpenses';
import { useExpenseActions } from '@/hooks/useProjectExpenses';
import {
  EXPENSE_TYPES, EXPENSE_STATUSES, getExpenseTypeLabel, getStatusConfig,
} from '@/services/projectExpenseService';
import ExpenseForm from './ExpenseForm';
import ExpenseDetail from './ExpenseDetail';

export default function ExpensesPage() {
  const { projectId } = useParams();
  const { expenses, loading, totals, refetch } = useProjectExpenses(projectId || 'demo-project-1');
  const { approve, deny, markPaid, saving } = useExpenseActions(projectId || 'demo-project-1');

  const [showForm, setShowForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = expenses.filter(exp => {
    if (filterStatus !== 'all' && exp.status !== filterStatus) return false;
    if (filterType !== 'all' && exp.expense_type !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        exp.description?.toLowerCase().includes(q) ||
        exp.vendor_name?.toLowerCase().includes(q) ||
        exp.invoice_number?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v || 0);

  const handleApprove = async (expenseId) => {
    await approve(expenseId, 'Approved.');
    refetch();
  };

  const handleDeny = async (expenseId, reason) => {
    await deny(expenseId, reason || 'Denied.');
    refetch();
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Loading expenses...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-500 mt-1">Track project expenses with approval workflow</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-[#2F855A] hover:bg-[#276749]">
          <Plus className="w-4 h-4 mr-2" /> New Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-1">
            <DollarSign className="w-3.5 h-3.5" /> TOTAL
          </div>
          <div className="text-xl font-bold text-gray-900">{fmt(totals.totalAmount)}</div>
          <div className="text-xs text-gray-500">{totals.totalCount} expenses</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-600 text-xs font-medium mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> PAID
          </div>
          <div className="text-xl font-bold text-green-700">{fmt(totals.paidAmount)}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-600 text-xs font-medium mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> APPROVED
          </div>
          <div className="text-xl font-bold text-blue-700">{fmt(totals.approvedAmount)}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-600 text-xs font-medium mb-1">
            <Clock className="w-3.5 h-3.5" /> PENDING
          </div>
          <div className="text-xl font-bold text-amber-700">{fmt(totals.pendingAmount)}</div>
          <div className="text-xs text-amber-600">{totals.awaitingApproval} awaiting approval</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-600 text-xs font-medium mb-1">
            <XCircle className="w-3.5 h-3.5" /> DENIED
          </div>
          <div className="text-xl font-bold text-red-700">{fmt(totals.deniedAmount)}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-600 text-xs font-medium mb-1">
            <AlertCircle className="w-3.5 h-3.5" /> OVERDUE
          </div>
          <div className="text-xl font-bold text-orange-700">{totals.overdueCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-64"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All Statuses</option>
          {EXPENSE_STATUSES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All Types</option>
          {EXPENSE_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No expenses found.
                  </td>
                </tr>
              ) : (
                filtered.map(exp => {
                  const statusConfig = getStatusConfig(exp.status);
                  const isOverdue = exp.due_date && exp.status !== 'paid' && new Date(exp.due_date) < new Date();
                  return (
                    <tr
                      key={exp.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedExpense(exp)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{exp.description}</div>
                        {exp.invoice_number && (
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <FileText className="w-3 h-3" /> {exp.invoice_number}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{exp.vendor_name || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{getExpenseTypeLabel(exp.expense_type)}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{fmt(exp.total_amount)}</td>
                      <td className="px-4 py-3 text-gray-600">
                        <div>{exp.expense_date}</div>
                        {isOverdue && (
                          <div className="text-xs text-red-600 font-medium">Overdue</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        {exp.status === 'waiting_approval' && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-700 border-green-300 hover:bg-green-50 h-7 text-xs"
                              onClick={() => handleApprove(exp.id)}
                              disabled={saving}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-700 border-red-300 hover:bg-red-50 h-7 text-xs"
                              onClick={() => handleDeny(exp.id)}
                              disabled={saving}
                            >
                              Deny
                            </Button>
                          </div>
                        )}
                        {exp.status === 'approved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-700 border-blue-300 hover:bg-blue-50 h-7 text-xs"
                            onClick={async () => {
                              await markPaid(exp.id, 'ach', `ACH-${Date.now()}`, new Date().toISOString().split('T')[0]);
                              refetch();
                            }}
                            disabled={saving}
                          >
                            <CreditCard className="w-3 h-3 mr-1" /> Mark Paid
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Dialog */}
      {showForm && (
        <ExpenseForm
          open={showForm}
          projectId={projectId || 'demo-project-1'}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); refetch(); }}
        />
      )}

      {/* Detail Dialog */}
      {selectedExpense && (
        <ExpenseDetail
          open={!!selectedExpense}
          expense={selectedExpense}
          onClose={() => setSelectedExpense(null)}
          onUpdated={refetch}
        />
      )}
    </div>
  );
}
