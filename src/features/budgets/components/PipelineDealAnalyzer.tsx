// AtlasDev - Pipeline Deal Analyzer
// Single Deal Acquisition Analysis Tool
// VanRock Holdings LLC

import React, { useState, useMemo } from 'react';
import {
  CurrencyInput,
  NumberInput,
  TextInput,
  PercentInput,
  CalculatedField,
  MetricCard,
  TabNavigation,
  ActionButtons,
} from './ui/BudgetComponents';
import { formatCurrency, formatPercent, generateId } from '../utils/budgetCalculations';

// ============================================
// TYPES
// ============================================

interface ProjectInfo {
  projectName: string;
  address: string;
  parcelNumber: string;
  homeType: 'SFH' | 'TH';
  units: number;
}

interface PlanSelection {
  planName: string;
  sqFt: number;
  bedsBaths: string;
  lotWidth: number;
  lotDepth: number;
  upgradePackage: string;
}

interface AcquisitionInputs {
  landPrice: number;
  closingCostRate: number;
  acquisitionFeeRate: number;
  ddFee: number;
  phcFees: number;
}

interface SiteInputs {
  grading: number;
  utilities: number;
  driveway: number;
  treeRemoval: number;
  other: number;
}

interface VerticalInputs {
  sticksAndBricks: number;
  softCosts: number;
  siteSpecific: number;
  upgrades: number;
  builderProfitRate: number;
}

interface FinancingInputs {
  ltcRate: number;
  interestRate: number;
  termMonths: number;
  originationRate: number;
}

interface SalesInputs {
  salePrice: number;
  commissionRate: number;
  closingCostRate: number;
  incentives: number;
}

interface TimelineMilestone {
  id: string;
  name: string;
  targetDate: string;
  actualDate: string;
  notes: string;
}

// ============================================
// DEFAULT DATA
// ============================================

const defaultProjectInfo: ProjectInfo = {
  projectName: '',
  address: '',
  parcelNumber: '',
  homeType: 'SFH',
  units: 1,
};

const defaultPlanSelection: PlanSelection = {
  planName: 'Cherry',
  sqFt: 2214,
  bedsBaths: '4/3',
  lotWidth: 50,
  lotDepth: 120,
  upgradePackage: 'Classic',
};

const defaultAcquisition: AcquisitionInputs = {
  landPrice: 38750,
  closingCostRate: 0.015,
  acquisitionFeeRate: 0.03,
  ddFee: 500,
  phcFees: 2500,
};

const defaultSite: SiteInputs = {
  grading: 5000,
  utilities: 3000,
  driveway: 2500,
  treeRemoval: 1500,
  other: 1375,
};

const defaultVertical: VerticalInputs = {
  sticksAndBricks: 152346,
  softCosts: 3650,
  siteSpecific: 0,
  upgrades: 5000,
  builderProfitRate: 0.20,
};

const defaultFinancing: FinancingInputs = {
  ltcRate: 0.90,
  interestRate: 0.1025,
  termMonths: 7,
  originationRate: 0.01,
};

const defaultSales: SalesInputs = {
  salePrice: 405000,
  commissionRate: 0.05,
  closingCostRate: 0.005,
  incentives: 5000,
};

const defaultTimeline: TimelineMilestone[] = [
  { id: generateId(), name: 'Contract Execution', targetDate: '', actualDate: '', notes: '' },
  { id: generateId(), name: 'Due Diligence Complete', targetDate: '', actualDate: '', notes: '' },
  { id: generateId(), name: 'Closing', targetDate: '', actualDate: '', notes: '' },
  { id: generateId(), name: 'Permit Submitted', targetDate: '', actualDate: '', notes: '' },
  { id: generateId(), name: 'Permit Issued', targetDate: '', actualDate: '', notes: '' },
  { id: generateId(), name: 'Construction Start', targetDate: '', actualDate: '', notes: '' },
  { id: generateId(), name: 'Framing Complete', targetDate: '', actualDate: '', notes: '' },
  { id: generateId(), name: 'Drywall Complete', targetDate: '', actualDate: '', notes: '' },
  { id: generateId(), name: 'Final Inspection', targetDate: '', actualDate: '', notes: '' },
  { id: generateId(), name: 'CO Issued', targetDate: '', actualDate: '', notes: '' },
  { id: generateId(), name: 'Listed for Sale', targetDate: '', actualDate: '', notes: '' },
  { id: generateId(), name: 'Under Contract', targetDate: '', actualDate: '', notes: '' },
  { id: generateId(), name: 'Closing/Sold', targetDate: '', actualDate: '', notes: '' },
];

// ============================================
// MAIN COMPONENT
// ============================================

export const PipelineDealAnalyzer: React.FC = () => {
  const [activeTab, setActiveTab] = useState('inputs');
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>(defaultProjectInfo);
  const [planSelection, setPlanSelection] = useState<PlanSelection>(defaultPlanSelection);
  const [acquisition, setAcquisition] = useState<AcquisitionInputs>(defaultAcquisition);
  const [site, setSite] = useState<SiteInputs>(defaultSite);
  const [vertical, setVertical] = useState<VerticalInputs>(defaultVertical);
  const [financing, setFinancing] = useState<FinancingInputs>(defaultFinancing);
  const [sales, setSales] = useState<SalesInputs>(defaultSales);
  const [timeline, setTimeline] = useState<TimelineMilestone[]>(defaultTimeline);

  // Calculate all metrics
  const metrics = useMemo(() => {
    // Acquisition costs
    const closingCosts = acquisition.landPrice * acquisition.closingCostRate;
    const acquisitionFee = acquisition.landPrice * acquisition.acquisitionFeeRate;
    const totalAcquisition = acquisition.landPrice + closingCosts + acquisitionFee + acquisition.ddFee + acquisition.phcFees;

    // Site costs
    const totalSite = site.grading + site.utilities + site.driveway + site.treeRemoval + site.other;

    // Vertical costs
    const builderProfit = vertical.sticksAndBricks * vertical.builderProfitRate;
    const totalVertical = vertical.sticksAndBricks + vertical.softCosts + vertical.siteSpecific + vertical.upgrades + builderProfit;

    // Total development cost (before financing)
    const totalHardCosts = totalAcquisition + totalSite + totalVertical;

    // Financing
    const loanAmount = totalHardCosts * financing.ltcRate;
    const origination = loanAmount * financing.originationRate;
    const interestReserve = loanAmount * (financing.interestRate / 12) * financing.termMonths;
    const totalFinancing = origination + interestReserve;

    // Total project cost
    const totalProjectCost = totalHardCosts + totalFinancing;

    // Required equity
    const requiredEquity = totalHardCosts * (1 - financing.ltcRate);

    // Sales
    const commission = sales.salePrice * sales.commissionRate;
    const sellerClosing = sales.salePrice * sales.closingCostRate;
    const netProceeds = sales.salePrice - commission - sellerClosing - sales.incentives;

    // Profit metrics
    const grossProfit = netProceeds - totalProjectCost;
    const grossMargin = sales.salePrice > 0 ? grossProfit / sales.salePrice : 0;
    const roi = requiredEquity > 0 ? grossProfit / requiredEquity : 0;
    const cashMultiple = requiredEquity > 0 ? (requiredEquity + grossProfit) / requiredEquity : 0;
    const costPerSF = planSelection.sqFt > 0 ? totalProjectCost / planSelection.sqFt : 0;
    const salePricePerSF = planSelection.sqFt > 0 ? sales.salePrice / planSelection.sqFt : 0;

    return {
      // Subtotals
      closingCosts,
      acquisitionFee,
      totalAcquisition,
      totalSite,
      builderProfit,
      totalVertical,
      totalHardCosts,
      loanAmount,
      origination,
      interestReserve,
      totalFinancing,
      totalProjectCost,
      requiredEquity,
      // Sales
      commission,
      sellerClosing,
      netProceeds,
      // Profit
      grossProfit,
      grossMargin,
      roi,
      cashMultiple,
      costPerSF,
      salePricePerSF,
    };
  }, [acquisition, site, vertical, financing, sales, planSelection]);

  // Update handlers
  const updateProjectInfo = (field: keyof ProjectInfo, value: string | number) => {
    setProjectInfo(prev => ({ ...prev, [field]: value }));
  };

  const updatePlanSelection = (field: keyof PlanSelection, value: string | number) => {
    setPlanSelection(prev => ({ ...prev, [field]: value }));
  };

  const updateAcquisition = (field: keyof AcquisitionInputs, value: number) => {
    setAcquisition(prev => ({ ...prev, [field]: value }));
  };

  const updateSite = (field: keyof SiteInputs, value: number) => {
    setSite(prev => ({ ...prev, [field]: value }));
  };

  const updateVertical = (field: keyof VerticalInputs, value: number) => {
    setVertical(prev => ({ ...prev, [field]: value }));
  };

  const updateFinancing = (field: keyof FinancingInputs, value: number) => {
    setFinancing(prev => ({ ...prev, [field]: value }));
  };

  const updateSales = (field: keyof SalesInputs, value: number) => {
    setSales(prev => ({ ...prev, [field]: value }));
  };

  const updateTimeline = (id: string, field: keyof TimelineMilestone, value: string) => {
    setTimeline(prev => prev.map(item => {
      if (item.id !== id) return item;
      return { ...item, [field]: value };
    }));
  };

  const tabs = [
    { id: 'inputs', label: 'Deal Inputs' },
    { id: 'analysis', label: 'Analysis' },
    { id: 'timeline', label: 'Timeline' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">PIPELINE DEAL ANALYZER</h1>
            <p className="text-slate-300 text-sm">Single Deal Acquisition & Proforma Analysis</p>
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
        {activeTab === 'inputs' && (
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Project & Plan Info */}
            <div className="col-span-12 lg:col-span-3 space-y-4">
              {/* Project Info */}
              <div className="bg-white rounded-lg border border-slate-200 p-4">
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
                    placeholder="123 Main St"
                  />
                  <TextInput
                    label="Parcel #"
                    value={projectInfo.parcelNumber}
                    onChange={(v) => updateProjectInfo('parcelNumber', v)}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Type</label>
                      <select
                        value={projectInfo.homeType}
                        onChange={(e) => updateProjectInfo('homeType', e.target.value)}
                        className="w-full h-8 text-sm px-2 border border-slate-200 rounded bg-white"
                      >
                        <option value="SFH">SFH</option>
                        <option value="TH">Townhome</option>
                      </select>
                    </div>
                    <NumberInput
                      label="Units"
                      value={projectInfo.units}
                      onChange={(v) => updateProjectInfo('units', v)}
                      min={1}
                    />
                  </div>
                </div>
              </div>

              {/* Plan Selection */}
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b">Plan Selection</h3>
                <div className="space-y-3">
                  <TextInput
                    label="Plan Name"
                    value={planSelection.planName}
                    onChange={(v) => updatePlanSelection('planName', v)}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <NumberInput
                      label="Heated SF"
                      value={planSelection.sqFt}
                      onChange={(v) => updatePlanSelection('sqFt', v)}
                    />
                    <TextInput
                      label="Bed/Bath"
                      value={planSelection.bedsBaths}
                      onChange={(v) => updatePlanSelection('bedsBaths', v)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <NumberInput
                      label="Lot Width"
                      value={planSelection.lotWidth}
                      onChange={(v) => updatePlanSelection('lotWidth', v)}
                    />
                    <NumberInput
                      label="Lot Depth"
                      value={planSelection.lotDepth}
                      onChange={(v) => updatePlanSelection('lotDepth', v)}
                    />
                  </div>
                  <TextInput
                    label="Upgrade Package"
                    value={planSelection.upgradePackage}
                    onChange={(v) => updatePlanSelection('upgradePackage', v)}
                  />
                </div>
              </div>
            </div>

            {/* Middle Column - Cost Inputs */}
            <div className="col-span-12 lg:col-span-5 space-y-4">
              {/* Acquisition */}
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                  <h3 className="font-semibold text-slate-800">Acquisition Costs</h3>
                  <span className="font-mono text-sm font-semibold text-emerald-600">
                    {formatCurrency(metrics.totalAcquisition)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <CurrencyInput
                    label="Lot/Land Price"
                    value={acquisition.landPrice}
                    onChange={(v) => updateAcquisition('landPrice', v)}
                  />
                  <PercentInput
                    label="Closing Costs"
                    value={acquisition.closingCostRate}
                    onChange={(v) => updateAcquisition('closingCostRate', v)}
                  />
                  <PercentInput
                    label="Acquisition Fee"
                    value={acquisition.acquisitionFeeRate}
                    onChange={(v) => updateAcquisition('acquisitionFeeRate', v)}
                  />
                  <CurrencyInput
                    label="Due Diligence"
                    value={acquisition.ddFee}
                    onChange={(v) => updateAcquisition('ddFee', v)}
                  />
                  <CurrencyInput
                    label="PHC Fees"
                    value={acquisition.phcFees}
                    onChange={(v) => updateAcquisition('phcFees', v)}
                  />
                </div>
              </div>

              {/* Site Work */}
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                  <h3 className="font-semibold text-slate-800">Site Work</h3>
                  <span className="font-mono text-sm font-semibold text-emerald-600">
                    {formatCurrency(metrics.totalSite)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <CurrencyInput
                    label="Grading/Lot Prep"
                    value={site.grading}
                    onChange={(v) => updateSite('grading', v)}
                  />
                  <CurrencyInput
                    label="Utility Connections"
                    value={site.utilities}
                    onChange={(v) => updateSite('utilities', v)}
                  />
                  <CurrencyInput
                    label="Driveway"
                    value={site.driveway}
                    onChange={(v) => updateSite('driveway', v)}
                  />
                  <CurrencyInput
                    label="Tree Removal"
                    value={site.treeRemoval}
                    onChange={(v) => updateSite('treeRemoval', v)}
                  />
                  <CurrencyInput
                    label="Other"
                    value={site.other}
                    onChange={(v) => updateSite('other', v)}
                  />
                </div>
              </div>

              {/* Vertical Construction */}
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                  <h3 className="font-semibold text-slate-800">Vertical Construction</h3>
                  <span className="font-mono text-sm font-semibold text-emerald-600">
                    {formatCurrency(metrics.totalVertical)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <CurrencyInput
                    label="Sticks & Bricks"
                    value={vertical.sticksAndBricks}
                    onChange={(v) => updateVertical('sticksAndBricks', v)}
                  />
                  <CurrencyInput
                    label="Soft Costs"
                    value={vertical.softCosts}
                    onChange={(v) => updateVertical('softCosts', v)}
                  />
                  <CurrencyInput
                    label="Site Specific"
                    value={vertical.siteSpecific}
                    onChange={(v) => updateVertical('siteSpecific', v)}
                  />
                  <CurrencyInput
                    label="Upgrades"
                    value={vertical.upgrades}
                    onChange={(v) => updateVertical('upgrades', v)}
                  />
                  <PercentInput
                    label="Builder Profit"
                    value={vertical.builderProfitRate}
                    onChange={(v) => updateVertical('builderProfitRate', v)}
                  />
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Builder $ Amount</label>
                    <div className="h-8 bg-amber-100 border border-amber-200 rounded px-3 flex items-center justify-end font-mono text-sm">
                      {formatCurrency(metrics.builderProfit)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Financing & Sales */}
            <div className="col-span-12 lg:col-span-4 space-y-4">
              {/* Financing */}
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                  <h3 className="font-semibold text-slate-800">Financing</h3>
                  <span className="font-mono text-sm font-semibold text-emerald-600">
                    {formatCurrency(metrics.totalFinancing)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <PercentInput
                    label="LTC Ratio"
                    value={financing.ltcRate}
                    onChange={(v) => updateFinancing('ltcRate', v)}
                  />
                  <PercentInput
                    label="Interest Rate"
                    value={financing.interestRate}
                    onChange={(v) => updateFinancing('interestRate', v)}
                  />
                  <NumberInput
                    label="Term (Months)"
                    value={financing.termMonths}
                    onChange={(v) => updateFinancing('termMonths', v)}
                  />
                  <PercentInput
                    label="Origination"
                    value={financing.originationRate}
                    onChange={(v) => updateFinancing('originationRate', v)}
                  />
                </div>
                <div className="mt-3 pt-3 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Loan Amount:</span>
                    <span className="font-mono">{formatCurrency(metrics.loanAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Interest Reserve:</span>
                    <span className="font-mono">{formatCurrency(metrics.interestReserve)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-slate-700">Required Equity:</span>
                    <span className="font-mono text-amber-600">{formatCurrency(metrics.requiredEquity)}</span>
                  </div>
                </div>
              </div>

              {/* Sales Projections */}
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b">Sales Projections</h3>
                <div className="space-y-3">
                  <CurrencyInput
                    label="Projected Sale Price"
                    value={sales.salePrice}
                    onChange={(v) => updateSales('salePrice', v)}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <PercentInput
                      label="Commission"
                      value={sales.commissionRate}
                      onChange={(v) => updateSales('commissionRate', v)}
                    />
                    <PercentInput
                      label="Closing Costs"
                      value={sales.closingCostRate}
                      onChange={(v) => updateSales('closingCostRate', v)}
                    />
                  </div>
                  <CurrencyInput
                    label="Buyer Incentives"
                    value={sales.incentives}
                    onChange={(v) => updateSales('incentives', v)}
                  />
                </div>
                <div className="mt-3 pt-3 border-t">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-slate-700">Net Proceeds:</span>
                    <span className="font-mono">{formatCurrency(metrics.netProceeds)}</span>
                  </div>
                </div>
              </div>

              {/* Quick Results */}
              <div className={`rounded-lg border p-4 ${metrics.grossProfit > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                <h3 className={`font-semibold mb-3 ${metrics.grossProfit > 0 ? 'text-emerald-800' : 'text-red-800'}`}>
                  Deal Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Project Cost:</span>
                    <span className="font-mono font-semibold">{formatCurrency(metrics.totalProjectCost)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Net Proceeds:</span>
                    <span className="font-mono font-semibold">{formatCurrency(metrics.netProceeds)}</span>
                  </div>
                  <div className={`flex justify-between text-lg font-bold pt-2 border-t ${metrics.grossProfit > 0 ? 'border-emerald-300 text-emerald-700' : 'border-red-300 text-red-700'}`}>
                    <span>Gross Profit:</span>
                    <span className="font-mono">{formatCurrency(metrics.grossProfit)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="grid grid-cols-12 gap-6">
            {/* Key Metrics */}
            <div className="col-span-12">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800 mb-4">Key Performance Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <MetricCard label="Total Project Cost" value={metrics.totalProjectCost} />
                  <MetricCard label="Net Proceeds" value={metrics.netProceeds} />
                  <MetricCard 
                    label="Gross Profit" 
                    value={metrics.grossProfit}
                    trend={metrics.grossProfit > 0 ? 'up' : 'down'}
                  />
                  <MetricCard label="Gross Margin" value={metrics.grossMargin} format="percent" />
                  <MetricCard 
                    label="Return on Equity" 
                    value={metrics.roi} 
                    format="percent"
                    trend={metrics.roi > 0.25 ? 'up' : metrics.roi > 0 ? 'neutral' : 'down'}
                  />
                  <MetricCard label="Cash Multiple" value={metrics.cashMultiple} format="multiple" />
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="col-span-12 lg:col-span-6">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800 mb-4">Cost Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Acquisition', value: metrics.totalAcquisition, color: 'bg-blue-500' },
                    { label: 'Site Work', value: metrics.totalSite, color: 'bg-orange-500' },
                    { label: 'Vertical Construction', value: metrics.totalVertical, color: 'bg-emerald-500' },
                    { label: 'Financing', value: metrics.totalFinancing, color: 'bg-purple-500' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-4">
                      <div className="w-32 text-sm text-slate-600">{item.label}</div>
                      <div className="flex-1 h-6 bg-slate-100 rounded overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded`}
                          style={{ width: `${(item.value / metrics.totalProjectCost) * 100}%` }}
                        />
                      </div>
                      <div className="w-24 text-right font-mono text-sm">{formatCurrency(item.value)}</div>
                      <div className="w-12 text-right font-mono text-xs text-slate-500">
                        {formatPercent(item.value / metrics.totalProjectCost)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Per SF Analysis */}
            <div className="col-span-12 lg:col-span-6">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800 mb-4">Per Square Foot Analysis</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500">Cost Per SF</div>
                    <div className="text-xl font-mono font-bold text-slate-800">
                      {formatCurrency(metrics.costPerSF, { showCents: true })}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500">Sale Price Per SF</div>
                    <div className="text-xl font-mono font-bold text-slate-800">
                      {formatCurrency(metrics.salePricePerSF, { showCents: true })}
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <div className="text-xs text-emerald-600">Profit Per SF</div>
                    <div className="text-xl font-mono font-bold text-emerald-700">
                      {formatCurrency(metrics.grossProfit / planSelection.sqFt, { showCents: true })}
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <div className="text-xs text-amber-600">Equity Per SF</div>
                    <div className="text-xl font-mono font-bold text-amber-700">
                      {formatCurrency(metrics.requiredEquity / planSelection.sqFt, { showCents: true })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sensitivity Analysis */}
            <div className="col-span-12">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800 mb-4">Profit Sensitivity</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">Sale Price</th>
                        <th className="text-right py-2 px-3">Gross Profit</th>
                        <th className="text-right py-2 px-3">Margin</th>
                        <th className="text-right py-2 px-3">ROI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[-15000, -10000, -5000, 0, 5000, 10000, 15000].map((adj) => {
                        const adjPrice = sales.salePrice + adj;
                        const adjCommission = adjPrice * sales.commissionRate;
                        const adjClosing = adjPrice * sales.closingCostRate;
                        const adjProceeds = adjPrice - adjCommission - adjClosing - sales.incentives;
                        const adjProfit = adjProceeds - metrics.totalProjectCost;
                        const adjMargin = adjPrice > 0 ? adjProfit / adjPrice : 0;
                        const adjROI = metrics.requiredEquity > 0 ? adjProfit / metrics.requiredEquity : 0;

                        return (
                          <tr key={adj} className={`border-b ${adj === 0 ? 'bg-amber-50 font-semibold' : 'hover:bg-slate-50'}`}>
                            <td className="py-2 px-3 font-mono">{formatCurrency(adjPrice)}</td>
                            <td className={`py-2 px-3 text-right font-mono ${adjProfit > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {formatCurrency(adjProfit)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono">{formatPercent(adjMargin)}</td>
                            <td className="py-2 px-3 text-right font-mono">{formatPercent(adjROI)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="bg-slate-700 text-white px-4 py-3 rounded-t">
              <h3 className="font-semibold">PROJECT TIMELINE TRACKER</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Milestone</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Target Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Actual Date</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {timeline.map((item) => {
                    let status = 'pending';
                    if (item.actualDate) {
                      status = 'complete';
                      if (item.targetDate && new Date(item.actualDate) > new Date(item.targetDate)) {
                        status = 'late';
                      }
                    } else if (item.targetDate && new Date(item.targetDate) < new Date()) {
                      status = 'overdue';
                    }

                    return (
                      <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                        <td className="px-4 py-3">
                          <input
                            type="date"
                            value={item.targetDate}
                            onChange={(e) => updateTimeline(item.id, 'targetDate', e.target.value)}
                            className="h-8 text-sm px-2 border border-slate-200 rounded bg-emerald-50"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="date"
                            value={item.actualDate}
                            onChange={(e) => updateTimeline(item.id, 'actualDate', e.target.value)}
                            className="h-8 text-sm px-2 border border-slate-200 rounded bg-emerald-50"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`
                            text-xs px-2 py-1 rounded-full
                            ${status === 'complete' ? 'bg-emerald-100 text-emerald-700' : ''}
                            ${status === 'late' ? 'bg-amber-100 text-amber-700' : ''}
                            ${status === 'overdue' ? 'bg-red-100 text-red-700' : ''}
                            ${status === 'pending' ? 'bg-slate-100 text-slate-500' : ''}
                          `}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.notes}
                            onChange={(e) => updateTimeline(item.id, 'notes', e.target.value)}
                            className="w-full h-8 text-sm px-2 border border-slate-200 rounded"
                            placeholder="Add notes..."
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
      </div>
    </div>
  );
};

export default PipelineDealAnalyzer;
