// src/hooks/useChangeOrders.js
// React hooks for the Change Orders Module

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getChangeOrders,
  getChangeOrder,
  createChangeOrder,
  updateChangeOrder,
  deleteChangeOrder,
  approveChangeOrder,
  denyChangeOrder,
  markCOPaid,
  getCODocuments,
  addCODocument,
  calculateCOTotals,
  getNextCONumber,
} from '@/services/changeOrderService';

// ─── useProjectChangeOrders ──────────────────────────────────────────────────

export function useProjectChangeOrders(projectId) {
  const [changeOrders, setChangeOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getChangeOrders(projectId);
      setChangeOrders(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading change orders:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const nextCONumber = useMemo(() => getNextCONumber(changeOrders), [changeOrders]);

  const totals = useMemo(() => calculateCOTotals(changeOrders), [changeOrders]);

  return { changeOrders, loading, error, nextCONumber, totals, refetch: load };
}

// ─── useChangeOrderDetail ─────────────────────────────────────────────────────

export function useChangeOrderDetail(coId) {
  const [changeOrder, setChangeOrder] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!coId) return;
    try {
      setLoading(true);
      const [coData, docsData] = await Promise.all([
        getChangeOrder(coId),
        getCODocuments(coId),
      ]);
      setChangeOrder(coData);
      setDocuments(docsData);
    } catch (err) {
      console.error('Error loading change order detail:', err);
    } finally {
      setLoading(false);
    }
  }, [coId]);

  useEffect(() => { load(); }, [load]);

  return { changeOrder, documents, loading, refetch: load };
}

// ─── useChangeOrderActions ────────────────────────────────────────────────────

export function useChangeOrderActions(projectId) {
  const [saving, setSaving] = useState(false);

  const create = useCallback(async (coData) => {
    try {
      setSaving(true);
      return await createChangeOrder(projectId, coData);
    } catch (err) {
      console.error('Error creating change order:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [projectId]);

  const update = useCallback(async (coId, updates) => {
    try {
      setSaving(true);
      return await updateChangeOrder(coId, updates);
    } catch (err) {
      console.error('Error updating change order:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const remove = useCallback(async (coId) => {
    try {
      setSaving(true);
      await deleteChangeOrder(coId);
    } catch (err) {
      console.error('Error deleting change order:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const approve = useCallback(async (coId, notes) => {
    try {
      setSaving(true);
      return await approveChangeOrder(coId, notes);
    } finally {
      setSaving(false);
    }
  }, []);

  const deny = useCallback(async (coId, reason) => {
    try {
      setSaving(true);
      return await denyChangeOrder(coId, reason);
    } finally {
      setSaving(false);
    }
  }, []);

  const markPaid = useCallback(async (coId, amount, date) => {
    try {
      setSaving(true);
      return await markCOPaid(coId, amount, date);
    } finally {
      setSaving(false);
    }
  }, []);

  return { create, update, remove, approve, deny, markPaid, saving };
}
