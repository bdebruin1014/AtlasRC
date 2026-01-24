// src/pages/projects/Permits/PermitForm.jsx
// Modal form for creating/editing permits

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';
import { usePermitActions } from '@/hooks/usePermits';
import { PERMIT_TYPES, JURISDICTIONS } from '@/services/permitService';

const PermitForm = ({ open, projectId, permit, onCreated, onClose }) => {
  const { create, update, saving } = usePermitActions(projectId);
  const isEdit = !!permit;

  const [form, setForm] = useState({
    permit_type: permit?.permit_type || '',
    permit_number: permit?.permit_number || '',
    issuing_authority: permit?.issuing_authority || '',
    jurisdiction: permit?.jurisdiction || 'city',
    application_date: permit?.application_date || '',
    submitted_date: permit?.submitted_date || '',
    approved_date: permit?.approved_date || '',
    issued_date: permit?.issued_date || '',
    expiration_date: permit?.expiration_date || '',
    status: permit?.status || 'not_applied',
    application_fee: permit?.application_fee || '',
    permit_fee: permit?.permit_fee || '',
    impact_fees: permit?.impact_fees || '',
    fees_paid: permit?.fees_paid || false,
    requires_inspections: permit?.requires_inspections ?? true,
    notes: permit?.notes || '',
  });

  const totalFees = (parseFloat(form.application_fee) || 0) +
                    (parseFloat(form.permit_fee) || 0) +
                    (parseFloat(form.impact_fees) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.permit_type || !form.issuing_authority) return;

    const data = {
      ...form,
      application_fee: parseFloat(form.application_fee) || 0,
      permit_fee: parseFloat(form.permit_fee) || 0,
      impact_fees: parseFloat(form.impact_fees) || 0,
      total_fees: totalFees,
    };

    if (isEdit) {
      await update(permit.id, data);
    } else {
      await create(data);
    }
    onCreated?.();
  };

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#2F855A]" />
            {isEdit ? 'Edit Permit' : 'New Permit'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 py-4">
            {/* Permit Type & Jurisdiction */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="permit-type">Permit Type *</Label>
                <select
                  id="permit-type"
                  value={form.permit_type}
                  onChange={(e) => set('permit_type', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  required
                >
                  <option value="">Select type...</option>
                  {PERMIT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="jurisdiction">Jurisdiction</Label>
                <select
                  id="jurisdiction"
                  value={form.jurisdiction}
                  onChange={(e) => set('jurisdiction', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {JURISDICTIONS.map(j => (
                    <option key={j.value} value={j.value}>{j.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Authority & Permit Number */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="authority">Issuing Authority *</Label>
                <Input
                  id="authority"
                  value={form.issuing_authority}
                  onChange={(e) => set('issuing_authority', e.target.value)}
                  placeholder="City of Austin, Travis County..."
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="permit-number">Permit Number</Label>
                <Input
                  id="permit-number"
                  value={form.permit_number}
                  onChange={(e) => set('permit_number', e.target.value)}
                  placeholder="BLD-2025-XXXXX"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Dates */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Key Dates</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="app-date" className="text-xs">Application Date</Label>
                  <Input
                    id="app-date"
                    type="date"
                    value={form.application_date}
                    onChange={(e) => set('application_date', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="submitted-date" className="text-xs">Submitted Date</Label>
                  <Input
                    id="submitted-date"
                    type="date"
                    value={form.submitted_date}
                    onChange={(e) => set('submitted_date', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="approved-date" className="text-xs">Approved Date</Label>
                  <Input
                    id="approved-date"
                    type="date"
                    value={form.approved_date}
                    onChange={(e) => set('approved_date', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="issued-date" className="text-xs">Issued Date</Label>
                  <Input
                    id="issued-date"
                    type="date"
                    value={form.issued_date}
                    onChange={(e) => set('issued_date', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="exp-date" className="text-xs">Expiration Date</Label>
                  <Input
                    id="exp-date"
                    type="date"
                    value={form.expiration_date}
                    onChange={(e) => set('expiration_date', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="status" className="text-xs">Status</Label>
                  <select
                    id="status"
                    value={form.status}
                    onChange={(e) => set('status', e.target.value)}
                    className="mt-1 w-full px-2 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="not_applied">Not Applied</option>
                    <option value="applied">Applied</option>
                    <option value="under_review">Under Review</option>
                    <option value="revisions_required">Revisions Required</option>
                    <option value="approved">Approved</option>
                    <option value="issued">Issued</option>
                    <option value="expired">Expired</option>
                    <option value="denied">Denied</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Fees */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Fees</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="app-fee" className="text-xs">Application Fee</Label>
                  <Input
                    id="app-fee"
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.application_fee}
                    onChange={(e) => set('application_fee', e.target.value)}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="permit-fee" className="text-xs">Permit Fee</Label>
                  <Input
                    id="permit-fee"
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.permit_fee}
                    onChange={(e) => set('permit_fee', e.target.value)}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="impact-fees" className="text-xs">Impact Fees</Label>
                  <Input
                    id="impact-fees"
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.impact_fees}
                    onChange={(e) => set('impact_fees', e.target.value)}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Total Fees:</span>
                  <span className="text-sm font-bold text-gray-900">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalFees)}
                  </span>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.fees_paid}
                    onChange={(e) => set('fees_paid', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-gray-600">Fees Paid</span>
                </label>
              </div>
            </div>

            {/* Inspections */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.requires_inspections}
                  onChange={(e) => set('requires_inspections', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-gray-700">Requires Inspections</span>
              </label>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="permit-notes">Notes</Label>
              <textarea
                id="permit-notes"
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-[#2F855A] focus:border-transparent"
                rows={3}
                placeholder="Permit notes, conditions, or special requirements..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              className="bg-[#2F855A] hover:bg-[#276749]"
              disabled={saving || !form.permit_type || !form.issuing_authority}
            >
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Permit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PermitForm;
