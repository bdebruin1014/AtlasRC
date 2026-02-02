import { supabase } from '@/lib/supabase';

// Types
export interface Account {
  id: string;
  account_number: string;
  name: string;
  account_type: AccountType;
  parent_account_id?: string;
  description?: string;
  is_active: boolean;
  is_system: boolean;
  normal_balance: 'debit' | 'credit';
  current_balance: number;
  created_at: string;
  updated_at: string;
  // Computed/joined
  children?: Account[];
  full_path?: string;
  depth?: number;
}

export type AccountType = 'asset' | 'liability' | 'equity' | 'income' | 'expense';

export interface AccountFilters {
  account_type?: AccountType;
  is_active?: boolean;
  search?: string;
  parent_account_id?: string | null;
}

export interface CreateAccountData {
  account_number: string;
  name: string;
  account_type: AccountType;
  parent_account_id?: string;
  description?: string;
  is_active?: boolean;
  normal_balance?: 'debit' | 'credit';
}

export interface UpdateAccountData extends Partial<CreateAccountData> {}

export interface AccountHierarchy extends Account {
  children: AccountHierarchy[];
}

// Mock data for development - Standard Chart of Accounts
const mockAccounts: Account[] = [
  // Assets (1000-1999)
  {
    id: '1',
    account_number: '1000',
    name: 'Assets',
    account_type: 'asset',
    is_active: true,
    is_system: true,
    normal_balance: 'debit',
    current_balance: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    account_number: '1100',
    name: 'Cash and Cash Equivalents',
    account_type: 'asset',
    parent_account_id: '1',
    is_active: true,
    is_system: true,
    normal_balance: 'debit',
    current_balance: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    account_number: '1110',
    name: 'Operating Cash',
    account_type: 'asset',
    parent_account_id: '2',
    is_active: true,
    is_system: false,
    normal_balance: 'debit',
    current_balance: 125000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    account_number: '1120',
    name: 'Reserve Account',
    account_type: 'asset',
    parent_account_id: '2',
    is_active: true,
    is_system: false,
    normal_balance: 'debit',
    current_balance: 50000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    account_number: '1200',
    name: 'Accounts Receivable',
    account_type: 'asset',
    parent_account_id: '1',
    is_active: true,
    is_system: true,
    normal_balance: 'debit',
    current_balance: 35000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    account_number: '1500',
    name: 'Fixed Assets',
    account_type: 'asset',
    parent_account_id: '1',
    is_active: true,
    is_system: true,
    normal_balance: 'debit',
    current_balance: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '7',
    account_number: '1510',
    name: 'Land',
    account_type: 'asset',
    parent_account_id: '6',
    is_active: true,
    is_system: false,
    normal_balance: 'debit',
    current_balance: 500000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '8',
    account_number: '1520',
    name: 'Buildings',
    account_type: 'asset',
    parent_account_id: '6',
    is_active: true,
    is_system: false,
    normal_balance: 'debit',
    current_balance: 1200000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  // Liabilities (2000-2999)
  {
    id: '10',
    account_number: '2000',
    name: 'Liabilities',
    account_type: 'liability',
    is_active: true,
    is_system: true,
    normal_balance: 'credit',
    current_balance: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '11',
    account_number: '2100',
    name: 'Accounts Payable',
    account_type: 'liability',
    parent_account_id: '10',
    is_active: true,
    is_system: true,
    normal_balance: 'credit',
    current_balance: 45000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '12',
    account_number: '2200',
    name: 'Notes Payable',
    account_type: 'liability',
    parent_account_id: '10',
    is_active: true,
    is_system: true,
    normal_balance: 'credit',
    current_balance: 750000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  // Equity (3000-3999)
  {
    id: '20',
    account_number: '3000',
    name: 'Equity',
    account_type: 'equity',
    is_active: true,
    is_system: true,
    normal_balance: 'credit',
    current_balance: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '21',
    account_number: '3100',
    name: 'Member Capital',
    account_type: 'equity',
    parent_account_id: '20',
    is_active: true,
    is_system: true,
    normal_balance: 'credit',
    current_balance: 1000000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '22',
    account_number: '3200',
    name: 'Retained Earnings',
    account_type: 'equity',
    parent_account_id: '20',
    is_active: true,
    is_system: true,
    normal_balance: 'credit',
    current_balance: 115000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  // Income (4000-4999)
  {
    id: '30',
    account_number: '4000',
    name: 'Income',
    account_type: 'income',
    is_active: true,
    is_system: true,
    normal_balance: 'credit',
    current_balance: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '31',
    account_number: '4100',
    name: 'Rental Income',
    account_type: 'income',
    parent_account_id: '30',
    is_active: true,
    is_system: false,
    normal_balance: 'credit',
    current_balance: 180000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '32',
    account_number: '4200',
    name: 'Property Sales',
    account_type: 'income',
    parent_account_id: '30',
    is_active: true,
    is_system: false,
    normal_balance: 'credit',
    current_balance: 450000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '33',
    account_number: '4300',
    name: 'Management Fees',
    account_type: 'income',
    parent_account_id: '30',
    is_active: true,
    is_system: false,
    normal_balance: 'credit',
    current_balance: 25000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  // Expenses (5000-5999)
  {
    id: '40',
    account_number: '5000',
    name: 'Expenses',
    account_type: 'expense',
    is_active: true,
    is_system: true,
    normal_balance: 'debit',
    current_balance: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '41',
    account_number: '5100',
    name: 'Property Operations',
    account_type: 'expense',
    parent_account_id: '40',
    is_active: true,
    is_system: false,
    normal_balance: 'debit',
    current_balance: 45000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '42',
    account_number: '5200',
    name: 'Professional Fees',
    account_type: 'expense',
    parent_account_id: '40',
    is_active: true,
    is_system: false,
    normal_balance: 'debit',
    current_balance: 18000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '43',
    account_number: '5300',
    name: 'Insurance',
    account_type: 'expense',
    parent_account_id: '40',
    is_active: true,
    is_system: false,
    normal_balance: 'debit',
    current_balance: 12000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '44',
    account_number: '5400',
    name: 'Property Taxes',
    account_type: 'expense',
    parent_account_id: '40',
    is_active: true,
    is_system: false,
    normal_balance: 'debit',
    current_balance: 28000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '45',
    account_number: '5500',
    name: 'Interest Expense',
    account_type: 'expense',
    parent_account_id: '40',
    is_active: true,
    is_system: false,
    normal_balance: 'debit',
    current_balance: 35000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

/**
 * Account Service - TypeScript service for managing chart of accounts
 */
export const accountService = {
  /**
   * Get all accounts with optional filters
   */
  async getAll(filters: AccountFilters = {}): Promise<Account[]> {
    try {
      let query = supabase
        .from('accounts')
        .select('*')
        .order('account_number', { ascending: true });

      if (filters.account_type) {
        query = query.eq('account_type', filters.account_type);
      }

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      if (filters.parent_account_id !== undefined) {
        if (filters.parent_account_id === null) {
          query = query.is('parent_account_id', null);
        } else {
          query = query.eq('parent_account_id', filters.parent_account_id);
        }
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,account_number.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Account[];
    } catch (error) {
      console.warn('Using mock account data:', error);
      return filterMockAccounts(mockAccounts, filters);
    }
  },

  /**
   * Get a single account by ID
   */
  async getById(id: string): Promise<Account | null> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Account;
    } catch (error) {
      console.warn('Using mock account data:', error);
      return mockAccounts.find(a => a.id === id) || null;
    }
  },

  /**
   * Create a new account
   */
  async create(accountData: CreateAccountData): Promise<Account> {
    try {
      const normalBalance = accountData.normal_balance || getNormalBalance(accountData.account_type);

      const { data, error } = await supabase
        .from('accounts')
        .insert([{
          ...accountData,
          is_active: accountData.is_active ?? true,
          is_system: false,
          normal_balance: normalBalance,
          current_balance: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data as Account;
    } catch (error) {
      console.warn('Mock create account:', error);
      const normalBalance = accountData.normal_balance || getNormalBalance(accountData.account_type);
      const newAccount: Account = {
        id: String(Date.now()),
        ...accountData,
        is_active: accountData.is_active ?? true,
        is_system: false,
        normal_balance: normalBalance,
        current_balance: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return newAccount;
    }
  },

  /**
   * Update an existing account
   */
  async update(id: string, accountData: UpdateAccountData): Promise<Account> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .update({
          ...accountData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Account;
    } catch (error) {
      console.warn('Mock update account:', error);
      const existing = mockAccounts.find(a => a.id === id);
      if (!existing) throw new Error('Account not found');
      return {
        ...existing,
        ...accountData,
        updated_at: new Date().toISOString()
      };
    }
  },

  /**
   * Delete an account
   */
  async delete(id: string): Promise<boolean> {
    try {
      // Check if account has children
      const { data: children } = await supabase
        .from('accounts')
        .select('id')
        .eq('parent_account_id', id);

      if (children && children.length > 0) {
        throw new Error('Cannot delete account with child accounts');
      }

      // Check if account is a system account
      const { data: account } = await supabase
        .from('accounts')
        .select('is_system')
        .eq('id', id)
        .single();

      if (account?.is_system) {
        throw new Error('Cannot delete system account');
      }

      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.warn('Mock delete account:', error);
      const account = mockAccounts.find(a => a.id === id);
      if (account?.is_system) {
        throw new Error('Cannot delete system account');
      }
      const hasChildren = mockAccounts.some(a => a.parent_account_id === id);
      if (hasChildren) {
        throw new Error('Cannot delete account with child accounts');
      }
      return true;
    }
  },

  /**
   * Get account hierarchy as a tree structure
   */
  async getHierarchy(): Promise<AccountHierarchy[]> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('is_active', true)
        .order('account_number', { ascending: true });

      if (error) throw error;
      return buildAccountTree(data as Account[]);
    } catch (error) {
      console.warn('Using mock account hierarchy:', error);
      return buildAccountTree(mockAccounts.filter(a => a.is_active));
    }
  },

  /**
   * Get top-level accounts (no parent)
   */
  async getTopLevel(): Promise<Account[]> {
    return this.getAll({ parent_account_id: null });
  },

  /**
   * Get child accounts of a parent
   */
  async getChildren(parentId: string): Promise<Account[]> {
    return this.getAll({ parent_account_id: parentId });
  },

  /**
   * Get accounts by type
   */
  async getByType(type: AccountType): Promise<Account[]> {
    return this.getAll({ account_type: type });
  },

  /**
   * Get account path (breadcrumb from root to account)
   */
  async getPath(accountId: string): Promise<Account[]> {
    try {
      const allAccounts = await this.getAll();
      const path: Account[] = [];
      let currentId: string | undefined = accountId;

      while (currentId) {
        const account = allAccounts.find(a => a.id === currentId);
        if (account) {
          path.unshift(account);
          currentId = account.parent_account_id;
        } else {
          break;
        }
      }

      return path;
    } catch (error) {
      console.warn('Error getting account path:', error);
      return [];
    }
  },

  /**
   * Check if account can be deleted
   */
  async canDelete(accountId: string): Promise<{ canDelete: boolean; reason?: string }> {
    try {
      const account = await this.getById(accountId);
      if (!account) {
        return { canDelete: false, reason: 'Account not found' };
      }

      if (account.is_system) {
        return { canDelete: false, reason: 'System accounts cannot be deleted' };
      }

      const children = await this.getChildren(accountId);
      if (children.length > 0) {
        return { canDelete: false, reason: 'Account has child accounts' };
      }

      if (account.current_balance !== 0) {
        return { canDelete: false, reason: 'Account has a non-zero balance' };
      }

      return { canDelete: true };
    } catch (error) {
      console.warn('Error checking delete eligibility:', error);
      return { canDelete: false, reason: 'Error checking account' };
    }
  },

  /**
   * Get account types
   */
  getAccountTypes(): { value: AccountType; label: string; description: string }[] {
    return [
      { value: 'asset', label: 'Asset', description: 'Things you own (cash, property, equipment)' },
      { value: 'liability', label: 'Liability', description: 'Things you owe (loans, accounts payable)' },
      { value: 'equity', label: 'Equity', description: 'Owner investment and retained earnings' },
      { value: 'income', label: 'Income', description: 'Revenue and other income' },
      { value: 'expense', label: 'Expense', description: 'Operating costs and expenses' }
    ];
  },

  /**
   * Get account number ranges by type
   */
  getAccountNumberRanges(): Record<AccountType, { start: number; end: number }> {
    return {
      asset: { start: 1000, end: 1999 },
      liability: { start: 2000, end: 2999 },
      equity: { start: 3000, end: 3999 },
      income: { start: 4000, end: 4999 },
      expense: { start: 5000, end: 5999 }
    };
  },

  /**
   * Suggest next account number for a type
   */
  async suggestAccountNumber(type: AccountType, parentId?: string): Promise<string> {
    try {
      const accounts = await this.getAll({ account_type: type });
      const ranges = this.getAccountNumberRanges();
      const range = ranges[type];

      if (parentId) {
        const parent = accounts.find(a => a.id === parentId);
        if (parent) {
          const children = accounts.filter(a => a.parent_account_id === parentId);
          const parentNum = parseInt(parent.account_number);
          const childNums = children.map(c => parseInt(c.account_number)).filter(n => !isNaN(n));
          const maxChild = childNums.length > 0 ? Math.max(...childNums) : parentNum;
          return String(maxChild + 10);
        }
      }

      const typeAccounts = accounts.filter(a => !a.parent_account_id);
      const nums = typeAccounts.map(a => parseInt(a.account_number)).filter(n => !isNaN(n));
      const maxNum = nums.length > 0 ? Math.max(...nums) : range.start - 100;
      return String(Math.min(maxNum + 100, range.end));
    } catch (error) {
      const ranges = this.getAccountNumberRanges();
      return String(ranges[type].start);
    }
  },

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  },

  /**
   * Get total balance by account type
   */
  async getBalancesByType(): Promise<Record<AccountType, number>> {
    try {
      const accounts = await this.getAll({ is_active: true });
      const balances: Record<AccountType, number> = {
        asset: 0,
        liability: 0,
        equity: 0,
        income: 0,
        expense: 0
      };

      // Only count leaf accounts (no children) to avoid double counting
      const accountIds = new Set(accounts.map(a => a.id));
      const parentIds = new Set(accounts.map(a => a.parent_account_id).filter(Boolean));
      const leafAccounts = accounts.filter(a => !parentIds.has(a.id));

      leafAccounts.forEach(account => {
        balances[account.account_type] += account.current_balance;
      });

      return balances;
    } catch (error) {
      console.warn('Error getting balances by type:', error);
      return { asset: 0, liability: 0, equity: 0, income: 0, expense: 0 };
    }
  }
};

// Helper functions
function filterMockAccounts(accounts: Account[], filters: AccountFilters): Account[] {
  let filtered = [...accounts];

  if (filters.account_type) {
    filtered = filtered.filter(a => a.account_type === filters.account_type);
  }

  if (filters.is_active !== undefined) {
    filtered = filtered.filter(a => a.is_active === filters.is_active);
  }

  if (filters.parent_account_id !== undefined) {
    if (filters.parent_account_id === null) {
      filtered = filtered.filter(a => !a.parent_account_id);
    } else {
      filtered = filtered.filter(a => a.parent_account_id === filters.parent_account_id);
    }
  }

  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(a =>
      a.name.toLowerCase().includes(search) ||
      a.account_number.includes(search)
    );
  }

  return filtered;
}

function buildAccountTree(accounts: Account[], parentId: string | null = null): AccountHierarchy[] {
  return accounts
    .filter(a => (a.parent_account_id || null) === parentId)
    .map(account => ({
      ...account,
      children: buildAccountTree(accounts, account.id)
    }));
}

function getNormalBalance(accountType: AccountType): 'debit' | 'credit' {
  switch (accountType) {
    case 'asset':
    case 'expense':
      return 'debit';
    case 'liability':
    case 'equity':
    case 'income':
      return 'credit';
  }
}

export default accountService;
