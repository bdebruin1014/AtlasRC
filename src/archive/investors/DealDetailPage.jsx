import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit2, MoreVertical, Building2, MapPin, Calendar, DollarSign,
  Users, TrendingUp, Percent, FileText, PieChart, Clock, Plus, Download,
  CheckCircle, AlertCircle, Send, Eye, Trash2, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const DealDetailPage = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock deal data
  const deal = {
    id: dealId,
    name: 'Highland Park Lofts',
    internalName: 'HPL-2024',
    description: 'Class A multifamily development in downtown Greenville. 48-unit luxury apartment complex with ground floor retail.',
    stage: 'raising_capital',
    targetAmount: 2500000,
    totalRaised: 1875000,
    totalDistributions: 0,
    investorCount: 12,
    minInvestment: 50000,
    maxInvestment: 500000,
    preferredReturn: 8,
    targetIRR: 18,
    promoteSplit: 70,
    holdPeriod: 60,
    closeDate: '2025-03-15',
    offeringStartDate: '2024-12-01',
    address: '123 Main Street',
    city: 'Greenville',
    state: 'SC',
    zipCode: '29601',
    projectId: 'PRJ-001',
    sponsorEntity: 'VanRock Holdings LLC',
  };

  const investments = [
    { id: 1, investor: 'John Smith', email: 'john@email.com', amount: 250000, status: 'funded', fundedDate: '2024-12-15', ownership: 10.0 },
    { id: 2, investor: 'Jane Doe', email: 'jane@email.com', amount: 150000, status: 'funded', fundedDate: '2024-12-18', ownership: 6.0 },
    { id: 3, investor: 'Acme Investments LLC', email: 'invest@acme.com', amount: 500000, status: 'funded', fundedDate: '2024-12-20', ownership: 20.0 },
    { id: 4, investor: 'Robert Johnson', email: 'robert@email.com', amount: 100000, status: 'signed', signedDate: '2024-12-28', ownership: 4.0 },
    { id: 5, investor: 'Smith Family Trust', email: 'trust@smith.com', amount: 200000, status: 'pending', ownership: 8.0 },
  ];

  const distributions = [
    { id: 1, memo: 'Q4 2024 Preferred Return', type: 'preferred_return', amount: 50000, date: '2025-01-15', status: 'scheduled' },
  ];

  const documents = [
    { id: 1, name: 'Private Placement Memorandum', type: 'ppm', uploadedAt: '2024-11-15', size: '2.4 MB' },
    { id: 2, name: 'Subscription Agreement', type: 'subscription_agreement', uploadedAt: '2024-11-15', size: '856 KB' },
    { id: 3, name: 'Operating Agreement', type: 'operating_agreement', uploadedAt: '2024-11-15', size: '1.2 MB' },
    { id: 4, name: 'Property Due Diligence Report', type: 'due_diligence', uploadedAt: '2024-11-20', size: '4.8 MB' },
  ];

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  const percentFunded = Math.round((deal.totalRaised / deal.targetAmount) * 100);

  const getStatusConfig = (status) => {
    const configs = {
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
      accepted: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Accepted' },
      signed: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Signed' },
      funded: { bg: 'bg-green-100', text: 'text-green-700', label: 'Funded' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Scheduled' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
    };
    return configs[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'investments', label: 'Investments', icon: Users, count: investments.length },
    { id: 'distributions', label: 'Distributions', icon: DollarSign, count: distributions.length },
    { id: 'documents', label: 'Documents', icon: FileText, count: documents.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => navigate('/investors/deals')} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{deal.name}</h1>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">Raising Capital</span>
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />{deal.address}, {deal.city}, {deal.state} {deal.zipCode}
              </p>
            </div>
            <Button variant="outline"><Edit2 className="w-4 h-4 mr-2" />Edit Deal</Button>
            <Button className="bg-[#047857] hover:bg-[#065f46]"><Plus className="w-4 h-4 mr-2" />Add Investment</Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-6 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Target Raise</p>
              <p className="text-lg font-bold">{formatCurrency(deal.targetAmount)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Total Raised</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(deal.totalRaised)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">% Funded</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold">{percentFunded}%</p>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-[#047857] h-2 rounded-full" style={{ width: `${percentFunded}%` }} />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Investors</p>
              <p className="text-lg font-bold">{deal.investorCount}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Pref Return</p>
              <p className="text-lg font-bold">{deal.preferredReturn}%</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Target IRR</p>
              <p className="text-lg font-bold">{deal.targetIRR}%</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 border-t pt-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
                    activeTab === tab.id ? "bg-gray-50 text-[#047857] border-t-2 border-[#047857]" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">{tab.count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-semibold mb-4">Deal Description</h3>
                <p className="text-gray-600">{deal.description}</p>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-semibold mb-4">Investment Terms</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Minimum Investment</span><span className="font-medium">{formatCurrency(deal.minInvestment)}</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Maximum Investment</span><span className="font-medium">{formatCurrency(deal.maxInvestment)}</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Preferred Return</span><span className="font-medium">{deal.preferredReturn}%</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-gray-500">LP/GP Split</span><span className="font-medium">{deal.promoteSplit}/{100 - deal.promoteSplit}</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Target IRR</span><span className="font-medium">{deal.targetIRR}%</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Hold Period</span><span className="font-medium">{deal.holdPeriod} months</span></div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-semibold mb-4">Key Dates</h3>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-gray-500">Offering Start</span><span className="font-medium">{deal.offeringStartDate}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Close Date</span><span className="font-medium">{deal.closeDate}</span></div>
                </div>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-semibold mb-4">Sponsor</h3>
                <p className="font-medium">{deal.sponsorEntity}</p>
                <p className="text-sm text-gray-500 mt-1">Managing Member</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'investments' && (
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Investor Subscriptions</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
                <Button size="sm" className="bg-[#047857] hover:bg-[#065f46]"><Plus className="w-4 h-4 mr-1" />Add Investment</Button>
              </div>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Investor</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Ownership %</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {investments.map(inv => {
                  const status = getStatusConfig(inv.status);
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium">{inv.investor}</p>
                        <p className="text-xs text-gray-500">{inv.email}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(inv.amount)}</td>
                      <td className="px-4 py-3 text-right">{inv.ownership.toFixed(2)}%</td>
                      <td className="px-4 py-3"><span className={cn("px-2 py-1 rounded text-xs font-medium", status.bg, status.text)}>{status.label}</span></td>
                      <td className="px-4 py-3 text-sm text-gray-500">{inv.fundedDate || inv.signedDate || '—'}</td>
                      <td className="px-4 py-3"><button className="p-1 hover:bg-gray-200 rounded"><MoreVertical className="w-4 h-4 text-gray-400" /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'distributions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Distribution History</h3>
                <p className="text-sm text-gray-500">Total Distributed: {formatCurrency(deal.totalDistributions)}</p>
              </div>
              <Button className="bg-[#047857] hover:bg-[#065f46]"><Plus className="w-4 h-4 mr-2" />Create Distribution</Button>
            </div>
            {distributions.length > 0 ? (
              <div className="bg-white border rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {distributions.map(dist => {
                      const status = getStatusConfig(dist.status);
                      return (
                        <tr key={dist.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{dist.memo}</td>
                          <td className="px-4 py-3 text-sm capitalize">{dist.type.replace('_', ' ')}</td>
                          <td className="px-4 py-3 text-right font-medium">{formatCurrency(dist.amount)}</td>
                          <td className="px-4 py-3 text-sm">{dist.date}</td>
                          <td className="px-4 py-3"><span className={cn("px-2 py-1 rounded text-xs font-medium", status.bg, status.text)}>{status.label}</span></td>
                          <td className="px-4 py-3"><button className="p-1 hover:bg-gray-200 rounded"><MoreVertical className="w-4 h-4 text-gray-400" /></button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white border rounded-lg p-8 text-center">
                <DollarSign className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No distributions yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Deal Documents</h3>
              <Button className="bg-[#047857] hover:bg-[#065f46]"><Plus className="w-4 h-4 mr-2" />Upload Document</Button>
            </div>
            <div className="bg-white border rounded-lg divide-y">
              {documents.map(doc => (
                <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.type.replace('_', ' ')} • {doc.size} • Uploaded {doc.uploadedAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm"><Eye className="w-4 h-4 mr-1" />View</Button>
                    <Button variant="outline" size="sm"><Download className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealDetailPage;
