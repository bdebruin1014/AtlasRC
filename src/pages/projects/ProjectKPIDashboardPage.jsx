import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Building2,
  Users,
  Percent,
  Activity,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Circle,
  Home,
  Briefcase,
  Hammer,
  FileText,
  PieChart,
  LayoutGrid
} from 'lucide-react';

const ProjectKPIDashboardPage = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('ytd');
  const [projectType, setProjectType] = useState('all');
  const [region, setRegion] = useState('all');

  // Mock KPI data
  const kpiData = {
    summary: {
      totalProjects: 47,
      activeProjects: 32,
      completedProjects: 12,
      onHold: 3,
      totalBudget: 145600000,
      totalSpent: 89200000,
      avgCompletionRate: 67,
      onTimeRate: 78,
      onBudgetRate: 82,
    },
    financialKPIs: {
      totalRevenue: 28500000,
      projectedRevenue: 42000000,
      grossMargin: 22.5,
      roi: 18.4,
      budgetVariance: -3.2,
      costPerSqft: 145,
    },
    operationalKPIs: {
      avgProjectDuration: 245,
      avgDelayDays: 12,
      changeOrderRate: 8.5,
      rfiResponseTime: 2.3,
      punchListItems: 156,
      safetyIncidents: 2,
    },
    projectsByStatus: [
      { status: 'Planning', count: 8, budget: 32000000 },
      { status: 'Pre-Construction', count: 6, budget: 24500000 },
      { status: 'In Progress', count: 18, budget: 68000000 },
      { status: 'Near Completion', count: 5, budget: 15600000 },
      { status: 'Completed', count: 10, budget: 5500000 },
    ],
    projectsByType: [
      { type: 'Scattered Lot', count: 22, budget: 45000000, icon: Home },
      { type: 'Subdivision', count: 8, budget: 42000000, icon: LayoutGrid },
      { type: 'Commercial', count: 5, budget: 28000000, icon: Building2 },
      { type: 'Renovation', count: 7, budget: 18000000, icon: Hammer },
      { type: 'Mixed-Use', count: 5, budget: 12600000, icon: Briefcase },
    ],
    topProjects: [
      { id: 1, name: 'Oakwood Estates Phase 2', type: 'Subdivision', budget: 12500000, spent: 8200000, completion: 72, status: 'on_track', dueDate: '2025-06-15' },
      { id: 2, name: 'Charlotte Scattered Lots - Q1', type: 'Scattered Lot', budget: 4800000, spent: 3900000, completion: 85, status: 'on_track', dueDate: '2025-03-30' },
      { id: 3, name: 'Downtown Mixed-Use Tower', type: 'Commercial', budget: 28000000, spent: 14200000, completion: 48, status: 'at_risk', dueDate: '2025-12-01' },
      { id: 4, name: 'Greenville Renovation Portfolio', type: 'Renovation', budget: 6200000, spent: 5800000, completion: 92, status: 'on_track', dueDate: '2025-02-28' },
      { id: 5, name: 'Lake Norman Waterfront', type: 'Subdivision', budget: 8900000, spent: 7100000, completion: 78, status: 'delayed', dueDate: '2025-04-15' },
    ],
    monthlyTrends: [
      { month: 'Jul', budget: 8500000, actual: 8200000, projects: 28 },
      { month: 'Aug', budget: 9200000, actual: 9800000, projects: 30 },
      { month: 'Sep', budget: 10100000, actual: 9600000, projects: 32 },
      { month: 'Oct', budget: 11500000, actual: 12100000, projects: 35 },
      { month: 'Nov', budget: 12800000, actual: 12400000, projects: 38 },
      { month: 'Dec', budget: 13200000, actual: 13500000, projects: 42 },
      { month: 'Jan', budget: 14500000, actual: 13900000, projects: 47 },
    ],
    alerts: [
      { id: 1, type: 'budget', severity: 'high', project: 'Downtown Mixed-Use Tower', message: 'Budget overrun exceeds 10%', date: '2025-01-24' },
      { id: 2, type: 'schedule', severity: 'medium', project: 'Lake Norman Waterfront', message: 'Project delayed by 3 weeks', date: '2025-01-23' },
      { id: 3, type: 'milestone', severity: 'low', project: 'Charlotte Scattered Lots - Q1', message: 'Final inspection due in 5 days', date: '2025-01-22' },
      { id: 4, type: 'safety', severity: 'high', project: 'Oakwood Estates Phase 2', message: 'Safety incident reported', date: '2025-01-21' },
    ],
  };

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'on_track':
        return 'text-green-600 bg-green-100';
      case 'at_risk':
        return 'text-yellow-600 bg-yellow-100';
      case 'delayed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <BarChart3 className="w-7 h-7 text-blue-600" />
                Project KPI Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Real-time metrics and performance indicators across all projects
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Filters:</span>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="mtd">Month to Date</option>
              <option value="qtd">Quarter to Date</option>
              <option value="ytd">Year to Date</option>
              <option value="all">All Time</option>
            </select>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Project Types</option>
              <option value="scattered">Scattered Lot</option>
              <option value="subdivision">Subdivision</option>
              <option value="commercial">Commercial</option>
              <option value="renovation">Renovation</option>
            </select>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Regions</option>
              <option value="nc">North Carolina</option>
              <option value="sc">South Carolina</option>
              <option value="ga">Georgia</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Projects</p>
                <p className="text-3xl font-bold text-gray-900">{kpiData.summary.activeProjects}</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-4 h-4" />
                  +5 from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(kpiData.summary.totalBudget)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatCurrency(kpiData.summary.totalSpent)} spent
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On-Time Rate</p>
                <p className="text-3xl font-bold text-gray-900">{kpiData.summary.onTimeRate}%</p>
                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                  <ArrowDownRight className="w-4 h-4" />
                  -2% from target
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On-Budget Rate</p>
                <p className="text-3xl font-bold text-gray-900">{kpiData.summary.onBudgetRate}%</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-4 h-4" />
                  +3% from last quarter
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Financial KPIs */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Financial KPIs
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Revenue</span>
                <span className="font-semibold text-gray-900">{formatCurrency(kpiData.financialKPIs.totalRevenue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Projected Revenue</span>
                <span className="font-semibold text-gray-900">{formatCurrency(kpiData.financialKPIs.projectedRevenue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Gross Margin</span>
                <span className="font-semibold text-green-600">{kpiData.financialKPIs.grossMargin}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">ROI</span>
                <span className="font-semibold text-green-600">{kpiData.financialKPIs.roi}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Budget Variance</span>
                <span className={`font-semibold ${kpiData.financialKPIs.budgetVariance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {kpiData.financialKPIs.budgetVariance > 0 ? '+' : ''}{kpiData.financialKPIs.budgetVariance}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Cost per Sq Ft</span>
                <span className="font-semibold text-gray-900">${kpiData.financialKPIs.costPerSqft}</span>
              </div>
            </div>
          </div>

          {/* Operational KPIs */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Operational KPIs
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Avg Project Duration</span>
                <span className="font-semibold text-gray-900">{kpiData.operationalKPIs.avgProjectDuration} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Avg Delay Days</span>
                <span className="font-semibold text-yellow-600">{kpiData.operationalKPIs.avgDelayDays} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Change Order Rate</span>
                <span className="font-semibold text-gray-900">{kpiData.operationalKPIs.changeOrderRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">RFI Response Time</span>
                <span className="font-semibold text-green-600">{kpiData.operationalKPIs.rfiResponseTime} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Open Punch List Items</span>
                <span className="font-semibold text-gray-900">{kpiData.operationalKPIs.punchListItems}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Safety Incidents (YTD)</span>
                <span className={`font-semibold ${kpiData.operationalKPIs.safetyIncidents > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {kpiData.operationalKPIs.safetyIncidents}
                </span>
              </div>
            </div>
          </div>

          {/* Projects by Type */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-600" />
              Projects by Type
            </h3>
            <div className="space-y-3">
              {kpiData.projectsByType.map((type, idx) => {
                const TypeIcon = type.icon;
                const percentage = (type.count / kpiData.summary.totalProjects) * 100;
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{type.type}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold text-gray-900">{type.count}</span>
                        <span className="text-gray-500 ml-1">({formatCurrency(type.budget)})</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Projects by Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Projects by Status</h3>
          <div className="flex items-end gap-4 h-48">
            {kpiData.projectsByStatus.map((status, idx) => {
              const maxCount = Math.max(...kpiData.projectsByStatus.map(s => s.count));
              const height = (status.count / maxCount) * 100;
              const colors = ['bg-gray-400', 'bg-blue-400', 'bg-blue-600', 'bg-green-400', 'bg-green-600'];
              return (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center justify-end h-36">
                    <span className="text-sm font-semibold text-gray-900 mb-1">{status.count}</span>
                    <div
                      className={`w-full ${colors[idx]} rounded-t-lg transition-all`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-xs font-medium text-gray-700">{status.status}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(status.budget)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Projects */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Top Projects</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {kpiData.topProjects.map((project) => (
                <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{project.name}</h4>
                      <p className="text-sm text-gray-500">{project.type}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Completion</span>
                      <span className="font-medium">{project.completion}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          project.status === 'on_track' ? 'bg-green-500' :
                          project.status === 'at_risk' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${project.completion}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
                    </span>
                    <span className="text-gray-500">Due: {project.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts & Notifications */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                Alerts & Notifications
              </h3>
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                {kpiData.alerts.filter(a => a.severity === 'high').length} critical
              </span>
            </div>
            <div className="space-y-3">
              {kpiData.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border-l-4 rounded-r-lg p-4 ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{alert.project}</p>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                    </div>
                    <span className="text-xs text-gray-500">{alert.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Monthly Spend Trends
          </h3>
          <div className="flex items-end gap-2 h-64">
            {kpiData.monthlyTrends.map((month, idx) => {
              const maxValue = Math.max(...kpiData.monthlyTrends.map(m => Math.max(m.budget, m.actual)));
              const budgetHeight = (month.budget / maxValue) * 100;
              const actualHeight = (month.actual / maxValue) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex gap-1 items-end justify-center h-48">
                    <div className="flex flex-col items-center w-1/2">
                      <span className="text-xs text-gray-500 mb-1">{formatCurrency(month.budget)}</span>
                      <div
                        className="w-full bg-blue-200 rounded-t"
                        style={{ height: `${budgetHeight}%` }}
                      />
                    </div>
                    <div className="flex flex-col items-center w-1/2">
                      <span className="text-xs text-gray-700 mb-1">{formatCurrency(month.actual)}</span>
                      <div
                        className="w-full bg-blue-600 rounded-t"
                        style={{ height: `${actualHeight}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-medium text-gray-700">{month.month}</p>
                    <p className="text-xs text-gray-500">{month.projects} projects</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-200 rounded" />
              <span className="text-sm text-gray-600">Budget</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded" />
              <span className="text-sm text-gray-600">Actual</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectKPIDashboardPage;
