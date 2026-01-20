/**
 * AtlasDev - Units/Lots Management Page
 * Comprehensive tracking for multi-unit projects:
 * - Lot Development (100+ lots)
 * - Build-to-Rent Communities
 * - Build-to-Sell Communities
 * - Lot Purchase & Build scenarios
 */

import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Plus, Search, Filter, Download, Upload, Grid3X3, List, 
  MapPin, Home, Building2, Key, DollarSign, Calendar,
  ChevronDown, MoreHorizontal, Edit2, Eye, FileText,
  CheckCircle2, Clock, AlertCircle, TrendingUp, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const UnitsManagementPage = () => {
  const { projectId } = useParams();
  const [viewMode, setViewMode] = useState('grid'); // grid, list, map
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPhase, setFilterPhase] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Mock project data - would come from context/API
  const project = {
    id: projectId,
    name: 'Riverside Commons',
    type: 'bts-community',
    unitType: 'homes',
    totalUnits: 48,
    phases: [
      { id: 'phase-1', name: 'Phase 1', units: 16, status: 'construction' },
      { id: 'phase-2', name: 'Phase 2', units: 16, status: 'planned' },
      { id: 'phase-3', name: 'Phase 3', units: 16, status: 'planned' }
    ]
  };

  // Mock units data
  const units = [
    { id: 1, number: 'LOT-001', phase: 'Phase 1', block: 'A', lot: '1', address: '101 Riverside Dr', homePlan: 'Cherry', sqft: 2214, beds: 4, baths: 2.5, status: 'sold', constructionStatus: 'complete', listPrice: 425000, salePrice: 418000, buyer: 'John Smith', closingDate: '2024-12-15' },
    { id: 2, number: 'LOT-002', phase: 'Phase 1', block: 'A', lot: '2', address: '103 Riverside Dr', homePlan: 'Maple', sqft: 1856, beds: 3, baths: 2, status: 'sold', constructionStatus: 'complete', listPrice: 385000, salePrice: 382000, buyer: 'Jane Doe', closingDate: '2024-12-20' },
    { id: 3, number: 'LOT-003', phase: 'Phase 1', block: 'A', lot: '3', address: '105 Riverside Dr', homePlan: 'Cherry', sqft: 2214, beds: 4, baths: 2.5, status: 'under-contract', constructionStatus: 'complete', listPrice: 429000, contractPrice: 425000, buyer: 'Mike Johnson', closingDate: '2025-01-15' },
    { id: 4, number: 'LOT-004', phase: 'Phase 1', block: 'A', lot: '4', address: '107 Riverside Dr', homePlan: 'Oak', sqft: 2650, beds: 5, baths: 3, status: 'available', constructionStatus: 'complete', listPrice: 485000 },
    { id: 5, number: 'LOT-005', phase: 'Phase 1', block: 'B', lot: '1', address: '102 Riverside Dr', homePlan: 'Cherry', sqft: 2214, beds: 4, baths: 2.5, status: 'available', constructionStatus: 'in-progress', percentComplete: 75, listPrice: 432000 },
    { id: 6, number: 'LOT-006', phase: 'Phase 1', block: 'B', lot: '2', address: '104 Riverside Dr', homePlan: 'Maple', sqft: 1856, beds: 3, baths: 2, status: 'available', constructionStatus: 'in-progress', percentComplete: 60, listPrice: 389000 },
    { id: 7, number: 'LOT-007', phase: 'Phase 1', block: 'B', lot: '3', address: '106 Riverside Dr', homePlan: 'Oak', sqft: 2650, beds: 5, baths: 3, status: 'reserved', constructionStatus: 'in-progress', percentComplete: 45, listPrice: 492000, reservedBy: 'Sarah Wilson', reserveExpires: '2025-01-05' },
    { id: 8, number: 'LOT-008', phase: 'Phase 1', block: 'B', lot: '4', address: '108 Riverside Dr', homePlan: 'Cherry', sqft: 2214, beds: 4, baths: 2.5, status: 'available', constructionStatus: 'foundation', percentComplete: 15, listPrice: 435000 },
    { id: 9, number: 'LOT-009', phase: 'Phase 2', block: 'C', lot: '1', address: '201 Riverside Dr', homePlan: null, sqft: null, beds: null, baths: null, status: 'planned', constructionStatus: 'not-started', listPrice: null },
    { id: 10, number: 'LOT-010', phase: 'Phase 2', block: 'C', lot: '2', address: '203 Riverside Dr', homePlan: null, sqft: null, beds: null, baths: null, status: 'planned', constructionStatus: 'not-started', listPrice: null },
  ];

  // Home plans library (would come from admin templates)
  const homePlans = [
    { id: 'cherry', name: 'Cherry', sqft: 2214, beds: 4, baths: 2.5, baseCost: 245000 },
    { id: 'maple', name: 'Maple', sqft: 1856, beds: 3, baths: 2, baseCost: 198000 },
    { id: 'oak', name: 'Oak', sqft: 2650, beds: 5, baths: 3, baseCost: 285000 },
    { id: 'willow', name: 'Willow', sqft: 1650, beds: 3, baths: 2, baseCost: 175000 },
  ];

  // Status configurations
  const statusConfig = {
    planned: { label: 'Planned', color: 'bg-gray-100 text-gray-700', icon: Clock },
    available: { label: 'Available', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    reserved: { label: 'Reserved', color: 'bg-amber-100 text-amber-700', icon: Clock },
    'under-contract': { label: 'Under Contract', color: 'bg-blue-100 text-blue-700', icon: FileText },
    sold: { label: 'Sold', color: 'bg-purple-100 text-purple-700', icon: DollarSign },
    leased: { label: 'Leased', color: 'bg-teal-100 text-teal-700', icon: Key }
  };

  const constructionStatusConfig = {
    'not-started': { label: 'Not Started', color: 'bg-gray-100 text-gray-600' },
    'site-prep': { label: 'Site Prep', color: 'bg-yellow-100 text-yellow-700' },
    'foundation': { label: 'Foundation', color: 'bg-orange-100 text-orange-700' },
    'framing': { label: 'Framing', color: 'bg-blue-100 text-blue-700' },
    'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
    'complete': { label: 'Complete', color: 'bg-green-100 text-green-700' }
  };

  // Filter and search
  const filteredUnits = useMemo(() => {
    return units.filter(unit => {
      if (filterStatus !== 'all' && unit.status !== filterStatus) return false;
      if (filterPhase !== 'all' && unit.phase !== filterPhase) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          unit.number.toLowerCase().includes(query) ||
          unit.address?.toLowerCase().includes(query) ||
          unit.homePlan?.toLowerCase().includes(query) ||
          unit.buyer?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [units, filterStatus, filterPhase, searchQuery]);

  // Summary stats
  const summary = useMemo(() => {
    const stats = {
      total: units.length,
      planned: units.filter(u => u.status === 'planned').length,
      available: units.filter(u => u.status === 'available').length,
      reserved: units.filter(u => u.status === 'reserved').length,
      underContract: units.filter(u => u.status === 'under-contract').length,
      sold: units.filter(u => u.status === 'sold').length,
      totalRevenue: units.filter(u => u.salePrice).reduce((sum, u) => sum + u.salePrice, 0),
      pendingRevenue: units.filter(u => u.status === 'under-contract').reduce((sum, u) => sum + (u.contractPrice || u.listPrice), 0),
      constructionComplete: units.filter(u => u.constructionStatus === 'complete').length,
      constructionInProgress: units.filter(u => ['in-progress', 'foundation', 'framing', 'site-prep'].includes(u.constructionStatus)).length
    };
    return stats;
  }, [units]);

  const formatCurrency = (val) => {
    if (!val) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const toggleUnitSelection = (unitId) => {
    setSelectedUnits(prev => 
      prev.includes(unitId) ? prev.filter(id => id !== unitId) : [...prev, unitId]
    );
  };

  const selectAllFiltered = () => {
    if (selectedUnits.length === filteredUnits.length) {
      setSelectedUnits([]);
    } else {
      setSelectedUnits(filteredUnits.map(u => u.id));
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Units Management</h1>
            <p className="text-sm text-gray-500">{project.name} • {project.totalUnits} {project.unitType}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-1" />Import
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />Export
            </Button>
            <Button className="bg-[#047857] hover:bg-[#065f46]">
              <Plus className="w-4 h-4 mr-1" />Add Unit
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-6 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 border">
            <p className="text-xs text-gray-500 mb-1">Total Units</p>
            <p className="text-lg font-bold">{summary.total}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <p className="text-xs text-green-700 mb-1">Available</p>
            <p className="text-lg font-bold text-green-700">{summary.available}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <p className="text-xs text-amber-700 mb-1">Reserved</p>
            <p className="text-lg font-bold text-amber-700">{summary.reserved}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-blue-700 mb-1">Under Contract</p>
            <p className="text-lg font-bold text-blue-700">{summary.underContract}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <p className="text-xs text-purple-700 mb-1">Sold</p>
            <p className="text-lg font-bold text-purple-700">{summary.sold}</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
            <p className="text-xs text-emerald-700 mb-1">Revenue</p>
            <p className="text-lg font-bold text-emerald-700">{formatCurrency(summary.totalRevenue)}</p>
          </div>
        </div>
      </div>

      {/* Filters & View Toggle */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search units, addresses, buyers..." 
              className="pl-9 w-64 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="h-9 px-3 border rounded-md text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="planned">Planned</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="under-contract">Under Contract</option>
            <option value="sold">Sold</option>
          </select>
          <select 
            className="h-9 px-3 border rounded-md text-sm"
            value={filterPhase}
            onChange={(e) => setFilterPhase(e.target.value)}
          >
            <option value="all">All Phases</option>
            {project.phases.map(phase => (
              <option key={phase.id} value={phase.name}>{phase.name}</option>
            ))}
          </select>
          {selectedUnits.length > 0 && (
            <div className="flex items-center gap-2 ml-4 pl-4 border-l">
              <span className="text-sm text-gray-500">{selectedUnits.length} selected</span>
              <Button variant="outline" size="sm">Bulk Edit</Button>
              <Button variant="outline" size="sm">Assign Plan</Button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button 
            className={cn("p-2 rounded", viewMode === 'grid' && "bg-white shadow-sm")}
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button 
            className={cn("p-2 rounded", viewMode === 'list' && "bg-white shadow-sm")}
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </button>
          <button 
            className={cn("p-2 rounded", viewMode === 'map' && "bg-white shadow-sm")}
            onClick={() => setViewMode('map')}
          >
            <MapPin className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-4 gap-4">
            {filteredUnits.map(unit => {
              const status = statusConfig[unit.status];
              const construction = constructionStatusConfig[unit.constructionStatus];
              const StatusIcon = status?.icon || Clock;
              const isSelected = selectedUnits.includes(unit.id);
              
              return (
                <div 
                  key={unit.id}
                  className={cn(
                    "bg-white rounded-lg border p-4 cursor-pointer hover:shadow-md transition-shadow",
                    isSelected && "ring-2 ring-emerald-500"
                  )}
                  onClick={() => toggleUnitSelection(unit.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{unit.number}</h3>
                      <p className="text-xs text-gray-500">{unit.address || 'Address TBD'}</p>
                    </div>
                    <span className={cn("px-2 py-1 rounded text-xs font-medium", status?.color)}>
                      {status?.label}
                    </span>
                  </div>
                  
                  {unit.homePlan ? (
                    <div className="bg-gray-50 rounded p-3 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Home className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-sm">{unit.homePlan}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                        <div>{unit.sqft?.toLocaleString()} SF</div>
                        <div>{unit.beds} Bed</div>
                        <div>{unit.baths} Bath</div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded p-3 mb-3 text-center">
                      <p className="text-xs text-gray-400">No plan assigned</p>
                      <button className="text-xs text-emerald-600 hover:underline mt-1">
                        Assign Plan
                      </button>
                    </div>
                  )}

                  {/* Construction Progress */}
                  {unit.constructionStatus !== 'not-started' && unit.constructionStatus !== 'complete' && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">Construction</span>
                        <span className="font-medium">{unit.percentComplete}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full" 
                          style={{ width: `${unit.percentComplete}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t">
                    {unit.listPrice ? (
                      <div>
                        <p className="text-xs text-gray-500">List Price</p>
                        <p className="font-semibold text-emerald-700">{formatCurrency(unit.listPrice)}</p>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">Price TBD</div>
                    )}
                    <span className={cn("px-2 py-0.5 rounded text-[10px]", construction?.color)}>
                      {construction?.label}
                    </span>
                  </div>

                  {/* Buyer/Contract Info */}
                  {(unit.buyer || unit.reservedBy) && (
                    <div className="mt-3 pt-3 border-t flex items-center gap-2">
                      <Users className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600 truncate">
                        {unit.buyer || unit.reservedBy}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : viewMode === 'list' ? (
          /* List View */
          <div className="bg-white rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="w-8 px-4 py-3">
                    <input 
                      type="checkbox" 
                      checked={selectedUnits.length === filteredUnits.length && filteredUnits.length > 0}
                      onChange={selectAllFiltered}
                      className="rounded"
                    />
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Unit #</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Phase</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Address</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Home Plan</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Size</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Construction</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-700">Price</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Buyer</th>
                  <th className="w-12 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUnits.map(unit => {
                  const status = statusConfig[unit.status];
                  const construction = constructionStatusConfig[unit.constructionStatus];
                  const isSelected = selectedUnits.includes(unit.id);
                  
                  return (
                    <tr key={unit.id} className={cn("hover:bg-gray-50", isSelected && "bg-emerald-50")}>
                      <td className="px-4 py-3">
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleUnitSelection(unit.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-emerald-700">{unit.number}</td>
                      <td className="px-4 py-3 text-gray-600">{unit.phase}</td>
                      <td className="px-4 py-3 text-gray-600">{unit.address || '-'}</td>
                      <td className="px-4 py-3">
                        {unit.homePlan ? (
                          <span className="font-medium">{unit.homePlan}</span>
                        ) : (
                          <button className="text-emerald-600 hover:underline text-xs">Assign</button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {unit.sqft ? `${unit.sqft.toLocaleString()} SF` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("px-2 py-1 rounded text-xs", status?.color)}>
                          {status?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={cn("px-2 py-0.5 rounded text-xs", construction?.color)}>
                            {construction?.label}
                          </span>
                          {unit.percentComplete && (
                            <span className="text-xs text-gray-500">{unit.percentComplete}%</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {unit.salePrice ? (
                          <span className="text-emerald-700">{formatCurrency(unit.salePrice)}</span>
                        ) : (
                          formatCurrency(unit.listPrice)
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 truncate max-w-[120px]">
                        {unit.buyer || unit.reservedBy || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Map View Placeholder */
          <div className="bg-white rounded-lg border p-8 text-center">
            <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Site Map View</h3>
            <p className="text-sm text-gray-500 mb-4">
              Interactive site map with lot locations - Mock visualization coming
              Upload your site plan to enable map view.
            </p>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />Upload Site Plan
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitsManagementPage;
