import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  ArrowLeft, Search, Plus, Filter, Download, Printer,
  Calendar, DollarSign, FileText, CheckCircle2, AlertCircle,
  MoreHorizontal, Trash2, User, Building, ChevronDown, Send,
  Clock, CreditCard
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useToast } from '@/components/ui/use-toast';

// --- Mock Data ---
const INVOICES_DATA = [
  {
    id: 1,
    invoiceNumber: 'INV-2025-001',
    customerName: 'Johnson Family',
    project: 'Sunset Ridge - Lot 5',
    date: '2025-11-01',
    dueDate: '2025-12-01',
    amount: 125000.00,
    paid: 10000.00,
    status: 'Partial',
  },
  {
    id: 2,
    invoiceNumber: 'INV-2025-002',
    customerName: 'Smith Buyers',
    project: 'Sunset Ridge - Lot 8',
    date: '2025-12-01',
    dueDate: '2025-12-15',
    amount: 15000.00,
    paid: 0,
    status: 'Sent',
  },
  {
    id: 3,
    invoiceNumber: 'INV-2025-003',
    customerName: 'Chen Family',
    project: 'Sunset Ridge - Lot 3',
    date: '2025-10-15',
    dueDate: '2025-11-15',
    amount: 140000.00,
    paid: 140000.00,
    status: 'Paid',
  },
  {
    id: 4,
    invoiceNumber: 'INV-2025-004',
    customerName: 'ABC Holdings LLC',
    project: 'General Investment',
    date: '2025-10-01',
    dueDate: '2025-10-31',
    amount: 250000.00,
    paid: 0,
    status: 'Overdue',
  },
  {
    id: 5,
    invoiceNumber: 'INV-2025-005',
    customerName: 'Park Family',
    project: 'Highland Park - Unit 101',
    date: '2025-12-05',
    dueDate: '2026-01-05',
    amount: 425000.00,
    paid: 0,
    status: 'Draft',
  },
  {
    id: 6,
    invoiceNumber: 'INV-2025-006',
    customerName: 'Tarrant Construction',
    project: 'Riverside Commercial',
    date: '2025-11-20',
    dueDate: '2025-12-20',
    amount: 3500.00,
    paid: 0,
    status: 'Viewed',
  }
];

const formatCurrency = (val) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

const formatDate = (dateStr) => 
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const getStatusColor = (status) => {
  switch(status) {
    case 'Draft': return 'bg-gray-100 text-gray-600 border-gray-200';
    case 'Sent': return 'bg-blue-50 text-blue-600 border-blue-200';
    case 'Viewed': return 'bg-indigo-50 text-indigo-600 border-indigo-200';
    case 'Partial': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'Paid': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    case 'Overdue': return 'bg-red-50 text-red-600 border-red-200';
    default: return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const ReceivablesPage = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [invoices, setInvoices] = useState(INVOICES_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Derived Data
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesSearch = 
        inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.project.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'All' || inv.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, filterStatus]);

  const stats = useMemo(() => {
    const outstandingInvoices = invoices.filter(i => i.status !== 'Paid' && i.status !== 'Draft');
    const overdueInvoices = invoices.filter(i => i.status === 'Overdue');
    const paidThisMonth = invoices.filter(i => i.paid > 0); // Simplified mock logic for "this month"
    
    const dueThisWeek = outstandingInvoices.filter(i => {
       const due = new Date(i.dueDate);
       const now = new Date();
       const diff = (due - now) / (1000 * 60 * 60 * 24);
       return diff >= 0 && diff <= 7;
    });

    return {
      outstandingAmount: outstandingInvoices.reduce((acc, i) => acc + (i.amount - i.paid), 0),
      dueThisWeekAmount: dueThisWeek.reduce((acc, i) => acc + (i.amount - i.paid), 0),
      overdueAmount: overdueInvoices.reduce((acc, i) => acc + (i.amount - i.paid), 0),
      collectedThisMonth: 140000 // Hardcoded based on mock data for simplicity
    };
  }, [invoices]);

  const toggleInvoiceSelection = (id) => {
    if (selectedInvoiceIds.includes(id)) {
      setSelectedInvoiceIds(selectedInvoiceIds.filter(sid => sid !== id));
    } else {
      setSelectedInvoiceIds([...selectedInvoiceIds, id]);
    }
  };

  return (
    <>
      <Helmet>
        <title>Receivables (AR) | AtlasDev</title>
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
                     <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                        <FileText className="w-6 h-6" />
                     </div>
                     <div>
                        <h1 className="text-2xl font-bold text-gray-900 leading-none">Receivables (AR)</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage invoices and incoming payments</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <Button className="bg-[#2F855A] hover:bg-[#276749] text-white" onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Create Invoice
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
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.outstandingAmount)}</h3>
                     </div>
                     <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Clock className="w-5 h-5" /></div>
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
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Collected This Month</p>
                        <h3 className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(stats.collectedThisMonth)}</h3>
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
                       placeholder="Search by customer, invoice #, project..." 
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
                     <option value="Draft">Draft</option>
                     <option value="Sent">Sent</option>
                     <option value="Viewed">Viewed</option>
                     <option value="Partial">Partial</option>
                     <option value="Paid">Paid</option>
                     <option value="Overdue">Overdue</option>
                  </select>
                  <div className="h-6 w-px bg-gray-200 mx-2"></div>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:bg-gray-100">
                     <Calendar className="w-4 h-4 mr-2" /> Date Range
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:bg-gray-100">
                     <User className="w-4 h-4 mr-2" /> Customer
                  </Button>
               </div>
            </div>
         </div>

         {/* --- 4. Invoices Table --- */}
         <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="max-w-[1600px] mx-auto bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
               <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                     <tr>
                        <th className="px-4 py-3 w-[40px] text-center">
                           <Checkbox 
                              checked={selectedInvoiceIds.length === invoices.length && invoices.length > 0}
                              onCheckedChange={() => {
                                 if(selectedInvoiceIds.length === invoices.length) setSelectedInvoiceIds([]);
                                 else setSelectedInvoiceIds(invoices.map(i => i.id));
                              }}
                           />
                        </th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Invoice #</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Customer</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Project</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Invoice Date</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Due Date</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">Amount</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">Paid</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">Balance</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-center">Status</th>
                        <th className="px-4 py-3 w-[60px]"></th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => (
                        <tr key={inv.id} className={cn(
                           "hover:bg-gray-50 group transition-colors",
                           inv.status === 'Overdue' && "bg-red-50/40 hover:bg-red-50/70"
                        )}>
                           <td className="px-4 py-3 text-center">
                              <Checkbox 
                                 checked={selectedInvoiceIds.includes(inv.id)}
                                 onCheckedChange={() => toggleInvoiceSelection(inv.id)}
                              />
                           </td>
                           <td className="px-4 py-3 font-mono text-blue-600 font-medium">{inv.invoiceNumber}</td>
                           <td className="px-4 py-3 font-medium text-gray-900">{inv.customerName}</td>
                           <td className="px-4 py-3 text-gray-600">{inv.project}</td>
                           <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(inv.date)}</td>
                           <td className={cn("px-4 py-3 whitespace-nowrap", inv.status === 'Overdue' ? "text-red-600 font-bold" : "text-gray-600")}>
                              {formatDate(inv.dueDate)}
                           </td>
                           <td className="px-4 py-3 text-right font-mono text-gray-700">{formatCurrency(inv.amount)}</td>
                           <td className="px-4 py-3 text-right font-mono text-gray-500">{formatCurrency(inv.paid)}</td>
                           <td className="px-4 py-3 text-right font-mono font-medium text-gray-900">
                              {formatCurrency(inv.amount - inv.paid)}
                           </td>
                           <td className="px-4 py-3 text-center">
                              <Badge variant="outline" className={cn("font-normal text-xs", getStatusColor(inv.status))}>
                                 {inv.status}
                              </Badge>
                           </td>
                           <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                 {inv.status !== 'Paid' && inv.status !== 'Void' && (
                                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Send">
                                       <Send className="w-3.5 h-3.5 text-blue-600" />
                                    </Button>
                                 )}
                                 <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <MoreHorizontal className="w-3.5 h-3.5 text-gray-400" />
                                 </Button>
                              </div>
                           </td>
                        </tr>
                     )) : (
                        <tr>
                           <td colSpan={11} className="px-6 py-12 text-center text-gray-500">
                              <Search className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                              <p>No invoices found matching your criteria.</p>
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* --- 5. Create Invoice Modal --- */}
         <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogContent className="sm:max-w-[500px]">
               <DialogHeader>
                  <DialogTitle>Create New Invoice</DialogTitle>
               </DialogHeader>
               <div className="py-4 space-y-4">
                  <div className="space-y-1.5">
                     <label className="text-xs font-medium text-gray-700">Customer</label>
                     <select className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm">
                        <option>Select Customer...</option>
                        <option>Johnson Family</option>
                        <option>Smith Buyers</option>
                     </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">Invoice Date</label>
                        <input type="date" className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm" />
                     </div>
                     <div className="space-y-1.5">
                         <label className="text-xs font-medium text-gray-700">Due Date</label>
                         <input type="date" className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm" />
                     </div>
                  </div>
                  <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-700">Project</label>
                      <select className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm">
                        <option>Select Project...</option>
                        <option>Sunset Ridge</option>
                        <option>Highland Park</option>
                     </select>
                  </div>
                  <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-700">Invoice Number</label>
                      <input type="text" className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm" placeholder="e.g. INV-2025-007" />
                  </div>
               </div>
               <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                  <Button className="bg-[#2F855A] hover:bg-[#276749] text-white" onClick={() => { setIsCreateModalOpen(false); toast({ title: "Invoice Created", description: "New draft invoice created successfully." }) }}>
                     Create Draft
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

      </div>
    </>
  );
};

export default ReceivablesPage;