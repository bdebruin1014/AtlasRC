// src/pages/ExecutiveDashboard.jsx
// Executive-level portfolio dashboard with comprehensive KPIs and project health

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  Building2, DollarSign, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle, Clock, PieChart, BarChart3, ArrowUpRight, ArrowDownRight,
  ChevronRight, Target, Landmark, Users, FileText, Activity,
  AlertCircle, ArrowRight, Calendar, Filter, Download, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, LineChart, Line, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Area,
} from 'recharts';
import { cn } from '@/lib/utils';

// ============================================
// DEMO DATA - Portfolio Overview
// ============================================

const PORTFOLIO_METRICS = {
  totalProjects: 12,
  activeProjects: 8,
  totalProjectValue: 125000000,
  equityDeployed: 38500000,
  totalDebt: 86500000,
  weightedAvgIRR: 0.182,
  portfolioLTV: 0.692,
  cashPosition: 4850000,
  monthlyBurnRate: 285000,
  runwayMonths: 17,
};

const PROJECT_STATUS_DATA = [
  { name: 'On Track', value: 5, color: '#10B981' },
  { name: 'At Risk', value: 2, color: '#F59E0B' },
  { name: 'Delayed', value: 1, color: '#EF4444' },
  { name: 'Completed', value: 4, color: '#6B7280' },
];

const PROJECTS_HEALTH = [
  {
    id: 'proj-1',
    name: 'Highland Park Townhomes',
    type: 'Residential',
    status: 'on_track',
    budgetSpent: 2850000,
    budgetTotal: 3200000,
    budgetPercent: 89,
    schedulePercent: 75,
    daysRemaining: 45,
    irr: 0.21,
    alerts: 0,
  },
  {
    id: 'proj-2',
    name: 'Riverside Commercial',
    type: 'Commercial',
    status: 'at_risk',
    budgetSpent: 5200000,
    budgetTotal: 4800000,
    budgetPercent: 108,
    schedulePercent: 62,
    daysRemaining: 120,
    irr: 0.14,
    alerts: 3,
  },
  {
    id: 'proj-3',
    name: 'Downtown Mixed Use',
    type: 'Mixed-Use',
    status: 'on_track',
    budgetSpent: 8500000,
    budgetTotal: 12000000,
    budgetPercent: 71,
    schedulePercent: 68,
    daysRemaining: 180,
    irr: 0.19,
    alerts: 1,
  },
  {
    id: 'proj-4',
    name: 'Oak Street Renovation',
    type: 'Residential',
    status: 'delayed',
    budgetSpent: 1200000,
    budgetTotal: 1800000,
    budgetPercent: 67,
    schedulePercent: 35,
    daysRemaining: 90,
    irr: 0.12,
    alerts: 5,
  },
  {
    id: 'proj-5',
    name: 'Elm Court Apartments',
    type: 'Multifamily',
    status: 'on_track',
    budgetSpent: 15200000,
    budgetTotal: 18500000,
    budgetPercent: 82,
    schedulePercent: 85,
    daysRemaining: 60,
    irr: 0.23,
    alerts: 0,
  },
];

const CASH_FLOW_FORECAST = [
  { month: 'Jan', inflows: 850000, outflows: 620000, net: 230000, cumulative: 4850000 },
  { month: 'Feb', inflows: 420000, outflows: 580000, net: -160000, cumulative: 4690000 },
  { month: 'Mar', inflows: 1200000, outflows: 750000, net: 450000, cumulative: 5140000 },
  { month: 'Apr', inflows: 380000, outflows: 680000, net: -300000, cumulative: 4840000 },
  { month: 'May', inflows: 950000, outflows: 520000, net: 430000, cumulative: 5270000 },
  { month: 'Jun', inflows: 2100000, outflows: 890000, net: 1210000, cumulative: 6480000 },
];

const BUDGET_HEALTH_SUMMARY = [
  { category: 'Land Acquisition', budgeted: 28500000, spent: 26800000, variance: -1700000 },
  { category: 'Hard Costs', budgeted: 72000000, spent: 58500000, variance: -13500000 },
  { category: 'Soft Costs', budgeted: 12500000, spent: 11200000, variance: -1300000 },
  { category: 'Financing Costs', budgeted: 8500000, spent: 7800000, variance: -700000 },
  { category: 'Contingency', budgeted: 3500000, spent: 850000, variance: -2650000 },
];

const RECENT_ALERTS = [
  { id: 1, type: 'budget', priority: 'high', message: 'Riverside Commercial over budget by $400K', project: 'Riverside Commercial', time: '2h ago' },
  { id: 2, type: 'schedule', priority: 'urgent', message: 'Oak Street 15 days behind schedule', project: 'Oak Street Renovation', time: '4h ago' },
  { id: 3, type: 'permit', priority: 'high', message: 'Building permit expires in 12 days', project: 'Downtown Mixed Use', time: '1d ago' },
  { id: 4, type: 'draw', priority: 'normal', message: 'Draw Request #7 pending approval', project: 'Elm Court Apartments', time: '1d ago' },
];

const INVESTOR_SUMMARY = {
  totalLPEquity: 34650000,
  totalGPEquity: 3850000,
  averageLPIRR: 0.178,
  averageGPIRR: 0.285,
  distributionsPaid: 4200000,
  upcomingDistributions: 850000,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatCurrency = (value, compact = false) => {
  if (compact && Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (compact && Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercent = (value, decimals = 1) => `${(value * 100).toFixed(decimals)}%`;

const getStatusColor = (status) => {
  switch (status) {
    case 'on_track':
      return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    case 'at_risk':
      return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'delayed':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'completed':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'on_track':
      return 'On Track';
    case 'at_risk':
      return 'At Risk';
    case 'delayed':
      return 'Delayed';
    case 'completed':
      return 'Completed';
    default:
      return status;
  }
};

// ============================================
// COMPONENTS
// ============================================

function MetricCard({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'emerald', onClick }) {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    red: 'bg-red-50 text-red-600 border-red-200',
  };

  return (
    <Card
      className={cn('hover:shadow-md transition-shadow', onClick && 'cursor-pointer')}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className={cn('p-2 rounded-lg border', colorClasses[color])}>
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded',
                trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'
              )}
            >
              {trend === 'up' ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {trendValue}
            </div>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500 mt-0.5">{title}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectHealthRow({ project, onClick }) {
  const budgetHealth = project.budgetPercent <= 90 ? 'good' : project.budgetPercent <= 100 ? 'warning' : 'critical';
  const scheduleHealth = project.schedulePercent >= 80 ? 'good' : project.schedulePercent >= 60 ? 'warning' : 'critical';

  return (
    <div
      className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900 truncate">{project.name}</p>
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full border font-medium',
              getStatusColor(project.status)
            )}
          >
            {getStatusLabel(project.status)}
          </span>
          {project.alerts > 0 && (
            <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
              <AlertCircle className="h-3 w-3" />
              {project.alerts}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{project.type}</p>
      </div>

      {/* Budget Progress */}
      <div className="w-32">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">Budget</span>
          <span
            className={cn(
              'font-medium',
              budgetHealth === 'good'
                ? 'text-emerald-600'
                : budgetHealth === 'warning'
                ? 'text-amber-600'
                : 'text-red-600'
            )}
          >
            {project.budgetPercent}%
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              budgetHealth === 'good'
                ? 'bg-emerald-500'
                : budgetHealth === 'warning'
                ? 'bg-amber-500'
                : 'bg-red-500'
            )}
            style={{ width: `${Math.min(project.budgetPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Schedule Progress */}
      <div className="w-32">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">Schedule</span>
          <span
            className={cn(
              'font-medium',
              scheduleHealth === 'good'
                ? 'text-emerald-600'
                : scheduleHealth === 'warning'
                ? 'text-amber-600'
                : 'text-red-600'
            )}
          >
            {project.schedulePercent}%
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              scheduleHealth === 'good'
                ? 'bg-emerald-500'
                : scheduleHealth === 'warning'
                ? 'bg-amber-500'
                : 'bg-red-500'
            )}
            style={{ width: `${project.schedulePercent}%` }}
          />
        </div>
      </div>

      {/* IRR */}
      <div className="w-20 text-right">
        <p className="text-sm font-medium text-gray-900">{formatPercent(project.irr)}</p>
        <p className="text-xs text-gray-500">IRR</p>
      </div>

      {/* Days Remaining */}
      <div className="w-20 text-right">
        <p className="text-sm font-medium text-gray-900">{project.daysRemaining}</p>
        <p className="text-xs text-gray-500">days left</p>
      </div>

      <ChevronRight className="h-4 w-4 text-gray-400" />
    </div>
  );
}

function AlertItem({ alert }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'budget':
        return DollarSign;
      case 'schedule':
        return Clock;
      case 'permit':
        return FileText;
      case 'draw':
        return Landmark;
      default:
        return AlertTriangle;
    }
  };

  const Icon = getTypeIcon(alert.type);

  return (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
      <div className={cn('p-2 rounded-lg border', getPriorityColor(alert.priority))}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{alert.message}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">{alert.project}</span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-400">{alert.time}</span>
        </div>
      </div>
      <span
        className={cn(
          'text-xs px-2 py-0.5 rounded-full border font-medium capitalize',
          getPriorityColor(alert.priority)
        )}
      >
        {alert.priority}
      </span>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ExecutiveDashboard() {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('month');

  return (
    <>
      <Helmet>
        <title>Executive Dashboard | Atlas</title>
      </Helmet>

      <div className="flex flex-col h-full w-full bg-[#EDF2F7] overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-5 sticky top-0 z-10">
          <div className="max-w-[1800px] mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Executive Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Portfolio-wide performance and project health</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {['week', 'month', 'quarter', 'year'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize',
                      timeframe === tf
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    )}
                  >
                    {tf}
                  </button>
                ))}
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="max-w-[1800px] mx-auto space-y-6">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <MetricCard
                title="Active Projects"
                value={PORTFOLIO_METRICS.activeProjects}
                subtitle={`${PORTFOLIO_METRICS.totalProjects} total`}
                icon={Building2}
                color="blue"
                onClick={() => navigate('/projects')}
              />
              <MetricCard
                title="Portfolio Value"
                value={formatCurrency(PORTFOLIO_METRICS.totalProjectValue, true)}
                subtitle="Total development cost"
                icon={DollarSign}
                trend="up"
                trendValue="8.2%"
                color="emerald"
              />
              <MetricCard
                title="Equity Deployed"
                value={formatCurrency(PORTFOLIO_METRICS.equityDeployed, true)}
                subtitle={`LTV: ${formatPercent(PORTFOLIO_METRICS.portfolioLTV)}`}
                icon={Landmark}
                color="purple"
              />
              <MetricCard
                title="Weighted Avg IRR"
                value={formatPercent(PORTFOLIO_METRICS.weightedAvgIRR)}
                subtitle="Across active projects"
                icon={TrendingUp}
                trend="up"
                trendValue="2.1%"
                color="emerald"
              />
              <MetricCard
                title="Cash Position"
                value={formatCurrency(PORTFOLIO_METRICS.cashPosition, true)}
                subtitle={`${PORTFOLIO_METRICS.runwayMonths} mo runway`}
                icon={PieChart}
                color="blue"
                onClick={() => navigate('/accounting/dashboard')}
              />
              <MetricCard
                title="Total Debt"
                value={formatCurrency(PORTFOLIO_METRICS.totalDebt, true)}
                subtitle="Outstanding balance"
                icon={Landmark}
                color="amber"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Project Health - Takes 2 columns */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold">Project Health</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
                        View All <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {/* Status Summary */}
                    <div className="flex items-center gap-6 px-6 py-3 border-b bg-gray-50">
                      {PROJECT_STATUS_DATA.map((status) => (
                        <div key={status.name} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: status.color }}
                          />
                          <span className="text-sm text-gray-600">{status.name}</span>
                          <span className="text-sm font-semibold text-gray-900">{status.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Project List */}
                    <div className="divide-y">
                      {PROJECTS_HEALTH.map((project) => (
                        <ProjectHealthRow
                          key={project.id}
                          project={project}
                          onClick={() => navigate(`/projects/${project.id}`)}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Alerts & Notifications */}
              <div>
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        Active Alerts
                        <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium">
                          {RECENT_ALERTS.length}
                        </span>
                      </CardTitle>
                      <Button variant="ghost" size="sm">
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {RECENT_ALERTS.map((alert) => (
                        <AlertItem key={alert.id} alert={alert} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cash Flow Forecast */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Cash Flow Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={CASH_FLOW_FORECAST}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis
                          tickFormatter={(v) => formatCurrency(v, true)}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                          formatter={(v) => formatCurrency(v)}
                          labelStyle={{ fontWeight: 'bold' }}
                        />
                        <Legend />
                        <Bar dataKey="inflows" name="Inflows" fill="#10B981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="outflows" name="Outflows" fill="#EF4444" radius={[4, 4, 0, 0]} />
                        <Line
                          type="monotone"
                          dataKey="cumulative"
                          name="Cumulative"
                          stroke="#3B82F6"
                          strokeWidth={2}
                          dot={false}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Budget Health by Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Budget Health by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {BUDGET_HEALTH_SUMMARY.map((cat) => {
                      const spentPercent = (cat.spent / cat.budgeted) * 100;
                      const isOver = spentPercent > 100;

                      return (
                        <div key={cat.category}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                            <span className="text-sm text-gray-500">
                              {formatCurrency(cat.spent, true)} / {formatCurrency(cat.budgeted, true)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all',
                                  isOver ? 'bg-red-500' : spentPercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                                )}
                                style={{ width: `${Math.min(spentPercent, 100)}%` }}
                              />
                            </div>
                            <span
                              className={cn(
                                'text-xs font-medium w-12 text-right',
                                isOver ? 'text-red-600' : 'text-gray-600'
                              )}
                            >
                              {spentPercent.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Investor Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Investor Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-900">
                      {formatCurrency(INVESTOR_SUMMARY.totalLPEquity, true)}
                    </p>
                    <p className="text-sm text-blue-600 mt-1">LP Equity</p>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <p className="text-2xl font-bold text-emerald-900">
                      {formatCurrency(INVESTOR_SUMMARY.totalGPEquity, true)}
                    </p>
                    <p className="text-sm text-emerald-600 mt-1">GP Equity</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-900">
                      {formatPercent(INVESTOR_SUMMARY.averageLPIRR)}
                    </p>
                    <p className="text-sm text-blue-600 mt-1">Avg LP IRR</p>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <p className="text-2xl font-bold text-emerald-900">
                      {formatPercent(INVESTOR_SUMMARY.averageGPIRR)}
                    </p>
                    <p className="text-sm text-emerald-600 mt-1">Avg GP IRR</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(INVESTOR_SUMMARY.distributionsPaid, true)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Distributions Paid</p>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <p className="text-2xl font-bold text-amber-900">
                      {formatCurrency(INVESTOR_SUMMARY.upcomingDistributions, true)}
                    </p>
                    <p className="text-sm text-amber-600 mt-1">Upcoming</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
