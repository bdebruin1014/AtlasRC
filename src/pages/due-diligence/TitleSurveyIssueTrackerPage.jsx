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
  FileText,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Building2,
  Flag,
  Eye,
  MessageSquare,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock title/survey issues data
const initialIssues = [
  {
    id: 1,
    project: 'Oak Street Industrial',
    type: 'Title',
    category: 'Easement',
    description: 'Utility easement along eastern boundary not shown in preliminary report',
    severity: 'Medium',
    status: 'In Progress',
    identifiedDate: '2024-01-12',
    resolvedDate: null,
    assignee: 'Sarah Chen',
    resolution: '',
    titleException: 'Schedule B, Exception 5',
    impactOnClosing: 'Must be resolved prior to closing',
    comments: [
      { date: '2024-01-12', user: 'Sarah Chen', text: 'Identified during title review. Contacting utility company.' },
      { date: '2024-01-15', user: 'Sarah Chen', text: 'Utility company confirmed easement exists. Requesting documentation.' }
    ]
  },
  {
    id: 2,
    project: 'Oak Street Industrial',
    type: 'Survey',
    category: 'Encroachment',
    description: 'Neighboring fence encroaches 2.5 feet onto subject property',
    severity: 'Low',
    status: 'Monitoring',
    identifiedDate: '2024-01-14',
    resolvedDate: null,
    assignee: 'Mike Johnson',
    resolution: 'Seller to obtain encroachment agreement from neighbor',
    titleException: null,
    impactOnClosing: 'Minor - can close with escrow holdback',
    comments: [
      { date: '2024-01-14', user: 'Mike Johnson', text: 'Surveyor flagged fence encroachment. Discussing with seller.' }
    ]
  },
  {
    id: 3,
    project: 'Oak Street Industrial',
    type: 'Title',
    category: 'Lien',
    description: 'Mechanics lien filed by previous contractor - $45,000',
    severity: 'High',
    status: 'Resolved',
    identifiedDate: '2024-01-10',
    resolvedDate: '2024-01-18',
    assignee: 'Legal Team',
    resolution: 'Seller paid lien in full. Release recorded.',
    titleException: 'Schedule B, Exception 8',
    impactOnClosing: 'Was blocking closing - now resolved',
    comments: [
      { date: '2024-01-10', user: 'Legal Team', text: 'Mechanics lien identified in title search.' },
      { date: '2024-01-15', user: 'Legal Team', text: 'Seller negotiating with lienholder.' },
      { date: '2024-01-18', user: 'Legal Team', text: 'Lien released. Recording confirmed.' }
    ]
  },
  {
    id: 4,
    project: 'Sunset Land Development',
    type: 'Survey',
    category: 'Boundary',
    description: 'Minor boundary discrepancy with county records (0.02 acres)',
    severity: 'Low',
    status: 'Resolved',
    identifiedDate: '2023-12-20',
    resolvedDate: '2024-01-05',
    assignee: 'Survey Team',
    resolution: 'Boundary line agreement executed with adjacent owner',
    titleException: null,
    impactOnClosing: 'Resolved - no impact',
    comments: [
      { date: '2023-12-20', user: 'Survey Team', text: 'Discrepancy noted during ALTA survey.' },
      { date: '2024-01-05', user: 'Survey Team', text: 'BLA recorded. Issue resolved.' }
    ]
  },
  {
    id: 5,
    project: 'Sunset Land Development',
    type: 'Title',
    category: 'Restriction',
    description: 'Deed restriction requires minimum 2-acre lot sizes',
    severity: 'High',
    status: 'In Progress',
    identifiedDate: '2023-12-18',
    resolvedDate: null,
    assignee: 'Legal Team',
    resolution: '',
    titleException: 'Schedule B, Exception 3',
    impactOnClosing: 'Critical - affects subdivision plan',
    comments: [
      { date: '2023-12-18', user: 'Legal Team', text: 'Restriction identified that conflicts with planned 1-acre lots.' },
      { date: '2023-12-22', user: 'Legal Team', text: 'Researching modification process with HOA.' },
      { date: '2024-01-10', user: 'Legal Team', text: 'HOA meeting scheduled for 1/25 to vote on restriction modification.' }
    ]
  },
  {
    id: 6,
    project: 'Harbor View Homes - Unit 11',
    type: 'Title',
    category: 'HOA',
    description: 'Outstanding HOA assessment balance of $1,200',
    severity: 'Low',
    status: 'Resolved',
    identifiedDate: '2024-01-20',
    resolvedDate: '2024-01-22',
    assignee: 'Closing Team',
    resolution: 'Seller paid balance. Estoppel updated.',
    titleException: null,
    impactOnClosing: 'Resolved - no impact',
    comments: [
      { date: '2024-01-20', user: 'Closing Team', text: 'HOA estoppel shows unpaid balance.' },
      { date: '2024-01-22', user: 'Closing Team', text: 'Seller paid. Updated estoppel received.' }
    ]
  }
];

const issueCategories = {
  'Title': ['Lien', 'Easement', 'Restriction', 'HOA', 'Judgment', 'Tax Lien', 'Mortgage', 'Other'],
  'Survey': ['Boundary', 'Encroachment', 'Setback', 'Flood Zone', 'Access', 'Utility', 'Other']
};

export default function TitleSurveyIssueTrackerPage() {
  const [issues, setIssues] = useState(initialIssues);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const { toast } = useToast();

  const [newIssue, setNewIssue] = useState({
    project: '',
    type: '',
    category: '',
    description: '',
    severity: '',
    assignee: '',
    impactOnClosing: ''
  });

  const [newComment, setNewComment] = useState('');

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchesSearch = issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           issue.project.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProject = projectFilter === 'all' || issue.project === projectFilter;
      const matchesType = typeFilter === 'all' || issue.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
      const matchesSeverity = severityFilter === 'all' || issue.severity === severityFilter;
      return matchesSearch && matchesProject && matchesType && matchesStatus && matchesSeverity;
    });
  }, [issues, searchTerm, projectFilter, typeFilter, statusFilter, severityFilter]);

  const projects = useMemo(() => {
    return [...new Set(issues.map(i => i.project))];
  }, [issues]);

  const stats = useMemo(() => {
    const open = issues.filter(i => i.status !== 'Resolved').length;
    const high = issues.filter(i => i.severity === 'High' && i.status !== 'Resolved').length;
    const resolved = issues.filter(i => i.status === 'Resolved').length;
    const titleIssues = issues.filter(i => i.type === 'Title' && i.status !== 'Resolved').length;
    const surveyIssues = issues.filter(i => i.type === 'Survey' && i.status !== 'Resolved').length;
    return { open, high, resolved, titleIssues, surveyIssues, total: issues.length };
  }, [issues]);

  const handleAddIssue = () => {
    const issue = {
      id: Math.max(...issues.map(i => i.id)) + 1,
      ...newIssue,
      status: 'Open',
      identifiedDate: new Date().toISOString().split('T')[0],
      resolvedDate: null,
      resolution: '',
      titleException: null,
      comments: []
    };
    setIssues([...issues, issue]);
    setIsAddDialogOpen(false);
    setNewIssue({
      project: '',
      type: '',
      category: '',
      description: '',
      severity: '',
      assignee: '',
      impactOnClosing: ''
    });
    toast({
      title: "Issue Logged",
      description: `New ${issue.type.toLowerCase()} issue has been logged.`
    });
  };

  const handleStatusUpdate = (issueId, newStatus) => {
    setIssues(issues.map(issue => {
      if (issue.id === issueId) {
        return {
          ...issue,
          status: newStatus,
          resolvedDate: newStatus === 'Resolved' ? new Date().toISOString().split('T')[0] : null
        };
      }
      return issue;
    }));
    toast({
      title: "Status Updated",
      description: `Issue status changed to ${newStatus}.`
    });
  };

  const handleAddComment = (issueId) => {
    if (!newComment.trim()) return;
    setIssues(issues.map(issue => {
      if (issue.id === issueId) {
        return {
          ...issue,
          comments: [
            ...issue.comments,
            { date: new Date().toISOString().split('T')[0], user: 'Current User', text: newComment }
          ]
        };
      }
      return issue;
    }));
    setNewComment('');
    toast({
      title: "Comment Added",
      description: "Your comment has been added to the issue."
    });
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'Low': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-red-100 text-red-800'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Open': 'bg-red-100 text-red-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Monitoring': 'bg-yellow-100 text-yellow-800',
      'Resolved': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type) => {
    return type === 'Title' ? 'bg-purple-100 text-purple-800' : 'bg-cyan-100 text-cyan-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Title & Survey Issue Tracker</h1>
          <p className="text-muted-foreground">Track and resolve title exceptions and survey issues</p>
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
              <DialogTitle>Log Title/Survey Issue</DialogTitle>
              <DialogDescription>Document a new issue identified during due diligence</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
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
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newIssue.type}
                    onValueChange={(value) => setNewIssue({ ...newIssue, type: value, category: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Title">Title</SelectItem>
                      <SelectItem value="Survey">Survey</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={newIssue.category}
                    onValueChange={(value) => setNewIssue({ ...newIssue, category: value })}
                    disabled={!newIssue.type}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {newIssue.type && issueCategories[newIssue.type].map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newIssue.description}
                  onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                  placeholder="Describe the issue..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select
                    value={newIssue.severity}
                    onValueChange={(value) => setNewIssue({ ...newIssue, severity: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assignee</Label>
                  <Input
                    value={newIssue.assignee}
                    onChange={(e) => setNewIssue({ ...newIssue, assignee: e.target.value })}
                    placeholder="Person responsible"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Impact on Closing</Label>
                <Input
                  value={newIssue.impactOnClosing}
                  onChange={(e) => setNewIssue({ ...newIssue, impactOnClosing: e.target.value })}
                  placeholder="How does this affect closing?"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddIssue} disabled={!newIssue.project || !newIssue.type || !newIssue.description}>
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
            <p className="text-xs text-muted-foreground">Need resolution</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Severity</CardTitle>
            <Flag className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.high}</div>
            <p className="text-xs text-muted-foreground">Critical issues</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Title Issues</CardTitle>
            <FileText className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.titleIssues}</div>
            <p className="text-xs text-muted-foreground">Open</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Survey Issues</CardTitle>
            <MapPin className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.surveyIssues}</div>
            <p className="text-xs text-muted-foreground">Open</p>
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
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Title">Title</SelectItem>
                <SelectItem value="Survey">Survey</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
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
                <SelectItem value="Monitoring">Monitoring</SelectItem>
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
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIssues.map(issue => (
                <TableRow key={issue.id}>
                  <TableCell className="font-medium">{issue.project}</TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(issue.type)}>{issue.type}</Badge>
                  </TableCell>
                  <TableCell>{issue.category}</TableCell>
                  <TableCell className="max-w-xs truncate">{issue.description}</TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(issue.severity)}>{issue.severity}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(issue.status)}>{issue.status}</Badge>
                  </TableCell>
                  <TableCell>{issue.assignee}</TableCell>
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
                          <SelectItem value="Monitoring">Monitoring</SelectItem>
                          <SelectItem value="Resolved">Resolved</SelectItem>
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
                  {selectedIssue.project}
                  <Badge className={getTypeColor(selectedIssue.type)}>{selectedIssue.type}</Badge>
                  <Badge className={getSeverityColor(selectedIssue.severity)}>{selectedIssue.severity}</Badge>
                </DialogTitle>
                <DialogDescription>{selectedIssue.category} Issue</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">Description</h4>
                  <p className="text-sm">{selectedIssue.description}</p>
                </div>

                {selectedIssue.titleException && (
                  <div>
                    <h4 className="font-semibold mb-1">Title Exception</h4>
                    <p className="text-sm text-muted-foreground">{selectedIssue.titleException}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-1">Impact on Closing</h4>
                  <p className="text-sm">{selectedIssue.impactOnClosing}</p>
                </div>

                {selectedIssue.resolution && (
                  <div>
                    <h4 className="font-semibold mb-1">Resolution</h4>
                    <p className="text-sm text-green-700">{selectedIssue.resolution}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Identified:</span>
                    <span className="ml-2">{selectedIssue.identifiedDate}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Assignee:</span>
                    <span className="ml-2">{selectedIssue.assignee}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className={`ml-2 ${getStatusColor(selectedIssue.status)}`}>
                      {selectedIssue.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Activity</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedIssue.comments.map((comment, index) => (
                      <div key={index} className="p-2 bg-muted rounded text-sm">
                        <div className="flex justify-between text-muted-foreground text-xs mb-1">
                          <span>{comment.user}</span>
                          <span>{comment.date}</span>
                        </div>
                        <p>{comment.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1"
                  />
                  <Button onClick={() => handleAddComment(selectedIssue.id)}>
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
