import React, { useState, useEffect } from 'react';
import {
  Plus, Search, MoreVertical, Copy, Edit2, Trash2, Eye,
  FileText, CheckCircle, Building2, Layers, ChevronRight, ChevronDown, Loader2, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { coaTemplateService } from '@/services/coaTemplateService';
import { useToast } from '@/components/ui/use-toast';

const ENTITY_PURPOSES = [
  { value: 'holding_company', label: 'Holding Company' },
  { value: 'operating_company', label: 'Operating Company' },
  { value: 'spe', label: 'Single Purpose Entity (SPE)' },
];

const PROJECT_TYPES = [
  { value: 'lot_development', label: 'Lot Development' },
  { value: 'btr', label: 'Build-to-Rent (BTR)' },
  { value: 'fix_and_flip', label: 'Fix & Flip' },
  { value: 'spec_build', label: 'Spec Build' },
  { value: 'community_development', label: 'Community Development' },
  { value: 'none', label: 'General / None' },
];

const COATemplatesPage = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedTemplateDetails, setSelectedTemplateDetails] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(['asset', 'liability']);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateName, setDuplicateName] = useState('');
  const [duplicating, setDuplicating] = useState(false);

  // Load templates from service
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await coaTemplateService.getAll();
      if (error) {
        toast({ title: 'Error', description: 'Failed to load templates', variant: 'destructive' });
      } else if (data) {
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load template details when selected
  useEffect(() => {
    if (selectedTemplate) {
      loadTemplateDetails(selectedTemplate);
    }
  }, [selectedTemplate]);

  const loadTemplateDetails = async (templateId) => {
    try {
      const { data, error } = await coaTemplateService.getById(templateId);
      if (!error && data) {
        setSelectedTemplateDetails(data);
      }
    } catch (error) {
      console.error('Error loading template details:', error);
    }
  };

  const handleDuplicate = async () => {
    if (!duplicateName.trim()) {
      toast({ title: 'Error', description: 'Please enter a name for the new template', variant: 'destructive' });
      return;
    }

    setDuplicating(true);
    try {
      const { data, error } = await coaTemplateService.duplicate(selectedTemplate, duplicateName);
      if (error) {
        toast({ title: 'Error', description: error, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Template duplicated successfully' });
        setShowDuplicateDialog(false);
        setDuplicateName('');
        loadTemplates();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to duplicate template', variant: 'destructive' });
    } finally {
      setDuplicating(false);
    }
  };

  const handleDelete = async (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template?.is_system) {
      toast({ title: 'Error', description: 'Cannot delete system templates', variant: 'destructive' });
      return;
    }

    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await coaTemplateService.delete(templateId);
      if (error) {
        toast({ title: 'Error', description: error, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Template deleted' });
        setSelectedTemplate(null);
        setSelectedTemplateDetails(null);
        loadTemplates();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete template', variant: 'destructive' });
    }
  };

  const getPurposeLabel = (purpose) => {
    return ENTITY_PURPOSES.find(p => p.value === purpose)?.label || purpose;
  };

  const getProjectTypeLabel = (type) => {
    return PROJECT_TYPES.find(t => t.value === type)?.label || type;
  };

  // Group accounts by type for display
  const groupAccountsByType = (accounts) => {
    if (!accounts) return {};
    const groups = {};
    accounts.forEach(acc => {
      const type = acc.account_type || 'other';
      if (!groups[type]) groups[type] = [];
      groups[type].push(acc);
    });
    return groups;
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selected = selectedTemplateDetails;
  const accountGroups = selected ? groupAccountsByType(selected.accounts) : {};
  const accountTypeOrder = ['asset', 'liability', 'equity', 'revenue', 'cogs', 'expense', 'other_income', 'other_expense'];
  const accountTypeLabels = {
    asset: 'Assets',
    liability: 'Liabilities',
    equity: 'Equity',
    revenue: 'Revenue',
    cogs: 'Cost of Goods Sold',
    expense: 'Operating Expenses',
    other_income: 'Other Income',
    other_expense: 'Other Expenses',
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Chart of Accounts Templates</h1>
          <p className="text-sm text-gray-500">Create and manage COA templates for new entities</p>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]">
          <Plus className="w-4 h-4 mr-2" />New Template
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Template List */}
        <div className="col-span-1">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search templates..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white border rounded-lg divide-y">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">Loading templates...</p>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-8 h-8 mx-auto text-gray-300" />
                <p className="text-sm text-gray-500 mt-2">No templates found</p>
              </div>
            ) : (
              filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className={cn(
                    "p-4 cursor-pointer transition-colors",
                    selectedTemplate === template.id ? "bg-emerald-50 border-l-2 border-l-emerald-600" : "hover:bg-gray-50"
                  )}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        template.is_system ? "bg-purple-100" : "bg-gray-100"
                      )}>
                        {template.is_system ? (
                          <Lock className="w-5 h-5 text-purple-500" />
                        ) : (
                          <Layers className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{template.name}</p>
                          {template.is_default && (
                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs">Default</span>
                          )}
                          {template.is_system && (
                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">System</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {getPurposeLabel(template.entity_purpose)}
                          {template.project_type && template.project_type !== 'none' && ` • ${getProjectTypeLabel(template.project_type)}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{template.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>{template.account_count || template.coa_template_accounts?.length || 0} accounts</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Template Preview */}
        <div className="col-span-2">
          {selected ? (
            <div className="bg-white border rounded-lg">
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">{selected.name}</h2>
                    {selected.is_system && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs flex items-center gap-1">
                        <Lock className="w-3 h-3" /> System Template
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{selected.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {getPurposeLabel(selected.entity_purpose)}
                    {selected.project_type && selected.project_type !== 'none' && ` • ${getProjectTypeLabel(selected.project_type)}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDuplicateName(`${selected.name} (Copy)`);
                      setShowDuplicateDialog(true);
                    }}
                  >
                    <Copy className="w-4 h-4 mr-1" />Duplicate
                  </Button>
                  {!selected.is_system && (
                    <>
                      <Button variant="outline" size="sm"><Edit2 className="w-4 h-4 mr-1" />Edit</Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(selected.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Account Structure</h3>
                  <span className="text-sm text-gray-500">{selected.accounts?.length || 0} accounts</span>
                </div>

                {accountTypeOrder.map(type => {
                  const accounts = accountGroups[type];
                  if (!accounts || accounts.length === 0) return null;

                  return (
                    <div key={type} className="mb-2">
                      <button
                        onClick={() => toggleCategory(type)}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                      >
                        <span className="font-medium text-sm">{accountTypeLabels[type] || type}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{accounts.length} accounts</span>
                          {expandedCategories.includes(type) ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {expandedCategories.includes(type) && (
                        <div className="mt-1 ml-4 border-l-2 border-gray-200">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-xs text-gray-500 uppercase">
                                <th className="py-2 pl-4 w-24">Number</th>
                                <th className="py-2">Account Name</th>
                                <th className="py-2 w-32">Sub-Type</th>
                                <th className="py-2 w-20">Required</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {accounts.map(account => (
                                <tr key={account.id || account.account_number} className={cn("hover:bg-gray-50", account.is_header && "bg-gray-50 font-medium")}>
                                  <td className="py-2 pl-4 font-mono text-xs">{account.account_number}</td>
                                  <td className="py-2">{account.account_name}</td>
                                  <td className="py-2 text-xs text-gray-500">{account.sub_type || '—'}</td>
                                  <td className="py-2">
                                    {account.is_required && (
                                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}

                {(!selected.accounts || selected.accounts.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No accounts in this template</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border rounded-lg p-8 text-center">
              <Layers className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-1">Select a Template</h3>
              <p className="text-sm text-gray-500">Choose a template from the list to preview its accounts</p>
            </div>
          )}
        </div>
      </div>

      {/* Duplicate Dialog */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Duplicate Template</DialogTitle>
            <DialogDescription>Create a copy of this template with a new name</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>New Template Name</Label>
            <Input
              value={duplicateName}
              onChange={(e) => setDuplicateName(e.target.value)}
              placeholder="Enter name for the new template"
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDuplicateDialog(false)}>Cancel</Button>
            <Button onClick={handleDuplicate} disabled={duplicating} className="bg-[#047857] hover:bg-[#065f46]">
              {duplicating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Copy className="w-4 h-4 mr-2" />}
              Duplicate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Usage Note */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Using COA Templates</p>
            <p className="text-sm text-blue-700 mt-1">
              When creating a new entity in the Accounting module, you can select a COA template to automatically populate 
              the chart of accounts. You can then customize the accounts as needed for the specific entity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default COATemplatesPage;
