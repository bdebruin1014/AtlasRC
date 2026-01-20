import { supabase, isDemoMode } from '@/lib/supabase';

// Mock report data for demo mode
const mockTrialBalance = [
  { account_number: '1000', account_name: 'Cash', account_type: 'Asset', debit: 250000, credit: 0 },
  { account_number: '1100', account_name: 'Accounts Receivable', account_type: 'Asset', debit: 45000, credit: 0 },
  { account_number: '1500', account_name: 'Fixed Assets', account_type: 'Asset', debit: 500000, credit: 0 },
  { account_number: '1510', account_name: 'Accumulated Depreciation', account_type: 'Asset', debit: 0, credit: 75000 },
  { account_number: '2000', account_name: 'Accounts Payable', account_type: 'Liability', debit: 0, credit: 35000 },
  { account_number: '2500', account_name: 'Notes Payable', account_type: 'Liability', debit: 0, credit: 200000 },
  { account_number: '3000', account_name: 'Equity', account_type: 'Equity', debit: 0, credit: 400000 },
  { account_number: '3100', account_name: 'Retained Earnings', account_type: 'Equity', debit: 0, credit: 50000 },
  { account_number: '4000', account_name: 'Revenue', account_type: 'Revenue', debit: 0, credit: 150000 },
  { account_number: '5000', account_name: 'Cost of Goods Sold', account_type: 'Expense', debit: 75000, credit: 0 },
  { account_number: '6000', account_name: 'Operating Expenses', account_type: 'Expense', debit: 40000, credit: 0 },
];

const mockProfitLoss = {
  revenue: [
    { account_name: 'Sales Revenue', amount: 120000 },
    { account_name: 'Service Revenue', amount: 30000 },
  ],
  expenses: [
    { account_name: 'Cost of Goods Sold', amount: 75000 },
    { account_name: 'Salaries & Wages', amount: 25000 },
    { account_name: 'Rent Expense', amount: 8000 },
    { account_name: 'Utilities', amount: 3000 },
    { account_name: 'Depreciation', amount: 4000 },
  ],
  totalRevenue: 150000,
  totalExpenses: 115000,
  netIncome: 35000,
};

const mockBalanceSheet = {
  assets: {
    current: [
      { account_name: 'Cash', amount: 250000 },
      { account_name: 'Accounts Receivable', amount: 45000 },
      { account_name: 'Inventory', amount: 30000 },
    ],
    fixed: [
      { account_name: 'Property & Equipment', amount: 500000 },
      { account_name: 'Less: Accumulated Depreciation', amount: -75000 },
    ],
    totalCurrent: 325000,
    totalFixed: 425000,
    total: 750000,
  },
  liabilities: {
    current: [
      { account_name: 'Accounts Payable', amount: 35000 },
      { account_name: 'Accrued Expenses', amount: 15000 },
    ],
    longTerm: [
      { account_name: 'Notes Payable', amount: 200000 },
    ],
    totalCurrent: 50000,
    totalLongTerm: 200000,
    total: 250000,
  },
  equity: {
    items: [
      { account_name: 'Owner\'s Equity', amount: 400000 },
      { account_name: 'Retained Earnings', amount: 50000 },
      { account_name: 'Current Year Earnings', amount: 50000 },
    ],
    total: 500000,
  },
  totalLiabilitiesAndEquity: 750000,
};

export const reportService = {
  // Get Trial Balance
  async getTrialBalance(entityId, asOfDate = null) {
    if (isDemoMode) {
      const totalDebit = mockTrialBalance.reduce((sum, row) => sum + row.debit, 0);
      const totalCredit = mockTrialBalance.reduce((sum, row) => sum + row.credit, 0);
      return { 
        data: { 
          rows: mockTrialBalance, 
          totalDebit, 
          totalCredit,
          isBalanced: totalDebit === totalCredit,
        }, 
        error: null 
      };
    }
    
    // In production, this would be a database query or RPC call
    const { data, error } = await supabase.rpc('get_trial_balance', {
      p_entity_id: entityId,
      p_as_of_date: asOfDate || new Date().toISOString().split('T')[0],
    });
    
    return { data, error };
  },
  
  // Get Profit & Loss Statement
  async getProfitLoss(entityId, startDate, endDate) {
    if (isDemoMode) {
      return { data: mockProfitLoss, error: null };
    }
    
    const { data, error } = await supabase.rpc('get_profit_loss', {
      p_entity_id: entityId,
      p_start_date: startDate,
      p_end_date: endDate,
    });
    
    return { data, error };
  },
  
  // Get Balance Sheet
  async getBalanceSheet(entityId, asOfDate = null) {
    if (isDemoMode) {
      return { data: mockBalanceSheet, error: null };
    }
    
    const { data, error } = await supabase.rpc('get_balance_sheet', {
      p_entity_id: entityId,
      p_as_of_date: asOfDate || new Date().toISOString().split('T')[0],
    });
    
    return { data, error };
  },
  
  // Get General Ledger
  async getGeneralLedger(entityId, accountId = null, startDate = null, endDate = null) {
    if (isDemoMode) {
      return { 
        data: {
          transactions: [
            { date: '2024-12-01', description: 'Opening Balance', reference: 'OB-001', debit: 250000, credit: 0, balance: 250000 },
            { date: '2024-12-05', description: 'Client Payment', reference: 'REC-001', debit: 15000, credit: 0, balance: 265000 },
            { date: '2024-12-10', description: 'Vendor Payment', reference: 'PAY-001', debit: 0, credit: 8500, balance: 256500 },
            { date: '2024-12-15', description: 'Service Revenue', reference: 'INV-001', debit: 12000, credit: 0, balance: 268500 },
            { date: '2024-12-20', description: 'Utility Bill', reference: 'PAY-002', debit: 0, credit: 1200, balance: 267300 },
          ],
          openingBalance: 250000,
          closingBalance: 267300,
          totalDebits: 277000,
          totalCredits: 9700,
        },
        error: null 
      };
    }
    
    let query = supabase
      .from('journal_entry_lines')
      .select(`
        *,
        journal_entries!inner(date, description, entry_number)
      `)
      .eq('journal_entries.entity_id', entityId)
      .order('journal_entries.date', { ascending: true });
    
    if (accountId) {
      query = query.eq('account_id', accountId);
    }
    
    if (startDate) {
      query = query.gte('journal_entries.date', startDate);
    }
    
    if (endDate) {
      query = query.lte('journal_entries.date', endDate);
    }
    
    return await query;
  },
  
  // Get AP Aging Report
  async getAPAging(entityId, asOfDate = null) {
    if (isDemoMode) {
      return {
        data: {
          summary: {
            current: 15000,
            days30: 8500,
            days60: 5000,
            days90: 3500,
            over90: 3000,
            total: 35000,
          },
          vendors: [
            { name: 'ABC Supplies', current: 5000, days30: 2500, days60: 0, days90: 0, over90: 0, total: 7500 },
            { name: 'XYZ Services', current: 3000, days30: 1500, days60: 2000, days90: 0, over90: 0, total: 6500 },
            { name: 'BuildRight Construction', current: 7000, days30: 4500, days60: 3000, days90: 3500, over90: 3000, total: 21000 },
          ],
        },
        error: null,
      };
    }
    
    const { data, error } = await supabase.rpc('get_ap_aging', {
      p_entity_id: entityId,
      p_as_of_date: asOfDate || new Date().toISOString().split('T')[0],
    });
    
    return { data, error };
  },
  
  // Export report to CSV
  exportToCSV(data, filename) {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle strings with commas
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  },
};

export default reportService;
