// AtlasDev - Horizontal Lot Development Budget
// 100 Lot Subdivision Template
// VanRock Holdings LLC

import React, { useState, useMemo } from 'react';
import {
  CurrencyInput,
  NumberInput,
  TextInput,
  CalculatedField,
  CategorySection,
  BudgetLineItemRow,
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
  totalLots: number;
  avgLotSize: number;
  developableAcres: number;
}

interface DrawItem {
  drawNumber: number;
  month: number;
  category: string;
  amount: number;
  inspectorApproval: string;
  dateFunded: string;
}

// ============================================
// DEFAULT DATA
// ============================================

const defaultProjectInfo: ProjectInfo = {
  projectName: '',
  location: '',
  totalAcreage: 50,
  totalLots: 100,
  avgLotSize: 7500,
  developableAcres: 35,
};

const defaultCategories: Category[] = [
  {
    id: 'land_acquisition',
    name: 'LAND ACQUISITION',
    items: [
      { id: generateId(), description: 'Raw Land Purchase', amount: 2500000, notes: 'Based on $50K/acre' },
      { id: generateId(), description: 'Closing Costs', amount: 37500, notes: '1.5% of purchase' },
      { id: generateId(), description: 'Due Diligence', amount: 25000, notes: 'Survey, Phase I, Geotech' },
      { id: generateId(), description: 'Legal Fees - Acquisition', amount: 15000, notes: '' },
    ],
  },
  {
    id: 'entitlement_engineering',
    name: 'ENTITLEMENT & ENGINEERING',
    items: [
      { id: generateId(), description: 'Civil Engineering', amount: 175000, notes: 'Plans, permitting support' },
      { id: generateId(), description: 'Land Planning/Architecture', amount: 50000, notes: 'Site layout, amenity design' },
      { id: generateId(), description: 'Environmental Studies', amount: 35000, notes: 'Wetlands, buffers, etc.' },
      { id: generateId(), description: 'Traffic Study', amount: 25000, notes: 'If required' },
      { id: generateId(), description: 'Permit Fees', amount: 150000, notes: '$1,500/lot' },
      { id: generateId(), description: 'Impact Fees', amount: 400000, notes: '$4,000/lot - varies by jurisdiction' },
      { id: generateId(), description: 'Legal - Entitlement', amount: 30000, notes: 'Zoning, HOA docs' },
      { id: generateId(), description: 'Surveying', amount: 75000, notes: 'Boundary, topo, staking' },
    ],
  },
  {
    id: 'site_work_grading',
    name: 'SITE WORK & GRADING',
    items: [
      { id: generateId(), description: 'Mass Grading', amount: 450000, notes: '$4,500/lot' },
      { id: generateId(), description: 'Clearing & Grubbing', amount: 200000, notes: '$2,000/lot' },
      { id: generateId(), description: 'Erosion Control', amount: 75000, notes: 'Silt fence, basins' },
      { id: generateId(), description: 'Demolition', amount: 25000, notes: 'If applicable' },
      { id: generateId(), description: 'Tree Mitigation', amount: 50000, notes: 'Replanting requirements' },
    ],
  },
  {
    id: 'infrastructure_roads',
    name: 'INFRASTRUCTURE - ROADS',
    items: [
      { id: generateId(), description: 'Road Base & Paving', amount: 800000, notes: '$8,000/lot' },
      { id: generateId(), description: 'Curb & Gutter', amount: 250000, notes: '$2,500/lot' },
      { id: generateId(), description: 'Sidewalks', amount: 150000, notes: '$1,500/lot' },
      { id: generateId(), description: 'Signage & Striping', amount: 25000, notes: '' },
      { id: generateId(), description: 'Street Lighting', amount: 100000, notes: '$1,000/lot' },
    ],
  },
  {
    id: 'infrastructure_utilities',
    name: 'INFRASTRUCTURE - UTILITIES',
    items: [
      { id: generateId(), description: 'Water Main Extension', amount: 300000, notes: '$3,000/lot' },
      { id: generateId(), description: 'Sanitary Sewer', amount: 350000, notes: '$3,500/lot' },
      { id: generateId(), description: 'Storm Drainage', amount: 400000, notes: '$4,000/lot' },
      { id: generateId(), description: 'Detention/Retention Ponds', amount: 200000, notes: '' },
      { id: generateId(), description: 'Electric/Gas Conduit', amount: 150000, notes: '$1,500/lot' },
      { id: generateId(), description: 'Telecom/Cable Conduit', amount: 50000, notes: '$500/lot' },
    ],
  },
  {
    id: 'amenities_landscaping',
    name: 'AMENITIES & LANDSCAPING',
    items: [
      { id: generateId(), description: 'Entry Monument', amount: 75000, notes: 'Signage, landscaping' },
      { id: generateId(), description: 'Common Area Landscaping', amount: 150000, notes: '' },
      { id: generateId(), description: 'Irrigation - Common Areas', amount: 50000, notes: '' },
      { id: generateId(), description: 'Amenity Center/Pool', amount: 0, notes: 'If applicable' },
      { id: generateId(), description: 'Playground/Parks', amount: 50000, notes: '' },
      { id: generateId(), description: 'Fencing', amount: 100000, notes: 'Perimeter, amenity areas' },
    ],
  },
  {
    id: 'soft_costs',
    name: 'SOFT COSTS',
    items: [
      { id: generateId(), description: 'Construction Management', amount: 200000, notes: '3-4% of hard costs' },
      { id: generateId(), description: 'Project Management', amount: 100000, notes: '' },
      { id: generateId(), description: 'Insurance - Builder\'s Risk', amount: 75000, notes: '' },
      { id: generateId(), description: 'Property Taxes (During Dev)', amount: 50000, notes: '' },
      { id: generateId(), description: 'HOA Setup Costs', amount: 25000, notes: '' },
      { id: generateId(), description: 'Marketing/Sales', amount: 150000, notes: 'Signage, website, etc.' },
      { id: generateId(), description: 'Accounting/Admin', amount: 30000, notes: '' },
    ],
  },
  {
    id: 'financing_costs',
    name: 'FINANCING COSTS',
    items: [
      { id: generateId(), description: 'Loan Origination', amount: 100000, notes: '1% of loan amount' },
      { id: generateId(), description: 'Interest Reserve', amount: 450000, notes: 'Estimated 18-month carry' },
      { id: generateId(), description: 'Appraisal/Inspection Fees', amount: 25000, notes: '' },
      { id: generateId(), description: 'Title Insurance', amount: 15000, notes: '' },
    ],
  },
  {
    id: 'contingency',
    name: 'CONTINGENCY',
    items: [
      { id: generateId(), description: 'Hard Cost Contingency', amount: 250000, notes: '5% of hard costs' },
      { id: generateId(), description: 'Soft Cost Contingency', amount: 50000, notes: '5% of soft costs' },
    ],
  },
];

const defaultDrawSchedule: DrawItem[] = [
  { drawNumber: 1, month: 1, category: 'Land Acquisition & Closing', amount: 2577500, inspectorApproval: '', dateFunded: '' },
  { drawNumber: 2, month: 2, category: 'Engineering & Permits', amount: 250000, inspectorApproval: '', dateFunded: '' },
  { drawNumber: 3, month: 3, category: 'Mass Grading - 50%', amount: 362500, inspectorApproval: '', dateFunded: '' },
  { drawNumber: 4, month: 4, category: 'Mass Grading Complete + Infrastructure Start', amount: 500000, inspectorApproval: '', dateFunded: '' },
  { drawNumber: 5, month: 6, category: 'Roads & Utilities - 50%', amount: 650000, inspectorApproval: '', dateFunded: '' },
  { drawNumber: 6, month: 8, category: 'Roads & Utilities - 75%', amount: 500000, inspectorApproval: '', dateFunded: '' },
  { drawNumber: 7, month: 10, category: 'Infrastructure Complete', amount: 400000, inspectorApproval: '', dateFunded: '' },
  { drawNumber: 8, month: 12, category: 'Amenities & Landscaping', amount: 350000, inspectorApproval: '', dateFunded: '' },
  { drawNumber: 9, month: 14, category: 'Final Punch & Acceptance', amount: 200000, inspectorApproval: '', dateFunded: '' },
  { drawNumber: 10, month: 16, category: 'Contingency/Retainage Release', amount: 300000, inspectorApproval: '', dateFunded: '' },
];

// ============================================
// MAIN COMPONENT
// ============================================

export const HorizontalLotDevelopmentBudget: React.FC = () => {
  const [activeTab, setActiveTab] = useState('budget');
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>(defaultProjectInfo);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [drawSchedule, setDrawSchedule] = useState<DrawItem[]>(defaultDrawSchedule);

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

  const perLot = useMemo(() => {
    return projectInfo.totalLots > 0 ? grandTotal / projectInfo.totalLots : 0;
  }, [grandTotal, projectInfo.totalLots]);

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

  const updateDrawItem = (drawNumber: number, field: keyof DrawItem, value: string | number) => {
    setDrawSchedule(prev => prev.map(draw => {
      if (draw.drawNumber !== drawNumber) return draw;
      return { ...draw, [field]: value };
    }));
  };

  // Tab definitions
  const tabs = [
    { id: 'budget', label: 'Development Budget' },
    { id: 'draws', label: 'Draw Schedule' },
    { id: 'summary', label: 'Summary' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-emerald-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">HORIZONTAL LOT DEVELOPMENT BUDGET</h1>
            <p className="text-emerald-200 text-sm">100 Lot Subdivision - Sample Template</p>
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
                      label="Developable Acres"
                      value={projectInfo.developableAcres}
                      onChange={(v) => updateProjectInfo('developableAcres', v)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <NumberInput
                      label="Total Lots"
                      value={projectInfo.totalLots}
                      onChange={(v) => updateProjectInfo('totalLots', v)}
                    />
                    <NumberInput
                      label="Avg Lot Size (SF)"
                      value={projectInfo.avgLotSize}
                      onChange={(v) => updateProjectInfo('avgLotSize', v)}
                    />
                  </div>
                </div>

                {/* Quick Metrics */}
                <h3 className="font-semibold text-slate-800 mt-6 mb-3 pb-2 border-b">Quick Metrics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Total Budget:</span>
                    <span className="font-mono font-semibold">{formatCurrency(grandTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Cost Per Lot:</span>
                    <span className="font-mono font-semibold">{formatCurrency(perLot)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Cost Per Acre:</span>
                    <span className="font-mono font-semibold">
                      {formatCurrency(projectInfo.totalAcreage > 0 ? grandTotal / projectInfo.totalAcreage : 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Categories */}
            <div className="col-span-12 lg:col-span-9">
              {/* Column Headers */}
              <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-slate-100 rounded-t text-xs font-semibold text-slate-600 mb-2">
                <div className="col-span-4">Description</div>
                <div className="col-span-2 text-right">Total Cost</div>
                <div className="col-span-2 text-right">Per Lot</div>
                <div className="col-span-1 text-right">% Total</div>
                <div className="col-span-3">Notes</div>
              </div>

              {categories.map((category, catIndex) => {
                const catTotal = categoryTotals.find(c => c.id === category.id)?.total || 0;
                return (
                  <CategorySection key={category.id} title={category.name} color="green">
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
                          {formatCurrency(item.amount / projectInfo.totalLots)}
                        </div>
                        <div className="col-span-1 text-right text-xs font-mono text-slate-500">
                          {formatPercent(grandTotal > 0 ? item.amount / grandTotal : 0)}
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
                      label={`Subtotal - ${category.name}`}
                      budgetTotal={catTotal}
                      perUnit={catTotal / projectInfo.totalLots}
                      percentOfTotal={grandTotal > 0 ? catTotal / grandTotal : 0}
                    />
                  </CategorySection>
                );
              })}

              {/* Grand Total */}
              <GrandTotalRow
                label="TOTAL PROJECT BUDGET"
                budgetTotal={grandTotal}
                perUnit={perLot}
              />
            </div>
          </div>
        )}

        {activeTab === 'draws' && (
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="bg-emerald-700 text-white px-4 py-3 rounded-t">
              <h3 className="font-semibold">HORIZONTAL DEVELOPMENT - DRAW SCHEDULE</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Draw #</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Month</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Category</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Cumulative</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">% Complete</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Inspector Approval</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Date Funded</th>
                  </tr>
                </thead>
                <tbody>
                  {drawSchedule.map((draw, index) => {
                    const cumulative = drawSchedule.slice(0, index + 1).reduce((sum, d) => sum + d.amount, 0);
                    return (
                      <tr key={draw.drawNumber} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-sm">{draw.drawNumber}</td>
                        <td className="px-4 py-3 text-sm">Month {draw.month}</td>
                        <td className="px-4 py-3 text-sm">{draw.category}</td>
                        <td className="px-4 py-3">
                          <CurrencyInput
                            value={draw.amount}
                            onChange={(v) => updateDrawItem(draw.drawNumber, 'amount', v)}
                            size="sm"
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm">{formatCurrency(cumulative)}</td>
                        <td className="px-4 py-3 text-right font-mono text-sm">
                          {formatPercent(grandTotal > 0 ? cumulative / grandTotal : 0)}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={draw.inspectorApproval}
                            onChange={(e) => updateDrawItem(draw.drawNumber, 'inspectorApproval', e.target.value)}
                            className="w-full h-7 text-sm px-2 border border-slate-200 rounded bg-emerald-50"
                            placeholder="Pending"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="date"
                            value={draw.dateFunded}
                            onChange={(e) => updateDrawItem(draw.drawNumber, 'dateFunded', e.target.value)}
                            className="h-7 text-sm px-2 border border-slate-200 rounded bg-emerald-50"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="grid grid-cols-12 gap-6">
            {/* Summary Metrics */}
            <div className="col-span-12 lg:col-span-4">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800 mb-4">Project Summary</h3>
                <div className="space-y-4">
                  <MetricCard label="Total Development Cost" value={grandTotal} size="lg" />
                  <MetricCard label="Cost Per Lot" value={perLot} />
                  <MetricCard label="Cost Per Developable Acre" value={grandTotal / projectInfo.developableAcres} />
                  <MetricCard label="Lots Per Acre" value={projectInfo.totalLots / projectInfo.developableAcres} format="number" />
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="col-span-12 lg:col-span-8">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800 mb-4">Cost Breakdown by Category</h3>
                <div className="space-y-2">
                  {categoryTotals.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">{cat.name}</span>
                          <span className="font-mono">{formatCurrency(cat.total)}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${(cat.total / grandTotal) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-16 text-right text-sm font-mono text-slate-500">
                        {formatPercent(cat.total / grandTotal)}
                      </div>
                    </div>
                  ))}
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
