import { supabase, isDemoMode } from '@/lib/supabase';

// Demo data for work orders
const demoWorkOrders = [
  {
    id: 'wo-1',
    work_order_number: 'WO-2501-0001',
    title: 'HVAC Unit Repair - Unit 4B',
    description: 'AC unit not cooling properly. Tenant reported issue on 1/20.',
    work_type: 'repair',
    priority: 'high',
    status: 'in_progress',
    vendor_id: 'v-1',
    vendor_name: 'Cool Air HVAC Services',
    vendor_contact: 'Mike Johnson',
    vendor_phone: '(512) 555-0123',
    vendor_email: 'mike@coolairhvac.com',
    location: 'Building A',
    unit_number: '4B',
    scheduled_date: '2025-01-25',
    due_date: '2025-01-27',
    estimated_cost: 850,
    actual_cost: null,
    assigned_to: 'John Smith',
    project_id: 'proj-1',
    created_at: '2025-01-20T10:30:00Z',
  },
  {
    id: 'wo-2',
    work_order_number: 'WO-2501-0002',
    title: 'Electrical Panel Inspection',
    description: 'Annual electrical panel inspection required by code.',
    work_type: 'inspection',
    priority: 'normal',
    status: 'scheduled',
    vendor_id: 'v-2',
    vendor_name: 'Spark Electric Co',
    vendor_contact: 'Sarah Chen',
    vendor_phone: '(512) 555-0456',
    vendor_email: 'sarah@sparkelectric.com',
    location: 'Building B',
    unit_number: null,
    scheduled_date: '2025-01-28',
    due_date: '2025-01-31',
    estimated_cost: 350,
    actual_cost: null,
    assigned_to: 'Jane Doe',
    project_id: 'proj-1',
    created_at: '2025-01-22T14:00:00Z',
  },
  {
    id: 'wo-3',
    work_order_number: 'WO-2501-0003',
    title: 'Plumbing Leak Repair',
    description: 'Water leak under kitchen sink. Needs immediate attention.',
    work_type: 'repair',
    priority: 'urgent',
    status: 'open',
    vendor_id: null,
    vendor_name: null,
    location: 'Building A',
    unit_number: '2A',
    scheduled_date: null,
    due_date: '2025-01-24',
    estimated_cost: 400,
    actual_cost: null,
    assigned_to: null,
    project_id: 'proj-1',
    created_at: '2025-01-23T08:00:00Z',
  },
];

let mockData = [...demoWorkOrders];

export const workOrderService = {
  // Get all work orders for a project
  async getAll(projectId, options = {}) {
    if (isDemoMode) {
      let filtered = mockData.filter(wo => !projectId || wo.project_id === projectId);

      if (options.status && options.status !== 'all') {
        filtered = filtered.filter(wo => wo.status === options.status);
      }

      if (options.priority) {
        filtered = filtered.filter(wo => wo.priority === options.priority);
      }

      if (options.vendorId) {
        filtered = filtered.filter(wo => wo.vendor_id === options.vendorId);
      }

      return { data: filtered, error: null };
    }

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
    if (isDemoMode) {
      const wo = mockData.find(w => w.id === id);
      return { data: wo || null, error: wo ? null : 'Not found' };
    }

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
    if (isDemoMode) {
      const newWO = {
        ...workOrder,
        id: `wo-${Date.now()}`,
        work_order_number: `WO-${new Date().toISOString().slice(2, 4)}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(mockData.length + 1).padStart(4, '0')}`,
        created_at: new Date().toISOString(),
        status: workOrder.status || 'open',
      };
      mockData.push(newWO);
      return { data: newWO, error: null };
    }

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
    if (isDemoMode) {
      const index = mockData.findIndex(wo => wo.id === id);
      if (index !== -1) {
        mockData[index] = { ...mockData[index], ...updates };
        return { data: mockData[index], error: null };
      }
      return { data: null, error: 'Not found' };
    }

    return await supabase
      .from('work_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  },

  // Delete a work order
  async delete(id) {
    if (isDemoMode) {
      const index = mockData.findIndex(wo => wo.id === id);
      if (index !== -1) {
        mockData.splice(index, 1);
        return { error: null };
      }
      return { error: 'Not found' };
    }

    return await supabase
      .from('work_orders')
      .delete()
      .eq('id', id);
  },

  // Update work order status
  async updateStatus(id, status, notes = null) {
    const updates = { status };

    // Add activity log
    if (!isDemoMode && notes) {
      await supabase.from('work_order_activity').insert({
        work_order_id: id,
        activity_type: 'status_change',
        description: `Status changed to ${status}${notes ? `: ${notes}` : ''}`,
      });
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
    if (isDemoMode) {
      return { data: { id: Date.now(), work_order_id: workOrderId, activity_type: activityType, description }, error: null };
    }

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
    if (isDemoMode) {
      return { data: [], error: null };
    }

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
    if (isDemoMode) {
      const filtered = mockData.filter(wo => !projectId || wo.project_id === projectId);
      return {
        data: {
          total: filtered.length,
          open: filtered.filter(wo => wo.status === 'open').length,
          inProgress: filtered.filter(wo => wo.status === 'in_progress').length,
          completed: filtered.filter(wo => wo.status === 'completed').length,
          overdue: filtered.filter(wo => wo.due_date && new Date(wo.due_date) < new Date() && !['completed', 'closed', 'cancelled'].includes(wo.status)).length,
          urgent: filtered.filter(wo => wo.priority === 'urgent' && !['completed', 'closed', 'cancelled'].includes(wo.status)).length,
          estimatedCost: filtered.reduce((sum, wo) => sum + (wo.estimated_cost || 0), 0),
          actualCost: filtered.reduce((sum, wo) => sum + (wo.actual_cost || 0), 0),
        },
        error: null,
      };
    }

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
