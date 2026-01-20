import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Search, Download, RefreshCw, Landmark, Eye, Edit2, Link, ArrowUpRight, ArrowDownRight, CheckCircle, AlertTriangle, X, Upload, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getBankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  getBankTransactions,
  setDefaultBankAccount
} from '@/services/bankAccountService';

const BankingPage = () => {
  const { entityId } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [addMethod, setAddMethod] = useState('manual'); // 'manual' or 'plaid'
  
  const [bankAccounts, setBankAccounts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    if (entityId) {
      loadBankAccounts();
    }
  }, [entityId]);

  const loadBankAccounts = async () => {
    try {
      setLoading(true);
      const accounts = await getBankAccounts(entityId);
      setBankAccounts(accounts || []);
    } catch (error) {
      console.error('Error loading bank accounts:', error);
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
      const transactions = await getBankTransactions(accountId);
      setRecentTransactions(transactions || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  useEffect(() => {
    if (selectedAccount) {
      loadTransactions(selectedAccount.id);
    }
  }, [selectedAccount]);

  const totalBalance = bankAccounts.reduce((sum, acc) => sum + (acc.current_balance || 0), 0);
  const totalBookBalance = bankAccounts.reduce((sum, acc) => sum + (acc.book_balance || 0), 0);

  const [formData, setFormData] = useState({
    name: '',
    bank_name: '',
    account_number_last4: '',
    account_type: 'checking',
    routing_number: '',
    initial_balance: 0,
  });

  const handleAddAccount = async (e) => {
    e.preventDefault();
    
    try {
      const accountData = {
        entity_id: selectedEntity,
        name: formData.name,
        bank_name: formData.bank_name,
        account_number_last4: formData.account_number_last4,
        account_type: formData.account_type,
        routing_number: formData.routing_number || null,
        book_balance: parseFloat(formData.initial_balance) || 0,
        current_balance: parseFloat(formData.initial_balance) || 0,
      };

      await createBankAccount(accountData);
      
      toast({
        title: 'Success',
        description: 'Bank account added successfully',
      });
      
      await loadBankAccounts();
      setShowAddModal(false);
      setFormData({
        name: '',
        bank_name: '',
        account_number_last4: '',
        account_type: 'checking',
        routing_number: '',
        initial_balance: 0,
      });
    } catch (error) {
      console.error('Error adding account:', error);
      toast({
        title: 'Error',
        description: 'Failed to add bank account',
        variant: 'destructive'
      });
    }
  };

  const handlePlaidConnect = () => {
    toast({
      title: 'Plaid Integration',
      description: 'Plaid connection will be available in the next update. For now, you can add accounts manually.',
    });
  };

  const handleImportTransactions = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload a CSV or Excel file',
        variant: 'destructive'
      });
      return;
    }

    // In a real implementation, you would parse the CSV/Excel file here
    toast({
      title: 'Import Started',
      description: `Importing transactions from ${file.name}. This feature will be fully implemented in the next update.`,
    });
    
    setShowImportModal(false);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Banking</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowImportModal(true)}>
            <Upload className="w-4 h-4 mr-1" />Import Transactions
          </Button>
          <Button variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-1" />Sync All</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-1" />Add Account
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Accounts</p>
          <p className="text-xl font-semibold">{bankAccounts.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-sm text-gray-500">Bank Balance</p>
          <p className="text-xl font-semibold">${(totalBalance / 1000000).toFixed(2)}M</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-sm text-gray-500">Book Balance</p>
          <p className="text-xl font-semibold text-green-600">${(totalBookBalance / 1000000).toFixed(2)}M</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-amber-500">
          <p className="text-sm text-gray-500">Difference</p>
          <p className="text-xl font-semibold text-amber-600">${(Math.abs(totalBalance - totalBookBalance) / 1000).toFixed(0)}K</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Accounts List */}
        <div className="col-span-2">
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Bank Accounts</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search accounts..." className="pl-9 w-64" />
              </div>
            </div>
            <div className="divide-y">
              {bankAccounts.map((account) => (
                <div
                  key={account.id}
                  onClick={() => setSelectedAccount(account)}
                  className={cn(
                    "flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors",
                    selectedAccount?.id === account.id && "bg-green-50 border-l-4 border-l-[#047857]"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", account.account_type === 'checking' ? "bg-blue-100" : "bg-green-100")}>
                      <Landmark className={cn("w-5 h-5", account.account_type === 'checking' ? "text-blue-600" : "text-green-600")} />
                    </div>
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-xs text-gray-500">{account.bank_name} • ****{account.account_number_last4}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${(account.current_balance || 0).toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-xs">
                      {account.status === 'active' ? (
                        <><CheckCircle className="w-3 h-3 text-green-500" /><span className="text-gray-500">Active</span></>
                      ) : (
                        <><AlertTriangle className="w-3 h-3 text-amber-500" /><span className="text-amber-600">Needs attention</span></>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Account Details / Recent Activity */}
        <div className="space-y-4">
          {selectedAccount ? (
            <>
              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{selectedAccount.name}</h3>
                  <Button variant="outline" size="sm"><Link className="w-4 h-4 mr-1" />Reconnect</Button>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Bank</span><span>{selectedAccount.bank_name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Account</span><span className="font-mono">****{selectedAccount.account_number_last4}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="capitalize">{selectedAccount.account_type}</span></div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between"><span className="text-gray-500">Bank Balance</span><span className="font-semibold">${(selectedAccount.current_balance || 0).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Book Balance</span><span className="text-green-600">${(selectedAccount.book_balance || 0).toLocaleString()}</span></div>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-lg">
                <div className="p-4 border-b">
                  <h3 className="font-semibold">Recent Transactions</h3>
                </div>
                <div className="max-h-96 overflow-y-auto divide-y">
                  {recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", tx.amount > 0 ? "bg-green-100" : "bg-red-100")}>
                          {tx.amount > 0 ? <ArrowDownRight className="w-4 h-4 text-green-600" /> : <ArrowUpRight className="w-4 h-4 text-red-600" />}
                        </div>
                        <div>
                          <p className="text-sm">{tx.description}</p>
                          <p className="text-xs text-gray-500">{tx.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn("font-medium text-sm", tx.amount > 0 ? "text-green-600" : "text-gray-900")}>
                          {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toLocaleString()}
                        </p>
                        <span className={cn("text-xs px-1.5 py-0.5 rounded", tx.status === 'cleared' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white border rounded-lg p-12 text-center">
              <Landmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select an account to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Add Bank Account</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5" /></button>
            </div>
            
            <Tabs defaultValue="manual" className="w-full">
              <div className="border-b px-4">
                <TabsList>
                  <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                  <TabsTrigger value="plaid">Connect with Plaid</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="manual" className="p-6 space-y-4">
                <div>
                  <Label>Account Name *</Label>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} 
                    placeholder="e.g., Operating Account" 
                  />
                </div>
                <div>
                  <Label>Bank Name *</Label>
                  <Input 
                    value={formData.bank_name} 
                    onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))} 
                    placeholder="e.g., Chase Bank" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Account Number (last 4)</Label>
                    <Input 
                      value={formData.account_number_last4} 
                      onChange={(e) => setFormData(prev => ({ ...prev, account_number_last4: e.target.value }))} 
                      placeholder="1234"
                      maxLength={4}
                    />
                  </div>
                  <div>
                    <Label>Routing Number</Label>
                    <Input 
                      value={formData.routing_number} 
                      onChange={(e) => setFormData(prev => ({ ...prev, routing_number: e.target.value }))} 
                      placeholder="021000021"
                      maxLength={9}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Account Type *</Label>
                    <Select value={formData.account_type} onValueChange={(value) => setFormData(prev => ({ ...prev, account_type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Checking</SelectItem>
                        <SelectItem value="savings">Savings</SelectItem>
                        <SelectItem value="money_market">Money Market</SelectItem>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Initial Balance</Label>
                    <Input 
                      type="number" 
                      step="0.01"
                      value={formData.initial_balance} 
                      onChange={(e) => setFormData(prev => ({ ...prev, initial_balance: e.target.value }))} 
                      placeholder="0.00" 
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="plaid" className="p-6">
                <div className="text-center py-12">
                  <Landmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="font-semibold mb-2">Connect your bank account</h4>
                  <p className="text-sm text-gray-500 mb-6">Securely link your bank account using Plaid to automatically import transactions</p>
                  <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handlePlaidConnect}>
                    <Link className="w-4 h-4 mr-2" />
                    Connect with Plaid
                  </Button>
                  <p className="text-xs text-gray-400 mt-4">This feature will be available soon</p>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleAddAccount}>Add Account</Button>
            </div>
          </div>
        </div>
      )}

      {/* Import Transactions Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Import Transactions</h3>
              <button onClick={() => setShowImportModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label>Select Bank Account *</Label>
                <Select value={selectedAccount?.id} onValueChange={(value) => setSelectedAccount(bankAccounts.find(a => a.id === value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose account..." />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} - {account.bank_name} ****{account.account_number_last4}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Upload File (CSV or Excel) *</Label>
                <Input 
                  type="file" 
                  accept=".csv,.xlsx,.xls"
                  onChange={handleImportTransactions}
                  className="cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">Supported formats: CSV, XLSX, XLS</p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-3 text-sm">
                <p className="font-medium text-blue-900 mb-2">File Format Requirements:</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Column headers: Date, Description, Amount, Type (debit/credit)</li>
                  <li>• Date format: MM/DD/YYYY or YYYY-MM-DD</li>
                  <li>• Amount format: Numbers only (e.g., 1234.56)</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setShowImportModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" disabled>Import</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankingPage;
