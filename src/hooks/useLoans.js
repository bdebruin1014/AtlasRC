// src/hooks/useLoans.js
// React hooks for the Loans Module

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getProjectLoans,
  getLoan,
  createLoan,
  updateLoan,
  deleteLoan,
  getLoanDraws,
  createDraw,
  approveDraw,
  fundDraw,
  getLoanPayments,
  recordPayment,
  calculateLoanSummary,
} from '@/services/loanService';

// ─── useProjectLoans ────────────────────────────────────────────────────────

export function useProjectLoans(projectId) {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getProjectLoans(projectId);
      setLoans(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading loans:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const summary = useMemo(() => calculateLoanSummary(loans), [loans]);

  return { loans, loading, error, summary, refetch: load };
}

// ─── useLoanDetail ──────────────────────────────────────────────────────────

export function useLoanDetail(loanId) {
  const [loan, setLoan] = useState(null);
  const [draws, setDraws] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!loanId) return;
    try {
      setLoading(true);
      const [loanData, drawsData, paymentsData] = await Promise.all([
        getLoan(loanId),
        getLoanDraws(loanId),
        getLoanPayments(loanId),
      ]);
      setLoan(loanData);
      setDraws(drawsData);
      setPayments(paymentsData);
    } catch (err) {
      console.error('Error loading loan detail:', err);
    } finally {
      setLoading(false);
    }
  }, [loanId]);

  useEffect(() => { load(); }, [load]);

  return { loan, draws, payments, loading, refetch: load };
}

// ─── useLoanActions ─────────────────────────────────────────────────────────

export function useLoanActions(projectId) {
  const [saving, setSaving] = useState(false);

  const create = useCallback(async (data) => {
    try {
      setSaving(true);
      return await createLoan(projectId, data);
    } catch (err) {
      console.error('Error creating loan:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [projectId]);

  const update = useCallback(async (loanId, updates) => {
    try {
      setSaving(true);
      return await updateLoan(loanId, updates);
    } catch (err) {
      console.error('Error updating loan:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const remove = useCallback(async (loanId) => {
    try {
      setSaving(true);
      await deleteLoan(loanId);
    } catch (err) {
      console.error('Error deleting loan:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const addDraw = useCallback(async (loanId, data) => {
    try {
      setSaving(true);
      return await createDraw(loanId, data);
    } catch (err) {
      console.error('Error creating draw:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const approveDrawRequest = useCallback(async (drawId) => {
    try {
      setSaving(true);
      return await approveDraw(drawId);
    } catch (err) {
      console.error('Error approving draw:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const fundDrawRequest = useCallback(async (drawId) => {
    try {
      setSaving(true);
      return await fundDraw(drawId);
    } catch (err) {
      console.error('Error funding draw:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const paymentRecord = useCallback(async (paymentId) => {
    try {
      setSaving(true);
      return await recordPayment(paymentId);
    } catch (err) {
      console.error('Error recording payment:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return { create, update, remove, addDraw, approveDrawRequest, fundDrawRequest, paymentRecord, saving };
}
