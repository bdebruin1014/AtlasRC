import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Plus, Search, ChevronRight, ChevronDown, Edit2, Trash2, MoreVertical,
  FolderOpen, Folder, FileText, Copy, Download, Upload, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const EntityChartOfAccountsPage = () => {
  const { entityId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAccounts, setExpandedAccounts] = useState(['1000', '4000', '5000', '6000']);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Chart of accounts with sub-accounts
  const accounts = [
    // Assets
    {
      number: '1000',
      name: 'Cash and Cash Equivalents',
      type: 'Asset',
      category: 'Current Asset',
      description: 'All cash accounts including operating, construction, and reserve accounts',
      balance: 485000,
      subAccounts: [
        { number: '1000-01', name: 'Operating Account', description: 'Primary operating bank account', balance: 285000 },
        { number: '1000-02', name: 'Construction Account', description: 'Construction draw account', balance: 125000 },
        { number: '1000-03', name: 'Reserve Account', description: 'Operating reserve fund', balance: 75000 },
      ]
    },
    {
      number: '1100',
      name: 'Accounts Receivable',
      type: 'Asset',
      category: 'Current Asset',
      description: 'Amounts owed to the entity',
      balance: 45000,
      subAccounts: [
        { number: '1100-01', name: 'Trade Receivables', description: 'Customer invoices outstanding', balance: 35000 },
        { number: '1100-02', name: 'Other Receivables', description: 'Non-trade receivables', balance: 10000 },
      ]
    },
    {
      number: '1200',
      name: 'Due from Related Parties',
      type: 'Asset',
      category: 'Current Asset',
      description: 'Intercompany receivables',
      balance: 125000,
      subAccounts: []
    },
    {
      number: '1500',
      name: 'Fixed Assets',
      type: 'Asset',
      category: 'Fixed Asset',
      description: 'Property, plant, and equipment',
      balance: 2500000,
      subAccounts: [
        { number: '1500-01', name: 'Land', description: 'Land holdings at cost', balance: 850000 },
        { number: '1500-02', name: 'Buildings', description: 'Building improvements', balance: 1200000 },
        { number: '1500-03', name: 'Construction in Progress', description: 'Capitalized construction costs', balance: 650000 },
        { number: '1500-04', name: 'Accumulated Depreciation', description: 'Accumulated depreciation on buildings', balance: -200000 },
      ]
    },
    // Liabilities
    {
      number: '2000',
      name: 'Accounts Payable',
      type: 'Liability',
      category: 'Current Liability',
      description: 'Amounts owed to vendors',
      balance: 185000,
      subAccounts: [
        { number: '2000-01', name: 'Trade Payables', description: 'Vendor invoices payable', balance: 165000 },
        { number: '2000-02', name: 'Retainage Payable', description: 'Construction retainage held', balance: 20000 },
      ]
    },
    {
      number: '2200',
      name: 'Loans Payable',
      type: 'Liability',
      category: 'Long-term Liability',
      description: 'Bank loans and lines of credit',
      balance: 1850000,
      subAccounts: [
        { number: '2200-01', name: 'Construction Loan', description: 'Primary construction financing', balance: 1500000 },
        { number: '2200-02', name: 'Mezzanine Loan', description: 'Subordinate debt financing', balance: 350000 },
      ]
    },
    {
      number: '2300',
      name: 'Due to Related Parties',
      type: 'Liability',
      category: 'Current Liability',
      description: 'Intercompany payables',
      balance: 75000,
      subAccounts: []
    },
    // Equity
    {
      number: '3000',
      name: 'Member Capital',
      type: 'Equity',
      category: 'Equity',
      description: 'Member capital contributions',
      balance: 1500000,
      subAccounts: [
        { number: '3000-01', name: 'Class A Capital', description: 'LP investor capital', balance: 1200000 },
        { number: '3000-02', name: 'Class B Capital', description: 'GP/Sponsor capital', balance: 300000 },
      ]
    },
    {
      number: '3100',
      name: 'Retained Earnings',
      type: 'Equity',
      category: 'Equity',
      description: 'Accumulated earnings',
      balance: 245000,
      subAccounts: []
    },
    // Revenue
    {
      number: '4000',
      name: 'Revenue',
      type: 'Revenue',
      category: 'Revenue',
      description: 'All revenue accounts',
      balance: 3200000,
      subAccounts: [
        { number: '4000-01', name: 'Lot Sales', description: 'Revenue from lot sales', balance: 1850000 },
        { number: '4000-02', name: 'Home Sales', description: 'Revenue from spec home sales', balance: 1200000 },
        { number: '4000-03', name: 'Builder Fees', description: 'Builder premium and upgrade fees', balance: 150000 },
      ]
    },
    {
      number: '4100',
      name: 'Other Income',
      type: 'Revenue',
      category: 'Other Income',
      description: 'Non-operating revenue',
      balance: 12500,
      subAccounts: [
        { number: '4100-01', name: 'Interest Income', description: 'Bank interest earned', balance: 8500 },
        { number: '4100-02', name: 'Miscellaneous Income', description: 'Other income', balance: 4000 },
      ]
    },
    // Cost of Sales
    {
      number: '5000',
      name: 'Cost of Sales',
      type: 'Expense',
      category: 'Cost of Sales',
      description: 'Direct costs of revenue',
      balance: 2100000,
      subAccounts: [
        { number: '5000-01', name: 'Land Cost', description: 'Cost of land sold', balance: 650000 },
        { number: '5000-02', name: 'Direct Construction', description: 'Direct construction costs', balance: 1100000 },
        { number: '5000-03', name: 'Indirect Construction', description: 'Indirect/soft construction costs', balance: 250000 },
        { number: '5000-04', name: 'Closing Costs', description: 'Title, legal, recording fees', balance: 45000 },
        { number: '5000-05', name: 'Sales Commissions', description: 'Broker and agent commissions', balance: 55000 },
      ]
    },
    // Operating Expenses
    {
      number: '6000',
      name: 'Operating Expenses',
      type: 'Expense',
      category: 'Operating Expense',
      description: 'General operating expenses',
      balance: 385000,
      subAccounts: [
        { number: '6000-01', name: 'Management Fees', description: 'Asset management fees', balance: 65000 },
        { number: '6000-02', name: 'Professional Fees - Legal', description: 'Legal services', balance: 45000 },
        { number: '6000-03', name: 'Professional Fees - Accounting', description: 'Accounting and audit', balance: 28000 },
        { number: '6000-04', name: 'Insurance', description: 'Property and liability insurance', balance: 42000 },
        { number: '6000-05', name: 'Property Taxes', description: 'Real estate taxes', balance: 85000 },
        { number: '6000-06', name: 'Interest Expense', description: 'Loan interest expense', balance: 95000 },
        { number: '6000-07', name: 'Marketing', description: 'Marketing and advertising', balance: 18000 },
        { number: '6000-08', name: 'Utilities', description: 'Electric, water, gas', balance: 7000 },
      ]
    },
  ];

  const toggleAccount = (accountNumber) => {
    setExpandedAccounts(prev => 
      prev.includes(accountNumber) 
        ? prev.filter(n => n !== accountNumber)
        : [...prev, accountNumber]
    );
  };

  const formatCurrency = (val) => {
    const absVal = Math.abs(val);
    const sign = val < 0 ? '-' : '';
    if (absVal >= 1000000) return `${sign}$${(absVal / 1000000).toFixed(2)}M`;
    if (absVal >= 1000) return `${sign}$${(absVal / 1000).toFixed(1)}K`;
    return `${sign}$${absVal.toLocaleString()}`;
  };

  const getTypeColor = (type) => ({
    Asset: 'text-blue-600',
    Liability: 'text-red-600',
    Equity: 'text-purple-600',
    Revenue: 'text-green-600',
    Expense: 'text-orange-600',
  }[type] || 'text-gray-600');

  const filteredAccounts = accounts.filter(acc => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const matchParent = acc.number.includes(query) || acc.name.toLowerCase().includes(query);
    const matchSub = acc.subAccounts.some(sub => 
      sub.number.includes(query) || sub.name.toLowerCase().includes(query)
    );
    return matchParent || matchSub;
  });

  // Group by type
  const groupedAccounts = filteredAccounts.reduce((acc, account) => {
    if (!acc[account.type]) acc[account.type] = [];
    acc[account.type].push(account);
    return acc;
  }, {});

  const typeOrder = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Chart of Accounts</h1>
          <p className="text-sm text-gray-500">Manage accounts and sub-accounts for this entity</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Upload className="w-4 h-4 mr-2" />Import</Button>
          <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]">
            <Plus className="w-4 h-4 mr-2" />Add Account
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search by account number or name..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={() => setExpandedAccounts(accounts.map(a => a.number))}>
          Expand All
        </Button>
        <Button variant="outline" onClick={() => setExpandedAccounts([])}>
          Collapse All
        </Button>
      </div>

      {/* Accounts List */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {typeOrder.map(type => {
          const typeAccounts = groupedAccounts[type];
          if (!typeAccounts || typeAccounts.length === 0) return null;
          
          return (
            <div key={type}>
              {/* Type Header */}
              <div className="px-4 py-3 bg-gray-100 border-b border-t first:border-t-0">
                <h3 className={cn("font-semibold", getTypeColor(type))}>{type}s</h3>
              </div>
              
              {/* Accounts */}
              {typeAccounts.map(account => {
                const isExpanded = expandedAccounts.includes(account.number);
                const hasSubAccounts = account.subAccounts && account.subAccounts.length > 0;
                
                return (
                  <div key={account.number}>
                    {/* Parent Account Row */}
                    <div 
                      className={cn(
                        "flex items-center px-4 py-3 border-b hover:bg-gray-50 cursor-pointer",
                        isExpanded && hasSubAccounts && "bg-gray-50"
                      )}
                      onClick={() => hasSubAccounts && toggleAccount(account.number)}
                    >
                      <div className="w-8">
                        {hasSubAccounts ? (
                          isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )
                        ) : (
                          <div className="w-4" />
                        )}
                      </div>
                      <div className="w-24">
                        <span className="font-mono text-sm font-medium">{account.number}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {hasSubAccounts ? (
                            <FolderOpen className="w-4 h-4 text-amber-500" />
                          ) : (
                            <FileText className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="font-medium">{account.name}</span>
                          {hasSubAccounts && (
                            <span className="text-xs text-gray-400">({account.subAccounts.length} sub-accounts)</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 ml-6">{account.description}</p>
                      </div>
                      <div className="w-32 text-right">
                        <span className="text-xs text-gray-500">{account.category}</span>
                      </div>
                      <div className="w-32 text-right font-medium">
                        {formatCurrency(account.balance)}
                      </div>
                      <div className="w-20 flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button className="p-1 hover:bg-gray-200 rounded">
                          <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                        <button className="p-1 hover:bg-gray-200 rounded">
                          <Plus className="w-3.5 h-3.5 text-gray-400" title="Add Sub-Account" />
                        </button>
                        <button className="p-1 hover:bg-gray-200 rounded">
                          <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Sub-Accounts */}
                    {isExpanded && hasSubAccounts && (
                      <div className="bg-gray-50 border-b">
                        {account.subAccounts.map(subAccount => (
                          <div 
                            key={subAccount.number}
                            className="flex items-center px-4 py-2 hover:bg-gray-100 border-t border-gray-200"
                          >
                            <div className="w-8" />
                            <div className="w-8 border-l-2 border-gray-300 h-full" />
                            <div className="w-24">
                              <span className="font-mono text-sm text-gray-600">{subAccount.number}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">{subAccount.name}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5 ml-6">{subAccount.description}</p>
                            </div>
                            <div className="w-32" />
                            <div className="w-32 text-right text-gray-600">
                              {formatCurrency(subAccount.balance)}
                            </div>
                            <div className="w-20 flex justify-end gap-1">
                              <button className="p-1 hover:bg-gray-200 rounded">
                                <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                              </button>
                              <button className="p-1 hover:bg-gray-200 rounded">
                                <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {/* Add Sub-Account Row */}
                        <div className="flex items-center px-4 py-2 border-t border-gray-200">
                          <div className="w-8" />
                          <div className="w-8" />
                          <button className="flex items-center gap-2 text-sm text-[#047857] hover:text-[#065f46]">
                            <Plus className="w-4 h-4" />
                            Add sub-account to {account.number}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium mb-2">Account Numbering</h4>
        <div className="flex gap-6 text-sm text-gray-600">
          <div><span className="font-mono font-medium">1000</span> - Parent account</div>
          <div><span className="font-mono font-medium">1000-01</span> - Sub-account (first)</div>
          <div><span className="font-mono font-medium">1000-02</span> - Sub-account (second)</div>
        </div>
      </div>
    </div>
  );
};

export default EntityChartOfAccountsPage;
