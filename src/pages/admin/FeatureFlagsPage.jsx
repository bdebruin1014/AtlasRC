import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Flag, Search, Plus, Edit2, Trash2, RefreshCw, Save, Users,
  Percent, AlertTriangle, CheckCircle, Clock, Code, Beaker
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock feature flags
const mockFlags = [
  {
    id: 'flag_001',
    key: 'new_dashboard',
    name: 'New Dashboard Design',
    description: 'Enable the redesigned dashboard with improved metrics visualization',
    enabled: true,
    rolloutType: 'percentage',
    rolloutPercentage: 50,
    targetRoles: [],
    targetUsers: [],
    environment: 'production',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T14:00:00Z',
  },
  {
    id: 'flag_002',
    key: 'advanced_reporting',
    name: 'Advanced Reporting Module',
    description: 'Access to advanced financial reporting features',
    enabled: true,
    rolloutType: 'roles',
    rolloutPercentage: 100,
    targetRoles: ['admin', 'accountant'],
    targetUsers: [],
    environment: 'production',
    createdAt: '2024-01-08T15:30:00Z',
    updatedAt: '2024-01-12T09:00:00Z',
  },
  {
    id: 'flag_003',
    key: 'ai_suggestions',
    name: 'AI-Powered Suggestions',
    description: 'Enable AI suggestions for project planning and budgeting',
    enabled: false,
    rolloutType: 'all',
    rolloutPercentage: 0,
    targetRoles: [],
    targetUsers: [],
    environment: 'staging',
    createdAt: '2024-01-14T11:00:00Z',
    updatedAt: '2024-01-14T11:00:00Z',
  },
  {
    id: 'flag_004',
    key: 'dark_mode',
    name: 'Dark Mode Theme',
    description: 'Allow users to switch to dark mode',
    enabled: true,
    rolloutType: 'percentage',
    rolloutPercentage: 25,
    targetRoles: [],
    targetUsers: [],
    environment: 'production',
    createdAt: '2024-01-05T09:00:00Z',
    updatedAt: '2024-01-13T16:00:00Z',
  },
  {
    id: 'flag_005',
    key: 'bulk_operations',
    name: 'Bulk Operations',
    description: 'Enable bulk edit and delete operations on lists',
    enabled: true,
    rolloutType: 'users',
    rolloutPercentage: 100,
    targetRoles: [],
    targetUsers: ['user_001', 'user_002', 'user_003'],
    environment: 'production',
    createdAt: '2024-01-12T14:00:00Z',
    updatedAt: '2024-01-12T14:00:00Z',
  },
  {
    id: 'flag_006',
    key: 'mobile_app_sync',
    name: 'Mobile App Sync',
    description: 'Real-time sync with mobile application',
    enabled: true,
    rolloutType: 'all',
    rolloutPercentage: 100,
    targetRoles: [],
    targetUsers: [],
    environment: 'production',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
];

const roleOptions = [
  { id: 'admin', label: 'Admin' },
  { id: 'manager', label: 'Manager' },
  { id: 'accountant', label: 'Accountant' },
  { id: 'project_manager', label: 'Project Manager' },
  { id: 'team_member', label: 'Team Member' },
];

const FeatureFlagsPage = () => {
  const { toast } = useToast();
  const [flags, setFlags] = useState(mockFlags);
  const [searchQuery, setSearchQuery] = useState('');
  const [envFilter, setEnvFilter] = useState('all');
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [saving, setSaving] = useState(false);

  const [flagData, setFlagData] = useState({
    key: '',
    name: '',
    description: '',
    enabled: false,
    rolloutType: 'all',
    rolloutPercentage: 100,
    targetRoles: [],
    targetUsers: [],
    environment: 'staging',
  });

  const filteredFlags = flags.filter(flag => {
    const matchesSearch = !searchQuery ||
      flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flag.key.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEnv = envFilter === 'all' || flag.environment === envFilter;

    return matchesSearch && matchesEnv;
  });

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRolloutBadge = (flag) => {
    switch (flag.rolloutType) {
      case 'all':
        return <Badge className="bg-green-100 text-green-800">All Users</Badge>;
      case 'percentage':
        return <Badge className="bg-blue-100 text-blue-800">{flag.rolloutPercentage}% Rollout</Badge>;
      case 'roles':
        return <Badge className="bg-purple-100 text-purple-800">{flag.targetRoles.length} Role(s)</Badge>;
      case 'users':
        return <Badge className="bg-orange-100 text-orange-800">{flag.targetUsers.length} User(s)</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const handleCreateFlag = () => {
    setSelectedFlag(null);
    setFlagData({
      key: '',
      name: '',
      description: '',
      enabled: false,
      rolloutType: 'all',
      rolloutPercentage: 100,
      targetRoles: [],
      targetUsers: [],
      environment: 'staging',
    });
    setShowFlagDialog(true);
  };

  const handleEditFlag = (flag) => {
    setSelectedFlag(flag);
    setFlagData({
      key: flag.key,
      name: flag.name,
      description: flag.description,
      enabled: flag.enabled,
      rolloutType: flag.rolloutType,
      rolloutPercentage: flag.rolloutPercentage,
      targetRoles: [...flag.targetRoles],
      targetUsers: [...flag.targetUsers],
      environment: flag.environment,
    });
    setShowFlagDialog(true);
  };

  const handleToggleFlag = (flagId) => {
    setFlags(prev => prev.map(f =>
      f.id === flagId ? { ...f, enabled: !f.enabled, updatedAt: new Date().toISOString() } : f
    ));

    const flag = flags.find(f => f.id === flagId);
    toast({
      title: flag.enabled ? 'Flag Disabled' : 'Flag Enabled',
      description: `${flag.name} has been ${flag.enabled ? 'disabled' : 'enabled'}`,
    });
  };

  const handleSaveFlag = async () => {
    if (!flagData.key || !flagData.name) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill in required fields',
      });
      return;
    }

    // Validate key format
    if (!/^[a-z_]+$/.test(flagData.key)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Key',
        description: 'Key must be lowercase letters and underscores only',
      });
      return;
    }

    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (selectedFlag) {
      setFlags(prev => prev.map(f =>
        f.id === selectedFlag.id
          ? { ...f, ...flagData, updatedAt: new Date().toISOString() }
          : f
      ));
      toast({
        title: 'Flag Updated',
        description: `${flagData.name} has been updated`,
      });
    } else {
      const newFlag = {
        id: `flag_${Date.now()}`,
        ...flagData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setFlags(prev => [newFlag, ...prev]);
      toast({
        title: 'Flag Created',
        description: `${flagData.name} has been created`,
      });
    }

    setSaving(false);
    setShowFlagDialog(false);
  };

  const handleDeleteFlag = () => {
    if (!selectedFlag) return;

    setFlags(prev => prev.filter(f => f.id !== selectedFlag.id));
    setShowDeleteDialog(false);
    setSelectedFlag(null);

    toast({
      title: 'Flag Deleted',
      description: 'Feature flag has been deleted',
    });
  };

  const toggleRole = (role) => {
    setFlagData(prev => ({
      ...prev,
      targetRoles: prev.targetRoles.includes(role)
        ? prev.targetRoles.filter(r => r !== role)
        : [...prev.targetRoles, role],
    }));
  };

  // Stats
  const enabledFlags = flags.filter(f => f.enabled).length;
  const stagingFlags = flags.filter(f => f.environment === 'staging').length;
  const productionFlags = flags.filter(f => f.environment === 'production').length;

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Feature Flags | Admin</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Feature Flags</h1>
          <p className="text-gray-600 mt-2">Control feature rollouts and A/B testing</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateFlag}>
          <Plus className="w-4 h-4 mr-2" />
          New Flag
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Flags</p>
                <p className="text-2xl font-bold">{flags.length}</p>
              </div>
              <Flag className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Enabled</p>
                <p className="text-2xl font-bold text-green-600">{enabledFlags}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Production</p>
                <p className="text-2xl font-bold text-blue-600">{productionFlags}</p>
              </div>
              <Code className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Staging</p>
                <p className="text-2xl font-bold text-yellow-600">{stagingFlags}</p>
              </div>
              <Beaker className="w-8 h-8 text-yellow-400" />
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
                placeholder="Search flags..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={envFilter} onValueChange={setEnvFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Environment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Environments</SelectItem>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="development">Development</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Flags Table */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
          <CardDescription>
            {filteredFlags.length} flag{filteredFlags.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Flag</TableHead>
                <TableHead>Rollout</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFlags.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No feature flags found
                  </TableCell>
                </TableRow>
              ) : (
                filteredFlags.map((flag) => (
                  <TableRow key={flag.id} className={!flag.enabled ? 'opacity-50' : ''}>
                    <TableCell>
                      <Switch
                        checked={flag.enabled}
                        onCheckedChange={() => handleToggleFlag(flag.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{flag.name}</div>
                        <code className="text-xs text-gray-400">{flag.key}</code>
                        <div className="text-sm text-gray-500 mt-1">{flag.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getRolloutBadge(flag)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        flag.environment === 'production' ? 'border-green-500 text-green-700' :
                          flag.environment === 'staging' ? 'border-yellow-500 text-yellow-700' :
                            'border-gray-500 text-gray-700'
                      }>
                        {flag.environment}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDateTime(flag.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditFlag(flag)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedFlag(flag);
                            setShowDeleteDialog(true);
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Flag Dialog */}
      <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedFlag ? 'Edit Flag' : 'Create Flag'}</DialogTitle>
            <DialogDescription>
              Configure feature flag settings and rollout strategy
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="targeting">Targeting</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="key">Flag Key *</Label>
                <Input
                  id="key"
                  placeholder="e.g., new_feature"
                  value={flagData.key}
                  onChange={(e) => setFlagData(prev => ({ ...prev, key: e.target.value.toLowerCase().replace(/[^a-z_]/g, '') }))}
                  disabled={!!selectedFlag}
                />
                <p className="text-xs text-gray-500">Lowercase letters and underscores only</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Display Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., New Feature"
                  value={flagData.name}
                  onChange={(e) => setFlagData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What does this feature flag control?"
                  value={flagData.description}
                  onChange={(e) => setFlagData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Environment</Label>
                <Select
                  value={flagData.environment}
                  onValueChange={(value) => setFlagData(prev => ({ ...prev, environment: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label>Enabled</Label>
                  <p className="text-sm text-gray-500">Turn the feature on or off</p>
                </div>
                <Switch
                  checked={flagData.enabled}
                  onCheckedChange={(checked) => setFlagData(prev => ({ ...prev, enabled: checked }))}
                />
              </div>
            </TabsContent>

            <TabsContent value="targeting" className="space-y-4">
              <div className="space-y-2">
                <Label>Rollout Type</Label>
                <Select
                  value={flagData.rolloutType}
                  onValueChange={(value) => setFlagData(prev => ({ ...prev, rolloutType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="percentage">Percentage Rollout</SelectItem>
                    <SelectItem value="roles">Specific Roles</SelectItem>
                    <SelectItem value="users">Specific Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {flagData.rolloutType === 'percentage' && (
                <div className="space-y-2">
                  <Label>Rollout Percentage: {flagData.rolloutPercentage}%</Label>
                  <Slider
                    value={[flagData.rolloutPercentage]}
                    onValueChange={([value]) => setFlagData(prev => ({ ...prev, rolloutPercentage: value }))}
                    max={100}
                    step={5}
                  />
                  <p className="text-xs text-gray-500">
                    {flagData.rolloutPercentage}% of users will see this feature
                  </p>
                </div>
              )}

              {flagData.rolloutType === 'roles' && (
                <div className="space-y-2">
                  <Label>Target Roles</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {roleOptions.map(role => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={role.id}
                          checked={flagData.targetRoles.includes(role.id)}
                          onCheckedChange={() => toggleRole(role.id)}
                        />
                        <Label htmlFor={role.id} className="font-normal cursor-pointer">
                          {role.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {flagData.rolloutType === 'users' && (
                <div className="space-y-2">
                  <Label>Target User IDs</Label>
                  <Textarea
                    placeholder="Enter user IDs, one per line"
                    value={flagData.targetUsers.join('\n')}
                    onChange={(e) => setFlagData(prev => ({
                      ...prev,
                      targetUsers: e.target.value.split('\n').filter(id => id.trim()),
                    }))}
                  />
                  <p className="text-xs text-gray-500">
                    {flagData.targetUsers.length} user(s) targeted
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFlagDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFlag} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Flag
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Delete Feature Flag
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this feature flag? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedFlag && (
            <div className="py-4 space-y-2 text-sm">
              <div><strong>Name:</strong> {selectedFlag.name}</div>
              <div><strong>Key:</strong> <code>{selectedFlag.key}</code></div>
              <div><strong>Environment:</strong> {selectedFlag.environment}</div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteFlag}>
              Delete Flag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeatureFlagsPage;
