// hooks/usePipeline.js
// React hooks for Deal Analyzer Pipeline - Adapted for AtlasDev

import { useState, useEffect, useCallback } from 'react';
import { supabase, isDemoMode } from '@/lib/supabase';

// =============================================================================
// MOCK DATA FOR DEMO MODE
// =============================================================================

const MOCK_PROPERTIES = [
  {
    id: 'prop-1',
    address: '123 Oak Street',
    city: 'Greenville',
    state: 'SC',
    zip_code: '29601',
    target_market: 'nickeltown',
    asking_price: 85000,
    lot_size_sf: 8500,
    status: 'analyzed',
    created_at: new Date().toISOString(),
    score: 82,
    recommendation: 'STRONG_BUY',
    best_product: 'magnolia',
    projected_profit: 65000,
    projected_roi: 22.5,
    max_offer: 78000,
    has_disqualifier: false,
  },
  {
    id: 'prop-2',
    address: '456 Pine Lane',
    city: 'Travelers Rest',
    state: 'SC',
    zip_code: '29690',
    target_market: 'travelers_rest',
    asking_price: 95000,
    lot_size_sf: 10200,
    status: 'analyzed',
    created_at: new Date().toISOString(),
    score: 75,
    recommendation: 'BUY',
    best_product: 'atlas',
    projected_profit: 52000,
    projected_roi: 18.2,
    max_offer: 88000,
    has_disqualifier: false,
  },
  {
    id: 'prop-3',
    address: '789 Maple Drive',
    city: 'Taylors',
    state: 'SC',
    zip_code: '29687',
    target_market: 'taylors',
    asking_price: 72000,
    lot_size_sf: 6800,
    status: 'new',
    created_at: new Date().toISOString(),
    score: null,
    recommendation: null,
    best_product: null,
    projected_profit: null,
    projected_roi: null,
    max_offer: null,
    has_disqualifier: false,
  },
  {
    id: 'prop-4',
    address: '321 Cedar Way',
    city: 'Greer',
    state: 'SC',
    zip_code: '29651',
    target_market: 'greer',
    asking_price: 115000,
    lot_size_sf: 12500,
    status: 'analyzed',
    created_at: new Date().toISOString(),
    score: 68,
    recommendation: 'HOLD',
    best_product: 'anchorage',
    projected_profit: 38000,
    projected_roi: 14.1,
    max_offer: 105000,
    has_disqualifier: false,
  },
  {
    id: 'prop-5',
    address: '555 Flood Zone Rd',
    city: 'Greenville',
    state: 'SC',
    zip_code: '29605',
    target_market: 'nickeltown',
    asking_price: 45000,
    lot_size_sf: 9000,
    status: 'analyzed',
    created_at: new Date().toISOString(),
    score: 35,
    recommendation: 'PASS',
    best_product: null,
    projected_profit: -5000,
    projected_roi: -3.2,
    max_offer: 35000,
    has_disqualifier: true,
    disqualifier_reasons: ['flood_zone'],
  },
];

const MOCK_SUMMARY = {
  total_properties: MOCK_PROPERTIES.length,
  by_status: {
    new: 1, enriching: 0, enriched: 0, analyzing: 0, analyzed: 4,
    pending_review: 0, approved: 0, rejected: 0, under_contract: 0,
    closed: 0, archived: 0,
  },
  by_recommendation: {
    STRONG_BUY: 1, BUY: 1, HOLD: 1, PASS: 1,
  },
  by_market: {
    nickeltown: 2, travelers_rest: 1, taylors: 1, greer: 1,
  },
  avg_score: 65,
  total_potential_profit: 150000,
  properties_needing_review: 4,
};

// =============================================================================
// PIPELINE SUMMARY HOOK
// =============================================================================

export function usePipelineSummary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      
      if (isDemoMode) {
        // Return mock data in demo mode
        await new Promise(resolve => setTimeout(resolve, 300));
        setSummary(MOCK_SUMMARY);
        return;
      }
      
      // Fetch all properties with their recommendations
      const { data: properties, error: propError } = await supabase
        .from('deal_analyzer.properties')
        .select(`
          id,
          status,
          target_market,
          recommendations:deal_analyzer.recommendations(
            recommendation,
            projected_profit
          ),
          buy_box_evaluations:deal_analyzer.buy_box_evaluations(
            total_score
          )
        `);
      
      if (propError) throw propError;
      
      // Calculate summary
      const byStatus = {
        new: 0, enriching: 0, enriched: 0, analyzing: 0, analyzed: 0,
        pending_review: 0, approved: 0, rejected: 0, under_contract: 0,
        closed: 0, archived: 0,
      };
      
      const byRecommendation = {
        STRONG_BUY: 0, BUY: 0, HOLD: 0, PASS: 0,
      };
      
      const byMarket = {
        nickeltown: 0, travelers_rest: 0, taylors: 0, greer: 0,
      };
      
      let totalScore = 0;
      let scoredCount = 0;
      let totalProfit = 0;
      let needsReview = 0;
      
      properties?.forEach((p) => {
        if (p.status && byStatus[p.status] !== undefined) {
          byStatus[p.status]++;
        }
        
        if (p.target_market && byMarket[p.target_market] !== undefined) {
          byMarket[p.target_market]++;
        }
        
        const rec = p.recommendations?.[0]?.recommendation;
        if (rec && byRecommendation[rec] !== undefined) {
          byRecommendation[rec]++;
        }
        
        const score = p.buy_box_evaluations?.[0]?.total_score;
        if (score) {
          totalScore += score;
          scoredCount++;
        }
        
        const profit = p.recommendations?.[0]?.projected_profit;
        if (profit && profit > 0) {
          totalProfit += profit;
        }
        
        if (p.status === 'analyzed' || p.status === 'pending_review') {
          needsReview++;
        }
      });
      
      setSummary({
        total_properties: properties?.length || 0,
        by_status: byStatus,
        by_recommendation: byRecommendation,
        by_market: byMarket,
        avg_score: scoredCount > 0 ? totalScore / scoredCount : 0,
        total_potential_profit: totalProfit,
        properties_needing_review: needsReview,
      });
      
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, refresh: fetchSummary };
}

// =============================================================================
// PROPERTIES LIST HOOK
// =============================================================================

export function useProperties(filters) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      
      if (isDemoMode) {
        // Return mock data in demo mode
        await new Promise(resolve => setTimeout(resolve, 300));
        
        let filtered = [...MOCK_PROPERTIES];
        
        if (filters?.search) {
          filtered = filtered.filter(p => 
            p.address.toLowerCase().includes(filters.search.toLowerCase())
          );
        }
        
        if (filters?.market?.length) {
          filtered = filtered.filter(p => filters.market.includes(p.target_market));
        }
        
        if (filters?.recommendation?.length) {
          filtered = filtered.filter(p => 
            p.recommendation && filters.recommendation.includes(p.recommendation)
          );
        }
        
        setProperties(filtered);
        return;
      }
      
      let query = supabase
        .from('deal_analyzer.properties')
        .select(`
          id,
          address,
          city,
          target_market,
          asking_price,
          lot_size_sf,
          status,
          created_at,
          buy_box_evaluations:deal_analyzer.buy_box_evaluations(
            total_score,
            has_disqualifier,
            instant_disqualifiers,
            best_product
          ),
          recommendations:deal_analyzer.recommendations(
            recommendation,
            projected_profit,
            projected_roi,
            max_offer_price
          )
        `)
        .order('created_at', { ascending: false });
      
      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }
      
      if (filters?.market?.length) {
        query = query.in('target_market', filters.market);
      }
      
      if (filters?.maxPrice) {
        query = query.lte('asking_price', filters.maxPrice);
      }
      
      if (filters?.search) {
        query = query.ilike('address', `%${filters.search}%`);
      }
      
      const { data, error: queryError } = await query;
      
      if (queryError) throw queryError;
      
      // Transform to PropertyCardData
      const cards = (data || []).map((p) => {
        const eval_ = p.buy_box_evaluations?.[0];
        const rec = p.recommendations?.[0];
        
        return {
          id: p.id,
          address: p.address,
          city: p.city,
          market: p.target_market,
          asking_price: p.asking_price,
          lot_size_sf: p.lot_size_sf,
          status: p.status,
          score: eval_?.total_score,
          recommendation: rec?.recommendation,
          best_product: eval_?.best_product,
          projected_profit: rec?.projected_profit,
          projected_roi: rec?.projected_roi,
          max_offer: rec?.max_offer_price,
          has_disqualifier: eval_?.has_disqualifier,
          disqualifier_reasons: eval_?.instant_disqualifiers?.map((d) => d.reason),
          created_at: p.created_at,
          analyzed_at: rec ? new Date().toISOString() : undefined,
        };
      });
      
      // Filter by recommendation if specified
      let filtered = cards;
      if (filters?.recommendation?.length) {
        filtered = cards.filter(c => 
          c.recommendation && filters.recommendation.includes(c.recommendation)
        );
      }
      
      if (filters?.minScore) {
        filtered = filtered.filter(c => 
          c.score && c.score >= filters.minScore
        );
      }
      
      setProperties(filtered);
      
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return { properties, loading, error, refresh: fetchProperties };
}

// =============================================================================
// SINGLE PROPERTY HOOK
// =============================================================================

export function useProperty(propertyId) {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProperty = useCallback(async () => {
    if (!propertyId) {
      setProperty(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const found = MOCK_PROPERTIES.find(p => p.id === propertyId);
        setProperty(found || null);
        return;
      }
      
      const { data, error: queryError } = await supabase
        .from('deal_analyzer.properties')
        .select(`
          *,
          gis_data:deal_analyzer.gis_property_data(*),
          buy_box_evaluation:deal_analyzer.buy_box_evaluations(*),
          scenario_analyses:deal_analyzer.scenario_analyses(*),
          recommendation:deal_analyzer.recommendations(*),
          comparables:deal_analyzer.comparables(*)
        `)
        .eq('id', propertyId)
        .single();
      
      if (queryError) throw queryError;
      
      const prop = {
        ...data,
        gis_data: data.gis_data?.[0] || data.gis_data,
        buy_box_evaluation: data.buy_box_evaluation?.[0] || data.buy_box_evaluation,
        recommendation: data.recommendation?.[0] || data.recommendation,
      };
      
      setProperty(prop);
      
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  return { property, loading, error, refresh: fetchProperty };
}

// =============================================================================
// PROPERTY ACTIONS HOOK
// =============================================================================

export function usePropertyActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createProperty = async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newProp = {
          id: `prop-${Date.now()}`,
          ...data,
          state: data.state || 'SC',
          status: 'new',
          lot_size_acres: data.lot_size_sf / 43560,
          created_at: new Date().toISOString(),
        };
        MOCK_PROPERTIES.unshift(newProp);
        return newProp;
      }
      
      const { data: property, error: insertError } = await supabase
        .from('deal_analyzer.properties')
        .insert({
          ...data,
          state: data.state || 'SC',
          property_type: data.property_type || 'vacant_lot',
          source: data.source || 'manual',
          status: 'new',
          lot_size_acres: data.lot_size_sf / 43560,
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      return property;
      
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const enrichProperty = async (propertyId) => {
    try {
      setLoading(true);
      setError(null);
      
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const prop = MOCK_PROPERTIES.find(p => p.id === propertyId);
        if (prop) prop.status = 'enriched';
        return { success: true };
      }
      
      const { data: property } = await supabase
        .from('deal_analyzer.properties')
        .select('address, city, state')
        .eq('id', propertyId)
        .single();
      
      if (!property) throw new Error('Property not found');
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enrich-property`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            property_id: propertyId,
            address: property.address,
            city: property.city,
            state: property.state,
          }),
        }
      );
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Enrichment failed');
      }
      
      return result;
      
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const analyzeProperty = async (propertyId) => {
    try {
      setLoading(true);
      setError(null);
      
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const prop = MOCK_PROPERTIES.find(p => p.id === propertyId);
        if (prop) {
          prop.status = 'analyzed';
          prop.score = Math.floor(Math.random() * 30) + 60;
          const recs = ['STRONG_BUY', 'BUY', 'HOLD', 'PASS'];
          prop.recommendation = recs[Math.floor(Math.random() * recs.length)];
          prop.best_product = ['cherry', 'magnolia', 'atlas'][Math.floor(Math.random() * 3)];
          prop.projected_profit = Math.floor(Math.random() * 50000) + 30000;
          prop.projected_roi = Math.floor(Math.random() * 15) + 12;
          prop.max_offer = prop.asking_price * 0.9;
        }
        return { success: true };
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-property`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ property_id: propertyId }),
        }
      );
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Analysis failed');
      }
      
      return result;
      
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePropertyStatus = async (propertyId, status, notes) => {
    try {
      setLoading(true);
      setError(null);
      
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const prop = MOCK_PROPERTIES.find(p => p.id === propertyId);
        if (prop) prop.status = status;
        return;
      }
      
      const { error: updateError } = await supabase
        .from('deal_analyzer.properties')
        .update({ 
          status, 
          updated_at: new Date().toISOString(),
        })
        .eq('id', propertyId);
      
      if (updateError) throw updateError;
      
      if (status === 'approved' || status === 'rejected') {
        await supabase
          .from('deal_analyzer.recommendations')
          .update({
            reviewed_at: new Date().toISOString(),
            review_decision: status,
            review_notes: notes,
          })
          .eq('property_id', propertyId);
      }
      
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProperty = async (propertyId) => {
    try {
      setLoading(true);
      setError(null);
      
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const idx = MOCK_PROPERTIES.findIndex(p => p.id === propertyId);
        if (idx > -1) MOCK_PROPERTIES.splice(idx, 1);
        return;
      }
      
      const { error: deleteError } = await supabase
        .from('deal_analyzer.properties')
        .delete()
        .eq('id', propertyId);
      
      if (deleteError) throw deleteError;
      
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createProperty,
    enrichProperty,
    analyzeProperty,
    updatePropertyStatus,
    deleteProperty,
    loading,
    error,
  };
}

// =============================================================================
// REAL-TIME SUBSCRIPTION HOOKS
// =============================================================================

export function usePropertySubscription(propertyId, onUpdate) {
  useEffect(() => {
    if (!propertyId || isDemoMode) return;
    
    const subscription = supabase
      .channel(`property:${propertyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'deal_analyzer',
          table: 'properties',
          filter: `id=eq.${propertyId}`,
        },
        (payload) => {
          if (payload.new) {
            onUpdate(payload.new);
          }
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [propertyId, onUpdate]);
}

export function usePipelineSubscription(onUpdate) {
  useEffect(() => {
    if (isDemoMode) return;
    
    const subscription = supabase
      .channel('pipeline-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'deal_analyzer',
          table: 'properties',
        },
        () => {
          onUpdate();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'deal_analyzer',
          table: 'recommendations',
        },
        () => {
          onUpdate();
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [onUpdate]);
}
