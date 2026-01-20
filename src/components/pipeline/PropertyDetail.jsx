// components/pipeline/PropertyDetail.jsx
// Property detail view with analysis results

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  useProperty, 
  usePropertyActions,
  usePropertySubscription 
} from '@/hooks/usePipeline';

// =============================================================================
// CONSTANTS
// =============================================================================

const RECOMMENDATION_COLORS = {
  STRONG_BUY: '#22c55e',
  BUY: '#84cc16',
  HOLD: '#f59e0b',
  PASS: '#ef4444',
};

const RECOMMENDATION_LABELS = {
  STRONG_BUY: 'Strong Buy',
  BUY: 'Buy',
  HOLD: 'Hold',
  PASS: 'Pass',
};

const STATUS_LABELS = {
  new: 'New Lead',
  enriching: 'Enriching',
  enriched: 'Enriched',
  analyzing: 'Analyzing',
  analyzed: 'Analyzed',
  pending_review: 'Pending Review',
  approved: 'Approved',
  rejected: 'Passed',
  under_contract: 'Under Contract',
  closed: 'Closed',
  archived: 'Archived',
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

function SectionCard({ title, children, className = '' }) {
  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b border-gray-700">
          <h3 className="font-semibold text-white">{title}</h3>
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

function DataRow({ label, value, highlight = false }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className={`text-sm ${highlight ? 'text-green-400 font-bold' : 'text-white'}`}>
        {value || '—'}
      </span>
    </div>
  );
}

function ScoreGauge({ score, label }) {
  const percentage = Math.min(100, Math.max(0, score || 0));
  const color = percentage >= 75 ? '#22c55e' : 
                percentage >= 50 ? '#84cc16' : 
                percentage >= 25 ? '#f59e0b' : '#ef4444';
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="#374151"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${percentage * 2.26} 226`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-white">{score || 0}</span>
        </div>
      </div>
      <span className="text-xs text-gray-400 mt-2">{label}</span>
    </div>
  );
}

function DisqualifierBadge({ reasons }) {
  if (!reasons || reasons.length === 0) return null;
  
  const reasonLabels = {
    flood_zone: 'Flood Zone',
    easement_issue: 'Easement Issue',
    lot_too_small: 'Lot Too Small',
    no_utilities: 'No Utilities',
    zoning_issue: 'Zoning Issue',
    steep_slope: 'Steep Slope',
    wetlands: 'Wetlands',
    environmental: 'Environmental Issue',
  };
  
  return (
    <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-red-400 text-lg">⚠️</span>
        <span className="text-red-400 font-semibold">Disqualifying Factors</span>
      </div>
      <ul className="space-y-1">
        {reasons.map((reason, idx) => (
          <li key={idx} className="text-red-300 text-sm">
            • {reasonLabels[reason] || reason}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScenarioCard({ scenario }) {
  if (!scenario) return null;
  
  return (
    <div className="bg-gray-700/50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="font-medium text-white">
          {PRODUCT_LABELS[scenario.product_line] || scenario.product_line}
        </span>
        {scenario.is_recommended && (
          <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">
            Recommended
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-400">Build Cost</span>
          <p className="text-white">${scenario.total_build_cost?.toLocaleString()}</p>
        </div>
        <div>
          <span className="text-gray-400">Sale Price</span>
          <p className="text-white">${scenario.projected_sale_price?.toLocaleString()}</p>
        </div>
        <div>
          <span className="text-gray-400">Profit</span>
          <p className={`font-bold ${scenario.projected_profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${scenario.projected_profit?.toLocaleString()}
          </p>
        </div>
        <div>
          <span className="text-gray-400">ROI</span>
          <p className={`font-bold ${scenario.roi_percentage > 15 ? 'text-green-400' : 'text-amber-400'}`}>
            {scenario.roi_percentage?.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function PropertyDetail() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  const { property, loading, error, refresh } = useProperty(propertyId);
  const { 
    enrichProperty, 
    analyzeProperty, 
    updatePropertyStatus,
    deleteProperty 
  } = usePropertyActions();

  // Subscribe to real-time updates
  usePropertySubscription(propertyId, (updated) => {
    refresh();
  });

  const handleEnrich = async () => {
    setActionLoading(true);
    try {
      await enrichProperty(propertyId);
      refresh();
    } catch (err) {
      console.error('Enrich failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setActionLoading(true);
    try {
      await analyzeProperty(propertyId);
      refresh();
    } catch (err) {
      console.error('Analyze failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await updatePropertyStatus(propertyId, 'approved', reviewNotes);
      refresh();
    } catch (err) {
      console.error('Approve failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await updatePropertyStatus(propertyId, 'rejected', reviewNotes);
      refresh();
    } catch (err) {
      console.error('Reject failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    
    setActionLoading(true);
    try {
      await deleteProperty(propertyId);
      navigate('/acquisition');
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-full bg-gray-900 flex flex-col items-center justify-center text-white">
        <p className="text-xl mb-4">Property not found</p>
        <button
          onClick={() => navigate('/acquisition')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
        >
          Back to Pipeline
        </button>
      </div>
    );
  }

  const recColor = property.recommendation 
    ? RECOMMENDATION_COLORS[property.recommendation] 
    : '#6b7280';
  
  const evaluation = property.buy_box_evaluation;
  const recommendation = property.recommendation;
  const scenarios = property.scenario_analyses || [];

  return (
    <div className="min-h-full bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/acquisition')}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          ← Back
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{property.address}</h1>
          <p className="text-gray-400">
            {property.city}, {property.state} {property.zip_code}
            {' • '}
            {MARKET_LABELS[property.target_market] || property.target_market}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <span 
            className="px-3 py-1 rounded-full text-sm font-medium"
            style={{ backgroundColor: `${recColor}20`, color: recColor }}
          >
            {STATUS_LABELS[property.status] || property.status}
          </span>
          
          <button
            onClick={handleDelete}
            className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
            title="Delete property"
          >
            🗑️
          </button>
        </div>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Property Info */}
        <div className="space-y-6">
          <SectionCard title="Property Details">
            <DataRow label="Address" value={property.address} />
            <DataRow label="City" value={property.city} />
            <DataRow label="State" value={property.state} />
            <DataRow label="ZIP Code" value={property.zip_code} />
            <DataRow label="Target Market" value={MARKET_LABELS[property.target_market]} />
            <DataRow 
              label="Asking Price" 
              value={`$${property.asking_price?.toLocaleString()}`} 
            />
            <DataRow 
              label="Lot Size" 
              value={property.lot_size_sf 
                ? `${(property.lot_size_sf / 43560).toFixed(2)} acres (${property.lot_size_sf.toLocaleString()} sq ft)`
                : null
              } 
            />
            <DataRow label="Property Type" value={property.property_type} />
            <DataRow label="Source" value={property.source} />
          </SectionCard>
          
          {/* GIS Data */}
          {property.gis_data && (
            <SectionCard title="GIS Data">
              <DataRow label="Parcel ID" value={property.gis_data.parcel_id} />
              <DataRow label="Zoning" value={property.gis_data.zoning} />
              <DataRow label="Land Use" value={property.gis_data.land_use} />
              <DataRow label="Owner" value={property.gis_data.owner_name} />
              <DataRow 
                label="Assessed Value" 
                value={property.gis_data.assessed_value 
                  ? `$${property.gis_data.assessed_value.toLocaleString()}`
                  : null
                } 
              />
              <DataRow label="Flood Zone" value={property.gis_data.flood_zone || 'None'} />
              <DataRow label="Water" value={property.gis_data.water_available ? '✅' : '❌'} />
              <DataRow label="Sewer" value={property.gis_data.sewer_available ? '✅' : '❌'} />
              <DataRow label="Electric" value={property.gis_data.electric_available ? '✅' : '❌'} />
            </SectionCard>
          )}
          
          {/* Actions */}
          <SectionCard title="Actions">
            {property.status === 'new' && (
              <button
                onClick={handleEnrich}
                disabled={actionLoading}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 rounded-lg text-white transition-colors mb-2"
              >
                {actionLoading ? 'Enriching...' : '🔍 Enrich with GIS Data'}
              </button>
            )}
            
            {property.status === 'enriched' && (
              <button
                onClick={handleAnalyze}
                disabled={actionLoading}
                className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 rounded-lg text-white transition-colors mb-2"
              >
                {actionLoading ? 'Analyzing...' : '🧠 Run AI Analysis'}
              </button>
            )}
            
            {(property.status === 'analyzed' || property.status === 'pending_review') && (
              <>
                <textarea
                  placeholder="Review notes (optional)..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm mb-2 resize-none"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 rounded-lg text-white transition-colors"
                  >
                    {actionLoading ? '...' : '✅ Approve'}
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-gray-600 rounded-lg text-white transition-colors"
                  >
                    {actionLoading ? '...' : '❌ Pass'}
                  </button>
                </div>
              </>
            )}
          </SectionCard>
        </div>
        
        {/* Middle Column - Scores & Evaluation */}
        <div className="space-y-6">
          {/* Recommendation Card */}
          {recommendation && (
            <div 
              className="rounded-lg p-6 text-center"
              style={{ backgroundColor: `${recColor}15`, borderColor: recColor, borderWidth: 2 }}
            >
              <p className="text-gray-400 text-sm mb-1">AI Recommendation</p>
              <p 
                className="text-3xl font-bold mb-2"
                style={{ color: recColor }}
              >
                {RECOMMENDATION_LABELS[recommendation.recommendation] || recommendation.recommendation}
              </p>
              {recommendation.max_offer_price && (
                <p className="text-white">
                  Max Offer: <span className="font-bold">${recommendation.max_offer_price.toLocaleString()}</span>
                </p>
              )}
            </div>
          )}
          
          {/* Disqualifiers */}
          {evaluation?.has_disqualifier && (
            <DisqualifierBadge 
              reasons={evaluation.instant_disqualifiers?.map(d => d.reason)}
            />
          )}
          
          {/* Scores */}
          {evaluation && (
            <SectionCard title="Buy Box Evaluation">
              <div className="flex justify-around mb-6">
                <ScoreGauge score={evaluation.total_score} label="Overall Score" />
              </div>
              
              <DataRow label="Location Score" value={`${evaluation.location_score || 0}/25`} />
              <DataRow label="Size Score" value={`${evaluation.size_score || 0}/20`} />
              <DataRow label="Value Score" value={`${evaluation.value_score || 0}/20`} />
              <DataRow label="Buildability Score" value={`${evaluation.buildability_score || 0}/20`} />
              <DataRow label="Utilities Score" value={`${evaluation.utilities_score || 0}/15`} />
              
              {evaluation.best_product && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <DataRow 
                    label="Best Product" 
                    value={PRODUCT_LABELS[evaluation.best_product] || evaluation.best_product}
                    highlight 
                  />
                </div>
              )}
            </SectionCard>
          )}
          
          {/* Financial Summary */}
          {recommendation && (
            <SectionCard title="Financial Summary">
              <DataRow 
                label="Projected Profit" 
                value={recommendation.projected_profit 
                  ? `$${recommendation.projected_profit.toLocaleString()}`
                  : null
                }
                highlight={recommendation.projected_profit > 0}
              />
              <DataRow 
                label="Projected ROI" 
                value={recommendation.projected_roi 
                  ? `${recommendation.projected_roi.toFixed(1)}%`
                  : null
                }
              />
              <DataRow 
                label="Max Offer" 
                value={recommendation.max_offer_price 
                  ? `$${recommendation.max_offer_price.toLocaleString()}`
                  : null
                }
              />
              <DataRow 
                label="Margin of Safety" 
                value={recommendation.margin_of_safety_pct 
                  ? `${recommendation.margin_of_safety_pct.toFixed(1)}%`
                  : null
                }
              />
            </SectionCard>
          )}
        </div>
        
        {/* Right Column - Scenarios & AI Analysis */}
        <div className="space-y-6">
          {/* Scenario Analysis */}
          {scenarios.length > 0 && (
            <SectionCard title="Scenario Analysis">
              <div className="space-y-4">
                {scenarios.map((scenario, idx) => (
                  <ScenarioCard key={idx} scenario={scenario} />
                ))}
              </div>
            </SectionCard>
          )}
          
          {/* AI Analysis */}
          {recommendation?.analysis_summary && (
            <SectionCard title="AI Analysis">
              <p className="text-gray-300 text-sm whitespace-pre-wrap">
                {recommendation.analysis_summary}
              </p>
            </SectionCard>
          )}
          
          {/* Key Factors */}
          {recommendation?.key_factors && (
            <SectionCard title="Key Decision Factors">
              <ul className="space-y-2">
                {recommendation.key_factors.map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className={factor.positive ? 'text-green-400' : 'text-red-400'}>
                      {factor.positive ? '✓' : '✗'}
                    </span>
                    <span className="text-gray-300">{factor.text || factor}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}
          
          {/* Comparables */}
          {property.comparables && property.comparables.length > 0 && (
            <SectionCard title="Comparables">
              <div className="space-y-3">
                {property.comparables.slice(0, 5).map((comp, idx) => (
                  <div key={idx} className="bg-gray-700/50 rounded p-3">
                    <p className="text-white text-sm font-medium">{comp.address}</p>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{comp.distance_miles?.toFixed(1)} mi away</span>
                      <span>${comp.sale_price?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{comp.lot_size_sf?.toLocaleString()} sq ft</span>
                      <span>Sold: {comp.sale_date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
