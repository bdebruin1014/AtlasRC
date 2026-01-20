import React from 'react';
import { NavLink, useParams, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Building, MapPin, DollarSign, TrendingUp, Users,
  FileText, Camera, Calendar, Wrench, BarChart3, Settings,
  Receipt, PieChart, Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AssetManagementSidebar = ({ asset }) => {
  const { assetId } = useParams();
  const location = useLocation();

  const menuSections = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', path: `/assets/${assetId}`, icon: LayoutDashboard, exact: true },
        { label: 'Property Details', path: `/assets/${assetId}/details`, icon: Building },
        { label: 'Location', path: `/assets/${assetId}/location`, icon: MapPin },
      ]
    },
    {
      title: 'Financials',
      items: [
        { label: 'Operating Statement', path: `/assets/${assetId}/operating`, icon: Receipt },
        { label: 'Rent Roll', path: `/assets/${assetId}/rent-roll`, icon: DollarSign },
        { label: 'Budget vs Actual', path: `/assets/${assetId}/budget`, icon: BarChart3 },
        { label: 'Valuations', path: `/assets/${assetId}/valuations`, icon: TrendingUp },
      ]
    },
    {
      title: 'Operations',
      items: [
        { label: 'Tenants', path: `/assets/${assetId}/tenants`, icon: Users },
        { label: 'Leases', path: `/assets/${assetId}/leases`, icon: FileText },
        { label: 'Work Orders', path: `/assets/${assetId}/work-orders`, icon: Wrench },
        { label: 'Inspections', path: `/assets/${assetId}/inspections`, icon: Calendar },
      ]
    },
    {
      title: 'Documents',
      items: [
        { label: 'Documents', path: `/assets/${assetId}/documents`, icon: FileText },
        { label: 'Photos', path: `/assets/${assetId}/photos`, icon: Camera },
      ]
    },
    {
      title: 'Ownership',
      items: [
        { label: 'Entity', path: `/assets/${assetId}/entity`, icon: Briefcase },
        { label: 'Capital Structure', path: `/assets/${assetId}/capital`, icon: PieChart },
      ]
    },
    {
      title: 'Settings',
      items: [
        { label: 'Asset Settings', path: `/assets/${assetId}/settings`, icon: Settings },
      ]
    },
  ];

  const formatCurrency = (val) => {
    if (!val) return '$0';
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toLocaleString()}`;
  };

  const getStatusConfig = (status) => ({
    operating: { bg: 'bg-green-500', label: 'Operating' },
    development: { bg: 'bg-blue-500', label: 'Development' },
    renovation: { bg: 'bg-amber-500', label: 'Renovation' },
  }[status] || { bg: 'bg-gray-500', label: 'Unknown' });

  const statusConfig = asset ? getStatusConfig(asset.status) : { bg: 'bg-gray-500', label: 'Loading...' };

  return (
    <aside className="w-56 bg-[#1a1a1a] border-r border-gray-800 flex flex-col flex-shrink-0 h-full">
      {/* Asset Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-white text-sm truncate">{asset?.name || 'Loading...'}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn("w-2 h-2 rounded-full", statusConfig.bg)} />
              <span className="text-xs text-gray-400">{statusConfig.label}</span>
            </div>
          </div>
        </div>
        {asset && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-gray-800 rounded p-2">
              <p className="text-xs text-gray-400">Value</p>
              <p className="text-sm font-semibold text-white">{formatCurrency(asset.currentValue)}</p>
            </div>
            <div className="bg-gray-800 rounded p-2">
              <p className="text-xs text-gray-400">NOI</p>
              <p className="text-sm font-semibold text-green-400">{formatCurrency(asset.noi)}</p>
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

export default AssetManagementSidebar;
