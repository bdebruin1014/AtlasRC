// src/hooks/useSales.js
// React hooks for the Revenue & Sales Module

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getProjectSales,
  getSale,
  createSale,
  updateSale,
  deleteSale,
  updateSaleStatus,
  calculateSalesTotals,
} from '@/services/salesService';

// ─── useProjectSales ────────────────────────────────────────────────────────

export function useProjectSales(projectId) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getProjectSales(projectId);
      setSales(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading sales:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const totals = useMemo(() => calculateSalesTotals(sales), [sales]);

  return { sales, loading, error, totals, refetch: load };
}

// ─── useSaleDetail ──────────────────────────────────────────────────────────

export function useSaleDetail(saleId) {
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!saleId) return;
    try {
      setLoading(true);
      const data = await getSale(saleId);
      setSale(data);
    } catch (err) {
      console.error('Error loading sale:', err);
    } finally {
      setLoading(false);
    }
  }, [saleId]);

  useEffect(() => { load(); }, [load]);

  return { sale, loading, refetch: load };
}

// ─── useSaleActions ─────────────────────────────────────────────────────────

export function useSaleActions(projectId) {
  const [saving, setSaving] = useState(false);

  const create = useCallback(async (data) => {
    try {
      setSaving(true);
      return await createSale(projectId, data);
    } catch (err) {
      console.error('Error creating sale:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [projectId]);

  const update = useCallback(async (saleId, updates) => {
    try {
      setSaving(true);
      return await updateSale(saleId, updates);
    } catch (err) {
      console.error('Error updating sale:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const remove = useCallback(async (saleId) => {
    try {
      setSaving(true);
      await deleteSale(saleId);
    } catch (err) {
      console.error('Error deleting sale:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const changeStatus = useCallback(async (saleId, newStatus) => {
    try {
      setSaving(true);
      return await updateSaleStatus(saleId, newStatus);
    } catch (err) {
      console.error('Error updating sale status:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return { create, update, remove, changeStatus, saving };
}
