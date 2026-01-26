import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Wrench, Plus, Search, Filter, Clock, CheckCircle,
  AlertTriangle, User, Calendar, DollarSign, MapPin,
  Eye, Edit2, Trash2, X, Check, Play, Pause,
  Phone, Mail, Building2, ChevronDown, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { workOrderService } from '@/services/workOrderService';

const STATUS_CONFIG = {
  open: { label: 'Open', color: 'bg-blue-100 text-blue-700', icon: Clock },
  assigned: { label: 'Assigned', color: 'bg-indigo-100 text-indigo-700', icon: User },
  scheduled: { label: 'Scheduled', color: 'bg-purple-100 text-purple-700', icon: Calendar },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700', icon: Play },
  on_hold: { label: 'On Hold', color: 'bg-orange-100 text-orange-700', icon: Pause },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: X },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-600' },
  normal: { label: 'Normal', color: 'bg-blue-100 text-blue-600' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-600' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-600' },
};

const WORK_TYPES = [
  { key: 'repair', label: 'Repair' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'installation', label: 'Installation' },
  { key: 'inspection', label: 'Inspection' },
  { key: 'punch_list', label: 'Punch List' },
  { key: 'warranty_work', label: 'Warranty Work' },
  { key: 'change_order', label: 'Change Order' },
  { key: 'rework', label: 'Rework' },
  { key: 'other', label: 'Other' },
];

const WorkOrdersPage = () => {
  const { projectId } = useParams();
  const [workOrders, setWorkOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    work_type: 'repair',
    priority: 'normal',
    location: '',
    unit_number: '',
    due_date: '',
    estimated_cost: '',
  });

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [woRes, summaryRes] = await Promise.all([
        workOrderService.getAll(projectId),
        workOrderService.getSummary(projectId),
      ]);

      setWorkOrders(woRes.data || []);
      setSummary(summaryRes.data || null);
    } catch (err) {
      console.error('Error fetching work orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedWorkOrder) {
        await workOrderService.update(selectedWorkOrder.id, formData);
      } else {
        await workOrderService.create({
          ...formData,
          project_id: projectId,
          estimated_cost: parseFloat(formData.estimated_cost) || null,
        });
      }

      await fetchData();
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('Error saving work order:', err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await workOrderService.updateStatus(id, newStatus);
      await fetchData();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this work order?')) return;

    try {
      await workOrderService.delete(id);
      await fetchData();
    } catch (err) {
      console.error('Error deleting work order:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      work_type: 'repair',
      priority: 'normal',
      location: '',
      unit_number: '',
      due_date: '',
      estimated_cost: '',
    });
    setSelectedWorkOrder(null);
  };

  const openEdit = (wo) => {
    setSelectedWorkOrder(wo);
    setFormData({
      title: wo.title,
      description: wo.description || '',
      work_type: wo.work_type,
      priority: wo.priority,
      location: wo.location || '',
      unit_number: wo.unit_number || '',
      due_date: wo.due_date || '',
      estimated_cost: wo.estimated_cost?.toString() || '',
    });
    setShowModal(true);
  };

  const filteredWorkOrders = workOrders.filter(wo => {
    const matchesStatus = filterStatus === 'all' || wo.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || wo.priority === filterPriority;
    const matchesSearch = !searchQuery ||
      wo.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.work_order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.vendor_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const formatCurrency = (val) => {
    if (!val) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isOverdue = (wo) => {
    if (!wo.due_date || ['completed', 'closed', 'cancelled'].includes(wo.status)) return false;
    return new Date(wo.due_date) < new Date();
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-pulse">Loading work orders...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Work Orders
          </h1>
          <p className="text-sm text-gray-500">Manage vendor work assignments and tracking</p>
        </div>
        <Button
          className="bg-[#047857] hover:bg-[#065f46]"
          onClick={() => { resetForm(); setShowModal(true); }}
        >
          <Plus className="w-4 h-4 mr-1" />New Work Order
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-semibold">{summary?.total || 0}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-sm text-gray-500">Open</p>
          <p className="text-2xl font-semibold text-blue-600">{summary?.open || 0}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-amber-500">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-semibold text-amber-600">{summary?.inProgress || 0}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-semibold text-green-600">{summary?.completed || 0}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-red-500">
          <p className="text-sm text-gray-500">Overdue</p>
          <p className="text-2xl font-semibold text-red-600">{summary?.overdue || 0}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Est. Cost</p>
          <p className="text-2xl font-semibold">{formatCurrency(summary?.estimatedCost)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search work orders..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">All Priority</option>
            {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Work Orders Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Work Order</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-left px-4 py-3 font-medium">Location</th>
              <th className="text-left px-4 py-3 font-medium">Vendor</th>
              <th className="text-left px-4 py-3 font-medium">Due Date</th>
              <th className="text-right px-4 py-3 font-medium">Est. Cost</th>
              <th className="text-left px-4 py-3 font-medium">Priority</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="w-24 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredWorkOrders.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  No work orders found
                </td>
              </tr>
            ) : (
              filteredWorkOrders.map((wo) => (
                <tr key={wo.id} className={cn("hover:bg-gray-50", isOverdue(wo) && "bg-red-50")}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#047857]">{wo.work_order_number}</p>
                    <p className="text-sm text-gray-600 truncate max-w-[200px]">{wo.title}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 capitalize">
                    {wo.work_type?.replace('_', ' ')}
                  </td>
                  <td className="px-4 py-3">
                    {wo.location && <p>{wo.location}</p>}
                    {wo.unit_number && <p className="text-xs text-gray-500">Unit {wo.unit_number}</p>}
                    {!wo.location && !wo.unit_number && '-'}
                  </td>
                  <td className="px-4 py-3">
                    {wo.vendor_name || <span className="text-gray-400">Unassigned</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(isOverdue(wo) && "text-red-600 font-medium")}>
                      {formatDate(wo.due_date)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{formatCurrency(wo.estimated_cost)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-1 rounded text-xs", PRIORITY_CONFIG[wo.priority]?.color)}>
                      {PRIORITY_CONFIG[wo.priority]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-1 rounded text-xs", STATUS_CONFIG[wo.status]?.color)}>
                      {STATUS_CONFIG[wo.status]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button
                        className="p-1 hover:bg-gray-100 rounded"
                        onClick={() => openEdit(wo)}
                      >
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </button>
                      {wo.status !== 'completed' && wo.status !== 'cancelled' && (
                        <button
                          className="p-1 hover:bg-green-100 rounded"
                          onClick={() => handleStatusChange(wo.id, 'completed')}
                          title="Mark Complete"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </button>
                      )}
                      <button
                        className="p-1 hover:bg-red-100 rounded"
                        onClick={() => handleDelete(wo.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">
                {selectedWorkOrder ? 'Edit Work Order' : 'New Work Order'}
              </h3>
              <button onClick={() => { setShowModal(false); resetForm(); }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief description of work needed"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Description</label>
                <textarea
                  className="w-full border rounded-md px-3 py-2"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Work Type</label>
                  <select
                    className="w-full border rounded-md px-3 py-2"
                    value={formData.work_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, work_type: e.target.value }))}
                  >
                    {WORK_TYPES.map(t => (
                      <option key={t.key} value={t.key}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Priority</label>
                  <select
                    className="w-full border rounded-md px-3 py-2"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Building A"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Unit #</label>
                  <Input
                    value={formData.unit_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit_number: e.target.value }))}
                    placeholder="101"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Due Date</label>
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Estimated Cost</label>
                  <Input
                    type="number"
                    value={formData.estimated_cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimated_cost: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 sticky bottom-0">
              <Button variant="outline" onClick={() => { setShowModal(false); resetForm(); }}>
                Cancel
              </Button>
              <Button
                className="bg-[#047857] hover:bg-[#065f46]"
                onClick={handleSubmit}
                disabled={!formData.title}
              >
                <Check className="w-4 h-4 mr-1" />
                {selectedWorkOrder ? 'Update' : 'Create'} Work Order
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrdersPage;
