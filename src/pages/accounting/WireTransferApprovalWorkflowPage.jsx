import React, { useState, useMemo } from 'react';
import {
  Send, Building, DollarSign, CheckCircle, XCircle, Clock,
  AlertTriangle, Shield, Lock, FileText, Search, Eye,
  AlertCircle, UserCheck, User, Calendar, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/*
 * WIRE TRANSFER SAFETY CONTROLS
 *
 * 1. APPROVAL THRESHOLDS
 *    - $0 - $10,000: Single approver (Controller)
 *    - $10,001 - $100,000: Dual approval (Controller + Director)
 *    - $100,001 - $500,000: Triple approval (Controller + Director + CFO)
 *    - $500,001+: Quad approval (Controller + Director + CFO + CEO)
 *
 * 2. VERIFICATION REQUIREMENTS
 *    - New beneficiaries require callback verification
 *    - International wires require enhanced due diligence
 *    - Changes to wire instructions require re-verification
 *
 * 3. TIMING CONTROLS
 *    - Same-day wires over $250K require CEO approval
 *    - Weekend/holiday wires are prohibited
 *    - Cutoff time: 2:00 PM local time
 */

const mockWireRequests = [
  {
    id: 'WIRE-2024-0089',
    type: 'Domestic',
    beneficiary: 'Metro Industrial Complex LLC',
    beneficiaryBank: 'JPMorgan Chase',
    amount: 2500000.00,
    purpose: 'Acquisition closing - earnest money release',
    requestedBy: 'Sarah Johnson',
    requestDate: '2024-01-30',
    status: 'pending_ceo',
    urgency: 'same_day',
    fromAccount: 'Atlas Holdings - Operating ****4521',
    approvalChain: [
      { role: 'Controller', name: 'Mike Chen', status: 'approved', date: '2024-01-30 09:15' },
      { role: 'Director', name: 'Lisa Wang', status: 'approved', date: '2024-01-30 09:45' },
      { role: 'CFO', name: 'Robert Johnson', status: 'approved', date: '2024-01-30 10:30' },
      { role: 'CEO', name: 'David Williams', status: 'pending', date: null }
    ],
    verificationStatus: 'verified',
    newBeneficiary: false
  },
  {
    id: 'WIRE-2024-0088',
    type: 'Domestic',
    beneficiary: 'ABC Construction Inc.',
    beneficiaryBank: 'Bank of America',
    amount: 450000.00,
    purpose: 'Construction draw payment - Downtown Tower renovation',
    requestedBy: 'Tom Davis',
    requestDate: '2024-01-29',
    status: 'approved',
    urgency: 'normal',
    fromAccount: 'Downtown Tower LLC - Operating ****9156',
    approvalChain: [
      { role: 'Controller', name: 'Mike Chen', status: 'approved', date: '2024-01-29 14:00' },
      { role: 'Director', name: 'Lisa Wang', status: 'approved', date: '2024-01-29 15:30' },
      { role: 'CFO', name: 'Robert Johnson', status: 'approved', date: '2024-01-29 16:00' }
    ],
    verificationStatus: 'verified',
    newBeneficiary: false,
    executedDate: '2024-01-30',
    confirmationNumber: 'FED20240130-89562'
  },
  {
    id: 'WIRE-2024-0087',
    type: 'International',
    beneficiary: 'Global Investments Ltd',
    beneficiaryBank: 'HSBC London',
    amount: 150000.00,
    purpose: 'International consulting fee payment',
    requestedBy: 'John Smith',
    requestDate: '2024-01-28',
    status: 'pending_verification',
    urgency: 'normal',
    fromAccount: 'Atlas Holdings - Operating ****4521',
    approvalChain: [
      { role: 'Controller', name: 'Mike Chen', status: 'approved', date: '2024-01-28 11:00' },
      { role: 'Director', name: 'Lisa Wang', status: 'pending', date: null }
    ],
    verificationStatus: 'pending_callback',
    newBeneficiary: true,
    verificationNotes: 'New international beneficiary - callback verification required'
  },
  {
    id: 'WIRE-2024-0086',
    type: 'Domestic',
    beneficiary: 'Smith & Associates Law Firm',
    beneficiaryBank: 'Wells Fargo',
    amount: 85000.00,
    purpose: 'Legal fees - Oak Street acquisition',
    requestedBy: 'Sarah Johnson',
    requestDate: '2024-01-28',
    status: 'approved',
    urgency: 'normal',
    fromAccount: 'Atlas Holdings - Operating ****4521',
    approvalChain: [
      { role: 'Controller', name: 'Mike Chen', status: 'approved', date: '2024-01-28 09:00' },
      { role: 'Director', name: 'Lisa Wang', status: 'approved', date: '2024-01-28 10:00' }
    ],
    verificationStatus: 'verified',
    newBeneficiary: false,
    executedDate: '2024-01-28',
    confirmationNumber: 'FED20240128-78451'
  }
];

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  pending_verification: { label: 'Pending Verification', color: 'bg-orange-100 text-orange-800' },
  pending_controller: { label: 'Pending Controller', color: 'bg-yellow-100 text-yellow-800' },
  pending_director: { label: 'Pending Director', color: 'bg-blue-100 text-blue-800' },
  pending_cfo: { label: 'Pending CFO', color: 'bg-purple-100 text-purple-800' },
  pending_ceo: { label: 'Pending CEO', color: 'bg-indigo-100 text-indigo-800' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
  executed: { label: 'Executed', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' }
};

export default function WireTransferApprovalWorkflowPage() {
  const [filter, setFilter] = useState('all');
  const [selectedWire, setSelectedWire] = useState(mockWireRequests[0]);

  const stats = useMemo(() => ({
    pending: mockWireRequests.filter(w => w.status.startsWith('pending')).length,
    approved: mockWireRequests.filter(w => w.status === 'approved' || w.status === 'executed').length,
    totalPendingValue: mockWireRequests.filter(w => w.status.startsWith('pending')).reduce((sum, w) => sum + w.amount, 0),
    sameDayPending: mockWireRequests.filter(w => w.urgency === 'same_day' && w.status.startsWith('pending')).length
  }), []);

  const getApprovalThreshold = (amount) => {
    if (amount <= 10000) return '1 Approver';
    if (amount <= 100000) return '2 Approvers';
    if (amount <= 500000) return '3 Approvers';
    return '4 Approvers (CEO Required)';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wire Transfer Approval</h1>
          <p className="text-gray-600">Multi-tier approval workflow for wire transfers</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Send className="w-4 h-4 mr-2" />New Wire Request
        </Button>
      </div>

      {/* Safety Controls Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">Wire Transfer Safety Controls</h3>
            <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-blue-700">
              <div>
                <p>• $0-$10K: Single approver</p>
                <p>• $10K-$100K: Dual approval required</p>
              </div>
              <div>
                <p>• $100K-$500K: Triple approval required</p>
                <p>• $500K+: CEO approval required</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {stats.sameDayPending > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <div>
              <p className="font-semibold text-orange-900">{stats.sameDayPending} Same-Day Wire(s) Pending</p>
              <p className="text-sm text-orange-700">Cutoff time: 2:00 PM. Please review urgently.</p>
            </div>
          </div>
          <Button variant="outline" className="border-orange-300 text-orange-700">Review Now</Button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
          <p className="text-sm text-gray-600">Pending Approval</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
          <p className="text-sm text-gray-600">Approved/Executed</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">${(stats.totalPendingValue / 1000000).toFixed(1)}M</p>
          <p className="text-sm text-gray-600">Pending Value</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-orange-600">{stats.sameDayPending}</p>
          <p className="text-sm text-gray-600">Same-Day Urgent</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
          {mockWireRequests.map((wire) => (
            <div
              key={wire.id}
              onClick={() => setSelectedWire(wire)}
              className={cn(
                "bg-white rounded-lg border p-4 cursor-pointer hover:border-blue-300 transition-colors",
                selectedWire?.id === wire.id ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-medium text-gray-900">{wire.id}</span>
                <span className={cn("px-2 py-0.5 rounded text-xs", statusConfig[wire.status].color)}>
                  {statusConfig[wire.status].label}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{wire.beneficiary}</p>
              <div className="flex items-center justify-between">
                <span className={cn("px-2 py-0.5 rounded text-xs", wire.type === 'International' ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800")}>
                  {wire.type}
                </span>
                <span className="font-semibold text-gray-900">${wire.amount.toLocaleString()}</span>
              </div>
              {wire.urgency === 'same_day' && (
                <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />Same-Day
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="col-span-2">
          {selectedWire && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-gray-900">{selectedWire.id}</h2>
                      <span className={cn("px-2 py-1 rounded-full text-xs", statusConfig[selectedWire.status].color)}>
                        {statusConfig[selectedWire.status].label}
                      </span>
                      {selectedWire.urgency === 'same_day' && (
                        <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">Same-Day</span>
                      )}
                    </div>
                    <p className="text-gray-600">{selectedWire.purpose}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">${selectedWire.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{getApprovalThreshold(selectedWire.amount)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Beneficiary</p>
                    <p className="font-semibold text-gray-900">{selectedWire.beneficiary}</p>
                    <p className="text-sm text-gray-600">{selectedWire.beneficiaryBank}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">From Account</p>
                    <p className="font-semibold text-gray-900">{selectedWire.fromAccount}</p>
                    <p className="text-sm text-gray-600">Requested by: {selectedWire.requestedBy}</p>
                  </div>
                </div>
              </div>

              {/* Verification Status */}
              {selectedWire.newBeneficiary && (
                <div className={cn("p-4 border-b", selectedWire.verificationStatus === 'pending_callback' ? "bg-orange-50 border-orange-200" : "bg-green-50 border-green-200")}>
                  <div className="flex items-center gap-3">
                    {selectedWire.verificationStatus === 'verified' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                    )}
                    <div>
                      <p className="font-semibold">{selectedWire.verificationStatus === 'verified' ? 'Beneficiary Verified' : 'Verification Required'}</p>
                      <p className="text-sm">{selectedWire.verificationNotes}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Approval Chain */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Approval Chain</h3>
                <div className="space-y-3">
                  {selectedWire.approvalChain.map((approval, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        approval.status === 'approved' ? "bg-green-100" : "bg-gray-200"
                      )}>
                        {approval.status === 'approved' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-gray-400" />}
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

              {selectedWire.status === 'approved' && selectedWire.executedDate && (
                <div className="p-6 bg-green-50">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">Wire Executed</p>
                      <p className="text-sm text-green-700">
                        {selectedWire.executedDate} • Confirmation: {selectedWire.confirmationNumber}
                      </p>
                    </div>
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
