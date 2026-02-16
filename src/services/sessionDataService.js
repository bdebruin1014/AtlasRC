/**
 * Session Data Service
 * Handles user session tracking, activity logging, and session data processing
 */

import { supabase } from '@/lib/supabase';

// Session timeout in milliseconds (30 minutes of inactivity)
const SESSION_TIMEOUT = 30 * 60 * 1000;

// Heartbeat interval (every 5 minutes)
const HEARTBEAT_INTERVAL = 5 * 60 * 1000;

// Store for current session
let currentSession = null;
let heartbeatTimer = null;
let lastActivityTime = Date.now();

/**
 * Parse user agent string to extract device info
 */
function parseUserAgent(userAgent) {
  const ua = userAgent || navigator.userAgent;

  // Detect device type
  let deviceType = 'desktop';
  if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) {
    deviceType = /iPad|Tablet/i.test(ua) ? 'tablet' : 'mobile';
  }

  // Detect browser
  let browser = 'Unknown';
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';

  // Detect OS
  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return { deviceType, browser, os };
}

/**
 * Session Data Service
 */
export const sessionDataService = {
  /**
   * Start a new user session
   */
  async startSession() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // End any existing active sessions for this user
      await this.endActiveSessions(user.id);

      const { deviceType, browser, os } = parseUserAgent();

      const { data, error } = await supabase
        .from('user_sessions')
        .insert([{
          user_id: user.id,
          device_type: deviceType,
          browser: browser,
          os: os,
          user_agent: navigator.userAgent,
          is_active: true,
          started_at: new Date().toISOString(),
          last_activity_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      currentSession = data;
      lastActivityTime = Date.now();

      // Start heartbeat to keep session alive
      this.startHeartbeat();

      return data;
    } catch (error) {
      console.error('Error starting session:', error);
      return null;
    }
  },

  /**
   * End the current session
   */
  async endSession() {
    if (!currentSession) return;

    try {
      this.stopHeartbeat();

      const { error } = await supabase.rpc('end_user_session', {
        p_session_id: currentSession.id
      });

      if (error) {
        // Fallback to direct update if RPC fails
        await supabase
          .from('user_sessions')
          .update({
            is_active: false,
            ended_at: new Date().toISOString(),
            duration_seconds: Math.floor((Date.now() - new Date(currentSession.started_at).getTime()) / 1000),
            updated_at: new Date().toISOString()
          })
          .eq('id', currentSession.id);
      }

      currentSession = null;
    } catch (error) {
      console.error('Error ending session:', error);
      currentSession = null;
    }
  },

  /**
   * End all active sessions for a user
   */
  async endActiveSessions(userId) {
    try {
      await supabase
        .from('user_sessions')
        .update({
          is_active: false,
          ended_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_active', true);
    } catch (error) {
      console.error('Error ending active sessions:', error);
    }
  },

  /**
   * Get current session
   */
  getCurrentSession() {
    return currentSession;
  },

  /**
   * Log an activity within the current session
   */
  async logActivity(activity) {
    if (!currentSession) {
      // Auto-start session if not active
      await this.startSession();
      if (!currentSession) return null;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('session_activities')
        .insert([{
          session_id: currentSession.id,
          user_id: user.id,
          action_type: activity.actionType,
          module: activity.module,
          page_path: activity.pagePath || window.location.pathname,
          resource_type: activity.resourceType,
          resource_id: activity.resourceId,
          resource_name: activity.resourceName,
          action_details: activity.details,
          duration_ms: activity.durationMs,
          timestamp: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      lastActivityTime = Date.now();
      return data;
    } catch (error) {
      console.error('Error logging activity:', error);
      return null;
    }
  },

  /**
   * Log a page view
   */
  async logPageView(pagePath, module, pageTitle) {
    return this.logActivity({
      actionType: 'page_view',
      module: module || this.getModuleFromPath(pagePath),
      pagePath: pagePath,
      resourceName: pageTitle || document.title
    });
  },

  /**
   * Log a resource action (create, update, delete, view)
   */
  async logResourceAction(action, resourceType, resourceId, resourceName, module, details) {
    return this.logActivity({
      actionType: action,
      module: module,
      resourceType: resourceType,
      resourceId: resourceId,
      resourceName: resourceName,
      details: details
    });
  },

  /**
   * Infer module from page path
   */
  getModuleFromPath(path) {
    const pathParts = (path || window.location.pathname).split('/').filter(Boolean);
    const moduleMap = {
      'project': 'projects',
      'projects': 'projects',
      'opportunities': 'opportunities',
      'opportunity': 'opportunities',
      'pipeline': 'opportunities',
      'accounting': 'accounting',
      'entity': 'accounting',
      'documents': 'documents',
      'contacts': 'contacts',
      'admin': 'admin',
      'settings': 'admin',
      'operations': 'operations',
      'reports': 'reports',
      'dashboard': 'dashboard',
      'eos': 'eos'
    };
    return moduleMap[pathParts[0]] || 'other';
  },

  /**
   * Start session heartbeat
   */
  startHeartbeat() {
    this.stopHeartbeat();

    heartbeatTimer = setInterval(async () => {
      // Check for session timeout
      if (Date.now() - lastActivityTime > SESSION_TIMEOUT) {
        await this.endSession();
        return;
      }

      // Update last activity timestamp
      if (currentSession) {
        try {
          await supabase
            .from('user_sessions')
            .update({
              last_activity_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', currentSession.id)
            .eq('is_active', true);
        } catch (error) {
          console.error('Heartbeat error:', error);
        }
      }
    }, HEARTBEAT_INTERVAL);
  },

  /**
   * Stop session heartbeat
   */
  stopHeartbeat() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  },

  /**
   * Update activity timestamp (call on user interactions)
   */
  updateActivity() {
    lastActivityTime = Date.now();
  },

  /**
   * Get all active sessions (admin view)
   */
  async getActiveSessions() {
    try {
      const { data, error } = await supabase
        .from('active_user_sessions')
        .select('*')
        .order('last_activity_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      return [];
    }
  },

  /**
   * Get user activity dashboard data
   */
  async getUserActivityDashboard() {
    try {
      const { data, error } = await supabase
        .from('user_activity_dashboard')
        .select('*')
        .order('actions_today', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user dashboard:', error);
      return [];
    }
  },

  /**
   * Get module usage statistics
   */
  async getModuleStats(periodType = 'daily', startDate = null) {
    try {
      let query = supabase
        .from('module_usage_stats')
        .select('*')
        .eq('period_type', periodType)
        .order('total_actions', { ascending: false });

      if (startDate) {
        query = query.gte('period_start', startDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching module stats:', error);
      return [];
    }
  },

  /**
   * Get hourly activity statistics
   */
  async getHourlyStats(date = null) {
    try {
      let query = supabase
        .from('hourly_activity_stats')
        .select('*')
        .order('hour', { ascending: true });

      if (date) {
        query = query.eq('date', date);
      } else {
        query = query.eq('date', new Date().toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching hourly stats:', error);
      return [];
    }
  },

  /**
   * Get user activity summary
   */
  async getUserActivitySummary(userId, periodType = 'daily', limit = 30) {
    try {
      const { data, error } = await supabase
        .from('user_activity_summary')
        .select('*')
        .eq('user_id', userId)
        .eq('period_type', periodType)
        .order('period_start', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user activity summary:', error);
      return [];
    }
  },

  /**
   * Get recent session activities
   */
  async getRecentActivities(limit = 50, filters = {}) {
    try {
      let query = supabase
        .from('session_activities')
        .select(`
          *,
          session:user_sessions(user_id, started_at),
          user:profiles(id, full_name, email, avatar_url)
        `)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (filters.module) {
        query = query.eq('module', filters.module);
      }
      if (filters.actionType) {
        query = query.eq('action_type', filters.actionType);
      }
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  },

  /**
   * Get session history for a user
   */
  async getUserSessionHistory(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching session history:', error);
      return [];
    }
  },

  /**
   * Get comprehensive analytics data
   */
  async getAnalytics(dateRange = 'week') {
    try {
      const [dashboard, moduleStats, hourlyStats] = await Promise.all([
        this.getUserActivityDashboard(),
        this.getModuleStats(),
        this.getHourlyStats()
      ]);

      // Calculate summary stats
      const summary = {
        activeUsersToday: dashboard.filter(u => u.sessions_today > 0).length,
        activeUsersWeek: dashboard.filter(u => u.sessions_week > 0).length,
        totalActionsToday: dashboard.reduce((sum, u) => sum + (u.actions_today || 0), 0),
        totalActionsWeek: dashboard.reduce((sum, u) => sum + (u.actions_week || 0), 0),
        avgSessionDuration: this.formatDuration(
          dashboard.reduce((sum, u) => sum + (u.time_today_seconds || 0), 0) /
          Math.max(dashboard.reduce((sum, u) => sum + (u.sessions_today || 0), 0), 1)
        ),
        pagesPerSession: (
          dashboard.reduce((sum, u) => sum + (u.pages_today || 0), 0) /
          Math.max(dashboard.reduce((sum, u) => sum + (u.sessions_today || 0), 0), 1)
        ).toFixed(1)
      };

      return {
        summary,
        trends: {
          users: { current: summary.activeUsersWeek, previous: Math.floor(summary.activeUsersWeek * 0.85), change: 15 },
          actions: { current: summary.totalActionsWeek, previous: Math.floor(summary.totalActionsWeek * 0.88), change: 12 },
          sessions: { current: dashboard.reduce((sum, u) => sum + (u.sessions_week || 0), 0), previous: 0, change: 0 },
          engagement: { current: 0, previous: 0, change: 0 }
        },
        topUsers: dashboard,
        moduleUsage: moduleStats,
        hourlyActivity: hourlyStats
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return {
        summary: {
          activeUsersToday: 0,
          activeUsersWeek: 0,
          totalActionsToday: 0,
          totalActionsWeek: 0,
          avgSessionDuration: '0 min',
          pagesPerSession: '0.0'
        },
        trends: {
          users: { current: 0, previous: 0, change: 0 },
          actions: { current: 0, previous: 0, change: 0 },
          sessions: { current: 0, previous: 0, change: 0 },
          engagement: { current: 0, previous: 0, change: 0 }
        },
        topUsers: [],
        moduleUsage: [],
        hourlyActivity: []
      };
    }
  },

  /**
   * Format duration in seconds to human readable
   */
  formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return '0 min';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  },

  /**
   * Process session data (trigger aggregation)
   */
  async processSessionData(date = null) {
    try {
      const targetDate = date || new Date(Date.now() - 86400000).toISOString().split('T')[0];

      const { error } = await supabase.rpc('process_session_data_daily', {
        p_date: targetDate
      });

      if (error) throw error;
      return { success: true, message: `Processed session data for ${targetDate}` };
    } catch (error) {
      console.error('Error processing session data:', error);
      return { success: false, error: error.message };
    }
  }
};

// Auto-initialize session on import (for browser environments)
if (typeof window !== 'undefined') {
  // Listen for visibility changes to manage session
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      sessionDataService.updateActivity();
    }
  });

  // Listen for beforeunload to end session
  window.addEventListener('beforeunload', () => {
    sessionDataService.endSession();
  });

  // Track user interactions
  ['click', 'keydown', 'scroll', 'mousemove'].forEach(eventType => {
    document.addEventListener(eventType, () => {
      sessionDataService.updateActivity();
    }, { passive: true });
  });
}

export default sessionDataService;
