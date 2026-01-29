import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import {
  GitBranch,
  Plus,
  Settings,
  Users,
  CheckCircle,
  Clock,
  ArrowRight,
  Trash2,
  Edit,
  Copy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock workflow data
const initialWorkflows = [
  {
    id: 1,
    name: 'Change Order Approval',
    description: 'Approval workflow for construction change orders',
    trigger: 'Change order submission',
    status: 'Active',
    steps: [
      { order: 1, name: 'Project Manager Review', approver: 'Project Manager', threshold: 0, autoApprove: false },
      { order: 2, name: 'Director Approval', approver: 'Director', threshold: 25000, autoApprove: false },
      { order: 3, name: 'VP Approval', approver: 'VP of Development', threshold: 100000, autoApprove: false },
      { order: 4, name: 'Executive Approval', approver: 'CEO', threshold: 250000, autoApprove: false }
    ],
    pendingApprovals: 3,
    completedThisMonth: 12
  },
  {
    id: 2,
    name: 'Invoice Payment',
    description: 'Approval workflow for vendor invoice payments',
    trigger: 'Invoice submission',
    status: 'Active',
    steps: [
      { order: 1, name: 'AP Review', approver: 'AP Clerk', threshold: 0, autoApprove: true },
      { order: 2, name: 'PM Approval', approver: 'Project Manager', threshold: 0, autoApprove: false },
      { order: 3, name: 'Controller Approval', approver: 'Controller', threshold: 50000, autoApprove: false }
    ],
    pendingApprovals: 8,
    completedThisMonth: 45
  },
  {
    id: 3,
    name: 'New Vendor Onboarding',
    description: 'Approval workflow for adding new vendors',
    trigger: 'Vendor application',
    status: 'Active',
    steps: [
      { order: 1, name: 'Procurement Review', approver: 'Procurement Manager', threshold: 0, autoApprove: false },
      { order: 2, name: 'Finance Review', approver: 'Controller', threshold: 0, autoApprove: false },
      { order: 3, name: 'Legal Review', approver: 'Legal Counsel', threshold: 0, autoApprove: false }
    ],
    pendingApprovals: 2,
    completedThisMonth: 5
  },
  {
    id: 4,
    name: 'Budget Amendment',
    description: 'Approval workflow for project budget changes',
    trigger: 'Budget change request',
    status: 'Active',
    steps: [
      { order: 1, name: 'PM Review', approver: 'Project Manager', threshold: 0, autoApprove: false },
      { order: 2, name: 'Finance Review', approver: 'CFO', threshold: 0, autoApprove: false },
      { order: 3, name: 'Executive Approval', approver: 'CEO', threshold: 500000, autoApprove: false }
    ],
    pendingApprovals: 1,
    completedThisMonth: 3
  }
];

const pendingApprovals = [
  { id: 1, workflow: 'Change Order Approval', item: 'CO #124 - HVAC Upgrade', project: 'Riverside Apartments', amount: 85000, currentStep: 'Director Approval', submitted: '2024-01-18', submitter: 'Mike Johnson' },
  { id: 2, workflow: 'Invoice Payment', item: 'INV-2024-0892', project: 'Sunset Land Development', amount: 125000, currentStep: 'Controller Approval', submitted: '2024-01-19', submitter: 'AP Team' },
  { id: 3, workflow: 'Change Order Approval', item: 'CO #125 - Foundation Extra', project: 'Riverside Apartments', amount: 45000, currentStep: 'Project Manager Review', submitted: '2024-01-19', submitter: 'Sarah Chen' }
];

export default function ApprovalWorkflowBuilderPage() {
  const [workflows, setWorkflows] = useState(initialWorkflows);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    trigger: ''
  });

  const stats = useMemo(() => {
    const totalPending = workflows.reduce((sum, w) => sum + w.pendingApprovals, 0);
    const totalCompleted = workflows.reduce((sum, w) => sum + w.completedThisMonth, 0);
    return { totalPending, totalCompleted, activeWorkflows: workflows.filter(w => w.status === 'Active').length };
  }, [workflows]);

  const handleAddWorkflow = () => {
    const workflow = {
      id: Math.max(...workflows.map(w => w.id)) + 1,
      ...newWorkflow,
      status: 'Draft',
      steps: [],
      pendingApprovals: 0,
      completedThisMonth: 0
    };
    setWorkflows([...workflows, workflow]);
    setIsAddDialogOpen(false);
    setNewWorkflow({ name: '', description: '', trigger: '' });
    toast({
      title: "Workflow Created",
      description: `${workflow.name} has been created. Add approval steps to activate.`
    });
  };

  const handleToggleStatus = (workflowId) => {
    setWorkflows(workflows.map(w => {
      if (w.id === workflowId) {
        return { ...w, status: w.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return w;
    }));
  };

  const formatCurrency = (value) => {
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Approval Workflow Builder</h1>
          <p className="text-muted-foreground">Design and manage approval processes</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Workflow
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Approval Workflow</DialogTitle>
              <DialogDescription>Define a new approval process</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Workflow Name</Label>
                <Input
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                  placeholder="Change Order Approval"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={newWorkflow.description}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                  placeholder="Approval workflow for..."
                />
              </div>
              <div className="space-y-2">
                <Label>Trigger Event</Label>
                <Select
                  value={newWorkflow.trigger}
                  onValueChange={(value) => setNewWorkflow({ ...newWorkflow, trigger: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Change order submission">Change Order Submission</SelectItem>
                    <SelectItem value="Invoice submission">Invoice Submission</SelectItem>
                    <SelectItem value="Budget change request">Budget Change Request</SelectItem>
                    <SelectItem value="Vendor application">Vendor Application</SelectItem>
                    <SelectItem value="Contract submission">Contract Submission</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddWorkflow} disabled={!newWorkflow.name}>Create Workflow</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeWorkflows}</div>
            <p className="text-xs text-muted-foreground">Configured</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.totalPending}</div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalCompleted}</div>
            <p className="text-xs text-muted-foreground">Approvals processed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.5 days</div>
            <p className="text-xs text-muted-foreground">Per approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pending Approvals</CardTitle>
          <CardDescription>Items awaiting approval action</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workflow</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Current Step</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingApprovals.map(approval => (
                <TableRow key={approval.id}>
                  <TableCell>
                    <Badge variant="outline">{approval.workflow}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{approval.item}</TableCell>
                  <TableCell>{approval.project}</TableCell>
                  <TableCell>{formatCurrency(approval.amount)}</TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-100 text-yellow-800">{approval.currentStep}</Badge>
                  </TableCell>
                  <TableCell>{approval.submitted}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">Approve</Button>
                      <Button size="sm" variant="outline">Review</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Workflows */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configured Workflows</CardTitle>
          <CardDescription>Manage approval workflow definitions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflows.map(workflow => (
              <div key={workflow.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{workflow.name}</h3>
                      <Badge className={workflow.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {workflow.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{workflow.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">Trigger: {workflow.trigger}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={workflow.status === 'Active'}
                      onCheckedChange={() => handleToggleStatus(workflow.id)}
                    />
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Workflow Steps */}
                <div className="flex items-center gap-2 flex-wrap">
                  {workflow.steps.map((step, index) => (
                    <React.Fragment key={index}>
                      <div className="p-2 bg-muted rounded text-sm">
                        <div className="font-medium">{step.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {step.approver}
                          {step.threshold > 0 && ` (>${formatCurrency(step.threshold)})`}
                        </div>
                      </div>
                      {index < workflow.steps.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                  <span>{workflow.pendingApprovals} pending</span>
                  <span>{workflow.completedThisMonth} completed this month</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
