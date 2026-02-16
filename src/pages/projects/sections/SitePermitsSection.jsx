import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileBarChart, Plus, AlertCircle } from 'lucide-react';

const defaultPermits = [
  {
    id: 1,
    type: 'Grading Permit',
    number: 'GRD-2024-0042',
    status: 'Approved',
    appliedDate: '2024-01-20',
    approvedDate: '2024-02-28',
    expires: '2025-02-28',
    fees: 2500,
  },
  {
    id: 2,
    type: 'Erosion Control',
    number: 'ERC-2024-0118',
    status: 'Approved',
    appliedDate: '2024-01-20',
    approvedDate: '2024-03-01',
    expires: '2025-03-01',
    fees: 1200,
  },
  {
    id: 3,
    type: 'Stormwater',
    number: 'SWM-2024-0067',
    status: 'Approved',
    appliedDate: '2024-02-10',
    approvedDate: '2024-04-15',
    expires: '2026-04-15',
    fees: 3800,
  },
  {
    id: 4,
    type: 'Street Access',
    number: 'SAC-2024-0033',
    status: 'Pending',
    appliedDate: '2024-05-01',
    approvedDate: '',
    expires: '',
    fees: 1500,
  },
  {
    id: 5,
    type: 'Utility Connection',
    number: 'UTC-2024-0091',
    status: 'Pending',
    appliedDate: '2024-05-15',
    approvedDate: '',
    expires: '',
    fees: 4200,
  },
  {
    id: 6,
    type: 'Building Permit (Master)',
    number: 'BLD-2024-0201',
    status: 'Applied',
    appliedDate: '2024-06-01',
    approvedDate: '',
    expires: '',
    fees: 8500,
  },
];

const statusBadge = (status) => {
  switch (status) {
    case 'Approved':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
    case 'Pending':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    case 'Applied':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Applied</Badge>;
    case 'Expired':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Expired</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">{status}</Badge>;
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function SitePermitsSection({ projectId }) {
  const [permits, setPermits] = useState(defaultPermits);

  const totalPermits = permits.length;
  const approvedCount = permits.filter((p) => p.status === 'Approved').length;
  const pendingCount = permits.filter((p) => p.status === 'Pending').length;
  const expiredCount = permits.filter((p) => p.status === 'Expired').length;

  const handleApplyForPermit = () => {
    const newPermit = {
      id: Date.now(),
      type: 'New Permit',
      number: `PRM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      status: 'Applied',
      appliedDate: new Date().toISOString().split('T')[0],
      approvedDate: '',
      expires: '',
      fees: 0,
    };
    setPermits((prev) => [...prev, newPermit]);
  };

  const handleRemovePermit = (id) => {
    setPermits((prev) => prev.filter((permit) => permit.id !== id));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileBarChart className="w-5 h-5 text-[#047857]" />
          <h2 className="text-lg font-semibold text-gray-900">Site Permits</h2>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleApplyForPermit}>
          <Plus className="w-4 h-4 mr-2" />
          Apply for Permit
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Permits</p>
          <p className="text-2xl font-semibold">{totalPermits}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Approved</p>
          <p className="text-2xl font-semibold text-green-600">{approvedCount}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-semibold text-amber-600">{pendingCount}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Expired</p>
          <p className="text-2xl font-semibold text-red-600">{expiredCount}</p>
        </div>
      </div>

      {/* Table */}
      {permits.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No permits tracked. Click &apos;Apply for Permit&apos; to start.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="text-xs text-gray-500 uppercase border-b bg-gray-50">
              <tr>
                <th className="text-left p-3">Permit Type</th>
                <th className="text-left p-3">Number</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Applied Date</th>
                <th className="text-left p-3">Approved Date</th>
                <th className="text-left p-3">Expires</th>
                <th className="text-right p-3">Fees</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {permits.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-sm">{row.type}</td>
                  <td className="p-3 text-sm text-gray-600 font-mono">{row.number}</td>
                  <td className="p-3">{statusBadge(row.status)}</td>
                  <td className="p-3 text-sm text-gray-600">{row.appliedDate || '--'}</td>
                  <td className="p-3 text-sm text-gray-600">{row.approvedDate || '--'}</td>
                  <td className="p-3 text-sm text-gray-600">{row.expires || '--'}</td>
                  <td className="p-3 text-sm text-gray-900 text-right">{formatCurrency(row.fees)}</td>
                  <td className="p-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRemovePermit(row.id)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t bg-gray-50">
              <tr>
                <td colSpan={6} className="p-3 text-sm font-medium text-gray-700">Total Fees</td>
                <td className="p-3 text-sm font-semibold text-gray-900 text-right">
                  {formatCurrency(permits.reduce((sum, p) => sum + p.fees, 0))}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
