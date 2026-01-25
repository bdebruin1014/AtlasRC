// src/pages/projects/ProForma/components/WaterfallChart.jsx
// Visual waterfall distribution chart showing tier-by-tier breakdown

import { useMemo } from 'react';

function formatCurrency(value) {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value) {
  if (value === null || value === undefined) return '-';
  return `${(value * 100).toFixed(0)}%`;
}

export default function WaterfallChart({ tierResults, height = 300 }) {
  const chartData = useMemo(() => {
    if (!tierResults || tierResults.length === 0) return [];

    // Calculate total for scaling
    const total = tierResults.reduce((sum, t) => sum + (t.distributable_amount || 0), 0);
    if (total === 0) return [];

    let cumulativeLP = 0;
    let cumulativeGP = 0;

    return tierResults.map((tier, idx) => {
      const lpAmount = tier.lp_distribution || 0;
      const gpAmount = tier.gp_distribution || 0;
      const tierTotal = tier.distributable_amount || 0;

      cumulativeLP += lpAmount;
      cumulativeGP += gpAmount;

      return {
        name: tier.tier_name,
        lpAmount,
        gpAmount,
        tierTotal,
        lpPercent: tierTotal > 0 ? lpAmount / tierTotal : 0,
        gpPercent: tierTotal > 0 ? gpAmount / tierTotal : 0,
        cumulativeLP,
        cumulativeGP,
        percentOfTotal: total > 0 ? tierTotal / total : 0,
        isPromote: tier.gp_promote_in_tier > 0,
        hurdle: tier.irr_hurdle
          ? `${(tier.irr_hurdle * 100).toFixed(0)}% IRR`
          : tier.multiple_hurdle
          ? `${tier.multiple_hurdle.toFixed(1)}x`
          : null,
      };
    });
  }, [tierResults]);

  if (chartData.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-gray-400">
        No distribution data available
      </div>
    );
  }

  const maxWidth = 100; // percentage

  return (
    <div className="space-y-3">
      {chartData.map((tier, idx) => (
        <div key={idx} className="relative">
          {/* Tier Label */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">{tier.name}</span>
              {tier.hurdle && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                  {tier.hurdle}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500">{formatCurrency(tier.tierTotal)}</span>
          </div>

          {/* Bar */}
          <div className="h-10 flex rounded-lg overflow-hidden bg-gray-100">
            {/* LP Portion */}
            {tier.lpAmount > 0 && (
              <div
                className={`flex items-center justify-center transition-all ${
                  idx === 0 ? 'bg-blue-300' : 'bg-blue-500'
                }`}
                style={{ width: `${tier.lpPercent * 100}%` }}
              >
                {tier.lpPercent > 0.15 && (
                  <span className="text-white text-xs font-medium">
                    LP {formatPercent(tier.lpPercent)}
                  </span>
                )}
              </div>
            )}

            {/* GP Portion */}
            {tier.gpAmount > 0 && (
              <div
                className={`flex items-center justify-center transition-all ${
                  tier.isPromote ? 'bg-emerald-600' : idx === 0 ? 'bg-emerald-300' : 'bg-emerald-500'
                }`}
                style={{ width: `${tier.gpPercent * 100}%` }}
              >
                {tier.gpPercent > 0.15 && (
                  <span className="text-white text-xs font-medium">
                    GP {formatPercent(tier.gpPercent)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Amounts underneath */}
          <div className="flex justify-between text-xs text-gray-500 mt-0.5">
            <span>LP: {formatCurrency(tier.lpAmount)}</span>
            <span>GP: {formatCurrency(tier.gpAmount)}</span>
          </div>
        </div>
      ))}

      {/* Cumulative Totals */}
      <div className="pt-4 border-t mt-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-gray-700">Total Distribution</span>
          <span className="text-sm font-semibold text-gray-900">
            {formatCurrency(chartData.reduce((sum, t) => sum + t.tierTotal, 0))}
          </span>
        </div>
        <div className="h-12 flex rounded-lg overflow-hidden">
          {(() => {
            const totalLP = chartData.reduce((sum, t) => sum + t.lpAmount, 0);
            const totalGP = chartData.reduce((sum, t) => sum + t.gpAmount, 0);
            const total = totalLP + totalGP;
            const lpPct = total > 0 ? totalLP / total : 0;
            const gpPct = total > 0 ? totalGP / total : 0;

            return (
              <>
                <div
                  className="bg-blue-500 flex items-center justify-center"
                  style={{ width: `${lpPct * 100}%` }}
                >
                  <div className="text-white text-center">
                    <div className="text-sm font-bold">{formatCurrency(totalLP)}</div>
                    <div className="text-xs opacity-80">LP ({formatPercent(lpPct)})</div>
                  </div>
                </div>
                <div
                  className="bg-emerald-500 flex items-center justify-center"
                  style={{ width: `${gpPct * 100}%` }}
                >
                  <div className="text-white text-center">
                    <div className="text-sm font-bold">{formatCurrency(totalGP)}</div>
                    <div className="text-xs opacity-80">GP ({formatPercent(gpPct)})</div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500" />
          <span className="text-sm text-gray-600">LP (Limited Partner)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500" />
          <span className="text-sm text-gray-600">GP (General Partner)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-600" />
          <span className="text-sm text-gray-600">GP Promote</span>
        </div>
      </div>
    </div>
  );
}

// Alternative: Stacked Waterfall Chart (shows cumulative build-up)
export function StackedWaterfallChart({ tierResults }) {
  const chartData = useMemo(() => {
    if (!tierResults || tierResults.length === 0) return [];

    return tierResults.map((tier) => ({
      name: tier.tier_name,
      cumulativeLP: tier.cumulative_lp_distribution || 0,
      cumulativeGP: tier.cumulative_gp_distribution || 0,
      lpMultiple: tier.lp_multiple_at_tier || 0,
    }));
  }, [tierResults]);

  if (chartData.length === 0) return null;

  const maxTotal = Math.max(...chartData.map((d) => d.cumulativeLP + d.cumulativeGP));

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-2 h-48">
        {chartData.map((tier, idx) => {
          const total = tier.cumulativeLP + tier.cumulativeGP;
          const heightPct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
          const lpPct = total > 0 ? (tier.cumulativeLP / total) * 100 : 0;

          return (
            <div key={idx} className="flex-1 flex flex-col items-center">
              <div
                className="w-full flex flex-col rounded-t overflow-hidden"
                style={{ height: `${heightPct}%` }}
              >
                <div className="bg-blue-500 flex-grow" style={{ height: `${lpPct}%` }} />
                <div className="bg-emerald-500 flex-grow" style={{ height: `${100 - lpPct}%` }} />
              </div>
              <div className="text-xs text-gray-500 mt-2 text-center truncate w-full">
                {tier.name.split(' ')[0]}
              </div>
              <div className="text-xs font-medium text-gray-700">
                {tier.lpMultiple.toFixed(2)}x
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
