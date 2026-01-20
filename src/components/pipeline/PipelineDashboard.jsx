// components/pipeline/PipelineDashboard.jsx
// Kanban-style acquisition pipeline dashboard

import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  usePipelineSummary, 
  useProperties, 
  usePropertyActions,
  usePipelineSubscription 
} from '@/hooks/usePipeline';

// =============================================================================
// CONSTANTS
// =============================================================================

const STATUS_COLUMNS = [
  { key: 'new', label: 'New Leads', color: '#6366f1' },
  { key: 'enriching', label: 'Enriching', color: '#8b5cf6' },
  { key: 'enriched', label: 'Enriched', color: '#a855f7' },
  { key: 'analyzing', label: 'Analyzing', color: '#f59e0b' },
  { key: 'analyzed', label: 'Analyzed', color: '#10b981' },
  { key: 'pending_review', label: 'Pending Review', color: '#3b82f6' },
  { key: 'approved', label: 'Approved', color: '#22c55e' },
  { key: 'rejected', label: 'Passed', color: '#ef4444' },
  { key: 'under_contract', label: 'Under Contract', color: '#06b6d4' },
  { key: 'closed', label: 'Closed', color: '#84cc16' },
];

const RECOMMENDATION_COLORS = {
  STRONG_BUY: '#22c55e',
  BUY: '#84cc16',
  HOLD: '#f59e0b',
  PASS: '#ef4444',
};

const MARKET_LABELS = {
  nickeltown: 'Nickeltown',
  travelers_rest: "Traveler's Rest",
  taylors: 'Taylors',
  greer: 'Greer',
};

const PRODUCT_LABELS = {
  cherry: 'Cherry',
  magnolia: 'Magnolia',
  atlas: 'Atlas',
  anchorage: 'Anchorage',
};

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function StatCard({ label, value, trend, color }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-2xl font-bold mt-1" style={{ color: color || '#fff' }}>
        {value}
      </p>
      {trend && (
        <p className={`text-xs mt-1 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
        </p>
      )}
    </div>
  );
}

function PropertyCard({ property, onClick, onEnrich, onAnalyze }) {
  const { enrichProperty, analyzeProperty, loading } = usePropertyActions();
  const [actionLoading, setActionLoading] = useState(false);

  const handleEnrich = async (e) => {
    e.stopPropagation();
    setActionLoading(true);
    try {
      await enrichProperty(property.id);
      onEnrich?.();
    } catch (err) {
      console.error('Enrich failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAnalyze = async (e) => {
    e.stopPropagation();
    setActionLoading(true);
    try {
      await analyzeProperty(property.id);
      onAnalyze?.();
    } catch (err) {
      console.error('Analyze failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const recColor = property.recommendation 
    ? RECOMMENDATION_COLORS[property.recommendation] 
    : '#6b7280';

  return (
    <div
      onClick={onClick}
      className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-gray-600 cursor-pointer transition-all mb-2"
    >
      <div className="flex justify-between items-start mb-2">
        <p className="font-medium text-white text-sm truncate flex-1">
          {property.address}
        </p>
        {property.score && (
          <span 
            className="text-xs font-bold px-2 py-0.5 rounded-full ml-2"
            style={{ 
              backgroundColor: `${recColor}20`,
              color: recColor,
            }}
          >
            {property.score}
          </span>
        )}
      </div>
      
      <p className="text-gray-400 text-xs mb-2">
        {property.city} • {MARKET_LABELS[property.market] || property.market}
      </p>
      
      <div className="flex justify-between items-center text-xs mb-2">
        <span className="text-gray-400">
          ${property.asking_price?.toLocaleString() || 'N/A'}
        </span>
        {property.lot_size_sf && (
          <span className="text-gray-500">
            {(property.lot_size_sf / 43560).toFixed(2)} ac
          </span>
        )}
      </div>
      
      {property.recommendation && (
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded"
            style={{ 
              backgroundColor: `${recColor}20`,
              color: recColor,
            }}
          >
            {property.recommendation.replace('_', ' ')}
          </span>
          {property.best_product && (
            <span className="text-xs text-gray-500">
              {PRODUCT_LABELS[property.best_product]}
            </span>
          )}
        </div>
      )}
      
      {property.projected_profit && property.projected_profit > 0 && (
        <div className="flex justify-between text-xs text-gray-500">
          <span>Profit: ${property.projected_profit.toLocaleString()}</span>
          <span>ROI: {property.projected_roi?.toFixed(1)}%</span>
        </div>
      )}
      
      {property.has_disqualifier && (
        <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
          ⚠️ Disqualifier: {property.disqualifier_reasons?.join(', ')}
        </div>
      )}
      
      {/* Action buttons based on status */}
      {(property.status === 'new' || property.status === 'enriched') && (
        <div className="mt-3 flex gap-2">
          {property.status === 'new' && (
            <button
              onClick={handleEnrich}
              disabled={actionLoading}
              className="flex-1 px-2 py-1 text-xs bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 rounded text-white transition-colors"
            >
              {actionLoading ? 'Enriching...' : '🔍 Enrich'}
            </button>
          )}
          {property.status === 'enriched' && (
            <button
              onClick={handleAnalyze}
              disabled={actionLoading}
              className="flex-1 px-2 py-1 text-xs bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 rounded text-white transition-colors"
            >
              {actionLoading ? 'Analyzing...' : '🧠 Analyze'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function KanbanColumn({ status, label, color, properties, onRefresh }) {
  const navigate = useNavigate();
  const columnProperties = properties.filter(p => p.status === status);

  return (
    <div className="flex flex-col min-w-[280px] max-w-[280px] bg-gray-900 rounded-lg">
      <div 
        className="px-4 py-3 rounded-t-lg flex items-center justify-between"
        style={{ backgroundColor: `${color}20` }}
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="font-medium text-white text-sm">{label}</span>
        </div>
        <span 
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${color}30`, color }}
        >
          {columnProperties.length}
        </span>
      </div>
      
      <div className="p-2 flex-1 overflow-y-auto max-h-[calc(100vh-320px)]">
        {columnProperties.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-4">
            No properties
          </div>
        ) : (
          columnProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onClick={() => navigate(`/acquisition/${property.id}`)}
              onEnrich={onRefresh}
              onAnalyze={onRefresh}
            />
          ))
        )}
      </div>
    </div>
  );
}

function AddPropertyModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    zip_code: '',
    target_market: 'nickeltown',
    asking_price: '',
    lot_size_sf: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onAdd({
        ...formData,
        asking_price: Number(formData.asking_price),
        lot_size_sf: Number(formData.lot_size_sf),
      });
      onClose();
      setFormData({
        address: '',
        city: '',
        zip_code: '',
        target_market: 'nickeltown',
        asking_price: '',
        lot_size_sf: '',
      });
    } catch (err) {
      console.error('Failed to add property:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Add New Property</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Address *</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:border-indigo-500 focus:outline-none"
              placeholder="123 Main Street"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:border-indigo-500 focus:outline-none"
                placeholder="Greenville"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">ZIP Code *</label>
              <input
                type="text"
                required
                value={formData.zip_code}
                onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:border-indigo-500 focus:outline-none"
                placeholder="29601"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Target Market *</label>
            <select
              required
              value={formData.target_market}
              onChange={(e) => setFormData({ ...formData, target_market: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:border-indigo-500 focus:outline-none"
            >
              {Object.entries(MARKET_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Asking Price *</label>
              <input
                type="number"
                required
                value={formData.asking_price}
                onChange={(e) => setFormData({ ...formData, asking_price: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:border-indigo-500 focus:outline-none"
                placeholder="85000"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Lot Size (sq ft) *</label>
              <input
                type="number"
                required
                value={formData.lot_size_sf}
                onChange={(e) => setFormData({ ...formData, lot_size_sf: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:border-indigo-500 focus:outline-none"
                placeholder="8500"
              />
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 rounded text-white transition-colors"
            >
              {submitting ? 'Adding...' : 'Add Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function PipelineDashboard() {
  const [viewMode, setViewMode] = useState('kanban');
  const [filters, setFilters] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  
  const { summary, loading: summaryLoading, refresh: refreshSummary } = usePipelineSummary();
  const { properties, loading: propertiesLoading, refresh: refreshProperties } = useProperties(filters);
  const { createProperty } = usePropertyActions();

  const handleRefresh = useCallback(() => {
    refreshSummary();
    refreshProperties();
  }, [refreshSummary, refreshProperties]);

  // Subscribe to real-time updates
  usePipelineSubscription(handleRefresh);

  const handleAddProperty = async (data) => {
    await createProperty(data);
    handleRefresh();
  };

  const loading = summaryLoading || propertiesLoading;

  // Group properties by status for table view
  const propertyStats = useMemo(() => {
    if (!summary) return null;
    return {
      total: summary.total_properties,
      strongBuy: summary.by_recommendation?.STRONG_BUY || 0,
      buy: summary.by_recommendation?.BUY || 0,
      hold: summary.by_recommendation?.HOLD || 0,
      pass: summary.by_recommendation?.PASS || 0,
      avgScore: Math.round(summary.avg_score || 0),
      totalProfit: summary.total_potential_profit || 0,
      needsReview: summary.properties_needing_review || 0,
    };
  }, [summary]);

  return (
    <div className="min-h-full bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Acquisition Pipeline</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage and analyze potential land acquisitions
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                viewMode === 'kanban' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                viewMode === 'table' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Table
            </button>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            🔄 Refresh
          </button>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
          >
            + Add Property
          </button>
        </div>
      </div>
      
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <StatCard 
          label="Total Properties" 
          value={propertyStats?.total || 0} 
        />
        <StatCard 
          label="Strong Buy" 
          value={propertyStats?.strongBuy || 0}
          color={RECOMMENDATION_COLORS.STRONG_BUY}
        />
        <StatCard 
          label="Buy" 
          value={propertyStats?.buy || 0}
          color={RECOMMENDATION_COLORS.BUY}
        />
        <StatCard 
          label="Hold" 
          value={propertyStats?.hold || 0}
          color={RECOMMENDATION_COLORS.HOLD}
        />
        <StatCard 
          label="Pass" 
          value={propertyStats?.pass || 0}
          color={RECOMMENDATION_COLORS.PASS}
        />
        <StatCard 
          label="Avg Score" 
          value={propertyStats?.avgScore || 0}
        />
        <StatCard 
          label="Total Potential" 
          value={`$${(propertyStats?.totalProfit || 0).toLocaleString()}`}
          color="#22c55e"
        />
      </div>
      
      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Search addresses..."
          value={filters.search || ''}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none w-64"
        />
        
        <select
          value={filters.market?.[0] || ''}
          onChange={(e) => setFilters({ 
            ...filters, 
            market: e.target.value ? [e.target.value] : undefined 
          })}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All Markets</option>
          {Object.entries(MARKET_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        
        <select
          value={filters.recommendation?.[0] || ''}
          onChange={(e) => setFilters({ 
            ...filters, 
            recommendation: e.target.value ? [e.target.value] : undefined 
          })}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All Recommendations</option>
          <option value="STRONG_BUY">Strong Buy</option>
          <option value="BUY">Buy</option>
          <option value="HOLD">Hold</option>
          <option value="PASS">Pass</option>
        </select>
        
        {Object.keys(filters).length > 0 && (
          <button
            onClick={() => setFilters({})}
            className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      )}
      
      {/* Kanban View */}
      {!loading && viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUS_COLUMNS.map((col) => (
            <KanbanColumn
              key={col.key}
              status={col.key}
              label={col.label}
              color={col.color}
              properties={properties}
              onRefresh={handleRefresh}
            />
          ))}
        </div>
      )}
      
      {/* Table View */}
      {!loading && viewMode === 'table' && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Market
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Recommendation
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Est. Profit
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {properties.map((property) => {
                const recColor = property.recommendation 
                  ? RECOMMENDATION_COLORS[property.recommendation] 
                  : '#6b7280';
                const statusCol = STATUS_COLUMNS.find(c => c.key === property.status);
                
                return (
                  <tr 
                    key={property.id}
                    onClick={() => window.location.href = `/acquisition/${property.id}`}
                    className="hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white font-medium">{property.address}</p>
                        <p className="text-gray-500 text-sm">{property.city}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {MARKET_LABELS[property.market] || property.market}
                    </td>
                    <td className="px-4 py-3">
                      <span 
                        className="px-2 py-1 text-xs rounded-full"
                        style={{ 
                          backgroundColor: `${statusCol?.color}20`,
                          color: statusCol?.color,
                        }}
                      >
                        {statusCol?.label || property.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      ${property.asking_price?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      {property.score ? (
                        <span 
                          className="font-bold"
                          style={{ color: recColor }}
                        >
                          {property.score}
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {property.recommendation ? (
                        <span 
                          className="px-2 py-1 text-xs rounded"
                          style={{ 
                            backgroundColor: `${recColor}20`,
                            color: recColor,
                          }}
                        >
                          {property.recommendation.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {property.projected_profit ? (
                        <span className="text-green-400">
                          ${property.projected_profit.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {properties.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No properties found. Add some to get started!
            </div>
          )}
        </div>
      )}
      
      {/* Add Property Modal */}
      <AddPropertyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddProperty}
      />
    </div>
  );
}
