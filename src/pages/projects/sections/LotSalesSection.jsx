import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Plus, DollarSign } from 'lucide-react';

const STATUS_BADGES = {
  Closed: 'bg-green-100 text-green-800',
  'Under Contract': 'bg-blue-100 text-blue-800',
  Pending: 'bg-yellow-100 text-yellow-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const INITIAL_SALES = [
  { id: 1, lot: '101', buyer: 'Johnson Family Trust', salePrice: 125000, contractDate: '2024-09-12', closingDate: '2024-10-28', status: 'Closed', commission: 7500 },
  { id: 2, lot: '102', buyer: 'Michael & Sarah Chen', salePrice: 110000, contractDate: '2024-10-03', closingDate: '2024-11-15', status: 'Closed', commission: 6600 },
  { id: 3, lot: '302', buyer: 'Patriot Builders Inc.', salePrice: 122000, contractDate: '2024-11-20', closingDate: '2025-01-10', status: 'Closed', commission: 7320 },
  { id: 4, lot: '103', buyer: 'Riverside Homes LLC', salePrice: 118000, contractDate: '2025-01-05', closingDate: '2025-03-15', status: 'Under Contract', commission: 7080 },
  { id: 5, lot: '205', buyer: 'Summit Development Co.', salePrice: 130000, contractDate: '2025-01-18', closingDate: '2025-04-01', status: 'Pending', commission: 7800 },
  { id: 6, lot: '108', buyer: 'Harper & Associates', salePrice: 95000, contractDate: '2024-08-10', closingDate: '', status: 'Cancelled', commission: 0 },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

export default function LotSalesSection({ projectId }) {
  const [sales] = useState(INITIAL_SALES);

  const closedSales = sales.filter((s) => s.status === 'Closed');
  const underContract = sales.filter((s) => s.status === 'Under Contract' || s.status === 'Pending');
  const totalRevenue = closedSales.reduce((sum, s) => sum + s.salePrice, 0);
  const avgSalePrice = closedSales.length > 0 ? Math.round(totalRevenue / closedSales.length) : 0;

  const activeSales = sales.filter((s) => s.status !== 'Cancelled');
  const totalAllSalesAmount = activeSales.reduce((sum, s) => sum + s.salePrice, 0);
  const totalCommission = activeSales.reduce((sum, s) => sum + s.commission, 0);

  const kpis = [
    { label: 'Total Revenue', value: formatCurrency(totalRevenue) },
    { label: 'Avg Sale Price', value: formatCurrency(avgSalePrice) },
    { label: 'Lots Sold', value: String(closedSales.length) },
    { label: 'Lots Under Contract', value: String(underContract.length) },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ShoppingBag className="w-5 h-5 text-[#047857]" />
          <h2 className="text-lg font-semibold text-gray-900">Lot Sales</h2>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]">
          <Plus className="w-4 h-4 mr-2" />
          Record Sale
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

      {/* Sales Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="text-xs text-gray-500 uppercase border-b bg-gray-50">
            <tr>
              <th className="text-left p-3">Lot #</th>
              <th className="text-left p-3">Buyer</th>
              <th className="text-right p-3">Sale Price</th>
              <th className="text-left p-3">Contract Date</th>
              <th className="text-left p-3">Closing Date</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Commission</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sales.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  <DollarSign className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  No sales recorded yet. Click "Record Sale" to add one.
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium">{sale.lot}</td>
                  <td className="p-3 text-sm text-gray-700">{sale.buyer}</td>
                  <td className="p-3 text-sm text-right">{formatCurrency(sale.salePrice)}</td>
                  <td className="p-3 text-sm text-gray-600">{sale.contractDate}</td>
                  <td className="p-3 text-sm text-gray-600">{sale.closingDate || '--'}</td>
                  <td className="p-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        STATUS_BADGES[sale.status] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {sale.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-right">{formatCurrency(sale.commission)}</td>
                </tr>
              ))
            )}
          </tbody>
          {/* Summary Row */}
          {sales.length > 0 && (
            <tfoot className="border-t-2 border-gray-300 bg-gray-50">
              <tr className="font-semibold text-sm">
                <td className="p-3" colSpan={2}>
                  Totals ({activeSales.length} active sales)
                </td>
                <td className="p-3 text-right">{formatCurrency(totalAllSalesAmount)}</td>
                <td className="p-3" colSpan={3}></td>
                <td className="p-3 text-right">{formatCurrency(totalCommission)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
