// src/pages/projects/ChangeOrders/ApprovalModal.jsx
// Modal for approving or denying a change order with confirmation and notes

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChangeOrderActions } from '@/hooks/useChangeOrders';
import { formatCONumber, getReasonLabel } from '@/services/changeOrderService';

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.abs(amount));
};

const ApprovalModal = ({ open, action, changeOrder, projectId, onComplete, onClose }) => {
  const { approve, deny, saving } = useChangeOrderActions(projectId);
  const [notes, setNotes] = useState('');
  const [denialReason, setDenialReason] = useState('');

  const isApproval = action === 'approve';
  const co = changeOrder;

  const handleConfirm = async () => {
    if (isApproval) {
      await approve(co.id, notes);
    } else {
      if (!denialReason.trim()) return;
      await deny(co.id, denialReason);
    }
    setNotes('');
    setDenialReason('');
    onComplete?.();
  };

  const handleClose = () => {
    setNotes('');
    setDenialReason('');
    onClose?.();
  };

  if (!co) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isApproval ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            {isApproval ? 'Approve Change Order' : 'Deny Change Order'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* CO Summary */}
          <div className={cn(
            "rounded-lg p-4 border",
            isApproval ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
          )}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-800">
                {formatCONumber(co.co_number)}: {co.title}
              </span>
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-300">
                Pending
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>
                <span className="text-gray-500">Contractor:</span>{' '}
                <span className="font-medium">{co.contractor_name}</span>
              </div>
              <div>
                <span className="text-gray-500">Reason:</span>{' '}
                <span className="font-medium">{getReasonLabel(co.reason)}</span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className={cn(
                "text-lg font-bold",
                co.amount >= 0 ? "text-red-700" : "text-green-700"
              )}>
                {co.amount >= 0 ? '+' : '-'}{formatCurrency(co.amount)}
              </span>
              <span className="text-xs text-gray-500">
                ({co.amount >= 0 ? 'Cost Increase' : 'Credit/Deduction'})
              </span>
            </div>
          </div>

          {/* Impact Warning */}
          {isApproval && co.amount > 0 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-xs text-amber-800">
                <p className="font-medium">Budget Impact</p>
                <p className="mt-0.5">
                  Approving this change order will increase the committed budget by{' '}
                  <span className="font-semibold">{formatCurrency(co.amount)}</span>
                  {co.budget_line_item_name && (
                    <> on line item "<span className="font-medium">{co.budget_line_item_name}</span>"</>
                  )}.
                  An unpaid expense will be created for tracking.
                </p>
              </div>
            </div>
          )}

          {/* Approval Notes or Denial Reason */}
          {isApproval ? (
            <div>
              <Label className="text-sm text-gray-700">Approval Notes (optional)</Label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
                placeholder="Reason for approval, conditions, or additional notes..."
              />
            </div>
          ) : (
            <div>
              <Label className="text-sm text-gray-700">Denial Reason *</Label>
              <textarea
                value={denialReason}
                onChange={(e) => setDenialReason(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                placeholder="Provide the reason for denying this change order..."
              />
              {!denialReason.trim() && (
                <p className="text-xs text-red-500 mt-1">A denial reason is required.</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          {isApproval ? (
            <Button
              type="button"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleConfirm}
              disabled={saving}
            >
              {saving ? 'Approving...' : 'Confirm Approval'}
            </Button>
          ) : (
            <Button
              type="button"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleConfirm}
              disabled={saving || !denialReason.trim()}
            >
              {saving ? 'Denying...' : 'Confirm Denial'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalModal;
