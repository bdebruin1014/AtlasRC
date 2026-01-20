import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const EXIT_STRATEGIES = [
  { value: 'refinance', label: 'Refinance' },
  { value: 'sell', label: 'Sell' },
  { value: 'hold', label: 'Hold' },
];

export default function ProjectTypeFields({ type, value, onChange }) {
  // value: object with all possible fields, onChange: (field, value) => void
  if (type === 'lot-development') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Total Lots</Label>
            <Input type="number" value={value.total_lots || ''} onChange={e => onChange('total_lots', e.target.value)} />
          </div>
          <div>
            <Label>Total Acreage</Label>
            <Input type="number" value={value.total_acreage || ''} onChange={e => onChange('total_acreage', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Lot Sizes</Label>
            <Input value={value.lot_sizes || ''} onChange={e => onChange('lot_sizes', e.target.value)} placeholder="48x65, 91x55, ..." />
          </div>
          <div>
            <Label>Density (lots/acre)</Label>
            <Input type="number" value={value.density || ''} onChange={e => onChange('density', e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Pre-Sold Status</Label>
          <Select value={value.pre_sold_status ? 'yes' : 'no'} onValueChange={v => onChange('pre_sold_status', v === 'yes')}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {value.pre_sold_status && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Builder Name</Label>
              <Input value={value.builder_name || ''} onChange={e => onChange('builder_name', e.target.value)} />
            </div>
            <div>
              <Label>Builder Deposits</Label>
              <Input type="number" value={value.builder_deposits || ''} onChange={e => onChange('builder_deposits', e.target.value)} />
            </div>
          </div>
        )}
      </div>
    );
  }
  if (type === 'build-to-rent') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Total Units</Label>
            <Input type="number" value={value.total_units || ''} onChange={e => onChange('total_units', e.target.value)} />
          </div>
          <div>
            <Label>Avg Unit Size (SF)</Label>
            <Input type="number" value={value.avg_unit_size || ''} onChange={e => onChange('avg_unit_size', e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Unit Mix</Label>
          <Input value={value.unit_mix || ''} onChange={e => onChange('unit_mix', e.target.value)} placeholder="1BR (10), 2BR (30), ..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Target Rent (per unit/mo)</Label>
            <Input type="number" value={value.target_rent || ''} onChange={e => onChange('target_rent', e.target.value)} />
          </div>
          <div>
            <Label>Hold Period (months)</Label>
            <Input type="number" value={value.hold_period || ''} onChange={e => onChange('hold_period', e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Exit Strategy</Label>
          <Select value={value.exit_strategy || ''} onValueChange={v => onChange('exit_strategy', v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {EXIT_STRATEGIES.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }
  if (type === 'fix-flip') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Purchase Price</Label>
            <Input type="number" value={value.purchase_price || ''} onChange={e => onChange('purchase_price', e.target.value)} />
          </div>
          <div>
            <Label>Rehab Budget</Label>
            <Input type="number" value={value.rehab_budget || ''} onChange={e => onChange('rehab_budget', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>ARV (After Repair Value)</Label>
            <Input type="number" value={value.arv || ''} onChange={e => onChange('arv', e.target.value)} />
          </div>
          <div>
            <Label>Expected Profit</Label>
            <Input type="number" value={value.expected_profit || ''} onChange={e => onChange('expected_profit', e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Hold Time (days)</Label>
          <Input type="number" value={value.hold_time_days || ''} onChange={e => onChange('hold_time_days', e.target.value)} />
        </div>
      </div>
    );
  }
  if (type === 'brrr') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Purchase Price</Label>
            <Input type="number" value={value.purchase_price || ''} onChange={e => onChange('purchase_price', e.target.value)} />
          </div>
          <div>
            <Label>Rehab Budget</Label>
            <Input type="number" value={value.rehab_budget || ''} onChange={e => onChange('rehab_budget', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>ARV</Label>
            <Input type="number" value={value.arv || ''} onChange={e => onChange('arv', e.target.value)} />
          </div>
          <div>
            <Label>Target Rent</Label>
            <Input type="number" value={value.target_rent || ''} onChange={e => onChange('target_rent', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Refinance Amount</Label>
            <Input type="number" value={value.refinance_amount || ''} onChange={e => onChange('refinance_amount', e.target.value)} />
          </div>
          <div>
            <Label>Cash Out Amount</Label>
            <Input type="number" value={value.cash_out_amount || ''} onChange={e => onChange('cash_out_amount', e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Monthly Cashflow</Label>
          <Input type="number" value={value.monthly_cashflow || ''} onChange={e => onChange('monthly_cashflow', e.target.value)} />
        </div>
      </div>
    );
  }
  return null;
}
