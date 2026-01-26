import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';
import {
  Briefcase,
  Star,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  User,
  Phone,
  Mail,
  Building,
  Award,
  Calendar,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Plus,
  Edit,
  X
} from 'lucide-react';

// Demo vendor data
const DEMO_VENDORS = [
  {
    id: 'v-1',
    name: 'ABC Construction LLC',
    trade: 'General Contractor',
    contact_name: 'Mike Johnson',
    phone: '(555) 123-4567',
    email: 'mike@abcconstruction.com',
    rating: 4.5,
    total_projects: 8,
    active_projects: 2,
    total_contract_value: 2850000,
    paid_amount: 2200000,
    on_time_completion: 87.5,
    budget_adherence: 94.2,
    quality_score: 4.3,
    communication_score: 4.7,
    safety_score: 4.8,
    last_review_date: '2026-01-15',
    reviews: [
      { id: 'r-1', rating: 5, comment: 'Excellent work on foundation', reviewer: 'John Smith', date: '2026-01-15' },
      { id: 'r-2', rating: 4, comment: 'Minor delays but quality was great', reviewer: 'Sarah Lee', date: '2025-12-20' }
    ],
    status: 'preferred'
  },
  {
    id: 'v-2',
    name: 'Elite Electric Inc',
    trade: 'Electrical',
    contact_name: 'Tom Wilson',
    phone: '(555) 234-5678',
    email: 'tom@eliteelectric.com',
    rating: 4.8,
    total_projects: 12,
    active_projects: 3,
    total_contract_value: 890000,
    paid_amount: 720000,
    on_time_completion: 95.0,
    budget_adherence: 98.5,
    quality_score: 4.9,
    communication_score: 4.6,
    safety_score: 5.0,
    last_review_date: '2026-01-20',
    reviews: [
      { id: 'r-3', rating: 5, comment: 'Best electrical contractor we have worked with', reviewer: 'John Smith', date: '2026-01-20' }
    ],
    status: 'preferred'
  },
  {
    id: 'v-3',
    name: 'Premium Plumbing Co',
    trade: 'Plumbing',
    contact_name: 'Dave Martin',
    phone: '(555) 345-6789',
    email: 'dave@premiumplumbing.com',
    rating: 3.8,
    total_projects: 6,
    active_projects: 1,
    total_contract_value: 420000,
    paid_amount: 380000,
    on_time_completion: 75.0,
    budget_adherence: 85.0,
    quality_score: 4.0,
    communication_score: 3.5,
    safety_score: 4.2,
    last_review_date: '2025-12-10',
    reviews: [
      { id: 'r-4', rating: 4, comment: 'Good quality but communication needs improvement', reviewer: 'Mike Williams', date: '2025-12-10' }
    ],
    status: 'approved'
  },
  {
    id: 'v-4',
    name: 'Superior HVAC Solutions',
    trade: 'HVAC',
    contact_name: 'Lisa Brown',
    phone: '(555) 456-7890',
    email: 'lisa@superiorhvac.com',
    rating: 4.2,
    total_projects: 9,
    active_projects: 2,
    total_contract_value: 680000,
    paid_amount: 550000,
    on_time_completion: 88.9,
    budget_adherence: 92.0,
    quality_score: 4.4,
    communication_score: 4.0,
    safety_score: 4.5,
    last_review_date: '2026-01-08',
    reviews: [],
    status: 'approved'
  },
  {
    id: 'v-5',
    name: 'Metro Masonry',
    trade: 'Masonry',
    contact_name: 'Carlos Garcia',
    phone: '(555) 567-8901',
    email: 'carlos@metromasonry.com',
    rating: 2.9,
    total_projects: 3,
    active_projects: 0,
    total_contract_value: 180000,
    paid_amount: 180000,
    on_time_completion: 66.7,
    budget_adherence: 78.0,
    quality_score: 3.2,
    communication_score: 2.8,
    safety_score: 3.5,
    last_review_date: '2025-11-15',
    reviews: [
      { id: 'r-5', rating: 2, comment: 'Significant delays and cost overruns', reviewer: 'John Smith', date: '2025-11-15' }
    ],
    status: 'probation'
  }
];

const TRADES = [
  'All Trades',
  'General Contractor',
  'Electrical',
  'Plumbing',
  'HVAC',
  'Masonry',
  'Roofing',
  'Drywall',
  'Painting',
  'Flooring',
  'Landscaping'
];

const STATUS_LABELS = {
  preferred: { label: 'Preferred', color: 'bg-green-100 text-green-800' },
  approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800' },
  probation: { label: 'On Probation', color: 'bg-yellow-100 text-yellow-800' },
  suspended: { label: 'Suspended', color: 'bg-red-100 text-red-800' }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const StarRating = ({ rating, size = 'sm' }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  const sizeClass = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className={`${sizeClass} text-yellow-400 fill-current`} />
      ))}
      {hasHalfStar && (
        <Star className={`${sizeClass} text-yellow-400`} style={{ clipPath: 'inset(0 50% 0 0)' }} />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className={`${sizeClass} text-gray-300`} />
      ))}
      <span className="ml-1 text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
    </div>
  );
};

const MetricBar = ({ value, max = 100, color = 'blue', label }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{value.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const VendorPerformanceTracker = ({
  projectId = null,
  showFilters = true,
  showAddNew = true
}) => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrade, setSelectedTrade] = useState('All Trades');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    loadVendors();
  }, [projectId]);

  const loadVendors = async () => {
    setLoading(true);
    try {
      if (isDemoMode()) {
        setVendors(DEMO_VENDORS);
      } else {
        let query = supabase
          .from('vendor_performance')
          .select('*')
          .order('rating', { ascending: false });

        if (projectId) {
          query = query.eq('project_id', projectId);
        }

        const { data, error } = await query;
        if (error) throw error;
        setVendors(data || []);
      }
    } catch (error) {
      console.error('Error loading vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = useMemo(() => {
    let result = vendors.filter(vendor => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          vendor.name?.toLowerCase().includes(search) ||
          vendor.trade?.toLowerCase().includes(search) ||
          vendor.contact_name?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Trade filter
      if (selectedTrade !== 'All Trades' && vendor.trade !== selectedTrade) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && vendor.status !== selectedStatus) {
        return false;
      }

      return true;
    });

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    return result;
  }, [vendors, searchTerm, selectedTrade, selectedStatus, sortBy, sortOrder]);

  const summaryStats = useMemo(() => {
    const total = vendors.length;
    const preferred = vendors.filter(v => v.status === 'preferred').length;
    const avgRating = vendors.reduce((sum, v) => sum + v.rating, 0) / (total || 1);
    const totalValue = vendors.reduce((sum, v) => sum + v.total_contract_value, 0);

    return { total, preferred, avgRating, totalValue };
  }, [vendors]);

  const handleAddReview = async () => {
    if (!selectedVendor || !newReview.comment) return;

    // In demo mode, just update local state
    if (isDemoMode()) {
      const updatedVendors = vendors.map(v => {
        if (v.id === selectedVendor.id) {
          const newReviewObj = {
            id: `r-${Date.now()}`,
            rating: newReview.rating,
            comment: newReview.comment,
            reviewer: 'Current User',
            date: new Date().toISOString().split('T')[0]
          };
          const updatedReviews = [...(v.reviews || []), newReviewObj];
          const avgRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
          return {
            ...v,
            reviews: updatedReviews,
            rating: Math.round(avgRating * 10) / 10,
            last_review_date: newReviewObj.date
          };
        }
        return v;
      });
      setVendors(updatedVendors);
    }

    setShowReviewModal(false);
    setNewReview({ rating: 5, comment: '' });
    setSelectedVendor(null);
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
              <Briefcase className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Vendor Performance</h2>
              <p className="text-sm text-gray-500">
                Track and rate vendor performance across projects
              </p>
            </div>
          </div>
          {showAddNew && (
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <Plus className="w-4 h-4" />
              Add Vendor
            </button>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Total Vendors</div>
            <div className="text-2xl font-bold text-gray-900">{summaryStats.total}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-green-600">Preferred Vendors</div>
            <div className="text-2xl font-bold text-green-700">{summaryStats.preferred}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-sm text-yellow-600">Average Rating</div>
            <div className="text-2xl font-bold text-yellow-700">{summaryStats.avgRating.toFixed(1)}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-600">Total Contract Value</div>
            <div className="text-2xl font-bold text-blue-700">{formatCurrency(summaryStats.totalValue)}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 border-b border-gray-200 space-y-3">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedTrade}
              onChange={(e) => setSelectedTrade(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {TRADES.map(trade => (
                <option key={trade} value={trade}>{trade}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="preferred">Preferred</option>
              <option value="approved">Approved</option>
              <option value="probation">On Probation</option>
              <option value="suspended">Suspended</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="rating-desc">Highest Rated</option>
              <option value="rating-asc">Lowest Rated</option>
              <option value="total_contract_value-desc">Highest Value</option>
              <option value="on_time_completion-desc">Best On-Time</option>
              <option value="name-asc">Name A-Z</option>
            </select>
          </div>
        </div>
      )}

      {/* Vendor List */}
      <div className="p-4">
        {filteredVendors.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No vendors found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVendors.map((vendor) => (
              <div
                key={vendor.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Vendor Info */}
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Building className="w-7 h-7 text-indigo-600" />
                    </div>
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_LABELS[vendor.status]?.color}`}>
                        {STATUS_LABELS[vendor.status]?.label}
                      </span>
                      <span className="text-sm text-gray-500">{vendor.trade}</span>
                    </div>

                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {vendor.contact_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {vendor.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {vendor.email}
                      </span>
                    </div>

                    {/* Rating */}
                    <div className="mt-2">
                      <StarRating rating={vendor.rating} />
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <MetricBar
                        value={vendor.on_time_completion}
                        label="On-Time Completion"
                        color={vendor.on_time_completion >= 90 ? 'green' : vendor.on_time_completion >= 75 ? 'yellow' : 'red'}
                      />
                      <MetricBar
                        value={vendor.budget_adherence}
                        label="Budget Adherence"
                        color={vendor.budget_adherence >= 95 ? 'green' : vendor.budget_adherence >= 85 ? 'yellow' : 'red'}
                      />
                      <MetricBar
                        value={vendor.quality_score * 20}
                        label="Quality Score"
                        color={vendor.quality_score >= 4 ? 'green' : vendor.quality_score >= 3 ? 'yellow' : 'red'}
                      />
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-6 mt-4 text-sm">
                      <div>
                        <span className="text-gray-500">Projects: </span>
                        <span className="font-medium">{vendor.total_projects}</span>
                        <span className="text-green-600 ml-1">({vendor.active_projects} active)</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Value: </span>
                        <span className="font-medium text-blue-600">{formatCurrency(vendor.total_contract_value)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Paid: </span>
                        <span className="font-medium text-green-600">{formatCurrency(vendor.paid_amount)}</span>
                      </div>
                    </div>

                    {/* Recent Reviews */}
                    {vendor.reviews && vendor.reviews.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="text-sm font-medium text-gray-700 mb-2">Recent Reviews</div>
                        <div className="space-y-2">
                          {vendor.reviews.slice(0, 2).map((review) => (
                            <div key={review.id} className="text-sm bg-gray-50 rounded p-2">
                              <div className="flex items-center gap-2 mb-1">
                                <StarRating rating={review.rating} size="sm" />
                                <span className="text-gray-500">by {review.reviewer}</span>
                                <span className="text-gray-400">{review.date}</span>
                              </div>
                              <p className="text-gray-600 italic">"{review.comment}"</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        setSelectedVendor(vendor);
                        setShowReviewModal(true);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      <Star className="w-4 h-4" />
                      Add Review
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                      <FileText className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedVendor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Review {selectedVendor.name}</h3>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedVendor(null);
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= newReview.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                  placeholder="Share your experience working with this vendor..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setSelectedVendor(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddReview}
                  disabled={!newReview.comment}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorPerformanceTracker;
