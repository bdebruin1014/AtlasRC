import React, { useState, useMemo } from 'react';
import {
  Printer, FileText, CheckCircle, Clock, AlertTriangle, Lock,
  Shield, User, Building, Eye, Download, Send, XCircle, History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/*
 * CHECK PRINTING WORKFLOW - SECURITY & CONTROLS
 *
 * 1. CHECK STOCK SECURITY
 *    - Blank checks stored in locked safe
 *    - Dual custody for check stock access
 *    - Check stock inventory log maintained
 *    - Sequential numbering enforced
 *    - Void checks must be defaced and retained
 *
 * 2. APPROVAL REQUIREMENTS
 *    - Under $5,000: Single authorized signer
 *    - $5,000 - $25,000: Two authorized signers
 *    - Over $25,000: Two signers + CFO approval
 *    - Over $100,000: Board notification required
 *
 * 3. POSITIVE PAY INTEGRATION
 *    - All checks registered with bank
 *    - Payee name and amount transmitted
 *    - Bank verifies before clearing
 *    - Exception items flagged immediately
 *
 * 4. SEGREGATION OF DUTIES
 *    - AP entry personnel cannot sign checks
 *    - Check signers cannot access blank stock
 *    - Bank reconciliation by independent party
 *
 * 5. VOID & STALE PROCEDURES
 *    - Stale-dated checks (>90 days) auto-voided
 *    - Void requests require manager approval
 *    - Voided checks filed with disbursement records
 */

const mockCheckBatches = [
  {
    id: 1,
    batchNumber: 'CHK-2024-0215',
    createdDate: '2024-02-02',
    createdBy: 'Sarah Johnson',
    checkCount: 12,
    totalAmount: 45678.90,
    status: 'pending_approval',
    approvalLevel: 'dual_signature',
    approver1: null,
    approver2: null
  },
  {
    id: 2,
    batchNumber: 'CHK-2024-0214',
    createdDate: '2024-02-02',
    createdBy: 'Mike Chen',
    checkCount: 5,
    totalAmount: 8945.50,
    status: 'approved',
    approvalLevel: 'single_signature',
    approver1: 'Lisa Wang',
    approver2: null
  },
  {
    id: 3,
    batchNumber: 'CHK-2024-0213',
    createdDate: '2024-02-01',
    createdBy: 'Tom Davis',
    checkCount: 8,
    totalAmount: 156234.00,
    status: 'pending_cfo',
    approvalLevel: 'cfo_required',
    approver1: 'Lisa Wang',
    approver2: 'John Smith',
    cfoApproval: false
  },
  {
    id: 4,
    batchNumber: 'CHK-2024-0212',
    createdDate: '2024-02-01',
    createdBy: 'Sarah Johnson',
    checkCount: 15,
    totalAmount: 23456.78,
    status: 'printed',
    approvalLevel: 'dual_signature',
    approver1: 'Lisa Wang',
    approver2: 'John Smith',
    printedDate: '2024-02-01 16:30:00'
  }
];

const mockChecksInBatch = [
  { id: 1, checkNumber: 10245, payee: 'ABC Supplies Inc', amount: 3456.78, invoiceRef: 'INV-2024-0892', entity: 'Riverside Plaza LLC' },
  { id: 2, checkNumber: 10246, payee: 'Johnson Maintenance', amount: 8750.00, invoiceRef: 'INV-2024-0901', entity: 'Downtown Tower LLC' },
  { id: 3, checkNumber: 10247, payee: 'City Water Authority', amount: 1234.56, invoiceRef: 'UTIL-2024-0215', entity: 'Riverside Plaza LLC' },
  { id: 4, checkNumber: 10248, payee: 'Insurance Corp of America', amount: 15000.00, invoiceRef: 'POL-2024-0045', entity: 'Atlas Holdings LLC' },
  { id: 5, checkNumber: 10249, payee: 'Legal Associates LLP', amount: 12500.00, invoiceRef: 'LEG-2024-0089', entity: 'Atlas Holdings LLC' }
];

const mockCheckStock = [
  { id: 1, entity: 'Atlas Holdings LLC', bankAccount: 'Chase ****4521', startNumber: 10001, endNumber: 10500, remaining: 255, lastAccess: '2024-02-02', accessedBy: 'Treasury' },
  { id: 2, entity: 'Riverside Plaza LLC', bankAccount: 'BofA ****7832', startNumber: 5001, endNumber: 5250, remaining: 112, lastAccess: '2024-02-01', accessedBy: 'Treasury' },
  { id: 3, entity: 'Downtown Tower LLC', bankAccount: 'Wells ****9045', startNumber: 2001, endNumber: 2250, remaining: 198, lastAccess: '2024-01-28', accessedBy: 'Treasury' }
];

const mockVoidedChecks = [
  { id: 1, checkNumber: 10200, originalPayee: 'ABC Corp', originalAmount: 5000.00, voidDate: '2024-01-30', voidReason: 'Duplicate payment', voidedBy: 'Lisa Wang', approvedBy: 'John Smith' },
  { id: 2, checkNumber: 10185, originalPayee: 'XYZ Services', originalAmount: 1234.00, voidDate: '2024-01-25', voidReason: 'Stale dated - not cashed after 90 days', voidedBy: 'System', approvedBy: 'Auto-void' }
];

const statusConfig = {
  pending_approval: { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: 'Approved - Ready to Print', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  pending_cfo: { label: 'Pending CFO', color: 'bg-orange-100 text-orange-800', icon: Shield },
  printed: { label: 'Printed', color: 'bg-blue-100 text-blue-800', icon: Printer },
  voided: { label: 'Voided', color: 'bg-red-100 text-red-800', icon: XCircle }
};

const approvalLevelConfig = {
  single_signature: { label: 'Single Signature', color: 'bg-gray-100 text-gray-800' },
  dual_signature: { label: 'Dual Signature', color: 'bg-blue-100 text-blue-800' },
  cfo_required: { label: 'CFO Required', color: 'bg-purple-100 text-purple-800' }
};

export default function CheckPrintingWorkflowPage() {
  const [activeTab, setActiveTab] = useState('batches');
  const [selectedBatch, setSelectedBatch] = useState(null);

  const stats = useMemo(() => ({
    pendingApproval: mockCheckBatches.filter(b => ['pending_approval', 'pending_cfo'].includes(b.status)).length,
    readyToPrint: mockCheckBatches.filter(b => b.status === 'approved').length,
    printedToday: mockCheckBatches.filter(b => b.status === 'printed' && b.printedDate?.includes('2024-02-01')).length,
    totalCheckStock: mockCheckStock.reduce((sum, s) => sum + s.remaining, 0),
    lowStockAlert: mockCheckStock.filter(s => s.remaining < 100).length
  }), []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Check Printing Workflow</h1>
          <p className="text-gray-600">Secure check generation with approval controls</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><History className="w-4 h-4 mr-2" />Check Register</Button>
          <Button className="bg-blue-600 hover:bg-blue-700"><FileText className="w-4 h-4 mr-2" />Create Batch</Button>
        </div>
      </div>

      {/* Alerts */}
      {(stats.pendingApproval > 0 || stats.lowStockAlert > 0) && (
        <div className="space-y-2">
          {stats.pendingApproval > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-900">{stats.pendingApproval} Check Batch(es) Awaiting Approval</p>
                <p className="text-sm text-yellow-700">Review and approve to enable printing</p>
              </div>
              <Button size="sm" className="ml-auto" onClick={() => setActiveTab('batches')}>Review Batches</Button>
            </div>
          )}
          {stats.lowStockAlert > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-900">{stats.lowStockAlert} Bank Account(s) with Low Check Stock</p>
                <p className="text-sm text-orange-700">Order additional check stock to avoid interruption</p>
              </div>
              <Button size="sm" variant="outline" className="ml-auto border-orange-600 text-orange-600" onClick={() => setActiveTab('stock')}>View Stock</Button>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Pending Approval</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingApproval}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Ready to Print</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.readyToPrint}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Printer className="w-4 h-4" />
            <span className="text-sm">Printed Today</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.printedToday}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-sm">Check Stock</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalCheckStock}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">Low Stock Alerts</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.lowStockAlert}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {['batches', 'stock', 'voided', 'positive_pay'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px",
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {tab === 'batches' && 'Check Batches'}
            {tab === 'stock' && 'Check Stock'}
            {tab === 'voided' && 'Voided Checks'}
            {tab === 'positive_pay' && 'Positive Pay'}
          </button>
        ))}
      </div>

      {/* Batches Tab */}
      {activeTab === 'batches' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Check Approval Thresholds</h3>
            <div className="grid grid-cols-4 gap-4 text-sm text-blue-800">
              <div>
                <p className="font-medium">Under $5,000</p>
                <p>Single authorized signer</p>
              </div>
              <div>
                <p className="font-medium">$5,000 - $25,000</p>
                <p>Two authorized signers</p>
              </div>
              <div>
                <p className="font-medium">$25,000 - $100,000</p>
                <p>Two signers + CFO</p>
              </div>
              <div>
                <p className="font-medium">Over $100,000</p>
                <p>Board notification required</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-sm text-gray-500">
                  <th className="p-4">Batch #</th>
                  <th className="p-4">Created</th>
                  <th className="p-4">Checks</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Approval Level</th>
                  <th className="p-4">Approvers</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockCheckBatches.map((batch) => {
                  const StatusIcon = statusConfig[batch.status].icon;
                  return (
                    <tr key={batch.id} className={cn("border-b hover:bg-gray-50", ['pending_approval', 'pending_cfo'].includes(batch.status) && "bg-yellow-50")}>
                      <td className="p-4 font-mono text-sm font-medium">{batch.batchNumber}</td>
                      <td className="p-4 text-sm">
                        <p>{batch.createdDate}</p>
                        <p className="text-xs text-gray-500">{batch.createdBy}</p>
                      </td>
                      <td className="p-4 text-sm text-center">{batch.checkCount}</td>
                      <td className="p-4 text-sm font-medium">${batch.totalAmount.toLocaleString()}</td>
                      <td className="p-4">
                        <span className={cn("px-2 py-0.5 rounded text-xs", approvalLevelConfig[batch.approvalLevel].color)}>
                          {approvalLevelConfig[batch.approvalLevel].label}
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        <div className="space-y-1">
                          {batch.approver1 && <p className="text-green-600">1: {batch.approver1}</p>}
                          {batch.approver2 && <p className="text-green-600">2: {batch.approver2}</p>}
                          {!batch.approver1 && <p className="text-gray-400">Pending...</p>}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={cn("px-2 py-0.5 rounded text-xs flex items-center gap-1 w-fit", statusConfig[batch.status].color)}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig[batch.status].label}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button>
                          {batch.status === 'pending_approval' && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">Approve</Button>
                          )}
                          {batch.status === 'approved' && (
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              <Printer className="w-3 h-3 mr-1" />Print
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Check Stock Tab */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">Check Stock Security Policy</h3>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Blank checks stored in locked safe with restricted access</li>
              <li>• Dual custody required for check stock access</li>
              <li>• All access logged with timestamp and purpose</li>
              <li>• Sequential numbering enforced - gaps must be investigated</li>
              <li>• Order new stock when remaining falls below 100</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-sm text-gray-500">
                  <th className="p-4">Entity</th>
                  <th className="p-4">Bank Account</th>
                  <th className="p-4">Check Range</th>
                  <th className="p-4">Remaining</th>
                  <th className="p-4">Last Access</th>
                  <th className="p-4">Accessed By</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockCheckStock.map((stock) => (
                  <tr key={stock.id} className={cn("border-b hover:bg-gray-50", stock.remaining < 100 && "bg-orange-50")}>
                    <td className="p-4 font-medium text-gray-900">{stock.entity}</td>
                    <td className="p-4 text-sm text-gray-600">{stock.bankAccount}</td>
                    <td className="p-4 text-sm font-mono">{stock.startNumber} - {stock.endNumber}</td>
                    <td className="p-4">
                      <span className={cn(
                        "font-medium",
                        stock.remaining < 100 ? "text-red-600" : stock.remaining < 150 ? "text-yellow-600" : "text-green-600"
                      )}>
                        {stock.remaining}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{stock.lastAccess}</td>
                    <td className="p-4 text-sm">{stock.accessedBy}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Access Log</Button>
                        {stock.remaining < 100 && (
                          <Button size="sm" className="bg-orange-600 hover:bg-orange-700">Order Stock</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Voided Checks Tab */}
      {activeTab === 'voided' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">Voided checks must be defaced and retained for audit purposes</p>
            <Button variant="outline"><FileText className="w-4 h-4 mr-2" />Void Check</Button>
          </div>

          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-sm text-gray-500">
                  <th className="p-4">Check #</th>
                  <th className="p-4">Original Payee</th>
                  <th className="p-4">Original Amount</th>
                  <th className="p-4">Void Date</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Voided By</th>
                  <th className="p-4">Approved By</th>
                </tr>
              </thead>
              <tbody>
                {mockVoidedChecks.map((check) => (
                  <tr key={check.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-mono text-sm font-medium">{check.checkNumber}</td>
                    <td className="p-4 text-sm">{check.originalPayee}</td>
                    <td className="p-4 text-sm">${check.originalAmount.toFixed(2)}</td>
                    <td className="p-4 text-sm text-gray-600">{check.voidDate}</td>
                    <td className="p-4 text-sm text-gray-600">{check.voidReason}</td>
                    <td className="p-4 text-sm">{check.voidedBy}</td>
                    <td className="p-4 text-sm">{check.approvedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Positive Pay Tab */}
      {activeTab === 'positive_pay' && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">Positive Pay Protection</h3>
            <p className="text-sm text-green-800 mb-3">
              Positive Pay is a fraud prevention service where all issued checks are transmitted to the bank.
              The bank verifies each check against the issued check file before clearing.
            </p>
            <div className="grid grid-cols-3 gap-4 text-sm text-green-800">
              <div>
                <p className="font-medium">Data Transmitted:</p>
                <p>Check #, Amount, Payee, Date</p>
              </div>
              <div>
                <p className="font-medium">Transmission Frequency:</p>
                <p>Daily at 5:00 PM EST</p>
              </div>
              <div>
                <p className="font-medium">Exception Handling:</p>
                <p>Pay/Return decision by 10:00 AM</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Today's Positive Pay File</h3>
                <p className="text-sm text-gray-600">Last transmitted: 2024-02-01 17:00:00 EST</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline"><Download className="w-4 h-4 mr-2" />Download File</Button>
                <Button className="bg-blue-600 hover:bg-blue-700"><Send className="w-4 h-4 mr-2" />Transmit Now</Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="border rounded-lg p-4">
                <p className="text-3xl font-bold text-blue-600">15</p>
                <p className="text-sm text-gray-600">Checks Issued</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-3xl font-bold text-green-600">$23,456.78</p>
                <p className="text-sm text-gray-600">Total Amount</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-3xl font-bold text-gray-600">0</p>
                <p className="text-sm text-gray-600">Exceptions</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-900">No Exceptions Pending</p>
                <p className="text-sm text-yellow-700">All checks cleared successfully. You will be notified immediately if any exceptions occur.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
