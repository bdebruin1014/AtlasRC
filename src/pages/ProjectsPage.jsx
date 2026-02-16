import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus, Search, Filter, LayoutGrid, List, Building2, MapPin,
  DollarSign, Calendar, ChevronRight, MoreVertical, Eye, Edit2,
  Trash2, Copy, Archive, ChevronDown, Home, Map, Hammer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useProjects, useProjectActions, useProjectSummary, PROJECT_STATUSES, PROJECT_TYPES } from '@/hooks/useProjects';
import { projectService } from '@/services/projectService';
import ProjectModal from '@/components/ProjectModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PROJECT_TYPE_ICONS = {
  'scattered-lot': Home,
  'lot-development': Map,
  'lot-purchase-development': Hammer,
  'community-development': Building2,
};

const PROJECT_TYPE_DESCRIPTIONS = {
  'scattered-lot': 'Buy a lot, build a spec home, sell it',
  'lot-development': 'Develop raw land into finished lots',
  'lot-purchase-development': 'Buy finished lots, build homes for sale',
  'community-development': 'Full subdivision from raw land to sold homes',
};

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { projects: rawProjects, isLoading, error, refetch } = useProjects();
  const { createProject, updateProject, deleteProject, isLoading: isSaving } = useProjectActions();
  const summary = useProjectSummary(rawProjects || []);

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [preselectedType, setPreselectedType] = useState(null);
  const [projectFinancials, setProjectFinancials] = useState({});

  useEffect(() => {
    const shouldCreate = searchParams.get('create') === 'true';
    const type = searchParams.get('type');
    if (shouldCreate) {
      setEditingProject(null);
      setPreselectedType(type || null);
      setModalOpen(true);
    }
  }, [searchParams]);

  // Fetch financials for all projects
  useEffect(() => {
    async function fetchAllFinancials() {
      if (!rawProjects || rawProjects.length === 0) return;

      const financialsMap = {};
      const chunks = [];
      for (let i = 0; i < rawProjects.length; i += 5) {
        chunks.push(rawProjects.slice(i, i + 5));
      }

      for (const chunk of chunks) {
        const results = await Promise.all(
          (chunk || []).map(async (p) => {
            try {
              const financials = await projectService.getFinancials(p.id);
              return { id: p.id, financials };
            } catch {
              return { id: p.id, financials: { totalExpenses: 0, percentSpent: 0 } };
            }
          })
        );
        results.forEach(r => {
          financialsMap[r.id] = r.financials;
        });
      }

      setProjectFinancials(financialsMap);
    }

    fetchAllFinancials();
  }, [rawProjects]);

  // Transform projects to display format
  const projects = (rawProjects || []).map(p => {
    const financials = projectFinancials[p.id] || {};
    return {
      id: p.id,
      name: p.name,
      type: PROJECT_TYPES.find(t => t.key === p.project_type)?.label || p.project_type || 'Unknown',
      typeKey: p.project_type,
      status: p.status,
      location: p.address || 'No address',
      budgetSpent: financials.totalExpenses || 0,
      budgetTotal: parseFloat(p.budget) || 0,
      targetDate: p.target_completion_date ? new Date(p.target_completion_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD',
      progress: financials.percentSpent || 0,
      entity: p.entity?.name,
      units: p.units_to_develop || 1,
      raw: p,
    };
  });

  const handleCreateWithType = (typeKey) => {
    setEditingProject(null);
    setPreselectedType(typeKey);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (searchParams.get('create') === 'true') {
      searchParams.delete('create');
      searchParams.delete('type');
      setSearchParams(searchParams);
    }
    setModalOpen(false);
    setPreselectedType(null);
  };

  const handleEdit = (project) => {
    setEditingProject(project.raw);
    setPreselectedType(null);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await deleteProject(id);
      refetch();
    }
  };

  const handleSave = async (data) => {
    if (editingProject) {
      await updateProject(editingProject.id, data);
    } else {
      await createProject(data);
    }
    handleCloseModal();
    refetch();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-emerald-100 text-emerald-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'on-hold': return 'bg-amber-100 text-amber-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTypeColor = (typeKey) => {
    switch (typeKey) {
      case 'scattered-lot': return 'bg-sky-100 text-sky-700';
      case 'lot-development': return 'bg-orange-100 text-orange-700';
      case 'lot-purchase-development': return 'bg-purple-100 text-purple-700';
      case 'community-development': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatCurrency = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val}`;
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesType = typeFilter === 'all' || p.raw?.project_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">Loading projects...</div>
      </div>
    );
  }

  if (error && (!rawProjects || rawProjects.length === 0)) {
    return (
      <div className="p-6">
        <div className="text-red-500">Error: {error}</div>
        <Button onClick={refetch} className="mt-4">Retry</Button>
      </div>
    );
  }

  const ProjectCard = ({ project }) => {
    const TypeIcon = PROJECT_TYPE_ICONS[project.typeKey] || Building2;
    return (
      <div
        className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => navigate(`/project/${project.id}`)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <TypeIcon className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-semibold">{project.name}</h3>
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", getTypeColor(project.typeKey))}>
                {project.type}
              </span>
            </div>
          </div>
          <span className={cn("px-2 py-1 rounded text-xs font-medium", getStatusColor(project.status))}>
            {project.status}
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          {project.entity && (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span>{project.entity}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{project.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span>{formatCurrency(project.budgetSpent)} / {formatCurrency(project.budgetTotal)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>Target: {project.targetDate}</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-500">Budget</span>
            <span className="font-medium">{Math.round(project.progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#047857] h-2 rounded-full transition-all"
              style={{ width: `${Math.min(project.progress, 100)}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  const ProjectRow = ({ project }) => {
    const TypeIcon = PROJECT_TYPE_ICONS[project.typeKey] || Building2;
    return (
      <tr
        className="hover:bg-gray-50 cursor-pointer border-b"
        onClick={() => navigate(`/project/${project.id}`)}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded flex items-center justify-center">
              <TypeIcon className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <p className="font-medium">{project.name}</p>
              <p className="text-xs text-gray-500">{project.entity || 'No entity'}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className={cn("px-2 py-1 rounded text-xs font-medium", getStatusColor(project.status))}>
            {project.status}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", getTypeColor(project.typeKey))}>
            {project.type}
          </span>
        </td>
        <td className="px-4 py-3 text-sm">{project.units}</td>
        <td className="px-4 py-3 text-sm">{project.location}</td>
        <td className="px-4 py-3 text-sm">{formatCurrency(project.budgetSpent)} / {formatCurrency(project.budgetTotal)}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#047857] h-2 rounded-full"
                style={{ width: `${Math.min(project.progress, 100)}%` }}
              />
            </div>
            <span className="text-sm font-medium">{Math.round(project.progress)}%</span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm">{project.targetDate}</td>
        <td className="px-4 py-3">
          <button
            className="p-1 hover:bg-gray-200 rounded"
            onClick={(e) => { e.stopPropagation(); }}
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-gray-500">{filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}</p>
        </div>

        {/* NEW PROJECT DROPDOWN — 4 project types */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-[#047857] hover:bg-[#065f46]">
              <Plus className="w-4 h-4 mr-2" />
              New Project
              <ChevronDown className="w-3.5 h-3.5 ml-2 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            {PROJECT_TYPES.map((type) => {
              const Icon = PROJECT_TYPE_ICONS[type.key] || Building2;
              return (
                <DropdownMenuItem
                  key={type.key}
                  onClick={() => handleCreateWithType(type.key)}
                  className="cursor-pointer py-3"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", getTypeColor(type.key))}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{type.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {PROJECT_TYPE_DESCRIPTIONS[type.key]}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search projects..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? 'bg-gray-100' : ''}
        >
          <Filter className="w-4 h-4 mr-2" />Filter
        </Button>
        <div className="flex border rounded-md">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-2 transition-colors",
              viewMode === 'grid' ? "bg-[#047857] text-white" : "text-gray-500 hover:bg-gray-100"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 transition-colors",
              viewMode === 'list' ? "bg-[#047857] text-white" : "text-gray-500 hover:bg-gray-100"
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border rounded-lg p-4 mb-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Status</label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                {(PROJECT_STATUSES || []).map(s => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Type</label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                {(PROJECT_TYPES || []).map(t => (
                  <option key={t.key} value={t.key}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Summary</label>
              <div className="text-sm text-gray-600 mt-2">
                {(summary?.total || 0)} projects &middot; ${(((summary?.totalBudget || 0) / 1000000)).toFixed(1)}M budget
              </div>
            </div>
            <div className="flex items-end">
              <Button variant="outline" size="sm" onClick={() => { setStatusFilter('all'); setTypeFilter('all'); }}>
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(filteredProjects || []).map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Project</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Units</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Budget</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Progress</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Target</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase"></th>
              </tr>
            </thead>
            <tbody>
              {(filteredProjects || []).map((project) => (
                <ProjectRow key={project.id} project={project} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No projects found</h3>
          <p className="text-sm text-gray-500 mb-4">Try adjusting your search or create a new project</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-[#047857] hover:bg-[#065f46]">
                <Plus className="w-4 h-4 mr-2" />Create New Project
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-72">
              {PROJECT_TYPES.map((type) => {
                const Icon = PROJECT_TYPE_ICONS[type.key] || Building2;
                return (
                  <DropdownMenuItem key={type.key} onClick={() => handleCreateWithType(type.key)} className="cursor-pointer py-2">
                    <Icon className="w-4 h-4 mr-2" />
                    <span>{type.label}</span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Project Modal */}
      <ProjectModal
        open={modalOpen}
        onClose={handleCloseModal}
        project={editingProject}
        onSave={handleSave}
        isLoading={isSaving}
        preselectedType={preselectedType}
      />
    </div>
  );
};

export default ProjectsPage;
