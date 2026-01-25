// src/hooks/useBids.js
// React hooks for the Bids Module

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getBids,
  getBid,
  createBid,
  updateBid,
  deleteBid,
  updateBidStatus,
  awardBid,
  scoreBid,
  getBidDocuments,
  addBidDocument,
  calculateBidTotals,
  getBidsByScope,
} from '@/services/bidService';

// ─── useProjectBids ───────────────────────────────────────────────────────────

export function useProjectBids(projectId) {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getBids(projectId);
      setBids(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading bids:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const totals = useMemo(() => calculateBidTotals(bids), [bids]);
  const byScope = useMemo(() => getBidsByScope(bids), [bids]);

  return { bids, loading, error, totals, byScope, refetch: load };
}

// ─── useBidDetail ─────────────────────────────────────────────────────────────

export function useBidDetail(bidId) {
  const [bid, setBid] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!bidId) return;
    try {
      setLoading(true);
      const [bidData, docsData] = await Promise.all([
        getBid(bidId),
        getBidDocuments(bidId),
      ]);
      setBid(bidData);
      setDocuments(docsData);
    } catch (err) {
      console.error('Error loading bid detail:', err);
    } finally {
      setLoading(false);
    }
  }, [bidId]);

  useEffect(() => { load(); }, [load]);

  return { bid, documents, loading, refetch: load };
}

// ─── useBidActions ────────────────────────────────────────────────────────────

export function useBidActions(projectId) {
  const [saving, setSaving] = useState(false);

  const create = useCallback(async (bidData) => {
    try {
      setSaving(true);
      return await createBid(projectId, bidData);
    } catch (err) {
      console.error('Error creating bid:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [projectId]);

  const update = useCallback(async (bidId, updates) => {
    try {
      setSaving(true);
      return await updateBid(bidId, updates);
    } catch (err) {
      console.error('Error updating bid:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const remove = useCallback(async (bidId) => {
    try {
      setSaving(true);
      await deleteBid(bidId);
    } catch (err) {
      console.error('Error deleting bid:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const changeStatus = useCallback(async (bidId, status, notes) => {
    try {
      setSaving(true);
      return await updateBidStatus(bidId, status, notes);
    } catch (err) {
      console.error('Error updating bid status:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const award = useCallback(async (bidId) => {
    try {
      setSaving(true);
      return await awardBid(bidId);
    } catch (err) {
      console.error('Error awarding bid:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const score = useCallback(async (bidId, scoreValue, notes) => {
    try {
      setSaving(true);
      return await scoreBid(bidId, scoreValue, notes);
    } catch (err) {
      console.error('Error scoring bid:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return { create, update, remove, changeStatus, award, score, saving };
}
