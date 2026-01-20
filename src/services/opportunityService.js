import { supabase } from '@/lib/supabase';

/**
 * Opportunity Service - Handles all Supabase operations for deal pipeline
 */
export const opportunityService = {
  /**
   * Get all opportunities with optional filtering
   */
  async getAll(filters = {}) {
    let query = supabase
      .from('opportunities')
      .select(`
        *,
        contact:contacts(id, first_name, last_name, email, phone),
        assigned_user:profiles(id, full_name, avatar_url)
      `);

    // Apply filters
    if (filters.stage) {
      query = query.eq('stage', filters.stage);
    }
    if (filters.property_type) {
      query = query.eq('property_type', filters.property_type);
    }
    if (filters.source) {
      query = query.eq('source', filters.source);
    }
    if (filters.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }
    if (filters.is_starred) {
      query = query.eq('is_starred', true);
    }
    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }
    if (filters.state) {
      query = query.eq('state', filters.state);
    }
    if (filters.min_price) {
      query = query.gte('asking_price', filters.min_price);
    }
    if (filters.max_price) {
      query = query.lte('asking_price', filters.max_price);
    }

    // Search by address or deal number
    if (filters.search) {
      query = query.or(`address.ilike.%${filters.search}%,deal_number.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  /**
   * Get a single opportunity by ID with full details
   */
  async getById(id) {
    const { data, error } = await supabase
      .from('opportunities')
      .select(`
        *,
        contact:contacts(id, first_name, last_name, email, phone, company),
        assigned_user:profiles(id, full_name, email, avatar_url)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Create a new opportunity
   */
  async create(opportunity) {
    // Generate deal number if not provided
    if (!opportunity.deal_number) {
      const year = new Date().getFullYear();
      const { count } = await supabase
        .from('opportunities')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${year}-01-01`);
      opportunity.deal_number = `${year}-${String((count || 0) + 1).padStart(4, '0')}`;
    }

    const { data, error } = await supabase
      .from('opportunities')
      .insert([{
        ...opportunity,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Update an existing opportunity
   */
  async update(id, updates) {
    const { data, error } = await supabase
      .from('opportunities')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Delete an opportunity
   */
  async delete(id) {
    const { error } = await supabase
      .from('opportunities')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  /**
   * Update opportunity stage (pipeline progression)
   */
  async updateStage(id, stage, notes = null) {
    const updates = {
      stage,
      stage_updated_at: new Date().toISOString(),
    };

    // Record stage history
    if (notes) {
      const { data: current } = await supabase
        .from('opportunities')
        .select('stage_history')
        .eq('id', id)
        .single();

      const history = current?.stage_history || [];
      history.push({
        stage,
        notes,
        timestamp: new Date().toISOString(),
      });
      updates.stage_history = history;
    }

    return this.update(id, updates);
  },

  /**
   * Get opportunities by stage
   */
  async getByStage(stage) {
    const { data, error } = await supabase
      .from('opportunities')
      .select(`
        *,
        contact:contacts(id, first_name, last_name)
      `)
      .eq('stage', stage)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  /**
   * Toggle starred status
   */
  async toggleStar(id) {
    const { data: current } = await supabase
      .from('opportunities')
      .select('is_starred')
      .eq('id', id)
      .single();

    return this.update(id, { is_starred: !current?.is_starred });
  },

  /**
   * Get starred opportunities
   */
  async getStarred() {
    return this.getAll({ is_starred: true });
  },

  /**
   * Get pipeline statistics
   */
  async getStats() {
    const { data, error } = await supabase
      .from('opportunities')
      .select('stage, asking_price, estimated_value');

    if (error) throw error;

    const stageOrder = ['lead', 'qualified', 'analysis', 'loi', 'due_diligence', 'contract', 'closed_won', 'closed_lost'];
    const stats = {
      total: data.length,
      totalValue: data.reduce((sum, o) => sum + (parseFloat(o.asking_price) || 0), 0),
      potentialValue: data
        .filter(o => !['closed_won', 'closed_lost'].includes(o.stage))
        .reduce((sum, o) => sum + (parseFloat(o.estimated_value || o.asking_price) || 0), 0),
      byStage: {},
    };

    // Count by stage
    stageOrder.forEach(stage => {
      const stageOpps = data.filter(o => o.stage === stage);
      stats.byStage[stage] = {
        count: stageOpps.length,
        value: stageOpps.reduce((sum, o) => sum + (parseFloat(o.asking_price) || 0), 0),
      };
    });

    return stats;
  },

  /**
   * Get recent activity for an opportunity
   */
  async getActivity(opportunityId, limit = 20) {
    const { data, error } = await supabase
      .from('opportunity_activities')
      .select(`
        *,
        user:profiles(id, full_name, avatar_url)
      `)
      .eq('opportunity_id', opportunityId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  /**
   * Add activity/note to an opportunity
   */
  async addActivity(opportunityId, activity) {
    const { data, error } = await supabase
      .from('opportunity_activities')
      .insert([{
        opportunity_id: opportunityId,
        ...activity,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Convert opportunity to project
   */
  async convertToProject(opportunityId, projectData = {}) {
    const opportunity = await this.getById(opportunityId);
    if (!opportunity) throw new Error('Opportunity not found');

    // Create project from opportunity data
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert([{
        name: projectData.name || opportunity.address,
        address: opportunity.address,
        city: opportunity.city,
        state: opportunity.state,
        zip_code: opportunity.zip_code,
        property_type: opportunity.property_type,
        opportunity_id: opportunityId,
        entity_id: projectData.entity_id,
        status: 'planning',
        budget: opportunity.estimated_value || opportunity.asking_price,
        ...projectData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (projectError) throw projectError;

    // Update opportunity stage to closed_won
    await this.updateStage(opportunityId, 'closed_won', `Converted to project: ${project.id}`);

    return project;
  },

  /**
   * Bulk update opportunities
   */
  async bulkUpdate(ids, updates) {
    const { data, error } = await supabase
      .from('opportunities')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .in('id', ids)
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Get opportunities due for follow-up
   */
  async getDueForFollowUp() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('opportunities')
      .select(`
        *,
        contact:contacts(id, first_name, last_name, email, phone)
      `)
      .lte('next_follow_up', today)
      .not('stage', 'in', '("closed_won","closed_lost")')
      .order('next_follow_up', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Search opportunities
   */
  async search(query, limit = 20) {
    const { data, error } = await supabase
      .from('opportunities')
      .select('id, deal_number, address, city, state, stage, asking_price')
      .or(`address.ilike.%${query}%,deal_number.ilike.%${query}%,city.ilike.%${query}%`)
      .limit(limit);

    if (error) throw error;
    return data;
  },

  /**
   * Get opportunities by date range
   */
  async getByDateRange(startDate, endDate) {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};

export default opportunityService;
