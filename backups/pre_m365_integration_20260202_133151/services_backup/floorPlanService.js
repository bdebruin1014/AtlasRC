import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';

// =====================================================
// FLOOR PLANS
// =====================================================

export const getFloorPlans = async (filters = {}) => {
  if (isDemoMode()) {
    return MOCK_FLOOR_PLANS.filter(plan => {
      if (filters.plan_type && plan.plan_type !== filters.plan_type) return false;
      if (filters.garage_type && plan.garage_type !== filters.garage_type) return false;
      if (filters.bedrooms && plan.bedrooms !== filters.bedrooms) return false;
      if (filters.is_active !== undefined && plan.is_active !== filters.is_active) return false;
      return true;
    });
  }

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
  if (isDemoMode()) {
    return MOCK_FLOOR_PLANS.find(p => p.id === id);
  }

  const { data, error } = await supabase
    .from('floor_plans')
    .select('*, plan_elevations(*)')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createFloorPlan = async (planData) => {
  if (isDemoMode()) {
    const newPlan = {
      id: `plan-${Date.now()}`,
      ...planData,
      is_active: true,
      created_at: new Date().toISOString()
    };
    MOCK_FLOOR_PLANS.push(newPlan);
    return newPlan;
  }

  const { data, error } = await supabase
    .from('floor_plans')
    .insert([planData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateFloorPlan = async (id, updates) => {
  if (isDemoMode()) {
    const index = MOCK_FLOOR_PLANS.findIndex(p => p.id === id);
    if (index !== -1) {
      MOCK_FLOOR_PLANS[index] = { ...MOCK_FLOOR_PLANS[index], ...updates, updated_at: new Date().toISOString() };
      return MOCK_FLOOR_PLANS[index];
    }
    return null;
  }

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
  if (isDemoMode()) {
    const index = MOCK_FLOOR_PLANS.findIndex(p => p.id === id);
    if (index !== -1) {
      MOCK_FLOOR_PLANS.splice(index, 1);
    }
    return true;
  }

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
  if (isDemoMode()) {
    return MOCK_ELEVATIONS.filter(e => e.floor_plan_id === floorPlanId);
  }

  const { data, error } = await supabase
    .from('plan_elevations')
    .select('*')
    .eq('floor_plan_id', floorPlanId)
    .order('elevation_code');
  
  if (error) throw error;
  return data;
};

export const createPlanElevation = async (elevationData) => {
  if (isDemoMode()) {
    const newElevation = {
      id: `elev-${Date.now()}`,
      ...elevationData,
      created_at: new Date().toISOString()
    };
    MOCK_ELEVATIONS.push(newElevation);
    return newElevation;
  }

  const { data, error } = await supabase
    .from('plan_elevations')
    .insert([elevationData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updatePlanElevation = async (id, updates) => {
  if (isDemoMode()) {
    const index = MOCK_ELEVATIONS.findIndex(e => e.id === id);
    if (index !== -1) {
      MOCK_ELEVATIONS[index] = { ...MOCK_ELEVATIONS[index], ...updates };
      return MOCK_ELEVATIONS[index];
    }
    return null;
  }

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
  if (isDemoMode()) {
    const index = MOCK_ELEVATIONS.findIndex(e => e.id === id);
    if (index !== -1) {
      MOCK_ELEVATIONS.splice(index, 1);
    }
    return true;
  }

  const { error} = await supabase
    .from('plan_elevations')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

// =====================================================
// MOCK DATA
// =====================================================

const MOCK_FLOOR_PLANS = [
  {
    id: 'plan-1',
    plan_code: 'ATLAS',
    plan_name: 'Atlas',
    square_footage: 1850,
    bedrooms: 3,
    bathrooms: 2.5,
    garage_type: '2-car',
    stories: 2,
    width_feet: 42,
    depth_feet: 38,
    plan_type: 'single_family',
    description: 'Modern 3-bedroom home with open concept living',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 'plan-2',
    plan_code: 'DOGWOOD',
    plan_name: 'Dogwood',
    square_footage: 2150,
    bedrooms: 4,
    bathrooms: 2.5,
    garage_type: '2-car',
    stories: 2,
    width_feet: 45,
    depth_feet: 42,
    plan_type: 'single_family',
    description: '4-bedroom family home with bonus room',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 'plan-3',
    plan_code: 'MAGNOLIA',
    plan_name: 'Magnolia',
    square_footage: 1650,
    bedrooms: 3,
    bathrooms: 2,
    garage_type: '2-car',
    stories: 1,
    width_feet: 52,
    depth_feet: 42,
    plan_type: 'single_family',
    description: 'Single-story ranch with master suite',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 'plan-4',
    plan_code: 'OAKMONT',
    plan_name: 'Oakmont',
    square_footage: 2450,
    bedrooms: 4,
    bathrooms: 3,
    garage_type: '2-car',
    stories: 2,
    width_feet: 48,
    depth_feet: 45,
    plan_type: 'single_family',
    description: 'Luxury 4-bedroom with office and game room',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 'plan-5',
    plan_code: 'WILLOW',
    plan_name: 'Willow',
    square_footage: 1450,
    bedrooms: 2,
    bathrooms: 2,
    garage_type: '1-car',
    stories: 2,
    width_feet: 22,
    depth_feet: 40,
    plan_type: 'townhome',
    description: 'Narrow lot townhome with rooftop deck',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z'
  }
];

const MOCK_ELEVATIONS = [
  { id: 'elev-1', floor_plan_id: 'plan-1', elevation_code: 'A', elevation_name: 'Traditional', base_siding_type: 'vinyl', elevation_adder: 0, is_active: true },
  { id: 'elev-2', floor_plan_id: 'plan-1', elevation_code: 'B', elevation_name: 'Craftsman', base_siding_type: 'vinyl', elevation_adder: 2500, is_active: true },
  { id: 'elev-3', floor_plan_id: 'plan-1', elevation_code: 'C', elevation_name: 'Modern Farmhouse', base_siding_type: 'hardie', elevation_adder: 5000, is_active: true },
  { id: 'elev-4', floor_plan_id: 'plan-2', elevation_code: 'A', elevation_name: 'Classic', base_siding_type: 'vinyl', elevation_adder: 0, is_active: true },
  { id: 'elev-5', floor_plan_id: 'plan-2', elevation_code: 'B', elevation_name: 'Contemporary', base_siding_type: 'vinyl', elevation_adder: 3000, is_active: true },
  { id: 'elev-6', floor_plan_id: 'plan-3', elevation_code: 'A', elevation_name: 'Traditional Ranch', base_siding_type: 'vinyl', elevation_adder: 0, is_active: true },
  { id: 'elev-7', floor_plan_id: 'plan-3', elevation_code: 'B', elevation_name: 'Prairie Style', base_siding_type: 'hardie', elevation_adder: 4500, is_active: true },
  { id: 'elev-8', floor_plan_id: 'plan-4', elevation_code: 'A', elevation_name: 'European', base_siding_type: 'vinyl', elevation_adder: 0, is_active: true },
  { id: 'elev-9', floor_plan_id: 'plan-4', elevation_code: 'B', elevation_name: 'Colonial', base_siding_type: 'hardie', elevation_adder: 6000, is_active: true },
  { id: 'elev-10', floor_plan_id: 'plan-5', elevation_code: 'A', elevation_name: 'Urban Modern', base_siding_type: 'hardie', elevation_adder: 0, is_active: true }
];

export { MOCK_FLOOR_PLANS, MOCK_ELEVATIONS };
