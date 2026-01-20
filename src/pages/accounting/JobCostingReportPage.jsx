// src/pages/accounting/JobCostingReportPage.jsx
// Project and Job Costing Reports

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  BarChart3, Building2, DollarSign, TrendingUp, TrendingDown,
  ChevronRight, ChevronDown, FileText, Calendar, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const JobCostingReportPage = () => {
  const { entityId } = useParams();
  const [projects, setProjects] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('projects'); // projects or jobs
  const [expandedItems, setExpandedItems] = useState({});
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, [entityId, dateRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load projects with costs
      const { data: projectsData } = await supabase
        .from('projects')
        .select(`
          id, name, status, project_type,
          budgets:project_budgets(budget_amount),
          expenses:expenses(amount, status)
        `)
        .eq('entity_id', entityId)
        .order('name');

      // Process project costs
      const processedProjects = projectsData?.map(project => {
        const totalBudget = project.budgets?.reduce((sum, b) => sum + (b.budget_amount || 0), 0) || 0;
        const totalExpenses = project.expenses
          ?.filter(e => e.status === 'approved' || e.status === 'reimbursed')
          .reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
        
        return {
          ...project,
          total_budget: totalBudget,
          total_expenses: totalExpenses,
          variance: totalBudget - totalExpenses,
          percent_used: totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0,
        };
      }) || [];

      setProjects(processedProjects);

      // Load construction jobs with costs
      const { data: jobsData } = await supabase
        .from('construction_jobs')
        .select(`
          id, job_number, name, status, contract_amount,
          cost_codes:job_cost_codes(
            code, description, budget_amount, committed_amount, actual_amount
          )
        `)
        .eq('contractor_entity_id', entityId)
        .order('job_number');

      // Process job costs
      const processedJobs = jobsData?.map(job => {
        const totalBudget = job.cost_codes?.reduce((sum, cc) => sum + (cc.budget_amount || 0), 0) || 0;
        const totalCommitted = job.cost_codes?.reduce((sum, cc) => sum + (cc.committed_amount || 0), 0) || 0;
        const totalActual = job.cost_codes?.reduce((sum, cc) => sum + (cc.actual_amount || 0), 0) || 0;
        
        return {
          ...job,
          total_budget: totalBudget,
          total_committed: totalCommitted,
          total_actual: totalActual,
          variance: totalBudget - totalActual,
          percent_used: totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0,
        };
      }) || [];

      setJobs(processedJobs);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getVarianceColor = (variance) => {
    if (variance >= 0) return 'text-green-600';
    return 'text-red-600';
  };

  const getProgressColor = (percent) => {
    if (percent <= 75) return 'bg-green-500';
    if (percent <= 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Summary calculations
  const projectSummary = {
    totalBudget: projects.reduce((sum, p) => sum + p.total_budget, 0),
    totalSpent: projects.reduce((sum, p) => sum + p.total_expenses, 0),
    count: projects.length,
  };

  const jobSummary = {
    totalBudget: jobs.reduce((sum, j) => sum + j.total_budget, 0),
    totalCommitted: jobs.reduce((sum, j) => sum + j.total_committed, 0),
    totalActual: jobs.reduce((sum, j) => sum + j.total_actual, 0),
    count: jobs.length,
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
            <BarChart3 className="w-7 h-7 text-indigo-600" />
            Job Costing Report
          </h1>
          <p className="text-gray-500 mt-1">Project and job cost tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-1.5 border rounded-lg text-sm"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-1.5 border rounded-lg text-sm"
            />
          </div>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <button
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            viewMode === 'projects' 
              ? "bg-indigo-100 text-indigo-700" 
              : "text-gray-500 hover:bg-gray-100"
          )}
          onClick={() => setViewMode('projects')}
        >
          <Building2 className="w-4 h-4 inline mr-2" />
          Projects ({projects.length})
        </button>
        <button
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            viewMode === 'jobs' 
              ? "bg-indigo-100 text-indigo-700" 
              : "text-gray-500 hover:bg-gray-100"
          )}
          onClick={() => setViewMode('jobs')}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Construction Jobs ({jobs.length})
        </button>
      </div>

      {/* Summary Cards */}
      {viewMode === 'projects' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500">Total Budget</p>
              <p className="text-2xl font-bold">{formatCurrency(projectSummary.totalBudget)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold">{formatCurrency(projectSummary.totalSpent)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500">Remaining</p>
              <p className={cn("text-2xl font-bold", getVarianceColor(projectSummary.totalBudget - projectSummary.totalSpent))}>
                {formatCurrency(projectSummary.totalBudget - projectSummary.totalSpent)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500">% Used</p>
              <p className="text-2xl font-bold">
                {projectSummary.totalBudget > 0 
                  ? ((projectSummary.totalSpent / projectSummary.totalBudget) * 100).toFixed(1)
                  : 0}%
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500">Total Budget</p>
              <p className="text-2xl font-bold">{formatCurrency(jobSummary.totalBudget)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500">Committed</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(jobSummary.totalCommitted)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500">Actual</p>
              <p className="text-2xl font-bold">{formatCurrency(jobSummary.totalActual)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500">Variance</p>
              <p className={cn("text-2xl font-bold", getVarianceColor(jobSummary.totalBudget - jobSummary.totalActual))}>
                {formatCurrency(jobSummary.totalBudget - jobSummary.totalActual)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500">% Complete</p>
              <p className="text-2xl font-bold">
                {jobSummary.totalBudget > 0 
                  ? ((jobSummary.totalActual / jobSummary.totalBudget) * 100).toFixed(1)
                  : 0}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Projects View */}
      {viewMode === 'projects' && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Project</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Budget</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Spent</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Variance</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 w-40">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{project.project_type?.replace('_', ' ')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(project.total_budget)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatCurrency(project.total_expenses)}
                    </td>
                    <td className={cn("px-4 py-3 text-right font-medium", getVarianceColor(project.variance))}>
                      <span className="flex items-center justify-end gap-1">
                        {project.variance >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {formatCurrency(Math.abs(project.variance))}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full", getProgressColor(project.percent_used))}
                            style={{ width: `${Math.min(project.percent_used, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">
                          {project.percent_used.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
                {projects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                      <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No projects found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Jobs View */}
      {viewMode === 'jobs' && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Job</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Budget</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Committed</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Actual</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Variance</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 w-40">Progress</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {jobs.map((job) => (
                  <React.Fragment key={job.id}>
                    <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleExpand(job.id)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {expandedItems[job.id] ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                          <div>
                            <p className="font-medium">{job.job_number}</p>
                            <p className="text-sm text-gray-500">{job.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(job.total_budget)}
                      </td>
                      <td className="px-4 py-3 text-right text-blue-600">
                        {formatCurrency(job.total_committed)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(job.total_actual)}
                      </td>
                      <td className={cn("px-4 py-3 text-right font-medium", getVarianceColor(job.variance))}>
                        <span className="flex items-center justify-end gap-1">
                          {job.variance >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          {formatCurrency(Math.abs(job.variance))}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={cn("h-full rounded-full", getProgressColor(job.percent_used))}
                              style={{ width: `${Math.min(job.percent_used, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">
                            {job.percent_used.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={cn(
                          job.status === 'active' && "bg-green-100 text-green-800",
                          job.status === 'completed' && "bg-blue-100 text-blue-800",
                          job.status === 'pending' && "bg-yellow-100 text-yellow-800",
                        )}>
                          {job.status}
                        </Badge>
                      </td>
                    </tr>
                    {/* Expanded Cost Codes */}
                    {expandedItems[job.id] && job.cost_codes?.length > 0 && (
                      <tr>
                        <td colSpan={7} className="bg-gray-50 px-4 py-2">
                          <table className="w-full">
                            <thead>
                              <tr className="text-xs text-gray-500">
                                <th className="text-left py-2 pl-8">Cost Code</th>
                                <th className="text-right py-2">Budget</th>
                                <th className="text-right py-2">Committed</th>
                                <th className="text-right py-2">Actual</th>
                                <th className="text-right py-2">Variance</th>
                                <th className="w-40"></th>
                                <th className="w-10"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {job.cost_codes.map((cc, idx) => {
                                const ccVariance = (cc.budget_amount || 0) - (cc.actual_amount || 0);
                                const ccPercent = cc.budget_amount > 0 
                                  ? ((cc.actual_amount || 0) / cc.budget_amount) * 100 
                                  : 0;
                                return (
                                  <tr key={idx} className="text-sm border-t border-gray-200">
                                    <td className="py-2 pl-8">
                                      <span className="font-mono text-xs text-gray-500">{cc.code}</span>
                                      <span className="ml-2">{cc.description}</span>
                                    </td>
                                    <td className="py-2 text-right">{formatCurrency(cc.budget_amount)}</td>
                                    <td className="py-2 text-right text-blue-600">{formatCurrency(cc.committed_amount)}</td>
                                    <td className="py-2 text-right">{formatCurrency(cc.actual_amount)}</td>
                                    <td className={cn("py-2 text-right", getVarianceColor(ccVariance))}>
                                      {formatCurrency(ccVariance)}
                                    </td>
                                    <td className="py-2">
                                      <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                          <div 
                                            className={cn("h-full rounded-full", getProgressColor(ccPercent))}
                                            style={{ width: `${Math.min(ccPercent, 100)}%` }}
                                          />
                                        </div>
                                        <span className="text-xs text-gray-500 w-10 text-right">
                                          {ccPercent.toFixed(0)}%
                                        </span>
                                      </div>
                                    </td>
                                    <td></td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {jobs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                      <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No construction jobs found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JobCostingReportPage;
