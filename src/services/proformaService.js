// src/services/proformaService.js
// Pro Forma financial modeling service with calculations

import { isDemoMode } from '@/lib/supabase';

// ─── Financial Calculations ───────────────────────────────────────────────────

export function calculateIRR(cashFlows, guess = 0.1) {
  const maxIterations = 100;
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

export function calculateAmortization(principal, annualRate, termMonths, ioMonths = 0) {
  const monthlyRate = annualRate / 12;
  const schedule = [];
  let balance = principal;

  for (let month = 1; month <= termMonths; month++) {
    const interest = balance * monthlyRate;
    if (month <= ioMonths) {
      schedule.push({ month, payment: interest, principal: 0, interest, balance });
    } else {
      const remaining = termMonths - ioMonths;
      const monthsSoFar = month - ioMonths;
      const payment = remaining > 0
        ? (balance * monthlyRate * Math.pow(1 + monthlyRate, remaining - monthsSoFar + 1)) /
          (Math.pow(1 + monthlyRate, remaining - monthsSoFar + 1) - 1)
        : interest;
      const principalPayment = payment - interest;
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

export function calculateProFormaMetrics(proforma) {
  const { costs, financing, revenue, assumptions } = proforma;

  const totalCosts = costs.total_project_cost || 0;
  const totalRevenue = revenue.total_revenue || 0;
  const grossProfit = totalRevenue - totalCosts;
  const grossMargin = totalRevenue > 0 ? grossProfit / totalRevenue : 0;

  // Financing costs
  const totalDebt = (financing.loans || []).reduce((s, l) => s + (l.amount || 0), 0);
  const totalEquity = financing.equity?.total_equity_required || (totalCosts - totalDebt);
  const ltcRatio = totalCosts > 0 ? totalDebt / totalCosts : 0;

  // Interest costs (simplified)
  const termMonths = assumptions.project_timeline_months || 18;
  const totalInterest = (financing.loans || []).reduce((s, l) => {
    return s + ((l.amount || 0) * (l.interest_rate || 0) * (termMonths / 12));
  }, 0);

  const netProfit = grossProfit - totalInterest;
  const equityMultiple = calculateEquityMultiple(totalEquity + netProfit, totalEquity);
  const cashOnCash = totalEquity > 0 ? netProfit / totalEquity : 0;

  // Build cash flow array for IRR
  const monthlyCashFlows = [-totalEquity];
  for (let m = 1; m < termMonths; m++) {
    monthlyCashFlows.push(0);
  }
  monthlyCashFlows.push(totalEquity + netProfit);

  const projectIRR = calculateIRR(monthlyCashFlows, 0.02); // Monthly IRR
  const annualizedIRR = Math.pow(1 + projectIRR, 12) - 1; // Annualized

  const npv10 = calculateNPV(monthlyCashFlows, 0.10 / 12);

  return {
    totalCosts,
    totalRevenue,
    grossProfit,
    grossMargin,
    totalDebt,
    totalEquity,
    ltcRatio,
    totalInterest,
    netProfit,
    equityMultiple,
    cashOnCash,
    projectIRR: annualizedIRR,
    npv10,
    termMonths,
  };
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

const DEMO_PROFORMAS = [
  {
    id: 'pf-1',
    project_id: 'demo-project-1',
    budget_id: 'budget-1',
    name: 'Base Case Scenario',
    version: 1,
    is_active: true,
    assumptions: {
      project_timeline_months: 18,
      construction_start_date: '2025-03-01',
      completion_date: '2026-09-01',
      sale_date: '2026-12-01',
      hold_period_months: 3,
      sale_price: 8500000,
      sale_price_per_unit: 354167,
      closing_cost_percent: 0.03,
      broker_commission: 0.04,
    },
    costs: {
      land_cost: 1200000,
      hard_costs: 4250000,
      soft_costs: 485000,
      financing_costs: 340000,
      contingency: 225000,
      total_project_cost: 6500000,
    },
    financing: {
      loans: [
        {
          id: 'loan-1',
          name: 'Construction Loan',
          type: 'construction',
          position: 'first',
          amount: 4875000,
          ltc_percent: 0.75,
          interest_rate: 0.085,
          term_months: 24,
          io_months: 24,
          origination_fee: 0.01,
          exit_fee: 0,
          draw_schedule: 'monthly',
        },
        {
          id: 'loan-2',
          name: 'Mezzanine Debt',
          type: 'mezzanine',
          position: 'second',
          amount: 650000,
          interest_rate: 0.12,
          term_months: 24,
          io_months: 24,
          accruing: true,
        },
      ],
      equity: {
        total_equity_required: 975000,
        investor_equity: 730000,
        sponsor_equity: 245000,
        preferred_return: 0.10,
        promote_structure: [
          { hurdle: 0.12, split: 0.20 },
          { hurdle: 0.18, split: 0.30 },
        ],
      },
    },
    revenue: {
      type: 'sale',
      total_revenue: 8500000,
      units: 24,
      avg_price_per_unit: 354167,
      closing_costs: 255000,
      broker_commission: 340000,
      net_revenue: 7905000,
    },
    results: {},
    cash_flows: [],
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-10-15T14:30:00Z',
  },
  {
    id: 'pf-2',
    project_id: 'demo-project-1',
    budget_id: 'budget-1',
    name: 'Optimistic Case',
    version: 2,
    is_active: false,
    assumptions: {
      project_timeline_months: 16,
      construction_start_date: '2025-03-01',
      completion_date: '2026-07-01',
      sale_date: '2026-09-01',
      hold_period_months: 2,
      sale_price: 9200000,
      sale_price_per_unit: 383333,
      closing_cost_percent: 0.03,
      broker_commission: 0.04,
    },
    costs: {
      land_cost: 1200000,
      hard_costs: 4100000,
      soft_costs: 460000,
      financing_costs: 295000,
      contingency: 200000,
      total_project_cost: 6255000,
    },
    financing: {
      loans: [
        {
          id: 'loan-1',
          name: 'Construction Loan',
          type: 'construction',
          position: 'first',
          amount: 4691000,
          ltc_percent: 0.75,
          interest_rate: 0.08,
          term_months: 20,
          io_months: 20,
          origination_fee: 0.01,
        },
      ],
      equity: {
        total_equity_required: 1564000,
        investor_equity: 1173000,
        sponsor_equity: 391000,
        preferred_return: 0.10,
        promote_structure: [
          { hurdle: 0.12, split: 0.20 },
          { hurdle: 0.18, split: 0.30 },
        ],
      },
    },
    revenue: {
      type: 'sale',
      total_revenue: 9200000,
      units: 24,
      avg_price_per_unit: 383333,
      closing_costs: 276000,
      broker_commission: 368000,
      net_revenue: 8556000,
    },
    results: {},
    cash_flows: [],
    created_at: '2025-03-15T10:00:00Z',
    updated_at: '2025-10-01T09:00:00Z',
  },
  {
    id: 'pf-3',
    project_id: 'demo-project-1',
    budget_id: 'budget-1',
    name: 'Conservative Case',
    version: 3,
    is_active: false,
    assumptions: {
      project_timeline_months: 22,
      construction_start_date: '2025-03-01',
      completion_date: '2027-01-01',
      sale_date: '2027-04-01',
      hold_period_months: 3,
      sale_price: 7800000,
      sale_price_per_unit: 325000,
      closing_cost_percent: 0.04,
      broker_commission: 0.05,
    },
    costs: {
      land_cost: 1200000,
      hard_costs: 4500000,
      soft_costs: 520000,
      financing_costs: 420000,
      contingency: 300000,
      total_project_cost: 6940000,
    },
    financing: {
      loans: [
        {
          id: 'loan-1',
          name: 'Construction Loan',
          type: 'construction',
          position: 'first',
          amount: 4858000,
          ltc_percent: 0.70,
          interest_rate: 0.09,
          term_months: 28,
          io_months: 28,
          origination_fee: 0.015,
        },
        {
          id: 'loan-2',
          name: 'Mezzanine',
          type: 'mezzanine',
          position: 'second',
          amount: 800000,
          interest_rate: 0.13,
          term_months: 28,
          io_months: 28,
          accruing: true,
        },
      ],
      equity: {
        total_equity_required: 1282000,
        investor_equity: 960000,
        sponsor_equity: 322000,
        preferred_return: 0.10,
        promote_structure: [
          { hurdle: 0.12, split: 0.20 },
        ],
      },
    },
    revenue: {
      type: 'sale',
      total_revenue: 7800000,
      units: 24,
      avg_price_per_unit: 325000,
      closing_costs: 312000,
      broker_commission: 390000,
      net_revenue: 7098000,
    },
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
