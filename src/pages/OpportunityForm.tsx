import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, Plus, Loader2, Info, MapPin, DollarSign,
  User, Home, Calendar, FileText, Tags, Upload, X
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
import { opportunityService } from '@/services/opportunityService';

// US States for dropdown
const US_STATES = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' }, { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' }, { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' }, { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' }, { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' }, { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' }, { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' }, { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' }, { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' }, { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' }, { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' }, { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' }, { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' }, { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' }, { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' }, { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' }, { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' }
];

const PROPERTY_TYPES = [
  { value: 'vacant-lot', label: 'Vacant Lot' },
  { value: 'flip-property', label: 'Flip Property' },
  { value: 'other', label: 'Other' }
];

const STAGES = [
  { value: 'Prospecting', label: 'Prospecting' },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Qualified', label: 'Qualified' },
  { value: 'Negotiating', label: 'Negotiating' },
  { value: 'Under Contract', label: 'Under Contract' }
];

const LEAD_SOURCES = [
  { value: 'Direct Mail', label: 'Direct Mail' },
  { value: 'Cold Call', label: 'Cold Call' },
  { value: 'Referral', label: 'Referral' },
  { value: 'Online', label: 'Online' },
  { value: 'Networking', label: 'Networking' },
  { value: 'Other', label: 'Other' }
];

const MOTIVATION_TYPES = [
  { value: 'Distressed', label: 'Distressed' },
  { value: 'Relocation', label: 'Relocation' },
  { value: 'Estate Sale', label: 'Estate Sale' },
  { value: 'Investor', label: 'Investor' },
  { value: 'Other', label: 'Other' }
];

const PROPERTY_CONDITIONS = [
  { value: 'Excellent', label: 'Excellent' },
  { value: 'Good', label: 'Good' },
  { value: 'Fair', label: 'Fair' },
  { value: 'Poor', label: 'Poor' },
  { value: 'Distressed', label: 'Distressed' }
];

const TAGS_OPTIONS = [
  'Hot Lead', 'Follow Up', 'Long Term', 'Referral', 'Repeat Seller'
];

interface FormData {
  // Property Information
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  // Deal Details
  dealNumber: string;
  stage: string;
  assignedTo: string;
  source: string;
  // Financial Information
  estimatedValue: string;
  assignmentFee: string;
  offerAmount: string;
  arv: string;
  // Seller Information
  sellerName: string;
  sellerPhone: string;
  sellerEmail: string;
  motivationType: string[];
  // Property Details (Lot)
  lotSize: string;
  // Property Details (Flip)
  squareFootage: string;
  bedrooms: string;
  bathrooms: string;
  yearBuilt: string;
  propertyCondition: string;
  // Timeline & Dates
  firstContactDate: string;
  expectedCloseDate: string;
  contractDate: string;
  inspectionDate: string;
  // Notes & Attachments
  notes: string;
  privateNotes: string;
  // Custom Fields
  tags: string[];
  probability: number;
  competingOffers: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

const OpportunityForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [errors, setErrors] = useState<FormErrors>({});
  const [attachments, setAttachments] = useState<File[]>([]);

  const [formData, setFormData] = useState<FormData>({
    address: '',
    city: 'Greenville',
    state: 'SC',
    zipCode: '',
    propertyType: '',
    dealNumber: '',
    stage: 'Prospecting',
    assignedTo: '',
    source: '',
    estimatedValue: '',
    assignmentFee: '',
    offerAmount: '',
    arv: '',
    sellerName: '',
    sellerPhone: '',
    sellerEmail: '',
    motivationType: [],
    lotSize: '',
    squareFootage: '',
    bedrooms: '',
    bathrooms: '',
    yearBuilt: '',
    propertyCondition: '',
    firstContactDate: new Date().toISOString().split('T')[0],
    expectedCloseDate: '',
    contractDate: '',
    inspectionDate: '',
    notes: '',
    privateNotes: '',
    tags: [],
    probability: 50,
    competingOffers: '0',
  });

  // Generate deal number
  useEffect(() => {
    if (!isEditing && !formData.dealNumber) {
      const year = new Date().getFullYear().toString().slice(-2);
      const random = Math.floor(Math.random() * 999).toString().padStart(3, '0');
      const addressPart = formData.address ? `-${formData.address.split(' ')[0]}` : '';
      setFormData(prev => ({ ...prev, dealNumber: `${year}-${random}${addressPart}` }));
    }
  }, [isEditing, formData.address]);

  // Load existing opportunity for editing
  useEffect(() => {
    if (isEditing && id) {
      setLoading(true);
      const loadOpportunity = async () => {
        try {
          const data = await opportunityService.getById(id);
          if (data) {
            setFormData({
              address: data.address || '',
              city: data.city || 'Greenville',
              state: data.state || 'SC',
              zipCode: data.zip_code || '',
              propertyType: data.property_type || '',
              dealNumber: data.deal_number || '',
              stage: data.stage || 'Prospecting',
              assignedTo: data.assigned_to || '',
              source: data.source || '',
              estimatedValue: data.estimated_value?.toString() || '',
              assignmentFee: data.assignment_fee?.toString() || '',
              offerAmount: data.offer_amount?.toString() || '',
              arv: data.arv?.toString() || '',
              sellerName: data.seller_name || '',
              sellerPhone: data.seller_phone || '',
              sellerEmail: data.seller_email || '',
              motivationType: data.motivation_type || [],
              lotSize: data.lot_size?.toString() || '',
              squareFootage: data.square_footage?.toString() || '',
              bedrooms: data.bedrooms?.toString() || '',
              bathrooms: data.bathrooms?.toString() || '',
              yearBuilt: data.year_built?.toString() || '',
              propertyCondition: data.property_condition || '',
              firstContactDate: data.first_contact_date || new Date().toISOString().split('T')[0],
              expectedCloseDate: data.expected_close_date || '',
              contractDate: data.contract_date || '',
              inspectionDate: data.inspection_date || '',
              notes: data.notes || '',
              privateNotes: data.private_notes || '',
              tags: data.tags || [],
              probability: data.probability || 50,
              competingOffers: data.competing_offers?.toString() || '0',
            });
          }
        } catch (error) {
          console.error('Failed to load opportunity:', error);
          toast({
            title: 'Error',
            description: 'Failed to load opportunity data',
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      };
      loadOpportunity();
    }
  }, [isEditing, id, toast]);

  // Auto-save every 30 seconds (only when editing an existing opportunity)
  useEffect(() => {
    if (!isEditing || !id) return;

    const timer = setInterval(async () => {
      if (formData.address) {
        setAutoSaveStatus('saving');
        try {
          const opportunityData = buildOpportunityData();
          await opportunityService.update(id, opportunityData);
          setAutoSaveStatus('saved');
          setTimeout(() => setAutoSaveStatus('idle'), 2000);
        } catch (error) {
          console.warn('Auto-save failed:', error);
          setAutoSaveStatus('idle');
        }
      }
    }, 30000);

    return () => clearInterval(timer);
  }, [formData, isEditing, id]);

  // Helper to build opportunity data for API
  const buildOpportunityData = () => ({
    address: formData.address,
    city: formData.city,
    state: formData.state,
    zip_code: formData.zipCode,
    property_type: formData.propertyType,
    deal_number: formData.dealNumber,
    stage: formData.stage,
    assigned_to: formData.assignedTo,
    source: formData.source,
    estimated_value: formData.estimatedValue ? parseFloat(formData.estimatedValue) : null,
    assignment_fee: formData.assignmentFee ? parseFloat(formData.assignmentFee) : null,
    offer_amount: formData.offerAmount ? parseFloat(formData.offerAmount) : null,
    arv: formData.arv ? parseFloat(formData.arv) : null,
    seller_name: formData.sellerName,
    seller_phone: formData.sellerPhone,
    seller_email: formData.sellerEmail,
    motivation_type: formData.motivationType,
    lot_size: formData.lotSize ? parseFloat(formData.lotSize) : null,
    square_footage: formData.squareFootage ? parseInt(formData.squareFootage) : null,
    bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
    bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : null,
    year_built: formData.yearBuilt ? parseInt(formData.yearBuilt) : null,
    property_condition: formData.propertyCondition,
    first_contact_date: formData.firstContactDate || null,
    expected_close_date: formData.expectedCloseDate || null,
    contract_date: formData.contractDate || null,
    inspection_date: formData.inspectionDate || null,
    notes: formData.notes,
    private_notes: formData.privateNotes,
    tags: formData.tags,
    probability: formData.probability,
    competing_offers: formData.competingOffers ? parseInt(formData.competingOffers) : 0,
  });

  const handleInputChange = (field: keyof FormData, value: string | string[] | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCurrencyChange = (field: keyof FormData, value: string) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    handleInputChange(field, numericValue);
  };

  const formatCurrencyDisplay = (value: string) => {
    if (!value) return '';
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  const handlePhoneChange = (value: string) => {
    // Format phone number as (XXX) XXX-XXXX
    const cleaned = value.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length >= 3) {
      formatted = `(${cleaned.slice(0, 3)})`;
      if (cleaned.length > 3) {
        formatted += ` ${cleaned.slice(3, 6)}`;
      }
      if (cleaned.length > 6) {
        formatted += `-${cleaned.slice(6, 10)}`;
      }
    }
    handleInputChange('sellerPhone', formatted);
  };

  const handleTagToggle = (tag: string) => {
    const newTags = formData.tags.includes(tag)
      ? formData.tags.filter(t => t !== tag)
      : [...formData.tags, tag];
    handleInputChange('tags', newTags);
  };

  const handleMotivationToggle = (motivation: string) => {
    const newMotivations = formData.motivationType.includes(motivation)
      ? formData.motivationType.filter(m => m !== motivation)
      : [...formData.motivationType, motivation];
    handleInputChange('motivationType', newMotivations);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      const isValidType = validTypes.includes(ext);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    if (attachments.length + validFiles.length <= 10) {
      setAttachments(prev => [...prev, ...validFiles]);
    } else {
      toast({
        title: 'Too many files',
        description: 'Maximum 10 attachments allowed',
        variant: 'destructive',
      });
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required field validation
    if (!formData.address || formData.address.length < 5) {
      newErrors.address = 'Property address is required (min 5 characters)';
    }
    if (!formData.city) {
      newErrors.city = 'City is required';
    }
    if (!formData.state) {
      newErrors.state = 'State is required';
    }
    if (!formData.propertyType) {
      newErrors.propertyType = 'Property type is required';
    }

    // At least one contact method
    if (!formData.sellerPhone && !formData.sellerEmail) {
      newErrors.sellerPhone = 'At least one contact method (phone or email) is required';
      newErrors.sellerEmail = 'At least one contact method (phone or email) is required';
    }

    // Email validation
    if (formData.sellerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.sellerEmail)) {
      newErrors.sellerEmail = 'Please enter a valid email address';
    }

    // Contract date required if Under Contract
    if (formData.stage === 'Under Contract' && !formData.contractDate) {
      newErrors.contractDate = 'Contract date is required when stage is Under Contract';
    }

    // Offer amount warning (not blocking)
    if (formData.offerAmount && formData.estimatedValue) {
      const offer = parseFloat(formData.offerAmount);
      const value = parseFloat(formData.estimatedValue);
      if (offer > value) {
        toast({
          title: 'Warning',
          description: 'Offer amount exceeds estimated value',
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (addAnother: boolean = false) => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before saving',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const opportunityData = buildOpportunityData();

      if (isEditing && id) {
        await opportunityService.update(id, opportunityData);
      } else {
        await opportunityService.create(opportunityData);
      }

      toast({
        title: isEditing ? 'Opportunity updated' : 'Opportunity created',
        description: `${formData.address} has been saved successfully`,
      });

      if (addAnother) {
        // Reset form for new entry
        setFormData({
          ...formData,
          address: '',
          zipCode: '',
          dealNumber: '',
          sellerName: '',
          sellerPhone: '',
          sellerEmail: '',
          estimatedValue: '',
          assignmentFee: '',
          offerAmount: '',
          arv: '',
          notes: '',
          privateNotes: '',
          tags: [],
          probability: 50,
          competingOffers: '0',
        });
        setAttachments([]);
      } else {
        navigate('/opportunities');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save opportunity',
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
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/opportunities')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {isEditing ? 'Edit Opportunity' : 'New Opportunity'}
                </h1>
                {autoSaveStatus === 'saving' && (
                  <span className="text-sm text-gray-500">Saving...</span>
                )}
                {autoSaveStatus === 'saved' && (
                  <span className="text-sm text-emerald-600">All changes saved</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/opportunities')}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSubmit(true)}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Save & Add Another
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => handleSubmit(false)}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {isEditing ? 'Update Opportunity' : 'Save Opportunity'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Section 1: Property Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              Property Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="address">
                Property Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 Main Street"
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
            </div>
            <div>
              <Label htmlFor="city">
                City <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state">
                  State <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.state} onValueChange={(v) => handleInputChange('state', v)}>
                  <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map(state => (
                      <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="29601"
                  maxLength={10}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="propertyType">
                Property Type <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.propertyType} onValueChange={(v) => handleInputChange('propertyType', v)}>
                <SelectTrigger className={errors.propertyType ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.propertyType && <p className="text-sm text-red-500 mt-1">{errors.propertyType}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Deal Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Deal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dealNumber">
                Deal Number
                <span className="ml-2 text-xs text-gray-500">(Auto-generated)</span>
              </Label>
              <Input
                id="dealNumber"
                value={formData.dealNumber}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label htmlFor="stage">Current Stage</Label>
              <Select value={formData.stage} onValueChange={(v) => handleInputChange('stage', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map(stage => (
                    <SelectItem key={stage.value} value={stage.value}>{stage.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Select value={formData.assignedTo} onValueChange={(v) => handleInputChange('assignedTo', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bryan">Bryan</SelectItem>
                  <SelectItem value="John">John</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="source">Lead Source</Label>
              <Select value={formData.source} onValueChange={(v) => handleInputChange('source', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_SOURCES.map(source => (
                    <SelectItem key={source.value} value={source.value}>{source.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Financial Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimatedValue">Estimated Value</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="estimatedValue"
                  value={formData.estimatedValue}
                  onChange={(e) => handleCurrencyChange('estimatedValue', e.target.value)}
                  placeholder="0.00"
                  className="pl-7"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="assignmentFee">
                Expected Assignment Fee
                <span className="ml-2 text-xs text-gray-500">(Typical: $10K for lots, $7K for flips)</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="assignmentFee"
                  value={formData.assignmentFee}
                  onChange={(e) => handleCurrencyChange('assignmentFee', e.target.value)}
                  placeholder="10,000"
                  className="pl-7"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="offerAmount">Offer Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="offerAmount"
                  value={formData.offerAmount}
                  onChange={(e) => handleCurrencyChange('offerAmount', e.target.value)}
                  placeholder="0.00"
                  className="pl-7"
                />
              </div>
            </div>
            {formData.propertyType === 'flip-property' && (
              <div>
                <Label htmlFor="arv">ARV (After Repair Value)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="arv"
                    value={formData.arv}
                    onChange={(e) => handleCurrencyChange('arv', e.target.value)}
                    placeholder="0.00"
                    className="pl-7"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 4: Seller Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              Seller Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sellerName">Seller Name</Label>
              <Input
                id="sellerName"
                value={formData.sellerName}
                onChange={(e) => handleInputChange('sellerName', e.target.value)}
                placeholder="John Smith"
              />
            </div>
            <div>
              <Label htmlFor="sellerPhone">
                Phone Number
                {!formData.sellerEmail && <span className="text-red-500"> *</span>}
              </Label>
              <Input
                id="sellerPhone"
                value={formData.sellerPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="(864) 555-0101"
                className={errors.sellerPhone ? 'border-red-500' : ''}
              />
              {errors.sellerPhone && <p className="text-sm text-red-500 mt-1">{errors.sellerPhone}</p>}
            </div>
            <div>
              <Label htmlFor="sellerEmail">
                Email Address
                {!formData.sellerPhone && <span className="text-red-500"> *</span>}
              </Label>
              <Input
                id="sellerEmail"
                type="email"
                value={formData.sellerEmail}
                onChange={(e) => handleInputChange('sellerEmail', e.target.value)}
                placeholder="seller@example.com"
                className={errors.sellerEmail ? 'border-red-500' : ''}
              />
              {errors.sellerEmail && <p className="text-sm text-red-500 mt-1">{errors.sellerEmail}</p>}
            </div>
            <div className="md:col-span-2">
              <Label>Seller Motivation (select all that apply)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {MOTIVATION_TYPES.map(motivation => (
                  <Button
                    key={motivation.value}
                    type="button"
                    variant={formData.motivationType.includes(motivation.value) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleMotivationToggle(motivation.value)}
                    className={formData.motivationType.includes(motivation.value) ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                  >
                    {motivation.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Property Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5 text-emerald-600" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formData.propertyType === 'vacant-lot' && (
              <div>
                <Label htmlFor="lotSize">Lot Size (acres)</Label>
                <Input
                  id="lotSize"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.lotSize}
                  onChange={(e) => handleInputChange('lotSize', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            )}
            {formData.propertyType === 'flip-property' && (
              <>
                <div>
                  <Label htmlFor="squareFootage">Square Footage</Label>
                  <Input
                    id="squareFootage"
                    type="number"
                    min="0"
                    value={formData.squareFootage}
                    onChange={(e) => handleInputChange('squareFootage', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min="0"
                    max="20"
                    value={formData.bedrooms}
                    onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={formData.bathrooms}
                    onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="yearBuilt">Year Built</Label>
                  <Input
                    id="yearBuilt"
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={formData.yearBuilt}
                    onChange={(e) => handleInputChange('yearBuilt', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="propertyCondition">Property Condition</Label>
                  <Select value={formData.propertyCondition} onValueChange={(v) => handleInputChange('propertyCondition', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_CONDITIONS.map(condition => (
                        <SelectItem key={condition.value} value={condition.value}>{condition.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            {!formData.propertyType && (
              <p className="text-gray-500 col-span-full">Select a property type to see relevant fields</p>
            )}
          </CardContent>
        </Card>

        {/* Section 6: Timeline & Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Timeline & Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstContactDate">First Contact Date</Label>
              <Input
                id="firstContactDate"
                type="date"
                value={formData.firstContactDate}
                onChange={(e) => handleInputChange('firstContactDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
              <Input
                id="expectedCloseDate"
                type="date"
                value={formData.expectedCloseDate}
                onChange={(e) => handleInputChange('expectedCloseDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            {formData.stage === 'Under Contract' && (
              <>
                <div>
                  <Label htmlFor="contractDate">
                    Contract Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contractDate"
                    type="date"
                    value={formData.contractDate}
                    onChange={(e) => handleInputChange('contractDate', e.target.value)}
                    className={errors.contractDate ? 'border-red-500' : ''}
                  />
                  {errors.contractDate && <p className="text-sm text-red-500 mt-1">{errors.contractDate}</p>}
                </div>
                <div>
                  <Label htmlFor="inspectionDate">Inspection Date</Label>
                  <Input
                    id="inspectionDate"
                    type="date"
                    value={formData.inspectionDate}
                    onChange={(e) => handleInputChange('inspectionDate', e.target.value)}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Section 7: Notes & Attachments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Notes & Attachments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any relevant details about this opportunity..."
                rows={6}
                maxLength={5000}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.notes.length}/5000 characters</p>
            </div>
            <div>
              <Label htmlFor="privateNotes">
                Private Notes (Internal Only)
                <span className="ml-2 text-xs text-gray-500">Not shared with seller or external parties</span>
              </Label>
              <Textarea
                id="privateNotes"
                value={formData.privateNotes}
                onChange={(e) => handleInputChange('privateNotes', e.target.value)}
                placeholder="Notes only visible to team members..."
                rows={4}
                maxLength={5000}
              />
            </div>
            <div>
              <Label>Attachments</Label>
              <p className="text-xs text-gray-500 mb-2">Photos, documents, contracts, etc. (Max 10 files, 10MB each)</p>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="attachments"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="attachments"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600">Click to upload or drag and drop</span>
                  <span className="text-xs text-gray-400">PDF, JPG, PNG, DOC up to 10MB</span>
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
            </div>
          </CardContent>
        </Card>

        {/* Section 8: Custom Fields */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tags className="w-5 h-5 text-emerald-600" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {TAGS_OPTIONS.map(tag => (
                  <Button
                    key={tag}
                    type="button"
                    variant={formData.tags.includes(tag) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTagToggle(tag)}
                    className={formData.tags.includes(tag) ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="probability">Win Probability: {formData.probability}%</Label>
                <input
                  type="range"
                  id="probability"
                  min="0"
                  max="100"
                  step="5"
                  value={formData.probability}
                  onChange={(e) => handleInputChange('probability', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
              <div>
                <Label htmlFor="competingOffers">Number of Competing Offers</Label>
                <Input
                  id="competingOffers"
                  type="number"
                  min="0"
                  value={formData.competingOffers}
                  onChange={(e) => handleInputChange('competingOffers', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OpportunityForm;
