import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';
import {
  FileText,
  Plus,
  Search,
  Calendar,
  Clock,
  Users,
  MapPin,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Download,
  Edit,
  Trash2,
  X,
  Send,
  User,
  AlertCircle,
  ListTodo,
  MessageSquare
} from 'lucide-react';

// Demo meeting minutes data
const DEMO_MEETINGS = [
  {
    id: 'm-1',
    title: 'Weekly Construction Progress Meeting',
    meeting_type: 'progress',
    date: '2026-01-23',
    start_time: '10:00',
    end_time: '11:30',
    location: 'Project Site - Trailer',
    project_id: 'proj-1',
    project_name: 'Sunset Apartments',
    status: 'approved',
    organizer: 'John Smith',
    attendees: [
      { name: 'John Smith', role: 'Project Manager', present: true },
      { name: 'Sarah Johnson', role: 'Owner Rep', present: true },
      { name: 'Mike Williams', role: 'Site Super', present: true },
      { name: 'Tom Builder', role: 'GC', present: true },
      { name: 'Lisa Arch', role: 'Architect', present: false }
    ],
    agenda: [
      'Review current schedule status',
      'Budget update and change orders',
      'Safety concerns',
      'Upcoming inspections',
      'Open issues'
    ],
    discussion_items: [
      {
        topic: 'Schedule Status',
        discussion: 'Project is currently 3 days behind schedule due to weather delays last week. GC presented recovery plan to make up time during framing phase.',
        decisions: ['Approve overtime for framing crew next 2 weeks', 'Add second framing crew starting Monday']
      },
      {
        topic: 'Budget Update',
        discussion: 'Current spending is within budget. Two pending change orders discussed - electrical panel upgrade and additional insulation.',
        decisions: ['Approve CO-005 for electrical upgrade ($8,500)', 'Request additional pricing for insulation options']
      },
      {
        topic: 'Safety',
        discussion: 'No incidents this week. Discussed need for additional fall protection signage on upper levels.',
        decisions: ['GC to install additional signage by Friday']
      }
    ],
    action_items: [
      { id: 'a-1', description: 'Submit revised schedule showing recovery plan', assignee: 'Tom Builder', due_date: '2026-01-25', status: 'completed' },
      { id: 'a-2', description: 'Provide pricing for upgraded insulation', assignee: 'Tom Builder', due_date: '2026-01-27', status: 'open' },
      { id: 'a-3', description: 'Install fall protection signage', assignee: 'Mike Williams', due_date: '2026-01-24', status: 'completed' },
      { id: 'a-4', description: 'Coordinate electrical inspection', assignee: 'John Smith', due_date: '2026-01-30', status: 'open' }
    ],
    next_meeting: '2026-01-30 10:00 AM',
    notes: 'Overall good progress despite weather setback. Team confident in recovery plan.',
    created_by: 'John Smith',
    created_at: '2026-01-23T12:00:00Z',
    approved_by: 'Sarah Johnson',
    approved_at: '2026-01-23T14:00:00Z'
  },
  {
    id: 'm-2',
    title: 'Owner/Architect/Contractor Meeting',
    meeting_type: 'oac',
    date: '2026-01-20',
    start_time: '14:00',
    end_time: '15:30',
    location: 'ABC Architects Office',
    project_id: 'proj-1',
    project_name: 'Sunset Apartments',
    status: 'approved',
    organizer: 'Sarah Johnson',
    attendees: [
      { name: 'Sarah Johnson', role: 'Owner Rep', present: true },
      { name: 'Lisa Arch', role: 'Architect', present: true },
      { name: 'Tom Builder', role: 'GC', present: true },
      { name: 'John Smith', role: 'Project Manager', present: true }
    ],
    agenda: [
      'RFI status review',
      'Submittal log update',
      'Design clarifications',
      'Change order review'
    ],
    discussion_items: [
      {
        topic: 'RFI Status',
        discussion: 'Reviewed 5 open RFIs. RFI-002 regarding electrical panel conflict discussed at length.',
        decisions: ['Architect to issue revised drawings by 1/25', 'GC to proceed with alternate panel location']
      },
      {
        topic: 'Submittals',
        discussion: 'Window submittals still pending architect review. Roofing submittals approved.',
        decisions: ['Architect to complete window review by 1/22']
      }
    ],
    action_items: [
      { id: 'a-5', description: 'Issue revised electrical drawings', assignee: 'Lisa Arch', due_date: '2026-01-25', status: 'open' },
      { id: 'a-6', description: 'Complete window submittal review', assignee: 'Lisa Arch', due_date: '2026-01-22', status: 'completed' }
    ],
    next_meeting: '2026-02-03 2:00 PM',
    notes: 'Good collaboration on resolving design conflicts.',
    created_by: 'Sarah Johnson',
    created_at: '2026-01-20T16:00:00Z',
    approved_by: 'John Smith',
    approved_at: '2026-01-21T09:00:00Z'
  },
  {
    id: 'm-3',
    title: 'Safety Committee Meeting',
    meeting_type: 'safety',
    date: '2026-01-22',
    start_time: '07:00',
    end_time: '07:45',
    location: 'Project Site - Trailer',
    project_id: 'proj-1',
    project_name: 'Sunset Apartments',
    status: 'draft',
    organizer: 'Mike Williams',
    attendees: [
      { name: 'Mike Williams', role: 'Site Super', present: true },
      { name: 'Bob Safety', role: 'Safety Officer', present: true },
      { name: 'Tom Builder', role: 'GC', present: true },
      { name: 'Crew Lead 1', role: 'Foreman', present: true },
      { name: 'Crew Lead 2', role: 'Foreman', present: true }
    ],
    agenda: [
      'Incident review',
      'Upcoming hazards',
      'PPE compliance',
      'Toolbox talk topic'
    ],
    discussion_items: [
      {
        topic: 'Incident Review',
        discussion: 'No recordable incidents this month. One near-miss reported involving ladder placement.',
        decisions: ['Implement ladder inspection program', 'Add ladder safety to next toolbox talk']
      }
    ],
    action_items: [
      { id: 'a-7', description: 'Create ladder inspection checklist', assignee: 'Bob Safety', due_date: '2026-01-24', status: 'open' }
    ],
    next_meeting: '2026-01-29 7:00 AM',
    notes: 'Team maintaining strong safety record.',
    created_by: 'Mike Williams',
    created_at: '2026-01-22T08:00:00Z',
    approved_by: null,
    approved_at: null
  }
];

const MEETING_TYPES = [
  { value: 'progress', label: 'Progress Meeting', color: 'bg-blue-100 text-blue-800' },
  { value: 'oac', label: 'OAC Meeting', color: 'bg-purple-100 text-purple-800' },
  { value: 'safety', label: 'Safety Meeting', color: 'bg-red-100 text-red-800' },
  { value: 'kickoff', label: 'Kickoff Meeting', color: 'bg-green-100 text-green-800' },
  { value: 'closeout', label: 'Closeout Meeting', color: 'bg-orange-100 text-orange-800' },
  { value: 'coordination', label: 'Coordination Meeting', color: 'bg-teal-100 text-teal-800' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
];

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  pending_review: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800' }
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatTime = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${minutes} ${ampm}`;
};

const MeetingMinutes = ({ projectId = null }) => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [expandedMeeting, setExpandedMeeting] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    meeting_type: 'progress',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    attendees: [],
    agenda: [],
    discussion_items: [],
    action_items: [],
    notes: '',
    next_meeting: ''
  });
  const [newAttendee, setNewAttendee] = useState({ name: '', role: '', present: true });
  const [newAgendaItem, setNewAgendaItem] = useState('');
  const [newActionItem, setNewActionItem] = useState({ description: '', assignee: '', due_date: '' });

  useEffect(() => {
    loadMeetings();
  }, [projectId]);

  const loadMeetings = async () => {
    setLoading(true);
    try {
      if (isDemoMode()) {
        setMeetings(DEMO_MEETINGS);
      } else {
        let query = supabase
          .from('meeting_minutes')
          .select('*')
          .order('date', { ascending: false });

        if (projectId) {
          query = query.eq('project_id', projectId);
        }

        const { data, error } = await query;
        if (error) throw error;
        setMeetings(data || []);
      }
    } catch (error) {
      console.error('Error loading meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMeetings = useMemo(() => {
    return meetings.filter(meeting => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matches =
          meeting.title?.toLowerCase().includes(search) ||
          meeting.organizer?.toLowerCase().includes(search) ||
          meeting.location?.toLowerCase().includes(search);
        if (!matches) return false;
      }

      if (selectedType !== 'all' && meeting.meeting_type !== selectedType) return false;
      if (selectedStatus !== 'all' && meeting.status !== selectedStatus) return false;

      return true;
    });
  }, [meetings, searchTerm, selectedType, selectedStatus]);

  const stats = useMemo(() => {
    const total = meetings.length;
    const thisMonth = meetings.filter(m => {
      const date = new Date(m.date);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
    const openActions = meetings.reduce((sum, m) => {
      return sum + (m.action_items?.filter(a => a.status === 'open').length || 0);
    }, 0);
    const drafts = meetings.filter(m => m.status === 'draft').length;

    return { total, thisMonth, openActions, drafts };
  }, [meetings]);

  const handleUpdateActionStatus = (meetingId, actionId) => {
    setMeetings(prev => prev.map(m => {
      if (m.id !== meetingId) return m;
      return {
        ...m,
        action_items: m.action_items.map(a =>
          a.id === actionId ? { ...a, status: a.status === 'open' ? 'completed' : 'open' } : a
        )
      };
    }));
  };

  const handleApproveMeeting = (meetingId) => {
    setMeetings(prev => prev.map(m =>
      m.id === meetingId ? {
        ...m,
        status: 'approved',
        approved_by: 'Current User',
        approved_at: new Date().toISOString()
      } : m
    ));
  };

  const addAttendee = () => {
    if (!newAttendee.name) return;
    setFormData(prev => ({
      ...prev,
      attendees: [...prev.attendees, { ...newAttendee, id: `att-${Date.now()}` }]
    }));
    setNewAttendee({ name: '', role: '', present: true });
  };

  const addAgendaItem = () => {
    if (!newAgendaItem) return;
    setFormData(prev => ({
      ...prev,
      agenda: [...prev.agenda, newAgendaItem]
    }));
    setNewAgendaItem('');
  };

  const addActionItem = () => {
    if (!newActionItem.description) return;
    setFormData(prev => ({
      ...prev,
      action_items: [...prev.action_items, { ...newActionItem, id: `act-${Date.now()}`, status: 'open' }]
    }));
    setNewActionItem({ description: '', assignee: '', due_date: '' });
  };

  const handleSaveMeeting = () => {
    if (!formData.title || !formData.date) return;

    const newMeeting = {
      id: `m-${Date.now()}`,
      ...formData,
      project_id: projectId,
      status: 'draft',
      organizer: 'Current User',
      created_by: 'Current User',
      created_at: new Date().toISOString()
    };

    if (editingMeeting) {
      setMeetings(prev => prev.map(m => m.id === editingMeeting.id ? { ...m, ...formData } : m));
    } else {
      setMeetings(prev => [newMeeting, ...prev]);
    }

    setShowModal(false);
    setEditingMeeting(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      meeting_type: 'progress',
      date: '',
      start_time: '',
      end_time: '',
      location: '',
      attendees: [],
      agenda: [],
      discussion_items: [],
      action_items: [],
      notes: '',
      next_meeting: ''
    });
  };

  const exportToPDF = (meeting) => {
    alert(`Export meeting "${meeting.title}" to PDF`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Meeting Minutes</h2>
              <p className="text-sm text-gray-500">Document and track meeting outcomes</p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingMeeting(null);
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            New Meeting
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Total Meetings</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-600">This Month</div>
            <div className="text-2xl font-bold text-blue-700">{stats.thisMonth}</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-sm text-orange-600">Open Actions</div>
            <div className="text-2xl font-bold text-orange-700">{stats.openActions}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-sm text-yellow-600">Drafts</div>
            <div className="text-2xl font-bold text-yellow-700">{stats.drafts}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search meetings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Types</option>
            {MEETING_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Meeting List */}
      <div className="p-4">
        {filteredMeetings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No meeting minutes found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMeetings.map((meeting) => {
              const type = MEETING_TYPES.find(t => t.value === meeting.meeting_type);
              const status = STATUS_CONFIG[meeting.status];
              const isExpanded = expandedMeeting === meeting.id;
              const openActions = meeting.action_items?.filter(a => a.status === 'open').length || 0;

              return (
                <div
                  key={meeting.id}
                  className="border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedMeeting(isExpanded ? null : meeting.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
                        <FileText className="w-5 h-5 text-indigo-600" />
                      </div>

                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${type?.color}`}>
                            {type?.label}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status?.color}`}>
                            {status?.label}
                          </span>
                          {openActions > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                              {openActions} open action{openActions > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        <h3 className="font-medium text-gray-900 mt-1">{meeting.title}</h3>

                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(meeting.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(meeting.start_time)} - {formatTime(meeting.end_time)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {meeting.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {meeting.attendees?.filter(a => a.present).length || 0} attendees
                          </span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100 mt-2 pt-4">
                      <div className="grid grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                          {/* Attendees */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Attendees
                            </h4>
                            <div className="space-y-1">
                              {meeting.attendees?.map((att, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                  {att.present ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-gray-300" />
                                  )}
                                  <span className={att.present ? 'text-gray-900' : 'text-gray-400'}>
                                    {att.name}
                                  </span>
                                  <span className="text-gray-400">- {att.role}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Agenda */}
                          {meeting.agenda?.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Agenda</h4>
                              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                {meeting.agenda.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Discussion Items */}
                          {meeting.discussion_items?.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Discussion & Decisions
                              </h4>
                              <div className="space-y-3">
                                {meeting.discussion_items.map((item, idx) => (
                                  <div key={idx} className="bg-gray-50 rounded-lg p-3">
                                    <h5 className="font-medium text-gray-900 text-sm">{item.topic}</h5>
                                    <p className="text-sm text-gray-600 mt-1">{item.discussion}</p>
                                    {item.decisions?.length > 0 && (
                                      <div className="mt-2">
                                        <span className="text-xs font-medium text-green-700">Decisions:</span>
                                        <ul className="list-disc list-inside text-sm text-green-600 mt-1">
                                          {item.decisions.map((d, i) => (
                                            <li key={i}>{d}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                          {/* Action Items */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                              <ListTodo className="w-4 h-4" />
                              Action Items
                            </h4>
                            <div className="space-y-2">
                              {meeting.action_items?.map((action) => (
                                <div
                                  key={action.id}
                                  className={`flex items-start gap-2 p-2 rounded-lg ${
                                    action.status === 'completed' ? 'bg-green-50' : 'bg-gray-50'
                                  }`}
                                >
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateActionStatus(meeting.id, action.id);
                                    }}
                                    className="mt-0.5"
                                  >
                                    {action.status === 'completed' ? (
                                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <Circle className="w-4 h-4 text-gray-400" />
                                    )}
                                  </button>
                                  <div className="flex-grow">
                                    <p className={`text-sm ${action.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                      {action.description}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                      <span>{action.assignee}</span>
                                      <span>Due: {action.due_date}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Notes */}
                          {meeting.notes && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                                {meeting.notes}
                              </p>
                            </div>
                          )}

                          {/* Next Meeting */}
                          {meeting.next_meeting && (
                            <div className="bg-indigo-50 rounded-lg p-3">
                              <span className="text-xs font-medium text-indigo-700">Next Meeting:</span>
                              <p className="text-sm text-indigo-900 mt-1">{meeting.next_meeting}</p>
                            </div>
                          )}

                          {/* Approval Info */}
                          {meeting.approved_by && (
                            <div className="text-xs text-gray-500">
                              Approved by {meeting.approved_by} on {new Date(meeting.approved_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                        {meeting.status === 'draft' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApproveMeeting(meeting.id);
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                          >
                            Approve Minutes
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            exportToPDF(meeting);
                          }}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                        >
                          <Download className="w-4 h-4 inline mr-1" />
                          Export PDF
                        </button>
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                          <Send className="w-4 h-4 inline mr-1" />
                          Send to Attendees
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {editingMeeting ? 'Edit Meeting Minutes' : 'New Meeting Minutes'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.meeting_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, meeting_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    {MEETING_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Attendees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attendees</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newAttendee.name}
                    onChange={(e) => setNewAttendee(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Name"
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    value={newAttendee.role}
                    onChange={(e) => setNewAttendee(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="Role"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={addAttendee}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {formData.attendees.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.attendees.map((att, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-1">
                        {att.name} ({att.role})
                        <button
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            attendees: prev.attendees.filter((_, i) => i !== idx)
                          }))}
                          className="ml-1 text-gray-400 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Meeting</label>
                <input
                  type="text"
                  value={formData.next_meeting}
                  onChange={(e) => setFormData(prev => ({ ...prev, next_meeting: e.target.value }))}
                  placeholder="e.g., January 30, 2026 at 10:00 AM"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMeeting}
                disabled={!formData.title || !formData.date}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {editingMeeting ? 'Save Changes' : 'Create Meeting'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingMinutes;
