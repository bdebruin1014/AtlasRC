// src/pages/projects/Sales/SalesPage.jsx
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DollarSign, Plus, Search, Home, TrendingUp, Users,
  Percent, BarChart3, CheckCircle2,
} from 'lucide-react';
import { useProjectSales } from '@/hooks/useSales';
import { useSaleActions } from '@/hooks/useSales';
import {
  SALE_STATUSES, PROPERTY_TYPES, getStatusConfig, getPropertyTypeLabel,
} from '@/services/salesService';
import SaleForm from './SaleForm';
import SaleDetail from './SaleDetail';

export default function SalesPage() {
  const { projectId } = useParams();
  const pid = projectId || 'demo-project-1';
  const { sales, loading, totals, refetch } = useProjectSales(pid);

  const [showForm, setShowForm] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = sales.filter(sale => {
    if (filterStatus !== 'all' && sale.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        sale.unit_identifier?.toLowerCase().includes(q) ||
        sale.buyer_name?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v || 0);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading sales...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue & Sales</h1>
          <p className="text-sm text-gray-500 mt-1">Track unit sales, revenue, and absorption</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-[#2F855A] hover:bg-[#276749]">
          <Plus className="w-4 h-4 mr-2" /> Add Unit
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white border rounded-lg p-3">
          <div className="flex items-center gap-1 text-gray-500 text-xs font-medium mb-1">
            <Home className="w-3 h-3" /> TOTAL UNITS
          </div>
          <div className="text-xl font-bold text-gray-900">{totals.totalUnits}</div>
        </div>
        <div className="bg-white border rounded-lg p-3">
          <div className="flex items-center gap-1 text-green-600 text-xs font-medium mb-1">
            <CheckCircle2 className="w-3 h-3" /> CLOSED
          </div>
          <div className="text-xl font-bold text-green-700">{totals.closed}</div>
        </div>
        <div className="bg-white border rounded-lg p-3">
          <div className="flex items-center gap-1 text-blue-600 text-xs font-medium mb-1">
            <Users className="w-3 h-3" /> UNDER CONTRACT
          </div>
          <div className="text-xl font-bold text-blue-700">{totals.pending}</div>
        </div>
        <div className="bg-white border rounded-lg p-3">
          <div className="flex items-center gap-1 text-amber-600 text-xs font-medium mb-1">
            <Home className="w-3 h-3" /> AVAILABLE
          </div>
          <div className="text-xl font-bold text-amber-700">{totals.available}</div>
        </div>
        <div className="bg-white border rounded-lg p-3">
          <div className="flex items-center gap-1 text-gray-500 text-xs font-medium mb-1">
            <DollarSign className="w-3 h-3" /> GROSS REVENUE
          </div>
          <div className="text-lg font-bold text-gray-900">{fmt(totals.totalGrossProceeds)}</div>
        </div>
        <div className="bg-white border rounded-lg p-3">
          <div className="flex items-center gap-1 text-green-600 text-xs font-medium mb-1">
            <TrendingUp className="w-3 h-3" /> NET PROCEEDS
          </div>
          <div className="text-lg font-bold text-green-700">{fmt(totals.totalNetProceeds)}</div>
        </div>
        <div className="bg-white border rounded-lg p-3">
          <div className="flex items-center gap-1 text-purple-600 text-xs font-medium mb-1">
            <BarChart3 className="w-3 h-3" /> ABSORPTION
          </div>
          <div className="text-xl font-bold text-purple-700">{(totals.absorption * 100).toFixed(0)}%</div>
        </div>
      </div>

      {/* Avg Price & Costs Summary */}
      <div className="bg-white border rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <div className="text-gray-500 text-xs uppercase mb-0.5">Avg List Price</div>
            <div className="font-bold">{fmt(totals.avgListPrice)}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs uppercase mb-0.5">Avg Sale Price</div>
            <div className="font-bold">{fmt(totals.avgSalePrice)}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs uppercase mb-0.5">Total Commissions</div>
            <div className="font-bold text-red-600">{fmt(totals.totalCommissions)}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs uppercase mb-0.5">Total Closing Costs</div>
            <div className="font-bold text-red-600">{fmt(totals.totalClosingCosts)}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs uppercase mb-0.5">Total Concessions</div>
            <div className="font-bold text-red-600">{fmt(totals.totalConcessions)}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search units or buyers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-64"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All Statuses</option>
          {SALE_STATUSES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Sales Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3 text-right">List Price</th>
                <th className="px-4 py-3 text-right">Sale Price</th>
                <th className="px-4 py-3 text-right">Net Proceeds</th>
                <th className="px-4 py-3">Closing Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No sales found.
                  </td>
                </tr>
              ) : (
                filtered.map(sale => {
                  const statusConfig = getStatusConfig(sale.status);
                  return (
                    <tr
                      key={sale.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedSale(sale)}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{sale.unit_identifier}</td>
                      <td className="px-4 py-3 text-gray-600">{getPropertyTypeLabel(sale.property_type)}</td>
                      <td className="px-4 py-3 text-gray-700">{sale.buyer_name || '—'}</td>
                      <td className="px-4 py-3 text-right font-mono text-gray-600">{fmt(sale.list_price)}</td>
                      <td className="px-4 py-3 text-right font-mono font-medium">
                        {sale.sale_price ? fmt(sale.sale_price) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-green-700 font-medium">
                        {sale.net_proceeds ? fmt(sale.net_proceeds) : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {sale.actual_closing_date || sale.closing_date || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Dialog */}
      {showForm && (
        <SaleForm
          open={showForm}
          projectId={pid}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); refetch(); }}
        />
      )}

      {/* Detail Dialog */}
      {selectedSale && (
        <SaleDetail
          open={!!selectedSale}
          sale={selectedSale}
          onClose={() => setSelectedSale(null)}
          onUpdated={refetch}
        />
      )}
    </div>
  );
}
