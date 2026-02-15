import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Plus, Search, ChevronRight, Home, Filter, Building2, Map, Hammer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import LoadingState from '@/components/LoadingState';
import {
  getHouses, getMilestoneSummary, MILESTONES, getMilestoneLabel,
} from '@/services/constructionService';
import { PROJECT_TYPES } from '@/hooks/useProjects';

const MILESTONE_COLORS = {
  pre_contract: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', dot: 'bg-gray-400' },
  permitting: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', dot: 'bg-blue-500' },
  mobilized: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', dot: 'bg-yellow-500' },
  foundation: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', dot: 'bg-orange-500' },
  framing: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', dot: 'bg-orange-500' },
  sheetrock: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', dot: 'bg-purple-500' },
  co: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', dot: 'bg-green-500' },
  warranty: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-300', dot: 'bg-teal-500' },
  complete: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-400', dot: 'bg-emerald-700' },
};

const STATUS_LABELS = {
  active: { bg: 'bg-green-100', text: 'text-green-700' },
  on_hold: { bg: 'bg-amber-100', text: 'text-amber-700' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700' },
  complete: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

const formatCurrency = (val) => {
  if (val == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
};

const ConstructionListPage = () => {
  const navigate = useNavigate();
  const [milestoneFilter, setMilestoneFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectTypeFilter, setProjectTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filters = {};
  if (milestoneFilter !== 'all') filters.current_milestone = milestoneFilter;
  if (statusFilter !== 'all') filters.status = statusFilter;

  const { data: housesResult, isLoading } = useQuery({
    queryKey: ['construction-houses', filters],
    queryFn: () => getHouses(filters),
  });

  const { data: summaryResult } = useQuery({
    queryKey: ['construction-milestone-summary'],
    queryFn: () => getMilestoneSummary(),
  });

  const houses = housesResult?.data || [];
  const summary = summaryResult?.data || {};

  const filteredHouses = houses.filter(h => {
    if (projectTypeFilter !== 'all' && h.project?.project_type !== projectTypeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !h.house_name?.toLowerCase().includes(q) &&
        !h.address?.toLowerCase().includes(q) &&
        !h.buyer_name?.toLowerCase().includes(q) &&
        !h.plan_name?.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  if (isLoading) {
    return <LoadingState type="table" message="Loading houses..." />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Construction Management</h1>
          <p className="text-sm text-gray-500">Track houses from pre-contract to completion</p>
        </div>
        <Button
          className="bg-[#047857] hover:bg-[#065f46]"
          onClick={() => alert('Open Add House Modal')}
        >
          <Plus className="w-4 h-4 mr-2" />Add House
        </Button>
      </div>

      {/* Milestone Pipeline */}
      <div className="grid grid-cols-9 gap-2 mb-6">
        {MILESTONES.map((m, idx) => {
          const count = summary[m.key] || 0;
          const colors = MILESTONE_COLORS[m.key];
          const isActive = milestoneFilter === m.key;
          return (
            <button
              key={m.key}
              onClick={() => setMilestoneFilter(isActive ? 'all' : m.key)}
              className={cn(
                'relative bg-white border rounded-lg p-3 text-center transition-all hover:shadow-md',
                isActive && 'ring-2 ring-[#047857] border-[#047857]',
              )}
            >
              <div className={cn('w-3 h-3 rounded-full mx-auto mb-2', colors.dot)} />
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs text-gray-500 leading-tight">{m.label}</p>
              {idx < MILESTONES.length - 1 && (
                <ChevronRight className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 z-10" />
              )}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search houses, buyers, plans..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={projectTypeFilter}
          onChange={(e) => setProjectTypeFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All Project Types</option>
          {PROJECT_TYPES.map(t => (
            <option key={t.key} value={t.key}>{t.label}</option>
          ))}
        </select>
        <select
          value={milestoneFilter}
          onChange={(e) => setMilestoneFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All Milestones</option>
          {MILESTONES.map(m => (
            <option key={m.key} value={m.key}>{m.label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="on_hold">On Hold</option>
          <option value="cancelled">Cancelled</option>
          <option value="complete">Complete</option>
        </select>
      </div>

      {/* Houses Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Lot</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Project</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Plan</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Elevation</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Pkg</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">SqFt</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Milestone</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Budget</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">% Spent</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredHouses.map(house => {
              const mColors = MILESTONE_COLORS[house.current_milestone] || MILESTONE_COLORS.pre_contract;
              const sColors = STATUS_LABELS[house.status] || STATUS_LABELS.active;
              const budget = house.total_budget || 0;
              const actual = house.actual_cost || 0;
              const pctSpent = budget > 0 ? Math.min((actual / budget) * 100, 100) : 0;
              const pkgAbbrev = { Standard: 'Std', Classic: 'Cls', Elegance: 'Elg' }[house.upgrade_package] || house.upgrade_package || '—';
              return (
                <tr
                  key={house.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/construction/${house.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Home className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{house.house_name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[160px]">{house.address}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{house.project?.name || '—'}</td>
                  <td className="px-4 py-3 text-xs">
                    {house.project?.project_type ? (
                      <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-medium">
                        {PROJECT_TYPES.find(t => t.key === house.project.project_type)?.label || house.project.project_type}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{house.plan_name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{house.elevation || '—'}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-medium">{pkgAbbrev}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">{house.plan_sqft?.toLocaleString() || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-1 rounded text-xs font-medium', mColors.bg, mColors.text)}>
                      {getMilestoneLabel(house.current_milestone)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    {formatCurrency(budget)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <div className="w-16 bg-gray-100 rounded-full h-1.5">
                        <div
                          className={cn(
                            'h-1.5 rounded-full',
                            pctSpent > 90 ? 'bg-red-500' : pctSpent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                          )}
                          style={{ width: `${pctSpent}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">{pctSpent.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-1 rounded text-xs font-medium', sColors.bg, sColors.text)}>
                      {house.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Empty State */}
        {filteredHouses.length === 0 && (
          <div className="text-center py-12">
            <Home className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium mb-1">No houses found</h3>
            <p className="text-sm text-gray-500 mb-4">
              {searchQuery || milestoneFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Add your first house to get started'}
            </p>
            <Button
              className="bg-[#047857] hover:bg-[#065f46]"
              onClick={() => alert('Open Add House Modal')}
            >
              <Plus className="w-4 h-4 mr-2" />Add House
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConstructionListPage;
