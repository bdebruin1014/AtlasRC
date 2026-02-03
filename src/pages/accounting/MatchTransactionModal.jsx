import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, FileText, Receipt } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import * as bankService from '@/services/bankAccountsService';

export function MatchTransactionModal({ open, onClose, transaction, entityId }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [activeTab, setActiveTab] = useState('bills');

  // Fetch unpaid bills
  const { data: bills = [] } = useQuery({
    queryKey: ['unpaid-bills', entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bills')
        .select('*, vendor:vendors(display_name)')
        .eq('entity_id', entityId)
        .in('status', ['pending', 'partial'])
        .order('due_date');
      if (error) throw error;
      return data;
    },
    enabled: open && !!entityId && transaction?.amount < 0
  });

  // Fetch unpaid invoices
  const { data: invoices = [] } = useQuery({
    queryKey: ['unpaid-invoices', entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, customer:customers(display_name)')
        .eq('entity_id', entityId)
        .in('status', ['pending', 'partial'])
        .order('due_date');
      if (error) throw error;
      return data;
    },
    enabled: open && !!entityId && transaction?.amount > 0
  });

  const matchToBillMutation = useMutation({
    mutationFn: () => bankService.matchTransactionToBill(transaction.id, selectedBill.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['bank-transactions']);
      queryClient.invalidateQueries(['unpaid-bills']);
      onClose();
    }
  });

  const matchToInvoiceMutation = useMutation({
    mutationFn: () => bankService.matchTransactionToInvoice(transaction.id, selectedInvoice.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['bank-transactions']);
      queryClient.invalidateQueries(['unpaid-invoices']);
      onClose();
    }
  });

  const handleMatch = () => {
    if (selectedBill) {
      matchToBillMutation.mutate();
    } else if (selectedInvoice) {
      matchToInvoiceMutation.mutate();
    }
  };

  const filteredBills = bills.filter(b =>
    b.vendor?.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.bill_number?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredInvoices = invoices.filter(i =>
    i.customer?.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    i.invoice_number?.toLowerCase().includes(search.toLowerCase())
  );

  const isOutflow = transaction?.amount < 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Match to {isOutflow ? 'Bill' : 'Invoice'}</DialogTitle>
        </DialogHeader>

        {transaction && (
          <div className="bg-muted p-3 rounded-lg mb-4">
            <p className="font-medium">{transaction.description}</p>
            <p className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
              {formatCurrency(Math.abs(transaction.amount))}
            </p>
          </div>
        )}

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${isOutflow ? 'bills' : 'invoices'}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            {isOutflow && <TabsTrigger value="bills">Bills</TabsTrigger>}
            {!isOutflow && <TabsTrigger value="invoices">Invoices</TabsTrigger>}
          </TabsList>

          <TabsContent value="bills" className="max-h-64 overflow-y-auto">
            {filteredBills.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No unpaid bills found</p>
            ) : (
              <div className="space-y-2">
                {filteredBills.map(bill => (
                  <div
                    key={bill.id}
                    onClick={() => setSelectedBill(bill)}
                    className={cn(
                      "p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors",
                      selectedBill?.id === bill.id && "border-primary bg-primary/5"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{bill.vendor?.display_name}</span>
                      </div>
                      <span className="text-red-600 font-medium">
                        {formatCurrency(bill.balance_due || bill.total_amount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>#{bill.bill_number}</span>
                      <span>Due: {formatDate(bill.due_date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="invoices" className="max-h-64 overflow-y-auto">
            {filteredInvoices.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No unpaid invoices found</p>
            ) : (
              <div className="space-y-2">
                {filteredInvoices.map(invoice => (
                  <div
                    key={invoice.id}
                    onClick={() => setSelectedInvoice(invoice)}
                    className={cn(
                      "p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors",
                      selectedInvoice?.id === invoice.id && "border-primary bg-primary/5"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{invoice.customer?.display_name}</span>
                      </div>
                      <span className="text-green-600 font-medium">
                        {formatCurrency(invoice.balance_due || invoice.total_amount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>#{invoice.invoice_number}</span>
                      <span>Due: {formatDate(invoice.due_date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleMatch}
            disabled={(!selectedBill && !selectedInvoice) || matchToBillMutation.isPending || matchToInvoiceMutation.isPending}
          >
            Match
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
