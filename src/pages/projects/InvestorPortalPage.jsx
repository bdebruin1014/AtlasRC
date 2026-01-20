import React, { useState } from 'react';
import { DollarSign, TrendingUp, Calendar, FileText, Download, Eye, PieChart, BarChart3, Clock, CheckCircle, Home, Users, Percent, ArrowUpRight, ArrowDownRight, Building2, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const InvestorPortalPage = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'financials', 'documents', 'updates'

  // This would typically be filtered by logged-in investor
  const investorData = {
    investor: {
      name: 'Johnson Family Trust',
      id: 'INV-002',
      type: 'LP Investor',
      email: 'investments@johnsonfamily.com',
      phone: '(555) 888-9999',
    },
    investment: {
      commitment: 400000,
      contributed: 400000,
      ownership: 16.0,
      preferredReturn: 10,
      investmentDate: '2024-01-15',
    },
    returns: {
      totalDistributed: 448000,
      pendingDistribution: 136000,
      projectedTotal: 584000,
      currentMultiple: 1.46,
      projectedIRR: 32.5,
      preferredAccrued: 32000,
      preferredPaid: 32000,
    },
    project: {
      name: 'Oakridge Estates',
      address: '1250 Oakridge Drive, Greenville, SC',
      type: 'Residential Development',
      units: 12,
      status: 'Construction',
      completion: 68,
      startDate: '2024-01-15',
      projectedCompletion: '2025-06-30',
      sponsor: 'VanRock Holdings LLC',
    },
  };

  const distributions = [
    { id: 'DIST-001', date: '2025-01-15', type: 'Return of Capital', amount: 80000, status: 'scheduled' },
    { id: 'DIST-002', date: '2024-12-20', type: 'Return of Capital', amount: 56000, status: 'completed' },
    { id: 'DIST-003', date: '2024-11-15', type: 'Preferred Return', amount: 8000, status: 'completed' },
  ];

  const documents = [
    { id: 1, name: 'Q4 2024 Investor Report', type: 'Report', date: '2024-12-28', size: '2.4 MB' },
    { id: 2, name: 'November Distribution Statement', type: 'Statement', date: '2024-11-18', size: '156 KB' },
    { id: 3, name: 'Construction Progress Photos - Dec', type: 'Photos', date: '2024-12-20', size: '8.2 MB' },
    { id: 4, name: 'Q3 2024 Investor Report', type: 'Report', date: '2024-10-15', size: '2.1 MB' },
    { id: 5, name: 'Operating Agreement', type: 'Legal', date: '2024-01-15', size: '892 KB' },
    { id: 6, name: 'Subscription Agreement', type: 'Legal', date: '2024-01-10', size: '445 KB' },
  ];

  const updates = [
    { id: 1, date: '2024-12-28', title: 'Construction Update', content: 'Framing is 75% complete. Roof trusses installed on Building A. Mechanical rough-in starting next week.', type: 'progress' },
    { id: 2, date: '2024-12-20', title: 'First Unit Sold!', content: 'Unit 1 closed on December 20th for $579,000. Proceeds being distributed to investors.', type: 'milestone' },
    { id: 3, date: '2024-12-15', title: 'Distribution Scheduled', content: 'January distribution of $500,000 scheduled for 1/15/2025. Your share: $80,000.', type: 'distribution' },
    { id: 4, date: '2024-11-15', title: 'Q4 Preferred Return', content: 'Quarterly preferred return payment of $50,000 distributed. Your share: $8,000.', type: 'distribution' },
  ];

  const milestones = [
    { name: 'Land Acquisition', status: 'complete', date: '2024-01-15' },
    { name: 'Entitlements', status: 'complete', date: '2024-03-01' },
    { name: 'Construction Start', status: 'complete', date: '2024-03-15' },
    { name: 'Foundation Complete', status: 'complete', date: '2024-06-30' },
    { name: 'Framing Complete', status: 'in-progress', date: '2025-01-15' },
    { name: 'First Closing', status: 'complete', date: '2024-12-20' },
    { name: 'Construction Complete', status: 'pending', date: '2025-03-31' },
    { name: 'Project Sellout', status: 'pending', date: '2025-06-30' },
  ];

  const formatCurrency = (value) => {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  const getUpdateIcon = (type) => {
    switch (type) {
      case 'milestone': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'distribution': return <DollarSign className="w-5 h-5 text-blue-500" />;
      case 'progress': return <TrendingUp className="w-5 h-5 text-purple-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Investor Portal</h1>
          <p className="text-sm text-gray-500">Welcome back, {investorData.investor.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Download Report</Button>
        </div>
      </div>

      {/* Investment Summary Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Your Investment</p>
          <p className="text-2xl font-semibold">{formatCurrency(investorData.investment.contributed)}</p>
          <p className="text-xs text-gray-400">{investorData.investment.ownership}% ownership</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-xs text-gray-500">Total Distributed</p>
          <p className="text-2xl font-semibold text-green-600">{formatCurrency(investorData.returns.totalDistributed)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-amber-500">
          <p className="text-xs text-gray-500">Pending Distribution</p>
          <p className="text-2xl font-semibold text-amber-600">{formatCurrency(investorData.returns.pendingDistribution)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-xs text-gray-500">Projected Total</p>
          <p className="text-2xl font-semibold text-blue-600">{formatCurrency(investorData.returns.projectedTotal)}</p>
        </div>
        <div className="bg-gradient-to-br from-[#047857] to-[#065f46] text-white rounded-lg p-4">
          <p className="text-xs text-green-100">Current Multiple</p>
          <p className="text-2xl font-semibold">{investorData.returns.currentMultiple}x</p>
          <p className="text-xs text-green-100">{investorData.returns.projectedIRR}% IRR</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('overview')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'overview' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Overview
        </button>
        <button onClick={() => setActiveTab('financials')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'financials' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Financials
        </button>
        <button onClick={() => setActiveTab('documents')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'documents' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Documents ({documents.length})
        </button>
        <button onClick={() => setActiveTab('updates')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'updates' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Updates ({updates.length})
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-3 gap-6">
          {/* Project Info */}
          <div className="col-span-2 space-y-4">
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Project Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#047857] rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">{investorData.project.name}</p>
                      <p className="text-sm text-gray-500">{investorData.project.type}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Address</span>
                      <span>{investorData.project.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Units</span>
                      <span>{investorData.project.units}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sponsor</span>
                      <span>{investorData.project.sponsor}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Construction Progress</p>
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-semibold">{investorData.project.completion}%</span>
                      <span className="text-sm text-gray-500">Complete</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#047857] rounded-full" style={{ width: `${investorData.project.completion}%` }}></div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Start Date</span>
                      <span>{investorData.project.startDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Est. Completion</span>
                      <span>{investorData.project.projectedCompletion}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Project Milestones</h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-4">
                  {milestones.map((milestone, idx) => (
                    <div key={idx} className="relative flex items-center gap-4 pl-10">
                      <div className={cn("absolute left-2 w-5 h-5 rounded-full border-2 bg-white", 
                        milestone.status === 'complete' ? "border-green-500 bg-green-500" : 
                        milestone.status === 'in-progress' ? "border-blue-500" : "border-gray-300"
                      )}>
                        {milestone.status === 'complete' && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <span className={cn("text-sm", milestone.status === 'pending' && "text-gray-400")}>{milestone.name}</span>
                        <span className={cn("text-xs", milestone.status === 'complete' ? "text-green-600" : milestone.status === 'in-progress' ? "text-blue-600" : "text-gray-400")}>
                          {milestone.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Updates */}
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Updates</h3>
                <button onClick={() => setActiveTab('updates')} className="text-sm text-[#047857] hover:underline">View All</button>
              </div>
              <div className="space-y-3">
                {updates.slice(0, 3).map(update => (
                  <div key={update.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    {getUpdateIcon(update.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{update.title}</p>
                        <span className="text-xs text-gray-500">{update.date}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{update.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Your Investment */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Your Investment</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Commitment</span>
                  <span className="font-medium">${investorData.investment.commitment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Contributed</span>
                  <span className="font-medium">${investorData.investment.contributed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ownership %</span>
                  <span className="font-medium">{investorData.investment.ownership}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Preferred Return</span>
                  <span className="font-medium">{investorData.investment.preferredReturn}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Investment Date</span>
                  <span className="font-medium">{investorData.investment.investmentDate}</span>
                </div>
              </div>
            </div>

            {/* Upcoming Distribution */}
            {distributions.filter(d => d.status === 'scheduled').length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold mb-3 text-amber-800">Upcoming Distribution</h3>
                {distributions.filter(d => d.status === 'scheduled').map(dist => (
                  <div key={dist.id} className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="text-amber-700">Date</span>
                      <span className="font-medium">{dist.date}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-amber-700">Type</span>
                      <span className="font-medium">{dist.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-700">Your Share</span>
                      <span className="font-semibold text-amber-800">${dist.amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Contact */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Sponsor Contact</h3>
              <div className="space-y-3 text-sm">
                <p className="font-medium">VanRock Holdings LLC</p>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href="mailto:investors@vanrock.com" className="text-[#047857] hover:underline">investors@vanrock.com</a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a href="tel:+15551234567" className="text-[#047857] hover:underline">(555) 123-4567</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financials Tab */}
      {activeTab === 'financials' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Returns Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Initial Investment</span>
                <span className="font-medium">${investorData.investment.contributed.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Capital Returned</span>
                <span className="font-medium text-green-600">$400,000</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Preferred Return Paid</span>
                <span className="font-medium text-green-600">${investorData.returns.preferredPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Profit Distributions</span>
                <span className="font-medium text-green-600">$16,000</span>
              </div>
              <div className="flex justify-between py-2 font-semibold">
                <span>Total Distributed</span>
                <span className="text-green-600">${investorData.returns.totalDistributed.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 text-amber-600">
                <span>Pending Distribution</span>
                <span className="font-medium">${investorData.returns.pendingDistribution.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 pt-4 border-t text-lg font-semibold">
                <span>Projected Total Return</span>
                <span className="text-blue-600">${investorData.returns.projectedTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Distribution History</h3>
            <div className="space-y-3">
              {distributions.map(dist => (
                <div key={dist.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{dist.type}</p>
                    <p className="text-xs text-gray-500">{dist.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${dist.amount.toLocaleString()}</p>
                    <span className={cn("text-xs px-2 py-0.5 rounded", dist.status === 'completed' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
                      {dist.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-2 bg-white border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Investment Performance</h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Net Multiple</p>
                <p className="text-3xl font-semibold text-[#047857]">{investorData.returns.currentMultiple}x</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Net IRR</p>
                <p className="text-3xl font-semibold text-[#047857]">{investorData.returns.projectedIRR}%</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Profit</p>
                <p className="text-3xl font-semibold text-green-600">${((investorData.returns.projectedTotal - investorData.investment.contributed) / 1000).toFixed(0)}K</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Hold Period</p>
                <p className="text-3xl font-semibold">18 mo</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Document</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Size</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {documents.map(doc => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded text-xs bg-gray-100">{doc.type}</span>
                  </td>
                  <td className="px-4 py-3">{doc.date}</td>
                  <td className="px-4 py-3 text-gray-500">{doc.size}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="p-1 hover:bg-gray-100 rounded"><Eye className="w-4 h-4 text-gray-500" /></button>
                      <button className="p-1 hover:bg-gray-100 rounded"><Download className="w-4 h-4 text-gray-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Updates Tab */}
      {activeTab === 'updates' && (
        <div className="space-y-4">
          {updates.map(update => (
            <div key={update.id} className="bg-white border rounded-lg p-4">
              <div className="flex gap-4">
                {getUpdateIcon(update.type)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{update.title}</h4>
                    <span className="text-sm text-gray-500">{update.date}</span>
                  </div>
                  <p className="text-gray-600">{update.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvestorPortalPage;
