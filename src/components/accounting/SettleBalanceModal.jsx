// src/components/accounting/SettleBalanceModal.jsx
// Modal for settling intercompany balances between entities

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  CheckCircle, Building2, DollarSign, Calendar, ArrowRight,
  Loader2, AlertCircle, Scale, ArrowUpDown
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

// Demo entities
const demoEntities = [
  { id: 'E-001', name: 'Atlas Holdings LLC', type: 'Parent' },
  { id: 'E-002', name: 'Riverside Plaza LLC', type: 'Property' },
  { id: 'E-003', name: 'Downtown Tower LLC', type: 'Property' },
  { id: 'E-004', name: 'Oak Street Partners LP', type: 'Property' },
  { id: 'E-005', name: 'Atlas Management Co.', type: 'OpCo' },
];

// Demo balances
const demoBalances = [
  { entity_id: 'E-002', counterparty_id: 'E-001', due_to: 125000, due_from: 0, net: -125000 },
  { entity_id: 'E-003', counterparty_id: 'E-001', due_to: 0, due_from: 85000, net: 85000 },
  { entity_id: 'E-004', counterparty_id: 'E-001', due_to: 45000, due_from: 0, net: -45000 },
  { entity_id: 'E-002', counterparty_id: 'E-005', due_to: 18500, due_from: 0, net: -18500 },
  { entity_id: 'E-003', counterparty_id: 'E-005', due_to: 22000, due_from: 0, net: -22000 },
];

const settlementMethods = [
  { value: 'cash', label: 'Cash Payment', description: 'Wire or ACH transfer' },
  { value: 'netting', label: 'Balance Netting', description: 'Net against opposite balances' },
  { value: 'offset', label: 'Journal Offset', description: 'Create offsetting journal entries' },
  { value: 'conversion', label: 'Debt to Equity', description: 'Convert to capital contribution' },
];

export default function SettleBalanceModal({ open, onClose, entityId, selectedBalance }) {
  const queryClient = useQueryClient();

  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [selectedBalances, setSelectedBalances] = useState([]);
  const [formData, setFormData] = useState({
    settlement_date: new Date().toISOString().split('T')[0],
    settlement_method: 'cash',
    settlement_amount: '',
    partial_settlement: false,
    notes: '',
    reference_number: '',
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setStep(1);
      setSelectedBalances(selectedBalance ? [selectedBalance] : []);
      setFormData({
        settlement_date: new Date().toISOString().split('T')[0],
        settlement_method: 'cash',
        settlement_amount: '',
        partial_settlement: false,
        notes: '',
        reference_number: '',
      });
      setError(null);
    }
  }, [open, selectedBalance]);

  // Fetch entities
  const { data: entities = [] } = useQuery({
    queryKey: ['entities'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('entities')
          .select('id, name, entity_type')
          .order('name');

        if (error) throw error;
        return data || demoEntities;
      } catch (err) {
        console.error('Error fetching entities:', err);
        return demoEntities;
      }
    },
    enabled: open,
  });

  // Fetch outstanding balances
  const { data: balances = [] } = useQuery({
    queryKey: ['due-to-from-balances', entityId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('intercompany_balances')
          .select('*')
          .or(`entity_id.eq.${entityId},counterparty_id.eq.${entityId}`)
          .neq('net_balance', 0);

        if (error) throw error;
        return data || demoBalances.filter(b =>
          b.entity_id === entityId || b.counterparty_id === entityId
        );
      } catch (err) {
        console.error('Error fetching balances:', err);
        return demoBalances.filter(b =>
          b.entity_id === entityId || b.counterparty_id === entityId
        );
      }
    },
    enabled: open && !!entityId,
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const toggleBalance = (balance) => {
    setSelectedBalances(prev => {
      const exists = prev.find(b =>
        b.entity_id === balance.entity_id && b.counterparty_id === balance.counterparty_id
      );
      if (exists) {
        return prev.filter(b =>
          !(b.entity_id === balance.entity_id && b.counterparty_id === balance.counterparty_id)
        );
      }
      return [...prev, balance];
    });
  };

  const getTotalSettlement = () => {
    return selectedBalances.reduce((sum, b) => sum + Math.abs(b.net || b.net_balance || 0), 0);
  };

  const generateRefNumber = () => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `SET-${date}-${random}`;
  };

  useEffect(() => {
    if (open && step === 2 && !formData.reference_number) {
      handleChange('reference_number', generateRefNumber());
    }
  }, [open, step]);

  // Auto-set settlement amount
  useEffect(() => {
    if (step === 2 && !formData.partial_settlement) {
      handleChange('settlement_amount', getTotalSettlement().toString());
    }
  }, [step, selectedBalances, formData.partial_settlement]);

  const settleMutation = useMutation({
    mutationFn: async (data) => {
      const settlementData = {
        entity_id: entityId,
        settlement_date: data.settlement_date,
        settlement_method: data.settlement_method,
        settlement_amount: parseFloat(data.settlement_amount) || 0,
        balances_settled: selectedBalances.map(b => ({
          entity_id: b.entity_id,
          counterparty_id: b.counterparty_id,
          amount: Math.abs(b.net || b.net_balance || 0),
        })),
        notes: data.notes || null,
        reference_number: data.reference_number,
        status: 'completed',
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('intercompany_settlements')
        .insert([settlementData]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['due-to-from-balances']);
      queryClient.invalidateQueries(['intercompany-transactions']);
      setStep(3);
    },
    onError: (err) => {
      setError(err.message || 'Failed to settle balances');
    },
  });

  const handleSubmit = () => {
    if (step === 1) {
      if (selectedBalances.length === 0) {
        setError('Please select at least one balance to settle');
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!formData.settlement_amount || parseFloat(formData.settlement_amount) <= 0) {
        setError('Please enter a valid settlement amount');
        return;
      }
      if (parseFloat(formData.settlement_amount) > getTotalSettlement() && !formData.partial_settlement) {
        setError('Settlement amount cannot exceed total balance');
        return;
      }
      settleMutation.mutate(formData);
    }
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  const getEntityName = (id) => {
    const entity = entities.find(e => e.id === id);
    return entity?.name || id;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Settle Intercompany Balance
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                step >= s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                {step > s ? <CheckCircle className="h-4 w-4" /> : s}
              </div>
              {s < 3 && (
                <div className={cn(
                  "w-12 h-1 mx-1",
                  step > s ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-8 text-xs text-muted-foreground mb-4">
          <span>Select Balances</span>
          <span>Settlement Details</span>
          <span>Complete</span>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Step 1: Select Balances */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select the intercompany balances you want to settle.
            </p>

            <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
              {balances.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No outstanding balances found
                </div>
              ) : (
                balances.map((balance, index) => {
                  const isSelected = selectedBalances.find(b =>
                    b.entity_id === balance.entity_id && b.counterparty_id === balance.counterparty_id
                  );
                  const netAmount = balance.net || balance.net_balance || 0;
                  const isDueTo = netAmount < 0;

                  return (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                        isSelected && "bg-primary/5"
                      )}
                      onClick={() => toggleBalance(balance)}
                    >
                      <Checkbox checked={!!isSelected} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm truncate">
                            {getEntityName(balance.counterparty_id)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <span>{isDueTo ? 'Due To' : 'Due From'}</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </div>
                      <div className={cn(
                        "text-right font-medium",
                        isDueTo ? "text-red-600" : "text-green-600"
                      )}>
                        {formatCurrency(Math.abs(netAmount))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {selectedBalances.length > 0 && (
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {selectedBalances.length} balance(s) selected
                  </span>
                  <span className="font-bold">
                    {formatCurrency(getTotalSettlement())}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Settlement Details */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Total to Settle</span>
                <span className="text-lg font-bold">{formatCurrency(getTotalSettlement())}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {selectedBalances.length} balance(s) selected
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Settlement Method</Label>
                <Select
                  value={formData.settlement_method}
                  onValueChange={(value) => handleChange('settlement_method', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {settlementMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {settlementMethods.find(m => m.value === formData.settlement_method)?.description}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="settlement_date">Settlement Date</Label>
                <Input
                  id="settlement_date"
                  type="date"
                  value={formData.settlement_date}
                  onChange={(e) => handleChange('settlement_date', e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="partial"
                checked={formData.partial_settlement}
                onCheckedChange={(checked) => handleChange('partial_settlement', checked)}
              />
              <Label htmlFor="partial" className="text-sm font-normal cursor-pointer">
                Partial settlement (enter custom amount)
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="settlement_amount">Settlement Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="settlement_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.settlement_amount}
                    onChange={(e) => handleChange('settlement_amount', e.target.value)}
                    disabled={!formData.partial_settlement}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference_number">Reference Number</Label>
                <Input
                  id="reference_number"
                  value={formData.reference_number}
                  onChange={(e) => handleChange('reference_number', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Settlement notes or comments..."
                rows={2}
              />
            </div>

            {/* Settlement Preview */}
            <div className="border rounded-lg overflow-hidden">
              <div className="px-4 py-2 bg-muted/50 border-b">
                <h4 className="font-medium text-sm">Settlement Summary</h4>
              </div>
              <div className="p-4 space-y-2 text-sm">
                {selectedBalances.map((balance, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      {getEntityName(balance.counterparty_id)}
                    </span>
                    <span>{formatCurrency(Math.abs(balance.net || balance.net_balance || 0))}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2 flex justify-between items-center font-medium">
                  <span>Total Settlement</span>
                  <span>{formatCurrency(formData.settlement_amount || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Complete */}
        {step === 3 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Settlement Complete!</h3>
            <p className="text-muted-foreground mb-4">
              {formatCurrency(formData.settlement_amount)} has been settled across {selectedBalances.length} balance(s).
            </p>
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="text-muted-foreground">Reference Number</p>
              <p className="font-mono font-medium">{formData.reference_number}</p>
            </div>
          </div>
        )}

        <DialogFooter>
          {step < 3 ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={step === 1 ? onClose : () => setStep(step - 1)}
              >
                {step === 1 ? 'Cancel' : 'Back'}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={settleMutation.isPending}
              >
                {settleMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {step === 1 ? 'Continue' : 'Settle Balance'}
              </Button>
            </>
          ) : (
            <Button onClick={onClose}>
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
