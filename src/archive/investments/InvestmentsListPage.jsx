import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Filter, Download, MoreVertical, LayoutGrid, List,
  Building2, DollarSign, Users, TrendingUp, MapPin, Calendar,
  ChevronRight, Eye, Edit2, Archive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const InvestmentsListPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [stageFilter, setStageFilter] = useState('all');

  const deals = [
    {
      id: 'deal-001',
      name: 'Highland Park Lofts',
      internalName: 'HPL-2024',
      stage: 'raising_capital',
      targetAmount: 2500000,
      totalRaised: 1875000,
      investorCount: 12,
      minInvestment: 50000,
      preferredReturn: 8,
      targetIRR: 18,
      closeDate: '2025-03-15',
      city: 'Greenville',
      state: 'SC',
      totalDistributions: 0,
    },
    {
      id: 'deal-002',
      name: 'Riverside Commons',
      internalName: 'RC-2024',
      stage: 'asset_managing',
      targetAmount: 4200000,
      totalRaised: 4200000,
      investorCount: 24,
      minInvestment: 25000,
      preferredReturn: 8,
      targetIRR: 16,
      closeDate: '2024-06-30',
      city: 'Spartanburg',
      state: 'SC',
      totalDistributions: 168000,
    },
    {
      id: 'deal-003',
      name: 'Cedar Mill Phase 2',
      internalName: 'CMP2-2025',
      stage: 'raising_capital',
      targetAmount: 5500000,
      totalRaised: 825000,
      investorCount: 6,
      minInvestment: 100000,
      preferredReturn: 10,
      targetIRR: 22,
      closeDate: '2025-06-30',
      city: 'Greer',
      state: 'SC',
      totalDistributions: 0,
    },
    {
      id: 'deal-004',
      name: 'Downtown Loft Conversion',
      internalName: 'DLC-2023',
      stage: 'liquidated',
      targetAmount: 1800000,
      totalRaised: 1800000,
      investorCount: 18,
      minInvestment: 25000,
      preferredReturn: 8,
      targetIRR: 15,
      closeDate: '2023-01-15',
      city: 'Greenville',
      state: 'SC',
      totalDistributions: 2340000,
      actualIRR: 19.2,
    },
  ];

  const stats = {
    totalDeals: deals.length,
    activeDeals: deals.filter(d => d.stage !== 'liquidated' && d.stage !== 'archived').length,
    totalRaised: deals.reduce((s, d) => s + d.totalRaised, 0),
    totalDistributed: deals.reduce((s, d) => s + (d.totalDistributions || 0), 0),
    totalInvestors: new Set(deals.flatMap(d => d.investorCount)).size, // Simplified
  };

  const getStageConfig = (stage) => {
    const configs = {
      raising_capital: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Raising Capital', dot: 'bg-blue-500' },
      asset_managing: { bg: 'bg-green-100', text: 'text-green-700', label: 'Operating', dot: 'bg-green-500' },
      liquidated: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Liquidated', dot: 'bg-purple-500' },
      archived: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Archived', dot: 'bg-gray-500' },
    };
    return configs[stage] || configs.archived;
  };

  const formatCurrency = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toLocaleString()}`;
  };

  const filteredDeals = deals.filter(d => {
    if (stageFilter !== 'all' && d.stage !== stageFilter) return false;
    if (searchQuery && !d.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Investment Management</h1>
          <p className="text-sm text-gray-500">Manage syndication deals, investors, and distributions</p>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]">
          <Plus className="w-4 h-4 mr-2" />New Deal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold">{stats.totalDeals}</p>
          <p className="text-sm text-gray-500">Total Deals</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold text-green-600">{stats.activeDeals}</p>
          <p className="text-sm text-gray-500">Active Deals</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold">{formatCurrency(stats.totalRaised)}</p>
          <p className="text-sm text-gray-500">Total Raised</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold">{formatCurrency(stats.totalDistributed)}</p>
          <p className="text-sm text-gray-500">Total Distributed</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold">{deals.reduce((s, d) => s + d.investorCount, 0)}</p>
          <p className="text-sm text-gray-500">Total Investors</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search deals..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All Stages</option>
          <option value="raising_capital">Raising Capital</option>
          <option value="asset_managing">Operating</option>
          <option value="liquidated">Liquidated</option>
          <option value="archived">Archived</option>
        </select>
        <div className="flex border rounded-md">
          <button
            onClick={() => setViewMode('list')}
            className={cn("p-2", viewMode === 'list' ? "bg-[#047857] text-white" : "text-gray-500 hover:bg-gray-100")}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={cn("p-2", viewMode === 'grid' ? "bg-[#047857] text-white" : "text-gray-500 hover:bg-gray-100")}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />Export
        </Button>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Deal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Stage</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Target</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Raised</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Progress</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Investors</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Distributed</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">IRR</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredDeals.map(deal => {
                const stage = getStageConfig(deal.stage);
                const percentFunded = Math.round((deal.totalRaised / deal.targetAmount) * 100);
                return (
                  <tr 
                    key={deal.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/investments/${deal.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-emerald-700" />
                        </div>
                        <div>
                          <p className="font-medium">{deal.name}</p>
                          <p className="text-xs text-gray-500">{deal.city}, {deal.state}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={cn("w-2 h-2 rounded-full", stage.dot)} />
                        <span className="text-sm">{stage.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(deal.targetAmount)}</td>
                    <td className="px-4 py-3 text-right font-medium text-green-600">{formatCurrency(deal.totalRaised)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#047857] h-2 rounded-full"
                            style={{ width: `${Math.min(percentFunded, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-10">{percentFunded}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">{deal.investorCount}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(deal.totalDistributions)}</td>
                    <td className="px-4 py-3 text-right font-medium">{deal.actualIRR || deal.targetIRR}%</td>
                    <td className="px-4 py-3">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDeals.map(deal => {
            const stage = getStageConfig(deal.stage);
            const percentFunded = Math.round((deal.totalRaised / deal.targetAmount) * 100);
            return (
              <div 
                key={deal.id}
                className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/investments/${deal.id}`)}
              >
                <div className="h-24 bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center relative">
                  <Building2 className="w-10 h-10 text-emerald-300" />
                  <span className={cn("absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium", stage.bg, stage.text)}>
                    {stage.label}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{deal.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{deal.city}, {deal.state}</p>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">{formatCurrency(deal.totalRaised)}</span>
                      <span className="font-medium">{percentFunded}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-[#047857] h-1.5 rounded-full" style={{ width: `${percentFunded}%` }} />
                    </div>
                  </div>
                  <div className="flex justify-between mt-3 pt-3 border-t text-sm">
                    <span className="text-gray-500">{deal.investorCount} investors</span>
                    <span className="font-medium">{deal.targetIRR}% IRR</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredDeals.length === 0 && (
        <div className="text-center py-12 bg-white border rounded-lg">
          <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-1">No deals found</h3>
          <p className="text-sm text-gray-500 mb-4">Create your first investment deal to get started</p>
          <Button className="bg-[#047857] hover:bg-[#065f46]">
            <Plus className="w-4 h-4 mr-2" />New Deal
          </Button>
        </div>
      )}
    </div>
  );
};

export default InvestmentsListPage;
