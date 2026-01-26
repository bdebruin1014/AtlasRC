import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Download, DollarSign, Users, TrendingDown, Calendar,
  Eye, Edit2, Trash2, X, Check, AlertCircle, Building2, ArrowDownRight,
  PieChart, Percent, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { capitalService } from '@/services/capitalService';

const DistributionsPage = ({ entityId }) => {
  const [distributions, setDistributions] = useState([]);
  const [members, setMembers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedDistribution, setSelectedDistribution] = useState(null);
  const [filterMember, setFilterMember] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    member_id: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    type: 'profit_distribution',
    description: '',
  });

  const [bulkData, setBulkData] = useState({
    date: new Date().toISOString().split('T')[0],
    totalAmount: '',
    type: 'profit_distribution',
    description: '',
    allocations: [],
  });

  // Distribution types
  const distributionTypes = [
    { key: 'profit_distribution', label: 'Profit Distribution' },
    { key: 'guaranteed_payment', label: 'Guaranteed Payment' },
    { key: 'capital_return', label: 'Return of Capital' },
    { key: 'special_distribution', label: 'Special Distribution' },
    { key: 'liquidating', label: 'Liquidating Distribution' },
  ];

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [distRes, membersRes, summaryRes] = await Promise.all([
          capitalService.getDistributions(entityId),
          capitalService.getMembers(entityId),
          capitalService.getCapitalSummary(entityId),
        ]);

        setDistributions(distRes.data || []);
        setMembers(membersRes.data || []);
        setSummary(summaryRes.data || null);
      } catch (err) {
        console.error('Error fetching distribution data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [entityId]);

  // Calculate bulk allocations when total amount changes
  useEffect(() => {
    if (bulkData.totalAmount && members.length > 0) {
      const total = parseFloat(bulkData.totalAmount) || 0;
      const allocations = members.map(m => ({
        member_id: m.id,
        member_name: m.name,
        ownership_pct: m.ownership_pct,
        amount: Math.round((total * (m.ownership_pct / 100)) * 100) / 100,
      }));
      setBulkData(prev => ({ ...prev, allocations }));
    }
  }, [bulkData.totalAmount, members]);

  const handleSubmit = async () => {
    try {
      if (selectedDistribution) {
        await capitalService.updateDistribution(selectedDistribution.id, formData);
      } else {
        await capitalService.createDistribution({
          ...formData,
          entity_id: entityId,
          amount: parseFloat(formData.amount),
        });
      }

      // Refresh data
      const [distRes, summaryRes] = await Promise.all([
        capitalService.getDistributions(entityId),
        capitalService.getCapitalSummary(entityId),
      ]);
      setDistributions(distRes.data || []);
      setSummary(summaryRes.data || null);

      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('Error saving distribution:', err);
    }
  };

  const handleBulkSubmit = async () => {
    try {
      // Create distributions for each member
      for (const allocation of bulkData.allocations) {
        if (allocation.amount > 0) {
          await capitalService.createDistribution({
            entity_id: entityId,
            member_id: allocation.member_id,
            date: bulkData.date,
            amount: allocation.amount,
            type: bulkData.type,
            description: bulkData.description,
          });
        }
      }

      // Refresh data
      const [distRes, summaryRes] = await Promise.all([
        capitalService.getDistributions(entityId),
        capitalService.getCapitalSummary(entityId),
      ]);
      setDistributions(distRes.data || []);
      setSummary(summaryRes.data || null);

      setShowBulkModal(false);
      setBulkData({
        date: new Date().toISOString().split('T')[0],
        totalAmount: '',
        type: 'profit_distribution',
        description: '',
        allocations: [],
      });
    } catch (err) {
      console.error('Error creating bulk distributions:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this distribution?')) return;

    try {
      await capitalService.deleteDistribution(id);
      const [distRes, summaryRes] = await Promise.all([
        capitalService.getDistributions(entityId),
        capitalService.getCapitalSummary(entityId),
      ]);
      setDistributions(distRes.data || []);
      setSummary(summaryRes.data || null);
    } catch (err) {
      console.error('Error deleting distribution:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      member_id: '',
      date: new Date().toISOString().split('T')[0],
      amount: '',
      type: 'profit_distribution',
      description: '',
    });
    setSelectedDistribution(null);
  };

  const openEdit = (distribution) => {
    setSelectedDistribution(distribution);
    setFormData({
      member_id: distribution.member_id,
      date: distribution.date,
      amount: distribution.amount.toString(),
      type: distribution.type,
      description: distribution.description || '',
    });
    setShowModal(true);
  };

  const filteredDistributions = distributions.filter(d => {
    const matchesMember = filterMember === 'all' || d.member_id.toString() === filterMember;
    const matchesType = filterType === 'all' || d.type === filterType;
    const matchesSearch = !searchQuery ||
      d.member_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMember && matchesType && matchesSearch;
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

  const getTypeColor = (type) => {
    switch (type) {
      case 'profit_distribution': return 'bg-green-100 text-green-700';
      case 'guaranteed_payment': return 'bg-blue-100 text-blue-700';
      case 'capital_return': return 'bg-amber-100 text-amber-700';
      case 'special_distribution': return 'bg-purple-100 text-purple-700';
      case 'liquidating': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Calculate YTD distributions
  const ytdDistributions = distributions
    .filter(d => new Date(d.date).getFullYear() === new Date().getFullYear())
    .reduce((sum, d) => sum + d.amount, 0);

  // Calculate distributions by type
  const byType = distributions.reduce((acc, d) => {
    acc[d.type] = (acc[d.type] || 0) + d.amount;
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-pulse">Loading distributions...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Distributions</h1>
          <p className="text-sm text-gray-500">Track member distributions and profit allocations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBulkModal(true)}
          >
            <Send className="w-4 h-4 mr-1" />Bulk Distribution
          </Button>
          <Button
            className="bg-[#047857] hover:bg-[#065f46]"
            size="sm"
            onClick={() => { resetForm(); setShowModal(true); }}
          >
            <Plus className="w-4 h-4 mr-1" />Record Distribution
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Total Distributed</span>
          </div>
          <p className="text-2xl font-semibold text-amber-600">
            {formatCurrency(summary?.totalDistributions)}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">YTD Distributions</span>
          </div>
          <p className="text-2xl font-semibold">
            {formatCurrency(ytdDistributions)}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <TrendingDown className="w-4 h-4" />
            <span className="text-sm">Total Capital</span>
          </div>
          <p className="text-2xl font-semibold text-[#047857]">
            {formatCurrency(summary?.totalCapital)}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <PieChart className="w-4 h-4" />
            <span className="text-sm">This Quarter</span>
          </div>
          <p className="text-2xl font-semibold">
            {formatCurrency(
              distributions
                .filter(d => {
                  const date = new Date(d.date);
                  const now = new Date();
                  return date.getFullYear() === now.getFullYear() &&
                    Math.floor(date.getMonth() / 3) === Math.floor(now.getMonth() / 3);
                })
                .reduce((sum, d) => sum + d.amount, 0)
            )}
          </p>
        </div>
      </div>

      {/* Distribution by Type */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <h3 className="font-medium mb-4">Distributions by Type</h3>
        <div className="grid grid-cols-5 gap-4">
          {distributionTypes.map(type => (
            <div key={type.key} className="text-center">
              <p className="text-xs text-gray-500 mb-1">{type.label}</p>
              <p className="text-lg font-semibold">{formatCurrency(byType[type.key] || 0)}</p>
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
              placeholder="Search distributions..."
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
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            {distributionTypes.map(t => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Distributions Table */}
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
            {filteredDistributions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No distributions found
                </td>
              </tr>
            ) : (
              filteredDistributions.map((distribution) => (
                <tr key={distribution.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{formatDate(distribution.date)}</td>
                  <td className="px-4 py-3 font-medium">{distribution.member_name}</td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-1 rounded text-xs", getTypeColor(distribution.type))}>
                      {distributionTypes.find(t => t.key === distribution.type)?.label || distribution.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{distribution.description || '-'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-amber-600">
                    {formatCurrency(distribution.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button
                        className="p-1 hover:bg-gray-100 rounded"
                        onClick={() => openEdit(distribution)}
                      >
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        className="p-1 hover:bg-red-100 rounded"
                        onClick={() => handleDelete(distribution.id)}
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
                {selectedDistribution ? 'Edit Distribution' : 'Record Distribution'}
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
                    <option key={m.id} value={m.id}>{m.name} ({m.ownership_pct}%)</option>
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
                  {distributionTypes.map(t => (
                    <option key={t.key} value={t.key}>{t.label}</option>
                  ))}
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
                {selectedDistribution ? 'Update' : 'Record'} Distribution
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Distribution Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">Bulk Distribution to All Members</h3>
              <button onClick={() => setShowBulkModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  Enter the total distribution amount. It will be allocated proportionally based on each member's ownership percentage.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Date *</label>
                  <Input
                    type="date"
                    value={bulkData.date}
                    onChange={(e) => setBulkData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Total Amount *</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={bulkData.totalAmount}
                    onChange={(e) => setBulkData(prev => ({ ...prev, totalAmount: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Type</label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={bulkData.type}
                  onChange={(e) => setBulkData(prev => ({ ...prev, type: e.target.value }))}
                >
                  {distributionTypes.map(t => (
                    <option key={t.key} value={t.key}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Description</label>
                <textarea
                  className="w-full border rounded-md px-3 py-2"
                  rows={2}
                  placeholder="e.g., Q4 2024 profit distribution"
                  value={bulkData.description}
                  onChange={(e) => setBulkData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* Allocation Preview */}
              {bulkData.allocations.length > 0 && (
                <div>
                  <label className="text-sm font-medium block mb-2">Allocation Preview</label>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-3 py-2">Member</th>
                          <th className="text-right px-3 py-2">Ownership</th>
                          <th className="text-right px-3 py-2">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {bulkData.allocations.map(a => (
                          <tr key={a.member_id}>
                            <td className="px-3 py-2">{a.member_name}</td>
                            <td className="px-3 py-2 text-right">{a.ownership_pct}%</td>
                            <td className="px-3 py-2 text-right font-medium text-amber-600">
                              {formatCurrency(a.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td className="px-3 py-2 font-semibold">Total</td>
                          <td className="px-3 py-2 text-right">100%</td>
                          <td className="px-3 py-2 text-right font-semibold text-amber-600">
                            {formatCurrency(bulkData.allocations.reduce((sum, a) => sum + a.amount, 0))}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 sticky bottom-0">
              <Button variant="outline" onClick={() => setShowBulkModal(false)}>
                Cancel
              </Button>
              <Button
                className="bg-[#047857] hover:bg-[#065f46]"
                onClick={handleBulkSubmit}
                disabled={!bulkData.totalAmount || bulkData.allocations.length === 0}
              >
                <Send className="w-4 h-4 mr-1" />
                Distribute to All Members
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistributionsPage;
