import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
   Plus, 
   TrendingUp, 
   TrendingDown, 
   DollarSign, 
   Edit,
   Trash2,
   MoreHorizontal,
   Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select';
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import TransactionModal from '@/components/TransactionModal';
import transactionService from '@/services/transactionService';
import entityService from '@/services/entityService';
import projectService from '@/services/projectService';
import { supabase } from '@/lib/supabase';

const TransactionsPage = () => {
   const [searchTerm, setSearchTerm] = useState('');
   const [filterEntity, setFilterEntity] = useState('');
   const [filterType, setFilterType] = useState('');
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editingTransaction, setEditingTransaction] = useState(null);
   const [deleteTransaction, setDeleteTransaction] = useState(null);

   const { toast } = useToast();
   const queryClient = useQueryClient();

   // Fetch transactions
   const { data: transactions = [], isLoading } = useQuery({
      queryKey: ['transactions'],
      queryFn: transactionService.getAll,
   });

   // Fetch entities for filter and modal
   const { data: entities = [] } = useQuery({
      queryKey: ['entities'],
      queryFn: entityService.getAll,
   });

   // Fetch projects for modal
   const { data: projects = [] } = useQuery({
      queryKey: ['projects'],
      queryFn: projectService.getAll,
   });

   // Fetch contacts for vendor dropdown
   const { data: contacts = [] } = useQuery({
      queryKey: ['contacts'],
      queryFn: async () => {
         const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .order('company', { ascending: true });
         if (error) throw error;
         return data || [];
      },
   });

   // Create mutation
   const createMutation = useMutation({
      mutationFn: transactionService.create,
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['transactions'] });
         setIsModalOpen(false);
         toast({
            title: 'Transaction added',
            description: 'The transaction has been recorded successfully.',
         });
      },
      onError: (error) => {
         toast({
            title: 'Error',
            description: error.message || 'Failed to add transaction.',
            variant: 'destructive',
         });
      },
   });

   // Update mutation
   const updateMutation = useMutation({
      mutationFn: ({ id, data }) => transactionService.update(id, data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['transactions'] });
         setEditingTransaction(null);
         setIsModalOpen(false);
         toast({
            title: 'Transaction updated',
            description: 'The transaction has been updated successfully.',
         });
      },
      onError: (error) => {
         toast({
            title: 'Error',
            description: error.message || 'Failed to update transaction.',
            variant: 'destructive',
         });
      },
   });

   // Delete mutation
   const deleteMutation = useMutation({
      mutationFn: transactionService.delete,
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['transactions'] });
         setDeleteTransaction(null);
         toast({
            title: 'Transaction deleted',
            description: 'The transaction has been deleted successfully.',
         });
      },
      onError: (error) => {
         toast({
            title: 'Error',
            description: error.message || 'Failed to delete transaction.',
            variant: 'destructive',
         });
      },
   });

   const handleSubmit = (formData) => {
      if (editingTransaction) {
         updateMutation.mutate({ id: editingTransaction.id, data: formData });
      } else {
         createMutation.mutate(formData);
      }
   };

   const handleEdit = (transaction) => {
      setEditingTransaction(transaction);
      setIsModalOpen(true);
   };

   const confirmDelete = () => {
      if (deleteTransaction) {
         deleteMutation.mutate(deleteTransaction.id);
      }
   };

   // Calculate totals
   const totals = transactions.reduce(
      (acc, t) => {
         const amount = parseFloat(t.amount) || 0;
         if (t.transaction_type === 'income') {
            acc.income += amount;
         } else {
            acc.expenses += amount;
         }
         return acc;
      },
      { income: 0, expenses: 0 }
   );
   totals.net = totals.income - totals.expenses;

   // Filter transactions
   const filteredTransactions = transactions.filter(t => {
      const matchesSearch = 
         t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         t.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         t.entity?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
      const matchesEntity = !filterEntity || t.entity_id === filterEntity;
      const matchesType = !filterType || t.transaction_type === filterType;

      return matchesSearch && matchesEntity && matchesType;
   });

   const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
         style: 'currency',
         currency: 'USD',
      }).format(amount || 0);
   };

   const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
         month: 'short',
         day: 'numeric',
         year: 'numeric',
      });
   };

   return (
      <div className="p-6 bg-slate-950 min-h-screen">
         {/* Header */}
         <div className="flex justify-between items-center mb-6">
            <div>
               <h1 className="text-2xl font-bold text-white">Transactions</h1>
               <p className="text-slate-400">
                  Track income and expenses across all entities
               </p>
            </div>
            <div className="flex gap-2">
               <Button
                  variant="outline"
                  className="border-slate-600 text-slate-200 hover:bg-slate-800"
               >
                  <Download className="mr-2 h-4 w-4" />
                  Export
               </Button>
               <Button
                  onClick={() => {
                     setEditingTransaction(null);
                     setIsModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
               >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Transaction
               </Button>
            </div>
         </div>

         {/* Summary Cards */}
         <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
               <div className="flex items-center justify-between">
                  <div>
                     <div className="text-slate-400 text-sm">Total Income</div>
                     <div className="text-2xl font-bold text-green-400">
                        {formatCurrency(totals.income)}
                     </div>
                  </div>
                  <div className="p-3 bg-green-600/20 rounded-lg">
                     <TrendingUp className="h-6 w-6 text-green-400" />
                  </div>
               </div>
            </div>
        
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
               <div className="flex items-center justify-between">
                  <div>
                     <div className="text-slate-400 text-sm">Total Expenses</div>
                     <div className="text-2xl font-bold text-red-400">
                        {formatCurrency(totals.expenses)}
                     </div>
                  </div>
                  <div className="p-3 bg-red-600/20 rounded-lg">
                     <TrendingDown className="h-6 w-6 text-red-400" />
                  </div>
               </div>
            </div>
        
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
               <div className="flex items-center justify-between">
                  <div>
                     <div className="text-slate-400 text-sm">Net Income</div>
                     <div className={`text-2xl font-bold ${totals.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(totals.net)}
                     </div>
                  </div>
                  <div className={`p-3 rounded-lg ${totals.net >= 0 ? 'bg-green-600/20' : 'bg-red-600/20'}`}>
                     <DollarSign className={`h-6 w-6 ${totals.net >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                  </div>
               </div>
            </div>
         </div>

         {/* Filters */}
         <div className="flex gap-4 mb-4">
            <Input
               placeholder="Search transactions..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="max-w-xs bg-slate-800 border-slate-600 text-white"
            />
        
            <Select value={filterEntity} onValueChange={setFilterEntity}>
               <SelectTrigger className="w-[200px] bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="All Entities" />
               </SelectTrigger>
               <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="" className="text-white hover:bg-slate-700">
                     All Entities
                  </SelectItem>
                  {entities.map((entity) => (
                     <SelectItem
                        key={entity.id}
                        value={entity.id}
                        className="text-white hover:bg-slate-700"
                     >
                        {entity.name}
                     </SelectItem>
                  ))}
               </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
               <SelectTrigger className="w-[150px] bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="All Types" />
               </SelectTrigger>
               <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="" className="text-white hover:bg-slate-700">
                     All Types
                  </SelectItem>
                  <SelectItem value="income" className="text-green-400 hover:bg-slate-700">
                     Income
                  </SelectItem>
                  <SelectItem value="expense" className="text-red-400 hover:bg-slate-700">
                     Expense
                  </SelectItem>
               </SelectContent>
            </Select>
         </div>

         {/* Transactions Table */}
         <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
            <table className="w-full">
               <thead className="bg-slate-800">
                  <tr>
                     <th className="text-left p-3 text-slate-400 font-medium">Date</th>
                     <th className="text-left p-3 text-slate-400 font-medium">Description</th>
                     <th className="text-left p-3 text-slate-400 font-medium">Entity</th>
                     <th className="text-left p-3 text-slate-400 font-medium">Project</th>
                     <th className="text-left p-3 text-slate-400 font-medium">Category</th>
                     <th className="text-right p-3 text-slate-400 font-medium">Amount</th>
                     <th className="text-right p-3 text-slate-400 font-medium">Actions</th>
                  </tr>
               </thead>
               <tbody>
                  {isLoading ? (
                     <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                           Loading transactions...
                        </td>
                     </tr>
                  ) : filteredTransactions.length > 0 ? (
                     filteredTransactions.map((transaction) => (
                        <tr
                           key={transaction.id}
                           className="border-t border-slate-700 hover:bg-slate-800/50"
                        >
                           <td className="p-3 text-slate-300">
                              {formatDate(transaction.transaction_date)}
                           </td>
                           <td className="p-3 text-white">
                              {transaction.description}
                           </td>
                           <td className="p-3 text-slate-300">
                              {transaction.entity?.name || '-'}
                           </td>
                           <td className="p-3 text-slate-300">
                              {transaction.project?.project_code || transaction.project?.name || '-'}
                           </td>
                           <td className="p-3">
                              <Badge
                                 variant="outline"
                                 className={`$${'{'}
                                    transaction.transaction_type === 'income'
                                       ? 'border-green-500 text-green-400'
                                       : 'border-red-500 text-red-400'
                                 }`}
                              >
                                 {transaction.category}
                              </Badge>
                           </td>
                           <td className={`p-3 text-right font-medium $${'{'}
                              transaction.transaction_type === 'income'
                                 ? 'text-green-400'
                                 : 'text-red-400'
                           }`}>
                              {transaction.transaction_type === 'income' ? '+' : '-'}
                              {formatCurrency(transaction.amount)}
                           </td>
                           <td className="p-3 text-right">
                              <DropdownMenu>
                                 <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                       <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                    </Button>
                                 </DropdownMenuTrigger>
                                 <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                                    <DropdownMenuItem
                                       onClick={() => handleEdit(transaction)}
                                       className="text-slate-200 hover:bg-slate-700"
                                    >
                                       <Edit className="mr-2 h-4 w-4" />
                                       Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                       onClick={() => setDeleteTransaction(transaction)}
                                       className="text-red-400 hover:bg-slate-700"
                                    >
                                       <Trash2 className="mr-2 h-4 w-4" />
                                       Delete
                                    </DropdownMenuItem>
                                 </DropdownMenuContent>
                              </DropdownMenu>
                           </td>
                        </tr>
                     ))
                  ) : (
                     <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                           {searchTerm || filterEntity || filterType
                              ? 'No transactions found matching filters'
                              : 'No transactions yet. Click "Add Transaction" to create one.'}
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>

            {/* Totals Footer */}
            {filteredTransactions.length > 0 && (
               <div className="border-t border-slate-700 bg-slate-800/50 p-3">
                  <div className="flex justify-end gap-8 text-sm">
                     <span className="text-slate-400">
                        Showing {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                     </span>
                     <span className="text-green-400">
                        Income: {formatCurrency(
                           filteredTransactions
                              .filter(t => t.transaction_type === 'income')
                              .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
                        )}
                     </span>
                     <span className="text-red-400">
                        Expenses: {formatCurrency(
                           filteredTransactions
                              .filter(t => t.transaction_type === 'expense')
                              .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
                        )}
                     </span>
                  </div>
               </div>
            )}
         </div>

         {/* Transaction Modal */}
         <TransactionModal
            isOpen={isModalOpen}
            onClose={() => {
               setIsModalOpen(false);
               setEditingTransaction(null);
            }}
            onSubmit={handleSubmit}
            initialData={editingTransaction}
            entities={entities}
            projects={projects}
            contacts={contacts}
            isLoading={createMutation.isPending || updateMutation.isPending}
         />

         {/* Delete Confirmation Dialog */}
         <AlertDialog open={!!deleteTransaction} onOpenChange={() => setDeleteTransaction(null)}>
            <AlertDialogContent className="bg-slate-900 border-slate-700">
               <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Delete Transaction</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-400">
                     Are you sure you want to delete this transaction? This action cannot be undone.
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
                     Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                     onClick={confirmDelete}
                     className="bg-red-600 hover:bg-red-700 text-white"
                  >
                     Delete
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </div>
   );
};

export default TransactionsPage;
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