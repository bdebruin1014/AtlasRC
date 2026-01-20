import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { BarChart3, FileText, Rss, FolderOpen, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const ReportsLayout = () => {
  const location = useLocation();
  const presetCategories = [
    { id: 'general', label: 'General' },
    { id: 'development', label: 'Development' },
    { id: 'accounting', label: 'Accounting' },
    { id: 'construction', label: 'Construction' },
    { id: 'investors', label: 'Investors' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'tasks', label: 'Tasks' },
  ];
  const navItems = [
    { id: 'preset', label: 'Preset Reports', icon: BarChart3, path: '/reports/preset', children: presetCategories },
    { id: 'custom', label: 'Custom Reports', icon: FileText, path: '/reports/custom' },
    { id: 'subscribed', label: 'Subscribed Reports', icon: Rss, path: '/reports/subscribed' },
    { id: 'packages', label: 'Report Packages', icon: FolderOpen, path: '/reports/packages' },
    { id: 'trends', label: 'Trends', icon: TrendingUp, path: '/reports/trends' },
  ];
  const isPresetActive = location.pathname.startsWith('/reports/preset');
  return (
    <div className="flex h-[calc(100vh-40px)] bg-gray-50">
      <div className="w-48 bg-white border-r border-gray-200 flex-shrink-0">
        <nav className="p-2">
          {navItems.map((item) => (
            <div key={item.id}>
              <NavLink to={item.path} className={({ isActive }) => cn("flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors", (isActive && item.id !== 'preset') || (item.id === 'preset' && isPresetActive) ? "bg-[#047857] text-white" : "text-gray-700 hover:bg-gray-100")}>
                <item.icon className="w-4 h-4" />{item.label}
              </NavLink>
              {item.children && isPresetActive && (
                <div className="ml-6 mt-1 space-y-0.5 border-l border-gray-200">
                  {item.children.map((child) => (
                    <NavLink key={child.id} to={'/reports/preset/' + child.id} className={({ isActive }) => cn("block px-3 py-1.5 text-xs rounded transition-colors", isActive ? "text-[#047857] font-medium" : "text-gray-600 hover:text-gray-900")}>{child.label}</NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
      <div className="flex-1 overflow-auto"><Outlet /></div>
    </div>
  );
};
export default ReportsLayout;
