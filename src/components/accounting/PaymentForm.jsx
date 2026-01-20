import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, CreditCard, Building2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { billService } from '@/services/billService';
import { formatCurrency } from '@/lib/utils';

// Mock bank accounts
const mockBankAccounts = [
  { id: 1, name: 'Chase Operating', last4: '8821', balance: 245000.50 },
  { id: 2, name: 'Chase Payroll', last4: '9912', balance: 55000.00 },
  { id: 3, name: 'Construction High-Yield', last4: '1102', balance: 945000.00 },
];

const paymentMethods = [
  { value: 'check', label: 'Check' },
  { value: 'ach', label: 'ACH / Bank Transfer' },
  { value: 'wire', label: 'Wire Transfer' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'other', label: 'Other' },
];

const PaymentForm = ({ isOpen, onClose, bill, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    bank_account_id: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    method: 'check',
    reference: '',
    memo: '',
  });

  useEffect(() => {
    if (bill) {
      setFormData(prev => ({
        ...prev,
        amount: (bill.balance || bill.amount)?.toString() || '',
      }));
    }
  }, [bill, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.bank_account_id || !formData.date || !formData.amount) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in bank account, date, and amount.',
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    const balance = bill?.balance || bill?.amount || 0;

    if (amount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Payment amount must be greater than zero.',
      });
      return;
    }

    if (amount > balance) {
      toast({
        variant: 'destructive',
        title: 'Amount Exceeds Balance',
        description: `Payment amount cannot exceed the balance of ${formatCurrency(balance)}.`,
      });
      return;
    }

    setLoading(true);
    try {
      await billService.recordPayment(bill.id, {
        bank_account_id: parseInt(formData.bank_account_id),
        date: formData.date,
        amount: amount,
        method: formData.method,
        reference: formData.reference,
        memo: formData.memo,
      });

      toast({
        title: 'Success',
        description: `Payment of ${formatCurrency(amount)} recorded successfully.`,
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to record payment.',
      });
    } finally {
      setLoading(false);
    }
  };

  const balance = bill?.balance || bill?.amount || 0;
  const selectedAccount = mockBankAccounts.find(a => a.id === parseInt(formData.bank_account_id));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>

        {bill && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Bill</span>
              <span className="font-medium">{bill.bill_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Vendor</span>
              <span className="font-medium">{bill.vendor_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Balance Due</span>
              <span className="font-bold text-lg">{formatCurrency(balance)}</span>
            </div>
          </div>
        )}

        <div className="space-y-4 py-4">
          {/* Bank Account */}
          <div className="grid gap-2">
            <Label>Pay From Account *</Label>
            <Select
              value={formData.bank_account_id}
              onValueChange={(value) => handleChange('bank_account_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bank account" />
              </SelectTrigger>
              <SelectContent>
                {mockBankAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    <div className="flex justify-between items-center w-full">
                      <span>{account.name} (•••• {account.last4})</span>
                      <span className="text-gray-500 ml-2">{formatCurrency(account.balance)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedAccount && (
              <p className="text-sm text-gray-500">
                Available balance: {formatCurrency(selectedAccount.balance)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div className="grid gap-2">
              <Label>Payment Date *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
              />
            </div>

            {/* Method */}
            <div className="grid gap-2">
              <Label>Payment Method</Label>
              <Select
                value={formData.method}
                onValueChange={(value) => handleChange('method', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Amount */}
          <div className="grid gap-2">
            <Label>Amount *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="number"
                step="0.01"
                max={balance}
                placeholder="0.00"
                className="pl-9"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
              />
            </div>
            <div className="flex justify-between text-sm">
              <button 
                type="button"
                className="text-emerald-600 hover:underline"
                onClick={() => handleChange('amount', balance.toString())}
              >
                Pay full balance
              </button>
              {formData.amount && parseFloat(formData.amount) < balance && (
                <span className="text-gray-500">
                  Remaining: {formatCurrency(balance - parseFloat(formData.amount))}
                </span>
              )}
            </div>
          </div>

          {/* Reference */}
          <div className="grid gap-2">
            <Label>Reference / Check #</Label>
            <Input
              placeholder="e.g., Check #1042 or ACH ref"
              value={formData.reference}
              onChange={(e) => handleChange('reference', e.target.value)}
            />
          </div>

          {/* Memo */}
          <div className="grid gap-2">
            <Label>Memo</Label>
            <Textarea
              placeholder="Payment notes..."
              value={formData.memo}
              onChange={(e) => handleChange('memo', e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-[#2F855A] hover:bg-[#276749]"
          >
            {loading ? 'Processing...' : 'Record Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentForm;
