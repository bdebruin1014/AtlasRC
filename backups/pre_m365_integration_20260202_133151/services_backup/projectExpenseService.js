// src/services/projectExpenseService.js
// Project-level expense tracking with approval workflow and budget integration

import { isDemoMode } from '@/lib/supabase';

// ─── Constants ────────────────────────────────────────────────────────────────

export const EXPENSE_TYPES = [
  { value: 'labor', label: 'Labor' },
  { value: 'materials', label: 'Materials' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'subcontractor', label: 'Subcontractor' },
  { value: 'professional_fees', label: 'Professional Fees' },
  { value: 'permits', label: 'Permits & Fees' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'other', label: 'Other' },
];

export const EXPENSE_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  { value: 'waiting_approval', label: 'Awaiting Approval', color: 'bg-amber-50 text-amber-700 border-amber-300' },
  { value: 'approved', label: 'Approved', color: 'bg-blue-50 text-blue-700 border-blue-300' },
  { value: 'denied', label: 'Denied', color: 'bg-red-50 text-red-700 border-red-300' },
  { value: 'paid', label: 'Paid', color: 'bg-green-50 text-green-700 border-green-300' },
];

export const PAYMENT_METHODS = [
  { value: 'check', label: 'Check' },
  { value: 'ach', label: 'ACH Transfer' },
  { value: 'wire', label: 'Wire Transfer' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'cash', label: 'Cash' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getExpenseTypeLabel(type) {
  return EXPENSE_TYPES.find(t => t.value === type)?.label || type;
}

export function getStatusConfig(status) {
  return EXPENSE_STATUSES.find(s => s.value === status) || EXPENSE_STATUSES[0];
}

export function calculateExpenseTotals(expenses) {
  const totalAmount = expenses.reduce((s, e) => s + (e.total_amount || e.amount || 0), 0);
  const paidAmount = expenses.filter(e => e.status === 'paid').reduce((s, e) => s + (e.total_amount || e.amount || 0), 0);
  const pendingAmount = expenses.filter(e => ['pending', 'waiting_approval'].includes(e.status)).reduce((s, e) => s + (e.total_amount || e.amount || 0), 0);
  const approvedAmount = expenses.filter(e => e.status === 'approved').reduce((s, e) => s + (e.total_amount || e.amount || 0), 0);
  const deniedAmount = expenses.filter(e => e.status === 'denied').reduce((s, e) => s + (e.total_amount || e.amount || 0), 0);
  const awaitingApproval = expenses.filter(e => e.status === 'waiting_approval').length;
  const overdueCount = expenses.filter(e => e.due_date && e.status !== 'paid' && new Date(e.due_date) < new Date()).length;

  return { totalAmount, paidAmount, pendingAmount, approvedAmount, deniedAmount, awaitingApproval, overdueCount, totalCount: expenses.length };
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

const DEMO_EXPENSES = [
  {
    id: 'exp-1', project_id: 'demo-project-1', budget_line_item_id: 'bli-1',
    description: 'Foundation concrete pour - Building A',
    expense_type: 'subcontractor', vendor_name: 'Solid Ground Foundations LLC',
    invoice_number: 'SGF-2025-0042', amount: 85000, tax_amount: 0,
    total_amount: 85000, expense_date: '2025-05-20', due_date: '2025-06-20',
    paid_date: '2025-06-15', status: 'paid', requires_approval: true,
    approved_at: '2025-05-25T10:00:00Z', approval_notes: 'Verified against contract.',
    payment_method: 'ach', payment_reference: 'ACH-78432',
    source_type: 'manual', notes: 'Progress payment 1 of 3.',
  },
  {
    id: 'exp-2', project_id: 'demo-project-1', budget_line_item_id: 'bli-2',
    description: 'Framing lumber package - Phase 1',
    expense_type: 'materials', vendor_name: '84 Lumber Austin',
    invoice_number: '84L-INV-88721', amount: 124500, tax_amount: 10282.50,
    total_amount: 134782.50, expense_date: '2025-06-10', due_date: '2025-07-10',
    paid_date: '2025-07-08', status: 'paid', requires_approval: true,
    approved_at: '2025-06-12T14:30:00Z', payment_method: 'check',
    payment_reference: 'CHK-4521', source_type: 'manual',
  },
  {
    id: 'exp-3', project_id: 'demo-project-1', budget_line_item_id: 'bli-3',
    description: 'Electrical rough-in - All buildings',
    expense_type: 'subcontractor', vendor_name: 'Spark Electric LLC',
    invoice_number: 'SE-2025-0156', amount: 156000, tax_amount: 0,
    total_amount: 156000, expense_date: '2025-08-01', due_date: '2025-09-01',
    paid_date: '2025-08-28', status: 'paid', requires_approval: true,
    approved_at: '2025-08-05T09:00:00Z', payment_method: 'ach',
    payment_reference: 'ACH-82103', source_type: 'manual',
  },
  {
    id: 'exp-4', project_id: 'demo-project-1',
    description: 'Architectural design services - Phase 2 revisions',
    expense_type: 'professional_fees', vendor_name: 'Modern Design Studio',
    invoice_number: 'MDS-2025-034', amount: 22500, tax_amount: 0,
    total_amount: 22500, expense_date: '2025-07-15', due_date: '2025-08-15',
    paid_date: '2025-08-10', status: 'paid', requires_approval: true,
    approved_at: '2025-07-18T11:00:00Z', payment_method: 'wire',
    payment_reference: 'WR-993421', source_type: 'manual',
  },
  {
    id: 'exp-5', project_id: 'demo-project-1',
    description: 'Plumbing rough-in - Buildings A & B',
    expense_type: 'subcontractor', vendor_name: 'Lone Star Plumbing Services',
    invoice_number: 'LSP-2025-0089', amount: 139000, tax_amount: 0,
    total_amount: 139000, expense_date: '2025-09-10', due_date: '2025-10-10',
    paid_date: null, status: 'approved', requires_approval: true,
    approved_at: '2025-09-12T16:00:00Z', approval_notes: 'Approved per contract terms.',
    source_type: 'manual', notes: 'Awaiting lien waiver before payment.',
  },
  {
    id: 'exp-6', project_id: 'demo-project-1',
    description: 'Construction trailer rental - 6 months',
    expense_type: 'equipment', vendor_name: 'WillScot Mobile Mini',
    invoice_number: 'WS-2025-45621', amount: 18000, tax_amount: 1485,
    total_amount: 19485, expense_date: '2025-04-01', due_date: '2025-04-30',
    paid_date: '2025-04-25', status: 'paid', requires_approval: false,
    payment_method: 'credit_card', payment_reference: 'CC-****4521',
    source_type: 'manual',
  },
  {
    id: 'exp-7', project_id: 'demo-project-1',
    description: 'Builder\'s risk insurance policy - Annual',
    expense_type: 'insurance', vendor_name: 'State Farm - Commercial',
    invoice_number: 'SF-POL-2025-8821', amount: 28500, tax_amount: 0,
    total_amount: 28500, expense_date: '2025-03-01', due_date: '2025-03-15',
    paid_date: '2025-03-10', status: 'paid', requires_approval: true,
    approved_at: '2025-03-05T08:00:00Z', payment_method: 'ach',
    payment_reference: 'ACH-71002', source_type: 'manual',
  },
  {
    id: 'exp-8', project_id: 'demo-project-1',
    description: 'Building permit fees - City of Austin',
    expense_type: 'permits', vendor_name: 'City of Austin',
    amount: 41000, tax_amount: 0, total_amount: 41000,
    expense_date: '2025-04-12', due_date: '2025-04-12',
    paid_date: '2025-04-12', status: 'paid', requires_approval: false,
    payment_method: 'check', payment_reference: 'CHK-4488',
    source_type: 'manual',
  },
  {
    id: 'exp-9', project_id: 'demo-project-1',
    description: 'HVAC equipment - 24 mini-split units',
    expense_type: 'materials', vendor_name: 'CoolBreeze Mechanical',
    invoice_number: 'CB-2025-0234', amount: 96000, tax_amount: 7920,
    total_amount: 103920, expense_date: '2025-10-01', due_date: '2025-11-01',
    paid_date: null, status: 'waiting_approval', requires_approval: true,
    source_type: 'manual',
    notes: 'Equipment order. 50% deposit required.',
  },
  {
    id: 'exp-10', project_id: 'demo-project-1',
    description: 'Roofing installation - All buildings',
    expense_type: 'subcontractor', vendor_name: 'Peak Performance Roofing',
    invoice_number: 'PPR-2025-0567', amount: 156000, tax_amount: 0,
    total_amount: 156000, expense_date: '2025-10-15', due_date: '2025-11-15',
    paid_date: null, status: 'waiting_approval', requires_approval: true,
    source_type: 'manual',
  },
  {
    id: 'exp-11', project_id: 'demo-project-1',
    description: 'Landscaping installation',
    expense_type: 'subcontractor', vendor_name: 'Green Valley Landscaping',
    invoice_number: 'GVL-2025-0089', amount: 95000, tax_amount: 0,
    total_amount: 95000, expense_date: '2025-11-01', due_date: '2025-12-01',
    paid_date: null, status: 'pending', requires_approval: true,
    source_type: 'manual',
  },
  {
    id: 'exp-12', project_id: 'demo-project-1',
    description: 'CO #3 - Additional electrical for EV chargers',
    expense_type: 'subcontractor', vendor_name: 'Spark Electric LLC',
    invoice_number: 'SE-CO3-001', amount: 18500, tax_amount: 0,
    total_amount: 18500, expense_date: '2025-09-20', due_date: '2025-10-20',
    paid_date: null, status: 'approved', requires_approval: true,
    approved_at: '2025-09-22T14:00:00Z',
    source_type: 'change_order', source_id: 'co-3',
    notes: 'Created from Change Order #3 approval.',
  },
  {
    id: 'exp-13', project_id: 'demo-project-1',
    description: 'Geotechnical report update',
    expense_type: 'professional_fees', vendor_name: 'Terra Engineering',
    invoice_number: 'TE-2025-0445', amount: 4500, tax_amount: 0,
    total_amount: 4500, expense_date: '2025-06-05', due_date: '2025-07-05',
    paid_date: null, status: 'denied', requires_approval: true,
    denial_reason: 'Duplicate invoice. Already paid under original contract.',
    source_type: 'manual',
  },
  {
    id: 'exp-14', project_id: 'demo-project-1',
    description: 'Temporary power setup',
    expense_type: 'equipment', vendor_name: 'Austin Energy',
    invoice_number: 'AE-TEMP-2025-332', amount: 3200, tax_amount: 0,
    total_amount: 3200, expense_date: '2025-03-15', due_date: '2025-04-15',
    paid_date: '2025-04-10', status: 'paid', requires_approval: false,
    payment_method: 'ach', payment_reference: 'ACH-68901',
    source_type: 'manual',
  },
];

// ─── CRUD Operations ──────────────────────────────────────────────────────────

export async function getProjectExpenses(projectId) {
  if (isDemoMode) {
    return DEMO_EXPENSES.filter(e => e.project_id === projectId);
  }
}

export async function getExpense(expenseId) {
  if (isDemoMode) {
    return DEMO_EXPENSES.find(e => e.id === expenseId) || null;
  }
}

export async function createProjectExpense(projectId, data) {
  if (isDemoMode) {
    const expense = {
      id: `exp-${Date.now()}`,
      project_id: projectId,
      ...data,
      amount: parseFloat(data.amount) || 0,
      tax_amount: parseFloat(data.tax_amount) || 0,
      total_amount: (parseFloat(data.amount) || 0) + (parseFloat(data.tax_amount) || 0),
      status: data.requires_approval !== false ? 'waiting_approval' : 'pending',
      source_type: 'manual',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    DEMO_EXPENSES.push(expense);
    return expense;
  }
}

export async function updateProjectExpense(expenseId, updates) {
  if (isDemoMode) {
    const idx = DEMO_EXPENSES.findIndex(e => e.id === expenseId);
    if (idx === -1) throw new Error('Expense not found');
    DEMO_EXPENSES[idx] = { ...DEMO_EXPENSES[idx], ...updates, updated_at: new Date().toISOString() };
    return DEMO_EXPENSES[idx];
  }
}

export async function deleteProjectExpense(expenseId) {
  if (isDemoMode) {
    const idx = DEMO_EXPENSES.findIndex(e => e.id === expenseId);
    if (idx !== -1) DEMO_EXPENSES.splice(idx, 1);
    return true;
  }
}

// ─── Approval Workflow ────────────────────────────────────────────────────────

export async function approveProjectExpense(expenseId, notes) {
  if (isDemoMode) {
    const idx = DEMO_EXPENSES.findIndex(e => e.id === expenseId);
    if (idx === -1) throw new Error('Expense not found');
    DEMO_EXPENSES[idx] = {
      ...DEMO_EXPENSES[idx],
      status: 'approved',
      approved_at: new Date().toISOString(),
      approval_notes: notes || '',
      updated_at: new Date().toISOString(),
    };
    return DEMO_EXPENSES[idx];
  }
}

export async function denyProjectExpense(expenseId, reason) {
  if (isDemoMode) {
    const idx = DEMO_EXPENSES.findIndex(e => e.id === expenseId);
    if (idx === -1) throw new Error('Expense not found');
    DEMO_EXPENSES[idx] = {
      ...DEMO_EXPENSES[idx],
      status: 'denied',
      denial_reason: reason,
      updated_at: new Date().toISOString(),
    };
    return DEMO_EXPENSES[idx];
  }
}

export async function markProjectExpensePaid(expenseId, paymentMethod, paymentReference, paidDate) {
  if (isDemoMode) {
    const idx = DEMO_EXPENSES.findIndex(e => e.id === expenseId);
    if (idx === -1) throw new Error('Expense not found');
    DEMO_EXPENSES[idx] = {
      ...DEMO_EXPENSES[idx],
      status: 'paid',
      payment_method: paymentMethod,
      payment_reference: paymentReference,
      paid_date: paidDate || new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    };
    return DEMO_EXPENSES[idx];
  }
}
