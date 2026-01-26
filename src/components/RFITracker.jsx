import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';
import {
  HelpCircle,
  Plus,
  Search,
  Filter,
  Clock,
  User,
  Calendar,
  FileText,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Send,
  Paperclip,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Download,
  Edit,
  Trash2,
  X,
  Building,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';

// Demo RFI data
const DEMO_RFIS = [
  {
    id: 'rfi-1',
    rfi_number: 'RFI-001',
    subject: 'Foundation wall reinforcement detail',
    description: 'Drawing A2.1 shows #4 rebar at 12" o.c. but specification section 03300 calls for #5 at 8" o.c. Please clarify which is correct.',
    project_id: 'proj-1',
    project_name: 'Sunset Apartments',
    status: 'answered',
    priority: 'high',
    category: 'structural',
    cost_impact: true,
    schedule_impact: true,
    estimated_cost_impact: 15000,
    estimated_days_impact: 3,
    submitted_by: 'Mike Williams',
    submitted_by_id: 'user-3',
    submitted_date: '2026-01-15',
    assigned_to: 'ABC Architects',
    assigned_to_id: 'vendor-1',
    due_date: '2026-01-22',
    answered_date: '2026-01-20',
    answered_by: 'John Smith',
    response: 'Use #5 rebar at 8" o.c. as specified. Drawing will be revised in next ASI.',
    spec_section: '03300',
    drawing_reference: 'A2.1',
    location: 'Foundation - Grid Lines A-C, 1-5',
    attachments: [{ name: 'foundation_detail.pdf', size: '2.4 MB' }],
    responses: [
      { id: 'r-1', user: 'John Smith', date: '2026-01-20', message: 'Use #5 rebar at 8" o.c. as specified. Drawing will be revised in next ASI.', is_official: true }
    ],
    created_at: '2026-01-15T10:00:00Z'
  },
  {
    id: 'rfi-2',
    rfi_number: 'RFI-002',
    subject: 'Electrical panel location conflict',
    description: 'Electrical panel EP-2A as shown on E3.1 conflicts with the HVAC ductwork shown on M4.2. Panel cannot be installed at specified location.',
    project_id: 'proj-1',
    project_name: 'Sunset Apartments',
    status: 'open',
    priority: 'urgent',
    category: 'electrical',
    cost_impact: true,
    schedule_impact: true,
    estimated_cost_impact: 8500,
    estimated_days_impact: 5,
    submitted_by: 'Tom Wilson',
    submitted_by_id: 'user-4',
    submitted_date: '2026-01-22',
    assigned_to: 'Elite Engineering',
    assigned_to_id: 'vendor-2',
    due_date: '2026-01-29',
    answered_date: null,
    answered_by: null,
    response: null,
    spec_section: '26 24 16',
    drawing_reference: 'E3.1, M4.2',
    location: 'Level 2 - Electrical Room 201',
    attachments: [
      { name: 'conflict_photo.jpg', size: '1.8 MB' },
      { name: 'proposed_relocation.pdf', size: '456 KB' }
    ],
    responses: [
      { id: 'r-2', user: 'Mike Williams', date: '2026-01-23', message: 'We need this resolved ASAP - electrical rough-in is scheduled for next week.', is_official: false }
    ],
    created_at: '2026-01-22T14:30:00Z'
  },
  {
    id: 'rfi-3',
    rfi_number: 'RFI-003',
    subject: 'Window manufacturer substitution',
    description: 'Specified window manufacturer (Marvin) has 16-week lead time. Proposing Andersen as equal substitution. Please approve or provide alternative.',
    project_id: 'proj-1',
    project_name: 'Sunset Apartments',
    status: 'pending_review',
    priority: 'medium',
    category: 'architectural',
    cost_impact: false,
    schedule_impact: true,
    estimated_cost_impact: 0,
    estimated_days_impact: -14,
    submitted_by: 'Sarah Johnson',
    submitted_by_id: 'user-2',
    submitted_date: '2026-01-20',
    assigned_to: 'ABC Architects',
    assigned_to_id: 'vendor-1',
    due_date: '2026-01-27',
    answered_date: null,
    answered_by: null,
    response: null,
    spec_section: '08 51 13',
    drawing_reference: 'A5.1 - A5.8',
    location: 'All exterior windows',
    attachments: [
      { name: 'andersen_submittals.pdf', size: '5.2 MB' },
      { name: 'comparison_chart.xlsx', size: '128 KB' }
    ],
    responses: [],
    created_at: '2026-01-20T09:15:00Z'
  },
  {
    id: 'rfi-4',
    rfi_number: 'RFI-004',
    subject: 'Concrete mix design for elevated deck',
    description: 'Specification calls for 5000 PSI concrete but structural notes indicate 4000 PSI. Please confirm required strength.',
    project_id: 'proj-1',
    project_name: 'Sunset Apartments',
    status: 'closed',
    priority: 'high',
    category: 'structural',
    cost_impact: true,
    schedule_impact: false,
    estimated_cost_impact: 3200,
    estimated_days_impact: 0,
    submitted_by: 'Mike Williams',
    submitted_by_id: 'user-3',
    submitted_date: '2026-01-10',
    assigned_to: 'Structural Engineers Inc',
    assigned_to_id: 'vendor-3',
    due_date: '2026-01-17',
    answered_date: '2026-01-14',
    answered_by: 'David Chen',
    response: 'Use 5000 PSI as specified. Structural notes will be revised. This is for post-tensioned deck which requires higher strength.',
    spec_section: '03300',
    drawing_reference: 'S3.1',
    location: 'Level 3 elevated deck',
    attachments: [],
    responses: [
      { id: 'r-3', user: 'David Chen', date: '2026-01-14', message: 'Use 5000 PSI as specified. Structural notes will be revised. This is for post-tensioned deck which requires higher strength.', is_official: true }
    ],
    created_at: '2026-01-10T11:00:00Z'
  },
  {
    id: 'rfi-5',
    rfi_number: 'RFI-005',
    subject: 'Fire sprinkler head type in parking garage',
    description: 'Drawings show standard pendant heads but garage will have exposed structure. Request to use upright heads instead.',
    project_id: 'proj-1',
    project_name: 'Sunset Apartments',
    status: 'draft',
    priority: 'low',
    category: 'fire_protection',
    cost_impact: false,
    schedule_impact: false,
    estimated_cost_impact: 0,
    estimated_days_impact: 0,
    submitted_by: 'Current User',
    submitted_by_id: 'user-1',
    submitted_date: null,
    assigned_to: null,
    assigned_to_id: null,
    due_date: null,
    answered_date: null,
    answered_by: null,
    response: null,
    spec_section: '21 13 13',
    drawing_reference: 'FP2.1',
    location: 'Parking garage levels P1-P2',
    attachments: [],
    responses: [],
    created_at: '2026-01-25T08:00:00Z'
  }
];

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
  open: { label: 'Open', color: 'bg-blue-100 text-blue-800', icon: HelpCircle },
  pending_review: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  answered: { label: 'Answered', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  closed: { label: 'Closed', color: 'bg-purple-100 text-purple-800', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle }
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-600' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700' }
};

const CATEGORIES = [
  { value: 'architectural', label: 'Architectural' },
  { value: 'structural', label: 'Structural' },
  { value: 'mechanical', label: 'Mechanical' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'fire_protection', label: 'Fire Protection' },
  { value: 'civil', label: 'Civil' },
  { value: 'landscape', label: 'Landscape' },
  { value: 'general', label: 'General' }
];

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const getDaysUntilDue = (dueDate) => {
  if (!dueDate) return null;
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const RFITracker = ({ projectId = null }) => {
  const [rfis, setRfis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [expandedRFI, setExpandedRFI] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRFI, setEditingRFI] = useState(null);
  const [newResponse, setNewResponse] = useState('');
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'general',
    priority: 'medium',
    spec_section: '',
    drawing_reference: '',
    location: '',
    cost_impact: false,
    schedule_impact: false,
    estimated_cost_impact: 0,
    estimated_days_impact: 0,
    assigned_to: '',
    due_date: ''
  });

  useEffect(() => {
    loadRFIs();
  }, [projectId]);

  const loadRFIs = async () => {
    setLoading(true);
    try {
      if (isDemoMode()) {
        let data = [...DEMO_RFIS];
        if (projectId) {
          data = data.filter(r => r.project_id === projectId);
        }
        setRfis(data);
      } else {
        let query = supabase
          .from('rfis')
          .select('*')
          .order('created_at', { ascending: false });

        if (projectId) {
          query = query.eq('project_id', projectId);
        }

        const { data, error } = await query;
        if (error) throw error;
        setRfis(data || []);
      }
    } catch (error) {
      console.error('Error loading RFIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRFIs = useMemo(() => {
    return rfis.filter(rfi => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matches =
          rfi.rfi_number?.toLowerCase().includes(search) ||
          rfi.subject?.toLowerCase().includes(search) ||
          rfi.description?.toLowerCase().includes(search) ||
          rfi.submitted_by?.toLowerCase().includes(search);
        if (!matches) return false;
      }

      if (selectedStatus !== 'all' && rfi.status !== selectedStatus) return false;
      if (selectedCategory !== 'all' && rfi.category !== selectedCategory) return false;
      if (selectedPriority !== 'all' && rfi.priority !== selectedPriority) return false;

      return true;
    });
  }, [rfis, searchTerm, selectedStatus, selectedCategory, selectedPriority]);

  const stats = useMemo(() => {
    const open = rfis.filter(r => ['open', 'pending_review'].includes(r.status)).length;
    const overdue = rfis.filter(r => {
      if (!['open', 'pending_review'].includes(r.status)) return false;
      const days = getDaysUntilDue(r.due_date);
      return days !== null && days < 0;
    }).length;
    const answered = rfis.filter(r => r.status === 'answered').length;
    const avgResponseDays = rfis
      .filter(r => r.answered_date && r.submitted_date)
      .reduce((sum, r) => {
        const submitted = new Date(r.submitted_date);
        const answered = new Date(r.answered_date);
        return sum + Math.ceil((answered - submitted) / (1000 * 60 * 60 * 24));
      }, 0) / (rfis.filter(r => r.answered_date).length || 1);

    return { open, overdue, answered, avgResponseDays: Math.round(avgResponseDays) };
  }, [rfis]);

  const handleSaveRFI = () => {
    if (!formData.subject) return;

    const rfiNumber = `RFI-${String(rfis.length + 1).padStart(3, '0')}`;
    const newRFI = {
      id: `rfi-${Date.now()}`,
      rfi_number: rfiNumber,
      ...formData,
      project_id: projectId,
      status: 'draft',
      submitted_by: 'Current User',
      submitted_by_id: 'user-1',
      submitted_date: null,
      responses: [],
      attachments: [],
      created_at: new Date().toISOString()
    };

    if (editingRFI) {
      setRfis(prev => prev.map(r => r.id === editingRFI.id ? { ...r, ...formData } : r));
    } else {
      setRfis(prev => [newRFI, ...prev]);
    }

    setShowModal(false);
    setEditingRFI(null);
    resetForm();
  };

  const handleSubmitRFI = (rfiId) => {
    setRfis(prev => prev.map(r =>
      r.id === rfiId ? {
        ...r,
        status: 'open',
        submitted_date: new Date().toISOString().split('T')[0]
      } : r
    ));
  };

  const handleAddResponse = (rfiId) => {
    if (!newResponse.trim()) return;

    setRfis(prev => prev.map(r => {
      if (r.id !== rfiId) return r;
      return {
        ...r,
        responses: [
          ...r.responses,
          {
            id: `resp-${Date.now()}`,
            user: 'Current User',
            date: new Date().toISOString().split('T')[0],
            message: newResponse,
            is_official: false
          }
        ]
      };
    }));
    setNewResponse('');
  };

  const resetForm = () => {
    setFormData({
      subject: '',
      description: '',
      category: 'general',
      priority: 'medium',
      spec_section: '',
      drawing_reference: '',
      location: '',
      cost_impact: false,
      schedule_impact: false,
      estimated_cost_impact: 0,
      estimated_days_impact: 0,
      assigned_to: '',
      due_date: ''
    });
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
            <div className="p-2 bg-amber-100 rounded-lg">
              <HelpCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">RFI Tracker</h2>
              <p className="text-sm text-gray-500">Request for Information management</p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingRFI(null);
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New RFI
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-600">Open RFIs</div>
            <div className="text-2xl font-bold text-blue-700">{stats.open}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-sm text-red-600">Overdue</div>
            <div className="text-2xl font-bold text-red-700">{stats.overdue}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-green-600">Answered</div>
            <div className="text-2xl font-bold text-green-700">{stats.answered}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm text-purple-600">Avg Response</div>
            <div className="text-2xl font-bold text-purple-700">{stats.avgResponseDays} days</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search RFIs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Priorities</option>
            {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* RFI List */}
      <div className="p-4">
        {filteredRFIs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No RFIs found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRFIs.map((rfi) => {
              const status = STATUS_CONFIG[rfi.status];
              const priority = PRIORITY_CONFIG[rfi.priority];
              const StatusIcon = status?.icon || HelpCircle;
              const isExpanded = expandedRFI === rfi.id;
              const daysUntilDue = getDaysUntilDue(rfi.due_date);
              const isOverdue = daysUntilDue !== null && daysUntilDue < 0 && !['answered', 'closed'].includes(rfi.status);

              return (
                <div
                  key={rfi.id}
                  className={`border rounded-lg transition-all ${
                    isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedRFI(isExpanded ? null : rfi.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${status?.color.split(' ')[0]}`}>
                        <StatusIcon className={`w-5 h-5 ${status?.color.split(' ')[1]}`} />
                      </div>

                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm text-gray-500">{rfi.rfi_number}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status?.color}`}>
                            {status?.label}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priority?.color}`}>
                            {priority?.label}
                          </span>
                          {rfi.cost_impact && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              $ Impact
                            </span>
                          )}
                          {rfi.schedule_impact && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              Schedule Impact
                            </span>
                          )}
                        </div>

                        <h3 className="font-medium text-gray-900 mt-1">{rfi.subject}</h3>

                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {rfi.submitted_by}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(rfi.submitted_date || rfi.created_at)}
                          </span>
                          {rfi.assigned_to && (
                            <span className="flex items-center gap-1">
                              <ArrowRight className="w-3 h-3" />
                              {rfi.assigned_to}
                            </span>
                          )}
                          {rfi.due_date && (
                            <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                              <Clock className="w-3 h-3" />
                              Due: {formatDate(rfi.due_date)}
                              {isOverdue && ' (OVERDUE)'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex-shrink-0 text-gray-400">
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100 mt-2 pt-4">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{rfi.description}</p>

                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <span className="text-xs text-gray-500">Spec Section</span>
                              <p className="text-sm font-medium">{rfi.spec_section || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Drawing Reference</span>
                              <p className="text-sm font-medium">{rfi.drawing_reference || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Location</span>
                              <p className="text-sm font-medium">{rfi.location || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Category</span>
                              <p className="text-sm font-medium capitalize">{rfi.category?.replace('_', ' ')}</p>
                            </div>
                          </div>

                          {(rfi.cost_impact || rfi.schedule_impact) && (
                            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                              <h5 className="text-sm font-medium text-yellow-800 mb-2">Impact Assessment</h5>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                {rfi.cost_impact && (
                                  <div>
                                    <span className="text-yellow-600">Cost Impact: </span>
                                    <span className="font-medium">${rfi.estimated_cost_impact?.toLocaleString()}</span>
                                  </div>
                                )}
                                {rfi.schedule_impact && (
                                  <div>
                                    <span className="text-yellow-600">Schedule Impact: </span>
                                    <span className="font-medium">{rfi.estimated_days_impact} days</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          {/* Official Response */}
                          {rfi.response && (
                            <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                              <h4 className="text-sm font-medium text-green-800 mb-1">Official Response</h4>
                              <p className="text-sm text-green-700">{rfi.response}</p>
                              <p className="text-xs text-green-600 mt-2">
                                — {rfi.answered_by}, {formatDate(rfi.answered_date)}
                              </p>
                            </div>
                          )}

                          {/* Responses Thread */}
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Discussion</h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {rfi.responses?.length === 0 ? (
                              <p className="text-sm text-gray-400 italic">No comments yet</p>
                            ) : (
                              rfi.responses.map((resp) => (
                                <div
                                  key={resp.id}
                                  className={`p-2 rounded-lg text-sm ${
                                    resp.is_official ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                                  }`}
                                >
                                  <p className="text-gray-700">{resp.message}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    — {resp.user}, {resp.date}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Add Response */}
                          {!['closed', 'draft'].includes(rfi.status) && (
                            <div className="mt-3">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={newResponse}
                                  onChange={(e) => setNewResponse(e.target.value)}
                                  placeholder="Add a comment..."
                                  className="flex-grow px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                />
                                <button
                                  onClick={() => handleAddResponse(rfi.id)}
                                  className="px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Attachments */}
                          {rfi.attachments?.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments</h4>
                              <div className="space-y-1">
                                {rfi.attachments.map((att, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-sm text-blue-600 hover:underline cursor-pointer">
                                    <Paperclip className="w-3 h-3" />
                                    {att.name} ({att.size})
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                        {rfi.status === 'draft' && (
                          <button
                            onClick={() => handleSubmitRFI(rfi.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                          >
                            Submit RFI
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingRFI(rfi);
                            setFormData({
                              subject: rfi.subject,
                              description: rfi.description,
                              category: rfi.category,
                              priority: rfi.priority,
                              spec_section: rfi.spec_section || '',
                              drawing_reference: rfi.drawing_reference || '',
                              location: rfi.location || '',
                              cost_impact: rfi.cost_impact,
                              schedule_impact: rfi.schedule_impact,
                              estimated_cost_impact: rfi.estimated_cost_impact || 0,
                              estimated_days_impact: rfi.estimated_days_impact || 0,
                              assigned_to: rfi.assigned_to || '',
                              due_date: rfi.due_date || ''
                            });
                            setShowModal(true);
                          }}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                        >
                          Edit
                        </button>
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                          <Download className="w-4 h-4 inline mr-1" />
                          Export PDF
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {editingRFI ? 'Edit RFI' : 'New RFI'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  >
                    {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Spec Section</label>
                  <input
                    type="text"
                    value={formData.spec_section}
                    onChange={(e) => setFormData(prev => ({ ...prev, spec_section: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Drawing Reference</label>
                  <input
                    type="text"
                    value={formData.drawing_reference}
                    onChange={(e) => setFormData(prev => ({ ...prev, drawing_reference: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                  <input
                    type="text"
                    value={formData.assigned_to}
                    onChange={(e) => setFormData(prev => ({ ...prev, assigned_to: e.target.value }))}
                    placeholder="Architect, Engineer, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.cost_impact}
                    onChange={(e) => setFormData(prev => ({ ...prev, cost_impact: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-amber-600"
                  />
                  <span className="text-sm text-gray-700">Has cost impact</span>
                </label>
                {formData.cost_impact && (
                  <input
                    type="number"
                    value={formData.estimated_cost_impact}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimated_cost_impact: parseFloat(e.target.value) }))}
                    placeholder="Estimated cost impact ($)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                )}

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.schedule_impact}
                    onChange={(e) => setFormData(prev => ({ ...prev, schedule_impact: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-amber-600"
                  />
                  <span className="text-sm text-gray-700">Has schedule impact</span>
                </label>
                {formData.schedule_impact && (
                  <input
                    type="number"
                    value={formData.estimated_days_impact}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimated_days_impact: parseInt(e.target.value) }))}
                    placeholder="Estimated days impact"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                )}
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
                onClick={handleSaveRFI}
                disabled={!formData.subject}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
              >
                {editingRFI ? 'Save Changes' : 'Create RFI'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RFITracker;
