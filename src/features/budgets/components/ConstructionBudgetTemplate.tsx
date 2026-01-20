// AtlasDev - Construction Budget Template
// Schedule of Values (SOV) Draw System
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
  itemNumber: number;
  description: string;
  contractAmount: number;
  priorDraws: number;
  thisDraw: number;
  notes: string;
}

interface Category {
  id: string;
  name: string;
  items: LineItem[];
}

interface ProjectInfo {
  projectName: string;
  address: string;
  planName: string;
  sqFt: number;
  contractDate: string;
  contractor: string;
}

interface DrawInfo {
  drawNumber: number;
  drawDate: string;
  inspectorName: string;
  inspectionDate: string;
  approvalStatus: 'pending' | 'approved' | 'revision_needed';
}

// ============================================
// DEFAULT DATA
// ============================================

const defaultProjectInfo: ProjectInfo = {
  projectName: '',
  address: '',
  planName: '',
  sqFt: 2214,
  contractDate: '',
  contractor: '',
};

const defaultDrawInfo: DrawInfo = {
  drawNumber: 1,
  drawDate: '',
  inspectorName: '',
  inspectionDate: '',
  approvalStatus: 'pending',
};

const defaultCategories: Category[] = [
  {
    id: 'permits_fees',
    name: '1. PERMITS & FEES',
    items: [
      { id: generateId(), itemNumber: 101, description: 'Building Permit', contractAmount: 1500, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 102, description: 'Impact Fees', contractAmount: 500, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 103, description: 'Other Permits/Fees', contractAmount: 500, priorDraws: 0, thisDraw: 0, notes: '' },
    ],
  },
  {
    id: 'site_work',
    name: '2. SITE WORK',
    items: [
      { id: generateId(), itemNumber: 201, description: 'Clearing & Grading', contractAmount: 3500, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 202, description: 'Driveway Base', contractAmount: 1500, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 203, description: 'Utility Rough-in', contractAmount: 2500, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 204, description: 'Erosion Control', contractAmount: 500, priorDraws: 0, thisDraw: 0, notes: '' },
    ],
  },
  {
    id: 'foundation',
    name: '3. FOUNDATION',
    items: [
      { id: generateId(), itemNumber: 301, description: 'Footing & Foundation', contractAmount: 10000, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 302, description: 'Waterproofing', contractAmount: 1200, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 303, description: 'Backfill', contractAmount: 800, priorDraws: 0, thisDraw: 0, notes: '' },
    ],
  },
  {
    id: 'framing',
    name: '4. FRAMING',
    items: [
      { id: generateId(), itemNumber: 401, description: 'Lumber Package', contractAmount: 18000, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 402, description: 'Framing Labor', contractAmount: 8000, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 403, description: 'Trusses (Floor)', contractAmount: 4000, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 404, description: 'Trusses (Roof)', contractAmount: 6000, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 405, description: 'Sheathing', contractAmount: 3500, priorDraws: 0, thisDraw: 0, notes: '' },
    ],
  },
  {
    id: 'exterior',
    name: '5. EXTERIOR',
    items: [
      { id: generateId(), itemNumber: 501, description: 'Roofing - Material', contractAmount: 3500, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 502, description: 'Roofing - Labor', contractAmount: 2000, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 503, description: 'Siding - Material', contractAmount: 5500, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 504, description: 'Siding - Labor', contractAmount: 3000, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 505, description: 'Windows', contractAmount: 5500, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 506, description: 'Exterior Doors', contractAmount: 1500, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 507, description: 'Garage Doors', contractAmount: 1600, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 508, description: 'Exterior Trim', contractAmount: 1500, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 509, description: 'Gutters', contractAmount: 900, priorDraws: 0, thisDraw: 0, notes: '' },
    ],
  },
  {
    id: 'mep_rough',
    name: '6. MEP ROUGH-IN',
    items: [
      { id: generateId(), itemNumber: 601, description: 'Plumbing - Rough', contractAmount: 8000, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 602, description: 'Electrical - Rough', contractAmount: 5000, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 603, description: 'HVAC - Rough & Equipment', contractAmount: 9000, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 604, description: 'Low Voltage Rough', contractAmount: 800, priorDraws: 0, thisDraw: 0, notes: '' },
    ],
  },
  {
    id: 'insulation_drywall',
    name: '7. INSULATION & DRYWALL',
    items: [
      { id: generateId(), itemNumber: 701, description: 'Insulation - Material', contractAmount: 2500, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 702, description: 'Insulation - Labor', contractAmount: 1700, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 703, description: 'Drywall - Material', contractAmount: 5500, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 704, description: 'Drywall - Labor/Finish', contractAmount: 5500, priorDraws: 0, thisDraw: 0, notes: '' },
    ],
  },
  {
    id: 'interior_finishes',
    name: '8. INTERIOR FINISHES',
    items: [
      { id: generateId(), itemNumber: 801, description: 'Interior Paint', contractAmount: 4100, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 802, description: 'Interior Trim', contractAmount: 3500, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 803, description: 'Interior Doors', contractAmount: 2000, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 804, description: 'Cabinets', contractAmount: 5700, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 805, description: 'Countertops', contractAmount: 4200, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 806, description: 'Flooring - LVP', contractAmount: 3600, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 807, description: 'Flooring - Carpet', contractAmount: 2000, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 808, description: 'Tile', contractAmount: 0, priorDraws: 0, thisDraw: 0, notes: 'If applicable' },
      { id: generateId(), itemNumber: 809, description: 'Shelving', contractAmount: 580, priorDraws: 0, thisDraw: 0, notes: '' },
    ],
  },
  {
    id: 'mep_finish',
    name: '9. MEP FINISH',
    items: [
      { id: generateId(), itemNumber: 901, description: 'Plumbing - Trim/Fixtures', contractAmount: 7000, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 902, description: 'Electrical - Trim/Fixtures', contractAmount: 4000, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 903, description: 'Light Fixtures', contractAmount: 650, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 904, description: 'HVAC - Trim', contractAmount: 2000, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 905, description: 'Appliances', contractAmount: 1616, priorDraws: 0, thisDraw: 0, notes: '' },
    ],
  },
  {
    id: 'final_completion',
    name: '10. FINAL COMPLETION',
    items: [
      { id: generateId(), itemNumber: 1001, description: 'Mirrors & Bath Accessories', contractAmount: 1100, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 1002, description: 'Driveway Finish', contractAmount: 2500, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 1003, description: 'Final Grading/Seeding', contractAmount: 1500, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 1004, description: 'Final Clean', contractAmount: 500, priorDraws: 0, thisDraw: 0, notes: '' },
      { id: generateId(), itemNumber: 1005, description: 'Touch-up & Punch List', contractAmount: 1000, priorDraws: 0, thisDraw: 0, notes: '' },
    ],
  },
];

// ============================================
// MAIN COMPONENT
// ============================================

export const ConstructionBudgetTemplate: React.FC = () => {
  const [activeTab, setActiveTab] = useState('budget');
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>(defaultProjectInfo);
  const [drawInfo, setDrawInfo] = useState<DrawInfo>(defaultDrawInfo);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);

  // Calculate totals
  const categoryTotals = useMemo(() => {
    return categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      contractTotal: cat.items.reduce((sum, item) => sum + item.contractAmount, 0),
      priorTotal: cat.items.reduce((sum, item) => sum + item.priorDraws, 0),
      thisDrawTotal: cat.items.reduce((sum, item) => sum + item.thisDraw, 0),
    }));
  }, [categories]);

  const grandTotals = useMemo(() => {
    const contractTotal = categoryTotals.reduce((sum, cat) => sum + cat.contractTotal, 0);
    const priorTotal = categoryTotals.reduce((sum, cat) => sum + cat.priorTotal, 0);
    const thisDrawTotal = categoryTotals.reduce((sum, cat) => sum + cat.thisDrawTotal, 0);
    const totalBilled = priorTotal + thisDrawTotal;
    const balanceRemaining = contractTotal - totalBilled;
    const percentComplete = contractTotal > 0 ? totalBilled / contractTotal : 0;

    return { contractTotal, priorTotal, thisDrawTotal, totalBilled, balanceRemaining, percentComplete };
  }, [categoryTotals]);

  // Update handlers
  const updateProjectInfo = (field: keyof ProjectInfo, value: string | number) => {
    setProjectInfo(prev => ({ ...prev, [field]: value }));
  };

  const updateDrawInfo = (field: keyof DrawInfo, value: string | number) => {
    setDrawInfo(prev => ({ ...prev, [field]: value }));
  };

  const updateLineItem = (
    categoryId: string,
    itemId: string,
    field: keyof LineItem,
    value: number | string
  ) => {
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

  const tabs = [
    { id: 'budget', label: 'Construction Budget' },
    { id: 'sov', label: 'Schedule of Values (Draw)' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-emerald-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">CONSTRUCTION BUDGET TEMPLATE</h1>
            <p className="text-emerald-200 text-sm">Schedule of Values & Draw Request System</p>
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
                    placeholder="Enter name..."
                  />
                  <TextInput
                    label="Address"
                    value={projectInfo.address}
                    onChange={(v) => updateProjectInfo('address', v)}
                  />
                  <TextInput
                    label="Plan Name"
                    value={projectInfo.planName}
                    onChange={(v) => updateProjectInfo('planName', v)}
                  />
                  <NumberInput
                    label="Square Footage"
                    value={projectInfo.sqFt}
                    onChange={(v) => updateProjectInfo('sqFt', v)}
                  />
                  <TextInput
                    label="Contractor"
                    value={projectInfo.contractor}
                    onChange={(v) => updateProjectInfo('contractor', v)}
                  />
                </div>

                {/* Summary Stats */}
                <h3 className="font-semibold text-slate-800 mt-6 mb-3 pb-2 border-b">Budget Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contract Total:</span>
                    <span className="font-mono font-semibold">{formatCurrency(grandTotals.contractTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cost Per SF:</span>
                    <span className="font-mono">{formatCurrency(grandTotals.contractTotal / projectInfo.sqFt, { showCents: true })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Billed to Date:</span>
                    <span className="font-mono">{formatCurrency(grandTotals.totalBilled)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">% Complete:</span>
                    <span className="font-mono font-semibold text-emerald-600">{formatPercent(grandTotals.percentComplete)}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${grandTotals.percentComplete * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1 text-slate-500">
                    <span>{formatCurrency(grandTotals.totalBilled)}</span>
                    <span>{formatCurrency(grandTotals.contractTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Table */}
            <div className="col-span-12 lg:col-span-9">
              {/* Column Headers */}
              <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-slate-100 rounded-t text-xs font-semibold text-slate-600 mb-2">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-4">Description</div>
                <div className="col-span-2 text-right">Contract Amt</div>
                <div className="col-span-2 text-right">Prior Draws</div>
                <div className="col-span-1 text-right">% Comp</div>
                <div className="col-span-2">Notes</div>
              </div>

              {categories.map((category) => {
                const catTotals = categoryTotals.find(c => c.id === category.id);
                const catPercentComplete = catTotals && catTotals.contractTotal > 0 
                  ? catTotals.priorTotal / catTotals.contractTotal : 0;

                return (
                  <CategorySection key={category.id} title={category.name} color="green">
                    {category.items.map((item) => {
                      const itemPercent = item.contractAmount > 0 ? item.priorDraws / item.contractAmount : 0;
                      return (
                        <div
                          key={item.id}
                          className="grid grid-cols-12 gap-2 px-3 py-2 border-b border-slate-100 hover:bg-slate-50 items-center"
                        >
                          <div className="col-span-1 text-center text-xs font-mono text-slate-400">
                            {item.itemNumber}
                          </div>
                          <div className="col-span-4 text-sm text-slate-700">{item.description}</div>
                          <div className="col-span-2">
                            <CurrencyInput
                              value={item.contractAmount}
                              onChange={(v) => updateLineItem(category.id, item.id, 'contractAmount', v)}
                              size="sm"
                            />
                          </div>
                          <div className="col-span-2">
                            <CurrencyInput
                              value={item.priorDraws}
                              onChange={(v) => updateLineItem(category.id, item.id, 'priorDraws', v)}
                              size="sm"
                            />
                          </div>
                          <div className="col-span-1 text-right">
                            <span className={`text-xs font-mono ${itemPercent >= 1 ? 'text-emerald-600' : 'text-slate-500'}`}>
                              {formatPercent(itemPercent)}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <input
                              type="text"
                              value={item.notes}
                              onChange={(e) => updateLineItem(category.id, item.id, 'notes', e.target.value)}
                              className="w-full h-7 text-xs px-2 bg-transparent border border-transparent rounded text-slate-500 italic focus:border-slate-200 focus:bg-white focus:outline-none"
                              placeholder="Notes..."
                            />
                          </div>
                        </div>
                      );
                    })}
                    <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-amber-50 border-b-2 border-amber-200 items-center">
                      <div className="col-span-1"></div>
                      <div className="col-span-4 text-sm font-semibold text-slate-700 italic">Subtotal</div>
                      <div className="col-span-2 text-right font-mono text-sm font-semibold">
                        {formatCurrency(catTotals?.contractTotal || 0)}
                      </div>
                      <div className="col-span-2 text-right font-mono text-sm">
                        {formatCurrency(catTotals?.priorTotal || 0)}
                      </div>
                      <div className="col-span-1 text-right">
                        <span className="text-xs font-mono font-semibold text-emerald-600">
                          {formatPercent(catPercentComplete)}
                        </span>
                      </div>
                      <div className="col-span-2"></div>
                    </div>
                  </CategorySection>
                );
              })}

              {/* Grand Total */}
              <div className="bg-emerald-700 text-white px-4 py-3 rounded-b">
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-1"></div>
                  <div className="col-span-4 font-bold text-lg">CONTRACT TOTAL</div>
                  <div className="col-span-2 text-right font-mono font-bold text-xl">
                    {formatCurrency(grandTotals.contractTotal)}
                  </div>
                  <div className="col-span-2 text-right font-mono">
                    {formatCurrency(grandTotals.totalBilled)}
                  </div>
                  <div className="col-span-1 text-right font-mono font-bold">
                    {formatPercent(grandTotals.percentComplete)}
                  </div>
                  <div className="col-span-2"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sov' && (
          <div className="grid grid-cols-12 gap-6">
            {/* Draw Info Panel */}
            <div className="col-span-12 lg:col-span-3">
              <div className="bg-white rounded-lg border border-slate-200 p-4 sticky top-6">
                <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b">Draw Request Info</h3>
                <div className="space-y-3">
                  <NumberInput
                    label="Draw Number"
                    value={drawInfo.drawNumber}
                    onChange={(v) => updateDrawInfo('drawNumber', v)}
                    min={1}
                  />
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Draw Date</label>
                    <input
                      type="date"
                      value={drawInfo.drawDate}
                      onChange={(e) => updateDrawInfo('drawDate', e.target.value)}
                      className="w-full h-8 text-sm px-3 border border-slate-200 rounded"
                    />
                  </div>
                  <TextInput
                    label="Inspector Name"
                    value={drawInfo.inspectorName}
                    onChange={(v) => updateDrawInfo('inspectorName', v)}
                  />
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Inspection Date</label>
                    <input
                      type="date"
                      value={drawInfo.inspectionDate}
                      onChange={(e) => updateDrawInfo('inspectionDate', e.target.value)}
                      className="w-full h-8 text-sm px-3 border border-slate-200 rounded"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Status</label>
                    <select
                      value={drawInfo.approvalStatus}
                      onChange={(e) => updateDrawInfo('approvalStatus', e.target.value)}
                      className="w-full h-8 text-sm px-2 border border-slate-200 rounded bg-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="revision_needed">Revision Needed</option>
                    </select>
                  </div>
                </div>

                {/* Draw Summary */}
                <h3 className="font-semibold text-slate-800 mt-6 mb-3 pb-2 border-b">This Draw Summary</h3>
                <div className="space-y-2">
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <div className="text-xs text-emerald-600">This Draw Request</div>
                    <div className="text-2xl font-mono font-bold text-emerald-700">
                      {formatCurrency(grandTotals.thisDrawTotal)}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Prior Draws:</span>
                    <span className="font-mono">{formatCurrency(grandTotals.priorTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Total Billed:</span>
                    <span className="font-mono">{formatCurrency(grandTotals.totalBilled)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                    <span className="text-slate-700">Balance Remaining:</span>
                    <span className="font-mono">{formatCurrency(grandTotals.balanceRemaining)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SOV Draw Table */}
            <div className="col-span-12 lg:col-span-9">
              <div className="bg-white rounded-lg border border-slate-200">
                <div className="bg-emerald-700 text-white px-4 py-3 rounded-t">
                  <h3 className="font-semibold">SCHEDULE OF VALUES - DRAW #{drawInfo.drawNumber}</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Item #</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Description</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">Contract</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">Prior Draws</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600 bg-emerald-50">This Draw</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">Total Billed</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">Balance</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">% Comp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.flatMap(category => [
                        // Category header row
                        <tr key={`header-${category.id}`} className="bg-slate-100">
                          <td colSpan={8} className="px-3 py-2 font-semibold text-slate-700">{category.name}</td>
                        </tr>,
                        // Line items
                        ...category.items.map(item => {
                          const totalBilled = item.priorDraws + item.thisDraw;
                          const balance = item.contractAmount - totalBilled;
                          const percentComplete = item.contractAmount > 0 ? totalBilled / item.contractAmount : 0;

                          return (
                            <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="px-3 py-2 font-mono text-slate-400">{item.itemNumber}</td>
                              <td className="px-3 py-2">{item.description}</td>
                              <td className="px-3 py-2 text-right font-mono">{formatCurrency(item.contractAmount)}</td>
                              <td className="px-3 py-2 text-right font-mono">{formatCurrency(item.priorDraws)}</td>
                              <td className="px-3 py-2 bg-emerald-50">
                                <CurrencyInput
                                  value={item.thisDraw}
                                  onChange={(v) => updateLineItem(category.id, item.id, 'thisDraw', v)}
                                  size="sm"
                                />
                              </td>
                              <td className="px-3 py-2 text-right font-mono">{formatCurrency(totalBilled)}</td>
                              <td className="px-3 py-2 text-right font-mono text-slate-500">{formatCurrency(balance)}</td>
                              <td className="px-3 py-2 text-right">
                                <span className={`font-mono ${percentComplete >= 1 ? 'text-emerald-600 font-semibold' : ''}`}>
                                  {formatPercent(percentComplete)}
                                </span>
                              </td>
                            </tr>
                          );
                        }),
                      ])}
                    </tbody>
                    <tfoot>
                      <tr className="bg-emerald-700 text-white">
                        <td className="px-3 py-3 font-bold" colSpan={2}>TOTALS</td>
                        <td className="px-3 py-3 text-right font-mono font-bold">{formatCurrency(grandTotals.contractTotal)}</td>
                        <td className="px-3 py-3 text-right font-mono">{formatCurrency(grandTotals.priorTotal)}</td>
                        <td className="px-3 py-3 text-right font-mono font-bold bg-emerald-600">{formatCurrency(grandTotals.thisDrawTotal)}</td>
                        <td className="px-3 py-3 text-right font-mono">{formatCurrency(grandTotals.totalBilled)}</td>
                        <td className="px-3 py-3 text-right font-mono">{formatCurrency(grandTotals.balanceRemaining)}</td>
                        <td className="px-3 py-3 text-right font-mono font-bold">{formatPercent(grandTotals.percentComplete)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConstructionBudgetTemplate;
