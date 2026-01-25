import React, { useState } from 'react';
import { Building2, MapPin, DollarSign, Users, TrendingUp, TrendingDown, Eye, Plus, Edit2, RefreshCw, Filter, Search, ExternalLink, Calendar, BarChart3, AlertTriangle, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const CompetitionTrackerPage = () => {
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const opportunityInfo = {
    name: 'Sunset Ridge Phase 3',
    location: 'New Braunfels, TX',
    ourPrice: 125000,
    ourAbsorption: 5,
  };

  const competitors = [
    {
      id: 'comp-1',
      name: 'Vintage Oaks',
      developer: 'SouthStar Communities',
      location: 'New Braunfels, TX',
      distance: 3.2,
      type: 'Master Planned',
      status: 'Active',
      totalLots: 3500,
      lotsRemaining: 450,
      lotsSold: 3050,
      avgPrice: 135000,
      priceChange: 8.5,
      monthlyAbsorption: 8,
      absorptionTrend: 'up',
      amenities: ['Golf Course', 'Pool', 'Tennis', 'Trails', 'Clubhouse'],
      strengths: ['Established community', 'Strong amenities', 'Brand recognition'],
      weaknesses: ['Higher prices', 'Limited lot selection'],
      lastUpdated: '2024-12-20',
      notes: 'Primary competitor - well established with strong sales',
      threatLevel: 'high',
    },
    {
      id: 'comp-2',
      name: 'River Chase',
      developer: 'Taylor Morrison',
      location: 'New Braunfels, TX',
      distance: 4.5,
      type: 'Traditional',
      status: 'Active',
      totalLots: 850,
      lotsRemaining: 180,
      lotsSold: 670,
      avgPrice: 115000,
      priceChange: 6.2,
      monthlyAbsorption: 6,
      absorptionTrend: 'stable',
      amenities: ['Pool', 'Playground', 'Trails'],
      strengths: ['Competitive pricing', 'Good builder selection'],
      weaknesses: ['Fewer amenities', 'Less established'],
      lastUpdated: '2024-12-18',
      notes: 'Good value alternative, targeting first-time buyers',
      threatLevel: 'medium',
    },
    {
      id: 'comp-3',
      name: 'Havenwood',
      developer: 'KB Home',
      location: 'New Braunfels, TX',
      distance: 2.8,
      type: 'Builder Community',
      status: 'Active',
      totalLots: 420,
      lotsRemaining: 95,
      lotsSold: 325,
      avgPrice: 105000,
      priceChange: 4.5,
      monthlyAbsorption: 5,
      absorptionTrend: 'down',
      amenities: ['Playground', 'Open Space'],
      strengths: ['Entry-level pricing', 'Quick close inventory'],
      weaknesses: ['Single builder', 'Basic amenities'],
      lastUpdated: '2024-12-22',
      notes: 'Slowing down as inventory depletes',
      threatLevel: 'low',
    },
    {
      id: 'comp-4',
      name: 'Mission Hills',
      developer: 'Meritage Homes',
      location: 'San Marcos, TX',
      distance: 5.1,
      type: 'Builder Community',
      status: 'Active',
      totalLots: 620,
      lotsRemaining: 220,
      lotsSold: 400,
      avgPrice: 128000,
      priceChange: 7.8,
      monthlyAbsorption: 4,
      absorptionTrend: 'up',
      amenities: ['Pool', 'Fitness Center', 'Dog Park'],
      strengths: ['Modern amenities', 'Energy efficient homes'],
      weaknesses: ['Single builder', 'Further from employment'],
      lastUpdated: '2024-12-19',
      notes: 'Growing competition, improving sales',
      threatLevel: 'medium',
    },
    {
      id: 'comp-5',
      name: 'Copper Ridge',
      developer: 'Lennar',
      location: 'New Braunfels, TX',
      distance: 3.8,
      type: 'Builder Community',
      status: 'Pre-Sales',
      totalLots: 380,
      lotsRemaining: 380,
      lotsSold: 0,
      avgPrice: 118000,
      priceChange: 0,
      monthlyAbsorption: 0,
      absorptionTrend: 'new',
      amenities: ['Pool', 'Pavilion', 'Trails'],
      strengths: ['New inventory', 'Smart home features'],
      weaknesses: ['Unproven market', 'Not yet established'],
      lastUpdated: '2024-12-21',
      notes: 'New entrant - watch closely for pricing strategy',
      threatLevel: 'medium',
    },
  ];

  const getThreatBadge = (level) => {
    switch (level) {
      case 'high':
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded font-medium">High Threat</span>;
      case 'medium':
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded font-medium">Medium Threat</span>;
      case 'low':
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">Low Threat</span>;
      default:
        return null;
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    if (trend === 'new') return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    return <span className="w-4 h-4 text-gray-400">-</span>;
  };

  const filteredCompetitors = competitors.filter(c => {
    const matchesType = filterType === 'all' || c.type.toLowerCase().includes(filterType.toLowerCase());
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.developer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const avgCompetitorPrice = competitors.reduce((s, c) => s + c.avgPrice, 0) / competitors.length;
  const avgCompetitorAbsorption = competitors.filter(c => c.monthlyAbsorption > 0).reduce((s, c) => s + c.monthlyAbsorption, 0) / competitors.filter(c => c.monthlyAbsorption > 0).length;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Competition Tracker</h1>
            <p className="text-sm text-gray-500">{opportunityInfo.name} - Competitive Landscape</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-1" />Update All</Button>
            <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm"><Plus className="w-4 h-4 mr-1" />Add Competitor</Button>
          </div>
        </div>

        {/* Summary Comparison */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-500">Our Avg Price</span>
            </div>
            <p className="text-xl font-bold text-blue-700">${opportunityInfo.ourPrice.toLocaleString()}</p>
            <p className="text-xs text-blue-600">{((1 - opportunityInfo.ourPrice / avgCompetitorPrice) * 100).toFixed(0)}% below avg</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-gray-500">Market Avg Price</span>
            </div>
            <p className="text-xl font-bold text-purple-700">${avgCompetitorPrice.toLocaleString()}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs text-gray-500">Our Target Absorption</span>
            </div>
            <p className="text-xl font-bold text-green-700">{opportunityInfo.ourAbsorption}/mo</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-amber-600" />
              <span className="text-xs text-gray-500">Market Avg Absorption</span>
            </div>
            <p className="text-xl font-bold text-amber-700">{avgCompetitorAbsorption.toFixed(1)}/mo</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-red-600" />
              <span className="text-xs text-gray-500">Active Competitors</span>
            </div>
            <p className="text-xl font-bold text-red-700">{competitors.length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search competitors..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select className="border rounded-md px-3 py-1.5 text-sm" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">All Types</option>
          <option value="master">Master Planned</option>
          <option value="builder">Builder Community</option>
          <option value="traditional">Traditional</option>
        </select>
        <div className="flex-1" />
        <div className="flex gap-1">
          <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>Grid</Button>
          <Button variant={viewMode === 'table' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('table')}>Table</Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Competitors List */}
        <div className={cn("overflow-y-auto p-4", viewMode === 'grid' ? "flex-1" : "w-full")}>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 gap-4">
              {filteredCompetitors.map((comp) => (
                <div
                  key={comp.id}
                  onClick={() => setSelectedCompetitor(comp)}
                  className={cn(
                    "bg-white border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow",
                    selectedCompetitor?.id === comp.id && "ring-2 ring-[#047857]"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{comp.name}</h3>
                        {getThreatBadge(comp.threatLevel)}
                      </div>
                      <p className="text-sm text-gray-500">{comp.developer}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{comp.type}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{comp.distance} mi</span>
                    <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{comp.lotsRemaining} lots left</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500">Avg Price</p>
                      <p className="font-bold">${(comp.avgPrice / 1000).toFixed(0)}K</p>
                      <p className={cn("text-xs flex items-center justify-center gap-1", comp.priceChange > 0 ? "text-green-600" : "text-red-600")}>
                        {comp.priceChange > 0 ? '+' : ''}{comp.priceChange}%
                      </p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500">Absorption</p>
                      <p className="font-bold">{comp.monthlyAbsorption}/mo</p>
                      <p className="flex items-center justify-center">{getTrendIcon(comp.absorptionTrend)}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500">% Sold</p>
                      <p className="font-bold">{((comp.lotsSold / comp.totalLots) * 100).toFixed(0)}%</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {comp.amenities.slice(0, 3).map((a, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{a}</span>
                    ))}
                    {comp.amenities.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">+{comp.amenities.length - 3}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Competitor</th>
                    <th className="text-left px-4 py-3 font-medium">Type</th>
                    <th className="text-right px-4 py-3 font-medium">Distance</th>
                    <th className="text-right px-4 py-3 font-medium">Avg Price</th>
                    <th className="text-right px-4 py-3 font-medium">Absorption</th>
                    <th className="text-right px-4 py-3 font-medium">Lots Left</th>
                    <th className="text-center px-4 py-3 font-medium">Threat</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredCompetitors.map((comp) => (
                    <tr key={comp.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedCompetitor(comp)}>
                      <td className="px-4 py-3">
                        <p className="font-medium">{comp.name}</p>
                        <p className="text-xs text-gray-500">{comp.developer}</p>
                      </td>
                      <td className="px-4 py-3">{comp.type}</td>
                      <td className="px-4 py-3 text-right">{comp.distance} mi</td>
                      <td className="px-4 py-3 text-right font-medium">${comp.avgPrice.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">{comp.monthlyAbsorption}/mo</td>
                      <td className="px-4 py-3 text-right">{comp.lotsRemaining}</td>
                      <td className="px-4 py-3 text-center">{getThreatBadge(comp.threatLevel)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedCompetitor && viewMode === 'grid' && (
          <div className="w-96 border-l bg-white overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-lg">{selectedCompetitor.name}</h2>
                {getThreatBadge(selectedCompetitor.threatLevel)}
              </div>
              <p className="text-sm text-gray-500">{selectedCompetitor.developer}</p>
              <p className="text-xs text-gray-400 mt-1">Last updated: {selectedCompetitor.lastUpdated}</p>
            </div>

            <div className="p-4 border-b">
              <h3 className="font-semibold mb-3">Key Metrics</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">Total Lots</p>
                  <p className="font-bold">{selectedCompetitor.totalLots}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">Remaining</p>
                  <p className="font-bold">{selectedCompetitor.lotsRemaining}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">Avg Price</p>
                  <p className="font-bold">${selectedCompetitor.avgPrice.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">YoY Change</p>
                  <p className={cn("font-bold", selectedCompetitor.priceChange > 0 ? "text-green-600" : "text-red-600")}>
                    {selectedCompetitor.priceChange > 0 ? '+' : ''}{selectedCompetitor.priceChange}%
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border-b">
              <h3 className="font-semibold mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-1">
                {selectedCompetitor.amenities.map((a, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{a}</span>
                ))}
              </div>
            </div>

            <div className="p-4 border-b">
              <h3 className="font-semibold mb-3 text-green-700">Strengths</h3>
              <ul className="space-y-1">
                {selectedCompetitor.strengths.map((s, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>{s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 border-b">
              <h3 className="font-semibold mb-3 text-red-700">Weaknesses</h3>
              <ul className="space-y-1">
                {selectedCompetitor.weaknesses.map((w, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>{w}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4">
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-sm text-gray-600">{selectedCompetitor.notes}</p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1"><Edit2 className="w-4 h-4 mr-1" />Edit</Button>
                <Button variant="outline" size="sm" className="flex-1"><ExternalLink className="w-4 h-4 mr-1" />Website</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitionTrackerPage;
