// src/pages/projects/ProForma/ProFormaPage.jsx
// Professional-grade Pro Forma financial modeling interface
// Supports: Scattered Lot, Lot Development, Community For-Sale, Build-to-Rent
import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign, TrendingUp, PiggyBank, Building2, BarChart3,
  Calculator, LineChart, ArrowUpDown, Check, AlertTriangle,
  Landmark, Home, ArrowDown, ArrowUp, MapPin, Layers, Users,
} from 'lucide-react';
import { useProjectProformas, useActiveProforma, useProformaActions } from '@/hooks/useProforma';
import {
  calculateProFormaMetrics, calculateLotDevelopmentMetrics,
  calculateCommunityForSaleMetrics, calculateBTRMetrics,
  generateMonthlyCashFlows, generateLotDevelopmentCashFlows,
  generateCommunityForSaleCashFlows, generateBTRCashFlows,
  generateBTRAnnualProforma, getTemplateType,
  runSensitivityAnalysis, calculateInvestorWaterfall,
} from '@/services/proformaService';

const TEMPLATE_LABELS = {
  scattered_lot: 'Scattered Lot Build',
  lot_development: 'Lot Development',
  community_for_sale: 'Community For-Sale',
  build_to_rent: 'Build-to-Rent',
};

export default function ProFormaPage() {
  const { projectId } = useParams();
  const pid = projectId || 'demo-project-1';
  const { proformas, loading: listLoading, refetch } = useProjectProformas(pid);
  const { proforma, loading } = useActiveProforma(pid);
  const { setActive } = useProformaActions(pid);
  const [activeTab, setActiveTab] = useState('summary');
  const [selectedVersion, setSelectedVersion] = useState(null);

  const displayProforma = selectedVersion
    ? proformas.find(p => p.id === selectedVersion) || proforma
    : proforma;

  const templateType = useMemo(() => displayProforma ? getTemplateType(displayProforma) : 'scattered_lot', [displayProforma]);

  const displayMetrics = useMemo(() => {
    if (!displayProforma) return null;
    if (templateType === 'lot_development') return calculateLotDevelopmentMetrics(displayProforma);
    if (templateType === 'community_for_sale') return calculateCommunityForSaleMetrics(displayProforma);
    if (templateType === 'build_to_rent') return calculateBTRMetrics(displayProforma);
    return calculateProFormaMetrics(displayProforma);
  }, [displayProforma, templateType]);

  const cashFlows = useMemo(() => {
    if (!displayProforma) return [];
    if (templateType === 'lot_development') return generateLotDevelopmentCashFlows(displayProforma);
    if (templateType === 'community_for_sale') return generateCommunityForSaleCashFlows(displayProforma);
    if (templateType === 'build_to_rent') return generateBTRCashFlows(displayProforma);
    return generateMonthlyCashFlows(displayProforma);
  }, [displayProforma, templateType]);

  const sensitivity = useMemo(() => {
    if (!displayProforma) return null;
    return runSensitivityAnalysis(displayProforma);
  }, [displayProforma]);

  const waterfall = useMemo(() => {
    if (!displayProforma) return null;
    return calculateInvestorWaterfall(displayProforma);
  }, [displayProforma]);

  const annualProforma = useMemo(() => {
    if (!displayProforma || templateType !== 'build_to_rent') return null;
    return generateBTRAnnualProforma(displayProforma);
  }, [displayProforma, templateType]);

  const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v || 0);
  const pct = (v) => `${((v || 0) * 100).toFixed(1)}%`;
  const pct2 = (v) => `${((v || 0) * 100).toFixed(2)}%`;

  if (loading || listLoading) return <div className="p-6 text-gray-500">Loading pro forma...</div>;
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

  // Dynamic tabs based on template type
  const tabs = getTabsForTemplate(templateType);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pro Forma Analysis</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {assumptions.project_name || 'Project'} — {TEMPLATE_LABELS[templateType]}
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
      <KPIBar metrics={displayMetrics} templateType={templateType} fmt={fmt} pct={pct} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 flex-wrap">
          {tabs.map(t => <TabsTrigger key={t.id} value={t.id}>{t.label}</TabsTrigger>)}
        </TabsList>

        <TabsContent value="summary" className="mt-4">
          <SummaryTab proforma={displayProforma} metrics={displayMetrics} waterfall={waterfall} templateType={templateType} fmt={fmt} pct={pct} />
        </TabsContent>
        <TabsContent value="uses" className="mt-4">
          <UsesOfFundsTab uf={uf} metrics={displayMetrics} assumptions={assumptions} templateType={templateType} fmt={fmt} pct={pct} />
        </TabsContent>
        <TabsContent value="sources" className="mt-4">
          <SourcesOfFundsTab sf={sf} metrics={displayMetrics} proforma={displayProforma} fmt={fmt} pct={pct} pct2={pct2} />
        </TabsContent>
        <TabsContent value="revenue" className="mt-4">
          <RevenueTab rev={rev} assumptions={assumptions} metrics={displayMetrics} templateType={templateType} fmt={fmt} pct={pct} />
        </TabsContent>
        <TabsContent value="operations" className="mt-4">
          <OperationsTab proforma={displayProforma} metrics={displayMetrics} annualProforma={annualProforma} fmt={fmt} pct={pct} />
        </TabsContent>
        <TabsContent value="cashflow" className="mt-4">
          <CashFlowTab cashFlows={cashFlows} templateType={templateType} fmt={fmt} />
        </TabsContent>
        <TabsContent value="returns" className="mt-4">
          <ReturnsTab metrics={displayMetrics} waterfall={waterfall} templateType={templateType} fmt={fmt} pct={pct} />
        </TabsContent>
        <TabsContent value="sensitivity" className="mt-4">
          <SensitivityTab sensitivity={sensitivity} templateType={templateType} fmt={fmt} pct={pct} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getTabsForTemplate(type) {
  const base = [
    { id: 'summary', label: 'Summary' },
    { id: 'uses', label: 'Uses of Funds' },
    { id: 'sources', label: 'Sources of Funds' },
  ];
  if (type === 'build_to_rent') {
    return [...base,
      { id: 'revenue', label: 'Unit Mix & Rents' },
      { id: 'operations', label: 'Operations' },
      { id: 'cashflow', label: 'Cash Flow' },
      { id: 'returns', label: 'Returns' },
      { id: 'sensitivity', label: 'Sensitivity' },
    ];
  }
  if (type === 'lot_development') {
    return [...base,
      { id: 'revenue', label: 'Lot Pricing' },
      { id: 'cashflow', label: 'Cash Flow' },
      { id: 'returns', label: 'Returns' },
      { id: 'sensitivity', label: 'Sensitivity' },
    ];
  }
  if (type === 'community_for_sale') {
    return [...base,
      { id: 'revenue', label: 'Product Mix' },
      { id: 'cashflow', label: 'Cash Flow' },
      { id: 'returns', label: 'Returns' },
      { id: 'sensitivity', label: 'Sensitivity' },
    ];
  }
  return [...base,
    { id: 'revenue', label: 'Revenue & Sale' },
    { id: 'cashflow', label: 'Cash Flow' },
    { id: 'returns', label: 'Returns' },
    { id: 'sensitivity', label: 'Sensitivity' },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// KPI BAR
// ═══════════════════════════════════════════════════════════════════════════════

function KPIBar({ metrics, templateType, fmt, pct }) {
  if (templateType === 'build_to_rent') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        <KPI label="Dev Cost" value={fmt(metrics.totalCosts)} icon={Building2} />
        <KPI label="NOI" value={fmt(metrics.noi)} icon={TrendingUp} color="green" />
        <KPI label="Dev Yield" value={pct(metrics.developmentYield)} icon={BarChart3} color="blue" />
        <KPI label="Exit Value" value={fmt(metrics.grossSalePrice)} icon={Home} />
        <KPI label="Equity IRR" value={pct(metrics.equityIRR)} icon={LineChart} color="blue" />
        <KPI label="Equity Multiple" value={`${metrics.equityMultiple.toFixed(2)}x`} icon={ArrowUpDown} color="purple" />
        <KPI label="Value Created" value={fmt(metrics.valueCreation)} icon={TrendingUp} color="green" />
      </div>
    );
  }
  if (templateType === 'lot_development') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        <KPI label="Dev Cost" value={fmt(metrics.totalCosts)} icon={Building2} />
        <KPI label="Lot Revenue" value={fmt(metrics.totalRevenue)} icon={MapPin} />
        <KPI label="Net Profit" value={fmt(metrics.netProfit)} icon={TrendingUp} color={metrics.netProfit >= 0 ? 'green' : 'red'} />
        <KPI label="Dev Spread" value={pct(metrics.developmentSpread)} icon={BarChart3} />
        <KPI label="Equity IRR" value={pct(metrics.equityIRR)} icon={LineChart} color="blue" />
        <KPI label="Equity Multiple" value={`${metrics.equityMultiple.toFixed(2)}x`} icon={ArrowUpDown} color="purple" />
        <KPI label="Cost/Lot" value={fmt(metrics.costPerLot)} icon={Calculator} />
      </div>
    );
  }
  if (templateType === 'community_for_sale') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        <KPI label="Total Cost" value={fmt(metrics.totalCosts)} icon={Building2} />
        <KPI label="Revenue" value={fmt(metrics.totalRevenue)} icon={Home} />
        <KPI label="Net Profit" value={fmt(metrics.netProfit)} icon={TrendingUp} color={metrics.netProfit >= 0 ? 'green' : 'red'} />
        <KPI label="Margin" value={pct(metrics.grossMargin)} icon={BarChart3} />
        <KPI label="Equity IRR" value={pct(metrics.equityIRR)} icon={LineChart} color="blue" />
        <KPI label="Equity Multiple" value={`${metrics.equityMultiple.toFixed(2)}x`} icon={ArrowUpDown} color="purple" />
        <KPI label="Profit/Home" value={fmt(metrics.profitPerHome)} icon={Calculator} />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
      <KPI label="Total Cost" value={fmt(metrics.totalCosts)} icon={Building2} />
      <KPI label="Sale Price" value={fmt(metrics.totalRevenue)} icon={Home} />
      <KPI label="Gross Profit" value={fmt(metrics.grossProfit)} icon={TrendingUp} color={metrics.grossProfit >= 0 ? 'green' : 'red'} />
      <KPI label="Gross Margin" value={pct(metrics.grossMargin)} icon={BarChart3} />
      <KPI label="Equity IRR" value={pct(metrics.equityIRR)} icon={LineChart} color="blue" />
      <KPI label="Equity Multiple" value={`${metrics.equityMultiple.toFixed(2)}x`} icon={ArrowUpDown} color="purple" />
      <KPI label="Timeline" value={`${metrics.termMonths} mo`} icon={Calculator} />
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

function SummaryTab({ proforma, metrics, waterfall, templateType, fmt, pct }) {
  const assumptions = proforma.assumptions || {};
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Profit Analysis */}
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Profit Analysis</h3>
        <div className="space-y-1 text-sm">
          <LabelValue label={templateType === 'build_to_rent' ? 'Gross Sale Price (Exit)' : 'Total Revenue'} value={fmt(templateType === 'build_to_rent' ? metrics.grossSalePrice : metrics.totalRevenue)} />
          <LabelValue label="Less: Sale Costs" value={`(${fmt(metrics.saleCosts || metrics.totalSaleCosts || 0)})`} className="text-red-600 pl-3" />
          <LabelValue label="Net Proceeds" value={fmt(metrics.netRevenue)} bold />
          <div className="border-t my-2" />
          <LabelValue label="Less: Total Project Cost" value={`(${fmt(metrics.totalCosts)})`} className="text-red-600" />
          {templateType === 'build_to_rent' && <LabelValue label="Plus: Operating Cash Flow" value={fmt(metrics.cumulativeHoldCash)} className="text-green-600 pl-3" />}
          <LabelValue label="Gross Profit" value={fmt(metrics.grossProfit)} bold color={metrics.grossProfit >= 0 ? 'green' : 'red'} />
          <LabelValue label="Gross Margin" value={pct(metrics.grossMargin)} className="text-gray-500 text-xs" />
          <div className="border-t my-2" />
          <LabelValue label="Less: Financing Costs" value={`(${fmt(metrics.financingCosts)})`} className="text-red-600 pl-3" />
          <LabelValue label="Net Profit" value={fmt(metrics.netProfit)} bold color={metrics.netProfit >= 0 ? 'green' : 'red'} />
          <LabelValue label="Net Margin" value={pct(metrics.netMargin)} className="text-gray-500 text-xs" />
        </div>
      </div>

      {/* Project Info */}
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Project Info</h3>
        <div className="space-y-1 text-sm">
          {assumptions.address && <LabelValue label="Address" value={assumptions.address} />}
          {templateType === 'scattered_lot' && <>
            <LabelValue label="Lot Count" value={assumptions.lot_count} />
            <LabelValue label="Sq Footage" value={`${(assumptions.square_footage || 0).toLocaleString()} sf`} />
            <LabelValue label="Bed/Bath" value={`${assumptions.bedrooms}bd / ${assumptions.bathrooms}ba`} />
            <LabelValue label="Timeline" value={`${assumptions.total_project_months} months`} />
          </>}
          {templateType === 'lot_development' && <>
            <LabelValue label="Total Acreage" value={`${assumptions.total_acreage} ac`} />
            <LabelValue label="Net Developable" value={`${assumptions.net_developable_acres} ac`} />
            <LabelValue label="Total Lots" value={assumptions.total_lots} />
            <LabelValue label="Density" value={`${(assumptions.density_units_per_acre || 0).toFixed(1)} units/ac`} />
            <LabelValue label="Absorption" value={`${assumptions.lots_sold_per_month} lots/mo`} />
            <LabelValue label="Timeline" value={`${assumptions.total_project_months} months`} />
          </>}
          {templateType === 'community_for_sale' && <>
            <LabelValue label="Total Acreage" value={`${assumptions.total_acreage} ac`} />
            <LabelValue label="Total Homes" value={assumptions.total_homes} />
            <LabelValue label="Sales Velocity" value={`${assumptions.sales_per_month}/mo`} />
            <LabelValue label="Closings/Month" value={assumptions.closings_per_month} />
            <LabelValue label="Sellout Period" value={`${assumptions.total_sellout_months} months`} />
          </>}
          {templateType === 'build_to_rent' && <>
            <LabelValue label="Total Acreage" value={`${assumptions.total_acreage} ac`} />
            <LabelValue label="Total Units" value={assumptions.total_units} />
            <LabelValue label="Product Type" value={assumptions.product_type} />
            <LabelValue label="Avg Unit" value={`${(assumptions.average_unit_sf || 0).toLocaleString()} sf`} />
            <LabelValue label="Avg Rent" value={fmt(assumptions.average_monthly_rent)} />
            <LabelValue label="Hold Period" value={`${assumptions.hold_period_years} years`} />
          </>}
          <div className="border-t my-2" />
          <LabelValue label="Cost per Unit" value={fmt(metrics.costPerUnit)} />
          <LabelValue label="Revenue per Unit" value={fmt(metrics.revenuePerUnit)} />
          <LabelValue label="Profit per Unit" value={fmt(metrics.profitPerUnit)} />
          <LabelValue label="Project ROI" value={pct(metrics.projectROI)} />
          {templateType === 'build_to_rent' && <>
            <LabelValue label="Dev Yield" value={pct(metrics.developmentYield)} />
            <LabelValue label="Exit Cap Rate" value={pct(metrics.exitCapRate)} />
            <LabelValue label="Dev Spread" value={`${((metrics.developmentSpread || 0) * 100).toFixed(0)} bps`} />
          </>}
        </div>
      </div>

      {/* Capital Stack */}
      <div className="bg-white border rounded-lg p-5 lg:col-span-2">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Capital Stack</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase mb-2">Uses of Funds</div>
            <StackBar items={getUsesBreakdown(proforma, metrics, templateType)} />
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

function getUsesBreakdown(proforma, metrics, templateType) {
  const uf = proforma.uses_of_funds || {};
  const tc = metrics.totalCosts || 1;
  if (templateType === 'lot_development') {
    return [
      { label: 'Land', value: (uf.land_acquisition?.total_land_cost || 0) / tc, color: 'bg-amber-500' },
      { label: 'Entitlement', value: (uf.entitlement_costs?.total_entitlement_costs || 0) / tc, color: 'bg-orange-500' },
      { label: 'Infrastructure', value: (uf.hard_costs?.total_hard_costs || 0) / tc, color: 'bg-blue-500' },
      { label: 'Soft Costs', value: (uf.soft_costs?.total_soft_costs || 0) / tc, color: 'bg-green-500' },
      { label: 'Impact Fees', value: (uf.impact_fees?.developer_impact_fee_responsibility || 0) / tc, color: 'bg-red-400' },
      { label: 'Financing', value: (uf.financing_costs?.total_financing_costs || 0) / tc, color: 'bg-purple-500' },
    ];
  }
  if (templateType === 'community_for_sale') {
    return [
      { label: 'Land', value: (uf.land_acquisition?.total_land_cost || 0) / tc, color: 'bg-amber-500' },
      { label: 'Land Dev', value: (uf.land_development?.total_land_development || 0) / tc, color: 'bg-orange-500' },
      { label: 'Vertical', value: (uf.vertical_costs?.total_vertical_construction || 0) / tc, color: 'bg-blue-500' },
      { label: 'Indirect', value: (uf.indirect_costs?.total_indirect_costs || 0) / tc, color: 'bg-green-500' },
      { label: 'Impact', value: (uf.impact_fees?.total_impact_fees || 0) / tc, color: 'bg-red-400' },
      { label: 'Financing', value: (uf.financing_costs?.total_financing_costs || 0) / tc, color: 'bg-purple-500' },
    ];
  }
  if (templateType === 'build_to_rent') {
    return [
      { label: 'Land', value: (uf.land_acquisition?.total_land_cost || 0) / tc, color: 'bg-amber-500' },
      { label: 'Site Work', value: (uf.development_costs?.site_work?.total_site_work || 0) / tc, color: 'bg-orange-500' },
      { label: 'Vertical', value: (uf.development_costs?.vertical_construction?.total_vertical || 0) / tc, color: 'bg-blue-500' },
      { label: 'Soft Costs', value: (uf.development_costs?.soft_costs?.total_soft_costs || 0) / tc, color: 'bg-green-500' },
      { label: 'Financing', value: (uf.financing_costs?.total_financing_costs || 0) / tc, color: 'bg-purple-500' },
    ];
  }
  return [
    { label: 'Land', value: (uf.land_acquisition?.total_land_cost || uf.land_cost || 0) / tc, color: 'bg-amber-500' },
    { label: 'Hard Costs', value: (uf.hard_costs?.total_hard_costs || uf.hard_costs || 0) / tc, color: 'bg-blue-500' },
    { label: 'Soft Costs', value: (uf.soft_costs?.total_soft_costs || uf.soft_costs || 0) / tc, color: 'bg-green-500' },
    { label: 'Financing', value: (uf.financing_costs?.total_financing_costs || uf.financing_costs || 0) / tc, color: 'bg-purple-500' },
  ];
}

function StackBar({ items }) {
  return (
    <div>
      <div className="h-6 rounded-lg overflow-hidden flex mb-2">
        {items.filter(i => i.value > 0.01).map((item, idx) => (
          <div key={idx} className={`${item.color} flex items-center justify-center text-[10px] text-white font-medium`} style={{ width: `${item.value * 100}%` }}>
            {item.value > 0.08 ? `${(item.value * 100).toFixed(0)}%` : ''}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 text-xs">
        {items.filter(i => i.value > 0.01).map((item, idx) => (
          <span key={idx} className="flex items-center gap-1"><span className={`w-2.5 h-2.5 rounded-sm ${item.color}`} />{item.label}</span>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2: USES OF FUNDS
// ═══════════════════════════════════════════════════════════════════════════════

function UsesOfFundsTab({ uf, metrics, assumptions, templateType, fmt, pct }) {
  const total = metrics.totalCosts;
  const units = metrics.units || 1;

  const sections = templateType === 'lot_development'
    ? getLotDevUseSections(uf)
    : templateType === 'community_for_sale'
    ? getCommunityUseSections(uf)
    : templateType === 'build_to_rent'
    ? getBTRUseSections(uf)
    : getScatteredLotUseSections(uf);

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b text-left text-xs font-semibold text-gray-500 uppercase">
            <th className="px-4 py-2">Line Item</th>
            <th className="px-4 py-2 text-right">Amount</th>
            <th className="px-4 py-2 text-right">$/Unit</th>
            <th className="px-4 py-2 text-right">% of Total</th>
          </tr>
        </thead>
        <tbody>
          {sections.map((section) => (
            <CostSection key={section.title} section={section} total={total} units={units} fmt={fmt} />
          ))}
          <tr className="border-t-2 bg-gray-50 font-bold">
            <td className="px-4 py-3 text-gray-900">TOTAL {templateType === 'lot_development' ? 'DEVELOPMENT' : 'PROJECT'} COST</td>
            <td className="px-4 py-3 text-right font-mono">{fmt(total)}</td>
            <td className="px-4 py-3 text-right font-mono">{fmt(total / units)}</td>
            <td className="px-4 py-3 text-right">100.0%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function getLotDevUseSections(uf) {
  const land = uf.land_acquisition || {};
  const ent = uf.entitlement_costs || {};
  const hard = uf.hard_costs || {};
  const soft = uf.soft_costs || {};
  const impact = uf.impact_fees || {};
  const fin = uf.financing_costs || {};
  return [
    { title: 'Land Acquisition', items: [
      { label: 'Purchase Price', value: land.purchase_price },
      { label: 'Closing Costs', value: land.closing_costs },
      { label: 'Due Diligence', value: land.due_diligence?.total_due_diligence },
    ], subtotal: { label: 'Total Land Cost', value: land.total_land_cost } },
    { title: 'Entitlement Costs', items: [
      { label: 'Zoning & Plat Fees', value: (ent.zoning_application_fees || 0) + (ent.preliminary_plat_fees || 0) + (ent.final_plat_fees || 0) },
      { label: 'Environmental Permits', value: ent.environmental_permits },
      { label: 'Traffic Mitigation', value: ent.traffic_mitigation },
      { label: 'Civil Engineering Design', value: ent.civil_engineering_design },
      { label: 'Planning & Landscape', value: (ent.planning_consultant || 0) + (ent.landscape_architecture || 0) },
      { label: 'Legal & Other', value: (ent.legal_entitlement || 0) + (ent.other_entitlement || 0) + (ent.public_hearings_notices || 0) + (ent.development_agreement_fees || 0) },
      { label: `Contingency (${((ent.entitlement_contingency_percent || 0) * 100).toFixed(0)}%)`, value: ent.entitlement_contingency },
    ], subtotal: { label: 'Total Entitlement', value: ent.total_entitlement_costs } },
    { title: 'Infrastructure - Site Prep', items: [
      { label: 'Clearing & Grubbing', value: hard.clearing_grubbing },
      { label: 'Mass Grading', value: hard.mass_grading },
      { label: 'Erosion Control', value: hard.erosion_control },
    ], subtotal: { label: 'Site Prep Subtotal', value: hard.site_prep_subtotal } },
    { title: 'Infrastructure - Roads & Paving', items: [
      { label: 'Road Construction', value: hard.road_construction },
      { label: 'Curb & Gutter', value: hard.curb_gutter },
      { label: 'Sidewalks', value: hard.sidewalks },
      { label: 'Entrance Features', value: hard.entrance_features },
      { label: 'Signage & Striping', value: (hard.signage || 0) + (hard.striping_markers || 0) },
    ], subtotal: { label: 'Roads Subtotal', value: hard.roads_subtotal } },
    { title: 'Infrastructure - Utilities', items: [
      { label: 'Water (Main + Services)', value: (hard.water_main || 0) + (hard.water_services || 0) },
      { label: 'Sewer (Main + Services)', value: (hard.sanitary_sewer_main || 0) + (hard.sewer_services || 0) },
      { label: 'Storm Drainage', value: hard.storm_drainage },
      { label: 'Detention Ponds', value: hard.detention_ponds },
      { label: 'Electric (Primary + Secondary)', value: (hard.electric_primary || 0) + (hard.electric_secondary || 0) },
      { label: 'Gas & Telecom', value: (hard.gas_main || 0) + (hard.telecom_conduit || 0) },
    ], subtotal: { label: 'Utilities Subtotal', value: hard.utilities_subtotal } },
    { title: 'Amenities & Other', items: [
      { label: 'Trails & Parks', value: hard.trails_parks },
      { label: 'Playground', value: hard.playground },
      { label: 'Common Area Landscaping', value: hard.common_area_landscaping },
      { label: 'Entry Monument', value: hard.entry_monument },
      { label: 'Irrigation', value: hard.irrigation },
      { label: 'Street Lights', value: hard.street_lights },
      { label: 'Retaining Walls', value: hard.retaining_walls },
      { label: 'Other', value: (hard.mailbox_kiosk || 0) + (hard.other_hard_costs || 0) },
      { label: `Contingency (${((hard.hard_cost_contingency_percent || 0) * 100).toFixed(0)}%)`, value: hard.hard_cost_contingency },
    ], subtotal: { label: 'Total Hard Costs', value: hard.total_hard_costs } },
    { title: 'Soft Costs', items: [
      { label: 'Engineering (Construction)', value: soft.civil_engineering_construction },
      { label: 'Construction Management', value: soft.construction_management },
      { label: 'Legal & Closing', value: soft.legal_closing },
      { label: 'Insurance', value: soft.insurance },
      { label: 'Property Taxes', value: soft.property_taxes },
      { label: 'HOA Setup', value: soft.hoa_setup },
      { label: 'Marketing', value: soft.marketing },
      { label: `Contingency (${((soft.soft_cost_contingency_percent || 0) * 100).toFixed(0)}%)`, value: soft.soft_cost_contingency },
    ], subtotal: { label: 'Total Soft Costs', value: soft.total_soft_costs } },
    { title: 'Impact Fees (Developer)', items: [
      { label: 'Developer Responsibility', value: impact.developer_impact_fee_responsibility },
    ], subtotal: { label: 'Impact Fees', value: impact.developer_impact_fee_responsibility } },
    { title: 'Financing Costs', items: [
      { label: 'Origination Fees', value: (fin.acquisition_origination || 0) + (fin.development_origination || 0) },
      { label: 'Interest Reserve', value: fin.interest_reserve },
      { label: 'Other', value: fin.other_loan_fees },
    ], subtotal: { label: 'Total Financing', value: fin.total_financing_costs } },
  ];
}

function getCommunityUseSections(uf) {
  const land = uf.land_acquisition || {};
  const dev = uf.land_development || {};
  const vert = uf.vertical_costs || {};
  const ind = uf.indirect_costs || {};
  const impact = uf.impact_fees || {};
  const fin = uf.financing_costs || {};
  return [
    { title: 'Land Acquisition', items: [
      { label: 'Raw Land Purchase', value: land.raw_land_purchase },
      { label: 'Closing Costs', value: land.closing_costs },
      { label: 'Due Diligence', value: land.due_diligence },
    ], subtotal: { label: 'Total Land', value: land.total_land_cost } },
    { title: 'Land Development (Horizontal)', items: [
      { label: 'Site Preparation', value: dev.site_preparation },
      { label: 'Roads & Paving', value: dev.roads_paving },
      { label: 'Utilities', value: dev.utilities },
      { label: 'Drainage & Stormwater', value: dev.drainage_stormwater },
      { label: 'Amenities', value: dev.amenities },
      { label: 'Landscaping & Entry', value: (dev.landscaping_common || 0) + (dev.entry_features || 0) },
      { label: `Contingency (${((dev.land_dev_contingency_percent || 0) * 100).toFixed(0)}%)`, value: dev.land_dev_contingency },
    ], subtotal: { label: 'Total Land Dev', value: dev.total_land_development } },
    { title: 'Vertical Construction', items: [
      ...(vert.costs_by_plan || []).map(p => ({ label: `${p.plan_name} (${p.cost_per_sf ? '$' + p.cost_per_sf.toFixed(0) + '/sf' : ''})`, value: p.total_direct_cost * ((uf.vertical_costs?.costs_by_plan?.find(pp => pp.plan_name === p.plan_name) ? 1 : 0)) })),
      { label: 'Weighted Avg Cost/Home', value: vert.weighted_avg_total_direct },
    ], subtotal: { label: 'Total Vertical', value: vert.total_vertical_construction } },
    { title: 'Indirect Costs', items: [
      { label: 'Field Supervision', value: ind.field_supervision },
      { label: 'Insurance & Warranty', value: (ind.construction_insurance || 0) + (ind.warranty_reserve || 0) },
      { label: 'Model Homes & Sales Center', value: (ind.model_home_cost || 0) + (ind.model_furniture_decor || 0) + (ind.sales_center || 0) },
      { label: 'Marketing', value: ind.marketing_advertising },
      { label: 'Sales Commissions', value: ind.sales_commissions },
      { label: 'Project Management', value: ind.project_management },
      { label: 'Accounting & Legal', value: (ind.accounting_legal || 0) + (ind.office_overhead || 0) },
    ], subtotal: { label: 'Total Indirect', value: ind.total_indirect_costs } },
    { title: 'Impact Fees', items: [
      { label: `Per Home (${fmt2(impact.per_home_fees?.total_per_home)}/home)`, value: impact.total_impact_fees },
    ], subtotal: { label: 'Total Impact Fees', value: impact.total_impact_fees } },
    { title: 'Financing Costs', items: [
      { label: 'Origination Fees', value: (fin.land_loan_origination || 0) + (fin.construction_line_origination || 0) },
      { label: 'Interest Reserve', value: fin.interest_reserve },
      { label: 'Other', value: fin.other_fees },
    ], subtotal: { label: 'Total Financing', value: fin.total_financing_costs } },
  ];
}

function getBTRUseSections(uf) {
  const land = uf.land_acquisition || {};
  const site = uf.development_costs?.site_work || {};
  const vert = uf.development_costs?.vertical_construction || {};
  const soft = uf.development_costs?.soft_costs || {};
  const fin = uf.financing_costs || {};
  return [
    { title: 'Land Acquisition', items: [
      { label: 'Purchase Price', value: land.purchase_price },
      { label: 'Closing & DD', value: (land.closing_costs || 0) + (land.due_diligence || 0) },
    ], subtotal: { label: 'Total Land', value: land.total_land_cost } },
    { title: 'Site Work', items: [
      { label: 'Demolition & Clearing', value: site.demolition_clearing },
      { label: 'Mass Grading', value: site.mass_grading },
      { label: 'Utilities', value: site.utilities },
      { label: 'Paving & Parking', value: site.paving_parking },
      { label: 'Landscaping', value: site.landscaping },
      { label: 'Amenity Site Work', value: site.amenity_site_work },
    ], subtotal: { label: 'Total Site Work', value: site.total_site_work } },
    { title: 'Vertical Construction', items: [
      { label: 'Building Shell', value: vert.building_shell },
      { label: 'MEP', value: vert.mechanical_electrical_plumbing },
      { label: 'Interior Finishes', value: vert.interior_finishes },
      { label: 'Appliances', value: vert.appliances },
      { label: 'Amenity Building', value: vert.amenity_building },
    ], subtotal: { label: 'Total Vertical', value: vert.total_vertical } },
    { title: 'Soft Costs', items: [
      { label: 'Architecture & Engineering', value: soft.architecture_engineering },
      { label: 'Permits & Fees', value: soft.permits_fees },
      { label: 'Impact Fees', value: soft.impact_fees },
      { label: 'Legal & Accounting', value: (soft.legal || 0) + (soft.accounting || 0) },
      { label: 'Insurance', value: soft.insurance },
      { label: 'Taxes (Construction)', value: soft.property_taxes_construction },
      { label: 'Marketing & Lease-Up', value: soft.marketing_lease_up },
      { label: `Contingency (${((soft.contingency_percent || 0) * 100).toFixed(0)}%)`, value: soft.contingency },
      { label: `Developer Fee (${((soft.developer_fee_percent || 0) * 100).toFixed(0)}%)`, value: soft.developer_fee },
    ], subtotal: { label: 'Total Soft Costs', value: soft.total_soft_costs } },
    { title: 'Financing Costs', items: [
      { label: 'Origination', value: fin.construction_origination },
      { label: 'Interest Reserve', value: fin.interest_reserve },
      { label: 'Exit Fee', value: fin.exit_fee },
      { label: 'Other', value: fin.other_fees },
    ], subtotal: { label: 'Total Financing', value: fin.total_financing_costs } },
  ];
}

function getScatteredLotUseSections(uf) {
  const land = uf.land_acquisition || {};
  const hard = uf.hard_costs || {};
  const soft = uf.soft_costs || {};
  const fin = uf.financing_costs || {};
  return [
    { title: 'Land Acquisition', items: [
      { label: 'Purchase Price', value: land.purchase_price },
      { label: 'Closing Costs', value: land.closing_costs },
      { label: 'Due Diligence', value: land.due_diligence_costs },
    ], subtotal: { label: 'Total Land Cost', value: land.total_land_cost } },
    { title: 'Hard Costs - Site Work', items: [
      { label: 'Site Preparation', value: hard.site_preparation },
      { label: 'Excavation & Grading', value: hard.excavation_grading },
      { label: 'Utilities Connections', value: hard.utilities_connections },
      { label: 'Driveway & Sidewalks', value: hard.driveway_sidewalks },
      { label: 'Landscaping', value: hard.landscaping },
    ], subtotal: { label: 'Site Work Subtotal', value: hard.site_work_subtotal } },
    { title: 'Hard Costs - Vertical Construction', items: [
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
    ], subtotal: { label: 'Vertical Subtotal', value: hard.vertical_subtotal } },
    { title: 'Hard Costs - Other', items: [
      { label: 'Permits & Fees', value: hard.permits_fees },
      { label: 'Utility Impact Fees', value: hard.utility_impact_fees },
      { label: 'Other', value: hard.other_hard_costs },
      { label: `Contingency (${((hard.hard_cost_contingency_percent || 0) * 100).toFixed(0)}%)`, value: hard.hard_cost_contingency },
    ], subtotal: { label: 'Total Hard Costs', value: hard.total_hard_costs } },
    { title: 'Soft Costs', items: [
      { label: 'Architecture & Design', value: soft.architecture_design },
      { label: 'Engineering', value: soft.engineering },
      { label: 'Surveys', value: soft.surveys },
      { label: 'Permits & Entitlements', value: soft.permits_entitlements },
      { label: 'Legal Fees', value: soft.legal_fees },
      { label: 'Accounting', value: soft.accounting },
      { label: "Builder's Risk Insurance", value: soft.insurance_builders_risk },
      { label: 'Property Taxes', value: soft.property_taxes_construction },
      { label: 'Marketing', value: soft.marketing_advertising },
      { label: 'Staging', value: soft.staging },
      { label: `Contingency (${((soft.soft_cost_contingency_percent || 0) * 100).toFixed(0)}%)`, value: soft.soft_cost_contingency },
    ], subtotal: { label: 'Total Soft Costs', value: soft.total_soft_costs } },
    { title: 'Financing Costs', items: [
      { label: 'Origination Fee', value: fin.origination_fee },
      { label: 'Interest Reserve', value: fin.interest_reserve },
      { label: 'Other Loan Fees', value: fin.other_loan_fees },
    ], subtotal: { label: 'Total Financing', value: fin.total_financing_costs } },
  ];
}

function CostSection({ section, total, units, fmt }) {
  return (
    <>
      <tr className="bg-gray-50/50">
        <td colSpan={4} className="px-4 py-2 font-semibold text-gray-800 text-xs uppercase tracking-wider">{section.title}</td>
      </tr>
      {section.items.filter(i => i.value > 0).map(item => (
        <tr key={item.label} className="border-b border-gray-100 hover:bg-gray-50/30">
          <td className="px-4 py-1.5 pl-8 text-gray-700">{item.label}</td>
          <td className="px-4 py-1.5 text-right font-mono text-gray-900">{fmt(item.value)}</td>
          <td className="px-4 py-1.5 text-right font-mono text-gray-500 text-xs">{fmt(item.value / units)}</td>
          <td className="px-4 py-1.5 text-right text-gray-500 text-xs">{total > 0 ? `${((item.value / total) * 100).toFixed(1)}%` : '—'}</td>
        </tr>
      ))}
      {section.subtotal && (
        <tr className="border-b font-medium">
          <td className="px-4 py-2 pl-6 text-gray-900">{section.subtotal.label}</td>
          <td className="px-4 py-2 text-right font-mono font-bold">{fmt(section.subtotal.value)}</td>
          <td className="px-4 py-2 text-right font-mono text-gray-600 text-xs">{fmt((section.subtotal.value || 0) / units)}</td>
          <td className="px-4 py-2 text-right font-medium">{total > 0 ? `${(((section.subtotal.value || 0) / total) * 100).toFixed(1)}%` : '—'}</td>
        </tr>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3: SOURCES OF FUNDS
// ═══════════════════════════════════════════════════════════════════════════════

function SourcesOfFundsTab({ sf, metrics, proforma, fmt, pct, pct2 }) {
  const loans = sf.loans || [];
  const equity = sf.equity || sf.development_financing?.equity || {};
  const sourcesMinusUses = (metrics.totalDebt + metrics.totalEquity) - metrics.totalCosts;

  return (
    <div className="space-y-5">
      <div className={`border rounded-lg p-3 flex items-center gap-2 text-sm ${Math.abs(sourcesMinusUses) < 100 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
        {Math.abs(sourcesMinusUses) < 100 ? <><Check className="w-4 h-4" /> Sources = Uses (Balanced)</> : <><AlertTriangle className="w-4 h-4" /> Sources {sourcesMinusUses > 0 ? 'exceed' : 'short of'} Uses by {fmt(Math.abs(sourcesMinusUses))}</>}
      </div>
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide flex items-center gap-2"><Landmark className="w-4 h-4" /> Debt</h3>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs font-medium text-gray-500 uppercase">
            <th className="pb-2">Loan</th><th className="pb-2">Type</th><th className="pb-2 text-right">Amount</th><th className="pb-2 text-right">LTC</th><th className="pb-2 text-right">Rate</th><th className="pb-2 text-right">Term</th>
          </tr></thead>
          <tbody className="divide-y">
            {loans.map(loan => (
              <tr key={loan.id}>
                <td className="py-2 font-medium">{loan.name}</td>
                <td className="py-2 capitalize text-gray-600">{loan.type}</td>
                <td className="py-2 text-right font-mono">{fmt(loan.amount || loan.loan_amount)}</td>
                <td className="py-2 text-right">{pct(loan.ltc_percent || (metrics.totalCosts > 0 ? (loan.amount || loan.loan_amount) / metrics.totalCosts : 0))}</td>
                <td className="py-2 text-right">{pct2(loan.interest_rate)}</td>
                <td className="py-2 text-right">{loan.term_months}mo</td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr className="border-t font-bold"><td className="pt-2" colSpan={2}>Total Debt</td><td className="pt-2 text-right font-mono">{fmt(metrics.totalDebt)}</td><td className="pt-2 text-right">{pct(metrics.ltcRatio)}</td><td colSpan={2}></td></tr></tfoot>
        </table>
      </div>
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide flex items-center gap-2"><PiggyBank className="w-4 h-4" /> Equity</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center"><div className="text-xs text-gray-500 uppercase mb-1">Total Required</div><div className="text-lg font-bold">{fmt(equity.total_equity_required || equity.total_equity)}</div></div>
          <div className="bg-blue-50 rounded-lg p-3 text-center"><div className="text-xs text-blue-600 uppercase mb-1">Investor ({pct(equity.investor_equity_percent || 0.80)})</div><div className="text-lg font-bold text-blue-800">{fmt(equity.investor_equity)}</div></div>
          <div className="bg-green-50 rounded-lg p-3 text-center"><div className="text-xs text-green-600 uppercase mb-1">Sponsor ({pct(equity.sponsor_equity_percent || 0.20)})</div><div className="text-lg font-bold text-green-800">{fmt(equity.sponsor_equity)}</div></div>
        </div>
        <div className="text-sm space-y-1">
          <LabelValue label="Preferred Return" value={pct(equity.preferred_return)} />
          {equity.promote_structure?.map((tier, i) => (
            <LabelValue key={i} label={tier.label || `Promote Tier ${i + 1}`} value={`${((tier.split || 0) * 100).toFixed(0)}% to sponsor above ${pct(tier.hurdle)} IRR`} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4: REVENUE (Template-specific)
// ═══════════════════════════════════════════════════════════════════════════════

function RevenueTab({ rev, assumptions, metrics, templateType, fmt, pct }) {
  if (templateType === 'lot_development') return <LotRevenueTab rev={rev} assumptions={assumptions} metrics={metrics} fmt={fmt} pct={pct} />;
  if (templateType === 'community_for_sale') return <CommunityRevenueTab rev={rev} assumptions={assumptions} metrics={metrics} fmt={fmt} pct={pct} />;
  if (templateType === 'build_to_rent') return <BTRRevenueTab assumptions={assumptions} metrics={metrics} fmt={fmt} pct={pct} />;
  return <ScatteredLotRevenueTab rev={rev} assumptions={assumptions} metrics={metrics} fmt={fmt} pct={pct} />;
}

function LotRevenueTab({ rev, assumptions, metrics, fmt, pct }) {
  const pricing = rev.pricing_by_type || [];
  return (
    <div className="space-y-5">
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Lot Pricing by Type</h3>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-xs font-medium text-gray-500 uppercase">
            <th className="pb-2 text-left">Lot Type</th><th className="pb-2 text-right">Count</th><th className="pb-2 text-right">Base Price</th><th className="pb-2 text-right">Premiums</th><th className="pb-2 text-right">Avg Price</th><th className="pb-2 text-right">Total Revenue</th>
          </tr></thead>
          <tbody className="divide-y">
            {pricing.map(p => (
              <tr key={p.lot_type}>
                <td className="py-2 font-medium">{p.lot_type}</td>
                <td className="py-2 text-right">{p.lot_count}</td>
                <td className="py-2 text-right font-mono">{fmt(p.base_price)}</td>
                <td className="py-2 text-right text-gray-500">{p.premium_lots} @ {fmt(p.premium_amount)}</td>
                <td className="py-2 text-right font-mono">{fmt(p.average_price)}</td>
                <td className="py-2 text-right font-mono font-bold">{fmt(p.total_revenue)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr className="border-t-2 font-bold"><td className="pt-2">Total</td><td className="pt-2 text-right">{assumptions.total_lots}</td><td colSpan={2}></td><td className="pt-2 text-right font-mono">{fmt(rev.average_lot_price)}</td><td className="pt-2 text-right font-mono">{fmt(rev.total_lot_revenue)}</td></tr></tfoot>
        </table>
      </div>
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Net Revenue</h3>
        <div className="space-y-1 text-sm">
          <LabelValue label="Gross Lot Revenue" value={fmt(rev.total_lot_revenue)} bold />
          <LabelValue label={`Less: Broker (${pct(rev.broker_commission_percent)})`} value={`(${fmt(rev.broker_commission)})`} className="text-red-600 pl-3" />
          <LabelValue label="Less: Closing Costs" value={`(${fmt(rev.total_closing_costs)})`} className="text-red-600 pl-3" />
          {rev.total_marketing > 0 && <LabelValue label="Less: Marketing" value={`(${fmt(rev.total_marketing)})`} className="text-red-600 pl-3" />}
          <div className="border-t my-2" />
          <LabelValue label="Net Lot Revenue" value={fmt(rev.net_lot_revenue)} bold color="green" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-3 text-center"><div className="text-xs text-gray-500 mb-1">Avg Lot Price</div><div className="text-lg font-bold">{fmt(rev.average_lot_price)}</div></div>
        <div className="bg-gray-50 rounded-lg p-3 text-center"><div className="text-xs text-gray-500 mb-1">$/Front Foot</div><div className="text-lg font-bold">{fmt(rev.price_per_front_foot)}</div></div>
        <div className="bg-green-50 rounded-lg p-3 text-center"><div className="text-xs text-gray-500 mb-1">Profit/Lot</div><div className="text-lg font-bold text-green-700">{fmt(metrics.profitPerLot)}</div></div>
        <div className="bg-blue-50 rounded-lg p-3 text-center"><div className="text-xs text-gray-500 mb-1">Dev Spread</div><div className="text-lg font-bold text-blue-700">{pct(metrics.developmentSpread)}</div></div>
      </div>
    </div>
  );
}

function CommunityRevenueTab({ rev, assumptions, metrics, fmt, pct }) {
  const plans = rev.home_sales_by_plan || [];
  return (
    <div className="space-y-5">
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Product Mix & Revenue</h3>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-xs font-medium text-gray-500 uppercase">
            <th className="pb-2 text-left">Plan</th><th className="pb-2 text-right">Count</th><th className="pb-2 text-right">Base Price</th><th className="pb-2 text-right">Lot Prem.</th><th className="pb-2 text-right">Options</th><th className="pb-2 text-right">Avg Sale</th><th className="pb-2 text-right">Total</th>
          </tr></thead>
          <tbody className="divide-y">
            {plans.map(p => (
              <tr key={p.plan_name}>
                <td className="py-2 font-medium">{p.plan_name}</td>
                <td className="py-2 text-right">{p.count}</td>
                <td className="py-2 text-right font-mono">{fmt(p.base_price)}</td>
                <td className="py-2 text-right font-mono text-gray-500">{fmt(p.avg_lot_premium)}</td>
                <td className="py-2 text-right font-mono text-gray-500">{fmt(p.avg_options)}</td>
                <td className="py-2 text-right font-mono">{fmt(p.avg_sale_price)}</td>
                <td className="py-2 text-right font-mono font-bold">{fmt(p.total_revenue)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr className="border-t-2 font-bold"><td className="pt-2">Total</td><td className="pt-2 text-right">{assumptions.total_homes}</td><td colSpan={3}></td><td className="pt-2 text-right font-mono">{fmt(rev.average_sale_price)}</td><td className="pt-2 text-right font-mono">{fmt(rev.total_home_sales_revenue)}</td></tr></tfoot>
        </table>
      </div>
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Net Revenue</h3>
        <div className="space-y-1 text-sm">
          <LabelValue label="Gross Home Sales" value={fmt(rev.total_home_sales_revenue)} bold />
          <LabelValue label="Less: Commissions" value={`(${fmt(rev.less_commissions)})`} className="text-red-600 pl-3" />
          <LabelValue label="Less: Closing Costs" value={`(${fmt(rev.less_closing_costs)})`} className="text-red-600 pl-3" />
          <div className="border-t my-2" />
          <LabelValue label="Net Revenue" value={fmt(rev.net_revenue)} bold color="green" />
        </div>
      </div>
    </div>
  );
}

function BTRRevenueTab({ assumptions, metrics, fmt, pct }) {
  const unitMix = assumptions.unit_mix || [];
  return (
    <div className="space-y-5">
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Unit Mix & Rent Roll</h3>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-xs font-medium text-gray-500 uppercase">
            <th className="pb-2 text-left">Unit Type</th><th className="pb-2 text-right">Count</th><th className="pb-2 text-right">SF</th><th className="pb-2 text-right">Monthly Rent</th><th className="pb-2 text-right">$/SF/Mo</th><th className="pb-2 text-right">Annual Rent</th>
          </tr></thead>
          <tbody className="divide-y">
            {unitMix.map(u => (
              <tr key={u.unit_type}>
                <td className="py-2 font-medium">{u.unit_type}</td>
                <td className="py-2 text-right">{u.unit_count}</td>
                <td className="py-2 text-right">{u.square_footage.toLocaleString()}</td>
                <td className="py-2 text-right font-mono">{fmt(u.monthly_rent)}</td>
                <td className="py-2 text-right font-mono text-gray-500">${(u.monthly_rent / u.square_footage).toFixed(2)}</td>
                <td className="py-2 text-right font-mono">{fmt(u.annual_rent * u.unit_count)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr className="border-t-2 font-bold"><td className="pt-2">Total</td><td className="pt-2 text-right">{assumptions.total_units}</td><td className="pt-2 text-right">{(assumptions.average_unit_sf || 0).toLocaleString()}</td><td className="pt-2 text-right font-mono">{fmt(assumptions.average_monthly_rent)}</td><td className="pt-2 text-right font-mono">${(assumptions.average_rent_per_sf || 0).toFixed(2)}</td><td className="pt-2 text-right font-mono">{fmt(metrics.grossPotentialRent)}</td></tr></tfoot>
        </table>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-3 text-center"><div className="text-xs text-blue-600 mb-1">Dev Yield</div><div className="text-xl font-bold text-blue-800">{pct(metrics.developmentYield)}</div></div>
        <div className="bg-gray-50 rounded-lg p-3 text-center"><div className="text-xs text-gray-500 mb-1">NOI/Unit</div><div className="text-xl font-bold">{fmt(metrics.noiPerUnit)}</div></div>
        <div className="bg-gray-50 rounded-lg p-3 text-center"><div className="text-xs text-gray-500 mb-1">Expense Ratio</div><div className="text-xl font-bold">{pct(metrics.expenseRatio)}</div></div>
        <div className="bg-green-50 rounded-lg p-3 text-center"><div className="text-xs text-green-600 mb-1">Stabilized Value</div><div className="text-xl font-bold text-green-800">{fmt(metrics.stabilizedValue)}</div></div>
      </div>
    </div>
  );
}

function ScatteredLotRevenueTab({ rev, assumptions, metrics, fmt, pct }) {
  return (
    <div className="space-y-5">
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Sale Price Analysis</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-green-50 rounded-lg p-3 text-center"><div className="text-xs text-green-600 uppercase mb-1">Sale Price</div><div className="text-xl font-bold text-green-800">{fmt(rev.estimated_sale_price || rev.gross_sale_price)}</div></div>
          <div className="bg-gray-50 rounded-lg p-3 text-center"><div className="text-xs text-gray-500 uppercase mb-1">Price per SF</div><div className="text-xl font-bold">${(rev.price_per_sf || 0).toFixed(2)}</div></div>
          <div className="bg-gray-50 rounded-lg p-3 text-center"><div className="text-xs text-gray-500 uppercase mb-1">Profit Margin</div><div className="text-xl font-bold">{pct(metrics.grossMargin)}</div></div>
        </div>
        {rev.comparable_basis && <div className="text-sm text-gray-600 bg-gray-50 rounded p-2 italic">{rev.comparable_basis}</div>}
      </div>
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Net Proceeds</h3>
        <div className="space-y-1 text-sm">
          <LabelValue label="Gross Sale Price" value={fmt(rev.gross_sale_price)} bold />
          <LabelValue label={`Less: Broker (${pct(rev.broker_commission_percent || assumptions.broker_commission_percent)})`} value={`(${fmt(rev.broker_commission)})`} className="text-red-600 pl-3" />
          <LabelValue label="Less: Closing Costs" value={`(${fmt(rev.seller_closing_costs)})`} className="text-red-600 pl-3" />
          {rev.concessions > 0 && <LabelValue label="Less: Concessions" value={`(${fmt(rev.concessions)})`} className="text-red-600 pl-3" />}
          <div className="border-t my-2" />
          <LabelValue label="Net Sale Proceeds" value={fmt(rev.net_sale_proceeds)} bold color="green" />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 5: OPERATIONS (BTR only)
// ═══════════════════════════════════════════════════════════════════════════════

function OperationsTab({ proforma, metrics, annualProforma, fmt, pct }) {
  const ops = proforma.operating_assumptions || {};
  const expenses = ops.expenses || {};
  const exit = proforma.exit_assumptions || {};

  return (
    <div className="space-y-5">
      {/* Stabilized NOI */}
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white border rounded-lg p-5">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Stabilized Income</h3>
          <div className="space-y-1 text-sm">
            <LabelValue label="Gross Potential Rent" value={fmt(ops.gross_potential_rent)} bold />
            <LabelValue label="Other Income" value={fmt(ops.other_income)} className="pl-3" />
            <LabelValue label="Gross Potential Income" value={fmt(ops.gross_potential_income)} />
            <LabelValue label={`Less: Vacancy (${pct(ops.vacancy_rate)})`} value={`(${fmt(ops.gross_potential_income * (ops.vacancy_rate || 0.05))})`} className="text-red-600 pl-3" />
            <LabelValue label="Effective Gross Income" value={fmt(ops.effective_gross_income)} bold />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-5">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Operating Expenses</h3>
          <div className="space-y-1 text-sm">
            <LabelValue label="Property Management" value={fmt(expenses.property_management)} />
            <LabelValue label="Payroll" value={fmt(expenses.payroll)} />
            <LabelValue label="Utilities" value={fmt(expenses.utilities)} />
            <LabelValue label="R&M / Turnover" value={fmt((expenses.repairs_maintenance || 0) + (expenses.turnover_costs || 0))} />
            <LabelValue label="Insurance" value={fmt(expenses.insurance)} />
            <LabelValue label="Property Taxes" value={fmt(expenses.property_taxes)} />
            <LabelValue label="Reserves" value={fmt(expenses.replacement_reserves)} />
            <LabelValue label="Other" value={fmt((expenses.landscaping || 0) + (expenses.marketing || 0) + (expenses.general_admin || 0) + (expenses.professional_fees || 0))} />
            <div className="border-t my-1" />
            <LabelValue label="Total Operating Expenses" value={fmt(expenses.total_operating_expenses)} bold />
            <LabelValue label="Net Operating Income" value={fmt(ops.net_operating_income)} bold color="green" />
          </div>
        </div>
      </div>

      {/* Exit Analysis */}
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Exit Analysis (Year {exit.hold_period_years || 5})</h3>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center"><div className="text-xs text-gray-500 mb-1">Terminal NOI</div><div className="text-lg font-bold">{fmt(metrics.terminalNOI)}</div></div>
          <div className="bg-gray-50 rounded-lg p-3 text-center"><div className="text-xs text-gray-500 mb-1">Exit Cap</div><div className="text-lg font-bold">{pct(exit.exit_cap_rate)}</div></div>
          <div className="bg-green-50 rounded-lg p-3 text-center"><div className="text-xs text-green-600 mb-1">Sale Price</div><div className="text-lg font-bold text-green-800">{fmt(metrics.grossSalePrice)}</div></div>
          <div className="bg-blue-50 rounded-lg p-3 text-center"><div className="text-xs text-blue-600 mb-1">Value Created</div><div className="text-lg font-bold text-blue-800">{fmt(metrics.valueCreation)}</div></div>
        </div>
        <div className="text-sm space-y-1">
          <LabelValue label="Price/Unit" value={fmt(metrics.totalUnits > 0 ? metrics.grossSalePrice / metrics.totalUnits : 0)} />
          <LabelValue label="Price/SF" value={`$${metrics.totalRentableSF > 0 ? (metrics.grossSalePrice / metrics.totalRentableSF).toFixed(0) : 0}`} />
          <LabelValue label="Value Creation %" value={pct(metrics.valueCreationPercent)} />
        </div>
      </div>

      {/* Annual Pro Forma Table */}
      {annualProforma && annualProforma.length > 0 && (
        <div className="bg-white border rounded-lg p-5">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Annual Operating Pro Forma</h3>
          <table className="w-full text-xs">
            <thead><tr className="border-b text-[10px] font-semibold text-gray-500 uppercase">
              <th className="pb-2 text-left">Year</th><th className="pb-2 text-right">GPR</th><th className="pb-2 text-right">Vacancy</th><th className="pb-2 text-right">EGI</th><th className="pb-2 text-right">OpEx</th><th className="pb-2 text-right text-green-700">NOI</th><th className="pb-2 text-right">Growth</th>
            </tr></thead>
            <tbody className="divide-y font-mono">
              {annualProforma.map(yr => (
                <tr key={yr.year}>
                  <td className="py-1.5 font-sans font-medium">Yr {yr.year}</td>
                  <td className="py-1.5 text-right">{fmt(yr.gross_potential_rent)}</td>
                  <td className="py-1.5 text-right text-red-600">({fmt(yr.vacancy_loss)})</td>
                  <td className="py-1.5 text-right">{fmt(yr.effective_gross_income)}</td>
                  <td className="py-1.5 text-right text-red-600">({fmt(yr.operating_expenses)})</td>
                  <td className="py-1.5 text-right text-green-700 font-bold">{fmt(yr.net_operating_income)}</td>
                  <td className="py-1.5 text-right text-gray-500">{yr.year > 1 ? pct(yr.noi_growth) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: CASH FLOW
// ═══════════════════════════════════════════════════════════════════════════════

function CashFlowTab({ cashFlows, templateType, fmt }) {
  if (!cashFlows.length) return <div className="text-gray-500">No cash flow data.</div>;

  if (templateType === 'lot_development') return <LotDevCashFlowTab cashFlows={cashFlows} fmt={fmt} />;
  if (templateType === 'community_for_sale') return <CommunityCashFlowTab cashFlows={cashFlows} fmt={fmt} />;
  if (templateType === 'build_to_rent') return <BTRCashFlowTab cashFlows={cashFlows} fmt={fmt} />;
  return <ScatteredLotCashFlowTab cashFlows={cashFlows} fmt={fmt} />;
}

function ScatteredLotCashFlowTab({ cashFlows, fmt }) {
  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="bg-gray-50 border-b text-[10px] font-semibold text-gray-500 uppercase">
            <th className="px-2 py-2 sticky left-0 bg-gray-50">Mo</th>
            <th className="px-2 py-2 text-right text-green-700">Equity</th>
            <th className="px-2 py-2 text-right text-green-700">Debt</th>
            <th className="px-2 py-2 text-right text-green-700">Sale</th>
            <th className="px-2 py-2 text-right text-red-700">Land</th>
            <th className="px-2 py-2 text-right text-red-700">Hard</th>
            <th className="px-2 py-2 text-right text-red-700">Soft</th>
            <th className="px-2 py-2 text-right text-red-700">Interest</th>
            <th className="px-2 py-2 text-right font-bold">Net CF</th>
            <th className="px-2 py-2 text-right">Loan Bal</th>
          </tr></thead>
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
                <td className={`px-2 py-1 text-right font-bold ${cf.net_cash_flow >= 0 ? 'text-green-700' : 'text-red-700'}`}>{fmt(cf.net_cash_flow)}</td>
                <td className="px-2 py-1 text-right text-gray-600">{fmt(cf.loan_balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LotDevCashFlowTab({ cashFlows, fmt }) {
  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="bg-gray-50 border-b text-[10px] font-semibold text-gray-500 uppercase">
            <th className="px-2 py-2 sticky left-0 bg-gray-50">Mo</th>
            <th className="px-2 py-2">Phase</th>
            <th className="px-2 py-2 text-right text-green-700">Lots Sold</th>
            <th className="px-2 py-2 text-right text-green-700">Lot Revenue</th>
            <th className="px-2 py-2 text-right text-red-700">Hard Costs</th>
            <th className="px-2 py-2 text-right text-red-700">Interest</th>
            <th className="px-2 py-2 text-right font-bold">Net CF</th>
            <th className="px-2 py-2 text-right text-blue-700">Cumul.</th>
            <th className="px-2 py-2 text-right">Loan Bal</th>
          </tr></thead>
          <tbody className="divide-y font-mono">
            {cashFlows.map(cf => (
              <tr key={cf.month}>
                <td className="px-2 py-1 sticky left-0 bg-white font-sans font-medium">{cf.month}</td>
                <td className="px-2 py-1 font-sans text-gray-500 text-[10px]">{cf.phase}</td>
                <td className="px-2 py-1 text-right text-green-600">{cf.lots_sold > 0 ? cf.lots_sold : '—'}</td>
                <td className="px-2 py-1 text-right text-green-600">{cf.lot_sale_revenue > 0 ? fmt(cf.lot_sale_revenue) : '—'}</td>
                <td className="px-2 py-1 text-right text-red-600">{cf.hard_cost_payment > 0 ? fmt(cf.hard_cost_payment) : '—'}</td>
                <td className="px-2 py-1 text-right text-red-600">{cf.interest_payment > 0 ? fmt(cf.interest_payment) : '—'}</td>
                <td className={`px-2 py-1 text-right font-bold ${cf.net_cash_flow >= 0 ? 'text-green-700' : 'text-red-700'}`}>{fmt(cf.net_cash_flow)}</td>
                <td className={`px-2 py-1 text-right ${cf.cumulative_cash_flow >= 0 ? 'text-blue-700' : 'text-red-700'}`}>{fmt(cf.cumulative_cash_flow)}</td>
                <td className="px-2 py-1 text-right text-gray-600">{fmt(cf.loan_balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CommunityCashFlowTab({ cashFlows, fmt }) {
  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="bg-gray-50 border-b text-[10px] font-semibold text-gray-500 uppercase">
            <th className="px-2 py-2 sticky left-0 bg-gray-50">Mo</th>
            <th className="px-2 py-2 text-right">Sales</th>
            <th className="px-2 py-2 text-right">Closings</th>
            <th className="px-2 py-2 text-right text-green-700">Revenue</th>
            <th className="px-2 py-2 text-right text-red-700">Land Dev</th>
            <th className="px-2 py-2 text-right text-red-700">Vertical</th>
            <th className="px-2 py-2 text-right text-red-700">Interest</th>
            <th className="px-2 py-2 text-right font-bold">Net CF</th>
            <th className="px-2 py-2 text-right">Loan Bal</th>
          </tr></thead>
          <tbody className="divide-y font-mono">
            {cashFlows.filter((_, i) => i % 3 === 0 || i === cashFlows.length - 1).map(cf => (
              <tr key={cf.month}>
                <td className="px-2 py-1 sticky left-0 bg-white font-sans font-medium">{cf.month}</td>
                <td className="px-2 py-1 text-right">{cf.new_sales > 0 ? cf.new_sales : '—'}</td>
                <td className="px-2 py-1 text-right">{cf.closings > 0 ? cf.closings : '—'}</td>
                <td className="px-2 py-1 text-right text-green-600">{cf.home_sale_revenue > 0 ? fmt(cf.home_sale_revenue) : '—'}</td>
                <td className="px-2 py-1 text-right text-red-600">{cf.land_dev_payment > 0 ? fmt(cf.land_dev_payment) : '—'}</td>
                <td className="px-2 py-1 text-right text-red-600">{cf.vertical_payment > 0 ? fmt(cf.vertical_payment) : '—'}</td>
                <td className="px-2 py-1 text-right text-red-600">{cf.interest_payment > 0 ? fmt(cf.interest_payment) : '—'}</td>
                <td className={`px-2 py-1 text-right font-bold ${cf.net_cash_flow >= 0 ? 'text-green-700' : 'text-red-700'}`}>{fmt(cf.net_cash_flow)}</td>
                <td className="px-2 py-1 text-right text-gray-600">{fmt(cf.loan_balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BTRCashFlowTab({ cashFlows, fmt }) {
  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="bg-gray-50 border-b text-[10px] font-semibold text-gray-500 uppercase">
            <th className="px-2 py-2 sticky left-0 bg-gray-50">Mo</th>
            <th className="px-2 py-2">Phase</th>
            <th className="px-2 py-2 text-right">Occ%</th>
            <th className="px-2 py-2 text-right text-green-700">Rent</th>
            <th className="px-2 py-2 text-right text-red-700">Hard</th>
            <th className="px-2 py-2 text-right text-red-700">Interest</th>
            <th className="px-2 py-2 text-right text-blue-700">NOI</th>
            <th className="px-2 py-2 text-right font-bold">Net CF</th>
            <th className="px-2 py-2 text-right">Loan Bal</th>
          </tr></thead>
          <tbody className="divide-y font-mono">
            {cashFlows.map(cf => (
              <tr key={cf.month} className={cf.phase === 'Stabilized' ? 'bg-green-50/30' : ''}>
                <td className="px-2 py-1 sticky left-0 bg-white font-sans font-medium">{cf.month}</td>
                <td className="px-2 py-1 font-sans text-gray-500 text-[10px]">{cf.phase}</td>
                <td className="px-2 py-1 text-right">{(cf.occupancy_percent * 100).toFixed(0)}%</td>
                <td className="px-2 py-1 text-right text-green-600">{cf.rental_income > 0 ? fmt(cf.rental_income) : '—'}</td>
                <td className="px-2 py-1 text-right text-red-600">{cf.hard_cost_payment > 0 ? fmt(cf.hard_cost_payment) : '—'}</td>
                <td className="px-2 py-1 text-right text-red-600">{cf.interest_payment > 0 ? fmt(cf.interest_payment) : '—'}</td>
                <td className="px-2 py-1 text-right text-blue-700">{cf.noi > 0 ? fmt(cf.noi) : '—'}</td>
                <td className={`px-2 py-1 text-right font-bold ${cf.net_cash_flow >= 0 ? 'text-green-700' : 'text-red-700'}`}>{fmt(cf.net_cash_flow)}</td>
                <td className="px-2 py-1 text-right text-gray-600">{fmt(cf.loan_balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: RETURNS ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

function ReturnsTab({ metrics, waterfall, templateType, fmt, pct }) {
  return (
    <div className="space-y-5">
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

      {templateType === 'build_to_rent' && (
        <div className="bg-white border rounded-lg p-5">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Development Metrics</h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-3"><div className="text-xs text-blue-600 mb-1">Dev Yield</div><div className="text-lg font-bold text-blue-800">{pct(metrics.developmentYield)}</div></div>
            <div className="bg-gray-50 rounded-lg p-3"><div className="text-xs text-gray-500 mb-1">Exit Cap</div><div className="text-lg font-bold">{pct(metrics.exitCapRate)}</div></div>
            <div className="bg-green-50 rounded-lg p-3"><div className="text-xs text-green-600 mb-1">Dev Spread</div><div className="text-lg font-bold text-green-700">{((metrics.developmentSpread || 0) * 10000).toFixed(0)} bps</div></div>
            <div className="bg-purple-50 rounded-lg p-3"><div className="text-xs text-purple-600 mb-1">Value Creation</div><div className="text-lg font-bold text-purple-800">{pct(metrics.valueCreationPercent)}</div></div>
          </div>
        </div>
      )}

      {waterfall && (
        <div className="bg-white border rounded-lg p-5">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Investor Waterfall Distribution</h3>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-xs font-medium text-gray-500 uppercase"><th className="pb-2 text-left">Tier</th><th className="pb-2 text-right">Total</th><th className="pb-2 text-right text-blue-700">Investor</th><th className="pb-2 text-right text-green-700">Sponsor</th></tr></thead>
            <tbody className="divide-y">
              {waterfall.tiers.map((tier, i) => (
                <tr key={i}><td className="py-2 font-medium text-gray-800">{tier.name}</td><td className="py-2 text-right font-mono">{fmt(tier.total)}</td><td className="py-2 text-right font-mono text-blue-700">{fmt(tier.investor)}</td><td className="py-2 text-right font-mono text-green-700">{fmt(tier.sponsor)}</td></tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 font-bold"><td className="pt-2">Total</td><td className="pt-2 text-right font-mono">{fmt(waterfall.totalAvailable)}</td><td className="pt-2 text-right font-mono text-blue-800">{fmt(waterfall.totalToInvestor)}</td><td className="pt-2 text-right font-mono text-green-800">{fmt(waterfall.totalToSponsor)}</td></tr>
              <tr className="text-xs text-gray-500"><td className="pt-1">Multiple</td><td></td><td className="pt-1 text-right font-bold text-blue-700">{waterfall.investorMultiple.toFixed(2)}x</td><td className="pt-1 text-right font-bold text-green-700">{waterfall.sponsorMultiple.toFixed(2)}x</td></tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Per-Unit Metrics</h3>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-gray-50 rounded-lg p-3"><div className="text-xs text-gray-500 mb-1">Cost/Unit</div><div className="text-lg font-bold">{fmt(metrics.costPerUnit)}</div></div>
          <div className="bg-gray-50 rounded-lg p-3"><div className="text-xs text-gray-500 mb-1">Revenue/Unit</div><div className="text-lg font-bold">{fmt(metrics.revenuePerUnit)}</div></div>
          <div className="bg-green-50 rounded-lg p-3"><div className="text-xs text-gray-500 mb-1">Profit/Unit</div><div className="text-lg font-bold text-green-700">{fmt(metrics.profitPerUnit)}</div></div>
          <div className="bg-gray-50 rounded-lg p-3"><div className="text-xs text-gray-500 mb-1">{templateType === 'build_to_rent' ? 'Cost/SF' : 'LTC'}</div><div className="text-lg font-bold">{templateType === 'build_to_rent' ? `$${(metrics.costPerSF || 0).toFixed(0)}` : pct(metrics.ltcRatio)}</div></div>
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
// TAB: SENSITIVITY ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

function SensitivityTab({ sensitivity, templateType, fmt, pct }) {
  if (!sensitivity) return <div className="text-gray-500">No sensitivity data.</div>;
  const priceLabel = templateType === 'lot_development' ? 'Lot Price' : templateType === 'build_to_rent' ? 'Exit Cap / Rent' : 'Sale Price';
  const costLabel = templateType === 'lot_development' ? 'Infrastructure Cost' : 'Construction Cost';

  return (
    <div className="space-y-5">
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">{priceLabel} Sensitivity</h3>
        <SensitivityRow data={sensitivity.salePriceSensitivity} deltaLabel={priceLabel} fmt={fmt} pct={pct} />
      </div>
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">{costLabel} Sensitivity</h3>
        <SensitivityRow data={sensitivity.costSensitivity} deltaLabel={costLabel} fmt={fmt} pct={pct} />
      </div>
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Timeline Sensitivity</h3>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-xs font-medium text-gray-500 uppercase text-center"><th className="pb-2 text-left">Change</th>{sensitivity.timelineSensitivity.map(s => <th key={s.delta} className="pb-2">{s.delta > 0 ? '+' : ''}{s.delta} mo</th>)}</tr></thead>
          <tbody>
            <tr className="border-b"><td className="py-2 font-medium text-gray-700">Interest Cost</td>{sensitivity.timelineSensitivity.map(s => <td key={s.delta} className={`py-2 text-center font-mono text-xs ${s.delta === 0 ? 'font-bold bg-blue-50' : ''}`}>{fmt(s.interestCost)}</td>)}</tr>
            <tr><td className="py-2 font-medium text-gray-700">Equity IRR</td>{sensitivity.timelineSensitivity.map(s => <td key={s.delta} className={`py-2 text-center font-mono text-xs ${s.delta === 0 ? 'font-bold bg-blue-50' : ''} ${s.equityIRR >= 0.15 ? 'text-green-700' : s.equityIRR >= 0.10 ? 'text-yellow-700' : 'text-red-700'}`}>{pct(s.equityIRR)}</td>)}</tr>
          </tbody>
        </table>
      </div>
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-1 text-sm uppercase tracking-wide">Two-Variable Sensitivity Matrix</h3>
        <p className="text-xs text-gray-500 mb-3">Equity IRR: {priceLabel} (rows) × {costLabel} (columns)</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr><th className="pb-2 pr-2 text-left text-gray-500 font-medium">{priceLabel} \ {costLabel}</th>{sensitivity.twoVarMatrix[0]?.scenarios.map(s => <th key={s.costDelta} className="pb-2 px-2 text-center text-gray-500 font-medium">{s.costDelta > 0 ? '+' : ''}{(s.costDelta * 100).toFixed(0)}%</th>)}</tr></thead>
            <tbody>
              {sensitivity.twoVarMatrix.map(row => (
                <tr key={row.revDelta}>
                  <td className="py-1 pr-2 font-medium text-gray-700">{row.revDelta > 0 ? '+' : ''}{(row.revDelta * 100).toFixed(0)}%</td>
                  {row.scenarios.map((s, i) => {
                    const isBase = row.revDelta === 0 && s.costDelta === 0;
                    const bg = s.equityIRR >= 0.25 ? 'bg-green-200 text-green-900' : s.equityIRR >= 0.15 ? 'bg-green-100 text-green-800' : s.equityIRR >= 0.10 ? 'bg-yellow-50 text-yellow-800' : s.equityIRR >= 0 ? 'bg-orange-50 text-orange-800' : 'bg-red-100 text-red-800';
                    return <td key={i} className={`py-1 px-2 text-center font-mono ${bg} ${isBase ? 'ring-2 ring-blue-500 font-bold' : ''}`}>{pct(s.equityIRR)}</td>;
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
      <thead><tr className="border-b text-xs font-medium text-gray-500 uppercase text-center"><th className="pb-2 text-left">{deltaLabel}</th>{data.map(s => <th key={s.delta} className="pb-2">{s.delta > 0 ? '+' : ''}{(s.delta * 100).toFixed(0)}%</th>)}</tr></thead>
      <tbody>
        <tr className="border-b"><td className="py-2 font-medium text-gray-700">Gross Profit</td>{data.map(s => <td key={s.delta} className={`py-2 text-center font-mono text-xs ${s.delta === 0 ? 'font-bold bg-blue-50' : ''}`}>{fmt(s.grossProfit)}</td>)}</tr>
        <tr className="border-b"><td className="py-2 font-medium text-gray-700">Equity IRR</td>{data.map(s => <td key={s.delta} className={`py-2 text-center font-mono text-xs ${s.delta === 0 ? 'font-bold bg-blue-50' : ''} ${s.equityIRR >= 0.15 ? 'text-green-700' : s.equityIRR >= 0.10 ? 'text-yellow-700' : 'text-red-700'}`}>{pct(s.equityIRR)}</td>)}</tr>
        <tr><td className="py-2 font-medium text-gray-700">Equity Multiple</td>{data.map(s => <td key={s.delta} className={`py-2 text-center font-mono text-xs ${s.delta === 0 ? 'font-bold bg-blue-50' : ''}`}>{s.equityMultiple.toFixed(2)}x</td>)}</tr>
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

function fmt2(v) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v || 0);
}
