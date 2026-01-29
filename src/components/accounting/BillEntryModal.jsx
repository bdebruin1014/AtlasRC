import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, DollarSign, Calendar, Building2 } from 'lucide-react';
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
import { billService } from '@/services/billService';
import { formatCurrency } from '@/lib/utils';
import AttachmentUpload from './AttachmentUpload';

// Mock data
const mockVendors = [
  { id: 1, name: 'BuildRight Construction' },
  { id: 2, name: 'ABC Supplies' },
  { id: 3, name: 'Metro Electric' },
  { id: 4, name: 'City Planning' },
  { id: 5, name: 'Legal Partners LLP' },
];

const mockAccounts = [
  { id: 1, number: '5000', name: 'Cost of Goods Sold' },
  { id: 2, number: '6000', name: 'Operating Expenses' },
  { id: 3, number: '6100', name: 'Professional Fees' },
  { id: 4, number: '6200', name: 'Utilities' },
  { id: 5, number: '6300', name: 'Repairs & Maintenance' },
  { id: 6, number: '6400', name: 'Office Supplies' },
  { id: 7, number: '1500', name: 'Fixed Assets' },
];

const mockProjects = [
  { id: 1, name: 'Watson House', code: 'PRJ-001' },
  { id: 2, name: 'Oslo Townhomes', code: 'PRJ-002' },
  { id: 3, name: 'Cedar Mill Apartments', code: 'PRJ-003' },
];

const mockDiscountAccounts = [
  { id: 8, number: '5900', name: 'Purchase Discounts' },
  { id: 9, number: '4900', name: 'Discounts Taken' },
];

const BillEntryModal = ({ isOpen, onClose, entityId, existingBill, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    vendor_id: '',
    bill_number: '',
    bill_date: new Date().toISOString().split('T')[0],
    due_date: '',
    description: '',
    terms: '30',
    memo: '',
    discount_type: 'none', // none, percentage, amount
    discount_value: '',
    discount_account_id: '',
  });
  
  const [lineItems, setLineItems] = useState([
    { id: 1, account_id: '', description: '', amount: '', project_id: '' },
  ]);

  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    if (existingBill) {
      setFormData({
        vendor_id: existingBill.vendor_id?.toString() || '',
        bill_number: existingBill.bill_number || '',
        bill_date: existingBill.bill_date || '',
        due_date: existingBill.due_date || '',
        description: existingBill.description || '',
        terms: existingBill.terms || '30',
        memo: existingBill.memo || '',
        discount_type: existingBill.discount_type || 'none',
        discount_value: existingBill.discount_value?.toString() || '',
        discount_account_id: existingBill.discount_account_id?.toString() || '',
      });
      if (existingBill.line_items?.length > 0) {
        setLineItems(existingBill.line_items.map((item, idx) => ({
          id: idx + 1,
          account_id: item.account_id?.toString() || '',
          description: item.description || '',
          amount: item.amount?.toString() || '',
          project_id: item.project_id?.toString() || '',
        })));
      }
      setAttachments(existingBill.attachments || []);
    } else {
      // Reset form
      setFormData({
        vendor_id: '',
        bill_number: '',
        bill_date: new Date().toISOString().split('T')[0],
        due_date: '',
        description: '',
        terms: '30',
        memo: '',
        discount_type: 'none',
        discount_value: '',
        discount_account_id: '',
      });
      setLineItems([{ id: 1, account_id: '', description: '', amount: '', project_id: '' }]);
      setAttachments([]);
    }
  }, [existingBill, isOpen]);

  // Auto-calculate due date based on terms
  useEffect(() => {
    if (formData.bill_date && formData.terms) {
      const billDate = new Date(formData.bill_date);
      billDate.setDate(billDate.getDate() + parseInt(formData.terms));
      setFormData(prev => ({
        ...prev,
        due_date: billDate.toISOString().split('T')[0],
      }));
    }
  }, [formData.bill_date, formData.terms]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLineChange = (lineId, field, value) => {
    setLineItems(prev => prev.map(line => 
      line.id === lineId ? { ...line, [field]: value } : line
    ));
  };

  const addLine = () => {
    const newId = Math.max(...lineItems.map(l => l.id)) + 1;
    setLineItems(prev => [...prev, { id: newId, account_id: '', description: '', amount: '', project_id: '' }]);
  };

  const removeLine = (lineId) => {
    if (lineItems.length <= 1) {
      toast({
        variant: 'destructive',
        title: 'Cannot Remove',
        description: 'A bill must have at least one line item.',
      });
      return;
    }
    setLineItems(prev => prev.filter(line => line.id !== lineId));
  };

  const subtotal = lineItems.reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0);

  const discountAmount = useMemo(() => {
    if (formData.discount_type === 'none' || !formData.discount_value) return 0;
    const value = parseFloat(formData.discount_value) || 0;
    if (formData.discount_type === 'percentage') {
      return (subtotal * value) / 100;
    }
    return value;
  }, [formData.discount_type, formData.discount_value, subtotal]);

  const totalAmount = subtotal - discountAmount;

  const handleSubmit = async () => {
    // Validation
    if (!formData.vendor_id || !formData.bill_date || !formData.due_date) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in vendor, bill date, and due date.',
      });
      return;
    }

    const validLines = lineItems.filter(line => line.account_id && parseFloat(line.amount) > 0);
    if (validLines.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Line Items',
        description: 'Please add at least one line item with an account and amount.',
      });
      return;
    }

    setLoading(true);
    try {
      const billData = {
        entity_id: entityId,
        vendor_id: parseInt(formData.vendor_id),
        vendor_name: mockVendors.find(v => v.id === parseInt(formData.vendor_id))?.name,
        bill_number: formData.bill_number || `BILL-${Date.now()}`,
        bill_date: formData.bill_date,
        due_date: formData.due_date,
        description: formData.description,
        terms: formData.terms,
        memo: formData.memo,
        subtotal: subtotal,
        discount_type: formData.discount_type,
        discount_value: formData.discount_value ? parseFloat(formData.discount_value) : null,
        discount_amount: discountAmount,
        discount_account_id: formData.discount_account_id ? parseInt(formData.discount_account_id) : null,
        amount: totalAmount,
        balance: totalAmount,
        status: 'pending',
        line_items: validLines.map(line => ({
          account_id: parseInt(line.account_id),
          description: line.description,
          amount: parseFloat(line.amount),
          project_id: line.project_id ? parseInt(line.project_id) : null,
        })),
        attachments: attachments,
      };

      if (existingBill) {
        await billService.update(existingBill.id, billData);
      } else {
        await billService.create(billData);
      }

      toast({
        title: 'Success',
        description: `Bill ${existingBill ? 'updated' : 'created'} successfully.`,
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save bill.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{existingBill ? 'Edit Bill' : 'New Bill'}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Vendor & Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Vendor *</Label>
              <Select
                value={formData.vendor_id}
                onValueChange={(value) => handleChange('vendor_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {mockVendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id.toString()}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Bill Number</Label>
              <Input
                placeholder="Auto-generated if blank"
                value={formData.bill_number}
                onChange={(e) => handleChange('bill_number', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>Bill Date *</Label>
              <Input
                type="date"
                value={formData.bill_date}
                onChange={(e) => handleChange('bill_date', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Terms</Label>
              <Select
                value={formData.terms}
                onValueChange={(value) => handleChange('terms', value)}
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
              <Label>Due Date *</Label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => handleChange('due_date', e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Description</Label>
            <Input
              placeholder="Brief description of this bill"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Line Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLine}>
                <Plus className="w-4 h-4 mr-1" /> Add Line
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 gap-2 p-3 bg-gray-50 text-sm font-medium text-gray-500">
                <div className="col-span-3">Account</div>
                <div className="col-span-3">Description</div>
                <div className="col-span-2">Project</div>
                <div className="col-span-3 text-right">Amount</div>
                <div className="col-span-1"></div>
              </div>

              {lineItems.map((line) => (
                <div key={line.id} className="grid grid-cols-12 gap-2 p-3 border-t items-center">
                  <div className="col-span-3">
                    <Select
                      value={line.account_id}
                      onValueChange={(value) => handleLineChange(line.id, 'account_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Account" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id.toString()}>
                            {account.number} - {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Input
                      placeholder="Description"
                      value={line.description}
                      onChange={(e) => handleLineChange(line.id, 'description', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Select
                      value={line.project_id}
                      onValueChange={(value) => handleLineChange(line.id, 'project_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No Project</SelectItem>
                        {mockProjects.map((project) => (
                          <SelectItem key={project.id} value={project.id.toString()}>
                            {project.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-9 text-right"
                        value={line.amount}
                        onChange={(e) => handleLineChange(line.id, 'amount', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLine(line.id)}
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Totals */}
              <div className="border-t bg-gray-50">
                <div className="grid grid-cols-12 gap-2 p-3">
                  <div className="col-span-8 text-right">Subtotal:</div>
                  <div className="col-span-3 text-right font-mono">
                    {formatCurrency(subtotal)}
                  </div>
                  <div className="col-span-1"></div>
                </div>
                {discountAmount > 0 && (
                  <div className="grid grid-cols-12 gap-2 px-3 pb-2">
                    <div className="col-span-8 text-right text-green-600">
                      Discount ({formData.discount_type === 'percentage' ? `${formData.discount_value}%` : 'Fixed'}):
                    </div>
                    <div className="col-span-3 text-right font-mono text-green-600">
                      -{formatCurrency(discountAmount)}
                    </div>
                    <div className="col-span-1"></div>
                  </div>
                )}
                <div className="grid grid-cols-12 gap-2 p-3 border-t font-bold">
                  <div className="col-span-8 text-right">Total:</div>
                  <div className="col-span-3 text-right font-mono text-lg">
                    {formatCurrency(totalAmount)}
                  </div>
                  <div className="col-span-1"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Discount */}
          <div className="space-y-3">
            <Label>Discount</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs text-gray-500">Type</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(value) => handleChange('discount_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Discount</SelectItem>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="amount">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.discount_type !== 'none' && (
                <>
                  <div className="grid gap-2">
                    <Label className="text-xs text-gray-500">
                      {formData.discount_type === 'percentage' ? 'Percentage' : 'Amount'}
                    </Label>
                    <div className="relative">
                      {formData.discount_type === 'amount' && (
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      )}
                      <Input
                        type="number"
                        step={formData.discount_type === 'percentage' ? '0.1' : '0.01'}
                        placeholder={formData.discount_type === 'percentage' ? '0' : '0.00'}
                        className={formData.discount_type === 'amount' ? 'pl-9' : ''}
                        value={formData.discount_value}
                        onChange={(e) => handleChange('discount_value', e.target.value)}
                      />
                      {formData.discount_type === 'percentage' && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs text-gray-500">Discount Account</Label>
                    <Select
                      value={formData.discount_account_id}
                      onValueChange={(value) => handleChange('discount_account_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockDiscountAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id.toString()}>
                            {account.number} - {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-3">
            <Label>Attachments</Label>
            <AttachmentUpload
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              entityType="bill"
              entityId={existingBill?.id}
              maxFiles={5}
            />
          </div>

          {/* Memo */}
          <div className="grid gap-2">
            <Label>Memo / Notes</Label>
            <Textarea
              placeholder="Internal notes..."
              value={formData.memo}
              onChange={(e) => handleChange('memo', e.target.value)}
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
            {loading ? 'Saving...' : existingBill ? 'Update Bill' : 'Create Bill'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BillEntryModal;
