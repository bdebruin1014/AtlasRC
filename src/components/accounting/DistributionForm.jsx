import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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

const DistributionForm = ({ isOpen, onClose, entityId, existingDistribution, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [distributeToAll, setDistributeToAll] = useState(true);
  
  const [formData, setFormData] = useState({
    member_id: '',
    date: new Date().toISOString().split('T')[0],
    total_amount: '',
    type: 'guaranteed_payment',
    description: '',
    reference: '',
    notes: '',
  });

  const [memberAmounts, setMemberAmounts] = useState({});

  useEffect(() => {
    if (existingDistribution) {
      setFormData({
        member_id: existingDistribution.member_id?.toString() || '',
        date: existingDistribution.date || '',
        total_amount: existingDistribution.amount?.toString() || '',
        type: existingDistribution.type || 'guaranteed_payment',
        description: existingDistribution.description || '',
        reference: existingDistribution.reference || '',
        notes: existingDistribution.notes || '',
      });
      setDistributeToAll(false);
    } else {
      setFormData({
        member_id: '',
        date: new Date().toISOString().split('T')[0],
        total_amount: '',
        type: 'guaranteed_payment',
        description: '',
        reference: '',
        notes: '',
      });
      // Initialize member amounts based on ownership
      const amounts = {};
      mockMembers.forEach(m => {
        amounts[m.id] = '';
      });
      setMemberAmounts(amounts);
    }
  }, [existingDistribution, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-calculate member amounts when total changes
    if (field === 'total_amount' && distributeToAll && value) {
      const total = parseFloat(value);
      const newAmounts = {};
      mockMembers.forEach(m => {
        newAmounts[m.id] = ((total * m.ownership_pct) / 100).toFixed(2);
      });
      setMemberAmounts(newAmounts);
    }
  };

  const handleMemberAmountChange = (memberId, value) => {
    setMemberAmounts(prev => ({ ...prev, [memberId]: value }));
  };

  const totalDistribution = Object.values(memberAmounts)
    .reduce((sum, amt) => sum + (parseFloat(amt) || 0), 0);

  const handleSubmit = async () => {
    if (!formData.date) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please select a date.',
      });
      return;
    }

    if (distributeToAll && totalDistribution <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Please enter distribution amounts.',
      });
      return;
    }

    if (!distributeToAll && (!formData.member_id || !formData.total_amount)) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please select a member and enter an amount.',
      });
      return;
    }

    setLoading(true);
    try {
      if (distributeToAll) {
        // Create distribution for each member
        for (const member of mockMembers) {
          const amount = parseFloat(memberAmounts[member.id]);
          if (amount > 0) {
            await capitalService.createDistribution({
              entity_id: entityId,
              member_id: member.id,
              date: formData.date,
              amount: amount,
              type: formData.type,
              description: formData.description || `${formData.type.replace('_', ' ')} distribution`,
              reference: formData.reference,
              notes: formData.notes,
            });
          }
        }
      } else {
        const distributionData = {
          entity_id: entityId,
          member_id: parseInt(formData.member_id),
          date: formData.date,
          amount: parseFloat(formData.total_amount),
          type: formData.type,
          description: formData.description,
          reference: formData.reference,
          notes: formData.notes,
        };

        if (existingDistribution) {
          await capitalService.updateDistribution(existingDistribution.id, distributionData);
        } else {
          await capitalService.createDistribution(distributionData);
        }
      }

      toast({
        title: 'Success',
        description: `Distribution${distributeToAll ? 's' : ''} recorded successfully.`,
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save distribution.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {existingDistribution ? 'Edit Distribution' : 'Record Distribution'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Distribution Mode */}
          {!existingDistribution && (
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <Checkbox
                id="distributeToAll"
                checked={distributeToAll}
                onCheckedChange={setDistributeToAll}
              />
              <Label htmlFor="distributeToAll" className="cursor-pointer">
                Distribute to all members (by ownership percentage)
              </Label>
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

            {/* Type */}
            <div className="grid gap-2">
              <Label>Distribution Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guaranteed_payment">Guaranteed Payment</SelectItem>
                  <SelectItem value="profit_distribution">Profit Distribution</SelectItem>
                  <SelectItem value="return_of_capital">Return of Capital</SelectItem>
                  <SelectItem value="draw">Owner Draw</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Single Member Selection */}
          {!distributeToAll && (
            <>
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
                        {member.name} ({member.ownership_pct}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Amount *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-9"
                    value={formData.total_amount}
                    onChange={(e) => handleChange('total_amount', e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {/* Multiple Member Distribution */}
          {distributeToAll && (
            <div className="space-y-3">
              <div className="grid gap-2">
                <Label>Total Distribution Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-9"
                    value={formData.total_amount}
                    onChange={(e) => handleChange('total_amount', e.target.value)}
                  />
                </div>
              </div>

              <Label>Distribution by Member</Label>
              <div className="border rounded-lg overflow-hidden">
                {mockMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.ownership_pct}% ownership</p>
                    </div>
                    <div className="relative w-32">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-9 text-right"
                        value={memberAmounts[member.id] || ''}
                        onChange={(e) => handleMemberAmountChange(member.id, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 bg-gray-50 font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(totalDistribution)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="grid gap-2">
            <Label>Description</Label>
            <Input
              placeholder="e.g., Q4 2024 profit distribution"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
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
            {loading ? 'Saving...' : 'Record Distribution'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DistributionForm;
