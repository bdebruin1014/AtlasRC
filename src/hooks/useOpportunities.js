// hooks/useOpportunities.js
// React hooks for Opportunities - connects to Supabase opportunities table

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { opportunityService } from '@/services/opportunityService';
import { activityService } from '@/services/activityService';
import { notifyStageChange } from '@/services/notificationTriggerService';

// Stage configuration matching database constraints
export const OPPORTUNITY_STAGES = [
  { key: 'Prospecting', label: 'Prospecting', color: '#6366f1' },
  { key: 'Contacted', label: 'Contacted', color: '#8b5cf6' },
  { key: 'Qualified', label: 'Qualified', color: '#f59e0b' },
  { key: 'Negotiating', label: 'Negotiating', color: '#10b981' },
  { key: 'Under Contract', label: 'Under Contract', color: '#22c55e' },
];

// Hook to fetch a single opportunity by ID
export function useOpportunity(opportunityId) {
  const [opportunity, setOpportunity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOpportunity = useCallback(async () => {
    if (!opportunityId) {
      setOpportunity(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await opportunityService.getById(opportunityId);
      setOpportunity(data);
    } catch (err) {
      console.error('Error fetching opportunity:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [opportunityId]);

  useEffect(() => {
    fetchOpportunity();
  }, [fetchOpportunity]);

  return { opportunity, isLoading, error, refetch: fetchOpportunity };
}

// Hook to fetch all opportunities
export function useOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOpportunities = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await opportunityService.getAll();
      setOpportunities(data || []);
    } catch (err) {
      console.error('Error fetching opportunities:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  return { opportunities, isLoading, error, refetch: fetchOpportunities };
}

// Hook for opportunity CRUD actions
export function useOpportunityActions() {
  const [isLoading, setIsLoading] = useState(false);

  const createOpportunity = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const result = await opportunityService.create(data);
      activityService.log({
        entityType: 'opportunity',
        entityId: result.id,
        action: 'created',
        newValue: data.address || data.deal_number,
      }).catch(() => {});
      return result;
    } catch (err) {
      console.error('Create opportunity failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateOpportunity = useCallback(async (id, data) => {
    setIsLoading(true);
    try {
      return await opportunityService.update(id, data);
    } catch (err) {
      console.error('Update opportunity failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteOpportunity = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const result = await opportunityService.delete(id);
      activityService.log({
        entityType: 'opportunity',
        entityId: id,
        action: 'deleted',
      }).catch(() => {});
      return result;
    } catch (err) {
      console.error('Delete opportunity failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateStage = useCallback(async (id, stage, oldStage) => {
    const result = await updateOpportunity(id, { stage });
    activityService.log({
      entityType: 'opportunity',
      entityId: id,
      action: 'status_changed',
      fieldChanged: 'stage',
      oldValue: oldStage,
      newValue: stage,
    }).catch(() => {});

    // Fire-and-forget notification when stage actually changes
    if (stage !== oldStage) {
      notifyStageChange(
        id,
        result?.deal_number || result?.address || id,
        oldStage,
        stage,
        'current-user',
      ).catch(() => {});
    }

    return result;
  }, [updateOpportunity]);

  return {
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
    updateStage,
    isLoading,
  };
}

// Hook for opportunity summary/stats
export function useOpportunitySummary(opportunities) {
  const [summary, setSummary] = useState({
    total: 0,
    byStage: {},
    totalValue: 0,
  });

  useEffect(() => {
    if (!opportunities || opportunities.length === 0) {
      setSummary({
        total: 0,
        byStage: {},
        totalValue: 0,
      });
      return;
    }

    const byStage = {};
    let totalValue = 0;

    OPPORTUNITY_STAGES.forEach(stage => {
      byStage[stage.key] = { count: 0, value: 0 };
    });

    opportunities.forEach(opp => {
      if (byStage[opp.stage]) {
        byStage[opp.stage].count++;
        byStage[opp.stage].value += opp.estimated_value || 0;
      }
      totalValue += opp.estimated_value || 0;
    });

    setSummary({
      total: opportunities.length,
      byStage,
      totalValue,
    });
  }, [opportunities]);

  return summary;
}

// Hook for real-time subscription to opportunities
export function useOpportunitySubscription(onUpdate) {
  useEffect(() => {
    const subscription = supabase
      .channel('opportunities-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'opportunities' },
        (payload) => {
          console.log('Opportunity change:', payload);
          onUpdate?.();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [onUpdate]);
}

export default {
  useOpportunity,
  useOpportunities,
  useOpportunityActions,
  useOpportunitySummary,
  useOpportunitySubscription,
  OPPORTUNITY_STAGES,
};
