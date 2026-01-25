// src/services/cashFlowService.js
// Cash flow tracking and projection service

import { isDemoMode } from '@/lib/supabase';

// ─── Constants ────────────────────────────────────────────────────────────────

export const PERIOD_TYPES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
];

export const INFLOW_CATEGORIES = [
  { key: 'loan_draws', label: 'Loan Draws', color: '#3B82F6' },
  { key: 'equity_contributions', label: 'Equity Contributions', color: '#8B5CF6' },
  { key: 'sales_proceeds', label: 'Sales Proceeds', color: '#10B981' },
  { key: 'rental_income', label: 'Rental Income', color: '#06B6D4' },
  { key: 'other_income', label: 'Other Income', color: '#6B7280' },
];

export const OUTFLOW_CATEGORIES = [
  { key: 'land_payments', label: 'Land Payments', color: '#EF4444' },
  { key: 'hard_cost_payments', label: 'Hard Costs', color: '#F97316' },
  { key: 'soft_cost_payments', label: 'Soft Costs', color: '#EAB308' },
  { key: 'interest_payments', label: 'Interest Payments', color: '#EC4899' },
  { key: 'loan_fees', label: 'Loan Fees', color: '#A855F7' },
  { key: 'distributions', label: 'Distributions', color: '#14B8A6' },
  { key: 'other_expenses', label: 'Other Expenses', color: '#6B7280' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function calculateRecordTotals(record) {
  const totalInflows = (record.loan_draws || 0) + (record.equity_contributions || 0) +
    (record.sales_proceeds || 0) + (record.rental_income || 0) + (record.other_income || 0);
  const totalOutflows = (record.land_payments || 0) + (record.hard_cost_payments || 0) +
    (record.soft_cost_payments || 0) + (record.interest_payments || 0) +
    (record.loan_fees || 0) + (record.distributions || 0) + (record.other_expenses || 0);
  const netCashFlow = totalInflows - totalOutflows;
  const endingCash = (record.beginning_cash || 0) + netCashFlow;
  return { totalInflows, totalOutflows, netCashFlow, endingCash };
}

export function calculateCashFlowSummary(records) {
  const totalInflows = records.reduce((s, r) => {
    const t = calculateRecordTotals(r);
    return s + t.totalInflows;
  }, 0);
  const totalOutflows = records.reduce((s, r) => {
    const t = calculateRecordTotals(r);
    return s + t.totalOutflows;
  }, 0);
  const netCashFlow = totalInflows - totalOutflows;
  const currentCash = records.length > 0
    ? calculateRecordTotals(records[records.length - 1]).endingCash
    : 0;
  const peakCash = Math.max(...records.map(r => calculateRecordTotals(r).endingCash), 0);
  const minCash = Math.min(...records.map(r => calculateRecordTotals(r).endingCash), 0);
  const actualPeriods = records.filter(r => r.is_actual).length;
  const projectedPeriods = records.filter(r => !r.is_actual).length;

  return {
    totalInflows, totalOutflows, netCashFlow, currentCash,
    peakCash, minCash, actualPeriods, projectedPeriods, totalPeriods: records.length,
  };
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

function generateDemoCashFlows() {
  const records = [];
  const startDate = new Date('2025-03-01');
  let beginningCash = 975000; // Initial equity contribution

  const monthlyData = [
    // Month 1: Land + initial equity
    { loan_draws: 0, equity_contributions: 975000, land_payments: 1200000, hard_cost_payments: 0, soft_cost_payments: 45000, interest_payments: 0, loan_fees: 48750, is_actual: true },
    // Month 2: First draw + construction starts
    { loan_draws: 487500, equity_contributions: 0, land_payments: 0, hard_cost_payments: 285000, soft_cost_payments: 25000, interest_payments: 24167, loan_fees: 0, is_actual: true },
    // Month 3
    { loan_draws: 487500, equity_contributions: 0, land_payments: 0, hard_cost_payments: 320000, soft_cost_payments: 22000, interest_payments: 34542, loan_fees: 0, is_actual: true },
    // Month 4
    { loan_draws: 487500, equity_contributions: 0, land_payments: 0, hard_cost_payments: 355000, soft_cost_payments: 20000, interest_payments: 44917, loan_fees: 0, is_actual: true },
    // Month 5
    { loan_draws: 487500, equity_contributions: 0, land_payments: 0, hard_cost_payments: 380000, soft_cost_payments: 18000, interest_payments: 55292, loan_fees: 0, is_actual: true },
    // Month 6: First sale closes
    { loan_draws: 487500, equity_contributions: 0, sales_proceeds: 394000, land_payments: 0, hard_cost_payments: 340000, soft_cost_payments: 22000, interest_payments: 65667, loan_fees: 0, is_actual: true },
    // Month 7: Second sale
    { loan_draws: 487500, equity_contributions: 0, sales_proceeds: 418000, land_payments: 0, hard_cost_payments: 310000, soft_cost_payments: 18000, interest_payments: 76042, loan_fees: 0, is_actual: true },
    // Month 8: Third sale
    { loan_draws: 487500, equity_contributions: 0, sales_proceeds: 436400, land_payments: 0, hard_cost_payments: 290000, soft_cost_payments: 15000, interest_payments: 86417, loan_fees: 0, is_actual: true },
    // Month 9 (projected): More sales
    { loan_draws: 400000, equity_contributions: 0, sales_proceeds: 413250, land_payments: 0, hard_cost_payments: 260000, soft_cost_payments: 15000, interest_payments: 86417, loan_fees: 0, is_actual: false },
    // Month 10 (projected)
    { loan_draws: 350000, equity_contributions: 0, sales_proceeds: 451100, land_payments: 0, hard_cost_payments: 240000, soft_cost_payments: 12000, interest_payments: 82000, loan_fees: 0, is_actual: false },
    // Month 11 (projected)
    { loan_draws: 250000, equity_contributions: 0, sales_proceeds: 0, land_payments: 0, hard_cost_payments: 200000, soft_cost_payments: 10000, interest_payments: 78000, loan_fees: 0, is_actual: false },
    // Month 12 (projected): Final sales + payoff
    { loan_draws: 0, equity_contributions: 0, sales_proceeds: 850000, land_payments: 0, hard_cost_payments: 150000, soft_cost_payments: 8000, interest_payments: 72000, loan_fees: 24375, distributions: 200000, is_actual: false },
  ];

  beginningCash = 0;
  monthlyData.forEach((data, i) => {
    const periodStart = new Date(startDate);
    periodStart.setMonth(periodStart.getMonth() + i);
    const periodEnd = new Date(periodStart);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    periodEnd.setDate(0);

    const record = {
      id: `cf-${i + 1}`,
      project_id: 'demo-project-1',
      period_type: 'monthly',
      period_start: periodStart.toISOString().split('T')[0],
      period_end: periodEnd.toISOString().split('T')[0],
      beginning_cash: beginningCash,
      loan_draws: data.loan_draws || 0,
      equity_contributions: data.equity_contributions || 0,
      sales_proceeds: data.sales_proceeds || 0,
      rental_income: data.rental_income || 0,
      other_income: data.other_income || 0,
      land_payments: data.land_payments || 0,
      hard_cost_payments: data.hard_cost_payments || 0,
      soft_cost_payments: data.soft_cost_payments || 0,
      interest_payments: data.interest_payments || 0,
      loan_fees: data.loan_fees || 0,
      distributions: data.distributions || 0,
      other_expenses: data.other_expenses || 0,
      is_actual: data.is_actual,
      is_locked: data.is_actual,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const totals = calculateRecordTotals(record);
    record.ending_cash = totals.endingCash;
    beginningCash = totals.endingCash;

    records.push(record);
  });

  return records;
}

const DEMO_CASH_FLOWS = generateDemoCashFlows();

// ─── CRUD Operations ──────────────────────────────────────────────────────────

export async function getProjectCashFlows(projectId) {
  if (isDemoMode) {
    return DEMO_CASH_FLOWS.filter(r => r.project_id === projectId)
      .sort((a, b) => new Date(a.period_start) - new Date(b.period_start));
  }
}

export async function getCashFlowRecord(recordId) {
  if (isDemoMode) {
    return DEMO_CASH_FLOWS.find(r => r.id === recordId) || null;
  }
}

export async function createCashFlowRecord(projectId, data) {
  if (isDemoMode) {
    const record = {
      id: `cf-${Date.now()}`,
      project_id: projectId,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const totals = calculateRecordTotals(record);
    record.ending_cash = totals.endingCash;
    DEMO_CASH_FLOWS.push(record);
    return record;
  }
}

export async function updateCashFlowRecord(recordId, updates) {
  if (isDemoMode) {
    const idx = DEMO_CASH_FLOWS.findIndex(r => r.id === recordId);
    if (idx === -1) throw new Error('Record not found');
    if (DEMO_CASH_FLOWS[idx].is_locked) throw new Error('Record is locked');
    DEMO_CASH_FLOWS[idx] = { ...DEMO_CASH_FLOWS[idx], ...updates, updated_at: new Date().toISOString() };
    const totals = calculateRecordTotals(DEMO_CASH_FLOWS[idx]);
    DEMO_CASH_FLOWS[idx].ending_cash = totals.endingCash;
    return DEMO_CASH_FLOWS[idx];
  }
}

export async function deleteCashFlowRecord(recordId) {
  if (isDemoMode) {
    const idx = DEMO_CASH_FLOWS.findIndex(r => r.id === recordId);
    if (idx !== -1) DEMO_CASH_FLOWS.splice(idx, 1);
    return true;
  }
}
