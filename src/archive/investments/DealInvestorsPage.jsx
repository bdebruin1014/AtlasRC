import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Plus, Search, Download, MoreVertical, Mail, Phone,
  Users, DollarSign, CheckCircle, Clock, AlertCircle, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const DealInvestorsPage = () => {
  const { dealId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');

  const investors = [
    {
      id: 'inv-001',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '(864) 555-0101',
      entityType: 'individual',
      investorType: 'accredited',
      amount: 250000,
      ownership: 10.0,
      status: 'funded',
      fundedDate: '2024-12-15',
      distributions: 0,
    },
    {
      id: 'inv-002',
      name: 'Jane Doe',
      email: 'jane.doe@email.com',
      phone: '(864) 555-0102',
      entityType: 'trust',
      entityName: 'Doe Family Trust',
      investorType: 'accredited',
      amount: 150000,
      ownership: 6.0,
      status: 'funded',
      fundedDate: '2024-12-18',
      distributions: 0,
    },
    {
      id: 'inv-003',
      name: 'Acme Investments LLC',
      email: 'invest@acme.com',
      phone: '(864) 555-0103',
      entityType: 'llc',
      investorType: 'institutional',
      amount: 500000,
      ownership: 20.0,
      status: 'funded',
      fundedDate: '2024-12-20',
      distributions: 0,
    },
    {
      id: 'inv-004',
      name: 'Robert Johnson',
      email: 'robert@email.com',
      phone: '(864) 555-0104',
      entityType: 'ira',
      entityName: 'Robert Johnson IRA',
      investorType: 'accredited',
      amount: 100000,
      ownership: 4.0,
      status: 'signed',
      signedDate: '2024-12-28',
      distributions: 0,
    },
    {
      id: 'inv-005',
      name: 'Smith Family Trust',
      email: 'trust@smith.com',
      phone: '(864) 555-0105',
      entityType: 'trust',
      investorType: 'accredited',
      amount: 200000,
      ownership: 8.0,
      status: 'pending',
      distributions: 0,
    },
  ];

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const getStatusConfig = (status) => ({
    funded: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Funded' },
    signed: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock, label: 'Signed' },
    pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock, label: 'Pending' },
    rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle, label: 'Rejected' },
  }[status] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock, label: status });

  const stats = {
    totalInvestors: investors.length,
    totalCommitted: investors.reduce((s, i) => s + i.amount, 0),
    funded: investors.filter(i => i.status === 'funded').length,
    pending: investors.filter(i => i.status === 'pending' || i.status === 'signed').length,
  };

  const filteredInvestors = investors.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Investors</h1>
          <p className="text-sm text-gray-500">Manage investors in this deal</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Mail className="w-4 h-4 mr-2" />Email All</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]"><Plus className="w-4 h-4 mr-2" />Add Investor</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold">{stats.totalInvestors}</p>
          <p className="text-sm text-gray-500">Total Investors</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold">{formatCurrency(stats.totalCommitted)}</p>
          <p className="text-sm text-gray-500">Total Committed</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold text-green-600">{stats.funded}</p>
          <p className="text-sm text-gray-500">Funded</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          <p className="text-sm text-gray-500">Pending</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search investors..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export</Button>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Investor</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Entity</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Ownership</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Distributions</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredInvestors.map(investor => {
              const status = getStatusConfig(investor.status);
              const StatusIcon = status.icon;
              return (
                <tr key={investor.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium">{investor.name}</p>
                        <p className="text-xs text-gray-500">{investor.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm capitalize">{investor.entityType}</p>
                    {investor.entityName && <p className="text-xs text-gray-500">{investor.entityName}</p>}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(investor.amount)}</td>
                  <td className="px-4 py-3 text-right">{investor.ownership.toFixed(2)}%</td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium", status.bg, status.text)}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{formatCurrency(investor.distributions)}</td>
                  <td className="px-4 py-3">
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DealInvestorsPage;
