// src/hooks/useBudget.js
// React hooks for the Budget Module

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getProjectBudgets,
  getActiveBudget,
  getBudgetById,
  createBudget,
  updateBudget,
  setActiveBudget as setActiveBudgetApi,
  deleteBudget,
  getBudgetLineItems,
  createLineItem,
  updateLineItem,
  deleteLineItem,
  bulkCreateLineItems,
  getPlans,
  getPlanById,
  calculateBudgetTotals,
  generateBudgetName,
  applyTemplateToLineItems,
  applyPlanCostBreakdown,
} from '@/services/budgetService';
import { getBudgetTemplates } from '@/services/budgetTemplateService';

// ─── useProjectBudgets ───────────────────────────────────────────────────────

export function useProjectBudgets(projectId) {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getProjectBudgets(projectId);
      setBudgets(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading budgets:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  return { budgets, loading, error, refetch: load };
}

// ─── useActiveBudget ─────────────────────────────────────────────────────────

export function useActiveBudget(projectId) {
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getActiveBudget(projectId);
      setBudget(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading active budget:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  return { budget, loading, error, refetch: load };
}

// ─── useBudgetLineItems ──────────────────────────────────────────────────────

export function useBudgetLineItems(budgetId) {
  const [lineItems, setLineItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!budgetId) { setLineItems([]); setLoading(false); return; }
    try {
      setLoading(true);
      setError(null);
      const data = await getBudgetLineItems(budgetId);
      setLineItems(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading line items:', err);
    } finally {
      setLoading(false);
    }
  }, [budgetId]);

  useEffect(() => { load(); }, [load]);

  const totals = useMemo(() => calculateBudgetTotals(lineItems), [lineItems]);

  const addLineItem = useCallback(async (itemData) => {
    const newItem = await createLineItem(budgetId, itemData);
    setLineItems(prev => [...prev, newItem]);
    return newItem;
  }, [budgetId]);

  const editLineItem = useCallback(async (itemId, updates) => {
    const updated = await updateLineItem(itemId, updates);
    setLineItems(prev => prev.map(li => li.id === itemId ? { ...li, ...updated } : li));
    return updated;
  }, []);

  const removeLineItem = useCallback(async (itemId) => {
    await deleteLineItem(itemId);
    setLineItems(prev => prev.filter(li => li.id !== itemId));
  }, []);

  return { lineItems, loading, error, totals, addLineItem, editLineItem, removeLineItem, refetch: load };
}

// ─── useBudgetActions ────────────────────────────────────────────────────────

export function useBudgetActions(projectId) {
  const [saving, setSaving] = useState(false);

  const create = useCallback(async (budgetData) => {
    setSaving(true);
    try {
      const result = await createBudget(projectId, budgetData);
      return result;
    } finally {
      setSaving(false);
    }
  }, [projectId]);

  const update = useCallback(async (budgetId, updates) => {
    setSaving(true);
    try {
      return await updateBudget(budgetId, updates);
    } finally {
      setSaving(false);
    }
  }, []);

  const setActive = useCallback(async (budgetId) => {
    setSaving(true);
    try {
      return await setActiveBudgetApi(projectId, budgetId);
    } finally {
      setSaving(false);
    }
  }, [projectId]);

  const remove = useCallback(async (budgetId) => {
    setSaving(true);
    try {
      return await deleteBudget(budgetId);
    } finally {
      setSaving(false);
    }
  }, []);

  const createFromTemplate = useCallback(async (budgetData, template, plan) => {
    setSaving(true);
    try {
      const budget = await createBudget(projectId, budgetData);
      let items = [];
      if (template) {
        items = applyTemplateToLineItems(template);
      }
      if (plan) {
        const planItems = applyPlanCostBreakdown(plan);
        items = [...items, ...planItems];
      }
      if (items.length > 0) {
        await bulkCreateLineItems(budget.id, items);
      }
      return budget;
    } finally {
      setSaving(false);
    }
  }, [projectId]);

  return { create, update, setActive, remove, createFromTemplate, saving };
}

// ─── usePlans ────────────────────────────────────────────────────────────────

export function usePlans(projectType) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getPlans(projectType);
        setPlans(data);
      } catch (err) {
        console.error('Error loading plans:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [projectType]);

  return { plans, loading };
}

// ─── useBudgetTemplates ──────────────────────────────────────────────────────

export function useBudgetTemplatesForProject(projectType) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getBudgetTemplates();
        const filtered = projectType
          ? data.filter(t => t.project_type === projectType || t.project_types?.includes(projectType))
          : data;
        setTemplates(filtered);
      } catch (err) {
        console.error('Error loading templates:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [projectType]);

  return { templates, loading };
}

// Re-export utility functions
export { generateBudgetName, calculateBudgetTotals, applyTemplateToLineItems, applyPlanCostBreakdown };
