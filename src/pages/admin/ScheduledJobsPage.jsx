import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Clock, Search, RefreshCw, Play, Pause, RotateCcw, Calendar,
  CheckCircle, XCircle, AlertTriangle, Settings, Eye, History, Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock scheduled jobs
const mockJobs = [
  {
    id: 'job_001',
    name: 'Daily Database Backup',
    description: 'Automated backup of all databases to cloud storage',
    schedule: '0 2 * * *',
    scheduleText: 'Every day at 2:00 AM',
    status: 'active',
    lastRun: '2024-01-15T02:00:00Z',
    lastStatus: 'success',
    lastDuration: 325,
    nextRun: '2024-01-16T02:00:00Z',
    successRate: 98.5,
    totalRuns: 365,
  },
  {
    id: 'job_002',
    name: 'Email Queue Processor',
    description: 'Process pending emails in the queue',
    schedule: '*/5 * * * *',
    scheduleText: 'Every 5 minutes',
    status: 'active',
    lastRun: '2024-01-15T14:55:00Z',
    lastStatus: 'success',
    lastDuration: 12,
    nextRun: '2024-01-15T15:00:00Z',
    successRate: 99.9,
    totalRuns: 8640,
  },
  {
    id: 'job_003',
    name: 'Report Generation',
    description: 'Generate weekly financial reports',
    schedule: '0 6 * * 1',
    scheduleText: 'Every Monday at 6:00 AM',
    status: 'active',
    lastRun: '2024-01-15T06:00:00Z',
    lastStatus: 'success',
    lastDuration: 180,
    nextRun: '2024-01-22T06:00:00Z',
    successRate: 95.0,
    totalRuns: 52,
  },
  {
    id: 'job_004',
    name: 'Cache Cleanup',
    description: 'Clear expired cache entries',
    schedule: '0 */4 * * *',
    scheduleText: 'Every 4 hours',
    status: 'active',
    lastRun: '2024-01-15T12:00:00Z',
    lastStatus: 'success',
    lastDuration: 45,
    nextRun: '2024-01-15T16:00:00Z',
    successRate: 100,
    totalRuns: 2190,
  },
  {
    id: 'job_005',
    name: 'Sync External Data',
    description: 'Sync data from third-party APIs',
    schedule: '0 */2 * * *',
    scheduleText: 'Every 2 hours',
    status: 'paused',
    lastRun: '2024-01-14T22:00:00Z',
    lastStatus: 'failed',
    lastDuration: 0,
    lastError: 'API rate limit exceeded',
    nextRun: null,
    successRate: 85.0,
    totalRuns: 4380,
  },
  {
    id: 'job_006',
    name: 'Invoice Reminder',
    description: 'Send reminders for overdue invoices',
    schedule: '0 9 * * 1-5',
    scheduleText: 'Weekdays at 9:00 AM',
    status: 'active',
    lastRun: '2024-01-15T09:00:00Z',
    lastStatus: 'success',
    lastDuration: 28,
    nextRun: '2024-01-16T09:00:00Z',
    successRate: 99.5,
    totalRuns: 260,
  },
  {
    id: 'job_007',
    name: 'Log Rotation',
    description: 'Archive and rotate old log files',
    schedule: '0 0 * * 0',
    scheduleText: 'Every Sunday at midnight',
    status: 'active',
    lastRun: '2024-01-14T00:00:00Z',
    lastStatus: 'success',
    lastDuration: 120,
    nextRun: '2024-01-21T00:00:00Z',
    successRate: 100,
    totalRuns: 52,
  },
];

// Mock execution history
const mockHistory = [
  { id: 1, jobName: 'Email Queue Processor', status: 'success', startedAt: '2024-01-15T14:55:00Z', duration: 12 },
  { id: 2, jobName: 'Cache Cleanup', status: 'success', startedAt: '2024-01-15T12:00:00Z', duration: 45 },
  { id: 3, jobName: 'Invoice Reminder', status: 'success', startedAt: '2024-01-15T09:00:00Z', duration: 28 },
  { id: 4, jobName: 'Report Generation', status: 'success', startedAt: '2024-01-15T06:00:00Z', duration: 180 },
  { id: 5, jobName: 'Daily Database Backup', status: 'success', startedAt: '2024-01-15T02:00:00Z', duration: 325 },
  { id: 6, jobName: 'Sync External Data', status: 'failed', startedAt: '2024-01-14T22:00:00Z', duration: 0, error: 'API rate limit exceeded' },
  { id: 7, jobName: 'Email Queue Processor', status: 'success', startedAt: '2024-01-15T14:50:00Z', duration: 11 },
  { id: 8, jobName: 'Email Queue Processor', status: 'success', startedAt: '2024-01-15T14:45:00Z', duration: 13 },
];

const ScheduledJobsPage = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState(mockJobs);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [runningJob, setRunningJob] = useState(null);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchQuery ||
      job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'disabled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
    toast({
      title: 'Refreshed',
      description: 'Job status has been updated',
    });
  };

  const handleToggleJob = (jobId) => {
    setJobs(prev => prev.map(job => {
      if (job.id !== jobId) return job;
      const newStatus = job.status === 'active' ? 'paused' : 'active';
      return {
        ...job,
        status: newStatus,
        nextRun: newStatus === 'active' ? new Date(Date.now() + 3600000).toISOString() : null,
      };
    }));

    const job = jobs.find(j => j.id === jobId);
    toast({
      title: job.status === 'active' ? 'Job Paused' : 'Job Activated',
      description: `${job.name} has been ${job.status === 'active' ? 'paused' : 'activated'}`,
    });
  };

  const handleRunNow = async (job) => {
    setRunningJob(job.id);
    toast({
      title: 'Job Started',
      description: `${job.name} is now running`,
    });

    // Simulate job execution
    await new Promise(resolve => setTimeout(resolve, 3000));

    setJobs(prev => prev.map(j => {
      if (j.id !== job.id) return j;
      return {
        ...j,
        lastRun: new Date().toISOString(),
        lastStatus: 'success',
        lastDuration: Math.floor(Math.random() * 100) + 10,
        totalRuns: j.totalRuns + 1,
      };
    }));

    setRunningJob(null);
    toast({
      title: 'Job Completed',
      description: `${job.name} completed successfully`,
    });
  };

  const handleViewDetails = (job) => {
    setSelectedJob(job);
    setShowDetailsDialog(true);
  };

  const handleViewHistory = (job) => {
    setSelectedJob(job);
    setShowHistoryDialog(true);
  };

  // Stats
  const activeJobs = jobs.filter(j => j.status === 'active').length;
  const pausedJobs = jobs.filter(j => j.status === 'paused').length;
  const failedJobs = jobs.filter(j => j.lastStatus === 'failed').length;
  const avgSuccessRate = (jobs.reduce((sum, j) => sum + j.successRate, 0) / jobs.length).toFixed(1);

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Scheduled Jobs | Admin</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Scheduled Jobs</h1>
          <p className="text-gray-600 mt-2">Monitor and manage background jobs and cron tasks</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Jobs</p>
                <p className="text-2xl font-bold text-green-600">{activeJobs}</p>
              </div>
              <Play className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Paused Jobs</p>
                <p className="text-2xl font-bold text-yellow-600">{pausedJobs}</p>
              </div>
              <Pause className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Failed (Last Run)</p>
                <p className="text-2xl font-bold text-red-600">{failedJobs}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Success Rate</p>
                <p className="text-2xl font-bold text-blue-600">{avgSuccessRate}%</p>
              </div>
              <Zap className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search jobs..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Jobs</CardTitle>
          <CardDescription>
            {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No jobs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{job.name}</div>
                        <div className="text-sm text-gray-500">{job.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{job.scheduleText}</div>
                        <code className="text-xs text-gray-400">{job.schedule}</code>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusBadge(job.status)}>
                          {job.status}
                        </Badge>
                        {job.lastStatus && (
                          <span title={`Last: ${job.lastStatus}`}>
                            {getStatusIcon(job.lastStatus)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDateTime(job.lastRun)}</div>
                        {job.lastDuration > 0 && (
                          <div className="text-xs text-gray-500">
                            Duration: {formatDuration(job.lastDuration)}
                          </div>
                        )}
                        {job.lastError && (
                          <div className="text-xs text-red-500 truncate max-w-[150px]" title={job.lastError}>
                            {job.lastError}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {formatDateTime(job.nextRun)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={job.successRate}
                          className="w-16 h-2"
                        />
                        <span className="text-sm">{job.successRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRunNow(job)}
                          disabled={runningJob === job.id}
                          title="Run Now"
                        >
                          {runningJob === job.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleJob(job.id)}
                          title={job.status === 'active' ? 'Pause' : 'Resume'}
                        >
                          {job.status === 'active' ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewHistory(job)}
                          title="View History"
                        >
                          <History className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(job)}
                          title="Settings"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Executions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
          <CardDescription>Latest job execution history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockHistory.slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(entry.status)}
                  <div>
                    <div className="font-medium">{entry.jobName}</div>
                    <div className="text-sm text-gray-500">{formatDateTime(entry.startedAt)}</div>
                  </div>
                </div>
                <div className="text-right">
                  {entry.status === 'success' ? (
                    <div className="text-sm text-gray-600">
                      Completed in {formatDuration(entry.duration)}
                    </div>
                  ) : (
                    <div className="text-sm text-red-600">{entry.error}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Job Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Job Configuration
            </DialogTitle>
            <DialogDescription>{selectedJob?.name}</DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Status</span>
                  <div>
                    <Badge className={getStatusBadge(selectedJob.status)}>
                      {selectedJob.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Schedule</span>
                  <div className="font-mono">{selectedJob.schedule}</div>
                </div>
                <div>
                  <span className="text-gray-500">Total Runs</span>
                  <div className="font-medium">{selectedJob.totalRuns.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-gray-500">Success Rate</span>
                  <div className="font-medium">{selectedJob.successRate}%</div>
                </div>
              </div>

              <div>
                <span className="text-gray-500 text-sm">Description</span>
                <p className="mt-1">{selectedJob.description}</p>
              </div>

              <div className="border-t pt-4">
                <Label className="mb-2 block">Job Status</Label>
                <div className="flex items-center justify-between">
                  <span>{selectedJob.status === 'active' ? 'Job is running on schedule' : 'Job is paused'}</span>
                  <Switch
                    checked={selectedJob.status === 'active'}
                    onCheckedChange={() => handleToggleJob(selectedJob.id)}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Job History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Execution History
            </DialogTitle>
            <DialogDescription>{selectedJob?.name}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3">
              {mockHistory
                .filter(h => h.jobName === selectedJob?.name)
                .map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(entry.status)}
                      <div>
                        <div className="font-medium">{entry.status === 'success' ? 'Completed' : 'Failed'}</div>
                        <div className="text-sm text-gray-500">{formatDateTime(entry.startedAt)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {entry.status === 'success' ? (
                        <div className="text-sm text-gray-600">
                          {formatDuration(entry.duration)}
                        </div>
                      ) : (
                        <div className="text-sm text-red-600">{entry.error}</div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHistoryDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduledJobsPage;
