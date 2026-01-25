import React, { useState, useMemo } from 'react';
import {
  ShoppingCart, CheckCircle, XCircle, Clock, AlertTriangle, User,
  DollarSign, Building, Calendar, Filter, Search, Eye, ThumbsUp,
  ThumbsDown, Plus, FileText, Package, Truck, MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const mockPurchaseOrders = [
  {
    id: 'PO-2024-0523',
    vendor: 'ABC Construction Co.',
    vendorId: 'V-001',
    description: 'Phase 3 materials - Riverside Plaza',
    requestedBy: 'John Smith',
    department: 'Construction',
    property: 'Riverside Plaza',
    totalAmount: 245000.00,
    requestDate: '2024-01-20',
    requiredDate: '2024-02-15',
    status: 'pending_approval',
    priority: 'high',
    currentApprover: 'Mike Chen',
    lineItems: [
      { id: 1, item: 'Structural Steel Beams', quantity: 500, unit: 'tons', unitPrice: 350.00, amount: 175000.00 },
      { id: 2, item: 'Concrete (Ready-Mix)', quantity: 200, unit: 'cu yd', unitPrice: 150.00, amount: 30000.00 },
      { id: 3, item: 'Rebar (#4)', quantity: 10000, unit: 'lf', unitPrice: 2.50, amount: 25000.00 },
      { id: 4, item: 'Formwork Panels', quantity: 100, unit: 'sets', unitPrice: 150.00, amount: 15000.00 }
    ],
    approvalChain: [
      { name: 'John Smith', role: 'Project Manager', action: 'submitted', date: '2024-01-20', limit: 50000 },
      { name: 'Sarah Johnson', role: 'Controller', action: 'approved', date: '2024-01-21', limit: 100000 },
      { name: 'Mike Chen', role: 'CFO', action: 'pending', date: null, limit: 500000 }
    ],
    budgetCode: 'CAP-2024-RSP-003',
    budgetRemaining: 850000.00
  },
  {
    id: 'PO-2024-0522',
    vendor: 'Office Depot',
    vendorId: 'V-025',
    description: 'Q1 Office Supplies',
    requestedBy: 'Lisa Wang',
    department: 'Operations',
    property: 'Corporate HQ',
    totalAmount: 1250.00,
    requestDate: '2024-01-19',
    requiredDate: '2024-01-26',
    status: 'approved',
    priority: 'normal',
    currentApprover: null,
    lineItems: [
      { id: 1, item: 'Copy Paper (Case)', quantity: 20, unit: 'cases', unitPrice: 45.00, amount: 900.00 },
      { id: 2, item: 'Printer Toner', quantity: 5, unit: 'cartridges', unitPrice: 50.00, amount: 250.00 },
      { id: 3, item: 'Pens & Markers', quantity: 10, unit: 'boxes', unitPrice: 10.00, amount: 100.00 }
    ],
    approvalChain: [
      { name: 'Lisa Wang', role: 'Office Manager', action: 'submitted', date: '2024-01-19', limit: 1000 },
      { name: 'Tom Davis', role: 'Supervisor', action: 'approved', date: '2024-01-19', limit: 5000 }
    ],
    budgetCode: 'OPS-2024-SUP',
    budgetRemaining: 15000.00
  },
  {
    id: 'PO-2024-0521',
    vendor: 'HVAC Solutions Inc.',
    vendorId: 'V-018',
    description: 'HVAC System Replacement - Downtown Tower',
    requestedBy: 'Mike Rodriguez',
    department: 'Facilities',
    property: 'Downtown Tower',
    totalAmount: 125000.00,
    requestDate: '2024-01-18',
    requiredDate: '2024-03-01',
    status: 'pending_approval',
    priority: 'high',
    currentApprover: 'Sarah Johnson',
    lineItems: [
      { id: 1, item: 'Commercial HVAC Unit (20 ton)', quantity: 2, unit: 'units', unitPrice: 45000.00, amount: 90000.00 },
      { id: 2, item: 'Ductwork Installation', quantity: 1, unit: 'lot', unitPrice: 25000.00, amount: 25000.00 },
      { id: 3, item: 'Controls & Thermostats', quantity: 1, unit: 'lot', unitPrice: 10000.00, amount: 10000.00 }
    ],
    approvalChain: [
      { name: 'Mike Rodriguez', role: 'Facilities Manager', action: 'submitted', date: '2024-01-18', limit: 25000 },
      { name: 'Sarah Johnson', role: 'Controller', action: 'pending', date: null, limit: 100000 },
      { name: 'Mike Chen', role: 'CFO', action: 'pending', date: null, limit: 500000 }
    ],
    budgetCode: 'CAP-2024-DWT-HVAC',
    budgetRemaining: 200000.00
  },
  {
    id: 'PO-2024-0520',
    vendor: 'SecureTech Systems',
    vendorId: 'V-032',
    description: 'Security Camera Upgrade',
    requestedBy: 'Tom Davis',
    department: 'Security',
    property: 'Multiple',
    totalAmount: 35000.00,
    requestDate: '2024-01-17',
    requiredDate: '2024-02-28',
    status: 'rejected',
    priority: 'normal',
    currentApprover: null,
    lineItems: [
      { id: 1, item: '4K Security Cameras', quantity: 50, unit: 'units', unitPrice: 500.00, amount: 25000.00 },
      { id: 2, item: 'NVR System', quantity: 2, unit: 'units', unitPrice: 3000.00, amount: 6000.00 },
      { id: 3, item: 'Installation Labor', quantity: 40, unit: 'hours', unitPrice: 100.00, amount: 4000.00 }
    ],
    approvalChain: [
      { name: 'Tom Davis', role: 'Security Director', action: 'submitted', date: '2024-01-17', limit: 10000 },
      { name: 'Sarah Johnson', role: 'Controller', action: 'rejected', date: '2024-01-18', limit: 100000, comment: 'Need 3 competitive bids per policy' }
    ],
    budgetCode: 'CAP-2024-SEC',
    budgetRemaining: 75000.00
  }
];

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
  pending_approval: { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
  ordered: { label: 'Ordered', color: 'bg-blue-100 text-blue-800', icon: Package },
  received: { label: 'Received', color: 'bg-purple-100 text-purple-800', icon: Truck }
};

const priorityConfig = {
  high: { label: 'High', color: 'text-red-600 bg-red-50' },
  normal: { label: 'Normal', color: 'text-gray-600 bg-gray-50' },
  low: { label: 'Low', color: 'text-blue-600 bg-blue-50' }
};

export default function PurchaseOrderWorkflowPage() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPO, setSelectedPO] = useState(mockPurchaseOrders[0]);

  const filteredPOs = useMemo(() => {
    return mockPurchaseOrders.filter(po => {
      const matchesFilter = filter === 'all' || po.status === filter;
      const matchesSearch = po.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchTerm]);

  const stats = useMemo(() => ({
    pending: mockPurchaseOrders.filter(p => p.status === 'pending_approval').length,
    pendingAmount: mockPurchaseOrders.filter(p => p.status === 'pending_approval').reduce((sum, p) => sum + p.totalAmount, 0),
    approved: mockPurchaseOrders.filter(p => p.status === 'approved').length,
    rejected: mockPurchaseOrders.filter(p => p.status === 'rejected').length
  }), []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Order Workflow</h1>
          <p className="text-gray-600">Create and approve purchase orders</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />Create Purchase Order
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg"><Clock className="w-5 h-5 text-yellow-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending Approval</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><DollarSign className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${(stats.pendingAmount / 1000).toFixed(0)}K</p>
              <p className="text-sm text-gray-600">Pending Value</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg"><XCircle className="w-5 h-5 text-red-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="Search purchase orders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          {['all', 'pending_approval', 'approved', 'rejected'].map((f) => (
            <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : statusConfig[f]?.label || f}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-2">
          {filteredPOs.map((po) => (
            <div
              key={po.id}
              onClick={() => setSelectedPO(po)}
              className={cn(
                "bg-white rounded-lg border p-4 cursor-pointer hover:border-blue-300 transition-colors",
                selectedPO?.id === po.id ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-900">{po.id}</p>
                  <p className="text-sm text-gray-500">{po.vendor}</p>
                </div>
                <span className={cn("px-2 py-0.5 rounded text-xs", priorityConfig[po.priority].color)}>{po.priority}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2 line-clamp-1">{po.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">${po.totalAmount.toLocaleString()}</span>
                <span className={cn("px-2 py-0.5 rounded text-xs", statusConfig[po.status].color)}>{statusConfig[po.status].label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-2">
          {selectedPO && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-gray-900">{selectedPO.id}</h2>
                      <span className={cn("px-2 py-1 rounded-full text-xs", statusConfig[selectedPO.status].color)}>{statusConfig[selectedPO.status].label}</span>
                    </div>
                    <p className="text-gray-600">{selectedPO.vendor}</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">${selectedPO.totalAmount.toLocaleString()}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><p className="text-gray-500">Requested By</p><p className="font-medium">{selectedPO.requestedBy}</p></div>
                  <div><p className="text-gray-500">Department</p><p className="font-medium">{selectedPO.department}</p></div>
                  <div><p className="text-gray-500">Property</p><p className="font-medium">{selectedPO.property}</p></div>
                  <div><p className="text-gray-500">Request Date</p><p className="font-medium">{selectedPO.requestDate}</p></div>
                  <div><p className="text-gray-500">Required Date</p><p className="font-medium">{selectedPO.requiredDate}</p></div>
                  <div><p className="text-gray-500">Budget Code</p><p className="font-medium">{selectedPO.budgetCode}</p></div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">Budget Remaining:</span>
                    <span className="font-semibold text-blue-800">${selectedPO.budgetRemaining.toLocaleString()}</span>
                  </div>
                  <div className="mt-2 h-2 bg-blue-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(100, (selectedPO.totalAmount / selectedPO.budgetRemaining) * 100)}%` }} />
                  </div>
                </div>
              </div>

              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Line Items</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2">Item</th>
                      <th className="pb-2 text-right">Qty</th>
                      <th className="pb-2 text-right">Unit Price</th>
                      <th className="pb-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPO.lineItems.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-2">{item.item}</td>
                        <td className="py-2 text-right">{item.quantity} {item.unit}</td>
                        <td className="py-2 text-right">${item.unitPrice.toLocaleString()}</td>
                        <td className="py-2 text-right font-medium">${item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="font-semibold">
                      <td className="pt-3" colSpan="3">Total</td>
                      <td className="pt-3 text-right">${selectedPO.totalAmount.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Approval Workflow</h3>
                <div className="space-y-3">
                  {selectedPO.approvalChain.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        step.action === 'approved' || step.action === 'submitted' ? "bg-green-100" :
                        step.action === 'rejected' ? "bg-red-100" : "bg-gray-100"
                      )}>
                        {step.action === 'approved' || step.action === 'submitted' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                         step.action === 'rejected' ? <XCircle className="w-4 h-4 text-red-600" /> :
                         <Clock className="w-4 h-4 text-gray-400" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{step.name}</p>
                            <p className="text-sm text-gray-500">{step.role} (Limit: ${step.limit.toLocaleString()})</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium capitalize">{step.action}</p>
                            {step.date && <p className="text-xs text-gray-500">{step.date}</p>}
                          </div>
                        </div>
                        {step.comment && <p className="mt-1 text-sm text-red-600 bg-red-50 p-2 rounded">{step.comment}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedPO.status === 'pending_approval' && (
                <div className="p-6 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Input placeholder="Add a comment..." className="flex-1" />
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50"><ThumbsDown className="w-4 h-4 mr-2" />Reject</Button>
                    <Button className="bg-green-600 hover:bg-green-700"><ThumbsUp className="w-4 h-4 mr-2" />Approve</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
