// src/hooks/useCashFlow.js
// React hooks for the Cash Flow Module

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getProjectCashFlows,
  getCashFlowRecord,
  createCashFlowRecord,
  updateCashFlowRecord,
  deleteCashFlowRecord,
  calculateCashFlowSummary,
} from '@/services/cashFlowService';

// ─── useProjectCashFlows ────────────────────────────────────────────────────

export function useProjectCashFlows(projectId) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getProjectCashFlows(projectId);
      setRecords(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading cash flows:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const summary = useMemo(() => calculateCashFlowSummary(records), [records]);

  return { records, loading, error, summary, refetch: load };
}

// ─── useCashFlowActions ─────────────────────────────────────────────────────

export function useCashFlowActions(projectId) {
  const [saving, setSaving] = useState(false);

  const create = useCallback(async (data) => {
    try {
      setSaving(true);
      return await createCashFlowRecord(projectId, data);
    } catch (err) {
      console.error('Error creating cash flow record:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [projectId]);

  const update = useCallback(async (recordId, updates) => {
    try {
      setSaving(true);
      return await updateCashFlowRecord(recordId, updates);
    } catch (err) {
      console.error('Error updating cash flow record:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const remove = useCallback(async (recordId) => {
    try {
      setSaving(true);
      await deleteCashFlowRecord(recordId);
    } catch (err) {
      console.error('Error deleting cash flow record:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return { create, update, remove, saving };
}
