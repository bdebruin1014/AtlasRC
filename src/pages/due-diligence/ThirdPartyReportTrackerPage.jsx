import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Download,
  Upload,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Building2,
  Eye,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock third-party reports data
const initialReports = [
  {
    id: 1,
    project: 'Oak Street Industrial',
    reportType: 'Appraisal',
    vendor: 'Colliers Valuation',
    status: 'Completed',
    orderedDate: '2024-01-05',
    dueDate: '2024-01-19',
    receivedDate: '2024-01-18',
    cost: 4500,
    findings: 'Appraised value $14.2M, in line with purchase price',
    issues: 0,
    fileUrl: '/reports/appraisal-oak-street.pdf'
  },
  {
    id: 2,
    project: 'Oak Street Industrial',
    reportType: 'Phase I ESA',
    vendor: 'Terracon',
    status: 'Completed',
    orderedDate: '2024-01-05',
    dueDate: '2024-01-15',
    receivedDate: '2024-01-14',
    cost: 2800,
    findings: 'No RECs identified. Clean report.',
    issues: 0,
    fileUrl: '/reports/phase1-oak-street.pdf'
  },
  {
    id: 3,
    project: 'Oak Street Industrial',
    reportType: 'Property Condition Assessment',
    vendor: 'Partner Engineering',
    status: 'In Review',
    orderedDate: '2024-01-08',
    dueDate: '2024-01-18',
    receivedDate: '2024-01-17',
    cost: 3200,
    findings: 'Roof replacement recommended within 5 years. HVAC units nearing end of life.',
    issues: 2,
    fileUrl: '/reports/pca-oak-street.pdf'
  },
  {
    id: 4,
    project: 'Oak Street Industrial',
    reportType: 'ALTA Survey',
    vendor: 'Precision Surveying',
    status: 'In Progress',
    orderedDate: '2024-01-10',
    dueDate: '2024-01-24',
    receivedDate: null,
    cost: 5500,
    findings: null,
    issues: 0,
    fileUrl: null
  },
  {
    id: 5,
    project: 'Sunset Land Development',
    reportType: 'Appraisal',
    vendor: 'CBRE Valuation',
    status: 'Completed',
    orderedDate: '2023-12-15',
    dueDate: '2023-12-29',
    receivedDate: '2023-12-28',
    cost: 6500,
    findings: 'As-is value $2.4M, As-developed value $52M',
    issues: 0,
    fileUrl: '/reports/appraisal-sunset.pdf'
  },
  {
    id: 6,
    project: 'Sunset Land Development',
    reportType: 'Phase I ESA',
    vendor: 'ECS Environmental',
    status: 'Completed',
    orderedDate: '2023-12-15',
    dueDate: '2023-12-22',
    receivedDate: '2023-12-21',
    cost: 2200,
    findings: 'Historic agricultural use, no concerns identified',
    issues: 0,
    fileUrl: '/reports/phase1-sunset.pdf'
  },
  {
    id: 7,
    project: 'Sunset Land Development',
    reportType: 'Geotechnical Report',
    vendor: 'Terracon',
    status: 'Completed',
    orderedDate: '2023-12-18',
    dueDate: '2024-01-08',
    receivedDate: '2024-01-05',
    cost: 8500,
    findings: 'Soil conditions suitable for residential development. Standard foundations.',
    issues: 0,
    fileUrl: '/reports/geotech-sunset.pdf'
  },
  {
    id: 8,
    project: 'Riverside Apartments',
    reportType: 'Market Study',
    vendor: 'Zonda',
    status: 'Ordered',
    orderedDate: '2024-01-15',
    dueDate: '2024-02-01',
    receivedDate: null,
    cost: 12000,
    findings: null,
    issues: 0,
    fileUrl: null
  }
];

const reportTypes = [
  'Appraisal',
  'Phase I ESA',
  'Phase II ESA',
  'Property Condition Assessment',
  'ALTA Survey',
  'Boundary Survey',
  'Geotechnical Report',
  'Market Study',
  'Traffic Study',
  'Flood Certification',
  'Zoning Report',
  'Title Report'
];

const vendors = [
  'Colliers Valuation',
  'CBRE Valuation',
  'Terracon',
  'Partner Engineering',
  'ECS Environmental',
  'Precision Surveying',
  'Zonda',
  'JLL',
  'Cushman & Wakefield'
];

export default function ThirdPartyReportTrackerPage() {
  const [reports, setReports] = useState(initialReports);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const { toast } = useToast();

  const [newReport, setNewReport] = useState({
    project: '',
    reportType: '',
    vendor: '',
    dueDate: '',
    cost: ''
  });

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch = report.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           report.vendor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProject = projectFilter === 'all' || report.project === projectFilter;
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      const matchesType = typeFilter === 'all' || report.reportType === typeFilter;
      return matchesSearch && matchesProject && matchesStatus && matchesType;
    });
  }, [reports, searchTerm, projectFilter, statusFilter, typeFilter]);

  const projects = useMemo(() => {
    return [...new Set(reports.map(r => r.project))];
  }, [reports]);

  const stats = useMemo(() => {
    const totalCost = reports.reduce((sum, r) => sum + r.cost, 0);
    const completed = reports.filter(r => r.status === 'Completed').length;
    const inProgress = reports.filter(r => ['Ordered', 'In Progress', 'In Review'].includes(r.status)).length;
    const withIssues = reports.filter(r => r.issues > 0).length;
    return { totalCost, completed, inProgress, withIssues, total: reports.length };
  }, [reports]);

  const handleAddReport = () => {
    const report = {
      id: Math.max(...reports.map(r => r.id)) + 1,
      ...newReport,
      cost: parseFloat(newReport.cost) || 0,
      status: 'Ordered',
      orderedDate: new Date().toISOString().split('T')[0],
      receivedDate: null,
      findings: null,
      issues: 0,
      fileUrl: null
    };
    setReports([...reports, report]);
    setIsAddDialogOpen(false);
    setNewReport({ project: '', reportType: '', vendor: '', dueDate: '', cost: '' });
    toast({
      title: "Report Ordered",
      description: `${report.reportType} has been ordered from ${report.vendor}.`
    });
  };

  const handleStatusUpdate = (reportId, newStatus) => {
    setReports(reports.map(report => {
      if (report.id === reportId) {
        return {
          ...report,
          status: newStatus,
          receivedDate: newStatus === 'Completed' || newStatus === 'In Review'
            ? new Date().toISOString().split('T')[0]
            : report.receivedDate
        };
      }
      return report;
    }));
    toast({
      title: "Status Updated",
      description: `Report status changed to ${newStatus}.`
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Ordered': 'bg-gray-100 text-gray-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'In Review': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-green-100 text-green-800',
      'Issues Found': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'In Progress':
      case 'Ordered':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'In Review':
        return <Eye className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Third-Party Report Tracker</h1>
          <p className="text-muted-foreground">Track appraisals, environmental reports, and other third-party deliverables</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Order Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Order Third-Party Report</DialogTitle>
              <DialogDescription>Track a new third-party report order</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Project</Label>
                <Select
                  value={newReport.project}
                  onValueChange={(value) => setNewReport({ ...newReport, project: value })}
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
                <Label>Report Type</Label>
                <Select
                  value={newReport.reportType}
                  onValueChange={(value) => setNewReport({ ...newReport, reportType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Vendor</Label>
                <Select
                  value={newReport.vendor}
                  onValueChange={(value) => setNewReport({ ...newReport, vendor: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map(vendor => (
                      <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={newReport.dueDate}
                    onChange={(e) => setNewReport({ ...newReport, dueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cost ($)</Label>
                  <Input
                    type="number"
                    value={newReport.cost}
                    onChange={(e) => setNewReport({ ...newReport, cost: e.target.value })}
                    placeholder="5000"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddReport} disabled={!newReport.project || !newReport.reportType}>
                Order Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Across all projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Reports received</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Awaiting delivery</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.withIssues}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All reports</p>
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
                  placeholder="Search reports..."
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
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {reportTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Ordered">Ordered</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="In Review">In Review</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Report Type</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ordered</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Findings</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map(report => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.project}</TableCell>
                  <TableCell>{report.reportType}</TableCell>
                  <TableCell>{report.vendor}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(report.status)}>
                      {getStatusIcon(report.status)}
                      <span className="ml-1">{report.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>{report.orderedDate}</TableCell>
                  <TableCell>{report.dueDate}</TableCell>
                  <TableCell>${report.cost.toLocaleString()}</TableCell>
                  <TableCell className="max-w-xs">
                    {report.findings ? (
                      <div className="flex items-start gap-2">
                        <span className="text-sm truncate">{report.findings}</span>
                        {report.issues > 0 && (
                          <Badge variant="outline" className="text-yellow-600 shrink-0">
                            {report.issues} issues
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Pending</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {report.fileUrl && (
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Select
                        value={report.status}
                        onValueChange={(value) => handleStatusUpdate(report.id, value)}
                      >
                        <SelectTrigger className="w-28 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ordered">Ordered</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="In Review">In Review</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
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

      {/* Reports by Project Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Reports by Project</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.map(project => {
              const projectReports = reports.filter(r => r.project === project);
              const completed = projectReports.filter(r => r.status === 'Completed').length;
              const totalCost = projectReports.reduce((sum, r) => sum + r.cost, 0);

              return (
                <div key={project} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{project}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {completed}/{projectReports.length} complete • ${totalCost.toLocaleString()}
                    </div>
                  </div>
                  <Progress value={(completed / projectReports.length) * 100} className="h-2" />
                  <div className="flex flex-wrap gap-2 mt-3">
                    {projectReports.map(report => (
                      <Badge
                        key={report.id}
                        variant="outline"
                        className={report.status === 'Completed' ? 'border-green-300' : ''}
                      >
                        {report.reportType}
                        {report.status === 'Completed' && <CheckCircle className="h-3 w-3 ml-1 text-green-500" />}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
