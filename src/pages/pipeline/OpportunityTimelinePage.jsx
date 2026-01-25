import React, { useState } from 'react';
import { Calendar, Clock, User, FileText, DollarSign, CheckCircle, Circle, AlertTriangle, Plus, Filter, ChevronLeft, ChevronRight, MessageSquare, Phone, Mail, MapPin, Edit2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const OpportunityTimelinePage = () => {
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('timeline');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const opportunityInfo = {
    name: 'Sunset Ridge Phase 3',
    stage: 'Due Diligence',
    daysActive: 45,
    createdDate: '2024-11-15',
  };

  const timelineEvents = [
    {
      id: 'evt-1',
      date: '2024-12-28',
      time: '10:30 AM',
      type: 'meeting',
      title: 'Lender Call - Term Sheet Review',
      description: 'Conference call with First National Bank to discuss construction loan terms',
      user: 'John Smith',
      status: 'upcoming',
      participants: ['John Smith', 'Sarah Johnson', 'Bank Representative'],
      location: 'Zoom Call',
    },
    {
      id: 'evt-2',
      date: '2024-12-27',
      time: '3:00 PM',
      type: 'document',
      title: 'Phase I ESA Report Received',
      description: 'Environmental site assessment completed - no RECs identified',
      user: 'EcoTech Environmental',
      status: 'completed',
      documents: ['Phase1_ESA_Report.pdf'],
    },
    {
      id: 'evt-3',
      date: '2024-12-26',
      time: '11:00 AM',
      type: 'meeting',
      title: 'Site Walk with Civil Engineer',
      description: 'Reviewed grading requirements and utility connections',
      user: 'Mike Davis',
      status: 'completed',
      participants: ['Mike Davis', 'ABC Engineering'],
      location: 'Property Site',
      notes: 'Identified potential cost savings on grading - steep areas can be minimized',
    },
    {
      id: 'evt-4',
      date: '2024-12-23',
      time: '2:00 PM',
      type: 'call',
      title: 'Seller Agent Follow-up',
      description: 'Discussed counter offer terms and seller expectations',
      user: 'John Smith',
      status: 'completed',
      participants: ['John Smith', 'Marcus Thompson (Agent)'],
      outcome: 'Seller willing to negotiate on DD period',
    },
    {
      id: 'evt-5',
      date: '2024-12-22',
      time: '9:00 AM',
      type: 'milestone',
      title: 'Counter Offer Received',
      description: 'Seller countered at $2.8M with 30-day DD period',
      user: 'System',
      status: 'completed',
      relatedOffer: 'Offer v2',
    },
    {
      id: 'evt-6',
      date: '2024-12-20',
      time: '4:30 PM',
      type: 'document',
      title: 'Title Commitment Reviewed',
      description: 'Clear title confirmed, no liens or encumbrances',
      user: 'Sarah Johnson',
      status: 'completed',
      documents: ['Title_Commitment.pdf', 'Title_Review_Notes.docx'],
    },
    {
      id: 'evt-7',
      date: '2024-12-18',
      time: '10:00 AM',
      type: 'email',
      title: 'Pro Forma Sent to Partners',
      description: 'Distributed updated financial projections to equity partners',
      user: 'John Smith',
      status: 'completed',
      recipients: ['Partner A', 'Partner B', 'CFO'],
    },
    {
      id: 'evt-8',
      date: '2024-12-15',
      time: '2:00 PM',
      type: 'offer',
      title: 'Offer v2 Submitted',
      description: 'Revised offer at $2.7M with 60-day DD',
      user: 'John Smith',
      status: 'completed',
      amount: 2700000,
    },
    {
      id: 'evt-9',
      date: '2024-12-10',
      time: '11:00 AM',
      type: 'meeting',
      title: 'Internal Deal Review',
      description: 'Team meeting to review financials and approve revised offer',
      user: 'John Smith',
      status: 'completed',
      participants: ['John Smith', 'Sarah Johnson', 'Mike Davis', 'CFO'],
      decision: 'Approved to increase offer to $2.7M',
    },
    {
      id: 'evt-10',
      date: '2024-12-08',
      time: '3:30 PM',
      type: 'milestone',
      title: 'Initial Offer Rejected',
      description: 'Seller rejected initial offer of $2.5M',
      user: 'System',
      status: 'completed',
      relatedOffer: 'Offer v1',
    },
    {
      id: 'evt-11',
      date: '2024-12-05',
      time: '9:00 AM',
      type: 'offer',
      title: 'Initial Offer Submitted',
      description: 'First offer at $2.5M with 90-day DD',
      user: 'John Smith',
      status: 'completed',
      amount: 2500000,
    },
    {
      id: 'evt-12',
      date: '2024-12-02',
      time: '1:00 PM',
      type: 'meeting',
      title: 'Property Tour',
      description: 'Initial site visit with development team',
      user: 'John Smith',
      status: 'completed',
      participants: ['John Smith', 'Mike Davis'],
      location: 'Property Site',
    },
    {
      id: 'evt-13',
      date: '2024-11-28',
      time: '10:00 AM',
      type: 'milestone',
      title: 'Opportunity Created',
      description: 'Lead converted to active opportunity',
      user: 'Sarah Johnson',
      status: 'completed',
    },
  ];

  const getEventIcon = (type) => {
    switch (type) {
      case 'meeting': return <Calendar className="w-4 h-4" />;
      case 'call': return <Phone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'offer': return <DollarSign className="w-4 h-4" />;
      case 'milestone': return <CheckCircle className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'meeting': return 'bg-blue-500';
      case 'call': return 'bg-green-500';
      case 'email': return 'bg-purple-500';
      case 'document': return 'bg-amber-500';
      case 'offer': return 'bg-pink-500';
      case 'milestone': return 'bg-gray-700';
      default: return 'bg-gray-400';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">Completed</span>;
      case 'upcoming':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Upcoming</span>;
      case 'overdue':
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">Overdue</span>;
      default:
        return null;
    }
  };

  const filteredEvents = timelineEvents.filter(evt =>
    filterType === 'all' || evt.type === filterType
  );

  const eventTypes = [...new Set(timelineEvents.map(e => e.type))];

  const upcomingCount = timelineEvents.filter(e => e.status === 'upcoming').length;
  const completedCount = timelineEvents.filter(e => e.status === 'completed').length;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Opportunity Timeline</h1>
            <p className="text-sm text-gray-500">{opportunityInfo.name} - {opportunityInfo.daysActive} days active</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-1" />Filter</Button>
            <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm"><Plus className="w-4 h-4 mr-1" />Add Activity</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Total Activities</p>
            <p className="text-2xl font-bold text-blue-700">{timelineEvents.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-700">{completedCount}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Upcoming</p>
            <p className="text-2xl font-bold text-amber-700">{upcomingCount}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Days in Stage</p>
            <p className="text-2xl font-bold text-purple-700">{opportunityInfo.daysActive}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-4">
        <span className="text-sm text-gray-600">Filter:</span>
        <div className="flex gap-1">
          <button
            onClick={() => setFilterType('all')}
            className={cn("px-3 py-1 rounded text-sm", filterType === 'all' ? "bg-gray-200 font-medium" : "hover:bg-gray-100")}
          >
            All
          </button>
          {eventTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn("px-3 py-1 rounded text-sm capitalize", filterType === type ? "bg-gray-200 font-medium" : "hover:bg-gray-100")}
            >
              {type}s
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="flex gap-1">
          <Button variant={viewMode === 'timeline' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('timeline')}>Timeline</Button>
          <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>List</Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Timeline */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

            {/* Events */}
            <div className="space-y-6">
              {filteredEvents.map((event, idx) => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={cn(
                    "relative flex gap-4 cursor-pointer",
                    selectedEvent?.id === event.id && "bg-blue-50 -mx-4 px-4 py-2 rounded-lg"
                  )}
                >
                  {/* Event Icon */}
                  <div className={cn("w-16 h-16 rounded-full flex items-center justify-center text-white z-10", getEventColor(event.type))}>
                    {getEventIcon(event.type)}
                  </div>

                  {/* Event Content */}
                  <div className="flex-1 bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{event.title}</h3>
                          {getStatusBadge(event.status)}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p className="font-medium">{event.date}</p>
                        <p>{event.time}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />{event.user}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{event.location}
                        </span>
                      )}
                      {event.amount && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />${event.amount.toLocaleString()}
                        </span>
                      )}
                      {event.documents && (
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />{event.documents.length} file(s)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        {selectedEvent && (
          <div className="w-96 border-l bg-white overflow-y-auto">
            <div className="p-4 border-b">
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white mb-3", getEventColor(selectedEvent.type))}>
                {getEventIcon(selectedEvent.type)}
              </div>
              <h2 className="font-semibold text-lg">{selectedEvent.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">{selectedEvent.date} at {selectedEvent.time}</span>
                {getStatusBadge(selectedEvent.status)}
              </div>
            </div>

            <div className="p-4 border-b">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-gray-600">{selectedEvent.description}</p>
            </div>

            <div className="p-4 border-b">
              <h3 className="font-semibold mb-2">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium capitalize">{selectedEvent.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created by</span>
                  <span className="font-medium">{selectedEvent.user}</span>
                </div>
                {selectedEvent.location && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location</span>
                    <span className="font-medium">{selectedEvent.location}</span>
                  </div>
                )}
                {selectedEvent.amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-medium">${selectedEvent.amount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {selectedEvent.participants && (
              <div className="p-4 border-b">
                <h3 className="font-semibold mb-2">Participants</h3>
                <div className="space-y-2">
                  {selectedEvent.participants.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                        {p.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedEvent.documents && (
              <div className="p-4 border-b">
                <h3 className="font-semibold mb-2">Documents</h3>
                <div className="space-y-2">
                  {selectedEvent.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(selectedEvent.notes || selectedEvent.outcome || selectedEvent.decision) && (
              <div className="p-4 border-b">
                <h3 className="font-semibold mb-2">Notes / Outcome</h3>
                <p className="text-sm text-gray-600">
                  {selectedEvent.notes || selectedEvent.outcome || selectedEvent.decision}
                </p>
              </div>
            )}

            <div className="p-4">
              <Button variant="outline" className="w-full"><Edit2 className="w-4 h-4 mr-1" />Edit Activity</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpportunityTimelinePage;
