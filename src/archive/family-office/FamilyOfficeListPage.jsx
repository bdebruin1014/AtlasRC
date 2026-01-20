import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, LayoutGrid, List, Download, MoreVertical,
  Briefcase, DollarSign, TrendingUp, Users, Building2, PieChart,
  ChevronRight, Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const FamilyOfficeListPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');

  const familyOffices = [
    {
      id: 'fo-001',
      name: 'Olive Brynn Family Office',
      primaryOwner: 'Bryan de Bruin',
      totalAssets: 12500000,
      totalLiabilities: 4200000,
      netWorth: 8300000,
      entityCount: 8,
      investmentCount: 12,
      ytdIncome: 1250000,
      ytdDistributions: 450000,
      lastUpdated: '2024-12-28',
    },
    {
      id: 'fo-002',
      name: 'VanRock Holdings Family Office',
      primaryOwner: 'VanRock Holdings LLC',
      totalAssets: 28500000,
      totalLiabilities: 12800000,
      netWorth: 15700000,
      entityCount: 15,
      investmentCount: 24,
      ytdIncome: 3850000,
      ytdDistributions: 1200000,
      lastUpdated: '2024-12-27',
    },
  ];

  const stats = {
    totalFamilyOffices: familyOffices.length,
    totalNetWorth: familyOffices.reduce((s, fo) => s + fo.netWorth, 0),
    totalEntities: familyOffices.reduce((s, fo) => s + fo.entityCount, 0),
    totalInvestments: familyOffices.reduce((s, fo) => s + fo.investmentCount, 0),
  };

  const formatCurrency = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toLocaleString()}`;
  };

  const filteredOffices = familyOffices.filter(fo => 
    fo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fo.primaryOwner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Family Office</h1>
          <p className="text-sm text-gray-500">Manage family office holdings and net worth tracking</p>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]">
          <Plus className="w-4 h-4 mr-2" />New Family Office
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalFamilyOffices}</p>
              <p className="text-sm text-gray-500">Family Offices</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalNetWorth)}</p>
              <p className="text-sm text-gray-500">Total Net Worth</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalEntities}</p>
              <p className="text-sm text-gray-500">Total Entities</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalInvestments}</p>
              <p className="text-sm text-gray-500">Investments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search family offices..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />Export
        </Button>
      </div>

      {/* Family Office Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredOffices.map(fo => (
          <div 
            key={fo.id}
            className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/family-office/${fo.id}`)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-7 h-7 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{fo.name}</h3>
                  <p className="text-sm text-gray-500">{fo.primaryOwner}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <div className="grid grid-cols-6 gap-4 mt-6">
              <div>
                <p className="text-xs text-gray-500">Total Assets</p>
                <p className="text-lg font-semibold text-green-600">{formatCurrency(fo.totalAssets)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Liabilities</p>
                <p className="text-lg font-semibold text-red-600">{formatCurrency(fo.totalLiabilities)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Net Worth</p>
                <p className="text-lg font-semibold">{formatCurrency(fo.netWorth)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Entities</p>
                <p className="text-lg font-semibold">{fo.entityCount}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">YTD Income</p>
                <p className="text-lg font-semibold">{formatCurrency(fo.ytdIncome)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">YTD Distributions</p>
                <p className="text-lg font-semibold">{formatCurrency(fo.ytdDistributions)}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm text-gray-500">
              <span>Last updated: {fo.lastUpdated}</span>
              <span>•</span>
              <span>{fo.investmentCount} active investments</span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredOffices.length === 0 && (
        <div className="text-center py-12 bg-white border rounded-lg">
          <Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-1">No family offices found</h3>
          <p className="text-sm text-gray-500 mb-4">Create your first family office to track net worth</p>
          <Button className="bg-[#047857] hover:bg-[#065f46]">
            <Plus className="w-4 h-4 mr-2" />New Family Office
          </Button>
        </div>
      )}
    </div>
  );
};

export default FamilyOfficeListPage;
