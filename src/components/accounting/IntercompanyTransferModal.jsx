// src/components/accounting/IntercompanyTransferModal.jsx
// Modal for creating intercompany transfers between entities

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
import {
  ArrowRight, Building2, DollarSign, Calendar, FileText,
  Loader2, AlertCircle, ArrowLeftRight
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

const transferTypes = [
  { value: 'loan_advance', label: 'Loan Advance', description: 'Intercompany loan funding' },
  { value: 'loan_repayment', label: 'Loan Repayment', description: 'Repay intercompany loan' },
  { value: 'interest_payment', label: 'Interest Payment', description: 'Interest on IC loan' },
  { value: 'management_fee', label: 'Management Fee', description: 'Property management fee' },
  { value: 'distribution', label: 'Distribution', description: 'Cash distribution to parent' },
  { value: 'capital_contribution', label: 'Capital Contribution', description: 'Equity contribution' },
  { value: 'reimbursement', label: 'Reimbursement', description: 'Expense reimbursement' },
  { value: 'other', label: 'Other', description: 'Other intercompany transfer' },
];

export default function IntercompanyTransferModal({ open, onClose, entityId }) {
  const queryClient = useQueryClient();

  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    transfer_date: new Date().toISOString().split('T')[0],
    from_entity_id: entityId || '',
    to_entity_id: '',
    transfer_type: 'loan_advance',
    amount: '',
    description: '',
    reference_number: '',
    notes: '',
    from_account_id: '',
    to_account_id: '',
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        transfer_date: new Date().toISOString().split('T')[0],
        from_entity_id: entityId || '',
        to_entity_id: '',
        transfer_type: 'loan_advance',
        amount: '',
        description: '',
        reference_number: '',
        notes: '',
        from_account_id: '',
        to_account_id: '',
      });
      setError(null);
    }
  }, [open, entityId]);

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

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  // Auto-generate description based on type
  useEffect(() => {
    if (formData.transfer_type && !formData.description) {
      const type = transferTypes.find(t => t.value === formData.transfer_type);
      if (type) {
        const fromEntity = entities.find(e => e.id === formData.from_entity_id);
        const toEntity = entities.find(e => e.id === formData.to_entity_id);
        if (fromEntity && toEntity) {
          handleChange('description', `${type.label}: ${fromEntity.name} to ${toEntity.name}`);
        }
      }
    }
  }, [formData.transfer_type, formData.from_entity_id, formData.to_entity_id]);

  // Generate reference number
  const generateRefNumber = () => {
    const type = formData.transfer_type.toUpperCase().slice(0, 3);
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `IC-${type}-${date}-${random}`;
  };

  useEffect(() => {
    if (open && !formData.reference_number) {
      handleChange('reference_number', generateRefNumber());
    }
  }, [open, formData.transfer_type]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const transferData = {
        from_entity_id: data.from_entity_id,
        to_entity_id: data.to_entity_id,
        transfer_type: data.transfer_type,
        transfer_date: data.transfer_date,
        amount: parseFloat(data.amount) || 0,
        description: data.description,
        reference_number: data.reference_number,
        notes: data.notes || null,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('intercompany_transactions')
        .insert([transferData]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['intercompany-transactions']);
      onClose();
    },
    onError: (err) => {
      setError(err.message || 'Failed to create transfer');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.from_entity_id) {
      setError('Please select the source entity');
      return;
    }
    if (!formData.to_entity_id) {
      setError('Please select the destination entity');
      return;
    }
    if (formData.from_entity_id === formData.to_entity_id) {
      setError('Source and destination entities must be different');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
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

  const fromEntity = entities.find(e => e.id === formData.from_entity_id);
  const toEntity = entities.find(e => e.id === formData.to_entity_id);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            New Intercompany Transfer
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Transfer Flow Visual */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 text-center">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-xs text-muted-foreground">From</p>
                <p className="font-medium text-sm truncate">
                  {fromEntity?.name || 'Select Entity'}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                {formData.amount && (
                  <p className="text-sm font-bold text-green-600 mt-1">
                    {formatCurrency(formData.amount)}
                  </p>
                )}
              </div>
              <div className="flex-1 text-center">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-xs text-muted-foreground">To</p>
                <p className="font-medium text-sm truncate">
                  {toEntity?.name || 'Select Entity'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From Entity *</Label>
              <Select
                value={formData.from_entity_id}
                onValueChange={(value) => handleChange('from_entity_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source entity" />
                </SelectTrigger>
                <SelectContent>
                  {entities.map((entity) => (
                    <SelectItem
                      key={entity.id}
                      value={entity.id}
                      disabled={entity.id === formData.to_entity_id}
                    >
                      <div className="flex items-center gap-2">
                        <span>{entity.name}</span>
                        <span className="text-xs text-muted-foreground">({entity.type || entity.entity_type})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>To Entity *</Label>
              <Select
                value={formData.to_entity_id}
                onValueChange={(value) => handleChange('to_entity_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select destination entity" />
                </SelectTrigger>
                <SelectContent>
                  {entities.map((entity) => (
                    <SelectItem
                      key={entity.id}
                      value={entity.id}
                      disabled={entity.id === formData.from_entity_id}
                    >
                      <div className="flex items-center gap-2">
                        <span>{entity.name}</span>
                        <span className="text-xs text-muted-foreground">({entity.type || entity.entity_type})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Transfer Type *</Label>
              <Select
                value={formData.transfer_type}
                onValueChange={(value) => handleChange('transfer_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {transferTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {transferTypes.find(t => t.value === formData.transfer_type)?.description}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transfer_date">Transfer Date *</Label>
              <Input
                id="transfer_date"
                type="date"
                value={formData.transfer_date}
                onChange={(e) => handleChange('transfer_date', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
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
                placeholder="Auto-generated"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter transfer description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes or comments..."
              rows={2}
            />
          </div>

          {/* Preview Journal Entry */}
          {formData.from_entity_id && formData.to_entity_id && formData.amount && (
            <div className="border rounded-lg overflow-hidden">
              <div className="px-4 py-2 bg-muted/50 border-b">
                <h4 className="font-medium text-sm">Preview Journal Entries</h4>
              </div>
              <div className="p-4 space-y-3 text-sm">
                <div className="bg-blue-50 rounded p-3">
                  <p className="font-medium text-blue-900 mb-1">{fromEntity?.name}</p>
                  <div className="grid grid-cols-3 gap-2 text-blue-800">
                    <span>Dr. IC Receivable</span>
                    <span className="text-right">{formatCurrency(formData.amount)}</span>
                    <span></span>
                    <span className="pl-4">Cr. Cash</span>
                    <span></span>
                    <span className="text-right">{formatCurrency(formData.amount)}</span>
                  </div>
                </div>
                <div className="bg-green-50 rounded p-3">
                  <p className="font-medium text-green-900 mb-1">{toEntity?.name}</p>
                  <div className="grid grid-cols-3 gap-2 text-green-800">
                    <span>Dr. Cash</span>
                    <span className="text-right">{formatCurrency(formData.amount)}</span>
                    <span></span>
                    <span className="pl-4">Cr. IC Payable</span>
                    <span></span>
                    <span className="text-right">{formatCurrency(formData.amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Transfer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
