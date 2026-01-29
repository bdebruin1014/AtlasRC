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
  AlertTriangle,
  Shield,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Building2,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  Gauge,
  Target,
  Zap,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock risk data
const riskData = {
  overallScore: 72,
  portfolioHealth: 'Good',
  risksByCategory: {
    financial: { score: 68, trend: 'stable', items: 4 },
    market: { score: 75, trend: 'improving', items: 2 },
    operational: { score: 65, trend: 'declining', items: 5 },
    legal: { score: 82, trend: 'stable', items: 1 },
    environmental: { score: 78, trend: 'stable', items: 1 }
  },
  projectRisks: [
    {
      id: 1,
      project: 'Riverside Apartments',
      overallRisk: 'Medium',
      score: 65,
      risks: [
        { category: 'Financial', item: 'Construction cost escalation', severity: 'Medium', probability: 'High', impact: 'Medium', mitigation: 'Locked in material pricing, contingency buffer' },
        { category: 'Operational', item: 'Subcontractor delays', severity: 'Low', probability: 'Medium', impact: 'Low', mitigation: 'Backup contractors identified' }
      ]
    },
    {
      id: 2,
      project: 'Sunset Land Development',
      overallRisk: 'High',
      score: 45,
      risks: [
        { category: 'Operational', item: 'Permitting delays', severity: 'High', probability: 'High', impact: 'High', mitigation: 'Engaged expediter, weekly meetings with city' },
        { category: 'Market', item: 'Lot absorption slower than projected', severity: 'Medium', probability: 'Medium', impact: 'High', mitigation: 'Phased release strategy, marketing increase' },
        { category: 'Financial', item: 'Interest rate exposure on construction loan', severity: 'Medium', probability: 'High', impact: 'Medium', mitigation: 'Rate cap in place' }
      ]
    },
    {
      id: 3,
      project: 'Harbor View Homes',
      overallRisk: 'Low',
      score: 85,
      risks: [
        { category: 'Market', item: 'Price compression in luxury segment', severity: 'Low', probability: 'Low', impact: 'Medium', mitigation: 'Already 83% sold, flexible pricing on remaining' }
      ]
    },
    {
      id: 4,
      project: 'Downtown Mixed Use',
      overallRisk: 'Medium',
      score: 62,
      risks: [
        { category: 'Financial', item: 'Over budget by 3.2%', severity: 'Medium', probability: 'Occurred', impact: 'Medium', mitigation: 'Value engineering on remaining work' },
        { category: 'Operational', item: 'Retail tenant buildout delays', severity: 'Medium', probability: 'High', impact: 'Medium', mitigation: 'Tenant incentives for early completion' },
        { category: 'Market', item: 'Office sublease competition', severity: 'Low', probability: 'Medium', impact: 'Low', mitigation: 'Flexible lease terms, amenity focus' }
      ]
    },
    {
      id: 5,
      project: 'Oak Street Industrial',
      overallRisk: 'Low',
      score: 78,
      risks: [
        { category: 'Legal', item: 'Environmental Phase II pending', severity: 'Medium', probability: 'Low', impact: 'High', mitigation: 'Escrow holdback, seller indemnification' },
        { category: 'Financial', item: 'Closing timeline risk', severity: 'Low', probability: 'Medium', impact: 'Low', mitigation: 'Extension options in PSA' }
      ]
    },
    {
      id: 6,
      project: 'Meadow Creek Phase II',
      overallRisk: 'Medium',
      score: 68,
      risks: [
        { category: 'Operational', item: 'Infrastructure cost increases', severity: 'Medium', probability: 'Medium', impact: 'Medium', mitigation: 'Bid locking with contractors' },
        { category: 'Market', item: 'Builder demand uncertainty', severity: 'Medium', probability: 'Medium', impact: 'High', mitigation: 'Pre-sales to national builders' }
      ]
    }
  ],
  topRisks: [
    { id: 1, project: 'Sunset Land Development', risk: 'Permitting delays', severity: 'High', daysOpen: 45, status: 'Active' },
    { id: 2, project: 'Downtown Mixed Use', risk: 'Budget overrun (3.2%)', severity: 'Medium', daysOpen: 30, status: 'Monitoring' },
    { id: 3, project: 'Sunset Land Development', risk: 'Interest rate exposure', severity: 'Medium', daysOpen: 60, status: 'Mitigated' },
    { id: 4, project: 'Meadow Creek Phase II', risk: 'Builder demand uncertainty', severity: 'Medium', daysOpen: 15, status: 'Active' },
    { id: 5, project: 'Riverside Apartments', risk: 'Construction cost escalation', severity: 'Medium', daysOpen: 90, status: 'Mitigated' }
  ],
  riskTrends: [
    { month: 'Oct', score: 68 },
    { month: 'Nov', score: 70 },
    { month: 'Dec', score: 69 },
    { month: 'Jan', score: 72 }
  ],
  mitigationActions: [
    { id: 1, action: 'Lock material pricing with GC', project: 'Riverside Apartments', dueDate: '2024-01-25', status: 'Completed', assignee: 'Mike Johnson' },
    { id: 2, action: 'Weekly city planning meetings', project: 'Sunset Land Development', dueDate: 'Ongoing', status: 'In Progress', assignee: 'Sarah Chen' },
    { id: 3, action: 'Execute interest rate cap', project: 'Sunset Land Development', dueDate: '2024-01-30', status: 'Pending', assignee: 'Tom Richards' },
    { id: 4, action: 'Secure backup subcontractors', project: 'Riverside Apartments', dueDate: '2024-02-01', status: 'In Progress', assignee: 'Mike Johnson' },
    { id: 5, action: 'Environmental report review', project: 'Oak Street Industrial', dueDate: '2024-01-28', status: 'In Progress', assignee: 'Legal Team' }
  ]
};

export default function RiskAssessmentDashboardPage() {
  const [selectedProject, setSelectedProject] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const { toast } = useToast();

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score) => {
    if (score >= 75) return 'bg-green-100';
    if (score >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getRiskColor = (risk) => {
    const colors = {
      'Low': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-red-100 text-red-800',
      'Critical': 'bg-red-200 text-red-900'
    };
    return colors[risk] || 'bg-gray-100 text-gray-800';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'Low': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-orange-100 text-orange-800',
      'Critical': 'bg-red-100 text-red-800',
      'Occurred': 'bg-red-200 text-red-900'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-red-100 text-red-800',
      'Monitoring': 'bg-yellow-100 text-yellow-800',
      'Mitigated': 'bg-green-100 text-green-800',
      'Closed': 'bg-gray-100 text-gray-800',
      'Completed': 'bg-green-100 text-green-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Pending': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'improving') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'declining') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Financial': <DollarSign className="h-4 w-4" />,
      'Market': <TrendingUp className="h-4 w-4" />,
      'Operational': <Activity className="h-4 w-4" />,
      'Legal': <FileText className="h-4 w-4" />,
      'Environmental': <Shield className="h-4 w-4" />
    };
    return icons[category] || <AlertTriangle className="h-4 w-4" />;
  };

  const filteredProjects = useMemo(() => {
    return riskData.projectRisks.filter(project => {
      const matchesProject = selectedProject === 'all' || project.project === selectedProject;
      const matchesRisk = riskFilter === 'all' || project.overallRisk === riskFilter;
      return matchesProject && matchesRisk;
    });
  }, [selectedProject, riskFilter]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Risk Assessment Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage portfolio risks</p>
        </div>
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Export Risk Report
        </Button>
      </div>

      {/* Overall Risk Score */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className={`relative w-32 h-32 rounded-full ${getScoreBackground(riskData.overallScore)} flex items-center justify-center`}>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getScoreColor(riskData.overallScore)}`}>
                    {riskData.overallScore}
                  </div>
                  <div className="text-sm text-muted-foreground">out of 100</div>
                </div>
              </div>
            </div>
            <div className="text-center mt-4">
              <Badge className="bg-green-100 text-green-800">{riskData.portfolioHealth}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Risk by Category */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Risk by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {Object.entries(riskData.risksByCategory).map(([category, data]) => (
                <div key={category} className="text-center">
                  <div className={`mx-auto w-16 h-16 rounded-full ${getScoreBackground(data.score)} flex items-center justify-center mb-2`}>
                    <span className={`text-xl font-bold ${getScoreColor(data.score)}`}>{data.score}</span>
                  </div>
                  <div className="font-medium capitalize">{category}</div>
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    {getTrendIcon(data.trend)}
                    <span>{data.items} items</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Projects</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {riskData.projectRisks.filter(p => p.overallRisk === 'High').length}
            </div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium Risk Projects</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {riskData.projectRisks.filter(p => p.overallRisk === 'Medium').length}
            </div>
            <p className="text-xs text-muted-foreground">Monitor closely</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Mitigations</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {riskData.mitigationActions.filter(a => a.status === 'In Progress').length}
            </div>
            <p className="text-xs text-muted-foreground">Actions in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risks Mitigated</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {riskData.topRisks.filter(r => r.status === 'Mitigated').length}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Project Risks</TabsTrigger>
          <TabsTrigger value="top-risks">Top Risks</TabsTrigger>
          <TabsTrigger value="mitigations">Mitigation Actions</TabsTrigger>
        </TabsList>

        {/* Project Risks Tab */}
        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 mb-4">
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Filter by project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {riskData.projectRisks.map(p => (
                      <SelectItem key={p.id} value={p.project}>{p.project}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Low">Low Risk</SelectItem>
                    <SelectItem value="Medium">Medium Risk</SelectItem>
                    <SelectItem value="High">High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {filteredProjects.map(project => (
                  <Card key={project.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg">{project.project}</CardTitle>
                          <Badge className={getRiskColor(project.overallRisk)}>
                            {project.overallRisk} Risk
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Risk Score:</span>
                          <span className={`text-xl font-bold ${getScoreColor(project.score)}`}>
                            {project.score}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead>Risk Item</TableHead>
                            <TableHead>Severity</TableHead>
                            <TableHead>Probability</TableHead>
                            <TableHead>Impact</TableHead>
                            <TableHead>Mitigation</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {project.risks.map((risk, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getCategoryIcon(risk.category)}
                                  <span>{risk.category}</span>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{risk.item}</TableCell>
                              <TableCell>
                                <Badge className={getSeverityColor(risk.severity)}>{risk.severity}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{risk.probability}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{risk.impact}</Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground max-w-xs">
                                {risk.mitigation}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Risks Tab */}
        <TabsContent value="top-risks">
          <Card>
            <CardHeader>
              <CardTitle>Top Portfolio Risks</CardTitle>
              <CardDescription>Critical risks requiring attention across all projects</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Days Open</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {riskData.topRisks.map(risk => (
                    <TableRow key={risk.id}>
                      <TableCell className="font-medium">{risk.project}</TableCell>
                      <TableCell>{risk.risk}</TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(risk.severity)}>{risk.severity}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {risk.daysOpen} days
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(risk.status)}>{risk.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mitigation Actions Tab */}
        <TabsContent value="mitigations">
          <Card>
            <CardHeader>
              <CardTitle>Mitigation Action Items</CardTitle>
              <CardDescription>Track risk mitigation activities</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {riskData.mitigationActions.map(action => (
                    <TableRow key={action.id}>
                      <TableCell className="font-medium">{action.action}</TableCell>
                      <TableCell>{action.project}</TableCell>
                      <TableCell>{action.assignee}</TableCell>
                      <TableCell>{action.dueDate}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(action.status)}>{action.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Risk Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Risk Heat Map</CardTitle>
          <CardDescription>Probability vs Impact matrix for active risks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-1">
            <div className="col-span-1"></div>
            <div className="text-center text-sm font-medium py-2">Low Impact</div>
            <div className="text-center text-sm font-medium py-2">Medium Impact</div>
            <div className="text-center text-sm font-medium py-2">High Impact</div>

            <div className="text-sm font-medium py-4 text-right pr-2">High Prob.</div>
            <div className="bg-yellow-100 p-2 rounded text-center text-xs">2</div>
            <div className="bg-orange-100 p-2 rounded text-center text-xs">3</div>
            <div className="bg-red-100 p-2 rounded text-center text-xs font-bold">1</div>

            <div className="text-sm font-medium py-4 text-right pr-2">Med. Prob.</div>
            <div className="bg-green-100 p-2 rounded text-center text-xs">1</div>
            <div className="bg-yellow-100 p-2 rounded text-center text-xs">4</div>
            <div className="bg-orange-100 p-2 rounded text-center text-xs">2</div>

            <div className="text-sm font-medium py-4 text-right pr-2">Low Prob.</div>
            <div className="bg-green-100 p-2 rounded text-center text-xs">3</div>
            <div className="bg-green-100 p-2 rounded text-center text-xs">1</div>
            <div className="bg-yellow-100 p-2 rounded text-center text-xs">1</div>
          </div>
          <div className="flex gap-4 justify-center mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 rounded"></div>
              <span>Low Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 rounded"></div>
              <span>Medium Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-100 rounded"></div>
              <span>High Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 rounded"></div>
              <span>Critical Risk</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
