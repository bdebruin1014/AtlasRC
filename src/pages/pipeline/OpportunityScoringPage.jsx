import React, { useState } from 'react';
import { Star, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Settings, Download, RefreshCw, ChevronDown, ChevronRight, Target, Award, BarChart3, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const OpportunityScoringPage = () => {
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [sortBy, setSortBy] = useState('score');
  const [showCriteria, setShowCriteria] = useState(false);

  const scoringCriteria = [
    { id: 'location', name: 'Location Quality', weight: 20, description: 'Proximity to amenities, schools, employment centers' },
    { id: 'market', name: 'Market Conditions', weight: 15, description: 'Supply/demand dynamics, price trends, absorption rates' },
    { id: 'financials', name: 'Financial Viability', weight: 25, description: 'Projected ROI, IRR, profit margins' },
    { id: 'zoning', name: 'Zoning & Entitlements', weight: 15, description: 'Current zoning, entitlement risk, timeline' },
    { id: 'infrastructure', name: 'Infrastructure', weight: 10, description: 'Utilities availability, road access, drainage' },
    { id: 'competition', name: 'Competition', weight: 10, description: 'Nearby competing projects, market saturation' },
    { id: 'timing', name: 'Timing & Urgency', weight: 5, description: 'Seller motivation, exclusivity window' },
  ];

  const opportunities = [
    {
      id: 'opp-1',
      name: 'Sunset Ridge Phase 3',
      type: 'Community Development',
      location: 'New Braunfels, TX',
      askingPrice: 2850000,
      overallScore: 92,
      trend: 'up',
      lastUpdated: '2024-12-28',
      scores: {
        location: 95,
        market: 88,
        financials: 94,
        zoning: 90,
        infrastructure: 92,
        competition: 85,
        timing: 98,
      },
      strengths: ['Excellent school district', 'High absorption rate', 'Strong pre-sales interest'],
      weaknesses: ['Higher land cost', 'Some utility work needed'],
      recommendation: 'Strong Buy',
    },
    {
      id: 'opp-2',
      name: 'Tech Park North',
      type: 'Commercial',
      location: 'Frisco, TX',
      askingPrice: 1500000,
      overallScore: 87,
      trend: 'up',
      lastUpdated: '2024-12-27',
      scores: {
        location: 92,
        market: 85,
        financials: 88,
        zoning: 82,
        infrastructure: 95,
        competition: 78,
        timing: 90,
      },
      strengths: ['Prime tech corridor location', 'Excellent infrastructure', 'Growing market'],
      weaknesses: ['Zoning variance needed', 'More competition entering market'],
      recommendation: 'Buy',
    },
    {
      id: 'opp-3',
      name: 'Harbor Point Marina',
      type: 'Waterfront',
      location: 'Galveston, TX',
      askingPrice: 1650000,
      overallScore: 82,
      trend: 'stable',
      lastUpdated: '2024-12-26',
      scores: {
        location: 88,
        market: 75,
        financials: 85,
        zoning: 90,
        infrastructure: 72,
        competition: 88,
        timing: 85,
      },
      strengths: ['Unique waterfront location', 'Low competition', 'Favorable zoning'],
      weaknesses: ['Limited infrastructure', 'Seasonal market concerns'],
      recommendation: 'Buy',
    },
    {
      id: 'opp-4',
      name: 'Green Valley Ranch',
      type: 'Land',
      location: 'Dripping Springs, TX',
      askingPrice: 1450000,
      overallScore: 78,
      trend: 'down',
      lastUpdated: '2024-12-25',
      scores: {
        location: 82,
        market: 75,
        financials: 78,
        zoning: 72,
        infrastructure: 68,
        competition: 85,
        timing: 80,
      },
      strengths: ['Growing area', 'Scenic property', 'Low competition'],
      weaknesses: ['Infrastructure investment needed', 'Zoning uncertainty', 'Remote location'],
      recommendation: 'Hold',
    },
    {
      id: 'opp-5',
      name: 'Downtown Mixed Use',
      type: 'Mixed Use',
      location: 'Houston, TX',
      askingPrice: 3200000,
      overallScore: 71,
      trend: 'down',
      lastUpdated: '2024-12-24',
      scores: {
        location: 85,
        market: 65,
        financials: 68,
        zoning: 75,
        infrastructure: 90,
        competition: 55,
        timing: 70,
      },
      strengths: ['Prime downtown location', 'Excellent infrastructure'],
      weaknesses: ['High competition', 'Market uncertainty', 'Lower projected returns'],
      recommendation: 'Pass',
    },
  ];

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 75) return 'text-blue-600 bg-blue-50';
    if (score >= 60) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreBgColor = (score) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getRecommendationColor = (rec) => {
    switch (rec) {
      case 'Strong Buy': return 'bg-green-100 text-green-700 border-green-200';
      case 'Buy': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Hold': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Pass': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const sortedOpportunities = [...opportunities].sort((a, b) => {
    if (sortBy === 'score') return b.overallScore - a.overallScore;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'price') return b.askingPrice - a.askingPrice;
    return 0;
  });

  const calculateWeightedScore = (scores) => {
    return scoringCriteria.reduce((total, criteria) => {
      return total + (scores[criteria.id] * criteria.weight / 100);
    }, 0).toFixed(0);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Opportunity Scoring</h1>
            <p className="text-sm text-gray-500">AI-powered scoring and recommendations for opportunities</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowCriteria(!showCriteria)}>
              <Settings className="w-4 h-4 mr-1" />Scoring Criteria
            </Button>
            <Button variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-1" />Recalculate All</Button>
            <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          </div>
        </div>

        {/* Scoring Criteria Panel */}
        {showCriteria && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Scoring Criteria & Weights
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {scoringCriteria.map((criteria) => (
                <div key={criteria.id} className="bg-white p-3 rounded border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{criteria.name}</span>
                    <span className="text-sm font-bold text-blue-600">{criteria.weight}%</span>
                  </div>
                  <p className="text-xs text-gray-500">{criteria.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Strong Buy</p>
            <p className="text-2xl font-bold text-green-700">{opportunities.filter(o => o.recommendation === 'Strong Buy').length}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Buy</p>
            <p className="text-2xl font-bold text-blue-700">{opportunities.filter(o => o.recommendation === 'Buy').length}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Hold</p>
            <p className="text-2xl font-bold text-amber-700">{opportunities.filter(o => o.recommendation === 'Hold').length}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Pass</p>
            <p className="text-2xl font-bold text-red-700">{opportunities.filter(o => o.recommendation === 'Pass').length}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Avg Score</p>
            <p className="text-2xl font-bold text-purple-700">{(opportunities.reduce((s, o) => s + o.overallScore, 0) / opportunities.length).toFixed(0)}</p>
          </div>
        </div>
      </div>

      {/* Sort Bar */}
      <div className="bg-white border-b px-4 py-2 flex items-center gap-4">
        <span className="text-sm text-gray-600">Sort by:</span>
        <div className="flex gap-1">
          {[
            { id: 'score', label: 'Score' },
            { id: 'name', label: 'Name' },
            { id: 'price', label: 'Price' },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setSortBy(option.id)}
              className={cn(
                "px-3 py-1 rounded text-sm",
                sortBy === option.id ? "bg-gray-200 font-medium" : "hover:bg-gray-100"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Opportunities List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {sortedOpportunities.map((opp) => (
              <div
                key={opp.id}
                onClick={() => setSelectedOpportunity(opp)}
                className={cn(
                  "bg-white border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow",
                  selectedOpportunity?.id === opp.id && "ring-2 ring-[#047857]"
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Score Circle */}
                  <div className={cn("w-16 h-16 rounded-full flex flex-col items-center justify-center", getScoreBgColor(opp.overallScore))}>
                    <span className="text-2xl font-bold text-white">{opp.overallScore}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{opp.name}</h3>
                      {opp.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                      {opp.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                      <span className={cn("px-2 py-0.5 rounded text-xs font-medium border", getRecommendationColor(opp.recommendation))}>
                        {opp.recommendation}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span>{opp.type}</span>
                      <span>{opp.location}</span>
                      <span className="font-medium text-gray-700">${(opp.askingPrice / 1000000).toFixed(2)}M</span>
                    </div>

                    {/* Score Bars */}
                    <div className="grid grid-cols-7 gap-2">
                      {scoringCriteria.map((criteria) => (
                        <div key={criteria.id} className="text-center">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                            <div
                              className={cn("h-full rounded-full", getScoreBgColor(opp.scores[criteria.id]))}
                              style={{ width: `${opp.scores[criteria.id]}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{opp.scores[criteria.id]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        {selectedOpportunity && (
          <div className="w-96 border-l bg-white overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-lg">{selectedOpportunity.name}</h2>
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", getScoreBgColor(selectedOpportunity.overallScore))}>
                  <span className="text-xl font-bold text-white">{selectedOpportunity.overallScore}</span>
                </div>
              </div>
              <span className={cn("px-3 py-1 rounded text-sm font-medium border", getRecommendationColor(selectedOpportunity.recommendation))}>
                {selectedOpportunity.recommendation}
              </span>
            </div>

            {/* Detailed Scores */}
            <div className="p-4 border-b">
              <h3 className="font-semibold mb-3">Score Breakdown</h3>
              <div className="space-y-3">
                {scoringCriteria.map((criteria) => (
                  <div key={criteria.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{criteria.name}</span>
                      <span className={cn("text-sm font-semibold px-2 py-0.5 rounded", getScoreColor(selectedOpportunity.scores[criteria.id]))}>
                        {selectedOpportunity.scores[criteria.id]}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", getScoreBgColor(selectedOpportunity.scores[criteria.id]))}
                        style={{ width: `${selectedOpportunity.scores[criteria.id]}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="p-4 border-b">
              <h3 className="font-semibold mb-3 text-green-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />Strengths
              </h3>
              <ul className="space-y-1 mb-4">
                {selectedOpportunity.strengths.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>

              <h3 className="font-semibold mb-3 text-amber-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />Weaknesses
              </h3>
              <ul className="space-y-1">
                {selectedOpportunity.weaknesses.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="p-4">
              <Button className="w-full bg-[#047857] hover:bg-[#065f46] mb-2">View Full Analysis</Button>
              <Button variant="outline" className="w-full">Recalculate Score</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpportunityScoringPage;
