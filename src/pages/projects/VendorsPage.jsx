import React, { useState } from 'react';
import { Plus, Search, Eye, Edit2, X, Mail, Phone, Building2, User, MapPin, Download, FileText, DollarSign, Star, StarOff, CheckCircle, Clock, AlertTriangle, Briefcase, Wrench, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const VendorsPage = ({ projectId }) => {
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [filterTrade, setFilterTrade] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('vendors'); // 'vendors', 'contracts', 'payments'

  const [vendors, setVendors] = useState([
    {
      id: 'VEN-001',
      name: 'Johnson Construction',
      contactName: 'Mike Johnson',
      email: 'mike@johnsonconstruction.com',
      phone: '(555) 234-5678',
      address: '456 Builder Ln, Greenville, SC 29601',
      trade: 'General Contractor',
      contractAmount: 3965000,
      paidToDate: 2850000,
      retainage: 142500,
      status: 'active',
      insuranceExpiry: '2025-06-30',
      licenseNumber: 'SC-GC-12345',
      rating: 5,
      preferred: true,
      w9OnFile: true,
      coiOnFile: true,
      notes: 'Primary GC for all VanRock projects. Excellent track record.',
    },
    {
      id: 'VEN-002',
      name: 'Sparks Electric',
      contactName: 'Tom Wilson',
      email: 'tom@sparkselectric.com',
      phone: '(555) 333-4444',
      address: '789 Volt Ave, Greenville, SC 29602',
      trade: 'Electrical',
      contractAmount: 204000,
      paidToDate: 156000,
      retainage: 7800,
      status: 'active',
      insuranceExpiry: '2025-04-15',
      licenseNumber: 'SC-EC-67890',
      rating: 4,
      preferred: true,
      w9OnFile: true,
      coiOnFile: true,
      notes: '',
    },
    {
      id: 'VEN-003',
      name: 'ABC Plumbing',
      contactName: 'Carlos Garcia',
      email: 'carlos@abcplumbing.com',
      phone: '(555) 555-6666',
      address: '321 Pipe St, Greenville, SC 29603',
      trade: 'Plumbing',
      contractAmount: 192000,
      paidToDate: 145000,
      retainage: 7250,
      status: 'active',
      insuranceExpiry: '2025-03-20',
      licenseNumber: 'SC-PL-11111',
      rating: 4,
      preferred: false,
      w9OnFile: true,
      coiOnFile: true,
      notes: '',
    },
    {
      id: 'VEN-004',
      name: 'Cool Air HVAC',
      contactName: 'Dave Brown',
      email: 'dave@coolairhvac.com',
      phone: '(555) 444-5555',
      address: '555 Climate Blvd, Greenville, SC 29604',
      trade: 'HVAC',
      contractAmount: 216000,
      paidToDate: 162000,
      retainage: 8100,
      status: 'active',
      insuranceExpiry: '2025-05-10',
      licenseNumber: 'SC-HVAC-22222',
      rating: 5,
      preferred: true,
      w9OnFile: true,
      coiOnFile: true,
      notes: 'Very responsive. Quality installations.',
    },
    {
      id: 'VEN-005',
      name: 'Top Roofing',
      contactName: 'Steve Miller',
      email: 'steve@toproofing.com',
      phone: '(555) 666-7777',
      address: '888 Shingle Way, Greenville, SC 29605',
      trade: 'Roofing',
      contractAmount: 156000,
      paidToDate: 156000,
      retainage: 0,
      status: 'complete',
      insuranceExpiry: '2025-07-01',
      licenseNumber: 'SC-RF-33333',
      rating: 4,
      preferred: false,
      w9OnFile: true,
      coiOnFile: true,
      notes: 'Roofing complete on all units.',
    },
    {
      id: 'VEN-006',
      name: 'Foundation Masters',
      contactName: 'Robert Chen',
      email: 'robert@foundationmasters.com',
      phone: '(555) 777-8888',
      address: '999 Concrete Dr, Greenville, SC 29606',
      trade: 'Foundation',
      contractAmount: 312000,
      paidToDate: 312000,
      retainage: 0,
      status: 'complete',
      insuranceExpiry: '2025-08-15',
      licenseNumber: 'SC-FC-44444',
      rating: 5,
      preferred: true,
      w9OnFile: true,
      coiOnFile: true,
      notes: 'Foundation work complete. Released retainage.',
    },
    {
      id: 'VEN-007',
      name: 'Premium Cabinets',
      contactName: 'Lisa Park',
      email: 'lisa@premiumcabinets.com',
      phone: '(555) 888-9999',
      address: '222 Woodwork Ln, Greenville, SC 29607',
      trade: 'Cabinets',
      contractAmount: 264000,
      paidToDate: 180000,
      retainage: 9000,
      status: 'active',
      insuranceExpiry: '2025-09-30',
      licenseNumber: 'SC-CB-55555',
      rating: 5,
      preferred: true,
      w9OnFile: true,
      coiOnFile: false,
      notes: 'Need updated COI - expires next month.',
    },
    {
      id: 'VEN-008',
      name: 'Green Landscaping',
      contactName: 'Maria Santos',
      email: 'maria@greenlandscaping.com',
      phone: '(555) 999-0000',
      address: '444 Garden Ave, Greenville, SC 29608',
      trade: 'Landscaping',
      contractAmount: 132000,
      paidToDate: 45000,
      retainage: 2250,
      status: 'active',
      insuranceExpiry: '2025-02-28',
      licenseNumber: 'SC-LS-66666',
      rating: 4,
      preferred: false,
      w9OnFile: true,
      coiOnFile: true,
      notes: 'Starting landscaping work in January.',
    },
  ]);

  const contracts = [
    { id: 'CON-001', vendor: 'Johnson Construction', type: 'AIA A101', amount: 3965000, date: '2024-03-01', status: 'active' },
    { id: 'CON-002', vendor: 'Sparks Electric', type: 'Subcontract', amount: 204000, date: '2024-03-15', status: 'active' },
    { id: 'CON-003', vendor: 'ABC Plumbing', type: 'Subcontract', amount: 192000, date: '2024-03-15', status: 'active' },
    { id: 'CON-004', vendor: 'Cool Air HVAC', type: 'Subcontract', amount: 216000, date: '2024-03-15', status: 'active' },
    { id: 'CON-005', vendor: 'Top Roofing', type: 'Subcontract', amount: 156000, date: '2024-03-20', status: 'complete' },
  ];

  const payments = [
    { id: 'PAY-001', vendor: 'Johnson Construction', amount: 450000, date: '2024-12-15', type: 'Progress Payment', invoice: 'INV-12345', status: 'paid' },
    { id: 'PAY-002', vendor: 'Sparks Electric', amount: 35000, date: '2024-12-15', type: 'Progress Payment', invoice: 'INV-E-089', status: 'paid' },
    { id: 'PAY-003', vendor: 'ABC Plumbing', amount: 28000, date: '2024-12-15', type: 'Progress Payment', invoice: 'INV-P-056', status: 'paid' },
    { id: 'PAY-004', vendor: 'Cool Air HVAC', amount: 42000, date: '2024-12-20', type: 'Progress Payment', invoice: 'INV-H-034', status: 'pending' },
    { id: 'PAY-005', vendor: 'Premium Cabinets', amount: 65000, date: '2024-12-22', type: 'Progress Payment', invoice: 'INV-C-012', status: 'pending' },
  ];

  const trades = ['General Contractor', 'Electrical', 'Plumbing', 'HVAC', 'Roofing', 'Foundation', 'Framing', 'Cabinets', 'Flooring', 'Painting', 'Landscaping'];

  const [newVendor, setNewVendor] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    trade: '',
    licenseNumber: '',
    notes: '',
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'complete': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'inactive': return 'bg-gray-100 text-gray-600';
      case 'paid': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesTrade = filterTrade === 'all' || vendor.trade === filterTrade;
    const matchesStatus = filterStatus === 'all' || vendor.status === filterStatus;
    return matchesTrade && matchesStatus;
  });

  const totalContractValue = vendors.reduce((sum, v) => sum + v.contractAmount, 0);
  const totalPaid = vendors.reduce((sum, v) => sum + v.paidToDate, 0);
  const totalRetainage = vendors.reduce((sum, v) => sum + v.retainage, 0);
  const activeVendors = vendors.filter(v => v.status === 'active').length;

  const togglePreferred = (vendorId) => {
    setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, preferred: !v.preferred } : v));
  };

  const formatCurrency = (value) => {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  const isInsuranceExpiringSoon = (date) => {
    if (!date) return false;
    const expDate = new Date(date);
    const today = new Date();
    const daysUntil = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
    return daysUntil <= 60 && daysUntil > 0;
  };

  const handleSaveVendor = () => {
    const vendor = {
      id: `VEN-${String(vendors.length + 1).padStart(3, '0')}`,
      ...newVendor,
      contractAmount: 0,
      paidToDate: 0,
      retainage: 0,
      status: 'active',
      insuranceExpiry: '',
      rating: 0,
      preferred: false,
      w9OnFile: false,
      coiOnFile: false,
    };
    setVendors(prev => [...prev, vendor]);
    setShowVendorModal(false);
    setNewVendor({ name: '', contactName: '', email: '', phone: '', address: '', trade: '', licenseNumber: '', notes: '' });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Vendors & Subcontractors</h1>
          <p className="text-sm text-gray-500">{vendors.length} vendors • {activeVendors} active</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowVendorModal(true)}>
            <Plus className="w-4 h-4 mr-1" />Add Vendor
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Total Contract Value</p>
          <p className="text-xl font-semibold">{formatCurrency(totalContractValue)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-xs text-gray-500">Paid to Date</p>
          <p className="text-xl font-semibold text-green-600">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Remaining</p>
          <p className="text-xl font-semibold">{formatCurrency(totalContractValue - totalPaid)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-amber-500">
          <p className="text-xs text-gray-500">Retainage Held</p>
          <p className="text-xl font-semibold text-amber-600">{formatCurrency(totalRetainage)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">% Complete</p>
          <p className="text-xl font-semibold">{((totalPaid / totalContractValue) * 100).toFixed(0)}%</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('vendors')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'vendors' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Vendors ({vendors.length})
        </button>
        <button onClick={() => setActiveTab('contracts')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'contracts' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Contracts ({contracts.length})
        </button>
        <button onClick={() => setActiveTab('payments')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'payments' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Payments
        </button>
      </div>

      {/* Vendors Tab */}
      {activeTab === 'vendors' && (
        <>
          {/* Filters */}
          <div className="bg-white border rounded-lg p-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search vendors..." className="pl-9" />
              </div>
              <select className="border rounded-md px-3 py-2 text-sm" value={filterTrade} onChange={(e) => setFilterTrade(e.target.value)}>
                <option value="all">All Trades</option>
                {trades.map(trade => (
                  <option key={trade} value={trade}>{trade}</option>
                ))}
              </select>
              <select className="border rounded-md px-3 py-2 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="complete">Complete</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Vendors Table */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="w-8 px-4 py-3"></th>
                  <th className="text-left px-4 py-3 font-medium">Vendor</th>
                  <th className="text-left px-4 py-3 font-medium">Trade</th>
                  <th className="text-right px-4 py-3 font-medium">Contract</th>
                  <th className="text-right px-4 py-3 font-medium">Paid</th>
                  <th className="text-right px-4 py-3 font-medium">Retainage</th>
                  <th className="text-left px-4 py-3 font-medium">Insurance</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <button onClick={() => togglePreferred(vendor.id)}>
                        {vendor.preferred ? (
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        ) : (
                          <StarOff className="w-4 h-4 text-gray-300" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{vendor.name}</p>
                        <p className="text-xs text-gray-500">{vendor.contactName}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">{vendor.trade}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">${vendor.contractAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-green-600">${vendor.paidToDate.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-amber-600">${vendor.retainage.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {isInsuranceExpiringSoon(vendor.insuranceExpiry) ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        ) : vendor.coiOnFile ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-xs">{vendor.insuranceExpiry}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(vendor.status))}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="p-1 hover:bg-gray-100 rounded" onClick={() => setSelectedVendor(vendor)}>
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Contracts Tab */}
      {activeTab === 'contracts' && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Contract #</th>
                <th className="text-left px-4 py-3 font-medium">Vendor</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-right px-4 py-3 font-medium">Amount</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {contracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-[#047857]">{contract.id}</td>
                  <td className="px-4 py-3">{contract.vendor}</td>
                  <td className="px-4 py-3 text-xs">{contract.type}</td>
                  <td className="px-4 py-3 text-right font-medium">${contract.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs">{contract.date}</td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(contract.status))}>
                      {contract.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1 hover:bg-gray-100 rounded"><FileText className="w-4 h-4 text-gray-500" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Payment #</th>
                <th className="text-left px-4 py-3 font-medium">Vendor</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Invoice</th>
                <th className="text-right px-4 py-3 font-medium">Amount</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-[#047857]">{payment.id}</td>
                  <td className="px-4 py-3">{payment.vendor}</td>
                  <td className="px-4 py-3 text-xs">{payment.type}</td>
                  <td className="px-4 py-3 font-mono text-xs">{payment.invoice}</td>
                  <td className="px-4 py-3 text-right font-medium">${payment.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs">{payment.date}</td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(payment.status))}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Vendor Modal */}
      {showVendorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">Add Vendor</h3>
              <button onClick={() => setShowVendorModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Company Name *</label>
                <Input value={newVendor.name} onChange={(e) => setNewVendor(prev => ({ ...prev, name: e.target.value }))} placeholder="Company name" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Contact Name</label>
                <Input value={newVendor.contactName} onChange={(e) => setNewVendor(prev => ({ ...prev, contactName: e.target.value }))} placeholder="Primary contact" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Email</label>
                  <Input type="email" value={newVendor.email} onChange={(e) => setNewVendor(prev => ({ ...prev, email: e.target.value }))} placeholder="email@company.com" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Phone</label>
                  <Input value={newVendor.phone} onChange={(e) => setNewVendor(prev => ({ ...prev, phone: e.target.value }))} placeholder="(555) 123-4567" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Address</label>
                <Input value={newVendor.address} onChange={(e) => setNewVendor(prev => ({ ...prev, address: e.target.value }))} placeholder="Street, City, State ZIP" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Trade *</label>
                  <select className="w-full border rounded-md px-3 py-2" value={newVendor.trade} onChange={(e) => setNewVendor(prev => ({ ...prev, trade: e.target.value }))}>
                    <option value="">Select trade...</option>
                    {trades.map(trade => (
                      <option key={trade} value={trade}>{trade}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">License #</label>
                  <Input value={newVendor.licenseNumber} onChange={(e) => setNewVendor(prev => ({ ...prev, licenseNumber: e.target.value }))} placeholder="SC-XX-12345" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Notes</label>
                <textarea className="w-full border rounded-md px-3 py-2" rows={3} value={newVendor.notes} onChange={(e) => setNewVendor(prev => ({ ...prev, notes: e.target.value }))} placeholder="Additional notes..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 sticky bottom-0">
              <Button variant="outline" onClick={() => setShowVendorModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleSaveVendor}>Add Vendor</Button>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Detail Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <div>
                <h3 className="font-semibold">{selectedVendor.name}</h3>
                <p className="text-sm text-gray-500">{selectedVendor.trade}</p>
              </div>
              <button onClick={() => setSelectedVendor(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status & Rating */}
              <div className="flex items-center gap-3">
                <span className={cn("px-3 py-1 rounded text-sm capitalize", getStatusColor(selectedVendor.status))}>
                  {selectedVendor.status}
                </span>
                {selectedVendor.preferred && (
                  <span className="px-3 py-1 rounded text-sm bg-amber-100 text-amber-700 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-500" /> Preferred
                  </span>
                )}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn("w-4 h-4", i < selectedVendor.rating ? "text-amber-500 fill-amber-500" : "text-gray-300")} />
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Contact</p>
                  <p className="font-medium">{selectedVendor.contactName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <a href={`tel:${selectedVendor.phone}`} className="font-medium text-[#047857]">{selectedVendor.phone}</a>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <a href={`mailto:${selectedVendor.email}`} className="font-medium text-[#047857]">{selectedVendor.email}</a>
                </div>
                <div>
                  <p className="text-gray-500">License #</p>
                  <p className="font-medium font-mono">{selectedVendor.licenseNumber}</p>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-3">Financial Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Contract Amount</p>
                    <p className="font-semibold">${selectedVendor.contractAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Paid to Date</p>
                    <p className="font-semibold text-green-600">${selectedVendor.paidToDate.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Retainage Held</p>
                    <p className="font-semibold text-amber-600">${selectedVendor.retainage.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Remaining Balance</span>
                    <span className="font-semibold">${(selectedVendor.contractAmount - selectedVendor.paidToDate).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Compliance */}
              <div>
                <h4 className="font-medium mb-3">Compliance</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className={cn("flex items-center gap-2 p-2 rounded", selectedVendor.w9OnFile ? "bg-green-50" : "bg-red-50")}>
                    {selectedVendor.w9OnFile ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
                    <span className="text-sm">W-9</span>
                  </div>
                  <div className={cn("flex items-center gap-2 p-2 rounded", selectedVendor.coiOnFile ? "bg-green-50" : "bg-red-50")}>
                    {selectedVendor.coiOnFile ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
                    <span className="text-sm">COI</span>
                  </div>
                  <div className={cn("flex items-center gap-2 p-2 rounded", isInsuranceExpiringSoon(selectedVendor.insuranceExpiry) ? "bg-amber-50" : "bg-green-50")}>
                    {isInsuranceExpiringSoon(selectedVendor.insuranceExpiry) ? <AlertTriangle className="w-4 h-4 text-amber-500" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                    <span className="text-sm">Insurance: {selectedVendor.insuranceExpiry}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedVendor.notes && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-sm">{selectedVendor.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setSelectedVendor(null)}>Close</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]"><Edit2 className="w-4 h-4 mr-1" />Edit</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorsPage;
