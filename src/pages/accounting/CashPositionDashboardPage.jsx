import React, { useState, useMemo } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, Building, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Calendar, RefreshCw, Eye, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const mockCashPositions = [
  { entity: 'Atlas Holdings LLC', account: 'Operating', balance: 2450000, change: 125000, changePercent: 5.4 },
  { entity: 'Atlas Holdings LLC', account: 'Payroll', balance: 185000, change: -45000, changePercent: -19.6 },
  { entity: 'Riverside Plaza LLC', account: 'Operating', balance: 850000, change: 75000, changePercent: 9.7 },
  { entity: 'Riverside Plaza LLC', account: 'Security Deposits', balance: 428500, change: 3500, changePercent: 0.8 },
  { entity: 'Downtown Tower LLC', account: 'Operating', balance: 620000, change: -180000, changePercent: -22.5 },
  { entity: 'Oak Street Partners LP', account: 'Construction', balance: 1250000, change: -500000, changePercent: -28.6 },
  { entity: 'Atlas Management Co.', account: 'Operating', balance: 450000, change: 22500, changePercent: 5.3 }
];

const mockUpcomingCashflows = [
  { date: '2024-02-01', description: 'Rent Collections - All Properties', type: 'inflow', amount: 1850000 },
  { date: '2024-02-01', description: 'Property Tax Payment - Riverside', type: 'outflow', amount: -125000 },
  { date: '2024-02-05', description: 'Mortgage Payment - Downtown Tower', type: 'outflow', amount: -185000 },
  { date: '2024-02-05', description: 'Construction Draw - Oak Street', type: 'outflow', amount: -750000 },
  { date: '2024-02-10', description: 'Management Fee Income', type: 'inflow', amount: 85000 },
  { date: '2024-02-15', description: 'Payroll - All Entities', type: 'outflow', amount: -245000 },
  { date: '2024-02-15', description: 'Insurance Premium - Portfolio', type: 'outflow', amount: -95000 }
];

export default function CashPositionDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  const stats = useMemo(() => ({
    totalCash: mockCashPositions.reduce((sum, p) => sum + p.balance, 0),
    totalChange: mockCashPositions.reduce((sum, p) => sum + p.change, 0),
    upcomingInflows: mockUpcomingCashflows.filter(c => c.type === 'inflow').reduce((sum, c) => sum + c.amount, 0),
    upcomingOutflows: Math.abs(mockUpcomingCashflows.filter(c => c.type === 'outflow').reduce((sum, c) => sum + c.amount, 0)),
    entitiesLow: mockCashPositions.filter(p => p.balance < 100000).length
  }), []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cash Position Dashboard</h1>
          <p className="text-gray-600">Real-time cash visibility across all entities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
          <Button variant="outline"><Filter className="w-4 h-4 mr-2" />Filter</Button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><DollarSign className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${(stats.totalCash / 1000000).toFixed(2)}M</p>
              <p className="text-sm text-gray-600">Total Cash</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", stats.totalChange >= 0 ? "bg-green-100" : "bg-red-100")}>
              {stats.totalChange >= 0 ? <TrendingUp className="w-5 h-5 text-green-600" /> : <TrendingDown className="w-5 h-5 text-red-600" />}
            </div>
            <div>
              <p className={cn("text-2xl font-bold", stats.totalChange >= 0 ? "text-green-600" : "text-red-600")}>
                {stats.totalChange >= 0 ? '+' : ''}{(stats.totalChange / 1000).toFixed(0)}K
              </p>
              <p className="text-sm text-gray-600">Daily Change</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><ArrowUpRight className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-blue-600">${(stats.upcomingInflows / 1000000).toFixed(2)}M</p>
              <p className="text-sm text-gray-600">Expected Inflows</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg"><ArrowDownRight className="w-5 h-5 text-orange-600" /></div>
            <div>
              <p className="text-2xl font-bold text-orange-600">${(stats.upcomingOutflows / 1000000).toFixed(2)}M</p>
              <p className="text-sm text-gray-600">Expected Outflows</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg"><AlertTriangle className="w-5 h-5 text-yellow-600" /></div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{stats.entitiesLow}</p>
              <p className="text-sm text-gray-600">Low Balance</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Cash by Entity & Account</h3>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-sm text-gray-500">
                <th className="p-4">Entity / Account</th>
                <th className="p-4 text-right">Balance</th>
                <th className="p-4 text-right">Change</th>
              </tr>
            </thead>
            <tbody>
              {mockCashPositions.map((pos, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{pos.entity}</p>
                    <p className="text-sm text-gray-500">{pos.account}</p>
                  </td>
                  <td className="p-4 text-right font-semibold text-gray-900">${pos.balance.toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <span className={cn("flex items-center justify-end gap-1", pos.change >= 0 ? "text-green-600" : "text-red-600")}>
                      {pos.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      {pos.changePercent >= 0 ? '+' : ''}{pos.changePercent.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Upcoming Cash Flows (Next 30 Days)</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {mockUpcomingCashflows.map((cf, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{cf.description}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />{cf.date}
                  </p>
                </div>
                <span className={cn("font-semibold", cf.type === 'inflow' ? "text-green-600" : "text-red-600")}>
                  {cf.type === 'inflow' ? '+' : ''}{cf.amount < 0 ? '-' : ''}${Math.abs(cf.amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
