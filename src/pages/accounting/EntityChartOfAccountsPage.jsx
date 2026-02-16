import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plus, Search, ChevronRight, ChevronDown, Edit2, Trash2, MoreVertical,
  FolderOpen, Folder, FileText, Copy, Download, Upload, Settings, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import chartOfAccountsService from '@/services/chartOfAccountsService';

const EntityChartOfAccountsPage = () => {
  const { entityId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAccounts, setExpandedAccounts] = useState([]);
  const [rawAccounts, setRawAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAccounts() {
      setLoading(true);
      try {
        const data = await chartOfAccountsService.getChartOfAccounts(entityId, { includeInactive: false });
        setRawAccounts(data || []);
        // Auto-expand parent accounts
        const parents = (data || []).filter(a => (data || []).some(c => c.parent_account_id === a.id));
        setExpandedAccounts(parents.map(a => a.account_number));
      } catch (err) {
        console.error('Error loading chart of accounts:', err);
        setRawAccounts([]);
      } finally {
        setLoading(false);
      }
    }
    if (entityId) fetchAccounts();
  }, [entityId]);

  // Build tree: group accounts into parents with sub-accounts
  const accounts = useMemo(() => {
    const parentAccounts = rawAccounts.filter(a => !a.parent_account_id);
    const childAccounts = rawAccounts.filter(a => a.parent_account_id);

    return parentAccounts.map(parent => ({
      ...parent,
      number: parent.account_number,
      name: parent.account_name,
      type: (parent.account_type || '').charAt(0).toUpperCase() + (parent.account_type || '').slice(1),
      category: parent.sub_category || parent.account_type || '',
      description: parent.description || '',
      balance: parseFloat(parent.balance) || 0,
      subAccounts: childAccounts
        .filter(c => c.parent_account_id === parent.id)
        .map(c => ({
          ...c,
          number: c.account_number,
          name: c.account_name,
          description: c.description || '',
          balance: parseFloat(c.balance) || 0,
        })),
    }));
  }, [rawAccounts]);

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
    Cogs: 'text-orange-600',
    Other_income: 'text-green-600',
    Other_expense: 'text-orange-600',
  }[type] || 'text-gray-600');

  const filteredAccounts = accounts.filter(acc => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const matchParent = (acc.number || '').includes(query) || (acc.name || '').toLowerCase().includes(query);
    const matchSub = (acc.subAccounts || []).some(sub =>
      (sub.number || '').includes(query) || (sub.name || '').toLowerCase().includes(query)
    );
    return matchParent || matchSub;
  });

  // Group by type
  const groupedAccounts = filteredAccounts.reduce((acc, account) => {
    const type = account.type || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(account);
    return acc;
  }, {});

  const typeOrder = ['Asset', 'Liability', 'Equity', 'Revenue', 'Cogs', 'Expense', 'Other_income', 'Other_expense'];
  const typeLabels = {
    Asset: 'Assets', Liability: 'Liabilities', Equity: 'Equity',
    Revenue: 'Revenue', Cogs: 'Cost of Goods Sold', Expense: 'Expenses',
    Other_income: 'Other Income', Other_expense: 'Other Expenses',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#047857]" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Chart of Accounts</h1>
          <p className="text-sm text-gray-500">
            {rawAccounts.length} accounts for this entity
          </p>
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

      {/* Empty State */}
      {accounts.length === 0 ? (
        <div className="text-center py-16 bg-white border rounded-lg">
          <FolderOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Accounts Yet</h3>
          <p className="text-sm text-gray-500 mb-4">Initialize from a template or add accounts manually.</p>
          <Button className="bg-[#047857] hover:bg-[#065f46]">
            <Plus className="w-4 h-4 mr-2" />Add First Account
          </Button>
        </div>
      ) : (
        <>
          {/* Accounts List */}
          <div className="bg-white border rounded-lg overflow-hidden">
            {typeOrder.map(type => {
              const typeAccounts = groupedAccounts[type];
              if (!typeAccounts || typeAccounts.length === 0) return null;

              return (
                <div key={type}>
                  {/* Type Header */}
                  <div className="px-4 py-3 bg-gray-100 border-b border-t first:border-t-0">
                    <h3 className={cn("font-semibold", getTypeColor(type))}>
                      {typeLabels[type] || type}
                    </h3>
                  </div>

                  {/* Accounts */}
                  {typeAccounts.map(account => {
                    const isExpanded = expandedAccounts.includes(account.number);
                    const hasSubAccounts = account.subAccounts && account.subAccounts.length > 0;

                    return (
                      <div key={account.number || account.id}>
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
                            {account.description && (
                              <p className="text-xs text-gray-500 mt-0.5 ml-6">{account.description}</p>
                            )}
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
                                key={subAccount.number || subAccount.id}
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
                                  {subAccount.description && (
                                    <p className="text-xs text-gray-500 mt-0.5 ml-6">{subAccount.description}</p>
                                  )}
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
        </>
      )}
    </div>
  );
};

export default EntityChartOfAccountsPage;
