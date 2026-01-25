// src/pages/projects/ProForma/tabs/InvestorWaterfall.jsx
// Investor waterfall distribution analysis tab for Pro Forma module

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  ChartBar, Users, DollarSign, TrendingUp, TrendingDown,
  ChevronDown, ChevronUp, Settings, Download, Eye, EyeOff,
} from 'lucide-react';
import { calculateWaterfall, runWaterfallScenarios } from '@/utils/waterfallCalculator';
import { getDefaultWaterfallStructure } from '@/services/proformaService';

function formatCurrency(value) {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined) return '-';
  return `${(value * 100).toFixed(decimals)}%`;
}

function formatMultiple(value) {
  if (value === null || value === undefined) return '-';
  return `${value.toFixed(2)}x`;
}

export default function InvestorWaterfall({
  proforma,
  calculations,
  waterfallStructure,
  onEditStructure,
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [showScenarios, setShowScenarios] = useState(false);
  const [activeScenario, setActiveScenario] = useState('base');

  // Get waterfall structure
  const structure = waterfallStructure || proforma?.waterfall_structure || getDefaultWaterfallStructure();

  // Calculate waterfall results
  const waterfallResults = useMemo(() => {
    if (!proforma || !calculations) return null;

    const totalEquity = calculations.totalEquity || 0;
    const lpPercent = (structure.capital_structure?.lp_equity_percent || 90) / 100;
    const gpPercent = (structure.capital_structure?.gp_equity_percent || 10) / 100;

    return calculateWaterfall({
      structure,
      cashFlows: proforma.cash_flows || [],
      totalDistributable: (calculations.totalEquity || 0) + (calculations.netProfit || 0),
      holdPeriodYears: (calculations.termMonths || 18) / 12,
      lpEquity: totalEquity * lpPercent,
      gpEquity: totalEquity * gpPercent,
    });
  }, [proforma, calculations, structure]);

  // Calculate scenarios
  const scenarios = useMemo(() => {
    if (!proforma || !calculations) return null;

    const totalEquity = calculations.totalEquity || 0;
    const lpPercent = (structure.capital_structure?.lp_equity_percent || 90) / 100;
    const gpPercent = (structure.capital_structure?.gp_equity_percent || 10) / 100;

    return runWaterfallScenarios({
      structure,
      cashFlows: proforma.cash_flows || [],
      totalDistributable: (calculations.totalEquity || 0) + (calculations.netProfit || 0),
      holdPeriodYears: (calculations.termMonths || 18) / 12,
      lpEquity: totalEquity * lpPercent,
      gpEquity: totalEquity * gpPercent,
    });
  }, [proforma, calculations, structure]);

  if (!waterfallResults) {
    return (
      <div className="text-center py-12">
        <ChartBar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">Configure waterfall structure to see results</p>
        {onEditStructure && (
          <Button onClick={onEditStructure} className="bg-[#2F855A] hover:bg-[#276749] text-white">
            <Settings className="h-4 w-4 mr-2" />
            Configure Waterfall
          </Button>
        )}
      </div>
    );
  }

  const { tier_results, final_results } = waterfallResults;
  const lp = final_results.lp || {};
  const gp = final_results.gp || {};
  const project = final_results.project || {};

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Investor Waterfall</h3>
          <p className="text-sm text-gray-500">
            {structure.name || 'Standard 90/10 Waterfall'} • {structure.structure_type || 'American'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowScenarios(!showScenarios)}
          >
            {showScenarios ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            Scenarios
          </Button>
          {onEditStructure && (
            <Button variant="outline" size="sm" onClick={onEditStructure}>
              <Settings className="h-4 w-4 mr-1" />
              Edit Structure
            </Button>
          )}
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* LP Metrics */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">LP IRR</p>
          <p className="text-3xl font-bold text-blue-900">{formatPercent(lp.irr)}</p>
          <p className="text-xs text-blue-500 mt-1">
            Profit: {formatCurrency(lp.profit)}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">LP Equity Multiple</p>
          <p className="text-3xl font-bold text-blue-900">{formatMultiple(lp.equity_multiple)}</p>
          <p className="text-xs text-blue-500 mt-1">
            Invested: {formatCurrency(lp.total_invested)}
          </p>
        </div>

        {/* GP Metrics */}
        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
          <p className="text-sm text-emerald-600 font-medium">GP IRR</p>
          <p className="text-3xl font-bold text-emerald-900">{formatPercent(gp.irr)}</p>
          <p className="text-xs text-emerald-500 mt-1">
            Promote: {formatCurrency(gp.promote_earned)}
          </p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
          <p className="text-sm text-emerald-600 font-medium">GP Equity Multiple</p>
          <p className="text-3xl font-bold text-emerald-900">{formatMultiple(gp.equity_multiple)}</p>
          <p className="text-xs text-emerald-500 mt-1">
            Co-Invest: {formatCurrency(gp.total_invested)}
          </p>
        </div>
      </div>

      {/* Scenario Comparison */}
      {showScenarios && scenarios && (
        <div className="bg-gray-50 rounded-lg p-4 border">
          <h4 className="font-medium text-gray-900 mb-4">Scenario Analysis</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium text-gray-600">Metric</th>
                  <th className="text-center py-2 px-3 font-medium text-red-600">
                    <TrendingDown className="h-4 w-4 inline mr-1" />
                    Downside (-20%)
                  </th>
                  <th className="text-center py-2 px-3 font-medium text-gray-600">Base Case</th>
                  <th className="text-center py-2 px-3 font-medium text-green-600">
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                    Upside (+20%)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-100">
                  <td className="py-2 px-3 font-medium">LP IRR</td>
                  <td className="text-center py-2 px-3 text-red-600">
                    {formatPercent(scenarios.downside?.final_results?.lp?.irr)}
                  </td>
                  <td className="text-center py-2 px-3 font-medium">
                    {formatPercent(scenarios.base?.final_results?.lp?.irr)}
                  </td>
                  <td className="text-center py-2 px-3 text-green-600">
                    {formatPercent(scenarios.upside?.final_results?.lp?.irr)}
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-100">
                  <td className="py-2 px-3 font-medium">LP Multiple</td>
                  <td className="text-center py-2 px-3 text-red-600">
                    {formatMultiple(scenarios.downside?.final_results?.lp?.equity_multiple)}
                  </td>
                  <td className="text-center py-2 px-3 font-medium">
                    {formatMultiple(scenarios.base?.final_results?.lp?.equity_multiple)}
                  </td>
                  <td className="text-center py-2 px-3 text-green-600">
                    {formatMultiple(scenarios.upside?.final_results?.lp?.equity_multiple)}
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-100">
                  <td className="py-2 px-3 font-medium">LP Profit</td>
                  <td className="text-center py-2 px-3 text-red-600">
                    {formatCurrency(scenarios.downside?.final_results?.lp?.profit)}
                  </td>
                  <td className="text-center py-2 px-3 font-medium">
                    {formatCurrency(scenarios.base?.final_results?.lp?.profit)}
                  </td>
                  <td className="text-center py-2 px-3 text-green-600">
                    {formatCurrency(scenarios.upside?.final_results?.lp?.profit)}
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-100">
                  <td className="py-2 px-3 font-medium">GP Promote</td>
                  <td className="text-center py-2 px-3 text-red-600">
                    {formatCurrency(scenarios.downside?.final_results?.gp?.promote_earned)}
                  </td>
                  <td className="text-center py-2 px-3 font-medium">
                    {formatCurrency(scenarios.base?.final_results?.gp?.promote_earned)}
                  </td>
                  <td className="text-center py-2 px-3 text-green-600">
                    {formatCurrency(scenarios.upside?.final_results?.gp?.promote_earned)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Distribution Split Visualization */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Distribution Split</h4>
        <div className="space-y-4">
          {/* Total Distribution Bar */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Total Distributions</span>
              <span className="font-medium">{formatCurrency(lp.total_distributed + gp.total_distributed)}</span>
            </div>
            <div className="h-8 flex rounded-lg overflow-hidden">
              {lp.total_distributed > 0 && (
                <div
                  className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                  style={{
                    width: `${(lp.total_distributed / (lp.total_distributed + gp.total_distributed)) * 100}%`,
                  }}
                >
                  LP {formatPercent(lp.total_distributed / (lp.total_distributed + gp.total_distributed))}
                </div>
              )}
              {gp.total_distributed > 0 && (
                <div
                  className="bg-emerald-500 flex items-center justify-center text-white text-xs font-medium"
                  style={{
                    width: `${(gp.total_distributed / (lp.total_distributed + gp.total_distributed)) * 100}%`,
                  }}
                >
                  GP {formatPercent(gp.total_distributed / (lp.total_distributed + gp.total_distributed))}
                </div>
              )}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>LP: {formatCurrency(lp.total_distributed)}</span>
              <span>GP: {formatCurrency(gp.total_distributed)}</span>
            </div>
          </div>

          {/* Profit Split (excluding return of capital) */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Profit Split (After ROC)</span>
              <span className="font-medium">{formatCurrency(lp.profit + gp.profit)}</span>
            </div>
            <div className="h-8 flex rounded-lg overflow-hidden">
              {lp.profit > 0 && (
                <div
                  className="bg-blue-400 flex items-center justify-center text-white text-xs font-medium"
                  style={{
                    width: `${Math.max(0, (lp.profit / (lp.profit + gp.profit)) * 100)}%`,
                  }}
                >
                  LP {formatPercent(lp.profit / (lp.profit + gp.profit))}
                </div>
              )}
              {gp.profit > 0 && (
                <div
                  className="bg-emerald-400 flex items-center justify-center text-white text-xs font-medium"
                  style={{
                    width: `${Math.max(0, (gp.profit / (lp.profit + gp.profit)) * 100)}%`,
                  }}
                >
                  GP {formatPercent(gp.profit / (lp.profit + gp.profit))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tier-by-Tier Breakdown */}
      <div className="bg-white rounded-lg shadow">
        <div
          className="px-6 py-4 border-b flex items-center justify-between cursor-pointer hover:bg-gray-50"
          onClick={() => setShowDetails(!showDetails)}
        >
          <h4 className="font-semibold text-gray-900">Tier-by-Tier Breakdown</h4>
          <Button variant="ghost" size="sm">
            {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {showDetails && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Tier</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Amount</th>
                  <th className="text-right py-3 px-4 font-medium text-blue-600">LP Dist.</th>
                  <th className="text-right py-3 px-4 font-medium text-emerald-600">GP Dist.</th>
                  <th className="text-right py-3 px-4 font-medium text-emerald-600">GP Promote</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">LP Cumulative</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">LP Multiple</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tier_results.map((tier, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{tier.tier_name}</div>
                      {tier.irr_hurdle && (
                        <div className="text-xs text-gray-500">
                          Hurdle: {formatPercent(tier.irr_hurdle)} IRR
                        </div>
                      )}
                      {tier.multiple_hurdle && (
                        <div className="text-xs text-gray-500">
                          Hurdle: {formatMultiple(tier.multiple_hurdle)}
                        </div>
                      )}
                    </td>
                    <td className="text-right py-3 px-4 font-mono">
                      {formatCurrency(tier.distributable_amount)}
                    </td>
                    <td className="text-right py-3 px-4 font-mono text-blue-600">
                      {formatCurrency(tier.lp_distribution)}
                      {tier.lp_share && (
                        <div className="text-xs text-gray-400">{formatPercent(tier.lp_share)}</div>
                      )}
                    </td>
                    <td className="text-right py-3 px-4 font-mono text-emerald-600">
                      {formatCurrency(tier.gp_distribution)}
                      {tier.gp_share && (
                        <div className="text-xs text-gray-400">{formatPercent(tier.gp_share)}</div>
                      )}
                    </td>
                    <td className="text-right py-3 px-4 font-mono text-emerald-700">
                      {formatCurrency(tier.gp_promote_in_tier)}
                    </td>
                    <td className="text-right py-3 px-4 font-mono">
                      {formatCurrency(tier.cumulative_lp_distribution)}
                    </td>
                    <td className="text-right py-3 px-4 font-mono font-medium">
                      {formatMultiple(tier.lp_multiple_at_tier)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-semibold">
                  <td className="py-3 px-4">Total</td>
                  <td className="text-right py-3 px-4 font-mono">
                    {formatCurrency(lp.total_distributed + gp.total_distributed)}
                  </td>
                  <td className="text-right py-3 px-4 font-mono text-blue-700">
                    {formatCurrency(lp.total_distributed)}
                  </td>
                  <td className="text-right py-3 px-4 font-mono text-emerald-700">
                    {formatCurrency(gp.total_distributed)}
                  </td>
                  <td className="text-right py-3 px-4 font-mono text-emerald-700">
                    {formatCurrency(gp.promote_earned)}
                  </td>
                  <td className="text-right py-3 px-4">-</td>
                  <td className="text-right py-3 px-4 font-mono">
                    {formatMultiple(lp.equity_multiple)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* LP Return Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LP Summary */}
        <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">LP Returns Summary</h4>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Equity Invested</span>
              <span className="font-mono font-medium">{formatCurrency(lp.total_invested)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Distributed</span>
              <span className="font-mono font-medium">{formatCurrency(lp.total_distributed)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">Profit</span>
              <span className="font-mono font-medium text-green-600">{formatCurrency(lp.profit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Return of Capital</span>
              <span className="font-mono">{formatCurrency(lp.return_of_capital)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Preferred Return</span>
              <span className="font-mono">{formatCurrency(lp.preferred_return_received)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Profit Share</span>
              <span className="font-mono">{formatCurrency(lp.profit_share_received)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">Cash-on-Cash (Avg)</span>
              <span className="font-mono">{formatPercent(lp.cash_on_cash_avg)}</span>
            </div>
          </div>
        </div>

        {/* GP Summary */}
        <div className="bg-emerald-50 rounded-lg p-5 border border-emerald-200">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            <h4 className="font-semibold text-emerald-900">GP Returns Summary</h4>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Co-Invest</span>
              <span className="font-mono font-medium">{formatCurrency(gp.total_invested)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Distributed</span>
              <span className="font-mono font-medium">{formatCurrency(gp.total_distributed)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">Profit</span>
              <span className="font-mono font-medium text-green-600">{formatCurrency(gp.profit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Co-Invest Return</span>
              <span className="font-mono">{formatCurrency(gp.co_invest_return)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Promote Earned</span>
              <span className="font-mono font-bold text-emerald-700">{formatCurrency(gp.promote_earned)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">Return on GP Capital</span>
              <span className="font-mono">{formatPercent(gp.return_on_gp_capital)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Structure Summary */}
      <div className="bg-gray-50 rounded-lg p-5 border">
        <h4 className="font-semibold text-gray-900 mb-4">Waterfall Structure</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Structure Type</p>
            <p className="font-medium capitalize">{structure.structure_type || 'American'}</p>
          </div>
          <div>
            <p className="text-gray-500">LP / GP Split</p>
            <p className="font-medium">
              {structure.capital_structure?.lp_equity_percent || 90}% / {structure.capital_structure?.gp_equity_percent || 10}%
            </p>
          </div>
          <div>
            <p className="text-gray-500">Preferred Return</p>
            <p className="font-medium">
              {structure.preferred_return?.enabled
                ? `${((structure.preferred_return.lp_pref_rate || structure.preferred_return.rate || 0.08) * 100).toFixed(0)}%`
                : 'Disabled'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Promote Tiers</p>
            <p className="font-medium">{structure.promote_tiers?.length || 0} tiers</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Metric Box Component
function MetricBox({ label, value, format = 'number' }) {
  let displayValue;
  switch (format) {
    case 'percent':
      displayValue = formatPercent(value);
      break;
    case 'multiple':
      displayValue = formatMultiple(value);
      break;
    case 'currency':
      displayValue = formatCurrency(value);
      break;
    default:
      displayValue = value?.toLocaleString() || '-';
  }

  return (
    <div className="text-center">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-900">{displayValue}</p>
    </div>
  );
}
