import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Clock,
  Users,
  MapPin,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  PieChart,
  Activity,
  Percent,
  Calendar,
  Building2,
  Home,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye
} from 'lucide-react';

const PipelineAnalyticsDashboardPage = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('ytd');
  const [region, setRegion] = useState('all');
  const [dealType, setDealType] = useState('all');

  // Mock analytics data
  const analyticsData = {
    summary: {
      totalOpportunities: 156,
      activeDeals: 42,
      totalPipelineValue: 28500000,
      avgDealSize: 425000,
      winRate: 32,
      avgDaysToClose: 45,
      conversionRate: 28,
      lostRate: 18,
    },
    pipelineByStage: [
      { stage: 'New Lead', count: 45, value: 8500000, color: 'bg-gray-400' },
      { stage: 'Qualification', count: 28, value: 5200000, color: 'bg-blue-400' },
      { stage: 'Analysis', count: 22, value: 4800000, color: 'bg-indigo-400' },
      { stage: 'LOI', count: 15, value: 3200000, color: 'bg-purple-400' },
      { stage: 'Due Diligence', count: 12, value: 2800000, color: 'bg-orange-400' },
      { stage: 'Contract', count: 8, value: 2100000, color: 'bg-yellow-400' },
      { stage: 'Closing', count: 5, value: 1200000, color: 'bg-green-400' },
      { stage: 'Won', count: 21, value: 700000, color: 'bg-green-600' },
    ],
    conversionFunnel: [
      { from: 'New Lead', to: 'Qualification', rate: 62 },
      { from: 'Qualification', to: 'Analysis', rate: 78 },
      { from: 'Analysis', to: 'LOI', rate: 68 },
      { from: 'LOI', to: 'Due Diligence', rate: 80 },
      { from: 'Due Diligence', to: 'Contract', rate: 67 },
      { from: 'Contract', to: 'Closing', rate: 63 },
      { from: 'Closing', to: 'Won', rate: 92 },
    ],
    dealsByType: [
      { type: 'Scattered Lot', count: 68, value: 12500000, percentage: 44 },
      { type: 'Subdivision', count: 32, value: 8200000, percentage: 20 },
      { type: 'Commercial', count: 18, value: 4500000, percentage: 12 },
      { type: 'Land', count: 24, value: 2100000, percentage: 15 },
      { type: 'Renovation', count: 14, value: 1200000, percentage: 9 },
    ],
    dealsByRegion: [
      { region: 'Charlotte, NC', count: 52, value: 9800000 },
      { region: 'Raleigh, NC', count: 38, value: 7200000 },
      { region: 'Greenville, SC', count: 28, value: 5100000 },
      { region: 'Charleston, SC', count: 22, value: 4200000 },
      { region: 'Columbia, SC', count: 16, value: 2200000 },
    ],
    monthlyTrends: [
      { month: 'Aug', newLeads: 18, won: 3, lost: 2, value: 1200000 },
      { month: 'Sep', newLeads: 22, won: 4, lost: 3, value: 1650000 },
      { month: 'Oct', newLeads: 25, won: 5, lost: 2, value: 2100000 },
      { month: 'Nov', newLeads: 20, won: 4, lost: 4, value: 1800000 },
      { month: 'Dec', newLeads: 15, won: 3, lost: 2, value: 1350000 },
      { month: 'Jan', newLeads: 28, won: 6, lost: 3, value: 2450000 },
    ],
    topPerformers: [
      { name: 'Sarah Johnson', deals: 18, value: 4200000, winRate: 38 },
      { name: 'John Smith', deals: 15, value: 3800000, winRate: 35 },
      { name: 'Emily Chen', deals: 12, value: 2900000, winRate: 42 },
      { name: 'Michael Brown', deals: 10, value: 2100000, winRate: 30 },
      { name: 'David Wilson', deals: 8, value: 1800000, winRate: 28 },
    ],
    recentWins: [
      { id: 1, name: '456 Oak Street', value: 425000, type: 'Scattered Lot', daysToClose: 38, closedDate: '2025-01-22' },
      { id: 2, name: 'Riverside Subdivision Lot 12', value: 380000, type: 'Subdivision', daysToClose: 52, closedDate: '2025-01-18' },
      { id: 3, name: '789 Pine Avenue', value: 510000, type: 'Scattered Lot', daysToClose: 41, closedDate: '2025-01-15' },
    ],
    atRiskDeals: [
      { id: 1, name: '123 Main Street', value: 395000, stage: 'Due Diligence', daysInStage: 28, risk: 'Seller unresponsive' },
      { id: 2, name: 'Commercial Plaza Unit 5', value: 680000, stage: 'LOI', daysInStage: 35, risk: 'Competing offer' },
      { id: 3, name: 'Lakefront Lot 8', value: 290000, stage: 'Contract', daysInStage: 21, risk: 'Financing issues' },
    ],
    lossReasons: [
      { reason: 'Price too high', count: 18, percentage: 32 },
      { reason: 'Competing offer', count: 14, percentage: 25 },
      { reason: 'Seller withdrew', count: 12, percentage: 21 },
      { reason: 'Due diligence issues', count: 8, percentage: 14 },
      { reason: 'Financing fell through', count: 5, percentage: 8 },
    ],
  };

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const maxStageValue = Math.max(...analyticsData.pipelineByStage.map(s => s.value));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <BarChart3 className="w-7 h-7 text-blue-600" />
                Pipeline Analytics
              </h1>
              <p className="text-gray-600 mt-1">
                Insights and metrics across your deal pipeline
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Filters:</span>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="mtd">Month to Date</option>
              <option value="qtd">Quarter to Date</option>
              <option value="ytd">Year to Date</option>
              <option value="all">All Time</option>
            </select>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Regions</option>
              <option value="nc">North Carolina</option>
              <option value="sc">South Carolina</option>
            </select>
            <select
              value={dealType}
              onChange={(e) => setDealType(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Deal Types</option>
              <option value="scattered">Scattered Lot</option>
              <option value="subdivision">Subdivision</option>
              <option value="commercial">Commercial</option>
              <option value="land">Land</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pipeline Value</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(analyticsData.summary.totalPipelineValue)}</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-4 h-4" />
                  +12% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Deals</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.summary.activeDeals}</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-4 h-4" />
                  +8 from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Win Rate</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.summary.winRate}%</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-4 h-4" />
                  +3% from last quarter
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Days to Close</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.summary.avgDaysToClose}</p>
                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                  <ArrowDownRight className="w-4 h-4" />
                  +5 days from target
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline Funnel */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline by Stage</h3>
          <div className="space-y-3">
            {analyticsData.pipelineByStage.map((stage, idx) => {
              const widthPercent = (stage.value / maxStageValue) * 100;
              return (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-28 flex-shrink-0">
                    <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                        <div
                          className={`h-full ${stage.color} rounded-full flex items-center justify-end pr-2 transition-all`}
                          style={{ width: `${Math.max(widthPercent, 10)}%` }}
                        >
                          <span className="text-xs font-medium text-white">{stage.count}</span>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-20 text-right">
                        {formatCurrency(stage.value)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Conversion Funnel */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Stage Conversion Rates
            </h3>
            <div className="space-y-3">
              {analyticsData.conversionFunnel.map((step, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">{step.from}</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 font-medium">{step.to}</span>
                    </div>
                  </div>
                  <div className="w-24">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            step.rate >= 75 ? 'bg-green-500' :
                            step.rate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${step.rate}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${
                        step.rate >= 75 ? 'text-green-600' :
                        step.rate >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {step.rate}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deals by Type */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-600" />
              Deals by Type
            </h3>
            <div className="space-y-3">
              {analyticsData.dealsByType.map((type, idx) => {
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${colors[idx]}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{type.type}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {type.count} deals ({formatCurrency(type.value)})
                        </span>
                      </div>
                      <div className="mt-1 bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${colors[idx]}`}
                          style={{ width: `${type.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Deals by Region */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              Deals by Region
            </h3>
            <div className="space-y-3">
              {analyticsData.dealsByRegion.map((region, idx) => {
                const maxCount = Math.max(...analyticsData.dealsByRegion.map(r => r.count));
                const widthPercent = (region.count / maxCount) * 100;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-32 flex-shrink-0">
                      <span className="text-sm text-gray-700">{region.region}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${widthPercent}%` }}
                          >
                            <span className="text-xs font-medium text-white">{region.count}</span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-600 w-16 text-right">
                          {formatCurrency(region.value)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Top Performers
            </h3>
            <div className="space-y-3">
              {analyticsData.topPerformers.map((person, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                    {person.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{person.name}</p>
                    <p className="text-xs text-gray-500">{person.deals} deals</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(person.value)}</p>
                    <p className="text-xs text-green-600">{person.winRate}% win rate</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Monthly Trends
          </h3>
          <div className="flex items-end gap-4 h-48">
            {analyticsData.monthlyTrends.map((month, idx) => {
              const maxLeads = Math.max(...analyticsData.monthlyTrends.map(m => m.newLeads));
              const height = (month.newLeads / maxLeads) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex gap-1 items-end justify-center h-36">
                    <div className="flex flex-col items-center w-1/3">
                      <span className="text-xs text-gray-500 mb-1">{month.newLeads}</span>
                      <div
                        className="w-full bg-blue-400 rounded-t"
                        style={{ height: `${height}%` }}
                        title="New Leads"
                      />
                    </div>
                    <div className="flex flex-col items-center w-1/3">
                      <span className="text-xs text-green-600 mb-1">{month.won}</span>
                      <div
                        className="w-full bg-green-500 rounded-t"
                        style={{ height: `${(month.won / maxLeads) * 100 * 3}%` }}
                        title="Won"
                      />
                    </div>
                    <div className="flex flex-col items-center w-1/3">
                      <span className="text-xs text-red-600 mb-1">{month.lost}</span>
                      <div
                        className="w-full bg-red-400 rounded-t"
                        style={{ height: `${(month.lost / maxLeads) * 100 * 3}%` }}
                        title="Lost"
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-medium text-gray-700">{month.month}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(month.value)}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded" />
              <span className="text-sm text-gray-600">New Leads</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-sm text-gray-600">Won</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded" />
              <span className="text-sm text-gray-600">Lost</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Wins */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Recent Wins
            </h3>
            <div className="space-y-3">
              {analyticsData.recentWins.map((deal) => (
                <div
                  key={deal.id}
                  className="p-3 bg-green-50 border border-green-100 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                >
                  <p className="font-medium text-gray-900">{deal.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-600">{deal.type}</span>
                    <span className="text-sm font-medium text-green-700">{formatCurrency(deal.value)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Closed in {deal.daysToClose} days • {deal.closedDate}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* At Risk Deals */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              At Risk Deals
            </h3>
            <div className="space-y-3">
              {analyticsData.atRiskDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-gray-900">{deal.name}</p>
                    <span className="text-sm font-medium text-gray-700">{formatCurrency(deal.value)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{deal.stage} • {deal.daysInStage} days</p>
                  <p className="text-xs text-yellow-700 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {deal.risk}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Loss Reasons */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Loss Reasons
            </h3>
            <div className="space-y-3">
              {analyticsData.lossReasons.map((reason, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{reason.reason}</span>
                      <span className="text-sm text-gray-500">{reason.count} deals</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 bg-red-400 rounded-full"
                        style={{ width: `${reason.percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-10 text-right">
                    {reason.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineAnalyticsDashboardPage;
