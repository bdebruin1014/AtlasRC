import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Filter, Download, MoreVertical, Upload, Mail,
  Users, DollarSign, Building2, CheckCircle, AlertCircle, Clock,
  User, Briefcase, Shield, Calendar, ChevronRight, Edit2, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const InvestorsDirectoryPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [accreditedFilter, setAccreditedFilter] = useState('all');
  const [selectedInvestor, setSelectedInvestor] = useState(null);

  const investors = [
    {
      id: 'inv-001',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
      phone: '(864) 555-0101',
      investorType: 'accredited',
      entityType: 'individual',
      isAccredited: true,
      accreditationVerifiedAt: '2024-06-15',
      accreditationExpiresAt: '2025-06-15',
      accreditationMethod: 'third_party_verification',
      totalInvested: 750000,
      dealCount: 3,
      totalDistributions: 45000,
      city: 'Greenville',
      state: 'SC',
      tags: ['repeat investor', 'high net worth'],
    },
    {
      id: 'inv-002',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@email.com',
      phone: '(864) 555-0102',
      investorType: 'accredited',
      entityType: 'trust',
      entityName: 'Doe Family Trust',
      isAccredited: true,
      accreditationVerifiedAt: '2024-08-20',
      accreditationExpiresAt: '2025-08-20',
      accreditationMethod: 'self_certification',
      totalInvested: 500000,
      dealCount: 2,
      totalDistributions: 28000,
      city: 'Spartanburg',
      state: 'SC',
      tags: ['trust'],
    },
    {
      id: 'inv-003',
      firstName: 'Acme Investments',
      lastName: 'LLC',
      email: 'invest@acmellc.com',
      phone: '(864) 555-0103',
      investorType: 'institutional',
      entityType: 'llc',
      entityName: 'Acme Investments LLC',
      isAccredited: true,
      accreditationVerifiedAt: '2024-11-01',
      accreditationExpiresAt: '2025-11-01',
      accreditationMethod: 'third_party_verification',
      totalInvested: 2500000,
      dealCount: 4,
      totalDistributions: 185000,
      city: 'Charleston',
      state: 'SC',
      tags: ['institutional', 'large investor'],
    },
    {
      id: 'inv-004',
      firstName: 'Robert',
      lastName: 'Johnson',
      email: 'robert.johnson@email.com',
      phone: '(864) 555-0104',
      investorType: 'accredited',
      entityType: 'ira_self_directed',
      entityName: 'Robert Johnson IRA',
      isAccredited: true,
      accreditationVerifiedAt: '2024-03-10',
      accreditationExpiresAt: '2025-03-10',
      accreditationMethod: 'self_certification',
      totalInvested: 200000,
      dealCount: 1,
      totalDistributions: 0,
      city: 'Greer',
      state: 'SC',
      tags: ['ira', 'new investor'],
    },
    {
      id: 'inv-005',
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.w@email.com',
      phone: '(864) 555-0105',
      investorType: 'non_accredited',
      entityType: 'individual',
      isAccredited: false,
      totalInvested: 50000,
      dealCount: 1,
      totalDistributions: 2500,
      city: 'Anderson',
      state: 'SC',
      tags: ['506b only'],
    },
  ];

  const stats = {
    totalInvestors: investors.length,
    accreditedCount: investors.filter(i => i.isAccredited).length,
    totalInvested: investors.reduce((s, i) => s + i.totalInvested, 0),
    avgInvestment: investors.reduce((s, i) => s + i.totalInvested, 0) / investors.length,
    expiringAccreditation: investors.filter(i => {
      if (!i.accreditationExpiresAt) return false;
      const exp = new Date(i.accreditationExpiresAt);
      const now = new Date();
      const days = (exp - now) / (1000 * 60 * 60 * 24);
      return days > 0 && days <= 90;
    }).length,
  };

  const formatCurrency = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toLocaleString()}`;
  };

  const getInvestorTypeConfig = (type) => {
    const configs = {
      accredited: { bg: 'bg-green-100', text: 'text-green-700', label: 'Accredited' },
      non_accredited: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Non-Accredited' },
      institutional: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Institutional' },
      qualified_purchaser: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Qualified Purchaser' },
    };
    return configs[type] || configs.non_accredited;
  };

  const getEntityTypeLabel = (type) => {
    const labels = {
      individual: 'Individual',
      joint: 'Joint Account',
      trust: 'Trust',
      ira_traditional: 'Traditional IRA',
      ira_roth: 'Roth IRA',
      ira_sep: 'SEP IRA',
      ira_self_directed: 'Self-Directed IRA',
      solo_401k: 'Solo 401(k)',
      llc: 'LLC',
      corporation: 'Corporation',
      partnership: 'Partnership',
      estate: 'Estate',
    };
    return labels[type] || type;
  };

  const getAccreditationStatus = (investor) => {
    if (!investor.isAccredited) return { icon: AlertCircle, color: 'text-gray-400', label: 'Not Accredited' };
    if (!investor.accreditationExpiresAt) return { icon: CheckCircle, color: 'text-green-500', label: 'Accredited' };
    
    const exp = new Date(investor.accreditationExpiresAt);
    const now = new Date();
    const days = Math.floor((exp - now) / (1000 * 60 * 60 * 24));
    
    if (days < 0) return { icon: AlertCircle, color: 'text-red-500', label: 'Expired' };
    if (days <= 30) return { icon: Clock, color: 'text-red-500', label: `Expires in ${days} days` };
    if (days <= 90) return { icon: Clock, color: 'text-amber-500', label: `Expires in ${days} days` };
    return { icon: CheckCircle, color: 'text-green-500', label: 'Verified' };
  };

  const filteredInvestors = investors.filter(i => {
    if (typeFilter !== 'all' && i.investorType !== typeFilter) return false;
    if (accreditedFilter === 'accredited' && !i.isAccredited) return false;
    if (accreditedFilter === 'non_accredited' && i.isAccredited) return false;
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      const name = `${i.firstName} ${i.lastName}`.toLowerCase();
      return name.includes(search) || i.email.toLowerCase().includes(search);
    }
    return true;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Investor Directory</h1>
          <p className="text-sm text-gray-500">Manage investors and track accreditation status</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Upload className="w-4 h-4 mr-2" />Import CSV</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]"><Plus className="w-4 h-4 mr-2" />Add Investor</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><Users className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold">{stats.totalInvestors}</p><p className="text-sm text-gray-500">Total Investors</p></div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><Shield className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold">{stats.accreditedCount}</p><p className="text-sm text-gray-500">Accredited</p></div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center"><DollarSign className="w-5 h-5 text-emerald-600" /></div>
            <div><p className="text-2xl font-bold">{formatCurrency(stats.totalInvested)}</p><p className="text-sm text-gray-500">Total Invested</p></div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><DollarSign className="w-5 h-5 text-purple-600" /></div>
            <div><p className="text-2xl font-bold">{formatCurrency(stats.avgInvestment)}</p><p className="text-sm text-gray-500">Avg Investment</p></div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center"><Clock className="w-5 h-5 text-amber-600" /></div>
            <div><p className="text-2xl font-bold">{stats.expiringAccreditation}</p><p className="text-sm text-gray-500">Expiring Soon</p></div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search investors..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
          <option value="all">All Types</option>
          <option value="accredited">Accredited</option>
          <option value="institutional">Institutional</option>
          <option value="qualified_purchaser">Qualified Purchaser</option>
          <option value="non_accredited">Non-Accredited</option>
        </select>
        <select value={accreditedFilter} onChange={(e) => setAccreditedFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
          <option value="all">All Status</option>
          <option value="accredited">Accredited Only</option>
          <option value="non_accredited">Non-Accredited Only</option>
        </select>
        <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export</Button>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Investor</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Accreditation</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total Invested</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Deals</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Distributions</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredInvestors.map(investor => {
              const typeConfig = getInvestorTypeConfig(investor.investorType);
              const accredStatus = getAccreditationStatus(investor);
              const AccredIcon = accredStatus.icon;
              return (
                <tr key={investor.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedInvestor(investor)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {investor.entityType === 'individual' ? <User className="w-5 h-5 text-gray-500" /> : <Briefcase className="w-5 h-5 text-gray-500" />}
                      </div>
                      <div>
                        <p className="font-medium">{investor.entityName || `${investor.firstName} ${investor.lastName}`}</p>
                        <p className="text-xs text-gray-500">{investor.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-1 rounded text-xs font-medium", typeConfig.bg, typeConfig.text)}>{typeConfig.label}</span>
                    <p className="text-xs text-gray-500 mt-1">{getEntityTypeLabel(investor.entityType)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <AccredIcon className={cn("w-4 h-4", accredStatus.color)} />
                      <span className="text-sm">{accredStatus.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(investor.totalInvested)}</td>
                  <td className="px-4 py-3 text-right">{investor.dealCount}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(investor.totalDistributions)}</td>
                  <td className="px-4 py-3">
                    <button className="p-1 hover:bg-gray-200 rounded" onClick={(e) => e.stopPropagation()}>
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
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
          <Button className="bg-[#047857] hover:bg-[#065f46]"><Plus className="w-4 h-4 mr-2" />Add Investor</Button>
        </div>
      )}
    </div>
  );
};

export default InvestorsDirectoryPage;
