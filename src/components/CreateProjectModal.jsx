// AtlasDev - Create Project Modal with Budget Type and Template Selection
import React, { useState, useEffect } from 'react';
import { X, Building2, MapPin, Calendar, DollarSign, FileText, ChevronRight, Check, Layers, FolderTree, CheckSquare, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { budgetTypes } from '@/features/budgets/components/BudgetModuleRouter';
import { useAuth } from '@/contexts/AuthContext';
import { getOrganizationTemplates, PROJECT_TYPES } from '@/services/projectTemplateService';

const CreateProjectModal = ({ isOpen, onClose, onSubmit }) => {
  const { organization } = useAuth();
  const [step, setStep] = useState(1);
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Info
    projectName: '',
    projectCode: '',
    entity: '',
    description: '',
    // Property Details
    address: '',
    city: '',
    state: 'SC',
    zip: '',
    county: '',
    parcelId: '',
    acres: '',
    zoning: '',
    // Project Type & Budget & Template
    projectType: '',
    budgetType: '',
    templateId: '',
    // Units/Size
    units: 1,
    sqft: '',
    // Dates
    startDate: '',
    targetCompletion: '',
  });

  // Load templates when modal opens
  useEffect(() => {
    if (isOpen && organization?.id) {
      loadTemplates();
    }
  }, [isOpen, organization]);

  const loadTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const { data } = await getOrganizationTemplates(organization.id);
      setTemplates(data || []);
    } catch (err) {
      console.error('Error loading templates:', err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const projectTypes = [
    { id: 'spec-home', label: 'Spec Home', description: 'Single home build for sale', budgetType: 'spec-home' },
    { id: 'custom-home', label: 'Custom Home', description: 'Client-contracted home build', budgetType: 'spec-home' },
    { id: 'lot-development', label: 'Lot Development', description: 'Subdivision/horizontal development', budgetType: 'horizontal-lot' },
    { id: 'btr-community', label: 'BTR Community', description: 'Build to rent development', budgetType: 'btr' },
    { id: 'bts-community', label: 'BTS Community', description: 'Multi-home spec community', budgetType: 'bts' },
    { id: 'multifamily', label: 'Multifamily', description: 'Apartment or condo development', budgetType: 'btr' },
    { id: 'fix-flip', label: 'Fix & Flip', description: 'Renovation for resale', budgetType: 'spec-home' },
  ];

  const handleProjectTypeSelect = (type) => {
    // Find default template for this project type
    const defaultTemplate = templates.find(t => t.project_type === type.id && t.is_default);

    setFormData(prev => ({
      ...prev,
      projectType: type.id,
      budgetType: type.budgetType,
      templateId: defaultTemplate?.id || '',
    }));
  };

  const handleBudgetTypeSelect = (budgetTypeId) => {
    setFormData(prev => ({
      ...prev,
      budgetType: budgetTypeId,
    }));
  };

  const handleTemplateSelect = (templateId) => {
    setFormData(prev => ({
      ...prev,
      templateId: templateId,
    }));
  };

  // Get templates matching the selected project type
  const filteredTemplates = templates.filter(t =>
    !formData.projectType || t.project_type === formData.projectType
  );

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#1e2a3a] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Create New Project</h2>
            <p className="text-sm text-gray-400">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-3 bg-gray-50 border-b flex items-center gap-4">
          {['Project Type', 'Basic Info', 'Property Details'].map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${
                step > i + 1 ? 'bg-[#047857] text-white' : 
                step === i + 1 ? 'bg-[#047857] text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm ${step === i + 1 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>{label}</span>
              {i < 2 && <ChevronRight className="w-4 h-4 text-gray-300" />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          
          {/* Step 1: Project Type & Budget Selection */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Project Type</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {projectTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => handleProjectTypeSelect(type)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      formData.projectType === type.id 
                        ? 'border-[#047857] bg-emerald-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{type.label}</div>
                    <div className="text-sm text-gray-500">{type.description}</div>
                  </button>
                ))}
              </div>

              {formData.projectType && (
                <>
                  {/* Project Template Selection */}
                  {filteredTemplates.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Project Template</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Templates pre-configure folders, phases, tasks, budget items, and team roles for your project.
                      </p>
                      {loadingTemplates ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
                          <button
                            onClick={() => handleTemplateSelect('')}
                            className={`p-4 border-2 rounded-lg text-left transition-all ${
                              !formData.templateId
                                ? 'border-[#047857] bg-emerald-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-medium text-gray-900">No Template</div>
                            <div className="text-sm text-gray-500">Start with a blank project</div>
                          </button>
                          {filteredTemplates.map(template => {
                            const typeInfo = Object.values(PROJECT_TYPES).find(t => t.id === template.project_type);
                            return (
                              <button
                                key={template.id}
                                onClick={() => handleTemplateSelect(template.id)}
                                className={`p-4 border-2 rounded-lg text-left transition-all ${
                                  formData.templateId === template.id
                                    ? 'border-[#047857] bg-emerald-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                                    {typeInfo?.icon || '📁'}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-900">{template.name}</span>
                                      {template.is_default && (
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Default</span>
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-500">{template.description}</div>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                      <span className="flex items-center gap-1">
                                        <FolderTree className="w-3 h-3" />
                                        Folders
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Layers className="w-3 h-3" />
                                        Phases
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <CheckSquare className="w-3 h-3" />
                                        Tasks
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        Team
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Budget Template</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Based on your project type, we recommend the <strong>{budgetTypes.find(b => b.id === formData.budgetType)?.name}</strong> budget.
                    You can also choose a different template:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {budgetTypes.map(bt => (
                      <button
                        key={bt.id}
                        onClick={() => handleBudgetTypeSelect(bt.id)}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          formData.budgetType === bt.id
                            ? 'border-[#047857] bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${bt.color} rounded-lg flex items-center justify-center text-xl`}>
                            {bt.icon}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{bt.name}</div>
                            <div className="text-xs text-gray-500">{bt.category}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 2: Basic Information */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                  <input
                    type="text"
                    value={formData.projectName}
                    onChange={(e) => updateField('projectName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#047857] focus:border-transparent"
                    placeholder="e.g., Watson House"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Code</label>
                  <input
                    type="text"
                    value={formData.projectCode}
                    onChange={(e) => updateField('projectCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#047857] focus:border-transparent"
                    placeholder="e.g., PRJ-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entity *</label>
                  <input
                    type="text"
                    value={formData.entity}
                    onChange={(e) => updateField('entity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#047857] focus:border-transparent"
                    placeholder="e.g., Watson House LLC"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
                  <input
                    type="number"
                    value={formData.units}
                    onChange={(e) => updateField('units', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#047857] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Square Feet</label>
                  <input
                    type="text"
                    value={formData.sqft}
                    onChange={(e) => updateField('sqft', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#047857] focus:border-transparent"
                    placeholder="e.g., 2,214"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#047857] focus:border-transparent"
                    placeholder="Brief project description..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Property Details */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#047857] focus:border-transparent"
                    placeholder="123 Main Street"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#047857] focus:border-transparent"
                    placeholder="Greenville"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#047857] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                    <input
                      type="text"
                      value={formData.zip}
                      onChange={(e) => updateField('zip', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#047857] focus:border-transparent"
                      placeholder="29601"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
                  <input
                    type="text"
                    value={formData.county}
                    onChange={(e) => updateField('county', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#047857] focus:border-transparent"
                    placeholder="Greenville"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parcel ID</label>
                  <input
                    type="text"
                    value={formData.parcelId}
                    onChange={(e) => updateField('parcelId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#047857] focus:border-transparent"
                    placeholder="0234-56-78-9012"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Acres</label>
                  <input
                    type="text"
                    value={formData.acres}
                    onChange={(e) => updateField('acres', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#047857] focus:border-transparent"
                    placeholder="0.25"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zoning</label>
                  <input
                    type="text"
                    value={formData.zoning}
                    onChange={(e) => updateField('zoning', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#047857] focus:border-transparent"
                    placeholder="R-1 Residential"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => updateField('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#047857] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Completion</label>
                  <input
                    type="date"
                    value={formData.targetCompletion}
                    onChange={(e) => updateField('targetCompletion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#047857] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
          <div className="space-y-1">
            {formData.templateId && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Project Template:</span>
                <span className="font-medium text-[#047857]">{templates.find(t => t.id === formData.templateId)?.name}</span>
              </div>
            )}
            {formData.budgetType && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Budget Template:</span>
                <span className="font-medium text-[#047857]">{budgetTypes.find(b => b.id === formData.budgetType)?.name}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(s => s - 1)}>
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button 
                className="bg-[#047857] hover:bg-[#065f46]" 
                onClick={() => setStep(s => s + 1)}
                disabled={step === 1 && !formData.budgetType}
              >
                Next
              </Button>
            ) : (
              <Button 
                className="bg-[#047857] hover:bg-[#065f46]" 
                onClick={handleSubmit}
                disabled={!formData.projectName || !formData.entity || !formData.address}
              >
                Create Project
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
