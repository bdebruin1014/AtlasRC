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
  MapPin,
  Layers
} from 'lucide-react';

// Default assumptions for horizontal development
const DEFAULT_ASSUMPTIONS = {
  softCostsPct: 0.12,          // 12% of hard costs
  contingencyPct: 0.08,        // 8% contingency
  financingLTC: 0.65,          // 65% loan-to-cost
  interestRate: 0.09,          // 9% interest
  financeFee: 0.015,           // 1.5% origination
  sellerClosing: 0.06,         // 6% of lot sales
  marketingPct: 0.02           // 2% marketing
};

// Threshold configurations
const MARGIN_THRESHOLDS = {
  pass: 0.25,    // >= 25% gross lot margin
  review: 0.18   // >= 18%
};

const ABSORPTION_THRESHOLDS = {
  pass: 4,       // >= 4 lots/month
  review: 2      // >= 2 lots/month
};

export default function HorizontalDevDealSheet({
  opportunityId,
  initialData = null,
  onSave,
  onCreateProject,
  expanded: initialExpanded = true
}) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [saving, setSaving] = useState(false);

  // Form inputs
  const [totalAcreage, setTotalAcreage] = useState(initialData?.total_acreage || '');
  const [plannedLotCount, setPlannedLotCount] = useState(initialData?.planned_lots || '');
  const [landAcquisitionCost, setLandAcquisitionCost] = useState(initialData?.land_cost || '');
  const [infraCostPerLot, setInfraCostPerLot] = useState(initialData?.infra_per_lot || '35000');
  const [targetLotPrice, setTargetLotPrice] = useState(initialData?.lot_price || '');
  const [absorptionRate, setAbsorptionRate] = useState(initialData?.absorption || '3');

  const [assumptions] = useState(DEFAULT_ASSUMPTIONS);

  // Calculate all values
  const calculations = useMemo(() => {
    const acres = parseFloat(totalAcreage) || 0;
    const lots = parseInt(plannedLotCount) || 0;
    const landCost = parseFloat(landAcquisitionCost) || 0;
    const infraPerLot = parseFloat(infraCostPerLot) || 0;
    const lotPrice = parseFloat(targetLotPrice) || 0;
    const absorption = parseFloat(absorptionRate) || 0;

    // Calculate density
    const lotsPerAcre = acres > 0 ? lots / acres : 0;

    // Infrastructure costs
    const totalInfraCost = lots * infraPerLot;
    const softCosts = totalInfraCost * assumptions.softCostsPct;
    const contingency = (totalInfraCost + softCosts) * assumptions.contingencyPct;

    // Total Development Cost
    const totalDevCost = landCost + totalInfraCost + softCosts + contingency;

    // Cost per lot
    const costPerLot = lots > 0 ? totalDevCost / lots : 0;

    // Revenue
    const grossRevenue = lots * lotPrice;
    const sellerClosing = grossRevenue * assumptions.sellerClosing;
    const marketing = grossRevenue * assumptions.marketingPct;
    const netRevenue = grossRevenue - sellerClosing - marketing;

    // Timeline
    const sellOutMonths = absorption > 0 ? Math.ceil(lots / absorption) : 0;

    // Financing costs (average outstanding balance)
    const avgBalance = totalDevCost * assumptions.financingLTC * 0.5;
    const carryMonths = sellOutMonths;
    const financeCosts = avgBalance * (assumptions.interestRate * (carryMonths / 12)) +
                         (totalDevCost * assumptions.financingLTC * assumptions.financeFee);

    // All-in cost
    const allInCost = totalDevCost + financeCosts;

    // Profitability
    const grossProfit = netRevenue - allInCost;
    const grossLotMargin = grossRevenue > 0 ? (grossRevenue - totalDevCost) / grossRevenue : 0;
    const netMargin = grossRevenue > 0 ? grossProfit / grossRevenue : 0;

    // Per lot metrics
    const revenuePerLot = lots > 0 ? grossRevenue / lots : 0;
    const profitPerLot = lots > 0 ? grossProfit / lots : 0;

    // IRR estimate (simplified)
    const avgInvestmentPeriod = sellOutMonths / 12;
    const equityInvested = totalDevCost * (1 - assumptions.financingLTC);
    const irrEstimate = avgInvestmentPeriod > 0 && equityInvested > 0
      ? Math.pow((equityInvested + grossProfit) / equityInvested, 1 / avgInvestmentPeriod) - 1
      : 0;

    return {
      acres,
      lots,
      lotsPerAcre,
      landCost,
      totalInfraCost,
      softCosts,
      contingency,
      totalDevCost,
      costPerLot,
      lotPrice,
      grossRevenue,
      sellerClosing,
      marketing,
      netRevenue,
      sellOutMonths,
      financeCosts,
      allInCost,
      grossProfit,
      grossLotMargin,
      netMargin,
      revenuePerLot,
      profitPerLot,
      irrEstimate,
      absorption
    };
  }, [totalAcreage, plannedLotCount, landAcquisitionCost, infraCostPerLot,
      targetLotPrice, absorptionRate, assumptions]);

  // Threshold checks
  const marginStatus = useMemo(() => {
    if (calculations.grossLotMargin >= MARGIN_THRESHOLDS.pass) return 'pass';
    if (calculations.grossLotMargin >= MARGIN_THRESHOLDS.review) return 'review';
    return 'fail';
  }, [calculations.grossLotMargin]);

  const absorptionStatus = useMemo(() => {
    if (calculations.absorption >= ABSORPTION_THRESHOLDS.pass) return 'pass';
    if (calculations.absorption >= ABSORPTION_THRESHOLDS.review) return 'review';
    return 'fail';
  }, [calculations.absorption]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const formatPercent = (value) => {
    return `${((value || 0) * 100).toFixed(1)}%`;
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
      deal_type: 'horizontal_development',
      total_acreage: calculations.acres,
      planned_lots: calculations.lots,
      land_cost: calculations.landCost,
      infra_per_lot: parseFloat(infraCostPerLot),
      lot_price: calculations.lotPrice,
      absorption_rate: calculations.absorption,
      total_dev_cost: calculations.totalDevCost,
      gross_lot_margin: calculations.grossLotMargin,
      gross_profit: calculations.grossProfit,
      sellout_months: calculations.sellOutMonths
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
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5 text-white" />
          <div>
            <h3 className="font-semibold text-white">Horizontal Development Quick Analysis</h3>
            <p className="text-xs text-emerald-100">Land subdivision & lot sales</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {calculations.lots > 0 && (
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(marginStatus)}`}>
                {formatPercent(calculations.grossLotMargin)} Margin
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(absorptionStatus)}`}>
                {calculations.sellOutMonths}mo sellout
              </span>
            </div>
          )}
          {expanded ? <ChevronUp className="w-5 h-5 text-white" /> : <ChevronDown className="w-5 h-5 text-white" />}
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          {/* Property & Lot Configuration */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                PROPERTY
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Total Acreage</label>
                  <input
                    type="number"
                    step="0.1"
                    value={totalAcreage}
                    onChange={(e) => setTotalAcreage(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 bg-yellow-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Planned Lot Count</label>
                  <input
                    type="number"
                    value={plannedLotCount}
                    onChange={(e) => setPlannedLotCount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 bg-yellow-50"
                  />
                </div>
                {calculations.lotsPerAcre > 0 && (
                  <div className="text-xs text-gray-500 bg-gray-50 rounded px-3 py-2">
                    Density: {calculations.lotsPerAcre.toFixed(1)} lots/acre
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                PRICING & ABSORPTION
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Target Lot Sale Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={targetLotPrice}
                      onChange={(e) => setTargetLotPrice(e.target.value)}
                      placeholder="0"
                      className="w-full pl-7 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 bg-yellow-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Absorption Rate (lots/month)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={absorptionRate}
                    onChange={(e) => setAbsorptionRate(e.target.value)}
                    placeholder="3"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 bg-yellow-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Development Costs */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              DEVELOPMENT COSTS
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Land Acquisition</span>
                  <div className="relative w-36">
                    <span className="absolute left-2 top-1.5 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      value={landAcquisitionCost}
                      onChange={(e) => setLandAcquisitionCost(e.target.value)}
                      placeholder="0"
                      className="w-full pl-6 pr-2 py-1 border rounded text-sm text-right focus:ring-2 focus:ring-emerald-500 bg-yellow-50"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Infrastructure/Lot</span>
                  <div className="relative w-36">
                    <span className="absolute left-2 top-1.5 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      value={infraCostPerLot}
                      onChange={(e) => setInfraCostPerLot(e.target.value)}
                      placeholder="35000"
                      className="w-full pl-6 pr-2 py-1 border rounded text-sm text-right focus:ring-2 focus:ring-emerald-500 bg-yellow-50"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Infrastructure</span>
                  <span className="text-sm font-medium">{formatCurrency(calculations.totalInfraCost)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Soft Costs (12%)</span>
                  <span className="text-sm font-medium">{formatCurrency(calculations.softCosts)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Contingency (8%)</span>
                  <span className="text-sm font-medium">{formatCurrency(calculations.contingency)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed">
              <span className="text-sm font-semibold text-gray-800">TOTAL DEVELOPMENT COST</span>
              <span className="text-sm font-bold text-gray-900">{formatCurrency(calculations.totalDevCost)}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-gray-600">Cost Per Lot</span>
              <span className="text-sm font-medium">{formatCurrency(calculations.costPerLot)}</span>
            </div>
          </div>

          {/* Revenue & Timeline */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">REVENUE & TIMELINE</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Gross Lot Revenue</span>
                  <span className="text-sm font-medium">{formatCurrency(calculations.grossRevenue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Less: Selling Costs (6%)</span>
                  <span className="text-sm font-medium text-red-600">({formatCurrency(calculations.sellerClosing)})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Less: Marketing (2%)</span>
                  <span className="text-sm font-medium text-red-600">({formatCurrency(calculations.marketing)})</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Net Revenue</span>
                  <span className="text-sm font-medium">{formatCurrency(calculations.netRevenue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Carry/Finance Costs</span>
                  <span className="text-sm font-medium text-red-600">({formatCurrency(calculations.financeCosts)})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sell-Out Timeline</span>
                  <span className="text-sm font-bold">{calculations.sellOutMonths} months</span>
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
              {/* Gross Lot Margin */}
              <div className={`rounded-lg border-2 p-4 ${
                marginStatus === 'pass' ? 'border-green-300 bg-green-50' :
                marginStatus === 'review' ? 'border-yellow-300 bg-yellow-50' :
                'border-red-300 bg-red-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Gross Lot Margin</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{formatPercent(calculations.grossLotMargin)}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 ${getStatusColor(marginStatus)}`}>
                      {getStatusIcon(marginStatus)}
                      {getStatusLabel(marginStatus)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Gross Profit</span>
                  <span className={`text-sm font-bold ${calculations.grossProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {formatCurrency(calculations.grossProfit)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Target: ≥25% PASS, 18-25% REVIEW, &lt;18% FAIL
                </div>
              </div>

              {/* Absorption */}
              <div className={`rounded-lg border-2 p-4 ${
                absorptionStatus === 'pass' ? 'border-green-300 bg-green-50' :
                absorptionStatus === 'review' ? 'border-yellow-300 bg-yellow-50' :
                'border-red-300 bg-red-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Absorption Rate</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{calculations.absorption} lots/mo</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 ${getStatusColor(absorptionStatus)}`}>
                      {getStatusIcon(absorptionStatus)}
                      {getStatusLabel(absorptionStatus)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Profit/Lot</span>
                  <span className="text-sm font-bold">{formatCurrency(calculations.profitPerLot)}</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Target: ≥4 lots/mo PASS, 2-4 REVIEW
                </div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">Est. IRR</div>
                <div className="text-lg font-bold text-gray-900">{formatPercent(calculations.irrEstimate)}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">Net Margin</div>
                <div className="text-lg font-bold text-gray-900">{formatPercent(calculations.netMargin)}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">Revenue/Lot</div>
                <div className="text-lg font-bold text-gray-900">{formatCurrency(calculations.revenuePerLot)}</div>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-700">
              <strong>Quick Analysis Only:</strong> Land development requires detailed site engineering, phasing plans, and market absorption studies. Use "Create Project" for full underwriting.
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-xs text-gray-500">
              LTC: {(assumptions.financingLTC * 100).toFixed(0)}% | Interest: {(assumptions.interestRate * 100).toFixed(1)}%
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={saving || !calculations.lots}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Analysis'}
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!calculations.lots || marginStatus === 'fail'}
                className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50"
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
