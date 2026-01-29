import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import {
  AlertTriangle,
  Plus,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Flag,
  Building2,
  Users,
  Calendar,
  DollarSign,
  MessageSquare,
  Eye,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock project issues data
const initialIssues = [
  {
    id: 1,
    project: 'Riverside Apartments',
    title: 'Permitting delay for mechanical systems',
    category: 'Permitting',
    priority: 'High',
    status: 'In Progress',
    reportedDate: '2024-01-10',
    dueDate: '2024-01-25',
    resolvedDate: null,
    assignee: 'Mike Johnson',
    estimatedCost: 0,
    actualCost: 0,
    scheduleImpact: '2 weeks',
    description: 'City requires additional documentation for HVAC permit approval',
    rootCause: 'New code requirements not identified in initial review',
    resolution: '',
    updates: [
      { date: '2024-01-10', user: 'Mike Johnson', text: 'Issue identified during permit review' },
      { date: '2024-01-15', user: 'Mike Johnson', text: 'Meeting scheduled with city planner for 1/18' }
    ]
  },
  {
    id: 2,
    project: 'Riverside Apartments',
    title: 'Concrete delivery shortage',
    category: 'Supply Chain',
    priority: 'Medium',
    status: 'Resolved',
    reportedDate: '2024-01-05',
    dueDate: '2024-01-10',
    resolvedDate: '2024-01-08',
    assignee: 'Sarah Chen',
    estimatedCost: 15000,
    actualCost: 12500,
    scheduleImpact: '3 days',
    description: 'Primary concrete supplier unable to fulfill order due to equipment failure',
    rootCause: 'Supplier equipment maintenance issue',
    resolution: 'Sourced from secondary supplier at slightly higher cost',
    updates: [
      { date: '2024-01-05', user: 'Sarah Chen', text: 'Supplier notified of delivery issue' },
      { date: '2024-01-06', user: 'Sarah Chen', text: 'Identified backup supplier' },
      { date: '2024-01-08', user: 'Sarah Chen', text: 'Delivery completed from backup supplier' }
    ]
  },
  {
    id: 3,
    project: 'Sunset Land Development',
    title: 'Drainage easement negotiation stalled',
    category: 'Legal',
    priority: 'High',
    status: 'In Progress',
    reportedDate: '2024-01-02',
    dueDate: '2024-02-01',
    resolvedDate: null,
    assignee: 'Legal Team',
    estimatedCost: 25000,
    actualCost: 0,
    scheduleImpact: '4 weeks',
    description: 'Adjacent landowner requesting higher compensation for drainage easement',
    rootCause: 'Initial offer below market expectations',
    resolution: '',
    updates: [
      { date: '2024-01-02', user: 'Legal Team', text: 'Initial easement offer rejected' },
      { date: '2024-01-10', user: 'Legal Team', text: 'Counter-offer submitted' },
      { date: '2024-01-18', user: 'Legal Team', text: 'Negotiation ongoing, may need mediation' }
    ]
  },
  {
    id: 4,
    project: 'Sunset Land Development',
    title: 'Utility relocation required',
    category: 'Infrastructure',
    priority: 'Medium',
    status: 'Open',
    reportedDate: '2024-01-15',
    dueDate: '2024-03-01',
    resolvedDate: null,
    assignee: 'Tom Richards',
    estimatedCost: 85000,
    actualCost: 0,
    scheduleImpact: '6 weeks',
    description: 'Gas line conflicts with planned road alignment, requires relocation',
    rootCause: 'Utility location not accurately shown on as-built drawings',
    resolution: '',
    updates: [
      { date: '2024-01-15', user: 'Tom Richards', text: 'Conflict identified during civil design review' },
      { date: '2024-01-18', user: 'Tom Richards', text: 'Meeting with gas company scheduled for 1/25' }
    ]
  },
  {
    id: 5,
    project: 'Harbor View Homes',
    title: 'Subcontractor quality issue - flooring',
    category: 'Quality',
    priority: 'Medium',
    status: 'Resolved',
    reportedDate: '2024-01-08',
    dueDate: '2024-01-15',
    resolvedDate: '2024-01-14',
    assignee: 'Quality Team',
    estimatedCost: 8000,
    actualCost: 6500,
    scheduleImpact: '1 week',
    description: 'Flooring installation in Unit 8 does not meet specifications',
    rootCause: 'Subcontractor used incorrect adhesive',
    resolution: 'Flooring removed and reinstalled at subcontractor expense',
    updates: [
      { date: '2024-01-08', user: 'Quality Team', text: 'Issue identified during inspection' },
      { date: '2024-01-10', user: 'Quality Team', text: 'Subcontractor acknowledged fault' },
      { date: '2024-01-14', user: 'Quality Team', text: 'Reinstallation complete, passed inspection' }
    ]
  },
  {
    id: 6,
    project: 'Downtown Mixed Use',
    title: 'Fire sprinkler design revision required',
    category: 'Design',
    priority: 'High',
    status: 'In Progress',
    reportedDate: '2024-01-12',
    dueDate: '2024-01-30',
    resolvedDate: null,
    assignee: 'Design Team',
    estimatedCost: 35000,
    actualCost: 0,
    scheduleImpact: '3 weeks',
    description: 'Fire marshal requires additional coverage in retail areas',
    rootCause: 'Updated fire code requirements for mixed-use occupancy',
    resolution: '',
    updates: [
      { date: '2024-01-12', user: 'Design Team', text: 'Fire marshal review comments received' },
      { date: '2024-01-15', user: 'Design Team', text: 'MEP engineer revising drawings' }
    ]
  }
];

const issueCategories = [
  'Permitting', 'Legal', 'Design', 'Supply Chain', 'Quality',
  'Infrastructure', 'Weather', 'Financial', 'Subcontractor', 'Safety', 'Other'
];

export default function ProjectIssueTrackerPage() {
  const [issues, setIssues] = useState(initialIssues);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const { toast } = useToast();

  const [newIssue, setNewIssue] = useState({
    project: '',
    title: '',
    category: '',
    priority: '',
    description: '',
    assignee: '',
    dueDate: '',
    estimatedCost: '',
    scheduleImpact: ''
  });

  const [newUpdate, setNewUpdate] = useState('');

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           issue.project.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProject = projectFilter === 'all' || issue.project === projectFilter;
      const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;
      const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
      const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
      return matchesSearch && matchesProject && matchesCategory && matchesPriority && matchesStatus;
    });
  }, [issues, searchTerm, projectFilter, categoryFilter, priorityFilter, statusFilter]);

  const projects = useMemo(() => {
    return [...new Set(issues.map(i => i.project))];
  }, [issues]);

  const stats = useMemo(() => {
    const open = issues.filter(i => i.status !== 'Resolved' && i.status !== 'Closed').length;
    const high = issues.filter(i => i.priority === 'High' && i.status !== 'Resolved').length;
    const resolved = issues.filter(i => i.status === 'Resolved').length;
    const totalCostImpact = issues.filter(i => i.status !== 'Resolved')
      .reduce((sum, i) => sum + i.estimatedCost, 0);
    return { open, high, resolved, totalCostImpact, total: issues.length };
  }, [issues]);

  const handleAddIssue = () => {
    const issue = {
      id: Math.max(...issues.map(i => i.id)) + 1,
      ...newIssue,
      status: 'Open',
      reportedDate: new Date().toISOString().split('T')[0],
      resolvedDate: null,
      estimatedCost: parseFloat(newIssue.estimatedCost) || 0,
      actualCost: 0,
      rootCause: '',
      resolution: '',
      updates: [
        { date: new Date().toISOString().split('T')[0], user: 'Current User', text: 'Issue created' }
      ]
    };
    setIssues([...issues, issue]);
    setIsAddDialogOpen(false);
    setNewIssue({
      project: '',
      title: '',
      category: '',
      priority: '',
      description: '',
      assignee: '',
      dueDate: '',
      estimatedCost: '',
      scheduleImpact: ''
    });
    toast({
      title: "Issue Created",
      description: `Issue "${issue.title}" has been logged.`
    });
  };

  const handleStatusUpdate = (issueId, newStatus) => {
    setIssues(issues.map(issue => {
      if (issue.id === issueId) {
        return {
          ...issue,
          status: newStatus,
          resolvedDate: newStatus === 'Resolved' ? new Date().toISOString().split('T')[0] : null,
          updates: [
            ...issue.updates,
            { date: new Date().toISOString().split('T')[0], user: 'Current User', text: `Status changed to ${newStatus}` }
          ]
        };
      }
      return issue;
    }));
    toast({
      title: "Status Updated",
      description: `Issue status changed to ${newStatus}.`
    });
  };

  const handleAddUpdate = (issueId) => {
    if (!newUpdate.trim()) return;
    setIssues(issues.map(issue => {
      if (issue.id === issueId) {
        return {
          ...issue,
          updates: [
            ...issue.updates,
            { date: new Date().toISOString().split('T')[0], user: 'Current User', text: newUpdate }
          ]
        };
      }
      return issue;
    }));
    setNewUpdate('');
    toast({
      title: "Update Added",
      description: "Your update has been added to the issue."
    });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-red-100 text-red-800',
      'Critical': 'bg-red-200 text-red-900'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Open': 'bg-red-100 text-red-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'On Hold': 'bg-yellow-100 text-yellow-800',
      'Resolved': 'bg-green-100 text-green-800',
      'Closed': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Project Issue Tracker</h1>
          <p className="text-muted-foreground">Track and manage project issues across all developments</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Log Issue
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Log New Issue</DialogTitle>
              <DialogDescription>Document a project issue requiring attention</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                <Label>Project</Label>
                <Select
                  value={newIssue.project}
                  onValueChange={(value) => setNewIssue({ ...newIssue, project: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project} value={project}>{project}</SelectItem>
                    ))}
                    <SelectItem value="New Project">+ Add New Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Issue Title</Label>
                <Input
                  value={newIssue.title}
                  onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                  placeholder="Brief description of the issue"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={newIssue.category}
                    onValueChange={(value) => setNewIssue({ ...newIssue, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {issueCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={newIssue.priority}
                    onValueChange={(value) => setNewIssue({ ...newIssue, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newIssue.description}
                  onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                  placeholder="Detailed description of the issue..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Assignee</Label>
                  <Input
                    value={newIssue.assignee}
                    onChange={(e) => setNewIssue({ ...newIssue, assignee: e.target.value })}
                    placeholder="Person responsible"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={newIssue.dueDate}
                    onChange={(e) => setNewIssue({ ...newIssue, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estimated Cost Impact ($)</Label>
                  <Input
                    type="number"
                    value={newIssue.estimatedCost}
                    onChange={(e) => setNewIssue({ ...newIssue, estimatedCost: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Schedule Impact</Label>
                  <Input
                    value={newIssue.scheduleImpact}
                    onChange={(e) => setNewIssue({ ...newIssue, scheduleImpact: e.target.value })}
                    placeholder="e.g., 2 weeks"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddIssue} disabled={!newIssue.project || !newIssue.title}>
                Log Issue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.open}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Flag className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.high}</div>
            <p className="text-xs text-muted-foreground">Critical issues</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Impact</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalCostImpact.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Open issues</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tracked</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search issues..."
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {issueCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Issues Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Cost Impact</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIssues.map(issue => (
                <TableRow key={issue.id}>
                  <TableCell className="font-medium">{issue.project}</TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate">{issue.title}</div>
                    {issue.scheduleImpact && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {issue.scheduleImpact} delay
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{issue.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(issue.priority)}>{issue.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(issue.status)}>{issue.status}</Badge>
                  </TableCell>
                  <TableCell>{issue.assignee}</TableCell>
                  <TableCell>${issue.estimatedCost.toLocaleString()}</TableCell>
                  <TableCell>{issue.dueDate}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedIssue(issue)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Select
                        value={issue.status}
                        onValueChange={(value) => handleStatusUpdate(issue.id, value)}
                      >
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Open">Open</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="On Hold">On Hold</SelectItem>
                          <SelectItem value="Resolved">Resolved</SelectItem>
                          <SelectItem value="Closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Issue Detail Dialog */}
      <Dialog open={!!selectedIssue} onOpenChange={() => setSelectedIssue(null)}>
        <DialogContent className="max-w-2xl">
          {selectedIssue && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {selectedIssue.title}
                </DialogTitle>
                <div className="flex gap-2">
                  <Badge className={getPriorityColor(selectedIssue.priority)}>{selectedIssue.priority}</Badge>
                  <Badge className={getStatusColor(selectedIssue.status)}>{selectedIssue.status}</Badge>
                  <Badge variant="outline">{selectedIssue.category}</Badge>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Project:</span>
                    <span className="ml-2 font-medium">{selectedIssue.project}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Assignee:</span>
                    <span className="ml-2 font-medium">{selectedIssue.assignee}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Reported:</span>
                    <span className="ml-2">{selectedIssue.reportedDate}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Due:</span>
                    <span className="ml-2">{selectedIssue.dueDate}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Est. Cost:</span>
                    <span className="ml-2">${selectedIssue.estimatedCost.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Schedule Impact:</span>
                    <span className="ml-2">{selectedIssue.scheduleImpact || 'None'}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-1">Description</h4>
                  <p className="text-sm">{selectedIssue.description}</p>
                </div>

                {selectedIssue.rootCause && (
                  <div>
                    <h4 className="font-semibold mb-1">Root Cause</h4>
                    <p className="text-sm">{selectedIssue.rootCause}</p>
                  </div>
                )}

                {selectedIssue.resolution && (
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-1">Resolution</h4>
                    <p className="text-sm text-green-700">{selectedIssue.resolution}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-2">Activity Log</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedIssue.updates.map((update, index) => (
                      <div key={index} className="p-2 bg-muted rounded text-sm">
                        <div className="flex justify-between text-muted-foreground text-xs mb-1">
                          <span>{update.user}</span>
                          <span>{update.date}</span>
                        </div>
                        <p>{update.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newUpdate}
                    onChange={(e) => setNewUpdate(e.target.value)}
                    placeholder="Add an update..."
                    className="flex-1"
                  />
                  <Button onClick={() => handleAddUpdate(selectedIssue.id)}>
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
