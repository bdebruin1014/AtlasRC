// src/services/notificationService.js
// Centralized notification management service for Atlas

import { supabase, isDemoMode } from '@/lib/supabase';

// ============================================
// DEMO DATA
// ============================================

const DEMO_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Budget Alert: Hard Costs',
    message: 'Hard Costs line item has reached 85% of budget ($425,000 of $500,000)',
    type: 'budget_alert',
    priority: 'high',
    entity_type: 'budget',
    entity_id: 'budget-1',
    action_url: '/projects/demo-project-1/budget',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    metadata: { spent_percent: 85, line_item: 'Hard Costs' },
  },
  {
    id: 'notif-2',
    title: 'Draw Request Approved',
    message: 'Draw Request #5 for $150,000 has been approved and is ready for processing',
    type: 'draw_request',
    priority: 'normal',
    entity_type: 'draw_request',
    entity_id: 'draw-5',
    action_url: '/projects/demo-project-1/draws',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    metadata: { draw_number: 5, amount: 150000 },
  },
  {
    id: 'notif-3',
    title: 'Permit Expiring Soon',
    message: 'Building Permit #BP-2024-001 expires in 15 days',
    type: 'permit_expiring',
    priority: 'high',
    entity_type: 'permit',
    entity_id: 'permit-1',
    action_url: '/projects/demo-project-1/permits',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    metadata: { permit_number: 'BP-2024-001', days_until_expiry: 15 },
  },
  {
    id: 'notif-4',
    title: 'Change Order Pending Approval',
    message: 'CO #003 - Foundation Modifications ($45,000) requires your approval',
    type: 'approval_request',
    priority: 'urgent',
    entity_type: 'change_order',
    entity_id: 'co-3',
    action_url: '/projects/demo-project-1/change-orders',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    metadata: { co_number: 'CO-003', amount: 45000 },
  },
  {
    id: 'notif-5',
    title: 'Task Due Today',
    message: 'Foundation Inspection is due today at 2:00 PM',
    type: 'task_due',
    priority: 'high',
    entity_type: 'task',
    entity_id: 'task-1',
    action_url: '/projects/demo-project-1/schedule',
    is_read: true,
    read_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    metadata: { task_name: 'Foundation Inspection', due_time: '14:00' },
  },
  {
    id: 'notif-6',
    title: 'Document Signed',
    message: 'Construction Contract has been signed by all parties',
    type: 'document_signed',
    priority: 'normal',
    entity_type: 'document',
    entity_id: 'doc-1',
    action_url: '/projects/demo-project-1/documents',
    is_read: true,
    read_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    metadata: { document_name: 'Construction Contract' },
  },
  {
    id: 'notif-7',
    title: 'Milestone Complete',
    message: 'Foundation phase completed ahead of schedule',
    type: 'milestone_complete',
    priority: 'normal',
    entity_type: 'milestone',
    entity_id: 'milestone-1',
    action_url: '/projects/demo-project-1/schedule',
    is_read: true,
    read_at: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    metadata: { milestone_name: 'Foundation', days_early: 3 },
  },
];

const DEMO_PREFERENCES = {
  id: 'pref-1',
  user_id: 'demo-user',
  email_enabled: true,
  email_digest_frequency: 'daily',
  budget_alerts: true,
  approval_requests: true,
  task_reminders: true,
  document_updates: true,
  permit_alerts: true,
  milestone_updates: true,
  system_announcements: true,
  budget_alert_threshold: 80,
  permit_expiry_days: 30,
  task_reminder_hours: 24,
};

// ============================================
// NOTIFICATION CRUD OPERATIONS
// ============================================

/**
 * Get all notifications for the current user
 */
export async function getNotifications(options = {}) {
  const { includeRead = true, includeArchived = false, limit = 50, offset = 0 } = options;

  if (isDemoMode()) {
    let notifications = [...DEMO_NOTIFICATIONS];

    if (!includeRead) {
      notifications = notifications.filter((n) => !n.is_read);
    }
    if (!includeArchived) {
      notifications = notifications.filter((n) => !n.is_archived);
    }

    return notifications.slice(offset, offset + limit);
  }

  let query = supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (!includeRead) {
    query = query.eq('is_read', false);
  }
  if (!includeArchived) {
    query = query.eq('is_archived', false);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data || [];
}

/**
 * Get unread notification count
 */
export async function getUnreadCount() {
  if (isDemoMode()) {
    return DEMO_NOTIFICATIONS.filter((n) => !n.is_read && !n.is_archived).length;
  }

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false)
    .eq('is_archived', false);

  if (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Mark notifications as read
 */
export async function markAsRead(notificationIds) {
  if (!Array.isArray(notificationIds)) {
    notificationIds = [notificationIds];
  }

  if (isDemoMode()) {
    notificationIds.forEach((id) => {
      const notification = DEMO_NOTIFICATIONS.find((n) => n.id === id);
      if (notification) {
        notification.is_read = true;
        notification.read_at = new Date().toISOString();
      }
    });
    return { success: true, count: notificationIds.length };
  }

  const { data, error } = await supabase.rpc('mark_notifications_read', {
    p_notification_ids: notificationIds,
  });

  if (error) {
    console.error('Error marking notifications as read:', error);
    return { success: false, error };
  }

  return { success: true, count: data };
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead() {
  if (isDemoMode()) {
    DEMO_NOTIFICATIONS.forEach((n) => {
      n.is_read = true;
      n.read_at = new Date().toISOString();
    });
    return { success: true };
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('is_read', false);

  if (error) {
    console.error('Error marking all as read:', error);
    return { success: false, error };
  }

  return { success: true };
}

/**
 * Archive a notification
 */
export async function archiveNotification(notificationId) {
  if (isDemoMode()) {
    const notification = DEMO_NOTIFICATIONS.find((n) => n.id === notificationId);
    if (notification) {
      notification.is_archived = true;
      notification.archived_at = new Date().toISOString();
    }
    return { success: true };
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_archived: true, archived_at: new Date().toISOString() })
    .eq('id', notificationId);

  if (error) {
    console.error('Error archiving notification:', error);
    return { success: false, error };
  }

  return { success: true };
}

/**
 * Create a new notification
 */
export async function createNotification({
  teamId,
  userId,
  title,
  message,
  type,
  priority = 'normal',
  entityType,
  entityId,
  actionUrl,
  metadata = {},
}) {
  if (isDemoMode()) {
    const newNotification = {
      id: `notif-${Date.now()}`,
      team_id: teamId,
      user_id: userId,
      title,
      message,
      type,
      priority,
      entity_type: entityType,
      entity_id: entityId,
      action_url: actionUrl,
      metadata,
      is_read: false,
      is_archived: false,
      created_at: new Date().toISOString(),
    };
    DEMO_NOTIFICATIONS.unshift(newNotification);
    return { success: true, notification: newNotification };
  }

  const { data, error } = await supabase.rpc('create_notification', {
    p_team_id: teamId,
    p_user_id: userId,
    p_title: title,
    p_message: message,
    p_type: type,
    p_priority: priority,
    p_entity_type: entityType,
    p_entity_id: entityId,
    p_action_url: actionUrl,
    p_metadata: metadata,
  });

  if (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
  }

  return { success: true, notificationId: data };
}

// ============================================
// NOTIFICATION PREFERENCES
// ============================================

/**
 * Get user notification preferences
 */
export async function getNotificationPreferences() {
  if (isDemoMode()) {
    return DEMO_PREFERENCES;
  }

  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching preferences:', error);
    return null;
  }

  return data || DEMO_PREFERENCES;
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(preferences) {
  if (isDemoMode()) {
    Object.assign(DEMO_PREFERENCES, preferences);
    return { success: true, preferences: DEMO_PREFERENCES };
  }

  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert({
      ...preferences,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error updating preferences:', error);
    return { success: false, error };
  }

  return { success: true, preferences: data };
}

// ============================================
// BUDGET ALERT CONFIGURATION
// ============================================

/**
 * Get budget alert configuration for a project
 */
export async function getBudgetAlertConfig(projectId) {
  if (isDemoMode()) {
    return {
      id: 'config-1',
      project_id: projectId,
      is_enabled: true,
      alert_threshold_warning: 80,
      alert_threshold_critical: 95,
      alert_on_overbudget: true,
      notify_project_manager: true,
      notify_finance_team: true,
      line_item_thresholds: {},
    };
  }

  const { data, error } = await supabase
    .from('budget_alert_configs')
    .select('*')
    .eq('project_id', projectId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching budget alert config:', error);
    return null;
  }

  return data;
}

/**
 * Update budget alert configuration
 */
export async function updateBudgetAlertConfig(projectId, config) {
  if (isDemoMode()) {
    return { success: true, config: { ...config, project_id: projectId } };
  }

  const { data, error } = await supabase
    .from('budget_alert_configs')
    .upsert({
      project_id: projectId,
      ...config,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error updating budget alert config:', error);
    return { success: false, error };
  }

  return { success: true, config: data };
}

// ============================================
// BUDGET VARIANCE CHECKING
// ============================================

/**
 * Check budget line items for threshold violations
 */
export async function checkBudgetVariances(projectId, budgetLineItems, config = null) {
  const alertConfig = config || (await getBudgetAlertConfig(projectId)) || {
    alert_threshold_warning: 80,
    alert_threshold_critical: 95,
    alert_on_overbudget: true,
  };

  const alerts = [];

  budgetLineItems.forEach((item) => {
    const budgeted = item.amount || item.budgeted || 0;
    const spent = item.spent || item.actual || 0;

    if (budgeted <= 0) return;

    const spentPercent = (spent / budgeted) * 100;
    const itemThresholds = alertConfig.line_item_thresholds?.[item.id] || {};
    const warningThreshold = itemThresholds.warning || alertConfig.alert_threshold_warning;
    const criticalThreshold = itemThresholds.critical || alertConfig.alert_threshold_critical;

    if (spentPercent >= 100 && alertConfig.alert_on_overbudget) {
      alerts.push({
        lineItem: item,
        type: 'overbudget',
        priority: 'urgent',
        spentPercent,
        message: `${item.name || item.description} is over budget (${spentPercent.toFixed(1)}%)`,
      });
    } else if (spentPercent >= criticalThreshold) {
      alerts.push({
        lineItem: item,
        type: 'critical',
        priority: 'high',
        spentPercent,
        message: `${item.name || item.description} has reached ${spentPercent.toFixed(1)}% of budget`,
      });
    } else if (spentPercent >= warningThreshold) {
      alerts.push({
        lineItem: item,
        type: 'warning',
        priority: 'normal',
        spentPercent,
        message: `${item.name || item.description} has reached ${spentPercent.toFixed(1)}% of budget`,
      });
    }
  });

  return alerts;
}

/**
 * Create budget alert notifications
 */
export async function createBudgetAlerts(projectId, alerts, teamId) {
  const results = [];

  for (const alert of alerts) {
    const result = await createNotification({
      teamId,
      userId: null, // Team-wide notification
      title: `Budget ${alert.type === 'overbudget' ? 'Overrun' : alert.type === 'critical' ? 'Critical' : 'Warning'}: ${alert.lineItem.name || alert.lineItem.description}`,
      message: alert.message,
      type: 'budget_alert',
      priority: alert.priority,
      entityType: 'budget',
      entityId: alert.lineItem.budget_id,
      actionUrl: `/projects/${projectId}/budget`,
      metadata: {
        line_item_id: alert.lineItem.id,
        line_item_name: alert.lineItem.name || alert.lineItem.description,
        spent_percent: alert.spentPercent,
        budgeted: alert.lineItem.amount || alert.lineItem.budgeted,
        spent: alert.lineItem.spent || alert.lineItem.actual,
        alert_type: alert.type,
      },
    });

    results.push(result);
  }

  return results;
}

// ============================================
// NOTIFICATION TYPE HELPERS
// ============================================

export const NOTIFICATION_TYPES = {
  info: { label: 'Information', color: 'blue', icon: 'Info' },
  success: { label: 'Success', color: 'green', icon: 'CheckCircle' },
  warning: { label: 'Warning', color: 'yellow', icon: 'AlertTriangle' },
  error: { label: 'Error', color: 'red', icon: 'XCircle' },
  alert: { label: 'Alert', color: 'orange', icon: 'Bell' },
  budget_alert: { label: 'Budget Alert', color: 'red', icon: 'DollarSign' },
  approval_request: { label: 'Approval Request', color: 'purple', icon: 'CheckSquare' },
  task_due: { label: 'Task Due', color: 'blue', icon: 'Clock' },
  document_signed: { label: 'Document Signed', color: 'green', icon: 'FileCheck' },
  draw_request: { label: 'Draw Request', color: 'indigo', icon: 'Landmark' },
  change_order: { label: 'Change Order', color: 'orange', icon: 'FileEdit' },
  permit_expiring: { label: 'Permit Expiring', color: 'yellow', icon: 'AlertTriangle' },
  milestone_complete: { label: 'Milestone Complete', color: 'green', icon: 'Flag' },
};

export const PRIORITY_LEVELS = {
  low: { label: 'Low', color: 'gray' },
  normal: { label: 'Normal', color: 'blue' },
  high: { label: 'High', color: 'orange' },
  urgent: { label: 'Urgent', color: 'red' },
};

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  createNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  getBudgetAlertConfig,
  updateBudgetAlertConfig,
  checkBudgetVariances,
  createBudgetAlerts,
  NOTIFICATION_TYPES,
  PRIORITY_LEVELS,
};
