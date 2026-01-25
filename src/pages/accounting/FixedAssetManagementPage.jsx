import React, { useState, useMemo } from 'react';
import {
  Building, Truck, Computer, Wrench, DollarSign, Calendar, Filter,
  Search, Plus, Edit, Trash2, Eye, ChevronDown, ChevronRight,
  AlertTriangle, CheckCircle, Clock, TrendingDown, Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const mockAssets = [
  {
    id: 'FA-001',
    name: 'Downtown Tower - Building',
    category: 'Buildings',
    subcategory: 'Commercial Property',
    location: 'Downtown Tower',
    acquisitionDate: '2019-03-15',
    acquisitionCost: 15500000.00,
    usefulLife: 39,
    salvageValue: 1550000.00,
    depreciationMethod: 'Straight-Line',
    accumulatedDepreciation: 1987179.49,
    netBookValue: 13512820.51,
    status: 'active',
    serialNumber: 'N/A',
    vendor: 'Previous Owner',
    poNumber: 'ACQ-2019-001',
    condition: 'good',
    lastInspection: '2023-12-15',
    insurancePolicy: 'POL-2024-DWT',
    notes: 'Primary commercial property asset'
  },
  {
    id: 'FA-002',
    name: 'Riverside Plaza - Building',
    category: 'Buildings',
    subcategory: 'Mixed-Use Property',
    location: 'Riverside Plaza',
    acquisitionDate: '2021-06-01',
    acquisitionCost: 22000000.00,
    usefulLife: 39,
    salvageValue: 2200000.00,
    depreciationMethod: 'Straight-Line',
    accumulatedDepreciation: 1448717.95,
    netBookValue: 20551282.05,
    status: 'active',
    serialNumber: 'N/A',
    vendor: 'RSP Developers',
    poNumber: 'ACQ-2021-002',
    condition: 'excellent',
    lastInspection: '2024-01-10',
    insurancePolicy: 'POL-2024-RSP',
    notes: 'Flagship mixed-use development'
  },
  {
    id: 'FA-003',
    name: 'HVAC System - Downtown Tower',
    category: 'Building Improvements',
    subcategory: 'HVAC Equipment',
    location: 'Downtown Tower',
    acquisitionDate: '2022-08-15',
    acquisitionCost: 485000.00,
    usefulLife: 15,
    salvageValue: 25000.00,
    depreciationMethod: 'Straight-Line',
    accumulatedDepreciation: 51111.11,
    netBookValue: 433888.89,
    status: 'active',
    serialNumber: 'HVAC-DWT-2022-A',
    vendor: 'HVAC Solutions Inc.',
    poNumber: 'PO-2022-0156',
    condition: 'excellent',
    lastInspection: '2024-01-05',
    insurancePolicy: 'POL-2024-DWT',
    notes: 'New rooftop units installed'
  },
  {
    id: 'FA-004',
    name: 'Elevator System - Riverside',
    category: 'Building Improvements',
    subcategory: 'Elevator Equipment',
    location: 'Riverside Plaza',
    acquisitionDate: '2021-06-01',
    acquisitionCost: 750000.00,
    usefulLife: 20,
    salvageValue: 50000.00,
    depreciationMethod: 'Straight-Line',
    accumulatedDepreciation: 91250.00,
    netBookValue: 658750.00,
    status: 'active',
    serialNumber: 'ELV-RSP-001-004',
    vendor: 'Otis Elevator',
    poNumber: 'ACQ-2021-002',
    condition: 'good',
    lastInspection: '2023-11-20',
    insurancePolicy: 'POL-2024-RSP',
    notes: '4 elevator system'
  },
  {
    id: 'FA-005',
    name: 'Company Vehicles Fleet',
    category: 'Vehicles',
    subcategory: 'Company Cars',
    location: 'Corporate HQ',
    acquisitionDate: '2023-01-10',
    acquisitionCost: 185000.00,
    usefulLife: 5,
    salvageValue: 35000.00,
    depreciationMethod: 'Straight-Line',
    accumulatedDepreciation: 30000.00,
    netBookValue: 155000.00,
    status: 'active',
    serialNumber: 'Various',
    vendor: 'Auto Fleet Inc.',
    poNumber: 'PO-2023-0012',
    condition: 'good',
    lastInspection: '2024-01-15',
    insurancePolicy: 'POL-2024-FLEET',
    notes: '5 company vehicles'
  },
  {
    id: 'FA-006',
    name: 'Office Furniture - HQ',
    category: 'Furniture & Fixtures',
    subcategory: 'Office Furniture',
    location: 'Corporate HQ',
    acquisitionDate: '2022-03-01',
    acquisitionCost: 125000.00,
    usefulLife: 7,
    salvageValue: 5000.00,
    depreciationMethod: 'Straight-Line',
    accumulatedDepreciation: 32857.14,
    netBookValue: 92142.86,
    status: 'active',
    serialNumber: 'N/A',
    vendor: 'Office Designs Co.',
    poNumber: 'PO-2022-0089',
    condition: 'good',
    lastInspection: 'N/A',
    insurancePolicy: 'POL-2024-HQ',
    notes: 'Executive and common area furniture'
  },
  {
    id: 'FA-007',
    name: 'Server Infrastructure',
    category: 'IT Equipment',
    subcategory: 'Servers',
    location: 'Corporate HQ',
    acquisitionDate: '2023-06-15',
    acquisitionCost: 95000.00,
    usefulLife: 5,
    salvageValue: 5000.00,
    depreciationMethod: 'Straight-Line',
    accumulatedDepreciation: 10500.00,
    netBookValue: 84500.00,
    status: 'active',
    serialNumber: 'SRV-2023-001-010',
    vendor: 'Dell Technologies',
    poNumber: 'PO-2023-0145',
    condition: 'excellent',
    lastInspection: '2024-01-20',
    insurancePolicy: 'POL-2024-IT',
    notes: 'Primary datacenter equipment'
  },
  {
    id: 'FA-008',
    name: 'Old Parking Structure',
    category: 'Buildings',
    subcategory: 'Parking Facility',
    location: 'Downtown Tower',
    acquisitionDate: '2015-08-01',
    acquisitionCost: 2500000.00,
    usefulLife: 30,
    salvageValue: 250000.00,
    depreciationMethod: 'Straight-Line',
    accumulatedDepreciation: 2500000.00,
    netBookValue: 0,
    status: 'disposed',
    serialNumber: 'N/A',
    vendor: 'Original Construction',
    poNumber: 'N/A',
    condition: 'disposed',
    lastInspection: 'N/A',
    insurancePolicy: 'N/A',
    notes: 'Demolished for new development',
    disposalDate: '2023-10-01',
    disposalAmount: 150000.00,
    disposalMethod: 'Demolition Sale'
  }
];

const categoryIcons = {
  'Buildings': Building,
  'Building Improvements': Wrench,
  'Vehicles': Truck,
  'Furniture & Fixtures': Package,
  'IT Equipment': Computer
};

const conditionConfig = {
  excellent: { label: 'Excellent', color: 'bg-green-100 text-green-800' },
  good: { label: 'Good', color: 'bg-blue-100 text-blue-800' },
  fair: { label: 'Fair', color: 'bg-yellow-100 text-yellow-800' },
  poor: { label: 'Poor', color: 'bg-red-100 text-red-800' },
  disposed: { label: 'Disposed', color: 'bg-gray-100 text-gray-800' }
};

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800' },
  disposed: { label: 'Disposed', color: 'bg-gray-100 text-gray-800' },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' }
};

export default function FixedAssetManagementPage() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(mockAssets[0]);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = useMemo(() => {
    const cats = [...new Set(mockAssets.map(a => a.category))];
    return ['all', ...cats];
  }, []);

  const filteredAssets = useMemo(() => {
    return mockAssets.filter(asset => {
      const matchesStatus = filter === 'all' || asset.status === filter;
      const matchesCategory = categoryFilter === 'all' || asset.category === categoryFilter;
      const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.location.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [filter, categoryFilter, searchTerm]);

  const stats = useMemo(() => {
    const activeAssets = mockAssets.filter(a => a.status === 'active');
    return {
      totalAssets: activeAssets.length,
      totalCost: activeAssets.reduce((sum, a) => sum + a.acquisitionCost, 0),
      totalNBV: activeAssets.reduce((sum, a) => sum + a.netBookValue, 0),
      totalDepreciation: activeAssets.reduce((sum, a) => sum + a.accumulatedDepreciation, 0)
    };
  }, []);

  const assetsByCategory = useMemo(() => {
    const cats = {};
    mockAssets.filter(a => a.status === 'active').forEach(asset => {
      if (!cats[asset.category]) {
        cats[asset.category] = { count: 0, cost: 0, nbv: 0 };
      }
      cats[asset.category].count++;
      cats[asset.category].cost += asset.acquisitionCost;
      cats[asset.category].nbv += asset.netBookValue;
    });
    return Object.entries(cats).sort((a, b) => b[1].nbv - a[1].nbv);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fixed Asset Management</h1>
          <p className="text-gray-600">Track and manage company fixed assets</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><TrendingDown className="w-4 h-4 mr-2" />Run Depreciation</Button>
          <Button className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />Add Asset</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Package className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAssets}</p>
              <p className="text-sm text-gray-600">Active Assets</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><DollarSign className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${(stats.totalCost / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-gray-600">Total Cost</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><Building className="w-5 h-5 text-purple-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${(stats.totalNBV / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-gray-600">Net Book Value</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg"><TrendingDown className="w-5 h-5 text-orange-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${(stats.totalDepreciation / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-gray-600">Accum. Depreciation</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {assetsByCategory.slice(0, 4).map(([category, data]) => {
          const Icon = categoryIcons[category] || Package;
          return (
            <div key={category} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">{category}</span>
              </div>
              <p className="text-lg font-bold text-gray-900">${(data.nbv / 1000000).toFixed(2)}M</p>
              <p className="text-xs text-gray-500">{data.count} assets</p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="Search assets..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
          ))}
        </select>
        <div className="flex gap-2">
          {['all', 'active', 'disposed'].map((f) => (
            <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : statusConfig[f]?.label || f}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-2 max-h-[500px] overflow-y-auto">
          {filteredAssets.map((asset) => {
            const Icon = categoryIcons[asset.category] || Package;
            return (
              <div
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className={cn(
                  "bg-white rounded-lg border p-4 cursor-pointer hover:border-blue-300 transition-colors",
                  selectedAsset?.id === asset.id ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{asset.name}</p>
                    <p className="text-sm text-gray-500">{asset.id} • {asset.location}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-semibold text-gray-900">${(asset.netBookValue / 1000).toFixed(0)}K NBV</span>
                      <span className={cn("px-2 py-0.5 rounded text-xs", statusConfig[asset.status].color)}>{statusConfig[asset.status].label}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="col-span-2">
          {selectedAsset && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-gray-900">{selectedAsset.name}</h2>
                      <span className={cn("px-2 py-1 rounded-full text-xs", statusConfig[selectedAsset.status].color)}>{statusConfig[selectedAsset.status].label}</span>
                    </div>
                    <p className="text-gray-600">{selectedAsset.id} • {selectedAsset.category}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm"><Edit className="w-4 h-4" /></Button>
                    {selectedAsset.status === 'active' && <Button variant="outline" size="sm" className="text-red-600"><Trash2 className="w-4 h-4" /></Button>}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Acquisition Cost</p>
                    <p className="text-xl font-bold text-blue-600">${selectedAsset.acquisitionCost.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm text-gray-600">Accum. Depreciation</p>
                    <p className="text-xl font-bold text-orange-600">${selectedAsset.accumulatedDepreciation.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Net Book Value</p>
                    <p className="text-xl font-bold text-green-600">${selectedAsset.netBookValue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Asset Details</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><p className="text-gray-500">Location</p><p className="font-medium">{selectedAsset.location}</p></div>
                  <div><p className="text-gray-500">Subcategory</p><p className="font-medium">{selectedAsset.subcategory}</p></div>
                  <div><p className="text-gray-500">Condition</p><span className={cn("px-2 py-0.5 rounded text-xs", conditionConfig[selectedAsset.condition]?.color)}>{conditionConfig[selectedAsset.condition]?.label}</span></div>
                  <div><p className="text-gray-500">Acquisition Date</p><p className="font-medium">{selectedAsset.acquisitionDate}</p></div>
                  <div><p className="text-gray-500">Serial Number</p><p className="font-medium">{selectedAsset.serialNumber}</p></div>
                  <div><p className="text-gray-500">Vendor</p><p className="font-medium">{selectedAsset.vendor}</p></div>
                </div>
              </div>

              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Depreciation Information</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><p className="text-gray-500">Method</p><p className="font-medium">{selectedAsset.depreciationMethod}</p></div>
                  <div><p className="text-gray-500">Useful Life</p><p className="font-medium">{selectedAsset.usefulLife} years</p></div>
                  <div><p className="text-gray-500">Salvage Value</p><p className="font-medium">${selectedAsset.salvageValue.toLocaleString()}</p></div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Depreciation Progress</span>
                    <span className="font-medium">{((selectedAsset.accumulatedDepreciation / (selectedAsset.acquisitionCost - selectedAsset.salvageValue)) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min(100, (selectedAsset.accumulatedDepreciation / (selectedAsset.acquisitionCost - selectedAsset.salvageValue)) * 100)}%` }} />
                  </div>
                </div>
              </div>

              {selectedAsset.status === 'disposed' && (
                <div className="p-6 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 mb-4">Disposal Information</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div><p className="text-gray-500">Disposal Date</p><p className="font-medium">{selectedAsset.disposalDate}</p></div>
                    <div><p className="text-gray-500">Disposal Amount</p><p className="font-medium">${selectedAsset.disposalAmount?.toLocaleString()}</p></div>
                    <div><p className="text-gray-500">Method</p><p className="font-medium">{selectedAsset.disposalMethod}</p></div>
                  </div>
                </div>
              )}

              {selectedAsset.notes && (
                <div className="p-6 bg-yellow-50 border-t border-yellow-100">
                  <p className="text-sm text-yellow-800"><strong>Notes:</strong> {selectedAsset.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
