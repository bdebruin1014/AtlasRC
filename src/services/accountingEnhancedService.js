// src/services/accountingEnhancedService.js
// Accounting Priority 1 Features:
// - Cash/Accrual accounting engine
// - 1099 vendor tracking
// - Purchase orders
// - AR enhancements (statements, late fees)
// - AP enhancements (discounts, batch payments)

import { supabase } from '@/lib/supabase';

// ============================================
// ACCOUNTING METHOD CONSTANTS
// ============================================

export const ACCOUNTING_METHOD = {
  CASH: 'cash',
  ACCRUAL: 'accrual',
};

export const PAYMENT_TERMS = {
  NET_10: { days: 10, label: 'Net 10' },
  NET_15: { days: 15, label: 'Net 15' },
  NET_30: { days: 30, label: 'Net 30' },
  NET_45: { days: 45, label: 'Net 45' },
  NET_60: { days: 60, label: 'Net 60' },
  NET_90: { days: 90, label: 'Net 90' },
  DUE_ON_RECEIPT: { days: 0, label: 'Due on Receipt' },
  '2_10_NET_30': { days: 30, discount: 2, discountDays: 10, label: '2/10 Net 30' },
  '1_10_NET_30': { days: 30, discount: 1, discountDays: 10, label: '1/10 Net 30' },
};

export const INVOICE_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  VIEWED: 'viewed',
  PARTIAL: 'partial',
  PAID: 'paid',
  OVERDUE: 'overdue',
  VOID: 'void',
};

export const BILL_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  SCHEDULED: 'scheduled',
  PARTIAL: 'partial',
  PAID: 'paid',
  VOID: 'void',
};

// ============================================
// ENTITY ACCOUNTING SETTINGS
// ============================================

export const getEntityAccountingSettings = async (entityId) => {
  const { data, error } = await supabase
    .from('entity_accounting_settings')
    .select('*')
    .eq('entity_id', entityId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  
  // Return defaults if no settings exist
  return data || {
    entity_id: entityId,
    accounting_method: ACCOUNTING_METHOD.ACCRUAL,
    fiscal_year_start_month: 1,
    default_payment_terms: 'NET_30',
    late_fee_enabled: false,
    late_fee_percent: 1.5,
    late_fee_grace_days: 15,
    auto_late_fees: false,
  };
};

export const updateEntityAccountingSettings = async (entityId, settings) => {
  const { data, error } = await supabase
    .from('entity_accounting_settings')
    .upsert({
      entity_id: entityId,
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// CASH VS ACCRUAL REPORTING
// ============================================

export const getIncomeStatement = async (entityId, startDate, endDate, method = null) => {
  // Get entity's accounting method if not specified
  if (!method) {
    const settings = await getEntityAccountingSettings(entityId);
    method = settings.accounting_method;
  }

  let query;
  
  if (method === ACCOUNTING_METHOD.CASH) {
    // Cash basis: Only include transactions when cash changes hands
    query = supabase.rpc('get_income_statement_cash', {
      p_entity_id: entityId,
      p_start_date: startDate,
      p_end_date: endDate,
    });
  } else {
    // Accrual basis: Include when earned/incurred regardless of payment
    query = supabase.rpc('get_income_statement_accrual', {
      p_entity_id: entityId,
      p_start_date: startDate,
      p_end_date: endDate,
    });
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getBalanceSheet = async (entityId, asOfDate, method = null) => {
  if (!method) {
    const settings = await getEntityAccountingSettings(entityId);
    method = settings.accounting_method;
  }

  const { data, error } = await supabase.rpc('get_balance_sheet', {
    p_entity_id: entityId,
    p_as_of_date: asOfDate,
    p_method: method,
  });

  if (error) throw error;
  return data;
};

export const getCashFlowStatement = async (entityId, startDate, endDate) => {
  const { data, error } = await supabase.rpc('get_cash_flow_statement', {
    p_entity_id: entityId,
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (error) throw error;
  return data;
};

// ============================================
// 1099 VENDOR TRACKING
// ============================================

export const get1099Vendors = async (entityId, year = new Date().getFullYear()) => {
  const { data, error } = await supabase
    .from('vendors')
    .select(`
      *,
      payments:vendor_payments(
        amount,
        payment_date,
        check_number
      )
    `)
    .eq('entity_id', entityId)
    .eq('is_1099', true)
    .gte('payments.payment_date', `${year}-01-01`)
    .lte('payments.payment_date', `${year}-12-31`);

  if (error) throw error;

  // Calculate YTD payments for each vendor
  return data.map(vendor => ({
    ...vendor,
    ytd_payments: vendor.payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
    payment_count: vendor.payments?.length || 0,
    needs_1099: vendor.payments?.reduce((sum, p) => sum + (p.amount || 0), 0) >= 600,
  }));
};

export const getVendorById = async (vendorId) => {
  const { data, error } = await supabase
    .from('vendors')
    .select(`
      *,
      contact:contacts(id, first_name, last_name, email, phone)
    `)
    .eq('id', vendorId)
    .single();

  if (error) throw error;
  return data;
};

export const createVendor = async (vendorData) => {
  const { data, error } = await supabase
    .from('vendors')
    .insert({
      ...vendorData,
      status: 'active',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateVendor = async (vendorId, updates) => {
  const { data, error } = await supabase
    .from('vendors')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', vendorId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const generate1099Report = async (entityId, year) => {
  const vendors = await get1099Vendors(entityId, year);
  
  const qualifying = vendors.filter(v => v.needs_1099);
  
  return {
    year,
    entity_id: entityId,
    total_vendors: vendors.length,
    qualifying_vendors: qualifying.length,
    total_payments: qualifying.reduce((sum, v) => sum + v.ytd_payments, 0),
    vendors: qualifying.map(v => ({
      vendor_id: v.id,
      vendor_name: v.company_name || v.name,
      tax_id: v.tax_id,
      address: v.address,
      total_paid: v.ytd_payments,
      payment_count: v.payment_count,
    })),
  };
};

export const export1099Data = async (entityId, year, format = 'csv') => {
  const report = await generate1099Report(entityId, year);
  
  if (format === 'csv') {
    const headers = ['Vendor Name', 'Tax ID', 'Address', 'Total Paid', 'Payment Count'];
    const rows = report.vendors.map(v => [
      v.vendor_name,
      v.tax_id || '',
      v.address || '',
      v.total_paid.toFixed(2),
      v.payment_count,
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
  
  return report;
};

// ============================================
// ACCOUNTS RECEIVABLE ENHANCEMENTS
// ============================================

export const getInvoices = async (entityId, filters = {}) => {
  let query = supabase
    .from('invoices')
    .select(`
      *,
      customer:customers(id, name, email, phone),
      line_items:invoice_line_items(*),
      payments:invoice_payments(*)
    `)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.customer_id) {
    query = query.eq('customer_id', filters.customer_id);
  }
  if (filters.overdue) {
    query = query.lt('due_date', new Date().toISOString().split('T')[0])
                 .not('status', 'in', '("paid","void")');
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getInvoiceById = async (invoiceId) => {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      customer:customers(id, name, email, phone, billing_address),
      line_items:invoice_line_items(*),
      payments:invoice_payments(*),
      late_fees:invoice_late_fees(*)
    `)
    .eq('id', invoiceId)
    .single();

  if (error) throw error;
  return data;
};

export const createInvoice = async (invoiceData) => {
  // Generate invoice number
  const { data: lastInvoice } = await supabase
    .from('invoices')
    .select('invoice_number')
    .eq('entity_id', invoiceData.entity_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const nextNumber = lastInvoice 
    ? parseInt(lastInvoice.invoice_number.replace(/\D/g, '')) + 1 
    : 1001;

  const { data, error } = await supabase
    .from('invoices')
    .insert({
      ...invoiceData,
      invoice_number: `INV-${nextNumber}`,
      status: INVOICE_STATUS.DRAFT,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const applyLateFee = async (invoiceId, amount, description = 'Late Payment Fee') => {
  const { data: invoice } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single();

  if (!invoice) throw new Error('Invoice not found');

  // Create late fee record
  const { data: lateFee, error: feeError } = await supabase
    .from('invoice_late_fees')
    .insert({
      invoice_id: invoiceId,
      amount,
      description,
      applied_date: new Date().toISOString(),
    })
    .select()
    .single();

  if (feeError) throw feeError;

  // Update invoice total
  const { error: updateError } = await supabase
    .from('invoices')
    .update({
      late_fees_total: (invoice.late_fees_total || 0) + amount,
      total_amount: invoice.total_amount + amount,
      balance_due: invoice.balance_due + amount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', invoiceId);

  if (updateError) throw updateError;

  return lateFee;
};

export const processAutoLateFees = async (entityId) => {
  const settings = await getEntityAccountingSettings(entityId);
  
  if (!settings.auto_late_fees || !settings.late_fee_enabled) {
    return { processed: 0 };
  }

  const graceDays = settings.late_fee_grace_days || 15;
  const feePercent = settings.late_fee_percent || 1.5;

  // Find overdue invoices past grace period without recent late fee
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - graceDays);

  const { data: overdueInvoices } = await supabase
    .from('invoices')
    .select(`
      *,
      late_fees:invoice_late_fees(applied_date)
    `)
    .eq('entity_id', entityId)
    .lt('due_date', cutoffDate.toISOString().split('T')[0])
    .gt('balance_due', 0)
    .not('status', 'in', '("paid","void")');

  let processed = 0;
  
  for (const invoice of overdueInvoices || []) {
    // Check if late fee already applied this month
    const thisMonth = new Date().toISOString().slice(0, 7);
    const hasRecentFee = invoice.late_fees?.some(f => 
      f.applied_date?.startsWith(thisMonth)
    );

    if (!hasRecentFee) {
      const feeAmount = invoice.balance_due * (feePercent / 100);
      await applyLateFee(invoice.id, feeAmount);
      processed++;
    }
  }

  return { processed };
};

export const generateStatement = async (customerId, entityId, asOfDate = new Date()) => {
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .single();

  const { data: invoices } = await supabase
    .from('invoices')
    .select(`
      *,
      payments:invoice_payments(*)
    `)
    .eq('entity_id', entityId)
    .eq('customer_id', customerId)
    .gt('balance_due', 0)
    .lte('invoice_date', asOfDate.toISOString().split('T')[0])
    .order('invoice_date', { ascending: true });

  // Calculate aging buckets
  const today = new Date(asOfDate);
  const aging = {
    current: 0,
    days_1_30: 0,
    days_31_60: 0,
    days_61_90: 0,
    over_90: 0,
  };

  invoices?.forEach(inv => {
    const dueDate = new Date(inv.due_date);
    const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
    
    if (daysOverdue <= 0) aging.current += inv.balance_due;
    else if (daysOverdue <= 30) aging.days_1_30 += inv.balance_due;
    else if (daysOverdue <= 60) aging.days_31_60 += inv.balance_due;
    else if (daysOverdue <= 90) aging.days_61_90 += inv.balance_due;
    else aging.over_90 += inv.balance_due;
  });

  return {
    customer,
    statement_date: asOfDate.toISOString().split('T')[0],
    invoices: invoices || [],
    total_due: invoices?.reduce((sum, inv) => sum + inv.balance_due, 0) || 0,
    aging,
  };
};

export const getARAgingReport = async (entityId, asOfDate = new Date()) => {
  const { data: invoices } = await supabase
    .from('invoices')
    .select(`
      *,
      customer:customers(id, name)
    `)
    .eq('entity_id', entityId)
    .gt('balance_due', 0)
    .not('status', 'in', '("paid","void")')
    .order('due_date', { ascending: true });

  const today = new Date(asOfDate);
  const summary = {
    current: 0,
    days_1_30: 0,
    days_31_60: 0,
    days_61_90: 0,
    over_90: 0,
    total: 0,
  };

  const details = invoices?.map(inv => {
    const dueDate = new Date(inv.due_date);
    const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
    
    let bucket;
    if (daysOverdue <= 0) { bucket = 'current'; summary.current += inv.balance_due; }
    else if (daysOverdue <= 30) { bucket = 'days_1_30'; summary.days_1_30 += inv.balance_due; }
    else if (daysOverdue <= 60) { bucket = 'days_31_60'; summary.days_31_60 += inv.balance_due; }
    else if (daysOverdue <= 90) { bucket = 'days_61_90'; summary.days_61_90 += inv.balance_due; }
    else { bucket = 'over_90'; summary.over_90 += inv.balance_due; }
    
    summary.total += inv.balance_due;

    return {
      ...inv,
      days_overdue: Math.max(0, daysOverdue),
      aging_bucket: bucket,
    };
  }) || [];

  return { summary, details };
};

// ============================================
// ACCOUNTS PAYABLE ENHANCEMENTS
// ============================================

export const getBills = async (entityId, filters = {}) => {
  let query = supabase
    .from('bills')
    .select(`
      *,
      vendor:vendors(id, company_name, name, is_1099),
      line_items:bill_line_items(*),
      payments:bill_payments(*)
    `)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.vendor_id) {
    query = query.eq('vendor_id', filters.vendor_id);
  }
  if (filters.due_before) {
    query = query.lte('due_date', filters.due_before);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getBillById = async (billId) => {
  const { data, error } = await supabase
    .from('bills')
    .select(`
      *,
      vendor:vendors(id, company_name, name, is_1099, payment_terms),
      line_items:bill_line_items(*),
      payments:bill_payments(*),
      purchase_order:purchase_orders(id, po_number)
    `)
    .eq('id', billId)
    .single();

  if (error) throw error;
  return data;
};

export const createBill = async (billData) => {
  // Generate bill number
  const { data: lastBill } = await supabase
    .from('bills')
    .select('bill_number')
    .eq('entity_id', billData.entity_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const nextNumber = lastBill 
    ? parseInt(lastBill.bill_number.replace(/\D/g, '')) + 1 
    : 1001;

  // Calculate due date based on payment terms
  let dueDate = billData.due_date;
  if (!dueDate && billData.payment_terms) {
    const terms = PAYMENT_TERMS[billData.payment_terms];
    if (terms) {
      const billDate = new Date(billData.bill_date || new Date());
      billDate.setDate(billDate.getDate() + terms.days);
      dueDate = billDate.toISOString().split('T')[0];
    }
  }

  // Calculate early payment discount date if applicable
  let discountDate = null;
  let discountAmount = 0;
  if (billData.payment_terms) {
    const terms = PAYMENT_TERMS[billData.payment_terms];
    if (terms?.discount) {
      const billDate = new Date(billData.bill_date || new Date());
      billDate.setDate(billDate.getDate() + terms.discountDays);
      discountDate = billDate.toISOString().split('T')[0];
      discountAmount = billData.total_amount * (terms.discount / 100);
    }
  }

  const { data, error } = await supabase
    .from('bills')
    .insert({
      ...billData,
      bill_number: `BILL-${nextNumber}`,
      due_date: dueDate,
      discount_date: discountDate,
      discount_amount: discountAmount,
      status: BILL_STATUS.PENDING,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const approveBill = async (billId, approverId) => {
  const { data, error } = await supabase
    .from('bills')
    .update({
      status: BILL_STATUS.APPROVED,
      approved_by: approverId,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', billId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const scheduleBillPayment = async (billId, scheduledDate) => {
  const { data, error } = await supabase
    .from('bills')
    .update({
      status: BILL_STATUS.SCHEDULED,
      scheduled_payment_date: scheduledDate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', billId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getEarlyPaymentOpportunities = async (entityId) => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('bills')
    .select(`
      *,
      vendor:vendors(id, company_name, name)
    `)
    .eq('entity_id', entityId)
    .eq('status', BILL_STATUS.APPROVED)
    .gt('discount_date', today)
    .gt('discount_amount', 0)
    .order('discount_date', { ascending: true });

  if (error) throw error;
  
  return data?.map(bill => ({
    ...bill,
    savings: bill.discount_amount,
    days_until_discount_expires: Math.ceil(
      (new Date(bill.discount_date) - new Date()) / (1000 * 60 * 60 * 24)
    ),
  })) || [];
};

export const getAPAgingReport = async (entityId, asOfDate = new Date()) => {
  const { data: bills } = await supabase
    .from('bills')
    .select(`
      *,
      vendor:vendors(id, company_name, name)
    `)
    .eq('entity_id', entityId)
    .gt('balance_due', 0)
    .not('status', 'in', '("paid","void")')
    .order('due_date', { ascending: true });

  const today = new Date(asOfDate);
  const summary = {
    current: 0,
    days_1_30: 0,
    days_31_60: 0,
    days_61_90: 0,
    over_90: 0,
    total: 0,
  };

  const details = bills?.map(bill => {
    const dueDate = new Date(bill.due_date);
    const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
    
    let bucket;
    if (daysOverdue <= 0) { bucket = 'current'; summary.current += bill.balance_due; }
    else if (daysOverdue <= 30) { bucket = 'days_1_30'; summary.days_1_30 += bill.balance_due; }
    else if (daysOverdue <= 60) { bucket = 'days_31_60'; summary.days_31_60 += bill.balance_due; }
    else if (daysOverdue <= 90) { bucket = 'days_61_90'; summary.days_61_90 += bill.balance_due; }
    else { bucket = 'over_90'; summary.over_90 += bill.balance_due; }
    
    summary.total += bill.balance_due;

    return {
      ...bill,
      days_overdue: Math.max(0, daysOverdue),
      aging_bucket: bucket,
    };
  }) || [];

  return { summary, details };
};

// ============================================
// BATCH PAYMENTS
// ============================================

export const createPaymentBatch = async (entityId, billIds, paymentDate, bankAccountId) => {
  // Get all bills in the batch
  const { data: bills } = await supabase
    .from('bills')
    .select('*')
    .in('id', billIds)
    .eq('entity_id', entityId);

  if (!bills || bills.length === 0) {
    throw new Error('No valid bills found for batch');
  }

  // Create batch record
  const { data: batch, error: batchError } = await supabase
    .from('payment_batches')
    .insert({
      entity_id: entityId,
      batch_date: paymentDate,
      bank_account_id: bankAccountId,
      total_amount: bills.reduce((sum, b) => sum + b.balance_due, 0),
      bill_count: bills.length,
      status: 'pending',
    })
    .select()
    .single();

  if (batchError) throw batchError;

  // Add bills to batch
  const batchItems = bills.map(bill => ({
    batch_id: batch.id,
    bill_id: bill.id,
    vendor_id: bill.vendor_id,
    amount: bill.balance_due,
    status: 'pending',
  }));

  const { error: itemsError } = await supabase
    .from('payment_batch_items')
    .insert(batchItems);

  if (itemsError) throw itemsError;

  return batch;
};

export const getPaymentBatches = async (entityId, filters = {}) => {
  let query = supabase
    .from('payment_batches')
    .select(`
      *,
      items:payment_batch_items(
        *,
        bill:bills(bill_number, vendor_id),
        vendor:vendors(company_name, name)
      )
    `)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const processPaymentBatch = async (batchId, checkStartNumber = null) => {
  const { data: batch } = await supabase
    .from('payment_batches')
    .select(`
      *,
      items:payment_batch_items(*)
    `)
    .eq('id', batchId)
    .single();

  if (!batch) throw new Error('Batch not found');

  let checkNumber = checkStartNumber;
  
  for (const item of batch.items) {
    // Create payment record
    const { data: payment } = await supabase
      .from('bill_payments')
      .insert({
        bill_id: item.bill_id,
        amount: item.amount,
        payment_date: batch.batch_date,
        payment_method: 'check',
        check_number: checkNumber?.toString(),
        batch_id: batchId,
      })
      .select()
      .single();

    // Update bill status
    await supabase
      .from('bills')
      .update({
        balance_due: 0,
        status: BILL_STATUS.PAID,
        paid_date: batch.batch_date,
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.bill_id);

    // Update batch item
    await supabase
      .from('payment_batch_items')
      .update({
        status: 'processed',
        check_number: checkNumber?.toString(),
        payment_id: payment.id,
      })
      .eq('id', item.id);

    if (checkNumber) checkNumber++;
  }

  // Update batch status
  const { data: updatedBatch } = await supabase
    .from('payment_batches')
    .update({
      status: 'processed',
      processed_at: new Date().toISOString(),
    })
    .eq('id', batchId)
    .select()
    .single();

  return updatedBatch;
};

// ============================================
// PURCHASE ORDERS (ACCOUNTING)
// ============================================

export const getPurchaseOrders = async (entityId, filters = {}) => {
  let query = supabase
    .from('purchase_orders')
    .select(`
      *,
      vendor:contacts(id, first_name, last_name, company),
      bills:bills(id, bill_number, status, total_amount)
    `)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const convertPOToBill = async (poId) => {
  const { data: po } = await supabase
    .from('purchase_orders')
    .select(`
      *,
      items:purchase_order_items(*)
    `)
    .eq('id', poId)
    .single();

  if (!po) throw new Error('Purchase order not found');

  // Create bill from PO
  const billData = {
    entity_id: po.entity_id,
    vendor_id: po.vendor_id,
    bill_date: new Date().toISOString().split('T')[0],
    total_amount: po.total_amount,
    purchase_order_id: po.id,
    memo: `From PO ${po.po_number}`,
  };

  const bill = await createBill(billData);

  // Create bill line items from PO items
  if (po.items?.length > 0) {
    const lineItems = po.items.map((item, index) => ({
      bill_id: bill.id,
      line_number: index + 1,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      amount: item.quantity * item.unit_price,
      account_id: item.account_id,
    }));

    await supabase.from('bill_line_items').insert(lineItems);
  }

  // Update PO status
  await supabase
    .from('purchase_orders')
    .update({
      status: 'received',
      updated_at: new Date().toISOString(),
    })
    .eq('id', poId);

  return bill;
};

// ============================================
// DASHBOARD METRICS
// ============================================

export const getAccountingDashboardMetrics = async (entityId) => {
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [
    arAging,
    apAging,
    earlyPaymentOps,
    { data: recentInvoices },
    { data: recentBills },
  ] = await Promise.all([
    getARAgingReport(entityId),
    getAPAgingReport(entityId),
    getEarlyPaymentOpportunities(entityId),
    supabase
      .from('invoices')
      .select('id, total_amount, status')
      .eq('entity_id', entityId)
      .gte('created_at', thirtyDaysAgo),
    supabase
      .from('bills')
      .select('id, total_amount, status')
      .eq('entity_id', entityId)
      .gte('created_at', thirtyDaysAgo),
  ]);

  return {
    ar: {
      total_outstanding: arAging.summary.total,
      overdue: arAging.summary.days_1_30 + arAging.summary.days_31_60 + 
               arAging.summary.days_61_90 + arAging.summary.over_90,
      invoices_30_days: recentInvoices?.length || 0,
    },
    ap: {
      total_outstanding: apAging.summary.total,
      overdue: apAging.summary.days_1_30 + apAging.summary.days_31_60 + 
               apAging.summary.days_61_90 + apAging.summary.over_90,
      bills_30_days: recentBills?.length || 0,
      early_payment_savings: earlyPaymentOps.reduce((sum, op) => sum + op.savings, 0),
      discount_opportunities: earlyPaymentOps.length,
    },
  };
};

export default {
  // Settings
  getEntityAccountingSettings,
  updateEntityAccountingSettings,
  
  // Reporting
  getIncomeStatement,
  getBalanceSheet,
  getCashFlowStatement,
  
  // 1099
  get1099Vendors,
  getVendorById,
  createVendor,
  updateVendor,
  generate1099Report,
  export1099Data,
  
  // AR
  getInvoices,
  getInvoiceById,
  createInvoice,
  applyLateFee,
  processAutoLateFees,
  generateStatement,
  getARAgingReport,
  
  // AP
  getBills,
  getBillById,
  createBill,
  approveBill,
  scheduleBillPayment,
  getEarlyPaymentOpportunities,
  getAPAgingReport,
  
  // Batch Payments
  createPaymentBatch,
  getPaymentBatches,
  processPaymentBatch,
  
  // Purchase Orders
  getPurchaseOrders,
  convertPOToBill,
  
  // Dashboard
  getAccountingDashboardMetrics,
  
  // Constants
  ACCOUNTING_METHOD,
  PAYMENT_TERMS,
  INVOICE_STATUS,
  BILL_STATUS,
};
