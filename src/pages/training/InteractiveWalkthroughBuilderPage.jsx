import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  Play,
  Eye,
  Settings,
  GripVertical,
  MousePointer,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Target,
  Layers,
  Users,
  MoreHorizontal,
  Search
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const InteractiveWalkthroughBuilderPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStepModal, setShowStepModal] = useState(false);
  const [selectedWalkthrough, setSelectedWalkthrough] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [walkthroughData, setWalkthroughData] = useState({
    name: '',
    description: '',
    targetPage: '',
    targetRole: 'all',
    autoStart: false,
    showOnce: true
  });

  const [stepData, setStepData] = useState({
    type: 'tooltip',
    targetSelector: '',
    title: '',
    content: '',
    position: 'bottom',
    action: 'next'
  });

  const walkthroughs = [
    {
      id: 1,
      name: 'New User Welcome Tour',
      description: 'Introduction to the main dashboard and navigation',
      targetPage: '/dashboard',
      targetRole: 'all',
      steps: 8,
      views: 456,
      completionRate: 78,
      status: 'active',
      autoStart: true,
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'Create Project Walkthrough',
      description: 'Step-by-step guide to creating a new project',
      targetPage: '/projects/new',
      targetRole: 'project_manager',
      steps: 12,
      views: 234,
      completionRate: 85,
      status: 'active',
      autoStart: false,
      createdAt: '2024-01-20'
    },
    {
      id: 3,
      name: 'Unit Inventory Setup',
      description: 'Configure lots, homes, or rental units for a project',
      targetPage: '/projects/:id/units',
      targetRole: 'project_manager',
      steps: 10,
      views: 187,
      completionRate: 72,
      status: 'active',
      autoStart: false,
      createdAt: '2024-02-01'
    },
    {
      id: 4,
      name: 'Deal Pipeline Overview',
      description: 'Learn to track opportunities through the pipeline',
      targetPage: '/pipeline',
      targetRole: 'acquisitions',
      steps: 6,
      views: 145,
      completionRate: 90,
      status: 'active',
      autoStart: true,
      createdAt: '2024-02-10'
    },
    {
      id: 5,
      name: 'Budget Entry Tutorial',
      description: 'How to enter and manage project budgets',
      targetPage: '/projects/:id/budget',
      targetRole: 'accountant',
      steps: 9,
      views: 98,
      completionRate: 68,
      status: 'draft',
      autoStart: false,
      createdAt: '2024-02-15'
    },
    {
      id: 6,
      name: 'Draw Request Process',
      description: 'Submit and track construction draw requests',
      targetPage: '/projects/:id/draws',
      targetRole: 'all',
      steps: 7,
      views: 76,
      completionRate: 82,
      status: 'inactive',
      autoStart: false,
      createdAt: '2024-02-20'
    }
  ];

  const sampleSteps = [
    { id: 1, type: 'tooltip', title: 'Welcome!', target: '#dashboard-header', position: 'bottom' },
    { id: 2, type: 'tooltip', title: 'Navigation Menu', target: '#sidebar-nav', position: 'right' },
    { id: 3, type: 'highlight', title: 'Quick Actions', target: '#quick-actions', position: 'bottom' },
    { id: 4, type: 'modal', title: 'Key Metrics', target: null, position: 'center' },
    { id: 5, type: 'tooltip', title: 'Projects List', target: '#projects-link', position: 'right' }
  ];

  const targetPages = [
    { value: '/dashboard', label: 'Dashboard' },
    { value: '/projects', label: 'Projects List' },
    { value: '/projects/new', label: 'New Project' },
    { value: '/projects/:id', label: 'Project Detail' },
    { value: '/projects/:id/units', label: 'Unit Inventory' },
    { value: '/projects/:id/budget', label: 'Project Budget' },
    { value: '/pipeline', label: 'Deal Pipeline' },
    { value: '/accounting', label: 'Accounting' },
    { value: '/reports', label: 'Reports' },
    { value: '/settings', label: 'Settings' }
  ];

  const roles = [
    { value: 'all', label: 'All Users' },
    { value: 'executive', label: 'Executive' },
    { value: 'project_manager', label: 'Project Manager' },
    { value: 'accountant', label: 'Accountant' },
    { value: 'acquisitions', label: 'Acquisitions' }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'draft': return 'bg-yellow-100 text-yellow-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStepTypeIcon = (type) => {
    switch (type) {
      case 'tooltip': return <MessageSquare className="w-4 h-4" />;
      case 'highlight': return <Target className="w-4 h-4" />;
      case 'modal': return <Layers className="w-4 h-4" />;
      default: return <MousePointer className="w-4 h-4" />;
    }
  };

  const filteredWalkthroughs = walkthroughs.filter(w =>
    !searchQuery ||
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateWalkthrough = () => {
    setWalkthroughData({
      name: '',
      description: '',
      targetPage: '',
      targetRole: 'all',
      autoStart: false,
      showOnce: true
    });
    setSelectedWalkthrough(null);
    setShowCreateModal(true);
  };

  const handleEditWalkthrough = (walkthrough) => {
    setSelectedWalkthrough(walkthrough);
    setWalkthroughData({
      name: walkthrough.name,
      description: walkthrough.description,
      targetPage: walkthrough.targetPage,
      targetRole: walkthrough.targetRole,
      autoStart: walkthrough.autoStart,
      showOnce: true
    });
    setShowCreateModal(true);
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Interactive Walkthrough Builder</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Interactive Walkthrough Builder</h1>
          <p className="text-gray-600 mt-2">Create guided tours to help users learn the platform</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateWalkthrough}>
          <Plus className="w-4 h-4 mr-2" />
          Create Walkthrough
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Walkthroughs</p>
                <p className="text-2xl font-bold">{walkthroughs.length}</p>
              </div>
              <Layers className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {walkthroughs.filter(w => w.status === 'active').length}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Views</p>
                <p className="text-2xl font-bold">
                  {walkthroughs.reduce((acc, w) => acc + w.views, 0).toLocaleString()}
                </p>
              </div>
              <Eye className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Completion</p>
                <p className="text-2xl font-bold">
                  {Math.round(walkthroughs.reduce((acc, w) => acc + w.completionRate, 0) / walkthroughs.length)}%
                </p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search walkthroughs..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Walkthroughs List */}
      <Card>
        <CardHeader>
          <CardTitle>All Walkthroughs</CardTitle>
          <CardDescription>Manage your interactive guided tours</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Walkthrough</TableHead>
                <TableHead>Target Page</TableHead>
                <TableHead>Target Role</TableHead>
                <TableHead>Steps</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Completion</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWalkthroughs.map((walkthrough) => (
                <TableRow key={walkthrough.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{walkthrough.name}</p>
                      <p className="text-sm text-gray-500">{walkthrough.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {walkthrough.targetPage}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {roles.find(r => r.value === walkthrough.targetRole)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>{walkthrough.steps} steps</TableCell>
                  <TableCell>{walkthrough.views.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${walkthrough.completionRate}%` }}
                        />
                      </div>
                      <span className="text-sm">{walkthrough.completionRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(walkthrough.status)}>
                      {walkthrough.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditWalkthrough(walkthrough)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Play className="w-4 h-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {selectedWalkthrough ? 'Edit Walkthrough' : 'Create New Walkthrough'}
            </DialogTitle>
            <DialogDescription>
              Configure the walkthrough settings and add steps
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Walkthrough Name</Label>
              <Input
                id="name"
                placeholder="e.g., New User Welcome Tour"
                value={walkthroughData.name}
                onChange={(e) => setWalkthroughData({...walkthroughData, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this walkthrough covers..."
                value={walkthroughData.description}
                onChange={(e) => setWalkthroughData({...walkthroughData, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Target Page</Label>
                <Select
                  value={walkthroughData.targetPage}
                  onValueChange={(value) => setWalkthroughData({...walkthroughData, targetPage: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select page" />
                  </SelectTrigger>
                  <SelectContent>
                    {targetPages.map((page) => (
                      <SelectItem key={page.value} value={page.value}>
                        {page.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Target Role</Label>
                <Select
                  value={walkthroughData.targetRole}
                  onValueChange={(value) => setWalkthroughData({...walkthroughData, targetRole: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-start for new users</Label>
                <p className="text-sm text-gray-500">Automatically show when user visits the page</p>
              </div>
              <Switch
                checked={walkthroughData.autoStart}
                onCheckedChange={(checked) => setWalkthroughData({...walkthroughData, autoStart: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Show only once</Label>
                <p className="text-sm text-gray-500">Don't show again after user completes it</p>
              </div>
              <Switch
                checked={walkthroughData.showOnce}
                onCheckedChange={(checked) => setWalkthroughData({...walkthroughData, showOnce: checked})}
              />
            </div>

            {selectedWalkthrough && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <Label>Steps ({sampleSteps.length})</Label>
                  <Button variant="outline" size="sm" onClick={() => setShowStepModal(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Step
                  </Button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {sampleSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      {getStepTypeIcon(step.type)}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{step.title}</p>
                        <p className="text-xs text-gray-500">
                          {step.target || 'Modal'} • {step.position}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              {selectedWalkthrough ? 'Save Changes' : 'Create Walkthrough'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Step Modal */}
      <Dialog open={showStepModal} onOpenChange={setShowStepModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Step</DialogTitle>
            <DialogDescription>
              Configure this step of the walkthrough
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Step Type</Label>
              <Select
                value={stepData.type}
                onValueChange={(value) => setStepData({...stepData, type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tooltip">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Tooltip
                    </div>
                  </SelectItem>
                  <SelectItem value="highlight">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Highlight
                    </div>
                  </SelectItem>
                  <SelectItem value="modal">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Modal
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {stepData.type !== 'modal' && (
              <div className="grid gap-2">
                <Label>Target Element (CSS Selector)</Label>
                <Input
                  placeholder="e.g., #sidebar-nav or .btn-primary"
                  value={stepData.targetSelector}
                  onChange={(e) => setStepData({...stepData, targetSelector: e.target.value})}
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input
                placeholder="Step title"
                value={stepData.title}
                onChange={(e) => setStepData({...stepData, title: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label>Content</Label>
              <Textarea
                placeholder="Explain what the user should know or do..."
                value={stepData.content}
                onChange={(e) => setStepData({...stepData, content: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Position</Label>
                <Select
                  value={stepData.position}
                  onValueChange={(value) => setStepData({...stepData, position: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Action Button</Label>
                <Select
                  value={stepData.action}
                  onValueChange={(value) => setStepData({...stepData, action: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="next">Next</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="skip">Skip</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStepModal(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Add Step
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InteractiveWalkthroughBuilderPage;
