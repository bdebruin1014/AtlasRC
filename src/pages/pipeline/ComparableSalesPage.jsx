import React, { useState } from 'react';
import { MapPin, DollarSign, Calendar, TrendingUp, TrendingDown, Filter, Download, Plus, Search, Building2, Ruler, Clock, ExternalLink, ChevronDown, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const ComparableSalesPage = () => {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [searchRadius, setSearchRadius] = useState('5');
  const [timeframe, setTimeframe] = useState('12');
  const [propertyType, setPropertyType] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const subjectProperty = {
    name: 'Sunset Ridge Phase 3',
    address: '1234 Development Way, New Braunfels, TX 78130',
    acres: 45.2,
    askingPrice: 2850000,
    pricePerAcre: 63053,
    zoning: 'Residential PUD',
    type: 'Land - Development',
  };

  const comparableSales = [
    {
      id: 'comp-1',
      address: '5678 Ranch Road, New Braunfels, TX',
      saleDate: '2024-11-15',
      salePrice: 2450000,
      acres: 38.5,
      pricePerAcre: 63636,
      zoning: 'Residential PUD',
      type: 'Land - Development',
      distance: 1.2,
      daysOnMarket: 45,
      buyer: 'Meritage Homes',
      adjustedPrice: 2520000,
      adjustments: [
        { factor: 'Size', adjustment: -3 },
        { factor: 'Location', adjustment: +2 },
        { factor: 'Zoning', adjustment: 0 },
        { factor: 'Time', adjustment: +4 },
      ],
    },
    {
      id: 'comp-2',
      address: '9012 Hill Country Blvd, San Marcos, TX',
      saleDate: '2024-10-22',
      salePrice: 3100000,
      acres: 52.0,
      pricePerAcre: 59615,
      zoning: 'Agricultural/Residential',
      type: 'Land - Development',
      distance: 3.5,
      daysOnMarket: 78,
      buyer: 'Taylor Morrison',
      adjustedPrice: 2980000,
      adjustments: [
        { factor: 'Size', adjustment: +5 },
        { factor: 'Location', adjustment: -3 },
        { factor: 'Zoning', adjustment: -2 },
        { factor: 'Time', adjustment: +6 },
      ],
    },
    {
      id: 'comp-3',
      address: '3456 Gruene Road, New Braunfels, TX',
      saleDate: '2024-09-08',
      salePrice: 1850000,
      acres: 28.0,
      pricePerAcre: 66071,
      zoning: 'Residential PUD',
      type: 'Land - Development',
      distance: 2.1,
      daysOnMarket: 32,
      buyer: 'DR Horton',
      adjustedPrice: 2150000,
      adjustments: [
        { factor: 'Size', adjustment: -8 },
        { factor: 'Location', adjustment: +3 },
        { factor: 'Zoning', adjustment: 0 },
        { factor: 'Time', adjustment: +8 },
      ],
    },
    {
      id: 'comp-4',
      address: '7890 FM 306, Canyon Lake, TX',
      saleDate: '2024-08-15',
      salePrice: 2200000,
      acres: 42.0,
      pricePerAcre: 52381,
      zoning: 'Agricultural',
      type: 'Land - Development',
      distance: 4.8,
      daysOnMarket: 95,
      buyer: 'Private Investor',
      adjustedPrice: 2450000,
      adjustments: [
        { factor: 'Size', adjustment: -2 },
        { factor: 'Location', adjustment: -5 },
        { factor: 'Zoning', adjustment: -4 },
        { factor: 'Time', adjustment: +10 },
      ],
    },
    {
      id: 'comp-5',
      address: '2345 River Road, New Braunfels, TX',
      saleDate: '2024-07-20',
      salePrice: 3500000,
      acres: 48.5,
      pricePerAcre: 72165,
      zoning: 'Residential PUD',
      type: 'Land - Development',
      distance: 1.8,
      daysOnMarket: 28,
      buyer: 'Lennar Corporation',
      adjustedPrice: 3200000,
      adjustments: [
        { factor: 'Size', adjustment: +2 },
        { factor: 'Location', adjustment: +5 },
        { factor: 'Zoning', adjustment: 0 },
        { factor: 'Time', adjustment: +12 },
      ],
    },
  ];

  const stats = {
    avgPricePerAcre: comparableSales.reduce((s, c) => s + c.pricePerAcre, 0) / comparableSales.length,
    avgAdjustedPricePerAcre: comparableSales.reduce((s, c) => s + (c.adjustedPrice / c.acres), 0) / comparableSales.length,
    medianDaysOnMarket: [...comparableSales].sort((a, b) => a.daysOnMarket - b.daysOnMarket)[Math.floor(comparableSales.length / 2)].daysOnMarket,
    priceRange: {
      low: Math.min(...comparableSales.map(c => c.pricePerAcre)),
      high: Math.max(...comparableSales.map(c => c.pricePerAcre)),
    },
  };

  const sortedComps = [...comparableSales].sort((a, b) => {
    if (sortBy === 'date') return new Date(b.saleDate) - new Date(a.saleDate);
    if (sortBy === 'price') return b.salePrice - a.salePrice;
    if (sortBy === 'distance') return a.distance - b.distance;
    if (sortBy === 'pricePerAcre') return b.pricePerAcre - a.pricePerAcre;
    return 0;
  });

  const estimatedValue = comparableSales.reduce((s, c) => s + c.adjustedPrice, 0) / comparableSales.length;
  const valueVsAsking = ((subjectProperty.askingPrice - estimatedValue) / estimatedValue * 100);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Comparable Sales Analysis</h1>
            <p className="text-sm text-gray-500">Market comparisons for {subjectProperty.name}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-1" />Add Comp</Button>
            <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export Report</Button>
          </div>
        </div>

        {/* Subject Property Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-blue-600 uppercase">Subject Property</span>
              <h2 className="font-semibold text-lg">{subjectProperty.name}</h2>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <MapPin className="w-4 h-4" />{subjectProperty.address}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-700">${(subjectProperty.askingPrice / 1000000).toFixed(2)}M</p>
              <p className="text-sm text-gray-500">${subjectProperty.pricePerAcre.toLocaleString()}/acre</p>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-3 text-sm">
            <span className="flex items-center gap-1"><Ruler className="w-4 h-4 text-gray-400" />{subjectProperty.acres} acres</span>
            <span className="flex items-center gap-1"><Building2 className="w-4 h-4 text-gray-400" />{subjectProperty.zoning}</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{subjectProperty.type}</span>
          </div>
        </div>

        {/* Analysis Summary */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Estimated Value</p>
            <p className="text-xl font-bold text-green-700">${(estimatedValue / 1000000).toFixed(2)}M</p>
          </div>
          <div className={cn("rounded-lg p-3 text-center", valueVsAsking > 0 ? "bg-red-50" : "bg-green-50")}>
            <p className="text-xs text-gray-500">Asking vs Value</p>
            <p className={cn("text-xl font-bold flex items-center justify-center gap-1", valueVsAsking > 0 ? "text-red-700" : "text-green-700")}>
              {valueVsAsking > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {valueVsAsking > 0 ? '+' : ''}{valueVsAsking.toFixed(1)}%
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Avg $/Acre (Adjusted)</p>
            <p className="text-xl font-bold text-purple-700">${stats.avgAdjustedPricePerAcre.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Price Range/Acre</p>
            <p className="text-sm font-bold text-amber-700">${stats.priceRange.low.toLocaleString()} - ${stats.priceRange.high.toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Median Days on Market</p>
            <p className="text-xl font-bold text-gray-700">{stats.medianDaysOnMarket}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Radius:</span>
          <select className="border rounded-md px-2 py-1 text-sm" value={searchRadius} onChange={(e) => setSearchRadius(e.target.value)}>
            <option value="1">1 mile</option>
            <option value="3">3 miles</option>
            <option value="5">5 miles</option>
            <option value="10">10 miles</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Timeframe:</span>
          <select className="border rounded-md px-2 py-1 text-sm" value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
            <option value="6">6 months</option>
            <option value="12">12 months</option>
            <option value="24">24 months</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Type:</span>
          <select className="border rounded-md px-2 py-1 text-sm" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="land">Land</option>
            <option value="lots">Finished Lots</option>
          </select>
        </div>
        <div className="flex-1" />
        <span className="text-sm text-gray-600">Sort:</span>
        <div className="flex gap-1">
          {['date', 'price', 'distance', 'pricePerAcre'].map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              className={cn(
                "px-2 py-1 rounded text-xs capitalize",
                sortBy === option ? "bg-gray-200 font-medium" : "hover:bg-gray-100"
              )}
            >
              {option === 'pricePerAcre' ? '$/Acre' : option}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Comparables List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {sortedComps.map((comp, idx) => (
              <div
                key={comp.id}
                onClick={() => setSelectedProperty(comp)}
                className={cn(
                  "bg-white border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow",
                  selectedProperty?.id === comp.id && "ring-2 ring-[#047857]"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                        {idx + 1}
                      </span>
                      <h3 className="font-semibold">{comp.address}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{comp.saleDate}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{comp.distance} mi</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{comp.daysOnMarket} DOM</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">${(comp.salePrice / 1000000).toFixed(2)}M</p>
                    <p className="text-sm text-gray-500">${comp.pricePerAcre.toLocaleString()}/acre</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span><strong>{comp.acres}</strong> acres</span>
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{comp.zoning}</span>
                    <span className="text-gray-500">Buyer: {comp.buyer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Adjusted:</span>
                    <span className="font-bold text-green-600">${(comp.adjustedPrice / 1000000).toFixed(2)}M</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        {selectedProperty && (
          <div className="w-96 border-l bg-white overflow-y-auto">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-lg mb-1">{selectedProperty.address}</h2>
              <p className="text-sm text-gray-500">Sold: {selectedProperty.saleDate}</p>
            </div>

            {/* Key Metrics */}
            <div className="p-4 border-b">
              <h3 className="font-semibold mb-3">Sale Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Sale Price</p>
                  <p className="font-bold">${selectedProperty.salePrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Price/Acre</p>
                  <p className="font-bold">${selectedProperty.pricePerAcre.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Acreage</p>
                  <p className="font-bold">{selectedProperty.acres} acres</p>
                </div>
                <div>
                  <p className="text-gray-500">Days on Market</p>
                  <p className="font-bold">{selectedProperty.daysOnMarket}</p>
                </div>
                <div>
                  <p className="text-gray-500">Zoning</p>
                  <p className="font-bold">{selectedProperty.zoning}</p>
                </div>
                <div>
                  <p className="text-gray-500">Buyer</p>
                  <p className="font-bold">{selectedProperty.buyer}</p>
                </div>
              </div>
            </div>

            {/* Adjustments */}
            <div className="p-4 border-b">
              <h3 className="font-semibold mb-3">Price Adjustments</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500">
                    <th className="text-left pb-2">Factor</th>
                    <th className="text-right pb-2">Adjustment</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProperty.adjustments.map((adj, idx) => (
                    <tr key={idx}>
                      <td className="py-1">{adj.factor}</td>
                      <td className={cn("py-1 text-right font-medium", adj.adjustment > 0 ? "text-green-600" : adj.adjustment < 0 ? "text-red-600" : "text-gray-500")}>
                        {adj.adjustment > 0 ? '+' : ''}{adj.adjustment}%
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t">
                  <tr>
                    <td className="pt-2 font-semibold">Adjusted Price</td>
                    <td className="pt-2 text-right font-bold text-green-600">${selectedProperty.adjustedPrice.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Comparison to Subject */}
            <div className="p-4 border-b">
              <h3 className="font-semibold mb-3">vs Subject Property</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Size Difference</span>
                  <span className={cn("font-medium", selectedProperty.acres > subjectProperty.acres ? "text-green-600" : "text-red-600")}>
                    {selectedProperty.acres > subjectProperty.acres ? '+' : ''}{(selectedProperty.acres - subjectProperty.acres).toFixed(1)} acres
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Price/Acre Difference</span>
                  <span className={cn("font-medium", selectedProperty.pricePerAcre < subjectProperty.pricePerAcre ? "text-green-600" : "text-red-600")}>
                    {selectedProperty.pricePerAcre < subjectProperty.pricePerAcre ? '-' : '+'}${Math.abs(selectedProperty.pricePerAcre - subjectProperty.pricePerAcre).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4">
              <Button variant="outline" className="w-full mb-2">
                <ExternalLink className="w-4 h-4 mr-1" />View on Map
              </Button>
              <Button variant="outline" className="w-full">Edit Adjustments</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparableSalesPage;
