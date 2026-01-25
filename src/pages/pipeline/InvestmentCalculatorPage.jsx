import React, { useState, useMemo } from 'react';
import { Calculator, DollarSign, TrendingUp, Calendar, Percent, Download, RefreshCw, Settings, ChevronDown, ChevronRight, Save, Copy, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const InvestmentCalculatorPage = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Input States
  const [inputs, setInputs] = useState({
    // Acquisition
    purchasePrice: 2850000,
    closingCosts: 85500,
    dueDiligenceCosts: 25000,

    // Development
    hardCosts: 4500000,
    softCosts: 675000,
    contingency: 10,

    // Financing
    loanAmount: 4275000,
    interestRate: 8.5,
    loanTerm: 24,
    loanFees: 2,

    // Revenue
    totalLots: 85,
    avgLotPrice: 125000,
    absorptionRate: 4,
    priceEscalation: 3,

    // Timing
    developmentMonths: 18,
    salesStartMonth: 12,

    // Other
    managementFee: 3,
    sellingCosts: 6,
  });

  const updateInput = (key, value) => {
    setInputs(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  // Calculations
  const calculations = useMemo(() => {
    const totalAcquisition = inputs.purchasePrice + inputs.closingCosts + inputs.dueDiligenceCosts;
    const developmentCost = inputs.hardCosts + inputs.softCosts;
    const contingencyAmount = developmentCost * (inputs.contingency / 100);
    const totalDevelopmentCost = developmentCost + contingencyAmount;
    const loanFeesAmount = inputs.loanAmount * (inputs.loanFees / 100);
    const totalProjectCost = totalAcquisition + totalDevelopmentCost + loanFeesAmount;

    const grossRevenue = inputs.totalLots * inputs.avgLotPrice;
    const sellingCostsAmount = grossRevenue * (inputs.sellingCosts / 100);
    const managementFeeAmount = grossRevenue * (inputs.managementFee / 100);
    const netRevenue = grossRevenue - sellingCostsAmount - managementFeeAmount;

    // Interest calculation (simplified)
    const monthlyRate = inputs.interestRate / 12 / 100;
    const avgLoanBalance = inputs.loanAmount * 0.6; // Assume average balance is 60%
    const interestCost = avgLoanBalance * monthlyRate * inputs.loanTerm;

    const totalCostBasis = totalProjectCost + interestCost;
    const equityRequired = totalProjectCost - inputs.loanAmount;
    const grossProfit = netRevenue - totalCostBasis;
    const profitMargin = (grossProfit / grossRevenue) * 100;
    const equityMultiple = netRevenue / equityRequired;

    // IRR Calculation (simplified NPV-based approximation)
    const salesMonths = Math.ceil(inputs.totalLots / inputs.absorptionRate);
    const totalMonths = inputs.salesStartMonth + salesMonths;
    const monthlyRevenue = netRevenue / salesMonths;

    // Simplified IRR (using approximation)
    const annualizedProfit = grossProfit / (totalMonths / 12);
    const roi = (grossProfit / equityRequired) * 100;
    const annualizedROI = roi / (totalMonths / 12);

    // IRR approximation using modified Newton-Raphson
    let irr = 0.15; // Starting guess
    for (let i = 0; i < 20; i++) {
      let npv = -equityRequired;
      let dnpv = 0;
      for (let m = inputs.salesStartMonth; m < totalMonths; m++) {
        const cf = monthlyRevenue;
        const factor = Math.pow(1 + irr / 12, m);
        npv += cf / factor;
        dnpv -= (m / 12) * cf / (factor * (1 + irr / 12));
      }
      if (Math.abs(npv) < 1000) break;
      irr = irr - npv / dnpv;
    }

    return {
      totalAcquisition,
      totalDevelopmentCost,
      contingencyAmount,
      loanFeesAmount,
      totalProjectCost,
      grossRevenue,
      sellingCostsAmount,
      managementFeeAmount,
      netRevenue,
      interestCost,
      totalCostBasis,
      equityRequired,
      grossProfit,
      profitMargin,
      equityMultiple,
      roi,
      annualizedROI,
      irr: irr * 100,
      salesMonths,
      totalMonths,
      pricePerLot: inputs.avgLotPrice,
      costPerLot: totalCostBasis / inputs.totalLots,
      profitPerLot: grossProfit / inputs.totalLots,
    };
  }, [inputs]);

  const getMetricStatus = (metric, value) => {
    const thresholds = {
      profitMargin: { good: 20, warning: 15 },
      irr: { good: 20, warning: 15 },
      equityMultiple: { good: 1.5, warning: 1.25 },
      roi: { good: 30, warning: 20 },
    };

    const t = thresholds[metric];
    if (!t) return 'neutral';
    if (value >= t.good) return 'good';
    if (value >= t.warning) return 'warning';
    return 'poor';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-amber-600 bg-amber-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Investment Calculator</h1>
            <p className="text-sm text-gray-500">ROI, IRR, and Pro Forma Analysis</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Save className="w-4 h-4 mr-1" />Save Scenario</Button>
            <Button variant="outline" size="sm"><Copy className="w-4 h-4 mr-1" />Duplicate</Button>
            <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-6 gap-4">
          <div className={cn("rounded-lg p-3 text-center", getStatusColor(getMetricStatus('irr', calculations.irr)))}>
            <p className="text-xs text-gray-500">Project IRR</p>
            <p className="text-2xl font-bold">{calculations.irr.toFixed(1)}%</p>
          </div>
          <div className={cn("rounded-lg p-3 text-center", getStatusColor(getMetricStatus('equityMultiple', calculations.equityMultiple)))}>
            <p className="text-xs text-gray-500">Equity Multiple</p>
            <p className="text-2xl font-bold">{calculations.equityMultiple.toFixed(2)}x</p>
          </div>
          <div className={cn("rounded-lg p-3 text-center", getStatusColor(getMetricStatus('roi', calculations.roi)))}>
            <p className="text-xs text-gray-500">Total ROI</p>
            <p className="text-2xl font-bold">{calculations.roi.toFixed(1)}%</p>
          </div>
          <div className={cn("rounded-lg p-3 text-center", getStatusColor(getMetricStatus('profitMargin', calculations.profitMargin)))}>
            <p className="text-xs text-gray-500">Profit Margin</p>
            <p className="text-2xl font-bold">{calculations.profitMargin.toFixed(1)}%</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Gross Profit</p>
            <p className="text-2xl font-bold text-green-700">${(calculations.grossProfit / 1000000).toFixed(2)}M</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Equity Required</p>
            <p className="text-2xl font-bold text-blue-700">${(calculations.equityRequired / 1000000).toFixed(2)}M</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-4">
        <div className="flex gap-4">
          {['summary', 'inputs', 'cashflow', 'sensitivity'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "py-3 px-1 text-sm font-medium border-b-2 transition-colors capitalize",
                activeTab === tab
                  ? "border-[#047857] text-[#047857]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'summary' && (
          <div className="grid grid-cols-3 gap-4">
            {/* Uses of Funds */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-red-500" />
                Uses of Funds
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Land Acquisition</span>
                    <span className="font-medium">${calculations.totalAcquisition.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${(calculations.totalAcquisition / calculations.totalProjectCost) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Development Costs</span>
                    <span className="font-medium">${calculations.totalDevelopmentCost.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-green-500 rounded-full" style={{ width: `${(calculations.totalDevelopmentCost / calculations.totalProjectCost) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Financing Costs</span>
                    <span className="font-medium">${(calculations.loanFeesAmount + calculations.interestCost).toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-amber-500 rounded-full" style={{ width: `${((calculations.loanFeesAmount + calculations.interestCost) / calculations.totalProjectCost) * 100}%` }} />
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between font-semibold">
                    <span>Total Project Cost</span>
                    <span>${calculations.totalCostBasis.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sources of Funds */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Sources of Funds
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Equity</span>
                    <span className="font-medium">${calculations.equityRequired.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-purple-500 rounded-full" style={{ width: `${(calculations.equityRequired / calculations.totalProjectCost) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Debt</span>
                    <span className="font-medium">${inputs.loanAmount.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${(inputs.loanAmount / calculations.totalProjectCost) * 100}%` }} />
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Loan-to-Cost Ratio</span>
                    <span>{((inputs.loanAmount / calculations.totalProjectCost) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profit Breakdown */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-500" />
                Revenue & Profit
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Gross Revenue</span>
                  <span className="font-medium">${calculations.grossRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span className="pl-4">- Selling Costs ({inputs.sellingCosts}%)</span>
                  <span>-${calculations.sellingCostsAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span className="pl-4">- Management Fee ({inputs.managementFee}%)</span>
                  <span>-${calculations.managementFeeAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Net Revenue</span>
                  <span className="font-medium">${calculations.netRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>- Total Cost Basis</span>
                  <span>-${calculations.totalCostBasis.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-semibold text-green-600">
                  <span>Gross Profit</span>
                  <span>${calculations.grossProfit.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Per Lot Analysis */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Per Lot Analysis</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Lots</span>
                  <span className="font-medium">{inputs.totalLots}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Sale Price</span>
                  <span className="font-medium">${inputs.avgLotPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cost per Lot</span>
                  <span className="font-medium">${calculations.costPerLot.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Profit per Lot</span>
                  <span>${calculations.profitPerLot.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-500" />
                Project Timeline
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Development Period</span>
                  <span className="font-medium">{inputs.developmentMonths} months</span>
                </div>
                <div className="flex justify-between">
                  <span>Sales Start</span>
                  <span className="font-medium">Month {inputs.salesStartMonth}</span>
                </div>
                <div className="flex justify-between">
                  <span>Absorption Rate</span>
                  <span className="font-medium">{inputs.absorptionRate} lots/month</span>
                </div>
                <div className="flex justify-between">
                  <span>Sales Period</span>
                  <span className="font-medium">{calculations.salesMonths} months</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total Project Duration</span>
                  <span>{calculations.totalMonths} months</span>
                </div>
              </div>
            </div>

            {/* Investment Metrics */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Percent className="w-4 h-4 text-amber-500" />
                Investment Metrics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">IRR</span>
                  <span className={cn("px-3 py-1 rounded font-bold", getStatusColor(getMetricStatus('irr', calculations.irr)))}>
                    {calculations.irr.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Equity Multiple</span>
                  <span className={cn("px-3 py-1 rounded font-bold", getStatusColor(getMetricStatus('equityMultiple', calculations.equityMultiple)))}>
                    {calculations.equityMultiple.toFixed(2)}x
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total ROI</span>
                  <span className={cn("px-3 py-1 rounded font-bold", getStatusColor(getMetricStatus('roi', calculations.roi)))}>
                    {calculations.roi.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Annualized ROI</span>
                  <span className="px-3 py-1 rounded font-bold bg-gray-50">
                    {calculations.annualizedROI.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inputs' && (
          <div className="grid grid-cols-3 gap-4">
            {/* Acquisition */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Acquisition Costs</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Purchase Price</label>
                  <Input type="number" value={inputs.purchasePrice} onChange={(e) => updateInput('purchasePrice', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Closing Costs</label>
                  <Input type="number" value={inputs.closingCosts} onChange={(e) => updateInput('closingCosts', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Due Diligence Costs</label>
                  <Input type="number" value={inputs.dueDiligenceCosts} onChange={(e) => updateInput('dueDiligenceCosts', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Development */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Development Costs</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Hard Costs</label>
                  <Input type="number" value={inputs.hardCosts} onChange={(e) => updateInput('hardCosts', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Soft Costs</label>
                  <Input type="number" value={inputs.softCosts} onChange={(e) => updateInput('softCosts', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Contingency (%)</label>
                  <Input type="number" value={inputs.contingency} onChange={(e) => updateInput('contingency', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Financing */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Financing</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Loan Amount</label>
                  <Input type="number" value={inputs.loanAmount} onChange={(e) => updateInput('loanAmount', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Interest Rate (%)</label>
                  <Input type="number" step="0.1" value={inputs.interestRate} onChange={(e) => updateInput('interestRate', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Loan Term (months)</label>
                  <Input type="number" value={inputs.loanTerm} onChange={(e) => updateInput('loanTerm', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Loan Fees (%)</label>
                  <Input type="number" step="0.1" value={inputs.loanFees} onChange={(e) => updateInput('loanFees', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Revenue */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Revenue Assumptions</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Total Lots</label>
                  <Input type="number" value={inputs.totalLots} onChange={(e) => updateInput('totalLots', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Avg Lot Price</label>
                  <Input type="number" value={inputs.avgLotPrice} onChange={(e) => updateInput('avgLotPrice', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Absorption (lots/month)</label>
                  <Input type="number" value={inputs.absorptionRate} onChange={(e) => updateInput('absorptionRate', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Price Escalation (%/year)</label>
                  <Input type="number" step="0.5" value={inputs.priceEscalation} onChange={(e) => updateInput('priceEscalation', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Timeline</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Development (months)</label>
                  <Input type="number" value={inputs.developmentMonths} onChange={(e) => updateInput('developmentMonths', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Sales Start (month)</label>
                  <Input type="number" value={inputs.salesStartMonth} onChange={(e) => updateInput('salesStartMonth', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Other Costs */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Other Costs</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Management Fee (%)</label>
                  <Input type="number" step="0.5" value={inputs.managementFee} onChange={(e) => updateInput('managementFee', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Selling Costs (%)</label>
                  <Input type="number" step="0.5" value={inputs.sellingCosts} onChange={(e) => updateInput('sellingCosts', e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentCalculatorPage;
