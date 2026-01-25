import React, { useState, useMemo, useEffect } from 'react';
import ProjectContactsSection from '@/pages/projects/ContactsPage';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, ChevronDown, FileText, Building2, Users, DollarSign, FolderOpen, ClipboardList, MapPin, Calendar, Landmark, HardHat, Truck, FileCheck, AlertTriangle, Receipt, Shield, Mail, MessageSquare, Video, Settings, TrendingUp, Package, PlusCircle, CreditCard, PieChart, ArrowUpRight, Calculator, Loader2, Save, Check, FileSignature } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useProject, useProjectActions, PROJECT_TYPES, PROJECT_STATUSES } from '@/hooks/useProjects';
import { useAutoSave, SaveStatusIndicator } from '@/hooks/useAutoSave';

// E-Sign and Document Components
import ESignButton from '@/components/esign/ESignButton';
import DocumentLibrary from '@/components/documents/DocumentLibrary';
import ContractGenerationModal from '@/components/contracts/ContractGenerationModal';

// Import ALL Budget Components
import IndividualSpecHomeBudget from '@/features/budgets/components/IndividualSpecHomeBudget';
import HorizontalLotDevelopmentBudget from '@/features/budgets/components/HorizontalLotDevelopmentBudget';
import BuildToRentBudget from '@/features/budgets/components/BuildToRentBudget';
import BuildToSellBudget from '@/features/budgets/components/BuildToSellBudget';
import { budgetTypes } from '@/features/budgets/components/BudgetModuleRouter';

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('basic-info');
  const [expandedGroups, setExpandedGroups] = useState(['overview', 'acquisition', 'construction', 'finance', 'documents']);
  const [showContractModal, setShowContractModal] = useState(false);

  // Fetch project data from database
  const { project: rawProject, isLoading, error, refetch } = useProject(projectId);
  const { updateProject } = useProjectActions();

  // Auto-save hook for project data
  const {
    formData,
    setField,
    saveStatus,
    lastSaved,
    error: saveError
  } = useAutoSave(
    rawProject,
    async (data) => {
      if (projectId && data) {
        await updateProject(projectId, data);
      }
    },
    1500 // 1.5 second debounce
  );

  // Get budget type info for display
  const budgetTypeMap = {
    'spec-build': 'spec-home',
    'lot-development': 'horizontal-lot',
    'build-to-rent': 'btr',
    'fix-flip': 'spec-home',
  };

  const budgetType = budgetTypeMap[formData?.project_type] || 'spec-home';
  const budgetTypeInfo = budgetTypes?.find(bt => bt.id === budgetType);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#047857]" />
        <span className="ml-2">Loading project...</span>
      </div>
    );
  }

  // Error state
  if (error || !rawProject) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Building2 className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-lg font-medium text-gray-900 mb-2">Project Not Found</h2>
        <p className="text-gray-500 mb-4">{error || 'The requested project could not be found.'}</p>
        <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
      </div>
    );
  }

  // Get budget component based on project type
  const getBudgetComponent = () => {
    switch (budgetType) {
      case 'spec-home':
        return <IndividualSpecHomeBudget />;
      case 'horizontal-lot':
        return <HorizontalLotDevelopmentBudget />;
      case 'btr':
        return <BuildToRentBudget />;
      case 'bts':
        return <BuildToSellBudget />;
      default:
        return <IndividualSpecHomeBudget />;
    }
  };

  const sidebarGroups = [
    {
      id: 'overview',
      label: 'Overview',
      items: [
        { id: 'basic-info', label: 'Basic Info', icon: FileText },
        { id: 'property', label: 'Property Details', icon: MapPin },
        { id: 'contacts', label: 'Contacts', icon: Users },
        { id: 'project-settings', label: 'Project Settings', icon: Settings },
      ]
    },
    {
      id: 'acquisition',
      label: 'Acquisition',
      items: [
        { id: 'purchase-contract', label: 'Purchase Contract', icon: FileCheck },
        { id: 'due-diligence', label: 'Due Diligence', icon: ClipboardList },
        { id: 'closing', label: 'Closing', icon: Landmark },
      ]
    },
    {
      id: 'construction',
      label: 'Construction',
      items: [
        { id: 'budget', label: 'Budget', icon: Calculator },
        { id: 'schedule', label: 'Schedule', icon: Calendar },
        { id: 'draws', label: 'Draw Requests', icon: Receipt },
        { id: 'change-orders', label: 'Change Orders', icon: FileCheck },
        { id: 'permits', label: 'Permits', icon: Shield },
        { id: 'bids', label: 'Bids', icon: Truck },
      ]
    },
    {
      id: 'finance',
      label: 'Finance',
      items: [
        { id: 'finance-summary', label: 'Summary', icon: PieChart },
        { id: 'pro-forma', label: 'Pro Forma', icon: FileText },
        { id: 'budget-vs-actual', label: 'Budget vs Actual', icon: TrendingUp },
        { id: 'expenses', label: 'Expenses', icon: CreditCard },
        { id: 'revenue', label: 'Revenue & Sales', icon: DollarSign },
        { id: 'loans', label: 'Loans', icon: Landmark },
        { id: 'draws-finance', label: 'Draw Schedule', icon: Receipt },
        { id: 'cash-flow', label: 'Cash Flow', icon: TrendingUp },
      ]
    },
    {
      id: 'documents',
      label: 'Documents',
      items: [
        { id: 'files', label: 'Files', icon: FolderOpen },
        { id: 'mailing', label: 'Mailing', icon: Mail },
        { id: 'communications', label: 'Communications', icon: MessageSquare },
      ]
    },
  ];

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev =>
      prev.includes(groupId) ? prev.filter(g => g !== groupId) : [...prev, groupId]
    );
  };

  const budget = parseFloat(formData?.budget) || 0;
  const spent = 0; // TODO: Calculate from transactions
  const projectedSalePrice = budget * 1.5;
  const projectedProfit = budget * 0.25;

  const renderContent = () => {
    switch (activeSection) {
      case 'basic-info':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} error={saveError} />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-4">Project Details</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500">Project Name *</Label>
                    <Input
                      value={formData?.name || ''}
                      onChange={(e) => setField('name', e.target.value)}
                      className="mt-1"
                      placeholder="Enter project name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">Project Type</Label>
                      <Select value={formData?.project_type || ''} onValueChange={(v) => setField('project_type', v)}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          {PROJECT_TYPES.map(t => (
                            <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Status</Label>
                      <Select value={formData?.status || 'active'} onValueChange={(v) => setField('status', v)}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PROJECT_STATUSES.map(s => (
                            <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Address</Label>
                    <Input
                      value={formData?.address || ''}
                      onChange={(e) => setField('address', e.target.value)}
                      className="mt-1"
                      placeholder="123 Main St, City, State ZIP"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Description / Notes</Label>
                    <Textarea
                      value={formData?.notes || ''}
                      onChange={(e) => setField('notes', e.target.value)}
                      className="mt-1"
                      rows={3}
                      placeholder="Project description, notes, etc."
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-medium text-gray-900 mb-4">Timeline</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-gray-500">Start Date</Label>
                        <Input
                          type="date"
                          value={formData?.start_date ? formData.start_date.split('T')[0] : ''}
                          onChange={(e) => setField('start_date', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Target Completion</Label>
                        <Input
                          type="date"
                          value={formData?.target_completion_date ? formData.target_completion_date.split('T')[0] : ''}
                          onChange={(e) => setField('target_completion_date', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-medium text-gray-900 mb-4">Budget</h3>
                  <div>
                    <Label className="text-xs text-gray-500">Total Budget ($)</Label>
                    <Input
                      type="number"
                      value={formData?.budget || ''}
                      onChange={(e) => setField('budget', e.target.value)}
                      className="mt-1"
                      placeholder="250000"
                    />
                  </div>
                  {budgetTypeInfo && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mt-4">
                      <div className={`w-10 h-10 ${budgetTypeInfo.color} rounded-lg flex items-center justify-center text-xl`}>
                        {budgetTypeInfo.icon}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{budgetTypeInfo.name}</p>
                        <p className="text-xs text-gray-500">{budgetTypeInfo.description}</p>
                      </div>
                    </div>
                  )}
                  <Button variant="outline" className="w-full mt-4" onClick={() => setActiveSection('budget')}>
                    <Calculator className="w-4 h-4 mr-2" />Open Detailed Budget
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'property':
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
                    <Label className="text-xs text-gray-500">Street Address</Label>
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
                      <Label className="text-xs text-gray-500">Square Feet</Label>
                      <Input
                        type="number"
                        value={formData?.sqft || ''}
                        onChange={(e) => setField('sqft', e.target.value)}
                        className="mt-1"
                        placeholder="2200"
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
                    <Label className="text-xs text-gray-500">Units / Lots</Label>
                    <Input
                      type="number"
                      value={formData?.units || ''}
                      onChange={(e) => setField('units', e.target.value)}
                      className="mt-1"
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Legal Description</Label>
                    <Textarea
                      value={formData?.legal_description || ''}
                      onChange={(e) => setField('legal_description', e.target.value)}
                      className="mt-1"
                      rows={3}
                      placeholder="Legal description of property..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'project-settings':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Project Settings</h2>
              <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} error={saveError} />
            </div>
            <div className="bg-white border rounded-lg p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Entity & Ownership</h3>
                  <div>
                    <Label className="text-xs text-gray-500">Entity Name</Label>
                    <Input
                      value={formData?.entity_name || rawProject?.entity?.name || ''}
                      onChange={(e) => setField('entity_name', e.target.value)}
                      className="mt-1"
                      placeholder="Watson House LLC"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Tax ID / EIN</Label>
                    <Input
                      value={formData?.tax_id || ''}
                      onChange={(e) => setField('tax_id', e.target.value)}
                      className="mt-1"
                      placeholder="XX-XXXXXXX"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Project Team</h3>
                  <div>
                    <Label className="text-xs text-gray-500">Project Manager</Label>
                    <Input
                      value={formData?.project_manager || ''}
                      onChange={(e) => setField('project_manager', e.target.value)}
                      className="mt-1"
                      placeholder="Name"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">General Contractor</Label>
                    <Input
                      value={formData?.general_contractor || ''}
                      onChange={(e) => setField('general_contractor', e.target.value)}
                      className="mt-1"
                      placeholder="Company Name"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'purchase-contract':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Purchase Contract</h2>
              <div className="flex items-center gap-3">
                <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} error={saveError} />
                <Button
                  variant="outline"
                  onClick={() => setShowContractModal(true)}
                  className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Contract
                </Button>
                <ESignButton
                  entityType="project"
                  entityId={projectId}
                  entityName={formData?.name}
                  prefillData={{
                    property_address: formData?.address,
                    property_city: formData?.city,
                    property_state: formData?.state,
                    property_zip: formData?.zip_code,
                    purchase_price: formData?.purchase_price,
                    earnest_money: formData?.earnest_money,
                    seller_name: formData?.seller_name,
                    closing_date: formData?.closing_date,
                  }}
                  defaultSigners={formData?.seller_name ? [{
                    role: 'Seller',
                    name: formData.seller_name,
                    email: '',
                    phone: ''
                  }] : []}
                  buttonText="Send for E-Sign"
                  buttonVariant="default"
                  className="bg-[#047857] hover:bg-[#065f46]"
                />
              </div>
            </div>
            <div className="bg-white border rounded-lg p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Contract Terms</h3>
                  <div>
                    <Label className="text-xs text-gray-500">Purchase Price ($)</Label>
                    <Input
                      type="number"
                      value={formData?.purchase_price || ''}
                      onChange={(e) => setField('purchase_price', e.target.value)}
                      className="mt-1"
                      placeholder="200000"
                    />
                  </div>
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
                    <Label className="text-xs text-gray-500">Contract Date</Label>
                    <Input
                      type="date"
                      value={formData?.contract_date ? formData.contract_date.split('T')[0] : ''}
                      onChange={(e) => setField('contract_date', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Key Dates</h3>
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
                    <Label className="text-xs text-gray-500">Closing Date</Label>
                    <Input
                      type="date"
                      value={formData?.closing_date ? formData.closing_date.split('T')[0] : ''}
                      onChange={(e) => setField('closing_date', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Seller Name</Label>
                    <Input
                      value={formData?.seller_name || ''}
                      onChange={(e) => setField('seller_name', e.target.value)}
                      className="mt-1"
                      placeholder="Seller name"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contract Generation Modal */}
            <ContractGenerationModal
              isOpen={showContractModal}
              onClose={() => setShowContractModal(false)}
              entityType="project"
              entityId={projectId}
              entityName={formData?.name}
              entityData={formData}
              onSuccess={() => {
                setShowContractModal(false);
              }}
            />
          </div>
        );

      case 'due-diligence':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Due Diligence</h2>
              <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} error={saveError} />
            </div>
            <div className="bg-white border rounded-lg p-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Due Diligence Checklist</h3>
                <div className="grid grid-cols-2 gap-4">
                  {['Title Search', 'Survey', 'Environmental', 'Zoning Verification', 'Utilities', 'Soil Test'].map((item) => (
                    <label key={item} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData?.[`dd_${item.toLowerCase().replace(/\s/g, '_')}`] || false}
                        onChange={(e) => setField(`dd_${item.toLowerCase().replace(/\s/g, '_')}`, e.target.checked)}
                        className="w-4 h-4 text-[#047857] rounded"
                      />
                      <span className="text-sm">{item}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-6">
                  <Label className="text-xs text-gray-500">Due Diligence Notes</Label>
                  <Textarea
                    value={formData?.dd_notes || ''}
                    onChange={(e) => setField('dd_notes', e.target.value)}
                    className="mt-1"
                    rows={4}
                    placeholder="Notes from due diligence process..."
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'closing':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Closing</h2>
              <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} error={saveError} />
            </div>
            <div className="bg-white border rounded-lg p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Closing Details</h3>
                  <div>
                    <Label className="text-xs text-gray-500">Closing Date</Label>
                    <Input
                      type="date"
                      value={formData?.closing_date ? formData.closing_date.split('T')[0] : ''}
                      onChange={(e) => setField('closing_date', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Title Company</Label>
                    <Input
                      value={formData?.title_company || ''}
                      onChange={(e) => setField('title_company', e.target.value)}
                      className="mt-1"
                      placeholder="Title company name"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Closing Agent</Label>
                    <Input
                      value={formData?.closing_agent || ''}
                      onChange={(e) => setField('closing_agent', e.target.value)}
                      className="mt-1"
                      placeholder="Agent name"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Closing Costs</h3>
                  <div>
                    <Label className="text-xs text-gray-500">Total Closing Costs ($)</Label>
                    <Input
                      type="number"
                      value={formData?.closing_costs || ''}
                      onChange={(e) => setField('closing_costs', e.target.value)}
                      className="mt-1"
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Closing Notes</Label>
                    <Textarea
                      value={formData?.closing_notes || ''}
                      onChange={(e) => setField('closing_notes', e.target.value)}
                      className="mt-1"
                      rows={4}
                      placeholder="Closing notes..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'budget':
        return (
          <div className="h-full">
            {getBudgetComponent()}
          </div>
        );

      case 'pro-forma':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Pro Forma Analysis</h2>
              <div className="flex gap-2">
                <Button variant="outline">Export</Button>
                <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setActiveSection('budget')}>
                  <Calculator className="w-4 h-4 mr-2" />Open Budget
                </Button>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Pro Forma data is synced from your project budget.
                To update projections, modify values in the Budget tool.
              </p>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Budget</p>
                <p className="text-2xl font-semibold">${budget.toLocaleString()}</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Projected Sale</p>
                <p className="text-2xl font-semibold">${projectedSalePrice.toLocaleString()}</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Gross Profit</p>
                <p className="text-2xl font-semibold text-emerald-600">${projectedProfit.toLocaleString()}</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Gross Margin</p>
                <p className="text-2xl font-semibold text-emerald-600">{projectedSalePrice > 0 ? ((projectedProfit / projectedSalePrice) * 100).toFixed(1) : 0}%</p>
              </div>
            </div>
          </div>
        );

      case 'finance-summary':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Financial Summary</h2>
              <Button variant="outline">Export Report</Button>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Budget</p>
                <p className="text-2xl font-semibold">${budget.toLocaleString()}</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Expenses</p>
                <p className="text-2xl font-semibold">${spent.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{budget > 0 ? Math.round(spent / budget * 100) : 0}% of budget</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Remaining</p>
                <p className="text-2xl font-semibold text-[#047857]">${(budget - spent).toLocaleString()}</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Projected Profit</p>
                <p className="text-2xl font-semibold text-[#047857]">${projectedProfit.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-6">
              <div className="flex gap-3">
                <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setActiveSection('budget')}>
                  <Calculator className="w-4 h-4 mr-2" />Open Full Budget
                </Button>
                <Button variant="outline" onClick={() => setActiveSection('pro-forma')}>
                  <FileText className="w-4 h-4 mr-2" />View Pro Forma
                </Button>
              </div>
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Construction Schedule</h2>
              <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} error={saveError} />
            </div>
            <div className="bg-white border rounded-lg p-6 mb-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-xs text-gray-500">Project Start Date</Label>
                  <Input
                    type="date"
                    value={formData?.start_date ? formData.start_date.split('T')[0] : ''}
                    onChange={(e) => setField('start_date', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Target Completion</Label>
                  <Input
                    type="date"
                    value={formData?.target_completion_date ? formData.target_completion_date.split('T')[0] : ''}
                    onChange={(e) => setField('target_completion_date', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-medium mb-4">Phase Schedule</h3>
              <div className="space-y-3">
                {[
                  { phase: 'Pre-Construction', status: 'completed', start: '2024-01-15', end: '2024-02-01', progress: 100 },
                  { phase: 'Site Preparation', status: 'completed', start: '2024-02-01', end: '2024-02-15', progress: 100 },
                  { phase: 'Foundation', status: 'active', start: '2024-02-15', end: '2024-03-15', progress: 75 },
                  { phase: 'Framing', status: 'upcoming', start: '2024-03-15', end: '2024-04-30', progress: 0 },
                  { phase: 'Rough-In (MEP)', status: 'upcoming', start: '2024-04-30', end: '2024-05-31', progress: 0 },
                  { phase: 'Insulation & Drywall', status: 'upcoming', start: '2024-05-31', end: '2024-06-30', progress: 0 },
                  { phase: 'Finishes', status: 'upcoming', start: '2024-06-30', end: '2024-08-15', progress: 0 },
                  { phase: 'Final Inspection', status: 'upcoming', start: '2024-08-15', end: '2024-08-31', progress: 0 },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50">
                    <div className={`w-3 h-3 rounded-full ${item.status === 'completed' ? 'bg-green-500' : item.status === 'active' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.phase}</p>
                      <p className="text-xs text-gray-500">{item.start} - {item.end}</p>
                    </div>
                    <div className="w-32">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${item.status === 'completed' ? 'bg-green-500' : item.status === 'active' ? 'bg-blue-500' : 'bg-gray-300'}`} style={{ width: `${item.progress}%` }} />
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${item.status === 'completed' ? 'bg-green-100 text-green-700' : item.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                      {item.progress}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'draws':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Draw Requests</h2>
              <Button className="bg-[#047857] hover:bg-[#065f46]">New Draw Request</Button>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Budget</p>
                <p className="text-2xl font-semibold">${budget.toLocaleString()}</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Drawn</p>
                <p className="text-2xl font-semibold">$0</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Remaining</p>
                <p className="text-2xl font-semibold text-[#047857]">${budget.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-6">
              <p className="text-gray-500 text-center py-8">No draw requests yet. Click "New Draw Request" to create one.</p>
            </div>
          </div>
        );

      case 'contacts':
        return <ProjectContactsSection projectId={projectId} />;

      case 'files':
        return (
          <div className="p-6">
            <DocumentLibrary
              entityType="project"
              entityId={projectId}
              entityName={formData?.name}
              showHeader={true}
              showCategories={true}
              showUpload={true}
            />
          </div>
        );

      case 'change-orders':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Change Orders</h2>
              <Button className="bg-[#047857] hover:bg-[#065f46]">New Change Order</Button>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Total COs</p>
                <p className="text-2xl font-semibold">0</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Approved Amount</p>
                <p className="text-2xl font-semibold text-green-600">$0</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-amber-600">$0</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Rejected</p>
                <p className="text-2xl font-semibold text-red-600">$0</p>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-6">
              <p className="text-gray-500 text-center py-8">No change orders yet. Click "New Change Order" to create one.</p>
            </div>
          </div>
        );

      case 'permits':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Permits & Inspections</h2>
              <Button className="bg-[#047857] hover:bg-[#065f46]">Add Permit</Button>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Permits</p>
                <p className="text-2xl font-semibold">0</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-semibold text-green-600">0</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-amber-600">0</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Inspections Due</p>
                <p className="text-2xl font-semibold text-blue-600">0</p>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-6">
              <p className="text-gray-500 text-center py-8">No permits tracked yet. Click "Add Permit" to add one.</p>
            </div>
          </div>
        );

      case 'bids':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Bids & Subcontracts</h2>
              <Button className="bg-[#047857] hover:bg-[#065f46]">Create Bid Package</Button>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Bid Packages</p>
                <p className="text-2xl font-semibold">0</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Bids Received</p>
                <p className="text-2xl font-semibold">0</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Awarded</p>
                <p className="text-2xl font-semibold text-green-600">0</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Contract Value</p>
                <p className="text-2xl font-semibold">$0</p>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-6">
              <p className="text-gray-500 text-center py-8">No bid packages yet. Click "Create Bid Package" to start.</p>
            </div>
          </div>
        );

      case 'budget-vs-actual':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Budget vs Actual</h2>
              <Button variant="outline">Export Report</Button>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Budget</p>
                <p className="text-2xl font-semibold">${budget.toLocaleString()}</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Actual Spent</p>
                <p className="text-2xl font-semibold">${spent.toLocaleString()}</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Variance</p>
                <p className={`text-2xl font-semibold ${budget - spent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${Math.abs(budget - spent).toLocaleString()} {budget - spent >= 0 ? 'under' : 'over'}
                </p>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-6">
              <table className="w-full">
                <thead className="text-xs text-gray-500 uppercase border-b">
                  <tr>
                    <th className="text-left p-3">Category</th>
                    <th className="text-right p-3">Budget</th>
                    <th className="text-right p-3">Actual</th>
                    <th className="text-right p-3">Variance</th>
                    <th className="text-right p-3">% Used</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    { category: 'Land Acquisition', budget: budget * 0.30, actual: spent * 0.40 },
                    { category: 'Site Work', budget: budget * 0.10, actual: spent * 0.15 },
                    { category: 'Foundation', budget: budget * 0.15, actual: spent * 0.20 },
                    { category: 'Framing', budget: budget * 0.20, actual: spent * 0.15 },
                    { category: 'MEP', budget: budget * 0.15, actual: spent * 0.10 },
                    { category: 'Finishes', budget: budget * 0.10, actual: 0 },
                  ].map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-3 font-medium">{item.category}</td>
                      <td className="p-3 text-right">${item.budget.toLocaleString()}</td>
                      <td className="p-3 text-right">${item.actual.toLocaleString()}</td>
                      <td className={`p-3 text-right ${item.budget - item.actual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${Math.abs(item.budget - item.actual).toLocaleString()}
                      </td>
                      <td className="p-3 text-right">{item.budget > 0 ? Math.round(item.actual / item.budget * 100) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'expenses':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Expenses</h2>
              <Button className="bg-[#047857] hover:bg-[#065f46]">Record Expense</Button>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Expenses</p>
                <p className="text-2xl font-semibold">${spent.toLocaleString()}</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-2xl font-semibold">${Math.round(spent * 0.15).toLocaleString()}</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Pending Approval</p>
                <p className="text-2xl font-semibold text-amber-600">$0</p>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-6">
              <p className="text-gray-500 text-center py-8">No expenses recorded yet. Click "Record Expense" to add one.</p>
            </div>
          </div>
        );

      case 'revenue':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Revenue & Sales</h2>
              <Button className="bg-[#047857] hover:bg-[#065f46]">Record Sale</Button>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Projected Sale</p>
                <p className="text-2xl font-semibold">${projectedSalePrice.toLocaleString()}</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Actual Revenue</p>
                <p className="text-2xl font-semibold">$0</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Deposits Received</p>
                <p className="text-2xl font-semibold text-green-600">$0</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-amber-600">$0</p>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-6">
              <p className="text-gray-500 text-center py-8">No sales recorded yet. Click "Record Sale" when property is sold.</p>
            </div>
          </div>
        );

      case 'loans':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Loans & Financing</h2>
              <Button className="bg-[#047857] hover:bg-[#065f46]">Add Loan</Button>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Loan Amount</p>
                <p className="text-2xl font-semibold">$0</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Amount Drawn</p>
                <p className="text-2xl font-semibold">$0</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Available</p>
                <p className="text-2xl font-semibold text-green-600">$0</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Interest Accrued</p>
                <p className="text-2xl font-semibold text-red-600">$0</p>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-6">
              <p className="text-gray-500 text-center py-8">No loans tracked yet. Click "Add Loan" to add financing details.</p>
            </div>
          </div>
        );

      case 'draws-finance':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Draw Schedule</h2>
              <Button variant="outline">Export Schedule</Button>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Loan</p>
                <p className="text-2xl font-semibold">$0</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Drawn to Date</p>
                <p className="text-2xl font-semibold">$0</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Remaining</p>
                <p className="text-2xl font-semibold text-green-600">$0</p>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-6">
              <p className="text-gray-500 text-center py-8">Add a loan first to set up the draw schedule.</p>
            </div>
          </div>
        );

      case 'cash-flow':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Cash Flow Analysis</h2>
              <Button variant="outline">Export Report</Button>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Cash In</p>
                <p className="text-2xl font-semibold text-green-600">$0</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Cash Out</p>
                <p className="text-2xl font-semibold text-red-600">${spent.toLocaleString()}</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Net Cash Flow</p>
                <p className="text-2xl font-semibold">${(-spent).toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-medium mb-4">Monthly Cash Flow Projection</h3>
              <p className="text-gray-500 text-center py-8">Cash flow projections will appear here once transactions are recorded.</p>
            </div>
          </div>
        );

      case 'project-settings':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Project Settings</h2>
              <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} error={saveError} />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-medium mb-4">Project Status</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500">Current Status</Label>
                    <Select value={formData?.status || 'active'} onValueChange={(v) => setField('status', v)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Priority</Label>
                    <Select value={formData?.priority || 'medium'} onValueChange={(v) => setField('priority', v)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-medium mb-4">Notifications</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm">Budget threshold alerts</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm">Schedule milestone reminders</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm">Document expiration warnings</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Weekly summary emails</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 capitalize">{activeSection.replace(/-/g, ' ')}</h2>
              <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} error={saveError} />
            </div>
            <div className="bg-white border rounded-lg p-6">
              <p className="text-gray-500 text-center py-8">Section content loading...</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-[calc(100vh-40px)] bg-gray-50">
      <div className="w-56 bg-[#1e2a3a] flex-shrink-0 flex flex-col">
        <div className="p-3 border-b border-gray-700">
          <button onClick={() => navigate('/projects')} className="flex items-center gap-2 text-gray-400 hover:text-white text-xs mb-2 uppercase tracking-wide">
            <ArrowLeft className="w-3 h-3" /> Back to Projects
          </button>
          <div className="flex items-center gap-3 mt-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center"><Building2 className="w-5 h-5 text-white" /></div>
            <div>
              <h2 className="text-white font-semibold truncate">{formData?.name || 'Unnamed'}</h2>
              <p className="text-gray-500 text-xs">{rawProject?.entity?.name || 'No Entity'}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className={cn("text-xs px-2 py-0.5 rounded",
              formData?.status === 'active' ? 'bg-emerald-500 text-white' :
              formData?.status === 'completed' ? 'bg-blue-500 text-white' :
              formData?.status === 'on-hold' ? 'bg-amber-500 text-white' :
              'bg-gray-500 text-white'
            )}>{formData?.status || 'active'}</span>
            {budgetTypeInfo && (
              <span className="text-xs bg-gray-600 text-gray-200 px-2 py-0.5 rounded">{budgetTypeInfo.name}</span>
            )}
          </div>
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
          {sidebarGroups.map((group) => (
            <div key={group.id} className="mb-1">
              <button onClick={() => toggleGroup(group.id)} className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-white hover:bg-white/5 rounded">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {group.label}
                </div>
                <ChevronDown className={cn("w-4 h-4 transition-transform", expandedGroups.includes(group.id) ? "" : "-rotate-90")} />
              </button>
              {expandedGroups.includes(group.id) && (
                <div className="ml-4 border-l border-gray-700 space-y-0.5">
                  {group.items.map((item) => (
                    <button key={item.id} onClick={() => setActiveSection(item.id)} className={cn("w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-r transition-colors", activeSection === item.id ? "bg-[#047857] text-white" : "text-gray-400 hover:text-white hover:bg-white/5")}>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
