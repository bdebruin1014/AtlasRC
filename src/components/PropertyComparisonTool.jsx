import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';

// Demo properties for comparison
const demoProperties = [
  {
    id: 'prop-001',
    name: 'Highland Park Development',
    type: 'Multifamily',
    address: '200 Highland Park Drive',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    status: 'In Development',

    // Physical Characteristics
    units: 50,
    sqft: 53000,
    lotSize: 2.5,
    yearBuilt: 2017,
    stories: 3,
    parking: 75,
    amenities: ['Pool', 'Fitness Center', 'Covered Parking', 'Pet Friendly'],

    // Financial Metrics
    purchasePrice: 8750000,
    currentValue: 9200000,
    pricePerUnit: 175000,
    pricePerSqft: 165,
    noi: 520000,
    capRate: 5.65,
    cashOnCash: 8.2,
    irr: 15.5,

    // Rental Info
    avgRent: 1450,
    occupancy: 94,
    monthlyRevenue: 68150,
    annualRevenue: 817800,

    // Operating
    operatingExpenses: 297800,
    expenseRatio: 36.4,
    taxes: 87500,
    insurance: 24000,

    // Debt
    loanAmount: 6562500,
    ltv: 75,
    interestRate: 5.25,
    debtService: 435000,
    dscr: 1.20
  },
  {
    id: 'prop-002',
    name: 'Riverside Commons',
    type: 'Multifamily',
    address: '450 River Road',
    city: 'Austin',
    state: 'TX',
    zip: '78702',
    status: 'Under Contract',

    units: 72,
    sqft: 76000,
    lotSize: 3.2,
    yearBuilt: 2020,
    stories: 4,
    parking: 108,
    amenities: ['Pool', 'Clubhouse', 'Dog Park', 'EV Charging', 'Rooftop Deck'],

    purchasePrice: 12500000,
    currentValue: 12500000,
    pricePerUnit: 173611,
    pricePerSqft: 164,
    noi: 725000,
    capRate: 5.8,
    cashOnCash: 9.1,
    irr: 17.2,

    avgRent: 1625,
    occupancy: 96,
    monthlyRevenue: 112320,
    annualRevenue: 1347840,

    operatingExpenses: 485000,
    expenseRatio: 36.0,
    taxes: 125000,
    insurance: 32000,

    loanAmount: 9375000,
    ltv: 75,
    interestRate: 5.0,
    debtService: 604000,
    dscr: 1.20
  },
  {
    id: 'prop-003',
    name: 'Maple Grove Apartments',
    type: 'Multifamily',
    address: '555 Maple Drive',
    city: 'Cedar Park',
    state: 'TX',
    zip: '78613',
    status: 'Stabilized',

    units: 52,
    sqft: 54000,
    lotSize: 2.8,
    yearBuilt: 2019,
    stories: 3,
    parking: 78,
    amenities: ['Pool', 'Fitness Center', 'Business Center', 'Package Lockers'],

    purchasePrice: 9360000,
    currentValue: 9800000,
    pricePerUnit: 180000,
    pricePerSqft: 173,
    noi: 468000,
    capRate: 5.0,
    cashOnCash: 7.8,
    irr: 14.2,

    avgRent: 1525,
    occupancy: 95,
    monthlyRevenue: 75235,
    annualRevenue: 902820,

    operatingExpenses: 343000,
    expenseRatio: 38.0,
    taxes: 93600,
    insurance: 28000,

    loanAmount: 7020000,
    ltv: 75,
    interestRate: 5.5,
    debtService: 478000,
    dscr: 0.98
  },
  {
    id: 'prop-004',
    name: 'Oak Street Townhomes',
    type: 'Townhomes',
    address: '789 Oak Street',
    city: 'Round Rock',
    state: 'TX',
    zip: '78664',
    status: 'Prospecting',

    units: 16,
    sqft: 24000,
    lotSize: 1.5,
    yearBuilt: 2015,
    stories: 2,
    parking: 32,
    amenities: ['Private Yards', 'Garage', 'Community Pool'],

    purchasePrice: 3200000,
    currentValue: 3400000,
    pricePerUnit: 200000,
    pricePerSqft: 133,
    noi: 192000,
    capRate: 6.0,
    cashOnCash: 10.5,
    irr: 18.0,

    avgRent: 1800,
    occupancy: 100,
    monthlyRevenue: 28800,
    annualRevenue: 345600,

    operatingExpenses: 103600,
    expenseRatio: 30.0,
    taxes: 32000,
    insurance: 12000,

    loanAmount: 2400000,
    ltv: 75,
    interestRate: 5.75,
    debtService: 168000,
    dscr: 1.14
  },
  {
    id: 'prop-005',
    name: 'Commerce Park Office',
    type: 'Office',
    address: '100 Commerce Blvd',
    city: 'Austin',
    state: 'TX',
    zip: '78758',
    status: 'Due Diligence',

    units: null,
    sqft: 45000,
    lotSize: 2.0,
    yearBuilt: 2012,
    stories: 3,
    parking: 180,
    amenities: ['Conference Center', 'Fitness Room', 'Cafeteria', 'Covered Parking'],

    purchasePrice: 5800000,
    currentValue: 5800000,
    pricePerUnit: null,
    pricePerSqft: 129,
    noi: 406000,
    capRate: 7.0,
    cashOnCash: 11.2,
    irr: 16.5,

    avgRent: null,
    occupancy: 88,
    monthlyRevenue: 52800,
    annualRevenue: 633600,

    operatingExpenses: 227600,
    expenseRatio: 35.9,
    taxes: 58000,
    insurance: 18000,

    loanAmount: 4350000,
    ltv: 75,
    interestRate: 5.5,
    debtService: 296000,
    dscr: 1.37
  }
];

const comparisonCategories = [
  {
    name: 'Overview',
    fields: [
      { key: 'type', label: 'Property Type', format: 'text' },
      { key: 'status', label: 'Status', format: 'text' },
      { key: 'address', label: 'Address', format: 'address' },
      { key: 'yearBuilt', label: 'Year Built', format: 'number' }
    ]
  },
  {
    name: 'Physical',
    fields: [
      { key: 'units', label: 'Units', format: 'number' },
      { key: 'sqft', label: 'Square Feet', format: 'number' },
      { key: 'lotSize', label: 'Lot Size (Acres)', format: 'decimal' },
      { key: 'stories', label: 'Stories', format: 'number' },
      { key: 'parking', label: 'Parking Spaces', format: 'number' }
    ]
  },
  {
    name: 'Financials',
    fields: [
      { key: 'purchasePrice', label: 'Purchase Price', format: 'currency' },
      { key: 'currentValue', label: 'Current Value', format: 'currency' },
      { key: 'pricePerUnit', label: 'Price/Unit', format: 'currency' },
      { key: 'pricePerSqft', label: 'Price/SF', format: 'currency' },
      { key: 'noi', label: 'NOI', format: 'currency' },
      { key: 'capRate', label: 'Cap Rate', format: 'percent' }
    ]
  },
  {
    name: 'Returns',
    fields: [
      { key: 'cashOnCash', label: 'Cash on Cash', format: 'percent' },
      { key: 'irr', label: 'IRR', format: 'percent' },
      { key: 'dscr', label: 'DSCR', format: 'decimal' }
    ]
  },
  {
    name: 'Revenue',
    fields: [
      { key: 'avgRent', label: 'Avg Rent', format: 'currency' },
      { key: 'occupancy', label: 'Occupancy', format: 'percent' },
      { key: 'monthlyRevenue', label: 'Monthly Revenue', format: 'currency' },
      { key: 'annualRevenue', label: 'Annual Revenue', format: 'currency' }
    ]
  },
  {
    name: 'Expenses',
    fields: [
      { key: 'operatingExpenses', label: 'Operating Expenses', format: 'currency' },
      { key: 'expenseRatio', label: 'Expense Ratio', format: 'percent' },
      { key: 'taxes', label: 'Taxes', format: 'currency' },
      { key: 'insurance', label: 'Insurance', format: 'currency' }
    ]
  },
  {
    name: 'Debt',
    fields: [
      { key: 'loanAmount', label: 'Loan Amount', format: 'currency' },
      { key: 'ltv', label: 'LTV', format: 'percent' },
      { key: 'interestRate', label: 'Interest Rate', format: 'percent' },
      { key: 'debtService', label: 'Annual Debt Service', format: 'currency' }
    ]
  }
];

export default function PropertyComparisonTool() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Overview');
  const [highlightBest, setHighlightBest] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    try {
      if (isDemoMode()) {
        setProperties(demoProperties);
        setSelectedProperties(demoProperties.slice(0, 3).map(p => p.id));
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('name');

      if (error) throw error;
      setProperties(data || demoProperties);
      if (data && data.length >= 2) {
        setSelectedProperties(data.slice(0, 3).map(p => p.id));
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties(demoProperties);
      setSelectedProperties(demoProperties.slice(0, 3).map(p => p.id));
    } finally {
      setLoading(false);
    }
  }

  const comparisonProperties = useMemo(() => {
    return properties.filter(p => selectedProperties.includes(p.id));
  }, [properties, selectedProperties]);

  function formatValue(value, format) {
    if (value === null || value === undefined) return '-';

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
      case 'percent':
        return `${value.toFixed(1)}%`;
      case 'decimal':
        return value.toFixed(2);
      case 'number':
        return new Intl.NumberFormat('en-US').format(value);
      case 'address':
        return value;
      default:
        return value;
    }
  }

  function getBestValue(field, values) {
    const numericValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));
    if (numericValues.length === 0) return null;

    // For expense-related fields, lower is better
    const lowerIsBetter = ['operatingExpenses', 'expenseRatio', 'taxes', 'insurance', 'interestRate', 'ltv', 'debtService'];

    if (lowerIsBetter.includes(field)) {
      return Math.min(...numericValues);
    }
    return Math.max(...numericValues);
  }

  function toggleProperty(propertyId) {
    setSelectedProperties(prev => {
      if (prev.includes(propertyId)) {
        return prev.filter(id => id !== propertyId);
      }
      if (prev.length >= 4) {
        return prev; // Max 4 properties
      }
      return [...prev, propertyId];
    });
  }

  function clearSelection() {
    setSelectedProperties([]);
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
          <h1 className="text-2xl font-bold text-gray-900">Property Comparison Tool</h1>
          <p className="text-gray-600 mt-1">Compare properties side-by-side with key metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={highlightBest}
              onChange={(e) => setHighlightBest(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-gray-700">Highlight best values</span>
          </label>
          {selectedProperties.length > 0 && (
            <button
              onClick={clearSelection}
              className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
            >
              Clear Selection
            </button>
          )}
        </div>
      </div>

      {/* Property Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-medium text-gray-900 mb-3">Select Properties to Compare (max 4)</h3>
        <div className="flex flex-wrap gap-2">
          {properties.map(property => (
            <button
              key={property.id}
              onClick={() => toggleProperty(property.id)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                selectedProperties.includes(property.id)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              {property.name}
            </button>
          ))}
        </div>
      </div>

      {comparisonProperties.length < 2 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          <div className="text-4xl mb-4">🏢</div>
          <p>Select at least 2 properties to compare</p>
        </div>
      ) : (
        <>
          {/* Category Tabs */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b overflow-x-auto">
              <div className="flex">
                {comparisonCategories.map(category => (
                  <button
                    key={category.name}
                    onClick={() => setActiveCategory(category.name)}
                    className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${
                      activeCategory === category.name
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 w-48">
                      Metric
                    </th>
                    {comparisonProperties.map(property => (
                      <th key={property.id} className="px-6 py-4 text-center">
                        <div className="font-semibold text-gray-900">{property.name}</div>
                        <div className="text-sm text-gray-500 font-normal">{property.type}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {comparisonCategories
                    .find(c => c.name === activeCategory)
                    ?.fields.map(field => {
                      const values = comparisonProperties.map(p => p[field.key]);
                      const bestValue = getBestValue(field.key, values);

                      return (
                        <tr key={field.key} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-700">
                            {field.label}
                          </td>
                          {comparisonProperties.map(property => {
                            const value = property[field.key];
                            const isBest = highlightBest &&
                              value !== null &&
                              value !== undefined &&
                              value === bestValue &&
                              !['text', 'address'].includes(field.format);

                            return (
                              <td
                                key={property.id}
                                className={`px-6 py-4 text-center text-sm ${
                                  isBest ? 'bg-green-50 font-semibold text-green-700' : 'text-gray-900'
                                }`}
                              >
                                {formatValue(value, field.format)}
                                {isBest && <span className="ml-1 text-green-500">★</span>}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}

                  {/* Amenities Row (for Overview) */}
                  {activeCategory === 'Overview' && (
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">Amenities</td>
                      {comparisonProperties.map(property => (
                        <td key={property.id} className="px-6 py-4">
                          <div className="flex flex-wrap justify-center gap-1">
                            {property.amenities?.slice(0, 4).map((amenity, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                              >
                                {amenity}
                              </span>
                            ))}
                            {property.amenities?.length > 4 && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                +{property.amenities.length - 4}
                              </span>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {comparisonProperties.map(property => (
              <div key={property.id} className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold text-gray-900 mb-3">{property.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Value</span>
                    <span className="font-medium">{formatValue(property.currentValue, 'currency')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cap Rate</span>
                    <span className="font-medium">{formatValue(property.capRate, 'percent')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cash on Cash</span>
                    <span className="font-medium text-green-600">{formatValue(property.cashOnCash, 'percent')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IRR</span>
                    <span className="font-medium text-blue-600">{formatValue(property.irr, 'percent')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Occupancy</span>
                    <span className="font-medium">{formatValue(property.occupancy, 'percent')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Insights */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Quick Insights</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              {(() => {
                const insights = [];
                const sorted = [...comparisonProperties];

                // Best Cap Rate
                sorted.sort((a, b) => b.capRate - a.capRate);
                insights.push(`Highest Cap Rate: ${sorted[0].name} at ${sorted[0].capRate}%`);

                // Best IRR
                sorted.sort((a, b) => b.irr - a.irr);
                insights.push(`Best IRR: ${sorted[0].name} at ${sorted[0].irr}%`);

                // Best Price/Unit
                const withUnits = sorted.filter(p => p.pricePerUnit);
                if (withUnits.length > 0) {
                  withUnits.sort((a, b) => a.pricePerUnit - b.pricePerUnit);
                  insights.push(`Lowest $/Unit: ${withUnits[0].name} at ${formatValue(withUnits[0].pricePerUnit, 'currency')}`);
                }

                // Best Occupancy
                sorted.sort((a, b) => b.occupancy - a.occupancy);
                insights.push(`Highest Occupancy: ${sorted[0].name} at ${sorted[0].occupancy}%`);

                return insights.map((insight, idx) => (
                  <li key={idx}>• {insight}</li>
                ));
              })()}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
