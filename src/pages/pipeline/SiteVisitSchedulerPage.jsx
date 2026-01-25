import React, { useState, useMemo } from 'react';
import {
  MapPin, Calendar, Clock, User, Building, Car, Phone, Mail,
  Plus, ChevronLeft, ChevronRight, Check, X, Camera, FileText,
  Users, AlertTriangle, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const mockVisits = [
  {
    id: 'VISIT-2024-0045',
    property: 'Lakeside Business Park',
    address: '500 Lakeside Dr, Austin, TX',
    type: 'Initial Tour',
    date: '2024-01-25',
    time: '10:00 AM',
    duration: '2 hours',
    status: 'confirmed',
    attendees: [
      { name: 'Sarah Johnson', role: 'Acquisitions Director', email: 'sjohnson@atlas.com', confirmed: true },
      { name: 'John Smith', role: 'Analyst', email: 'jsmith@atlas.com', confirmed: true }
    ],
    sellerContact: {
      name: 'Jennifer Adams',
      company: 'Lakeside Development LLC',
      phone: '(512) 555-0123',
      email: 'jadams@lakeside.com'
    },
    brokerContact: {
      name: 'Mark Thompson',
      company: 'CBRE',
      phone: '(512) 555-0456',
      email: 'mthompson@cbre.com'
    },
    checklist: [
      { item: 'Confirm parking availability', completed: true },
      { item: 'Request rent roll prior to visit', completed: true },
      { item: 'Review property inspection checklist', completed: false },
      { item: 'Bring camera for documentation', completed: false },
      { item: 'Prepare list of questions for property manager', completed: false }
    ],
    notes: 'Focus on deferred maintenance items and below-grade parking structure condition.',
    travelTime: '45 min from office'
  },
  {
    id: 'VISIT-2024-0046',
    property: 'Metro Industrial Complex',
    address: '2200 Commerce Way, Dallas, TX',
    type: 'Due Diligence Inspection',
    date: '2024-01-26',
    time: '9:00 AM',
    duration: '4 hours',
    status: 'confirmed',
    attendees: [
      { name: 'Sarah Johnson', role: 'Acquisitions Director', email: 'sjohnson@atlas.com', confirmed: true },
      { name: 'Tom Davis', role: 'Engineer', email: 'tdavis@atlas.com', confirmed: true },
      { name: 'Environmental Consultant', role: 'Consultant', email: 'phase1@enviro.com', confirmed: true }
    ],
    sellerContact: {
      name: 'Robert Martinez',
      company: 'Industrial Holdings Inc.',
      phone: '(214) 555-0789',
      email: 'rmartinez@industrial.com'
    },
    brokerContact: null,
    checklist: [
      { item: 'Schedule roof inspection', completed: true },
      { item: 'HVAC contractor on-site', completed: true },
      { item: 'Environmental consultant confirmed', completed: true },
      { item: 'Access to all units confirmed', completed: true },
      { item: 'Utility records available', completed: false }
    ],
    notes: 'Full property condition assessment. Need access to mechanical rooms and roof.',
    travelTime: 'Flight required - DFW'
  },
  {
    id: 'VISIT-2024-0044',
    property: 'Harbor View Apartments',
    address: '850 Harbor Way, San Diego, CA',
    type: 'Initial Tour',
    date: '2024-01-28',
    time: '2:00 PM',
    duration: '1.5 hours',
    status: 'pending',
    attendees: [
      { name: 'John Smith', role: 'Analyst', email: 'jsmith@atlas.com', confirmed: true },
      { name: 'Lisa Wang', role: 'Analyst', email: 'lwang@atlas.com', confirmed: false }
    ],
    sellerContact: {
      name: 'David Chen',
      company: 'Pacific Coast Realty',
      phone: '(619) 555-0321',
      email: 'dchen@pacificcoast.com'
    },
    brokerContact: {
      name: 'Amy Roberts',
      company: 'JLL',
      phone: '(619) 555-0654',
      email: 'aroberts@jll.com'
    },
    checklist: [
      { item: 'Review offering memorandum', completed: true },
      { item: 'Confirm meeting time with broker', completed: false },
      { item: 'Book flights and hotel', completed: false }
    ],
    notes: 'Class A multifamily - focus on amenity package and unit finishes.',
    travelTime: 'Flight required - SAN'
  },
  {
    id: 'VISIT-2024-0043',
    property: 'Downtown Tower',
    address: '100 Main St, Houston, TX',
    type: 'Quarterly Inspection',
    date: '2024-01-22',
    time: '11:00 AM',
    duration: '3 hours',
    status: 'completed',
    attendees: [
      { name: 'Mike Rodriguez', role: 'Asset Manager', email: 'mrodriguez@atlas.com', confirmed: true }
    ],
    sellerContact: null,
    brokerContact: null,
    checklist: [
      { item: 'Review capital improvement projects', completed: true },
      { item: 'Meet with property management', completed: true },
      { item: 'Inspect vacant spaces', completed: true },
      { item: 'Document any issues', completed: true }
    ],
    notes: 'Routine quarterly asset inspection. Review progress on lobby renovation.',
    travelTime: '30 min from office',
    completedNotes: 'Lobby renovation 80% complete. Identified minor HVAC issue in Suite 500.'
  }
];

const statusConfig = {
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800', icon: Check },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: X }
};

const typeColors = {
  'Initial Tour': 'bg-blue-100 text-blue-800',
  'Due Diligence Inspection': 'bg-purple-100 text-purple-800',
  'Quarterly Inspection': 'bg-green-100 text-green-800',
  'Final Walk-Through': 'bg-orange-100 text-orange-800'
};

export default function SiteVisitSchedulerPage() {
  const [selectedVisit, setSelectedVisit] = useState(mockVisits[0]);
  const [view, setView] = useState('list');

  const upcomingVisits = useMemo(() =>
    mockVisits.filter(v => v.status !== 'completed' && v.status !== 'cancelled')
      .sort((a, b) => new Date(a.date) - new Date(b.date)),
  []);

  const stats = useMemo(() => ({
    upcoming: mockVisits.filter(v => v.status === 'confirmed' || v.status === 'pending').length,
    thisWeek: mockVisits.filter(v => {
      const visitDate = new Date(v.date);
      const today = new Date();
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return visitDate >= today && visitDate <= weekEnd && v.status !== 'completed';
    }).length,
    needsConfirmation: mockVisits.filter(v => v.status === 'pending').length,
    completed: mockVisits.filter(v => v.status === 'completed').length
  }), []);

  const getChecklistProgress = (checklist) => {
    const completed = checklist.filter(c => c.completed).length;
    return Math.round((completed / checklist.length) * 100);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Visit Scheduler</h1>
          <p className="text-gray-600">Schedule and coordinate property visits</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />Schedule Visit
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Calendar className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
              <p className="text-sm text-gray-600">Upcoming Visits</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><Clock className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.thisWeek}</p>
              <p className="text-sm text-gray-600">This Week</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg"><AlertTriangle className="w-5 h-5 text-yellow-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.needsConfirmation}</p>
              <p className="text-sm text-gray-600">Needs Confirmation</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><CheckCircle className="w-5 h-5 text-purple-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
          {mockVisits.map((visit) => (
            <div
              key={visit.id}
              onClick={() => setSelectedVisit(visit)}
              className={cn(
                "bg-white rounded-lg border p-4 cursor-pointer hover:border-blue-300 transition-colors",
                selectedVisit?.id === visit.id ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-900">{visit.property}</p>
                  <p className="text-sm text-gray-500">{visit.id}</p>
                </div>
                <span className={cn("px-2 py-0.5 rounded text-xs", statusConfig[visit.status].color)}>{statusConfig[visit.status].label}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className={cn("px-2 py-0.5 rounded text-xs", typeColors[visit.type])}>{visit.type}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-1"><Calendar className="w-3 h-3" />{visit.date}</span>
                <span className="text-gray-600 flex items-center gap-1"><Clock className="w-3 h-3" />{visit.time}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-2">
          {selectedVisit && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-gray-900">{selectedVisit.property}</h2>
                      <span className={cn("px-2 py-1 rounded-full text-xs", statusConfig[selectedVisit.status].color)}>{statusConfig[selectedVisit.status].label}</span>
                    </div>
                    <p className="text-gray-600 flex items-center gap-1"><MapPin className="w-4 h-4" />{selectedVisit.address}</p>
                  </div>
                  <span className={cn("px-3 py-1 rounded-full text-sm", typeColors[selectedVisit.type])}>{selectedVisit.type}</span>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 mx-auto text-gray-500 mb-1" />
                    <p className="font-semibold text-gray-900">{selectedVisit.date}</p>
                    <p className="text-xs text-gray-500">Date</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 mx-auto text-gray-500 mb-1" />
                    <p className="font-semibold text-gray-900">{selectedVisit.time}</p>
                    <p className="text-xs text-gray-500">Time</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Users className="w-5 h-5 mx-auto text-gray-500 mb-1" />
                    <p className="font-semibold text-gray-900">{selectedVisit.attendees.length}</p>
                    <p className="text-xs text-gray-500">Attendees</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Car className="w-5 h-5 mx-auto text-gray-500 mb-1" />
                    <p className="font-semibold text-gray-900">{selectedVisit.travelTime}</p>
                    <p className="text-xs text-gray-500">Travel</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Attendees</h3>
                    <div className="space-y-2">
                      {selectedVisit.attendees.map((attendee, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{attendee.name}</p>
                              <p className="text-xs text-gray-500">{attendee.role}</p>
                            </div>
                          </div>
                          {attendee.confirmed ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Contacts</h3>
                    {selectedVisit.sellerContact && (
                      <div className="p-3 bg-gray-50 rounded-lg mb-2">
                        <p className="text-xs text-gray-500 mb-1">Seller/Owner</p>
                        <p className="font-medium text-gray-900">{selectedVisit.sellerContact.name}</p>
                        <p className="text-sm text-gray-600">{selectedVisit.sellerContact.company}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Phone className="w-3 h-3" />{selectedVisit.sellerContact.phone}</p>
                      </div>
                    )}
                    {selectedVisit.brokerContact && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Broker</p>
                        <p className="font-medium text-gray-900">{selectedVisit.brokerContact.name}</p>
                        <p className="text-sm text-gray-600">{selectedVisit.brokerContact.company}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Phone className="w-3 h-3" />{selectedVisit.brokerContact.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Pre-Visit Checklist</h3>
                  <span className="text-sm text-gray-500">{getChecklistProgress(selectedVisit.checklist)}% complete</span>
                </div>
                <div className="space-y-2">
                  {selectedVisit.checklist.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                      {item.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                      )}
                      <span className={cn("text-sm", item.completed && "text-gray-500 line-through")}>{item.item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedVisit.notes && (
                <div className="p-6 bg-yellow-50">
                  <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                  <p className="text-sm text-gray-700">{selectedVisit.notes}</p>
                </div>
              )}

              {selectedVisit.status === 'completed' && selectedVisit.completedNotes && (
                <div className="p-6 bg-blue-50">
                  <h3 className="font-semibold text-gray-900 mb-2">Visit Summary</h3>
                  <p className="text-sm text-gray-700">{selectedVisit.completedNotes}</p>
                </div>
              )}

              {selectedVisit.status !== 'completed' && (
                <div className="p-6 bg-gray-50 flex gap-3 justify-end">
                  <Button variant="outline"><X className="w-4 h-4 mr-2" />Cancel Visit</Button>
                  <Button variant="outline"><Calendar className="w-4 h-4 mr-2" />Reschedule</Button>
                  {selectedVisit.status === 'pending' && (
                    <Button className="bg-green-600 hover:bg-green-700"><CheckCircle className="w-4 h-4 mr-2" />Confirm Visit</Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
