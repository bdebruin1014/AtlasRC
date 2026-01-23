import { supabase } from '@/lib/supabase';

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  user_id: string;
  user?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  action: 'create' | 'update' | 'delete' | 'view' | 'login' | 'logout' | 'export' | 'import';
  resource_type: 'opportunity' | 'project' | 'transaction' | 'entity' | 'contact' | 'document' | 'user' | 'settings';
  resource_id: string;
  resource_name: string;
  details?: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export interface CreateActivityData {
  action: ActivityLogEntry['action'];
  resource_type: ActivityLogEntry['resource_type'];
  resource_id: string;
  resource_name: string;
  details?: string;
  metadata?: Record<string, any>;
}

export interface ActivityFilters {
  action?: string;
  resource_type?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

/**
 * Activity Service - Handles activity logging and audit trail
 */
export const activityService = {
  /**
   * Get all activity logs with filtering and pagination
   */
  async getAll(filters: ActivityFilters = {}, limit = 50, offset = 0): Promise<ActivityLogEntry[]> {
    let query = supabase
      .from('activity_logs')
      .select(`
        *,
        user:profiles(id, full_name, email, avatar_url)
      `);

    if (filters.action && filters.action !== 'all') {
      query = query.eq('action', filters.action);
    }
    if (filters.resource_type && filters.resource_type !== 'all') {
      query = query.eq('resource_type', filters.resource_type);
    }
    if (filters.user_id && filters.user_id !== 'all') {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.start_date) {
      query = query.gte('timestamp', filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte('timestamp', filters.end_date + 'T23:59:59Z');
    }
    if (filters.search) {
      query = query.or(`resource_name.ilike.%${filters.search}%,details.ilike.%${filters.search}%`);
    }

    const { data, error } = await query
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  },

  /**
   * Get activity log by ID
   */
  async getById(id: string): Promise<ActivityLogEntry | null> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        user:profiles(id, full_name, email, avatar_url)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Log a new activity
   */
  async log(activity: CreateActivityData): Promise<ActivityLogEntry> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('activity_logs')
      .insert([{
        user_id: user?.id,
        action: activity.action,
        resource_type: activity.resource_type,
        resource_id: activity.resource_id,
        resource_name: activity.resource_name,
        details: activity.details,
        metadata: activity.metadata,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      }])
      .select(`
        *,
        user:profiles(id, full_name, email, avatar_url)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Helper to get client IP (returns placeholder if not available)
   */
  async getClientIP(): Promise<string> {
    try {
      // In a real implementation, this would come from the server
      return 'client';
    } catch {
      return 'unknown';
    }
  },

  /**
   * Log a create action
   */
  async logCreate(resourceType: ActivityLogEntry['resource_type'], resourceId: string, resourceName: string, details?: string) {
    return this.log({
      action: 'create',
      resource_type: resourceType,
      resource_id: resourceId,
      resource_name: resourceName,
      details: details || `Created ${resourceType}: ${resourceName}`,
    });
  },

  /**
   * Log an update action
   */
  async logUpdate(resourceType: ActivityLogEntry['resource_type'], resourceId: string, resourceName: string, details?: string) {
    return this.log({
      action: 'update',
      resource_type: resourceType,
      resource_id: resourceId,
      resource_name: resourceName,
      details: details || `Updated ${resourceType}: ${resourceName}`,
    });
  },

  /**
   * Log a delete action
   */
  async logDelete(resourceType: ActivityLogEntry['resource_type'], resourceId: string, resourceName: string, details?: string) {
    return this.log({
      action: 'delete',
      resource_type: resourceType,
      resource_id: resourceId,
      resource_name: resourceName,
      details: details || `Deleted ${resourceType}: ${resourceName}`,
    });
  },

  /**
   * Log a view action
   */
  async logView(resourceType: ActivityLogEntry['resource_type'], resourceId: string, resourceName: string) {
    return this.log({
      action: 'view',
      resource_type: resourceType,
      resource_id: resourceId,
      resource_name: resourceName,
      details: `Viewed ${resourceType}: ${resourceName}`,
    });
  },

  /**
   * Log login
   */
  async logLogin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    return this.log({
      action: 'login',
      resource_type: 'user',
      resource_id: user.id,
      resource_name: user.email || 'User',
      details: 'Successfully logged in',
    });
  },

  /**
   * Log logout
   */
  async logLogout() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    return this.log({
      action: 'logout',
      resource_type: 'user',
      resource_id: user.id,
      resource_name: user.email || 'User',
      details: 'Logged out',
    });
  },

  /**
   * Log export action
   */
  async logExport(resourceType: ActivityLogEntry['resource_type'], resourceName: string, count: number, format: string) {
    return this.log({
      action: 'export',
      resource_type: resourceType,
      resource_id: 'export',
      resource_name: resourceName,
      details: `Exported ${count} ${resourceType}(s) to ${format} format`,
    });
  },

  /**
   * Log import action
   */
  async logImport(resourceType: ActivityLogEntry['resource_type'], resourceName: string, count: number) {
    return this.log({
      action: 'import',
      resource_type: resourceType,
      resource_id: 'import',
      resource_name: resourceName,
      details: `Imported ${count} ${resourceType}(s)`,
    });
  },

  /**
   * Get activity statistics
   */
  async getStats(days = 30): Promise<{
    total: number;
    creates: number;
    updates: number;
    deletes: number;
    byUser: { userId: string; name: string; count: number }[];
    byResource: Record<string, number>;
    byDay: { date: string; count: number }[];
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        action,
        resource_type,
        user_id,
        timestamp,
        user:profiles(full_name)
      `)
      .gte('timestamp', startDate.toISOString());

    if (error) throw error;

    const stats = {
      total: data.length,
      creates: data.filter(a => a.action === 'create').length,
      updates: data.filter(a => a.action === 'update').length,
      deletes: data.filter(a => a.action === 'delete').length,
      byUser: [] as { userId: string; name: string; count: number }[],
      byResource: {} as Record<string, number>,
      byDay: [] as { date: string; count: number }[],
    };

    // Group by user
    const userCounts: Record<string, { name: string; count: number }> = {};
    data.forEach(a => {
      if (a.user_id) {
        if (!userCounts[a.user_id]) {
          userCounts[a.user_id] = { name: (a.user as any)?.full_name || 'Unknown', count: 0 };
        }
        userCounts[a.user_id].count++;
      }
    });
    stats.byUser = Object.entries(userCounts).map(([userId, data]) => ({
      userId,
      name: data.name,
      count: data.count,
    }));

    // Group by resource type
    data.forEach(a => {
      stats.byResource[a.resource_type] = (stats.byResource[a.resource_type] || 0) + 1;
    });

    // Group by day
    const dayCounts: Record<string, number> = {};
    data.forEach(a => {
      const day = a.timestamp.split('T')[0];
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    stats.byDay = Object.entries(dayCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return stats;
  },

  /**
   * Get activities for a specific resource
   */
  async getForResource(resourceType: ActivityLogEntry['resource_type'], resourceId: string, limit = 20): Promise<ActivityLogEntry[]> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        user:profiles(id, full_name, email, avatar_url)
      `)
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /**
   * Get activities for a specific user
   */
  async getForUser(userId: string, limit = 50): Promise<ActivityLogEntry[]> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        user:profiles(id, full_name, email, avatar_url)
      `)
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /**
   * Get unique users from activity logs
   */
  async getUniqueUsers(): Promise<{ id: string; full_name: string; email: string }[]> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('user_id')
      .not('user_id', 'is', null);

    if (error) throw error;

    const uniqueIds = [...new Set(data.map(a => a.user_id))];

    if (uniqueIds.length === 0) return [];

    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', uniqueIds);

    if (userError) throw userError;
    return users || [];
  },

  /**
   * Export activity logs
   */
  async export(filters: ActivityFilters = {}, format: 'csv' | 'json' = 'csv'): Promise<string> {
    const logs = await this.getAll(filters, 10000, 0);

    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    }

    // CSV format
    const headers = ['Timestamp', 'User', 'Email', 'Action', 'Resource Type', 'Resource Name', 'Details', 'IP Address'];
    const rows = logs.map(log => [
      log.timestamp,
      log.user?.full_name || '',
      log.user?.email || '',
      log.action,
      log.resource_type,
      log.resource_name,
      log.details || '',
      log.ip_address || '',
    ].map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','));

    return [headers.join(','), ...rows].join('\n');
  },
};

export default activityService;
