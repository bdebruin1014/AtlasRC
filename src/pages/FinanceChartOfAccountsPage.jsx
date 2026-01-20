import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  ArrowLeft, Search, Plus, Download, Upload, Filter,
  ChevronRight, ChevronDown, MoreHorizontal, FileText,
  PieChart, BarChart3, Layers, RefreshCw, FileSpreadsheet
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useToast } from '@/components/ui/use-toast';

// --- Mock Data ---
const INITIAL_ACCOUNTS = [
  // Assets (Blue)
  { id: '1000', number: '1000', name: 'Assets', type: 'Assets', subType: 'Header', balance: 4520000, status: 'Active', level: 0, hasChildren: true, parentId: null },
  { id: '1100', number: '1100', name: 'Current Assets', type: 'Assets', subType: 'Header', balance: 1250000, status: 'Active', level: 1, hasChildren: true, parentId: '1000' },
  { id: '1110', number: '1110', name: 'Operating Cash', type: 'Assets', subType: 'Bank', balance: 850000, status: 'Active', level: 2, hasChildren: false, parentId: '1100' },
  { id: '1120', number: '1120', name: 'Construction Escrow', type: 'Assets', subType: 'Bank', balance: 250000, status: 'Active', level: 2, hasChildren: false, parentId: '1100' },
  { id: '1140', number: '1140', name: 'Accounts Receivable', type: 'Assets', subType: 'Receivable', balance: 75000, status: 'Active', level: 2, hasChildren: false, parentId: '1100' },
  
  { id: '1200', number: '1200', name: 'Fixed Assets', type: 'Assets', subType: 'Header', balance: 3270000, status: 'Active', level: 1, hasChildren: true, parentId: '1000' },
  { id: '1210', number: '1210', name: 'Land', type: 'Assets', subType: 'Fixed Asset', balance: 1500000, status: 'Active', level: 2, hasChildren: false, parentId: '1200' },
  { id: '1230', number: '1230', name: 'Buildings', type: 'Assets', subType: 'Fixed Asset', balance: 1770000, status: 'Active', level: 2, hasChildren: false, parentId: '1200' },

  // Liabilities (Red)
  { id: '2000', number: '2000', name: 'Liabilities', type: 'Liabilities', subType: 'Header', balance: 2150000, status: 'Active', level: 0, hasChildren: true, parentId: null },
  { id: '2100', number: '2100', name: 'Current Liabilities', type: 'Liabilities', subType: 'Header', balance: 150000, status: 'Active', level: 1, hasChildren: true, parentId: '2000' },
  { id: '2110', number: '2110', name: 'Accounts Payable', type: 'Liabilities', subType: 'Payable', balance: 85000, status: 'Active', level: 2, hasChildren: false, parentId: '2100' },
  { id: '2130', number: '2130', name: 'Credit Cards', type: 'Liabilities', subType: 'Credit Card', balance: 12000, status: 'Active', level: 2, hasChildren: false, parentId: '2100' },
  
  { id: '2200', number: '2200', name: 'Long Term Liabilities', type: 'Liabilities', subType: 'Header', balance: 2000000, status: 'Active', level: 1, hasChildren: true, parentId: '2000' },
  { id: '2210', number: '2210', name: 'Construction Loan', type: 'Liabilities', subType: 'Long Term Liability', balance: 1200000, status: 'Active', level: 2, hasChildren: false, parentId: '2200' },

  // Equity (Purple)
  { id: '3000', number: '3000', name: 'Equity', type: 'Equity', subType: 'Header', balance: 2370000, status: 'Active', level: 0, hasChildren: true, parentId: null },
  { id: '3100', number: '3100', name: 'Owner\'s Capital', type: 'Equity', subType: 'Equity', balance: 2370000, status: 'Active', level: 1, hasChildren: false, parentId: '3000' },

  // Revenue (Green)
  { id: '4000', number: '4000', name: 'Revenue', type: 'Revenue', subType: 'Header', balance: 850000, status: 'Active', level: 0, hasChildren: true, parentId: null },
  { id: '4100', number: '4100', name: 'Sales Income', type: 'Revenue', subType: 'Income', balance: 850000, status: 'Active', level: 1, hasChildren: false, parentId: '4000' },

  // Expenses (Orange)
  { id: '6000', number: '6000', name: 'Expenses', type: 'Expenses', subType: 'Header', balance: 125000, status: 'Active', level: 0, hasChildren: true, parentId: null },
  { id: '6100', number: '6100', name: 'Advertising', type: 'Expenses', subType: 'Expense', balance: 15000, status: 'Active', level: 1, hasChildren: false, parentId: '6000' },
  { id: '6200', number: '6200', name: 'Professional Fees', type: 'Expenses', subType: 'Expense', balance: 45000, status: 'Active', level: 1, hasChildren: false, parentId: '6000' },
  { id: '6300', number: '6300', name: 'Office Supplies', type: 'Expenses', subType: 'Expense', balance: 5000, status: 'Inactive', level: 1, hasChildren: false, parentId: '6000' },
];

const formatCurrency = (val) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

// Badges logic
const getTypeBadgeStyle = (type) => {
  switch(type) {
    case 'Assets': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Liabilities': return 'bg-red-100 text-red-800 border-red-200';
    case 'Equity': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Revenue': return 'bg-green-100 text-green-800 border-green-200';
    case 'Expenses': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const ChartOfAccountsPage = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [expanded, setExpanded] = useState(new Set(['1000', '1100', '1200', '2000', '2100', '2200', '3000', '4000', '6000']));
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [showInactive, setShowInactive] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter Logic
  const filteredAccounts = useMemo(() => {
    let filtered = accounts;

    if (searchQuery) {
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.number.includes(searchQuery)
      );
    }

    if (filterType !== 'All') {
      filtered = filtered.filter(a => a.type === filterType);
    }

    if (!showInactive) {
      filtered = filtered.filter(a => a.status === 'Active');
    }

    return filtered;
  }, [accounts, searchQuery, filterType, showInactive]);

  const toggleExpand = (id) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  // Display logic for Tree structure
  const displayedAccounts = useMemo(() => {
    // If searching, show flat list
    if (searchQuery) return filteredAccounts;
    
    // Standard Tree Logic
    const visible = [];
    const isVisible = (parentId) => {
      if (!parentId) return true;
      if (!expanded.has(parentId)) return false;
      const parent = accounts.find(a => a.id === parentId);
      return parent ? isVisible(parent.parentId) : true;
    };

    // Filter first then check visibility to maintain hierarchy logic if possible,
    // but usually we filter the visible list. 
    // Simple approach: iterate filtered accounts, check if their parents are expanded
    filteredAccounts.forEach(acc => {
      if (isVisible(acc.parentId)) {
        visible.push(acc);
      }
    });
    return visible;
  }, [filteredAccounts, expanded, accounts, searchQuery]);

  return (
    <>
      <Helmet>
        <title>Chart of Accounts | AtlasDev</title>
      </Helmet>

      <div className="flex flex-col h-full w-full bg-[#EDF2F7] overflow-hidden font-['Inter']">
         {/* --- 1. Header --- */}
         <div className="bg-white border-b border-gray-200 px-6 py-5 shrink-0">
            <div className="max-w-[1600px] mx-auto">
               <div className="flex items-center justify-between mb-4">
                  <Button 
                     variant="ghost" 
                     size="sm" 
                     onClick={() => navigate(-1)}
                     className="text-gray-500 hover:text-gray-900 -ml-2"
                  >
                     <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
               </div>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 bg-[#EDF2F7] rounded-lg flex items-center justify-center text-[#2F855A]">
                        <Layers className="w-6 h-6" />
                     </div>
                     <div>
                        <h1 className="text-2xl font-bold text-gray-900 leading-none">Chart of Accounts</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage your financial accounts structure</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <Button variant="outline" className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50">
                        <Upload className="w-4 h-4 mr-2" /> Import
                     </Button>
                     <Button variant="outline" className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50">
                        <Download className="w-4 h-4 mr-2" /> Export
                     </Button>
                     <Button className="bg-[#2F855A] hover:bg-[#276749] text-white" onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Add Account
                     </Button>
                  </div>
               </div>
            </div>
         </div>

         {/* --- 2. Filter Bar --- */}
         <div className="px-6 py-6 shrink-0 max-w-[1600px] w-full mx-auto">
            <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
               <div className="flex items-center flex-1 gap-3 px-2">
                  <div className="relative flex-1 max-w-md">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                     <input 
                       type="text" 
                       placeholder="Search accounts..." 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent outline-none"
                     />
                  </div>
                  <div className="h-6 w-px bg-gray-200 mx-1"></div>
                  <select 
                     className="text-sm border-none bg-transparent focus:ring-0 text-gray-600 font-medium cursor-pointer hover:text-gray-900 py-1 focus:outline-none"
                     value={filterType}
                     onChange={(e) => setFilterType(e.target.value)}
                  >
                     <option value="All">All Types</option>
                     <option value="Assets">Assets</option>
                     <option value="Liabilities">Liabilities</option>
                     <option value="Equity">Equity</option>
                     <option value="Revenue">Revenue</option>
                     <option value="Expenses">Expenses</option>
                  </select>
                  <div className="h-6 w-px bg-gray-200 mx-1"></div>
                  <div className="flex items-center gap-2">
                     <Switch 
                        checked={showInactive}
                        onCheckedChange={setShowInactive}
                        id="show-inactive"
                     />
                     <label htmlFor="show-inactive" className="text-sm font-medium text-gray-600 cursor-pointer select-none">
                        Show Inactive
                     </label>
                  </div>
               </div>
               <div className="flex items-center px-2 gap-2">
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-[#2F855A]" onClick={() => setAccounts([...INITIAL_ACCOUNTS])}>
                     <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                  </Button>
               </div>
            </div>
         </div>

         {/* --- 3. Accounts Table --- */}
         <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="max-w-[1600px] mx-auto bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
               <div className="grid grid-cols-12 gap-4 bg-gray-50 px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 sticky top-0 z-10">
                  <div className="col-span-2">Account #</div>
                  <div className="col-span-4">Account Name</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2">Sub-Type</div>
                  <div className="col-span-1 text-right">Balance</div>
                  <div className="col-span-1 text-center">Status</div>
               </div>
               
               <div className="divide-y divide-gray-100">
                  {displayedAccounts.length > 0 ? displayedAccounts.map((account) => (
                     <div 
                        key={account.id} 
                        className={cn(
                           "grid grid-cols-12 gap-4 px-6 py-3 items-center hover:bg-gray-50 transition-colors group text-sm cursor-pointer",
                           selectedAccount?.id === account.id && "bg-emerald-50 hover:bg-emerald-50"
                        )}
                        onClick={() => setSelectedAccount(account)}
                     >
                        <div className="col-span-2 font-mono text-gray-500 font-medium">
                           {account.number}
                        </div>
                        
                        <div className="col-span-4 flex items-center">
                           {/* Indentation */}
                           <div style={{ width: `${account.level * 24}px` }} className="shrink-0 transition-all duration-200" />
                           
                           {/* Expand Toggle */}
                           <div className="w-6 flex justify-center shrink-0 mr-1">
                              {account.hasChildren && !searchQuery && (
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); toggleExpand(account.id); }}
                                    className="p-0.5 hover:bg-gray-200 rounded transition-colors text-gray-400 hover:text-gray-600"
                                 >
                                    {expanded.has(account.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                 </button>
                              )}
                           </div>

                           <span className={cn(
                              "truncate",
                              account.level === 0 ? "font-bold text-gray-900" : 
                              account.hasChildren ? "font-semibold text-gray-800" : "text-gray-700"
                           )}>
                              {account.name}
                           </span>
                        </div>

                        <div className="col-span-2">
                           <Badge variant="outline" className={cn("font-normal text-[10px] px-2 py-0.5", getTypeBadgeStyle(account.type))}>
                              {account.type}
                           </Badge>
                        </div>

                        <div className="col-span-2 text-gray-500 text-xs">
                           {account.subType}
                        </div>

                        <div className={cn(
                           "col-span-1 text-right font-mono font-medium",
                           account.balance < 0 ? "text-red-600" : "text-gray-900"
                        )}>
                           {formatCurrency(account.balance)}
                        </div>

                        <div className="col-span-1 text-center">
                           <Badge variant="secondary" className={cn(
                              "text-[10px] h-5",
                              account.status === 'Active' ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                           )}>
                              {account.status}
                           </Badge>
                        </div>
                     </div>
                  )) : (
                     <div className="p-12 text-center text-gray-500">
                        <Search className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p>No accounts found matching your criteria.</p>
                        <Button variant="link" onClick={() => { setSearchQuery(''); setFilterType('All'); setShowInactive(false); }}>Clear Filters</Button>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* --- 4. Add Account Modal --- */}
         <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogContent className="sm:max-w-[600px]">
               <DialogHeader>
                  <DialogTitle>Add New Account</DialogTitle>
               </DialogHeader>
               <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="col-span-2 sm:col-span-1 space-y-1.5">
                     <label className="text-xs font-medium text-gray-700">Account Type</label>
                     <select className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm">
                        <option>Assets</option>
                        <option>Liabilities</option>
                        <option>Equity</option>
                        <option>Revenue</option>
                        <option>Expenses</option>
                     </select>
                  </div>
                  <div className="col-span-2 sm:col-span-1 space-y-1.5">
                     <label className="text-xs font-medium text-gray-700">Detail Type</label>
                     <select className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm">
                        <option>Bank</option>
                        <option>Accounts Receivable</option>
                        <option>Other Current Asset</option>
                        <option>Fixed Asset</option>
                     </select>
                  </div>
                  
                  <div className="col-span-2 sm:col-span-1 space-y-1.5">
                     <label className="text-xs font-medium text-gray-700">Account Number</label>
                     <input placeholder="e.g. 1150" className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm" />
                  </div>
                  <div className="col-span-2 sm:col-span-1 space-y-1.5">
                     <label className="text-xs font-medium text-gray-700">Account Name</label>
                     <input placeholder="e.g. Petty Cash" className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm" />
                  </div>

                  <div className="col-span-2 space-y-1.5">
                     <label className="text-xs font-medium text-gray-700">Description</label>
                     <textarea placeholder="Optional description..." className="flex min-h-[60px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm" />
                  </div>

                  <div className="col-span-2 flex items-center gap-8 pt-2 pb-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
                     <div className="flex items-center space-x-2">
                        <Switch id="sub-account" />
                        <label htmlFor="sub-account" className="text-sm font-medium leading-none cursor-pointer">Is Sub-account</label>
                     </div>
                     <div className="flex items-center space-x-2">
                        <Switch id="active-status" defaultChecked />
                        <label htmlFor="active-status" className="text-sm font-medium leading-none cursor-pointer">Active</label>
                     </div>
                  </div>
               </div>
               <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                  <Button onClick={() => { setIsAddModalOpen(false); toast({ title: "Account Created", description: "New account has been added to the chart." }) }} className="bg-[#2F855A] hover:bg-[#276749] text-white">
                     Create Account
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         {/* --- 5. Account Detail Sheet (Optional/Context) --- */}
         <Sheet open={!!selectedAccount} onOpenChange={(open) => !open && setSelectedAccount(null)}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto" side="right">
               {selectedAccount && (
                  <>
                     <SheetHeader className="mb-6 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                           <Badge variant="outline" className={cn(getTypeBadgeStyle(selectedAccount.type))}>{selectedAccount.type}</Badge>
                           <span className="text-sm text-gray-500 font-mono">#{selectedAccount.number}</span>
                        </div>
                        <SheetTitle className="text-2xl">{selectedAccount.name}</SheetTitle>
                        <SheetDescription>
                           {selectedAccount.subType} • {selectedAccount.status}
                        </SheetDescription>
                     </SheetHeader>
                     
                     <div className="space-y-6">
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-center">
                           <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Current Balance</p>
                           <p className={cn("text-3xl font-bold", selectedAccount.balance < 0 ? "text-red-600" : "text-gray-900")}>
                              {formatCurrency(selectedAccount.balance)}
                           </p>
                        </div>

                        <div>
                           <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                              <FileSpreadsheet className="w-4 h-4 text-gray-400" /> Quick Actions
                           </h3>
                           <div className="grid grid-cols-2 gap-3">
                              <Button variant="outline" className="justify-start"><FileText className="w-4 h-4 mr-2 text-gray-400" /> View Ledger</Button>
                              <Button variant="outline" className="justify-start"><BarChart3 className="w-4 h-4 mr-2 text-gray-400" /> Run Report</Button>
                              <Button variant="outline" className="justify-start"><MoreHorizontal className="w-4 h-4 mr-2 text-gray-400" /> Edit Details</Button>
                           </div>
                        </div>
                     </div>
                  </>
               )}
            </SheetContent>
         </Sheet>

      </div>
    </>
  );
};

export default ChartOfAccountsPage;