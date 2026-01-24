// src/pages/projects/ProForma/ProFormaPage.jsx
import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign, TrendingUp, PiggyBank, Building2, BarChart3,
  Calculator, LineChart, ArrowUpDown, Plus, Check, ChevronRight,
} from 'lucide-react';
import { useProjectProformas, useActiveProforma, useProformaActions } from '@/hooks/useProforma';
import { calculateProFormaMetrics, calculateAmortization } from '@/services/proformaService';

export default function ProFormaPage() {
  const { projectId } = useParams();
  const pid = projectId || 'demo-project-1';
  const { proformas, loading: listLoading, refetch } = useProjectProformas(pid);
  const { proforma, metrics, loading } = useActiveProforma(pid);
  const { setActive } = useProformaActions(pid);
  const [activeTab, setActiveTab] = useState('summary');
  const [selectedVersion, setSelectedVersion] = useState(null);

  const displayProforma = selectedVersion
    ? proformas.find(p => p.id === selectedVersion) || proforma
    : proforma;

  const displayMetrics = useMemo(() => {
    if (!displayProforma) return null;
    return calculateProFormaMetrics(displayProforma);
  }, [displayProforma]);

  const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v || 0);
  const pct = (v) => `${((v || 0) * 100).toFixed(1)}%`;

  if (loading || listLoading) {
    return <div className="p-6 text-gray-500">Loading pro forma...</div>;
  }

  if (!displayProforma || !displayMetrics) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pro Forma</h1>
        <p className="text-gray-500">No pro forma scenarios created yet.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pro Forma Analysis</h1>
          <p className="text-sm text-gray-500 mt-1">Financial modeling and return projections</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Version Selector */}
          <select
            value={selectedVersion || displayProforma.id}
            onChange={(e) => setSelectedVersion(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            {proformas.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} (v{p.version}){p.is_active ? ' ★' : ''}
              </option>
            ))}
          </select>
          {selectedVersion && selectedVersion !== proforma?.id && (
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await setActive(selectedVersion);
                refetch();
              }}
            >
              <Check className="w-3.5 h-3.5 mr-1" /> Set Active
            </Button>
          )}
        </div>
      </div>

      {/* Key Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <MetricCard label="Total Cost" value={fmt(displayMetrics.totalCosts)} icon={Building2} />
        <MetricCard label="Total Revenue" value={fmt(displayMetrics.totalRevenue)} icon={DollarSign} color="green" />
        <MetricCard label="Net Profit" value={fmt(displayMetrics.netProfit)} icon={TrendingUp} color={displayMetrics.netProfit > 0 ? 'green' : 'red'} />
        <MetricCard label="Gross Margin" value={pct(displayMetrics.grossMargin)} icon={BarChart3} />
        <MetricCard label="IRR" value={pct(displayMetrics.projectIRR)} icon={LineChart} color="blue" />
        <MetricCard label="Equity Multiple" value={`${displayMetrics.equityMultiple.toFixed(2)}x`} icon={ArrowUpDown} color="purple" />
        <MetricCard label="Cash on Cash" value={pct(displayMetrics.cashOnCash)} icon={PiggyBank} />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="uses">Uses of Funds</TabsTrigger>
          <TabsTrigger value="sources">Sources of Funds</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="returns">Returns</TabsTrigger>
          <TabsTrigger value="sensitivity">Sensitivity</TabsTrigger>
        </TabsList>

        {/* SUMMARY TAB */}
        <TabsContent value="summary" className="mt-4">
          <SummaryTab proforma={displayProforma} metrics={displayMetrics} fmt={fmt} pct={pct} />
        </TabsContent>

        {/* USES OF FUNDS TAB */}
        <TabsContent value="uses" className="mt-4">
          <UsesOfFundsTab proforma={displayProforma} metrics={displayMetrics} fmt={fmt} pct={pct} />
        </TabsContent>

        {/* SOURCES OF FUNDS TAB */}
        <TabsContent value="sources" className="mt-4">
          <SourcesOfFundsTab proforma={displayProforma} metrics={displayMetrics} fmt={fmt} pct={pct} />
        </TabsContent>

        {/* REVENUE TAB */}
        <TabsContent value="revenue" className="mt-4">
          <RevenueTab proforma={displayProforma} metrics={displayMetrics} fmt={fmt} pct={pct} />
        </TabsContent>

        {/* CASH FLOW TAB */}
        <TabsContent value="cashflow" className="mt-4">
          <CashFlowTab proforma={displayProforma} metrics={displayMetrics} fmt={fmt} />
        </TabsContent>

        {/* RETURNS TAB */}
        <TabsContent value="returns" className="mt-4">
          <ReturnsTab proforma={displayProforma} metrics={displayMetrics} fmt={fmt} pct={pct} />
        </TabsContent>

        {/* SENSITIVITY TAB */}
        <TabsContent value="sensitivity" className="mt-4">
          <SensitivityTab proforma={displayProforma} metrics={displayMetrics} fmt={fmt} pct={pct} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Metric Card ────────────────────────────────────────────────────────────

function MetricCard({ label, value, icon: Icon, color = 'gray' }) {
  const colors = {
    gray: 'text-gray-600',
    green: 'text-green-700',
    red: 'text-red-700',
    blue: 'text-blue-700',
    purple: 'text-purple-700',
  };
  return (
    <div className="bg-white border rounded-lg p-3">
      <div className="flex items-center gap-1 text-xs text-gray-500 font-medium mb-1">
        <Icon className="w-3 h-3" /> {label}
      </div>
      <div className={`text-lg font-bold ${colors[color]}`}>{value}</div>
    </div>
  );
}

// ─── Summary Tab ────────────────────────────────────────────────────────────

function SummaryTab({ proforma, metrics, fmt, pct }) {
  const { assumptions, costs, financing, revenue } = proforma;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Project Assumptions */}
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Project Assumptions</h3>
        <div className="space-y-2 text-sm">
          <Row label="Timeline" value={`${assumptions.project_timeline_months} months`} />
          <Row label="Construction Start" value={assumptions.construction_start_date} />
          <Row label="Completion" value={assumptions.completion_date} />
          <Row label="Sale Date" value={assumptions.sale_date} />
          <Row label="Hold Period" value={`${assumptions.hold_period_months} months`} />
          <Row label="Sale Price" value={fmt(assumptions.sale_price)} />
          <Row label="Price/Unit" value={fmt(assumptions.sale_price_per_unit)} />
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Financial Summary</h3>
        <div className="space-y-2 text-sm">
          <Row label="Total Project Cost" value={fmt(metrics.totalCosts)} bold />
          <Row label="Total Revenue" value={fmt(metrics.totalRevenue)} />
          <Row label="Gross Profit" value={fmt(metrics.grossProfit)} color={metrics.grossProfit > 0 ? 'green' : 'red'} />
          <Row label="Financing Costs" value={fmt(metrics.totalInterest)} />
          <Row label="Net Profit" value={fmt(metrics.netProfit)} bold color={metrics.netProfit > 0 ? 'green' : 'red'} />
          <div className="border-t pt-2 mt-2">
            <Row label="Total Debt" value={fmt(metrics.totalDebt)} />
            <Row label="Total Equity" value={fmt(metrics.totalEquity)} />
            <Row label="LTC Ratio" value={pct(metrics.ltcRatio)} />
          </div>
        </div>
      </div>

      {/* Return Metrics */}
      <div className="bg-white border rounded-lg p-5 lg:col-span-2">
        <h3 className="font-semibold text-gray-900 mb-4">Return Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-700">{pct(metrics.projectIRR)}</div>
            <div className="text-sm text-gray-500 mt-1">Project IRR</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-700">{metrics.equityMultiple.toFixed(2)}x</div>
            <div className="text-sm text-gray-500 mt-1">Equity Multiple</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-700">{pct(metrics.cashOnCash)}</div>
            <div className="text-sm text-gray-500 mt-1">Cash on Cash</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-700">{fmt(metrics.npv10)}</div>
            <div className="text-sm text-gray-500 mt-1">NPV (10% disc.)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Uses of Funds Tab ──────────────────────────────────────────────────────

function UsesOfFundsTab({ proforma, metrics, fmt, pct }) {
  const { costs } = proforma;
  const items = [
    { label: 'Land Acquisition', amount: costs.land_cost },
    { label: 'Hard Costs', amount: costs.hard_costs },
    { label: 'Soft Costs', amount: costs.soft_costs },
    { label: 'Financing Costs', amount: costs.financing_costs },
    { label: 'Contingency', amount: costs.contingency },
  ];

  return (
    <div className="bg-white border rounded-lg p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Uses of Funds (Development Budget)</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs font-medium text-gray-500 uppercase">
            <th className="pb-2">Category</th>
            <th className="pb-2 text-right">Amount</th>
            <th className="pb-2 text-right">% of Total</th>
            <th className="pb-2 w-48">Distribution</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((item) => {
            const percent = metrics.totalCosts > 0 ? (item.amount || 0) / metrics.totalCosts : 0;
            return (
              <tr key={item.label}>
                <td className="py-3 font-medium text-gray-900">{item.label}</td>
                <td className="py-3 text-right font-mono">{fmt(item.amount)}</td>
                <td className="py-3 text-right text-gray-600">{pct(percent)}</td>
                <td className="py-3">
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.min(percent * 100, 100)}%` }}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 font-bold">
            <td className="pt-3">Total Project Cost</td>
            <td className="pt-3 text-right font-mono">{fmt(metrics.totalCosts)}</td>
            <td className="pt-3 text-right">100%</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ─── Sources of Funds Tab ───────────────────────────────────────────────────

function SourcesOfFundsTab({ proforma, metrics, fmt, pct }) {
  const { financing } = proforma;
  const loans = financing.loans || [];
  const equity = financing.equity || {};

  return (
    <div className="space-y-6">
      {/* Debt */}
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Debt</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs font-medium text-gray-500 uppercase">
              <th className="pb-2">Loan</th>
              <th className="pb-2">Type</th>
              <th className="pb-2 text-right">Amount</th>
              <th className="pb-2 text-right">Rate</th>
              <th className="pb-2 text-right">Term</th>
              <th className="pb-2 text-right">I/O Period</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loans.map((loan) => (
              <tr key={loan.id}>
                <td className="py-3 font-medium text-gray-900">{loan.name}</td>
                <td className="py-3 capitalize text-gray-600">{loan.type}</td>
                <td className="py-3 text-right font-mono">{fmt(loan.amount)}</td>
                <td className="py-3 text-right">{pct(loan.interest_rate)}</td>
                <td className="py-3 text-right">{loan.term_months}mo</td>
                <td className="py-3 text-right">{loan.io_months}mo</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t font-bold">
              <td className="pt-3" colSpan={2}>Total Debt</td>
              <td className="pt-3 text-right font-mono">{fmt(metrics.totalDebt)}</td>
              <td colSpan={3}></td>
            </tr>
          </tfoot>
        </table>
        <div className="mt-3 text-sm text-gray-600">
          LTC Ratio: <span className="font-semibold">{pct(metrics.ltcRatio)}</span>
        </div>
      </div>

      {/* Equity */}
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Equity</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-500 text-xs uppercase mb-1">Total Equity Required</div>
            <div className="text-lg font-bold">{fmt(equity.total_equity_required)}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs uppercase mb-1">Investor Equity</div>
            <div className="text-lg font-bold">{fmt(equity.investor_equity)}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs uppercase mb-1">Sponsor Equity</div>
            <div className="text-lg font-bold">{fmt(equity.sponsor_equity)}</div>
          </div>
        </div>
        {equity.preferred_return && (
          <div className="mt-3 text-sm text-gray-600">
            Preferred Return: <span className="font-semibold">{pct(equity.preferred_return)}</span>
          </div>
        )}
        {equity.promote_structure && (
          <div className="mt-2">
            <div className="text-xs text-gray-500 uppercase mb-1">Promote Structure</div>
            <div className="flex gap-3">
              {equity.promote_structure.map((tier, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  &gt;{pct(tier.hurdle)} → {pct(tier.split)} promote
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Capital Stack Bar */}
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Capital Stack</h3>
        <div className="h-8 rounded-lg overflow-hidden flex">
          {loans.map((loan, i) => (
            <div
              key={loan.id}
              className={`flex items-center justify-center text-xs text-white font-medium ${i === 0 ? 'bg-blue-600' : 'bg-blue-400'}`}
              style={{ width: `${(loan.amount / metrics.totalCosts) * 100}%` }}
              title={`${loan.name}: ${fmt(loan.amount)}`}
            >
              {loan.name}
            </div>
          ))}
          <div
            className="bg-green-600 flex items-center justify-center text-xs text-white font-medium"
            style={{ width: `${(metrics.totalEquity / metrics.totalCosts) * 100}%` }}
            title={`Equity: ${fmt(metrics.totalEquity)}`}
          >
            Equity
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Debt: {pct(metrics.ltcRatio)}</span>
          <span>Equity: {pct(1 - metrics.ltcRatio)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Revenue Tab ────────────────────────────────────────────────────────────

function RevenueTab({ proforma, metrics, fmt, pct }) {
  const { revenue, assumptions } = proforma;

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Revenue Projections</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <div className="text-gray-500 text-xs uppercase mb-1">Sale Type</div>
            <div className="font-semibold capitalize">{revenue.type || 'Sale'}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs uppercase mb-1">Units</div>
            <div className="font-semibold">{revenue.units || '—'}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs uppercase mb-1">Avg Price/Unit</div>
            <div className="font-semibold">{fmt(revenue.avg_price_per_unit)}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs uppercase mb-1">Sale Date</div>
            <div className="font-semibold">{assumptions.sale_date || '—'}</div>
          </div>
        </div>

        <table className="w-full text-sm">
          <tbody className="divide-y">
            <tr>
              <td className="py-2 text-gray-700">Gross Revenue</td>
              <td className="py-2 text-right font-mono font-medium">{fmt(revenue.total_revenue)}</td>
            </tr>
            <tr>
              <td className="py-2 text-gray-700 pl-4">Less: Closing Costs ({pct(assumptions.closing_cost_percent)})</td>
              <td className="py-2 text-right font-mono text-red-600">({fmt(revenue.closing_costs)})</td>
            </tr>
            <tr>
              <td className="py-2 text-gray-700 pl-4">Less: Broker Commission ({pct(assumptions.broker_commission)})</td>
              <td className="py-2 text-right font-mono text-red-600">({fmt(revenue.broker_commission)})</td>
            </tr>
            <tr className="font-bold border-t-2">
              <td className="py-2 text-gray-900">Net Revenue</td>
              <td className="py-2 text-right font-mono text-green-700">{fmt(revenue.net_revenue)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Profit Waterfall */}
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Profit Waterfall</h3>
        <div className="space-y-2 text-sm">
          <WaterfallRow label="Net Revenue" value={revenue.net_revenue} fmt={fmt} type="positive" />
          <WaterfallRow label="Total Project Cost" value={-metrics.totalCosts} fmt={fmt} type="negative" />
          <WaterfallRow label="Gross Profit" value={metrics.grossProfit} fmt={fmt} type="subtotal" />
          <WaterfallRow label="Interest Costs" value={-metrics.totalInterest} fmt={fmt} type="negative" />
          <WaterfallRow label="Net Profit" value={metrics.netProfit} fmt={fmt} type="total" />
        </div>
      </div>
    </div>
  );
}

// ─── Cash Flow Tab ──────────────────────────────────────────────────────────

function CashFlowTab({ proforma, metrics, fmt }) {
  const { assumptions, financing } = proforma;
  const months = assumptions.project_timeline_months || 18;
  const totalDebt = metrics.totalDebt;
  const avgRate = (financing.loans || []).reduce((s, l) => s + (l.interest_rate || 0) * (l.amount / totalDebt || 0), 0);

  // Generate simplified monthly cash flow
  const cashFlows = useMemo(() => {
    const flows = [];
    const monthlyDraw = metrics.totalCosts / months;
    const monthlyInterest = totalDebt * avgRate / 12;
    let cumulative = -metrics.totalEquity;

    for (let m = 1; m <= months; m++) {
      const isLast = m === months;
      const revenue = isLast ? metrics.totalRevenue : 0;
      const debtRepay = isLast ? -totalDebt : 0;
      const net = (isLast ? revenue + debtRepay : 0) - monthlyInterest;
      cumulative += net;
      flows.push({
        month: m,
        draw: monthlyDraw,
        interest: monthlyInterest,
        revenue,
        debtRepay: isLast ? totalDebt : 0,
        net,
        cumulative,
      });
    }
    return flows;
  }, [months, metrics, totalDebt, avgRate]);

  return (
    <div className="bg-white border rounded-lg p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Monthly Cash Flow Projection</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b text-left text-xs font-medium text-gray-500 uppercase">
              <th className="pb-2 pr-4">Month</th>
              <th className="pb-2 pr-4 text-right">Draw</th>
              <th className="pb-2 pr-4 text-right">Interest</th>
              <th className="pb-2 pr-4 text-right">Revenue</th>
              <th className="pb-2 pr-4 text-right">Debt Repay</th>
              <th className="pb-2 pr-4 text-right">Net Cash Flow</th>
              <th className="pb-2 text-right">Cumulative</th>
            </tr>
          </thead>
          <tbody className="divide-y font-mono">
            {cashFlows.map((cf) => (
              <tr key={cf.month} className={cf.month === months ? 'bg-green-50 font-medium' : ''}>
                <td className="py-1.5 pr-4">{cf.month}</td>
                <td className="py-1.5 pr-4 text-right text-gray-600">{fmt(cf.draw)}</td>
                <td className="py-1.5 pr-4 text-right text-red-600">({fmt(cf.interest)})</td>
                <td className="py-1.5 pr-4 text-right text-green-600">{cf.revenue > 0 ? fmt(cf.revenue) : '—'}</td>
                <td className="py-1.5 pr-4 text-right text-red-600">{cf.debtRepay > 0 ? `(${fmt(cf.debtRepay)})` : '—'}</td>
                <td className={`py-1.5 pr-4 text-right font-medium ${cf.net >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {fmt(cf.net)}
                </td>
                <td className={`py-1.5 text-right ${cf.cumulative >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {fmt(cf.cumulative)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Returns Tab ────────────────────────────────────────────────────────────

function ReturnsTab({ proforma, metrics, fmt, pct }) {
  const { financing } = proforma;
  const equity = financing.equity || {};

  return (
    <div className="space-y-6">
      {/* Return Metrics */}
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Return Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <ReturnMetric label="Project IRR" value={pct(metrics.projectIRR)} sub="Annualized" />
          <ReturnMetric label="Equity Multiple" value={`${metrics.equityMultiple.toFixed(2)}x`} sub={`on ${fmt(metrics.totalEquity)}`} />
          <ReturnMetric label="Cash on Cash" value={pct(metrics.cashOnCash)} sub="Return on equity" />
          <ReturnMetric label="NPV @ 10%" value={fmt(metrics.npv10)} sub="Discount rate 10%" />
        </div>
      </div>

      {/* Profit Distribution */}
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Profit Distribution</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-700">Net Profit</span>
            <span className="font-bold">{fmt(metrics.netProfit)}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-700">Return of Equity</span>
            <span className="font-medium">{fmt(metrics.totalEquity)}</span>
          </div>
          {equity.preferred_return && (
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-700">Preferred Return ({pct(equity.preferred_return)})</span>
              <span className="font-medium">
                {fmt(metrics.totalEquity * equity.preferred_return * (metrics.termMonths / 12))}
              </span>
            </div>
          )}
          <div className="flex justify-between py-2 font-bold">
            <span>Total Distributions</span>
            <span className="text-green-700">{fmt(metrics.totalEquity + metrics.netProfit)}</span>
          </div>
        </div>
      </div>

      {/* Investor vs Sponsor */}
      {equity.investor_equity && (
        <div className="bg-white border rounded-lg p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Investor vs Sponsor Split</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600 font-medium mb-1">Investor</div>
              <div className="text-xl font-bold text-blue-800">{fmt(equity.investor_equity)}</div>
              <div className="text-xs text-blue-600 mt-1">
                {pct(equity.investor_equity / metrics.totalEquity)} of equity
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-green-600 font-medium mb-1">Sponsor</div>
              <div className="text-xl font-bold text-green-800">{fmt(equity.sponsor_equity)}</div>
              <div className="text-xs text-green-600 mt-1">
                {pct(equity.sponsor_equity / metrics.totalEquity)} of equity
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sensitivity Tab ────────────────────────────────────────────────────────

function SensitivityTab({ proforma, metrics, fmt, pct }) {
  // Generate sensitivity matrix: Revenue vs Cost changes
  const scenarios = useMemo(() => {
    const revenueChanges = [-0.15, -0.10, -0.05, 0, 0.05, 0.10, 0.15];
    const costChanges = [-0.10, -0.05, 0, 0.05, 0.10];
    const { totalCosts, totalRevenue, totalEquity, totalInterest } = metrics;

    return costChanges.map(costDelta => ({
      costDelta,
      scenarios: revenueChanges.map(revDelta => {
        const adjCost = totalCosts * (1 + costDelta);
        const adjRevenue = totalRevenue * (1 + revDelta);
        const profit = adjRevenue - adjCost - totalInterest;
        const equityMult = totalEquity > 0 ? (totalEquity + profit) / totalEquity : 0;
        return { revDelta, profit, equityMult };
      }),
    }));
  }, [metrics]);

  return (
    <div className="bg-white border rounded-lg p-5">
      <h3 className="font-semibold text-gray-900 mb-2">Sensitivity Analysis</h3>
      <p className="text-sm text-gray-500 mb-4">Equity Multiple under different revenue/cost scenarios</p>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="pb-2 pr-3 text-left text-gray-500">Cost \ Revenue</th>
              {[-15, -10, -5, 0, 5, 10, 15].map(r => (
                <th key={r} className="pb-2 px-2 text-center text-gray-500">
                  {r > 0 ? '+' : ''}{r}%
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scenarios.map((row) => (
              <tr key={row.costDelta}>
                <td className="py-1.5 pr-3 font-medium text-gray-700">
                  {row.costDelta > 0 ? '+' : ''}{(row.costDelta * 100).toFixed(0)}%
                </td>
                {row.scenarios.map((s, i) => {
                  const isBase = row.costDelta === 0 && s.revDelta === 0;
                  const bg = s.equityMult >= 2 ? 'bg-green-100 text-green-800'
                    : s.equityMult >= 1.5 ? 'bg-green-50 text-green-700'
                    : s.equityMult >= 1 ? 'bg-yellow-50 text-yellow-800'
                    : 'bg-red-50 text-red-700';
                  return (
                    <td key={i} className={`py-1.5 px-2 text-center font-mono ${bg} ${isBase ? 'ring-2 ring-blue-400 font-bold' : ''}`}>
                      {s.equityMult.toFixed(2)}x
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-100 rounded" /> ≥2.0x</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-50 rounded border" /> ≥1.5x</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-50 rounded border" /> ≥1.0x</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-50 rounded border" /> &lt;1.0x</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 ring-2 ring-blue-400 rounded" /> Base case</span>
      </div>
    </div>
  );
}

// ─── Helper Components ──────────────────────────────────────────────────────

function Row({ label, value, bold, color }) {
  return (
    <div className="flex justify-between py-1">
      <span className={`text-gray-700 ${bold ? 'font-semibold' : ''}`}>{label}</span>
      <span className={`font-mono ${bold ? 'font-bold' : 'font-medium'} ${color === 'green' ? 'text-green-700' : color === 'red' ? 'text-red-700' : 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  );
}

function WaterfallRow({ label, value, fmt, type }) {
  const isNeg = value < 0;
  const colors = {
    positive: 'text-green-700',
    negative: 'text-red-700',
    subtotal: 'text-gray-900 font-semibold border-t',
    total: 'text-green-800 font-bold border-t-2',
  };
  return (
    <div className={`flex justify-between py-2 ${colors[type] || ''}`}>
      <span>{label}</span>
      <span className={`font-mono ${isNeg && type !== 'total' ? 'text-red-600' : ''}`}>
        {isNeg && type !== 'total' ? `(${fmt(Math.abs(value))})` : fmt(value)}
      </span>
    </div>
  );
}

function ReturnMetric({ label, value, sub }) {
  return (
    <div className="text-center p-3 bg-gray-50 rounded-lg">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm font-medium text-gray-700 mt-1">{label}</div>
      {sub && <div className="text-xs text-gray-500">{sub}</div>}
    </div>
  );
}
