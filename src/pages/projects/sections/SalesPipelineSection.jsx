import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Plus, UserPlus } from 'lucide-react';

const COLUMNS = [
  { id: 'lead', label: 'Lead', color: 'bg-gray-500', lightBg: 'bg-gray-50', border: 'border-gray-200' },
  { id: 'showing', label: 'Showing', color: 'bg-blue-500', lightBg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'offer', label: 'Offer', color: 'bg-purple-500', lightBg: 'bg-purple-50', border: 'border-purple-200' },
  { id: 'under-contract', label: 'Under Contract', color: 'bg-amber-500', lightBg: 'bg-amber-50', border: 'border-amber-200' },
  { id: 'closed', label: 'Closed', color: 'bg-green-500', lightBg: 'bg-green-50', border: 'border-green-200' },
];

const INITIAL_PIPELINE = [
  { id: 1, buyer: 'James & Kelly Wright', lotOrHouse: 'Lot 205', amount: 120000, stage: 'lead' },
  { id: 2, buyer: 'Linda Nguyen', lotOrHouse: 'Lot 206', amount: 115000, stage: 'lead' },
  { id: 3, buyer: 'Robert Simmons', lotOrHouse: 'Lot 208', amount: 135000, stage: 'lead' },
  { id: 4, buyer: 'The Garcia Family', lotOrHouse: 'House Plan A - Lot 201', amount: 385000, stage: 'showing' },
  { id: 5, buyer: 'Mark & Diane Foster', lotOrHouse: 'Lot 207', amount: 128000, stage: 'showing' },
  { id: 6, buyer: 'Apex Custom Homes', lotOrHouse: 'Lots 301-303', amount: 345000, stage: 'offer' },
  { id: 7, buyer: 'Riverside Homes LLC', lotOrHouse: 'Lot 103', amount: 118000, stage: 'under-contract' },
  { id: 8, buyer: 'Summit Development Co.', lotOrHouse: 'Lot 205', amount: 130000, stage: 'under-contract' },
  { id: 9, buyer: 'Johnson Family Trust', lotOrHouse: 'Lot 101', amount: 125000, stage: 'closed' },
  { id: 10, buyer: 'Michael & Sarah Chen', lotOrHouse: 'Lot 102', amount: 110000, stage: 'closed' },
  { id: 11, buyer: 'Patriot Builders Inc.', lotOrHouse: 'Lot 302', amount: 122000, stage: 'closed' },
  { id: 12, buyer: 'Angela Brooks', lotOrHouse: 'House Plan B - Lot 203', amount: 410000, stage: 'lead' },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

export default function SalesPipelineSection({ projectId }) {
  const [pipeline] = useState(INITIAL_PIPELINE);

  const leads = pipeline.filter((p) => p.stage === 'lead');
  const showingsThisMonth = pipeline.filter((p) => p.stage === 'showing');
  const offers = pipeline.filter((p) => p.stage === 'offer');
  const totalDeals = pipeline.length;
  const closedDeals = pipeline.filter((p) => p.stage === 'closed').length;
  const conversionRate = totalDeals > 0 ? Math.round((closedDeals / totalDeals) * 100) : 0;

  const kpis = [
    { label: 'Active Leads', value: String(leads.length) },
    { label: 'Showings This Month', value: String(showingsThisMonth.length) },
    { label: 'Offers Received', value: String(offers.length) },
    { label: 'Conversion Rate', value: `${conversionRate}%` },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-[#047857]" />
          <h2 className="text-lg font-semibold text-gray-900">Sales Pipeline</h2>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Lead
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

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4" style={{ minWidth: '900px' }}>
          {COLUMNS.map((col) => {
            const items = pipeline.filter((p) => p.stage === col.id);
            const colTotal = items.reduce((sum, i) => sum + i.amount, 0);
            return (
              <div key={col.id} className="flex-1 min-w-[180px]">
                {/* Column Header */}
                <div className={`${col.color} rounded-t-lg px-3 py-2 flex items-center justify-between`}>
                  <span className="text-white text-sm font-semibold">{col.label}</span>
                  <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    {items.length}
                  </span>
                </div>

                {/* Column Body */}
                <div className={`${col.lightBg} ${col.border} border border-t-0 rounded-b-lg p-2 space-y-2 min-h-[200px]`}>
                  {items.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-6">No items</p>
                  ) : (
                    items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <p className="text-sm font-medium text-gray-900 truncate">{item.buyer}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.lotOrHouse}</p>
                        <p className="text-sm font-semibold text-[#047857] mt-2">{formatCurrency(item.amount)}</p>
                      </div>
                    ))
                  )}
                  {/* Column Total */}
                  {items.length > 0 && (
                    <div className="text-xs text-gray-500 text-center pt-2 border-t mt-2">
                      Total: {formatCurrency(colTotal)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
