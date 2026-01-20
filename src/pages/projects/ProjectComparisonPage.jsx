import React, { useState } from 'react';
import { Plus, Search, X, Download, TrendingUp, TrendingDown, DollarSign, Home, Calendar, Percent, BarChart3, Building2, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ProjectComparisonPage = () => {
  const [selectedProjects, setSelectedProjects] = useState(['proj-1', 'proj-2', 'proj-3']);

  const allProjects = [
    {
      id: 'proj-1',
      name: 'Oakridge Estates',
      type: 'Spec Build',
      location: 'Greenville, SC',
      status: 'in-progress',
      startDate: '2024-01-15',
      estCompletion: '2025-06-30',
      totalUnits: 12,
      unitsSold: 1,
      unitsUnderContract: 1,
      totalBudget: 6850000,
      spentToDate: 4650000,
      budgetVariance: -2.3,
      projectedSalesPrice: 4840000,
      grossProfit: 1350000,
      grossMargin: 19.7,
      equityInvested: 2125000,
      projectedIRR: 32.5,
      equityMultiple: 1.46,
      constructionProgress: 68,
      daysRemaining: 185,
      loanBalance: 3950000,
      ltv: 68,
    },
    {
      id: 'proj-2',
      name: 'Riverside Villas',
      type: 'Lot Development',
      location: 'Simpsonville, SC',
      status: 'complete',
      startDate: '2023-03-01',
      estCompletion: '2024-06-30',
      totalUnits: 24,
      unitsSold: 24,
      unitsUnderContract: 0,
      totalBudget: 3200000,
      spentToDate: 3050000,
      budgetVariance: -4.7,
      projectedSalesPrice: 4320000,
      grossProfit: 1270000,
      grossMargin: 29.4,
      equityInvested: 850000,
      projectedIRR: 42.3,
      equityMultiple: 1.65,
      constructionProgress: 100,
      daysRemaining: 0,
      loanBalance: 0,
      ltv: 0,
    },
    {
      id: 'proj-3',
      name: 'Highland Townhomes',
      type: 'Spec Build',
      location: 'Mauldin, SC',
      status: 'in-progress',
      startDate: '2024-06-01',
      estCompletion: '2025-12-31',
      totalUnits: 8,
      unitsSold: 0,
      unitsUnderContract: 2,
      totalBudget: 4200000,
      spentToDate: 1680000,
      budgetVariance: 1.2,
      projectedSalesPrice: 3520000,
      grossProfit: 780000,
      grossMargin: 18.6,
      equityInvested: 1050000,
      projectedIRR: 28.4,
      equityMultiple: 1.38,
      constructionProgress: 35,
      daysRemaining: 370,
      loanBalance: 1200000,
      ltv: 72,
    },
    {
      id: 'proj-4',
      name: 'Creekside Commons',
      type: 'Build-to-Rent',
      location: 'Greer, SC',
      status: 'planning',
      startDate: '2025-03-01',
      estCompletion: '2026-09-30',
      totalUnits: 16,
      unitsSold: 0,
      unitsUnderContract: 0,
      totalBudget: 5600000,
      spentToDate: 125000,
      budgetVariance: 0,
      projectedSalesPrice: 0,
      grossProfit: 0,
      grossMargin: 0,
      equityInvested: 350000,
      projectedIRR: 18.5,
      equityMultiple: 1.85,
      constructionProgress: 0,
      daysRemaining: 640,
      loanBalance: 0,
      ltv: 0,
    },
  ];

  const projects = allProjects.filter(p => selectedProjects.includes(p.id));

  const toggleProject = (projectId) => {
    if (selectedProjects.includes(projectId)) {
      if (selectedProjects.length > 2) {
        setSelectedProjects(prev => prev.filter(id => id !== projectId));
      }
    } else {
      if (selectedProjects.length < 4) {
        setSelectedProjects(prev => [...prev, projectId]);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'planning': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatCurrency = (value) => {
    if (value === 0) return '-';
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  const getHighestValue = (key) => {
    const values = projects.map(p => p[key]).filter(v => v !== 0);
    return Math.max(...values);
  };

  const getLowestValue = (key) => {
    const values = projects.map(p => p[key]).filter(v => v !== 0);
    return Math.min(...values);
  };

  const comparisonMetrics = [
    { label: 'Overview', isHeader: true },
    { key: 'type', label: 'Project Type', format: 'text' },
    { key: 'location', label: 'Location', format: 'text' },
    { key: 'status', label: 'Status', format: 'status' },
    { key: 'totalUnits', label: 'Total Units', format: 'number', highlight: 'high' },
    { key: 'constructionProgress', label: 'Construction Progress', format: 'percent', highlight: 'high' },
    { key: 'daysRemaining', label: 'Days Remaining', format: 'number', highlight: 'low' },
    
    { label: 'Sales', isHeader: true },
    { key: 'unitsSold', label: 'Units Sold', format: 'number', highlight: 'high' },
    { key: 'unitsUnderContract', label: 'Under Contract', format: 'number', highlight: 'high' },
    { key: 'projectedSalesPrice', label: 'Total Sales Revenue', format: 'currency', highlight: 'high' },
    
    { label: 'Budget & Cost', isHeader: true },
    { key: 'totalBudget', label: 'Total Budget', format: 'currency' },
    { key: 'spentToDate', label: 'Spent to Date', format: 'currency' },
    { key: 'budgetVariance', label: 'Budget Variance', format: 'percentVariance', highlight: 'low' },
    { key: 'grossProfit', label: 'Gross Profit', format: 'currency', highlight: 'high' },
    { key: 'grossMargin', label: 'Gross Margin', format: 'percent', highlight: 'high' },
    
    { label: 'Returns', isHeader: true },
    { key: 'equityInvested', label: 'Equity Invested', format: 'currency' },
    { key: 'projectedIRR', label: 'Projected IRR', format: 'percent', highlight: 'high' },
    { key: 'equityMultiple', label: 'Equity Multiple', format: 'multiple', highlight: 'high' },
    
    { label: 'Financing', isHeader: true },
    { key: 'loanBalance', label: 'Loan Balance', format: 'currency' },
    { key: 'ltv', label: 'LTV', format: 'percent', highlight: 'low' },
  ];

  const renderValue = (project, metric) => {
    const value = project[metric.key];
    
    if (metric.format === 'text') return value;
    if (metric.format === 'status') {
      return (
        <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(value))}>
          {value.replace('-', ' ')}
        </span>
      );
    }
    if (metric.format === 'currency') return formatCurrency(value);
    if (metric.format === 'percent') return value ? `${value}%` : '-';
    if (metric.format === 'percentVariance') {
      if (value === 0) return '-';
      return (
        <span className={cn("flex items-center gap-1", value < 0 ? "text-green-600" : "text-red-600")}>
          {value < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
          {Math.abs(value)}%
        </span>
      );
    }
    if (metric.format === 'multiple') return value ? `${value}x` : '-';
    if (metric.format === 'number') return value?.toLocaleString() || '-';
    return value;
  };

  const isHighlight = (project, metric) => {
    if (!metric.highlight || project[metric.key] === 0) return false;
    const value = project[metric.key];
    if (metric.highlight === 'high') return value === getHighestValue(metric.key);
    if (metric.highlight === 'low') return value === getLowestValue(metric.key) && value !== 0;
    return false;
  };

  // Calculate portfolio totals
  const portfolioTotals = {
    totalUnits: allProjects.reduce((sum, p) => sum + p.totalUnits, 0),
    unitsSold: allProjects.reduce((sum, p) => sum + p.unitsSold, 0),
    totalBudget: allProjects.reduce((sum, p) => sum + p.totalBudget, 0),
    spentToDate: allProjects.reduce((sum, p) => sum + p.spentToDate, 0),
    equityInvested: allProjects.reduce((sum, p) => sum + p.equityInvested, 0),
    grossProfit: allProjects.reduce((sum, p) => sum + p.grossProfit, 0),
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Project Comparison</h1>
          <p className="text-sm text-gray-500">Compare metrics across projects</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Total Projects</p>
          <p className="text-2xl font-semibold">{allProjects.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Total Units</p>
          <p className="text-2xl font-semibold">{portfolioTotals.totalUnits}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Units Sold</p>
          <p className="text-2xl font-semibold text-green-600">{portfolioTotals.unitsSold}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Total Budget</p>
          <p className="text-xl font-semibold">{formatCurrency(portfolioTotals.totalBudget)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Total Equity</p>
          <p className="text-xl font-semibold">{formatCurrency(portfolioTotals.equityInvested)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Total Profit</p>
          <p className="text-xl font-semibold text-green-600">{formatCurrency(portfolioTotals.grossProfit)}</p>
        </div>
      </div>

      {/* Project Selector */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <p className="text-sm font-medium mb-3">Select Projects to Compare (2-4)</p>
        <div className="flex gap-3">
          {allProjects.map((project) => {
            const isSelected = selectedProjects.includes(project.id);
            return (
              <button
                key={project.id}
                onClick={() => toggleProject(project.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors",
                  isSelected ? "border-[#047857] bg-green-50" : "border-gray-200 hover:border-gray-300"
                )}
              >
                {isSelected && <CheckCircle className="w-4 h-4 text-[#047857]" />}
                <Building2 className={cn("w-4 h-4", isSelected ? "text-[#047857]" : "text-gray-400")} />
                <span className={cn("font-medium", isSelected ? "text-[#047857]" : "text-gray-700")}>{project.name}</span>
                <span className={cn("px-2 py-0.5 rounded text-xs capitalize", getStatusColor(project.status))}>
                  {project.status.replace('-', ' ')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium w-48 sticky left-0 bg-gray-50">Metric</th>
                {projects.map((project) => (
                  <th key={project.id} className="text-center px-4 py-3 font-medium min-w-[180px]">
                    <div className="flex flex-col items-center gap-1">
                      <span>{project.name}</span>
                      <span className={cn("px-2 py-0.5 rounded text-xs capitalize", getStatusColor(project.status))}>
                        {project.status.replace('-', ' ')}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonMetrics.map((metric, idx) => {
                if (metric.isHeader) {
                  return (
                    <tr key={idx} className="bg-gray-100">
                      <td colSpan={projects.length + 1} className="px-4 py-2 font-semibold text-gray-700">
                        {metric.label}
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-600 sticky left-0 bg-white">{metric.label}</td>
                    {projects.map((project) => (
                      <td 
                        key={project.id} 
                        className={cn(
                          "px-4 py-3 text-center",
                          isHighlight(project, metric) && "bg-green-50 font-semibold text-green-700"
                        )}
                      >
                        {renderValue(project, metric)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Comparisons */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        {/* IRR Comparison */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Projected IRR</h3>
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center gap-3">
                <span className="w-32 text-sm truncate">{project.name}</span>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#047857] rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(project.projectedIRR / 50) * 100}%` }}
                  >
                    <span className="text-xs text-white font-medium">{project.projectedIRR}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Construction Progress */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Construction Progress</h3>
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center gap-3">
                <span className="w-32 text-sm truncate">{project.name}</span>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full flex items-center justify-end pr-2",
                      project.constructionProgress === 100 ? "bg-green-500" : "bg-blue-500"
                    )}
                    style={{ width: `${project.constructionProgress}%` }}
                  >
                    <span className="text-xs text-white font-medium">{project.constructionProgress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectComparisonPage;
