import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Building2, Landmark, FileText, CreditCard, Receipt, BookOpen, Users, PieChart, Settings, DollarSign, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const EntityAccountingDashboard = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('banking');
  const [expandedGroups, setExpandedGroups] = useState(['transactions', 'reporting', 'settings']);

  const entity = {
    id: entityId,
    name: entityId === '1' ? 'VanRock Holdings LLC' : entityId === '2' ? 'Olive Brynn LLC' : 'AtlasDev',
    type: 'Corporation',
    fye: 'December 31',
  };

  const sidebarGroups = [
    {
      id: 'transactions',
      label: 'Transactions',
      items: [
        { id: 'banking', label: 'Banking', icon: Landmark },
        { id: 'bills', label: 'Bills', icon: Receipt },
        { id: 'invoices', label: 'Invoices', icon: FileText },
        { id: 'journal', label: 'Journal Entries', icon: BookOpen },
        { id: 'payments', label: 'Payments', icon: CreditCard },
      ]
    },
    {
      id: 'reporting',
      label: 'Reporting',
      items: [
        { id: 'reports', label: 'Reports', icon: PieChart },
        { id: 'chart-of-accounts', label: 'Chart of Accounts', icon: BookOpen },
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      items: [
        { id: 'vendors', label: 'Vendors', icon: Users },
        { id: 'entity-settings', label: 'Entity Settings', icon: Settings },
      ]
    },
  ];

  const bankAccounts = [
    { id: 1, name: 'Chase Operating', last4: '8821', balance: 245000.50, status: 'reconciled' },
    { id: 2, name: 'Chase Payroll', last4: '9912', balance: 55000.00, status: 'reconciled' },
    { id: 3, name: 'Construction High-Yield', last4: '1102', balance: 945000.00, status: 'pending' },
  ];

  const recentTransactions = [
    { id: 1, date: 'Dec 15', description: 'Customer Payment - Unit 404', category: 'Sales', amount: 45000, type: 'deposit' },
    { id: 2, date: 'Dec 14', description: 'Architectural Designs Inc', category: 'Design Fees', amount: -5000, type: 'payment' },
    { id: 3, date: 'Dec 12', description: 'City of Greenville', category: 'Permits', amount: -2500, type: 'payment' },
    { id: 4, date: 'Dec 10', description: 'Smith Construction Draw #4', category: 'Hard Costs', amount: -125000, type: 'payment' },
  ];

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) ? prev.filter(g => g !== groupId) : [...prev, groupId]
    );
  };

  const renderContent = () => {
    if (activeSection === 'banking') {
      return (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Bank Accounts</h2>
            <Button className="bg-[#047857] hover:bg-[#065f46] h-8 text-sm"><Plus className="w-4 h-4 mr-1" />Add Account</Button>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            {bankAccounts.map((account) => (
              <div key={account.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Landmark className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    account.status === 'reconciled' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {account.status}
                  </span>
                </div>
                <h3 className="font-medium text-gray-900">{account.name}</h3>
                <p className="text-sm text-gray-500">•••• {account.last4}</p>
                <p className="text-xs text-gray-400 mt-2">AVAILABLE BALANCE</p>
                <p className="text-2xl font-semibold text-gray-900">${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-medium text-gray-900">Recent Banking Activity</h3>
              <Button variant="link" className="text-[#047857] h-auto p-0">View All</Button>
            </div>
            <div className="divide-y">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                      {tx.date.split(' ')[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{tx.description}</p>
                      <p className="text-sm text-gray-500">{tx.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn("font-medium", tx.amount > 0 ? "text-[#047857]" : "text-gray-900")}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount < 0 ? '-' : ''}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{tx.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="bg-white border rounded-lg p-12 text-center">
          <p className="text-gray-600 capitalize font-medium">{activeSection.replace('-', ' ')}</p>
          <p className="text-gray-400 text-sm mt-2">Mock data interface - Real integration coming</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-40px)] bg-gray-50">
      {/* Dark Sidebar */}
      <div className="w-52 bg-[#1e2a3a] flex-shrink-0 flex flex-col">
        <div className="p-3 border-b border-gray-700">
          <button onClick={() => navigate('/accounting')} className="flex items-center gap-2 text-gray-400 hover:text-white text-xs mb-2">
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
          <h2 className="text-white font-semibold truncate">{entity.name}</h2>
          <p className="text-gray-500 text-xs">{entity.type} • FYE: {entity.fye}</p>
        </div>
        
        <nav className="flex-1 p-2 overflow-y-auto">
          {sidebarGroups.map((group) => (
            <div key={group.id} className="mb-2">
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-400 hover:text-white"
              >
                {group.label}
                <ChevronDown className={cn("w-4 h-4 transition-transform", expandedGroups.includes(group.id) ? "" : "-rotate-90")} />
              </button>
              {expandedGroups.includes(group.id) && (
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 text-xs rounded transition-colors",
                          activeSection === item.id 
                            ? "bg-white/10 text-white" 
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <IconComponent className="w-4 h-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[#047857]" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">{entity.name}</h1>
              <p className="text-sm text-gray-500">{entity.type} • FYE: {entity.fye}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline"><FileText className="w-4 h-4 mr-1" />Write Check</Button>
            <Button variant="outline"><Settings className="w-4 h-4 mr-1" />Entity Settings</Button>
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default EntityAccountingDashboard;
