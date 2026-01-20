import React, { useState } from 'react';
import { Plus, Search, Eye, Edit2, X, Download, Calendar, Clock, Users, CheckCircle, Circle, MapPin, Video, Phone, FileText, Send, ChevronDown, ChevronRight, AlertTriangle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const MeetingNotesPage = ({ projectId }) => {
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [activeTab, setActiveTab] = useState('meetings'); // 'meetings', 'action-items', 'upcoming'
  const [filterType, setFilterType] = useState('all');

  const [meetings, setMeetings] = useState([
    {
      id: 'MTG-001',
      title: 'Weekly Construction Progress Meeting',
      type: 'construction',
      date: '2024-12-27',
      time: '10:00 AM',
      duration: '60 min',
      location: 'Job Site',
      meetingType: 'in-person',
      attendees: ['Bryan VanRock', 'Mike Johnson', 'Tom Wilson', 'Carlos Garcia'],
      organizer: 'Bryan VanRock',
      status: 'completed',
      agenda: [
        'Review construction progress',
        'Discuss upcoming inspections',
        'MEP coordination',
        'Budget review',
      ],
      notes: `## Construction Progress
- Units 1-6: Interior finishes 85% complete
- Units 7-12: Framing complete, starting MEP rough-in
- Roofing 100% complete on all buildings

## Inspections
- Unit 5 framing inspection scheduled for 12/30
- HVAC rough-in inspection needed for Unit 4

## MEP Coordination
- Sparks Electric to complete Unit 4 rough-in by 12/31
- Cool Air HVAC on schedule for Units 7-8

## Budget
- Currently 2.3% under budget
- Change order for Unit 4 electrical under review`,
      actionItems: [
        { id: 1, task: 'Schedule Unit 5 framing inspection', assignee: 'Mike Johnson', dueDate: '2024-12-30', status: 'in-progress' },
        { id: 2, task: 'Coordinate HVAC rough-in for Unit 4', assignee: 'Dave Brown', dueDate: '2024-12-31', status: 'pending' },
        { id: 3, task: 'Review electrical change order', assignee: 'Bryan VanRock', dueDate: '2024-12-29', status: 'pending' },
        { id: 4, task: 'Order appliances for Units 2-4', assignee: 'Sarah Mitchell', dueDate: '2025-01-05', status: 'pending' },
      ],
      attachments: ['Progress_Photos_12-27.pdf', 'Budget_Update.xlsx'],
    },
    {
      id: 'MTG-002',
      title: 'Investor Quarterly Update Call',
      type: 'investor',
      date: '2024-12-20',
      time: '2:00 PM',
      duration: '45 min',
      location: 'Zoom',
      meetingType: 'video',
      attendees: ['Bryan VanRock', 'Johnson Family Trust', 'Smith Capital Partners', 'Williams Investment Group'],
      organizer: 'Bryan VanRock',
      status: 'completed',
      agenda: [
        'Q4 progress update',
        'Financial review',
        'Sales update',
        'Q1 2025 outlook',
      ],
      notes: `## Q4 Progress
- Construction 68% complete
- On track for June 2025 completion
- First unit closed December 20

## Financial Update
- Total equity called: $2.125M (85%)
- Budget tracking 2.3% under
- IRR projection: 32.5%

## Sales
- Unit 1 closed for $420,000
- Unit 2 under contract, closing January 25
- Strong interest in remaining units

## Q1 2025 Outlook
- Final equity call planned for January
- Expect 3-4 additional units under contract
- Construction completion for Units 1-6 by March`,
      actionItems: [
        { id: 5, task: 'Send Q4 investor report', assignee: 'Bryan VanRock', dueDate: '2024-12-28', status: 'complete' },
        { id: 6, task: 'Process January distribution', assignee: 'Bryan VanRock', dueDate: '2025-01-15', status: 'pending' },
      ],
      attachments: ['Q4_Investor_Report.pdf'],
    },
    {
      id: 'MTG-003',
      title: 'Sales Strategy Meeting',
      type: 'sales',
      date: '2024-12-18',
      time: '11:00 AM',
      duration: '30 min',
      location: 'Office',
      meetingType: 'in-person',
      attendees: ['Bryan VanRock', 'Sarah Agent'],
      organizer: 'Sarah Agent',
      status: 'completed',
      agenda: [
        'Review active leads',
        'Pricing strategy for remaining units',
        'Marketing plan',
      ],
      notes: `## Active Leads
- Jennifer Martinez (Unit 3) - very interested, showing scheduled
- 2 other qualified leads for Units 4-5

## Pricing
- Current pricing competitive for market
- Consider $5K increase for Units 7-12 (better finishes)

## Marketing
- New photos to be added to MLS
- Open house planned for January 15`,
      actionItems: [
        { id: 7, task: 'Follow up with Jennifer Martinez', assignee: 'Sarah Agent', dueDate: '2024-12-29', status: 'in-progress' },
        { id: 8, task: 'Update MLS with new photos', assignee: 'Sarah Agent', dueDate: '2025-01-03', status: 'pending' },
      ],
      attachments: [],
    },
    {
      id: 'MTG-004',
      title: 'Bank Draw Review',
      type: 'finance',
      date: '2024-12-12',
      time: '9:00 AM',
      duration: '30 min',
      location: 'Phone',
      meetingType: 'phone',
      attendees: ['Bryan VanRock', 'Lisa Chen (First National Bank)'],
      organizer: 'Bryan VanRock',
      status: 'completed',
      agenda: [
        'Draw #12 review',
        'Upcoming draw schedule',
      ],
      notes: `## Draw #12
- Submitted $445,000 request
- Bank inspection passed
- Funds received 12/15

## Upcoming
- Draw #13 to be submitted late December
- Expect $350-400K request`,
      actionItems: [
        { id: 9, task: 'Prepare Draw #13 request', assignee: 'Bryan VanRock', dueDate: '2024-12-28', status: 'complete' },
      ],
      attachments: ['Draw_12_Backup.pdf'],
    },
  ]);

  const upcomingMeetings = [
    { id: 'MTG-U1', title: 'Weekly Construction Progress Meeting', date: '2025-01-03', time: '10:00 AM', type: 'construction', location: 'Job Site' },
    { id: 'MTG-U2', title: 'Unit 2 Final Walkthrough', date: '2025-01-22', time: '2:00 PM', type: 'sales', location: 'Unit 2' },
    { id: 'MTG-U3', title: 'Bank Inspection - Draw #13', date: '2025-01-02', time: '11:00 AM', type: 'finance', location: 'Job Site' },
  ];

  const [newMeeting, setNewMeeting] = useState({
    title: '',
    type: 'construction',
    date: '',
    time: '',
    duration: '60 min',
    location: '',
    meetingType: 'in-person',
    attendees: '',
    agenda: '',
  });

  const getTypeColor = (type) => {
    switch (type) {
      case 'construction': return 'bg-orange-100 text-orange-700';
      case 'investor': return 'bg-purple-100 text-purple-700';
      case 'sales': return 'bg-pink-100 text-pink-700';
      case 'finance': return 'bg-green-100 text-green-700';
      case 'general': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getMeetingIcon = (meetingType) => {
    switch (meetingType) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const allActionItems = meetings.flatMap(m => m.actionItems.map(ai => ({ ...ai, meetingId: m.id, meetingTitle: m.title })));
  const pendingActions = allActionItems.filter(ai => ai.status !== 'complete');
  const overdueActions = pendingActions.filter(ai => new Date(ai.dueDate) < new Date());

  const filteredMeetings = meetings.filter(m => filterType === 'all' || m.type === filterType);

  const meetingTypes = ['construction', 'investor', 'sales', 'finance', 'general'];

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Meeting Notes</h1>
          <p className="text-sm text-gray-500">{meetings.length} meetings • {pendingActions.length} open action items</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowMeetingModal(true)}>
            <Plus className="w-4 h-4 mr-1" />New Meeting
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Total Meetings</p>
          <p className="text-2xl font-semibold">{meetings.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-xs text-gray-500">Upcoming</p>
          <p className="text-2xl font-semibold text-blue-600">{upcomingMeetings.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Action Items</p>
          <p className="text-2xl font-semibold">{allActionItems.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-amber-500">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-2xl font-semibold text-amber-600">{pendingActions.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-red-500">
          <p className="text-xs text-gray-500">Overdue</p>
          <p className="text-2xl font-semibold text-red-600">{overdueActions.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('meetings')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'meetings' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Meeting Notes ({meetings.length})
        </button>
        <button onClick={() => setActiveTab('action-items')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'action-items' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Action Items ({allActionItems.length})
        </button>
        <button onClick={() => setActiveTab('upcoming')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'upcoming' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Upcoming ({upcomingMeetings.length})
        </button>
      </div>

      {/* Meetings Tab */}
      {activeTab === 'meetings' && (
        <>
          <div className="bg-white border rounded-lg p-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search meetings..." className="pl-9" />
              </div>
              <select className="border rounded-md px-3 py-2 text-sm" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All Types</option>
                <option value="construction">Construction</option>
                <option value="investor">Investor</option>
                <option value="sales">Sales</option>
                <option value="finance">Finance</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredMeetings.map((meeting) => (
              <div key={meeting.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-xs text-gray-500">{new Date(meeting.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span className="text-lg font-bold">{new Date(meeting.date).getDate()}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{meeting.title}</h4>
                          <span className={cn("px-2 py-0.5 rounded text-xs capitalize", getTypeColor(meeting.type))}>
                            {meeting.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{meeting.time} ({meeting.duration})</span>
                          <span className="flex items-center gap-1">{getMeetingIcon(meeting.meetingType)}{meeting.location}</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{meeting.attendees.length} attendees</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {meeting.actionItems.filter(ai => ai.status !== 'complete').length > 0 && (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded">
                          {meeting.actionItems.filter(ai => ai.status !== 'complete').length} open items
                        </span>
                      )}
                      <Button variant="outline" size="sm" onClick={() => setSelectedMeeting(meeting)}>
                        <Eye className="w-4 h-4 mr-1" />View
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Action Items Tab */}
      {activeTab === 'action-items' && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="w-8 px-4 py-3"></th>
                <th className="text-left px-4 py-3 font-medium">Task</th>
                <th className="text-left px-4 py-3 font-medium">Meeting</th>
                <th className="text-left px-4 py-3 font-medium">Assignee</th>
                <th className="text-left px-4 py-3 font-medium">Due Date</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {allActionItems.map((item) => {
                const isOverdue = item.status !== 'complete' && new Date(item.dueDate) < new Date();
                return (
                  <tr key={`${item.meetingId}-${item.id}`} className={cn("hover:bg-gray-50", isOverdue && "bg-red-50")}>
                    <td className="px-4 py-3">
                      {item.status === 'complete' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : isOverdue ? (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-300" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(item.status === 'complete' && "line-through text-gray-500")}>{item.task}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{item.meetingTitle}</td>
                    <td className="px-4 py-3">{item.assignee}</td>
                    <td className="px-4 py-3">
                      <span className={cn(isOverdue && "text-red-600 font-medium")}>{item.dueDate}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(isOverdue ? 'overdue' : item.status))}>
                        {isOverdue ? 'overdue' : item.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Upcoming Tab */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {upcomingMeetings.map((meeting) => (
            <div key={meeting.id} className="bg-white border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex flex-col items-center justify-center">
                  <span className="text-xs text-blue-500">{new Date(meeting.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                  <span className="text-lg font-bold text-blue-700">{new Date(meeting.date).getDate()}</span>
                </div>
                <div>
                  <h4 className="font-semibold">{meeting.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{meeting.time}</span>
                    <span className={cn("px-2 py-0.5 rounded text-xs capitalize", getTypeColor(meeting.type))}>{meeting.type}</span>
                    <span>{meeting.location}</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm"><Edit2 className="w-4 h-4 mr-1" />Edit</Button>
            </div>
          ))}
        </div>
      )}

      {/* New Meeting Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">New Meeting</h3>
              <button onClick={() => setShowMeetingModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Meeting Title *</label>
                <Input value={newMeeting.title} onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))} placeholder="Meeting title" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Type</label>
                  <select className="w-full border rounded-md px-3 py-2" value={newMeeting.type} onChange={(e) => setNewMeeting(prev => ({ ...prev, type: e.target.value }))}>
                    {meetingTypes.map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Meeting Format</label>
                  <select className="w-full border rounded-md px-3 py-2" value={newMeeting.meetingType} onChange={(e) => setNewMeeting(prev => ({ ...prev, meetingType: e.target.value }))}>
                    <option value="in-person">In Person</option>
                    <option value="video">Video Call</option>
                    <option value="phone">Phone Call</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Date *</label>
                  <Input type="date" value={newMeeting.date} onChange={(e) => setNewMeeting(prev => ({ ...prev, date: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Time *</label>
                  <Input type="time" value={newMeeting.time} onChange={(e) => setNewMeeting(prev => ({ ...prev, time: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Duration</label>
                  <select className="w-full border rounded-md px-3 py-2" value={newMeeting.duration} onChange={(e) => setNewMeeting(prev => ({ ...prev, duration: e.target.value }))}>
                    <option>15 min</option>
                    <option>30 min</option>
                    <option>45 min</option>
                    <option>60 min</option>
                    <option>90 min</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Location</label>
                <Input value={newMeeting.location} onChange={(e) => setNewMeeting(prev => ({ ...prev, location: e.target.value }))} placeholder="Location or meeting link" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Attendees</label>
                <Input value={newMeeting.attendees} onChange={(e) => setNewMeeting(prev => ({ ...prev, attendees: e.target.value }))} placeholder="Names (comma separated)" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Agenda</label>
                <textarea className="w-full border rounded-md px-3 py-2" rows={4} value={newMeeting.agenda} onChange={(e) => setNewMeeting(prev => ({ ...prev, agenda: e.target.value }))} placeholder="Meeting agenda items..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 sticky bottom-0">
              <Button variant="outline" onClick={() => setShowMeetingModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]">Create Meeting</Button>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Detail Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{selectedMeeting.title}</h3>
                  <span className={cn("px-2 py-0.5 rounded text-xs capitalize", getTypeColor(selectedMeeting.type))}>
                    {selectedMeeting.type}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{selectedMeeting.date} at {selectedMeeting.time}</p>
              </div>
              <button onClick={() => setSelectedMeeting(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Meeting Info */}
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Duration</p>
                  <p className="font-medium">{selectedMeeting.duration}</p>
                </div>
                <div>
                  <p className="text-gray-500">Location</p>
                  <p className="font-medium flex items-center gap-1">{getMeetingIcon(selectedMeeting.meetingType)}{selectedMeeting.location}</p>
                </div>
                <div>
                  <p className="text-gray-500">Organizer</p>
                  <p className="font-medium">{selectedMeeting.organizer}</p>
                </div>
                <div>
                  <p className="text-gray-500">Attendees</p>
                  <p className="font-medium">{selectedMeeting.attendees.length} people</p>
                </div>
              </div>

              {/* Attendees */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Attendees</p>
                <div className="flex flex-wrap gap-2">
                  {selectedMeeting.attendees.map((attendee, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-1">
                      <User className="w-3 h-3" />{attendee}
                    </span>
                  ))}
                </div>
              </div>

              {/* Agenda */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Agenda</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {selectedMeeting.agenda.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Notes */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Meeting Notes</p>
                <div className="bg-gray-50 rounded-lg p-4 text-sm whitespace-pre-wrap font-mono">
                  {selectedMeeting.notes}
                </div>
              </div>

              {/* Action Items */}
              {selectedMeeting.actionItems.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Action Items</p>
                  <div className="space-y-2">
                    {selectedMeeting.actionItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {item.status === 'complete' ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-300" />
                          )}
                          <span className={cn("text-sm", item.status === 'complete' && "line-through text-gray-500")}>{item.task}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{item.assignee}</span>
                          <span>Due: {item.dueDate}</span>
                          <span className={cn("px-2 py-0.5 rounded capitalize", getStatusColor(item.status))}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {selectedMeeting.attachments.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Attachments</p>
                  <div className="flex gap-2">
                    {selectedMeeting.attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
              <Button variant="outline" size="sm"><Send className="w-4 h-4 mr-1" />Send Notes</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedMeeting(null)}>Close</Button>
                <Button className="bg-[#047857] hover:bg-[#065f46]"><Edit2 className="w-4 h-4 mr-1" />Edit</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingNotesPage;
