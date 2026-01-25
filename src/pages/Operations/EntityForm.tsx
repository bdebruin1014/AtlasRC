import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, Loader2, Building2, FileText, MapPin, Wallet, Users, Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { entityService } from '@/services/entityService';

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

// Entity Purpose - Operational Role
const ENTITY_PURPOSES = [
  { value: 'holding_company', label: 'Holding Company', description: 'Parent entity that owns other companies' },
  { value: 'operating_company', label: 'Operating Company', description: 'Active business operations' },
  { value: 'spe', label: 'Single Purpose Entity (SPE)', description: 'Single-purpose entity for a specific project' },
];

// Entity Type - Legal Structure
const ENTITY_TYPES = [
  { value: 'llc', label: 'LLC', description: 'Limited Liability Company' },
  { value: 's_corp', label: 'S-Corporation', description: 'Pass-through taxation corporation' },
  { value: 'c_corp', label: 'C-Corporation', description: 'Standard corporation' },
  { value: 'partnership', label: 'Partnership', description: 'General or limited partnership' },
  { value: 'lp', label: 'Limited Partnership (LP)', description: 'Partnership with limited partners' },
  { value: 'sole_proprietorship', label: 'Sole Proprietorship', description: 'Individual ownership' },
  { value: 'trust', label: 'Trust', description: 'Legal trust arrangement' },
  { value: 'individual', label: 'Individual', description: 'Natural person' },
  { value: 'other', label: 'Other', description: 'Other legal structure' },
];

// Project Types for SPE entities
const PROJECT_TYPES = [
  { value: 'lot_development', label: 'Lot Development', description: 'Land subdivision & lot sales' },
  { value: 'btr', label: 'Build-to-Rent (BTR)', description: 'Rental community development' },
  { value: 'fix_and_flip', label: 'Fix & Flip', description: 'Property renovation & resale' },
  { value: 'spec_build', label: 'Spec Build', description: 'Speculative home construction' },
  { value: 'community_development', label: 'Community Development', description: 'Master-planned community' },
  { value: 'none', label: 'None / General', description: 'General purpose SPE' },
];

// SEC Exemptions for syndication
const SEC_EXEMPTIONS = [
  { value: '506b', label: 'Reg D 506(b)', description: 'Up to 35 non-accredited investors' },
  { value: '506c', label: 'Reg D 506(c)', description: 'Accredited investors only, general solicitation allowed' },
  { value: 'reg_a', label: 'Regulation A', description: 'Mini-IPO, up to $75M' },
  { value: 'reg_cf', label: 'Regulation CF', description: 'Crowdfunding, up to $5M' },
  { value: 'other', label: 'Other', description: 'Other SEC exemption' },
];

// Legacy LEGAL_STRUCTURES for backward compatibility
const LEGAL_STRUCTURES = ENTITY_TYPES;

// Default entities for fallback
const defaultParentEntities = [
  { id: '1', name: 'Olive Brynn LLC' },
  { id: '2', name: 'VanRock Holdings LLC' },
];

interface FormData {
  name: string;
  type: string; // Legacy field - maps to entity_purpose
  entityType: string; // Legal structure (LLC, S-Corp, etc.)
  entityPurpose: string; // Operational role (holding_company, operating_company, spe)
  projectType: string; // For SPE entities only
  parentEntityId: string;
  legalStructure: string; // Legacy - now uses entityType
  taxId: string;
  stateOfFormation: string;
  formationDate: string;
  phone: string;
  email: string;
  website: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  notes: string;
  // Syndication fields
  isSyndication: boolean;
  secExemption: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

const EntityForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [parentEntities, setParentEntities] = useState<{ id: string; name: string }[]>(defaultParentEntities);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: '', // Legacy
    entityType: '',
    entityPurpose: '',
    projectType: '',
    parentEntityId: '',
    legalStructure: '', // Legacy
    taxId: '',
    stateOfFormation: 'SC',
    formationDate: '',
    phone: '',
    email: '',
    website: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: 'SC',
    zipCode: '',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    notes: '',
    isSyndication: false,
    secExemption: '',
  });

  // Load parent entities for dropdown
  useEffect(() => {
    const loadParentEntities = async () => {
      try {
        const allEntities = await entityService.getAll();
        if (allEntities && allEntities.length > 0) {
          // Filter out current entity from parent selection
          const available = allEntities
            .filter((e: any) => e.id !== id)
            .map((e: any) => ({ id: e.id, name: e.name }));
          setParentEntities(available);
        }
      } catch (error) {
        console.warn('Using default parent entities:', error);
      }
    };
    loadParentEntities();
  }, [id]);

  // Load entity data when editing
  useEffect(() => {
    if (isEditing && id) {
      const loadEntity = async () => {
        try {
          const data = await entityService.getById(id);
          if (data) {
            setFormData({
              name: data.name || '',
              type: data.type || '', // Legacy
              entityType: data.entity_type || data.legal_structure || '',
              entityPurpose: data.entity_purpose || data.type || '',
              projectType: data.project_type || '',
              parentEntityId: data.parent_entity_id || '',
              legalStructure: data.legal_structure || data.entity_type || '', // Legacy
              taxId: data.tax_id || '',
              stateOfFormation: data.state_of_formation || 'SC',
              formationDate: data.formation_date || '',
              phone: data.phone || '',
              email: data.email || '',
              website: data.website || '',
              addressLine1: data.address_line1 || '',
              addressLine2: data.address_line2 || '',
              city: data.city || '',
              state: data.state || 'SC',
              zipCode: data.zip_code || '',
              bankName: data.bank_name || '',
              accountNumber: '', // Don't load sensitive data
              routingNumber: data.routing_number || '',
              notes: data.notes || '',
              isSyndication: data.is_syndication || false,
              secExemption: data.sec_exemption || '',
            });
          }
        } catch (error) {
          console.warn('Error loading entity:', error);
          toast({
            title: 'Error',
            description: 'Failed to load entity data',
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      };
      loadEntity();
    }
  }, [isEditing, id, toast]);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Clear project type if entity purpose is not SPE
    if (field === 'entityPurpose' && value !== 'spe') {
      setFormData(prev => ({ ...prev, [field]: value, projectType: '' }));
    }

    // Clear SEC exemption if not a syndication
    if (field === 'isSyndication' && value === false) {
      setFormData(prev => ({ ...prev, [field]: value, secExemption: '' }));
    }
  };

  const handleTaxIdChange = (value: string) => {
    // Format as XX-XXXXXXX
    const cleaned = value.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = cleaned.slice(0, 2) + '-' + cleaned.slice(2, 9);
    }
    handleInputChange('taxId', formatted);
  };

  const handlePhoneChange = (value: string) => {
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
    handleInputChange('phone', formatted);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Entity name is required (min 2 characters)';
    }
    if (!formData.entityPurpose) {
      newErrors.entityPurpose = 'Entity purpose is required';
    }
    if (!formData.entityType) {
      newErrors.entityType = 'Entity type (legal structure) is required';
    }
    // Require project type for SPE entities
    if (formData.entityPurpose === 'spe' && !formData.projectType) {
      newErrors.projectType = 'Project type is required for SPE entities';
    }
    // Require SEC exemption if syndication
    if (formData.isSyndication && !formData.secExemption) {
      newErrors.secExemption = 'SEC exemption is required for syndications';
    }
    if (formData.taxId && !/^\d{2}-\d{7}$/.test(formData.taxId)) {
      newErrors.taxId = 'Tax ID must be in format XX-XXXXXXX';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (formData.routingNumber && !/^\d{9}$/.test(formData.routingNumber)) {
      newErrors.routingNumber = 'Routing number must be 9 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
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
      // Map entity_purpose to legacy type field for backward compatibility
      const legacyTypeMap: { [key: string]: string } = {
        'holding_company': 'holding',
        'operating_company': 'operating',
        'spe': 'project',
      };

      const entityData = {
        name: formData.name,
        type: legacyTypeMap[formData.entityPurpose] || formData.entityPurpose, // Legacy field
        entity_type: formData.entityType,
        entity_purpose: formData.entityPurpose,
        project_type: formData.entityPurpose === 'spe' ? formData.projectType : null,
        parent_entity_id: formData.parentEntityId || null,
        legal_structure: formData.entityType, // Map entityType to legacy field
        tax_id: formData.taxId,
        state_of_formation: formData.stateOfFormation,
        formation_date: formData.formationDate,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        address_line1: formData.addressLine1,
        address_line2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        bank_name: formData.bankName,
        routing_number: formData.routingNumber,
        notes: formData.notes,
        is_syndication: formData.isSyndication,
        sec_exemption: formData.isSyndication ? formData.secExemption : null,
      };

      if (isEditing && id) {
        await entityService.update(id, entityData);
      } else {
        await entityService.create(entityData);
      }

      toast({
        title: isEditing ? 'Entity updated' : 'Entity created',
        description: `${formData.name} has been saved successfully`,
      });

      navigate('/entities');
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Error',
        description: 'Failed to save entity',
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
                onClick={() => navigate('/entities')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-bold text-gray-900">
                {isEditing ? 'Edit Entity' : 'New Entity'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/entities')}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Entity
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Section 1: Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">
                Entity Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="VanRock Holdings LLC"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="entityPurpose">
                Entity Purpose <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.entityPurpose} onValueChange={(v) => handleInputChange('entityPurpose', v)}>
                <SelectTrigger className={errors.entityPurpose ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  {ENTITY_PURPOSES.map(purpose => (
                    <SelectItem key={purpose.value} value={purpose.value}>
                      <div>
                        <div className="font-medium">{purpose.label}</div>
                        <div className="text-xs text-gray-500">{purpose.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.entityPurpose && <p className="text-sm text-red-500 mt-1">{errors.entityPurpose}</p>}
            </div>
            <div>
              <Label htmlFor="entityType">
                Legal Structure <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.entityType} onValueChange={(v) => handleInputChange('entityType', v)}>
                <SelectTrigger className={errors.entityType ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select legal structure" />
                </SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.entityType && <p className="text-sm text-red-500 mt-1">{errors.entityType}</p>}
            </div>
            {formData.entityPurpose === 'spe' && (
              <div>
                <Label htmlFor="projectType">
                  Project Type <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.projectType} onValueChange={(v) => handleInputChange('projectType', v)}>
                  <SelectTrigger className={errors.projectType ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.projectType && <p className="text-sm text-red-500 mt-1">{errors.projectType}</p>}
              </div>
            )}
            <div>
              <Label htmlFor="parentEntityId">Parent Entity</Label>
              <Select value={formData.parentEntityId} onValueChange={(v) => handleInputChange('parentEntityId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="None (top-level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (top-level)</SelectItem>
                  {parentEntities.map(entity => (
                    <SelectItem key={entity.id} value={entity.id}>{entity.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">Leave blank if this is a top-level entity</p>
            </div>
          </CardContent>
        </Card>

        {/* Section 1b: Syndication Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Syndication Settings
            </CardTitle>
            <CardDescription>Configure if this entity involves outside investors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isSyndication" className="text-base">Syndication / Capital Raise</Label>
                <p className="text-sm text-gray-500">This entity includes outside investors or a capital raise</p>
              </div>
              <Switch
                id="isSyndication"
                checked={formData.isSyndication}
                onCheckedChange={(checked) => handleInputChange('isSyndication', checked)}
              />
            </div>
            {formData.isSyndication && (
              <div>
                <Label htmlFor="secExemption">
                  SEC Exemption <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.secExemption} onValueChange={(v) => handleInputChange('secExemption', v)}>
                  <SelectTrigger className={errors.secExemption ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select SEC exemption" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEC_EXEMPTIONS.map(exemption => (
                      <SelectItem key={exemption.value} value={exemption.value}>
                        <div>
                          <div className="font-medium">{exemption.label}</div>
                          <div className="text-xs text-gray-500">{exemption.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.secExemption && <p className="text-sm text-red-500 mt-1">{errors.secExemption}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 2: Legal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Legal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="taxId">Tax ID / EIN</Label>
              <Input
                id="taxId"
                value={formData.taxId}
                onChange={(e) => handleTaxIdChange(e.target.value)}
                placeholder="XX-XXXXXXX"
                maxLength={10}
                className={errors.taxId ? 'border-red-500' : ''}
              />
              {errors.taxId && <p className="text-sm text-red-500 mt-1">{errors.taxId}</p>}
            </div>
            <div>
              <Label htmlFor="stateOfFormation">State of Formation</Label>
              <Select value={formData.stateOfFormation} onValueChange={(v) => handleInputChange('stateOfFormation', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map(state => (
                    <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="formationDate">Formation Date</Label>
              <Input
                id="formationDate"
                type="date"
                value={formData.formationDate}
                onChange={(e) => handleInputChange('formationDate', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="(864) 555-0101"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contact@entity.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="addressLine1">Street Address</Label>
              <Input
                id="addressLine1"
                value={formData.addressLine1}
                onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                placeholder="123 Main Street"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="addressLine2">Suite/Unit</Label>
              <Input
                id="addressLine2"
                value={formData.addressLine2}
                onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                placeholder="Suite 200"
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Greenville"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state">State</Label>
                <Select value={formData.state} onValueChange={(v) => handleInputChange('state', v)}>
                  <SelectTrigger>
                    <SelectValue />
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
          </CardContent>
        </Card>

        {/* Section 5: Banking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              Banking (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={formData.bankName}
                onChange={(e) => handleInputChange('bankName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                type="password"
                value={formData.accountNumber}
                onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                placeholder="••••••••••"
              />
              <p className="text-xs text-gray-500 mt-1">Stored encrypted</p>
            </div>
            <div>
              <Label htmlFor="routingNumber">Routing Number</Label>
              <Input
                id="routingNumber"
                value={formData.routingNumber}
                onChange={(e) => handleInputChange('routingNumber', e.target.value.replace(/\D/g, '').slice(0, 9))}
                maxLength={9}
                className={errors.routingNumber ? 'border-red-500' : ''}
              />
              {errors.routingNumber && <p className="text-sm text-red-500 mt-1">{errors.routingNumber}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Section 6: Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Internal notes about this entity..."
              rows={4}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EntityForm;
