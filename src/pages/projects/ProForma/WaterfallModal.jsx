// src/pages/projects/ProForma/WaterfallModal.jsx
// Modal for viewing and configuring investor waterfall distribution

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  calculateWaterfall,
  getDefaultWaterfallStructure,
  calculateManagementFees,
  runWaterfallScenarios,
} from '@/services/proformaService';
import { TrendingUp, Users, DollarSign, Percent, ChevronDown, ChevronUp, Settings } from 'lucide-react';

const STRUCTURE_TYPES = [
  { value: 'american', label: 'American (Distributions as earned)' },
  { value: 'european', label: 'European (Return of capital first)' },
  { value: 'hybrid', label: 'Hybrid' },
];

const PREF_TYPES = [
  { value: 'cumulative', label: 'Cumulative (Simple)' },
  { value: 'compounding', label: 'Compounding' },
  { value: 'non_cumulative', label: 'Non-Cumulative' },
];

function formatCurrency(value) {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined) return '-';
  return `${(value * 100).toFixed(decimals)}%`;
}

function formatMultiple(value) {
  if (value === null || value === undefined) return '-';
  return `${value.toFixed(2)}x`;
}

export default function WaterfallModal({
  open,
  onClose,
  proforma,
  initialStructure,
  onSave,
}) {
  const [activeTab, setActiveTab] = useState('results');
  const [structure, setStructure] = useState(initialStructure || getDefaultWaterfallStructure());
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (open) {
      setStructure(initialStructure || getDefaultWaterfallStructure());
      setActiveTab('results');
    }
  }, [open, initialStructure]);

  // Calculate waterfall results
  const waterfallResults = useMemo(() => {
    if (!proforma) return null;
    return calculateWaterfall(proforma, structure);
  }, [proforma, structure]);

  // Calculate scenarios
  const scenarios = useMemo(() => {
    if (!proforma) return null;
    return runWaterfallScenarios(proforma, structure);
  }, [proforma, structure]);

  // Calculate management fees
  const fees = useMemo(() => {
    if (!proforma) return null;
    return calculateManagementFees(proforma, structure);
  }, [proforma, structure]);

  const handleStructureChange = (path, value) => {
    setStructure(prev => {
      const newStructure = { ...prev };
      const keys = path.split('.');
      let obj = newStructure;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return newStructure;
    });
  };

  const handleTierChange = (tierIndex, field, value) => {
    setStructure(prev => {
      const newTiers = [...prev.promote_tiers];
      newTiers[tierIndex] = { ...newTiers[tierIndex], [field]: value };
      return { ...prev, promote_tiers: newTiers };
    });
  };

  const addTier = () => {
    setStructure(prev => ({
      ...prev,
      promote_tiers: [
        ...prev.promote_tiers,
        {
          tier_number: prev.promote_tiers.length + 1,
          name: `Tier ${prev.promote_tiers.length + 1}`,
          hurdle_type: 'irr',
          irr_hurdle: 0.20,
          multiple_hurdle: 1.5,
          lp_share: 0.70,
          gp_share: 0.30,
        },
      ],
    }));
  };

  const removeTier = (index) => {
    setStructure(prev => ({
      ...prev,
      promote_tiers: prev.promote_tiers.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    onSave?.(structure);
    onClose();
  };

  if (!proforma) return null;

  const lp = waterfallResults?.final_results?.lp || {};
  const gp = waterfallResults?.final_results?.gp || {};
  const project = waterfallResults?.final_results?.project || {};
  const tiers = waterfallResults?.tier_results || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Investor Waterfall Analysis
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="tiers">Tier Breakdown</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="structure">Structure</TabsTrigger>
          </TabsList>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {/* LP vs GP Summary */}
            <div className="grid grid-cols-2 gap-6">
              {/* LP Returns */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">LP Returns</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Equity Invested</span>
                    <span className="font-medium">{formatCurrency(lp.total_invested)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Distributed</span>
                    <span className="font-medium">{formatCurrency(lp.total_distributed)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profit</span>
                    <span className="font-medium text-green-600">{formatCurrency(lp.profit)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">IRR</span>
                      <span className="font-semibold text-blue-700">{formatPercent(lp.irr)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Equity Multiple</span>
                      <span className="font-semibold text-blue-700">{formatMultiple(lp.equity_multiple)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* GP Returns */}
              <div className="bg-emerald-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-semibold text-emerald-900">GP Returns</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Co-Invest</span>
                    <span className="font-medium">{formatCurrency(gp.total_invested)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Distributed</span>
                    <span className="font-medium">{formatCurrency(gp.total_distributed)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Promote Earned</span>
                    <span className="font-medium text-green-600">{formatCurrency(gp.promote_earned)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">IRR</span>
                      <span className="font-semibold text-emerald-700">{formatPercent(gp.irr)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Equity Multiple</span>
                      <span className="font-semibold text-emerald-700">{formatMultiple(gp.equity_multiple)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Project Summary</h3>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Total Cost</div>
                  <div className="font-medium">{formatCurrency(project.total_cost)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Total Equity</div>
                  <div className="font-medium">{formatCurrency(project.total_equity)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Net Profit</div>
                  <div className="font-medium text-green-600">{formatCurrency(project.net_profit)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Project IRR</div>
                  <div className="font-medium">{formatPercent(project.project_irr)}</div>
                </div>
              </div>
            </div>

            {/* Distribution Split Chart */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Distribution Split</h3>
              <div className="h-8 flex rounded-lg overflow-hidden">
                {lp.total_distributed > 0 && (
                  <div
                    className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                    style={{
                      width: `${(lp.total_distributed / (lp.total_distributed + gp.total_distributed)) * 100}%`,
                    }}
                  >
                    LP: {formatPercent(lp.total_distributed / (lp.total_distributed + gp.total_distributed))}
                  </div>
                )}
                {gp.total_distributed > 0 && (
                  <div
                    className="bg-emerald-500 flex items-center justify-center text-white text-xs font-medium"
                    style={{
                      width: `${(gp.total_distributed / (lp.total_distributed + gp.total_distributed)) * 100}%`,
                    }}
                  >
                    GP: {formatPercent(gp.total_distributed / (lp.total_distributed + gp.total_distributed))}
                  </div>
                )}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>LP: {formatCurrency(lp.total_distributed)}</span>
                <span>GP: {formatCurrency(gp.total_distributed)}</span>
              </div>
            </div>

            {/* Management Fees */}
            {fees && fees.total_fees > 0 && (
              <div className="bg-amber-50 rounded-lg p-4">
                <h3 className="font-semibold text-amber-900 mb-3">Management Fees</h3>
                <div className="grid grid-cols-5 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Acquisition</div>
                    <div className="font-medium">{formatCurrency(fees.acquisition_fee)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Construction Mgmt</div>
                    <div className="font-medium">{formatCurrency(fees.construction_management_fee)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Asset Mgmt</div>
                    <div className="font-medium">{formatCurrency(fees.asset_management_fee)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Disposition</div>
                    <div className="font-medium">{formatCurrency(fees.disposition_fee)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Total Fees</div>
                    <div className="font-semibold text-amber-700">{formatCurrency(fees.total_fees)}</div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Tier Breakdown Tab */}
          <TabsContent value="tiers" className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Tier</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-600">LP Share</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-600">GP Share</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-600">LP Dist.</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-600">GP Dist.</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-600">Total</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-600">LP Cumulative</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-600">LP Multiple</th>
                  </tr>
                </thead>
                <tbody>
                  {tiers.map((tier, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3">
                        <div className="font-medium">{tier.tier_name}</div>
                        {tier.hurdle_irr && (
                          <div className="text-xs text-gray-500">
                            Hurdle: {formatPercent(tier.hurdle_irr)} IRR
                          </div>
                        )}
                      </td>
                      <td className="text-right py-2 px-3">
                        {tier.lp_share ? formatPercent(tier.lp_share) : '-'}
                      </td>
                      <td className="text-right py-2 px-3">
                        {tier.gp_share ? formatPercent(tier.gp_share) : '-'}
                      </td>
                      <td className="text-right py-2 px-3 text-blue-600">
                        {formatCurrency(tier.lp_distribution)}
                      </td>
                      <td className="text-right py-2 px-3 text-emerald-600">
                        {formatCurrency(tier.gp_distribution)}
                      </td>
                      <td className="text-right py-2 px-3 font-medium">
                        {formatCurrency(tier.total_distribution)}
                      </td>
                      <td className="text-right py-2 px-3">
                        {formatCurrency(tier.cumulative_lp)}
                      </td>
                      <td className="text-right py-2 px-3">
                        {formatMultiple(tier.lp_multiple_at_tier)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-semibold">
                    <td className="py-2 px-3">Total</td>
                    <td className="text-right py-2 px-3">-</td>
                    <td className="text-right py-2 px-3">-</td>
                    <td className="text-right py-2 px-3 text-blue-600">
                      {formatCurrency(lp.total_distributed)}
                    </td>
                    <td className="text-right py-2 px-3 text-emerald-600">
                      {formatCurrency(gp.total_distributed)}
                    </td>
                    <td className="text-right py-2 px-3">
                      {formatCurrency(lp.total_distributed + gp.total_distributed)}
                    </td>
                    <td className="text-right py-2 px-3">-</td>
                    <td className="text-right py-2 px-3">
                      {formatMultiple(lp.equity_multiple)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </TabsContent>

          {/* Scenarios Tab */}
          <TabsContent value="scenarios" className="space-y-4">
            {scenarios && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 font-medium text-gray-600">Metric</th>
                        <th className="text-center py-2 px-3 font-medium text-red-600">Downside (-20%)</th>
                        <th className="text-center py-2 px-3 font-medium text-gray-600">Base Case</th>
                        <th className="text-center py-2 px-3 font-medium text-green-600">Upside (+20%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium">LP IRR</td>
                        <td className="text-center py-2 px-3 text-red-600">
                          {formatPercent(scenarios.downside.final_results.lp.irr)}
                        </td>
                        <td className="text-center py-2 px-3">
                          {formatPercent(scenarios.base.final_results.lp.irr)}
                        </td>
                        <td className="text-center py-2 px-3 text-green-600">
                          {formatPercent(scenarios.upside.final_results.lp.irr)}
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium">LP Multiple</td>
                        <td className="text-center py-2 px-3 text-red-600">
                          {formatMultiple(scenarios.downside.final_results.lp.equity_multiple)}
                        </td>
                        <td className="text-center py-2 px-3">
                          {formatMultiple(scenarios.base.final_results.lp.equity_multiple)}
                        </td>
                        <td className="text-center py-2 px-3 text-green-600">
                          {formatMultiple(scenarios.upside.final_results.lp.equity_multiple)}
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium">LP Profit</td>
                        <td className="text-center py-2 px-3 text-red-600">
                          {formatCurrency(scenarios.downside.final_results.lp.profit)}
                        </td>
                        <td className="text-center py-2 px-3">
                          {formatCurrency(scenarios.base.final_results.lp.profit)}
                        </td>
                        <td className="text-center py-2 px-3 text-green-600">
                          {formatCurrency(scenarios.upside.final_results.lp.profit)}
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium">GP IRR</td>
                        <td className="text-center py-2 px-3 text-red-600">
                          {formatPercent(scenarios.downside.final_results.gp.irr)}
                        </td>
                        <td className="text-center py-2 px-3">
                          {formatPercent(scenarios.base.final_results.gp.irr)}
                        </td>
                        <td className="text-center py-2 px-3 text-green-600">
                          {formatPercent(scenarios.upside.final_results.gp.irr)}
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium">GP Promote</td>
                        <td className="text-center py-2 px-3 text-red-600">
                          {formatCurrency(scenarios.downside.final_results.gp.promote_earned)}
                        </td>
                        <td className="text-center py-2 px-3">
                          {formatCurrency(scenarios.base.final_results.gp.promote_earned)}
                        </td>
                        <td className="text-center py-2 px-3 text-green-600">
                          {formatCurrency(scenarios.upside.final_results.gp.promote_earned)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Range Visualization */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">LP IRR Range</h4>
                  <div className="relative h-8 bg-gray-200 rounded">
                    <div
                      className="absolute h-full bg-gradient-to-r from-red-400 via-gray-400 to-green-400 rounded"
                      style={{ left: '10%', right: '10%' }}
                    />
                    <div
                      className="absolute top-0 h-full w-1 bg-red-600"
                      style={{ left: `${10 + 80 * 0}%` }}
                      title={`Downside: ${formatPercent(scenarios.summary.lp_irr_range.low)}`}
                    />
                    <div
                      className="absolute top-0 h-full w-1 bg-gray-800"
                      style={{ left: `${10 + 80 * 0.5}%` }}
                      title={`Base: ${formatPercent(scenarios.summary.lp_irr_range.base)}`}
                    />
                    <div
                      className="absolute top-0 h-full w-1 bg-green-600"
                      style={{ left: `${10 + 80 * 1}%` }}
                      title={`Upside: ${formatPercent(scenarios.summary.lp_irr_range.high)}`}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{formatPercent(scenarios.summary.lp_irr_range.low)}</span>
                    <span>{formatPercent(scenarios.summary.lp_irr_range.base)}</span>
                    <span>{formatPercent(scenarios.summary.lp_irr_range.high)}</span>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Structure Configuration Tab */}
          <TabsContent value="structure" className="space-y-6">
            {/* Capital Structure */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Capital Structure</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="mb-1">Structure Type</Label>
                  <select
                    value={structure.structure_type}
                    onChange={(e) => handleStructureChange('structure_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    {STRUCTURE_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="mb-1">LP Equity %</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={structure.capital_structure.lp_equity_percent}
                      onChange={(e) => {
                        const lp = parseFloat(e.target.value) || 0;
                        handleStructureChange('capital_structure.lp_equity_percent', lp);
                        handleStructureChange('capital_structure.gp_equity_percent', 100 - lp);
                      }}
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
                  </div>
                </div>
                <div>
                  <Label className="mb-1">GP Co-Invest %</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={structure.capital_structure.gp_equity_percent}
                      onChange={(e) => {
                        const gp = parseFloat(e.target.value) || 0;
                        handleStructureChange('capital_structure.gp_equity_percent', gp);
                        handleStructureChange('capital_structure.lp_equity_percent', 100 - gp);
                      }}
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Preferred Return */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Preferred Return</h4>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={structure.preferred_return.enabled}
                    onChange={(e) => handleStructureChange('preferred_return.enabled', e.target.checked)}
                  />
                  Enabled
                </label>
              </div>
              {structure.preferred_return.enabled && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="mb-1">Pref Rate (Annual)</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.5"
                        value={(structure.preferred_return.rate || 0.08) * 100}
                        onChange={(e) => handleStructureChange('preferred_return.rate', parseFloat(e.target.value) / 100)}
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
                    </div>
                  </div>
                  <div>
                    <Label className="mb-1">Type</Label>
                    <select
                      value={structure.preferred_return.type}
                      onChange={(e) => handleStructureChange('preferred_return.type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {PREF_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="mb-1">GP Catch-Up</Label>
                    <label className="flex items-center gap-2 text-sm mt-2">
                      <input
                        type="checkbox"
                        checked={structure.preferred_return.catch_up_enabled}
                        onChange={(e) => handleStructureChange('preferred_return.catch_up_enabled', e.target.checked)}
                      />
                      Enable catch-up to {formatPercent(structure.preferred_return.catch_up_target || 0.20)}
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Promote Tiers */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Promote Tiers</h4>
                <Button size="sm" variant="outline" onClick={addTier}>
                  Add Tier
                </Button>
              </div>
              <div className="space-y-3">
                {structure.promote_tiers.map((tier, idx) => (
                  <div key={idx} className="bg-white border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{tier.name || `Tier ${tier.tier_number}`}</span>
                      {structure.promote_tiers.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 h-6 px-2"
                          onClick={() => removeTier(idx)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                      <div>
                        <Label className="text-xs mb-1">Name</Label>
                        <Input
                          value={tier.name || ''}
                          onChange={(e) => handleTierChange(idx, 'name', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-1">IRR Hurdle</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            step="1"
                            value={(tier.irr_hurdle || 0) * 100}
                            onChange={(e) => handleTierChange(idx, 'irr_hurdle', parseFloat(e.target.value) / 100)}
                            className="h-8 text-sm pr-6"
                          />
                          <span className="absolute right-2 top-1.5 text-gray-500 text-xs">%</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs mb-1">Multiple Hurdle</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.1"
                            value={tier.multiple_hurdle || ''}
                            onChange={(e) => handleTierChange(idx, 'multiple_hurdle', parseFloat(e.target.value))}
                            className="h-8 text-sm pr-6"
                          />
                          <span className="absolute right-2 top-1.5 text-gray-500 text-xs">x</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs mb-1">LP Share</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            step="5"
                            value={(tier.lp_share || 0) * 100}
                            onChange={(e) => {
                              const lp = parseFloat(e.target.value) / 100;
                              handleTierChange(idx, 'lp_share', lp);
                              handleTierChange(idx, 'gp_share', 1 - lp);
                            }}
                            className="h-8 text-sm pr-6"
                          />
                          <span className="absolute right-2 top-1.5 text-gray-500 text-xs">%</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs mb-1">GP Share</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            step="5"
                            value={(tier.gp_share || 0) * 100}
                            onChange={(e) => {
                              const gp = parseFloat(e.target.value) / 100;
                              handleTierChange(idx, 'gp_share', gp);
                              handleTierChange(idx, 'lp_share', 1 - gp);
                            }}
                            className="h-8 text-sm pr-6"
                          />
                          <span className="absolute right-2 top-1.5 text-gray-500 text-xs">%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced Options */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <Settings className="h-4 w-4" />
                Advanced Options
                {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-4">
                  {/* Clawback Provisions */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Clawback & True-Up</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={structure.clawback_provisions?.gp_clawback_enabled}
                          onChange={(e) => handleStructureChange('clawback_provisions.gp_clawback_enabled', e.target.checked)}
                        />
                        GP Clawback Enabled
                      </label>
                      <div>
                        <Label className="mb-1 text-xs">Escrow %</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            step="1"
                            value={(structure.clawback_provisions?.escrow_percent || 0) * 100}
                            onChange={(e) => handleStructureChange('clawback_provisions.escrow_percent', parseFloat(e.target.value) / 100)}
                            className="h-8 text-sm pr-6"
                          />
                          <span className="absolute right-2 top-1.5 text-gray-500 text-xs">%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Management Fees */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Management Fees</h4>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label className="mb-1 text-xs">Acquisition Fee</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.25"
                            value={(structure.management_fees?.acquisition_fee_percent || 0) * 100}
                            onChange={(e) => handleStructureChange('management_fees.acquisition_fee_percent', parseFloat(e.target.value) / 100)}
                            className="h-8 text-sm pr-6"
                          />
                          <span className="absolute right-2 top-1.5 text-gray-500 text-xs">%</span>
                        </div>
                      </div>
                      <div>
                        <Label className="mb-1 text-xs">Asset Mgmt (Annual)</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.25"
                            value={(structure.management_fees?.asset_management_fee_percent || 0) * 100}
                            onChange={(e) => handleStructureChange('management_fees.asset_management_fee_percent', parseFloat(e.target.value) / 100)}
                            className="h-8 text-sm pr-6"
                          />
                          <span className="absolute right-2 top-1.5 text-gray-500 text-xs">%</span>
                        </div>
                      </div>
                      <div>
                        <Label className="mb-1 text-xs">Construction Mgmt</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.5"
                            value={(structure.management_fees?.construction_management_fee_percent || 0) * 100}
                            onChange={(e) => handleStructureChange('management_fees.construction_management_fee_percent', parseFloat(e.target.value) / 100)}
                            className="h-8 text-sm pr-6"
                          />
                          <span className="absolute right-2 top-1.5 text-gray-500 text-xs">%</span>
                        </div>
                      </div>
                      <div>
                        <Label className="mb-1 text-xs">Disposition Fee</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.25"
                            value={(structure.management_fees?.disposition_fee_percent || 0) * 100}
                            onChange={(e) => handleStructureChange('management_fees.disposition_fee_percent', parseFloat(e.target.value) / 100)}
                            className="h-8 text-sm pr-6"
                          />
                          <span className="absolute right-2 top-1.5 text-gray-500 text-xs">%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button
                onClick={handleSave}
                className="bg-[#2F855A] hover:bg-[#276749] text-white"
              >
                Save Waterfall Structure
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
