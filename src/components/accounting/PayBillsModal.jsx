import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DollarSign, CreditCard, Loader2, CheckCircle, Search, Calendar,
  Building2, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

// Demo unpaid bills for fallback
const demoUnpaidBills = [
  { id: 'bill-1', bill_number: 'BILL-2024-001', vendor_name: 'ABC Supplies', total_amount: 5000, amount_paid: 0, balance_due: 5000, due_date: '2025-02-10', status: 'pending' },
  { id: 'bill-2', bill_number: 'BILL-2024-002', vendor_name: 'Construction Materials Co', total_amount: 12500, amount_paid: 0, balance_due: 12500, due_date: '2025-02-05', status: 'pending' },
  { id: 'bill-3', bill_number: 'BILL-2024-003', vendor_name: 'Equipment Rental LLC', total_amount: 3200, amount_paid: 1000, balance_due: 2200, due_date: '2025-01-28', status: 'overdue' },
  { id: 'bill-4', bill_number: 'BILL-2024-004', vendor_name: 'City Utilities', total_amount: 850, amount_paid: 0, balance_due: 850, due_date: '2025-02-15', status: 'pending' },
  { id: 'bill-5', bill_number: 'BILL-2024-005', vendor_name: 'Insurance Partners', total_amount: 4500, amount_paid: 0, balance_due: 4500, due_date: '2025-01-20', status: 'overdue' },
];

const PAYMENT_METHODS = [
  { value: 'check', label: 'Check' },
  { value: 'ach', label: 'ACH Transfer' },
  { value: 'wire', label: 'Wire Transfer' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'cash', label: 'Cash' },
];

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val || 0);

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function PayBillsModal({ open, onClose, entityId }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1); // 1: select bills, 2: payment details, 3: confirm
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBills, setSelectedBills] = useState({});
  const [paymentData, setPaymentData] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: '',
    payment_account: '',
    reference_number: '',
    memo: '',
  });
  const [errors, setErrors] = useState({});

  const { data: unpaidBills = demoUnpaidBills, isLoading: loadingBills } = useQuery({
    queryKey: ['unpaid-bills', entityId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('bills')
          .select('*')
          .eq('entity_id', entityId)
          .in('status', ['pending', 'partial', 'overdue'])
          .gt('balance_due', 0)
          .order('due_date');

        if (data && !error) return data;
      } catch (err) {
        console.error('Error fetching unpaid bills:', err);
      }
      return demoUnpaidBills;
    },
    enabled: open && !!entityId
  });

  const { data: bankAccounts = [] } = useQuery({
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
        console.error('Error fetching bank accounts:', err);
      }
      return [
        { id: 'acc-1', account_name: 'Operating Account', current_balance: 485000 },
        { id: 'acc-2', account_name: 'Payroll Account', current_balance: 125000 },
      ];
    },
    enabled: open && !!entityId
  });

  const filteredBills = unpaidBills.filter(bill => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      bill.bill_number?.toLowerCase().includes(term) ||
      bill.vendor_name?.toLowerCase().includes(term)
    );
  });

  const selectedBillsList = Object.entries(selectedBills)
    .filter(([_, data]) => data.selected)
    .map(([billId, data]) => {
      const bill = unpaidBills.find(b => b.id === billId);
      return { ...bill, paymentAmount: data.amount };
    });

  const totalPayment = selectedBillsList.reduce((sum, bill) => sum + (parseFloat(bill.paymentAmount) || 0), 0);

  const toggleBillSelection = (bill) => {
    setSelectedBills(prev => {
      const current = prev[bill.id];
      if (current?.selected) {
        const { [bill.id]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [bill.id]: { selected: true, amount: bill.balance_due.toString() }
      };
    });
  };

  const updatePaymentAmount = (billId, amount) => {
    setSelectedBills(prev => ({
      ...prev,
      [billId]: { ...prev[billId], amount }
    }));
  };

  const selectAllBills = () => {
    const allSelected = filteredBills.reduce((acc, bill) => ({
      ...acc,
      [bill.id]: { selected: true, amount: bill.balance_due.toString() }
    }), {});
    setSelectedBills(allSelected);
  };

  const clearSelection = () => {
    setSelectedBills({});
  };

  const paymentMutation = useMutation({
    mutationFn: async () => {
      for (const bill of selectedBillsList) {
        const paymentAmount = parseFloat(bill.paymentAmount);

        // Record payment
        const { error: paymentError } = await supabase
          .from('bill_payments')
          .insert([{
            entity_id: entityId,
            bill_id: bill.id,
            payment_date: paymentData.payment_date,
            amount: paymentAmount,
            payment_method: paymentData.payment_method,
            payment_account_id: paymentData.payment_account || null,
            reference_number: paymentData.reference_number,
            memo: paymentData.memo,
          }]);

        if (paymentError) throw paymentError;

        // Update bill balance
        const newAmountPaid = (bill.amount_paid || 0) + paymentAmount;
        const newBalance = bill.total_amount - newAmountPaid;
        const newStatus = newBalance <= 0 ? 'paid' : 'partial';

        await supabase
          .from('bills')
          .update({
            amount_paid: newAmountPaid,
            balance_due: newBalance,
            status: newStatus,
          })
          .eq('id', bill.id);
      }

      return { count: selectedBillsList.length, total: totalPayment };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bills', entityId]);
      queryClient.invalidateQueries(['unpaid-bills', entityId]);
      handleClose();
    }
  });

  const validateStep2 = () => {
    const newErrors = {};
    if (!paymentData.payment_date) newErrors.payment_date = 'Payment date is required';
    if (!paymentData.payment_method) newErrors.payment_method = 'Payment method is required';

    // Validate payment amounts don't exceed balance
    for (const bill of selectedBillsList) {
      const amount = parseFloat(bill.paymentAmount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amounts = 'All payment amounts must be greater than 0';
        break;
      }
      const originalBill = unpaidBills.find(b => b.id === bill.id);
      if (amount > originalBill.balance_due) {
        newErrors.amounts = 'Payment amount cannot exceed balance due';
        break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (selectedBillsList.length === 0) {
        setErrors({ selection: 'Please select at least one bill to pay' });
        return;
      }
      setErrors({});
      setStep(2);
    } else if (step === 2) {
      if (validateStep2()) {
        setStep(3);
      }
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
    setErrors({});
  };

  const handleSubmit = () => {
    paymentMutation.mutate();
  };

  const handleClose = () => {
    setStep(1);
    setSelectedBills({});
    setPaymentData({
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: '',
      payment_account: '',
      reference_number: '',
      memo: '',
    });
    setErrors({});
    setSearchTerm('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pay Bills</DialogTitle>
          <DialogDescription>
            {step === 1 && 'Select bills to pay'}
            {step === 2 && 'Enter payment details'}
            {step === 3 && 'Review and confirm payment'}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              {s}
            </div>
          ))}
        </div>

        {/* Step 1: Select Bills */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search bills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="sm" onClick={selectAllBills}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={clearSelection}>
                Clear
              </Button>
            </div>

            {errors.selection && (
              <p className="text-sm text-red-500">{errors.selection}</p>
            )}

            <div className="max-h-80 overflow-y-auto border rounded-lg divide-y">
              {loadingBills ? (
                <div className="p-4 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </div>
              ) : filteredBills.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>No unpaid bills found</p>
                </div>
              ) : (
                filteredBills.map(bill => {
                  const isSelected = selectedBills[bill.id]?.selected;
                  const isOverdue = bill.status === 'overdue';

                  return (
                    <div
                      key={bill.id}
                      className={cn(
                        "p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/50",
                        isSelected && "bg-primary/5",
                        isOverdue && "bg-red-50"
                      )}
                      onClick={() => toggleBillSelection(bill)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleBillSelection(bill)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{bill.bill_number}</p>
                          {isOverdue && (
                            <span className="text-xs text-red-600 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Overdue
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{bill.vendor_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Due: {formatDate(bill.due_date)}
                        </p>
                      </div>
                      <div className="text-right">
                        {isSelected ? (
                          <div onClick={(e) => e.stopPropagation()}>
                            <Label className="text-xs">Amount to Pay</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max={bill.balance_due}
                              value={selectedBills[bill.id]?.amount || ''}
                              onChange={(e) => updatePaymentAmount(bill.id, e.target.value)}
                              className="w-28 text-right"
                            />
                          </div>
                        ) : (
                          <>
                            <p className="font-medium">{formatCurrency(bill.balance_due)}</p>
                            <p className="text-xs text-muted-foreground">Balance Due</p>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {selectedBillsList.length > 0 && (
              <div className="bg-muted/50 rounded-lg p-3 flex items-center justify-between">
                <span className="font-medium">{selectedBillsList.length} bill(s) selected</span>
                <span className="text-lg font-bold">{formatCurrency(totalPayment)}</span>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Payment Details */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Date *</Label>
                <Input
                  type="date"
                  value={paymentData.payment_date}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, payment_date: e.target.value }))}
                  className={errors.payment_date ? 'border-red-500' : ''}
                />
                {errors.payment_date && <p className="text-sm text-red-500">{errors.payment_date}</p>}
              </div>

              <div className="space-y-2">
                <Label>Payment Method *</Label>
                <Select
                  value={paymentData.payment_method}
                  onValueChange={(value) => setPaymentData(prev => ({ ...prev, payment_method: value }))}
                >
                  <SelectTrigger className={errors.payment_method ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map(method => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.payment_method && <p className="text-sm text-red-500">{errors.payment_method}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pay From Account</Label>
                <Select
                  value={paymentData.payment_account}
                  onValueChange={(value) => setPaymentData(prev => ({ ...prev, payment_account: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.account_name} ({formatCurrency(account.current_balance)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Reference # / Check #</Label>
                <Input
                  placeholder="e.g., Check #1234"
                  value={paymentData.reference_number}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, reference_number: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Memo</Label>
              <Input
                placeholder="Payment memo (optional)"
                value={paymentData.memo}
                onChange={(e) => setPaymentData(prev => ({ ...prev, memo: e.target.value }))}
              />
            </div>

            {errors.amounts && (
              <p className="text-sm text-red-500">{errors.amounts}</p>
            )}

            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground mb-2">Bills to Pay:</p>
              <div className="space-y-1">
                {selectedBillsList.map(bill => (
                  <div key={bill.id} className="flex justify-between text-sm">
                    <span>{bill.vendor_name} - {bill.bill_number}</span>
                    <span className="font-medium">{formatCurrency(bill.paymentAmount)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                <span>Total Payment</span>
                <span>{formatCurrency(totalPayment)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-medium mb-3">Payment Summary</h3>

              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div className="text-muted-foreground">Payment Date:</div>
                <div>{formatDate(paymentData.payment_date)}</div>
                <div className="text-muted-foreground">Payment Method:</div>
                <div className="capitalize">{paymentData.payment_method?.replace('_', ' ')}</div>
                {paymentData.reference_number && (
                  <>
                    <div className="text-muted-foreground">Reference #:</div>
                    <div>{paymentData.reference_number}</div>
                  </>
                )}
              </div>

              <div className="border-t pt-3">
                <p className="text-sm text-muted-foreground mb-2">Bills Being Paid:</p>
                <table className="w-full text-sm">
                  <thead className="text-muted-foreground">
                    <tr>
                      <th className="text-left py-1">Vendor</th>
                      <th className="text-left py-1">Bill #</th>
                      <th className="text-right py-1">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBillsList.map(bill => (
                      <tr key={bill.id}>
                        <td className="py-1">{bill.vendor_name}</td>
                        <td className="py-1">{bill.bill_number}</td>
                        <td className="py-1 text-right">{formatCurrency(bill.paymentAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t font-bold">
                    <tr>
                      <td colSpan={2} className="py-2">Total Payment</td>
                      <td className="py-2 text-right text-lg">{formatCurrency(totalPayment)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {paymentMutation.isError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                Failed to process payment. Please try again.
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step > 1 && (
            <Button variant="outline" onClick={handleBack} disabled={paymentMutation.isPending}>
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={handleNext}>
              Continue
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={paymentMutation.isPending}>
              {paymentMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Payment
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
