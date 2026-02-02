// src/services/loanService.js
// Loan tracking service with amortization calculations

import { isDemoMode } from '@/lib/supabase';

// ─── Constants ────────────────────────────────────────────────────────────────

export const LOAN_TYPES = [
  { value: 'construction', label: 'Construction Loan' },
  { value: 'bridge', label: 'Bridge Loan' },
  { value: 'permanent', label: 'Permanent Loan' },
  { value: 'mezzanine', label: 'Mezzanine Debt' },
  { value: 'preferred_equity', label: 'Preferred Equity' },
  { value: 'line_of_credit', label: 'Line of Credit' },
];

export const LOAN_POSITIONS = [
  { value: 'first', label: 'First Lien' },
  { value: 'second', label: 'Second Lien' },
  { value: 'third', label: 'Third Lien' },
  { value: 'unsecured', label: 'Unsecured' },
];

export const LOAN_STATUSES = [
  { value: 'proposed', label: 'Proposed', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  { value: 'term_sheet', label: 'Term Sheet', color: 'bg-blue-50 text-blue-700 border-blue-300' },
  { value: 'application', label: 'Application', color: 'bg-indigo-50 text-indigo-700 border-indigo-300' },
  { value: 'underwriting', label: 'Underwriting', color: 'bg-purple-50 text-purple-700 border-purple-300' },
  { value: 'approved', label: 'Approved', color: 'bg-green-50 text-green-700 border-green-300' },
  { value: 'closed', label: 'Closed', color: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  { value: 'active', label: 'Active', color: 'bg-teal-50 text-teal-800 border-teal-300' },
  { value: 'paid_off', label: 'Paid Off', color: 'bg-gray-50 text-gray-600 border-gray-300' },
  { value: 'defaulted', label: 'Defaulted', color: 'bg-red-50 text-red-700 border-red-300' },
];

export const RATE_TYPES = [
  { value: 'fixed', label: 'Fixed' },
  { value: 'floating', label: 'Floating' },
];

export const INDEX_RATES = [
  { value: 'sofr', label: 'SOFR' },
  { value: 'prime', label: 'Prime' },
  { value: 'libor', label: 'LIBOR (Legacy)' },
];

export const DRAW_STATUSES = [
  { value: 'requested', label: 'Requested', color: 'bg-amber-50 text-amber-700' },
  { value: 'approved', label: 'Approved', color: 'bg-blue-50 text-blue-700' },
  { value: 'funded', label: 'Funded', color: 'bg-green-50 text-green-700' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getLoanTypeLabel(type) {
  return LOAN_TYPES.find(t => t.value === type)?.label || type;
}

export function getStatusConfig(status) {
  return LOAN_STATUSES.find(s => s.value === status) || LOAN_STATUSES[0];
}

export function calculateAmortizationSchedule(principal, annualRate, termMonths, ioMonths = 0) {
  const monthlyRate = annualRate / 12;
  const schedule = [];
  let balance = principal;

  for (let month = 1; month <= termMonths; month++) {
    const interest = balance * monthlyRate;
    if (month <= ioMonths) {
      schedule.push({
        month,
        payment: interest,
        principal: 0,
        interest,
        balance,
      });
    } else {
      const amortizingMonths = termMonths - ioMonths;
      const payment = balance > 0
        ? (balance * monthlyRate * Math.pow(1 + monthlyRate, amortizingMonths - (month - ioMonths) + 1)) /
          (Math.pow(1 + monthlyRate, amortizingMonths - (month - ioMonths) + 1) - 1)
        : 0;
      const principalPayment = Math.min(payment - interest, balance);
      balance = Math.max(0, balance - principalPayment);
      schedule.push({
        month,
        payment: interest + principalPayment,
        principal: principalPayment,
        interest,
        balance,
      });
    }
  }
  return schedule;
}

export function calculateLoanSummary(loans) {
  const totalCommitment = loans.reduce((s, l) => s + (l.commitment_amount || 0), 0);
  const totalFunded = loans.reduce((s, l) => s + (l.funded_amount || 0), 0);
  const availableToFund = totalCommitment - totalFunded;
  const activeLoans = loans.filter(l => ['active', 'closed'].includes(l.status)).length;
  const proposedLoans = loans.filter(l => ['proposed', 'term_sheet', 'application', 'underwriting'].includes(l.status)).length;
  const weightedRate = totalFunded > 0
    ? loans.reduce((s, l) => s + (l.interest_rate || 0) * (l.funded_amount || 0), 0) / totalFunded
    : 0;
  const totalInterestReserve = loans.reduce((s, l) => s + (l.interest_reserve || 0), 0);
  const totalOriginationFees = loans.reduce((s, l) => s + (l.origination_fee_amount || 0), 0);

  return {
    totalCommitment, totalFunded, availableToFund, activeLoans, proposedLoans,
    weightedRate, totalInterestReserve, totalOriginationFees, totalCount: loans.length,
  };
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

const DEMO_LOANS = [
  {
    id: 'loan-1',
    project_id: 'demo-project-1',
    name: 'Senior Construction Loan',
    loan_type: 'construction',
    position: 'first',
    lender_name: 'Texas Capital Bank',
    loan_officer: 'Michael Richardson',
    commitment_amount: 4875000,
    funded_amount: 3412500,
    interest_rate: 0.085,
    rate_type: 'floating',
    index_rate: 'sofr',
    spread: 0.035,
    floor_rate: 0.065,
    term_months: 24,
    amortization_months: null,
    io_period_months: 24,
    effective_date: '2025-03-01',
    maturity_date: '2027-03-01',
    first_payment_date: '2025-04-01',
    origination_fee_percent: 0.01,
    origination_fee_amount: 48750,
    exit_fee_percent: 0.005,
    annual_fee: 0,
    interest_reserve: 415000,
    operating_reserve: 0,
    replacement_reserve: 0,
    max_ltv: 0.70,
    max_ltc: 0.75,
    status: 'active',
    notes: '75% LTC construction facility. Monthly draws based on inspection reports. Interest reserve funded at closing.',
    created_at: '2025-02-15T10:00:00Z',
    updated_at: '2025-10-01T14:30:00Z',
  },
  {
    id: 'loan-2',
    project_id: 'demo-project-1',
    name: 'Mezzanine Facility',
    loan_type: 'mezzanine',
    position: 'second',
    lender_name: 'Horizon Capital Partners',
    loan_officer: 'Sarah Chen',
    commitment_amount: 650000,
    funded_amount: 650000,
    interest_rate: 0.12,
    rate_type: 'fixed',
    index_rate: null,
    spread: null,
    floor_rate: null,
    term_months: 24,
    amortization_months: null,
    io_period_months: 24,
    effective_date: '2025-03-01',
    maturity_date: '2027-03-01',
    first_payment_date: '2025-04-01',
    origination_fee_percent: 0.02,
    origination_fee_amount: 13000,
    exit_fee_percent: 0.01,
    annual_fee: 0,
    interest_reserve: 78000,
    operating_reserve: 0,
    replacement_reserve: 0,
    max_ltv: null,
    max_ltc: 0.85,
    status: 'active',
    notes: 'Mezzanine debt, interest accruing. Payment at maturity or sale event. Intercreditor agreement with TCB.',
    created_at: '2025-02-20T10:00:00Z',
    updated_at: '2025-09-15T11:00:00Z',
  },
  {
    id: 'loan-3',
    project_id: 'demo-project-1',
    name: 'Permanent Take-Out (Proposed)',
    loan_type: 'permanent',
    position: 'first',
    lender_name: 'CBRE Capital Markets',
    loan_officer: 'David Park',
    commitment_amount: 5950000,
    funded_amount: 0,
    interest_rate: 0.0625,
    rate_type: 'fixed',
    index_rate: null,
    spread: null,
    floor_rate: null,
    term_months: 120,
    amortization_months: 360,
    io_period_months: 12,
    effective_date: null,
    maturity_date: null,
    first_payment_date: null,
    origination_fee_percent: 0.0075,
    origination_fee_amount: 44625,
    exit_fee_percent: 0,
    annual_fee: 0,
    interest_reserve: 0,
    operating_reserve: 75000,
    replacement_reserve: 25000,
    max_ltv: 0.70,
    max_ltc: null,
    status: 'term_sheet',
    notes: 'Proposed take-out financing post-stabilization. 70% LTV, 10yr fixed with 30yr amortization, 12mo IO.',
    created_at: '2025-08-01T10:00:00Z',
    updated_at: '2025-10-20T16:00:00Z',
  },
];

const DEMO_DRAWS = [
  { id: 'draw-1', loan_id: 'loan-1', draw_number: 1, draw_date: '2025-03-15', amount: 487500, status: 'funded' },
  { id: 'draw-2', loan_id: 'loan-1', draw_number: 2, draw_date: '2025-04-15', amount: 487500, status: 'funded' },
  { id: 'draw-3', loan_id: 'loan-1', draw_number: 3, draw_date: '2025-05-15', amount: 487500, status: 'funded' },
  { id: 'draw-4', loan_id: 'loan-1', draw_number: 4, draw_date: '2025-06-15', amount: 487500, status: 'funded' },
  { id: 'draw-5', loan_id: 'loan-1', draw_number: 5, draw_date: '2025-07-15', amount: 487500, status: 'funded' },
  { id: 'draw-6', loan_id: 'loan-1', draw_number: 6, draw_date: '2025-08-15', amount: 487500, status: 'funded' },
  { id: 'draw-7', loan_id: 'loan-1', draw_number: 7, draw_date: '2025-09-15', amount: 487500, status: 'funded' },
  { id: 'draw-8', loan_id: 'loan-1', draw_number: 8, draw_date: '2025-10-15', amount: 487500, status: 'approved' },
  { id: 'draw-9', loan_id: 'loan-1', draw_number: 9, draw_date: '2025-11-15', amount: 487500, status: 'requested' },
  { id: 'draw-10', loan_id: 'loan-2', draw_number: 1, draw_date: '2025-03-01', amount: 650000, status: 'funded' },
];

const DEMO_PAYMENTS = [
  { id: 'pmt-1', loan_id: 'loan-1', payment_date: '2025-04-01', payment_number: 1, total_payment: 24166.67, principal_payment: 0, interest_payment: 24166.67, beginning_balance: 487500, ending_balance: 487500, status: 'paid' },
  { id: 'pmt-2', loan_id: 'loan-1', payment_date: '2025-05-01', payment_number: 2, total_payment: 34541.67, principal_payment: 0, interest_payment: 34541.67, beginning_balance: 975000, ending_balance: 975000, status: 'paid' },
  { id: 'pmt-3', loan_id: 'loan-1', payment_date: '2025-06-01', payment_number: 3, total_payment: 44916.67, principal_payment: 0, interest_payment: 44916.67, beginning_balance: 1462500, ending_balance: 1462500, status: 'paid' },
  { id: 'pmt-4', loan_id: 'loan-1', payment_date: '2025-07-01', payment_number: 4, total_payment: 55291.67, principal_payment: 0, interest_payment: 55291.67, beginning_balance: 1950000, ending_balance: 1950000, status: 'paid' },
  { id: 'pmt-5', loan_id: 'loan-1', payment_date: '2025-08-01', payment_number: 5, total_payment: 65666.67, principal_payment: 0, interest_payment: 65666.67, beginning_balance: 2437500, ending_balance: 2437500, status: 'paid' },
  { id: 'pmt-6', loan_id: 'loan-1', payment_date: '2025-09-01', payment_number: 6, total_payment: 76041.67, principal_payment: 0, interest_payment: 76041.67, beginning_balance: 2925000, ending_balance: 2925000, status: 'paid' },
  { id: 'pmt-7', loan_id: 'loan-1', payment_date: '2025-10-01', payment_number: 7, total_payment: 86416.67, principal_payment: 0, interest_payment: 86416.67, beginning_balance: 3412500, ending_balance: 3412500, status: 'paid' },
  { id: 'pmt-8', loan_id: 'loan-1', payment_date: '2025-11-01', payment_number: 8, total_payment: 86416.67, principal_payment: 0, interest_payment: 86416.67, beginning_balance: 3412500, ending_balance: 3412500, status: 'scheduled' },
  { id: 'pmt-9', loan_id: 'loan-2', payment_date: '2025-04-01', payment_number: 1, total_payment: 6500, principal_payment: 0, interest_payment: 6500, beginning_balance: 650000, ending_balance: 650000, status: 'paid' },
  { id: 'pmt-10', loan_id: 'loan-2', payment_date: '2025-05-01', payment_number: 2, total_payment: 6500, principal_payment: 0, interest_payment: 6500, beginning_balance: 650000, ending_balance: 650000, status: 'paid' },
];

// ─── CRUD Operations ──────────────────────────────────────────────────────────

export async function getProjectLoans(projectId) {
  if (isDemoMode) {
    return DEMO_LOANS.filter(l => l.project_id === projectId);
  }
}

export async function getLoan(loanId) {
  if (isDemoMode) {
    return DEMO_LOANS.find(l => l.id === loanId) || null;
  }
}

export async function createLoan(projectId, data) {
  if (isDemoMode) {
    const loan = {
      id: `loan-${Date.now()}`,
      project_id: projectId,
      ...data,
      commitment_amount: parseFloat(data.commitment_amount) || 0,
      funded_amount: 0,
      interest_rate: parseFloat(data.interest_rate) || 0,
      origination_fee_amount: (parseFloat(data.commitment_amount) || 0) * (parseFloat(data.origination_fee_percent) || 0),
      status: 'proposed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    DEMO_LOANS.push(loan);
    return loan;
  }
}

export async function updateLoan(loanId, updates) {
  if (isDemoMode) {
    const idx = DEMO_LOANS.findIndex(l => l.id === loanId);
    if (idx === -1) throw new Error('Loan not found');
    DEMO_LOANS[idx] = { ...DEMO_LOANS[idx], ...updates, updated_at: new Date().toISOString() };
    return DEMO_LOANS[idx];
  }
}

export async function deleteLoan(loanId) {
  if (isDemoMode) {
    const idx = DEMO_LOANS.findIndex(l => l.id === loanId);
    if (idx !== -1) DEMO_LOANS.splice(idx, 1);
    return true;
  }
}

// ─── Draws ────────────────────────────────────────────────────────────────────

export async function getLoanDraws(loanId) {
  if (isDemoMode) {
    return DEMO_DRAWS.filter(d => d.loan_id === loanId).sort((a, b) => a.draw_number - b.draw_number);
  }
}

export async function createDraw(loanId, data) {
  if (isDemoMode) {
    const existing = DEMO_DRAWS.filter(d => d.loan_id === loanId);
    const draw = {
      id: `draw-${Date.now()}`,
      loan_id: loanId,
      draw_number: existing.length + 1,
      ...data,
      amount: parseFloat(data.amount) || 0,
      status: 'requested',
      created_at: new Date().toISOString(),
    };
    DEMO_DRAWS.push(draw);
    return draw;
  }
}

export async function approveDraw(drawId) {
  if (isDemoMode) {
    const idx = DEMO_DRAWS.findIndex(d => d.id === drawId);
    if (idx !== -1) DEMO_DRAWS[idx].status = 'approved';
    return DEMO_DRAWS[idx];
  }
}

export async function fundDraw(drawId) {
  if (isDemoMode) {
    const idx = DEMO_DRAWS.findIndex(d => d.id === drawId);
    if (idx !== -1) {
      DEMO_DRAWS[idx].status = 'funded';
      // Update funded amount
      const loan = DEMO_LOANS.find(l => l.id === DEMO_DRAWS[idx].loan_id);
      if (loan) loan.funded_amount += DEMO_DRAWS[idx].amount;
    }
    return DEMO_DRAWS[idx];
  }
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export async function getLoanPayments(loanId) {
  if (isDemoMode) {
    return DEMO_PAYMENTS.filter(p => p.loan_id === loanId).sort((a, b) => a.payment_number - b.payment_number);
  }
}

export async function recordPayment(paymentId) {
  if (isDemoMode) {
    const idx = DEMO_PAYMENTS.findIndex(p => p.id === paymentId);
    if (idx !== -1) DEMO_PAYMENTS[idx].status = 'paid';
    return DEMO_PAYMENTS[idx];
  }
}
