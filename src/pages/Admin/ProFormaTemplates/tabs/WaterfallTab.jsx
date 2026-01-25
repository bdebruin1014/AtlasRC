// src/pages/Admin/ProFormaTemplates/tabs/WaterfallTab.jsx
// Admin interface for configuring waterfall distribution structures on pro forma templates

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Plus, Trash2, GripVertical, ChartBar, Users, DollarSign,
  TrendingUp, AlertCircle,
} from 'lucide-react';

const STRUCTURE_TYPES = [
  {
    value: 'american',
    label: 'American (Deal-by-Deal)',
    description: 'Distributions made as each hurdle is achieved',
  },
  {
    value: 'european',
    label: 'European (Whole Fund)',
    description: 'Return of capital to all investors first, then promote',
  },
  {
    value: 'hybrid',
    label: 'Hybrid',
    description: 'Custom combination of distribution rules',
  },
];

const PRESET_STRUCTURES = [
  {
    name: '80/20 with 8% Pref',
    description: 'Simple structure with 8% pref, 80/20 split',
    structure: {
      preferred_return: { enabled: true, rate: 0.08, type: 'cumulative', catch_up_enabled: false },
      promote_tiers: [
        { tier_number: 1, name: 'Base Split', irr_hurdle: null, lp_share: 0.80, gp_share: 0.20 },
      ],
    },
  },
  {
    name: '80/20 with Catch-Up',
    description: '8% pref, 100% catch-up to 20%, then 80/20',
    structure: {
      preferred_return: {
        enabled: true, rate: 0.08, type: 'cumulative',
        catch_up_enabled: true, catch_up_percent: 1.0, catch_up_target: 0.20,
      },
      promote_tiers: [
        { tier_number: 1, name: 'After Catch-Up', irr_hurdle: null, lp_share: 0.80, gp_share: 0.20 },
      ],
    },
  },
  {
    name: 'IRR Tiered (Institutional)',
    description: 'Multiple IRR hurdles with increasing promote',
    structure: {
      preferred_return: { enabled: true, rate: 0.08, type: 'cumulative', catch_up_enabled: true },
      promote_tiers: [
        { tier_number: 1, name: '8-12% IRR', hurdle_type: 'irr', irr_hurdle: 0.08, lp_share: 0.80, gp_share: 0.20 },
        { tier_number: 2, name: '12-18% IRR', hurdle_type: 'irr', irr_hurdle: 0.12, lp_share: 0.70, gp_share: 0.30 },
        { tier_number: 3, name: '18-25% IRR', hurdle_type: 'irr', irr_hurdle: 0.18, lp_share: 0.60, gp_share: 0.40 },
        { tier_number: 4, name: '25%+ IRR', hurdle_type: 'irr', irr_hurdle: 0.25, lp_share: 0.50, gp_share: 0.50 },
      ],
    },
  },
  {
    name: 'Multiple-Based Hurdles',
    description: 'Equity multiple hurdles instead of IRR',
    structure: {
      preferred_return: { enabled: true, rate: 0.08, type: 'cumulative' },
      promote_tiers: [
        { tier_number: 1, name: '1.0-1.5x', hurdle_type: 'equity_multiple', multiple_hurdle: 1.0, lp_share: 0.80, gp_share: 0.20 },
        { tier_number: 2, name: '1.5-2.0x', hurdle_type: 'equity_multiple', multiple_hurdle: 1.5, lp_share: 0.70, gp_share: 0.30 },
        { tier_number: 3, name: '2.0x+', hurdle_type: 'equity_multiple', multiple_hurdle: 2.0, lp_share: 0.60, gp_share: 0.40 },
      ],
    },
  },
];

const DEFAULT_CONFIG = {
  enabled: false,
  structure_type: 'american',
  capital_structure: {
    lp_equity_percent: 90,
    gp_equity_percent: 10,
    gp_co_invest_required: true,
  },
  preferred_return: {
    enabled: true,
    lp_pref_rate: 8,
    gp_pref_rate: 8,
    type: 'cumulative',
    payment_frequency: 'at_exit',
    catch_up_enabled: false,
    catch_up_percent: 100,
    catch_up_target: 20,
    accrues_during_construction: true,
  },
  promote_tiers: [],
  management_fees: {
    acquisition_fee_percent: 1,
    asset_management_fee_percent: 2,
    disposition_fee_percent: 1,
    construction_management_fee_percent: 5,
  },
  clawback_provisions: {
    gp_clawback_enabled: false,
    escrow_percent: 10,
    true_up_frequency: 'at_exit',
  },
};

export default function WaterfallTab({ config, onChange }) {
  const waterfallConfig = config || DEFAULT_CONFIG;

  const updateConfig = (path, value) => {
    const keys = path.split('.');
    const newConfig = { ...waterfallConfig };
    let obj = newConfig;
    for (let i = 0; i < keys.length - 1; i++) {
      obj[keys[i]] = { ...obj[keys[i]] };
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    onChange(newConfig);
  };

  const applyPreset = (preset) => {
    onChange({
      ...waterfallConfig,
      enabled: true,
      preferred_return: {
        ...waterfallConfig.preferred_return,
        ...preset.structure.preferred_return,
        lp_pref_rate: (preset.structure.preferred_return.rate || 0.08) * 100,
        gp_pref_rate: (preset.structure.preferred_return.rate || 0.08) * 100,
        catch_up_percent: (preset.structure.preferred_return.catch_up_percent || 1) * 100,
        catch_up_target: (preset.structure.preferred_return.catch_up_target || 0.20) * 100,
      },
      promote_tiers: preset.structure.promote_tiers.map((t, i) => ({
        ...t,
        id: `tier-${Date.now()}-${i}`,
        irr_hurdle: t.irr_hurdle ? t.irr_hurdle * 100 : null,
        lp_share: t.lp_share * 100,
        gp_share: t.gp_share * 100,
      })),
    });
  };

  const addTier = () => {
    const tiers = waterfallConfig.promote_tiers || [];
    const nextTierNumber = tiers.length + 1;
    const newTier = {
      id: `tier-${Date.now()}`,
      tier_number: nextTierNumber,
      name: `Tier ${nextTierNumber}`,
      description: '',
      hurdle_type: 'irr',
      irr_hurdle: nextTierNumber === 1 ? null : 12 + (nextTierNumber - 2) * 6,
      multiple_hurdle: null,
      hurdle_logic: 'or',
      lp_share: Math.max(50, 90 - (nextTierNumber - 1) * 10),
      gp_share: Math.min(50, 10 + (nextTierNumber - 1) * 10),
    };
    updateConfig('promote_tiers', [...tiers, newTier]);
  };

  const updateTier = (index, field, value) => {
    const tiers = [...(waterfallConfig.promote_tiers || [])];
    tiers[index] = { ...tiers[index], [field]: value };
    updateConfig('promote_tiers', tiers);
  };

  const removeTier = (index) => {
    const tiers = [...(waterfallConfig.promote_tiers || [])];
    tiers.splice(index, 1);
    // Renumber tiers
    tiers.forEach((t, i) => { t.tier_number = i + 1; });
    updateConfig('promote_tiers', tiers);
  };

  const moveTier = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= (waterfallConfig.promote_tiers || []).length) return;
    const tiers = [...(waterfallConfig.promote_tiers || [])];
    const [removed] = tiers.splice(fromIndex, 1);
    tiers.splice(toIndex, 0, removed);
    tiers.forEach((t, i) => { t.tier_number = i + 1; });
    updateConfig('promote_tiers', tiers);
  };

  return (
    <div className="max-w-5xl space-y-8">
      {/* Enable/Disable */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Investor Waterfall</h3>
          <p className="text-sm text-gray-500">
            Configure how profits are distributed between LP and GP investors
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Enable Waterfall</span>
          <Switch
            checked={waterfallConfig.enabled}
            onCheckedChange={(checked) => updateConfig('enabled', checked)}
          />
        </div>
      </div>

      {waterfallConfig.enabled && (
        <>
          {/* Preset Templates */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3">Quick Start Presets</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PRESET_STRUCTURES.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-400 text-left transition-colors"
                >
                  <p className="font-medium text-blue-900 text-sm">{preset.name}</p>
                  <p className="text-xs text-blue-600 mt-1">{preset.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Structure Type */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold mb-4">Distribution Structure</h4>
            <div className="grid grid-cols-3 gap-4">
              {STRUCTURE_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    waterfallConfig.structure_type === type.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="structure_type"
                    value={type.value}
                    checked={waterfallConfig.structure_type === type.value}
                    onChange={() => updateConfig('structure_type', type.value)}
                    className="sr-only"
                  />
                  <p className="font-medium text-gray-900">{type.label}</p>
                  <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                </label>
              ))}
            </div>
          </div>

          {/* Capital Structure */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold mb-4">Default Capital Structure</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="mb-1">LP Equity %</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={waterfallConfig.capital_structure?.lp_equity_percent || 90}
                    onChange={(e) => {
                      const lp = parseFloat(e.target.value) || 0;
                      updateConfig('capital_structure.lp_equity_percent', lp);
                      updateConfig('capital_structure.gp_equity_percent', 100 - lp);
                    }}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-2 text-gray-400">%</span>
                </div>
              </div>
              <div>
                <Label className="mb-1">GP Equity %</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={waterfallConfig.capital_structure?.gp_equity_percent || 10}
                    onChange={(e) => {
                      const gp = parseFloat(e.target.value) || 0;
                      updateConfig('capital_structure.gp_equity_percent', gp);
                      updateConfig('capital_structure.lp_equity_percent', 100 - gp);
                    }}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-2 text-gray-400">%</span>
                </div>
              </div>
              <div className="col-span-2 flex items-center mt-6">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={waterfallConfig.capital_structure?.gp_co_invest_required}
                    onChange={(e) => updateConfig('capital_structure.gp_co_invest_required', e.target.checked)}
                    className="rounded text-green-600"
                  />
                  <span className="text-sm">GP Co-Investment Required</span>
                </label>
              </div>
            </div>
          </div>

          {/* Preferred Return */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Preferred Return</h4>
              <Switch
                checked={waterfallConfig.preferred_return?.enabled}
                onCheckedChange={(checked) => updateConfig('preferred_return.enabled', checked)}
              />
            </div>

            {waterfallConfig.preferred_return?.enabled && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="mb-1">LP Preferred Rate</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.25"
                        value={waterfallConfig.preferred_return?.lp_pref_rate || 8}
                        onChange={(e) => updateConfig('preferred_return.lp_pref_rate', parseFloat(e.target.value) || 0)}
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-2 text-gray-400">%</span>
                    </div>
                  </div>
                  <div>
                    <Label className="mb-1">GP Preferred Rate</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.25"
                        value={waterfallConfig.preferred_return?.gp_pref_rate || 8}
                        onChange={(e) => updateConfig('preferred_return.gp_pref_rate', parseFloat(e.target.value) || 0)}
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-2 text-gray-400">%</span>
                    </div>
                  </div>
                  <div>
                    <Label className="mb-1">Pref Type</Label>
                    <select
                      value={waterfallConfig.preferred_return?.type || 'cumulative'}
                      onChange={(e) => updateConfig('preferred_return.type', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="cumulative">Cumulative (Accruing)</option>
                      <option value="non_cumulative">Non-Cumulative</option>
                      <option value="compounding">Compounding</option>
                    </select>
                  </div>
                  <div>
                    <Label className="mb-1">Payment Frequency</Label>
                    <select
                      value={waterfallConfig.preferred_return?.payment_frequency || 'at_exit'}
                      onChange={(e) => updateConfig('preferred_return.payment_frequency', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="at_exit">At Exit</option>
                      <option value="annual">Annual</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                {/* Catch-Up */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={waterfallConfig.preferred_return?.catch_up_enabled}
                      onChange={(e) => updateConfig('preferred_return.catch_up_enabled', e.target.checked)}
                      className="rounded text-green-600"
                    />
                    <span className="font-medium">Enable GP Catch-Up</span>
                  </label>

                  {waterfallConfig.preferred_return?.catch_up_enabled && (
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <Label className="text-sm text-gray-600 mb-1">Catch-Up Allocation to GP</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            step="1"
                            value={waterfallConfig.preferred_return?.catch_up_percent || 100}
                            onChange={(e) => updateConfig('preferred_return.catch_up_percent', parseFloat(e.target.value) || 0)}
                            className="pr-8"
                          />
                          <span className="absolute right-3 top-2 text-gray-400">%</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Typically 100% (all to GP until caught up)</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600 mb-1">Target GP Share of Profits</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            step="1"
                            value={waterfallConfig.preferred_return?.catch_up_target || 20}
                            onChange={(e) => updateConfig('preferred_return.catch_up_target', parseFloat(e.target.value) || 0)}
                            className="pr-8"
                          />
                          <span className="absolute right-3 top-2 text-gray-400">%</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">GP receives catch-up until reaching this % of total profit</p>
                      </div>
                    </div>
                  )}
                </div>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={waterfallConfig.preferred_return?.accrues_during_construction}
                    onChange={(e) => updateConfig('preferred_return.accrues_during_construction', e.target.checked)}
                    className="rounded text-green-600"
                  />
                  <span className="text-sm">Pref accrues during construction period</span>
                </label>
              </div>
            )}
          </div>

          {/* Promote Tiers */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-semibold">Promote Tiers</h4>
                <p className="text-sm text-gray-500">Define IRR or multiple hurdles and corresponding splits</p>
              </div>
              <Button
                type="button"
                onClick={addTier}
                className="bg-[#2F855A] hover:bg-[#276749] text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Tier
              </Button>
            </div>

            {(!waterfallConfig.promote_tiers || waterfallConfig.promote_tiers.length === 0) ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <ChartBar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No promote tiers defined</p>
                <p className="text-sm text-gray-400">
                  Add tiers to define how profits are split at different return levels
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {waterfallConfig.promote_tiers.map((tier, index) => (
                  <PromoteTierCard
                    key={tier.id || index}
                    tier={tier}
                    index={index}
                    onUpdate={(field, value) => updateTier(index, field, value)}
                    onRemove={() => removeTier(index)}
                    onMoveUp={() => moveTier(index, index - 1)}
                    onMoveDown={() => moveTier(index, index + 1)}
                    isFirst={index === 0}
                    isLast={index === waterfallConfig.promote_tiers.length - 1}
                  />
                ))}
              </div>
            )}

            {/* Waterfall Visualization */}
            {waterfallConfig.promote_tiers && waterfallConfig.promote_tiers.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h5 className="text-sm font-medium text-gray-700 mb-3">Waterfall Visualization</h5>
                <WaterfallVisualization
                  preferredReturn={waterfallConfig.preferred_return}
                  tiers={waterfallConfig.promote_tiers}
                  capitalStructure={waterfallConfig.capital_structure}
                />
              </div>
            )}
          </div>

          {/* Management Fees */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold mb-4">Management Fees</h4>
            <p className="text-sm text-gray-500 mb-4">Fees reduce distributable cash and affect LP returns</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="mb-1">Acquisition Fee</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    value={waterfallConfig.management_fees?.acquisition_fee_percent || 1}
                    onChange={(e) => updateConfig('management_fees.acquisition_fee_percent', parseFloat(e.target.value) || 0)}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-2 text-gray-400">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Of purchase price</p>
              </div>

              <div>
                <Label className="mb-1">Asset Management Fee</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    value={waterfallConfig.management_fees?.asset_management_fee_percent || 2}
                    onChange={(e) => updateConfig('management_fees.asset_management_fee_percent', parseFloat(e.target.value) || 0)}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-2 text-gray-400">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Annual, on committed equity</p>
              </div>

              <div>
                <Label className="mb-1">Disposition Fee</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    value={waterfallConfig.management_fees?.disposition_fee_percent || 1}
                    onChange={(e) => updateConfig('management_fees.disposition_fee_percent', parseFloat(e.target.value) || 0)}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-2 text-gray-400">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Of sale price</p>
              </div>

              <div>
                <Label className="mb-1">Construction Mgmt Fee</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    value={waterfallConfig.management_fees?.construction_management_fee_percent || 5}
                    onChange={(e) => updateConfig('management_fees.construction_management_fee_percent', parseFloat(e.target.value) || 0)}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-2 text-gray-400">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Of hard costs</p>
              </div>
            </div>
          </div>

          {/* Clawback Provisions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold mb-4">Clawback & True-Up Provisions</h4>

            <div className="space-y-4">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={waterfallConfig.clawback_provisions?.gp_clawback_enabled}
                  onChange={(e) => updateConfig('clawback_provisions.gp_clawback_enabled', e.target.checked)}
                  className="rounded text-green-600 mt-1"
                />
                <div>
                  <span className="font-medium">GP Clawback</span>
                  <p className="text-sm text-gray-500">
                    GP must return excess promote if final returns don't meet hurdles
                  </p>
                </div>
              </label>

              {waterfallConfig.clawback_provisions?.gp_clawback_enabled && (
                <div className="ml-6 grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1">Escrow Holdback</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="1"
                        value={waterfallConfig.clawback_provisions?.escrow_percent || 10}
                        onChange={(e) => updateConfig('clawback_provisions.escrow_percent', parseFloat(e.target.value) || 0)}
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-2 text-gray-400">%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Of GP promote held until true-up</p>
                  </div>
                  <div>
                    <Label className="mb-1">True-Up Frequency</Label>
                    <select
                      value={waterfallConfig.clawback_provisions?.true_up_frequency || 'at_exit'}
                      onChange={(e) => updateConfig('clawback_provisions.true_up_frequency', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="at_exit">At Exit Only</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Promote Tier Card Component
function PromoteTierCard({ tier, index, onUpdate, onRemove, onMoveUp, onMoveDown, isFirst, isLast }) {
  return (
    <div className="bg-gray-50 rounded-lg border p-4">
      <div className="flex items-start gap-4">
        {/* Move Buttons */}
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Tier Number Badge */}
        <div className="w-10 h-10 rounded-full bg-[#2F855A] text-white flex items-center justify-center font-bold">
          {index + 1}
        </div>

        {/* Tier Configuration */}
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tier Name</label>
              <Input
                type="text"
                value={tier.name || ''}
                onChange={(e) => onUpdate('name', e.target.value)}
                placeholder={`Tier ${index + 1}`}
                className="text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Hurdle Type</label>
              <select
                value={tier.hurdle_type || 'irr'}
                onChange={(e) => onUpdate('hurdle_type', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="none">No Hurdle (Base Split)</option>
                <option value="irr">IRR Hurdle</option>
                <option value="equity_multiple">Equity Multiple Hurdle</option>
                <option value="both">Both IRR & Multiple</option>
              </select>
            </div>
            {tier.hurdle_type === 'both' && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Logic</label>
                <select
                  value={tier.hurdle_logic || 'or'}
                  onChange={(e) => onUpdate('hurdle_logic', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="or">Either (OR)</option>
                  <option value="and">Both (AND)</option>
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-4">
            {(tier.hurdle_type === 'irr' || tier.hurdle_type === 'both') && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">IRR Hurdle</label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.5"
                    value={tier.irr_hurdle || ''}
                    onChange={(e) => onUpdate('irr_hurdle', parseFloat(e.target.value) || null)}
                    placeholder="12.0"
                    className="pr-8 text-sm"
                  />
                  <span className="absolute right-3 top-2 text-gray-400 text-sm">%</span>
                </div>
              </div>
            )}

            {(tier.hurdle_type === 'equity_multiple' || tier.hurdle_type === 'both') && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Multiple Hurdle</label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    value={tier.multiple_hurdle || ''}
                    onChange={(e) => onUpdate('multiple_hurdle', parseFloat(e.target.value) || null)}
                    placeholder="1.50"
                    className="pr-8 text-sm"
                  />
                  <span className="absolute right-3 top-2 text-gray-400 text-sm">x</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-500 mb-1">LP Share</label>
              <div className="relative">
                <Input
                  type="number"
                  step="5"
                  value={tier.lp_share || ''}
                  onChange={(e) => {
                    const lp = parseFloat(e.target.value) || 0;
                    onUpdate('lp_share', lp);
                    onUpdate('gp_share', 100 - lp);
                  }}
                  placeholder="80"
                  className="pr-8 text-sm"
                />
                <span className="absolute right-3 top-2 text-gray-400 text-sm">%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">GP Share (Promote)</label>
              <div className="relative">
                <Input
                  type="number"
                  step="5"
                  value={tier.gp_share || ''}
                  onChange={(e) => {
                    const gp = parseFloat(e.target.value) || 0;
                    onUpdate('gp_share', gp);
                    onUpdate('lp_share', 100 - gp);
                  }}
                  placeholder="20"
                  className="pr-8 text-sm"
                />
                <span className="absolute right-3 top-2 text-gray-400 text-sm">%</span>
              </div>
            </div>
          </div>

          <div>
            <Input
              type="text"
              value={tier.description || ''}
              onChange={(e) => onUpdate('description', e.target.value)}
              placeholder="Description (e.g., 'After 12% IRR, split changes to 70/30')"
              className="text-sm"
            />
          </div>
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

// Waterfall Visualization Component
function WaterfallVisualization({ preferredReturn, tiers, capitalStructure }) {
  const lpPercent = capitalStructure?.lp_equity_percent || 90;
  const gpPercent = capitalStructure?.gp_equity_percent || 10;

  const allSteps = [
    { name: 'Return of Capital', lp: lpPercent, gp: gpPercent, type: 'roc' },
    ...(preferredReturn?.enabled ? [{
      name: `Preferred Return (${preferredReturn.lp_pref_rate || 8}%)`,
      lp: lpPercent,
      gp: gpPercent,
      type: 'pref',
    }] : []),
    ...(preferredReturn?.catch_up_enabled ? [{
      name: 'GP Catch-Up',
      lp: 0,
      gp: 100,
      type: 'catchup',
    }] : []),
    ...tiers.map((tier) => ({
      name: tier.name,
      lp: tier.lp_share || 80,
      gp: tier.gp_share || 20,
      type: 'promote',
      hurdle: tier.irr_hurdle ? `${tier.irr_hurdle}% IRR` :
              tier.multiple_hurdle ? `${tier.multiple_hurdle}x` : '',
    })),
  ];

  return (
    <div className="space-y-2">
      {allSteps.map((step, index) => (
        <div key={index} className="flex items-center gap-4">
          <div className="w-40 text-sm text-gray-600 text-right">
            {step.name}
            {step.hurdle && (
              <span className="block text-xs text-gray-400">{step.hurdle}</span>
            )}
          </div>
          <div className="flex-1 flex h-8 rounded-lg overflow-hidden">
            <div
              className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${step.lp}%` }}
            >
              {step.lp > 10 && `LP ${step.lp}%`}
            </div>
            <div
              className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${step.gp}%` }}
            >
              {step.gp > 10 && `GP ${step.gp}%`}
            </div>
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500" />
          <span className="text-sm text-gray-600">LP (Limited Partner)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500" />
          <span className="text-sm text-gray-600">GP (General Partner / Sponsor)</span>
        </div>
      </div>
    </div>
  );
}
