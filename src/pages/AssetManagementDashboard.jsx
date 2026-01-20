import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, TrendingUp, DollarSign, Users, Home, BarChart3, AlertTriangle, ChevronDown, FileText, Calendar, Settings, PieChart, Percent, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const AssetManagementDashboard = () => {
  const navigate = useNavigate();
  const { assetId } = useParams();
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedGroups, setExpandedGroups] = useState(['performance', 'operations', 'financial']);

  const asset = {
    name: 'Sunset Apartments',
    type: 'Multifamily',
    location: 'Denver, CO',
    units: 120,
    sqft: 108000,
    acquired: 'Jan 2021',
    originalCost: 4000000,
    currentValue: 4500000,
    debt: 2500000,
    equity: 2000000,
    occupancy: 96,
    noi: 1133080,
    capRate: 25.2,
    dscr: 6.91,
  };

  const sidebarGroups = [
    {
      id: 'performance',
      label: 'Performance',
      items: [
        { id: 'overview', label: 'Overview', icon: PieChart },
        { id: 'financials', label: 'Financial Metrics', icon: DollarSign },
        { id: 'valuations', label: 'Valuations', icon: TrendingUp },
        { id: 'returns', label: 'Returns Analysis', icon: Percent },
      ]
    },
    {
      id: 'operations',
      label: 'Operations',
      items: [
        { id: 'leases', label: 'Lease Management', icon: FileText },
        { id: 'tenants', label: 'Tenant Profile', icon: Users },
        { id: 'rent-roll', label: 'Rent Roll', icon: DollarSign },
        { id: 'occupancy', label: 'Occupancy', icon: Home },
      ]
    },
    {
      id: 'financial',
      label: 'Financials',
      items: [
        { id: 'income', label: 'Income Statement', icon: BarChart3 },
        { id: 'expenses', label: 'Operating Expenses', icon: DollarSign },
        { id: 'debt', label: 'Debt Service', icon: Building2 },
        { id: 'capex', label: 'Capital Expenses', icon: Settings },
      ]
    },
  ];

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => prev.includes(groupId) ? prev.filter(g => g !== groupId) : [...prev, groupId]);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{asset.name}</h2>
                <p className="text-sm text-gray-500">{asset.type} • {asset.location} • {asset.units} units</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">★★★★★ Top Performer</span>
                <Button variant="outline">Export Report</Button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              <div className="bg-white border rounded-lg p-4">
                <p className="text-xs text-gray-500">Current Value</p>
                <p className="text-xl font-semibold">${(asset.currentValue / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-[#047857]">+$500K from acquisition</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-xs text-gray-500">NOI (Annual)</p>
                <p className="text-xl font-semibold">${(asset.noi / 1000000).toFixed(2)}M</p>
                <p className="text-xs text-gray-500">54.9% margin</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-xs text-gray-500">Cap Rate</p>
                <p className="text-xl font-semibold">{asset.capRate}%</p>
                <p className="text-xs text-gray-500">vs 5.5% market</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-xs text-gray-500">Occupancy</p>
                <p className="text-xl font-semibold">{asset.occupancy}%</p>
                <p className="text-xs text-gray-500">115/120 units</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-xs text-gray-500">DSCR</p>
                <p className="text-xl font-semibold">{asset.dscr}x</p>
                <p className="text-xs text-[#047857]">Excellent coverage</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Income Summary */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Annual Income Statement</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Potential Gross Income</span><span className="font-medium">$2,148,000</span></div>
                  <div className="flex justify-between text-red-600"><span>Less: Vacancy (4%)</span><span>-$85,920</span></div>
                  <div className="flex justify-between border-t pt-2"><span className="font-medium">Effective Gross Income</span><span className="font-medium">$2,062,080</span></div>
                  <div className="flex justify-between text-red-600"><span>Less: Operating Expenses</span><span>-$929,000</span></div>
                  <div className="flex justify-between border-t pt-2 text-[#047857]"><span className="font-semibold">Net Operating Income</span><span className="font-semibold">$1,133,080</span></div>
                  <div className="flex justify-between text-red-600"><span>Less: Debt Service</span><span>-$164,000</span></div>
                  <div className="flex justify-between border-t pt-2"><span className="font-semibold">Cash Flow</span><span className="font-semibold text-[#047857]">$969,080</span></div>
                </div>
              </div>

              {/* Property Details */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Property Profile</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-xs text-gray-500">Property Type</p><p className="font-medium">{asset.type}</p></div>
                  <div><p className="text-xs text-gray-500">Year Built</p><p className="font-medium">1998 (Class B)</p></div>
                  <div><p className="text-xs text-gray-500">Total Units</p><p className="font-medium">{asset.units} apartments</p></div>
                  <div><p className="text-xs text-gray-500">Total SF</p><p className="font-medium">{asset.sqft.toLocaleString()} sf</p></div>
                  <div><p className="text-xs text-gray-500">Acquisition Date</p><p className="font-medium">{asset.acquired}</p></div>
                  <div><p className="text-xs text-gray-500">Purchase Price</p><p className="font-medium">${(asset.originalCost / 1000000).toFixed(1)}M</p></div>
                  <div><p className="text-xs text-gray-500">Price/Unit</p><p className="font-medium">$37,500</p></div>
                  <div><p className="text-xs text-gray-500">Price/SF</p><p className="font-medium">$41.67</p></div>
                </div>
              </div>
            </div>

            {/* Unit Mix & Rent Analysis */}
            <div className="grid grid-cols-2 gap-6 mt-6">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Unit Mix</h3>
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-500 uppercase">
                    <tr><th className="text-left pb-2">Type</th><th className="text-right pb-2">Units</th><th className="text-right pb-2">Avg Rent</th><th className="text-right pb-2">Monthly</th></tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr><td className="py-2">1-Bedroom</td><td className="py-2 text-right">40</td><td className="py-2 text-right">$1,200</td><td className="py-2 text-right">$48,000</td></tr>
                    <tr><td className="py-2">2-Bedroom</td><td className="py-2 text-right">60</td><td className="py-2 text-right">$1,500</td><td className="py-2 text-right">$90,000</td></tr>
                    <tr><td className="py-2">3-Bedroom</td><td className="py-2 text-right">20</td><td className="py-2 text-right">$1,750</td><td className="py-2 text-right">$35,000</td></tr>
                  </tbody>
                  <tfoot className="font-medium border-t">
                    <tr><td className="pt-2">Total</td><td className="pt-2 text-right">120</td><td className="pt-2 text-right">$1,450 avg</td><td className="pt-2 text-right">$173,000</td></tr>
                  </tfoot>
                </table>
              </div>

              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Rent Analysis</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Current Avg Rent</span><span className="font-medium">$1,450/month</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Market Rent (comps)</span><span className="font-medium">$1,480/month</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Under-market</span><span className="text-amber-600">-$30/unit/month</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Rental Upside</span><span className="text-[#047857]">+$36,000/year</span></div>
                  <div className="flex justify-between border-t pt-2"><span className="text-gray-600">YoY Rent Growth</span><span className="font-medium">3.2%</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">5-Year Projected Rent</span><span className="font-medium">$1,681/month</span></div>
                </div>
              </div>
            </div>

            {/* Alerts */}
            <div className="mt-6 bg-white border rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Alerts & Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">2 Lease Renewals Pending</p>
                    <p className="text-xs text-amber-600">Units 101 & 103 expire in 30 days</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Capital Improvement Due</p>
                    <p className="text-xs text-blue-600">Roof replacement needed in 3 years ($300K)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'leases':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Lease Management</h2>
              <Button className="bg-[#047857] hover:bg-[#065f46]">Add Lease</Button>
            </div>
            
            <div className="grid grid-cols-5 gap-4 mb-6">
              <div className="bg-white border rounded-lg p-4"><p className="text-xs text-gray-500">Total Leases</p><p className="text-xl font-semibold">120</p></div>
              <div className="bg-white border rounded-lg p-4"><p className="text-xs text-gray-500">Expiring (30 days)</p><p className="text-xl font-semibold text-amber-600">2</p></div>
              <div className="bg-white border rounded-lg p-4"><p className="text-xs text-gray-500">Expiring (90 days)</p><p className="text-xl font-semibold text-amber-600">8</p></div>
              <div className="bg-white border rounded-lg p-4"><p className="text-xs text-gray-500">Month-to-Month</p><p className="text-xl font-semibold">3</p></div>
              <div className="bg-white border rounded-lg p-4"><p className="text-xs text-gray-500">Renewal Rate</p><p className="text-xl font-semibold text-[#047857]">87%</p></div>
            </div>

            <div className="bg-white border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Unit</th>
                    <th className="text-left px-4 py-3 font-medium">Tenant</th>
                    <th className="text-right px-4 py-3 font-medium">Rent</th>
                    <th className="text-left px-4 py-3 font-medium">Lease Start</th>
                    <th className="text-left px-4 py-3 font-medium">Expiration</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr className="hover:bg-gray-50 bg-amber-50">
                    <td className="px-4 py-3 font-medium">101</td>
                    <td className="px-4 py-3">John Smith</td>
                    <td className="px-4 py-3 text-right">$1,450</td>
                    <td className="px-4 py-3">01/15/2024</td>
                    <td className="px-4 py-3">01/15/2025</td>
                    <td className="px-4 py-3"><span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs">Expiring</span></td>
                    <td className="px-4 py-3"><Button size="sm" variant="outline">Renew</Button></td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">102</td>
                    <td className="px-4 py-3">Mary Jones</td>
                    <td className="px-4 py-3 text-right">$1,450</td>
                    <td className="px-4 py-3">05/30/2024</td>
                    <td className="px-4 py-3">05/30/2025</td>
                    <td className="px-4 py-3"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Active</span></td>
                    <td className="px-4 py-3"><Button size="sm" variant="ghost">View</Button></td>
                  </tr>
                  <tr className="hover:bg-gray-50 bg-amber-50">
                    <td className="px-4 py-3 font-medium">103</td>
                    <td className="px-4 py-3">Bob Brown</td>
                    <td className="px-4 py-3 text-right">$1,500</td>
                    <td className="px-4 py-3">02/28/2024</td>
                    <td className="px-4 py-3">02/28/2025</td>
                    <td className="px-4 py-3"><span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs">Expiring</span></td>
                    <td className="px-4 py-3"><Button size="sm" variant="outline">Renew</Button></td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">104</td>
                    <td className="px-4 py-3">Sarah Davis</td>
                    <td className="px-4 py-3 text-right">$1,450</td>
                    <td className="px-4 py-3">08/31/2024</td>
                    <td className="px-4 py-3">08/31/2025</td>
                    <td className="px-4 py-3"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Active</span></td>
                    <td className="px-4 py-3"><Button size="sm" variant="ghost">View</Button></td>
                  </tr>
                  <tr className="hover:bg-gray-50 bg-red-50">
                    <td className="px-4 py-3 font-medium">105</td>
                    <td className="px-4 py-3">—</td>
                    <td className="px-4 py-3 text-right">—</td>
                    <td className="px-4 py-3">—</td>
                    <td className="px-4 py-3">—</td>
                    <td className="px-4 py-3"><span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">Vacant</span></td>
                    <td className="px-4 py-3"><Button size="sm" variant="outline">List</Button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'rent-roll':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Rent Roll</h2>
              <Button variant="outline">Export</Button>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white border rounded-lg p-4"><p className="text-xs text-gray-500">Total Collectible</p><p className="text-xl font-semibold">$2,088,000</p><p className="text-xs text-gray-400">/year</p></div>
              <div className="bg-white border rounded-lg p-4"><p className="text-xs text-gray-500">Collected YTD</p><p className="text-xl font-semibold text-[#047857]">$1,740,000</p></div>
              <div className="bg-white border rounded-lg p-4"><p className="text-xs text-gray-500">Collection Rate</p><p className="text-xl font-semibold">98.8%</p></div>
              <div className="bg-white border rounded-lg p-4"><p className="text-xs text-gray-500">Delinquent</p><p className="text-xl font-semibold text-red-600">$21,000</p></div>
            </div>

            <div className="bg-white border rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Delinquency Summary</h3>
              <div className="grid grid-cols-5 gap-4 text-sm">
                <div className="text-center p-3 bg-green-50 rounded-lg"><p className="text-xs text-gray-500">Current</p><p className="text-lg font-semibold text-green-700">118 units</p><p className="text-xs">98.3%</p></div>
                <div className="text-center p-3 bg-amber-50 rounded-lg"><p className="text-xs text-gray-500">1-30 Days</p><p className="text-lg font-semibold text-amber-700">1 unit</p><p className="text-xs">0.8%</p></div>
                <div className="text-center p-3 bg-orange-50 rounded-lg"><p className="text-xs text-gray-500">31-60 Days</p><p className="text-lg font-semibold text-orange-700">1 unit</p><p className="text-xs">0.8%</p></div>
                <div className="text-center p-3 bg-red-50 rounded-lg"><p className="text-xs text-gray-500">60+ Days</p><p className="text-lg font-semibold text-red-700">0 units</p><p className="text-xs">0%</p></div>
                <div className="text-center p-3 bg-gray-100 rounded-lg"><p className="text-xs text-gray-500">Eviction</p><p className="text-lg font-semibold">0 units</p><p className="text-xs">0%</p></div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-6">
            <div className="bg-white border rounded-lg p-12 text-center">
              <p className="text-gray-600 capitalize font-medium">{activeSection.replace(/-/g, ' ')}</p>
              <p className="text-gray-400 text-sm mt-2">Mock data interface - Real integration coming</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-[calc(100vh-40px)] bg-gray-50">
      {/* Dark Sidebar */}
      <div className="w-56 bg-[#1e2a3a] flex-shrink-0 flex flex-col">
        <div className="p-3 border-b border-gray-700">
          <button onClick={() => navigate('/accounting')} className="flex items-center gap-2 text-gray-400 hover:text-white text-xs mb-2">
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
          <div className="flex items-center gap-3 mt-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center"><Building2 className="w-5 h-5 text-white" /></div>
            <div>
              <h2 className="text-white font-semibold truncate">{asset.name}</h2>
              <p className="text-gray-500 text-xs">{asset.type} • {asset.units} units</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-2 overflow-y-auto">
          {sidebarGroups.map((group) => (
            <div key={group.id} className="mb-1">
              <button onClick={() => toggleGroup(group.id)} className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-white hover:bg-white/5 rounded">
                {group.label}
                <ChevronDown className={cn("w-4 h-4 transition-transform", expandedGroups.includes(group.id) ? "" : "-rotate-90")} />
              </button>
              {expandedGroups.includes(group.id) && (
                <div className="ml-4 border-l border-gray-700 space-y-0.5">
                  {group.items.map((item) => (
                    <button key={item.id} onClick={() => setActiveSection(item.id)} className={cn("w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-r transition-colors", activeSection === item.id ? "bg-[#047857] text-white" : "text-gray-400 hover:text-white hover:bg-white/5")}>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default AssetManagementDashboard;
