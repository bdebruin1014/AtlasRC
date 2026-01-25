import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';
import {
  Layout,
  Save,
  Trash2,
  Edit2,
  Star,
  StarOff,
  Eye,
  Filter,
  Grid,
  List,
  Table,
  BarChart2,
  Map,
  Plus,
  Search,
  Copy,
  Share2,
  Lock,
  Unlock,
  Clock,
  User,
  Folder,
  FolderPlus,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Check,
  X
} from 'lucide-react';

// Demo saved views data
const demoViews = [
  {
    id: 1,
    name: 'Active Projects Overview',
    description: 'All active projects with key metrics',
    module: 'projects',
    viewType: 'grid',
    filters: { status: 'active', sortBy: 'updated_at' },
    columns: ['name', 'status', 'budget', 'progress', 'deadline'],
    isFavorite: true,
    isDefault: true,
    isPublic: false,
    folder: 'Project Views',
    createdBy: 'John Smith',
    createdAt: '2024-01-15T10:00:00Z',
    lastUsed: '2024-01-20T14:30:00Z',
    usageCount: 45
  },
  {
    id: 2,
    name: 'High Value Properties',
    description: 'Properties valued over $1M',
    module: 'properties',
    viewType: 'table',
    filters: { minValue: 1000000, sortBy: 'value', order: 'desc' },
    columns: ['address', 'type', 'value', 'status', 'owner'],
    isFavorite: true,
    isDefault: false,
    isPublic: true,
    folder: 'Property Views',
    createdBy: 'Sarah Johnson',
    createdAt: '2024-01-10T09:00:00Z',
    lastUsed: '2024-01-19T16:45:00Z',
    usageCount: 32
  },
  {
    id: 3,
    name: 'Pipeline by Stage',
    description: 'Deals grouped by pipeline stage',
    module: 'pipeline',
    viewType: 'kanban',
    filters: { groupBy: 'stage' },
    columns: ['deal', 'value', 'probability', 'owner'],
    isFavorite: false,
    isDefault: false,
    isPublic: true,
    folder: 'Sales Views',
    createdBy: 'Mike Chen',
    createdAt: '2024-01-05T11:00:00Z',
    lastUsed: '2024-01-18T10:15:00Z',
    usageCount: 28
  },
  {
    id: 4,
    name: 'Team Performance Dashboard',
    description: 'Team workload and performance metrics',
    module: 'team',
    viewType: 'dashboard',
    filters: { timeRange: '30d', department: 'all' },
    columns: ['member', 'tasks', 'completed', 'hours', 'efficiency'],
    isFavorite: true,
    isDefault: false,
    isPublic: false,
    folder: 'Team Views',
    createdBy: 'John Smith',
    createdAt: '2024-01-12T14:00:00Z',
    lastUsed: '2024-01-20T09:00:00Z',
    usageCount: 56
  },
  {
    id: 5,
    name: 'Expiring Contracts',
    description: 'Contracts expiring in next 90 days',
    module: 'contracts',
    viewType: 'list',
    filters: { expiringDays: 90, sortBy: 'expiration_date' },
    columns: ['name', 'vendor', 'expiration', 'value', 'status'],
    isFavorite: false,
    isDefault: false,
    isPublic: true,
    folder: 'Contract Views',
    createdBy: 'Lisa Wang',
    createdAt: '2024-01-08T08:30:00Z',
    lastUsed: '2024-01-17T11:20:00Z',
    usageCount: 19
  },
  {
    id: 6,
    name: 'Budget Variance Report',
    description: 'Projects with budget overruns',
    module: 'budget',
    viewType: 'chart',
    filters: { varianceThreshold: 10, showOverBudget: true },
    columns: ['project', 'budget', 'spent', 'variance', 'forecast'],
    isFavorite: false,
    isDefault: false,
    isPublic: false,
    folder: 'Financial Views',
    createdBy: 'Sarah Johnson',
    createdAt: '2024-01-14T13:00:00Z',
    lastUsed: '2024-01-19T15:30:00Z',
    usageCount: 24
  },
  {
    id: 7,
    name: 'Property Map View',
    description: 'Geographic view of all properties',
    module: 'properties',
    viewType: 'map',
    filters: { showAll: true, clusterMarkers: true },
    columns: ['address', 'type', 'status'],
    isFavorite: true,
    isDefault: false,
    isPublic: true,
    folder: 'Property Views',
    createdBy: 'Mike Chen',
    createdAt: '2024-01-11T10:30:00Z',
    lastUsed: '2024-01-20T12:00:00Z',
    usageCount: 38
  },
  {
    id: 8,
    name: 'My Tasks Today',
    description: 'Personal tasks due today',
    module: 'tasks',
    viewType: 'list',
    filters: { assignee: 'me', dueDate: 'today' },
    columns: ['task', 'project', 'priority', 'due', 'status'],
    isFavorite: true,
    isDefault: true,
    isPublic: false,
    folder: null,
    createdBy: 'John Smith',
    createdAt: '2024-01-16T07:00:00Z',
    lastUsed: '2024-01-20T08:00:00Z',
    usageCount: 120
  }
];

const demoFolders = [
  { id: 1, name: 'Project Views', color: '#3B82F6', viewCount: 3 },
  { id: 2, name: 'Property Views', color: '#10B981', viewCount: 4 },
  { id: 3, name: 'Sales Views', color: '#8B5CF6', viewCount: 2 },
  { id: 4, name: 'Team Views', color: '#F59E0B', viewCount: 2 },
  { id: 5, name: 'Contract Views', color: '#EF4444', viewCount: 1 },
  { id: 6, name: 'Financial Views', color: '#06B6D4', viewCount: 2 }
];

const moduleOptions = [
  { value: 'projects', label: 'Projects' },
  { value: 'properties', label: 'Properties' },
  { value: 'pipeline', label: 'Pipeline' },
  { value: 'team', label: 'Team' },
  { value: 'contracts', label: 'Contracts' },
  { value: 'budget', label: 'Budget' },
  { value: 'tasks', label: 'Tasks' },
  { value: 'documents', label: 'Documents' }
];

const viewTypeOptions = [
  { value: 'table', label: 'Table', icon: Table },
  { value: 'grid', label: 'Grid', icon: Grid },
  { value: 'list', label: 'List', icon: List },
  { value: 'kanban', label: 'Kanban', icon: Layout },
  { value: 'chart', label: 'Chart', icon: BarChart2 },
  { value: 'map', label: 'Map', icon: Map },
  { value: 'dashboard', label: 'Dashboard', icon: Layout }
];

export default function SavedViewsManager() {
  const [views, setViews] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [viewTypeFilter, setViewTypeFilter] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState(new Set(['Project Views', 'Property Views']));
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingView, setEditingView] = useState(null);
  const [selectedView, setSelectedView] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    fetchViews();
    fetchFolders();
  }, []);

  const fetchViews = async () => {
    if (isDemoMode()) {
      setViews(demoViews);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_views')
        .select('*')
        .order('last_used', { ascending: false });

      if (error) throw error;
      setViews(data || []);
    } catch (error) {
      console.error('Error fetching views:', error);
      setViews(demoViews);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    if (isDemoMode()) {
      setFolders(demoFolders);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('view_folders')
        .select('*')
        .order('name');

      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
      setFolders(demoFolders);
    }
  };

  const toggleFavorite = async (viewId) => {
    const view = views.find(v => v.id === viewId);
    if (!view) return;

    setViews(views.map(v =>
      v.id === viewId ? { ...v, isFavorite: !v.isFavorite } : v
    ));

    if (!isDemoMode()) {
      try {
        await supabase
          .from('saved_views')
          .update({ is_favorite: !view.isFavorite })
          .eq('id', viewId);
      } catch (error) {
        console.error('Error updating favorite:', error);
      }
    }
  };

  const togglePublic = async (viewId) => {
    const view = views.find(v => v.id === viewId);
    if (!view) return;

    setViews(views.map(v =>
      v.id === viewId ? { ...v, isPublic: !v.isPublic } : v
    ));

    if (!isDemoMode()) {
      try {
        await supabase
          .from('saved_views')
          .update({ is_public: !view.isPublic })
          .eq('id', viewId);
      } catch (error) {
        console.error('Error updating visibility:', error);
      }
    }
  };

  const setAsDefault = async (viewId, module) => {
    setViews(views.map(v => ({
      ...v,
      isDefault: v.id === viewId ? true : (v.module === module ? false : v.isDefault)
    })));

    if (!isDemoMode()) {
      try {
        await supabase
          .from('saved_views')
          .update({ is_default: false })
          .eq('module', module);

        await supabase
          .from('saved_views')
          .update({ is_default: true })
          .eq('id', viewId);
      } catch (error) {
        console.error('Error setting default:', error);
      }
    }
  };

  const deleteView = async (viewId) => {
    if (!confirm('Are you sure you want to delete this view?')) return;

    setViews(views.filter(v => v.id !== viewId));

    if (!isDemoMode()) {
      try {
        await supabase
          .from('saved_views')
          .delete()
          .eq('id', viewId);
      } catch (error) {
        console.error('Error deleting view:', error);
      }
    }
  };

  const duplicateView = (view) => {
    const newView = {
      ...view,
      id: Date.now(),
      name: `${view.name} (Copy)`,
      isFavorite: false,
      isDefault: false,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      usageCount: 0
    };
    setViews([newView, ...views]);
  };

  const toggleFolder = (folderName) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderName)) {
      newExpanded.delete(folderName);
    } else {
      newExpanded.add(folderName);
    }
    setExpandedFolders(newExpanded);
  };

  const filteredViews = useMemo(() => {
    return views.filter(view => {
      if (searchTerm && !view.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !view.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (moduleFilter !== 'all' && view.module !== moduleFilter) return false;
      if (viewTypeFilter !== 'all' && view.viewType !== viewTypeFilter) return false;
      if (showFavoritesOnly && !view.isFavorite) return false;
      return true;
    });
  }, [views, searchTerm, moduleFilter, viewTypeFilter, showFavoritesOnly]);

  const groupedViews = useMemo(() => {
    const grouped = { unfiled: [] };
    folders.forEach(f => grouped[f.name] = []);

    filteredViews.forEach(view => {
      if (view.folder && grouped[view.folder]) {
        grouped[view.folder].push(view);
      } else {
        grouped.unfiled.push(view);
      }
    });

    return grouped;
  }, [filteredViews, folders]);

  const getViewTypeIcon = (type) => {
    const option = viewTypeOptions.find(o => o.value === type);
    return option ? option.icon : Layout;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatRelativeTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateStr);
  };

  const ViewCard = ({ view }) => {
    const Icon = getViewTypeIcon(view.viewType);

    return (
      <div
        className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer ${
          selectedView?.id === view.id ? 'ring-2 ring-blue-500' : ''
        }`}
        onClick={() => setSelectedView(view)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              view.viewType === 'table' ? 'bg-blue-100 text-blue-600' :
              view.viewType === 'grid' ? 'bg-green-100 text-green-600' :
              view.viewType === 'list' ? 'bg-purple-100 text-purple-600' :
              view.viewType === 'kanban' ? 'bg-orange-100 text-orange-600' :
              view.viewType === 'chart' ? 'bg-cyan-100 text-cyan-600' :
              view.viewType === 'map' ? 'bg-red-100 text-red-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">{view.name}</h3>
                {view.isDefault && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{view.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); toggleFavorite(view.id); }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {view.isFavorite ? (
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              ) : (
                <StarOff className="w-4 h-4 text-gray-400" />
              )}
            </button>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === view.id ? null : view.id);
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
              {activeDropdown === view.id && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border z-10">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingView(view); setActiveDropdown(null); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" /> Edit View
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); duplicateView(view); setActiveDropdown(null); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> Duplicate
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); togglePublic(view.id); setActiveDropdown(null); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    {view.isPublic ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    {view.isPublic ? 'Make Private' : 'Make Public'}
                  </button>
                  {!view.isDefault && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setAsDefault(view.id, view.module); setActiveDropdown(null); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Set as Default
                    </button>
                  )}
                  <hr className="my-1" />
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteView(view.id); setActiveDropdown(null); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {moduleOptions.find(m => m.value === view.module)?.label || view.module}
          </span>
          {view.isPublic && (
            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded flex items-center gap-1">
              <Share2 className="w-3 h-3" /> Shared
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {view.createdBy}
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {view.usageCount}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formatRelativeTime(view.lastUsed)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Views</h1>
          <p className="text-gray-600">Manage and organize your custom views</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFolderModal(true)}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <FolderPlus className="w-4 h-4" />
            New Folder
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create View
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-gray-900">{views.length}</div>
          <div className="text-sm text-gray-500">Total Views</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {views.filter(v => v.isFavorite).length}
          </div>
          <div className="text-sm text-gray-500">Favorites</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-green-600">
            {views.filter(v => v.isPublic).length}
          </div>
          <div className="text-sm text-gray-500">Shared Views</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-blue-600">{folders.length}</div>
          <div className="text-sm text-gray-500">Folders</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search views..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Modules</option>
            {moduleOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={viewTypeFilter}
            onChange={(e) => setViewTypeFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All View Types</option>
            {viewTypeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
              showFavoritesOnly ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : 'hover:bg-gray-50'
            }`}
          >
            <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-yellow-500 text-yellow-500' : ''}`} />
            Favorites
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Folders Sidebar */}
        <div className="col-span-1">
          <div className="bg-white rounded-lg border">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-900">Folders</h2>
            </div>
            <div className="divide-y">
              {folders.map(folder => (
                <div key={folder.id}>
                  <button
                    onClick={() => toggleFolder(folder.name)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      {expandedFolders.has(folder.name) ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                      <Folder
                        className="w-5 h-5"
                        style={{ color: folder.color }}
                      />
                      <span className="font-medium text-gray-700">{folder.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {groupedViews[folder.name]?.length || 0}
                    </span>
                  </button>
                  {expandedFolders.has(folder.name) && groupedViews[folder.name]?.length > 0 && (
                    <div className="pl-12 pr-4 pb-2 space-y-1">
                      {groupedViews[folder.name].map(view => (
                        <button
                          key={view.id}
                          onClick={() => setSelectedView(view)}
                          className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 flex items-center gap-2 ${
                            selectedView?.id === view.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
                          }`}
                        >
                          {React.createElement(getViewTypeIcon(view.viewType), { className: 'w-4 h-4' })}
                          <span className="truncate">{view.name}</span>
                          {view.isFavorite && (
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 ml-auto flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {groupedViews.unfiled.length > 0 && (
                <div>
                  <button
                    onClick={() => toggleFolder('unfiled')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      {expandedFolders.has('unfiled') ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                      <Folder className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-500">Unfiled</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {groupedViews.unfiled.length}
                    </span>
                  </button>
                  {expandedFolders.has('unfiled') && (
                    <div className="pl-12 pr-4 pb-2 space-y-1">
                      {groupedViews.unfiled.map(view => (
                        <button
                          key={view.id}
                          onClick={() => setSelectedView(view)}
                          className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 flex items-center gap-2 ${
                            selectedView?.id === view.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
                          }`}
                        >
                          {React.createElement(getViewTypeIcon(view.viewType), { className: 'w-4 h-4' })}
                          <span className="truncate">{view.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Views Grid */}
        <div className="col-span-2">
          {filteredViews.length === 0 ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <Layout className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No views found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || moduleFilter !== 'all' || viewTypeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first saved view to get started'}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create View
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredViews.map(view => (
                <ViewCard key={view.id} view={view} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* View Detail Panel */}
      {selectedView && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl border-l z-50 overflow-auto">
          <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
            <h2 className="font-semibold text-gray-900">View Details</h2>
            <button
              onClick={() => setSelectedView(null)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="p-4 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedView.name}</h3>
              <p className="text-gray-600">{selectedView.description}</p>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                Open View
              </button>
              <button
                onClick={() => setEditingView(selectedView)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-500">Module</span>
                <span className="text-sm font-medium">
                  {moduleOptions.find(m => m.value === selectedView.module)?.label}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-500">View Type</span>
                <span className="text-sm font-medium capitalize">{selectedView.viewType}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-500">Visibility</span>
                <span className={`text-sm font-medium ${selectedView.isPublic ? 'text-green-600' : 'text-gray-600'}`}>
                  {selectedView.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-500">Created By</span>
                <span className="text-sm font-medium">{selectedView.createdBy}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-500">Created</span>
                <span className="text-sm font-medium">{formatDate(selectedView.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-500">Last Used</span>
                <span className="text-sm font-medium">{formatRelativeTime(selectedView.lastUsed)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-500">Usage Count</span>
                <span className="text-sm font-medium">{selectedView.usageCount} times</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Filters</h4>
              <div className="bg-gray-50 rounded-lg p-3">
                <pre className="text-xs text-gray-600 overflow-auto">
                  {JSON.stringify(selectedView.filters, null, 2)}
                </pre>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Columns</h4>
              <div className="flex flex-wrap gap-1">
                {selectedView.columns?.map((col, idx) => (
                  <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">
                    {col}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </div>
  );
}
