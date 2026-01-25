// src/components/DocumentExpirationTracker.jsx
// Track and manage document expirations with renewal reminders

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Calendar, AlertTriangle, AlertCircle, CheckCircle,
  Clock, Plus, X, ChevronDown, ChevronUp, Search, Filter,
  Bell, Upload, ExternalLink, MoreHorizontal, RefreshCw,
  Shield, Building2, FileCheck, Award, Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================
// CONSTANTS
// ============================================

const DOCUMENT_TYPES = {
  insurance_gl: { label: 'General Liability Insurance', category: 'insurance', icon: Shield },
  insurance_builders_risk: { label: "Builder's Risk Insurance", category: 'insurance', icon: Shield },
  insurance_workers_comp: { label: "Workers' Compensation", category: 'insurance', icon: Shield },
  insurance_auto: { label: 'Auto Insurance', category: 'insurance', icon: Shield },
  insurance_umbrella: { label: 'Umbrella Insurance', category: 'insurance', icon: Shield },
  insurance_professional: { label: 'Professional Liability', category: 'insurance', icon: Shield },
  permit_building: { label: 'Building Permit', category: 'permit', icon: FileCheck },
  permit_electrical: { label: 'Electrical Permit', category: 'permit', icon: FileCheck },
  permit_plumbing: { label: 'Plumbing Permit', category: 'permit', icon: FileCheck },
  permit_mechanical: { label: 'Mechanical Permit', category: 'permit', icon: FileCheck },
  permit_grading: { label: 'Grading Permit', category: 'permit', icon: FileCheck },
  permit_demolition: { label: 'Demolition Permit', category: 'permit', icon: FileCheck },
  permit_zoning: { label: 'Zoning Permit', category: 'permit', icon: FileCheck },
  permit_environmental: { label: 'Environmental Permit', category: 'permit', icon: FileCheck },
  license_contractor: { label: 'Contractor License', category: 'license', icon: Award },
  license_business: { label: 'Business License', category: 'license', icon: Award },
  license_professional: { label: 'Professional License', category: 'license', icon: Award },
  bond_performance: { label: 'Performance Bond', category: 'bond', icon: Briefcase },
  bond_payment: { label: 'Payment Bond', category: 'bond', icon: Briefcase },
  bond_license: { label: 'License Bond', category: 'bond', icon: Briefcase },
  certificate_occupancy: { label: 'Certificate of Occupancy', category: 'certificate', icon: Building2 },
  certificate_completion: { label: 'Certificate of Completion', category: 'certificate', icon: Building2 },
  warranty: { label: 'Warranty', category: 'warranty', icon: FileText },
  lease: { label: 'Lease Agreement', category: 'contract', icon: FileText },
  contract: { label: 'Contract', category: 'contract', icon: FileText },
  other: { label: 'Other', category: 'other', icon: FileText },
};

const CATEGORIES = [
  { id: 'all', label: 'All Documents' },
  { id: 'insurance', label: 'Insurance', icon: Shield, color: 'text-blue-600 bg-blue-50' },
  { id: 'permit', label: 'Permits', icon: FileCheck, color: 'text-emerald-600 bg-emerald-50' },
  { id: 'license', label: 'Licenses', icon: Award, color: 'text-purple-600 bg-purple-50' },
  { id: 'bond', label: 'Bonds', icon: Briefcase, color: 'text-amber-600 bg-amber-50' },
  { id: 'certificate', label: 'Certificates', icon: Building2, color: 'text-indigo-600 bg-indigo-50' },
  { id: 'contract', label: 'Contracts', icon: FileText, color: 'text-gray-600 bg-gray-50' },
];

const STATUS_COLORS = {
  active: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  expiring_soon: 'text-amber-600 bg-amber-50 border-amber-200',
  expired: 'text-red-600 bg-red-50 border-red-200',
  renewed: 'text-blue-600 bg-blue-50 border-blue-200',
  cancelled: 'text-gray-600 bg-gray-50 border-gray-200',
};

// ============================================
// DEMO DATA
// ============================================

const DEMO_DOCUMENTS = [
  {
    id: 'doc-1',
    document_name: 'General Liability - ABC Insurance',
    document_type: 'insurance_gl',
    document_category: 'insurance',
    vendor_name: 'ABC Contractors',
    issue_date: '2024-01-15',
    expiration_date: '2025-01-15',
    status: 'active',
    coverage_amount: 2000000,
    policy_number: 'GL-2024-001234',
    project_id: 'proj-1',
  },
  {
    id: 'doc-2',
    document_name: 'Building Permit - Highland Park',
    document_type: 'permit_building',
    document_category: 'permit',
    vendor_name: 'City of Austin',
    issue_date: '2024-06-01',
    expiration_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 12 days
    status: 'expiring_soon',
    policy_number: 'BP-2024-5678',
    project_id: 'proj-1',
  },
  {
    id: 'doc-3',
    document_name: "Workers' Comp - XYZ Electric",
    document_type: 'insurance_workers_comp',
    document_category: 'insurance',
    vendor_name: 'XYZ Electric',
    issue_date: '2024-03-01',
    expiration_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
    status: 'expired',
    coverage_amount: 1000000,
    policy_number: 'WC-2024-9012',
    project_id: 'proj-1',
  },
  {
    id: 'doc-4',
    document_name: 'Contractor License - Smith Plumbing',
    document_type: 'license_contractor',
    document_category: 'license',
    vendor_name: 'Smith Plumbing LLC',
    issue_date: '2023-06-15',
    expiration_date: '2025-06-15',
    status: 'active',
    policy_number: 'LIC-45678',
    project_id: 'proj-1',
  },
  {
    id: 'doc-5',
    document_name: 'Performance Bond - Main Contract',
    document_type: 'bond_performance',
    document_category: 'bond',
    vendor_name: 'Premier Builders Inc',
    issue_date: '2024-01-01',
    expiration_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 25 days
    status: 'expiring_soon',
    coverage_amount: 5000000,
    policy_number: 'PB-2024-1111',
    project_id: 'proj-1',
  },
  {
    id: 'doc-6',
    document_name: 'Electrical Permit - Phase 2',
    document_type: 'permit_electrical',
    document_category: 'permit',
    vendor_name: 'City of Austin',
    issue_date: '2024-08-01',
    expiration_date: '2025-08-01',
    status: 'active',
    policy_number: 'EP-2024-3456',
    project_id: 'proj-2',
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatCurrency = (value) => {
  if (!value) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getDaysUntilExpiry = (expirationDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expirationDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
};

const getExpiryLabel = (days) => {
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  if (days <= 30) return `${days} days left`;
  if (days <= 60) return `${Math.ceil(days / 7)} weeks left`;
  return `${Math.ceil(days / 30)} months left`;
};

// ============================================
// SUB-COMPONENTS
// ============================================

function DocumentCard({ document, onView, onRenew, onEdit }) {
  const typeInfo = DOCUMENT_TYPES[document.document_type] || DOCUMENT_TYPES.other;
  const Icon = typeInfo.icon;
  const daysUntilExpiry = getDaysUntilExpiry(document.expiration_date);
  const isExpired = daysUntilExpiry < 0;
  const isExpiringSoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 30;

  return (
    <div
      className={cn(
        'bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer',
        isExpired && 'border-red-200 bg-red-50/30',
        isExpiringSoon && !isExpired && 'border-amber-200 bg-amber-50/30'
      )}
      onClick={() => onView?.(document)}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            'p-2 rounded-lg',
            CATEGORIES.find((c) => c.id === document.document_category)?.color || 'text-gray-600 bg-gray-50'
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-medium text-gray-900 truncate">{document.document_name}</h4>
              <p className="text-sm text-gray-500">{typeInfo.label}</p>
            </div>
            <span
              className={cn(
                'text-xs px-2 py-1 rounded-full border font-medium capitalize whitespace-nowrap',
                STATUS_COLORS[document.status]
              )}
            >
              {document.status.replace('_', ' ')}
            </span>
          </div>

          {/* Details */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {document.vendor_name && (
              <span className="text-gray-500">
                <span className="font-medium text-gray-700">{document.vendor_name}</span>
              </span>
            )}
            {document.policy_number && (
              <span className="text-gray-500">#{document.policy_number}</span>
            )}
            {document.coverage_amount && (
              <span className="text-gray-500">Coverage: {formatCurrency(document.coverage_amount)}</span>
            )}
          </div>

          {/* Expiry */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className={cn('h-4 w-4', isExpired ? 'text-red-500' : isExpiringSoon ? 'text-amber-500' : 'text-gray-400')} />
              <span className={cn('text-sm', isExpired ? 'text-red-600 font-medium' : isExpiringSoon ? 'text-amber-600 font-medium' : 'text-gray-600')}>
                {isExpired ? 'Expired' : 'Expires'} {formatDate(document.expiration_date)}
              </span>
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  isExpired ? 'bg-red-100 text-red-700' : isExpiringSoon ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                )}
              >
                {getExpiryLabel(daysUntilExpiry)}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {(isExpired || isExpiringSoon) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRenew?.(document);
                  }}
                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Renew
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(document);
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExpirationSummary({ documents }) {
  const summary = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return documents.reduce(
      (acc, doc) => {
        const days = getDaysUntilExpiry(doc.expiration_date);
        if (days < 0) acc.expired++;
        else if (days <= 7) acc.critical++;
        else if (days <= 30) acc.warning++;
        else acc.active++;
        return acc;
      },
      { expired: 0, critical: 0, warning: 0, active: 0 }
    );
  }, [documents]);

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-2xl font-bold text-red-700">{summary.expired}</span>
        </div>
        <p className="text-sm text-red-600 mt-1">Expired</p>
      </div>
      <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <span className="text-2xl font-bold text-orange-700">{summary.critical}</span>
        </div>
        <p className="text-sm text-orange-600 mt-1">Within 7 Days</p>
      </div>
      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-600" />
          <span className="text-2xl font-bold text-amber-700">{summary.warning}</span>
        </div>
        <p className="text-sm text-amber-600 mt-1">Within 30 Days</p>
      </div>
      <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          <span className="text-2xl font-bold text-emerald-700">{summary.active}</span>
        </div>
        <p className="text-sm text-emerald-600 mt-1">Active</p>
      </div>
    </div>
  );
}

function AddDocumentModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState({
    document_name: '',
    document_type: 'insurance_gl',
    vendor_name: '',
    expiration_date: '',
    policy_number: '',
    coverage_amount: '',
    notes: '',
  });

  if (!isOpen) return null;

  const handleSave = () => {
    onSave?.(form);
    setForm({
      document_name: '',
      document_type: 'insurance_gl',
      vendor_name: '',
      expiration_date: '',
      policy_number: '',
      coverage_amount: '',
      notes: '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Add Document</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
            <input
              type="text"
              value={form.document_name}
              onChange={(e) => setForm({ ...form, document_name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g., General Liability - ABC Insurance"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
            <select
              value={form.document_type}
              onChange={(e) => setForm({ ...form, document_type: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {Object.entries(DOCUMENT_TYPES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor/Issuer</label>
            <input
              type="text"
              value={form.vendor_name}
              onChange={(e) => setForm({ ...form, vendor_name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g., ABC Contractors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
              <input
                type="date"
                value={form.expiration_date}
                onChange={(e) => setForm({ ...form, expiration_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Policy/Permit Number</label>
              <input
                type="text"
                value={form.policy_number}
                onChange={(e) => setForm({ ...form, policy_number: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g., GL-2024-001"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Amount (if applicable)</label>
            <input
              type="number"
              value={form.coverage_amount}
              onChange={(e) => setForm({ ...form, coverage_amount: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g., 2000000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Any additional notes..."
            />
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Upload document file</p>
            <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-[#2F855A] hover:bg-[#276749] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Document
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function DocumentExpirationTracker({
  projectId,
  documents = DEMO_DOCUMENTS,
  onAddDocument,
  onViewDocument,
  onRenewDocument,
  onEditDocument,
}) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortBy, setSortBy] = useState('expiration'); // expiration, name, category

  // Filter documents
  const filteredDocuments = useMemo(() => {
    let filtered = [...documents];

    // Filter by project if provided
    if (projectId) {
      filtered = filtered.filter((d) => d.project_id === projectId);
    }

    // Search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.document_name.toLowerCase().includes(searchLower) ||
          d.vendor_name?.toLowerCase().includes(searchLower) ||
          d.policy_number?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((d) => d.document_category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'expiring') {
        filtered = filtered.filter((d) => {
          const days = getDaysUntilExpiry(d.expiration_date);
          return days >= 0 && days <= 30;
        });
      } else if (statusFilter === 'expired') {
        filtered = filtered.filter((d) => getDaysUntilExpiry(d.expiration_date) < 0);
      } else {
        filtered = filtered.filter((d) => d.status === statusFilter);
      }
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'expiration') {
        return new Date(a.expiration_date) - new Date(b.expiration_date);
      }
      if (sortBy === 'name') {
        return a.document_name.localeCompare(b.document_name);
      }
      if (sortBy === 'category') {
        return a.document_category.localeCompare(b.document_category);
      }
      return 0;
    });

    return filtered;
  }, [documents, projectId, search, categoryFilter, statusFilter, sortBy]);

  const handleAddDocument = (doc) => {
    onAddDocument?.(doc);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <ExpirationSummary documents={projectId ? documents.filter((d) => d.project_id === projectId) : documents} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {CATEGORIES.slice(0, 5).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                categoryFilter === cat.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Status</option>
          <option value="expiring">Expiring Soon</option>
          <option value="expired">Expired</option>
          <option value="active">Active</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="expiration">Sort by Expiration</option>
          <option value="name">Sort by Name</option>
          <option value="category">Sort by Category</option>
        </select>

        {/* Add Button */}
        <Button onClick={() => setShowAddModal(true)} className="bg-[#2F855A] hover:bg-[#276749] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Document
        </Button>
      </div>

      {/* Document List */}
      <div className="space-y-3">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No documents found</p>
            <Button variant="outline" className="mt-4" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Document
            </Button>
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onView={onViewDocument}
              onRenew={onRenewDocument}
              onEdit={onEditDocument}
            />
          ))
        )}
      </div>

      {/* Add Document Modal */}
      <AddDocumentModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSave={handleAddDocument} />
    </div>
  );
}

// ============================================
// COMPACT EXPIRATION ALERT
// ============================================

export function ExpirationAlert({ documents = [], limit = 5 }) {
  const expiringDocs = useMemo(() => {
    return documents
      .filter((doc) => {
        const days = getDaysUntilExpiry(doc.expiration_date);
        return days <= 30;
      })
      .sort((a, b) => new Date(a.expiration_date) - new Date(b.expiration_date))
      .slice(0, limit);
  }, [documents, limit]);

  if (expiringDocs.length === 0) return null;

  const expiredCount = expiringDocs.filter((d) => getDaysUntilExpiry(d.expiration_date) < 0).length;

  return (
    <div className={cn('rounded-lg p-4 border', expiredCount > 0 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200')}>
      <div className="flex items-center gap-2 mb-3">
        {expiredCount > 0 ? (
          <AlertCircle className="h-5 w-5 text-red-600" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-amber-600" />
        )}
        <h4 className={cn('font-semibold', expiredCount > 0 ? 'text-red-900' : 'text-amber-900')}>
          {expiredCount > 0 ? `${expiredCount} Expired Document${expiredCount > 1 ? 's' : ''}` : 'Documents Expiring Soon'}
        </h4>
      </div>
      <div className="space-y-2">
        {expiringDocs.map((doc) => {
          const days = getDaysUntilExpiry(doc.expiration_date);
          const isExpired = days < 0;

          return (
            <div key={doc.id} className="flex items-center justify-between text-sm">
              <span className={isExpired ? 'text-red-700' : 'text-amber-700'}>{doc.document_name}</span>
              <span className={cn('font-medium', isExpired ? 'text-red-600' : 'text-amber-600')}>
                {getExpiryLabel(days)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
