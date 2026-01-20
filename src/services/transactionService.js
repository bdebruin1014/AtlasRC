import { supabase } from '@/lib/supabase';

/**
 * Transaction Service - Handles all Supabase operations for accounting transactions
 */

export const transactionService = {
  /**
   * Get all transactions with entity, project, and vendor names joined
   */
  async getAll() {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        entity:entities(id, name),
        project:projects(id, name, project_code),
        vendor:contacts(id, first_name, last_name, company)
      `)
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get a single transaction by ID with full details
   */
  async getById(id) {
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
    return data;
  },

  /**
   * Create a new transaction
   */
  async create(transactionData) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        ...transactionData,
        amount: parseFloat(transactionData.amount) || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing transaction
   */
  async update(id, transactionData) {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        ...transactionData,
        amount: parseFloat(transactionData.amount) || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a transaction
   */
  async delete(id) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  /**
   * Get transactions by entity
   */
  async getByEntity(entityId) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        project:projects(id, name),
        vendor:contacts(id, first_name, last_name, company)
      `)
      .eq('entity_id', entityId)
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get transactions by project
   */
  async getByProject(projectId) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        entity:entities(id, name),
        vendor:contacts(id, first_name, last_name, company)
      `)
      .eq('project_id', projectId)
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get transactions by date range
   */
  async getByDateRange(startDate, endDate) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        entity:entities(id, name),
        project:projects(id, name)
      `)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get transactions by type (income/expense)
   */
  async getByType(type) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        entity:entities(id, name),
        project:projects(id, name)
      `)
      .eq('transaction_type', type)
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get summary totals by category for an entity
   */
  async getSummaryByEntity(entityId) {
    const { data, error } = await supabase
      .from('transactions')
      .select('category, transaction_type, amount')
      .eq('entity_id', entityId);

    if (error) throw error;

    const summary = {
      totalIncome: 0,
      totalExpenses: 0,
      netIncome: 0,
      byCategory: {}
    };

    data.forEach(t => {
      const amount = parseFloat(t.amount) || 0;
      
      if (t.transaction_type === 'income') {
        summary.totalIncome += amount;
      } else {
        summary.totalExpenses += amount;
      }

      if (!summary.byCategory[t.category]) {
        summary.byCategory[t.category] = { income: 0, expense: 0 };
      }
      
      if (t.transaction_type === 'income') {
        summary.byCategory[t.category].income += amount;
      } else {
        summary.byCategory[t.category].expense += amount;
      }
    });

    summary.netIncome = summary.totalIncome - summary.totalExpenses;
    return summary;
  },

  /**
   * Get summary totals by category for a project
   */
  async getSummaryByProject(projectId) {
    const { data, error } = await supabase
      .from('transactions')
      .select('category, transaction_type, amount')
      .eq('project_id', projectId);

    if (error) throw error;

    const summary = {
      totalIncome: 0,
      totalExpenses: 0,
      netIncome: 0,
      byCategory: {}
    };

    data.forEach(t => {
      const amount = parseFloat(t.amount) || 0;
      
      if (t.transaction_type === 'income') {
        summary.totalIncome += amount;
      } else {
        summary.totalExpenses += amount;
      }

      if (!summary.byCategory[t.category]) {
        summary.byCategory[t.category] = { income: 0, expense: 0 };
      }
      
      if (t.transaction_type === 'income') {
        summary.byCategory[t.category].income += amount;
      } else {
        summary.byCategory[t.category].expense += amount;
      }
    });

    summary.netIncome = summary.totalIncome - summary.totalExpenses;
    return summary;
  },

  /**
   * Get recent transactions (last N)
   */
  async getRecent(limit = 10) {
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
    return data;
  },

  /**
   * Get transaction categories
   */
  getCategories() {
    return {
      income: [
        'Sale',
        'Distribution',
        'Rental Income',
        'Interest Income',
        'Other Income'
      ],
      expense: [
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
        'Other Expense'
      ]
    };
  }
};

export default transactionService;
import { supabase } from '@/lib/supabase';

export const transactionService = {
  async getAll() {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        entity:entities(name),
        project:projects(name),
        contact:contacts(first_name, last_name)
      `)
      .order('transaction_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        entity:entities(name),
        project:projects(name),
        contact:contacts(first_name, last_name)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(transaction) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('transactions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  async getByProject(projectId) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('project_id', projectId)
      .order('transaction_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getByEntity(entityId) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('entity_id', entityId)
      .order('transaction_date', { ascending: false });
    if (error) throw error;
    return data;
  },
};
