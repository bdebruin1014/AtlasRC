import React, { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Plus, Search, Upload, Download, Users, DollarSign, Clock,
  MoreHorizontal, Eye, Edit2, Mail, Phone, Building2, FileText,
  AlertTriangle, CheckCircle, Wrench, Truck, Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import VendorFormModal from '@/components/accounting/VendorFormModal';
import ImportVendorsModal from '@/components/accounting/ImportVendorsModal';

// Demo vendors for fallback
const demoVendors = [
  {
    id: 'vendor-1',
    vendor_type: 'subcontractor',
    company_name: 'Smith Framing LLC',
    display_name: 'Smith Framing LLC',
    contact_first_name: 'John',
    contact_last_name: 'Smith',
    email: 'john@smithframing.com',
    phone: '(555) 123-4567',
    city: 'Denver',
    state: 'CO',
    total_billed: 245000,
    balance_due: 47500,
    is_1099: true,
    w9_on_file: true,
    status: 'active',
  },
  {
    id: 'vendor-2',
    vendor_type: 'subcontractor',
    company_name: 'ABC Plumbing',
    display_name: 'ABC Plumbing',
    contact_first_name: 'Mike',
    contact_last_name: 'Johnson',
    email: 'mike@abcplumbing.com',
    phone: '(555) 234-5678',
    city: 'Boulder',
    state: 'CO',
    total_billed: 89000,
    balance_due: 32100,
    is_1099: true,
    w9_on_file: true,
    status: 'active',
  },
  {
    id: 'vendor-3',
    vendor_type: 'subcontractor',
    company_name: 'Sparks Electric',
    display_name: 'Sparks Electric',
    contact_first_name: 'Tom',
    contact_last_name: 'Wilson',
    email: 'tom@sparkselectric.com',
    phone: '(555) 345-6789',
    city: 'Denver',
    state: 'CO',
    total_billed: 156000,
    balance_due: 0,
    is_1099: true,
    w9_on_file: true,
    status: 'active',
  },
  {
    id: 'vendor-4',
    vendor_type: 'supplier',
    company_name: 'Ready Mix Concrete',
    display_name: 'Ready Mix Concrete',
    contact_first_name: 'Steve',
    contact_last_name: 'Brown',
    email: 'orders@readymix.com',
    phone: '(555) 456-7890',
    city: 'Aurora',
    state: 'CO',
    total_billed: 65000,
    balance_due: 22225,
    is_1099: false,
    w9_on_file: true,
    status: 'overdue',
  },
  {
    id: 'vendor-5',
    vendor_type: 'subcontractor',
    company_name: 'Cool Air HVAC',
    display_name: 'Cool Air HVAC',
    contact_first_name: 'Dave',
    contact_last_name: 'Miller',
    email: 'dave@coolairhvac.com',
    phone: '(555) 567-8901',
    city: 'Lakewood',
    state: 'CO',
    total_billed: 78000,
    balance_due: 34500,
    is_1099: true,
    w9_on_file: false,
    status: 'active',
  },
  {
    id: 'vendor-6',
    vendor_type: 'utility',
    company_name: 'City Power & Light',
    display_name: 'City Power & Light',
    contact_first_name: null,
    contact_last_name: null,
    email: 'billing@citypower.com',
    phone: '(555) 678-9012',
    city: 'Denver',
    state: 'CO',
    total_billed: 12500,
    balance_due: 850,
    is_1099: false,
    w9_on_file: false,
    status: 'active',
  },
];

const VENDOR_TYPE_CONFIG = {
  subcontractor: { label: 'Subcontractor', icon: Wrench, color: 'bg-blue-100 text-blue-700' },
  supplier: { label: 'Supplier', icon: Truck, color: 'bg-purple-100 text-purple-700' },
  service: { label: 'Service', icon: Briefcase, color: 'bg-green-100 text-green-700' },
  utility: { label: 'Utility', icon: Building2, color: 'bg-amber-100 text-amber-700' },
  consultant: { label: 'Consultant', icon: Users, color: 'bg-cyan-100 text-cyan-700' },
  other: { label: 'Other', icon: Building2, color: 'bg-gray-100 text-gray-700' },
};

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

const fetchVendors = async (entityId) => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('entity_id', entityId)
      .order('display_name');

    if (data && !error) return data;
  } catch (err) {
    console.error('Error fetching vendors:', err);
  }
  return demoVendors;
};

export default function VendorsPage() {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const context = useOutletContext();
  const entity = context?.entity;

  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const basePath = `/accounting/entities/${entityId}`;

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['vendors', entityId],
    queryFn: () => fetchVendors(entityId),
    enabled: !!entityId,
  });

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = !searchTerm ||
      vendor.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || vendor.vendor_type === filterType;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: vendors.length,
    active: vendors.filter(v => v.status === 'active').length,
    totalPayable: vendors.reduce((sum, v) => sum + (v.balance_due || 0), 0),
    missing1099: vendors.filter(v => v.is_1099 && !v.w9_on_file).length,
  };

  const handleExport = () => {
    const headers = ['Display Name', 'Type', 'Email', 'Phone', 'City', 'State', 'Total Billed', 'Balance Due', '1099', 'W9'];
    const rows = filteredVendors.map(v => [
      v.display_name,
      v.vendor_type,
      v.email,
      v.phone,
      v.city,
      v.state,
      v.total_billed,
      v.balance_due,
      v.is_1099 ? 'Yes' : 'No',
      v.w9_on_file ? 'Yes' : 'No',
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendors-${entityId}.csv`;
    a.click();
  };

  const handleEditVendor = (vendor) => {
    setEditingVendor(vendor);
    setShowVendorModal(true);
  };

  const handleCloseModal = () => {
    setShowVendorModal(false);
    setEditingVendor(null);
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Vendors</h1>
          <p className="text-muted-foreground">
            Manage vendor accounts for {entity?.name || entity?.short_name || 'this entity'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => setShowImportModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => setShowVendorModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Vendor
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Vendors</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Payable</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalPayable)}</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={stats.missing1099 > 0 ? 'border-red-200' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Missing W-9</p>
                <p className={cn("text-2xl font-bold", stats.missing1099 > 0 ? "text-red-600" : "")}>{stats.missing1099}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="border rounded-md px-3 py-2 text-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="subcontractor">Subcontractor</option>
              <option value="supplier">Supplier</option>
              <option value="service">Service</option>
              <option value="utility">Utility</option>
              <option value="consultant">Consultant</option>
              <option value="other">Other</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Vendors Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Vendor</th>
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-left px-4 py-3 font-medium">Contact</th>
                  <th className="text-left px-4 py-3 font-medium">Location</th>
                  <th className="text-right px-4 py-3 font-medium">Total Billed</th>
                  <th className="text-right px-4 py-3 font-medium">Balance Due</th>
                  <th className="text-center px-4 py-3 font-medium">1099/W9</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No vendors found</p>
                      <p className="text-sm">Add a new vendor to get started</p>
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((vendor) => {
                    const typeConfig = VENDOR_TYPE_CONFIG[vendor.vendor_type] || VENDOR_TYPE_CONFIG.other;
                    const TypeIcon = typeConfig.icon;

                    return (
                      <tr
                        key={vendor.id}
                        className={cn(
                          "hover:bg-muted/50",
                          vendor.status === 'overdue' && "bg-red-50"
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg", typeConfig.color.split(' ')[0])}>
                              <TypeIcon className={cn("h-4 w-4", typeConfig.color.split(' ')[1])} />
                            </div>
                            <div>
                              <p className="font-medium">{vendor.display_name}</p>
                              {vendor.contact_first_name && (
                                <p className="text-xs text-muted-foreground">
                                  {vendor.contact_first_name} {vendor.contact_last_name}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={typeConfig.color}>
                            {typeConfig.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            {vendor.email && (
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="w-3 h-3 text-muted-foreground" />
                                <span className="truncate max-w-[180px]">{vendor.email}</span>
                              </div>
                            )}
                            {vendor.phone && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                {vendor.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {vendor.city && vendor.state
                            ? `${vendor.city}, ${vendor.state}`
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(vendor.total_billed)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={cn(
                            "font-medium",
                            vendor.balance_due > 0 ? "text-amber-600" : "text-green-600"
                          )}>
                            {formatCurrency(vendor.balance_due)}
                          </span>
                          {vendor.status === 'overdue' && (
                            <p className="text-xs text-red-600">Overdue</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {vendor.is_1099 && (
                              <Badge variant="outline" className="text-xs">1099</Badge>
                            )}
                            {vendor.w9_on_file ? (
                              <CheckCircle className="w-4 h-4 text-green-500" title="W-9 on file" />
                            ) : vendor.is_1099 ? (
                              <AlertTriangle className="w-4 h-4 text-red-500" title="Missing W-9" />
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`${basePath}/vendors/${vendor.id}`)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditVendor(vendor)}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => navigate(`${basePath}/bills/new?vendor=${vendor.id}`)}>
                                <FileText className="w-4 h-4 mr-2" />
                                Create Bill
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="w-4 h-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Vendor Form Modal */}
      <VendorFormModal
        open={showVendorModal}
        onClose={handleCloseModal}
        entityId={entityId}
        vendor={editingVendor}
      />

      {/* Import Vendors Modal */}
      <ImportVendorsModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        entityId={entityId}
      />
    </div>
  );
}
