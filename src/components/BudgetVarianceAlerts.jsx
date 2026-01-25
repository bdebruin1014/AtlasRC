// src/components/BudgetVarianceAlerts.jsx
// Budget variance alerts component with threshold configuration

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, AlertCircle, CheckCircle, Settings, Bell,
  ChevronDown, ChevronUp, X, DollarSign, TrendingUp, TrendingDown,
  Save, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  getBudgetAlertConfig,
  updateBudgetAlertConfig,
  checkBudgetVariances,
  createBudgetAlerts,
  createNotification,
} from '@/services/notificationService';

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const formatPercent = (value) => `${(value || 0).toFixed(1)}%`;

// ============================================
// ALERT BADGE COMPONENT
// ============================================

function AlertBadge({ type, count }) {
  const config = {
    overbudget: { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle },
    critical: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertTriangle },
    warning: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: AlertTriangle },
    healthy: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
  };

  const { color, icon: Icon } = config[type] || config.warning;

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border', color)}>
      <Icon className="h-3 w-3" />
      {count}
    </span>
  );
}

// ============================================
// ALERT ROW COMPONENT
// ============================================

function AlertRow({ alert, onDismiss }) {
  const typeConfig = {
    overbudget: {
      bg: 'bg-red-50 border-red-200',
      icon: 'text-red-600',
      badge: 'bg-red-100 text-red-700',
      label: 'Over Budget',
    },
    critical: {
      bg: 'bg-orange-50 border-orange-200',
      icon: 'text-orange-600',
      badge: 'bg-orange-100 text-orange-700',
      label: 'Critical',
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-600',
      badge: 'bg-yellow-100 text-yellow-700',
      label: 'Warning',
    },
  };

  const config = typeConfig[alert.type] || typeConfig.warning;

  return (
    <div className={cn('flex items-center gap-4 p-3 rounded-lg border', config.bg)}>
      <div className={cn('p-2 rounded-lg bg-white', config.icon)}>
        {alert.type === 'overbudget' ? (
          <AlertCircle className="h-5 w-5" />
        ) : (
          <AlertTriangle className="h-5 w-5" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900 truncate">
            {alert.lineItem?.name || alert.lineItem?.description}
          </p>
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', config.badge)}>
            {config.label}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-0.5">{alert.message}</p>
      </div>

      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">
          {formatCurrency(alert.lineItem?.spent || alert.lineItem?.actual)}
        </p>
        <p className="text-xs text-gray-500">
          of {formatCurrency(alert.lineItem?.amount || alert.lineItem?.budgeted)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={cn(
            'text-lg font-bold',
            alert.type === 'overbudget'
              ? 'text-red-600'
              : alert.type === 'critical'
              ? 'text-orange-600'
              : 'text-yellow-600'
          )}
        >
          {formatPercent(alert.spentPercent)}
        </span>
        {onDismiss && (
          <button
            onClick={() => onDismiss(alert)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================
// THRESHOLD CONFIG MODAL
// ============================================

function ThresholdConfigModal({ isOpen, onClose, config, onSave }) {
  const [localConfig, setLocalConfig] = useState(config);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    await onSave(localConfig);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Budget Alert Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Enable Budget Alerts</p>
              <p className="text-sm text-gray-500">Receive notifications when thresholds are exceeded</p>
            </div>
            <button
              onClick={() => setLocalConfig((c) => ({ ...c, is_enabled: !c.is_enabled }))}
              className={cn(
                'relative w-11 h-6 rounded-full transition-colors',
                localConfig.is_enabled ? 'bg-emerald-500' : 'bg-gray-300'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform',
                  localConfig.is_enabled && 'translate-x-5'
                )}
              />
            </button>
          </div>

          {/* Warning Threshold */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Warning Threshold
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="50"
                max="100"
                value={localConfig.alert_threshold_warning}
                onChange={(e) =>
                  setLocalConfig((c) => ({
                    ...c,
                    alert_threshold_warning: parseInt(e.target.value),
                  }))
                }
                className="flex-1"
              />
              <span className="w-16 text-right font-medium text-yellow-600">
                {localConfig.alert_threshold_warning}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Alert when budget usage reaches this percentage
            </p>
          </div>

          {/* Critical Threshold */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Critical Threshold
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="70"
                max="100"
                value={localConfig.alert_threshold_critical}
                onChange={(e) =>
                  setLocalConfig((c) => ({
                    ...c,
                    alert_threshold_critical: parseInt(e.target.value),
                  }))
                }
                className="flex-1"
              />
              <span className="w-16 text-right font-medium text-orange-600">
                {localConfig.alert_threshold_critical}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              High-priority alert when budget usage reaches this percentage
            </p>
          </div>

          {/* Overbudget Alert */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Alert on Overbudget</p>
              <p className="text-sm text-gray-500">Immediately alert when a line item exceeds 100%</p>
            </div>
            <button
              onClick={() => setLocalConfig((c) => ({ ...c, alert_on_overbudget: !c.alert_on_overbudget }))}
              className={cn(
                'relative w-11 h-6 rounded-full transition-colors',
                localConfig.alert_on_overbudget ? 'bg-emerald-500' : 'bg-gray-300'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform',
                  localConfig.alert_on_overbudget && 'translate-x-5'
                )}
              />
            </button>
          </div>

          {/* Notification Recipients */}
          <div className="space-y-3">
            <p className="font-medium text-gray-900">Notify</p>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={localConfig.notify_project_manager}
                onChange={(e) =>
                  setLocalConfig((c) => ({ ...c, notify_project_manager: e.target.checked }))
                }
                className="w-4 h-4 rounded border-gray-300 text-emerald-600"
              />
              <span className="text-sm text-gray-700">Project Manager</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={localConfig.notify_finance_team}
                onChange={(e) =>
                  setLocalConfig((c) => ({ ...c, notify_finance_team: e.target.checked }))
                }
                className="w-4 h-4 rounded border-gray-300 text-emerald-600"
              />
              <span className="text-sm text-gray-700">Finance Team</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#2F855A] hover:bg-[#276749] text-white"
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function BudgetVarianceAlerts({
  projectId,
  budgetLineItems = [],
  teamId,
  showHeader = true,
  maxAlerts = 10,
  onAlertClick,
}) {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    is_enabled: true,
    alert_threshold_warning: 80,
    alert_threshold_critical: 95,
    alert_on_overbudget: true,
    notify_project_manager: true,
    notify_finance_team: true,
    line_item_thresholds: {},
  });
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  // Fetch config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      const savedConfig = await getBudgetAlertConfig(projectId);
      if (savedConfig) {
        setConfig(savedConfig);
      }
    };
    fetchConfig();
  }, [projectId]);

  // Calculate alerts based on current budget data
  const alerts = useMemo(() => {
    if (!config.is_enabled || !budgetLineItems.length) return [];

    const allAlerts = checkBudgetVariances(projectId, budgetLineItems, config);

    // Filter out dismissed alerts
    return allAlerts
      .filter((a) => !dismissedAlerts.includes(a.lineItem?.id))
      .slice(0, maxAlerts);
  }, [budgetLineItems, config, dismissedAlerts, projectId, maxAlerts]);

  // Group alerts by type
  const alertCounts = useMemo(() => {
    const counts = { overbudget: 0, critical: 0, warning: 0 };
    alerts.forEach((a) => {
      counts[a.type] = (counts[a.type] || 0) + 1;
    });
    return counts;
  }, [alerts]);

  const totalAlerts = alerts.length;

  // Handle config save
  const handleSaveConfig = async (newConfig) => {
    await updateBudgetAlertConfig(projectId, newConfig);
    setConfig(newConfig);
  };

  // Handle dismiss alert
  const handleDismissAlert = (alert) => {
    setDismissedAlerts((prev) => [...prev, alert.lineItem?.id]);
  };

  // Handle alert click
  const handleAlertClick = (alert) => {
    if (onAlertClick) {
      onAlertClick(alert);
    }
  };

  // Create notifications for new alerts
  const handleSendNotifications = async () => {
    await createBudgetAlerts(projectId, alerts, teamId);
  };

  if (!config.is_enabled) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-gray-400" />
            <p className="text-gray-600">Budget alerts are disabled</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowConfigModal(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
        <ThresholdConfigModal
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
          config={config}
          onSave={handleSaveConfig}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      {showHeader && (
        <div
          className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-gray-900">Budget Alerts</h3>
            <div className="flex items-center gap-2">
              {alertCounts.overbudget > 0 && (
                <AlertBadge type="overbudget" count={alertCounts.overbudget} />
              )}
              {alertCounts.critical > 0 && (
                <AlertBadge type="critical" count={alertCounts.critical} />
              )}
              {alertCounts.warning > 0 && (
                <AlertBadge type="warning" count={alertCounts.warning} />
              )}
              {totalAlerts === 0 && <AlertBadge type="healthy" count="All Good" />}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowConfigModal(true);
              }}
            >
              <Settings className="h-4 w-4" />
            </Button>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      )}

      {/* Alert List */}
      {expanded && (
        <div className="p-4">
          {totalAlerts === 0 ? (
            <div className="text-center py-6">
              <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-gray-600">All budget line items are within thresholds</p>
              <p className="text-sm text-gray-400 mt-1">
                Warning at {config.alert_threshold_warning}% • Critical at{' '}
                {config.alert_threshold_critical}%
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert, idx) => (
                <AlertRow
                  key={alert.lineItem?.id || idx}
                  alert={alert}
                  onDismiss={handleDismissAlert}
                />
              ))}

              {dismissedAlerts.length > 0 && (
                <div className="text-center pt-2">
                  <button
                    onClick={() => setDismissedAlerts([])}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Show {dismissedAlerts.length} dismissed alert
                    {dismissedAlerts.length > 1 ? 's' : ''}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Config Modal */}
      <ThresholdConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        config={config}
        onSave={handleSaveConfig}
      />
    </div>
  );
}

// ============================================
// COMPACT ALERT INDICATOR (for headers/badges)
// ============================================

export function BudgetAlertIndicator({ budgetLineItems = [], config }) {
  const alerts = useMemo(() => {
    if (!budgetLineItems.length) return { count: 0, hasUrgent: false };

    const allAlerts = [];
    budgetLineItems.forEach((item) => {
      const budgeted = item.amount || item.budgeted || 0;
      const spent = item.spent || item.actual || 0;
      if (budgeted <= 0) return;

      const spentPercent = (spent / budgeted) * 100;
      const warningThreshold = config?.alert_threshold_warning || 80;
      const criticalThreshold = config?.alert_threshold_critical || 95;

      if (spentPercent >= 100) {
        allAlerts.push({ type: 'overbudget' });
      } else if (spentPercent >= criticalThreshold) {
        allAlerts.push({ type: 'critical' });
      } else if (spentPercent >= warningThreshold) {
        allAlerts.push({ type: 'warning' });
      }
    });

    return {
      count: allAlerts.length,
      hasUrgent: allAlerts.some((a) => a.type === 'overbudget' || a.type === 'critical'),
    };
  }, [budgetLineItems, config]);

  if (alerts.count === 0) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full',
        alerts.hasUrgent ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'
      )}
    >
      {alerts.count}
    </span>
  );
}
