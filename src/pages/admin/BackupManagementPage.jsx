import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Database, Download, Upload, Clock, RefreshCw, HardDrive, Cloud,
  CheckCircle, XCircle, AlertTriangle, Calendar, Play, Trash2, RotateCcw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock backup data
const mockBackups = [
  {
    id: 'backup_001',
    type: 'full',
    status: 'completed',
    startedAt: '2024-01-15T02:00:00Z',
    completedAt: '2024-01-15T02:45:00Z',
    size: '2.4 GB',
    location: 's3://atlasrc-backups/2024-01-15/',
    automated: true,
    retention: '30 days',
    verified: true,
  },
  {
    id: 'backup_002',
    type: 'incremental',
    status: 'completed',
    startedAt: '2024-01-14T14:00:00Z',
    completedAt: '2024-01-14T14:15:00Z',
    size: '156 MB',
    location: 's3://atlasrc-backups/2024-01-14-incr/',
    automated: true,
    retention: '7 days',
    verified: true,
  },
  {
    id: 'backup_003',
    type: 'full',
    status: 'completed',
    startedAt: '2024-01-14T02:00:00Z',
    completedAt: '2024-01-14T02:50:00Z',
    size: '2.3 GB',
    location: 's3://atlasrc-backups/2024-01-14/',
    automated: true,
    retention: '30 days',
    verified: true,
  },
  {
    id: 'backup_004',
    type: 'incremental',
    status: 'completed',
    startedAt: '2024-01-13T14:00:00Z',
    completedAt: '2024-01-13T14:12:00Z',
    size: '142 MB',
    location: 's3://atlasrc-backups/2024-01-13-incr/',
    automated: true,
    retention: '7 days',
    verified: true,
  },
  {
    id: 'backup_005',
    type: 'manual',
    status: 'completed',
    startedAt: '2024-01-12T10:30:00Z',
    completedAt: '2024-01-12T11:20:00Z',
    size: '2.2 GB',
    location: 's3://atlasrc-backups/manual-2024-01-12/',
    automated: false,
    retention: '90 days',
    verified: true,
    note: 'Pre-deployment backup',
  },
];

const BackupManagementPage = () => {
  const { toast } = useToast();
  const [backups, setBackups] = useState(mockBackups);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [restoreInProgress, setRestoreInProgress] = useState(false);

  const [backupConfig, setBackupConfig] = useState({
    type: 'full',
    retention: '30',
    note: '',
  });

  const [scheduleConfig, setScheduleConfig] = useState({
    enabled: true,
    fullBackupSchedule: 'daily',
    fullBackupTime: '02:00',
    incrementalEnabled: true,
    incrementalSchedule: 'every_6_hours',
    retention: 30,
  });

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (start, end) => {
    const ms = new Date(end) - new Date(start);
    const minutes = Math.floor(ms / 60000);
    return `${minutes} min`;
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'full':
        return 'bg-blue-100 text-blue-800';
      case 'incremental':
        return 'bg-green-100 text-green-800';
      case 'manual':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleStartBackup = async () => {
    setBackupInProgress(true);
    setBackupProgress(0);
    setShowBackupDialog(false);

    // Simulate backup progress
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setBackupProgress(i);
    }

    const newBackup = {
      id: `backup_${Date.now()}`,
      type: backupConfig.type,
      status: 'completed',
      startedAt: new Date(Date.now() - 2700000).toISOString(),
      completedAt: new Date().toISOString(),
      size: backupConfig.type === 'full' ? '2.5 GB' : '165 MB',
      location: `s3://atlasrc-backups/${backupConfig.type}-${new Date().toISOString().split('T')[0]}/`,
      automated: false,
      retention: `${backupConfig.retention} days`,
      verified: true,
      note: backupConfig.note,
    };

    setBackups(prev => [newBackup, ...prev]);
    setBackupInProgress(false);

    toast({
      title: 'Backup Complete',
      description: 'Your backup has been created successfully',
    });
  };

  const handleRestore = async () => {
    setRestoreInProgress(true);

    // Simulate restore
    await new Promise(resolve => setTimeout(resolve, 5000));

    setRestoreInProgress(false);
    setShowRestoreDialog(false);

    toast({
      title: 'Restore Complete',
      description: 'Database has been restored from backup',
    });
  };

  const handleDeleteBackup = () => {
    setBackups(prev => prev.filter(b => b.id !== selectedBackup.id));
    setShowDeleteDialog(false);
    setSelectedBackup(null);

    toast({
      title: 'Backup Deleted',
      description: 'The backup has been permanently removed',
    });
  };

  const handleVerifyBackup = (backup) => {
    toast({
      title: 'Verification Started',
      description: `Verifying backup from ${formatDateTime(backup.completedAt)}`,
    });

    setTimeout(() => {
      toast({
        title: 'Verification Complete',
        description: 'Backup integrity verified successfully',
      });
    }, 2000);
  };

  // Stats
  const totalSize = '12.4 GB';
  const lastBackup = backups[0];
  const completedBackups = backups.filter(b => b.status === 'completed').length;

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Backup Management | Admin</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Backup Management</h1>
          <p className="text-gray-600 mt-2">Schedule backups, view history, and restore from backups</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowBackupDialog(true)}
          disabled={backupInProgress}
        >
          {backupInProgress ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Backup in Progress...
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              Create Backup
            </>
          )}
        </Button>
      </div>

      {/* Backup Progress */}
      {backupInProgress && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Backup in progress...</span>
                  <span>{backupProgress}%</span>
                </div>
                <Progress value={backupProgress} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Backups</p>
                <p className="text-2xl font-bold">{backups.length}</p>
              </div>
              <Database className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Size</p>
                <p className="text-2xl font-bold">{totalSize}</p>
              </div>
              <HardDrive className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Last Backup</p>
                <p className="text-2xl font-bold text-green-600">
                  {lastBackup ? calculateDuration(lastBackup.startedAt, lastBackup.completedAt) : '-'}
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Storage Location</p>
                <p className="text-lg font-bold">AWS S3</p>
              </div>
              <Cloud className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Backup Schedule
          </CardTitle>
          <CardDescription>Configure automatic backup schedule</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="text-base">Automatic Backups</Label>
              <p className="text-sm text-gray-500">Enable scheduled automatic backups</p>
            </div>
            <Switch
              checked={scheduleConfig.enabled}
              onCheckedChange={(checked) => setScheduleConfig(prev => ({ ...prev, enabled: checked }))}
            />
          </div>

          {scheduleConfig.enabled && (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Full Backups</h4>
                <div className="space-y-2">
                  <Label>Schedule</Label>
                  <Select
                    value={scheduleConfig.fullBackupSchedule}
                    onValueChange={(value) => setScheduleConfig(prev => ({ ...prev, fullBackupSchedule: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Time (UTC)</Label>
                  <Select
                    value={scheduleConfig.fullBackupTime}
                    onValueChange={(value) => setScheduleConfig(prev => ({ ...prev, fullBackupTime: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="00:00">12:00 AM</SelectItem>
                      <SelectItem value="02:00">2:00 AM</SelectItem>
                      <SelectItem value="04:00">4:00 AM</SelectItem>
                      <SelectItem value="06:00">6:00 AM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Incremental Backups</h4>
                  <Switch
                    checked={scheduleConfig.incrementalEnabled}
                    onCheckedChange={(checked) => setScheduleConfig(prev => ({ ...prev, incrementalEnabled: checked }))}
                  />
                </div>
                {scheduleConfig.incrementalEnabled && (
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select
                      value={scheduleConfig.incrementalSchedule}
                      onValueChange={(value) => setScheduleConfig(prev => ({ ...prev, incrementalSchedule: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="every_6_hours">Every 6 Hours</SelectItem>
                        <SelectItem value="every_12_hours">Every 12 Hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
          <CardDescription>View and manage existing backups</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Retention</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(backup.status)}
                      {backup.verified && (
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeBadge(backup.type)}>
                      {backup.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatDateTime(backup.completedAt)}</div>
                      {backup.note && (
                        <div className="text-xs text-gray-500">{backup.note}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {calculateDuration(backup.startedAt, backup.completedAt)}
                  </TableCell>
                  <TableCell>{backup.size}</TableCell>
                  <TableCell>{backup.retention}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerifyBackup(backup)}
                        title="Verify Integrity"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBackup(backup);
                          setShowRestoreDialog(true);
                        }}
                        title="Restore"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBackup(backup);
                          setShowDeleteDialog(true);
                        }}
                        className="text-red-600 hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Backup Dialog */}
      <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Backup</DialogTitle>
            <DialogDescription>
              Create a new backup of the database
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Backup Type</Label>
              <Select
                value={backupConfig.type}
                onValueChange={(value) => setBackupConfig(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Backup</SelectItem>
                  <SelectItem value="incremental">Incremental Backup</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                {backupConfig.type === 'full'
                  ? 'Complete backup of all data (~45 min)'
                  : 'Only changes since last backup (~15 min)'}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Retention Period</Label>
              <Select
                value={backupConfig.retention}
                onValueChange={(value) => setBackupConfig(prev => ({ ...prev, retention: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBackupDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleStartBackup} className="bg-blue-600 hover:bg-blue-700">
              <Play className="w-4 h-4 mr-2" />
              Start Backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Restore from Backup
            </DialogTitle>
            <DialogDescription>
              This will restore the database to the selected backup point
            </DialogDescription>
          </DialogHeader>

          {selectedBackup && (
            <div className="py-4 space-y-3">
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800">Warning</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  Restoring from backup will overwrite current data. This action cannot be undone.
                  A backup of current data will be created automatically before restore.
                </AlertDescription>
              </Alert>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Backup Date:</span>
                  <span>{formatDateTime(selectedBackup.completedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="capitalize">{selectedBackup.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Size:</span>
                  <span>{selectedBackup.size}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRestore}
              disabled={restoreInProgress}
            >
              {restoreInProgress ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Restoring...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restore Backup
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
              Delete Backup
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this backup?
            </DialogDescription>
          </DialogHeader>

          {selectedBackup && (
            <div className="py-4 space-y-2 text-sm">
              <div><strong>Date:</strong> {formatDateTime(selectedBackup.completedAt)}</div>
              <div><strong>Type:</strong> {selectedBackup.type}</div>
              <div><strong>Size:</strong> {selectedBackup.size}</div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBackup}>
              Delete Backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BackupManagementPage;
