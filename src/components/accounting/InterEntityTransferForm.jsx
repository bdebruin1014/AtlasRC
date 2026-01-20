import React, { useState, useEffect } from 'react';
import { ArrowRight, DollarSign, Building2 } from 'lucide-react';
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
import { formatCurrency } from '@/lib/utils';

// Mock entities
const mockEntities = [
  { id: 1, name: 'VanRock Holdings LLC', type: 'Holding Company' },
  { id: 2, name: 'Watson House LLC', type: 'Project Entity' },
  { id: 3, name: 'Oslo Townhomes LLC', type: 'Project Entity' },
  { id: 4, name: 'Cedar Mill Partners', type: 'Project Entity' },
  { id: 5, name: 'Olive Brynn LLC', type: 'Personal Holding' },
];

const transferTypes = [
  { value: 'loan', label: 'Inter-company Loan' },
  { value: 'capital_contribution', label: 'Capital Contribution' },
  { value: 'distribution', label: 'Distribution' },
  { value: 'expense_reimbursement', label: 'Expense Reimbursement' },
  { value: 'management_fee', label: 'Management Fee' },
  { value: 'other', label: 'Other' },
];

const InterEntityTransferForm = ({ isOpen, onClose, currentEntityId, existingTransfer, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    from_entity_id: '',
    to_entity_id: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    transfer_type: 'loan',
    description: '',
    reference: '',
    notes: '',
  });

  useEffect(() => {
    if (existingTransfer) {
      setFormData({
        from_entity_id: existingTransfer.from_entity_id?.toString() || '',
        to_entity_id: existingTransfer.to_entity_id?.toString() || '',
        date: existingTransfer.date || '',
        amount: existingTransfer.amount?.toString() || '',
        transfer_type: existingTransfer.transfer_type || 'loan',
        description: existingTransfer.description || '',
        reference: existingTransfer.reference || '',
        notes: existingTransfer.notes || '',
      });
    } else {
      setFormData({
        from_entity_id: currentEntityId?.toString() || '',
        to_entity_id: '',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        transfer_type: 'loan',
        description: '',
        reference: '',
        notes: '',
      });
    }
  }, [existingTransfer, currentEntityId, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.from_entity_id || !formData.to_entity_id || !formData.amount || !formData.date) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    if (formData.from_entity_id === formData.to_entity_id) {
      toast({
        variant: 'destructive',
        title: 'Invalid Transfer',
        description: 'From and To entities must be different.',
      });
      return;
    }

    setLoading(true);
    try {
      // In production, this would call an inter-entity transfer service
      const transferData = {
        from_entity_id: parseInt(formData.from_entity_id),
        to_entity_id: parseInt(formData.to_entity_id),
        date: formData.date,
        amount: parseFloat(formData.amount),
        transfer_type: formData.transfer_type,
        description: formData.description || `Inter-entity ${formData.transfer_type.replace('_', ' ')}`,
        reference: formData.reference,
        notes: formData.notes,
      };

      console.log('Transfer data:', transferData);

      toast({
        title: 'Success',
        description: `Transfer of ${formatCurrency(transferData.amount)} recorded successfully.`,
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to record transfer.',
      });
    } finally {
      setLoading(false);
    }
  };

  const fromEntity = mockEntities.find(e => e.id === parseInt(formData.from_entity_id));
  const toEntity = mockEntities.find(e => e.id === parseInt(formData.to_entity_id));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {existingTransfer ? 'Edit Inter-Entity Transfer' : 'New Inter-Entity Transfer'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Transfer Direction */}
          <div className="grid grid-cols-5 gap-2 items-end">
            <div className="col-span-2 grid gap-2">
              <Label>From Entity *</Label>
              <Select
                value={formData.from_entity_id}
                onValueChange={(value) => handleChange('from_entity_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select entity" />
                </SelectTrigger>
                <SelectContent>
                  {mockEntities.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id.toString()}>
                      {entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-center pb-2">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-gray-500" />
              </div>
            </div>
            
            <div className="col-span-2 grid gap-2">
              <Label>To Entity *</Label>
              <Select
                value={formData.to_entity_id}
                onValueChange={(value) => handleChange('to_entity_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select entity" />
                </SelectTrigger>
                <SelectContent>
                  {mockEntities
                    .filter(e => e.id !== parseInt(formData.from_entity_id))
                    .map((entity) => (
                      <SelectItem key={entity.id} value={entity.id.toString()}>
                        {entity.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Visual Transfer Summary */}
          {fromEntity && toEntity && (
            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center gap-4">
              <div className="text-center">
                <Building2 className="w-8 h-8 mx-auto text-gray-400 mb-1" />
                <p className="text-sm font-medium">{fromEntity.name}</p>
                <p className="text-xs text-gray-500">{fromEntity.type}</p>
              </div>
              <ArrowRight className="w-6 h-6 text-emerald-500" />
              <div className="text-center">
                <Building2 className="w-8 h-8 mx-auto text-gray-400 mb-1" />
                <p className="text-sm font-medium">{toEntity.name}</p>
                <p className="text-xs text-gray-500">{toEntity.type}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div className="grid gap-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
              />
            </div>

            {/* Transfer Type */}
            <div className="grid gap-2">
              <Label>Transfer Type</Label>
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
                      {type.label}
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
                placeholder="0.00"
                className="pl-9"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label>Description</Label>
            <Input
              placeholder="Brief description of the transfer"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          {/* Reference */}
          <div className="grid gap-2">
            <Label>Reference Number</Label>
            <Input
              placeholder="Optional reference"
              value={formData.reference}
              onChange={(e) => handleChange('reference', e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Additional notes..."
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
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
            {loading ? 'Processing...' : 'Record Transfer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InterEntityTransferForm;
