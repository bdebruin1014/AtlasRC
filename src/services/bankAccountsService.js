import { supabase } from '@/lib/supabase';

// ============================================
// BANK ACCOUNTS CRUD
// ============================================

export const getBankAccounts = async (entityId, options = {}) => {
  const { includeInactive = false, accountType = null } = options;

  let query = supabase
    .from('bank_accounts')
    .select(`
      *,
      gl_account:chart_of_accounts(id, account_number, account_name),
      plaid_connection:plaid_connections(id, institution_name, status)
    `)
    .eq('entity_id', entityId)
    .order('is_primary', { ascending: false })
    .order('account_name');

  if (!includeInactive) query = query.eq('is_active', true);
  if (accountType) query = query.eq('account_type', accountType);

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getBankAccount = async (accountId) => {
  const { data, error } = await supabase
    .from('bank_accounts')
    .select(`
      *,
      gl_account:chart_of_accounts(id, account_number, account_name),
      plaid_connection:plaid_connections(*)
    `)
    .eq('id', accountId)
    .single();

  if (error) throw error;
  return data;
};

export const createBankAccount = async (accountData) => {
  const { data, error } = await supabase
    .from('bank_accounts')
    .insert(accountData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateBankAccount = async (accountId, updates) => {
  const { data, error } = await supabase
    .from('bank_accounts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', accountId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteBankAccount = async (accountId) => {
  // Soft delete - just deactivate
  return updateBankAccount(accountId, { is_active: false });
};

export const setPrimaryAccount = async (entityId, accountId) => {
  // Remove primary from all accounts
  await supabase
    .from('bank_accounts')
    .update({ is_primary: false })
    .eq('entity_id', entityId);

  // Set new primary
  return updateBankAccount(accountId, { is_primary: true });
};

// Alias for backward compatibility
export const setDefaultBankAccount = setPrimaryAccount;

// Get account balances for all bank accounts
export const getAccountBalances = async (entityId) => {
  const { data, error } = await supabase
    .from('bank_accounts')
    .select('id, account_name, current_balance, available_balance')
    .eq('entity_id', entityId)
    .eq('is_active', true);

  if (error) throw error;
  return data;
};

// ============================================
// BANK TRANSACTIONS
// ============================================

export const getBankTransactions = async (bankAccountId, options = {}) => {
  const {
    startDate,
    endDate,
    matchStatus,
    isReconciled,
    limit = 100,
    offset = 0
  } = options;

  let query = supabase
    .from('bank_transactions')
    .select(`
      *,
      account:chart_of_accounts(id, account_number, account_name),
      vendor:vendors(id, display_name),
      customer:customers(id, display_name),
      matched_bill:bills(id, bill_number, vendor:vendors(display_name)),
      matched_invoice:invoices(id, invoice_number, customer:customers(display_name)),
      splits:bank_transaction_splits(*)
    `)
    .eq('bank_account_id', bankAccountId)
    .order('transaction_date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (startDate) query = query.gte('transaction_date', startDate);
  if (endDate) query = query.lte('transaction_date', endDate);
  if (matchStatus) query = query.eq('match_status', matchStatus);
  if (isReconciled !== undefined) query = query.eq('is_reconciled', isReconciled);

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getUnreconciledTransactions = async (bankAccountId, asOfDate) => {
  const { data, error } = await supabase
    .from('bank_transactions')
    .select('*')
    .eq('bank_account_id', bankAccountId)
    .eq('is_reconciled', false)
    .lte('transaction_date', asOfDate)
    .order('transaction_date');

  if (error) throw error;
  return data;
};

export const categorizeTransaction = async (transactionId, categoryData) => {
  const { data, error } = await supabase
    .from('bank_transactions')
    .update({
      account_id: categoryData.account_id,
      vendor_id: categoryData.vendor_id,
      customer_id: categoryData.customer_id,
      project_id: categoryData.project_id,
      memo: categoryData.memo,
      is_categorized: true,
      match_status: 'matched',
      updated_at: new Date().toISOString()
    })
    .eq('id', transactionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const matchTransactionToBill = async (transactionId, billId) => {
  const { data, error } = await supabase
    .from('bank_transactions')
    .update({
      matched_bill_id: billId,
      match_status: 'matched',
      is_categorized: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', transactionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const matchTransactionToInvoice = async (transactionId, invoiceId) => {
  const { data, error } = await supabase
    .from('bank_transactions')
    .update({
      matched_invoice_id: invoiceId,
      match_status: 'matched',
      is_categorized: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', transactionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const excludeTransaction = async (transactionId) => {
  const { data, error } = await supabase
    .from('bank_transactions')
    .update({
      match_status: 'excluded',
      updated_at: new Date().toISOString()
    })
    .eq('id', transactionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const splitTransaction = async (transactionId, splits) => {
  // Mark parent as split
  await supabase
    .from('bank_transactions')
    .update({
      is_split: true,
      match_status: 'split',
      is_categorized: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', transactionId);

  // Delete existing splits
  await supabase
    .from('bank_transaction_splits')
    .delete()
    .eq('bank_transaction_id', transactionId);

  // Insert new splits
  const splitRecords = splits.map(s => ({
    bank_transaction_id: transactionId,
    amount: s.amount,
    account_id: s.account_id,
    description: s.description,
    project_id: s.project_id,
    cost_code_id: s.cost_code_id,
    vendor_id: s.vendor_id
  }));

  const { data, error } = await supabase
    .from('bank_transaction_splits')
    .insert(splitRecords)
    .select();

  if (error) throw error;
  return data;
};

// ============================================
// AUTO-MATCHING RULES
// ============================================

export const getMatchingRules = async (entityId) => {
  const { data, error } = await supabase
    .from('bank_matching_rules')
    .select(`
      *,
      account:chart_of_accounts(id, account_number, account_name),
      vendor:vendors(id, display_name)
    `)
    .eq('entity_id', entityId)
    .eq('is_active', true)
    .order('priority');

  if (error) throw error;
  return data;
};

export const createMatchingRule = async (ruleData) => {
  const { data, error } = await supabase
    .from('bank_matching_rules')
    .insert(ruleData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const applyMatchingRules = async (entityId, bankAccountId) => {
  const rules = await getMatchingRules(entityId);
  const { data: transactions } = await supabase
    .from('bank_transactions')
    .select('*')
    .eq('bank_account_id', bankAccountId)
    .eq('is_categorized', false)
    .eq('match_status', 'unmatched');

  let matchedCount = 0;

  for (const txn of transactions || []) {
    for (const rule of rules) {
      if (matchesRule(txn, rule)) {
        await categorizeTransaction(txn.id, {
          account_id: rule.assign_account_id,
          vendor_id: rule.assign_vendor_id,
          customer_id: rule.assign_customer_id,
          project_id: rule.assign_project_id,
          memo: rule.assign_memo
        });

        // Update rule stats
        await supabase
          .from('bank_matching_rules')
          .update({
            times_applied: rule.times_applied + 1,
            last_applied_at: new Date().toISOString()
          })
          .eq('id', rule.id);

        matchedCount++;
        break; // Stop at first matching rule
      }
    }
  }

  return { matched: matchedCount, total: transactions?.length || 0 };
};

const matchesRule = (transaction, rule) => {
  // Description contains
  if (rule.match_description_contains) {
    if (!transaction.description?.toLowerCase().includes(rule.match_description_contains.toLowerCase())) {
      return false;
    }
  }

  // Description exact
  if (rule.match_description_exact) {
    if (transaction.description?.toLowerCase() !== rule.match_description_exact.toLowerCase()) {
      return false;
    }
  }

  // Amount range
  const amount = Math.abs(transaction.amount);
  if (rule.match_amount_min && amount < rule.match_amount_min) return false;
  if (rule.match_amount_max && amount > rule.match_amount_max) return false;
  if (rule.match_amount_exact && amount !== rule.match_amount_exact) return false;

  // Transaction type
  if (rule.match_transaction_type === 'inflow' && transaction.amount < 0) return false;
  if (rule.match_transaction_type === 'outflow' && transaction.amount > 0) return false;

  // Merchant name
  if (rule.match_merchant_name) {
    if (!transaction.plaid_merchant_name?.toLowerCase().includes(rule.match_merchant_name.toLowerCase())) {
      return false;
    }
  }

  return true;
};

export default {
  getBankAccounts,
  getBankAccount,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  setPrimaryAccount,
  setDefaultBankAccount,
  getAccountBalances,
  getBankTransactions,
  getUnreconciledTransactions,
  categorizeTransaction,
  matchTransactionToBill,
  matchTransactionToInvoice,
  excludeTransaction,
  splitTransaction,
  getMatchingRules,
  createMatchingRule,
  applyMatchingRules
};
