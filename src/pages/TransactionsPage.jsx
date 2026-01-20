import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Plus, Download, Search, Filter, ArrowLeft, 
  MoreHorizontal, ChevronLeft, ChevronRight,
  ArrowUpRight, ArrowDownLeft, RefreshCw, FileText,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';
import { cn } from "@/lib/utils";

// Mock Data
const ACCOUNTS = [
  { id: 'all', name: 'All Accounts' },
  { id: '1110', name: 'Operating Cash (...8821)' },
  { id: '1120', name: 'Construction Escrow (...9942)' },
  { id: '2130', name: 'Chase Credit Card (...4452)' },
];

const MOCK_TRANSACTIONS = [
  { id: 1, date: '2025-12-05', type: 'Deposit', number: 'DEP-101', account: 'Operating Cash', payee: 'Johnson Family', memo: 'Lot 5 Closing', payment: 0, deposit: 125000.00, balance: 850000.00 },
  { id: 2, date: '2025-12-04', type: 'Check', number: '1005', account: 'Operating Cash', payee: 'Smith Engineering', memo: 'Structural Analysis', payment: 2500.00, deposit: 0, balance: 725000.00 },
  { id: 3, date: '2025-12-03', type: 'Transfer', number: 'TRF-001', account: 'Operating Cash', payee: 'Transfer to Escrow', memo: 'Fund construction draw', payment: 50000.00, deposit: 0, balance: 727500.00 },
  { id: 4, date: '2025-12-02', type: 'Expense', number: 'CARD-99', account: 'Chase Credit Card', payee: 'Home Depot', memo: 'Job site supplies', payment: 432.15, deposit: 0, balance: -12500.00 },
  { id: 5, date: '2025-12-01', type: 'Journal', number: 'JE-2025-44', account: 'General Ledger', payee: '-', memo: 'Monthly Depreciation', payment: 0, deposit: 0, balance: 0 },
  { id: 6, date: '2025-11-30', type: 'Check', number: '1004', account: 'Operating Cash', payee: 'City Water', memo: 'Utilities Nov', payment: 150.25, deposit: 0, balance: 777500.00 },
  { id: 7, date: '2025-11-28', type: 'Deposit', number: 'DEP-100', account: 'Operating Cash', payee: 'Refund', memo: 'Overpayment refund', payment: 0, deposit: 450.00, balance: 777650.25 },
  { id: 8, date: '2025-11-25', type: 'Expense', number: 'CARD-98', account: 'Chase Credit Card', payee: 'Shell Station', memo: 'Fuel', payment: 65.00, deposit: 0, balance: -12067.85 },
];

const formatCurrency = (val) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

const formatDate = (dateStr) => 
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const getTypeIcon = (type) => {
  switch(type) {
    case 'Deposit': return <ArrowDownLeft className="w-4 h-4 text-emerald-600" />;
    case 'Check': return <FileText className="w-4 h-4 text-blue-600" />;
    case 'Transfer': return <RefreshCw className="w-4 h-4 text-purple-600" />;
    case 'Expense': return <ArrowUpRight className="w-4 h-4 text-red-600" />;
    default: return <FileText className="w-4 h-4 text-gray-500" />;
  }
};

const TransactionsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [filterDate, setFilterDate] = useState('this_month');
  const [filterAccount, setFilterAccount] = useState('all');
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter Logic
  const filteredTransactions = useMemo(() => {
    return MOCK_TRANSACTIONS.filter(t => {
      const matchesSearch = 
        t.payee.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.memo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.number.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesAccount = filterAccount === 'all' || t.account.includes(filterAccount === '1110' ? 'Operating' : filterAccount === '1120' ? 'Escrow' : 'Credit');
      const matchesType = filterType === 'All' || t.type === filterType;
      
      return matchesSearch && matchesAccount && matchesType;
    });
  }, [searchQuery, filterAccount, filterType, filterDate]);

  return (
    <>
      <Helmet>
        <title>Transactions | AtlasDev</title>
      </Helmet>
      
      <div className="flex flex-col h-full w-full bg-[#EDF2F7]">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-5 shrink-0">
            <div className="max-w-[1600px] mx-auto flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-gray-500">
                     <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <div>
                     <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
                     <p className="text-sm text-gray-500">View and manage financial activity</p>
                  </div>
               </div>
               <div className="flex gap-2">
                  <Button variant="outline" onClick={() => toast({ title: "Exporting...", description: "Your CSV download will start shortly." })}>
                     <Download className="w-4 h-4 mr-2" /> Export
                  </Button>
                  <Button className="bg-[#2F855A] hover:bg-[#276749] text-white" onClick={() => setIsAddModalOpen(true)}>
                     <Plus className="w-4 h-4 mr-2" /> Add Transaction
                  </Button>
               </div>
            </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 shrink-0 max-w-[1600px] w-full mx-auto">
           <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <input 
                    type="text" 
                    placeholder="Search payee, memo, or number..." 
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F855A]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>
              
              <Select value={filterAccount} onValueChange={setFilterAccount}>
                 <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Select Account" />
                 </SelectTrigger>
                 <SelectContent>
                    {ACCOUNTS.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}
                 </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                 <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Transaction Type" />
                 </SelectTrigger>
                 <SelectContent>
                    <SelectItem value="All">All Types</SelectItem>
                    <SelectItem value="Check">Check</SelectItem>
                    <SelectItem value="Deposit">Deposit</SelectItem>
                    <SelectItem value="Transfer">Transfer</SelectItem>
                    <SelectItem value="Journal">Journal Entry</SelectItem>
                    <SelectItem value="Expense">Expense</SelectItem>
                 </SelectContent>
              </Select>

              <Select value={filterDate} onValueChange={setFilterDate}>
                 <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Date Range" />
                 </SelectTrigger>
                 <SelectContent>
                    <SelectItem value="this_month">This Month</SelectItem>
                    <SelectItem value="last_month">Last Month</SelectItem>
                    <SelectItem value="this_quarter">This Quarter</SelectItem>
                    <SelectItem value="this_year">This Year</SelectItem>
                 </SelectContent>
              </Select>
           </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-hidden px-6 pb-6">
           <div className="h-full max-w-[1600px] mx-auto bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col">
              <div className="flex-1 overflow-auto">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                       <tr>
                          <th className="px-4 py-3 font-semibold text-gray-500">Date</th>
                          <th className="px-4 py-3 font-semibold text-gray-500 w-10">Type</th>
                          <th className="px-4 py-3 font-semibold text-gray-500">Number</th>
                          <th className="px-4 py-3 font-semibold text-gray-500">Account</th>
                          <th className="px-4 py-3 font-semibold text-gray-500">Payee / Description</th>
                          <th className="px-4 py-3 font-semibold text-gray-500">Memo</th>
                          <th className="px-4 py-3 font-semibold text-gray-500 text-right">Payment</th>
                          <th className="px-4 py-3 font-semibold text-gray-500 text-right">Deposit</th>
                          <th className="px-4 py-3 font-semibold text-gray-500 text-right">Balance</th>
                          <th className="px-4 py-3 font-semibold text-gray-500 w-16"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                       {filteredTransactions.map((t, idx) => (
                          <tr key={t.id} className="hover:bg-gray-50 even:bg-gray-50/30 transition-colors group">
                             <td className="px-4 py-3 whitespace-nowrap text-gray-600">{formatDate(t.date)}</td>
                             <td className="px-4 py-3" title={t.type}>
                                {getTypeIcon(t.type)}
                             </td>
                             <td className="px-4 py-3 font-mono text-xs text-gray-500">{t.number}</td>
                             <td className="px-4 py-3 text-gray-600 truncate max-w-[150px]">{t.account}</td>
                             <td className="px-4 py-3 font-medium text-gray-900">{t.payee}</td>
                             <td className="px-4 py-3 text-gray-500 truncate max-w-[200px]">{t.memo}</td>
                             <td className="px-4 py-3 text-right font-mono font-medium text-red-600">
                                {t.payment > 0 ? formatCurrency(t.payment) : '-'}
                             </td>
                             <td className="px-4 py-3 text-right font-mono font-medium text-emerald-600">
                                {t.deposit > 0 ? formatCurrency(t.deposit) : '-'}
                             </td>
                             <td className="px-4 py-3 text-right font-mono text-gray-500 text-xs">
                                {formatCurrency(t.balance)}
                             </td>
                             <td className="px-4 py-3 text-right">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                                   <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                </Button>
                             </td>
                          </tr>
                       ))}
                       {filteredTransactions.length === 0 && (
                          <tr>
                             <td colSpan={10} className="p-12 text-center text-gray-500">
                                <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                <p className="text-lg font-medium text-gray-900">No transactions found</p>
                                <p className="text-sm">Try adjusting your filters or search query.</p>
                             </td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
              
              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
                 <div className="text-sm text-gray-500">
                    Showing <span className="font-medium">{filteredTransactions.length}</span> of <span className="font-medium">{MOCK_TRANSACTIONS.length}</span> results
                 </div>
                 <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled><ChevronLeft className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" className="bg-[#2F855A] text-white border-[#2F855A] hover:bg-[#276749]">1</Button>
                    <Button variant="outline" size="sm">2</Button>
                    <Button variant="outline" size="sm">3</Button>
                    <Button variant="outline" size="sm"><ChevronRight className="w-4 h-4" /></Button>
                 </div>
              </div>
           </div>
        </div>

        {/* Add Transaction Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
           <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                 <DialogTitle>Add New Transaction</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                 <div className="col-span-2 space-y-1">
                    <label className="text-xs font-medium text-gray-500">Account</label>
                    <Select>
                       <SelectTrigger><SelectValue placeholder="Select Account" /></SelectTrigger>
                       <SelectContent>
                          {ACCOUNTS.filter(a => a.id !== 'all').map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}
                       </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Date</label>
                    <input type="date" className="w-full h-10 px-3 border rounded-md text-sm" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Type</label>
                    <Select>
                       <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                       <SelectContent>
                          <SelectItem value="check">Check</SelectItem>
                          <SelectItem value="deposit">Deposit</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
                 <div className="col-span-2 space-y-1">
                    <label className="text-xs font-medium text-gray-500">Payee / Description</label>
                    <input type="text" className="w-full h-10 px-3 border rounded-md text-sm" placeholder="e.g. Home Depot" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Amount</label>
                    <input type="number" className="w-full h-10 px-3 border rounded-md text-sm" placeholder="0.00" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Reference #</label>
                    <input type="text" className="w-full h-10 px-3 border rounded-md text-sm" placeholder="Optional" />
                 </div>
                 <div className="col-span-2 space-y-1">
                    <label className="text-xs font-medium text-gray-500">Memo</label>
                    <input type="text" className="w-full h-10 px-3 border rounded-md text-sm" placeholder="Notes..." />
                 </div>
              </div>
              <DialogFooter>
                 <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                 <Button className="bg-[#2F855A] hover:bg-[#276749] text-white" onClick={() => { setIsAddModalOpen(false); toast({ title: "Transaction Added", description: "Transaction successfully recorded." })}}>Save Transaction</Button>
              </DialogFooter>
           </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default TransactionsPage;