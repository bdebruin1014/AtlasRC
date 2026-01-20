import React, { useState, useEffect } from 'react';
import { Building2, User, Phone, Mail, MapPin, Globe, FileText } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { vendorService } from '@/services/vendorService';

const vendorTypes = [
  'Contractor',
  'Subcontractor',
  'Supplier',
  'Professional Services',
  'Utility',
  'Government',
  'Insurance',
  'Other',
];

const VendorForm = ({ isOpen, onClose, entityId, existingVendor, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  const [formData, setFormData] = useState({
    // General
    name: '',
    vendor_type: '',
    tax_id: '',
    account_number: '',
    status: 'active',
    
    // Contact
    contact_name: '',
    phone: '',
    email: '',
    website: '',
    
    // Address
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA',
    
    // Payment
    payment_terms: '30',
    default_expense_account: '',
    
    // Notes
    notes: '',
  });

  useEffect(() => {
    if (existingVendor) {
      setFormData({
        name: existingVendor.name || '',
        vendor_type: existingVendor.vendor_type || '',
        tax_id: existingVendor.tax_id || '',
        account_number: existingVendor.account_number || '',
        status: existingVendor.status || 'active',
        contact_name: existingVendor.contact_name || '',
        phone: existingVendor.phone || '',
        email: existingVendor.email || '',
        website: existingVendor.website || '',
        address_line1: existingVendor.address_line1 || '',
        address_line2: existingVendor.address_line2 || '',
        city: existingVendor.city || '',
        state: existingVendor.state || '',
        zip: existingVendor.zip || '',
        country: existingVendor.country || 'USA',
        payment_terms: existingVendor.payment_terms || '30',
        default_expense_account: existingVendor.default_expense_account || '',
        notes: existingVendor.notes || '',
      });
    } else {
      // Reset form
      setFormData({
        name: '',
        vendor_type: '',
        tax_id: '',
        account_number: '',
        status: 'active',
        contact_name: '',
        phone: '',
        email: '',
        website: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        zip: '',
        country: 'USA',
        payment_terms: '30',
        default_expense_account: '',
        notes: '',
      });
    }
    setActiveTab('general');
  }, [existingVendor, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Vendor name is required.',
      });
      return;
    }

    setLoading(true);
    try {
      const vendorData = {
        entity_id: entityId,
        ...formData,
      };

      if (existingVendor) {
        await vendorService.update(existingVendor.id, vendorData);
      } else {
        await vendorService.create(vendorData);
      }

      toast({
        title: 'Success',
        description: `Vendor ${existingVendor ? 'updated' : 'created'} successfully.`,
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save vendor.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {existingVendor ? 'Edit Vendor' : 'New Vendor'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="address">Address</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto py-4">
            {/* General Tab */}
            <TabsContent value="general" className="space-y-4 mt-0">
              <div className="grid gap-2">
                <Label>Vendor Name *</Label>
                <Input
                  placeholder="Company or individual name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Vendor Type</Label>
                  <Select
                    value={formData.vendor_type}
                    onValueChange={(value) => handleChange('vendor_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendorTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Tax ID / EIN</Label>
                  <Input
                    placeholder="XX-XXXXXXX"
                    value={formData.tax_id}
                    onChange={(e) => handleChange('tax_id', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Account Number</Label>
                  <Input
                    placeholder="Your account with vendor"
                    value={formData.account_number}
                    onChange={(e) => handleChange('account_number', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="space-y-4 mt-0">
              <div className="grid gap-2">
                <Label>Contact Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Primary contact person"
                    className="pl-9"
                    value={formData.contact_name}
                    onChange={(e) => handleChange('contact_name', e.target.value)}
                  />
                </div>
              </div>

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

              <div className="grid gap-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="vendor@example.com"
                    className="pl-9"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="https://www.example.com"
                    className="pl-9"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Address Tab */}
            <TabsContent value="address" className="space-y-4 mt-0">
              <div className="grid gap-2">
                <Label>Address Line 1</Label>
                <Input
                  placeholder="Street address"
                  value={formData.address_line1}
                  onChange={(e) => handleChange('address_line1', e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label>Address Line 2</Label>
                <Input
                  placeholder="Suite, unit, building, floor, etc."
                  value={formData.address_line2}
                  onChange={(e) => handleChange('address_line2', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-6 gap-4">
                <div className="col-span-3 grid gap-2">
                  <Label>City</Label>
                  <Input
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                  />
                </div>
                <div className="col-span-1 grid gap-2">
                  <Label>State</Label>
                  <Input
                    placeholder="SC"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                  />
                </div>
                <div className="col-span-2 grid gap-2">
                  <Label>ZIP Code</Label>
                  <Input
                    placeholder="29601"
                    value={formData.zip}
                    onChange={(e) => handleChange('zip', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Payment Tab */}
            <TabsContent value="payment" className="space-y-4 mt-0">
              <div className="grid gap-2">
                <Label>Default Payment Terms</Label>
                <Select
                  value={formData.payment_terms}
                  onValueChange={(value) => handleChange('payment_terms', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Due on Receipt</SelectItem>
                    <SelectItem value="15">Net 15</SelectItem>
                    <SelectItem value="30">Net 30</SelectItem>
                    <SelectItem value="45">Net 45</SelectItem>
                    <SelectItem value="60">Net 60</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Internal notes about this vendor..."
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={4}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-[#2F855A] hover:bg-[#276749]"
          >
            {loading ? 'Saving...' : existingVendor ? 'Update Vendor' : 'Create Vendor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VendorForm;
