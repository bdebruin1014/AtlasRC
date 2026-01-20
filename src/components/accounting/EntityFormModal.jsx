import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Building2, Calculator, Calendar, DollarSign, FileText, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const ENTITY_TYPES = [
  { value: 'holding', label: 'Holding Company', description: 'Parent entity that owns other entities' },
  { value: 'operating', label: 'Operating Company', description: 'Active business operations' },
  { value: 'project', label: 'Project SPV', description: 'Single-purpose vehicle for specific project' },
  { value: 'investment', label: 'Investment Entity', description: 'Entity holding investment assets' },
];

const LEGAL_STRUCTURES = [
  { value: 'LLC', label: 'LLC - Limited Liability Company' },
  { value: 'LP', label: 'LP - Limited Partnership' },
  { value: 'LLP', label: 'LLP - Limited Liability Partnership' },
  { value: 'Corp', label: 'Corporation (C-Corp)' },
  { value: 'S-Corp', label: 'S-Corporation' },
  { value: 'Trust', label: 'Trust' },
  { value: 'Sole-Prop', label: 'Sole Proprietorship' },
];

const TAX_CLASSIFICATIONS = [
  { value: 'partnership', label: 'Partnership' },
  { value: 'disregarded', label: 'Disregarded Entity' },
  { value: 'c-corp', label: 'C-Corporation' },
  { value: 's-corp', label: 'S-Corporation' },
  { value: 'trust', label: 'Trust' },
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const EntityFormModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  entity = null, // null for new, object for edit
  parentEntities = [] // list of entities that can be parents
}) => {
  const isEditing = !!entity;
  
  const [formData, setFormData] = useState({
    // Basic Info
    name: entity?.name || '',
    legalName: entity?.legalName || '',
    entityType: entity?.entityType || 'project',
    legalStructure: entity?.legalStructure || 'LLC',
    ein: entity?.ein || '',
    formationState: entity?.formationState || 'SC',
    formationDate: entity?.formationDate || '',
    
    // Contact
    email: entity?.email || '',
    phone: entity?.phone || '',
    website: entity?.website || '',
    
    // Ownership
    parentEntityId: entity?.parentEntityId || '',
    ownershipPercentage: entity?.ownershipPercentage || 100,
    
    // Accounting Settings - CRITICAL
    accountingMethod: entity?.accountingMethod || 'accrual', // 'cash' or 'accrual'
    fiscalYearEndMonth: entity?.fiscalYearEndMonth || 'December',
    fiscalYearEndDay: entity?.fiscalYearEndDay || '31',
    baseCurrency: entity?.baseCurrency || 'USD',
    
    // Tax Settings
    taxClassification: entity?.taxClassification || 'partnership',
    taxYearEndMonth: entity?.taxYearEndMonth || 'December',
    
    // Features
    enableMultiCurrency: entity?.enableMultiCurrency || false,
    enableBudgeting: entity?.enableBudgeting || true,
    enableProjectTracking: entity?.enableProjectTracking || true,
    enableClassTracking: entity?.enableClassTracking || false,
    enableLocationTracking: entity?.enableLocationTracking || false,
    enableBillableExpenses: entity?.enableBillableExpenses || false,
    
    // Initial Setup
    copyChartOfAccountsFrom: '',
    openingBalanceDate: '',
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Entity name is required';
    if (!formData.legalStructure) newErrors.legalStructure = 'Legal structure is required';
    if (!formData.accountingMethod) newErrors.accountingMethod = 'Accounting method is required';
    if (!formData.formationState) newErrors.formationState = 'Formation state is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {isEditing ? 'Edit Entity' : 'Create New Entity'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update entity information and settings' 
              : 'Set up a new legal entity for accounting'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="accounting">
              <Calculator className="w-3.5 h-3.5 mr-1" />
              Accounting
            </TabsTrigger>
            <TabsTrigger value="tax">Tax Settings</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto py-4">
            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label className="text-sm font-medium">
                    Entity Name <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Highland Park Development LLC"
                    className={cn(errors.name && 'border-red-500')}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label className="text-sm font-medium">Entity Type</Label>
                  <Select value={formData.entityType} onValueChange={(v) => handleChange('entityType', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ENTITY_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <span className="font-medium">{type.label}</span>
                            <p className="text-xs text-gray-500">{type.description}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">
                    Legal Structure <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.legalStructure} onValueChange={(v) => handleChange('legalStructure', v)}>
                    <SelectTrigger className={cn(errors.legalStructure && 'border-red-500')}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEGAL_STRUCTURES.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">EIN (Tax ID)</Label>
                  <Input 
                    value={formData.ein}
                    onChange={(e) => handleChange('ein', e.target.value)}
                    placeholder="XX-XXXXXXX"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">
                    Formation State <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.formationState} onValueChange={(v) => handleChange('formationState', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Formation Date</Label>
                  <Input 
                    type="date"
                    value={formData.formationDate}
                    onChange={(e) => handleChange('formationDate', e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Parent Entity</Label>
                  <Select value={formData.parentEntityId} onValueChange={(v) => handleChange('parentEntityId', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="None (Top-level entity)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None (Top-level entity)</SelectItem>
                      {parentEntities.map(e => (
                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2 grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <Input 
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="accounting@entity.com"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <Input 
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="(XXX) XXX-XXXX"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Website</Label>
                    <Input 
                      value={formData.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                      placeholder="www.entity.com"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Accounting Settings Tab - CRITICAL */}
            <TabsContent value="accounting" className="space-y-6 mt-0">
              {/* Accounting Method Selection - PROMINENT */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-900">Accounting Method</h4>
                    <p className="text-sm text-amber-700 mb-3">
                      This setting affects how revenue and expenses are recognized. 
                      Choose carefully - changing this later may require adjusting entries.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleChange('accountingMethod', 'cash')}
                        className={cn(
                          "p-4 rounded-lg border-2 text-left transition-all",
                          formData.accountingMethod === 'cash'
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold">Cash Basis</span>
                        </div>
                        <p className="text-xs text-gray-600">
                          Revenue recognized when received, expenses when paid. 
                          Simpler, common for small businesses.
                        </p>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleChange('accountingMethod', 'accrual')}
                        className={cn(
                          "p-4 rounded-lg border-2 text-left transition-all",
                          formData.accountingMethod === 'accrual'
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4" />
                          <span className="font-semibold">Accrual Basis</span>
                        </div>
                        <p className="text-xs text-gray-600">
                          Revenue recognized when earned, expenses when incurred. 
                          Required for larger companies, better matching.
                        </p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fiscal Year */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Fiscal Year
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Label className="text-sm">Fiscal Year End Month</Label>
                    <Select value={formData.fiscalYearEndMonth} onValueChange={(v) => handleChange('fiscalYearEndMonth', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map(month => (
                          <SelectItem key={month} value={month}>{month}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">Day</Label>
                    <Select value={formData.fiscalYearEndDay} onValueChange={(v) => handleChange('fiscalYearEndDay', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['28', '29', '30', '31'].map(day => (
                          <SelectItem key={day} value={day}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Most entities use December 31. Fiscal year impacts period closing and financial reporting.
                </p>
              </div>

              {/* Currency */}
              <div className="space-y-3">
                <h4 className="font-medium">Base Currency</h4>
                <Select value={formData.baseCurrency} onValueChange={(v) => handleChange('baseCurrency', v)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Copy Chart of Accounts */}
              {!isEditing && (
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-medium">Initial Setup</h4>
                  <div>
                    <Label className="text-sm">Copy Chart of Accounts From</Label>
                    <Select value={formData.copyChartOfAccountsFrom} onValueChange={(v) => handleChange('copyChartOfAccountsFrom', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Start with blank / default template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Default Template (Real Estate)</SelectItem>
                        <SelectItem value="template-standard">Standard Business</SelectItem>
                        <SelectItem value="template-realestate">Real Estate Development</SelectItem>
                        <SelectItem value="template-construction">Construction</SelectItem>
                        {parentEntities.map(e => (
                          <SelectItem key={e.id} value={e.id}>Copy from: {e.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">Opening Balance Date</Label>
                    <Input 
                      type="date"
                      value={formData.openingBalanceDate}
                      onChange={(e) => handleChange('openingBalanceDate', e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Date from which to start tracking transactions. Leave blank to start from formation date.
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Tax Settings Tab */}
            <TabsContent value="tax" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Tax Classification</Label>
                  <Select value={formData.taxClassification} onValueChange={(v) => handleChange('taxClassification', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TAX_CLASSIFICATIONS.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    How this entity is treated for federal tax purposes
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Tax Year End</Label>
                  <Select value={formData.taxYearEndMonth} onValueChange={(v) => handleChange('taxYearEndMonth', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map(month => (
                        <SelectItem key={month} value={month}>{month}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Usually matches fiscal year end
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Tax Reporting Notes:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                      <li>Partnerships file Form 1065 and issue K-1s to partners</li>
                      <li>Disregarded entities report on owner's return</li>
                      <li>S-Corps file Form 1120-S and issue K-1s</li>
                      <li>C-Corps file Form 1120</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Features Tab */}
            <TabsContent value="features" className="space-y-4 mt-0">
              <p className="text-sm text-gray-600 mb-4">
                Enable additional tracking features for this entity. These can be changed later.
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <Label className="font-medium">Multi-Currency</Label>
                    <p className="text-xs text-gray-500">Track transactions in multiple currencies</p>
                  </div>
                  <Switch 
                    checked={formData.enableMultiCurrency}
                    onCheckedChange={(v) => handleChange('enableMultiCurrency', v)}
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <Label className="font-medium">Budgeting</Label>
                    <p className="text-xs text-gray-500">Create and track budgets vs actuals</p>
                  </div>
                  <Switch 
                    checked={formData.enableBudgeting}
                    onCheckedChange={(v) => handleChange('enableBudgeting', v)}
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <Label className="font-medium">Project Tracking</Label>
                    <p className="text-xs text-gray-500">Link transactions to specific projects</p>
                  </div>
                  <Switch 
                    checked={formData.enableProjectTracking}
                    onCheckedChange={(v) => handleChange('enableProjectTracking', v)}
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <Label className="font-medium">Class Tracking</Label>
                    <p className="text-xs text-gray-500">Categorize transactions by class/department</p>
                  </div>
                  <Switch 
                    checked={formData.enableClassTracking}
                    onCheckedChange={(v) => handleChange('enableClassTracking', v)}
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <Label className="font-medium">Location Tracking</Label>
                    <p className="text-xs text-gray-500">Track transactions by location/property</p>
                  </div>
                  <Switch 
                    checked={formData.enableLocationTracking}
                    onCheckedChange={(v) => handleChange('enableLocationTracking', v)}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="font-medium">Billable Expenses</Label>
                    <p className="text-xs text-gray-500">Track expenses to bill back to clients/projects</p>
                  </div>
                  <Switch 
                    checked={formData.enableBillableExpenses}
                    onCheckedChange={(v) => handleChange('enableBillableExpenses', v)}
                  />
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700">
            {isEditing ? 'Save Changes' : 'Create Entity'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EntityFormModal;
