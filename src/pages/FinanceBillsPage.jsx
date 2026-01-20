import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  ArrowLeft, Search, Plus, Filter, Download, Printer,
  Calendar, DollarSign, FileText, CheckCircle2, AlertCircle,
  MoreHorizontal, Trash2, Paperclip, Upload, AlertTriangle,
  Building2, CreditCard, ChevronDown, X
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
    vendorId: 101,
    vendorName: 'ABC General Contractors',
    billNumber: 'INV-2025-001',
    date: '2025-11-15',
    dueDate: '2025-12-15',
    description: 'Foundation Work - Phase 1',
    amount: 45000.00,
    paid: 0,
    status: 'Open',
    project: 'Highland Park Lofts',
    items: [
      { id: 1, desc: 'Concrete Foundation', account: 'Work in Progress', amount: 40000.00 },
      { id: 2, desc: 'Rebar Installation', account: 'Work in Progress', amount: 5000.00 }
    ]
  },
  {
    id: 2,
    vendorId: 102,
    vendorName: 'BuildPro Supply',
    billNumber: 'BP-9921',
    date: '2025-10-20',
    dueDate: '2025-11-19',
    description: 'Lumber Package A',
    amount: 12500.00,
    paid: 0,
    status: 'Overdue',
    project: 'Riverside Commercial',
    items: [
       { id: 3, desc: 'Framing Lumber', account: 'Materials', amount: 12500.00 }
    ]
  },
  {
    id: 3,
    vendorId: 103,
    vendorName: 'Austin Electric Co',
    billNumber: 'AE-4452',
    date: '2025-12-01',
    dueDate: '2025-12-31',
    description: 'Rough-in Electrical',
    amount: 8750.00,
    paid: 0,
    status: 'Open',
    project: 'Oakwood Residencies',
    items: [
       { id: 4, desc: 'Electrical Rough-in', account: 'Subcontractors', amount: 8750.00 }
    ]
  },
  {
    id: 4,
    vendorId: 104,
    vendorName: 'Smith & Associates',
    billNumber: 'L-2025-11',
    date: '2025-11-01',
    dueDate: '2025-12-01',
    description: 'Legal Consultation - Zoning',
    amount: 10000.00,
    paid: 2500.00,
    status: 'Partial',
    project: 'General Overhead',
    items: [
       { id: 5, desc: 'Legal Fees', account: 'Professional Fees', amount: 10000.00 }
    ]
  },
  {
    id: 5,
    vendorId: 105,
    vendorName: 'City of Austin',
    billNumber: 'PERMIT-772',
    date: '2025-10-15',
    dueDate: '2025-11-15',
    description: 'Building Permit Fees',
    amount: 3200.00,
    paid: 0,
    status: 'Overdue',
    project: 'The Addington',
    items: [
       { id: 6, desc: 'Building Permit', account: 'Permits & Licenses', amount: 3200.00 }
    ]
  },
  {
    id: 6,
    vendorId: 106,
    vendorName: 'Apex Plumbing',
    billNumber: 'AP-1022',
    date: '2025-12-05',
    dueDate: '2026-01-04',
    description: 'Under slab plumbing',
    amount: 15600.00,
    paid: 15600.00,
    status: 'Paid',
    project: 'Highland Park Lofts',
    items: [
       { id: 7, desc: 'Plumbing Rough', account: 'Subcontractors', amount: 15600.00 }
    ]
  },
  {
    id: 7,
    vendorId: 107,
    vendorName: 'Insurance Solutions Inc',
    billNumber: 'POL-2026',
    date: '2025-12-01',
    dueDate: '2025-12-15',
    description: 'Builders Risk Policy Renewal',
    amount: 4200.00,
    paid: 0,
    status: 'Open',
    project: 'Highland Park Lofts',
    items: [
       { id: 8, desc: 'Insurance Premium', account: 'Insurance', amount: 4200.00 }
    ]
  },
  {
    id: 8,
    vendorId: 108,
    vendorName: 'Office Depot',
    billNumber: 'INV-998877',
    date: '2025-12-02',
    dueDate: '2025-12-02',
    description: 'Office Supplies',
    amount: 450.25,
    paid: 450.25,
    status: 'Paid',
    project: 'General Overhead',
    items: [
       { id: 9, desc: 'Paper & Ink', account: 'Office Supplies', amount: 450.25 }
    ]
  },
  {
    id: 9,
    vendorId: 102,
    vendorName: 'BuildPro Supply',
    billNumber: 'BP-9950',
    date: '2025-11-25',
    dueDate: '2025-12-25',
    description: 'Roofing Materials',
    amount: 18500.00,
    paid: 0,
    status: 'Open',
    project: 'Riverside Commercial',
    items: [
       { id: 10, desc: 'Shingles & Felt', account: 'Materials', amount: 18500.00 }
    ]
  },
  {
    id: 10,
    vendorId: 101,
    vendorName: 'ABC General Contractors',
    billNumber: 'INV-2025-002',
    date: '2025-12-01',
    dueDate: '2025-12-31',
    description: 'Mobilization Fee',
    amount: 5000.00,
    paid: 0,
    status: 'Open',
    project: 'The Addington',
    items: [
       { id: 11, desc: 'Site Mobilization', account: 'General Conditions', amount: 5000.00 }
    ]
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
    case 'Paid': return 'bg-green-50 text-green-700 border-green-200';
    case 'Void': return 'bg-gray-100 text-gray-500 border-gray-200';
    default: return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const BillsPage = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [bills, setBills] = useState(BILLS_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedBill, setSelectedBill] = useState(null);
  const [selectedBillIds, setSelectedBillIds] = useState([]);
  const [isNewBillOpen, setIsNewBillOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [billToPay, setBillToPay] = useState(null); // For single pay modal

  // Derived Data
  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      const matchesSearch = 
        bill.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'All' || bill.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [bills, searchQuery, filterStatus]);

  const stats = useMemo(() => {
    const openBills = bills.filter(b => b.status === 'Open' || b.status === 'Partial');
    const overdueBills = bills.filter(b => b.status === 'Overdue');
    const paidThisMonth = bills.filter(b => b.status === 'Paid' && new Date(b.date).getMonth() === new Date().getMonth()); // Mock logic
    const dueThisWeek = openBills.filter(b => {
       const due = new Date(b.dueDate);
       const now = new Date();
       const diff = (due - now) / (1000 * 60 * 60 * 24);
       return diff >= 0 && diff <= 7;
    });

    return {
      openCount: openBills.length,
      openAmount: openBills.reduce((acc, b) => acc + (b.amount - b.paid), 0),
      overdueCount: overdueBills.length,
      overdueAmount: overdueBills.reduce((acc, b) => acc + (b.amount - b.paid), 0),
      dueThisWeekCount: dueThisWeek.length,
      dueThisWeekAmount: dueThisWeek.reduce((acc, b) => acc + (b.amount - b.paid), 0),
      paidThisMonthAmount: paidThisMonth.reduce((acc, b) => acc + b.amount, 0)
    };
  }, [bills]);

  const aging = useMemo(() => {
     // Mock aging buckets based on due date vs current date (Dec 02, 2025)
     const buckets = { current: 0, d1_30: 0, d31_60: 0, d61_90: 0, d90plus: 0 };
     const today = new Date('2025-12-02');

     bills.filter(b => b.status !== 'Paid').forEach(b => {
        const due = new Date(b.dueDate);
        const bal = b.amount - b.paid;
        const diffDays = Math.floor((today - due) / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) buckets.current += bal;
        else if (diffDays <= 30) buckets.d1_30 += bal;
        else if (diffDays <= 60) buckets.d31_60 += bal;
        else if (diffDays <= 90) buckets.d61_90 += bal;
        else buckets.d90plus += bal;
     });
     
     const total = Object.values(buckets).reduce((a,b) => a+b, 0) || 1; // prevent div by zero
     return { buckets, total };
  }, [bills]);


  const toggleBillSelection = (id) => {
    if (selectedBillIds.includes(id)) {
      setSelectedBillIds(selectedBillIds.filter(sid => sid !== id));
    } else {
      setSelectedBillIds([...selectedBillIds, id]);
    }
  };

  const handlePayBill = (bill) => {
    setBillToPay(bill);
    setIsPayModalOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Bills & Payables | Finance</title>
      </Helmet>

      <div className="flex flex-col h-full w-full bg-[#F7FAFC] overflow-hidden">
         {/* --- 1. Header --- */}
         <div className="bg-white border-b border-gray-200 px-6 py-5 shrink-0">
            <div className="max-w-[1600px] mx-auto">
               <div className="flex items-center justify-between mb-4">
                  <Button 
                     variant="ghost" 
                     size="sm" 
                     onClick={() => navigate(`/accounting/${entityId}/dashboard`)}
                     className="text-gray-500 hover:text-gray-900 -ml-2"
                  >
                     <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                  </Button>
               </div>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                        <FileText className="w-6 h-6" />
                     </div>
                     <div>
                        <h1 className="text-2xl font-bold text-gray-900 leading-none">Bills</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage payables and vendor invoices</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <Button variant="outline" className="text-gray-600">
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Pay Bills (Batch)
                     </Button>
                     <Button className="bg-[#2F855A] hover:bg-[#276749] text-white" onClick={() => setIsNewBillOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" /> New Bill
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
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Open Bills</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.openAmount)}</h3>
                        <p className="text-xs text-gray-400 mt-1">{stats.openCount} bills open</p>
                     </div>
                     <div className="p-2 bg-blue-50 rounded-lg text-blue-500"><FileText className="w-5 h-5" /></div>
                  </div>
               </div>
               <div className="bg-white p-4 rounded-xl border border-red-200 shadow-sm bg-red-50/30">
                  <div className="flex justify-between items-start">
                     <div>
                        <p className="text-xs font-medium text-red-600 uppercase tracking-wider">Overdue</p>
                        <h3 className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(stats.overdueAmount)}</h3>
                        <p className="text-xs text-red-400 mt-1">{stats.overdueCount} bills overdue</p>
                     </div>
                     <div className="p-2 bg-red-100 rounded-lg text-red-600"><AlertCircle className="w-5 h-5" /></div>
                  </div>
               </div>
               <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start">
                     <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Due This Week</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.dueThisWeekAmount)}</h3>
                        <p className="text-xs text-gray-400 mt-1">{stats.dueThisWeekCount} bills due</p>
                     </div>
                     <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600"><Calendar className="w-5 h-5" /></div>
                  </div>
               </div>
               <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start">
                     <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Paid This Month</p>
                        <h3 className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(stats.paidThisMonthAmount)}</h3>
                     </div>
                     <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><DollarSign className="w-5 h-5" /></div>
                  </div>
               </div>
            </div>

            {/* --- 3. Aging Summary Bar --- */}
            <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
               <div className="flex justify-between items-center mb-2 text-xs font-medium text-gray-500 uppercase">
                  <span>Aging Summary (Payables)</span>
                  <span>Total Outstanding: {formatCurrency(aging.buckets.current + aging.buckets.d1_30 + aging.buckets.d31_60 + aging.buckets.d61_90 + aging.buckets.d90plus)}</span>
               </div>
               <div className="flex h-8 rounded-full overflow-hidden w-full text-xs text-white font-bold leading-8">
                  <div style={{ width: `${(aging.buckets.current/aging.total)*100}%` }} className="bg-emerald-400 pl-2 truncate" title={`Current: ${formatCurrency(aging.buckets.current)}`}>{aging.buckets.current > 0 && formatCurrency(aging.buckets.current)}</div>
                  <div style={{ width: `${(aging.buckets.d1_30/aging.total)*100}%` }} className="bg-yellow-400 pl-2 truncate" title={`1-30 Days: ${formatCurrency(aging.buckets.d1_30)}`}>{aging.buckets.d1_30 > 0 && formatCurrency(aging.buckets.d1_30)}</div>
                  <div style={{ width: `${(aging.buckets.d31_60/aging.total)*100}%` }} className="bg-orange-400 pl-2 truncate" title={`31-60 Days: ${formatCurrency(aging.buckets.d31_60)}`}>{aging.buckets.d31_60 > 0 && formatCurrency(aging.buckets.d31_60)}</div>
                  <div style={{ width: `${(aging.buckets.d61_90/aging.total)*100}%` }} className="bg-red-400 pl-2 truncate" title={`61-90 Days: ${formatCurrency(aging.buckets.d61_90)}`}>{aging.buckets.d61_90 > 0 && formatCurrency(aging.buckets.d61_90)}</div>
                  <div style={{ width: `${(aging.buckets.d90plus/aging.total)*100}%` }} className="bg-red-600 pl-2 truncate" title={`90+ Days: ${formatCurrency(aging.buckets.d90plus)}`}>{aging.buckets.d90plus > 0 && formatCurrency(aging.buckets.d90plus)}</div>
               </div>
               <div className="flex justify-between mt-1 text-[10px] text-gray-400 font-medium uppercase">
                  <span className="w-1/5">Current</span>
                  <span className="w-1/5">1-30 Days</span>
                  <span className="w-1/5">31-60 Days</span>
                  <span className="w-1/5">61-90 Days</span>
                  <span className="w-1/5 text-right">90+ Days</span>
               </div>
            </div>
         </div>

         {/* --- 4. Filter Bar --- */}
         <div className="px-6 pb-4 max-w-[1600px] w-full mx-auto">
            <div className="flex items-center justify-between bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
               <div className="flex items-center flex-1 gap-2 p-1">
                  <div className="relative flex-1 max-w-md">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                     <input 
                       type="text" 
                       placeholder="Search by vendor, bill #, or description..." 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full pl-9 pr-4 py-1.5 text-sm border-none focus:ring-0 bg-transparent"
                     />
                  </div>
                  <div className="h-6 w-px bg-gray-200 mx-2"></div>
                  <select 
                     className="text-sm border-none bg-transparent focus:ring-0 text-gray-600 font-medium cursor-pointer hover:text-gray-900 py-1"
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
                  <Button variant="ghost" size="sm" className="text-gray-500">
                     <Calendar className="w-4 h-4 mr-2" /> Due Date
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500">
                     <Building2 className="w-4 h-4 mr-2" /> Project
                  </Button>
               </div>
            </div>
         </div>

         {/* --- 5. Bills Table --- */}
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
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Bill #</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Vendor</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Description</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Due Date</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">Amount</th>
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
                           <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(bill.date)}</td>
                           <td className="px-4 py-3 font-mono text-gray-700">{bill.billNumber}</td>
                           <td className="px-4 py-3 font-medium text-gray-900">{bill.vendorName}</td>
                           <td className="px-4 py-3 text-gray-600 max-w-[250px] truncate" title={bill.description}>{bill.description}</td>
                           <td className={cn("px-4 py-3 whitespace-nowrap", bill.status === 'Overdue' ? "text-red-600 font-bold" : "text-gray-600")}>
                              {formatDate(bill.dueDate)}
                           </td>
                           <td className="px-4 py-3 text-right font-mono text-gray-700">{formatCurrency(bill.amount)}</td>
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
                                 {bill.status !== 'Paid' && (
                                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Pay Bill" onClick={() => handlePayBill(bill)}>
                                       <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                                    </Button>
                                 )}
                                 <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedBill(bill)}>
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

         {/* --- 6. Bill Detail Drawer --- */}
         <Sheet open={!!selectedBill} onOpenChange={(open) => !open && setSelectedBill(null)}>
            <SheetContent className="w-[600px] sm:w-[750px] overflow-y-auto p-0" side="right">
               {selectedBill && (
                  <div className="flex flex-col h-full">
                     <div className="px-6 py-6 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-start justify-between mb-4">
                           <div>
                              <h2 className="text-2xl font-bold text-gray-900">{selectedBill.billNumber}</h2>
                              <p className="text-gray-500">{selectedBill.vendorName}</p>
                           </div>
                           <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                 <Printer className="w-4 h-4 mr-2" /> Print
                              </Button>
                              <Button variant="outline" size="sm">Edit</Button>
                              {selectedBill.status !== 'Paid' && (
                                 <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { setSelectedBill(null); handlePayBill(selectedBill); }}>
                                    Pay Bill
                                 </Button>
                              )}
                           </div>
                        </div>
                        <div className="flex gap-8 mt-6">
                           <div>
                              <p className="text-xs text-gray-400 uppercase font-bold">Status</p>
                              <Badge variant="outline" className={cn("mt-1", getStatusColor(selectedBill.status))}>{selectedBill.status}</Badge>
                           </div>
                           <div>
                              <p className="text-xs text-gray-400 uppercase font-bold">Amount Due</p>
                              <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(selectedBill.amount - selectedBill.paid)}</p>
                           </div>
                           <div>
                              <p className="text-xs text-gray-400 uppercase font-bold">Due Date</p>
                              <p className={cn("text-base font-medium mt-1", selectedBill.status === 'Overdue' ? "text-red-600" : "text-gray-700")}>
                                 {formatDate(selectedBill.dueDate)}
                              </p>
                           </div>
                        </div>
                     </div>

                     <div className="flex-1 p-6 space-y-8 bg-white">
                        {/* Bill Info */}
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                           <div className="grid grid-cols-[100px_1fr] items-center">
                              <span className="text-gray-500">Bill Date</span>
                              <span className="font-medium text-gray-900">{formatDate(selectedBill.date)}</span>
                           </div>
                           <div className="grid grid-cols-[100px_1fr] items-center">
                              <span className="text-gray-500">Project</span>
                              <span className="font-medium text-gray-900">{selectedBill.project}</span>
                           </div>
                           <div className="grid grid-cols-[100px_1fr] items-center">
                              <span className="text-gray-500">Memo</span>
                              <span className="font-medium text-gray-900">{selectedBill.description}</span>
                           </div>
                        </div>

                        {/* Line Items */}
                        <div>
                           <h3 className="font-bold text-gray-900 mb-3">Line Items</h3>
                           <div className="border border-gray-200 rounded-lg overflow-hidden">
                              <table className="w-full text-sm text-left">
                                 <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                       <th className="px-4 py-2 font-medium text-gray-500">Description</th>
                                       <th className="px-4 py-2 font-medium text-gray-500">Account</th>
                                       <th className="px-4 py-2 font-medium text-gray-500 text-right">Amount</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-gray-100">
                                    {selectedBill.items.map((item, idx) => (
                                       <tr key={idx}>
                                          <td className="px-4 py-2 text-gray-900">{item.desc}</td>
                                          <td className="px-4 py-2 text-gray-500 italic">{item.account}</td>
                                          <td className="px-4 py-2 text-right font-mono">{formatCurrency(item.amount)}</td>
                                       </tr>
                                    ))}
                                 </tbody>
                                 <tfoot className="bg-gray-50 font-bold text-gray-900 border-t border-gray-200">
                                    <tr>
                                       <td colSpan={2} className="px-4 py-2 text-right">Total</td>
                                       <td className="px-4 py-2 text-right">{formatCurrency(selectedBill.amount)}</td>
                                    </tr>
                                 </tfoot>
                              </table>
                           </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                           <h3 className="font-bold text-gray-900 mb-3">Payment Summary</h3>
                           <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                 <span className="text-gray-500">Bill Amount</span>
                                 <span className="font-mono font-medium">{formatCurrency(selectedBill.amount)}</span>
                              </div>
                              <div className="flex justify-between">
                                 <span className="text-gray-500">Payments Applied</span>
                                 <span className="font-mono font-medium text-emerald-600">({formatCurrency(selectedBill.paid)})</span>
                              </div>
                              <div className="border-t border-gray-200 my-2 pt-2 flex justify-between font-bold text-lg">
                                 <span>Balance Due</span>
                                 <span>{formatCurrency(selectedBill.amount - selectedBill.paid)}</span>
                              </div>
                           </div>
                        </div>
                        
                        {/* Attachments Mock */}
                        <div>
                           <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                              <Paperclip className="w-4 h-4" /> Attachments
                           </h3>
                           <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-400 text-sm">
                              No documents attached.
                           </div>
                        </div>
                     </div>
                  </div>
               )}
            </SheetContent>
         </Sheet>

         {/* --- 7. New Bill Modal --- */}
         <Dialog open={isNewBillOpen} onOpenChange={setIsNewBillOpen}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto flex flex-col gap-0 p-0">
               <DialogHeader className="px-6 py-4 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                  <DialogTitle>Create New Bill</DialogTitle>
               </DialogHeader>
               
               <div className="p-6 space-y-6">
                  <div className="grid grid-cols-3 gap-6">
                     <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">Vendor</label>
                        <select className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm">
                           <option>Select Vendor...</option>
                           <option>ABC General Contractors</option>
                           <option>BuildPro Supply</option>
                        </select>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">Bill Date</label>
                        <input type="date" className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm" />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">Due Date</label>
                        <input type="date" className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm" />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">Bill Number</label>
                        <input type="text" placeholder="e.g. INV-1001" className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm" />
                     </div>
                     <div className="col-span-2 space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">Memo</label>
                        <input type="text" placeholder="Optional description..." className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm" />
                     </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                     <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                           <tr>
                              <th className="px-3 py-2 font-medium text-gray-500 w-8">#</th>
                              <th className="px-3 py-2 font-medium text-gray-500">Description</th>
                              <th className="px-3 py-2 font-medium text-gray-500">Account</th>
                              <th className="px-3 py-2 font-medium text-gray-500">Project</th>
                              <th className="px-3 py-2 font-medium text-gray-500 w-24 text-right">Amount</th>
                              <th className="px-3 py-2 w-10"></th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                           <tr>
                              <td className="px-3 py-2 text-gray-400">1</td>
                              <td className="px-3 py-2"><input className="w-full border-none bg-transparent focus:ring-0 p-0" placeholder="Item description" /></td>
                              <td className="px-3 py-2">
                                 <select className="w-full border-none bg-transparent focus:ring-0 p-0 text-gray-600">
                                    <option>5000 - COGS</option>
                                    <option>6000 - Expenses</option>
                                 </select>
                              </td>
                              <td className="px-3 py-2">
                                 <select className="w-full border-none bg-transparent focus:ring-0 p-0 text-gray-600">
                                    <option>Highland Park Lofts</option>
                                    <option>General Overhead</option>
                                 </select>
                              </td>
                              <td className="px-3 py-2 text-right"><input className="w-full text-right border-none bg-transparent focus:ring-0 p-0" placeholder="0.00" /></td>
                              <td className="px-3 py-2 text-center"><Trash2 className="w-4 h-4 text-gray-300 hover:text-red-500 cursor-pointer" /></td>
                           </tr>
                           <tr className="bg-gray-50/50">
                              <td colSpan={6} className="px-3 py-2">
                                 <Button variant="ghost" size="sm" className="text-emerald-600 h-6 text-xs"><Plus className="w-3 h-3 mr-1" /> Add Line</Button>
                              </td>
                           </tr>
                        </tbody>
                     </table>
                  </div>

                  <div className="flex justify-between items-start">
                     <div className="w-1/2 border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-500">Drag & drop invoice or receipts here</p>
                     </div>
                     <div className="w-1/3 space-y-2">
                        <div className="flex justify-between text-sm">
                           <span className="text-gray-500">Subtotal</span>
                           <span className="font-medium">0.00</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                           <span>Total</span>
                           <span>$0.00</span>
                        </div>
                     </div>
                  </div>
               </div>

               <DialogFooter className="px-6 py-4 border-t border-gray-200 bg-gray-50 sticky bottom-0 z-10">
                  <Button variant="ghost" onClick={() => setIsNewBillOpen(false)}>Cancel</Button>
                  <Button className="bg-[#2F855A] hover:bg-[#276749] text-white" onClick={() => { setIsNewBillOpen(false); toast({ title: "Bill Created", description: "The bill has been successfully recorded." }) }}>
                     Save Bill
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         {/* --- 8. Pay Bill Modal (Single) --- */}
         <Dialog open={isPayModalOpen} onOpenChange={setIsPayModalOpen}>
            <DialogContent className="sm:max-w-[500px]">
               <DialogHeader>
                  <DialogTitle>Record Payment</DialogTitle>
               </DialogHeader>
               {billToPay && (
                  <div className="space-y-6 py-2">
                     <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between text-sm mb-1">
                           <span className="text-gray-500">Paying to:</span>
                           <span className="font-bold text-gray-900">{billToPay.vendorName}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                           <span className="text-gray-500">Bill #:</span>
                           <span className="font-mono text-gray-700">{billToPay.billNumber}</span>
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                           <span className="text-sm font-medium text-gray-600">Amount Due</span>
                           <span className="text-lg font-bold text-emerald-700">{formatCurrency(billToPay.amount - billToPay.paid)}</span>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="space-y-1.5">
                           <label className="text-xs font-medium text-gray-700">Payment Account</label>
                           <select className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm">
                              <option>Chase Operating (...8821)</option>
                              <option>Credit Card (...1234)</option>
                           </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className="text-xs font-medium text-gray-700">Payment Date</label>
                              <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm" />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-xs font-medium text-gray-700">Reference / Check #</label>
                              <input type="text" placeholder="e.g. 1054" className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm" />
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-xs font-medium text-gray-700">Amount to Pay</label>
                           <div className="relative">
                              <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                              <input 
                                 type="number" 
                                 defaultValue={billToPay.amount - billToPay.paid}
                                 className="flex h-9 w-full pl-9 rounded-md border border-gray-200 bg-white pr-3 py-1 text-sm font-bold text-gray-900 shadow-sm" 
                              />
                           </div>
                        </div>
                     </div>
                  </div>
               )}
               <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsPayModalOpen(false)}>Cancel</Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { setIsPayModalOpen(false); toast({ title: "Payment Recorded", description: "The payment has been successfully applied." }) }}>
                     Record Payment
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

      </div>
    </>
  );
};

export default BillsPage;