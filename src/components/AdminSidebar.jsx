import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, Settings, Shield,
  Database, Key, Layers, CheckSquare, Calendar,
  Calculator, LineChart, DollarSign, Target, Milestone,
  FolderKanban, ClipboardList, Home, GitBranch, Hammer,
  Tag, BarChart3, ListChecks, Sliders
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AdminSidebar = () => {
  const location = useLocation();

  const menuSections = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
      ]
    },
    {
      title: 'Module Admin',
      items: [
        { label: 'Construction', path: '/construction/admin', icon: Hammer },
        { label: 'Projects', path: '/projects/admin', icon: FolderKanban },
        { label: 'Opportunities', path: '/opportunities/admin', icon: Target },
        { label: 'Accounting', path: '/accounting/admin', icon: Calculator },
      ]
    },
    {
      title: 'Organization',
      items: [
        { label: 'Organization Settings', path: '/admin/organization', icon: Building2 },
        { label: 'User Management', path: '/admin/users', icon: Users },
        { label: 'Team Management', path: '/admin/team', icon: Users },
        { label: 'Teams', path: '/admin/teams', icon: Building2 },
        { label: 'Permissions Matrix', path: '/admin/permissions', icon: Key },
      ]
    },
    {
      title: 'Configuration',
      items: [
        { label: 'General Settings', path: '/admin/settings', icon: Settings },
        { label: 'Integrations', path: '/admin/integrations', icon: Layers },
        { label: 'Tags', path: '/admin/tags', icon: Tag },
        { label: 'Custom Fields', path: '/admin/custom-fields', icon: Sliders },
      ]
    },
    {
      title: 'System',
      items: [
        { label: 'Activity Log', path: '/admin/activity-log', icon: ClipboardList },
        { label: 'Audit Logs', path: '/admin/audit-logs', icon: Database },
        { label: 'User Analytics', path: '/admin/analytics', icon: BarChart3 },
        { label: 'Bulk Actions', path: '/admin/bulk-actions', icon: ListChecks },
      ]
    },
  ];

  return (
    <aside className="w-56 bg-white border-r flex flex-col flex-shrink-0 h-full">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-gray-900">Admin Settings</h2>
        <p className="text-xs text-gray-500 mt-1">System configuration</p>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-2">
        {menuSections.map((section) => (
          <div key={section.title} className="mb-4">
            <p className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              {section.title}
            </p>
            {section.items.map((item) => {
              const IconComponent = item.icon;
              const isActive = item.path.includes('?')
                ? location.pathname + location.search === item.path
                : item.exact
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path);
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                    isActive 
                      ? "bg-emerald-50 text-emerald-700 font-medium" 
                      : "text-gray-600 hover:bg-gray-100"
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

export default AdminSidebar;
