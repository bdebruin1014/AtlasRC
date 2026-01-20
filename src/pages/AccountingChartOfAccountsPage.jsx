import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  ArrowLeft, Search, Plus, Download, Upload, 
  ChevronRight, ChevronDown, MoreHorizontal, FileText,
  PieChart, Table as TableIcon, BarChart3,
  Layers, Info, Edit2, Trash2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useToast } from '@/components/ui/use-toast';

// --- Mock Data ---
const ENTITIES = {
  1: { name: 'AtlasDev', type: 'Corporation' },
  2: { name: 'Sunset Development LLC', type: 'LLC' },
};

const INITIAL_ACCOUNTS = [
  // Assets
  { id: '1000', number: '1000', name: 'Assets', type: 'Asset', class: 'Assets', balance: 4520000, status: 'Active', level: 0, hasChildren: true, parentId: null },
  { id: '1100', number: '1100', name: 'Current Assets', type: 'Asset', class: 'Assets', balance: 1250000, status: 'Active', level: 1, hasChildren: true, parentId: '1000' },
  { id: '1110', number: '1110', name: 'Operating Cash - Chase', type: 'Bank', class: 'Assets', balance: 850000, status: 'Active', level: 2, hasChildren: false, parentId: '1100' },
  { id: '1120', number: '1120', name: 'Construction Escrow', type: 'Bank', class: 'Assets', balance: 250000, status: 'Active', level: 2, hasChildren: false, parentId: '1100' },
  { id: '1130', number: '1130', name: 'Earnest Money Deposits', type: 'Other Current Asset', class: 'Assets', balance: 50000, status: 'Active', level: 2, hasChildren: false, parentId: '1100' },
  { id: '1140', number: '1140', name: 'Accounts Receivable', type: 'Accounts Receivable', class: 'Assets', balance: 75000, status: 'Active', level: 2, hasChildren: false, parentId: '1100' },
  
  { id: '1200', number: '1200', name: 'Fixed Assets', type: 'Asset', class: 'Assets', balance: 3270000, status: 'Active', level: 1, hasChildren: true, parentId: '1000' },
  { id: '1210', number: '1210', name: 'Land - Phase 1', type: 'Fixed Asset', class: 'Assets', balance: 1500000, status: 'Active', level: 2, hasChildren: false, parentId: '1200' },
  { id: '1220', number: '1220', name: 'Land Improvements', type: 'Fixed Asset', class: 'Assets', balance: 450000, status: 'Active', level: 2, hasChildren: false, parentId: '1200' },
  { id: '1230', number: '1230', name: 'CIP - Hard Costs', type: 'Fixed Asset', class: 'Assets', balance: 1200000, status: 'Active', level: 2, hasChildren: false, parentId: '1200' },
  { id: '1240', number: '1240', name: 'CIP - Soft Costs', type: 'Fixed Asset', class: 'Assets', balance: 150000, status: 'Active', level: 2, hasChildren: false, parentId: '1200' },
  { id: '1250', number: '1250', name: 'Accumulated Depreciation', type: 'Fixed Asset', class: 'Assets', balance: -30000, status: 'Active', level: 2, hasChildren: false, parentId: '1200' },

  // Liabilities
  { id: '2000', number: '2000', name: 'Liabilities', type: 'Liability', class: 'Liabilities', balance: 2150000, status: 'Active', level: 0, hasChildren: true, parentId: null },
  { id: '2100', number: '2100', name: 'Current Liabilities', type: 'Liability', class: 'Liabilities', balance: 150000, status: 'Active', level: 1, hasChildren: true, parentId: '2000' },
  { id: '2110', number: '2110', name: 'Accounts Payable', type: 'Accounts Payable', class: 'Liabilities', balance: 85000, status: 'Active', level: 2, hasChildren: false, parentId: '2100' },
  { id: '2120', number: '2120', name: 'Retainage Payable', type: 'Other Current Liability', class: 'Liabilities', balance: 45000, status: 'Active', level: 2, hasChildren: false, parentId: '2100' },
  { id: '2130', number: '2130', name: 'Accrued Interest', type: 'Other Current Liability', class: 'Liabilities', balance: 12000, status: 'Active', level: 2, hasChildren: false, parentId: '2100' },

  { id: '2200', number: '2200', name: 'Long Term Liabilities', type: 'Liability', class: 'Liabilities', balance: 2000000, status: 'Active', level: 1, hasChildren: true, parentId: '2000' },
  { id: '2210', number: '2210', name: 'Construction Loan - Wells Fargo', type: 'Long Term Liability', class: 'Liabilities', balance: 1200000, status: 'Active', level: 2, hasChildren: false, parentId: '2200' },
  { id: '2220', number: '2220', name: 'Mezzanine Debt', type: 'Long Term Liability', class: 'Liabilities', balance: 500000, status: 'Active', level: 2, hasChildren: false, parentId: '2200' },

  // Equity
  { id: '3000', number: '3000', name: 'Equity', type: 'Equity', class: 'Equity', balance: 2370000, status: 'Active', level: 0, hasChildren: true, parentId: null },
  { id: '3100', number: '3100', name: 'GP Capital', type: 'Equity', class: 'Equity', balance: 500000, status: 'Active', level: 1, hasChildren: false, parentId: '3000' },
  { id: '3200', number: '3200', name: 'LP Capital', type: 'Equity', class: 'Equity', balance: 2000000, status: 'Active', level: 1, hasChildren: false, parentId: '3000' },
  { id: '3300', number: '3300', name: 'Distributions', type: 'Equity', class: 'Equity', balance: -250000, status: 'Active', level: 1, hasChildren: false, parentId: '3000' },

  // Revenue
  { id: '4000', number: '4000', name: 'Revenue', type: 'Income', class: 'Revenue', balance: 850000, status: 'Active', level: 0, hasChildren: true, parentId: null },
  { id: '4100', number: '4100', name: 'Lot Sales', type: 'Income', class: 'Revenue', balance: 450000, status: 'Active', level: 1, hasChildren: false, parentId: '4000' },
  { id: '4200', number: '4200', name: 'Unit Sales', type: 'Income', class: 'Revenue', balance: 380000, status: 'Active', level: 1, hasChildren: false, parentId: '4000' },

  // Expenses
  { id: '6000', number: '6000', name: 'Operating Expenses', type: 'Expense', class: 'Expenses', balance: 125000, status: 'Active', level: 0, hasChildren: true, parentId: null },
  { id: '6100', number: '6100', name: 'Marketing', type: 'Expense', class: 'Expenses', balance: 15000, status: 'Active', level: 1, hasChildren: false, parentId: '6000' },
  { id: '6200', number: '6200', name: 'Legal & Professional', type: 'Expense', class: 'Expenses', balance: 45000, status: 'Active', level: 1, hasChildren: false, parentId: '6000' },
  { id: '6300', number: '6300', name: 'Office Expenses', type: 'Expense', class: 'Expenses', balance: 12000, status: 'Active', level: 1, hasChildren: false, parentId: '6000' },
];

const formatCurrency = (val) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

const getClassColor = (cls) => {
  switch(cls) {
    case 'Assets': return 'border-l-emerald-500';
    case 'Liabilities': return 'border-l-red-500';
    case 'Equity': return 'border-l-blue-500';
    case 'Revenue': return 'border-l-green-600';
    case 'Expenses': return 'border-l-amber-500';
    default: return 'border-l-gray-300';
  }
};

const ChartOfAccountsPage = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const entity = ENTITIES[entityId] || { name: 'AtlasDev', type: 'LLC' };

  // State
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [expanded, setExpanded] = useState(new Set(['1000', '1100', '2000', '2100', '3000', '4000', '6000']));
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Filter Logic
  const filteredAccounts = useMemo(() => {
    let filtered = accounts;

    if (searchQuery) {
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.number.includes(searchQuery)
      );
    }

    if (filterClass !== 'All') {
      filtered = filtered.filter(a => a.class === filterClass);
    }

    if (filterStatus !== 'All') {
      filtered = filtered.filter(a => a.status === filterStatus);
    }

    return filtered;
  }, [accounts, searchQuery, filterClass, filterStatus]);

  const toggleExpand = (id) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  const displayedAccounts = useMemo(() => {
    if (searchQuery || filterClass !== 'All' || filterStatus !== 'All') {
      return filteredAccounts;
    }
    
    // Standard Tree Logic
    const visible = [];
    const isVisible = (parentId) => {
      if (!parentId) return true;
      if (!expanded.has(parentId)) return false;
      const parent = accounts.find(a => a.id === parentId);
      return parent ? isVisible(parent.parentId) : true;
    };

    accounts.forEach(acc => {
      if (isVisible(acc.parentId)) {
        visible.push(acc);
      }
    });
    return visible;
  }, [filteredAccounts, expanded, accounts, searchQuery, filterClass, filterStatus]);

  return (
    <>
      <Helmet>
        <title>Chart of Accounts - {entity.name} | AtlasDev</title>
      </Helmet>

      <div className="flex flex-col h-full w-full bg-[#F7FAFC] overflow-hidden">
         {/* --- 1. Header --- */}
         <div className="bg-white border-b border-gray-200 px-6 py-5 shrink-0">
            <div className="max-w-[1600px] mx-auto">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                     <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate(`/accounting/entities/${entityId}/dashboard`)}
                        className="text-gray-500 hover:text-gray-900 -ml-2"
                     >
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                     </Button>
                  </div>
               </div>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700">
                        <Layers className="w-6 h-6" />
                     </div>
                     <div>
                        <h1 className="text-2xl font-bold text-gray-900 leading-none">Chart of Accounts</h1>
                        <p className="text-sm text-gray-500 mt-1">{entity.name} • {entity.type}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="flex items-center border border-gray-200 rounded-md bg-white mr-2">
                       <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-50 rounded-r-none border-r" onClick={() => setIsImportModalOpen(true)}>
                         <Upload className="w-4 h-4 mr-2" /> Import
                       </Button>
                       <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-50 rounded-l-none">
                         <ChevronDown className="w-3 h-3" />
                       </Button>
                     </div>
                     <Button variant="outline" className="text-gray-600">
                        <Download className="w-4 h-4 mr-2" /> Export
                     </Button>
                     <Button className="bg-[#2F855A] hover:bg-[#276749] text-white" onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Add Account
                     </Button>
                  </div>
               </div>
            </div>
         </div>

         {/* --- 2. Summary Bar --- */}
         <div className="bg-white border-b border-gray-200 px-6 py-3 shrink-0 shadow-[0_2px_4px_rgba(0,0,0,0.02)] z-10">
            <div className="max-w-[1600px] mx-auto flex items-center gap-8 text-sm">
               <div className="flex flex-col">
                  <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Total Accounts</span>
                  <span className="font-bold text-gray-900">{accounts.length}</span>
               </div>
               <div className="w-px h-8 bg-gray-100"></div>
               <div className="flex flex-col">
                  <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Active</span>
                  <span className="font-bold text-emerald-600">{accounts.filter(a => a.status === 'Active').length}</span>
               </div>
               <div className="w-px h-8 bg-gray-100"></div>
               <div className="flex flex-col">
                  <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Inactive</span>
                  <span className="font-bold text-gray-500">{accounts.filter(a => a.status === 'Inactive').length}</span>
               </div>
               <div className="w-px h-8 bg-gray-100"></div>
               <div className="flex flex-col">
                  <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Last Modified</span>
                  <span className="font-medium text-gray-700">Today, 10:42 AM</span>
               </div>
               <div className="flex-1"></div>
               <div className="flex gap-4">
                  <Button variant="link" size="sm" className="h-auto p-0 text-gray-500 hover:text-blue-600"><FileText className="w-3 h-3 mr-1" /> Trial Balance</Button>
                  <Button variant="link" size="sm" className="h-auto p-0 text-gray-500 hover:text-blue-600"><TableIcon className="w-3 h-3 mr-1" /> Ledger</Button>
                  <Button variant="link" size="sm" className="h-auto p-0 text-gray-500 hover:text-blue-600"><PieChart className="w-3 h-3 mr-1" /> Balance Sheet</Button>
                  <Button variant="link" size="sm" className="h-auto p-0 text-gray-500 hover:text-blue-600"><BarChart3 className="w-3 h-3 mr-1" /> P&L</Button>
               </div>
            </div>
         </div>

         {/* --- Main Content --- */}
         <div className="flex-1 overflow-hidden flex flex-col">
            
            {/* --- 3. Toolbar --- */}
            <div className="px-6 py-4 max-w-[1600px] w-full mx-auto space-y-4">
               <div className="flex items-center justify-between bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center flex-1">
                     <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                          type="text" 
                          placeholder="Search by name or number..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 border-none rounded-md text-sm focus:ring-0 outline-none"
                        />
                     </div>
                     <div className="h-6 w-px bg-gray-200 mx-2"></div>
                     <select 
                        className="text-sm border-none bg-transparent focus:ring-0 text-gray-600 font-medium cursor-pointer hover:text-gray-900 outline-none"
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                     >
                        <option value="All">All Classes</option>
                        <option value="Assets">Assets</option>
                        <option value="Liabilities">Liabilities</option>
                        <option value="Equity">Equity</option>
                        <option value="Revenue">Revenue</option>
                        <option value="Expenses">Expenses</option>
                     </select>
                     <div className="h-6 w-px bg-gray-200 mx-2"></div>
                     <select 
                        className="text-sm border-none bg-transparent focus:ring-0 text-gray-600 font-medium cursor-pointer hover:text-gray-900 outline-none"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                     >
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                     </select>
                  </div>
               </div>
            </div>

            {/* --- 4. Tree Table --- */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
               <div className="max-w-[1600px] mx-auto bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  <div className="grid grid-cols-12 gap-4 bg-gray-50 px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 sticky top-0 z-10">
                     <div className="col-span-4">Account Name</div>
                     <div className="col-span-2">Type</div>
                     <div className="col-span-2">Class</div>
                     <div className="col-span-2 text-right">Balance</div>
                     <div className="col-span-1 text-center">Status</div>
                     <div className="col-span-1 text-center">Actions</div>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                     {displayedAccounts.length > 0 ? displayedAccounts.map((account) => (
                        <div 
                           key={account.id} 
                           className={cn(
                              "grid grid-cols-12 gap-4 px-6 py-2.5 items-center hover:bg-gray-50 transition-colors group text-sm border-l-4",
                              getClassColor(account.class),
                              account.status === 'Inactive' && "opacity-60 bg-gray-50/50"
                           )}
                        >
                           <div className="col-span-4 flex items-center">
                              <div style={{ width: `${account.level * 24}px` }} className="shrink-0"></div>
                              {account.hasChildren && !searchQuery && filterClass === 'All' ? (
                                 <button 
                                    onClick={() => toggleExpand(account.id)}
                                    className="p-0.5 hover:bg-gray-200 rounded mr-2 transition-colors"
                                 >
                                    {expanded.has(account.id) ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                                 </button>
                              ) : (
                                 <div className="w-6 mr-0.5"></div> // Spacer
                              )}
                              <span className="font-mono text-gray-500 mr-3 text-xs">{account.number}</span>
                              <span 
                                 className={cn("font-medium cursor-pointer hover:text-emerald-700", account.level === 0 ? "text-gray-900" : "text-gray-700")}
                                 onClick={() => setSelectedAccount(account)}
                              >
                                 {account.name}
                              </span>
                           </div>
                           <div className="col-span-2 text-gray-600 text-xs">{account.type}</div>
                           <div className="col-span-2">
                              <Badge variant="outline" className="text-[10px] font-normal text-gray-500 bg-gray-50">{account.class}</Badge>
                           </div>
                           <div className={cn(
                              "col-span-2 text-right font-mono",
                              account.balance < 0 ? "text-red-600" : "text-gray-900"
                           )}>
                              {account.balance < 0 ? `(${formatCurrency(Math.abs(account.balance))})` : formatCurrency(account.balance)}
                           </div>
                           <div className="col-span-1 text-center">
                              <span className={cn(
                                 "inline-block w-2 h-2 rounded-full",
                                 account.status === 'Active' ? "bg-emerald-500" : "bg-gray-300"
                              )}></span>
                           </div>
                           <div className="col-span-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedAccount(account)}>
                                 <MoreHorizontal className="w-4 h-4 text-gray-400" />
                              </Button>
                           </div>
                        </div>
                     )) : (
                        <div className="p-12 text-center text-gray-500">
                           <Search className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                           <p>No accounts found matching your criteria.</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>

         {/* --- 5. Account Detail Drawer --- */}
         <Sheet open={!!selectedAccount} onOpenChange={(open) => !open && setSelectedAccount(null)}>
            <SheetContent className="w-[500px] sm:w-[600px] overflow-y-auto p-0" side="right">
               {selectedAccount && (
                  <div className="flex flex-col h-full">
                     <div className="px-6 py-6 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center justify-between mb-4">
                           <div className="flex items-center gap-3">
                              <Badge variant="outline" className="bg-white text-emerald-700 border-emerald-200 shadow-sm">{selectedAccount.class}</Badge>
                              <Badge variant="secondary" className="bg-gray-200 text-gray-700">{selectedAccount.status}</Badge>
                           </div>
                           <div className="flex gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                 <Edit2 className="w-4 h-4 text-gray-500" />
                              </Button>
                           </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedAccount.name}</h2>
                        <p className="text-sm text-gray-500 font-mono">Account #{selectedAccount.number}</p>
                     </div>
                     
                     <div className="flex-1 overflow-hidden flex flex-col">
                        <Tabs defaultValue="overview" className="flex-1 flex flex-col">
                           <div className="px-6 border-b border-gray-200">
                              <TabsList className="w-full justify-start bg-transparent p-0 h-10">
                                 <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 data-[state=active]:shadow-none rounded-none px-4 h-10">Overview</TabsTrigger>
                                 <TabsTrigger value="ledger" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 data-[state=active]:shadow-none rounded-none px-4 h-10">Transactions</TabsTrigger>
                                 <TabsTrigger value="settings" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 data-[state=active]:shadow-none rounded-none px-4 h-10">Settings</TabsTrigger>
                              </TabsList>
                           </div>

                           <TabsContent value="overview" className="flex-1 overflow-y-auto p-6 space-y-6">
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                                       <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Current Balance</p>
                                       <p className={cn("text-2xl font-bold", selectedAccount.balance < 0 ? "text-red-600" : "text-gray-900")}>
                                          {selectedAccount.balance < 0 ? `(${formatCurrency(Math.abs(selectedAccount.balance))})` : formatCurrency(selectedAccount.balance)}
                                       </p>
                                    </div>
                                    <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                                       <p className="text-xs text-gray-500 uppercase font-semibold mb-1">YTD Change</p>
                                       <p className="text-2xl font-bold text-emerald-600 flex items-center gap-1">
                                          +4.5%
                                       </p>
                                    </div>
                                 </div>

                                 <div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                       <Layers className="w-4 h-4 text-gray-400" /> Sub-Accounts Structure
                                    </h3>
                                    <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100 bg-white">
                                       {accounts.filter(a => a.parentId === selectedAccount.id).length > 0 ? (
                                          accounts.filter(a => a.parentId === selectedAccount.id).map(sub => (
                                             <div key={sub.id} className="px-4 py-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedAccount(sub)}>
                                                <div className="flex flex-col">
                                                   <span className="text-sm font-medium text-gray-900">{sub.name}</span>
                                                   <span className="text-xs text-gray-500 font-mono">#{sub.number}</span>
                                                </div>
                                                <span className="text-sm font-mono text-gray-700">{formatCurrency(sub.balance)}</span>
                                             </div>
                                          ))
                                       ) : (
                                          <div className="p-6 text-center text-sm text-gray-500 bg-gray-50">
                                             No direct sub-accounts found.
                                          </div>
                                       )}
                                    </div>
                                 </div>
                           </TabsContent>

                           <TabsContent value="ledger" className="flex-1 overflow-y-auto p-6">
                              <div className="border border-gray-200 rounded-lg overflow-hidden">
                                 <div className="bg-gray-50 px-4 py-2 text-xs font-bold text-gray-500 grid grid-cols-4 uppercase tracking-wider">
                                    <span>Date</span>
                                    <span className="col-span-2">Description</span>
                                    <span className="text-right">Amount</span>
                                 </div>
                                 <div className="divide-y divide-gray-100 bg-white">
                                    {[1,2,3,4,5].map(i => (
                                       <div key={i} className="px-4 py-3 text-sm grid grid-cols-4 items-center hover:bg-gray-50">
                                          <span className="text-gray-500">Dec {10-i}, 2025</span>
                                          <span className="col-span-2 text-gray-900 font-medium truncate pr-2">Transaction #{9000+i} - Vendor Payment</span>
                                          <span className="text-right font-mono text-gray-900">$1,250.00</span>
                                       </div>
                                    ))}
                                 </div>
                                 <div className="p-3 text-center border-t border-gray-100 bg-gray-50">
                                    <Button variant="outline" size="sm" className="w-full">Load More Transactions</Button>
                                 </div>
                              </div>
                           </TabsContent>

                           <TabsContent value="settings" className="flex-1 overflow-y-auto p-6 space-y-6">
                              <div className="space-y-4">
                                 <h3 className="text-sm font-medium text-gray-900">Account Configuration</h3>
                                 <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                       <div className="space-y-0.5">
                                          <label className="text-sm font-medium text-gray-900">Active Status</label>
                                          <p className="text-xs text-gray-500">Enable or disable this account in dropdowns</p>
                                       </div>
                                       <Switch checked={selectedAccount.status === 'Active'} />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                       <div className="space-y-0.5">
                                          <label className="text-sm font-medium text-gray-900">Allow Manual Journal Entries</label>
                                          <p className="text-xs text-gray-500">If disabled, only system entries allowed</p>
                                       </div>
                                       <Switch checked={true} />
                                    </div>
                                 </div>

                                 <h3 className="text-sm font-medium text-red-600 mt-8">Danger Zone</h3>
                                 <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                                    <p className="text-sm text-red-800 mb-4">Deleting an account will remove it from all reports. This action cannot be undone if transactions exist.</p>
                                    <Button variant="destructive" className="w-full">
                                       <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                                    </Button>
                                 </div>
                              </div>
                           </TabsContent>
                        </Tabs>
                     </div>
                  </div>
               )}
            </SheetContent>
         </Sheet>

         {/* --- 6. Add/Edit Account Modal --- */}
         <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogContent className="sm:max-w-[600px]">
               <DialogHeader>
                  <DialogTitle>Add New Account</DialogTitle>
               </DialogHeader>
               <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="col-span-2 sm:col-span-1 space-y-1.5">
                     <label className="text-xs font-medium text-gray-700">Account Type</label>
                     <Select defaultValue="Bank">
                        <SelectTrigger>
                           <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="Bank">Bank</SelectItem>
                           <SelectItem value="Accounts Receivable">Accounts Receivable</SelectItem>
                           <SelectItem value="Fixed Asset">Fixed Asset</SelectItem>
                           <SelectItem value="Accounts Payable">Accounts Payable</SelectItem>
                           <SelectItem value="Credit Card">Credit Card</SelectItem>
                           <SelectItem value="Long Term Liability">Long Term Liability</SelectItem>
                           <SelectItem value="Equity">Equity</SelectItem>
                           <SelectItem value="Income">Income</SelectItem>
                           <SelectItem value="Expense">Expense</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
                  <div className="col-span-2 sm:col-span-1 space-y-1.5">
                     <label className="text-xs font-medium text-gray-700">Class (Auto-assigned)</label>
                     <Input disabled value="Assets" className="bg-gray-50" />
                  </div>
                  
                  <div className="col-span-2 sm:col-span-1 space-y-1.5">
                     <label className="text-xs font-medium text-gray-700">Account Number</label>
                     <Input placeholder="e.g. 1160" />
                  </div>
                  <div className="col-span-2 sm:col-span-1 space-y-1.5">
                     <label className="text-xs font-medium text-gray-700">Account Name</label>
                     <Input placeholder="e.g. Petty Cash" />
                  </div>

                  <div className="col-span-2 space-y-1.5">
                     <label className="text-xs font-medium text-gray-700">Description</label>
                     <Input placeholder="Optional description..." />
                  </div>

                  <div className="col-span-2 flex items-center gap-8 pt-2 pb-2">
                     <div className="flex items-center space-x-2">
                        <Switch id="sub-account" />
                        <label htmlFor="sub-account" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Is Sub-account</label>
                     </div>
                     <div className="flex items-center space-x-2">
                        <Switch id="depreciation" />
                        <label htmlFor="depreciation" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Track Depreciation</label>
                     </div>
                  </div>

                  <div className="col-span-2 space-y-1.5 bg-gray-50 p-3 rounded-md border border-gray-100">
                     <label className="text-xs font-medium text-gray-700 flex items-center gap-2">
                        <Info className="w-3 h-3" /> Opening Balance (Optional)
                     </label>
                     <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="0.00" className="bg-white" />
                        <Input type="date" className="bg-white" />
                     </div>
                  </div>
               </div>
               <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                  <Button onClick={() => { setIsAddModalOpen(false); toast({ title: "Account Created", description: "New account has been added to the chart." }) }} className="bg-[#2F855A] hover:bg-[#276749] text-white">
                     Create Account
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         {/* --- 7. Import Modal --- */}
         <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
            <DialogContent className="sm:max-w-[500px]">
               <DialogHeader>
                  <DialogTitle>Import Accounts</DialogTitle>
               </DialogHeader>
               <div className="py-6 text-center border-2 border-dashed border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer bg-gray-50/50">
                  <Upload className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 font-medium">Click to upload CSV or drag & drop</p>
                  <p className="text-xs text-gray-400 mt-1">Supports .csv, .xls, .qbo</p>
               </div>
               <div className="space-y-2 mt-2">
                  <p className="text-xs font-medium text-gray-700">Map Columns</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                     <div className="border border-gray-200 p-2 rounded bg-gray-50 text-gray-500 text-xs">CSV Column: "Account #"</div>
                     <div className="border border-gray-200 p-2 rounded bg-white text-xs font-medium">Map to: Account Number</div>
                     <div className="border border-gray-200 p-2 rounded bg-gray-50 text-gray-500 text-xs">CSV Column: "Name"</div>
                     <div className="border border-gray-200 p-2 rounded bg-white text-xs font-medium">Map to: Account Name</div>
                  </div>
               </div>
               <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>Cancel</Button>
                  <Button onClick={() => setIsImportModalOpen(false)} className="bg-blue-600 hover:bg-blue-700 text-white">
                     Import Data
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

      </div>
    </>
  );
};

export default ChartOfAccountsPage;