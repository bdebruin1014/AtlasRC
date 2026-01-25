import React, { useState, useMemo } from 'react';
import {
  FileText, CheckCircle, XCircle, Clock, AlertTriangle, User,
  DollarSign, Building, Calendar, Filter, Search, Eye, ThumbsUp,
  ThumbsDown, MessageSquare, ChevronRight, MoreVertical, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const mockInvoices = [
  {
    id: 'INV-2024-0892',
    vendor: 'ABC Construction Co.',
    vendorId: 'V-001',
    description: 'Phase 2 construction services - Riverside Plaza',
    amount: 125000.00,
    invoiceDate: '2024-01-15',
    dueDate: '2024-02-14',
    submittedDate: '2024-01-18',
    submittedBy: 'Tom Davis',
    property: 'Riverside Plaza',
    glAccount: '6100 - Construction Expense',
    status: 'pending_approval',
    currentApprover: 'Sarah Johnson',
    approvalChain: [
      { name: 'Tom Davis', role: 'AP Clerk', action: 'submitted', date: '2024-01-18', comment: 'Invoice verified against PO #4521' },
      { name: 'Sarah Johnson', role: 'Controller', action: 'pending', date: null, comment: null },
      { name: 'Mike Chen', role: 'CFO', action: 'pending', date: null, comment: null }
    ],
    attachments: ['invoice_scan.pdf', 'po_4521.pdf'],
    poNumber: 'PO-4521',
    priority: 'high'
  },
  {
    id: 'INV-2024-0891',
    vendor: 'Elite Property Services',
    vendorId: 'V-012',
    description: 'January maintenance services',
    amount: 8500.00,
    invoiceDate: '2024-01-12',
    dueDate: '2024-02-11',
    submittedDate: '2024-01-14',
    submittedBy: 'Tom Davis',
    property: 'Downtown Tower',
    glAccount: '6200 - Maintenance Expense',
    status: 'approved',
    currentApprover: null,
    approvalChain: [
      { name: 'Tom Davis', role: 'AP Clerk', action: 'submitted', date: '2024-01-14', comment: 'Monthly recurring invoice' },
      { name: 'Sarah Johnson', role: 'Controller', action: 'approved', date: '2024-01-15', comment: 'Approved per contract' }
    ],
    attachments: ['invoice_jan_maint.pdf'],
    poNumber: null,
    priority: 'normal'
  },
  {
    id: 'INV-2024-0890',
    vendor: 'Johnson Legal Group',
    vendorId: 'V-008',
    description: 'Legal services - Oak Street acquisition',
    amount: 45000.00,
    invoiceDate: '2024-01-10',
    dueDate: '2024-02-09',
    submittedDate: '2024-01-12',
    submittedBy: 'Lisa Wang',
    property: 'Corporate',
    glAccount: '6500 - Legal & Professional',
    status: 'rejected',
    currentApprover: null,
    approvalChain: [
      { name: 'Lisa Wang', role: 'AP Clerk', action: 'submitted', date: '2024-01-12', comment: null },
      { name: 'Sarah Johnson', role: 'Controller', action: 'rejected', date: '2024-01-13', comment: 'Missing detailed breakdown of hours. Please request itemized statement.' }
    ],
    attachments: ['legal_invoice.pdf'],
    poNumber: null,
    priority: 'normal'
  },
  {
    id: 'INV-2024-0889',
    vendor: 'TechSmart Solutions',
    vendorId: 'V-015',
    description: 'Security system upgrade - All properties',
    amount: 78500.00,
    invoiceDate: '2024-01-08',
    dueDate: '2024-02-07',
    submittedDate: '2024-01-10',
    submittedBy: 'Tom Davis',
    property: 'Multiple',
    glAccount: '6300 - Security Expense',
    status: 'pending_approval',
    currentApprover: 'Mike Chen',
    approvalChain: [
      { name: 'Tom Davis', role: 'AP Clerk', action: 'submitted', date: '2024-01-10', comment: 'Matches approved capital budget' },
      { name: 'Sarah Johnson', role: 'Controller', action: 'approved', date: '2024-01-11', comment: 'Budget verified' },
      { name: 'Mike Chen', role: 'CFO', action: 'pending', date: null, comment: null }
    ],
    attachments: ['tech_invoice.pdf', 'scope_of_work.pdf', 'budget_approval.pdf'],
    poNumber: 'PO-4498',
    priority: 'high'
  }
];

const statusConfig = {
  pending_approval: { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
  on_hold: { label: 'On Hold', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle }
};

const priorityConfig = {
  high: { label: 'High', color: 'text-red-600 bg-red-50' },
  normal: { label: 'Normal', color: 'text-gray-600 bg-gray-50' },
  low: { label: 'Low', color: 'text-blue-600 bg-blue-50' }
};

export default function InvoiceApprovalWorkflowPage() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(mockInvoices[0]);

  const filteredInvoices = useMemo(() => {
    return mockInvoices.filter(inv => {
      const matchesFilter = filter === 'all' || inv.status === filter;
      const matchesSearch = inv.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchTerm]);

  const stats = useMemo(() => ({
    pending: mockInvoices.filter(i => i.status === 'pending_approval').length,
    pendingAmount: mockInvoices.filter(i => i.status === 'pending_approval').reduce((sum, i) => sum + i.amount, 0),
    approved: mockInvoices.filter(i => i.status === 'approved').length,
    rejected: mockInvoices.filter(i => i.status === 'rejected').length
  }), []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoice Approval Workflow</h1>
          <p className="text-gray-600">Review and approve vendor invoices</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <FileText className="w-4 h-4 mr-2" />Submit New Invoice
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
              <p className="text-sm text-gray-600">Pending Amount</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              <p className="text-sm text-gray-600">Approved This Week</p>
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
          <Input placeholder="Search invoices..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
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
          {filteredInvoices.map((invoice) => (
            <div
              key={invoice.id}
              onClick={() => setSelectedInvoice(invoice)}
              className={cn(
                "bg-white rounded-lg border p-4 cursor-pointer hover:border-blue-300 transition-colors",
                selectedInvoice?.id === invoice.id ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-900">{invoice.vendor}</p>
                  <p className="text-sm text-gray-500">{invoice.id}</p>
                </div>
                <span className={cn("px-2 py-0.5 rounded text-xs", priorityConfig[invoice.priority].color)}>{invoice.priority}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2 line-clamp-1">{invoice.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">${invoice.amount.toLocaleString()}</span>
                <span className={cn("px-2 py-0.5 rounded text-xs", statusConfig[invoice.status].color)}>{statusConfig[invoice.status].label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-2">
          {selectedInvoice && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-gray-900">{selectedInvoice.id}</h2>
                      <span className={cn("px-2 py-1 rounded-full text-xs", statusConfig[selectedInvoice.status].color)}>{statusConfig[selectedInvoice.status].label}</span>
                    </div>
                    <p className="text-gray-600">{selectedInvoice.vendor}</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">${selectedInvoice.amount.toLocaleString()}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><p className="text-gray-500">Invoice Date</p><p className="font-medium">{selectedInvoice.invoiceDate}</p></div>
                  <div><p className="text-gray-500">Due Date</p><p className="font-medium">{selectedInvoice.dueDate}</p></div>
                  <div><p className="text-gray-500">Property</p><p className="font-medium">{selectedInvoice.property}</p></div>
                  <div><p className="text-gray-500">GL Account</p><p className="font-medium">{selectedInvoice.glAccount}</p></div>
                  <div><p className="text-gray-500">PO Number</p><p className="font-medium">{selectedInvoice.poNumber || 'N/A'}</p></div>
                  <div><p className="text-gray-500">Submitted By</p><p className="font-medium">{selectedInvoice.submittedBy}</p></div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{selectedInvoice.description}</p>
                </div>
              </div>

              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Approval Workflow</h3>
                <div className="space-y-4">
                  {selectedInvoice.approvalChain.map((step, idx) => (
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
                            <p className="text-sm text-gray-500">{step.role}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium capitalize">{step.action}</p>
                            {step.date && <p className="text-xs text-gray-500">{step.date}</p>}
                          </div>
                        </div>
                        {step.comment && <p className="mt-1 text-sm text-gray-600 bg-gray-50 p-2 rounded">{step.comment}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedInvoice.status === 'pending_approval' && (
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
