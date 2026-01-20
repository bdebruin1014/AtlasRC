import React, { useState } from 'react';
import { Plus, Edit2, X, User, Users, ChevronDown, ChevronRight, CheckCircle, AlertTriangle, Briefcase, Target, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const EOSAccountabilityChart = ({ program }) => {
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [expandedSeats, setExpandedSeats] = useState(['seat-1', 'seat-2', 'seat-3', 'seat-4', 'seat-5']);

  const [seats, setSeats] = useState([
    {
      id: 'seat-1',
      title: 'Visionary',
      department: 'Leadership',
      person: { name: 'Bryan VanRock', gwr: true },
      reportsTo: null,
      level: 0,
      roles: [
        'Big picture thinking',
        'Relationships with key stakeholders',
        'Creative problem solving',
        'Company culture',
        'Major deals and partnerships',
      ],
      children: ['seat-2'],
    },
    {
      id: 'seat-2',
      title: 'Integrator',
      department: 'Leadership',
      person: { name: 'Bryan VanRock', gwr: true },
      reportsTo: 'seat-1',
      level: 1,
      roles: [
        'LMA (Lead, Manage, Accountable)',
        'P&L responsibility',
        'Remove obstacles',
        'Execute the business plan',
        'Leadership team accountability',
      ],
      children: ['seat-3', 'seat-4', 'seat-5', 'seat-6'],
    },
    {
      id: 'seat-3',
      title: 'Director of Operations',
      department: 'Operations',
      person: { name: 'Sarah Mitchell', gwr: true },
      reportsTo: 'seat-2',
      level: 2,
      roles: [
        'Project management oversight',
        'Process improvement',
        'Vendor management',
        'Customer experience',
        'Team coordination',
      ],
      children: ['seat-7', 'seat-8'],
    },
    {
      id: 'seat-4',
      title: 'Director of Construction',
      department: 'Construction',
      person: { name: 'Mike Johnson', gwr: true },
      reportsTo: 'seat-2',
      level: 2,
      roles: [
        'Construction quality',
        'Schedule management',
        'Safety compliance',
        'Subcontractor management',
        'Budget adherence',
      ],
      children: ['seat-9', 'seat-10'],
    },
    {
      id: 'seat-5',
      title: 'Controller',
      department: 'Finance',
      person: { name: 'Lisa Chen', gwr: true },
      reportsTo: 'seat-2',
      level: 2,
      roles: [
        'Financial reporting',
        'Budgeting and forecasting',
        'Cash management',
        'Investor reporting',
        'Tax compliance',
      ],
      children: [],
    },
    {
      id: 'seat-6',
      title: 'Sales Manager',
      department: 'Sales',
      person: { name: null, gwr: null },
      reportsTo: 'seat-2',
      level: 2,
      roles: [
        'Lead generation',
        'Sales process',
        'Buyer relationships',
        'Market analysis',
        'Pricing strategy',
      ],
      children: [],
    },
    {
      id: 'seat-7',
      title: 'Project Manager',
      department: 'Operations',
      person: { name: 'Tom Wilson', gwr: true },
      reportsTo: 'seat-3',
      level: 3,
      roles: [
        'Project scheduling',
        'Budget tracking',
        'Client communication',
        'Permit coordination',
        'Closeout documentation',
      ],
      children: [],
    },
    {
      id: 'seat-8',
      title: 'Project Manager',
      department: 'Operations',
      person: { name: null, gwr: null },
      reportsTo: 'seat-3',
      level: 3,
      roles: [
        'Project scheduling',
        'Budget tracking',
        'Client communication',
        'Permit coordination',
        'Closeout documentation',
      ],
      children: [],
    },
    {
      id: 'seat-9',
      title: 'Superintendent',
      department: 'Construction',
      person: { name: 'Dave Brown', gwr: true },
      reportsTo: 'seat-4',
      level: 3,
      roles: [
        'On-site management',
        'Daily construction oversight',
        'Subcontractor coordination',
        'Quality control',
        'Safety enforcement',
      ],
      children: [],
    },
    {
      id: 'seat-10',
      title: 'Superintendent',
      department: 'Construction',
      person: { name: null, gwr: null },
      reportsTo: 'seat-4',
      level: 3,
      roles: [
        'On-site management',
        'Daily construction oversight',
        'Subcontractor coordination',
        'Quality control',
        'Safety enforcement',
      ],
      children: [],
    },
  ]);

  const toggleExpand = (seatId) => {
    setExpandedSeats(prev => 
      prev.includes(seatId) ? prev.filter(id => id !== seatId) : [...prev, seatId]
    );
  };

  const getDepartmentColor = (dept) => {
    switch (dept) {
      case 'Leadership': return 'border-purple-500 bg-purple-50';
      case 'Operations': return 'border-blue-500 bg-blue-50';
      case 'Construction': return 'border-orange-500 bg-orange-50';
      case 'Finance': return 'border-green-500 bg-green-50';
      case 'Sales': return 'border-pink-500 bg-pink-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const filledSeats = seats.filter(s => s.person.name).length;
  const openSeats = seats.filter(s => !s.person.name).length;
  const gwrSeats = seats.filter(s => s.person.gwr === true).length;

  const renderSeatCard = (seat, depth = 0) => {
    const hasChildren = seat.children.length > 0;
    const isExpanded = expandedSeats.includes(seat.id);
    const childSeats = seats.filter(s => seat.children.includes(s.id));

    return (
      <div key={seat.id} className={cn("ml-8", depth === 0 && "ml-0")}>
        <div 
          className={cn(
            "border-l-4 rounded-lg p-4 mb-3 bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow",
            getDepartmentColor(seat.department),
            !seat.person.name && "border-dashed opacity-75"
          )}
          onClick={() => setSelectedSeat(seat)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {hasChildren && (
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleExpand(seat.id); }}
                  className="mt-1"
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              )}
              {!hasChildren && <div className="w-4" />}
              <div>
                <h4 className="font-semibold">{seat.title}</h4>
                <p className="text-sm text-gray-500">{seat.department}</p>
              </div>
            </div>
            <div className="text-right">
              {seat.person.name ? (
                <div className="flex items-center gap-2">
                  <span className="font-medium">{seat.person.name}</span>
                  {seat.person.gwr && (
                    <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700" title="Gets it, Wants it, Capacity to do it">
                      GWC ✓
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-amber-600 text-sm font-medium">Open Seat</span>
              )}
            </div>
          </div>
          {isExpanded && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-gray-500 mb-2">5 Roles:</p>
              <ul className="text-sm space-y-1">
                {seat.roles.map((role, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-gray-400" />
                    {role}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {isExpanded && childSeats.length > 0 && (
          <div className="border-l-2 border-gray-200 pl-4">
            {childSeats.map(child => renderSeatCard(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const topLevel = seats.filter(s => !s.reportsTo);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Accountability Chart™</h1>
          <p className="text-sm text-gray-500">Right people in the right seats</p>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setShowSeatModal(true)}>
          <Plus className="w-4 h-4 mr-2" />Add Seat
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold">{seats.length}</p>
          <p className="text-sm text-gray-500">Total Seats</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-2xl font-bold text-green-600">{filledSeats}</p>
          <p className="text-sm text-gray-500">Filled</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-amber-500">
          <p className="text-2xl font-bold text-amber-600">{openSeats}</p>
          <p className="text-sm text-gray-500">Open</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold">{gwrSeats}</p>
          <p className="text-sm text-gray-500">GWC Confirmed</p>
        </div>
      </div>

      {/* GWC Explanation */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Star className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800">Right Person, Right Seat</p>
            <p className="text-sm text-blue-700 mt-1">
              <strong>G</strong>ets it - Understands the role • 
              <strong>W</strong>ants it - Has passion for the role • 
              <strong>C</strong>apacity - Has the skills and time
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white border rounded-lg p-6">
        {topLevel.map(seat => renderSeatCard(seat))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-6 text-sm">
        <span className="flex items-center gap-2"><span className="w-3 h-3 bg-purple-500 rounded"></span>Leadership</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-500 rounded"></span>Operations</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 bg-orange-500 rounded"></span>Construction</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded"></span>Finance</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 bg-pink-500 rounded"></span>Sales</span>
      </div>

      {/* Seat Detail Modal */}
      {selectedSeat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">{selectedSeat.title}</h3>
              <button onClick={() => setSelectedSeat(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Department</span>
                <span className="font-medium">{selectedSeat.department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Person</span>
                <span className="font-medium">{selectedSeat.person.name || 'Open Seat'}</span>
              </div>
              {selectedSeat.person.name && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">GWC Status</span>
                  <span className={cn(
                    "px-2 py-1 rounded text-xs",
                    selectedSeat.person.gwr ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {selectedSeat.person.gwr ? 'Confirmed' : 'Needs Review'}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 mb-2">5 Roles</p>
                <ul className="space-y-2">
                  {selectedSeat.roles.map((role, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs">{idx + 1}</span>
                      {role}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setSelectedSeat(null)}>Close</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]"><Edit2 className="w-4 h-4 mr-1" />Edit</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EOSAccountabilityChart;
