import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ImportVendorsModal({ open, onClose, entityId }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState({ headers: [], rows: [] });
  const [mapping, setMapping] = useState({});
  const [vendors, setVendors] = useState([]);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^\"|\"$/g, ''));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^\"|\"$/g, ''));
      if (values.some(v => v)) {
        const row = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx] || '';
        });
        rows.push(row);
      }
    }

    return { headers, rows };
  };

  const autoMapFields = (headers) => {
    const newMapping = {};
    const fieldMap = {
      'name': 'display_name',
      'display_name': 'display_name',
      'vendor': 'display_name',
      'vendor_name': 'display_name',
      'company': 'company_name',
      'company_name': 'company_name',
      'email': 'email',
      'phone': 'phone',
      'address': 'address_line1',
      'address_line1': 'address_line1',
      'city': 'city',
      'state': 'state',
      'zip': 'zip',
      'zip_code': 'zip',
      'tax_id': 'tax_id',
      'ein': 'tax_id',
      'contact': 'contact_first_name',
      'contact_name': 'contact_first_name',
      'type': 'vendor_type',
      'vendor_type': 'vendor_type',
    };

    headers.forEach(header => {
      const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      if (fieldMap[normalizedHeader]) {
        newMapping[header] = fieldMap[normalizedHeader];
      }
    });

    return newMapping;
  };

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setError(null);

    try {
      const text = await selectedFile.text();
      const parsed = parseCSV(text);

      if (parsed.rows.length === 0) {
        setError('No data found in file');
        return;
      }

      setCsvData(parsed);
      setMapping(autoMapFields(parsed.headers));
      setStep(2);
    } catch (err) {
      setError('Failed to parse CSV file');
    }
  };

  const handleMappingComplete = () => {
    const mappedFields = Object.values(mapping);
    if (!mappedFields.includes('display_name') && !mappedFields.includes('company_name')) {
      setError('Company name or Display name is required');
      return;
    }

    const transformedVendors = csvData.rows.map((row, idx) => {
      const vendor = { _rowNum: idx + 2 };
      Object.entries(mapping).forEach(([csvHeader, field]) => {
        if (field && row[csvHeader]) {
          vendor[field] = row[csvHeader];
        }
      });

      // Auto-fill display_name from company_name if not mapped
      if (!vendor.display_name && vendor.company_name) {
        vendor.display_name = vendor.company_name;
      }
      if (!vendor.company_name && vendor.display_name) {
        vendor.company_name = vendor.display_name;
      }

      vendor._isValid = !!(vendor.display_name || vendor.company_name);
      return vendor;
    });

    setVendors(transformedVendors);
    setStep(3);
  };

  const importMutation = useMutation({
    mutationFn: async (vendorsToImport) => {
      const results = [];
      for (const vendor of vendorsToImport) {
        if (!vendor._isValid) continue;

        const { _rowNum, _isValid, ...data } = vendor;
        const { error } = await supabase
          .from('vendors')
          .insert([{
            entity_id: entityId,
            vendor_type: data.vendor_type || 'other',
            ...data,
          }]);

        if (!error) results.push(data);
      }
      return { imported: results.length, total: vendorsToImport.length };
    },
    onSuccess: (result) => {
      setImportResult(result);
      setStep(5);
      queryClient.invalidateQueries(['vendors', entityId]);
    },
    onError: (err) => {
      setError(err.message || 'Failed to import vendors');
      setStep(3);
    }
  });

  const handleImport = () => {
    setStep(4);
    const validVendors = vendors.filter(v => v._isValid);
    importMutation.mutate(validVendors);
  };

  const handleClose = () => {
    setStep(1);
    setFile(null);
    setCsvData({ headers: [], rows: [] });
    setMapping({});
    setVendors([]);
    setImportResult(null);
    setError(null);
    onClose();
  };

  const downloadTemplate = () => {
    const template = `company_name,display_name,email,phone,address_line1,city,state,zip,vendor_type,tax_id
"Smith Framing LLC","Smith Framing LLC","ap@smithframing.com","(555) 123-4567","123 Main St","Denver","CO","80202","subcontractor","12-3456789"
"ABC Plumbing","ABC Plumbing","billing@abcplumbing.com","(555) 987-6543","456 Oak Ave","Boulder","CO","80301","subcontractor","98-7654321"`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vendors-template.csv';
    a.click();
  };

  const validCount = vendors.filter(v => v._isValid).length;
  const invalidCount = vendors.length - validCount;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Vendors</DialogTitle>
          <DialogDescription>
            {step === 1 && 'Upload a CSV file to import vendors'}
            {step === 2 && 'Map CSV columns to vendor fields'}
            {step === 3 && 'Review vendors before importing'}
            {step === 4 && 'Importing vendors...'}
            {step === 5 && 'Import complete'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="py-6">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
            >
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-lg font-medium mb-1">Drop your CSV file here</p>
              <p className="text-sm text-muted-foreground mb-3">or click to browse</p>
              <Button type="button" variant="outline" size="sm">
                Select File
              </Button>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button variant="link" size="sm" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-1" />
                Download Template
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Mapping */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{file?.name}</span>
              <span className="text-sm text-muted-foreground">
                ({csvData.rows.length} rows)
              </span>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-3">
              {csvData.headers.map(header => (
                <div key={header} className="flex items-center gap-4">
                  <div className="w-1/3">
                    <p className="text-sm font-medium truncate" title={header}>{header}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {csvData.rows[0]?.[header] || '(empty)'}
                    </p>
                  </div>
                  <span className="text-muted-foreground">→</span>
                  <Select
                    value={mapping[header] || 'skip'}
                    onValueChange={(value) => setMapping(prev => ({
                      ...prev,
                      [header]: value === 'skip' ? '' : value
                    }))}
                  >
                    <SelectTrigger className="w-1/2">
                      <SelectValue placeholder="Skip this field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skip">Skip this field</SelectItem>
                      <SelectItem value="company_name">Company Name *</SelectItem>
                      <SelectItem value="display_name">Display Name *</SelectItem>
                      <SelectItem value="vendor_type">Vendor Type</SelectItem>
                      <SelectItem value="contact_first_name">Contact First Name</SelectItem>
                      <SelectItem value="contact_last_name">Contact Last Name</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="address_line1">Address</SelectItem>
                      <SelectItem value="city">City</SelectItem>
                      <SelectItem value="state">State</SelectItem>
                      <SelectItem value="zip">ZIP Code</SelectItem>
                      <SelectItem value="tax_id">Tax ID / EIN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 3 && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {invalidCount > 0 && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                <AlertCircle className="h-4 w-4" />
                {invalidCount} vendor(s) are missing required fields and will be skipped
              </div>
            )}

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-3 py-2 w-8"></th>
                    <th className="text-left px-3 py-2">Company Name</th>
                    <th className="text-left px-3 py-2">Email</th>
                    <th className="text-left px-3 py-2">Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {vendors.slice(0, 20).map((vendor, idx) => (
                    <tr key={idx} className={!vendor._isValid ? 'bg-red-50' : ''}>
                      <td className="px-3 py-2">
                        {vendor._isValid ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </td>
                      <td className="px-3 py-2 font-medium">
                        {vendor.company_name || vendor.display_name || <span className="text-red-500 italic">Missing</span>}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{vendor.email || '-'}</td>
                      <td className="px-3 py-2 text-muted-foreground">{vendor.phone || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {vendors.length > 20 && (
                <div className="px-3 py-2 bg-muted text-sm text-muted-foreground">
                  ... and {vendors.length - 20} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Importing */}
        {step === 4 && (
          <div className="py-12 text-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="font-medium">Importing vendors...</p>
            <p className="text-sm text-muted-foreground">This may take a moment</p>
          </div>
        )}

        {/* Step 5: Complete */}
        {step === 5 && (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Import Complete!</h3>
            <p className="text-muted-foreground">
              Successfully imported {importResult?.imported} of {importResult?.total} vendors
            </p>
          </div>
        )}

        <DialogFooter>
          {step === 1 && (
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
          )}
          {step === 2 && (
            <>
              <Button variant="outline" onClick={() => { setStep(1); setFile(null); setCsvData({ headers: [], rows: [] }); setMapping({}); }}>
                Back
              </Button>
              <Button onClick={handleMappingComplete}>
                Continue
              </Button>
            </>
          )}
          {step === 3 && (
            <>
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={handleImport} disabled={validCount === 0}>
                Import {validCount} Vendors
              </Button>
            </>
          )}
          {step === 5 && (
            <Button onClick={handleClose}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
