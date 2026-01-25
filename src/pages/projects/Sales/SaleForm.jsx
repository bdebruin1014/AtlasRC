// src/pages/projects/Sales/SaleForm.jsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PROPERTY_TYPES, SALE_STATUSES, FINANCING_TYPES } from '@/services/salesService';
import { useSaleActions } from '@/hooks/useSales';

export default function SaleForm({ open, projectId, sale, onClose, onSaved }) {
  const { create, update, saving } = useSaleActions(projectId);
  const isEdit = !!sale;

  const [form, setForm] = useState({
    unit_identifier: sale?.unit_identifier || '',
    property_type: sale?.property_type || 'home',
    buyer_name: sale?.buyer_name || '',
    list_price: sale?.list_price?.toString() || '',
    sale_price: sale?.sale_price?.toString() || '',
    price_psf: sale?.price_psf?.toString() || '',
    square_footage: sale?.square_footage?.toString() || '',
    listing_date: sale?.listing_date || '',
    contract_date: sale?.contract_date || '',
    closing_date: sale?.closing_date || '',
    status: sale?.status || 'available',
    broker_commission: sale?.broker_commission?.toString() || '',
    closing_costs: sale?.closing_costs?.toString() || '',
    concessions: sale?.concessions?.toString() || '',
    buyer_financing_type: sale?.buyer_financing_type || '',
    earnest_money: sale?.earnest_money?.toString() || '',
    option_period_days: sale?.option_period_days?.toString() || '10',
    notes: sale?.notes || '',
  });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      list_price: parseFloat(form.list_price) || 0,
      sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
      price_psf: form.price_psf ? parseFloat(form.price_psf) : null,
      square_footage: form.square_footage ? parseInt(form.square_footage) : null,
      broker_commission: form.broker_commission ? parseFloat(form.broker_commission) : null,
      closing_costs: form.closing_costs ? parseFloat(form.closing_costs) : null,
      concessions: form.concessions ? parseFloat(form.concessions) : null,
      earnest_money: form.earnest_money ? parseFloat(form.earnest_money) : null,
      option_period_days: form.option_period_days ? parseInt(form.option_period_days) : null,
    };
    try {
      if (isEdit) {
        await update(sale.id, data);
      } else {
        await create(data);
      }
      onSaved();
    } catch (err) {
      console.error('Error saving sale:', err);
    }
  };

  // Auto-calculate price per sqft
  const autoCalcPsf = () => {
    const price = parseFloat(form.sale_price || form.list_price);
    const sqft = parseInt(form.square_footage);
    if (price && sqft) {
      set('price_psf', (price / sqft).toFixed(2));
    }
  };

  // Auto-calculate commission (3%)
  const autoCalcCommission = () => {
    const price = parseFloat(form.sale_price || form.list_price);
    if (price) {
      set('broker_commission', (price * 0.03).toFixed(2));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Unit Sale' : 'Add Unit'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Unit Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Unit/Lot ID *</Label>
              <Input value={form.unit_identifier} onChange={(e) => set('unit_identifier', e.target.value)} placeholder="Lot 1" required />
            </div>
            <div>
              <Label>Property Type</Label>
              <select value={form.property_type} onChange={(e) => set('property_type', e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm">
                {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {/* Buyer */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Buyer Name</Label>
              <Input value={form.buyer_name} onChange={(e) => set('buyer_name', e.target.value)} placeholder="Buyer name" />
            </div>
            <div>
              <Label>Status</Label>
              <select value={form.status} onChange={(e) => set('status', e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm">
                {SALE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>List Price *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <Input type="number" step="0.01" value={form.list_price} onChange={(e) => set('list_price', e.target.value)} className="pl-7" required />
              </div>
            </div>
            <div>
              <Label>Sale Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <Input type="number" step="0.01" value={form.sale_price} onChange={(e) => set('sale_price', e.target.value)} className="pl-7" onBlur={autoCalcPsf} />
              </div>
            </div>
            <div>
              <Label>Sq Ft</Label>
              <Input type="number" value={form.square_footage} onChange={(e) => set('square_footage', e.target.value)} onBlur={autoCalcPsf} placeholder="2000" />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Listing Date</Label>
              <Input type="date" value={form.listing_date} onChange={(e) => set('listing_date', e.target.value)} />
            </div>
            <div>
              <Label>Contract Date</Label>
              <Input type="date" value={form.contract_date} onChange={(e) => set('contract_date', e.target.value)} />
            </div>
            <div>
              <Label>Closing Date</Label>
              <Input type="date" value={form.closing_date} onChange={(e) => set('closing_date', e.target.value)} />
            </div>
          </div>

          {/* Costs */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Broker Commission</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <Input type="number" step="0.01" value={form.broker_commission} onChange={(e) => set('broker_commission', e.target.value)} className="pl-7" onFocus={autoCalcCommission} />
              </div>
            </div>
            <div>
              <Label>Closing Costs</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <Input type="number" step="0.01" value={form.closing_costs} onChange={(e) => set('closing_costs', e.target.value)} className="pl-7" />
              </div>
            </div>
            <div>
              <Label>Concessions</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <Input type="number" step="0.01" value={form.concessions} onChange={(e) => set('concessions', e.target.value)} className="pl-7" />
              </div>
            </div>
          </div>

          {/* Buyer Financing */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Financing Type</Label>
              <select value={form.buyer_financing_type} onChange={(e) => set('buyer_financing_type', e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm">
                <option value="">Select...</option>
                {FINANCING_TYPES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <Label>Earnest Money</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <Input type="number" step="0.01" value={form.earnest_money} onChange={(e) => set('earnest_money', e.target.value)} className="pl-7" />
              </div>
            </div>
            <div>
              <Label>Option Period (days)</Label>
              <Input type="number" value={form.option_period_days} onChange={(e) => set('option_period_days', e.target.value)} />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm resize-none" rows={2} placeholder="Notes..." />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-[#2F855A] hover:bg-[#276749]" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Update' : 'Add Unit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
