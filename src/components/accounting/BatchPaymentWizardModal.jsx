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
import { Textarea } from '@/components/ui/textarea';
import {
  DollarSign, CreditCard, Loader2, CheckCircle, Search, Calendar,
  Building2, AlertTriangle, FileText, Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

// Demo unpaid bills for fallback
const demoUnpaidBills = [
  { id: 'bill-1', bill_number: 'SF-2024-156', vendor_id: 'v1', vendor_name: 'Smith Framing LLC', total_amount: 47500, balance_due: 47500, due_date: '2024-12-30', status: 'pending' },
  { id: 'bill-2', bill_number: 'INV-8834', vendor_id: 'v2', vendor_name: 'ABC Plumbing', total_amount: 32100, balance_due: 32100, due_date: '2024-12-25', status: 'approved' },
  { id: 'bill-3', bill_number: 'RMC-78432', vendor_id: 'v3', vendor_name: 'Ready Mix Concrete', total_amount: 22225, balance_due: 22225, due_date: '2024-12-05', status: 'overdue' },
  { id: 'bill-4', bill_number: 'CA-2024-892', vendor_id: 'v4', vendor_name: 'Cool Air HVAC', total_amount: 34500, balance_due: 34500, due_date: '2025-01-02', status: 'pending' },
  { id: 'bill-5', bill_number: 'SE-2024-445', vendor_id: 'v5', vendor_name: 'Sparks Electric', total_amount: 18750, balance_due: 18750, due_date: '2025-01-10', status: 'approved' },
  { id: 'bill-6', bill_number: 'UTIL-2024-12', vendor_id: 'v6', vendor_name: 'City Power & Light', total_amount: 850, balance_due: 850, due_date: '2025-01-15', status: 'pending' },
];

const PAYMENT_METHODS = [
  { value: 'check', label: 'Check' },
  { value: 'ach', label: 'ACH Transfer' },
  { value: 'wire', label: 'Wire Transfer' },
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

export default function BatchPaymentWizardModal({ open, onClose, entityId }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1); // 1: select bills, 2: review/adjust, 3: payment details, 4: confirm, 5: complete
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVendor, setFilterVendor] = useState('all');
  const [selectedBills, setSelectedBills] = useState({});
  const [batchName, setBatchName] = useState('');
  const [paymentData, setPaymentData] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'check',
    payment_account: '',
    starting_check_number: '',
    memo: '',
  });
  const [errors, setErrors] = useState({});

  const { data: unpaidBills = demoUnpaidBills, isLoading: loadingBills } = useQuery({
    queryKey: ['unpaid-bills-batch', entityId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('bills')
          .select('*')
          .eq('entity_id', entityId)
          .in('status', ['pending', 'approved', 'partial', 'overdue'])
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

  // Get unique vendors for filter
  const vendors = [...new Map(unpaidBills.map(b => [b.vendor_id, { id: b.vendor_id, name: b.vendor_name }])).values()];

  const filteredBills = unpaidBills.filter(bill => {
    const matchesSearch = !searchTerm ||
      bill.bill_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVendor = filterVendor === 'all' || bill.vendor_id === filterVendor;
    return matchesSearch && matchesVendor;
  });

  const selectedBillsList = Object.entries(selectedBills)
    .filter(([_, data]) => data.selected)
    .map(([billId, data]) => {
      const bill = unpaidBills.find(b => b.id === billId);
      return { ...bill, paymentAmount: data.amount };
    });

  const totalPayment = selectedBillsList.reduce((sum, bill) => sum + (parseFloat(bill.paymentAmount) || 0), 0);
  const vendorCount = new Set(selectedBillsList.map(b => b.vendor_id)).size;

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

  const selectOverdueBills = () => {
    const overdueBills = filteredBills
      .filter(b => b.status === 'overdue')
      .reduce((acc, bill) => ({
        ...acc,
        [bill.id]: { selected: true, amount: bill.balance_due.toString() }
      }), {});
    setSelectedBills(overdueBills);
  };

  const clearSelection = () => {
    setSelectedBills({});
  };

  const batchMutation = useMutation({
    mutationFn: async () => {
      // Create batch record
      const { data: batch, error: batchError } = await supabase
        .from('payment_batches')
        .insert([{
          entity_id: entityId,
          batch_name: batchName || `Batch ${new Date().toLocaleDateString()}`,
          payment_date: paymentData.payment_date,
          payment_method: paymentData.payment_method,
          payment_account_id: paymentData.payment_account || null,
          total_amount: totalPayment,
          payment_count: selectedBillsList.length,
          status: 'completed',
        }])
        .select()
        .single();

      if (batchError) throw batchError;

      let checkNumber = paymentData.starting_check_number ? parseInt(paymentData.starting_check_number) : null;

      // Process each payment
      for (const bill of selectedBillsList) {
        const paymentAmount = parseFloat(bill.paymentAmount);

        await supabase
          .from('bill_payments')
          .insert([{
            entity_id: entityId,
            batch_id: batch.id,
            bill_id: bill.id,
            payment_date: paymentData.payment_date,
            amount: paymentAmount,
            payment_method: paymentData.payment_method,
            payment_account_id: paymentData.payment_account || null,
            reference_number: checkNumber ? `Check #${checkNumber}` : null,
            memo: paymentData.memo,
          }]);

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

        if (checkNumber) checkNumber++;
      }

      return { batchId: batch.id, count: selectedBillsList.length, total: totalPayment };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bills', entityId]);
      queryClient.invalidateQueries(['unpaid-bills', entityId]);
      queryClient.invalidateQueries(['payment-batches', entityId]);
      setStep(5);
    }
  });

  const validateStep = () => {
    const newErrors = {};

    if (step === 1 && selectedBillsList.length === 0) {
      newErrors.selection = 'Please select at least one bill to pay';
    }

    if (step === 3) {
      if (!paymentData.payment_date) newErrors.payment_date = 'Payment date is required';
      if (!paymentData.payment_method) newErrors.payment_method = 'Payment method is required';
      if (paymentData.payment_method === 'check' && !paymentData.starting_check_number) {
        newErrors.starting_check_number = 'Starting check number is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
    setErrors({});
  };

  const handleSubmit = () => {
    batchMutation.mutate();
  };

  const handleClose = () => {
    setStep(1);
    setSelectedBills({});
    setBatchName('');
    setPaymentData({
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'check',
      payment_account: '',
      starting_check_number: '',
      memo: '',
    });
    setErrors({});
    setSearchTerm('');
    setFilterVendor('all');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Batch Payment</DialogTitle>
          <DialogDescription>
            {step === 1 && 'Select bills to include in this batch'}
            {step === 2 && 'Review and adjust payment amounts'}
            {step === 3 && 'Configure payment details'}
            {step === 4 && 'Review and confirm batch payment'}
            {step === 5 && 'Batch payment completed'}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-1 mb-4">
          {[1, 2, 3, 4].map(s => (
            <React.Fragment key={s}>
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  step === 5 && "bg-green-600"
                )}
              >
                {step === 5 && s === 4 ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              {s < 4 && <div className={cn("w-8 h-0.5", step > s ? "bg-primary" : "bg-muted")} />}
            </React.Fragment>
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
              <Select value={filterVendor} onValueChange={setFilterVendor}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Vendors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {vendors.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={selectAllBills}>Select All</Button>
              <Button variant="outline" size="sm" onClick={selectOverdueBills}>Select Overdue</Button>
              <Button variant="outline" size="sm" onClick={clearSelection}>Clear</Button>
            </div>

            {errors.selection && (
              <p className="text-sm text-red-500">{errors.selection}</p>
            )}

            <div className="max-h-64 overflow-y-auto border rounded-lg divide-y">
              {loadingBills ? (
                <div className="p-4 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </div>
              ) : filteredBills.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
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
                        isOverdue && !isSelected && "bg-red-50"
                      )}
                      onClick={() => toggleBillSelection(bill)}
                    >
                      <Checkbox checked={isSelected} />
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
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(bill.balance_due)}</p>
                        <p className="text-xs text-muted-foreground">Due: {formatDate(bill.due_date)}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {selectedBillsList.length > 0 && (
              <div className="bg-muted/50 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="font-medium">{selectedBillsList.length} bills</span>
                  <span className="text-muted-foreground">{vendorCount} vendors</span>
                </div>
                <span className="text-lg font-bold">{formatCurrency(totalPayment)}</span>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Review & Adjust */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="batch_name">Batch Name (Optional)</Label>
              <Input
                id="batch_name"
                placeholder={`Batch ${new Date().toLocaleDateString()}`}
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
              />
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-3 py-2">Vendor / Bill</th>
                    <th className="text-right px-3 py-2">Balance Due</th>
                    <th className="text-right px-3 py-2 w-32">Pay Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedBillsList.map(bill => (
                    <tr key={bill.id}>
                      <td className="px-3 py-2">
                        <p className="font-medium">{bill.vendor_name}</p>
                        <p className="text-xs text-muted-foreground">{bill.bill_number}</p>
                      </td>
                      <td className="px-3 py-2 text-right text-muted-foreground">
                        {formatCurrency(bill.balance_due)}
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max={bill.balance_due}
                          value={selectedBills[bill.id]?.amount || ''}
                          onChange={(e) => updatePaymentAmount(bill.id, e.target.value)}
                          className="text-right"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted font-bold">
                  <tr>
                    <td colSpan={2} className="px-3 py-2 text-right">Total Payment:</td>
                    <td className="px-3 py-2 text-right text-lg">{formatCurrency(totalPayment)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Step 3: Payment Details */}
        {step === 3 && (
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
                    <SelectValue />
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

              {paymentData.payment_method === 'check' && (
                <div className="space-y-2">
                  <Label>Starting Check # *</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 1001"
                    value={paymentData.starting_check_number}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, starting_check_number: e.target.value }))}
                    className={errors.starting_check_number ? 'border-red-500' : ''}
                  />
                  {errors.starting_check_number && <p className="text-sm text-red-500">{errors.starting_check_number}</p>}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Memo</Label>
              <Textarea
                placeholder="Optional memo for all payments..."
                value={paymentData.memo}
                onChange={(e) => setPaymentData(prev => ({ ...prev, memo: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-medium mb-3">Batch Summary</h3>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="text-muted-foreground">Batch Name</p>
                  <p className="font-medium">{batchName || `Batch ${new Date().toLocaleDateString()}`}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Date</p>
                  <p className="font-medium">{formatDate(paymentData.payment_date)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Method</p>
                  <p className="font-medium capitalize">{paymentData.payment_method?.replace('_', ' ')}</p>
                </div>
                {paymentData.payment_method === 'check' && (
                  <div>
                    <p className="text-muted-foreground">Check Numbers</p>
                    <p className="font-medium">
                      #{paymentData.starting_check_number} - #{parseInt(paymentData.starting_check_number) + selectedBillsList.length - 1}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 bg-white rounded-lg p-3">
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedBillsList.length}</p>
                  <p className="text-xs text-muted-foreground">Payments</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{vendorCount}</p>
                  <p className="text-xs text-muted-foreground">Vendors</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{formatCurrency(totalPayment)}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg max-h-48 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2">Vendor</th>
                    <th className="text-left px-3 py-2">Bill #</th>
                    {paymentData.payment_method === 'check' && (
                      <th className="text-left px-3 py-2">Check #</th>
                    )}
                    <th className="text-right px-3 py-2">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedBillsList.map((bill, idx) => (
                    <tr key={bill.id}>
                      <td className="px-3 py-2">{bill.vendor_name}</td>
                      <td className="px-3 py-2">{bill.bill_number}</td>
                      {paymentData.payment_method === 'check' && (
                        <td className="px-3 py-2">#{parseInt(paymentData.starting_check_number) + idx}</td>
                      )}
                      <td className="px-3 py-2 text-right font-medium">{formatCurrency(bill.paymentAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {batchMutation.isError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                Failed to process batch payment. Please try again.
              </div>
            )}
          </div>
        )}

        {/* Step 5: Complete */}
        {step === 5 && (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-medium mb-2">Batch Payment Complete!</h3>
            <p className="text-muted-foreground mb-4">
              Successfully processed {selectedBillsList.length} payments totaling {formatCurrency(totalPayment)}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span>{selectedBillsList.length} bills paid</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{vendorCount} vendors</span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {step > 1 && step < 5 && (
            <Button variant="outline" onClick={handleBack} disabled={batchMutation.isPending}>
              Back
            </Button>
          )}
          {step < 4 && (
            <Button onClick={handleNext}>
              Continue
            </Button>
          )}
          {step === 4 && (
            <Button onClick={handleSubmit} disabled={batchMutation.isPending}>
              {batchMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Process Batch ({formatCurrency(totalPayment)})
                </>
              )}
            </Button>
          )}
          {step === 5 && (
            <Button onClick={handleClose}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
