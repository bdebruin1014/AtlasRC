
import { supabase } from '@/lib/supabase';

/**
 * Project Service - Handles all Supabase operations for projects
 */

export const projectService = {
  /**
   * Get all projects with entity name joined
   */
  async getAll() {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        entity:entities(id, name),
        opportunity:opportunities(id, deal_number, address)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get a single project by ID with full details
   */
  async getById(id) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        entity:entities(id, name, type),
        opportunity:opportunities(id, deal_number, address, city, state)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create a new project
   */
  async create(projectData) {
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        ...projectData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing project
   */
  async update(id, projectData) {
    const { data, error } = await supabase
      .from('projects')
      .update({
        ...projectData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a project
   */
  async delete(id) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  /**
   * Get projects by status
   */
  async getByStatus(status) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        entity:entities(id, name)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get projects by entity
   */
  async getByEntity(entityId) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get project statistics
   */
  async getStats() {
    const { data, error } = await supabase
      .from('projects')
      .select('status, budget');

    if (error) throw error;

    const stats = {
      total: data.length,
      active: data.filter(p => p.status === 'active').length,
      completed: data.filter(p => p.status === 'completed').length,
      onHold: data.filter(p => p.status === 'on-hold').length,
      cancelled: data.filter(p => p.status === 'cancelled').length,
      totalBudget: data.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0)
    };

    return stats;
  }
};

export default projectService;
