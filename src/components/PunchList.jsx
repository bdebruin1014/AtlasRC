import React, { useState, useEffect, useMemo } from 'react';
import { supabase, isDemoMode } from '@/lib/supabase';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  Camera,
  MapPin,
  User,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Download,
  Edit,
  Trash2,
  X,
  Image,
  Building,
  Wrench,
  Eye,
  Send
} from 'lucide-react';

// Demo punch list data
const DEMO_PUNCH_ITEMS = [
  {
    id: 'pl-1',
    item_number: 'PL-001',
    description: 'Touch up paint on east wall - visible brush marks',
    location: 'Unit 201 - Living Room',
    area: 'Unit 201',
    trade: 'painting',
    priority: 'medium',
    status: 'open',
    assigned_to: 'Premium Painting Co',
    assigned_to_id: 'vendor-1',
    reported_by: 'John Smith',
    reported_date: '2026-01-20',
    due_date: '2026-01-30',
    completed_date: null,
    verified_by: null,
    verified_date: null,
    photos: [{ id: 'p1', url: '/placeholder.jpg', caption: 'Brush marks visible' }],
    notes: 'Multiple areas along baseboard',
    created_at: '2026-01-20T10:00:00Z'
  },
  {
    id: 'pl-2',
    item_number: 'PL-002',
    description: 'Cabinet door not aligned properly',
    location: 'Unit 201 - Kitchen',
    area: 'Unit 201',
    trade: 'carpentry',
    priority: 'low',
    status: 'completed',
    assigned_to: 'ABC Cabinets',
    assigned_to_id: 'vendor-2',
    reported_by: 'Sarah Johnson',
    reported_date: '2026-01-18',
    due_date: '2026-01-25',
    completed_date: '2026-01-22',
    verified_by: 'John Smith',
    verified_date: '2026-01-23',
    photos: [],
    notes: 'Upper cabinet near refrigerator',
    created_at: '2026-01-18T14:00:00Z'
  },
  {
    id: 'pl-3',
    item_number: 'PL-003',
    description: 'Outlet cover plate cracked',
    location: 'Unit 202 - Bedroom 1',
    area: 'Unit 202',
    trade: 'electrical',
    priority: 'low',
    status: 'in_progress',
    assigned_to: 'Elite Electric',
    assigned_to_id: 'vendor-3',
    reported_by: 'Mike Williams',
    reported_date: '2026-01-22',
    due_date: '2026-01-28',
    completed_date: null,
    verified_by: null,
    verified_date: null,
    photos: [{ id: 'p2', url: '/placeholder.jpg', caption: 'Cracked plate' }],
    notes: '',
    created_at: '2026-01-22T09:30:00Z'
  },
  {
    id: 'pl-4',
    item_number: 'PL-004',
    description: 'Faucet dripping in master bathroom',
    location: 'Unit 203 - Master Bath',
    area: 'Unit 203',
    trade: 'plumbing',
    priority: 'high',
    status: 'open',
    assigned_to: 'Premium Plumbing',
    assigned_to_id: 'vendor-4',
    reported_by: 'John Smith',
    reported_date: '2026-01-24',
    due_date: '2026-01-27',
    completed_date: null,
    verified_by: null,
    verified_date: null,
    photos: [],
    notes: 'Constant slow drip from hot water handle',
    created_at: '2026-01-24T11:00:00Z'
  },
  {
    id: 'pl-5',
    item_number: 'PL-005',
    description: 'HVAC register not blowing air',
    location: 'Common Area - Lobby',
    area: 'Common Area',
    trade: 'hvac',
    priority: 'urgent',
    status: 'open',
    assigned_to: 'Superior HVAC',
    assigned_to_id: 'vendor-5',
    reported_by: 'Sarah Johnson',
    reported_date: '2026-01-25',
    due_date: '2026-01-26',
    completed_date: null,
    verified_by: null,
    verified_date: null,
    photos: [{ id: 'p3', url: '/placeholder.jpg', caption: 'Register location' }],
    notes: 'No airflow detected, thermostat calling for heat',
    created_at: '2026-01-25T08:00:00Z'
  },
  {
    id: 'pl-6',
    item_number: 'PL-006',
    description: 'Tile grout missing in corner',
    location: 'Unit 204 - Bathroom',
    area: 'Unit 204',
    trade: 'tile',
    priority: 'medium',
    status: 'pending_verification',
    assigned_to: 'Tile Masters',
    assigned_to_id: 'vendor-6',
    reported_by: 'Mike Williams',
    reported_date: '2026-01-19',
    due_date: '2026-01-26',
    completed_date: '2026-01-24',
    verified_by: null,
    verified_date: null,
    photos: [],
    notes: 'Shower corner where walls meet',
    created_at: '2026-01-19T15:00:00Z'
  },
  {
    id: 'pl-7',
    item_number: 'PL-007',
    description: 'Window screen torn',
    location: 'Unit 201 - Bedroom 2',
    area: 'Unit 201',
    trade: 'general',
    priority: 'low',
    status: 'rejected',
    assigned_to: null,
    assigned_to_id: null,
    reported_by: 'John Smith',
    reported_date: '2026-01-21',
    due_date: null,
    completed_date: null,
    verified_by: 'Sarah Johnson',
    verified_date: '2026-01-22',
    photos: [],
    notes: 'Rejected - damage occurred during move-in by tenant, not construction defect',
    created_at: '2026-01-21T16:00:00Z'
  }
];

const STATUS_CONFIG = {
  open: { label: 'Open', color: 'bg-red-100 text-red-800', icon: Circle },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: Clock },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  pending_verification: { label: 'Pending Verification', color: 'bg-yellow-100 text-yellow-800', icon: Eye },
  verified: { label: 'Verified', color: 'bg-purple-100 text-purple-800', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-gray-100 text-gray-800', icon: X }
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-600' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700' }
};

const TRADES = [
  { value: 'general', label: 'General' },
  { value: 'painting', label: 'Painting' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'tile', label: 'Tile' },
  { value: 'flooring', label: 'Flooring' },
  { value: 'drywall', label: 'Drywall' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'appliances', label: 'Appliances' },
  { value: 'doors_windows', label: 'Doors/Windows' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'concrete', label: 'Concrete' }
];

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const PunchList = ({ projectId = null }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTrade, setSelectedTrade] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // list, board
  const [expandedItem, setExpandedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    location: '',
    area: '',
    trade: 'general',
    priority: 'medium',
    assigned_to: '',
    due_date: '',
    notes: ''
  });

  useEffect(() => {
    loadItems();
  }, [projectId]);

  const loadItems = async () => {
    setLoading(true);
    try {
      if (isDemoMode()) {
        setItems(DEMO_PUNCH_ITEMS);
      } else {
        let query = supabase
          .from('punch_list_items')
          .select('*')
          .order('created_at', { ascending: false });

        if (projectId) {
          query = query.eq('project_id', projectId);
        }

        const { data, error } = await query;
        if (error) throw error;
        setItems(data || []);
      }
    } catch (error) {
      console.error('Error loading punch list:', error);
    } finally {
      setLoading(false);
    }
  };

  const areas = useMemo(() => {
    return [...new Set(items.map(i => i.area))].filter(Boolean).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matches =
          item.item_number?.toLowerCase().includes(search) ||
          item.description?.toLowerCase().includes(search) ||
          item.location?.toLowerCase().includes(search) ||
          item.assigned_to?.toLowerCase().includes(search);
        if (!matches) return false;
      }

      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
      if (selectedTrade !== 'all' && item.trade !== selectedTrade) return false;
      if (selectedArea !== 'all' && item.area !== selectedArea) return false;
      if (selectedPriority !== 'all' && item.priority !== selectedPriority) return false;

      return true;
    });
  }, [items, searchTerm, selectedStatus, selectedTrade, selectedArea, selectedPriority]);

  const stats = useMemo(() => {
    const total = items.length;
    const open = items.filter(i => ['open', 'in_progress'].includes(i.status)).length;
    const completed = items.filter(i => ['completed', 'verified'].includes(i.status)).length;
    const pendingVerification = items.filter(i => i.status === 'pending_verification').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, open, completed, pendingVerification, completionRate };
  }, [items]);

  const groupedByStatus = useMemo(() => {
    const groups = {
      open: [],
      in_progress: [],
      pending_verification: [],
      completed: []
    };
    filteredItems.forEach(item => {
      if (groups[item.status]) {
        groups[item.status].push(item);
      } else if (item.status === 'verified') {
        groups.completed.push(item);
      }
    });
    return groups;
  }, [filteredItems]);

  const handleSaveItem = () => {
    if (!formData.description) return;

    const itemNumber = `PL-${String(items.length + 1).padStart(3, '0')}`;
    const newItem = {
      id: `pl-${Date.now()}`,
      item_number: itemNumber,
      ...formData,
      project_id: projectId,
      status: 'open',
      reported_by: 'Current User',
      reported_date: new Date().toISOString().split('T')[0],
      photos: [],
      created_at: new Date().toISOString()
    };

    if (editingItem) {
      setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...formData } : i));
    } else {
      setItems(prev => [newItem, ...prev]);
    }

    setShowModal(false);
    setEditingItem(null);
    resetForm();
  };

  const handleStatusChange = (itemId, newStatus) => {
    setItems(prev => prev.map(i => {
      if (i.id !== itemId) return i;
      const updates = { status: newStatus };
      if (newStatus === 'completed') {
        updates.completed_date = new Date().toISOString().split('T')[0];
      }
      if (newStatus === 'verified') {
        updates.verified_by = 'Current User';
        updates.verified_date = new Date().toISOString().split('T')[0];
      }
      return { ...i, ...updates };
    }));
  };

  const resetForm = () => {
    setFormData({
      description: '',
      location: '',
      area: '',
      trade: 'general',
      priority: 'medium',
      assigned_to: '',
      due_date: '',
      notes: ''
    });
  };

  const exportToPDF = () => {
    alert('Export functionality would generate a PDF punch list report');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-lg">
              <ClipboardList className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Punch List</h2>
              <p className="text-sm text-gray-500">Project closeout items</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => {
                setEditingItem(null);
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Items</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-700">{stats.open}</div>
            <div className="text-sm text-red-600">Open</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-700">{stats.pendingVerification}</div>
            <div className="text-sm text-yellow-600">Pending Verification</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{stats.completed}</div>
            <div className="text-sm text-green-600">Completed</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-700">{stats.completionRate}%</div>
            <div className="text-sm text-purple-600">Complete</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>

          <select
            value={selectedTrade}
            onChange={(e) => setSelectedTrade(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">All Trades</option>
            {TRADES.map(trade => (
              <option key={trade.value} value={trade.value}>{trade.label}</option>
            ))}
          </select>

          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">All Areas</option>
            {areas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">All Priorities</option>
            {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>

          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 ${viewMode === 'list' ? 'bg-rose-100 text-rose-700' : 'hover:bg-gray-50'}`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-2 ${viewMode === 'board' ? 'bg-rose-100 text-rose-700' : 'hover:bg-gray-50'}`}
            >
              Board
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {viewMode === 'list' ? (
          /* List View */
          filteredItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No punch list items found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const status = STATUS_CONFIG[item.status];
                const priority = PRIORITY_CONFIG[item.priority];
                const StatusIcon = status?.icon || Circle;
                const isExpanded = expandedItem === item.id;

                return (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${status?.color.split(' ')[0]}`}>
                          <StatusIcon className={`w-5 h-5 ${status?.color.split(' ')[1]}`} />
                        </div>

                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm text-gray-500">{item.item_number}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status?.color}`}>
                              {status?.label}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priority?.color}`}>
                              {priority?.label}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                              {item.trade?.replace('_', '/')}
                            </span>
                          </div>

                          <p className="font-medium text-gray-900 mt-1">{item.description}</p>

                          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {item.location}
                            </span>
                            {item.assigned_to && (
                              <span className="flex items-center gap-1">
                                <Wrench className="w-3 h-3" />
                                {item.assigned_to}
                              </span>
                            )}
                            {item.due_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Due: {formatDate(item.due_date)}
                              </span>
                            )}
                            {item.photos?.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Camera className="w-3 h-3" />
                                {item.photos.length} photo{item.photos.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-gray-100 mt-2 pt-4">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Details</h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-gray-500">Reported by:</span>
                                <span className="ml-2">{item.reported_by} on {formatDate(item.reported_date)}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Area:</span>
                                <span className="ml-2">{item.area}</span>
                              </div>
                              {item.notes && (
                                <div>
                                  <span className="text-gray-500">Notes:</span>
                                  <p className="mt-1 text-gray-700">{item.notes}</p>
                                </div>
                              )}
                              {item.completed_date && (
                                <div>
                                  <span className="text-gray-500">Completed:</span>
                                  <span className="ml-2">{formatDate(item.completed_date)}</span>
                                </div>
                              )}
                              {item.verified_by && (
                                <div>
                                  <span className="text-gray-500">Verified by:</span>
                                  <span className="ml-2">{item.verified_by} on {formatDate(item.verified_date)}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            {item.photos?.length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Photos</h4>
                                <div className="flex gap-2 flex-wrap">
                                  {item.photos.map((photo) => (
                                    <div key={photo.id} className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                      <Image className="w-8 h-8 text-gray-400" />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <h4 className="text-sm font-medium text-gray-700 mb-2">Update Status</h4>
                            <div className="flex flex-wrap gap-2">
                              {item.status === 'open' && (
                                <button
                                  onClick={() => handleStatusChange(item.id, 'in_progress')}
                                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                                >
                                  Start Work
                                </button>
                              )}
                              {item.status === 'in_progress' && (
                                <button
                                  onClick={() => handleStatusChange(item.id, 'pending_verification')}
                                  className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                                >
                                  Mark Complete
                                </button>
                              )}
                              {item.status === 'pending_verification' && (
                                <>
                                  <button
                                    onClick={() => handleStatusChange(item.id, 'verified')}
                                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                                  >
                                    Verify & Accept
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(item.id, 'open')}
                                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setFormData({
                                description: item.description,
                                location: item.location,
                                area: item.area,
                                trade: item.trade,
                                priority: item.priority,
                                assigned_to: item.assigned_to || '',
                                due_date: item.due_date || '',
                                notes: item.notes || ''
                              });
                              setShowModal(true);
                            }}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                          >
                            <Edit className="w-4 h-4 inline mr-1" />
                            Edit
                          </button>
                          <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                            <Camera className="w-4 h-4 inline mr-1" />
                            Add Photo
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Board View */
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(groupedByStatus).map(([status, statusItems]) => {
              const config = STATUS_CONFIG[status];
              return (
                <div key={status} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-700">{config?.label}</h3>
                    <span className="text-sm text-gray-500">{statusItems.length}</span>
                  </div>
                  <div className="space-y-2">
                    {statusItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-gray-400">{item.item_number}</span>
                          <span className={`px-1.5 py-0.5 rounded text-xs ${PRIORITY_CONFIG[item.priority]?.color}`}>
                            {item.priority}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.location}</p>
                        {item.assigned_to && (
                          <p className="text-xs text-gray-400 mt-1">{item.assigned_to}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {editingItem ? 'Edit Punch List Item' : 'New Punch List Item'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Unit 201 - Kitchen"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                    placeholder="e.g., Unit 201"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trade</label>
                  <select
                    value={formData.trade}
                    onChange={(e) => setFormData(prev => ({ ...prev, trade: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  >
                    {TRADES.map(trade => (
                      <option key={trade.value} value={trade.value}>{trade.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  >
                    {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                  <input
                    type="text"
                    value={formData.assigned_to}
                    onChange={(e) => setFormData(prev => ({ ...prev, assigned_to: e.target.value }))}
                    placeholder="Contractor name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveItem}
                disabled={!formData.description}
                className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50"
              >
                {editingItem ? 'Save Changes' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PunchList;
