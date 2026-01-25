import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';

// Demo comparable properties
const demoComparables = [
  {
    id: 'comp-001',
    address: '123 Main Street',
    city: 'Austin',
    state: 'TX',
    propertyType: 'multifamily',
    subType: 'Garden Style',
    units: 48,
    sqft: 52000,
    yearBuilt: 2018,
    salePrice: 8400000,
    pricePerUnit: 175000,
    pricePerSqft: 161.54,
    capRate: 5.2,
    saleDate: '2025-11-15',
    daysOnMarket: 45,
    condition: 'Excellent',
    amenities: ['Pool', 'Fitness Center', 'Covered Parking'],
    source: 'CoStar',
    notes: 'Recent sale, similar vintage and unit mix',
    isSubject: false
  },
  {
    id: 'comp-002',
    address: '456 Oak Avenue',
    city: 'Austin',
    state: 'TX',
    propertyType: 'multifamily',
    subType: 'Garden Style',
    units: 56,
    sqft: 58000,
    yearBuilt: 2016,
    salePrice: 9240000,
    pricePerUnit: 165000,
    pricePerSqft: 159.31,
    capRate: 5.5,
    saleDate: '2025-10-01',
    daysOnMarket: 62,
    condition: 'Good',
    amenities: ['Pool', 'Clubhouse', 'Dog Park'],
    source: 'LoopNet',
    notes: 'Slightly older but larger property',
    isSubject: false
  },
  {
    id: 'comp-003',
    address: '789 Elm Boulevard',
    city: 'Austin',
    state: 'TX',
    propertyType: 'multifamily',
    subType: 'Mid-Rise',
    units: 42,
    sqft: 48000,
    yearBuilt: 2020,
    salePrice: 8820000,
    pricePerUnit: 210000,
    pricePerSqft: 183.75,
    capRate: 4.8,
    saleDate: '2025-12-10',
    daysOnMarket: 30,
    condition: 'Excellent',
    amenities: ['Pool', 'Fitness Center', 'Rooftop Deck', 'EV Charging'],
    source: 'CoStar',
    notes: 'Premium finishes, higher rents',
    isSubject: false
  },
  {
    id: 'comp-004',
    address: '321 Cedar Lane',
    city: 'Round Rock',
    state: 'TX',
    propertyType: 'multifamily',
    subType: 'Garden Style',
    units: 64,
    sqft: 68000,
    yearBuilt: 2015,
    salePrice: 9600000,
    pricePerUnit: 150000,
    pricePerSqft: 141.18,
    capRate: 5.8,
    saleDate: '2025-09-15',
    daysOnMarket: 75,
    condition: 'Good',
    amenities: ['Pool', 'Playground', 'Laundry Facility'],
    source: 'Broker',
    notes: 'Suburban location, lower price point',
    isSubject: false
  },
  {
    id: 'comp-005',
    address: '555 Maple Drive',
    city: 'Austin',
    state: 'TX',
    propertyType: 'multifamily',
    subType: 'Garden Style',
    units: 52,
    sqft: 54000,
    yearBuilt: 2019,
    salePrice: 9360000,
    pricePerUnit: 180000,
    pricePerSqft: 173.33,
    capRate: 5.0,
    saleDate: '2025-08-20',
    daysOnMarket: 38,
    condition: 'Excellent',
    amenities: ['Pool', 'Fitness Center', 'Business Center'],
    source: 'CoStar',
    notes: 'Strong rental market, well maintained',
    isSubject: false
  }
];

// Demo subject property
const demoSubjectProperty = {
  id: 'subject-001',
  address: '200 Highland Park Drive',
  city: 'Austin',
  state: 'TX',
  propertyType: 'multifamily',
  subType: 'Garden Style',
  units: 50,
  sqft: 53000,
  yearBuilt: 2017,
  askingPrice: 8750000,
  estimatedValue: null,
  condition: 'Excellent',
  amenities: ['Pool', 'Fitness Center', 'Covered Parking', 'Pet Friendly'],
  isSubject: true
};

const propertyTypes = [
  { value: 'multifamily', label: 'Multifamily' },
  { value: 'office', label: 'Office' },
  { value: 'retail', label: 'Retail' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'land', label: 'Land' },
  { value: 'mixed-use', label: 'Mixed Use' }
];

const conditionOptions = ['Excellent', 'Good', 'Fair', 'Poor'];

export default function ComparativeMarketAnalysis() {
  const [comparables, setComparables] = useState([]);
  const [subjectProperty, setSubjectProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddCompModal, setShowAddCompModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [selectedComps, setSelectedComps] = useState(new Set());
  const [adjustments, setAdjustments] = useState({});
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    propertyType: 'multifamily',
    subType: '',
    units: '',
    sqft: '',
    yearBuilt: '',
    salePrice: '',
    capRate: '',
    saleDate: '',
    daysOnMarket: '',
    condition: 'Good',
    amenities: '',
    source: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      if (isDemoMode()) {
        setComparables(demoComparables);
        setSubjectProperty(demoSubjectProperty);
        setSelectedComps(new Set(demoComparables.map(c => c.id)));
        setLoading(false);
        return;
      }

      const [compsRes, subjectRes] = await Promise.all([
        supabase.from('cma_comparables').select('*').order('sale_date', { ascending: false }),
        supabase.from('cma_subjects').select('*').order('created_at', { ascending: false }).limit(1).single()
      ]);

      setComparables(compsRes.data || []);
      setSubjectProperty(subjectRes.data || null);
    } catch (error) {
      console.error('Error fetching CMA data:', error);
      setComparables(demoComparables);
      setSubjectProperty(demoSubjectProperty);
      setSelectedComps(new Set(demoComparables.map(c => c.id)));
    } finally {
      setLoading(false);
    }
  }

  const selectedComparables = useMemo(() => {
    return comparables.filter(c => selectedComps.has(c.id));
  }, [comparables, selectedComps]);

  const marketAnalysis = useMemo(() => {
    if (selectedComparables.length === 0) return null;

    const prices = selectedComparables.map(c => c.salePrice);
    const pricesPerUnit = selectedComparables.map(c => c.pricePerUnit);
    const pricesPerSqft = selectedComparables.map(c => c.pricePerSqft);
    const capRates = selectedComparables.map(c => c.capRate).filter(Boolean);
    const daysOnMarket = selectedComparables.map(c => c.daysOnMarket).filter(Boolean);

    const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
    const median = arr => {
      const sorted = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    };

    return {
      count: selectedComparables.length,
      avgPrice: avg(prices),
      medianPrice: median(prices),
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      avgPricePerUnit: avg(pricesPerUnit),
      medianPricePerUnit: median(pricesPerUnit),
      avgPricePerSqft: avg(pricesPerSqft),
      medianPricePerSqft: median(pricesPerSqft),
      avgCapRate: capRates.length > 0 ? avg(capRates) : null,
      avgDaysOnMarket: daysOnMarket.length > 0 ? avg(daysOnMarket) : null
    };
  }, [selectedComparables]);

  const estimatedValue = useMemo(() => {
    if (!subjectProperty || !marketAnalysis) return null;

    // Calculate based on price per unit and price per sqft
    const valueByUnits = marketAnalysis.avgPricePerUnit * subjectProperty.units;
    const valueBySqft = marketAnalysis.avgPricePerSqft * subjectProperty.sqft;

    // Weighted average (60% units, 40% sqft for multifamily)
    const baseValue = (valueByUnits * 0.6) + (valueBySqft * 0.4);

    // Apply adjustments
    let adjustedValue = baseValue;
    Object.values(adjustments).forEach(adj => {
      adjustedValue += adj;
    });

    return {
      baseValue,
      adjustedValue,
      valueByUnits,
      valueBySqft
    };
  }, [subjectProperty, marketAnalysis, adjustments]);

  function formatCurrency(value) {
    if (!value) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  function formatNumber(value, decimals = 0) {
    if (!value) return '-';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  }

  function toggleComp(compId) {
    setSelectedComps(prev => {
      const next = new Set(prev);
      if (next.has(compId)) {
        next.delete(compId);
      } else {
        next.add(compId);
      }
      return next;
    });
  }

  async function handleAddComparable(e) {
    e.preventDefault();

    const pricePerUnit = formData.units ? parseFloat(formData.salePrice) / parseInt(formData.units) : 0;
    const pricePerSqft = formData.sqft ? parseFloat(formData.salePrice) / parseInt(formData.sqft) : 0;

    if (isDemoMode()) {
      const newComp = {
        id: `comp-${Date.now()}`,
        ...formData,
        units: parseInt(formData.units) || 0,
        sqft: parseInt(formData.sqft) || 0,
        yearBuilt: parseInt(formData.yearBuilt) || 0,
        salePrice: parseFloat(formData.salePrice) || 0,
        pricePerUnit,
        pricePerSqft,
        capRate: parseFloat(formData.capRate) || 0,
        daysOnMarket: parseInt(formData.daysOnMarket) || 0,
        amenities: formData.amenities.split(',').map(a => a.trim()).filter(Boolean),
        isSubject: false
      };
      setComparables(prev => [newComp, ...prev]);
      setSelectedComps(prev => new Set([...prev, newComp.id]));
      setShowAddCompModal(false);
      resetForm();
      return;
    }

    try {
      const { error } = await supabase.from('cma_comparables').insert({
        address: formData.address,
        city: formData.city,
        state: formData.state,
        property_type: formData.propertyType,
        sub_type: formData.subType,
        units: parseInt(formData.units) || 0,
        sqft: parseInt(formData.sqft) || 0,
        year_built: parseInt(formData.yearBuilt) || 0,
        sale_price: parseFloat(formData.salePrice) || 0,
        price_per_unit: pricePerUnit,
        price_per_sqft: pricePerSqft,
        cap_rate: parseFloat(formData.capRate) || 0,
        sale_date: formData.saleDate,
        days_on_market: parseInt(formData.daysOnMarket) || 0,
        condition: formData.condition,
        amenities: formData.amenities.split(',').map(a => a.trim()).filter(Boolean),
        source: formData.source,
        notes: formData.notes
      });

      if (error) throw error;
      fetchData();
      setShowAddCompModal(false);
      resetForm();
    } catch (error) {
      console.error('Error adding comparable:', error);
    }
  }

  function resetForm() {
    setFormData({
      address: '',
      city: '',
      state: '',
      propertyType: 'multifamily',
      subType: '',
      units: '',
      sqft: '',
      yearBuilt: '',
      salePrice: '',
      capRate: '',
      saleDate: '',
      daysOnMarket: '',
      condition: 'Good',
      amenities: '',
      source: '',
      notes: ''
    });
  }

  async function deleteComparable(comp) {
    if (!confirm(`Remove "${comp.address}" from comparables?`)) return;

    if (isDemoMode()) {
      setComparables(prev => prev.filter(c => c.id !== comp.id));
      setSelectedComps(prev => {
        const next = new Set(prev);
        next.delete(comp.id);
        return next;
      });
      return;
    }

    try {
      const { error } = await supabase.from('cma_comparables').delete().eq('id', comp.id);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error deleting comparable:', error);
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comparative Market Analysis</h1>
          <p className="text-gray-600 mt-1">Analyze property values using market comparables</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSubjectModal(true)}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
          >
            {subjectProperty ? 'Edit Subject' : 'Set Subject Property'}
          </button>
          <button
            onClick={() => setShowAddCompModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <span>+</span>
            <span>Add Comparable</span>
          </button>
        </div>
      </div>

      {/* Subject Property Card */}
      {subjectProperty && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm opacity-80 uppercase tracking-wide">Subject Property</div>
              <h2 className="text-xl font-bold mt-1">{subjectProperty.address}</h2>
              <p className="text-blue-100">{subjectProperty.city}, {subjectProperty.state}</p>
            </div>
            {estimatedValue && (
              <div className="text-right">
                <div className="text-sm opacity-80">Estimated Value</div>
                <div className="text-3xl font-bold">{formatCurrency(estimatedValue.adjustedValue)}</div>
                {subjectProperty.askingPrice && (
                  <div className="text-sm opacity-80">
                    Asking: {formatCurrency(subjectProperty.askingPrice)}
                    <span className="ml-2">
                      ({((estimatedValue.adjustedValue - subjectProperty.askingPrice) / subjectProperty.askingPrice * 100).toFixed(1)}%)
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-4 border-t border-blue-500">
            <div>
              <div className="text-sm opacity-80">Type</div>
              <div className="font-medium capitalize">{subjectProperty.propertyType}</div>
            </div>
            <div>
              <div className="text-sm opacity-80">Units</div>
              <div className="font-medium">{subjectProperty.units}</div>
            </div>
            <div>
              <div className="text-sm opacity-80">Sq Ft</div>
              <div className="font-medium">{formatNumber(subjectProperty.sqft)}</div>
            </div>
            <div>
              <div className="text-sm opacity-80">Year Built</div>
              <div className="font-medium">{subjectProperty.yearBuilt}</div>
            </div>
            <div>
              <div className="text-sm opacity-80">Condition</div>
              <div className="font-medium">{subjectProperty.condition}</div>
            </div>
          </div>
        </div>
      )}

      {/* Market Analysis Summary */}
      {marketAnalysis && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Analysis Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 uppercase">Comps Used</div>
              <div className="text-xl font-bold text-gray-900">{marketAnalysis.count}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 uppercase">Avg Price</div>
              <div className="text-xl font-bold text-gray-900">{formatCurrency(marketAnalysis.avgPrice)}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 uppercase">Avg $/Unit</div>
              <div className="text-xl font-bold text-green-600">{formatCurrency(marketAnalysis.avgPricePerUnit)}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 uppercase">Avg $/SF</div>
              <div className="text-xl font-bold text-blue-600">{formatCurrency(marketAnalysis.avgPricePerSqft)}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 uppercase">Avg Cap Rate</div>
              <div className="text-xl font-bold text-purple-600">
                {marketAnalysis.avgCapRate ? `${marketAnalysis.avgCapRate.toFixed(2)}%` : '-'}
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 uppercase">Avg DOM</div>
              <div className="text-xl font-bold text-orange-600">
                {marketAnalysis.avgDaysOnMarket ? `${Math.round(marketAnalysis.avgDaysOnMarket)} days` : '-'}
              </div>
            </div>
          </div>

          {/* Value Range */}
          {estimatedValue && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Estimated Value Range</span>
                <span className="font-medium">
                  {formatCurrency(marketAnalysis.minPrice * (subjectProperty.units / 50))} - {formatCurrency(marketAnalysis.maxPrice * (subjectProperty.units / 50))}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                  style={{
                    width: `${Math.min(100, ((estimatedValue.adjustedValue - marketAnalysis.minPrice) / (marketAnalysis.maxPrice - marketAnalysis.minPrice)) * 100)}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Comparables Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Comparable Properties</h3>
          <p className="text-sm text-gray-600">Select comparables to include in your analysis</p>
        </div>

        {comparables.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="text-4xl mb-4">🏢</div>
            <p>No comparables added yet</p>
            <button
              onClick={() => setShowAddCompModal(true)}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Add your first comparable
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Include</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sq Ft</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">$/Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">$/SF</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cap Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale Date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {comparables.map(comp => (
                  <tr key={comp.id} className={`hover:bg-gray-50 ${selectedComps.has(comp.id) ? 'bg-blue-50' : ''}`}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedComps.has(comp.id)}
                        onChange={() => toggleComp(comp.id)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{comp.address}</div>
                      <div className="text-sm text-gray-500">{comp.city}, {comp.state}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{comp.units}</td>
                    <td className="px-4 py-3 text-gray-900">{formatNumber(comp.sqft)}</td>
                    <td className="px-4 py-3 text-gray-900">{comp.yearBuilt}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(comp.salePrice)}</td>
                    <td className="px-4 py-3 text-green-600 font-medium">{formatCurrency(comp.pricePerUnit)}</td>
                    <td className="px-4 py-3 text-blue-600 font-medium">{formatCurrency(comp.pricePerSqft)}</td>
                    <td className="px-4 py-3 text-purple-600">{comp.capRate ? `${comp.capRate}%` : '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(comp.saleDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => deleteComparable(comp)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Remove"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjustments Section */}
      {selectedComparables.length > 0 && subjectProperty && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Value Adjustments</h3>
          <p className="text-sm text-gray-600 mb-4">Apply adjustments to account for differences between subject and comparables</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location Adjustment
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={adjustments.location || ''}
                  onChange={(e) => setAdjustments(prev => ({ ...prev, location: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">$</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condition Adjustment
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={adjustments.condition || ''}
                  onChange={(e) => setAdjustments(prev => ({ ...prev, condition: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">$</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amenities Adjustment
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={adjustments.amenities || ''}
                  onChange={(e) => setAdjustments(prev => ({ ...prev, amenities: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">$</span>
              </div>
            </div>
          </div>

          {estimatedValue && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-600">Base Value (from comps)</div>
                  <div className="text-lg font-medium">{formatCurrency(estimatedValue.baseValue)}</div>
                </div>
                <div className="text-2xl text-gray-400">→</div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Adjusted Value</div>
                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(estimatedValue.adjustedValue)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Comparable Modal */}
      {showAddCompModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Add Comparable Property</h2>
            </div>

            <form onSubmit={handleAddComparable} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Units *</label>
                  <input
                    type="number"
                    required
                    value={formData.units}
                    onChange={(e) => setFormData(prev => ({ ...prev, units: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sq Ft *</label>
                  <input
                    type="number"
                    required
                    value={formData.sqft}
                    onChange={(e) => setFormData(prev => ({ ...prev, sqft: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
                  <input
                    type="number"
                    value={formData.yearBuilt}
                    onChange={(e) => setFormData(prev => ({ ...prev, yearBuilt: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price *</label>
                  <input
                    type="number"
                    required
                    value={formData.salePrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, salePrice: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cap Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.capRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, capRate: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sale Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.saleDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, saleDate: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {conditionOptions.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                    placeholder="e.g., CoStar, LoopNet, Broker"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => { setShowAddCompModal(false); resetForm(); }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Comparable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Property Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Subject Property</h2>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                The subject property is set from your active project or opportunity. Go to the project details page to update the property information.
              </p>

              {subjectProperty && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="font-medium text-blue-900">{subjectProperty.address}</div>
                  <div className="text-sm text-blue-700">{subjectProperty.city}, {subjectProperty.state}</div>
                  <div className="mt-2 text-sm text-blue-600">
                    {subjectProperty.units} units | {formatNumber(subjectProperty.sqft)} SF | Built {subjectProperty.yearBuilt}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
