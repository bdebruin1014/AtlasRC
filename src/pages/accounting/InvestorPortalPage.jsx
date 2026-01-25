import React, { useState } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  PieChart,
  Building2,
  FileText,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Mail,
  Phone,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Percent,
  Wallet,
  Send,
  Filter,
  Search,
  Plus,
  Settings,
  ExternalLink
} from 'lucide-react';

const InvestorPortalPage = () => {
  const [selectedInvestor, setSelectedInvestor] = useState('all');
  const [timeRange, setTimeRange] = useState('ytd');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock investor data
  const investorData = {
    summary: {
      totalInvestors: 24,
      totalCommitments: 42500000,
      totalDistributions: 8200000,
      avgIRR: 18.5,
      activeProjects: 12,
      pendingDistributions: 1250000,
    },
    investors: [
      {
        id: 1,
        name: 'Blue Harbor Capital',
        type: 'Institutional',
        commitment: 12000000,
        contributed: 10500000,
        distributions: 2800000,
        currentValue: 11200000,
        irr: 21.5,
        multiple: 1.33,
        projects: 5,
        status: 'active',
        contact: 'James Mitchell',
        email: 'jmitchell@blueharbor.com',
        phone: '(212) 555-0142',
      },
      {
        id: 2,
        name: 'Greenfield Family Office',
        type: 'Family Office',
        commitment: 8500000,
        contributed: 8500000,
        distributions: 1950000,
        currentValue: 8100000,
        irr: 19.2,
        multiple: 1.18,
        projects: 4,
        status: 'active',
        contact: 'Sarah Greenfield',
        email: 'sarah@greenfieldfo.com',
        phone: '(704) 555-0198',
      },
      {
        id: 3,
        name: 'Summit Ventures LLC',
        type: 'PE Fund',
        commitment: 6000000,
        contributed: 5200000,
        distributions: 1200000,
        currentValue: 5800000,
        irr: 16.8,
        multiple: 1.35,
        projects: 3,
        status: 'active',
        contact: 'Michael Chen',
        email: 'mchen@summitvt.com',
        phone: '(415) 555-0167',
      },
      {
        id: 4,
        name: 'Anderson Private Equity',
        type: 'Institutional',
        commitment: 5000000,
        contributed: 4800000,
        distributions: 980000,
        currentValue: 5200000,
        irr: 17.4,
        multiple: 1.29,
        projects: 3,
        status: 'active',
        contact: 'David Anderson',
        email: 'david@andersonpe.com',
        phone: '(312) 555-0134',
      },
      {
        id: 5,
        name: 'Coastal Investments Group',
        type: 'Family Office',
        commitment: 4000000,
        contributed: 3500000,
        distributions: 720000,
        currentValue: 3800000,
        irr: 15.6,
        multiple: 1.29,
        projects: 2,
        status: 'active',
        contact: 'Lisa Wong',
        email: 'lwong@coastalinv.com',
        phone: '(619) 555-0189',
      },
    ],
    distributions: [
      { id: 1, date: '2025-01-15', investor: 'Blue Harbor Capital', amount: 450000, type: 'Preferred Return', project: 'Oakwood Estates', status: 'completed' },
      { id: 2, date: '2025-01-15', investor: 'Greenfield Family Office', amount: 280000, type: 'Preferred Return', project: 'Oakwood Estates', status: 'completed' },
      { id: 3, date: '2025-02-01', investor: 'Summit Ventures LLC', amount: 180000, type: 'Profit Split', project: 'Charlotte Lots', status: 'pending' },
      { id: 4, date: '2025-02-01', investor: 'Anderson Private Equity', amount: 150000, type: 'Profit Split', project: 'Charlotte Lots', status: 'pending' },
      { id: 5, date: '2025-02-15', investor: 'Coastal Investments', amount: 120000, type: 'Preferred Return', project: 'Lake Norman', status: 'scheduled' },
    ],
    projectPerformance: [
      { id: 1, name: 'Oakwood Estates Phase 2', investors: 4, totalEquity: 8500000, currentValue: 9800000, irr: 22.5, status: 'on_track' },
      { id: 2, name: 'Charlotte Scattered Lots', investors: 3, totalEquity: 4200000, currentValue: 4800000, irr: 19.2, status: 'on_track' },
      { id: 3, name: 'Downtown Mixed-Use', investors: 5, totalEquity: 12000000, currentValue: 11500000, irr: 14.8, status: 'at_risk' },
      { id: 4, name: 'Lake Norman Waterfront', investors: 2, totalEquity: 3200000, currentValue: 3600000, irr: 17.5, status: 'on_track' },
    ],
    quarterlyReturns: [
      { quarter: 'Q1 2024', distributions: 1850000, appreciation: 2200000, totalReturn: 4050000 },
      { quarter: 'Q2 2024', distributions: 2100000, appreciation: 1800000, totalReturn: 3900000 },
      { quarter: 'Q3 2024', distributions: 1950000, appreciation: 2500000, totalReturn: 4450000 },
      { quarter: 'Q4 2024', distributions: 2300000, appreciation: 1600000, totalReturn: 3900000 },
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'scheduled':
        return 'text-blue-600 bg-blue-100';
      case 'on_track':
        return 'text-green-600 bg-green-100';
      case 'at_risk':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getInvestorTypeColor = (type) => {
    switch (type) {
      case 'Institutional':
        return 'bg-blue-100 text-blue-700';
      case 'Family Office':
        return 'bg-purple-100 text-purple-700';
      case 'PE Fund':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="w-7 h-7 text-blue-600" />
                Investor Portal
              </h1>
              <p className="text-gray-600 mt-1">
                Manage investor relationships, distributions, and reporting
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4" />
                Export Reports
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Send className="w-4 h-4" />
                Send Update
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-4">
            {['overview', 'investors', 'distributions', 'projects', 'reports'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{investorData.summary.totalInvestors}</p>
                    <p className="text-xs text-gray-500">Total Investors</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(investorData.summary.totalCommitments)}</p>
                    <p className="text-xs text-gray-500">Commitments</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(investorData.summary.totalDistributions)}</p>
                    <p className="text-xs text-gray-500">Distributions</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{investorData.summary.avgIRR}%</p>
                    <p className="text-xs text-gray-500">Avg IRR</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{investorData.summary.activeProjects}</p>
                    <p className="text-xs text-gray-500">Active Projects</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(investorData.summary.pendingDistributions)}</p>
                    <p className="text-xs text-gray-500">Pending</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quarterly Returns Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quarterly Returns</h3>
              <div className="flex items-end gap-6 h-48">
                {investorData.quarterlyReturns.map((quarter, idx) => {
                  const maxReturn = Math.max(...investorData.quarterlyReturns.map(q => q.totalReturn));
                  const distHeight = (quarter.distributions / maxReturn) * 100;
                  const appHeight = (quarter.appreciation / maxReturn) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex flex-col items-center justify-end h-40">
                        <div
                          className="w-full bg-blue-400 rounded-t"
                          style={{ height: `${appHeight}%` }}
                          title={`Appreciation: ${formatCurrency(quarter.appreciation)}`}
                        />
                        <div
                          className="w-full bg-green-500"
                          style={{ height: `${distHeight}%` }}
                          title={`Distributions: ${formatCurrency(quarter.distributions)}`}
                        />
                      </div>
                      <div className="mt-2 text-center">
                        <p className="text-sm font-medium text-gray-700">{quarter.quarter}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(quarter.totalReturn)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded" />
                  <span className="text-sm text-gray-600">Distributions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-400 rounded" />
                  <span className="text-sm text-gray-600">Appreciation</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Investors */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Investors</h3>
                <div className="space-y-3">
                  {investorData.investors.slice(0, 5).map(investor => (
                    <div key={investor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-700">
                          {investor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{investor.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getInvestorTypeColor(investor.type)}`}>
                            {investor.type}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(investor.commitment)}</p>
                        <p className="text-xs text-green-600">{investor.irr}% IRR</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Distributions */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Distributions</h3>
                <div className="space-y-3">
                  {investorData.distributions.map(dist => (
                    <div key={dist.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{dist.investor}</p>
                        <p className="text-xs text-gray-500">{dist.project} • {dist.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(dist.amount)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(dist.status)}`}>
                          {dist.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'investors' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search investors..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                Add Investor
              </button>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Investor</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">Commitment</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">Contributed</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">Distributions</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">IRR</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">Multiple</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {investorData.investors.map(investor => (
                  <tr key={investor.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-700">
                          {investor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{investor.name}</p>
                          <p className="text-xs text-gray-500">{investor.contact}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-medium text-gray-900">{formatCurrency(investor.commitment)}</td>
                    <td className="px-4 py-4 text-right text-gray-600">{formatCurrency(investor.contributed)}</td>
                    <td className="px-4 py-4 text-right text-green-600">{formatCurrency(investor.distributions)}</td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-green-600 font-medium">{investor.irr}%</span>
                    </td>
                    <td className="px-4 py-4 text-right text-gray-900">{investor.multiple}x</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Mail className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Phone className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'distributions' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Distribution Schedule</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                Schedule Distribution
              </button>
            </div>
            <div className="space-y-4">
              {investorData.distributions.map(dist => (
                <div key={dist.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      dist.status === 'completed' ? 'bg-green-100' :
                      dist.status === 'pending' ? 'bg-yellow-100' : 'bg-blue-100'
                    }`}>
                      {dist.status === 'completed' ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : dist.status === 'pending' ? (
                        <Clock className="w-6 h-6 text-yellow-600" />
                      ) : (
                        <Calendar className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{dist.investor}</p>
                      <p className="text-sm text-gray-500">{dist.project} • {dist.type}</p>
                      <p className="text-xs text-gray-400">{dist.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(dist.amount)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(dist.status)}`}>
                        {dist.status}
                      </span>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Project</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-700">Investors</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">Total Equity</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">Current Value</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">IRR</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {investorData.projectPerformance.map(project => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900">{project.name}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                        {project.investors}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right text-gray-600">{formatCurrency(project.totalEquity)}</td>
                    <td className="px-4 py-4 text-right font-medium text-gray-900">{formatCurrency(project.currentValue)}</td>
                    <td className="px-4 py-4 text-right">
                      <span className={`font-medium ${project.irr >= 18 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {project.irr}%
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Quarterly Investor Report', type: 'PDF', date: 'Q4 2024', icon: FileText },
              { name: 'Distribution Summary', type: 'Excel', date: 'Jan 2025', icon: DollarSign },
              { name: 'Portfolio Performance', type: 'PDF', date: 'Jan 2025', icon: BarChart3 },
              { name: 'K-1 Documents', type: 'PDF', date: '2024 Tax Year', icon: FileText },
              { name: 'Capital Account Statements', type: 'PDF', date: 'Dec 2024', icon: Wallet },
              { name: 'Project Updates', type: 'PDF', date: 'Jan 2025', icon: Building2 },
            ].map((report, idx) => {
              const IconComponent = report.icon;
              return (
                <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{report.name}</p>
                        <p className="text-xs text-gray-500">{report.type} • {report.date}</p>
                      </div>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestorPortalPage;
