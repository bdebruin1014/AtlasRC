import React, { useState, useMemo } from 'react';
import {
  Building, CheckCircle, XCircle, Clock, AlertTriangle, User,
  DollarSign, Calendar, Search, Eye, FileText, CreditCard,
  Shield, UserCheck, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const mockPaymentBatches = [
  {
    id: 'BATCH-2024-0045',
    createdDate: '2024-01-30',
    createdBy: 'John Smith',
    totalAmount: 285000.00,
    invoiceCount: 12,
    status: 'pending_approval',
    entity: 'Atlas Holdings LLC',
    paymentMethod: 'ACH',
    scheduledDate: '2024-02-01',
    invoices: [
      { vendor: 'ABC Contractors', invoice: 'INV-4521', amount: 85000, dueDate: '2024-02-05', status: 'approved' },
      { vendor: 'XYZ Supplies', invoice: 'INV-8912', amount: 12500, dueDate: '2024-02-03', status: 'approved' },
      { vendor: 'Elite Services', invoice: 'INV-3345', amount: 45000, dueDate: '2024-02-01', status: 'pending' },
      { vendor: 'Metro Utilities', invoice: 'INV-7721', amount: 8500, dueDate: '2024-02-10', status: 'approved' }
    ],
    approvalChain: [
      { role: 'AP Clerk', name: 'John Smith', status: 'submitted', date: '2024-01-30' },
      { role: 'AP Manager', name: 'Lisa Wang', status: 'approved', date: '2024-01-30' },
      { role: 'Controller', name: 'Mike Chen', status: 'pending', date: null }
    ]
  },
  {
    id: 'BATCH-2024-0044',
    createdDate: '2024-01-29',
    createdBy: 'Tom Davis',
    totalAmount: 125000.00,
    invoiceCount: 5,
    status: 'approved',
    entity: 'Riverside Plaza LLC',
    paymentMethod: 'Check',
    scheduledDate: '2024-01-31',
    invoices: [],
    approvalChain: [
      { role: 'AP Clerk', name: 'Tom Davis', status: 'submitted', date: '2024-01-29' },
      { role: 'AP Manager', name: 'Lisa Wang', status: 'approved', date: '2024-01-29' },
      { role: 'Controller', name: 'Mike Chen', status: 'approved', date: '2024-01-30' }
    ]
  }
];

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  pending_approval: { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' }
};

export default function VendorPaymentApprovalPage() {
  const [selectedBatch, setSelectedBatch] = useState(mockPaymentBatches[0]);

  const stats = useMemo(() => ({
    pending: mockPaymentBatches.filter(b => b.status === 'pending_approval').length,
    approved: mockPaymentBatches.filter(b => b.status === 'approved').length,
    totalPending: mockPaymentBatches.filter(b => b.status === 'pending_approval').reduce((sum, b) => sum + b.totalAmount, 0),
    invoicesDue: mockPaymentBatches.filter(b => b.status === 'pending_approval').reduce((sum, b) => sum + b.invoiceCount, 0)
  }), []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Payment Approval</h1>
          <p className="text-gray-600">Review and approve vendor payment batches</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <FileText className="w-4 h-4 mr-2" />Create Payment Batch
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-900">Payment Approval Controls</h3>
            <p className="text-sm text-blue-700">• All payments require 3-way match (PO, Receipt, Invoice)</p>
            <p className="text-sm text-blue-700">• Batches over $100K require Controller approval</p>
            <p className="text-sm text-blue-700">• New vendors flagged for additional verification</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-sm text-gray-600">Pending Batches</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          <p className="text-sm text-gray-600">Approved Today</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">${(stats.totalPending / 1000).toFixed(0)}K</p>
          <p className="text-sm text-gray-600">Pending Value</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{stats.invoicesDue}</p>
          <p className="text-sm text-gray-600">Invoices in Queue</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-2">
          {mockPaymentBatches.map((batch) => (
            <div
              key={batch.id}
              onClick={() => setSelectedBatch(batch)}
              className={cn(
                "bg-white rounded-lg border p-4 cursor-pointer hover:border-blue-300 transition-colors",
                selectedBatch?.id === batch.id ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-medium text-gray-900">{batch.id}</span>
                <span className={cn("px-2 py-0.5 rounded text-xs", statusConfig[batch.status].color)}>
                  {statusConfig[batch.status].label}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-2">{batch.entity} • {batch.invoiceCount} invoices</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{batch.paymentMethod}</span>
                <span className="font-semibold text-gray-900">${batch.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-2">
          {selectedBatch && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedBatch.id}</h2>
                    <p className="text-gray-600">{selectedBatch.entity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">${selectedBatch.totalAmount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{selectedBatch.invoiceCount} invoices</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Payment Method</p>
                    <p className="font-medium text-gray-900">{selectedBatch.paymentMethod}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Scheduled Date</p>
                    <p className="font-medium text-gray-900">{selectedBatch.scheduledDate}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Created By</p>
                    <p className="font-medium text-gray-900">{selectedBatch.createdBy}</p>
                  </div>
                </div>
              </div>

              {selectedBatch.invoices.length > 0 && (
                <div className="p-6 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Invoices</h3>
                  <div className="space-y-2">
                    {selectedBatch.invoices.map((inv, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{inv.vendor}</p>
                          <p className="text-sm text-gray-500">{inv.invoice} • Due: {inv.dueDate}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={cn("px-2 py-0.5 rounded text-xs", inv.status === 'approved' ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800")}>
                            {inv.status}
                          </span>
                          <span className="font-semibold text-gray-900">${inv.amount.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Approval Chain</h3>
                <div className="space-y-3">
                  {selectedBatch.approvalChain.map((approval, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        approval.status === 'approved' || approval.status === 'submitted' ? "bg-green-100" : "bg-gray-200"
                      )}>
                        {approval.status === 'approved' || approval.status === 'submitted' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{approval.role}</p>
                        <p className="text-sm text-gray-500">{approval.name}</p>
                      </div>
                      {approval.date && <span className="text-sm text-gray-500">{approval.date}</span>}
                      {approval.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="text-red-600">Reject</Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">Approve</Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {selectedBatch.status === 'approved' && (
                <div className="p-6 bg-gray-50 flex justify-end">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Send className="w-4 h-4 mr-2" />Process Payments
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
