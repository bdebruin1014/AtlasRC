import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { 
  LayoutDashboard, Landmark, BookOpen, Users, FileText, 
  Receipt, CreditCard, RefreshCw, PiggyBank, BarChart3,
  ArrowLeftRight, Building2, Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuickActionsSection } from './QuickActionsSection';
import { TransactionEntryProvider } from '@/contexts/TransactionEntryContext';
import { TransactionModalContainer } from './TransactionModalContainer';

const navItems = [
  {
    section: 'Overview',
    items: [
      { name: 'Dashboard', icon: LayoutDashboard, path: 'dashboard' },
    ],
  },
  {
    section: 'Banking',
    items: [
      { name: 'Bank Accounts', icon: Landmark, path: 'banking' },
      { name: 'Reconciliation', icon: RefreshCw, path: 'reconciliation' },
    ],
  },
  {
    section: 'Transactions',
    items: [
      { name: 'Chart of Accounts', icon: BookOpen, path: 'chart-of-accounts' },
      { name: 'Journal Entries', icon: FileText, path: 'journal-entries' },
      { name: 'Bills', icon: Receipt, path: 'bills' },
      { name: 'Payments', icon: CreditCard, path: 'payments' },
      { name: 'Invoices', icon: FileText, path: 'invoices' },
    ],
  },
  {
    section: 'Vendors & Contacts',
    items: [
      { name: 'Vendors', icon: Building2, path: 'vendors' },
    ],
  },
  {
    section: 'Capital',
    items: [
      { name: 'Members', icon: Users, path: 'capital/members' },
      { name: 'Contributions', icon: PiggyBank, path: 'capital/contributions' },
      { name: 'Distributions', icon: ArrowLeftRight, path: 'capital/distributions' },
    ],
  },
  {
    section: 'Reports',
    items: [
      { name: 'All Reports', icon: BarChart3, path: 'reports' },
    ],
  },
];

const AccountingSidebar = ({ entityName }) => {
  const { entityId } = useParams();
  const basePath = `/accounting/entity/${entityId}`;

  return (
    <TransactionEntryProvider>
      <div className="w-56 bg-white border-r border-gray-200 flex flex-col h-full">
        {/* Entity Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {entityName || 'Entity'}
              </p>
              <p className="text-xs text-gray-500">Accounting</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActionsSection selectedEntity={entityId} />

        {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {navItems.map((section) => (
          <div key={section.section} className="mb-4">
            <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {section.section}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={`${basePath}/${item.path}`}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                          isActive
                            ? "bg-emerald-50 text-emerald-700 font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )
                      }
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <NavLink
          to="/accounting"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <Building2 className="w-4 h-4" />
          Switch Entity
        </NavLink>
      </div>
      
      {/* Transaction Modals */}
      <TransactionModalContainer />
    </div>
    </TransactionEntryProvider>
  );
};

export default AccountingSidebar;
