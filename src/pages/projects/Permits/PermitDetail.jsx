// src/pages/projects/Permits/PermitDetail.jsx
// Detail view of a single permit with inspections timeline

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Shield, Calendar, Building2, DollarSign, ClipboardCheck,
  Plus, CheckCircle2, XCircle, AlertCircle, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermitDetail, usePermitActions } from '@/hooks/usePermits';
import { getPermitTypeLabel, getStatusConfig, getInspectionResultConfig } from '@/services/permitService';

const formatCurrency = (amount) => {
  if (!amount) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const InspectionIcon = ({ result }) => {
  if (result === 'passed') return <CheckCircle2 className="w-4 h-4 text-green-600" />;
  if (result === 'failed') return <XCircle className="w-4 h-4 text-red-600" />;
  if (result === 'partial') return <AlertCircle className="w-4 h-4 text-amber-600" />;
  return <Clock className="w-4 h-4 text-gray-400" />;
};

const PermitDetail = ({ open, permitId, projectId, onUpdated, onClose }) => {
  const { permit, inspections, loading, refetch } = usePermitDetail(permitId);
  const { scheduleInspection, recordInspectionResult, saving } = usePermitActions(projectId);

  const [showAddInspection, setShowAddInspection] = useState(false);
  const [newInspection, setNewInspection] = useState({
    inspection_type: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    inspector_name: '',
  });

  const handleAddInspection = async () => {
    if (!newInspection.inspection_type) return;
    await scheduleInspection(permitId, newInspection);
    setShowAddInspection(false);
    setNewInspection({ inspection_type: '', scheduled_date: new Date().toISOString().split('T')[0], inspector_name: '' });
    refetch();
    onUpdated?.();
  };

  if (loading || !permit) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F855A]" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const statusConfig = getStatusConfig(permit.status);
  const isExpiringSoon = permit.expiration_date && permit.status === 'issued' &&
    new Date(permit.expiration_date) <= new Date(Date.now() + 30 * 86400000) &&
    new Date(permit.expiration_date) > new Date();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#2F855A]" />
              {getPermitTypeLabel(permit.permit_type)}
            </DialogTitle>
            <Badge variant="outline" className={cn("text-xs", statusConfig.color)}>
              {statusConfig.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Permit Number & Authority */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Permit Number</p>
                <p className="text-sm font-mono font-medium text-gray-800">
                  {permit.permit_number || <span className="italic text-gray-400">Not yet assigned</span>}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Issuing Authority</p>
                <p className="text-sm font-medium text-gray-800">{permit.issuing_authority}</p>
                <p className="text-xs text-gray-400 capitalize">{permit.jurisdiction} jurisdiction</p>
              </div>
            </div>
          </div>

          {/* Expiring Warning */}
          {isExpiringSoon && (
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <div className="text-xs text-red-800">
                <p className="font-medium">Permit Expiring Soon</p>
                <p className="mt-0.5">This permit expires on {formatDate(permit.expiration_date)}. Consider applying for renewal.</p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-3">Permit Timeline</p>
            <div className="grid grid-cols-5 gap-2">
              {[
                { label: 'Applied', date: permit.application_date, active: !!permit.application_date },
                { label: 'Submitted', date: permit.submitted_date, active: !!permit.submitted_date },
                { label: 'Approved', date: permit.approved_date, active: !!permit.approved_date },
                { label: 'Issued', date: permit.issued_date, active: !!permit.issued_date },
                { label: 'Expires', date: permit.expiration_date, active: !!permit.expiration_date, warn: isExpiringSoon },
              ].map((step, idx) => (
                <div key={idx} className="text-center">
                  <div className={cn(
                    "w-6 h-6 mx-auto rounded-full flex items-center justify-center text-xs font-medium mb-1",
                    step.active ? (step.warn ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700") : "bg-gray-100 text-gray-400"
                  )}>
                    {idx + 1}
                  </div>
                  <p className={cn("text-xs", step.active ? "text-gray-700 font-medium" : "text-gray-400")}>{step.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{step.date ? formatDate(step.date) : '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Fees */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <p className="text-xs font-medium text-gray-600">Fee Breakdown</p>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Application Fee</span>
                <span className="text-gray-800">{formatCurrency(permit.application_fee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Permit Fee</span>
                <span className="text-gray-800">{formatCurrency(permit.permit_fee)}</span>
              </div>
              {permit.impact_fees > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Impact Fees</span>
                  <span className="text-gray-800">{formatCurrency(permit.impact_fees)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="font-medium text-gray-700">Total</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{formatCurrency(permit.total_fees)}</span>
                  <Badge variant="outline" className={cn("text-xs",
                    permit.fees_paid ? "bg-green-50 text-green-700 border-green-300" : "bg-amber-50 text-amber-700 border-amber-300"
                  )}>
                    {permit.fees_paid ? 'Paid' : 'Unpaid'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Inspections */}
          {permit.requires_inspections && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                <p className="text-xs font-medium text-gray-600">
                  Inspections ({inspections.length})
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddInspection(!showAddInspection)}
                  className="h-6 text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
              </div>

              {showAddInspection && (
                <div className="p-3 bg-blue-50 border-b border-blue-200">
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Type (e.g. Framing)"
                      value={newInspection.inspection_type}
                      onChange={(e) => setNewInspection(prev => ({ ...prev, inspection_type: e.target.value }))}
                      className="h-8 text-xs"
                    />
                    <Input
                      type="date"
                      value={newInspection.scheduled_date}
                      onChange={(e) => setNewInspection(prev => ({ ...prev, scheduled_date: e.target.value }))}
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder="Inspector name"
                      value={newInspection.inspector_name}
                      onChange={(e) => setNewInspection(prev => ({ ...prev, inspector_name: e.target.value }))}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setShowAddInspection(false)}>Cancel</Button>
                    <Button size="sm" className="h-6 text-xs bg-[#2F855A] hover:bg-[#276749]" onClick={handleAddInspection} disabled={saving || !newInspection.inspection_type}>
                      Schedule
                    </Button>
                  </div>
                </div>
              )}

              {inspections.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {inspections.map(insp => {
                    const resultConfig = getInspectionResultConfig(insp.result);
                    return (
                      <div key={insp.id} className="p-3 flex items-start gap-3">
                        <InspectionIcon result={insp.result} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-800">{insp.inspection_type}</p>
                            {insp.result && (
                              <Badge variant="outline" className={cn("text-xs", resultConfig.color)}>
                                {resultConfig.label}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                            <span>Scheduled: {formatDate(insp.scheduled_date)}</span>
                            {insp.actual_date && <span>Actual: {formatDate(insp.actual_date)}</span>}
                            {insp.inspector_name && <span>Inspector: {insp.inspector_name}</span>}
                          </div>
                          {insp.notes && (
                            <p className="text-xs text-gray-600 mt-1">{insp.notes}</p>
                          )}
                          {insp.correction_required && (
                            <div className="mt-1 p-2 bg-red-50 rounded border border-red-200">
                              <p className="text-xs text-red-700"><span className="font-medium">Correction Required:</span> {insp.correction_required}</p>
                              {insp.reinspection_date && (
                                <p className="text-xs text-red-600 mt-0.5">Re-inspection: {formatDate(insp.reinspection_date)}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-gray-400">
                  No inspections scheduled yet.
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {permit.notes && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-2">Notes</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{permit.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-4 border-t border-gray-200">
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PermitDetail;
