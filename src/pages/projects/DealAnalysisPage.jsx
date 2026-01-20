import React, { useState } from 'react';
import { Calculator, TrendingUp, DollarSign, Percent, BarChart3, PieChart, Download, RefreshCw, Save, AlertTriangle, CheckCircle, Edit2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const DealAnalysisPage = ({ projectId }) => {
  const [activeScenario, setActiveScenario] = useState('base');
  const [isEditing, setIsEditing] = useState(false);

  const scenarios = [
    { id: 'base', name: 'Base Case', color: 'blue' },
    { id: 'optimistic', name: 'Optimistic', color: 'green' },
    { id: 'conservative', name: 'Conservative', color: 'amber' },
  ];

  const [assumptions, setAssumptions] = useState({
    // Acquisition
    purchasePrice: 2500000,
    closingCosts: 75000,
    dueDiligence: 25000,
    // Development
    hardCosts: 4500000,
    softCosts: 450000,
    contingency: 10,
    // Financing
    loanAmount: 5250000,
    interestRate: 8.5,
    loanTerm: 24,
    equityRequired: 2300000,
    // Revenue
    totalUnits: 12,
    avgSalePrice: 650000,
    absorptionMonths: 18,
    // Timeline
    constructionMonths: 14,
    selloutMonths: 18,
  });

  // Calculated metrics
  const totalProjectCost = assumptions.purchasePrice + assumptions.closingCosts + assumptions.dueDiligence + 
    assumptions.hardCosts + assumptions.softCosts + (assumptions.hardCosts * assumptions.contingency / 100);
  const grossRevenue = assumptions.totalUnits * assumptions.avgSalePrice;
  const grossProfit = grossRevenue - totalProjectCost;
  const grossMargin = (grossProfit / grossRevenue) * 100;
  const interestExpense = (assumptions.loanAmount * (assumptions.interestRate / 100) * (assumptions.loanTerm / 12));
  const netProfit = grossProfit - interestExpense;
  const roi = (netProfit / assumptions.equityRequired) * 100;
  const irr = 28.5; // Simplified - would calculate properly
  const equityMultiple = (assumptions.equityRequired + netProfit) / assumptions.equityRequired;
  const profitPerUnit = netProfit / assumptions.totalUnits;
  const costPerUnit = totalProjectCost / assumptions.totalUnits;

  const metrics = [
    { label: 'Total Project Cost', value: `$${(totalProjectCost / 1000000).toFixed(2)}M`, icon: DollarSign, color: 'blue' },
    { label: 'Gross Revenue', value: `$${(grossRevenue / 1000000).toFixed(2)}M`, icon: TrendingUp, color: 'green' },
    { label: 'Net Profit', value: `$${(netProfit / 1000000).toFixed(2)}M`, icon: BarChart3, color: 'emerald' },
    { label: 'ROI', value: `${roi.toFixed(1)}%`, icon: Percent, color: 'purple' },
    { label: 'IRR', value: `${irr.toFixed(1)}%`, icon: Calculator, color: 'amber' },
    { label: 'Equity Multiple', value: `${equityMultiple.toFixed(2)}x`, icon: PieChart, color: 'indigo' },
  ];

  const handleInputChange = (field, value) => {
    setAssumptions(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Deal Analysis</h1>
          <p className="text-sm text-gray-500">Financial modeling and scenario analysis</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-1" />Reset</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? <><Save className="w-4 h-4 mr-1" />Save</> : <><Edit2 className="w-4 h-4 mr-1" />Edit</>}
          </Button>
        </div>
      </div>

      {/* Scenario Tabs */}
      <div className="flex gap-2 mb-6">
        {scenarios.map(scenario => (
          <button
            key={scenario.id}
            onClick={() => setActiveScenario(scenario.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeScenario === scenario.id 
                ? `bg-${scenario.color}-100 text-${scenario.color}-700 border-2 border-${scenario.color}-300`
                : "bg-white border text-gray-600 hover:bg-gray-50"
            )}
          >
            {scenario.name}
          </button>
        ))}
        <button className="px-4 py-2 rounded-lg text-sm font-medium bg-white border text-gray-400 hover:bg-gray-50 flex items-center gap-1">
          <Plus className="w-4 h-4" />Add Scenario
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        {metrics.map((metric, idx) => {
          const IconComponent = metric.icon;
          return (
            <div key={idx} className={cn("bg-white border rounded-lg p-4", `border-l-4 border-l-${metric.color}-500`)}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">{metric.label}</span>
                <IconComponent className={cn("w-4 h-4", `text-${metric.color}-500`)} />
              </div>
              <p className="text-xl font-semibold">{metric.value}</p>
            </div>
          );
        })}
      </div>

      {/* Deal Assessment */}
      <div className={cn("rounded-lg p-4 mb-6 flex items-center gap-3", roi > 20 ? "bg-green-50 border border-green-200" : roi > 10 ? "bg-amber-50 border border-amber-200" : "bg-red-50 border border-red-200")}>
        {roi > 20 ? <CheckCircle className="w-6 h-6 text-green-600" /> : <AlertTriangle className="w-6 h-6 text-amber-600" />}
        <div>
          <p className={cn("font-semibold", roi > 20 ? "text-green-800" : "text-amber-800")}>
            {roi > 20 ? 'Strong Deal Metrics' : roi > 10 ? 'Acceptable Deal Metrics' : 'Below Target Returns'}
          </p>
          <p className={cn("text-sm", roi > 20 ? "text-green-700" : "text-amber-700")}>
            {roi > 20 ? `ROI of ${roi.toFixed(1)}% exceeds 20% target threshold` : `ROI of ${roi.toFixed(1)}% is ${roi > 10 ? 'near' : 'below'} target threshold`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Assumptions Panel */}
        <div className="col-span-2 space-y-6">
          {/* Acquisition Costs */}
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold">Acquisition Costs</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Purchase Price</label>
                  {isEditing ? (
                    <Input type="number" value={assumptions.purchasePrice} onChange={(e) => handleInputChange('purchasePrice', e.target.value)} />
                  ) : (
                    <p className="font-semibold">${assumptions.purchasePrice.toLocaleString()}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Closing Costs</label>
                  {isEditing ? (
                    <Input type="number" value={assumptions.closingCosts} onChange={(e) => handleInputChange('closingCosts', e.target.value)} />
                  ) : (
                    <p className="font-semibold">${assumptions.closingCosts.toLocaleString()}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Due Diligence</label>
                  {isEditing ? (
                    <Input type="number" value={assumptions.dueDiligence} onChange={(e) => handleInputChange('dueDiligence', e.target.value)} />
                  ) : (
                    <p className="font-semibold">${assumptions.dueDiligence.toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Development Costs */}
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold">Development Costs</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Hard Costs</label>
                  {isEditing ? (
                    <Input type="number" value={assumptions.hardCosts} onChange={(e) => handleInputChange('hardCosts', e.target.value)} />
                  ) : (
                    <p className="font-semibold">${assumptions.hardCosts.toLocaleString()}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Soft Costs</label>
                  {isEditing ? (
                    <Input type="number" value={assumptions.softCosts} onChange={(e) => handleInputChange('softCosts', e.target.value)} />
                  ) : (
                    <p className="font-semibold">${assumptions.softCosts.toLocaleString()}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Contingency %</label>
                  {isEditing ? (
                    <Input type="number" value={assumptions.contingency} onChange={(e) => handleInputChange('contingency', e.target.value)} />
                  ) : (
                    <p className="font-semibold">{assumptions.contingency}%</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Financing */}
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold">Financing Assumptions</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Loan Amount</label>
                  {isEditing ? (
                    <Input type="number" value={assumptions.loanAmount} onChange={(e) => handleInputChange('loanAmount', e.target.value)} />
                  ) : (
                    <p className="font-semibold">${(assumptions.loanAmount / 1000000).toFixed(2)}M</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Interest Rate</label>
                  {isEditing ? (
                    <Input type="number" step="0.1" value={assumptions.interestRate} onChange={(e) => handleInputChange('interestRate', e.target.value)} />
                  ) : (
                    <p className="font-semibold">{assumptions.interestRate}%</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Term (Months)</label>
                  {isEditing ? (
                    <Input type="number" value={assumptions.loanTerm} onChange={(e) => handleInputChange('loanTerm', e.target.value)} />
                  ) : (
                    <p className="font-semibold">{assumptions.loanTerm} mo</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Equity Required</label>
                  {isEditing ? (
                    <Input type="number" value={assumptions.equityRequired} onChange={(e) => handleInputChange('equityRequired', e.target.value)} />
                  ) : (
                    <p className="font-semibold">${(assumptions.equityRequired / 1000000).toFixed(2)}M</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Assumptions */}
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold">Revenue Assumptions</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Total Units</label>
                  {isEditing ? (
                    <Input type="number" value={assumptions.totalUnits} onChange={(e) => handleInputChange('totalUnits', e.target.value)} />
                  ) : (
                    <p className="font-semibold">{assumptions.totalUnits}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Avg Sale Price</label>
                  {isEditing ? (
                    <Input type="number" value={assumptions.avgSalePrice} onChange={(e) => handleInputChange('avgSalePrice', e.target.value)} />
                  ) : (
                    <p className="font-semibold">${assumptions.avgSalePrice.toLocaleString()}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Sellout (Months)</label>
                  {isEditing ? (
                    <Input type="number" value={assumptions.absorptionMonths} onChange={(e) => handleInputChange('absorptionMonths', e.target.value)} />
                  ) : (
                    <p className="font-semibold">{assumptions.absorptionMonths} mo</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Panel */}
        <div className="space-y-6">
          {/* Sources & Uses */}
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold">Sources & Uses</h3>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Sources</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Senior Debt</span>
                    <span className="font-medium">${(assumptions.loanAmount / 1000000).toFixed(2)}M</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Equity</span>
                    <span className="font-medium">${(assumptions.equityRequired / 1000000).toFixed(2)}M</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold border-t pt-2">
                    <span>Total Sources</span>
                    <span>${((assumptions.loanAmount + assumptions.equityRequired) / 1000000).toFixed(2)}M</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Uses</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Land Acquisition</span>
                    <span className="font-medium">${((assumptions.purchasePrice + assumptions.closingCosts) / 1000000).toFixed(2)}M</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Hard Costs</span>
                    <span className="font-medium">${(assumptions.hardCosts / 1000000).toFixed(2)}M</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Soft Costs</span>
                    <span className="font-medium">${(assumptions.softCosts / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Contingency</span>
                    <span className="font-medium">${((assumptions.hardCosts * assumptions.contingency / 100) / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold border-t pt-2">
                    <span>Total Uses</span>
                    <span>${(totalProjectCost / 1000000).toFixed(2)}M</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Unit Economics */}
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold">Unit Economics</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Cost Per Unit</span>
                <span className="font-medium">${costPerUnit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Revenue Per Unit</span>
                <span className="font-medium">${assumptions.avgSalePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Profit Per Unit</span>
                <span className="font-medium text-green-600">${profitPerUnit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="text-gray-500">Gross Margin</span>
                <span className="font-semibold">{grossMargin.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold">Timeline</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Due Diligence</span>
                <span className="font-medium">60 days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Entitlements</span>
                <span className="font-medium">90 days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Construction</span>
                <span className="font-medium">{assumptions.constructionMonths} months</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sellout</span>
                <span className="font-medium">{assumptions.absorptionMonths} months</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="text-gray-500">Total Duration</span>
                <span className="font-semibold">{Math.ceil((60 + 90) / 30) + assumptions.constructionMonths + assumptions.absorptionMonths} months</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealAnalysisPage;
