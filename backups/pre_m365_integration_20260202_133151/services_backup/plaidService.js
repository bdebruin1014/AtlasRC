// src/services/plaidService.js
// Plaid Bank Integration Service
// Handles bank connections, transaction sync, and account management

import { supabase } from '@/lib/supabase';

// ============================================
// PLAID CONNECTION STATUS
// ============================================

export const PLAID_STATUS = {
  PENDING: 'pending',
  CONNECTED: 'connected',
  ERROR: 'error',
  DISCONNECTED: 'disconnected',
  REQUIRES_REAUTH: 'requires_reauth',
};

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  POSTED: 'posted',
  CANCELLED: 'cancelled',
};

export const MATCH_STATUS = {
  UNMATCHED: 'unmatched',
  MATCHED: 'matched',
  EXCLUDED: 'excluded',
  MANUALLY_ADDED: 'manually_added',
};

// ============================================
// PLAID LINK MANAGEMENT
// ============================================

export const createLinkToken = async (entityId, userId) => {
  // In production, this would call your backend which calls Plaid
  // For now, we'll simulate the response
  const { data, error } = await supabase
    .from('plaid_link_tokens')
    .insert({
      entity_id: entityId,
      user_id: userId,
      token: `link-sandbox-${Date.now()}`, // Placeholder
      expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const exchangePublicToken = async (entityId, publicToken, metadata) => {
  // In production, exchange public token for access token via backend
  // Store connection info
  const { data, error } = await supabase
    .from('plaid_connections')
    .insert({
      entity_id: entityId,
      institution_id: metadata.institution?.institution_id,
      institution_name: metadata.institution?.name,
      status: PLAID_STATUS.CONNECTED,
      accounts: metadata.accounts,
      // access_token would be stored securely on backend
    })
    .select()
    .single();

  if (error) throw error;

  // Create bank accounts for each Plaid account
  for (const account of metadata.accounts || []) {
    await createBankAccountFromPlaid(entityId, data.id, account);
  }

  return data;
};

// ============================================
// PLAID CONNECTIONS
// ============================================

export const getPlaidConnections = async (entityId) => {
  const { data, error } = await supabase
    .from('plaid_connections')
    .select(`
      *,
      bank_accounts:bank_accounts(*)
    `)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getPlaidConnectionById = async (connectionId) => {
  const { data, error } = await supabase
    .from('plaid_connections')
    .select(`
      *,
      bank_accounts:bank_accounts(*)
    `)
    .eq('id', connectionId)
    .single();

  if (error) throw error;
  return data;
};

export const disconnectPlaidConnection = async (connectionId) => {
  const { data, error } = await supabase
    .from('plaid_connections')
    .update({
      status: PLAID_STATUS.DISCONNECTED,
      disconnected_at: new Date().toISOString(),
    })
    .eq('id', connectionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const refreshPlaidConnection = async (connectionId) => {
  // In production, this would trigger a refresh via Plaid API
  const { data, error } = await supabase
    .from('plaid_connections')
    .update({
      last_refresh: new Date().toISOString(),
      status: PLAID_STATUS.CONNECTED,
    })
    .eq('id', connectionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// BANK ACCOUNTS
// ============================================

export const createBankAccountFromPlaid = async (entityId, connectionId, plaidAccount) => {
  const { data, error } = await supabase
    .from('bank_accounts')
    .insert({
      entity_id: entityId,
      plaid_connection_id: connectionId,
      plaid_account_id: plaidAccount.id,
      name: plaidAccount.name,
      official_name: plaidAccount.official_name,
      type: plaidAccount.type,
      subtype: plaidAccount.subtype,
      mask: plaidAccount.mask,
      current_balance: plaidAccount.balances?.current,
      available_balance: plaidAccount.balances?.available,
      currency: plaidAccount.balances?.iso_currency_code || 'USD',
      status: 'active',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getBankAccounts = async (entityId) => {
  const { data, error } = await supabase
    .from('bank_accounts')
    .select(`
      *,
      plaid_connection:plaid_connections(institution_name, status)
    `)
    .eq('entity_id', entityId)
    .eq('status', 'active')
    .order('name');

  if (error) throw error;
  return data;
};

export const updateBankAccountBalance = async (accountId, currentBalance, availableBalance) => {
  const { data, error } = await supabase
    .from('bank_accounts')
    .update({
      current_balance: currentBalance,
      available_balance: availableBalance,
      balance_updated_at: new Date().toISOString(),
    })
    .eq('id', accountId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// BANK TRANSACTIONS (FEED)
// ============================================

export const syncBankTransactions = async (connectionId, startDate, endDate) => {
  // In production, this fetches transactions from Plaid
  // For now, simulate the sync
  const { data: connection } = await supabase
    .from('plaid_connections')
    .select('*, bank_accounts(*)')
    .eq('id', connectionId)
    .single();

  if (!connection) throw new Error('Connection not found');

  // Update last sync time
  await supabase
    .from('plaid_connections')
    .update({ last_sync: new Date().toISOString() })
    .eq('id', connectionId);

  return { synced: true, connection };
};

export const getBankTransactions = async (bankAccountId, filters = {}) => {
  let query = supabase
    .from('bank_transactions')
    .select('*')
    .eq('bank_account_id', bankAccountId)
    .order('date', { ascending: false });

  if (filters.startDate) {
    query = query.gte('date', filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte('date', filters.endDate);
  }
  if (filters.matchStatus) {
    query = query.eq('match_status', filters.matchStatus);
  }
  if (filters.minAmount) {
    query = query.gte('amount', filters.minAmount);
  }
  if (filters.maxAmount) {
    query = query.lte('amount', filters.maxAmount);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getUnmatchedTransactions = async (entityId) => {
  const { data, error } = await supabase
    .from('bank_transactions')
    .select(`
      *,
      bank_account:bank_accounts(name, entity_id)
    `)
    .eq('bank_account.entity_id', entityId)
    .eq('match_status', MATCH_STATUS.UNMATCHED)
    .order('date', { ascending: false });

  if (error) throw error;
  return data;
};

// ============================================
// TRANSACTION MATCHING
// ============================================

export const matchTransactionToBill = async (transactionId, billId) => {
  const { data, error } = await supabase
    .from('bank_transactions')
    .update({
      match_status: MATCH_STATUS.MATCHED,
      matched_bill_id: billId,
      matched_at: new Date().toISOString(),
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
      match_status: MATCH_STATUS.MATCHED,
      matched_invoice_id: invoiceId,
      matched_at: new Date().toISOString(),
    })
    .eq('id', transactionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const excludeTransaction = async (transactionId, reason) => {
  const { data, error } = await supabase
    .from('bank_transactions')
    .update({
      match_status: MATCH_STATUS.EXCLUDED,
      exclude_reason: reason,
    })
    .eq('id', transactionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createTransactionFromBank = async (transactionId, accountId, memo) => {
  // Create a journal entry or expense from a bank transaction
  const { data: bankTxn } = await supabase
    .from('bank_transactions')
    .select('*')
    .eq('id', transactionId)
    .single();

  if (!bankTxn) throw new Error('Transaction not found');

  // Mark as manually added
  const { data, error } = await supabase
    .from('bank_transactions')
    .update({
      match_status: MATCH_STATUS.MANUALLY_ADDED,
      matched_account_id: accountId,
      memo: memo,
      matched_at: new Date().toISOString(),
    })
    .eq('id', transactionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// AUTO-MATCHING RULES
// ============================================

export const getMatchingRules = async (entityId) => {
  const { data, error } = await supabase
    .from('bank_matching_rules')
    .select('*')
    .eq('entity_id', entityId)
    .eq('is_active', true)
    .order('priority');

  if (error) throw error;
  return data;
};

export const createMatchingRule = async (ruleData) => {
  const { data, error } = await supabase
    .from('bank_matching_rules')
    .insert({
      ...ruleData,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateMatchingRule = async (ruleId, updates) => {
  const { data, error } = await supabase
    .from('bank_matching_rules')
    .update(updates)
    .eq('id', ruleId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteMatchingRule = async (ruleId) => {
  const { error } = await supabase
    .from('bank_matching_rules')
    .delete()
    .eq('id', ruleId);

  if (error) throw error;
  return true;
};

export const applyMatchingRules = async (entityId) => {
  const rules = await getMatchingRules(entityId);
  const transactions = await getUnmatchedTransactions(entityId);
  
  let matched = 0;
  
  for (const txn of transactions) {
    for (const rule of rules) {
      if (matchesRule(txn, rule)) {
        await supabase
          .from('bank_transactions')
          .update({
            match_status: MATCH_STATUS.MATCHED,
            matched_account_id: rule.account_id,
            matched_vendor_id: rule.vendor_id,
            matched_by_rule_id: rule.id,
            matched_at: new Date().toISOString(),
          })
          .eq('id', txn.id);
        matched++;
        break; // Stop at first matching rule
      }
    }
  }
  
  return { matched, total: transactions.length };
};

const matchesRule = (transaction, rule) => {
  // Check description pattern
  if (rule.description_contains) {
    if (!transaction.description?.toLowerCase().includes(rule.description_contains.toLowerCase())) {
      return false;
    }
  }
  
  // Check amount range
  if (rule.min_amount && Math.abs(transaction.amount) < rule.min_amount) {
    return false;
  }
  if (rule.max_amount && Math.abs(transaction.amount) > rule.max_amount) {
    return false;
  }
  
  // Check transaction type
  if (rule.transaction_type) {
    const isDebit = transaction.amount < 0;
    if (rule.transaction_type === 'debit' && !isDebit) return false;
    if (rule.transaction_type === 'credit' && isDebit) return false;
  }
  
  return true;
};

// ============================================
// DASHBOARD
// ============================================

export const getBankingDashboard = async (entityId) => {
  const [accounts, connections, unmatched] = await Promise.all([
    getBankAccounts(entityId),
    getPlaidConnections(entityId),
    getUnmatchedTransactions(entityId),
  ]);

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.current_balance || 0), 0);
  const activeConnections = connections.filter(c => c.status === PLAID_STATUS.CONNECTED).length;
  const errorConnections = connections.filter(c => 
    c.status === PLAID_STATUS.ERROR || c.status === PLAID_STATUS.REQUIRES_REAUTH
  ).length;

  return {
    accounts,
    connections,
    totalBalance,
    activeConnections,
    errorConnections,
    unmatchedCount: unmatched?.length || 0,
    unmatchedTransactions: unmatched?.slice(0, 10) || [],
  };
};

export default {
  // Constants
  PLAID_STATUS,
  TRANSACTION_STATUS,
  MATCH_STATUS,
  
  // Link Management
  createLinkToken,
  exchangePublicToken,
  
  // Connections
  getPlaidConnections,
  getPlaidConnectionById,
  disconnectPlaidConnection,
  refreshPlaidConnection,
  
  // Bank Accounts
  createBankAccountFromPlaid,
  getBankAccounts,
  updateBankAccountBalance,
  
  // Transactions
  syncBankTransactions,
  getBankTransactions,
  getUnmatchedTransactions,
  
  // Matching
  matchTransactionToBill,
  matchTransactionToInvoice,
  excludeTransaction,
  createTransactionFromBank,
  
  // Rules
  getMatchingRules,
  createMatchingRule,
  updateMatchingRule,
  deleteMatchingRule,
  applyMatchingRules,
  
  // Dashboard
  getBankingDashboard,
};
