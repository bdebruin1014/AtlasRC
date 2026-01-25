import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Copy,
  Edit,
  Trash2,
  Download,
  Upload,
  Eye,
  Folder,
  Tag,
  Clock,
  Star,
  StarOff,
  MoreVertical,
  FileSignature,
  Building2,
  Users,
  Briefcase,
  CheckCircle2,
  X
} from 'lucide-react';

// Demo data for templates
const demoTemplates = [
  {
    id: '1',
    name: 'Standard Lease Agreement',
    description: 'Residential lease agreement with standard terms and conditions',
    category: 'Leasing',
    content: `RESIDENTIAL LEASE AGREEMENT

This Lease Agreement ("Agreement") is entered into as of {{LEASE_START_DATE}} by and between:

LANDLORD: {{LANDLORD_NAME}}
Address: {{LANDLORD_ADDRESS}}

TENANT: {{TENANT_NAME}}
Address: {{TENANT_ADDRESS}}

PROPERTY: {{PROPERTY_ADDRESS}}

1. TERM
The lease term shall begin on {{LEASE_START_DATE}} and end on {{LEASE_END_DATE}}.

2. RENT
Monthly rent: ${{MONTHLY_RENT}}
Due date: {{RENT_DUE_DAY}} of each month
Late fee: ${{LATE_FEE}} after {{GRACE_PERIOD}} days

3. SECURITY DEPOSIT
Amount: ${{SECURITY_DEPOSIT}}

[Additional terms and conditions...]`,
    variables: [
      { name: 'LEASE_START_DATE', type: 'date', label: 'Lease Start Date' },
      { name: 'LEASE_END_DATE', type: 'date', label: 'Lease End Date' },
      { name: 'LANDLORD_NAME', type: 'text', label: 'Landlord Name' },
      { name: 'LANDLORD_ADDRESS', type: 'text', label: 'Landlord Address' },
      { name: 'TENANT_NAME', type: 'text', label: 'Tenant Name' },
      { name: 'TENANT_ADDRESS', type: 'text', label: 'Tenant Address' },
      { name: 'PROPERTY_ADDRESS', type: 'text', label: 'Property Address' },
      { name: 'MONTHLY_RENT', type: 'number', label: 'Monthly Rent' },
      { name: 'RENT_DUE_DAY', type: 'number', label: 'Rent Due Day' },
      { name: 'LATE_FEE', type: 'number', label: 'Late Fee' },
      { name: 'GRACE_PERIOD', type: 'number', label: 'Grace Period (days)' },
      { name: 'SECURITY_DEPOSIT', type: 'number', label: 'Security Deposit' }
    ],
    is_favorite: true,
    use_count: 45,
    created_at: '2025-06-15T10:00:00Z',
    updated_at: '2026-01-10T14:30:00Z',
    created_by: 'John Smith'
  },
  {
    id: '2',
    name: 'Property Purchase Agreement',
    description: 'Standard purchase agreement for property acquisitions',
    category: 'Acquisitions',
    content: `PROPERTY PURCHASE AGREEMENT

Date: {{AGREEMENT_DATE}}

BUYER: {{BUYER_NAME}}
SELLER: {{SELLER_NAME}}

PROPERTY: {{PROPERTY_ADDRESS}}

PURCHASE PRICE: ${{PURCHASE_PRICE}}

EARNEST MONEY: ${{EARNEST_MONEY}}

CLOSING DATE: {{CLOSING_DATE}}

[Terms and conditions...]`,
    variables: [
      { name: 'AGREEMENT_DATE', type: 'date', label: 'Agreement Date' },
      { name: 'BUYER_NAME', type: 'text', label: 'Buyer Name' },
      { name: 'SELLER_NAME', type: 'text', label: 'Seller Name' },
      { name: 'PROPERTY_ADDRESS', type: 'text', label: 'Property Address' },
      { name: 'PURCHASE_PRICE', type: 'number', label: 'Purchase Price' },
      { name: 'EARNEST_MONEY', type: 'number', label: 'Earnest Money' },
      { name: 'CLOSING_DATE', type: 'date', label: 'Closing Date' }
    ],
    is_favorite: true,
    use_count: 23,
    created_at: '2025-08-20T09:00:00Z',
    updated_at: '2026-01-05T11:00:00Z',
    created_by: 'Sarah Johnson'
  },
  {
    id: '3',
    name: 'Vendor Service Agreement',
    description: 'Agreement for vendor/contractor services',
    category: 'Vendors',
    content: `VENDOR SERVICE AGREEMENT

This Service Agreement is entered into on {{AGREEMENT_DATE}}

SERVICE PROVIDER: {{VENDOR_NAME}}
Contact: {{VENDOR_CONTACT}}
Phone: {{VENDOR_PHONE}}
Email: {{VENDOR_EMAIL}}

CLIENT: Atlas Real Estate Development

PROJECT: {{PROJECT_NAME}}
Property: {{PROPERTY_ADDRESS}}

SCOPE OF SERVICES:
{{SCOPE_OF_WORK}}

COMPENSATION:
Total Amount: ${{CONTRACT_AMOUNT}}
Payment Terms: {{PAYMENT_TERMS}}

START DATE: {{START_DATE}}
COMPLETION DATE: {{END_DATE}}

[Additional terms...]`,
    variables: [
      { name: 'AGREEMENT_DATE', type: 'date', label: 'Agreement Date' },
      { name: 'VENDOR_NAME', type: 'text', label: 'Vendor Name' },
      { name: 'VENDOR_CONTACT', type: 'text', label: 'Vendor Contact Person' },
      { name: 'VENDOR_PHONE', type: 'text', label: 'Vendor Phone' },
      { name: 'VENDOR_EMAIL', type: 'text', label: 'Vendor Email' },
      { name: 'PROJECT_NAME', type: 'text', label: 'Project Name' },
      { name: 'PROPERTY_ADDRESS', type: 'text', label: 'Property Address' },
      { name: 'SCOPE_OF_WORK', type: 'textarea', label: 'Scope of Work' },
      { name: 'CONTRACT_AMOUNT', type: 'number', label: 'Contract Amount' },
      { name: 'PAYMENT_TERMS', type: 'text', label: 'Payment Terms' },
      { name: 'START_DATE', type: 'date', label: 'Start Date' },
      { name: 'END_DATE', type: 'date', label: 'End Date' }
    ],
    is_favorite: false,
    use_count: 67,
    created_at: '2025-05-10T08:00:00Z',
    updated_at: '2026-01-15T16:00:00Z',
    created_by: 'Mike Chen'
  },
  {
    id: '4',
    name: 'Non-Disclosure Agreement',
    description: 'Standard NDA for confidential business discussions',
    category: 'Legal',
    content: `NON-DISCLOSURE AGREEMENT

Effective Date: {{EFFECTIVE_DATE}}

DISCLOSING PARTY: {{DISCLOSING_PARTY}}
RECEIVING PARTY: {{RECEIVING_PARTY}}

PURPOSE: {{PURPOSE}}

TERM: This Agreement shall remain in effect for {{TERM_YEARS}} years from the Effective Date.

1. CONFIDENTIAL INFORMATION
"Confidential Information" means all non-public information disclosed by either party...

2. OBLIGATIONS
The Receiving Party agrees to:
- Maintain confidentiality
- Limit disclosure to authorized personnel
- Use information only for the stated Purpose

[Additional terms...]`,
    variables: [
      { name: 'EFFECTIVE_DATE', type: 'date', label: 'Effective Date' },
      { name: 'DISCLOSING_PARTY', type: 'text', label: 'Disclosing Party' },
      { name: 'RECEIVING_PARTY', type: 'text', label: 'Receiving Party' },
      { name: 'PURPOSE', type: 'textarea', label: 'Purpose of Disclosure' },
      { name: 'TERM_YEARS', type: 'number', label: 'Term (Years)' }
    ],
    is_favorite: false,
    use_count: 31,
    created_at: '2025-07-01T12:00:00Z',
    updated_at: '2025-12-20T10:00:00Z',
    created_by: 'Legal Team'
  },
  {
    id: '5',
    name: 'Property Inspection Report',
    description: 'Template for documenting property inspections',
    category: 'Operations',
    content: `PROPERTY INSPECTION REPORT

Date of Inspection: {{INSPECTION_DATE}}
Inspector: {{INSPECTOR_NAME}}

PROPERTY INFORMATION:
Address: {{PROPERTY_ADDRESS}}
Unit: {{UNIT_NUMBER}}
Type: {{PROPERTY_TYPE}}

INSPECTION TYPE: {{INSPECTION_TYPE}}

FINDINGS:

1. EXTERIOR
Condition: {{EXTERIOR_CONDITION}}
Notes: {{EXTERIOR_NOTES}}

2. INTERIOR
Condition: {{INTERIOR_CONDITION}}
Notes: {{INTERIOR_NOTES}}

3. SYSTEMS
HVAC: {{HVAC_CONDITION}}
Plumbing: {{PLUMBING_CONDITION}}
Electrical: {{ELECTRICAL_CONDITION}}

RECOMMENDED ACTIONS:
{{RECOMMENDATIONS}}

OVERALL RATING: {{OVERALL_RATING}}/10`,
    variables: [
      { name: 'INSPECTION_DATE', type: 'date', label: 'Inspection Date' },
      { name: 'INSPECTOR_NAME', type: 'text', label: 'Inspector Name' },
      { name: 'PROPERTY_ADDRESS', type: 'text', label: 'Property Address' },
      { name: 'UNIT_NUMBER', type: 'text', label: 'Unit Number' },
      { name: 'PROPERTY_TYPE', type: 'text', label: 'Property Type' },
      { name: 'INSPECTION_TYPE', type: 'select', label: 'Inspection Type', options: ['Move-in', 'Move-out', 'Annual', 'Maintenance', 'Pre-purchase'] },
      { name: 'EXTERIOR_CONDITION', type: 'select', label: 'Exterior Condition', options: ['Excellent', 'Good', 'Fair', 'Poor'] },
      { name: 'EXTERIOR_NOTES', type: 'textarea', label: 'Exterior Notes' },
      { name: 'INTERIOR_CONDITION', type: 'select', label: 'Interior Condition', options: ['Excellent', 'Good', 'Fair', 'Poor'] },
      { name: 'INTERIOR_NOTES', type: 'textarea', label: 'Interior Notes' },
      { name: 'HVAC_CONDITION', type: 'select', label: 'HVAC Condition', options: ['Excellent', 'Good', 'Fair', 'Poor', 'N/A'] },
      { name: 'PLUMBING_CONDITION', type: 'select', label: 'Plumbing Condition', options: ['Excellent', 'Good', 'Fair', 'Poor'] },
      { name: 'ELECTRICAL_CONDITION', type: 'select', label: 'Electrical Condition', options: ['Excellent', 'Good', 'Fair', 'Poor'] },
      { name: 'RECOMMENDATIONS', type: 'textarea', label: 'Recommended Actions' },
      { name: 'OVERALL_RATING', type: 'number', label: 'Overall Rating (1-10)' }
    ],
    is_favorite: true,
    use_count: 89,
    created_at: '2025-04-01T14:00:00Z',
    updated_at: '2026-01-20T09:00:00Z',
    created_by: 'Operations Team'
  },
  {
    id: '6',
    name: 'Meeting Notes Template',
    description: 'Standard template for documenting meetings',
    category: 'Communications',
    content: `MEETING NOTES

Date: {{MEETING_DATE}}
Time: {{MEETING_TIME}}
Location: {{MEETING_LOCATION}}

ATTENDEES:
{{ATTENDEES}}

SUBJECT: {{MEETING_SUBJECT}}

AGENDA:
{{AGENDA}}

DISCUSSION SUMMARY:
{{DISCUSSION_SUMMARY}}

ACTION ITEMS:
{{ACTION_ITEMS}}

NEXT MEETING: {{NEXT_MEETING_DATE}}

Notes prepared by: {{PREPARED_BY}}`,
    variables: [
      { name: 'MEETING_DATE', type: 'date', label: 'Meeting Date' },
      { name: 'MEETING_TIME', type: 'text', label: 'Meeting Time' },
      { name: 'MEETING_LOCATION', type: 'text', label: 'Location' },
      { name: 'ATTENDEES', type: 'textarea', label: 'Attendees' },
      { name: 'MEETING_SUBJECT', type: 'text', label: 'Meeting Subject' },
      { name: 'AGENDA', type: 'textarea', label: 'Agenda Items' },
      { name: 'DISCUSSION_SUMMARY', type: 'textarea', label: 'Discussion Summary' },
      { name: 'ACTION_ITEMS', type: 'textarea', label: 'Action Items' },
      { name: 'NEXT_MEETING_DATE', type: 'date', label: 'Next Meeting Date' },
      { name: 'PREPARED_BY', type: 'text', label: 'Prepared By' }
    ],
    is_favorite: false,
    use_count: 124,
    created_at: '2025-03-15T10:00:00Z',
    updated_at: '2026-01-22T15:00:00Z',
    created_by: 'Admin'
  }
];

const categories = [
  { id: 'all', name: 'All Templates', icon: FileText },
  { id: 'Leasing', name: 'Leasing', icon: FileSignature },
  { id: 'Acquisitions', name: 'Acquisitions', icon: Building2 },
  { id: 'Vendors', name: 'Vendors', icon: Users },
  { id: 'Legal', name: 'Legal', icon: Briefcase },
  { id: 'Operations', name: 'Operations', icon: CheckCircle2 },
  { id: 'Communications', name: 'Communications', icon: FileText }
];

export default function DocumentTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUseModal, setShowUseModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [variableValues, setVariableValues] = useState({});
  const [generatedDocument, setGeneratedDocument] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      if (isDemoMode()) {
        setTemplates(demoTemplates);
      } else {
        const { data, error } = await supabase
          .from('document_templates')
          .select('*')
          .order('use_count', { ascending: false });

        if (error) throw error;
        setTemplates(data || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setTemplates(demoTemplates);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesFavorite = !showFavoritesOnly || template.is_favorite;
      return matchesSearch && matchesCategory && matchesFavorite;
    });
  }, [templates, searchTerm, selectedCategory, showFavoritesOnly]);

  const toggleFavorite = async (template) => {
    const newFavoriteStatus = !template.is_favorite;

    if (isDemoMode()) {
      setTemplates(prev => prev.map(t =>
        t.id === template.id ? { ...t, is_favorite: newFavoriteStatus } : t
      ));
    } else {
      const { error } = await supabase
        .from('document_templates')
        .update({ is_favorite: newFavoriteStatus })
        .eq('id', template.id);

      if (!error) {
        fetchTemplates();
      }
    }
  };

  const handleUseTemplate = (template) => {
    setSelectedTemplate(template);
    setVariableValues({});
    setShowUseModal(true);
  };

  const handlePreview = (template) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
  };

  const generateDocument = () => {
    if (!selectedTemplate) return;

    let doc = selectedTemplate.content;
    Object.entries(variableValues).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      doc = doc.replace(regex, value || `[${key}]`);
    });

    // Replace any remaining variables with placeholders
    doc = doc.replace(/\{\{(\w+)\}\}/g, '[$1]');

    setGeneratedDocument(doc);
  };

  const downloadDocument = () => {
    if (!generatedDocument) return;

    const blob = new Blob([generatedDocument], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate?.name || 'document'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Update use count
    if (isDemoMode()) {
      setTemplates(prev => prev.map(t =>
        t.id === selectedTemplate.id ? { ...t, use_count: t.use_count + 1 } : t
      ));
    }

    setShowUseModal(false);
    setVariableValues({});
    setGeneratedDocument('');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedDocument);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryStats = () => {
    const stats = {};
    templates.forEach(t => {
      stats[t.category] = (stats[t.category] || 0) + 1;
    });
    return stats;
  };

  const categoryStats = getCategoryStats();

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="h-7 w-7 text-blue-600" />
          Document Templates
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Create and manage reusable document templates with variable placeholders
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{templates.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Templates</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-yellow-600">{templates.filter(t => t.is_favorite).length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Favorites</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600">{templates.reduce((sum, t) => sum + t.use_count, 0)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Uses</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600">{Object.keys(categoryStats).length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar - Categories */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Categories</h3>
            <div className="space-y-1">
              {categories.map(category => {
                const IconComponent = category.icon;
                const count = category.id === 'all' ? templates.length : (categoryStats[category.id] || 0);
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      <span>{category.name}</span>
                    </div>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  showFavoritesOnly
                    ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Star className="h-4 w-4" />
                <span>Favorites Only</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Template
            </button>
          </div>

          {/* Templates Grid */}
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No templates found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm ? 'Try adjusting your search' : 'Create your first template to get started'}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Create Template
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                        <button
                          onClick={() => toggleFavorite(template)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          {template.is_favorite ? (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          ) : (
                            <StarOff className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Folder className="h-3 w-3" />
                      {template.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {template.variables?.length || 0} variables
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {template.use_count} uses
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <FileSignature className="h-4 w-4" />
                      Use Template
                    </button>
                    <button
                      onClick={() => handlePreview(template)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      title="Duplicate"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Use Template Modal */}
      {showUseModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Use Template: {selectedTemplate.name}
              </h2>
              <button
                onClick={() => {
                  setShowUseModal(false);
                  setVariableValues({});
                  setGeneratedDocument('');
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Variable Inputs */}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">Fill in Variables</h3>
                  <div className="space-y-4">
                    {selectedTemplate.variables?.map(variable => (
                      <div key={variable.name}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {variable.label}
                        </label>
                        {variable.type === 'textarea' ? (
                          <textarea
                            value={variableValues[variable.name] || ''}
                            onChange={(e) => setVariableValues(prev => ({
                              ...prev,
                              [variable.name]: e.target.value
                            }))}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        ) : variable.type === 'select' ? (
                          <select
                            value={variableValues[variable.name] || ''}
                            onChange={(e) => setVariableValues(prev => ({
                              ...prev,
                              [variable.name]: e.target.value
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="">Select...</option>
                            {variable.options?.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={variable.type === 'date' ? 'date' : variable.type === 'number' ? 'number' : 'text'}
                            value={variableValues[variable.name] || ''}
                            onChange={(e) => setVariableValues(prev => ({
                              ...prev,
                              [variable.name]: e.target.value
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={generateDocument}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FileText className="h-4 w-4" />
                    Generate Document
                  </button>
                </div>

                {/* Preview */}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">Document Preview</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 h-[400px] overflow-auto">
                    {generatedDocument ? (
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono">
                        {generatedDocument}
                      </pre>
                    ) : (
                      <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Fill in the variables and click "Generate Document" to see the preview</p>
                      </div>
                    )}
                  </div>

                  {generatedDocument && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={copyToClipboard}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Copy className="h-4 w-4" />
                        Copy to Clipboard
                      </button>
                      <button
                        onClick={downloadDocument}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedTemplate.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTemplate.description}</p>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Variables</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.variables?.map(v => (
                    <span
                      key={v.name}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm"
                    >
                      {v.label}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Template Content</h3>
                <pre className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono overflow-auto max-h-[400px]">
                  {selectedTemplate.content}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  handleUseTemplate(selectedTemplate);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FileSignature className="h-4 w-4" />
                Use This Template
              </button>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <CreateTemplateModal
          onClose={() => setShowCreateModal(false)}
          onSave={(template) => {
            if (isDemoMode()) {
              setTemplates(prev => [{
                ...template,
                id: Date.now().toString(),
                use_count: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                created_by: 'Current User'
              }, ...prev]);
            }
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

function CreateTemplateModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Operations',
    content: '',
    is_favorite: false
  });
  const [variables, setVariables] = useState([]);
  const [newVariable, setNewVariable] = useState({ name: '', label: '', type: 'text' });

  const extractVariables = () => {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = [...formData.content.matchAll(regex)];
    const uniqueVars = [...new Set(matches.map(m => m[1]))];

    const existingVarNames = variables.map(v => v.name);
    const newVars = uniqueVars
      .filter(name => !existingVarNames.includes(name))
      .map(name => ({
        name,
        label: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        type: 'text'
      }));

    if (newVars.length > 0) {
      setVariables(prev => [...prev, ...newVars]);
    }
  };

  const addVariable = () => {
    if (newVariable.name && newVariable.label) {
      setVariables(prev => [...prev, { ...newVariable }]);
      setNewVariable({ name: '', label: '', type: 'text' });
    }
  };

  const removeVariable = (index) => {
    setVariables(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      variables
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Template</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Standard Lease Agreement"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Brief description of the template"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {categories.filter(c => c.id !== 'all').map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Template Content *
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Use {"{{VARIABLE_NAME}}"} syntax for placeholders
                </p>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                  placeholder="Enter your template content here..."
                />
                <button
                  type="button"
                  onClick={extractVariables}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  Auto-extract variables from content
                </button>
              </div>
            </div>

            {/* Right Column - Variables */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">Variables</h3>

              <div className="space-y-2 mb-4 max-h-[300px] overflow-auto">
                {variables.map((variable, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{variable.label}</div>
                      <div className="text-xs text-gray-500">{`{{${variable.name}}}`} • {variable.type}</div>
                    </div>
                    <select
                      value={variable.type}
                      onChange={(e) => {
                        const newVars = [...variables];
                        newVars[index].type = e.target.value;
                        setVariables(newVars);
                      }}
                      className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="textarea">Long Text</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeVariable(index)}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Add Variable</h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newVariable.name}
                    onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value.toUpperCase().replace(/\s/g, '_') }))}
                    placeholder="VARIABLE_NAME"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                  />
                  <input
                    type="text"
                    value={newVariable.label}
                    onChange={(e) => setNewVariable(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="Display Label"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                  />
                  <div className="flex gap-2">
                    <select
                      value={newVariable.type}
                      onChange={(e) => setNewVariable(prev => ({ ...prev, type: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="textarea">Long Text</option>
                    </select>
                    <button
                      type="button"
                      onClick={addVariable}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_favorite}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_favorite: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Add to favorites</span>
              </label>
            </div>
          </div>
        </form>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (formData.name && formData.content) {
                onSave({ ...formData, variables });
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Template
          </button>
        </div>
      </div>
    </div>
  );
}
