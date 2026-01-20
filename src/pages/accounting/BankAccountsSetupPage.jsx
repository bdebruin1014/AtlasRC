import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CreditCard, Plus, Link as LinkIcon, ArrowLeft, CheckCircle2, AlertTriangle,
  Edit2, Trash2, Star, MoreVertical, Building2, Landmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  getBankAccounts,
  createBankAccount,
  deleteBankAccount,
  setDefaultBankAccount
} from '@/services/bankAccountService';

const BankAccountsSetupPage = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bank_name: '',
    account_number_last4: '',
    routing_number: '',
    account_type: 'checking',
    initial_balance: 0
  });

  useEffect(() => {
    loadBankAccounts();
  }, [entityId]);

  const loadBankAccounts = async () => {
    try {
      setLoading(true);
      const accounts = await getBankAccounts(entityId);
      setBankAccounts(accounts || []);
    } catch (error) {
      console.error('Error loading bank accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async () => {
    try {
      await createBankAccount({
        entity_id: entityId,
        ...formData
      });
      toast({
        title: 'Bank Account Added',
        description: `${formData.name} has been added successfully.`
      });
      setShowAddModal(false);
      setFormData({
        name: '',
        bank_name: '',
        account_number_last4: '',
        routing_number: '',
        account_type: 'checking',
        initial_balance: 0
      });
      loadBankAccounts();
    } catch (error) {
      console.error('Error adding account:', error);
      toast({
        title: 'Error',
        description: 'Failed to add bank account',
        variant: 'destructive'
      });
    }
  };

  const handleSetDefault = async (accountId) => {
    try {
      await setDefaultBankAccount(entityId, accountId);
      toast({
        title: 'Default Account Updated',
        description: 'Default bank account has been updated.'
      });
      loadBankAccounts();
    } catch (error) {
      console.error('Error setting default:', error);
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (!confirm('Are you sure you want to delete this bank account? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteBankAccount(accountId);
      toast({
        title: 'Account Deleted',
        description: 'Bank account has been removed.'
      });
      loadBankAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete bank account',
        variant: 'destructive'
      });
    }
  };

  const handlePlaidConnect = () => {
    toast({
      title: 'Plaid Integration',
      description: 'Plaid bank connection will be available soon.',
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/accounting/${entityId}/settings`)}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Settings
            </Button>
          </div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-green-600" />
            Bank Accounts Setup
          </h1>
          <p className="text-gray-500 mt-1">
            Add and manage bank accounts for this entity
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Bank Account
        </Button>
      </div>

      {/* Bank Accounts List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : bankAccounts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Landmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Bank Accounts</h3>
            <p className="text-gray-500 mb-6">
              Get started by adding your first bank account for this entity
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bankAccounts.map((account) => (
            <Card key={account.id} className={cn(
              "hover:shadow-lg transition-shadow",
              account.is_default && "border-2 border-blue-500"
            )}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={cn(
                      "w-14 h-14 rounded-lg flex items-center justify-center",
                      account.account_type === 'checking' ? "bg-blue-100" : 
                      account.account_type === 'savings' ? "bg-green-100" :
                      account.account_type === 'credit_card' ? "bg-purple-100" :
                      "bg-gray-100"
                    )}>
                      <Landmark className={cn(
                        "w-7 h-7",
                        account.account_type === 'checking' ? "text-blue-600" :
                        account.account_type === 'savings' ? "text-green-600" :
                        account.account_type === 'credit_card' ? "text-purple-600" :
                        "text-gray-600"
                      )} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{account.name}</h3>
                        {account.is_default && (
                          <Badge variant="default" className="bg-blue-600">
                            <Star className="w-3 h-3 mr-1" />
                            Default
                          </Badge>
                        )}
                        {account.status === 'active' ? (
                          <Badge variant="success">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="warning">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Needs Attention
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {account.bank_name}
                        </span>
                        <span className="font-mono">****{account.account_number_last4}</span>
                        <span className="capitalize">{account.account_type.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Current Balance</p>
                      <p className="text-2xl font-bold">${(account.current_balance || 0).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {!account.is_default && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(account.id)}
                        >
                          Set as Default
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteAccount(account.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b">
              <CardTitle>Add Bank Account</CardTitle>
              <CardDescription>
                Connect a bank account or enter manually
              </CardDescription>
            </CardHeader>
            
            <Tabs defaultValue="manual" className="w-full">
              <div className="border-b px-6">
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
                    <Label>Account Number (last 4 digits) *</Label>
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
                        <SelectValue />
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
                      onChange={(e) => setFormData(prev => ({ ...prev, initial_balance: parseFloat(e.target.value) }))} 
                      placeholder="0.00" 
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="plaid" className="p-6">
                <div className="text-center py-12">
                  <Landmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="font-semibold mb-2">Connect your bank account</h4>
                  <p className="text-sm text-gray-500 mb-6">
                    Securely link your bank account using Plaid to automatically import transactions
                  </p>
                  <Button onClick={handlePlaidConnect}>
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Connect with Plaid
                  </Button>
                  <p className="text-xs text-gray-400 mt-4">This feature will be available soon</p>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end gap-2 p-6 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button onClick={handleAddAccount} disabled={!formData.name || !formData.bank_name}>
                Add Account
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BankAccountsSetupPage;
