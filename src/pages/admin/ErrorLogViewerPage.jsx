import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertTriangle, Search, RefreshCw, Download, Eye, Bug, XCircle,
  AlertCircle, Info, Clock, FileCode, Copy, CheckCircle, Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock error logs
const mockErrors = [
  {
    id: 'err_001',
    level: 'error',
    message: 'Failed to connect to database',
    source: 'DatabaseService',
    file: '/src/services/database.js',
    line: 142,
    timestamp: '2024-01-15T14:45:32Z',
    count: 3,
    lastOccurrence: '2024-01-15T14:52:18Z',
    stack: `Error: Failed to connect to database
    at DatabaseService.connect (/src/services/database.js:142:15)
    at async startServer (/src/server.js:45:5)
    at async bootstrap (/src/index.js:12:3)`,
    context: { host: 'db.example.com', port: 5432, timeout: 30000 },
    resolved: false,
  },
  {
    id: 'err_002',
    level: 'warning',
    message: 'Slow query detected (>1000ms)',
    source: 'QueryMonitor',
    file: '/src/middleware/queryMonitor.js',
    line: 67,
    timestamp: '2024-01-15T14:30:15Z',
    count: 15,
    lastOccurrence: '2024-01-15T14:50:00Z',
    stack: null,
    context: { query: 'SELECT * FROM transactions WHERE...', duration: 1250, table: 'transactions' },
    resolved: false,
  },
  {
    id: 'err_003',
    level: 'error',
    message: 'Unhandled promise rejection',
    source: 'AsyncHandler',
    file: '/src/controllers/userController.js',
    line: 89,
    timestamp: '2024-01-15T13:22:45Z',
    count: 1,
    lastOccurrence: '2024-01-15T13:22:45Z',
    stack: `UnhandledPromiseRejection: Cannot read property 'id' of undefined
    at UserController.getProfile (/src/controllers/userController.js:89:24)
    at Layer.handle (/node_modules/express/lib/router/layer.js:95:5)
    at next (/node_modules/express/lib/router/route.js:137:13)`,
    context: { userId: undefined, route: '/api/users/profile' },
    resolved: true,
  },
  {
    id: 'err_004',
    level: 'critical',
    message: 'Out of memory error',
    source: 'ProcessMonitor',
    file: '/src/utils/memory.js',
    line: 23,
    timestamp: '2024-01-15T12:00:00Z',
    count: 1,
    lastOccurrence: '2024-01-15T12:00:00Z',
    stack: `FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory
    at ProcessMonitor.checkMemory (/src/utils/memory.js:23:11)`,
    context: { heapUsed: '1.95 GB', heapTotal: '2.0 GB', rss: '2.4 GB' },
    resolved: true,
  },
  {
    id: 'err_005',
    level: 'info',
    message: 'Rate limit exceeded for IP',
    source: 'RateLimiter',
    file: '/src/middleware/rateLimiter.js',
    line: 45,
    timestamp: '2024-01-15T14:55:00Z',
    count: 42,
    lastOccurrence: '2024-01-15T14:58:30Z',
    stack: null,
    context: { ip: '192.168.1.100', limit: 100, window: '1m' },
    resolved: false,
  },
  {
    id: 'err_006',
    level: 'error',
    message: 'Email delivery failed',
    source: 'EmailService',
    file: '/src/services/email.js',
    line: 156,
    timestamp: '2024-01-15T14:40:00Z',
    count: 5,
    lastOccurrence: '2024-01-15T14:55:00Z',
    stack: `Error: Connection refused
    at EmailService.send (/src/services/email.js:156:19)
    at async sendNotification (/src/services/notification.js:78:5)`,
    context: { recipient: 'user@example.com', subject: 'Welcome', provider: 'smtp.example.com' },
    resolved: false,
  },
];

const ErrorLogViewerPage = () => {
  const { toast } = useToast();
  const [errors, setErrors] = useState(mockErrors);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedError, setSelectedError] = useState(null);

  const filteredErrors = errors.filter(error => {
    const matchesSearch = !searchQuery ||
      error.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      error.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      error.file.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLevel = levelFilter === 'all' || error.level === levelFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'resolved' && error.resolved) ||
      (statusFilter === 'unresolved' && !error.resolved);

    return matchesSearch && matchesLevel && matchesStatus;
  });

  const getLevelIcon = (level) => {
    switch (level) {
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Bug className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLevelBadge = (level) => {
    switch (level) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
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
      second: '2-digit',
    });
  };

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
    toast({
      title: 'Logs Refreshed',
      description: 'Error logs have been updated',
    });
  };

  const handleViewDetails = (error) => {
    setSelectedError(error);
    setShowDetailsDialog(true);
  };

  const handleCopyStack = () => {
    if (selectedError?.stack) {
      navigator.clipboard.writeText(selectedError.stack);
      toast({
        title: 'Copied',
        description: 'Stack trace copied to clipboard',
      });
    }
  };

  const handleMarkResolved = (errorId) => {
    setErrors(prev => prev.map(e =>
      e.id === errorId ? { ...e, resolved: !e.resolved } : e
    ));
    toast({
      title: 'Status Updated',
      description: 'Error resolution status has been toggled',
    });
  };

  const handleExport = () => {
    const data = JSON.stringify(filteredErrors, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    toast({
      title: 'Export Complete',
      description: `Exported ${filteredErrors.length} error logs`,
    });
  };

  const handleClearResolved = () => {
    setErrors(prev => prev.filter(e => !e.resolved));
    toast({
      title: 'Cleared',
      description: 'Resolved errors have been removed from the log',
    });
  };

  // Stats
  const criticalCount = errors.filter(e => e.level === 'critical' && !e.resolved).length;
  const errorCount = errors.filter(e => e.level === 'error' && !e.resolved).length;
  const warningCount = errors.filter(e => e.level === 'warning' && !e.resolved).length;
  const resolvedCount = errors.filter(e => e.resolved).length;

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Error Logs | Admin</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Error Log Viewer</h1>
          <p className="text-gray-600 mt-2">Monitor and troubleshoot application errors</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={handleClearResolved}
            disabled={resolvedCount === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Resolved
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className={criticalCount > 0 ? 'border-red-200 bg-red-50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Critical</p>
                <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Errors</p>
                <p className="text-2xl font-bold text-red-500">{errorCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">{warningCount}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{resolvedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
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
                placeholder="Search by message, source, or file..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unresolved">Unresolved</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error Table */}
      <Card>
        <CardHeader>
          <CardTitle>Error Logs</CardTitle>
          <CardDescription>
            {filteredErrors.length} error{filteredErrors.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Level</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Last Occurrence</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredErrors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No errors found
                  </TableCell>
                </TableRow>
              ) : (
                filteredErrors.map((error) => (
                  <TableRow key={error.id} className={error.resolved ? 'opacity-50' : ''}>
                    <TableCell>
                      <Badge className={getLevelBadge(error.level)}>
                        {getLevelIcon(error.level)}
                        <span className="ml-1">{error.level}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <div className="font-medium truncate">{error.message}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <FileCode className="w-3 h-3" />
                          {error.file}:{error.line}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{error.source}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{error.count}x</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(error.lastOccurrence)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {error.resolved ? (
                        <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Open</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(error)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkResolved(error.id)}
                        >
                          {error.resolved ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
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

      {/* Error Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedError && getLevelIcon(selectedError.level)}
              Error Details
            </DialogTitle>
            <DialogDescription>
              {selectedError?.message}
            </DialogDescription>
          </DialogHeader>
          {selectedError && (
            <ScrollArea className="max-h-[500px]">
              <Tabs defaultValue="details" className="w-full">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="stack">Stack Trace</TabsTrigger>
                  <TabsTrigger value="context">Context</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Level</span>
                      <div className="font-medium">
                        <Badge className={getLevelBadge(selectedError.level)}>
                          {selectedError.level}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Source</span>
                      <div className="font-medium">{selectedError.source}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">File</span>
                      <div className="font-medium font-mono text-xs">{selectedError.file}:{selectedError.line}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Occurrences</span>
                      <div className="font-medium">{selectedError.count}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">First Seen</span>
                      <div className="font-medium">{formatDateTime(selectedError.timestamp)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Seen</span>
                      <div className="font-medium">{formatDateTime(selectedError.lastOccurrence)}</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="stack" className="space-y-4">
                  {selectedError.stack ? (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Stack Trace</span>
                        <Button variant="outline" size="sm" onClick={handleCopyStack}>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs font-mono whitespace-pre-wrap">
                        {selectedError.stack}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No stack trace available</p>
                  )}
                </TabsContent>

                <TabsContent value="context" className="space-y-4">
                  {selectedError.context ? (
                    <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                      {JSON.stringify(selectedError.context, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No context data available</p>
                  )}
                </TabsContent>
              </Tabs>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                handleMarkResolved(selectedError.id);
                setShowDetailsDialog(false);
              }}
            >
              {selectedError?.resolved ? 'Mark as Unresolved' : 'Mark as Resolved'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ErrorLogViewerPage;
