// src/services/opportunityComparablesService.js
// Opportunity Comparables Service — connects to opportunity_comparables table

import { supabase, isDemoMode } from '@/lib/supabase';

// ============================================
// MOCK DATA (fallback)
// ============================================

const mockComparables = [
  {
    id: 'opp-comp-1',
    opportunity_id: 'demo',
    address: '245 Oak Ridge Dr',
    city: 'Greenville',
    state: 'SC',
    sale_date: '2025-11-15',
    sale_price: 185000,
    square_footage: 1450,
    price_per_sqft: 127.59,
    lot_size_acres: 0.28,
    bedrooms: 3,
    bathrooms: 2,
    year_built: 2004,
    distance_miles: 0.8,
    notes: 'Similar lot size and layout. Updated kitchen. Sold above asking.',
    source: 'MLS',
    created_at: new Date().toISOString(),
  },
  {
    id: 'opp-comp-2',
    opportunity_id: 'demo',
    address: '112 Maple Ln',
    city: 'Greenville',
    state: 'SC',
    sale_date: '2025-12-02',
    sale_price: 172500,
    square_footage: 1320,
    price_per_sqft: 130.68,
    lot_size_acres: 0.22,
    bedrooms: 3,
    bathrooms: 1.5,
    year_built: 1998,
    distance_miles: 1.2,
    notes: 'Needs cosmetic updates. Smaller lot but similar neighborhood.',
    source: 'MLS',
    created_at: new Date().toISOString(),
  },
  {
    id: 'opp-comp-3',
    opportunity_id: 'demo',
    address: '890 Birch Creek Way',
    city: 'Greenville',
    state: 'SC',
    sale_date: '2026-01-20',
    sale_price: 198000,
    square_footage: 1580,
    price_per_sqft: 125.32,
    lot_size_acres: 0.35,
    bedrooms: 4,
    bathrooms: 2.5,
    year_built: 2010,
    distance_miles: 1.5,
    notes: 'Larger home on bigger lot. Two-car garage. Good condition.',
    source: 'County Records',
    created_at: new Date().toISOString(),
  },
];

// ============================================
// CRUD OPERATIONS
// ============================================

export async function getComparables(opportunityId) {
  try {
    const { data, error } = await supabase
      .from('opportunity_comparables')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .order('sale_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching opportunity comparables:', error);
    return mockComparables.map(c => ({ ...c, opportunity_id: opportunityId }));
  }
}

export async function createComparable(opportunityId, compData) {
  try {
    // Auto-calculate price_per_sqft if not provided
    const pricePerSqft = compData.price_per_sqft ||
      (compData.sale_price && compData.square_footage
        ? parseFloat((compData.sale_price / compData.square_footage).toFixed(2))
        : null);

    const payload = {
      ...compData,
      price_per_sqft: pricePerSqft,
      opportunity_id: opportunityId,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('opportunity_comparables')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating opportunity comparable:', error);
    const pricePerSqft = compData.price_per_sqft ||
      (compData.sale_price && compData.square_footage
        ? parseFloat((compData.sale_price / compData.square_footage).toFixed(2))
        : null);
    return {
      ...compData,
      price_per_sqft: pricePerSqft,
      id: `opp-comp-${Date.now()}`,
      opportunity_id: opportunityId,
      created_at: new Date().toISOString(),
    };
  }
}

export async function updateComparable(compId, updates) {
  try {
    const { data, error } = await supabase
      .from('opportunity_comparables')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', compId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating opportunity comparable:', error);
    return { id: compId, ...updates };
  }
}

export async function deleteComparable(compId) {
  try {
    const { error } = await supabase
      .from('opportunity_comparables')
      .delete()
      .eq('id', compId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting opportunity comparable:', error);
    return true;
  }
}

export default {
  getComparables,
  createComparable,
  updateComparable,
  deleteComparable,
};
