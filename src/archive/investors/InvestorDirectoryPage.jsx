import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Download, Upload, MoreVertical, Mail, Phone, Filter,
  Users, Building2, DollarSign, CheckCircle, AlertCircle, Clock,
  User, Briefcase, Shield, ChevronRight, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const InvestorDirectoryPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const investors = [
    {
      id: 'inv-001',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '(864) 555-0101',
      entityType: 'individual',
      investorType: 'accredited',
      accreditationStatus: 'verified',
      accreditationExpiry: '2025-06-15',
      totalInvested: 450000,
      activeDeals: 3,
      totalDistributions: 28500,
      taxId: '***-**-1234',
      address: '123 Main St, Greenville, SC 29601',
      bankOnFile: true,
      w9OnFile: true,
    },
    {
      id: 'inv-002',
      name: 'Jane Doe',
      email: 'jane.doe@email.com',
      phone: '(864) 555-0102',
      entityType: 'trust',
      entityName: 'Doe Family Trust',
      investorType: 'accredited',
      accreditationStatus: 'verified',
      accreditationExpiry: '2025-03-20',
      totalInvested: 325000,
      activeDeals: 2,
      totalDistributions: 19500,
      taxId: '**-***7890',
      address: '456 Oak Ave, Greenville, SC 29605',
      bankOnFile: true,
      w9OnFile: true,
    },
    {
      id: 'inv-003',
      name: 'Acme Investments LLC',
      email: 'invest@acme.com',
      phone: '(864) 555-0103',
      entityType: 'llc',
      investorType: 'institutional',
      accreditationStatus: 'verified',
      accreditationExpiry: '2025-12-31',
      totalInvested: 1250000,
      activeDeals: 4,
      totalDistributions: 87500,
      taxId: '**-***4567',
      address: '789 Commerce Dr, Spartanburg, SC 29302',
      bankOnFile: true,
      w9OnFile: true,
      contactName: 'Michael Roberts',
      contactTitle: 'Managing Partner',
    },
    {
      id: 'inv-004',
      name: 'Robert Johnson',
      email: 'robert@email.com',
      phone: '(864) 555-0104',
      entityType: 'sdira',
      entityName: 'Robert Johnson SDIRA',
      custodian: 'Equity Trust Company',
      investorType: 'accredited',
      accreditationStatus: 'expiring',
      accreditationExpiry: '2025-01-31',
      totalInvested: 175000,
      activeDeals: 2,
      totalDistributions: 8750,
      address: '321 Pine St, Greer, SC 29650',
      bankOnFile: true,
      w9OnFile: false,
    },
    {
      id: 'inv-005',
      name: 'Smith Family Trust',
      email: 'trust@smithfamily.com',
      phone: '(864) 555-0105',
      entityType: 'trust',
      investorType: 'accredited',
      accreditationStatus: 'pending',
      totalInvested: 0,
      activeDeals: 0,
      totalDistributions: 0,
      address: '555 Elm Blvd, Greenville, SC 29607',
      bankOnFile: false,
      w9OnFile: false,
    },
    {
      id: 'inv-006',
      name: 'Williams Capital Partners',
      email: 'invest@williamscap.com',
      phone: '(864) 555-0106',
      entityType: 'lp',
      investorType: 'qualified_purchaser',
      accreditationStatus: 'verified',
      accreditationExpiry: '2026-06-30',
      totalInvested: 2500000,
      activeDeals: 5,
      totalDistributions: 175000,
      taxId: '**-***8901',
      address: '100 Financial Center, Charlotte, NC 28202',
      bankOnFile: true,
      w9OnFile: true,
      contactName: 'Sarah Williams',
      contactTitle: 'Principal',
    },
    {
      id: 'inv-007',
      name: 'David Chen',
      email: 'david.chen@email.com',
      phone: '(864) 555-0107',
      entityType: 'individual',
      investorType: 'accredited',
      accreditationStatus: 'expired',
      accreditationExpiry: '2024-11-30',
      totalInvested: 100000,
      activeDeals: 1,
      totalDistributions: 4000,
      address: '789 Maple Dr, Simpsonville, SC 29681',
      bankOnFile: true,
      w9OnFile: true,
    },
  ];

  const stats = {
    totalInvestors: investors.length,
    accredited: investors.filter(i => i.accreditationStatus === 'verified').length,
    totalInvested: investors.reduce((s, i) => s + i.totalInvested, 0),
    pendingAccreditation: investors.filter(i => i.accreditationStatus === 'pending' || i.accreditationStatus === 'expiring').length,
  };

  const formatCurrency = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toLocaleString()}`;
  };

  const getEntityTypeIcon = (type) => {
    const icons = {
      individual: User,
      trust: Shield,
      llc: Building2,
      lp: Building2,
      corporation: Building2,
      sdira: Briefcase,
      ira: Briefcase,
    };
    return icons[type] || User;
  };

  const getEntityTypeLabel = (type) => ({
    individual: 'Individual',
    trust: 'Trust',
    llc: 'LLC',
    lp: 'Limited Partnership',
    corporation: 'Corporation',
    sdira: 'Self-Directed IRA',
    ira: 'IRA',
  }[type] || type);

  const getInvestorTypeConfig = (type) => ({
    accredited: { bg: 'bg-green-100', text: 'text-green-700', label: 'Accredited' },
    qualified_purchaser: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Qualified Purchaser' },
    institutional: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Institutional' },
    non_accredited: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Non-Accredited' },
  }[type] || { bg: 'bg-gray-100', text: 'text-gray-700', label: type });

  const getAccreditationStatusConfig = (status, expiry) => {
    if (status === 'verified') {
      const daysUntilExpiry = expiry ? Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24)) : 999;
      if (daysUntilExpiry <= 30) {
        return { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100', label: `Expires in ${daysUntilExpiry} days` };
      }
      return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Verified' };
    }
    if (status === 'expiring') return { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Expiring Soon' };
    if (status === 'expired') return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Expired' };
    if (status === 'pending') return { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Pending' };
    return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100', label: status };
  };

  const filteredInvestors = investors.filter(inv => {
    if (typeFilter !== 'all' && inv.investorType !== typeFilter) return false;
    if (statusFilter !== 'all' && inv.accreditationStatus !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return inv.name.toLowerCase().includes(query) || 
             inv.email.toLowerCase().includes(query) ||
             (inv.entityName && inv.entityName.toLowerCase().includes(query));
    }
    return true;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Investor Directory</h1>
          <p className="text-sm text-gray-500">Manage all investor contacts and accreditation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Upload className="w-4 h-4 mr-2" />Import</Button>
          <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]">
            <Plus className="w-4 h-4 mr-2" />Add Investor
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalInvestors}</p>
              <p className="text-sm text-gray-500">Total Investors</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.accredited}</p>
              <p className="text-sm text-gray-500">Accredited</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalInvested)}</p>
              <p className="text-sm text-gray-500">Total Invested</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pendingAccreditation}</p>
              <p className="text-sm text-gray-500">Need Attention</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search investors..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All Types</option>
          <option value="accredited">Accredited</option>
          <option value="qualified_purchaser">Qualified Purchaser</option>
          <option value="institutional">Institutional</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
          <option value="expiring">Expiring</option>
          <option value="expired">Expired</option>
        </select>
        <Button variant="outline"><Mail className="w-4 h-4 mr-2" />Email Selected</Button>
      </div>

      {/* Investor Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Investor</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Entity Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Investor Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Accreditation</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total Invested</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Deals</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Docs</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredInvestors.map(investor => {
              const EntityIcon = getEntityTypeIcon(investor.entityType);
              const typeConfig = getInvestorTypeConfig(investor.investorType);
              const accredConfig = getAccreditationStatusConfig(investor.accreditationStatus, investor.accreditationExpiry);
              const AccredIcon = accredConfig.icon;
              
              return (
                <tr 
                  key={investor.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/investors/${investor.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <EntityIcon className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium">{investor.name}</p>
                        <p className="text-xs text-gray-500">{investor.email}</p>
                        {investor.entityName && (
                          <p className="text-xs text-gray-400">{investor.entityName}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm">{getEntityTypeLabel(investor.entityType)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-1 rounded text-xs font-medium", typeConfig.bg, typeConfig.text)}>
                      {typeConfig.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <AccredIcon className={cn("w-4 h-4", accredConfig.color)} />
                      <span className={cn("text-sm", accredConfig.color)}>{accredConfig.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(investor.totalInvested)}</td>
                  <td className="px-4 py-3 text-center">{investor.activeDeals}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <span className={cn("w-2 h-2 rounded-full", investor.bankOnFile ? 'bg-green-500' : 'bg-gray-300')} title="Bank Info" />
                      <span className={cn("w-2 h-2 rounded-full", investor.w9OnFile ? 'bg-green-500' : 'bg-gray-300')} title="W-9" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredInvestors.length === 0 && (
        <div className="text-center py-12 bg-white border rounded-lg">
          <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-1">No investors found</h3>
          <p className="text-sm text-gray-500 mb-4">Add your first investor to get started</p>
          <Button className="bg-[#047857] hover:bg-[#065f46]">
            <Plus className="w-4 h-4 mr-2" />Add Investor
          </Button>
        </div>
      )}
    </div>
  );
};

export default InvestorDirectoryPage;
