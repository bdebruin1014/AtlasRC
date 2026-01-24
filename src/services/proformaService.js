// src/services/proformaService.js
// Professional-grade Pro Forma financial modeling service
// Supports Scattered Lot, Multifamily, Subdivision templates

import { isDemoMode } from '@/lib/supabase';

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

// ─── Demo Data (Scattered Lot Template) ─────────────────────────────────────

const DEMO_PROFORMAS = [
  {
    id: 'pf-1',
    project_id: 'demo-project-1',
    budget_id: 'budget-1',
    template_id: 'tmpl-scattered-lot',
    name: 'Base Case - Scattered Lot',
    version: 1,
    is_active: true,
    status: 'approved',
    assumptions: {
      project_name: 'Highland Park Homes',
      address: '4521 Highland Park Dr, Austin, TX 78731',
      lot_count: 10,
      square_footage: 2100,
      bedrooms: 4,
      bathrooms: 3,
      garage_spaces: 2,
      construction_start_date: '2025-03-01',
      construction_duration_months: 8,
      marketing_start_date: '2025-09-01',
      total_project_months: 14,
      broker_commission_percent: 0.05,
      seller_closing_costs_percent: 0.02,
    },
    uses_of_funds: {
      land_acquisition: {
        purchase_price: 120000,
        closing_costs: 2400,
        closing_cost_percent: 0.02,
        due_diligence_costs: 3500,
        total_land_cost: 125900,
      },
      hard_costs: {
        site_preparation: 8500,
        excavation_grading: 6200,
        utilities_connections: 12500,
        driveway_sidewalks: 7800,
        landscaping: 9500,
        site_work_subtotal: 44500,
        foundation: 28000,
        framing_labor: 22000,
        framing_materials: 35000,
        roofing: 14500,
        windows_doors: 18000,
        siding_exterior: 16500,
        plumbing_rough: 12000,
        electrical_rough: 10500,
        hvac_rough: 14000,
        insulation: 5500,
        drywall: 12000,
        interior_trim: 9500,
        cabinets: 15000,
        countertops: 8500,
        flooring: 14000,
        plumbing_finish: 6500,
        electrical_finish: 5000,
        hvac_finish: 4500,
        painting: 8000,
        appliances: 6500,
        fixtures_hardware: 4500,
        garage_door: 2800,
        cleanup_final: 3500,
        vertical_subtotal: 296300,
        permits_fees: 8500,
        utility_impact_fees: 12000,
        other_hard_costs: 5000,
        hard_cost_contingency_percent: 0.07,
        hard_cost_contingency: 25620,
        total_hard_costs: 391920,
        cost_per_sf: 186.63,
      },
      soft_costs: {
        architecture_design: 12000,
        engineering: 5500,
        surveys: 3500,
        permits_entitlements: 2500,
        legal_fees: 4000,
        accounting: 2000,
        insurance_builders_risk: 4500,
        property_taxes_construction: 3200,
        marketing_advertising: 5000,
        staging: 4500,
        real_estate_photos: 1500,
        miscellaneous: 2000,
        soft_cost_contingency_percent: 0.05,
        soft_cost_contingency: 2535,
        total_soft_costs: 53235,
      },
      financing_costs: {
        origination_fee: 4063,
        interest_reserve: 28000,
        other_loan_fees: 1500,
        total_financing_costs: 33563,
      },
      total_project_cost: 604618,
      cost_per_sf: 287.91,
    },
    sources_of_funds: {
      loans: [
        {
          id: 'loan-1',
          name: 'Construction Loan',
          type: 'construction',
          position: 'first',
          amount: 453464,
          loan_amount: 453464,
          ltc_percent: 0.75,
          interest_rate: 0.085,
          term_months: 18,
          io_months: 18,
          origination_fee_percent: 0.01,
          origination_fee: 0.01,
          interest_reserve_months: 6,
        },
      ],
      equity: {
        total_equity_required: 151154,
        investor_equity: 120923,
        investor_equity_percent: 0.80,
        sponsor_equity: 30231,
        sponsor_equity_percent: 0.20,
        preferred_return: 0.10,
        promote_structure: [
          { hurdle: 0.12, split: 0.20, label: 'Above 12% IRR' },
          { hurdle: 0.20, split: 0.30, label: 'Above 20% IRR' },
        ],
      },
      total_sources: 604618,
    },
    revenue_projections: {
      estimated_sale_price: 825000,
      gross_sale_price: 825000,
      price_per_sf: 392.86,
      comparable_basis: 'Based on 5 recent sales in Highland Park (380-420 $/sf)',
      broker_commission_percent: 0.05,
      broker_commission: 41250,
      seller_closing_costs_percent: 0.02,
      seller_closing_costs: 16500,
      concessions: 5000,
      home_warranty: 600,
      total_sale_costs: 63350,
      net_sale_proceeds: 761650,
      total_revenue: 825000,
      net_revenue: 761650,
    },
    // Legacy compatibility
    costs: { total_project_cost: 604618, land_cost: 125900, hard_costs: 391920, soft_costs: 53235, financing_costs: 33563 },
    financing: {
      loans: [{ id: 'loan-1', name: 'Construction Loan', amount: 453464, interest_rate: 0.085, term_months: 18, io_months: 18, origination_fee: 0.01 }],
      equity: { total_equity_required: 151154, investor_equity: 120923, sponsor_equity: 30231, preferred_return: 0.10, promote_structure: [{ hurdle: 0.12, split: 0.20 }, { hurdle: 0.20, split: 0.30 }] },
    },
    revenue: { type: 'sale', total_revenue: 825000, net_revenue: 761650 },
    results: {},
    cash_flows: [],
    approved_at: '2025-03-01T10:00:00Z',
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-10-15T14:30:00Z',
  },
  {
    id: 'pf-2',
    project_id: 'demo-project-1',
    budget_id: 'budget-1',
    template_id: 'tmpl-scattered-lot',
    name: 'Optimistic Case',
    version: 2,
    is_active: false,
    status: 'draft',
    assumptions: {
      project_name: 'Highland Park Homes',
      lot_count: 10,
      square_footage: 2100,
      construction_duration_months: 7,
      total_project_months: 12,
      broker_commission_percent: 0.05,
      seller_closing_costs_percent: 0.02,
    },
    uses_of_funds: {
      land_acquisition: { total_land_cost: 125900 },
      hard_costs: { total_hard_costs: 370000, cost_per_sf: 176.19 },
      soft_costs: { total_soft_costs: 48000 },
      financing_costs: { total_financing_costs: 28000 },
      total_project_cost: 571900,
      cost_per_sf: 272.33,
    },
    sources_of_funds: {
      loans: [{ id: 'loan-1', name: 'Construction Loan', amount: 428925, loan_amount: 428925, ltc_percent: 0.75, interest_rate: 0.08, term_months: 16, io_months: 16, origination_fee_percent: 0.01, origination_fee: 0.01 }],
      equity: { total_equity_required: 142975, investor_equity: 114380, sponsor_equity: 28595, preferred_return: 0.10, promote_structure: [{ hurdle: 0.12, split: 0.20 }] },
      total_sources: 571900,
    },
    revenue_projections: {
      estimated_sale_price: 875000,
      gross_sale_price: 875000,
      price_per_sf: 416.67,
      broker_commission: 43750,
      seller_closing_costs: 17500,
      concessions: 0,
      home_warranty: 600,
      total_sale_costs: 61850,
      net_sale_proceeds: 813150,
      total_revenue: 875000,
      net_revenue: 813150,
    },
    costs: { total_project_cost: 571900 },
    financing: { loans: [{ id: 'loan-1', amount: 428925, interest_rate: 0.08, term_months: 16, io_months: 16 }], equity: { total_equity_required: 142975, investor_equity: 114380, sponsor_equity: 28595, preferred_return: 0.10, promote_structure: [{ hurdle: 0.12, split: 0.20 }] } },
    revenue: { type: 'sale', total_revenue: 875000, net_revenue: 813150 },
    results: {},
    cash_flows: [],
    created_at: '2025-03-15T10:00:00Z',
    updated_at: '2025-10-01T09:00:00Z',
  },
  {
    id: 'pf-3',
    project_id: 'demo-project-1',
    budget_id: 'budget-1',
    template_id: 'tmpl-scattered-lot',
    name: 'Conservative Case',
    version: 3,
    is_active: false,
    status: 'draft',
    assumptions: {
      project_name: 'Highland Park Homes',
      lot_count: 10,
      square_footage: 2100,
      construction_duration_months: 10,
      total_project_months: 18,
      broker_commission_percent: 0.06,
      seller_closing_costs_percent: 0.025,
    },
    uses_of_funds: {
      land_acquisition: { total_land_cost: 125900 },
      hard_costs: { total_hard_costs: 420000, cost_per_sf: 200.00 },
      soft_costs: { total_soft_costs: 60000 },
      financing_costs: { total_financing_costs: 42000 },
      total_project_cost: 647900,
      cost_per_sf: 308.52,
    },
    sources_of_funds: {
      loans: [{ id: 'loan-1', name: 'Construction Loan', amount: 453530, loan_amount: 453530, ltc_percent: 0.70, interest_rate: 0.09, term_months: 22, io_months: 22, origination_fee_percent: 0.015, origination_fee: 0.015 }],
      equity: { total_equity_required: 194370, investor_equity: 155496, sponsor_equity: 38874, preferred_return: 0.10, promote_structure: [{ hurdle: 0.12, split: 0.20 }] },
      total_sources: 647900,
    },
    revenue_projections: {
      estimated_sale_price: 775000,
      gross_sale_price: 775000,
      price_per_sf: 369.05,
      broker_commission: 46500,
      seller_closing_costs: 19375,
      concessions: 10000,
      home_warranty: 600,
      total_sale_costs: 76475,
      net_sale_proceeds: 698525,
      total_revenue: 775000,
      net_revenue: 698525,
    },
    costs: { total_project_cost: 647900 },
    financing: { loans: [{ id: 'loan-1', amount: 453530, interest_rate: 0.09, term_months: 22, io_months: 22 }], equity: { total_equity_required: 194370, investor_equity: 155496, sponsor_equity: 38874, preferred_return: 0.10, promote_structure: [{ hurdle: 0.12, split: 0.20 }] } },
    revenue: { type: 'sale', total_revenue: 775000, net_revenue: 698525 },
    results: {},
    cash_flows: [],
    created_at: '2025-04-01T10:00:00Z',
    updated_at: '2025-09-15T11:00:00Z',
  },
  // ─── Lot Development Template Demos ─────────────────────────────────────────
  {
    id: 'pf-lot-1',
    project_id: 'demo-project-2',
    budget_id: 'budget-2',
    template_id: 'tmpl-lot-development',
    name: 'Base Case - Creekside Estates',
    version: 1,
    is_active: true,
    status: 'approved',
    assumptions: {
      template_type: 'lot_development',
      project_name: 'Creekside Estates',
      address: '2800 FM 1826, Dripping Springs, TX 78620',
      total_acreage: 42,
      gross_developable_acres: 35,
      net_developable_acres: 26.5,
      total_lots: 75,
      average_lot_size_sf: 15400,
      average_lot_size_acres: 0.354,
      density_units_per_acre: 2.83,
      lot_mix: [
        { lot_type: "50' Wide", lot_count: 30, average_sf: 12500, target_price: 89000 },
        { lot_type: "60' Wide", lot_count: 25, average_sf: 15600, target_price: 115000 },
        { lot_type: "70' Wide", lot_count: 20, average_sf: 19600, target_price: 145000 },
      ],
      // Timeline
      acquisition_date: '2025-02-01',
      entitlement_start: '2025-02-15',
      entitlement_duration_months: 6,
      construction_start_month: 7,
      construction_duration_months: 12,
      absorption_start_month: 11,
      lots_sold_per_month: 4,
      absorption_months: 19,
      total_project_months: 30,
      phase_1_lots: 25,
      phase_1_completion: '2026-01-01',
      phase_2_lots: 25,
      phase_2_completion: '2026-06-01',
      phase_3_lots: 25,
      phase_3_completion: '2026-10-01',
      broker_commission_percent: 0.02,
    },
    uses_of_funds: {
      land_acquisition: {
        purchase_price: 1_680_000,
        price_per_acre: 40_000,
        price_per_lot: 22_400,
        closing_costs: 33_600,
        due_diligence: {
          survey_alta: 18_000,
          phase_1_environmental: 4_500,
          phase_2_environmental: 0,
          geotechnical: 12_000,
          traffic_study: 15_000,
          market_study: 8_000,
          legal_review: 6_500,
          other_due_diligence: 3_000,
          total_due_diligence: 67_000,
        },
        total_land_cost: 1_780_600,
      },
      entitlement_costs: {
        zoning_application_fees: 8_500,
        preliminary_plat_fees: 12_000,
        final_plat_fees: 8_000,
        environmental_permits: 15_000,
        wetland_mitigation: 0,
        traffic_mitigation: 35_000,
        planning_consultant: 28_000,
        civil_engineering_design: 145_000,
        landscape_architecture: 22_000,
        legal_entitlement: 18_000,
        public_hearings_notices: 4_500,
        development_agreement_fees: 6_000,
        impact_fee_credits: 0,
        other_entitlement: 5_000,
        entitlement_contingency_percent: 0.10,
        entitlement_contingency: 30_700,
        total_entitlement_costs: 337_700,
        entitlement_cost_per_lot: 4_503,
      },
      hard_costs: {
        // Site Preparation
        clearing_grubbing: 85_000,
        mass_grading: 320_000,
        erosion_control: 45_000,
        site_prep_subtotal: 450_000,
        // Roads & Paving
        road_construction: 1_125_000,
        curb_gutter: 225_000,
        sidewalks: 112_500,
        entrance_features: 45_000,
        signage: 12_000,
        striping_markers: 8_000,
        roads_subtotal: 1_527_500,
        // Utilities
        water_main: 285_000,
        water_services: 150_000,
        sanitary_sewer_main: 340_000,
        sewer_services: 112_500,
        storm_drainage: 425_000,
        detention_ponds: 185_000,
        electric_primary: 95_000,
        electric_secondary: 187_500,
        gas_main: 75_000,
        telecom_conduit: 45_000,
        utilities_subtotal: 1_900_000,
        // Amenities
        clubhouse: 0,
        pool: 0,
        trails_parks: 85_000,
        playground: 45_000,
        common_area_landscaping: 125_000,
        entry_monument: 65_000,
        irrigation: 55_000,
        amenities_subtotal: 375_000,
        // Other
        street_lights: 67_500,
        mailbox_kiosk: 12_000,
        retaining_walls: 95_000,
        other_hard_costs: 25_000,
        // Totals
        hard_cost_contingency_percent: 0.08,
        hard_cost_contingency: 356_400,
        total_hard_costs: 4_808_400,
        hard_cost_per_lot: 64_112,
      },
      soft_costs: {
        civil_engineering_construction: 85_000,
        construction_management: 120_000,
        legal_closing: 35_000,
        accounting: 18_000,
        insurance: 42_000,
        property_taxes: 65_000,
        hoa_setup: 25_000,
        marketing: 55_000,
        model_lot_improvements: 35_000,
        miscellaneous: 15_000,
        soft_cost_contingency_percent: 0.05,
        soft_cost_contingency: 25_750,
        total_soft_costs: 520_750,
        soft_cost_per_lot: 6_943,
      },
      impact_fees: {
        school_impact_fee_per_lot: 1_850,
        park_impact_fee_per_lot: 750,
        road_impact_fee_per_lot: 2_200,
        fire_impact_fee_per_lot: 450,
        water_tap_fee_per_lot: 3_500,
        sewer_tap_fee_per_lot: 2_800,
        other_impact_fees_per_lot: 0,
        total_impact_fees_per_lot: 11_550,
        total_impact_fees: 866_250,
        impact_fees_paid_by: 'split',
        developer_impact_fee_responsibility: 433_125,
      },
      financing_costs: {
        acquisition_origination: 25_200,
        development_origination: 48_530,
        interest_reserve: 285_000,
        other_loan_fees: 12_000,
        total_financing_costs: 370_730,
      },
      total_development_cost: 8_251_305,
    },
    sources_of_funds: {
      loans: [
        {
          id: 'loan-acq-1',
          name: 'Acquisition Loan',
          type: 'acquisition',
          amount: 1_260_000,
          loan_amount: 1_260_000,
          ltv_percent: 0.75,
          interest_rate: 0.072,
          term_months: 36,
          origination_fee_percent: 0.015,
        },
        {
          id: 'loan-dev-1',
          name: 'Development Loan',
          type: 'development',
          amount: 4_046_000,
          loan_amount: 4_046_000,
          ltc_percent: 0.65,
          interest_rate: 0.078,
          term_months: 30,
          origination_fee_percent: 0.012,
          lot_release_price: 71_333,
          lot_release_percent: 1.10,
        },
      ],
      equity: {
        total_equity_required: 2_945_305,
        investor_equity: 2_356_244,
        investor_equity_percent: 0.80,
        sponsor_equity: 589_061,
        sponsor_equity_percent: 0.20,
        preferred_return: 0.12,
        promote_structure: [
          { hurdle: 0.15, split: 0.25, label: 'Above 15% IRR' },
          { hurdle: 0.25, split: 0.35, label: 'Above 25% IRR' },
        ],
      },
      total_sources: 8_251_305,
    },
    revenue_projections: {
      pricing_by_type: [
        { lot_type: "50' Wide", lot_count: 30, base_price: 85_000, premium_lots: 5, premium_amount: 8_000, average_price: 86_333, total_revenue: 2_590_000 },
        { lot_type: "60' Wide", lot_count: 25, base_price: 110_000, premium_lots: 4, premium_amount: 12_000, average_price: 111_920, total_revenue: 2_798_000 },
        { lot_type: "70' Wide", lot_count: 20, base_price: 140_000, premium_lots: 3, premium_amount: 18_000, average_price: 142_700, total_revenue: 2_854_000 },
      ],
      total_lot_revenue: 8_242_000,
      average_lot_price: 109_893,
      price_per_front_foot: 1_832,
      broker_commission_percent: 0.02,
      broker_commission: 164_840,
      closing_costs_per_lot: 2_000,
      total_closing_costs: 150_000,
      marketing_per_lot: 800,
      total_marketing: 60_000,
      total_sale_costs: 374_840,
      net_lot_revenue: 7_867_160,
    },
    takedown_schedule: {
      structure: 'phased_mandatory',
      phases: [
        { phase_number: 1, lot_count: 25, target_close_date: '2026-01-01', price_escalation_percent: 0 },
        { phase_number: 2, lot_count: 25, target_close_date: '2026-06-01', price_escalation_percent: 0.03 },
        { phase_number: 3, lot_count: 25, target_close_date: '2026-10-01', price_escalation_percent: 0.05 },
      ],
      minimum_takedown_per_period: 4,
      maximum_inventory_limit: 10,
    },
    costs: { total_project_cost: 8_251_305 },
    financing: {
      loans: [
        { id: 'loan-acq-1', name: 'Acquisition Loan', amount: 1_260_000, interest_rate: 0.072, term_months: 36 },
        { id: 'loan-dev-1', name: 'Development Loan', amount: 4_046_000, interest_rate: 0.078, term_months: 30 },
      ],
      equity: { total_equity_required: 2_945_305, investor_equity: 2_356_244, sponsor_equity: 589_061, preferred_return: 0.12, promote_structure: [{ hurdle: 0.15, split: 0.25 }, { hurdle: 0.25, split: 0.35 }] },
    },
    revenue: { type: 'lot_sales', total_revenue: 8_242_000, net_revenue: 7_867_160 },
    results: {},
    cash_flows: [],
    approved_at: '2025-03-01T10:00:00Z',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-11-20T14:30:00Z',
  },
  {
    id: 'pf-lot-2',
    project_id: 'demo-project-2',
    budget_id: 'budget-2',
    template_id: 'tmpl-lot-development',
    name: 'Aggressive Absorption',
    version: 2,
    is_active: false,
    status: 'draft',
    assumptions: {
      template_type: 'lot_development',
      project_name: 'Creekside Estates',
      total_acreage: 42,
      gross_developable_acres: 35,
      net_developable_acres: 26.5,
      total_lots: 75,
      average_lot_size_sf: 15400,
      density_units_per_acre: 2.83,
      entitlement_duration_months: 5,
      construction_start_month: 6,
      construction_duration_months: 10,
      absorption_start_month: 9,
      lots_sold_per_month: 6,
      absorption_months: 13,
      total_project_months: 24,
      broker_commission_percent: 0.02,
    },
    uses_of_funds: {
      land_acquisition: { total_land_cost: 1_780_600, price_per_lot: 23_741 },
      entitlement_costs: { total_entitlement_costs: 310_000, entitlement_cost_per_lot: 4_133 },
      hard_costs: { total_hard_costs: 4_550_000, hard_cost_per_lot: 60_667 },
      soft_costs: { total_soft_costs: 480_000, soft_cost_per_lot: 6_400 },
      impact_fees: { developer_impact_fee_responsibility: 433_125, total_impact_fees_per_lot: 11_550 },
      financing_costs: { total_financing_costs: 320_000 },
      total_development_cost: 7_873_725,
    },
    sources_of_funds: {
      loans: [
        { id: 'loan-acq-1', name: 'Acquisition Loan', amount: 1_260_000, loan_amount: 1_260_000, interest_rate: 0.072, term_months: 30, origination_fee_percent: 0.015 },
        { id: 'loan-dev-1', name: 'Development Loan', amount: 3_850_000, loan_amount: 3_850_000, ltc_percent: 0.63, interest_rate: 0.078, term_months: 26, origination_fee_percent: 0.012, lot_release_percent: 1.10 },
      ],
      equity: { total_equity_required: 2_763_725, investor_equity: 2_210_980, sponsor_equity: 552_745, preferred_return: 0.12, promote_structure: [{ hurdle: 0.15, split: 0.25 }] },
      total_sources: 7_873_725,
    },
    revenue_projections: {
      total_lot_revenue: 8_550_000,
      average_lot_price: 114_000,
      broker_commission_percent: 0.02,
      broker_commission: 171_000,
      total_closing_costs: 150_000,
      total_sale_costs: 381_000,
      net_lot_revenue: 8_169_000,
    },
    costs: { total_project_cost: 7_873_725 },
    revenue: { type: 'lot_sales', total_revenue: 8_550_000, net_revenue: 8_169_000 },
    results: {},
    cash_flows: [],
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-10-01T09:00:00Z',
  },
  // ─── Community For-Sale Template Demos ──────────────────────────────────────
  {
    id: 'pf-comm-1',
    project_id: 'demo-project-3',
    budget_id: 'budget-3',
    template_id: 'tmpl-community-for-sale',
    name: 'Base Case - Magnolia Ridge',
    version: 1,
    is_active: true,
    status: 'approved',
    assumptions: {
      template_type: 'community_for_sale',
      project_name: 'Magnolia Ridge',
      community_name: 'Magnolia Ridge at Buda',
      address: '5100 Old Black Colony Rd, Buda, TX 78610',
      total_acreage: 85,
      total_homes: 120,
      product_mix: [
        { plan_name: 'The Willow', home_count: 40, square_footage: 1850, bedrooms: 3, bathrooms: 2, base_price: 385_000, lot_premium_average: 8_000, options_upgrade_average: 22_000, total_average_price: 415_000, cost_to_build: 295_000, gross_margin: 0.289 },
        { plan_name: 'The Oakmont', home_count: 45, square_footage: 2200, bedrooms: 4, bathrooms: 3, base_price: 445_000, lot_premium_average: 12_000, options_upgrade_average: 28_000, total_average_price: 485_000, cost_to_build: 338_000, gross_margin: 0.303 },
        { plan_name: 'The Heritage', home_count: 35, square_footage: 2650, bedrooms: 4, bathrooms: 3.5, base_price: 525_000, lot_premium_average: 15_000, options_upgrade_average: 35_000, total_average_price: 575_000, cost_to_build: 392_000, gross_margin: 0.318 },
      ],
      has_amenity_center: true,
      has_pool: true,
      has_trails: true,
      hoa_required: true,
      // Timeline
      land_development_months: 14,
      sales_start_month: 12,
      sales_per_month: 5,
      closings_per_month: 4,
      backlog_months: 5,
      total_sellout_months: 42,
      total_project_months: 42,
    },
    uses_of_funds: {
      land_acquisition: {
        raw_land_purchase: 5_950_000,
        price_per_acre: 70_000,
        price_per_lot: 49_583,
        closing_costs: 119_000,
        due_diligence: 85_000,
        total_land_cost: 6_154_000,
      },
      land_development: {
        site_preparation: 680_000,
        roads_paving: 2_850_000,
        utilities: 3_200_000,
        drainage_stormwater: 1_450_000,
        amenities: 1_850_000,
        landscaping_common: 425_000,
        entry_features: 185_000,
        land_dev_contingency_percent: 0.08,
        land_dev_contingency: 851_200,
        total_land_development: 11_491_200,
        land_dev_cost_per_lot: 95_760,
      },
      vertical_costs: {
        costs_by_plan: [
          { plan_name: 'The Willow', direct_construction_cost: 232_500, cost_per_sf: 125.68, lot_finish_cost: 18_500, permits_fees: 12_000, total_direct_cost: 263_000 },
          { plan_name: 'The Oakmont', direct_construction_cost: 275_000, cost_per_sf: 125.00, lot_finish_cost: 21_000, permits_fees: 14_500, total_direct_cost: 310_500 },
          { plan_name: 'The Heritage', direct_construction_cost: 331_250, cost_per_sf: 125.00, lot_finish_cost: 24_000, permits_fees: 16_500, total_direct_cost: 371_750 },
        ],
        weighted_avg_construction_cost: 276_625,
        weighted_avg_lot_finish: 21_000,
        weighted_avg_permits: 14_167,
        weighted_avg_total_direct: 311_792,
        total_vertical_construction: 37_415_000,
      },
      indirect_costs: {
        field_supervision: 850_000,
        construction_insurance: 425_000,
        warranty_reserve_percent: 0.01,
        warranty_reserve: 580_000,
        model_homes_count: 3,
        model_home_cost: 385_000,
        model_furniture_decor: 175_000,
        sales_center: 250_000,
        marketing_advertising: 650_000,
        sales_commissions_percent: 0.03,
        sales_commissions: 1_740_000,
        closing_costs_per_home: 4_500,
        closing_costs_total: 540_000,
        project_management: 720_000,
        accounting_legal: 280_000,
        office_overhead: 350_000,
        total_indirect_costs: 6_945_000,
        indirect_cost_per_home: 57_875,
      },
      impact_fees: {
        per_home_fees: {
          school: 3_200,
          park: 1_500,
          road: 4_800,
          fire: 850,
          water_tap: 4_500,
          sewer_tap: 3_800,
          other: 650,
          total_per_home: 19_300,
        },
        total_impact_fees: 2_316_000,
        included_in_home_price: true,
      },
      financing_costs: {
        land_loan_origination: 112_500,
        construction_line_origination: 165_000,
        interest_reserve: 1_450_000,
        other_fees: 45_000,
        total_financing_costs: 1_772_500,
      },
      total_project_cost: 66_093_700,
    },
    sources_of_funds: {
      loans: [
        {
          id: 'loan-land-dev',
          name: 'Land/Development Loan',
          type: 'land_development',
          amount: 11_250_000,
          loan_amount: 11_250_000,
          commitment_amount: 11_250_000,
          ltc_percent: 0.65,
          interest_rate: 0.068,
          term_months: 48,
          origination_fee_percent: 0.01,
        },
        {
          id: 'loan-vert',
          name: 'Construction Revolver',
          type: 'construction_revolver',
          amount: 22_000_000,
          loan_amount: 22_000_000,
          commitment_amount: 22_000_000,
          max_specs_outstanding: 15,
          advance_rate_percent: 0.80,
          interest_rate: 0.072,
          origination_fee_percent: 0.0075,
        },
      ],
      equity: {
        total_equity_required: 32_843_700,
        investor_equity: 26_274_960,
        investor_equity_percent: 0.80,
        sponsor_equity: 6_568_740,
        sponsor_equity_percent: 0.20,
        preferred_return: 0.10,
        promote_structure: [
          { hurdle: 0.12, split: 0.20, label: 'Above 12% IRR' },
          { hurdle: 0.18, split: 0.30, label: 'Above 18% IRR' },
        ],
      },
      total_sources: 66_093_700,
    },
    revenue_projections: {
      home_sales_by_plan: [
        { plan_name: 'The Willow', count: 40, base_price: 385_000, avg_lot_premium: 8_000, avg_options: 22_000, avg_sale_price: 415_000, total_revenue: 16_600_000 },
        { plan_name: 'The Oakmont', count: 45, base_price: 445_000, avg_lot_premium: 12_000, avg_options: 28_000, avg_sale_price: 485_000, total_revenue: 21_825_000 },
        { plan_name: 'The Heritage', count: 35, base_price: 525_000, avg_lot_premium: 15_000, avg_options: 35_000, avg_sale_price: 575_000, total_revenue: 20_125_000 },
      ],
      total_home_sales_revenue: 58_550_000,
      average_sale_price: 487_917,
      lot_premium_revenue: 1_365_000,
      options_upgrade_revenue: 3_220_000,
      total_gross_revenue: 58_550_000,
      less_commissions: 1_756_500,
      less_closing_costs: 540_000,
      less_sales_costs: 2_296_500,
      net_revenue: 56_253_500,
      sale_cost_percent: 0.04,
    },
    costs: { total_project_cost: 66_093_700 },
    revenue: { type: 'home_sales', total_revenue: 58_550_000, net_revenue: 56_253_500 },
    results: {},
    cash_flows: [],
    approved_at: '2025-04-01T10:00:00Z',
    created_at: '2025-01-01T10:00:00Z',
    updated_at: '2025-12-01T14:30:00Z',
  },
  // ─── Build-to-Rent (BTR) Template Demos ─────────────────────────────────────
  {
    id: 'pf-btr-1',
    project_id: 'demo-project-4',
    budget_id: 'budget-4',
    template_id: 'tmpl-btr-development',
    name: 'Base Case - Cypress Bend BTR',
    version: 1,
    is_active: true,
    status: 'approved',
    assumptions: {
      template_type: 'build_to_rent',
      project_name: 'Cypress Bend',
      address: '9200 Slaughter Ln, Austin, TX 78748',
      total_acreage: 22,
      total_units: 156,
      product_type: 'townhome',
      unit_mix: [
        { unit_type: '1BR/1BA', unit_count: 36, square_footage: 750, bedrooms: 1, bathrooms: 1, monthly_rent: 1_450, annual_rent: 17_400 },
        { unit_type: '2BR/2BA', unit_count: 72, square_footage: 1_100, bedrooms: 2, bathrooms: 2, monthly_rent: 1_850, annual_rent: 22_200 },
        { unit_type: '3BR/2BA', unit_count: 48, square_footage: 1_400, bedrooms: 3, bathrooms: 2, monthly_rent: 2_250, annual_rent: 27_000 },
      ],
      total_rentable_sf: 172_800,
      average_unit_sf: 1_108,
      average_monthly_rent: 1_883,
      average_rent_per_sf: 1.70,
      amenities: {
        clubhouse: true, clubhouse_sf: 4_500,
        pool: true, fitness_center: true, dog_park: true,
        playground: true, business_center: true,
        package_lockers: true, ev_charging: true,
      },
      // Timeline
      entitlement_months: 4,
      construction_months: 14,
      units_leased_per_month: 20,
      stabilization_months: 8,
      hold_period_years: 5,
      total_project_months: 86, // 4 + 14 + 8 + 60
      annual_rent_growth: 0.03,
      annual_expense_growth: 0.025,
    },
    uses_of_funds: {
      land_acquisition: {
        purchase_price: 4_400_000,
        price_per_acre: 200_000,
        price_per_unit: 28_205,
        closing_costs: 88_000,
        due_diligence: 65_000,
        total_land_cost: 4_553_000,
      },
      development_costs: {
        site_work: {
          demolition_clearing: 120_000,
          mass_grading: 480_000,
          utilities: 1_850_000,
          paving_parking: 1_250_000,
          landscaping: 425_000,
          amenity_site_work: 350_000,
          total_site_work: 4_475_000,
        },
        vertical_construction: {
          building_shell: 12_480_000,
          mechanical_electrical_plumbing: 6_240_000,
          interior_finishes: 5_460_000,
          appliances: 780_000,
          amenity_building: 1_350_000,
          total_vertical: 26_310_000,
          cost_per_unit: 168_654,
          cost_per_sf: 152.26,
        },
        soft_costs: {
          architecture_engineering: 1_450_000,
          permits_fees: 624_000,
          impact_fees: 1_248_000,
          legal: 185_000,
          accounting: 95_000,
          insurance: 380_000,
          property_taxes_construction: 285_000,
          marketing_lease_up: 320_000,
          contingency_percent: 0.05,
          contingency: 1_730_000,
          developer_fee_percent: 0.04,
          developer_fee: 1_384_000,
          total_soft_costs: 7_701_000,
        },
      },
      financing_costs: {
        construction_origination: 311_000,
        interest_reserve: 1_850_000,
        exit_fee: 155_500,
        other_fees: 45_000,
        total_financing_costs: 2_361_500,
      },
      total_development_cost: 45_400_500,
      cost_per_unit: 291_029,
      cost_per_sf: 262.81,
    },
    sources_of_funds: {
      development_financing: {
        construction_loan: {
          loan_amount: 31_100_000,
          ltc_percent: 0.685,
          interest_rate: 0.065,
          term_months: 30,
          extension_options: 2,
          origination_fee_percent: 0.01,
          exit_fee_percent: 0.005,
          interest_reserve_months: 12,
          interest_reserve: 1_850_000,
        },
        mezzanine_debt: { enabled: false },
        preferred_equity: { enabled: false },
        equity: {
          total_equity: 14_300_500,
          total_equity_required: 14_300_500,
          investor_equity: 11_440_400,
          investor_equity_percent: 0.80,
          sponsor_equity: 2_860_100,
          sponsor_equity_percent: 0.20,
        },
      },
      loans: [
        { id: 'loan-const-btr', name: 'Construction Loan', type: 'construction', amount: 31_100_000, loan_amount: 31_100_000, interest_rate: 0.065, term_months: 30, origination_fee_percent: 0.01 },
      ],
      equity: {
        total_equity_required: 14_300_500,
        investor_equity: 11_440_400,
        investor_equity_percent: 0.80,
        sponsor_equity: 2_860_100,
        sponsor_equity_percent: 0.20,
        preferred_return: 0.08,
        promote_structure: [
          { hurdle: 0.08, split: 0.20, label: '8-12% IRR: 80/20' },
          { hurdle: 0.12, split: 0.30, label: '12-18% IRR: 70/30' },
          { hurdle: 0.18, split: 0.40, label: '18%+ IRR: 60/40' },
        ],
      },
      total_sources: 45_400_500,
    },
    operating_assumptions: {
      gross_potential_rent: 3_525_600, // 156 units * avg $1,883/mo * 12
      other_income_percent: 0.05,
      other_income: 176_280,
      gross_potential_income: 3_701_880,
      vacancy_rate: 0.05,
      concessions_percent: 0.01,
      bad_debt_percent: 0.005,
      effective_gross_income: 3_461_258,
      expenses: {
        property_management_percent: 0.045,
        property_management: 155_757,
        payroll: 285_000,
        utilities: 195_000,
        repairs_maintenance: 156_000,
        turnover_costs: 78_000,
        landscaping: 65_000,
        insurance: 210_000,
        property_taxes: 520_000,
        marketing: 45_000,
        general_admin: 35_000,
        professional_fees: 25_000,
        replacement_reserves_per_unit: 300,
        replacement_reserves: 46_800,
        total_operating_expenses: 1_816_557,
        expense_ratio: 0.525,
      },
      net_operating_income: 1_644_701,
      noi_per_unit: 10_543,
    },
    growth_assumptions: {
      annual_rent_growth: 0.03,
      annual_expense_growth: 0.025,
      years_projected: 5,
    },
    exit_assumptions: {
      hold_period_years: 5,
      exit_cap_rate: 0.055,
      selling_costs_percent: 0.02,
    },
    permanent_financing: {
      enabled: true,
      timing: 'at_stabilization',
      loan_amount: 26_400_000,
      ltv_percent: 0.65,
      dscr_minimum: 1.25,
      interest_rate: 0.055,
      amortization_years: 30,
      term_years: 10,
      io_period_years: 3,
      origination_fee_percent: 0.005,
    },
    costs: { total_project_cost: 45_400_500 },
    revenue: { type: 'rental', total_revenue: 3_525_600, net_revenue: 1_644_701 },
    results: {},
    cash_flows: [],
    approved_at: '2025-05-01T10:00:00Z',
    created_at: '2025-01-10T10:00:00Z',
    updated_at: '2025-12-15T14:30:00Z',
  },
];

// ─── CRUD Operations ──────────────────────────────────────────────────────────

export async function getProformas(projectId) {
  if (isDemoMode) {
    return DEMO_PROFORMAS.filter(p => p.project_id === projectId);
  }
}

export async function getActiveProforma(projectId) {
  if (isDemoMode) {
    return DEMO_PROFORMAS.find(p => p.project_id === projectId && p.is_active) || null;
  }
}

export async function getProforma(proformaId) {
  if (isDemoMode) {
    return DEMO_PROFORMAS.find(p => p.id === proformaId) || null;
  }
}

export async function createProforma(projectId, data) {
  if (isDemoMode) {
    const existing = DEMO_PROFORMAS.filter(p => p.project_id === projectId);
    const proforma = {
      id: `pf-${Date.now()}`,
      project_id: projectId,
      version: existing.length + 1,
      is_active: existing.length === 0,
      status: 'draft',
      ...data,
      results: {},
      cash_flows: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    DEMO_PROFORMAS.push(proforma);
    return proforma;
  }
}

export async function updateProforma(proformaId, updates) {
  if (isDemoMode) {
    const idx = DEMO_PROFORMAS.findIndex(p => p.id === proformaId);
    if (idx === -1) throw new Error('Pro forma not found');
    DEMO_PROFORMAS[idx] = { ...DEMO_PROFORMAS[idx], ...updates, updated_at: new Date().toISOString() };
    return DEMO_PROFORMAS[idx];
  }
}

export async function setActiveProforma(projectId, proformaId) {
  if (isDemoMode) {
    DEMO_PROFORMAS.forEach(p => {
      if (p.project_id === projectId) p.is_active = (p.id === proformaId);
    });
    return DEMO_PROFORMAS.find(p => p.id === proformaId);
  }
}

export async function deleteProforma(proformaId) {
  if (isDemoMode) {
    const idx = DEMO_PROFORMAS.findIndex(p => p.id === proformaId);
    if (idx !== -1) DEMO_PROFORMAS.splice(idx, 1);
    return true;
  }
}
