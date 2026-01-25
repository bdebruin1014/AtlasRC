import React, { useState, useEffect, useMemo } from 'react';
import { supabase, isDemoMode } from '@/lib/supabase';
import {
  Clock,
  Mail,
  Phone,
  Calendar,
  FileText,
  MessageSquare,
  DollarSign,
  Building,
  Users,
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  User,
  MapPin,
  Briefcase,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  X,
  Send,
  ExternalLink,
  Star,
  Tag
} from 'lucide-react';

// Demo timeline data
const generateDemoTimeline = (contactId) => [
  {
    id: 't-1',
    contact_id: contactId,
    type: 'email',
    title: 'Sent project update email',
    description: 'Quarterly project status update with financial summary',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    user: 'John Smith',
    metadata: { subject: 'Q4 Project Update - Sunset Apartments', recipients: ['contact@example.com'] }
  },
  {
    id: 't-2',
    contact_id: contactId,
    type: 'call',
    title: 'Phone call - Budget discussion',
    description: 'Discussed budget concerns and timeline adjustments',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    user: 'Sarah Johnson',
    metadata: { duration: '25 minutes', outcome: 'positive' }
  },
  {
    id: 't-3',
    contact_id: contactId,
    type: 'meeting',
    title: 'Site visit meeting',
    description: 'On-site walkthrough of construction progress',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    user: 'John Smith',
    metadata: { location: 'Project Site', attendees: ['John Smith', 'Mike Williams', 'Contact'] }
  },
  {
    id: 't-4',
    contact_id: contactId,
    type: 'note',
    title: 'Added internal note',
    description: 'Contact expressed interest in future investment opportunities. Follow up in Q2.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    user: 'Sarah Johnson',
    metadata: { priority: 'high' }
  },
  {
    id: 't-5',
    contact_id: contactId,
    type: 'deal',
    title: 'Added to deal',
    description: 'Added as investor for Downtown Tower project',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    user: 'John Smith',
    metadata: { deal_name: 'Downtown Tower', role: 'LP Investor', amount: 500000 }
  },
  {
    id: 't-6',
    contact_id: contactId,
    type: 'document',
    title: 'Shared document',
    description: 'Sent investment prospectus for review',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    user: 'Sarah Johnson',
    metadata: { document_name: 'Investment_Prospectus_2026.pdf', file_size: '2.4 MB' }
  },
  {
    id: 't-7',
    contact_id: contactId,
    type: 'email',
    title: 'Received email response',
    description: 'Confirmed receipt of documents and requested meeting',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    user: 'System',
    metadata: { direction: 'inbound', subject: 'Re: Investment Opportunity' }
  },
  {
    id: 't-8',
    contact_id: contactId,
    type: 'task',
    title: 'Task completed',
    description: 'Follow-up call completed as scheduled',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    user: 'John Smith',
    metadata: { task_name: 'Q4 Follow-up Call' }
  },
  {
    id: 't-9',
    contact_id: contactId,
    type: 'contact_created',
    title: 'Contact created',
    description: 'Contact added to CRM from referral',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    user: 'Sarah Johnson',
    metadata: { source: 'Referral', referred_by: 'Bob Williams' }
  }
];

const ACTIVITY_TYPES = [
  { value: 'all', label: 'All Activities' },
  { value: 'email', label: 'Emails' },
  { value: 'call', label: 'Calls' },
  { value: 'meeting', label: 'Meetings' },
  { value: 'note', label: 'Notes' },
  { value: 'deal', label: 'Deals' },
  { value: 'document', label: 'Documents' },
  { value: 'task', label: 'Tasks' }
];

const TYPE_CONFIG = {
  email: { icon: Mail, color: 'bg-blue-100 text-blue-600', label: 'Email' },
  call: { icon: Phone, color: 'bg-green-100 text-green-600', label: 'Call' },
  meeting: { icon: Calendar, color: 'bg-purple-100 text-purple-600', label: 'Meeting' },
  note: { icon: MessageSquare, color: 'bg-yellow-100 text-yellow-600', label: 'Note' },
  deal: { icon: DollarSign, color: 'bg-emerald-100 text-emerald-600', label: 'Deal' },
  document: { icon: FileText, color: 'bg-orange-100 text-orange-600', label: 'Document' },
  task: { icon: CheckCircle2, color: 'bg-teal-100 text-teal-600', label: 'Task' },
  contact_created: { icon: User, color: 'bg-gray-100 text-gray-600', label: 'Created' }
};

const formatTimeAgo = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return then.toLocaleDateString();
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const ContactTimeline = ({ contactId, contactName = 'Contact', showAddButtons = true }) => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState('note');
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    metadata: {}
  });

  useEffect(() => {
    loadTimeline();
  }, [contactId]);

  const loadTimeline = async () => {
    setLoading(true);
    try {
      if (isDemoMode()) {
        setTimeline(generateDemoTimeline(contactId));
      } else {
        const { data, error } = await supabase
          .from('contact_activities')
          .select('*')
          .eq('contact_id', contactId)
          .order('date', { ascending: false });

        if (error) throw error;
        setTimeline(data || []);
      }
    } catch (error) {
      console.error('Error loading timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTimeline = useMemo(() => {
    return timeline.filter(item => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matches =
          item.title?.toLowerCase().includes(search) ||
          item.description?.toLowerCase().includes(search) ||
          item.user?.toLowerCase().includes(search);
        if (!matches) return false;
      }

      if (selectedType !== 'all' && item.type !== selectedType) return false;

      return true;
    });
  }, [timeline, searchTerm, selectedType]);

  const groupedTimeline = useMemo(() => {
    const groups = {};
    filteredTimeline.forEach(item => {
      const date = new Date(item.date).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });
    return Object.entries(groups);
  }, [filteredTimeline]);

  const stats = useMemo(() => {
    const emails = timeline.filter(t => t.type === 'email').length;
    const calls = timeline.filter(t => t.type === 'call').length;
    const meetings = timeline.filter(t => t.type === 'meeting').length;
    const lastContact = timeline.length > 0 ? timeline[0].date : null;

    return { emails, calls, meetings, lastContact };
  }, [timeline]);

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleAddActivity = () => {
    if (!newActivity.title) return;

    const activity = {
      id: `t-${Date.now()}`,
      contact_id: contactId,
      type: addType,
      title: newActivity.title,
      description: newActivity.description,
      date: new Date().toISOString(),
      user: 'Current User',
      metadata: newActivity.metadata
    };

    setTimeline(prev => [activity, ...prev]);
    setShowAddModal(false);
    setNewActivity({ title: '', description: '', metadata: {} });
  };

  const renderMetadata = (item) => {
    const { type, metadata } = item;
    if (!metadata || Object.keys(metadata).length === 0) return null;

    switch (type) {
      case 'email':
        return (
          <div className="text-xs text-gray-500 mt-1">
            {metadata.direction === 'inbound' ? '← Received' : '→ Sent'}
            {metadata.subject && <span className="ml-2">Subject: {metadata.subject}</span>}
          </div>
        );
      case 'call':
        return (
          <div className="text-xs text-gray-500 mt-1">
            Duration: {metadata.duration}
            {metadata.outcome && (
              <span className={`ml-2 ${metadata.outcome === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                • {metadata.outcome}
              </span>
            )}
          </div>
        );
      case 'meeting':
        return (
          <div className="text-xs text-gray-500 mt-1">
            {metadata.location && <span><MapPin className="w-3 h-3 inline" /> {metadata.location}</span>}
            {metadata.attendees && <span className="ml-2">• {metadata.attendees.length} attendees</span>}
          </div>
        );
      case 'deal':
        return (
          <div className="text-xs mt-1">
            <span className="text-emerald-600 font-medium">{metadata.deal_name}</span>
            {metadata.role && <span className="text-gray-500 ml-2">as {metadata.role}</span>}
            {metadata.amount && <span className="text-gray-500 ml-2">${metadata.amount.toLocaleString()}</span>}
          </div>
        );
      case 'document':
        return (
          <div className="text-xs text-gray-500 mt-1">
            <FileText className="w-3 h-3 inline mr-1" />
            {metadata.document_name} ({metadata.file_size})
          </div>
        );
      case 'note':
        return metadata.priority === 'high' ? (
          <div className="text-xs text-orange-600 mt-1">
            <Star className="w-3 h-3 inline mr-1" /> High Priority
          </div>
        ) : null;
      case 'contact_created':
        return (
          <div className="text-xs text-gray-500 mt-1">
            Source: {metadata.source}
            {metadata.referred_by && <span className="ml-2">• Referred by {metadata.referred_by}</span>}
          </div>
        );
      default:
        return null;
    }
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
            <div className="p-2 bg-violet-100 rounded-lg">
              <Clock className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Activity Timeline</h2>
              <p className="text-sm text-gray-500">{contactName}</p>
            </div>
          </div>
          {showAddButtons && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setAddType('note'); setShowAddModal(true); }}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <MessageSquare className="w-4 h-4 inline mr-1" /> Note
              </button>
              <button
                onClick={() => { setAddType('call'); setShowAddModal(true); }}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Phone className="w-4 h-4 inline mr-1" /> Call
              </button>
              <button
                onClick={() => { setAddType('email'); setShowAddModal(true); }}
                className="px-3 py-2 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700"
              >
                <Mail className="w-4 h-4 inline mr-1" /> Email
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.emails}</div>
            <div className="text-xs text-gray-500">Emails</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.calls}</div>
            <div className="text-xs text-gray-500">Calls</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.meetings}</div>
            <div className="text-xs text-gray-500">Meetings</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-700">
              {stats.lastContact ? formatTimeAgo(stats.lastContact) : 'N/A'}
            </div>
            <div className="text-xs text-gray-500">Last Contact</div>
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
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
          >
            {ACTIVITY_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-4">
        {filteredTimeline.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No activities found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedTimeline.map(([month, items]) => (
              <div key={month}>
                <h3 className="text-sm font-medium text-gray-500 mb-3">{month}</h3>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />

                  <div className="space-y-4">
                    {items.map((item) => {
                      const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.note;
                      const Icon = config.icon;
                      const isExpanded = expandedItems.has(item.id);

                      return (
                        <div key={item.id} className="relative flex gap-4">
                          {/* Icon */}
                          <div className={`relative z-10 p-2 rounded-full ${config.color} flex-shrink-0`}>
                            <Icon className="w-4 h-4" />
                          </div>

                          {/* Content */}
                          <div
                            className="flex-grow bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => toggleExpanded(item.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">{item.title}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs ${config.color}`}>
                                    {config.label}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                {renderMetadata(item)}
                              </div>
                              <div className="text-right flex-shrink-0 ml-4">
                                <div className="text-xs text-gray-500">{formatTimeAgo(item.date)}</div>
                                <div className="text-xs text-gray-400 mt-1">{item.user}</div>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-500">
                                <div>Full timestamp: {formatDate(item.date)}</div>
                                {item.metadata && Object.keys(item.metadata).length > 0 && (
                                  <div className="mt-2">
                                    <div className="font-medium text-gray-700 mb-1">Details:</div>
                                    <pre className="text-xs bg-white p-2 rounded overflow-auto">
                                      {JSON.stringify(item.metadata, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Add {TYPE_CONFIG[addType]?.label || 'Activity'}
                </h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={addType}
                  onChange={(e) => setAddType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                >
                  <option value="note">Note</option>
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={`e.g., ${addType === 'call' ? 'Follow-up call' : addType === 'email' ? 'Sent proposal' : 'Internal note'}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newActivity.description}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {addType === 'call' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g., 15 minutes"
                    onChange={(e) => setNewActivity(prev => ({
                      ...prev,
                      metadata: { ...prev.metadata, duration: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              )}

              {addType === 'email' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    placeholder="Email subject"
                    onChange={(e) => setNewActivity(prev => ({
                      ...prev,
                      metadata: { ...prev.metadata, subject: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddActivity}
                disabled={!newActivity.title}
                className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
              >
                Add Activity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactTimeline;
