import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  UserPlus, Search, RefreshCw, CheckCircle, Circle, Clock, Mail,
  Shield, BookOpen, Settings, Users, ChevronRight, ArrowRight, Send, Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ROLES, ROLE_LABELS } from '@/services/permissionService';

// Mock provisioning requests
const mockProvisioningRequests = [
  {
    id: 'prov_001',
    userName: 'Alex Thompson',
    userEmail: 'alex.thompson@atlasrc.com',
    requestedRole: 'project_manager',
    department: 'Development',
    requestedBy: 'John Smith',
    requestedAt: '2024-01-15T10:00:00Z',
    status: 'in_progress',
    completedSteps: ['account_created', 'role_assigned', 'welcome_email'],
    pendingSteps: ['training_assigned', 'manager_approval'],
  },
  {
    id: 'prov_002',
    userName: 'Maria Garcia',
    userEmail: 'maria.garcia@atlasrc.com',
    requestedRole: 'accountant',
    department: 'Finance',
    requestedBy: 'Emily Chen',
    requestedAt: '2024-01-14T14:30:00Z',
    status: 'pending_approval',
    completedSteps: [],
    pendingSteps: ['account_created', 'role_assigned', 'welcome_email', 'training_assigned', 'manager_approval'],
  },
  {
    id: 'prov_003',
    userName: 'David Lee',
    userEmail: 'david.lee@atlasrc.com',
    requestedRole: 'team_member',
    department: 'Sales',
    requestedBy: 'Sarah Johnson',
    requestedAt: '2024-01-13T09:15:00Z',
    status: 'completed',
    completedSteps: ['account_created', 'role_assigned', 'welcome_email', 'training_assigned', 'manager_approval'],
    pendingSteps: [],
    completedAt: '2024-01-14T16:00:00Z',
  },
];

// Onboarding checklist template
const onboardingSteps = [
  { id: 'account_created', label: 'Create User Account', icon: UserPlus, description: 'Create account with basic info' },
  { id: 'role_assigned', label: 'Assign Role & Permissions', icon: Shield, description: 'Set up role-based access' },
  { id: 'welcome_email', label: 'Send Welcome Email', icon: Mail, description: 'Send credentials and welcome info' },
  { id: 'training_assigned', label: 'Assign Training Modules', icon: BookOpen, description: 'Required onboarding training' },
  { id: 'manager_approval', label: 'Manager Approval', icon: CheckCircle, description: 'Final approval from manager' },
];

const UserProvisioningPage = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState(mockProvisioningRequests);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [newRequest, setNewRequest] = useState({
    userName: '',
    userEmail: '',
    requestedRole: 'team_member',
    department: '',
    sendWelcomeEmail: true,
    assignTraining: true,
    requireApproval: true,
  });

  const filteredRequests = requests.filter(req => {
    const matchesSearch = !searchQuery ||
      req.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.userEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'pending_approval': return 'Pending Approval';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateProgress = (request) => {
    const total = request.completedSteps.length + request.pendingSteps.length;
    return Math.round((request.completedSteps.length / total) * 100);
  };

  const handleCreateRequest = async () => {
    if (!newRequest.userName || !newRequest.userEmail || !newRequest.department) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in all required fields',
      });
      return;
    }

    const pendingSteps = ['account_created', 'role_assigned'];
    if (newRequest.sendWelcomeEmail) pendingSteps.push('welcome_email');
    if (newRequest.assignTraining) pendingSteps.push('training_assigned');
    if (newRequest.requireApproval) pendingSteps.push('manager_approval');

    const request = {
      id: `prov_${Date.now()}`,
      userName: newRequest.userName,
      userEmail: newRequest.userEmail,
      requestedRole: newRequest.requestedRole,
      department: newRequest.department,
      requestedBy: 'Current User',
      requestedAt: new Date().toISOString(),
      status: 'pending_approval',
      completedSteps: [],
      pendingSteps,
    };

    setRequests(prev => [request, ...prev]);
    setShowNewRequestDialog(false);
    setNewRequest({
      userName: '',
      userEmail: '',
      requestedRole: 'team_member',
      department: '',
      sendWelcomeEmail: true,
      assignTraining: true,
      requireApproval: true,
    });

    toast({
      title: 'Request Created',
      description: 'User provisioning request has been created',
    });
  };

  const handleApproveRequest = (requestId) => {
    setRequests(prev => prev.map(req => {
      if (req.id !== requestId) return req;
      return {
        ...req,
        status: 'in_progress',
        completedSteps: ['account_created'],
        pendingSteps: req.pendingSteps.filter(s => s !== 'account_created'),
      };
    }));

    toast({
      title: 'Request Approved',
      description: 'Provisioning workflow has started',
    });
  };

  const handleCompleteStep = (requestId, stepId) => {
    setRequests(prev => prev.map(req => {
      if (req.id !== requestId) return req;

      const newCompletedSteps = [...req.completedSteps, stepId];
      const newPendingSteps = req.pendingSteps.filter(s => s !== stepId);
      const isComplete = newPendingSteps.length === 0;

      return {
        ...req,
        completedSteps: newCompletedSteps,
        pendingSteps: newPendingSteps,
        status: isComplete ? 'completed' : 'in_progress',
        completedAt: isComplete ? new Date().toISOString() : undefined,
      };
    }));

    toast({
      title: 'Step Completed',
      description: 'Provisioning step has been marked as complete',
    });
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsDialog(true);
  };

  // Stats
  const totalRequests = requests.length;
  const completedRequests = requests.filter(r => r.status === 'completed').length;
  const inProgressRequests = requests.filter(r => r.status === 'in_progress').length;
  const pendingRequests = requests.filter(r => r.status === 'pending_approval').length;

  return (
    <div className="space-y-6">
      <Helmet>
        <title>User Provisioning | Admin</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Provisioning</h1>
          <p className="text-gray-600 mt-2">Onboarding workflow with checklist and training tracking</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowNewRequestDialog(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          New Provisioning Request
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Requests</p>
                <p className="text-2xl font-bold">{totalRequests}</p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedRequests}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{inProgressRequests}</p>
              </div>
              <RefreshCw className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingRequests}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
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
                placeholder="Search by name or email..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Provisioning Requests</CardTitle>
          <CardDescription>Track and manage user onboarding workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No provisioning requests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.userName}</div>
                        <div className="text-sm text-gray-500">{request.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{ROLE_LABELS[request.requestedRole]}</Badge>
                    </TableCell>
                    <TableCell>{request.department}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{request.requestedBy}</div>
                        <div className="text-gray-500">{formatDateTime(request.requestedAt)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{request.completedSteps.length}/{request.completedSteps.length + request.pendingSteps.length}</span>
                          <span>{calculateProgress(request)}%</span>
                        </div>
                        <Progress value={calculateProgress(request)} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(request.status)}>
                        {getStatusLabel(request.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(request)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {request.status === 'pending_approval' && (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleApproveRequest(request.id)}
                          >
                            Approve
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Request Dialog */}
      <Dialog open={showNewRequestDialog} onOpenChange={setShowNewRequestDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Provisioning Request</DialogTitle>
            <DialogDescription>
              Create a new user onboarding request
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="userName">Full Name *</Label>
              <Input
                id="userName"
                placeholder="John Doe"
                value={newRequest.userName}
                onChange={(e) => setNewRequest(prev => ({ ...prev, userName: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="userEmail">Email *</Label>
              <Input
                id="userEmail"
                type="email"
                placeholder="john.doe@atlasrc.com"
                value={newRequest.userEmail}
                onChange={(e) => setNewRequest(prev => ({ ...prev, userEmail: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select
                  value={newRequest.requestedRole}
                  onValueChange={(value) => setNewRequest(prev => ({ ...prev, requestedRole: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLES).map(([key, value]) => (
                      <SelectItem key={value} value={value}>
                        {ROLE_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Department *</Label>
                <Select
                  value={newRequest.department}
                  onValueChange={(value) => setNewRequest(prev => ({ ...prev, department: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Executive">Executive</SelectItem>
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="Construction">Construction</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-3 pt-2">
              <Label>Onboarding Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sendWelcomeEmail"
                    checked={newRequest.sendWelcomeEmail}
                    onCheckedChange={(checked) =>
                      setNewRequest(prev => ({ ...prev, sendWelcomeEmail: checked }))
                    }
                  />
                  <Label htmlFor="sendWelcomeEmail" className="font-normal">
                    Send welcome email with credentials
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="assignTraining"
                    checked={newRequest.assignTraining}
                    onCheckedChange={(checked) =>
                      setNewRequest(prev => ({ ...prev, assignTraining: checked }))
                    }
                  />
                  <Label htmlFor="assignTraining" className="font-normal">
                    Assign required training modules
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requireApproval"
                    checked={newRequest.requireApproval}
                    onCheckedChange={(checked) =>
                      setNewRequest(prev => ({ ...prev, requireApproval: checked }))
                    }
                  />
                  <Label htmlFor="requireApproval" className="font-normal">
                    Require manager approval
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewRequestDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRequest} className="bg-blue-600 hover:bg-blue-700">
              Create Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Provisioning Details</DialogTitle>
            <DialogDescription>
              {selectedRequest && `Onboarding workflow for ${selectedRequest.userName}`}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="py-4 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Email:</span>
                  <span className="ml-2 font-medium">{selectedRequest.userEmail}</span>
                </div>
                <div>
                  <span className="text-gray-500">Role:</span>
                  <span className="ml-2">{ROLE_LABELS[selectedRequest.requestedRole]}</span>
                </div>
                <div>
                  <span className="text-gray-500">Department:</span>
                  <span className="ml-2">{selectedRequest.department}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <Badge className={`ml-2 ${getStatusBadge(selectedRequest.status)}`}>
                    {getStatusLabel(selectedRequest.status)}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Onboarding Checklist</h4>
                <div className="space-y-3">
                  {onboardingSteps.map((step, index) => {
                    const isCompleted = selectedRequest.completedSteps.includes(step.id);
                    const isPending = selectedRequest.pendingSteps.includes(step.id);
                    const isNext = !isCompleted && selectedRequest.pendingSteps[0] === step.id;

                    return (
                      <div
                        key={step.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          isCompleted ? 'bg-green-50 border-green-200' :
                          isNext ? 'bg-blue-50 border-blue-200' :
                          'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-green-500 text-white' :
                          isNext ? 'bg-blue-500 text-white' :
                          'bg-gray-300 text-gray-600'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <step.icon className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{step.label}</div>
                          <div className="text-sm text-gray-500">{step.description}</div>
                        </div>
                        {isNext && selectedRequest.status === 'in_progress' && (
                          <Button
                            size="sm"
                            onClick={() => handleCompleteStep(selectedRequest.id, step.id)}
                          >
                            Complete
                          </Button>
                        )}
                        {isCompleted && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    );
                  })}
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
    </div>
  );
};

export default UserProvisioningPage;
