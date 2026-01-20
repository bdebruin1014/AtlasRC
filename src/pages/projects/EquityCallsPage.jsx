import React, { useState } from 'react';
import { Plus, Search, Eye, Edit2, X, Download, FileText, DollarSign, Calendar, CheckCircle, Clock, AlertTriangle, Send, Users, Mail, Phone, Building2, Percent, TrendingUp, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const EquityCallsPage = ({ projectId }) => {
  const [showCallModal, setShowCallModal] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);
  const [activeTab, setActiveTab] = useState('calls'); // 'calls', 'investors', 'summary'

  const equityStructure = {
    totalEquityCommitted: 2500000,
    totalEquityCalled: 2125000,
    totalEquityReceived: 2125000,
    remainingCommitment: 375000,
    sponsorEquity: 700000,
    lpEquity: 1800000,
  };

  const investors = [
    { id: 'INV-001', name: 'Johnson Family Trust', type: 'LP', commitment: 400000, called: 340000, received: 340000, ownership: 16.0, email: 'johnson@familytrust.com', phone: '(555) 111-2222' },
    { id: 'INV-002', name: 'Smith Capital Partners', type: 'LP', commitment: 350000, called: 297500, received: 297500, ownership: 14.0, email: 'invest@smithcapital.com', phone: '(555) 222-3333' },
    { id: 'INV-003', name: 'Williams Investment Group', type: 'LP', commitment: 300000, called: 255000, received: 255000, ownership: 12.0, email: 'williams@wig.com', phone: '(555) 333-4444' },
    { id: 'INV-004', name: 'Anderson Holdings LLC', type: 'LP', commitment: 250000, called: 212500, received: 212500, ownership: 10.0, email: 'anderson@holdingsllc.com', phone: '(555) 444-5555' },
    { id: 'INV-005', name: 'Davis Family Office', type: 'LP', commitment: 200000, called: 170000, received: 170000, ownership: 8.0, email: 'davis@familyoffice.com', phone: '(555) 555-6666' },
    { id: 'INV-006', name: 'Miller Investments', type: 'LP', commitment: 150000, called: 127500, received: 127500, ownership: 6.0, email: 'miller@investments.com', phone: '(555) 666-7777' },
    { id: 'INV-007', name: 'Wilson Trust', type: 'LP', commitment: 150000, called: 127500, received: 127500, ownership: 6.0, email: 'wilson@trust.com', phone: '(555) 777-8888' },
    { id: 'INV-008', name: 'VanRock Holdings LLC', type: 'GP/Sponsor', commitment: 700000, called: 595000, received: 595000, ownership: 28.0, email: 'bryan@vanrock.com', phone: '(555) 888-9999' },
  ];

  const [capitalCalls, setCapitalCalls] = useState([
    {
      id: 'CALL-001',
      callNumber: 1,
      callDate: '2024-01-20',
      dueDate: '2024-02-05',
      purpose: 'Initial Capital Call - Land Acquisition',
      callPercent: 50,
      totalAmount: 1250000,
      status: 'complete',
      fundedDate: '2024-02-03',
      notes: 'Initial call for land acquisition closing',
      responses: [
        { investorId: 'INV-001', amount: 200000, status: 'received', receivedDate: '2024-02-01' },
        { investorId: 'INV-002', amount: 175000, status: 'received', receivedDate: '2024-02-02' },
        { investorId: 'INV-003', amount: 150000, status: 'received', receivedDate: '2024-02-01' },
        { investorId: 'INV-004', amount: 125000, status: 'received', receivedDate: '2024-02-03' },
        { investorId: 'INV-005', amount: 100000, status: 'received', receivedDate: '2024-02-02' },
        { investorId: 'INV-006', amount: 75000, status: 'received', receivedDate: '2024-02-01' },
        { investorId: 'INV-007', amount: 75000, status: 'received', receivedDate: '2024-02-02' },
        { investorId: 'INV-008', amount: 350000, status: 'received', receivedDate: '2024-01-25' },
      ],
    },
    {
      id: 'CALL-002',
      callNumber: 2,
      callDate: '2024-04-15',
      dueDate: '2024-05-01',
      purpose: 'Second Call - Construction Start',
      callPercent: 25,
      totalAmount: 625000,
      status: 'complete',
      fundedDate: '2024-04-29',
      notes: 'Capital for initial construction costs and permits',
      responses: [
        { investorId: 'INV-001', amount: 100000, status: 'received', receivedDate: '2024-04-28' },
        { investorId: 'INV-002', amount: 87500, status: 'received', receivedDate: '2024-04-27' },
        { investorId: 'INV-003', amount: 75000, status: 'received', receivedDate: '2024-04-29' },
        { investorId: 'INV-004', amount: 62500, status: 'received', receivedDate: '2024-04-28' },
        { investorId: 'INV-005', amount: 50000, status: 'received', receivedDate: '2024-04-27' },
        { investorId: 'INV-006', amount: 37500, status: 'received', receivedDate: '2024-04-29' },
        { investorId: 'INV-007', amount: 37500, status: 'received', receivedDate: '2024-04-28' },
        { investorId: 'INV-008', amount: 175000, status: 'received', receivedDate: '2024-04-20' },
      ],
    },
    {
      id: 'CALL-003',
      callNumber: 3,
      callDate: '2024-09-10',
      dueDate: '2024-09-25',
      purpose: 'Third Call - Construction Progress',
      callPercent: 10,
      totalAmount: 250000,
      status: 'complete',
      fundedDate: '2024-09-24',
      notes: 'Additional capital for construction progress',
      responses: [
        { investorId: 'INV-001', amount: 40000, status: 'received', receivedDate: '2024-09-22' },
        { investorId: 'INV-002', amount: 35000, status: 'received', receivedDate: '2024-09-23' },
        { investorId: 'INV-003', amount: 30000, status: 'received', receivedDate: '2024-09-22' },
        { investorId: 'INV-004', amount: 25000, status: 'received', receivedDate: '2024-09-24' },
        { investorId: 'INV-005', amount: 20000, status: 'received', receivedDate: '2024-09-23' },
        { investorId: 'INV-006', amount: 15000, status: 'received', receivedDate: '2024-09-22' },
        { investorId: 'INV-007', amount: 15000, status: 'received', receivedDate: '2024-09-23' },
        { investorId: 'INV-008', amount: 70000, status: 'received', receivedDate: '2024-09-15' },
      ],
    },
    {
      id: 'CALL-004',
      callNumber: 4,
      callDate: '2024-12-20',
      dueDate: '2025-01-10',
      purpose: 'Fourth Call - Final Construction',
      callPercent: 15,
      totalAmount: 375000,
      status: 'pending',
      fundedDate: null,
      notes: 'Final equity call for construction completion and reserves',
      responses: [
        { investorId: 'INV-001', amount: 60000, status: 'pending', receivedDate: null },
        { investorId: 'INV-002', amount: 52500, status: 'received', receivedDate: '2024-12-28' },
        { investorId: 'INV-003', amount: 45000, status: 'pending', receivedDate: null },
        { investorId: 'INV-004', amount: 37500, status: 'pending', receivedDate: null },
        { investorId: 'INV-005', amount: 30000, status: 'pending', receivedDate: null },
        { investorId: 'INV-006', amount: 22500, status: 'received', receivedDate: '2024-12-27' },
        { investorId: 'INV-007', amount: 22500, status: 'pending', receivedDate: null },
        { investorId: 'INV-008', amount: 105000, status: 'received', receivedDate: '2024-12-22' },
      ],
    },
  ]);

  const [newCall, setNewCall] = useState({
    purpose: '',
    callPercent: '',
    dueDate: '',
    notes: '',
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'received': return 'bg-green-100 text-green-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      case 'partial': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatCurrency = (value) => {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  const getInvestorById = (id) => investors.find(i => i.id === id);

  const getCallReceivedAmount = (call) => {
    return call.responses.filter(r => r.status === 'received').reduce((sum, r) => sum + r.amount, 0);
  };

  const getCallPendingAmount = (call) => {
    return call.responses.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0);
  };

  const calledPercent = ((equityStructure.totalEquityCalled / equityStructure.totalEquityCommitted) * 100).toFixed(0);

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Equity & Capital Calls</h1>
          <p className="text-sm text-gray-500">{investors.length} investors • {calledPercent}% called</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowCallModal(true)}>
            <Plus className="w-4 h-4 mr-1" />New Capital Call
          </Button>
        </div>
      </div>

      {/* Equity Summary Cards */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Total Committed</p>
          <p className="text-xl font-semibold">{formatCurrency(equityStructure.totalEquityCommitted)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-xs text-gray-500">Total Called</p>
          <p className="text-xl font-semibold text-blue-600">{formatCurrency(equityStructure.totalEquityCalled)}</p>
          <p className="text-xs text-gray-400">{calledPercent}% of commitment</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-xs text-gray-500">Total Received</p>
          <p className="text-xl font-semibold text-green-600">{formatCurrency(equityStructure.totalEquityReceived)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Remaining</p>
          <p className="text-xl font-semibold">{formatCurrency(equityStructure.remainingCommitment)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Sponsor Equity</p>
          <p className="text-xl font-semibold">{formatCurrency(equityStructure.sponsorEquity)}</p>
          <p className="text-xs text-gray-400">28%</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">LP Equity</p>
          <p className="text-xl font-semibold">{formatCurrency(equityStructure.lpEquity)}</p>
          <p className="text-xs text-gray-400">72%</p>
        </div>
      </div>

      {/* Capital Call Progress */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Capital Called</span>
          <span className="text-sm text-gray-500">{formatCurrency(equityStructure.totalEquityCalled)} / {formatCurrency(equityStructure.totalEquityCommitted)}</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-[#047857] rounded-full" style={{ width: `${calledPercent}%` }}></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('calls')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'calls' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Capital Calls ({capitalCalls.length})
        </button>
        <button onClick={() => setActiveTab('investors')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'investors' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Investors ({investors.length})
        </button>
        <button onClick={() => setActiveTab('summary')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'summary' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Summary
        </button>
      </div>

      {/* Capital Calls Tab */}
      {activeTab === 'calls' && (
        <div className="space-y-4">
          {capitalCalls.map((call) => {
            const receivedAmount = getCallReceivedAmount(call);
            const pendingAmount = getCallPendingAmount(call);
            const receivedCount = call.responses.filter(r => r.status === 'received').length;
            
            return (
              <div key={call.id} className="bg-white border rounded-lg overflow-hidden">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-600">#{call.callNumber}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{call.purpose}</h4>
                      <p className="text-sm text-gray-500">Due: {call.dueDate} • {call.callPercent}% of commitment</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Called</p>
                      <p className="font-semibold">${call.totalAmount.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Received</p>
                      <p className="font-semibold text-green-600">${receivedAmount.toLocaleString()}</p>
                    </div>
                    {pendingAmount > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Pending</p>
                        <p className="font-semibold text-amber-600">${pendingAmount.toLocaleString()}</p>
                      </div>
                    )}
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Responses</p>
                      <p className="font-semibold">{receivedCount}/{call.responses.length}</p>
                    </div>
                    <span className={cn("px-3 py-1 rounded text-sm capitalize", getStatusColor(call.status))}>
                      {call.status}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => setSelectedCall(call)}>
                      <Eye className="w-4 h-4 mr-1" />Details
                    </Button>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="px-4 pb-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${(receivedAmount / call.totalAmount) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Investors Tab */}
      {activeTab === 'investors' && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Investor</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-right px-4 py-3 font-medium">Commitment</th>
                <th className="text-right px-4 py-3 font-medium">Called</th>
                <th className="text-right px-4 py-3 font-medium">Received</th>
                <th className="text-right px-4 py-3 font-medium">Remaining</th>
                <th className="text-right px-4 py-3 font-medium">Ownership %</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {investors.map((investor) => (
                <tr key={investor.id} className={cn("hover:bg-gray-50", investor.type === 'GP/Sponsor' && "bg-blue-50")}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-medium">{investor.name}</p>
                        <p className="text-xs text-gray-500">{investor.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-1 rounded text-xs", investor.type === 'GP/Sponsor' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700")}>
                      {investor.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">${investor.commitment.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">${investor.called.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-green-600">${investor.received.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-amber-600">${(investor.commitment - investor.received).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-medium">{investor.ownership.toFixed(1)}%</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1 hover:bg-gray-100 rounded"><Mail className="w-4 h-4 text-gray-500" /></button>
                      <button className="p-1 hover:bg-gray-100 rounded"><Phone className="w-4 h-4 text-gray-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t font-semibold">
              <tr>
                <td className="px-4 py-3" colSpan="2">TOTALS</td>
                <td className="px-4 py-3 text-right">${investors.reduce((s, i) => s + i.commitment, 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right">${investors.reduce((s, i) => s + i.called, 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-green-600">${investors.reduce((s, i) => s + i.received, 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-amber-600">${investors.reduce((s, i) => s + (i.commitment - i.received), 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right">100%</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Summary Tab */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white border rounded-lg p-6">
            <h4 className="font-semibold mb-4">Capital Stack</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Senior Debt (Bank)</span>
                <span className="font-semibold">$5,800,000 (70%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">LP Equity</span>
                <span className="font-semibold">$1,800,000 (22%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Sponsor Equity</span>
                <span className="font-semibold">$700,000 (8%)</span>
              </div>
              <div className="pt-3 border-t flex justify-between items-center font-semibold">
                <span>Total Capitalization</span>
                <span>$8,300,000</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg p-6">
            <h4 className="font-semibold mb-4">Call History</h4>
            <div className="space-y-2">
              {capitalCalls.map((call) => (
                <div key={call.id} className="flex justify-between items-center text-sm">
                  <span>Call #{call.callNumber} ({call.callPercent}%)</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">${call.totalAmount.toLocaleString()}</span>
                    <span className={cn("px-2 py-0.5 rounded text-xs capitalize", getStatusColor(call.status))}>
                      {call.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Capital Call Modal */}
      {showCallModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">New Capital Call</h3>
              <button onClick={() => setShowCallModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                <p className="font-medium text-blue-800">Capital Call #{capitalCalls.length + 1}</p>
                <p className="text-blue-700">Remaining commitment: {formatCurrency(equityStructure.remainingCommitment)}</p>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Purpose *</label>
                <Input value={newCall.purpose} onChange={(e) => setNewCall(prev => ({ ...prev, purpose: e.target.value }))} placeholder="e.g., Construction Progress Call" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Call Percentage *</label>
                  <Input type="number" value={newCall.callPercent} onChange={(e) => setNewCall(prev => ({ ...prev, callPercent: e.target.value }))} placeholder="e.g., 15" />
                  <p className="text-xs text-gray-500 mt-1">
                    {newCall.callPercent && `= $${((parseFloat(newCall.callPercent) / 100) * equityStructure.totalEquityCommitted).toLocaleString()}`}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Due Date *</label>
                  <Input type="date" value={newCall.dueDate} onChange={(e) => setNewCall(prev => ({ ...prev, dueDate: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Notes</label>
                <textarea className="w-full border rounded-md px-3 py-2" rows={3} value={newCall.notes} onChange={(e) => setNewCall(prev => ({ ...prev, notes: e.target.value }))} placeholder="Capital call notes..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 sticky bottom-0">
              <Button variant="outline" onClick={() => setShowCallModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]">Create Capital Call</Button>
            </div>
          </div>
        </div>
      )}

      {/* Call Detail Modal */}
      {selectedCall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <div>
                <h3 className="font-semibold">Capital Call #{selectedCall.callNumber}</h3>
                <p className="text-sm text-gray-500">{selectedCall.purpose}</p>
              </div>
              <button onClick={() => setSelectedCall(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <span className={cn("px-3 py-1 rounded text-sm capitalize", getStatusColor(selectedCall.status))}>
                  {selectedCall.status}
                </span>
                <span className="text-sm text-gray-500">Due: {selectedCall.dueDate}</span>
                {selectedCall.fundedDate && (
                  <span className="text-sm text-gray-500">Funded: {selectedCall.fundedDate}</span>
                )}
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Call %</p>
                  <p className="text-lg font-semibold">{selectedCall.callPercent}%</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Total Amount</p>
                  <p className="text-lg font-semibold">${selectedCall.totalAmount.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Received</p>
                  <p className="text-lg font-semibold text-green-600">${getCallReceivedAmount(selectedCall).toLocaleString()}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Pending</p>
                  <p className="text-lg font-semibold text-amber-600">${getCallPendingAmount(selectedCall).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Investor Responses</h4>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2">Investor</th>
                      <th className="text-right px-3 py-2">Amount</th>
                      <th className="text-left px-3 py-2">Status</th>
                      <th className="text-left px-3 py-2">Received</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedCall.responses.map((response, idx) => {
                      const investor = getInvestorById(response.investorId);
                      return (
                        <tr key={idx}>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              {response.status === 'received' ? (
                                <UserCheck className="w-4 h-4 text-green-500" />
                              ) : (
                                <UserX className="w-4 h-4 text-amber-500" />
                              )}
                              <span>{investor?.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right font-medium">${response.amount.toLocaleString()}</td>
                          <td className="px-3 py-2">
                            <span className={cn("px-2 py-0.5 rounded text-xs capitalize", getStatusColor(response.status))}>
                              {response.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-xs">{response.receivedDate || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {selectedCall.notes && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-sm">{selectedCall.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
              <Button variant="outline" size="sm"><Send className="w-4 h-4 mr-1" />Send Reminder</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedCall(null)}>Close</Button>
                <Button className="bg-[#047857] hover:bg-[#065f46]"><Edit2 className="w-4 h-4 mr-1" />Edit</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquityCallsPage;
