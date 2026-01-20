import React, { useState } from 'react';
import { Plus, Search, Eye, Edit2, X, Download, FileText, DollarSign, Calendar, CheckCircle, Clock, AlertTriangle, Send, Printer, Filter, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const CommitmentsPage = ({ projectId }) => {
  const [showCommitmentModal, setShowCommitmentModal] = useState(false);
  const [selectedCommitment, setSelectedCommitment] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'purchase-orders', 'subcontracts', 'change-orders'
  const [expandedVendors, setExpandedVendors] = useState([]);

  const [commitments, setCommitments] = useState([
    // Purchase Orders
    { id: 'PO-001', type: 'purchase-order', description: 'Appliances - Units 1-4', vendor: 'Best Buy Business', category: 'Appliances', amount: 43200, invoiced: 21600, paid: 21600, status: 'partial', issueDate: '2024-10-15', deliveryDate: '2024-12-01', costCode: '02-016' },
    { id: 'PO-002', type: 'purchase-order', description: 'Windows & Doors - Phase 1', vendor: 'Andersen Windows', category: 'Windows & Doors', amount: 84000, invoiced: 84000, paid: 84000, status: 'complete', issueDate: '2024-06-20', deliveryDate: '2024-08-15', costCode: '02-007' },
    { id: 'PO-003', type: 'purchase-order', description: 'Flooring Materials - All Units', vendor: 'Shaw Flooring', category: 'Flooring', amount: 72000, invoiced: 48000, paid: 36000, status: 'partial', issueDate: '2024-09-01', deliveryDate: '2024-11-15', costCode: '02-014' },
    { id: 'PO-004', type: 'purchase-order', description: 'Roofing Materials', vendor: 'ABC Supply', category: 'Roofing', amount: 62400, invoiced: 62400, paid: 62400, status: 'complete', issueDate: '2024-07-01', deliveryDate: '2024-08-01', costCode: '02-005' },
    { id: 'PO-005', type: 'purchase-order', description: 'Lumber Package - Phase 2', vendor: 'Builders FirstSource', category: 'Framing', amount: 156000, invoiced: 156000, paid: 156000, status: 'complete', issueDate: '2024-08-15', deliveryDate: '2024-09-15', costCode: '02-004' },
    { id: 'PO-006', type: 'purchase-order', description: 'HVAC Equipment', vendor: 'Ferguson?"VAC', category: 'HVAC', amount: 108000, invoiced: 81000, paid: 54000, status: 'partial', issueDate: '2024-09-20', deliveryDate: '2024-11-01', costCode: '02-010' },
    
    // Subcontracts
    { id: 'SC-001', type: 'subcontract', description: 'General Contracting Services', vendor: 'Johnson Construction', category: 'General Contractor', amount: 3965000, invoiced: 2850000, paid: 2707500, status: 'active', issueDate: '2024-03-01', costCode: 'Multiple' },
    { id: 'SC-002', type: 'subcontract', description: 'Electrical Installation', vendor: 'Sparks Electric', category: 'Electrical', amount: 204000, invoiced: 156000, paid: 148200, status: 'active', issueDate: '2024-03-15', costCode: '02-009' },
    { id: 'SC-003', type: 'subcontract', description: 'Plumbing Installation', vendor: 'ABC Plumbing', category: 'Plumbing', amount: 192000, invoiced: 145000, paid: 137750, status: 'active', issueDate: '2024-03-15', costCode: '02-008' },
    { id: 'SC-004', type: 'subcontract', description: 'HVAC Installation', vendor: 'Cool Air HVAC', category: 'HVAC', amount: 216000, invoiced: 162000, paid: 153900, status: 'active', issueDate: '2024-03-15', costCode: '02-010' },
    { id: 'SC-005', type: 'subcontract', description: 'Roofing Installation', vendor: 'Top Roofing', category: 'Roofing', amount: 156000, invoiced: 156000, paid: 156000, status: 'complete', issueDate: '2024-03-20', costCode: '02-005' },
    { id: 'SC-006', type: 'subcontract', description: 'Foundation Work', vendor: 'Foundation Masters', category: 'Foundation', amount: 312000, invoiced: 312000, paid: 312000, status: 'complete', issueDate: '2024-03-10', costCode: '02-003' },
    { id: 'SC-007', type: 'subcontract', description: 'Cabinet Installation', vendor: 'Premium Cabinets', category: 'Cabinets', amount: 264000, invoiced: 180000, paid: 171000, status: 'active', issueDate: '2024-08-01', costCode: '02-015' },
    { id: 'SC-008', type: 'subcontract', description: 'Landscaping', vendor: 'Green Landscaping', category: 'Landscaping', amount: 132000, invoiced: 45000, paid: 42750, status: 'active', issueDate: '2024-10-01', costCode: '02-018' },
    
    // Change Orders
    { id: 'CO-001', type: 'change-order', description: 'Additional electrical circuits - Unit 4', vendor: 'Sparks Electric', category: 'Electrical', amount: 4500, invoiced: 0, paid: 0, status: 'pending', issueDate: '2024-12-24', parentContract: 'SC-002', costCode: '02-009' },
    { id: 'CO-002', type: 'change-order', description: 'Upgraded countertops - Unit 1', vendor: 'Premium Cabinets', category: 'Cabinets', amount: 8200, invoiced: 8200, paid: 8200, status: 'complete', issueDate: '2024-11-15', parentContract: 'SC-007', costCode: '02-015' },
    { id: 'CO-003', type: 'change-order', description: 'Foundation repair - Unit 3', vendor: 'Foundation Masters', category: 'Foundation', amount: 12500, invoiced: 12500, paid: 12500, status: 'complete', issueDate: '2024-06-20', parentContract: 'SC-006', costCode: '02-003' },
  ]);

  const [newCommitment, setNewCommitment] = useState({
    type: 'purchase-order',
    description: '',
    vendor: '',
    category: '',
    amount: '',
    deliveryDate: '',
    costCode: '',
    notes: '',
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-700';
      case 'active': return 'bg-blue-100 text-blue-700';
      case 'partial': return 'bg-amber-100 text-amber-700';
      case 'pending': return 'bg-purple-100 text-purple-700';
      case 'draft': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'purchase-order': return 'bg-blue-100 text-blue-700';
      case 'subcontract': return 'bg-purple-100 text-purple-700';
      case 'change-order': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'purchase-order': return 'PO';
      case 'subcontract': return 'SC';
      case 'change-order': return 'CO';
      default: return type;
    }
  };

  const filteredCommitments = commitments.filter(c => {
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchesType = filterType === 'all' || c.type === filterType;
    const matchesTab = activeTab === 'all' || 
                       (activeTab === 'purchase-orders' && c.type === 'purchase-order') ||
                       (activeTab === 'subcontracts' && c.type === 'subcontract') ||
                       (activeTab === 'change-orders' && c.type === 'change-order');
    return matchesStatus && matchesType && matchesTab;
  });

  // Group by vendor for summary view
  const groupedByVendor = commitments.reduce((acc, c) => {
    if (!acc[c.vendor]) {
      acc[c.vendor] = { commitments: [], totalAmount: 0, totalInvoiced: 0, totalPaid: 0 };
    }
    acc[c.vendor].commitments.push(c);
    acc[c.vendor].totalAmount += c.amount;
    acc[c.vendor].totalInvoiced += c.invoiced;
    acc[c.vendor].totalPaid += c.paid;
    return acc;
  }, {});

  const totalCommitted = commitments.reduce((sum, c) => sum + c.amount, 0);
  const totalInvoiced = commitments.reduce((sum, c) => sum + c.invoiced, 0);
  const totalPaid = commitments.reduce((sum, c) => sum + c.paid, 0);
  const retainageHeld = totalInvoiced - totalPaid;

  const purchaseOrders = commitments.filter(c => c.type === 'purchase-order');
  const subcontracts = commitments.filter(c => c.type === 'subcontract');
  const changeOrders = commitments.filter(c => c.type === 'change-order');

  const formatCurrency = (value) => {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  const toggleVendor = (vendor) => {
    setExpandedVendors(prev =>
      prev.includes(vendor) ? prev.filter(v => v !== vendor) : [...prev, vendor]
    );
  };

  const handleSaveCommitment = () => {
    const prefix = newCommitment.type === 'purchase-order' ? 'PO' : newCommitment.type === 'subcontract' ? 'SC' : 'CO';
    const count = commitments.filter(c => c.type === newCommitment.type).length + 1;
    const commitment = {
      id: `${prefix}-${String(count).padStart(3, '0')}`,
      ...newCommitment,
      amount: parseFloat(newCommitment.amount) || 0,
      invoiced: 0,
      paid: 0,
      status: 'pending',
      issueDate: new Date().toISOString().split('T')[0],
    };
    setCommitments(prev => [...prev, commitment]);
    setShowCommitmentModal(false);
    setNewCommitment({ type: 'purchase-order', description: '', vendor: '', category: '', amount: '', deliveryDate: '', costCode: '', notes: '' });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Commitments</h1>
          <p className="text-sm text-gray-500">Purchase orders, subcontracts, and change orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowCommitmentModal(true)}>
            <Plus className="w-4 h-4 mr-1" />New Commitment
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Total Committed</p>
          <p className="text-xl font-semibold">{formatCurrency(totalCommitted)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-xs text-gray-500">Purchase Orders</p>
          <p className="text-xl font-semibold">{formatCurrency(purchaseOrders.reduce((s, c) => s + c.amount, 0))}</p>
          <p className="text-xs text-gray-400">{purchaseOrders.length} orders</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-purple-500">
          <p className="text-xs text-gray-500">Subcontracts</p>
          <p className="text-xl font-semibold">{formatCurrency(subcontracts.reduce((s, c) => s + c.amount, 0))}</p>
          <p className="text-xs text-gray-400">{subcontracts.length} contracts</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-amber-500">
          <p className="text-xs text-gray-500">Change Orders</p>
          <p className="text-xl font-semibold">{formatCurrency(changeOrders.reduce((s, c) => s + c.amount, 0))}</p>
          <p className="text-xs text-gray-400">{changeOrders.length} COs</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-xs text-gray-500">Total Paid</p>
          <p className="text-xl font-semibold text-green-600">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Retainage Held</p>
          <p className="text-xl font-semibold text-amber-600">{formatCurrency(retainageHeld)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('all')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'all' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          All ({commitments.length})
        </button>
        <button onClick={() => setActiveTab('purchase-orders')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'purchase-orders' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Purchase Orders ({purchaseOrders.length})
        </button>
        <button onClick={() => setActiveTab('subcontracts')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'subcontracts' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Subcontracts ({subcontracts.length})
        </button>
        <button onClick={() => setActiveTab('change-orders')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'change-orders' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Change Orders ({changeOrders.length})
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search commitments..." className="pl-9" />
          </div>
          <select className="border rounded-md px-3 py-2 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="partial">Partial</option>
            <option value="complete">Complete</option>
          </select>
          <select className="border rounded-md px-3 py-2 text-sm">
            <option value="">All Vendors</option>
            {Object.keys(groupedByVendor).map(vendor => (
              <option key={vendor} value={vendor}>{vendor}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Commitments Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">ID</th>
              <th className="text-left px-4 py-3 font-medium">Description</th>
              <th className="text-left px-4 py-3 font-medium">Vendor</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-right px-4 py-3 font-medium">Amount</th>
              <th className="text-right px-4 py-3 font-medium">Invoiced</th>
              <th className="text-right px-4 py-3 font-medium">Paid</th>
              <th className="text-right px-4 py-3 font-medium">Balance</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredCommitments.map((commitment) => (
              <tr key={commitment.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-[#047857] font-medium">{commitment.id}</td>
                <td className="px-4 py-3">
                  <p className="font-medium truncate max-w-xs">{commitment.description}</p>
                  <p className="text-xs text-gray-500">{commitment.costCode}</p>
                </td>
                <td className="px-4 py-3 text-sm">{commitment.vendor}</td>
                <td className="px-4 py-3">
                  <span className={cn("px-2 py-1 rounded text-xs", getTypeColor(commitment.type))}>
                    {getTypeLabel(commitment.type)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium">${commitment.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">${commitment.invoiced.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-green-600">${commitment.paid.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-amber-600">${(commitment.amount - commitment.paid).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(commitment.status))}>
                    {commitment.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="p-1 hover:bg-gray-100 rounded" onClick={() => setSelectedCommitment(commitment)}>
                      <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <FileText className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t font-semibold">
            <tr>
              <td className="px-4 py-3" colSpan="4">TOTALS</td>
              <td className="px-4 py-3 text-right">${filteredCommitments.reduce((s, c) => s + c.amount, 0).toLocaleString()}</td>
              <td className="px-4 py-3 text-right">${filteredCommitments.reduce((s, c) => s + c.invoiced, 0).toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-green-600">${filteredCommitments.reduce((s, c) => s + c.paid, 0).toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-amber-600">${filteredCommitments.reduce((s, c) => s + (c.amount - c.paid), 0).toLocaleString()}</td>
              <td colSpan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* New Commitment Modal */}
      {showCommitmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">New Commitment</h3>
              <button onClick={() => setShowCommitmentModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Type *</label>
                <select className="w-full border rounded-md px-3 py-2" value={newCommitment.type} onChange={(e) => setNewCommitment(prev => ({ ...prev, type: e.target.value }))}>
                  <option value="purchase-order">Purchase Order</option>
                  <option value="subcontract">Subcontract</option>
                  <option value="change-order">Change Order</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description *</label>
                <Input value={newCommitment.description} onChange={(e) => setNewCommitment(prev => ({ ...prev, description: e.target.value }))} placeholder="Brief description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Vendor *</label>
                  <Input value={newCommitment.vendor} onChange={(e) => setNewCommitment(prev => ({ ...prev, vendor: e.target.value }))} placeholder="Vendor name" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Category</label>
                  <Input value={newCommitment.category} onChange={(e) => setNewCommitment(prev => ({ ...prev, category: e.target.value }))} placeholder="e.g., Electrical" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Amount *</label>
                  <Input type="number" value={newCommitment.amount} onChange={(e) => setNewCommitment(prev => ({ ...prev, amount: e.target.value }))} placeholder="0.00" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Cost Code</label>
                  <Input value={newCommitment.costCode} onChange={(e) => setNewCommitment(prev => ({ ...prev, costCode: e.target.value }))} placeholder="e.g., 02-009" />
                </div>
              </div>
              {newCommitment.type === 'purchase-order' && (
                <div>
                  <label className="text-sm font-medium block mb-1">Delivery Date</label>
                  <Input type="date" value={newCommitment.deliveryDate} onChange={(e) => setNewCommitment(prev => ({ ...prev, deliveryDate: e.target.value }))} />
                </div>
              )}
              <div>
                <label className="text-sm font-medium block mb-1">Notes</label>
                <textarea className="w-full border rounded-md px-3 py-2" rows={3} value={newCommitment.notes} onChange={(e) => setNewCommitment(prev => ({ ...prev, notes: e.target.value }))} placeholder="Additional notes..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 sticky bottom-0">
              <Button variant="outline" onClick={() => setShowCommitmentModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleSaveCommitment}>Create Commitment</Button>
            </div>
          </div>
        </div>
      )}

      {/* Commitment Detail Modal */}
      {selectedCommitment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <div>
                <h3 className="font-semibold">{selectedCommitment.id}</h3>
                <p className="text-sm text-gray-500">{selectedCommitment.description}</p>
              </div>
              <button onClick={() => setSelectedCommitment(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <span className={cn("px-3 py-1 rounded text-sm", getTypeColor(selectedCommitment.type))}>
                  {selectedCommitment.type === 'purchase-order' ? 'Purchase Order' : 
                   selectedCommitment.type === 'subcontract' ? 'Subcontract' : 'Change Order'}
                </span>
                <span className={cn("px-3 py-1 rounded text-sm capitalize", getStatusColor(selectedCommitment.status))}>
                  {selectedCommitment.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Vendor</p>
                  <p className="font-medium">{selectedCommitment.vendor}</p>
                </div>
                <div>
                  <p className="text-gray-500">Category</p>
                  <p className="font-medium">{selectedCommitment.category}</p>
                </div>
                <div>
                  <p className="text-gray-500">Issue Date</p>
                  <p className="font-medium">{selectedCommitment.issueDate}</p>
                </div>
                <div>
                  <p className="text-gray-500">Cost Code</p>
                  <p className="font-medium font-mono">{selectedCommitment.costCode}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-3">Financial Summary</h4>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Contract Amount</p>
                    <p className="font-semibold">${selectedCommitment.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Invoiced</p>
                    <p className="font-semibold">${selectedCommitment.invoiced.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Paid</p>
                    <p className="font-semibold text-green-600">${selectedCommitment.paid.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Balance</p>
                    <p className="font-semibold text-amber-600">${(selectedCommitment.amount - selectedCommitment.paid).toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Retainage Held ({((selectedCommitment.invoiced - selectedCommitment.paid) / selectedCommitment.invoiced * 100).toFixed(0)}%)</span>
                    <span className="font-medium">${(selectedCommitment.invoiced - selectedCommitment.paid).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#047857]" style={{ width: `${(selectedCommitment.paid / selectedCommitment.amount) * 100}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 text-center">{((selectedCommitment.paid / selectedCommitment.amount) * 100).toFixed(0)}% paid</p>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" size="sm"><Printer className="w-4 h-4 mr-1" />Print</Button>
              <Button variant="outline" onClick={() => setSelectedCommitment(null)}>Close</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]"><Edit2 className="w-4 h-4 mr-1" />Edit</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommitmentsPage;
