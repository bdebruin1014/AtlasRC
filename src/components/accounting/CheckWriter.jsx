import React, { useState } from 'react';
import { X, Printer, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const mockBankAccounts = [
  { id: 1, name: 'Chase Operating', last4: '8821', balance: 245000.50 },
  { id: 2, name: 'Chase Payroll', last4: '9912', balance: 55000.00 },
  { id: 3, name: 'Construction High-Yield', last4: '1102', balance: 945000.00 },
];

const mockVendors = [
  { id: 1, name: 'BuildRight Construction' },
  { id: 2, name: 'ABC Supplies' },
  { id: 3, name: 'Metro Electric' },
  { id: 4, name: 'City Planning' },
];

const CheckWriter = ({ isOpen, onClose, entityName }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    bankAccountId: '',
    payee: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    memo: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.bankAccountId || !formData.payee || !formData.amount) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    toast({
      title: 'Check Created',
      description: `Check for $${formData.amount} to ${formData.payee} has been created.`,
    });
    
    // Reset form
    setFormData({
      bankAccountId: '',
      payee: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      memo: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zip: '',
    });
    
    onClose();
  };

  const handlePrint = () => {
    toast({
      title: 'Print Check',
      description: 'Check sent to printer.',
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Write Check</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Bank Account */}
          <div className="grid gap-2">
            <Label htmlFor="bank">Bank Account *</Label>
            <Select
              value={formData.bankAccountId}
              onValueChange={(value) => handleChange('bankAccountId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bank account" />
              </SelectTrigger>
              <SelectContent>
                {mockBankAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    {account.name} (•••• {account.last4}) - {formatCurrency(account.balance)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div className="grid gap-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
              />
            </div>

            {/* Amount */}
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-9"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Payee */}
          <div className="grid gap-2">
            <Label htmlFor="payee">Pay to the Order of *</Label>
            <Select
              value={formData.payee}
              onValueChange={(value) => handleChange('payee', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select or enter payee" />
              </SelectTrigger>
              <SelectContent>
                {mockVendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.name}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Memo */}
          <div className="grid gap-2">
            <Label htmlFor="memo">Memo</Label>
            <Input
              id="memo"
              placeholder="What is this check for?"
              value={formData.memo}
              onChange={(e) => handleChange('memo', e.target.value)}
            />
          </div>

          {/* Address */}
          <div className="border-t pt-4 mt-2">
            <h4 className="text-sm font-medium mb-3">Mailing Address (Optional)</h4>
            <div className="space-y-3">
              <Input
                placeholder="Address Line 1"
                value={formData.address1}
                onChange={(e) => handleChange('address1', e.target.value)}
              />
              <Input
                placeholder="Address Line 2"
                value={formData.address2}
                onChange={(e) => handleChange('address2', e.target.value)}
              />
              <div className="grid grid-cols-6 gap-2">
                <Input
                  className="col-span-3"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                />
                <Input
                  className="col-span-1"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                />
                <Input
                  className="col-span-2"
                  placeholder="ZIP"
                  value={formData.zip}
                  onChange={(e) => handleChange('zip', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-[#2F855A] hover:bg-[#276749]">
              Save Check
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CheckWriter;
