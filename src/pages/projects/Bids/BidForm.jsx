// src/pages/projects/Bids/BidForm.jsx
// Modal form for creating/editing bids

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Upload, Trash2 } from 'lucide-react';
import { useBidActions } from '@/hooks/useBids';
import { BID_TYPES, SCOPE_CATEGORIES, BID_DOCUMENT_TYPES } from '@/services/bidService';

const BidForm = ({ open, projectId, bid, onCreated, onClose }) => {
  const { create, update, saving } = useBidActions(projectId);
  const isEdit = !!bid;

  const [form, setForm] = useState({
    bid_type: bid?.bid_type || 'subcontractor',
    scope_category: bid?.scope_category || '',
    bidder_name: bid?.bidder_name || '',
    bidder_contact_name: bid?.bidder_contact_name || '',
    bid_amount: bid?.bid_amount || '',
    alternate_amount: bid?.alternate_amount || '',
    scope_description: bid?.scope_description || '',
    inclusions: bid?.inclusions || '',
    exclusions: bid?.exclusions || '',
    qualifications: bid?.qualifications || '',
    received_date: bid?.received_date || new Date().toISOString().split('T')[0],
    valid_until: bid?.valid_until || '',
    notes: bid?.notes || '',
  });

  const [documents, setDocuments] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.scope_category || !form.bidder_name || !form.bid_amount) return;

    const data = {
      ...form,
      bid_amount: parseFloat(form.bid_amount),
      alternate_amount: form.alternate_amount ? parseFloat(form.alternate_amount) : null,
    };

    if (isEdit) {
      await update(bid.id, data);
    } else {
      await create(data);
    }
    onCreated?.();
  };

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const addDocument = () => {
    setDocuments(prev => [...prev, { id: `doc-${Date.now()}`, document_type: 'proposal', file_name: '' }]);
  };

  const removeDocument = (idx) => {
    setDocuments(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Bid' : 'New Bid'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 py-4">
            {/* Bid Type & Scope */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bid-type">Bid Type *</Label>
                <select
                  id="bid-type"
                  value={form.bid_type}
                  onChange={(e) => set('bid_type', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {BID_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="scope">Scope Category *</Label>
                <select
                  id="scope"
                  value={form.scope_category}
                  onChange={(e) => set('scope_category', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  required
                >
                  <option value="">Select scope...</option>
                  {SCOPE_CATEGORIES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bidder Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bidder-name">Company Name *</Label>
                <Input
                  id="bidder-name"
                  value={form.bidder_name}
                  onChange={(e) => set('bidder_name', e.target.value)}
                  placeholder="Company name..."
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact-name">Contact Person</Label>
                <Input
                  id="contact-name"
                  value={form.bidder_contact_name}
                  onChange={(e) => set('bidder_contact_name', e.target.value)}
                  placeholder="Contact name..."
                  className="mt-1"
                />
              </div>
            </div>

            {/* Amounts */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bid-amount">Bid Amount *</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="bid-amount"
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.bid_amount}
                    onChange={(e) => set('bid_amount', e.target.value)}
                    className="pl-7"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="alt-amount">Alternate Amount</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="alt-amount"
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.alternate_amount}
                    onChange={(e) => set('alternate_amount', e.target.value)}
                    className="pl-7"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="received-date">Received Date *</Label>
                <Input
                  id="received-date"
                  type="date"
                  value={form.received_date}
                  onChange={(e) => set('received_date', e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="valid-until">Valid Until</Label>
                <Input
                  id="valid-until"
                  type="date"
                  value={form.valid_until}
                  onChange={(e) => set('valid_until', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Scope Description */}
            <div>
              <Label htmlFor="scope-desc">Scope Description</Label>
              <textarea
                id="scope-desc"
                value={form.scope_description}
                onChange={(e) => set('scope_description', e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-[#2F855A] focus:border-transparent"
                rows={2}
                placeholder="What work is included in this bid..."
              />
            </div>

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="inclusions">Inclusions</Label>
                <textarea
                  id="inclusions"
                  value={form.inclusions}
                  onChange={(e) => set('inclusions', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                  rows={3}
                  placeholder="What's included..."
                />
              </div>
              <div>
                <Label htmlFor="exclusions">Exclusions</Label>
                <textarea
                  id="exclusions"
                  value={form.exclusions}
                  onChange={(e) => set('exclusions', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                  rows={3}
                  placeholder="What's NOT included..."
                />
              </div>
            </div>

            {/* Qualifications */}
            <div>
              <Label htmlFor="qualifications">Qualifications</Label>
              <textarea
                id="qualifications"
                value={form.qualifications}
                onChange={(e) => set('qualifications', e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                rows={2}
                placeholder="Bidder qualifications, experience, certifications..."
              />
            </div>

            {/* Documents */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm">Documents</Label>
                <Button type="button" variant="ghost" size="sm" onClick={addDocument}>
                  <Upload className="w-3 h-3 mr-1" /> Attach
                </Button>
              </div>
              {documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc, idx) => (
                    <div key={doc.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <select
                        value={doc.document_type}
                        onChange={(e) => {
                          setDocuments(prev => prev.map((d, i) => i === idx ? { ...d, document_type: e.target.value } : d));
                        }}
                        className="text-xs border border-gray-200 rounded px-1.5 py-1"
                      >
                        {BID_DOCUMENT_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                      <Input
                        placeholder="File name..."
                        value={doc.file_name}
                        onChange={(e) => {
                          setDocuments(prev => prev.map((d, i) => i === idx ? { ...d, file_name: e.target.value } : d));
                        }}
                        className="flex-1 h-7 text-xs"
                      />
                      <button type="button" onClick={() => removeDocument(idx)} className="text-gray-400 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No documents attached. Add proposals, insurance certs, or references.</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="bid-notes">Notes</Label>
              <textarea
                id="bid-notes"
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-[#2F855A] focus:border-transparent"
                rows={2}
                placeholder="Additional notes..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              className="bg-[#2F855A] hover:bg-[#276749]"
              disabled={saving || !form.scope_category || !form.bidder_name || !form.bid_amount}
            >
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Submit Bid'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BidForm;
