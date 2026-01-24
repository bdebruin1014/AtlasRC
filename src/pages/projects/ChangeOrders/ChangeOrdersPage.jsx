// src/pages/projects/ChangeOrders/ChangeOrdersPage.jsx
// Main Change Orders page with summary cards, filterable list, and approval actions

import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Search, FileText, DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useProjectChangeOrders } from '@/hooks/useChangeOrders';
import { getStatusConfig, getReasonLabel, formatCONumber, CO_STATUSES, CO_REASONS } from '@/services/changeOrderService';
import ChangeOrderForm from './ChangeOrderForm';
import ChangeOrderDetail from './ChangeOrderDetail';
import ApprovalModal from './ApprovalModal';

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.abs(amount));
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const ChangeOrdersPage = ({ projectId: propProjectId }) => {
  const { projectId: paramProjectId } = useParams();
  const projectId = propProjectId || paramProjectId || 'demo-project-1';

  const { changeOrders, loading, nextCONumber, totals, refetch } = useProjectChangeOrders(projectId);

  const [showForm, setShowForm] = useState(false);
  const [selectedCOId, setSelectedCOId] = useState(null);
  const [approvalTarget, setApprovalTarget] = useState(null); // { id, action: 'approve' | 'deny' }
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reasonFilter, setReasonFilter] = useState('all');

  // Filtered change orders
  const filteredCOs = useMemo(() => {
    let result = changeOrders;
    if (statusFilter !== 'all') {
      result = result.filter(co => co.status === statusFilter);
    }
    if (reasonFilter !== 'all') {
      result = result.filter(co => co.reason === reasonFilter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(co =>
        co.title?.toLowerCase().includes(term) ||
        co.contractor_name?.toLowerCase().includes(term) ||
        co.description?.toLowerCase().includes(term) ||
        formatCONumber(co.co_number).toLowerCase().includes(term)
      );
    }
    return result;
  }, [changeOrders, statusFilter, reasonFilter, searchTerm]);

  const handleCreated = () => {
    setShowForm(false);
    refetch();
  };

  const handleApprovalDone = () => {
    setApprovalTarget(null);
    refetch();
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F855A]" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Change Orders</h2>
          <p className="text-sm text-gray-500 mt-1">
            {totals.totalCount} change orders &middot; {totals.pendingCount} pending approval
          </p>
        </div>
        <Button size="sm" className="bg-[#2F855A] hover:bg-[#276749]" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1" /> New Change Order
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-white rounded-lg border-l-4 border-l-amber-400 border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Pending Approval</p>
          <p className="text-lg font-bold text-amber-700">
            {totals.pendingAmount >= 0 ? '+' : ''}{formatCurrency(totals.pendingAmount)}
          </p>
          <p className="text-xs text-gray-400">{totals.pendingCount} orders</p>
        </div>
        <div className="bg-white rounded-lg border-l-4 border-l-green-500 border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Approved</p>
          <p className="text-lg font-bold text-green-700">
            {totals.approvedAmount >= 0 ? '+' : ''}{formatCurrency(totals.approvedAmount)}
          </p>
          <p className="text-xs text-gray-400">{totals.approvedCount} orders</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Net Budget Change</p>
          <p className={cn("text-lg font-bold", totals.netChange >= 0 ? "text-red-600" : "text-green-600")}>
            {totals.netChange >= 0 ? '+' : '-'}{formatCurrency(totals.netChange)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Paid</p>
          <p className="text-lg font-bold text-gray-700">{formatCurrency(totals.paidAmount)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Unpaid</p>
          <p className="text-lg font-bold text-orange-600">{formatCurrency(totals.unpaidAmount)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Search change orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Statuses</option>
          {CO_STATUSES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={reasonFilter}
          onChange={(e) => setReasonFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Reasons</option>
          {CO_REASONS.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* Change Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CO #</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contractor</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Payment</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-36">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredCOs.map(co => {
              const statusConfig = getStatusConfig(co.status);
              return (
                <tr key={co.id} className={cn(
                  "hover:bg-gray-50 transition-colors",
                  co.status === 'pending' && "bg-amber-50/30"
                )}>
                  <td className="px-4 py-3 font-medium text-gray-900">{formatCONumber(co.co_number)}</td>
                  <td className="px-4 py-3">
                    <div className="max-w-[200px]">
                      <p className="text-gray-800 truncate">{co.title}</p>
                      <p className="text-xs text-gray-400 truncate">{co.budget_line_item_name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{co.contractor_name}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-600">{getReasonLabel(co.reason)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn(
                      "font-mono font-medium",
                      co.amount >= 0 ? "text-red-600" : "text-green-600"
                    )}>
                      {co.amount >= 0 ? '+' : '-'}{formatCurrency(co.amount)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="outline" className={cn("text-xs", statusConfig.color)}>
                      {statusConfig.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {co.status === 'approved' && (
                      <span className={cn("text-xs font-medium", co.is_paid ? "text-green-600" : "text-orange-600")}>
                        {co.is_paid ? 'Paid' : 'Unpaid'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedCOId(co.id)}
                        className="text-xs text-[#2F855A] hover:underline font-medium"
                      >
                        View
                      </button>
                      {co.status === 'pending' && (
                        <>
                          <button
                            onClick={() => setApprovalTarget({ id: co.id, action: 'approve', co })}
                            className="text-xs text-green-600 hover:underline font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setApprovalTarget({ id: co.id, action: 'deny', co })}
                            className="text-xs text-red-600 hover:underline font-medium"
                          >
                            Deny
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* Totals Footer */}
          {filteredCOs.length > 0 && (
            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
              <tr className="font-semibold text-sm">
                <td className="px-4 py-3" colSpan={4}>
                  TOTALS ({filteredCOs.length} change orders)
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={cn(
                    "font-mono",
                    filteredCOs.reduce((s, co) => s + co.amount, 0) >= 0 ? "text-red-600" : "text-green-600"
                  )}>
                    {filteredCOs.reduce((s, co) => s + co.amount, 0) >= 0 ? '+' : '-'}
                    {formatCurrency(filteredCOs.reduce((s, co) => s + co.amount, 0))}
                  </span>
                </td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          )}
        </table>

        {filteredCOs.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p>No change orders found.</p>
          </div>
        )}
      </div>

      {/* New Change Order Form */}
      {showForm && (
        <ChangeOrderForm
          open={showForm}
          projectId={projectId}
          nextCONumber={nextCONumber}
          onCreated={handleCreated}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Change Order Detail */}
      {selectedCOId && (
        <ChangeOrderDetail
          open={!!selectedCOId}
          coId={selectedCOId}
          projectId={projectId}
          onUpdated={() => { setSelectedCOId(null); refetch(); }}
          onClose={() => setSelectedCOId(null)}
        />
      )}

      {/* Approval Modal */}
      {approvalTarget && (
        <ApprovalModal
          open={!!approvalTarget}
          action={approvalTarget.action}
          changeOrder={approvalTarget.co}
          projectId={projectId}
          onComplete={handleApprovalDone}
          onClose={() => setApprovalTarget(null)}
        />
      )}
    </div>
  );
};

export default ChangeOrdersPage;
