// AtlasDev - Build to Rent Community Budget
// 100 Home BTR Community Template
// VanRock Holdings LLC

import React, { useState, useMemo } from 'react';
import {
  CurrencyInput,
  NumberInput,
  TextInput,
  CalculatedField,
  CategorySection,
  SubtotalRow,
  GrandTotalRow,
  MetricCard,
  TabNavigation,
  ActionButtons,
} from './ui/BudgetComponents';
import { formatCurrency, formatPercent, generateId } from '../utils/budgetCalculations';

// ============================================
// TYPES
// ============================================

interface LineItem {
  id: string;
  description: string;
  amount: number;
  notes: string;
}

interface Category {
  id: string;
  name: string;
  items: LineItem[];
}

interface ProjectInfo {
  projectName: string;
  location: string;
  totalAcreage: number;
  totalHomes: number;
  avgHomeSF: number;
  density: number;
  avgMonthlyRent: number;
}

interface UnitMixItem {
  id: string;
  planName: string;
  type: 'SFH' | 'TH';
  sqFt: number;
  bedBath: string;
  units: number;
  monthlyRent: number;
}

// ============================================
// DEFAULT DATA
// ============================================

const defaultProjectInfo: ProjectInfo = {
  projectName: '',
  location: '',
  totalAcreage: 15,
  totalHomes: 100,
  avgHomeSF: 1600,
  density: 8,
  avgMonthlyRent: 1800,
};

const defaultCategories: Category[] = [
  {
    id: 'land_acquisition',
    name: 'LAND ACQUISITION',
    items: [
      { id: generateId(), description: 'Land Purchase', amount: 3000000, notes: '$30,000/home or $200K/acre' },
      { id: generateId(), description: 'Closing Costs', amount: 45000, notes: '1.5%' },
      { id: generateId(), description: 'Due Diligence', amount: 35000, notes: '' },
      { id: generateId(), description: 'Legal - Acquisition', amount: 20000, notes: '' },
    ],
  },
  {
    id: 'horizontal_development',
    name: 'HORIZONTAL DEVELOPMENT',
    items: [
      { id: generateId(), description: 'Civil Engineering & Permits', amount: 400000, notes: '$4,000/home' },
      { id: generateId(), description: 'Impact Fees', amount: 500000, notes: '$5,000/home' },
      { id: generateId(), description: 'Mass Grading', amount: 300000, notes: '$3,000/home' },
      { id: generateId(), description: 'Roads & Parking', amount: 600000, notes: '$6,000/home - includes guest parking' },
      { id: generateId(), description: 'Water/Sewer Infrastructure', amount: 500000, notes: '$5,000/home' },
      { id: generateId(), description: 'Storm Drainage', amount: 300000, notes: '$3,000/home' },
      { id: generateId(), description: 'Electric/Gas/Telecom', amount: 200000, notes: '$2,000/home' },
    ],
  },
  {
    id: 'vertical_construction',
    name: 'VERTICAL CONSTRUCTION',
    items: [
      { id: generateId(), description: 'Sticks & Bricks (Avg per home)', amount: 13500000, notes: '$135,000/home avg - BTR spec' },
      { id: generateId(), description: 'Soft Costs', amount: 265000, notes: '$2,650/home' },
      { id: generateId(), description: 'Site Specific Costs', amount: 1087500, notes: '$10,875/home' },
      { id: generateId(), description: 'Builder Profit', amount: 2700000, notes: '20% of S&B' },
    ],
  },
  {
    id: 'community_amenities',
    name: 'COMMUNITY AMENITIES',
    items: [
      { id: generateId(), description: 'Clubhouse/Leasing Office', amount: 500000, notes: '2,500 SF @ $200/SF' },
      { id: generateId(), description: 'Pool & Pool House', amount: 350000, notes: '' },
      { id: generateId(), description: 'Fitness Center (in clubhouse)', amount: 75000, notes: 'Equipment' },
      { id: generateId(), description: 'Dog Park', amount: 50000, notes: '' },
      { id: generateId(), description: 'Playground', amount: 40000, notes: '' },
      { id: generateId(), description: 'Walking Trails', amount: 30000, notes: '' },
      { id: generateId(), description: 'Mail Kiosk/Package Lockers', amount: 35000, notes: '' },
      { id: generateId(), description: 'Community Signage/Entry', amount: 75000, notes: 'Monument, wayfinding' },
    ],
  },
  {
    id: 'landscaping_common',
    name: 'LANDSCAPING & COMMON AREAS',
    items: [
      { id: generateId(), description: 'Common Area Landscaping', amount: 250000, notes: '' },
      { id: generateId(), description: 'Individual Lot Landscaping', amount: 300000, notes: '$3,000/home - sod, shrubs' },
      { id: generateId(), description: 'Irrigation System', amount: 150000, notes: '' },
      { id: generateId(), description: 'Fencing - Perimeter', amount: 100000, notes: '' },
      { id: generateId(), description: 'Fencing - Privacy (per home)', amount: 200000, notes: '$2,000/home' },
      { id: generateId(), description: 'Exterior Lighting', amount: 75000, notes: '' },
    ],
  },
  {
    id: 'preopening_leaseup',
    name: 'PRE-OPENING/LEASE-UP COSTS',
    items: [
      { id: generateId(), description: 'Marketing & Advertising', amount: 150000, notes: 'Website, signage, digital' },
      { id: generateId(), description: 'Model Home Setup', amount: 50000, notes: 'Furniture, staging' },
      { id: generateId(), description: 'Leasing Office Setup', amount: 30000, notes: 'Furniture, tech' },
      { id: generateId(), description: 'Initial Staffing (Pre-lease)', amount: 100000, notes: '3-6 months' },
      { id: generateId(), description: 'Lease-Up Concessions Reserve', amount: 200000, notes: '' },
    ],
  },
  {
    id: 'soft_costs',
    name: 'SOFT COSTS',
    items: [
      { id: generateId(), description: 'Architecture & Design', amount: 150000, notes: '' },
      { id: generateId(), description: 'Construction Management', amount: 500000, notes: '3% of vertical' },
      { id: generateId(), description: 'Project Management', amount: 200000, notes: '' },
      { id: generateId(), description: 'Insurance - Builder\'s Risk', amount: 150000, notes: '' },
      { id: generateId(), description: 'Property Taxes (During Const)', amount: 75000, notes: '' },
      { id: generateId(), description: 'Legal - Construction/HOA', amount: 50000, notes: '' },
      { id: generateId(), description: 'Accounting/Admin', amount: 50000, notes: '' },
      { id: generateId(), description: 'Appraisal/Market Study', amount: 35000, notes: '' },
    ],
  },
  {
    id: 'financing_costs',
    name: 'FINANCING COSTS',
    items: [
      { id: generateId(), description: 'Construction Loan Origination', amount: 250000, notes: '1% of loan' },
      { id: generateId(), description: 'Interest Reserve', amount: 1500000, notes: '24-month construction' },
      { id: generateId(), description: 'Permanent Loan Costs', amount: 200000, notes: 'If applicable' },
      { id: generateId(), description: 'Title/Escrow', amount: 50000, notes: '' },
    ],
  },
  {
    id: 'contingency',
    name: 'CONTINGENCY',
    items: [
      { id: generateId(), description: 'Hard Cost Contingency', amount: 500000, notes: '~3% of hard costs' },
      { id: generateId(), description: 'Soft Cost Contingency', amount: 100000, notes: '5% of soft costs' },
    ],
  },
];

const defaultUnitMix: UnitMixItem[] = [
  { id: generateId(), planName: 'Tulip', type: 'SFH', sqFt: 1170, bedBath: '3/2', units: 15, monthlyRent: 1550 },
  { id: generateId(), planName: 'Atlas', type: 'SFH', sqFt: 1554, bedBath: '3/2.5', units: 20, monthlyRent: 1750 },
  { id: generateId(), planName: 'Dogwood', type: 'SFH', sqFt: 1541, bedBath: '3/2.5', units: 25, monthlyRent: 1725 },
  { id: generateId(), planName: 'Holly', type: 'SFH', sqFt: 2000, bedBath: '4/2.5', units: 15, monthlyRent: 2100 },
  { id: generateId(), planName: 'Jasmine', type: 'TH', sqFt: 1500, bedBath: '3/2.5', units: 15, monthlyRent: 1650 },
  { id: generateId(), planName: 'Palm', type: 'TH', sqFt: 1700, bedBath: '3/2.5', units: 10, monthlyRent: 1850 },
];

// ============================================
// MAIN COMPONENT
// ============================================

export const BuildToRentBudget: React.FC = () => {
  const [activeTab, setActiveTab] = useState('budget');
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>(defaultProjectInfo);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [unitMix, setUnitMix] = useState<UnitMixItem[]>(defaultUnitMix);

  // Financial assumptions
  const [operatingMargin, setOperatingMargin] = useState(0.60);
  const [exitCapRate, setExitCapRate] = useState(0.055);

  // Calculate totals
  const categoryTotals = useMemo(() => {
    return categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      total: cat.items.reduce((sum, item) => sum + item.amount, 0),
    }));
  }, [categories]);

  const grandTotal = useMemo(() => {
    return categoryTotals.reduce((sum, cat) => sum + cat.total, 0);
  }, [categoryTotals]);

  const totalSF = useMemo(() => {
    return projectInfo.totalHomes * projectInfo.avgHomeSF;
  }, [projectInfo]);

  // BTR Metrics
  const btrMetrics = useMemo(() => {
    const totalUnits = unitMix.reduce((sum, u) => sum + u.units, 0);
    const gpi = unitMix.reduce((sum, u) => sum + (u.units * u.monthlyRent * 12), 0);
    const noi = gpi * operatingMargin;
    const impliedValue = exitCapRate > 0 ? noi / exitCapRate : 0;
    const devYield = grandTotal > 0 ? gpi / grandTotal : 0;

    return {
      totalUnits,
      gpi,
      noi,
      devYield,
      impliedValue,
      costPerHome: grandTotal / projectInfo.totalHomes,
      costPerSF: grandTotal / totalSF,
      valueCreation: impliedValue - grandTotal,
    };
  }, [unitMix, grandTotal, projectInfo, totalSF, operatingMargin, exitCapRate]);

  // Update handlers
  const updateProjectInfo = (field: keyof ProjectInfo, value: string | number) => {
    setProjectInfo(prev => ({ ...prev, [field]: value }));
  };

  const updateLineItem = (categoryId: string, itemId: string, field: 'amount' | 'notes', value: number | string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        items: cat.items.map(item => {
          if (item.id !== itemId) return item;
          return { ...item, [field]: value };
        }),
      };
    }));
  };

  const updateUnitMix = (id: string, field: keyof UnitMixItem, value: string | number) => {
    setUnitMix(prev => prev.map(unit => {
      if (unit.id !== id) return unit;
      return { ...unit, [field]: value };
    }));
  };

  const tabs = [
    { id: 'budget', label: 'Development Budget' },
    { id: 'unitmix', label: 'Unit Mix' },
    { id: 'returns', label: 'Return Analysis' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-blue-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">BUILD TO RENT COMMUNITY BUDGET</h1>
            <p className="text-blue-200 text-sm">100 Home BTR Community - Sample Template</p>
          </div>
          <ActionButtons
            onSave={() => console.log('Saving...')}
            onExport={() => console.log('Exporting...')}
            onPrint={() => window.print()}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-6">
        <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'budget' && (
          <div className="grid grid-cols-12 gap-6">
            {/* Project Info Panel */}
            <div className="col-span-12 lg:col-span-3">
              <div className="bg-white rounded-lg border border-slate-200 p-4 sticky top-6">
                <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b">Project Information</h3>
                <div className="space-y-3">
                  <TextInput
                    label="Project Name"
                    value={projectInfo.projectName}
                    onChange={(v) => updateProjectInfo('projectName', v)}
                    placeholder="Enter project name..."
                  />
                  <TextInput
                    label="Location"
                    value={projectInfo.location}
                    onChange={(v) => updateProjectInfo('location', v)}
                    placeholder="City, State"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <NumberInput
                      label="Total Acreage"
                      value={projectInfo.totalAcreage}
                      onChange={(v) => updateProjectInfo('totalAcreage', v)}
                    />
                    <NumberInput
                      label="Total Homes"
                      value={projectInfo.totalHomes}
                      onChange={(v) => updateProjectInfo('totalHomes', v)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <NumberInput
                      label="Avg Home SF"
                      value={projectInfo.avgHomeSF}
                      onChange={(v) => updateProjectInfo('avgHomeSF', v)}
                    />
                    <NumberInput
                      label="Density (units/ac)"
                      value={projectInfo.density}
                      onChange={(v) => updateProjectInfo('density', v)}
                    />
                  </div>
                  <CurrencyInput
                    label="Avg Monthly Rent"
                    value={projectInfo.avgMonthlyRent}
                    onChange={(v) => updateProjectInfo('avgMonthlyRent', v)}
                  />
                </div>

                {/* Quick Metrics */}
                <h3 className="font-semibold text-slate-800 mt-6 mb-3 pb-2 border-b">Quick Metrics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Budget:</span>
                    <span className="font-mono font-semibold">{formatCurrency(grandTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cost Per Home:</span>
                    <span className="font-mono font-semibold">{formatCurrency(btrMetrics.costPerHome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cost Per SF:</span>
                    <span className="font-mono font-semibold">{formatCurrency(btrMetrics.costPerSF, { showCents: true })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dev Yield:</span>
                    <span className="font-mono font-semibold text-blue-600">{formatPercent(btrMetrics.devYield)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Categories */}
            <div className="col-span-12 lg:col-span-9">
              <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-slate-100 rounded-t text-xs font-semibold text-slate-600 mb-2">
                <div className="col-span-4">Description</div>
                <div className="col-span-2 text-right">Total Cost</div>
                <div className="col-span-2 text-right">Per Home</div>
                <div className="col-span-1 text-right">Per SF</div>
                <div className="col-span-3">Notes</div>
              </div>

              {categories.map((category) => {
                const catTotal = categoryTotals.find(c => c.id === category.id)?.total || 0;
                return (
                  <CategorySection key={category.id} title={category.name} color="blue">
                    {category.items.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-12 gap-2 px-3 py-2 border-b border-slate-100 hover:bg-slate-50 items-center"
                      >
                        <div className="col-span-4 text-sm text-slate-700">{item.description}</div>
                        <div className="col-span-2">
                          <CurrencyInput
                            value={item.amount}
                            onChange={(v) => updateLineItem(category.id, item.id, 'amount', v)}
                            size="sm"
                          />
                        </div>
                        <div className="col-span-2 text-right text-xs font-mono text-slate-500">
                          {formatCurrency(item.amount / projectInfo.totalHomes)}
                        </div>
                        <div className="col-span-1 text-right text-xs font-mono text-slate-500">
                          {formatCurrency(item.amount / totalSF, { showCents: true })}
                        </div>
                        <div className="col-span-3">
                          <input
                            type="text"
                            value={item.notes}
                            onChange={(e) => updateLineItem(category.id, item.id, 'notes', e.target.value)}
                            className="w-full h-7 text-xs px-2 bg-transparent border border-transparent rounded text-slate-500 italic focus:border-slate-200 focus:bg-white focus:outline-none"
                            placeholder="Notes..."
                          />
                        </div>
                      </div>
                    ))}
                    <SubtotalRow
                      label={`Subtotal`}
                      budgetTotal={catTotal}
                      perUnit={catTotal / projectInfo.totalHomes}
                      percentOfTotal={grandTotal > 0 ? catTotal / grandTotal : 0}
                    />
                  </CategorySection>
                );
              })}

              <GrandTotalRow
                label="TOTAL PROJECT BUDGET"
                budgetTotal={grandTotal}
                perUnit={btrMetrics.costPerHome}
                perSF={btrMetrics.costPerSF}
              />
            </div>
          </div>
        )}

        {activeTab === 'unitmix' && (
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="bg-blue-700 text-white px-4 py-3 rounded-t">
              <h3 className="font-semibold">BTR UNIT MIX & RENT ROLL</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Plan Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Type</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Sq Ft</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Bed/Bath</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600"># Units</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Monthly Rent</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Annual Rent</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Rent/SF</th>
                  </tr>
                </thead>
                <tbody>
                  {unitMix.map((unit) => (
                    <tr key={unit.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium">{unit.planName}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded ${unit.type === 'SFH' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                          {unit.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm">{unit.sqFt.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center text-sm">{unit.bedBath}</td>
                      <td className="px-4 py-3">
                        <NumberInput
                          value={unit.units}
                          onChange={(v) => updateUnitMix(unit.id, 'units', v)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <CurrencyInput
                          value={unit.monthlyRent}
                          onChange={(v) => updateUnitMix(unit.id, 'monthlyRent', v)}
                          size="sm"
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm">
                        {formatCurrency(unit.units * unit.monthlyRent * 12)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-slate-500">
                        ${(unit.monthlyRent / unit.sqFt).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-blue-50 border-t-2 border-blue-200">
                    <td colSpan={4} className="px-4 py-3 font-semibold">TOTAL</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold">{btrMetrics.totalUnits}</td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-blue-700">
                      {formatCurrency(btrMetrics.gpi)}
                    </td>
                    <td className="px-4 py-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'returns' && (
          <div className="grid grid-cols-12 gap-6">
            {/* Assumptions */}
            <div className="col-span-12 lg:col-span-4">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800 mb-4">Financial Assumptions</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Operating Margin</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="40"
                        max="75"
                        value={operatingMargin * 100}
                        onChange={(e) => setOperatingMargin(parseInt(e.target.value) / 100)}
                        className="flex-1"
                      />
                      <span className="font-mono text-sm w-12">{formatPercent(operatingMargin)}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Exit Cap Rate</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="40"
                        max="80"
                        value={exitCapRate * 1000}
                        onChange={(e) => setExitCapRate(parseInt(e.target.value) / 1000)}
                        className="flex-1"
                      />
                      <span className="font-mono text-sm w-12">{formatPercent(exitCapRate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="col-span-12 lg:col-span-8">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800 mb-4">Return Analysis</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard label="Total Development Cost" value={grandTotal} />
                  <MetricCard label="Cost Per Home" value={btrMetrics.costPerHome} />
                  <MetricCard label="Cost Per SF" value={btrMetrics.costPerSF} />
                  <MetricCard label="Gross Potential Income" value={btrMetrics.gpi} />
                  <MetricCard label="Development Yield" value={btrMetrics.devYield} format="percent" />
                  <MetricCard label="Stabilized NOI" value={btrMetrics.noi} />
                  <MetricCard label="Implied Exit Value" value={btrMetrics.impliedValue} />
                  <MetricCard 
                    label="Value Creation" 
                    value={btrMetrics.valueCreation} 
                    trend={btrMetrics.valueCreation > 0 ? 'up' : 'down'}
                  />
                </div>
              </div>

              {/* Yield Comparison */}
              <div className="bg-white rounded-lg border border-slate-200 p-4 mt-4">
                <h3 className="font-semibold text-slate-800 mb-4">Yield vs Cap Rate Spread</h3>
                <div className="relative h-8 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-blue-500 rounded-l-full"
                    style={{ width: `${(btrMetrics.devYield / 0.12) * 100}%` }}
                  />
                  <div
                    className="absolute top-0 h-full w-1 bg-red-500"
                    style={{ left: `${(exitCapRate / 0.12) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-2">
                  <span className="text-blue-600">Dev Yield: {formatPercent(btrMetrics.devYield)}</span>
                  <span className="text-red-600">Exit Cap: {formatPercent(exitCapRate)}</span>
                  <span className="text-emerald-600 font-semibold">
                    Spread: {formatPercent(btrMetrics.devYield - exitCapRate)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuildToRentBudget;
