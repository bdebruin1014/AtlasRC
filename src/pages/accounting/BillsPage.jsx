import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit2, X, CreditCard, Download, DollarSign, Clock, CheckCircle, AlertTriangle, FileText, Calendar, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const BillsPage = ({ onEntityChange, selectedEntity }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPayModal, setShowPayModal] = useState(false);
  const [showNewBillModal, setShowNewBillModal] = useState(false);

  const [bills, setBills] = useState([
    {
      id: 'BILL-001',
      vendor: 'Smith Framing LLC',
      vendorId: 'V-001',
      entity: 'Watson Creek LLC',
      project: 'Watson Creek',
      billNumber: 'SF-2024-156',
      date: '2024-12-15',
      dueDate: '2024-12-30',
      status: 'pending',
      paidDate: null,
      items: [
        { description: 'Framing labor - Building A', quantity: 1, rate: 45000, amount: 45000, costCode: '06-100' },
        { description: 'Material handling', quantity: 1, rate: 2500, amount: 2500, costCode: '06-100' },
      ],
      subtotal: 47500,
      tax: 0,
      total: 47500,
      amountPaid: 0,
      balance: 47500,
      notes: 'Draw #3 - Per AIA G702',
      paymentTerms: 'Net 15',
      isIntercompany: false,
    },
    {
      id: 'BILL-002',
      vendor: 'ABC Plumbing',
      vendorId: 'V-002',
      entity: 'Watson Creek LLC',
      project: 'Watson Creek',
      billNumber: 'INV-8834',
      date: '2024-12-10',
      dueDate: '2024-12-25',
      status: 'approved',
      paidDate: null,
      items: [
        { description: 'Rough plumbing - Units 1-6', quantity: 6, rate: 4500, amount: 27000, costCode: '22-100' },
        { description: 'Water heater installation', quantity: 6, rate: 850, amount: 5100, costCode: '22-200' },
      ],
      subtotal: 32100,
      tax: 0,
      total: 32100,
      amountPaid: 0,
      balance: 32100,
      notes: '',
      paymentTerms: 'Net 15',
      isIntercompany: false,
    },
    {
      id: 'BILL-003',
      vendor: 'Sparks Electric',
      vendorId: 'V-003',
      entity: 'Oslo Ridge LLC',
      project: 'Oslo Ridge',
      billNumber: 'SE-12445',
      date: '2024-12-01',
      dueDate: '2024-12-15',
      status: 'paid',
      paidDate: '2024-12-14',
      items: [
        { description: 'Rough electrical - Phase 1', quantity: 1, rate: 28000, amount: 28000, costCode: '26-100' },
      ],
      subtotal: 28000,
      tax: 0,
      total: 28000,
      amountPaid: 28000,
      balance: 0,
      notes: 'Check #4521',
      paymentTerms: 'Net 15',
      isIntercompany: false,
    },
    {
      id: 'BILL-004',
      vendor: 'ManageCo',
      vendorId: 'V-IC-001',
      entity: 'VanRock Holdings',
      project: null,
      billNumber: 'MC-Q4-2024',
      date: '2024-12-01',
      dueDate: '2024-12-31',
      status: 'paid',
      paidDate: '2024-12-20',
      items: [
        { description: 'Q4 2024 Management Fee', quantity: 1, rate: 45000, amount: 45000, costCode: '01-200' },
        { description: 'Asset Management - Watson Creek', quantity: 1, rate: 12500, amount: 12500, costCode: '01-200' },
        { description: 'Asset Management - Oslo Ridge', quantity: 1, rate: 10000, amount: 10000, costCode: '01-200' },
      ],
      subtotal: 67500,
      tax: 0,
      total: 67500,
      amountPaid: 67500,
      balance: 0,
      notes: 'Intercompany - management services',
      paymentTerms: 'Net 30',
      isIntercompany: true,
    },
    {
      id: 'BILL-005',
      vendor: 'Ready Mix Concrete',
      vendorId: 'V-004',
      entity: 'Watson Creek LLC',
      project: 'Watson Creek',
      billNumber: 'RMC-78432',
      date: '2024-11-20',
      dueDate: '2024-12-05',
      status: 'overdue',
      paidDate: null,
      items: [
        { description: 'Concrete - 4000 PSI (125 cy)', quantity: 125, rate: 165, amount: 20625, costCode: '03-300' },
        { description: 'Pump truck - 4 hours', quantity: 4, rate: 275, amount: 1100, costCode: '03-300' },
        { description: 'Saturday delivery surcharge', quantity: 1, rate: 500, amount: 500, costCode: '03-300' },
      ],
      subtotal: 22225,
      tax: 0,
      total: 22225,
      amountPaid: 0,
      balance: 22225,
      notes: 'OVERDUE - Vendor requesting payment',
      paymentTerms: 'Net 15',
      isIntercompany: false,
    },
    {
      id: 'BILL-006',
      vendor: 'Cool Air HVAC',
      vendorId: 'V-005',
      entity: 'Oslo Ridge LLC',
      project: 'Oslo Ridge',
      billNumber: 'CA-2024-892',
      date: '2024-12-18',
      dueDate: '2025-01-02',
      status: 'pending',
      paidDate: null,
      items: [
        { description: 'HVAC rough-in - Units 1-4', quantity: 4, rate: 6500, amount: 26000, costCode: '23-100' },
        { description: 'Ductwork materials', quantity: 1, rate: 8500, amount: 8500, costCode: '23-100' },
      ],
      subtotal: 34500,
      tax: 0,
      total: 34500,
      amountPaid: 0,
      balance: 34500,
      notes: '',
      paymentTerms: 'Net 15',
      isIntercompany: false,
    },
  ]);

  const [formData, setFormData] = useState({
    vendor: '',
    entity: 'Watson Creek LLC',
    project: '',
    billNumber: '',
    dueDate: '',
    items: [{ description: '', quantity: 1, rate: '', amount: '', costCode: '' }],
    notes: '',
    paymentTerms: 'Net 15',
    isIntercompany: false,
  });

  const filteredBills = bills.filter(bill => {
    if (filterStatus === 'all') return true;
    return bill.status === filterStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-600';
      case 'approved': return 'bg-blue-100 text-blue-700';
      case 'paid': return 'bg-green-100 text-green-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      case 'partial': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const totalPayable = bills.filter(b => b.status !== 'paid').reduce((sum, b) => sum + b.balance, 0);
  const totalOverdue = bills.filter(b => b.status === 'overdue').reduce((sum, b) => sum + b.balance, 0);
  const paidThisMonth = bills.filter(b => b.status === 'paid' && b.paidDate?.startsWith('2024-12')).reduce((sum, b) => sum + b.total, 0);
  const pendingApproval = bills.filter(b => b.status === 'pending').length;

  // Aging buckets
  const aging = {
    current: bills.filter(b => b.status !== 'paid' && new Date(b.dueDate) >= new Date()).reduce((s, b) => s + b.balance, 0),
    days30: bills.filter(b => b.status === 'overdue').reduce((s, b) => s + b.balance, 0),
  };

  const updateLineItem = (idx, field, value) => {
    const newItems = [...formData.items];
    newItems[idx][field] = value;
    if (field === 'quantity' || field === 'rate') {
      const qty = parseFloat(newItems[idx].quantity) || 0;
      const rate = parseFloat(newItems[idx].rate) || 0;
      newItems[idx].amount = qty * rate;
    }
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addLineItem = () => {
    setFormData(prev => ({ ...prev, items: [...prev.items, { description: '', quantity: 1, rate: '', amount: '', costCode: '' }] }));
  };

  const handleSave = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const newBill = {
      id: `BILL-${String(bills.length + 1).padStart(3, '0')}`,
      ...formData,
      vendorId: 'V-NEW',
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      paidDate: null,
      subtotal,
      tax: 0,
      total: subtotal,
      amountPaid: 0,
      balance: subtotal,
    };
    setBills(prev => [newBill, ...prev]);
    setShowModal(false);
    setFormData({ vendor: '', entity: 'Watson Creek LLC', project: '', billNumber: '', dueDate: '', items: [{ description: '', quantity: 1, rate: '', amount: '', costCode: '' }], notes: '', paymentTerms: 'Net 15', isIntercompany: false });
  };

  const approveBill = (id) => {
    setBills(prev => prev.map(b => b.id === id ? { ...b, status: 'approved' } : b));
  };

  const payBill = (id) => {
    setBills(prev => prev.map(b => b.id === id ? { ...b, status: 'paid', paidDate: new Date().toISOString().split('T')[0], amountPaid: b.total, balance: 0 } : b));
    setShowPayModal(false);
    setSelectedBill(null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Bills</h1>
          <p className="text-sm text-gray-500">Accounts payable and vendor invoices</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-1" />New Bill
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Payable</p>
          <p className="text-2xl font-semibold">${totalPayable.toLocaleString()}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-red-500">
          <p className="text-sm text-gray-500">Overdue</p>
          <p className="text-2xl font-semibold text-red-600">${totalOverdue.toLocaleString()}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-sm text-gray-500">Paid This Month</p>
          <p className="text-2xl font-semibold text-green-600">${paidThisMonth.toLocaleString()}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-amber-500">
          <p className="text-sm text-gray-500">Pending Approval</p>
          <p className="text-2xl font-semibold text-amber-600">{pendingApproval}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Due This Week</p>
          <p className="text-2xl font-semibold">${(aging.current / 1000).toFixed(0)}K</p>
        </div>
      </div>

      {/* A/P Aging Summary */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <h3 className="font-medium mb-3">A/P Aging Summary</h3>
        <div className="flex gap-4">
          <div className="flex-1 bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Current</p>
            <p className="text-lg font-semibold text-green-700">${aging.current.toLocaleString()}</p>
          </div>
          <div className="flex-1 bg-amber-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">1-30 Days</p>
            <p className="text-lg font-semibold text-amber-700">${aging.days30.toLocaleString()}</p>
          </div>
          <div className="flex-1 bg-orange-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">31-60 Days</p>
            <p className="text-lg font-semibold text-orange-700">$0</p>
          </div>
          <div className="flex-1 bg-red-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">61-90 Days</p>
            <p className="text-lg font-semibold text-red-700">$0</p>
          </div>
          <div className="flex-1 bg-red-100 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">90+ Days</p>
            <p className="text-lg font-semibold text-red-800">$0</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search bills..." className="pl-9" />
          </div>
          <select className="border rounded-md px-3 py-2 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
          <select className="border rounded-md px-3 py-2 text-sm">
            <option value="">All Entities</option>
            <option>VanRock Holdings</option>
            <option>Watson Creek LLC</option>
            <option>Oslo Ridge LLC</option>
          </select>
          <select className="border rounded-md px-3 py-2 text-sm">
            <option value="">All Vendors</option>
            <option>Smith Framing LLC</option>
            <option>ABC Plumbing</option>
            <option>Sparks Electric</option>
          </select>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Bill #</th>
              <th className="text-left px-4 py-3 font-medium">Vendor</th>
              <th className="text-left px-4 py-3 font-medium">Entity / Project</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-left px-4 py-3 font-medium">Due Date</th>
              <th className="text-right px-4 py-3 font-medium">Total</th>
              <th className="text-right px-4 py-3 font-medium">Balance</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredBills.map((bill) => (
              <tr key={bill.id} className={cn("hover:bg-gray-50", bill.status === 'overdue' && "bg-red-50")}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#047857]">{bill.billNumber}</span>
                    {bill.isIntercompany && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">IC</span>}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">{bill.vendor}</td>
                <td className="px-4 py-3">
                  <p className="text-xs">{bill.entity}</p>
                  {bill.project && <p className="text-xs text-gray-500">{bill.project}</p>}
                </td>
                <td className="px-4 py-3">{bill.date}</td>
                <td className="px-4 py-3">
                  <span className={cn(bill.status === 'overdue' && "text-red-600 font-medium")}>
                    {bill.dueDate}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium">${bill.total.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <span className={cn("font-medium", bill.balance > 0 ? "text-amber-600" : "text-green-600")}>
                    ${bill.balance.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(bill.status))}>
                    {bill.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="p-1 hover:bg-gray-100 rounded" title="View" onClick={() => setSelectedBill(bill)}>
                      <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                    {bill.status === 'pending' && (
                      <button className="p-1 hover:bg-green-100 rounded" title="Approve" onClick={() => approveBill(bill.id)}>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </button>
                    )}
                    {bill.status === 'approved' && (
                      <button className="p-1 hover:bg-blue-100 rounded" title="Pay" onClick={() => { setSelectedBill(bill); setShowPayModal(true); }}>
                        <CreditCard className="w-4 h-4 text-blue-500" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Bill Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">New Bill</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Vendor *</label>
                  <select className="w-full border rounded-md px-3 py-2" value={formData.vendor} onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}>
                    <option value="">Select vendor...</option>
                    <option>Smith Framing LLC</option>
                    <option>ABC Plumbing</option>
                    <option>Sparks Electric</option>
                    <option>Cool Air HVAC</option>
                    <option>Ready Mix Concrete</option>
                    <option>ManageCo</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Vendor Bill # *</label>
                  <Input value={formData.billNumber} onChange={(e) => setFormData(prev => ({ ...prev, billNumber: e.target.value }))} placeholder="Vendor's invoice number" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Entity *</label>
                  <select className="w-full border rounded-md px-3 py-2" value={formData.entity} onChange={(e) => setFormData(prev => ({ ...prev, entity: e.target.value }))}>
                    <option>VanRock Holdings</option>
                    <option>Watson Creek LLC</option>
                    <option>Oslo Ridge LLC</option>
                    <option>Sunset Farms LLC</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Project</label>
                  <select className="w-full border rounded-md px-3 py-2" value={formData.project} onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}>
                    <option value="">None</option>
                    <option>Watson Creek</option>
                    <option>Oslo Ridge</option>
                    <option>Sunset Farms</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Due Date *</label>
                  <Input type="date" value={formData.dueDate} onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))} />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isIntercompany" checked={formData.isIntercompany} onChange={(e) => setFormData(prev => ({ ...prev, isIntercompany: e.target.checked }))} />
                  <label htmlFor="isIntercompany" className="text-sm">Intercompany Bill</label>
                </div>
                <div>
                  <label className="text-sm mr-2">Payment Terms:</label>
                  <select className="border rounded-md px-2 py-1 text-sm" value={formData.paymentTerms} onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}>
                    <option>Net 15</option>
                    <option>Net 30</option>
                    <option>Net 45</option>
                    <option>Due on Receipt</option>
                  </select>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <label className="text-sm font-medium block mb-2">Line Items</label>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium">Description</th>
                        <th className="text-left px-3 py-2 font-medium w-24">Cost Code</th>
                        <th className="text-right px-3 py-2 font-medium w-16">Qty</th>
                        <th className="text-right px-3 py-2 font-medium w-28">Rate</th>
                        <th className="text-right px-3 py-2 font-medium w-28">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-2 py-1">
                            <Input className="border-0 shadow-none" placeholder="Description" value={item.description} onChange={(e) => updateLineItem(idx, 'description', e.target.value)} />
                          </td>
                          <td className="px-2 py-1">
                            <Input className="border-0 shadow-none" placeholder="00-000" value={item.costCode} onChange={(e) => updateLineItem(idx, 'costCode', e.target.value)} />
                          </td>
                          <td className="px-2 py-1">
                            <Input type="number" className="border-0 shadow-none text-right" value={item.quantity} onChange={(e) => updateLineItem(idx, 'quantity', e.target.value)} />
                          </td>
                          <td className="px-2 py-1">
                            <Input type="number" className="border-0 shadow-none text-right" placeholder="0.00" value={item.rate} onChange={(e) => updateLineItem(idx, 'rate', e.target.value)} />
                          </td>
                          <td className="px-3 py-2 text-right font-medium">${(parseFloat(item.amount) || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t">
                      <tr>
                        <td colSpan={4} className="px-3 py-2 text-right font-semibold">Total:</td>
                        <td className="px-3 py-2 text-right font-semibold">
                          ${formData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <Button variant="outline" size="sm" className="mt-2" onClick={addLineItem}>
                  <Plus className="w-4 h-4 mr-1" />Add Line
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Notes</label>
                <textarea className="w-full border rounded-md px-3 py-2" rows={2} value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} placeholder="Internal notes..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 sticky bottom-0">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleSave}>Save Bill</Button>
            </div>
          </div>
        </div>
      )}

      {/* Bill Detail Modal */}
      {selectedBill && !showPayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <div>
                <h3 className="font-semibold">{selectedBill.billNumber}</h3>
                <p className="text-sm text-gray-500">{selectedBill.vendor}</p>
              </div>
              <button onClick={() => setSelectedBill(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className={cn("px-3 py-1 rounded text-sm capitalize", getStatusColor(selectedBill.status))}>
                  {selectedBill.status}
                </span>
                {selectedBill.paidDate && <span className="text-sm text-green-600">Paid on {selectedBill.paidDate}</span>}
                {selectedBill.isIntercompany && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Intercompany</span>}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Vendor</p>
                  <p className="font-semibold">{selectedBill.vendor}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Entity</p>
                  <p className="font-semibold">{selectedBill.entity}</p>
                  {selectedBill.project && <p className="text-sm text-gray-600">{selectedBill.project}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Bill Date</p>
                  <p className="font-medium">{selectedBill.date}</p>
                </div>
                <div>
                  <p className="text-gray-500">Due Date</p>
                  <p className={cn("font-medium", selectedBill.status === 'overdue' && "text-red-600")}>{selectedBill.dueDate}</p>
                </div>
                <div>
                  <p className="text-gray-500">Terms</p>
                  <p className="font-medium">{selectedBill.paymentTerms}</p>
                </div>
              </div>

              {/* Line Items */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2">Description</th>
                      <th className="text-left px-3 py-2">Cost Code</th>
                      <th className="text-right px-3 py-2">Qty</th>
                      <th className="text-right px-3 py-2">Rate</th>
                      <th className="text-right px-3 py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBill.items.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-3 py-2">{item.description}</td>
                        <td className="px-3 py-2 font-mono text-xs">{item.costCode}</td>
                        <td className="px-3 py-2 text-right">{item.quantity}</td>
                        <td className="px-3 py-2 text-right">${item.rate.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right font-medium">${item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr className="border-t">
                      <td colSpan={4} className="px-3 py-2 text-right font-semibold">Total</td>
                      <td className="px-3 py-2 text-right font-semibold">${selectedBill.total.toLocaleString()}</td>
                    </tr>
                    {selectedBill.amountPaid > 0 && (
                      <tr>
                        <td colSpan={4} className="px-3 py-2 text-right text-green-600">Paid</td>
                        <td className="px-3 py-2 text-right text-green-600">-${selectedBill.amountPaid.toLocaleString()}</td>
                      </tr>
                    )}
                    <tr className="border-t">
                      <td colSpan={4} className="px-3 py-2 text-right font-semibold">Balance Due</td>
                      <td className={cn("px-3 py-2 text-right font-semibold", selectedBill.balance > 0 ? "text-amber-600" : "text-green-600")}>
                        ${selectedBill.balance.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {selectedBill.notes && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-sm">{selectedBill.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
              <Button variant="outline" size="sm"><FileText className="w-4 h-4 mr-1" />View Attachment</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedBill(null)}>Close</Button>
                {selectedBill.status === 'pending' && (
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => approveBill(selectedBill.id)}>
                    <CheckCircle className="w-4 h-4 mr-1" />Approve
                  </Button>
                )}
                {selectedBill.status === 'approved' && (
                  <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setShowPayModal(true)}>
                    <CreditCard className="w-4 h-4 mr-1" />Pay Bill
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pay Bill Modal */}
      {showPayModal && selectedBill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Pay Bill</h3>
              <button onClick={() => { setShowPayModal(false); setSelectedBill(null); }}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500">Amount Due</p>
                <p className="text-3xl font-semibold text-[#047857]">${selectedBill.balance.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">{selectedBill.vendor}</p>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Payment Date</label>
                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Payment Method</label>
                <select className="w-full border rounded-md px-3 py-2">
                  <option>Check</option>
                  <option>ACH Transfer</option>
                  <option>Wire Transfer</option>
                  <option>Credit Card</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Bank Account</label>
                <select className="w-full border rounded-md px-3 py-2">
                  <option>Operating Account - ****4521</option>
                  <option>Project Account - ****7832</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Reference / Check #</label>
                <Input placeholder="e.g., Check #4522" />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => { setShowPayModal(false); setSelectedBill(null); }}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => payBill(selectedBill.id)}>
                <CheckCircle className="w-4 h-4 mr-1" />Record Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillsPage;
