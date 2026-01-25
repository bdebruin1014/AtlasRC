import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';
import {
  Search,
  Filter,
  Save,
  Bookmark,
  BookmarkCheck,
  X,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Building2,
  User,
  FileText,
  DollarSign,
  Calendar,
  Tag,
  MapPin,
  Briefcase,
  Clock,
  RefreshCw,
  Download,
  Eye,
  Edit,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// Demo saved filters
const demoSavedFilters = [
  {
    id: '1',
    name: 'Active Properties in California',
    description: 'All active properties located in CA',
    category: 'properties',
    filters: {
      status: 'active',
      state: 'CA'
    },
    created_at: '2025-10-15T10:00:00Z',
    last_used: '2026-01-24T09:00:00Z',
    use_count: 45
  },
  {
    id: '2',
    name: 'High Value Contacts',
    description: 'Contacts with potential deal value over $1M',
    category: 'contacts',
    filters: {
      min_deal_value: 1000000,
      status: 'active'
    },
    created_at: '2025-11-01T14:00:00Z',
    last_used: '2026-01-23T16:00:00Z',
    use_count: 32
  },
  {
    id: '3',
    name: 'Pending Documents',
    description: 'Documents awaiting review or signature',
    category: 'documents',
    filters: {
      status: ['pending_review', 'pending_signature']
    },
    created_at: '2025-12-05T08:00:00Z',
    last_used: '2026-01-25T11:00:00Z',
    use_count: 78
  },
  {
    id: '4',
    name: 'Recent Transactions',
    description: 'Transactions from the last 30 days',
    category: 'transactions',
    filters: {
      date_range: 'last_30_days'
    },
    created_at: '2026-01-01T09:00:00Z',
    last_used: '2026-01-25T08:00:00Z',
    use_count: 56
  },
  {
    id: '5',
    name: 'Overdue Tasks',
    description: 'All tasks past their due date',
    category: 'tasks',
    filters: {
      status: 'overdue'
    },
    created_at: '2025-09-20T11:00:00Z',
    last_used: '2026-01-24T14:00:00Z',
    use_count: 123
  }
];

// Demo search results
const demoResults = {
  properties: [
    { id: 'p1', type: 'property', name: 'Sunset Towers', address: '123 Sunset Blvd, Los Angeles, CA', status: 'active', value: 5500000 },
    { id: 'p2', type: 'property', name: 'Harbor View Apartments', address: '456 Harbor Dr, San Diego, CA', status: 'active', value: 8200000 },
    { id: 'p3', type: 'property', name: 'Mountain Ridge Complex', address: '789 Ridge Rd, Denver, CO', status: 'pending', value: 3100000 }
  ],
  contacts: [
    { id: 'c1', type: 'contact', name: 'John Smith', email: 'john@example.com', company: 'ABC Investments', deal_value: 2500000 },
    { id: 'c2', type: 'contact', name: 'Sarah Johnson', email: 'sarah@example.com', company: 'XYZ Holdings', deal_value: 1800000 },
    { id: 'c3', type: 'contact', name: 'Mike Chen', email: 'mike@example.com', company: 'Global Properties', deal_value: 4200000 }
  ],
  documents: [
    { id: 'd1', type: 'document', name: 'Lease Agreement - Unit 101', category: 'Lease', status: 'pending_signature', date: '2026-01-20' },
    { id: 'd2', type: 'document', name: 'Purchase Contract - Harbor View', category: 'Contract', status: 'active', date: '2026-01-15' },
    { id: 'd3', type: 'document', name: 'Insurance Policy Renewal', category: 'Insurance', status: 'pending_review', date: '2026-01-22' }
  ],
  transactions: [
    { id: 't1', type: 'transaction', description: 'Rent Payment - Sunset Towers', amount: 2500, date: '2026-01-01', status: 'completed' },
    { id: 't2', type: 'transaction', description: 'Maintenance Fee', amount: -850, date: '2026-01-05', status: 'completed' },
    { id: 't3', type: 'transaction', description: 'Security Deposit Refund', amount: -1500, date: '2026-01-10', status: 'pending' }
  ],
  tasks: [
    { id: 'tk1', type: 'task', title: 'Review lease renewal', due_date: '2026-01-20', status: 'overdue', priority: 'high' },
    { id: 'tk2', type: 'task', title: 'Schedule property inspection', due_date: '2026-01-28', status: 'pending', priority: 'medium' },
    { id: 'tk3', type: 'task', title: 'Update vendor contracts', due_date: '2026-01-30', status: 'in_progress', priority: 'low' }
  ]
};

const searchCategories = [
  { id: 'all', name: 'All', icon: Search },
  { id: 'properties', name: 'Properties', icon: Building2 },
  { id: 'contacts', name: 'Contacts', icon: User },
  { id: 'documents', name: 'Documents', icon: FileText },
  { id: 'transactions', name: 'Transactions', icon: DollarSign },
  { id: 'tasks', name: 'Tasks', icon: CheckCircle2 }
];

const filterOptions = {
  properties: [
    { id: 'status', name: 'Status', type: 'select', options: ['active', 'pending', 'inactive', 'sold'] },
    { id: 'state', name: 'State', type: 'text' },
    { id: 'min_value', name: 'Min Value', type: 'number' },
    { id: 'max_value', name: 'Max Value', type: 'number' },
    { id: 'property_type', name: 'Property Type', type: 'select', options: ['residential', 'commercial', 'industrial', 'mixed'] }
  ],
  contacts: [
    { id: 'status', name: 'Status', type: 'select', options: ['active', 'inactive', 'lead', 'customer'] },
    { id: 'min_deal_value', name: 'Min Deal Value', type: 'number' },
    { id: 'company', name: 'Company', type: 'text' },
    { id: 'contact_type', name: 'Contact Type', type: 'select', options: ['investor', 'vendor', 'tenant', 'buyer', 'seller'] }
  ],
  documents: [
    { id: 'status', name: 'Status', type: 'multiselect', options: ['active', 'pending_review', 'pending_signature', 'expired', 'archived'] },
    { id: 'category', name: 'Category', type: 'select', options: ['Lease', 'Contract', 'Insurance', 'Legal', 'Financial'] },
    { id: 'date_from', name: 'Date From', type: 'date' },
    { id: 'date_to', name: 'Date To', type: 'date' }
  ],
  transactions: [
    { id: 'date_range', name: 'Date Range', type: 'select', options: ['last_7_days', 'last_30_days', 'last_90_days', 'this_year', 'custom'] },
    { id: 'status', name: 'Status', type: 'select', options: ['completed', 'pending', 'failed'] },
    { id: 'min_amount', name: 'Min Amount', type: 'number' },
    { id: 'max_amount', name: 'Max Amount', type: 'number' },
    { id: 'type', name: 'Type', type: 'select', options: ['income', 'expense', 'transfer'] }
  ],
  tasks: [
    { id: 'status', name: 'Status', type: 'select', options: ['pending', 'in_progress', 'completed', 'overdue'] },
    { id: 'priority', name: 'Priority', type: 'select', options: ['high', 'medium', 'low'] },
    { id: 'due_date_from', name: 'Due From', type: 'date' },
    { id: 'due_date_to', name: 'Due To', type: 'date' },
    { id: 'assigned_to', name: 'Assigned To', type: 'text' }
  ]
};

export default function AdvancedSearch() {
  const [savedFilters, setSavedFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeFilters, setActiveFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [filterDescription, setFilterDescription] = useState('');

  useEffect(() => {
    fetchSavedFilters();
  }, []);

  const fetchSavedFilters = async () => {
    setLoading(true);
    try {
      if (isDemoMode()) {
        setSavedFilters(demoSavedFilters);
      } else {
        const { data, error } = await supabase
          .from('saved_filters')
          .select('*')
          .order('last_used', { ascending: false });

        if (error) throw error;
        setSavedFilters(data || []);
      }
    } catch (error) {
      console.error('Error fetching saved filters:', error);
      setSavedFilters(demoSavedFilters);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    setSearching(true);
    try {
      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 500));

      if (isDemoMode()) {
        // Filter demo results based on category and search query
        let results = {};

        if (selectedCategory === 'all') {
          Object.keys(demoResults).forEach(cat => {
            results[cat] = demoResults[cat].filter(item =>
              JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase())
            );
          });
        } else {
          results[selectedCategory] = demoResults[selectedCategory]?.filter(item =>
            JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase())
          ) || [];
        }

        setSearchResults(results);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch();
  };

  const applyFilter = (filter) => {
    setSelectedCategory(filter.category);
    setActiveFilters(filter.filters);
    setShowFilters(true);

    // Update last used
    if (isDemoMode()) {
      setSavedFilters(prev => prev.map(f =>
        f.id === filter.id ? { ...f, last_used: new Date().toISOString(), use_count: f.use_count + 1 } : f
      ));
    }

    performSearch();
  };

  const saveCurrentFilter = () => {
    if (!filterName) return;

    const newFilter = {
      id: Date.now().toString(),
      name: filterName,
      description: filterDescription,
      category: selectedCategory === 'all' ? 'properties' : selectedCategory,
      filters: activeFilters,
      created_at: new Date().toISOString(),
      last_used: new Date().toISOString(),
      use_count: 0
    };

    if (isDemoMode()) {
      setSavedFilters(prev => [newFilter, ...prev]);
    }

    setShowSaveModal(false);
    setFilterName('');
    setFilterDescription('');
  };

  const deleteFilter = (filterId) => {
    if (isDemoMode()) {
      setSavedFilters(prev => prev.filter(f => f.id !== filterId));
    }
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchResults(null);
  };

  const updateFilter = (key, value) => {
    if (value === '' || value === null) {
      const newFilters = { ...activeFilters };
      delete newFilters[key];
      setActiveFilters(newFilters);
    } else {
      setActiveFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'pending':
      case 'pending_review':
      case 'pending_signature':
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'overdue':
      case 'expired':
      case 'failed':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'inactive':
      case 'archived':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
      default:
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
    }
  };

  const currentFilterOptions = selectedCategory !== 'all' ? filterOptions[selectedCategory] || [] : [];
  const activeFilterCount = Object.keys(activeFilters).length;

  const totalResults = searchResults
    ? Object.values(searchResults).reduce((sum, arr) => sum + arr.length, 0)
    : 0;

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
          <Search className="h-7 w-7 text-blue-600" />
          Advanced Search
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Search across all data with advanced filters and save your frequent searches
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left Sidebar - Saved Filters */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Bookmark className="h-4 w-4" />
                Saved Filters
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">{savedFilters.length}</span>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-auto">
              {savedFilters.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No saved filters yet
                </p>
              ) : (
                savedFilters.map(filter => (
                  <div
                    key={filter.id}
                    className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <button
                        onClick={() => applyFilter(filter)}
                        className="flex-1 text-left"
                      >
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {filter.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {filter.description}
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                          <span className="capitalize">{filter.category}</span>
                          <span>•</span>
                          <span>{filter.use_count} uses</span>
                        </div>
                      </button>
                      <button
                        onClick={() => deleteFilter(filter.id)}
                        className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search properties, contacts, documents, transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
              <button
                type="submit"
                disabled={searching}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {searching ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
                Search
              </button>
            </div>
          </form>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {searchCategories.map(category => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {category.name}
                </button>
              );
            })}
          </div>

          {/* Filter Panel */}
          {selectedCategory !== 'all' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-500" />
                  <span className="font-medium text-gray-900 dark:text-white">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full text-xs">
                      {activeFilterCount} active
                    </span>
                  )}
                </div>
                {showFilters ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>

              {showFilters && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {currentFilterOptions.map(option => (
                      <div key={option.id}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {option.name}
                        </label>
                        {option.type === 'select' ? (
                          <select
                            value={activeFilters[option.id] || ''}
                            onChange={(e) => updateFilter(option.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                          >
                            <option value="">Any</option>
                            {option.options.map(opt => (
                              <option key={opt} value={opt}>
                                {opt.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </option>
                            ))}
                          </select>
                        ) : option.type === 'multiselect' ? (
                          <select
                            multiple
                            value={activeFilters[option.id] || []}
                            onChange={(e) => updateFilter(option.id, Array.from(e.target.selectedOptions, o => o.value))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm h-24"
                          >
                            {option.options.map(opt => (
                              <option key={opt} value={opt}>
                                {opt.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </option>
                            ))}
                          </select>
                        ) : option.type === 'date' ? (
                          <input
                            type="date"
                            value={activeFilters[option.id] || ''}
                            onChange={(e) => updateFilter(option.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                          />
                        ) : option.type === 'number' ? (
                          <input
                            type="number"
                            value={activeFilters[option.id] || ''}
                            onChange={(e) => updateFilter(option.id, e.target.value)}
                            placeholder="0"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                          />
                        ) : (
                          <input
                            type="text"
                            value={activeFilters[option.id] || ''}
                            onChange={(e) => updateFilter(option.id, e.target.value)}
                            placeholder={`Enter ${option.name.toLowerCase()}`}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={performSearch}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <Search className="h-4 w-4" />
                      Apply Filters
                    </button>
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                    >
                      <X className="h-4 w-4" />
                      Clear
                    </button>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={() => setShowSaveModal(true)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm ml-auto"
                      >
                        <Save className="h-4 w-4" />
                        Save Filter
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search Results */}
          {searchResults && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Search Results ({totalResults})
                  </h3>
                  {totalResults > 0 && (
                    <button className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                      <Download className="h-4 w-4" />
                      Export
                    </button>
                  )}
                </div>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {totalResults === 0 ? (
                  <div className="p-8 text-center">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No results found</h3>
                    <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  Object.entries(searchResults).map(([category, items]) => {
                    if (items.length === 0) return null;
                    const CategoryIcon = searchCategories.find(c => c.id === category)?.icon || Search;

                    return (
                      <div key={category}>
                        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 flex items-center gap-2">
                          <CategoryIcon className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{category}</span>
                          <span className="text-xs text-gray-500">({items.length})</span>
                        </div>
                        {items.map(item => (
                          <div
                            key={item.id}
                            className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors flex items-center justify-between group"
                          >
                            <div className="flex-1">
                              {item.type === 'property' && (
                                <>
                                  <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                    <MapPin className="h-3 w-3" />
                                    {item.address}
                                  </div>
                                </>
                              )}
                              {item.type === 'contact' && (
                                <>
                                  <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {item.company} • {item.email}
                                  </div>
                                </>
                              )}
                              {item.type === 'document' && (
                                <>
                                  <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {item.category} • {formatDate(item.date)}
                                  </div>
                                </>
                              )}
                              {item.type === 'transaction' && (
                                <>
                                  <div className="font-medium text-gray-900 dark:text-white">{item.description}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {formatDate(item.date)}
                                  </div>
                                </>
                              )}
                              {item.type === 'task' && (
                                <>
                                  <div className="font-medium text-gray-900 dark:text-white">{item.title}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Due: {formatDate(item.due_date)} • Priority: {item.priority}
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              {item.status && (
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                                  {item.status.replace(/_/g, ' ')}
                                </span>
                              )}
                              {item.value && (
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatCurrency(item.value)}
                                </span>
                              )}
                              {item.deal_value && (
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatCurrency(item.deal_value)}
                                </span>
                              )}
                              {item.amount && (
                                <span className={`text-sm font-medium ${item.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatCurrency(Math.abs(item.amount))}
                                </span>
                              )}
                              <button className="p-2 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Eye className="h-4 w-4" />
                              </button>
                              <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Initial State */}
          {!searchResults && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
              <Search className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Start your search</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Enter a search term above or select a saved filter to find properties, contacts, documents, and more.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Save Filter Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Save Filter</h2>
              <button
                onClick={() => setShowSaveModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filter Name *
                </label>
                <input
                  type="text"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder="e.g., Active Properties in CA"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={filterDescription}
                  onChange={(e) => setFilterDescription(e.target.value)}
                  placeholder="Brief description of this filter"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Active Filters:</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(activeFilters).map(([key, value]) => (
                    <span
                      key={key}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs"
                    >
                      {key}: {Array.isArray(value) ? value.join(', ') : value}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2 justify-end">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={saveCurrentFilter}
                disabled={!filterName}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <BookmarkCheck className="h-4 w-4" />
                Save Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
