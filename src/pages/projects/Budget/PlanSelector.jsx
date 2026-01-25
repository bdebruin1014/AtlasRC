// src/pages/projects/Budget/PlanSelector.jsx
// Plan selector dropdown with plan details preview

import React, { useState } from 'react';
import { Home, Maximize2 } from 'lucide-react';
import { usePlans } from '@/hooks/useBudget';

const formatCurrency = (amount) => {
  if (!amount) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};

const PlanSelector = ({ value, projectType, onChange }) => {
  const { plans, loading } = usePlans(projectType);
  const [showDetails, setShowDetails] = useState(false);

  const selectedPlan = plans.find(p => p.id === value);

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2F855A] focus:border-transparent';

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        disabled={loading}
      >
        <option value="">Select plan...</option>
        {plans.map(plan => (
          <option key={plan.id} value={plan.id}>
            {plan.name} - {plan.square_footage} SF, {plan.bedrooms}BR/{plan.bathrooms}BA
          </option>
        ))}
      </select>

      {/* Plan Details Preview */}
      {selectedPlan && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-[#2F855A]" />
              <span className="text-sm font-semibold text-gray-800">{selectedPlan.name}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-[#2F855A] hover:underline"
            >
              {showDetails ? 'Hide details' : 'Show details'}
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-gray-500">SF:</span>{' '}
              <span className="font-medium">{selectedPlan.square_footage?.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-500">Bed/Bath:</span>{' '}
              <span className="font-medium">{selectedPlan.bedrooms}/{selectedPlan.bathrooms}</span>
            </div>
            <div>
              <span className="text-gray-500">Stories:</span>{' '}
              <span className="font-medium">{selectedPlan.stories}</span>
            </div>
            <div>
              <span className="text-gray-500">Base Cost:</span>{' '}
              <span className="font-medium">{formatCurrency(selectedPlan.base_cost)}</span>
            </div>
          </div>

          {showDetails && selectedPlan.cost_breakdown && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-2">Cost Breakdown:</p>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {Object.entries(selectedPlan.cost_breakdown).map(([key, val]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="font-mono">{formatCurrency(val)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between text-xs font-semibold">
                <span>Total</span>
                <span>{formatCurrency(Object.values(selectedPlan.cost_breakdown).reduce((s, v) => s + v, 0))}</span>
              </div>
            </div>
          )}

          {selectedPlan.description && (
            <p className="text-xs text-gray-500 mt-2">{selectedPlan.description}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PlanSelector;
