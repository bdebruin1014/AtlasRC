import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit2, ChevronDown, FileText, Building2, Users, DollarSign, FolderOpen,
  ClipboardList, MapPin, Calculator, TrendingUp, Target, ArrowRight, Mail, MessageSquare,
  FileSignature, CheckCircle, Send, FileCheck, Plus, Calendar, Clock, Eye, Download,
  Phone, ExternalLink, Loader2, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useOpportunity, useOpportunityActions, OPPORTUNITY_STAGES } from '@/hooks/useOpportunities';
import { useAutoSave, SaveStatusIndicator } from '@/hooks/useAutoSave';

// Import Deal Analyzer
import PipelineDealAnalyzer from '@/features/budgets/components/PipelineDealAnalyzer';

// E-Sign and Document Components
import ESignButton from '@/components/esign/ESignButton';
import DocumentLibrary from '@/components/documents/DocumentLibrary';
import ContractGenerationModal from '@/components/contracts/ContractGenerationModal';
import ConvertToProjectModal from '@/components/ConvertToProjectModal';

const OPPORTUNITY_TYPES = [
  { value: 'vacant-lot', label: 'Vacant Lot' },
  { value: 'flip-property', label: 'Flip Property' },
  { value: 'development-lot-sale', label: 'Development Lot Sale' },
  { value: 'development-for-sale', label: 'Development For Sale' },
  { value: 'development-btr', label: 'Development BTR' },
  { value: 'scattered-lot', label: 'Scattered Lot' },
];

const OpportunityDetailPage = () => {
  const { toast } = useToast();
  const { opportunityId } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedGroups, setExpandedGroups] = useState(['overview', 'stage-tracker', 'documents']);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);

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

  // Document management state
  const [mailingRecords, setMailingRecords] = useState([
    { id: '1', type: 'Letter', template: 'Initial Contact Letter', sentDate: '2024-12-15', status: 'delivered', trackingId: 'USPS-123456789' },
    { id: '2', type: 'Postcard', template: 'Follow-up Postcard', sentDate: '2024-12-28', status: 'in-transit', trackingId: 'USPS-987654321' },
    { id: '3', type: 'Letter', template: 'Offer Letter', sentDate: '2025-01-05', status: 'pending', trackingId: null },
  ]);

  const [communications, setCommunications] = useState([
    { id: '1', type: 'phone', direction: 'outbound', date: '2025-01-08 10:30 AM', contact: 'James Wilson', summary: 'Initial call to discuss property. Seller interested in offer.', duration: '12 min' },
    { id: '2', type: 'email', direction: 'inbound', date: '2025-01-09 2:15 PM', contact: 'James Wilson', summary: 'Seller sent property documents including survey and deed.', attachments: 2 },
    { id: '3', type: 'phone', direction: 'outbound', date: '2025-01-10 9:00 AM', contact: 'James Wilson', summary: 'Discussed offer terms. Seller agreed to $2M purchase price.', duration: '18 min' },
  ]);

  const [esignedDocs, setEsignedDocs] = useState([
    { id: '1', name: 'Purchase Agreement - 600 Heritage Way', status: 'completed', sentDate: '2025-01-10', completedDate: '2025-01-11', signers: [{ name: 'James Wilson', status: 'signed' }, { name: 'VanRock Holdings', status: 'signed' }] },
    { id: '2', name: 'Due Diligence Extension', status: 'pending', sentDate: '2025-01-12', completedDate: null, signers: [{ name: 'James Wilson', status: 'pending' }, { name: 'VanRock Holdings', status: 'signed' }] },
  ]);

  const [showMailingDialog, setShowMailingDialog] = useState(false);
  const [showCommDialog, setShowCommDialog] = useState(false);
  const [mailingSaving, setMailingSaving] = useState(false);
  const [commSaving, setCommSaving] = useState(false);

  const [newMailing, setNewMailing] = useState({ type: 'Letter', template: '', notes: '' });
  const [newComm, setNewComm] = useState({ type: 'phone', direction: 'outbound', contact: '', summary: '', duration: '' });

  // Updated stages per requirements
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

  const handleAddMailing = async () => {
    if (!newMailing.template) {
      toast({ title: 'Error', description: 'Please select a template', variant: 'destructive' });
      return;
    }
    setMailingSaving(true);
    await new Promise(r => setTimeout(r, 500));
    const record = {
      id: String(Date.now()),
      type: newMailing.type,
      template: newMailing.template,
      sentDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      trackingId: null,
    };
    setMailingRecords(prev => [record, ...prev]);
    setShowMailingDialog(false);
    setNewMailing({ type: 'Letter', template: '', notes: '' });
    setMailingSaving(false);
    toast({ title: 'Mailing Created', description: 'Mail piece has been queued for sending.' });
  };

  const handleAddCommunication = async () => {
    if (!newComm.summary) {
      toast({ title: 'Error', description: 'Please enter a summary', variant: 'destructive' });
      return;
    }
    setCommSaving(true);
    await new Promise(r => setTimeout(r, 500));
    const record = {
      id: String(Date.now()),
      type: newComm.type,
      direction: newComm.direction,
      date: new Date().toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      contact: newComm.contact || formData?.seller_name || 'Unknown',
      summary: newComm.summary,
      duration: newComm.type === 'phone' ? newComm.duration : undefined,
    };
    setCommunications(prev => [record, ...prev]);
    setShowCommDialog(false);
    setNewComm({ type: 'phone', direction: 'outbound', contact: '', summary: '', duration: '' });
    setCommSaving(false);
    toast({ title: 'Communication Logged', description: 'Communication has been recorded.' });
  };

  const getMailingStatusBadge = (status) => {
    const styles = {
      delivered: 'bg-green-100 text-green-800',
      'in-transit': 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      returned: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getEsignStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800',
      declined: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const handleConvertToProject = () => {
    setShowConvertModal(true);
  };

  const handleConversionSuccess = (newProject) => {
    toast({
      title: 'Success',
      description: 'Opportunity has been converted to a project.',
    });
    navigate(`/project/${newProject.id}`);
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
      
      case 'tasks':
        return <OpportunityTasks opportunity={opportunity} />;
      
      case 'property-details':
        return <OpportunityPropertyDetails opportunity={opportunity} />;
      
      case 'contacts':
        return <OpportunityContacts opportunity={opportunity} />;
      
      case 'comps':
        return <OpportunityComparables opportunity={opportunity} />;
      
      case 'files':
        return <OpportunityFiles />;
      
      case 'mailing':
        return (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Mailing History</h2>
                <p className="text-sm text-gray-500">Track letters, postcards, and other mail sent to this property owner</p>
              </div>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setShowMailingDialog(true)}>
                <Plus className="w-4 h-4 mr-1" /> New Mailing
              </Button>
            </div>

            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Template</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {mailingRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">{record.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{record.template}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{record.sentDate}</td>
                      <td className="px-4 py-3">
                        <Badge className={getMailingStatusBadge(record.status)}>{record.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{record.trackingId || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {mailingRecords.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No mailing records yet</p>
                </div>
              )}
            </div>

            <Dialog open={showMailingDialog} onOpenChange={setShowMailingDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Mailing</DialogTitle>
                  <DialogDescription>Send a letter or postcard to the property owner</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Mail Type</Label>
                    <Select value={newMailing.type} onValueChange={(v) => setNewMailing({ ...newMailing, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Letter">Letter</SelectItem>
                        <SelectItem value="Postcard">Postcard</SelectItem>
                        <SelectItem value="Package">Package</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Template</Label>
                    <Select value={newMailing.template} onValueChange={(v) => setNewMailing({ ...newMailing, template: v })}>
                      <SelectTrigger><SelectValue placeholder="Select a template" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Initial Contact Letter">Initial Contact Letter</SelectItem>
                        <SelectItem value="Follow-up Postcard">Follow-up Postcard</SelectItem>
                        <SelectItem value="Offer Letter">Offer Letter</SelectItem>
                        <SelectItem value="Final Notice">Final Notice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Notes (optional)</Label>
                    <Textarea value={newMailing.notes} onChange={(e) => setNewMailing({ ...newMailing, notes: e.target.value })} placeholder="Any special instructions..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowMailingDialog(false)}>Cancel</Button>
                  <Button onClick={handleAddMailing} disabled={mailingSaving} className="bg-[#047857] hover:bg-[#065f46]">
                    {mailingSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Queue Mailing
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        );

      case 'communications':
        return (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Communications Log</h2>
                <p className="text-sm text-gray-500">Track all calls, emails, and messages with contacts</p>
              </div>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setShowCommDialog(true)}>
                <Plus className="w-4 h-4 mr-1" /> Log Communication
              </Button>
            </div>

            <div className="space-y-3">
              {communications.map((comm) => (
                <div key={comm.id} className="bg-white border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        comm.type === 'phone' ? "bg-blue-100" : "bg-purple-100"
                      )}>
                        {comm.type === 'phone' ? (
                          <Phone className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Mail className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{comm.contact}</span>
                          <Badge variant="outline" className="text-xs">
                            {comm.direction === 'outbound' ? '→ Outbound' : '← Inbound'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{comm.summary}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {comm.date}</span>
                          {comm.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {comm.duration}</span>}
                          {comm.attachments && <span>{comm.attachments} attachments</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {communications.length === 0 && (
                <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No communications logged yet</p>
                </div>
              )}
            </div>

            <Dialog open={showCommDialog} onOpenChange={setShowCommDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Communication</DialogTitle>
                  <DialogDescription>Record a call, email, or message with a contact</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Type</Label>
                      <Select value={newComm.type} onValueChange={(v) => setNewComm({ ...newComm, type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="phone">Phone Call</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="text">Text Message</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Direction</Label>
                      <Select value={newComm.direction} onValueChange={(v) => setNewComm({ ...newComm, direction: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="outbound">Outbound</SelectItem>
                          <SelectItem value="inbound">Inbound</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Contact</Label>
                    <Input value={newComm.contact} onChange={(e) => setNewComm({ ...newComm, contact: e.target.value })} placeholder={formData?.seller_name || 'Contact name'} />
                  </div>
                  {newComm.type === 'phone' && (
                    <div className="grid gap-2">
                      <Label>Duration</Label>
                      <Input value={newComm.duration} onChange={(e) => setNewComm({ ...newComm, duration: e.target.value })} placeholder="e.g., 15 min" />
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label>Summary</Label>
                    <Textarea value={newComm.summary} onChange={(e) => setNewComm({ ...newComm, summary: e.target.value })} placeholder="What was discussed..." rows={3} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCommDialog(false)}>Cancel</Button>
                  <Button onClick={handleAddCommunication} disabled={commSaving} className="bg-[#047857] hover:bg-[#065f46]">
                    {commSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Log Communication
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        );

      case 'esigned':
        return (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">E-Signed Documents</h2>
                <p className="text-sm text-gray-500">Track contract signatures and document status</p>
              </div>
              <Button className="bg-[#047857] hover:bg-[#065f46]">
                <Send className="w-4 h-4 mr-1" /> Send for Signature
              </Button>
            </div>

            <div className="space-y-4">
              {esignedDocs.map((doc) => (
                <div key={doc.id} className="bg-white border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        doc.status === 'completed' ? "bg-green-100" : "bg-yellow-100"
                      )}>
                        <FileSignature className={cn("w-5 h-5", doc.status === 'completed' ? "text-green-600" : "text-yellow-600")} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{doc.name}</span>
                          <Badge className={getEsignStatusBadge(doc.status)}>{doc.status}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>Sent: {doc.sentDate}</span>
                          {doc.completedDate && <span>Completed: {doc.completedDate}</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-3">
                          {doc.signers.map((signer, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                                signer.status === 'signed' ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
                              )}>
                                {signer.status === 'signed' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                              </div>
                              <span className={signer.status === 'signed' ? "text-green-700" : "text-yellow-700"}>
                                {signer.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.status === 'completed' && (
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" /> Download
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {esignedDocs.length === 0 && (
                <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
                  <FileSignature className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No e-signed documents yet</p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">DocuSign Integration</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Documents can be sent for e-signature directly from the Negotiating stage.
                    Connected signers will receive email notifications to complete signing.
                  </p>
                </div>
              </div>
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

      case 'stage-prospecting':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Prospecting Stage</h2>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setField('stage', 'Contacted')}>
                Move to Contacted
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-medium mb-4">Prospecting Checklist</h3>
                <div className="space-y-3">
                  {[
                    'Property details verified',
                    'Ownership confirmed',
                    'Initial property research complete',
                    'Comparable sales reviewed',
                    'Potential value estimated',
                  ].map((item, idx) => (
                    <label key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-medium mb-4">Lead Source Info</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500">Source</p>
                    <p className="font-medium">{formData?.source || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date Added</p>
                    <p className="font-medium">{formData?.created_at ? new Date(formData.created_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Days in Pipeline</p>
                    <p className="font-medium">{formData?.created_at ? Math.floor((Date.now() - new Date(formData.created_at)) / (1000 * 60 * 60 * 24)) : 0} days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'stage-contacted':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Contacted Stage</h2>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setField('stage', 'Qualified')}>
                Move to Qualified
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-medium mb-4">Contact Checklist</h3>
                <div className="space-y-3">
                  {[
                    'Initial contact made',
                    'Seller motivation discussed',
                    'Property condition reviewed',
                    'Timeline established',
                    'Follow-up scheduled',
                  ].map((item, idx) => (
                    <label key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-medium mb-4">Contact History</h3>
                {communications.length > 0 ? (
                  <div className="space-y-2">
                    {communications.slice(0, 5).map((comm, idx) => (
                      <div key={idx} className="p-2 bg-gray-50 rounded text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">{comm.type}</span>
                          <span className="text-gray-500 text-xs">{comm.date}</span>
                        </div>
                        <p className="text-gray-600 text-xs mt-1">{comm.summary}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No contact history yet.</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'stage-qualified':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Qualified Stage</h2>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setField('stage', 'Negotiating')}>
                Move to Negotiating
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-medium mb-4">Qualification Checklist</h3>
                <div className="space-y-3">
                  {[
                    'Seller is motivated',
                    'Price expectations are reasonable',
                    'Property meets investment criteria',
                    'Clear title (preliminary)',
                    'No major property issues',
                    'Financing path identified',
                  ].map((item, idx) => (
                    <label key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-medium mb-4">Deal Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Asking Price</span>
                    <span className="font-medium">${(formData?.asking_price || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Estimated Value</span>
                    <span className="font-medium">${(formData?.estimated_value || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm text-green-700">Potential Profit</span>
                    <span className="font-medium text-green-700">${((formData?.estimated_value || 0) - (formData?.asking_price || 0)).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'stage-negotiating':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Negotiating Stage</h2>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setField('stage', 'Under Contract')}>
                Move to Under Contract
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-medium mb-4">Negotiation Tracker</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500">Initial Offer</Label>
                    <Input
                      type="number"
                      value={formData?.initial_offer || ''}
                      onChange={(e) => setField('initial_offer', e.target.value)}
                      className="mt-1"
                      placeholder="Your initial offer"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Counter Offer</Label>
                    <Input
                      type="number"
                      value={formData?.counter_offer || ''}
                      onChange={(e) => setField('counter_offer', e.target.value)}
                      className="mt-1"
                      placeholder="Seller's counter"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Final Agreed Price</Label>
                    <Input
                      type="number"
                      value={formData?.final_price || ''}
                      onChange={(e) => setField('final_price', e.target.value)}
                      className="mt-1"
                      placeholder="Agreed price"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-medium mb-4">Negotiation Notes</h3>
                <Textarea
                  value={formData?.negotiation_notes || ''}
                  onChange={(e) => setField('negotiation_notes', e.target.value)}
                  rows={8}
                  placeholder="Track negotiation details, seller concerns, terms discussed..."
                />
              </div>
            </div>
          </div>
        );

      case 'stage-under-contract':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Under Contract</h2>
              <Button className="bg-[#047857] hover:bg-[#065f46]">
                Convert to Project
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-medium mb-4">Contract Details</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500">Contract Date</Label>
                    <Input
                      type="date"
                      value={formData?.contract_date || ''}
                      onChange={(e) => setField('contract_date', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Earnest Money ($)</Label>
                    <Input
                      type="number"
                      value={formData?.earnest_money || ''}
                      onChange={(e) => setField('earnest_money', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Due Diligence Deadline</Label>
                    <Input
                      type="date"
                      value={formData?.dd_deadline || ''}
                      onChange={(e) => setField('dd_deadline', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Closing Date</Label>
                    <Input
                      type="date"
                      value={formData?.closing_date || ''}
                      onChange={(e) => setField('closing_date', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-medium mb-4">Closing Checklist</h3>
                <div className="space-y-3">
                  {[
                    'Title search ordered',
                    'Survey completed',
                    'Inspections done',
                    'Financing approved',
                    'Insurance obtained',
                    'Closing scheduled',
                    'Funds wired',
                  ].map((item, idx) => (
                    <label key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'notes':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Notes & Activity</h2>
              <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} error={saveError} />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-medium mb-4">Notes</h3>
                <Textarea
                  value={formData?.notes || ''}
                  onChange={(e) => setField('notes', e.target.value)}
                  rows={12}
                  placeholder="Add notes about this opportunity..."
                />
              </div>
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-medium mb-4">Activity Timeline</h3>
                <div className="space-y-3">
                  {[
                    ...communications.map(c => ({ type: 'comm', ...c })),
                    ...mailings.map(m => ({ type: 'mail', ...m })),
                  ].sort((a, b) => new Date(b.date || b.sentDate) - new Date(a.date || a.sentDate)).slice(0, 10).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-2 bg-gray-50 rounded">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${item.type === 'comm' ? 'bg-blue-500' : 'bg-purple-500'}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.type === 'comm' ? item.type : item.template}</p>
                        <p className="text-xs text-gray-500">{item.date || item.sentDate}</p>
                        {item.summary && <p className="text-xs text-gray-600 mt-1">{item.summary}</p>}
                      </div>
                    </div>
                  ))}
                  {communications.length === 0 && mailings.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">No activity recorded yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-6">
            <div className="bg-white border rounded-lg p-12 text-center">
              <p className="text-gray-600 capitalize font-medium">{activeSection.replace(/-/g, ' ')}</p>
              <p className="text-gray-400 text-sm mt-2">Section loading...</p>
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

      {/* Convert to Project Modal */}
      <ConvertToProjectModal
        isOpen={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        opportunity={formData}
        dealSheet={null}
        onSuccess={handleConversionSuccess}
      />
    </div>
  );
};

export default OpportunityDetailPage;
