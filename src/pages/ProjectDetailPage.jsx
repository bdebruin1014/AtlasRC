import React, { useState, useMemo, useEffect } from 'react';
import ProjectContactsSection from '@/pages/projects/ContactsPage';
import BasicInfoPage from '@/pages/projects/BasicInfoPage';
import PropertyDetailsPage from '@/pages/projects/PropertyDetailsPage';
import TasksPage from '@/pages/projects/TasksPage';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, FileText, Building2, Users, DollarSign, FolderOpen, ClipboardList, MapPin, Calendar, Landmark, FileCheck, Receipt, Mail, MessageSquare, TrendingUp, CreditCard, PieChart, Calculator, Loader2, CheckSquare, Hammer } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useProject, useProjectActions, useProjectFinancials, PROJECT_TYPES, PROJECT_STATUSES } from '@/hooks/useProjects';
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

  // Properties linked to purchase contract
  const [linkedPropertyIds, setLinkedPropertyIds] = useState([]);
  const [availableProperties] = useState([
    { id: 'prop-1', name: 'Lot 1 - Main Property', address: '1250 Oakridge Drive', type: 'single-family', status: 'Under Construction' },
    { id: 'prop-2', name: 'Lot 2 - Corner Lot', address: '1252 Oakridge Drive', type: 'single-family', status: 'Planning' },
    { id: 'prop-3', name: 'Lot 3 - Rear Lot', address: '1254 Oakridge Drive', type: 'single-family', status: 'Planning' },
  ]);

  const togglePropertyLink = (propertyId) => {
    setLinkedPropertyIds(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  // Fetch project data from database
  const { project: rawProject, isLoading, error, refetch } = useProject(projectId);
  const { updateProject } = useProjectActions();
  const { financials } = useProjectFinancials(projectId);

  // Auto-save hook for project data
  const {
    formData,
    setField,
    saveStatus,
    lastSaved,
    error: saveError,
  } = useAutoSave(
    rawProject,
    async (data) => {
      if (projectId && data) {
        await updateProject(projectId, data);
      }
    },
    1500
  );

  const budgetTypeId = formData?.budget_type || rawProject?.budget_type;
  const budgetTypeInfo = budgetTypes.find((type) => type.id === budgetTypeId);

  const renderBudgetSection = () => {
    switch (budgetTypeId) {
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
        { id: 'tasks', label: 'Tasks', icon: CheckSquare },
      ]
    },
    {
      id: 'acquisition',
      label: 'Acquisition',
      items: [
        { id: 'purchase-contract', label: 'Contract', icon: FileCheck },
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
        { id: 'draws', label: 'Build / Draw', icon: Receipt },
        { id: 'change-orders', label: 'Change Orders', icon: FileCheck },
      ]
    },
    {
      id: 'finance',
      label: 'Finance',
      items: [
        { id: 'finance-summary', label: 'Summary', icon: PieChart },
        { id: 'pro-forma', label: 'Pro Forma', icon: Calculator },
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
  const spent = financials?.totalExpenses || 0;
  const projectedSalePrice = budget * 1.5;
  const projectedProfit = budget * 0.25;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="ml-2">Loading project...</span>
      </div>
    );
  }

  if (error || !rawProject) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Project not found</h2>
        <p className="text-gray-500 mt-2">{error || 'The requested project could not be loaded.'}</p>
        <Button className="mt-4" onClick={() => navigate('/projects')}>Back to Projects</Button>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'basic-info':
        return <BasicInfoPage />;

      case 'property':
        return <PropertyDetailsPage projectId={projectId} />;

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
                    <Label className="text-xs text-gray-500">Purchase Status</Label>
                    <Select value={formData?.purchase_status || 'under-contract'} onValueChange={(v) => setField('purchase_status', v)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-contract">Under Contract</SelectItem>
                        <SelectItem value="closing-pending">Closing Pending</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="terminated">Terminated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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

            {/* Linked Properties Section */}
            <div className="bg-white border rounded-lg p-6 mt-6">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Linked Properties
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Select which properties are included in this purchase contract.
              </p>
              <div className="space-y-2">
                {availableProperties.map((property) => {
                  const isLinked = linkedPropertyIds.includes(property.id);
                  return (
                    <label
                      key={property.id}
                      className={cn(
                        "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors",
                        isLinked ? "border-emerald-500 bg-emerald-50" : "hover:bg-gray-50"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isLinked}
                        onChange={() => togglePropertyLink(property.id)}
                        className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{property.name}</p>
                        <p className="text-xs text-gray-500">{property.address}</p>
                      </div>
                      <div className="text-right">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded",
                          property.status === 'Under Construction' ? 'bg-blue-100 text-blue-700' :
                          property.status === 'Planning' ? 'bg-yellow-100 text-yellow-700' :
                          property.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        )}>
                          {property.status}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
              {linkedPropertyIds.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{linkedPropertyIds.length}</span> {linkedPropertyIds.length === 1 ? 'property' : 'properties'} linked to this contract
                  </p>
                </div>
              )}
              {availableProperties.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <p className="text-sm">No properties available. Add properties in the Property Details section first.</p>
                </div>
              )}
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
            {renderBudgetSection()}
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

      case 'tasks':
        return <TasksPage projectId={projectId} />;

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
      case 'bids':
        return (
          <div className="p-6">
            <div className="bg-white border rounded-lg p-8 text-center">
              <Hammer className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Moved to Construction Management</h3>
              <p className="text-sm text-gray-500 mb-4">
                Permits and Purchase Orders are now managed per-house in the Construction Management module.
              </p>
              <Button
                onClick={() => navigate('/construction')}
                className="bg-[#047857] hover:bg-[#065f46]"
              >
                Go to Construction Management
              </Button>
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
          {(sidebarGroups || []).map((group) => (
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
                  {(group.items || []).map((item) => (
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
