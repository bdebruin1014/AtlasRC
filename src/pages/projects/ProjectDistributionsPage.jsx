import React, { useState } from 'react';
import { Plus, Search, Eye, Edit2, X, DollarSign, Calendar, User, Users, TrendingUp, Download, CheckCircle, Clock, AlertTriangle, Percent, PieChart, ArrowRight, Send, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const ProjectDistributionsPage = ({ projectId }) => {
  const [showDistributionModal, setShowDistributionModal] = useState(false);
  const [selectedDistribution, setSelectedDistribution] = useState(null);
  const [activeTab, setActiveTab] = useState('distributions'); // 'distributions', 'waterfall', 'investors'

  const projectData = {
    name: 'Oakridge Estates',
    totalEquity: 2500000,
    totalReturns: 3650000,
    totalDistributed: 2800000,
    pendingDistribution: 850000,
    projectProfit: 1150000,
    irr: 32.5,
    equityMultiple: 1.46,
  };

  const investors = [
    { id: 'INV-001', name: 'Bryan VanRock (Olive Brynn LLC)', type: 'Developer/Sponsor', commitment: 1800000, contributed: 1800000, ownership: 72.0, preferredReturn: 8, distributed: 2016000, pending: 612000, totalReturn: 2628000, multiple: 1.46 },
    { id: 'INV-002', name: 'Johnson Family Trust', type: 'LP Investor', commitment: 400000, contributed: 400000, ownership: 16.0, preferredReturn: 10, distributed: 448000, pending: 136000, totalReturn: 584000, multiple: 1.46 },
    { id: 'INV-003', name: 'Smith Capital Partners', type: 'LP Investor', commitment: 200000, contributed: 200000, ownership: 8.0, preferredReturn: 10, distributed: 224000, pending: 68000, totalReturn: 292000, multiple: 1.46 },
    { id: 'INV-004', name: 'Davis Investment Group', type: 'LP Investor', commitment: 100000, contributed: 100000, ownership: 4.0, preferredReturn: 10, distributed: 112000, pending: 34000, totalReturn: 146000, multiple: 1.46 },
  ];

  const [distributions, setDistributions] = useState([
    {
      id: 'DIST-001',
      date: '2025-01-15',
      type: 'Return of Capital',
      description: 'Unit 1 closing - return of capital',
      totalAmount: 500000,
      status: 'scheduled',
      allocations: [
        { investorId: 'INV-001', investorName: 'Bryan VanRock (Olive Brynn LLC)', amount: 360000, percentage: 72.0 },
        { investorId: 'INV-002', investorName: 'Johnson Family Trust', amount: 80000, percentage: 16.0 },
        { investorId: 'INV-003', investorName: 'Smith Capital Partners', amount: 40000, percentage: 8.0 },
        { investorId: 'INV-004', investorName: 'Davis Investment Group', amount: 20000, percentage: 4.0 },
      ],
      notes: 'Proceeds from Unit 1 closing on 12/20/24.',
    },
    {
      id: 'DIST-002',
      date: '2024-12-20',
      type: 'Return of Capital',
      description: 'Initial capital return - land profit',
      totalAmount: 350000,
      status: 'completed',
      paidDate: '2024-12-22',
      allocations: [
        { investorId: 'INV-001', investorName: 'Bryan VanRock (Olive Brynn LLC)', amount: 252000, percentage: 72.0 },
        { investorId: 'INV-002', investorName: 'Johnson Family Trust', amount: 56000, percentage: 16.0 },
        { investorId: 'INV-003', investorName: 'Smith Capital Partners', amount: 28000, percentage: 8.0 },
        { investorId: 'INV-004', investorName: 'Davis Investment Group', amount: 14000, percentage: 4.0 },
      ],
      notes: 'Early land value distribution.',
    },
    {
      id: 'DIST-003',
      date: '2024-11-15',
      type: 'Preferred Return',
      description: 'Q4 2024 preferred return',
      totalAmount: 50000,
      status: 'completed',
      paidDate: '2024-11-18',
      allocations: [
        { investorId: 'INV-001', investorName: 'Bryan VanRock (Olive Brynn LLC)', amount: 36000, percentage: 72.0 },
        { investorId: 'INV-002', investorName: 'Johnson Family Trust', amount: 8000, percentage: 16.0 },
        { investorId: 'INV-003', investorName: 'Smith Capital Partners', amount: 4000, percentage: 8.0 },
        { investorId: 'INV-004', investorName: 'Davis Investment Group', amount: 2000, percentage: 4.0 },
      ],
      notes: 'Quarterly preferred return payment.',
    },
  ]);

  const waterfallStructure = [
    { tier: 1, name: 'Return of Capital', description: '100% to investors pro-rata until capital returned', lpSplit: 100, sponsorSplit: 0, threshold: 'Capital Return', status: 'active' },
    { tier: 2, name: 'Preferred Return', description: 'LP: 10% pref, Sponsor: 8% pref', lpSplit: 100, sponsorSplit: 100, threshold: 'Pref Hurdle', status: 'active' },
    { tier: 3, name: 'Catch-up', description: 'Sponsor catch-up to 20% of profits', lpSplit: 0, sponsorSplit: 100, threshold: 'Catch-up', status: 'pending' },
    { tier: 4, name: 'Profit Split', description: '80% LP / 20% Sponsor promote', lpSplit: 80, sponsorSplit: 20, threshold: 'Remaining', status: 'pending' },
  ];

  const [newDistribution, setNewDistribution] = useState({
    date: '',
    type: 'Return of Capital',
    description: '',
    totalAmount: '',
    notes: '',
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-amber-100 text-amber-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatCurrency = (value) => {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  const handleSaveDistribution = () => {
    const totalAmount = parseFloat(newDistribution.totalAmount) || 0;
    const distribution = {
      id: `DIST-${String(distributions.length + 1).padStart(3, '0')}`,
      ...newDistribution,
      totalAmount,
      status: 'scheduled',
      allocations: investors.map(inv => ({
        investorId: inv.id,
        investorName: inv.name,
        amount: Math.round(totalAmount * (inv.ownership / 100)),
        percentage: inv.ownership,
      })),
    };
    setDistributions(prev => [distribution, ...prev]);
    setShowDistributionModal(false);
    setNewDistribution({ date: '', type: 'Return of Capital', description: '', totalAmount: '', notes: '' });
  };

  const totalDistributed = distributions.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.totalAmount, 0);
  const scheduledDistributions = distributions.filter(d => d.status === 'scheduled').reduce((sum, d) => sum + d.totalAmount, 0);

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Distributions</h1>
          <p className="text-sm text-gray-500">Investor distributions and waterfall tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowDistributionModal(true)}>
            <Plus className="w-4 h-4 mr-1" />New Distribution
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Total Equity</p>
          <p className="text-xl font-semibold">{formatCurrency(projectData.totalEquity)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-xs text-gray-500">Total Returns</p>
          <p className="text-xl font-semibold text-green-600">{formatCurrency(projectData.totalReturns)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-xs text-gray-500">Distributed</p>
          <p className="text-xl font-semibold text-blue-600">{formatCurrency(totalDistributed)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-amber-500">
          <p className="text-xs text-gray-500">Scheduled</p>
          <p className="text-xl font-semibold text-amber-600">{formatCurrency(scheduledDistributions)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Project IRR</p>
          <p className="text-xl font-semibold">{projectData.irr}%</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Equity Multiple</p>
          <p className="text-xl font-semibold">{projectData.equityMultiple}x</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('distributions')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'distributions' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Distributions ({distributions.length})
        </button>
        <button onClick={() => setActiveTab('waterfall')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'waterfall' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Waterfall
        </button>
        <button onClick={() => setActiveTab('investors')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'investors' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Investors ({investors.length})
        </button>
      </div>

      {/* Distributions Tab */}
      {activeTab === 'distributions' && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Distribution #</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Description</th>
                <th className="text-right px-4 py-3 font-medium">Amount</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {distributions.map((dist) => (
                <tr key={dist.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-[#047857]">{dist.id}</span>
                  </td>
                  <td className="px-4 py-3">{dist.date}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">{dist.type}</span>
                  </td>
                  <td className="px-4 py-3">{dist.description}</td>
                  <td className="px-4 py-3 text-right font-semibold">${dist.totalAmount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(dist.status))}>
                      {dist.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1 hover:bg-gray-100 rounded" onClick={() => setSelectedDistribution(dist)}>
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                      {dist.status === 'scheduled' && (
                        <button className="p-1 hover:bg-green-100 rounded" title="Process">
                          <Send className="w-4 h-4 text-green-500" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t font-semibold">
              <tr>
                <td colSpan={4} className="px-4 py-3">Total Distributions</td>
                <td className="px-4 py-3 text-right">${distributions.reduce((sum, d) => sum + d.totalAmount, 0).toLocaleString()}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Waterfall Tab */}
      {activeTab === 'waterfall' && (
        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Distribution Waterfall Structure</h3>
            <div className="space-y-3">
              {waterfallStructure.map((tier, idx) => (
                <div key={tier.tier} className={cn("border rounded-lg p-4", tier.status === 'active' ? "bg-green-50 border-green-200" : "bg-gray-50")}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold", tier.status === 'active' ? "bg-green-500" : "bg-gray-400")}>
                        {tier.tier}
                      </div>
                      <div>
                        <p className="font-semibold">{tier.name}</p>
                        <p className="text-sm text-gray-600">{tier.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">LP Split</p>
                        <p className="font-semibold">{tier.lpSplit}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Sponsor Split</p>
                        <p className="font-semibold">{tier.sponsorSplit}%</p>
                      </div>
                      <span className={cn("px-2 py-1 rounded text-xs capitalize", tier.status === 'active' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}>
                        {tier.status}
                      </span>
                    </div>
                  </div>
                  {idx < waterfallStructure.length - 1 && (
                    <div className="flex justify-center mt-3">
                      <ArrowRight className="w-5 h-5 text-gray-300 rotate-90" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Waterfall Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-3">LP Returns Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total LP Equity</span>
                  <span className="font-medium">$700,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Capital Returned</span>
                  <span className="font-medium">$700,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Preferred Return Paid</span>
                  <span className="font-medium">$70,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Profit Distribution</span>
                  <span className="font-medium">$252,000</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-semibold">
                  <span>Total LP Returns</span>
                  <span className="text-green-600">$1,022,000</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>LP Multiple</span>
                  <span className="font-semibold">1.46x</span>
                </div>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-3">Sponsor Returns Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Sponsor Equity</span>
                  <span className="font-medium">$1,800,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Capital Returned</span>
                  <span className="font-medium">$1,800,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Preferred Return Paid</span>
                  <span className="font-medium">$144,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Promote / Profit Share</span>
                  <span className="font-medium">$684,000</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-semibold">
                  <span>Total Sponsor Returns</span>
                  <span className="text-green-600">$2,628,000</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Sponsor Multiple</span>
                  <span className="font-semibold">1.46x</span>
                </div>
              </div>
            </div>
          </div>
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
                <th className="text-right px-4 py-3 font-medium">Ownership</th>
                <th className="text-right px-4 py-3 font-medium">Pref Rate</th>
                <th className="text-right px-4 py-3 font-medium">Distributed</th>
                <th className="text-right px-4 py-3 font-medium">Pending</th>
                <th className="text-right px-4 py-3 font-medium">Total Return</th>
                <th className="text-right px-4 py-3 font-medium">Multiple</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {investors.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{inv.name}</p>
                      <p className="text-xs text-gray-500">{inv.id}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-1 rounded text-xs", inv.type === 'Developer/Sponsor' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700")}>
                      {inv.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">${inv.commitment.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{inv.ownership}%</td>
                  <td className="px-4 py-3 text-right">{inv.preferredReturn}%</td>
                  <td className="px-4 py-3 text-right text-green-600">${inv.distributed.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-amber-600">${inv.pending.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-semibold">${inv.totalReturn.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700 font-semibold">{inv.multiple}x</span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t font-semibold">
              <tr>
                <td className="px-4 py-3">Totals</td>
                <td></td>
                <td className="px-4 py-3 text-right">${investors.reduce((s, i) => s + i.commitment, 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right">100%</td>
                <td></td>
                <td className="px-4 py-3 text-right text-green-600">${investors.reduce((s, i) => s + i.distributed, 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-amber-600">${investors.reduce((s, i) => s + i.pending, 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right">${investors.reduce((s, i) => s + i.totalReturn, 0).toLocaleString()}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* New Distribution Modal */}
      {showDistributionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">New Distribution</h3>
              <button onClick={() => setShowDistributionModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Distribution Date *</label>
                  <Input type="date" value={newDistribution.date} onChange={(e) => setNewDistribution(prev => ({ ...prev, date: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Type *</label>
                  <select className="w-full border rounded-md px-3 py-2" value={newDistribution.type} onChange={(e) => setNewDistribution(prev => ({ ...prev, type: e.target.value }))}>
                    <option>Return of Capital</option>
                    <option>Preferred Return</option>
                    <option>Profit Distribution</option>
                    <option>Final Distribution</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Total Amount *</label>
                <Input type="number" value={newDistribution.totalAmount} onChange={(e) => setNewDistribution(prev => ({ ...prev, totalAmount: e.target.value }))} placeholder="0.00" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description *</label>
                <Input value={newDistribution.description} onChange={(e) => setNewDistribution(prev => ({ ...prev, description: e.target.value }))} placeholder="Distribution description" />
              </div>

              {/* Preview Allocations */}
              {newDistribution.totalAmount && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium mb-3">Allocation Preview</p>
                  <div className="space-y-2 text-sm">
                    {investors.map(inv => (
                      <div key={inv.id} className="flex justify-between">
                        <span className="text-gray-600">{inv.name} ({inv.ownership}%)</span>
                        <span className="font-medium">${Math.round(parseFloat(newDistribution.totalAmount) * (inv.ownership / 100)).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium block mb-1">Notes</label>
                <textarea className="w-full border rounded-md px-3 py-2" rows={3} value={newDistribution.notes} onChange={(e) => setNewDistribution(prev => ({ ...prev, notes: e.target.value }))} placeholder="Additional notes..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 sticky bottom-0">
              <Button variant="outline" onClick={() => setShowDistributionModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleSaveDistribution}>Create Distribution</Button>
            </div>
          </div>
        </div>
      )}

      {/* Distribution Detail Modal */}
      {selectedDistribution && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <div>
                <h3 className="font-semibold">{selectedDistribution.id}</h3>
                <p className="text-sm text-gray-500">{selectedDistribution.type}</p>
              </div>
              <button onClick={() => setSelectedDistribution(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center gap-3">
                <span className={cn("px-3 py-1 rounded text-sm capitalize", getStatusColor(selectedDistribution.status))}>
                  {selectedDistribution.status}
                </span>
                {selectedDistribution.paidDate && (
                  <span className="text-sm text-gray-500">Paid: {selectedDistribution.paidDate}</span>
                )}
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Distribution Date</p>
                  <p className="text-xl font-semibold">{selectedDistribution.date}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-xl font-semibold text-green-600">${selectedDistribution.totalAmount.toLocaleString()}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p>{selectedDistribution.description}</p>
              </div>

              {/* Allocations */}
              <div>
                <h4 className="font-semibold mb-3">Allocations</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-2 font-medium">Investor</th>
                        <th className="text-right px-4 py-2 font-medium">Ownership</th>
                        <th className="text-right px-4 py-2 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedDistribution.allocations.map((alloc, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2">{alloc.investorName}</td>
                          <td className="px-4 py-2 text-right">{alloc.percentage}%</td>
                          <td className="px-4 py-2 text-right font-medium">${alloc.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 font-semibold">
                      <tr>
                        <td className="px-4 py-2">Total</td>
                        <td className="px-4 py-2 text-right">100%</td>
                        <td className="px-4 py-2 text-right">${selectedDistribution.totalAmount.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {selectedDistribution.notes && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-sm">{selectedDistribution.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-1" />Generate Statements
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedDistribution(null)}>Close</Button>
                {selectedDistribution.status === 'scheduled' && (
                  <Button className="bg-[#047857] hover:bg-[#065f46]">
                    <Send className="w-4 h-4 mr-1" />Process Distribution
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDistributionsPage;
