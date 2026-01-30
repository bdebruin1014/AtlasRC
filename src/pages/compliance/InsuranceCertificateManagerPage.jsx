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
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  FileText,
  Upload,
  Download,
  Mail,
  Bell,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  Building2,
  User
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const InsuranceCertificateManagerPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [certData, setCertData] = useState({
    vendorName: '',
    vendorType: '',
    insuranceType: '',
    carrier: '',
    policyNumber: '',
    coverageAmount: '',
    effectiveDate: '',
    expirationDate: '',
    additionalInsured: true
  });

  const certificates = [
    {
      id: 1,
      vendorName: 'ABC Construction',
      vendorType: 'General Contractor',
      insuranceType: 'General Liability',
      carrier: 'State Farm',
      policyNumber: 'GL-2024-001234',
      coverageAmount: 2000000,
      effectiveDate: '2024-01-01',
      expirationDate: '2025-01-01',
      status: 'current',
      additionalInsured: true,
      lastVerified: '2024-03-01',
      daysUntilExpiry: 278
    },
    {
      id: 2,
      vendorName: 'ABC Construction',
      vendorType: 'General Contractor',
      insuranceType: 'Workers Comp',
      carrier: 'Texas Mutual',
      policyNumber: 'WC-2024-005678',
      coverageAmount: 1000000,
      effectiveDate: '2024-01-01',
      expirationDate: '2025-01-01',
      status: 'current',
      additionalInsured: false,
      lastVerified: '2024-03-01',
      daysUntilExpiry: 278
    },
    {
      id: 3,
      vendorName: 'Premier Electric',
      vendorType: 'Subcontractor',
      insuranceType: 'General Liability',
      carrier: 'Liberty Mutual',
      policyNumber: 'GL-2023-009876',
      coverageAmount: 1000000,
      effectiveDate: '2023-06-15',
      expirationDate: '2024-06-15',
      status: 'expiring_soon',
      additionalInsured: true,
      lastVerified: '2024-02-15',
      daysUntilExpiry: 78
    },
    {
      id: 4,
      vendorName: 'Smith Plumbing Co',
      vendorType: 'Subcontractor',
      insuranceType: 'General Liability',
      carrier: 'Travelers',
      policyNumber: 'GL-2023-112233',
      coverageAmount: 1000000,
      effectiveDate: '2023-03-01',
      expirationDate: '2024-03-01',
      status: 'expired',
      additionalInsured: true,
      lastVerified: '2024-01-15',
      daysUntilExpiry: -28
    },
    {
      id: 5,
      vendorName: 'Smith Plumbing Co',
      vendorType: 'Subcontractor',
      insuranceType: 'Auto Liability',
      carrier: 'GEICO',
      policyNumber: 'AL-2024-445566',
      coverageAmount: 500000,
      effectiveDate: '2024-02-01',
      expirationDate: '2025-02-01',
      status: 'current',
      additionalInsured: false,
      lastVerified: '2024-02-15',
      daysUntilExpiry: 308
    },
    {
      id: 6,
      vendorName: 'Apex Roofing',
      vendorType: 'Subcontractor',
      insuranceType: 'General Liability',
      carrier: 'Hartford',
      policyNumber: 'GL-2024-778899',
      coverageAmount: 2000000,
      effectiveDate: '2024-02-15',
      expirationDate: '2025-02-15',
      status: 'current',
      additionalInsured: true,
      lastVerified: '2024-02-20',
      daysUntilExpiry: 322
    },
    {
      id: 7,
      vendorName: 'Quality HVAC',
      vendorType: 'Subcontractor',
      insuranceType: 'General Liability',
      carrier: 'Nationwide',
      policyNumber: 'GL-2024-334455',
      coverageAmount: 1000000,
      effectiveDate: '2024-01-15',
      expirationDate: '2024-04-15',
      status: 'expiring_soon',
      additionalInsured: true,
      lastVerified: '2024-02-01',
      daysUntilExpiry: 17
    },
    {
      id: 8,
      vendorName: 'Foundation Experts Inc',
      vendorType: 'Subcontractor',
      insuranceType: 'Professional Liability',
      carrier: 'CNA',
      policyNumber: 'PL-2024-667788',
      coverageAmount: 5000000,
      effectiveDate: '2024-03-01',
      expirationDate: '2025-03-01',
      status: 'current',
      additionalInsured: true,
      lastVerified: '2024-03-05',
      daysUntilExpiry: 336
    }
  ];

  const insuranceTypes = ['General Liability', 'Workers Comp', 'Auto Liability', 'Professional Liability', 'Umbrella'];
  const vendorTypes = ['General Contractor', 'Subcontractor', 'Supplier', 'Consultant'];

  const filteredCertificates = useMemo(() => {
    return certificates.filter(cert => {
      const matchesSearch = !searchQuery ||
        cert.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.policyNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
      const matchesType = typeFilter === 'all' || cert.insuranceType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [searchQuery, statusFilter, typeFilter]);

  const stats = useMemo(() => ({
    total: certificates.length,
    current: certificates.filter(c => c.status === 'current').length,
    expiringSoon: certificates.filter(c => c.status === 'expiring_soon').length,
    expired: certificates.filter(c => c.status === 'expired').length,
    uniqueVendors: [...new Set(certificates.map(c => c.vendorName))].length
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

  const groupedByVendor = useMemo(() => {
    const grouped = {};
    filteredCertificates.forEach(cert => {
      if (!grouped[cert.vendorName]) {
        grouped[cert.vendorName] = {
          vendorName: cert.vendorName,
          vendorType: cert.vendorType,
          certificates: []
        };
      }
      grouped[cert.vendorName].certificates.push(cert);
    });
    return Object.values(grouped);
  }, [filteredCertificates]);

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Insurance Certificate Manager</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Insurance Certificate Manager</h1>
          <p className="text-gray-600 mt-2">Track COIs for vendors, contractors, and properties</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Bell className="w-4 h-4 mr-2" />
            Send Reminders
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Certificate
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Total Certificates</p>
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
            <p className="text-sm text-gray-500">Vendors Tracked</p>
            <p className="text-2xl font-bold">{stats.uniqueVendors}</p>
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
                <h3 className="font-semibold text-yellow-800">Action Required</h3>
                <p className="text-yellow-700">
                  {stats.expired > 0 && `${stats.expired} certificate(s) have expired. `}
                  {stats.expiringSoon > 0 && `${stats.expiringSoon} certificate(s) expiring within 90 days.`}
                </p>
              </div>
              <Button variant="outline" className="ml-auto">
                <Mail className="w-4 h-4 mr-2" />
                Request Updates
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search vendors or policy numbers..."
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
                <SelectItem value="current">Current</SelectItem>
                <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Insurance Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {insuranceTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Certificates by Vendor */}
      <div className="space-y-4">
        {groupedByVendor.map((vendor) => (
          <Card key={vendor.vendorName}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{vendor.vendorName}</CardTitle>
                    <CardDescription>{vendor.vendorType}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {vendor.certificates.some(c => c.status === 'expired') && (
                    <Badge className="bg-red-100 text-red-700">Has Expired</Badge>
                  )}
                  {vendor.certificates.some(c => c.status === 'expiring_soon') && (
                    <Badge className="bg-yellow-100 text-yellow-700">Expiring Soon</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Carrier</TableHead>
                    <TableHead>Policy #</TableHead>
                    <TableHead>Coverage</TableHead>
                    <TableHead>Expiration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Add&apos;l Insured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendor.certificates.map((cert) => (
                    <TableRow key={cert.id} className={cert.status === 'expired' ? 'bg-red-50' : cert.status === 'expiring_soon' ? 'bg-yellow-50' : ''}>
                      <TableCell className="font-medium">{cert.insuranceType}</TableCell>
                      <TableCell>{cert.carrier}</TableCell>
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {cert.policyNumber}
                        </code>
                      </TableCell>
                      <TableCell>${cert.coverageAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {cert.expirationDate}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(cert.status)}>
                          {getStatusIcon(cert.status)}
                          <span className="ml-1">
                            {cert.status === 'current' && 'Current'}
                            {cert.status === 'expiring_soon' && `${cert.daysUntilExpiry} days`}
                            {cert.status === 'expired' && 'Expired'}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {cert.additionalInsured ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
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
                              View Certificate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Request Update
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
        ))}
      </div>

      {/* Add Certificate Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Insurance Certificate</DialogTitle>
            <DialogDescription>Track a new COI for a vendor or contractor</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Vendor Name</Label>
                <Input
                  placeholder="ABC Construction"
                  value={certData.vendorName}
                  onChange={(e) => setCertData({...certData, vendorName: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Vendor Type</Label>
                <Select
                  value={certData.vendorType}
                  onValueChange={(value) => setCertData({...certData, vendorType: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendorTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Insurance Type</Label>
                <Select
                  value={certData.insuranceType}
                  onValueChange={(value) => setCertData({...certData, insuranceType: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {insuranceTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Carrier</Label>
                <Input
                  placeholder="State Farm"
                  value={certData.carrier}
                  onChange={(e) => setCertData({...certData, carrier: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Policy Number</Label>
                <Input
                  placeholder="GL-2024-001234"
                  value={certData.policyNumber}
                  onChange={(e) => setCertData({...certData, policyNumber: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Coverage Amount</Label>
                <Input
                  type="number"
                  placeholder="1000000"
                  value={certData.coverageAmount}
                  onChange={(e) => setCertData({...certData, coverageAmount: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Effective Date</Label>
                <Input
                  type="date"
                  value={certData.effectiveDate}
                  onChange={(e) => setCertData({...certData, effectiveDate: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Expiration Date</Label>
                <Input
                  type="date"
                  value={certData.expirationDate}
                  onChange={(e) => setCertData({...certData, expirationDate: e.target.value})}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Upload Certificate</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Drag and drop or click to upload</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700">Add Certificate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InsuranceCertificateManagerPage;
