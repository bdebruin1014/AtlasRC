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
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  AlertTriangle,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock pro forma vs actuals data by project
const projectData = {
  'Riverside Apartments': {
    summary: {
      totalProFormaBudget: 45000000,
      totalActualToDate: 28500000,
      projectedTotal: 46200000,
      variance: 1200000,
      variancePercent: 2.7,
      completionPercent: 62
    },
    categories: [
      {
        name: 'Land Acquisition',
        proForma: 12000000,
        actual: 12000000,
        committed: 0,
        projected: 12000000,
        variance: 0,
        variancePercent: 0,
        status: 'On Budget'
      },
      {
        name: 'Site Work',
        proForma: 3200000,
        actual: 2850000,
        committed: 485000,
        projected: 3400000,
        variance: 200000,
        variancePercent: 6.3,
        status: 'Over Budget'
      },
      {
        name: 'Concrete & Foundation',
        proForma: 5500000,
        actual: 5200000,
        committed: 450000,
        projected: 5700000,
        variance: 200000,
        variancePercent: 3.6,
        status: 'Over Budget'
      },
      {
        name: 'Structural Steel',
        proForma: 4200000,
        actual: 3100000,
        committed: 1050000,
        projected: 4150000,
        variance: -50000,
        variancePercent: -1.2,
        status: 'Under Budget'
      },
      {
        name: 'MEP Systems',
        proForma: 8500000,
        actual: 2800000,
        committed: 3200000,
        projected: 8800000,
        variance: 300000,
        variancePercent: 3.5,
        status: 'Over Budget'
      },
      {
        name: 'Interior Finishes',
        proForma: 6200000,
        actual: 850000,
        committed: 2100000,
        projected: 6400000,
        variance: 200000,
        variancePercent: 3.2,
        status: 'Over Budget'
      },
      {
        name: 'Soft Costs',
        proForma: 3500000,
        actual: 1450000,
        committed: 800000,
        projected: 3600000,
        variance: 100000,
        variancePercent: 2.9,
        status: 'Over Budget'
      },
      {
        name: 'Contingency',
        proForma: 1900000,
        actual: 250000,
        committed: 0,
        projected: 2150000,
        variance: 250000,
        variancePercent: 13.2,
        status: 'Over Budget'
      }
    ],
    timeline: [
      { month: 'Jul 2023', proForma: 12500000, actual: 12500000, cumProForma: 12500000, cumActual: 12500000 },
      { month: 'Aug 2023', proForma: 1800000, actual: 1650000, cumProForma: 14300000, cumActual: 14150000 },
      { month: 'Sep 2023', proForma: 2200000, actual: 2450000, cumProForma: 16500000, cumActual: 16600000 },
      { month: 'Oct 2023', proForma: 2500000, actual: 2700000, cumProForma: 19000000, cumActual: 19300000 },
      { month: 'Nov 2023', proForma: 2800000, actual: 2950000, cumProForma: 21800000, cumActual: 22250000 },
      { month: 'Dec 2023', proForma: 3000000, actual: 2850000, cumProForma: 24800000, cumActual: 25100000 },
      { month: 'Jan 2024', proForma: 3200000, actual: 3400000, cumProForma: 28000000, cumActual: 28500000 }
    ]
  },
  'Sunset Land Development': {
    summary: {
      totalProFormaBudget: 38000000,
      totalActualToDate: 22000000,
      projectedTotal: 37850000,
      variance: -150000,
      variancePercent: -0.4,
      completionPercent: 45
    },
    categories: [
      {
        name: 'Land Acquisition',
        proForma: 8500000,
        actual: 8500000,
        committed: 0,
        projected: 8500000,
        variance: 0,
        variancePercent: 0,
        status: 'On Budget'
      },
      {
        name: 'Entitlements',
        proForma: 1200000,
        actual: 1150000,
        committed: 100000,
        projected: 1250000,
        variance: 50000,
        variancePercent: 4.2,
        status: 'Over Budget'
      },
      {
        name: 'Infrastructure - Phase 1',
        proForma: 8500000,
        actual: 6200000,
        committed: 2100000,
        projected: 8300000,
        variance: -200000,
        variancePercent: -2.4,
        status: 'Under Budget'
      },
      {
        name: 'Infrastructure - Phase 2',
        proForma: 7200000,
        actual: 0,
        committed: 0,
        projected: 7200000,
        variance: 0,
        variancePercent: 0,
        status: 'Not Started'
      },
      {
        name: 'Engineering & Design',
        proForma: 2800000,
        actual: 2400000,
        committed: 450000,
        projected: 2850000,
        variance: 50000,
        variancePercent: 1.8,
        status: 'Over Budget'
      },
      {
        name: 'Soft Costs',
        proForma: 2500000,
        actual: 1850000,
        committed: 400000,
        projected: 2450000,
        variance: -50000,
        variancePercent: -2.0,
        status: 'Under Budget'
      },
      {
        name: 'Contingency',
        proForma: 1800000,
        actual: 150000,
        committed: 0,
        projected: 1800000,
        variance: 0,
        variancePercent: 0,
        status: 'On Budget'
      }
    ],
    timeline: []
  }
};

const projects = Object.keys(projectData);

export default function ProFormaVsActualsPage() {
  const [selectedProject, setSelectedProject] = useState('Riverside Apartments');
  const { toast } = useToast();

  const data = projectData[selectedProject];

  const formatCurrency = (value) => {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'On Budget': 'bg-green-100 text-green-800',
      'Under Budget': 'bg-blue-100 text-blue-800',
      'Over Budget': 'bg-red-100 text-red-800',
      'Not Started': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getVarianceColor = (variance) => {
    if (variance < 0) return 'text-green-600';
    if (variance > 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pro Forma vs Actuals</h1>
          <p className="text-muted-foreground">Compare budgeted costs against actual expenditures by project</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-56">
              <Building2 className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {projects.map(project => (
                <SelectItem key={project} value={project}>{project}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Project Summary */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pro Forma Budget</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.totalProFormaBudget)}</div>
            <p className="text-xs text-muted-foreground">Original budget</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actual to Date</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.totalActualToDate)}</div>
            <p className="text-xs text-muted-foreground">{data.summary.completionPercent}% complete</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.projectedTotal)}</div>
            <p className="text-xs text-muted-foreground">At completion</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variance</CardTitle>
            {data.summary.variance > 0 ? (
              <ArrowUpRight className="h-4 w-4 text-red-500" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getVarianceColor(data.summary.variance)}`}>
              {data.summary.variance > 0 ? '+' : ''}{formatCurrency(data.summary.variance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.summary.variancePercent > 0 ? '+' : ''}{data.summary.variancePercent}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
            {data.summary.variance <= 0 ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            )}
          </CardHeader>
          <CardContent>
            <Badge className={data.summary.variance <= 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
              {data.summary.variance <= 0 ? 'On/Under Budget' : 'Over Budget'}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">Current projection</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Project Completion</span>
              <span>{data.summary.completionPercent}%</span>
            </div>
            <Progress value={data.summary.completionPercent} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Spent: {formatCurrency(data.summary.totalActualToDate)}</span>
              <span>Budget: {formatCurrency(data.summary.totalProFormaBudget)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
        </TabsList>

        {/* Categories View */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Budget Categories</CardTitle>
              <CardDescription>Detailed breakdown of pro forma vs actual costs</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Pro Forma</TableHead>
                    <TableHead className="text-right">Actual</TableHead>
                    <TableHead className="text-right">Committed</TableHead>
                    <TableHead className="text-right">Projected Total</TableHead>
                    <TableHead className="text-right">Variance</TableHead>
                    <TableHead className="text-right">Var %</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.categories.map((category, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(category.proForma)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(category.actual)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(category.committed)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(category.projected)}</TableCell>
                      <TableCell className={`text-right font-medium ${getVarianceColor(category.variance)}`}>
                        {category.variance > 0 ? '+' : ''}{formatCurrency(category.variance)}
                      </TableCell>
                      <TableCell className={`text-right ${getVarianceColor(category.variancePercent)}`}>
                        {category.variancePercent > 0 ? '+' : ''}{category.variancePercent}%
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(category.status)}>{category.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Totals Row */}
                  <TableRow className="bg-muted font-bold">
                    <TableCell>TOTAL</TableCell>
                    <TableCell className="text-right">{formatCurrency(data.summary.totalProFormaBudget)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(data.summary.totalActualToDate)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(data.categories.reduce((sum, c) => sum + c.committed, 0))}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(data.summary.projectedTotal)}</TableCell>
                    <TableCell className={`text-right ${getVarianceColor(data.summary.variance)}`}>
                      {data.summary.variance > 0 ? '+' : ''}{formatCurrency(data.summary.variance)}
                    </TableCell>
                    <TableCell className={`text-right ${getVarianceColor(data.summary.variancePercent)}`}>
                      {data.summary.variancePercent > 0 ? '+' : ''}{data.summary.variancePercent}%
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Category Progress Bars */}
          <Card>
            <CardHeader>
              <CardTitle>Category Progress</CardTitle>
              <CardDescription>Visual comparison of spent vs budget by category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.categories.map((category, index) => {
                const spentPercent = Math.min((category.actual / category.proForma) * 100, 100);
                const committedPercent = Math.min(((category.actual + category.committed) / category.proForma) * 100, 150);

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{category.name}</span>
                      <span className={getVarianceColor(category.variance)}>
                        {formatCurrency(category.actual + category.committed)} / {formatCurrency(category.proForma)}
                      </span>
                    </div>
                    <div className="relative h-4 bg-gray-200 rounded overflow-hidden">
                      {/* Committed (lighter) */}
                      <div
                        className="absolute h-full bg-blue-200 rounded"
                        style={{ width: `${Math.min(committedPercent, 100)}%` }}
                      />
                      {/* Actual (darker) */}
                      <div
                        className={`absolute h-full rounded ${category.variance > 0 ? 'bg-red-400' : 'bg-green-400'}`}
                        style={{ width: `${spentPercent}%` }}
                      />
                      {/* Budget line */}
                      <div className="absolute h-full w-0.5 bg-gray-600" style={{ left: '100%' }} />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Spent: {formatCurrency(category.actual)}</span>
                      <span>Committed: {formatCurrency(category.committed)}</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline View */}
        <TabsContent value="timeline">
          {data.timeline.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Monthly Spend Timeline</CardTitle>
                <CardDescription>Pro forma vs actual spending over time</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Pro Forma</TableHead>
                      <TableHead className="text-right">Actual</TableHead>
                      <TableHead className="text-right">Variance</TableHead>
                      <TableHead className="text-right">Cum. Pro Forma</TableHead>
                      <TableHead className="text-right">Cum. Actual</TableHead>
                      <TableHead className="text-right">Cum. Variance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.timeline.map((month, index) => {
                      const variance = month.actual - month.proForma;
                      const cumVariance = month.cumActual - month.cumProForma;

                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{month.month}</TableCell>
                          <TableCell className="text-right">{formatCurrency(month.proForma)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(month.actual)}</TableCell>
                          <TableCell className={`text-right ${getVarianceColor(variance)}`}>
                            {variance > 0 ? '+' : ''}{formatCurrency(variance)}
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(month.cumProForma)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(month.cumActual)}</TableCell>
                          <TableCell className={`text-right font-medium ${getVarianceColor(cumVariance)}`}>
                            {cumVariance > 0 ? '+' : ''}{formatCurrency(cumVariance)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Timeline data not available for this project</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Variance Alert */}
      {data.summary.variancePercent > 5 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Budget Variance Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              Project is {data.summary.variancePercent}% over budget ({formatCurrency(data.summary.variance)} variance).
              Review cost categories and identify value engineering opportunities.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
