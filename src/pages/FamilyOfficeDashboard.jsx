import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, TrendingUp, DollarSign, PieChart, Briefcase, Landmark, Home, BarChart3, AlertTriangle, ChevronRight, Plus, ChevronDown, FileText, Users, Settings, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const FamilyOfficeDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedGroups, setExpandedGroups] = useState(['investments', 'reporting']);

  const sidebarGroups = [
    {
      id: 'investments',
      label: 'Investments',
      items: [
        { id: 'overview', label: 'Portfolio Overview', icon: PieChart },
        { id: 'equity', label: 'Equity Holdings', icon: Building2 },
        { id: 'debt', label: 'Debt Investments', icon: Landmark },
        { id: 'securities', label: 'Securities', icon: TrendingUp },
        { id: 'real-property', label: 'Real Property', icon: Home },
        { id: 'cash', label: 'Cash & Liquidity', icon: DollarSign },
      ]
    },
    {
      id: 'reporting',
      label: 'Reporting',
      items: [
        { id: 'performance', label: 'Performance', icon: BarChart3 },
        { id: 'tax', label: 'Tax Planning', icon: FileText },
        { id: 'distributions', label: 'Distributions', icon: CreditCard },
        { id: 'projections', label: 'Projections', icon: TrendingUp },
      ]
    },
    {
      id: 'admin',
      label: 'Administration',
      items: [
        { id: 'beneficiaries', label: 'Beneficiaries', icon: Users },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    },
  ];

  const portfolioAllocation = [
    { name: 'Real Estate Investments', value: 18000000, percent: 63, color: '#047857' },
    { name: 'Securities (Stocks/Bonds)', value: 6000000, percent: 21, color: '#2563eb' },
    { name: 'Cash & Equivalents', value: 2500000, percent: 9, color: '#7c3aed' },
    { name: 'Alternative Investments', value: 1500000, percent: 5, color: '#f59e0b' },
    { name: 'Private Debt (Loans Out)', value: 500000, percent: 2, color: '#ef4444' },
  ];

  const equityHoldings = [
    { name: 'VanRock Holdings LLC', ownership: '100%', costBasis: 2000000, currentValue: 2100000, ytdReturn: 150000, returnPct: 12.5 },
    { name: 'Watson House LLC', ownership: '100%', costBasis: 1500000, currentValue: 1800000, ytdReturn: 220000, returnPct: 34.7 },
    { name: 'Oslo Townhomes LLC', ownership: '100%', costBasis: 2500000, currentValue: 3200000, ytdReturn: 180000, returnPct: 35.2 },
    { name: 'VanRock Management Co', ownership: '100%', costBasis: 500000, currentValue: 550000, ytdReturn: 100000, returnPct: 30.0 },
    { name: 'VanRock Fund I LP', ownership: '25% GP', costBasis: 1000000, currentValue: 1250000, ytdReturn: 85000, returnPct: 18.5 },
  ];

  const debtInvestments = [
    { borrower: 'Watson House LLC', principal: 500000, rate: 8.0, term: '24 months', maturity: 'Jan 2026', interestYtd: 40000, status: 'Performing' },
    { borrower: 'Oslo Townhomes LLC', principal: 250000, rate: 9.0, term: '18 months', maturity: 'Jun 2025', interestYtd: 22500, status: 'Performing' },
    { borrower: 'Third Party Deal', principal: 750000, rate: 10.0, term: '12 months', maturity: 'Mar 2025', interestYtd: 75000, status: 'Performing' },
  ];

  const alerts = [
    { type: 'info', message: 'Quarterly distribution due from VanRock Holdings', date: 'Dec 31' },
    { type: 'warning', message: 'Watson House loan maturing in 13 months', date: 'Dec 28' },
    { type: 'success', message: 'Fund I LP returned 18.5% YTD', date: 'Dec 27' },
    { type: 'info', message: 'Tax planning review scheduled', date: 'Jan 5' },
  ];

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => prev.includes(groupId) ? prev.filter(g => g !== groupId) : [...prev, groupId]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="p-6">
            {/* Net Worth Summary */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100">Total Net Worth</p>
                  <p className="text-4xl font-bold">$28,500,000</p>
                  <p className="text-emerald-100 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />+$2,150,000 (+7.5%) YTD
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-100">Blended Yield</p>
                  <p className="text-3xl font-bold">5.8%</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-white/20">
                <div><p className="text-emerald-100 text-xs">Cash Flow YTD</p><p className="text-xl font-semibold">$1.25M</p></div>
                <div><p className="text-emerald-100 text-xs">Distributions</p><p className="text-xl font-semibold">$850K</p></div>
                <div><p className="text-emerald-100 text-xs">Interest Income</p><p className="text-xl font-semibold">$137K</p></div>
                <div><p className="text-emerald-100 text-xs">Unrealized Gains</p><p className="text-xl font-semibold">$963K</p></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Portfolio Allocation */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Portfolio Allocation</h3>
                <div className="space-y-3">
                  {portfolioAllocation.map((item) => (
                    <div key={item.name}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">{item.name}</span>
                        <span className="font-medium">{item.percent}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="h-2 rounded-full" style={{ width: `${item.percent}%`, backgroundColor: item.color }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Holdings */}
              <div className="bg-white border rounded-lg p-6 col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Top Holdings</h3>
                  <Button variant="link" className="text-[#047857] p-0 h-auto" onClick={() => setActiveTab('equity')}>View All</Button>
                </div>
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-500 uppercase">
                    <tr><th className="text-left pb-2">Investment</th><th className="text-right pb-2">Value</th><th className="text-right pb-2">YTD Return</th></tr>
                  </thead>
                  <tbody className="divide-y">
                    {equityHoldings.slice(0, 4).map((h, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="py-2 font-medium text-[#047857]">{h.name}</td>
                        <td className="py-2 text-right">${(h.currentValue / 1000000).toFixed(2)}M</td>
                        <td className="py-2 text-right text-green-600">+{h.returnPct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Alerts */}
            <div className="mt-6 bg-white border rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Alerts & Reminders</h3>
              <div className="grid grid-cols-2 gap-4">
                {alerts.map((alert, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={cn("w-2 h-2 rounded-full mt-1.5",
                      alert.type === 'warning' && "bg-amber-500",
                      alert.type === 'info' && "bg-blue-500",
                      alert.type === 'success' && "bg-green-500"
                    )}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{alert.message}</p>
                      <p className="text-xs text-gray-400">{alert.date}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'equity':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Equity Holdings</h2>
              <Button className="bg-[#047857] hover:bg-[#065f46]"><Plus className="w-4 h-4 mr-1" />Add Investment</Button>
            </div>
            <div className="bg-white border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Entity</th>
                    <th className="text-left px-4 py-3 font-medium">Ownership</th>
                    <th className="text-right px-4 py-3 font-medium">Cost Basis</th>
                    <th className="text-right px-4 py-3 font-medium">Current Value</th>
                    <th className="text-right px-4 py-3 font-medium">Unrealized Gain</th>
                    <th className="text-right px-4 py-3 font-medium">YTD Return</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {equityHoldings.map((h, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-[#047857]">{h.name}</td>
                      <td className="px-4 py-3">{h.ownership}</td>
                      <td className="px-4 py-3 text-right">${(h.costBasis / 1000000).toFixed(2)}M</td>
                      <td className="px-4 py-3 text-right font-medium">${(h.currentValue / 1000000).toFixed(2)}M</td>
                      <td className="px-4 py-3 text-right text-green-600">+${((h.currentValue - h.costBasis) / 1000).toFixed(0)}K</td>
                      <td className="px-4 py-3 text-right text-green-600">+{h.returnPct}%</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 font-semibold">
                  <tr>
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-right">$7.50M</td>
                    <td className="px-4 py-3 text-right">$8.90M</td>
                    <td className="px-4 py-3 text-right text-green-600">+$1.40M</td>
                    <td className="px-4 py-3 text-right text-green-600">+18.7%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        );

      case 'debt':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Debt Investments (Loans Out)</h2>
              <Button className="bg-[#047857] hover:bg-[#065f46]"><Plus className="w-4 h-4 mr-1" />New Loan</Button>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Outstanding</p>
                <p className="text-2xl font-semibold">$1,500,000</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Interest Received YTD</p>
                <p className="text-2xl font-semibold text-[#047857]">$137,500</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Avg Yield</p>
                <p className="text-2xl font-semibold">9.2%</p>
              </div>
            </div>
            <div className="bg-white border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Borrower</th>
                    <th className="text-right px-4 py-3 font-medium">Principal</th>
                    <th className="text-right px-4 py-3 font-medium">Rate</th>
                    <th className="text-left px-4 py-3 font-medium">Term</th>
                    <th className="text-left px-4 py-3 font-medium">Maturity</th>
                    <th className="text-right px-4 py-3 font-medium">Interest YTD</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {debtInvestments.map((loan, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-[#047857]">{loan.borrower}</td>
                      <td className="px-4 py-3 text-right">${(loan.principal / 1000).toFixed(0)}K</td>
                      <td className="px-4 py-3 text-right">{loan.rate}%</td>
                      <td className="px-4 py-3">{loan.term}</td>
                      <td className="px-4 py-3">{loan.maturity}</td>
                      <td className="px-4 py-3 text-right text-green-600">${(loan.interestYtd / 1000).toFixed(0)}K</td>
                      <td className="px-4 py-3"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">{loan.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-6">
            <div className="bg-white border rounded-lg p-12 text-center">
              <p className="text-gray-600 capitalize font-medium">{activeTab.replace(/-/g, ' ')}</p>
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
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Olive Brynn LLC</h2>
              <p className="text-gray-500 text-xs">Family Office</p>
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
                  {group.items.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <button key={item.id} onClick={() => setActiveTab(item.id)} className={cn("w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-r transition-colors", activeTab === item.id ? "bg-[#047857] text-white" : "text-gray-400 hover:text-white hover:bg-white/5")}>
                        <IconComponent className="w-3.5 h-3.5" />{item.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default FamilyOfficeDashboard;
