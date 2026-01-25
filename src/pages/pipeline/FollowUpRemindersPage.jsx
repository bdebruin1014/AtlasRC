import React, { useState } from 'react';
import { Bell, Clock, Calendar, User, Phone, Mail, MessageSquare, CheckCircle, AlertTriangle, Plus, Filter, Search, Edit2, Trash2, ChevronDown, Building2, X, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const FollowUpRemindersPage = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);

  const reminders = [
    {
      id: 'rem-1',
      title: 'Follow up with seller agent',
      description: 'Check on counter offer response for Sunset Ridge',
      opportunity: 'Sunset Ridge Phase 3',
      opportunityId: 'opp-1',
      type: 'call',
      priority: 'high',
      dueDate: '2024-12-28',
      dueTime: '10:00 AM',
      status: 'pending',
      assignee: 'John Smith',
      contact: 'Marcus Thompson',
      contactPhone: '(555) 123-4567',
      contactEmail: 'marcus@remax.com',
      recurring: false,
      createdBy: 'John Smith',
      createdAt: '2024-12-26',
      notes: 'Seller has been responsive - expect quick turnaround',
    },
    {
      id: 'rem-2',
      title: 'Submit Phase I ESA response',
      description: 'Respond to environmental consultant questions',
      opportunity: 'Tech Park North',
      opportunityId: 'opp-2',
      type: 'task',
      priority: 'high',
      dueDate: '2024-12-28',
      dueTime: '2:00 PM',
      status: 'pending',
      assignee: 'Sarah Johnson',
      recurring: false,
      createdBy: 'Mike Davis',
      createdAt: '2024-12-25',
    },
    {
      id: 'rem-3',
      title: 'Weekly partner update call',
      description: 'Update equity partners on deal progress',
      opportunity: 'Sunset Ridge Phase 3',
      opportunityId: 'opp-1',
      type: 'meeting',
      priority: 'medium',
      dueDate: '2024-12-29',
      dueTime: '3:00 PM',
      status: 'pending',
      assignee: 'John Smith',
      participants: ['Partner A', 'Partner B', 'CFO'],
      recurring: true,
      recurringPattern: 'weekly',
      createdBy: 'John Smith',
      createdAt: '2024-12-01',
    },
    {
      id: 'rem-4',
      title: 'Send LOI for Harbor Point',
      description: 'Prepare and send letter of intent',
      opportunity: 'Harbor Point Marina',
      opportunityId: 'opp-3',
      type: 'email',
      priority: 'high',
      dueDate: '2024-12-29',
      dueTime: '11:00 AM',
      status: 'pending',
      assignee: 'John Smith',
      contact: 'Robert Chen',
      contactEmail: 'robert@harborholdings.com',
      recurring: false,
      createdBy: 'Sarah Johnson',
      createdAt: '2024-12-27',
    },
    {
      id: 'rem-5',
      title: 'Check on title search status',
      description: 'Follow up with title company on Green Valley',
      opportunity: 'Green Valley Ranch',
      opportunityId: 'opp-4',
      type: 'call',
      priority: 'medium',
      dueDate: '2024-12-30',
      dueTime: '9:00 AM',
      status: 'pending',
      assignee: 'Mike Davis',
      contact: 'First American Title',
      contactPhone: '(555) 987-6543',
      recurring: false,
      createdBy: 'Mike Davis',
      createdAt: '2024-12-26',
    },
    {
      id: 'rem-6',
      title: 'Review comparable sales data',
      description: 'Update market analysis with latest sales',
      opportunity: 'Tech Park North',
      opportunityId: 'opp-2',
      type: 'task',
      priority: 'low',
      dueDate: '2024-12-31',
      dueTime: '4:00 PM',
      status: 'pending',
      assignee: 'Sarah Johnson',
      recurring: false,
      createdBy: 'John Smith',
      createdAt: '2024-12-20',
    },
    {
      id: 'rem-7',
      title: 'Called lender for pre-approval',
      description: 'Initial discussion with First National Bank',
      opportunity: 'Sunset Ridge Phase 3',
      opportunityId: 'opp-1',
      type: 'call',
      priority: 'high',
      dueDate: '2024-12-26',
      dueTime: '2:00 PM',
      status: 'completed',
      assignee: 'John Smith',
      contact: 'Jennifer Walsh',
      contactPhone: '(555) 456-7890',
      completedAt: '2024-12-26 2:15 PM',
      completedBy: 'John Smith',
      outcome: 'Pre-approval confirmed, term sheet to follow',
      recurring: false,
      createdBy: 'John Smith',
      createdAt: '2024-12-24',
    },
    {
      id: 'rem-8',
      title: 'Send updated pro forma',
      description: 'Share revised financials with investment committee',
      opportunity: 'Harbor Point Marina',
      opportunityId: 'opp-3',
      type: 'email',
      priority: 'medium',
      dueDate: '2024-12-25',
      dueTime: '10:00 AM',
      status: 'completed',
      assignee: 'Sarah Johnson',
      completedAt: '2024-12-25 9:45 AM',
      completedBy: 'Sarah Johnson',
      recurring: false,
      createdBy: 'John Smith',
      createdAt: '2024-12-23',
    },
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'meeting': return <Calendar className="w-4 h-4" />;
      case 'task': return <CheckCircle className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'call': return 'bg-green-500';
      case 'email': return 'bg-purple-500';
      case 'meeting': return 'bg-blue-500';
      case 'task': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded font-medium">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded font-medium">Medium</span>;
      case 'low':
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded font-medium">Low</span>;
      default:
        return null;
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  const isToday = (dueDate) => {
    return new Date(dueDate).toDateString() === new Date().toDateString();
  };

  const filteredReminders = reminders.filter(rem => {
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'pending' && rem.status === 'pending') ||
      (filterStatus === 'completed' && rem.status === 'completed') ||
      (filterStatus === 'overdue' && rem.status === 'pending' && isOverdue(rem.dueDate));
    const matchesPriority = filterPriority === 'all' || rem.priority === filterPriority;
    const matchesSearch = rem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rem.opportunity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rem.assignee.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const stats = {
    total: reminders.length,
    pending: reminders.filter(r => r.status === 'pending').length,
    overdue: reminders.filter(r => r.status === 'pending' && isOverdue(r.dueDate)).length,
    dueToday: reminders.filter(r => r.status === 'pending' && isToday(r.dueDate)).length,
    completed: reminders.filter(r => r.status === 'completed').length,
  };

  const markComplete = (id) => {
    // In real app, would update state/database
    console.log('Marking complete:', id);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Follow-up Reminders</h1>
            <p className="text-sm text-gray-500">Track and manage opportunity follow-ups</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-1" />Filter</Button>
            <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-1" />New Reminder
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
          </div>
          <div className={cn("rounded-lg p-3 text-center", stats.overdue > 0 ? "bg-red-50" : "bg-gray-50")}>
            <p className="text-xs text-gray-500">Overdue</p>
            <p className={cn("text-2xl font-bold", stats.overdue > 0 ? "text-red-700" : "text-gray-400")}>{stats.overdue}</p>
          </div>
          <div className={cn("rounded-lg p-3 text-center", stats.dueToday > 0 ? "bg-orange-50" : "bg-gray-50")}>
            <p className="text-xs text-gray-500">Due Today</p>
            <p className={cn("text-2xl font-bold", stats.dueToday > 0 ? "text-orange-700" : "text-gray-400")}>{stats.dueToday}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search reminders..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-1">
          {['all', 'pending', 'overdue', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn("px-3 py-1 rounded text-sm capitalize", filterStatus === status ? "bg-gray-200 font-medium" : "hover:bg-gray-100")}
            >
              {status}
            </button>
          ))}
        </div>
        <select className="border rounded-md px-3 py-1.5 text-sm" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Reminders List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {filteredReminders.map((reminder) => (
              <div
                key={reminder.id}
                onClick={() => setSelectedReminder(reminder)}
                className={cn(
                  "bg-white border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow",
                  selectedReminder?.id === reminder.id && "ring-2 ring-[#047857]",
                  reminder.status === 'completed' && "opacity-60",
                  reminder.status === 'pending' && isOverdue(reminder.dueDate) && "border-red-300 bg-red-50"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white", getTypeColor(reminder.type))}>
                    {getTypeIcon(reminder.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={cn("font-semibold", reminder.status === 'completed' && "line-through")}>{reminder.title}</h3>
                          {getPriorityBadge(reminder.priority)}
                          {reminder.recurring && (
                            <span className="flex items-center gap-1 text-xs text-blue-600">
                              <Repeat className="w-3 h-3" />Recurring
                            </span>
                          )}
                          {reminder.status === 'pending' && isOverdue(reminder.dueDate) && (
                            <span className="flex items-center gap-1 text-xs text-red-600">
                              <AlertTriangle className="w-3 h-3" />Overdue
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{reminder.description}</p>
                      </div>
                      {reminder.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                          onClick={(e) => { e.stopPropagation(); markComplete(reminder.id); }}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />{reminder.opportunity}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{reminder.dueDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />{reminder.dueTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />{reminder.assignee}
                      </span>
                    </div>

                    {reminder.status === 'completed' && reminder.completedAt && (
                      <div className="mt-2 text-xs text-green-600">
                        Completed: {reminder.completedAt} by {reminder.completedBy}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredReminders.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No reminders found</p>
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {selectedReminder && (
          <div className="w-96 border-l bg-white overflow-y-auto">
            <div className="p-4 border-b">
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white mb-3", getTypeColor(selectedReminder.type))}>
                {getTypeIcon(selectedReminder.type)}
              </div>
              <h2 className="font-semibold text-lg">{selectedReminder.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                {getPriorityBadge(selectedReminder.priority)}
                {selectedReminder.status === 'completed' ? (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">Completed</span>
                ) : (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">Pending</span>
                )}
              </div>
            </div>

            <div className="p-4 border-b">
              <h3 className="font-semibold mb-2">Details</h3>
              <p className="text-sm text-gray-600 mb-3">{selectedReminder.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Opportunity</span>
                  <span className="font-medium">{selectedReminder.opportunity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Due Date</span>
                  <span className="font-medium">{selectedReminder.dueDate} at {selectedReminder.dueTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Assignee</span>
                  <span className="font-medium">{selectedReminder.assignee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium capitalize">{selectedReminder.type}</span>
                </div>
              </div>
            </div>

            {(selectedReminder.contact || selectedReminder.contactPhone || selectedReminder.contactEmail) && (
              <div className="p-4 border-b">
                <h3 className="font-semibold mb-2">Contact</h3>
                <div className="space-y-2 text-sm">
                  {selectedReminder.contact && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name</span>
                      <span className="font-medium">{selectedReminder.contact}</span>
                    </div>
                  )}
                  {selectedReminder.contactPhone && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone</span>
                      <a href={`tel:${selectedReminder.contactPhone}`} className="font-medium text-blue-600">{selectedReminder.contactPhone}</a>
                    </div>
                  )}
                  {selectedReminder.contactEmail && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email</span>
                      <a href={`mailto:${selectedReminder.contactEmail}`} className="font-medium text-blue-600">{selectedReminder.contactEmail}</a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedReminder.notes && (
              <div className="p-4 border-b">
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-sm text-gray-600">{selectedReminder.notes}</p>
              </div>
            )}

            {selectedReminder.outcome && (
              <div className="p-4 border-b">
                <h3 className="font-semibold mb-2 text-green-700">Outcome</h3>
                <p className="text-sm text-gray-600">{selectedReminder.outcome}</p>
              </div>
            )}

            <div className="p-4">
              {selectedReminder.status === 'pending' ? (
                <div className="space-y-2">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-1" />Mark Complete
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline"><Edit2 className="w-4 h-4 mr-1" />Edit</Button>
                    <Button variant="outline" className="text-red-600"><Trash2 className="w-4 h-4 mr-1" />Delete</Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" className="w-full">Reopen</Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">Create Reminder</h3>
              <button onClick={() => setShowCreateModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Title *</label>
                <Input placeholder="e.g., Follow up with seller agent" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description</label>
                <textarea className="w-full border rounded-md px-3 py-2 h-20" placeholder="Add details..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Opportunity *</label>
                  <select className="w-full border rounded-md px-3 py-2">
                    <option value="">Select opportunity...</option>
                    <option value="opp-1">Sunset Ridge Phase 3</option>
                    <option value="opp-2">Tech Park North</option>
                    <option value="opp-3">Harbor Point Marina</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Type *</label>
                  <select className="w-full border rounded-md px-3 py-2">
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                    <option value="task">Task</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Due Date *</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Due Time *</label>
                  <Input type="time" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Assignee *</label>
                  <select className="w-full border rounded-md px-3 py-2">
                    <option value="john">John Smith</option>
                    <option value="sarah">Sarah Johnson</option>
                    <option value="mike">Mike Davis</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Priority</label>
                  <select className="w-full border rounded-md px-3 py-2">
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]">Create Reminder</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUpRemindersPage;
