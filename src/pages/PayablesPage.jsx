import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  ArrowLeft, Search, Plus, Filter, Download, Printer,
  Calendar, DollarSign, FileText, CheckCircle2, AlertCircle,
  MoreHorizontal, Trash2, Building2, CreditCard, ChevronDown
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useToast } from '@/components/ui/use-toast';

// --- Mock Data ---
const BILLS_DATA = [
  {
    id: 1,
    vendorName: 'ABC General Contractors',
    billNumber: 'INV-2025-001',
    date: '2025-11-15',
    dueDate: '2025-12-15',
    description: 'Foundation Work - Phase 1',
    amount: 45000.00,
    paid: 0,
    status: 'Open',
    items: []
  },
  {
    id: 2,
    vendorName: 'BuildPro Supply',
    billNumber: 'BP-9921',
    date: '2025-10-20',
    dueDate: '2025-11-19',
    description: 'Lumber Package A',
    amount: 12500.00,
    paid: 0,
    status: 'Overdue',
    items: []
  },
  {
    id: 3,
    vendorName: 'Austin Electric Co',
    billNumber: 'AE-4452',
    date: '2025-12-01',
    dueDate: '2025-12-31',
    description: 'Rough-in Electrical',
    amount: 8750.00,
    paid: 0,
    status: 'Open',
    items: []
  },
  {
    id: 4,
    vendorName: 'Smith & Associates',
    billNumber: 'L-2025-11',
    date: '2025-11-01',
    dueDate: '2025-12-01',
    description: 'Legal Consultation - Zoning',
    amount: 10000.00,
    paid: 2500.00,
    status: 'Partial',
    items: []
  },
  {
    id: 5,
    vendorName: 'City of Austin',
    billNumber: 'PERMIT-772',
    date: '2025-10-15',
    dueDate: '2025-11-15',
    description: 'Building Permit Fees',
    amount: 3200.00,
    paid: 0,
    status: 'Overdue',
    items: []
  },
  {
    id: 6,
    vendorName: 'Apex Plumbing',
    billNumber: 'AP-1022',
    date: '2025-12-05',
    dueDate: '2026-01-04',
    description: 'Under slab plumbing',
    amount: 15600.00,
    paid: 15600.00,
    status: 'Paid',
    items: []
  },
  {
    id: 7,
    vendorName: 'Insurance Solutions Inc',
    billNumber: 'POL-2026',
    date: '2025-12-01',
    dueDate: '2025-12-15',
    description: 'Builders Risk Policy Renewal',
    amount: 4200.00,
    paid: 0,
    status: 'Open',
    items: []
  }
];

const formatCurrency = (val) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

const formatDate = (dateStr) => 
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const getStatusColor = (status) => {
  switch(status) {
    case 'Open': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Overdue': return 'bg-red-50 text-red-700 border-red-200';
    case 'Partial': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'Paid': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    default: return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const PayablesPage = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [bills, setBills] = useState(BILLS_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedBillIds, setSelectedBillIds] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Derived Data
  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      const matchesSearch = 
        bill.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.billNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'All' || bill.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [bills, searchQuery, filterStatus]);

  const stats = useMemo(() => {
    const openBills = bills.filter(b => b.status === 'Open' || b.status === 'Partial');
    const overdueBills = bills.filter(b => b.status === 'Overdue');
    const paidThisMonth = bills.filter(b => b.status === 'Paid'); // Simplified logic
    const dueThisWeek = openBills.filter(b => {
       const due = new Date(b.dueDate);
       const now = new Date();
       const diff = (due - now) / (1000 * 60 * 60 * 24);
       return diff >= 0 && diff <= 7;
    });

    return {
      openAmount: openBills.reduce((acc, b) => acc + (b.amount - b.paid), 0),
      overdueAmount: overdueBills.reduce((acc, b) => acc + (b.amount - b.paid), 0),
      dueThisWeekAmount: dueThisWeek.reduce((acc, b) => acc + (b.amount - b.paid), 0),
      paidThisMonthAmount: paidThisMonth.reduce((acc, b) => acc + b.paid, 0)
    };
  }, [bills]);

  const toggleBillSelection = (id) => {
    if (selectedBillIds.includes(id)) {
      setSelectedBillIds(selectedBillIds.filter(sid => sid !== id));
    } else {
      setSelectedBillIds([...selectedBillIds, id]);
    }
  };

  return (
    <>
      <Helmet>
        <title>Payables (AP) | AtlasDev</title>
      </Helmet>

      <div className="flex flex-col h-full w-full bg-[#EDF2F7] overflow-hidden">
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
                     <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-[#2F855A]">
                        <FileText className="w-6 h-6" />
                     </div>
                     <div>
                        <h1 className="text-2xl font-bold text-gray-900 leading-none">Payables (AP)</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage vendor bills and payments</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <Button className="bg-[#2F855A] hover:bg-[#276749] text-white" onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Add Bill
                     </Button>
                  </div>
               </div>
            </div>
         </div>

         {/* --- 2. Summary Cards --- */}
         <div className="px-6 py-6 shrink-0 max-w-[1600px] w-full mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start">
                     <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Outstanding</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.openAmount)}</h3>
                     </div>
                     <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><FileText className="w-5 h-5" /></div>
                  </div>
               </div>
               <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start">
                     <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Due This Week</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.dueThisWeekAmount)}</h3>
                     </div>
                     <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600"><Calendar className="w-5 h-5" /></div>
                  </div>
               </div>
               <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm bg-red-50/30 border-red-100">
                  <div className="flex justify-between items-start">
                     <div>
                        <p className="text-xs font-medium text-red-600 uppercase tracking-wider">Overdue</p>
                        <h3 className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(stats.overdueAmount)}</h3>
                     </div>
                     <div className="p-2 bg-red-100 rounded-lg text-red-600"><AlertCircle className="w-5 h-5" /></div>
                  </div>
               </div>
               <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start">
                     <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Paid This Month</p>
                        <h3 className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(stats.paidThisMonthAmount)}</h3>
                     </div>
                     <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><CheckCircle2 className="w-5 h-5" /></div>
                  </div>
               </div>
            </div>
         </div>

         {/* --- 3. Filter Bar --- */}
         <div className="px-6 pb-4 max-w-[1600px] w-full mx-auto">
            <div className="flex items-center justify-between bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
               <div className="flex items-center flex-1 gap-2 p-1">
                  <div className="relative flex-1 max-w-md">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                     <input 
                       type="text" 
                       placeholder="Search by vendor, bill #..." 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full pl-9 pr-4 py-1.5 text-sm border-none focus:ring-0 bg-transparent focus:outline-none"
                     />
                  </div>
                  <div className="h-6 w-px bg-gray-200 mx-2"></div>
                  <select 
                     className="text-sm border-none bg-transparent focus:ring-0 text-gray-600 font-medium cursor-pointer hover:text-gray-900 py-1 focus:outline-none"
                     value={filterStatus}
                     onChange={(e) => setFilterStatus(e.target.value)}
                  >
                     <option value="All">All Status</option>
                     <option value="Open">Open</option>
                     <option value="Overdue">Overdue</option>
                     <option value="Paid">Paid</option>
                     <option value="Partial">Partial</option>
                  </select>
                  <div className="h-6 w-px bg-gray-200 mx-2"></div>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:bg-gray-100">
                     <Calendar className="w-4 h-4 mr-2" /> Date Range
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:bg-gray-100">
                     <Building2 className="w-4 h-4 mr-2" /> Vendor
                  </Button>
               </div>
            </div>
         </div>

         {/* --- 4. Bills Table --- */}
         <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="max-w-[1600px] mx-auto bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
               <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                     <tr>
                        <th className="px-4 py-3 w-[40px] text-center">
                           <Checkbox 
                              checked={selectedBillIds.length === bills.length && bills.length > 0}
                              onCheckedChange={() => {
                                 if(selectedBillIds.length === bills.length) setSelectedBillIds([]);
                                 else setSelectedBillIds(bills.map(b => b.id));
                              }}
                           />
                        </th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Bill #</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Vendor Name</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Bill Date</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Due Date</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">Amount</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">Paid</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">Balance</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-center">Status</th>
                        <th className="px-4 py-3 w-[60px]"></th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {filteredBills.length > 0 ? filteredBills.map((bill) => (
                        <tr key={bill.id} className={cn(
                           "hover:bg-gray-50 group transition-colors",
                           bill.status === 'Overdue' && "bg-red-50/40 hover:bg-red-50/70"
                        )}>
                           <td className="px-4 py-3 text-center">
                              <Checkbox 
                                 checked={selectedBillIds.includes(bill.id)}
                                 onCheckedChange={() => toggleBillSelection(bill.id)}
                              />
                           </td>
                           <td className="px-4 py-3 font-mono text-gray-700">{bill.billNumber}</td>
                           <td className="px-4 py-3 font-medium text-gray-900">{bill.vendorName}</td>
                           <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(bill.date)}</td>
                           <td className={cn("px-4 py-3 whitespace-nowrap", bill.status === 'Overdue' ? "text-red-600 font-bold" : "text-gray-600")}>
                              {formatDate(bill.dueDate)}
                           </td>
                           <td className="px-4 py-3 text-right font-mono text-gray-700">{formatCurrency(bill.amount)}</td>
                           <td className="px-4 py-3 text-right font-mono text-gray-500">{formatCurrency(bill.paid)}</td>
                           <td className="px-4 py-3 text-right font-mono font-medium text-gray-900">
                              {formatCurrency(bill.amount - bill.paid)}
                           </td>
                           <td className="px-4 py-3 text-center">
                              <Badge variant="outline" className={cn("font-normal text-xs", getStatusColor(bill.status))}>
                                 {bill.status}
                              </Badge>
                           </td>
                           <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <MoreHorizontal className="w-3.5 h-3.5 text-gray-400" />
                                 </Button>
                              </div>
                           </td>
                        </tr>
                     )) : (
                        <tr>
                           <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                              <Search className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                              <p>No bills found matching your criteria.</p>
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* --- 5. Add Bill Modal --- */}
         <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogContent className="sm:max-w-[500px]">
               <DialogHeader>
                  <DialogTitle>Add New Bill</DialogTitle>
               </DialogHeader>
               <div className="py-4 space-y-4">
                  <div className="space-y-1.5">
                     <label className="text-xs font-medium text-gray-700">Vendor</label>
                     <select className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm">
                        <option>Select Vendor...</option>
                        <option>ABC General Contractors</option>
                        <option>BuildPro Supply</option>
                     </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">Bill Date</label>
                        <input type="date" className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm" />
                     </div>
                     <div className="space-y-1.5">
                         <label className="text-xs font-medium text-gray-700">Due Date</label>
                         <input type="date" className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm" />
                     </div>
                  </div>
                  <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-700">Bill Number</label>
                      <input type="text" className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm" placeholder="e.g. INV-1001" />
                  </div>
                  <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-700">Total Amount</label>
                      <input type="number" className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm" placeholder="0.00" />
                  </div>
               </div>
               <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                  <Button className="bg-[#2F855A] hover:bg-[#276749] text-white" onClick={() => { setIsAddModalOpen(false); toast({ title: "Bill Added", description: "New bill recorded successfully." }) }}>
                     Save Bill
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

      </div>
    </>
  );
};

export default PayablesPage;