import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  Search, Plus, Filter, MoreHorizontal, Building2, 
  MapPin, Calendar, DollarSign, ChevronRight, Grid, List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

// Mock projects data
const mockProjects = [
  {
    id: 1,
    name: 'Watson House',
    code: 'PRJ-001',
    type: 'Multifamily',
    status: 'construction',
    entity: 'Watson House LLC',
    address: '123 Main Street, Greenville, SC 29601',
    budget: 18000000,
    spent: 12500000,
    startDate: '2024-01-15',
    targetCompletion: '2025-06-30',
    units: 48,
    image: null,
  },
  {
    id: 2,
    name: 'Oslo Townhomes',
    code: 'PRJ-002',
    type: 'Townhomes',
    status: 'pre_development',
    entity: 'Oslo Townhomes LLC',
    address: '456 Oslo Drive, Spartanburg, SC 29302',
    budget: 4500000,
    spent: 250000,
    startDate: '2024-06-01',
    targetCompletion: '2025-12-31',
    units: 12,
    image: null,
  },
  {
    id: 3,
    name: 'Cedar Mill Apartments',
    code: 'PRJ-003',
    type: 'Mixed-Use',
    status: 'acquisition',
    entity: 'Cedar Mill Partners',
    address: '789 Cedar Mill Road, Anderson, SC 29621',
    budget: 8500000,
    spent: 150000,
    startDate: '2024-09-01',
    targetCompletion: '2026-06-30',
    units: 24,
    image: null,
  },
  {
    id: 4,
    name: 'Pine Valley Lots',
    code: 'PRJ-004',
    type: 'Lot Development',
    status: 'construction',
    entity: 'VanRock Holdings LLC',
    address: 'Pine Valley Road, Simpsonville, SC 29680',
    budget: 2800000,
    spent: 1200000,
    startDate: '2024-03-01',
    targetCompletion: '2024-12-31',
    units: 35,
    image: null,
  },
];

const statusConfig = {
  acquisition: { label: 'Acquisition', color: 'bg-blue-100 text-blue-800' },
  pre_development: { label: 'Pre-Development', color: 'bg-purple-100 text-purple-800' },
  construction: { label: 'Construction', color: 'bg-yellow-100 text-yellow-800' },
  lease_up: { label: 'Lease-Up', color: 'bg-orange-100 text-orange-800' },
  stabilized: { label: 'Stabilized', color: 'bg-green-100 text-green-800' },
  disposition: { label: 'Disposition', color: 'bg-gray-100 text-gray-800' },
};

const ProjectsListPage = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesType = typeFilter === 'all' || project.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  const stats = {
    total: mockProjects.length,
    active: mockProjects.filter(p => ['construction', 'pre_development'].includes(p.status)).length,
    totalBudget: mockProjects.reduce((sum, p) => sum + p.budget, 0),
    totalSpent: mockProjects.reduce((sum, p) => sum + p.spent, 0),
  };

  return (
    <>
      <Helmet>
        <title>Projects | AtlasDev</title>
      </Helmet>

      <div className="flex flex-col h-full bg-[#EDF2F7]">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-5 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
              <p className="text-sm text-gray-500 mt-1">
                {stats.total} projects • {stats.active} active • {formatCurrency(stats.totalBudget)} total budget
              </p>
            </div>
            <Button className="bg-[#2F855A] hover:bg-[#276749]">
              <Plus className="w-4 h-4 mr-2" /> New Project
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="acquisition">Acquisition</SelectItem>
                <SelectItem value="pre_development">Pre-Development</SelectItem>
                <SelectItem value="construction">Construction</SelectItem>
                <SelectItem value="stabilized">Stabilized</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Multifamily">Multifamily</SelectItem>
                <SelectItem value="Townhomes">Townhomes</SelectItem>
                <SelectItem value="Mixed-Use">Mixed-Use</SelectItem>
                <SelectItem value="Lot Development">Lot Development</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="sm"
                className={cn("rounded-r-none", viewMode === 'list' && "bg-gray-100")}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn("rounded-l-none", viewMode === 'grid' && "bg-gray-100")}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Project List */}
        <div className="flex-1 overflow-y-auto p-6">
          {viewMode === 'list' ? (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Budget</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Target Date</th>
                    <th className="px-6 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProjects.map((project) => {
                    const progress = (project.spent / project.budget) * 100;
                    const status = statusConfig[project.status];
                    
                    return (
                      <tr 
                        key={project.id} 
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleProjectClick(project.id)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{project.name}</p>
                              <p className="text-sm text-gray-500">{project.code} • {project.entity}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{project.type}</td>
                        <td className="px-6 py-4">
                          <Badge className={cn('text-xs', status?.color)}>
                            {status?.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{formatCurrency(project.budget)}</p>
                          <p className="text-sm text-gray-500">{formatCurrency(project.spent)} spent</p>
                        </td>
                        <td className="px-6 py-4 w-32">
                          <div className="flex items-center gap-2">
                            <Progress value={progress} className="h-2 flex-1" />
                            <span className="text-sm text-gray-500">{progress.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(project.targetCompletion)}
                        </td>
                        <td className="px-6 py-4">
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {filteredProjects.length === 0 && (
                <div className="p-12 text-center">
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No Projects Found</h3>
                  <p className="text-gray-500">Try adjusting your filters or create a new project.</p>
                </div>
              )}
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const progress = (project.spent / project.budget) * 100;
                const status = statusConfig[project.status];
                
                return (
                  <div 
                    key={project.id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md cursor-pointer transition-all"
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <div className="h-32 bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-white/80" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{project.name}</h3>
                          <p className="text-sm text-gray-500">{project.code}</p>
                        </div>
                        <Badge className={cn('text-xs', status?.color)}>
                          {status?.label}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{project.address}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Budget</span>
                          <span className="font-medium">{formatCurrency(project.budget)}</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{progress.toFixed(0)}% spent</span>
                          <span>Due {formatDate(project.targetCompletion)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProjectsListPage;
