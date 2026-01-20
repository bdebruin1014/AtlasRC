// AtlasDev - Build to Sell Community Budget
// 100 Home For-Sale Community Template
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
  avgSalePrice: number;
  absorptionRate: number;
}

interface ProductMixItem {
  id: string;
  planName: string;
  type: 'SFH' | 'TH';
  sqFt: number;
  bedBath: string;
  numHomes: number;
  basePrice: number;
  avgUpgrades: number;
}

interface AbsorptionItem {
  month: number;
  starts: number;
  completions: number;
  sales: number;
  closings: number;
}

// ============================================
// DEFAULT DATA
// ============================================

const defaultProjectInfo: ProjectInfo = {
  projectName: '',
  location: '',
  totalAcreage: 40,
  totalHomes: 100,
  avgHomeSF: 1850,
  avgSalePrice: 375000,
  absorptionRate: 4,
};

const defaultCategories: Category[] = [
  {
    id: 'land_acquisition',
    name: 'LAND ACQUISITION',
    items: [
      { id: generateId(), description: 'Raw Land Purchase', amount: 4000000, notes: '$40K/home or $100K/acre' },
      { id: generateId(), description: 'Closing Costs', amount: 60000, notes: '1.5%' },
      { id: generateId(), description: 'Due Diligence', amount: 50000, notes: 'Survey, Phase I, Geotech' },
      { id: generateId(), description: 'Legal - Acquisition', amount: 25000, notes: '' },
    ],
  },
  {
    id: 'horizontal_development',
    name: 'HORIZONTAL DEVELOPMENT',
    items: [
      { id: generateId(), description: 'Civil Engineering & Design', amount: 250000, notes: '$2,500/lot' },
      { id: generateId(), description: 'Land Planning/Architecture', amount: 75000, notes: '' },
      { id: generateId(), description: 'Permit & Impact Fees', amount: 600000, notes: '$6,000/lot' },
      { id: generateId(), description: 'Mass Grading', amount: 400000, notes: '$4,000/lot' },
      { id: generateId(), description: 'Clearing & Grubbing', amount: 200000, notes: '$2,000/lot' },
      { id: generateId(), description: 'Erosion Control', amount: 100000, notes: '' },
      { id: generateId(), description: 'Roads & Paving', amount: 750000, notes: '$7,500/lot' },
      { id: generateId(), description: 'Curb, Gutter, Sidewalks', amount: 400000, notes: '$4,000/lot' },
      { id: generateId(), description: 'Water Main Extension', amount: 350000, notes: '$3,500/lot' },
      { id: generateId(), description: 'Sanitary Sewer', amount: 400000, notes: '$4,000/lot' },
      { id: generateId(), description: 'Storm Drainage & Detention', amount: 500000, notes: '$5,000/lot' },
      { id: generateId(), description: 'Electric/Gas/Telecom Conduit', amount: 200000, notes: '$2,000/lot' },
      { id: generateId(), description: 'Street Lighting', amount: 100000, notes: '$1,000/lot' },
      { id: generateId(), description: 'Entry Monument & Signage', amount: 100000, notes: '' },
      { id: generateId(), description: 'Common Area Landscaping', amount: 200000, notes: '' },
      { id: generateId(), description: 'Amenity (Pool/Clubhouse)', amount: 400000, notes: 'If applicable' },
    ],
  },
  {
    id: 'vertical_construction',
    name: 'VERTICAL CONSTRUCTION (100 HOMES)',
    items: [
      { id: generateId(), description: 'Sticks & Bricks - Total', amount: 14500000, notes: '$145,000 avg per home' },
      { id: generateId(), description: 'Soft Costs', amount: 265000, notes: '$2,650/home' },
      { id: generateId(), description: 'Site Specific Costs', amount: 1087500, notes: '$10,875/home' },
      { id: generateId(), description: 'Upgrade Allowance (Avg)', amount: 500000, notes: '$5,000/home avg' },
      { id: generateId(), description: 'Builder Profit (20%)', amount: 2900000, notes: '20% of S&B' },
    ],
  },
  {
    id: 'model_home_complex',
    name: 'MODEL HOME COMPLEX',
    items: [
      { id: generateId(), description: 'Model Home Construction (2)', amount: 400000, notes: '2 fully finished models' },
      { id: generateId(), description: 'Model Furnishings & Decor', amount: 100000, notes: '$50K per model' },
      { id: generateId(), description: 'Model Landscaping (Enhanced)', amount: 30000, notes: '' },
      { id: generateId(), description: 'Sales Office Build-out', amount: 50000, notes: 'If not in model' },
      { id: generateId(), description: 'Sales Office Furniture/Tech', amount: 25000, notes: '' },
    ],
  },
  {
    id: 'sales_marketing',
    name: 'SALES & MARKETING',
    items: [
      { id: generateId(), description: 'Pre-Sales Marketing', amount: 100000, notes: 'Website, signage, digital' },
      { id: generateId(), description: 'Ongoing Marketing', amount: 200000, notes: '2% of revenue' },
      { id: generateId(), description: 'Realtor Co-op Commission', amount: 937500, notes: '2.5% of sales' },
      { id: generateId(), description: 'In-House Sales Commission', amount: 562500, notes: '1.5% of sales' },
      { id: generateId(), description: 'Closing Costs (Seller)', amount: 187500, notes: '0.5% of sales' },
      { id: generateId(), description: 'Buyer Incentives Reserve', amount: 500000, notes: '$5,000/home avg' },
      { id: generateId(), description: 'HOA Subsidy/Setup', amount: 50000, notes: '' },
    ],
  },
  {
    id: 'soft_costs_development',
    name: 'SOFT COSTS - DEVELOPMENT',
    items: [
      { id: generateId(), description: 'Architecture - Community', amount: 100000, notes: '' },
      { id: generateId(), description: 'Construction Management', amount: 450000, notes: '3% of vertical' },
      { id: generateId(), description: 'Project Management', amount: 250000, notes: '' },
      { id: generateId(), description: 'Insurance - Builder\'s Risk', amount: 200000, notes: '' },
      { id: generateId(), description: 'Property Taxes (During Dev)', amount: 150000, notes: '' },
      { id: generateId(), description: 'Legal - Construction/HOA', amount: 75000, notes: '' },
      { id: generateId(), description: 'Accounting/Admin', amount: 100000, notes: '' },
      { id: generateId(), description: 'Warranty Reserve', amount: 250000, notes: '$2,500/home' },
    ],
  },
  {
    id: 'financing_costs',
    name: 'FINANCING COSTS',
    items: [
      { id: generateId(), description: 'Land Loan Origination', amount: 50000, notes: '' },
      { id: generateId(), description: 'Land Loan Interest', amount: 300000, notes: '12-month carry' },
      { id: generateId(), description: 'Construction Loan Origination', amount: 250000, notes: '1% of loan' },
      { id: generateId(), description: 'Construction Loan Interest', amount: 1800000, notes: 'Rolling draws over 30 months' },
      { id: generateId(), description: 'Title/Escrow/Recording', amount: 100000, notes: '' },
    ],
  },
  {
    id: 'contingency',
    name: 'CONTINGENCY',
    items: [
      { id: generateId(), description: 'Hard Cost Contingency', amount: 600000, notes: '~3% of hard costs' },
      { id: generateId(), description: 'Soft Cost Contingency', amount: 150000, notes: '5% of soft costs' },
    ],
  },
];

const defaultProductMix: ProductMixItem[] = [
  { id: generateId(), planName: 'Dogwood', type: 'SFH', sqFt: 1541, bedBath: '3/2.5', numHomes: 15, basePrice: 325000, avgUpgrades: 8000 },
  { id: generateId(), planName: 'Elm', type: 'SFH', sqFt: 1712, bedBath: '4/2.5', numHomes: 20, basePrice: 350000, avgUpgrades: 10000 },
  { id: generateId(), planName: 'Holly', type: 'SFH', sqFt: 2000, bedBath: '4/2.5', numHomes: 25, basePrice: 375000, avgUpgrades: 12000 },
  { id: generateId(), planName: 'Cherry', type: 'SFH', sqFt: 2214, bedBath: '4/3', numHomes: 20, basePrice: 415000, avgUpgrades: 15000 },
  { id: generateId(), planName: 'Magnolia', type: 'SFH', sqFt: 2771, bedBath: '4/3', numHomes: 10, basePrice: 475000, avgUpgrades: 20000 },
  { id: generateId(), planName: 'White Oak', type: 'SFH', sqFt: 2005, bedBath: '4/2.5', numHomes: 10, basePrice: 385000, avgUpgrades: 12000 },
];

// ============================================
// MAIN COMPONENT
// ============================================

export const BuildToSellBudget: React.FC = () => {
  const [activeTab, setActiveTab] = useState('budget');
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>(defaultProjectInfo);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [productMix, setProductMix] = useState<ProductMixItem[]>(defaultProductMix);

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

  // Revenue calculations
  const revenueMetrics = useMemo(() => {
    const totalRevenue = productMix.reduce((sum, p) => sum + (p.numHomes * (p.basePrice + p.avgUpgrades)), 0);
    const totalUnits = productMix.reduce((sum, p) => sum + p.numHomes, 0);
    const weightedAvgPrice = totalUnits > 0 ? totalRevenue / totalUnits : 0;
    const grossProfit = totalRevenue - grandTotal;
    const grossMargin = totalRevenue > 0 ? grossProfit / totalRevenue : 0;
    const profitPerHome = totalUnits > 0 ? grossProfit / totalUnits : 0;
    const selloutMonths = projectInfo.absorptionRate > 0 ? totalUnits / projectInfo.absorptionRate : 0;

    return {
      totalRevenue,
      totalUnits,
      weightedAvgPrice,
      grossProfit,
      grossMargin,
      profitPerHome,
      selloutMonths,
      costPerHome: grandTotal / projectInfo.totalHomes,
      costPerSF: grandTotal / totalSF,
    };
  }, [productMix, grandTotal, projectInfo, totalSF]);

  // Absorption schedule
  const absorptionSchedule = useMemo(() => {
    const schedule: AbsorptionItem[] = [];
    const constructionLag = 6;
    let cumulativeStarts = 0;
    let cumulativeCompletions = 0;
    let cumulativeClosings = 0;

    for (let month = 1; month <= Math.ceil(revenueMetrics.selloutMonths) + constructionLag + 2; month++) {
      const starts = cumulativeStarts < projectInfo.totalHomes
        ? Math.min(projectInfo.absorptionRate, projectInfo.totalHomes - cumulativeStarts)
        : 0;
      const completions = month > constructionLag && cumulativeCompletions < projectInfo.totalHomes
        ? Math.min(projectInfo.absorptionRate, projectInfo.totalHomes - cumulativeCompletions)
        : 0;
      const closings = month > constructionLag + 1 && cumulativeClosings < projectInfo.totalHomes
        ? Math.min(projectInfo.absorptionRate, projectInfo.totalHomes - cumulativeClosings)
        : 0;

      cumulativeStarts += starts;
      cumulativeCompletions += completions;
      cumulativeClosings += closings;

      schedule.push({ month, starts, completions, sales: starts, closings });

      if (cumulativeClosings >= projectInfo.totalHomes) break;
    }

    return schedule.slice(0, 30); // Limit to 30 months for display
  }, [projectInfo, revenueMetrics.selloutMonths]);

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

  const updateProductMix = (id: string, field: keyof ProductMixItem, value: string | number) => {
    setProductMix(prev => prev.map(product => {
      if (product.id !== id) return product;
      return { ...product, [field]: value };
    }));
  };

  const tabs = [
    { id: 'budget', label: 'Development Budget' },
    { id: 'productmix', label: 'Product Mix' },
    { id: 'absorption', label: 'Absorption Schedule' },
    { id: 'profitability', label: 'Profitability' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-purple-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">BUILD TO SELL COMMUNITY BUDGET</h1>
            <p className="text-purple-200 text-sm">100 Home For-Sale Community - Sample Template</p>
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
                      label="Absorption/Mo"
                      value={projectInfo.absorptionRate}
                      onChange={(v) => updateProjectInfo('absorptionRate', v)}
                    />
                  </div>
                  <CurrencyInput
                    label="Avg Sale Price"
                    value={projectInfo.avgSalePrice}
                    onChange={(v) => updateProjectInfo('avgSalePrice', v)}
                  />
                </div>

                {/* Quick Metrics */}
                <h3 className="font-semibold text-slate-800 mt-6 mb-3 pb-2 border-b">Quick Metrics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Cost:</span>
                    <span className="font-mono font-semibold">{formatCurrency(grandTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Revenue:</span>
                    <span className="font-mono font-semibold">{formatCurrency(revenueMetrics.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gross Profit:</span>
                    <span className={`font-mono font-semibold ${revenueMetrics.grossProfit > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(revenueMetrics.grossProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gross Margin:</span>
                    <span className="font-mono font-semibold text-purple-600">
                      {formatPercent(revenueMetrics.grossMargin)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sellout:</span>
                    <span className="font-mono">{revenueMetrics.selloutMonths.toFixed(0)} months</span>
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
                <div className="col-span-1 text-right">% Revenue</div>
                <div className="col-span-3">Notes</div>
              </div>

              {categories.map((category) => {
                const catTotal = categoryTotals.find(c => c.id === category.id)?.total || 0;
                return (
                  <CategorySection key={category.id} title={category.name} color="purple">
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
                          {formatPercent(revenueMetrics.totalRevenue > 0 ? item.amount / revenueMetrics.totalRevenue : 0)}
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
                      label="Subtotal"
                      budgetTotal={catTotal}
                      perUnit={catTotal / projectInfo.totalHomes}
                      percentOfTotal={revenueMetrics.totalRevenue > 0 ? catTotal / revenueMetrics.totalRevenue : 0}
                    />
                  </CategorySection>
                );
              })}

              <GrandTotalRow
                label="TOTAL PROJECT COST"
                budgetTotal={grandTotal}
                perUnit={revenueMetrics.costPerHome}
                perSF={revenueMetrics.costPerSF}
              />
            </div>
          </div>
        )}

        {activeTab === 'productmix' && (
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="bg-purple-700 text-white px-4 py-3 rounded-t">
              <h3 className="font-semibold">PRODUCT MIX & PRICING</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Plan</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Type</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Sq Ft</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Bed/Bath</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600"># Homes</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Base Price</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Avg Upgrades</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {productMix.map((product) => (
                    <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium">{product.planName}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded ${product.type === 'SFH' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                          {product.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm">{product.sqFt.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center text-sm">{product.bedBath}</td>
                      <td className="px-4 py-3">
                        <NumberInput
                          value={product.numHomes}
                          onChange={(v) => updateProductMix(product.id, 'numHomes', v)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <CurrencyInput
                          value={product.basePrice}
                          onChange={(v) => updateProductMix(product.id, 'basePrice', v)}
                          size="sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <CurrencyInput
                          value={product.avgUpgrades}
                          onChange={(v) => updateProductMix(product.id, 'avgUpgrades', v)}
                          size="sm"
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm">
                        {formatCurrency(product.numHomes * (product.basePrice + product.avgUpgrades))}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-purple-50 border-t-2 border-purple-200">
                    <td colSpan={4} className="px-4 py-3 font-semibold">TOTAL</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold">{revenueMetrics.totalUnits}</td>
                    <td colSpan={2} className="px-4 py-3 text-right font-mono">
                      Weighted Avg: {formatCurrency(revenueMetrics.weightedAvgPrice)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-purple-700">
                      {formatCurrency(revenueMetrics.totalRevenue)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'absorption' && (
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="bg-purple-700 text-white px-4 py-3 rounded-t">
              <h3 className="font-semibold">SALES ABSORPTION SCHEDULE</h3>
            </div>
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Month</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Starts</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Completions</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Sales</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Closings</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Revenue</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Cumulative Rev</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Inventory</th>
                  </tr>
                </thead>
                <tbody>
                  {absorptionSchedule.map((item, idx) => {
                    const cumulativeClosings = absorptionSchedule.slice(0, idx + 1).reduce((sum, i) => sum + i.closings, 0);
                    const cumulativeCompletions = absorptionSchedule.slice(0, idx + 1).reduce((sum, i) => sum + i.completions, 0);
                    const revenue = item.closings * revenueMetrics.weightedAvgPrice;
                    const cumulativeRevenue = absorptionSchedule.slice(0, idx + 1).reduce((sum, i) => sum + i.closings * revenueMetrics.weightedAvgPrice, 0);
                    const inventory = cumulativeCompletions - cumulativeClosings;

                    return (
                      <tr key={item.month} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-2 font-mono text-sm">{item.month}</td>
                        <td className="px-4 py-2 text-right font-mono text-sm">{item.starts}</td>
                        <td className="px-4 py-2 text-right font-mono text-sm">{item.completions}</td>
                        <td className="px-4 py-2 text-right font-mono text-sm">{item.sales}</td>
                        <td className="px-4 py-2 text-right font-mono text-sm">{item.closings}</td>
                        <td className="px-4 py-2 text-right font-mono text-sm">{formatCurrency(revenue)}</td>
                        <td className="px-4 py-2 text-right font-mono text-sm">{formatCurrency(cumulativeRevenue)}</td>
                        <td className="px-4 py-2 text-right font-mono text-sm">{inventory}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'profitability' && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800 mb-4">Project Profitability Analysis</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard label="Total Revenue" value={revenueMetrics.totalRevenue} size="lg" />
                  <MetricCard label="Total Project Cost" value={grandTotal} />
                  <MetricCard 
                    label="Gross Profit" 
                    value={revenueMetrics.grossProfit}
                    trend={revenueMetrics.grossProfit > 0 ? 'up' : 'down'}
                  />
                  <MetricCard label="Gross Margin" value={revenueMetrics.grossMargin} format="percent" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <MetricCard label="Profit Per Home" value={revenueMetrics.profitPerHome} />
                  <MetricCard label="Cost Per Home" value={revenueMetrics.costPerHome} />
                  <MetricCard label="Cost Per SF" value={revenueMetrics.costPerSF} />
                  <MetricCard label="Sellout Period" value={revenueMetrics.selloutMonths} format="number" />
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-white rounded-lg border border-slate-200 p-4 mt-4">
                <h3 className="font-semibold text-slate-800 mb-4">Cost as % of Revenue</h3>
                <div className="space-y-3">
                  {categoryTotals.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-4">
                      <div className="w-48 text-sm text-slate-600 truncate">{cat.name}</div>
                      <div className="flex-1 h-6 bg-slate-100 rounded overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded"
                          style={{ width: `${(cat.total / revenueMetrics.totalRevenue) * 100 * 3}%` }}
                        />
                      </div>
                      <div className="w-20 text-right text-sm font-mono">
                        {formatPercent(cat.total / revenueMetrics.totalRevenue)}
                      </div>
                      <div className="w-24 text-right text-sm font-mono text-slate-500">
                        {formatCurrency(cat.total, { compact: true })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800 mb-4">Return Estimates</h3>
                <div className="space-y-4">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-xs text-purple-600 font-medium">Required Equity (25%)</div>
                    <div className="text-xl font-mono font-bold text-purple-800">
                      {formatCurrency(grandTotal * 0.25)}
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <div className="text-xs text-emerald-600 font-medium">Return on Equity</div>
                    <div className="text-xl font-mono font-bold text-emerald-800">
                      {formatPercent(revenueMetrics.grossProfit / (grandTotal * 0.25))}
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <div className="text-xs text-amber-600 font-medium">Est. Project IRR</div>
                    <div className="text-xl font-mono font-bold text-amber-800">
                      28-35%
                    </div>
                    <div className="text-xs text-amber-600 mt-1">Based on {revenueMetrics.selloutMonths.toFixed(0)}-month sellout</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuildToSellBudget;
