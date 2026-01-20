// src/pages/accounting/Vendors1099Page.jsx
// 1099 Vendor Tracking and Reporting

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText, Download, Search, Filter, CheckCircle2, AlertTriangle,
  DollarSign, Users, Calendar, Mail, Phone, Building2, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  get1099Vendors,
  generate1099Report,
  export1099Data,
} from '@/services/accountingEnhancedService';

const Vendors1099Page = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [showExportModal, setShowExportModal] = useState(false);
  const [report, setReport] = useState(null);

  useEffect(() => {
    loadVendors();
  }, [entityId, year]);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const data = await get1099Vendors(entityId, year);
      setVendors(data || []);
    } catch (error) {
      console.error('Error loading 1099 vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const reportData = await generate1099Report(entityId, year);
      setReport(reportData);
      setShowExportModal(true);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const handleExport = async (format) => {
    try {
      const data = await export1099Data(entityId, year, format);
      
      if (format === 'csv') {
        const blob = new Blob([data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `1099_vendors_${year}.csv`;
        a.click();
      }
      
      setShowExportModal(false);
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const qualifyingVendors = vendors.filter(v => v.needs_1099);
  const totalPayments = qualifyingVendors.reduce((sum, v) => sum + v.ytd_payments, 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-600" />
            1099 Vendor Tracking
          </h1>
          <p className="text-gray-500 mt-1">Track vendor payments for 1099 reporting</p>
        </div>
        <div className="flex gap-2">
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[2025, 2024, 2023, 2022].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <Button onClick={handleGenerateReport}>
            <Download className="w-4 h-4 mr-2" />
            Generate 1099 Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total 1099 Vendors</p>
                <p className="text-2xl font-bold">{vendors.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Qualifying (≥$600)</p>
                <p className="text-2xl font-bold text-green-600">{qualifyingVendors.length}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total YTD Payments</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPayments)}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Missing Tax ID</p>
                <p className="text-2xl font-bold text-red-600">
                  {qualifyingVendors.filter(v => !v.tax_id).length}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search vendors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Vendors Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Vendor</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Tax ID</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">YTD Payments</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-600"># Payments</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">1099 Status</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{vendor.company_name || vendor.name}</p>
                        <p className="text-sm text-gray-500">{vendor.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {vendor.tax_id ? (
                      <span className="font-mono text-sm">{vendor.tax_id}</span>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">Missing</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(vendor.ytd_payments)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {vendor.payment_count}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {vendor.needs_1099 ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Required
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-600">
                        Below Threshold
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/accounting/${entityId}/vendors/${vendor.id}`)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredVendors.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No 1099 vendors found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Export Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>1099 Report - {year}</DialogTitle>
          </DialogHeader>
          
          {report && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Qualifying Vendors</p>
                  <p className="text-xl font-bold">{report.qualifying_vendors}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Total Payments</p>
                  <p className="text-xl font-bold">{formatCurrency(report.total_payments)}</p>
                </div>
              </div>
              
              <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                {report.vendors.map((v, i) => (
                  <div key={i} className="p-3 flex justify-between">
                    <div>
                      <p className="font-medium">{v.vendor_name}</p>
                      <p className="text-sm text-gray-500">{v.tax_id || 'No Tax ID'}</p>
                    </div>
                    <p className="font-medium">{formatCurrency(v.total_paid)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowExportModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleExport('csv')}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Vendors1099Page;
