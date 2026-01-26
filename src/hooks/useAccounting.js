// hooks/useAccounting.js
// Reusable hooks for accounting modules - connects to Supabase services

import { useState, useEffect, useCallback } from 'react';
import { billService } from '@/services/billService';
import { journalEntryService } from '@/services/journalEntryService';
import { vendorService } from '@/services/vendorService';
import { accountService } from '@/services/accountService';
import { transactionService } from '@/services/transactionService';

// ============================================================================
// BILLS HOOK
// ============================================================================
export function useBills(entityId, options = {}) {
  const [bills, setBills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBills = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await billService.getAll(entityId, options);
      if (fetchError) throw fetchError;
      setBills(data || []);
    } catch (err) {
      console.error('Error fetching bills:', err);
      setError(err.message);
      setBills([]);
    } finally {
      setIsLoading(false);
    }
  }, [entityId, options.status, options.vendorId]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const createBill = async (bill) => {
    const { data, error } = await billService.create({ ...bill, entity_id: entityId });
    if (error) throw error;
    await fetchBills();
    return data;
  };

  const updateBill = async (id, updates) => {
    const { data, error } = await billService.update(id, updates);
    if (error) throw error;
    await fetchBills();
    return data;
  };

  const deleteBill = async (id) => {
    const { error } = await billService.delete(id);
    if (error) throw error;
    await fetchBills();
  };

  const payBill = async (id, payment) => {
    const { data, error } = await billService.recordPayment(id, payment);
    if (error) throw error;
    await fetchBills();
    return data;
  };

  const approveBill = async (id) => {
    return updateBill(id, { status: 'approved' });
  };

  // Calculate summary stats
  const summary = {
    totalPayable: bills.filter(b => b.status !== 'paid' && b.status !== 'void')
      .reduce((sum, b) => sum + (parseFloat(b.balance) || parseFloat(b.amount) || 0), 0),
    totalOverdue: bills.filter(b => b.status === 'overdue')
      .reduce((sum, b) => sum + (parseFloat(b.balance) || parseFloat(b.amount) || 0), 0),
    pendingCount: bills.filter(b => b.status === 'pending').length,
    approvedCount: bills.filter(b => b.status === 'approved').length,
  };

  return {
    bills,
    isLoading,
    error,
    refetch: fetchBills,
    createBill,
    updateBill,
    deleteBill,
    payBill,
    approveBill,
    summary,
  };
}

// ============================================================================
// JOURNAL ENTRIES HOOK
// ============================================================================
export function useJournalEntries(entityId, options = {}) {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await journalEntryService.getAll(entityId, options);
      if (fetchError) throw fetchError;
      setEntries(data || []);
    } catch (err) {
      console.error('Error fetching journal entries:', err);
      setError(err.message);
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, [entityId, options.status, options.startDate, options.endDate]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const createEntry = async (entry) => {
    const { data, error } = await journalEntryService.create({ ...entry, entity_id: entityId });
    if (error) throw error;
    await fetchEntries();
    return data;
  };

  const updateEntry = async (id, updates) => {
    const { data, error } = await journalEntryService.update(id, updates);
    if (error) throw error;
    await fetchEntries();
    return data;
  };

  const deleteEntry = async (id) => {
    const { error } = await journalEntryService.delete(id);
    if (error) throw error;
    await fetchEntries();
  };

  const postEntry = async (id) => {
    const { data, error } = await journalEntryService.post(id);
    if (error) throw error;
    await fetchEntries();
    return data;
  };

  return {
    entries,
    isLoading,
    error,
    refetch: fetchEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    postEntry,
  };
}

// ============================================================================
// VENDORS HOOK
// ============================================================================
export function useVendors(entityId) {
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVendors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await vendorService.getAll(entityId);
      if (fetchError) throw fetchError;
      setVendors(data || []);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError(err.message);
      setVendors([]);
    } finally {
      setIsLoading(false);
    }
  }, [entityId]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const createVendor = async (vendor) => {
    const { data, error } = await vendorService.create({ ...vendor, entity_id: entityId });
    if (error) throw error;
    await fetchVendors();
    return data;
  };

  const updateVendor = async (id, updates) => {
    const { data, error } = await vendorService.update(id, updates);
    if (error) throw error;
    await fetchVendors();
    return data;
  };

  const deleteVendor = async (id) => {
    const { error } = await vendorService.delete(id);
    if (error) throw error;
    await fetchVendors();
  };

  return {
    vendors,
    isLoading,
    error,
    refetch: fetchVendors,
    createVendor,
    updateVendor,
    deleteVendor,
  };
}

// ============================================================================
// ACCOUNTS (Chart of Accounts) HOOK
// ============================================================================
export function useAccounts(entityId) {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await accountService.getAll(entityId);
      if (fetchError) throw fetchError;
      setAccounts(data || []);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError(err.message);
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  }, [entityId]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Group accounts by type
  const accountsByType = accounts.reduce((acc, account) => {
    const type = account.account_type || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(account);
    return acc;
  }, {});

  return {
    accounts,
    accountsByType,
    isLoading,
    error,
    refetch: fetchAccounts,
  };
}

// ============================================================================
// TRANSACTIONS HOOK
// ============================================================================
export function useTransactions(entityId, options = {}) {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await transactionService.getAll(entityId, options);
      if (fetchError) throw fetchError;
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.message);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [entityId, options.startDate, options.endDate, options.accountId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Calculate totals
  const totals = {
    debits: transactions.reduce((sum, t) => sum + (parseFloat(t.debit) || 0), 0),
    credits: transactions.reduce((sum, t) => sum + (parseFloat(t.credit) || 0), 0),
  };

  return {
    transactions,
    totals,
    isLoading,
    error,
    refetch: fetchTransactions,
  };
}

// ============================================================================
// A/P AGING HOOK
// ============================================================================
export function useAPAging(entityId) {
  const [aging, setAging] = useState({
    current: 0,
    days1to30: 0,
    days31to60: 0,
    days61to90: 0,
    days90plus: 0,
    total: 0,
  });
  const [details, setDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAging() {
      setIsLoading(true);
      try {
        const { data: bills } = await billService.getAll(entityId, { status: 'all' });
        const today = new Date();

        const unpaidBills = (bills || []).filter(b =>
          b.status !== 'paid' && b.status !== 'void'
        );

        const buckets = {
          current: 0,
          days1to30: 0,
          days31to60: 0,
          days61to90: 0,
          days90plus: 0,
        };

        const detailRows = [];

        unpaidBills.forEach(bill => {
          const dueDate = new Date(bill.due_date);
          const daysPastDue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
          const balance = parseFloat(bill.balance) || parseFloat(bill.amount) || 0;

          let bucket;
          if (daysPastDue <= 0) {
            buckets.current += balance;
            bucket = 'current';
          } else if (daysPastDue <= 30) {
            buckets.days1to30 += balance;
            bucket = '1-30';
          } else if (daysPastDue <= 60) {
            buckets.days31to60 += balance;
            bucket = '31-60';
          } else if (daysPastDue <= 90) {
            buckets.days61to90 += balance;
            bucket = '61-90';
          } else {
            buckets.days90plus += balance;
            bucket = '90+';
          }

          detailRows.push({
            ...bill,
            daysPastDue: Math.max(0, daysPastDue),
            bucket,
          });
        });

        setAging({
          ...buckets,
          total: buckets.current + buckets.days1to30 + buckets.days31to60 + buckets.days61to90 + buckets.days90plus,
        });
        setDetails(detailRows);
      } catch (err) {
        console.error('Error calculating A/P aging:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (entityId) {
      fetchAging();
    }
  }, [entityId]);

  return { aging, details, isLoading };
}

export default {
  useBills,
  useJournalEntries,
  useVendors,
  useAccounts,
  useTransactions,
  useAPAging,
};
