import React, { useState, useMemo } from 'react';
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  Check,
  AlertTriangle,
  X,
  Save,
  Building2,
  Home,
  DollarSign,
  Percent,
  Info,
  TrendingUp,
  Users
} from 'lucide-react';

// Default assumptions for multifamily acquisition
const DEFAULT_ASSUMPTIONS = {
  exitCapRate: 0.055,          // 5.5% exit cap
  loanLTV: 0.70,               // 70% LTV
  loanRate: 0.065,             // 6.5% interest
  closingCostsPct: 0.02,       // 2% closing costs
  capExReserve: 300,           // $300/unit/year
  managementFee: 0.05          // 5% of EGI
};

// Threshold configurations
const CAP_RATE_THRESHOLDS = {
  pass: 0.055,    // >= 5.5% going-in cap
  review: 0.045   // >= 4.5%
};

const COC_THRESHOLDS = {
  pass: 0.08,     // >= 8% cash-on-cash
  review: 0.06    // >= 6%
};

export default function MultifamilyDealSheet({
  opportunityId,
  initialData = null,
  onSave,
  onCreateProject,
  expanded: initialExpanded = true
}) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [saving, setSaving] = useState(false);

  // Form inputs
  const [purchasePrice, setPurchasePrice] = useState(initialData?.purchase_price || '');
  const [unitCount, setUnitCount] = useState(initialData?.unit_count || '');
  const [currentGrossRent, setCurrentGrossRent] = useState(initialData?.gross_rent || '');
  const [currentVacancy, setCurrentVacancy] = useState(initialData?.vacancy || '5');
  const [operatingExpenses, setOperatingExpenses] = useState(initialData?.opex || '');
  const [renovationBudget, setRenovationBudget] = useState(initialData?.renovation || '0');
  const [targetRentIncrease, setTargetRentIncrease] = useState(initialData?.rent_increase || '0');

  const [assumptions] = useState(DEFAULT_ASSUMPTIONS);

  // Calculate all values
  const calculations = useMemo(() => {
    const price = parseFloat(purchasePrice) || 0;
    const units = parseInt(unitCount) || 0;
    const grossRent = parseFloat(currentGrossRent) || 0;
    const vacancyPct = (parseFloat(currentVacancy) || 5) / 100;
    const opex = parseFloat(operatingExpenses) || 0;
    const renovation = parseFloat(renovationBudget) || 0;
    const rentIncreasePct = (parseFloat(targetRentIncrease) || 0) / 100;

    // Per unit metrics
    const pricePerUnit = units > 0 ? price / units : 0;
    const avgRentPerUnit = grossRent > 0 && units > 0 ? grossRent / units / 12 : 0;

    // Current financials
    const currentGPR = grossRent;
    const currentVacancyLoss = currentGPR * vacancyPct;
    const currentEGI = currentGPR - currentVacancyLoss;
    const currentOpex = opex;
    const currentNOI = currentEGI - currentOpex;
    const currentCapRate = price > 0 ? currentNOI / price : 0;

    // Pro forma (post-renovation)
    const proFormaGPR = currentGPR * (1 + rentIncreasePct);
    const proFormaVacancy = proFormaGPR * vacancyPct;
    const proFormaEGI = proFormaGPR - proFormaVacancy;
    const proFormaOpex = opex * 1.03; // Assume 3% opex increase
    const proFormaNOI = proFormaEGI - proFormaOpex;

    // Total investment
    const closingCosts = price * assumptions.closingCostsPct;
    const totalInvestment = price + renovation + closingCosts;
    const proFormaCapRate = totalInvestment > 0 ? proFormaNOI / totalInvestment : 0;

    // Financing
    const loanAmount = price * assumptions.loanLTV;
    const annualDebtService = loanAmount * assumptions.loanRate;
    const equity = totalInvestment - loanAmount;

    // Cash flow
    const currentCashFlow = currentNOI - annualDebtService;
    const proFormaCashFlow = proFormaNOI - annualDebtService;

    // Returns
    const currentCOC = equity > 0 ? currentCashFlow / equity : 0;
    const proFormaCOC = equity > 0 ? proFormaCashFlow / equity : 0;

    // Value creation
    const proFormaValue = proFormaNOI / assumptions.exitCapRate;
    const valueCreated = proFormaValue - totalInvestment;
    const equityMultiple = equity > 0 ? (equity + valueCreated + proFormaCashFlow * 3) / equity : 0; // 3-year hold

    return {
      price,
      units,
      pricePerUnit,
      avgRentPerUnit,
      currentGPR,
      currentVacancyLoss,
      currentEGI,
      currentOpex,
      currentNOI,
      currentCapRate,
      proFormaGPR,
      proFormaVacancy,
      proFormaEGI,
      proFormaOpex,
      proFormaNOI,
      renovation,
      closingCosts,
      totalInvestment,
      proFormaCapRate,
      loanAmount,
      annualDebtService,
      equity,
      currentCashFlow,
      proFormaCashFlow,
      currentCOC,
      proFormaCOC,
      proFormaValue,
      valueCreated,
      equityMultiple
    };
  }, [purchasePrice, unitCount, currentGrossRent, currentVacancy,
      operatingExpenses, renovationBudget, targetRentIncrease, assumptions]);

  // Threshold checks
  const capRateStatus = useMemo(() => {
    if (calculations.currentCapRate >= CAP_RATE_THRESHOLDS.pass) return 'pass';
    if (calculations.currentCapRate >= CAP_RATE_THRESHOLDS.review) return 'review';
    return 'fail';
  }, [calculations.currentCapRate]);

  const cocStatus = useMemo(() => {
    if (calculations.proFormaCOC >= COC_THRESHOLDS.pass) return 'pass';
    if (calculations.proFormaCOC >= COC_THRESHOLDS.review) return 'review';
    return 'fail';
  }, [calculations.proFormaCOC]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const formatPercent = (value) => {
    return `${((value || 0) * 100).toFixed(2)}%`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pass': return 'bg-green-100 text-green-800 border-green-300';
      case 'review': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'fail': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass': return <Check className="w-4 h-4 text-green-600" />;
      case 'review': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'fail': return <X className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pass': return 'PASS';
      case 'review': return 'REVIEW';
      case 'fail': return 'FAIL';
      default: return '-';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const data = {
      opportunity_id: opportunityId,
      deal_type: 'multifamily_acquisition',
      purchase_price: calculations.price,
      unit_count: calculations.units,
      current_noi: calculations.currentNOI,
      current_cap_rate: calculations.currentCapRate,
      proforma_noi: calculations.proFormaNOI,
      proforma_cap_rate: calculations.proFormaCapRate,
      cash_on_cash: calculations.proFormaCOC,
      renovation_budget: calculations.renovation,
      total_investment: calculations.totalInvestment
    };

    if (onSave) {
      await onSave(data);
    }
    setSaving(false);
  };

  const handleCreateProject = () => {
    if (onCreateProject) {
      onCreateProject(calculations);
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-700 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-white" />
          <div>
            <h3 className="font-semibold text-white">Multifamily Acquisition Quick Analysis</h3>
            <p className="text-xs text-amber-100">Existing property evaluation</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {calculations.units > 0 && (
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(capRateStatus)}`}>
                {formatPercent(calculations.currentCapRate)} Cap
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(cocStatus)}`}>
                {formatPercent(calculations.proFormaCOC)} CoC
              </span>
            </div>
          )}
          {expanded ? <ChevronUp className="w-5 h-5 text-white" /> : <ChevronDown className="w-5 h-5 text-white" />}
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          {/* Property & Purchase */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                ACQUISITION
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Purchase Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      placeholder="0"
                      className="w-full pl-7 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 bg-yellow-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Unit Count</label>
                  <input
                    type="number"
                    value={unitCount}
                    onChange={(e) => setUnitCount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 bg-yellow-50"
                  />
                </div>
                {calculations.pricePerUnit > 0 && (
                  <div className="text-xs text-gray-500 bg-gray-50 rounded px-3 py-2">
                    <span className="font-medium">Price/Unit:</span> {formatCurrency(calculations.pricePerUnit)} •
                    <span className="font-medium ml-2">Avg Rent:</span> {formatCurrency(calculations.avgRentPerUnit)}/mo
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                CURRENT INCOME
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Annual Gross Rent</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={currentGrossRent}
                      onChange={(e) => setCurrentGrossRent(e.target.value)}
                      placeholder="0"
                      className="w-full pl-7 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 bg-yellow-50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Vacancy %</label>
                    <input
                      type="number"
                      value={currentVacancy}
                      onChange={(e) => setCurrentVacancy(e.target.value)}
                      placeholder="5"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 bg-yellow-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Annual OpEx</label>
                    <div className="relative">
                      <span className="absolute left-2 top-2 text-gray-400 text-sm">$</span>
                      <input
                        type="number"
                        value={operatingExpenses}
                        onChange={(e) => setOperatingExpenses(e.target.value)}
                        placeholder="0"
                        className="w-full pl-6 pr-2 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 bg-yellow-50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Value-Add Inputs */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              VALUE-ADD ASSUMPTIONS (Optional)
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Renovation Budget</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={renovationBudget}
                    onChange={(e) => setRenovationBudget(e.target.value)}
                    placeholder="0"
                    className="w-full pl-7 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 bg-yellow-50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Target Rent Increase %</label>
                <input
                  type="number"
                  value={targetRentIncrease}
                  onChange={(e) => setTargetRentIncrease(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 bg-yellow-50"
                />
              </div>
            </div>
          </div>

          {/* Current vs Pro Forma */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Current */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">CURRENT (In-Place)</h4>
                <div className="space-y-2 bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">GPR</span>
                    <span className="text-sm font-medium">{formatCurrency(calculations.currentGPR)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Less: Vacancy</span>
                    <span className="text-sm font-medium text-red-600">({formatCurrency(calculations.currentVacancyLoss)})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">EGI</span>
                    <span className="text-sm font-medium">{formatCurrency(calculations.currentEGI)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Less: OpEx</span>
                    <span className="text-sm font-medium text-red-600">({formatCurrency(calculations.currentOpex)})</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-semibold text-gray-800">NOI</span>
                    <span className="text-sm font-bold text-green-600">{formatCurrency(calculations.currentNOI)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cap Rate</span>
                    <span className="text-sm font-bold">{formatPercent(calculations.currentCapRate)}</span>
                  </div>
                </div>
              </div>

              {/* Pro Forma */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">PRO FORMA (Stabilized)</h4>
                <div className="space-y-2 bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">GPR</span>
                    <span className="text-sm font-medium">{formatCurrency(calculations.proFormaGPR)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Less: Vacancy</span>
                    <span className="text-sm font-medium text-red-600">({formatCurrency(calculations.proFormaVacancy)})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">EGI</span>
                    <span className="text-sm font-medium">{formatCurrency(calculations.proFormaEGI)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Less: OpEx</span>
                    <span className="text-sm font-medium text-red-600">({formatCurrency(calculations.proFormaOpex)})</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-semibold text-gray-800">NOI</span>
                    <span className="text-sm font-bold text-green-600">{formatCurrency(calculations.proFormaNOI)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Yield on Cost</span>
                    <span className="text-sm font-bold">{formatPercent(calculations.proFormaCapRate)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Percent className="w-4 h-4" />
              RESULTS
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {/* Going-in Cap Rate */}
              <div className={`rounded-lg border-2 p-4 ${
                capRateStatus === 'pass' ? 'border-green-300 bg-green-50' :
                capRateStatus === 'review' ? 'border-yellow-300 bg-yellow-50' :
                'border-red-300 bg-red-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Going-in Cap Rate</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{formatPercent(calculations.currentCapRate)}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 ${getStatusColor(capRateStatus)}`}>
                      {getStatusIcon(capRateStatus)}
                      {getStatusLabel(capRateStatus)}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Market dependent. Generally ≥5.5% PASS
                </div>
              </div>

              {/* Cash-on-Cash */}
              <div className={`rounded-lg border-2 p-4 ${
                cocStatus === 'pass' ? 'border-green-300 bg-green-50' :
                cocStatus === 'review' ? 'border-yellow-300 bg-yellow-50' :
                'border-red-300 bg-red-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Pro Forma Cash-on-Cash</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{formatPercent(calculations.proFormaCOC)}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 ${getStatusColor(cocStatus)}`}>
                      {getStatusIcon(cocStatus)}
                      {getStatusLabel(cocStatus)}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Target: ≥8% PASS, 6-8% REVIEW, &lt;6% FAIL
                </div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="mt-4 grid grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">Total Investment</div>
                <div className="text-lg font-bold text-gray-900">{formatCurrency(calculations.totalInvestment)}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">Pro Forma Value</div>
                <div className="text-lg font-bold text-gray-900">{formatCurrency(calculations.proFormaValue)}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">Value Created</div>
                <div className={`text-lg font-bold ${calculations.valueCreated >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(calculations.valueCreated)}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">Equity Multiple</div>
                <div className="text-lg font-bold text-gray-900">{calculations.equityMultiple.toFixed(2)}x</div>
                <div className="text-xs text-gray-400">3-yr hold</div>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-700">
              <strong>Quick Analysis Only:</strong> Multifamily acquisitions require rent roll analysis, T-12 review, and detailed due diligence. Use "Create Project" for full underwriting.
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-xs text-gray-500">
              LTV: {(assumptions.loanLTV * 100).toFixed(0)}% | Rate: {(assumptions.loanRate * 100).toFixed(1)}% | Exit Cap: {(assumptions.exitCapRate * 100).toFixed(1)}%
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={saving || !calculations.units}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Analysis'}
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!calculations.units || cocStatus === 'fail'}
                className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Home className="w-4 h-4" />
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
