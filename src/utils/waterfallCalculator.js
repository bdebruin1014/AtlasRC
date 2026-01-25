// src/utils/waterfallCalculator.js
// Professional-grade investor waterfall distribution calculator
// Supports American, European, and Hybrid waterfall structures

import { calculateIRR } from '@/services/proformaService';

/**
 * Calculate complete waterfall distribution
 * @param {Object} input - Waterfall input parameters
 * @param {Object} input.structure - Waterfall structure configuration
 * @param {Array} input.cashFlows - Project cash flows
 * @param {number} input.totalDistributable - Total amount to distribute
 * @param {number} input.holdPeriodYears - Hold period in years
 * @param {number} input.lpEquity - LP equity invested
 * @param {number} input.gpEquity - GP equity invested
 * @returns {Object} Waterfall results with tier breakdown
 */
export function calculateWaterfall(input) {
  const {
    structure,
    cashFlows = [],
    totalDistributable,
    holdPeriodYears,
    lpEquity,
    gpEquity,
  } = input;

  const totalEquity = lpEquity + gpEquity;
  const lpShare = totalEquity > 0 ? lpEquity / totalEquity : 0;
  const gpShare = totalEquity > 0 ? gpEquity / totalEquity : 0;

  let remaining = totalDistributable;
  const tierResults = [];

  let cumulativeLPDistribution = 0;
  let cumulativeGPDistribution = 0;

  // ===== STEP 1: Return of Capital =====
  const rocLP = Math.min(remaining * lpShare, lpEquity);
  const rocGP = Math.min(remaining * gpShare, gpEquity);
  const rocTotal = rocLP + rocGP;

  cumulativeLPDistribution += rocLP;
  cumulativeGPDistribution += rocGP;
  remaining -= rocTotal;

  tierResults.push({
    tier_number: 0,
    tier_name: 'Return of Capital',
    hurdle_type: 'none',
    distributable_amount: rocTotal,
    lp_distribution: rocLP,
    gp_distribution: rocGP,
    gp_promote_in_tier: 0,
    cumulative_lp_distribution: cumulativeLPDistribution,
    cumulative_gp_distribution: cumulativeGPDistribution,
    cumulative_total_distribution: cumulativeLPDistribution + cumulativeGPDistribution,
    lp_irr_at_tier: 0,
    lp_multiple_at_tier: lpEquity > 0 ? cumulativeLPDistribution / lpEquity : 0,
    gp_irr_at_tier: 0,
    gp_multiple_at_tier: gpEquity > 0 ? cumulativeGPDistribution / gpEquity : 0,
  });

  // ===== STEP 2: Preferred Return =====
  if (structure.preferred_return?.enabled && remaining > 0) {
    const lpPrefRate = structure.preferred_return.lp_pref_rate || structure.preferred_return.rate || 0.08;
    const gpPrefRate = structure.preferred_return.gp_pref_rate || structure.preferred_return.rate || 0.08;

    const lpPrefOwed = calculatePreferredReturn(
      lpEquity,
      lpPrefRate,
      holdPeriodYears,
      structure.preferred_return.type || 'cumulative',
      structure.preferred_return.compounding_frequency || 'annual'
    );

    const gpPrefOwed = calculatePreferredReturn(
      gpEquity,
      gpPrefRate,
      holdPeriodYears,
      structure.preferred_return.type || 'cumulative',
      structure.preferred_return.compounding_frequency || 'annual'
    );

    const totalPrefOwed = lpPrefOwed + gpPrefOwed;
    const prefLP = totalPrefOwed > 0 ? Math.min(remaining * (lpPrefOwed / totalPrefOwed), lpPrefOwed) : 0;
    const prefGP = Math.min(remaining - prefLP, gpPrefOwed);
    const prefTotal = prefLP + prefGP;

    cumulativeLPDistribution += prefLP;
    cumulativeGPDistribution += prefGP;
    remaining -= prefTotal;

    tierResults.push({
      tier_number: 1,
      tier_name: `Preferred Return (${(lpPrefRate * 100).toFixed(0)}%)`,
      hurdle_type: 'preferred',
      distributable_amount: prefTotal,
      lp_distribution: prefLP,
      gp_distribution: prefGP,
      gp_promote_in_tier: 0,
      cumulative_lp_distribution: cumulativeLPDistribution,
      cumulative_gp_distribution: cumulativeGPDistribution,
      cumulative_total_distribution: cumulativeLPDistribution + cumulativeGPDistribution,
      lp_irr_at_tier: lpPrefRate,
      lp_multiple_at_tier: lpEquity > 0 ? cumulativeLPDistribution / lpEquity : 0,
      gp_irr_at_tier: gpPrefRate,
      gp_multiple_at_tier: gpEquity > 0 ? cumulativeGPDistribution / gpEquity : 0,
    });

    // ===== STEP 3: GP Catch-Up =====
    if (structure.preferred_return.catch_up_enabled && remaining > 0) {
      const catchUpTarget = structure.preferred_return.catch_up_target || 0.20;
      const catchUpPercent = structure.preferred_return.catch_up_percent || 1.0;

      // Calculate how much GP needs to reach target share of profits
      const totalProfitDistributed = cumulativeLPDistribution + cumulativeGPDistribution - totalEquity;
      const gpTargetProfit = (totalProfitDistributed + remaining) * catchUpTarget;
      const gpCurrentProfit = cumulativeGPDistribution - gpEquity;
      const gpCatchUpNeeded = Math.max(0, gpTargetProfit - gpCurrentProfit);

      const catchUpAmount = Math.min(remaining, gpCatchUpNeeded / catchUpPercent);
      const gpCatchUp = catchUpAmount * catchUpPercent;
      const lpCatchUp = catchUpAmount * (1 - catchUpPercent);

      if (catchUpAmount > 0) {
        cumulativeLPDistribution += lpCatchUp;
        cumulativeGPDistribution += gpCatchUp;
        remaining -= catchUpAmount;

        tierResults.push({
          tier_number: 2,
          tier_name: 'GP Catch-Up',
          hurdle_type: 'catchup',
          distributable_amount: catchUpAmount,
          lp_distribution: lpCatchUp,
          gp_distribution: gpCatchUp,
          gp_promote_in_tier: gpCatchUp,
          cumulative_lp_distribution: cumulativeLPDistribution,
          cumulative_gp_distribution: cumulativeGPDistribution,
          cumulative_total_distribution: cumulativeLPDistribution + cumulativeGPDistribution,
          lp_irr_at_tier: calculateIRRFromDistributions(cumulativeLPDistribution, lpEquity, holdPeriodYears),
          lp_multiple_at_tier: lpEquity > 0 ? cumulativeLPDistribution / lpEquity : 0,
          gp_irr_at_tier: calculateIRRFromDistributions(cumulativeGPDistribution, gpEquity, holdPeriodYears),
          gp_multiple_at_tier: gpEquity > 0 ? cumulativeGPDistribution / gpEquity : 0,
        });
      }
    }
  }

  // ===== STEP 4: Promote Tiers =====
  const promoteTiers = structure.promote_tiers || [];
  const sortedTiers = [...promoteTiers].sort((a, b) => (a.tier_number || 0) - (b.tier_number || 0));

  for (let i = 0; i < sortedTiers.length && remaining > 0; i++) {
    const tier = sortedTiers[i];
    const nextTier = sortedTiers[i + 1];

    // Check if hurdle is met
    const currentLPMultiple = lpEquity > 0 ? cumulativeLPDistribution / lpEquity : 0;
    const currentLPIRR = calculateIRRFromDistributions(cumulativeLPDistribution, lpEquity, holdPeriodYears);

    let hurdleMet = true;
    if (tier.hurdle_type === 'irr' && tier.irr_hurdle) {
      hurdleMet = currentLPIRR >= tier.irr_hurdle;
    } else if (tier.hurdle_type === 'equity_multiple' && tier.multiple_hurdle) {
      hurdleMet = currentLPMultiple >= tier.multiple_hurdle;
    } else if (tier.hurdle_type === 'both') {
      if (tier.hurdle_logic === 'and') {
        hurdleMet = currentLPIRR >= (tier.irr_hurdle || 0) && currentLPMultiple >= (tier.multiple_hurdle || 0);
      } else {
        hurdleMet = currentLPIRR >= (tier.irr_hurdle || 0) || currentLPMultiple >= (tier.multiple_hurdle || 0);
      }
    }

    // Calculate distribution for this tier
    let tierAmount = remaining;

    // If there's a next tier, limit distribution to amount that reaches next hurdle
    if (nextTier) {
      if (nextTier.irr_hurdle) {
        tierAmount = calculateAmountToReachIRR(
          nextTier.irr_hurdle,
          cumulativeLPDistribution,
          lpEquity,
          holdPeriodYears,
          remaining,
          tier.lp_share || 0.80
        );
      } else if (nextTier.multiple_hurdle) {
        const targetLP = lpEquity * nextTier.multiple_hurdle;
        const lpNeeded = targetLP - cumulativeLPDistribution;
        const lpShareTier = tier.lp_share || 0.80;
        tierAmount = Math.min(remaining, lpNeeded / lpShareTier);
      }
    }

    tierAmount = Math.max(0, Math.min(tierAmount, remaining));

    if (tierAmount > 0) {
      const lpShareTier = tier.lp_share || 0.80;
      const gpShareTier = tier.gp_share || 0.20;

      const lpDist = tierAmount * lpShareTier;
      const gpDist = tierAmount * gpShareTier;
      const gpPromote = gpDist - (tierAmount * gpShare); // Promote above pro-rata

      cumulativeLPDistribution += lpDist;
      cumulativeGPDistribution += gpDist;
      remaining -= tierAmount;

      tierResults.push({
        tier_number: tier.tier_number + 2, // Account for ROC and Pref
        tier_name: tier.name || `Tier ${tier.tier_number}`,
        hurdle_type: tier.hurdle_type || 'irr',
        irr_hurdle: tier.irr_hurdle,
        multiple_hurdle: tier.multiple_hurdle,
        lp_share: lpShareTier,
        gp_share: gpShareTier,
        distributable_amount: tierAmount,
        lp_distribution: lpDist,
        gp_distribution: gpDist,
        gp_promote_in_tier: Math.max(0, gpPromote),
        cumulative_lp_distribution: cumulativeLPDistribution,
        cumulative_gp_distribution: cumulativeGPDistribution,
        cumulative_total_distribution: cumulativeLPDistribution + cumulativeGPDistribution,
        lp_irr_at_tier: calculateIRRFromDistributions(cumulativeLPDistribution, lpEquity, holdPeriodYears),
        lp_multiple_at_tier: lpEquity > 0 ? cumulativeLPDistribution / lpEquity : 0,
        gp_irr_at_tier: calculateIRRFromDistributions(cumulativeGPDistribution, gpEquity, holdPeriodYears),
        gp_multiple_at_tier: gpEquity > 0 ? cumulativeGPDistribution / gpEquity : 0,
      });
    }
  }

  // ===== Calculate Final Results =====
  const lpCashFlows = buildLPCashFlows(cashFlows, cumulativeLPDistribution, lpEquity, holdPeriodYears);
  const gpCashFlows = buildGPCashFlows(cashFlows, cumulativeGPDistribution, gpEquity, holdPeriodYears);

  const totalPromoteEarned = tierResults.reduce((sum, t) => sum + (t.gp_promote_in_tier || 0), 0);
  const prefTier = tierResults.find((t) => t.tier_name.includes('Preferred'));

  const finalResults = {
    lp: {
      total_invested: lpEquity,
      total_distributed: cumulativeLPDistribution,
      profit: cumulativeLPDistribution - lpEquity,
      irr: calculateIRR(lpCashFlows),
      equity_multiple: lpEquity > 0 ? cumulativeLPDistribution / lpEquity : 0,
      cash_on_cash_avg: calculateAverageCashOnCash(lpCashFlows, lpEquity, holdPeriodYears),
      return_of_capital: Math.min(cumulativeLPDistribution, lpEquity),
      preferred_return_received: prefTier?.lp_distribution || 0,
      profit_share_received: Math.max(0, cumulativeLPDistribution - lpEquity - (prefTier?.lp_distribution || 0)),
      payback_period_months: calculatePaybackPeriod(lpCashFlows),
      peak_equity: lpEquity,
    },
    gp: {
      total_invested: gpEquity,
      total_distributed: cumulativeGPDistribution,
      profit: cumulativeGPDistribution - gpEquity,
      irr: calculateIRR(gpCashFlows),
      equity_multiple: gpEquity > 0 ? cumulativeGPDistribution / gpEquity : 0,
      promote_earned: totalPromoteEarned,
      co_invest_return: cumulativeGPDistribution - totalPromoteEarned,
      acquisition_fees_earned: 0,
      asset_management_fees_earned: 0,
      disposition_fees_earned: 0,
      construction_management_fees_earned: 0,
      total_fees_earned: 0,
      return_on_gp_capital: gpEquity > 0 ? (cumulativeGPDistribution - gpEquity) / gpEquity : 0,
    },
    project: {
      total_equity: totalEquity,
      total_distributions: totalDistributable,
      net_profit: totalDistributable - totalEquity,
      project_equity_multiple: totalEquity > 0 ? totalDistributable / totalEquity : 0,
      return_on_equity: totalEquity > 0 ? (totalDistributable - totalEquity) / totalEquity : 0,
    },
  };

  return {
    inputs: {
      total_equity_invested: totalEquity,
      lp_equity_invested: lpEquity,
      gp_equity_invested: gpEquity,
      hold_period_years: holdPeriodYears,
      hold_period_months: holdPeriodYears * 12,
      total_distributions: totalDistributable,
      cash_flows: cashFlows,
    },
    tier_results: tierResults,
    final_results: finalResults,
    distribution_schedule: buildDistributionSchedule(cashFlows, tierResults, structure, holdPeriodYears),
  };
}

// ===== Helper Functions =====

/**
 * Calculate preferred return based on type and compounding
 */
function calculatePreferredReturn(equity, rate, years, type, compoundingFrequency) {
  if (!equity || !rate || !years) return 0;

  switch (type) {
    case 'cumulative':
    case 'non_cumulative':
      return equity * rate * years;

    case 'compounding': {
      const periodsPerYear =
        compoundingFrequency === 'annual' ? 1 :
        compoundingFrequency === 'quarterly' ? 4 : 12;
      const totalPeriods = years * periodsPerYear;
      const periodRate = rate / periodsPerYear;
      const futureValue = equity * Math.pow(1 + periodRate, totalPeriods);
      return futureValue - equity;
    }

    default:
      return equity * rate * years;
  }
}

/**
 * Calculate approximate IRR from total distributions
 */
function calculateIRRFromDistributions(totalDistribution, equity, years) {
  if (!equity || equity <= 0 || !years || years <= 0) return 0;
  const multiple = totalDistribution / equity;
  if (multiple <= 0) return -1;
  // Approximate annualized IRR: (multiple)^(1/years) - 1
  return Math.pow(multiple, 1 / years) - 1;
}

/**
 * Calculate amount needed to reach target IRR
 */
function calculateAmountToReachIRR(targetIRR, currentDistribution, equity, years, maxAmount, lpShare) {
  if (!equity || equity <= 0 || !years || years <= 0) return maxAmount;

  // Target multiple to achieve IRR
  const targetMultiple = Math.pow(1 + targetIRR, years);
  const targetDistribution = equity * targetMultiple;
  const lpNeeded = targetDistribution - currentDistribution;

  if (lpNeeded <= 0) return 0;

  return Math.min(maxAmount, lpNeeded / lpShare);
}

/**
 * Calculate average cash-on-cash return
 */
function calculateAverageCashOnCash(cashFlows, equity, years) {
  if (!equity || equity <= 0 || !years || years <= 0) return 0;
  const distributions = cashFlows.filter((cf) => cf > 0);
  if (distributions.length === 0) return 0;
  const totalDistributions = distributions.reduce((sum, d) => sum + d, 0);
  return totalDistributions / years / equity;
}

/**
 * Calculate payback period in months
 */
function calculatePaybackPeriod(cashFlows) {
  let cumulative = 0;
  for (let i = 0; i < cashFlows.length; i++) {
    cumulative += cashFlows[i];
    if (cumulative >= 0) {
      return i;
    }
  }
  return cashFlows.length;
}

/**
 * Build LP cash flow array for IRR calculation
 */
function buildLPCashFlows(projectCashFlows, totalDistribution, lpEquity, years) {
  const months = Math.ceil(years * 12);
  const flows = [-lpEquity];

  // Add zeros for intermediate months
  for (let i = 1; i < months; i++) {
    flows.push(0);
  }

  // Final distribution at end
  flows.push(totalDistribution);

  return flows;
}

/**
 * Build GP cash flow array for IRR calculation
 */
function buildGPCashFlows(projectCashFlows, totalDistribution, gpEquity, years) {
  const months = Math.ceil(years * 12);
  const flows = [-gpEquity];

  for (let i = 1; i < months; i++) {
    flows.push(0);
  }

  flows.push(totalDistribution);

  return flows;
}

/**
 * Build detailed distribution schedule
 */
function buildDistributionSchedule(cashFlows, tierResults, structure, holdPeriodYears) {
  const schedule = [];
  const months = Math.ceil(holdPeriodYears * 12);

  // For now, show simplified schedule with all distributions at exit
  // Full implementation would distribute based on cash flow timing
  const lastTier = tierResults[tierResults.length - 1];

  if (lastTier) {
    schedule.push({
      period: months,
      date: `Month ${months}`,
      type: 'sale',
      gross_distribution: lastTier.cumulative_total_distribution,
      return_of_capital: tierResults[0]?.lp_distribution + tierResults[0]?.gp_distribution || 0,
      preferred_return: tierResults[1]?.lp_distribution + tierResults[1]?.gp_distribution || 0,
      profit_split: lastTier.cumulative_total_distribution -
        (tierResults[0]?.cumulative_total_distribution || 0) -
        (tierResults[1]?.total_distribution || 0),
      lp_distribution: lastTier.cumulative_lp_distribution,
      gp_distribution: lastTier.cumulative_gp_distribution,
      gp_promote: tierResults.reduce((sum, t) => sum + (t.gp_promote_in_tier || 0), 0),
      cumulative_lp: lastTier.cumulative_lp_distribution,
      cumulative_gp: lastTier.cumulative_gp_distribution,
      lp_multiple_to_date: lastTier.lp_multiple_at_tier,
      lp_irr_to_date: lastTier.lp_irr_at_tier,
    });
  }

  return schedule;
}

/**
 * Run waterfall calculation with multiple scenarios
 */
export function runWaterfallScenarios(input, revenueAdjustments = [-0.20, 0, 0.20]) {
  const results = {};
  const scenarioNames = ['downside', 'base', 'upside'];

  revenueAdjustments.forEach((adj, i) => {
    const adjustedTotal = input.totalDistributable * (1 + adj);
    const scenarioInput = {
      ...input,
      totalDistributable: adjustedTotal,
    };
    results[scenarioNames[i]] = calculateWaterfall(scenarioInput);
  });

  // Summary statistics
  results.summary = {
    lp_irr_range: {
      low: results.downside?.final_results?.lp?.irr || 0,
      base: results.base?.final_results?.lp?.irr || 0,
      high: results.upside?.final_results?.lp?.irr || 0,
    },
    lp_multiple_range: {
      low: results.downside?.final_results?.lp?.equity_multiple || 0,
      base: results.base?.final_results?.lp?.equity_multiple || 0,
      high: results.upside?.final_results?.lp?.equity_multiple || 0,
    },
    gp_promote_range: {
      low: results.downside?.final_results?.gp?.promote_earned || 0,
      base: results.base?.final_results?.gp?.promote_earned || 0,
      high: results.upside?.final_results?.gp?.promote_earned || 0,
    },
  };

  return results;
}

/**
 * Calculate management fees from waterfall structure
 */
export function calculateManagementFees(structure, projectMetrics) {
  const fees = structure.management_fees || {};
  const {
    totalCost = 0,
    hardCosts = 0,
    totalEquity = 0,
    netRevenue = 0,
    holdPeriodYears = 1,
  } = projectMetrics;

  const acquisitionFee = totalCost * (fees.acquisition_fee_percent || 0);
  const constructionMgmtFee = hardCosts * (fees.construction_management_fee_percent || 0);
  const assetMgmtFee = totalEquity * (fees.asset_management_fee_percent || 0) * holdPeriodYears;
  const dispositionFee = netRevenue * (fees.disposition_fee_percent || 0);

  return {
    acquisition_fee: acquisitionFee,
    construction_management_fee: constructionMgmtFee,
    asset_management_fee: assetMgmtFee,
    disposition_fee: dispositionFee,
    total_fees: acquisitionFee + constructionMgmtFee + assetMgmtFee + dispositionFee,
    fees_paid_from: fees.fees_paid_from || 'operating_cash_flow',
  };
}

export default calculateWaterfall;
