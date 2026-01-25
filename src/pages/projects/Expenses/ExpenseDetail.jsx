// src/pages/projects/Expenses/ExpenseDetail.jsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DollarSign, CheckCircle2, XCircle, CreditCard, FileText,
  Calendar, Building2, AlertCircle,
} from 'lucide-react';
import { getExpenseTypeLabel, getStatusConfig, PAYMENT_METHODS } from '@/services/projectExpenseService';
import { useExpenseActions } from '@/hooks/useProjectExpenses';

export default function ExpenseDetail({ open, expense, onClose, onUpdated }) {
  const { approve, deny, markPaid, saving } = useExpenseActions(expense?.project_id);
  const [showPayment, setShowPayment] = useState(false);
  const [showDeny, setShowDeny] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('ach');
  const [paymentRef, setPaymentRef] = useState('');
  const [denyReason, setDenyReason] = useState('');

  if (!expense) return null;

  const statusConfig = getStatusConfig(expense.status);
  const isOverdue = expense.due_date && expense.status !== 'paid' && new Date(expense.due_date) < new Date();
  const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v || 0);

  const handleApprove = async () => {
    await approve(expense.id, 'Approved.');
    onUpdated();
    onClose();
  };

  const handleDeny = async () => {
    await deny(expense.id, denyReason || 'Denied.');
    onUpdated();
    onClose();
  };

  const handleMarkPaid = async () => {
    await markPaid(expense.id, paymentMethod, paymentRef, new Date().toISOString().split('T')[0]);
    onUpdated();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Expense Detail
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Status & Amount */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={`text-sm px-3 py-1 ${statusConfig.color}`}>
              {statusConfig.label}
            </Badge>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{fmt(expense.total_amount)}</div>
              {expense.tax_amount > 0 && (
                <div className="text-xs text-gray-500">
                  {fmt(expense.amount)} + {fmt(expense.tax_amount)} tax
                </div>
              )}
            </div>
          </div>

          {isOverdue && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Payment overdue</span> — Due {expense.due_date}
            </div>
          )}

          {/* Description */}
          <div>
            <div className="text-lg font-semibold text-gray-900">{expense.description}</div>
            {expense.source_type === 'change_order' && (
              <div className="text-xs text-blue-600 mt-1">From Change Order</div>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500 text-xs uppercase mb-1">Vendor</div>
              <div className="flex items-center gap-1 font-medium">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                {expense.vendor_name || '—'}
              </div>
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase mb-1">Invoice</div>
              <div className="font-medium">{expense.invoice_number || '—'}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase mb-1">Type</div>
              <div className="font-medium">{getExpenseTypeLabel(expense.expense_type)}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase mb-1">Expense Date</div>
              <div className="flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {expense.expense_date}
              </div>
            </div>
            {expense.due_date && (
              <div>
                <div className="text-gray-500 text-xs uppercase mb-1">Due Date</div>
                <div className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                  {expense.due_date}
                </div>
              </div>
            )}
            {expense.paid_date && (
              <div>
                <div className="text-gray-500 text-xs uppercase mb-1">Paid Date</div>
                <div className="font-medium text-green-700">{expense.paid_date}</div>
              </div>
            )}
          </div>

          {/* Payment Info */}
          {expense.status === 'paid' && expense.payment_method && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="text-xs text-green-700 font-medium uppercase mb-1">Payment Info</div>
              <div className="flex justify-between text-sm">
                <span className="text-green-800">
                  {PAYMENT_METHODS.find(m => m.value === expense.payment_method)?.label || expense.payment_method}
                </span>
                {expense.payment_reference && (
                  <span className="text-green-700 font-mono text-xs">{expense.payment_reference}</span>
                )}
              </div>
            </div>
          )}

          {/* Approval Info */}
          {expense.approved_at && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="text-xs text-blue-700 font-medium uppercase mb-1">Approved</div>
              <div className="text-sm text-blue-800">
                {new Date(expense.approved_at).toLocaleDateString()}
              </div>
              {expense.approval_notes && (
                <div className="text-sm text-blue-600 mt-1">{expense.approval_notes}</div>
              )}
            </div>
          )}

          {/* Denial Info */}
          {expense.status === 'denied' && expense.denial_reason && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="text-xs text-red-700 font-medium uppercase mb-1">Denial Reason</div>
              <div className="text-sm text-red-800">{expense.denial_reason}</div>
            </div>
          )}

          {/* Notes */}
          {expense.notes && (
            <div>
              <div className="text-gray-500 text-xs uppercase mb-1">Notes</div>
              <div className="text-sm text-gray-700 bg-gray-50 rounded p-2">{expense.notes}</div>
            </div>
          )}

          {/* Deny Form */}
          {showDeny && (
            <div className="border rounded-md p-3 space-y-2">
              <Label>Denial Reason</Label>
              <textarea
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm resize-none"
                rows={2}
                placeholder="Reason for denial..."
              />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowDeny(false)}>Cancel</Button>
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleDeny}
                  disabled={saving}
                >
                  Confirm Deny
                </Button>
              </div>
            </div>
          )}

          {/* Payment Form */}
          {showPayment && (
            <div className="border rounded-md p-3 space-y-3">
              <Label>Payment Method</Label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                {PAYMENT_METHODS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <div>
                <Label>Reference Number</Label>
                <Input
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="Check #, ACH ref, etc."
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowPayment(false)}>Cancel</Button>
                <Button
                  size="sm"
                  className="bg-[#2F855A] hover:bg-[#276749]"
                  onClick={handleMarkPaid}
                  disabled={saving}
                >
                  <CreditCard className="w-3.5 h-3.5 mr-1" /> Record Payment
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!showDeny && !showPayment && (
            <div className="flex gap-2 pt-2 border-t">
              {expense.status === 'waiting_approval' && (
                <>
                  <Button
                    className="bg-[#2F855A] hover:bg-[#276749]"
                    onClick={handleApprove}
                    disabled={saving}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-700 border-red-300 hover:bg-red-50"
                    onClick={() => setShowDeny(true)}
                  >
                    <XCircle className="w-4 h-4 mr-1" /> Deny
                  </Button>
                </>
              )}
              {expense.status === 'approved' && (
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setShowPayment(true)}
                >
                  <CreditCard className="w-4 h-4 mr-1" /> Mark as Paid
                </Button>
              )}
              <Button variant="outline" onClick={onClose} className="ml-auto">
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
