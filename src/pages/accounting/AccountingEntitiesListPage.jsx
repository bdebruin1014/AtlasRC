import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Search, Filter, Download, MoreVertical, LayoutGrid, List,
  Building2, GitBranch, DollarSign, TrendingUp, ChevronRight,
  Wallet, Receipt, CheckCircle, AlertCircle, ChevronDown, Users, Percent, ExternalLink,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import entityService from '@/services/entityService';

// Fallback demo data used when Supabase is unavailable
const FALLBACK_ENTITIES = [
  {
    id: 'ent-001',
    name: 'VanRock Holdings LLC',
    type: 'holding',
    parent_entity_id: null,
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
    parent_entity_id: null,
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
    parent_entity_id: 'ent-001',
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
    parent_entity_id: 'ent-001',
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
    parent_entity_id: 'ent-001',
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
    parent_entity_id: 'ent-001',
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

const FALLBACK_HIERARCHY = [
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

const INITIAL_FORM_STATE = {
  name: '',
  type: '',
  state: '',
  ein: '',
};

const AccountingEntitiesListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid, list, hierarchy
  const [typeFilter, setTypeFilter] = useState('all');
  const [expandedNodes, setExpandedNodes] = useState(['ent-olive', 'ent-vanrock']);

  // New Entity modal state
  const [isEntityModalOpen, setIsEntityModalOpen] = useState(false);
  const [entityForm, setEntityForm] = useState(INITIAL_FORM_STATE);

  // ---------------------------------------------------------------------------
  // Data fetching via entityService with fallback to demo data
  // ---------------------------------------------------------------------------
  const { data: entities = FALLBACK_ENTITIES, isLoading } = useQuery({
    queryKey: ['accounting-entities'],
    queryFn: async () => {
      try {
        const data = await entityService.getAll();
        return data && data.length > 0 ? data : FALLBACK_ENTITIES;
      } catch (e) {
        console.warn('Using fallback entity data:', e.message);
        return FALLBACK_ENTITIES;
      }
    },
    retry: false,
  });

  const { data: ownershipTree = FALLBACK_HIERARCHY } = useQuery({
    queryKey: ['accounting-entities', 'hierarchy'],
    queryFn: async () => {
      try {
        const data = await entityService.getHierarchy();
        return data && data.length > 0 ? data : FALLBACK_HIERARCHY;
      } catch (e) {
        console.warn('Using fallback hierarchy data:', e.message);
        return FALLBACK_HIERARCHY;
      }
    },
    retry: false,
  });

  // ---------------------------------------------------------------------------
  // Create entity mutation
  // ---------------------------------------------------------------------------
  const createMutation = useMutation({
    mutationFn: (formData) => entityService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting-entities'] });
      setIsEntityModalOpen(false);
      setEntityForm(INITIAL_FORM_STATE);
      toast({
        title: 'Entity created',
        description: 'The new entity has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error creating entity',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleOpenNewEntityModal = () => {
    setEntityForm(INITIAL_FORM_STATE);
    setIsEntityModalOpen(true);
  };

  const handleCreateEntity = (e) => {
    e.preventDefault();
    if (!entityForm.name.trim()) {
      toast({ title: 'Validation error', description: 'Entity name is required.', variant: 'destructive' });
      return;
    }
    if (!entityForm.type) {
      toast({ title: 'Validation error', description: 'Entity type is required.', variant: 'destructive' });
      return;
    }
    createMutation.mutate({
      name: entityForm.name.trim(),
      type: entityForm.type,
      state: entityForm.state.trim() || null,
      ein: entityForm.ein.trim() || null,
      status: 'active',
    });
  };

  const handleImportEntities = () => {
    toast({
      title: 'Coming soon',
      description: 'Import functionality coming soon.',
    });
  };

  // ---------------------------------------------------------------------------
  // Derived / helpers
  // ---------------------------------------------------------------------------
  const stats = {
    totalEntities: entities.length,
    totalCash: entities.reduce((s, e) => s + (e.cashBalance || e.cash_balance || 0), 0),
    totalRevenue: entities.reduce((s, e) => s + (e.ytdRevenue || e.ytd_revenue || 0), 0),
    pendingReconciliation: entities.filter(e => (e.openTransactions || e.open_transactions || 0) > 10).length,
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
            onClick={() => navigate(`/accounting/entities/${node.id}`)}
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
            <span className="font-medium">{formatCurrency(node.cashBalance || node.cash_balance || 0)}</span>
          </div>

          {/* YTD P&L */}
          <div className="w-28 text-right">
            <span className={cn("font-medium",
              ((node.ytdRevenue || node.ytd_revenue || 0) - (node.ytdExpenses || node.ytd_expenses || 0)) >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {formatCurrency((node.ytdRevenue || node.ytd_revenue || 0) - (node.ytdExpenses || node.ytd_expenses || 0))}
            </span>
          </div>

          {/* Actions */}
          <div className="w-20 flex justify-end pr-4">
            <button
              className="p-1 hover:bg-gray-200 rounded"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/accounting/entities/${node.id}`);
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
          <Button variant="outline" onClick={handleImportEntities}>
            <Download className="w-4 h-4 mr-2" />Import Entities
          </Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleOpenNewEntityModal}>
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
            onClick={() => setViewMode('grid')}
            className={cn("px-3 py-2 text-sm flex items-center gap-1", viewMode === 'grid' ? "bg-[#047857] text-white" : "text-gray-500 hover:bg-gray-100")}
          >
            <LayoutGrid className="w-4 h-4" />Grid
          </button>
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

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400 mr-2" />
          <span className="text-gray-500">Loading entities...</span>
        </div>
      )}

      {/* Grid View */}
      {!isLoading && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntities.map(entity => {
            const typeConfig = getTypeConfig(entity.type);
            const openTx = entity.openTransactions || entity.open_transactions || 0;
            const needsAttention = openTx > 10;
            return (
              <div
                key={entity.id}
                onClick={() => navigate(`/accounting/entities/${entity.id}`)}
                className={cn(
                  "bg-white border rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg hover:border-[#047857]",
                  needsAttention && "border-l-4 border-l-amber-500"
                )}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", typeConfig.bg)}>
                    <Building2 className={cn("w-6 h-6", typeConfig.text)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{entity.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn("px-2 py-0.5 rounded text-xs font-medium", typeConfig.bg, typeConfig.text)}>
                        {typeConfig.label}
                      </span>
                      <span className="text-xs text-gray-500">{entity.state}</span>
                    </div>
                  </div>
                  {needsAttention && (
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-gray-500">Cash Balance</p>
                    <p className="font-semibold text-green-600">{formatCurrency(entity.cashBalance || entity.cash_balance || 0)}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-gray-500">YTD Revenue</p>
                    <p className="font-semibold">{formatCurrency(entity.ytdRevenue || entity.ytd_revenue || 0)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-xs",
                      entity.status === 'active' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    )}>
                      {entity.status}
                    </span>
                    {openTx > 0 && (
                      <span className="text-xs text-gray-500">{openTx} open items</span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Hierarchy View */}
      {!isLoading && viewMode === 'hierarchy' && (
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
      {!isLoading && viewMode === 'list' && (
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
                const openTx = entity.openTransactions || entity.open_transactions || 0;
                return (
                  <tr
                    key={entity.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/accounting/entities/${entity.id}`)}
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
                      {entity.ownedBy || entity.owned_by || '-'}
                      <span className="text-gray-400 ml-1">({entity.ownership || 0}%)</span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(entity.cashBalance || entity.cash_balance || 0)}</td>
                    <td className="px-4 py-3 text-right text-green-600">{formatCurrency(entity.ytdRevenue || entity.ytd_revenue || 0)}</td>
                    <td className="px-4 py-3 text-right text-red-600">{formatCurrency(entity.ytdExpenses || entity.ytd_expenses || 0)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{entity.lastReconciled || entity.last_reconciled || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      {openTx > 10 ? (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                          {openTx}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">{openTx}</span>
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
      {!isLoading && filteredEntities.length === 0 && (viewMode === 'list' || viewMode === 'grid') && (
        <div className="text-center py-12 bg-white border rounded-lg">
          <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-1">No entities found</h3>
          <p className="text-sm text-gray-500 mb-4">
            {searchQuery || typeFilter !== 'all'
              ? "Try adjusting your search or filters"
              : "Add your first entity to get started with accounting"}
          </p>
          <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleOpenNewEntityModal}>
            <Plus className="w-4 h-4 mr-2" />New Entity
          </Button>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* New Entity Dialog                                                    */}
      {/* ------------------------------------------------------------------ */}
      <Dialog open={isEntityModalOpen} onOpenChange={setIsEntityModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Create New Entity</DialogTitle>
            <DialogDescription>
              Add a new legal entity to your accounting structure.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateEntity} className="space-y-4 pt-2">
            {/* Entity Name */}
            <div className="space-y-2">
              <Label htmlFor="entity-name">Entity Name</Label>
              <Input
                id="entity-name"
                placeholder="e.g. Acme Holdings LLC"
                value={entityForm.name}
                onChange={(e) => setEntityForm(prev => ({ ...prev, name: e.target.value }))}
                autoFocus
              />
            </div>

            {/* Entity Type */}
            <div className="space-y-2">
              <Label htmlFor="entity-type">Entity Type</Label>
              <Select
                value={entityForm.type}
                onValueChange={(value) => setEntityForm(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger id="entity-type">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="holding">Holding Company</SelectItem>
                  <SelectItem value="project">Project SPV</SelectItem>
                  <SelectItem value="operating">Operating</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* State */}
            <div className="space-y-2">
              <Label htmlFor="entity-state">State of Formation</Label>
              <Input
                id="entity-state"
                placeholder="e.g. SC, DE, FL"
                value={entityForm.state}
                onChange={(e) => setEntityForm(prev => ({ ...prev, state: e.target.value }))}
                maxLength={2}
              />
            </div>

            {/* EIN */}
            <div className="space-y-2">
              <Label htmlFor="entity-ein">EIN (Tax ID)</Label>
              <Input
                id="entity-ein"
                placeholder="e.g. 12-3456789"
                value={entityForm.ein}
                onChange={(e) => setEntityForm(prev => ({ ...prev, ein: e.target.value }))}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEntityModalOpen(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#047857] hover:bg-[#065f46]"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Entity
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountingEntitiesListPage;
