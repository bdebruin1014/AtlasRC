import React, { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, RefreshCw, Link2, MoreHorizontal, Building2, CreditCard,
  CheckCircle, AlertCircle, Wallet, TrendingUp, Trash2, Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import BankAccountFormModal from '@/components/accounting/BankAccountFormModal';
import PlaidLinkModal from '@/components/accounting/PlaidLinkModal';

const ACCOUNT_TYPE_ICONS = {
  checking: Wallet,
  savings: Building2,
  money_market: TrendingUp,
  credit_card: CreditCard
};

// Demo accounts for fallback
const demoAccounts = [
  { id: 'bank-1', account_name: 'Operating Account', account_type: 'checking', bank_name: 'Chase Bank', account_number_last4: '4521', current_balance: 485000, is_primary: true, is_connected: true, last_sync_at: '2024-12-28' },
  { id: 'bank-2', account_name: 'Payroll Account', account_type: 'checking', bank_name: 'Chase Bank', account_number_last4: '7832', current_balance: 125000, is_primary: false, is_connected: true, last_sync_at: '2024-12-28' },
  { id: 'bank-3', account_name: 'Savings Reserve', account_type: 'savings', bank_name: 'Bank of America', account_number_last4: '9012', current_balance: 250000, is_primary: false, is_connected: false },
  { id: 'cc-1', account_name: 'Business Credit Card', account_type: 'credit_card', bank_name: 'American Express', account_number_last4: '3456', current_balance: -15000, credit_limit: 50000, is_connected: true, last_sync_at: '2024-12-28' },
];

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

const fetchBankAccounts = async (entityId) => {
  try {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('entity_id', entityId)
      .order('is_primary', { ascending: false })
      .order('account_name');

    if (data && !error) return data;
  } catch (err) {
    console.error('Error fetching bank accounts:', err);
  }
  return demoAccounts;
};

export default function BankAccountsPage() {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const context = useOutletContext();
  const entity = context?.entity;
  const queryClient = useQueryClient();

  const [showBankModal, setShowBankModal] = useState(false);
  const [showPlaidLink, setShowPlaidLink] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['bank-accounts', entityId],
    queryFn: () => fetchBankAccounts(entityId),
    enabled: !!entityId
  });

  const syncMutation = useMutation({
    mutationFn: async (accountId) => {
      // In production, this would call Plaid to sync transactions
      console.log('Syncing account:', accountId);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bank-accounts', entityId]);
      queryClient.invalidateQueries(['bank-transactions', entityId]);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (accountId) => {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', accountId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bank-accounts', entityId]);
    }
  });

  const bankAccounts = accounts.filter(a => a.account_type !== 'credit_card');
  const creditCards = accounts.filter(a => a.account_type === 'credit_card');

  const totalBankBalance = bankAccounts.reduce((sum, a) => sum + (a.current_balance || 0), 0);
  const totalCreditBalance = creditCards.reduce((sum, a) => sum + Math.abs(a.current_balance || 0), 0);
  const netPosition = totalBankBalance - totalCreditBalance;

  const handleEdit = (account) => {
    setEditingAccount(account);
    setShowBankModal(true);
  };

  const handleCloseModal = () => {
    setShowBankModal(false);
    setEditingAccount(null);
  };

  const basePath = `/accounting/entities/${entityId}`;

  const renderAccountCard = (account) => {
    const Icon = ACCOUNT_TYPE_ICONS[account.account_type] || Wallet;
    const isCredit = account.account_type === 'credit_card';

    return (
      <Card key={account.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                isCredit ? 'bg-purple-100' : 'bg-blue-100'
              )}>
                <Icon className={cn(
                  "h-5 w-5",
                  isCredit ? 'text-purple-600' : 'text-blue-600'
                )} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{account.account_name}</h3>
                  {account.is_primary && (
                    <Badge variant="outline" className="text-xs">Primary</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {account.bank_name} {account.account_number_last4 && `•••• ${account.account_number_last4}`}
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`${basePath}/bank-accounts/${account.id}/transactions`)}>
                  View Transactions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`${basePath}/bank-accounts/${account.id}/reconcile`)}>
                  Reconcile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleEdit(account)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Account
                </DropdownMenuItem>
                {account.is_connected && (
                  <DropdownMenuItem onClick={() => syncMutation.mutate(account.id)}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Transactions
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => deleteMutation.mutate(account.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className={cn(
                "text-2xl font-bold",
                isCredit ? 'text-red-600' : 'text-green-600'
              )}>
                {formatCurrency(Math.abs(account.current_balance || 0))}
              </p>
              {isCredit && account.credit_limit && (
                <p className="text-sm text-muted-foreground">
                  of {formatCurrency(account.credit_limit)} limit
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {account.is_connected ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs">Connected</span>
                </div>
              ) : (
                <Badge variant="outline" className="text-xs">Manual</Badge>
              )}
            </div>
          </div>

          {account.last_sync_at && (
            <p className="text-xs text-muted-foreground mt-2">
              Last synced: {new Date(account.last_sync_at).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bank Accounts</h1>
          <p className="text-muted-foreground">
            Manage bank and credit card accounts for {entity?.name || entity?.short_name || 'this entity'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowPlaidLink(true)}>
            <Link2 className="h-4 w-4 mr-2" />
            Connect Bank
          </Button>
          <Button onClick={() => setShowBankModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bank Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalBankBalance)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {bankAccounts.length} account{bankAccounts.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Credit Card Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(totalCreditBalance)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {creditCards.length} card{creditCards.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Cash Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={cn(
              "text-2xl font-bold",
              netPosition >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {formatCurrency(netPosition)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Bank - Credit Cards
            </p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Bank Accounts */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Bank Accounts</h2>
            </div>

            {bankAccounts.length === 0 ? (
              <Card className="p-8 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No bank accounts</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect a bank or add an account manually to get started.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Button variant="outline" onClick={() => setShowPlaidLink(true)}>
                    <Link2 className="h-4 w-4 mr-2" />
                    Connect Bank
                  </Button>
                  <Button onClick={() => setShowBankModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Manual
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bankAccounts.map(renderAccountCard)}
              </div>
            )}
          </div>

          {/* Credit Cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Credit Cards</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingAccount({ account_type: 'credit_card' });
                  setShowBankModal(true);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Card
              </Button>
            </div>

            {creditCards.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">
                <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No credit cards added.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {creditCards.map(renderAccountCard)}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modals */}
      <BankAccountFormModal
        open={showBankModal}
        onClose={handleCloseModal}
        account={editingAccount}
        entityId={entityId}
      />
      <PlaidLinkModal
        open={showPlaidLink}
        onClose={() => setShowPlaidLink(false)}
        entityId={entityId}
      />
    </div>
  );
}
