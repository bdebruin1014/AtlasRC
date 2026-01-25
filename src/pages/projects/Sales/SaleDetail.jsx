// src/pages/projects/Sales/SaleDetail.jsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Home, DollarSign, Calendar, User, CreditCard, TrendingUp,
  CheckCircle2, XCircle, Clock,
} from 'lucide-react';
import { getStatusConfig, getPropertyTypeLabel, FINANCING_TYPES } from '@/services/salesService';
import { useSaleActions } from '@/hooks/useSales';

export default function SaleDetail({ open, sale, onClose, onUpdated }) {
  const { changeStatus, saving } = useSaleActions(sale?.project_id);

  if (!sale) return null;

  const statusConfig = getStatusConfig(sale.status);
  const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v || 0);

  const handleStatusChange = async (newStatus) => {
    await changeStatus(sale.id, newStatus);
    onUpdated();
    onClose();
  };

  // Calculate price variance
  const priceVariance = sale.sale_price && sale.list_price
    ? ((sale.sale_price - sale.list_price) / sale.list_price) * 100
    : null;

  const financingLabel = FINANCING_TYPES.find(f => f.value === sale.buyer_financing_type)?.label;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            {sale.unit_identifier}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Status & Property */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={`text-sm px-3 py-1 ${statusConfig.color}`}>
                {statusConfig.label}
              </Badge>
              <span className="text-sm text-gray-600">{getPropertyTypeLabel(sale.property_type)}</span>
            </div>
            {sale.square_footage && (
              <span className="text-sm text-gray-500">{sale.square_footage.toLocaleString()} sq ft</span>
            )}
          </div>

          {/* Price Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 uppercase mb-1">List Price</div>
              <div className="text-lg font-bold text-gray-900">{fmt(sale.list_price)}</div>
            </div>
            <div className={`rounded-lg p-3 text-center ${sale.sale_price ? 'bg-blue-50' : 'bg-gray-50'}`}>
              <div className="text-xs text-gray-500 uppercase mb-1">Sale Price</div>
              <div className={`text-lg font-bold ${sale.sale_price ? 'text-blue-800' : 'text-gray-400'}`}>
                {sale.sale_price ? fmt(sale.sale_price) : '—'}
              </div>
              {priceVariance !== null && (
                <div className={`text-xs ${priceVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {priceVariance >= 0 ? '+' : ''}{priceVariance.toFixed(1)}%
                </div>
              )}
            </div>
            <div className={`rounded-lg p-3 text-center ${sale.net_proceeds ? 'bg-green-50' : 'bg-gray-50'}`}>
              <div className="text-xs text-gray-500 uppercase mb-1">Net Proceeds</div>
              <div className={`text-lg font-bold ${sale.net_proceeds ? 'text-green-800' : 'text-gray-400'}`}>
                {sale.net_proceeds ? fmt(sale.net_proceeds) : '—'}
              </div>
            </div>
          </div>

          {/* Buyer Info */}
          {sale.buyer_name && (
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4" /> Buyer
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-500 text-xs uppercase mb-0.5">Name</div>
                  <div className="font-medium">{sale.buyer_name}</div>
                </div>
                {financingLabel && (
                  <div>
                    <div className="text-gray-500 text-xs uppercase mb-0.5">Financing</div>
                    <div className="font-medium">{financingLabel}</div>
                  </div>
                )}
                {sale.earnest_money && (
                  <div>
                    <div className="text-gray-500 text-xs uppercase mb-0.5">Earnest Money</div>
                    <div className="font-medium">{fmt(sale.earnest_money)}</div>
                  </div>
                )}
                {sale.option_period_days && (
                  <div>
                    <div className="text-gray-500 text-xs uppercase mb-0.5">Option Period</div>
                    <div className="font-medium">{sale.option_period_days} days</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Calendar className="w-4 h-4" /> Timeline
            </div>
            <div className="flex items-center gap-2 text-sm">
              {[
                { label: 'Listed', date: sale.listing_date, done: !!sale.listing_date },
                { label: 'Contract', date: sale.contract_date, done: !!sale.contract_date },
                { label: 'Closing', date: sale.actual_closing_date || sale.closing_date, done: !!sale.actual_closing_date },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2 flex-1">
                  {i > 0 && <div className={`h-0.5 flex-1 ${step.done ? 'bg-green-400' : 'bg-gray-200'}`} />}
                  <div className="text-center">
                    <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center mb-1 ${step.done ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {step.done ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-gray-400" />}
                    </div>
                    <div className="text-xs font-medium">{step.label}</div>
                    <div className="text-xs text-gray-500">{step.date || '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Costs Breakdown */}
          {(sale.broker_commission || sale.closing_costs || sale.concessions) && (
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <DollarSign className="w-4 h-4" /> Cost Breakdown
              </div>
              <div className="space-y-2 text-sm">
                {sale.broker_commission && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Broker Commission</span>
                    <span className="font-mono text-red-600">({fmt(sale.broker_commission)})</span>
                  </div>
                )}
                {sale.closing_costs && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Closing Costs</span>
                    <span className="font-mono text-red-600">({fmt(sale.closing_costs)})</span>
                  </div>
                )}
                {sale.concessions && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Concessions</span>
                    <span className="font-mono text-red-600">({fmt(sale.concessions)})</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t font-bold">
                  <span>Net Proceeds</span>
                  <span className="font-mono text-green-700">{fmt(sale.net_proceeds)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Price per sq ft */}
          {sale.price_psf && (
            <div className="text-sm text-gray-600">
              Price per sq ft: <span className="font-bold">${sale.price_psf.toFixed(2)}</span>
            </div>
          )}

          {/* Notes */}
          {sale.notes && (
            <div>
              <div className="text-gray-500 text-xs uppercase mb-1">Notes</div>
              <div className="text-sm text-gray-700 bg-gray-50 rounded p-2">{sale.notes}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t">
            {sale.status === 'available' && (
              <Button
                size="sm"
                variant="outline"
                className="text-amber-700 border-amber-300 hover:bg-amber-50"
                onClick={() => handleStatusChange('pending')}
                disabled={saving}
              >
                Mark Pending
              </Button>
            )}
            {sale.status === 'pending' && (
              <Button
                size="sm"
                variant="outline"
                className="text-blue-700 border-blue-300 hover:bg-blue-50"
                onClick={() => handleStatusChange('under_contract')}
                disabled={saving}
              >
                Under Contract
              </Button>
            )}
            {sale.status === 'under_contract' && (
              <>
                <Button
                  size="sm"
                  className="bg-[#2F855A] hover:bg-[#276749]"
                  onClick={() => handleStatusChange('closed')}
                  disabled={saving}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Close Sale
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-700 border-red-300 hover:bg-red-50"
                  onClick={() => handleStatusChange('cancelled')}
                  disabled={saving}
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
                </Button>
              </>
            )}
            <Button variant="outline" onClick={onClose} className="ml-auto">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
