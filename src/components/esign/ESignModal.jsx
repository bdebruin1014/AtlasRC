// src/components/esign/ESignModal.jsx
// 3-step wizard for sending documents for signature

import React, { useState, useEffect } from 'react';
import { 
  X, FileText, Users, Send, Plus, Trash2, Search, Check, 
  ChevronRight, ChevronLeft, AlertCircle, Loader2, User,
  Building2, FolderKanban, Landmark, FileSignature
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  getTemplatesForModule, 
  getAllTemplates, 
  searchContacts, 
  sendForSignature 
} from '@/services/esignService';

const ENTITY_ICONS = {
  project: Building2,
  opportunity: FolderKanban,
  investor: Landmark,
  investment_deal: Landmark,
  asset: Building2,
  general: FileSignature
};

const ENTITY_LABELS = {
  project: 'Project',
  opportunity: 'Pipeline Deal',
  investor: 'Investor',
  investment_deal: 'Investment Deal',
  asset: 'Asset',
  general: 'General'
};

const ESignModal = ({
  isOpen,
  onClose,
  entityType = 'general',
  entityId = null,
  entityName = '',
  defaultSigners = [],
  prefillData = {},
  onSuccess = () => {},
  onError = () => {}
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Step 1: Template Selection
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Step 2: Signers
  const [signers, setSigners] = useState(defaultSigners.length > 0 ? defaultSigners : [
    { role: 'Signer', name: '', email: '', phone: '', company: '', contact_id: null }
  ]);
  const [contactSearch, setContactSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchingContacts, setSearchingContacts] = useState(false);
  const [activeSignerIndex, setActiveSignerIndex] = useState(null);

  // Step 3: Review
  const [documentName, setDocumentName] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [notes, setNotes] = useState('');

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, [entityType]);

  const loadTemplates = async () => {
    setTemplatesLoading(true);
    const { data, error } = entityType === 'general' 
      ? await getAllTemplates()
      : await getTemplatesForModule(entityType);
    
    if (error) {
      console.error('Error loading templates:', error);
      // Use mock templates for demo
      setTemplates([
        { id: '1', name: 'Purchase Agreement', description: 'Standard purchase contract', docuseal_template_id: 1, template_type: 'contract' },
        { id: '2', name: 'NDA', description: 'Non-disclosure agreement', docuseal_template_id: 2, template_type: 'agreement' },
        { id: '3', name: 'Subscription Agreement', description: 'Investment subscription docs', docuseal_template_id: 3, template_type: 'investment' },
        { id: '4', name: 'Vendor Contract', description: 'Standard vendor agreement', docuseal_template_id: 4, template_type: 'contract' },
      ]);
    } else {
      setTemplates(data || []);
    }
    setTemplatesLoading(false);
  };

  // Contact search
  useEffect(() => {
    if (contactSearch.length >= 2) {
      const timer = setTimeout(() => searchForContacts(contactSearch), 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [contactSearch]);

  const searchForContacts = async (term) => {
    setSearchingContacts(true);
    const { data } = await searchContacts(term);
    setSearchResults(data || []);
    setSearchingContacts(false);
  };

  const selectContact = (contact, signerIndex) => {
    const updatedSigners = [...signers];
    updatedSigners[signerIndex] = {
      ...updatedSigners[signerIndex],
      name: `${contact.first_name} ${contact.last_name}`,
      email: contact.email,
      phone: contact.phone || '',
      company: contact.company || '',
      contact_id: contact.id
    };
    setSigners(updatedSigners);
    setContactSearch('');
    setSearchResults([]);
    setActiveSignerIndex(null);
  };

  const addSigner = () => {
    setSigners([...signers, { role: `Signer ${signers.length + 1}`, name: '', email: '', phone: '', company: '', contact_id: null }]);
  };

  const removeSigner = (index) => {
    if (signers.length > 1) {
      setSigners(signers.filter((_, i) => i !== index));
    }
  };

  const updateSigner = (index, field, value) => {
    const updated = [...signers];
    updated[index] = { ...updated[index], [field]: value };
    // Clear contact_id if manually editing email
    if (field === 'email') {
      updated[index].contact_id = null;
    }
    setSigners(updated);
  };

  // Validation
  const canProceedStep1 = selectedTemplate !== null;
  const canProceedStep2 = signers.every(s => s.name && s.email && s.email.includes('@'));
  const canSubmit = canProceedStep1 && canProceedStep2 && documentName;

  // Submit
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: sendError } = await sendForSignature({
        entityType,
        entityId,
        entityName,
        templateId: selectedTemplate.id,
        docusealTemplateId: selectedTemplate.docuseal_template_id,
        documentName,
        signers,
        prefillData,
        sendEmail,
        notes
      });

      if (sendError) throw sendError;

      onSuccess(data);
    } catch (err) {
      console.error('Error sending for signature:', err);
      setError(err.message || 'Failed to send document');
      onError(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const EntityIcon = ENTITY_ICONS[entityType] || FileSignature;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FileSignature className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Send for E-Signature</h2>
              {entityName && (
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <EntityIcon className="w-3 h-3" />
                  {entityName}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-3 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Select Template', icon: FileText },
              { num: 2, label: 'Add Signers', icon: Users },
              { num: 3, label: 'Review & Send', icon: Send }
            ].map((s, i) => (
              <React.Fragment key={s.num}>
                <div className={cn(
                  "flex items-center gap-2",
                  step >= s.num ? "text-emerald-600" : "text-gray-400"
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    step > s.num ? "bg-emerald-600 text-white" : 
                    step === s.num ? "bg-emerald-100 text-emerald-600 border-2 border-emerald-600" : 
                    "bg-gray-100 text-gray-400"
                  )}>
                    {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
                </div>
                {i < 2 && (
                  <div className={cn(
                    "flex-1 h-0.5 mx-2",
                    step > s.num ? "bg-emerald-600" : "bg-gray-200"
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Select Template */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Choose a Template</h3>
                <p className="text-sm text-gray-500">Select the document template to send for signature</p>
              </div>

              {templatesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No templates available</p>
                  <p className="text-sm">Create templates in DocuSeal first</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => {
                        setSelectedTemplate(template);
                        setDocumentName(template.name);
                      }}
                      className={cn(
                        "w-full text-left p-4 rounded-lg border-2 transition-all",
                        selectedTemplate?.id === template.id
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          selectedTemplate?.id === template.id ? "bg-emerald-100" : "bg-gray-100"
                        )}>
                          <FileText className={cn(
                            "w-5 h-5",
                            selectedTemplate?.id === template.id ? "text-emerald-600" : "text-gray-400"
                          )} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{template.name}</p>
                          {template.description && (
                            <p className="text-sm text-gray-500 mt-0.5">{template.description}</p>
                          )}
                          {template.template_type && (
                            <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-gray-100 rounded">
                              {template.template_type}
                            </span>
                          )}
                        </div>
                        {selectedTemplate?.id === template.id && (
                          <Check className="w-5 h-5 text-emerald-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Add Signers */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Add Signers</h3>
                <p className="text-sm text-gray-500">Enter the people who need to sign this document</p>
              </div>

              <div className="space-y-4">
                {signers.map((signer, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <input
                          type="text"
                          value={signer.role}
                          onChange={(e) => updateSigner(index, 'role', e.target.value)}
                          className="font-medium bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                          placeholder="Role"
                        />
                      </div>
                      {signers.length > 1 && (
                        <button
                          onClick={() => removeSigner(index)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Contact Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={activeSignerIndex === index ? contactSearch : ''}
                        onChange={(e) => {
                          setActiveSignerIndex(index);
                          setContactSearch(e.target.value);
                        }}
                        onFocus={() => setActiveSignerIndex(index)}
                        placeholder="Search contacts..."
                        className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      {activeSignerIndex === index && searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                          {searchResults.map(contact => (
                            <button
                              key={contact.id}
                              onClick={() => selectContact(contact, index)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3"
                            >
                              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-emerald-600">
                                  {contact.first_name?.[0]}{contact.last_name?.[0]}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium">{contact.first_name} {contact.last_name}</p>
                                <p className="text-xs text-gray-500">{contact.email}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Name *</label>
                        <input
                          type="text"
                          value={signer.name}
                          onChange={(e) => updateSigner(index, 'name', e.target.value)}
                          placeholder="Full name"
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Email *</label>
                        <input
                          type="email"
                          value={signer.email}
                          onChange={(e) => updateSigner(index, 'email', e.target.value)}
                          placeholder="email@example.com"
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Phone</label>
                        <input
                          type="tel"
                          value={signer.phone}
                          onChange={(e) => updateSigner(index, 'phone', e.target.value)}
                          placeholder="(555) 555-5555"
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Company</label>
                        <input
                          type="text"
                          value={signer.company}
                          onChange={(e) => updateSigner(index, 'company', e.target.value)}
                          placeholder="Company name"
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    {signer.contact_id && (
                      <p className="text-xs text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Linked to contact record
                      </p>
                    )}
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={addSigner}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Signer
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Send */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-1">Review & Send</h3>
                <p className="text-sm text-gray-500">Confirm the details before sending</p>
              </div>

              {/* Document Name */}
              <div>
                <label className="text-sm font-medium block mb-1">Document Name *</label>
                <input
                  type="text"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Enter document name"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Template</p>
                  <p className="font-medium">{selectedTemplate?.name}</p>
                </div>

                {entityName && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{ENTITY_LABELS[entityType]}</p>
                    <p className="font-medium">{entityName}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-500 mb-2">Signers ({signers.length})</p>
                  <div className="space-y-2">
                    {signers.map((signer, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm">
                        <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-emerald-600">{index + 1}</span>
                        </div>
                        <div>
                          <span className="font-medium">{signer.name}</span>
                          <span className="text-gray-500 ml-1">({signer.role})</span>
                          <span className="text-gray-400 ml-2">{signer.email}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm">Send email notification to signers</span>
                </label>

                <div>
                  <label className="text-sm font-medium block mb-1">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes for internal reference..."
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
          <div>
            {step > 1 && (
              <Button
                variant="ghost"
                onClick={() => setStep(step - 1)}
                disabled={loading}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || loading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send for Signature
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ESignModal;
