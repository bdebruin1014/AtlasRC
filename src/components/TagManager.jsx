import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';
import {
  Tags,
  Plus,
  Search,
  Edit,
  Trash2,
  Save,
  X,
  Palette,
  Building2,
  Users,
  FileText,
  DollarSign,
  Briefcase,
  CheckCircle2,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Copy,
  Merge,
  AlertCircle
} from 'lucide-react';

// Demo tags data
const demoTags = [
  { id: '1', name: 'High Priority', color: '#ef4444', category: 'general', usage_count: 45, created_at: '2025-06-15T10:00:00Z' },
  { id: '2', name: 'VIP Client', color: '#8b5cf6', category: 'contacts', usage_count: 23, created_at: '2025-07-01T08:00:00Z' },
  { id: '3', name: 'Due Diligence', color: '#3b82f6', category: 'projects', usage_count: 67, created_at: '2025-05-20T14:00:00Z' },
  { id: '4', name: 'Pending Review', color: '#f59e0b', category: 'documents', usage_count: 89, created_at: '2025-08-10T11:00:00Z' },
  { id: '5', name: 'Approved', color: '#10b981', category: 'general', usage_count: 156, created_at: '2025-04-01T09:00:00Z' },
  { id: '6', name: 'Investor', color: '#06b6d4', category: 'contacts', usage_count: 34, created_at: '2025-09-05T16:00:00Z' },
  { id: '7', name: 'Urgent', color: '#dc2626', category: 'tasks', usage_count: 78, created_at: '2025-03-15T12:00:00Z' },
  { id: '8', name: 'Follow Up', color: '#f97316', category: 'contacts', usage_count: 56, created_at: '2025-10-01T10:00:00Z' },
  { id: '9', name: 'Active Deal', color: '#22c55e', category: 'projects', usage_count: 28, created_at: '2025-11-10T08:00:00Z' },
  { id: '10', name: 'Archived', color: '#6b7280', category: 'general', usage_count: 234, created_at: '2025-02-01T14:00:00Z' },
  { id: '11', name: 'Legal Review', color: '#a855f7', category: 'documents', usage_count: 41, created_at: '2025-12-01T11:00:00Z' },
  { id: '12', name: 'Vendor', color: '#14b8a6', category: 'contacts', usage_count: 62, created_at: '2025-08-20T09:00:00Z' }
];

const categories = [
  { id: 'all', name: 'All Tags', icon: Tags },
  { id: 'general', name: 'General', icon: Tags },
  { id: 'contacts', name: 'Contacts', icon: Users },
  { id: 'projects', name: 'Projects', icon: Building2 },
  { id: 'documents', name: 'Documents', icon: FileText },
  { id: 'tasks', name: 'Tasks', icon: CheckCircle2 },
  { id: 'transactions', name: 'Transactions', icon: DollarSign }
];

const colorPresets = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#6b7280', '#374151', '#1f2937'
];

export default function TagManager() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showMergeModal, setShowMergeModal] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    try {
      if (isDemoMode()) {
        setTags(demoTags);
      } else {
        const { data, error } = await supabase
          .from('tags')
          .select('*')
          .order('usage_count', { ascending: false });

        if (error) throw error;
        setTags(data || []);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      setTags(demoTags);
    } finally {
      setLoading(false);
    }
  };

  const filteredTags = useMemo(() => {
    return tags.filter(tag => {
      const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || tag.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [tags, searchTerm, selectedCategory]);

  const getCategoryStats = () => {
    const stats = {};
    tags.forEach(tag => {
      stats[tag.category] = (stats[tag.category] || 0) + 1;
    });
    return stats;
  };

  const categoryStats = getCategoryStats();

  const handleSaveTag = (tagData) => {
    if (editingTag) {
      setTags(prev => prev.map(t =>
        t.id === editingTag.id ? { ...t, ...tagData } : t
      ));
    } else {
      const newTag = {
        ...tagData,
        id: Date.now().toString(),
        usage_count: 0,
        created_at: new Date().toISOString()
      };
      setTags(prev => [newTag, ...prev]);
    }
    setShowCreateModal(false);
    setEditingTag(null);
  };

  const deleteTag = (tagId) => {
    setTags(prev => prev.filter(t => t.id !== tagId));
    setSelectedTags(prev => prev.filter(id => id !== tagId));
  };

  const toggleTagSelection = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const mergeTags = (targetTagId) => {
    const targetTag = tags.find(t => t.id === targetTagId);
    const mergedCount = selectedTags.reduce((sum, id) => {
      const tag = tags.find(t => t.id === id);
      return sum + (tag?.usage_count || 0);
    }, 0);

    setTags(prev => prev
      .filter(t => !selectedTags.includes(t.id) || t.id === targetTagId)
      .map(t => t.id === targetTagId ? { ...t, usage_count: t.usage_count + mergedCount - targetTag.usage_count } : t)
    );

    setSelectedTags([]);
    setShowMergeModal(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const totalUsage = tags.reduce((sum, t) => sum + t.usage_count, 0);

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
          <Tags className="h-7 w-7 text-blue-600" />
          Tag Manager
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Create, organize, and manage tags across all platform entities
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{tags.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Tags</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600">{totalUsage}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Uses</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600">{Object.keys(categoryStats).length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-purple-600">
            {tags.length > 0 ? Math.round(totalUsage / tags.length) : 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Uses/Tag</div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar - Categories */}
        <div className="w-56 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Categories</h3>
            <div className="space-y-1">
              {categories.map(category => {
                const IconComponent = category.icon;
                const count = category.id === 'all' ? tags.length : (categoryStats[category.id] || 0);
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      <span>{category.name}</span>
                    </div>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              {selectedTags.length >= 2 && (
                <button
                  onClick={() => setShowMergeModal(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Merge className="h-4 w-4" />
                  Merge ({selectedTags.length})
                </button>
              )}
              <button
                onClick={() => {
                  setEditingTag(null);
                  setShowCreateModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                New Tag
              </button>
            </div>
          </div>

          {/* Tags Grid */}
          {filteredTags.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Tags className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tags found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm ? 'Try adjusting your search' : 'Create your first tag to get started'}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Create Tag
              </button>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredTags.map(tag => (
                <div
                  key={tag.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg border p-4 transition-all ${
                    selectedTags.includes(tag.id)
                      ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                      : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.id)}
                        onChange={() => toggleTagSelection(tag.id)}
                        className="rounded border-gray-300"
                      />
                      <div
                        className="px-3 py-1 rounded-full text-white text-sm font-medium"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingTag(tag);
                          setShowCreateModal(true);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteTag(tag.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      {categories.find(c => c.id === tag.category)?.icon &&
                        React.createElement(categories.find(c => c.id === tag.category).icon, { className: 'h-3 w-3' })
                      }
                      <span className="capitalize">{tag.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>{tag.usage_count} uses</span>
                      <span>{formatDate(tag.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <TagModal
          tag={editingTag}
          onClose={() => {
            setShowCreateModal(false);
            setEditingTag(null);
          }}
          onSave={handleSaveTag}
        />
      )}

      {/* Merge Modal */}
      {showMergeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Merge Tags</h2>
              <button
                onClick={() => setShowMergeModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Select the tag to keep. All other selected tags will be merged into it.
              </p>

              <div className="space-y-2 mb-4">
                {selectedTags.map(tagId => {
                  const tag = tags.find(t => t.id === tagId);
                  return (
                    <button
                      key={tagId}
                      onClick={() => mergeTags(tagId)}
                      className="w-full flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: tag?.color }}
                        />
                        <span className="font-medium text-gray-900 dark:text-white">{tag?.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{tag?.usage_count} uses</span>
                    </button>
                  );
                })}
              </div>

              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  This action cannot be undone. Items tagged with merged tags will be updated to use the selected tag.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowMergeModal(false)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TagModal({ tag, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: tag?.name || '',
    color: tag?.color || '#3b82f6',
    category: tag?.category || 'general'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {tag ? 'Edit Tag' : 'Create New Tag'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tag Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., High Priority"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {categories.filter(c => c.id !== 'all').map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {colorPresets.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    formData.color === color ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preview
            </label>
            <div
              className="inline-flex px-3 py-1 rounded-full text-white text-sm font-medium"
              style={{ backgroundColor: formData.color }}
            >
              {formData.name || 'Tag Name'}
            </div>
          </div>
        </form>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.name}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {tag ? 'Save Changes' : 'Create Tag'}
          </button>
        </div>
      </div>
    </div>
  );
}
