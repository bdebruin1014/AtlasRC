import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, Plus, Loader2, DollarSign, Building2,
  Calendar, FileText, User, CreditCard, Upload, X, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { transactionServiceTs, type CreateTransactionData, type PaymentMethod } from '@/services/transactionService.ts';
import { entityService } from '@/services/entityService';
import { projectService } from '@/services/projectService';

const INCOME_CATEGORIES = [
  { value: 'capital-raise', label: 'Capital Raise' },
  { value: 'builder-deposits', label: 'Builder Deposits' },
  { value: 'lot-sales', label: 'Lot Sales' },
  { value: 'home-sales', label: 'Home Sales' },
  { value: 'rental-income', label: 'Rental Income' },
  { value: 'property-sale', label: 'Property Sale' },
  { value: 'investment-income', label: 'Investment Income' },
  { value: 'other-income', label: 'Other Income' }
];

const EXPENSE_CATEGORIES = [
  { value: 'land-acquisition', label: 'Land Acquisition' },
  { value: 'construction', label: 'Construction' },
  { value: 'professional-fees', label: 'Professional Fees' },
  { value: 'legal-fees', label: 'Legal Fees' },
  { value: 'accounting-fees', label: 'Accounting Fees' },
  { value: 'contingency', label: 'Contingency' },
  { value: 'debt-service', label: 'Debt Service' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'property-tax', label: 'Property Tax' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'repairs-maintenance', label: 'Repairs & Maintenance' },
  { value: 'office-expenses', label: 'Office Expenses' },
  { value: 'payroll', label: 'Payroll' },
  { value: 'other-expense', label: 'Other Expense' }
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'check', label: 'Check' },
  { value: 'ach-wire', label: 'ACH/Wire' },
  { value: 'credit-card', label: 'Credit Card' },
  { value: 'debit-card', label: 'Debit Card' },
  { value: 'other', label: 'Other' }
];

const RECURRING_FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' }
];

// Default data for fallback
const defaultEntities = [
  { id: '1', name: 'VanRock Holdings LLC' },
  { id: '2', name: 'Watson House LLC' },
  { id: '3', name: 'Oslo Development LLC' },
  { id: '4', name: 'Cedar Mill Partners' }
];

const defaultProjects = [
  { id: '1', name: 'Watson House Development', entityId: '2' },
  { id: '2', name: 'Oslo Townhomes', entityId: '3' },
  { id: '3', name: 'Cedar Mill Mixed Use', entityId: '4' }
];

interface EntityData {
  id: string;
  name: string;
}

interface ProjectData {
  id: string;
  name: string;
  entityId: string;
}

interface FormData {
  transactionDate: string;
  entityId: string;
  projectId: string;
  transactionType: 'income' | 'expense';
  category: string;
  subcategory: string;
  amount: string;
  paymentMethod: string;
  checkNumber: string;
  referenceNumber: string;
  description: string;
  notes: string;
  memo: string;
  vendorId: string;
  vendorName: string;
  payerId: string;
  payerName: string;
  taxable: boolean;
  taxAmount: string;
  accountCode: string;
  isRecurring: boolean;
  recurringFrequency: string;
  recurringEndDate: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

const TransactionForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [entities, setEntities] = useState<EntityData[]>(defaultEntities);
  const [projects, setProjects] = useState<ProjectData[]>(defaultProjects);

  const [formData, setFormData] = useState<FormData>({
    transactionDate: new Date().toISOString().split('T')[0],
    entityId: '',
    projectId: '',
    transactionType: 'expense',
    category: '',
    subcategory: '',
    amount: '',
    paymentMethod: '',
    checkNumber: '',
    referenceNumber: '',
    description: '',
    notes: '',
    memo: '',
    vendorId: '',
    vendorName: '',
    payerId: '',
    payerName: '',
    taxable: false,
    taxAmount: '',
    accountCode: '',
    isRecurring: false,
    recurringFrequency: '',
    recurringEndDate: '',
  });

  // Get projects filtered by selected entity
  const filteredProjects = formData.entityId
    ? projects.filter(p => p.entityId === formData.entityId)
    : [];

  // Get categories based on transaction type
  const categories = formData.transactionType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // Load entities and projects on mount
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [entitiesData, projectsData] = await Promise.all([
          entityService.getAll(),
          projectService.getAll()
        ]);
        if (entitiesData?.length) {
          setEntities(entitiesData.map((e: { id: string; name: string }) => ({ id: e.id, name: e.name })));
        }
        if (projectsData?.length) {
          setProjects(projectsData.map((p: { id: string; name: string; entity_id?: string }) => ({
            id: p.id,
            name: p.name,
            entityId: p.entity_id || ''
          })));
        }
      } catch (error) {
        console.warn('Using default entity/project data:', error);
      }
    };
    loadReferenceData();
  }, []);

  // Load existing transaction for editing
  useEffect(() => {
    if (isEditing && id) {
      setLoading(true);
      const loadTransaction = async () => {
        try {
          const txn = await transactionServiceTs.getById(id);
          if (txn) {
            setFormData({
              transactionDate: txn.transaction_date,
              entityId: txn.entity_id || '',
              projectId: txn.project_id || '',
              transactionType: txn.transaction_type as 'income' | 'expense',
              category: txn.category || '',
              subcategory: '',
              amount: String(txn.amount),
              paymentMethod: txn.payment_method || '',
              checkNumber: '',
              referenceNumber: txn.reference_number || '',
              description: txn.description || '',
              notes: txn.notes || '',
              memo: '',
              vendorId: txn.vendor_id || '',
              vendorName: '',
              payerId: '',
              payerName: '',
              taxable: false,
              taxAmount: '',
              accountCode: txn.account_id || '',
              isRecurring: false,
              recurringFrequency: '',
              recurringEndDate: '',
            });
          }
        } catch (error) {
          console.warn('Error loading transaction:', error);
          toast({
            title: 'Error',
            description: 'Failed to load transaction data',
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      };
      loadTransaction();
    }
  }, [isEditing, id, toast]);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Clear project if entity changes
      if (field === 'entityId') {
        newData.projectId = '';
      }

      // Clear category if transaction type changes
      if (field === 'transactionType') {
        newData.category = '';
        newData.subcategory = '';
      }

      return newData;
    });

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCurrencyChange = (field: keyof FormData, value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    handleInputChange(field, numericValue);

    // Check for duplicate transaction
    if (field === 'amount' && numericValue) {
      const amount = parseFloat(numericValue);
      if (amount > 10000) {
        toast({
          title: 'Large Transaction',
          description: `This transaction of $${amount.toLocaleString()} is over $10,000. Please verify the amount.`,
        });
      }
      // Check for potential duplicates via API
      if (!isEditing && formData.date && formData.entityId) {
        transactionServiceTs.getAll({
          entity_id: formData.entityId,
          start_date: formData.date,
          end_date: formData.date,
        }).then(transactions => {
          const duplicates = transactions.filter(t =>
            Math.abs(t.amount - amount) < 0.01 &&
            t.type === formData.transactionType
          );
          if (duplicates.length > 0) {
            toast({
              title: 'Potential Duplicate',
              description: `Found ${duplicates.length} similar transaction(s) on this date with the same amount.`,
            });
          }
        }).catch(() => {
          // Silently fail duplicate check
        });
      }
    }
  };

  const formatCurrency = (value: string) => {
    if (!value) return '';
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.xlsx'];
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      const isValidType = validTypes.includes(ext);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    if (attachments.length + validFiles.length <= 5) {
      setAttachments(prev => [...prev, ...validFiles]);
    } else {
      toast({
        title: 'Too many files',
        description: 'Maximum 5 attachments allowed',
        variant: 'destructive',
      });
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.transactionDate) {
      newErrors.transactionDate = 'Transaction date is required';
    } else {
      const transactionDate = new Date(formData.transactionDate);
      const today = new Date();
      if (transactionDate > today) {
        newErrors.transactionDate = 'Transaction date cannot be in the future';
      }
    }

    if (!formData.entityId) {
      newErrors.entityId = 'Entity is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else {
      const amount = parseFloat(formData.amount);
      if (amount < 0.01) {
        newErrors.amount = 'Amount must be at least $0.01';
      }
      if (amount > 999999999.99) {
        newErrors.amount = 'Amount exceeds maximum value';
      }
    }

    if (!formData.description || formData.description.length < 5) {
      newErrors.description = 'Description is required (min 5 characters)';
    }

    if (formData.isRecurring && !formData.recurringFrequency) {
      newErrors.recurringFrequency = 'Frequency is required for recurring transactions';
    }

    // Validate project entity match
    if (formData.projectId && formData.entityId) {
      const project = projects.find(p => p.id === formData.projectId);
      if (project && project.entityId !== formData.entityId) {
        newErrors.projectId = 'Selected project does not belong to the selected entity';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (action: 'save' | 'save-another' | 'save-draft') => {
    if (action !== 'save-draft' && !validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before saving',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const transactionData: CreateTransactionData = {
        transaction_date: formData.transactionDate,
        transaction_type: formData.transactionType,
        category: formData.category,
        description: formData.description,
        amount: parseFloat(formData.amount) || 0,
        entity_id: formData.entityId || undefined,
        project_id: formData.projectId || undefined,
        vendor_id: formData.vendorId || undefined,
        account_id: formData.accountCode || undefined,
        reference_number: formData.referenceNumber || undefined,
        payment_method: formData.paymentMethod as PaymentMethod || undefined,
        status: action === 'save-draft' ? 'pending' : 'posted',
        notes: formData.notes || undefined,
      };

      if (isEditing && id) {
        await transactionServiceTs.update(id, transactionData);
      } else {
        await transactionServiceTs.create(transactionData);
      }

      toast({
        title: action === 'save-draft' ? 'Draft saved' : (isEditing ? 'Transaction updated' : 'Transaction created'),
        description: 'Transaction has been saved successfully',
      });

      if (action === 'save-another') {
        setFormData({
          ...formData,
          amount: '',
          description: '',
          notes: '',
          memo: '',
          referenceNumber: '',
          checkNumber: '',
          vendorId: '',
          vendorName: '',
          payerId: '',
          payerName: '',
        });
        setAttachments([]);
      } else {
        navigate('/accounting/transactions');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save transaction',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/accounting/transactions')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-bold text-gray-900">
                {isEditing ? 'Edit Transaction' : 'New Transaction'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/accounting/transactions')}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSubmit('save-draft')}
                disabled={saving}
              >
                Save as Draft
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSubmit('save-another')}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Save & Add Another
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => handleSubmit('save')}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Transaction
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Section 1: Transaction Basics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Transaction Basics
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="transactionDate">
                Transaction Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="transactionDate"
                type="date"
                value={formData.transactionDate}
                onChange={(e) => handleInputChange('transactionDate', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={errors.transactionDate ? 'border-red-500' : ''}
              />
              {errors.transactionDate && <p className="text-sm text-red-500 mt-1">{errors.transactionDate}</p>}
            </div>
            <div>
              <Label htmlFor="entityId">
                Entity <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.entityId} onValueChange={(v) => handleInputChange('entityId', v)}>
                <SelectTrigger className={errors.entityId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select entity" />
                </SelectTrigger>
                <SelectContent>
                  {entities.map(entity => (
                    <SelectItem key={entity.id} value={entity.id}>{entity.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.entityId && <p className="text-sm text-red-500 mt-1">{errors.entityId}</p>}
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="projectId">Project (Optional)</Label>
              <Select
                value={formData.projectId}
                onValueChange={(v) => handleInputChange('projectId', v)}
                disabled={!formData.entityId}
              >
                <SelectTrigger className={errors.projectId ? 'border-red-500' : ''}>
                  <SelectValue placeholder={formData.entityId ? "Select project" : "Select entity first"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {filteredProjects.map(project => (
                    <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.projectId && <p className="text-sm text-red-500 mt-1">{errors.projectId}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Classification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Classification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Type <span className="text-red-500">*</span></Label>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant={formData.transactionType === 'income' ? 'default' : 'outline'}
                  className={cn(
                    'flex-1',
                    formData.transactionType === 'income' && 'bg-green-600 hover:bg-green-700'
                  )}
                  onClick={() => handleInputChange('transactionType', 'income')}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Income
                </Button>
                <Button
                  type="button"
                  variant={formData.transactionType === 'expense' ? 'default' : 'outline'}
                  className={cn(
                    'flex-1',
                    formData.transactionType === 'expense' && 'bg-red-600 hover:bg-red-700'
                  )}
                  onClick={() => handleInputChange('transactionType', 'expense')}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Expense
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.category} onValueChange={(v) => handleInputChange('category', v)}>
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
              </div>
              <div>
                <Label htmlFor="subcategory">Subcategory (Optional)</Label>
                <Input
                  id="subcategory"
                  value={formData.subcategory}
                  onChange={(e) => handleInputChange('subcategory', e.target.value)}
                  placeholder="Enter subcategory"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Amount & Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Amount & Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">
                Amount <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                <Input
                  id="amount"
                  value={formData.amount}
                  onChange={(e) => handleCurrencyChange('amount', e.target.value)}
                  onBlur={() => {
                    if (formData.amount) {
                      handleInputChange('amount', parseFloat(formData.amount).toFixed(2));
                    }
                  }}
                  placeholder="0.00"
                  className={cn('pl-8 text-lg font-semibold', errors.amount ? 'border-red-500' : '')}
                />
              </div>
              {formData.amount && (
                <p className="text-sm text-gray-500 mt-1">
                  ${formatCurrency(formData.amount)}
                </p>
              )}
              {errors.amount && <p className="text-sm text-red-500 mt-1">{errors.amount}</p>}
            </div>
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={formData.paymentMethod} onValueChange={(v) => handleInputChange('paymentMethod', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(method => (
                    <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formData.paymentMethod === 'check' && (
              <div>
                <Label htmlFor="checkNumber">Check Number</Label>
                <Input
                  id="checkNumber"
                  value={formData.checkNumber}
                  onChange={(e) => handleInputChange('checkNumber', e.target.value)}
                  placeholder="1234"
                />
              </div>
            )}
            <div>
              <Label htmlFor="referenceNumber">Reference/Invoice Number</Label>
              <Input
                id="referenceNumber"
                value={formData.referenceNumber}
                onChange={(e) => handleInputChange('referenceNumber', e.target.value)}
                placeholder="INV-001"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Description & Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Description & Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="e.g., Land acquisition deposit for Lot 14"
                maxLength={200}
                className={errors.description ? 'border-red-500' : ''}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.description.length}/200 characters</p>
              {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
            </div>
            <div>
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any additional context..."
                rows={3}
                maxLength={1000}
              />
            </div>
            <div>
              <Label htmlFor="memo">Memo (appears on reports)</Label>
              <Input
                id="memo"
                value={formData.memo}
                onChange={(e) => handleInputChange('memo', e.target.value)}
                maxLength={100}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Vendor/Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              {formData.transactionType === 'expense' ? 'Vendor/Contact' : 'Received From'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {formData.transactionType === 'expense' ? (
              <div>
                <Label htmlFor="vendorName">Vendor Name</Label>
                <Input
                  id="vendorName"
                  value={formData.vendorName}
                  onChange={(e) => handleInputChange('vendorName', e.target.value)}
                  placeholder="Search or enter vendor name..."
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="payerName">Received From</Label>
                <Input
                  id="payerName"
                  value={formData.payerName}
                  onChange={(e) => handleInputChange('payerName', e.target.value)}
                  placeholder="Search contact..."
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 6: Tax & Accounting */}
        {formData.transactionType === 'expense' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                Tax & Accounting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="taxable"
                  checked={formData.taxable}
                  onCheckedChange={(checked) => handleInputChange('taxable', checked === true)}
                />
                <Label htmlFor="taxable">Subject to tax</Label>
              </div>
              {formData.taxable && (
                <div className="w-48">
                  <Label htmlFor="taxAmount">Tax Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="taxAmount"
                      value={formData.taxAmount}
                      onChange={(e) => handleCurrencyChange('taxAmount', e.target.value)}
                      placeholder="0.00"
                      className="pl-7"
                    />
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="accountCode">Account Code (Optional)</Label>
                <Input
                  id="accountCode"
                  value={formData.accountCode}
                  onChange={(e) => handleInputChange('accountCode', e.target.value)}
                  placeholder="For advanced accounting integration"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 7: Attachments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-600" />
              Receipts/Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
              <input
                type="file"
                id="attachments"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="attachments"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">Click to upload or drag and drop</span>
                <span className="text-xs text-gray-400">PDF, JPG, PNG, DOC, XLS up to 10MB (max 5 files)</span>
              </label>
            </div>
            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm truncate">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 8: Recurring */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Recurring Transaction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRecurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) => handleInputChange('isRecurring', checked === true)}
              />
              <Label htmlFor="isRecurring">Make this a recurring transaction</Label>
            </div>
            {formData.isRecurring && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                <div>
                  <Label htmlFor="recurringFrequency">
                    Frequency <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.recurringFrequency}
                    onValueChange={(v) => handleInputChange('recurringFrequency', v)}
                  >
                    <SelectTrigger className={errors.recurringFrequency ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {RECURRING_FREQUENCIES.map(freq => (
                        <SelectItem key={freq.value} value={freq.value}>{freq.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.recurringFrequency && (
                    <p className="text-sm text-red-500 mt-1">{errors.recurringFrequency}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="recurringEndDate">End Date (Optional)</Label>
                  <Input
                    id="recurringEndDate"
                    type="date"
                    value={formData.recurringEndDate}
                    onChange={(e) => handleInputChange('recurringEndDate', e.target.value)}
                    min={formData.transactionDate}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Duplicate Warning */}
        {showDuplicateWarning && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="flex items-center gap-4 p-4">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-800">Possible Duplicate Detected</p>
                <p className="text-sm text-amber-700">
                  A similar transaction with the same amount and date was found. Please verify this is not a duplicate.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDuplicateWarning(false)}
                className="flex-shrink-0"
              >
                Dismiss
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TransactionForm;
