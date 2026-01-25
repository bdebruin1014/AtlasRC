// src/hooks/useDrawRequests.js
// React hooks for the Draw Requests Module

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getDrawRequests,
  getDrawRequest,
  createDrawRequest,
  updateDrawRequest,
  deleteDrawRequest,
  getDrawRequestItems,
  createDrawRequestItem,
  updateDrawRequestItem,
  deleteDrawRequestItem,
  getDrawRequestDocuments,
  addDrawRequestDocument,
  submitDrawRequest,
  approveDrawRequest,
  denyDrawRequest,
  fundDrawRequest,
  calculateDrawTotals,
  calculateBudgetIntegration,
  getNextDrawNumber,
  getLoanInfo,
  getDrawSchedule,
} from '@/services/drawRequestService';

// ─── useProjectDrawRequests ───────────────────────────────────────────────────

export function useProjectDrawRequests(projectId) {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getDrawRequests(projectId);
      setDraws(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading draw requests:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const nextDrawNumber = useMemo(() => getNextDrawNumber(draws), [draws]);

  const totals = useMemo(() => calculateDrawTotals(draws), [draws]);

  return { draws, loading, error, nextDrawNumber, totals, refetch: load };
}

// ─── useDrawRequestDetail ─────────────────────────────────────────────────────

export function useDrawRequestDetail(drawId) {
  const [draw, setDraw] = useState(null);
  const [items, setItems] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!drawId) return;
    try {
      setLoading(true);
      const [drawData, itemsData, docsData] = await Promise.all([
        getDrawRequest(drawId),
        getDrawRequestItems(drawId),
        getDrawRequestDocuments(drawId),
      ]);
      setDraw(drawData);
      setItems(itemsData);
      setDocuments(docsData);
    } catch (err) {
      console.error('Error loading draw request detail:', err);
    } finally {
      setLoading(false);
    }
  }, [drawId]);

  useEffect(() => { load(); }, [load]);

  return { draw, items, documents, loading, refetch: load };
}

// ─── useDrawRequestActions ────────────────────────────────────────────────────

export function useDrawRequestActions(projectId) {
  const [saving, setSaving] = useState(false);

  const create = useCallback(async (drawData) => {
    try {
      setSaving(true);
      const result = await createDrawRequest(projectId, drawData);
      return result;
    } catch (err) {
      console.error('Error creating draw request:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [projectId]);

  const update = useCallback(async (drawId, updates) => {
    try {
      setSaving(true);
      const result = await updateDrawRequest(drawId, updates);
      return result;
    } catch (err) {
      console.error('Error updating draw request:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const remove = useCallback(async (drawId) => {
    try {
      setSaving(true);
      await deleteDrawRequest(drawId);
    } catch (err) {
      console.error('Error deleting draw request:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const submit = useCallback(async (drawId) => {
    try {
      setSaving(true);
      return await submitDrawRequest(drawId);
    } finally {
      setSaving(false);
    }
  }, []);

  const approve = useCallback(async (drawId, amount) => {
    try {
      setSaving(true);
      return await approveDrawRequest(drawId, amount);
    } finally {
      setSaving(false);
    }
  }, []);

  const deny = useCallback(async (drawId, reason) => {
    try {
      setSaving(true);
      return await denyDrawRequest(drawId, reason);
    } finally {
      setSaving(false);
    }
  }, []);

  const fund = useCallback(async (drawId, amount) => {
    try {
      setSaving(true);
      return await fundDrawRequest(drawId, amount);
    } finally {
      setSaving(false);
    }
  }, []);

  return { create, update, remove, submit, approve, deny, fund, saving };
}

// ─── useDrawRequestItems ──────────────────────────────────────────────────────

export function useDrawRequestItems(drawRequestId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!drawRequestId) { setItems([]); setLoading(false); return; }
    try {
      setLoading(true);
      const data = await getDrawRequestItems(drawRequestId);
      setItems(data);
    } catch (err) {
      console.error('Error loading draw request items:', err);
    } finally {
      setLoading(false);
    }
  }, [drawRequestId]);

  useEffect(() => { load(); }, [load]);

  const addItem = useCallback(async (itemData) => {
    const newItem = await createDrawRequestItem(drawRequestId, itemData);
    setItems(prev => [...prev, newItem]);
    return newItem;
  }, [drawRequestId]);

  const editItem = useCallback(async (itemId, updates) => {
    const updated = await updateDrawRequestItem(itemId, updates);
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, ...updated } : i));
    return updated;
  }, []);

  const removeItem = useCallback(async (itemId) => {
    await deleteDrawRequestItem(itemId);
    setItems(prev => prev.filter(i => i.id !== itemId));
  }, []);

  const itemsTotalRequested = useMemo(() =>
    items.reduce((s, i) => s + (i.current_request || 0), 0), [items]
  );

  const itemsTotalApproved = useMemo(() =>
    items.reduce((s, i) => s + (i.approved_amount || 0), 0), [items]
  );

  return { items, loading, addItem, editItem, removeItem, itemsTotalRequested, itemsTotalApproved, refetch: load };
}

// ─── useDrawBudgetIntegration ─────────────────────────────────────────────────

export function useDrawBudgetIntegration(draws, budgetTotal) {
  return useMemo(() => {
    if (!draws || !budgetTotal) return null;
    return calculateBudgetIntegration(draws, budgetTotal);
  }, [draws, budgetTotal]);
}

// ─── useLoanInfo ──────────────────────────────────────────────────────────────

export function useLoanInfo(projectId) {
  const [loanInfo, setLoanInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, this would fetch from project loans
    setLoanInfo(getLoanInfo());
    setLoading(false);
  }, [projectId]);

  return { loanInfo, loading };
}

// ─── useDrawSchedule ──────────────────────────────────────────────────────────

export function useDrawSchedule(projectId) {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSchedule(getDrawSchedule(projectId));
    setLoading(false);
  }, [projectId]);

  return { schedule, loading };
}
