import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, User, FileText } from 'lucide-react';
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
import { capitalService } from '@/services/capitalService';
import { formatCurrency } from '@/lib/utils';

// Mock members
const mockMembers = [
  { id: 1, name: 'Bryan De Bruin', ownership_pct: 50.0, capital_account: 250000 },
  { id: 2, name: 'VanRock Holdings LLC', ownership_pct: 50.0, capital_account: 250000 },
];

const ContributionForm = ({ isOpen, onClose, entityId, existingContribution, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    member_id: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    type: 'cash',
    description: '',
    reference: '',
    notes: '',
  });

  useEffect(() => {
    if (existingContribution) {
      setFormData({
        member_id: existingContribution.member_id?.toString() || '',
        date: existingContribution.date || '',
        amount: existingContribution.amount?.toString() || '',
        type: existingContribution.type || 'cash',
        description: existingContribution.description || '',
        reference: existingContribution.reference || '',
        notes: existingContribution.notes || '',
      });
    } else {
      setFormData({
        member_id: '',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        type: 'cash',
        description: '',
        reference: '',
        notes: '',
      });
    }
  }, [existingContribution, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.member_id || !formData.date || !formData.amount) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in member, date, and amount.',
      });
      return;
    }

    setLoading(true);
    try {
      const contributionData = {
        entity_id: entityId,
        member_id: parseInt(formData.member_id),
        date: formData.date,
        amount: parseFloat(formData.amount),
        type: formData.type,
        description: formData.description || `Capital contribution - ${formData.type}`,
        reference: formData.reference,
        notes: formData.notes,
      };

      if (existingContribution) {
        await capitalService.updateContribution(existingContribution.id, contributionData);
      } else {
        await capitalService.createContribution(contributionData);
      }

      toast({
        title: 'Success',
        description: `Contribution ${existingContribution ? 'updated' : 'recorded'} successfully.`,
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save contribution.',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedMember = mockMembers.find(m => m.id === parseInt(formData.member_id));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {existingContribution ? 'Edit Contribution' : 'Record Capital Contribution'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Member Selection */}
          <div className="grid gap-2">
            <Label>Member *</Label>
            <Select
              value={formData.member_id}
              onValueChange={(value) => handleChange('member_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {mockMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    <div className="flex justify-between items-center w-full">
                      <span>{member.name}</span>
                      <span className="text-gray-500 text-sm ml-2">({member.ownership_pct}%)</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedMember && (
              <p className="text-sm text-gray-500">
                Current capital account: {formatCurrency(selectedMember.capital_account)}
              </p>
            )}
          </div>

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

            {/* Type */}
            <div className="grid gap-2">
              <Label>Contribution Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="property">Property</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
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
              placeholder="e.g., Initial capital contribution"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          {/* Reference */}
          <div className="grid gap-2">
            <Label>Reference / Check #</Label>
            <Input
              placeholder="Optional reference number"
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
            {loading ? 'Saving...' : existingContribution ? 'Update' : 'Record Contribution'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContributionForm;
