// src/pages/Admin/ProFormaTemplates/tabs/ReturnsTab.jsx
// Admin interface for configuring return metrics on pro forma templates

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, HelpCircle, RefreshCw } from 'lucide-react';

const DEFAULT_RETURN_METRICS = [
  // Project Level Metrics
  { metric_key: 'project_irr', name: 'Project IRR', category: 'project', display_format: 'percent', show_in_summary: true, decimal_places: 1 },
  { metric_key: 'unlevered_irr', name: 'Unlevered IRR', category: 'project', display_format: 'percent', show_in_summary: true, decimal_places: 1 },
  { metric_key: 'project_equity_multiple', name: 'Project Equity Multiple', category: 'project', display_format: 'multiple', show_in_summary: true, decimal_places: 2 },
  { metric_key: 'yield_on_cost', name: 'Yield on Cost', category: 'project', display_format: 'percent', show_in_summary: true, decimal_places: 2 },
  { metric_key: 'development_yield', name: 'Development Yield', category: 'project', display_format: 'percent', show_in_summary: false, decimal_places: 2 },
  { metric_key: 'development_spread', name: 'Development Spread', category: 'project', display_format: 'percent', show_in_summary: false, decimal_places: 2 },
  { metric_key: 'return_on_cost', name: 'Return on Cost', category: 'project', display_format: 'percent', show_in_summary: false, decimal_places: 1 },
  { metric_key: 'return_on_equity', name: 'Return on Equity', category: 'project', display_format: 'percent', show_in_summary: true, decimal_places: 1 },

  // LP Metrics
  { metric_key: 'lp_irr', name: 'LP IRR', category: 'lp', display_format: 'percent', show_in_summary: true, decimal_places: 1 },
  { metric_key: 'lp_equity_multiple', name: 'LP Equity Multiple', category: 'lp', display_format: 'multiple', show_in_summary: true, decimal_places: 2 },
  { metric_key: 'lp_cash_on_cash', name: 'LP Cash-on-Cash (Avg)', category: 'lp', display_format: 'percent', show_in_summary: false, decimal_places: 1 },
  { metric_key: 'lp_payback_months', name: 'LP Payback Period', category: 'lp', display_format: 'number', show_in_summary: false, decimal_places: 0 },

  // GP Metrics
  { metric_key: 'gp_irr', name: 'GP IRR', category: 'gp', display_format: 'percent', show_in_summary: true, decimal_places: 1 },
  { metric_key: 'gp_equity_multiple', name: 'GP Equity Multiple', category: 'gp', display_format: 'multiple', show_in_summary: true, decimal_places: 2 },
  { metric_key: 'gp_promote_earned', name: 'GP Promote Earned', category: 'gp', display_format: 'currency', show_in_summary: true, decimal_places: 0 },

  // Deal Metrics
  { metric_key: 'gross_profit', name: 'Gross Profit', category: 'deal', display_format: 'currency', show_in_summary: true, decimal_places: 0 },
  { metric_key: 'gross_margin', name: 'Gross Margin', category: 'deal', display_format: 'percent', show_in_summary: true, decimal_places: 1 },
  { metric_key: 'net_profit', name: 'Net Profit', category: 'deal', display_format: 'currency', show_in_summary: true, decimal_places: 0 },
  { metric_key: 'net_margin', name: 'Net Margin', category: 'deal', display_format: 'percent', show_in_summary: false, decimal_places: 1 },
];

const BTR_ADDITIONAL_METRICS = [
  { metric_key: 'stabilized_noi', name: 'Stabilized NOI', category: 'project', display_format: 'currency', show_in_summary: true, decimal_places: 0 },
  { metric_key: 'exit_cap_rate', name: 'Exit Cap Rate', category: 'project', display_format: 'percent', show_in_summary: true, decimal_places: 2 },
  { metric_key: 'going_in_cap', name: 'Going-In Cap Rate', category: 'project', display_format: 'percent', show_in_summary: false, decimal_places: 2 },
];

const METRIC_CATEGORIES = [
  { key: 'project', label: 'Project Level', description: 'Overall project performance metrics', color: 'blue' },
  { key: 'lp', label: 'LP Returns', description: 'Limited partner return metrics', color: 'indigo' },
  { key: 'gp', label: 'GP Returns', description: 'General partner / sponsor return metrics', color: 'emerald' },
  { key: 'deal', label: 'Deal Metrics', description: 'Profit and margin metrics', color: 'amber' },
];

const FORMAT_OPTIONS = [
  { value: 'percent', label: 'Percentage (%)' },
  { value: 'multiple', label: 'Multiple (x)' },
  { value: 'currency', label: 'Currency ($)' },
  { value: 'number', label: 'Number' },
];

const FORMULA_REFERENCE = [
  { key: 'Project IRR', formula: 'IRR of total project cash flows (levered)' },
  { key: 'Unlevered IRR', formula: 'IRR without debt (property-level)' },
  { key: 'Yield on Cost', formula: 'Stabilized NOI ÷ Total Development Cost' },
  { key: 'Development Spread', formula: 'Development Yield - Exit Cap Rate' },
  { key: 'LP IRR', formula: 'IRR of LP cash flows after waterfall' },
  { key: 'LP Equity Multiple', formula: 'Total LP Distributions ÷ LP Equity Invested' },
  { key: 'GP Promote', formula: 'GP distributions above pro-rata share' },
  { key: 'Gross Margin', formula: 'Gross Profit ÷ Total Revenue' },
];

export default function ReturnsTab({ metrics, configuration, onChange }) {
  const [showFormulas, setShowFormulas] = useState(false);
  const returnMetrics = metrics || [];

  const updateMetrics = (newMetrics) => {
    onChange(newMetrics);
  };

  const applyDefaults = () => {
    let defaults = [...DEFAULT_RETURN_METRICS];

    // Add BTR-specific metrics if applicable
    if (configuration?.include_operating_proforma || configuration?.template_type === 'build_to_rent') {
      defaults = [...defaults, ...BTR_ADDITIONAL_METRICS];
    }

    updateMetrics(defaults.map((m, i) => ({
      ...m,
      id: `metric-${Date.now()}-${i}`,
      sort_order: i,
      show_in_waterfall: m.category === 'lp' || m.category === 'gp',
    })));
  };

  const addCustomMetric = () => {
    const newMetric = {
      id: `metric-${Date.now()}`,
      metric_key: '',
      name: 'New Metric',
      category: 'deal',
      display_format: 'percent',
      decimal_places: 2,
      show_in_summary: false,
      show_in_waterfall: false,
      sort_order: returnMetrics.length,
    };
    updateMetrics([...returnMetrics, newMetric]);
  };

  const updateMetric = (index, field, value) => {
    const updated = [...returnMetrics];
    updated[index] = { ...updated[index], [field]: value };
    updateMetrics(updated);
  };

  const removeMetric = (index) => {
    const updated = returnMetrics.filter((_, i) => i !== index);
    updateMetrics(updated);
  };

  // Group metrics by category
  const metricsByCategory = METRIC_CATEGORIES.map((cat) => ({
    ...cat,
    metrics: returnMetrics
      .map((m, idx) => ({ ...m, globalIndex: idx }))
      .filter((m) => m.category === cat.key),
  }));

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Return Metrics</h3>
          <p className="text-sm text-gray-500">
            Configure which return metrics to calculate and display
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={applyDefaults}
            className="text-sm"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Load Defaults
          </Button>
          <Button
            type="button"
            onClick={addCustomMetric}
            className="bg-[#2F855A] hover:bg-[#276749] text-white text-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Custom Metric
          </Button>
        </div>
      </div>

      {/* Metrics by Category */}
      {metricsByCategory.map((category) => (
        <div key={category.key} className="bg-white rounded-lg shadow">
          <div className={`px-4 py-3 border-b bg-${category.color}-50`}>
            <h4 className="font-semibold text-gray-900">{category.label}</h4>
            <p className="text-sm text-gray-500">{category.description}</p>
          </div>

          {category.metrics.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No metrics in this category
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-gray-500 border-b bg-gray-50">
                    <th className="px-4 py-2 text-left font-medium">Metric Name</th>
                    <th className="px-4 py-2 text-left font-medium">Key</th>
                    <th className="px-4 py-2 text-left font-medium">Format</th>
                    <th className="px-4 py-2 text-center font-medium">Decimals</th>
                    <th className="px-4 py-2 text-center font-medium">In Summary</th>
                    <th className="px-4 py-2 text-center font-medium">In Waterfall</th>
                    <th className="px-4 py-2 text-center font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {category.metrics.map((metric) => (
                    <tr key={metric.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <Input
                          type="text"
                          value={metric.name || ''}
                          onChange={(e) => updateMetric(metric.globalIndex, 'name', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input
                          type="text"
                          value={metric.metric_key || ''}
                          onChange={(e) => updateMetric(metric.globalIndex, 'metric_key', e.target.value)}
                          className="h-8 text-sm font-mono text-xs"
                          placeholder="metric_key"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={metric.display_format || 'percent'}
                          onChange={(e) => updateMetric(metric.globalIndex, 'display_format', e.target.value)}
                          className="px-2 py-1 h-8 border rounded text-sm"
                        >
                          {FORMAT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Input
                          type="number"
                          value={metric.decimal_places ?? 2}
                          onChange={(e) => updateMetric(metric.globalIndex, 'decimal_places', parseInt(e.target.value) || 0)}
                          className="w-16 h-8 text-sm text-center"
                          min={0}
                          max={4}
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={metric.show_in_summary || false}
                          onChange={(e) => updateMetric(metric.globalIndex, 'show_in_summary', e.target.checked)}
                          className="rounded text-green-600"
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={metric.show_in_waterfall || false}
                          onChange={(e) => updateMetric(metric.globalIndex, 'show_in_waterfall', e.target.checked)}
                          className="rounded text-green-600"
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeMetric(metric.globalIndex)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      {/* Formula Reference */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-blue-900 flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Return Metric Formulas
          </h4>
          <button
            type="button"
            onClick={() => setShowFormulas(!showFormulas)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showFormulas ? 'Hide' : 'Show'} formulas
          </button>
        </div>

        {showFormulas && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {FORMULA_REFERENCE.map((item) => (
              <div key={item.key}>
                <p className="font-mono text-blue-800">{item.key}</p>
                <p className="text-blue-600">{item.formula}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Configuration Summary</h4>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-2xl font-bold text-gray-900">{returnMetrics.length}</div>
            <div className="text-xs text-gray-500">Total Metrics</div>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-2xl font-bold text-blue-600">
              {returnMetrics.filter((m) => m.show_in_summary).length}
            </div>
            <div className="text-xs text-gray-500">In Summary</div>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-2xl font-bold text-emerald-600">
              {returnMetrics.filter((m) => m.show_in_waterfall).length}
            </div>
            <div className="text-xs text-gray-500">In Waterfall</div>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-2xl font-bold text-amber-600">
              {METRIC_CATEGORIES.filter((c) =>
                returnMetrics.some((m) => m.category === c.key)
              ).length}
            </div>
            <div className="text-xs text-gray-500">Categories Used</div>
          </div>
        </div>
      </div>
    </div>
  );
}
