// src/pages/projects/Bids/BidsPage.jsx
// Main Bids page with summary cards, scope grouping, and bid comparison

import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Search, FileText, Award, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useProjectBids } from '@/hooks/useBids';
import {
  getBidTypeLabel, getScopeCategoryLabel, getStatusConfig,
  BID_STATUSES, SCOPE_CATEGORIES, BID_TYPES
} from '@/services/bidService';
import BidForm from './BidForm';
import BidDetail from './BidDetail';

const formatCurrency = (amount) => {
  if (!amount) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
};

const BidsPage = ({ projectId: propProjectId }) => {
  const { projectId: paramProjectId } = useParams();
  const projectId = propProjectId || paramProjectId || 'demo-project-1';

  const { bids, loading, totals, byScope, refetch } = useProjectBids(projectId);

  const [showForm, setShowForm] = useState(false);
  const [selectedBidId, setSelectedBidId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scopeFilter, setScopeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // list or scope

  const filteredBids = useMemo(() => {
    let result = bids;
    if (statusFilter !== 'all') {
      result = result.filter(b => b.status === statusFilter);
    }
    if (scopeFilter !== 'all') {
      result = result.filter(b => b.scope_category === scopeFilter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(b =>
        b.bidder_name?.toLowerCase().includes(term) ||
        b.scope_description?.toLowerCase().includes(term) ||
        getScopeCategoryLabel(b.scope_category).toLowerCase().includes(term) ||
        b.bidder_contact_name?.toLowerCase().includes(term)
      );
    }
    return result;
  }, [bids, statusFilter, scopeFilter, searchTerm]);

  // Available scope categories in use
  const activeScopes = useMemo(() => {
    const scopes = [...new Set(bids.map(b => b.scope_category))];
    return SCOPE_CATEGORIES.filter(s => scopes.includes(s.value));
  }, [bids]);

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
          <h2 className="text-xl font-bold text-gray-900">Bids</h2>
          <p className="text-sm text-gray-500 mt-1">
            {totals.totalBids} bids &middot; {totals.awardedCount} awarded &middot; {totals.underReviewCount} under review
          </p>
        </div>
        <Button size="sm" className="bg-[#2F855A] hover:bg-[#276749]" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1" /> New Bid
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-white rounded-lg border-l-4 border-l-blue-400 border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Bids</p>
          <p className="text-lg font-bold text-blue-700">{totals.totalBids}</p>
          <p className="text-xs text-gray-400">{totals.submittedCount} new</p>
        </div>
        <div className="bg-white rounded-lg border-l-4 border-l-amber-400 border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Under Review</p>
          <p className="text-lg font-bold text-amber-700">{totals.underReviewCount}</p>
          <p className="text-xs text-gray-400">Evaluating</p>
        </div>
        <div className="bg-white rounded-lg border-l-4 border-l-green-500 border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Awarded</p>
          <p className="text-lg font-bold text-green-700">{totals.awardedCount}</p>
          <p className="text-xs text-gray-400">{formatCurrency(totals.awardedAmount)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Bid Value</p>
          <p className="text-lg font-bold text-gray-700">{formatCurrency(totals.totalBidAmount)}</p>
          <p className="text-xs text-gray-400">All bids</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Avg Score</p>
          <p className="text-lg font-bold text-gray-700">
            {totals.avgScore > 0 ? Math.round(totals.avgScore) : '—'}
          </p>
          <p className="text-xs text-gray-400">Scored bids</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Search bids..."
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
          {BID_STATUSES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={scopeFilter}
          onChange={(e) => setScopeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Scopes</option>
          {activeScopes.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('list')}
            className={cn("px-3 py-2 text-xs", viewMode === 'list' ? "bg-gray-100 font-medium" : "bg-white")}
          >
            List
          </button>
          <button
            onClick={() => setViewMode('scope')}
            className={cn("px-3 py-2 text-xs border-l border-gray-300", viewMode === 'scope' ? "bg-gray-100 font-medium" : "bg-white")}
          >
            By Scope
          </button>
        </div>
      </div>

      {/* Scope Grouped View */}
      {viewMode === 'scope' && (
        <div className="space-y-4">
          {Object.entries(byScope).map(([scope, scopeBids]) => {
            const awarded = scopeBids.find(b => b.awarded);
            const lowestBid = Math.min(...scopeBids.map(b => b.bid_amount));
            const highestBid = Math.max(...scopeBids.map(b => b.bid_amount));
            return (
              <div key={scope} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">{getScopeCategoryLabel(scope)}</h4>
                    <p className="text-xs text-gray-500">{scopeBids.length} bids &middot; Range: {formatCurrency(lowestBid)} – {formatCurrency(highestBid)}</p>
                  </div>
                  {awarded && (
                    <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200">
                      <Award className="w-3 h-3" />
                      <span>Awarded: {awarded.bidder_name}</span>
                    </div>
                  )}
                </div>
                <div className="divide-y divide-gray-100">
                  {scopeBids.map(bid => {
                    const statusConfig = getStatusConfig(bid.status);
                    return (
                      <div key={bid.id} className={cn(
                        "px-4 py-3 flex items-center gap-4 hover:bg-gray-50 cursor-pointer",
                        bid.awarded && "bg-green-50/30"
                      )} onClick={() => setSelectedBidId(bid.id)}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-800">{bid.bidder_name}</p>
                            {bid.awarded && <Award className="w-3.5 h-3.5 text-green-600" />}
                          </div>
                          <p className="text-xs text-gray-500">{bid.bidder_contact_name} &middot; {getBidTypeLabel(bid.bid_type)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono font-semibold text-gray-800">{formatCurrency(bid.bid_amount)}</p>
                          {bid.alternate_amount && (
                            <p className="text-xs text-gray-400">Alt: {formatCurrency(bid.alternate_amount)}</p>
                          )}
                        </div>
                        {bid.score && (
                          <div className="text-center w-10">
                            <p className={cn("text-sm font-bold", bid.score >= 80 ? "text-green-600" : bid.score >= 60 ? "text-amber-600" : "text-red-600")}>
                              {bid.score}
                            </p>
                            <p className="text-xs text-gray-400">Score</p>
                          </div>
                        )}
                        <Badge variant="outline" className={cn("text-xs whitespace-nowrap", statusConfig.color)}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bidder</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scope</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Received</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valid Until</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBids.map(bid => {
                const statusConfig = getStatusConfig(bid.status);
                const isExpired = bid.valid_until && new Date(bid.valid_until) < new Date() && bid.status === 'submitted';
                return (
                  <tr key={bid.id} className={cn(
                    "hover:bg-gray-50 transition-colors",
                    bid.awarded && "bg-green-50/30"
                  )}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <p className="font-medium text-gray-800">{bid.bidder_name}</p>
                        {bid.awarded && <Award className="w-3.5 h-3.5 text-green-600" />}
                      </div>
                      <p className="text-xs text-gray-400">{bid.bidder_contact_name}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{getScopeCategoryLabel(bid.scope_category)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{getBidTypeLabel(bid.bid_type)}</td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-mono font-medium text-gray-800">{formatCurrency(bid.bid_amount)}</p>
                      {bid.alternate_amount && (
                        <p className="text-xs text-gray-400">Alt: {formatCurrency(bid.alternate_amount)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {bid.score ? (
                        <span className={cn(
                          "text-sm font-bold",
                          bid.score >= 80 ? "text-green-600" : bid.score >= 60 ? "text-amber-600" : "text-red-600"
                        )}>
                          {bid.score}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(bid.received_date)}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-gray-600", isExpired && "text-red-600")}>
                        {formatDate(bid.valid_until)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className={cn("text-xs", statusConfig.color)}>
                        {statusConfig.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedBidId(bid.id)}
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

          {filteredBids.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p>No bids found.</p>
            </div>
          )}
        </div>
      )}

      {/* New Bid Form */}
      {showForm && (
        <BidForm
          open={showForm}
          projectId={projectId}
          onCreated={() => { setShowForm(false); refetch(); }}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Bid Detail */}
      {selectedBidId && (
        <BidDetail
          open={!!selectedBidId}
          bidId={selectedBidId}
          projectId={projectId}
          onUpdated={refetch}
          onClose={() => setSelectedBidId(null)}
        />
      )}
    </div>
  );
};

export default BidsPage;
