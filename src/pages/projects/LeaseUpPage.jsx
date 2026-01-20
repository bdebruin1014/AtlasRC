/**
 * AtlasDev - Lease-Up Tracking Page
 * Comprehensive tracking for Build-to-Rent projects:
 * - Unit availability and leasing status
 * - Occupancy tracking
 * - Lease-up velocity
 * - Rental income projections
 */

import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Plus, Search, Key, Home, DollarSign, TrendingUp, Users,
  Calendar, CheckCircle2, Clock, AlertCircle, ChevronDown,
  Eye, FileText, Phone, Mail, Target, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const LeaseUpPage = () => {
  const { projectId } = useParams();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock project data
  const project = {
    id: projectId,
    name: 'Riverside Commons BTR',
    totalUnits: 48,
    targetOccupancy: 0.95,
    marketRent: {
      '1BR': 1450,
      '2BR': 1750,
      '3BR': 2100,
      '4BR': 2400
    },
    leaseUpStart: '2025-01-15',
    stabilizationTarget: '2025-07-15'
  };

  // Mock units data for lease-up
  const units = [
    { id: 1, number: '101', building: 'A', type: '3BR/2BA', sqft: 1450, status: 'leased', tenant: 'Johnson Family', moveIn: '2025-01-20', rent: 2050, leaseEnd: '2026-01-19' },
    { id: 2, number: '102', building: 'A', type: '2BR/2BA', sqft: 1100, status: 'leased', tenant: 'Sarah Miller', moveIn: '2025-01-25', rent: 1700, leaseEnd: '2026-01-24' },
    { id: 3, number: '103', building: 'A', type: '4BR/2.5BA', sqft: 1800, status: 'pending', tenant: 'Williams Family', applicationDate: '2025-01-05', rent: 2350, moveIn: '2025-02-01' },
    { id: 4, number: '104', building: 'A', type: '3BR/2BA', sqft: 1450, status: 'showing', prospect: 'Mike Thomas', showingDate: '2025-01-12', rent: 2100 },
    { id: 5, number: '105', building: 'A', type: '2BR/2BA', sqft: 1100, status: 'available', rent: 1750 },
    { id: 6, number: '106', building: 'A', type: '3BR/2BA', sqft: 1450, status: 'available', rent: 2050 },
    { id: 7, number: '201', building: 'A', type: '2BR/2BA', sqft: 1100, status: 'leased', tenant: 'David Chen', moveIn: '2025-01-28', rent: 1725, leaseEnd: '2026-01-27' },
    { id: 8, number: '202', building: 'A', type: '4BR/2.5BA', sqft: 1800, status: 'not-ready', completionDate: '2025-02-15', rent: 2400 },
    { id: 9, number: '203', building: 'B', type: '3BR/2BA', sqft: 1450, status: 'pending', tenant: 'Martinez Family', applicationDate: '2025-01-08', rent: 2100, moveIn: '2025-02-05' },
    { id: 10, number: '204', building: 'B', type: '2BR/2BA', sqft: 1100, status: 'available', rent: 1750 },
    { id: 11, number: '301', building: 'B', type: '3BR/2BA', sqft: 1450, status: 'showing', prospect: 'Emily Brown', showingDate: '2025-01-14', rent: 2050 },
    { id: 12, number: '302', building: 'B', type: '4BR/2.5BA', sqft: 1800, status: 'not-ready', completionDate: '2025-02-28', rent: 2400 },
  ];

  // Status configurations
  const statusConfig = {
    leased: { label: 'Leased', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
    showing: { label: 'Showing', color: 'bg-blue-100 text-blue-700', icon: Users },
    available: { label: 'Available', color: 'bg-purple-100 text-purple-700', icon: Key },
    'not-ready': { label: 'Not Ready', color: 'bg-gray-100 text-gray-600', icon: AlertCircle }
  };

  // Calculate summary stats
  const summary = useMemo(() => {
    const leased = units.filter(u => u.status === 'leased');
    const pending = units.filter(u => u.status === 'pending');
    const showing = units.filter(u => u.status === 'showing');
    const available = units.filter(u => u.status === 'available');
    const notReady = units.filter(u => u.status === 'not-ready');
    
    const monthlyRent = leased.reduce((sum, u) => sum + u.rent, 0);
    const pendingRent = pending.reduce((sum, u) => sum + u.rent, 0);
    const potentialRent = units.reduce((sum, u) => sum + u.rent, 0);
    
    const occupiedUnits = leased.length + pending.length;
    const readyUnits = units.length - notReady.length;
    
    return {
      total: units.length,
      leased: leased.length,
      pending: pending.length,
      showing: showing.length,
      available: available.length,
      notReady: notReady.length,
      occupancyRate: readyUnits > 0 ? (occupiedUnits / readyUnits * 100).toFixed(1) : 0,
      preLeasedRate: readyUnits > 0 ? ((leased.length + pending.length) / readyUnits * 100).toFixed(1) : 0,
      monthlyRent,
      pendingRent,
      potentialRent,
      avgRent: leased.length > 0 ? Math.round(monthlyRent / leased.length) : 0
    };
  }, []);

  const formatCurrency = (val) => {
    if (!val) return '-';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      maximumFractionDigits: 0 
    }).format(val);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Filter units
  const filteredUnits = useMemo(() => {
    return units.filter(unit => {
      if (filterStatus !== 'all' && unit.status !== filterStatus) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          unit.number.toLowerCase().includes(query) ||
          unit.type.toLowerCase().includes(query) ||
          unit.tenant?.toLowerCase().includes(query) ||
          unit.prospect?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [units, filterStatus, searchQuery]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Lease-Up Tracking</h1>
            <p className="text-sm text-gray-500">
              {project.name} • {project.totalUnits} Units • Target Stabilization: {formatDate(project.stabilizationTarget)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <BarChart3 className="w-4 h-4 mr-1" />Reports
            </Button>
            <Button className="bg-[#047857] hover:bg-[#065f46]">
              <Plus className="w-4 h-4 mr-1" />Add Prospect
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-7 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 border">
            <p className="text-xs text-gray-500 mb-1">Total Units</p>
            <p className="text-lg font-bold">{summary.total}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <p className="text-xs text-green-700 mb-1">Leased</p>
            <p className="text-lg font-bold text-green-700">{summary.leased}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <p className="text-xs text-amber-700 mb-1">Pending</p>
            <p className="text-lg font-bold text-amber-700">{summary.pending}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-blue-700 mb-1">Showings</p>
            <p className="text-lg font-bold text-blue-700">{summary.showing}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <p className="text-xs text-purple-700 mb-1">Available</p>
            <p className="text-lg font-bold text-purple-700">{summary.available}</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
            <p className="text-xs text-emerald-700 mb-1">Occupancy</p>
            <p className="text-lg font-bold text-emerald-700">{summary.occupancyRate}%</p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
            <p className="text-xs text-indigo-700 mb-1">Monthly Rent</p>
            <p className="text-lg font-bold text-indigo-700">{formatCurrency(summary.monthlyRent)}</p>
          </div>
        </div>
      </div>

      {/* Progress to Stabilization */}
      <div className="px-6 py-4 bg-white border-b">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress to Stabilization ({project.targetOccupancy * 100}%)</span>
              <span className="text-sm font-bold text-emerald-700">{summary.preLeasedRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className={cn(
                  "h-4 rounded-full transition-all",
                  parseFloat(summary.preLeasedRate) >= 95 ? "bg-emerald-500" :
                  parseFloat(summary.preLeasedRate) >= 75 ? "bg-blue-500" :
                  parseFloat(summary.preLeasedRate) >= 50 ? "bg-amber-500" : "bg-red-500"
                )}
                style={{ width: `${Math.min(parseFloat(summary.preLeasedRate), 100)}%` }}
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Target Date</p>
            <p className="font-semibold">{formatDate(project.stabilizationTarget)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4 bg-white">
        <div className="flex items-center gap-1 border-b">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'units', label: 'Unit Status' },
            { id: 'prospects', label: 'Prospects' },
            { id: 'leases', label: 'Active Leases' }
          ].map(tab => (
            <button
              key={tab.id}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === tab.id 
                  ? "border-emerald-500 text-emerald-700" 
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-3 gap-6">
            {/* Weekly Activity */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">This Week&apos;s Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">New Inquiries</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Showings Scheduled</span>
                  <span className="font-semibold">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Applications Received</span>
                  <span className="font-semibold">4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Leases Signed</span>
                  <span className="font-semibold text-green-600">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Move-Ins</span>
                  <span className="font-semibold text-emerald-600">2</span>
                </div>
              </div>
            </div>

            {/* Rent Analysis */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Rent Analysis</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Gross Potential Rent</span>
                  <span className="font-semibold">{formatCurrency(summary.potentialRent)}/mo</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Actual Rent (Leased)</span>
                  <span className="font-semibold text-green-600">{formatCurrency(summary.monthlyRent)}/mo</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Pending Rent</span>
                  <span className="font-semibold text-amber-600">{formatCurrency(summary.pendingRent)}/mo</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Average Rent</span>
                  <span className="font-semibold">{formatCurrency(summary.avgRent)}/mo</span>
                </div>
              </div>
            </div>

            {/* Pipeline Summary */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Leasing Pipeline</h3>
              <div className="space-y-3">
                {Object.entries(statusConfig).map(([key, config]) => {
                  const count = units.filter(u => u.status === key).length;
                  const Icon = config.icon;
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", config.color.replace('text-', 'bg-').replace('-700', '-200'))}>
                        <Icon className={cn("w-4 h-4", config.color.split(' ')[1])} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{config.label}</span>
                          <span className="font-semibold">{count}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                          <div 
                            className={cn("h-1.5 rounded-full", config.color.split(' ')[0])}
                            style={{ width: `${(count / units.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'units' && (
          <div className="bg-white rounded-lg border">
            {/* Filters */}
            <div className="p-4 border-b flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="Search units, tenants..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select 
                className="h-10 px-3 border rounded-md text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>

            {/* Table */}
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Unit</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Tenant/Prospect</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-700">Rent</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Move-In</th>
                  <th className="w-12 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUnits.map(unit => {
                  const status = statusConfig[unit.status];
                  const StatusIcon = status.icon;
                  
                  return (
                    <tr key={unit.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-emerald-700">Unit {unit.number}</p>
                          <p className="text-xs text-gray-500">Building {unit.building}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{unit.type}</p>
                          <p className="text-xs text-gray-500">{unit.sqft.toLocaleString()} SF</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium", status.color)}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {unit.tenant || unit.prospect || '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(unit.rent)}
                      </td>
                      <td className="px-4 py-3">
                        {unit.moveIn ? formatDate(unit.moveIn) : 
                         unit.showingDate ? `Showing: ${formatDate(unit.showingDate)}` :
                         unit.completionDate ? `Ready: ${formatDate(unit.completionDate)}` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'prospects' && (
          <div className="bg-white rounded-lg border p-8 text-center">
            <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Prospect Management</h3>
            <p className="text-sm text-gray-500 mb-4">
              Track leads, schedule showings, and manage applications.
            </p>
            <Button className="bg-[#047857] hover:bg-[#065f46]">
              <Plus className="w-4 h-4 mr-2" />Add Prospect
            </Button>
          </div>
        )}

        {activeTab === 'leases' && (
          <div className="bg-white rounded-lg border p-8 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Active Leases</h3>
            <p className="text-sm text-gray-500 mb-4">
              View and manage all active lease agreements.
            </p>
            <Button variant="outline">
              View Leases
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaseUpPage;
