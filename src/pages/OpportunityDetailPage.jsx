import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ChevronDown, FileText, Building2, Users, DollarSign, FolderOpen,
  ClipboardList, MapPin, Calculator, TrendingUp, Target, ArrowRight, Mail, MessageSquare,
  FileSignature, CheckCircle, FileCheck, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useOpportunity, useOpportunityActions, OPPORTUNITY_STAGES } from '@/hooks/useOpportunities';
import { useAutoSave, SaveStatusIndicator } from '@/hooks/useAutoSave';

// Import Deal Analyzer
import PipelineDealAnalyzer from '@/features/budgets/components/PipelineDealAnalyzer';

// E-Sign and Document Components
import ESignButton from '@/components/esign/ESignButton';
import DocumentLibrary from '@/components/documents/DocumentLibrary';
import ContractGenerationModal from '@/components/contracts/ContractGenerationModal';

const OPPORTUNITY_TYPES = [
  { value: 'vacant-lot', label: 'Vacant Lot' },
  { value: 'flip-property', label: 'Flip Property' },
  { value: 'development-lot-sale', label: 'Development Lot Sale' },
  { value: 'development-for-sale', label: 'Development For Sale' },
  { value: 'development-btr', label: 'Development BTR' },
  { value: 'scattered-lot', label: 'Scattered Lot' },
];

const OpportunityDetailPage = () => {
  const { opportunityId } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedGroups, setExpandedGroups] = useState(['overview', 'stage-tracker', 'documents']);
  const [showContractModal, setShowContractModal] = useState(false);

  // Fetch opportunity from database
  const { opportunity: rawOpportunity, isLoading, error } = useOpportunity(opportunityId);
  const { updateOpportunity } = useOpportunityActions();

  // Auto-save hook
  const {
    formData,
    setField,
    saveStatus,
    lastSaved,
    error: saveError
  } = useAutoSave(
    rawOpportunity,
    async (data) => {
      if (opportunityId && data) {
        await updateOpportunity(opportunityId, data);
      }
    },
    1500
  );

  // Stages config
  const stages = [
    { id: 'Prospecting', label: 'Prospecting', color: '#6B7280' },
    { id: 'Contacted', label: 'Contacted', color: '#3B82F6' },
    { id: 'Qualified', label: 'Qualified', color: '#F59E0B' },
    { id: 'Negotiating', label: 'Negotiating', color: '#8B5CF6' },
    { id: 'Under Contract', label: 'Under Contract', color: '#10B981' },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#047857]" />
        <span className="ml-2">Loading opportunity...</span>
      </div>
    );
  }

  // Error state
  if (error || !rawOpportunity) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Building2 className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-lg font-medium text-gray-900 mb-2">Opportunity Not Found</h2>
        <p className="text-gray-500 mb-4">{error || 'The requested opportunity could not be found.'}</p>
        <Button onClick={() => navigate('/opportunities')}>Back to Opportunities</Button>
      </div>
    );
  }

  const sidebarGroups = [
    {
      id: 'overview',
      label: 'Overview',
      items: [
        { id: 'overview', label: 'Overview', icon: FileText },
        { id: 'property-details', label: 'Property Details', icon: MapPin },
        { id: 'seller-info', label: 'Seller Info', icon: Users },
        { id: 'deal-terms', label: 'Deal Terms', icon: DollarSign },
        { id: 'deal-analyzer', label: 'Deal Analyzer', icon: Calculator },
      ]
    },
    {
      id: 'stage-tracker',
      label: 'Stage Tracker',
      items: [
        { id: 'stage-prospecting', label: 'Prospecting', icon: Target },
        { id: 'stage-contacted', label: 'Contacted', icon: MessageSquare },
        { id: 'stage-qualified', label: 'Qualified', icon: CheckCircle },
        { id: 'stage-negotiating', label: 'Negotiating', icon: FileSignature },
        { id: 'stage-under-contract', label: 'Under Contract', icon: FileCheck },
      ]
    },
    {
      id: 'documents',
      label: 'Documents',
      items: [
        { id: 'files', label: 'Files', icon: FolderOpen },
        { id: 'notes', label: 'Notes & Activity', icon: MessageSquare },
      ]
    },
  ];

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev =>
      prev.includes(groupId) ? prev.filter(g => g !== groupId) : [...prev, groupId]
    );
  };

  const handleConvertToProject = () => {
    alert('Converting opportunity to project...');
    navigate('/projects');
  };

  const handleAdvanceStage = () => {
    const currentIndex = stages.findIndex(s => s.id === formData?.stage);
    if (currentIndex < stages.length - 1) {
      setField('stage', stages[currentIndex + 1].id);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '$0';
    return `$${parseFloat(price).toLocaleString()}`;
  };

  const renderContent = () => {
    // Handle stage tracker pages
    if (activeSection.startsWith('stage-')) {
      const stageId = activeSection.replace('stage-', '');
      const stageMap = {
        'prospecting': 'Prospecting',
        'contacted': 'Contacted',
        'qualified': 'Qualified',
        'negotiating': 'Negotiating',
        'under-contract': 'Under Contract'
      };
      const stageName = stageMap[stageId] || stageId;

      // Special handling for Negotiating stage with e-sign
      if (stageId === 'negotiating') {
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Negotiating Stage</h2>
              <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} error={saveError} />
            </div>

            {/* Key Actions Card */}
            <div className="bg-white border rounded-lg p-6 mb-6">
              <h3 className="font-medium text-gray-900 mb-4">Contract & E-Sign Actions</h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowContractModal(true)}
                  className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Contract
                </Button>
                <ESignButton
                  entityType="opportunity"
                  entityId={opportunityId}
                  entityName={formData?.deal_number || formData?.address}
                  prefillData={{
                    property_address: formData?.address,
                    property_city: formData?.city,
                    property_state: formData?.state,
                    property_zip: formData?.zip_code,
                    asking_price: formData?.asking_price,
                    earnest_money: formData?.earnest_money,
                    seller_name: formData?.seller_name,
                    seller_email: formData?.seller_email,
                    seller_phone: formData?.seller_phone,
                    assignment_fee: formData?.assignment_fee,
                    dd_deadline: formData?.dd_deadline,
                    close_date: formData?.close_date,
                  }}
                  defaultSigners={formData?.seller_name && formData?.seller_email ? [{
                    role: 'Seller',
                    name: formData.seller_name,
                    email: formData.seller_email,
                    phone: formData.seller_phone || ''
                  }] : []}
                  buttonText="Send for E-Sign"
                  buttonVariant="default"
                  className="bg-[#047857] hover:bg-[#065f46]"
                />
                <Button onClick={() => setField('stage', 'Negotiating')} variant="outline">
                  Set as Current Stage
                </Button>
              </div>
            </div>

            {/* Negotiation Details */}
            <div className="bg-white border rounded-lg p-6 mb-6">
              <h3 className="font-medium text-gray-900 mb-4">Negotiation Details</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500">Initial Offer ($)</Label>
                    <Input
                      type="number"
                      value={formData?.initial_offer || ''}
                      onChange={(e) => setField('initial_offer', e.target.value)}
                      className="mt-1"
                      placeholder="175000"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Counter Offer ($)</Label>
                    <Input
                      type="number"
                      value={formData?.counter_offer || ''}
                      onChange={(e) => setField('counter_offer', e.target.value)}
                      className="mt-1"
                      placeholder="185000"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Final Agreed Price ($)</Label>
                    <Input
                      type="number"
                      value={formData?.asking_price || ''}
                      onChange={(e) => setField('asking_price', e.target.value)}
                      className="mt-1"
                      placeholder="180000"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500">Negotiation Notes</Label>
                    <Textarea
                      value={formData?.negotiation_notes || ''}
                      onChange={(e) => setField('negotiation_notes', e.target.value)}
                      className="mt-1"
                      rows={6}
                      placeholder="Notes from negotiations, seller concerns, terms discussed..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contract Generation Modal */}
            <ContractGenerationModal
              isOpen={showContractModal}
              onClose={() => setShowContractModal(false)}
              entityType="opportunity"
              entityId={opportunityId}
              entityName={formData?.deal_number || formData?.address}
              entityData={formData}
              onSuccess={() => {
                setShowContractModal(false);
              }}
            />
          </div>
        );
      }

      return (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{stageName} Stage</h2>
            <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} error={saveError} />
          </div>
          <div className="bg-white border rounded-lg p-6">
            <div className="space-y-4">
              <p className="text-gray-600">Manage your {stageName.toLowerCase()} stage activities and requirements here.</p>
              <div className="flex gap-3">
                <Button onClick={() => setField('stage', stageName)} className="bg-[#047857] hover:bg-[#065f46]">
                  Set as Current Stage
                </Button>
                {stageName === 'Under Contract' && (
                  <Button onClick={handleConvertToProject} variant="outline">
                    <ArrowRight className="w-4 h-4 mr-2" />Convert to Project
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case 'overview':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Opportunity Overview</h2>
              <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} error={saveError} />
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Estimated Value</p>
                <p className="text-2xl font-semibold">{formatPrice(formData?.estimated_value)}</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Asking Price</p>
                <p className="text-2xl font-semibold">{formatPrice(formData?.asking_price)}</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Assignment Fee</p>
                <p className="text-2xl font-semibold text-[#047857]">{formatPrice(formData?.assignment_fee)}</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Current Stage</p>
                <p className="text-2xl font-semibold">{formData?.stage || 'Prospecting'}</p>
              </div>
            </div>

            {/* Basic Info Form */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Deal Number *</Label>
                  <Input
                    value={formData?.deal_number || ''}
                    onChange={(e) => setField('deal_number', e.target.value)}
                    className="mt-1"
                    placeholder="25-001"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Stage</Label>
                  <Select value={formData?.stage || 'Prospecting'} onValueChange={(v) => setField('stage', v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {OPPORTUNITY_STAGES.map(s => (
                        <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Property Type</Label>
                  <Select value={formData?.property_type || 'vacant-lot'} onValueChange={(v) => setField('property_type', v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {OPPORTUNITY_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Assigned To</Label>
                  <Input
                    value={formData?.assigned_to || ''}
                    onChange={(e) => setField('assigned_to', e.target.value)}
                    className="mt-1"
                    placeholder="Team member name"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'property-details':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Property Details</h2>
              <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} error={saveError} />
            </div>
            <div className="bg-white border rounded-lg p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Location</h3>
                  <div>
                    <Label className="text-xs text-gray-500">Address *</Label>
                    <Input
                      value={formData?.address || ''}
                      onChange={(e) => setField('address', e.target.value)}
                      className="mt-1"
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">City</Label>
                      <Input
                        value={formData?.city || ''}
                        onChange={(e) => setField('city', e.target.value)}
                        className="mt-1"
                        placeholder="Greenville"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">State</Label>
                      <Input
                        value={formData?.state || ''}
                        onChange={(e) => setField('state', e.target.value)}
                        className="mt-1"
                        placeholder="SC"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">ZIP</Label>
                      <Input
                        value={formData?.zip_code || ''}
                        onChange={(e) => setField('zip_code', e.target.value)}
                        className="mt-1"
                        placeholder="29601"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">County</Label>
                    <Input
                      value={formData?.county || ''}
                      onChange={(e) => setField('county', e.target.value)}
                      className="mt-1"
                      placeholder="Greenville"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Parcel ID</Label>
                    <Input
                      value={formData?.parcel_id || ''}
                      onChange={(e) => setField('parcel_id', e.target.value)}
                      className="mt-1"
                      placeholder="0234-56-78-9012"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Property Info</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">Acres</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData?.acres || ''}
                        onChange={(e) => setField('acres', e.target.value)}
                        className="mt-1"
                        placeholder="0.25"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Potential Lots/Units</Label>
                      <Input
                        type="number"
                        value={formData?.potential_lots || ''}
                        onChange={(e) => setField('potential_lots', e.target.value)}
                        className="mt-1"
                        placeholder="1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Zoning</Label>
                    <Input
                      value={formData?.zoning || ''}
                      onChange={(e) => setField('zoning', e.target.value)}
                      className="mt-1"
                      placeholder="R-1 Residential"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Source</Label>
                    <Input
                      value={formData?.source || ''}
                      onChange={(e) => setField('source', e.target.value)}
                      className="mt-1"
                      placeholder="Direct Mail, Referral, etc."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'seller-info':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Seller Information</h2>
              <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} error={saveError} />
            </div>
            <div className="bg-white border rounded-lg p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Contact Details</h3>
                  <div>
                    <Label className="text-xs text-gray-500">Seller Name</Label>
                    <Input
                      value={formData?.seller_name || ''}
                      onChange={(e) => setField('seller_name', e.target.value)}
                      className="mt-1"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Phone</Label>
                    <Input
                      type="tel"
                      value={formData?.seller_phone || ''}
                      onChange={(e) => setField('seller_phone', e.target.value)}
                      className="mt-1"
                      placeholder="(864) 555-0123"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Email</Label>
                    <Input
                      type="email"
                      value={formData?.seller_email || ''}
                      onChange={(e) => setField('seller_email', e.target.value)}
                      className="mt-1"
                      placeholder="seller@email.com"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Additional Info</h3>
                  <div>
                    <Label className="text-xs text-gray-500">Motivation</Label>
                    <Textarea
                      value={formData?.seller_motivation || ''}
                      onChange={(e) => setField('seller_motivation', e.target.value)}
                      className="mt-1"
                      rows={3}
                      placeholder="Why is the seller selling? Timeline, situation, etc."
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Contact Notes</Label>
                    <Textarea
                      value={formData?.contact_notes || ''}
                      onChange={(e) => setField('contact_notes', e.target.value)}
                      className="mt-1"
                      rows={3}
                      placeholder="Best time to call, preferred contact method, etc."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'deal-terms':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Deal Terms</h2>
              <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} error={saveError} />
            </div>
            <div className="bg-white border rounded-lg p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Pricing</h3>
                  <div>
                    <Label className="text-xs text-gray-500">Asking Price ($)</Label>
                    <Input
                      type="number"
                      value={formData?.asking_price || ''}
                      onChange={(e) => setField('asking_price', e.target.value)}
                      className="mt-1"
                      placeholder="200000"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Estimated Value ($)</Label>
                    <Input
                      type="number"
                      value={formData?.estimated_value || ''}
                      onChange={(e) => setField('estimated_value', e.target.value)}
                      className="mt-1"
                      placeholder="250000"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Assignment Fee ($)</Label>
                    <Input
                      type="number"
                      value={formData?.assignment_fee || ''}
                      onChange={(e) => setField('assignment_fee', e.target.value)}
                      className="mt-1"
                      placeholder="10000"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Contract Terms</h3>
                  <div>
                    <Label className="text-xs text-gray-500">Earnest Money ($)</Label>
                    <Input
                      type="number"
                      value={formData?.earnest_money || ''}
                      onChange={(e) => setField('earnest_money', e.target.value)}
                      className="mt-1"
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">DD Deadline</Label>
                    <Input
                      type="date"
                      value={formData?.dd_deadline ? formData.dd_deadline.split('T')[0] : ''}
                      onChange={(e) => setField('dd_deadline', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Target Close Date</Label>
                    <Input
                      type="date"
                      value={formData?.close_date ? formData.close_date.split('T')[0] : ''}
                      onChange={(e) => setField('close_date', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'deal-analyzer':
        return (
          <div className="h-full">
            <PipelineDealAnalyzer />
          </div>
        );

      case 'notes':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Notes & Activity</h2>
              <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} error={saveError} />
            </div>
            <div className="bg-white border rounded-lg p-6">
              <div>
                <Label className="text-xs text-gray-500">Notes</Label>
                <Textarea
                  value={formData?.notes || ''}
                  onChange={(e) => setField('notes', e.target.value)}
                  className="mt-1"
                  rows={10}
                  placeholder="Add notes about this opportunity..."
                />
              </div>
            </div>
          </div>
        );

      case 'files':
        return (
          <div className="p-6">
            <DocumentLibrary
              entityType="opportunity"
              entityId={opportunityId}
              entityName={formData?.deal_number || formData?.address}
              showHeader={true}
              showCategories={true}
              showUpload={true}
            />
          </div>
        );

      default:
        return (
          <div className="p-6">
            <div className="bg-white border rounded-lg p-12 text-center">
              <p className="text-gray-600 capitalize font-medium">{activeSection.replace(/-/g, ' ')}</p>
              <p className="text-gray-400 text-sm mt-2">Content coming soon</p>
            </div>
          </div>
        );
    }
  };

  const currentStage = stages.find(s => s.id === formData?.stage) || stages[0];

  return (
    <div className="flex h-[calc(100vh-40px)] bg-gray-50">
      {/* Dark Sidebar */}
      <div className="w-52 bg-[#1e2a3a] flex-shrink-0 flex flex-col">
        <div className="p-3 border-b border-gray-700">
          <button onClick={() => navigate('/opportunities')} className="flex items-center gap-2 text-gray-400 hover:text-white text-xs mb-2">
            <ArrowLeft className="w-3 h-3" /> Back to Pipeline
          </button>
          <h2 className="text-white font-semibold truncate text-sm">{formData?.deal_number || 'New Deal'}</h2>
          <p className="text-gray-500 text-xs mt-1">{formData?.address || 'No address'}</p>
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
          {sidebarGroups.map((group) => (
            <div key={group.id} className="mb-2">
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-400 hover:text-white"
              >
                {group.label}
                <ChevronDown className={cn("w-4 h-4 transition-transform", expandedGroups.includes(group.id) ? "" : "-rotate-90")} />
              </button>
              {expandedGroups.includes(group.id) && (
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 text-xs rounded transition-colors",
                          activeSection === item.id
                            ? "bg-[#047857] text-white"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <IconComponent className="w-4 h-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Stage Progress */}
        <div className="p-3 border-t border-gray-700">
          <p className="text-xs text-gray-500 mb-2">Current Stage</p>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentStage?.color }} />
            <span className="text-white text-sm font-medium">{currentStage?.label}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[#047857]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{formData?.deal_number || 'New Deal'}</h1>
                <span className="text-xs px-2 py-1 rounded font-medium" style={{ backgroundColor: currentStage?.color + '20', color: currentStage?.color }}>
                  {currentStage?.label}
                </span>
              </div>
              <p className="text-sm text-gray-500">{formData?.address || 'No address'}, {formData?.city || ''} {formData?.state || ''} {formData?.zip_code || ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {formData?.stage === 'Under Contract' ? (
              <Button onClick={handleConvertToProject} className="bg-[#047857] hover:bg-[#065f46]">
                <ArrowRight className="w-4 h-4 mr-1" />Convert to Project
              </Button>
            ) : (
              <Button onClick={handleAdvanceStage} className="bg-[#047857] hover:bg-[#065f46]">Advance Stage</Button>
            )}
          </div>
        </div>

        {/* Stage Progress Bar */}
        <div className="bg-white border-b px-6 py-3">
          <div className="flex items-center gap-2">
            {stages.map((stage, idx) => {
              const isCurrent = stage.id === formData?.stage;
              const isPast = stages.findIndex(s => s.id === formData?.stage) > idx;
              return (
                <React.Fragment key={stage.id}>
                  <button
                    onClick={() => setField('stage', stage.id)}
                    className="flex items-center gap-2 hover:opacity-80"
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                        isCurrent ? "ring-2 ring-offset-2" : "",
                        isPast || isCurrent ? "text-white" : "bg-gray-200 text-gray-500"
                      )}
                      style={{
                        backgroundColor: isPast || isCurrent ? stage.color : undefined,
                        ringColor: isCurrent ? stage.color : undefined
                      }}
                    >
                      {isPast ? '✓' : idx + 1}
                    </div>
                    <span className={cn("text-xs font-medium", isCurrent ? "text-gray-900" : "text-gray-500")}>
                      {stage.label}
                    </span>
                  </button>
                  {idx < stages.length - 1 && (
                    <div className={cn("flex-1 h-1 rounded", isPast ? "bg-[#047857]" : "bg-gray-200")} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default OpportunityDetailPage;
