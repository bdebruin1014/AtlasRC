// src/hooks/useProjectExpenses.js
// React hooks for the Project Expenses Module

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getProjectExpenses,
  getExpense,
  createProjectExpense,
  updateProjectExpense,
  deleteProjectExpense,
  approveProjectExpense,
  denyProjectExpense,
  markProjectExpensePaid,
  calculateExpenseTotals,
} from '@/services/projectExpenseService';

// ─── useProjectExpenses ───────────────────────────────────────────────────────

export function useProjectExpenses(projectId) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getProjectExpenses(projectId);
      setExpenses(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading expenses:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const totals = useMemo(() => calculateExpenseTotals(expenses), [expenses]);

  return { expenses, loading, error, totals, refetch: load };
}

// ─── useExpenseDetail ─────────────────────────────────────────────────────────

export function useExpenseDetail(expenseId) {
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!expenseId) return;
    try {
      setLoading(true);
      const data = await getExpense(expenseId);
      setExpense(data);
    } catch (err) {
      console.error('Error loading expense:', err);
    } finally {
      setLoading(false);
    }
  }, [expenseId]);

  useEffect(() => { load(); }, [load]);

  return { expense, loading, refetch: load };
}

// ─── useExpenseActions ────────────────────────────────────────────────────────

export function useExpenseActions(projectId) {
  const [saving, setSaving] = useState(false);

  const create = useCallback(async (data) => {
    try {
      setSaving(true);
      return await createProjectExpense(projectId, data);
    } catch (err) {
      console.error('Error creating expense:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [projectId]);

  const update = useCallback(async (expenseId, updates) => {
    try {
      setSaving(true);
      return await updateProjectExpense(expenseId, updates);
    } catch (err) {
      console.error('Error updating expense:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const remove = useCallback(async (expenseId) => {
    try {
      setSaving(true);
      await deleteProjectExpense(expenseId);
    } catch (err) {
      console.error('Error deleting expense:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const approve = useCallback(async (expenseId, notes) => {
    try {
      setSaving(true);
      return await approveProjectExpense(expenseId, notes);
    } finally {
      setSaving(false);
    }
  }, []);

  const deny = useCallback(async (expenseId, reason) => {
    try {
      setSaving(true);
      return await denyProjectExpense(expenseId, reason);
    } finally {
      setSaving(false);
    }
  }, []);

  const markPaid = useCallback(async (expenseId, method, reference, date) => {
    try {
      setSaving(true);
      return await markProjectExpensePaid(expenseId, method, reference, date);
    } finally {
      setSaving(false);
    }
  }, []);

  return { create, update, remove, approve, deny, markPaid, saving };
}
