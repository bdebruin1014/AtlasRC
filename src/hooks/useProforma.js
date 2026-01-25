// src/hooks/useProforma.js
// React hooks for the Pro Forma Module

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getProformas,
  getActiveProforma,
  getProforma,
  createProforma,
  updateProforma,
  setActiveProforma,
  deleteProforma,
  calculateProFormaMetrics,
} from '@/services/proformaService';

// ─── useProjectProformas ──────────────────────────────────────────────────────

export function useProjectProformas(projectId) {
  const [proformas, setProformas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getProformas(projectId);
      setProformas(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading proformas:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const active = useMemo(() => proformas.find(p => p.is_active) || null, [proformas]);

  return { proformas, active, loading, error, refetch: load };
}

// ─── useActiveProforma ────────────────────────────────────────────────────────

export function useActiveProforma(projectId) {
  const [proforma, setProforma] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await getActiveProforma(projectId);
      setProforma(data);
    } catch (err) {
      console.error('Error loading active proforma:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const metrics = useMemo(() => {
    if (!proforma) return null;
    return calculateProFormaMetrics(proforma);
  }, [proforma]);

  return { proforma, metrics, loading, refetch: load };
}

// ─── useProformaActions ───────────────────────────────────────────────────────

export function useProformaActions(projectId) {
  const [saving, setSaving] = useState(false);

  const create = useCallback(async (data) => {
    try {
      setSaving(true);
      return await createProforma(projectId, data);
    } catch (err) {
      console.error('Error creating proforma:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [projectId]);

  const update = useCallback(async (proformaId, updates) => {
    try {
      setSaving(true);
      return await updateProforma(proformaId, updates);
    } catch (err) {
      console.error('Error updating proforma:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const setActive = useCallback(async (proformaId) => {
    try {
      setSaving(true);
      return await setActiveProforma(projectId, proformaId);
    } catch (err) {
      console.error('Error setting active proforma:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [projectId]);

  const remove = useCallback(async (proformaId) => {
    try {
      setSaving(true);
      await deleteProforma(proformaId);
    } catch (err) {
      console.error('Error deleting proforma:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return { create, update, setActive, remove, saving };
}
