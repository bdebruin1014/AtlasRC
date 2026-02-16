import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Landmark, Plus, CalendarCheck } from 'lucide-react';

const STATUS_BADGES = {
  Closed: 'bg-green-100 text-green-800',
  Scheduled: 'bg-blue-100 text-blue-800',
  'Pending Title': 'bg-yellow-100 text-yellow-800',
  Delayed: 'bg-red-100 text-red-800',
};

const INITIAL_CLOSINGS = [
  { id: 1, lotHouse: 'Lot 101', buyer: 'Johnson Family Trust', salePrice: 125000, closingDate: '2024-10-28', titleCompany: 'First American Title', status: 'Closed', netProceeds: 117500 },
  { id: 2, lotHouse: 'Lot 102', buyer: 'Michael & Sarah Chen', salePrice: 110000, closingDate: '2024-11-15', titleCompany: 'Chicago Title', status: 'Closed', netProceeds: 103400 },
  { id: 3, lotHouse: 'Lot 302', buyer: 'Patriot Builders Inc.', salePrice: 122000, closingDate: '2025-01-10', titleCompany: 'Stewart Title', status: 'Closed', netProceeds: 114680 },
  { id: 4, lotHouse: 'Lot 103', buyer: 'Riverside Homes LLC', salePrice: 118000, closingDate: '2025-03-15', titleCompany: 'Fidelity National Title', status: 'Scheduled', netProceeds: 110920 },
  { id: 5, lotHouse: 'Lot 205', buyer: 'Summit Development Co.', salePrice: 130000, closingDate: '2025-04-01', titleCompany: 'Old Republic Title', status: 'Pending Title', netProceeds: 122200 },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

export default function ClosingsSection({ projectId }) {
  const [closings] = useState(INITIAL_CLOSINGS);

  const totalClosings = closings.filter((c) => c.status === 'Closed').length;
  // Simulate "this month" as the most recent closings
  const thisMonthClosings = closings.filter((c) => c.closingDate >= '2025-01-01' && c.status === 'Closed');
  const revenueThisMonth = thisMonthClosings.reduce((sum, c) => sum + c.salePrice, 0);
  const avgDaysToClose = 32; // Demo static value

  const totalSalePrice = closings.filter((c) => c.status !== 'Delayed').reduce((sum, c) => sum + c.salePrice, 0);
  const totalNetProceeds = closings.filter((c) => c.status !== 'Delayed').reduce((sum, c) => sum + c.netProceeds, 0);

  const kpis = [
    { label: 'Total Closings', value: String(totalClosings) },
    { label: 'This Month', value: String(thisMonthClosings.length) },
    { label: 'Revenue This Month', value: formatCurrency(revenueThisMonth) },
    { label: 'Avg Days to Close', value: String(avgDaysToClose) },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Landmark className="w-5 h-5 text-[#047857]" />
          <h2 className="text-lg font-semibold text-gray-900">Closings</h2>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]">
          <CalendarCheck className="w-4 h-4 mr-2" />
          Schedule Closing
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

      {/* Closings Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="text-xs text-gray-500 uppercase border-b bg-gray-50">
            <tr>
              <th className="text-left p-3">Lot / House</th>
              <th className="text-left p-3">Buyer</th>
              <th className="text-right p-3">Sale Price</th>
              <th className="text-left p-3">Closing Date</th>
              <th className="text-left p-3">Title Company</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Net Proceeds</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {closings.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  <Landmark className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  No closings recorded yet. Click "Schedule Closing" to add one.
                </td>
              </tr>
            ) : (
              closings.map((closing) => (
                <tr key={closing.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium">{closing.lotHouse}</td>
                  <td className="p-3 text-sm text-gray-700">{closing.buyer}</td>
                  <td className="p-3 text-sm text-right">{formatCurrency(closing.salePrice)}</td>
                  <td className="p-3 text-sm text-gray-600">{closing.closingDate}</td>
                  <td className="p-3 text-sm text-gray-600">{closing.titleCompany}</td>
                  <td className="p-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        STATUS_BADGES[closing.status] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {closing.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-right">{formatCurrency(closing.netProceeds)}</td>
                </tr>
              ))
            )}
          </tbody>
          {/* Summary Row */}
          {closings.length > 0 && (
            <tfoot className="border-t-2 border-gray-300 bg-gray-50">
              <tr className="font-semibold text-sm">
                <td className="p-3" colSpan={2}>
                  Totals ({closings.length} closings)
                </td>
                <td className="p-3 text-right">{formatCurrency(totalSalePrice)}</td>
                <td className="p-3" colSpan={3}></td>
                <td className="p-3 text-right">{formatCurrency(totalNetProceeds)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
