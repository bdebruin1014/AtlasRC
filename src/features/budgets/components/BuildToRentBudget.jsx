// AtlasDev - Build to Rent Community Budget
import React, { useState, useMemo } from 'react';
import { CurrencyInput, NumberInput, TextInput, PercentInput, CategorySection, SubtotalRow, GrandTotalRow, MetricCard, TabNavigation, ActionButtons } from './ui/BudgetComponents';
import { formatCurrency, formatPercent, generateId } from '../utils/budgetCalculations';

const defaultCategories = [
  {
    id: 'land_acquisition', name: 'LAND ACQUISITION',
    items: [
      { id: generateId(), description: 'Land Purchase', budget: 1200000, actual: 0, notes: '' },
      { id: generateId(), description: 'Closing Costs', budget: 18000, actual: 0, notes: '1.5%' },
      { id: generateId(), description: 'Due Diligence', budget: 25000, actual: 0, notes: '' },
      { id: generateId(), description: 'Legal & Title', budget: 12000, actual: 0, notes: '' },
    ],
  },
  {
    id: 'site_development', name: 'SITE DEVELOPMENT',
    items: [
      { id: generateId(), description: 'Civil Engineering', budget: 95000, actual: 0, notes: '' },
      { id: generateId(), description: 'Clearing & Grading', budget: 185000, actual: 0, notes: '' },
      { id: generateId(), description: 'Utilities Infrastructure', budget: 425000, actual: 0, notes: '' },
      { id: generateId(), description: 'Roads & Parking', budget: 385000, actual: 0, notes: '' },
      { id: generateId(), description: 'Stormwater Management', budget: 165000, actual: 0, notes: '' },
      { id: generateId(), description: 'Landscaping', budget: 145000, actual: 0, notes: '' },
    ],
  },
  {
    id: 'vertical_construction', name: 'VERTICAL CONSTRUCTION',
    items: [
      { id: generateId(), description: 'Building Permits', budget: 85000, actual: 0, notes: '' },
      { id: generateId(), description: 'Foundations', budget: 420000, actual: 0, notes: '' },
      { id: generateId(), description: 'Framing & Structure', budget: 1850000, actual: 0, notes: '' },
      { id: generateId(), description: 'Roofing', budget: 285000, actual: 0, notes: '' },
      { id: generateId(), description: 'Exterior Finishes', budget: 565000, actual: 0, notes: '' },
      { id: generateId(), description: 'Windows & Doors', budget: 385000, actual: 0, notes: '' },
      { id: generateId(), description: 'Plumbing', budget: 485000, actual: 0, notes: '' },
      { id: generateId(), description: 'HVAC', budget: 625000, actual: 0, notes: '' },
      { id: generateId(), description: 'Electrical', budget: 445000, actual: 0, notes: '' },
      { id: generateId(), description: 'Insulation & Drywall', budget: 485000, actual: 0, notes: '' },
      { id: generateId(), description: 'Interior Finishes', budget: 685000, actual: 0, notes: '' },
      { id: generateId(), description: 'Flooring', budget: 325000, actual: 0, notes: '' },
      { id: generateId(), description: 'Cabinets & Counters', budget: 385000, actual: 0, notes: '' },
      { id: generateId(), description: 'Appliances', budget: 185000, actual: 0, notes: '' },
    ],
  },
  {
    id: 'amenities', name: 'AMENITIES',
    items: [
      { id: generateId(), description: 'Clubhouse/Leasing Office', budget: 285000, actual: 0, notes: '' },
      { id: generateId(), description: 'Pool & Pool House', budget: 225000, actual: 0, notes: '' },
      { id: generateId(), description: 'Fitness Center', budget: 85000, actual: 0, notes: '' },
      { id: generateId(), description: 'Dog Park', budget: 35000, actual: 0, notes: '' },
      { id: generateId(), description: 'Playground', budget: 45000, actual: 0, notes: '' },
      { id: generateId(), description: 'Community Signage', budget: 65000, actual: 0, notes: '' },
    ],
  },
  {
    id: 'soft_costs', name: 'SOFT COSTS',
    items: [
      { id: generateId(), description: 'Architecture & Design', budget: 185000, actual: 0, notes: '' },
      { id: generateId(), description: 'Project Management', budget: 125000, actual: 0, notes: '' },
      { id: generateId(), description: 'Insurance', budget: 95000, actual: 0, notes: '' },
      { id: generateId(), description: 'Property Taxes', budget: 45000, actual: 0, notes: '' },
      { id: generateId(), description: 'Legal & Accounting', budget: 55000, actual: 0, notes: '' },
      { id: generateId(), description: 'Marketing & Lease-Up', budget: 125000, actual: 0, notes: '' },
    ],
  },
  {
    id: 'financing', name: 'FINANCING COSTS',
    items: [
      { id: generateId(), description: 'Loan Origination', budget: 125000, actual: 0, notes: '1%' },
      { id: generateId(), description: 'Interest Reserve', budget: 485000, actual: 0, notes: '24 months' },
      { id: generateId(), description: 'Lender Fees', budget: 45000, actual: 0, notes: '' },
    ],
  },
  {
    id: 'contingency', name: 'CONTINGENCY & RESERVES',
    items: [
      { id: generateId(), description: 'Construction Contingency', budget: 350000, actual: 0, notes: '5%' },
      { id: generateId(), description: 'Operating Reserve', budget: 125000, actual: 0, notes: '3 months' },
    ],
  },
];

export const BuildToRentBudget = () => {
  const [activeTab, setActiveTab] = useState('budget');
  const [projectInfo, setProjectInfo] = useState({ projectName: '', address: '', totalUnits: 48, avgUnitSF: 1250, totalAcres: 8.5 });
  const [rentProjections, setRentProjections] = useState({ avgMonthlyRent: 1850, occupancyRate: 0.95, annualRentGrowth: 0.03, opexRatio: 0.35, capRate: 0.055 });
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
    const grossPotentialRent = projectInfo.totalUnits * rentProjections.avgMonthlyRent * 12;
    const effectiveGrossIncome = grossPotentialRent * rentProjections.occupancyRate;
    const operatingExpenses = effectiveGrossIncome * rentProjections.opexRatio;
    const noi = effectiveGrossIncome - operatingExpenses;
    const stabilizedValue = rentProjections.capRate > 0 ? noi / rentProjections.capRate : 0;
    const totalCost = totals.budgetTotal;
    const costPerUnit = projectInfo.totalUnits > 0 ? totalCost / projectInfo.totalUnits : 0;
    const costPerSF = projectInfo.totalUnits > 0 && projectInfo.avgUnitSF > 0 ? totalCost / (projectInfo.totalUnits * projectInfo.avgUnitSF) : 0;
    const developmentSpread = stabilizedValue - totalCost;
    const yieldOnCost = totalCost > 0 ? noi / totalCost : 0;
    const equityRequired = totalCost * 0.30;
    const equityMultiple = equityRequired > 0 ? (equityRequired + developmentSpread) / equityRequired : 0;
    const rentPerSF = projectInfo.avgUnitSF > 0 ? rentProjections.avgMonthlyRent / projectInfo.avgUnitSF : 0;
    return { grossPotentialRent, effectiveGrossIncome, operatingExpenses, noi, stabilizedValue, totalCost, costPerUnit, costPerSF, developmentSpread, yieldOnCost, equityRequired, equityMultiple, rentPerSF };
  }, [projectInfo, rentProjections, totals]);

  const updateLineItem = (categoryId, itemId, field, value) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat;
      return { ...cat, items: cat.items.map(item => item.id !== itemId ? item : { ...item, [field]: value }) };
    }));
  };

  const tabs = [{ id: 'budget', label: 'Development Budget' }, { id: 'analysis', label: 'Investment Analysis' }];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-purple-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">BUILD TO RENT COMMUNITY BUDGET</h1>
            <p className="text-purple-200 text-sm">BTR / Single-Family Rental Development</p>
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
                  <NumberInput label="Total Units" value={projectInfo.totalUnits} onChange={(v) => setProjectInfo(p => ({ ...p, totalUnits: v }))} />
                  <NumberInput label="Avg Unit SF" value={projectInfo.avgUnitSF} onChange={(v) => setProjectInfo(p => ({ ...p, avgUnitSF: v }))} />
                  <NumberInput label="Total Acres" value={projectInfo.totalAcres} onChange={(v) => setProjectInfo(p => ({ ...p, totalAcres: v }))} step={0.1} />
                </div>
                <div className="mt-6 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-xs font-semibold text-purple-700 mb-2">QUICK SUMMARY</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-slate-600">Total Budget:</span><span className="font-mono font-semibold">{formatCurrency(totals.budgetTotal)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Cost/Unit:</span><span className="font-mono">{formatCurrency(metrics.costPerUnit)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Yield on Cost:</span><span className="font-mono font-semibold text-purple-600">{formatPercent(metrics.yieldOnCost)}</span></div>
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
                  <CategorySection key={category.id} title={category.name} color="purple">
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
              <GrandTotalRow label="TOTAL DEVELOPMENT COST" budgetTotal={totals.budgetTotal} actualTotal={totals.actualTotal > 0 ? totals.actualTotal : undefined} perUnit={metrics.costPerUnit} />
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-4">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800 mb-4">Rent Projections</h3>
                <div className="space-y-4">
                  <CurrencyInput label="Avg Monthly Rent" value={rentProjections.avgMonthlyRent} onChange={(v) => setRentProjections(p => ({ ...p, avgMonthlyRent: v }))} />
                  <PercentInput label="Stabilized Occupancy" value={rentProjections.occupancyRate} onChange={(v) => setRentProjections(p => ({ ...p, occupancyRate: v }))} />
                  <PercentInput label="Annual Rent Growth" value={rentProjections.annualRentGrowth} onChange={(v) => setRentProjections(p => ({ ...p, annualRentGrowth: v }))} />
                  <PercentInput label="Operating Expense Ratio" value={rentProjections.opexRatio} onChange={(v) => setRentProjections(p => ({ ...p, opexRatio: v }))} />
                  <PercentInput label="Exit Cap Rate" value={rentProjections.capRate} onChange={(v) => setRentProjections(p => ({ ...p, capRate: v }))} />
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-8">
              <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
                <h3 className="font-semibold text-slate-800 mb-4">Investment Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard label="Total Development Cost" value={totals.budgetTotal} />
                  <MetricCard label="Stabilized NOI" value={metrics.noi} />
                  <MetricCard label="Stabilized Value" value={metrics.stabilizedValue} />
                  <MetricCard label="Development Spread" value={metrics.developmentSpread} trend={metrics.developmentSpread > 0 ? 'up' : 'down'} />
                  <MetricCard label="Yield on Cost" value={metrics.yieldOnCost} format="percent" trend={metrics.yieldOnCost > 0.06 ? 'up' : 'neutral'} />
                  <MetricCard label="Cost Per Unit" value={metrics.costPerUnit} />
                  <MetricCard label="Cost Per SF" value={metrics.costPerSF} />
                  <MetricCard label="Equity Multiple" value={metrics.equityMultiple} format="multiple" />
                </div>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800 mb-4">Operating Pro Forma (Year 1)</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b"><span className="text-slate-600">Gross Potential Rent</span><span className="font-mono font-medium">{formatCurrency(metrics.grossPotentialRent)}</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-slate-600">Less: Vacancy ({formatPercent(1 - rentProjections.occupancyRate)})</span><span className="font-mono text-red-600">-{formatCurrency(metrics.grossPotentialRent - metrics.effectiveGrossIncome)}</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="font-medium">Effective Gross Income</span><span className="font-mono font-medium">{formatCurrency(metrics.effectiveGrossIncome)}</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-slate-600">Less: Operating Expenses ({formatPercent(rentProjections.opexRatio)})</span><span className="font-mono text-red-600">-{formatCurrency(metrics.operatingExpenses)}</span></div>
                  <div className="flex justify-between py-2 bg-purple-50 px-2 rounded"><span className="font-bold">Net Operating Income (NOI)</span><span className="font-mono font-bold text-purple-700">{formatCurrency(metrics.noi)}</span></div>
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
