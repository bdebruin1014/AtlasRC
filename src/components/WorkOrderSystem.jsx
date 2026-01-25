// src/components/WorkOrderSystem.jsx
// Work order management for vendor assignments and tracking

import { useState, useMemo } from 'react';
import {
  Wrench, Plus, X, Search, Filter, Clock, CheckCircle,
  AlertTriangle, User, Calendar, DollarSign, MapPin,
  Camera, MessageSquare, MoreHorizontal, ChevronRight,
  Phone, Mail, Building2, FileText, Send, Paperclip,
  Play, Pause, CheckSquare, XCircle, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================
// CONSTANTS
// ============================================

const WORK_ORDER_STATUS = {
  draft: { label: 'Draft', color: 'text-gray-600 bg-gray-100 border-gray-200', icon: FileText },
  open: { label: 'Open', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Clock },
  assigned: { label: 'Assigned', color: 'text-indigo-600 bg-indigo-50 border-indigo-200', icon: User },
  scheduled: { label: 'Scheduled', color: 'text-purple-600 bg-purple-50 border-purple-200', icon: Calendar },
  in_progress: { label: 'In Progress', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Play },
  on_hold: { label: 'On Hold', color: 'text-orange-600 bg-orange-50 border-orange-200', icon: Pause },
  completed: { label: 'Completed', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle },
  verified: { label: 'Verified', color: 'text-green-600 bg-green-50 border-green-200', icon: CheckSquare },
  closed: { label: 'Closed', color: 'text-gray-600 bg-gray-100 border-gray-200', icon: XCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-600 bg-red-50 border-red-200', icon: XCircle },
};

const WORK_TYPES = [
  { id: 'repair', label: 'Repair', icon: Wrench },
  { id: 'maintenance', label: 'Maintenance', icon: RefreshCw },
  { id: 'installation', label: 'Installation', icon: Plus },
  { id: 'inspection', label: 'Inspection', icon: Search },
  { id: 'punch_list', label: 'Punch List', icon: CheckSquare },
  { id: 'warranty_work', label: 'Warranty Work', icon: FileText },
  { id: 'change_order', label: 'Change Order', icon: FileText },
  { id: 'rework', label: 'Rework', icon: RefreshCw },
  { id: 'other', label: 'Other', icon: Wrench },
];

const PRIORITY_LEVELS = {
  low: { label: 'Low', color: 'text-gray-600 bg-gray-100' },
  normal: { label: 'Normal', color: 'text-blue-600 bg-blue-50' },
  high: { label: 'High', color: 'text-orange-600 bg-orange-50' },
  urgent: { label: 'Urgent', color: 'text-red-600 bg-red-50 animate-pulse' },
};

// ============================================
// DEMO DATA
// ============================================

const DEMO_WORK_ORDERS = [
  {
    id: 'wo-1',
    work_order_number: 'WO-2501-0001',
    title: 'HVAC Unit Repair - Unit 4B',
    description: 'AC unit not cooling properly. Tenant reported issue on 1/20.',
    work_type: 'repair',
    priority: 'high',
    status: 'in_progress',
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
    title: 'Punch List Items - Phase 1',
    description: 'Complete remaining punch list items from Phase 1 walkthrough.',
    work_type: 'punch_list',
    priority: 'urgent',
    status: 'open',
    vendor_name: 'Premier Builders Inc',
    vendor_contact: 'Bob Williams',
    vendor_phone: '(512) 555-0789',
    vendor_email: 'bob@premierbuilders.com',
    location: 'Units 1-10',
    unit_number: null,
    scheduled_date: null,
    due_date: '2025-01-26',
    estimated_cost: 5200,
    actual_cost: null,
    assigned_to: null,
    project_id: 'proj-1',
    created_at: '2025-01-23T09:15:00Z',
  },
  {
    id: 'wo-4',
    work_order_number: 'WO-2501-0004',
    title: 'Plumbing Fixture Installation',
    description: 'Install bathroom fixtures in units 11-15.',
    work_type: 'installation',
    priority: 'normal',
    status: 'completed',
    vendor_name: 'Smith Plumbing LLC',
    vendor_contact: 'Tom Smith',
    vendor_phone: '(512) 555-0321',
    vendor_email: 'tom@smithplumbing.com',
    location: 'Building C',
    unit_number: '11-15',
    scheduled_date: '2025-01-18',
    completed_date: '2025-01-22',
    due_date: '2025-01-24',
    estimated_cost: 3800,
    actual_cost: 3650,
    assigned_to: 'Jane Doe',
    project_id: 'proj-1',
    created_at: '2025-01-15T11:00:00Z',
  },
];

const DEMO_VENDORS = [
  { id: 'v-1', name: 'Cool Air HVAC Services', trade: 'HVAC', phone: '(512) 555-0123' },
  { id: 'v-2', name: 'Spark Electric Co', trade: 'Electrical', phone: '(512) 555-0456' },
  { id: 'v-3', name: 'Premier Builders Inc', trade: 'General Contractor', phone: '(512) 555-0789' },
  { id: 'v-4', name: 'Smith Plumbing LLC', trade: 'Plumbing', phone: '(512) 555-0321' },
  { id: 'v-5', name: 'Pro Paint Solutions', trade: 'Painting', phone: '(512) 555-0654' },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatCurrency = (value) => {
  if (!value) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const getDaysUntilDue = (dueDate) => {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
};

// ============================================
// SUB-COMPONENTS
// ============================================

function WorkOrderCard({ workOrder, onClick }) {
  const statusInfo = WORK_ORDER_STATUS[workOrder.status];
  const StatusIcon = statusInfo?.icon || Clock;
  const priorityInfo = PRIORITY_LEVELS[workOrder.priority];
  const workTypeInfo = WORK_TYPES.find((t) => t.id === workOrder.work_type);
  const daysUntilDue = getDaysUntilDue(workOrder.due_date);
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0 && !['completed', 'verified', 'closed', 'cancelled'].includes(workOrder.status);

  return (
    <div
      className={cn(
        'bg-white rounded-lg border p-4 hover:shadow-md transition-all cursor-pointer',
        isOverdue && 'border-red-200 bg-red-50/30'
      )}
      onClick={() => onClick?.(workOrder)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-gray-500">{workOrder.work_order_number}</span>
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', priorityInfo?.color)}>
              {priorityInfo?.label}
            </span>
          </div>

          {/* Title */}
          <h4 className="font-semibold text-gray-900 truncate">{workOrder.title}</h4>

          {/* Description */}
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{workOrder.description}</p>

          {/* Details Row */}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
            {workOrder.vendor_name && (
              <span className="flex items-center gap-1 text-gray-600">
                <Building2 className="h-4 w-4 text-gray-400" />
                {workOrder.vendor_name}
              </span>
            )}
            {workOrder.location && (
              <span className="flex items-center gap-1 text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400" />
                {workOrder.location}
                {workOrder.unit_number && ` - ${workOrder.unit_number}`}
              </span>
            )}
            {workOrder.estimated_cost && (
              <span className="flex items-center gap-1 text-gray-600">
                <DollarSign className="h-4 w-4 text-gray-400" />
                {formatCurrency(workOrder.estimated_cost)}
              </span>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex flex-col items-end gap-2">
          <span className={cn('flex items-center gap-1 text-xs px-2 py-1 rounded-full border font-medium', statusInfo?.color)}>
            <StatusIcon className="h-3 w-3" />
            {statusInfo?.label}
          </span>

          {/* Due Date */}
          {workOrder.due_date && (
            <span
              className={cn(
                'text-xs',
                isOverdue ? 'text-red-600 font-medium' : daysUntilDue <= 2 ? 'text-amber-600' : 'text-gray-500'
              )}
            >
              {isOverdue ? `${Math.abs(daysUntilDue)} days overdue` : `Due ${formatDate(workOrder.due_date)}`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function WorkOrderStatusBoard({ workOrders, onWorkOrderClick }) {
  const columns = [
    { id: 'open', statuses: ['open', 'assigned'] },
    { id: 'in_progress', statuses: ['scheduled', 'in_progress', 'on_hold'] },
    { id: 'completed', statuses: ['completed', 'verified'] },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {columns.map((col) => {
        const colOrders = workOrders.filter((wo) => col.statuses.includes(wo.status));
        const titles = { open: 'Open', in_progress: 'In Progress', completed: 'Completed' };

        return (
          <div key={col.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-700">{titles[col.id]}</h4>
              <span className="text-sm text-gray-500 bg-white px-2 py-0.5 rounded-full">{colOrders.length}</span>
            </div>
            <div className="space-y-3 min-h-[200px]">
              {colOrders.map((wo) => (
                <div
                  key={wo.id}
                  className="bg-white rounded-lg border p-3 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onWorkOrderClick?.(wo)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-gray-400">{wo.work_order_number}</span>
                    <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium', PRIORITY_LEVELS[wo.priority]?.color)}>
                      {wo.priority}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">{wo.title}</p>
                  {wo.vendor_name && <p className="text-xs text-gray-500 mt-1">{wo.vendor_name}</p>}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CreateWorkOrderModal({ isOpen, onClose, onSave, vendors = DEMO_VENDORS }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    work_type: 'repair',
    priority: 'normal',
    vendor_id: '',
    location: '',
    unit_number: '',
    due_date: '',
    estimated_cost: '',
  });

  if (!isOpen) return null;

  const handleSave = () => {
    const selectedVendor = vendors.find((v) => v.id === form.vendor_id);
    onSave?.({
      ...form,
      vendor_name: selectedVendor?.name,
      work_order_number: `WO-${new Date().toISOString().slice(2, 7).replace('-', '')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      status: 'open',
      created_at: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Create Work Order</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Brief description of work needed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Detailed description of the work..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Type</label>
              <select
                value={form.work_type}
                onChange={(e) => setForm({ ...form, work_type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {WORK_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {Object.entries(PRIORITY_LEVELS).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Vendor</label>
            <select
              value={form.vendor_id}
              onChange={(e) => setForm({ ...form, vendor_id: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select a vendor...</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name} ({vendor.trade})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g., Building A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Number</label>
              <input
                type="text"
                value={form.unit_number}
                onChange={(e) => setForm({ ...form, unit_number: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g., 4B"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost</label>
              <input
                type="number"
                value={form.estimated_cost}
                onChange={(e) => setForm({ ...form, estimated_cost: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!form.title} className="bg-[#2F855A] hover:bg-[#276749] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create Work Order
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function WorkOrderSystem({
  projectId,
  workOrders = DEMO_WORK_ORDERS,
  vendors = DEMO_VENDORS,
  onCreateWorkOrder,
  onUpdateWorkOrder,
  onWorkOrderClick,
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // list, board
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter work orders
  const filteredWorkOrders = useMemo(() => {
    let filtered = [...workOrders];

    if (projectId) {
      filtered = filtered.filter((wo) => wo.project_id === projectId);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (wo) =>
          wo.title.toLowerCase().includes(searchLower) ||
          wo.work_order_number.toLowerCase().includes(searchLower) ||
          wo.vendor_name?.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((wo) => wo.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter((wo) => wo.priority === priorityFilter);
    }

    // Sort by priority and due date
    filtered.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (a.due_date && b.due_date) {
        return new Date(a.due_date) - new Date(b.due_date);
      }
      return 0;
    });

    return filtered;
  }, [workOrders, projectId, search, statusFilter, priorityFilter]);

  // Summary stats
  const stats = useMemo(() => {
    const orders = projectId ? workOrders.filter((wo) => wo.project_id === projectId) : workOrders;
    return {
      total: orders.length,
      open: orders.filter((wo) => ['open', 'assigned', 'scheduled'].includes(wo.status)).length,
      inProgress: orders.filter((wo) => wo.status === 'in_progress').length,
      completed: orders.filter((wo) => ['completed', 'verified', 'closed'].includes(wo.status)).length,
      overdue: orders.filter((wo) => {
        const days = getDaysUntilDue(wo.due_date);
        return days !== null && days < 0 && !['completed', 'verified', 'closed', 'cancelled'].includes(wo.status);
      }).length,
    };
  }, [workOrders, projectId]);

  const handleCreateWorkOrder = (wo) => {
    onCreateWorkOrder?.(wo);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-500">Total Orders</p>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <p className="text-2xl font-bold text-blue-700">{stats.open}</p>
          <p className="text-sm text-blue-600">Open</p>
        </div>
        <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
          <p className="text-2xl font-bold text-amber-700">{stats.inProgress}</p>
          <p className="text-sm text-amber-600">In Progress</p>
        </div>
        <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4">
          <p className="text-2xl font-bold text-emerald-700">{stats.completed}</p>
          <p className="text-sm text-emerald-600">Completed</p>
        </div>
        <div className={cn('rounded-lg border p-4', stats.overdue > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50')}>
          <p className={cn('text-2xl font-bold', stats.overdue > 0 ? 'text-red-700' : 'text-gray-400')}>{stats.overdue}</p>
          <p className={cn('text-sm', stats.overdue > 0 ? 'text-red-600' : 'text-gray-500')}>Overdue</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search work orders..."
            className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Status</option>
          {Object.entries(WORK_ORDER_STATUS).map(([key, value]) => (
            <option key={key} value={key}>
              {value.label}
            </option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Priority</option>
          {Object.entries(PRIORITY_LEVELS).map(([key, value]) => (
            <option key={key} value={key}>
              {value.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            )}
          >
            List
          </button>
          <button
            onClick={() => setViewMode('board')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              viewMode === 'board' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Board
          </button>
        </div>

        <Button onClick={() => setShowCreateModal(true)} className="bg-[#2F855A] hover:bg-[#276749] text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Work Order
        </Button>
      </div>

      {/* Work Order List/Board */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredWorkOrders.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No work orders found</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Work Order
              </Button>
            </div>
          ) : (
            filteredWorkOrders.map((wo) => <WorkOrderCard key={wo.id} workOrder={wo} onClick={onWorkOrderClick} />)
          )}
        </div>
      ) : (
        <WorkOrderStatusBoard workOrders={filteredWorkOrders} onWorkOrderClick={onWorkOrderClick} />
      )}

      {/* Create Modal */}
      <CreateWorkOrderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateWorkOrder}
        vendors={vendors}
      />
    </div>
  );
}

// ============================================
// WORK ORDER SUMMARY WIDGET
// ============================================

export function WorkOrderSummaryWidget({ workOrders = [], onClick }) {
  const urgentCount = workOrders.filter((wo) => wo.priority === 'urgent' && !['completed', 'closed', 'cancelled'].includes(wo.status)).length;
  const overdueCount = workOrders.filter((wo) => {
    const days = getDaysUntilDue(wo.due_date);
    return days !== null && days < 0 && !['completed', 'verified', 'closed', 'cancelled'].includes(wo.status);
  }).length;

  if (urgentCount === 0 && overdueCount === 0) return null;

  return (
    <div
      className={cn(
        'rounded-lg p-4 border cursor-pointer hover:shadow-md transition-shadow',
        overdueCount > 0 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-2">
        <Wrench className={cn('h-5 w-5', overdueCount > 0 ? 'text-red-600' : 'text-amber-600')} />
        <h4 className={cn('font-semibold', overdueCount > 0 ? 'text-red-900' : 'text-amber-900')}>Work Orders Attention Needed</h4>
      </div>
      <div className="flex items-center gap-4 text-sm">
        {overdueCount > 0 && (
          <span className="text-red-600 font-medium">{overdueCount} overdue</span>
        )}
        {urgentCount > 0 && (
          <span className="text-amber-600 font-medium">{urgentCount} urgent</span>
        )}
      </div>
    </div>
  );
}
