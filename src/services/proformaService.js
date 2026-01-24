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
  const metrics = calculateProFormaMetrics(proforma);

  // Sale Price sensitivity
  const salePriceRange = [-0.10, -0.05, 0, 0.05, 0.10];
  const salePriceSensitivity = salePriceRange.map(delta => {
    const adjusted = adjustProforma(proforma, { salePriceDelta: delta });
    const m = calculateProFormaMetrics(adjusted);
    return { delta, grossProfit: m.grossProfit, equityIRR: m.projectIRR, equityMultiple: m.equityMultiple };
  });

  // Construction Cost sensitivity
  const costRange = [-0.10, -0.05, 0, 0.05, 0.10];
  const costSensitivity = costRange.map(delta => {
    const adjusted = adjustProforma(proforma, { costDelta: delta });
    const m = calculateProFormaMetrics(adjusted);
    return { delta, grossProfit: m.grossProfit, equityIRR: m.projectIRR, equityMultiple: m.equityMultiple };
  });

  // Timeline sensitivity
  const timeRange = [-2, -1, 0, 1, 2, 3];
  const timelineSensitivity = timeRange.map(delta => {
    const adjusted = adjustProforma(proforma, { timelineDelta: delta });
    const m = calculateProFormaMetrics(adjusted);
    return { delta, interestCost: m.totalInterest, equityIRR: m.projectIRR };
  });

  // Two-variable matrix: Sale Price vs Construction Cost → Equity IRR
  const twoVarMatrix = salePriceRange.map(revDelta => ({
    revDelta,
    scenarios: costRange.map(costDelta => {
      const adjusted = adjustProforma(proforma, { salePriceDelta: revDelta, costDelta });
      const m = calculateProFormaMetrics(adjusted);
      return { costDelta, equityIRR: m.projectIRR, equityMultiple: m.equityMultiple, grossProfit: m.grossProfit };
    }),
  }));

  return { salePriceSensitivity, costSensitivity, timelineSensitivity, twoVarMatrix };
}

function adjustProforma(proforma, { salePriceDelta = 0, costDelta = 0, timelineDelta = 0 }) {
  const clone = JSON.parse(JSON.stringify(proforma));
  const uf = clone.uses_of_funds || clone.costs || {};
  const rev = clone.revenue_projections || clone.revenue || {};
  const assumptions = clone.assumptions || {};

  if (salePriceDelta !== 0) {
    const salePrice = rev.gross_sale_price || rev.total_revenue || 0;
    const adjusted = salePrice * (1 + salePriceDelta);
    if (rev.gross_sale_price) rev.gross_sale_price = adjusted;
    if (rev.total_revenue) rev.total_revenue = adjusted;
    const saleCosts = adjusted * ((assumptions.broker_commission_percent || 0.05) + (assumptions.seller_closing_costs_percent || 0.02));
    rev.net_sale_proceeds = adjusted - saleCosts;
    if (rev.net_revenue !== undefined) rev.net_revenue = rev.net_sale_proceeds;
  }

  if (costDelta !== 0) {
    if (uf.hard_costs && typeof uf.hard_costs === 'object') {
      uf.hard_costs.total_hard_costs = (uf.hard_costs.total_hard_costs || 0) * (1 + costDelta);
    } else if (uf.hard_costs !== undefined) {
      uf.hard_costs = (uf.hard_costs || 0) * (1 + costDelta);
    }
    // Recalculate total
    if (uf.total_project_cost) {
      const land = uf.land_acquisition?.total_land_cost || uf.land_cost || 0;
      const hard = typeof uf.hard_costs === 'object' ? uf.hard_costs.total_hard_costs : (uf.hard_costs || 0);
      const soft = typeof uf.soft_costs === 'object' ? uf.soft_costs.total_soft_costs : (uf.soft_costs || 0);
      const fin = uf.financing_costs?.total_financing_costs || uf.financing_costs || 0;
      uf.total_project_cost = land + hard + soft + fin;
    }
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
