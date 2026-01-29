import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Download, FileText, Database, Users, Building, Clock, RefreshCw,
  CheckCircle, XCircle, FileJson, FileSpreadsheet, Archive, Search, Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock export history
const mockExportHistory = [
  {
    id: 'exp_001',
    type: 'users',
    format: 'csv',
    requestedBy: 'John Smith',
    requestedAt: '2024-01-15T14:00:00Z',
    completedAt: '2024-01-15T14:02:30Z',
    status: 'completed',
    fileSize: '2.4 MB',
    recordCount: 1250,
    downloadUrl: '#',
    expiresAt: '2024-01-22T14:02:30Z',
  },
  {
    id: 'exp_002',
    type: 'transactions',
    format: 'json',
    requestedBy: 'Sarah Johnson',
    requestedAt: '2024-01-15T12:30:00Z',
    completedAt: '2024-01-15T12:45:00Z',
    status: 'completed',
    fileSize: '15.8 MB',
    recordCount: 45000,
    downloadUrl: '#',
    expiresAt: '2024-01-22T12:45:00Z',
  },
  {
    id: 'exp_003',
    type: 'projects',
    format: 'csv',
    requestedBy: 'Mike Davis',
    requestedAt: '2024-01-15T10:00:00Z',
    completedAt: null,
    status: 'processing',
    fileSize: null,
    recordCount: null,
    downloadUrl: null,
    progress: 65,
  },
  {
    id: 'exp_004',
    type: 'gdpr_request',
    format: 'zip',
    requestedBy: 'Emily Chen',
    requestedAt: '2024-01-14T16:00:00Z',
    completedAt: '2024-01-14T16:30:00Z',
    status: 'completed',
    fileSize: '8.2 MB',
    recordCount: null,
    downloadUrl: '#',
    expiresAt: '2024-01-21T16:30:00Z',
    userId: 'user_123',
    userName: 'Alex Thompson',
  },
  {
    id: 'exp_005',
    type: 'audit_logs',
    format: 'json',
    requestedBy: 'Robert Wilson',
    requestedAt: '2024-01-14T09:00:00Z',
    completedAt: null,
    status: 'failed',
    error: 'Export timeout - data set too large',
  },
];

// Export types
const exportTypes = [
  { id: 'users', label: 'Users', icon: Users, description: 'User accounts and profiles' },
  { id: 'projects', label: 'Projects', icon: Building, description: 'Project data and metadata' },
  { id: 'transactions', label: 'Transactions', icon: Database, description: 'Financial transactions' },
  { id: 'documents', label: 'Documents', icon: FileText, description: 'Document metadata' },
  { id: 'audit_logs', label: 'Audit Logs', icon: Clock, description: 'System audit trail' },
];

const DataExportCenterPage = () => {
  const { toast } = useToast();
  const [exportHistory, setExportHistory] = useState(mockExportHistory);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showGdprDialog, setShowGdprDialog] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [exportConfig, setExportConfig] = useState({
    type: 'users',
    format: 'csv',
    dateRange: 'all',
    includeArchived: false,
    fields: [],
  });

  const [gdprConfig, setGdprConfig] = useState({
    userEmail: '',
    userId: '',
    includeActivity: true,
    includeDocuments: true,
    includeTransactions: true,
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getFormatIcon = (format) => {
    switch (format) {
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4" />;
      case 'json':
        return <FileJson className="w-4 h-4" />;
      case 'zip':
        return <Archive className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStartExport = async () => {
    setExporting(true);

    // Add to history as processing
    const newExport = {
      id: `exp_${Date.now()}`,
      type: exportConfig.type,
      format: exportConfig.format,
      requestedBy: 'Current User',
      requestedAt: new Date().toISOString(),
      completedAt: null,
      status: 'processing',
      progress: 0,
    };

    setExportHistory(prev => [newExport, ...prev]);
    setShowExportDialog(false);

    // Simulate export progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setExportHistory(prev => prev.map(e =>
        e.id === newExport.id ? { ...e, progress: i } : e
      ));
    }

    // Complete the export
    setExportHistory(prev => prev.map(e =>
      e.id === newExport.id ? {
        ...e,
        status: 'completed',
        completedAt: new Date().toISOString(),
        fileSize: '3.2 MB',
        recordCount: 1500,
        downloadUrl: '#',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      } : e
    ));

    setExporting(false);
    toast({
      title: 'Export Complete',
      description: 'Your export is ready for download',
    });
  };

  const handleGdprExport = async () => {
    if (!gdprConfig.userEmail) {
      toast({
        variant: 'destructive',
        title: 'Missing Email',
        description: 'Please enter the user\'s email address',
      });
      return;
    }

    setExporting(true);

    const newExport = {
      id: `exp_${Date.now()}`,
      type: 'gdpr_request',
      format: 'zip',
      requestedBy: 'Current User',
      requestedAt: new Date().toISOString(),
      completedAt: null,
      status: 'processing',
      userName: gdprConfig.userEmail,
      progress: 0,
    };

    setExportHistory(prev => [newExport, ...prev]);
    setShowGdprDialog(false);

    // Simulate export
    await new Promise(resolve => setTimeout(resolve, 3000));

    setExportHistory(prev => prev.map(e =>
      e.id === newExport.id ? {
        ...e,
        status: 'completed',
        completedAt: new Date().toISOString(),
        fileSize: '12.5 MB',
        downloadUrl: '#',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      } : e
    ));

    setExporting(false);
    toast({
      title: 'GDPR Export Complete',
      description: 'User data export is ready for download',
    });
  };

  const handleDeleteExport = (exportId) => {
    setExportHistory(prev => prev.filter(e => e.id !== exportId));
    toast({
      title: 'Export Deleted',
      description: 'The export file has been removed',
    });
  };

  // Stats
  const completedExports = exportHistory.filter(e => e.status === 'completed').length;
  const processingExports = exportHistory.filter(e => e.status === 'processing').length;

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Data Export Center | Admin</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Data Export Center</h1>
          <p className="text-gray-600 mt-2">Export data for reporting, compliance, and GDPR requests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowGdprDialog(true)}>
            <Users className="w-4 h-4 mr-2" />
            GDPR Export
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowExportDialog(true)}>
            <Download className="w-4 h-4 mr-2" />
            New Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Exports</p>
                <p className="text-2xl font-bold">{exportHistory.length}</p>
              </div>
              <Download className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedExports}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Processing</p>
                <p className="text-2xl font-bold text-blue-600">{processingExports}</p>
              </div>
              <RefreshCw className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">GDPR Requests</p>
                <p className="text-2xl font-bold text-purple-600">
                  {exportHistory.filter(e => e.type === 'gdpr_request').length}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Export Cards */}
      <div className="grid grid-cols-5 gap-4">
        {exportTypes.map((type) => (
          <Card key={type.id} className="cursor-pointer hover:border-blue-300 transition-colors" onClick={() => {
            setExportConfig(prev => ({ ...prev, type: type.id }));
            setShowExportDialog(true);
          }}>
            <CardContent className="pt-6">
              <div className="text-center">
                <type.icon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <div className="font-medium">{type.label}</div>
                <div className="text-xs text-gray-500">{type.description}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle>Export History</CardTitle>
          <CardDescription>Recent data exports and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exportHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No exports found
                  </TableCell>
                </TableRow>
              ) : (
                exportHistory.map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(exp.status)}
                        <Badge className={getStatusBadge(exp.status)}>
                          {exp.status}
                        </Badge>
                      </div>
                      {exp.status === 'processing' && exp.progress !== undefined && (
                        <Progress value={exp.progress} className="w-20 h-1 mt-1" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium capitalize">
                          {exp.type === 'gdpr_request' ? 'GDPR Export' : exp.type}
                        </div>
                        {exp.recordCount && (
                          <div className="text-xs text-gray-500">
                            {exp.recordCount.toLocaleString()} records
                          </div>
                        )}
                        {exp.userName && (
                          <div className="text-xs text-gray-500">User: {exp.userName}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getFormatIcon(exp.format)}
                        <span className="uppercase">{exp.format}</span>
                      </div>
                    </TableCell>
                    <TableCell>{exp.requestedBy}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDateTime(exp.requestedAt)}</div>
                        {exp.completedAt && (
                          <div className="text-xs text-gray-500">
                            Completed: {formatDateTime(exp.completedAt)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{exp.fileSize || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {exp.status === 'completed' && exp.downloadUrl && (
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteExport(exp.id)}
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

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Export Data</DialogTitle>
            <DialogDescription>
              Configure and start a new data export
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Export Type</Label>
              <Select
                value={exportConfig.type}
                onValueChange={(value) => setExportConfig(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {exportTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Format</Label>
                <Select
                  value={exportConfig.format}
                  onValueChange={(value) => setExportConfig(prev => ({ ...prev, format: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                    <SelectItem value="json">JSON (Data)</SelectItem>
                    <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select
                  value={exportConfig.dateRange}
                  onValueChange={(value) => setExportConfig(prev => ({ ...prev, dateRange: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                    <SelectItem value="quarter">Last Quarter</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="week">Last Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeArchived"
                checked={exportConfig.includeArchived}
                onCheckedChange={(checked) => setExportConfig(prev => ({ ...prev, includeArchived: checked }))}
              />
              <Label htmlFor="includeArchived" className="font-normal">
                Include archived/deleted records
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleStartExport} disabled={exporting} className="bg-blue-600 hover:bg-blue-700">
              {exporting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Start Export
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* GDPR Export Dialog */}
      <Dialog open={showGdprDialog} onOpenChange={setShowGdprDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>GDPR Data Export</DialogTitle>
            <DialogDescription>
              Export all data for a specific user (GDPR compliance)
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userEmail">User Email *</Label>
              <Input
                id="userEmail"
                type="email"
                placeholder="user@example.com"
                value={gdprConfig.userEmail}
                onChange={(e) => setGdprConfig(prev => ({ ...prev, userEmail: e.target.value }))}
              />
            </div>

            <div className="space-y-3">
              <Label>Include Data Types</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeActivity"
                    checked={gdprConfig.includeActivity}
                    onCheckedChange={(checked) => setGdprConfig(prev => ({ ...prev, includeActivity: checked }))}
                  />
                  <Label htmlFor="includeActivity" className="font-normal">
                    Activity logs and login history
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeDocuments"
                    checked={gdprConfig.includeDocuments}
                    onCheckedChange={(checked) => setGdprConfig(prev => ({ ...prev, includeDocuments: checked }))}
                  />
                  <Label htmlFor="includeDocuments" className="font-normal">
                    Uploaded documents
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeTransactions"
                    checked={gdprConfig.includeTransactions}
                    onCheckedChange={(checked) => setGdprConfig(prev => ({ ...prev, includeTransactions: checked }))}
                  />
                  <Label htmlFor="includeTransactions" className="font-normal">
                    Transaction history
                  </Label>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              <strong>Note:</strong> This export will include all personal data associated with the user
              as required by GDPR Article 15 (Right of Access).
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGdprDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleGdprExport} disabled={exporting} className="bg-blue-600 hover:bg-blue-700">
              {exporting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export User Data
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataExportCenterPage;
