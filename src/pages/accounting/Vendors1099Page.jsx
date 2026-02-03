// src/pages/accounting/Vendors1099Page.jsx
// 1099 Vendor Tracking and Reporting

import React, { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText, Download, Search, Filter, CheckCircle2, AlertTriangle,
  DollarSign, Users, Calendar, Mail, Phone, Building2, ChevronRight,
  RefreshCw, MoreHorizontal, Eye, Edit, Loader2, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import Generate1099Modal from '@/components/accounting/Generate1099Modal';

// Demo vendors for development
const demoVendors = [
  { id: 'v1', company_name: 'Smith Framing LLC', email: 'ap@smithframing.com', tax_id: '12-3456789', ytd_payments: 85000.00, payment_count: 24, needs_1099: true, has_w9: true, form_type: 'NEC' },
  { id: 'v2', company_name: 'ABC Electric', email: 'billing@abcelectric.com', tax_id: '98-7654321', ytd_payments: 42500.00, payment_count: 15, needs_1099: true, has_w9: true, form_type: 'NEC' },
  { id: 'v3', company_name: 'Pro Plumbing Services', email: 'invoices@proplumbing.com', tax_id: '55-1234567', ytd_payments: 28750.00, payment_count: 12, needs_1099: true, has_w9: true, form_type: 'NEC' },
  { id: 'v4', company_name: 'Concrete Solutions Inc', email: 'ar@concretesolutions.com', tax_id: '33-9876543', ytd_payments: 67200.00, payment_count: 8, needs_1099: true, has_w9: true, form_type: 'NEC' },
  { id: 'v5', company_name: 'HVAC Masters', email: 'billing@hvacmasters.com', tax_id: null, ytd_payments: 15800.00, payment_count: 6, needs_1099: true, has_w9: false, form_type: 'NEC' },
  { id: 'v6', company_name: 'Johnson Drywall', email: 'ap@johnsondrywall.com', tax_id: '77-5555555', ytd_payments: 31400.00, payment_count: 10, needs_1099: true, has_w9: true, form_type: 'NEC' },
  { id: 'v7', company_name: 'Rental Equipment Co', email: 'rentals@equipmentco.com', tax_id: '44-3333333', ytd_payments: 8500.00, payment_count: 4, needs_1099: true, has_w9: true, form_type: 'MISC' },
  { id: 'v8', company_name: 'Small Contractor LLC', email: 'info@smallcontractor.com', tax_id: '11-2222222', ytd_payments: 450.00, payment_count: 2, needs_1099: false, has_w9: true, form_type: 'NEC' },
  { id: 'v9', company_name: 'Local Supplies Inc', email: 'orders@localsupplies.com', tax_id: '22-4444444', ytd_payments: 350.00, payment_count: 3, needs_1099: false, has_w9: true, form_type: 'NEC' },
];

export default function Vendors1099Page() {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const context = useOutletContext();
  const entity = context?.entity;
  const basePath = `/accounting/entities/${entityId}`;

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Fetch 1099 vendors
  const { data: vendors = [], isLoading, refetch } = useQuery({
    queryKey: ['1099-vendors', entityId, selectedYear],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('vendors')
          .select(`
            *,
            bills:bills(amount, bill_date)
          `)
          .eq('entity_id', entityId)
          .eq('is_1099_eligible', true);

        if (error) throw error;

        // Calculate YTD payments for selected year
        return (data || []).map(v => {
          const yearPayments = v.bills?.filter(b => {
            const billYear = new Date(b.bill_date).getFullYear();
            return billYear === parseInt(selectedYear);
          }) || [];

          const ytdPayments = yearPayments.reduce((sum, b) => sum + (b.amount || 0), 0);

          return {
            ...v,
            ytd_payments: ytdPayments,
            payment_count: yearPayments.length,
            needs_1099: ytdPayments >= 600,
            form_type: v.vendor_type === 'rental' ? 'MISC' : 'NEC',
          };
        });
      } catch (err) {
        console.error('Error fetching 1099 vendors:', err);
        return demoVendors;
      }
    },
  });

  // Recalculate totals
  const handleRecalculate = async () => {
    setIsRecalculating(true);
    await refetch();
    setTimeout(() => setIsRecalculating(false), 1000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Filter vendors
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = !searchTerm ||
      vendor.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.tax_id?.includes(searchTerm);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'qualifying' && vendor.needs_1099) ||
      (statusFilter === 'below' && !vendor.needs_1099) ||
      (statusFilter === 'missing_tin' && !vendor.tax_id && vendor.needs_1099) ||
      (statusFilter === 'missing_w9' && !vendor.has_w9 && vendor.needs_1099);

    return matchesSearch && matchesStatus;
  });

  // Calculate summary stats
  const qualifyingVendors = vendors.filter(v => v.needs_1099);
  const totalPayments = qualifyingVendors.reduce((sum, v) => sum + (v.ytd_payments || 0), 0);
  const missingTaxId = qualifyingVendors.filter(v => !v.tax_id).length;
  const missingW9 = qualifyingVendors.filter(v => !v.has_w9).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">1099 Tracking</h1>
          <p className="text-muted-foreground">Track vendor payments for 1099 reporting</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {[currentYear, currentYear - 1, currentYear - 2, currentYear - 3].map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRecalculate} disabled={isRecalculating}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isRecalculating && "animate-spin")} />
            Recalculate
          </Button>
          <Button onClick={() => setShowGenerateModal(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Generate 1099s
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total 1099 Vendors</p>
                <p className="text-2xl font-bold">{vendors.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Marked as 1099 eligible
                </p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Qualifying ({'\u2265'}$600)</p>
                <p className="text-2xl font-bold text-green-600">{qualifyingVendors.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Require 1099 filing
                </p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total YTD Payments</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPayments)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  For {selectedYear}
                </p>
              </div>
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Missing Information</p>
                <p className="text-2xl font-bold text-red-600">{missingTaxId + missingW9}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {missingTaxId} TIN, {missingW9} W-9
                </p>
              </div>
              <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert for missing information */}
      {(missingTaxId > 0 || missingW9 > 0) && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-amber-800">Action Required</p>
            <p className="text-sm text-amber-700">
              {missingTaxId > 0 && `${missingTaxId} vendor(s) are missing Tax ID/TIN. `}
              {missingW9 > 0 && `${missingW9} vendor(s) are missing W-9 on file.`}
              {' '}These must be resolved before generating 1099s.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-amber-300 text-amber-700"
            onClick={() => setStatusFilter('missing_tin')}
          >
            View Missing
          </Button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vendors</SelectItem>
            <SelectItem value="qualifying">Qualifying ({'\u2265'}$600)</SelectItem>
            <SelectItem value="below">Below Threshold</SelectItem>
            <SelectItem value="missing_tin">Missing Tax ID</SelectItem>
            <SelectItem value="missing_w9">Missing W-9</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vendors Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Vendor</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Tax ID</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Form</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">YTD Payments</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground"># Payments</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">1099 Status</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{vendor.company_name}</p>
                        <p className="text-sm text-muted-foreground">{vendor.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {vendor.tax_id ? (
                      <span className="font-mono text-sm">{vendor.tax_id}</span>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Missing
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="outline">{vendor.form_type}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(vendor.ytd_payments)}
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    {vendor.payment_count}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {vendor.needs_1099 ? (
                      vendor.tax_id && vendor.has_w9 ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Ready
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Incomplete
                        </Badge>
                      )
                    ) : (
                      <Badge className="bg-gray-100 text-gray-600">
                        Below $600
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`${basePath}/vendors/${vendor.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Vendor
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`${basePath}/vendors/${vendor.id}/edit`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Vendor
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate(`${basePath}/vendors/${vendor.id}/payments`)}>
                          <DollarSign className="h-4 w-4 mr-2" />
                          View Payments
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {filteredVendors.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="font-medium">No vendors found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Generate 1099 Modal */}
      <Generate1099Modal
        open={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        entityId={entityId}
        taxYear={parseInt(selectedYear)}
      />
    </div>
  );
}
