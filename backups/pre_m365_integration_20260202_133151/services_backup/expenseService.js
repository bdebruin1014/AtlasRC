// src/services/expenseService.js
// Expense Management Service
// Track expenses, receipts, reimbursements, and approvals

import { supabase } from '@/lib/supabase';

// ============================================
// CONSTANTS
// ============================================

export const EXPENSE_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REIMBURSED: 'reimbursed',
  VOID: 'void',
};

export const EXPENSE_TYPE = {
  MILEAGE: 'mileage',
  MEALS: 'meals',
  TRAVEL: 'travel',
  SUPPLIES: 'supplies',
  EQUIPMENT: 'equipment',
  PROFESSIONAL: 'professional',
  UTILITIES: 'utilities',
  MARKETING: 'marketing',
  INSURANCE: 'insurance',
  OTHER: 'other',
};

export const PAYMENT_METHOD = {
  COMPANY_CARD: 'company_card',
  PERSONAL_CARD: 'personal_card',
  CASH: 'cash',
  CHECK: 'check',
  ACH: 'ach',
};

// ============================================
// EXPENSE CATEGORIES
// ============================================

export const getExpenseCategories = async (entityId) => {
  const { data, error } = await supabase
    .from('expense_categories')
    .select(`
      *,
      account:chart_of_accounts(id, code, name)
    `)
    .eq('entity_id', entityId)
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data;
};

export const createExpenseCategory = async (categoryData) => {
  const { data, error } = await supabase
    .from('expense_categories')
    .insert({
      ...categoryData,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateExpenseCategory = async (categoryId, updates) => {
  const { data, error } = await supabase
    .from('expense_categories')
    .update(updates)
    .eq('id', categoryId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// EXPENSES
// ============================================

export const getExpenses = async (entityId, filters = {}) => {
  let query = supabase
    .from('expenses')
    .select(`
      *,
      category:expense_categories(id, name, expense_type),
      submitter:user_profiles(id, first_name, last_name),
      project:projects(id, name),
      job:construction_jobs(id, job_number, name),
      vendor:vendors(id, company_name)
    `)
    .eq('entity_id', entityId)
    .order('expense_date', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.category_id) {
    query = query.eq('category_id', filters.category_id);
  }
  if (filters.submitter_id) {
    query = query.eq('submitter_id', filters.submitter_id);
  }
  if (filters.project_id) {
    query = query.eq('project_id', filters.project_id);
  }
  if (filters.job_id) {
    query = query.eq('job_id', filters.job_id);
  }
  if (filters.start_date) {
    query = query.gte('expense_date', filters.start_date);
  }
  if (filters.end_date) {
    query = query.lte('expense_date', filters.end_date);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getExpenseById = async (expenseId) => {
  const { data, error } = await supabase
    .from('expenses')
    .select(`
      *,
      category:expense_categories(id, name, expense_type),
      submitter:user_profiles(id, first_name, last_name, email),
      approver:user_profiles(id, first_name, last_name),
      project:projects(id, name),
      job:construction_jobs(id, job_number, name),
      cost_code:job_cost_codes(id, code, description),
      vendor:vendors(id, company_name),
      receipts:expense_receipts(*)
    `)
    .eq('id', expenseId)
    .single();

  if (error) throw error;
  return data;
};

export const createExpense = async (expenseData) => {
  // Generate expense number
  const { data: lastExpense } = await supabase
    .from('expenses')
    .select('expense_number')
    .eq('entity_id', expenseData.entity_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const nextNumber = lastExpense 
    ? parseInt(lastExpense.expense_number.replace(/\D/g, '')) + 1 
    : 1001;

  const { data, error } = await supabase
    .from('expenses')
    .insert({
      ...expenseData,
      expense_number: `EXP-${nextNumber}`,
      status: EXPENSE_STATUS.DRAFT,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateExpense = async (expenseId, updates) => {
  const { data, error } = await supabase
    .from('expenses')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', expenseId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const submitExpense = async (expenseId) => {
  const { data, error } = await supabase
    .from('expenses')
    .update({
      status: EXPENSE_STATUS.SUBMITTED,
      submitted_at: new Date().toISOString(),
    })
    .eq('id', expenseId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const approveExpense = async (expenseId, approverId, notes = null) => {
  const { data, error } = await supabase
    .from('expenses')
    .update({
      status: EXPENSE_STATUS.APPROVED,
      approved_by: approverId,
      approved_at: new Date().toISOString(),
      approval_notes: notes,
    })
    .eq('id', expenseId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const rejectExpense = async (expenseId, approverId, reason) => {
  const { data, error } = await supabase
    .from('expenses')
    .update({
      status: EXPENSE_STATUS.REJECTED,
      approved_by: approverId,
      approved_at: new Date().toISOString(),
      rejection_reason: reason,
    })
    .eq('id', expenseId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const markExpenseReimbursed = async (expenseId, paymentDetails) => {
  const { data, error } = await supabase
    .from('expenses')
    .update({
      status: EXPENSE_STATUS.REIMBURSED,
      reimbursed_at: new Date().toISOString(),
      reimbursement_method: paymentDetails.method,
      reimbursement_reference: paymentDetails.reference,
    })
    .eq('id', expenseId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteExpense = async (expenseId) => {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId);

  if (error) throw error;
  return true;
};

// ============================================
// RECEIPTS
// ============================================

export const uploadReceipt = async (expenseId, fileData) => {
  // Upload file to storage
  const fileName = `receipts/${expenseId}/${Date.now()}_${fileData.name}`;
  
  const { error: uploadError } = await supabase.storage
    .from('expense-receipts')
    .upload(fileName, fileData.file);

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('expense-receipts')
    .getPublicUrl(fileName);

  // Create receipt record
  const { data, error } = await supabase
    .from('expense_receipts')
    .insert({
      expense_id: expenseId,
      file_name: fileData.name,
      file_url: publicUrl,
      file_type: fileData.type,
      file_size: fileData.size,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getExpenseReceipts = async (expenseId) => {
  const { data, error } = await supabase
    .from('expense_receipts')
    .select('*')
    .eq('expense_id', expenseId)
    .order('created_at');

  if (error) throw error;
  return data;
};

export const deleteReceipt = async (receiptId) => {
  const { data: receipt } = await supabase
    .from('expense_receipts')
    .select('file_url')
    .eq('id', receiptId)
    .single();

  if (receipt?.file_url) {
    // Extract file path from URL and delete from storage
    const filePath = receipt.file_url.split('/').slice(-3).join('/');
    await supabase.storage.from('expense-receipts').remove([filePath]);
  }

  const { error } = await supabase
    .from('expense_receipts')
    .delete()
    .eq('id', receiptId);

  if (error) throw error;
  return true;
};

// ============================================
// EXPENSE REPORTS (Grouped Expenses)
// ============================================

export const getExpenseReports = async (entityId, filters = {}) => {
  let query = supabase
    .from('expense_reports')
    .select(`
      *,
      submitter:user_profiles(id, first_name, last_name),
      expenses:expense_report_items(
        expense:expenses(*)
      )
    `)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.submitter_id) {
    query = query.eq('submitter_id', filters.submitter_id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const createExpenseReport = async (reportData, expenseIds) => {
  // Calculate total from expenses
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount')
    .in('id', expenseIds);

  const totalAmount = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

  // Generate report number
  const { data: lastReport } = await supabase
    .from('expense_reports')
    .select('report_number')
    .eq('entity_id', reportData.entity_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const nextNumber = lastReport 
    ? parseInt(lastReport.report_number.replace(/\D/g, '')) + 1 
    : 1;

  const { data: report, error: reportError } = await supabase
    .from('expense_reports')
    .insert({
      ...reportData,
      report_number: `ER-${nextNumber.toString().padStart(4, '0')}`,
      total_amount: totalAmount,
      expense_count: expenseIds.length,
      status: 'draft',
    })
    .select()
    .single();

  if (reportError) throw reportError;

  // Link expenses to report
  const items = expenseIds.map(expenseId => ({
    report_id: report.id,
    expense_id: expenseId,
  }));

  await supabase.from('expense_report_items').insert(items);

  // Update expense status
  await supabase
    .from('expenses')
    .update({ expense_report_id: report.id })
    .in('id', expenseIds);

  return report;
};

export const submitExpenseReport = async (reportId) => {
  const { data, error } = await supabase
    .from('expense_reports')
    .update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    })
    .eq('id', reportId)
    .select()
    .single();

  if (error) throw error;

  // Update all linked expenses
  const { data: items } = await supabase
    .from('expense_report_items')
    .select('expense_id')
    .eq('report_id', reportId);

  if (items?.length > 0) {
    await supabase
      .from('expenses')
      .update({ status: EXPENSE_STATUS.SUBMITTED })
      .in('id', items.map(i => i.expense_id));
  }

  return data;
};

// ============================================
// MILEAGE TRACKING
// ============================================

export const getMileageRate = async (entityId, date = new Date()) => {
  const { data, error } = await supabase
    .from('mileage_rates')
    .select('*')
    .eq('entity_id', entityId)
    .lte('effective_date', date.toISOString().split('T')[0])
    .order('effective_date', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  
  // Return IRS standard rate if no custom rate set
  return data || { rate_per_mile: 0.67 }; // 2024 IRS rate
};

export const createMileageExpense = async (entityId, mileageData) => {
  const rate = await getMileageRate(entityId, new Date(mileageData.expense_date));
  const amount = mileageData.miles * rate.rate_per_mile;

  return createExpense({
    entity_id: entityId,
    expense_date: mileageData.expense_date,
    description: `Mileage: ${mileageData.from_location} to ${mileageData.to_location}`,
    amount: amount,
    category_id: mileageData.category_id,
    submitter_id: mileageData.submitter_id,
    project_id: mileageData.project_id,
    job_id: mileageData.job_id,
    payment_method: PAYMENT_METHOD.PERSONAL_CARD, // Mileage is always reimbursable
    is_reimbursable: true,
    mileage_miles: mileageData.miles,
    mileage_rate: rate.rate_per_mile,
    mileage_from: mileageData.from_location,
    mileage_to: mileageData.to_location,
    notes: mileageData.notes,
  });
};

// ============================================
// REPORTS & ANALYTICS
// ============================================

export const getExpenseSummary = async (entityId, startDate, endDate) => {
  const { data: expenses } = await supabase
    .from('expenses')
    .select(`
      *,
      category:expense_categories(name, expense_type)
    `)
    .eq('entity_id', entityId)
    .gte('expense_date', startDate)
    .lte('expense_date', endDate)
    .in('status', [EXPENSE_STATUS.APPROVED, EXPENSE_STATUS.REIMBURSED]);

  const summary = {
    total_amount: 0,
    total_count: 0,
    by_category: {},
    by_type: {},
    by_project: {},
    by_submitter: {},
    reimbursable: 0,
    non_reimbursable: 0,
  };

  for (const expense of expenses || []) {
    summary.total_amount += expense.amount || 0;
    summary.total_count++;

    // By category
    const categoryName = expense.category?.name || 'Uncategorized';
    if (!summary.by_category[categoryName]) {
      summary.by_category[categoryName] = { amount: 0, count: 0 };
    }
    summary.by_category[categoryName].amount += expense.amount || 0;
    summary.by_category[categoryName].count++;

    // By type
    const expenseType = expense.category?.expense_type || 'other';
    if (!summary.by_type[expenseType]) {
      summary.by_type[expenseType] = { amount: 0, count: 0 };
    }
    summary.by_type[expenseType].amount += expense.amount || 0;
    summary.by_type[expenseType].count++;

    // Reimbursable tracking
    if (expense.is_reimbursable) {
      summary.reimbursable += expense.amount || 0;
    } else {
      summary.non_reimbursable += expense.amount || 0;
    }
  }

  return summary;
};

export const getExpensesByProject = async (projectId, startDate = null, endDate = null) => {
  let query = supabase
    .from('expenses')
    .select(`
      *,
      category:expense_categories(name)
    `)
    .eq('project_id', projectId)
    .in('status', [EXPENSE_STATUS.APPROVED, EXPENSE_STATUS.REIMBURSED])
    .order('expense_date', { ascending: false });

  if (startDate) query = query.gte('expense_date', startDate);
  if (endDate) query = query.lte('expense_date', endDate);

  const { data, error } = await query;
  if (error) throw error;

  const total = data?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

  return { expenses: data || [], total };
};

export const getExpensesByJob = async (jobId, startDate = null, endDate = null) => {
  let query = supabase
    .from('expenses')
    .select(`
      *,
      category:expense_categories(name),
      cost_code:job_cost_codes(code, description)
    `)
    .eq('job_id', jobId)
    .in('status', [EXPENSE_STATUS.APPROVED, EXPENSE_STATUS.REIMBURSED])
    .order('expense_date', { ascending: false });

  if (startDate) query = query.gte('expense_date', startDate);
  if (endDate) query = query.lte('expense_date', endDate);

  const { data, error } = await query;
  if (error) throw error;

  // Group by cost code
  const byCostCode = {};
  for (const expense of data || []) {
    const code = expense.cost_code?.code || 'Unassigned';
    if (!byCostCode[code]) {
      byCostCode[code] = {
        description: expense.cost_code?.description || 'Unassigned',
        amount: 0,
        count: 0,
      };
    }
    byCostCode[code].amount += expense.amount || 0;
    byCostCode[code].count++;
  }

  const total = data?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

  return { expenses: data || [], total, by_cost_code: byCostCode };
};

// ============================================
// PENDING APPROVALS
// ============================================

export const getPendingApprovals = async (entityId, approverId = null) => {
  let query = supabase
    .from('expenses')
    .select(`
      *,
      category:expense_categories(name),
      submitter:user_profiles(id, first_name, last_name),
      receipts:expense_receipts(id, file_url)
    `)
    .eq('entity_id', entityId)
    .eq('status', EXPENSE_STATUS.SUBMITTED)
    .order('submitted_at');

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const bulkApproveExpenses = async (expenseIds, approverId) => {
  const { data, error } = await supabase
    .from('expenses')
    .update({
      status: EXPENSE_STATUS.APPROVED,
      approved_by: approverId,
      approved_at: new Date().toISOString(),
    })
    .in('id', expenseIds)
    .select();

  if (error) throw error;
  return data;
};

// ============================================
// DASHBOARD
// ============================================

export const getExpenseDashboard = async (entityId) => {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisYear = new Date(now.getFullYear(), 0, 1);

  const [
    pendingApprovals,
    monthSummary,
    yearSummary,
    recentExpenses,
  ] = await Promise.all([
    getPendingApprovals(entityId),
    getExpenseSummary(entityId, thisMonth.toISOString().split('T')[0], now.toISOString().split('T')[0]),
    getExpenseSummary(entityId, thisYear.toISOString().split('T')[0], now.toISOString().split('T')[0]),
    getExpenses(entityId, { status: null }),
  ]);

  return {
    pending_count: pendingApprovals?.length || 0,
    pending_amount: pendingApprovals?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0,
    month_total: monthSummary.total_amount,
    month_count: monthSummary.total_count,
    year_total: yearSummary.total_amount,
    year_count: yearSummary.total_count,
    pending_reimbursement: yearSummary.reimbursable,
    by_category: monthSummary.by_category,
    recent_expenses: recentExpenses?.slice(0, 10) || [],
  };
};

export default {
  // Constants
  EXPENSE_STATUS,
  EXPENSE_TYPE,
  PAYMENT_METHOD,
  
  // Categories
  getExpenseCategories,
  createExpenseCategory,
  updateExpenseCategory,
  
  // Expenses
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  submitExpense,
  approveExpense,
  rejectExpense,
  markExpenseReimbursed,
  deleteExpense,
  
  // Receipts
  uploadReceipt,
  getExpenseReceipts,
  deleteReceipt,
  
  // Reports
  getExpenseReports,
  createExpenseReport,
  submitExpenseReport,
  
  // Mileage
  getMileageRate,
  createMileageExpense,
  
  // Analytics
  getExpenseSummary,
  getExpensesByProject,
  getExpensesByJob,
  
  // Approvals
  getPendingApprovals,
  bulkApproveExpenses,
  
  // Dashboard
  getExpenseDashboard,
};
