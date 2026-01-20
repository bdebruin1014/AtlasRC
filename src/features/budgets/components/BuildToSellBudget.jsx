// AtlasDev - Build to Sell Community Budget
import React, { useState, useMemo } from 'react';
import { CurrencyInput, NumberInput, TextInput, PercentInput, CategorySection, SubtotalRow, GrandTotalRow, MetricCard, TabNavigation, ActionButtons } from './ui/BudgetComponents';
import { formatCurrency, formatPercent, generateId } from '../utils/budgetCalculations';

const defaultCategories = [
  {
    id: 'land_acquisition', name: 'LAND ACQUISITION',
    items: [
      { id: generateId(), description: 'Land/Lot Purchase', budget: 2400000, actual: 0, notes: '30 lots @ $80K' },
      { id: generateId(), description: 'Closing Costs', budget: 36000, actual: 0, notes: '1.5%' },
      { id: generateId(), description: 'Due Diligence', budget: 18000, actual: 0, notes: '' },
      { id: generateId(), description: 'Legal & Title', budget: 15000, actual: 0, notes: '' },
    ],
  },
  {
    id: 'site_development', name: 'SITE DEVELOPMENT (if raw land)',
    items: [
      { id: generateId(), description: 'Civil Engineering', budget: 0, actual: 0, notes: 'N/A - finished lots' },
      { id: generateId(), description: 'Site Grading', budget: 0, actual: 0, notes: 'N/A - finished lots' },
      { id: generateId(), description: 'Utilities', budget: 0, actual: 0, notes: 'N/A - finished lots' },
      { id: generateId(), description: 'Roads/Paving', budget: 0, actual: 0, notes: 'N/A - finished lots' },
    ],
  },
  {
    id: 'vertical_construction', name: 'VERTICAL CONSTRUCTION',
    items: [
      { id: generateId(), description: 'Building Permits (avg)', budget: 75000, actual: 0, notes: '$2,500/home' },
      { id: generateId(), description: 'Foundation', budget: 360000, actual: 0, notes: '$12,000/home' },
      { id: generateId(), description: 'Framing & Lumber', budget: 720000, actual: 0, notes: '$24,000/home' },
      { id: generateId(), description: 'Trusses', budget: 300000, actual: 0, notes: '$10,000/home' },
      { id: generateId(), description: 'Roofing', budget: 165000, actual: 0, notes: '$5,500/home' },
      { id: generateId(), description: 'Siding & Exterior', budget: 285000, actual: 0, notes: '$9,500/home' },
      { id: generateId(), description: 'Windows & Doors', budget: 243000, actual: 0, notes: '$8,100/home' },
      { id: generateId(), description: 'Plumbing', budget: 450000, actual: 0, notes: '$15,000/home' },
      { id: generateId(), description: 'HVAC', budget: 330000, actual: 0, notes: '$11,000/home' },
      { id: generateId(), description: 'Electrical', budget: 270000, actual: 0, notes: '$9,000/home' },
      { id: generateId(), description: 'Insulation', budget: 126000, actual: 0, notes: '$4,200/home' },
      { id: generateId(), description: 'Drywall', budget: 330000, actual: 0, notes: '$11,000/home' },
      { id: generateId(), description: 'Interior Paint', budget: 123000, actual: 0, notes: '$4,100/home' },
      { id: generateId(), description: 'Trim & Doors', budget: 165000, actual: 0, notes: '$5,500/home' },
      { id: generateId(), description: 'Cabinets', budget: 171000, actual: 0, notes: '$5,700/home' },
      { id: generateId(), description: 'Countertops', budget: 126000, actual: 0, notes: '$4,200/home' },
      { id: generateId(), description: 'Flooring', budget: 168000, actual: 0, notes: '$5,600/home' },
      { id: generateId(), description: 'Appliances', budget: 48480, actual: 0, notes: '$1,616/home' },
      { id: generateId(), description: 'Final Clean', budget: 45000, actual: 0, notes: '$1,500/home' },
    ],
  },
  {
    id: 'site_specific', name: 'SITE SPECIFIC (per home)',
    items: [
      { id: generateId(), description: 'Grading/Lot Prep', budget: 150000, actual: 0, notes: '$5,000/home' },
      { id: generateId(), description: 'Driveways', budget: 75000, actual: 0, notes: '$2,500/home' },
      { id: generateId(), description: 'Utility Connections', budget: 90000, actual: 0, notes: '$3,000/home' },
      { id: generateId(), description: 'Landscaping', budget: 75000, actual: 0, notes: '$2,500/home' },
    ],
  },
  {
    id: 'builder_profit', name: 'BUILDER PROFIT',
    items: [
      { id: generateId(), description: 'Builder Margin (20%)', budget: 940200, actual: 0, notes: '20% of construction' },
    ],
  },
  {
    id: 'soft_costs', name: 'SOFT COSTS',
    items: [
      { id: generateId(), description: 'Architecture/Plans', budget: 45000, actual: 0, notes: '' },
      { id: generateId(), description: 'Project Management', budget: 85000, actual: 0, notes: '' },
      { id: generateId(), description: 'Insurance', budget: 65000, actual: 0, notes: '' },
      { id: generateId(), description: 'Property Taxes', budget: 35000, actual: 0, notes: '' },
      { id: generateId(), description: 'Marketing', budget: 75000, actual: 0, notes: '' },
      { id: generateId(), description: 'Sales Office', budget: 25000, actual: 0, notes: '' },
      { id: generateId(), description: 'Warranty Reserve', budget: 45000, actual: 0, notes: '$1,500/home' },
    ],
  },
  {
    id: 'financing', name: 'FINANCING COSTS',
    items: [
      { id: generateId(), description: 'Loan Origination', budget: 95000, actual: 0, notes: '1%' },
      { id: generateId(), description: 'Interest Reserve', budget: 385000, actual: 0, notes: '18 months avg' },
      { id: generateId(), description: 'Appraisals', budget: 15000, actual: 0, notes: '' },
    ],
  },
  {
    id: 'contingency', name: 'CONTINGENCY',
    items: [
      { id: generateId(), description: 'Construction Contingency', budget: 235000, actual: 0, notes: '5%' },
    ],
  },
];

export const BuildToSellBudget = () => {
  const [activeTab, setActiveTab] = useState('budget');
  const [projectInfo, setProjectInfo] = useState({ projectName: '', address: '', totalHomes: 30, avgHomeSF: 2200, planMix: 'Cherry (60%), Maple (40%)' });
  const [salesProjections, setSalesProjections] = useState({ avgSalePrice: 385000, salesCommissionRate: 0.05, closingCostRate: 0.005, avgIncentives: 5000, absorptionPerMonth: 3 });
  const [categories, setCategories] = useState(defaultCategories);

  const categoryTotals = useMemo(() => categories.map(cat => ({
    id: cat.id, name: cat.name,
    budgetTotal: cat.items.reduce((sum, item) => sum + item.budget, 0),
    actualTotal: cat.items.reduce((sum, item) => sum + item.actual, 0),
  })), [categories]);

  const totals = useMemo(() => {
    const budgetTotal = categoryTotals.reduce((sum, cat) => sum + cat.budgetTotal, 0);
    const actualTotal = categoryTotals.reduce((sum, cat) => sum + cat.actualTotal, 0);
    return { budgetTotal, actualTotal, variance: actualTotal - budgetTotal };
  }, [categoryTotals]);

  const metrics = useMemo(() => {
    const totalRevenue = projectInfo.totalHomes * salesProjections.avgSalePrice;
    const salesCommission = totalRevenue * salesProjections.salesCommissionRate;
    const closingCosts = totalRevenue * salesProjections.closingCostRate;
    const totalIncentives = projectInfo.totalHomes * salesProjections.avgIncentives;
    const netRevenue = totalRevenue - salesCommission - closingCosts - totalIncentives;
    const grossProfit = netRevenue - totals.budgetTotal;
    const grossMargin = totalRevenue > 0 ? grossProfit / totalRevenue : 0;
    const costPerHome = projectInfo.totalHomes > 0 ? totals.budgetTotal / projectInfo.totalHomes : 0;
    const profitPerHome = projectInfo.totalHomes > 0 ? grossProfit / projectInfo.totalHomes : 0;
    const costPerSF = projectInfo.totalHomes > 0 && projectInfo.avgHomeSF > 0 ? totals.budgetTotal / (projectInfo.totalHomes * projectInfo.avgHomeSF) : 0;
    const salePricePerSF = projectInfo.avgHomeSF > 0 ? salesProjections.avgSalePrice / projectInfo.avgHomeSF : 0;
    const absorptionMonths = salesProjections.absorptionPerMonth > 0 ? projectInfo.totalHomes / salesProjections.absorptionPerMonth : 0;
    const equityRequired = totals.budgetTotal * 0.15;
    const roi = equityRequired > 0 ? grossProfit / equityRequired : 0;
    return { totalRevenue, salesCommission, closingCosts, totalIncentives, netRevenue, grossProfit, grossMargin, costPerHome, profitPerHome, costPerSF, salePricePerSF, absorptionMonths, equityRequired, roi };
  }, [projectInfo, salesProjections, totals]);

  const updateLineItem = (categoryId, itemId, field, value) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat;
      return { ...cat, items: cat.items.map(item => item.id !== itemId ? item : { ...item, [field]: value }) };
    }));
  };

  const tabs = [{ id: 'budget', label: 'Development Budget' }, { id: 'analysis', label: 'Profit Analysis' }];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-amber-700 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">BUILD TO SELL COMMUNITY BUDGET</h1>
            <p className="text-amber-200 text-sm">Multi-Home Spec Development</p>
          </div>
          <ActionButtons onSave={() => console.log('Save budget')} onPrint={() => window.print()} />
        </div>
      </div>

      <div className="bg-white border-b border-slate-200 px-6">
        <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="p-6">
        {activeTab === 'budget' && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-3">
              <div className="bg-white rounded-lg border border-slate-200 p-4 sticky top-6">
                <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b">Project Information</h3>
                <div className="space-y-3">
                  <TextInput label="Project Name" value={projectInfo.projectName} onChange={(v) => setProjectInfo(p => ({ ...p, projectName: v }))} placeholder="Enter name..." />
                  <TextInput label="Address" value={projectInfo.address} onChange={(v) => setProjectInfo(p => ({ ...p, address: v }))} />
                  <NumberInput label="Total Homes" value={projectInfo.totalHomes} onChange={(v) => setProjectInfo(p => ({ ...p, totalHomes: v }))} />
                  <NumberInput label="Avg Home SF" value={projectInfo.avgHomeSF} onChange={(v) => setProjectInfo(p => ({ ...p, avgHomeSF: v }))} />
                  <TextInput label="Plan Mix" value={projectInfo.planMix} onChange={(v) => setProjectInfo(p => ({ ...p, planMix: v }))} />
                </div>
                <div className="mt-6 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="text-xs font-semibold text-amber-700 mb-2">QUICK SUMMARY</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-slate-600">Total Budget:</span><span className="font-mono font-semibold">{formatCurrency(totals.budgetTotal)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Cost/Home:</span><span className="font-mono">{formatCurrency(metrics.costPerHome)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Gross Profit:</span><span className={`font-mono font-semibold ${metrics.grossProfit > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(metrics.grossProfit)}</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-9">
              <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-slate-100 rounded-t text-xs font-semibold text-slate-600 mb-2">
                <div className="col-span-4">Line Item</div>
                <div className="col-span-2 text-right">Budget</div>
                <div className="col-span-2 text-right">Actual</div>
                <div className="col-span-2 text-right">Variance</div>
                <div className="col-span-2">Notes</div>
              </div>

              {categories.map((category) => {
                const catTotals = categoryTotals.find(c => c.id === category.id);
                return (
                  <CategorySection key={category.id} title={category.name} color="slate">
                    {category.items.map((item) => {
                      const variance = item.actual - item.budget;
                      return (
                        <div key={item.id} className="grid grid-cols-12 gap-2 px-3 py-2 border-b border-slate-100 hover:bg-slate-50 items-center">
                          <div className="col-span-4 text-sm text-slate-700">{item.description}</div>
                          <div className="col-span-2">
                            <CurrencyInput value={item.budget} onChange={(v) => updateLineItem(category.id, item.id, 'budget', v)} size="sm" />
                          </div>
                          <div className="col-span-2">
                            <CurrencyInput value={item.actual} onChange={(v) => updateLineItem(category.id, item.id, 'actual', v)} size="sm" />
                          </div>
                          <div className={`col-span-2 text-right text-xs font-mono ${variance > 0 ? 'text-red-600' : variance < 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {item.actual > 0 ? formatCurrency(variance) : '—'}
                          </div>
                          <div className="col-span-2">
                            <input type="text" value={item.notes} onChange={(e) => updateLineItem(category.id, item.id, 'notes', e.target.value)}
                              className="w-full h-7 text-xs px-2 bg-transparent border border-transparent rounded text-slate-500 italic focus:border-slate-200 focus:bg-white focus:outline-none" placeholder="Notes..." />
                          </div>
                        </div>
                      );
                    })}
                    <SubtotalRow label="Subtotal" budgetTotal={catTotals?.budgetTotal || 0} actualTotal={catTotals?.actualTotal || 0} showVariance />
                  </CategorySection>
                );
              })}
              <GrandTotalRow label="TOTAL PROJECT COST" budgetTotal={totals.budgetTotal} actualTotal={totals.actualTotal > 0 ? totals.actualTotal : undefined} perUnit={metrics.costPerHome} />
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-4">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800 mb-4">Sales Projections</h3>
                <div className="space-y-4">
                  <CurrencyInput label="Avg Sale Price" value={salesProjections.avgSalePrice} onChange={(v) => setSalesProjections(p => ({ ...p, avgSalePrice: v }))} />
                  <PercentInput label="Sales Commission" value={salesProjections.salesCommissionRate} onChange={(v) => setSalesProjections(p => ({ ...p, salesCommissionRate: v }))} />
                  <PercentInput label="Seller Closing Costs" value={salesProjections.closingCostRate} onChange={(v) => setSalesProjections(p => ({ ...p, closingCostRate: v }))} />
                  <CurrencyInput label="Avg Buyer Incentives" value={salesProjections.avgIncentives} onChange={(v) => setSalesProjections(p => ({ ...p, avgIncentives: v }))} />
                  <NumberInput label="Absorption (homes/month)" value={salesProjections.absorptionPerMonth} onChange={(v) => setSalesProjections(p => ({ ...p, absorptionPerMonth: v }))} />
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-8">
              <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
                <h3 className="font-semibold text-slate-800 mb-4">Profit Analysis</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard label="Total Revenue" value={metrics.totalRevenue} />
                  <MetricCard label="Total Cost" value={totals.budgetTotal} />
                  <MetricCard label="Gross Profit" value={metrics.grossProfit} trend={metrics.grossProfit > 0 ? 'up' : 'down'} />
                  <MetricCard label="Gross Margin" value={metrics.grossMargin} format="percent" />
                  <MetricCard label="Cost Per Home" value={metrics.costPerHome} />
                  <MetricCard label="Profit Per Home" value={metrics.profitPerHome} />
                  <MetricCard label="Equity Required (15%)" value={metrics.equityRequired} />
                  <MetricCard label="ROI" value={metrics.roi} format="percent" trend={metrics.roi > 0.30 ? 'up' : 'neutral'} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <h3 className="font-semibold text-slate-800 mb-4">Per SF Analysis</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-slate-600">Cost Per SF</span><span className="font-mono font-medium">{formatCurrency(metrics.costPerSF, { showCents: true })}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Sale Price Per SF</span><span className="font-mono font-medium">{formatCurrency(metrics.salePricePerSF, { showCents: true })}</span></div>
                    <div className="flex justify-between pt-2 border-t"><span className="font-medium">Spread Per SF</span><span className="font-mono font-medium text-emerald-600">{formatCurrency(metrics.salePricePerSF - metrics.costPerSF, { showCents: true })}</span></div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <h3 className="font-semibold text-slate-800 mb-4">Sellout Timeline</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-amber-600">{projectInfo.totalHomes}</p>
                      <p className="text-xs text-slate-500">Total Homes</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-amber-600">{salesProjections.absorptionPerMonth}</p>
                      <p className="text-xs text-slate-500">Homes/Month</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-amber-600">{Math.ceil(metrics.absorptionMonths)}</p>
                      <p className="text-xs text-slate-500">Months</p>
                    </div>
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
