import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';
import {
  GitBranch,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  Users,
  ArrowRight,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  RefreshCw,
  MessageSquare,
  FileText,
  DollarSign,
  Building2,
  Settings,
  ChevronDown,
  ChevronUp,
  Send,
  X
} from 'lucide-react';

// Demo data for workflows
const demoWorkflows = [
  {
    id: '1',
    name: 'Expense Approval',
    description: 'Multi-tier expense approval based on amount',
    type: 'expense',
    status: 'active',
    steps: [
      { id: 's1', name: 'Manager Review', approvers: ['Direct Manager'], threshold: 0, required: true },
      { id: 's2', name: 'Finance Review', approvers: ['Finance Team'], threshold: 1000, required: true },
      { id: 's3', name: 'Executive Approval', approvers: ['CFO', 'CEO'], threshold: 10000, required: true }
    ],
    created_at: '2025-08-15T10:00:00Z',
    requests_count: 45,
    avg_completion_time: '2.3 days'
  },
  {
    id: '2',
    name: 'Vendor Onboarding',
    description: 'New vendor approval and verification workflow',
    type: 'vendor',
    status: 'active',
    steps: [
      { id: 's1', name: 'Operations Review', approvers: ['Operations Manager'], required: true },
      { id: 's2', name: 'Legal Review', approvers: ['Legal Team'], required: true },
      { id: 's3', name: 'Finance Setup', approvers: ['Finance Team'], required: true }
    ],
    created_at: '2025-09-01T08:00:00Z',
    requests_count: 23,
    avg_completion_time: '5.1 days'
  },
  {
    id: '3',
    name: 'Contract Approval',
    description: 'Contract review and signing workflow',
    type: 'contract',
    status: 'active',
    steps: [
      { id: 's1', name: 'Department Review', approvers: ['Department Head'], required: true },
      { id: 's2', name: 'Legal Review', approvers: ['Legal Team'], required: true },
      { id: 's3', name: 'Executive Sign-off', approvers: ['VP', 'CEO'], required: true }
    ],
    created_at: '2025-07-20T14:00:00Z',
    requests_count: 67,
    avg_completion_time: '3.5 days'
  },
  {
    id: '4',
    name: 'Property Acquisition',
    description: 'Property purchase approval workflow',
    type: 'acquisition',
    status: 'active',
    steps: [
      { id: 's1', name: 'Initial Screening', approvers: ['Acquisitions Team'], required: true },
      { id: 's2', name: 'Financial Analysis', approvers: ['Finance Director'], required: true },
      { id: 's3', name: 'Due Diligence', approvers: ['Legal Team', 'Operations'], required: true },
      { id: 's4', name: 'Investment Committee', approvers: ['Investment Committee'], required: true },
      { id: 's5', name: 'Board Approval', approvers: ['Board of Directors'], threshold: 5000000, required: false }
    ],
    created_at: '2025-06-10T09:00:00Z',
    requests_count: 12,
    avg_completion_time: '14.2 days'
  }
];

// Demo pending requests
const demoRequests = [
  {
    id: 'r1',
    workflow_id: '1',
    workflow_name: 'Expense Approval',
    title: 'Marketing Campaign Budget',
    description: 'Q1 digital marketing campaign expenses',
    amount: 15000,
    submitted_by: 'Sarah Johnson',
    submitted_at: '2026-01-23T10:00:00Z',
    status: 'pending',
    current_step: 2,
    total_steps: 3,
    current_approvers: ['Finance Team'],
    history: [
      { step: 'Manager Review', status: 'approved', by: 'Mike Chen', at: '2026-01-23T14:00:00Z', comment: 'Approved for Q1 campaign' }
    ]
  },
  {
    id: 'r2',
    workflow_id: '2',
    workflow_name: 'Vendor Onboarding',
    title: 'ABC Landscaping Services',
    description: 'New landscaping vendor for property maintenance',
    submitted_by: 'Tom Wilson',
    submitted_at: '2026-01-22T09:00:00Z',
    status: 'pending',
    current_step: 1,
    total_steps: 3,
    current_approvers: ['Operations Manager'],
    history: []
  },
  {
    id: 'r3',
    workflow_id: '3',
    workflow_name: 'Contract Approval',
    title: 'Property Management Agreement - Sunset Towers',
    description: 'Annual management contract renewal',
    amount: 120000,
    submitted_by: 'Lisa Park',
    submitted_at: '2026-01-21T16:00:00Z',
    status: 'pending',
    current_step: 2,
    total_steps: 3,
    current_approvers: ['Legal Team'],
    history: [
      { step: 'Department Review', status: 'approved', by: 'John Smith', at: '2026-01-22T10:00:00Z', comment: 'Terms look good' }
    ]
  },
  {
    id: 'r4',
    workflow_id: '1',
    workflow_name: 'Expense Approval',
    title: 'Office Equipment Purchase',
    description: 'New computers for development team',
    amount: 8500,
    submitted_by: 'David Lee',
    submitted_at: '2026-01-24T08:00:00Z',
    status: 'pending',
    current_step: 1,
    total_steps: 3,
    current_approvers: ['Direct Manager'],
    history: []
  },
  {
    id: 'r5',
    workflow_id: '4',
    workflow_name: 'Property Acquisition',
    title: 'Industrial Complex - North District',
    description: '50,000 sqft warehouse acquisition',
    amount: 3500000,
    submitted_by: 'Emily Brown',
    submitted_at: '2026-01-15T11:00:00Z',
    status: 'pending',
    current_step: 3,
    total_steps: 4,
    current_approvers: ['Legal Team', 'Operations'],
    history: [
      { step: 'Initial Screening', status: 'approved', by: 'Acquisitions Team', at: '2026-01-16T09:00:00Z', comment: 'Good location and price' },
      { step: 'Financial Analysis', status: 'approved', by: 'Finance Director', at: '2026-01-18T14:00:00Z', comment: 'ROI projections acceptable' }
    ]
  }
];

const workflowTypes = [
  { id: 'all', name: 'All Types', icon: GitBranch },
  { id: 'expense', name: 'Expense', icon: DollarSign },
  { id: 'vendor', name: 'Vendor', icon: Users },
  { id: 'contract', name: 'Contract', icon: FileText },
  { id: 'acquisition', name: 'Acquisition', icon: Building2 }
];

export default function ApprovalWorkflow() {
  const [workflows, setWorkflows] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'workflows'
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('approve');
  const [actionComment, setActionComment] = useState('');
  const [expandedWorkflow, setExpandedWorkflow] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isDemoMode()) {
        setWorkflows(demoWorkflows);
        setRequests(demoRequests);
      } else {
        const [workflowsRes, requestsRes] = await Promise.all([
          supabase.from('approval_workflows').select('*').order('created_at', { ascending: false }),
          supabase.from('approval_requests').select('*').eq('status', 'pending').order('submitted_at', { ascending: false })
        ]);

        setWorkflows(workflowsRes.data || []);
        setRequests(requestsRes.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setWorkflows(demoWorkflows);
      setRequests(demoRequests);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.submitted_by.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' ||
        workflows.find(w => w.id === request.workflow_id)?.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [requests, searchTerm, typeFilter, statusFilter, workflows]);

  const filteredWorkflows = useMemo(() => {
    return workflows.filter(workflow => {
      const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || workflow.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [workflows, searchTerm, typeFilter]);

  const handleAction = (request, type) => {
    setSelectedRequest(request);
    setActionType(type);
    setActionComment('');
    setShowActionModal(true);
  };

  const submitAction = () => {
    if (!selectedRequest) return;

    if (isDemoMode()) {
      if (actionType === 'approve') {
        // Move to next step or complete
        const updatedRequests = requests.map(r => {
          if (r.id === selectedRequest.id) {
            const newHistory = [...r.history, {
              step: `Step ${r.current_step}`,
              status: 'approved',
              by: 'Current User',
              at: new Date().toISOString(),
              comment: actionComment
            }];

            if (r.current_step >= r.total_steps) {
              return { ...r, status: 'completed', history: newHistory };
            }
            return {
              ...r,
              current_step: r.current_step + 1,
              history: newHistory
            };
          }
          return r;
        });
        setRequests(updatedRequests.filter(r => r.status === 'pending'));
      } else {
        // Reject
        setRequests(requests.filter(r => r.id !== selectedRequest.id));
      }
    }

    setShowActionModal(false);
    setSelectedRequest(null);
    setActionComment('');
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'rejected':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    activeWorkflows: workflows.filter(w => w.status === 'active').length,
    avgTime: workflows.length > 0 ? '4.2 days' : '-',
    totalProcessed: workflows.reduce((sum, w) => sum + w.requests_count, 0)
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <GitBranch className="h-7 w-7 text-blue-600" />
          Approval Workflows
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage approval processes and pending requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending Requests</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Play className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeWorkflows}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Workflows</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <RefreshCw className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgTime}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Completion</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalProcessed}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Processed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'requests'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Pending Requests ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('workflows')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'workflows'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Workflows ({workflows.length})
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={activeTab === 'requests' ? 'Search requests...' : 'Search workflows...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          {workflowTypes.map(type => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select>
        {activeTab === 'requests' && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        )}
        {activeTab === 'workflows' && (
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            New Workflow
          </button>
        )}
      </div>

      {/* Content */}
      {activeTab === 'requests' ? (
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">All caught up!</h3>
              <p className="text-gray-600 dark:text-gray-400">No pending approval requests</p>
            </div>
          ) : (
            filteredRequests.map(request => (
              <div
                key={request.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {request.workflow_name}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{request.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{request.description}</p>
                  </div>
                  {request.amount && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(request.amount)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Step {request.current_step} of {request.total_steps}</span>
                    <span>Current: {request.current_approvers.join(', ')}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${((request.current_step - 1) / request.total_steps) * 100}%` }}
                    />
                  </div>
                </div>

                {/* History */}
                {request.history.length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Approval History</h4>
                    <div className="space-y-2">
                      {request.history.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          {item.status === 'approved' ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500" />
                          )}
                          <span className="font-medium">{item.step}</span>
                          <span className="text-gray-500">by {item.by}</span>
                          {item.comment && (
                            <span className="text-gray-400">- "{item.comment}"</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meta & Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {request.submitted_by}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(request.submitted_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAction(request, 'reject')}
                      className="flex items-center gap-1 px-3 py-1.5 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction(request, 'approve')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredWorkflows.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No workflows found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first approval workflow</p>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Create Workflow
              </button>
            </div>
          ) : (
            filteredWorkflows.map(workflow => (
              <div
                key={workflow.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedWorkflow(expandedWorkflow === workflow.id ? null : workflow.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        workflow.status === 'active' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        {workflowTypes.find(t => t.id === workflow.type)?.icon &&
                          React.createElement(workflowTypes.find(t => t.id === workflow.type).icon, {
                            className: `h-5 w-5 ${workflow.status === 'active' ? 'text-green-600' : 'text-gray-500'}`
                          })
                        }
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{workflow.name}</h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            workflow.status === 'active'
                              ? 'text-green-600 bg-green-100 dark:bg-green-900/30'
                              : 'text-gray-600 bg-gray-100 dark:bg-gray-700'
                          }`}>
                            {workflow.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{workflow.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{workflow.steps.length} steps</span>
                          <span>{workflow.requests_count} requests processed</span>
                          <span>Avg. {workflow.avg_completion_time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <Edit className="h-4 w-4 text-gray-500" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <Settings className="h-4 w-4 text-gray-500" />
                      </button>
                      {expandedWorkflow === workflow.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Steps */}
                {expandedWorkflow === workflow.id && (
                  <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-4 mb-3">Workflow Steps</h4>
                    <div className="space-y-2">
                      {workflow.steps.map((step, idx) => (
                        <div key={step.id} className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-sm font-medium">
                            {idx + 1}
                          </div>
                          <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium text-gray-900 dark:text-white">{step.name}</span>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  Approvers: {step.approvers.join(', ')}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {step.threshold > 0 && (
                                  <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                                    Above {formatCurrency(step.threshold)}
                                  </span>
                                )}
                                {step.required ? (
                                  <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">
                                    Required
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                                    Optional
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {idx < workflow.steps.length - 1 && (
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
              </h2>
              <button
                onClick={() => setShowActionModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white">{selectedRequest.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedRequest.description}</p>
                {selectedRequest.amount && (
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-2">
                    Amount: {formatCurrency(selectedRequest.amount)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Comment {actionType === 'reject' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  value={actionComment}
                  onChange={(e) => setActionComment(e.target.value)}
                  rows={3}
                  placeholder={actionType === 'approve' ? 'Optional comment...' : 'Please provide a reason for rejection...'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required={actionType === 'reject'}
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2 justify-end">
              <button
                onClick={() => setShowActionModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={submitAction}
                disabled={actionType === 'reject' && !actionComment}
                className={`px-4 py-2 rounded-lg text-white ${
                  actionType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {actionType === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
