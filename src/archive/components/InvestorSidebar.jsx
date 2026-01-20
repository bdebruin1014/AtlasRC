import React from 'react';
import { NavLink, useParams, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, User, Building2, DollarSign, FileText, Mail,
  MessageSquare, Bell, Shield, CheckCircle, Settings, Wallet,
  FolderOpen, Clock, Send, Key, TrendingUp, Receipt
} from 'lucide-react';
import { cn } from '@/lib/utils';

const InvestorSidebar = ({ investor }) => {
  const { investorId } = useParams();
  const location = useLocation();

  const menuSections = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', path: `/investors/${investorId}`, icon: LayoutDashboard, exact: true },
        { label: 'Profile', path: `/investors/${investorId}/profile`, icon: User },
      ]
    },
    {
      title: 'Investments',
      items: [
        { label: 'Active Investments', path: `/investors/${investorId}/investments`, icon: Building2 },
        { label: 'Capital Activity', path: `/investors/${investorId}/capital`, icon: Wallet },
        { label: 'Distributions', path: `/investors/${investorId}/distributions`, icon: DollarSign },
        { label: 'Performance', path: `/investors/${investorId}/performance`, icon: TrendingUp },
      ]
    },
    {
      title: 'Documents',
      items: [
        { label: 'All Documents', path: `/investors/${investorId}/documents`, icon: FolderOpen },
        { label: 'Subscription Docs', path: `/investors/${investorId}/documents/subscriptions`, icon: FileText },
        { label: 'Tax Documents', path: `/investors/${investorId}/documents/tax`, icon: Receipt },
        { label: 'Shared with Investor', path: `/investors/${investorId}/documents/shared`, icon: Send },
      ]
    },
    {
      title: 'Communications',
      items: [
        { label: 'Investor Portal', path: `/investors/${investorId}/portal`, icon: MessageSquare },
        { label: 'Email History', path: `/investors/${investorId}/emails`, icon: Mail },
        { label: 'Notifications', path: `/investors/${investorId}/notifications`, icon: Bell },
      ]
    },
    {
      title: 'Compliance',
      items: [
        { label: 'Accreditation', path: `/investors/${investorId}/accreditation`, icon: Shield },
        { label: 'KYC/AML', path: `/investors/${investorId}/kyc`, icon: CheckCircle },
        { label: 'Tax Forms', path: `/investors/${investorId}/tax-forms`, icon: FileText },
      ]
    },
    {
      title: 'Settings',
      items: [
        { label: 'Portal Access', path: `/investors/${investorId}/portal-access`, icon: Key },
        { label: 'Preferences', path: `/investors/${investorId}/settings`, icon: Settings },
      ]
    },
  ];

  const formatCurrency = (val) => {
    if (!val) return '$0';
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toLocaleString()}`;
  };

  const getAccreditationColor = (status) => ({
    verified: 'bg-green-500',
    pending: 'bg-blue-500',
    expiring: 'bg-amber-500',
    expired: 'bg-red-500',
  }[status] || 'bg-gray-500');

  return (
    <aside className="w-56 bg-[#1a1a1a] border-r border-gray-800 flex flex-col flex-shrink-0 h-full">
      {/* Investor Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-white text-sm truncate">{investor?.name || 'Loading...'}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn("w-2 h-2 rounded-full", getAccreditationColor(investor?.accreditationStatus))} />
              <span className="text-xs text-gray-400 capitalize">{investor?.accreditationStatus || 'Unknown'}</span>
            </div>
          </div>
        </div>
        {investor && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-gray-800 rounded p-2">
              <p className="text-xs text-gray-400">Invested</p>
              <p className="text-sm font-semibold text-white">{formatCurrency(investor.totalInvested)}</p>
            </div>
            <div className="bg-gray-800 rounded p-2">
              <p className="text-xs text-gray-400">Deals</p>
              <p className="text-sm font-semibold text-white">{investor.activeDeals}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="p-3 border-b border-gray-800">
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors">
            <Mail className="w-3 h-3" />
            Email
          </button>
          <button className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors">
            <MessageSquare className="w-3 h-3" />
            Message
          </button>
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
                      ? "bg-blue-600 text-white" 
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

export default InvestorSidebar;
