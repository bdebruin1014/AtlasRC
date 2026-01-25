import React, { useState, useMemo } from 'react';
import {
  TrendingUp, Calendar, DollarSign, Building, Filter, Search,
  Download, ChevronDown, ChevronRight, Eye, Calculator, Clock,
  CheckCircle, AlertTriangle, FileText, RefreshCw, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const mockLeases = [
  {
    id: 'L-001',
    tenant: 'TechCorp Industries',
    property: 'Downtown Tower',
    unit: 'Suite 1500-1550',
    leaseStart: '2022-01-01',
    leaseEnd: '2026-12-31',
    monthlyBaseRent: 45000.00,
    annualEscalation: 3.0,
    rentSchedule: [
      { period: 'Year 1', startDate: '2022-01-01', endDate: '2022-12-31', monthlyRent: 45000, straightLine: 48375, deferral: -3375 },
      { period: 'Year 2', startDate: '2023-01-01', endDate: '2023-12-31', monthlyRent: 46350, straightLine: 48375, deferral: -2025 },
      { period: 'Year 3', startDate: '2024-01-01', endDate: '2024-12-31', monthlyRent: 47740, straightLine: 48375, deferral: -635 },
      { period: 'Year 4', startDate: '2025-01-01', endDate: '2025-12-31', monthlyRent: 49172, straightLine: 48375, deferral: 797 },
      { period: 'Year 5', startDate: '2026-01-01', endDate: '2026-12-31', monthlyRent: 50647, straightLine: 48375, deferral: 2272 }
    ],
    totalContractValue: 2874108.00,
    straightLineMonthly: 48375.00,
    deferredRentBalance: 73500.00,
    status: 'active',
    recognitionMethod: 'straight_line'
  },
  {
    id: 'L-002',
    tenant: 'Global Consulting LLC',
    property: 'Downtown Tower',
    unit: 'Suite 800-850',
    leaseStart: '2023-07-01',
    leaseEnd: '2028-06-30',
    monthlyBaseRent: 32000.00,
    annualEscalation: 2.5,
    rentSchedule: [
      { period: 'Year 1', startDate: '2023-07-01', endDate: '2024-06-30', monthlyRent: 32000, straightLine: 34400, deferral: -2400 },
      { period: 'Year 2', startDate: '2024-07-01', endDate: '2025-06-30', monthlyRent: 32800, straightLine: 34400, deferral: -1600 },
      { period: 'Year 3', startDate: '2025-07-01', endDate: '2026-06-30', monthlyRent: 33620, straightLine: 34400, deferral: -780 },
      { period: 'Year 4', startDate: '2026-07-01', endDate: '2027-06-30', monthlyRent: 34461, straightLine: 34400, deferral: 61 },
      { period: 'Year 5', startDate: '2027-07-01', endDate: '2028-06-30', monthlyRent: 35322, straightLine: 34400, deferral: 922 }
    ],
    totalContractValue: 2024028.00,
    straightLineMonthly: 34400.00,
    deferredRentBalance: 38400.00,
    status: 'active',
    recognitionMethod: 'straight_line'
  },
  {
    id: 'L-003',
    tenant: 'Riverside Retail Co.',
    property: 'Riverside Plaza',
    unit: 'Retail A',
    leaseStart: '2021-06-01',
    leaseEnd: '2031-05-31',
    monthlyBaseRent: 18000.00,
    annualEscalation: 2.0,
    percentageRent: true,
    breakpoint: 2500000.00,
    percentageRate: 5.0,
    rentSchedule: [
      { period: 'Year 1-3', startDate: '2021-06-01', endDate: '2024-05-31', monthlyRent: 18000, straightLine: 20250, deferral: -2250 },
      { period: 'Year 4-6', startDate: '2024-06-01', endDate: '2027-05-31', monthlyRent: 19800, straightLine: 20250, deferral: -450 },
      { period: 'Year 7-10', startDate: '2027-06-01', endDate: '2031-05-31', monthlyRent: 21780, straightLine: 20250, deferral: 1530 }
    ],
    totalContractValue: 2430000.00,
    straightLineMonthly: 20250.00,
    deferredRentBalance: 54000.00,
    status: 'active',
    recognitionMethod: 'straight_line'
  }
];

const mockMonthlyRecognition = [
  { month: 'January 2024', cashRent: 245740, straightLineRent: 258025, adjustment: 12285, deferredBalance: 165900, posted: true },
  { month: 'February 2024', cashRent: 245740, straightLineRent: 258025, adjustment: 12285, deferredBalance: 178185, posted: true },
  { month: 'March 2024', cashRent: 245740, straightLineRent: 258025, adjustment: 12285, deferredBalance: 190470, posted: false },
  { month: 'April 2024', cashRent: 245740, straightLineRent: 258025, adjustment: 12285, deferredBalance: 202755, posted: false },
  { month: 'May 2024', cashRent: 245740, straightLineRent: 258025, adjustment: 12285, deferredBalance: 215040, posted: false },
  { month: 'June 2024', cashRent: 245740, straightLineRent: 258025, adjustment: 12285, deferredBalance: 227325, posted: false }
];

export default function RevenueRecognitionPage() {
  const [view, setView] = useState('summary');
  const [selectedLease, setSelectedLease] = useState(null);
  const [expandedLeases, setExpandedLeases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleLease = (leaseId) => {
    setExpandedLeases(prev =>
      prev.includes(leaseId) ? prev.filter(id => id !== leaseId) : [...prev, leaseId]
    );
  };

  const stats = useMemo(() => ({
    totalCashRent: mockMonthlyRecognition[0].cashRent,
    totalStraightLine: mockMonthlyRecognition[0].straightLineRent,
    totalDeferredBalance: mockLeases.reduce((sum, l) => sum + l.deferredRentBalance, 0),
    activeLeases: mockLeases.length
  }), []);

  const filteredLeases = useMemo(() => {
    return mockLeases.filter(lease =>
      lease.tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lease.property.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Recognition</h1>
          <p className="text-gray-600">ASC 842 lease revenue recognition and straight-line rent</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export Schedule</Button>
          <Button className="bg-blue-600 hover:bg-blue-700"><Calculator className="w-4 h-4 mr-2" />Calculate & Post</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><DollarSign className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${(stats.totalCashRent / 1000).toFixed(0)}K</p>
              <p className="text-sm text-gray-600">Monthly Cash Rent</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><TrendingUp className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${(stats.totalStraightLine / 1000).toFixed(0)}K</p>
              <p className="text-sm text-gray-600">Straight-Line Revenue</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><Clock className="w-5 h-5 text-purple-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${(stats.totalDeferredBalance / 1000).toFixed(0)}K</p>
              <p className="text-sm text-gray-600">Deferred Rent Balance</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg"><Building className="w-5 h-5 text-orange-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.activeLeases}</p>
              <p className="text-sm text-gray-600">Active Leases</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <Button variant={view === 'summary' ? 'default' : 'outline'} size="sm" onClick={() => setView('summary')}>Monthly Summary</Button>
          <Button variant={view === 'leases' ? 'default' : 'outline'} size="sm" onClick={() => setView('leases')}>Lease Detail</Button>
          <Button variant={view === 'journal' ? 'default' : 'outline'} size="sm" onClick={() => setView('journal')}>Journal Entries</Button>
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="Search leases..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
      </div>

      {view === 'summary' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Monthly Revenue Recognition - 2024</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="p-4">Month</th>
                <th className="p-4 text-right">Cash Rent</th>
                <th className="p-4 text-right">Straight-Line</th>
                <th className="p-4 text-right">Adjustment</th>
                <th className="p-4 text-right">Deferred Balance</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockMonthlyRecognition.map((month, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium">{month.month}</td>
                  <td className="p-4 text-right">${month.cashRent.toLocaleString()}</td>
                  <td className="p-4 text-right">${month.straightLineRent.toLocaleString()}</td>
                  <td className={cn("p-4 text-right", month.adjustment > 0 ? "text-green-600" : "text-red-600")}>
                    {month.adjustment > 0 ? '+' : ''}${month.adjustment.toLocaleString()}
                  </td>
                  <td className="p-4 text-right">${month.deferredBalance.toLocaleString()}</td>
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
          </table>
        </div>
      )}

      {view === 'leases' && (
        <div className="space-y-4">
          {filteredLeases.map((lease) => (
            <div key={lease.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => toggleLease(lease.id)}
              >
                <div className="flex items-center gap-4">
                  {expandedLeases.includes(lease.id) ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  <div>
                    <p className="font-semibold text-gray-900">{lease.tenant}</p>
                    <p className="text-sm text-gray-500">{lease.property} • {lease.unit} • {lease.leaseStart} to {lease.leaseEnd}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8 text-sm">
                  <div className="text-right">
                    <p className="text-gray-500">Cash Rent</p>
                    <p className="font-semibold">${lease.monthlyBaseRent.toLocaleString()}/mo</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500">Straight-Line</p>
                    <p className="font-semibold">${lease.straightLineMonthly.toLocaleString()}/mo</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500">Deferred Balance</p>
                    <p className="font-semibold text-purple-600">${lease.deferredRentBalance.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {expandedLeases.includes(lease.id) && (
                <div className="border-t border-gray-200">
                  <div className="p-4 bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-3">Rent Schedule</h4>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 border-b">
                          <th className="pb-2">Period</th>
                          <th className="pb-2">Dates</th>
                          <th className="pb-2 text-right">Contract Rent</th>
                          <th className="pb-2 text-right">Straight-Line</th>
                          <th className="pb-2 text-right">Monthly Deferral</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lease.rentSchedule.map((period, idx) => (
                          <tr key={idx} className="border-b border-gray-100">
                            <td className="py-2 font-medium">{period.period}</td>
                            <td className="py-2 text-gray-500">{period.startDate} - {period.endDate}</td>
                            <td className="py-2 text-right">${period.monthlyRent.toLocaleString()}</td>
                            <td className="py-2 text-right">${period.straightLine.toLocaleString()}</td>
                            <td className={cn("py-2 text-right", period.deferral > 0 ? "text-green-600" : "text-red-600")}>
                              {period.deferral > 0 ? '+' : ''}${period.deferral.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {lease.percentageRent && (
                    <div className="p-4 border-t border-gray-200 bg-blue-50">
                      <p className="text-sm text-blue-800">
                        <strong>Percentage Rent:</strong> {lease.percentageRate}% of gross sales above ${lease.breakpoint.toLocaleString()} breakpoint
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {view === 'journal' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Revenue Recognition Journal Entry - January 2024</h3>
          </div>
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2">Account</th>
                    <th className="pb-2 text-right">Debit</th>
                    <th className="pb-2 text-right">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2">1200 - Accounts Receivable</td>
                    <td className="py-2 text-right">$245,740.00</td>
                    <td className="py-2 text-right"></td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2">1350 - Deferred Rent Receivable</td>
                    <td className="py-2 text-right">$12,285.00</td>
                    <td className="py-2 text-right"></td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 pl-4">4100 - Rental Revenue</td>
                    <td className="py-2 text-right"></td>
                    <td className="py-2 text-right">$258,025.00</td>
                  </tr>
                  <tr className="font-semibold">
                    <td className="py-2">Total</td>
                    <td className="py-2 text-right">$258,025.00</td>
                    <td className="py-2 text-right">$258,025.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline"><Eye className="w-4 h-4 mr-2" />Preview</Button>
              <Button className="bg-green-600 hover:bg-green-700"><Play className="w-4 h-4 mr-2" />Post Entry</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
