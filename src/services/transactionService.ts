import { supabase } from '@/lib/supabase';

// Types
export interface Transaction {
  id: string;
  transaction_date: string;
  transaction_type: TransactionType;
  category: string;
  description: string;
  amount: number;
  entity_id?: string;
  project_id?: string;
  vendor_id?: string;
  account_id?: string;
  reference_number?: string;
  payment_method?: PaymentMethod;
  status: TransactionStatus;
  notes?: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
  // Joined data
  entity?: { id: string; name: string; type?: string };
  project?: { id: string; name: string; project_code?: string };
  vendor?: { id: string; first_name: string; last_name: string; company?: string };
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export type TransactionStatus = 'pending' | 'posted' | 'reconciled' | 'void';

export type PaymentMethod = 'check' | 'wire' | 'ach' | 'credit_card' | 'cash' | 'other';

export interface TransactionFilters {
  entity_id?: string;
  project_id?: string;
  transaction_type?: TransactionType;
  status?: TransactionStatus;
  category?: string;
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
}

export interface CreateTransactionData {
  transaction_date: string;
  transaction_type: TransactionType;
  category: string;
  description: string;
  amount: number;
  entity_id?: string;
  project_id?: string;
  vendor_id?: string;
  account_id?: string;
  reference_number?: string;
  payment_method?: PaymentMethod;
  status?: TransactionStatus;
  notes?: string;
}

export interface UpdateTransactionData extends Partial<CreateTransactionData> {}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  byCategory: Record<string, { income: number; expense: number }>;
}

// Mock data for development
const mockTransactions: Transaction[] = [
  {
    id: '1',
    transaction_date: '2024-03-15',
    transaction_type: 'income',
    category: 'Rental Income',
    description: 'March rent payment - Unit 101',
    amount: 2500,
    entity_id: '1',
    project_id: '1',
    status: 'posted',
    payment_method: 'ach',
    created_at: '2024-03-15T10:00:00Z',
    updated_at: '2024-03-15T10:00:00Z',
    entity: { id: '1', name: 'Main Street Holdings LLC' },
    project: { id: '1', name: 'Main Street Apartments', project_code: 'MSA-001' }
  },
  {
    id: '2',
    transaction_date: '2024-03-12',
    transaction_type: 'expense',
    category: 'Materials',
    description: 'Plumbing supplies for Unit 203 repair',
    amount: 450,
    entity_id: '1',
    project_id: '1',
    vendor_id: '3',
    status: 'posted',
    payment_method: 'credit_card',
    created_at: '2024-03-12T14:30:00Z',
    updated_at: '2024-03-12T14:30:00Z',
    entity: { id: '1', name: 'Main Street Holdings LLC' },
    project: { id: '1', name: 'Main Street Apartments', project_code: 'MSA-001' },
    vendor: { id: '3', first_name: 'Mike', last_name: 'Williams', company: 'Premier Builders LLC' }
  },
  {
    id: '3',
    transaction_date: '2024-03-10',
    transaction_type: 'expense',
    category: 'Professional Fees',
    description: 'Legal review - lease agreements',
    amount: 1200,
    entity_id: '2',
    status: 'posted',
    payment_method: 'check',
    reference_number: 'CHK-1045',
    created_at: '2024-03-10T09:00:00Z',
    updated_at: '2024-03-10T09:00:00Z',
    entity: { id: '2', name: 'Oakwood Development Corp' }
  },
  {
    id: '4',
    transaction_date: '2024-03-08',
    transaction_type: 'income',
    category: 'Sale',
    description: 'Property sale - 456 Oak Street',
    amount: 450000,
    entity_id: '2',
    project_id: '2',
    status: 'reconciled',
    payment_method: 'wire',
    created_at: '2024-03-08T11:00:00Z',
    updated_at: '2024-03-08T11:00:00Z',
    entity: { id: '2', name: 'Oakwood Development Corp' },
    project: { id: '2', name: 'Oak Street Renovation', project_code: 'OSR-002' }
  },
  {
    id: '5',
    transaction_date: '2024-03-05',
    transaction_type: 'expense',
    category: 'Insurance',
    description: 'Q2 Property insurance premium',
    amount: 3500,
    entity_id: '1',
    status: 'posted',
    payment_method: 'ach',
    created_at: '2024-03-05T08:00:00Z',
    updated_at: '2024-03-05T08:00:00Z',
    entity: { id: '1', name: 'Main Street Holdings LLC' }
  }
];

/**
 * Transaction Service - TypeScript service for managing financial transactions
 */
export const transactionServiceTs = {
  /**
   * Get all transactions with optional filters
   */
  async getAll(filters: TransactionFilters = {}): Promise<Transaction[]> {
    try {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          entity:entities(id, name, type),
          project:projects(id, name, project_code),
          vendor:contacts(id, first_name, last_name, company)
        `)
        .order('transaction_date', { ascending: false });

      if (filters.entity_id) {
        query = query.eq('entity_id', filters.entity_id);
      }

      if (filters.project_id) {
        query = query.eq('project_id', filters.project_id);
      }

      if (filters.transaction_type) {
        query = query.eq('transaction_type', filters.transaction_type);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.start_date) {
        query = query.gte('transaction_date', filters.start_date);
      }

      if (filters.end_date) {
        query = query.lte('transaction_date', filters.end_date);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Transaction[];
    } catch (error) {
      console.warn('Using mock transaction data:', error);
      return filterMockTransactions(mockTransactions, filters);
    }
  },

  /**
   * Get a single transaction by ID
   */
  async getById(id: string): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          entity:entities(id, name, type),
          project:projects(id, name, project_code),
          vendor:contacts(id, first_name, last_name, company, email, phone)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Transaction;
    } catch (error) {
      console.warn('Using mock transaction data:', error);
      return mockTransactions.find(t => t.id === id) || null;
    }
  },

  /**
   * Create a new transaction
   */
  async create(transactionData: CreateTransactionData): Promise<Transaction> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transactionData,
          amount: parseFloat(String(transactionData.amount)) || 0,
          status: transactionData.status || 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data as Transaction;
    } catch (error) {
      console.warn('Mock create transaction:', error);
      const newTransaction: Transaction = {
        id: String(Date.now()),
        ...transactionData,
        amount: parseFloat(String(transactionData.amount)) || 0,
        status: transactionData.status || 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return newTransaction;
    }
  },

  /**
   * Update an existing transaction
   */
  async update(id: string, transactionData: UpdateTransactionData): Promise<Transaction> {
    try {
      const updateData: Record<string, unknown> = {
        ...transactionData,
        updated_at: new Date().toISOString()
      };

      if (transactionData.amount !== undefined) {
        updateData.amount = parseFloat(String(transactionData.amount)) || 0;
      }

      const { data, error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Transaction;
    } catch (error) {
      console.warn('Mock update transaction:', error);
      const existing = mockTransactions.find(t => t.id === id);
      if (!existing) throw new Error('Transaction not found');
      return {
        ...existing,
        ...transactionData,
        updated_at: new Date().toISOString()
      };
    }
  },

  /**
   * Delete a transaction
   */
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.warn('Mock delete transaction:', error);
      return true;
    }
  },

  /**
   * Get transactions by entity
   */
  async getByEntity(entityId: string): Promise<Transaction[]> {
    return this.getAll({ entity_id: entityId });
  },

  /**
   * Get transactions by project
   */
  async getByProject(projectId: string): Promise<Transaction[]> {
    return this.getAll({ project_id: projectId });
  },

  /**
   * Get transactions by date range
   */
  async getByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    return this.getAll({ start_date: startDate, end_date: endDate });
  },

  /**
   * Get recent transactions
   */
  async getRecent(limit: number = 10): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          entity:entities(id, name),
          project:projects(id, name)
        `)
        .order('transaction_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Transaction[];
    } catch (error) {
      console.warn('Using mock transaction data:', error);
      return mockTransactions.slice(0, limit);
    }
  },

  /**
   * Get summary by entity
   */
  async getSummaryByEntity(entityId: string): Promise<TransactionSummary> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('category, transaction_type, amount')
        .eq('entity_id', entityId);

      if (error) throw error;
      return calculateSummary(data as { category: string; transaction_type: string; amount: number }[]);
    } catch (error) {
      console.warn('Using mock summary data:', error);
      const filtered = mockTransactions.filter(t => t.entity_id === entityId);
      return calculateSummary(filtered.map(t => ({
        category: t.category,
        transaction_type: t.transaction_type,
        amount: t.amount
      })));
    }
  },

  /**
   * Get summary by project
   */
  async getSummaryByProject(projectId: string): Promise<TransactionSummary> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('category, transaction_type, amount')
        .eq('project_id', projectId);

      if (error) throw error;
      return calculateSummary(data as { category: string; transaction_type: string; amount: number }[]);
    } catch (error) {
      console.warn('Using mock summary data:', error);
      const filtered = mockTransactions.filter(t => t.project_id === projectId);
      return calculateSummary(filtered.map(t => ({
        category: t.category,
        transaction_type: t.transaction_type,
        amount: t.amount
      })));
    }
  },

  /**
   * Get income categories
   */
  getIncomeCategories(): string[] {
    return [
      'Sale',
      'Distribution',
      'Rental Income',
      'Interest Income',
      'Management Fees',
      'Other Income'
    ];
  },

  /**
   * Get expense categories
   */
  getExpenseCategories(): string[] {
    return [
      'Materials',
      'Labor',
      'Permits & Fees',
      'Professional Fees',
      'Utilities',
      'Insurance',
      'Property Tax',
      'Marketing',
      'Office Expenses',
      'Travel',
      'Equipment',
      'Maintenance',
      'Interest Expense',
      'Other Expense'
    ];
  },

  /**
   * Get all categories grouped by type
   */
  getCategories(): { income: string[]; expense: string[] } {
    return {
      income: this.getIncomeCategories(),
      expense: this.getExpenseCategories()
    };
  },

  /**
   * Get payment methods
   */
  getPaymentMethods(): { value: PaymentMethod; label: string }[] {
    return [
      { value: 'check', label: 'Check' },
      { value: 'wire', label: 'Wire Transfer' },
      { value: 'ach', label: 'ACH' },
      { value: 'credit_card', label: 'Credit Card' },
      { value: 'cash', label: 'Cash' },
      { value: 'other', label: 'Other' }
    ];
  },

  /**
   * Get transaction statuses
   */
  getStatuses(): { value: TransactionStatus; label: string }[] {
    return [
      { value: 'pending', label: 'Pending' },
      { value: 'posted', label: 'Posted' },
      { value: 'reconciled', label: 'Reconciled' },
      { value: 'void', label: 'Void' }
    ];
  },

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
};

// Helper functions
function filterMockTransactions(transactions: Transaction[], filters: TransactionFilters): Transaction[] {
  let filtered = [...transactions];

  if (filters.entity_id) {
    filtered = filtered.filter(t => t.entity_id === filters.entity_id);
  }

  if (filters.project_id) {
    filtered = filtered.filter(t => t.project_id === filters.project_id);
  }

  if (filters.transaction_type) {
    filtered = filtered.filter(t => t.transaction_type === filters.transaction_type);
  }

  if (filters.status) {
    filtered = filtered.filter(t => t.status === filters.status);
  }

  if (filters.category) {
    filtered = filtered.filter(t => t.category === filters.category);
  }

  if (filters.start_date) {
    filtered = filtered.filter(t => t.transaction_date >= filters.start_date!);
  }

  if (filters.end_date) {
    filtered = filtered.filter(t => t.transaction_date <= filters.end_date!);
  }

  return filtered;
}

function calculateSummary(data: { category: string; transaction_type: string; amount: number }[]): TransactionSummary {
  const summary: TransactionSummary = {
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0,
    byCategory: {}
  };

  data.forEach(t => {
    const amount = parseFloat(String(t.amount)) || 0;

    if (t.transaction_type === 'income') {
      summary.totalIncome += amount;
    } else if (t.transaction_type === 'expense') {
      summary.totalExpenses += amount;
    }

    if (!summary.byCategory[t.category]) {
      summary.byCategory[t.category] = { income: 0, expense: 0 };
    }

    if (t.transaction_type === 'income') {
      summary.byCategory[t.category].income += amount;
    } else if (t.transaction_type === 'expense') {
      summary.byCategory[t.category].expense += amount;
    }
  });

  summary.netIncome = summary.totalIncome - summary.totalExpenses;
  return summary;
}

export default transactionServiceTs;
