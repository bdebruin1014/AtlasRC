import React, { useState, useEffect } from 'react';
import { User, Building2, Mail, Phone, Calendar, Percent } from 'lucide-react';
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

const MemberForm = ({ isOpen, onClose, entityId, existingMember, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    member_type: 'individual',
    ownership_pct: '',
    email: '',
    phone: '',
    tax_id: '',
    address: '',
    joined_date: new Date().toISOString().split('T')[0],
    status: 'active',
    notes: '',
  });

  useEffect(() => {
    if (existingMember) {
      setFormData({
        name: existingMember.name || '',
        member_type: existingMember.member_type || 'individual',
        ownership_pct: existingMember.ownership_pct?.toString() || '',
        email: existingMember.email || '',
        phone: existingMember.phone || '',
        tax_id: existingMember.tax_id || '',
        address: existingMember.address || '',
        joined_date: existingMember.joined_date || '',
        status: existingMember.status || 'active',
        notes: existingMember.notes || '',
      });
    } else {
      setFormData({
        name: '',
        member_type: 'individual',
        ownership_pct: '',
        email: '',
        phone: '',
        tax_id: '',
        address: '',
        joined_date: new Date().toISOString().split('T')[0],
        status: 'active',
        notes: '',
      });
    }
  }, [existingMember, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.ownership_pct) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in name and ownership percentage.',
      });
      return;
    }

    const ownershipPct = parseFloat(formData.ownership_pct);
    if (isNaN(ownershipPct) || ownershipPct < 0 || ownershipPct > 100) {
      toast({
        variant: 'destructive',
        title: 'Invalid Ownership',
        description: 'Ownership percentage must be between 0 and 100.',
      });
      return;
    }

    setLoading(true);
    try {
      const memberData = {
        entity_id: entityId,
        name: formData.name,
        member_type: formData.member_type,
        ownership_pct: ownershipPct,
        email: formData.email,
        phone: formData.phone,
        tax_id: formData.tax_id,
        address: formData.address,
        joined_date: formData.joined_date,
        status: formData.status,
        notes: formData.notes,
      };

      if (existingMember) {
        await capitalService.updateMember(existingMember.id, memberData);
      } else {
        await capitalService.createMember(memberData);
      }

      toast({
        title: 'Success',
        description: `Member ${existingMember ? 'updated' : 'added'} successfully.`,
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save member.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {existingMember ? 'Edit Member' : 'Add New Member'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Member Type */}
          <div className="grid gap-2">
            <Label>Member Type</Label>
            <Select
              value={formData.member_type}
              onValueChange={(value) => handleChange('member_type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" /> Individual
                  </div>
                </SelectItem>
                <SelectItem value="entity">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Entity / Company
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Name */}
          <div className="grid gap-2">
            <Label>
              {formData.member_type === 'entity' ? 'Entity Name *' : 'Full Name *'}
            </Label>
            <Input
              placeholder={formData.member_type === 'entity' ? 'Company LLC' : 'John Smith'}
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Ownership */}
            <div className="grid gap-2">
              <Label>Ownership % *</Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="0.00"
                  value={formData.ownership_pct}
                  onChange={(e) => handleChange('ownership_pct', e.target.value)}
                />
                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Status */}
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tax ID */}
          <div className="grid gap-2">
            <Label>{formData.member_type === 'entity' ? 'EIN' : 'SSN / Tax ID'}</Label>
            <Input
              placeholder={formData.member_type === 'entity' ? 'XX-XXXXXXX' : 'XXX-XX-XXXX'}
              value={formData.tax_id}
              onChange={(e) => handleChange('tax_id', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Email */}
            <div className="grid gap-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="email@example.com"
                  className="pl-9"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="grid gap-2">
              <Label>Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="(555) 555-5555"
                  className="pl-9"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Joined Date */}
          <div className="grid gap-2">
            <Label>Joined Date</Label>
            <Input
              type="date"
              value={formData.joined_date}
              onChange={(e) => handleChange('joined_date', e.target.value)}
            />
          </div>

          {/* Address */}
          <div className="grid gap-2">
            <Label>Address</Label>
            <Textarea
              placeholder="Full mailing address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              rows={2}
            />
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Internal notes..."
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
            {loading ? 'Saving...' : existingMember ? 'Update Member' : 'Add Member'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MemberForm;
