import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Map, Plus, AlertCircle } from 'lucide-react';

const defaultPhases = [
  {
    id: 1,
    phase: 'Phase 1',
    lots: 18,
    status: 'Recorded',
    platDate: '2024-03-15',
    notes: 'Final plat recorded with county, all infrastructure accepted',
  },
  {
    id: 2,
    phase: 'Phase 2',
    lots: 16,
    status: 'Approved',
    platDate: '2024-06-20',
    notes: 'Approved by planning commission, awaiting recording',
  },
  {
    id: 3,
    phase: 'Phase 3',
    lots: 14,
    status: 'In Review',
    platDate: '',
    notes: 'Submitted to planning dept, under staff review',
  },
];

const statusBadge = (status) => {
  switch (status) {
    case 'Recorded':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Recorded</Badge>;
    case 'Approved':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Approved</Badge>;
    case 'In Review':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">In Review</Badge>;
    case 'Draft':
    default:
      return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">Draft</Badge>;
  }
};

export default function PlatSubdivisionSection({ projectId }) {
  const [phases, setPhases] = useState(defaultPhases);

  const totalLots = phases.reduce((sum, p) => sum + p.lots, 0);
  const totalAcreage = 24.5;
  const avgLotSize = totalLots > 0 ? (totalAcreage / totalLots).toFixed(2) : '0.00';

  // Determine overall plat status based on phases
  const allRecorded = phases.length > 0 && phases.every((p) => p.status === 'Recorded');
  const someRecorded = phases.some((p) => p.status === 'Recorded');
  const platStatus = allRecorded ? 'Recorded' : someRecorded ? 'Partially Recorded' : 'In Progress';

  const handleAddPhase = () => {
    const newPhase = {
      id: Date.now(),
      phase: `Phase ${phases.length + 1}`,
      lots: 0,
      status: 'Draft',
      platDate: '',
      notes: '',
    };
    setPhases((prev) => [...prev, newPhase]);
  };

  const handleRemovePhase = (id) => {
    setPhases((prev) => prev.filter((phase) => phase.id !== id));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Map className="w-5 h-5 text-[#047857]" />
          <h2 className="text-lg font-semibold text-gray-900">Plat / Subdivision</h2>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleAddPhase}>
          <Plus className="w-4 h-4 mr-2" />
          Add Phase
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Plat Status</p>
          <p className="text-2xl font-semibold text-[#047857]">{platStatus}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Lots</p>
          <p className="text-2xl font-semibold">{totalLots}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Acreage</p>
          <p className="text-2xl font-semibold">{totalAcreage} ac</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Avg Lot Size</p>
          <p className="text-2xl font-semibold">{avgLotSize} ac</p>
        </div>
      </div>

      {/* Table */}
      {phases.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No phases tracked. Click &apos;Add Phase&apos; to start.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="text-xs text-gray-500 uppercase border-b bg-gray-50">
              <tr>
                <th className="text-left p-3">Phase</th>
                <th className="text-left p-3">Lots</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Plat Date</th>
                <th className="text-left p-3">Notes</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {phases.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-sm">{row.phase}</td>
                  <td className="p-3 text-sm text-gray-900">{row.lots}</td>
                  <td className="p-3">{statusBadge(row.status)}</td>
                  <td className="p-3 text-sm text-gray-600">{row.platDate || '--'}</td>
                  <td className="p-3 text-sm text-gray-600 max-w-xs truncate">{row.notes || '--'}</td>
                  <td className="p-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRemovePhase(row.id)}
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
