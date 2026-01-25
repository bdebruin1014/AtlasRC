import { supabase, isDemoMode } from '@/lib/supabase';
import { coaTemplateService } from './coaTemplateService';

// Mock accounts for demo mode (keyed by entity ID)
const mockAccountsByEntity = {};

// Generate mock accounts for an entity
function generateMockAccounts(entityId) {
  if (mockAccountsByEntity[entityId]) {
    return mockAccountsByEntity[entityId];
  }

  // Default chart of accounts for demo
  mockAccountsByEntity[entityId] = [
    { id: `${entityId}-1`, entity_id: entityId, account_number: '1000', account_name: 'ASSETS', account_type: 'asset', is_header: true, is_active: true, normal_balance: 'debit', current_balance: 0 },
    { id: `${entityId}-2`, entity_id: entityId, account_number: '1100', account_name: 'Cash and Cash Equivalents', account_type: 'asset', is_header: true, is_active: true, normal_balance: 'debit', current_balance: 125000 },
    { id: `${entityId}-3`, entity_id: entityId, account_number: '1110', account_name: 'Operating Cash', account_type: 'asset', is_header: false, is_active: true, normal_balance: 'debit', current_balance: 100000 },
    { id: `${entityId}-4`, entity_id: entityId, account_number: '1120', account_name: 'Savings Account', account_type: 'asset', is_header: false, is_active: true, normal_balance: 'debit', current_balance: 25000 },
    { id: `${entityId}-5`, entity_id: entityId, account_number: '1200', account_name: 'Accounts Receivable', account_type: 'asset', is_header: false, is_active: true, normal_balance: 'debit', current_balance: 45000 },
    { id: `${entityId}-6`, entity_id: entityId, account_number: '2000', account_name: 'LIABILITIES', account_type: 'liability', is_header: true, is_active: true, normal_balance: 'credit', current_balance: 0 },
    { id: `${entityId}-7`, entity_id: entityId, account_number: '2100', account_name: 'Accounts Payable', account_type: 'liability', is_header: false, is_active: true, normal_balance: 'credit', current_balance: 32000 },
    { id: `${entityId}-8`, entity_id: entityId, account_number: '2200', account_name: 'Notes Payable', account_type: 'liability', is_header: false, is_active: true, normal_balance: 'credit', current_balance: 150000 },
    { id: `${entityId}-9`, entity_id: entityId, account_number: '3000', account_name: 'EQUITY', account_type: 'equity', is_header: true, is_active: true, normal_balance: 'credit', current_balance: 0 },
    { id: `${entityId}-10`, entity_id: entityId, account_number: '3100', account_name: 'Member Capital', account_type: 'equity', is_header: false, is_active: true, normal_balance: 'credit', current_balance: 50000 },
    { id: `${entityId}-11`, entity_id: entityId, account_number: '3200', account_name: 'Retained Earnings', account_type: 'equity', is_header: false, is_active: true, normal_balance: 'credit', current_balance: 38000 },
    { id: `${entityId}-12`, entity_id: entityId, account_number: '4000', account_name: 'REVENUE', account_type: 'revenue', is_header: true, is_active: true, normal_balance: 'credit', current_balance: 0 },
    { id: `${entityId}-13`, entity_id: entityId, account_number: '4100', account_name: 'Sales Revenue', account_type: 'revenue', is_header: false, is_active: true, normal_balance: 'credit', current_balance: 250000 },
    { id: `${entityId}-14`, entity_id: entityId, account_number: '6000', account_name: 'OPERATING EXPENSES', account_type: 'expense', is_header: true, is_active: true, normal_balance: 'debit', current_balance: 0 },
    { id: `${entityId}-15`, entity_id: entityId, account_number: '6100', account_name: 'Professional Services', account_type: 'expense', is_header: false, is_active: true, normal_balance: 'debit', current_balance: 15000 },
    { id: `${entityId}-16`, entity_id: entityId, account_number: '6200', account_name: 'Administrative Expenses', account_type: 'expense', is_header: false, is_active: true, normal_balance: 'debit', current_balance: 8500 },
  ];

  return mockAccountsByEntity[entityId];
}

export const accountService = {
  // Get all accounts for an entity
  async getAll(entityId, options = {}) {
    if (isDemoMode) {
      let accounts = generateMockAccounts(entityId);
      if (options.activeOnly) {
        accounts = accounts.filter(a => a.is_active);
      }
      if (options.accountType) {
        accounts = accounts.filter(a => a.account_type === options.accountType);
      }
      return { data: accounts, error: null };
    }

    let query = supabase
      .from('accounts')
      .select('*')
      .eq('entity_id', entityId)
      .order('account_number');

    if (options.activeOnly) {
      query = query.eq('is_active', true);
    }

    if (options.accountType) {
      query = query.eq('account_type', options.accountType);
    }

    return await query;
  },

  // Get a single account by ID
  async getById(id) {
    if (isDemoMode) {
      for (const entityId in mockAccountsByEntity) {
        const account = mockAccountsByEntity[entityId].find(a => a.id === id);
        if (account) return { data: account, error: null };
      }
      return { data: null, error: 'Not found' };
    }

    return await supabase
      .from('accounts')
      .select('*')
      .eq('id', id)
      .single();
  },

  // Get accounts organized by type for trial balance view
  async getTrialBalance(entityId) {
    const { data: accounts, error } = await this.getAll(entityId, { activeOnly: true });
    if (error) return { data: null, error };

    const organized = {
      assets: accounts.filter(a => a.account_type === 'asset'),
      liabilities: accounts.filter(a => a.account_type === 'liability'),
      equity: accounts.filter(a => a.account_type === 'equity'),
      revenue: accounts.filter(a => a.account_type === 'revenue'),
      cogs: accounts.filter(a => a.account_type === 'cogs'),
      expenses: accounts.filter(a => a.account_type === 'expense'),
      otherIncome: accounts.filter(a => a.account_type === 'other_income'),
      otherExpense: accounts.filter(a => a.account_type === 'other_expense'),
    };

    const totals = {
      totalDebits: accounts.reduce((sum, acc) => {
        if (['asset', 'expense', 'cogs', 'other_expense'].includes(acc.account_type)) {
          return sum + (acc.current_balance || 0);
        }
        return sum;
      }, 0),
      totalCredits: accounts.reduce((sum, acc) => {
        if (['liability', 'equity', 'revenue', 'other_income'].includes(acc.account_type)) {
          return sum + (acc.current_balance || 0);
        }
        return sum;
      }, 0),
    };

    return { data: { accounts: organized, totals }, error: null };
  },

  // Create a new account
  async create(account) {
    if (isDemoMode) {
      const accounts = generateMockAccounts(account.entity_id);
      const newAccount = {
        ...account,
        id: `${account.entity_id}-${Date.now()}`,
        current_balance: account.opening_balance || 0,
        created_at: new Date().toISOString(),
      };
      accounts.push(newAccount);
      return { data: newAccount, error: null };
    }

    return await supabase
      .from('accounts')
      .insert({
        ...account,
        current_balance: account.opening_balance || 0,
      })
      .select()
      .single();
  },

  // Update an account
  async update(id, updates) {
    if (isDemoMode) {
      for (const entityId in mockAccountsByEntity) {
        const index = mockAccountsByEntity[entityId].findIndex(a => a.id === id);
        if (index !== -1) {
          mockAccountsByEntity[entityId][index] = {
            ...mockAccountsByEntity[entityId][index],
            ...updates,
          };
          return { data: mockAccountsByEntity[entityId][index], error: null };
        }
      }
      return { data: null, error: 'Not found' };
    }

    return await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  },

  // Delete an account (soft delete by deactivating)
  async delete(id, hardDelete = false) {
    if (hardDelete) {
      if (isDemoMode) {
        for (const entityId in mockAccountsByEntity) {
          const index = mockAccountsByEntity[entityId].findIndex(a => a.id === id);
          if (index !== -1) {
            mockAccountsByEntity[entityId].splice(index, 1);
            return { error: null };
          }
        }
        return { error: 'Not found' };
      }

      return await supabase
        .from('accounts')
        .delete()
        .eq('id', id);
    }

    // Soft delete - just deactivate
    return await this.update(id, { is_active: false });
  },

  // Initialize CoA for an entity from a template
  async initializeFromTemplate(entityId, templateId) {
    const { data: template, error: templateError } = await coaTemplateService.getById(templateId);
    if (templateError || !template) {
      return { data: null, error: templateError || 'Template not found' };
    }

    if (isDemoMode) {
      const accounts = template.accounts.map((acc, idx) => ({
        id: `${entityId}-${idx + 1}`,
        entity_id: entityId,
        account_number: acc.account_number,
        account_name: acc.account_name,
        account_type: acc.account_type,
        sub_type: acc.sub_type,
        description: acc.description,
        is_header: acc.is_header,
        is_active: true,
        normal_balance: acc.normal_balance,
        opening_balance: 0,
        current_balance: 0,
        display_order: acc.display_order,
        template_account_id: acc.id,
        created_at: new Date().toISOString(),
      }));

      mockAccountsByEntity[entityId] = accounts;
      return { data: accounts, error: null };
    }

    // Build parent account mapping for hierarchical setup
    const accountsToInsert = template.accounts.map(acc => ({
      entity_id: entityId,
      account_number: acc.account_number,
      account_name: acc.account_name,
      account_type: acc.account_type,
      sub_type: acc.sub_type,
      description: acc.description,
      is_header: acc.is_header,
      is_active: true,
      normal_balance: acc.normal_balance,
      opening_balance: 0,
      current_balance: 0,
      display_order: acc.display_order,
      template_account_id: acc.id,
    }));

    const { data: createdAccounts, error: insertError } = await supabase
      .from('accounts')
      .insert(accountsToInsert)
      .select();

    if (insertError) return { data: null, error: insertError };

    // Update parent_account_id based on parent_account_number
    for (const templateAcc of template.accounts) {
      if (templateAcc.parent_account_number) {
        const childAccount = createdAccounts.find(a => a.account_number === templateAcc.account_number);
        const parentAccount = createdAccounts.find(a => a.account_number === templateAcc.parent_account_number);

        if (childAccount && parentAccount) {
          await supabase
            .from('accounts')
            .update({ parent_account_id: parentAccount.id })
            .eq('id', childAccount.id);
        }
      }
    }

    return { data: createdAccounts, error: null };
  },

  // Check if entity has any accounts
  async hasAccounts(entityId) {
    if (isDemoMode) {
      return { data: !!mockAccountsByEntity[entityId]?.length, error: null };
    }

    const { count, error } = await supabase
      .from('accounts')
      .select('*', { count: 'exact', head: true })
      .eq('entity_id', entityId);

    return { data: (count || 0) > 0, error };
  },

  // Get account summary for dashboard
  async getSummary(entityId) {
    const { data: accounts, error } = await this.getAll(entityId, { activeOnly: true });
    if (error) return { data: null, error };

    const summary = {
      totalAssets: accounts
        .filter(a => a.account_type === 'asset' && !a.is_header)
        .reduce((sum, a) => sum + (a.current_balance || 0), 0),
      totalLiabilities: accounts
        .filter(a => a.account_type === 'liability' && !a.is_header)
        .reduce((sum, a) => sum + (a.current_balance || 0), 0),
      totalEquity: accounts
        .filter(a => a.account_type === 'equity' && !a.is_header)
        .reduce((sum, a) => sum + (a.current_balance || 0), 0),
      totalRevenue: accounts
        .filter(a => a.account_type === 'revenue' && !a.is_header)
        .reduce((sum, a) => sum + (a.current_balance || 0), 0),
      totalExpenses: accounts
        .filter(a => ['expense', 'cogs', 'other_expense'].includes(a.account_type) && !a.is_header)
        .reduce((sum, a) => sum + (a.current_balance || 0), 0),
      accountCount: accounts.filter(a => !a.is_header).length,
    };

    summary.netIncome = summary.totalRevenue - summary.totalExpenses;
    summary.netWorth = summary.totalAssets - summary.totalLiabilities;

    return { data: summary, error: null };
  },
};

export default accountService;
