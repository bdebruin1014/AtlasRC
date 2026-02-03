import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Wallet, Building2, CreditCard, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

// Demo accounts for fallback
const demoAccounts = [
  { id: 'acc-1', account_name: 'Operating Account', bank_name: 'Chase Bank', account_number_last4: '4521', account_type: 'checking', current_balance: 485000, last_reconciled: '2024-12-15', needs_reconciliation: false },
  { id: 'acc-2', account_name: 'Payroll Account', bank_name: 'Chase Bank', account_number_last4: '7832', account_type: 'checking', current_balance: 125000, last_reconciled: '2024-12-20', needs_reconciliation: false },
  { id: 'acc-3', account_name: 'Construction Account', bank_name: 'First National', account_number_last4: '7891', account_type: 'checking', current_balance: 1850000, last_reconciled: '2024-11-30', needs_reconciliation: true },
  { id: 'acc-4', account_name: 'Savings Reserve', bank_name: 'Bank of America', account_number_last4: '9012', account_type: 'savings', current_balance: 250000, last_reconciled: '2024-12-10', needs_reconciliation: false },
];

const ACCOUNT_TYPE_ICONS = {
  checking: Wallet,
  savings: Building2,
  money_market: Building2,
  credit_card: CreditCard,
};

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

export default function SelectAccountModal({ open, onClose, onSelect, entityId, title, description }) {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: accounts = demoAccounts, isLoading } = useQuery({
    queryKey: ['bank-accounts', entityId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('bank_accounts')
          .select('*')
          .eq('entity_id', entityId)
          .order('account_name');

        if (data && !error) return data;
      } catch (err) {
        console.error('Error fetching accounts:', err);
      }
      return demoAccounts;
    },
    enabled: open && !!entityId
  });

  const filteredAccounts = accounts.filter(account => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      account.account_name?.toLowerCase().includes(term) ||
      account.bank_name?.toLowerCase().includes(term)
    );
  });

  const handleSelect = (account) => {
    onSelect(account.id);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title || 'Select Account'}</DialogTitle>
          <DialogDescription>
            {description || 'Choose a bank account to continue'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredAccounts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Wallet className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No accounts found</p>
              </div>
            ) : (
              filteredAccounts.map(account => {
                const Icon = ACCOUNT_TYPE_ICONS[account.account_type] || Wallet;
                const needsReconciliation = account.needs_reconciliation ||
                  (account.last_reconciled && new Date(account.last_reconciled) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

                return (
                  <button
                    key={account.id}
                    onClick={() => handleSelect(account)}
                    className="w-full p-3 border rounded-lg hover:bg-muted/50 hover:border-primary transition-colors text-left flex items-center gap-3"
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      account.account_type === 'credit_card' ? 'bg-purple-100' : 'bg-blue-100'
                    )}>
                      <Icon className={cn(
                        "h-5 w-5",
                        account.account_type === 'credit_card' ? 'text-purple-600' : 'text-blue-600'
                      )} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{account.account_name}</p>
                        {needsReconciliation ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {account.bank_name} {account.account_number_last4 && `•••• ${account.account_number_last4}`}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="font-medium">{formatCurrency(account.current_balance)}</p>
                      {account.last_reconciled && (
                        <p className="text-xs text-muted-foreground">
                          Reconciled: {new Date(account.last_reconciled).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
