import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home, Building2, FolderKanban, Users, Calendar, Settings, DollarSign,
  Cog, ChevronDown, ClipboardList, CheckSquare, FileText, Layers, Users2,
  BarChart3, Target, TrendingUp, Clock, BookOpen, Receipt, Plus,
  FileSignature, FolderOpen, Calculator, GitBranch, Flag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import NotificationCenter from './NotificationCenter';

const TopNavigation = () => {
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(null);

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Executive', path: '/executive', icon: BarChart3 },
    { label: 'Projects', path: '/projects', icon: Building2 },
    
    // Pipeline/Acquisition Dropdown
    { 
      label: 'Pipeline', 
      icon: FolderKanban,
      dropdown: [
        { label: 'Opportunities', path: '/opportunities', icon: FolderKanban, description: 'All pipeline opportunities' },
        { label: 'Pipeline Dashboard', path: '/acquisition', icon: BarChart3, description: 'Acquisition pipeline analytics' },
        { label: 'Deal Analyzer', path: '/deal-analyzer', icon: Calculator, description: 'Quick property analysis tool' },
      ]
    },
    
    { label: 'Contacts', path: '/contacts/list', icon: Users },
    { label: 'Calendar', path: '/calendar', icon: Calendar },
    
    // Accounting Dropdown with main sections
    {
      label: 'Accounting',
      icon: DollarSign,
      dropdown: [
        { label: 'Dashboard', path: '/accounting/dashboard', icon: BarChart3, description: 'Financial overview' },
        { label: 'Entities', path: '/entities/list', icon: Building2, description: 'Manage entities' },
        { label: 'Chart of Accounts', path: '/accounting/chart-of-accounts', icon: BookOpen, description: 'Account structure' },
        { label: 'Transactions', path: '', isHeader: true },
        { label: 'All Transactions', path: '/accounting/transactions', icon: Receipt, description: 'View all transactions' },
        { label: 'New Transaction', path: '/accounting/transactions/new', icon: Plus, description: 'Record a transaction' },
      ]
    },

    // Operations Dropdown (Streamlined)
    { 
      label: 'Operations', 
      icon: Cog,
      dropdown: [
        { label: 'Dashboard', path: '/operations', icon: ClipboardList, description: 'Operations overview' },
        { label: 'EOS', path: '/eos', icon: Target, description: 'Entrepreneurial Operating System' },
        { label: 'Tasks', path: '/operations/tasks', icon: CheckSquare, description: 'Team task management' },
        { label: 'Workflow Templates', path: '/operations/tasks/templates', icon: GitBranch, description: 'Task workflow templates' },
        { label: 'Milestones', path: '/operations/milestones', icon: Flag, description: 'Global milestone tracking' },
        { label: 'Teams', path: '/operations/teams', icon: Users2, description: 'Team organization' },
        { label: 'Tools', path: '', isHeader: true },
        { label: 'E-Signatures', path: '/operations/esign', icon: FileSignature, description: 'Send & track documents' },
        { label: 'Document Library', path: '/operations/documents', icon: FolderOpen, description: 'Templates & files' },
        { label: 'Reports', path: '', isHeader: true },
        { label: 'Preset Reports', path: '/reports/preset', icon: BarChart3, description: 'Standard report templates' },
        { label: 'Custom Reports', path: '/reports/custom', icon: FileText, description: 'Build custom reports' },
        { label: 'Subscribed', path: '/reports/subscribed', icon: Clock, description: 'Scheduled reports' },
        { label: 'Report Packages', path: '/reports/packages', icon: Layers, description: 'Report bundles' },
        { label: 'Trends', path: '/reports/trends', icon: TrendingUp, description: 'Analytics & trends' },
      ]
    },

    { label: 'Admin', path: '/admin', icon: Settings },
  ];

  return (
    <header className="h-10 bg-[#1a1a1a] border-b border-gray-800 flex items-center px-4 flex-shrink-0 relative z-50">
      <div className="flex items-center gap-2 mr-6 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-6 h-6 bg-[#047857] rounded flex items-center justify-center">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-bold text-sm">Atlas</span>
      </div>
      
      <nav className="flex items-center gap-0.5">
        {navItems.map((item) => {
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
