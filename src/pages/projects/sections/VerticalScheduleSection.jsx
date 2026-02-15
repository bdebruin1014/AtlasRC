import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, RefreshCw, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

// Phase status: 'complete' | 'in-progress' | 'not-started'
const defaultHouses = [
  { id: 1, lot: 'Lot 1', floorPlan: 'The Hampton',  foundation: 'complete',    framing: 'complete',    mep: 'complete',    drywall: 'complete',    finishes: 'complete',    status: 'On Schedule' },
  { id: 2, lot: 'Lot 2', floorPlan: 'The Windsor',   foundation: 'complete',    framing: 'complete',    mep: 'in-progress', drywall: 'not-started', finishes: 'not-started', status: 'On Schedule' },
  { id: 3, lot: 'Lot 3', floorPlan: 'The Oakmont',   foundation: 'complete',    framing: 'in-progress', mep: 'not-started', drywall: 'not-started', finishes: 'not-started', status: 'Behind' },
  { id: 4, lot: 'Lot 4', floorPlan: 'The Hampton',   foundation: 'in-progress', framing: 'not-started', mep: 'not-started', drywall: 'not-started', finishes: 'not-started', status: 'On Schedule' },
  { id: 5, lot: 'Lot 5', floorPlan: 'The Windsor',   foundation: 'not-started', framing: 'not-started', mep: 'not-started', drywall: 'not-started', finishes: 'not-started', status: 'On Schedule' },
  { id: 6, lot: 'Lot 6', floorPlan: 'The Oakmont',   foundation: 'complete',    framing: 'complete',    mep: 'complete',    drywall: 'in-progress', finishes: 'not-started', status: 'Ahead' },
  { id: 7, lot: 'Lot 7', floorPlan: 'The Hampton',   foundation: 'complete',    framing: 'complete',    mep: 'not-started', drywall: 'not-started', finishes: 'not-started', status: 'Behind' },
  { id: 8, lot: 'Lot 8', floorPlan: 'The Windsor',   foundation: 'not-started', framing: 'not-started', mep: 'not-started', drywall: 'not-started', finishes: 'not-started', status: 'On Schedule' },
];

const phases = ['foundation', 'framing', 'mep', 'drywall', 'finishes'];
const phaseLabels = { foundation: 'Foundation', framing: 'Framing', mep: 'MEP', drywall: 'Drywall', finishes: 'Finishes' };

const PhaseCircle = ({ status }) => {
  const colors = {
    'complete': 'bg-green-500',
    'in-progress': 'bg-blue-500',
    'not-started': 'bg-gray-300',
  };
  const titles = {
    'complete': 'Complete',
    'in-progress': 'In Progress',
    'not-started': 'Not Started',
  };
  return (
    <div className="flex items-center justify-center">
      <div
        className={`w-3.5 h-3.5 rounded-full ${colors[status] || 'bg-gray-300'}`}
        title={titles[status] || 'Unknown'}
      />
    </div>
  );
};

const statusBadgeClass = {
  'On Schedule': 'bg-green-100 text-green-800',
  'Behind': 'bg-red-100 text-red-800',
  'Ahead': 'bg-blue-100 text-blue-800',
};

export default function VerticalScheduleSection({ projectId }) {
  const [houses] = useState(defaultHouses);

  const totalHouses = 24;
  const onSchedule = 18;
  const behind = 4;
  const ahead = 2;

  const kpis = [
    { label: 'Total Houses', value: String(totalHouses), color: 'text-gray-900', icon: Calendar },
    { label: 'On Schedule', value: String(onSchedule), color: 'text-green-600', icon: CheckCircle2 },
    { label: 'Behind', value: String(behind), color: 'text-red-600', icon: AlertTriangle },
    { label: 'Ahead', value: String(ahead), color: 'text-blue-600', icon: Clock },
  ];

  // Summary counts per phase
  const phaseSummary = {};
  phases.forEach((phase) => {
    phaseSummary[phase] = {
      complete: houses.filter((h) => h[phase] === 'complete').length,
      inProgress: houses.filter((h) => h[phase] === 'in-progress').length,
      notStarted: houses.filter((h) => h[phase] === 'not-started').length,
    };
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#047857]" />
          Build Schedule
        </h2>
        <Button className="bg-[#047857] hover:bg-[#065f46]">
          <RefreshCw className="w-4 h-4 mr-2" />
          Update Schedule
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-500">{kpi.label}</p>
            <p className={`text-2xl font-semibold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs text-gray-600">Complete</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-xs text-gray-600">In Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gray-300" />
          <span className="text-xs text-gray-600">Not Started</span>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="text-xs text-gray-500 uppercase border-b bg-gray-50">
            <tr>
              <th className="text-left p-3">House / Lot</th>
              <th className="text-left p-3">Floor Plan</th>
              {phases.map((phase) => (
                <th key={phase} className="text-center p-3">{phaseLabels[phase]}</th>
              ))}
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {houses.map((house) => (
              <tr key={house.id} className="hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-900">{house.lot}</td>
                <td className="p-3 text-gray-700">{house.floorPlan}</td>
                {phases.map((phase) => (
                  <td key={phase} className="p-3">
                    <PhaseCircle status={house[phase]} />
                  </td>
                ))}
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadgeClass[house.status] || 'bg-gray-100 text-gray-600'}`}>
                    {house.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          {/* Summary Row */}
          <tfoot className="border-t-2 bg-gray-50">
            <tr>
              <td className="p-3 font-semibold text-gray-900" colSpan={2}>Summary</td>
              {phases.map((phase) => (
                <td key={phase} className="p-3 text-center">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-xs text-green-600 font-medium">{phaseSummary[phase].complete}  done</span>
                    <span className="text-xs text-blue-600">{phaseSummary[phase].inProgress}  active</span>
                    <span className="text-xs text-gray-400">{phaseSummary[phase].notStarted}  pending</span>
                  </div>
                </td>
              ))}
              <td className="p-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-green-600 font-medium">{houses.filter((h) => h.status === 'On Schedule').length} on track</span>
                  <span className="text-xs text-red-600">{houses.filter((h) => h.status === 'Behind').length} behind</span>
                  <span className="text-xs text-blue-600">{houses.filter((h) => h.status === 'Ahead').length} ahead</span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
