// src/services/payrollService.js
// Payroll Manual Entry Service
// Track employee payments, taxes, and generate reports

import { supabase } from '@/lib/supabase';

// ============================================
// CONSTANTS
// ============================================

export const PAY_FREQUENCY = {
  WEEKLY: 'weekly',
  BIWEEKLY: 'biweekly',
  SEMIMONTHLY: 'semimonthly',
  MONTHLY: 'monthly',
};

export const PAY_TYPE = {
  SALARY: 'salary',
  HOURLY: 'hourly',
  COMMISSION: 'commission',
};

export const PAYROLL_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  PAID: 'paid',
  VOID: 'void',
};

export const TAX_TYPE = {
  FEDERAL: 'federal',
  STATE: 'state',
  LOCAL: 'local',
  SOCIAL_SECURITY: 'social_security',
  MEDICARE: 'medicare',
  FUTA: 'futa',
  SUTA: 'suta',
};

// ============================================
// EMPLOYEES
// ============================================

export const getEmployees = async (entityId, filters = {}) => {
  let query = supabase
    .from('employees')
    .select(`
      *,
      contact:contacts(id, first_name, last_name, email)
    `)
    .eq('entity_id', entityId)
    .order('last_name');

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getEmployeeById = async (employeeId) => {
  const { data, error } = await supabase
    .from('employees')
    .select(`
      *,
      contact:contacts(id, first_name, last_name, email, phone, address),
      pay_history:payroll_items(
        id, gross_pay, net_pay, pay_date,
        payroll:payrolls(pay_period_start, pay_period_end)
      )
    `)
    .eq('id', employeeId)
    .single();

  if (error) throw error;
  return data;
};

export const createEmployee = async (employeeData) => {
  const { data, error } = await supabase
    .from('employees')
    .insert({
      ...employeeData,
      status: 'active',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateEmployee = async (employeeId, updates) => {
  const { data, error } = await supabase
    .from('employees')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', employeeId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const terminateEmployee = async (employeeId, terminationDate, reason) => {
  const { data, error } = await supabase
    .from('employees')
    .update({
      status: 'terminated',
      termination_date: terminationDate,
      termination_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq('id', employeeId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// PAYROLL RUNS
// ============================================

export const getPayrolls = async (entityId, filters = {}) => {
  let query = supabase
    .from('payrolls')
    .select(`
      *,
      items:payroll_items(count)
    `)
    .eq('entity_id', entityId)
    .order('pay_date', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.year) {
    query = query.gte('pay_date', `${filters.year}-01-01`)
                 .lte('pay_date', `${filters.year}-12-31`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getPayrollById = async (payrollId) => {
  const { data, error } = await supabase
    .from('payrolls')
    .select(`
      *,
      items:payroll_items(
        *,
        employee:employees(id, first_name, last_name, employee_id)
      )
    `)
    .eq('id', payrollId)
    .single();

  if (error) throw error;
  return data;
};

export const createPayroll = async (payrollData) => {
  // Generate payroll number
  const { data: lastPayroll } = await supabase
    .from('payrolls')
    .select('payroll_number')
    .eq('entity_id', payrollData.entity_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const nextNumber = lastPayroll 
    ? parseInt(lastPayroll.payroll_number.replace(/\D/g, '')) + 1 
    : 1;

  const { data, error } = await supabase
    .from('payrolls')
    .insert({
      ...payrollData,
      payroll_number: `PR-${nextNumber.toString().padStart(4, '0')}`,
      status: PAYROLL_STATUS.DRAFT,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePayroll = async (payrollId, updates) => {
  const { data, error } = await supabase
    .from('payrolls')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payrollId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const approvePayroll = async (payrollId, approverId) => {
  const { data, error } = await supabase
    .from('payrolls')
    .update({
      status: PAYROLL_STATUS.APPROVED,
      approved_by: approverId,
      approved_at: new Date().toISOString(),
    })
    .eq('id', payrollId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const processPayroll = async (payrollId) => {
  const { data, error } = await supabase
    .from('payrolls')
    .update({
      status: PAYROLL_STATUS.PAID,
      processed_at: new Date().toISOString(),
    })
    .eq('id', payrollId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const recalculatePayrollTotals = async (payrollId) => {
  const { data: items } = await supabase
    .from('payroll_items')
    .select('gross_pay, total_deductions, net_pay, employer_taxes')
    .eq('payroll_id', payrollId);

  const totals = items?.reduce((acc, item) => ({
    total_gross: acc.total_gross + (item.gross_pay || 0),
    total_deductions: acc.total_deductions + (item.total_deductions || 0),
    total_net: acc.total_net + (item.net_pay || 0),
    total_employer_taxes: acc.total_employer_taxes + (item.employer_taxes || 0),
  }), { total_gross: 0, total_deductions: 0, total_net: 0, total_employer_taxes: 0 });

  const { data, error } = await supabase
    .from('payrolls')
    .update({
      total_gross: totals.total_gross,
      total_deductions: totals.total_deductions,
      total_net: totals.total_net,
      total_employer_taxes: totals.total_employer_taxes,
      total_cost: totals.total_gross + totals.total_employer_taxes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payrollId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// PAYROLL ITEMS (Employee Pay Stubs)
// ============================================

export const getPayrollItems = async (payrollId) => {
  const { data, error } = await supabase
    .from('payroll_items')
    .select(`
      *,
      employee:employees(id, first_name, last_name, employee_id),
      deductions:payroll_deductions(*),
      taxes:payroll_taxes(*)
    `)
    .eq('payroll_id', payrollId)
    .order('employee(last_name)');

  if (error) throw error;
  return data;
};

export const createPayrollItem = async (itemData) => {
  // Calculate net pay
  const netPay = (itemData.gross_pay || 0) - (itemData.total_deductions || 0);

  const { data, error } = await supabase
    .from('payroll_items')
    .insert({
      ...itemData,
      net_pay: netPay,
    })
    .select()
    .single();

  if (error) throw error;

  // Recalculate payroll totals
  await recalculatePayrollTotals(itemData.payroll_id);

  return data;
};

export const updatePayrollItem = async (itemId, updates) => {
  // Recalculate net pay if gross or deductions changed
  if (updates.gross_pay !== undefined || updates.total_deductions !== undefined) {
    const { data: current } = await supabase
      .from('payroll_items')
      .select('gross_pay, total_deductions')
      .eq('id', itemId)
      .single();

    const grossPay = updates.gross_pay ?? current.gross_pay;
    const totalDeductions = updates.total_deductions ?? current.total_deductions;
    updates.net_pay = grossPay - totalDeductions;
  }

  const { data, error } = await supabase
    .from('payroll_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;

  // Recalculate payroll totals
  await recalculatePayrollTotals(data.payroll_id);

  return data;
};

export const deletePayrollItem = async (itemId) => {
  const { data: item } = await supabase
    .from('payroll_items')
    .select('payroll_id')
    .eq('id', itemId)
    .single();

  const { error } = await supabase
    .from('payroll_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;

  // Recalculate payroll totals
  if (item) {
    await recalculatePayrollTotals(item.payroll_id);
  }

  return true;
};

// ============================================
// PAYROLL CALCULATIONS
// ============================================

export const calculatePayrollItem = async (employeeId, payPeriod, hours = null) => {
  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('id', employeeId)
    .single();

  if (!employee) throw new Error('Employee not found');

  let grossPay = 0;
  let regularHours = 0;
  let overtimeHours = 0;
  let regularPay = 0;
  let overtimePay = 0;

  if (employee.pay_type === PAY_TYPE.SALARY) {
    // Calculate based on pay frequency
    const annualSalary = employee.salary_amount || 0;
    switch (employee.pay_frequency) {
      case PAY_FREQUENCY.WEEKLY:
        grossPay = annualSalary / 52;
        break;
      case PAY_FREQUENCY.BIWEEKLY:
        grossPay = annualSalary / 26;
        break;
      case PAY_FREQUENCY.SEMIMONTHLY:
        grossPay = annualSalary / 24;
        break;
      case PAY_FREQUENCY.MONTHLY:
        grossPay = annualSalary / 12;
        break;
    }
  } else if (employee.pay_type === PAY_TYPE.HOURLY) {
    const hourlyRate = employee.hourly_rate || 0;
    regularHours = Math.min(hours || 0, 40);
    overtimeHours = Math.max((hours || 0) - 40, 0);
    regularPay = regularHours * hourlyRate;
    overtimePay = overtimeHours * hourlyRate * 1.5;
    grossPay = regularPay + overtimePay;
  }

  // Calculate taxes (simplified)
  const federalWithholding = grossPay * 0.22; // Simplified
  const stateWithholding = grossPay * 0.05;
  const socialSecurity = grossPay * 0.062;
  const medicare = grossPay * 0.0145;
  
  const totalEmployeeTaxes = federalWithholding + stateWithholding + socialSecurity + medicare;
  
  // Employer taxes
  const employerSocialSecurity = grossPay * 0.062;
  const employerMedicare = grossPay * 0.0145;
  const futa = Math.min(grossPay, 7000) * 0.006; // Simplified
  const suta = grossPay * 0.027; // Varies by state
  
  const totalEmployerTaxes = employerSocialSecurity + employerMedicare + futa + suta;

  return {
    employee_id: employeeId,
    gross_pay: grossPay,
    regular_hours: regularHours,
    overtime_hours: overtimeHours,
    regular_pay: regularPay,
    overtime_pay: overtimePay,
    federal_withholding: federalWithholding,
    state_withholding: stateWithholding,
    social_security: socialSecurity,
    medicare: medicare,
    total_deductions: totalEmployeeTaxes,
    net_pay: grossPay - totalEmployeeTaxes,
    employer_social_security: employerSocialSecurity,
    employer_medicare: employerMedicare,
    futa: futa,
    suta: suta,
    employer_taxes: totalEmployerTaxes,
  };
};

// ============================================
// PAYROLL REPORTS
// ============================================

export const getPayrollSummaryReport = async (entityId, year) => {
  const { data: payrolls } = await supabase
    .from('payrolls')
    .select(`
      *,
      items:payroll_items(*)
    `)
    .eq('entity_id', entityId)
    .eq('status', PAYROLL_STATUS.PAID)
    .gte('pay_date', `${year}-01-01`)
    .lte('pay_date', `${year}-12-31`)
    .order('pay_date');

  const summary = {
    year,
    total_payrolls: payrolls?.length || 0,
    total_gross: 0,
    total_net: 0,
    total_employer_taxes: 0,
    total_cost: 0,
    by_quarter: {
      Q1: { gross: 0, net: 0, employer_taxes: 0 },
      Q2: { gross: 0, net: 0, employer_taxes: 0 },
      Q3: { gross: 0, net: 0, employer_taxes: 0 },
      Q4: { gross: 0, net: 0, employer_taxes: 0 },
    },
    by_month: {},
  };

  for (const payroll of payrolls || []) {
    const month = new Date(payroll.pay_date).getMonth() + 1;
    const quarter = Math.ceil(month / 3);
    const qKey = `Q${quarter}`;

    summary.total_gross += payroll.total_gross || 0;
    summary.total_net += payroll.total_net || 0;
    summary.total_employer_taxes += payroll.total_employer_taxes || 0;
    summary.total_cost += payroll.total_cost || 0;

    summary.by_quarter[qKey].gross += payroll.total_gross || 0;
    summary.by_quarter[qKey].net += payroll.total_net || 0;
    summary.by_quarter[qKey].employer_taxes += payroll.total_employer_taxes || 0;

    if (!summary.by_month[month]) {
      summary.by_month[month] = { gross: 0, net: 0, employer_taxes: 0 };
    }
    summary.by_month[month].gross += payroll.total_gross || 0;
    summary.by_month[month].net += payroll.total_net || 0;
    summary.by_month[month].employer_taxes += payroll.total_employer_taxes || 0;
  }

  return summary;
};

export const getEmployeePayHistory = async (employeeId, year) => {
  const { data, error } = await supabase
    .from('payroll_items')
    .select(`
      *,
      payroll:payrolls(payroll_number, pay_date, pay_period_start, pay_period_end, status)
    `)
    .eq('employee_id', employeeId)
    .eq('payroll.status', PAYROLL_STATUS.PAID)
    .gte('payroll.pay_date', `${year}-01-01`)
    .lte('payroll.pay_date', `${year}-12-31`)
    .order('payroll(pay_date)', { ascending: false });

  if (error) throw error;

  const ytdTotals = data?.reduce((acc, item) => ({
    gross: acc.gross + (item.gross_pay || 0),
    net: acc.net + (item.net_pay || 0),
    federal: acc.federal + (item.federal_withholding || 0),
    state: acc.state + (item.state_withholding || 0),
    social_security: acc.social_security + (item.social_security || 0),
    medicare: acc.medicare + (item.medicare || 0),
  }), { gross: 0, net: 0, federal: 0, state: 0, social_security: 0, medicare: 0 });

  return {
    items: data || [],
    ytd_totals: ytdTotals,
  };
};

export const generateW2Data = async (entityId, year) => {
  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .eq('entity_id', entityId);

  const w2Data = [];

  for (const employee of employees || []) {
    const payHistory = await getEmployeePayHistory(employee.id, year);
    
    w2Data.push({
      employee_id: employee.id,
      employee_name: `${employee.first_name} ${employee.last_name}`,
      ssn: employee.ssn,
      address: employee.address,
      wages: payHistory.ytd_totals.gross,
      federal_tax: payHistory.ytd_totals.federal,
      social_security_wages: payHistory.ytd_totals.gross,
      social_security_tax: payHistory.ytd_totals.social_security,
      medicare_wages: payHistory.ytd_totals.gross,
      medicare_tax: payHistory.ytd_totals.medicare,
      state_wages: payHistory.ytd_totals.gross,
      state_tax: payHistory.ytd_totals.state,
    });
  }

  return w2Data;
};

// ============================================
// DASHBOARD
// ============================================

export const getPayrollDashboard = async (entityId) => {
  const currentYear = new Date().getFullYear();
  
  const [employees, recentPayrolls, yearSummary] = await Promise.all([
    getEmployees(entityId, { status: 'active' }),
    getPayrolls(entityId, { year: currentYear }),
    getPayrollSummaryReport(entityId, currentYear),
  ]);

  const pendingPayrolls = recentPayrolls?.filter(p => 
    p.status === PAYROLL_STATUS.DRAFT || p.status === PAYROLL_STATUS.PENDING
  ) || [];

  return {
    active_employees: employees?.length || 0,
    pending_payrolls: pendingPayrolls.length,
    ytd_gross: yearSummary.total_gross,
    ytd_employer_cost: yearSummary.total_cost,
    recent_payrolls: recentPayrolls?.slice(0, 5) || [],
    quarterly_summary: yearSummary.by_quarter,
  };
};

export default {
  // Constants
  PAY_FREQUENCY,
  PAY_TYPE,
  PAYROLL_STATUS,
  TAX_TYPE,
  
  // Employees
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  terminateEmployee,
  
  // Payrolls
  getPayrolls,
  getPayrollById,
  createPayroll,
  updatePayroll,
  approvePayroll,
  processPayroll,
  recalculatePayrollTotals,
  
  // Payroll Items
  getPayrollItems,
  createPayrollItem,
  updatePayrollItem,
  deletePayrollItem,
  
  // Calculations
  calculatePayrollItem,
  
  // Reports
  getPayrollSummaryReport,
  getEmployeePayHistory,
  generateW2Data,
  
  // Dashboard
  getPayrollDashboard,
};
