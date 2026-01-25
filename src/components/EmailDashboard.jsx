import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';
import {
  Mail,
  Inbox,
  Send,
  Archive,
  Star,
  StarOff,
  Trash2,
  Reply,
  Forward,
  Paperclip,
  Search,
  Filter,
  RefreshCw,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  User,
  Building2,
  FolderOpen,
  Tag,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Link2
} from 'lucide-react';

// Demo email data
const demoEmails = [
  {
    id: '1',
    from: { name: 'John Smith', email: 'john.smith@abcinvestments.com' },
    to: [{ name: 'You', email: 'user@atlas.com' }],
    subject: 'RE: Sunset Towers Investment Opportunity',
    preview: 'Thank you for sending over the pro forma. The numbers look promising. I have a few questions about the projected rent increases...',
    body: `Hi,

Thank you for sending over the pro forma. The numbers look promising. I have a few questions about the projected rent increases in year 3:

1. What market data are you using to support the 5% increase?
2. Have you factored in potential vacancy during renovations?
3. What's the expected cap rate at exit?

Looking forward to discussing further.

Best regards,
John Smith
ABC Investments`,
    date: '2026-01-25T09:30:00Z',
    read: false,
    starred: true,
    folder: 'inbox',
    attachments: [],
    linked_contact: { id: 'c1', name: 'John Smith', type: 'investor' },
    linked_project: { id: 'p1', name: 'Sunset Towers' },
    labels: ['investor', 'urgent']
  },
  {
    id: '2',
    from: { name: 'Sarah Johnson', email: 'sarah@xyzholdings.com' },
    to: [{ name: 'You', email: 'user@atlas.com' }],
    subject: 'Due Diligence Documents - Harbor View',
    preview: 'Please find attached the environmental report and Phase I assessment for the Harbor View property...',
    body: `Hello,

Please find attached the environmental report and Phase I assessment for the Harbor View property.

Key findings:
- No environmental concerns identified
- Property is in compliance with local regulations
- Recommended follow-up inspection in 6 months

Let me know if you need any clarification on the reports.

Sarah Johnson
XYZ Holdings`,
    date: '2026-01-24T16:45:00Z',
    read: true,
    starred: false,
    folder: 'inbox',
    attachments: [
      { name: 'Environmental_Report.pdf', size: '2.4 MB' },
      { name: 'Phase_I_Assessment.pdf', size: '1.8 MB' }
    ],
    linked_contact: { id: 'c2', name: 'Sarah Johnson', type: 'vendor' },
    linked_project: { id: 'p2', name: 'Harbor View Apartments' },
    labels: ['due-diligence']
  },
  {
    id: '3',
    from: { name: 'Mike Chen', email: 'mchen@globalproperties.com' },
    to: [{ name: 'You', email: 'user@atlas.com' }],
    subject: 'Contract Review - Vendor Agreement',
    preview: 'I\'ve reviewed the vendor agreement and have some suggested revisions. Please see my comments below...',
    body: `Hi team,

I've reviewed the vendor agreement and have some suggested revisions:

1. Section 3.2 - Payment terms should be Net 30, not Net 45
2. Section 5.1 - Insurance requirements need to be increased to $2M
3. Section 7.3 - Termination clause needs 60-day notice period

Please update and send back for final review.

Mike Chen
Global Properties`,
    date: '2026-01-24T11:20:00Z',
    read: true,
    starred: true,
    folder: 'inbox',
    attachments: [
      { name: 'Vendor_Agreement_Redlined.docx', size: '156 KB' }
    ],
    linked_contact: { id: 'c3', name: 'Mike Chen', type: 'partner' },
    linked_project: null,
    labels: ['legal', 'review']
  },
  {
    id: '4',
    from: { name: 'You', email: 'user@atlas.com' },
    to: [{ name: 'Lisa Park', email: 'lisa@tenantservices.com' }],
    subject: 'Lease Renewal - Unit 205',
    preview: 'Hi Lisa, Following up on the lease renewal for Unit 205. The tenant has agreed to the new terms...',
    body: `Hi Lisa,

Following up on the lease renewal for Unit 205. The tenant has agreed to the new terms:

- Monthly rent: $2,450 (5% increase)
- Lease term: 24 months
- Move-in date: February 1, 2026

Please prepare the renewal agreement and send for signature.

Thanks,
Atlas Team`,
    date: '2026-01-23T14:00:00Z',
    read: true,
    starred: false,
    folder: 'sent',
    attachments: [],
    linked_contact: { id: 'c4', name: 'Lisa Park', type: 'tenant' },
    linked_project: { id: 'p1', name: 'Sunset Towers' },
    labels: ['leasing']
  },
  {
    id: '5',
    from: { name: 'Property Insurance Co', email: 'claims@propertyinsurance.com' },
    to: [{ name: 'You', email: 'user@atlas.com' }],
    subject: 'Policy Renewal Reminder - Due Feb 15',
    preview: 'This is a reminder that your property insurance policy #PI-2025-0892 is due for renewal on February 15, 2026...',
    body: `Dear Valued Customer,

This is a reminder that your property insurance policy #PI-2025-0892 is due for renewal on February 15, 2026.

Current Coverage Details:
- Property: Mountain Ridge Complex
- Coverage Amount: $5,000,000
- Annual Premium: $24,500

Please contact us to discuss renewal options or any coverage changes.

Property Insurance Co
Claims Department`,
    date: '2026-01-22T10:00:00Z',
    read: true,
    starred: false,
    folder: 'inbox',
    attachments: [
      { name: 'Renewal_Quote.pdf', size: '89 KB' }
    ],
    linked_contact: null,
    linked_project: { id: 'p3', name: 'Mountain Ridge Complex' },
    labels: ['insurance', 'action-required']
  },
  {
    id: '6',
    from: { name: 'David Lee', email: 'david@constructionpros.com' },
    to: [{ name: 'You', email: 'user@atlas.com' }],
    subject: 'Bid Submission - Renovation Project',
    preview: 'Please find our bid for the renovation project at Sunset Towers. We are confident we can deliver quality work...',
    body: `Hello,

Please find our bid for the renovation project at Sunset Towers:

Scope: Common area renovations (lobby, hallways, amenity spaces)
Timeline: 8 weeks
Total Bid: $185,000

Breakdown:
- Materials: $95,000
- Labor: $75,000
- Permits & Fees: $15,000

We are confident we can deliver quality work within budget and timeline.

David Lee
Construction Pros Inc.`,
    date: '2026-01-21T09:15:00Z',
    read: true,
    starred: false,
    folder: 'archive',
    attachments: [
      { name: 'Bid_Proposal.pdf', size: '1.2 MB' },
      { name: 'Company_References.pdf', size: '245 KB' }
    ],
    linked_contact: { id: 'c5', name: 'David Lee', type: 'vendor' },
    linked_project: { id: 'p1', name: 'Sunset Towers' },
    labels: ['bid', 'vendor']
  }
];

const folders = [
  { id: 'inbox', name: 'Inbox', icon: Inbox, count: 3 },
  { id: 'sent', name: 'Sent', icon: Send, count: 0 },
  { id: 'starred', name: 'Starred', icon: Star, count: 2 },
  { id: 'archive', name: 'Archive', icon: Archive, count: 1 },
  { id: 'trash', name: 'Trash', icon: Trash2, count: 0 }
];

const labelColors = {
  'investor': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'urgent': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  'due-diligence': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'legal': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  'review': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'leasing': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'insurance': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  'action-required': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  'bid': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  'vendor': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
};

export default function EmailDashboard() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({ to: '', subject: '', body: '' });

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      if (isDemoMode()) {
        setEmails(demoEmails);
      } else {
        const { data, error } = await supabase
          .from('emails')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;
        setEmails(data || []);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
      setEmails(demoEmails);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmails = useMemo(() => {
    return emails.filter(email => {
      // Folder filter
      if (selectedFolder === 'starred') {
        if (!email.starred) return false;
      } else if (email.folder !== selectedFolder) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          email.subject.toLowerCase().includes(search) ||
          email.from.name.toLowerCase().includes(search) ||
          email.from.email.toLowerCase().includes(search) ||
          email.preview.toLowerCase().includes(search)
        );
      }

      return true;
    });
  }, [emails, selectedFolder, searchTerm]);

  const toggleStar = (emailId) => {
    setEmails(prev => prev.map(e =>
      e.id === emailId ? { ...e, starred: !e.starred } : e
    ));
  };

  const markAsRead = (emailId) => {
    setEmails(prev => prev.map(e =>
      e.id === emailId ? { ...e, read: true } : e
    ));
  };

  const moveToFolder = (emailId, folder) => {
    setEmails(prev => prev.map(e =>
      e.id === emailId ? { ...e, folder } : e
    ));
    if (selectedEmail?.id === emailId) {
      setSelectedEmail(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getFolderCount = (folderId) => {
    if (folderId === 'starred') {
      return emails.filter(e => e.starred).length;
    }
    return emails.filter(e => e.folder === folderId && !e.read).length;
  };

  const stats = {
    total: emails.length,
    unread: emails.filter(e => !e.read).length,
    linked: emails.filter(e => e.linked_contact || e.linked_project).length
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Mail className="h-7 w-7 text-blue-600" />
          Email Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage and link emails to contacts and projects
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Emails</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Unread</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600">{stats.linked}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Linked to Records</div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0">
          <button
            onClick={() => setShowCompose(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-4"
          >
            <Plus className="h-5 w-5" />
            Compose
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2">
            {folders.map(folder => {
              const IconComponent = folder.icon;
              const count = getFolderCount(folder.id);
              return (
                <button
                  key={folder.id}
                  onClick={() => {
                    setSelectedFolder(folder.id);
                    setSelectedEmail(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedFolder === folder.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    <span>{folder.name}</span>
                  </div>
                  {count > 0 && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-4">
          {/* Email List */}
          <div className={`${selectedEmail ? 'w-2/5' : 'flex-1'} bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col`}>
            {/* Search */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>

            {/* Email List */}
            <div className="flex-1 overflow-auto">
              {filteredEmails.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No emails found</p>
                </div>
              ) : (
                filteredEmails.map(email => (
                  <div
                    key={email.id}
                    onClick={() => {
                      setSelectedEmail(email);
                      markAsRead(email.id);
                    }}
                    className={`p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      selectedEmail?.id === email.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    } ${!email.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(email.id);
                        }}
                        className="mt-1"
                      >
                        {email.starred ? (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        ) : (
                          <StarOff className="h-4 w-4 text-gray-300 hover:text-yellow-500" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm truncate ${!email.read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                            {email.from.name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                            {formatDate(email.date)}
                          </span>
                        </div>
                        <div className={`text-sm truncate mb-1 ${!email.read ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {email.subject}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {email.preview}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {email.attachments.length > 0 && (
                            <Paperclip className="h-3 w-3 text-gray-400" />
                          )}
                          {email.linked_project && (
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {email.linked_project.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Email Detail */}
          {selectedEmail && (
            <div className="w-3/5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedEmail.subject}
                  </h2>
                  <button
                    onClick={() => setSelectedEmail(null)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectedEmail.from.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedEmail.from.email}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(selectedEmail.date).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <Reply className="h-4 w-4" />
                  Reply
                </button>
                <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <Forward className="h-4 w-4" />
                  Forward
                </button>
                <button
                  onClick={() => moveToFolder(selectedEmail.id, 'archive')}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <Archive className="h-4 w-4" />
                  Archive
                </button>
                <button
                  onClick={() => moveToFolder(selectedEmail.id, 'trash')}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>

              {/* Linked Records */}
              {(selectedEmail.linked_contact || selectedEmail.linked_project) && (
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">LINKED TO</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmail.linked_contact && (
                      <a
                        href={`/contacts/${selectedEmail.linked_contact.id}`}
                        className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm hover:border-blue-500 transition-colors"
                      >
                        <User className="h-3 w-3 text-blue-600" />
                        {selectedEmail.linked_contact.name}
                        <ExternalLink className="h-3 w-3 text-gray-400" />
                      </a>
                    )}
                    {selectedEmail.linked_project && (
                      <a
                        href={`/project/${selectedEmail.linked_project.id}`}
                        className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm hover:border-blue-500 transition-colors"
                      >
                        <Building2 className="h-3 w-3 text-green-600" />
                        {selectedEmail.linked_project.name}
                        <ExternalLink className="h-3 w-3 text-gray-400" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Labels */}
              {selectedEmail.labels.length > 0 && (
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-400" />
                  {selectedEmail.labels.map(label => (
                    <span
                      key={label}
                      className={`px-2 py-0.5 rounded text-xs ${labelColors[label] || 'bg-gray-100 text-gray-700'}`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}

              {/* Body */}
              <div className="flex-1 overflow-auto p-4">
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 dark:text-gray-300">
                  {selectedEmail.body}
                </pre>
              </div>

              {/* Attachments */}
              {selectedEmail.attachments.length > 0 && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Attachments ({selectedEmail.attachments.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmail.attachments.map((att, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-blue-500"
                      >
                        <Paperclip className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{att.name}</span>
                        <span className="text-xs text-gray-500">({att.size})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">New Message</h2>
              <button
                onClick={() => setShowCompose(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="To"
                  value={composeData.to}
                  onChange={(e) => setComposeData(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Subject"
                  value={composeData.subject}
                  onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <textarea
                  placeholder="Write your message..."
                  value={composeData.body}
                  onChange={(e) => setComposeData(prev => ({ ...prev, body: e.target.value }))}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <Paperclip className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <Link2 className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCompose(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Send className="h-4 w-4" />
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
