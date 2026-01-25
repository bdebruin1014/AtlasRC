import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';

// Demo comments data
const demoComments = [
  {
    id: 'cmt-001',
    entityType: 'project',
    entityId: 'proj-123',
    entityName: 'Highland Park Development',
    content: 'Just got off the call with the city planning department. They confirmed our variance request is on the agenda for next month\'s meeting. @sarah.johnson can you prepare the presentation materials?',
    author: { id: 'user-1', name: 'Michael Chen', avatar: null, initials: 'MC' },
    mentions: ['user-2'],
    attachments: [],
    isPinned: true,
    isPrivate: false,
    parentId: null,
    replies: [
      {
        id: 'cmt-001-r1',
        content: 'On it! I\'ll have the draft ready by Friday.',
        author: { id: 'user-2', name: 'Sarah Johnson', avatar: null, initials: 'SJ' },
        createdAt: '2026-01-24T15:30:00Z'
      }
    ],
    createdAt: '2026-01-24T14:00:00Z',
    updatedAt: '2026-01-24T14:00:00Z'
  },
  {
    id: 'cmt-002',
    entityType: 'contact',
    entityId: 'cnt-456',
    entityName: 'Robert Williams (Broker)',
    content: 'Robert mentioned he has 3 off-market properties coming up in the downtown area. Following up next week.',
    author: { id: 'user-3', name: 'Emily Davis', avatar: null, initials: 'ED' },
    mentions: [],
    attachments: [],
    isPinned: false,
    isPrivate: false,
    parentId: null,
    replies: [],
    createdAt: '2026-01-24T11:00:00Z',
    updatedAt: '2026-01-24T11:00:00Z'
  },
  {
    id: 'cmt-003',
    entityType: 'property',
    entityId: 'prop-789',
    entityName: '450 Commerce Street',
    content: 'Environmental Phase I came back clean. Moving forward with Phase II is optional but recommended given the industrial history. Budget impact: $15-25K.',
    author: { id: 'user-1', name: 'Michael Chen', avatar: null, initials: 'MC' },
    mentions: [],
    attachments: [{ name: 'Phase_I_Report.pdf', size: '2.4 MB' }],
    isPinned: true,
    isPrivate: false,
    parentId: null,
    replies: [],
    createdAt: '2026-01-23T16:00:00Z',
    updatedAt: '2026-01-23T16:00:00Z'
  },
  {
    id: 'cmt-004',
    entityType: 'project',
    entityId: 'proj-124',
    entityName: 'Riverside Commons',
    content: 'PRIVATE: Financing terms from First National are better than expected. 4.25% with 75% LTV. Keeping this confidential until we finalize.',
    author: { id: 'user-1', name: 'Michael Chen', avatar: null, initials: 'MC' },
    mentions: [],
    attachments: [],
    isPinned: false,
    isPrivate: true,
    parentId: null,
    replies: [],
    createdAt: '2026-01-23T10:00:00Z',
    updatedAt: '2026-01-23T10:00:00Z'
  },
  {
    id: 'cmt-005',
    entityType: 'project',
    entityId: 'proj-123',
    entityName: 'Highland Park Development',
    content: '@team Quick reminder that the investor presentation is next Tuesday at 2pm. Please review the latest pro forma numbers.',
    author: { id: 'user-2', name: 'Sarah Johnson', avatar: null, initials: 'SJ' },
    mentions: ['team'],
    attachments: [],
    isPinned: false,
    isPrivate: false,
    parentId: null,
    replies: [
      {
        id: 'cmt-005-r1',
        content: 'I\'ll update the cash flow projections today.',
        author: { id: 'user-4', name: 'David Park', avatar: null, initials: 'DP' },
        createdAt: '2026-01-22T09:30:00Z'
      },
      {
        id: 'cmt-005-r2',
        content: 'Market comps section is done. Sent to your email.',
        author: { id: 'user-3', name: 'Emily Davis', avatar: null, initials: 'ED' },
        createdAt: '2026-01-22T10:15:00Z'
      }
    ],
    createdAt: '2026-01-22T09:00:00Z',
    updatedAt: '2026-01-22T10:15:00Z'
  },
  {
    id: 'cmt-006',
    entityType: 'contact',
    entityId: 'cnt-789',
    entityName: 'Jennifer Martinez (City Planning)',
    content: 'Met with Jennifer at the planning conference. She\'s very supportive of mixed-use developments. Good contact to maintain for future projects.',
    author: { id: 'user-3', name: 'Emily Davis', avatar: null, initials: 'ED' },
    mentions: [],
    attachments: [],
    isPinned: false,
    isPrivate: false,
    parentId: null,
    replies: [],
    createdAt: '2026-01-21T14:00:00Z',
    updatedAt: '2026-01-21T14:00:00Z'
  }
];

const demoTeamMembers = [
  { id: 'user-1', name: 'Michael Chen', initials: 'MC' },
  { id: 'user-2', name: 'Sarah Johnson', initials: 'SJ' },
  { id: 'user-3', name: 'Emily Davis', initials: 'ED' },
  { id: 'user-4', name: 'David Park', initials: 'DP' },
  { id: 'user-5', name: 'Lisa Thompson', initials: 'LT' }
];

const entityTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'project', label: 'Projects' },
  { value: 'property', label: 'Properties' },
  { value: 'contact', label: 'Contacts' },
  { value: 'entity', label: 'Entities' },
  { value: 'opportunity', label: 'Opportunities' }
];

export default function CommentsNotes() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [showPrivate, setShowPrivate] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [formData, setFormData] = useState({
    entityType: 'project',
    entityId: '',
    entityName: '',
    content: '',
    isPinned: false,
    isPrivate: false
  });
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    fetchComments();
  }, []);

  async function fetchComments() {
    try {
      if (isDemoMode()) {
        setComments(demoComments);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments(demoComments);
    } finally {
      setLoading(false);
    }
  }

  const filteredComments = useMemo(() => {
    return comments.filter(comment => {
      const matchesSearch = !searchQuery ||
        comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.author.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesEntity = entityFilter === 'all' || comment.entityType === entityFilter;
      const matchesPinned = !showPinnedOnly || comment.isPinned;
      const matchesPrivate = showPrivate || !comment.isPrivate;

      return matchesSearch && matchesEntity && matchesPinned && matchesPrivate;
    });
  }, [comments, searchQuery, entityFilter, showPinnedOnly, showPrivate]);

  const stats = useMemo(() => ({
    total: comments.length,
    pinned: comments.filter(c => c.isPinned).length,
    private: comments.filter(c => c.isPrivate).length,
    thisWeek: comments.filter(c => {
      const date = new Date(c.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    }).length
  }), [comments]);

  function toggleExpanded(commentId) {
    setExpandedComments(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 1 ? 'Just now' : `${minutes}m ago`;
      }
      return `${hours}h ago`;
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days}d ago`;
    }
    return date.toLocaleDateString();
  }

  function highlightMentions(content) {
    return content.replace(/@(\w+(?:\.\w+)?)/g, '<span class="text-blue-600 font-medium">@$1</span>');
  }

  function openCreateModal() {
    setFormData({
      entityType: 'project',
      entityId: '',
      entityName: '',
      content: '',
      isPinned: false,
      isPrivate: false
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (isDemoMode()) {
      const newComment = {
        id: `cmt-${Date.now()}`,
        ...formData,
        author: { id: 'user-1', name: 'Michael Chen', avatar: null, initials: 'MC' },
        mentions: [],
        attachments: [],
        parentId: null,
        replies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setComments(prev => [newComment, ...prev]);
      setShowModal(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          entity_type: formData.entityType,
          entity_id: formData.entityId,
          entity_name: formData.entityName,
          content: formData.content,
          is_pinned: formData.isPinned,
          is_private: formData.isPrivate
        });

      if (error) throw error;
      fetchComments();
      setShowModal(false);
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  }

  async function handleReply(commentId) {
    if (!replyContent.trim()) return;

    if (isDemoMode()) {
      const newReply = {
        id: `cmt-${Date.now()}-r`,
        content: replyContent,
        author: { id: 'user-1', name: 'Michael Chen', avatar: null, initials: 'MC' },
        createdAt: new Date().toISOString()
      };
      setComments(prev => prev.map(c =>
        c.id === commentId
          ? { ...c, replies: [...(c.replies || []), newReply] }
          : c
      ));
      setReplyingTo(null);
      setReplyContent('');
      setExpandedComments(prev => new Set([...prev, commentId]));
      return;
    }

    try {
      const { error } = await supabase
        .from('comment_replies')
        .insert({
          comment_id: commentId,
          content: replyContent
        });

      if (error) throw error;
      fetchComments();
      setReplyingTo(null);
      setReplyContent('');
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  }

  async function togglePin(comment) {
    if (isDemoMode()) {
      setComments(prev => prev.map(c =>
        c.id === comment.id ? { ...c, isPinned: !c.isPinned } : c
      ));
      return;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .update({ is_pinned: !comment.isPinned })
        .eq('id', comment.id);

      if (error) throw error;
      fetchComments();
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  }

  async function deleteComment(comment) {
    if (!confirm('Delete this comment?')) return;

    if (isDemoMode()) {
      setComments(prev => prev.filter(c => c.id !== comment.id));
      return;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', comment.id);

      if (error) throw error;
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comments & Notes</h1>
          <p className="text-gray-600 mt-1">Track discussions and notes across all your records</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>+</span>
          <span>Add Comment</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Comments</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Pinned</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pinned}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Private Notes</div>
          <div className="text-2xl font-bold text-purple-600">{stats.private}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">This Week</div>
          <div className="text-2xl font-bold text-green-600">{stats.thisWeek}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search comments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {entityTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={showPinnedOnly}
              onChange={(e) => setShowPinnedOnly(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700">Pinned Only</span>
          </label>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            <div className="text-4xl mb-4">💬</div>
            <p>No comments found</p>
            <button
              onClick={openCreateModal}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Add your first comment
            </button>
          </div>
        ) : (
          filteredComments.map(comment => (
            <div
              key={comment.id}
              className={`bg-white rounded-lg shadow overflow-hidden ${
                comment.isPrivate ? 'border-l-4 border-purple-500' : ''
              }`}
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                      {comment.author.initials}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{comment.author.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span>{formatDate(comment.createdAt)}</span>
                        <span>•</span>
                        <span className="capitalize">{comment.entityType}</span>
                        <span>•</span>
                        <span className="text-blue-600">{comment.entityName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {comment.isPinned && (
                      <span className="text-yellow-500" title="Pinned">📌</span>
                    )}
                    {comment.isPrivate && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                        Private
                      </span>
                    )}
                    <button
                      onClick={() => togglePin(comment)}
                      className="p-1 text-gray-400 hover:text-yellow-500 rounded"
                      title={comment.isPinned ? 'Unpin' : 'Pin'}
                    >
                      📌
                    </button>
                    <button
                      onClick={() => deleteComment(comment)}
                      className="p-1 text-gray-400 hover:text-red-500 rounded"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div
                  className="text-gray-700 mb-3"
                  dangerouslySetInnerHTML={{ __html: highlightMentions(comment.content) }}
                />

                {/* Attachments */}
                {comment.attachments && comment.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {comment.attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded text-sm">
                        <span>📎</span>
                        <span>{file.name}</span>
                        <span className="text-gray-500">({file.size})</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 text-sm">
                  <button
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="text-gray-600 hover:text-blue-600 flex items-center gap-1"
                  >
                    <span>↩️</span>
                    <span>Reply</span>
                  </button>
                  {comment.replies && comment.replies.length > 0 && (
                    <button
                      onClick={() => toggleExpanded(comment.id)}
                      className="text-gray-600 hover:text-blue-600"
                    >
                      {expandedComments.has(comment.id) ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                    </button>
                  )}
                </div>

                {/* Reply Input */}
                {replyingTo === comment.id && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply... (use @ to mention)"
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleReply(comment.id)}
                    />
                    <button
                      onClick={() => handleReply(comment.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Reply
                    </button>
                  </div>
                )}

                {/* Replies */}
                {expandedComments.has(comment.id) && comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 pl-6 border-l-2 border-gray-200 space-y-3">
                    {comment.replies.map(reply => (
                      <div key={reply.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-sm font-medium flex-shrink-0">
                          {reply.author.initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 text-sm">{reply.author.name}</span>
                            <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
                          </div>
                          <p className="text-sm text-gray-700">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Add Comment</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entity Type *
                  </label>
                  <select
                    required
                    value={formData.entityType}
                    onChange={(e) => setFormData(prev => ({ ...prev, entityType: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="project">Project</option>
                    <option value="property">Property</option>
                    <option value="contact">Contact</option>
                    <option value="entity">Entity</option>
                    <option value="opportunity">Opportunity</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Record Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.entityName}
                    onChange={(e) => setFormData(prev => ({ ...prev, entityName: e.target.value }))}
                    placeholder="e.g., Highland Park Development"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comment *
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your comment... Use @name to mention team members"
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {demoTeamMembers.map(member => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        content: prev.content + `@${member.name.toLowerCase().replace(' ', '.')} `
                      }))}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200"
                    >
                      @{member.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPinned: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">📌 Pin this comment</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPrivate}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span className="text-sm text-gray-700">🔒 Private note (only visible to you)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Comment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
