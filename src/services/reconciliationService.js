import { supabase } from '@/lib/supabase';

// ============================================
// RECONCILIATIONS
// ============================================

export const getReconciliations = async (bankAccountId) => {
  const { data, error } = await supabase
    .from('bank_reconciliations')
    .select(`
      *,
      completed_by_user:auth.users(email)
    `)
    .eq('bank_account_id', bankAccountId)
    .order('statement_date', { ascending: false });

  if (error) throw error;
  return data;
};

export const getReconciliation = async (reconciliationId) => {
  const { data, error } = await supabase
    .from('bank_reconciliations')
    .select(`
      *,
      bank_account:bank_accounts(*),
      items:reconciliation_items(
        *,
        transaction:bank_transactions(*)
      )
    `)
    .eq('id', reconciliationId)
    .single();

  if (error) throw error;
  return data;
};

export const getLastReconciliation = async (bankAccountId) => {
  const { data, error } = await supabase
    .from('bank_reconciliations')
    .select('*')
    .eq('bank_account_id', bankAccountId)
    .eq('status', 'completed')
    .order('statement_date', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // Ignore "no rows" error
  return data;
};

export const startReconciliation = async (data) => {
  const {
    bankAccountId,
    entityId,
    statementDate,
    statementEndingBalance,
    periodStartDate,
    periodEndDate
  } = data;

  // Get beginning balance from last reconciliation or 0
  const lastRecon = await getLastReconciliation(bankAccountId);
  const beginningBalance = lastRecon?.statement_ending_balance || 0;

  // Create reconciliation record
  const { data: recon, error } = await supabase
    .from('bank_reconciliations')
    .insert({
      bank_account_id: bankAccountId,
      entity_id: entityId,
      statement_date: statementDate,
      statement_ending_balance: statementEndingBalance,
      period_start_date: periodStartDate,
      period_end_date: periodEndDate,
      beginning_balance: beginningBalance,
      status: 'in_progress'
    })
    .select()
    .single();

  if (error) throw error;

  // Get unreconciled transactions in the period
  const { data: transactions } = await supabase
    .from('bank_transactions')
    .select('id')
    .eq('bank_account_id', bankAccountId)
    .eq('is_reconciled', false)
    .lte('transaction_date', periodEndDate);

  // Create reconciliation items for each transaction
  if (transactions?.length > 0) {
    const items = transactions.map(t => ({
      reconciliation_id: recon.id,
      bank_transaction_id: t.id,
      is_cleared: false
    }));

    await supabase.from('reconciliation_items').insert(items);
  }

  return getReconciliation(recon.id);
};

export const toggleTransactionCleared = async (reconciliationId, transactionId, isCleared) => {
  const { data, error } = await supabase
    .from('reconciliation_items')
    .update({
      is_cleared: isCleared,
      cleared_date: isCleared ? new Date().toISOString().split('T')[0] : null
    })
    .eq('reconciliation_id', reconciliationId)
    .eq('bank_transaction_id', transactionId)
    .select()
    .single();

  if (error) throw error;

  // Recalculate cleared balance
  await updateReconciliationTotals(reconciliationId);

  return data;
};

export const updateReconciliationTotals = async (reconciliationId) => {
  // Get all cleared items
  const { data: items } = await supabase
    .from('reconciliation_items')
    .select(`
      is_cleared,
      transaction:bank_transactions(amount)
    `)
    .eq('reconciliation_id', reconciliationId);

  let totalDeposits = 0;
  let totalWithdrawals = 0;

  items?.forEach(item => {
    if (item.is_cleared && item.transaction) {
      if (item.transaction.amount > 0) {
        totalDeposits += item.transaction.amount;
      } else {
        totalWithdrawals += Math.abs(item.transaction.amount);
      }
    }
  });

  // Get beginning balance
  const { data: recon } = await supabase
    .from('bank_reconciliations')
    .select('beginning_balance')
    .eq('id', reconciliationId)
    .single();

  const clearedBalance = recon.beginning_balance + totalDeposits - totalWithdrawals;

  // Update reconciliation
  const { data, error } = await supabase
    .from('bank_reconciliations')
    .update({
      total_deposits: totalDeposits,
      total_withdrawals: totalWithdrawals,
      cleared_balance: clearedBalance,
      updated_at: new Date().toISOString()
    })
    .eq('id', reconciliationId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const completeReconciliation = async (reconciliationId, userId) => {
  // Get reconciliation to check difference
  const recon = await getReconciliation(reconciliationId);

  if (Math.abs(recon.difference) > 0.01) {
    throw new Error(`Cannot complete reconciliation with difference of ${recon.difference}`);
  }

  // Mark all cleared transactions as reconciled
  const { data: clearedItems } = await supabase
    .from('reconciliation_items')
    .select('bank_transaction_id')
    .eq('reconciliation_id', reconciliationId)
    .eq('is_cleared', true);

  if (clearedItems?.length > 0) {
    const transactionIds = clearedItems.map(i => i.bank_transaction_id);

    await supabase
      .from('bank_transactions')
      .update({
        is_reconciled: true,
        reconciliation_id: reconciliationId,
        reconciled_at: new Date().toISOString()
      })
      .in('id', transactionIds);
  }

  // Complete reconciliation
  const { data, error } = await supabase
    .from('bank_reconciliations')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      completed_by: userId
    })
    .eq('id', reconciliationId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const voidReconciliation = async (reconciliationId) => {
  // Unmark all transactions as reconciled
  const { data: items } = await supabase
    .from('reconciliation_items')
    .select('bank_transaction_id')
    .eq('reconciliation_id', reconciliationId);

  if (items?.length > 0) {
    const transactionIds = items.map(i => i.bank_transaction_id);

    await supabase
      .from('bank_transactions')
      .update({
        is_reconciled: false,
        reconciliation_id: null,
        reconciled_at: null
      })
      .in('id', transactionIds);
  }

  // Void reconciliation
  const { data, error } = await supabase
    .from('bank_reconciliations')
    .update({
      status: 'voided',
      updated_at: new Date().toISOString()
    })
    .eq('id', reconciliationId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const addAdjustingEntry = async (reconciliationId, adjustmentData) => {
  // This would create a journal entry to account for the difference
  // and link it to the reconciliation
  // Implementation depends on your journalEntryService
};

export default {
  getReconciliations,
  getReconciliation,
  getLastReconciliation,
  startReconciliation,
  toggleTransactionCleared,
  updateReconciliationTotals,
  completeReconciliation,
  voidReconciliation,
  addAdjustingEntry
};
