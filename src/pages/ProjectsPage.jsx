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

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);

  const projects = [
    {
      id: 'PRJ-001',
      name: 'Watson House',
      type: 'Multifamily',
      units: 48,
      status: 'construction',
      location: 'Greenville, SC',
      budgetSpent: 12500000,
      budgetTotal: 18000000,
      targetDate: 'Jun 29, 2025',
      progress: 69,
    },
    {
      id: 'PRJ-002',
      name: 'Oslo Townhomes',
      type: 'BTR',
      units: 32,
      status: 'pre development',
      location: 'Spartanburg, SC',
      budgetSpent: 2500000,
      budgetTotal: 14000000,
      targetDate: 'Dec 30, 2025',
      progress: 18,
    },
    {
      id: 'PRJ-003',
      name: 'Cedar Mill Apartments',
      type: 'Multifamily',
      units: 72,
      status: 'construction',
      location: 'Greer, SC',
      budgetSpent: 18500000,
      budgetTotal: 22000000,
      targetDate: 'Mar 14, 2025',
      progress: 84,
    },
    {
      id: 'PRJ-004',
      name: 'Riverside Lots',
      type: 'Land Development',
      units: 24,
      status: 'entitlements',
      location: 'Simpsonville, SC',
      budgetSpent: 850000,
      budgetTotal: 4200000,
      targetDate: 'Aug 15, 2025',
      progress: 20,
    },
    {
      id: 'PRJ-005',
      name: 'Maple Street Flip',
      type: 'Fix & Flip',
      units: 1,
      status: 'construction',
      location: 'Greenville, SC',
      budgetSpent: 185000,
      budgetTotal: 245000,
      targetDate: 'Feb 28, 2025',
      progress: 75,
    },
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'construction': return 'bg-emerald-100 text-emerald-700';
      case 'pre development': return 'bg-blue-100 text-blue-700';
      case 'entitlements': return 'bg-amber-100 text-amber-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'on hold': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatCurrency = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val}`;
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          onClick={() => navigate('/projects/new')}
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
              <select className="w-full border rounded-md px-3 py-2 text-sm">
                <option>All Statuses</option>
                <option>Construction</option>
                <option>Pre Development</option>
                <option>Entitlements</option>
                <option>Completed</option>
                <option>On Hold</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Type</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm">
                <option>All Types</option>
                <option>Multifamily</option>
                <option>BTR</option>
                <option>Land Development</option>
                <option>Fix & Flip</option>
                <option>New Construction</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Location</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm">
                <option>All Locations</option>
                <option>Greenville, SC</option>
                <option>Spartanburg, SC</option>
                <option>Greer, SC</option>
                <option>Simpsonville, SC</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Budget Range</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm">
                <option>All Budgets</option>
                <option>Under $1M</option>
                <option>$1M - $5M</option>
                <option>$5M - $15M</option>
                <option>Over $15M</option>
              </select>
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
          <Button className="bg-[#047857] hover:bg-[#065f46]">
            <Plus className="w-4 h-4 mr-2" />Create New Project
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
