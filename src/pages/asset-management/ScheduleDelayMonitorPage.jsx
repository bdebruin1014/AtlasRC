import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Building2,
  Search,
  TrendingUp,
  TrendingDown,
  Flag,
  ArrowRight,
  Target,
  Timer,
  CalendarDays
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock schedule delay data
const scheduleData = {
  projects: [
    {
      id: 1,
      name: 'Riverside Apartments',
      originalEndDate: '2024-08-15',
      projectedEndDate: '2024-09-01',
      delayDays: 17,
      status: 'Behind Schedule',
      completion: 62,
      criticalPathImpacted: true,
      milestones: [
        { name: 'Foundation Complete', originalDate: '2023-12-01', actualDate: '2023-12-05', status: 'Completed', delay: 4 },
        { name: 'Structure Complete', originalDate: '2024-03-15', actualDate: '2024-03-28', status: 'Completed', delay: 13 },
        { name: 'Rough-In Complete', originalDate: '2024-05-01', actualDate: null, status: 'In Progress', delay: 0 },
        { name: 'Finishes Complete', originalDate: '2024-07-01', actualDate: null, status: 'Pending', delay: 0 },
        { name: 'Final Inspection', originalDate: '2024-08-01', actualDate: null, status: 'Pending', delay: 0 }
      ],
      delays: [
        { id: 1, cause: 'Weather delays', impact: 5, category: 'Weather', date: '2024-01-10', recoverable: false },
        { id: 2, cause: 'Permitting delays', impact: 8, category: 'Permitting', date: '2024-02-15', recoverable: true },
        { id: 3, cause: 'Material shortage', impact: 4, category: 'Supply Chain', date: '2024-03-01', recoverable: true }
      ]
    },
    {
      id: 2,
      name: 'Sunset Land Development',
      originalEndDate: '2024-06-30',
      projectedEndDate: '2024-08-15',
      delayDays: 46,
      status: 'Significantly Behind',
      completion: 45,
      criticalPathImpacted: true,
      milestones: [
        { name: 'Entitlements Approved', originalDate: '2023-10-15', actualDate: '2023-11-20', status: 'Completed', delay: 36 },
        { name: 'Phase 1 Infrastructure', originalDate: '2024-02-01', actualDate: null, status: 'In Progress', delay: 0 },
        { name: 'Phase 1 Lot Release', originalDate: '2024-04-15', actualDate: null, status: 'Pending', delay: 0 },
        { name: 'Phase 2 Infrastructure', originalDate: '2024-05-01', actualDate: null, status: 'Pending', delay: 0 }
      ],
      delays: [
        { id: 1, cause: 'Entitlement process', impact: 36, category: 'Permitting', date: '2023-11-20', recoverable: false },
        { id: 2, cause: 'Utility coordination', impact: 10, category: 'Infrastructure', date: '2024-01-15', recoverable: true }
      ]
    },
    {
      id: 3,
      name: 'Harbor View Homes',
      originalEndDate: '2024-03-01',
      projectedEndDate: '2024-02-28',
      delayDays: -1,
      status: 'Ahead of Schedule',
      completion: 92,
      criticalPathImpacted: false,
      milestones: [
        { name: 'All Units Framed', originalDate: '2023-10-01', actualDate: '2023-09-28', status: 'Completed', delay: -3 },
        { name: 'MEP Rough-In Complete', originalDate: '2023-12-15', actualDate: '2023-12-12', status: 'Completed', delay: -3 },
        { name: 'Interior Finishes', originalDate: '2024-02-01', actualDate: '2024-01-30', status: 'Completed', delay: -2 },
        { name: 'Final Punch List', originalDate: '2024-02-20', actualDate: null, status: 'In Progress', delay: 0 }
      ],
      delays: []
    },
    {
      id: 4,
      name: 'Downtown Mixed Use',
      originalEndDate: '2024-04-15',
      projectedEndDate: '2024-05-01',
      delayDays: 16,
      status: 'Behind Schedule',
      completion: 97,
      criticalPathImpacted: false,
      milestones: [
        { name: 'Core & Shell Complete', originalDate: '2023-11-01', actualDate: '2023-11-15', status: 'Completed', delay: 14 },
        { name: 'Retail TI Complete', originalDate: '2024-02-15', actualDate: null, status: 'In Progress', delay: 0 },
        { name: 'Residential CO', originalDate: '2024-03-01', actualDate: '2024-03-08', status: 'Completed', delay: 7 },
        { name: 'Final CO', originalDate: '2024-04-01', actualDate: null, status: 'Pending', delay: 0 }
      ],
      delays: [
        { id: 1, cause: 'Tenant buildout changes', impact: 14, category: 'Design', date: '2023-11-15', recoverable: true },
        { id: 2, cause: 'Inspection delays', impact: 2, category: 'Permitting', date: '2024-03-05', recoverable: false }
      ]
    }
  ],
  delayCategories: ['Weather', 'Permitting', 'Supply Chain', 'Labor', 'Design', 'Infrastructure', 'Financial', 'Other']
};

export default function ScheduleDelayMonitorPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  const filteredProjects = useMemo(() => {
    return scheduleData.projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const behindSchedule = scheduleData.projects.filter(p => p.delayDays > 0).length;
    const onOrAhead = scheduleData.projects.filter(p => p.delayDays <= 0).length;
    const criticalPath = scheduleData.projects.filter(p => p.criticalPathImpacted).length;
    const totalDelayDays = scheduleData.projects.reduce((sum, p) => sum + Math.max(0, p.delayDays), 0);
    const avgDelay = totalDelayDays / scheduleData.projects.filter(p => p.delayDays > 0).length || 0;
    return { behindSchedule, onOrAhead, criticalPath, totalDelayDays, avgDelay: Math.round(avgDelay) };
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'Ahead of Schedule': 'bg-green-100 text-green-800',
      'On Schedule': 'bg-blue-100 text-blue-800',
      'Behind Schedule': 'bg-yellow-100 text-yellow-800',
      'Significantly Behind': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getMilestoneStatusColor = (status) => {
    const colors = {
      'Completed': 'bg-green-100 text-green-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Pending': 'bg-gray-100 text-gray-800',
      'Delayed': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getDelayIndicator = (days) => {
    if (days < 0) {
      return (
        <span className="flex items-center gap-1 text-green-600">
          <TrendingDown className="h-4 w-4" />
          {Math.abs(days)} days ahead
        </span>
      );
    } else if (days === 0) {
      return (
        <span className="flex items-center gap-1 text-blue-600">
          <CheckCircle className="h-4 w-4" />
          On schedule
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-1 text-red-600">
          <TrendingUp className="h-4 w-4" />
          {days} days behind
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Schedule Delay Monitor</h1>
          <p className="text-muted-foreground">Track schedule performance and delays across all projects</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Behind Schedule</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.behindSchedule}</div>
            <p className="text-xs text-muted-foreground">Projects delayed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On/Ahead</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.onOrAhead}</div>
            <p className="text-xs text-muted-foreground">Projects on track</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Path</CardTitle>
            <Flag className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.criticalPath}</div>
            <p className="text-xs text-muted-foreground">Impacted projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Delay Days</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDelayDays}</div>
            <p className="text-xs text-muted-foreground">Cumulative</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Delay</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDelay} days</div>
            <p className="text-xs text-muted-foreground">Per delayed project</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Ahead of Schedule">Ahead of Schedule</SelectItem>
                <SelectItem value="On Schedule">On Schedule</SelectItem>
                <SelectItem value="Behind Schedule">Behind Schedule</SelectItem>
                <SelectItem value="Significantly Behind">Significantly Behind</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Project Cards */}
      <div className="space-y-4">
        {filteredProjects.map(project => (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                    {project.criticalPathImpacted && (
                      <Badge variant="outline" className="border-red-300 text-red-600">
                        <Flag className="h-3 w-3 mr-1" />
                        Critical Path Impacted
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="mt-1">
                    <span className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Original: {project.originalEndDate}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        Projected: {project.projectedEndDate}
                      </span>
                    </span>
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    {getDelayIndicator(project.delayDays)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {project.completion}% complete
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Overall Progress</span>
                  <span>{project.completion}%</span>
                </div>
                <Progress value={project.completion} className="h-2" />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Milestones */}
                <div>
                  <h4 className="font-semibold mb-3">Key Milestones</h4>
                  <div className="space-y-2">
                    {project.milestones.map((milestone, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div className="flex items-center gap-2">
                          {milestone.status === 'Completed' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : milestone.status === 'In Progress' ? (
                            <Clock className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Target className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="text-sm">{milestone.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{milestone.originalDate}</span>
                          {milestone.delay !== 0 && (
                            <Badge
                              variant="outline"
                              className={milestone.delay > 0 ? 'text-red-600 border-red-200' : 'text-green-600 border-green-200'}
                            >
                              {milestone.delay > 0 ? `+${milestone.delay}d` : `${milestone.delay}d`}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delay Causes */}
                <div>
                  <h4 className="font-semibold mb-3">Delay History</h4>
                  {project.delays.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cause</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Impact</TableHead>
                          <TableHead>Recoverable</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {project.delays.map(delay => (
                          <TableRow key={delay.id}>
                            <TableCell className="text-sm">{delay.cause}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{delay.category}</Badge>
                            </TableCell>
                            <TableCell className="text-red-600">+{delay.impact} days</TableCell>
                            <TableCell>
                              {delay.recoverable ? (
                                <span className="text-green-600 text-sm">Yes</span>
                              ) : (
                                <span className="text-red-600 text-sm">No</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p>No delays recorded</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delay Analysis Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Delay Analysis by Category</CardTitle>
          <CardDescription>Understanding the root causes of schedule delays</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {scheduleData.delayCategories.slice(0, 8).map((category, index) => {
              const categoryDelays = scheduleData.projects.flatMap(p => p.delays).filter(d => d.category === category);
              const totalDays = categoryDelays.reduce((sum, d) => sum + d.impact, 0);
              const count = categoryDelays.length;

              return (
                <div key={category} className="p-3 border rounded-lg">
                  <div className="font-medium">{category}</div>
                  <div className="text-2xl font-bold">{totalDays} days</div>
                  <div className="text-xs text-muted-foreground">{count} occurrence{count !== 1 ? 's' : ''}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
