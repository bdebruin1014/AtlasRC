// src/components/accounting/Generate1099Modal.jsx
// Modal for generating 1099 forms for vendors

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  FileText, CheckCircle, AlertCircle, Loader2, Download, Building2,
  AlertTriangle, Search, ChevronRight, Printer, Mail, X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

// Demo vendors for 1099 generation
const demoVendors = [
  { id: 'v1', company_name: 'Smith Framing LLC', tax_id: '12-3456789', ytd_payments: 85000.00, has_w9: true, address_complete: true, form_type: 'NEC' },
  { id: 'v2', company_name: 'ABC Electric', tax_id: '98-7654321', ytd_payments: 42500.00, has_w9: true, address_complete: true, form_type: 'NEC' },
  { id: 'v3', company_name: 'Pro Plumbing Services', tax_id: '55-1234567', ytd_payments: 28750.00, has_w9: true, address_complete: true, form_type: 'NEC' },
  { id: 'v4', company_name: 'Concrete Solutions Inc', tax_id: '33-9876543', ytd_payments: 67200.00, has_w9: true, address_complete: false, form_type: 'NEC' },
  { id: 'v5', company_name: 'HVAC Masters', tax_id: null, ytd_payments: 15800.00, has_w9: false, address_complete: true, form_type: 'NEC' },
  { id: 'v6', company_name: 'Johnson Drywall', tax_id: '77-5555555', ytd_payments: 31400.00, has_w9: true, address_complete: true, form_type: 'NEC' },
  { id: 'v7', company_name: 'Rental Equipment Co', tax_id: '44-3333333', ytd_payments: 8500.00, has_w9: true, address_complete: true, form_type: 'MISC' },
  { id: 'v8', company_name: 'Independent Contractor', tax_id: '11-2222222', ytd_payments: 4200.00, has_w9: true, address_complete: true, form_type: 'NEC' },
];

export default function Generate1099Modal({ open, onClose, entityId, taxYear }) {
  const queryClient = useQueryClient();
  const currentYear = taxYear || new Date().getFullYear();

  const [step, setStep] = useState(1);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [threshold, setThreshold] = useState('600');
  const [formType, setFormType] = useState('all');
  const [deliveryMethod, setDeliveryMethod] = useState('print');
  const [generatedForms, setGeneratedForms] = useState([]);
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    ein: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  // Fetch vendors eligible for 1099
  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['1099-vendors', entityId, currentYear],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('vendors')
          .select(`
            *,
            bills:bills(amount)
          `)
          .eq('entity_id', entityId)
          .eq('is_1099_eligible', true);

        if (error) throw error;

        // Calculate YTD payments
        return (data || []).map(v => ({
          ...v,
          ytd_payments: v.bills?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0,
          form_type: v.vendor_type === 'rental' ? 'MISC' : 'NEC',
        }));
      } catch (err) {
        console.error('Error fetching vendors:', err);
        return demoVendors;
      }
    },
    enabled: open,
  });

  // Filter vendors based on search, threshold, and form type
  const filteredVendors = vendors.filter(v => {
    const meetsThreshold = v.ytd_payments >= parseFloat(threshold || 0);
    const matchesSearch = !searchTerm ||
      v.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.tax_id?.includes(searchTerm);
    const matchesType = formType === 'all' || v.form_type === formType;
    return meetsThreshold && matchesSearch && matchesType;
  });

  // Vendors ready for 1099 (have tax ID and complete address)
  const readyVendors = filteredVendors.filter(v => v.has_w9 && v.tax_id && v.address_complete);
  const incompleteVendors = filteredVendors.filter(v => !v.has_w9 || !v.tax_id || !v.address_complete);

  const handleSelectVendor = (vendorId) => {
    setSelectedVendors(prev =>
      prev.includes(vendorId)
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const handleSelectAll = (vendorList) => {
    const ids = vendorList.map(v => v.id);
    const allSelected = ids.every(id => selectedVendors.includes(id));
    if (allSelected) {
      setSelectedVendors(prev => prev.filter(id => !ids.includes(id)));
    } else {
      setSelectedVendors(prev => [...new Set([...prev, ...ids])]);
    }
  };

  const generateMutation = useMutation({
    mutationFn: async () => {
      // Simulate 1099 generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const selectedData = vendors.filter(v => selectedVendors.includes(v.id));
      return selectedData.map(v => ({
        vendor_id: v.id,
        vendor_name: v.company_name,
        tax_id: v.tax_id,
        amount: v.ytd_payments,
        form_type: v.form_type,
        status: 'generated',
      }));
    },
    onSuccess: (forms) => {
      setGeneratedForms(forms);
      setStep(4);
      queryClient.invalidateQueries(['1099-forms', entityId]);
    },
  });

  const handleGenerate = () => {
    setStep(3);
    generateMutation.mutate();
  };

  const handleDownloadPDF = () => {
    // Simulate PDF download
    const content = `1099 Forms for Tax Year ${currentYear}\n\n` +
      generatedForms.map(f => `${f.vendor_name}: $${f.amount.toFixed(2)} (${f.form_type})`).join('\n');

    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `1099-forms-${currentYear}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setStep(1);
    setSelectedVendors([]);
    setSearchTerm('');
    setGeneratedForms([]);
    onClose();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const selectedTotal = vendors
    .filter(v => selectedVendors.includes(v.id))
    .reduce((sum, v) => sum + v.ytd_payments, 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Generate 1099 Forms</DialogTitle>
          <DialogDescription>
            {step === 1 && `Select vendors for 1099 generation - Tax Year ${currentYear}`}
            {step === 2 && 'Review and confirm your selections'}
            {step === 3 && 'Generating 1099 forms...'}
            {step === 4 && '1099 forms generated successfully'}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 py-2">
          {[1, 2, 3, 4].map((s) => (
            <React.Fragment key={s}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                step >= s ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
              )}>
                {step > s ? <CheckCircle className="h-4 w-4" /> : s}
              </div>
              {s < 4 && (
                <div className={cn(
                  "w-12 h-0.5",
                  step > s ? "bg-blue-600" : "bg-gray-200"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Step 1: Select Vendors */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search vendors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Form Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Forms</SelectItem>
                    <SelectItem value="NEC">1099-NEC</SelectItem>
                    <SelectItem value="MISC">1099-MISC</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Label className="text-sm whitespace-nowrap">Min $:</Label>
                  <Input
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="w-24"
                  />
                </div>
              </div>

              {/* Ready Vendors */}
              {readyVendors.length > 0 && (
                <div className="border rounded-lg">
                  <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={readyVendors.every(v => selectedVendors.includes(v.id))}
                        onCheckedChange={() => handleSelectAll(readyVendors)}
                      />
                      <span className="font-medium text-sm">
                        Ready for 1099 ({readyVendors.length})
                      </span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Complete</Badge>
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y">
                    {readyVendors.map(vendor => (
                      <div
                        key={vendor.id}
                        className={cn(
                          "flex items-center gap-4 px-4 py-3 hover:bg-muted/50 cursor-pointer",
                          selectedVendors.includes(vendor.id) && "bg-blue-50"
                        )}
                        onClick={() => handleSelectVendor(vendor.id)}
                      >
                        <Checkbox
                          checked={selectedVendors.includes(vendor.id)}
                          onCheckedChange={() => handleSelectVendor(vendor.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{vendor.company_name}</p>
                          <p className="text-xs text-muted-foreground">
                            TIN: {vendor.tax_id}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {vendor.form_type}
                        </Badge>
                        <p className="font-medium text-right">
                          {formatCurrency(vendor.ytd_payments)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Incomplete Vendors */}
              {incompleteVendors.length > 0 && (
                <div className="border border-amber-200 rounded-lg">
                  <div className="flex items-center justify-between px-4 py-2 bg-amber-50 border-b border-amber-200">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span className="font-medium text-sm text-amber-800">
                        Missing Information ({incompleteVendors.length})
                      </span>
                    </div>
                  </div>
                  <div className="max-h-32 overflow-y-auto divide-y">
                    {incompleteVendors.map(vendor => (
                      <div key={vendor.id} className="flex items-center gap-4 px-4 py-3 bg-amber-50/50">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{vendor.company_name}</p>
                          <div className="flex gap-2 mt-1">
                            {!vendor.has_w9 && (
                              <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                                No W-9
                              </Badge>
                            )}
                            {!vendor.tax_id && (
                              <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                                No TIN
                              </Badge>
                            )}
                            {!vendor.address_complete && (
                              <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                                Incomplete Address
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="font-medium text-right text-muted-foreground">
                          {formatCurrency(vendor.ytd_payments)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredVendors.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p>No vendors meet the criteria</p>
                  <p className="text-sm">Try adjusting the minimum payment threshold</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Review & Confirm */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Delivery Method */}
              <div className="space-y-2">
                <Label>Delivery Method</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-3 p-4 border rounded-lg text-left transition-colors",
                      deliveryMethod === 'print' ? "border-blue-500 bg-blue-50" : "hover:border-gray-400"
                    )}
                    onClick={() => setDeliveryMethod('print')}
                  >
                    <Printer className={cn("h-5 w-5", deliveryMethod === 'print' ? "text-blue-600" : "text-gray-400")} />
                    <div>
                      <p className="font-medium">Print & Mail</p>
                      <p className="text-xs text-muted-foreground">Download PDF to print</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-3 p-4 border rounded-lg text-left transition-colors",
                      deliveryMethod === 'email' ? "border-blue-500 bg-blue-50" : "hover:border-gray-400"
                    )}
                    onClick={() => setDeliveryMethod('email')}
                  >
                    <Mail className={cn("h-5 w-5", deliveryMethod === 'email' ? "text-blue-600" : "text-gray-400")} />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-xs text-muted-foreground">Send electronically</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="border rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-muted/50 border-b">
                  <h4 className="font-medium">Summary</h4>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax Year:</span>
                    <span className="font-medium">{currentYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vendors Selected:</span>
                    <span className="font-medium">{selectedVendors.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Payments:</span>
                    <span className="font-medium">{formatCurrency(selectedTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Method:</span>
                    <span className="font-medium capitalize">{deliveryMethod === 'print' ? 'Print & Mail' : 'Email'}</span>
                  </div>
                </div>
              </div>

              {/* Selected Vendors List */}
              <div className="border rounded-lg">
                <div className="px-4 py-2 bg-muted/50 border-b">
                  <h4 className="font-medium text-sm">Selected Vendors</h4>
                </div>
                <div className="max-h-40 overflow-y-auto divide-y">
                  {vendors.filter(v => selectedVendors.includes(v.id)).map(vendor => (
                    <div key={vendor.id} className="flex items-center justify-between px-4 py-2">
                      <div>
                        <p className="font-medium text-sm">{vendor.company_name}</p>
                        <p className="text-xs text-muted-foreground">1099-{vendor.form_type}</p>
                      </div>
                      <p className="font-medium">{formatCurrency(vendor.ytd_payments)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Generating */}
          {step === 3 && (
            <div className="py-12 text-center">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="font-medium text-lg">Generating 1099 Forms...</p>
              <p className="text-muted-foreground mt-1">
                Processing {selectedVendors.length} vendors for tax year {currentYear}
              </p>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium mb-2">1099 Forms Generated!</h3>
                <p className="text-muted-foreground">
                  Successfully created {generatedForms.length} forms totaling {formatCurrency(selectedTotal)}
                </p>
              </div>

              {/* Generated Forms Summary */}
              <div className="border rounded-lg">
                <div className="px-4 py-2 bg-muted/50 border-b flex items-center justify-between">
                  <h4 className="font-medium text-sm">Generated Forms</h4>
                  <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                    <Download className="h-4 w-4 mr-1" />
                    Download All
                  </Button>
                </div>
                <div className="max-h-48 overflow-y-auto divide-y">
                  {generatedForms.map((form, idx) => (
                    <div key={idx} className="flex items-center justify-between px-4 py-2">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{form.vendor_name}</p>
                          <p className="text-xs text-muted-foreground">1099-{form.form_type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-medium">{formatCurrency(form.amount)}</p>
                        <Badge className="bg-green-100 text-green-800">Generated</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Next Steps</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Download and review generated forms for accuracy</li>
                  <li>• Mail Copy B to recipients by January 31</li>
                  <li>• File Copy A with IRS by January 31 (paper) or March 31 (electronic)</li>
                  <li>• Keep Copy C for your records</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          {step === 1 && (
            <>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button
                onClick={() => setStep(2)}
                disabled={selectedVendors.length === 0}
              >
                Continue
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleGenerate}>
                <FileText className="h-4 w-4 mr-2" />
                Generate {selectedVendors.length} Forms
              </Button>
            </>
          )}
          {step === 4 && (
            <Button onClick={handleClose}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
