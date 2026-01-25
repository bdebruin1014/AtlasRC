import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';
import {
  Flag,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Plus,
  Filter,
  Search,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Edit2,
  Trash2,
  Users,
  Building2,
  Target,
  TrendingUp,
  Award,
  Zap,
  ArrowRight,
  X,
  Check,
  AlertCircle,
  MapPin
} from 'lucide-react';

// Demo milestones data
const demoMilestones = [
  {
    id: 1,
    name: 'Foundation Complete',
    description: 'Complete foundation work including footings, slab, and waterproofing',
    projectId: 1,
    projectName: 'Riverside Tower',
    status: 'completed',
    priority: 'high',
    dueDate: '2024-01-10',
    completedDate: '2024-01-08',
    progress: 100,
    assignees: ['John Smith', 'Mike Chen'],
    dependencies: [],
    budget: 450000,
    actualCost: 438000,
    tasks: { total: 12, completed: 12 },
    category: 'Construction'
  },
  {
    id: 2,
    name: 'Structural Steel Erection',
    description: 'Install structural steel framework for floors 1-10',
    projectId: 1,
    projectName: 'Riverside Tower',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2024-02-15',
    completedDate: null,
    progress: 65,
    assignees: ['David Brown', 'Sarah Johnson'],
    dependencies: [1],
    budget: 820000,
    actualCost: 534000,
    tasks: { total: 18, completed: 12 },
    category: 'Construction'
  },
  {
    id: 3,
    name: 'Permit Approval - Phase 2',
    description: 'Obtain all necessary permits for Phase 2 construction',
    projectId: 1,
    projectName: 'Riverside Tower',
    status: 'at_risk',
    priority: 'critical',
    dueDate: '2024-01-25',
    completedDate: null,
    progress: 40,
    assignees: ['Lisa Wang'],
    dependencies: [],
    budget: 25000,
    actualCost: 18000,
    tasks: { total: 8, completed: 3 },
    category: 'Permits'
  },
  {
    id: 4,
    name: 'Site Acquisition Finalized',
    description: 'Complete purchase agreement and transfer of property deed',
    projectId: 2,
    projectName: 'Harbor View Complex',
    status: 'completed',
    priority: 'high',
    dueDate: '2024-01-05',
    completedDate: '2024-01-03',
    progress: 100,
    assignees: ['Sarah Johnson', 'Lisa Wang'],
    dependencies: [],
    budget: 2500000,
    actualCost: 2450000,
    tasks: { total: 6, completed: 6 },
    category: 'Acquisition'
  },
  {
    id: 5,
    name: 'Environmental Assessment',
    description: 'Complete Phase 1 environmental site assessment',
    projectId: 2,
    projectName: 'Harbor View Complex',
    status: 'in_progress',
    priority: 'medium',
    dueDate: '2024-02-01',
    completedDate: null,
    progress: 80,
    assignees: ['Mike Chen'],
    dependencies: [4],
    budget: 45000,
    actualCost: 38000,
    tasks: { total: 5, completed: 4 },
    category: 'Due Diligence'
  },
  {
    id: 6,
    name: 'Financing Secured',
    description: 'Finalize construction loan and equity commitments',
    projectId: 2,
    projectName: 'Harbor View Complex',
    status: 'pending',
    priority: 'critical',
    dueDate: '2024-02-28',
    completedDate: null,
    progress: 25,
    assignees: ['Sarah Johnson', 'John Smith'],
    dependencies: [4, 5],
    budget: 50000,
    actualCost: 12000,
    tasks: { total: 10, completed: 2 },
    category: 'Finance'
  },
  {
    id: 7,
    name: 'Design Development Complete',
    description: 'Finalize architectural and MEP design documents',
    projectId: 3,
    projectName: 'Metro Business Park',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2024-01-30',
    completedDate: null,
    progress: 55,
    assignees: ['David Brown'],
    dependencies: [],
    budget: 180000,
    actualCost: 95000,
    tasks: { total: 15, completed: 8 },
    category: 'Design'
  },
  {
    id: 8,
    name: 'Zoning Variance Approval',
    description: 'Obtain approval for height variance from planning commission',
    projectId: 3,
    projectName: 'Metro Business Park',
    status: 'at_risk',
    priority: 'critical',
    dueDate: '2024-01-20',
    completedDate: null,
    progress: 60,
    assignees: ['Lisa Wang', 'John Smith'],
    dependencies: [],
    budget: 35000,
    actualCost: 28000,
    tasks: { total: 4, completed: 2 },
    category: 'Permits'
  },
  {
    id: 9,
    name: 'Pre-Leasing Target - 30%',
    description: 'Achieve 30% pre-leasing commitment for commercial spaces',
    projectId: 3,
    projectName: 'Metro Business Park',
    status: 'in_progress',
    priority: 'medium',
    dueDate: '2024-03-15',
    completedDate: null,
    progress: 45,
    assignees: ['Mike Chen', 'Sarah Johnson'],
    dependencies: [7],
    budget: 75000,
    actualCost: 32000,
    tasks: { total: 8, completed: 4 },
    category: 'Marketing'
  },
  {
    id: 10,
    name: 'Investor Presentation',
    description: 'Complete and deliver Q1 investor presentation and reports',
    projectId: null,
    projectName: 'Company-wide',
    status: 'pending',
    priority: 'high',
    dueDate: '2024-02-05',
    completedDate: null,
    progress: 15,
    assignees: ['Sarah Johnson'],
    dependencies: [],
    budget: 10000,
    actualCost: 2000,
    tasks: { total: 6, completed: 1 },
    category: 'Reporting'
  }
];

const demoProjects = [
  { id: 1, name: 'Riverside Tower' },
  { id: 2, name: 'Harbor View Complex' },
  { id: 3, name: 'Metro Business Park' }
];

const statusConfig = {
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: Clock },
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-700', icon: Circle },
  at_risk: { label: 'At Risk', color: 'bg-red-100 text-red-700', icon: AlertTriangle }
};

const priorityConfig = {
  critical: { label: 'Critical', color: 'bg-red-500' },
  high: { label: 'High', color: 'bg-orange-500' },
  medium: { label: 'Medium', color: 'bg-yellow-500' },
  low: { label: 'Low', color: 'bg-green-500' }
};

const categoryColors = {
  Construction: '#3B82F6',
  Permits: '#EF4444',
  Acquisition: '#10B981',
  'Due Diligence': '#8B5CF6',
  Finance: '#F59E0B',
  Design: '#06B6D4',
  Marketing: '#EC4899',
  Reporting: '#6B7280'
};

export default function MilestoneTracker() {
  const [milestones, setMilestones] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // list, timeline, kanban
  const [expandedProjects, setExpandedProjects] = useState(new Set(['Riverside Tower', 'Harbor View Complex', 'Metro Business Park']));
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    fetchMilestones();
    fetchProjects();
  }, []);

  const fetchMilestones = async () => {
    if (isDemoMode()) {
      setMilestones(demoMilestones);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      setMilestones(data || []);
    } catch (error) {
      console.error('Error fetching milestones:', error);
      setMilestones(demoMilestones);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    if (isDemoMode()) {
      setProjects(demoProjects);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects(demoProjects);
    }
  };

  const toggleProject = (projectName) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectName)) {
      newExpanded.delete(projectName);
    } else {
      newExpanded.add(projectName);
    }
    setExpandedProjects(newExpanded);
  };

  const filteredMilestones = useMemo(() => {
    return milestones.filter(m => {
      if (searchTerm && !m.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !m.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (projectFilter !== 'all' && m.projectId?.toString() !== projectFilter) return false;
      if (priorityFilter !== 'all' && m.priority !== priorityFilter) return false;
      if (categoryFilter !== 'all' && m.category !== categoryFilter) return false;
      return true;
    });
  }, [milestones, searchTerm, statusFilter, projectFilter, priorityFilter, categoryFilter]);

  const groupedByProject = useMemo(() => {
    const grouped = {};
    filteredMilestones.forEach(m => {
      const key = m.projectName || 'Company-wide';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(m);
    });
    return grouped;
  }, [filteredMilestones]);

  const stats = useMemo(() => {
    const total = milestones.length;
    const completed = milestones.filter(m => m.status === 'completed').length;
    const atRisk = milestones.filter(m => m.status === 'at_risk').length;
    const upcoming = milestones.filter(m => {
      const dueDate = new Date(m.dueDate);
      const now = new Date();
      const diff = (dueDate - now) / (1000 * 60 * 60 * 24);
      return diff <= 14 && diff > 0 && m.status !== 'completed';
    }).length;

    return { total, completed, atRisk, upcoming };
  }, [milestones]);

  const categories = [...new Set(milestones.map(m => m.category))];

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (dueDate) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const MilestoneCard = ({ milestone }) => {
    const StatusIcon = statusConfig[milestone.status].icon;
    const daysRemaining = getDaysRemaining(milestone.dueDate);
    const isOverdue = daysRemaining < 0 && milestone.status !== 'completed';

    return (
      <div
        className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer ${
          selectedMilestone?.id === milestone.id ? 'ring-2 ring-blue-500' : ''
        }`}
        onClick={() => setSelectedMilestone(milestone)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${statusConfig[milestone.status].color}`}>
              <StatusIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">{milestone.name}</h3>
                <div className={`w-2 h-2 rounded-full ${priorityConfig[milestone.priority].color}`} />
              </div>
              <p className="text-sm text-gray-500 line-clamp-1">{milestone.description}</p>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(activeDropdown === milestone.id ? null : milestone.id);
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            {activeDropdown === milestone.id && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border z-10">
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500">Progress</span>
            <span className="font-medium">{milestone.progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                milestone.status === 'completed' ? 'bg-green-500' :
                milestone.status === 'at_risk' ? 'bg-red-500' :
                'bg-blue-500'
              }`}
              style={{ width: `${milestone.progress}%` }}
            />
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span
              className="px-2 py-1 rounded"
              style={{
                backgroundColor: `${categoryColors[milestone.category]}20`,
                color: categoryColors[milestone.category]
              }}
            >
              {milestone.category}
            </span>
            <span className="text-gray-500 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {milestone.tasks.completed}/{milestone.tasks.total}
            </span>
          </div>
          <div className={`flex items-center gap-1 ${
            isOverdue ? 'text-red-600' :
            daysRemaining <= 7 ? 'text-orange-600' :
            'text-gray-500'
          }`}>
            <Calendar className="w-3 h-3" />
            {milestone.status === 'completed' ? (
              <span>Completed {formatDate(milestone.completedDate)}</span>
            ) : isOverdue ? (
              <span>{Math.abs(daysRemaining)}d overdue</span>
            ) : (
              <span>{daysRemaining}d left</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Milestone Tracker</h1>
          <p className="text-gray-600">Track and manage project milestones</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Milestone
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Flag className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Milestones</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.atRisk}</div>
              <div className="text-sm text-gray-500">At Risk</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{stats.upcoming}</div>
              <div className="text-sm text-gray-500">Due in 14 Days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search milestones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="at_risk">At Risk</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Milestone List */}
        <div className="col-span-2 space-y-4">
          {Object.entries(groupedByProject).map(([projectName, projectMilestones]) => (
            <div key={projectName} className="bg-white rounded-lg border overflow-hidden">
              <button
                onClick={() => toggleProject(projectName)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {expandedProjects.has(projectName) ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">{projectName}</span>
                  <span className="text-sm text-gray-500">({projectMilestones.length} milestones)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-green-600">
                    {projectMilestones.filter(m => m.status === 'completed').length} completed
                  </span>
                  {projectMilestones.some(m => m.status === 'at_risk') && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                      {projectMilestones.filter(m => m.status === 'at_risk').length} at risk
                    </span>
                  )}
                </div>
              </button>
              {expandedProjects.has(projectName) && (
                <div className="px-4 pb-4 space-y-3">
                  {projectMilestones.map(milestone => (
                    <MilestoneCard key={milestone.id} milestone={milestone} />
                  ))}
                </div>
              )}
            </div>
          ))}

          {filteredMilestones.length === 0 && (
            <div className="bg-white rounded-lg border p-8 text-center">
              <Flag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No milestones found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' || projectFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first milestone to get started'}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Milestone
              </button>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Upcoming Deadlines</h3>
            <div className="space-y-3">
              {milestones
                .filter(m => m.status !== 'completed')
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                .slice(0, 5)
                .map(milestone => {
                  const daysRemaining = getDaysRemaining(milestone.dueDate);
                  const isOverdue = daysRemaining < 0;
                  return (
                    <div
                      key={milestone.id}
                      className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg -mx-2"
                      onClick={() => setSelectedMilestone(milestone)}
                    >
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        isOverdue ? 'bg-red-500' :
                        daysRemaining <= 7 ? 'bg-orange-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {milestone.name}
                        </div>
                        <div className="text-xs text-gray-500">{milestone.projectName}</div>
                      </div>
                      <div className={`text-xs whitespace-nowrap ${
                        isOverdue ? 'text-red-600' :
                        daysRemaining <= 7 ? 'text-orange-600' :
                        'text-gray-500'
                      }`}>
                        {isOverdue ? `${Math.abs(daysRemaining)}d overdue` : `${daysRemaining}d`}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold text-gray-900 mb-4">By Category</h3>
            <div className="space-y-2">
              {categories.map(category => {
                const count = milestones.filter(m => m.category === category).length;
                const completed = milestones.filter(m => m.category === category && m.status === 'completed').length;
                const percentage = Math.round((completed / count) * 100);
                return (
                  <div key={category} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: categoryColors[category] }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{category}</span>
                        <span className="text-gray-500">{completed}/{count}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full mt-1">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: categoryColors[category]
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Completions */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Recently Completed</h3>
            <div className="space-y-3">
              {milestones
                .filter(m => m.status === 'completed')
                .sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate))
                .slice(0, 3)
                .map(milestone => (
                  <div key={milestone.id} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{milestone.name}</div>
                      <div className="text-xs text-gray-500">
                        {milestone.projectName} • {formatDate(milestone.completedDate)}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Detail Panel */}
      {selectedMilestone && (
        <div className="fixed inset-y-0 right-0 w-[480px] bg-white shadow-xl border-l z-50 overflow-auto">
          <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
            <h2 className="font-semibold text-gray-900">Milestone Details</h2>
            <button
              onClick={() => setSelectedMilestone(null)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="p-4 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded text-xs ${statusConfig[selectedMilestone.status].color}`}>
                  {statusConfig[selectedMilestone.status].label}
                </span>
                <span
                  className="px-2 py-1 rounded text-xs"
                  style={{
                    backgroundColor: `${categoryColors[selectedMilestone.category]}20`,
                    color: categoryColors[selectedMilestone.category]
                  }}
                >
                  {selectedMilestone.category}
                </span>
                <div className={`w-2 h-2 rounded-full ${priorityConfig[selectedMilestone.priority].color}`} />
                <span className="text-xs text-gray-500 capitalize">{selectedMilestone.priority}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{selectedMilestone.name}</h3>
              <p className="text-gray-600 mt-1">{selectedMilestone.description}</p>
            </div>

            {/* Progress */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500">Overall Progress</span>
                <span className="font-medium">{selectedMilestone.progress}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    selectedMilestone.status === 'completed' ? 'bg-green-500' :
                    selectedMilestone.status === 'at_risk' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`}
                  style={{ width: `${selectedMilestone.progress}%` }}
                />
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Project</div>
                <div className="font-medium text-gray-900">{selectedMilestone.projectName}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Due Date</div>
                <div className="font-medium text-gray-900">{formatDate(selectedMilestone.dueDate)}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Budget</div>
                <div className="font-medium text-gray-900">{formatCurrency(selectedMilestone.budget)}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Actual Cost</div>
                <div className={`font-medium ${
                  selectedMilestone.actualCost > selectedMilestone.budget ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {formatCurrency(selectedMilestone.actualCost)}
                </div>
              </div>
            </div>

            {/* Tasks */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Tasks</h4>
                <span className="text-sm text-gray-500">
                  {selectedMilestone.tasks.completed} of {selectedMilestone.tasks.total} completed
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${(selectedMilestone.tasks.completed / selectedMilestone.tasks.total) * 100}%` }}
                />
              </div>
            </div>

            {/* Assignees */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Assignees</h4>
              <div className="flex flex-wrap gap-2">
                {selectedMilestone.assignees.map((assignee, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-600 font-medium">
                      {assignee.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-sm text-gray-700">{assignee}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dependencies */}
            {selectedMilestone.dependencies.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Dependencies</h4>
                <div className="space-y-2">
                  {selectedMilestone.dependencies.map(depId => {
                    const dep = milestones.find(m => m.id === depId);
                    if (!dep) return null;
                    return (
                      <div key={depId} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        {dep.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-700">{dep.name}</span>
                        <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Edit Milestone
              </button>
              {selectedMilestone.status !== 'completed' && (
                <button className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50">
                  Mark Complete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </div>
  );
}
