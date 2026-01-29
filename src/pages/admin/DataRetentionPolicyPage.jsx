import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Clock, Database, Trash2, Archive, RefreshCw, Save, AlertTriangle,
  Shield, FileText, Users, Settings, Calendar, HardDrive, Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock retention policies
const mockPolicies = [
  {
    id: 'policy_001',
    dataType: 'audit_logs',
    label: 'Audit Logs',
    description: 'System audit trail and activity logs',
    icon: Clock,
    retentionPeriod: 365,
    action: 'archive',
    enabled: true,
    lastRun: '2024-01-14T02:00:00Z',
    affectedRecords: 125000,
  },
  {
    id: 'policy_002',
    dataType: 'session_data',
    label: 'Session Data',
    description: 'User session and login history',
    icon: Users,
    retentionPeriod: 90,
    action: 'delete',
    enabled: true,
    lastRun: '2024-01-14T02:00:00Z',
    affectedRecords: 45000,
  },
  {
    id: 'policy_003',
    dataType: 'temp_files',
    label: 'Temporary Files',
    description: 'Uploaded temp files and caches',
    icon: FileText,
    retentionPeriod: 7,
    action: 'delete',
    enabled: true,
    lastRun: '2024-01-15T02:00:00Z',
    affectedRecords: 2500,
  },
  {
    id: 'policy_004',
    dataType: 'deleted_users',
    label: 'Deleted User Data',
    description: 'Data from deactivated/deleted users',
    icon: Users,
    retentionPeriod: 30,
    action: 'anonymize',
    enabled: true,
    lastRun: '2024-01-14T02:00:00Z',
    affectedRecords: 150,
  },
  {
    id: 'policy_005',
    dataType: 'email_logs',
    label: 'Email Delivery Logs',
    description: 'Email send/receive logs',
    icon: FileText,
    retentionPeriod: 180,
    action: 'archive',
    enabled: true,
    lastRun: '2024-01-14T02:00:00Z',
    affectedRecords: 250000,
  },
  {
    id: 'policy_006',
    dataType: 'error_logs',
    label: 'Error Logs',
    description: 'Application error and exception logs',
    icon: AlertTriangle,
    retentionPeriod: 90,
    action: 'delete',
    enabled: true,
    lastRun: '2024-01-14T02:00:00Z',
    affectedRecords: 15000,
  },
  {
    id: 'policy_007',
    dataType: 'notifications',
    label: 'Read Notifications',
    description: 'Dismissed/read notification records',
    icon: Settings,
    retentionPeriod: 30,
    action: 'delete',
    enabled: false,
    lastRun: null,
    affectedRecords: 0,
  },
];

const retentionPeriods = [
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
  { value: 180, label: '6 months' },
  { value: 365, label: '1 year' },
  { value: 730, label: '2 years' },
  { value: 1825, label: '5 years' },
  { value: 0, label: 'Never' },
];

const DataRetentionPolicyPage = () => {
  const { toast } = useToast();
  const [policies, setPolicies] = useState(mockPolicies);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRunDialog, setShowRunDialog] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);

  const [editData, setEditData] = useState({
    retentionPeriod: 90,
    action: 'delete',
    enabled: true,
  });

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'archive':
        return 'bg-blue-100 text-blue-800';
      case 'anonymize':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRetentionLabel = (days) => {
    if (days === 0) return 'Never';
    const period = retentionPeriods.find(p => p.value === days);
    return period ? period.label : `${days} days`;
  };

  const handleEditPolicy = (policy) => {
    setSelectedPolicy(policy);
    setEditData({
      retentionPeriod: policy.retentionPeriod,
      action: policy.action,
      enabled: policy.enabled,
    });
    setShowEditDialog(true);
  };

  const handleSavePolicy = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    setPolicies(prev => prev.map(p =>
      p.id === selectedPolicy.id
        ? { ...p, ...editData }
        : p
    ));

    setSaving(false);
    setShowEditDialog(false);

    toast({
      title: 'Policy Updated',
      description: `${selectedPolicy.label} retention policy has been updated`,
    });
  };

  const handleTogglePolicy = (policyId) => {
    setPolicies(prev => prev.map(p =>
      p.id === policyId ? { ...p, enabled: !p.enabled } : p
    ));
  };

  const handleRunPolicy = async () => {
    setRunning(true);

    // Simulate policy execution
    await new Promise(resolve => setTimeout(resolve, 2000));

    setPolicies(prev => prev.map(p =>
      p.id === selectedPolicy.id
        ? { ...p, lastRun: new Date().toISOString(), affectedRecords: Math.floor(Math.random() * 1000) }
        : p
    ));

    setRunning(false);
    setShowRunDialog(false);

    toast({
      title: 'Policy Executed',
      description: `${selectedPolicy.label} retention policy has been run`,
    });
  };

  const handleRunAllPolicies = async () => {
    setRunning(true);
    toast({
      title: 'Running All Policies',
      description: 'This may take a few minutes...',
    });

    await new Promise(resolve => setTimeout(resolve, 3000));

    setPolicies(prev => prev.map(p =>
      p.enabled ? { ...p, lastRun: new Date().toISOString() } : p
    ));

    setRunning(false);
    toast({
      title: 'All Policies Executed',
      description: 'Data retention policies have been applied',
    });
  };

  // Stats
  const enabledPolicies = policies.filter(p => p.enabled).length;
  const totalAffected = policies.reduce((sum, p) => sum + p.affectedRecords, 0);

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Data Retention Policy | Admin</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Data Retention Policy</h1>
          <p className="text-gray-600 mt-2">Configure automatic data archival and deletion rules</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleRunAllPolicies}
          disabled={running}
        >
          {running ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Run All Policies
            </>
          )}
        </Button>
      </div>

      {/* Compliance Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Data Compliance</AlertTitle>
        <AlertDescription className="text-blue-700">
          These retention policies help ensure compliance with GDPR, CCPA, and other data protection regulations.
          Retention periods should be configured based on your legal requirements.
        </AlertDescription>
      </Alert>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Policies</p>
                <p className="text-2xl font-bold">{policies.length}</p>
              </div>
              <Database className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Policies</p>
                <p className="text-2xl font-bold text-green-600">{enabledPolicies}</p>
              </div>
              <Clock className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Records Managed</p>
                <p className="text-2xl font-bold">{totalAffected.toLocaleString()}</p>
              </div>
              <HardDrive className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Archive Policies</p>
                <p className="text-2xl font-bold text-purple-600">
                  {policies.filter(p => p.action === 'archive').length}
                </p>
              </div>
              <Archive className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Policies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Retention Policies</CardTitle>
          <CardDescription>Configure how long different types of data are retained</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Data Type</TableHead>
                <TableHead>Retention Period</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Affected Records</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((policy) => (
                <TableRow key={policy.id} className={!policy.enabled ? 'opacity-50' : ''}>
                  <TableCell>
                    <Switch
                      checked={policy.enabled}
                      onCheckedChange={() => handleTogglePolicy(policy.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <policy.icon className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{policy.label}</div>
                        <div className="text-sm text-gray-500">{policy.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      <Calendar className="w-3 h-3 mr-1" />
                      {getRetentionLabel(policy.retentionPeriod)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getActionBadge(policy.action)}>
                      {policy.action === 'delete' && <Trash2 className="w-3 h-3 mr-1" />}
                      {policy.action === 'archive' && <Archive className="w-3 h-3 mr-1" />}
                      {policy.action === 'anonymize' && <Shield className="w-3 h-3 mr-1" />}
                      {policy.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{formatDateTime(policy.lastRun)}</TableCell>
                  <TableCell>
                    {policy.affectedRecords.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPolicy(policy);
                          setShowRunDialog(true);
                        }}
                        disabled={!policy.enabled}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPolicy(policy)}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Policy Actions Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Action Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                <span className="font-medium">Delete</span>
              </div>
              <p className="text-sm text-gray-500">
                Permanently removes data after the retention period. Cannot be recovered.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Archive className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Archive</span>
              </div>
              <p className="text-sm text-gray-500">
                Moves data to cold storage. Can be restored if needed.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-purple-500" />
                <span className="font-medium">Anonymize</span>
              </div>
              <p className="text-sm text-gray-500">
                Removes personally identifiable information while keeping aggregate data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Retention Policy</DialogTitle>
            <DialogDescription>
              {selectedPolicy?.label}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Retention Period</Label>
              <Select
                value={String(editData.retentionPeriod)}
                onValueChange={(value) => setEditData(prev => ({ ...prev, retentionPeriod: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {retentionPeriods.map(period => (
                    <SelectItem key={period.value} value={String(period.value)}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Action After Retention Period</Label>
              <Select
                value={editData.action}
                onValueChange={(value) => setEditData(prev => ({ ...prev, action: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delete">Delete Permanently</SelectItem>
                  <SelectItem value="archive">Archive to Cold Storage</SelectItem>
                  <SelectItem value="anonymize">Anonymize Data</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label>Policy Status</Label>
                <p className="text-sm text-gray-500">Enable or disable this policy</p>
              </div>
              <Switch
                checked={editData.enabled}
                onCheckedChange={(checked) => setEditData(prev => ({ ...prev, enabled: checked }))}
              />
            </div>

            {editData.action === 'delete' && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Warning</AlertTitle>
                <AlertDescription className="text-red-700">
                  Deleted data cannot be recovered. Consider archiving instead if you may need to access this data later.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePolicy} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Policy
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Run Policy Dialog */}
      <Dialog open={showRunDialog} onOpenChange={setShowRunDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Run Retention Policy
            </DialogTitle>
            <DialogDescription>
              Execute {selectedPolicy?.label} policy now?
            </DialogDescription>
          </DialogHeader>

          {selectedPolicy && (
            <div className="py-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Retention Period:</span>
                <span>{getRetentionLabel(selectedPolicy.retentionPeriod)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Action:</span>
                <Badge className={getActionBadge(selectedPolicy.action)}>{selectedPolicy.action}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Estimated Records:</span>
                <span>{selectedPolicy.affectedRecords.toLocaleString()}</span>
              </div>
            </div>
          )}

          <Alert className="border-yellow-200 bg-yellow-50">
            <Info className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700">
              This will process all data older than the retention period according to the configured action.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRunDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRunPolicy} disabled={running} className="bg-blue-600 hover:bg-blue-700">
              {running ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Run Policy
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataRetentionPolicyPage;
