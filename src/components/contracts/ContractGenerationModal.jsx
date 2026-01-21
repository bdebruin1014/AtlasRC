// src/components/contracts/ContractGenerationModal.jsx
// Modal for generating contracts: select template -> preview -> send for e-sign

import React, { useState, useEffect } from 'react';
import {
  FileText, ChevronRight, ChevronLeft, FileSignature, Eye, Edit,
  Download, Loader2, CheckCircle, AlertCircle, X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  getContractTemplates,
  generateContractPreview,
  buildPrefillData,
  getDefaultSigners,
  SAMPLE_TEMPLATES
} from '@/services/contractGenerationService';
import { sendForSignature, getTemplatesForModule } from '@/services/esignService';

const STEPS = [
  { id: 'template', label: 'Select Template' },
  { id: 'preview', label: 'Preview & Edit' },
  { id: 'signers', label: 'Add Signers' },
  { id: 'send', label: 'Review & Send' }
];

const ContractGenerationModal = ({
  isOpen,
  onClose,
  entityType = 'project',
  entityId,
  entityName,
  entityData = {},
  onSuccess = () => {}
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [docusealTemplates, setDocusealTemplates] = useState([]);
  const [previewContent, setPreviewContent] = useState('');
  const [customOverrides, setCustomOverrides] = useState({});
  const [signers, setSigners] = useState([]);
  const [documentName, setDocumentName] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Load templates on mount
  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      resetState();
    }
  }, [isOpen, entityType]);

  const loadTemplates = async () => {
    // Get local contract templates
    const localTemplates = getContractTemplates(entityType);
    setTemplates(localTemplates);

    // Get DocuSeal templates from database
    const { data } = await getTemplatesForModule(entityType);
    if (data) {
      setDocusealTemplates(data);
    }
  };

  const resetState = () => {
    setCurrentStep(0);
    setSelectedTemplate(null);
    setPreviewContent('');
    setCustomOverrides({});
    setSigners(getDefaultSigners(entityType, entityData));
    setDocumentName('');
    setNotes('');
    setError(null);
    setSuccess(false);
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    const docName = `${template.name} - ${entityName || entityData.name || entityData.deal_number || 'Document'}`;
    setDocumentName(docName);

    // Generate preview if it's a local template with sample content
    if (SAMPLE_TEMPLATES[template.id]) {
      const preview = generateContractPreview(
        SAMPLE_TEMPLATES[template.id],
        entityType,
        entityData,
        customOverrides
      );
      setPreviewContent(preview);
    } else {
      setPreviewContent('This template will be filled with data from the DocuSeal template system.');
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddSigner = () => {
    setSigners([...signers, { role: `Signer ${signers.length + 1}`, name: '', email: '', phone: '' }]);
  };

  const handleRemoveSigner = (index) => {
    setSigners(signers.filter((_, i) => i !== index));
  };

  const handleSignerChange = (index, field, value) => {
    const updated = [...signers];
    updated[index][field] = value;
    setSigners(updated);
  };

  const handleSend = async () => {
    // Validate signers
    const invalidSigners = signers.filter(s => !s.name || !s.email);
    if (invalidSigners.length > 0) {
      setError('All signers must have a name and email address.');
      return;
    }

    if (signers.length === 0) {
      setError('At least one signer is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build prefill data for the contract
      const prefillData = buildPrefillData(entityType, entityData, customOverrides);

      // Find DocuSeal template ID if available
      const docusealTemplate = docusealTemplates.find(t => t.name === selectedTemplate?.name);
      const docusealTemplateId = docusealTemplate?.docuseal_template_id || selectedTemplate?.docuseal_id || 1;

      const result = await sendForSignature({
        entityType,
        entityId,
        entityName: entityName || entityData.name || entityData.deal_number,
        templateId: selectedTemplate?.id,
        docusealTemplateId,
        documentName,
        signers,
        prefillData,
        sendEmail,
        notes
      });

      if (result.error) {
        throw result.error;
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess(result.data);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error sending contract:', err);
      setError(err.message || 'Failed to send contract for signature.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!selectedTemplate;
      case 1: return true;
      case 2: return signers.length > 0 && signers.every(s => s.name && s.email);
      case 3: return true;
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Select a contract template to generate:</p>

            <div className="grid grid-cols-1 gap-3">
              {templates.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={cn(
                    "flex items-start gap-4 p-4 border rounded-lg text-left transition-all",
                    selectedTemplate?.id === template.id
                      ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200"
                      : "hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    selectedTemplate?.id === template.id ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500"
                  )}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      {selectedTemplate?.id === template.id && (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                    <span className="inline-block mt-2 text-xs px-2 py-1 bg-gray-100 rounded capitalize">
                      {template.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {docusealTemplates.length > 0 && (
              <>
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">DocuSeal Templates</p>
                  <div className="grid grid-cols-1 gap-3">
                    {docusealTemplates.map(template => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect({
                          ...template,
                          docuseal_id: template.docuseal_template_id
                        })}
                        className={cn(
                          "flex items-start gap-4 p-4 border rounded-lg text-left transition-all",
                          selectedTemplate?.id === template.id
                            ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200"
                            : "hover:border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                          selectedTemplate?.id === template.id ? "bg-emerald-500 text-white" : "bg-blue-100 text-blue-600"
                        )}>
                          <FileSignature className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{template.name}</h4>
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">DocuSeal</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label>Document Name</Label>
              <Input
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                className="mt-1"
                placeholder="Enter document name"
              />
            </div>

            <div>
              <Label>Preview</Label>
              <div className="mt-1 border rounded-lg bg-gray-50 p-4 max-h-[400px] overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap font-mono text-gray-700">
                  {previewContent}
                </pre>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Eye className="w-4 h-4" />
              <span>Variables have been replaced with data from this {entityType}</span>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Add signers who need to sign this document:</p>

            <div className="space-y-4">
              {signers.map((signer, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Signer {index + 1}</h4>
                    <button
                      onClick={() => handleRemoveSigner(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">Role</Label>
                      <Input
                        value={signer.role}
                        onChange={(e) => handleSignerChange(index, 'role', e.target.value)}
                        className="mt-1"
                        placeholder="Seller, Buyer, etc."
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Name *</Label>
                      <Input
                        value={signer.name}
                        onChange={(e) => handleSignerChange(index, 'name', e.target.value)}
                        className="mt-1"
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Email *</Label>
                      <Input
                        type="email"
                        value={signer.email}
                        onChange={(e) => handleSignerChange(index, 'email', e.target.value)}
                        className="mt-1"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Phone</Label>
                      <Input
                        type="tel"
                        value={signer.phone}
                        onChange={(e) => handleSignerChange(index, 'phone', e.target.value)}
                        className="mt-1"
                        placeholder="(555) 555-5555"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" onClick={handleAddSigner} className="w-full">
              + Add Another Signer
            </Button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Contract Sent!</h3>
                <p className="text-gray-500 mt-2">Signers will receive an email to sign the document.</p>
              </div>
            ) : (
              <>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Template:</span>
                      <span className="font-medium">{selectedTemplate?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Document:</span>
                      <span className="font-medium">{documentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Signers:</span>
                      <span className="font-medium">{signers.length}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Signers</h4>
                  <div className="space-y-2">
                    {signers.map((signer, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{signer.name}</p>
                          <p className="text-xs text-gray-500">{signer.email}</p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-gray-200 rounded">{signer.role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="sendEmail"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <label htmlFor="sendEmail" className="text-sm text-gray-700">
                    Send email notification to signers
                  </label>
                </div>

                <div>
                  <Label>Notes (optional)</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1"
                    rows={2}
                    placeholder="Add any notes about this signing request..."
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Contract</DialogTitle>
        </DialogHeader>

        {/* Step Progress */}
        <div className="flex items-center justify-between mb-6 pt-2">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  index < currentStep ? "bg-emerald-500 text-white" :
                  index === currentStep ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500" :
                  "bg-gray-100 text-gray-500"
                )}>
                  {index < currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                <span className={cn(
                  "text-sm hidden sm:block",
                  index === currentStep ? "text-emerald-700 font-medium" : "text-gray-500"
                )}>
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={cn(
                  "flex-1 h-1 mx-2 rounded",
                  index < currentStep ? "bg-emerald-500" : "bg-gray-200"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex justify-between pt-4 border-t mt-4">
          <Button
            variant="outline"
            onClick={currentStep === 0 ? onClose : handleBack}
            disabled={loading}
          >
            {currentStep === 0 ? (
              'Cancel'
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </>
            )}
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            !success && (
              <Button
                onClick={handleSend}
                disabled={loading || !canProceed()}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <FileSignature className="w-4 h-4 mr-2" />
                    Send for Signature
                  </>
                )}
              </Button>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContractGenerationModal;
