import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Building2, Users, Briefcase, ChevronDown, ChevronRight, Eye, Settings, DollarSign, TrendingUp, GitBranch, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const EntityHierarchyPage = ({ entityHierarchy, flatEntities }) => {
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'org'

  const entityDetails = {
    'olive-brynn': {
      legalName: 'Olive Brynn LLC',
      ein: '84-1234567',
      stateOfFormation: 'Delaware',
      dateFormed: '2018-03-15',
      fiscalYearEnd: 'December 31',
      address: '123 Main Street, Suite 500, Denver, CO 80202',
      members: [{ name: 'Bryan VanRock', ownership: 100, role: 'Managing Member' }],
      cash: 2500000,
      totalAssets: 15000000,
      totalLiabilities: 3500000,
      netIncome: 747000,
    },
    'vanrock': {
      legalName: 'VanRock Holdings LLC',
      ein: '84-2345678',
      stateOfFormation: 'Colorado',
      dateFormed: '2019-06-01',
      fiscalYearEnd: 'December 31',
      address: '123 Main Street, Suite 500, Denver, CO 80202',
      members: [{ name: 'Olive Brynn LLC', ownership: 50, role: 'Member' }, { name: 'Outside Investor', ownership: 50, role: 'Member' }],
      cash: 450000,
      totalAssets: 28000000,
      totalLiabilities: 12000000,
      netIncome: 240000,
    },
    'watson': {
      legalName: 'Watson House LLC',
      ein: '84-3456789',
      stateOfFormation: 'Colorado',
      dateFormed: '2023-01-15',
      fiscalYearEnd: 'December 31',
      address: '456 Watson Road, Aurora, CO 80013',
      members: [{ name: 'VanRock Holdings LLC', ownership: 100, role: 'Sole Member' }],
      cash: 1850000,
      totalAssets: 12500000,
      totalLiabilities: 8500000,
      netIncome: 1650000,
    },
    'oslo': {
      legalName: 'Oslo Townhomes LLC',
      ein: '84-4567890',
      stateOfFormation: 'Colorado',
      dateFormed: '2023-06-01',
      fiscalYearEnd: 'December 31',
      address: '789 Oslo Way, Lakewood, CO 80215',
      members: [{ name: 'VanRock Holdings LLC', ownership: 100, role: 'Sole Member' }],
      cash: 920000,
      totalAssets: 8500000,
      totalLiabilities: 5200000,
      netIncome: 650000,
    },
    'sunset': {
      legalName: 'Sunset Apartments LLC',
      ein: '84-5678901',
      stateOfFormation: 'Colorado',
      dateFormed: '2020-09-15',
      fiscalYearEnd: 'December 31',
      address: '321 Sunset Blvd, Denver, CO 80205',
      members: [{ name: 'VanRock Holdings LLC', ownership: 100, role: 'Sole Member' }],
      cash: 425000,
      totalAssets: 6800000,
      totalLiabilities: 2800000,
      netIncome: 921000,
    },
    'manageco': {
      legalName: 'VanRock Management Co LLC',
      ein: '84-6789012',
      stateOfFormation: 'Colorado',
      dateFormed: '2019-08-01',
      fiscalYearEnd: 'December 31',
      address: '123 Main Street, Suite 500, Denver, CO 80202',
      members: [{ name: 'VanRock Holdings LLC', ownership: 100, role: 'Sole Member' }],
      cash: 185000,
      totalAssets: 520000,
      totalLiabilities: 95000,
      netIncome: 135000,
    },
    'fund1': {
      legalName: 'VanRock Fund I LP',
      ein: '84-7890123',
      stateOfFormation: 'Delaware',
      dateFormed: '2022-01-01',
      fiscalYearEnd: 'December 31',
      address: '123 Main Street, Suite 500, Denver, CO 80202',
      members: [{ name: 'VanRock Holdings LLC', ownership: 25, role: 'GP' }, { name: 'Limited Partners', ownership: 75, role: 'LP' }],
      cash: 1200000,
      totalAssets: 8500000,
      totalLiabilities: 2100000,
      netIncome: 1400000,
    },
  };

  const getEntityIcon = (type) => {
    switch (type) {
      case 'Family Office': return <Building2 className="w-5 h-5" />;
      case 'Holding Company': return <Briefcase className="w-5 h-5" />;
      case 'Project Entity': return <GitBranch className="w-5 h-5" />;
      case 'Asset Entity': return <Building2 className="w-5 h-5" />;
      case 'Operating Business': return <Users className="w-5 h-5" />;
      case 'Fund': return <TrendingUp className="w-5 h-5" />;
      default: return <Building2 className="w-5 h-5" />;
    }
  };

  const renderOrgChart = (node, depth = 0, isLast = true, parentLines = []) => {
    const hasChildren = node.children && node.children.length > 0;
    const details = entityDetails[node.id];

    return (
      <div key={node.id} className="relative">
        {/* Connector lines */}
        {depth > 0 && (
          <div className="absolute left-0 top-0 flex" style={{ width: depth * 48 }}>
            {parentLines.map((hasLine, idx) => (
              <div key={idx} className="w-12 h-full relative">
                {hasLine && <div className="absolute left-6 top-0 h-full w-px bg-gray-300" />}
              </div>
            ))}
            <div className="w-12 relative">
              <div className={cn("absolute left-6 top-0 w-px bg-gray-300", isLast ? "h-8" : "h-full")} />
              <div className="absolute left-6 top-8 w-6 h-px bg-gray-300" />
            </div>
          </div>
        )}

        {/* Entity Card */}
        <div
          className="flex items-start gap-3 ml-12 mb-2"
          style={{ marginLeft: depth * 48 + 12 }}
        >
          <div
            onClick={() => setSelectedEntity(node.id)}
            className={cn(
              "bg-white border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md min-w-[280px]",
              selectedEntity === node.id && "ring-2 ring-[#047857] border-[#047857]"
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: node.color + '20', color: node.color }}>
                  {getEntityIcon(node.type)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{node.name}</p>
                  <p className="text-xs text-gray-500">{node.type}</p>
                </div>
              </div>
              {node.ownership < 100 && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">{node.ownership}%</span>
              )}
            </div>
            {details && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Cash:</span>
                  <span className="font-medium ml-1">${(details.cash / 1000).toFixed(0)}K</span>
                </div>
                <div>
                  <span className="text-gray-500">Net Income:</span>
                  <span className={cn("font-medium ml-1", details.netIncome >= 0 ? "text-green-600" : "text-red-600")}>
                    ${(details.netIncome / 1000).toFixed(0)}K
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Children */}
        {hasChildren && (
          <div>
            {node.children.map((child, idx) => renderOrgChart(
              child,
              depth + 1,
              idx === node.children.length - 1,
              [...parentLines, !isLast]
            ))}
          </div>
        )}
      </div>
    );
  };

  function RenderTreeView({ node, depth = 0 }) {
    const hasChildren = node.children && node.children.length > 0;
    const details = entityDetails[node.id];
    const [expanded, setExpanded] = useState(true);

    return (
      <div key={node.id}>
        <div
          className={cn(
            "flex items-center justify-between py-3 px-4 border-b hover:bg-gray-50 cursor-pointer",
            selectedEntity === node.id && "bg-green-50"
          )}
          style={{ paddingLeft: depth * 24 + 16 }}
        >
          <div className="flex items-center gap-3" onClick={() => setSelectedEntity(node.id)}>
            {hasChildren ? (
              <button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }} className="p-0.5">
                {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : <span className="w-5" />}
            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: node.color + '20', color: node.color }}>
              {getEntityIcon(node.type)}
            </div>
            <div>
              <p className="font-medium text-sm">{node.name}</p>
              <p className="text-xs text-gray-500">{node.type}</p>
            </div>
            {node.ownership < 100 && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">{node.ownership}%</span>
            )}
            {node.consolidationMethod === 'equity' && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Equity Method</span>
            )}
          </div>
          {details && (
            <div className="flex items-center gap-6 text-sm">
              <div className="text-right">
                <p className="text-xs text-gray-500">Total Assets</p>
                <p className="font-medium">${(details.totalAssets / 1000000).toFixed(1)}M</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Net Income</p>
                <p className={cn("font-medium", details.netIncome >= 0 ? "text-green-600" : "text-red-600")}>
                  ${(details.netIncome / 1000).toFixed(0)}K
                </p>
              </div>
            </div>
          )}
        </div>
        {hasChildren && expanded && node.children.map(child => (
          <RenderTreeView key={child.id} node={child} depth={depth + 1} />
        ))}
      </div>
    );
  }

  const selectedDetails = selectedEntity ? entityDetails[selectedEntity] : null;
  const selectedNode = flatEntities?.find(e => e.id === selectedEntity);

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Entity Hierarchy</h2>
            <div className="flex gap-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button onClick={() => setViewMode('tree')} className={cn("px-3 py-1 text-sm rounded-md", viewMode === 'tree' ? "bg-white shadow" : "")}>List View</button>
                <button onClick={() => setViewMode('org')} className={cn("px-3 py-1 text-sm rounded-md", viewMode === 'org' ? "bg-white shadow" : "")}>Org Chart</button>
              </div>
              <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-1" />Add Entity
              </Button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs">
            <span className="text-gray-500">Entity Types:</span>
            <div className="flex items-center gap-1"><Building2 className="w-3 h-3 text-[#047857]" />Family Office</div>
            <div className="flex items-center gap-1"><Briefcase className="w-3 h-3 text-blue-500" />Holding Co</div>
            <div className="flex items-center gap-1"><GitBranch className="w-3 h-3 text-purple-500" />Project</div>
            <div className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-amber-500" />Fund</div>
            <span className="ml-4 text-gray-400">|</span>
            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Partial Ownership</span>
            <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Equity Method</span>
          </div>
        </div>

        {/* Hierarchy View */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          {viewMode === 'org' ? (
            <div className="min-w-max">
              {entityHierarchy && renderOrgChart(entityHierarchy)}
            </div>
          ) : (
            <div className="bg-white border rounded-lg overflow-hidden">
              {entityHierarchy && <RenderTreeView node={entityHierarchy} />}
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedEntity && selectedDetails && (
        <div className="w-96 bg-white border-l overflow-y-auto">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: selectedNode?.color + '20', color: selectedNode?.color }}>
                  {getEntityIcon(selectedNode?.type)}
                </div>
                <div>
                  <p className="font-semibold">{selectedNode?.name}</p>
                  <p className="text-xs text-gray-500">{selectedNode?.type}</p>
                </div>
              </div>
              <button onClick={() => setSelectedEntity(null)} className="p-1 hover:bg-gray-200 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-6">
            {/* Legal Info */}
            <div>
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2"><Building2 className="w-4 h-4" />Legal Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Legal Name</span><span>{selectedDetails.legalName}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">EIN</span><span className="font-mono">{selectedDetails.ein}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">State</span><span>{selectedDetails.stateOfFormation}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Formed</span><span>{selectedDetails.dateFormed}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">FYE</span><span>{selectedDetails.fiscalYearEnd}</span></div>
              </div>
            </div>

            {/* Ownership */}
            <div>
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2"><Users className="w-4 h-4" />Ownership</h4>
              <div className="space-y-2">
                {selectedDetails.members.map((member, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                    <span className="text-sm font-semibold">{member.ownership}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financials */}
            <div>
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4" />Financial Summary</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Cash</p>
                  <p className="text-lg font-semibold text-blue-700">${(selectedDetails.cash / 1000).toFixed(0)}K</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Net Income</p>
                  <p className={cn("text-lg font-semibold", selectedDetails.netIncome >= 0 ? "text-green-700" : "text-red-700")}>
                    ${(selectedDetails.netIncome / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Total Assets</p>
                  <p className="text-lg font-semibold">${(selectedDetails.totalAssets / 1000000).toFixed(1)}M</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Total Liabilities</p>
                  <p className="text-lg font-semibold text-red-700">${(selectedDetails.totalLiabilities / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t space-y-2">
              <Button variant="outline" className="w-full justify-start"><Eye className="w-4 h-4 mr-2" />View Full Accounting</Button>
              <Button variant="outline" className="w-full justify-start"><Link2 className="w-4 h-4 mr-2" />Intercompany Transactions</Button>
              <Button variant="outline" className="w-full justify-start"><Settings className="w-4 h-4 mr-2" />Entity Settings</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Entity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Add Entity</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Entity Name *</label>
                <Input placeholder="e.g., New Project LLC" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Legal Name *</label>
                <Input placeholder="Full legal name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Entity Type *</label>
                  <select className="w-full border rounded-md px-3 py-2">
                    <option>Project Entity</option>
                    <option>Asset Entity</option>
                    <option>Operating Business</option>
                    <option>Holding Company</option>
                    <option>Fund</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Parent Entity *</label>
                  <select className="w-full border rounded-md px-3 py-2">
                    {flatEntities?.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Ownership %</label>
                  <Input type="number" placeholder="100" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">EIN</label>
                  <Input placeholder="XX-XXXXXXX" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">State of Formation</label>
                  <select className="w-full border rounded-md px-3 py-2">
                    <option>Colorado</option>
                    <option>Delaware</option>
                    <option>Wyoming</option>
                    <option>Nevada</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Date Formed</label>
                  <Input type="date" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]">Add Entity</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntityHierarchyPage;
