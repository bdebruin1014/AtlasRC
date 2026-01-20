import React from 'react';
import { NavLink, useParams, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileText, DollarSign, TrendingUp, Settings,
  Wallet, PieChart, Bell, Mail, Lock, FileCheck, BarChart3, Briefcase,
  CheckSquare, Plus, Calendar, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const InvestmentsSidebar = ({ deal }) => {
  const { dealId } = useParams();
  const location = useLocation();

  // Mock pending tasks for this deal
  const pendingTasks = [
    { id: 1, title: 'Follow up with pending investors', dueDate: '2024-12-30', priority: 'high' },
    { id: 2, title: 'Process Q4 distributions', dueDate: '2025-01-05', priority: 'high' },
    { id: 3, title: 'Send investor update report', dueDate: '2025-01-10', priority: 'medium' },
    { id: 4, title: 'Review subscription documents', dueDate: '2025-01-15', priority: 'low' },
  ];

  const menuSections = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', path: `/investments/${dealId}`, icon: LayoutDashboard, exact: true },
        { label: 'Deal Summary', path: `/investments/${dealId}/summary`, icon: Briefcase },
      ]
    },
    {
      title: 'Investors',
      items: [
        { label: 'Investor Directory', path: `/investments/${dealId}/investors`, icon: Users },
        { label: 'Subscriptions', path: `/investments/${dealId}/subscriptions`, icon: FileCheck },
        { label: 'Capital Calls', path: `/investments/${dealId}/capital-calls`, icon: Wallet },
        { label: 'Ownership Table', path: `/investments/${dealId}/ownership`, icon: PieChart },
      ]
    },
    {
      title: 'Financials',
      items: [
        { label: 'Distributions', path: `/investments/${dealId}/distributions`, icon: DollarSign },
        { label: 'Waterfall', path: `/investments/${dealId}/waterfall`, icon: TrendingUp },
        { label: 'Performance', path: `/investments/${dealId}/performance`, icon: BarChart3 },
      ]
    },
    {
      title: 'Documents',
      items: [
        { label: 'Documents', path: `/investments/${dealId}/documents`, icon: FileText },
        { label: 'K-1s', path: `/investments/${dealId}/k1s`, icon: FileText },
        { label: 'Reports', path: `/investments/${dealId}/reports`, icon: BarChart3 },
      ]
    },
    {
      title: 'Communications',
      items: [
        { label: 'Investor Updates', path: `/investments/${dealId}/updates`, icon: Mail },
        { label: 'Notifications', path: `/investments/${dealId}/notifications`, icon: Bell },
      ]
    },
    {
      title: 'Settings',
      items: [
        { label: 'Deal Settings', path: `/investments/${dealId}/settings`, icon: Settings },
        { label: 'Permissions', path: `/investments/${dealId}/permissions`, icon: Lock },
      ]
    },
  ];

  const formatCurrency = (val) => {
    if (!val) return '$0';
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toLocaleString()}`;
  };

  const getStageConfig = (stage) => ({
    raising_capital: { bg: 'bg-blue-500', label: 'Raising Capital' },
    asset_managing: { bg: 'bg-green-500', label: 'Asset Managing' },
    liquidated: { bg: 'bg-purple-500', label: 'Liquidated' },
    archived: { bg: 'bg-gray-500', label: 'Archived' },
  }[stage] || { bg: 'bg-gray-500', label: stage });

  const stageConfig = getStageConfig(deal?.stage);

  return (
    <aside className="w-56 bg-[#1a1a1a] border-r border-gray-800 flex flex-col flex-shrink-0 h-full">
      {/* Deal Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-2">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stageConfig.bg)}>
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-white text-sm truncate">{deal?.name || 'Loading...'}</h2>
            <span className="text-xs text-gray-400">{stageConfig.label}</span>
          </div>
        </div>
        {deal && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-gray-800 rounded p-2">
              <p className="text-xs text-gray-400">Raised</p>
              <p className="text-sm font-semibold text-white">{formatCurrency(deal.totalRaised)}</p>
            </div>
            <div className="bg-gray-800 rounded p-2">
              <p className="text-xs text-gray-400">Investors</p>
              <p className="text-sm font-semibold text-white">{deal.investorCount}</p>
            </div>
          </div>
        )}
      </div>

      {/* Deal Tasks Section */}
      <div className="p-3 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase">Deal Tasks</span>
          <button className="p-1 hover:bg-gray-700 rounded">
            <Plus className="w-3 h-3 text-gray-400" />
          </button>
        </div>
        <div className="space-y-1.5 max-h-32 overflow-y-auto">
          {pendingTasks.slice(0, 3).map(task => (
            <div 
              key={task.id} 
              className="flex items-start gap-2 p-1.5 rounded hover:bg-gray-800 cursor-pointer group"
            >
              <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0", 
                task.priority === 'high' ? 'bg-red-500' : 
                task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
              )} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-300 truncate group-hover:text-white">{task.title}</p>
                <p className="text-[10px] text-gray-500">{task.dueDate}</p>
              </div>
            </div>
          ))}
        </div>
        <NavLink 
          to={`/investments/${dealId}/tasks`}
          className="block mt-2 text-xs text-emerald-500 hover:text-emerald-400 text-center"
        >
          View All Tasks ({pendingTasks.length}) →
        </NavLink>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {menuSections.map((section) => (
          <div key={section.title} className="mb-4">
            <p className="px-3 py-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              {section.title}
            </p>
            {section.items.map((item) => {
              const IconComponent = item.icon;
              const isActive = item.exact 
                ? location.pathname === item.path
                : location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                    isActive 
                      ? "bg-emerald-600 text-white" 
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <IconComponent className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default InvestmentsSidebar;
