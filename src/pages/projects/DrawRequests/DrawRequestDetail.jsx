// src/pages/projects/DrawRequests/DrawRequestDetail.jsx
// Detail view of a single draw request with line items, documents, and status actions

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, CheckCircle, XCircle, DollarSign, Printer, FileText, Calendar, User, ClipboardCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDrawRequestDetail, useDrawRequestActions } from '@/hooks/useDrawRequests';
import { getStatusConfig, DRAW_STATUSES } from '@/services/drawRequestService';

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const DrawRequestDetail = ({ open, drawId, projectId, onUpdated, onClose }) => {
  const { draw, items, documents, loading, refetch } = useDrawRequestDetail(drawId);
  const { submit, approve, deny, fund, saving } = useDrawRequestActions(projectId);
  const [showDenyReason, setShowDenyReason] = useState(false);
  const [denyReason, setDenyReason] = useState('');

  const handleSubmit = async () => {
    await submit(drawId);
    refetch();
    onUpdated?.();
  };

  const handleApprove = async () => {
    await approve(drawId, draw.requested_amount);
    refetch();
    onUpdated?.();
  };

  const handleDeny = async () => {
    if (!denyReason) return;
    await deny(drawId, denyReason);
    setShowDenyReason(false);
    setDenyReason('');
    refetch();
    onUpdated?.();
  };

  const handleFund = async () => {
    const amount = draw.approved_amount || draw.requested_amount;
    await fund(drawId, amount);
    refetch();
    onUpdated?.();
  };

  if (loading || !draw) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px]">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F855A]" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const statusConfig = getStatusConfig(draw.status);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle>Draw #{draw.draw_number}</DialogTitle>
            <Badge variant="outline" className={cn("text-xs capitalize", statusConfig.color)}>
              {statusConfig.label}
            </Badge>
          </div>
          {draw.period_start && draw.period_end && (
            <p className="text-sm text-gray-500">
              Period: {formatDate(draw.period_start)} — {formatDate(draw.period_end)}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Amount Cards */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Requested</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(draw.requested_amount)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Approved</p>
              <p className="text-lg font-bold text-gray-800">
                {draw.approved_amount ? formatCurrency(draw.approved_amount) : '—'}
              </p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-200">
              <p className="text-xs text-amber-700 mb-1">Retainage ({draw.retainage_percentage}%)</p>
              <p className="text-lg font-bold text-amber-700">{formatCurrency(draw.retainage_amount)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
              <p className="text-xs text-green-700 mb-1">Net Funded</p>
              <p className="text-lg font-bold text-green-700">
                {draw.net_amount ? formatCurrency(draw.net_amount) : '—'}
              </p>
            </div>
          </div>

          {/* Timeline Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Requested:</span>
                <span className="font-medium">{formatDate(draw.request_date)}</span>
              </div>
              {draw.submitted_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Send className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Submitted:</span>
                  <span className="font-medium">{formatDate(draw.submitted_date)}</span>
                </div>
              )}
              {draw.approved_date && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-500">Approved:</span>
                  <span className="font-medium">{formatDate(draw.approved_date)}</span>
                </div>
              )}
              {draw.funded_date && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-purple-500" />
                  <span className="text-gray-500">Funded:</span>
                  <span className="font-medium">{formatDate(draw.funded_date)}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {draw.lender_name && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Lender:</span>
                  <span className="font-medium">{draw.lender_name}</span>
                </div>
              )}
              {draw.inspector_name && (
                <div className="flex items-center gap-2 text-sm">
                  <ClipboardCheck className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Inspector:</span>
                  <span className="font-medium">{draw.inspector_name}</span>
                </div>
              )}
              {draw.inspection_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Inspection:</span>
                  <span className="font-medium">{formatDate(draw.inspection_date)}</span>
                </div>
              )}
            </div>
          </div>

          {draw.inspection_notes && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-1">Inspection Notes</p>
              <p className="text-sm text-gray-700">{draw.inspection_notes}</p>
            </div>
          )}

          {draw.denial_reason && (
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <p className="text-xs font-medium text-red-700 mb-1">Denial Reason</p>
              <p className="text-sm text-red-800">{draw.denial_reason}</p>
            </div>
          )}

          {/* Line Items */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Line Items ({items.length})</h4>
            {items.length > 0 ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">Cost Code</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">Description</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-500">Budget</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-500">Prev. Drawn</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-500">This Request</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-500">% Complete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-mono text-gray-600">{item.cost_code}</td>
                        <td className="px-3 py-2 text-gray-800">{item.description}</td>
                        <td className="px-3 py-2 text-right font-mono">{formatCurrency(item.budget_amount)}</td>
                        <td className="px-3 py-2 text-right font-mono text-gray-500">{formatCurrency(item.previously_drawn)}</td>
                        <td className="px-3 py-2 text-right font-mono font-medium text-[#2F855A]">{formatCurrency(item.current_request)}</td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <div className="w-10 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-[#2F855A] rounded-full" style={{ width: `${item.percent_complete || 0}%` }} />
                            </div>
                            <span className="text-gray-600 w-7 text-right">{item.percent_complete || 0}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-200 font-medium">
                    <tr>
                      <td className="px-3 py-2" colSpan={2}>Total</td>
                      <td className="px-3 py-2 text-right font-mono">{formatCurrency(items.reduce((s, i) => s + (i.budget_amount || 0), 0))}</td>
                      <td className="px-3 py-2 text-right font-mono">{formatCurrency(items.reduce((s, i) => s + (i.previously_drawn || 0), 0))}</td>
                      <td className="px-3 py-2 text-right font-mono text-[#2F855A]">{formatCurrency(items.reduce((s, i) => s + (i.current_request || 0), 0))}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No line items in this draw request.</p>
            )}
          </div>

          {/* Documents */}
          {documents.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Documents ({documents.length})</h4>
              <div className="space-y-2">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate">{doc.file_name}</p>
                      <p className="text-xs text-gray-500 capitalize">{doc.document_type?.replace('_', ' ')} &middot; {formatDate(doc.uploaded_at)}</p>
                    </div>
                    {doc.file_size && (
                      <span className="text-xs text-gray-400">{(doc.file_size / 1024).toFixed(0)} KB</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {draw.notes && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-1">Notes</p>
              <p className="text-sm text-gray-700">{draw.notes}</p>
            </div>
          )}

          {/* Deny Reason Input */}
          {showDenyReason && (
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <label className="text-sm font-medium text-red-700 block mb-2">Denial Reason *</label>
              <textarea
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-red-400"
                rows={2}
                placeholder="Explain why this draw is being denied..."
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="ghost" size="sm" onClick={() => { setShowDenyReason(false); setDenyReason(''); }}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleDeny}
                  disabled={!denyReason || saving}
                >
                  Confirm Denial
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

            {/* Status-specific actions */}
            {draw.status === 'draft' && (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
                onClick={handleSubmit}
                disabled={saving}
              >
                <Send className="w-4 h-4 mr-1" />
                {saving ? 'Submitting...' : 'Submit to Lender'}
              </Button>
            )}

            {(draw.status === 'requested' || draw.status === 'under_review') && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => setShowDenyReason(true)}
                  disabled={saving || showDenyReason}
                >
                  <XCircle className="w-4 h-4 mr-1" /> Deny
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                  onClick={handleApprove}
                  disabled={saving}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {saving ? 'Approving...' : 'Approve'}
                </Button>
              </>
            )}

            {draw.status === 'approved' && (
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="sm"
                onClick={handleFund}
                disabled={saving}
              >
                <DollarSign className="w-4 h-4 mr-1" />
                {saving ? 'Funding...' : 'Mark as Funded'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DrawRequestDetail;
