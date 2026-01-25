// src/pages/admin/AuditLogsPage.jsx
// System Audit Logs - Track all admin and system actions for compliance

import React, { useState, useMemo } from 'react';
import {
  Search, Filter, Download, RefreshCw, ChevronDown, ChevronRight,
  User, Users, Settings, Shield, Database, FileText, Trash2,
  Edit2, Plus, Eye, Lock, Unlock, Key, AlertTriangle, CheckCircle,
  XCircle, Clock, Calendar, Building2, DollarSign, FolderOpen,
  Mail, Link2, ExternalLink, MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/*
 * SYSTEM AUDIT LOGS PAGE
 *
 * Features:
 * 1. Comprehensive activity logging
 * 2. Filter by action type, user, date range, module
 * 3. Detailed event inspection
 * 4. Export capabilities
 * 5. Real-time updates
 * 6. Compliance-ready audit trail
 */

const AuditLogsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModule, setFilterModule] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [selectedLog, setSelectedLog] = useState(null);
  const [expandedLogs, setExpandedLogs] = useState(new Set());

  // Action types with icons and colors
  const actionTypes = {
    create: { label: 'Create', icon: Plus, color: 'text-green-600', bg: 'bg-green-100' },
    update: { label: 'Update', icon: Edit2, color: 'text-blue-600', bg: 'bg-blue-100' },
    delete: { label: 'Delete', icon: Trash2, color: 'text-red-600', bg: 'bg-red-100' },
    view: { label: 'View', icon: Eye, color: 'text-gray-600', bg: 'bg-gray-100' },
    login: { label: 'Login', icon: Lock, color: 'text-purple-600', bg: 'bg-purple-100' },
    logout: { label: 'Logout', icon: Unlock, color: 'text-purple-600', bg: 'bg-purple-100' },
    export: { label: 'Export', icon: Download, color: 'text-amber-600', bg: 'bg-amber-100' },
    permission: { label: 'Permission', icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    settings: { label: 'Settings', icon: Settings, color: 'text-gray-600', bg: 'bg-gray-100' },
    approval: { label: 'Approval', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    rejection: { label: 'Rejection', icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
    api: { label: 'API Call', icon: Link2, color: 'text-cyan-600', bg: 'bg-cyan-100' },
  };

  // Modules
  const modules = {
    users: { label: 'Users', icon: Users },
    projects: { label: 'Projects', icon: Building2 },
    accounting: { label: 'Accounting', icon: DollarSign },
    documents: { label: 'Documents', icon: FolderOpen },
    settings: { label: 'Settings', icon: Settings },
    auth: { label: 'Authentication', icon: Lock },
    api: { label: 'API', icon: Link2 },
    reports: { label: 'Reports', icon: FileText },
    entities: { label: 'Entities', icon: Building2 },
    contacts: { label: 'Contacts', icon: User },
  };

  // Mock audit logs data
  const auditLogs = [
    {
      id: 'log-1',
      timestamp: '2025-01-25T14:32:15Z',
      user: { id: 'u1', name: 'John Smith', email: 'john@example.com', role: 'Admin' },
      action: 'update',
      module: 'users',
      resource: 'User Profile',
      resourceId: 'user-123',
      description: 'Updated user permissions for Sarah Johnson',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome 120.0 / macOS',
      changes: {
        before: { role: 'User', permissions: ['read'] },
        after: { role: 'Manager', permissions: ['read', 'write', 'approve'] },
      },
      metadata: {
        targetUser: 'Sarah Johnson',
        reason: 'Promotion to team lead',
      },
      status: 'success',
    },
    {
      id: 'log-2',
      timestamp: '2025-01-25T14:15:42Z',
      user: { id: 'u2', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Manager' },
      action: 'approval',
      module: 'accounting',
      resource: 'Invoice',
      resourceId: 'inv-456',
      description: 'Approved invoice #INV-2025-0042 for $125,000',
      ipAddress: '192.168.1.105',
      userAgent: 'Chrome 120.0 / Windows',
      changes: {
        before: { status: 'pending_approval', approvedBy: null },
        after: { status: 'approved', approvedBy: 'Sarah Johnson' },
      },
      metadata: {
        invoiceAmount: 125000,
        vendor: 'BuildRight Construction',
        project: 'Highland Park Development',
      },
      status: 'success',
    },
    {
      id: 'log-3',
      timestamp: '2025-01-25T13:45:00Z',
      user: { id: 'u3', name: 'Mike Williams', email: 'mike@example.com', role: 'User' },
      action: 'login',
      module: 'auth',
      resource: 'Session',
      resourceId: 'session-789',
      description: 'User logged in successfully',
      ipAddress: '192.168.1.110',
      userAgent: 'Safari 17.0 / iOS',
      changes: null,
      metadata: {
        loginMethod: 'password',
        mfaUsed: true,
        deviceType: 'mobile',
      },
      status: 'success',
    },
    {
      id: 'log-4',
      timestamp: '2025-01-25T13:30:22Z',
      user: { id: 'u1', name: 'John Smith', email: 'john@example.com', role: 'Admin' },
      action: 'create',
      module: 'projects',
      resource: 'Project',
      resourceId: 'proj-101',
      description: 'Created new project: Pine Street Townhomes',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome 120.0 / macOS',
      changes: {
        before: null,
        after: {
          name: 'Pine Street Townhomes',
          type: 'residential',
          status: 'planning',
          budget: 2500000,
        },
      },
      metadata: {
        projectType: 'Scattered Lot',
        region: 'NC',
        assignedTeam: 'Scattered Lot Team',
      },
      status: 'success',
    },
    {
      id: 'log-5',
      timestamp: '2025-01-25T12:15:00Z',
      user: { id: 'u4', name: 'Lisa Chen', email: 'lisa@example.com', role: 'User' },
      action: 'export',
      module: 'reports',
      resource: 'Financial Report',
      resourceId: 'report-202',
      description: 'Exported Q4 2024 Financial Summary to PDF',
      ipAddress: '192.168.1.115',
      userAgent: 'Chrome 120.0 / Windows',
      changes: null,
      metadata: {
        reportType: 'Financial Summary',
        period: 'Q4 2024',
        format: 'PDF',
        fileSize: '2.4 MB',
      },
      status: 'success',
    },
    {
      id: 'log-6',
      timestamp: '2025-01-25T11:45:30Z',
      user: { id: 'u1', name: 'John Smith', email: 'john@example.com', role: 'Admin' },
      action: 'delete',
      module: 'documents',
      resource: 'Document',
      resourceId: 'doc-303',
      description: 'Deleted duplicate contract document',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome 120.0 / macOS',
      changes: {
        before: { name: 'Contract_v2_DUPLICATE.pdf', size: '1.2 MB' },
        after: null,
      },
      metadata: {
        originalDocument: 'Contract_v2.pdf',
        deletionReason: 'Duplicate file',
      },
      status: 'success',
    },
    {
      id: 'log-7',
      timestamp: '2025-01-25T10:30:00Z',
      user: { id: 'u5', name: 'Robert Van', email: 'robert@example.com', role: 'Admin' },
      action: 'settings',
      module: 'settings',
      resource: 'System Settings',
      resourceId: 'settings-global',
      description: 'Updated company fiscal year settings',
      ipAddress: '192.168.1.120',
      userAgent: 'Chrome 120.0 / Windows',
      changes: {
        before: { fiscalYearStart: 'January', timezone: 'EST' },
        after: { fiscalYearStart: 'January', timezone: 'EST', autoBackup: true },
      },
      metadata: {
        settingCategory: 'Organization',
        requiresRestart: false,
      },
      status: 'success',
    },
    {
      id: 'log-8',
      timestamp: '2025-01-25T09:15:45Z',
      user: { id: 'u6', name: 'Unknown', email: 'hacker@example.com', role: 'Unknown' },
      action: 'login',
      module: 'auth',
      resource: 'Session',
      resourceId: 'session-failed-001',
      description: 'Failed login attempt - Invalid credentials',
      ipAddress: '45.33.32.156',
      userAgent: 'Python-requests/2.28.0',
      changes: null,
      metadata: {
        attemptedEmail: 'admin@company.com',
        failureReason: 'Invalid password',
        attemptCount: 3,
        blocked: true,
      },
      status: 'failed',
    },
    {
      id: 'log-9',
      timestamp: '2025-01-25T08:00:00Z',
      user: { id: 'system', name: 'System', email: 'system@atlas.local', role: 'System' },
      action: 'api',
      module: 'api',
      resource: 'Webhook',
      resourceId: 'webhook-bank-feeds',
      description: 'Bank feed sync completed - 47 transactions imported',
      ipAddress: '10.0.0.1',
      userAgent: 'Atlas-System/1.0',
      changes: null,
      metadata: {
        bank: 'First National Bank',
        accountCount: 3,
        transactionCount: 47,
        dateRange: '2025-01-24 to 2025-01-25',
      },
      status: 'success',
    },
    {
      id: 'log-10',
      timestamp: '2025-01-24T16:45:00Z',
      user: { id: 'u2', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Manager' },
      action: 'rejection',
      module: 'accounting',
      resource: 'Expense Report',
      resourceId: 'exp-789',
      description: 'Rejected expense report - Missing receipts',
      ipAddress: '192.168.1.105',
      userAgent: 'Chrome 120.0 / Windows',
      changes: {
        before: { status: 'pending_approval' },
        after: { status: 'rejected', rejectionReason: 'Missing receipts for items over $50' },
      },
      metadata: {
        expenseAmount: 1250,
        submittedBy: 'Mike Williams',
        missingReceipts: 3,
      },
      status: 'success',
    },
  ];

  // Get unique users for filter
  const uniqueUsers = useMemo(() => {
    const users = new Map();
    auditLogs.forEach(log => {
      if (log.user.id !== 'system') {
        users.set(log.user.id, log.user);
      }
    });
    return Array.from(users.values());
  }, [auditLogs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!log.description.toLowerCase().includes(query) &&
            !log.user.name.toLowerCase().includes(query) &&
            !log.resource.toLowerCase().includes(query)) {
          return false;
        }
      }
      if (filterModule !== 'all' && log.module !== filterModule) return false;
      if (filterAction !== 'all' && log.action !== filterAction) return false;
      if (filterUser !== 'all' && log.user.id !== filterUser) return false;
      return true;
    });
  }, [auditLogs, searchQuery, filterModule, filterAction, filterUser]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = auditLogs.filter(log => log.timestamp.startsWith(today));
    const failedLogs = auditLogs.filter(log => log.status === 'failed');
    const uniqueActiveUsers = new Set(auditLogs.map(log => log.user.id)).size;

    return {
      totalToday: todayLogs.length,
      failed: failedLogs.length,
      activeUsers: uniqueActiveUsers,
      criticalActions: auditLogs.filter(log =>
        ['delete', 'permission', 'settings'].includes(log.action)
      ).length,
    };
  }, [auditLogs]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const formatFullTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const toggleLogExpand = (logId) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-500 mt-1">Track all system activities and changes for compliance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalToday}</div>
              <div className="text-xs text-gray-500">Events Today</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-xs text-gray-500">Failed Actions</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.activeUsers}</div>
              <div className="text-xs text-gray-500">Active Users</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.criticalActions}</div>
              <div className="text-xs text-gray-500">Critical Actions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Modules</option>
            {Object.entries(modules).map(([key, mod]) => (
              <option key={key} value={key}>{mod.label}</option>
            ))}
          </select>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Actions</option>
            {Object.entries(actionTypes).map(([key, action]) => (
              <option key={key} value={key}>{action.label}</option>
            ))}
          </select>
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Users</option>
            {uniqueUsers.map((user) => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-lg border">
        <div className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{filteredLogs.length} events</span>
          </div>
        </div>
        <div className="divide-y">
          {filteredLogs.map((log) => {
            const actionType = actionTypes[log.action];
            const ActionIcon = actionType?.icon || FileText;
            const isExpanded = expandedLogs.has(log.id);

            return (
              <div key={log.id} className={cn(
                'hover:bg-gray-50 transition-colors',
                log.status === 'failed' && 'bg-red-50/50'
              )}>
                <div
                  className="px-4 py-3 cursor-pointer"
                  onClick={() => toggleLogExpand(log.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Action Icon */}
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                      actionType?.bg || 'bg-gray-100'
                    )}>
                      <ActionIcon className={cn('w-5 h-5', actionType?.color || 'text-gray-600')} />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{log.description}</span>
                        {log.status === 'failed' && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            Failed
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {log.user.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {modules[log.module]?.label || log.module}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(log.timestamp)}
                        </span>
                        <span className="text-gray-400">{log.ipAddress}</span>
                      </div>
                    </div>

                    {/* Expand Icon */}
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 ml-14 border-t bg-gray-50">
                    <div className="pt-4 space-y-4">
                      {/* Timestamp & Location */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-1">Full Timestamp</div>
                          <div className="text-sm text-gray-900">{formatFullTimestamp(log.timestamp)}</div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-1">IP Address</div>
                          <div className="text-sm text-gray-900">{log.ipAddress}</div>
                        </div>
                      </div>

                      {/* User Agent */}
                      <div>
                        <div className="text-xs font-medium text-gray-500 mb-1">User Agent</div>
                        <div className="text-sm text-gray-900">{log.userAgent}</div>
                      </div>

                      {/* Resource */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-1">Resource</div>
                          <div className="text-sm text-gray-900">{log.resource}</div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-1">Resource ID</div>
                          <div className="text-sm text-gray-900 font-mono">{log.resourceId}</div>
                        </div>
                      </div>

                      {/* Changes */}
                      {log.changes && (
                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-2">Changes</div>
                          <div className="grid grid-cols-2 gap-4">
                            {log.changes.before && (
                              <div className="bg-red-50 rounded-lg p-3">
                                <div className="text-xs font-medium text-red-700 mb-1">Before</div>
                                <pre className="text-xs text-red-900 overflow-auto">
                                  {JSON.stringify(log.changes.before, null, 2)}
                                </pre>
                              </div>
                            )}
                            {log.changes.after && (
                              <div className="bg-green-50 rounded-lg p-3">
                                <div className="text-xs font-medium text-green-700 mb-1">After</div>
                                <pre className="text-xs text-green-900 overflow-auto">
                                  {JSON.stringify(log.changes.after, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      {log.metadata && (
                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-2">Additional Details</div>
                          <div className="bg-gray-100 rounded-lg p-3">
                            <pre className="text-xs text-gray-700 overflow-auto">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* User Info */}
                      <div className="pt-3 border-t">
                        <div className="text-xs font-medium text-gray-500 mb-2">Performed By</div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                            {log.user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{log.user.name}</div>
                            <div className="text-xs text-gray-500">{log.user.email} • {log.user.role}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredLogs.length === 0 && (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-1">No logs found</h3>
              <p className="text-sm text-gray-500">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;
