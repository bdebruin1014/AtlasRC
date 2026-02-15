// hooks/useOpportunities.js
// React hooks for Opportunities - connects to Supabase opportunities table

import { useState, useEffect, useCallback } from 'react';
import { supabase, isDemoMode } from '@/lib/supabase';
import { opportunityService } from '@/services/opportunityService';
import { activityService } from '@/services/activityService';

// Stage configuration matching database constraints
export const OPPORTUNITY_STAGES = [
  { key: 'Prospecting', label: 'Prospecting', color: '#6366f1' },
  { key: 'Contacted', label: 'Contacted', color: '#8b5cf6' },
  { key: 'Qualified', label: 'Qualified', color: '#f59e0b' },
  { key: 'Negotiating', label: 'Negotiating', color: '#10b981' },
  { key: 'Under Contract', label: 'Under Contract', color: '#22c55e' },
];

// Fallback data when Supabase is unreachable
const FALLBACK_OPPORTUNITIES = [
  {
    id: 'demo-1',
    deal_number: '26-001',
    address: '123 Oak Avenue',
    city: 'Greenville',
    state: 'SC',
    zip_code: '29601',
    stage: 'Prospecting',
    property_type: 'vacant-lot',
    estimated_value: 85000,
    asking_price: 75000,
    seller_name: 'John Smith',
    notes: 'Owner motivated to sell',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    deal_number: '26-002',
    address: '456 Main Street',
    city: 'Greenville',
    state: 'SC',
    zip_code: '29605',
    stage: 'Contacted',
    property_type: 'scattered-lot',
    estimated_value: 150000,
    asking_price: 120000,
    seller_name: 'Jane Doe',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    deal_number: '26-003',
    address: '789 Pine Road',
    city: 'Simpsonville',
    state: 'SC',
    zip_code: '29680',
    stage: 'Qualified',
    property_type: 'development-lot-sale',
    estimated_value: 950000,
    asking_price: 800000,
    created_at: new Date().toISOString(),
  },
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
      if (isDemoMode) {
        const fallback = FALLBACK_OPPORTUNITIES.find(o => o.id === opportunityId);
        setOpportunity(fallback || null);
      }
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
      if (isDemoMode) {
        setOpportunities(FALLBACK_OPPORTUNITIES);
      }
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
      if (isDemoMode) return { ...data, id: `demo-${Date.now()}` };
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
      if (isDemoMode) return { id, ...data };
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
      if (isDemoMode) return true;
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
    if (isDemoMode) return;

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
