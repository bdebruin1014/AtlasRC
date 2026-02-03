import { supabase } from '@/lib/supabase';

// ============================================
// CHART OF ACCOUNTS CRUD
// ============================================

export const getChartOfAccounts = async (entityId, options = {}) => {
  const { includeInactive = false, accountType = null } = options;

  let query = supabase
    .from('chart_of_accounts')
    .select(`
      *,
      parent:parent_account_id(id, account_number, account_name)
    `)
    .eq('entity_id', entityId)
    .order('account_number');

  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  if (accountType) {
    query = query.eq('account_type', accountType);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getAccount = async (accountId) => {
  const { data, error } = await supabase
    .from('chart_of_accounts')
    .select(`
      *,
      parent:parent_account_id(id, account_number, account_name)
    `)
    .eq('id', accountId)
    .single();

  if (error) throw error;
  return data;
};

export const createAccount = async (accountData) => {
  const { data, error } = await supabase
    .from('chart_of_accounts')
    .insert(accountData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateAccount = async (accountId, updates) => {
  const { data, error } = await supabase
    .from('chart_of_accounts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', accountId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deactivateAccount = async (accountId) => {
  // Check if account has balance
  const balance = await getAccountBalance(accountId);
  if (balance !== 0) {
    throw new Error('Cannot deactivate account with non-zero balance');
  }

  return updateAccount(accountId, { is_active: false });
};

// ============================================
// ACCOUNT BALANCE
// ============================================

export const getAccountBalance = async (accountId, asOfDate = null) => {
  const { data, error } = await supabase
    .rpc('get_account_balance', {
      p_account_id: accountId,
      p_as_of_date: asOfDate || new Date().toISOString().split('T')[0]
    });

  if (error) throw error;
  return data;
};

export const getAccountBalances = async (entityId, asOfDate = null) => {
  const accounts = await getChartOfAccounts(entityId);
  const date = asOfDate || new Date().toISOString().split('T')[0];

  const balances = await Promise.all(
    accounts.map(async (account) => {
      const balance = await getAccountBalance(account.id, date);
      return { ...account, balance };
    })
  );

  return balances.filter(a => a.balance !== 0 || a.is_active);
};

// ============================================
// TEMPLATE INITIALIZATION
// ============================================

export const initializeFromTemplate = async (entityId, templateType) => {
  const { data, error } = await supabase
    .rpc('initialize_coa_from_template', {
      p_entity_id: entityId,
      p_template_type: templateType
    });

  if (error) throw error;
  return data;
};

export const getTemplates = async () => {
  const { data, error } = await supabase
    .from('coa_templates')
    .select('*')
    .eq('is_active', true)
    .order('template_name');

  if (error) throw error;
  return data;
};

// ============================================
// HIERARCHY HELPERS
// ============================================

export const buildAccountTree = (accounts) => {
  const accountMap = new Map(accounts.map(a => [a.id, { ...a, children: [] }]));
  const roots = [];

  accountMap.forEach(account => {
    if (account.parent_account_id) {
      const parent = accountMap.get(account.parent_account_id);
      if (parent) {
        parent.children.push(account);
      } else {
        roots.push(account);
      }
    } else {
      roots.push(account);
    }
  });

  return roots;
};

export const getAccountsByType = (accounts) => {
  const grouped = {
    asset: [],
    liability: [],
    equity: [],
    revenue: [],
    cogs: [],
    expense: [],
    other_income: [],
    other_expense: []
  };

  accounts.forEach(account => {
    if (grouped[account.account_type]) {
      grouped[account.account_type].push(account);
    }
  });

  return grouped;
};

// ============================================
// VALIDATION
// ============================================

export const validateAccountNumber = async (entityId, accountNumber, excludeId = null) => {
  let query = supabase
    .from('chart_of_accounts')
    .select('id')
    .eq('entity_id', entityId)
    .eq('account_number', accountNumber);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data.length === 0;
};

export default {
  getChartOfAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deactivateAccount,
  getAccountBalance,
  getAccountBalances,
  initializeFromTemplate,
  getTemplates,
  buildAccountTree,
  getAccountsByType,
  validateAccountNumber
};
