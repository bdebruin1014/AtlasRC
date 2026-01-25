import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';
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
  RefreshCw,
  Users,
  TrendingUp
} from 'lucide-react';

// Default BTR financing assumptions
const DEFAULT_ASSUMPTIONS = {
  vacancyRate: 0.05,           // 5% vacancy
  operatingExpenseRatio: 0.35, // 35% of EGI
  capRate: 0.055,              // 5.5% exit cap
  constructionLTC: 0.65,       // 65% loan-to-cost
  constructionRate: 0.085,     // 8.5% construction loan
  permLoanLTV: 0.70,           // 70% LTV permanent
  permLoanRate: 0.065,         // 6.5% permanent rate
  holdPeriod: 5                // 5 year hold
};

// Threshold configurations
const YIELD_THRESHOLDS = {
  pass: 0.065,    // >= 6.5%
  review: 0.055   // >= 5.5%
};

const PER_UNIT_THRESHOLDS = {
  pass: 200000,      // <= $200K
  review: 250000,    // <= $250K
  warning: 300000    // <= $300K
};

export default function BTRDealSheet({
  opportunityId,
  initialData = null,
  onSave,
  onCreateProject,
  expanded: initialExpanded = true
}) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [saving, setSaving] = useState(false);

  // Form inputs
  const [totalUnits, setTotalUnits] = useState(initialData?.total_units || '');
  const [oneBrUnits, setOneBrUnits] = useState(initialData?.one_br_units || '');
  const [twoBrUnits, setTwoBrUnits] = useState(initialData?.two_br_units || '');
  const [threeBrUnits, setThreeBrUnits] = useState(initialData?.three_br_units || '');
  const [oneBrRent, setOneBrRent] = useState(initialData?.one_br_rent || '1200');
  const [twoBrRent, setTwoBrRent] = useState(initialData?.two_br_rent || '1450');
  const [threeBrRent, setThreeBrRent] = useState(initialData?.three_br_rent || '1700');
  const [landCost, setLandCost] = useState(initialData?.land_cost || '');
  const [perUnitConstructionCost, setPerUnitConstructionCost] = useState(initialData?.per_unit_construction || '165000');
  const [operatingExpenseRatio, setOperatingExpenseRatio] = useState(initialData?.expense_ratio || '35');

  // Financing assumptions
  const [assumptions] = useState(DEFAULT_ASSUMPTIONS);

  // Calculate unit breakdown
  const unitBreakdown = useMemo(() => {
    const total = parseInt(totalUnits) || 0;
    const oneBr = parseInt(oneBrUnits) || 0;
    const twoBr = parseInt(twoBrUnits) || 0;
    const threeBr = parseInt(threeBrUnits) || 0;

    // Auto-calculate if only total is provided
    if (total > 0 && oneBr === 0 && twoBr === 0 && threeBr === 0) {
      return {
        oneBr: Math.round(total * 0.3),
        twoBr: Math.round(total * 0.5),
        threeBr: total - Math.round(total * 0.3) - Math.round(total * 0.5),
        total
      };
    }

    return { oneBr, twoBr, threeBr, total: oneBr + twoBr + threeBr || total };
  }, [totalUnits, oneBrUnits, twoBrUnits, threeBrUnits]);

  // Calculate all values
  const calculations = useMemo(() => {
    const units = unitBreakdown.total;
    const land = parseFloat(landCost) || 0;
    const perUnitConst = parseFloat(perUnitConstructionCost) || 0;
    const expenseRatio = (parseFloat(operatingExpenseRatio) || 35) / 100;

    const rent1Br = parseFloat(oneBrRent) || 0;
    const rent2Br = parseFloat(twoBrRent) || 0;
    const rent3Br = parseFloat(threeBrRent) || 0;

    // Gross Potential Rent (GPR) - Annual
    const monthlyGPR = (unitBreakdown.oneBr * rent1Br) +
                       (unitBreakdown.twoBr * rent2Br) +
                       (unitBreakdown.threeBr * rent3Br);
    const annualGPR = monthlyGPR * 12;

    // Effective Gross Income (EGI)
    const vacancy = annualGPR * assumptions.vacancyRate;
    const effectiveGrossIncome = annualGPR - vacancy;

    // Operating Expenses
    const operatingExpenses = effectiveGrossIncome * expenseRatio;

    // Net Operating Income (NOI)
    const noi = effectiveGrossIncome - operatingExpenses;

    // Total Development Cost
    const constructionCost = units * perUnitConst;
    const softCosts = constructionCost * 0.15; // 15% soft costs
    const totalDevelopmentCost = land + constructionCost + softCosts;

    // Per Unit Cost
    const perUnitCost = units > 0 ? totalDevelopmentCost / units : 0;

    // Development Yield (NOI / Total Cost)
    const developmentYield = totalDevelopmentCost > 0 ? noi / totalDevelopmentCost : 0;

    // Stabilized Value (NOI / Cap Rate)
    const stabilizedValue = noi / assumptions.capRate;

    // Profit on Cost
    const profitOnCost = totalDevelopmentCost > 0 ? (stabilizedValue - totalDevelopmentCost) / totalDevelopmentCost : 0;

    // Average rent per unit
    const avgRentPerUnit = units > 0 ? monthlyGPR / units : 0;

    return {
      units,
      land,
      constructionCost,
      softCosts,
      totalDevelopmentCost,
      perUnitCost,
      monthlyGPR,
      annualGPR,
      vacancy,
      effectiveGrossIncome,
      operatingExpenses,
      noi,
      developmentYield,
      stabilizedValue,
      profitOnCost,
      avgRentPerUnit
    };
  }, [unitBreakdown, landCost, perUnitConstructionCost, operatingExpenseRatio,
      oneBrRent, twoBrRent, threeBrRent, assumptions]);

  // Threshold checks
  const yieldStatus = useMemo(() => {
    if (calculations.developmentYield >= YIELD_THRESHOLDS.pass) return 'pass';
    if (calculations.developmentYield >= YIELD_THRESHOLDS.review) return 'review';
    return 'fail';
  }, [calculations.developmentYield]);

  const perUnitStatus = useMemo(() => {
    if (calculations.perUnitCost <= PER_UNIT_THRESHOLDS.pass) return 'pass';
    if (calculations.perUnitCost <= PER_UNIT_THRESHOLDS.review) return 'review';
    if (calculations.perUnitCost <= PER_UNIT_THRESHOLDS.warning) return 'warning';
    return 'fail';
  }, [calculations.perUnitCost]);

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
      case 'warning': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'fail': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass': return <Check className="w-4 h-4 text-green-600" />;
      case 'review': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'fail': return <X className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pass': return 'PASS';
      case 'review': return 'REVIEW';
      case 'warning': return 'REVIEW';
      case 'fail': return 'FAIL';
      default: return '-';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const data = {
      opportunity_id: opportunityId,
      deal_type: 'build_to_rent',
      total_units: calculations.units,
      unit_mix: { oneBr: unitBreakdown.oneBr, twoBr: unitBreakdown.twoBr, threeBr: unitBreakdown.threeBr },
      rents: { oneBr: parseFloat(oneBrRent), twoBr: parseFloat(twoBrRent), threeBr: parseFloat(threeBrRent) },
      land_cost: calculations.land,
      per_unit_construction: parseFloat(perUnitConstructionCost),
      total_development_cost: calculations.totalDevelopmentCost,
      noi: calculations.noi,
      development_yield: calculations.developmentYield,
      per_unit_cost: calculations.perUnitCost,
      stabilized_value: calculations.stabilizedValue
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
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-white" />
          <div>
            <h3 className="font-semibold text-white">Build-to-Rent Quick Analysis</h3>
            <p className="text-xs text-purple-100">BTR community evaluation</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {calculations.units > 0 && (
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(yieldStatus)}`}>
                {formatPercent(calculations.developmentYield)} Yield
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(perUnitStatus)}`}>
                {formatCurrency(calculations.perUnitCost)}/unit
              </span>
            </div>
          )}
          {expanded ? <ChevronUp className="w-5 h-5 text-white" /> : <ChevronDown className="w-5 h-5 text-white" />}
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          {/* Unit Mix & Rents */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                UNIT MIX
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Total Units</label>
                  <input
                    type="number"
                    value={totalUnits}
                    onChange={(e) => setTotalUnits(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 bg-yellow-50"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">1BR Units</label>
                    <input
                      type="number"
                      value={oneBrUnits}
                      onChange={(e) => setOneBrUnits(e.target.value)}
                      placeholder={String(unitBreakdown.oneBr)}
                      className="w-full px-2 py-1.5 border rounded text-sm focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">2BR Units</label>
                    <input
                      type="number"
                      value={twoBrUnits}
                      onChange={(e) => setTwoBrUnits(e.target.value)}
                      placeholder={String(unitBreakdown.twoBr)}
                      className="w-full px-2 py-1.5 border rounded text-sm focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">3BR Units</label>
                    <input
                      type="number"
                      value={threeBrUnits}
                      onChange={(e) => setThreeBrUnits(e.target.value)}
                      placeholder={String(unitBreakdown.threeBr)}
                      className="w-full px-2 py-1.5 border rounded text-sm focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                MONTHLY RENTS
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">1BR Rent</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1.5 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      value={oneBrRent}
                      onChange={(e) => setOneBrRent(e.target.value)}
                      className="w-full pl-6 pr-2 py-1.5 border rounded text-sm focus:ring-2 focus:ring-purple-500 bg-yellow-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">2BR Rent</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1.5 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      value={twoBrRent}
                      onChange={(e) => setTwoBrRent(e.target.value)}
                      className="w-full pl-6 pr-2 py-1.5 border rounded text-sm focus:ring-2 focus:ring-purple-500 bg-yellow-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">3BR Rent</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1.5 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      value={threeBrRent}
                      onChange={(e) => setThreeBrRent(e.target.value)}
                      className="w-full pl-6 pr-2 py-1.5 border rounded text-sm focus:ring-2 focus:ring-purple-500 bg-yellow-50"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded px-3 py-2">
                Avg Rent/Unit: {formatCurrency(calculations.avgRentPerUnit)}/mo
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
                  <span className="text-sm text-gray-600">Land/Acquisition Cost</span>
                  <div className="relative w-32">
                    <span className="absolute left-2 top-1.5 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      value={landCost}
                      onChange={(e) => setLandCost(e.target.value)}
                      placeholder="0"
                      className="w-full pl-6 pr-2 py-1 border rounded text-sm text-right focus:ring-2 focus:ring-purple-500 bg-yellow-50"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Per-Unit Construction</span>
                  <div className="relative w-32">
                    <span className="absolute left-2 top-1.5 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      value={perUnitConstructionCost}
                      onChange={(e) => setPerUnitConstructionCost(e.target.value)}
                      className="w-full pl-6 pr-2 py-1 border rounded text-sm text-right focus:ring-2 focus:ring-purple-500 bg-yellow-50"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Operating Expense Ratio</span>
                  <div className="relative w-32">
                    <input
                      type="number"
                      value={operatingExpenseRatio}
                      onChange={(e) => setOperatingExpenseRatio(e.target.value)}
                      className="w-full pl-2 pr-6 py-1 border rounded text-sm text-right focus:ring-2 focus:ring-purple-500 bg-yellow-50"
                    />
                    <span className="absolute right-2 top-1.5 text-gray-400 text-sm">%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Construction Cost</span>
                  <span className="text-sm font-medium">{formatCurrency(calculations.constructionCost)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Soft Costs (15%)</span>
                  <span className="text-sm font-medium">{formatCurrency(calculations.softCosts)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm font-semibold text-gray-800">Total Development Cost</span>
                  <span className="text-sm font-bold">{formatCurrency(calculations.totalDevelopmentCost)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Income Analysis */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              INCOME ANALYSIS (Stabilized)
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Gross Potential Rent</span>
                  <span className="text-sm font-medium">{formatCurrency(calculations.annualGPR)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Less: Vacancy (5%)</span>
                  <span className="text-sm font-medium text-red-600">({formatCurrency(calculations.vacancy)})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Effective Gross Income</span>
                  <span className="text-sm font-medium">{formatCurrency(calculations.effectiveGrossIncome)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Operating Expenses</span>
                  <span className="text-sm font-medium text-red-600">({formatCurrency(calculations.operatingExpenses)})</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm font-semibold text-gray-800">Net Operating Income</span>
                  <span className="text-sm font-bold text-green-600">{formatCurrency(calculations.noi)}</span>
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
              {/* Development Yield */}
              <div className={`rounded-lg border-2 p-4 ${
                yieldStatus === 'pass' ? 'border-green-300 bg-green-50' :
                yieldStatus === 'review' ? 'border-yellow-300 bg-yellow-50' :
                'border-red-300 bg-red-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Development Yield</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{formatPercent(calculations.developmentYield)}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 ${getStatusColor(yieldStatus)}`}>
                      {getStatusIcon(yieldStatus)}
                      {getStatusLabel(yieldStatus)}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Target: ≥6.5% PASS, 5.5-6.5% REVIEW, &lt;5.5% FAIL
                </div>
              </div>

              {/* Per Unit Cost */}
              <div className={`rounded-lg border-2 p-4 ${
                perUnitStatus === 'pass' ? 'border-green-300 bg-green-50' :
                perUnitStatus === 'review' ? 'border-yellow-300 bg-yellow-50' :
                perUnitStatus === 'warning' ? 'border-orange-300 bg-orange-50' :
                'border-red-300 bg-red-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Cost Per Unit</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{formatCurrency(calculations.perUnitCost)}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 ${getStatusColor(perUnitStatus)}`}>
                      {getStatusIcon(perUnitStatus)}
                      {getStatusLabel(perUnitStatus)}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Target: ≤$200K PASS, $200-250K REVIEW, &gt;$300K FAIL
                </div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">Stabilized Value</div>
                <div className="text-lg font-bold text-gray-900">{formatCurrency(calculations.stabilizedValue)}</div>
                <div className="text-xs text-gray-500">@ {formatPercent(assumptions.capRate)} cap</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">Profit on Cost</div>
                <div className={`text-lg font-bold ${calculations.profitOnCost >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(calculations.profitOnCost)}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">Value Created</div>
                <div className={`text-lg font-bold ${calculations.stabilizedValue - calculations.totalDevelopmentCost >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(calculations.stabilizedValue - calculations.totalDevelopmentCost)}
                </div>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-start gap-2">
            <Info className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-purple-700">
              <strong>Quick Analysis Only:</strong> BTR deals require detailed unit mix analysis, lease-up projections, and debt sizing. Use "Create Project" for full underwriting.
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-xs text-gray-500">
              Vacancy: {(assumptions.vacancyRate * 100).toFixed(0)}% | Exit Cap: {(assumptions.capRate * 100).toFixed(1)}%
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
                disabled={!calculations.units || yieldStatus === 'fail'}
                className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50"
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
