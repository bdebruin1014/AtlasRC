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
import { Loader2, User, Building2, Mail, Phone, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const CUSTOMER_TYPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'company', label: 'Company' },
  { value: 'trust', label: 'Trust' },
  { value: 'llc', label: 'LLC' },
  { value: 'partnership', label: 'Partnership' },
];

const PAYMENT_TERMS = [
  { value: 'due_on_receipt', label: 'Due on Receipt' },
  { value: 'net_15', label: 'Net 15' },
  { value: 'net_30', label: 'Net 30' },
  { value: 'net_45', label: 'Net 45' },
  { value: 'net_60', label: 'Net 60' },
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export default function CustomerFormModal({ open, onClose, entityId, customer }) {
  const queryClient = useQueryClient();
  const isEditing = !!customer;

  const [formData, setFormData] = useState({
    customer_type: 'individual',
    company_name: '',
    first_name: '',
    last_name: '',
    display_name: '',
    email: '',
    phone: '',
    mobile: '',
    website: '',
    // Billing address
    billing_address_line1: '',
    billing_address_line2: '',
    billing_city: '',
    billing_state: '',
    billing_zip: '',
    // Shipping address
    shipping_same_as_billing: true,
    shipping_address_line1: '',
    shipping_address_line2: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip: '',
    // Additional info
    payment_terms: 'net_30',
    credit_limit: '',
    tax_id: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (customer) {
      setFormData({
        customer_type: customer.customer_type || 'individual',
        company_name: customer.company_name || '',
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        display_name: customer.display_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        mobile: customer.mobile || '',
        website: customer.website || '',
        billing_address_line1: customer.billing_address_line1 || '',
        billing_address_line2: customer.billing_address_line2 || '',
        billing_city: customer.billing_city || '',
        billing_state: customer.billing_state || '',
        billing_zip: customer.billing_zip || '',
        shipping_same_as_billing: customer.shipping_same_as_billing ?? true,
        shipping_address_line1: customer.shipping_address_line1 || '',
        shipping_address_line2: customer.shipping_address_line2 || '',
        shipping_city: customer.shipping_city || '',
        shipping_state: customer.shipping_state || '',
        shipping_zip: customer.shipping_zip || '',
        payment_terms: customer.payment_terms || 'net_30',
        credit_limit: customer.credit_limit?.toString() || '',
        tax_id: customer.tax_id || '',
        notes: customer.notes || '',
      });
    }
  }, [customer]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        entity_id: entityId,
        ...data,
        credit_limit: data.credit_limit ? parseFloat(data.credit_limit) : null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('customers')
          .update(payload)
          .eq('id', customer.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('customers')
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['customers', entityId]);
      handleClose();
    }
  });

  const validate = () => {
    const newErrors = {};

    if (formData.customer_type === 'individual') {
      if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
      if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    } else {
      if (!formData.company_name.trim()) newErrors.company_name = 'Company name is required';
    }

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
      customer_type: 'individual',
      company_name: '',
      first_name: '',
      last_name: '',
      display_name: '',
      email: '',
      phone: '',
      mobile: '',
      website: '',
      billing_address_line1: '',
      billing_address_line2: '',
      billing_city: '',
      billing_state: '',
      billing_zip: '',
      shipping_same_as_billing: true,
      shipping_address_line1: '',
      shipping_address_line2: '',
      shipping_city: '',
      shipping_state: '',
      shipping_zip: '',
      payment_terms: 'net_30',
      credit_limit: '',
      tax_id: '',
      notes: '',
    });
    setErrors({});
    onClose();
  };

  const updateDisplayName = () => {
    if (formData.customer_type === 'individual') {
      const name = `${formData.first_name} ${formData.last_name}`.trim();
      if (name && !formData.display_name) {
        setFormData(prev => ({ ...prev, display_name: name }));
      }
    } else {
      if (formData.company_name && !formData.display_name) {
        setFormData(prev => ({ ...prev, display_name: formData.company_name }));
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Customer' : 'New Customer'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update customer information' : 'Add a new customer to your accounts'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-4">
              {/* Customer Type */}
              <div className="space-y-2">
                <Label>Customer Type</Label>
                <Select
                  value={formData.customer_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, customer_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CUSTOMER_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Company Name (for non-individual) */}
              {formData.customer_type !== 'individual' && (
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
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">
                    First Name {formData.customer_type === 'individual' && '*'}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="first_name"
                      placeholder="First name"
                      value={formData.first_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                      onBlur={updateDisplayName}
                      className={`pl-9 ${errors.first_name ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.first_name && <p className="text-sm text-red-500">{errors.first_name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">
                    Last Name {formData.customer_type === 'individual' && '*'}
                  </Label>
                  <Input
                    id="last_name"
                    placeholder="Last name"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    onBlur={updateDisplayName}
                    className={errors.last_name ? 'border-red-500' : ''}
                  />
                  {errors.last_name && <p className="text-sm text-red-500">{errors.last_name}</p>}
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name *</Label>
                <Input
                  id="display_name"
                  placeholder="How this customer appears on invoices"
                  value={formData.display_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                  className={errors.display_name ? 'border-red-500' : ''}
                />
                {errors.display_name && <p className="text-sm text-red-500">{errors.display_name}</p>}
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
              {/* Billing Address */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-base font-medium">Billing Address</Label>
                </div>
                <div className="space-y-3 pl-6">
                  <Input
                    placeholder="Address Line 1"
                    value={formData.billing_address_line1}
                    onChange={(e) => setFormData(prev => ({ ...prev, billing_address_line1: e.target.value }))}
                  />
                  <Input
                    placeholder="Address Line 2"
                    value={formData.billing_address_line2}
                    onChange={(e) => setFormData(prev => ({ ...prev, billing_address_line2: e.target.value }))}
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      placeholder="City"
                      value={formData.billing_city}
                      onChange={(e) => setFormData(prev => ({ ...prev, billing_city: e.target.value }))}
                    />
                    <Select
                      value={formData.billing_state}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, billing_state: value }))}
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
                      value={formData.billing_zip}
                      onChange={(e) => setFormData(prev => ({ ...prev, billing_zip: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <Label className="text-base font-medium">Shipping Address</Label>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.shipping_same_as_billing}
                      onChange={(e) => setFormData(prev => ({ ...prev, shipping_same_as_billing: e.target.checked }))}
                      className="rounded"
                    />
                    Same as billing
                  </label>
                </div>
                {!formData.shipping_same_as_billing && (
                  <div className="space-y-3 pl-6">
                    <Input
                      placeholder="Address Line 1"
                      value={formData.shipping_address_line1}
                      onChange={(e) => setFormData(prev => ({ ...prev, shipping_address_line1: e.target.value }))}
                    />
                    <Input
                      placeholder="Address Line 2"
                      value={formData.shipping_address_line2}
                      onChange={(e) => setFormData(prev => ({ ...prev, shipping_address_line2: e.target.value }))}
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        placeholder="City"
                        value={formData.shipping_city}
                        onChange={(e) => setFormData(prev => ({ ...prev, shipping_city: e.target.value }))}
                      />
                      <Select
                        value={formData.shipping_state}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, shipping_state: value }))}
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
                        value={formData.shipping_zip}
                        onChange={(e) => setFormData(prev => ({ ...prev, shipping_zip: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 mt-4">
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
                  <Label htmlFor="credit_limit">Credit Limit</Label>
                  <Input
                    id="credit_limit"
                    type="number"
                    placeholder="0.00"
                    value={formData.credit_limit}
                    onChange={(e) => setFormData(prev => ({ ...prev, credit_limit: e.target.value }))}
                  />
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

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Internal notes about this customer..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
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
                isEditing ? 'Save Changes' : 'Create Customer'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
