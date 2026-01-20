import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Building2, Settings, Shield, Bell, 
  Database, Key, FileText, Layers, CheckSquare, Calendar,
  Calculator, LineChart, DollarSign, Target, Milestone, ListChecks,
  FolderKanban, ClipboardList, Clock, Briefcase, Home, GitBranch,
  Package, MapPin, Building, Wrench
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
      title: 'Product Catalog',
      items: [
        { label: 'Home Plan Library', path: '/admin/plans', icon: Home },
        { label: 'Pricing Library', path: '/admin/pricing', icon: DollarSign },
      ]
    },
    {
      title: 'Templates',
      items: [
        { label: 'Project Templates', path: '/admin/project-templates', icon: FolderKanban },
        { label: 'Budget Templates', path: '/admin/budget-templates', icon: Calculator },
        { label: 'Proforma Templates', path: '/admin/proforma-templates', icon: LineChart },
        { label: 'Schedule Templates', path: '/admin/schedule-templates', icon: Calendar },
        { label: 'Deal Analyzer Templates', path: '/admin/deal-templates', icon: Target },
        { label: 'Task List Templates', path: '/admin/task-templates', icon: CheckSquare },
        { label: 'Milestone Templates', path: '/admin/milestone-templates', icon: Milestone },
      ]
    },
    {
      title: 'Accounting',
      items: [
        { label: 'COA Templates', path: '/admin/coa-templates', icon: GitBranch },
      ]
    },
    {
      title: 'Organization',
      items: [
        { label: 'Team Management', path: '/admin/team', icon: Users },
        { label: 'Teams', path: '/admin/teams', icon: Building2 },
        { label: 'Roles & Permissions', path: '/admin/roles', icon: Shield },
        { label: 'Companies', path: '/admin/companies', icon: Briefcase },
      ]
    },
    {
      title: 'Configuration',
      items: [
        { label: 'General Settings', path: '/admin/settings', icon: Settings },
        { label: 'Notifications', path: '/admin/notifications', icon: Bell },
        { label: 'Integrations', path: '/admin/integrations', icon: Layers },
        { label: 'API Keys', path: '/admin/api-keys', icon: Key },
      ]
    },
    {
      title: 'System',
      items: [
        { label: 'Activity Log', path: '/admin/activity-log', icon: ClipboardList },
        { label: 'Audit Log', path: '/admin/audit-log', icon: Database },
        { label: 'Data Management', path: '/admin/data', icon: Database },
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
              const isActive = item.exact 
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
