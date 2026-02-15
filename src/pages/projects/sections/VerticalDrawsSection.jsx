import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Receipt, Plus, DollarSign, Calendar, FileText } from 'lucide-react';

const defaultDraws = [
  {
    id: 1,
    drawNumber: 1,
    date: '2024-10-15',
    amount: 450000,
    status: 'Approved',
    description: 'Foundation completion for Lots 1-4, site grading, and initial framing materials',
    inspector: 'Mike Reynolds',
  },
  {
    id: 2,
    drawNumber: 2,
    date: '2024-12-01',
    amount: 520000,
    status: 'Approved',
    description: 'Framing completion for Lots 1-3, roofing for Lot 1, MEP rough-in for Lots 1-2',
    inspector: 'Sarah Chen',
  },
  {
    id: 3,
    drawNumber: 3,
    date: '2025-01-20',
    amount: 480000,
    status: 'Pending',
    description: 'MEP rough-in for Lots 3-4, insulation and drywall for Lots 1-2, framing for Lot 6',
    inspector: 'Mike Reynolds',
  },
  {
    id: 4,
    drawNumber: 4,
    date: '2025-03-15',
    amount: 390000,
    status: 'Submitted',
    description: 'Interior finishes for Lot 1, drywall for Lots 3-4, exterior work for Lots 1-2',
    inspector: '--',
  },
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const statusBadgeClass = {
  'Approved': 'bg-green-100 text-green-800',
  'Pending': 'bg-yellow-100 text-yellow-800',
  'Submitted': 'bg-blue-100 text-blue-800',
  'Rejected': 'bg-red-100 text-red-800',
};

export default function VerticalDrawsSection({ projectId }) {
  const [draws] = useState(defaultDraws);

  const totalLoan = 3600000;
  const drawnToDate = draws
    .filter((d) => d.status === 'Approved')
    .reduce((sum, d) => sum + d.amount, 0);
  const available = totalLoan - drawnToDate;
  const nextDrawDue = 'Mar 15';

  const kpis = [
    { label: 'Total Loan', value: formatCurrency(totalLoan), color: 'text-gray-900' },
    { label: 'Drawn to Date', value: formatCurrency(drawnToDate), color: 'text-blue-600' },
    { label: 'Available', value: formatCurrency(available), color: 'text-[#047857]' },
    { label: 'Next Draw Due', value: nextDrawDue, color: 'text-amber-600' },
  ];

  const totalRequested = draws.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-[#047857]" />
          Construction Draws
        </h2>
        <Button className="bg-[#047857] hover:bg-[#065f46]">
          <Plus className="w-4 h-4 mr-2" />
          New Draw Request
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-500">{kpi.label}</p>
            <p className={`text-2xl font-semibold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Draw Progress */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">Loan Utilization</p>
          <p className="text-sm text-gray-500">
            {formatCurrency(drawnToDate)} of {formatCurrency(totalLoan)} drawn ({Math.round((drawnToDate / totalLoan) * 100)}%)
          </p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="h-3 rounded-full bg-[#047857] transition-all"
            style={{ width: `${Math.min((drawnToDate / totalLoan) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Draws Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="text-xs text-gray-500 uppercase border-b bg-gray-50">
            <tr>
              <th className="text-left p-3">Draw #</th>
              <th className="text-left p-3">Date</th>
              <th className="text-right p-3">Amount</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Description</th>
              <th className="text-left p-3">Inspector</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {draws.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  <Receipt className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p>No draw requests yet. Click "New Draw Request" to create one.</p>
                </td>
              </tr>
            ) : (
              draws.map((draw) => (
                <tr key={draw.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">Draw {draw.drawNumber}</td>
                  <td className="p-3 text-gray-600 text-sm">{draw.date}</td>
                  <td className="p-3 text-right font-medium text-gray-900">{formatCurrency(draw.amount)}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadgeClass[draw.status] || 'bg-gray-100 text-gray-600'}`}>
                      {draw.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-600 max-w-xs truncate" title={draw.description}>
                    {draw.description}
                  </td>
                  <td className="p-3 text-sm text-gray-600">{draw.inspector}</td>
                </tr>
              ))
            )}
          </tbody>
          {draws.length > 0 && (
            <tfoot className="border-t-2 bg-gray-50 font-semibold">
              <tr>
                <td className="p-3 text-gray-900" colSpan={2}>Total Requested</td>
                <td className="p-3 text-right text-gray-900">{formatCurrency(totalRequested)}</td>
                <td className="p-3" colSpan={3}>
                  <span className="text-xs text-gray-500 font-normal">
                    {draws.filter((d) => d.status === 'Approved').length} approved,{' '}
                    {draws.filter((d) => d.status === 'Pending').length} pending,{' '}
                    {draws.filter((d) => d.status === 'Submitted').length} submitted
                  </span>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
