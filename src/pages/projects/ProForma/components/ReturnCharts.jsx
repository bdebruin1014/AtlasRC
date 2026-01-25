// src/pages/projects/ProForma/components/ReturnCharts.jsx
// Charts and visualizations for LP, GP, and Project returns

import { useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Area, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar,
} from 'recharts';

// Color palette
const COLORS = {
  lp: '#3B82F6',      // blue-500
  gp: '#10B981',      // emerald-500
  project: '#6366F1', // indigo-500
  promote: '#059669', // emerald-600
  pref: '#60A5FA',    // blue-400
  profit: '#34D399',  // emerald-400
  cost: '#EF4444',    // red-500
  revenue: '#22C55E', // green-500
  equity: '#8B5CF6',  // violet-500
  debt: '#F59E0B',    // amber-500
};

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

function formatCurrency(value) {
  if (value === null || value === undefined) return '-';
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value) {
  if (value === null || value === undefined) return '-';
  return `${(value * 100).toFixed(1)}%`;
}

// IRR Comparison Bar Chart
export function IRRComparisonChart({ lpIRR, gpIRR, projectIRR, unleveredIRR }) {
  const data = [
    { name: 'Project IRR', value: (projectIRR || 0) * 100, fill: COLORS.project },
    { name: 'Unlevered IRR', value: (unleveredIRR || 0) * 100, fill: '#818CF8' },
    { name: 'LP IRR', value: (lpIRR || 0) * 100, fill: COLORS.lp },
    { name: 'GP IRR', value: (gpIRR || 0) * 100, fill: COLORS.gp },
  ].filter(d => d.value > 0);

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 80, right: 30 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tickFormatter={(v) => `${v.toFixed(0)}%`} />
          <YAxis type="category" dataKey="name" />
          <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Equity Multiple Comparison Chart
export function MultipleComparisonChart({ lpMultiple, gpMultiple, projectMultiple }) {
  const data = [
    { name: 'Project', value: projectMultiple || 0, fill: COLORS.project },
    { name: 'LP', value: lpMultiple || 0, fill: COLORS.lp },
    { name: 'GP', value: gpMultiple || 0, fill: COLORS.gp },
  ];

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(v) => `${v.toFixed(1)}x`} />
          <Tooltip formatter={(v) => `${v.toFixed(2)}x`} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// LP/GP Distribution Pie Chart
export function DistributionPieChart({ lpDistribution, gpDistribution, showLabels = true }) {
  const data = [
    { name: 'LP Distribution', value: lpDistribution || 0, color: COLORS.lp },
    { name: 'GP Distribution', value: gpDistribution || 0, color: COLORS.gp },
  ].filter(d => d.value > 0);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={showLabels ? ({ name, value }) => `${name.split(' ')[0]}: ${formatCurrency(value)}` : false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => formatCurrency(v)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Profit Breakdown Pie Chart
export function ProfitBreakdownChart({ lpProfit, gpProRata, gpPromote }) {
  const data = [
    { name: 'LP Profit Share', value: lpProfit || 0, color: COLORS.lp },
    { name: 'GP Pro-Rata', value: gpProRata || 0, color: '#34D399' },
    { name: 'GP Promote', value: gpPromote || 0, color: COLORS.promote },
  ].filter(d => d.value > 0);

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => formatCurrency(v)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Cash Flow Timeline Chart
export function CashFlowTimelineChart({ cashFlows = [], lpEquity = 0, gpEquity = 0 }) {
  const data = useMemo(() => {
    if (!cashFlows || cashFlows.length === 0) {
      // Generate sample timeline if no cash flows
      return [
        { period: 'Month 0', lp: -lpEquity * 0.9, gp: -gpEquity * 0.1, net: -(lpEquity + gpEquity) },
        { period: 'Month 6', lp: 0, gp: 0, net: 0 },
        { period: 'Month 12', lp: 0, gp: 0, net: 0 },
        { period: 'Exit', lp: lpEquity * 1.5, gp: gpEquity * 2, net: lpEquity * 1.5 + gpEquity * 2 },
      ];
    }

    return cashFlows.map((cf, idx) => ({
      period: cf.period || `Month ${idx}`,
      lp: cf.lp_cash_flow || 0,
      gp: cf.gp_cash_flow || 0,
      net: (cf.lp_cash_flow || 0) + (cf.gp_cash_flow || 0),
    }));
  }, [cashFlows, lpEquity, gpEquity]);

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis tickFormatter={(v) => formatCurrency(v)} />
          <Tooltip formatter={(v) => formatCurrency(v)} />
          <Legend />
          <Bar dataKey="lp" name="LP Cash Flow" fill={COLORS.lp} stackId="stack" />
          <Bar dataKey="gp" name="GP Cash Flow" fill={COLORS.gp} stackId="stack" />
          <Line type="monotone" dataKey="net" name="Net Cash Flow" stroke="#374151" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// Sources & Uses Bar Chart
export function SourcesUsesChart({ sources = {}, uses = {} }) {
  const sourcesData = [
    { name: 'LP Equity', value: sources.lpEquity || 0, fill: COLORS.lp },
    { name: 'GP Equity', value: sources.gpEquity || 0, fill: COLORS.gp },
    { name: 'Senior Debt', value: sources.seniorDebt || 0, fill: COLORS.debt },
    { name: 'Mezz Debt', value: sources.mezzDebt || 0, fill: '#D97706' },
  ].filter(d => d.value > 0);

  const usesData = [
    { name: 'Land', value: uses.land || 0, fill: '#78716C' },
    { name: 'Hard Costs', value: uses.hardCosts || 0, fill: '#EF4444' },
    { name: 'Soft Costs', value: uses.softCosts || 0, fill: '#F59E0B' },
    { name: 'Financing', value: uses.financing || 0, fill: '#8B5CF6' },
    { name: 'Contingency', value: uses.contingency || 0, fill: '#6B7280' },
  ].filter(d => d.value > 0);

  return (
    <div className="grid grid-cols-2 gap-4 h-64">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-2 text-center">Sources</p>
        <ResponsiveContainer width="100%" height="90%">
          <PieChart>
            <Pie
              data={sourcesData}
              cx="50%"
              cy="50%"
              outerRadius={70}
              dataKey="value"
              label={({ name }) => name.split(' ')[0]}
            >
              {sourcesData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => formatCurrency(v)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-2 text-center">Uses</p>
        <ResponsiveContainer width="100%" height="90%">
          <PieChart>
            <Pie
              data={usesData}
              cx="50%"
              cy="50%"
              outerRadius={70}
              dataKey="value"
              label={({ name }) => name.split(' ')[0]}
            >
              {usesData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => formatCurrency(v)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Waterfall Tier Distribution Chart
export function TierDistributionChart({ tierResults = [] }) {
  const data = tierResults.map(tier => ({
    name: tier.tier_name?.replace(' Distributions', '').replace(' Distribution', '') || 'Tier',
    lp: tier.lp_distribution || 0,
    gp: tier.gp_distribution || 0,
    promote: tier.gp_promote_in_tier || 0,
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(v) => formatCurrency(v)} />
          <Tooltip formatter={(v) => formatCurrency(v)} />
          <Legend />
          <Bar dataKey="lp" name="LP" fill={COLORS.lp} stackId="stack" />
          <Bar dataKey="gp" name="GP Pro-Rata" fill="#34D399" stackId="stack" />
          <Bar dataKey="promote" name="GP Promote" fill={COLORS.promote} stackId="stack" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Returns Radar Chart
export function ReturnsRadarChart({ metrics = {} }) {
  const data = [
    { metric: 'IRR', value: Math.min((metrics.irr || 0) * 100, 100), fullMark: 100 },
    { metric: 'Multiple', value: Math.min((metrics.multiple || 0) * 50, 100), fullMark: 100 },
    { metric: 'Cash-on-Cash', value: Math.min((metrics.coc || 0) * 100, 100), fullMark: 100 },
    { metric: 'Yield', value: Math.min((metrics.yield || 0) * 100, 100), fullMark: 100 },
    { metric: 'Margin', value: Math.min((metrics.margin || 0) * 100, 100), fullMark: 100 },
  ];

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar
            name="Returns"
            dataKey="value"
            stroke={COLORS.project}
            fill={COLORS.project}
            fillOpacity={0.5}
          />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Scenario Comparison Chart
export function ScenarioComparisonChart({ scenarios = {} }) {
  const data = [
    {
      name: 'Downside',
      lpIRR: (scenarios.downside?.final_results?.lp?.irr || 0) * 100,
      gpIRR: (scenarios.downside?.final_results?.gp?.irr || 0) * 100,
      lpMultiple: scenarios.downside?.final_results?.lp?.equity_multiple || 0,
    },
    {
      name: 'Base',
      lpIRR: (scenarios.base?.final_results?.lp?.irr || 0) * 100,
      gpIRR: (scenarios.base?.final_results?.gp?.irr || 0) * 100,
      lpMultiple: scenarios.base?.final_results?.lp?.equity_multiple || 0,
    },
    {
      name: 'Upside',
      lpIRR: (scenarios.upside?.final_results?.lp?.irr || 0) * 100,
      gpIRR: (scenarios.upside?.final_results?.gp?.irr || 0) * 100,
      lpMultiple: scenarios.upside?.final_results?.lp?.equity_multiple || 0,
    },
  ];

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" tickFormatter={(v) => `${v}%`} />
          <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}x`} />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="lpIRR" name="LP IRR" fill={COLORS.lp} />
          <Bar yAxisId="left" dataKey="gpIRR" name="GP IRR" fill={COLORS.gp} />
          <Line yAxisId="right" type="monotone" dataKey="lpMultiple" name="LP Multiple" stroke={COLORS.project} strokeWidth={2} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// Cost Breakdown Horizontal Bar Chart
export function CostBreakdownChart({ costs = {} }) {
  const data = [
    { name: 'Land & Acquisition', value: costs.land || 0, fill: '#78716C' },
    { name: 'Hard Costs', value: costs.hardCosts || 0, fill: '#EF4444' },
    { name: 'Soft Costs', value: costs.softCosts || 0, fill: '#F59E0B' },
    { name: 'Financing Costs', value: costs.financing || 0, fill: '#8B5CF6' },
    { name: 'Developer Fee', value: costs.developerFee || 0, fill: '#10B981' },
    { name: 'Contingency', value: costs.contingency || 0, fill: '#6B7280' },
  ].filter(d => d.value > 0);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 100, right: 30 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
          <YAxis type="category" dataKey="name" width={90} />
          <Tooltip
            formatter={(v) => [formatCurrency(v), 'Amount']}
            labelFormatter={(name) => `${name} (${((data.find(d => d.name === name)?.value || 0) / total * 100).toFixed(1)}%)`}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Combined Returns Dashboard (exportable)
export const ReturnsDashboard = forwardRef(function ReturnsDashboard({
  waterfallResults,
  calculations,
  scenarios,
  proforma,
}, ref) {
  const containerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getElement: () => containerRef.current,
  }));

  const lp = waterfallResults?.final_results?.lp || {};
  const gp = waterfallResults?.final_results?.gp || {};
  const project = waterfallResults?.final_results?.project || {};
  const tierResults = waterfallResults?.tier_results || [];

  return (
    <div ref={containerRef} className="space-y-8 bg-white p-6">
      {/* Header */}
      <div className="text-center border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {proforma?.name || 'Pro Forma'} - Returns Analysis
        </h2>
        <p className="text-gray-500 mt-1">
          Generated {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
          <p className="text-sm text-blue-600">LP IRR</p>
          <p className="text-2xl font-bold text-blue-900">{formatPercent(lp.irr)}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
          <p className="text-sm text-blue-600">LP Multiple</p>
          <p className="text-2xl font-bold text-blue-900">{(lp.equity_multiple || 0).toFixed(2)}x</p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-4 text-center border border-emerald-200">
          <p className="text-sm text-emerald-600">GP IRR</p>
          <p className="text-2xl font-bold text-emerald-900">{formatPercent(gp.irr)}</p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-4 text-center border border-emerald-200">
          <p className="text-sm text-emerald-600">GP Multiple</p>
          <p className="text-2xl font-bold text-emerald-900">{(gp.equity_multiple || 0).toFixed(2)}x</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4">IRR Comparison</h3>
          <IRRComparisonChart
            lpIRR={lp.irr}
            gpIRR={gp.irr}
            projectIRR={calculations?.projectIRR}
            unleveredIRR={calculations?.unleveredIRR}
          />
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Distribution Split</h3>
          <DistributionPieChart
            lpDistribution={lp.total_distributed}
            gpDistribution={gp.total_distributed}
          />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Tier Distribution</h3>
          <TierDistributionChart tierResults={tierResults} />
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Profit Breakdown</h3>
          <ProfitBreakdownChart
            lpProfit={lp.profit}
            gpProRata={gp.co_invest_return}
            gpPromote={gp.promote_earned}
          />
        </div>
      </div>

      {/* Scenario Analysis */}
      {scenarios && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Scenario Analysis</h3>
          <ScenarioComparisonChart scenarios={scenarios} />
        </div>
      )}
    </div>
  );
});

export default ReturnsDashboard;
