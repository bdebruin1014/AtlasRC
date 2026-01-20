import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Building2, DollarSign, TrendingUp, Calendar, ChevronRight, Filter,
  Download, ExternalLink, PieChart, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const InvestorInvestmentsPage = () => {
  const { investorId } = useParams();
  const [statusFilter, setStatusFilter] = useState('all');

  const investments = [
    {
      id: 'deal-001',
      name: 'Highland Park Lofts',
      type: 'Multifamily Development',
      invested: 200000,
      ownership: 4.2,
      status: 'active',
      stage: 'asset_managing',
      investmentDate: '2023-06-15',
      preferredReturn: 8,
      targetIRR: 18,
      actualIRR: 18.5,
      totalDistributions: 12500,
      lastDistribution: '2024-12-20',
      nextDistribution: '2025-03-20',
      capitalCalls: [
        { date: '2023-06-15', amount: 200000, status: 'funded' },
      ],
      documents: 5,
    },
    {
      id: 'deal-002',
      name: 'Riverside Commons',
      type: 'Mixed Use Development',
      invested: 150000,
      ownership: 3.1,
      status: 'active',
      stage: 'asset_managing',
      investmentDate: '2023-09-01',
      preferredReturn: 8,
      targetIRR: 16,
      actualIRR: 15.2,
      totalDistributions: 9000,
      lastDistribution: '2024-12-05',
      nextDistribution: '2025-03-05',
      capitalCalls: [
        { date: '2023-09-01', amount: 100000, status: 'funded' },
        { date: '2024-01-15', amount: 50000, status: 'funded' },
      ],
      documents: 4,
    },
    {
      id: 'deal-003',
      name: 'Cedar Mill Phase 2',
      type: 'Lot Development',
      invested: 100000,
      ownership: 2.8,
      status: 'active',
      stage: 'raising_capital',
      investmentDate: '2024-08-01',
      preferredReturn: 10,
      targetIRR: 22,
      actualIRR: null,
      totalDistributions: 7000,
      lastDistribution: '2024-12-01',
      nextDistribution: null,
      capitalCalls: [
        { date: '2024-08-01', amount: 75000, status: 'funded' },
        { date: '2024-12-15', amount: 25000, status: 'pending' },
      ],
      documents: 3,
    },
    {
      id: 'deal-004',
      name: 'Downtown Loft Conversion',
      type: 'Fix & Flip',
      invested: 75000,
      ownership: 5.0,
      status: 'exited',
      stage: 'liquidated',
      investmentDate: '2022-06-01',
      exitDate: '2023-12-15',
      preferredReturn: 8,
      targetIRR: 20,
      actualIRR: 24.3,
      totalDistributions: 97500,
      returnedCapital: 75000,
      profit: 22500,
      holdPeriod: '18 months',
      documents: 6,
    },
  ];

  const stats = {
    totalInvested: investments.filter(i => i.status === 'active').reduce((s, i) => s + i.invested, 0),
    totalDistributions: investments.reduce((s, i) => s + i.totalDistributions, 0),
    activeDeals: investments.filter(i => i.status === 'active').length,
    avgIRR: investments.filter(i => i.actualIRR).reduce((s, i, _, arr) => s + i.actualIRR / arr.length, 0),
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const getStageConfig = (stage) => ({
    raising_capital: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Raising Capital' },
    asset_managing: { bg: 'bg-green-100', text: 'text-green-700', label: 'Asset Managing' },
    liquidated: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Exited' },
  }[stage] || { bg: 'bg-gray-100', text: 'text-gray-700', label: stage });

  const filteredInvestments = investments.filter(inv => {
    if (statusFilter === 'all') return true;
    return inv.status === statusFilter;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Investments</h1>
          <p className="text-sm text-gray-500">All investments for this investor</p>
        </div>
        <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalInvested)}</p>
              <p className="text-sm text-gray-500">Active Invested</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalDistributions)}</p>
              <p className="text-sm text-gray-500">Total Distributions</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.activeDeals}</p>
              <p className="text-sm text-gray-500">Active Deals</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.avgIRR.toFixed(1)}%</p>
              <p className="text-sm text-gray-500">Avg IRR</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All Investments</option>
          <option value="active">Active</option>
          <option value="exited">Exited</option>
        </select>
      </div>

      {/* Investment Cards */}
      <div className="space-y-4">
        {filteredInvestments.map(inv => {
          const stageConfig = getStageConfig(inv.stage);
          return (
            <div key={inv.id} className="bg-white border rounded-lg overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{inv.name}</h3>
                        <span className={cn("px-2 py-0.5 rounded text-xs font-medium", stageConfig.bg, stageConfig.text)}>
                          {stageConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{inv.type}</p>
                    </div>
                  </div>
                  <Link to={`/investments/${inv.id}`} className="p-2 hover:bg-gray-100 rounded">
                    <ExternalLink className="w-5 h-5 text-gray-400" />
                  </Link>
                </div>

                <div className="grid grid-cols-6 gap-4 mt-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-gray-500">Investment</p>
                    <p className="font-semibold">{formatCurrency(inv.invested)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Ownership</p>
                    <p className="font-semibold">{inv.ownership}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Pref Return</p>
                    <p className="font-semibold">{inv.preferredReturn}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Target IRR</p>
                    <p className="font-semibold">{inv.targetIRR}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{inv.status === 'exited' ? 'Actual IRR' : 'Current IRR'}</p>
                    <p className={cn("font-semibold", inv.actualIRR && inv.actualIRR >= inv.targetIRR ? 'text-green-600' : '')}>
                      {inv.actualIRR ? `${inv.actualIRR}%` : 'Calculating...'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Distributions</p>
                    <p className="font-semibold text-green-600">{formatCurrency(inv.totalDistributions)}</p>
                  </div>
                </div>

                {inv.status === 'active' && (
                  <div className="flex items-center gap-6 mt-4 pt-4 border-t text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Invested:</span>
                      <span className="font-medium">{inv.investmentDate}</span>
                    </div>
                    {inv.nextDistribution && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">Next Distribution:</span>
                        <span className="font-medium">{inv.nextDistribution}</span>
                      </div>
                    )}
                    {inv.capitalCalls.some(c => c.status === 'pending') && (
                      <div className="flex items-center gap-2 text-amber-600">
                        <ArrowDownRight className="w-4 h-4" />
                        <span className="font-medium">Capital Call Pending</span>
                      </div>
                    )}
                  </div>
                )}

                {inv.status === 'exited' && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-xs text-green-600">Returned Capital</p>
                          <p className="font-semibold text-green-700">{formatCurrency(inv.returnedCapital)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-green-600">Profit</p>
                          <p className="font-semibold text-green-700">{formatCurrency(inv.profit)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-green-600">Hold Period</p>
                          <p className="font-semibold text-green-700">{inv.holdPeriod}</p>
                        </div>
                      </div>
                      <span className="text-green-600 font-semibold">✓ Exited {inv.exitDate}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InvestorInvestmentsPage;
