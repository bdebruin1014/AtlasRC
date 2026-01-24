// src/pages/projects/Loans/LoanForm.jsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LOAN_TYPES, LOAN_POSITIONS, RATE_TYPES, INDEX_RATES } from '@/services/loanService';
import { useLoanActions } from '@/hooks/useLoans';

export default function LoanForm({ open, projectId, loan, onClose, onSaved }) {
  const { create, update, saving } = useLoanActions(projectId);
  const isEdit = !!loan;

  const [form, setForm] = useState({
    name: loan?.name || '',
    loan_type: loan?.loan_type || 'construction',
    position: loan?.position || 'first',
    lender_name: loan?.lender_name || '',
    loan_officer: loan?.loan_officer || '',
    commitment_amount: loan?.commitment_amount?.toString() || '',
    interest_rate: loan?.interest_rate ? (loan.interest_rate * 100).toString() : '',
    rate_type: loan?.rate_type || 'fixed',
    index_rate: loan?.index_rate || 'sofr',
    spread: loan?.spread ? (loan.spread * 100).toString() : '',
    floor_rate: loan?.floor_rate ? (loan.floor_rate * 100).toString() : '',
    term_months: loan?.term_months?.toString() || '24',
    amortization_months: loan?.amortization_months?.toString() || '',
    io_period_months: loan?.io_period_months?.toString() || '0',
    effective_date: loan?.effective_date || '',
    maturity_date: loan?.maturity_date || '',
    origination_fee_percent: loan?.origination_fee_percent ? (loan.origination_fee_percent * 100).toString() : '1',
    exit_fee_percent: loan?.exit_fee_percent ? (loan.exit_fee_percent * 100).toString() : '',
    interest_reserve: loan?.interest_reserve?.toString() || '0',
    max_ltc: loan?.max_ltc ? (loan.max_ltc * 100).toString() : '',
    max_ltv: loan?.max_ltv ? (loan.max_ltv * 100).toString() : '',
    notes: loan?.notes || '',
  });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      commitment_amount: parseFloat(form.commitment_amount) || 0,
      interest_rate: (parseFloat(form.interest_rate) || 0) / 100,
      spread: form.rate_type === 'floating' ? (parseFloat(form.spread) || 0) / 100 : null,
      floor_rate: form.rate_type === 'floating' ? (parseFloat(form.floor_rate) || 0) / 100 : null,
      index_rate: form.rate_type === 'floating' ? form.index_rate : null,
      term_months: parseInt(form.term_months) || 24,
      amortization_months: form.amortization_months ? parseInt(form.amortization_months) : null,
      io_period_months: parseInt(form.io_period_months) || 0,
      origination_fee_percent: (parseFloat(form.origination_fee_percent) || 0) / 100,
      exit_fee_percent: form.exit_fee_percent ? (parseFloat(form.exit_fee_percent) || 0) / 100 : null,
      interest_reserve: parseFloat(form.interest_reserve) || 0,
      max_ltc: form.max_ltc ? (parseFloat(form.max_ltc) || 0) / 100 : null,
      max_ltv: form.max_ltv ? (parseFloat(form.max_ltv) || 0) / 100 : null,
    };
    try {
      if (isEdit) {
        await update(loan.id, data);
      } else {
        await create(data);
      }
      onSaved();
    } catch (err) {
      console.error('Error saving loan:', err);
    }
  };

  const origFeeAmount = ((parseFloat(form.commitment_amount) || 0) * (parseFloat(form.origination_fee_percent) || 0) / 100);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Loan' : 'New Loan'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Info */}
          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-700 uppercase">Loan Details</div>
            <div>
              <Label>Loan Name *</Label>
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="e.g., Senior Construction Loan" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Loan Type</Label>
                <select value={form.loan_type} onChange={(e) => set('loan_type', e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm">
                  {LOAN_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <Label>Position</Label>
                <select value={form.position} onChange={(e) => set('position', e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm">
                  {LOAN_POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Lender */}
          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-700 uppercase">Lender</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Lender Name</Label>
                <Input value={form.lender_name} onChange={(e) => set('lender_name', e.target.value)} placeholder="Bank name" />
              </div>
              <div>
                <Label>Loan Officer</Label>
                <Input value={form.loan_officer} onChange={(e) => set('loan_officer', e.target.value)} placeholder="Contact name" />
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-700 uppercase">Terms</div>
            <div>
              <Label>Commitment Amount *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <Input type="number" step="0.01" value={form.commitment_amount} onChange={(e) => set('commitment_amount', e.target.value)} className="pl-7" required />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Rate Type</Label>
                <select value={form.rate_type} onChange={(e) => set('rate_type', e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm">
                  {RATE_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <Label>Interest Rate (%) *</Label>
                <Input type="number" step="0.01" value={form.interest_rate} onChange={(e) => set('interest_rate', e.target.value)} placeholder="8.50" required />
              </div>
              {form.rate_type === 'floating' && (
                <div>
                  <Label>Index</Label>
                  <select value={form.index_rate} onChange={(e) => set('index_rate', e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm">
                    {INDEX_RATES.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                  </select>
                </div>
              )}
            </div>
            {form.rate_type === 'floating' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Spread (%)</Label>
                  <Input type="number" step="0.01" value={form.spread} onChange={(e) => set('spread', e.target.value)} placeholder="3.50" />
                </div>
                <div>
                  <Label>Floor Rate (%)</Label>
                  <Input type="number" step="0.01" value={form.floor_rate} onChange={(e) => set('floor_rate', e.target.value)} placeholder="6.50" />
                </div>
              </div>
            )}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Term (months)</Label>
                <Input type="number" value={form.term_months} onChange={(e) => set('term_months', e.target.value)} />
              </div>
              <div>
                <Label>Amortization (months)</Label>
                <Input type="number" value={form.amortization_months} onChange={(e) => set('amortization_months', e.target.value)} placeholder="I/O if blank" />
              </div>
              <div>
                <Label>I/O Period (months)</Label>
                <Input type="number" value={form.io_period_months} onChange={(e) => set('io_period_months', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-700 uppercase">Dates</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Effective Date</Label>
                <Input type="date" value={form.effective_date} onChange={(e) => set('effective_date', e.target.value)} />
              </div>
              <div>
                <Label>Maturity Date</Label>
                <Input type="date" value={form.maturity_date} onChange={(e) => set('maturity_date', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Fees */}
          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-700 uppercase">Fees & Reserves</div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Origination Fee (%)</Label>
                <Input type="number" step="0.01" value={form.origination_fee_percent} onChange={(e) => set('origination_fee_percent', e.target.value)} />
                <div className="text-xs text-gray-500 mt-1">{origFeeAmount > 0 ? `= $${origFeeAmount.toLocaleString()}` : ''}</div>
              </div>
              <div>
                <Label>Exit Fee (%)</Label>
                <Input type="number" step="0.01" value={form.exit_fee_percent} onChange={(e) => set('exit_fee_percent', e.target.value)} placeholder="0" />
              </div>
              <div>
                <Label>Interest Reserve</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <Input type="number" step="0.01" value={form.interest_reserve} onChange={(e) => set('interest_reserve', e.target.value)} className="pl-7" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Max LTC (%)</Label>
                <Input type="number" step="0.1" value={form.max_ltc} onChange={(e) => set('max_ltc', e.target.value)} placeholder="75" />
              </div>
              <div>
                <Label>Max LTV (%)</Label>
                <Input type="number" step="0.1" value={form.max_ltv} onChange={(e) => set('max_ltv', e.target.value)} placeholder="70" />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm resize-none" rows={3} placeholder="Loan notes..." />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-[#2F855A] hover:bg-[#276749]" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Update Loan' : 'Create Loan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
