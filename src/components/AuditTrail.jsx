import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';
import {
  History,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  User,
  Calendar,
  FileText,
  Edit,
  Trash2,
  Plus,
  Check,
  X,
  RefreshCw,
  Download,
  Clock,
  ArrowRight,
  Eye,
  DollarSign,
  Building,
  Users,
  Folder,
  AlertCircle
} from 'lucide-react';

// Demo data for audit trail
const DEMO_AUDIT_DATA = [
  {
    id: '1',
    entity_type: 'project',
    entity_id: 'proj-1',
    entity_name: 'Sunset Apartments',
    action: 'create',
    field_name: null,
    old_value: null,
    new_value: null,
    changes: { name: 'Sunset Apartments', budget: 5000000, status: 'active' },
    user_id: 'user-1',
    user_name: 'John Smith',
    user_email: 'john@example.com',
    project_id: 'proj-1',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: '2',
    entity_type: 'budget',
    entity_id: 'budget-1',
    entity_name: 'Foundation Work',
    action: 'update',
    field_name: 'amount',
    old_value: '250000',
    new_value: '275000',
    changes: { amount: { from: 250000, to: 275000 }, reason: 'Material cost increase' },
    user_id: 'user-2',
    user_name: 'Sarah Johnson',
    user_email: 'sarah@example.com',
    project_id: 'proj-1',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: '3',
    entity_type: 'draw_request',
    entity_id: 'draw-1',
    entity_name: 'Draw Request #001',
    action: 'submit',
    field_name: 'status',
    old_value: 'draft',
    new_value: 'submitted',
    changes: { status: 'submitted', amount: 150000 },
    user_id: 'user-1',
    user_name: 'John Smith',
    user_email: 'john@example.com',
    project_id: 'proj-1',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  },
  {
    id: '4',
    entity_type: 'draw_request',
    entity_id: 'draw-1',
    entity_name: 'Draw Request #001',
    action: 'approve',
    field_name: 'status',
    old_value: 'submitted',
    new_value: 'approved',
    changes: { status: 'approved', approved_by: 'Mike Williams', approved_amount: 150000 },
    user_id: 'user-3',
    user_name: 'Mike Williams',
    user_email: 'mike@example.com',
    project_id: 'proj-1',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
  },
  {
    id: '5',
    entity_type: 'vendor',
    entity_id: 'vendor-1',
    entity_name: 'ABC Construction',
    action: 'create',
    field_name: null,
    old_value: null,
    new_value: null,
    changes: { name: 'ABC Construction', type: 'General Contractor', contact: 'Bob Builder' },
    user_id: 'user-2',
    user_name: 'Sarah Johnson',
    user_email: 'sarah@example.com',
    project_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: '6',
    entity_type: 'document',
    entity_id: 'doc-1',
    entity_name: 'Insurance Certificate',
    action: 'update',
    field_name: 'expiration_date',
    old_value: '2026-01-15',
    new_value: '2027-01-15',
    changes: { expiration_date: { from: '2026-01-15', to: '2027-01-15' }, renewed: true },
    user_id: 'user-1',
    user_name: 'John Smith',
    user_email: 'john@example.com',
    project_id: 'proj-1',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  },
  {
    id: '7',
    entity_type: 'work_order',
    entity_id: 'wo-1',
    entity_name: 'WO-2601-0001',
    action: 'create',
    field_name: null,
    old_value: null,
    new_value: null,
    changes: { title: 'Electrical Inspection', vendor: 'Spark Electric', priority: 'high' },
    user_id: 'user-2',
    user_name: 'Sarah Johnson',
    user_email: 'sarah@example.com',
    project_id: 'proj-1',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()
  },
  {
    id: '8',
    entity_type: 'investor',
    entity_id: 'inv-1',
    entity_name: 'Capital Partners LLC',
    action: 'update',
    field_name: 'commitment',
    old_value: '1000000',
    new_value: '1500000',
    changes: { commitment: { from: 1000000, to: 1500000 }, equity_percentage: { from: 20, to: 30 } },
    user_id: 'user-3',
    user_name: 'Mike Williams',
    user_email: 'mike@example.com',
    project_id: 'proj-1',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString()
  },
  {
    id: '9',
    entity_type: 'budget',
    entity_id: 'budget-2',
    entity_name: 'Landscaping',
    action: 'delete',
    field_name: null,
    old_value: null,
    new_value: null,
    changes: { deleted_item: 'Landscaping', amount: 50000, reason: 'Scope reduction' },
    user_id: 'user-1',
    user_name: 'John Smith',
    user_email: 'john@example.com',
    project_id: 'proj-1',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString()
  },
  {
    id: '10',
    entity_type: 'project',
    entity_id: 'proj-2',
    entity_name: 'Downtown Tower',
    action: 'archive',
    field_name: 'status',
    old_value: 'active',
    new_value: 'archived',
    changes: { status: 'archived', reason: 'Project completed' },
    user_id: 'user-3',
    user_name: 'Mike Williams',
    user_email: 'mike@example.com',
    project_id: 'proj-2',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString()
  }
];

const ENTITY_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'project', label: 'Projects' },
  { value: 'budget', label: 'Budget Items' },
  { value: 'draw_request', label: 'Draw Requests' },
  { value: 'vendor', label: 'Vendors' },
  { value: 'document', label: 'Documents' },
  { value: 'work_order', label: 'Work Orders' },
  { value: 'investor', label: 'Investors' }
];

const ACTION_TYPES = [
  { value: 'all', label: 'All Actions' },
  { value: 'create', label: 'Created' },
  { value: 'update', label: 'Updated' },
  { value: 'delete', label: 'Deleted' },
  { value: 'archive', label: 'Archived' },
  { value: 'restore', label: 'Restored' },
  { value: 'approve', label: 'Approved' },
  { value: 'reject', label: 'Rejected' },
  { value: 'submit', label: 'Submitted' }
];

const getEntityIcon = (entityType) => {
  const icons = {
    project: Building,
    budget: DollarSign,
    draw_request: FileText,
    vendor: Users,
    document: Folder,
    work_order: AlertCircle,
    investor: Users
  };
  return icons[entityType] || FileText;
};

const getActionColor = (action) => {
  const colors = {
    create: 'bg-green-100 text-green-800',
    update: 'bg-blue-100 text-blue-800',
    delete: 'bg-red-100 text-red-800',
    archive: 'bg-gray-100 text-gray-800',
    restore: 'bg-purple-100 text-purple-800',
    approve: 'bg-emerald-100 text-emerald-800',
    reject: 'bg-orange-100 text-orange-800',
    submit: 'bg-indigo-100 text-indigo-800'
  };
  return colors[action] || 'bg-gray-100 text-gray-800';
};

const getActionIcon = (action) => {
  const icons = {
    create: Plus,
    update: Edit,
    delete: Trash2,
    archive: Folder,
    restore: RefreshCw,
    approve: Check,
    reject: X,
    submit: ArrowRight
  };
  return icons[action] || Edit;
};

const formatTimeAgo = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
};

const AuditTrail = ({
  projectId = null,
  entityType = null,
  entityId = null,
  limit = 50,
  showFilters = true,
  compact = false
}) => {
  const [auditEntries, setAuditEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntityType, setSelectedEntityType] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [expandedEntries, setExpandedEntries] = useState(new Set());
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadAuditTrail();
  }, [projectId, entityType, entityId]);

  const loadAuditTrail = async () => {
    setLoading(true);
    try {
      if (isDemoMode()) {
        let data = [...DEMO_AUDIT_DATA];
        if (projectId) {
          data = data.filter(e => e.project_id === projectId);
        }
        if (entityType) {
          data = data.filter(e => e.entity_type === entityType);
        }
        if (entityId) {
          data = data.filter(e => e.entity_id === entityId);
        }
        setAuditEntries(data);

        // Extract unique users
        const uniqueUsers = [...new Set(data.map(e => e.user_name))].filter(Boolean);
        setUsers(uniqueUsers);
      } else {
        let query = supabase
          .from('audit_trail')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (projectId) {
          query = query.eq('project_id', projectId);
        }
        if (entityType) {
          query = query.eq('entity_type', entityType);
        }
        if (entityId) {
          query = query.eq('entity_id', entityId);
        }

        const { data, error } = await query;
        if (error) throw error;
        setAuditEntries(data || []);

        // Extract unique users
        const uniqueUsers = [...new Set((data || []).map(e => e.user_name))].filter(Boolean);
        setUsers(uniqueUsers);
      }
    } catch (error) {
      console.error('Error loading audit trail:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = useMemo(() => {
    return auditEntries.filter(entry => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          entry.entity_name?.toLowerCase().includes(search) ||
          entry.user_name?.toLowerCase().includes(search) ||
          entry.action?.toLowerCase().includes(search) ||
          entry.entity_type?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Entity type filter
      if (selectedEntityType !== 'all' && entry.entity_type !== selectedEntityType) {
        return false;
      }

      // Action filter
      if (selectedAction !== 'all' && entry.action !== selectedAction) {
        return false;
      }

      // User filter
      if (selectedUser !== 'all' && entry.user_name !== selectedUser) {
        return false;
      }

      // Date range filter
      if (dateRange.start) {
        const entryDate = new Date(entry.created_at);
        const startDate = new Date(dateRange.start);
        if (entryDate < startDate) return false;
      }
      if (dateRange.end) {
        const entryDate = new Date(entry.created_at);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        if (entryDate > endDate) return false;
      }

      return true;
    });
  }, [auditEntries, searchTerm, selectedEntityType, selectedAction, selectedUser, dateRange]);

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedEntries(newExpanded);
  };

  const exportAuditTrail = () => {
    const csv = [
      ['Timestamp', 'Entity Type', 'Entity Name', 'Action', 'Field', 'Old Value', 'New Value', 'User', 'Email'].join(','),
      ...filteredEntries.map(entry => [
        new Date(entry.created_at).toISOString(),
        entry.entity_type,
        `"${entry.entity_name || ''}"`,
        entry.action,
        entry.field_name || '',
        `"${entry.old_value || ''}"`,
        `"${entry.new_value || ''}"`,
        `"${entry.user_name || ''}"`,
        entry.user_email || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderChangeDetails = (entry) => {
    if (!entry.changes || Object.keys(entry.changes).length === 0) {
      if (entry.old_value || entry.new_value) {
        return (
          <div className="mt-2 text-sm">
            <span className="text-gray-500">{entry.field_name}: </span>
            {entry.old_value && (
              <span className="text-red-600 line-through mr-2">{entry.old_value}</span>
            )}
            {entry.new_value && (
              <span className="text-green-600">{entry.new_value}</span>
            )}
          </div>
        );
      }
      return null;
    }

    return (
      <div className="mt-3 bg-gray-50 rounded-lg p-3 text-sm">
        <div className="font-medium text-gray-700 mb-2">Change Details:</div>
        <div className="space-y-1">
          {Object.entries(entry.changes).map(([key, value]) => (
            <div key={key} className="flex items-start gap-2">
              <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}:</span>
              {typeof value === 'object' && value !== null && (value.from !== undefined || value.to !== undefined) ? (
                <span>
                  <span className="text-red-600 line-through">{String(value.from)}</span>
                  <ArrowRight className="w-3 h-3 inline mx-1 text-gray-400" />
                  <span className="text-green-600">{String(value.to)}</span>
                </span>
              ) : (
                <span className="text-gray-900">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className={compact ? '' : 'bg-white rounded-xl shadow-sm border border-gray-200'}>
      {/* Header */}
      {!compact && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <History className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Audit Trail</h2>
                <p className="text-sm text-gray-500">
                  {filteredEntries.length} entries
                </p>
              </div>
            </div>
            <button
              onClick={exportAuditTrail}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="p-4 border-b border-gray-200 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by entity, user, or action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedEntityType}
              onChange={(e) => setSelectedEntityType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {ENTITY_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {ACTION_TYPES.map(action => (
                <option key={action.value} value={action.value}>{action.label}</option>
              ))}
            </select>

            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Users</option>
              {users.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedEntityType('all');
                setSelectedAction('all');
                setSelectedUser('all');
                setDateRange({ start: '', end: '' });
              }}
              className="px-3 py-2 text-gray-600 hover:text-gray-800"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Audit Entries */}
      <div className={compact ? '' : 'p-4'}>
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No audit entries found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry) => {
              const EntityIcon = getEntityIcon(entry.entity_type);
              const ActionIcon = getActionIcon(entry.action);
              const isExpanded = expandedEntries.has(entry.id);

              return (
                <div
                  key={entry.id}
                  className="border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => toggleExpanded(entry.id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Entity Icon */}
                      <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                        <EntityIcon className="w-5 h-5 text-gray-600" />
                      </div>

                      {/* Content */}
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getActionColor(entry.action)}`}>
                            <ActionIcon className="w-3 h-3" />
                            {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}
                          </span>
                          <span className="text-sm text-gray-500 capitalize">
                            {entry.entity_type.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <h4 className="font-medium text-gray-900 mt-1">
                          {entry.entity_name || 'Unknown Entity'}
                        </h4>

                        {entry.field_name && !isExpanded && (
                          <p className="text-sm text-gray-500 mt-1">
                            Changed <span className="font-medium">{entry.field_name}</span>
                            {entry.old_value && entry.new_value && (
                              <span> from {entry.old_value} to {entry.new_value}</span>
                            )}
                          </p>
                        )}

                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {entry.user_name || 'Unknown User'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(entry.created_at)}
                          </span>
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

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Full Timestamp:</span>
                            <span className="ml-2 text-gray-900">
                              {new Date(entry.created_at).toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Email:</span>
                            <span className="ml-2 text-gray-900">
                              {entry.user_email || 'N/A'}
                            </span>
                          </div>
                          {entry.project_id && (
                            <div>
                              <span className="text-gray-500">Project ID:</span>
                              <span className="ml-2 text-gray-900 font-mono text-xs">
                                {entry.project_id}
                              </span>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-500">Entity ID:</span>
                            <span className="ml-2 text-gray-900 font-mono text-xs">
                              {entry.entity_id}
                            </span>
                          </div>
                        </div>
                        {renderChangeDetails(entry)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditTrail;
