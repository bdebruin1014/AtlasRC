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
                                 className={
                                    transaction.transaction_type === 'income'
                                       ? 'border-green-500 text-green-400'
                                       : 'border-red-500 text-red-400'
                                 }
                              >
                                 {transaction.category}
                              </Badge>
                           </td>
                           <td className={`p-3 text-right font-medium ${
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