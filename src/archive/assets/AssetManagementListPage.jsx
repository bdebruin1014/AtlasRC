import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, LayoutGrid, List, Download, MoreVertical, Filter,
  Building, Building2, MapPin, DollarSign, TrendingUp, Calendar,
  ChevronRight, Home, Warehouse, Trees
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const AssetManagementListPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [typeFilter, setTypeFilter] = useState('all');

  const assets = [
    {
      id: 'asset-001',
      name: 'Highland Park Lofts',
      type: 'multifamily',
      address: '123 Main Street',
      city: 'Greenville',
      state: 'SC',
      units: 48,
      sqft: 52000,
      acquisitionDate: '2024-01-15',
      acquisitionPrice: 8500000,
      currentValue: 9200000,
      noi: 485000,
      capRate: 5.7,
      status: 'operating',
      entityId: 'ent-003',
      entityName: 'Highland Park Development LLC',
    },
    {
      id: 'asset-002',
      name: 'Riverside Commons',
      type: 'mixed_use',
      address: '456 River Road',
      city: 'Spartanburg',
      state: 'SC',
      units: 24,
      sqft: 38000,
      acquisitionDate: '2023-06-20',
      acquisitionPrice: 4200000,
      currentValue: 4800000,
      noi: 312000,
      capRate: 7.4,
      status: 'operating',
      entityId: 'ent-004',
      entityName: 'Riverside Commons LLC',
    },
    {
      id: 'asset-003',
      name: 'Cedar Mill Phase 2',
      type: 'land',
      address: 'Cedar Mill Road',
      city: 'Greer',
      state: 'SC',
      acres: 45,
      lots: 85,
      acquisitionDate: '2024-08-01',
      acquisitionPrice: 2800000,
      currentValue: 2800000,
      status: 'development',
      entityId: 'ent-005',
      entityName: 'Cedar Mill Phase 2 LLC',
    },
    {
      id: 'asset-004',
      name: 'Downtown Office Building',
      type: 'commercial',
      address: '789 Commerce Ave',
      city: 'Greenville',
      state: 'SC',
      sqft: 28000,
      acquisitionDate: '2022-03-10',
      acquisitionPrice: 3200000,
      currentValue: 3500000,
      noi: 245000,
      capRate: 7.6,
      status: 'operating',
      entityId: 'ent-006',
      entityName: 'VanRock Property Management LLC',
    },
  ];

  const stats = {
    totalAssets: assets.length,
    totalValue: assets.reduce((s, a) => s + a.currentValue, 0),
    totalNOI: assets.filter(a => a.noi).reduce((s, a) => s + (a.noi || 0), 0),
    avgCapRate: assets.filter(a => a.capRate).reduce((s, a, _, arr) => s + (a.capRate || 0) / arr.length, 0),
  };

  const formatCurrency = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toLocaleString()}`;
  };

  const getTypeConfig = (type) => ({
    multifamily: { icon: Building, bg: 'bg-blue-100', text: 'text-blue-700', label: 'Multifamily' },
    mixed_use: { icon: Building2, bg: 'bg-purple-100', text: 'text-purple-700', label: 'Mixed Use' },
    commercial: { icon: Warehouse, bg: 'bg-amber-100', text: 'text-amber-700', label: 'Commercial' },
    land: { icon: Trees, bg: 'bg-green-100', text: 'text-green-700', label: 'Land' },
    residential: { icon: Home, bg: 'bg-teal-100', text: 'text-teal-700', label: 'Residential' },
  }[type] || { icon: Building2, bg: 'bg-gray-100', text: 'text-gray-700', label: type });

  const getStatusConfig = (status) => ({
    operating: { bg: 'bg-green-100', text: 'text-green-700', label: 'Operating' },
    development: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Development' },
    renovation: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Renovation' },
    disposition: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'For Sale' },
  }[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status });

  const filteredAssets = assets.filter(a => {
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;
    if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Asset Management</h1>
          <p className="text-sm text-gray-500">Manage and track real estate assets</p>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]">
          <Plus className="w-4 h-4 mr-2" />Add Asset
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalAssets}</p>
              <p className="text-sm text-gray-500">Total Assets</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
              <p className="text-sm text-gray-500">Total Value</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalNOI)}</p>
              <p className="text-sm text-gray-500">Total NOI</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.avgCapRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-500">Avg Cap Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search assets..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All Types</option>
          <option value="multifamily">Multifamily</option>
          <option value="mixed_use">Mixed Use</option>
          <option value="commercial">Commercial</option>
          <option value="land">Land</option>
          <option value="residential">Residential</option>
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

      {/* Asset List */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Asset</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Current Value</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">NOI</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Cap Rate</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Entity</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredAssets.map(asset => {
              const typeConfig = getTypeConfig(asset.type);
              const statusConfig = getStatusConfig(asset.status);
              const TypeIcon = typeConfig.icon;
              return (
                <tr 
                  key={asset.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/assets/${asset.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", typeConfig.bg)}>
                        <TypeIcon className={cn("w-5 h-5", typeConfig.text)} />
                      </div>
                      <div>
                        <p className="font-medium">{asset.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{asset.city}, {asset.state}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-1 rounded text-xs font-medium", typeConfig.bg, typeConfig.text)}>
                      {typeConfig.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-1 rounded text-xs font-medium", statusConfig.bg, statusConfig.text)}>
                      {statusConfig.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(asset.currentValue)}</td>
                  <td className="px-4 py-3 text-right">{asset.noi ? formatCurrency(asset.noi) : '—'}</td>
                  <td className="px-4 py-3 text-right">{asset.capRate ? `${asset.capRate}%` : '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{asset.entityName}</td>
                  <td className="px-4 py-3">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetManagementListPage;
