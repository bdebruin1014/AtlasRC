import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Download, DollarSign, Users, TrendingUp, Calendar,
  Eye, Edit2, Trash2, X, Check, AlertCircle, Building2, ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { capitalService } from '@/services/capitalService';

const CapitalContributionsPage = ({ entityId }) => {
  const [contributions, setContributions] = useState([]);
  const [members, setMembers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [filterMember, setFilterMember] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    member_id: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    type: 'cash',
    description: '',
  });

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [contribRes, membersRes, summaryRes] = await Promise.all([
          capitalService.getContributions(entityId),
          capitalService.getMembers(entityId),
          capitalService.getCapitalSummary(entityId),
        ]);

        setContributions(contribRes.data || []);
        setMembers(membersRes.data || []);
        setSummary(summaryRes.data || null);
      } catch (err) {
        console.error('Error fetching capital data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [entityId]);

  const handleSubmit = async () => {
    try {
      if (selectedContribution) {
        await capitalService.updateContribution(selectedContribution.id, formData);
      } else {
        await capitalService.createContribution({
          ...formData,
          entity_id: entityId,
          amount: parseFloat(formData.amount),
        });
      }

      // Refresh data
      const [contribRes, summaryRes] = await Promise.all([
        capitalService.getContributions(entityId),
        capitalService.getCapitalSummary(entityId),
      ]);
      setContributions(contribRes.data || []);
      setSummary(summaryRes.data || null);

      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('Error saving contribution:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contribution?')) return;

    try {
      await capitalService.deleteContribution(id);
      const [contribRes, summaryRes] = await Promise.all([
        capitalService.getContributions(entityId),
        capitalService.getCapitalSummary(entityId),
      ]);
      setContributions(contribRes.data || []);
      setSummary(summaryRes.data || null);
    } catch (err) {
      console.error('Error deleting contribution:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      member_id: '',
      date: new Date().toISOString().split('T')[0],
      amount: '',
      type: 'cash',
      description: '',
    });
    setSelectedContribution(null);
  };

  const openEdit = (contribution) => {
    setSelectedContribution(contribution);
    setFormData({
      member_id: contribution.member_id,
      date: contribution.date,
      amount: contribution.amount.toString(),
      type: contribution.type,
      description: contribution.description || '',
    });
    setShowModal(true);
  };

  const filteredContributions = contributions.filter(c => {
    const matchesMember = filterMember === 'all' || c.member_id.toString() === filterMember;
    const matchesSearch = !searchQuery ||
      c.member_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMember && matchesSearch;
  });

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-pulse">Loading capital contributions...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Capital Contributions</h1>
          <p className="text-sm text-gray-500">Track member capital contributions to the entity</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />Export
          </Button>
          <Button
            className="bg-[#047857] hover:bg-[#065f46]"
            size="sm"
            onClick={() => { resetForm(); setShowModal(true); }}
          >
            <Plus className="w-4 h-4 mr-1" />Record Contribution
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Total Contributions</span>
          </div>
          <p className="text-2xl font-semibold text-[#047857]">
            {formatCurrency(summary?.totalContributions)}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Total Capital</span>
          </div>
          <p className="text-2xl font-semibold">
            {formatCurrency(summary?.totalCapital)}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-sm">Members</span>
          </div>
          <p className="text-2xl font-semibold">{summary?.memberCount || 0}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">This Year</span>
          </div>
          <p className="text-2xl font-semibold">
            {formatCurrency(
              contributions
                .filter(c => new Date(c.date).getFullYear() === new Date().getFullYear())
                .reduce((sum, c) => sum + c.amount, 0)
            )}
          </p>
        </div>
      </div>

      {/* Member Capital Summary */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <h3 className="font-medium mb-4">Member Capital Accounts</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summary?.members?.map(member => (
            <div key={member.id} className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-medium truncate">{member.name}</p>
              <p className="text-lg font-semibold text-[#047857]">
                {formatCurrency(member.capital_account)}
              </p>
              <p className="text-xs text-gray-500">{member.ownership_pct}% ownership</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search contributions..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={filterMember}
            onChange={(e) => setFilterMember(e.target.value)}
          >
            <option value="all">All Members</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Contributions Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-left px-4 py-3 font-medium">Member</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-left px-4 py-3 font-medium">Description</th>
              <th className="text-right px-4 py-3 font-medium">Amount</th>
              <th className="w-20 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredContributions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No contributions found
                </td>
              </tr>
            ) : (
              filteredContributions.map((contribution) => (
                <tr key={contribution.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{formatDate(contribution.date)}</td>
                  <td className="px-4 py-3 font-medium">{contribution.member_name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs capitalize">
                      {contribution.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{contribution.description || '-'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-[#047857]">
                    {formatCurrency(contribution.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button
                        className="p-1 hover:bg-gray-100 rounded"
                        onClick={() => openEdit(contribution)}
                      >
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        className="p-1 hover:bg-red-100 rounded"
                        onClick={() => handleDelete(contribution.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">
                {selectedContribution ? 'Edit Contribution' : 'Record Contribution'}
              </h3>
              <button onClick={() => { setShowModal(false); resetForm(); }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Member *</label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={formData.member_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, member_id: e.target.value }))}
                >
                  <option value="">Select member...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Date *</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Amount *</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Type</label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="cash">Cash</option>
                  <option value="property">Property</option>
                  <option value="services">Services</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description</label>
                <textarea
                  className="w-full border rounded-md px-3 py-2"
                  rows={2}
                  placeholder="Optional description..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => { setShowModal(false); resetForm(); }}>
                Cancel
              </Button>
              <Button
                className="bg-[#047857] hover:bg-[#065f46]"
                onClick={handleSubmit}
                disabled={!formData.member_id || !formData.amount}
              >
                <Check className="w-4 h-4 mr-1" />
                {selectedContribution ? 'Update' : 'Record'} Contribution
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CapitalContributionsPage;
