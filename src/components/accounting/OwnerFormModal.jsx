// src/components/accounting/OwnerFormModal.jsx
// Modal for adding or editing entity owners

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Users, Loader2, AlertCircle, Building2, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const OWNER_TYPES = [
  { value: 'individual', label: 'Individual', icon: User },
  { value: 'entity', label: 'Entity/Company', icon: Building2 },
];

const TAX_CLASSIFICATIONS = [
  { value: 'individual', label: 'Individual (SSN)' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'corporation', label: 'C Corporation' },
  { value: 's_corporation', label: 'S Corporation' },
  { value: 'llc_single', label: 'Single-Member LLC' },
  { value: 'llc_partnership', label: 'Multi-Member LLC' },
  { value: 'trust', label: 'Trust' },
  { value: 'estate', label: 'Estate' },
];

export default function OwnerFormModal({ open, onClose, entityId, owner = null }) {
  const queryClient = useQueryClient();
  const isEditing = !!owner;

  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    owner_type: 'individual',
    name: '',
    email: '',
    phone: '',
    address: '',
    ownership_percentage: '',
    capital_contribution: '',
    profit_sharing_percentage: '',
    loss_sharing_percentage: '',
    tax_classification: 'individual',
    tax_id: '',
    effective_date: new Date().toISOString().split('T')[0],
    is_managing_member: false,
    voting_rights: true,
    notes: '',
  });

  // Reset form when modal opens or owner changes
  useEffect(() => {
    if (open) {
      if (owner) {
        setFormData({
          owner_type: owner.owner_type || 'individual',
          name: owner.name || '',
          email: owner.email || '',
          phone: owner.phone || '',
          address: owner.address || '',
          ownership_percentage: owner.ownership?.toString() || owner.ownership_percentage?.toString() || '',
          capital_contribution: owner.capitalAccount?.toString() || owner.capital_contribution?.toString() || '',
          profit_sharing_percentage: owner.profit_sharing_percentage?.toString() || '',
          loss_sharing_percentage: owner.loss_sharing_percentage?.toString() || '',
          tax_classification: owner.tax_classification || 'individual',
          tax_id: owner.tax_id || '',
          effective_date: owner.effective_date || new Date().toISOString().split('T')[0],
          is_managing_member: owner.is_managing_member || false,
          voting_rights: owner.voting_rights !== false,
          notes: owner.notes || '',
        });
      } else {
        setFormData({
          owner_type: 'individual',
          name: '',
          email: '',
          phone: '',
          address: '',
          ownership_percentage: '',
          capital_contribution: '',
          profit_sharing_percentage: '',
          loss_sharing_percentage: '',
          tax_classification: 'individual',
          tax_id: '',
          effective_date: new Date().toISOString().split('T')[0],
          is_managing_member: false,
          voting_rights: true,
          notes: '',
        });
      }
      setError(null);
    }
  }, [open, owner]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  // Auto-fill profit/loss sharing when ownership changes
  const handleOwnershipChange = (value) => {
    const newData = { ...formData, ownership_percentage: value };
    // If profit/loss sharing are empty, auto-fill them
    if (!formData.profit_sharing_percentage) {
      newData.profit_sharing_percentage = value;
    }
    if (!formData.loss_sharing_percentage) {
      newData.loss_sharing_percentage = value;
    }
    setFormData(newData);
    setError(null);
  };

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const ownerData = {
        entity_id: entityId,
        owner_type: data.owner_type,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        ownership_percentage: data.ownership_percentage ? parseFloat(data.ownership_percentage) : 0,
        capital_contribution: data.capital_contribution ? parseFloat(data.capital_contribution) : 0,
        profit_sharing_percentage: data.profit_sharing_percentage ? parseFloat(data.profit_sharing_percentage) : null,
        loss_sharing_percentage: data.loss_sharing_percentage ? parseFloat(data.loss_sharing_percentage) : null,
        tax_classification: data.tax_classification,
        tax_id: data.tax_id || null,
        effective_date: data.effective_date,
        is_managing_member: data.is_managing_member,
        voting_rights: data.voting_rights,
        notes: data.notes || null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('entity_owners')
          .update(ownerData)
          .eq('id', owner.id);
        if (error) throw error;
      } else {
        ownerData.created_at = new Date().toISOString();
        const { error } = await supabase
          .from('entity_owners')
          .insert([ownerData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['entity-owners', entityId]);
      onClose();
    },
    onError: (err) => {
      setError(err.message || 'Failed to save owner');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Owner name is required');
      return;
    }
    if (!formData.ownership_percentage || parseFloat(formData.ownership_percentage) <= 0) {
      setError('Ownership percentage is required and must be greater than 0');
      return;
    }
    if (parseFloat(formData.ownership_percentage) > 100) {
      setError('Ownership percentage cannot exceed 100%');
      return;
    }

    saveMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {isEditing ? 'Edit Owner' : 'Add Owner'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Owner Type */}
          <div className="space-y-2">
            <Label>Owner Type *</Label>
            <div className="grid grid-cols-2 gap-4">
              {OWNER_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleChange('owner_type', type.value)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-lg border-2 transition-colors",
                      formData.owner_type === type.value
                        ? "border-[#047857] bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5",
                      formData.owner_type === type.value ? "text-[#047857]" : "text-gray-500"
                    )} />
                    <span className="font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name & Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {formData.owner_type === 'individual' ? 'Full Name' : 'Entity Name'} *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder={formData.owner_type === 'individual' ? 'John Smith' : 'ABC Holdings LLC'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@example.com"
              />
            </div>
          </div>

          {/* Phone & Address */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="effective_date">Effective Date</Label>
              <Input
                id="effective_date"
                type="date"
                value={formData.effective_date}
                onChange={(e) => handleChange('effective_date', e.target.value)}
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="123 Main St, City, State 12345"
              rows={2}
            />
          </div>

          {/* Ownership & Capital */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Ownership Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ownership_percentage">Ownership % *</Label>
                <div className="relative">
                  <Input
                    id="ownership_percentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.ownership_percentage}
                    onChange={(e) => handleOwnershipChange(e.target.value)}
                    placeholder="25"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capital_contribution">Capital Contribution</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="capital_contribution"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.capital_contribution}
                    onChange={(e) => handleChange('capital_contribution', e.target.value)}
                    placeholder="100000"
                    className="pl-7"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="profit_sharing_percentage">Profit Sharing %</Label>
                <div className="relative">
                  <Input
                    id="profit_sharing_percentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.profit_sharing_percentage}
                    onChange={(e) => handleChange('profit_sharing_percentage', e.target.value)}
                    placeholder="Same as ownership"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="loss_sharing_percentage">Loss Sharing %</Label>
                <div className="relative">
                  <Input
                    id="loss_sharing_percentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.loss_sharing_percentage}
                    onChange={(e) => handleChange('loss_sharing_percentage', e.target.value)}
                    placeholder="Same as ownership"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tax Information */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Tax Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tax Classification</Label>
                <Select
                  value={formData.tax_classification}
                  onValueChange={(value) => handleChange('tax_classification', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select classification" />
                  </SelectTrigger>
                  <SelectContent>
                    {TAX_CLASSIFICATIONS.map((classification) => (
                      <SelectItem key={classification.value} value={classification.value}>
                        {classification.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_id">
                  {formData.owner_type === 'individual' ? 'SSN' : 'EIN'}
                </Label>
                <Input
                  id="tax_id"
                  value={formData.tax_id}
                  onChange={(e) => handleChange('tax_id', e.target.value)}
                  placeholder={formData.owner_type === 'individual' ? 'XXX-XX-XXXX' : 'XX-XXXXXXX'}
                />
              </div>
            </div>
          </div>

          {/* Switches */}
          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Managing Member</Label>
                <p className="text-xs text-gray-500">Has authority to make management decisions</p>
              </div>
              <Switch
                checked={formData.is_managing_member}
                onCheckedChange={(checked) => handleChange('is_managing_member', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Voting Rights</Label>
                <p className="text-xs text-gray-500">Can vote on major company decisions</p>
              </div>
              <Switch
                checked={formData.voting_rights}
                onCheckedChange={(checked) => handleChange('voting_rights', checked)}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes about this owner..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="bg-[#047857] hover:bg-[#065f46]"
            >
              {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Add Owner'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
