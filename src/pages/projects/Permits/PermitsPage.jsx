// src/pages/projects/Permits/PermitsPage.jsx
// Main Permits page with summary cards, filterable list, and inspection tracking

import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Search, FileText, Shield, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useProjectPermits } from '@/hooks/usePermits';
import { getPermitTypeLabel, getStatusConfig, PERMIT_TYPES, PERMIT_STATUSES } from '@/services/permitService';
import PermitForm from './PermitForm';
import PermitDetail from './PermitDetail';

const formatCurrency = (amount) => {
  if (!amount) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
};

const PermitsPage = ({ projectId: propProjectId }) => {
  const { projectId: paramProjectId } = useParams();
  const projectId = propProjectId || paramProjectId || 'demo-project-1';

  const { permits, loading, totals, refetch } = useProjectPermits(projectId);

  const [showForm, setShowForm] = useState(false);
  const [selectedPermitId, setSelectedPermitId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredPermits = useMemo(() => {
    let result = permits;
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }
    if (typeFilter !== 'all') {
      result = result.filter(p => p.permit_type === typeFilter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.permit_number?.toLowerCase().includes(term) ||
        p.issuing_authority?.toLowerCase().includes(term) ||
        getPermitTypeLabel(p.permit_type).toLowerCase().includes(term) ||
        p.notes?.toLowerCase().includes(term)
      );
    }
    return result;
  }, [permits, statusFilter, typeFilter, searchTerm]);

  // Check for expiring permits (within 30 days)
  const expiringCount = useMemo(() => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 30);
    return permits.filter(p =>
      p.expiration_date && p.status === 'issued' &&
      new Date(p.expiration_date) <= soon && new Date(p.expiration_date) > new Date()
    ).length;
  }, [permits]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F855A]" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Permits</h2>
          <p className="text-sm text-gray-500 mt-1">
            {totals.totalCount} permits &middot; {totals.issuedCount} issued &middot; {totals.pendingCount} pending
          </p>
        </div>
        <Button size="sm" className="bg-[#2F855A] hover:bg-[#276749]" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add Permit
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-white rounded-lg border-l-4 border-l-emerald-500 border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Issued</p>
          <p className="text-lg font-bold text-emerald-700">{totals.issuedCount}</p>
          <p className="text-xs text-gray-400">Active permits</p>
        </div>
        <div className="bg-white rounded-lg border-l-4 border-l-amber-400 border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Pending</p>
          <p className="text-lg font-bold text-amber-700">{totals.pendingCount}</p>
          <p className="text-xs text-gray-400">Under review</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Not Applied</p>
          <p className="text-lg font-bold text-gray-600">{totals.notAppliedCount}</p>
          <p className="text-xs text-gray-400">Upcoming</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Fees</p>
          <p className="text-lg font-bold text-gray-700">{formatCurrency(totals.totalFees)}</p>
          <p className="text-xs text-gray-400">{formatCurrency(totals.unpaidFees)} unpaid</p>
        </div>
        {expiringCount > 0 && (
          <div className="bg-white rounded-lg border-l-4 border-l-red-400 border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Expiring Soon</p>
            <p className="text-lg font-bold text-red-600">{expiringCount}</p>
            <p className="text-xs text-red-400">Within 30 days</p>
          </div>
        )}
        {expiringCount === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Expired</p>
            <p className="text-lg font-bold text-gray-500">{totals.expiredCount}</p>
            <p className="text-xs text-gray-400">Need renewal</p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Search permits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Statuses</option>
          {PERMIT_STATUSES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Types</option>
          {PERMIT_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Permits Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permit #</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Authority</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issued</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Fees</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Inspections</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-20">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredPermits.map(permit => {
              const statusConfig = getStatusConfig(permit.status);
              const isExpiringSoon = permit.expiration_date && permit.status === 'issued' &&
                new Date(permit.expiration_date) <= new Date(Date.now() + 30 * 86400000) &&
                new Date(permit.expiration_date) > new Date();
              return (
                <tr key={permit.id} className={cn(
                  "hover:bg-gray-50 transition-colors",
                  isExpiringSoon && "bg-red-50/30",
                  permit.status === 'revisions_required' && "bg-orange-50/30"
                )}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{getPermitTypeLabel(permit.permit_type)}</p>
                    <p className="text-xs text-gray-400 capitalize">{permit.jurisdiction}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">
                    {permit.permit_number || <span className="text-gray-400 italic">Pending</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">
                    {permit.issuing_authority}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(permit.application_date)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(permit.issued_date)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-gray-600", isExpiringSoon && "text-red-600 font-medium")}>
                      {formatDate(permit.expiration_date)}
                    </span>
                    {isExpiringSoon && <AlertTriangle className="inline w-3 h-3 text-red-500 ml-1" />}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="outline" className={cn("text-xs", statusConfig.color)}>
                      {statusConfig.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono text-gray-700">{formatCurrency(permit.total_fees)}</span>
                    {permit.fees_paid ? (
                      <CheckCircle2 className="inline w-3 h-3 text-green-500 ml-1" />
                    ) : permit.total_fees > 0 ? (
                      <Clock className="inline w-3 h-3 text-amber-500 ml-1" />
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {permit.requires_inspections ? (
                      <span className="text-xs text-gray-600">{permit.inspection_count}</span>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedPermitId(permit.id)}
                      className="text-xs text-[#2F855A] hover:underline font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredPermits.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Shield className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p>No permits found.</p>
          </div>
        )}
      </div>

      {/* New Permit Form */}
      {showForm && (
        <PermitForm
          open={showForm}
          projectId={projectId}
          onCreated={() => { setShowForm(false); refetch(); }}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Permit Detail */}
      {selectedPermitId && (
        <PermitDetail
          open={!!selectedPermitId}
          permitId={selectedPermitId}
          projectId={projectId}
          onUpdated={refetch}
          onClose={() => setSelectedPermitId(null)}
        />
      )}
    </div>
  );
};

export default PermitsPage;
