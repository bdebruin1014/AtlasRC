import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Building2,
  BarChart3,
  Filter,
  Download,
  Eye,
  MoreHorizontal,
  Flag
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ContractorVarianceTrackerPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tradeFilter, setTradeFilter] = useState('all');

  const contractors = [
    {
      id: 1,
      name: 'ABC Construction',
      trade: 'General Contractor',
      activeProjects: 3,
      performance: {
        avgCostVariance: -2.3,
        avgTimeVariance: -5,
        onBudgetRate: 85,
        onTimeRate: 78,
        totalQuoted: 4500000,
        totalActual: 4396500,
        totalVariance: -103500
      },
      projects: [
        {
          projectName: 'Oakwood Estates Phase 1',
          quotedAmount: 1500000,
          actualAmount: 1465000,
          costVariance: -2.3,
          quotedDays: 120,
          actualDays: 115,
          timeVariance: -4.2,
          status: 'completed'
        },
        {
          projectName: 'Oakwood Estates Phase 2',
          quotedAmount: 1800000,
          actualAmount: 1756000,
          costVariance: -2.4,
          quotedDays: 150,
          actualDays: 145,
          timeVariance: -3.3,
          status: 'in_progress'
        },
        {
          projectName: 'Downtown Homes',
          quotedAmount: 1200000,
          actualAmount: 1175500,
          costVariance: -2.0,
          quotedDays: 90,
          actualDays: 88,
          timeVariance: -2.2,
          status: 'in_progress'
        }
      ],
      flag: null
    },
    {
      id: 2,
      name: 'Premier Electric',
      trade: 'Electrical',
      activeProjects: 2,
      performance: {
        avgCostVariance: 5.2,
        avgTimeVariance: 12,
        onBudgetRate: 45,
        onTimeRate: 40,
        totalQuoted: 450000,
        totalActual: 473400,
        totalVariance: 23400
      },
      projects: [
        {
          projectName: 'Oakwood Estates Phase 1',
          quotedAmount: 250000,
          actualAmount: 262500,
          costVariance: 5.0,
          quotedDays: 30,
          actualDays: 35,
          timeVariance: 16.7,
          status: 'completed'
        },
        {
          projectName: 'Oakwood Estates Phase 2',
          quotedAmount: 200000,
          actualAmount: 210900,
          costVariance: 5.5,
          quotedDays: 25,
          actualDays: 27,
          timeVariance: 8.0,
          status: 'in_progress'
        }
      ],
      flag: 'over_budget'
    },
    {
      id: 3,
      name: 'Smith Plumbing Co',
      trade: 'Plumbing',
      activeProjects: 2,
      performance: {
        avgCostVariance: 8.5,
        avgTimeVariance: 20,
        onBudgetRate: 30,
        onTimeRate: 25,
        totalQuoted: 380000,
        totalActual: 412300,
        totalVariance: 32300
      },
      projects: [
        {
          projectName: 'Oakwood Estates Phase 1',
          quotedAmount: 180000,
          actualAmount: 196200,
          costVariance: 9.0,
          quotedDays: 20,
          actualDays: 25,
          timeVariance: 25.0,
          status: 'completed'
        },
        {
          projectName: 'Downtown Homes',
          quotedAmount: 200000,
          actualAmount: 216100,
          costVariance: 8.1,
          quotedDays: 25,
          actualDays: 29,
          timeVariance: 16.0,
          status: 'in_progress'
        }
      ],
      flag: 'critical'
    },
    {
      id: 4,
      name: 'Apex Roofing',
      trade: 'Roofing',
      activeProjects: 1,
      performance: {
        avgCostVariance: -1.5,
        avgTimeVariance: 0,
        onBudgetRate: 90,
        onTimeRate: 95,
        totalQuoted: 320000,
        totalActual: 315200,
        totalVariance: -4800
      },
      projects: [
        {
          projectName: 'Downtown Homes',
          quotedAmount: 320000,
          actualAmount: 315200,
          costVariance: -1.5,
          quotedDays: 15,
          actualDays: 15,
          timeVariance: 0,
          status: 'completed'
        }
      ],
      flag: null
    },
    {
      id: 5,
      name: 'Quality HVAC',
      trade: 'HVAC',
      activeProjects: 2,
      performance: {
        avgCostVariance: 3.2,
        avgTimeVariance: 8,
        onBudgetRate: 60,
        onTimeRate: 55,
        totalQuoted: 520000,
        totalActual: 536640,
        totalVariance: 16640
      },
      projects: [
        {
          projectName: 'Oakwood Estates Phase 2',
          quotedAmount: 280000,
          actualAmount: 291200,
          costVariance: 4.0,
          quotedDays: 35,
          actualDays: 38,
          timeVariance: 8.6,
          status: 'in_progress'
        },
        {
          projectName: 'Downtown Homes',
          quotedAmount: 240000,
          actualAmount: 245440,
          costVariance: 2.3,
          quotedDays: 30,
          actualDays: 32,
          timeVariance: 6.7,
          status: 'in_progress'
        }
      ],
      flag: 'watch'
    },
    {
      id: 6,
      name: 'Foundation Experts',
      trade: 'Foundation',
      activeProjects: 1,
      performance: {
        avgCostVariance: 0.5,
        avgTimeVariance: -2,
        onBudgetRate: 88,
        onTimeRate: 92,
        totalQuoted: 650000,
        totalActual: 653250,
        totalVariance: 3250
      },
      projects: [
        {
          projectName: 'Oakwood Estates Phase 2',
          quotedAmount: 650000,
          actualAmount: 653250,
          costVariance: 0.5,
          quotedDays: 45,
          actualDays: 44,
          timeVariance: -2.2,
          status: 'completed'
        }
      ],
      flag: null
    }
  ];

  const projects = ['Oakwood Estates Phase 1', 'Oakwood Estates Phase 2', 'Downtown Homes'];
  const trades = ['General Contractor', 'Electrical', 'Plumbing', 'HVAC', 'Roofing', 'Foundation'];

  const filteredContractors = useMemo(() => {
    return contractors.filter(contractor => {
      const matchesSearch = !searchQuery ||
        contractor.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTrade = tradeFilter === 'all' || contractor.trade === tradeFilter;
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'flagged' && contractor.flag) ||
        (statusFilter === 'on_track' && !contractor.flag);
      const matchesProject = projectFilter === 'all' ||
        contractor.projects.some(p => p.projectName === projectFilter);
      return matchesSearch && matchesTrade && matchesStatus && matchesProject;
    });
  }, [searchQuery, tradeFilter, statusFilter, projectFilter]);

  const portfolioStats = useMemo(() => {
    const totalQuoted = contractors.reduce((acc, c) => acc + c.performance.totalQuoted, 0);
    const totalActual = contractors.reduce((acc, c) => acc + c.performance.totalActual, 0);
    const flaggedCount = contractors.filter(c => c.flag).length;
    const criticalCount = contractors.filter(c => c.flag === 'critical').length;

    return {
      totalContractors: contractors.length,
      totalQuoted,
      totalActual,
      totalVariance: totalActual - totalQuoted,
      variancePercent: ((totalActual - totalQuoted) / totalQuoted * 100).toFixed(1),
      flaggedCount,
      criticalCount,
      avgOnBudgetRate: Math.round(contractors.reduce((acc, c) => acc + c.performance.onBudgetRate, 0) / contractors.length),
      avgOnTimeRate: Math.round(contractors.reduce((acc, c) => acc + c.performance.onTimeRate, 0) / contractors.length)
    };
  }, []);

  const getCostVarianceColor = (variance) => {
    if (variance <= 0) return 'text-green-600';
    if (variance <= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTimeVarianceColor = (variance) => {
    if (variance <= 0) return 'text-green-600';
    if (variance <= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getFlagBadge = (flag) => {
    switch (flag) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'over_budget': return 'bg-orange-100 text-orange-700';
      case 'watch': return 'bg-yellow-100 text-yellow-700';
      default: return null;
    }
  };

  const getRateColor = (rate) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Contractor Variance Tracker</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contractor Variance Tracker</h1>
          <p className="text-gray-600 mt-2">Auto-track quote vs actual costs and timeline from project data</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Total Contractors</p>
            <p className="text-2xl font-bold">{portfolioStats.totalContractors}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Total Quoted</p>
            <p className="text-2xl font-bold">${(portfolioStats.totalQuoted / 1000000).toFixed(1)}M</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Total Actual</p>
            <p className="text-2xl font-bold">${(portfolioStats.totalActual / 1000000).toFixed(2)}M</p>
          </CardContent>
        </Card>
        <Card className={parseFloat(portfolioStats.variancePercent) > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Portfolio Variance</p>
            <p className={`text-2xl font-bold ${parseFloat(portfolioStats.variancePercent) > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {parseFloat(portfolioStats.variancePercent) > 0 ? '+' : ''}{portfolioStats.variancePercent}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Avg On-Budget</p>
            <p className={`text-2xl font-bold ${getRateColor(portfolioStats.avgOnBudgetRate)}`}>
              {portfolioStats.avgOnBudgetRate}%
            </p>
          </CardContent>
        </Card>
        <Card className={portfolioStats.criticalCount > 0 ? 'border-red-300 bg-red-50' : ''}>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Flagged Issues</p>
            <p className={`text-2xl font-bold ${portfolioStats.criticalCount > 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {portfolioStats.flaggedCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {portfolioStats.criticalCount > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800">Critical Variance Alerts</h3>
                <p className="text-red-700">
                  {portfolioStats.criticalCount} contractor(s) have significant cost or timeline overruns requiring immediate attention.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search contractors..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={tradeFilter} onValueChange={setTradeFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Trade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trades</SelectItem>
                {trades.map(trade => (
                  <SelectItem key={trade} value={trade}>{trade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project} value={project}>{project}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="flagged">Flagged Only</SelectItem>
                <SelectItem value="on_track">On Track</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contractor Cards */}
      <div className="space-y-4">
        {filteredContractors.map((contractor) => (
          <Card key={contractor.id} className={contractor.flag === 'critical' ? 'border-red-200' : contractor.flag ? 'border-yellow-200' : ''}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    contractor.flag === 'critical' ? 'bg-red-100' :
                    contractor.flag ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                    <Building2 className={`w-6 h-6 ${
                      contractor.flag === 'critical' ? 'text-red-600' :
                      contractor.flag ? 'text-yellow-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {contractor.name}
                      {contractor.flag && (
                        <Badge className={getFlagBadge(contractor.flag)}>
                          <Flag className="w-3 h-3 mr-1" />
                          {contractor.flag === 'critical' ? 'Critical' :
                           contractor.flag === 'over_budget' ? 'Over Budget' : 'Watch'}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{contractor.trade} • {contractor.activeProjects} active project(s)</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      View Full History
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Performance Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              {/* Summary Stats */}
              <div className="grid grid-cols-6 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className={`text-xl font-bold ${getCostVarianceColor(contractor.performance.avgCostVariance)}`}>
                    {contractor.performance.avgCostVariance > 0 ? '+' : ''}{contractor.performance.avgCostVariance}%
                  </p>
                  <p className="text-xs text-gray-500">Avg Cost Var.</p>
                </div>
                <div className="text-center">
                  <p className={`text-xl font-bold ${getTimeVarianceColor(contractor.performance.avgTimeVariance)}`}>
                    {contractor.performance.avgTimeVariance > 0 ? '+' : ''}{contractor.performance.avgTimeVariance}%
                  </p>
                  <p className="text-xs text-gray-500">Avg Time Var.</p>
                </div>
                <div className="text-center">
                  <p className={`text-xl font-bold ${getRateColor(contractor.performance.onBudgetRate)}`}>
                    {contractor.performance.onBudgetRate}%
                  </p>
                  <p className="text-xs text-gray-500">On Budget</p>
                </div>
                <div className="text-center">
                  <p className={`text-xl font-bold ${getRateColor(contractor.performance.onTimeRate)}`}>
                    {contractor.performance.onTimeRate}%
                  </p>
                  <p className="text-xs text-gray-500">On Time</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">${(contractor.performance.totalQuoted / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-gray-500">Total Quoted</p>
                </div>
                <div className="text-center">
                  <p className={`text-xl font-bold ${contractor.performance.totalVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {contractor.performance.totalVariance > 0 ? '+' : ''}${(contractor.performance.totalVariance / 1000).toFixed(0)}K
                  </p>
                  <p className="text-xs text-gray-500">Total Variance</p>
                </div>
              </div>

              {/* Project Details */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Quoted</TableHead>
                    <TableHead>Actual</TableHead>
                    <TableHead>Cost Variance</TableHead>
                    <TableHead>Days Quoted</TableHead>
                    <TableHead>Days Actual</TableHead>
                    <TableHead>Time Variance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contractor.projects.map((project, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{project.projectName}</TableCell>
                      <TableCell>${project.quotedAmount.toLocaleString()}</TableCell>
                      <TableCell>${project.actualAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`flex items-center gap-1 ${getCostVarianceColor(project.costVariance)}`}>
                          {project.costVariance > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {project.costVariance > 0 ? '+' : ''}{project.costVariance}%
                        </span>
                      </TableCell>
                      <TableCell>{project.quotedDays}</TableCell>
                      <TableCell>{project.actualDays}</TableCell>
                      <TableCell>
                        <span className={`flex items-center gap-1 ${getTimeVarianceColor(project.timeVariance)}`}>
                          {project.timeVariance > 0 ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          {project.timeVariance > 0 ? '+' : ''}{project.timeVariance}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={project.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                          {project.status === 'completed' ? 'Completed' : 'In Progress'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ContractorVarianceTrackerPage;
