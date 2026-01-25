// src/hooks/usePermits.js
// React hooks for the Permits Module

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getPermits,
  getPermit,
  createPermit,
  updatePermit,
  deletePermit,
  updatePermitStatus,
  getPermitInspections,
  addInspection,
  updateInspection,
  calculatePermitTotals,
} from '@/services/permitService';

// ─── useProjectPermits ────────────────────────────────────────────────────────

export function useProjectPermits(projectId) {
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getPermits(projectId);
      setPermits(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading permits:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const totals = useMemo(() => calculatePermitTotals(permits), [permits]);

  return { permits, loading, error, totals, refetch: load };
}

// ─── usePermitDetail ──────────────────────────────────────────────────────────

export function usePermitDetail(permitId) {
  const [permit, setPermit] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!permitId) return;
    try {
      setLoading(true);
      const [permitData, inspData] = await Promise.all([
        getPermit(permitId),
        getPermitInspections(permitId),
      ]);
      setPermit(permitData);
      setInspections(inspData);
    } catch (err) {
      console.error('Error loading permit detail:', err);
    } finally {
      setLoading(false);
    }
  }, [permitId]);

  useEffect(() => { load(); }, [load]);

  return { permit, inspections, loading, refetch: load };
}

// ─── usePermitActions ─────────────────────────────────────────────────────────

export function usePermitActions(projectId) {
  const [saving, setSaving] = useState(false);

  const create = useCallback(async (permitData) => {
    try {
      setSaving(true);
      return await createPermit(projectId, permitData);
    } catch (err) {
      console.error('Error creating permit:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [projectId]);

  const update = useCallback(async (permitId, updates) => {
    try {
      setSaving(true);
      return await updatePermit(permitId, updates);
    } catch (err) {
      console.error('Error updating permit:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const remove = useCallback(async (permitId) => {
    try {
      setSaving(true);
      await deletePermit(permitId);
    } catch (err) {
      console.error('Error deleting permit:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const changeStatus = useCallback(async (permitId, status, dateFields) => {
    try {
      setSaving(true);
      return await updatePermitStatus(permitId, status, dateFields);
    } catch (err) {
      console.error('Error updating permit status:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const scheduleInspection = useCallback(async (permitId, inspectionData) => {
    try {
      setSaving(true);
      return await addInspection(permitId, inspectionData);
    } catch (err) {
      console.error('Error scheduling inspection:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const recordInspectionResult = useCallback(async (inspectionId, result) => {
    try {
      setSaving(true);
      return await updateInspection(inspectionId, result);
    } catch (err) {
      console.error('Error recording inspection result:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return { create, update, remove, changeStatus, scheduleInspection, recordInspectionResult, saving };
}
