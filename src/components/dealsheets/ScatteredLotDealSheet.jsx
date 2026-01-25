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
  FileText,
  Building2,
  Home,
  DollarSign,
  Percent,
  Info,
  RefreshCw
} from 'lucide-react';

// Demo data for municipalities, home plans, and upgrades
const demoMunicipalities = [
  { id: '1', name: 'City of Greenville', soft_costs_total: 18500 },
  { id: '2', name: 'Greenville County', soft_costs_total: 15200 },
  { id: '3', name: 'City of Greer', soft_costs_total: 16800 },
  { id: '4', name: 'Travelers Rest', soft_costs_total: 14500 },
  { id: '5', name: 'Simpsonville', soft_costs_total: 17200 },
  { id: '6', name: 'Mauldin', soft_costs_total: 16500 }
];

const demoHomePlans = [
  { id: '1', plan_name: 'TULIP', heated_sf: 1350, bedrooms: 3, bathrooms: 2, garage_type: 'None', sticks_bricks_total: 185000 },
  { id: '2', plan_name: 'MAGNOLIA', heated_sf: 1650, bedrooms: 3, bathrooms: 2, garage_type: '1-Car', sticks_bricks_total: 215000 },
  { id: '3', plan_name: 'DOGWOOD', heated_sf: 1850, bedrooms: 4, bathrooms: 2.5, garage_type: '2-Car', sticks_bricks_total: 245000 },
  { id: '4', plan_name: 'AZALEA', heated_sf: 2100, bedrooms: 4, bathrooms: 3, garage_type: '2-Car', sticks_bricks_total: 275000 },
  { id: '5', plan_name: 'OAKWOOD', heated_sf: 2450, bedrooms: 5, bathrooms: 3.5, garage_type: '2-Car', sticks_bricks_total: 315000 },
  { id: '6', plan_name: 'WILLOW', heated_sf: 1450, bedrooms: 3, bathrooms: 2, garage_type: '1-Car', sticks_bricks_total: 198000 }
];

const demoUpgrades = [
  { id: '0', upgrade_name: 'None', upgrade_price: 0 },
  { id: '1', upgrade_name: 'Hardie Color-Plus Siding', upgrade_price: 8500 },
  { id: '2', upgrade_name: 'Foxcroft Elegance Package', upgrade_price: 15000 },
  { id: '3', upgrade_name: 'Premium Kitchen Upgrade', upgrade_price: 12000 },
  { id: '4', upgrade_name: 'Owner\'s Suite Upgrade', upgrade_price: 8000 },
  { id: '5', upgrade_name: 'Smart Home Package', upgrade_price: 5500 },
  { id: '6', upgrade_name: 'Energy Efficiency Package', upgrade_price: 7500 }
];

// Default financing assumptions (would come from admin settings)
const DEFAULT_ASSUMPTIONS = {
  ltc: 0.70,                    // Loan-to-Cost ratio
  interestRate: 0.09,           // Annual interest rate
  termMonths: 6,                // Project timeline
  financeFee: 0.015,            // Origination fee
  equityRate: 0.16,             // Cost of equity
  equityPct: 0.30,              // Equity portion of TPC
  buyerClosing: 0.04,           // Buyer closing costs
  sellerClosing: 0.08,          // Seller closing costs
  rcFee: 25000                  // RC Construction Fee
};

// Threshold configurations
const MARGIN_THRESHOLDS = {
  pass: 0.10,    // >= 10%
  review: 0.07   // >= 7%
};

const LAND_SITE_THRESHOLDS = {
  pass: 0.20,     // <= 20%
  review: 0.25,   // <= 25%
  warning: 0.30   // <= 30%
};

export default function ScatteredLotDealSheet({
  opportunityId,
  initialData = null,
  onSave,
  onCreateProject,
  expanded: initialExpanded = true
}) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Lookup data
  const [municipalities, setMunicipalities] = useState([]);
  const [homePlans, setHomePlans] = useState([]);
  const [upgrades, setUpgrades] = useState([]);

  // Form inputs
  const [municipalityId, setMunicipalityId] = useState(initialData?.municipality_id || '');
  const [homePlanId, setHomePlanId] = useState(initialData?.home_plan_id || '');
  const [upgradeId, setUpgradeId] = useState(initialData?.upgrade_id || '0');
  const [anticipatedSalePrice, setAnticipatedSalePrice] = useState(initialData?.anticipated_sale_price || '');
  const [landPurchaseCost, setLandPurchaseCost] = useState(initialData?.land_purchase_cost || '');
  const [sitePrepCost, setSitePrepCost] = useState(initialData?.site_prep_cost || '0');
  const [verticalSitePrepCost, setVerticalSitePrepCost] = useState(initialData?.vertical_site_prep_cost || '0');

  // Financing assumptions (could be fetched from admin settings)
  const [assumptions] = useState(DEFAULT_ASSUMPTIONS);

  useEffect(() => {
    fetchLookupData();
  }, []);

  const fetchLookupData = async () => {
    if (isDemoMode()) {
      setMunicipalities(demoMunicipalities);
      setHomePlans(demoHomePlans);
      setUpgrades(demoUpgrades);
      setLoading(false);
      return;
    }

    try {
      const [munRes, planRes, upgradeRes] = await Promise.all([
        supabase.from('municipalities').select('id, name, soft_costs_total').order('name'),
        supabase.from('home_plans').select('id, plan_name, heated_sf, bedrooms, bathrooms, garage_type, sticks_bricks_total').order('plan_name'),
        supabase.from('upgrades').select('id, upgrade_name, upgrade_price').order('upgrade_name')
      ]);

      setMunicipalities(munRes.data || demoMunicipalities);
      setHomePlans(planRes.data || demoHomePlans);
      setUpgrades([{ id: '0', upgrade_name: 'None', upgrade_price: 0 }, ...(upgradeRes.data || demoUpgrades.slice(1))]);
    } catch (error) {
      console.error('Error fetching lookup data:', error);
      setMunicipalities(demoMunicipalities);
      setHomePlans(demoHomePlans);
      setUpgrades(demoUpgrades);
    } finally {
      setLoading(false);
    }
  };

  // Get selected items
  const selectedMunicipality = useMemo(() =>
    municipalities.find(m => m.id === municipalityId), [municipalities, municipalityId]);

  const selectedPlan = useMemo(() =>
    homePlans.find(p => p.id === homePlanId), [homePlans, homePlanId]);

  const selectedUpgrade = useMemo(() =>
    upgrades.find(u => u.id === upgradeId), [upgrades, upgradeId]);

  // Calculate all values
  const calculations = useMemo(() => {
    const asp = parseFloat(anticipatedSalePrice) || 0;
    const land = parseFloat(landPurchaseCost) || 0;
    const sitePrep = parseFloat(sitePrepCost) || 0;
    const vertSitePrep = parseFloat(verticalSitePrepCost) || 0;
    const sticksBricks = selectedPlan?.sticks_bricks_total || 0;
    const softCosts = selectedMunicipality?.soft_costs_total || 0;
    const upgradeCost = selectedUpgrade?.upgrade_price || 0;

    // Line items
    const buyerClosing = land * assumptions.buyerClosing;
    const rcFee = assumptions.rcFee;

    // Total Project Cost (TPC) = Lines 1-8
    const totalProjectCost = land + buyerClosing + sitePrep + vertSitePrep + sticksBricks + upgradeCost + softCosts + rcFee;

    // Carry Costs = TPC × 70% × ((9% × 6/12) + 1.5%) = TPC × 0.70 × 0.06
    const carryRate = (assumptions.interestRate * (assumptions.termMonths / 12)) + assumptions.financeFee;
    const carryCosts = totalProjectCost * assumptions.ltc * carryRate;

    // Equity Cost = TPC × 30% × 16%
    const equityCost = totalProjectCost * assumptions.equityPct * assumptions.equityRate;

    // All-In Cost
    const allInCost = totalProjectCost + carryCosts + equityCost;

    // Seller Closing = ASP × 8%
    const sellerClosing = asp * assumptions.sellerClosing;

    // Net Profit = ASP - All-In Cost - Seller Closing
    const netProfit = asp - allInCost - sellerClosing;

    // Net Margin = Net Profit / ASP
    const netMargin = asp > 0 ? netProfit / asp : 0;

    // Land + Site
    const landPlusSite = land + sitePrep;

    // Land + Site as % of ASP
    const landSitePct = asp > 0 ? landPlusSite / asp : 0;

    return {
      asp,
      land,
      sitePrep,
      vertSitePrep,
      sticksBricks,
      softCosts,
      upgradeCost,
      buyerClosing,
      rcFee,
      totalProjectCost,
      carryCosts,
      equityCost,
      allInCost,
      sellerClosing,
      netProfit,
      netMargin,
      landPlusSite,
      landSitePct
    };
  }, [anticipatedSalePrice, landPurchaseCost, sitePrepCost, verticalSitePrepCost,
      selectedPlan, selectedMunicipality, selectedUpgrade, assumptions]);

  // Threshold checks
  const marginStatus = useMemo(() => {
    if (calculations.netMargin >= MARGIN_THRESHOLDS.pass) return 'pass';
    if (calculations.netMargin >= MARGIN_THRESHOLDS.review) return 'review';
    return 'fail';
  }, [calculations.netMargin]);

  const landSiteStatus = useMemo(() => {
    if (calculations.landSitePct <= LAND_SITE_THRESHOLDS.pass) return 'pass';
    if (calculations.landSitePct <= LAND_SITE_THRESHOLDS.review) return 'review';
    if (calculations.landSitePct <= LAND_SITE_THRESHOLDS.warning) return 'warning';
    return 'fail';
  }, [calculations.landSitePct]);

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass': return <Check className="w-4 h-4 text-green-600" />;
      case 'review': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'fail': return <X className="w-4 h-4 text-red-600" />;
      default: return null;
    }
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
      deal_type: 'scattered_lot',
      municipality_id: municipalityId || null,
      home_plan_id: homePlanId || null,
      upgrade_id: upgradeId || null,
      anticipated_sale_price: calculations.asp,
      land_purchase_cost: calculations.land,
      site_prep_cost: calculations.sitePrep,
      vertical_site_prep_cost: calculations.vertSitePrep,
      total_project_cost: calculations.totalProjectCost,
      all_in_cost: calculations.allInCost,
      net_profit: calculations.netProfit,
      net_margin: calculations.netMargin,
      land_site_pct: calculations.landSitePct
    };

    if (onSave) {
      await onSave(data);
    }
    setSaving(false);
  };

  const handleCreateProject = () => {
    if (onCreateProject) {
      onCreateProject({
        ...calculations,
        municipalityId,
        homePlanId,
        upgradeId,
        selectedMunicipality,
        selectedPlan,
        selectedUpgrade
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading deal sheet...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <Calculator className="w-5 h-5 text-white" />
          <div>
            <h3 className="font-semibold text-white">Scattered Lot Quick Analysis</h3>
            <p className="text-xs text-blue-100">Back-of-napkin deal evaluation</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {calculations.asp > 0 && (
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(marginStatus)}`}>
                {formatPercent(calculations.netMargin)} Margin
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(landSiteStatus)}`}>
                {formatPercent(calculations.landSitePct)} Land
              </span>
            </div>
          )}
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-white" />
          ) : (
            <ChevronDown className="w-5 h-5 text-white" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          {/* Property & Assumptions Row */}
          <div className="grid grid-cols-2 gap-6">
            {/* Property Section */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                PROPERTY
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Municipality</label>
                  <select
                    value={municipalityId}
                    onChange={(e) => setMunicipalityId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select municipality...</option>
                    {municipalities.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">House Plan</label>
                  <select
                    value={homePlanId}
                    onChange={(e) => setHomePlanId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select plan...</option>
                    {homePlans.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.plan_name} ({p.heated_sf} SF, {p.bedrooms}BR/{p.bathrooms}BA)
                      </option>
                    ))}
                  </select>
                </div>
                {selectedPlan && (
                  <div className="text-xs text-gray-500 bg-gray-50 rounded px-3 py-2">
                    <span className="font-medium">Heated SF:</span> {selectedPlan.heated_sf.toLocaleString()} •
                    <span className="font-medium ml-2">Garage:</span> {selectedPlan.garage_type}
                  </div>
                )}
              </div>
            </div>

            {/* Key Assumptions Section */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                KEY ASSUMPTIONS
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Anticipated Sale Price (ASP)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={anticipatedSalePrice}
                      onChange={(e) => setAnticipatedSalePrice(e.target.value)}
                      placeholder="0"
                      className="w-full pl-7 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Upgrade Package</label>
                  <select
                    value={upgradeId}
                    onChange={(e) => setUpgradeId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {upgrades.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.upgrade_name} {u.upgrade_price > 0 ? `(+${formatCurrency(u.upgrade_price)})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Structure */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              COST STRUCTURE
            </h4>
            <div className="grid grid-cols-2 gap-6">
              {/* Left column - Inputs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">1. Land Purchase</span>
                  <div className="relative w-32">
                    <span className="absolute left-2 top-1.5 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      value={landPurchaseCost}
                      onChange={(e) => setLandPurchaseCost(e.target.value)}
                      placeholder="0"
                      className="w-full pl-6 pr-2 py-1 border rounded text-sm text-right focus:ring-2 focus:ring-blue-500 bg-yellow-50"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">2. Buyer Closing (4%)</span>
                  <span className="text-sm font-medium w-32 text-right">{formatCurrency(calculations.buyerClosing)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">3. Site Prep</span>
                  <div className="relative w-32">
                    <span className="absolute left-2 top-1.5 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      value={sitePrepCost}
                      onChange={(e) => setSitePrepCost(e.target.value)}
                      placeholder="0"
                      className="w-full pl-6 pr-2 py-1 border rounded text-sm text-right focus:ring-2 focus:ring-blue-500 bg-yellow-50"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">4. Vertical Site Prep</span>
                  <div className="relative w-32">
                    <span className="absolute left-2 top-1.5 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      value={verticalSitePrepCost}
                      onChange={(e) => setVerticalSitePrepCost(e.target.value)}
                      placeholder="0"
                      className="w-full pl-6 pr-2 py-1 border rounded text-sm text-right focus:ring-2 focus:ring-blue-500 bg-yellow-50"
                    />
                  </div>
                </div>
              </div>

              {/* Right column - Lookups & Calculated */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">5. Sticks & Bricks</span>
                  <span className="text-sm font-medium w-32 text-right text-blue-600">
                    {formatCurrency(calculations.sticksBricks)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">6. Upgrades</span>
                  <span className="text-sm font-medium w-32 text-right text-blue-600">
                    {formatCurrency(calculations.upgradeCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">7. Soft Costs</span>
                  <span className="text-sm font-medium w-32 text-right text-blue-600">
                    {formatCurrency(calculations.softCosts)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">8. RC Construction Fee</span>
                  <span className="text-sm font-medium w-32 text-right">{formatCurrency(calculations.rcFee)}</span>
                </div>
              </div>
            </div>

            {/* Total Project Cost */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed">
              <span className="text-sm font-semibold text-gray-800">TOTAL PROJECT COST (TPC)</span>
              <span className="text-sm font-bold text-gray-900">{formatCurrency(calculations.totalProjectCost)}</span>
            </div>

            {/* Financing Costs */}
            <div className="mt-3 space-y-2 pl-4 border-l-2 border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">9. Carry Costs (TPC × 70% × 6%)</span>
                <span className="text-sm font-medium">{formatCurrency(calculations.carryCosts)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">10. Equity Cost (TPC × 30% × 16%)</span>
                <span className="text-sm font-medium">{formatCurrency(calculations.equityCost)}</span>
              </div>
            </div>

            {/* All-In Cost */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed">
              <span className="text-sm font-semibold text-gray-800">ALL-IN COST</span>
              <span className="text-sm font-bold text-gray-900">{formatCurrency(calculations.allInCost)}</span>
            </div>

            {/* Seller Closing */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-600">11. Seller Closing (ASP × 8%)</span>
              <span className="text-sm font-medium">{formatCurrency(calculations.sellerClosing)}</span>
            </div>
          </div>

          {/* Results */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Percent className="w-4 h-4" />
              RESULTS
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {/* Net Profit / Margin */}
              <div className={`rounded-lg border-2 p-4 ${
                marginStatus === 'pass' ? 'border-green-300 bg-green-50' :
                marginStatus === 'review' ? 'border-yellow-300 bg-yellow-50' :
                'border-red-300 bg-red-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Net Profit</span>
                  <span className={`text-lg font-bold ${
                    calculations.netProfit >= 0 ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {formatCurrency(calculations.netProfit)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Net Margin</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{formatPercent(calculations.netMargin)}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 ${getStatusColor(marginStatus)}`}>
                      {getStatusIcon(marginStatus)}
                      {getStatusLabel(marginStatus)}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Target: ≥10% PASS, 7-10% REVIEW, &lt;7% FAIL
                </div>
              </div>

              {/* Land + Site */}
              <div className={`rounded-lg border-2 p-4 ${
                landSiteStatus === 'pass' ? 'border-green-300 bg-green-50' :
                landSiteStatus === 'review' ? 'border-yellow-300 bg-yellow-50' :
                landSiteStatus === 'warning' ? 'border-orange-300 bg-orange-50' :
                'border-red-300 bg-red-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Land + Site</span>
                  <span className="text-lg font-bold text-gray-800">
                    {formatCurrency(calculations.landPlusSite)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">As % of ASP</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{formatPercent(calculations.landSitePct)}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 ${getStatusColor(landSiteStatus)}`}>
                      {getStatusIcon(landSiteStatus)}
                      {getStatusLabel(landSiteStatus)}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Target: ≤20% PASS, 20-25% OK, 25-30% REVIEW, &gt;30% FAIL
                </div>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700">
              <strong>Quick Analysis Only:</strong> This is a first-pass filter. Use "Create Project" to generate a full pro forma with itemized costs before making investment decisions.
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-xs text-gray-500">
              Financing: {(assumptions.ltc * 100).toFixed(0)}% LTC @ {(assumptions.interestRate * 100).toFixed(1)}% for {assumptions.termMonths}mo
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={saving || !calculations.asp}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Analysis'}
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!calculations.asp || marginStatus === 'fail'}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
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
