import React, { useState } from 'react';
import { Plus, Search, Eye, Edit2, X, Download, FileText, DollarSign, Calendar, CheckCircle, Clock, AlertTriangle, Send, Printer, Upload, Building2, Percent, TrendingUp, Calculator, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const DrawRequestsPage = ({ projectId }) => {
  const [showDrawModal, setShowDrawModal] = useState(false);
  const [selectedDraw, setSelectedDraw] = useState(null);
  const [activeTab, setActiveTab] = useState('draws'); // 'draws', 'schedule', 'summary'
  const [expandedDraw, setExpandedDraw] = useState(null);

  const loanInfo = {
    lender: 'First National Bank',
    loanAmount: 5800000,
    interestRate: 8.5,
    term: '24 months',
    maturityDate: '2026-01-15',
    loanToValue: 65,
    totalDrawn: 3950000,
    availableToDraw: 1850000,
    retainageHeld: 197500,
  };

  const [draws, setDraws] = useState([
    {
      id: 'DRAW-001',
      drawNumber: 1,
      requestDate: '2024-03-20',
      periodStart: '2024-03-01',
      periodEnd: '2024-03-31',
      requestedAmount: 485000,
      approvedAmount: 485000,
      retainage: 24250,
      netFunded: 460750,
      status: 'funded',
      fundedDate: '2024-04-01',
      inspector: 'Bank Inspector',
      inspectionDate: '2024-03-28',
      notes: 'Initial draw - land acquisition and soft costs',
      lineItems: [
        { costCode: '01-001', description: 'Land Purchase', budgeted: 1200000, previouslyDrawn: 0, thisRequest: 400000, totalDrawn: 400000, percentComplete: 33 },
        { costCode: '03-005', description: 'Permits & Fees', budgeted: 68000, previouslyDrawn: 0, thisRequest: 45000, totalDrawn: 45000, percentComplete: 66 },
        { costCode: '03-001', description: 'Architecture & Design', budgeted: 85000, previouslyDrawn: 0, thisRequest: 40000, totalDrawn: 40000, percentComplete: 47 },
      ],
    },
    {
      id: 'DRAW-002',
      drawNumber: 2,
      requestDate: '2024-04-25',
      periodStart: '2024-04-01',
      periodEnd: '2024-04-30',
      requestedAmount: 320000,
      approvedAmount: 320000,
      retainage: 16000,
      netFunded: 304000,
      status: 'funded',
      fundedDate: '2024-05-05',
      inspector: 'Bank Inspector',
      inspectionDate: '2024-05-02',
      notes: 'Site work and remaining land costs',
      lineItems: [
        { costCode: '01-001', description: 'Land Purchase', budgeted: 1200000, previouslyDrawn: 400000, thisRequest: 800000, totalDrawn: 1200000, percentComplete: 100 },
        { costCode: '02-001', description: 'Site Work & Grading', budgeted: 185000, previouslyDrawn: 0, thisRequest: 120000, totalDrawn: 120000, percentComplete: 65 },
      ],
    },
    // Continue with more draws...
    {
      id: 'DRAW-012',
      drawNumber: 12,
      requestDate: '2024-12-08',
      periodStart: '2024-12-01',
      periodEnd: '2024-12-15',
      requestedAmount: 445000,
      approvedAmount: 445000,
      retainage: 22250,
      netFunded: 422750,
      status: 'funded',
      fundedDate: '2024-12-15',
      inspector: 'Bank Inspector',
      inspectionDate: '2024-12-12',
      notes: 'December progress - framing, MEP, finishes',
      lineItems: [
        { costCode: '02-004', description: 'Framing & Structural', budgeted: 624000, previouslyDrawn: 520000, thisRequest: 85000, totalDrawn: 605000, percentComplete: 97 },
        { costCode: '02-009', description: 'Electrical', budgeted: 204000, previouslyDrawn: 120000, thisRequest: 36000, totalDrawn: 156000, percentComplete: 76 },
        { costCode: '02-008', description: 'Plumbing', budgeted: 192000, previouslyDrawn: 115000, thisRequest: 30000, totalDrawn: 145000, percentComplete: 76 },
        { costCode: '02-010', description: 'HVAC', budgeted: 216000, previouslyDrawn: 120000, thisRequest: 42000, totalDrawn: 162000, percentComplete: 75 },
        { costCode: '02-013', description: 'Interior Finishes', budgeted: 288000, previouslyDrawn: 85000, thisRequest: 65000, totalDrawn: 150000, percentComplete: 52 },
        { costCode: '02-015', description: 'Cabinets & Countertops', budgeted: 264000, previouslyDrawn: 100000, thisRequest: 80000, totalDrawn: 180000, percentComplete: 68 },
        { costCode: '04-002', description: 'Construction Interest', budgeted: 435000, previouslyDrawn: 280000, thisRequest: 35000, totalDrawn: 315000, percentComplete: 72 },
      ],
    },
    {
      id: 'DRAW-013',
      drawNumber: 13,
      requestDate: '2024-12-28',
      periodStart: '2024-12-16',
      periodEnd: '2024-12-31',
      requestedAmount: 380000,
      approvedAmount: null,
      retainage: 19000,
      netFunded: null,
      status: 'pending',
      fundedDate: null,
      inspector: 'Bank Inspector',
      inspectionDate: '2025-01-02',
      notes: 'End of December progress',
      lineItems: [
        { costCode: '02-013', description: 'Interior Finishes', budgeted: 288000, previouslyDrawn: 150000, thisRequest: 55000, totalDrawn: 205000, percentComplete: 71 },
        { costCode: '02-014', description: 'Flooring', budgeted: 180000, previouslyDrawn: 90000, thisRequest: 45000, totalDrawn: 135000, percentComplete: 75 },
        { costCode: '02-015', description: 'Cabinets & Countertops', budgeted: 264000, previouslyDrawn: 180000, thisRequest: 50000, totalDrawn: 230000, percentComplete: 87 },
        { costCode: '02-016', description: 'Appliances', budgeted: 108000, previouslyDrawn: 45000, thisRequest: 35000, totalDrawn: 80000, percentComplete: 74 },
        { costCode: '02-006', description: 'Exterior Finishes', budgeted: 234000, previouslyDrawn: 85000, thisRequest: 60000, totalDrawn: 145000, percentComplete: 62 },
        { costCode: '04-002', description: 'Construction Interest', budgeted: 435000, previouslyDrawn: 315000, thisRequest: 35000, totalDrawn: 350000, percentComplete: 80 },
      ],
    },
  ]);

  const drawSchedule = [
    { month: 'Mar 2024', projected: 485000, actual: 485000, cumulative: 485000 },
    { month: 'Apr 2024', projected: 350000, actual: 320000, cumulative: 805000 },
    { month: 'May 2024', projected: 380000, actual: 395000, cumulative: 1200000 },
    { month: 'Jun 2024', projected: 420000, actual: 410000, cumulative: 1610000 },
    { month: 'Jul 2024', projected: 450000, actual: 445000, cumulative: 2055000 },
    { month: 'Aug 2024', projected: 400000, actual: 420000, cumulative: 2475000 },
    { month: 'Sep 2024', projected: 380000, actual: 365000, cumulative: 2840000 },
    { month: 'Oct 2024', projected: 350000, actual: 340000, cumulative: 3180000 },
    { month: 'Nov 2024', projected: 320000, actual: 325000, cumulative: 3505000 },
    { month: 'Dec 2024', projected: 450000, actual: 445000, cumulative: 3950000 },
    { month: 'Jan 2025', projected: 400000, actual: null, cumulative: null },
    { month: 'Feb 2025', projected: 350000, actual: null, cumulative: null },
    { month: 'Mar 2025', projected: 300000, actual: null, cumulative: null },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'funded': return 'bg-green-100 text-green-700';
      case 'approved': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'submitted': return 'bg-purple-100 text-purple-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'draft': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '-';
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  const utilizationPercent = ((loanInfo.totalDrawn / loanInfo.loanAmount) * 100).toFixed(1);

  const [newDraw, setNewDraw] = useState({
    periodStart: '',
    periodEnd: '',
    notes: '',
  });

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Draw Requests</h1>
          <p className="text-sm text-gray-500">{loanInfo.lender} • Construction Loan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowDrawModal(true)}>
            <Plus className="w-4 h-4 mr-1" />New Draw Request
          </Button>
        </div>
      </div>

      {/* Loan Summary Cards */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Loan Amount</p>
          <p className="text-xl font-semibold">{formatCurrency(loanInfo.loanAmount)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-xs text-gray-500">Total Drawn</p>
          <p className="text-xl font-semibold text-green-600">{formatCurrency(loanInfo.totalDrawn)}</p>
          <p className="text-xs text-gray-400">{utilizationPercent}% utilized</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-xs text-gray-500">Available</p>
          <p className="text-xl font-semibold text-blue-600">{formatCurrency(loanInfo.availableToDraw)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-amber-500">
          <p className="text-xs text-gray-500">Retainage Held</p>
          <p className="text-xl font-semibold text-amber-600">{formatCurrency(loanInfo.retainageHeld)}</p>
          <p className="text-xs text-gray-400">5% of draws</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Interest Rate</p>
          <p className="text-xl font-semibold">{loanInfo.interestRate}%</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Maturity</p>
          <p className="text-xl font-semibold">{loanInfo.maturityDate}</p>
        </div>
      </div>

      {/* Loan Utilization Bar */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Loan Utilization</span>
          <span className="text-sm text-gray-500">{formatCurrency(loanInfo.totalDrawn)} / {formatCurrency(loanInfo.loanAmount)}</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-[#047857] rounded-full" style={{ width: `${utilizationPercent}%` }}></div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>0%</span>
          <span>{utilizationPercent}% drawn</span>
          <span>100%</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('draws')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'draws' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Draw Requests ({draws.length})
        </button>
        <button onClick={() => setActiveTab('schedule')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'schedule' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Draw Schedule
        </button>
        <button onClick={() => setActiveTab('summary')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'summary' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Cost Summary
        </button>
      </div>

      {/* Draws Tab */}
      {activeTab === 'draws' && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="w-8 px-4 py-3"></th>
                <th className="text-left px-4 py-3 font-medium">Draw #</th>
                <th className="text-left px-4 py-3 font-medium">Period</th>
                <th className="text-left px-4 py-3 font-medium">Request Date</th>
                <th className="text-right px-4 py-3 font-medium">Requested</th>
                <th className="text-right px-4 py-3 font-medium">Approved</th>
                <th className="text-right px-4 py-3 font-medium">Retainage</th>
                <th className="text-right px-4 py-3 font-medium">Net Funded</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {draws.map((draw) => (
                <React.Fragment key={draw.id}>
                  <tr className={cn("hover:bg-gray-50", draw.status === 'pending' && "bg-amber-50")}>
                    <td className="px-4 py-3">
                      <button onClick={() => setExpandedDraw(expandedDraw === draw.id ? null : draw.id)}>
                        {expandedDraw === draw.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-medium">Draw #{draw.drawNumber}</td>
                    <td className="px-4 py-3 text-xs">{draw.periodStart} - {draw.periodEnd}</td>
                    <td className="px-4 py-3 text-xs">{draw.requestDate}</td>
                    <td className="px-4 py-3 text-right font-medium">${draw.requestedAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{draw.approvedAmount ? `$${draw.approvedAmount.toLocaleString()}` : '-'}</td>
                    <td className="px-4 py-3 text-right text-amber-600">${draw.retainage.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-green-600 font-medium">{draw.netFunded ? `$${draw.netFunded.toLocaleString()}` : '-'}</td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(draw.status))}>
                        {draw.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="p-1 hover:bg-gray-100 rounded" onClick={() => setSelectedDraw(draw)}>
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <FileText className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedDraw === draw.id && (
                    <tr>
                      <td colSpan="10" className="bg-gray-50 px-8 py-4">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-gray-500">
                              <th className="text-left py-1">Cost Code</th>
                              <th className="text-left py-1">Description</th>
                              <th className="text-right py-1">Budget</th>
                              <th className="text-right py-1">Prev. Drawn</th>
                              <th className="text-right py-1">This Request</th>
                              <th className="text-right py-1">Total Drawn</th>
                              <th className="text-right py-1">% Complete</th>
                            </tr>
                          </thead>
                          <tbody>
                            {draw.lineItems.map((item, idx) => (
                              <tr key={idx} className="border-t">
                                <td className="py-2 font-mono">{item.costCode}</td>
                                <td className="py-2">{item.description}</td>
                                <td className="py-2 text-right">${item.budgeted.toLocaleString()}</td>
                                <td className="py-2 text-right">${item.previouslyDrawn.toLocaleString()}</td>
                                <td className="py-2 text-right font-medium text-[#047857]">${item.thisRequest.toLocaleString()}</td>
                                <td className="py-2 text-right">${item.totalDrawn.toLocaleString()}</td>
                                <td className="py-2 text-right">{item.percentComplete}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t font-semibold">
              <tr>
                <td className="px-4 py-3" colSpan="4">TOTALS</td>
                <td className="px-4 py-3 text-right">${draws.reduce((s, d) => s + d.requestedAmount, 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right">${draws.filter(d => d.approvedAmount).reduce((s, d) => s + d.approvedAmount, 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-amber-600">${draws.reduce((s, d) => s + d.retainage, 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-green-600">${draws.filter(d => d.netFunded).reduce((s, d) => s + d.netFunded, 0).toLocaleString()}</td>
                <td colSpan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Draw Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Month</th>
                <th className="text-right px-4 py-3 font-medium">Projected</th>
                <th className="text-right px-4 py-3 font-medium">Actual</th>
                <th className="text-right px-4 py-3 font-medium">Variance</th>
                <th className="text-right px-4 py-3 font-medium">Cumulative</th>
                <th className="text-left px-4 py-3 font-medium">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {drawSchedule.map((month, idx) => {
                const variance = month.actual !== null ? month.actual - month.projected : null;
                const cumulativePercent = month.cumulative ? ((month.cumulative / loanInfo.loanAmount) * 100).toFixed(0) : null;
                return (
                  <tr key={idx} className={cn("hover:bg-gray-50", month.actual === null && "text-gray-400")}>
                    <td className="px-4 py-3 font-medium">{month.month}</td>
                    <td className="px-4 py-3 text-right">${month.projected.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{month.actual !== null ? `$${month.actual.toLocaleString()}` : '-'}</td>
                    <td className="px-4 py-3 text-right">
                      {variance !== null && (
                        <span className={cn(variance >= 0 ? "text-amber-600" : "text-green-600")}>
                          {variance >= 0 ? '+' : ''}{formatCurrency(variance)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{month.cumulative ? `$${month.cumulative.toLocaleString()}` : '-'}</td>
                    <td className="px-4 py-3 w-40">
                      {cumulativePercent && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-[#047857] rounded-full" style={{ width: `${cumulativePercent}%` }}></div>
                          </div>
                          <span className="text-xs w-10">{cumulativePercent}%</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Cost Summary Tab */}
      {activeTab === 'summary' && (
        <div className="bg-white border rounded-lg p-6">
          <p className="text-gray-500 text-center py-8">Cost summary by category - Mock breakdown coming</p>
        </div>
      )}

      {/* New Draw Modal */}
      {showDrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">New Draw Request</h3>
              <button onClick={() => setShowDrawModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                <p className="font-medium text-blue-800">Draw #{draws.length + 1}</p>
                <p className="text-blue-700">Available to draw: {formatCurrency(loanInfo.availableToDraw)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Period Start *</label>
                  <Input type="date" value={newDraw.periodStart} onChange={(e) => setNewDraw(prev => ({ ...prev, periodStart: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Period End *</label>
                  <Input type="date" value={newDraw.periodEnd} onChange={(e) => setNewDraw(prev => ({ ...prev, periodEnd: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Notes</label>
                <textarea className="w-full border rounded-md px-3 py-2" rows={3} value={newDraw.notes} onChange={(e) => setNewDraw(prev => ({ ...prev, notes: e.target.value }))} placeholder="Draw request notes..." />
              </div>
              <p className="text-xs text-gray-500">Line items will be added after creating the draw request.</p>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 sticky bottom-0">
              <Button variant="outline" onClick={() => setShowDrawModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]">Create Draw Request</Button>
            </div>
          </div>
        </div>
      )}

      {/* Draw Detail Modal */}
      {selectedDraw && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <div>
                <h3 className="font-semibold">Draw #{selectedDraw.drawNumber}</h3>
                <p className="text-sm text-gray-500">{selectedDraw.periodStart} - {selectedDraw.periodEnd}</p>
              </div>
              <button onClick={() => setSelectedDraw(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <span className={cn("px-3 py-1 rounded text-sm capitalize", getStatusColor(selectedDraw.status))}>
                  {selectedDraw.status}
                </span>
                {selectedDraw.fundedDate && (
                  <span className="text-sm text-gray-500">Funded: {selectedDraw.fundedDate}</span>
                )}
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Requested</p>
                  <p className="text-lg font-semibold">${selectedDraw.requestedAmount.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Approved</p>
                  <p className="text-lg font-semibold">{selectedDraw.approvedAmount ? `$${selectedDraw.approvedAmount.toLocaleString()}` : '-'}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Retainage (5%)</p>
                  <p className="text-lg font-semibold text-amber-600">${selectedDraw.retainage.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Net Funded</p>
                  <p className="text-lg font-semibold text-green-600">{selectedDraw.netFunded ? `$${selectedDraw.netFunded.toLocaleString()}` : '-'}</p>
                </div>
              </div>

              {selectedDraw.inspectionDate && (
                <div className="text-sm">
                  <p className="text-gray-500">Bank Inspection</p>
                  <p className="font-medium">{selectedDraw.inspectionDate} - {selectedDraw.inspector}</p>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-3">Line Items</h4>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2">Cost Code</th>
                      <th className="text-left px-3 py-2">Description</th>
                      <th className="text-right px-3 py-2">This Request</th>
                      <th className="text-right px-3 py-2">% Complete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedDraw.lineItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 font-mono text-xs">{item.costCode}</td>
                        <td className="px-3 py-2">{item.description}</td>
                        <td className="px-3 py-2 text-right font-medium">${item.thisRequest.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right">{item.percentComplete}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedDraw.notes && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-sm">{selectedDraw.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
              <Button variant="outline" size="sm"><Printer className="w-4 h-4 mr-1" />Print</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedDraw(null)}>Close</Button>
                {selectedDraw.status === 'pending' && (
                  <Button className="bg-[#047857] hover:bg-[#065f46]"><Send className="w-4 h-4 mr-1" />Submit to Bank</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrawRequestsPage;
