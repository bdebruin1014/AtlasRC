import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Monitor, Smartphone, Tablet, Globe, Search, RefreshCw, LogOut,
  Shield, Clock, MapPin, AlertTriangle, Users, Laptop
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock active sessions data
const mockSessions = [
  {
    id: 'sess_001',
    userId: 'user_1',
    userName: 'John Smith',
    userEmail: 'john@atlasrc.com',
    deviceType: 'desktop',
    browser: 'Chrome 120',
    os: 'Windows 11',
    ipAddress: '192.168.1.100',
    location: 'Austin, TX, USA',
    startedAt: '2024-01-15T08:30:00Z',
    lastActivity: '2024-01-15T14:45:00Z',
    isCurrent: true,
  },
  {
    id: 'sess_002',
    userId: 'user_1',
    userName: 'John Smith',
    userEmail: 'john@atlasrc.com',
    deviceType: 'mobile',
    browser: 'Safari Mobile',
    os: 'iOS 17',
    ipAddress: '10.0.0.55',
    location: 'Austin, TX, USA',
    startedAt: '2024-01-15T10:00:00Z',
    lastActivity: '2024-01-15T12:30:00Z',
    isCurrent: false,
  },
  {
    id: 'sess_003',
    userId: 'user_2',
    userName: 'Sarah Johnson',
    userEmail: 'sarah@atlasrc.com',
    deviceType: 'desktop',
    browser: 'Firefox 121',
    os: 'macOS Sonoma',
    ipAddress: '172.16.0.45',
    location: 'Denver, CO, USA',
    startedAt: '2024-01-15T09:15:00Z',
    lastActivity: '2024-01-15T14:50:00Z',
    isCurrent: false,
  },
  {
    id: 'sess_004',
    userId: 'user_3',
    userName: 'Mike Davis',
    userEmail: 'mike@atlasrc.com',
    deviceType: 'tablet',
    browser: 'Chrome',
    os: 'iPadOS 17',
    ipAddress: '192.168.2.200',
    location: 'Phoenix, AZ, USA',
    startedAt: '2024-01-15T11:00:00Z',
    lastActivity: '2024-01-15T14:20:00Z',
    isCurrent: false,
  },
  {
    id: 'sess_005',
    userId: 'user_4',
    userName: 'Emily Chen',
    userEmail: 'emily@atlasrc.com',
    deviceType: 'desktop',
    browser: 'Edge 120',
    os: 'Windows 10',
    ipAddress: '10.10.10.100',
    location: 'Seattle, WA, USA',
    startedAt: '2024-01-15T07:45:00Z',
    lastActivity: '2024-01-15T14:55:00Z',
    isCurrent: false,
  },
  {
    id: 'sess_006',
    userId: 'user_2',
    userName: 'Sarah Johnson',
    userEmail: 'sarah@atlasrc.com',
    deviceType: 'mobile',
    browser: 'Chrome Mobile',
    os: 'Android 14',
    ipAddress: '192.168.5.88',
    location: 'Denver, CO, USA',
    startedAt: '2024-01-15T13:00:00Z',
    lastActivity: '2024-01-15T13:45:00Z',
    isCurrent: false,
  },
];

const ActiveSessionsPage = () => {
  const { toast } = useToast();
  const [sessions, setSessions] = useState(mockSessions);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);
  const [showTerminateAllDialog, setShowTerminateAllDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const loadData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = !searchQuery ||
      session.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.ipAddress.includes(searchQuery) ||
      session.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDevice = deviceFilter === 'all' || session.deviceType === deviceFilter;

    return matchesSearch && matchesDevice;
  });

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      default:
        return <Laptop className="w-4 h-4" />;
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

  const getSessionDuration = (startedAt) => {
    const start = new Date(startedAt);
    const now = new Date();
    const hours = Math.floor((now - start) / (1000 * 60 * 60));
    const minutes = Math.floor(((now - start) % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getLastActivityStatus = (lastActivity) => {
    const last = new Date(lastActivity);
    const now = new Date();
    const minutes = Math.floor((now - last) / (1000 * 60));

    if (minutes < 5) {
      return { text: 'Active now', color: 'bg-green-100 text-green-800' };
    } else if (minutes < 30) {
      return { text: `${minutes}m ago`, color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { text: `${Math.floor(minutes / 60)}h ago`, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const handleTerminateSession = async () => {
    if (!selectedSession) return;

    setSessions(prev => prev.filter(s => s.id !== selectedSession.id));
    setShowTerminateDialog(false);
    setSelectedSession(null);

    toast({
      title: 'Session Terminated',
      description: `Session for ${selectedSession.userName} has been terminated.`,
    });
  };

  const handleTerminateAllUserSessions = async () => {
    if (!selectedUser) return;

    setSessions(prev => prev.filter(s => s.userId !== selectedUser.userId || s.isCurrent));
    setShowTerminateAllDialog(false);
    setSelectedUser(null);

    toast({
      title: 'Sessions Terminated',
      description: `All sessions for ${selectedUser.userName} have been terminated (except current).`,
    });
  };

  const handleTerminateAllSessions = async () => {
    setSessions(prev => prev.filter(s => s.isCurrent));

    toast({
      title: 'All Sessions Terminated',
      description: 'All sessions except current have been terminated.',
    });
  };

  // Group sessions by user
  const sessionsByUser = sessions.reduce((acc, session) => {
    if (!acc[session.userId]) {
      acc[session.userId] = {
        userName: session.userName,
        userEmail: session.userEmail,
        sessions: [],
      };
    }
    acc[session.userId].sessions.push(session);
    return acc;
  }, {});

  const uniqueUsers = Object.keys(sessionsByUser).length;
  const totalSessions = sessions.length;
  const activeSessions = sessions.filter(s => {
    const minutes = Math.floor((new Date() - new Date(s.lastActivity)) / (1000 * 60));
    return minutes < 5;
  }).length;

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Active Sessions | Admin</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Active Sessions</h1>
          <p className="text-gray-600 mt-2">Monitor and manage active user sessions across all devices</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleTerminateAllSessions()}
            disabled={sessions.filter(s => !s.isCurrent).length === 0}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Terminate All
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Sessions</p>
                <p className="text-2xl font-bold">{totalSessions}</p>
              </div>
              <Globe className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Now</p>
                <p className="text-2xl font-bold text-green-600">{activeSessions}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Unique Users</p>
                <p className="text-2xl font-bold">{uniqueUsers}</p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Sessions/User</p>
                <p className="text-2xl font-bold">{(totalSessions / uniqueUsers).toFixed(1)}</p>
              </div>
              <Monitor className="w-8 h-8 text-gray-400" />
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
                placeholder="Search by user, email, IP, or location..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={deviceFilter} onValueChange={setDeviceFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by device" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Devices</SelectItem>
                <SelectItem value="desktop">Desktop</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="tablet">Tablet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>View and manage all active user sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No active sessions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSessions.map((session) => {
                    const activityStatus = getLastActivityStatus(session.lastActivity);
                    return (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {session.userName}
                              {session.isCurrent && (
                                <Badge className="bg-blue-100 text-blue-800 text-xs">Current</Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{session.userEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(session.deviceType)}
                            <div>
                              <div className="text-sm">{session.browser}</div>
                              <div className="text-xs text-gray-500">{session.os}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="text-sm">{session.location}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{session.ipAddress}</TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">{formatDateTime(session.startedAt)}</div>
                            <div className="text-xs text-gray-500">
                              Duration: {getSessionDuration(session.startedAt)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={activityStatus.color}>
                            {activityStatus.text}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(session);
                                setShowTerminateAllDialog(true);
                              }}
                              disabled={sessionsByUser[session.userId]?.sessions.length <= 1}
                            >
                              <Users className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedSession(session);
                                setShowTerminateDialog(true);
                              }}
                              disabled={session.isCurrent}
                            >
                              <LogOut className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Sessions by User Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Sessions by User</CardTitle>
          <CardDescription>Overview of sessions grouped by user</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(sessionsByUser).map(([userId, data]) => (
              <Card key={userId} className="border">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{data.userName}</div>
                      <div className="text-sm text-gray-500">{data.userEmail}</div>
                    </div>
                    <Badge>{data.sessions.length} session{data.sessions.length > 1 ? 's' : ''}</Badge>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {data.sessions.map(s => (
                      <div key={s.id} className="text-gray-500" title={`${s.browser} on ${s.os}`}>
                        {getDeviceIcon(s.deviceType)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Terminate Session Dialog */}
      <Dialog open={showTerminateDialog} onOpenChange={setShowTerminateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Terminate Session
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to terminate this session? The user will be logged out from this device.
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="py-4 space-y-2 text-sm">
              <div><strong>User:</strong> {selectedSession.userName}</div>
              <div><strong>Device:</strong> {selectedSession.browser} on {selectedSession.os}</div>
              <div><strong>Location:</strong> {selectedSession.location}</div>
              <div><strong>IP:</strong> {selectedSession.ipAddress}</div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTerminateDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleTerminateSession}>
              Terminate Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Terminate All User Sessions Dialog */}
      <Dialog open={showTerminateAllDialog} onOpenChange={setShowTerminateAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Terminate All User Sessions
            </DialogTitle>
            <DialogDescription>
              This will terminate all sessions for this user except their current session (if any).
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4 space-y-2 text-sm">
              <div><strong>User:</strong> {selectedUser.userName}</div>
              <div><strong>Email:</strong> {selectedUser.userEmail}</div>
              <div><strong>Active Sessions:</strong> {sessionsByUser[selectedUser.userId]?.sessions.length || 0}</div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTerminateAllDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleTerminateAllUserSessions}>
              Terminate All Sessions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActiveSessionsPage;
