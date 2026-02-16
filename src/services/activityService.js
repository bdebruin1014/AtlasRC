// src/services/activityService.js
// Unified Activity Logging System for Atlas
// Tracks all entity changes across the platform

import { supabase } from '@/lib/supabase';

export const activityService = {
  /**
   * Log an activity event
   * @param {Object} params
   * @param {string} params.entityType - 'project', 'opportunity', 'contact', 'entity', 'house'
   * @param {string} params.entityId - UUID of the entity
   * @param {string} params.action - 'created', 'updated', 'status_changed', 'deleted', 'converted'
   * @param {string} [params.fieldChanged] - Name of the field that changed
   * @param {string} [params.oldValue] - Previous value
   * @param {string} [params.newValue] - New value
   * @param {string} [params.performedBy] - UUID of the user who performed the action
   * @param {Object} [params.metadata] - Additional metadata as JSON
   * @returns {Promise<Object|null>} The created activity log entry or null on error
   */
  async log({ entityType, entityId, action, fieldChanged, oldValue, newValue, performedBy, metadata = {} }) {
    try {
      const { data, error } = await supabase
        .from('activity_log')
        .insert([{
          entity_type: entityType,
          entity_id: entityId,
          action,
          field_changed: fieldChanged || null,
          old_value: oldValue || null,
          new_value: newValue || null,
          performed_by: performedBy || null,
          metadata,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging activity:', error);
      return null;
    }
  },

  /**
   * Get activities for a specific entity
   * @param {string} entityType - The type of entity
   * @param {string} entityId - The UUID of the entity
   * @param {number} [limit=50] - Max number of results
   * @returns {Promise<Array>} List of activity log entries with user profile info
   */
  async getForEntity(entityType, entityId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('activity_log')
        .select(`
          *,
          performer:profiles!activity_log_performed_by_fkey(
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching entity activities:', error);
      return [];
    }
  },

  /**
   * Get recent activities across all entities
   * @param {number} [limit=20] - Max number of results
   * @returns {Promise<Array>} List of recent activity log entries
   */
  async getRecent(limit = 20) {
    try {
      const { data, error } = await supabase
        .from('activity_log')
        .select(`
          *,
          performer:profiles!activity_log_performed_by_fkey(
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  },

  /**
   * Get activities performed by a specific user
   * @param {string} userId - UUID of the user
   * @param {number} [limit=50] - Max number of results
   * @returns {Promise<Array>} List of activity log entries for the user
   */
  async getByUser(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('activity_log')
        .select(`
          *,
          performer:profiles!activity_log_performed_by_fkey(
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('performed_by', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user activities:', error);
      return [];
    }
  },

  /**
   * Search activities by action or field_changed
   * @param {string} query - Search term
   * @param {number} [limit=20] - Max number of results
   * @returns {Promise<Array>} List of matching activity log entries
   */
  async search(query, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('activity_log')
        .select(`
          *,
          performer:profiles!activity_log_performed_by_fkey(
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .or(`action.ilike.%${query}%,field_changed.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching activities:', error);
      return [];
    }
  },
};

export default activityService;
