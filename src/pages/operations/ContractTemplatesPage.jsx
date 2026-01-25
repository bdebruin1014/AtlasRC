import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit3,
  Copy,
  Trash2,
  FolderOpen,
  Clock,
  User,
  Tag,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Star,
  MoreHorizontal,
  Upload,
  Settings,
  Send,
  FileSignature,
  Building2,
  DollarSign,
  Home,
  Users,
  Briefcase,
  X
} from 'lucide-react';

const ContractTemplatesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [view, setView] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Mock template data
  const templates = [
    {
      id: 1,
      name: 'Purchase Agreement - Residential',
      description: 'Standard purchase agreement for single-family residential properties',
      category: 'purchase',
      type: 'Real Estate',
      version: '3.2',
      lastUpdated: '2025-01-15',
      updatedBy: 'Sarah Johnson',
      usageCount: 145,
      status: 'active',
      starred: true,
      mergeFields: ['buyer_name', 'seller_name', 'property_address', 'purchase_price', 'closing_date'],
    },
    {
      id: 2,
      name: 'Letter of Intent (LOI)',
      description: 'Non-binding letter of intent for property acquisitions',
      category: 'loi',
      type: 'Acquisition',
      version: '2.1',
      lastUpdated: '2025-01-10',
      updatedBy: 'John Smith',
      usageCount: 89,
      status: 'active',
      starred: true,
      mergeFields: ['buyer_name', 'property_address', 'offer_price', 'due_diligence_period', 'closing_timeline'],
    },
    {
      id: 3,
      name: 'Construction Contract',
      description: 'General contractor agreement for construction projects',
      category: 'construction',
      type: 'Construction',
      version: '4.0',
      lastUpdated: '2025-01-08',
      updatedBy: 'David Wilson',
      usageCount: 67,
      status: 'active',
      starred: false,
      mergeFields: ['contractor_name', 'project_address', 'contract_amount', 'start_date', 'completion_date'],
    },
    {
      id: 4,
      name: 'Lease Agreement - Commercial',
      description: 'Commercial property lease agreement template',
      category: 'lease',
      type: 'Leasing',
      version: '2.3',
      lastUpdated: '2025-01-05',
      updatedBy: 'Emily Chen',
      usageCount: 34,
      status: 'active',
      starred: false,
      mergeFields: ['tenant_name', 'property_address', 'monthly_rent', 'lease_term', 'start_date'],
    },
    {
      id: 5,
      name: 'Assignment Agreement',
      description: 'Contract assignment for wholesale deals',
      category: 'purchase',
      type: 'Wholesale',
      version: '1.5',
      lastUpdated: '2024-12-20',
      updatedBy: 'Michael Brown',
      usageCount: 52,
      status: 'active',
      starred: false,
      mergeFields: ['assignor_name', 'assignee_name', 'original_contract_date', 'assignment_fee'],
    },
    {
      id: 6,
      name: 'Joint Venture Agreement',
      description: 'Partnership agreement for real estate joint ventures',
      category: 'partnership',
      type: 'Partnership',
      version: '2.0',
      lastUpdated: '2024-12-15',
      updatedBy: 'Sarah Johnson',
      usageCount: 28,
      status: 'active',
      starred: true,
      mergeFields: ['partner_names', 'project_name', 'capital_contributions', 'profit_split', 'management_fees'],
    },
    {
      id: 7,
      name: 'Promissory Note',
      description: 'Standard promissory note for seller financing',
      category: 'financing',
      type: 'Financing',
      version: '1.8',
      lastUpdated: '2024-12-10',
      updatedBy: 'Patricia Lee',
      usageCount: 41,
      status: 'active',
      starred: false,
      mergeFields: ['borrower_name', 'lender_name', 'principal_amount', 'interest_rate', 'maturity_date'],
    },
    {
      id: 8,
      name: 'Deed of Trust',
      description: 'Security instrument for real estate financing',
      category: 'financing',
      type: 'Financing',
      version: '2.2',
      lastUpdated: '2024-12-05',
      updatedBy: 'Patricia Lee',
      usageCount: 38,
      status: 'active',
      starred: false,
      mergeFields: ['trustor_name', 'beneficiary_name', 'trustee_name', 'property_description', 'loan_amount'],
    },
    {
      id: 9,
      name: 'Purchase Agreement - Land',
      description: 'Purchase agreement for vacant land acquisitions',
      category: 'purchase',
      type: 'Land',
      version: '2.5',
      lastUpdated: '2024-11-28',
      updatedBy: 'John Smith',
      usageCount: 23,
      status: 'draft',
      starred: false,
      mergeFields: ['buyer_name', 'seller_name', 'parcel_number', 'acreage', 'purchase_price'],
    },
    {
      id: 10,
      name: 'Listing Agreement',
      description: 'Exclusive listing agreement for property sales',
      category: 'listing',
      type: 'Sales',
      version: '1.4',
      lastUpdated: '2024-11-20',
      updatedBy: 'Emily Chen',
      usageCount: 15,
      status: 'archived',
      starred: false,
      mergeFields: ['seller_name', 'property_address', 'list_price', 'commission_rate', 'listing_period'],
    },
  ];

  const categories = [
    { id: 'all', name: 'All Templates', icon: FolderOpen, count: templates.length },
    { id: 'purchase', name: 'Purchase Agreements', icon: Home, count: templates.filter(t => t.category === 'purchase').length },
    { id: 'loi', name: 'Letters of Intent', icon: FileText, count: templates.filter(t => t.category === 'loi').length },
    { id: 'construction', name: 'Construction', icon: Building2, count: templates.filter(t => t.category === 'construction').length },
    { id: 'lease', name: 'Lease Agreements', icon: Briefcase, count: templates.filter(t => t.category === 'lease').length },
    { id: 'partnership', name: 'Partnerships', icon: Users, count: templates.filter(t => t.category === 'partnership').length },
    { id: 'financing', name: 'Financing', icon: DollarSign, count: templates.filter(t => t.category === 'financing').length },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'draft':
        return 'text-yellow-600 bg-yellow-100';
      case 'archived':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.id === category);
    return cat?.icon || FileText;
  };

  const filteredTemplates = templates.filter(template => {
    if (selectedCategory !== 'all' && template.category !== selectedCategory) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        template.name.toLowerCase().includes(search) ||
        template.description.toLowerCase().includes(search) ||
        template.type.toLowerCase().includes(search)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <FileSignature className="w-7 h-7 text-blue-600" />
                Contract Templates
              </h1>
              <p className="text-gray-600 mt-1">
                Manage reusable contract templates with merge fields
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <Upload className="w-4 h-4" />
                Import
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                New Template
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setView('grid')}
                className={`p-2 rounded ${view === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 rounded ${view === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-2">
              {categories.map(category => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{category.count}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Stats</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Templates</span>
                  <span className="font-medium text-gray-900">{templates.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Active</span>
                  <span className="font-medium text-green-600">{templates.filter(t => t.status === 'active').length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Uses</span>
                  <span className="font-medium text-gray-900">{templates.reduce((sum, t) => sum + t.usageCount, 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {view === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map(template => {
                  const CategoryIcon = getCategoryIcon(template.category);
                  return (
                    <div
                      key={template.id}
                      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer group"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <CategoryIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex items-center gap-1">
                          {template.starred && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(template.status)}`}>
                            {template.status}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-medium text-gray-900 mb-1 group-hover:text-blue-600">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {template.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          v{template.version}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {template.lastUpdated}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500">
                          Used {template.usageCount} times
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                            <Copy className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Template</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Category</th>
                      <th className="text-center px-4 py-3 text-sm font-medium text-gray-700">Version</th>
                      <th className="text-center px-4 py-3 text-sm font-medium text-gray-700">Uses</th>
                      <th className="text-center px-4 py-3 text-sm font-medium text-gray-700">Status</th>
                      <th className="text-center px-4 py-3 text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTemplates.map(template => (
                      <tr key={template.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">{template.name}</p>
                              <p className="text-xs text-gray-500">{template.type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600 capitalize">{template.category}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-gray-600">v{template.version}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-gray-600">{template.usageCount}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(template.status)}`}>
                            {template.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                              <Copy className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filteredTemplates.length === 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No templates found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? 'Try a different search term' : 'Create your first template to get started'}
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  New Template
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedTemplate.name}</h2>
                <p className="text-sm text-gray-500">{selectedTemplate.type}</p>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600">{selectedTemplate.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Version</h3>
                  <p className="text-gray-900">v{selectedTemplate.version}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Status</h3>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(selectedTemplate.status)}`}>
                    {selectedTemplate.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Last Updated</h3>
                  <p className="text-gray-900">{selectedTemplate.lastUpdated}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Updated By</h3>
                  <p className="text-gray-900">{selectedTemplate.updatedBy}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Merge Fields</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.mergeFields.map((field, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded font-mono"
                    >
                      {`{{${field}}}`}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Send className="w-4 h-4" />
                  Use Template
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractTemplatesPage;
