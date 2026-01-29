import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building2,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  BarChart3,
  PieChart,
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';

// Mock portfolio data
const portfolioData = {
  summary: {
    totalProjects: 24,
    activeProjects: 18,
    totalValue: 285000000,
    totalEquity: 85000000,
    totalDebt: 200000000,
    projectedProfit: 42000000,
    avgIRR: 22.5,
    avgEquityMultiple: 1.85,
    cashOnCash: 14.2
  },
  byStatus: {
    'Acquisition': { count: 3, value: 25000000 },
    'Due Diligence': { count: 2, value: 18000000 },
    'Development': { count: 8, value: 145000000 },
    'Stabilization': { count: 5, value: 62000000 },
    'Disposition': { count: 4, value: 28000000 },
    'Completed': { count: 2, value: 7000000 }
  },
  byType: {
    'Multifamily': { count: 8, value: 120000000 },
    'Land Development': { count: 5, value: 85000000 },
    'Single Family': { count: 6, value: 45000000 },
    'Mixed Use': { count: 3, value: 25000000 },
    'Industrial': { count: 2, value: 10000000 }
  },
  byRegion: {
    'Southeast': { count: 10, value: 125000000 },
    'Southwest': { count: 6, value: 80000000 },
    'Midwest': { count: 5, value: 55000000 },
    'Northeast': { count: 3, value: 25000000 }
  },
  projects: [
    {
      id: 1,
      name: 'Riverside Apartments',
      type: 'Multifamily',
      status: 'Development',
      location: 'Austin, TX',
      totalBudget: 45000000,
      equityInvested: 12000000,
      spentToDate: 28000000,
      projectedValue: 58000000,
      projectedProfit: 13000000,
      irr: 24.5,
      equityMultiple: 2.08,
      completion: 62,
      onBudget: true,
      onSchedule: true,
      keyMetrics: { units: 280, avgRent: 1850 }
    },
    {
      id: 2,
      name: 'Sunset Land Development',
      type: 'Land Development',
      status: 'Development',
      location: 'Phoenix, AZ',
      totalBudget: 38000000,
      equityInvested: 11000000,
      spentToDate: 22000000,
      projectedValue: 52000000,
      projectedProfit: 14000000,
      irr: 28.2,
      equityMultiple: 2.27,
      completion: 45,
      onBudget: true,
      onSchedule: false,
      keyMetrics: { lots: 300, avgPrice: 175000 }
    },
    {
      id: 3,
      name: 'Harbor View Homes',
      type: 'Single Family',
      status: 'Disposition',
      location: 'Tampa, FL',
      totalBudget: 8500000,
      equityInvested: 2500000,
      spentToDate: 7800000,
      projectedValue: 11200000,
      projectedProfit: 2700000,
      irr: 32.1,
      equityMultiple: 2.08,
      completion: 92,
      onBudget: true,
      onSchedule: true,
      keyMetrics: { homes: 12, avgPrice: 925000 }
    },
    {
      id: 4,
      name: 'Downtown Mixed Use',
      type: 'Mixed Use',
      status: 'Stabilization',
      location: 'Nashville, TN',
      totalBudget: 25000000,
      equityInvested: 7500000,
      spentToDate: 24200000,
      projectedValue: 32000000,
      projectedProfit: 7000000,
      irr: 18.5,
      equityMultiple: 1.93,
      completion: 97,
      onBudget: false,
      onSchedule: true,
      keyMetrics: { retail: '15,000 SF', residential: 48 }
    },
    {
      id: 5,
      name: 'Oak Street Industrial',
      type: 'Industrial',
      status: 'Acquisition',
      location: 'Atlanta, GA',
      totalBudget: 12000000,
      equityInvested: 3600000,
      spentToDate: 800000,
      projectedValue: 16500000,
      projectedProfit: 4500000,
      irr: 21.0,
      equityMultiple: 2.25,
      completion: 7,
      onBudget: true,
      onSchedule: true,
      keyMetrics: { sf: 85000, noi: 1100000 }
    },
    {
      id: 6,
      name: 'Meadow Creek Phase II',
      type: 'Land Development',
      status: 'Development',
      location: 'Dallas, TX',
      totalBudget: 28000000,
      equityInvested: 8400000,
      spentToDate: 15000000,
      projectedValue: 38000000,
      projectedProfit: 10000000,
      irr: 25.8,
      equityMultiple: 2.19,
      completion: 54,
      onBudget: true,
      onSchedule: true,
      keyMetrics: { lots: 180, avgPrice: 210000 }
    }
  ],
  alerts: [
    { id: 1, project: 'Sunset Land Development', type: 'Schedule', message: '3 weeks behind due to permitting delays', severity: 'warning' },
    { id: 2, project: 'Downtown Mixed Use', type: 'Budget', message: '3.2% over budget on construction costs', severity: 'warning' },
    { id: 3, project: 'Riverside Apartments', type: 'Milestone', message: 'Vertical construction 50% complete', severity: 'info' },
    { id: 4, project: 'Harbor View Homes', type: 'Sales', message: '10 of 12 units sold, 2 under contract', severity: 'success' }
  ],
  upcomingMilestones: [
    { project: 'Riverside Apartments', milestone: 'Topping out ceremony', date: '2024-02-15' },
    { project: 'Sunset Land Development', milestone: 'Phase 1 lot release (75 lots)', date: '2024-02-28' },
    { project: 'Oak Street Industrial', milestone: 'Closing', date: '2024-01-30' },
    { project: 'Harbor View Homes', milestone: 'Final unit closing', date: '2024-02-10' }
  ]
};

export default function PortfolioExecutiveSummaryPage() {
  const [dateRange, setDateRange] = useState('ytd');
  const [selectedView, setSelectedView] = useState('summary');

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'Acquisition': 'bg-blue-100 text-blue-800',
      'Due Diligence': 'bg-purple-100 text-purple-800',
      'Development': 'bg-yellow-100 text-yellow-800',
      'Stabilization': 'bg-orange-100 text-orange-800',
      'Disposition': 'bg-green-100 text-green-800',
      'Completed': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'warning': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'success': 'bg-green-100 text-green-800 border-green-200',
      'info': 'bg-blue-100 text-blue-800 border-blue-200',
      'error': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Executive Summary</h1>
          <p className="text-muted-foreground">High-level overview of your real estate portfolio</p>
        </div>
        <div className="flex gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mtd">Month to Date</SelectItem>
              <SelectItem value="qtd">Quarter to Date</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(portfolioData.summary.totalValue)}</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              12.5% from last quarter
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equity Invested</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(portfolioData.summary.totalEquity)}</div>
            <p className="text-xs text-muted-foreground">
              {((portfolioData.summary.totalEquity / portfolioData.summary.totalValue) * 100).toFixed(1)}% of total value
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(portfolioData.summary.projectedProfit)}</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              8.2% above projections
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioData.summary.activeProjects}</div>
            <p className="text-xs text-muted-foreground">of {portfolioData.summary.totalProjects} total</p>
          </CardContent>
        </Card>
      </div>

      {/* Return Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Portfolio IRR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-green-600">{portfolioData.summary.avgIRR}%</div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Target: 20%</div>
                <Badge className="bg-green-100 text-green-800">Above Target</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Equity Multiple</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-green-600">{portfolioData.summary.avgEquityMultiple}x</div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Target: 1.8x</div>
                <Badge className="bg-green-100 text-green-800">Above Target</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cash-on-Cash Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-green-600">{portfolioData.summary.cashOnCash}%</div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Target: 12%</div>
                <Badge className="bg-green-100 text-green-800">Above Target</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">By Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(portfolioData.byStatus).map(([status, data]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(status)}>{status}</Badge>
                  <span className="text-sm text-muted-foreground">({data.count})</span>
                </div>
                <span className="font-medium">{formatCurrency(data.value)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">By Property Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(portfolioData.byType).map(([type, data]) => (
              <div key={type}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{type}</span>
                  <span className="font-medium">{formatCurrency(data.value)}</span>
                </div>
                <Progress value={(data.value / portfolioData.summary.totalValue) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">By Region</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(portfolioData.byRegion).map(([region, data]) => (
              <div key={region}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{region}</span>
                  <span className="font-medium">{formatCurrency(data.value)}</span>
                </div>
                <Progress value={(data.value / portfolioData.summary.totalValue) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Milestones */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {portfolioData.alerts.map(alert => (
              <div key={alert.id} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{alert.project}</div>
                    <div className="text-sm">{alert.message}</div>
                  </div>
                  <Badge variant="outline">{alert.type}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Milestones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {portfolioData.upcomingMilestones.map((milestone, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <div className="font-medium">{milestone.project}</div>
                  <div className="text-sm text-muted-foreground">{milestone.milestone}</div>
                </div>
                <div className="text-sm font-medium">{milestone.date}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Project Details Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Project Performance Summary</CardTitle>
          <CardDescription>Key metrics for all active projects</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Completion</TableHead>
                <TableHead>Proj. IRR</TableHead>
                <TableHead>Equity Mult.</TableHead>
                <TableHead>Health</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {portfolioData.projects.map(project => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div className="font-medium">{project.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {project.location}
                    </div>
                  </TableCell>
                  <TableCell>{project.type}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(project.totalBudget)}</TableCell>
                  <TableCell>{formatCurrency(project.spentToDate)}</TableCell>
                  <TableCell>
                    <div className="w-20">
                      <div className="text-xs mb-1">{project.completion}%</div>
                      <Progress value={project.completion} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-green-600">{project.irr}%</TableCell>
                  <TableCell className="font-medium">{project.equityMultiple}x</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {project.onBudget ? (
                        <Badge className="bg-green-100 text-green-800 text-xs">On Budget</Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">Over Budget</Badge>
                      )}
                      {project.onSchedule ? (
                        <Badge className="bg-green-100 text-green-800 text-xs">On Time</Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">Delayed</Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Capital Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Portfolio Capital Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-32 font-medium">Total Debt</div>
              <div className="flex-1">
                <Progress value={(portfolioData.summary.totalDebt / portfolioData.summary.totalValue) * 100} className="h-4" />
              </div>
              <div className="w-24 text-right font-medium">{formatCurrency(portfolioData.summary.totalDebt)}</div>
              <div className="w-16 text-right text-muted-foreground">
                {((portfolioData.summary.totalDebt / portfolioData.summary.totalValue) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 font-medium">Total Equity</div>
              <div className="flex-1">
                <Progress value={(portfolioData.summary.totalEquity / portfolioData.summary.totalValue) * 100} className="h-4 [&>div]:bg-green-500" />
              </div>
              <div className="w-24 text-right font-medium">{formatCurrency(portfolioData.summary.totalEquity)}</div>
              <div className="w-16 text-right text-muted-foreground">
                {((portfolioData.summary.totalEquity / portfolioData.summary.totalValue) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="pt-4 border-t flex justify-between text-sm">
              <span className="text-muted-foreground">Weighted Average LTV:</span>
              <span className="font-medium">70.2%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
