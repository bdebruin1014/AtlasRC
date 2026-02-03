/**
 * useSessionData Hook
 * React hook for managing session data and activity tracking
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { sessionDataService } from '@/services/sessionDataService';

/**
 * Hook for accessing and managing session data
 */
export function useSessionData(options = {}) {
  const {
    autoTrackPageViews = true,
    refreshInterval = 60000, // 1 minute
    onSessionStart = null,
    onSessionEnd = null
  } = options;

  const location = useLocation();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const previousPath = useRef(null);

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        setLoading(true);
        const newSession = await sessionDataService.startSession();
        setSession(newSession);
        if (onSessionStart && newSession) {
          onSessionStart(newSession);
        }
      } catch (err) {
        console.error('Failed to initialize session:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Cleanup on unmount
    return () => {
      const currentSession = sessionDataService.getCurrentSession();
      if (currentSession && onSessionEnd) {
        onSessionEnd(currentSession);
      }
    };
  }, []);

  // Track page views when location changes
  useEffect(() => {
    if (!autoTrackPageViews || loading) return;

    const currentPath = location.pathname;
    if (previousPath.current !== currentPath) {
      sessionDataService.logPageView(currentPath);
      previousPath.current = currentPath;
    }
  }, [location.pathname, autoTrackPageViews, loading]);

  // Log activity helper
  const logActivity = useCallback(async (activity) => {
    try {
      return await sessionDataService.logActivity(activity);
    } catch (err) {
      console.error('Failed to log activity:', err);
      return null;
    }
  }, []);

  // Log resource action helper
  const logResourceAction = useCallback(async (action, resourceType, resourceId, resourceName, module, details) => {
    try {
      return await sessionDataService.logResourceAction(action, resourceType, resourceId, resourceName, module, details);
    } catch (err) {
      console.error('Failed to log resource action:', err);
      return null;
    }
  }, []);

  // Update activity timestamp
  const updateActivity = useCallback(() => {
    sessionDataService.updateActivity();
  }, []);

  return {
    session,
    loading,
    error,
    logActivity,
    logResourceAction,
    updateActivity
  };
}

/**
 * Hook for fetching user activity dashboard data
 */
export function useUserActivityDashboard(options = {}) {
  const { refreshInterval = 60000 } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const dashboard = await sessionDataService.getUserActivityDashboard();
      setData(dashboard);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch user dashboard:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for fetching active sessions
 */
export function useActiveSessions(options = {}) {
  const { refreshInterval = 30000 } = options;

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const activeSessions = await sessionDataService.getActiveSessions();
      setSessions(activeSessions);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch active sessions:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return { sessions, loading, error, refetch: fetchData };
}

/**
 * Hook for fetching module usage statistics
 */
export function useModuleStats(options = {}) {
  const { periodType = 'daily', refreshInterval = 300000 } = options;

  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const moduleStats = await sessionDataService.getModuleStats(periodType);
      setStats(moduleStats);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch module stats:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [periodType]);

  useEffect(() => {
    fetchData();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return { stats, loading, error, refetch: fetchData };
}

/**
 * Hook for fetching hourly activity statistics
 */
export function useHourlyStats(options = {}) {
  const { date = null, refreshInterval = 300000 } = options;

  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const hourlyStats = await sessionDataService.getHourlyStats(date);
      setStats(hourlyStats);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch hourly stats:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchData();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return { stats, loading, error, refetch: fetchData };
}

/**
 * Hook for fetching comprehensive analytics
 */
export function useSessionAnalytics(options = {}) {
  const { dateRange = 'week', refreshInterval = 60000 } = options;

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await sessionDataService.getAnalytics(dateRange);
      setAnalytics(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return { analytics, loading, error, refetch: fetchData };
}

/**
 * Hook for fetching user session history
 */
export function useUserSessionHistory(userId, options = {}) {
  const { limit = 50, refreshInterval = 0 } = options;

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setSessions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const history = await sessionDataService.getUserSessionHistory(userId, limit);
      setSessions(history);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch session history:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    fetchData();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return { sessions, loading, error, refetch: fetchData };
}

/**
 * Hook for fetching recent activities
 */
export function useRecentActivities(options = {}) {
  const { limit = 50, filters = {}, refreshInterval = 30000 } = options;

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await sessionDataService.getRecentActivities(limit, filters);
      setActivities(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch recent activities:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [limit, JSON.stringify(filters)]);

  useEffect(() => {
    fetchData();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return { activities, loading, error, refetch: fetchData };
}

export default useSessionData;
