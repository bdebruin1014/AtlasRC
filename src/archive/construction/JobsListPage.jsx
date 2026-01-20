// src/pages/construction/JobsListPage.jsx
// List of all construction jobs

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HardHat, Plus, Search, Filter, ChevronRight, Building2,
  Calendar, DollarSign, User, MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  getJobs,
  JOB_STATUS,
  JOB_STATUS_LABELS,
} from '@/services/constructionService';

const JobsListPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await getJobs();
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.job_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.project?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case JOB_STATUS.ACTIVE: return 'bg-green-100 text-green-800';
      case JOB_STATUS.PENDING: return 'bg-yellow-100 text-yellow-800';
      case JOB_STATUS.ON_HOLD: return 'bg-orange-100 text-orange-800';
      case JOB_STATUS.COMPLETED: return 'bg-blue-100 text-blue-800';
      case JOB_STATUS.CLOSED: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HardHat className="w-7 h-7 text-orange-600" />
            Construction Jobs
          </h1>
          <p className="text-gray-500 mt-1">{jobs.length} total jobs</p>
        </div>
        <Button onClick={() => navigate('/construction/jobs/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Job
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          {Object.entries(JOB_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Jobs Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Job</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Project</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Contract Value</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Start Date</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">PM</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredJobs.map((job) => (
                <tr 
                  key={job.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/construction/jobs/${job.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <HardHat className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">{job.name}</p>
                        <p className="text-sm text-gray-500">{job.job_number}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span>{job.project?.name || '-'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatCurrency(job.contract_amount)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(job.start_date)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={getStatusColor(job.status)}>
                      {JOB_STATUS_LABELS[job.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{job.project_manager?.full_name || '-'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/construction/jobs/${job.id}`)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/construction/jobs/${job.id}/edit`)}>
                          Edit Job
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/construction/jobs/${job.id}/costs`)}>
                          View Costs
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/construction/jobs/${job.id}/daily-logs`)}>
                          Daily Logs
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {filteredJobs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    <HardHat className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No jobs found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobsListPage;
