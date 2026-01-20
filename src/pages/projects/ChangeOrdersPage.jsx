import React, { useState } from 'react';
import { Plus, Search, Eye, Edit2, X, DollarSign, Clock, CheckCircle, XCircle, AlertTriangle, FileText, Calendar, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const ChangeOrdersPage = ({ projectId }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedCO, setSelectedCO] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const [changeOrders, setChangeOrders] = useState([
    {
      id: 'CO-001',
      title: 'Upgraded kitchen appliances',
      description: 'Owner requested upgrade from standard GE appliance package to Viking Pro Series throughout Units 1-4.',
      type: 'owner-request',
      requestedBy: 'Owner',
      requestDate: '2024-12-01',
      costChange: 48000,
      scheduleChange: 0,
      status: 'approved',
      approvedDate: '2024-12-05',
      approvedBy: 'Bryan VanRock',
      items: [
        { description: 'Viking 36" Range (4 units)', quantity: 4, unitCost: 6500, total: 26000 },
        { description: 'Viking Refrigerator (4 units)', quantity: 4, unitCost: 4500, total: 18000 },
        { description: 'Labor differential', quantity: 1, unitCost: 4000, total: 4000 },
      ],
      attachments: 1,
    },
    {
      id: 'CO-002',
      title: 'Foundation soil remediation',
      description: 'Unforeseen soil conditions required additional excavation and engineered fill per geotechnical report.',
      type: 'unforeseen',
      requestedBy: 'Foundation Pro',
      requestDate: '2024-11-15',
      costChange: 35000,
      scheduleChange: 5,
      status: 'approved',
      approvedDate: '2024-11-18',
      approvedBy: 'Bryan VanRock',
      items: [
        { description: 'Additional excavation (450 cy)', quantity: 450, unitCost: 35, total: 15750 },
        { description: 'Engineered fill material', quantity: 380, unitCost: 42, total: 15960 },
        { description: 'Compaction testing', quantity: 1, unitCost: 3290, total: 3290 },
      ],
      attachments: 3,
    },
    {
      id: 'CO-003',
      title: 'Add covered patio to Units 5-8',
      description: 'Design change to add 12x14 covered patios to rear of units per owner direction.',
      type: 'owner-request',
      requestedBy: 'Owner',
      requestDate: '2024-12-10',
      costChange: 68000,
      scheduleChange: 7,
      status: 'pending',
      approvedDate: null,
      approvedBy: null,
      items: [
        { description: 'Patio cover framing (4 units)', quantity: 4, unitCost: 8500, total: 34000 },
        { description: 'Roofing materials', quantity: 4, unitCost: 3200, total: 12800 },
        { description: 'Concrete patio extension', quantity: 4, unitCost: 4800, total: 19200 },
        { description: 'Electrical for ceiling fans', quantity: 4, unitCost: 500, total: 2000 },
      ],
      attachments: 2,
    },
    {
      id: 'CO-004',
      title: 'Electrical panel upgrade',
      description: 'Code change requires 200A panels instead of 150A as originally specified.',
      type: 'code-change',
      requestedBy: 'Sparks Electric',
      requestDate: '2024-12-15',
      costChange: 8400,
      scheduleChange: 0,
      status: 'pending',
      approvedDate: null,
      approvedBy: null,
      items: [
        { description: '200A Panel upgrade (12 units)', quantity: 12, unitCost: 450, total: 5400 },
        { description: 'Additional wire gauge', quantity: 1, unitCost: 1800, total: 1800 },
        { description: 'Labor differential', quantity: 1, unitCost: 1200, total: 1200 },
      ],
      attachments: 1,
    },
    {
      id: 'CO-005',
      title: 'Delete second floor laundry hookups',
      description: 'Owner elected to remove second floor laundry option from Units 9-12 to reduce costs.',
      type: 'owner-request',
      requestedBy: 'Owner',
      requestDate: '2024-11-20',
      costChange: -12000,
      scheduleChange: -2,
      status: 'approved',
      approvedDate: '2024-11-22',
      approvedBy: 'Bryan VanRock',
      items: [
        { description: 'Delete plumbing rough-in (4 units)', quantity: 4, unitCost: -2200, total: -8800 },
        { description: 'Delete electrical (4 units)', quantity: 4, unitCost: -800, total: -3200 },
      ],
      attachments: 0,
    },
    {
      id: 'CO-006',
      title: 'Truss redesign for HVAC clearance',
      description: 'Trusses require redesign to accommodate HVAC duct routing. See RFI-006.',
      type: 'design-error',
      requestedBy: 'Cool Air HVAC',
      requestDate: '2024-12-26',
      costChange: 24500,
      scheduleChange: 10,
      status: 'review',
      approvedDate: null,
      approvedBy: null,
      items: [
        { description: 'Truss redesign engineering', quantity: 1, unitCost: 4500, total: 4500 },
        { description: 'Modified trusses (Building B)', quantity: 1, unitCost: 15000, total: 15000 },
        { description: 'Crane time for truss replacement', quantity: 1, unitCost: 3500, total: 3500 },
        { description: 'Framing labor', quantity: 1, unitCost: 1500, total: 1500 },
      ],
      attachments: 2,
    },
  ]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'owner-request',
    items: [{ description: '', quantity: '', unitCost: '', total: '' }],
  });

  const filteredCOs = changeOrders.filter(co => {
    if (filterStatus === 'all') return true;
    return co.status === filterStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'review': return 'bg-blue-100 text-blue-700';
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'owner-request': return 'bg-purple-100 text-purple-700';
      case 'unforeseen': return 'bg-orange-100 text-orange-700';
      case 'code-change': return 'bg-blue-100 text-blue-700';
      case 'design-error': return 'bg-red-100 text-red-700';
      case 'value-engineering': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const approvedCOs = changeOrders.filter(co => co.status === 'approved');
  const pendingCOs = changeOrders.filter(co => co.status === 'pending' || co.status === 'review');
  const totalApproved = approvedCOs.reduce((sum, co) => sum + co.costChange, 0);
  const totalPending = pendingCOs.reduce((sum, co) => sum + co.costChange, 0);
  const totalScheduleImpact = approvedCOs.reduce((sum, co) => sum + co.scheduleChange, 0);

  const originalBudget = 7500000;
  const currentBudget = originalBudget + totalApproved;

  const handleSave = () => {
    const newCO = {
      id: `CO-${String(changeOrders.length + 1).padStart(3, '0')}`,
      ...formData,
      requestedBy: 'VanRock PM',
      requestDate: new Date().toISOString().split('T')[0],
      costChange: formData.items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0),
      scheduleChange: 0,
      status: 'pending',
      approvedDate: null,
      approvedBy: null,
      attachments: 0,
    };
    setChangeOrders(prev => [newCO, ...prev]);
    setShowModal(false);
    setFormData({ title: '', description: '', type: 'owner-request', items: [{ description: '', quantity: '', unitCost: '', total: '' }] });
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: '', unitCost: '', total: '' }]
    }));
  };

  const updateLineItem = (idx, field, value) => {
    const newItems = [...formData.items];
    newItems[idx][field] = value;
    if (field === 'quantity' || field === 'unitCost') {
      const qty = parseFloat(newItems[idx].quantity) || 0;
      const cost = parseFloat(newItems[idx].unitCost) || 0;
      newItems[idx].total = (qty * cost).toString();
    }
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Change Orders</h1>
          <p className="text-sm text-gray-500">Contract modifications and budget changes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-1" />New Change Order
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Original Budget</p>
          <p className="text-xl font-semibold">${(originalBudget / 1000000).toFixed(2)}M</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-sm text-gray-500">Approved Changes</p>
          <p className={cn("text-xl font-semibold", totalApproved >= 0 ? "text-red-600" : "text-green-600")}>
            {totalApproved >= 0 ? '+' : '-'}${Math.abs(totalApproved).toLocaleString()}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-amber-500">
          <p className="text-sm text-gray-500">Pending Changes</p>
          <p className="text-xl font-semibold text-amber-600">+${totalPending.toLocaleString()}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Current Budget</p>
          <p className="text-xl font-semibold">${(currentBudget / 1000000).toFixed(2)}M</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Schedule Impact</p>
          <p className={cn("text-xl font-semibold", totalScheduleImpact > 0 ? "text-red-600" : "text-green-600")}>
            {totalScheduleImpact > 0 ? '+' : ''}{totalScheduleImpact} days
          </p>
        </div>
      </div>

      {/* Budget Impact Chart */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <h3 className="font-medium mb-3">Budget Impact</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden flex">
            <div className="h-full bg-blue-500" style={{ width: `${(originalBudget / currentBudget) * 100}%` }} title="Original Budget"></div>
            <div className="h-full bg-green-500" style={{ width: `${(Math.max(0, totalApproved) / currentBudget) * 100}%` }} title="Additions"></div>
          </div>
          <div className="text-sm text-gray-500 w-32 text-right">
            {((totalApproved / originalBudget) * 100).toFixed(1)}% change
          </div>
        </div>
        <div className="flex gap-4 mt-2 text-xs">
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded"></div>Original</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded"></div>Approved Additions</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-500 rounded"></div>Pending</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search change orders..." className="pl-9" />
          </div>
          <select className="border rounded-md px-3 py-2 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="review">In Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select className="border rounded-md px-3 py-2 text-sm">
            <option value="">All Types</option>
            <option value="owner-request">Owner Request</option>
            <option value="unforeseen">Unforeseen Conditions</option>
            <option value="code-change">Code Change</option>
            <option value="design-error">Design Error</option>
            <option value="value-engineering">Value Engineering</option>
          </select>
        </div>
      </div>

      {/* Change Orders Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">CO #</th>
              <th className="text-left px-4 py-3 font-medium">Title</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-left px-4 py-3 font-medium">Requested By</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-right px-4 py-3 font-medium">Cost Impact</th>
              <th className="text-right px-4 py-3 font-medium">Schedule</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredCOs.map((co) => (
              <tr key={co.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="font-medium text-[#047857]">{co.id}</span>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{co.title}</p>
                  <p className="text-xs text-gray-500 truncate max-w-xs">{co.description}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("px-2 py-1 rounded text-xs capitalize", getTypeColor(co.type))}>
                    {co.type.replace('-', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">{co.requestedBy}</td>
                <td className="px-4 py-3 text-xs">{co.requestDate}</td>
                <td className={cn("px-4 py-3 text-right font-semibold", co.costChange >= 0 ? "text-red-600" : "text-green-600")}>
                  {co.costChange >= 0 ? '+' : '-'}${Math.abs(co.costChange).toLocaleString()}
                </td>
                <td className={cn("px-4 py-3 text-right", co.scheduleChange > 0 ? "text-red-600" : co.scheduleChange < 0 ? "text-green-600" : "text-gray-500")}>
                  {co.scheduleChange > 0 ? '+' : ''}{co.scheduleChange} days
                </td>
                <td className="px-4 py-3">
                  <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(co.status))}>
                    {co.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="p-1 hover:bg-gray-100 rounded" title="View" onClick={() => setSelectedCO(co)}>
                      <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                    {co.status === 'pending' && (
                      <>
                        <button className="p-1 hover:bg-green-100 rounded" title="Approve">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </button>
                        <button className="p-1 hover:bg-red-100 rounded" title="Reject">
                          <XCircle className="w-4 h-4 text-red-500" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New CO Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">New Change Order</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Title *</label>
                <Input value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} placeholder="Brief description of change" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description *</label>
                <textarea 
                  className="w-full border rounded-md px-3 py-2" 
                  rows={3} 
                  value={formData.description} 
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} 
                  placeholder="Detailed description of the change and reason..."
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Change Type *</label>
                <select className="w-full border rounded-md px-3 py-2" value={formData.type} onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}>
                  <option value="owner-request">Owner Request</option>
                  <option value="unforeseen">Unforeseen Conditions</option>
                  <option value="code-change">Code Change</option>
                  <option value="design-error">Design Error</option>
                  <option value="value-engineering">Value Engineering</option>
                </select>
              </div>

              {/* Line Items */}
              <div>
                <label className="text-sm font-medium block mb-2">Cost Breakdown</label>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium">Description</th>
                        <th className="text-right px-3 py-2 font-medium w-24">Qty</th>
                        <th className="text-right px-3 py-2 font-medium w-32">Unit Cost</th>
                        <th className="text-right px-3 py-2 font-medium w-32">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-2 py-1">
                            <Input 
                              className="border-0 shadow-none" 
                              placeholder="Item description" 
                              value={item.description}
                              onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                            />
                          </td>
                          <td className="px-2 py-1">
                            <Input 
                              type="number" 
                              className="border-0 shadow-none text-right" 
                              placeholder="0"
                              value={item.quantity}
                              onChange={(e) => updateLineItem(idx, 'quantity', e.target.value)}
                            />
                          </td>
                          <td className="px-2 py-1">
                            <Input 
                              type="number" 
                              className="border-0 shadow-none text-right" 
                              placeholder="0.00"
                              value={item.unitCost}
                              onChange={(e) => updateLineItem(idx, 'unitCost', e.target.value)}
                            />
                          </td>
                          <td className="px-3 py-2 text-right font-medium">
                            ${parseFloat(item.total || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t">
                      <tr>
                        <td colSpan={3} className="px-3 py-2 text-right font-semibold">Total Change:</td>
                        <td className="px-3 py-2 text-right font-semibold">
                          ${formData.items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0).toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <Button variant="outline" size="sm" className="mt-2" onClick={addLineItem}>
                  <Plus className="w-4 h-4 mr-1" />Add Line Item
                </Button>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 sticky bottom-0">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleSave}>Submit Change Order</Button>
            </div>
          </div>
        </div>
      )}

      {/* CO Detail Modal */}
      {selectedCO && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <div>
                <h3 className="font-semibold">{selectedCO.id}</h3>
                <span className={cn("text-xs px-2 py-0.5 rounded", getTypeColor(selectedCO.type))}>
                  {selectedCO.type.replace('-', ' ')}
                </span>
              </div>
              <button onClick={() => setSelectedCO(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center gap-3">
                <span className={cn("px-3 py-1 rounded text-sm capitalize", getStatusColor(selectedCO.status))}>
                  {selectedCO.status}
                </span>
                {selectedCO.approvedBy && (
                  <span className="text-sm text-gray-500">
                    Approved by {selectedCO.approvedBy} on {selectedCO.approvedDate}
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <div>
                <h4 className="text-lg font-semibold mb-2">{selectedCO.title}</h4>
                <p className="text-sm text-gray-600">{selectedCO.description}</p>
              </div>

              {/* Impact Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className={cn("rounded-lg p-4 text-center", selectedCO.costChange >= 0 ? "bg-red-50" : "bg-green-50")}>
                  <p className="text-sm text-gray-500">Cost Impact</p>
                  <p className={cn("text-2xl font-semibold", selectedCO.costChange >= 0 ? "text-red-600" : "text-green-600")}>
                    {selectedCO.costChange >= 0 ? '+' : '-'}${Math.abs(selectedCO.costChange).toLocaleString()}
                  </p>
                </div>
                <div className={cn("rounded-lg p-4 text-center", selectedCO.scheduleChange > 0 ? "bg-red-50" : selectedCO.scheduleChange < 0 ? "bg-green-50" : "bg-gray-50")}>
                  <p className="text-sm text-gray-500">Schedule Impact</p>
                  <p className={cn("text-2xl font-semibold", selectedCO.scheduleChange > 0 ? "text-red-600" : selectedCO.scheduleChange < 0 ? "text-green-600" : "text-gray-600")}>
                    {selectedCO.scheduleChange > 0 ? '+' : ''}{selectedCO.scheduleChange} days
                  </p>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h4 className="font-medium mb-2">Cost Breakdown</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-3 py-2">Description</th>
                        <th className="text-right px-3 py-2">Qty</th>
                        <th className="text-right px-3 py-2">Unit Cost</th>
                        <th className="text-right px-3 py-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCO.items.map((item, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-3 py-2">{item.description}</td>
                          <td className="px-3 py-2 text-right">{item.quantity}</td>
                          <td className="px-3 py-2 text-right">${Math.abs(item.unitCost).toLocaleString()}</td>
                          <td className={cn("px-3 py-2 text-right font-medium", item.total < 0 ? "text-green-600" : "")}>
                            {item.total < 0 ? '-' : ''}${Math.abs(item.total).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t">
                      <tr>
                        <td colSpan={3} className="px-3 py-2 text-right font-semibold">Total:</td>
                        <td className={cn("px-3 py-2 text-right font-semibold", selectedCO.costChange < 0 ? "text-green-600" : "text-red-600")}>
                          {selectedCO.costChange >= 0 ? '+' : '-'}${Math.abs(selectedCO.costChange).toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Requested By</p>
                  <p className="font-medium">{selectedCO.requestedBy}</p>
                </div>
                <div>
                  <p className="text-gray-500">Request Date</p>
                  <p className="font-medium">{selectedCO.requestDate}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
              <span className="text-xs text-gray-500">{selectedCO.attachments} attachments</span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedCO(null)}>Close</Button>
                {selectedCO.status === 'pending' && (
                  <>
                    <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">Reject</Button>
                    <Button className="bg-[#047857] hover:bg-[#065f46]">Approve</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangeOrdersPage;
