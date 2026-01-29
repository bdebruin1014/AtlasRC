import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Upload, Download, Users, CheckCircle, XCircle, AlertTriangle,
  FileText, RefreshCw, Trash2, UserPlus, FileSpreadsheet, Copy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ROLES, ROLE_LABELS } from '@/services/permissionService';

const BulkUserManagementPage = () => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  // Import state
  const [importFile, setImportFile] = useState(null);
  const [importData, setImportData] = useState([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);

  // Export state
  const [exportOptions, setExportOptions] = useState({
    format: 'csv',
    includeInactive: false,
    includePermissions: true,
    selectedRoles: [],
  });
  const [exporting, setExporting] = useState(false);

  // Template for CSV import
  const csvTemplate = `full_name,email,role,department,job_title
John Doe,john.doe@example.com,team_member,Sales,Sales Representative
Jane Smith,jane.smith@example.com,manager,Engineering,Engineering Manager
Bob Wilson,bob.wilson@example.com,accountant,Finance,Senior Accountant`;

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        variant: 'destructive',
        title: 'Invalid File',
        description: 'Please upload a CSV file',
      });
      return;
    }

    setImportFile(file);
    parseCSV(file);
  };

  const parseCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

      const data = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        const row = { _rowIndex: index + 2 };

        headers.forEach((header, i) => {
          row[header] = values[i] || '';
        });

        // Validate row
        row._errors = [];
        if (!row.full_name) row._errors.push('Name is required');
        if (!row.email) row._errors.push('Email is required');
        if (row.email && !row.email.includes('@')) row._errors.push('Invalid email format');
        if (row.role && !Object.values(ROLES).includes(row.role)) {
          row._errors.push(`Invalid role: ${row.role}`);
        }

        row._status = row._errors.length === 0 ? 'valid' : 'invalid';
        return row;
      });

      setImportData(data);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const validRows = importData.filter(row => row._status === 'valid');
    if (validRows.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Valid Rows',
        description: 'Please fix the errors in your CSV file',
      });
      return;
    }

    setImporting(true);
    setImportProgress(0);

    const results = { success: 0, failed: 0, errors: [] };

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));

      // Simulate random success/failure
      if (Math.random() > 0.1) {
        results.success++;
      } else {
        results.failed++;
        results.errors.push({ row: row._rowIndex, email: row.email, error: 'Email already exists' });
      }

      setImportProgress(Math.round(((i + 1) / validRows.length) * 100));
    }

    setImportResults(results);
    setImporting(false);

    toast({
      title: 'Import Complete',
      description: `${results.success} users created, ${results.failed} failed`,
    });
  };

  const handleExport = async () => {
    setExporting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate mock export data
    const mockUsers = [
      { full_name: 'John Smith', email: 'john@atlasrc.com', role: 'admin', department: 'Executive', job_title: 'CEO', status: 'active', created_at: '2023-01-15' },
      { full_name: 'Sarah Johnson', email: 'sarah@atlasrc.com', role: 'manager', department: 'Development', job_title: 'VP Engineering', status: 'active', created_at: '2023-02-20' },
      { full_name: 'Mike Davis', email: 'mike@atlasrc.com', role: 'team_member', department: 'Sales', job_title: 'Sales Rep', status: 'active', created_at: '2023-03-10' },
      { full_name: 'Emily Chen', email: 'emily@atlasrc.com', role: 'accountant', department: 'Finance', job_title: 'Controller', status: 'active', created_at: '2023-04-05' },
      { full_name: 'Robert Wilson', email: 'robert@atlasrc.com', role: 'team_member', department: 'Operations', job_title: 'Operations Analyst', status: 'inactive', created_at: '2023-05-01' },
    ];

    let filteredUsers = mockUsers;
    if (!exportOptions.includeInactive) {
      filteredUsers = filteredUsers.filter(u => u.status === 'active');
    }
    if (exportOptions.selectedRoles.length > 0) {
      filteredUsers = filteredUsers.filter(u => exportOptions.selectedRoles.includes(u.role));
    }

    let content = '';
    let filename = '';
    let mimeType = '';

    if (exportOptions.format === 'csv') {
      const headers = ['full_name', 'email', 'role', 'department', 'job_title', 'status', 'created_at'];
      content = [
        headers.join(','),
        ...filteredUsers.map(u => headers.map(h => u[h]).join(','))
      ].join('\n');
      filename = 'users-export.csv';
      mimeType = 'text/csv';
    } else {
      content = JSON.stringify(filteredUsers, null, 2);
      filename = 'users-export.json';
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    setExporting(false);

    toast({
      title: 'Export Complete',
      description: `Exported ${filteredUsers.length} users`,
    });
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(csvTemplate);
    toast({
      title: 'Copied',
      description: 'CSV template copied to clipboard',
    });
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user-import-template.csv';
    a.click();
  };

  const clearImport = () => {
    setImportFile(null);
    setImportData([]);
    setImportResults(null);
    setImportProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validCount = importData.filter(r => r._status === 'valid').length;
  const invalidCount = importData.filter(r => r._status === 'invalid').length;

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Bulk User Management | Admin</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bulk User Management</h1>
          <p className="text-gray-600 mt-2">Import and export users in bulk via CSV or JSON</p>
        </div>
      </div>

      <Tabs defaultValue="import" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="import">
            <Upload className="w-4 h-4 mr-2" />
            Import Users
          </TabsTrigger>
          <TabsTrigger value="export">
            <Download className="w-4 h-4 mr-2" />
            Export Users
          </TabsTrigger>
        </TabsList>

        {/* Import Tab */}
        <TabsContent value="import" className="space-y-6">
          {/* Template Download */}
          <Card>
            <CardHeader>
              <CardTitle>CSV Template</CardTitle>
              <CardDescription>Use this template format for importing users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <pre>{csvTemplate}</pre>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCopyTemplate}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Template
                </Button>
                <Button variant="outline" onClick={handleDownloadTemplate}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Valid roles:</strong> {Object.values(ROLES).join(', ')}</p>
                <p><strong>Required fields:</strong> full_name, email</p>
                <p><strong>Optional fields:</strong> role (default: team_member), department, job_title</p>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
              <CardDescription>Select a CSV file to import users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <FileSpreadsheet className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                {importFile ? (
                  <div>
                    <p className="font-medium">{importFile.name}</p>
                    <p className="text-sm text-gray-500">{(importFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500">CSV files only</p>
                  </div>
                )}
              </div>

              {importFile && (
                <Button variant="outline" onClick={clearImport}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Preview & Validation */}
          {importData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Preview & Validation</CardTitle>
                <CardDescription>
                  Review the data before importing. {validCount} valid, {invalidCount} with errors.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {validCount} Valid
                  </Badge>
                  {invalidCount > 0 && (
                    <Badge className="bg-red-100 text-red-800">
                      <XCircle className="w-3 h-3 mr-1" />
                      {invalidCount} Invalid
                    </Badge>
                  )}
                </div>

                <div className="max-h-96 overflow-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Row</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Errors</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importData.map((row, index) => (
                        <TableRow key={index} className={row._status === 'invalid' ? 'bg-red-50' : ''}>
                          <TableCell className="font-mono text-sm">{row._rowIndex}</TableCell>
                          <TableCell>
                            {row._status === 'valid' ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                          </TableCell>
                          <TableCell>{row.full_name || '-'}</TableCell>
                          <TableCell>{row.email || '-'}</TableCell>
                          <TableCell>
                            {row.role ? (
                              <Badge variant="outline">{ROLE_LABELS[row.role] || row.role}</Badge>
                            ) : '-'}
                          </TableCell>
                          <TableCell>{row.department || '-'}</TableCell>
                          <TableCell>
                            {row._errors.length > 0 && (
                              <span className="text-sm text-red-600">
                                {row._errors.join(', ')}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {importing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Importing users...</span>
                      <span>{importProgress}%</span>
                    </div>
                    <Progress value={importProgress} />
                  </div>
                )}

                {importResults && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-4">
                        <CheckCircle className="w-6 h-6 text-blue-600" />
                        <div>
                          <p className="font-medium">Import Complete</p>
                          <p className="text-sm text-gray-600">
                            {importResults.success} users created successfully,
                            {importResults.failed} failed
                          </p>
                        </div>
                      </div>
                      {importResults.errors.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <p className="text-sm font-medium">Errors:</p>
                          {importResults.errors.map((err, i) => (
                            <p key={i} className="text-sm text-red-600">
                              Row {err.row} ({err.email}): {err.error}
                            </p>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={clearImport}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={validCount === 0 || importing}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {importing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Import {validCount} Users
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>Configure what data to include in the export</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select
                    value={exportOptions.format}
                    onValueChange={(value) => setExportOptions(prev => ({ ...prev, format: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                      <SelectItem value="json">JSON (Data)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Filter by Role</Label>
                  <Select
                    value={exportOptions.selectedRoles.length === 0 ? 'all' : 'selected'}
                    onValueChange={(value) => {
                      if (value === 'all') {
                        setExportOptions(prev => ({ ...prev, selectedRoles: [] }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {Object.entries(ROLES).map(([key, value]) => (
                        <SelectItem key={value} value={value}>
                          {ROLE_LABELS[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Include</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeInactive"
                      checked={exportOptions.includeInactive}
                      onCheckedChange={(checked) =>
                        setExportOptions(prev => ({ ...prev, includeInactive: checked }))
                      }
                    />
                    <Label htmlFor="includeInactive" className="font-normal">
                      Include inactive users
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includePermissions"
                      checked={exportOptions.includePermissions}
                      onCheckedChange={(checked) =>
                        setExportOptions(prev => ({ ...prev, includePermissions: checked }))
                      }
                    />
                    <Label htmlFor="includePermissions" className="font-normal">
                      Include custom permissions
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleExport}
                  disabled={exporting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {exporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export Users
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Export Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Export Preview</CardTitle>
              <CardDescription>Sample of data that will be exported</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>John Smith</TableCell>
                    <TableCell>john@atlasrc.com</TableCell>
                    <TableCell><Badge variant="outline">Admin</Badge></TableCell>
                    <TableCell>Executive</TableCell>
                    <TableCell><Badge className="bg-green-100 text-green-800">Active</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Sarah Johnson</TableCell>
                    <TableCell>sarah@atlasrc.com</TableCell>
                    <TableCell><Badge variant="outline">Manager</Badge></TableCell>
                    <TableCell>Development</TableCell>
                    <TableCell><Badge className="bg-green-100 text-green-800">Active</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Mike Davis</TableCell>
                    <TableCell>mike@atlasrc.com</TableCell>
                    <TableCell><Badge variant="outline">Team Member</Badge></TableCell>
                    <TableCell>Sales</TableCell>
                    <TableCell><Badge className="bg-green-100 text-green-800">Active</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <p className="text-sm text-gray-500 mt-4">
                Showing 3 of estimated 25 users. Actual export will include all matching users.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BulkUserManagementPage;
