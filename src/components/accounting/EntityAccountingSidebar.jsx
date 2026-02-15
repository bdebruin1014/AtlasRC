import React, { useState } from 'react';
import { NavLink, useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown, ChevronRight, ChevronLeft,
  LayoutDashboard, Building2, ClipboardList,
  Landmark, ArrowLeftRight, CreditCard,
  List, BookOpen, CheckSquare, Scale,
  FileText, Clock, Users,
  Receipt, Layers, FileCheck, DollarSign,
  Calculator, ArrowRightLeft, Link2,
  BarChart3, TrendingUp, TrendingDown, Briefcase,
  Calendar, Lock, Settings, FolderOpen, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Collapsible Section Component
function SidebarSection({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const location = useLocation();

  // Auto-expand if any child is active
  React.useEffect(() => {
    const childPaths = React.Children.toArray(children)
      .filter(child => child?.props?.to)
      .map(child => child.props.to);

    if (childPaths.some(path => location.pathname.includes(path.split('/').pop()))) {
      setIsOpen(true);
    }
  }, [location.pathname, children]);

  return (
    <div className="mb-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:bg-muted/50 rounded-md"
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

// Navigation Item Component
function NavItem({ to, icon: Icon, label, badge = null }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
        isActive
          ? "bg-emerald-100 text-emerald-700 font-medium"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="truncate flex-1">{label}</span>
      {badge !== null && badge > 0 && (
        <Badge variant="secondary" className="h-5 px-1.5 text-xs ml-auto">
          {badge}
        </Badge>
      )}
    </NavLink>
  );
}

export default function EntityAccountingSidebar({ entity, taskCount = 0 }) {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const basePath = `/accounting/entities/${entityId}`;

  // Entity type badge color
  const getTypeColor = (type) => {
    const colors = {
      'holding_company': 'bg-purple-100 text-purple-700',
      'holding': 'bg-purple-100 text-purple-700',
      'operating_company': 'bg-blue-100 text-blue-700',
      'operating': 'bg-green-100 text-green-700',
      'spe': 'bg-green-100 text-green-700',
      'project': 'bg-blue-100 text-blue-700',
      'llc': 'bg-gray-100 text-gray-700',
      'trust': 'bg-amber-100 text-amber-700',
      'investment': 'bg-amber-100 text-amber-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const entityType = entity?.entity_type || entity?.type || 'entity';

  return (
    <div className="w-64 border-r bg-background h-full overflow-y-auto flex flex-col">
      {/* Back Button */}
      <div className="p-3 border-b">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => navigate('/accounting/entities')}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Entities
        </Button>
      </div>

      {/* Entity Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Building2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm truncate">
              {entity?.short_name || entity?.name || entity?.legal_name || 'Entity'}
            </h2>
            <Badge className={cn("text-xs", getTypeColor(entityType))}>
              {entityType?.replace(/_/g, ' ') || 'Entity'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">

        {/* MANAGE */}
        <SidebarSection title="Manage" defaultOpen={true}>
          <NavItem to={`${basePath}/dashboard`} icon={LayoutDashboard} label="Dashboard" />
          <NavItem to={`${basePath}/details`} icon={Building2} label="Entity Details" />
          <NavItem to={`${basePath}/tasks`} icon={ClipboardList} label="Tasks" badge={taskCount} />
        </SidebarSection>

        {/* BANKING */}
        <SidebarSection title="Banking">
          <NavItem to={`${basePath}/bank-accounts`} icon={Landmark} label="Bank Accounts" />
          <NavItem to={`${basePath}/bank-feeds`} icon={ArrowLeftRight} label="Bank Feeds" />
          <NavItem to={`${basePath}/credit-cards`} icon={CreditCard} label="Credit Cards" />
        </SidebarSection>

        {/* TRANSACTIONS */}
        <SidebarSection title="Transactions">
          <NavItem to={`${basePath}/transactions`} icon={List} label="All Transactions" />
          <NavItem to={`${basePath}/journal-entries`} icon={BookOpen} label="Journal Entries" />
          <NavItem to={`${basePath}/reconciliation`} icon={CheckSquare} label="Reconciliation" />
        </SidebarSection>

        {/* RECEIVABLES (AR) */}
        <SidebarSection title="Receivables (AR)">
          <NavItem to={`${basePath}/invoices`} icon={FileText} label="Invoices" />
          <NavItem to={`${basePath}/customers`} icon={Users} label="Customers" />
          <NavItem to={`${basePath}/ar-aging`} icon={Clock} label="AR Aging Report" />
        </SidebarSection>

        {/* PAYABLES (AP) */}
        <SidebarSection title="Payables (AP)">
          <NavItem to={`${basePath}/bills`} icon={Receipt} label="Bills" />
          <NavItem to={`${basePath}/vendors`} icon={Users} label="Vendors" />
          <NavItem to={`${basePath}/batch-payments`} icon={Layers} label="Batch Payments" />
          <NavItem to={`${basePath}/1099`} icon={FileCheck} label="1099 Vendors" />
          <NavItem to={`${basePath}/expenses`} icon={DollarSign} label="Expenses" />
        </SidebarSection>

        {/* LOANS */}
        <SidebarSection title="Loans">
          <NavItem to={`${basePath}/loans`} icon={Landmark} label="Loans Payable" />
        </SidebarSection>

        {/* PAYROLL */}
        <SidebarSection title="Payroll">
          <NavItem to={`${basePath}/payroll`} icon={Calculator} label="Payroll" />
        </SidebarSection>

        {/* INTERCOMPANY */}
        <SidebarSection title="Intercompany">
          <NavItem to={`${basePath}/intercompany`} icon={ArrowRightLeft} label="Intercompany Txns" />
          <NavItem to={`${basePath}/due-to-from`} icon={Link2} label="Due To/From" />
        </SidebarSection>

        {/* REPORTS */}
        <SidebarSection title="Reports">
          <NavItem to={`${basePath}/trial-balance`} icon={Scale} label="Trial Balance" />
          <NavItem to={`${basePath}/balance-sheet`} icon={BarChart3} label="Balance Sheet" />
          <NavItem to={`${basePath}/income-statement`} icon={TrendingUp} label="Income Statement" />
          <NavItem to={`${basePath}/cash-flow`} icon={DollarSign} label="Cash Flow" />
          <NavItem to={`${basePath}/job-costing`} icon={Briefcase} label="Job Costing" />
        </SidebarSection>

        {/* MONTH-END */}
        <SidebarSection title="Month-End">
          <NavItem to={`${basePath}/month-end`} icon={Calendar} label="Month-End Close" />
          <NavItem to={`${basePath}/fiscal-periods`} icon={Lock} label="Fiscal Periods" />
        </SidebarSection>

        {/* EQUITY & OWNERSHIP */}
        <SidebarSection title="Equity & Ownership">
          <NavItem to={`${basePath}/ownership`} icon={Users} label="Ownership" />
          <NavItem to={`${basePath}/capital-contributions`} icon={DollarSign} label="Capital Contributions" />
          <NavItem to={`${basePath}/distributions`} icon={ArrowRightLeft} label="Distributions" />
        </SidebarSection>

        {/* TAX & ASSETS */}
        <SidebarSection title="Tax & Assets">
          <NavItem to={`${basePath}/depreciation`} icon={TrendingDown} label="Depreciation" />
          <NavItem to={`${basePath}/tax-tracking`} icon={FileCheck} label="Tax Tracking" />
          <NavItem to={`${basePath}/fixed-assets`} icon={Briefcase} label="Fixed Assets" />
        </SidebarSection>

        {/* SETTINGS */}
        <SidebarSection title="Settings">
          <NavItem to={`${basePath}/files`} icon={FolderOpen} label="Files" />
          <NavItem to={`${basePath}/communications`} icon={MessageSquare} label="Communications" />
          <NavItem to={`${basePath}/settings`} icon={Settings} label="Settings" />
        </SidebarSection>

        {/* ADMIN */}
        <SidebarSection title="Admin">
          <NavItem to="/accounting/admin" icon={Settings} label="Accounting Admin" />
        </SidebarSection>

      </nav>
    </div>
  );
}
