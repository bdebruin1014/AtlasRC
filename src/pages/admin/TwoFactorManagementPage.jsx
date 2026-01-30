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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Shield, Search, RefreshCw, Smartphone, Key, Mail, AlertTriangle,
  CheckCircle, XCircle, RotateCcw, Users, Lock, Unlock, Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock users with 2FA status
const mockUsers = [
  {
    id: 'user_1',
    name: 'John Smith',
    email: 'john@atlasrc.com',
    role: 'admin',
    mfaEnabled: true,
    mfaMethod: 'authenticator',
    mfaEnrolledAt: '2024-01-10T10:00:00Z',
    backupCodesRemaining: 8,
    lastMfaUsed: '2024-01-15T14:30:00Z',
  },
  {
    id: 'user_2',
    name: 'Sarah Johnson',
    email: 'sarah@atlasrc.com',
    role: 'manager',
    mfaEnabled: true,
    mfaMethod: 'sms',
    mfaEnrolledAt: '2024-01-08T15:30:00Z',
    backupCodesRemaining: 10,
    lastMfaUsed: '2024-01-15T12:00:00Z',
  },
  {
    id: 'user_3',
    name: 'Mike Davis',
    email: 'mike@atlasrc.com',
    role: 'team_member',
    mfaEnabled: false,
    mfaMethod: null,
    mfaEnrolledAt: null,
    backupCodesRemaining: 0,
    lastMfaUsed: null,
  },
  {
    id: 'user_4',
    name: 'Emily Chen',
    email: 'emily@atlasrc.com',
    role: 'accountant',
    mfaEnabled: true,
    mfaMethod: 'email',
    mfaEnrolledAt: '2024-01-05T09:00:00Z',
    backupCodesRemaining: 5,
    lastMfaUsed: '2024-01-14T16:45:00Z',
  },
  {
    id: 'user_5',
    name: 'Robert Wilson',
    email: 'robert@atlasrc.com',
    role: 'team_member',
    mfaEnabled: false,
    mfaMethod: null,
    mfaEnrolledAt: null,
    backupCodesRemaining: 0,
    lastMfaUsed: null,
  },
];

const TwoFactorManagementPage = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState(mockUsers);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mfaFilter, setMfaFilter] = useState('all');
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showEnforceDialog, setShowEnforceDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Global MFA settings
  const [globalSettings, setGlobalSettings] = useState({
    enforceMfa: false,
    allowedMethods: ['authenticator', 'sms', 'email'],
    gracePeriodDays: 7,
    requireForRoles: ['admin', 'super_admin'],
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMfa = mfaFilter === 'all' ||
      (mfaFilter === 'enabled' && user.mfaEnabled) ||
      (mfaFilter === 'disabled' && !user.mfaEnabled);

    return matchesSearch && matchesMfa;
  });

  const getMfaMethodIcon = (method) => {
    switch (method) {
      case 'authenticator':
        return <Smartphone className="w-4 h-4" />;
      case 'sms':
        return <Smartphone className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      default:
        return <Key className="w-4 h-4" />;
    }
  };

  const getMfaMethodLabel = (method) => {
    switch (method) {
      case 'authenticator':
        return 'Authenticator App';
      case 'sms':
        return 'SMS';
      case 'email':
        return 'Email';
      default:
        return 'Unknown';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleResetMfa = (user) => {
    setSelectedUser(user);
    setShowResetDialog(true);
  };

  const confirmResetMfa = () => {
    setUsers(prev => prev.map(u => {
      if (u.id !== selectedUser.id) return u;
      return {
        ...u,
        mfaEnabled: false,
        mfaMethod: null,
        mfaEnrolledAt: null,
        backupCodesRemaining: 0,
        lastMfaUsed: null,
      };
    }));

    setShowResetDialog(false);
    setSelectedUser(null);

    toast({
      title: '2FA Reset',
      description: `Two-factor authentication has been reset for ${selectedUser.name}. They will need to set it up again on their next login.`,
    });
  };

  const handleRegenerateBackupCodes = (user) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== user.id) return u;
      return { ...u, backupCodesRemaining: 10 };
    }));

    toast({
      title: 'Backup Codes Regenerated',
      description: `New backup codes have been generated for ${user.name}. They will receive them via email.`,
    });
  };

  const handleEnforceMfa = () => {
    setShowEnforceDialog(true);
  };

  const confirmEnforceMfa = () => {
    setGlobalSettings(prev => ({ ...prev, enforceMfa: true }));
    setShowEnforceDialog(false);

    toast({
      title: 'MFA Enforcement Enabled',
      description: `All users will be required to set up 2FA within ${globalSettings.gracePeriodDays} days.`,
    });
  };

  // Stats
  const totalUsers = users.length;
  const mfaEnabledUsers = users.filter(u => u.mfaEnabled).length;
  const mfaDisabledUsers = users.filter(u => !u.mfaEnabled).length;
  const lowBackupCodes = users.filter(u => u.mfaEnabled && u.backupCodesRemaining <= 3).length;

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Two-Factor Authentication | Admin</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Two-Factor Authentication</h1>
          <p className="text-gray-600 mt-2">Manage 2FA settings and user enrollment status</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setLoading(true)}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {!globalSettings.enforceMfa && (
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleEnforceMfa}>
              <Shield className="w-4 h-4 mr-2" />
              Enforce MFA
            </Button>
          )}
        </div>
      </div>

      {/* Global Settings Alert */}
      {globalSettings.enforceMfa && (
        <Alert className="border-blue-200 bg-blue-50">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">MFA Enforcement Active</AlertTitle>
          <AlertDescription className="text-blue-700">
            All users are required to set up two-factor authentication.
            Grace period: {globalSettings.gracePeriodDays} days for new users.
          </AlertDescription>
        </Alert>
      )}

      {/* Warning for users without MFA */}
      {mfaDisabledUsers > 0 && !globalSettings.enforceMfa && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Security Warning</AlertTitle>
          <AlertDescription className="text-yellow-700">
            {mfaDisabledUsers} user{mfaDisabledUsers > 1 ? 's' : ''} do not have 2FA enabled.
            Consider enforcing MFA for all users to improve security.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">MFA Enabled</p>
                <p className="text-2xl font-bold text-green-600">{mfaEnabledUsers}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">MFA Disabled</p>
                <p className="text-2xl font-bold text-red-600">{mfaDisabledUsers}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Low Backup Codes</p>
                <p className="text-2xl font-bold text-yellow-600">{lowBackupCodes}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Global MFA Settings
          </CardTitle>
          <CardDescription>Configure organization-wide two-factor authentication settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Enforce MFA for All Users</Label>
              <p className="text-sm text-gray-500">Require all users to set up two-factor authentication</p>
            </div>
            <Switch
              checked={globalSettings.enforceMfa}
              onCheckedChange={(checked) => {
                if (checked) {
                  handleEnforceMfa();
                } else {
                  setGlobalSettings(prev => ({ ...prev, enforceMfa: false }));
                }
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Allowed MFA Methods</Label>
              <div className="space-y-2">
                {['authenticator', 'sms', 'email'].map(method => (
                  <div key={method} className="flex items-center space-x-2">
                    <Switch
                      id={method}
                      checked={globalSettings.allowedMethods.includes(method)}
                      onCheckedChange={(checked) => {
                        setGlobalSettings(prev => ({
                          ...prev,
                          allowedMethods: checked
                            ? [...prev.allowedMethods, method]
                            : prev.allowedMethods.filter(m => m !== method),
                        }));
                      }}
                    />
                    <Label htmlFor={method} className="font-normal">
                      {getMfaMethodLabel(method)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Grace Period for New Users</Label>
              <Select
                value={String(globalSettings.gracePeriodDays)}
                onValueChange={(value) =>
                  setGlobalSettings(prev => ({ ...prev, gracePeriodDays: parseInt(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Immediate</SelectItem>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                Time allowed for new users to set up MFA after account creation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
            <Select value={mfaFilter} onValueChange={setMfaFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="MFA Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="enabled">MFA Enabled</SelectItem>
                <SelectItem value="disabled">MFA Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User MFA Status</CardTitle>
          <CardDescription>View and manage two-factor authentication for all users</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>MFA Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Backup Codes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.mfaEnabled ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Enabled
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          Disabled
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.mfaMethod ? (
                        <div className="flex items-center gap-2">
                          {getMfaMethodIcon(user.mfaMethod)}
                          <span>{getMfaMethodLabel(user.mfaMethod)}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDateTime(user.mfaEnrolledAt)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDateTime(user.lastMfaUsed)}
                    </TableCell>
                    <TableCell>
                      {user.mfaEnabled ? (
                        <div className="flex items-center gap-2">
                          <span className={user.backupCodesRemaining <= 3 ? 'text-red-600 font-medium' : ''}>
                            {user.backupCodesRemaining}/10
                          </span>
                          {user.backupCodesRemaining <= 3 && (
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.mfaEnabled ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRegenerateBackupCodes(user)}
                            title="Regenerate Backup Codes"
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResetMfa(user)}
                            className="text-red-600 hover:text-red-700"
                            title="Reset MFA"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" disabled>
                          Not Enrolled
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reset MFA Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Reset Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              This will remove the current 2FA configuration for this user.
              They will need to set up 2FA again on their next login.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4 space-y-2 text-sm">
              <div><strong>User:</strong> {selectedUser.name}</div>
              <div><strong>Email:</strong> {selectedUser.email}</div>
              <div><strong>Current Method:</strong> {getMfaMethodLabel(selectedUser.mfaMethod)}</div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmResetMfa}>
              Reset MFA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enforce MFA Dialog */}
      <Dialog open={showEnforceDialog} onOpenChange={setShowEnforceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              Enable MFA Enforcement
            </DialogTitle>
            <DialogDescription>
              This will require all users to set up two-factor authentication.
              Users who haven&apos;t enrolled will have {globalSettings.gracePeriodDays} days to do so.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800">Important</AlertTitle>
              <AlertDescription className="text-yellow-700">
                {mfaDisabledUsers} user{mfaDisabledUsers > 1 ? 's' : ''} will be required to set up MFA.
                They will be prompted on their next login.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEnforceDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={confirmEnforceMfa}>
              Enable Enforcement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TwoFactorManagementPage;
