import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Filter, LayoutGrid, List, Building2, MapPin,
  DollarSign, Calendar, ChevronRight, MoreVertical, Eye, Edit2,
  Trash2, Copy, Archive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useProjects, useProjectActions, useProjectSummary, PROJECT_STATUSES, PROJECT_TYPES } from '@/hooks/useProjects';
import ProjectModal from '@/components/ProjectModal';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { projects: rawProjects, isLoading, error, refetch } = useProjects();
  const { createProject, updateProject, deleteProject, isLoading: isSaving } = useProjectActions();
  const summary = useProjectSummary(rawProjects);

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Transform projects to display format
  const projects = rawProjects.map(p => ({
    id: p.id,
    name: p.name,
    type: PROJECT_TYPES.find(t => t.key === p.project_type)?.label || p.project_type || 'Unknown',
    status: p.status,
    location: p.address || 'No address',
    budgetSpent: 0, // TODO: Calculate from transactions
    budgetTotal: parseFloat(p.budget) || 0,
    targetDate: p.target_completion_date ? new Date(p.target_completion_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD',
    progress: 0, // TODO: Calculate progress
    entity: p.entity?.name,
    raw: p,
  }));

  const handleCreate = () => {
    setEditingProject(null);
    setModalOpen(true);
  };

  const handleEdit = (project) => {
    setEditingProject(project.raw);
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
    setModalOpen(false);
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

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500">Error: {error}</div>
        <Button onClick={refetch} className="mt-4">Retry</Button>
      </div>
    );
  }

  const ProjectCard = ({ project }) => (
    <div 
      className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/project/${project.id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h3 className="font-semibold">{project.name}</h3>
            <p className="text-xs text-gray-500">{project.id}</p>
          </div>
        </div>
        <span className={cn("px-2 py-1 rounded text-xs font-medium", getStatusColor(project.status))}>
          {project.status}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span>{project.type} • {project.units} units</span>
        </div>
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
          <span className="font-medium">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[#047857] h-2 rounded-full transition-all"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>
    </div>
  );

  const ProjectRow = ({ project }) => (
    <tr 
      className="hover:bg-gray-50 cursor-pointer border-b"
      onClick={() => navigate(`/project/${project.id}`)}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-100 rounded flex items-center justify-center">
            <Building2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <p className="font-medium">{project.name}</p>
            <p className="text-xs text-gray-500">{project.id}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={cn("px-2 py-1 rounded text-xs font-medium", getStatusColor(project.status))}>
          {project.status}
        </span>
      </td>
      <td className="px-4 py-3 text-sm">{project.type}</td>
      <td className="px-4 py-3 text-sm">{project.units}</td>
      <td className="px-4 py-3 text-sm">{project.location}</td>
      <td className="px-4 py-3 text-sm">{formatCurrency(project.budgetSpent)} / {formatCurrency(project.budgetTotal)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#047857] h-2 rounded-full"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <span className="text-sm font-medium">{project.progress}%</span>
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-gray-500">{filteredProjects.length} active projects</p>
        </div>
        <Button
          className="bg-[#047857] hover:bg-[#065f46]"
          onClick={handleCreate}
        >
          <Plus className="w-4 h-4 mr-2" />New Project
        </Button>
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
                {PROJECT_STATUSES.map(s => (
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
                {PROJECT_TYPES.map(t => (
                  <option key={t.key} value={t.key}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Summary</label>
              <div className="text-sm text-gray-600 mt-2">
                {summary.total} projects • ${(summary.totalBudget / 1000000).toFixed(1)}M budget
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
          {filteredProjects.map((project) => (
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
              {filteredProjects.map((project) => (
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
          <p className="text-sm text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
          <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />Create New Project
          </Button>
        </div>
      )}

      {/* Project Modal */}
      <ProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        project={editingProject}
        onSave={handleSave}
        isLoading={isSaving}
      />
    </div>
  );
};

export default ProjectsPage;
