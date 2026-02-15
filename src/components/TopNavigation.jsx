import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home, Building2, FolderKanban, Users, Calendar, Settings, DollarSign,
  Cog, ChevronDown, ClipboardList, CheckSquare, FileText, Layers, Users2,
  BarChart3, Target, TrendingUp, Clock, BookOpen, Receipt, Plus,
  FileSignature, FolderOpen, Calculator, GitBranch, Flag, RefreshCw, Hammer,
  Layout, ArrowUpCircle, CalendarDays
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/contexts/PermissionContext';
import NotificationCenter from './NotificationCenter';

const TopNavigation = () => {
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(null);
  const { canAccessModule, isAdmin, loading: permissionsLoading } = usePermissions();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Opportunities', path: '/opportunities', icon: FolderKanban },
    { label: 'Projects', path: '/projects', icon: Building2 },
    { label: 'Contacts', path: '/contacts', icon: Users },
    { label: 'Calendar', path: '/calendar', icon: Calendar },
    {
      label: 'Construction',
      icon: Hammer,
      dropdown: [
        { label: 'Houses', path: '/construction', icon: Home, description: 'All houses & milestone tracker' },
        { label: 'Admin', path: '', isHeader: true },
        { label: 'Floor Plans', path: '/construction/admin/floor-plans', icon: Layout, description: 'Home plan library' },
        { label: 'Plan Pricing', path: '/construction/admin/plans', icon: Calculator, description: 'Sticks & bricks cost matrix' },
        { label: 'Upgrade Packages', path: '/construction/admin/upgrades', icon: ArrowUpCircle, description: 'Upgrade tiers & pricing' },
        { label: 'Schedule Templates', path: '/construction/admin/schedule-templates', icon: CalendarDays, description: 'Construction schedules by plan' },
        { label: 'Municipality Fees', path: '/construction/admin/municipalities', icon: Building2, description: 'Fee schedules by jurisdiction' },
        { label: 'Tools', path: '', isHeader: true },
        { label: 'Contract Assembler', path: '/construction/contract-assembler', icon: FileSignature, description: 'Build contract packages' },
      ]
    },
    {
      label: 'Accounting',
      icon: DollarSign,
      dropdown: [
        { label: 'Overview', path: '', isHeader: true },
        { label: 'Dashboard', path: '/accounting/dashboard', icon: BarChart3, description: 'Financial overview across entities' },
        { label: 'Entities', path: '/accounting/entities', icon: Building2, description: 'Entity-level accounting' },
        { label: 'Hierarchy', path: '/accounting/hierarchy', icon: GitBranch, description: 'Ownership structure' },
        { label: 'Global', path: '', isHeader: true },
        { label: 'Chart of Accounts', path: '/accounting/chart-of-accounts', icon: BookOpen, description: 'Master account structure' },
        { label: 'Consolidation', path: '/accounting/consolidation', icon: Layers, description: 'Consolidated financials' },
        { label: 'Planning', path: '', isHeader: true },
        { label: 'Forecasting', path: '/accounting/forecasting', icon: TrendingUp, description: 'Cash flow projections' },
        { label: 'Investor Portal', path: '/accounting/investor-portal', icon: Users, description: 'Investor reporting & distributions' },
      ]
    },
    {
      label: 'Operations',
      icon: Cog,
      dropdown: [
        { label: 'Dashboard', path: '/operations', icon: ClipboardList, description: 'Operations overview' },
        { label: 'Notification Center', path: '/operations/notifications', icon: Clock, description: 'All notifications' },
        { label: 'Teams', path: '/operations/teams', icon: Users2, description: 'Team organization' },
        { label: 'Workflow Templates', path: '/operations/tasks/templates', icon: GitBranch, description: 'Task workflow templates' },
        { label: 'Milestone Templates', path: '/operations/milestones', icon: Flag, description: 'Global milestone tracking' },
        { label: 'Tools', path: '', isHeader: true },
        { label: 'E-Signatures', path: '/operations/esign', icon: FileSignature, description: 'Send & track documents' },
        { label: 'Document Library', path: '/operations/documents', icon: FolderOpen, description: 'Templates & files' },
        { label: 'Contract Templates', path: '/operations/contract-templates', icon: FileText, description: 'Contract template library' },
        { label: 'Reports', path: '', isHeader: true },
        { label: 'Reports', path: '/reports', icon: BarChart3, description: 'All reports' },
      ]
    },
    { label: 'Admin', path: '/admin', icon: Settings },
  ];

  const visibleNavItems = permissionsLoading ? navItems : navItems.filter(item => {
    const moduleMap = {
      'Home': null,
      'Opportunities': 'pipeline',
      'Projects': 'projects',
      'Contacts': 'contacts',
      'Calendar': 'calendar',
      'Construction': 'construction',
      'Accounting': 'accounting',
      'Operations': 'operations',
      'Admin': 'admin',
    };

    const module = moduleMap[item.label];
    if (module === null) return true;
    if (module === 'admin') return isAdmin();
    return canAccessModule(module);
  });

  return (
    <header className="h-10 bg-[#1a1a1a] border-b border-gray-800 flex items-center px-4 flex-shrink-0 relative z-50">
      <div className="flex items-center gap-2 mr-6 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-6 h-6 bg-[#047857] rounded flex items-center justify-center">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-bold text-sm">Atlas</span>
      </div>
      
      <nav className="flex items-center gap-0.5">
        {visibleNavItems.map((item) => {
          const IconComponent = item.icon;
          if (item.dropdown) {
            return (
              <div key={item.label} className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded transition-colors",
                    openDropdown === item.label ? "text-white bg-gray-700" : "text-gray-400 hover:text-white"
                  )}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                  {item.label}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {openDropdown === item.label && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                    <div className="absolute top-full left-0 mt-1 bg-[#2a2a2a] border border-gray-700 rounded-md shadow-lg py-1 min-w-[260px] z-50 max-h-[70vh] overflow-y-auto">
                      {item.dropdown.map((subItem, idx) => {
                        if (subItem.isHeader) {
                          return (
                            <div key={idx} className="px-3 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider border-t border-gray-700 mt-1 first:border-0 first:mt-0">
                              {subItem.label}
                            </div>
                          );
                        }
                        const SubIcon = subItem.icon;
                        return (
                          <button
                            key={subItem.path}
                            onClick={() => { navigate(subItem.path); setOpenDropdown(null); }}
                            className="w-full flex items-start gap-3 px-3 py-2 text-left hover:bg-gray-700"
                          >
                            {SubIcon && (
                              <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                <SubIcon className="w-4 h-4 text-gray-300" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-gray-200">{subItem.label}</p>
                              {subItem.description && (
                                <p className="text-xs text-gray-500 mt-0.5">{subItem.description}</p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          }
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded transition-colors",
                isActive ? "text-white bg-[#047857]" : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <IconComponent className="w-3.5 h-3.5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <NotificationCenter />
        <button onClick={() => navigate('/settings')} className="text-gray-400 hover:text-white p-1.5">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default TopNavigation;
