import React, { useState } from 'react';
import { Download, Filter, Search, ChevronDown, ChevronRight, Building2, Calendar, AlertTriangle, Clock, DollarSign, FileText, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const APAgingReportPage = () => {
  const [expandedVendors, setExpandedVendors] = useState(['v-1']);
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [groupBy, setGroupBy] = useState('vendor');
  const [searchTerm, setSearchTerm] = useState('');

  const agingSummary = {
    current: 485000,
    days1to30: 325000,
    days31to60: 142000,
    days61to90: 78500,
    over90: 45200,
    total: 1075700,
  };

  const vendors = [
    {
      id: 'v-1',
      name: 'Smith Construction Co.',
      contact: 'John Smith',
      phone: '(555) 123-4567',
      email: 'john@smithconstruction.com',
      current: 125000,
      days1to30: 85000,
      days31to60: 45000,
      days61to90: 0,
      over90: 0,
      total: 255000,
      invoices: [
        { id: 'inv-1', number: 'SC-2024-156', date: '2024-12-15', dueDate: '2024-12-30', amount: 125000, status: 'current', description: 'Draw #6 - Foundation Work' },
        { id: 'inv-2', number: 'SC-2024-142', date: '2024-11-28', dueDate: '2024-12-15', amount: 85000, status: '1-30', description: 'Draw #5 - Framing' },
        { id: 'inv-3', number: 'SC-2024-128', date: '2024-10-20', dueDate: '2024-11-05', amount: 45000, status: '31-60', description: 'Draw #4 - Site Prep' },
      ],
    },
    {
      id: 'v-2',
      name: 'Ferguson Supply',
      contact: 'Sarah Ferguson',
      phone: '(555) 234-5678',
      email: 'sarah@fergusonsupply.com',
      current: 78500,
      days1to30: 45000,
      days31to60: 22000,
      days61to90: 15500,
      over90: 0,
      total: 161000,
      invoices: [
        { id: 'inv-4', number: 'FS-89234', date: '2024-12-10', dueDate: '2024-12-25', amount: 78500, status: 'current', description: 'Plumbing Materials - Phase 2' },
        { id: 'inv-5', number: 'FS-88901', date: '2024-11-25', dueDate: '2024-12-10', amount: 45000, status: '1-30', description: 'Electrical Supplies' },
        { id: 'inv-6', number: 'FS-88567', date: '2024-10-28', dueDate: '2024-11-12', amount: 22000, status: '31-60', description: 'HVAC Equipment' },
        { id: 'inv-7', number: 'FS-88123', date: '2024-09-15', dueDate: '2024-09-30', amount: 15500, status: '61-90', description: 'Foundation Materials' },
      ],
    },
    {
      id: 'v-3',
      name: 'Elite Electric Inc.',
      contact: 'Mike Johnson',
      phone: '(555) 345-6789',
      email: 'mike@eliteelectric.com',
      current: 92000,
      days1to30: 68000,
      days31to60: 0,
      days61to90: 28000,
      over90: 12500,
      total: 200500,
      invoices: [
        { id: 'inv-8', number: 'EE-4521', date: '2024-12-18', dueDate: '2025-01-02', amount: 92000, status: 'current', description: 'Main Panel Installation' },
        { id: 'inv-9', number: 'EE-4498', date: '2024-11-20', dueDate: '2024-12-05', amount: 68000, status: '1-30', description: 'Rough-in Electrical' },
        { id: 'inv-10', number: 'EE-4412', date: '2024-09-25', dueDate: '2024-10-10', amount: 28000, status: '61-90', description: 'Temporary Power' },
        { id: 'inv-11', number: 'EE-4356', date: '2024-08-10', dueDate: '2024-08-25', amount: 12500, status: 'over90', description: 'Initial Site Assessment' },
      ],
    },
    {
      id: 'v-4',
      name: 'Precision Plumbing',
      contact: 'Dave Wilson',
      phone: '(555) 456-7890',
      email: 'dave@precisionplumbing.com',
      current: 65000,
      days1to30: 48000,
      days31to60: 35000,
      days61to90: 18000,
      over90: 22700,
      total: 188700,
      invoices: [
        { id: 'inv-12', number: 'PP-7823', date: '2024-12-12', dueDate: '2024-12-27', amount: 65000, status: 'current', description: 'Second Floor Plumbing' },
        { id: 'inv-13', number: 'PP-7801', date: '2024-11-22', dueDate: '2024-12-07', amount: 48000, status: '1-30', description: 'First Floor Plumbing' },
        { id: 'inv-14', number: 'PP-7756', date: '2024-10-18', dueDate: '2024-11-02', amount: 35000, status: '31-60', description: 'Underground Plumbing' },
        { id: 'inv-15', number: 'PP-7698', date: '2024-09-08', dueDate: '2024-09-23', amount: 18000, status: '61-90', description: 'Sewer Connection' },
        { id: 'inv-16', number: 'PP-7642', date: '2024-07-25', dueDate: '2024-08-09', amount: 22700, status: 'over90', description: 'Initial Consultation' },
      ],
    },
  ];

  const toggleVendor = (vendorId) => {
    setExpandedVendors(prev =>
      prev.includes(vendorId) ? prev.filter(id => id !== vendorId) : [...prev, vendorId]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'current': return 'bg-green-100 text-green-700';
      case '1-30': return 'bg-blue-100 text-blue-700';
      case '31-60': return 'bg-yellow-100 text-yellow-700';
      case '61-90': return 'bg-orange-100 text-orange-700';
      case 'over90': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredVendors = vendors.filter(v =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Accounts Payable Aging Report</h1>
            <p className="text-sm text-gray-500">As of December 28, 2024</p>
          </div>
          <div className="flex gap-2">
            <select className="border rounded-md px-3 py-1.5 text-sm" value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
              <option value="vendor">Group by Vendor</option>
              <option value="project">Group by Project</option>
              <option value="entity">Group by Entity</option>
            </select>
            <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-1" />Filter</Button>
            <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-6 gap-4">
          <div className="bg-green-50 rounded-lg p-3 text-center cursor-pointer hover:bg-green-100 transition-colors" onClick={() => setSelectedPeriod('current')}>
            <p className="text-xs text-gray-500 mb-1">Current</p>
            <p className="text-lg font-bold text-green-700">${(agingSummary.current / 1000).toFixed(0)}K</p>
            <p className="text-xs text-green-600">{((agingSummary.current / agingSummary.total) * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => setSelectedPeriod('1-30')}>
            <p className="text-xs text-gray-500 mb-1">1-30 Days</p>
            <p className="text-lg font-bold text-blue-700">${(agingSummary.days1to30 / 1000).toFixed(0)}K</p>
            <p className="text-xs text-blue-600">{((agingSummary.days1to30 / agingSummary.total) * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 text-center cursor-pointer hover:bg-yellow-100 transition-colors" onClick={() => setSelectedPeriod('31-60')}>
            <p className="text-xs text-gray-500 mb-1">31-60 Days</p>
            <p className="text-lg font-bold text-yellow-700">${(agingSummary.days31to60 / 1000).toFixed(0)}K</p>
            <p className="text-xs text-yellow-600">{((agingSummary.days31to60 / agingSummary.total) * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center cursor-pointer hover:bg-orange-100 transition-colors" onClick={() => setSelectedPeriod('61-90')}>
            <p className="text-xs text-gray-500 mb-1">61-90 Days</p>
            <p className="text-lg font-bold text-orange-700">${(agingSummary.days61to90 / 1000).toFixed(0)}K</p>
            <p className="text-xs text-orange-600">{((agingSummary.days61to90 / agingSummary.total) * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center cursor-pointer hover:bg-red-100 transition-colors" onClick={() => setSelectedPeriod('over90')}>
            <p className="text-xs text-gray-500 mb-1">Over 90 Days</p>
            <p className="text-lg font-bold text-red-700">${(agingSummary.over90 / 1000).toFixed(0)}K</p>
            <p className="text-xs text-red-600">{((agingSummary.over90 / agingSummary.total) * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-gray-100 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">Total Payable</p>
            <p className="text-lg font-bold text-gray-800">${(agingSummary.total / 1000).toFixed(0)}K</p>
            <p className="text-xs text-gray-600">{vendors.length} vendors</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b px-4 py-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search vendors..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Vendors List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {filteredVendors.map((vendor) => (
            <div key={vendor.id} className="bg-white border rounded-lg overflow-hidden">
              {/* Vendor Header */}
              <div
                onClick={() => toggleVendor(vendor.id)}
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {expandedVendors.includes(vendor.id) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold">{vendor.name}</span>
                      {(vendor.days61to90 > 0 || vendor.over90 > 0) && (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{vendor.phone}</span>
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{vendor.email}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-6 gap-4 text-right text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Current</p>
                      <p className={vendor.current > 0 ? "font-medium text-green-600" : "text-gray-400"}>
                        ${vendor.current.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">1-30</p>
                      <p className={vendor.days1to30 > 0 ? "font-medium text-blue-600" : "text-gray-400"}>
                        ${vendor.days1to30.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">31-60</p>
                      <p className={vendor.days31to60 > 0 ? "font-medium text-yellow-600" : "text-gray-400"}>
                        ${vendor.days31to60.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">61-90</p>
                      <p className={vendor.days61to90 > 0 ? "font-medium text-orange-600" : "text-gray-400"}>
                        ${vendor.days61to90.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">90+</p>
                      <p className={vendor.over90 > 0 ? "font-medium text-red-600" : "text-gray-400"}>
                        ${vendor.over90.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Total</p>
                      <p className="font-bold">${vendor.total.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoices */}
              {expandedVendors.includes(vendor.id) && (
                <div className="border-t bg-gray-50">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">Invoice #</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">Description</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">Invoice Date</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">Due Date</th>
                        <th className="text-center px-4 py-2 font-medium text-gray-600">Status</th>
                        <th className="text-right px-4 py-2 font-medium text-gray-600">Amount</th>
                        <th className="text-right px-4 py-2 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {vendor.invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-white">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{invoice.number}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{invoice.description}</td>
                          <td className="px-4 py-3 text-gray-500">{invoice.date}</td>
                          <td className="px-4 py-3 text-gray-500">{invoice.dueDate}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={cn("px-2 py-1 rounded text-xs font-medium", getStatusColor(invoice.status))}>
                              {invoice.status === 'current' ? 'Current' :
                                invoice.status === '1-30' ? '1-30 Days' :
                                  invoice.status === '31-60' ? '31-60 Days' :
                                    invoice.status === '61-90' ? '61-90 Days' : '90+ Days'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">${invoice.amount.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right">
                            <Button variant="outline" size="sm">Pay</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default APAgingReportPage;
