// src/pages/projects/ProForma/AddLoanModal.jsx
// Modal for adding loan/debt instruments to the pro forma capital stack

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const LOAN_TYPES = [
  { value: 'construction', label: 'Construction Loan' },
  { value: 'bridge', label: 'Bridge Loan' },
  { value: 'permanent', label: 'Permanent Loan' },
  { value: 'mezzanine', label: 'Mezzanine Debt' },
  { value: 'preferred_equity', label: 'Preferred Equity' },
  { value: 'seller_financing', label: 'Seller Financing' },
];

const LOAN_POSITIONS = [
  { value: 'first', label: '1st Position (Senior)' },
  { value: 'second', label: '2nd Position' },
  { value: 'third', label: '3rd Position' },
  { value: 'unsecured', label: 'Unsecured' },
];

const DEFAULT_FORM = {
  name: '',
  loan_type: 'construction',
  position: 'first',
  commitment_amount: '',
  ltc_percent: '',
  ltv_percent: '',
  rate_type: 'fixed',
  interest_rate: '',
  index_rate: 'sofr',
  spread: '',
  term_months: '',
  io_period_months: '',
  amortization_months: '',
  origination_fee_percent: '',
  exit_fee_percent: '',
  annual_fee: '',
  interest_reserve: '',
  operating_reserve: '',
  draw_schedule_type: 's_curve',
  funding_date: '',
  maturity_date: '',
};

export default function AddLoanModal({
  open,
  onClose,
  proformaId,
  existingLoans = [],
  onAdd,
}) {
  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm({ ...DEFAULT_FORM });
      setErrors({});
    }
  }, [open]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Loan name is required';
    if (!form.commitment_amount || parseFloat(form.commitment_amount) <= 0) {
      errs.commitment_amount = 'Commitment amount is required';
    }
    if (form.rate_type === 'fixed' && !form.interest_rate) {
      errs.interest_rate = 'Interest rate is required';
    }
    if (!form.term_months || parseInt(form.term_months) <= 0) {
      errs.term_months = 'Term is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onAdd({
      proforma_id: proformaId,
      name: form.name.trim(),
      loan_type: form.loan_type,
      position: form.position,
      commitment_amount: parseFloat(form.commitment_amount) || 0,
      ltc_percent: form.ltc_percent ? parseFloat(form.ltc_percent) : null,
      ltv_percent: form.ltv_percent ? parseFloat(form.ltv_percent) : null,
      rate_type: form.rate_type,
      interest_rate: form.rate_type === 'fixed' ? parseFloat(form.interest_rate) : null,
      index_rate: form.rate_type === 'floating' ? form.index_rate : null,
      spread: form.rate_type === 'floating' ? parseFloat(form.spread) || 0 : null,
      term_months: parseInt(form.term_months) || 0,
      io_period_months: form.io_period_months ? parseInt(form.io_period_months) : null,
      amortization_months: form.amortization_months ? parseInt(form.amortization_months) : null,
      origination_fee_percent: form.origination_fee_percent ? parseFloat(form.origination_fee_percent) : 0,
      exit_fee_percent: form.exit_fee_percent ? parseFloat(form.exit_fee_percent) : 0,
      annual_fee: form.annual_fee ? parseFloat(form.annual_fee) : 0,
      interest_reserve: form.interest_reserve ? parseFloat(form.interest_reserve) : 0,
      operating_reserve: form.operating_reserve ? parseFloat(form.operating_reserve) : 0,
      draw_schedule_type: form.loan_type === 'construction' ? form.draw_schedule_type : null,
      funding_date: form.funding_date || null,
      maturity_date: form.maturity_date || null,
      is_active: true,
      sort_order: existingLoans.length,
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Loan</DialogTitle>
          <p className="text-sm text-gray-500">Add a new debt instrument to the capital stack</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label className="mb-1">Loan Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., ABC Bank Construction Loan"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label className="mb-1">Loan Type *</Label>
              <select
                value={form.loan_type}
                onChange={(e) => handleChange('loan_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {LOAN_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="mb-1">Position *</Label>
              <select
                value={form.position}
                onChange={(e) => handleChange('position', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {LOAN_POSITIONS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Loan Amount */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Loan Amount</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="mb-1">Commitment Amount *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
                  <Input
                    type="number"
                    value={form.commitment_amount}
                    onChange={(e) => handleChange('commitment_amount', e.target.value)}
                    className="pl-8"
                  />
                </div>
                {errors.commitment_amount && <p className="text-xs text-red-500 mt-1">{errors.commitment_amount}</p>}
              </div>
              <div>
                <Label className="mb-1">LTC %</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    value={form.ltc_percent}
                    onChange={(e) => handleChange('ltc_percent', e.target.value)}
                    placeholder="75.0"
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
                </div>
              </div>
              <div>
                <Label className="mb-1">LTV %</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    value={form.ltv_percent}
                    onChange={(e) => handleChange('ltv_percent', e.target.value)}
                    placeholder="70.0"
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interest Rate */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Interest Rate</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1">Rate Type</Label>
                <select
                  value={form.rate_type}
                  onChange={(e) => handleChange('rate_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="fixed">Fixed Rate</option>
                  <option value="floating">Floating Rate</option>
                </select>
              </div>

              {form.rate_type === 'fixed' ? (
                <div>
                  <Label className="mb-1">Interest Rate *</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      value={form.interest_rate}
                      onChange={(e) => handleChange('interest_rate', e.target.value)}
                      placeholder="8.50"
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
                  </div>
                  {errors.interest_rate && <p className="text-xs text-red-500 mt-1">{errors.interest_rate}</p>}
                </div>
              ) : (
                <>
                  <div>
                    <Label className="mb-1">Index</Label>
                    <select
                      value={form.index_rate}
                      onChange={(e) => handleChange('index_rate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="sofr">SOFR</option>
                      <option value="prime">Prime</option>
                    </select>
                  </div>
                  <div>
                    <Label className="mb-1">Spread</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        value={form.spread}
                        onChange={(e) => handleChange('spread', e.target.value)}
                        placeholder="3.50"
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Term & Amortization */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Term & Amortization</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="mb-1">Term (Months) *</Label>
                <Input
                  type="number"
                  value={form.term_months}
                  onChange={(e) => handleChange('term_months', e.target.value)}
                  placeholder="24"
                />
                {errors.term_months && <p className="text-xs text-red-500 mt-1">{errors.term_months}</p>}
              </div>
              <div>
                <Label className="mb-1">IO Period (Months)</Label>
                <Input
                  type="number"
                  value={form.io_period_months}
                  onChange={(e) => handleChange('io_period_months', e.target.value)}
                  placeholder="24"
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank for full IO</p>
              </div>
              <div>
                <Label className="mb-1">Amortization (Months)</Label>
                <Input
                  type="number"
                  value={form.amortization_months}
                  onChange={(e) => handleChange('amortization_months', e.target.value)}
                  placeholder="360"
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank for IO</p>
              </div>
            </div>
          </div>

          {/* Fees */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Fees</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="mb-1">Origination Fee</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.origination_fee_percent}
                    onChange={(e) => handleChange('origination_fee_percent', e.target.value)}
                    placeholder="1.00"
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
                </div>
              </div>
              <div>
                <Label className="mb-1">Exit Fee</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.exit_fee_percent}
                    onChange={(e) => handleChange('exit_fee_percent', e.target.value)}
                    placeholder="0.50"
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
                </div>
              </div>
              <div>
                <Label className="mb-1">Annual Fee</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
                  <Input
                    type="number"
                    value={form.annual_fee}
                    onChange={(e) => handleChange('annual_fee', e.target.value)}
                    placeholder="0"
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Reserves (construction loans only) */}
          {form.loan_type === 'construction' && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">Reserves</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1">Interest Reserve</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
                    <Input
                      type="number"
                      value={form.interest_reserve}
                      onChange={(e) => handleChange('interest_reserve', e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div>
                  <Label className="mb-1">Operating Reserve</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
                    <Input
                      type="number"
                      value={form.operating_reserve}
                      onChange={(e) => handleChange('operating_reserve', e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Draw Schedule (construction loans only) */}
          {form.loan_type === 'construction' && (
            <div>
              <Label className="mb-1">Draw Schedule Type</Label>
              <select
                value={form.draw_schedule_type}
                onChange={(e) => handleChange('draw_schedule_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="monthly">Monthly (Linear)</option>
                <option value="s_curve">S-Curve</option>
                <option value="milestone">Milestone Based</option>
              </select>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1">Funding Date</Label>
              <Input
                type="date"
                value={form.funding_date}
                onChange={(e) => handleChange('funding_date', e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1">Maturity Date</Label>
              <Input
                type="date"
                value={form.maturity_date}
                onChange={(e) => handleChange('maturity_date', e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-[#2F855A] hover:bg-[#276749] text-white">
              Add Loan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
