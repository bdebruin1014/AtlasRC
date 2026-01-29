import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  Award,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  Building2,
  FileText,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  Bell,
  Download,
  Upload,
  ExternalLink
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LicenseCertificationTrackerPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [holderTypeFilter, setHolderTypeFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [licenseData, setLicenseData] = useState({
    holderName: '',
    holderType: 'contractor',
    licenseType: '',
    licenseNumber: '',
    issuingAuthority: '',
    issueDate: '',
    expirationDate: ''
  });

  const licenses = [
    {
      id: 1,
      holderName: 'ABC Construction',
      holderType: 'contractor',
      licenseType: 'General Contractor License',
      licenseNumber: 'GC-2024-12345',
      issuingAuthority: 'Texas Dept of Licensing',
      issueDate: '2024-01-01',
      expirationDate: '2026-01-01',
      status: 'current',
      daysUntilExpiry: 640
    },
    {
      id: 2,
      holderName: 'Premier Electric',
      holderType: 'contractor',
      licenseType: 'Electrical Contractor License',
      licenseNumber: 'EC-2023-54321',
      issuingAuthority: 'Texas Dept of Licensing',
      issueDate: '2023-06-15',
      expirationDate: '2024-06-15',
      status: 'expiring_soon',
      daysUntilExpiry: 78
    },
    {
      id: 3,
      holderName: 'Smith Plumbing Co',
      holderType: 'contractor',
      licenseType: 'Master Plumber License',
      licenseNumber: 'MP-2022-99887',
      issuingAuthority: 'Texas State Board of Plumbing Examiners',
      issueDate: '2022-03-01',
      expirationDate: '2024-03-01',
      status: 'expired',
      daysUntilExpiry: -28
    },
    {
      id: 4,
      holderName: 'John Williams',
      holderType: 'employee',
      licenseType: 'Real Estate Broker License',
      licenseNumber: 'REB-2023-77665',
      issuingAuthority: 'TREC',
      issueDate: '2023-09-01',
      expirationDate: '2025-09-01',
      status: 'current',
      daysUntilExpiry: 520
    },
    {
      id: 5,
      holderName: 'Sarah Johnson',
      holderType: 'employee',
      licenseType: 'Real Estate Salesperson License',
      licenseNumber: 'RES-2024-11223',
      issuingAuthority: 'TREC',
      issueDate: '2024-02-01',
      expirationDate: '2026-02-01',
      status: 'current',
      daysUntilExpiry: 670
    },
    {
      id: 6,
      holderName: 'Apex Roofing',
      holderType: 'contractor',
      licenseType: 'Roofing Contractor License',
      licenseNumber: 'RC-2023-44556',
      issuingAuthority: 'Texas Dept of Licensing',
      issueDate: '2023-08-15',
      expirationDate: '2024-08-15',
      status: 'expiring_soon',
      daysUntilExpiry: 139
    },
    {
      id: 7,
      holderName: 'Quality HVAC',
      holderType: 'contractor',
      licenseType: 'HVAC Contractor License',
      licenseNumber: 'HVAC-2024-33445',
      issuingAuthority: 'Texas Dept of Licensing',
      issueDate: '2024-01-15',
      expirationDate: '2026-01-15',
      status: 'current',
      daysUntilExpiry: 654
    },
    {
      id: 8,
      holderName: 'Foundation Experts Inc',
      holderType: 'contractor',
      licenseType: 'Structural Engineering Firm License',
      licenseNumber: 'SE-2023-88990',
      issuingAuthority: 'Texas Board of Professional Engineers',
      issueDate: '2023-12-01',
      expirationDate: '2024-12-01',
      status: 'current',
      daysUntilExpiry: 247
    },
    {
      id: 9,
      holderName: 'Michael Chen',
      holderType: 'employee',
      licenseType: 'CPA License',
      licenseNumber: 'CPA-2022-55667',
      issuingAuthority: 'Texas State Board of Public Accountancy',
      issueDate: '2022-05-01',
      expirationDate: '2024-05-01',
      status: 'expiring_soon',
      daysUntilExpiry: 33
    },
    {
      id: 10,
      holderName: 'David Kim',
      holderType: 'employee',
      licenseType: 'Project Management Professional (PMP)',
      licenseNumber: 'PMP-2023-112233',
      issuingAuthority: 'PMI',
      issueDate: '2023-04-15',
      expirationDate: '2026-04-15',
      status: 'current',
      daysUntilExpiry: 744
    }
  ];

  const licenseTypes = [
    'General Contractor License',
    'Electrical Contractor License',
    'Master Plumber License',
    'Roofing Contractor License',
    'HVAC Contractor License',
    'Real Estate Broker License',
    'Real Estate Salesperson License',
    'CPA License',
    'Project Management Professional (PMP)',
    'Structural Engineering Firm License'
  ];

  const filteredLicenses = useMemo(() => {
    return licenses.filter(license => {
      const matchesSearch = !searchQuery ||
        license.holderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        license.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || license.status === statusFilter;
      const matchesType = typeFilter === 'all' || license.licenseType === typeFilter;
      const matchesHolderType = holderTypeFilter === 'all' || license.holderType === holderTypeFilter;
      return matchesSearch && matchesStatus && matchesType && matchesHolderType;
    });
  }, [searchQuery, statusFilter, typeFilter, holderTypeFilter]);

  const stats = useMemo(() => ({
    total: licenses.length,
    current: licenses.filter(l => l.status === 'current').length,
    expiringSoon: licenses.filter(l => l.status === 'expiring_soon').length,
    expired: licenses.filter(l => l.status === 'expired').length,
    contractors: licenses.filter(l => l.holderType === 'contractor').length,
    employees: licenses.filter(l => l.holderType === 'employee').length
  }), []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'current': return 'bg-green-100 text-green-700';
      case 'expiring_soon': return 'bg-yellow-100 text-yellow-700';
      case 'expired': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'current': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'expiring_soon': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'expired': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getHolderIcon = (type) => {
    return type === 'contractor' ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>License & Certification Tracker</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">License & Certification Tracker</h1>
          <p className="text-gray-600 mt-2">Track professional licenses and contractor certifications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Bell className="w-4 h-4 mr-2" />
            Send Reminders
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add License
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Total Licenses</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Current</p>
            <p className="text-2xl font-bold text-green-600">{stats.current}</p>
          </CardContent>
        </Card>
        <Card className={stats.expiringSoon > 0 ? 'border-yellow-300 bg-yellow-50' : ''}>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Expiring Soon</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.expiringSoon}</p>
          </CardContent>
        </Card>
        <Card className={stats.expired > 0 ? 'border-red-300 bg-red-50' : ''}>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Expired</p>
            <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Contractors</p>
            <p className="text-2xl font-bold">{stats.contractors}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Employees</p>
            <p className="text-2xl font-bold">{stats.employees}</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(stats.expired > 0 || stats.expiringSoon > 0) && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-800">License Renewals Needed</h3>
                <p className="text-yellow-700">
                  {stats.expired > 0 && `${stats.expired} license(s) have expired. `}
                  {stats.expiringSoon > 0 && `${stats.expiringSoon} license(s) expiring within 90 days.`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or license number..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={holderTypeFilter} onValueChange={setHolderTypeFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Holder Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Holders</SelectItem>
                <SelectItem value="contractor">Contractors</SelectItem>
                <SelectItem value="employee">Employees</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="current">Current</SelectItem>
                <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="License Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {licenseTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Licenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Licenses & Certifications ({filteredLicenses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Holder</TableHead>
                <TableHead>License Type</TableHead>
                <TableHead>License #</TableHead>
                <TableHead>Issuing Authority</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLicenses.map((license) => (
                <TableRow key={license.id} className={license.status === 'expired' ? 'bg-red-50' : license.status === 'expiring_soon' ? 'bg-yellow-50' : ''}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getHolderIcon(license.holderType)}
                      <div>
                        <p className="font-medium">{license.holderName}</p>
                        <p className="text-xs text-gray-500 capitalize">{license.holderType}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{license.licenseType}</TableCell>
                  <TableCell>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {license.licenseNumber}
                    </code>
                  </TableCell>
                  <TableCell className="text-sm">{license.issuingAuthority}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {license.expirationDate}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(license.status)}>
                      {getStatusIcon(license.status)}
                      <span className="ml-1">
                        {license.status === 'current' && 'Current'}
                        {license.status === 'expiring_soon' && `${license.daysUntilExpiry} days`}
                        {license.status === 'expired' && 'Expired'}
                      </span>
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
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Download Copy
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Verify Online
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
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

      {/* Add License Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add License / Certification</DialogTitle>
            <DialogDescription>Track a new professional license or certification</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Holder Name</Label>
                <Input
                  placeholder="Company or individual name"
                  value={licenseData.holderName}
                  onChange={(e) => setLicenseData({...licenseData, holderName: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Holder Type</Label>
                <Select
                  value={licenseData.holderType}
                  onValueChange={(value) => setLicenseData({...licenseData, holderType: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contractor">Contractor</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>License Type</Label>
              <Select
                value={licenseData.licenseType}
                onValueChange={(value) => setLicenseData({...licenseData, licenseType: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select license type" />
                </SelectTrigger>
                <SelectContent>
                  {licenseTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>License Number</Label>
                <Input
                  placeholder="GC-2024-12345"
                  value={licenseData.licenseNumber}
                  onChange={(e) => setLicenseData({...licenseData, licenseNumber: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Issuing Authority</Label>
                <Input
                  placeholder="State board or agency"
                  value={licenseData.issuingAuthority}
                  onChange={(e) => setLicenseData({...licenseData, issuingAuthority: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Issue Date</Label>
                <Input
                  type="date"
                  value={licenseData.issueDate}
                  onChange={(e) => setLicenseData({...licenseData, issueDate: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Expiration Date</Label>
                <Input
                  type="date"
                  value={licenseData.expirationDate}
                  onChange={(e) => setLicenseData({...licenseData, expirationDate: e.target.value})}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Upload License Copy</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Drag and drop or click to upload</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700">Add License</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LicenseCertificationTrackerPage;
