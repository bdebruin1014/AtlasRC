import React, { useState, lazy, Suspense } from 'react';
import { Building2, Plus, Search, ChevronDown, ChevronRight, DollarSign, FileText, Receipt, CreditCard, Landmark, BookOpen, PieChart, Users, Settings, TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw, Calculator, GitBranch, AlertTriangle, Layers, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Lazy load sub-pages
const TransactionsPage = lazy(() => import('./accounting/TransactionsPage'));
const BankingPage = lazy(() => import('./accounting/BankingPage'));
const JournalEntriesPage = lazy(() => import('./accounting/JournalEntriesPage'));
const FinancialReportsPage = lazy(() => import('./accounting/FinancialReportsPage'));

const AccountingPage = () => {
  const [selectedEntity, setSelectedEntity] = useState('olive-brynn');
  const [viewMode, setViewMode] = useState('consolidated');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expandedEntities, setExpandedEntities] = useState(['olive-brynn', 'vanrock']);

  const entityHierarchy = {
    id: 'olive-brynn',
    name: 'Olive Brynn LLC',
    type: 'Family Office',
    ownership: 100,
    color: '#047857',
    children: [
      {
        id: 'vanrock',
        name: 'VanRock Holdings LLC',
        type: 'Holding Company',
        ownership: 100,
        color: '#2563eb',
        children: [
          { id: 'watson', name: 'Watson House LLC', type: 'Project Entity', ownership: 100, color: '#7c3aed', children: [] },
          { id: 'oslo', name: 'Oslo Townhomes LLC', type: 'Project Entity', ownership: 100, color: '#f59e0b', children: [] },
          { id: 'sunset', name: 'Sunset Apartments LLC', type: 'Asset Entity', ownership: 100, color: '#ec4899', children: [] },
          { id: 'manageco', name: 'VanRock Management Co', type: 'Operating Business', ownership: 100, color: '#06b6d4', children: [] },
          { id: 'fund1', name: 'VanRock Fund I LP', type: 'Fund', ownership: 25, consolidationMethod: 'equity', color: '#8b5cf6', children: [] },
        ]
      },
      { id: 'personal-re', name: 'Personal Real Estate', type: 'Asset Holdings', ownership: 100, color: '#14b8a6', children: [] },
    ]
  };

  const flatEntities = [
    { id: 'olive-brynn', name: 'Olive Brynn LLC', type: 'Family Office', parent: null },
    { id: 'vanrock', name: 'VanRock Holdings LLC', type: 'Holding Company', parent: 'olive-brynn' },
    { id: 'watson', name: 'Watson House LLC', type: 'Project Entity', parent: 'vanrock' },
    { id: 'oslo', name: 'Oslo Townhomes LLC', type: 'Project Entity', parent: 'vanrock' },
    { id: 'sunset', name: 'Sunset Apartments LLC', type: 'Asset Entity', parent: 'vanrock' },
    { id: 'manageco', name: 'VanRock Management Co', type: 'Operating Business', parent: 'vanrock' },
    { id: 'fund1', name: 'VanRock Fund I LP', type: 'Fund', parent: 'vanrock' },
    { id: 'personal-re', name: 'Personal Real Estate', type: 'Asset Holdings', parent: 'olive-brynn' },
  ];

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: PieChart },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'banking', label: 'Banking', icon: Landmark },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'bills', label: 'Bills', icon: CreditCard },
    { id: 'journal', label: 'Journal Entries', icon: BookOpen },
    { id: 'reconciliation', label: 'Reconciliation', icon: RefreshCw },
    { id: 'hierarchy', label: 'Entity Hierarchy', icon: GitBranch },
    { id: 'intercompany', label: 'Intercompany', icon: Link2 },
    { id: 'consolidation', label: 'Consolidation', icon: Layers },
    { id: 'reports', label: 'Reports', icon: TrendingUp },
    { id: 'coa', label: 'Chart of Accounts', icon: Calculator },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const entityFinancials = {
    'olive-brynn': { cash: 2500000, ar: 0, ap: 0, revenue: 850000, expenses: 103000, netIncome: 747000 },
    'vanrock': { cash: 450000, ar: 125000, ap: 85000, revenue: 420000, expenses: 180000, netIncome: 240000 },
    'watson': { cash: 1850000, ar: 850000, ap: 650000, revenue: 4850000, expenses: 3200000, netIncome: 1650000 },
    'oslo': { cash: 920000, ar: 420000, ap: 380000, revenue: 2100000, expenses: 1450000, netIncome: 650000 },
    'sunset': { cash: 425000, ar: 145000, ap: 95000, revenue: 1850000, expenses: 929000, netIncome: 921000 },
    'manageco': { cash: 185000, ar: 320000, ap: 45000, revenue: 420000, expenses: 285000, netIncome: 135000 },
    'fund1': { cash: 1200000, ar: 0, ap: 125000, revenue: 1850000, expenses: 450000, netIncome: 1400000 },
    'personal-re': { cash: 120000, ar: 0, ap: 15000, revenue: 0, expenses: 25000, netIncome: -25000 },
  };

  const intercompanyTransactions = [
    { id: 1, from: 'manageco', to: 'watson', description: 'Management Fee - Dec 2024', amount: 35000, status: 'posted' },
    { id: 2, from: 'manageco', to: 'oslo', description: 'Management Fee - Dec 2024', amount: 25000, status: 'posted' },
    { id: 3, from: 'manageco', to: 'sunset', description: 'Property Management', amount: 18500, status: 'posted' },
    { id: 4, from: 'olive-brynn', to: 'watson', description: 'Mezzanine Loan Interest', amount: 40000, status: 'posted' },
    { id: 5, from: 'vanrock', to: 'watson', description: 'Capital Contribution', amount: 500000, status: 'posted' },
  ];

  const getConsolidatedFinancials = (entityId) => {
    const consolidate = (node) => {
      let result = { ...entityFinancials[node.id] };
      if (node.children && node.consolidationMethod !== 'equity') {
        node.children.forEach(child => {
          if (child.ownership >= 50 || child.consolidationMethod !== 'equity') {
            const childData = consolidate(child);
            const pct = child.ownership / 100;
            result.cash += childData.cash * pct;
            result.ar += childData.ar * pct;
            result.ap += childData.ap * pct;
            result.revenue += childData.revenue * pct;
            result.expenses += childData.expenses * pct;
            result.netIncome += childData.netIncome * pct;
          }
        });
      }
      return result;
    };
    const findNode = (node, id) => {
      if (node.id === id) return node;
      if (node.children) {
        for (const child of node.children) {
          const found = findNode(child, id);
          if (found) return found;
        }
      }
      return null;
    };
    const node = findNode(entityHierarchy, entityId);
    return node ? consolidate(node) : entityFinancials[entityId];
  };

  const currentFinancials = viewMode === 'consolidated' ? getConsolidatedFinancials(selectedEntity) : entityFinancials[selectedEntity];
  const totalEliminations = intercompanyTransactions.filter(t => t.status === 'posted').reduce((s, t) => s + t.amount, 0);

  const toggleEntity = (entityId) => {
    setExpandedEntities(prev => prev.includes(entityId) ? prev.filter(e => e !== entityId) : [...prev, entityId]);
  };

  const renderEntityTree = (node, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedEntities.includes(node.id);
    const isSelected = selectedEntity === node.id;
    return (
      <div key={node.id}>
        <div className={cn("flex items-center gap-2 py-2 px-2 rounded cursor-pointer transition-colors", isSelected ? "bg-[#047857] text-white" : "hover:bg-white/5 text-gray-300")} style={{ paddingLeft: `${depth * 16 + 8}px` }} onClick={() => setSelectedEntity(node.id)}>
          {hasChildren ? (<button onClick={(e) => { e.stopPropagation(); toggleEntity(node.id); }} className="p-0.5">{isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}</button>) : (<span className="w-4" />)}
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: node.color }}></div>
          <span className="text-xs truncate flex-1">{node.name}</span>
          {node.ownership < 100 && <span className="text-xs text-gray-500">{node.ownership}%</span>}
        </div>
        {hasChildren && isExpanded && <div>{node.children.map(child => renderEntityTree(child, depth + 1))}</div>}
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button onClick={() => setViewMode('consolidated')} className={cn("px-4 py-1.5 text-sm rounded-md transition-colors", viewMode === 'consolidated' ? "bg-white shadow text-gray-900" : "text-gray-600")}>Consolidated</button>
          <button onClick={() => setViewMode('standalone')} className={cn("px-4 py-1.5 text-sm rounded-md transition-colors", viewMode === 'standalone' ? "bg-white shadow text-gray-900" : "text-gray-600")}>Standalone</button>
        </div>
        {viewMode === 'consolidated' && (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
            Includes {flatEntities.length} entities • ${(totalEliminations / 1000).toFixed(0)}K intercompany eliminations
          </div>
        )}
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4"><div className="flex items-center justify-between"><p className="text-sm text-gray-500">Total Cash</p><Landmark className="w-5 h-5 text-blue-500" /></div><p className="text-2xl font-semibold mt-1">${(currentFinancials.cash / 1000000).toFixed(2)}M</p><p className="text-xs text-green-600 flex items-center gap-1 mt-1"><ArrowUpRight className="w-3 h-3" />+$125K this month</p></div>
        <div className="bg-white border rounded-lg p-4"><div className="flex items-center justify-between"><p className="text-sm text-gray-500">Accounts Receivable</p><ArrowDownRight className="w-5 h-5 text-green-500" /></div><p className="text-2xl font-semibold mt-1">${(currentFinancials.ar / 1000000).toFixed(2)}M</p></div>
        <div className="bg-white border rounded-lg p-4"><div className="flex items-center justify-between"><p className="text-sm text-gray-500">Accounts Payable</p><ArrowUpRight className="w-5 h-5 text-red-500" /></div><p className="text-2xl font-semibold mt-1">${(currentFinancials.ap / 1000000).toFixed(2)}M</p></div>
        <div className="bg-white border rounded-lg p-4"><div className="flex items-center justify-between"><p className="text-sm text-gray-500">Net Income (YTD)</p><TrendingUp className="w-5 h-5 text-emerald-500" /></div><p className="text-2xl font-semibold mt-1 text-[#047857]">${(currentFinancials.netIncome / 1000000).toFixed(2)}M</p></div>
      </div>
      {viewMode === 'consolidated' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2"><Layers className="w-5 h-5" />Consolidation Summary</h3>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div><p className="text-blue-600">Entities Consolidated</p><p className="text-lg font-semibold text-blue-900">7</p></div>
            <div><p className="text-blue-600">Full Consolidation</p><p className="text-lg font-semibold text-blue-900">6 entities</p></div>
            <div><p className="text-blue-600">Equity Method</p><p className="text-lg font-semibold text-blue-900">1 entity</p></div>
            <div><p className="text-blue-600">Intercompany Eliminations</p><p className="text-lg font-semibold text-blue-900">${(totalEliminations / 1000).toFixed(0)}K</p></div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white border rounded-lg">
          <div className="flex items-center justify-between p-4 border-b"><h3 className="font-semibold">Recent Transactions</h3><Button variant="link" className="text-[#047857] p-0 h-auto" onClick={() => setActiveTab('transactions')}>View All</Button></div>
          <div className="divide-y">
            {[
              { date: 'Dec 28', desc: 'Rental Income - December', amount: 145000, entity: 'Sunset Apartments' },
              { date: 'Dec 27', desc: 'Construction Draw #5', amount: 850000, entity: 'Watson House' },
              { date: 'Dec 26', desc: 'Property Tax Payment', amount: -45000, entity: 'Sunset Apartments' },
              { date: 'Dec 25', desc: 'Management Fee Income', amount: 35000, entity: 'VanRock Management' },
            ].map((tx, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium", tx.amount > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>{tx.date.split(' ')[0]}</div>
                  <div><p className="font-medium text-gray-900">{tx.desc}</p><p className="text-xs text-gray-500">{tx.entity}</p></div>
                </div>
                <p className={cn("font-medium", tx.amount > 0 ? "text-green-600" : "text-gray-900")}>{tx.amount > 0 ? '+' : ''}{tx.amount < 0 ? '-' : ''}${Math.abs(tx.amount).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border rounded-lg">
          <div className="p-4 border-b"><h3 className="font-semibold">Quick Actions</h3></div>
          <div className="p-4 space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('transactions')}><Receipt className="w-4 h-4 mr-2" />Record Transaction</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('journal')}><BookOpen className="w-4 h-4 mr-2" />Journal Entry</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('banking')}><RefreshCw className="w-4 h-4 mr-2" />Reconcile Account</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('reports')}><TrendingUp className="w-4 h-4 mr-2" />Run Reports</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('invoices')}><FileText className="w-4 h-4 mr-2" />Create Invoice</Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlaceholderTab = (title) => (
    <div className="p-6">
      <div className="bg-white border rounded-lg p-12 text-center">
        <p className="text-gray-600 capitalize font-medium mb-2">{title}</p>
        <p className="text-gray-400 text-sm">Mock data interface - Real integration coming</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'transactions': return <Suspense fallback={<div className="p-6">Loading...</div>}><TransactionsPage selectedEntity={selectedEntity} entities={entityHierarchy} flatEntities={flatEntities} /></Suspense>;
      case 'banking': return <Suspense fallback={<div className="p-6">Loading...</div>}><BankingPage selectedEntity={selectedEntity} flatEntities={flatEntities} /></Suspense>;
      case 'journal': return <Suspense fallback={<div className="p-6">Loading...</div>}><JournalEntriesPage selectedEntity={selectedEntity} flatEntities={flatEntities} /></Suspense>;
      case 'reports': return <Suspense fallback={<div className="p-6">Loading...</div>}><FinancialReportsPage selectedEntity={selectedEntity} viewMode={viewMode} flatEntities={flatEntities} /></Suspense>;
      case 'invoices': return renderPlaceholderTab('Invoice Management');
      case 'bills': return renderPlaceholderTab('Bills Management');
      case 'hierarchy': return renderPlaceholderTab('Entity Hierarchy');
      case 'intercompany': return renderPlaceholderTab('Intercompany Transactions');
      case 'consolidation': return renderPlaceholderTab('Consolidation');
      case 'coa': return renderPlaceholderTab('Chart of Accounts');
      case 'settings': return renderPlaceholderTab('Accounting Settings');
      default:
        return (
          <div className="p-6">
            <div className="bg-white border rounded-lg p-12 text-center">
              <p className="text-gray-500 capitalize">{activeTab.replace(/-/g, ' ')} - Module</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-[calc(100vh-40px)] bg-gray-50">
      <div className="w-56 bg-[#1e2a3a] flex-shrink-0 flex flex-col">
        <div className="p-3 border-b border-gray-700">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Entity Hierarchy</p>
          <div className="max-h-48 overflow-y-auto">{renderEntityTree(entityHierarchy)}</div>
        </div>
        <nav className="flex-1 p-2 overflow-y-auto">
          <p className="text-xs text-gray-500 uppercase tracking-wide px-3 py-2">Accounting</p>
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("w-full flex items-center gap-2 px-3 py-2 text-xs rounded transition-colors mb-0.5", activeTab === tab.id ? "bg-[#047857] text-white" : "text-gray-400 hover:text-white hover:bg-white/5")}>
                <IconComponent className="w-4 h-4" />{tab.label}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b px-6 py-3 flex items-center justify-between">
          <div><h1 className="text-lg font-semibold">Accounting</h1><p className="text-sm text-gray-500">{flatEntities.find(e => e.id === selectedEntity)?.name}{viewMode === 'consolidated' && ' (Consolidated)'}</p></div>
          <div className="flex items-center gap-2">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input placeholder="Search..." className="pl-9 w-64 h-9" /></div>
            <Button variant="outline"><Plus className="w-4 h-4 mr-1" />New</Button>
          </div>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default AccountingPage;
