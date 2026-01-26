import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, Plus, Search, Calendar, Shield, FileText,
  Clock, Check, X, Edit2, Trash2, RefreshCw, Bell,
  Building2, User, Download, Filter, Eye, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { documentExpirationService } from '@/services/documentExpirationService';

const DOCUMENT_TYPES = {
  insurance_gl: 'General Liability',
  insurance_builders_risk: "Builder's Risk",
  insurance_workers_comp: "Workers' Comp",
  insurance_auto: 'Auto Insurance',
  insurance_umbrella: 'Umbrella Policy',
  insurance_professional: 'Professional Liability',
  permit_building: 'Building Permit',
  permit_electrical: 'Electrical Permit',
  permit_plumbing: 'Plumbing Permit',
  permit_mechanical: 'Mechanical Permit',
  permit_grading: 'Grading Permit',
  permit_demolition: 'Demolition Permit',
  permit_zoning: 'Zoning Approval',
  permit_environmental: 'Environmental Permit',
  license_contractor: 'Contractor License',
  license_business: 'Business License',
  license_professional: 'Professional License',
  bond_performance: 'Performance Bond',
  bond_payment: 'Payment Bond',
  bond_license: 'License Bond',
  certificate_occupancy: 'Certificate of Occupancy',
  certificate_completion: 'Certificate of Completion',
  warranty: 'Warranty',
  lease: 'Lease',
  contract: 'Contract',
  other: 'Other',
};

const CATEGORIES = [
  { key: 'insurance', label: 'Insurance', icon: Shield, color: 'text-blue-600 bg-blue-100' },
  { key: 'permit', label: 'Permits', icon: FileText, color: 'text-purple-600 bg-purple-100' },
  { key: 'license', label: 'Licenses', icon: User, color: 'text-green-600 bg-green-100' },
  { key: 'bond', label: 'Bonds', icon: Building2, color: 'text-amber-600 bg-amber-100' },
  { key: 'certificate', label: 'Certificates', icon: FileText, color: 'text-indigo-600 bg-indigo-100' },
  { key: 'other', label: 'Other', icon: FileText, color: 'text-gray-600 bg-gray-100' },
];

const STATUS_CONFIG = {
  expired: { label: 'Expired', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
  expiring_soon: { label: 'Expiring Soon', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  active: { label: 'Active', color: 'bg-green-100 text-green-700 border-green-200', icon: Check },
  renewed: { label: 'Renewed', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: RefreshCw },
};

const DocumentExpirationsPage = ({ projectId }) => {
  const [expirations, setExpirations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    document_name: '',
    document_type: 'other',
    document_category: 'other',
    vendor_name: '',
    policy_number: '',
    expiration_date: '',
    reminder_days: 30,
    notes: '',
  });

  const [renewDate, setRenewDate] = useState('');

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [expRes, summaryRes] = await Promise.all([
        documentExpirationService.getAll({ projectId }),
        documentExpirationService.getSummary(projectId),
      ]);

      setExpirations(expRes.data || []);
      setSummary(summaryRes.data || null);
    } catch (err) {
      console.error('Error fetching document expirations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      // Determine category from document type
      let category = formData.document_category;
      if (formData.document_type.startsWith('insurance_')) category = 'insurance';
      else if (formData.document_type.startsWith('permit_')) category = 'permit';
      else if (formData.document_type.startsWith('license_')) category = 'license';
      else if (formData.document_type.startsWith('bond_')) category = 'bond';
      else if (formData.document_type.startsWith('certificate_')) category = 'certificate';

      if (selectedDoc) {
        await documentExpirationService.update(selectedDoc.id, {
          ...formData,
          document_category: category,
        });
      } else {
        await documentExpirationService.create({
          ...formData,
          document_category: category,
          project_id: projectId,
        });
      }

      await fetchData();
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('Error saving document:', err);
    }
  };

  const handleRenew = async () => {
    if (!selectedDoc || !renewDate) return;

    try {
      await documentExpirationService.renew(selectedDoc.id, renewDate);
      await fetchData();
      setShowRenewModal(false);
      setSelectedDoc(null);
      setRenewDate('');
    } catch (err) {
      console.error('Error renewing document:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document tracker?')) return;

    try {
      await documentExpirationService.delete(id);
      await fetchData();
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      document_name: '',
      document_type: 'other',
      document_category: 'other',
      vendor_name: '',
      policy_number: '',
      expiration_date: '',
      reminder_days: 30,
      notes: '',
    });
    setSelectedDoc(null);
  };

  const openEdit = (doc) => {
    setSelectedDoc(doc);
    setFormData({
      document_name: doc.document_name,
      document_type: doc.document_type,
      document_category: doc.document_category,
      vendor_name: doc.vendor_name || '',
      policy_number: doc.policy_number || doc.permit_number || doc.license_number || doc.bond_number || '',
      expiration_date: doc.expiration_date,
      reminder_days: doc.reminder_days || 30,
      notes: doc.notes || '',
    });
    setShowModal(true);
  };

  const openRenew = (doc) => {
    setSelectedDoc(doc);
    // Set default renewal date to 1 year from current expiration
    const currentExp = new Date(doc.expiration_date);
    const newExp = new Date(currentExp.setFullYear(currentExp.getFullYear() + 1));
    setRenewDate(newExp.toISOString().split('T')[0]);
    setShowRenewModal(true);
  };

  const filteredExpirations = expirations.filter(exp => {
    const matchesStatus = filterStatus === 'all' || exp.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || exp.document_category === filterCategory;
    const matchesSearch = !searchQuery ||
      exp.document_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.vendor_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntil = (dateStr) => {
    if (!dateStr) return null;
    const days = Math.floor((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-pulse">Loading document expirations...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Document Expirations
          </h1>
          <p className="text-sm text-gray-500">Track expiring insurance, permits, licenses, and bonds</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />Export
          </Button>
          <Button
            className="bg-[#047857] hover:bg-[#065f46]"
            onClick={() => { resetForm(); setShowModal(true); }}
          >
            <Plus className="w-4 h-4 mr-1" />Track Document
          </Button>
        </div>
      </div>

      {/* Alert Banner for Expired/Expiring */}
      {(summary?.expired > 0 || summary?.expiringSoon > 0) && (
        <div className={cn(
          "mb-6 rounded-lg p-4 flex items-center gap-3",
          summary?.expired > 0 ? "bg-red-50 border border-red-200" : "bg-amber-50 border border-amber-200"
        )}>
          <AlertTriangle className={cn("w-5 h-5", summary?.expired > 0 ? "text-red-600" : "text-amber-600")} />
          <div className="flex-1">
            {summary?.expired > 0 && (
              <p className="text-red-700 font-medium">
                {summary.expired} document{summary.expired > 1 ? 's have' : ' has'} expired!
              </p>
            )}
            {summary?.expiringSoon > 0 && (
              <p className={cn(summary?.expired > 0 ? "text-red-600" : "text-amber-700")}>
                {summary.expiringSoon} document{summary.expiringSoon > 1 ? 's' : ''} expiring soon
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => setFilterStatus('expired')}>
            View Alerts
          </Button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Tracked</p>
          <p className="text-2xl font-semibold">{summary?.total || 0}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-red-500">
          <p className="text-sm text-gray-500">Expired</p>
          <p className="text-2xl font-semibold text-red-600">{summary?.expired || 0}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-amber-500">
          <p className="text-sm text-gray-500">Expiring Soon</p>
          <p className="text-2xl font-semibold text-amber-600">{summary?.expiringSoon || 0}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-semibold text-green-600">{summary?.active || 0}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Within 30 Days</p>
          <p className="text-2xl font-semibold">{summary?.within30Days || 0}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Within 90 Days</p>
          <p className="text-2xl font-semibold">{summary?.within90Days || 0}</p>
        </div>
      </div>

      {/* Category Summary */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <h3 className="font-medium mb-3">By Category</h3>
        <div className="flex gap-4">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              className={cn(
                "flex-1 rounded-lg p-3 text-center transition-colors",
                filterCategory === cat.key ? "ring-2 ring-[#047857]" : "",
                cat.color
              )}
              onClick={() => setFilterCategory(filterCategory === cat.key ? 'all' : cat.key)}
            >
              <cat.icon className="w-5 h-5 mx-auto mb-1" />
              <p className="text-xs font-medium">{cat.label}</p>
              <p className="text-lg font-semibold">{summary?.byCategory?.[cat.key] || 0}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search documents..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat.key} value={cat.key}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Document</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-left px-4 py-3 font-medium">Vendor/Issuer</th>
              <th className="text-left px-4 py-3 font-medium">Reference #</th>
              <th className="text-left px-4 py-3 font-medium">Expiration</th>
              <th className="text-left px-4 py-3 font-medium">Days Left</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="w-28 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredExpirations.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No documents found
                </td>
              </tr>
            ) : (
              filteredExpirations.map((doc) => {
                const daysLeft = getDaysUntil(doc.expiration_date);
                const isExpired = daysLeft !== null && daysLeft < 0;
                const isExpiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= (doc.reminder_days || 30);

                return (
                  <tr
                    key={doc.id}
                    className={cn(
                      "hover:bg-gray-50",
                      isExpired && "bg-red-50",
                      isExpiringSoon && !isExpired && "bg-amber-50"
                    )}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium">{doc.document_name}</p>
                      {doc.notes && <p className="text-xs text-gray-500 truncate max-w-[200px]">{doc.notes}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {DOCUMENT_TYPES[doc.document_type] || doc.document_type}
                    </td>
                    <td className="px-4 py-3">{doc.vendor_name || '-'}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {doc.policy_number || doc.permit_number || doc.license_number || doc.bond_number || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(isExpired && "text-red-600 font-medium", isExpiringSoon && !isExpired && "text-amber-600 font-medium")}>
                        {formatDate(doc.expiration_date)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {daysLeft !== null && (
                        <span className={cn(
                          "font-medium",
                          isExpired && "text-red-600",
                          isExpiringSoon && !isExpired && "text-amber-600",
                          !isExpired && !isExpiringSoon && "text-green-600"
                        )}>
                          {isExpired ? `${Math.abs(daysLeft)} days ago` : `${daysLeft} days`}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-1 rounded text-xs border", STATUS_CONFIG[doc.status]?.color)}>
                        {STATUS_CONFIG[doc.status]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <button
                          className="p-1 hover:bg-blue-100 rounded"
                          onClick={() => openRenew(doc)}
                          title="Renew"
                        >
                          <RefreshCw className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          className="p-1 hover:bg-gray-100 rounded"
                          onClick={() => openEdit(doc)}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          className="p-1 hover:bg-red-100 rounded"
                          onClick={() => handleDelete(doc.id)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">
                {selectedDoc ? 'Edit Document' : 'Track New Document'}
              </h3>
              <button onClick={() => { setShowModal(false); resetForm(); }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Document Name *</label>
                <Input
                  value={formData.document_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, document_name: e.target.value }))}
                  placeholder="e.g., General Liability Insurance - ABC Corp"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Document Type *</label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={formData.document_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, document_type: e.target.value }))}
                >
                  <optgroup label="Insurance">
                    <option value="insurance_gl">General Liability</option>
                    <option value="insurance_builders_risk">Builder's Risk</option>
                    <option value="insurance_workers_comp">Workers' Compensation</option>
                    <option value="insurance_auto">Auto Insurance</option>
                    <option value="insurance_umbrella">Umbrella Policy</option>
                  </optgroup>
                  <optgroup label="Permits">
                    <option value="permit_building">Building Permit</option>
                    <option value="permit_electrical">Electrical Permit</option>
                    <option value="permit_plumbing">Plumbing Permit</option>
                    <option value="permit_mechanical">Mechanical Permit</option>
                    <option value="permit_grading">Grading Permit</option>
                  </optgroup>
                  <optgroup label="Licenses">
                    <option value="license_contractor">Contractor License</option>
                    <option value="license_business">Business License</option>
                    <option value="license_professional">Professional License</option>
                  </optgroup>
                  <optgroup label="Bonds">
                    <option value="bond_performance">Performance Bond</option>
                    <option value="bond_payment">Payment Bond</option>
                    <option value="bond_license">License Bond</option>
                  </optgroup>
                  <optgroup label="Other">
                    <option value="certificate_occupancy">Certificate of Occupancy</option>
                    <option value="warranty">Warranty</option>
                    <option value="contract">Contract</option>
                    <option value="other">Other</option>
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Vendor / Issuer</label>
                  <Input
                    value={formData.vendor_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, vendor_name: e.target.value }))}
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Policy / Reference #</label>
                  <Input
                    value={formData.policy_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, policy_number: e.target.value }))}
                    placeholder="Policy or permit number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Expiration Date *</label>
                  <Input
                    type="date"
                    value={formData.expiration_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiration_date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Reminder (days before)</label>
                  <Input
                    type="number"
                    value={formData.reminder_days}
                    onChange={(e) => setFormData(prev => ({ ...prev, reminder_days: parseInt(e.target.value) || 30 }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Notes</label>
                <textarea
                  className="w-full border rounded-md px-3 py-2"
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 sticky bottom-0">
              <Button variant="outline" onClick={() => { setShowModal(false); resetForm(); }}>
                Cancel
              </Button>
              <Button
                className="bg-[#047857] hover:bg-[#065f46]"
                onClick={handleSubmit}
                disabled={!formData.document_name || !formData.expiration_date}
              >
                <Check className="w-4 h-4 mr-1" />
                {selectedDoc ? 'Update' : 'Track'} Document
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Renew Modal */}
      {showRenewModal && selectedDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Renew Document</h3>
              <button onClick={() => { setShowRenewModal(false); setSelectedDoc(null); }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Document</p>
                <p className="font-medium">{selectedDoc.document_name}</p>
                <p className="text-sm text-gray-500 mt-2">Current Expiration</p>
                <p className="font-medium text-red-600">{formatDate(selectedDoc.expiration_date)}</p>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">New Expiration Date *</label>
                <Input
                  type="date"
                  value={renewDate}
                  onChange={(e) => setRenewDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => { setShowRenewModal(false); setSelectedDoc(null); }}>
                Cancel
              </Button>
              <Button
                className="bg-[#047857] hover:bg-[#065f46]"
                onClick={handleRenew}
                disabled={!renewDate}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Renew Document
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentExpirationsPage;
