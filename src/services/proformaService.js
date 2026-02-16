// src/services/proformaService.js
// Professional-grade Pro Forma financial modeling service
// Supports Scattered Lot, Multifamily, Subdivision templates

import { supabase } from '@/lib/supabase';

// ─── Financial Calculations ───────────────────────────────────────────────────

export function calculateIRR(cashFlows, guess = 0.1) {
  const maxIterations = 200;
  const tolerance = 0.00001;
  let rate = guess;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let derivative = 0;
    for (let j = 0; j < cashFlows.length; j++) {
      npv += cashFlows[j] / Math.pow(1 + rate, j);
      derivative -= j * cashFlows[j] / Math.pow(1 + rate, j + 1);
    }
    if (Math.abs(derivative) < 1e-10) break;
    const newRate = rate - npv / derivative;
    if (Math.abs(newRate - rate) < tolerance) return newRate;
    rate = newRate;
  }
  return rate;
}

export function calculateNPV(cashFlows, discountRate) {
  return cashFlows.reduce((npv, cf, period) => npv + cf / Math.pow(1 + discountRate, period), 0);
}

export function calculateAmortizationSchedule(principal, annualRate, termMonths, ioMonths = 0) {
  const monthlyRate = annualRate / 12;
  const schedule = [];
  let balance = principal;

  for (let month = 1; month <= termMonths; month++) {
    const interest = balance * monthlyRate;
    if (month <= ioMonths) {
      schedule.push({ month, payment: interest, principal: 0, interest, balance });
    } else {
      const amortMonths = termMonths - ioMonths;
      const remainingAmort = amortMonths - (month - ioMonths - 1);
      const payment = remainingAmort > 0
        ? (balance * monthlyRate * Math.pow(1 + monthlyRate, remainingAmort)) /
          (Math.pow(1 + monthlyRate, remainingAmort) - 1)
        : interest;
      const principalPayment = Math.min(payment - interest, balance);
      balance = Math.max(0, balance - principalPayment);
      schedule.push({ month, payment, principal: principalPayment, interest, balance });
    }
  }
  return schedule;
}

export function calculateEquityMultiple(totalDistributions, totalEquity) {
  if (!totalEquity) return 0;
  return totalDistributions / totalEquity;
}

// ─── Pro Forma Calculations ─────────────────────────────────────────────────

export function calculateProFormaMetrics(proforma) {
  const uf = proforma.uses_of_funds || proforma.costs || {};
  const sf = proforma.sources_of_funds || proforma.financing || {};
  const rev = proforma.revenue_projections || proforma.revenue || {};
  const assumptions = proforma.assumptions || {};

  const totalCosts = uf.total_project_cost || 0;
  const totalRevenue = rev.gross_sale_price || rev.total_revenue || 0;
  const saleCosts = (rev.broker_commission || 0) + (rev.seller_closing_costs || 0) +
    (rev.concessions || 0) + (rev.home_warranty || 0);
  const netRevenue = rev.net_sale_proceeds || rev.net_revenue || (totalRevenue - saleCosts);
  const grossProfit = netRevenue - totalCosts;
  const grossMargin = totalRevenue > 0 ? grossProfit / totalRevenue : 0;

  // Financing
  const loans = sf.loans || (proforma.financing?.loans) || [];
  const totalDebt = loans.reduce((s, l) => s + (l.amount || l.loan_amount || 0), 0);
  const equity = sf.equity || proforma.financing?.equity || {};
  const totalEquity = equity.total_equity_required || (totalCosts - totalDebt);
  const ltcRatio = totalCosts > 0 ? totalDebt / totalCosts : 0;

  // Interest costs
  const termMonths = assumptions.total_project_months || assumptions.project_timeline_months || 18;
  const totalInterest = loans.reduce((s, l) => {
    const amt = l.amount || l.loan_amount || 0;
    const rate = l.interest_rate || 0;
    const avgDrawFactor = 0.6; // Average draw factor (S-curve)
    return s + (amt * rate * avgDrawFactor * (termMonths / 12));
  }, 0);

  // Origination fees
  const totalLoanFees = loans.reduce((s, l) => {
    const amt = l.amount || l.loan_amount || 0;
    return s + (amt * (l.origination_fee_percent || l.origination_fee || 0));
  }, 0);

  const financingCosts = totalInterest + totalLoanFees;
  const netProfit = grossProfit - financingCosts;
  const netMargin = totalRevenue > 0 ? netProfit / totalRevenue : 0;
  const projectROI = totalCosts > 0 ? netProfit / totalCosts : 0;

  const equityMultiple = calculateEquityMultiple(totalEquity + netProfit, totalEquity);
  const cashOnCash = totalEquity > 0 ? netProfit / totalEquity : 0;

  // Build monthly cash flow array for IRR
  const monthlyCashFlows = [-totalEquity];
  for (let m = 1; m < termMonths; m++) {
    monthlyCashFlows.push(0);
  }
  monthlyCashFlows.push(totalEquity + netProfit);

  const monthlyIRR = calculateIRR(monthlyCashFlows, 0.02);
  const projectIRR = Math.pow(1 + monthlyIRR, 12) - 1;

  // Equity IRR (accounts for leverage)
  const equityIRR = projectIRR; // Simplified for now
  const projectMultiple = totalCosts > 0 ? netRevenue / totalCosts : 0;

  const npv10 = calculateNPV(monthlyCashFlows, 0.10 / 12);

  // Per-unit metrics
  const units = assumptions.lot_count || rev.units || 1;
  const profitPerUnit = netProfit / units;
  const costPerUnit = totalCosts / units;
  const revenuePerUnit = totalRevenue / units;
  const costPerSF = assumptions.square_footage > 0 ? totalCosts / assumptions.square_footage : 0;

  return {
    totalCosts, totalRevenue, netRevenue, saleCosts,
    grossProfit, grossMargin, netProfit, netMargin,
    totalDebt, totalEquity, ltcRatio,
    totalInterest, totalLoanFees, financingCosts,
    projectIRR, equityIRR, projectMultiple, projectROI,
    equityMultiple, cashOnCash, npv10, termMonths,
    profitPerUnit, costPerUnit, revenuePerUnit, costPerSF,
    units,
  };
}

// ─── Monthly Cash Flow Generator ────────────────────────────────────────────

export function generateMonthlyCashFlows(proforma) {
  const uf = proforma.uses_of_funds || proforma.costs || {};
  const sf = proforma.sources_of_funds || proforma.financing || {};
  const rev = proforma.revenue_projections || proforma.revenue || {};
  const assumptions = proforma.assumptions || {};
  const loans = sf.loans || proforma.financing?.loans || [];
  const equity = sf.equity || proforma.financing?.equity || {};

  const totalMonths = assumptions.total_project_months || assumptions.project_timeline_months || 18;
  const constructionMonths = assumptions.construction_duration_months || (totalMonths - 3);
  const totalEquity = equity.total_equity_required || 0;
  const totalDebt = loans.reduce((s, l) => s + (l.amount || l.loan_amount || 0), 0);
  const landCost = uf.land_acquisition?.total_land_cost || uf.land_cost || 0;
  const hardCosts = uf.hard_costs?.total_hard_costs || uf.hard_costs || 0;
  const softCosts = uf.soft_costs?.total_soft_costs || uf.soft_costs || 0;
  const netSaleProceeds = rev.net_sale_proceeds || rev.net_revenue || 0;
  const primaryRate = loans[0]?.interest_rate || 0.085;

  // S-curve construction cost distribution
  function sCurve(month, total, duration) {
    if (month > duration) return 0;
    const t = month / duration;
    const weight = 3 * t * t - 2 * t * t * t; // Smooth S-curve
    const prevT = (month - 1) / duration;
    const prevWeight = 3 * prevT * prevT - 2 * prevT * prevT * prevT;
    return total * (weight - prevWeight);
  }

  const flows = [];
  let loanBalance = 0;
  let equityDeployed = 0;
  let cumulativeCashFlow = 0;

  for (let m = 1; m <= totalMonths; m++) {
    const isFirst = m === 1;
    const isLast = m === totalMonths;
    const isConstruction = m <= constructionMonths;

    // Uses
    const landPayment = isFirst ? landCost : 0;
    const hardCostPayment = isConstruction ? sCurve(m, hardCosts, constructionMonths) : 0;
    const softCostPayment = isConstruction ? (softCosts / constructionMonths) : 0;
    const interestPayment = loanBalance * (primaryRate / 12);
    const loanPayoff = isLast ? loanBalance : 0;
    const distributions = isLast ? Math.max(0, netSaleProceeds - loanBalance - totalEquity) : 0;

    const totalUses = landPayment + hardCostPayment + softCostPayment + interestPayment + loanPayoff + distributions;

    // Sources
    const needForPeriod = landPayment + hardCostPayment + softCostPayment + interestPayment;
    const equityContribution = isFirst ? totalEquity : 0;
    const debtDraw = isConstruction ? Math.max(0, needForPeriod - (isFirst ? totalEquity : 0)) : 0;
    const saleProceeds = isLast ? netSaleProceeds : 0;

    const totalSources = equityContribution + debtDraw + saleProceeds;

    loanBalance += debtDraw;
    if (isLast) loanBalance = 0;
    equityDeployed += equityContribution;

    const netCashFlow = totalSources - totalUses;
    cumulativeCashFlow += netCashFlow;

    flows.push({
      month: m,
      equity_contribution: equityContribution,
      debt_draw: debtDraw,
      sale_proceeds: saleProceeds,
      total_sources: totalSources,
      land_payment: landPayment,
      hard_cost_payment: hardCostPayment,
      soft_cost_payment: softCostPayment,
      interest_payment: interestPayment,
      loan_payoff: loanPayoff,
      distributions,
      total_uses: totalUses,
      net_cash_flow: netCashFlow,
      cumulative_cash_flow: cumulativeCashFlow,
      loan_balance: loanBalance,
      equity_balance: equityDeployed,
    });
  }
  return flows;
}

// ─── Sensitivity Analysis ───────────────────────────────────────────────────

export function runSensitivityAnalysis(proforma) {
  const calcMetrics = getMetricsCalculator(proforma);

  // Sale Price / Lot Price sensitivity
  const salePriceRange = [-0.10, -0.05, 0, 0.05, 0.10];
  const salePriceSensitivity = salePriceRange.map(delta => {
    const adjusted = adjustProforma(proforma, { salePriceDelta: delta });
    const m = calcMetrics(adjusted);
    return { delta, grossProfit: m.grossProfit, equityIRR: m.projectIRR, equityMultiple: m.equityMultiple };
  });

  // Construction / Infrastructure Cost sensitivity
  const costRange = [-0.10, -0.05, 0, 0.05, 0.10];
  const costSensitivity = costRange.map(delta => {
    const adjusted = adjustProforma(proforma, { costDelta: delta });
    const m = calcMetrics(adjusted);
    return { delta, grossProfit: m.grossProfit, equityIRR: m.projectIRR, equityMultiple: m.equityMultiple };
  });

  // Timeline sensitivity
  const timeRange = [-2, -1, 0, 1, 2, 3];
  const timelineSensitivity = timeRange.map(delta => {
    const adjusted = adjustProforma(proforma, { timelineDelta: delta });
    const m = calcMetrics(adjusted);
    return { delta, interestCost: m.totalInterest, equityIRR: m.projectIRR };
  });

  // Two-variable matrix
  const twoVarMatrix = salePriceRange.map(revDelta => ({
    revDelta,
    scenarios: costRange.map(costDelta => {
      const adjusted = adjustProforma(proforma, { salePriceDelta: revDelta, costDelta });
      const m = calcMetrics(adjusted);
      return { costDelta, equityIRR: m.projectIRR, equityMultiple: m.equityMultiple, grossProfit: m.grossProfit };
    }),
  }));

  return { salePriceSensitivity, costSensitivity, timelineSensitivity, twoVarMatrix };
}

function getMetricsCalculator(proforma) {
  const type = getTemplateType(proforma);
  if (type === 'lot_development') return calculateLotDevelopmentMetrics;
  if (type === 'community_for_sale') return calculateCommunityForSaleMetrics;
  if (type === 'build_to_rent') return calculateBTRMetrics;
  return calculateProFormaMetrics;
}

function adjustProforma(proforma, { salePriceDelta = 0, costDelta = 0, timelineDelta = 0 }) {
  const clone = JSON.parse(JSON.stringify(proforma));
  const uf = clone.uses_of_funds || clone.costs || {};
  const rev = clone.revenue_projections || clone.revenue || {};
  const assumptions = clone.assumptions || {};
  const isLotDev = getTemplateType(clone) === 'lot_development';

  if (salePriceDelta !== 0) {
    if (isLotDev) {
      // Adjust lot revenue
      const lotRevenue = rev.total_lot_revenue || rev.total_revenue || 0;
      const adjusted = lotRevenue * (1 + salePriceDelta);
      if (rev.total_lot_revenue) rev.total_lot_revenue = adjusted;
      if (rev.average_lot_price) rev.average_lot_price = rev.average_lot_price * (1 + salePriceDelta);
      const saleCosts = adjusted * (assumptions.broker_commission_percent || 0.02) + (rev.total_closing_costs || 150000);
      rev.net_lot_revenue = adjusted - saleCosts;
      if (rev.total_revenue) rev.total_revenue = adjusted;
      if (rev.net_revenue !== undefined) rev.net_revenue = rev.net_lot_revenue;
    } else {
      const salePrice = rev.gross_sale_price || rev.total_revenue || 0;
      const adjusted = salePrice * (1 + salePriceDelta);
      if (rev.gross_sale_price) rev.gross_sale_price = adjusted;
      if (rev.total_revenue) rev.total_revenue = adjusted;
      const saleCosts = adjusted * ((assumptions.broker_commission_percent || 0.05) + (assumptions.seller_closing_costs_percent || 0.02));
      rev.net_sale_proceeds = adjusted - saleCosts;
      if (rev.net_revenue !== undefined) rev.net_revenue = rev.net_sale_proceeds;
    }
  }

  if (costDelta !== 0) {
    if (uf.hard_costs && typeof uf.hard_costs === 'object') {
      uf.hard_costs.total_hard_costs = (uf.hard_costs.total_hard_costs || 0) * (1 + costDelta);
    } else if (uf.hard_costs !== undefined) {
      uf.hard_costs = (uf.hard_costs || 0) * (1 + costDelta);
    }
    // Recalculate total
    const land = uf.land_acquisition?.total_land_cost || uf.land_cost || 0;
    const hard = typeof uf.hard_costs === 'object' ? uf.hard_costs.total_hard_costs : (uf.hard_costs || 0);
    const soft = typeof uf.soft_costs === 'object' ? uf.soft_costs.total_soft_costs : (uf.soft_costs || 0);
    const fin = typeof uf.financing_costs === 'object' ? uf.financing_costs.total_financing_costs : (uf.financing_costs || 0);
    const entitlement = uf.entitlement_costs?.total_entitlement_costs || 0;
    const impact = uf.impact_fees?.developer_impact_fee_responsibility || 0;
    const newTotal = land + hard + soft + fin + entitlement + impact;
    if (uf.total_project_cost) uf.total_project_cost = newTotal;
    if (uf.total_development_cost) uf.total_development_cost = newTotal;
  }

  if (timelineDelta !== 0) {
    if (assumptions.total_project_months) assumptions.total_project_months += timelineDelta;
    if (assumptions.project_timeline_months) assumptions.project_timeline_months += timelineDelta;
  }

  return clone;
}

// ─── Investor Waterfall Distribution ────────────────────────────────────────

export function calculateInvestorWaterfall(proforma) {
  const sf = proforma.sources_of_funds || proforma.financing || {};
  const equity = sf.equity || proforma.financing?.equity || {};
  const metrics = calculateProFormaMetrics(proforma);

  const totalEquity = equity.total_equity_required || metrics.totalEquity;
  const investorEquity = equity.investor_equity || 0;
  const sponsorEquity = equity.sponsor_equity || 0;
  const preferredReturn = equity.preferred_return || 0.10;
  const promoteTiers = equity.promote_structure || [];
  const termYears = (metrics.termMonths || 18) / 12;

  const totalAvailable = totalEquity + metrics.netProfit;
  const tiers = [];
  let remaining = totalAvailable;

  // Tier 1: Return of Capital
  const returnOfCapital = Math.min(remaining, totalEquity);
  tiers.push({
    name: 'Return of Capital',
    total: returnOfCapital,
    investor: Math.min(remaining, investorEquity),
    sponsor: Math.min(Math.max(0, remaining - investorEquity), sponsorEquity),
  });
  remaining -= returnOfCapital;

  // Tier 2: Preferred Return
  const prefAmount = totalEquity * preferredReturn * termYears;
  const prefPaid = Math.min(remaining, prefAmount);
  const investorPref = investorEquity > 0 ? prefPaid * (investorEquity / totalEquity) : 0;
  const sponsorPref = prefPaid - investorPref;
  tiers.push({
    name: `Preferred Return (${(preferredReturn * 100).toFixed(0)}%)`,
    total: prefPaid,
    investor: investorPref,
    sponsor: sponsorPref,
  });
  remaining -= prefPaid;

  // Promote Tiers
  promoteTiers.forEach((tier, i) => {
    if (remaining <= 0) return;
    const promote = tier.split || 0.20;
    const tierAmount = remaining; // Simplified: remaining goes through promote
    const sponsorPromote = tierAmount * promote;
    const investorShare = tierAmount - sponsorPromote;
    tiers.push({
      name: `Promote Tier ${i + 1} (${(promote * 100).toFixed(0)}% sponsor)`,
      total: tierAmount,
      investor: investorShare,
      sponsor: sponsorPromote,
    });
    remaining = 0;
  });

  // If no promote tiers, split remaining pro-rata
  if (promoteTiers.length === 0 && remaining > 0) {
    const investorShare = totalEquity > 0 ? remaining * (investorEquity / totalEquity) : 0;
    tiers.push({
      name: 'Remaining Profit (Pro-Rata)',
      total: remaining,
      investor: investorShare,
      sponsor: remaining - investorShare,
    });
  }

  const totalToInvestor = tiers.reduce((s, t) => s + t.investor, 0);
  const totalToSponsor = tiers.reduce((s, t) => s + t.sponsor, 0);
  const investorMultiple = investorEquity > 0 ? totalToInvestor / investorEquity : 0;
  const sponsorMultiple = sponsorEquity > 0 ? totalToSponsor / sponsorEquity : 0;

  return { tiers, totalToInvestor, totalToSponsor, investorMultiple, sponsorMultiple, totalAvailable };
}

// ─── Lot Development Cash Flow Generator ────────────────────────────────────

export function generateLotDevelopmentCashFlows(proforma) {
  const uf = proforma.uses_of_funds || {};
  const sf = proforma.sources_of_funds || {};
  const rev = proforma.revenue_projections || proforma.lot_sales || {};
  const assumptions = proforma.assumptions || {};
  const loans = sf.loans || [];
  const equity = sf.equity || {};

  const totalMonths = assumptions.total_project_months || 28;
  const entitlementMonths = assumptions.entitlement_duration_months || 6;
  const constructionStartMonth = assumptions.construction_start_month || (entitlementMonths + 1);
  const constructionDuration = assumptions.construction_duration_months || 12;
  const absorptionStartMonth = assumptions.absorption_start_month || (constructionStartMonth + Math.floor(constructionDuration * 0.4));
  const lotsPerMonth = assumptions.lots_sold_per_month || 4;
  const totalLots = assumptions.total_lots || 75;

  const landCost = uf.land_acquisition?.total_land_cost || 0;
  const entitlementCosts = uf.entitlement_costs?.total_entitlement_costs || 0;
  const hardCosts = uf.hard_costs?.total_hard_costs || 0;
  const softCosts = uf.soft_costs?.total_soft_costs || 0;
  const impactFees = uf.impact_fees?.developer_impact_fee_responsibility || 0;
  const totalEquity = equity.total_equity_required || 0;
  const totalDebt = loans.reduce((s, l) => s + (l.amount || l.loan_amount || 0), 0);
  const primaryRate = loans[0]?.interest_rate || 0.075;
  const lotReleasePercent = loans[0]?.lot_release_percent || 1.10; // 110% of pro-rata loan per lot
  const avgLotPrice = rev.average_lot_price || (rev.total_lot_revenue || 0) / totalLots;
  const brokerPercent = rev.broker_commission_percent || 0.02;
  const closingCostPerLot = rev.closing_costs_per_lot || 2000;

  // S-curve for infrastructure construction
  function sCurve(month, total, duration) {
    if (month > duration || month < 1) return 0;
    const t = month / duration;
    const prevT = (month - 1) / duration;
    return total * ((3 * t * t - 2 * t * t * t) - (3 * prevT * prevT - 2 * prevT * prevT * prevT));
  }

  const flows = [];
  let loanBalance = 0;
  let cumulativeCashFlow = 0;
  let cumulativeLotsSold = 0;
  let equityDeployed = 0;

  for (let m = 1; m <= totalMonths; m++) {
    const isFirst = m === 1;
    const isLast = m === totalMonths;
    const constructionMonth = m - constructionStartMonth + 1;
    const isConstruction = constructionMonth >= 1 && constructionMonth <= constructionDuration;
    const isEntitlement = m >= 2 && m <= entitlementMonths;
    const isAbsorption = m >= absorptionStartMonth && cumulativeLotsSold < totalLots;

    // Uses
    const landPayment = isFirst ? landCost : 0;
    const entitlementPayment = isEntitlement ? (entitlementCosts / (entitlementMonths - 1)) : 0;
    const hardCostPayment = isConstruction ? sCurve(constructionMonth, hardCosts, constructionDuration) : 0;
    const softCostPayment = (isConstruction || isEntitlement) ? (softCosts / (constructionDuration + entitlementMonths - 1)) : 0;
    const impactFeePayment = isConstruction ? (impactFees / constructionDuration) : 0;
    const interestPayment = loanBalance * (primaryRate / 12);

    // Lot sales
    const lotsSoldThisMonth = isAbsorption ? Math.min(lotsPerMonth, totalLots - cumulativeLotsSold) : 0;
    const lotSaleRevenue = lotsSoldThisMonth * avgLotPrice;
    const saleCosts = lotsSoldThisMonth * (avgLotPrice * brokerPercent + closingCostPerLot);
    const netSaleProceeds = lotSaleRevenue - saleCosts;
    cumulativeLotsSold += lotsSoldThisMonth;

    // Debt draws and paydowns
    const periodCosts = landPayment + entitlementPayment + hardCostPayment + softCostPayment + impactFeePayment + interestPayment;
    const equityContribution = isFirst ? totalEquity : 0;
    equityDeployed += equityContribution;

    // Debt draw: fund costs not covered by equity or lot sales
    const fundingNeed = periodCosts - (isFirst ? equityContribution : 0) - (lotsSoldThisMonth > 0 ? netSaleProceeds : 0);
    const debtDraw = isConstruction || isEntitlement || isFirst ? Math.max(0, Math.min(fundingNeed, totalDebt - loanBalance)) : 0;

    // Loan paydown from lot sales (lot release)
    const lotReleaseAmount = lotsSoldThisMonth > 0 ? Math.min(lotsSoldThisMonth * (totalDebt / totalLots) * lotReleasePercent, loanBalance + debtDraw) : 0;
    const loanPayoff = isLast && loanBalance + debtDraw - lotReleaseAmount > 0 ? loanBalance + debtDraw - lotReleaseAmount : 0;

    loanBalance = loanBalance + debtDraw - lotReleaseAmount - loanPayoff;
    if (loanBalance < 0) loanBalance = 0;

    // Distributions (excess from lot sales after loan release)
    const excessFromSales = lotsSoldThisMonth > 0 ? Math.max(0, netSaleProceeds - lotReleaseAmount - (isFirst ? 0 : Math.max(0, periodCosts - debtDraw))) : 0;
    const distributions = isLast ? Math.max(0, netSaleProceeds - lotReleaseAmount - loanPayoff) : excessFromSales;

    const totalUses = periodCosts + lotReleaseAmount + loanPayoff;
    const totalSources = equityContribution + debtDraw + netSaleProceeds + (isFirst ? 0 : 0);

    const netCashFlow = totalSources - totalUses + lotReleaseAmount; // Lot release is internal
    cumulativeCashFlow += netCashFlow;

    flows.push({
      month: m,
      phase: constructionMonth <= 0 ? 'Entitlement' : isConstruction ? 'Construction' : 'Absorption',
      equity_contribution: equityContribution,
      debt_draw: debtDraw,
      lots_sold: lotsSoldThisMonth,
      cumulative_lots_sold: cumulativeLotsSold,
      lot_sale_revenue: lotSaleRevenue,
      sale_costs: saleCosts,
      net_sale_proceeds: netSaleProceeds,
      land_payment: landPayment,
      entitlement_payment: entitlementPayment,
      hard_cost_payment: hardCostPayment,
      soft_cost_payment: softCostPayment,
      impact_fee_payment: impactFeePayment,
      interest_payment: interestPayment,
      lot_release: lotReleaseAmount,
      loan_payoff: loanPayoff,
      distributions,
      net_cash_flow: netCashFlow,
      cumulative_cash_flow: cumulativeCashFlow,
      loan_balance: loanBalance,
    });
  }
  return flows;
}

// ─── Lot Development Metrics ─────────────────────────────────────────────────

export function calculateLotDevelopmentMetrics(proforma) {
  const uf = proforma.uses_of_funds || {};
  const sf = proforma.sources_of_funds || {};
  const rev = proforma.revenue_projections || proforma.lot_sales || {};
  const assumptions = proforma.assumptions || {};

  const landCost = uf.land_acquisition?.total_land_cost || 0;
  const entitlementCosts = uf.entitlement_costs?.total_entitlement_costs || 0;
  const hardCosts = uf.hard_costs?.total_hard_costs || 0;
  const softCosts = uf.soft_costs?.total_soft_costs || 0;
  const impactFees = uf.impact_fees?.developer_impact_fee_responsibility || 0;
  const financingCostsEst = uf.financing_costs?.total_financing_costs || 0;
  const totalCosts = uf.total_development_cost || (landCost + entitlementCosts + hardCosts + softCosts + impactFees + financingCostsEst);

  const totalLots = assumptions.total_lots || 75;
  const totalAcreage = assumptions.total_acreage || 40;
  const netAcres = assumptions.net_developable_acres || 26;
  const totalRevenue = rev.total_lot_revenue || 0;
  const totalSaleCosts = rev.total_sale_costs || ((rev.broker_commission || 0) + (rev.total_closing_costs || 0));
  const netRevenue = rev.net_lot_revenue || (totalRevenue - totalSaleCosts);

  // Financing
  const loans = sf.loans || [];
  const totalDebt = loans.reduce((s, l) => s + (l.amount || l.loan_amount || 0), 0);
  const equity = sf.equity || {};
  const totalEquity = equity.total_equity_required || (totalCosts - totalDebt);
  const ltcRatio = totalCosts > 0 ? totalDebt / totalCosts : 0;

  // Interest estimate
  const termMonths = assumptions.total_project_months || 28;
  const avgDrawFactor = 0.55;
  const totalInterest = loans.reduce((s, l) => {
    const amt = l.amount || l.loan_amount || 0;
    const rate = l.interest_rate || 0;
    return s + (amt * rate * avgDrawFactor * (termMonths / 12));
  }, 0);
  const totalLoanFees = loans.reduce((s, l) => {
    const amt = l.amount || l.loan_amount || 0;
    return s + (amt * (l.origination_fee_percent || 0));
  }, 0);
  const financingCosts = totalInterest + totalLoanFees;

  const grossProfit = netRevenue - totalCosts;
  const grossMargin = totalRevenue > 0 ? grossProfit / totalRevenue : 0;
  const netProfit = grossProfit - financingCosts + financingCostsEst; // Avoid double counting if financing is in totalCosts
  const netMargin = totalRevenue > 0 ? netProfit / totalRevenue : 0;
  const projectROI = totalCosts > 0 ? netProfit / totalCosts : 0;
  const developmentSpread = totalCosts > 0 ? (totalRevenue / totalCosts) - 1 : 0;
  const returnOnCost = totalCosts > 0 ? netRevenue / totalCosts - 1 : 0;

  // Per-unit metrics
  const costPerLot = totalLots > 0 ? totalCosts / totalLots : 0;
  const revenuePerLot = totalLots > 0 ? totalRevenue / totalLots : 0;
  const profitPerLot = totalLots > 0 ? netProfit / totalLots : 0;
  const landCostPerLot = totalLots > 0 ? landCost / totalLots : 0;
  const improvementCostPerLot = totalLots > 0 ? (hardCosts + softCosts + impactFees) / totalLots : 0;
  const costPerAcre = totalAcreage > 0 ? totalCosts / totalAcreage : 0;
  const profitPerAcre = totalAcreage > 0 ? netProfit / totalAcreage : 0;
  const avgLotPrice = rev.average_lot_price || revenuePerLot;

  // IRR calculation
  const monthlyCashFlows = [-totalEquity];
  const absorptionMonths = assumptions.absorption_months || Math.ceil(totalLots / (assumptions.lots_sold_per_month || 4));
  const absorptionStart = assumptions.absorption_start_month || Math.ceil(termMonths * 0.4);
  for (let m = 1; m < termMonths; m++) {
    if (m >= absorptionStart && m < absorptionStart + absorptionMonths) {
      const lotsThisMonth = Math.min(assumptions.lots_sold_per_month || 4, totalLots - Math.floor((m - absorptionStart) * (assumptions.lots_sold_per_month || 4)));
      monthlyCashFlows.push(lotsThisMonth > 0 ? (lotsThisMonth * avgLotPrice * 0.95) / totalEquity * (netProfit / (netRevenue || 1)) * totalEquity / absorptionMonths : 0);
    } else {
      monthlyCashFlows.push(0);
    }
  }
  // Final month: return remaining equity + profit
  monthlyCashFlows.push(totalEquity + netProfit - monthlyCashFlows.slice(1).reduce((s, v) => s + v, 0));

  const monthlyIRR = calculateIRR(monthlyCashFlows, 0.015);
  const projectIRR = Math.pow(1 + monthlyIRR, 12) - 1;
  const equityIRR = projectIRR;
  const equityMultiple = calculateEquityMultiple(totalEquity + netProfit, totalEquity);
  const cashOnCash = totalEquity > 0 ? netProfit / totalEquity : 0;
  const projectMultiple = totalCosts > 0 ? netRevenue / totalCosts : 0;

  return {
    totalCosts, totalRevenue, netRevenue, totalSaleCosts,
    grossProfit, grossMargin, netProfit, netMargin,
    totalDebt, totalEquity, ltcRatio,
    totalInterest, totalLoanFees, financingCosts,
    projectIRR, equityIRR, projectMultiple, projectROI,
    equityMultiple, cashOnCash, termMonths,
    developmentSpread, returnOnCost,
    // Per-lot/acre metrics
    totalLots, totalAcreage, netAcres,
    costPerLot, revenuePerLot, profitPerLot,
    landCostPerLot, improvementCostPerLot,
    costPerAcre, profitPerAcre, avgLotPrice,
    units: totalLots,
    profitPerUnit: profitPerLot,
    costPerUnit: costPerLot,
    revenuePerUnit: revenuePerLot,
    saleCosts: totalSaleCosts,
    // Lot dev specific
    landCost, entitlementCosts, hardCosts, softCosts, impactFees,
  };
}

// ─── Template Type Detection ─────────────────────────────────────────────────

export function getTemplateType(proforma) {
  if (proforma.template_id === 'tmpl-lot-development' || proforma.assumptions?.template_type === 'lot_development') {
    return 'lot_development';
  }
  if (proforma.template_id === 'tmpl-community-for-sale' || proforma.assumptions?.template_type === 'community_for_sale') {
    return 'community_for_sale';
  }
  if (proforma.template_id === 'tmpl-btr-development' || proforma.assumptions?.template_type === 'build_to_rent') {
    return 'build_to_rent';
  }
  return 'scattered_lot';
}

// ─── Community For-Sale Development Metrics ──────────────────────────────────

export function calculateCommunityForSaleMetrics(proforma) {
  const uf = proforma.uses_of_funds || {};
  const sf = proforma.sources_of_funds || {};
  const rev = proforma.revenue_projections || {};
  const assumptions = proforma.assumptions || {};

  const landCost = uf.land_acquisition?.total_land_cost || 0;
  const landDevCost = uf.land_development?.total_land_development || 0;
  const verticalCost = uf.vertical_costs?.total_vertical_construction || 0;
  const indirectCosts = uf.indirect_costs?.total_indirect_costs || 0;
  const impactFees = uf.impact_fees?.total_impact_fees || 0;
  const financingCostsEst = uf.financing_costs?.total_financing_costs || 0;
  const totalCosts = uf.total_project_cost || (landCost + landDevCost + verticalCost + indirectCosts + impactFees + financingCostsEst);

  const totalHomes = assumptions.total_homes || 1;
  const totalRevenue = rev.total_home_sales_revenue || rev.total_gross_revenue || 0;
  const totalSaleCosts = rev.less_sales_costs || ((rev.less_commissions || 0) + (rev.less_closing_costs || 0));
  const netRevenue = rev.net_revenue || (totalRevenue - totalSaleCosts);

  const loans = sf.loans || [];
  const totalDebt = loans.reduce((s, l) => s + (l.amount || l.loan_amount || l.commitment_amount || 0), 0);
  const equity = sf.equity || {};
  const totalEquity = equity.total_equity_required || (totalCosts - totalDebt);
  const ltcRatio = totalCosts > 0 ? totalDebt / totalCosts : 0;

  const termMonths = assumptions.total_sellout_months || assumptions.total_project_months || 36;
  const avgDrawFactor = 0.50;
  const totalInterest = loans.reduce((s, l) => {
    const amt = l.amount || l.loan_amount || l.commitment_amount || 0;
    const rate = l.interest_rate || 0;
    return s + (amt * rate * avgDrawFactor * (termMonths / 12));
  }, 0);
  const totalLoanFees = loans.reduce((s, l) => {
    const amt = l.amount || l.loan_amount || l.commitment_amount || 0;
    return s + (amt * (l.origination_fee_percent || 0));
  }, 0);
  const financingCosts = totalInterest + totalLoanFees;

  const grossProfit = netRevenue - totalCosts;
  const grossMargin = totalRevenue > 0 ? grossProfit / totalRevenue : 0;
  const netProfit = grossProfit - financingCosts + financingCostsEst;
  const netMargin = totalRevenue > 0 ? netProfit / totalRevenue : 0;
  const projectROI = totalCosts > 0 ? netProfit / totalCosts : 0;

  // Per-home metrics
  const costPerHome = totalHomes > 0 ? totalCosts / totalHomes : 0;
  const revenuePerHome = totalHomes > 0 ? totalRevenue / totalHomes : 0;
  const profitPerHome = totalHomes > 0 ? netProfit / totalHomes : 0;
  const avgSF = assumptions.product_mix?.reduce((s, p) => s + (p.square_footage * p.home_count), 0) / totalHomes || 2200;
  const costPerSF = avgSF > 0 ? totalCosts / (totalHomes * avgSF) : 0;

  // IRR
  const monthlyCashFlows = [-totalEquity];
  for (let m = 1; m < termMonths; m++) {
    monthlyCashFlows.push(0);
  }
  monthlyCashFlows.push(totalEquity + netProfit);
  const monthlyIRR = calculateIRR(monthlyCashFlows, 0.015);
  const projectIRR = Math.pow(1 + monthlyIRR, 12) - 1;
  const equityIRR = projectIRR;
  const equityMultiple = calculateEquityMultiple(totalEquity + netProfit, totalEquity);
  const cashOnCash = totalEquity > 0 ? netProfit / totalEquity : 0;
  const projectMultiple = totalCosts > 0 ? netRevenue / totalCosts : 0;

  return {
    totalCosts, totalRevenue, netRevenue, totalSaleCosts,
    grossProfit, grossMargin, netProfit, netMargin,
    totalDebt, totalEquity, ltcRatio,
    totalInterest, totalLoanFees, financingCosts,
    projectIRR, equityIRR, projectMultiple, projectROI,
    equityMultiple, cashOnCash, termMonths,
    // Per-unit
    totalHomes, costPerHome, revenuePerHome, profitPerHome, costPerSF,
    units: totalHomes,
    profitPerUnit: profitPerHome,
    costPerUnit: costPerHome,
    revenuePerUnit: revenuePerHome,
    saleCosts: totalSaleCosts,
    // Community specific
    landCost, landDevCost, verticalCost, indirectCosts, impactFees,
  };
}

// ─── Community For-Sale Cash Flow Generator ──────────────────────────────────

export function generateCommunityForSaleCashFlows(proforma) {
  const uf = proforma.uses_of_funds || {};
  const sf = proforma.sources_of_funds || {};
  const rev = proforma.revenue_projections || {};
  const assumptions = proforma.assumptions || {};
  const loans = sf.loans || [];
  const equity = sf.equity || {};

  const totalMonths = assumptions.total_sellout_months || assumptions.total_project_months || 36;
  const totalHomes = assumptions.total_homes || 100;
  const landDevMonths = assumptions.land_development_months || 12;
  const salesPerMonth = assumptions.sales_per_month || 5;
  const closingsPerMonth = assumptions.closings_per_month || 4;
  const backlogMonths = assumptions.backlog_months || 4;
  const salesStartMonth = assumptions.sales_start_month || (landDevMonths - 2);

  const landCost = uf.land_acquisition?.total_land_cost || 0;
  const landDevCost = uf.land_development?.total_land_development || 0;
  const verticalCostTotal = uf.vertical_costs?.total_vertical_construction || 0;
  const indirectCosts = uf.indirect_costs?.total_indirect_costs || 0;
  const impactFees = uf.impact_fees?.total_impact_fees || 0;
  const totalEquity = equity.total_equity_required || 0;
  const totalDebt = loans.reduce((s, l) => s + (l.amount || l.loan_amount || l.commitment_amount || 0), 0);
  const primaryRate = loans[0]?.interest_rate || 0.07;
  const avgHomePrice = rev.average_sale_price || ((rev.total_home_sales_revenue || 0) / totalHomes);
  const saleCostPercent = rev.sale_cost_percent || 0.06;
  const verticalCostPerHome = verticalCostTotal / totalHomes;

  function sCurve(month, total, duration) {
    if (month > duration || month < 1) return 0;
    const t = month / duration;
    const prevT = (month - 1) / duration;
    return total * ((3 * t * t - 2 * t * t * t) - (3 * prevT * prevT - 2 * prevT * prevT * prevT));
  }

  const flows = [];
  let loanBalance = 0;
  let cumulativeCashFlow = 0;
  let cumulativeSales = 0;
  let cumulativeClosings = 0;
  let backlog = 0;

  for (let m = 1; m <= totalMonths; m++) {
    const isFirst = m === 1;
    const isLandDev = m <= landDevMonths;
    const isSelling = m >= salesStartMonth && cumulativeSales < totalHomes;
    const isClosing = m >= salesStartMonth + backlogMonths && cumulativeClosings < totalHomes;

    // Sales and closings
    const newSales = isSelling ? Math.min(salesPerMonth, totalHomes - cumulativeSales) : 0;
    cumulativeSales += newSales;
    backlog += newSales;
    const closings = isClosing ? Math.min(closingsPerMonth, backlog, totalHomes - cumulativeClosings) : 0;
    cumulativeClosings += closings;
    backlog -= closings;

    // Costs
    const landPayment = isFirst ? landCost : 0;
    const landDevPayment = isLandDev ? sCurve(m, landDevCost, landDevMonths) : 0;
    const verticalPayment = closings > 0 || (m >= salesStartMonth && m <= salesStartMonth + totalHomes / closingsPerMonth + backlogMonths)
      ? verticalCostPerHome * (isClosing ? closings : 0) + (isLandDev ? 0 : (verticalCostTotal * 0.3 / (totalMonths - landDevMonths)))
      : 0;
    const indirectPayment = indirectCosts / totalMonths;
    const impactPayment = closings > 0 ? (impactFees / totalHomes) * closings : 0;
    const interestPayment = loanBalance * (primaryRate / 12);

    // Revenue from closings
    const homeRevenue = closings * avgHomePrice;
    const saleCosts = homeRevenue * saleCostPercent;
    const netHomeRevenue = homeRevenue - saleCosts;

    // Financing
    const equityContribution = isFirst ? totalEquity : 0;
    const periodCosts = landPayment + landDevPayment + verticalPayment + indirectPayment + impactPayment + interestPayment;
    const debtDraw = isFirst || isLandDev || (m < salesStartMonth + backlogMonths)
      ? Math.max(0, Math.min(periodCosts - (isFirst ? totalEquity : 0) - netHomeRevenue, totalDebt - loanBalance))
      : 0;
    const debtPaydown = closings > 0 ? Math.min(netHomeRevenue * 0.6, loanBalance + debtDraw) : 0;

    loanBalance = loanBalance + debtDraw - debtPaydown;
    if (loanBalance < 0) loanBalance = 0;

    const netCashFlow = equityContribution + debtDraw + netHomeRevenue - periodCosts - debtPaydown;
    cumulativeCashFlow += netCashFlow;

    flows.push({
      month: m,
      new_sales: newSales,
      cumulative_sales: cumulativeSales,
      closings,
      cumulative_closings: cumulativeClosings,
      backlog,
      equity_contribution: equityContribution,
      debt_draw: debtDraw,
      home_sale_revenue: homeRevenue,
      sale_costs: saleCosts,
      net_home_revenue: netHomeRevenue,
      land_payment: landPayment,
      land_dev_payment: landDevPayment,
      vertical_payment: verticalPayment,
      indirect_payment: indirectPayment,
      impact_fee_payment: impactPayment,
      interest_payment: interestPayment,
      debt_paydown: debtPaydown,
      net_cash_flow: netCashFlow,
      cumulative_cash_flow: cumulativeCashFlow,
      loan_balance: loanBalance,
    });
  }
  return flows;
}

// ─── Build-to-Rent (BTR) Metrics Calculator ─────────────────────────────────

export function calculateBTRMetrics(proforma) {
  const uf = proforma.uses_of_funds || {};
  const sf = proforma.sources_of_funds || {};
  const ops = proforma.operating_assumptions || {};
  const exit = proforma.exit_assumptions || {};
  const assumptions = proforma.assumptions || {};

  const landCost = uf.land_acquisition?.total_land_cost || 0;
  const siteWork = uf.development_costs?.site_work?.total_site_work || 0;
  const verticalCost = uf.development_costs?.vertical_construction?.total_vertical || 0;
  const softCosts = uf.development_costs?.soft_costs?.total_soft_costs || 0;
  const financingCostsEst = uf.financing_costs?.total_financing_costs || 0;
  const totalCosts = uf.total_development_cost || (landCost + siteWork + verticalCost + softCosts + financingCostsEst);

  const totalUnits = assumptions.total_units || 150;
  const totalRentableSF = assumptions.total_rentable_sf || (totalUnits * (assumptions.average_unit_sf || 1100));
  const costPerUnit = totalUnits > 0 ? totalCosts / totalUnits : 0;
  const costPerSF = totalRentableSF > 0 ? totalCosts / totalRentableSF : 0;

  // Stabilized NOI
  const grossPotentialRent = ops.gross_potential_rent || 0;
  const otherIncome = ops.other_income || 0;
  const gpi = ops.gross_potential_income || (grossPotentialRent + otherIncome);
  const vacancyRate = ops.vacancy_rate || 0.05;
  const egi = ops.effective_gross_income || (gpi * (1 - vacancyRate));
  const opex = ops.expenses?.total_operating_expenses || 0;
  const noi = ops.net_operating_income || (egi - opex);
  const noiPerUnit = totalUnits > 0 ? noi / totalUnits : 0;
  const expenseRatio = egi > 0 ? opex / egi : 0;

  // Development yield
  const developmentYield = totalCosts > 0 ? noi / totalCosts : 0;

  // Exit analysis
  const holdYears = exit.hold_period_years || assumptions.hold_period_years || 5;
  const exitCapRate = exit.exit_cap_rate || 0.055;
  const rentGrowth = assumptions.annual_rent_growth || proforma.growth_assumptions?.annual_rent_growth || 0.03;
  const expenseGrowth = assumptions.annual_expense_growth || proforma.growth_assumptions?.annual_expense_growth || 0.025;

  // Terminal NOI (grow rents and expenses)
  const terminalRent = grossPotentialRent * Math.pow(1 + rentGrowth, holdYears);
  const terminalOtherIncome = otherIncome * Math.pow(1 + rentGrowth, holdYears);
  const terminalGPI = terminalRent + terminalOtherIncome;
  const terminalEGI = terminalGPI * (1 - vacancyRate);
  const terminalOpex = opex * Math.pow(1 + expenseGrowth, holdYears);
  const terminalNOI = terminalEGI - terminalOpex;

  const grossSalePrice = exitCapRate > 0 ? terminalNOI / exitCapRate : 0;
  const sellingCostsPercent = exit.selling_costs_percent || 0.02;
  const sellingCosts = grossSalePrice * sellingCostsPercent;
  const netSaleProceeds = grossSalePrice - sellingCosts;

  // Financing
  const loans = sf.loans || [];
  const devFinancing = sf.development_financing || {};
  const totalDebt = loans.reduce((s, l) => s + (l.amount || l.loan_amount || 0), 0) || devFinancing.construction_loan?.loan_amount || 0;
  const equity = sf.equity || devFinancing.equity || {};
  const totalEquity = equity.total_equity_required || equity.total_equity || (totalCosts - totalDebt);
  const ltcRatio = totalCosts > 0 ? totalDebt / totalCosts : 0;

  const termMonths = (holdYears * 12) + (assumptions.construction_months || 14) + (assumptions.stabilization_months || 6);
  const totalInterest = totalDebt * (loans[0]?.interest_rate || devFinancing.construction_loan?.interest_rate || 0.065) * 0.5 * ((assumptions.construction_months || 14) / 12);
  const totalLoanFees = totalDebt * (loans[0]?.origination_fee_percent || 0.01);
  const financingCosts = totalInterest + totalLoanFees;

  // Value creation
  const stabilizedValue = noi > 0 && exitCapRate > 0 ? noi / exitCapRate : 0;
  const valueCreation = stabilizedValue - totalCosts;
  const valueCreationPercent = totalCosts > 0 ? valueCreation / totalCosts : 0;
  const developmentSpread = developmentYield - exitCapRate;

  // Profit / returns
  const totalRevenue = netSaleProceeds;
  const netRevenue = netSaleProceeds;
  // Include cumulative cash flow during hold period
  const annualCashFlow = noi - (totalDebt * 0.06); // Rough permanent debt service
  const cumulativeHoldCash = annualCashFlow * holdYears;
  const grossProfit = netSaleProceeds + cumulativeHoldCash - totalCosts;
  const netProfit = grossProfit - financingCosts;
  const grossMargin = totalRevenue > 0 ? grossProfit / totalRevenue : 0;
  const netMargin = totalRevenue > 0 ? netProfit / totalRevenue : 0;
  const projectROI = totalCosts > 0 ? netProfit / totalCosts : 0;

  // IRR
  const monthlyFlows = [-totalEquity];
  const constructionMonths = assumptions.construction_months || 14;
  const stabMonths = assumptions.stabilization_months || 6;
  for (let m = 1; m < constructionMonths + stabMonths; m++) { monthlyFlows.push(0); }
  // Operating period
  const monthlyCashAfterDebt = annualCashFlow / 12;
  for (let m = 0; m < holdYears * 12; m++) { monthlyFlows.push(monthlyCashAfterDebt); }
  // Disposition
  monthlyFlows[monthlyFlows.length - 1] += netSaleProceeds - (totalDebt * 0.85); // Approx loan payoff

  const monthlyIRR = calculateIRR(monthlyFlows, 0.01);
  const projectIRR = Math.pow(1 + monthlyIRR, 12) - 1;
  const equityIRR = projectIRR;
  const equityMultiple = calculateEquityMultiple(totalEquity + netProfit, totalEquity);
  const cashOnCash = totalEquity > 0 ? annualCashFlow / totalEquity : 0;
  const projectMultiple = totalCosts > 0 ? (netSaleProceeds + cumulativeHoldCash) / totalCosts : 0;

  return {
    totalCosts, totalRevenue, netRevenue, saleCosts: sellingCosts,
    grossProfit, grossMargin, netProfit, netMargin,
    totalDebt, totalEquity, ltcRatio,
    totalInterest, totalLoanFees, financingCosts,
    projectIRR, equityIRR, projectMultiple, projectROI,
    equityMultiple, cashOnCash, termMonths: termMonths,
    // BTR-specific
    noi, noiPerUnit, expenseRatio, developmentYield, developmentSpread,
    grossSalePrice, netSaleProceeds, exitCapRate, holdYears,
    stabilizedValue, valueCreation, valueCreationPercent,
    grossPotentialRent, egi, opex, vacancyRate,
    terminalNOI, annualCashFlow, cumulativeHoldCash,
    // Per-unit
    totalUnits, totalRentableSF,
    costPerUnit, costPerSF,
    units: totalUnits,
    profitPerUnit: totalUnits > 0 ? netProfit / totalUnits : 0,
    costPerUnit,
    revenuePerUnit: totalUnits > 0 ? totalRevenue / totalUnits : 0,
    totalSaleCosts: sellingCosts,
  };
}

// ─── BTR Development Cash Flow Generator ─────────────────────────────────────

export function generateBTRCashFlows(proforma) {
  const uf = proforma.uses_of_funds || {};
  const sf = proforma.sources_of_funds || {};
  const ops = proforma.operating_assumptions || {};
  const assumptions = proforma.assumptions || {};
  const devFinancing = sf.development_financing || {};
  const equity = sf.equity || devFinancing.equity || {};

  const constructionMonths = assumptions.construction_months || 14;
  const stabMonths = assumptions.stabilization_months || 6;
  const holdYears = assumptions.hold_period_years || 5;
  const totalMonths = constructionMonths + stabMonths + (holdYears * 12);
  const totalUnits = assumptions.total_units || 150;
  const unitsLeasedPerMonth = assumptions.units_leased_per_month || Math.ceil(totalUnits / stabMonths);

  const landCost = uf.land_acquisition?.total_land_cost || 0;
  const siteWork = uf.development_costs?.site_work?.total_site_work || 0;
  const verticalCost = uf.development_costs?.vertical_construction?.total_vertical || 0;
  const softCosts = uf.development_costs?.soft_costs?.total_soft_costs || 0;
  const hardCosts = siteWork + verticalCost;
  const totalEquity = equity.total_equity_required || equity.total_equity || 0;
  const constructionLoan = devFinancing.construction_loan?.loan_amount || sf.loans?.[0]?.amount || 0;
  const constRate = devFinancing.construction_loan?.interest_rate || sf.loans?.[0]?.interest_rate || 0.065;
  const monthlyRent = ops.gross_potential_rent ? ops.gross_potential_rent / 12 : (totalUnits * (assumptions.average_monthly_rent || 1800));
  const opexMonthly = ops.expenses?.total_operating_expenses ? ops.expenses.total_operating_expenses / 12 : 0;

  function sCurve(month, total, duration) {
    if (month > duration || month < 1) return 0;
    const t = month / duration;
    const prevT = (month - 1) / duration;
    return total * ((3 * t * t - 2 * t * t * t) - (3 * prevT * prevT - 2 * prevT * prevT * prevT));
  }

  const flows = [];
  let loanBalance = 0;
  let cumulativeCashFlow = 0;
  let unitsLeased = 0;

  for (let m = 1; m <= Math.min(totalMonths, constructionMonths + stabMonths + 24); m++) {
    const isFirst = m === 1;
    const isConstruction = m <= constructionMonths;
    const isLeaseUp = m > constructionMonths && m <= constructionMonths + stabMonths;
    const isStabilized = m > constructionMonths + stabMonths;

    // Costs
    const landPayment = isFirst ? landCost : 0;
    const hardCostPayment = isConstruction ? sCurve(m, hardCosts, constructionMonths) : 0;
    const softCostPayment = isConstruction ? (softCosts / constructionMonths) : 0;
    const interestPayment = loanBalance * (constRate / 12);

    // Lease-up and operations
    if (isLeaseUp) {
      unitsLeased = Math.min(unitsLeased + unitsLeasedPerMonth, totalUnits);
    } else if (isStabilized) {
      unitsLeased = Math.floor(totalUnits * 0.95);
    }
    const occupancy = totalUnits > 0 ? unitsLeased / totalUnits : 0;
    const rentalIncome = (monthlyRent * occupancy);
    const operatingExpenses = isStabilized ? opexMonthly : (isLeaseUp ? opexMonthly * 0.7 : 0);
    const noiMonth = rentalIncome - operatingExpenses;

    // Financing
    const equityContribution = isFirst ? totalEquity : 0;
    const periodCosts = landPayment + hardCostPayment + softCostPayment + interestPayment + operatingExpenses;
    const fundingNeed = periodCosts - (isFirst ? totalEquity : 0) - (isLeaseUp || isStabilized ? rentalIncome : 0);
    const debtDraw = isConstruction ? Math.max(0, Math.min(fundingNeed, constructionLoan - loanBalance)) : 0;
    const debtPaydown = isStabilized && noiMonth > 0 ? Math.min(noiMonth * 0.3, loanBalance) : 0;

    loanBalance = loanBalance + debtDraw - debtPaydown;
    if (loanBalance < 0) loanBalance = 0;

    const netCashFlow = equityContribution + debtDraw + rentalIncome - periodCosts - debtPaydown;
    cumulativeCashFlow += netCashFlow;

    flows.push({
      month: m,
      phase: isConstruction ? 'Construction' : isLeaseUp ? 'Lease-Up' : 'Stabilized',
      equity_contribution: equityContribution,
      debt_draw: debtDraw,
      land_payment: landPayment,
      hard_cost_payment: hardCostPayment,
      soft_cost_payment: softCostPayment,
      interest_payment: interestPayment,
      units_leased: unitsLeased,
      occupancy_percent: occupancy,
      rental_income: rentalIncome,
      operating_expenses: operatingExpenses,
      noi: noiMonth,
      debt_paydown: debtPaydown,
      net_cash_flow: netCashFlow,
      cumulative_cash_flow: cumulativeCashFlow,
      loan_balance: loanBalance,
    });
  }
  return flows;
}

// ─── BTR Annual Operating Pro Forma ──────────────────────────────────────────

export function generateBTRAnnualProforma(proforma) {
  const ops = proforma.operating_assumptions || {};
  const growth = proforma.growth_assumptions || {};
  const assumptions = proforma.assumptions || {};

  const holdYears = assumptions.hold_period_years || 5;
  const rentGrowth = growth.annual_rent_growth || 0.03;
  const expenseGrowth = growth.annual_expense_growth || 0.025;
  const baseGPR = ops.gross_potential_rent || 0;
  const baseOtherIncome = ops.other_income || 0;
  const vacancyRate = ops.vacancy_rate || 0.05;
  const baseOpex = ops.expenses?.total_operating_expenses || 0;

  const years = [];
  for (let y = 1; y <= holdYears; y++) {
    const gpr = baseGPR * Math.pow(1 + rentGrowth, y - 1);
    const other = baseOtherIncome * Math.pow(1 + rentGrowth, y - 1);
    const gpi = gpr + other;
    const vacLoss = gpi * vacancyRate;
    const egi = gpi - vacLoss;
    const opex = baseOpex * Math.pow(1 + expenseGrowth, y - 1);
    const noi = egi - opex;

    years.push({
      year: y,
      gross_potential_rent: gpr,
      other_income: other,
      gross_potential_income: gpi,
      vacancy_loss: vacLoss,
      effective_gross_income: egi,
      operating_expenses: opex,
      net_operating_income: noi,
      noi_growth: y > 1 ? (noi / (years[y - 2]?.net_operating_income || noi) - 1) : 0,
    });
  }
  return years;
}

// ─── Waterfall Calculation Engine ──────────────────────────────────────────

/**
 * Default waterfall structure for a 90/10 LP/GP split with standard tiers
 */
export function getDefaultWaterfallStructure() {
  return {
    name: 'Standard 90/10 Waterfall',
    structure_type: 'american',
    capital_structure: {
      lp_equity_percent: 90,
      gp_equity_percent: 10,
      gp_co_invest_required: true,
      gp_co_invest_percent: 10,
    },
    preferred_return: {
      enabled: true,
      rate: 0.08,
      type: 'cumulative',
      compounding_frequency: 'annual',
      accrues_during_construction: true,
      payment_frequency: 'at_exit',
      lp_pref_rate: 0.08,
      gp_pref_rate: 0.08,
      catch_up_enabled: true,
      catch_up_percent: 1.0,
      catch_up_target: 0.20,
    },
    promote_tiers: [
      {
        tier_number: 1,
        name: 'Return of Capital + Pref',
        hurdle_type: 'irr',
        irr_hurdle: 0.08,
        multiple_hurdle: 1.0,
        lp_share: 0.90,
        gp_share: 0.10,
      },
      {
        tier_number: 2,
        name: 'First Promote (12% IRR)',
        hurdle_type: 'irr',
        irr_hurdle: 0.12,
        multiple_hurdle: 1.25,
        lp_share: 0.80,
        gp_share: 0.20,
      },
      {
        tier_number: 3,
        name: 'Second Promote (18% IRR)',
        hurdle_type: 'irr',
        irr_hurdle: 0.18,
        multiple_hurdle: 1.75,
        lp_share: 0.70,
        gp_share: 0.30,
      },
      {
        tier_number: 4,
        name: 'Final Promote (25%+ IRR)',
        hurdle_type: 'irr',
        irr_hurdle: 0.25,
        multiple_hurdle: 2.0,
        lp_share: 0.60,
        gp_share: 0.40,
      },
    ],
    clawback_provisions: {
      gp_clawback_enabled: true,
      lp_clawback_enabled: false,
      true_up_frequency: 'at_exit',
      escrow_percent: 0.10,
    },
    management_fees: {
      acquisition_fee_percent: 0.01,
      asset_management_fee_percent: 0.02,
      disposition_fee_percent: 0.01,
      construction_management_fee_percent: 0.05,
      fees_paid_from: 'operating_cash_flow',
    },
  };
}

/**
 * Calculate LP preferred return based on structure and hold period
 */
function calculatePreferredReturn(lpEquity, holdPeriodYears, prefConfig) {
  if (!prefConfig.enabled) return 0;

  const rate = prefConfig.lp_pref_rate || prefConfig.rate || 0.08;

  if (prefConfig.type === 'compounding') {
    const periods = prefConfig.compounding_frequency === 'monthly' ? 12 :
      prefConfig.compounding_frequency === 'quarterly' ? 4 : 1;
    return lpEquity * (Math.pow(1 + rate / periods, periods * holdPeriodYears) - 1);
  }

  // Simple cumulative
  return lpEquity * rate * holdPeriodYears;
}

/**
 * Calculate IRR for a cash flow stream to determine tier eligibility
 */
function calculateStreamIRR(investment, distributions, holdPeriodYears) {
  if (!investment || investment <= 0) return 0;

  // Simple annualized return for tier checking
  const totalReturn = distributions / investment;
  if (totalReturn <= 1) return -1 + totalReturn;

  // Approximate annual IRR: (1 + totalReturn)^(1/years) - 1
  return Math.pow(totalReturn, 1 / holdPeriodYears) - 1;
}

/**
 * Calculate waterfall distribution for a pro forma
 * Returns tier-by-tier results and final LP/GP splits
 */
export function calculateWaterfall(proforma, waterfallStructure, scenario = 'base') {
  const structure = waterfallStructure || getDefaultWaterfallStructure();
  const metrics = calculateProFormaMetrics(proforma);
  const assumptions = proforma.assumptions || {};

  const totalEquity = metrics.totalEquity || 0;
  const lpPercent = (structure.capital_structure.lp_equity_percent || 90) / 100;
  const gpPercent = (structure.capital_structure.gp_equity_percent || 10) / 100;

  const lpEquity = totalEquity * lpPercent;
  const gpEquity = totalEquity * gpPercent;

  const holdPeriodYears = (metrics.termMonths || 18) / 12;
  const totalProfit = metrics.netProfit || 0;
  const totalDistributable = totalEquity + totalProfit;

  const results = {
    inputs: {
      total_equity_invested: totalEquity,
      lp_equity_invested: lpEquity,
      gp_equity_invested: gpEquity,
      hold_period_years: holdPeriodYears,
      total_distributable: totalDistributable,
      net_profit: totalProfit,
    },
    tier_results: [],
    final_results: {
      lp: { total_invested: lpEquity, total_distributed: 0, profit: 0, irr: 0, equity_multiple: 0 },
      gp: { total_invested: gpEquity, total_distributed: 0, profit: 0, irr: 0, equity_multiple: 0, promote_earned: 0 },
      project: {
        total_cost: metrics.totalCosts,
        total_equity: totalEquity,
        total_debt: metrics.totalDebt,
        gross_revenue: metrics.totalRevenue,
        net_revenue: metrics.netRevenue,
        gross_profit: metrics.grossProfit,
        net_profit: metrics.netProfit,
        project_irr: metrics.projectIRR,
        equity_multiple: metrics.equityMultiple,
      },
    },
  };

  if (totalDistributable <= 0) return results;

  let remainingDistribution = totalDistributable;
  let lpCumulative = 0;
  let gpCumulative = 0;

  // Tier 0: Return of Capital
  const lpReturnOfCapital = Math.min(lpEquity, remainingDistribution * lpPercent);
  const gpReturnOfCapital = Math.min(gpEquity, remainingDistribution * gpPercent);
  const rocTotal = lpReturnOfCapital + gpReturnOfCapital;

  results.tier_results.push({
    tier_number: 0,
    tier_name: 'Return of Capital',
    lp_distribution: lpReturnOfCapital,
    gp_distribution: gpReturnOfCapital,
    total_distribution: rocTotal,
    cumulative_lp: lpReturnOfCapital,
    cumulative_gp: gpReturnOfCapital,
    lp_multiple_at_tier: lpEquity > 0 ? lpReturnOfCapital / lpEquity : 0,
  });

  remainingDistribution -= rocTotal;
  lpCumulative = lpReturnOfCapital;
  gpCumulative = gpReturnOfCapital;

  // Tier 1: Preferred Return
  if (structure.preferred_return.enabled && remainingDistribution > 0) {
    const lpPref = calculatePreferredReturn(lpEquity, holdPeriodYears, structure.preferred_return);
    const gpPref = calculatePreferredReturn(gpEquity, holdPeriodYears, structure.preferred_return);

    const lpPrefDist = Math.min(lpPref, remainingDistribution * 0.9); // LP gets pref first
    const gpPrefDist = Math.min(gpPref, remainingDistribution - lpPrefDist);
    const prefTotal = lpPrefDist + gpPrefDist;

    lpCumulative += lpPrefDist;
    gpCumulative += gpPrefDist;

    results.tier_results.push({
      tier_number: 1,
      tier_name: 'Preferred Return',
      lp_distribution: lpPrefDist,
      gp_distribution: gpPrefDist,
      total_distribution: prefTotal,
      cumulative_lp: lpCumulative,
      cumulative_gp: gpCumulative,
      lp_irr_at_tier: structure.preferred_return.lp_pref_rate || 0.08,
      lp_multiple_at_tier: lpEquity > 0 ? lpCumulative / lpEquity : 0,
    });

    remainingDistribution -= prefTotal;

    // GP Catch-up (if enabled)
    if (structure.preferred_return.catch_up_enabled && remainingDistribution > 0) {
      const catchUpTarget = structure.preferred_return.catch_up_target || 0.20;
      const totalDistributedSoFar = lpCumulative + gpCumulative;
      const gpTargetShare = totalDistributedSoFar * catchUpTarget;
      const gpNeedsForCatchUp = Math.max(0, gpTargetShare - gpCumulative);
      const catchUpDist = Math.min(gpNeedsForCatchUp, remainingDistribution);

      if (catchUpDist > 0) {
        gpCumulative += catchUpDist;
        results.tier_results.push({
          tier_number: 1.5,
          tier_name: 'GP Catch-Up',
          lp_distribution: 0,
          gp_distribution: catchUpDist,
          total_distribution: catchUpDist,
          cumulative_lp: lpCumulative,
          cumulative_gp: gpCumulative,
          lp_multiple_at_tier: lpEquity > 0 ? lpCumulative / lpEquity : 0,
        });
        remainingDistribution -= catchUpDist;
      }
    }
  }

  // Promote Tiers (2+)
  const tiers = structure.promote_tiers || [];
  const sortedTiers = [...tiers].sort((a, b) => (a.tier_number || 0) - (b.tier_number || 0));

  for (let i = 0; i < sortedTiers.length && remainingDistribution > 0; i++) {
    const tier = sortedTiers[i];
    const nextTier = sortedTiers[i + 1];

    // Calculate how much can be distributed at this tier
    let tierDistribution = remainingDistribution;

    // If there's a next tier, limit distribution to amount that reaches next hurdle
    if (nextTier && nextTier.irr_hurdle) {
      // Simplified: distribute proportionally to next hurdle
      const currentMultiple = lpEquity > 0 ? lpCumulative / lpEquity : 0;
      const nextMultiple = nextTier.multiple_hurdle || (1 + nextTier.irr_hurdle * holdPeriodYears);
      const lpNeededForNext = lpEquity * nextMultiple - lpCumulative;

      if (lpNeededForNext > 0) {
        const lpShareThisTier = tier.lp_share || 0.80;
        tierDistribution = Math.min(remainingDistribution, lpNeededForNext / lpShareThisTier);
      }
    }

    const lpShare = tier.lp_share || 0.80;
    const gpShare = tier.gp_share || 0.20;

    const lpDist = tierDistribution * lpShare;
    const gpDist = tierDistribution * gpShare;

    lpCumulative += lpDist;
    gpCumulative += gpDist;

    results.tier_results.push({
      tier_number: tier.tier_number || (i + 2),
      tier_name: tier.name || `Tier ${tier.tier_number || (i + 2)}`,
      hurdle_irr: tier.irr_hurdle,
      hurdle_multiple: tier.multiple_hurdle,
      lp_share: lpShare,
      gp_share: gpShare,
      lp_distribution: lpDist,
      gp_distribution: gpDist,
      total_distribution: tierDistribution,
      cumulative_lp: lpCumulative,
      cumulative_gp: gpCumulative,
      lp_multiple_at_tier: lpEquity > 0 ? lpCumulative / lpEquity : 0,
    });

    remainingDistribution -= tierDistribution;
  }

  // Final results
  const lpProfit = lpCumulative - lpEquity;
  const gpProfit = gpCumulative - gpEquity;
  const gpPromote = gpProfit - (gpEquity > 0 ? (totalProfit * gpPercent) : 0);

  results.final_results.lp = {
    total_invested: lpEquity,
    total_distributed: lpCumulative,
    profit: lpProfit,
    irr: calculateStreamIRR(lpEquity, lpCumulative, holdPeriodYears),
    equity_multiple: lpEquity > 0 ? lpCumulative / lpEquity : 0,
    cash_on_cash_avg: lpEquity > 0 ? lpProfit / lpEquity / holdPeriodYears : 0,
    peak_equity: lpEquity,
  };

  results.final_results.gp = {
    total_invested: gpEquity,
    total_distributed: gpCumulative,
    profit: gpProfit,
    irr: calculateStreamIRR(gpEquity, gpCumulative, holdPeriodYears),
    equity_multiple: gpEquity > 0 ? gpCumulative / gpEquity : 0,
    promote_earned: Math.max(0, gpPromote),
    co_invest_return: gpEquity > 0 ? (gpCumulative - gpPromote) : 0,
  };

  return results;
}

/**
 * Run waterfall analysis across multiple scenarios
 */
export function runWaterfallScenarios(proforma, waterfallStructure) {
  const structure = waterfallStructure || getDefaultWaterfallStructure();

  // Base case
  const baseResult = calculateWaterfall(proforma, structure, 'base');

  // Create upside scenario (+20% revenue)
  const upsideProforma = adjustProforma(proforma, { revenue_adjustment: 0.20 });
  const upsideResult = calculateWaterfall(upsideProforma, structure, 'upside');

  // Create downside scenario (-20% revenue)
  const downsideProforma = adjustProforma(proforma, { revenue_adjustment: -0.20 });
  const downsideResult = calculateWaterfall(downsideProforma, structure, 'downside');

  return {
    base: baseResult,
    upside: upsideResult,
    downside: downsideResult,
    summary: {
      lp_irr_range: {
        low: downsideResult.final_results.lp.irr,
        base: baseResult.final_results.lp.irr,
        high: upsideResult.final_results.lp.irr,
      },
      gp_promote_range: {
        low: downsideResult.final_results.gp.promote_earned,
        base: baseResult.final_results.gp.promote_earned,
        high: upsideResult.final_results.gp.promote_earned,
      },
      lp_multiple_range: {
        low: downsideResult.final_results.lp.equity_multiple,
        base: baseResult.final_results.lp.equity_multiple,
        high: upsideResult.final_results.lp.equity_multiple,
      },
    },
  };
}

/**
 * Calculate management fees based on structure
 */
export function calculateManagementFees(proforma, waterfallStructure) {
  const structure = waterfallStructure || getDefaultWaterfallStructure();
  const fees = structure.management_fees || {};
  const metrics = calculateProFormaMetrics(proforma);
  const uf = proforma.uses_of_funds || proforma.costs || {};

  const totalCosts = metrics.totalCosts || 0;
  const hardCosts = uf.hard_costs?.total_hard_costs || uf.hard_costs || 0;
  const totalEquity = metrics.totalEquity || 0;
  const holdPeriodYears = (metrics.termMonths || 18) / 12;
  const netRevenue = metrics.netRevenue || 0;

  const acquisitionFee = totalCosts * (fees.acquisition_fee_percent || 0);
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

// ─── CRUD Operations ──────────────────────────────────────────────────────────

export async function getProformas(projectId) {
  try {
    const { data, error } = await supabase.from('proformas').select('*').eq('project_id', projectId).order('version');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('getProformas error:', err?.message || err);
    return [];
  }
}

export async function getActiveProforma(projectId) {
  try {
    const { data, error } = await supabase
      .from('proformas')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .single();
    if (error) throw error;
    return data || null;
  } catch (err) {
    console.error('getActiveProforma error:', err?.message || err);
    return null;
  }
}

export async function getProforma(proformaId) {
  try {
    const { data, error } = await supabase.from('proformas').select('*').eq('id', proformaId).single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('getProforma error:', err?.message || err);
    return null;
  }
}

export async function createProforma(projectId, data) {
  try {
    const { data: created, error } = await supabase
      .from('proformas')
      .insert({
        project_id: projectId,
        status: 'draft',
        ...data,
        results: {},
        cash_flows: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return created;
  } catch (err) {
    console.error('createProforma error:', err?.message || err);
    return null;
  }
}

export async function updateProforma(proformaId, updates) {
  try {
    const { data, error } = await supabase
      .from('proformas')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', proformaId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('updateProforma error:', err?.message || err);
    return null;
  }
}

export async function setActiveProforma(projectId, proformaId) {
  try {
    // Deactivate all proformas for this project
    const { error: deactivateError } = await supabase
      .from('proformas')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('project_id', projectId);
    if (deactivateError) throw deactivateError;

    // Activate the selected proforma
    const { data, error } = await supabase
      .from('proformas')
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq('id', proformaId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('setActiveProforma error:', err?.message || err);
    return null;
  }
}

export async function deleteProforma(proformaId) {
  try {
    const { error } = await supabase
      .from('proformas')
      .delete()
      .eq('id', proformaId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('deleteProforma error:', err?.message || err);
    return false;
  }
}
