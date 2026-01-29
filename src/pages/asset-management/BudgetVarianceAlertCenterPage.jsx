import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Search,
  Bell,
  BellOff,
  Building2,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock budget variance data
const budgetVarianceData = {
  alerts: [
    {
      id: 1,
      project: 'Riverside Apartments',
      category: 'Site Work',
      budgetItem: 'Excavation & Grading',
      budgetAmount: 450000,
      actualAmount: 485000,
      variance: 35000,
      variancePercent: 7.8,
      direction: 'over',
      severity: 'warning',
      status: 'Active',
      detectedDate: '2024-01-15',
      reason: 'Unforeseen rock removal required',
      acknowledged: false
    },
    {
      id: 2,
      project: 'Riverside Apartments',
      category: 'Concrete',
      budgetItem: 'Foundation Work',
      budgetAmount: 1200000,
      actualAmount: 1350000,
      variance: 150000,
      variancePercent: 12.5,
      direction: 'over',
      severity: 'critical',
      status: 'Active',
      detectedDate: '2024-01-18',
      reason: 'Design changes and material cost increases',
      acknowledged: false
    },
    {
      id: 3,
      project: 'Sunset Land Development',
      category: 'Infrastructure',
      budgetItem: 'Storm Drainage',
      budgetAmount: 680000,
      actualAmount: 620000,
      variance: -60000,
      variancePercent: -8.8,
      direction: 'under',
      severity: 'info',
      status: 'Active',
      detectedDate: '2024-01-12',
      reason: 'Favorable bid from contractor',
      acknowledged: true
    },
    {
      id: 4,
      project: 'Downtown Mixed Use',
      category: 'MEP',
      budgetItem: 'HVAC Systems',
      budgetAmount: 2100000,
      actualAmount: 2250000,
      variance: 150000,
      variancePercent: 7.1,
      direction: 'over',
      severity: 'warning',
      status: 'Resolved',
      detectedDate: '2024-01-08',
      reason: 'Equipment upgrade required for fire code',
      acknowledged: true,
      resolution: 'Approved change order, offset by VE savings in other areas'
    },
    {
      id: 5,
      project: 'Harbor View Homes',
      category: 'Finishes',
      budgetItem: 'Flooring',
      budgetAmount: 180000,
      actualAmount: 165000,
      variance: -15000,
      variancePercent: -8.3,
      direction: 'under',
      severity: 'info',
      status: 'Active',
      detectedDate: '2024-01-10',
      reason: 'Negotiated volume discount',
      acknowledged: true
    },
    {
      id: 6,
      project: 'Sunset Land Development',
      category: 'Soft Costs',
      budgetItem: 'Engineering Fees',
      budgetAmount: 320000,
      actualAmount: 385000,
      variance: 65000,
      variancePercent: 20.3,
      direction: 'over',
      severity: 'critical',
      status: 'Active',
      detectedDate: '2024-01-16',
      reason: 'Additional surveys and redesigns due to site conditions',
      acknowledged: false
    }
  ],
  projectSummary: [
    {
      project: 'Riverside Apartments',
      totalBudget: 45000000,
      currentSpent: 28500000,
      projectedTotal: 46200000,
      variance: 1200000,
      variancePercent: 2.7,
      status: 'Over Budget',
      alertCount: 2
    },
    {
      project: 'Sunset Land Development',
      totalBudget: 38000000,
      currentSpent: 22000000,
      projectedTotal: 37850000,
      variance: -150000,
      variancePercent: -0.4,
      status: 'On Budget',
      alertCount: 2
    },
    {
      project: 'Downtown Mixed Use',
      totalBudget: 25000000,
      currentSpent: 24200000,
      projectedTotal: 25800000,
      variance: 800000,
      variancePercent: 3.2,
      status: 'Over Budget',
      alertCount: 1
    },
    {
      project: 'Harbor View Homes',
      totalBudget: 8500000,
      currentSpent: 7800000,
      projectedTotal: 8350000,
      variance: -150000,
      variancePercent: -1.8,
      status: 'Under Budget',
      alertCount: 1
    }
  ],
  thresholds: {
    warning: 5,
    critical: 10
  }
};

export default function BudgetVarianceAlertCenterPage() {
  const [alerts, setAlerts] = useState(budgetVarianceData.alerts);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAcknowledged, setShowAcknowledged] = useState(true);
  const [warningThreshold, setWarningThreshold] = useState(budgetVarianceData.thresholds.warning);
  const [criticalThreshold, setCriticalThreshold] = useState(budgetVarianceData.thresholds.critical);
  const { toast } = useToast();

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchesSearch = alert.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           alert.budgetItem.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProject = projectFilter === 'all' || alert.project === projectFilter;
      const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
      const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
      const matchesAcknowledged = showAcknowledged || !alert.acknowledged;
      return matchesSearch && matchesProject && matchesSeverity && matchesStatus && matchesAcknowledged;
    });
  }, [alerts, searchTerm, projectFilter, severityFilter, statusFilter, showAcknowledged]);

  const projects = useMemo(() => {
    return [...new Set(alerts.map(a => a.project))];
  }, [alerts]);

  const stats = useMemo(() => {
    const active = alerts.filter(a => a.status === 'Active').length;
    const critical = alerts.filter(a => a.severity === 'critical' && a.status === 'Active').length;
    const overBudgetTotal = alerts.filter(a => a.direction === 'over' && a.status === 'Active')
      .reduce((sum, a) => sum + a.variance, 0);
    const underBudgetTotal = alerts.filter(a => a.direction === 'under' && a.status === 'Active')
      .reduce((sum, a) => sum + Math.abs(a.variance), 0);
    return { active, critical, overBudgetTotal, underBudgetTotal };
  }, [alerts]);

  const handleAcknowledge = (alertId) => {
    setAlerts(alerts.map(alert => {
      if (alert.id === alertId) {
        return { ...alert, acknowledged: true };
      }
      return alert;
    }));
    toast({
      title: "Alert Acknowledged",
      description: "The variance alert has been acknowledged."
    });
  };

  const handleResolve = (alertId) => {
    setAlerts(alerts.map(alert => {
      if (alert.id === alertId) {
        return { ...alert, status: 'Resolved', acknowledged: true };
      }
      return alert;
    }));
    toast({
      title: "Alert Resolved",
      description: "The variance alert has been marked as resolved."
    });
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'info': 'bg-blue-100 text-blue-800',
      'warning': 'bg-yellow-100 text-yellow-800',
      'critical': 'bg-red-100 text-red-800'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      'On Budget': 'bg-green-100 text-green-800',
      'Under Budget': 'bg-blue-100 text-blue-800',
      'Over Budget': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (value) => {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Budget Variance Alert Center</h1>
          <p className="text-muted-foreground">Monitor and manage budget variances across all projects</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={showAcknowledged}
              onCheckedChange={setShowAcknowledged}
            />
            <Label className="text-sm">Show acknowledged</Label>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Variances</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            <p className="text-xs text-muted-foreground">&gt;{criticalThreshold}% over budget</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Over Budget Total</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.overBudgetTotal)}</div>
            <p className="text-xs text-muted-foreground">Active variances</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Budget Total</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.underBudgetTotal)}</div>
            <p className="text-xs text-muted-foreground">Savings identified</p>
          </CardContent>
        </Card>
      </div>

      {/* Project Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Project Budget Summary</CardTitle>
          <CardDescription>Overall budget status by project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgetVarianceData.projectSummary.map((project, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{project.project}</div>
                      <div className="text-sm text-muted-foreground">
                        Budget: {formatCurrency(project.totalBudget)} •
                        Projected: {formatCurrency(project.projectedTotal)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                    <div className={`text-lg font-bold mt-1 ${project.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {project.variance > 0 ? '+' : ''}{formatCurrency(project.variance)}
                      <span className="text-sm ml-1">({project.variancePercent > 0 ? '+' : ''}{project.variancePercent}%)</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Spent: {formatCurrency(project.currentSpent)}</span>
                    <span>{Math.round((project.currentSpent / project.totalBudget) * 100)}% of budget</span>
                  </div>
                  <Progress value={(project.currentSpent / project.totalBudget) * 100} className="h-2" />
                </div>
                {project.alertCount > 0 && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <Bell className="h-3 w-3 inline mr-1" />
                    {project.alertCount} active alert{project.alertCount > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project} value={project}>{project}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Variance Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Budget Item</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Actual</TableHead>
                <TableHead>Variance</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlerts.map(alert => (
                <TableRow key={alert.id} className={alert.acknowledged ? 'opacity-60' : ''}>
                  <TableCell className="font-medium">{alert.project}</TableCell>
                  <TableCell>{alert.category}</TableCell>
                  <TableCell>
                    <div>{alert.budgetItem}</div>
                    {alert.reason && (
                      <div className="text-xs text-muted-foreground">{alert.reason}</div>
                    )}
                  </TableCell>
                  <TableCell>{formatCurrency(alert.budgetAmount)}</TableCell>
                  <TableCell>{formatCurrency(alert.actualAmount)}</TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-1 font-medium ${alert.direction === 'over' ? 'text-red-600' : 'text-green-600'}`}>
                      {alert.direction === 'over' ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      {formatCurrency(Math.abs(alert.variance))}
                      <span className="text-sm">({alert.variancePercent > 0 ? '+' : ''}{alert.variancePercent}%)</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {alert.status === 'Resolved' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : alert.acknowledged ? (
                        <BellOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Bell className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="text-sm">{alert.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {!alert.acknowledged && alert.status === 'Active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAcknowledge(alert.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                      {alert.status === 'Active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolve(alert.id)}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Threshold Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Alert Thresholds
          </CardTitle>
          <CardDescription>Configure when variance alerts are triggered</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Warning Threshold (%)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={warningThreshold}
                  onChange={(e) => setWarningThreshold(parseInt(e.target.value) || 0)}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">
                  Alert when variance exceeds {warningThreshold}%
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Critical Threshold (%)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={criticalThreshold}
                  onChange={(e) => setCriticalThreshold(parseInt(e.target.value) || 0)}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">
                  Critical alert when variance exceeds {criticalThreshold}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
