import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Plus, Search, Download, MoreVertical, FileSignature, Send,
  CheckCircle, Clock, AlertCircle, Eye, Edit2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const DealSubscriptionsPage = () => {
  const { dealId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const subscriptions = [
    {
      id: 'sub-001',
      investor: 'John Smith',
      email: 'john.smith@email.com',
      amount: 250000,
      units: 250,
      status: 'funded',
      subscriptionDate: '2024-12-10',
      acceptedDate: '2024-12-12',
      signedDate: '2024-12-14',
      fundedDate: '2024-12-15',
      documentStatus: 'complete',
    },
    {
      id: 'sub-002',
      investor: 'Jane Doe',
      email: 'jane.doe@email.com',
      amount: 150000,
      units: 150,
      status: 'funded',
      subscriptionDate: '2024-12-12',
      acceptedDate: '2024-12-14',
      signedDate: '2024-12-16',
      fundedDate: '2024-12-18',
      documentStatus: 'complete',
    },
    {
      id: 'sub-003',
      investor: 'Acme Investments LLC',
      email: 'invest@acme.com',
      amount: 500000,
      units: 500,
      status: 'funded',
      subscriptionDate: '2024-12-15',
      acceptedDate: '2024-12-16',
      signedDate: '2024-12-18',
      fundedDate: '2024-12-20',
      documentStatus: 'complete',
    },
    {
      id: 'sub-004',
      investor: 'Robert Johnson',
      email: 'robert@email.com',
      amount: 100000,
      units: 100,
      status: 'signed',
      subscriptionDate: '2024-12-22',
      acceptedDate: '2024-12-24',
      signedDate: '2024-12-28',
      documentStatus: 'complete',
    },
    {
      id: 'sub-005',
      investor: 'Smith Family Trust',
      email: 'trust@smith.com',
      amount: 200000,
      units: 200,
      status: 'pending',
      subscriptionDate: '2024-12-28',
      documentStatus: 'pending_signature',
    },
    {
      id: 'sub-006',
      investor: 'Williams Capital',
      email: 'invest@williams.com',
      amount: 300000,
      units: 300,
      status: 'accepted',
      subscriptionDate: '2024-12-29',
      acceptedDate: '2024-12-30',
      documentStatus: 'sent',
    },
  ];

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const getStatusConfig = (status) => ({
    pending: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Pending Review' },
    accepted: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Accepted' },
    signed: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Signed' },
    funded: { bg: 'bg-green-100', text: 'text-green-700', label: 'Funded' },
    rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
    cancelled: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Cancelled' },
  }[status]);

  const getDocStatusConfig = (status) => ({
    pending_signature: { color: 'text-amber-600', label: 'Awaiting Signature' },
    sent: { color: 'text-blue-600', label: 'Sent for Signature' },
    complete: { color: 'text-green-600', label: 'Complete' },
  }[status] || { color: 'text-gray-500', label: status });

  const stats = {
    total: subscriptions.length,
    totalAmount: subscriptions.reduce((s, sub) => s + sub.amount, 0),
    funded: subscriptions.filter(s => s.status === 'funded').length,
    pendingSignature: subscriptions.filter(s => s.documentStatus === 'pending_signature').length,
  };

  const filteredSubs = subscriptions.filter(sub => {
    if (statusFilter !== 'all' && sub.status !== statusFilter) return false;
    if (searchQuery && !sub.investor.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Subscriptions</h1>
          <p className="text-sm text-gray-500">Track investor commitments and subscription status</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Send className="w-4 h-4 mr-2" />Send Reminders</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]"><Plus className="w-4 h-4 mr-2" />New Subscription</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-sm text-gray-500">Total Subscriptions</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>
          <p className="text-sm text-gray-500">Total Committed</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold text-green-600">{stats.funded}</p>
          <p className="text-sm text-gray-500">Funded</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold text-amber-600">{stats.pendingSignature}</p>
          <p className="text-sm text-gray-500">Pending Signature</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search subscriptions..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="signed">Signed</option>
          <option value="funded">Funded</option>
        </select>
        <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export</Button>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Investor</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Units</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Documents</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Subscribed</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Funded</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredSubs.map(sub => {
              const status = getStatusConfig(sub.status);
              const docStatus = getDocStatusConfig(sub.documentStatus);
              return (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{sub.investor}</p>
                    <p className="text-xs text-gray-500">{sub.email}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(sub.amount)}</td>
                  <td className="px-4 py-3 text-right">{sub.units}</td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-1 rounded text-xs font-medium", status.bg, status.text)}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-sm", docStatus.color)}>{docStatus.label}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{sub.subscriptionDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{sub.fundedDate || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1 hover:bg-gray-200 rounded"><Eye className="w-4 h-4 text-gray-400" /></button>
                      <button className="p-1 hover:bg-gray-200 rounded"><Edit2 className="w-4 h-4 text-gray-400" /></button>
                      <button className="p-1 hover:bg-gray-200 rounded"><MoreVertical className="w-4 h-4 text-gray-400" /></button>
                    </div>
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

export default DealSubscriptionsPage;
