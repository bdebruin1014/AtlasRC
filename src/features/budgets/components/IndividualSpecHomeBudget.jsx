// AtlasDev - Individual Spec Home Budget
import React, { useState, useMemo } from 'react';
import { CurrencyInput, NumberInput, TextInput, PercentInput, CategorySection, SubtotalRow, GrandTotalRow, MetricCard, TabNavigation, ActionButtons } from './ui/BudgetComponents';
import { formatCurrency, formatPercent, generateId } from '../utils/budgetCalculations';

const defaultCategories = [
  {
    id: 'lot_acquisition', name: 'LOT ACQUISITION',
    items: [
      { id: generateId(), description: 'Lot Purchase Price', budget: 38750, actual: 0, notes: '' },
      { id: generateId(), description: 'Buyer Closing Costs', budget: 581, actual: 0, notes: '1.5%' },
      { id: generateId(), description: 'Acquisition Fee', budget: 1163, actual: 0, notes: '3%' },
      { id: generateId(), description: 'Due Diligence Fee', budget: 500, actual: 0, notes: '' },
      { id: generateId(), description: 'PHC Fees', budget: 2500, actual: 0, notes: '' },
    ],
  },
  {
    id: 'site_specific', name: 'SITE SPECIFIC COSTS',
    items: [
      { id: generateId(), description: 'Grading/Lot Prep', budget: 5000, actual: 0, notes: '' },
      { id: generateId(), description: 'Driveway Approach', budget: 2500, actual: 0, notes: '' },
      { id: generateId(), description: 'Utility Connections', budget: 3000, actual: 0, notes: '' },
      { id: generateId(), description: 'Dumpster Placement', budget: 500, actual: 0, notes: '' },
      { id: generateId(), description: 'Tree Removal', budget: 1500, actual: 0, notes: '' },
      { id: generateId(), description: 'Other Site Work', budget: 875, actual: 0, notes: '' },
    ],
  },
  {
    id: 'vertical_construction', name: 'VERTICAL CONSTRUCTION - S&B',
    items: [
      { id: generateId(), description: 'Permits & Fees', budget: 2500, actual: 0, notes: '' },
      { id: generateId(), description: 'Foundation', budget: 12000, actual: 0, notes: '' },
      { id: generateId(), description: 'Lumber & Framing', budget: 24000, actual: 0, notes: '' },
      { id: generateId(), description: 'Trusses (Floor & Roof)', budget: 10000, actual: 0, notes: '' },
      { id: generateId(), description: 'Roofing', budget: 5500, actual: 0, notes: '' },
      { id: generateId(), description: 'Siding & Exterior', budget: 9500, actual: 0, notes: '' },
      { id: generateId(), description: 'Windows & Doors', budget: 8100, actual: 0, notes: '' },
      { id: generateId(), description: 'Plumbing', budget: 15000, actual: 0, notes: '' },
      { id: generateId(), description: 'HVAC', budget: 11000, actual: 0, notes: '' },
      { id: generateId(), description: 'Electrical', budget: 9000, actual: 0, notes: '' },
      { id: generateId(), description: 'Insulation', budget: 4200, actual: 0, notes: '' },
      { id: generateId(), description: 'Drywall', budget: 11000, actual: 0, notes: '' },
      { id: generateId(), description: 'Interior Paint', budget: 4100, actual: 0, notes: '' },
      { id: generateId(), description: 'Interior Trim & Doors', budget: 5500, actual: 0, notes: '' },
      { id: generateId(), description: 'Cabinets', budget: 5700, actual: 0, notes: '' },
      { id: generateId(), description: 'Countertops', budget: 4200, actual: 0, notes: '' },
      { id: generateId(), description: 'Flooring - LVP', budget: 3600, actual: 0, notes: '' },
      { id: generateId(), description: 'Flooring - Carpet', budget: 2000, actual: 0, notes: '' },
      { id: generateId(), description: 'Appliances', budget: 1616, actual: 0, notes: '' },
      { id: generateId(), description: 'Final Clean & Punch', budget: 1500, actual: 0, notes: '' },
    ],
  },
  {
    id: 'upgrades', name: 'UPGRADE PACKAGE - CLASSIC',
    items: [
      { id: generateId(), description: 'Cabinet Upgrade', budget: 1500, actual: 0, notes: '' },
      { id: generateId(), description: 'Countertop Upgrade', budget: 1000, actual: 0, notes: '' },
      { id: generateId(), description: 'Flooring Upgrade', budget: 800, actual: 0, notes: '' },
      { id: generateId(), description: 'Fixture Upgrade', budget: 700, actual: 0, notes: '' },
      { id: generateId(), description: 'Other Upgrades', budget: 1000, actual: 0, notes: '' },
    ],
  },
  {
    id: 'soft_costs', name: 'SOFT COSTS',
    items: [
      { id: generateId(), description: 'Survey', budget: 500, actual: 0, notes: '' },
      { id: generateId(), description: 'Engineering', budget: 400, actual: 0, notes: '' },
      { id: generateId(), description: 'Insurance', budget: 750, actual: 0, notes: '' },
      { id: generateId(), description: 'Property Taxes', budget: 500, actual: 0, notes: '' },
      { id: generateId(), description: 'Warranty Reserve', budget: 500, actual: 0, notes: '' },
    ],
  },
  {
    id: 'builder_profit', name: 'BUILDER PROFIT',
    items: [{ id: generateId(), description: 'Builder Margin (20%)', budget: 31340, actual: 0, notes: '20% of S&B' }],
  },
  {
    id: 'financing', name: 'FINANCING COSTS',
    items: [
      { id: generateId(), description: 'Loan Origination', budget: 2835, actual: 0, notes: '1%' },
      { id: generateId(), description: 'Interest Reserve', budget: 7350, actual: 0, notes: '7 months @ 10.25%' },
      { id: generateId(), description: 'Appraisal/Inspection', budget: 1000, actual: 0, notes: '' },
    ],
  },
  {
    id: 'contingency', name: 'CONTINGENCY',
    items: [{ id: generateId(), description: 'Construction Contingency', budget: 5000, actual: 0, notes: '~3%' }],
  },
];

export const IndividualSpecHomeBudget = () => {
  const [activeTab, setActiveTab] = useState('budget');
  const [projectInfo, setProjectInfo] = useState({ projectName: '', address: '', cityStateZip: '', parcelNumber: '' });
  const [planSelection, setPlanSelection] = useState({ planName: 'Cherry', heatedSqFt: 2214, bedsBaths: '4/3', garage: '2-car', upgradePackage: 'Classic' });
  const [profitAnalysis, setProfitAnalysis] = useState({ projectedSalePrice: 405000, salesCommissionRate: 0.05, sellerClosingRate: 0.005, incentives: 5000 });
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
    const salesCommission = profitAnalysis.projectedSalePrice * profitAnalysis.salesCommissionRate;
    const sellerClosing = profitAnalysis.projectedSalePrice * profitAnalysis.sellerClosingRate;
    const netProceeds = profitAnalysis.projectedSalePrice - salesCommission - sellerClosing - profitAnalysis.incentives;
    const grossProfit = netProceeds - totals.budgetTotal;
    const grossMargin = profitAnalysis.projectedSalePrice > 0 ? grossProfit / profitAnalysis.projectedSalePrice : 0;
    const requiredEquity = totals.budgetTotal * 0.1;
    const roi = requiredEquity > 0 ? grossProfit / requiredEquity : 0;
    const cashMultiple = requiredEquity > 0 ? (requiredEquity + grossProfit) / requiredEquity : 0;
    const costPerSF = planSelection.heatedSqFt > 0 ? totals.budgetTotal / planSelection.heatedSqFt : 0;
    const salePricePerSF = planSelection.heatedSqFt > 0 ? profitAnalysis.projectedSalePrice / planSelection.heatedSqFt : 0;
    return { salesCommission, sellerClosing, netProceeds, grossProfit, grossMargin, requiredEquity, roi, cashMultiple, costPerSF, salePricePerSF };
  }, [profitAnalysis, totals, planSelection]);

  const updateLineItem = (categoryId, itemId, field, value) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat;
      return { ...cat, items: cat.items.map(item => item.id !== itemId ? item : { ...item, [field]: value }) };
    }));
  };

  const tabs = [{ id: 'budget', label: 'Construction Budget' }, { id: 'analysis', label: 'Profit Analysis' }];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-emerald-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">INDIVIDUAL SPEC HOME BUDGET</h1>
            <p className="text-emerald-200 text-sm">Single Home Build for Sale</p>
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
                  <TextInput label="City, State, Zip" value={projectInfo.cityStateZip} onChange={(v) => setProjectInfo(p => ({ ...p, cityStateZip: v }))} />
                </div>
                <h3 className="font-semibold text-slate-800 mt-6 mb-4 pb-2 border-b">Plan Selection</h3>
                <div className="space-y-3">
                  <TextInput label="Plan Name" value={planSelection.planName} onChange={(v) => setPlanSelection(p => ({ ...p, planName: v }))} />
                  <NumberInput label="Heated Sq Ft" value={planSelection.heatedSqFt} onChange={(v) => setPlanSelection(p => ({ ...p, heatedSqFt: v }))} />
                  <TextInput label="Beds/Baths" value={planSelection.bedsBaths} onChange={(v) => setPlanSelection(p => ({ ...p, bedsBaths: v }))} />
                </div>
                <div className="mt-6 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="text-xs font-semibold text-emerald-700 mb-2">QUICK SUMMARY</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-slate-600">Total Budget:</span><span className="font-mono font-semibold">{formatCurrency(totals.budgetTotal)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Cost/SF:</span><span className="font-mono">{formatCurrency(metrics.costPerSF, { showCents: true })}</span></div>
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
                  <CategorySection key={category.id} title={category.name} color="green">
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
              <GrandTotalRow label="TOTAL PROJECT COST" budgetTotal={totals.budgetTotal} actualTotal={totals.actualTotal > 0 ? totals.actualTotal : undefined} />
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-4">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800 mb-4">Sales Projections</h3>
                <div className="space-y-4">
                  <CurrencyInput label="Projected Sale Price" value={profitAnalysis.projectedSalePrice} onChange={(v) => setProfitAnalysis(p => ({ ...p, projectedSalePrice: v }))} />
                  <PercentInput label="Sales Commission" value={profitAnalysis.salesCommissionRate} onChange={(v) => setProfitAnalysis(p => ({ ...p, salesCommissionRate: v }))} />
                  <PercentInput label="Seller Closing Costs" value={profitAnalysis.sellerClosingRate} onChange={(v) => setProfitAnalysis(p => ({ ...p, sellerClosingRate: v }))} />
                  <CurrencyInput label="Buyer Incentives" value={profitAnalysis.incentives} onChange={(v) => setProfitAnalysis(p => ({ ...p, incentives: v }))} />
                </div>
                <div className="mt-6 pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Sales Commission:</span><span className="font-mono text-red-600">-{formatCurrency(metrics.salesCommission)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Closing Costs:</span><span className="font-mono text-red-600">-{formatCurrency(metrics.sellerClosing)}</span></div>
                  <div className="flex justify-between text-sm font-semibold pt-2 border-t"><span>Net Proceeds:</span><span className="font-mono">{formatCurrency(metrics.netProceeds)}</span></div>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-8">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800 mb-4">Profit Analysis</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard label="Total Project Cost" value={totals.budgetTotal} />
                  <MetricCard label="Net Sales Proceeds" value={metrics.netProceeds} />
                  <MetricCard label="Gross Profit" value={metrics.grossProfit} trend={metrics.grossProfit > 0 ? 'up' : 'down'} />
                  <MetricCard label="Gross Margin" value={metrics.grossMargin} format="percent" />
                  <MetricCard label="Required Equity (10%)" value={metrics.requiredEquity} />
                  <MetricCard label="Return on Equity" value={metrics.roi} format="percent" trend={metrics.roi > 0.2 ? 'up' : 'neutral'} />
                  <MetricCard label="Cash Multiple" value={metrics.cashMultiple} format="multiple" />
                  <MetricCard label="Cost Per SF" value={metrics.costPerSF} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndividualSpecHomeBudget;
