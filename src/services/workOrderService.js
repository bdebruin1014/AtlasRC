import { supabase } from '@/lib/supabase';

export const workOrderService = {
  // Get all work orders for a project
  async getAll(projectId, options = {}) {
    let query = supabase
      .from('work_orders')
      .select(`
        *,
        vendor:vendors(id, name, contact_name, phone, email),
        assigned_user:profiles(id, full_name)
      `)
      .order('created_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (options.status && options.status !== 'all') {
      query = query.eq('status', options.status);
    }

    if (options.priority) {
      query = query.eq('priority', options.priority);
    }

    if (options.vendorId) {
      query = query.eq('vendor_id', options.vendorId);
    }

    return await query;
  },

  // Get single work order by ID
  async getById(id) {
    return await supabase
      .from('work_orders')
      .select(`
        *,
        vendor:vendors(id, name, contact_name, phone, email),
        assigned_user:profiles(id, full_name),
        activities:work_order_activity(*)
      `)
      .eq('id', id)
      .single();
  },

  // Create a new work order
  async create(workOrder) {
    // Generate work order number
    const { data: woNumber } = await supabase.rpc('generate_work_order_number', {
      p_project_id: workOrder.project_id,
    });

    return await supabase
      .from('work_orders')
      .insert({
        ...workOrder,
        work_order_number: woNumber || workOrder.work_order_number,
      })
      .select()
      .single();
  },

  // Update a work order
  async update(id, updates) {
    return await supabase
      .from('work_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  },

  // Delete a work order
  async delete(id) {
    return await supabase
      .from('work_orders')
      .delete()
      .eq('id', id);
  },

  // Update work order status
  async updateStatus(id, status, notes = null) {
    const updates = { status };

    // Add activity log
    if (notes) {
      try {
        await supabase.from('work_order_activity').insert({
          work_order_id: id,
          activity_type: 'status_change',
          description: `Status changed to ${status}${notes ? `: ${notes}` : ''}`,
        });
      } catch (err) {
        console.error('workOrderService.updateStatus activity log error:', err);
      }
    }

    return this.update(id, updates);
  },

  // Assign vendor to work order
  async assignVendor(id, vendorId, scheduledDate = null) {
    const updates = {
      vendor_id: vendorId,
      status: 'assigned',
    };

    if (scheduledDate) {
      updates.scheduled_date = scheduledDate;
      updates.status = 'scheduled';
    }

    return this.update(id, updates);
  },

  // Add activity/comment to work order
  async addActivity(workOrderId, activityType, description, data = {}) {
    return await supabase
      .from('work_order_activity')
      .insert({
        work_order_id: workOrderId,
        activity_type: activityType,
        description,
        activity_data: data,
      })
      .select()
      .single();
  },

  // Get activities for a work order
  async getActivities(workOrderId) {
    return await supabase
      .from('work_order_activity')
      .select(`
        *,
        user:profiles(id, full_name, avatar_url)
      `)
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: false });
  },

  // Get work order summary/stats
  async getSummary(projectId) {
    const { data: workOrders, error } = await this.getAll(projectId);

    if (error) return { data: null, error };

    const today = new Date();

    return {
      data: {
        total: workOrders.length,
        open: workOrders.filter(wo => wo.status === 'open').length,
        inProgress: workOrders.filter(wo => wo.status === 'in_progress').length,
        completed: workOrders.filter(wo => wo.status === 'completed').length,
        overdue: workOrders.filter(wo => wo.due_date && new Date(wo.due_date) < today && !['completed', 'closed', 'cancelled'].includes(wo.status)).length,
        urgent: workOrders.filter(wo => wo.priority === 'urgent' && !['completed', 'closed', 'cancelled'].includes(wo.status)).length,
        estimatedCost: workOrders.reduce((sum, wo) => sum + (parseFloat(wo.estimated_cost) || 0), 0),
        actualCost: workOrders.reduce((sum, wo) => sum + (parseFloat(wo.actual_cost) || 0), 0),
      },
      error: null,
    };
  },
};

export default workOrderService;
