import React, { useState } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import {
  ChevronDown, ChevronLeft, LayoutDashboard, MapPin, Users, CheckSquare,
  FileText, DollarSign, Calculator, Calendar, Hammer, Receipt,
  TrendingUp, CreditCard, FolderOpen, Mail, MessageSquare, ShoppingCart, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ProjectSidebar = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(['overview', 'construction', 'finance', 'documents']);

  const toggle = (id) => setExpanded(prev =>
    prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
  );

  const sections = [
    {
      id: 'overview',
      label: 'Overview',
      items: [
        { label: 'Basic Info', path: 'overview', icon: LayoutDashboard },
        { label: 'Property Details', path: 'property-details', icon: MapPin },
        { label: 'Contacts', path: 'contacts', icon: Users },
        { label: 'Tasks', path: 'tasks', icon: CheckSquare },
      ]
    },
    {
      id: 'acquisition',
      label: 'Acquisition',
      items: [
        { label: 'Deal Analysis', path: 'acquisition', icon: Calculator },
        { label: 'Due Diligence', path: 'acquisition/due-diligence', icon: FileText },
        { label: 'Closing', path: 'acquisition/closing', icon: CheckSquare },
      ]
    },
    {
      id: 'construction',
      label: 'Construction',
      items: [
        { label: 'Budget', path: 'construction/budget', icon: DollarSign },
        { label: 'Schedule', path: 'construction/schedule', icon: Calendar },
        { label: 'Build/Draw', path: 'finance/draws', icon: CreditCard },
        { label: 'Change Orders', path: 'construction/change-orders', icon: ShoppingCart },
      ]
    },
    {
      id: 'finance',
      label: 'Finance',
      items: [
        { label: 'Summary', path: 'finance/summary', icon: TrendingUp },
        { label: 'Budget vs Actual', path: 'finance/budget-vs-actual', icon: Calculator },
        { label: 'Expenses', path: 'finance/expenses', icon: Receipt },
        { label: 'Loans', path: 'finance/loans', icon: CreditCard },
        { label: 'Bank Draw', path: 'finance/draws', icon: DollarSign },
        { label: 'Revenue & Sales', path: 'finance/revenue', icon: TrendingUp },
      ]
    },
    {
      id: 'documents',
      label: 'Documents',
      items: [
        { label: 'Files', path: 'documents/files', icon: FolderOpen },
        { label: 'Mailing', path: 'documents/mailing', icon: Mail },
        { label: 'Communications', path: 'documents/communications', icon: MessageSquare },
      ]
    },
  ];

  const adminItems = [
    { label: 'Projects Admin', icon: Settings, path: '/projects/admin' },
  ];

  return (
    <div className="w-60 bg-[#1e2a3a] flex flex-col h-full flex-shrink-0 border-r border-gray-700">
      <div className="p-3 border-b border-gray-700">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white mb-2"
        >
          <ChevronLeft className="w-3 h-3" />
          Back to Projects
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {sections.map((section) => (
          <div key={section.id}>
            <button
              onClick={() => toggle(section.id)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-white"
            >
              <span>{section.label}</span>
              <ChevronDown className={cn("w-3 h-3 transition-transform", expanded.includes(section.id) ? "" : "-rotate-90")} />
            </button>
            {expanded.includes(section.id) && (
              <div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={`/project/${projectId}/${item.path}`}
                      className={({ isActive }) => cn(
                        "flex items-center gap-2 px-4 py-1.5 text-xs transition-colors",
                        isActive
                          ? "text-white bg-white/10 border-l-2 border-emerald-500"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Admin Section */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="px-3 py-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Admin</p>
          {adminItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-2 px-4 py-1.5 text-xs transition-colors",
                  isActive
                    ? "text-white bg-white/10 border-l-2 border-emerald-500"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default ProjectSidebar;
