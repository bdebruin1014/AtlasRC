import React from 'react';
import { NavLink, useParams, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Briefcase, Building2, PieChart, TrendingUp, DollarSign,
  Users, FileText, Wallet, ArrowLeftRight, BarChart3, Settings, 
  GitBranch, Target, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

const FamilyOfficeSidebar = ({ familyOffice }) => {
  const { officeId } = useParams();
  const location = useLocation();

  const menuSections = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', path: `/family-office/${officeId}`, icon: LayoutDashboard, exact: true },
        { label: 'Net Worth', path: `/family-office/${officeId}/net-worth`, icon: Wallet },
      ]
    },
    {
      title: 'Holdings',
      items: [
        { label: 'Entities', path: `/family-office/${officeId}/entities`, icon: Building2 },
        { label: 'Investments', path: `/family-office/${officeId}/investments`, icon: TrendingUp },
        { label: 'Real Estate', path: `/family-office/${officeId}/real-estate`, icon: Briefcase },
        { label: 'Other Assets', path: `/family-office/${officeId}/other-assets`, icon: PieChart },
      ]
    },
    {
      title: 'Ownership',
      items: [
        { label: 'Ownership Structure', path: `/family-office/${officeId}/ownership`, icon: GitBranch },
        { label: 'Beneficial Owners', path: `/family-office/${officeId}/beneficial-owners`, icon: Users },
      ]
    },
    {
      title: 'Financials',
      items: [
        { label: 'Income', path: `/family-office/${officeId}/income`, icon: DollarSign },
        { label: 'Distributions', path: `/family-office/${officeId}/distributions`, icon: ArrowLeftRight },
        { label: 'Capital Accounts', path: `/family-office/${officeId}/capital-accounts`, icon: Wallet },
      ]
    },
    {
      title: 'Reports',
      items: [
        { label: 'Performance', path: `/family-office/${officeId}/performance`, icon: BarChart3 },
        { label: 'Tax Summary', path: `/family-office/${officeId}/tax-summary`, icon: FileText },
        { label: 'Consolidated View', path: `/family-office/${officeId}/consolidated`, icon: PieChart },
      ]
    },
    {
      title: 'Settings',
      items: [
        { label: 'Settings', path: `/family-office/${officeId}/settings`, icon: Settings },
        { label: 'Access', path: `/family-office/${officeId}/access`, icon: Shield },
      ]
    },
  ];

  const formatCurrency = (val) => {
    if (!val) return '$0';
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <aside className="w-56 bg-[#1a1a1a] border-r border-gray-800 flex flex-col flex-shrink-0 h-full">
      {/* Family Office Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-white text-sm truncate">{familyOffice?.name || 'Loading...'}</h2>
            <p className="text-xs text-gray-400 truncate">{familyOffice?.primaryOwner}</p>
          </div>
        </div>
        {familyOffice && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-gray-800 rounded p-2">
              <p className="text-xs text-gray-400">Net Worth</p>
              <p className="text-sm font-semibold text-green-400">{formatCurrency(familyOffice.netWorth)}</p>
            </div>
            <div className="bg-gray-800 rounded p-2">
              <p className="text-xs text-gray-400">Entities</p>
              <p className="text-sm font-semibold text-white">{familyOffice.entityCount}</p>
            </div>
          </div>
        )}
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
                      ? "bg-purple-600 text-white" 
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

export default FamilyOfficeSidebar;
