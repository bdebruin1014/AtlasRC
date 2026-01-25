// src/pages/projects/CashFlow/CashFlowPage.jsx
import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign, TrendingUp, TrendingDown, BarChart3,
  ArrowUp, ArrowDown, Calendar, Lock,
} from 'lucide-react';
import { useProjectCashFlows } from '@/hooks/useCashFlow';
import {
  INFLOW_CATEGORIES, OUTFLOW_CATEGORIES, calculateRecordTotals,
} from '@/services/cashFlowService';

export default function CashFlowPage() {
  const { projectId } = useParams();
  const pid = projectId || 'demo-project-1';
  const { records, loading, summary } = useProjectCashFlows(pid);
  const [activeTab, setActiveTab] = useState('waterfall');
  const [showProjected, setShowProjected] = useState(true);

  const displayRecords = showProjected ? records : records.filter(r => r.is_actual);

  const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v || 0);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading cash flows...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cash Flow</h1>
          <p className="text-sm text-gray-500 mt-1">Track inflows, outflows, and project cash position</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showProjected}
              onChange={(e) => setShowProjected(e.target.checked)}
              className="rounded border-gray-300"
            />
            Show Projected
          </label>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white border rounded-lg p-3">
          <div className="flex items-center gap-1 text-green-600 text-xs font-medium mb-1">
            <ArrowDown className="w-3 h-3" /> TOTAL INFLOWS
          </div>
          <div className="text-lg font-bold text-green-700">{fmt(summary.totalInflows)}</div>
        </div>
        <div className="bg-white border rounded-lg p-3">
          <div className="flex items-center gap-1 text-red-600 text-xs font-medium mb-1">
            <ArrowUp className="w-3 h-3" /> TOTAL OUTFLOWS
          </div>
          <div className="text-lg font-bold text-red-700">{fmt(summary.totalOutflows)}</div>
        </div>
        <div className="bg-white border rounded-lg p-3">
          <div className="flex items-center gap-1 text-gray-600 text-xs font-medium mb-1">
            <TrendingUp className="w-3 h-3" /> NET CASH FLOW
          </div>
          <div className={`text-lg font-bold ${summary.netCashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {fmt(summary.netCashFlow)}
          </div>
        </div>
        <div className="bg-white border rounded-lg p-3">
          <div className="flex items-center gap-1 text-blue-600 text-xs font-medium mb-1">
            <DollarSign className="w-3 h-3" /> CURRENT CASH
          </div>
          <div className="text-lg font-bold text-blue-700">{fmt(summary.currentCash)}</div>
        </div>
        <div className="bg-white border rounded-lg p-3">
          <div className="flex items-center gap-1 text-green-600 text-xs font-medium mb-1">
            <TrendingUp className="w-3 h-3" /> PEAK CASH
          </div>
          <div className="text-lg font-bold text-green-700">{fmt(summary.peakCash)}</div>
        </div>
        <div className="bg-white border rounded-lg p-3">
          <div className="flex items-center gap-1 text-gray-500 text-xs font-medium mb-1">
            <Calendar className="w-3 h-3" /> PERIODS
          </div>
          <div className="text-lg font-bold text-gray-700">
            {summary.actualPeriods}
            <span className="text-sm font-normal text-gray-500"> actual</span>
            {summary.projectedPeriods > 0 && (
              <span className="text-sm font-normal text-gray-400"> + {summary.projectedPeriods} proj</span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100">
          <TabsTrigger value="waterfall">Waterfall</TabsTrigger>
          <TabsTrigger value="detail">Detail Table</TabsTrigger>
          <TabsTrigger value="breakdown">Category Breakdown</TabsTrigger>
        </TabsList>

        {/* Waterfall Tab */}
        <TabsContent value="waterfall" className="mt-4">
          <WaterfallChart records={displayRecords} fmt={fmt} />
        </TabsContent>

        {/* Detail Table Tab */}
        <TabsContent value="detail" className="mt-4">
          <DetailTable records={displayRecords} fmt={fmt} />
        </TabsContent>

        {/* Breakdown Tab */}
        <TabsContent value="breakdown" className="mt-4">
          <CategoryBreakdown records={displayRecords} fmt={fmt} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Waterfall Chart ────────────────────────────────────────────────────────

function WaterfallChart({ records, fmt }) {
  const maxAbs = useMemo(() => {
    if (records.length === 0) return 1;
    const values = records.map(r => {
      const t = calculateRecordTotals(r);
      return Math.max(Math.abs(t.totalInflows), Math.abs(t.totalOutflows), Math.abs(t.endingCash));
    });
    return Math.max(...values, 1);
  }, [records]);

  const barHeight = (value) => `${Math.min(Math.abs(value) / maxAbs * 100, 100)}%`;

  return (
    <div className="bg-white border rounded-lg p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Cash Flow Waterfall</h3>
      <div className="flex items-end gap-1 h-64 overflow-x-auto pb-2">
        {records.map((record, i) => {
          const totals = calculateRecordTotals(record);
          const monthLabel = new Date(record.period_start).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          return (
            <div key={record.id} className="flex flex-col items-center min-w-[60px] flex-1 h-full relative group">
              {/* Bars container - positioned from center */}
              <div className="flex-1 w-full flex items-end justify-center gap-0.5 relative">
                {/* Inflow bar */}
                <div className="w-5 flex flex-col justify-end h-full">
                  <div
                    className="bg-green-400 rounded-t-sm transition-all hover:bg-green-500"
                    style={{ height: barHeight(totals.totalInflows) }}
                    title={`Inflows: ${fmt(totals.totalInflows)}`}
                  />
                </div>
                {/* Outflow bar */}
                <div className="w-5 flex flex-col justify-end h-full">
                  <div
                    className="bg-red-400 rounded-t-sm transition-all hover:bg-red-500"
                    style={{ height: barHeight(totals.totalOutflows) }}
                    title={`Outflows: ${fmt(totals.totalOutflows)}`}
                  />
                </div>
                {/* Cash position line */}
                <div
                  className="absolute right-0 left-0 h-0.5 bg-blue-600"
                  style={{ bottom: barHeight(Math.max(totals.endingCash, 0)) }}
                />
              </div>
              {/* Label */}
              <div className={`text-xs mt-1 ${record.is_actual ? 'text-gray-700 font-medium' : 'text-gray-400 italic'}`}>
                {monthLabel}
              </div>
              {/* Tooltip on hover */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                <div>In: {fmt(totals.totalInflows)}</div>
                <div>Out: {fmt(totals.totalOutflows)}</div>
                <div>Net: {fmt(totals.netCashFlow)}</div>
                <div>Cash: {fmt(totals.endingCash)}</div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex gap-4 mt-3 text-xs text-gray-500 border-t pt-3">
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-400 rounded-sm" /> Inflows</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-400 rounded-sm" /> Outflows</span>
        <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-blue-600" /> Cash Position</span>
        <span className="flex items-center gap-1 ml-auto"><span className="font-medium text-gray-700">Bold</span> = Actual</span>
        <span className="flex items-center gap-1"><span className="italic text-gray-400">Italic</span> = Projected</span>
      </div>
    </div>
  );
}

// ─── Detail Table ───────────────────────────────────────────────────────────

function DetailTable({ records, fmt }) {
  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b text-left text-xs font-medium text-gray-500 uppercase">
              <th className="px-3 py-2 sticky left-0 bg-gray-50">Period</th>
              <th className="px-3 py-2 text-right">Begin Cash</th>
              <th className="px-3 py-2 text-right text-green-700">Loan Draws</th>
              <th className="px-3 py-2 text-right text-green-700">Equity</th>
              <th className="px-3 py-2 text-right text-green-700">Sales</th>
              <th className="px-3 py-2 text-right text-green-700">Other In</th>
              <th className="px-3 py-2 text-right font-bold text-green-800">Total In</th>
              <th className="px-3 py-2 text-right text-red-700">Land</th>
              <th className="px-3 py-2 text-right text-red-700">Hard Costs</th>
              <th className="px-3 py-2 text-right text-red-700">Soft Costs</th>
              <th className="px-3 py-2 text-right text-red-700">Interest</th>
              <th className="px-3 py-2 text-right text-red-700">Fees</th>
              <th className="px-3 py-2 text-right text-red-700">Distrib.</th>
              <th className="px-3 py-2 text-right font-bold text-red-800">Total Out</th>
              <th className="px-3 py-2 text-right font-bold">Net CF</th>
              <th className="px-3 py-2 text-right font-bold text-blue-700">End Cash</th>
              <th className="px-3 py-2">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y font-mono">
            {records.map(record => {
              const totals = calculateRecordTotals(record);
              const monthLabel = new Date(record.period_start).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
              return (
                <tr key={record.id} className={record.is_actual ? '' : 'bg-gray-50/50'}>
                  <td className="px-3 py-1.5 sticky left-0 bg-white font-sans font-medium">
                    {monthLabel}
                    {record.is_locked && <Lock className="w-3 h-3 inline ml-1 text-gray-400" />}
                  </td>
                  <td className="px-3 py-1.5 text-right">{fmt(record.beginning_cash)}</td>
                  <td className="px-3 py-1.5 text-right text-green-600">{record.loan_draws ? fmt(record.loan_draws) : '—'}</td>
                  <td className="px-3 py-1.5 text-right text-green-600">{record.equity_contributions ? fmt(record.equity_contributions) : '—'}</td>
                  <td className="px-3 py-1.5 text-right text-green-600">{record.sales_proceeds ? fmt(record.sales_proceeds) : '—'}</td>
                  <td className="px-3 py-1.5 text-right text-green-600">{(record.rental_income || record.other_income) ? fmt((record.rental_income || 0) + (record.other_income || 0)) : '—'}</td>
                  <td className="px-3 py-1.5 text-right font-bold text-green-700">{fmt(totals.totalInflows)}</td>
                  <td className="px-3 py-1.5 text-right text-red-600">{record.land_payments ? fmt(record.land_payments) : '—'}</td>
                  <td className="px-3 py-1.5 text-right text-red-600">{record.hard_cost_payments ? fmt(record.hard_cost_payments) : '—'}</td>
                  <td className="px-3 py-1.5 text-right text-red-600">{record.soft_cost_payments ? fmt(record.soft_cost_payments) : '—'}</td>
                  <td className="px-3 py-1.5 text-right text-red-600">{record.interest_payments ? fmt(record.interest_payments) : '—'}</td>
                  <td className="px-3 py-1.5 text-right text-red-600">{record.loan_fees ? fmt(record.loan_fees) : '—'}</td>
                  <td className="px-3 py-1.5 text-right text-red-600">{record.distributions ? fmt(record.distributions) : '—'}</td>
                  <td className="px-3 py-1.5 text-right font-bold text-red-700">{fmt(totals.totalOutflows)}</td>
                  <td className={`px-3 py-1.5 text-right font-bold ${totals.netCashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {fmt(totals.netCashFlow)}
                  </td>
                  <td className="px-3 py-1.5 text-right font-bold text-blue-700">{fmt(totals.endingCash)}</td>
                  <td className="px-3 py-1.5 font-sans">
                    <Badge variant="outline" className={`text-[10px] ${record.is_actual ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                      {record.is_actual ? 'Actual' : 'Proj'}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 font-bold text-xs font-mono">
              <td className="px-3 py-2 font-sans">TOTALS</td>
              <td></td>
              <td className="px-3 py-2 text-right text-green-700">{fmt(records.reduce((s, r) => s + (r.loan_draws || 0), 0))}</td>
              <td className="px-3 py-2 text-right text-green-700">{fmt(records.reduce((s, r) => s + (r.equity_contributions || 0), 0))}</td>
              <td className="px-3 py-2 text-right text-green-700">{fmt(records.reduce((s, r) => s + (r.sales_proceeds || 0), 0))}</td>
              <td className="px-3 py-2 text-right text-green-700">{fmt(records.reduce((s, r) => s + (r.rental_income || 0) + (r.other_income || 0), 0))}</td>
              <td className="px-3 py-2 text-right text-green-800">{fmt(records.reduce((s, r) => s + calculateRecordTotals(r).totalInflows, 0))}</td>
              <td className="px-3 py-2 text-right text-red-700">{fmt(records.reduce((s, r) => s + (r.land_payments || 0), 0))}</td>
              <td className="px-3 py-2 text-right text-red-700">{fmt(records.reduce((s, r) => s + (r.hard_cost_payments || 0), 0))}</td>
              <td className="px-3 py-2 text-right text-red-700">{fmt(records.reduce((s, r) => s + (r.soft_cost_payments || 0), 0))}</td>
              <td className="px-3 py-2 text-right text-red-700">{fmt(records.reduce((s, r) => s + (r.interest_payments || 0), 0))}</td>
              <td className="px-3 py-2 text-right text-red-700">{fmt(records.reduce((s, r) => s + (r.loan_fees || 0), 0))}</td>
              <td className="px-3 py-2 text-right text-red-700">{fmt(records.reduce((s, r) => s + (r.distributions || 0), 0))}</td>
              <td className="px-3 py-2 text-right text-red-800">{fmt(records.reduce((s, r) => s + calculateRecordTotals(r).totalOutflows, 0))}</td>
              <td className="px-3 py-2 text-right">{fmt(records.reduce((s, r) => s + calculateRecordTotals(r).netCashFlow, 0))}</td>
              <td></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ─── Category Breakdown ─────────────────────────────────────────────────────

function CategoryBreakdown({ records, fmt }) {
  const inflowTotals = useMemo(() => {
    return INFLOW_CATEGORIES.map(cat => ({
      ...cat,
      total: records.reduce((s, r) => s + (r[cat.key] || 0), 0),
    })).filter(c => c.total > 0);
  }, [records]);

  const outflowTotals = useMemo(() => {
    return OUTFLOW_CATEGORIES.map(cat => ({
      ...cat,
      total: records.reduce((s, r) => s + (r[cat.key] || 0), 0),
    })).filter(c => c.total > 0);
  }, [records]);

  const maxInflow = Math.max(...inflowTotals.map(c => c.total), 1);
  const maxOutflow = Math.max(...outflowTotals.map(c => c.total), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Inflows */}
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-1">Inflows by Category</h3>
        <p className="text-xs text-gray-500 mb-4">Total: {fmt(inflowTotals.reduce((s, c) => s + c.total, 0))}</p>
        <div className="space-y-3">
          {inflowTotals.map(cat => (
            <div key={cat.key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">{cat.label}</span>
                <span className="font-mono font-medium text-green-700">{fmt(cat.total)}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full"
                  style={{ width: `${(cat.total / maxInflow) * 100}%`, backgroundColor: cat.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Outflows */}
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-1">Outflows by Category</h3>
        <p className="text-xs text-gray-500 mb-4">Total: {fmt(outflowTotals.reduce((s, c) => s + c.total, 0))}</p>
        <div className="space-y-3">
          {outflowTotals.map(cat => (
            <div key={cat.key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">{cat.label}</span>
                <span className="font-mono font-medium text-red-700">{fmt(cat.total)}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full"
                  style={{ width: `${(cat.total / maxOutflow) * 100}%`, backgroundColor: cat.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
