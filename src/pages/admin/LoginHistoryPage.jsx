import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Search, RefreshCw, Download, CheckCircle, XCircle, AlertTriangle,
  MapPin, Clock, Shield, CalendarIcon, Filter, Globe, Lock
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

// Mock login history data
const mockLoginHistory = [
  {
    id: 'log_001',
    userId: 'user_1',
    userName: 'John Smith',
    userEmail: 'john@atlasrc.com',
    status: 'success',
    ipAddress: '192.168.1.100',
    location: 'Austin, TX, USA',
    browser: 'Chrome 120',
    os: 'Windows 11',
    timestamp: '2024-01-15T14:30:00Z',
    mfaUsed: true,
    riskLevel: 'low',
  },
  {
    id: 'log_002',
    userId: 'user_2',
    userName: 'Sarah Johnson',
    userEmail: 'sarah@atlasrc.com',
    status: 'success',
    ipAddress: '172.16.0.45',
    location: 'Denver, CO, USA',
    browser: 'Firefox 121',
    os: 'macOS Sonoma',
    timestamp: '2024-01-15T14:15:00Z',
    mfaUsed: true,
    riskLevel: 'low',
  },
  {
    id: 'log_003',
    userId: 'user_3',
    userName: 'Mike Davis',
    userEmail: 'mike@atlasrc.com',
    status: 'failed',
    failureReason: 'Invalid password',
    ipAddress: '192.168.2.200',
    location: 'Phoenix, AZ, USA',
    browser: 'Safari 17',
    os: 'macOS Ventura',
    timestamp: '2024-01-15T13:45:00Z',
    mfaUsed: false,
    riskLevel: 'medium',
  },
  {
    id: 'log_004',
    userId: 'user_4',
    userName: 'Emily Chen',
    userEmail: 'emily@atlasrc.com',
    status: 'success',
    ipAddress: '10.10.10.100',
    location: 'Seattle, WA, USA',
    browser: 'Edge 120',
    os: 'Windows 10',
    timestamp: '2024-01-15T12:30:00Z',
    mfaUsed: false,
    riskLevel: 'low',
  },
  {
    id: 'log_005',
    userId: 'user_5',
    userName: 'Unknown',
    userEmail: 'admin@atlasrc.com',
    status: 'failed',
    failureReason: 'Account locked',
    ipAddress: '45.33.32.156',
    location: 'Lagos, Nigeria',
    browser: 'Chrome 119',
    os: 'Windows 10',
    timestamp: '2024-01-15T11:00:00Z',
    mfaUsed: false,
    riskLevel: 'high',
    flagged: true,
  },
  {
    id: 'log_006',
    userId: 'user_1',
    userName: 'John Smith',
    userEmail: 'john@atlasrc.com',
    status: 'success',
    ipAddress: '10.0.0.55',
    location: 'Austin, TX, USA',
    browser: 'Safari Mobile',
    os: 'iOS 17',
    timestamp: '2024-01-15T10:00:00Z',
    mfaUsed: true,
    riskLevel: 'low',
  },
  {
    id: 'log_007',
    userId: 'user_3',
    userName: 'Mike Davis',
    userEmail: 'mike@atlasrc.com',
    status: 'failed',
    failureReason: 'Invalid password',
    ipAddress: '192.168.2.200',
    location: 'Phoenix, AZ, USA',
    browser: 'Safari 17',
    os: 'macOS Ventura',
    timestamp: '2024-01-15T09:30:00Z',
    mfaUsed: false,
    riskLevel: 'medium',
  },
  {
    id: 'log_008',
    userId: 'user_3',
    userName: 'Mike Davis',
    userEmail: 'mike@atlasrc.com',
    status: 'failed',
    failureReason: 'Invalid password',
    ipAddress: '192.168.2.200',
    location: 'Phoenix, AZ, USA',
    browser: 'Safari 17',
    os: 'macOS Ventura',
    timestamp: '2024-01-15T09:28:00Z',
    mfaUsed: false,
    riskLevel: 'medium',
  },
  {
    id: 'log_009',
    userId: 'user_6',
    userName: 'Robert Wilson',
    userEmail: 'robert@atlasrc.com',
    status: 'success',
    ipAddress: '203.0.113.50',
    location: 'New York, NY, USA',
    browser: 'Chrome 120',
    os: 'Ubuntu 22.04',
    timestamp: '2024-01-15T08:45:00Z',
    mfaUsed: true,
    riskLevel: 'low',
  },
  {
    id: 'log_010',
    userId: 'user_7',
    userName: 'Unknown',
    userEmail: 'test@atlasrc.com',
    status: 'failed',
    failureReason: 'User not found',
    ipAddress: '198.51.100.77',
    location: 'Unknown',
    browser: 'curl/7.81.0',
    os: 'Unknown',
    timestamp: '2024-01-15T04:15:00Z',
    mfaUsed: false,
    riskLevel: 'high',
    flagged: true,
  },
];

const LoginHistoryPage = () => {
  const { toast } = useToast();
  const [loginHistory, setLoginHistory] = useState(mockLoginHistory);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  const loadData = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredHistory = loginHistory.filter(log => {
    const matchesSearch = !searchQuery ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.includes(searchQuery) ||
      log.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesRisk = riskFilter === 'all' || log.riskLevel === riskFilter;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  const getStatusIcon = (status) => {
    if (status === 'success') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusBadge = (status) => {
    if (status === 'success') {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-red-100 text-red-800';
  };

  const getRiskBadge = (riskLevel) => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'User', 'Email', 'Status', 'IP Address', 'Location', 'Browser', 'OS', 'MFA Used', 'Risk Level', 'Failure Reason'].join(','),
      ...filteredHistory.map(log => [
        log.timestamp,
        log.userName,
        log.userEmail,
        log.status,
        log.ipAddress,
        log.location,
        log.browser,
        log.os,
        log.mfaUsed ? 'Yes' : 'No',
        log.riskLevel,
        log.failureReason || '',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `login-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();

    toast({
      title: 'Export Complete',
      description: `Exported ${filteredHistory.length} login records`,
    });
  };

  // Stats
  const totalLogins = loginHistory.length;
  const successfulLogins = loginHistory.filter(l => l.status === 'success').length;
  const failedLogins = loginHistory.filter(l => l.status === 'failed').length;
  const highRiskAttempts = loginHistory.filter(l => l.riskLevel === 'high').length;
  const mfaLogins = loginHistory.filter(l => l.mfaUsed).length;

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Login History | Admin</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Login History</h1>
          <p className="text-gray-600 mt-2">Track login attempts with geolocation and anomaly detection</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Attempts</p>
                <p className="text-2xl font-bold">{totalLogins}</p>
              </div>
              <Globe className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Successful</p>
                <p className="text-2xl font-bold text-green-600">{successfulLogins}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Failed</p>
                <p className="text-2xl font-bold text-red-600">{failedLogins}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">High Risk</p>
                <p className="text-2xl font-bold text-orange-600">{highRiskAttempts}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">With MFA</p>
                <p className="text-2xl font-bold text-blue-600">{mfaLogins}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* High Risk Alerts */}
      {highRiskAttempts > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              <div>
                <h3 className="font-semibold text-orange-800">Security Alert</h3>
                <p className="text-sm text-orange-700">
                  {highRiskAttempts} high-risk login attempt{highRiskAttempts > 1 ? 's' : ''} detected.
                  Review flagged entries below for suspicious activity.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risks</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-48">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}`
                    ) : (
                      format(dateRange.from, 'MMM d, yyyy')
                    )
                  ) : (
                    'Date Range'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Login History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Login Attempts</CardTitle>
          <CardDescription>Detailed log of all authentication attempts</CardDescription>
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
                  <TableHead>Status</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>MFA</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No login history found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistory.map((log) => (
                    <TableRow key={log.id} className={log.flagged ? 'bg-red-50' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          <div>
                            <Badge className={getStatusBadge(log.status)}>
                              {log.status}
                            </Badge>
                            {log.failureReason && (
                              <div className="text-xs text-red-600 mt-1">{log.failureReason}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {log.userName}
                            {log.flagged && <AlertTriangle className="w-3 h-3 text-red-500" />}
                          </div>
                          <div className="text-sm text-gray-500">{log.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-sm">{log.location}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                      <TableCell>
                        <div className="text-sm">{log.browser}</div>
                        <div className="text-xs text-gray-500">{log.os}</div>
                      </TableCell>
                      <TableCell>
                        {log.mfaUsed ? (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Shield className="w-3 h-3 mr-1" />
                            MFA
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getRiskBadge(log.riskLevel)}>
                          {log.riskLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="w-3 h-3" />
                          {formatDateTime(log.timestamp)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Failed Login Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Failed Login Patterns</CardTitle>
          <CardDescription>Users with multiple failed login attempts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(
              loginHistory
                .filter(l => l.status === 'failed')
                .reduce((acc, log) => {
                  if (!acc[log.userEmail]) {
                    acc[log.userEmail] = { count: 0, ips: new Set(), lastAttempt: null };
                  }
                  acc[log.userEmail].count++;
                  acc[log.userEmail].ips.add(log.ipAddress);
                  if (!acc[log.userEmail].lastAttempt || log.timestamp > acc[log.userEmail].lastAttempt) {
                    acc[log.userEmail].lastAttempt = log.timestamp;
                  }
                  return acc;
                }, {})
            )
              .filter(([_, data]) => data.count > 1)
              .sort((a, b) => b[1].count - a[1].count)
              .map(([email, data]) => (
                <div key={email} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{email}</div>
                    <div className="text-sm text-gray-500">
                      {data.count} failed attempts from {data.ips.size} IP{data.ips.size > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      Last: {formatDateTime(data.lastAttempt)}
                    </span>
                    <Button variant="outline" size="sm">
                      <Lock className="w-4 h-4 mr-1" />
                      Lock Account
                    </Button>
                  </div>
                </div>
              ))}
            {loginHistory.filter(l => l.status === 'failed').length === 0 && (
              <p className="text-center text-gray-500 py-4">No failed login patterns detected</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginHistoryPage;
