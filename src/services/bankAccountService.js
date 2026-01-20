// src/services/bankAccountService.js
// Bank Account Management Service

import { supabase, isDemoMode } from '@/lib/supabase';

// Mock data for demo mode
const MOCK_ACCOUNTS = [
  { 
    id: '1', 
    name: 'Operating Account', 
    bank_name: 'Chase Bank', 
    account_number_last4: '8821', 
    account_type: 'checking', 
    book_balance: 245000.50, 
    current_balance: 242150.00, 
    last_reconciled_at: '2025-10-31T00:00:00Z', 
    status: 'active',
    is_default: true,
    created_at: '2023-01-01T00:00:00Z'
  },
  { 
    id: '2', 
    name: 'Payroll Account', 
    bank_name: 'Chase Bank', 
    account_number_last4: '9912', 
    account_type: 'checking', 
    book_balance: 55000.00, 
    current_balance: 55000.00, 
    last_reconciled_at: '2025-10-31T00:00:00Z', 
    status: 'active',
    is_default: false,
    created_at: '2023-01-15T00:00:00Z'
  },
  { 
    id: '3', 
    name: 'Business Savings', 
    bank_name: 'Chase Bank', 
    account_number_last4: '1005', 
    account_type: 'savings', 
    book_balance: 1250000.00, 
    current_balance: 1250000.00, 
    last_reconciled_at: '2025-11-15T00:00:00Z', 
    status: 'active',
    is_default: false,
    created_at: '2023-02-01T00:00:00Z'
  }
];

const MOCK_TRANSACTIONS = [
  { id: 't1', account_id: '1', transaction_date: '2025-12-03', transaction_type: 'deposit', payee: 'Sunset Realty Group', reference_number: 'DEP-1023', amount: 15000.00, balance_after: 245000.50, status: 'pending', memo: 'Unit 202 Down Payment', created_at: '2025-12-03T10:00:00Z' },
  { id: 't2', account_id: '1', transaction_date: '2025-12-02', transaction_type: 'check', payee: 'City Electric', reference_number: 'CHK-1045', amount: -450.25, balance_after: 230000.50, status: 'cleared', memo: 'November Utilities', created_at: '2025-12-02T14:00:00Z' },
  { id: 't3', account_id: '1', transaction_date: '2025-12-01', transaction_type: 'transfer', payee: 'Transfer to Payroll', reference_number: 'TRF-001', amount: -12000.00, balance_after: 230450.75, status: 'cleared', memo: 'Monthly Payroll Funding', created_at: '2025-12-01T09:00:00Z' },
  { id: 't4', account_id: '1', transaction_date: '2025-11-28', transaction_type: 'deposit', payee: 'Wire Transfer - Investor', reference_number: 'W-992', amount: 100000.00, balance_after: 242450.75, status: 'reconciled', memo: 'Capital Call #2', created_at: '2025-11-28T11:00:00Z' },
  { id: 't5', account_id: '1', transaction_date: '2025-11-25', transaction_type: 'expense', payee: 'Home Depot', reference_number: 'CARD-8821', amount: -1240.50, balance_after: 142450.75, status: 'reconciled', memo: 'Site Materials', created_at: '2025-11-25T16:30:00Z' },
];

// ============================================
// BANK ACCOUNTS
// ============================================

export async function getBankAccounts(entityId) {
  if (isDemoMode()) {
    return MOCK_ACCOUNTS;
  }

  const { data, error } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('entity_id', entityId)
    .order('is_default', { ascending: false })
    .order('name');

  if (error) throw error;
  return data;
}

export async function getBankAccountById(accountId) {
  if (isDemoMode()) {
    return MOCK_ACCOUNTS.find(a => a.id === accountId);
  }

  const { data, error } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('id', accountId)
    .single();

  if (error) throw error;
  return data;
}

export async function createBankAccount(accountData) {
  if (isDemoMode()) {
    const newAccount = {
      id: `${Date.now()}`,
      ...accountData,
      book_balance: 0,
      current_balance: 0,
      status: 'active',
      created_at: new Date().toISOString(),
    };
    MOCK_ACCOUNTS.push(newAccount);
    return newAccount;
  }

  const { data, error } = await supabase
    .from('bank_accounts')
    .insert(accountData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBankAccount(accountId, updates) {
  if (isDemoMode()) {
    const index = MOCK_ACCOUNTS.findIndex(a => a.id === accountId);
    if (index !== -1) {
      MOCK_ACCOUNTS[index] = { ...MOCK_ACCOUNTS[index], ...updates };
      return MOCK_ACCOUNTS[index];
    }
    return null;
  }

  const { data, error } = await supabase
    .from('bank_accounts')
    .update(updates)
    .eq('id', accountId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBankAccount(accountId) {
  if (isDemoMode()) {
    const index = MOCK_ACCOUNTS.findIndex(a => a.id === accountId);
    if (index !== -1) {
      MOCK_ACCOUNTS.splice(index, 1);
    }
    return { success: true };
  }

  const { error } = await supabase
    .from('bank_accounts')
    .delete()
    .eq('id', accountId);

  if (error) throw error;
  return { success: true };
}

export async function setDefaultBankAccount(entityId, accountId) {
  if (isDemoMode()) {
    MOCK_ACCOUNTS.forEach(a => {
      a.is_default = a.id === accountId;
    });
    return MOCK_ACCOUNTS.find(a => a.id === accountId);
  }

  // Clear all defaults for this entity
  await supabase
    .from('bank_accounts')
    .update({ is_default: false })
    .eq('entity_id', entityId);

  // Set new default
  const { data, error } = await supabase
    .from('bank_accounts')
    .update({ is_default: true })
    .eq('id', accountId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// BANK TRANSACTIONS
// ============================================

export async function getBankTransactions(accountId, options = {}) {
  if (isDemoMode()) {
    let transactions = MOCK_TRANSACTIONS.filter(t => t.account_id === accountId);
    
    if (options.startDate) {
      transactions = transactions.filter(t => new Date(t.transaction_date) >= new Date(options.startDate));
    }
    if (options.endDate) {
      transactions = transactions.filter(t => new Date(t.transaction_date) <= new Date(options.endDate));
    }
    if (options.status) {
      transactions = transactions.filter(t => t.status === options.status);
    }
    
    return transactions;
  }

  let query = supabase
    .from('bank_transactions')
    .select('*')
    .eq('account_id', accountId)
    .order('transaction_date', { ascending: false });

  if (options.startDate) {
    query = query.gte('transaction_date', options.startDate);
  }
  if (options.endDate) {
    query = query.lte('transaction_date', options.endDate);
  }
  if (options.status) {
    query = query.eq('status', options.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createBankTransaction(transactionData) {
  if (isDemoMode()) {
    const newTransaction = {
      id: `t${Date.now()}`,
      ...transactionData,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    MOCK_TRANSACTIONS.push(newTransaction);
    return newTransaction;
  }

  const { data, error } = await supabase
    .from('bank_transactions')
    .insert(transactionData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBankTransaction(transactionId, updates) {
  if (isDemoMode()) {
    const index = MOCK_TRANSACTIONS.findIndex(t => t.id === transactionId);
    if (index !== -1) {
      MOCK_TRANSACTIONS[index] = { ...MOCK_TRANSACTIONS[index], ...updates };
      return MOCK_TRANSACTIONS[index];
    }
    return null;
  }

  const { data, error } = await supabase
    .from('bank_transactions')
    .update(updates)
    .eq('id', transactionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBankTransaction(transactionId) {
  if (isDemoMode()) {
    const index = MOCK_TRANSACTIONS.findIndex(t => t.id === transactionId);
    if (index !== -1) {
      MOCK_TRANSACTIONS.splice(index, 1);
    }
    return { success: true };
  }

  const { error } = await supabase
    .from('bank_transactions')
    .delete()
    .eq('id', transactionId);

  if (error) throw error;
  return { success: true };
}

// ============================================
// BALANCE CALCULATIONS
// ============================================

export async function calculateAccountBalance(accountId, asOfDate = null) {
  const transactions = await getBankTransactions(accountId);
  
  let balance = 0;
  for (const transaction of transactions) {
    if (!asOfDate || new Date(transaction.transaction_date) <= new Date(asOfDate)) {
      balance += transaction.amount;
    }
  }
  
  return balance;
}

export async function getAccountBalances(entityId) {
  if (isDemoMode()) {
    return {
      total_book_balance: MOCK_ACCOUNTS.reduce((sum, a) => sum + a.book_balance, 0),
      total_current_balance: MOCK_ACCOUNTS.reduce((sum, a) => sum + a.current_balance, 0),
      accounts: MOCK_ACCOUNTS.length,
    };
  }

  const accounts = await getBankAccounts(entityId);
  
  return {
    total_book_balance: accounts.reduce((sum, a) => sum + (a.book_balance || 0), 0),
    total_current_balance: accounts.reduce((sum, a) => sum + (a.current_balance || 0), 0),
    accounts: accounts.length,
  };
}

export default {
  getBankAccounts,
  getBankAccountById,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  setDefaultBankAccount,
  getBankTransactions,
  createBankTransaction,
  updateBankTransaction,
  deleteBankTransaction,
  calculateAccountBalance,
  getAccountBalances,
};
