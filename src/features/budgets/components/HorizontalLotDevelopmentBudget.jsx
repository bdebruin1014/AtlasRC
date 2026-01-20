// AtlasDev - Horizontal Lot Development Budget
import React, { useState, useMemo } from 'react';
import { CurrencyInput, NumberInput, TextInput, PercentInput, CategorySection, SubtotalRow, GrandTotalRow, MetricCard, TabNavigation, ActionButtons } from './ui/BudgetComponents';
import { formatCurrency, formatPercent, generateId } from '../utils/budgetCalculations';

const defaultCategories = [
  {
    id: 'land_acquisition', name: 'LAND ACQUISITION',
    items: [
      { id: generateId(), description: 'Raw Land Purchase', budget: 850000, actual: 0, notes: '' },
      { id: generateId(), description: 'Buyer Closing Costs', budget: 12750, actual: 0, notes: '1.5%' },
      { id: generateId(), description: 'Acquisition Fee', budget: 25500, actual: 0, notes: '3%' },
      { id: generateId(), description: 'Due Diligence', budget: 15000, actual: 0, notes: '' },
      { id: generateId(), description: 'Legal & Title', budget: 8500, actual: 0, notes: '' },
    ],
  },
  {
    id: 'entitlement', name: 'ENTITLEMENT & DESIGN',
    items: [
      { id: generateId(), description: 'Engineering - Civil', budget: 85000, actual: 0, notes: '' },
      { id: generateId(), description: 'Surveying', budget: 25000, actual: 0, notes: '' },
      { id: generateId(), description: 'Geotechnical', budget: 15000, actual: 0, notes: '' },
      { id: generateId(), description: 'Environmental', budget: 12000, actual: 0, notes: '' },
      { id: generateId(), description: 'Traffic Study', budget: 8000, actual: 0, notes: '' },
      { id: generateId(), description: 'Landscape Architecture', budget: 18000, actual: 0, notes: '' },
      { id: generateId(), description: 'Permit Fees', budget: 45000, actual: 0, notes: '' },
      { id: generateId(), description: 'Impact Fees', budget: 180000, actual: 0, notes: '$4,000/lot' },
    ],
  },
  {
    id: 'site_development', name: 'SITE DEVELOPMENT',
    items: [
      { id: generateId(), description: 'Clearing & Grubbing', budget: 65000, actual: 0, notes: '' },
      { id: generateId(), description: 'Mass Grading', budget: 185000, actual: 0, notes: '' },
      { id: generateId(), description: 'Erosion Control', budget: 35000, actual: 0, notes: '' },
      { id: generateId(), description: 'Storm Drainage', budget: 220000, actual: 0, notes: '' },
      { id: generateId(), description: 'Sanitary Sewer', budget: 175000, actual: 0, notes: '' },
      { id: generateId(), description: 'Water Distribution', budget: 145000, actual: 0, notes: '' },
      { id: generateId(), description: 'Gas Lines', budget: 45000, actual: 0, notes: '' },
      { id: generateId(), description: 'Electric/Telecom', budget: 125000, actual: 0, notes: '' },
    ],
  },
  {
    id: 'roads_paving', name: 'ROADS & PAVING',
    items: [
      { id: generateId(), description: 'Roadway Subgrade', budget: 85000, actual: 0, notes: '' },
      { id: generateId(), description: 'Curb & Gutter', budget: 145000, actual: 0, notes: '' },
      { id: generateId(), description: 'Asphalt Paving', budget: 225000, actual: 0, notes: '' },
      { id: generateId(), description: 'Sidewalks', budget: 95000, actual: 0, notes: '' },
      { id: generateId(), description: 'Signage & Striping', budget: 18000, actual: 0, notes: '' },
    ],
  },
  {
    id: 'amenities', name: 'AMENITIES & COMMON AREAS',
    items: [
      { id: generateId(), description: 'Entry Monument', budget: 45000, actual: 0, notes: '' },
      { id: generateId(), description: 'Common Area Landscaping', budget: 85000, actual: 0, notes: '' },
      { id: generateId(), description: 'Irrigation System', budget: 35000, actual: 0, notes: '' },
      { id: generateId(), description: 'Pocket Park/Amenity', budget: 125000, actual: 0, notes: '' },
      { id: generateId(), description: 'Mailbox Kiosk', budget: 8500, actual: 0, notes: '' },
    ],
  },
  {
    id: 'soft_costs', name: 'SOFT COSTS',
    items: [
      { id: generateId(), description: 'Project Management', budget: 75000, actual: 0, notes: '' },
      { id: generateId(), description: 'Insurance', budget: 28000, actual: 0, notes: '' },
      { id: generateId(), description: 'Property Taxes', budget: 15000, actual: 0, notes: '' },
      { id: generateId(), description: 'Legal', budget: 18000, actual: 0, notes: '' },
      { id: generateId(), description: 'Accounting', budget: 8000, actual: 0, notes: '' },
      { id: generateId(), description: 'Marketing', budget: 25000, actual: 0, notes: '' },
    ],
  },
  {
    id: 'financing', name: 'FINANCING COSTS',
    items: [
      { id: generateId(), description: 'Loan Origination', budget: 42500, actual: 0, notes: '1%' },
      { id: generateId(), description: 'Interest Reserve', budget: 185000, actual: 0, notes: '18 months @ 10%' },
      { id: generateId(), description: 'Appraisal/Inspection', budget: 12000, actual: 0, notes: '' },
    ],
  },
  {
    id: 'contingency', name: 'CONTINGENCY',
    items: [
      { id: generateId(), description: 'Hard Cost Contingency', budget: 125000, actual: 0, notes: '5%' },
      { id: generateId(), description: 'Soft Cost Contingency', budget: 35000, actual: 0, notes: '5%' },
    ],
  },
];

export const HorizontalLotDevelopmentBudget = () => {
  const [activeTab, setActiveTab] = useState('budget');
  const [projectInfo, setProjectInfo] = useState({ projectName: '', address: '', totalAcres: 25, totalLots: 45, avgLotSize: 12000 });
  const [salesProjections, setSalesProjections] = useState({ avgLotPrice: 95000, salesCommissionRate: 0.04, closingCostRate: 0.01, absorptionPerMonth: 4 });
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
    const totalRevenue = projectInfo.totalLots * salesProjections.avgLotPrice;
    const salesCommission = totalRevenue * salesProjections.salesCommissionRate;
    const closingCosts = totalRevenue * salesProjections.closingCostRate;
    const netRevenue = totalRevenue - salesCommission - closingCosts;
    const grossProfit = netRevenue - totals.budgetTotal;
    const grossMargin = totalRevenue > 0 ? grossProfit / totalRevenue : 0;
    const costPerLot = projectInfo.totalLots > 0 ? totals.budgetTotal / projectInfo.totalLots : 0;
    const profitPerLot = projectInfo.totalLots > 0 ? grossProfit / projectInfo.totalLots : 0;
    const revenuePerLot = salesProjections.avgLotPrice;
    const absorptionMonths = salesProjections.absorptionPerMonth > 0 ? projectInfo.totalLots / salesProjections.absorptionPerMonth : 0;
    const equityRequired = totals.budgetTotal * 0.25;
    const roi = equityRequired > 0 ? grossProfit / equityRequired : 0;
    return { totalRevenue, salesCommission, closingCosts, netRevenue, grossProfit, grossMargin, costPerLot, profitPerLot, revenuePerLot, absorptionMonths, equityRequired, roi };
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
      <div className="bg-blue-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">HORIZONTAL LOT DEVELOPMENT BUDGET</h1>
            <p className="text-blue-200 text-sm">Subdivision / Land Development</p>
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
                  <TextInput label="Address/Location" value={projectInfo.address} onChange={(v) => setProjectInfo(p => ({ ...p, address: v }))} />
                  <NumberInput label="Total Acres" value={projectInfo.totalAcres} onChange={(v) => setProjectInfo(p => ({ ...p, totalAcres: v }))} />
                  <NumberInput label="Total Lots" value={projectInfo.totalLots} onChange={(v) => setProjectInfo(p => ({ ...p, totalLots: v }))} />
                  <NumberInput label="Avg Lot Size (SF)" value={projectInfo.avgLotSize} onChange={(v) => setProjectInfo(p => ({ ...p, avgLotSize: v }))} />
                </div>
                <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-xs font-semibold text-blue-700 mb-2">QUICK SUMMARY</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-slate-600">Total Budget:</span><span className="font-mono font-semibold">{formatCurrency(totals.budgetTotal)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Cost/Lot:</span><span className="font-mono">{formatCurrency(metrics.costPerLot)}</span></div>
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
                  <CategorySection key={category.id} title={category.name} color="blue">
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
              <GrandTotalRow label="TOTAL DEVELOPMENT COST" budgetTotal={totals.budgetTotal} actualTotal={totals.actualTotal > 0 ? totals.actualTotal : undefined} perUnit={metrics.costPerLot} />
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-4">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800 mb-4">Sales Projections</h3>
                <div className="space-y-4">
                  <CurrencyInput label="Average Lot Price" value={salesProjections.avgLotPrice} onChange={(v) => setSalesProjections(p => ({ ...p, avgLotPrice: v }))} />
                  <PercentInput label="Sales Commission" value={salesProjections.salesCommissionRate} onChange={(v) => setSalesProjections(p => ({ ...p, salesCommissionRate: v }))} />
                  <PercentInput label="Closing Costs" value={salesProjections.closingCostRate} onChange={(v) => setSalesProjections(p => ({ ...p, closingCostRate: v }))} />
                  <NumberInput label="Absorption (lots/month)" value={salesProjections.absorptionPerMonth} onChange={(v) => setSalesProjections(p => ({ ...p, absorptionPerMonth: v }))} />
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-8">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800 mb-4">Profit Analysis</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard label="Total Revenue" value={metrics.totalRevenue} />
                  <MetricCard label="Total Cost" value={totals.budgetTotal} />
                  <MetricCard label="Gross Profit" value={metrics.grossProfit} trend={metrics.grossProfit > 0 ? 'up' : 'down'} />
                  <MetricCard label="Gross Margin" value={metrics.grossMargin} format="percent" />
                  <MetricCard label="Cost Per Lot" value={metrics.costPerLot} />
                  <MetricCard label="Profit Per Lot" value={metrics.profitPerLot} />
                  <MetricCard label="Equity Required (25%)" value={metrics.equityRequired} />
                  <MetricCard label="ROI" value={metrics.roi} format="percent" trend={metrics.roi > 0.25 ? 'up' : 'neutral'} />
                </div>
                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-medium text-slate-700 mb-3">Sellout Timeline</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{projectInfo.totalLots}</p>
                      <p className="text-xs text-slate-500">Total Lots</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{salesProjections.absorptionPerMonth}</p>
                      <p className="text-xs text-slate-500">Lots/Month</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{Math.ceil(metrics.absorptionMonths)}</p>
                      <p className="text-xs text-slate-500">Months to Sellout</p>
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

export default HorizontalLotDevelopmentBudget;
