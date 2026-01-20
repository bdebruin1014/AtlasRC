import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const CONTACT_TYPES = [
  { value: 'seller', label: 'Seller' },
  { value: 'buyer', label: 'Buyer' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'investor', label: 'Investor' },
  { value: 'other', label: 'Other' },
];

export default function ContactModal({ open, onClose, contact, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    company: '',
    contact_type: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (contact) {
      setFormData({
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        company: contact.company || '',
        contact_type: contact.contact_type || '',
        email: contact.email || '',
        phone: contact.phone || '',
        notes: contact.notes || '',
      });
    }
  }, [contact, open]);

  const validate = () => {
    const errs = {};
    if (!formData.first_name) errs.first_name = 'First name required';
    if (!formData.last_name) errs.last_name = 'Last name required';
    if (!formData.contact_type) errs.contact_type = 'Contact type required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contact ? 'Edit Contact' : 'New Contact'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CONTACT INFORMATION */}
          <div>
            <h4 className="font-medium mb-2">Contact Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input value={formData.first_name} onChange={e => handleChange('first_name', e.target.value)} required />
                {errors.first_name && <div className="text-xs text-red-500 mt-1">{errors.first_name}</div>}
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input value={formData.last_name} onChange={e => handleChange('last_name', e.target.value)} required />
                {errors.last_name && <div className="text-xs text-red-500 mt-1">{errors.last_name}</div>}
              </div>
              <div>
                <Label>Company</Label>
                <Input value={formData.company} onChange={e => handleChange('company', e.target.value)} />
              </div>
              <div>
                <Label>Contact Type *</Label>
                <Select value={formData.contact_type} onValueChange={v => handleChange('contact_type', v)} required>
                  <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                  <SelectContent>
                    {CONTACT_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.contact_type && <div className="text-xs text-red-500 mt-1">{errors.contact_type}</div>}
              </div>
            </div>
          </div>
          {/* CONTACT DETAILS */}
          <div>
            <h4 className="font-medium mb-2">Contact Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input value={formData.email} onChange={e => handleChange('email', e.target.value)} type="email" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={formData.phone} onChange={e => handleChange('phone', e.target.value)} type="tel" />
              </div>
            </div>
          </div>
          {/* NOTES */}
          <div>
            <h4 className="font-medium mb-2">Notes</h4>
            <Textarea value={formData.notes} onChange={e => handleChange('notes', e.target.value)} rows={3} />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Contact'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
