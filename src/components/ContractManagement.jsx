import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';

// Demo contracts data
const demoContracts = [
  {
    id: 'ctr-001',
    name: 'Purchase Agreement - Highland Park',
    type: 'purchase',
    status: 'active',
    projectId: 'proj-123',
    projectName: 'Highland Park Development',
    counterparty: 'Highland Park Properties LLC',
    counterpartyContact: 'John Smith',
    value: 4500000,
    startDate: '2025-10-15',
    endDate: '2026-03-15',
    effectiveDate: '2025-10-15',
    signingDate: '2025-10-12',
    milestones: [
      { name: 'Due Diligence Period', date: '2025-11-15', status: 'completed' },
      { name: 'Financing Contingency', date: '2025-12-15', status: 'completed' },
      { name: 'Final Closing', date: '2026-03-15', status: 'pending' }
    ],
    keyTerms: ['30-day due diligence', '60-day financing contingency', '$100K earnest money'],
    renewalDate: null,
    autoRenew: false,
    alertDays: 30,
    documents: [{ name: 'Purchase_Agreement.pdf', uploadedAt: '2025-10-12' }],
    notes: 'Strong seller motivation, price negotiated down from $4.8M',
    createdAt: '2025-10-10'
  },
  {
    id: 'ctr-002',
    name: 'Property Management Agreement',
    type: 'service',
    status: 'active',
    projectId: 'proj-124',
    projectName: 'Riverside Commons',
    counterparty: 'Premier Property Management',
    counterpartyContact: 'Lisa Anderson',
    value: 48000,
    startDate: '2025-06-01',
    endDate: '2026-05-31',
    effectiveDate: '2025-06-01',
    signingDate: '2025-05-25',
    milestones: [],
    keyTerms: ['5% of gross rents', '30-day termination notice', 'Monthly reporting'],
    renewalDate: '2026-05-01',
    autoRenew: true,
    alertDays: 60,
    documents: [{ name: 'PM_Agreement.pdf', uploadedAt: '2025-05-25' }],
    notes: 'Good relationship, consider renegotiating rate at renewal',
    createdAt: '2025-05-20'
  },
  {
    id: 'ctr-003',
    name: 'Construction Loan Agreement',
    type: 'financing',
    status: 'active',
    projectId: 'proj-123',
    projectName: 'Highland Park Development',
    counterparty: 'First National Bank',
    counterpartyContact: 'Robert Chen',
    value: 3200000,
    startDate: '2025-11-01',
    endDate: '2027-04-30',
    effectiveDate: '2025-11-01',
    signingDate: '2025-10-28',
    milestones: [
      { name: 'Initial Draw', date: '2025-11-15', status: 'completed' },
      { name: 'Foundation Complete', date: '2026-02-01', status: 'pending' },
      { name: 'Framing Complete', date: '2026-06-01', status: 'pending' },
      { name: 'Final Draw', date: '2027-02-01', status: 'pending' }
    ],
    keyTerms: ['Prime + 1.5%', '18-month term', '75% LTC', 'Interest reserve'],
    renewalDate: null,
    autoRenew: false,
    alertDays: 90,
    documents: [
      { name: 'Loan_Agreement.pdf', uploadedAt: '2025-10-28' },
      { name: 'Draw_Schedule.pdf', uploadedAt: '2025-10-28' }
    ],
    notes: 'Good terms, maintain relationship for future projects',
    createdAt: '2025-10-25'
  },
  {
    id: 'ctr-004',
    name: 'Architectural Services',
    type: 'service',
    status: 'completed',
    projectId: 'proj-123',
    projectName: 'Highland Park Development',
    counterparty: 'Modern Design Associates',
    counterpartyContact: 'Sarah Williams',
    value: 125000,
    startDate: '2025-08-01',
    endDate: '2025-12-31',
    effectiveDate: '2025-08-01',
    signingDate: '2025-07-28',
    milestones: [
      { name: 'Schematic Design', date: '2025-09-01', status: 'completed' },
      { name: 'Design Development', date: '2025-10-15', status: 'completed' },
      { name: 'Construction Documents', date: '2025-12-01', status: 'completed' }
    ],
    keyTerms: ['Fixed fee', 'Two revision rounds included', 'Site visits included'],
    renewalDate: null,
    autoRenew: false,
    alertDays: 30,
    documents: [{ name: 'Architect_Agreement.pdf', uploadedAt: '2025-07-28' }],
    notes: 'Excellent work, will use again',
    createdAt: '2025-07-25'
  },
  {
    id: 'ctr-005',
    name: 'Lease Agreement - Unit 101',
    type: 'lease',
    status: 'active',
    projectId: 'proj-124',
    projectName: 'Riverside Commons',
    counterparty: 'Tech Startup Inc.',
    counterpartyContact: 'Mike Johnson',
    value: 72000,
    startDate: '2025-09-01',
    endDate: '2027-08-31',
    effectiveDate: '2025-09-01',
    signingDate: '2025-08-15',
    milestones: [
      { name: 'Rent Escalation Year 2', date: '2026-09-01', status: 'pending' }
    ],
    keyTerms: ['$3,000/month', '3% annual increase', 'Triple net'],
    renewalDate: '2027-06-01',
    autoRenew: false,
    alertDays: 90,
    documents: [{ name: 'Lease_Unit101.pdf', uploadedAt: '2025-08-15' }],
    notes: 'Reliable tenant, early payment history',
    createdAt: '2025-08-10'
  },
  {
    id: 'ctr-006',
    name: 'Insurance Policy - Highland Park',
    type: 'insurance',
    status: 'expiring_soon',
    projectId: 'proj-123',
    projectName: 'Highland Park Development',
    counterparty: 'ABC Insurance Co.',
    counterpartyContact: 'Jennifer Davis',
    value: 24000,
    startDate: '2025-11-01',
    endDate: '2026-02-28',
    effectiveDate: '2025-11-01',
    signingDate: '2025-10-28',
    milestones: [],
    keyTerms: ['Builders risk', '$5M coverage', '$10K deductible'],
    renewalDate: '2026-02-01',
    autoRenew: false,
    alertDays: 30,
    documents: [{ name: 'Insurance_Policy.pdf', uploadedAt: '2025-10-28' }],
    notes: 'Review coverage levels before renewal',
    createdAt: '2025-10-25'
  }
];

const contractTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'lease', label: 'Lease' },
  { value: 'service', label: 'Service' },
  { value: 'financing', label: 'Financing' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'other', label: 'Other' }
];

const contractStatuses = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending Signature' },
  { value: 'active', label: 'Active' },
  { value: 'expiring_soon', label: 'Expiring Soon' },
  { value: 'completed', label: 'Completed' },
  { value: 'terminated', label: 'Terminated' }
];

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  pending: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  expiring_soon: 'bg-orange-100 text-orange-700',
  completed: 'bg-blue-100 text-blue-700',
  terminated: 'bg-red-100 text-red-700'
};

export default function ContractManagement() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [viewingContract, setViewingContract] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'service',
    projectName: '',
    counterparty: '',
    counterpartyContact: '',
    value: '',
    startDate: '',
    endDate: '',
    keyTerms: '',
    renewalDate: '',
    autoRenew: false,
    alertDays: 30,
    notes: ''
  });

  useEffect(() => {
    fetchContracts();
  }, []);

  async function fetchContracts() {
    try {
      if (isDemoMode()) {
        setContracts(demoContracts);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .order('end_date', { ascending: true });

      if (error) throw error;
      setContracts(data || []);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      setContracts(demoContracts);
    } finally {
      setLoading(false);
    }
  }

  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      const matchesSearch = !searchQuery ||
        contract.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.counterparty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.projectName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === 'all' || contract.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [contracts, searchQuery, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    const now = new Date();
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);

    return {
      total: contracts.length,
      active: contracts.filter(c => c.status === 'active').length,
      expiringSoon: contracts.filter(c => {
        const endDate = new Date(c.endDate);
        return endDate <= thirtyDays && endDate >= now && c.status === 'active';
      }).length,
      totalValue: contracts.reduce((sum, c) => sum + (c.value || 0), 0),
      pendingMilestones: contracts.reduce((sum, c) =>
        sum + (c.milestones?.filter(m => m.status === 'pending').length || 0), 0
      )
    };
  }, [contracts]);

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  }

  function getDaysUntil(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    return diff;
  }

  function openCreateModal() {
    setEditingContract(null);
    setFormData({
      name: '',
      type: 'service',
      projectName: '',
      counterparty: '',
      counterpartyContact: '',
      value: '',
      startDate: '',
      endDate: '',
      keyTerms: '',
      renewalDate: '',
      autoRenew: false,
      alertDays: 30,
      notes: ''
    });
    setShowModal(true);
  }

  function openEditModal(contract) {
    setEditingContract(contract);
    setFormData({
      name: contract.name,
      type: contract.type,
      projectName: contract.projectName || '',
      counterparty: contract.counterparty,
      counterpartyContact: contract.counterpartyContact || '',
      value: contract.value?.toString() || '',
      startDate: contract.startDate,
      endDate: contract.endDate,
      keyTerms: contract.keyTerms?.join(', ') || '',
      renewalDate: contract.renewalDate || '',
      autoRenew: contract.autoRenew,
      alertDays: contract.alertDays,
      notes: contract.notes || ''
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (isDemoMode()) {
      if (editingContract) {
        setContracts(prev => prev.map(c =>
          c.id === editingContract.id
            ? {
                ...c,
                ...formData,
                value: parseFloat(formData.value) || 0,
                keyTerms: formData.keyTerms.split(',').map(t => t.trim()).filter(Boolean)
              }
            : c
        ));
      } else {
        const newContract = {
          id: `ctr-${Date.now()}`,
          ...formData,
          value: parseFloat(formData.value) || 0,
          keyTerms: formData.keyTerms.split(',').map(t => t.trim()).filter(Boolean),
          status: 'active',
          milestones: [],
          documents: [],
          createdAt: new Date().toISOString().split('T')[0]
        };
        setContracts(prev => [...prev, newContract]);
      }
      setShowModal(false);
      return;
    }

    try {
      if (editingContract) {
        const { error } = await supabase
          .from('contracts')
          .update({
            name: formData.name,
            type: formData.type,
            project_name: formData.projectName,
            counterparty: formData.counterparty,
            counterparty_contact: formData.counterpartyContact,
            value: parseFloat(formData.value) || 0,
            start_date: formData.startDate,
            end_date: formData.endDate,
            key_terms: formData.keyTerms.split(',').map(t => t.trim()).filter(Boolean),
            renewal_date: formData.renewalDate || null,
            auto_renew: formData.autoRenew,
            alert_days: formData.alertDays,
            notes: formData.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingContract.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('contracts')
          .insert({
            name: formData.name,
            type: formData.type,
            project_name: formData.projectName,
            counterparty: formData.counterparty,
            counterparty_contact: formData.counterpartyContact,
            value: parseFloat(formData.value) || 0,
            start_date: formData.startDate,
            end_date: formData.endDate,
            key_terms: formData.keyTerms.split(',').map(t => t.trim()).filter(Boolean),
            renewal_date: formData.renewalDate || null,
            auto_renew: formData.autoRenew,
            alert_days: formData.alertDays,
            notes: formData.notes,
            status: 'active'
          });

        if (error) throw error;
      }

      fetchContracts();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving contract:', error);
    }
  }

  async function deleteContract(contract) {
    if (!confirm(`Delete contract "${contract.name}"?`)) return;

    if (isDemoMode()) {
      setContracts(prev => prev.filter(c => c.id !== contract.id));
      return;
    }

    try {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', contract.id);

      if (error) throw error;
      fetchContracts();
    } catch (error) {
      console.error('Error deleting contract:', error);
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contract Management</h1>
          <p className="text-gray-600 mt-1">Track contracts, milestones, and renewals</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>+</span>
          <span>Add Contract</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Contracts</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Active</div>
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Expiring Soon</div>
          <div className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Value</div>
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalValue)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Pending Milestones</div>
          <div className="text-2xl font-bold text-purple-600">{stats.pendingMilestones}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search contracts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {contractTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {contractStatuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Contracts List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredContracts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="text-4xl mb-4">📄</div>
            <p>No contracts found</p>
            <button
              onClick={openCreateModal}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Add your first contract
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contract</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Counterparty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredContracts.map(contract => {
                  const daysUntilEnd = getDaysUntil(contract.endDate);
                  const pendingMilestones = contract.milestones?.filter(m => m.status === 'pending').length || 0;

                  return (
                    <tr key={contract.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{contract.name}</div>
                          {contract.projectName && (
                            <div className="text-sm text-blue-600">{contract.projectName}</div>
                          )}
                          {pendingMilestones > 0 && (
                            <div className="text-xs text-purple-600 mt-1">
                              {pendingMilestones} pending milestone{pendingMilestones > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize text-gray-700">{contract.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900">{contract.counterparty}</div>
                        {contract.counterpartyContact && (
                          <div className="text-sm text-gray-500">{contract.counterpartyContact}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {formatCurrency(contract.value)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900">{formatDate(contract.endDate)}</div>
                        {daysUntilEnd !== null && daysUntilEnd > 0 && daysUntilEnd <= 30 && (
                          <div className="text-xs text-orange-600">
                            {daysUntilEnd} days left
                          </div>
                        )}
                        {daysUntilEnd !== null && daysUntilEnd < 0 && (
                          <div className="text-xs text-red-600">Expired</div>
                        )}
                        {contract.autoRenew && (
                          <div className="text-xs text-green-600">Auto-renews</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[contract.status]}`}>
                          {contract.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setViewingContract(contract)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="View"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => openEditModal(contract)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteContract(contract)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewingContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{viewingContract.name}</h2>
                <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${statusColors[viewingContract.status]}`}>
                  {viewingContract.status.replace('_', ' ')}
                </span>
              </div>
              <button
                onClick={() => setViewingContract(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Type</div>
                  <div className="font-medium capitalize">{viewingContract.type}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Value</div>
                  <div className="font-medium">{formatCurrency(viewingContract.value)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Counterparty</div>
                  <div className="font-medium">{viewingContract.counterparty}</div>
                  {viewingContract.counterpartyContact && (
                    <div className="text-sm text-gray-600">{viewingContract.counterpartyContact}</div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-500">Project</div>
                  <div className="font-medium">{viewingContract.projectName || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Start Date</div>
                  <div className="font-medium">{formatDate(viewingContract.startDate)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">End Date</div>
                  <div className="font-medium">{formatDate(viewingContract.endDate)}</div>
                </div>
              </div>

              {/* Key Terms */}
              {viewingContract.keyTerms && viewingContract.keyTerms.length > 0 && (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Key Terms</div>
                  <div className="flex flex-wrap gap-2">
                    {viewingContract.keyTerms.map((term, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Milestones */}
              {viewingContract.milestones && viewingContract.milestones.length > 0 && (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Milestones</div>
                  <div className="space-y-2">
                    {viewingContract.milestones.map((milestone, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                            milestone.status === 'completed'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {milestone.status === 'completed' ? '✓' : idx + 1}
                          </span>
                          <span className="font-medium">{milestone.name}</span>
                        </div>
                        <span className="text-sm text-gray-600">{formatDate(milestone.date)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {viewingContract.documents && viewingContract.documents.length > 0 && (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Documents</div>
                  <div className="space-y-2">
                    {viewingContract.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <span>📄</span>
                        <span className="text-sm">{doc.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {viewingContract.notes && (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Notes</div>
                  <p className="text-gray-700 p-3 bg-gray-50 rounded">{viewingContract.notes}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setViewingContract(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setViewingContract(null);
                  openEditModal(viewingContract);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit Contract
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingContract ? 'Edit Contract' : 'Add Contract'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contract Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Purchase Agreement - Property Name"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="purchase">Purchase</option>
                    <option value="lease">Lease</option>
                    <option value="service">Service</option>
                    <option value="financing">Financing</option>
                    <option value="insurance">Insurance</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contract Value
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project/Property Name
                </label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                  placeholder="Link to a project or property"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Counterparty *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.counterparty}
                    onChange={(e) => setFormData(prev => ({ ...prev, counterparty: e.target.value }))}
                    placeholder="Company name"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={formData.counterpartyContact}
                    onChange={(e) => setFormData(prev => ({ ...prev, counterpartyContact: e.target.value }))}
                    placeholder="Contact name"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key Terms (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.keyTerms}
                  onChange={(e) => setFormData(prev => ({ ...prev, keyTerms: e.target.value }))}
                  placeholder="e.g., 30-day notice, Monthly payment, Auto-renew"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Renewal Date
                  </label>
                  <input
                    type="date"
                    value={formData.renewalDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, renewalDate: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alert Days Before
                  </label>
                  <input
                    type="number"
                    value={formData.alertDays}
                    onChange={(e) => setFormData(prev => ({ ...prev, alertDays: parseInt(e.target.value) || 30 }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.autoRenew}
                  onChange={(e) => setFormData(prev => ({ ...prev, autoRenew: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Auto-renew contract</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingContract ? 'Update Contract' : 'Add Contract'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
