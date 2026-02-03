// src/components/accounting/ImportAccountsModal.jsx
// Modal for importing chart of accounts from CSV or templates

import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle,
  Loader2, FileText, Building2, DollarSign, X, ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const TEMPLATES = [
  {
    id: 'real-estate',
    name: 'Real Estate',
    description: 'Property management & development accounts',
    icon: Building2,
    color: 'text-blue-600',
    accountCount: 45
  },
  {
    id: 'construction',
    name: 'Construction',
    description: 'Job costing & project tracking accounts',
    icon: FileText,
    color: 'text-green-600',
    accountCount: 52
  },
  {
    id: 'standard',
    name: 'Standard Business',
    description: 'General purpose chart of accounts',
    icon: DollarSign,
    color: 'text-purple-600',
    accountCount: 35
  },
];

const STEPS = [
  { id: 1, title: 'Choose Source' },
  { id: 2, title: 'Map Fields' },
  { id: 3, title: 'Review & Import' },
];

export default function ImportAccountsModal({ open, onClose, entityId }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [importMethod, setImportMethod] = useState(null); // 'file' or 'template'
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [fieldMapping, setFieldMapping] = useState({
    number: 'Account Number',
    name: 'Account Name',
    type: 'Account Type',
    subtype: 'Subtype',
    description: 'Description',
  });
  const [error, setError] = useState(null);
  const [importResults, setImportResults] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (csvFile) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

        const data = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row = { _rowIndex: index + 1 };
          headers.forEach((header, i) => {
            row[header] = values[i] || '';
          });
          return row;
        });

        setParsedData(data);

        // Auto-detect field mapping
        const mapping = { ...fieldMapping };
        headers.forEach(header => {
          const lowerHeader = header.toLowerCase();
          if (lowerHeader.includes('number') || lowerHeader.includes('code') || lowerHeader === 'acct') {
            mapping.number = header;
          } else if (lowerHeader.includes('name') && !lowerHeader.includes('type')) {
            mapping.name = header;
          } else if (lowerHeader.includes('type') && !lowerHeader.includes('sub')) {
            mapping.type = header;
          } else if (lowerHeader.includes('subtype') || lowerHeader.includes('sub type') || lowerHeader.includes('category')) {
            mapping.subtype = header;
          } else if (lowerHeader.includes('desc')) {
            mapping.description = header;
          }
        });
        setFieldMapping(mapping);
      } catch (err) {
        setError('Failed to parse CSV file. Please check the format.');
      }
    };
    reader.readAsText(csvFile);
  };

  const getTemplateAccounts = (templateId) => {
    // Demo template accounts
    const templates = {
      'real-estate': [
        { number: '1000', name: 'Cash - Operating', type: 'Asset', subtype: 'Current Asset' },
        { number: '1050', name: 'Cash - Security Deposits', type: 'Asset', subtype: 'Current Asset' },
        { number: '1100', name: 'Accounts Receivable - Tenants', type: 'Asset', subtype: 'Current Asset' },
        { number: '1200', name: 'Prepaid Insurance', type: 'Asset', subtype: 'Current Asset' },
        { number: '1500', name: 'Land', type: 'Asset', subtype: 'Fixed Asset' },
        { number: '1510', name: 'Buildings', type: 'Asset', subtype: 'Fixed Asset' },
        { number: '1520', name: 'Accumulated Depreciation - Buildings', type: 'Asset', subtype: 'Fixed Asset' },
        { number: '2000', name: 'Accounts Payable', type: 'Liability', subtype: 'Current Liability' },
        { number: '2100', name: 'Security Deposits Held', type: 'Liability', subtype: 'Current Liability' },
        { number: '2200', name: 'Mortgage Payable', type: 'Liability', subtype: 'Long-Term Liability' },
        { number: '3000', name: 'Members Equity', type: 'Equity', subtype: 'Owners Equity' },
        { number: '4000', name: 'Rental Income', type: 'Revenue', subtype: 'Operating Revenue' },
        { number: '4100', name: 'Late Fee Income', type: 'Revenue', subtype: 'Other Income' },
        { number: '5000', name: 'Property Management Fees', type: 'Expense', subtype: 'Operating Expense' },
        { number: '5100', name: 'Repairs & Maintenance', type: 'Expense', subtype: 'Operating Expense' },
        { number: '5200', name: 'Property Taxes', type: 'Expense', subtype: 'Operating Expense' },
        { number: '5300', name: 'Insurance', type: 'Expense', subtype: 'Operating Expense' },
        { number: '5400', name: 'Utilities', type: 'Expense', subtype: 'Operating Expense' },
        { number: '5500', name: 'Depreciation Expense', type: 'Expense', subtype: 'Operating Expense' },
        { number: '5600', name: 'Interest Expense', type: 'Expense', subtype: 'Operating Expense' },
      ],
      'construction': [
        { number: '1000', name: 'Cash', type: 'Asset', subtype: 'Current Asset' },
        { number: '1100', name: 'Accounts Receivable', type: 'Asset', subtype: 'Current Asset' },
        { number: '1150', name: 'Retainage Receivable', type: 'Asset', subtype: 'Current Asset' },
        { number: '1200', name: 'Work in Progress', type: 'Asset', subtype: 'Current Asset' },
        { number: '1300', name: 'Materials Inventory', type: 'Asset', subtype: 'Current Asset' },
        { number: '1500', name: 'Equipment', type: 'Asset', subtype: 'Fixed Asset' },
        { number: '1510', name: 'Vehicles', type: 'Asset', subtype: 'Fixed Asset' },
        { number: '2000', name: 'Accounts Payable', type: 'Liability', subtype: 'Current Liability' },
        { number: '2050', name: 'Retainage Payable', type: 'Liability', subtype: 'Current Liability' },
        { number: '2100', name: 'Accrued Expenses', type: 'Liability', subtype: 'Current Liability' },
        { number: '3000', name: 'Owners Equity', type: 'Equity', subtype: 'Owners Equity' },
        { number: '4000', name: 'Contract Revenue', type: 'Revenue', subtype: 'Operating Revenue' },
        { number: '4100', name: 'Change Order Revenue', type: 'Revenue', subtype: 'Operating Revenue' },
        { number: '5000', name: 'Direct Labor', type: 'Expense', subtype: 'Cost of Goods Sold' },
        { number: '5100', name: 'Direct Materials', type: 'Expense', subtype: 'Cost of Goods Sold' },
        { number: '5200', name: 'Subcontractor Costs', type: 'Expense', subtype: 'Cost of Goods Sold' },
        { number: '5300', name: 'Equipment Rental', type: 'Expense', subtype: 'Cost of Goods Sold' },
        { number: '6000', name: 'Office Expenses', type: 'Expense', subtype: 'Operating Expense' },
        { number: '6100', name: 'Insurance', type: 'Expense', subtype: 'Operating Expense' },
        { number: '6200', name: 'Licenses & Permits', type: 'Expense', subtype: 'Operating Expense' },
      ],
      'standard': [
        { number: '1000', name: 'Cash', type: 'Asset', subtype: 'Current Asset' },
        { number: '1100', name: 'Accounts Receivable', type: 'Asset', subtype: 'Current Asset' },
        { number: '1200', name: 'Inventory', type: 'Asset', subtype: 'Current Asset' },
        { number: '1300', name: 'Prepaid Expenses', type: 'Asset', subtype: 'Current Asset' },
        { number: '1500', name: 'Fixed Assets', type: 'Asset', subtype: 'Fixed Asset' },
        { number: '1510', name: 'Accumulated Depreciation', type: 'Asset', subtype: 'Fixed Asset' },
        { number: '2000', name: 'Accounts Payable', type: 'Liability', subtype: 'Current Liability' },
        { number: '2100', name: 'Accrued Expenses', type: 'Liability', subtype: 'Current Liability' },
        { number: '2200', name: 'Notes Payable', type: 'Liability', subtype: 'Long-Term Liability' },
        { number: '3000', name: 'Owners Equity', type: 'Equity', subtype: 'Owners Equity' },
        { number: '3100', name: 'Retained Earnings', type: 'Equity', subtype: 'Retained Earnings' },
        { number: '4000', name: 'Revenue', type: 'Revenue', subtype: 'Operating Revenue' },
        { number: '4100', name: 'Other Income', type: 'Revenue', subtype: 'Other Income' },
        { number: '5000', name: 'Cost of Goods Sold', type: 'Expense', subtype: 'Cost of Goods Sold' },
        { number: '6000', name: 'Salaries & Wages', type: 'Expense', subtype: 'Operating Expense' },
        { number: '6100', name: 'Rent Expense', type: 'Expense', subtype: 'Operating Expense' },
        { number: '6200', name: 'Utilities', type: 'Expense', subtype: 'Operating Expense' },
        { number: '6300', name: 'Office Supplies', type: 'Expense', subtype: 'Operating Expense' },
        { number: '6400', name: 'Depreciation Expense', type: 'Expense', subtype: 'Operating Expense' },
        { number: '6500', name: 'Interest Expense', type: 'Expense', subtype: 'Operating Expense' },
      ],
    };
    return templates[templateId] || [];
  };

  const importMutation = useMutation({
    mutationFn: async () => {
      let accountsToImport = [];

      if (importMethod === 'template') {
        accountsToImport = getTemplateAccounts(selectedTemplate).map(acc => ({
          entity_id: entityId,
          account_number: acc.number,
          account_name: acc.name,
          account_type: acc.type,
          account_subtype: acc.subtype,
          description: acc.description || null,
          balance: 0,
          is_active: true,
          created_at: new Date().toISOString(),
        }));
      } else {
        accountsToImport = parsedData.map(row => ({
          entity_id: entityId,
          account_number: row[fieldMapping.number] || '',
          account_name: row[fieldMapping.name] || '',
          account_type: row[fieldMapping.type] || 'Asset',
          account_subtype: row[fieldMapping.subtype] || null,
          description: row[fieldMapping.description] || null,
          balance: 0,
          is_active: true,
          created_at: new Date().toISOString(),
        })).filter(acc => acc.account_number && acc.account_name);
      }

      const { data, error } = await supabase
        .from('entity_accounts')
        .insert(accountsToImport)
        .select();

      if (error) throw error;

      return {
        imported: data?.length || accountsToImport.length,
        total: accountsToImport.length,
      };
    },
    onSuccess: (results) => {
      setImportResults(results);
      queryClient.invalidateQueries(['entity-accounts', entityId]);
    },
    onError: (err) => {
      setError(err.message || 'Failed to import accounts');
    },
  });

  const handleClose = () => {
    setStep(1);
    setImportMethod(null);
    setSelectedTemplate(null);
    setFile(null);
    setParsedData([]);
    setError(null);
    setImportResults(null);
    onClose();
  };

  const handleNext = () => {
    if (step === 1) {
      if (!importMethod) {
        setError('Please select an import method');
        return;
      }
      if (importMethod === 'template' && !selectedTemplate) {
        setError('Please select a template');
        return;
      }
      if (importMethod === 'file' && !file) {
        setError('Please upload a CSV file');
        return;
      }
      setError(null);
      if (importMethod === 'template') {
        setStep(3); // Skip mapping for templates
      } else {
        setStep(2);
      }
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      importMutation.mutate();
    }
  };

  const handleBack = () => {
    if (step === 3 && importMethod === 'template') {
      setStep(1);
    } else {
      setStep(step - 1);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'Account Number,Account Name,Account Type,Subtype,Description\n1000,Cash,Asset,Current Asset,Main operating cash account\n1100,Accounts Receivable,Asset,Current Asset,Customer receivables\n2000,Accounts Payable,Liability,Current Liability,Vendor payables';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chart_of_accounts_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const previewAccounts = importMethod === 'template'
    ? getTemplateAccounts(selectedTemplate).slice(0, 10)
    : parsedData.slice(0, 10).map(row => ({
        number: row[fieldMapping.number],
        name: row[fieldMapping.name],
        type: row[fieldMapping.type],
        subtype: row[fieldMapping.subtype],
      }));

  const totalAccountsToImport = importMethod === 'template'
    ? getTemplateAccounts(selectedTemplate).length
    : parsedData.length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Chart of Accounts
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {STEPS.map((s, index) => (
            <React.Fragment key={s.id}>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step >= s.id
                    ? "bg-[#047857] text-white"
                    : "bg-gray-200 text-gray-600"
                )}>
                  {importResults && s.id === 3 ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    s.id
                  )}
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  step >= s.id ? "text-gray-900" : "text-gray-500"
                )}>
                  {s.title}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-4",
                  step > s.id ? "bg-[#047857]" : "bg-gray-200"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Step 1: Choose Source */}
        {step === 1 && !importResults && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => { setImportMethod('file'); setSelectedTemplate(null); setError(null); }}
                className={cn(
                  "p-4 border-2 rounded-lg text-left transition-colors",
                  importMethod === 'file'
                    ? "border-[#047857] bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <FileSpreadsheet className="h-8 w-8 text-blue-600 mb-2" />
                <h4 className="font-medium">Upload CSV File</h4>
                <p className="text-sm text-gray-500">Import from a CSV or Excel file</p>
              </button>
              <button
                type="button"
                onClick={() => { setImportMethod('template'); setFile(null); setParsedData([]); setError(null); }}
                className={cn(
                  "p-4 border-2 rounded-lg text-left transition-colors",
                  importMethod === 'template'
                    ? "border-[#047857] bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <Building2 className="h-8 w-8 text-purple-600 mb-2" />
                <h4 className="font-medium">Use Template</h4>
                <p className="text-sm text-gray-500">Start with an industry template</p>
              </button>
            </div>

            {importMethod === 'file' && (
              <div className="space-y-4">
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                    file ? "border-[#047857] bg-green-50" : "border-gray-300 hover:border-gray-400"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      <CheckCircle2 className="h-8 w-8 text-[#047857]" />
                      <div className="text-left">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-500">{parsedData.length} accounts found</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); setFile(null); setParsedData([]); }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="font-medium">Click to upload or drag and drop</p>
                      <p className="text-sm text-gray-500">CSV or Excel files supported</p>
                    </>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV Template
                </Button>
              </div>
            )}

            {importMethod === 'template' && (
              <div className="space-y-3">
                {TEMPLATES.map((template) => {
                  const Icon = template.icon;
                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => { setSelectedTemplate(template.id); setError(null); }}
                      className={cn(
                        "w-full flex items-center justify-between p-4 border-2 rounded-lg transition-colors",
                        selectedTemplate === template.id
                          ? "border-[#047857] bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn("h-6 w-6", template.color)} />
                        <div className="text-left">
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-gray-500">{template.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-500">{template.accountCount} accounts</span>
                        {selectedTemplate === template.id && (
                          <CheckCircle2 className="h-5 w-5 text-[#047857] ml-2 inline" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Map Fields */}
        {step === 2 && !importResults && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Map your CSV columns to the account fields. We've auto-detected some mappings for you.
            </p>

            <div className="border rounded-lg divide-y">
              {Object.entries(fieldMapping).map(([field, value]) => (
                <div key={field} className="flex items-center justify-between p-3">
                  <Label className="font-medium capitalize">{field.replace('_', ' ')}</Label>
                  <select
                    value={value}
                    onChange={(e) => setFieldMapping(prev => ({ ...prev, [field]: e.target.value }))}
                    className="w-48 px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="">-- Not Mapped --</option>
                    {parsedData[0] && Object.keys(parsedData[0]).filter(k => k !== '_rowIndex').map((header) => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-sm mb-2">Preview (first 3 rows)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Number</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Subtype</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 3).map((row, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="p-2 font-mono">{row[fieldMapping.number]}</td>
                        <td className="p-2">{row[fieldMapping.name]}</td>
                        <td className="p-2">{row[fieldMapping.type]}</td>
                        <td className="p-2">{row[fieldMapping.subtype]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review & Import */}
        {step === 3 && !importResults && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-1">Ready to Import</h4>
              <p className="text-sm text-blue-700">
                {totalAccountsToImport} accounts will be added to your chart of accounts.
              </p>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h4 className="font-medium text-sm">Preview</h4>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium">Number</th>
                      <th className="text-left px-4 py-2 font-medium">Name</th>
                      <th className="text-left px-4 py-2 font-medium">Type</th>
                      <th className="text-left px-4 py-2 font-medium">Subtype</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {previewAccounts.map((acc, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2 font-mono text-xs">{acc.number}</td>
                        <td className="px-4 py-2">{acc.name}</td>
                        <td className="px-4 py-2">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-xs",
                            acc.type === 'Asset' && "bg-blue-100 text-blue-700",
                            acc.type === 'Liability' && "bg-red-100 text-red-700",
                            acc.type === 'Equity' && "bg-purple-100 text-purple-700",
                            acc.type === 'Revenue' && "bg-green-100 text-green-700",
                            acc.type === 'Expense' && "bg-orange-100 text-orange-700"
                          )}>
                            {acc.type}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-500 text-xs">{acc.subtype}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalAccountsToImport > 10 && (
                <div className="px-4 py-2 bg-gray-50 border-t text-sm text-gray-500">
                  And {totalAccountsToImport - 10} more...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Import Complete */}
        {importResults && (
          <div className="text-center py-8">
            <CheckCircle2 className="h-16 w-16 text-[#047857] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Import Complete!</h3>
            <p className="text-gray-600 mb-6">
              Successfully imported {importResults.imported} of {importResults.total} accounts.
            </p>
            <Button onClick={handleClose} className="bg-[#047857] hover:bg-[#065f46]">
              Done
            </Button>
          </div>
        )}

        {!importResults && (
          <DialogFooter>
            {step > 1 && (
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleNext}
              disabled={importMutation.isPending}
              className="bg-[#047857] hover:bg-[#065f46]"
            >
              {importMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {step === 3 ? 'Import Accounts' : 'Continue'}
              {step < 3 && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
