import { supabase } from '@/lib/supabase';

/**
 * Project Service - Handles all Supabase operations for projects
 */
export const projectService = {
  /**
   * Get all projects with entity name joined
   */
  async getAll(filters = {}) {
    let query = supabase
      .from('projects')
      .select(`
        *,
        entity:entities(id, name, type),
        opportunity:opportunities(id, deal_number, address),
        manager:profiles(id, full_name, avatar_url)
      `);

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.entity_id) {
      query = query.eq('entity_id', filters.entity_id);
    }
    if (filters.property_type) {
      query = query.eq('property_type', filters.property_type);
    }
    if (filters.manager_id) {
      query = query.eq('manager_id', filters.manager_id);
    }
    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }
    if (filters.state) {
      query = query.eq('state', filters.state);
    }

    // Search by name or address
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,address.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

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
        opportunity:opportunities(id, deal_number, address, city, state),
        manager:profiles(id, full_name, email, avatar_url)
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
        updated_at: new Date().toISOString(),
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
        updated_at: new Date().toISOString(),
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
   * Update project status
   */
  async updateStatus(id, status, notes = null) {
    const updates = {
      status,
      status_updated_at: new Date().toISOString(),
    };

    // Record status history
    if (notes) {
      const { data: current } = await supabase
        .from('projects')
        .select('status_history')
        .eq('id', id)
        .single();

      const history = current?.status_history || [];
      history.push({
        status,
        notes,
        timestamp: new Date().toISOString(),
      });
      updates.status_history = history;
    }

    return this.update(id, updates);
  },

  /**
   * Get project statistics
   */
  async getStats() {
    const { data, error } = await supabase
      .from('projects')
      .select('status, budget, actual_cost');

    if (error) throw error;

    const stats = {
      total: data.length,
      active: data.filter(p => p.status === 'active').length,
      planning: data.filter(p => p.status === 'planning').length,
      completed: data.filter(p => p.status === 'completed').length,
      onHold: data.filter(p => p.status === 'on-hold').length,
      cancelled: data.filter(p => p.status === 'cancelled').length,
      totalBudget: data.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0),
      totalActualCost: data.reduce((sum, p) => sum + (parseFloat(p.actual_cost) || 0), 0),
      budgetVariance: 0,
    };

    stats.budgetVariance = stats.totalBudget - stats.totalActualCost;

    return stats;
  },

  /**
   * Get project financials
   */
  async getFinancials(projectId) {
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('budget, actual_cost, contingency, soft_costs, hard_costs')
      .eq('id', projectId)
      .single();

    if (projectError) throw projectError;

    // Get associated transactions
    const { data: transactions, error: txnError } = await supabase
      .from('transactions')
      .select('amount, type, category, date')
      .eq('project_id', projectId);

    if (txnError) throw txnError;

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    const expensesByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + (parseFloat(t.amount) || 0);
        return acc;
      }, {});

    return {
      budget: parseFloat(project.budget) || 0,
      actualCost: parseFloat(project.actual_cost) || expenses,
      contingency: parseFloat(project.contingency) || 0,
      softCosts: parseFloat(project.soft_costs) || 0,
      hardCosts: parseFloat(project.hard_costs) || 0,
      totalIncome: income,
      totalExpenses: expenses,
      netCashFlow: income - expenses,
      budgetRemaining: (parseFloat(project.budget) || 0) - expenses,
      percentSpent: project.budget ? (expenses / parseFloat(project.budget)) * 100 : 0,
      expensesByCategory,
    };
  },

  /**
   * Get project milestones
   */
  async getMilestones(projectId) {
    const { data, error } = await supabase
      .from('project_milestones')
      .select('*')
      .eq('project_id', projectId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Add milestone to project
   */
  async addMilestone(projectId, milestone) {
    const { data, error } = await supabase
      .from('project_milestones')
      .insert([{
        project_id: projectId,
        ...milestone,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update milestone
   */
  async updateMilestone(milestoneId, updates) {
    const { data, error } = await supabase
      .from('project_milestones')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', milestoneId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get project team members
   */
  async getTeam(projectId) {
    const { data, error } = await supabase
      .from('project_team')
      .select(`
        *,
        user:profiles(id, full_name, email, avatar_url, role)
      `)
      .eq('project_id', projectId);

    if (error) throw error;
    return data;
  },

  /**
   * Add team member to project
   */
  async addTeamMember(projectId, userId, role) {
    const { data, error } = await supabase
      .from('project_team')
      .insert([{
        project_id: projectId,
        user_id: userId,
        role,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Remove team member from project
   */
  async removeTeamMember(projectId, userId) {
    const { error } = await supabase
      .from('project_team')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  },

  /**
   * Get project documents
   */
  async getDocuments(projectId) {
    const { data, error } = await supabase
      .from('project_documents')
      .select(`
        *,
        uploaded_by:profiles(id, full_name)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Add document to project
   */
  async addDocument(projectId, document) {
    const { data, error } = await supabase
      .from('project_documents')
      .insert([{
        project_id: projectId,
        ...document,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get project activity log
   */
  async getActivity(projectId, limit = 50) {
    const { data, error } = await supabase
      .from('project_activities')
      .select(`
        *,
        user:profiles(id, full_name, avatar_url)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  /**
   * Add activity to project
   */
  async addActivity(projectId, activity) {
    const { data, error } = await supabase
      .from('project_activities')
      .insert([{
        project_id: projectId,
        ...activity,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get project timeline (gantt data)
   */
  async getTimeline(projectId) {
    const [milestones, tasks] = await Promise.all([
      this.getMilestones(projectId),
      supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('start_date', { ascending: true })
        .then(({ data, error }) => {
          if (error) throw error;
          return data;
        }),
    ]);

    return {
      milestones: milestones.map(m => ({
        id: m.id,
        name: m.name,
        date: m.due_date,
        type: 'milestone',
        status: m.status,
      })),
      tasks: tasks.map(t => ({
        id: t.id,
        name: t.name,
        start: t.start_date,
        end: t.end_date,
        type: 'task',
        status: t.status,
        percentComplete: t.percent_complete || 0,
      })),
    };
  },

  /**
   * Search projects
   */
  async search(query, limit = 20) {
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, address, city, state, status')
      .or(`name.ilike.%${query}%,address.ilike.%${query}%`)
      .limit(limit);

    if (error) throw error;
    return data;
  },

  /**
   * Get projects with upcoming deadlines
   */
  async getUpcomingDeadlines(days = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await supabase
      .from('project_milestones')
      .select(`
        *,
        project:projects(id, name, status)
      `)
      .lte('due_date', futureDate.toISOString())
      .gte('due_date', new Date().toISOString())
      .neq('status', 'completed')
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get projects over budget
   */
  async getOverBudget() {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        entity:entities(id, name)
      `)
      .not('budget', 'is', null)
      .not('actual_cost', 'is', null);

    if (error) throw error;

    // Filter to projects where actual > budget
    return data.filter(p =>
      parseFloat(p.actual_cost) > parseFloat(p.budget)
    );
  },

  /**
   * Clone a project (create copy with new name)
   */
  async clone(projectId, newName) {
    const original = await this.getById(projectId);
    if (!original) throw new Error('Project not found');

    // Remove fields that shouldn't be copied
    const {
      id,
      created_at,
      updated_at,
      actual_cost,
      status_history,
      ...copyData
    } = original;

    return this.create({
      ...copyData,
      name: newName || `${original.name} (Copy)`,
      status: 'planning',
      actual_cost: 0,
    });
  },

  /**
   * Bulk update project status
   */
  async bulkUpdateStatus(ids, status) {
    const { data, error } = await supabase
      .from('projects')
      .update({
        status,
        status_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .in('id', ids)
      .select();

    if (error) throw error;
    return data;
  },
};

export default projectService;
