import { supabase } from '@/lib/supabase';

// =====================================================
// FLOOR PLANS
// =====================================================

export const getFloorPlans = async (filters = {}) => {
  let query = supabase.from('floor_plans').select('*');

  if (filters.plan_type) query = query.eq('plan_type', filters.plan_type);
  if (filters.garage_type) query = query.eq('garage_type', filters.garage_type);
  if (filters.bedrooms) query = query.eq('bedrooms', filters.bedrooms);
  if (filters.is_active !== undefined) query = query.eq('is_active', filters.is_active);

  query = query.order('plan_name');

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getFloorPlanById = async (id) => {
  const { data, error } = await supabase
    .from('floor_plans')
    .select('*, plan_elevations(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const createFloorPlan = async (planData) => {
  const { data, error } = await supabase
    .from('floor_plans')
    .insert([planData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateFloorPlan = async (id, updates) => {
  const { data, error } = await supabase
    .from('floor_plans')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteFloorPlan = async (id) => {
  const { error } = await supabase
    .from('floor_plans')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

// =====================================================
// PLAN ELEVATIONS
// =====================================================

export const getPlanElevations = async (floorPlanId) => {
  const { data, error } = await supabase
    .from('plan_elevations')
    .select('*')
    .eq('floor_plan_id', floorPlanId)
    .order('elevation_code');

  if (error) throw error;
  return data;
};

export const createPlanElevation = async (elevationData) => {
  const { data, error } = await supabase
    .from('plan_elevations')
    .insert([elevationData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePlanElevation = async (id, updates) => {
  const { data, error } = await supabase
    .from('plan_elevations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deletePlanElevation = async (id) => {
  const { error } = await supabase
    .from('plan_elevations')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};
