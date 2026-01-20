import React, { useState } from 'react';
import { Plus, Search, Eye, Edit2, X, MessageSquare, Clock, User, Tag, Pin, PinOff, Trash2, Filter, Calendar, FileText, CheckCircle, AlertTriangle, DollarSign, HardHat, Users, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const NotesPage = ({ projectId }) => {
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' or 'activity'

  const [notes, setNotes] = useState([
    {
      id: 1,
      title: 'Unit 1 Closing Summary',
      content: 'Unit 1 closed successfully on 12/20/24 for $579,000. Buyer: James & Emily Rodriguez. No issues at closing. Keys handed over same day. First sale milestone achieved!',
      category: 'milestone',
      author: 'Bryan VanRock',
      createdAt: '2024-12-20T14:30:00',
      updatedAt: '2024-12-20T14:30:00',
      pinned: true,
      tags: ['closing', 'sales', 'unit-1'],
    },
    {
      id: 2,
      title: 'Construction Meeting Notes - 12/18',
      content: 'Weekly construction meeting highlights:\n\n1. Framing is 75% complete on all units\n2. Roof trusses delivered and installed on Building A\n3. Mechanical rough-in starting next week\n4. Electrical contractor needs additional 3 days for Unit 4\n5. Weather delay expected - rain forecasted for 12/22-12/24\n\nAction items:\n- GC to provide updated schedule by Friday\n- Coordinate HVAC delivery for 12/28\n- Review electrical change order for Unit 4',
      category: 'construction',
      author: 'Sarah Mitchell',
      createdAt: '2024-12-18T16:00:00',
      updatedAt: '2024-12-18T16:00:00',
      pinned: false,
      tags: ['meeting', 'construction', 'schedule'],
    },
    {
      id: 3,
      title: 'Investor Distribution Notice',
      content: 'Distribution scheduled for 1/15/2025:\n\n- Total Distribution: $500,000\n- Type: Return of Capital\n- Source: Unit 1 closing proceeds\n\nAllocations:\n- Olive Brynn LLC: $360,000 (72%)\n- Johnson Family Trust: $80,000 (16%)\n- Smith Capital: $40,000 (8%)\n- Davis Investment: $20,000 (4%)\n\nStatements will be sent by 1/10.',
      category: 'financial',
      author: 'Bryan VanRock',
      createdAt: '2024-12-15T10:00:00',
      updatedAt: '2024-12-15T10:00:00',
      pinned: true,
      tags: ['distribution', 'investors'],
    },
    {
      id: 4,
      title: 'Bank Draw Request #12 Approved',
      content: 'Draw request #12 for $445,000 has been approved by First National Bank. Funds should be available within 3 business days.\n\nInspection completed 12/12 - passed with no issues.\n\nDraw breakdown:\n- Hard Costs: $385,000\n- Soft Costs: $35,000\n- Interest: $25,000',
      category: 'financial',
      author: 'Bryan VanRock',
      createdAt: '2024-12-14T11:30:00',
      updatedAt: '2024-12-14T11:30:00',
      pinned: false,
      tags: ['draw', 'financing', 'bank'],
    },
    {
      id: 5,
      title: 'Warranty Claim - Unit 1 Kitchen Faucet',
      content: 'Homeowner reported leaking kitchen faucet. ABC Plumbing scheduled for Monday 12/30 for repair. Should be covered under builder warranty - no cost expected.',
      category: 'issue',
      author: 'Sarah Mitchell',
      createdAt: '2024-12-26T09:00:00',
      updatedAt: '2024-12-26T09:00:00',
      pinned: false,
      tags: ['warranty', 'plumbing', 'unit-1'],
    },
    {
      id: 6,
      title: 'Q4 2024 Investor Report Sent',
      content: 'Q4 2024 investor report has been distributed to all LP investors via email. Report includes:\n\n- Construction progress update (68% complete)\n- Financial summary\n- First sale announcement\n- Projected timeline to completion\n- Photos of progress\n\nAll investors acknowledged receipt.',
      category: 'investor',
      author: 'Bryan VanRock',
      createdAt: '2024-12-28T08:00:00',
      updatedAt: '2024-12-28T08:00:00',
      pinned: false,
      tags: ['report', 'investors', 'q4'],
    },
    {
      id: 7,
      title: 'Hot Lead - Jennifer Martinez',
      content: 'Strong buyer interest in Unit 3 (Type B). Pre-approved for $700K. Showing scheduled for 12/29. Very motivated - needs to close by end of February. Sarah following up.',
      category: 'sales',
      author: 'Sarah Agent',
      createdAt: '2024-12-15T15:00:00',
      updatedAt: '2024-12-27T10:00:00',
      pinned: false,
      tags: ['lead', 'sales', 'unit-3'],
    },
  ]);

  const activityLog = [
    { id: 1, action: 'Note created', details: 'Q4 2024 Investor Report Sent', user: 'Bryan VanRock', timestamp: '2024-12-28T08:00:00', type: 'note' },
    { id: 2, action: 'Document uploaded', details: 'Q4 2024 Investor Report.pdf', user: 'Bryan VanRock', timestamp: '2024-12-28T07:45:00', type: 'document' },
    { id: 3, action: 'Lead updated', details: 'Jennifer Martinez - status changed to Hot', user: 'Sarah Agent', timestamp: '2024-12-27T10:00:00', type: 'lead' },
    { id: 4, action: 'Warranty claim created', details: 'WC-001 - Kitchen faucet leak', user: 'Sarah Mitchell', timestamp: '2024-12-26T09:00:00', type: 'warranty' },
    { id: 5, action: 'Distribution scheduled', details: 'DIST-001 - $500,000 for 1/15/2025', user: 'Bryan VanRock', timestamp: '2024-12-22T14:00:00', type: 'financial' },
    { id: 6, action: 'Unit sold', details: 'Unit 1 - $579,000 to Rodriguez family', user: 'System', timestamp: '2024-12-20T14:30:00', type: 'sale' },
    { id: 7, action: 'Note created', details: 'Unit 1 Closing Summary', user: 'Bryan VanRock', timestamp: '2024-12-20T14:30:00', type: 'note' },
    { id: 8, action: 'Construction update', details: 'Framing progress: 75%', user: 'Sarah Mitchell', timestamp: '2024-12-18T16:00:00', type: 'construction' },
    { id: 9, action: 'Draw approved', details: 'Draw #12 - $445,000', user: 'First National Bank', timestamp: '2024-12-14T11:30:00', type: 'financial' },
    { id: 10, action: 'Note created', details: 'Investor Distribution Notice', user: 'Bryan VanRock', timestamp: '2024-12-15T10:00:00', type: 'note' },
  ];

  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: '',
  });

  const categories = [
    { id: 'all', name: 'All Notes', icon: MessageSquare },
    { id: 'general', name: 'General', icon: FileText },
    { id: 'construction', name: 'Construction', icon: HardHat },
    { id: 'financial', name: 'Financial', icon: DollarSign },
    { id: 'sales', name: 'Sales', icon: Users },
    { id: 'investor', name: 'Investor', icon: Users },
    { id: 'issue', name: 'Issues', icon: AlertTriangle },
    { id: 'milestone', name: 'Milestones', icon: CheckCircle },
  ];

  const getCategoryColor = (category) => {
    switch (category) {
      case 'construction': return 'bg-orange-100 text-orange-700';
      case 'financial': return 'bg-green-100 text-green-700';
      case 'sales': return 'bg-pink-100 text-pink-700';
      case 'investor': return 'bg-purple-100 text-purple-700';
      case 'issue': return 'bg-red-100 text-red-700';
      case 'milestone': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'note': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'document': return <FileText className="w-4 h-4 text-purple-500" />;
      case 'lead': return <Users className="w-4 h-4 text-pink-500" />;
      case 'warranty': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'financial': return <DollarSign className="w-4 h-4 text-green-500" />;
      case 'sale': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'construction': return <HardHat className="w-4 h-4 text-orange-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredNotes = notes.filter(note => {
    if (filterCategory === 'all') return true;
    return note.category === filterCategory;
  }).sort((a, b) => {
    // Pinned notes first, then by date
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const togglePin = (noteId) => {
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, pinned: !n.pinned } : n));
  };

  const handleSaveNote = () => {
    const note = {
      id: notes.length + 1,
      ...newNote,
      tags: newNote.tags.split(',').map(t => t.trim()).filter(t => t),
      author: 'Bryan VanRock',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pinned: false,
    };
    setNotes(prev => [...prev, note]);
    setShowNoteModal(false);
    setNewNote({ title: '', content: '', category: 'general', tags: '' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Notes & Activity</h1>
          <p className="text-sm text-gray-500">{notes.length} notes • {notes.filter(n => n.pinned).length} pinned</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowNoteModal(true)}>
            <Plus className="w-4 h-4 mr-1" />Add Note
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('notes')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'notes' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Notes ({notes.length})
        </button>
        <button onClick={() => setActiveTab('activity')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'activity' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Activity Log
        </button>
      </div>

      {activeTab === 'notes' && (
        <div className="grid grid-cols-4 gap-6">
          {/* Category Sidebar */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Categories</h3>
            <div className="space-y-1">
              {categories.map(cat => {
                const Icon = cat.icon;
                const count = cat.id === 'all' ? notes.length : notes.filter(n => n.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setFilterCategory(cat.id)}
                    className={cn("w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm", filterCategory === cat.id ? "bg-[#047857] text-white" : "hover:bg-gray-100")}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1">{cat.name}</span>
                    <span className={cn("text-xs", filterCategory === cat.id ? "text-green-100" : "text-gray-400")}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes List */}
          <div className="col-span-3 space-y-4">
            {/* Search */}
            <div className="bg-white border rounded-lg p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search notes..." className="pl-9" />
              </div>
            </div>

            {/* Notes */}
            {filteredNotes.map((note) => (
              <div key={note.id} className={cn("bg-white border rounded-lg p-4", note.pinned && "border-amber-300 bg-amber-50/50")}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {note.pinned && <Pin className="w-4 h-4 text-amber-500" />}
                    <h4 className="font-semibold">{note.title}</h4>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={cn("px-2 py-1 rounded text-xs capitalize", getCategoryColor(note.category))}>
                      {note.category}
                    </span>
                    <button onClick={() => togglePin(note.id)} className="p-1 hover:bg-gray-100 rounded">
                      {note.pinned ? <PinOff className="w-4 h-4 text-gray-400" /> : <Pin className="w-4 h-4 text-gray-400" />}
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded" onClick={() => setSelectedNote(note)}>
                      <Eye className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-3 mb-3">{note.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {note.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">#{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <User className="w-3 h-3" />
                    <span>{note.author}</span>
                    <span>•</span>
                    <span>{formatDate(note.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white border rounded-lg p-4">
          <div className="space-y-0">
            {activityLog.map((activity, idx) => (
              <div key={activity.id} className="flex gap-4 py-4 border-b last:border-b-0">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                  {idx < activityLog.length - 1 && <div className="w-0.5 h-full bg-gray-200 mt-2"></div>}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{activity.action}</p>
                    <span className="text-xs text-gray-500">{formatDate(activity.timestamp)} at {formatTime(activity.timestamp)}</span>
                  </div>
                  <p className="text-sm text-gray-600">{activity.details}</p>
                  <p className="text-xs text-gray-400 mt-1">by {activity.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">Add Note</h3>
              <button onClick={() => setShowNoteModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Title *</label>
                <Input value={newNote.title} onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))} placeholder="Note title" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Category</label>
                <select className="w-full border rounded-md px-3 py-2" value={newNote.category} onChange={(e) => setNewNote(prev => ({ ...prev, category: e.target.value }))}>
                  {categories.filter(c => c.id !== 'all').map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Content *</label>
                <textarea 
                  className="w-full border rounded-md px-3 py-2" 
                  rows={8} 
                  value={newNote.content} 
                  onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))} 
                  placeholder="Write your note here..."
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Tags</label>
                <Input value={newNote.tags} onChange={(e) => setNewNote(prev => ({ ...prev, tags: e.target.value }))} placeholder="tag1, tag2, tag3 (comma separated)" />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 sticky bottom-0">
              <Button variant="outline" onClick={() => setShowNoteModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleSaveNote}>Save Note</Button>
            </div>
          </div>
        </div>
      )}

      {/* Note Detail Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <div className="flex items-center gap-2">
                {selectedNote.pinned && <Pin className="w-4 h-4 text-amber-500" />}
                <h3 className="font-semibold">{selectedNote.title}</h3>
              </div>
              <button onClick={() => setSelectedNote(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className={cn("px-2 py-1 rounded text-xs capitalize", getCategoryColor(selectedNote.category))}>
                  {selectedNote.category}
                </span>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="w-4 h-4" />
                  <span>{selectedNote.author}</span>
                  <span>•</span>
                  <span>{formatDate(selectedNote.createdAt)}</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="whitespace-pre-wrap">{selectedNote.content}</p>
              </div>

              {selectedNote.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {selectedNote.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">#{tag}</span>
                  ))}
                </div>
              )}

              <div className="text-xs text-gray-400">
                Created: {formatDate(selectedNote.createdAt)} • Last updated: {formatDate(selectedNote.updatedAt)}
              </div>
            </div>
            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
              <Button variant="outline" size="sm" className="text-red-600">
                <Trash2 className="w-4 h-4 mr-1" />Delete
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedNote(null)}>Close</Button>
                <Button className="bg-[#047857] hover:bg-[#065f46]"><Edit2 className="w-4 h-4 mr-1" />Edit</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
