import React, { useState } from 'react';
import { Plus, Search, Eye, Edit2, X, DollarSign, Percent, Calendar, Building2, FileText, Download, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const ProjectLoansPage = ({ projectId }) => {
  const [showDrawModal, setShowDrawModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'draws', 'documents'

  const [loans, setLoans] = useState([
    {
      id: 'LOAN-001',
      name: 'Construction Loan',
      lender: 'First National Bank',
      lenderContact: 'Sarah Mitchell',
      lenderPhone: '(555) 123-4567',
      lenderEmail: 'smitchell@fnb.com',
      type: 'construction',
      commitment: 5800000,
      drawn: 4800000,
      available: 1000000,
      interestRate: 8.5,
      rateType: 'Prime + 2.0%',
      term: 24,
      maturityDate: '2025-12-31',
      originationDate: '2024-01-15',
      originationFee: 58000,
      status: 'active',
      ltc: 75,
      interestReserve: 450000,
      interestReserveUsed: 285000,
      covenants: [
        { name: 'LTC Ratio', required: '75%', current: '72%', status: 'compliant' },
        { name: 'Minimum Equity', required: '$2.5M', current: '$2.5M', status: 'compliant' },
        { name: 'Completion Date', required: 'Dec 2024', current: 'On Track', status: 'compliant' },
      ],
    },
  ]);

  const [draws, setDraws] = useState([
    { id: 'DRW-012', date: '2024-12-15', requestAmount: 445000, approvedAmount: 445000, status: 'funded', description: 'December draw - framing completion', inspectionDate: '2024-12-12', inspectionPassed: true },
    { id: 'DRW-011', date: '2024-11-15', requestAmount: 450000, approvedAmount: 450000, status: 'funded', description: 'November draw - mechanicals', inspectionDate: '2024-11-12', inspectionPassed: true },
    { id: 'DRW-010', date: '2024-10-15', requestAmount: 380000, approvedAmount: 380000, status: 'funded', description: 'October draw - framing', inspectionDate: '2024-10-11', inspectionPassed: true },
    { id: 'DRW-009', date: '2024-09-15', requestAmount: 420000, approvedAmount: 420000, status: 'funded', description: 'September draw - framing', inspectionDate: '2024-09-12', inspectionPassed: true },
    { id: 'DRW-008', date: '2024-08-15', requestAmount: 350000, approvedAmount: 350000, status: 'funded', description: 'August draw - framing start', inspectionDate: '2024-08-12', inspectionPassed: true },
    { id: 'DRW-007', date: '2024-07-15', requestAmount: 380000, approvedAmount: 380000, status: 'funded', description: 'July draw - foundation complete', inspectionDate: '2024-07-11', inspectionPassed: true },
    { id: 'DRW-006', date: '2024-06-15', requestAmount: 425000, approvedAmount: 425000, status: 'funded', description: 'June draw - foundation', inspectionDate: '2024-06-12', inspectionPassed: true },
    { id: 'DRW-005', date: '2024-05-15', requestAmount: 380000, approvedAmount: 380000, status: 'funded', description: 'May draw - foundation', inspectionDate: '2024-05-10', inspectionPassed: true },
    { id: 'DRW-004', date: '2024-04-15', requestAmount: 420000, approvedAmount: 420000, status: 'funded', description: 'April draw - sitework complete', inspectionDate: '2024-04-12', inspectionPassed: true },
    { id: 'DRW-003', date: '2024-03-15', requestAmount: 650000, approvedAmount: 650000, status: 'funded', description: 'March draw - sitework', inspectionDate: '2024-03-12', inspectionPassed: true },
    { id: 'DRW-002', date: '2024-02-15', requestAmount: 500000, approvedAmount: 500000, status: 'funded', description: 'February draw - initial sitework', inspectionDate: '2024-02-12', inspectionPassed: true },
  ]);

  const [newDraw, setNewDraw] = useState({
    requestAmount: '',
    description: '',
    breakdown: [
      { category: 'Hard Costs', amount: '' },
      { category: 'Soft Costs', amount: '' },
      { category: 'Interest', amount: '' },
    ],
  });

  const loan = loans[0]; // Primary loan for this project
  const utilizationPercent = (loan.drawn / loan.commitment) * 100;
  const interestReservePercent = (loan.interestReserveUsed / loan.interestReserve) * 100;

  const getStatusColor = (status) => {
    switch (status) {
      case 'funded': return 'bg-green-100 text-green-700';
      case 'approved': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatCurrency = (value) => {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  const handleDrawSubmit = () => {
    const totalBreakdown = newDraw.breakdown.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
    const draw = {
      id: `DRW-${String(draws.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      requestAmount: parseFloat(newDraw.requestAmount) || totalBreakdown,
      approvedAmount: 0,
      status: 'pending',
      description: newDraw.description,
      inspectionDate: null,
      inspectionPassed: null,
    };
    setDraws(prev => [draw, ...prev]);
    setShowDrawModal(false);
    setNewDraw({ requestAmount: '', description: '', breakdown: [{ category: 'Hard Costs', amount: '' }, { category: 'Soft Costs', amount: '' }, { category: 'Interest', amount: '' }] });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Project Loans</h1>
          <p className="text-sm text-gray-500">Construction loan management and draw requests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowDrawModal(true)}>
            <Plus className="w-4 h-4 mr-1" />Request Draw
          </Button>
        </div>
      </div>

      {/* Loan Summary Cards */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Commitment</p>
          <p className="text-xl font-semibold">{formatCurrency(loan.commitment)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-xs text-gray-500">Drawn</p>
          <p className="text-xl font-semibold text-blue-600">{formatCurrency(loan.drawn)}</p>
          <p className="text-xs text-gray-400">{utilizationPercent.toFixed(0)}% utilized</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-xs text-gray-500">Available</p>
          <p className="text-xl font-semibold text-green-600">{formatCurrency(loan.available)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Interest Rate</p>
          <p className="text-xl font-semibold">{loan.interestRate}%</p>
          <p className="text-xs text-gray-400">{loan.rateType}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Interest Reserve</p>
          <p className="text-xl font-semibold">{formatCurrency(loan.interestReserve - loan.interestReserveUsed)}</p>
          <p className="text-xs text-gray-400">{interestReservePercent.toFixed(0)}% used</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Maturity</p>
          <p className="text-xl font-semibold">{new Date(loan.maturityDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
          <p className="text-xs text-gray-400">{Math.ceil((new Date(loan.maturityDate) - new Date()) / (1000 * 60 * 60 * 24 * 30))} months</p>
        </div>
      </div>

      {/* Utilization Bar */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Loan Utilization</span>
          <span className="text-sm text-gray-500">{formatCurrency(loan.drawn)} of {formatCurrency(loan.commitment)}</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 rounded-full transition-all" 
            style={{ width: `${utilizationPercent}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>{utilizationPercent.toFixed(1)}% drawn</span>
          <span>{(100 - utilizationPercent).toFixed(1)}% available</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('overview')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'overview' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Overview
        </button>
        <button onClick={() => setActiveTab('draws')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'draws' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Draw History ({draws.length})
        </button>
        <button onClick={() => setActiveTab('documents')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'documents' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Documents
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-3 gap-6">
          {/* Loan Details */}
          <div className="col-span-2 space-y-4">
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Loan Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Lender</span>
                    <span className="font-medium">{loan.lender}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Loan Type</span>
                    <span className="font-medium capitalize">{loan.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Origination Date</span>
                    <span className="font-medium">{loan.originationDate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Maturity Date</span>
                    <span className="font-medium">{loan.maturityDate}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Term</span>
                    <span className="font-medium">{loan.term} months</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Interest Rate</span>
                    <span className="font-medium">{loan.interestRate}% ({loan.rateType})</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Origination Fee</span>
                    <span className="font-medium">${loan.originationFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">LTC</span>
                    <span className="font-medium">{loan.ltc}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Covenants */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Loan Covenants</h3>
              <div className="space-y-3">
                {loan.covenants.map((covenant, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{covenant.name}</p>
                      <p className="text-xs text-gray-500">Required: {covenant.required}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{covenant.current}</span>
                      <span className={cn("px-2 py-1 rounded text-xs flex items-center gap-1", covenant.status === 'compliant' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                        {covenant.status === 'compliant' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {covenant.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Draws */}
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Draws</h3>
                <button onClick={() => setActiveTab('draws')} className="text-sm text-[#047857] hover:underline">View All</button>
              </div>
              <div className="space-y-2">
                {draws.slice(0, 5).map(draw => (
                  <div key={draw.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-gray-500">{draw.id}</span>
                      <div>
                        <p className="text-sm font-medium">{draw.description}</p>
                        <p className="text-xs text-gray-500">{draw.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">${draw.approvedAmount.toLocaleString()}</span>
                      <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(draw.status))}>
                        {draw.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lender Contact */}
          <div className="space-y-4">
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Lender Contact</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{loan.lenderContact}</p>
                  <p className="text-sm text-gray-500">{loan.lender}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone</span>
                  <a href={`tel:${loan.lenderPhone}`} className="text-[#047857] hover:underline">{loan.lenderPhone}</a>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <a href={`mailto:${loan.lenderEmail}`} className="text-[#047857] hover:underline">{loan.lenderEmail}</a>
                </div>
              </div>
            </div>

            {/* Interest Reserve */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Interest Reserve</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Reserve</span>
                  <span className="font-medium">${loan.interestReserve.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Used</span>
                  <span className="font-medium text-amber-600">${loan.interestReserveUsed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Remaining</span>
                  <span className="font-medium text-green-600">${(loan.interestReserve - loan.interestReserveUsed).toLocaleString()}</span>
                </div>
                <div className="pt-2">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full" 
                      style={{ width: `${interestReservePercent}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{interestReservePercent.toFixed(0)}% utilized</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button className="w-full justify-start bg-[#047857] hover:bg-[#065f46]" onClick={() => setShowDrawModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />Request Draw
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />Upload Document
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />Schedule Inspection
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'draws' && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Draw #</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Description</th>
                <th className="text-right px-4 py-3 font-medium">Requested</th>
                <th className="text-right px-4 py-3 font-medium">Approved</th>
                <th className="text-left px-4 py-3 font-medium">Inspection</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {draws.map(draw => (
                <tr key={draw.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-[#047857]">{draw.id}</td>
                  <td className="px-4 py-3">{draw.date}</td>
                  <td className="px-4 py-3">{draw.description}</td>
                  <td className="px-4 py-3 text-right">${draw.requestAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-medium">${draw.approvedAmount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {draw.inspectionDate ? (
                      <div className="flex items-center gap-1">
                        {draw.inspectionPassed ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-amber-500" />}
                        <span className="text-xs">{draw.inspectionDate}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(draw.status))}>
                      {draw.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1 hover:bg-gray-100 rounded"><Eye className="w-4 h-4 text-gray-500" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white border rounded-lg p-6 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="font-medium mb-2">Loan Documents</h3>
          <p className="text-sm text-gray-500 mb-4">Upload and manage loan-related documents</p>
          <Button variant="outline"><Plus className="w-4 h-4 mr-1" />Upload Document</Button>
        </div>
      )}

      {/* Draw Request Modal */}
      {showDrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">Request Draw</h3>
              <button onClick={() => setShowDrawModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 rounded-lg p-3 text-sm">
                <p className="font-medium text-blue-800">Available to Draw</p>
                <p className="text-2xl font-semibold text-blue-600">${loan.available.toLocaleString()}</p>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Total Draw Amount *</label>
                <Input 
                  type="number" 
                  value={newDraw.requestAmount} 
                  onChange={(e) => setNewDraw(prev => ({ ...prev, requestAmount: e.target.value }))} 
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Breakdown by Category</label>
                {newDraw.breakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-500 w-24">{item.category}</span>
                    <Input 
                      type="number" 
                      placeholder="0.00"
                      value={item.amount}
                      onChange={(e) => {
                        const newBreakdown = [...newDraw.breakdown];
                        newBreakdown[idx].amount = e.target.value;
                        setNewDraw(prev => ({ ...prev, breakdown: newBreakdown }));
                      }}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Description *</label>
                <textarea 
                  className="w-full border rounded-md px-3 py-2" 
                  rows={3}
                  value={newDraw.description}
                  onChange={(e) => setNewDraw(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the work completed and costs being drawn..."
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Supporting Documents</label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <FileText className="w-6 h-6 mx-auto text-gray-300 mb-1" />
                  <p className="text-sm text-gray-500">Upload invoices, lien waivers, etc.</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 sticky bottom-0">
              <Button variant="outline" onClick={() => setShowDrawModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleDrawSubmit}>Submit Request</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectLoansPage;
