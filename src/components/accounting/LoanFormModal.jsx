// src/components/accounting/LoanFormModal.jsx
// Modal for creating and editing loans payable

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Landmark, DollarSign, Calendar, Percent, FileText,
  Loader2, AlertCircle, Building2, CreditCard
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const loanTypes = [
  { value: 'term', label: 'Term Loan' },
  { value: 'line_of_credit', label: 'Line of Credit' },
  { value: 'construction', label: 'Construction Loan' },
  { value: 'equipment', label: 'Equipment Loan' },
  { value: 'sba', label: 'SBA Loan' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'bridge', label: 'Bridge Loan' },
  { value: 'mezzanine', label: 'Mezzanine Financing' },
  { value: 'other', label: 'Other' },
];

const paymentFrequencies = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semi_annual', label: 'Semi-Annual' },
  { value: 'annual', label: 'Annual' },
  { value: 'interest_only', label: 'Interest Only' },
  { value: 'balloon', label: 'Balloon Payment' },
];

const interestTypes = [
  { value: 'fixed', label: 'Fixed Rate' },
  { value: 'variable', label: 'Variable Rate' },
  { value: 'prime_plus', label: 'Prime Plus' },
  { value: 'libor_plus', label: 'SOFR Plus' },
];

export default function LoanFormModal({ open, onClose, entityId, loan = null }) {
  const queryClient = useQueryClient();
  const isEditing = !!loan;

  const [activeTab, setActiveTab] = useState('details');
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    // Basic Details
    loan_name: '',
    loan_type: 'term',
    lender_name: '',
    loan_number: '',
    original_amount: '',
    current_balance: '',
    origination_date: '',
    maturity_date: '',

    // Interest & Payments
    interest_rate: '',
    interest_type: 'fixed',
    payment_frequency: 'monthly',
    monthly_payment: '',
    next_payment_date: '',

    // Additional Details
    collateral: '',
    covenants: '',
    prepayment_penalty: false,
    prepayment_terms: '',
    notes: '',

    // Linked Account
    liability_account_id: '',
    interest_expense_account_id: '',
  });

  // Reset form when modal opens/closes or loan changes
  useEffect(() => {
    if (open) {
      if (loan) {
        setFormData({
          loan_name: loan.loan_name || '',
          loan_type: loan.loan_type || 'term',
          lender_name: loan.lender_name || '',
          loan_number: loan.loan_number || '',
          original_amount: loan.original_amount?.toString() || '',
          current_balance: loan.current_balance?.toString() || '',
          origination_date: loan.origination_date || '',
          maturity_date: loan.maturity_date || '',
          interest_rate: loan.interest_rate?.toString() || '',
          interest_type: loan.interest_type || 'fixed',
          payment_frequency: loan.payment_frequency || 'monthly',
          monthly_payment: loan.monthly_payment?.toString() || '',
          next_payment_date: loan.next_payment_date || '',
          collateral: loan.collateral || '',
          covenants: loan.covenants || '',
          prepayment_penalty: loan.prepayment_penalty || false,
          prepayment_terms: loan.prepayment_terms || '',
          notes: loan.notes || '',
          liability_account_id: loan.liability_account_id || '',
          interest_expense_account_id: loan.interest_expense_account_id || '',
        });
      } else {
        setFormData({
          loan_name: '',
          loan_type: 'term',
          lender_name: '',
          loan_number: '',
          original_amount: '',
          current_balance: '',
          origination_date: new Date().toISOString().split('T')[0],
          maturity_date: '',
          interest_rate: '',
          interest_type: 'fixed',
          payment_frequency: 'monthly',
          monthly_payment: '',
          next_payment_date: '',
          collateral: '',
          covenants: '',
          prepayment_penalty: false,
          prepayment_terms: '',
          notes: '',
          liability_account_id: '',
          interest_expense_account_id: '',
        });
      }
      setActiveTab('details');
      setError(null);
    }
  }, [open, loan]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  // Calculate monthly payment (simplified)
  const calculatePayment = () => {
    const principal = parseFloat(formData.original_amount) || 0;
    const rate = (parseFloat(formData.interest_rate) || 0) / 100 / 12;
    const origDate = new Date(formData.origination_date);
    const matDate = new Date(formData.maturity_date);

    if (principal > 0 && rate > 0 && origDate < matDate) {
      const months = Math.round((matDate - origDate) / (1000 * 60 * 60 * 24 * 30));
      if (months > 0) {
        const payment = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
        handleChange('monthly_payment', payment.toFixed(2));
      }
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const loanData = {
        entity_id: entityId,
        loan_name: data.loan_name,
        loan_type: data.loan_type,
        lender_name: data.lender_name,
        loan_number: data.loan_number || null,
        original_amount: parseFloat(data.original_amount) || 0,
        current_balance: parseFloat(data.current_balance) || parseFloat(data.original_amount) || 0,
        origination_date: data.origination_date || null,
        maturity_date: data.maturity_date || null,
        interest_rate: parseFloat(data.interest_rate) || 0,
        interest_type: data.interest_type,
        payment_frequency: data.payment_frequency,
        monthly_payment: parseFloat(data.monthly_payment) || 0,
        next_payment_date: data.next_payment_date || null,
        collateral: data.collateral || null,
        covenants: data.covenants || null,
        prepayment_penalty: data.prepayment_penalty,
        prepayment_terms: data.prepayment_terms || null,
        notes: data.notes || null,
        liability_account_id: data.liability_account_id || null,
        interest_expense_account_id: data.interest_expense_account_id || null,
        status: 'active',
      };

      if (isEditing) {
        const { error } = await supabase
          .from('loans_payable')
          .update(loanData)
          .eq('id', loan.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('loans_payable')
          .insert([loanData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['loans-payable', entityId]);
      onClose();
    },
    onError: (err) => {
      setError(err.message || 'Failed to save loan');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.loan_name.trim()) {
      setError('Loan name is required');
      setActiveTab('details');
      return;
    }
    if (!formData.lender_name.trim()) {
      setError('Lender name is required');
      setActiveTab('details');
      return;
    }
    if (!formData.original_amount || parseFloat(formData.original_amount) <= 0) {
      setError('Valid loan amount is required');
      setActiveTab('details');
      return;
    }

    saveMutation.mutate(formData);
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5" />
            {isEditing ? 'Edit Loan' : 'Add Loan'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="details">Loan Details</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="terms">Terms & Notes</TabsTrigger>
            </TabsList>

            {/* Loan Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loan_name">Loan Name *</Label>
                <Input
                  id="loan_name"
                  placeholder="e.g., Construction Loan - Main Street Project"
                  value={formData.loan_name}
                  onChange={(e) => handleChange('loan_name', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Loan Type</Label>
                  <Select
                    value={formData.loan_type}
                    onValueChange={(value) => handleChange('loan_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {loanTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loan_number">Loan/Account Number</Label>
                  <Input
                    id="loan_number"
                    placeholder="Optional"
                    value={formData.loan_number}
                    onChange={(e) => handleChange('loan_number', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lender_name">Lender *</Label>
                <Input
                  id="lender_name"
                  placeholder="Bank or lender name"
                  value={formData.lender_name}
                  onChange={(e) => handleChange('lender_name', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="original_amount">Original Amount *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="original_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.original_amount}
                      onChange={(e) => handleChange('original_amount', e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current_balance">Current Balance</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="current_balance"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Same as original if new"
                      value={formData.current_balance}
                      onChange={(e) => handleChange('current_balance', e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origination_date">Origination Date</Label>
                  <Input
                    id="origination_date"
                    type="date"
                    value={formData.origination_date}
                    onChange={(e) => handleChange('origination_date', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maturity_date">Maturity Date</Label>
                  <Input
                    id="maturity_date"
                    type="date"
                    value={formData.maturity_date}
                    onChange={(e) => handleChange('maturity_date', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interest_rate">Interest Rate (%)</Label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="interest_rate"
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="0.000"
                      value={formData.interest_rate}
                      onChange={(e) => handleChange('interest_rate', e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Interest Type</Label>
                  <Select
                    value={formData.interest_type}
                    onValueChange={(value) => handleChange('interest_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {interestTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Payment Frequency</Label>
                  <Select
                    value={formData.payment_frequency}
                    onValueChange={(value) => handleChange('payment_frequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentFrequencies.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthly_payment">Payment Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="monthly_payment"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.monthly_payment}
                      onChange={(e) => handleChange('monthly_payment', e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={calculatePayment}
                className="w-full"
              >
                Calculate Payment (P&I)
              </Button>

              <div className="space-y-2">
                <Label htmlFor="next_payment_date">Next Payment Date</Label>
                <Input
                  id="next_payment_date"
                  type="date"
                  value={formData.next_payment_date}
                  onChange={(e) => handleChange('next_payment_date', e.target.value)}
                />
              </div>

              {formData.monthly_payment && formData.original_amount && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Payment Summary</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Principal:</span>
                    <span className="text-right">{formatCurrency(formData.original_amount)}</span>
                    <span className="text-muted-foreground">Payment:</span>
                    <span className="text-right">{formatCurrency(formData.monthly_payment)}</span>
                    <span className="text-muted-foreground">Rate:</span>
                    <span className="text-right">{formData.interest_rate}%</span>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Terms & Notes Tab */}
            <TabsContent value="terms" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="collateral">Collateral</Label>
                <Input
                  id="collateral"
                  placeholder="Property, equipment, or other collateral"
                  value={formData.collateral}
                  onChange={(e) => handleChange('collateral', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="covenants">Loan Covenants</Label>
                <Textarea
                  id="covenants"
                  placeholder="Key covenants and requirements..."
                  value={formData.covenants}
                  onChange={(e) => handleChange('covenants', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="prepayment_penalty"
                    checked={formData.prepayment_penalty}
                    onCheckedChange={(checked) => handleChange('prepayment_penalty', checked)}
                  />
                  <Label htmlFor="prepayment_penalty" className="font-normal cursor-pointer">
                    Prepayment penalty applies
                  </Label>
                </div>

                {formData.prepayment_penalty && (
                  <div className="space-y-2 pl-6">
                    <Label htmlFor="prepayment_terms">Prepayment Terms</Label>
                    <Input
                      id="prepayment_terms"
                      placeholder="e.g., 2% if paid within first 2 years"
                      value={formData.prepayment_terms}
                      onChange={(e) => handleChange('prepayment_terms', e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes about this loan..."
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Add Loan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
