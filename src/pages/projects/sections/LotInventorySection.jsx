import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layers, Plus, Search, Filter } from 'lucide-react';

const STATUS_BADGES = {
  Available: 'bg-green-100 text-green-800',
  Reserved: 'bg-yellow-100 text-yellow-800',
  Sold: 'bg-blue-100 text-blue-800',
  'Under Contract': 'bg-purple-100 text-purple-800',
  Hold: 'bg-gray-100 text-gray-600',
};

const INITIAL_LOTS = [
  { id: 1, lot: '101', phase: 'Phase 1', size: 0.28, status: 'Sold', price: 125000, buyer: 'Johnson Family Trust', notes: 'Corner lot, premium' },
  { id: 2, lot: '102', phase: 'Phase 1', size: 0.22, status: 'Sold', price: 110000, buyer: 'Michael & Sarah Chen', notes: '' },
  { id: 3, lot: '103', phase: 'Phase 1', size: 0.25, status: 'Under Contract', price: 118000, buyer: 'Riverside Homes LLC', notes: 'Closing scheduled 3/15' },
  { id: 4, lot: '104', phase: 'Phase 1', size: 0.31, status: 'Reserved', price: 135000, buyer: 'David Martinez', notes: 'Deposit received' },
  { id: 5, lot: '201', phase: 'Phase 2', size: 0.24, status: 'Available', price: 115000, buyer: '', notes: 'Cul-de-sac location' },
  { id: 6, lot: '202', phase: 'Phase 2', size: 0.27, status: 'Available', price: 120000, buyer: '', notes: '' },
  { id: 7, lot: '203', phase: 'Phase 2', size: 0.20, status: 'Reserved', price: 105000, buyer: 'Angela Brooks', notes: 'Builder allocation' },
  { id: 8, lot: '204', phase: 'Phase 2', size: 0.35, status: 'Available', price: 145000, buyer: '', notes: 'Oversized, backs to greenbelt' },
  { id: 9, lot: '301', phase: 'Phase 3', size: 0.23, status: 'Hold', price: 112000, buyer: '', notes: 'Drainage easement review' },
  { id: 10, lot: '302', phase: 'Phase 3', size: 0.26, status: 'Sold', price: 122000, buyer: 'Patriot Builders Inc.', notes: 'Bulk purchase' },
];

const FILTER_TABS = ['All', 'Available', 'Reserved', 'Sold'];

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

export default function LotInventorySection({ projectId }) {
  const [lots] = useState(INITIAL_LOTS);
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredLots =
    activeFilter === 'All'
      ? lots
      : lots.filter((l) => l.status === activeFilter);

  const totalLots = lots.length;
  const available = lots.filter((l) => l.status === 'Available').length;
  const reserved = lots.filter((l) => l.status === 'Reserved').length;
  const sold = lots.filter((l) => l.status === 'Sold').length;

  const kpis = [
    { label: 'Total Lots', value: String(totalLots) },
    { label: 'Available', value: String(available) },
    { label: 'Reserved', value: String(reserved) },
    { label: 'Sold', value: String(sold) },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5 text-[#047857]" />
          <h2 className="text-lg font-semibold text-gray-900">Lot Inventory</h2>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]">
          <Plus className="w-4 h-4 mr-2" />
          Add Lot
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-500">{kpi.label}</p>
            <p className="text-2xl font-semibold">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
              activeFilter === tab
                ? 'bg-[#047857] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Lots Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="text-xs text-gray-500 uppercase border-b bg-gray-50">
            <tr>
              <th className="text-left p-3">Lot #</th>
              <th className="text-left p-3">Phase</th>
              <th className="text-right p-3">Size (ac)</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">List Price</th>
              <th className="text-left p-3">Buyer / Reserved By</th>
              <th className="text-left p-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredLots.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  No lots match the selected filter.
                </td>
              </tr>
            ) : (
              filteredLots.map((lot) => (
                <tr key={lot.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium">{lot.lot}</td>
                  <td className="p-3 text-sm text-gray-600">{lot.phase}</td>
                  <td className="p-3 text-sm text-right">{lot.size.toFixed(2)}</td>
                  <td className="p-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        STATUS_BADGES[lot.status] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {lot.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-right">{formatCurrency(lot.price)}</td>
                  <td className="p-3 text-sm text-gray-600">{lot.buyer || '--'}</td>
                  <td className="p-3 text-sm text-gray-500">{lot.notes || '--'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
