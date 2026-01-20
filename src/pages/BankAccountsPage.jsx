import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  ArrowLeft, Building2, Plus, MoreVertical, 
  Search, Download, Upload, RefreshCw, CheckCircle2, 
  AlertCircle, History, Edit2, Trash2, ArrowRightLeft,
  TrendingUp, Wallet, FileText, CreditCard, MoreHorizontal, Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { 
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, 
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useToast } from '@/components/ui/use-toast';
import { 
  getBankAccounts, 
  getBankTransactions, 
  createBankAccount, 
  updateBankAccount, 
  deleteBankAccount, 
  setDefaultBankAccount,
  getAccountBalances 
} from '@/services/bankAccountService';

const formatCurrency = (val) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

const formatDate = (dateStr) => 
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const BankAccountsPage = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [balances, setBalances] = useState({ total_book_balance: 0, total_current_balance: 0 });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  
  const [registerSearch, setRegisterSearch] = useState('');

  useEffect(() => {
    loadAccounts();
  }, [entityId]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const [accountsData, balancesData] = await Promise.all([
        getBankAccounts(entityId),
        getAccountBalances(entityId)
      ]);
      setAccounts(accountsData || []);
      setBalances(balancesData || { total_book_balance: 0, total_current_balance: 0 });
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bank accounts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (accountId) => {
    try {
      const data = await getBankTransactions(accountId);
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transactions',
        variant: 'destructive'
      });
    }
  };

  const totalBookBalance = balances.total_book_balance;
  const totalClearedBalance = balances.total_current_balance;

  const handleOpenRegister = async (account) => {
    setSelectedAccount(account);
    await loadTransactions(account.id);
    setViewMode('register');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedAccount(null);
  };

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleCreateAccount = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultBankAccount(entityId, id);
      await loadAccounts();
      toast({ title: "Default Updated", description: "Default bank account has been updated." });
    } catch (error) {
      console.error('Error setting default:', error);
      toast({ 
        title: "Error", 
        description: "Failed to set default account", 
        variant: "destructive" 
      });
    }
  };

  const handleDeleteAccount = async (id) => {
    if (!confirm('Are you sure you want to delete this bank account?')) return;
    
    try {
      await deleteBankAccount(id);
      await loadAccounts();
      toast({ title: "Account Deleted", description: "Bank account has been removed." });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({ 
        title: "Error", 
        description: "Failed to delete account", 
        variant: "destructive" 
      });
    }
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const accountData = {
        entity_id: entityId,
        name: formData.get('name'),
        bank_name: formData.get('bankName'),
        account_number_last4: formData.get('accountNumber'),
        account_type: formData.get('accountType'),
        routing_number: formData.get('routingNumber'),
      };

      if (editingAccount) {
        await updateBankAccount(editingAccount.id, accountData);
        toast({ title: "Account Updated", description: "Bank account details have been updated." });
      } else {
        await createBankAccount(accountData);
        toast({ title: "Account Created", description: "New bank account has been added." });
      }
      
      setIsModalOpen(false);
      await loadAccounts();
    } catch (error) {
      console.error('Error saving account:', error);
      toast({ 
        title: "Error", 
        description: "Failed to save account", 
        variant: "destructive" 
      });
    }
  };

  const AccountModal = () => (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingAccount ? 'Edit Bank Account' : 'Add Bank Account'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSaveAccount} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
             <label className="text-right text-sm font-medium">Bank Name</label>
             <Input name="bankName" className="col-span-3" placeholder="e.g. Chase Bank" defaultValue={editingAccount?.bank_name} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
             <label className="text-right text-sm font-medium">Account Name</label>
             <Input name="name" className="col-span-3" placeholder="e.g. Operating Account" defaultValue={editingAccount?.name} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
             <label className="text-right text-sm font-medium">Account Type</label>
             <Select name="accountType" defaultValue={editingAccount?.account_type || "checking"}>
                <SelectTrigger className="col-span-3">
                   <SelectValue />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="checking">Checking</SelectItem>
                   <SelectItem value="savings">Savings</SelectItem>
                   <SelectItem value="credit_card">Credit Card</SelectItem>
                   <SelectItem value="trust">Trust Account</SelectItem>
                </SelectContent>
             </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
             <label className="text-right text-sm font-medium">Account #</label>
             <Input name="accountNumber" className="col-span-3" placeholder="Last 4 digits" defaultValue={editingAccount?.account_number_last4} />
          </div>
          {!editingAccount && (
            <div className="grid grid-cols-4 items-center gap-4">
               <label className="text-right text-sm font-medium">Initial Balance</label>
               <Input className="col-span-3" type="number" placeholder="0.00" />
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">{editingAccount ? 'Save Changes' : 'Add Account'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <Helmet>
        <title>Banking & Cash | AtlasDev</title>
      </Helmet>

      <div className="flex flex-col h-full w-full bg-[#F7FAFC] overflow-hidden">
        
        <div className="bg-white border-b border-gray-200 px-6 py-5 shrink-0">
           <div className="max-w-[1600px] mx-auto">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <Button 
                       variant="ghost" 
                       size="sm" 
                       onClick={() => viewMode === 'register' ? handleBackToList() : navigate(`/accounting/entity/${entityId}/dashboard`)}
                       className="text-gray-500 hover:text-gray-900 -ml-2"
                    >
                       <ArrowLeft className="w-4 h-4 mr-1" /> 
                       {viewMode === 'register' ? 'Back to Accounts' : 'Back to Dashboard'}
                    </Button>
                 </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                       <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                       <h1 className="text-2xl font-bold text-gray-900 leading-none">
                          {viewMode === 'register' ? selectedAccount?.name : 'Bank Accounts'}
                       </h1>
                       <p className="text-sm text-gray-500 mt-1">
                          {viewMode === 'register' 
                             ? `${selectedAccount?.bank_name} • ...${selectedAccount?.account_number_last4}`
                             : 'Manage your banking relationships and cash flow'
                          }
                       </p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    {viewMode === 'list' ? (
                       <>
                          <Button variant="outline" className="text-gray-600">
                             <RefreshCw className="w-4 h-4 mr-2" /> Sync Feeds
                          </Button>
                          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleCreateAccount}>
                             <Plus className="w-4 h-4 mr-2" /> Add Account
                          </Button>
                       </>
                    ) : (
                       <>
                          <Button variant="outline" className="text-gray-600">
                             <Download className="w-4 h-4 mr-2" /> Export
                          </Button>
                          <Button variant="outline" className="text-gray-600">
                             <Upload className="w-4 h-4 mr-2" /> Import
                          </Button>
                          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => navigate(`/accounting/entity/${entityId}/reconciliation`)}>
                             <CheckCircle2 className="w-4 h-4 mr-2" /> Reconcile
                          </Button>
                       </>
                    )}
                 </div>
              </div>
           </div>
        </div>

        {/* --- Main Content --- */}
        <div className="flex-1 overflow-y-auto p-6">
           <div className="max-w-[1600px] mx-auto">
              
              {/* LIST VIEW */}
              {viewMode === 'list' && (
                 <div className="space-y-6 animate-in fade-in duration-300">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Book Balance</p>
                          <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalBookBalance)}</h3>
                          <div className="flex items-center mt-2 text-xs text-emerald-600">
                             <TrendingUp className="w-3 h-3 mr-1" /> +2.5% from last month
                          </div>
                       </div>
                       <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Cleared Balance</p>
                          <h3 className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(totalClearedBalance)}</h3>
                          <p className="text-xs text-gray-400 mt-2">Confirmed by bank feeds</p>
                       </div>
                       <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unreconciled Items</p>
                          <h3 className="text-2xl font-bold text-amber-600 mt-1">14</h3>
                          <p className="text-xs text-gray-400 mt-2">Requires attention</p>
                       </div>
                    </div>

                    {/* Accounts Grid */}
                    <div className="grid grid-cols-1 gap-4">
                       {accounts.map((account) => (
                          <div key={account.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                             <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                {/* Account Info */}
                                <div className="flex items-start gap-4">
                                   <div className={cn(
                                     "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                                     account.account_type === 'credit_card' ? "bg-purple-50 text-purple-600 group-hover:bg-purple-100" : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                                   )}>
                                      {account.account_type === 'credit_card' ? <CreditCard className="w-6 h-6" /> : <Wallet className="w-6 h-6" />}
                                   </div>
                                   <div>
                                      <div className="flex items-center gap-2">
                                         <h3 
                                            className="text-lg font-bold text-gray-900 cursor-pointer hover:text-blue-600"
                                            onClick={() => handleOpenRegister(account)}
                                         >
                                            {account.name}
                                         </h3>
                                         {account.is_default && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-gray-100 text-gray-600 border border-gray-200">Default</Badge>}
                                      </div>
                                      <p className="text-sm text-gray-500">{account.bank_name} • ...{account.account_number_last4} • {account.account_type}</p>
                                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                         <span className="flex items-center">
                                            <History className="w-3 h-3 mr-1" /> Last Reconciled: {account.last_reconciled_at ? formatDate(account.last_reconciled_at) : 'Never'}
                                         </span>
                                         <span className={cn("flex items-center", account.status === 'active' ? "text-emerald-600" : "text-gray-400")}>
                                            <CheckCircle2 className="w-3 h-3 mr-1" /> {account.status}
                                         </span>
                                      </div>
                                   </div>
                                </div>

                                {/* Balances */}
                                <div className="flex items-center gap-8 md:border-l md:border-gray-100 md:pl-8">
                                   <div className="text-right">
                                      <p className="text-xs text-gray-400 font-medium uppercase mb-1">Bank Balance</p>
                                      <p className={cn("text-xl font-bold font-mono", account.current_balance < 0 ? "text-red-600" : "text-gray-900")}>
                                        {formatCurrency(account.current_balance)}
                                      </p>
                                   </div>
                                   <div className="text-right">
                                      <p className="text-xs text-gray-400 font-medium uppercase mb-1">Book Balance</p>
                                      <p className={cn("text-xl font-bold font-mono", account.book_balance < 0 ? "text-red-600" : "text-gray-900")}>
                                        {formatCurrency(account.book_balance)}
                                      </p>
                                   </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 md:ml-4">
                                   <Button variant="outline" onClick={() => handleOpenRegister(account)}>
                                      View Register
                                   </Button>
                                   <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                         <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="w-4 h-4 text-gray-400" />
                                         </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-48">
                                         <DropdownMenuLabel>Account Actions</DropdownMenuLabel>
                                         <DropdownMenuSeparator />
                                         <DropdownMenuItem onClick={() => handleEditAccount(account)}>
                                            <Edit2 className="w-4 h-4 mr-2" /> Edit Details
                                         </DropdownMenuItem>
                                         <DropdownMenuItem onClick={() => handleSetDefault(account.id)} disabled={account.is_default}>
                                            <CheckCircle2 className="w-4 h-4 mr-2" /> Set as Default
                                         </DropdownMenuItem>
                                         <DropdownMenuItem onClick={() => navigate(`/accounting/entity/${entityId}/reconciliation`)}>
                                            <History className="w-4 h-4 mr-2" /> Recon History
                                         </DropdownMenuItem>
                                         <DropdownMenuSeparator />
                                         <DropdownMenuItem 
                                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                            onClick={() => handleDeleteAccount(account.id)}
                                         >
                                            <Trash2 className="w-4 h-4 mr-2" /> Deactivate
                                         </DropdownMenuItem>
                                      </DropdownMenuContent>
                                   </DropdownMenu>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              )}

              {/* REGISTER VIEW */}
              {viewMode === 'register' && selectedAccount && (
                 <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                    
                    {/* Toolbar */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
                       <div className="relative w-full sm:w-96">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                             type="text" 
                             placeholder="Search transactions..." 
                             value={registerSearch}
                             onChange={(e) => setRegisterSearch(e.target.value)}
                             className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                       </div>
                       <div className="flex gap-2 w-full sm:w-auto">
                          <Select defaultValue="All">
                             <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Status" />
                             </SelectTrigger>
                             <SelectContent>
                                <SelectItem value="All">All Status</SelectItem>
                                <SelectItem value="Cleared">Cleared</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Reconciled">Reconciled</SelectItem>
                             </SelectContent>
                          </Select>
                          <Select defaultValue="30">
                             <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Date Range" />
                             </SelectTrigger>
                             <SelectContent>
                                <SelectItem value="30">Last 30 Days</SelectItem>
                                <SelectItem value="60">Last 60 Days</SelectItem>
                                <SelectItem value="90">Last 90 Days</SelectItem>
                                <SelectItem value="Year">This Year</SelectItem>
                             </SelectContent>
                          </Select>
                       </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                       <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                             <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                                <tr>
                                   <th className="px-6 py-3 font-bold w-[120px]">Date</th>
                                   <th className="px-6 py-3 font-bold w-[140px]">Type / Ref</th>
                                   <th className="px-6 py-3 font-bold">Payee / Description</th>
                                   <th className="px-6 py-3 font-bold w-[120px]">Status</th>
                                   <th className="px-6 py-3 font-bold text-right w-[140px]">Payment</th>
                                   <th className="px-6 py-3 font-bold text-right w-[140px]">Deposit</th>
                                   <th className="px-6 py-3 font-bold text-right w-[140px]">Balance</th>
                                   <th className="px-6 py-3 text-center w-[60px]"><MoreVertical className="w-4 h-4 mx-auto opacity-50" /></th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-100">
                                {MOCK_TRANSACTIONS.map((tx) => (
                                   <tr key={tx.id} className="hover:bg-gray-50 group transition-colors">
                                      <td className="px-6 py-3 font-medium text-gray-900 whitespace-nowrap">{formatDate(tx.date)}</td>
                                      <td className="px-6 py-3">
                                         <div className="flex flex-col">
                                            <span className="text-gray-900 font-medium">{tx.type}</span>
                                            <span className="text-xs text-gray-500">{tx.reference}</span>
                                         </div>
                                      </td>
                                      <td className="px-6 py-3">
                                         <div className="flex flex-col">
                                            <span className="text-gray-900 font-medium">{tx.payee}</span>
                                            <span className="text-xs text-gray-500 italic truncate max-w-[250px]">{tx.memo}</span>
                                         </div>
                                      </td>
                                      <td className="px-6 py-3">
                                         <Badge variant="outline" className={cn(
                                            "text-[10px] font-normal",
                                            tx.status === 'Cleared' ? "bg-blue-50 text-blue-700 border-blue-200" : 
                                            tx.status === 'Reconciled' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                            "bg-gray-100 text-gray-600 border-gray-200"
                                         )}>
                                            {tx.status === 'Reconciled' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                            {tx.status}
                                         </Badge>
                                      </td>
                                      <td className="px-6 py-3 text-right font-mono text-gray-900">
                                         {tx.amount < 0 ? formatCurrency(Math.abs(tx.amount)) : '-'}
                                      </td>
                                      <td className="px-6 py-3 text-right font-mono text-emerald-600 font-medium">
                                         {tx.amount > 0 ? formatCurrency(tx.amount) : '-'}
                                      </td>
                                      <td className="px-6 py-3 text-right font-mono text-gray-500">
                                         {formatCurrency(tx.balance)}
                                      </td>
                                      <td className="px-6 py-3 text-center">
                                         <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Edit2 className="w-3 h-3 text-gray-400" />
                                         </Button>
                                      </td>
                                   </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                       <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-center">
                          <Button variant="ghost" size="sm" className="text-gray-500">Load More Transactions</Button>
                       </div>
                    </div>
                 </div>
              )}

           </div>
        </div>

        <AccountModal />

      </div>
    </>
  );
};

export default BankAccountsPage;