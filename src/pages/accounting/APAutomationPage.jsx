import React, { useState, useMemo } from 'react';
import {
  Zap, FileText, CheckCircle, XCircle, Clock, AlertTriangle,
  DollarSign, Upload, Eye, Play, Pause, Settings, RefreshCw,
  Mail, Building, Calendar, Filter, Search, MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const mockInvoiceQueue = [
  {
    id: 'Q-001',
    fileName: 'INV-ABC-2024-0125.pdf',
    vendor: 'ABC Construction Co.',
    vendorConfidence: 98,
    invoiceNumber: 'INV-2024-0125',
    invoiceDate: '2024-01-20',
    dueDate: '2024-02-19',
    amount: 45000.00,
    amountConfidence: 95,
    glAccount: '6100 - Construction Expense',
    glConfidence: 87,
    property: 'Riverside Plaza',
    propertyConfidence: 92,
    status: 'pending_review',
    receivedDate: '2024-01-22',
    receivedVia: 'email',
    ocrStatus: 'completed',
    matchedPO: 'PO-2024-0489',
    poMatchConfidence: 94,
    flags: []
  },
  {
    id: 'Q-002',
    fileName: 'elite_services_jan.pdf',
    vendor: 'Elite Property Services',
    vendorConfidence: 99,
    invoiceNumber: 'EPS-JAN-2024',
    invoiceDate: '2024-01-15',
    dueDate: '2024-02-14',
    amount: 8500.00,
    amountConfidence: 99,
    glAccount: '6200 - Maintenance Expense',
    glConfidence: 95,
    property: 'Downtown Tower',
    propertyConfidence: 98,
    status: 'auto_approved',
    receivedDate: '2024-01-18',
    receivedVia: 'portal',
    ocrStatus: 'completed',
    matchedPO: null,
    poMatchConfidence: null,
    flags: ['recurring_vendor']
  },
  {
    id: 'Q-003',
    fileName: 'scan_20240121_utility.pdf',
    vendor: null,
    vendorConfidence: 45,
    invoiceNumber: 'UNKNOWN',
    invoiceDate: '2024-01-10',
    dueDate: '2024-02-09',
    amount: 3250.00,
    amountConfidence: 78,
    glAccount: null,
    glConfidence: 0,
    property: null,
    propertyConfidence: 0,
    status: 'needs_attention',
    receivedDate: '2024-01-21',
    receivedVia: 'scan',
    ocrStatus: 'completed',
    matchedPO: null,
    poMatchConfidence: null,
    flags: ['low_confidence', 'missing_vendor', 'missing_gl']
  },
  {
    id: 'Q-004',
    fileName: 'johnson_legal_dec.pdf',
    vendor: 'Johnson Legal Group',
    vendorConfidence: 96,
    invoiceNumber: 'JLG-2023-1245',
    invoiceDate: '2023-12-28',
    dueDate: '2024-01-27',
    amount: 12500.00,
    amountConfidence: 92,
    glAccount: '6500 - Legal & Professional',
    glConfidence: 89,
    property: 'Corporate',
    propertyConfidence: 85,
    status: 'pending_review',
    receivedDate: '2024-01-02',
    receivedVia: 'email',
    ocrStatus: 'completed',
    matchedPO: null,
    poMatchConfidence: null,
    flags: ['overdue']
  },
  {
    id: 'Q-005',
    fileName: 'security_cameras_upgrade.pdf',
    vendor: 'SecureTech Systems',
    vendorConfidence: 94,
    invoiceNumber: 'STS-2024-0089',
    invoiceDate: '2024-01-18',
    dueDate: '2024-02-17',
    amount: 28750.00,
    amountConfidence: 97,
    glAccount: '6300 - Security Expense',
    glConfidence: 91,
    property: 'Multiple',
    propertyConfidence: 75,
    status: 'pending_review',
    receivedDate: '2024-01-20',
    receivedVia: 'email',
    ocrStatus: 'completed',
    matchedPO: 'PO-2024-0512',
    poMatchConfidence: 88,
    flags: ['amount_variance']
  }
];

const mockAutomationRules = [
  { id: 1, name: 'Auto-approve recurring < $10K', vendor: 'Elite Property Services', maxAmount: 10000, enabled: true, invoicesProcessed: 24 },
  { id: 2, name: 'Route legal > $25K to CFO', vendor: 'Johnson Legal Group', maxAmount: 25000, enabled: true, invoicesProcessed: 8 },
  { id: 3, name: 'Auto-code utilities', vendor: 'Any Utility', glAccount: '6400 - Utilities', enabled: true, invoicesProcessed: 156 },
  { id: 4, name: 'Flag construction > budget', vendor: 'ABC Construction', checkBudget: true, enabled: true, invoicesProcessed: 12 }
];

const statusConfig = {
  pending_review: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  auto_approved: { label: 'Auto-Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  needs_attention: { label: 'Needs Attention', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
  rejected: { label: 'Rejected', color: 'bg-gray-100 text-gray-800', icon: XCircle }
};

const flagConfig = {
  recurring_vendor: { label: 'Recurring', color: 'bg-blue-100 text-blue-700' },
  low_confidence: { label: 'Low Confidence', color: 'bg-orange-100 text-orange-700' },
  missing_vendor: { label: 'Missing Vendor', color: 'bg-red-100 text-red-700' },
  missing_gl: { label: 'Missing GL', color: 'bg-red-100 text-red-700' },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-700' },
  amount_variance: { label: 'Amount Variance', color: 'bg-yellow-100 text-yellow-700' }
};

export default function APAutomationPage() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(mockInvoiceQueue[0]);
  const [view, setView] = useState('queue');

  const filteredInvoices = useMemo(() => {
    return mockInvoiceQueue.filter(inv => {
      const matchesFilter = filter === 'all' || inv.status === filter;
      const matchesSearch = (inv.vendor?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        inv.fileName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchTerm]);

  const stats = useMemo(() => ({
    inQueue: mockInvoiceQueue.length,
    needsAttention: mockInvoiceQueue.filter(i => i.status === 'needs_attention').length,
    autoApproved: mockInvoiceQueue.filter(i => i.status === 'auto_approved').length,
    totalValue: mockInvoiceQueue.reduce((sum, i) => sum + i.amount, 0)
  }), []);

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AP Automation</h1>
          <p className="text-gray-600">Automated invoice processing and approval</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Settings className="w-4 h-4 mr-2" />Rules</Button>
          <Button className="bg-blue-600 hover:bg-blue-700"><Upload className="w-4 h-4 mr-2" />Upload Invoices</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><FileText className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.inQueue}</p>
              <p className="text-sm text-gray-600">In Queue</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.needsAttention}</p>
              <p className="text-sm text-gray-600">Needs Attention</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><Zap className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.autoApproved}</p>
              <p className="text-sm text-gray-600">Auto-Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><DollarSign className="w-5 h-5 text-purple-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${(stats.totalValue / 1000).toFixed(0)}K</p>
              <p className="text-sm text-gray-600">Total Value</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <Button variant={view === 'queue' ? 'default' : 'outline'} size="sm" onClick={() => setView('queue')}>Invoice Queue</Button>
          <Button variant={view === 'rules' ? 'default' : 'outline'} size="sm" onClick={() => setView('rules')}>Automation Rules</Button>
        </div>
        {view === 'queue' && (
          <>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search invoices..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2">
              {['all', 'needs_attention', 'pending_review', 'auto_approved'].map((f) => (
                <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
                  {f === 'all' ? 'All' : statusConfig[f]?.label || f}
                </Button>
              ))}
            </div>
          </>
        )}
      </div>

      {view === 'queue' ? (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
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
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{invoice.vendor || 'Unknown Vendor'}</p>
                    <p className="text-sm text-gray-500 truncate">{invoice.fileName}</p>
                  </div>
                  <span className={cn("px-2 py-0.5 rounded text-xs ml-2", statusConfig[invoice.status].color)}>
                    {statusConfig[invoice.status].label}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-semibold text-gray-900">${invoice.amount.toLocaleString()}</span>
                  <span className="text-xs text-gray-500">{invoice.receivedVia}</span>
                </div>
                {invoice.flags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {invoice.flags.map(flag => (
                      <span key={flag} className={cn("px-1.5 py-0.5 rounded text-xs", flagConfig[flag]?.color)}>
                        {flagConfig[flag]?.label}
                      </span>
                    ))}
                  </div>
                )}
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
                        <h2 className="text-xl font-bold text-gray-900">{selectedInvoice.vendor || 'Unknown Vendor'}</h2>
                        <span className={cn("px-2 py-1 rounded-full text-xs", statusConfig[selectedInvoice.status].color)}>
                          {statusConfig[selectedInvoice.status].label}
                        </span>
                      </div>
                      <p className="text-gray-600">{selectedInvoice.fileName}</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">${selectedInvoice.amount.toLocaleString()}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Extracted Data</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Vendor</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{selectedInvoice.vendor || 'Not detected'}</span>
                            {selectedInvoice.vendorConfidence && (
                              <span className={cn("text-xs", getConfidenceColor(selectedInvoice.vendorConfidence))}>
                                {selectedInvoice.vendorConfidence}%
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Invoice #</span>
                          <span className="font-medium">{selectedInvoice.invoiceNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Amount</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">${selectedInvoice.amount.toLocaleString()}</span>
                            <span className={cn("text-xs", getConfidenceColor(selectedInvoice.amountConfidence))}>
                              {selectedInvoice.amountConfidence}%
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Due Date</span>
                          <span className="font-medium">{selectedInvoice.dueDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Auto-Coding</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">GL Account</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{selectedInvoice.glAccount || 'Not detected'}</span>
                            {selectedInvoice.glConfidence > 0 && (
                              <span className={cn("text-xs", getConfidenceColor(selectedInvoice.glConfidence))}>
                                {selectedInvoice.glConfidence}%
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Property</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{selectedInvoice.property || 'Not detected'}</span>
                            {selectedInvoice.propertyConfidence > 0 && (
                              <span className={cn("text-xs", getConfidenceColor(selectedInvoice.propertyConfidence))}>
                                {selectedInvoice.propertyConfidence}%
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Matched PO</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{selectedInvoice.matchedPO || 'None'}</span>
                            {selectedInvoice.poMatchConfidence && (
                              <span className={cn("text-xs", getConfidenceColor(selectedInvoice.poMatchConfidence))}>
                                {selectedInvoice.poMatchConfidence}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 flex gap-3 justify-end">
                  <Button variant="outline"><Eye className="w-4 h-4 mr-2" />View Document</Button>
                  <Button variant="outline" className="text-red-600 border-red-200">Reject</Button>
                  <Button className="bg-green-600 hover:bg-green-700"><CheckCircle className="w-4 h-4 mr-2" />Approve & Post</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Automation Rules</h3>
            <Button size="sm"><Zap className="w-4 h-4 mr-2" />Add Rule</Button>
          </div>
          <div className="divide-y divide-gray-200">
            {mockAutomationRules.map((rule) => (
              <div key={rule.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className={cn("w-3 h-3 rounded-full", rule.enabled ? "bg-green-500" : "bg-gray-300")} />
                  <div>
                    <p className="font-medium text-gray-900">{rule.name}</p>
                    <p className="text-sm text-gray-500">
                      Vendor: {rule.vendor} {rule.maxAmount && `• Max: $${rule.maxAmount.toLocaleString()}`}
                      {rule.glAccount && ` • GL: ${rule.glAccount}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">{rule.invoicesProcessed} processed</span>
                  <Button variant="ghost" size="sm">{rule.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</Button>
                  <Button variant="ghost" size="sm"><Settings className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
