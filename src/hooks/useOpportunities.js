// hooks/useOpportunities.js
// React hooks for Opportunities - connects to Supabase opportunities table

import { useState, useEffect, useCallback } from 'react';
import { supabase, isDemoMode } from '@/lib/supabase';
import { opportunityService } from '@/services/opportunityService';

// Stage configuration matching database constraints
export const OPPORTUNITY_STAGES = [
  { key: 'Prospecting', label: 'Prospecting', color: '#6366f1' },
  { key: 'Contacted', label: 'Contacted', color: '#8b5cf6' },
  { key: 'Qualified', label: 'Qualified', color: '#f59e0b' },
  { key: 'Negotiating', label: 'Negotiating', color: '#10b981' },
  { key: 'Under Contract', label: 'Under Contract', color: '#22c55e' },
];

// Mock data for demo mode
const MOCK_OPPORTUNITIES = [
  {
    id: 'mock-1',
    deal_number: '25-001',
    address: '123 Oak Avenue',
    city: 'Greenville',
    state: 'SC',
    zip_code: '29601',
    stage: 'Prospecting',
    property_type: 'vacant-lot',
    estimated_value: 85000,
    asking_price: 75000,
    assignment_fee: 10000,
    seller_name: 'John Smith',
    seller_phone: '864-555-0101',
    seller_email: 'john@example.com',
    notes: 'Owner motivated to sell',
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    deal_number: '25-002',
    address: '456 Main Street',
    city: 'Greenville',
    state: 'SC',
    zip_code: '29605',
    stage: 'Contacted',
    property_type: 'flip-property',
    estimated_value: 150000,
    asking_price: 120000,
    assignment_fee: 15000,
    seller_name: 'Jane Doe',
    seller_phone: '864-555-0202',
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-3',
    deal_number: '25-003',
    address: '789 Pine Road',
    city: 'Greenville',
    state: 'SC',
    zip_code: '29607',
    stage: 'Qualified',
    property_type: 'vacant-lot',
    estimated_value: 95000,
    asking_price: 80000,
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
      if (isDemoMode) {
        const mockOpp = MOCK_OPPORTUNITIES.find(o => o.id === opportunityId);
        setOpportunity(mockOpp || null);
        return;
      }

      const data = await opportunityService.getById(opportunityId);
      setOpportunity(data);
    } catch (err) {
      console.error('Error fetching opportunity:', err);
      setError(err.message);
      const mockOpp = MOCK_OPPORTUNITIES.find(o => o.id === opportunityId);
      setOpportunity(mockOpp || null);
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
      if (isDemoMode) {
        setOpportunities(MOCK_OPPORTUNITIES);
        return;
      }
      
      const data = await opportunityService.getAll();
      setOpportunities(data || []);
    } catch (err) {
      console.error('Error fetching opportunities:', err);
      setError(err.message);
      // Fallback to mock data on error
      setOpportunities(MOCK_OPPORTUNITIES);
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
      if (isDemoMode) {
        console.log('Demo mode: would create opportunity', data);
        return { ...data, id: `mock-${Date.now()}` };
      }
      return await opportunityService.create(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateOpportunity = useCallback(async (id, data) => {
    setIsLoading(true);
    try {
      if (isDemoMode) {
        console.log('Demo mode: would update opportunity', id, data);
        return { id, ...data };
      }
      return await opportunityService.update(id, data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteOpportunity = useCallback(async (id) => {
    setIsLoading(true);
    try {
      if (isDemoMode) {
        console.log('Demo mode: would delete opportunity', id);
        return true;
      }
      return await opportunityService.delete(id);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateStage = useCallback(async (id, stage) => {
    return updateOpportunity(id, { stage });
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
