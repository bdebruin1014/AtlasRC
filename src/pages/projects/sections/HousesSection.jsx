import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Plus, Search, Filter } from 'lucide-react';

const defaultHouses = [
  { id: 1, lot: 'Lot 1', floorPlan: 'The Hampton', sqft: 2400, status: 'Completed', startDate: '2024-08-12', completion: 100, buyer: 'Johnson Family' },
  { id: 2, lot: 'Lot 2', floorPlan: 'The Windsor', sqft: 3200, status: 'Under Construction', startDate: '2024-10-01', completion: 72, buyer: 'Smith Trust' },
  { id: 3, lot: 'Lot 3', floorPlan: 'The Oakmont', sqft: 2800, status: 'Framing', startDate: '2024-11-15', completion: 45, buyer: 'Davis Family' },
  { id: 4, lot: 'Lot 4', floorPlan: 'The Hampton', sqft: 2400, status: 'Foundation', startDate: '2025-01-05', completion: 20, buyer: '--' },
  { id: 5, lot: 'Lot 5', floorPlan: 'The Windsor', sqft: 3200, status: 'Not Started', startDate: '--', completion: 0, buyer: '--' },
  { id: 6, lot: 'Lot 6', floorPlan: 'The Oakmont', sqft: 2800, status: 'Sold', startDate: '--', completion: 0, buyer: 'Martinez LLC' },
  { id: 7, lot: 'Lot 7', floorPlan: 'The Hampton', sqft: 1800, status: 'Under Construction', startDate: '2024-12-01', completion: 58, buyer: 'Chen Family' },
  { id: 8, lot: 'Lot 8', floorPlan: 'The Windsor', sqft: 2600, status: 'Not Started', startDate: '--', completion: 0, buyer: '--' },
];

const statusBadgeClass = {
  'Under Construction': 'bg-blue-100 text-blue-800',
  'Completed': 'bg-green-100 text-green-800',
  'Not Started': 'bg-gray-100 text-gray-600',
  'Sold': 'bg-emerald-100 text-emerald-800',
  'Framing': 'bg-indigo-100 text-indigo-800',
  'Foundation': 'bg-orange-100 text-orange-800',
};

const filterTabs = ['All', 'Under Construction', 'Completed', 'Not Started'];

export default function HousesSection({ projectId }) {
  const [houses] = useState(defaultHouses);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedHouse, setSelectedHouse] = useState(null);

  const filteredHouses = activeFilter === 'All'
    ? houses
    : houses.filter((h) => h.status === activeFilter);

  const totalHouses = houses.length;
  const underConstruction = houses.filter((h) => h.status === 'Under Construction' || h.status === 'Framing' || h.status === 'Foundation').length;
  const completed = houses.filter((h) => h.status === 'Completed').length;
  const notStarted = houses.filter((h) => h.status === 'Not Started').length;

  const kpis = [
    { label: 'Total Houses', value: String(totalHouses), color: 'text-gray-900' },
    { label: 'Under Construction', value: String(underConstruction), color: 'text-blue-600' },
    { label: 'Completed', value: String(completed), color: 'text-green-600' },
    { label: 'Not Started', value: String(notStarted), color: 'text-gray-500' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Home className="w-5 h-5 text-[#047857]" />
          Houses
        </h2>
        <Button className="bg-[#047857] hover:bg-[#065f46]">
          <Plus className="w-4 h-4 mr-2" />
          Add House
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              activeFilter === tab
                ? 'bg-[#047857] text-white'
                : 'bg-white border text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Houses Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="text-xs text-gray-500 uppercase border-b bg-gray-50">
            <tr>
              <th className="text-left p-3">House / Lot #</th>
              <th className="text-left p-3">Floor Plan</th>
              <th className="text-right p-3">Sq Ft</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Start Date</th>
              <th className="text-left p-3">Completion %</th>
              <th className="text-left p-3">Buyer</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredHouses.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  No houses match the selected filter.
                </td>
              </tr>
            ) : (
              filteredHouses.map((house) => (
                <tr
                  key={house.id}
                  onClick={() => setSelectedHouse(selectedHouse === house.id ? null : house.id)}
                  className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedHouse === house.id ? 'bg-emerald-50' : ''
                  }`}
                >
                  <td className="p-3 font-medium text-gray-900">{house.lot}</td>
                  <td className="p-3 text-gray-700">{house.floorPlan}</td>
                  <td className="p-3 text-right text-gray-700">{house.sqft.toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadgeClass[house.status] || 'bg-gray-100 text-gray-600'}`}>
                      {house.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600 text-sm">{house.startDate}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                        <div
                          className={`h-2 rounded-full ${
                            house.completion === 100
                              ? 'bg-green-500'
                              : house.completion > 50
                              ? 'bg-blue-500'
                              : house.completion > 0
                              ? 'bg-amber-500'
                              : 'bg-gray-300'
                          }`}
                          style={{ width: `${house.completion}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">{house.completion}%</span>
                    </div>
                  </td>
                  <td className="p-3 text-gray-600 text-sm">{house.buyer}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Selected House Detail Panel */}
      {selectedHouse && (
        <div className="mt-4 bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">
              {houses.find((h) => h.id === selectedHouse)?.lot} - {houses.find((h) => h.id === selectedHouse)?.floorPlan}
            </h3>
            <button
              onClick={() => setSelectedHouse(null)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-3">
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <p className="text-sm font-medium">{houses.find((h) => h.id === selectedHouse)?.status}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Sq Ft</p>
              <p className="text-sm font-medium">{houses.find((h) => h.id === selectedHouse)?.sqft.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Start Date</p>
              <p className="text-sm font-medium">{houses.find((h) => h.id === selectedHouse)?.startDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Buyer</p>
              <p className="text-sm font-medium">{houses.find((h) => h.id === selectedHouse)?.buyer}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
