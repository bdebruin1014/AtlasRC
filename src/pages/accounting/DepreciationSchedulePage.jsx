import React, { useState, useMemo } from 'react';
import {
  TrendingDown, Calendar, DollarSign, Building, Filter, Search,
  Download, ChevronDown, ChevronRight, Eye, Calculator, Clock,
  CheckCircle, AlertTriangle, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const mockDepreciationSchedule = [
  {
    assetId: 'FA-001',
    assetName: 'Downtown Tower - Building',
    category: 'Buildings',
    acquisitionDate: '2019-03-15',
    acquisitionCost: 15500000.00,
    usefulLife: 39,
    salvageValue: 1550000.00,
    method: 'Straight-Line',
    annualDepreciation: 357692.31,
    monthlyDepreciation: 29807.69,
    schedule: [
      { year: 2024, month: 'January', beginning: 13542628.20, expense: 29807.69, accumulated: 1987179.49, ending: 13512820.51 },
      { year: 2024, month: 'February', beginning: 13512820.51, expense: 29807.69, accumulated: 2016987.18, ending: 13483012.82 },
      { year: 2024, month: 'March', beginning: 13483012.82, expense: 29807.69, accumulated: 2046794.87, ending: 13453205.13 },
      { year: 2024, month: 'April', beginning: 13453205.13, expense: 29807.69, accumulated: 2076602.56, ending: 13423397.44 },
      { year: 2024, month: 'May', beginning: 13423397.44, expense: 29807.69, accumulated: 2106410.25, ending: 13393589.75 },
      { year: 2024, month: 'June', beginning: 13393589.75, expense: 29807.69, accumulated: 2136217.94, ending: 13363782.06 }
    ]
  },
  {
    assetId: 'FA-002',
    assetName: 'Riverside Plaza - Building',
    category: 'Buildings',
    acquisitionDate: '2021-06-01',
    acquisitionCost: 22000000.00,
    usefulLife: 39,
    salvageValue: 2200000.00,
    method: 'Straight-Line',
    annualDepreciation: 507692.31,
    monthlyDepreciation: 42307.69,
    schedule: [
      { year: 2024, month: 'January', beginning: 20593589.74, expense: 42307.69, accumulated: 1448717.95, ending: 20551282.05 },
      { year: 2024, month: 'February', beginning: 20551282.05, expense: 42307.69, accumulated: 1491025.64, ending: 20508974.36 },
      { year: 2024, month: 'March', beginning: 20508974.36, expense: 42307.69, accumulated: 1533333.33, ending: 20466666.67 },
      { year: 2024, month: 'April', beginning: 20466666.67, expense: 42307.69, accumulated: 1575641.02, ending: 20424358.98 },
      { year: 2024, month: 'May', beginning: 20424358.98, expense: 42307.69, accumulated: 1617948.71, ending: 20382051.29 },
      { year: 2024, month: 'June', beginning: 20382051.29, expense: 42307.69, accumulated: 1660256.40, ending: 20339743.60 }
    ]
  },
  {
    assetId: 'FA-003',
    assetName: 'HVAC System - Downtown Tower',
    category: 'Building Improvements',
    acquisitionDate: '2022-08-15',
    acquisitionCost: 485000.00,
    usefulLife: 15,
    salvageValue: 25000.00,
    method: 'Straight-Line',
    annualDepreciation: 30666.67,
    monthlyDepreciation: 2555.56,
    schedule: [
      { year: 2024, month: 'January', beginning: 436444.45, expense: 2555.56, accumulated: 51111.11, ending: 433888.89 },
      { year: 2024, month: 'February', beginning: 433888.89, expense: 2555.56, accumulated: 53666.67, ending: 431333.33 },
      { year: 2024, month: 'March', beginning: 431333.33, expense: 2555.56, accumulated: 56222.23, ending: 428777.77 },
      { year: 2024, month: 'April', beginning: 428777.77, expense: 2555.56, accumulated: 58777.79, ending: 426222.21 },
      { year: 2024, month: 'May', beginning: 426222.21, expense: 2555.56, accumulated: 61333.35, ending: 423666.65 },
      { year: 2024, month: 'June', beginning: 423666.65, expense: 2555.56, accumulated: 63888.91, ending: 421111.09 }
    ]
  },
  {
    assetId: 'FA-005',
    assetName: 'Company Vehicles Fleet',
    category: 'Vehicles',
    acquisitionDate: '2023-01-10',
    acquisitionCost: 185000.00,
    usefulLife: 5,
    salvageValue: 35000.00,
    method: 'Straight-Line',
    annualDepreciation: 30000.00,
    monthlyDepreciation: 2500.00,
    schedule: [
      { year: 2024, month: 'January', beginning: 157500.00, expense: 2500.00, accumulated: 30000.00, ending: 155000.00 },
      { year: 2024, month: 'February', beginning: 155000.00, expense: 2500.00, accumulated: 32500.00, ending: 152500.00 },
      { year: 2024, month: 'March', beginning: 152500.00, expense: 2500.00, accumulated: 35000.00, ending: 150000.00 },
      { year: 2024, month: 'April', beginning: 150000.00, expense: 2500.00, accumulated: 37500.00, ending: 147500.00 },
      { year: 2024, month: 'May', beginning: 147500.00, expense: 2500.00, accumulated: 40000.00, ending: 145000.00 },
      { year: 2024, month: 'June', beginning: 145000.00, expense: 2500.00, accumulated: 42500.00, ending: 142500.00 }
    ]
  }
];

const monthlyTotals = [
  { month: 'January 2024', buildings: 72115.38, improvements: 2555.56, vehicles: 2500.00, equipment: 1750.00, furniture: 1428.57, total: 80349.51, posted: true },
  { month: 'February 2024', buildings: 72115.38, improvements: 2555.56, vehicles: 2500.00, equipment: 1750.00, furniture: 1428.57, total: 80349.51, posted: true },
  { month: 'March 2024', buildings: 72115.38, improvements: 2555.56, vehicles: 2500.00, equipment: 1750.00, furniture: 1428.57, total: 80349.51, posted: false },
  { month: 'April 2024', buildings: 72115.38, improvements: 2555.56, vehicles: 2500.00, equipment: 1750.00, furniture: 1428.57, total: 80349.51, posted: false },
  { month: 'May 2024', buildings: 72115.38, improvements: 2555.56, vehicles: 2500.00, equipment: 1750.00, furniture: 1428.57, total: 80349.51, posted: false },
  { month: 'June 2024', buildings: 72115.38, improvements: 2555.56, vehicles: 2500.00, equipment: 1750.00, furniture: 1428.57, total: 80349.51, posted: false }
];

export default function DepreciationSchedulePage() {
  const [view, setView] = useState('summary');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [expandedAssets, setExpandedAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleAsset = (assetId) => {
    setExpandedAssets(prev =>
      prev.includes(assetId) ? prev.filter(id => id !== assetId) : [...prev, assetId]
    );
  };

  const stats = useMemo(() => ({
    totalMonthly: mockDepreciationSchedule.reduce((sum, a) => sum + a.monthlyDepreciation, 0),
    totalAnnual: mockDepreciationSchedule.reduce((sum, a) => sum + a.annualDepreciation, 0),
    assetCount: mockDepreciationSchedule.length,
    nextPostingDate: 'March 2024'
  }), []);

  const filteredAssets = useMemo(() => {
    return mockDepreciationSchedule.filter(asset =>
      asset.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.assetId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Depreciation Schedule</h1>
          <p className="text-gray-600">View and manage asset depreciation schedules</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export Schedule</Button>
          <Button className="bg-blue-600 hover:bg-blue-700"><Calculator className="w-4 h-4 mr-2" />Calculate & Post</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><TrendingDown className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${stats.totalMonthly.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Monthly Depreciation</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><DollarSign className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${(stats.totalAnnual / 1000).toFixed(0)}K</p>
              <p className="text-sm text-gray-600">Annual Depreciation</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><Building className="w-5 h-5 text-purple-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.assetCount}</p>
              <p className="text-sm text-gray-600">Depreciating Assets</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg"><Clock className="w-5 h-5 text-yellow-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.nextPostingDate}</p>
              <p className="text-sm text-gray-600">Next Posting</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <Button variant={view === 'summary' ? 'default' : 'outline'} size="sm" onClick={() => setView('summary')}>Monthly Summary</Button>
          <Button variant={view === 'detail' ? 'default' : 'outline'} size="sm" onClick={() => setView('detail')}>Asset Detail</Button>
          <Button variant={view === 'forecast' ? 'default' : 'outline'} size="sm" onClick={() => setView('forecast')}>Annual Forecast</Button>
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="Search assets..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
      </div>

      {view === 'summary' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Monthly Depreciation Summary - 2024</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="p-4">Month</th>
                <th className="p-4 text-right">Buildings</th>
                <th className="p-4 text-right">Improvements</th>
                <th className="p-4 text-right">Vehicles</th>
                <th className="p-4 text-right">Equipment</th>
                <th className="p-4 text-right">Furniture</th>
                <th className="p-4 text-right">Total</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {monthlyTotals.map((month, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium">{month.month}</td>
                  <td className="p-4 text-right">${month.buildings.toLocaleString()}</td>
                  <td className="p-4 text-right">${month.improvements.toLocaleString()}</td>
                  <td className="p-4 text-right">${month.vehicles.toLocaleString()}</td>
                  <td className="p-4 text-right">${month.equipment.toLocaleString()}</td>
                  <td className="p-4 text-right">${month.furniture.toLocaleString()}</td>
                  <td className="p-4 text-right font-semibold">${month.total.toLocaleString()}</td>
                  <td className="p-4 text-center">
                    {month.posted ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3" />Posted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3" />Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-semibold">
                <td className="p-4">YTD Total</td>
                <td className="p-4 text-right">${(monthlyTotals.reduce((s, m) => s + m.buildings, 0)).toLocaleString()}</td>
                <td className="p-4 text-right">${(monthlyTotals.reduce((s, m) => s + m.improvements, 0)).toLocaleString()}</td>
                <td className="p-4 text-right">${(monthlyTotals.reduce((s, m) => s + m.vehicles, 0)).toLocaleString()}</td>
                <td className="p-4 text-right">${(monthlyTotals.reduce((s, m) => s + m.equipment, 0)).toLocaleString()}</td>
                <td className="p-4 text-right">${(monthlyTotals.reduce((s, m) => s + m.furniture, 0)).toLocaleString()}</td>
                <td className="p-4 text-right">${(monthlyTotals.reduce((s, m) => s + m.total, 0)).toLocaleString()}</td>
                <td className="p-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {view === 'detail' && (
        <div className="space-y-4">
          {filteredAssets.map((asset) => (
            <div key={asset.assetId} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => toggleAsset(asset.assetId)}
              >
                <div className="flex items-center gap-4">
                  {expandedAssets.includes(asset.assetId) ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  <div>
                    <p className="font-semibold text-gray-900">{asset.assetName}</p>
                    <p className="text-sm text-gray-500">{asset.assetId} • {asset.category} • {asset.method}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8 text-sm">
                  <div className="text-right">
                    <p className="text-gray-500">Monthly</p>
                    <p className="font-semibold">${asset.monthlyDepreciation.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500">Annual</p>
                    <p className="font-semibold">${asset.annualDepreciation.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500">Useful Life</p>
                    <p className="font-semibold">{asset.usefulLife} years</p>
                  </div>
                </div>
              </div>

              {expandedAssets.includes(asset.assetId) && (
                <div className="border-t border-gray-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 bg-gray-50 border-b">
                        <th className="p-3">Period</th>
                        <th className="p-3 text-right">Beginning NBV</th>
                        <th className="p-3 text-right">Depreciation</th>
                        <th className="p-3 text-right">Accum. Depr.</th>
                        <th className="p-3 text-right">Ending NBV</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asset.schedule.map((period, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="p-3">{period.month} {period.year}</td>
                          <td className="p-3 text-right">${period.beginning.toLocaleString()}</td>
                          <td className="p-3 text-right text-red-600">(${period.expense.toLocaleString()})</td>
                          <td className="p-3 text-right">${period.accumulated.toLocaleString()}</td>
                          <td className="p-3 text-right font-medium">${period.ending.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {view === 'forecast' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900">5-Year Depreciation Forecast</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="p-4">Year</th>
                <th className="p-4 text-right">Depreciation Expense</th>
                <th className="p-4 text-right">Accumulated Depreciation</th>
                <th className="p-4 text-right">Total NBV</th>
              </tr>
            </thead>
            <tbody>
              {[2024, 2025, 2026, 2027, 2028].map((year, idx) => {
                const annualDepr = stats.totalAnnual;
                const accumDepr = annualDepr * (idx + 1) + 3500000;
                const totalCost = 39000000;
                return (
                  <tr key={year} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium">{year}</td>
                    <td className="p-4 text-right">${annualDepr.toLocaleString()}</td>
                    <td className="p-4 text-right">${accumDepr.toLocaleString()}</td>
                    <td className="p-4 text-right font-semibold">${(totalCost - accumDepr).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
