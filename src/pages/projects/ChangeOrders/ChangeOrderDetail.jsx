// src/pages/projects/ChangeOrders/ChangeOrderDetail.jsx
// Detail view of a single change order with approval actions and payment tracking

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CheckCircle, XCircle, DollarSign, Calendar, User, FileText,
  Building2, Printer, AlertTriangle, ClipboardList
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChangeOrderDetail, useChangeOrderActions } from '@/hooks/useChangeOrders';
import { getStatusConfig, getReasonLabel, formatCONumber } from '@/services/changeOrderService';

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.abs(amount));
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const ChangeOrderDetail = ({ open, coId, projectId, onUpdated, onClose }) => {
  const { changeOrder: co, documents, loading, refetch } = useChangeOrderDetail(coId);
  const { approve, deny, markPaid, saving } = useChangeOrderActions(projectId);

  const [showApproval, setShowApproval] = useState(false);
  const [showDenial, setShowDenial] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [denialReason, setDenialReason] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  const handleApprove = async () => {
    await approve(coId, approvalNotes);
    setShowApproval(false);
    setApprovalNotes('');
    refetch();
    onUpdated?.();
  };

  const handleDeny = async () => {
    if (!denialReason) return;
    await deny(coId, denialReason);
    setShowDenial(false);
    setDenialReason('');
    refetch();
    onUpdated?.();
  };

  const handleMarkPaid = async () => {
    await markPaid(coId, co.amount, paymentDate);
    setShowPayment(false);
    refetch();
    onUpdated?.();
  };

  if (loading || !co) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[650px]">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F855A]" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const statusConfig = getStatusConfig(co.status);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle>{formatCONumber(co.co_number)}: {co.title}</DialogTitle>
            <Badge variant="outline" className={cn("text-xs", statusConfig.color)}>
              {statusConfig.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Amount Card */}
          <div className={cn(
            "rounded-lg p-4 border text-center",
            co.amount >= 0 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
          )}>
            <p className="text-xs text-gray-600 mb-1">
              {co.amount >= 0 ? 'Cost Increase' : 'Credit/Deduction'}
            </p>
            <p className={cn(
              "text-2xl font-bold",
              co.amount >= 0 ? "text-red-700" : "text-green-700"
            )}>
              {co.amount >= 0 ? '+' : '-'}{formatCurrency(co.amount)}
            </p>
            {co.status === 'approved' && (
              <p className="text-xs mt-2">
                <span className={cn("font-medium", co.is_paid ? "text-green-600" : "text-orange-600")}>
                  {co.is_paid ? `Paid on ${formatDate(co.paid_date)}` : 'Unpaid - Expense Created'}
                </span>
              </p>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Contractor</p>
                  <p className="text-sm font-medium text-gray-800">{co.contractor_name}</p>
                  {co.contractor_reference && (
                    <p className="text-xs text-gray-400">Ref: {co.contractor_reference}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ClipboardList className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Reason</p>
                  <p className="text-sm font-medium text-gray-800">{getReasonLabel(co.reason)}</p>
                </div>
              </div>
              {co.budget_line_item_name && (
                <div className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Budget Line Item</p>
                    <p className="text-sm font-medium text-gray-800">{co.budget_line_item_name}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Submitted</p>
                  <p className="text-sm font-medium text-gray-800">{formatDate(co.submitted_date)}</p>
                </div>
              </div>
              {co.approval_deadline && (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Approval Deadline</p>
                    <p className="text-sm font-medium text-gray-800">{formatDate(co.approval_deadline)}</p>
                  </div>
                </div>
              )}
              {co.approved_date && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">
                      {co.status === 'approved' ? 'Approved' : 'Reviewed'}
                    </p>
                    <p className="text-sm font-medium text-gray-800">{formatDate(co.approved_date)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-medium text-gray-600 mb-2">Description</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{co.description}</p>
          </div>

          {/* Approval/Denial Notes */}
          {co.approval_notes && (
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-xs font-medium text-green-700 mb-1">Approval Notes</p>
              <p className="text-sm text-green-800">{co.approval_notes}</p>
            </div>
          )}

          {co.denial_reason && (
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <p className="text-xs font-medium text-red-700 mb-1">Denial Reason</p>
              <p className="text-sm text-red-800">{co.denial_reason}</p>
            </div>
          )}

          {/* Documents */}
          {documents.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Documents ({documents.length})</h4>
              <div className="space-y-2">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate">{doc.file_name}</p>
                      <p className="text-xs text-gray-500 capitalize">{doc.document_type?.replace('_', ' ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {co.notes && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Notes</p>
              <p className="text-sm text-gray-700">{co.notes}</p>
            </div>
          )}

          {/* Inline Approval Form */}
          {showApproval && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <Label className="text-sm text-green-700">Approval Notes (optional)</Label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-green-300 rounded-lg text-sm resize-none"
                rows={2}
                placeholder="Reason for approval..."
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="ghost" size="sm" onClick={() => setShowApproval(false)}>Cancel</Button>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleApprove} disabled={saving}>
                  {saving ? 'Approving...' : 'Confirm Approval'}
                </Button>
              </div>
            </div>
          )}

          {/* Inline Denial Form */}
          {showDenial && (
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <Label className="text-sm text-red-700">Denial Reason *</Label>
              <textarea
                value={denialReason}
                onChange={(e) => setDenialReason(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-red-300 rounded-lg text-sm resize-none"
                rows={2}
                placeholder="Reason for denial..."
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="ghost" size="sm" onClick={() => setShowDenial(false)}>Cancel</Button>
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDeny} disabled={saving || !denialReason}>
                  {saving ? 'Denying...' : 'Confirm Denial'}
                </Button>
              </div>
            </div>
          )}

          {/* Inline Payment Form */}
          {showPayment && (
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <Label className="text-sm text-purple-700">Payment Date</Label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="mt-1 w-48"
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="ghost" size="sm" onClick={() => setShowPayment(false)}>Cancel</Button>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleMarkPaid} disabled={saving}>
                  {saving ? 'Processing...' : `Mark Paid (${co.amount >= 0 ? '+' : '-'}${formatCurrency(co.amount)})`}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Button variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-1" /> Print
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>Close</Button>

            {co.status === 'pending' && !showApproval && !showDenial && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => { setShowDenial(true); setShowApproval(false); }}
                >
                  <XCircle className="w-4 h-4 mr-1" /> Deny
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => { setShowApproval(true); setShowDenial(false); }}
                >
                  <CheckCircle className="w-4 h-4 mr-1" /> Approve
                </Button>
              </>
            )}

            {co.status === 'approved' && !co.is_paid && !showPayment && (
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => setShowPayment(true)}
              >
                <DollarSign className="w-4 h-4 mr-1" /> Mark Paid
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeOrderDetail;
