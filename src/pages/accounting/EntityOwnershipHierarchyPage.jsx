import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, ZoomIn, ZoomOut, Maximize2, Download,
  Building2, GitBranch, ChevronRight, ChevronDown, Users,
  DollarSign, Percent, ExternalLink, Edit2, MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const EntityOwnershipHierarchyPage = () => {
  const navigate = useNavigate();
  const [expandedNodes, setExpandedNodes] = useState(['ent-olive', 'ent-vanrock']);
  const [viewMode, setViewMode] = useState('tree'); // tree or list
  const [searchQuery, setSearchQuery] = useState('');

  // Ownership hierarchy data
  const ownershipTree = [
    {
      id: 'ent-olive',
      name: 'Olive Brynn LLC',
      type: 'holding',
      ein: '**-***7832',
      state: 'SC',
      ownership: 100,
      owners: [{ name: 'Bryan de Bruin', type: 'individual', percentage: 100 }],
      children: [
        {
          id: 'ent-vanrock',
          name: 'VanRock Holdings LLC',
          type: 'holding',
          ein: '**-***4521',
          state: 'SC',
          ownership: 50, // Olive Brynn owns 50% of VanRock
          owners: [
            { name: 'Olive Brynn LLC', type: 'entity', percentage: 50 },
            { name: 'Other Partner', type: 'individual', percentage: 50 },
          ],
          children: [
            {
              id: 'ent-highland',
              name: 'Highland Park Development LLC',
              type: 'project',
              ein: '**-***9012',
              state: 'SC',
              ownership: 100,
              owners: [{ name: 'VanRock Holdings LLC', type: 'entity', percentage: 100 }],
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
              owners: [{ name: 'VanRock Holdings LLC', type: 'entity', percentage: 100 }],
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
              owners: [
                { name: 'VanRock Holdings LLC', type: 'entity', percentage: 85 },
                { name: 'LP Investors', type: 'investors', percentage: 15 },
              ],
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
              owners: [{ name: 'VanRock Holdings LLC', type: 'entity', percentage: 100 }],
              children: [],
            },
          ],
        },
      ],
    },
    {
      id: 'ent-external',
      name: 'External Partner Holdings',
      type: 'holding',
      ein: '**-***1111',
      state: 'NC',
      ownership: 100,
      owners: [{ name: 'External Partner', type: 'individual', percentage: 100 }],
      children: [
        {
          id: 'ent-jv1',
          name: 'Downtown JV LLC',
          type: 'project',
          ein: '**-***2222',
          state: 'SC',
          ownership: 50,
          owners: [
            { name: 'External Partner Holdings', type: 'entity', percentage: 50 },
            { name: 'VanRock Holdings LLC', type: 'entity', percentage: 50 },
          ],
          children: [],
        },
      ],
    },
  ];

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => 
      prev.includes(nodeId) 
        ? prev.filter(id => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  const getTypeConfig = (type) => ({
    holding: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', label: 'Holding' },
    project: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', label: 'Project SPV' },
    operating: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', label: 'Operating' },
    investment: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', label: 'Investment' },
  }[type] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', label: type });

  const renderTreeNode = (node, level = 0, isLast = false, parentLines = []) => {
    const isExpanded = expandedNodes.includes(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const typeConfig = getTypeConfig(node.type);

    return (
      <div key={node.id}>
        <div 
          className={cn(
            "flex items-start py-2 hover:bg-gray-50 cursor-pointer",
            level > 0 && "ml-8"
          )}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          {/* Tree lines and expand icon */}
          <div className="flex items-center w-8 flex-shrink-0">
            {level > 0 && (
              <div className="w-4 h-full flex items-center justify-center">
                <div className={cn("w-px h-full bg-gray-300", isLast && "h-1/2 self-start")} />
              </div>
            )}
            {hasChildren ? (
              <button className="p-0.5 hover:bg-gray-200 rounded">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>
            ) : (
              <div className="w-5" />
            )}
          </div>

          {/* Node content */}
          <div 
            className={cn(
              "flex-1 flex items-center gap-4 p-3 rounded-lg border-2 transition-colors",
              typeConfig.border,
              typeConfig.bg
            )}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/accounting/${node.id}`);
            }}
          >
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <Building2 className={cn("w-5 h-5", typeConfig.text)} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{node.name}</p>
                <span className={cn("px-2 py-0.5 rounded text-xs font-medium", typeConfig.bg, typeConfig.text)}>
                  {typeConfig.label}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                <span>EIN: {node.ein}</span>
                <span>•</span>
                <span>{node.state}</span>
                {node.projectId && (
                  <>
                    <span>•</span>
                    <span className="text-blue-600">{node.projectId}</span>
                  </>
                )}
              </div>
            </div>

            {/* Ownership info */}
            <div className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Percent className="w-4 h-4 text-gray-400" />
                <span className="font-semibold">{node.ownership}%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {node.owners.length > 1 
                  ? `${node.owners.length} owners` 
                  : node.owners[0]?.name
                }
              </p>
            </div>

            <button 
              className="p-1 hover:bg-white/50 rounded"
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
          <div className="relative">
            {level > 0 && (
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-300" />
            )}
            {node.children.map((child, idx) => 
              renderTreeNode(child, level + 1, idx === node.children.length - 1, [...parentLines, !isLast])
            )}
          </div>
        )}
      </div>
    );
  };

  // Flatten for list view
  const flattenTree = (nodes, level = 0) => {
    let result = [];
    nodes.forEach(node => {
      result.push({ ...node, level });
      if (node.children) {
        result = [...result, ...flattenTree(node.children, level + 1)];
      }
    });
    return result;
  };

  const flatList = flattenTree(ownershipTree);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Entity Ownership Hierarchy</h1>
          <p className="text-sm text-gray-500">View and manage entity ownership structure</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]">
            <Plus className="w-4 h-4 mr-2" />Add Entity
          </Button>
        </div>
      </div>

      {/* Controls */}
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
        <div className="flex border rounded-md">
          <button
            onClick={() => setViewMode('tree')}
            className={cn("px-3 py-2 text-sm flex items-center gap-1", 
              viewMode === 'tree' ? "bg-[#047857] text-white" : "text-gray-500 hover:bg-gray-100"
            )}
          >
            <GitBranch className="w-4 h-4" />Tree
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn("px-3 py-2 text-sm flex items-center gap-1", 
              viewMode === 'list' ? "bg-[#047857] text-white" : "text-gray-500 hover:bg-gray-100"
            )}
          >
            <Building2 className="w-4 h-4" />List
          </button>
        </div>
        <Button variant="outline" onClick={() => setExpandedNodes(ownershipTree.map(n => n.id))}>
          Expand All
        </Button>
        <Button variant="outline" onClick={() => setExpandedNodes([])}>
          Collapse All
        </Button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-4 p-3 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-600">Entity Types:</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-400" />
          <span className="text-sm text-gray-600">Holding Company</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-400" />
          <span className="text-sm text-gray-600">Project SPV</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-400" />
          <span className="text-sm text-gray-600">Operating</span>
        </div>
      </div>

      {/* Tree View */}
      {viewMode === 'tree' && (
        <div className="bg-white border rounded-lg p-4">
          {ownershipTree.map((node, idx) => renderTreeNode(node, 0, idx === ownershipTree.length - 1))}
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Parent Entity</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Ownership %</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Owners</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {flatList.map(entity => {
                const typeConfig = getTypeConfig(entity.type);
                return (
                  <tr 
                    key={entity.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/accounting/${entity.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div style={{ marginLeft: entity.level * 24 }} className="flex items-center gap-2">
                          {entity.level > 0 && (
                            <div className="w-4 h-px bg-gray-300" />
                          )}
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", typeConfig.bg)}>
                            <Building2 className={cn("w-4 h-4", typeConfig.text)} />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium">{entity.name}</p>
                          <p className="text-xs text-gray-500">{entity.ein} • {entity.state}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-1 rounded text-xs font-medium", typeConfig.bg, typeConfig.text)}>
                        {typeConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {entity.owners.find(o => o.type === 'entity')?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{entity.ownership}%</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{entity.owners.length}</span>
                      </div>
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

      {/* Summary Card */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Entities</p>
          <p className="text-2xl font-bold">{flatList.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Holding Companies</p>
          <p className="text-2xl font-bold">{flatList.filter(e => e.type === 'holding').length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Project SPVs</p>
          <p className="text-2xl font-bold">{flatList.filter(e => e.type === 'project').length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Operating Entities</p>
          <p className="text-2xl font-bold">{flatList.filter(e => e.type === 'operating').length}</p>
        </div>
      </div>
    </div>
  );
};

export default EntityOwnershipHierarchyPage;
