import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Filter, Download, MoreVertical, LayoutGrid, List,
  Building2, GitBranch, DollarSign, TrendingUp, ChevronRight,
  Wallet, Receipt, CheckCircle, AlertCircle, ChevronDown, Users, Percent, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const AccountingEntitiesListPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // list, hierarchy
  const [typeFilter, setTypeFilter] = useState('all');
  const [expandedNodes, setExpandedNodes] = useState(['ent-olive', 'ent-vanrock']);

  const entities = [
    {
      id: 'ent-001',
      name: 'VanRock Holdings LLC',
      type: 'holding',
      parentId: null,
      ein: '**-***4521',
      state: 'SC',
      status: 'active',
      bankAccounts: 3,
      ytdRevenue: 1250000,
      ytdExpenses: 890000,
      cashBalance: 485000,
      lastReconciled: '2024-12-15',
      openTransactions: 12,
      ownership: 50,
      ownedBy: 'Olive Brynn LLC',
    },
    {
      id: 'ent-002',
      name: 'Olive Brynn LLC',
      type: 'holding',
      parentId: null,
      ein: '**-***7832',
      state: 'SC',
      status: 'active',
      bankAccounts: 2,
      ytdRevenue: 450000,
      ytdExpenses: 125000,
      cashBalance: 892000,
      lastReconciled: '2024-12-20',
      openTransactions: 5,
      ownership: 100,
      ownedBy: 'Bryan de Bruin',
    },
    {
      id: 'ent-003',
      name: 'Highland Park Development LLC',
      type: 'project',
      parentId: 'ent-001',
      ein: '**-***9012',
      state: 'SC',
      status: 'active',
      bankAccounts: 2,
      ytdRevenue: 0,
      ytdExpenses: 1850000,
      cashBalance: 125000,
      lastReconciled: '2024-12-18',
      openTransactions: 24,
      projectId: 'PRJ-001',
      ownership: 100,
      ownedBy: 'VanRock Holdings LLC',
    },
    {
      id: 'ent-004',
      name: 'Riverside Commons LLC',
      type: 'project',
      parentId: 'ent-001',
      ein: '**-***3456',
      state: 'SC',
      status: 'active',
      bankAccounts: 2,
      ytdRevenue: 3200000,
      ytdExpenses: 2100000,
      cashBalance: 340000,
      lastReconciled: '2024-12-22',
      openTransactions: 8,
      projectId: 'PRJ-002',
      ownership: 100,
      ownedBy: 'VanRock Holdings LLC',
    },
    {
      id: 'ent-005',
      name: 'Cedar Mill Phase 2 LLC',
      type: 'project',
      parentId: 'ent-001',
      ein: '**-***7890',
      state: 'SC',
      status: 'active',
      bankAccounts: 1,
      ytdRevenue: 0,
      ytdExpenses: 450000,
      cashBalance: 75000,
      lastReconciled: '2024-12-10',
      openTransactions: 15,
      projectId: 'PRJ-003',
      ownership: 85,
      ownedBy: 'VanRock Holdings LLC',
    },
    {
      id: 'ent-006',
      name: 'VanRock Property Management LLC',
      type: 'operating',
      parentId: 'ent-001',
      ein: '**-***2345',
      state: 'SC',
      status: 'active',
      bankAccounts: 2,
      ytdRevenue: 385000,
      ytdExpenses: 290000,
      cashBalance: 95000,
      lastReconciled: '2024-12-19',
      openTransactions: 3,
      ownership: 100,
      ownedBy: 'VanRock Holdings LLC',
    },
  ];

  // Build ownership hierarchy
  const ownershipTree = [
    {
      id: 'ent-olive',
      name: 'Olive Brynn LLC',
      type: 'holding',
      ein: '**-***7832',
      state: 'SC',
      ownership: 100,
      cashBalance: 892000,
      ytdRevenue: 450000,
      ytdExpenses: 125000,
      children: [
        {
          id: 'ent-vanrock',
          name: 'VanRock Holdings LLC',
          type: 'holding',
          ein: '**-***4521',
          state: 'SC',
          ownership: 50,
          cashBalance: 485000,
          ytdRevenue: 1250000,
          ytdExpenses: 890000,
          children: [
            {
              id: 'ent-highland',
              name: 'Highland Park Development LLC',
              type: 'project',
              ein: '**-***9012',
              state: 'SC',
              ownership: 100,
              cashBalance: 125000,
              ytdRevenue: 0,
              ytdExpenses: 1850000,
              projectId: 'PRJ-001',
              children: [],
            },
            {
              id: 'ent-riverside',
              name: 'Riverside Commons LLC',
              type: 'project',
              ein: '**-***3456',
              state: 'SC',
              ownership: 100,
              cashBalance: 340000,
              ytdRevenue: 3200000,
              ytdExpenses: 2100000,
              projectId: 'PRJ-002',
              children: [],
            },
            {
              id: 'ent-cedar',
              name: 'Cedar Mill Phase 2 LLC',
              type: 'project',
              ein: '**-***7890',
              state: 'SC',
              ownership: 85,
              cashBalance: 75000,
              ytdRevenue: 0,
              ytdExpenses: 450000,
              projectId: 'PRJ-003',
              children: [],
            },
            {
              id: 'ent-propman',
              name: 'VanRock Property Management LLC',
              type: 'operating',
              ein: '**-***2345',
              state: 'SC',
              ownership: 100,
              cashBalance: 95000,
              ytdRevenue: 385000,
              ytdExpenses: 290000,
              children: [],
            },
          ],
        },
      ],
    },
  ];

  const stats = {
    totalEntities: entities.length,
    totalCash: entities.reduce((s, e) => s + e.cashBalance, 0),
    totalRevenue: entities.reduce((s, e) => s + e.ytdRevenue, 0),
    pendingReconciliation: entities.filter(e => e.openTransactions > 10).length,
  };

  const formatCurrency = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toLocaleString()}`;
  };

  const getTypeConfig = (type) => ({
    holding: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', label: 'Holding Company' },
    project: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', label: 'Project SPV' },
    operating: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', label: 'Operating' },
    investment: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', label: 'Investment' },
  }[type] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', label: type });

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => 
      prev.includes(nodeId) 
        ? prev.filter(id => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  const renderTreeNode = (node, level = 0) => {
    const isExpanded = expandedNodes.includes(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const typeConfig = getTypeConfig(node.type);

    return (
      <div key={node.id}>
        <div 
          className={cn(
            "flex items-center py-2 hover:bg-gray-50 cursor-pointer border-b",
          )}
          style={{ paddingLeft: level * 32 + 16 }}
        >
          {/* Expand icon */}
          <div className="w-6 flex-shrink-0">
            {hasChildren ? (
              <button 
                className="p-0.5 hover:bg-gray-200 rounded"
                onClick={(e) => { e.stopPropagation(); toggleNode(node.id); }}
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>
            ) : (
              <div className="w-4" />
            )}
          </div>

          {/* Entity info */}
          <div 
            className="flex-1 flex items-center gap-4 py-1"
            onClick={() => navigate(`/accounting/${node.id}`)}
          >
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", typeConfig.bg)}>
              <Building2 className={cn("w-4 h-4", typeConfig.text)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{node.name}</p>
                <span className={cn("px-1.5 py-0.5 rounded text-xs font-medium", typeConfig.bg, typeConfig.text)}>
                  {typeConfig.label}
                </span>
                {node.projectId && (
                  <span className="text-xs text-blue-600">{node.projectId}</span>
                )}
              </div>
              <p className="text-xs text-gray-500">{node.ein} • {node.state}</p>
            </div>
          </div>

          {/* Ownership */}
          <div className="w-20 text-center">
            <span className="text-sm font-medium">{node.ownership}%</span>
          </div>

          {/* Cash */}
          <div className="w-28 text-right">
            <span className="font-medium">{formatCurrency(node.cashBalance)}</span>
          </div>

          {/* YTD P&L */}
          <div className="w-28 text-right">
            <span className={cn("font-medium", 
              (node.ytdRevenue - node.ytdExpenses) >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {formatCurrency(node.ytdRevenue - node.ytdExpenses)}
            </span>
          </div>

          {/* Actions */}
          <div className="w-20 flex justify-end pr-4">
            <button 
              className="p-1 hover:bg-gray-200 rounded"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/accounting/${node.id}`);
              }}
            >
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Children */}
        {isExpanded && hasChildren && (
          <div>
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredEntities = entities.filter(e => {
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;
    if (searchQuery && !e.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Accounting</h1>
          <p className="text-sm text-gray-500">Select an entity to manage its accounting</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/accounting/hierarchy')}>
            <GitBranch className="w-4 h-4 mr-2" />Ownership Hierarchy
          </Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]">
            <Plus className="w-4 h-4 mr-2" />New Entity
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalEntities}</p>
              <p className="text-sm text-gray-500">Entities</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalCash)}</p>
              <p className="text-sm text-gray-500">Total Cash</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-sm text-gray-500">YTD Revenue</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pendingReconciliation}</p>
              <p className="text-sm text-gray-500">Need Attention</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search entities..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All Types</option>
          <option value="holding">Holding Companies</option>
          <option value="project">Project SPVs</option>
          <option value="operating">Operating</option>
        </select>
        <div className="flex border rounded-md">
          <button
            onClick={() => setViewMode('list')}
            className={cn("px-3 py-2 text-sm flex items-center gap-1", viewMode === 'list' ? "bg-[#047857] text-white" : "text-gray-500 hover:bg-gray-100")}
          >
            <List className="w-4 h-4" />List
          </button>
          <button
            onClick={() => setViewMode('hierarchy')}
            className={cn("px-3 py-2 text-sm flex items-center gap-1", viewMode === 'hierarchy' ? "bg-[#047857] text-white" : "text-gray-500 hover:bg-gray-100")}
          >
            <GitBranch className="w-4 h-4" />Hierarchy
          </button>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />Export
        </Button>
      </div>

      {/* Hierarchy View */}
      {viewMode === 'hierarchy' && (
        <div className="bg-white border rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center bg-gray-50 border-b px-4 py-3">
            <div className="w-6" />
            <div className="flex-1 text-xs font-semibold text-gray-600 uppercase">Entity</div>
            <div className="w-20 text-center text-xs font-semibold text-gray-600 uppercase">Ownership</div>
            <div className="w-28 text-right text-xs font-semibold text-gray-600 uppercase">Cash</div>
            <div className="w-28 text-right text-xs font-semibold text-gray-600 uppercase">YTD P&L</div>
            <div className="w-20" />
          </div>
          {/* Tree */}
          {ownershipTree.map(node => renderTreeNode(node, 0))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Entity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Owned By</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Cash Balance</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">YTD Revenue</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">YTD Expenses</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Last Reconciled</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Open Items</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredEntities.map(entity => {
                const typeConfig = getTypeConfig(entity.type);
                return (
                  <tr 
                    key={entity.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/accounting/${entity.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", typeConfig.bg)}>
                          <Building2 className={cn("w-5 h-5", typeConfig.text)} />
                        </div>
                        <div>
                          <p className="font-medium">{entity.name}</p>
                          <p className="text-xs text-gray-500">EIN: {entity.ein} • {entity.state}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-1 rounded text-xs font-medium", typeConfig.bg, typeConfig.text)}>
                        {typeConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {entity.ownedBy}
                      <span className="text-gray-400 ml-1">({entity.ownership}%)</span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(entity.cashBalance)}</td>
                    <td className="px-4 py-3 text-right text-green-600">{formatCurrency(entity.ytdRevenue)}</td>
                    <td className="px-4 py-3 text-right text-red-600">{formatCurrency(entity.ytdExpenses)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{entity.lastReconciled}</td>
                    <td className="px-4 py-3 text-center">
                      {entity.openTransactions > 10 ? (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                          {entity.openTransactions}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">{entity.openTransactions}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredEntities.length === 0 && viewMode === 'list' && (
        <div className="text-center py-12 bg-white border rounded-lg">
          <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-1">No entities found</h3>
          <p className="text-sm text-gray-500 mb-4">Create your first entity to get started</p>
          <Button className="bg-[#047857] hover:bg-[#065f46]">
            <Plus className="w-4 h-4 mr-2" />New Entity
          </Button>
        </div>
      )}
    </div>
  );
};

export default AccountingEntitiesListPage;
