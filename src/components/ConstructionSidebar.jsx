import React, { useState, useEffect } from 'react';
import { NavLink, useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown, ChevronRight, ChevronLeft,
  LayoutDashboard, ClipboardList, Palette,
  DollarSign, Calendar, FileText, Shield,
  CheckSquare, ListChecks, Camera, ShieldCheck,
  FileCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getMilestoneLabel, getHouseById } from '@/services/constructionService';

const MILESTONE_COLORS = {
  pre_contract: 'bg-gray-100 text-gray-700',
  permitting: 'bg-blue-100 text-blue-700',
  mobilized: 'bg-yellow-100 text-yellow-700',
  foundation: 'bg-orange-100 text-orange-700',
  framing: 'bg-orange-100 text-orange-700',
  sheetrock: 'bg-purple-100 text-purple-700',
  co: 'bg-green-100 text-green-700',
  warranty: 'bg-teal-100 text-teal-700',
  complete: 'bg-emerald-100 text-emerald-800',
};

// Collapsible Section
function SidebarSection({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const location = useLocation();

  React.useEffect(() => {
    const childPaths = React.Children.toArray(children)
      .filter(child => child?.props?.to)
      .map(child => child.props.to);

    if (childPaths.some(path => location.pathname === path || location.pathname.startsWith(path + '/'))) {
      setIsOpen(true);
    }
  }, [location.pathname, children]);

  return (
    <div className="mb-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:bg-white/5 rounded-md"
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
      </button>
      {isOpen && (
        <div className="mt-1 space-y-0.5">
          {children}
        </div>
      )}
    </div>
  );
}

// Nav Item
function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      end={to.split('/').length <= 3}
      className={({ isActive }) => cn(
        'flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors',
        isActive
          ? 'bg-emerald-600/20 text-emerald-400 font-medium'
          : 'text-gray-300 hover:bg-white/5 hover:text-white'
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

export default function ConstructionSidebar({ house: houseProp }) {
  const { houseId } = useParams();
  const navigate = useNavigate();
  const [house, setHouse] = useState(houseProp || null);

  // Fetch house record if not passed as prop
  useEffect(() => {
    if (houseProp) {
      setHouse(houseProp);
      return;
    }
    if (!houseId) return;

    async function fetchHouse() {
      const { data } = await getHouseById(houseId);
      if (data) setHouse(data);
    }
    fetchHouse();
  }, [houseId, houseProp]);

  const basePath = `/construction/${houseId}`;
  const milestone = house?.current_milestone || 'pre_contract';
  const milestoneColor = MILESTONE_COLORS[milestone] || MILESTONE_COLORS.pre_contract;

  // Build plan subtitle: "Plan Name — Elevation" or just plan name
  const planSubtitle = [house?.plan_name, house?.elevation].filter(Boolean).join(' — ');

  return (
    <div className="w-60 bg-[#1a1f2e] h-full overflow-y-auto flex flex-col text-white">
      {/* Back Button */}
      <div className="p-3 border-b border-white/10">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
          onClick={() => navigate('/construction')}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Houses
        </Button>
      </div>

      {/* House Header */}
      <div className="p-4 border-b border-white/10">
        <h2 className="font-semibold text-sm truncate text-white">
          {house?.house_name || 'House'}
        </h2>
        {planSubtitle && (
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {planSubtitle}
          </p>
        )}
        <Badge className={cn('text-xs mt-2', milestoneColor)}>
          {getMilestoneLabel(milestone)}
        </Badge>
      </div>

      {/* Navigation — 4 sections, 12 per-house items */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">

        {/* OVERVIEW */}
        <SidebarSection title="Overview" defaultOpen={true}>
          <NavItem to={basePath} icon={LayoutDashboard} label="House Overview" />
          <NavItem to={`${basePath}/selections`} icon={Palette} label="Selections" />
          <NavItem to={`${basePath}/daily-logs`} icon={ClipboardList} label="Daily Logs" />
        </SidebarSection>

        {/* BUILD */}
        <SidebarSection title="Build">
          <NavItem to={`${basePath}/budget`} icon={DollarSign} label="Budget" />
          <NavItem to={`${basePath}/schedule`} icon={Calendar} label="Schedule" />
          <NavItem to={`${basePath}/purchase-orders`} icon={FileText} label="Purchase Orders" />
          <NavItem to={`${basePath}/change-orders`} icon={FileCheck} label="Change Orders" />
        </SidebarSection>

        {/* COMPLIANCE */}
        <SidebarSection title="Compliance">
          <NavItem to={`${basePath}/permits`} icon={Shield} label="Permits" />
          <NavItem to={`${basePath}/inspections`} icon={CheckSquare} label="Inspections" />
        </SidebarSection>

        {/* CLOSEOUT */}
        <SidebarSection title="Closeout">
          <NavItem to={`${basePath}/punch-list`} icon={ListChecks} label="Punch List" />
          <NavItem to={`${basePath}/warranty`} icon={ShieldCheck} label="Warranty" />
          <NavItem to={`${basePath}/photos`} icon={Camera} label="Photos" />
        </SidebarSection>

      </nav>
    </div>
  );
}
