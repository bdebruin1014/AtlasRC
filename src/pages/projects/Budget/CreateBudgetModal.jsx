// src/pages/projects/Budget/CreateBudgetModal.jsx
// Modal to create a new budget version from template and/or plan

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBudgetActions, useBudgetTemplatesForProject, usePlans, generateBudgetName } from '@/hooks/useBudget';
import PlanSelector from './PlanSelector';

const CreateBudgetModal = ({ open, onClose, projectId, project, existingCount, onCreated }) => {
  const { createFromTemplate, saving } = useBudgetActions(projectId);
  const { templates } = useBudgetTemplatesForProject(project?.project_type);
  const { plans } = usePlans(project?.project_type);

  const nextVersion = existingCount + 1;
  const defaultName = generateBudgetName(project?.name || 'Project', nextVersion);

  const [form, setForm] = useState({
    budget_name: defaultName,
    template_id: '',
    plan_id: '',
    is_active: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.budget_name) return;

    const selectedTemplate = templates.find(t => t.id === form.template_id);
    const selectedPlan = plans.find(p => p.id === form.plan_id);

    await createFromTemplate(
      {
        budget_name: form.budget_name,
        template_id: form.template_id || null,
        plan_id: form.plan_id || null,
        is_active: form.is_active,
      },
      selectedTemplate,
      selectedPlan
    );

    onCreated?.();
    // Reset form for next use
    setForm({
      budget_name: generateBudgetName(project?.name || 'Project', nextVersion + 1),
      template_id: '',
      plan_id: '',
      is_active: true,
    });
  };

  const usesPlan = !['lot_development'].includes(project?.project_type);

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2F855A] focus:border-transparent';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Budget</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Budget Name */}
            <div>
              <Label htmlFor="budget-name">Budget Name</Label>
              <Input
                id="budget-name"
                value={form.budget_name}
                onChange={(e) => setForm(prev => ({ ...prev, budget_name: e.target.value }))}
                placeholder="Enter budget name..."
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Auto-generated: {defaultName}
              </p>
            </div>

            {/* Template Selector */}
            <div>
              <Label>Budget Template</Label>
              <select
                value={form.template_id}
                onChange={(e) => setForm(prev => ({ ...prev, template_id: e.target.value }))}
                className={`mt-1 ${inputClass}`}
              >
                <option value="">No template (start blank)</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Template line items will be pre-populated in the budget.
              </p>
            </div>

            {/* Plan Selector */}
            {usesPlan && (
              <div>
                <Label>Building Plan</Label>
                <select
                  value={form.plan_id}
                  onChange={(e) => setForm(prev => ({ ...prev, plan_id: e.target.value }))}
                  className={`mt-1 ${inputClass}`}
                >
                  <option value="">No plan selected</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {p.square_footage} SF, {p.bedrooms}BR/{p.bathrooms}BA
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Plan cost breakdown will populate Hard Costs section.
                </p>
              </div>
            )}

            {/* Set as Active */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="set-active"
                checked={form.is_active}
                onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                className="rounded border-gray-300 text-[#2F855A] focus:ring-[#2F855A]"
              />
              <Label htmlFor="set-active" className="text-sm font-normal cursor-pointer">
                Set as active budget (used in Construction Budget view)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-[#2F855A] hover:bg-[#276749]" disabled={saving || !form.budget_name}>
              {saving ? 'Creating...' : 'Create Budget'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBudgetModal;
