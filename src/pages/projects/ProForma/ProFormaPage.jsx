// src/pages/projects/ProForma/ProFormaPage.jsx
// Professional-grade Pro Forma financial modeling interface
import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign, TrendingUp, PiggyBank, Building2, BarChart3,
  Calculator, LineChart, ArrowUpDown, Check, AlertTriangle,
  Landmark, Home, ArrowDown, ArrowUp,
} from 'lucide-react';
import { useProjectProformas, useActiveProforma, useProformaActions } from '@/hooks/useProforma';
import {
  calculateProFormaMetrics, generateMonthlyCashFlows,
  runSensitivityAnalysis, calculateInvestorWaterfall,
} from '@/services/proformaService';

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

  const cashFlows = useMemo(() => {
    if (!displayProforma) return [];
    return generateMonthlyCashFlows(displayProforma);
  }, [displayProforma]);

  const sensitivity = useMemo(() => {
    if (!displayProforma) return null;
    return runSensitivityAnalysis(displayProforma);
  }, [displayProforma]);

  const waterfall = useMemo(() => {
    if (!displayProforma) return null;
    return calculateInvestorWaterfall(displayProforma);
  }, [displayProforma]);

  const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v || 0);
  const fmtDec = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v || 0);
  const pct = (v) => `${((v || 0) * 100).toFixed(1)}%`;
  const pct2 = (v) => `${((v || 0) * 100).toFixed(2)}%`;

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

  const uf = displayProforma.uses_of_funds || displayProforma.costs || {};
  const sf = displayProforma.sources_of_funds || displayProforma.financing || {};
  const rev = displayProforma.revenue_projections || displayProforma.revenue || {};
  const assumptions = displayProforma.assumptions || {};

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pro Forma Analysis</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {assumptions.project_name || 'Project'} — Scattered Lot Build
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={displayProforma.status === 'approved' ? 'bg-green-50 text-green-700 border-green-300' : 'bg-gray-100 text-gray-600'}>
            {displayProforma.status === 'approved' ? 'Approved' : displayProforma.status}
          </Badge>
          <select
            value={selectedVersion || displayProforma.id}
            onChange={(e) => setSelectedVersion(e.target.value)}
            className="border rounded-md px-3 py-1.5 text-sm"
          >
            {proformas.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} (v{p.version}){p.is_active ? ' ★' : ''}
              </option>
            ))}
          </select>
          {selectedVersion && selectedVersion !== proforma?.id && (
            <Button size="sm" variant="outline" onClick={async () => { await setActive(selectedVersion); refetch(); }}>
              <Check className="w-3.5 h-3.5 mr-1" /> Set Active
            </Button>
          )}
        </div>
      </div>

      {/* Key Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        <KPI label="Total Cost" value={fmt(displayMetrics.totalCosts)} icon={Building2} />
        <KPI label="Sale Price" value={fmt(displayMetrics.totalRevenue)} icon={Home} />
        <KPI label="Gross Profit" value={fmt(displayMetrics.grossProfit)} icon={TrendingUp} color={displayMetrics.grossProfit >= 0 ? 'green' : 'red'} />
        <KPI label="Gross Margin" value={pct(displayMetrics.grossMargin)} icon={BarChart3} />
        <KPI label="Equity IRR" value={pct(displayMetrics.equityIRR)} icon={LineChart} color="blue" />
        <KPI label="Equity Multiple" value={`${displayMetrics.equityMultiple.toFixed(2)}x`} icon={ArrowUpDown} color="purple" />
        <KPI label="Timeline" value={`${displayMetrics.termMonths} mo`} icon={Calculator} />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="uses">Uses of Funds</TabsTrigger>
          <TabsTrigger value="sources">Sources of Funds</TabsTrigger>
          <TabsTrigger value="revenue">Revenue & Sale</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="returns">Returns</TabsTrigger>
          <TabsTrigger value="sensitivity">Sensitivity</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-4">
          <SummaryTab proforma={displayProforma} metrics={displayMetrics} waterfall={waterfall} fmt={fmt} pct={pct} />
        </TabsContent>
        <TabsContent value="uses" className="mt-4">
          <UsesOfFundsTab uf={uf} metrics={displayMetrics} assumptions={assumptions} fmt={fmt} pct={pct} />
        </TabsContent>
        <TabsContent value="sources" className="mt-4">
          <SourcesOfFundsTab sf={sf} metrics={displayMetrics} fmt={fmt} pct={pct} pct2={pct2} />
        </TabsContent>
        <TabsContent value="revenue" className="mt-4">
          <RevenueTab rev={rev} assumptions={assumptions} metrics={displayMetrics} fmt={fmt} pct={pct} />
        </TabsContent>
        <TabsContent value="cashflow" className="mt-4">
          <CashFlowTab cashFlows={cashFlows} fmt={fmt} />
        </TabsContent>
        <TabsContent value="returns" className="mt-4">
          <ReturnsTab metrics={displayMetrics} waterfall={waterfall} fmt={fmt} pct={pct} />
        </TabsContent>
        <TabsContent value="sensitivity" className="mt-4">
          <SensitivityTab sensitivity={sensitivity} fmt={fmt} pct={pct} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KPI({ label, value, icon: Icon, color = 'gray' }) {
  const c = { gray: 'text-gray-700', green: 'text-green-700', red: 'text-red-700', blue: 'text-blue-700', purple: 'text-purple-700' };
  return (
    <div className="bg-white border rounded-lg px-3 py-2.5">
      <div className="flex items-center gap-1 text-[10px] text-gray-500 font-semibold uppercase mb-0.5">
        <Icon className="w-3 h-3" />{label}
      </div>
      <div className={`text-base font-bold ${c[color]}`}>{value}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1: SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════

function SummaryTab({ proforma, metrics, waterfall, fmt, pct }) {
  const assumptions = proforma.assumptions || {};
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Profit Analysis */}
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Profit Analysis</h3>
        <div className="space-y-1 text-sm">
          <LabelValue label="Gross Sale Price" value={fmt(metrics.totalRevenue)} />
          <LabelValue label="Less: Sale Costs" value={`(${fmt(metrics.saleCosts)})`} className="text-red-600 pl-3" />
          <LabelValue label="Net Sale Proceeds" value={fmt(metrics.netRevenue)} bold />
          <div className="border-t my-2" />
          <LabelValue label="Less: Total Project Cost" value={`(${fmt(metrics.totalCosts)})`} className="text-red-600" />
          <LabelValue label="Gross Profit" value={fmt(metrics.grossProfit)} bold color={metrics.grossProfit >= 0 ? 'green' : 'red'} />
          <LabelValue label="Gross Margin" value={pct(metrics.grossMargin)} className="text-gray-500 text-xs" />
          <div className="border-t my-2" />
          <LabelValue label="Less: Interest Expense" value={`(${fmt(metrics.totalInterest)})`} className="text-red-600 pl-3" />
          <LabelValue label="Less: Loan Fees" value={`(${fmt(metrics.totalLoanFees)})`} className="text-red-600 pl-3" />
          <LabelValue label="Net Profit" value={fmt(metrics.netProfit)} bold color={metrics.netProfit >= 0 ? 'green' : 'red'} />
          <LabelValue label="Net Margin" value={pct(metrics.netMargin)} className="text-gray-500 text-xs" />
        </div>
      </div>

      {/* Project Info */}
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Project Info</h3>
        <div className="space-y-1 text-sm">
          {assumptions.address && <LabelValue label="Address" value={assumptions.address} />}
          <LabelValue label="Lot Count" value={assumptions.lot_count} />
          <LabelValue label="Sq Footage" value={`${assumptions.square_footage?.toLocaleString()} sf`} />
          <LabelValue label="Bed/Bath" value={`${assumptions.bedrooms}bd / ${assumptions.bathrooms}ba`} />
          <LabelValue label="Construction Start" value={assumptions.construction_start_date} />
          <LabelValue label="Construction Duration" value={`${assumptions.construction_duration_months} months`} />
          <LabelValue label="Total Timeline" value={`${assumptions.total_project_months} months`} />
          <div className="border-t my-2" />
          <LabelValue label="Cost per SF" value={fmt(metrics.costPerSF)} />
          <LabelValue label="Revenue per SF" value={fmt(metrics.totalRevenue / (assumptions.square_footage || 1))} />
          <LabelValue label="Profit per Unit" value={fmt(metrics.profitPerUnit)} />
          <LabelValue label="Project ROI" value={pct(metrics.projectROI)} />
        </div>
      </div>

      {/* Uses vs Sources */}
      <div className="bg-white border rounded-lg p-5 lg:col-span-2">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Capital Stack</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase mb-2">Uses of Funds</div>
            <StackBar items={[
              { label: 'Land', value: metrics.totalCosts > 0 ? (proforma.uses_of_funds?.land_acquisition?.total_land_cost || proforma.costs?.land_cost || 0) / metrics.totalCosts : 0, color: 'bg-amber-500' },
              { label: 'Hard Costs', value: metrics.totalCosts > 0 ? (proforma.uses_of_funds?.hard_costs?.total_hard_costs || proforma.costs?.hard_costs || 0) / metrics.totalCosts : 0, color: 'bg-blue-500' },
              { label: 'Soft Costs', value: metrics.totalCosts > 0 ? (proforma.uses_of_funds?.soft_costs?.total_soft_costs || proforma.costs?.soft_costs || 0) / metrics.totalCosts : 0, color: 'bg-green-500' },
              { label: 'Financing', value: metrics.totalCosts > 0 ? (proforma.uses_of_funds?.financing_costs?.total_financing_costs || proforma.costs?.financing_costs || 0) / metrics.totalCosts : 0, color: 'bg-purple-500' },
            ]} />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase mb-2">Sources of Funds</div>
            <StackBar items={[
              { label: 'Debt', value: metrics.totalCosts > 0 ? metrics.totalDebt / metrics.totalCosts : 0, color: 'bg-blue-600' },
              { label: 'Equity', value: metrics.totalCosts > 0 ? metrics.totalEquity / metrics.totalCosts : 0, color: 'bg-green-600' },
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StackBar({ items }) {
  return (
    <div>
      <div className="h-6 rounded-lg overflow-hidden flex mb-2">
        {items.filter(i => i.value > 0).map((item, idx) => (
          <div key={idx} className={`${item.color} flex items-center justify-center text-[10px] text-white font-medium`} style={{ width: `${item.value * 100}%` }}>
            {item.value > 0.1 ? `${(item.value * 100).toFixed(0)}%` : ''}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 text-xs">
        {items.filter(i => i.value > 0).map((item, idx) => (
          <span key={idx} className="flex items-center gap-1">
            <span className={`w-2.5 h-2.5 rounded-sm ${item.color}`} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2: USES OF FUNDS
// ═══════════════════════════════════════════════════════════════════════════════

function UsesOfFundsTab({ uf, metrics, assumptions, fmt, pct }) {
  const land = uf.land_acquisition || {};
  const hard = uf.hard_costs || {};
  const soft = uf.soft_costs || {};
  const fin = uf.financing_costs || {};
  const sf = assumptions.square_footage || 1;
  const total = metrics.totalCosts;

  const sections = [
    {
      title: 'Land Acquisition',
      items: [
        { label: 'Purchase Price', value: land.purchase_price },
        { label: 'Closing Costs', value: land.closing_costs },
        { label: 'Due Diligence', value: land.due_diligence_costs },
      ],
      subtotal: { label: 'Total Land Cost', value: land.total_land_cost },
    },
    {
      title: 'Hard Costs - Site Work',
      items: [
        { label: 'Site Preparation', value: hard.site_preparation },
        { label: 'Excavation & Grading', value: hard.excavation_grading },
        { label: 'Utilities Connections', value: hard.utilities_connections },
        { label: 'Driveway & Sidewalks', value: hard.driveway_sidewalks },
        { label: 'Landscaping', value: hard.landscaping },
      ],
      subtotal: { label: 'Site Work Subtotal', value: hard.site_work_subtotal },
    },
    {
      title: 'Hard Costs - Vertical Construction',
      items: [
        { label: 'Foundation', value: hard.foundation },
        { label: 'Framing (Labor)', value: hard.framing_labor },
        { label: 'Framing (Materials)', value: hard.framing_materials },
        { label: 'Roofing', value: hard.roofing },
        { label: 'Windows & Doors', value: hard.windows_doors },
        { label: 'Siding / Exterior', value: hard.siding_exterior },
        { label: 'Plumbing (Rough)', value: hard.plumbing_rough },
        { label: 'Electrical (Rough)', value: hard.electrical_rough },
        { label: 'HVAC (Rough)', value: hard.hvac_rough },
        { label: 'Insulation', value: hard.insulation },
        { label: 'Drywall', value: hard.drywall },
        { label: 'Interior Trim', value: hard.interior_trim },
        { label: 'Cabinets', value: hard.cabinets },
        { label: 'Countertops', value: hard.countertops },
        { label: 'Flooring', value: hard.flooring },
        { label: 'Plumbing (Finish)', value: hard.plumbing_finish },
        { label: 'Electrical (Finish)', value: hard.electrical_finish },
        { label: 'HVAC (Finish)', value: hard.hvac_finish },
        { label: 'Painting', value: hard.painting },
        { label: 'Appliances', value: hard.appliances },
        { label: 'Fixtures & Hardware', value: hard.fixtures_hardware },
        { label: 'Garage Door', value: hard.garage_door },
        { label: 'Final Cleanup', value: hard.cleanup_final },
      ],
      subtotal: { label: 'Vertical Subtotal', value: hard.vertical_subtotal },
    },
    {
      title: 'Hard Costs - Other',
      items: [
        { label: 'Permits & Fees', value: hard.permits_fees },
        { label: 'Utility Impact Fees', value: hard.utility_impact_fees },
        { label: 'Other Hard Costs', value: hard.other_hard_costs },
        { label: `Contingency (${((hard.hard_cost_contingency_percent || 0) * 100).toFixed(0)}%)`, value: hard.hard_cost_contingency },
      ],
      subtotal: { label: 'Total Hard Costs', value: hard.total_hard_costs },
    },
    {
      title: 'Soft Costs',
      items: [
        { label: 'Architecture & Design', value: soft.architecture_design },
        { label: 'Engineering', value: soft.engineering },
        { label: 'Surveys', value: soft.surveys },
        { label: 'Permits & Entitlements', value: soft.permits_entitlements },
        { label: 'Legal Fees', value: soft.legal_fees },
        { label: 'Accounting', value: soft.accounting },
        { label: "Builder's Risk Insurance", value: soft.insurance_builders_risk },
        { label: 'Property Taxes (Construction)', value: soft.property_taxes_construction },
        { label: 'Marketing & Advertising', value: soft.marketing_advertising },
        { label: 'Staging', value: soft.staging },
        { label: 'Real Estate Photos', value: soft.real_estate_photos },
        { label: 'Miscellaneous', value: soft.miscellaneous },
        { label: `Contingency (${((soft.soft_cost_contingency_percent || 0) * 100).toFixed(0)}%)`, value: soft.soft_cost_contingency },
      ],
      subtotal: { label: 'Total Soft Costs', value: soft.total_soft_costs },
    },
    {
      title: 'Financing Costs',
      items: [
        { label: 'Origination Fee', value: fin.origination_fee },
        { label: 'Interest Reserve', value: fin.interest_reserve },
        { label: 'Other Loan Fees', value: fin.other_loan_fees },
      ],
      subtotal: { label: 'Total Financing Costs', value: fin.total_financing_costs },
    },
  ];

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b text-left text-xs font-semibold text-gray-500 uppercase">
            <th className="px-4 py-2">Line Item</th>
            <th className="px-4 py-2 text-right">Amount</th>
            <th className="px-4 py-2 text-right">$/SF</th>
            <th className="px-4 py-2 text-right">% of Total</th>
          </tr>
        </thead>
        <tbody>
          {sections.map((section) => (
            <CostSection key={section.title} section={section} total={total} sf={sf} fmt={fmt} pct={pct} />
          ))}
          <tr className="border-t-2 bg-gray-50 font-bold">
            <td className="px-4 py-3 text-gray-900">TOTAL PROJECT COST</td>
            <td className="px-4 py-3 text-right font-mono">{fmt(total)}</td>
            <td className="px-4 py-3 text-right font-mono">{fmtPsf(total / sf)}</td>
            <td className="px-4 py-3 text-right">100.0%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function CostSection({ section, total, sf, fmt, pct }) {
  return (
    <>
      <tr className="bg-gray-50/50">
        <td colSpan={4} className="px-4 py-2 font-semibold text-gray-800 text-xs uppercase tracking-wider">{section.title}</td>
      </tr>
      {section.items.filter(i => i.value > 0).map(item => (
        <tr key={item.label} className="border-b border-gray-100 hover:bg-gray-50/30">
          <td className="px-4 py-1.5 pl-8 text-gray-700">{item.label}</td>
          <td className="px-4 py-1.5 text-right font-mono text-gray-900">{fmt(item.value)}</td>
          <td className="px-4 py-1.5 text-right font-mono text-gray-500 text-xs">{fmtPsf(item.value / sf)}</td>
          <td className="px-4 py-1.5 text-right text-gray-500 text-xs">{total > 0 ? `${((item.value / total) * 100).toFixed(1)}%` : '—'}</td>
        </tr>
      ))}
      {section.subtotal && (
        <tr className="border-b font-medium">
          <td className="px-4 py-2 pl-6 text-gray-900">{section.subtotal.label}</td>
          <td className="px-4 py-2 text-right font-mono font-bold">{fmt(section.subtotal.value)}</td>
          <td className="px-4 py-2 text-right font-mono text-gray-600 text-xs">{fmtPsf((section.subtotal.value || 0) / sf)}</td>
          <td className="px-4 py-2 text-right font-medium">{total > 0 ? `${(((section.subtotal.value || 0) / total) * 100).toFixed(1)}%` : '—'}</td>
        </tr>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3: SOURCES OF FUNDS
// ═══════════════════════════════════════════════════════════════════════════════

function SourcesOfFundsTab({ sf, metrics, fmt, pct, pct2 }) {
  const loans = sf.loans || [];
  const equity = sf.equity || {};
  const sourcesMinusUses = (metrics.totalDebt + metrics.totalEquity) - metrics.totalCosts;

  return (
    <div className="space-y-5">
      {/* Validation */}
      <div className={`border rounded-lg p-3 flex items-center gap-2 text-sm ${Math.abs(sourcesMinusUses) < 1 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
        {Math.abs(sourcesMinusUses) < 1 ? (
          <><Check className="w-4 h-4" /> Sources = Uses (Balanced)</>
        ) : (
          <><AlertTriangle className="w-4 h-4" /> Sources {sourcesMinusUses > 0 ? 'exceed' : 'short of'} Uses by {fmt(Math.abs(sourcesMinusUses))}</>
        )}
      </div>

      {/* Construction Loan */}
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
          <Landmark className="w-4 h-4" /> Debt
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs font-medium text-gray-500 uppercase">
              <th className="pb-2">Loan</th>
              <th className="pb-2">Type</th>
              <th className="pb-2 text-right">Amount</th>
              <th className="pb-2 text-right">LTC</th>
              <th className="pb-2 text-right">Rate</th>
              <th className="pb-2 text-right">Term</th>
              <th className="pb-2 text-right">I/O</th>
              <th className="pb-2 text-right">Orig. Fee</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loans.map(loan => (
              <tr key={loan.id}>
                <td className="py-2 font-medium">{loan.name}</td>
                <td className="py-2 capitalize text-gray-600">{loan.type}</td>
                <td className="py-2 text-right font-mono">{fmt(loan.amount || loan.loan_amount)}</td>
                <td className="py-2 text-right">{pct(loan.ltc_percent)}</td>
                <td className="py-2 text-right">{pct2(loan.interest_rate)}</td>
                <td className="py-2 text-right">{loan.term_months}mo</td>
                <td className="py-2 text-right">{loan.io_months}mo</td>
                <td className="py-2 text-right">{pct(loan.origination_fee_percent || loan.origination_fee)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t font-bold">
              <td className="pt-2" colSpan={2}>Total Debt</td>
              <td className="pt-2 text-right font-mono">{fmt(metrics.totalDebt)}</td>
              <td className="pt-2 text-right">{pct(metrics.ltcRatio)}</td>
              <td colSpan={4}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Equity */}
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
          <PiggyBank className="w-4 h-4" /> Equity
        </h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 uppercase mb-1">Total Required</div>
            <div className="text-lg font-bold">{fmt(equity.total_equity_required)}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-xs text-blue-600 uppercase mb-1">Investor ({pct(equity.investor_equity_percent || (equity.investor_equity / equity.total_equity_required))})</div>
            <div className="text-lg font-bold text-blue-800">{fmt(equity.investor_equity)}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-xs text-green-600 uppercase mb-1">Sponsor ({pct(equity.sponsor_equity_percent || (equity.sponsor_equity / equity.total_equity_required))})</div>
            <div className="text-lg font-bold text-green-800">{fmt(equity.sponsor_equity)}</div>
          </div>
        </div>
        <div className="text-sm space-y-1">
          <LabelValue label="Preferred Return" value={pct(equity.preferred_return)} />
          {equity.promote_structure?.map((tier, i) => (
            <LabelValue key={i} label={tier.label || `Promote Tier ${i + 1}`} value={`${(tier.split * 100).toFixed(0)}% to sponsor above ${pct(tier.hurdle)} IRR`} />
          ))}
        </div>
      </div>

      {/* Capital Stack */}
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Capital Stack</h3>
        <div className="h-10 rounded-lg overflow-hidden flex">
          {loans.map((loan, i) => (
            <div key={loan.id} className={`flex items-center justify-center text-xs text-white font-medium ${i === 0 ? 'bg-blue-600' : 'bg-blue-400'}`}
              style={{ width: `${((loan.amount || loan.loan_amount) / metrics.totalCosts) * 100}%` }}>
              {loan.name}: {pct((loan.amount || loan.loan_amount) / metrics.totalCosts)}
            </div>
          ))}
          <div className="bg-green-600 flex items-center justify-center text-xs text-white font-medium"
            style={{ width: `${(metrics.totalEquity / metrics.totalCosts) * 100}%` }}>
            Equity: {pct(metrics.totalEquity / metrics.totalCosts)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4: REVENUE & SALE
// ═══════════════════════════════════════════════════════════════════════════════

function RevenueTab({ rev, assumptions, metrics, fmt, pct }) {
  return (
    <div className="space-y-5">
      {/* Sale Price */}
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Sale Price Analysis</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-xs text-green-600 uppercase mb-1">Sale Price</div>
            <div className="text-xl font-bold text-green-800">{fmt(rev.estimated_sale_price || rev.gross_sale_price)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 uppercase mb-1">Price per SF</div>
            <div className="text-xl font-bold">${(rev.price_per_sf || 0).toFixed(2)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 uppercase mb-1">Profit Margin</div>
            <div className="text-xl font-bold">{pct(metrics.grossMargin)}</div>
          </div>
        </div>
        {rev.comparable_basis && (
          <div className="text-sm text-gray-600 bg-gray-50 rounded p-2 italic">
            {rev.comparable_basis}
          </div>
        )}
      </div>

      {/* Sale Costs & Net Proceeds */}
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Net Proceeds Calculation</h3>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b"><td className="py-2 font-medium">Gross Sale Price</td><td className="py-2 text-right font-mono font-bold">{fmt(rev.gross_sale_price || rev.estimated_sale_price)}</td></tr>
            <tr className="border-b"><td className="py-2 pl-4 text-gray-600">Less: Broker Commission ({pct(rev.broker_commission_percent || assumptions.broker_commission_percent)})</td><td className="py-2 text-right font-mono text-red-600">({fmt(rev.broker_commission)})</td></tr>
            <tr className="border-b"><td className="py-2 pl-4 text-gray-600">Less: Seller Closing Costs ({pct(rev.seller_closing_costs_percent || assumptions.seller_closing_costs_percent)})</td><td className="py-2 text-right font-mono text-red-600">({fmt(rev.seller_closing_costs)})</td></tr>
            {rev.concessions > 0 && <tr className="border-b"><td className="py-2 pl-4 text-gray-600">Less: Buyer Concessions</td><td className="py-2 text-right font-mono text-red-600">({fmt(rev.concessions)})</td></tr>}
            {rev.home_warranty > 0 && <tr className="border-b"><td className="py-2 pl-4 text-gray-600">Less: Home Warranty</td><td className="py-2 text-right font-mono text-red-600">({fmt(rev.home_warranty)})</td></tr>}
            <tr className="border-b"><td className="py-2 font-medium text-gray-700">Total Sale Costs</td><td className="py-2 text-right font-mono font-medium text-red-700">({fmt(rev.total_sale_costs)})</td></tr>
            <tr className="bg-green-50 font-bold"><td className="py-3 text-green-900">Net Sale Proceeds</td><td className="py-3 text-right font-mono text-green-800">{fmt(rev.net_sale_proceeds)}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 5: CASH FLOW
// ═══════════════════════════════════════════════════════════════════════════════

function CashFlowTab({ cashFlows, fmt }) {
  if (!cashFlows.length) return <div className="text-gray-500">No cash flow data.</div>;

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b text-left text-[10px] font-semibold text-gray-500 uppercase">
              <th className="px-2 py-2 sticky left-0 bg-gray-50">Mo</th>
              <th className="px-2 py-2 text-right text-green-700">Equity In</th>
              <th className="px-2 py-2 text-right text-green-700">Debt Draws</th>
              <th className="px-2 py-2 text-right text-green-700">Sale Proceeds</th>
              <th className="px-2 py-2 text-right text-red-700">Land</th>
              <th className="px-2 py-2 text-right text-red-700">Hard Costs</th>
              <th className="px-2 py-2 text-right text-red-700">Soft Costs</th>
              <th className="px-2 py-2 text-right text-red-700">Interest</th>
              <th className="px-2 py-2 text-right text-red-700">Loan Payoff</th>
              <th className="px-2 py-2 text-right text-red-700">Distrib.</th>
              <th className="px-2 py-2 text-right font-bold">Net CF</th>
              <th className="px-2 py-2 text-right text-blue-700">Cumul. CF</th>
              <th className="px-2 py-2 text-right">Loan Bal.</th>
            </tr>
          </thead>
          <tbody className="divide-y font-mono">
            {cashFlows.map(cf => (
              <tr key={cf.month} className={cf.month === cashFlows.length ? 'bg-green-50/50' : ''}>
                <td className="px-2 py-1 sticky left-0 bg-white font-sans font-medium">{cf.month}</td>
                <td className="px-2 py-1 text-right text-green-600">{cf.equity_contribution > 0 ? fmt(cf.equity_contribution) : '—'}</td>
                <td className="px-2 py-1 text-right text-green-600">{cf.debt_draw > 0 ? fmt(cf.debt_draw) : '—'}</td>
                <td className="px-2 py-1 text-right text-green-600">{cf.sale_proceeds > 0 ? fmt(cf.sale_proceeds) : '—'}</td>
                <td className="px-2 py-1 text-right text-red-600">{cf.land_payment > 0 ? fmt(cf.land_payment) : '—'}</td>
                <td className="px-2 py-1 text-right text-red-600">{cf.hard_cost_payment > 0 ? fmt(cf.hard_cost_payment) : '—'}</td>
                <td className="px-2 py-1 text-right text-red-600">{cf.soft_cost_payment > 0 ? fmt(cf.soft_cost_payment) : '—'}</td>
                <td className="px-2 py-1 text-right text-red-600">{cf.interest_payment > 0 ? fmt(cf.interest_payment) : '—'}</td>
                <td className="px-2 py-1 text-right text-red-600">{cf.loan_payoff > 0 ? fmt(cf.loan_payoff) : '—'}</td>
                <td className="px-2 py-1 text-right text-purple-600">{cf.distributions > 0 ? fmt(cf.distributions) : '—'}</td>
                <td className={`px-2 py-1 text-right font-bold ${cf.net_cash_flow >= 0 ? 'text-green-700' : 'text-red-700'}`}>{fmt(cf.net_cash_flow)}</td>
                <td className={`px-2 py-1 text-right ${cf.cumulative_cash_flow >= 0 ? 'text-blue-700' : 'text-red-700'}`}>{fmt(cf.cumulative_cash_flow)}</td>
                <td className="px-2 py-1 text-right text-gray-600">{fmt(cf.loan_balance)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 font-bold text-xs bg-gray-50">
              <td className="px-2 py-2 font-sans">Total</td>
              <td className="px-2 py-2 text-right text-green-700">{fmt(cashFlows.reduce((s, c) => s + c.equity_contribution, 0))}</td>
              <td className="px-2 py-2 text-right text-green-700">{fmt(cashFlows.reduce((s, c) => s + c.debt_draw, 0))}</td>
              <td className="px-2 py-2 text-right text-green-700">{fmt(cashFlows.reduce((s, c) => s + c.sale_proceeds, 0))}</td>
              <td className="px-2 py-2 text-right text-red-700">{fmt(cashFlows.reduce((s, c) => s + c.land_payment, 0))}</td>
              <td className="px-2 py-2 text-right text-red-700">{fmt(cashFlows.reduce((s, c) => s + c.hard_cost_payment, 0))}</td>
              <td className="px-2 py-2 text-right text-red-700">{fmt(cashFlows.reduce((s, c) => s + c.soft_cost_payment, 0))}</td>
              <td className="px-2 py-2 text-right text-red-700">{fmt(cashFlows.reduce((s, c) => s + c.interest_payment, 0))}</td>
              <td className="px-2 py-2 text-right text-red-700">{fmt(cashFlows.reduce((s, c) => s + c.loan_payoff, 0))}</td>
              <td className="px-2 py-2 text-right text-purple-700">{fmt(cashFlows.reduce((s, c) => s + c.distributions, 0))}</td>
              <td colSpan={3}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 6: RETURNS ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

function ReturnsTab({ metrics, waterfall, fmt, pct }) {
  return (
    <div className="space-y-5">
      {/* Return Metrics */}
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white border rounded-lg p-5">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Project Returns</h3>
          <div className="grid grid-cols-3 gap-4">
            <ReturnMetric label="Project IRR" value={pct(metrics.projectIRR)} />
            <ReturnMetric label="Project Multiple" value={`${metrics.projectMultiple.toFixed(2)}x`} />
            <ReturnMetric label="Project ROI" value={pct(metrics.projectROI)} />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-5">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Equity Returns</h3>
          <div className="grid grid-cols-3 gap-4">
            <ReturnMetric label="Equity IRR" value={pct(metrics.equityIRR)} />
            <ReturnMetric label="Equity Multiple" value={`${metrics.equityMultiple.toFixed(2)}x`} />
            <ReturnMetric label="Cash on Cash" value={pct(metrics.cashOnCash)} />
          </div>
        </div>
      </div>

      {/* Investor Waterfall */}
      {waterfall && (
        <div className="bg-white border rounded-lg p-5">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Investor Waterfall Distribution</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs font-medium text-gray-500 uppercase">
                <th className="pb-2">Tier</th>
                <th className="pb-2 text-right">Total</th>
                <th className="pb-2 text-right text-blue-700">Investor</th>
                <th className="pb-2 text-right text-green-700">Sponsor</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {waterfall.tiers.map((tier, i) => (
                <tr key={i}>
                  <td className="py-2 font-medium text-gray-800">{tier.name}</td>
                  <td className="py-2 text-right font-mono">{fmt(tier.total)}</td>
                  <td className="py-2 text-right font-mono text-blue-700">{fmt(tier.investor)}</td>
                  <td className="py-2 text-right font-mono text-green-700">{fmt(tier.sponsor)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 font-bold">
                <td className="pt-2">Total Distributions</td>
                <td className="pt-2 text-right font-mono">{fmt(waterfall.totalAvailable)}</td>
                <td className="pt-2 text-right font-mono text-blue-800">{fmt(waterfall.totalToInvestor)}</td>
                <td className="pt-2 text-right font-mono text-green-800">{fmt(waterfall.totalToSponsor)}</td>
              </tr>
              <tr className="text-xs text-gray-500">
                <td className="pt-1">Equity Multiple</td>
                <td></td>
                <td className="pt-1 text-right font-bold text-blue-700">{waterfall.investorMultiple.toFixed(2)}x</td>
                <td className="pt-1 text-right font-bold text-green-700">{waterfall.sponsorMultiple.toFixed(2)}x</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Per-Unit Metrics */}
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Per-Unit Metrics</h3>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Cost/Unit</div>
            <div className="text-lg font-bold">{fmt(metrics.costPerUnit)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Revenue/Unit</div>
            <div className="text-lg font-bold">{fmt(metrics.revenuePerUnit)}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Profit/Unit</div>
            <div className="text-lg font-bold text-green-700">{fmt(metrics.profitPerUnit)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Cost/SF</div>
            <div className="text-lg font-bold">${metrics.costPerSF.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReturnMetric({ label, value }) {
  return (
    <div className="text-center p-3 bg-gray-50 rounded-lg">
      <div className="text-xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 7: SENSITIVITY ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

function SensitivityTab({ sensitivity, fmt, pct }) {
  if (!sensitivity) return <div className="text-gray-500">No sensitivity data.</div>;

  return (
    <div className="space-y-5">
      {/* Sale Price Sensitivity */}
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Sale Price Sensitivity</h3>
        <SensitivityRow data={sensitivity.salePriceSensitivity} deltaLabel="Sale Price" fmt={fmt} pct={pct} />
      </div>

      {/* Construction Cost Sensitivity */}
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Construction Cost Sensitivity</h3>
        <SensitivityRow data={sensitivity.costSensitivity} deltaLabel="Hard Cost" fmt={fmt} pct={pct} />
      </div>

      {/* Timeline Sensitivity */}
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Timeline Sensitivity</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs font-medium text-gray-500 uppercase text-center">
              <th className="pb-2 text-left">Change</th>
              {sensitivity.timelineSensitivity.map(s => (
                <th key={s.delta} className="pb-2">{s.delta > 0 ? '+' : ''}{s.delta} mo</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2 font-medium text-gray-700">Interest Cost</td>
              {sensitivity.timelineSensitivity.map(s => (
                <td key={s.delta} className={`py-2 text-center font-mono text-xs ${s.delta === 0 ? 'font-bold bg-blue-50' : ''}`}>{fmt(s.interestCost)}</td>
              ))}
            </tr>
            <tr>
              <td className="py-2 font-medium text-gray-700">Equity IRR</td>
              {sensitivity.timelineSensitivity.map(s => (
                <td key={s.delta} className={`py-2 text-center font-mono text-xs ${s.delta === 0 ? 'font-bold bg-blue-50' : ''} ${s.equityIRR >= 0.15 ? 'text-green-700' : s.equityIRR >= 0.10 ? 'text-yellow-700' : 'text-red-700'}`}>{pct(s.equityIRR)}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Two-Variable Matrix */}
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-1 text-sm uppercase tracking-wide">Two-Variable Sensitivity Matrix</h3>
        <p className="text-xs text-gray-500 mb-3">Equity IRR under different sale price (rows) and construction cost (columns) scenarios</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="pb-2 pr-2 text-left text-gray-500 font-medium">Price \ Cost</th>
                {sensitivity.twoVarMatrix[0]?.scenarios.map(s => (
                  <th key={s.costDelta} className="pb-2 px-2 text-center text-gray-500 font-medium">
                    {s.costDelta > 0 ? '+' : ''}{(s.costDelta * 100).toFixed(0)}%
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sensitivity.twoVarMatrix.map(row => (
                <tr key={row.revDelta}>
                  <td className="py-1 pr-2 font-medium text-gray-700">
                    {row.revDelta > 0 ? '+' : ''}{(row.revDelta * 100).toFixed(0)}%
                  </td>
                  {row.scenarios.map((s, i) => {
                    const isBase = row.revDelta === 0 && s.costDelta === 0;
                    const bg = s.equityIRR >= 0.25 ? 'bg-green-200 text-green-900'
                      : s.equityIRR >= 0.15 ? 'bg-green-100 text-green-800'
                      : s.equityIRR >= 0.10 ? 'bg-yellow-50 text-yellow-800'
                      : s.equityIRR >= 0 ? 'bg-orange-50 text-orange-800'
                      : 'bg-red-100 text-red-800';
                    return (
                      <td key={i} className={`py-1 px-2 text-center font-mono ${bg} ${isBase ? 'ring-2 ring-blue-500 font-bold' : ''}`}>
                        {pct(s.equityIRR)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex gap-4 text-[10px] text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-200 rounded" /> ≥25%</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-100 rounded" /> ≥15%</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-50 rounded border" /> ≥10%</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-50 rounded border" /> ≥0%</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-100 rounded" /> &lt;0%</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 ring-2 ring-blue-500 rounded" /> Base</span>
        </div>
      </div>
    </div>
  );
}

function SensitivityRow({ data, deltaLabel, fmt, pct }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b text-xs font-medium text-gray-500 uppercase text-center">
          <th className="pb-2 text-left">{deltaLabel}</th>
          {data.map(s => (
            <th key={s.delta} className="pb-2">{s.delta > 0 ? '+' : ''}{(s.delta * 100).toFixed(0)}%</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr className="border-b">
          <td className="py-2 font-medium text-gray-700">Gross Profit</td>
          {data.map(s => (
            <td key={s.delta} className={`py-2 text-center font-mono text-xs ${s.delta === 0 ? 'font-bold bg-blue-50' : ''}`}>{fmt(s.grossProfit)}</td>
          ))}
        </tr>
        <tr className="border-b">
          <td className="py-2 font-medium text-gray-700">Equity IRR</td>
          {data.map(s => (
            <td key={s.delta} className={`py-2 text-center font-mono text-xs ${s.delta === 0 ? 'font-bold bg-blue-50' : ''} ${s.equityIRR >= 0.15 ? 'text-green-700' : s.equityIRR >= 0.10 ? 'text-yellow-700' : 'text-red-700'}`}>{pct(s.equityIRR)}</td>
          ))}
        </tr>
        <tr>
          <td className="py-2 font-medium text-gray-700">Equity Multiple</td>
          {data.map(s => (
            <td key={s.delta} className={`py-2 text-center font-mono text-xs ${s.delta === 0 ? 'font-bold bg-blue-50' : ''}`}>{s.equityMultiple.toFixed(2)}x</td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function LabelValue({ label, value, bold, color, className = '' }) {
  return (
    <div className={`flex justify-between py-0.5 ${className}`}>
      <span className={`text-gray-600 ${bold ? 'font-semibold text-gray-800' : ''}`}>{label}</span>
      <span className={`font-mono ${bold ? 'font-bold' : 'font-medium'} ${color === 'green' ? 'text-green-700' : color === 'red' ? 'text-red-700' : 'text-gray-900'}`}>{value}</span>
    </div>
  );
}

function fmtPsf(v) {
  return `$${(v || 0).toFixed(2)}`;
}
