import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit2, X, Send, Download, Printer, DollarSign, Clock, CheckCircle, AlertTriangle, FileText, Mail, MoreHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const InvoicesPage = ({ onEntityChange, selectedEntity }) => {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [invoiceToSend, setInvoiceToSend] = useState(null);
  const [sendingInvoice, setSendingInvoice] = useState(false);
  const [sendFormData, setSendFormData] = useState({
    toEmail: '',
    ccEmail: '',
    subject: '',
    message: '',
  });

  const [invoices, setInvoices] = useState([
    {
      id: 'INV-2024-001',
      customer: 'ABC Investments LLC',
      customerEmail: 'accounts@abcinvest.com',
      entity: 'VanRock Holdings',
      project: 'Watson Creek',
      date: '2024-12-01',
      dueDate: '2024-12-31',
      status: 'paid',
      paidDate: '2024-12-15',
      items: [
        { description: 'Lot 1 - Final Payment', quantity: 1, rate: 125000, amount: 125000 },
        { description: 'HOA Setup Fee', quantity: 1, rate: 2500, amount: 2500 },
      ],
      subtotal: 127500,
      tax: 0,
      total: 127500,
      amountPaid: 127500,
      balance: 0,
      notes: 'Thank you for your purchase!',
      isIntercompany: false,
    },
    {
      id: 'INV-2024-002',
      customer: 'Smith Family Trust',
      customerEmail: 'trust@smithfamily.com',
      entity: 'VanRock Holdings',
      project: 'Watson Creek',
      date: '2024-12-10',
      dueDate: '2025-01-09',
      status: 'sent',
      paidDate: null,
      items: [
        { description: 'Lot 5 - Earnest Money', quantity: 1, rate: 25000, amount: 25000 },
      ],
      subtotal: 25000,
      tax: 0,
      total: 25000,
      amountPaid: 0,
      balance: 25000,
      notes: 'Earnest money deposit for Lot 5',
      isIntercompany: false,
    },
    {
      id: 'INV-2024-003',
      customer: 'Denver RE Partners',
      customerEmail: 'ap@denverrepart.com',
      entity: 'VanRock Holdings',
      project: 'Oslo Ridge',
      date: '2024-12-15',
      dueDate: '2025-01-14',
      status: 'sent',
      paidDate: null,
      items: [
        { description: 'Unit 3 - Progress Draw #2', quantity: 1, rate: 85000, amount: 85000 },
      ],
      subtotal: 85000,
      tax: 0,
      total: 85000,
      amountPaid: 0,
      balance: 85000,
      notes: '',
      isIntercompany: false,
    },
    {
      id: 'INV-2024-004',
      customer: 'VanRock Holdings',
      customerEmail: 'accounting@vanrock.com',
      entity: 'ManageCo',
      project: null,
      date: '2024-12-01',
      dueDate: '2024-12-31',
      status: 'paid',
      paidDate: '2024-12-20',
      items: [
        { description: 'Q4 2024 Management Fee', quantity: 1, rate: 45000, amount: 45000 },
        { description: 'Asset Management - Watson Creek', quantity: 1, rate: 12500, amount: 12500 },
        { description: 'Asset Management - Oslo Ridge', quantity: 1, rate: 10000, amount: 10000 },
      ],
      subtotal: 67500,
      tax: 0,
      total: 67500,
      amountPaid: 67500,
      balance: 0,
      notes: 'Quarterly management services',
      isIntercompany: true,
    },
    {
      id: 'INV-2024-005',
      customer: 'Quick Close Homes',
      customerEmail: 'orders@quickclose.com',
      entity: 'VanRock Holdings',
      project: 'Watson Creek',
      date: '2024-12-20',
      dueDate: '2025-01-19',
      status: 'draft',
      paidDate: null,
      items: [
        { description: 'Lot 8 - Contract Price', quantity: 1, rate: 145000, amount: 145000 },
        { description: 'Premium Lot Fee', quantity: 1, rate: 15000, amount: 15000 },
      ],
      subtotal: 160000,
      tax: 0,
      total: 160000,
      amountPaid: 0,
      balance: 160000,
      notes: 'Pending contract execution',
      isIntercompany: false,
    },
    {
      id: 'INV-2024-006',
      customer: 'Mountain View Builders',
      customerEmail: 'billing@mvbuilders.com',
      entity: 'VanRock Holdings',
      project: 'Sunset Farms',
      date: '2024-11-15',
      dueDate: '2024-12-15',
      status: 'overdue',
      paidDate: null,
      items: [
        { description: 'Lot 12 - Balance Due', quantity: 1, rate: 95000, amount: 95000 },
      ],
      subtotal: 95000,
      tax: 0,
      total: 95000,
      amountPaid: 0,
      balance: 95000,
      notes: 'OVERDUE - Please remit immediately',
      isIntercompany: false,
    },
  ]);

  const [formData, setFormData] = useState({
    customer: '',
    customerEmail: '',
    entity: 'VanRock Holdings',
    project: '',
    dueDate: '',
    items: [{ description: '', quantity: 1, rate: '', amount: '' }],
    notes: '',
    isIntercompany: false,
    discountType: 'none', // none, percentage, amount
    discountValue: '',
  });

  const subtotal = formData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const discountAmount = formData.discountType === 'none' || !formData.discountValue
    ? 0
    : formData.discountType === 'percentage'
      ? (subtotal * (parseFloat(formData.discountValue) || 0)) / 100
      : parseFloat(formData.discountValue) || 0;
  const invoiceTotal = subtotal - discountAmount;

  const filteredInvoices = invoices.filter(inv => {
    if (filterStatus === 'all') return true;
    return inv.status === filterStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-600';
      case 'sent': return 'bg-blue-100 text-blue-700';
      case 'paid': return 'bg-green-100 text-green-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      case 'partial': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const totalOutstanding = invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.balance, 0);
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.balance, 0);
  const paidThisMonth = invoices.filter(i => i.status === 'paid' && i.paidDate?.startsWith('2024-12')).reduce((sum, i) => sum + i.total, 0);
  const draftCount = invoices.filter(i => i.status === 'draft').length;

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
    setFormData(prev => ({ ...prev, items: [...prev.items, { description: '', quantity: 1, rate: '', amount: '' }] }));
  };

  const openSendDialog = (invoice) => {
    setInvoiceToSend(invoice);
    setSendFormData({
      toEmail: invoice.customerEmail || '',
      ccEmail: '',
      subject: `Invoice ${invoice.id} from ${invoice.entity}`,
      message: `Dear ${invoice.customer},\n\nPlease find attached Invoice ${invoice.id} for $${invoice.total?.toLocaleString() || invoice.subtotal?.toLocaleString()}.\n\nPayment is due by ${invoice.dueDate}.\n\nThank you for your business.\n\nBest regards,\n${invoice.entity}`,
    });
    setShowSendDialog(true);
  };

  const handleSendInvoice = async () => {
    if (!sendFormData.toEmail) {
      toast({
        variant: 'destructive',
        title: 'Email Required',
        description: 'Please enter a recipient email address.',
      });
      return;
    }

    setSendingInvoice(true);
    try {
      // Simulate sending email
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update invoice status to 'sent'
      setInvoices(prev => prev.map(inv =>
        inv.id === invoiceToSend.id
          ? { ...inv, status: 'sent', sentAt: new Date().toISOString(), sentTo: sendFormData.toEmail }
          : inv
      ));

      toast({
        title: 'Invoice Sent',
        description: `Invoice ${invoiceToSend.id} has been sent to ${sendFormData.toEmail}`,
      });

      setShowSendDialog(false);
      setInvoiceToSend(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Send Failed',
        description: 'Failed to send invoice. Please try again.',
      });
    } finally {
      setSendingInvoice(false);
    }
  };

  const handleSave = (status = 'draft') => {
    const newInvoice = {
      id: `INV-2024-${String(invoices.length + 1).padStart(3, '0')}`,
      ...formData,
      date: new Date().toISOString().split('T')[0],
      status,
      paidDate: null,
      subtotal,
      discountType: formData.discountType,
      discountValue: formData.discountValue ? parseFloat(formData.discountValue) : null,
      discountAmount,
      tax: 0,
      total: invoiceTotal,
      amountPaid: 0,
      balance: invoiceTotal,
    };
    setInvoices(prev => [newInvoice, ...prev]);
    setShowModal(false);
    setFormData({ customer: '', customerEmail: '', entity: 'VanRock Holdings', project: '', dueDate: '', items: [{ description: '', quantity: 1, rate: '', amount: '' }], notes: '', isIntercompany: false, discountType: 'none', discountValue: '' });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Invoices</h1>
          <p className="text-sm text-gray-500">Accounts receivable and billing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-1" />New Invoice
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Outstanding</p>
          <p className="text-2xl font-semibold">${totalOutstanding.toLocaleString()}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-red-500">
          <p className="text-sm text-gray-500">Overdue</p>
          <p className="text-2xl font-semibold text-red-600">${totalOverdue.toLocaleString()}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-sm text-gray-500">Collected This Month</p>
          <p className="text-2xl font-semibold text-green-600">${paidThisMonth.toLocaleString()}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Drafts</p>
          <p className="text-2xl font-semibold">{draftCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search invoices..." className="pl-9" />
          </div>
          <select className="border rounded-md px-3 py-2 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
          <select className="border rounded-md px-3 py-2 text-sm">
            <option value="">All Entities</option>
            <option>VanRock Holdings</option>
            <option>ManageCo</option>
            <option>Watson Creek LLC</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Invoice #</th>
              <th className="text-left px-4 py-3 font-medium">Customer</th>
              <th className="text-left px-4 py-3 font-medium">Entity</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-left px-4 py-3 font-medium">Due Date</th>
              <th className="text-right px-4 py-3 font-medium">Total</th>
              <th className="text-right px-4 py-3 font-medium">Balance</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id} className={cn("hover:bg-gray-50", invoice.status === 'overdue' && "bg-red-50")}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#047857]">{invoice.id}</span>
                    {invoice.isIntercompany && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">IC</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{invoice.customer}</p>
                  {invoice.project && <p className="text-xs text-gray-500">{invoice.project}</p>}
                </td>
                <td className="px-4 py-3 text-xs">{invoice.entity}</td>
                <td className="px-4 py-3">{invoice.date}</td>
                <td className="px-4 py-3">
                  <span className={cn(invoice.status === 'overdue' && "text-red-600 font-medium")}>
                    {invoice.dueDate}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium">${invoice.total.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <span className={cn("font-medium", invoice.balance > 0 ? "text-amber-600" : "text-green-600")}>
                    ${invoice.balance.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(invoice.status))}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="p-1 hover:bg-gray-100 rounded" title="View" onClick={() => setSelectedInvoice(invoice)}>
                      <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                    {(invoice.status === 'draft' || invoice.status === 'sent') && invoice.balance > 0 && (
                      <button
                        className="p-1 hover:bg-blue-100 rounded"
                        title={invoice.status === 'draft' ? 'Send' : 'Resend'}
                        onClick={() => openSendDialog(invoice)}
                      >
                        <Send className="w-4 h-4 text-blue-500" />
                      </button>
                    )}
                    <button className="p-1 hover:bg-gray-100 rounded" title="Print">
                      <Printer className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">New Invoice</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Customer *</label>
                  <Input value={formData.customer} onChange={(e) => setFormData(prev => ({ ...prev, customer: e.target.value }))} placeholder="Customer name" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Customer Email</label>
                  <Input type="email" value={formData.customerEmail} onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))} placeholder="email@example.com" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Entity *</label>
                  <select className="w-full border rounded-md px-3 py-2" value={formData.entity} onChange={(e) => setFormData(prev => ({ ...prev, entity: e.target.value }))}>
                    <option>VanRock Holdings</option>
                    <option>ManageCo</option>
                    <option>Watson Creek LLC</option>
                    <option>Oslo Ridge LLC</option>
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
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isIntercompany" checked={formData.isIntercompany} onChange={(e) => setFormData(prev => ({ ...prev, isIntercompany: e.target.checked }))} />
                <label htmlFor="isIntercompany" className="text-sm">Intercompany Invoice</label>
              </div>

              {/* Line Items */}
              <div>
                <label className="text-sm font-medium block mb-2">Line Items</label>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium">Description</th>
                        <th className="text-right px-3 py-2 font-medium w-20">Qty</th>
                        <th className="text-right px-3 py-2 font-medium w-32">Rate</th>
                        <th className="text-right px-3 py-2 font-medium w-32">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-2 py-1">
                            <Input className="border-0 shadow-none" placeholder="Description" value={item.description} onChange={(e) => updateLineItem(idx, 'description', e.target.value)} />
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
                        <td colSpan={3} className="px-3 py-2 text-right">Subtotal:</td>
                        <td className="px-3 py-2 text-right">
                          ${subtotal.toLocaleString()}
                        </td>
                      </tr>
                      {discountAmount > 0 && (
                        <tr>
                          <td colSpan={3} className="px-3 py-2 text-right text-green-600">
                            Discount ({formData.discountType === 'percentage' ? `${formData.discountValue}%` : 'Fixed'}):
                          </td>
                          <td className="px-3 py-2 text-right text-green-600">
                            -${discountAmount.toLocaleString()}
                          </td>
                        </tr>
                      )}
                      <tr className="border-t">
                        <td colSpan={3} className="px-3 py-2 text-right font-semibold">Total:</td>
                        <td className="px-3 py-2 text-right font-semibold">
                          ${invoiceTotal.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <Button variant="outline" size="sm" className="mt-2" onClick={addLineItem}>
                  <Plus className="w-4 h-4 mr-1" />Add Line
                </Button>
              </div>

              {/* Discount */}
              <div>
                <label className="text-sm font-medium block mb-2">Discount</label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Type</label>
                    <select
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      value={formData.discountType}
                      onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value }))}
                    >
                      <option value="none">No Discount</option>
                      <option value="percentage">Percentage (%)</option>
                      <option value="amount">Fixed Amount ($)</option>
                    </select>
                  </div>
                  {formData.discountType !== 'none' && (
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        {formData.discountType === 'percentage' ? 'Percentage' : 'Amount'}
                      </label>
                      <div className="relative">
                        {formData.discountType === 'amount' && (
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        )}
                        <Input
                          type="number"
                          step={formData.discountType === 'percentage' ? '0.1' : '0.01'}
                          placeholder={formData.discountType === 'percentage' ? '0' : '0.00'}
                          className={formData.discountType === 'amount' ? 'pl-7' : ''}
                          value={formData.discountValue}
                          onChange={(e) => setFormData(prev => ({ ...prev, discountValue: e.target.value }))}
                        />
                        {formData.discountType === 'percentage' && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                        )}
                      </div>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="flex items-end">
                      <p className="text-sm text-green-600 pb-2">Saves: ${discountAmount.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Notes</label>
                <textarea className="w-full border rounded-md px-3 py-2" rows={2} value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} placeholder="Notes to customer..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 sticky bottom-0">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="outline" onClick={() => handleSave('draft')}>Save as Draft</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => handleSave('sent')}>
                <Send className="w-4 h-4 mr-1" />Send Invoice
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <div>
                <h3 className="font-semibold">{selectedInvoice.id}</h3>
                {selectedInvoice.isIntercompany && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Intercompany</span>}
              </div>
              <button onClick={() => setSelectedInvoice(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className={cn("px-3 py-1 rounded text-sm capitalize", getStatusColor(selectedInvoice.status))}>
                  {selectedInvoice.status}
                </span>
                {selectedInvoice.paidDate && <span className="text-sm text-green-600">Paid on {selectedInvoice.paidDate}</span>}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Bill To</p>
                  <p className="font-semibold">{selectedInvoice.customer}</p>
                  <p className="text-sm text-gray-600">{selectedInvoice.customerEmail}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">From</p>
                  <p className="font-semibold">{selectedInvoice.entity}</p>
                  {selectedInvoice.project && <p className="text-sm text-gray-600">{selectedInvoice.project}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Invoice Date</p>
                  <p className="font-medium">{selectedInvoice.date}</p>
                </div>
                <div>
                  <p className="text-gray-500">Due Date</p>
                  <p className={cn("font-medium", selectedInvoice.status === 'overdue' && "text-red-600")}>{selectedInvoice.dueDate}</p>
                </div>
              </div>

              {/* Line Items */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2">Description</th>
                      <th className="text-right px-3 py-2">Qty</th>
                      <th className="text-right px-3 py-2">Rate</th>
                      <th className="text-right px-3 py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-3 py-2">{item.description}</td>
                        <td className="px-3 py-2 text-right">{item.quantity}</td>
                        <td className="px-3 py-2 text-right">${item.rate.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right font-medium">${item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr className="border-t">
                      <td colSpan={3} className="px-3 py-2 text-right">Subtotal</td>
                      <td className="px-3 py-2 text-right">${selectedInvoice.subtotal.toLocaleString()}</td>
                    </tr>
                    {selectedInvoice.discountAmount > 0 && (
                      <tr>
                        <td colSpan={3} className="px-3 py-2 text-right text-green-600">
                          Discount ({selectedInvoice.discountType === 'percentage' ? `${selectedInvoice.discountValue}%` : 'Fixed'})
                        </td>
                        <td className="px-3 py-2 text-right text-green-600">-${selectedInvoice.discountAmount.toLocaleString()}</td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={3} className="px-3 py-2 text-right font-semibold">Total</td>
                      <td className="px-3 py-2 text-right font-semibold">${selectedInvoice.total.toLocaleString()}</td>
                    </tr>
                    {selectedInvoice.amountPaid > 0 && (
                      <tr>
                        <td colSpan={3} className="px-3 py-2 text-right text-green-600">Paid</td>
                        <td className="px-3 py-2 text-right text-green-600">-${selectedInvoice.amountPaid.toLocaleString()}</td>
                      </tr>
                    )}
                    <tr className="border-t">
                      <td colSpan={3} className="px-3 py-2 text-right font-semibold">Balance Due</td>
                      <td className={cn("px-3 py-2 text-right font-semibold", selectedInvoice.balance > 0 ? "text-amber-600" : "text-green-600")}>
                        ${selectedInvoice.balance.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {selectedInvoice.notes && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-sm">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
              <div className="flex gap-2">
                <Button variant="outline" size="sm"><Printer className="w-4 h-4 mr-1" />Print</Button>
                <Button variant="outline" size="sm" onClick={() => openSendDialog(selectedInvoice)}>
                  <Mail className="w-4 h-4 mr-1" />Email
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedInvoice(null)}>Close</Button>
                {selectedInvoice.balance > 0 && (
                  <Button className="bg-[#047857] hover:bg-[#065f46]">Record Payment</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Invoice Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-500" />
              Send Invoice
            </DialogTitle>
            <DialogDescription>
              Send invoice {invoiceToSend?.id} to the customer via email.
            </DialogDescription>
          </DialogHeader>

          {invoiceToSend && (
            <div className="space-y-4 py-4">
              {/* Invoice Summary */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Invoice:</span>
                  <span className="font-medium">{invoiceToSend.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer:</span>
                  <span>{invoiceToSend.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount:</span>
                  <span className="font-semibold">${invoiceToSend.total?.toLocaleString()}</span>
                </div>
              </div>

              {/* Email Form */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium block mb-1">To *</label>
                  <Input
                    type="email"
                    placeholder="customer@email.com"
                    value={sendFormData.toEmail}
                    onChange={(e) => setSendFormData(prev => ({ ...prev, toEmail: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">CC</label>
                  <Input
                    type="email"
                    placeholder="cc@email.com (optional)"
                    value={sendFormData.ccEmail}
                    onChange={(e) => setSendFormData(prev => ({ ...prev, ccEmail: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Subject</label>
                  <Input
                    value={sendFormData.subject}
                    onChange={(e) => setSendFormData(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Message</label>
                  <textarea
                    className="w-full border rounded-md px-3 py-2 text-sm min-h-[120px]"
                    value={sendFormData.message}
                    onChange={(e) => setSendFormData(prev => ({ ...prev, message: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FileText className="w-4 h-4" />
                <span>Invoice PDF will be attached automatically</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)} disabled={sendingInvoice}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSendInvoice}
              disabled={sendingInvoice}
            >
              {sendingInvoice ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1" />Send Invoice
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoicesPage;
