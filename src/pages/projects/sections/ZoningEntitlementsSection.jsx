import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Plus, ClipboardCheck, AlertCircle } from 'lucide-react';

const defaultItems = [
  {
    id: 1,
    item: 'Zoning Application',
    status: 'Approved',
    submittedDate: '2024-01-10',
    approvedDate: '2024-02-15',
    notes: 'Rezoned from R-1 to R-3 PUD',
  },
  {
    id: 2,
    item: 'Preliminary Plat',
    status: 'Approved',
    submittedDate: '2024-02-20',
    approvedDate: '2024-04-05',
    notes: '48-lot subdivision approved by planning commission',
  },
  {
    id: 3,
    item: 'Environmental Review',
    status: 'Approved',
    submittedDate: '2024-01-15',
    approvedDate: '2024-03-10',
    notes: 'Phase I ESA completed, no RECs identified',
  },
  {
    id: 4,
    item: 'Traffic Study',
    status: 'Pending',
    submittedDate: '2024-05-01',
    approvedDate: '',
    notes: 'TIA submitted, awaiting DOT review',
  },
  {
    id: 5,
    item: 'Utility Capacity Letter',
    status: 'Not Started',
    submittedDate: '',
    approvedDate: '',
    notes: 'Waiting on water/sewer provider confirmation',
  },
];

const statusBadge = (status) => {
  switch (status) {
    case 'Approved':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
    case 'Pending':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    case 'Not Started':
    default:
      return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">Not Started</Badge>;
  }
};

export default function ZoningEntitlementsSection({ projectId }) {
  const [items, setItems] = useState(defaultItems);

  const approvedCount = items.filter((i) => i.status === 'Approved').length;
  const pendingCount = items.filter((i) => i.status === 'Pending').length;
  const totalCount = items.length;

  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      item: `New Entitlement Item`,
      status: 'Not Started',
      submittedDate: '',
      approvedDate: '',
      notes: '',
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-[#047857]" />
          <h2 className="text-lg font-semibold text-gray-900">Zoning & Entitlements</h2>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleAddItem}>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Zoning Status</p>
          <p className="text-2xl font-semibold text-[#047857]">Approved</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Current Zoning</p>
          <p className="text-2xl font-semibold">R-3 PUD</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Density Allowed</p>
          <p className="text-2xl font-semibold">8 units/acre</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Entitlement Progress</p>
          <p className="text-2xl font-semibold">
            {approvedCount} of {totalCount}
          </p>
          <p className="text-xs text-gray-500">{pendingCount} pending</p>
        </div>
      </div>

      {/* Table */}
      {items.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No entitlement items tracked. Click &apos;Add Item&apos; to start.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="text-xs text-gray-500 uppercase border-b bg-gray-50">
              <tr>
                <th className="text-left p-3">Item</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Submitted Date</th>
                <th className="text-left p-3">Approved Date</th>
                <th className="text-left p-3">Notes</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-sm">{row.item}</td>
                  <td className="p-3">{statusBadge(row.status)}</td>
                  <td className="p-3 text-sm text-gray-600">{row.submittedDate || '--'}</td>
                  <td className="p-3 text-sm text-gray-600">{row.approvedDate || '--'}</td>
                  <td className="p-3 text-sm text-gray-600 max-w-xs truncate">{row.notes || '--'}</td>
                  <td className="p-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRemoveItem(row.id)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
