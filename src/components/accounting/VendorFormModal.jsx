import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Building2, Mail, Phone, MapPin, CreditCard } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const VENDOR_TYPES = [
  { value: 'subcontractor', label: 'Subcontractor' },
  { value: 'supplier', label: 'Supplier' },
  { value: 'service', label: 'Service Provider' },
  { value: 'utility', label: 'Utility' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'other', label: 'Other' },
];

const PAYMENT_TERMS = [
  { value: 'due_on_receipt', label: 'Due on Receipt' },
  { value: 'net_10', label: 'Net 10' },
  { value: 'net_15', label: 'Net 15' },
  { value: 'net_30', label: 'Net 30' },
  { value: 'net_45', label: 'Net 45' },
  { value: 'net_60', label: 'Net 60' },
];

const PAYMENT_METHODS = [
  { value: 'check', label: 'Check' },
  { value: 'ach', label: 'ACH Transfer' },
  { value: 'wire', label: 'Wire Transfer' },
  { value: 'credit_card', label: 'Credit Card' },
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export default function VendorFormModal({ open, onClose, entityId, vendor }) {
  const queryClient = useQueryClient();
  const isEditing = !!vendor;

  const [formData, setFormData] = useState({
    vendor_type: 'subcontractor',
    company_name: '',
    display_name: '',
    contact_first_name: '',
    contact_last_name: '',
    email: '',
    phone: '',
    mobile: '',
    website: '',
    // Address
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip: '',
    // Payment info
    payment_terms: 'net_30',
    payment_method: 'check',
    tax_id: '',
    w9_on_file: false,
    // Banking
    bank_name: '',
    bank_routing: '',
    bank_account: '',
    // Additional
    default_expense_account: '',
    notes: '',
    is_1099: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (vendor) {
      setFormData({
        vendor_type: vendor.vendor_type || 'subcontractor',
        company_name: vendor.company_name || '',
        display_name: vendor.display_name || '',
        contact_first_name: vendor.contact_first_name || '',
        contact_last_name: vendor.contact_last_name || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        mobile: vendor.mobile || '',
        website: vendor.website || '',
        address_line1: vendor.address_line1 || '',
        address_line2: vendor.address_line2 || '',
        city: vendor.city || '',
        state: vendor.state || '',
        zip: vendor.zip || '',
        payment_terms: vendor.payment_terms || 'net_30',
        payment_method: vendor.payment_method || 'check',
        tax_id: vendor.tax_id || '',
        w9_on_file: vendor.w9_on_file || false,
        bank_name: vendor.bank_name || '',
        bank_routing: vendor.bank_routing || '',
        bank_account: vendor.bank_account || '',
        default_expense_account: vendor.default_expense_account || '',
        notes: vendor.notes || '',
        is_1099: vendor.is_1099 || false,
      });
    }
  }, [vendor]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        entity_id: entityId,
        ...data,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('vendors')
          .update(payload)
          .eq('id', vendor.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('vendors')
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['vendors', entityId]);
      handleClose();
    }
  });

  const validate = () => {
    const newErrors = {};
    if (!formData.company_name.trim()) newErrors.company_name = 'Company name is required';
    if (!formData.display_name.trim()) newErrors.display_name = 'Display name is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate(formData);
  };

  const handleClose = () => {
    setFormData({
      vendor_type: 'subcontractor',
      company_name: '',
      display_name: '',
      contact_first_name: '',
      contact_last_name: '',
      email: '',
      phone: '',
      mobile: '',
      website: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      zip: '',
      payment_terms: 'net_30',
      payment_method: 'check',
      tax_id: '',
      w9_on_file: false,
      bank_name: '',
      bank_routing: '',
      bank_account: '',
      default_expense_account: '',
      notes: '',
      is_1099: false,
    });
    setErrors({});
    onClose();
  };

  const updateDisplayName = () => {
    if (formData.company_name && !formData.display_name) {
      setFormData(prev => ({ ...prev, display_name: formData.company_name }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Vendor' : 'New Vendor'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update vendor information' : 'Add a new vendor to your accounts'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="banking">Banking</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-4">
              {/* Vendor Type */}
              <div className="space-y-2">
                <Label>Vendor Type</Label>
                <Select
                  value={formData.vendor_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, vendor_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VENDOR_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="company_name"
                    placeholder="Company name"
                    value={formData.company_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                    onBlur={updateDisplayName}
                    className={`pl-9 ${errors.company_name ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.company_name && <p className="text-sm text-red-500">{errors.company_name}</p>}
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name *</Label>
                <Input
                  id="display_name"
                  placeholder="How this vendor appears on bills"
                  value={formData.display_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                  className={errors.display_name ? 'border-red-500' : ''}
                />
                {errors.display_name && <p className="text-sm text-red-500">{errors.display_name}</p>}
              </div>

              {/* Contact Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_first_name">Contact First Name</Label>
                  <Input
                    id="contact_first_name"
                    placeholder="First name"
                    value={formData.contact_first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_first_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_last_name">Contact Last Name</Label>
                  <Input
                    id="contact_last_name"
                    placeholder="Last name"
                    value={formData.contact_last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_last_name: e.target.value }))}
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className={`pl-9 ${errors.email ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      placeholder="(555) 555-5555"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile</Label>
                  <Input
                    id="mobile"
                    placeholder="(555) 555-5555"
                    value={formData.mobile}
                    onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    placeholder="www.example.com"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="address" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <Label className="text-base font-medium">Business Address</Label>
              </div>
              <div className="space-y-3">
                <Input
                  placeholder="Address Line 1"
                  value={formData.address_line1}
                  onChange={(e) => setFormData(prev => ({ ...prev, address_line1: e.target.value }))}
                />
                <Input
                  placeholder="Address Line 2"
                  value={formData.address_line2}
                  onChange={(e) => setFormData(prev => ({ ...prev, address_line2: e.target.value }))}
                />
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  />
                  <Select
                    value={formData.state}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="State" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="ZIP"
                    value={formData.zip}
                    onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="payment" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Payment Terms</Label>
                  <Select
                    value={formData.payment_terms}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, payment_terms: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_TERMS.map(term => (
                        <SelectItem key={term.value} value={term.value}>
                          {term.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Preferred Payment Method</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
                  >
                    <SelectTrigger>
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
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_id">Tax ID / EIN</Label>
                <Input
                  id="tax_id"
                  placeholder="XX-XXXXXXX"
                  value={formData.tax_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, tax_id: e.target.value }))}
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.w9_on_file}
                    onChange={(e) => setFormData(prev => ({ ...prev, w9_on_file: e.target.checked }))}
                    className="rounded"
                  />
                  W-9 on file
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.is_1099}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_1099: e.target.checked }))}
                    className="rounded"
                  />
                  1099 Vendor
                </label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Internal notes about this vendor..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="banking" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <Label className="text-base font-medium">ACH Payment Information</Label>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Optional. Required for ACH payments.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bank_name">Bank Name</Label>
                  <Input
                    id="bank_name"
                    placeholder="Bank name"
                    value={formData.bank_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank_routing">Routing Number</Label>
                    <Input
                      id="bank_routing"
                      placeholder="9 digits"
                      value={formData.bank_routing}
                      onChange={(e) => setFormData(prev => ({ ...prev, bank_routing: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank_account">Account Number</Label>
                    <Input
                      id="bank_account"
                      placeholder="Account number"
                      value={formData.bank_account}
                      onChange={(e) => setFormData(prev => ({ ...prev, bank_account: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditing ? 'Saving...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Save Changes' : 'Create Vendor'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
