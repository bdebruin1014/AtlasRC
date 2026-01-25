import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scale,
  Plus,
  X,
  Search,
  ChevronDown,
  DollarSign,
  MapPin,
  Home,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Ruler,
  Percent,
  Clock,
  Users,
  FileText,
  Star,
  ArrowRight,
  Download,
  Share2,
  Eye,
  Target,
  BarChart3
} from 'lucide-react';

const OpportunityComparisonPage = () => {
  const navigate = useNavigate();
  const [selectedOpportunities, setSelectedOpportunities] = useState([1, 2, 3]);
  const [showSelector, setShowSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightDifferences, setHighlightDifferences] = useState(true);

  // Mock opportunities data
  const allOpportunities = [
    {
      id: 1,
      name: '456 Oak Street',
      address: '456 Oak Street, Charlotte, NC 28202',
      type: 'Scattered Lot',
      stage: 'Due Diligence',
      source: 'Direct Mail',
      assignee: 'Sarah Johnson',
      askingPrice: 425000,
      offeredPrice: 395000,
      estimatedARV: 580000,
      estimatedRehab: 85000,
      estimatedProfit: 75000,
      roi: 22.5,
      capRate: 7.2,
      cashOnCash: 18.5,
      lotSize: 0.35,
      sqft: 2400,
      bedrooms: 4,
      bathrooms: 2.5,
      yearBuilt: 1985,
      condition: 'Fair',
      zoning: 'R-3',
      daysOnMarket: 45,
      daysInPipeline: 28,
      competingOffers: 2,
      motivation: 'High',
      score: 82,
      pros: ['Good location', 'High ARV potential', 'Motivated seller'],
      cons: ['Needs roof', 'Foundation concerns', 'Competing offers'],
      dueDiligenceItems: { completed: 8, total: 12 },
      lastActivity: '2025-01-24',
    },
    {
      id: 2,
      name: '789 Pine Avenue',
      address: '789 Pine Avenue, Raleigh, NC 27601',
      type: 'Scattered Lot',
      stage: 'Analysis',
      source: 'Wholesaler',
      assignee: 'John Smith',
      askingPrice: 380000,
      offeredPrice: 350000,
      estimatedARV: 520000,
      estimatedRehab: 95000,
      estimatedProfit: 55000,
      roi: 18.2,
      capRate: 6.8,
      cashOnCash: 15.2,
      lotSize: 0.28,
      sqft: 1950,
      bedrooms: 3,
      bathrooms: 2,
      yearBuilt: 1978,
      condition: 'Poor',
      zoning: 'R-2',
      daysOnMarket: 62,
      daysInPipeline: 14,
      competingOffers: 0,
      motivation: 'Medium',
      score: 68,
      pros: ['No competition', 'Below market', 'Large backyard'],
      cons: ['Needs significant work', 'Older systems', 'Small lot'],
      dueDiligenceItems: { completed: 3, total: 12 },
      lastActivity: '2025-01-23',
    },
    {
      id: 3,
      name: 'Riverside Lot 15',
      address: 'Lot 15 Riverside Dr, Greenville, SC 29601',
      type: 'Subdivision',
      stage: 'LOI',
      source: 'Broker',
      assignee: 'Emily Chen',
      askingPrice: 185000,
      offeredPrice: 165000,
      estimatedARV: 425000,
      estimatedRehab: 180000,
      estimatedProfit: 60000,
      roi: 24.8,
      capRate: 8.1,
      cashOnCash: 21.5,
      lotSize: 0.42,
      sqft: null,
      bedrooms: null,
      bathrooms: null,
      yearBuilt: null,
      condition: 'Vacant Land',
      zoning: 'R-4',
      daysOnMarket: 28,
      daysInPipeline: 35,
      competingOffers: 1,
      motivation: 'High',
      score: 78,
      pros: ['New construction', 'Growing area', 'Good schools'],
      cons: ['Build costs rising', 'Timeline risk', 'Market uncertainty'],
      dueDiligenceItems: { completed: 5, total: 10 },
      lastActivity: '2025-01-25',
    },
    {
      id: 4,
      name: 'Commercial Plaza Unit',
      address: '1200 Business Pkwy, Columbia, SC 29201',
      type: 'Commercial',
      stage: 'Qualification',
      source: 'Off-Market',
      assignee: 'Michael Brown',
      askingPrice: 680000,
      offeredPrice: null,
      estimatedARV: 850000,
      estimatedRehab: 120000,
      estimatedProfit: 45000,
      roi: 12.5,
      capRate: 9.2,
      cashOnCash: 14.8,
      lotSize: 0.85,
      sqft: 4500,
      bedrooms: null,
      bathrooms: 2,
      yearBuilt: 2002,
      condition: 'Good',
      zoning: 'C-2',
      daysOnMarket: 0,
      daysInPipeline: 7,
      competingOffers: 0,
      motivation: 'Low',
      score: 55,
      pros: ['Off-market', 'Stable tenants', 'Good cap rate'],
      cons: ['Large capital requirement', 'Limited upside', 'Tenant risk'],
      dueDiligenceItems: { completed: 1, total: 15 },
      lastActivity: '2025-01-22',
    },
  ];

  const selectedData = useMemo(() => {
    return allOpportunities.filter(opp => selectedOpportunities.includes(opp.id));
  }, [selectedOpportunities]);

  const formatCurrency = (value) => {
    if (!value) return '-';
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  const formatPercent = (value) => {
    if (!value) return '-';
    return `${value.toFixed(1)}%`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStageColor = (stage) => {
    const colors = {
      'New Lead': 'bg-gray-100 text-gray-700',
      'Qualification': 'bg-blue-100 text-blue-700',
      'Analysis': 'bg-indigo-100 text-indigo-700',
      'LOI': 'bg-purple-100 text-purple-700',
      'Due Diligence': 'bg-orange-100 text-orange-700',
      'Contract': 'bg-yellow-100 text-yellow-700',
      'Closing': 'bg-green-100 text-green-700',
    };
    return colors[stage] || 'bg-gray-100 text-gray-700';
  };

  const getBestValue = (field, data, isLower = false) => {
    const values = data.map(d => d[field]).filter(v => v !== null && v !== undefined);
    if (values.length === 0) return null;
    return isLower ? Math.min(...values) : Math.max(...values);
  };

  const isBestValue = (value, field, isLower = false) => {
    if (!highlightDifferences || value === null || value === undefined) return false;
    const best = getBestValue(field, selectedData, isLower);
    return value === best;
  };

  const addOpportunity = (id) => {
    if (!selectedOpportunities.includes(id) && selectedOpportunities.length < 4) {
      setSelectedOpportunities([...selectedOpportunities, id]);
    }
    setShowSelector(false);
    setSearchTerm('');
  };

  const removeOpportunity = (id) => {
    setSelectedOpportunities(selectedOpportunities.filter(oppId => oppId !== id));
  };

  const availableOpportunities = allOpportunities.filter(
    opp => !selectedOpportunities.includes(opp.id) &&
    (opp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     opp.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const ComparisonRow = ({ label, field, format = 'text', isLower = false, icon: Icon }) => (
    <tr className="border-b border-gray-100">
      <td className="px-4 py-3 bg-gray-50 font-medium text-gray-700 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        {label}
      </td>
      {selectedData.map(opp => {
        const value = opp[field];
        const isBest = isBestValue(value, field, isLower);
        let displayValue = value;

        if (format === 'currency') {
          displayValue = formatCurrency(value);
        } else if (format === 'percent') {
          displayValue = formatPercent(value);
        } else if (format === 'number') {
          displayValue = value?.toLocaleString() || '-';
        } else if (value === null || value === undefined) {
          displayValue = '-';
        }

        return (
          <td
            key={opp.id}
            className={`px-4 py-3 text-center ${isBest ? 'bg-green-50 font-semibold text-green-700' : ''}`}
          >
            {displayValue}
          </td>
        );
      })}
      {selectedOpportunities.length < 4 && <td className="px-4 py-3" />}
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Scale className="w-7 h-7 text-blue-600" />
                Opportunity Comparison
              </h1>
              <p className="text-gray-600 mt-1">
                Compare up to 4 opportunities side-by-side
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={highlightDifferences}
                  onChange={(e) => setHighlightDifferences(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Highlight best values</span>
              </label>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Comparison Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Header with opportunity cards */}
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="w-48 px-4 py-4 text-left text-sm font-semibold text-gray-900">
                    Property
                  </th>
                  {selectedData.map(opp => (
                    <th key={opp.id} className="px-4 py-4 min-w-[250px]">
                      <div className="bg-white border border-gray-200 rounded-lg p-4 relative">
                        <button
                          onClick={() => removeOpportunity(opp.id)}
                          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <h3 className="font-semibold text-gray-900 pr-6">{opp.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{opp.address}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStageColor(opp.stage)}`}>
                            {opp.stage}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getScoreColor(opp.score)}`}>
                            Score: {opp.score}
                          </span>
                        </div>
                        <button
                          onClick={() => navigate(`/opportunity/${opp.id}`)}
                          className="mt-3 w-full flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    </th>
                  ))}
                  {selectedOpportunities.length < 4 && (
                    <th className="px-4 py-4 min-w-[200px]">
                      <div className="relative">
                        <button
                          onClick={() => setShowSelector(!showSelector)}
                          className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
                        >
                          <Plus className="w-6 h-6" />
                          <span className="text-sm">Add Opportunity</span>
                        </button>

                        {showSelector && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            <div className="p-2 border-b border-gray-100">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                  type="text"
                                  placeholder="Search opportunities..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              {availableOpportunities.map(opp => (
                                <button
                                  key={opp.id}
                                  onClick={() => addOpportunity(opp.id)}
                                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Building2 className="w-4 h-4 text-gray-400" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{opp.name}</p>
                                    <p className="text-xs text-gray-500">{opp.type} • {opp.stage}</p>
                                  </div>
                                </button>
                              ))}
                              {availableOpportunities.length === 0 && (
                                <p className="px-3 py-4 text-sm text-gray-500 text-center">
                                  No more opportunities to add
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                {/* Basic Info Section */}
                <tr className="bg-blue-50">
                  <td colSpan={selectedOpportunities.length + 2} className="px-4 py-2 font-semibold text-blue-800">
                    Basic Information
                  </td>
                </tr>
                <ComparisonRow label="Type" field="type" icon={Building2} />
                <ComparisonRow label="Source" field="source" icon={Users} />
                <ComparisonRow label="Assignee" field="assignee" icon={Users} />
                <ComparisonRow label="Days in Pipeline" field="daysInPipeline" format="number" isLower icon={Clock} />
                <ComparisonRow label="Days on Market" field="daysOnMarket" format="number" isLower icon={Calendar} />

                {/* Financial Section */}
                <tr className="bg-green-50">
                  <td colSpan={selectedOpportunities.length + 2} className="px-4 py-2 font-semibold text-green-800">
                    Financial Analysis
                  </td>
                </tr>
                <ComparisonRow label="Asking Price" field="askingPrice" format="currency" isLower icon={DollarSign} />
                <ComparisonRow label="Offered Price" field="offeredPrice" format="currency" isLower icon={DollarSign} />
                <ComparisonRow label="Est. ARV" field="estimatedARV" format="currency" icon={TrendingUp} />
                <ComparisonRow label="Est. Rehab" field="estimatedRehab" format="currency" isLower icon={DollarSign} />
                <ComparisonRow label="Est. Profit" field="estimatedProfit" format="currency" icon={DollarSign} />
                <ComparisonRow label="ROI" field="roi" format="percent" icon={Percent} />
                <ComparisonRow label="Cap Rate" field="capRate" format="percent" icon={BarChart3} />
                <ComparisonRow label="Cash on Cash" field="cashOnCash" format="percent" icon={Target} />

                {/* Property Details Section */}
                <tr className="bg-purple-50">
                  <td colSpan={selectedOpportunities.length + 2} className="px-4 py-2 font-semibold text-purple-800">
                    Property Details
                  </td>
                </tr>
                <ComparisonRow label="Lot Size (acres)" field="lotSize" format="number" icon={Ruler} />
                <ComparisonRow label="Square Feet" field="sqft" format="number" icon={Home} />
                <ComparisonRow label="Bedrooms" field="bedrooms" format="number" icon={Home} />
                <ComparisonRow label="Bathrooms" field="bathrooms" format="number" icon={Home} />
                <ComparisonRow label="Year Built" field="yearBuilt" format="number" icon={Calendar} />
                <ComparisonRow label="Condition" field="condition" icon={AlertTriangle} />
                <ComparisonRow label="Zoning" field="zoning" icon={MapPin} />

                {/* Deal Metrics Section */}
                <tr className="bg-orange-50">
                  <td colSpan={selectedOpportunities.length + 2} className="px-4 py-2 font-semibold text-orange-800">
                    Deal Metrics
                  </td>
                </tr>
                <ComparisonRow label="Competing Offers" field="competingOffers" format="number" isLower icon={Users} />
                <ComparisonRow label="Seller Motivation" field="motivation" icon={Target} />
                <ComparisonRow label="Deal Score" field="score" format="number" icon={Star} />

                {/* Pros & Cons */}
                <tr className="bg-gray-50">
                  <td colSpan={selectedOpportunities.length + 2} className="px-4 py-2 font-semibold text-gray-800">
                    Pros & Cons
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 bg-gray-50 font-medium text-gray-700 align-top">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Pros
                    </div>
                  </td>
                  {selectedData.map(opp => (
                    <td key={opp.id} className="px-4 py-3 align-top">
                      <ul className="space-y-1">
                        {opp.pros.map((pro, idx) => (
                          <li key={idx} className="text-sm text-green-700 flex items-start gap-1">
                            <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                  {selectedOpportunities.length < 4 && <td />}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 bg-gray-50 font-medium text-gray-700 align-top">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      Cons
                    </div>
                  </td>
                  {selectedData.map(opp => (
                    <td key={opp.id} className="px-4 py-3 align-top">
                      <ul className="space-y-1">
                        {opp.cons.map((con, idx) => (
                          <li key={idx} className="text-sm text-red-700 flex items-start gap-1">
                            <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                  {selectedOpportunities.length < 4 && <td />}
                </tr>

                {/* Due Diligence Progress */}
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 bg-gray-50 font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      DD Progress
                    </div>
                  </td>
                  {selectedData.map(opp => {
                    const progress = (opp.dueDiligenceItems.completed / opp.dueDiligenceItems.total) * 100;
                    return (
                      <td key={opp.id} className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            {opp.dueDiligenceItems.completed}/{opp.dueDiligenceItems.total}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                  {selectedOpportunities.length < 4 && <td />}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommendation */}
        {selectedData.length >= 2 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Star className="w-5 h-5" />
              Recommendation
            </h3>
            <p className="text-blue-800">
              Based on the comparison, <strong>{selectedData.reduce((best, opp) => opp.score > best.score ? opp : best).name}</strong> has
              the highest deal score ({selectedData.reduce((best, opp) => opp.score > best.score ? opp : best).score}/100).
              Consider prioritizing this opportunity for its {selectedData.reduce((best, opp) => opp.score > best.score ? opp : best).pros[0].toLowerCase()}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpportunityComparisonPage;
