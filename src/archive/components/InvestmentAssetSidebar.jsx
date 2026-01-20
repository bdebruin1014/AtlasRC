/**
 * AtlasDev - Investment & Asset Management Sidebar
 * Combined sidebar for deal management and asset operations
 * Includes: Entity hierarchy, document library, investor portal
 */

import React from 'react';
import { NavLink, useParams, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileText, DollarSign, TrendingUp, Settings,
  Wallet, PieChart, Bell, Mail, Lock, FileCheck, BarChart3, Briefcase,
  CheckSquare, Plus, Calendar, AlertCircle, Building2, FolderOpen,
  GitBranch, Shield, Key, Home, Target, Scale
} from 'lucide-react';
import { cn } from '@/lib/utils';

const InvestmentAssetSidebar = ({ deal, mode = 'investment' }) => {
  const { dealId, assetId } = useParams();
  const location = useLocation();
  const id = dealId || assetId;

  // Mock pending tasks
  const pendingTasks = [
    { id: 1, title: 'Follow up with pending investors', dueDate: '2024-12-30', priority: 'high' },
    { id: 2, title: 'Process Q4 distributions', dueDate: '2025-01-05', priority: 'high' },
    { id: 3, title: 'Send investor update report', dueDate: '2025-01-10', priority: 'medium' },
  ];

  // Menu sections based on mode
  const getMenuSections = () => {
    const basePath = mode === 'investment' ? `/investments/${id}` : `/assets/${id}`;
    
    const investmentSections = [
      {
        title: 'Overview',
        items: [
          { label: 'Dashboard', path: `${basePath}`, icon: LayoutDashboard, exact: true },
          { label: 'Deal Summary', path: `${basePath}/summary`, icon: Briefcase },
          { label: 'Entity Structure', path: `${basePath}/entity-structure`, icon: GitBranch },
        ]
      },
      {
        title: 'Investors',
        items: [
          { label: 'Investor Directory', path: `${basePath}/investors`, icon: Users },
          { label: 'Subscriptions', path: `${basePath}/subscriptions`, icon: FileCheck },
          { label: 'Capital Calls', path: `${basePath}/capital-calls`, icon: Wallet },
          { label: 'Ownership Table', path: `${basePath}/ownership`, icon: PieChart },
        ]
      },
      {
        title: 'Financials',
        items: [
          { label: 'Distributions', path: `${basePath}/distributions`, icon: DollarSign },
          { label: 'Waterfall', path: `${basePath}/waterfall`, icon: TrendingUp },
          { label: 'Performance', path: `${basePath}/performance`, icon: BarChart3 },
        ]
      },
      {
        title: 'Documents',
        items: [
          { label: 'All Documents', path: `${basePath}/documents`, icon: FolderOpen },
          { label: 'Operating Docs', path: `${basePath}/documents/operating`, icon: FileText },
          { label: 'Tax Documents', path: `${basePath}/documents/tax`, icon: FileCheck },
          { label: 'K-1s', path: `${basePath}/k1s`, icon: FileText },
          { label: 'Investor Portal', path: `${basePath}/portal-documents`, icon: Shield },
        ]
      },
      {
        title: 'Communications',
        items: [
          { label: 'Investor Updates', path: `${basePath}/updates`, icon: Mail },
          { label: 'Notifications', path: `${basePath}/notifications`, icon: Bell },
        ]
      },
      {
        title: 'Settings',
        items: [
          { label: 'Deal Settings', path: `${basePath}/settings`, icon: Settings },
          { label: 'Permissions', path: `${basePath}/permissions`, icon: Lock },
        ]
      },
    ];

    const assetSections = [
      {
        title: 'Overview',
        items: [
          { label: 'Dashboard', path: `${basePath}`, icon: LayoutDashboard, exact: true },
          { label: 'Property Details', path: `${basePath}/details`, icon: Home },
          { label: 'Entity Structure', path: `${basePath}/entity-structure`, icon: GitBranch },
        ]
      },
      {
        title: 'Operations',
        items: [
          { label: 'Rent Roll', path: `${basePath}/rent-roll`, icon: Key },
          { label: 'Lease Management', path: `${basePath}/leases`, icon: FileCheck },
          { label: 'Vendors', path: `${basePath}/vendors`, icon: Building2 },
        ]
      },
      {
        title: 'Risk & Compliance',
        items: [
          { label: 'Insurance', path: `${basePath}/insurance`, icon: Shield },
          { label: 'Property Tax', path: `${basePath}/property-tax`, icon: FileText },
          { label: 'Compliance', path: `${basePath}/compliance`, icon: CheckSquare },
        ]
      },
      {
        title: 'Financials',
        items: [
          { label: 'P&L', path: `${basePath}/financials`, icon: BarChart3 },
          { label: 'Budget vs Actual', path: `${basePath}/budget`, icon: Target },
          { label: 'Cash Flow', path: `${basePath}/cash-flow`, icon: DollarSign },
          { label: 'NOI Analysis', path: `${basePath}/noi`, icon: TrendingUp },
        ]
      },
      {
        title: 'Investment',
        items: [
          { label: 'Investor Summary', path: `${basePath}/investors`, icon: Users },
          { label: 'Distributions', path: `${basePath}/distributions`, icon: Wallet },
          { label: 'Performance', path: `${basePath}/performance`, icon: BarChart3 },
        ]
      },
      {
        title: 'Documents',
        items: [
          { label: 'All Documents', path: `${basePath}/documents`, icon: FolderOpen },
          { label: 'Operating Docs', path: `${basePath}/documents/operating`, icon: FileText },
          { label: 'Insurance', path: `${basePath}/documents/insurance`, icon: Shield },
          { label: 'Investor Portal', path: `${basePath}/portal-documents`, icon: Shield },
        ]
      },
      {
        title: 'Settings',
        items: [
          { label: 'Asset Settings', path: `${basePath}/settings`, icon: Settings },
        ]
      },
    ];

    return mode === 'investment' ? investmentSections : assetSections;
  };

  const menuSections = getMenuSections();

  const formatCurrency = (val) => {
    if (!val) return '$0';
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toLocaleString()}`;
  };

  const getStageConfig = (stage) => ({
    raising_capital: { bg: 'bg-blue-500', label: 'Raising Capital' },
    asset_managing: { bg: 'bg-green-500', label: 'Asset Managing' },
    operating: { bg: 'bg-emerald-500', label: 'Operating' },
    stabilized: { bg: 'bg-teal-500', label: 'Stabilized' },
    liquidated: { bg: 'bg-purple-500', label: 'Liquidated' },
    archived: { bg: 'bg-gray-500', label: 'Archived' },
  }[stage] || { bg: 'bg-gray-500', label: stage });

  const stageConfig = getStageConfig(deal?.stage);

  return (
    <aside className="w-56 bg-[#1a1a1a] border-r border-gray-800 flex flex-col flex-shrink-0 h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-2">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stageConfig.bg)}>
            {mode === 'investment' ? (
              <Briefcase className="w-5 h-5 text-white" />
            ) : (
              <Building2 className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-white text-sm truncate">{deal?.name || 'Loading...'}</h2>
            <span className="text-xs text-gray-400">{stageConfig.label}</span>
          </div>
        </div>
        {deal && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-gray-800 rounded p-2">
              <p className="text-xs text-gray-400">{mode === 'investment' ? 'Raised' : 'Value'}</p>
              <p className="text-sm font-semibold text-white">{formatCurrency(deal.totalRaised || deal.currentValue)}</p>
            </div>
            <div className="bg-gray-800 rounded p-2">
              <p className="text-xs text-gray-400">{mode === 'investment' ? 'Investors' : 'NOI'}</p>
              <p className="text-sm font-semibold text-white">{deal.investorCount || formatCurrency(deal.noi)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Mode Toggle */}
      <div className="p-3 border-b border-gray-800">
        <div className="flex bg-gray-800 rounded-lg p-1">
          <NavLink
            to={`/investments/${id}`}
            className={cn(
              "flex-1 py-1.5 text-xs text-center rounded font-medium transition-colors",
              mode === 'investment' ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white"
            )}
          >
            Investment
          </NavLink>
          <NavLink
            to={`/assets/${id}`}
            className={cn(
              "flex-1 py-1.5 text-xs text-center rounded font-medium transition-colors",
              mode === 'asset' ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white"
            )}
          >
            Asset Mgmt
          </NavLink>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="p-3 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase">Tasks</span>
          <button className="p-1 hover:bg-gray-700 rounded">
            <Plus className="w-3 h-3 text-gray-400" />
          </button>
        </div>
        <div className="space-y-1.5 max-h-24 overflow-y-auto">
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

export default InvestmentAssetSidebar;
