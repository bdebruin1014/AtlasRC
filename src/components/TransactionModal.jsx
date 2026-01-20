import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/datepicker';
import { useEntities } from '@/hooks/useEntities';
import { useProjects } from '@/hooks/useProjects';
import { useContacts } from '@/hooks/useContacts';

const INCOME_CATEGORIES = [
  'Capital Raise', 'Builder Deposits', 'Lot Sales', 'Rental Income', 'Property Sale', 'Other Income'
];
const EXPENSE_CATEGORIES = [
  'Land Acquisition', 'Construction', 'Professional Fees', 'Contingency', 'Debt Financing', 'Marketing', 'Utilities', 'Property Tax', 'Insurance', 'Repairs & Maintenance', 'Other Expense'
];

export default function TransactionModal({ open, onClose, transaction, onSave, isLoading }) {
  const { entities } = useEntities();
  const { projects } = useProjects();
  const { contacts } = useContacts();
  const [formData, setFormData] = useState({
    transaction_date: '',
    entity_id: '',
    project_id: '',
    transaction_type: '',
    category: '',
    amount: '',
    description: '',
    notes: '',
    vendor_id: '',
    attachments: [],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (transaction) {
      setFormData({
        transaction_date: transaction.transaction_date || '',
        entity_id: transaction.entity_id || '',
        project_id: transaction.project_id || '',
        transaction_type: transaction.transaction_type || '',
        category: transaction.category || '',
        amount: transaction.amount || '',
        description: transaction.description || '',
        notes: transaction.notes || '',
        vendor_id: transaction.vendor_id || '',
        attachments: transaction.attachments || [],
      });
    }
  }, [transaction, open]);

  const validate = () => {
    const errs = {};
    if (!formData.transaction_date) errs.transaction_date = 'Date required';
    if (!formData.entity_id) errs.entity_id = 'Entity required';
    if (!formData.transaction_type) errs.transaction_type = 'Type required';
    if (!formData.category) errs.category = 'Category required';
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) errs.amount = 'Amount required and must be positive';
    if (!formData.description || formData.description.length < 5) errs.description = 'Description required (min 5 chars)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'entity_id') setFormData(prev => ({ ...prev, project_id: '' }));
    if (field === 'transaction_type') setFormData(prev => ({ ...prev, category: '' }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, attachments: Array.from(e.target.files) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await onSave({
      ...formData,
      amount: formData.amount ? parseFloat(formData.amount) : null,
    });
  };

  // Filter projects by selected entity
  const filteredProjects = formData.entity_id ? projects.filter(p => p.entity_id === formData.entity_id) : projects;
  // Category options
  const categoryOptions = formData.transaction_type === 'income' ? INCOME_CATEGORIES : formData.transaction_type === 'expense' ? EXPENSE_CATEGORIES : [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{transaction ? 'Edit Transaction' : 'New Transaction'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TRANSACTION DETAILS */}
          <div>
            <h4 className="font-medium mb-2">Transaction Details</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Date *</Label>
                <DatePicker value={formData.transaction_date} onChange={date => handleChange('transaction_date', date)} required />
                {errors.transaction_date && <div className="text-xs text-red-500 mt-1">{errors.transaction_date}</div>}
              </div>
              <div>
                <Label>Entity *</Label>
                <Select value={formData.entity_id} onValueChange={v => handleChange('entity_id', v)} required>
                  <SelectTrigger><SelectValue placeholder="Select Entity" /></SelectTrigger>
                  <SelectContent>
                    {entities.map(ent => (
                      <SelectItem key={ent.id} value={ent.id}>{ent.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.entity_id && <div className="text-xs text-red-500 mt-1">{errors.entity_id}</div>}
              </div>
              <div>
                <Label>Project</Label>
                <Select value={formData.project_id} onValueChange={v => handleChange('project_id', v)}>
                  <SelectTrigger><SelectValue placeholder="Select Project" /></SelectTrigger>
                  <SelectContent>
                    {filteredProjects.map(proj => (
                      <SelectItem key={proj.id} value={proj.id}>{proj.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* CLASSIFICATION */}
          <div>
            <h4 className="font-medium mb-2">Classification</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type *</Label>
                <Select value={formData.transaction_type} onValueChange={v => handleChange('transaction_type', v)} required>
                  <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
                {errors.transaction_type && <div className="text-xs text-red-500 mt-1">{errors.transaction_type}</div>}
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={v => handleChange('category', v)} required>
                  <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <div className="text-xs text-red-500 mt-1">{errors.category}</div>}
              </div>
            </div>
          </div>

          {/* FINANCIAL INFORMATION */}
          <div>
            <h4 className="font-medium mb-2">Financial Information</h4>
            <div>
              <Label>Amount *</Label>
              <Input type="number" value={formData.amount} onChange={e => handleChange('amount', e.target.value)} required min={0} />
              {errors.amount && <div className="text-xs text-red-500 mt-1">{errors.amount}</div>}
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <Input value={formData.description} onChange={e => handleChange('description', e.target.value)} required minLength={5} />
            {errors.description && <div className="text-xs text-red-500 mt-1">{errors.description}</div>}
            <Label className="mt-2">Notes</Label>
            <Textarea value={formData.notes} onChange={e => handleChange('notes', e.target.value)} rows={3} />
          </div>

          {/* VENDOR/CONTACT */}
          <div>
            <h4 className="font-medium mb-2">Vendor/Contact</h4>
            <Select value={formData.vendor_id} onValueChange={v => handleChange('vendor_id', v)}>
              <SelectTrigger><SelectValue placeholder="Select Vendor/Contact" /></SelectTrigger>
              <SelectContent>
                {contacts.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name} {c.company ? `(${c.company})` : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ATTACHMENTS */}
          <div>
            <h4 className="font-medium mb-2">Attachments</h4>
            <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.xls,.xlsx" onChange={handleFileChange} className="block w-full border rounded p-2" />
            <div className="text-xs text-gray-500 mt-1">Supported: PDF, JPG, PNG, XLS</div>
            {formData.attachments.length > 0 && (
              <ul className="mt-2 text-xs text-gray-700">
                {formData.attachments.map((file, idx) => (
                  <li key={idx}>{file.name || file}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Loader2 } from 'lucide-react';

const INCOME_CATEGORIES = [
  'Sale',
  'Distribution',
  'Rental Income',
  'Interest Income',
  'Other Income',
];

const EXPENSE_CATEGORIES = [
  'Materials',
  'Labor',
  'Permits & Fees',
  'Professional Fees',
  'Utilities',
  'Insurance',
  'Property Tax',
  'Marketing',
  'Office Expenses',
  'Travel',
  'Equipment',
  'Maintenance',
  'Other Expense',
];

const TransactionModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  entities = [],
  projects = [],
  contacts = [], // For vendor dropdown
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    entity_id: '',
    project_id: '',
    transaction_date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    transaction_type: 'expense',
    category: '',
    vendor_id: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [filteredProjects, setFilteredProjects] = useState([]);

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          entity_id: initialData.entity_id || '',
          project_id: initialData.project_id || '',
          transaction_date: initialData.transaction_date || new Date().toISOString().split('T')[0],
          description: initialData.description || '',
          amount: initialData.amount?.toString() || '',
          transaction_type: initialData.transaction_type || 'expense',
          category: initialData.category || '',
          vendor_id: initialData.vendor_id || '',
          notes: initialData.notes || '',
        });
      } else {
        setFormData({
          entity_id: '',
          project_id: '',
          transaction_date: new Date().toISOString().split('T')[0],
          description: '',
          amount: '',
          transaction_type: 'expense',
          category: '',
          vendor_id: '',
          notes: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  // Filter projects when entity changes
  useEffect(() => {
    if (formData.entity_id) {
      const filtered = projects.filter(p => p.entity_id === formData.entity_id);
      setFilteredProjects(filtered);
      
      // Clear project selection if current project doesn't belong to new entity
      if (formData.project_id && !filtered.find(p => p.id === formData.project_id)) {
        setFormData(prev => ({ ...prev, project_id: '' }));
      }
    } else {
      setFilteredProjects(projects);
    }
  }, [formData.entity_id, projects]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset category when transaction type changes
    if (field === 'transaction_type') {
      setFormData(prev => ({ ...prev, [field]: value, category: '' }));
    }
    
    // Clear error when field is edited
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const formatCurrency = (value) => {
    // Remove non-numeric characters except decimal
    const cleaned = value.replace(/[^\d.]/g, '');
    return cleaned;
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.entity_id) {
      newErrors.entity_id = 'Entity is required';
    }
    
    if (!formData.transaction_date) {
      newErrors.transaction_date = 'Date is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    
    if (!formData.transaction_type) {
      newErrors.transaction_type = 'Transaction type is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    // Prepare data for submission
    const submitData = {
      ...formData,
      description: formData.description.trim(),
      amount: parseFloat(formData.amount),
      project_id: formData.project_id || null,
      vendor_id: formData.vendor_id || null,
      notes: formData.notes.trim() || null,
    };

    onSubmit(submitData);
  };

  const handleClose = () => {
    setFormData({
      entity_id: '',
      project_id: '',
      transaction_date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      transaction_type: 'expense',
      category: '',
      vendor_id: '',
      notes: '',
    });
    setErrors({});
    onClose();
  };

  const categories = formData.transaction_type === 'income' 
    ? INCOME_CATEGORIES 
    : EXPENSE_CATEGORIES;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">
            {initialData ? 'Edit Transaction' : 'Add New Transaction'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Entity */}
            <div className="space-y-2">
              <Label htmlFor="entity_id" className="text-slate-200">
                Entity <span className="text-red-400">*</span>
              </Label>
              <Select
                value={formData.entity_id}
                onValueChange={(value) => handleChange('entity_id', value)}
              >
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="Select entity" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {entities.map((entity) => (
                    <SelectItem
                      key={entity.id}
                      value={entity.id}
                      className="text-white hover:bg-slate-700"
                    >
                      {entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.entity_id && (
                <p className="text-red-400 text-sm">{errors.entity_id}</p>
              )}
            </div>

            {/* Project (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="project_id" className="text-slate-200">
                Project
              </Label>
              <Select
                value={formData.project_id}
                onValueChange={(value) => handleChange('project_id', value)}
                disabled={!formData.entity_id}
              >
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="Select project (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="" className="text-white hover:bg-slate-700">
                    No Project
                  </SelectItem>
                  {filteredProjects.map((project) => (
                    <SelectItem
                      key={project.id}
                      value={project.id}
                      className="text-white hover:bg-slate-700"
                    >
                      {project.project_code || project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Transaction Date */}
            <div className="space-y-2">
              <Label htmlFor="transaction_date" className="text-slate-200">
                Date <span className="text-red-400">*</span>
              </Label>
              <Input
                id="transaction_date"
                type="date"
                value={formData.transaction_date}
                onChange={(e) => handleChange('transaction_date', e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
              />
              {errors.transaction_date && (
                <p className="text-red-400 text-sm">{errors.transaction_date}</p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-slate-200">
                Amount <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <Input
                  id="amount"
                  type="text"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', formatCurrency(e.target.value))}
                  placeholder="0.00"
                  className="bg-slate-800 border-slate-600 text-white pl-7"
                />
              </div>
              {errors.amount && (
                <p className="text-red-400 text-sm">{errors.amount}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Transaction Type */}
            <div className="space-y-2">
              <Label htmlFor="transaction_type" className="text-slate-200">
                Type <span className="text-red-400">*</span>
              </Label>
              <Select
                value={formData.transaction_type}
                onValueChange={(value) => handleChange('transaction_type', value)}
              >
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="income" className="text-green-400 hover:bg-slate-700">
                    Income
                  </SelectItem>
                  <SelectItem value="expense" className="text-red-400 hover:bg-slate-700">
                    Expense
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.transaction_type && (
                <p className="text-red-400 text-sm">{errors.transaction_type}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-slate-200">
                Category <span className="text-red-400">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange('category', value)}
              >
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat}
                      value={cat}
                      className="text-white hover:bg-slate-700"
                    >
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-red-400 text-sm">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-200">
              Description <span className="text-red-400">*</span>
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="e.g., Lumber delivery for framing"
              className="bg-slate-800 border-slate-600 text-white"
            />
            {errors.description && (
              <p className="text-red-400 text-sm">{errors.description}</p>
            )}
          </div>

          {/* Vendor (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="vendor_id" className="text-slate-200">
              Vendor / Contact
            </Label>
            <Select
              value={formData.vendor_id}
              onValueChange={(value) => handleChange('vendor_id', value)}
            >
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Select vendor (optional)" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="" className="text-white hover:bg-slate-700">
                  No Vendor
                </SelectItem>
                {contacts.map((contact) => (
                  <SelectItem
                    key={contact.id}
                    value={contact.id}
                    className="text-white hover:bg-slate-700"
                  >
                    {contact.company || `${contact.first_name} ${contact.last_name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-slate-200">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes..."
              className="bg-slate-800 border-slate-600 text-white min-h-[60px]"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-slate-600 text-slate-200 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : initialData ? (
                'Update Transaction'
              ) : (
                'Add Transaction'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;
