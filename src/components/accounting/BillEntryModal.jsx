import React, { useState, useEffect } from 'react';
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
  });
  
  const [lineItems, setLineItems] = useState([
    { id: 1, account_id: '', description: '', amount: '', project_id: '' },
  ]);

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
      });
      setLineItems([{ id: 1, account_id: '', description: '', amount: '', project_id: '' }]);
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

  const totalAmount = lineItems.reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0);

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
        amount: totalAmount,
        balance: totalAmount,
        status: 'pending',
        line_items: validLines.map(line => ({
          account_id: parseInt(line.account_id),
          description: line.description,
          amount: parseFloat(line.amount),
          project_id: line.project_id ? parseInt(line.project_id) : null,
        })),
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

              {/* Total */}
              <div className="grid grid-cols-12 gap-2 p-3 border-t bg-gray-50 font-medium">
                <div className="col-span-8 text-right">Total:</div>
                <div className="col-span-3 text-right font-mono text-lg">
                  {formatCurrency(totalAmount)}
                </div>
                <div className="col-span-1"></div>
              </div>
            </div>
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
