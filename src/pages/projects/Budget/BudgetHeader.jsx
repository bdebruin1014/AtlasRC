// src/pages/projects/Budget/BudgetHeader.jsx
// Budget Record Header with project info, template/plan selectors

import React from 'react';
import { Star, Building2, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import PlanSelector from './PlanSelector';
import { useBudgetTemplatesForProject } from '@/hooks/useBudget';
import { updateBudget } from '@/services/budgetService';

const formatCurrency = (amount) => {
  if (!amount) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};

const LOT_BASED_TYPES = ['lot_purchase_btr', 'lot_purchase_for_sale', 'lot_development', 'btr'];

const BudgetHeader = ({ budget, project, onBudgetUpdated }) => {
  const { templates } = useBudgetTemplatesForProject(project?.project_type);
  const usesPlan = !['lot_development'].includes(project?.project_type);

  const handleTemplateChange = async (templateId) => {
    try {
      await updateBudget(budget.id, { template_id: templateId || null });
      onBudgetUpdated?.();
    } catch (err) {
      console.error('Error updating template:', err);
    }
  };

  const handlePlanChange = async (planId) => {
    try {
      await updateBudget(budget.id, { plan_id: planId || null });
      onBudgetUpdated?.();
    } catch (err) {
      console.error('Error updating plan:', err);
    }
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2F855A] focus:border-transparent';

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Budget Name & Status */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {budget.is_active && (
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          )}
          <div>
            <h2 className="text-lg font-bold text-gray-900">{budget.budget_name}</h2>
            <p className="text-xs text-gray-500">Version {budget.version_number}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn(
            "text-xs",
            budget.status === 'approved' ? 'border-green-300 text-green-700 bg-green-50' :
            budget.status === 'locked' ? 'border-gray-300 text-gray-600 bg-gray-50' :
            'border-blue-300 text-blue-700 bg-blue-50'
          )}>
            {budget.status?.charAt(0).toUpperCase() + budget.status?.slice(1)}
          </Badge>
          {budget.is_active && (
            <Badge className="bg-yellow-100 text-yellow-800 text-xs">Active</Badge>
          )}
        </div>
      </div>

      {/* Project Information */}
      <div className="p-4 border-b border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Project</p>
            <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-gray-400" />
              {project?.name || '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Address</p>
            <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              {project?.property_address || '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">City, State ZIP</p>
            <p className="text-sm font-medium text-gray-700">
              {project?.city}, {project?.state} {project?.zip_code}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Project Type</p>
            <p className="text-sm font-medium text-gray-700 capitalize">
              {project?.project_type?.replace(/_/g, ' ') || '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Template & Plan Selectors */}
      <div className="p-4 border-b border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget Template</label>
            <select
              value={budget.template_id || ''}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className={inputClass}
            >
              <option value="">Select template...</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          {usesPlan && (
            <PlanSelector
              value={budget.plan_id}
              projectType={project?.project_type}
              onChange={handlePlanChange}
            />
          )}
        </div>
      </div>

      {/* Purchase Price from Contract */}
      {project?.purchase_price > 0 && (
        <div className="p-4">
          <div className="p-3 border border-blue-200 bg-blue-50 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-medium">Purchase Price (from Contract)</p>
              <p className="text-xl font-bold text-blue-900">{formatCurrency(project.purchase_price)}</p>
            </div>
            {LOT_BASED_TYPES.includes(project?.project_type) && project?.lot_count > 1 && (
              <div className="text-right">
                <p className="text-sm text-blue-600 font-medium">
                  {formatCurrency(project.purchase_price / project.lot_count)} per Lot
                </p>
                <p className="text-xs text-blue-500">{project.lot_count} lots</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetHeader;
