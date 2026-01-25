// src/pages/projects/ProForma/AddLineItemModal.jsx
// Modal for adding custom line items to pro forma sections

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CALCULATION_TYPES = [
  { value: 'input', label: 'Manual Input' },
  { value: 'calculated', label: 'Formula (Calculated)' },
  { value: 'from_budget', label: 'Pull from Budget' },
  { value: 'percentage', label: 'Percentage of Another Field' },
  { value: 'per_unit', label: 'Per Unit Calculation' },
  { value: 'per_sf', label: 'Per Square Foot Calculation' },
];

const DISPLAY_FORMATS = [
  { value: 'currency', label: 'Currency ($)' },
  { value: 'percent', label: 'Percentage (%)' },
  { value: 'number', label: 'Number' },
];

const PERCENTAGE_OF_OPTIONS = [
  { value: 'total_hard_costs', label: 'Total Hard Costs' },
  { value: 'total_soft_costs', label: 'Total Soft Costs' },
  { value: 'total_project_cost', label: 'Total Project Cost' },
  { value: 'sale_price', label: 'Sale Price' },
  { value: 'gross_revenue', label: 'Gross Revenue' },
];

const SECTION_LABELS = {
  uses_of_funds: 'Uses of Funds',
  sources_of_funds: 'Sources of Funds',
  revenue: 'Revenue',
  operating_expenses: 'Operating Expenses',
};

const DEFAULT_FORM = {
  name: '',
  description: '',
  category_name: '',
  new_category_name: '',
  is_new_category: false,
  calculation_type: 'input',
  calculation_formula: '',
  source_field: '',
  percentage_of_field: '',
  percentage_rate: '',
  default_value: '',
  display_format: 'currency',
  show_per_unit: false,
  show_per_sf: false,
  include_in_totals: true,
  is_required: false,
};

export default function AddLineItemModal({
  open,
  onClose,
  section,
  category,
  existingCategories = [],
  onAdd,
}) {
  const [form, setForm] = useState({ ...DEFAULT_FORM, category_name: category || '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm({ ...DEFAULT_FORM, category_name: category || '' });
      setErrors({});
    }
  }, [open, category]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Line item name is required';
    if (!form.is_new_category && !form.category_name) errs.category_name = 'Select a category';
    if (form.is_new_category && !form.new_category_name.trim()) errs.new_category_name = 'Enter category name';
    if (form.calculation_type === 'calculated' && !form.calculation_formula.trim()) {
      errs.calculation_formula = 'Formula is required';
    }
    if (form.calculation_type === 'percentage' && !form.percentage_of_field) {
      errs.percentage_of_field = 'Select a field';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onAdd({
      name: form.name.trim(),
      description: form.description.trim(),
      section,
      category_name: form.is_new_category ? form.new_category_name.trim() : form.category_name,
      calculation_type: form.calculation_type,
      calculation_formula: form.calculation_type === 'calculated' ? form.calculation_formula : null,
      source_field: form.calculation_type === 'from_budget' ? form.source_field : null,
      percentage_of_field: form.calculation_type === 'percentage' ? form.percentage_of_field : null,
      percentage_rate: form.calculation_type === 'percentage' ? parseFloat(form.percentage_rate) || 0 : null,
      default_value: form.default_value ? parseFloat(form.default_value) : 0,
      display_format: form.display_format,
      show_per_unit: form.show_per_unit,
      show_per_sf: form.show_per_sf,
      include_in_totals: form.include_in_totals,
      is_required: form.is_required,
      is_custom: true,
      is_editable: true,
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Line Item to {SECTION_LABELS[section] || section}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Category Selection */}
          <div>
            <Label className="mb-1">Category</Label>
            <div className="flex items-center gap-4 mb-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={!form.is_new_category}
                  onChange={() => handleChange('is_new_category', false)}
                />
                Existing Category
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={form.is_new_category}
                  onChange={() => handleChange('is_new_category', true)}
                />
                New Category
              </label>
            </div>

            {!form.is_new_category ? (
              <div>
                <select
                  value={form.category_name}
                  onChange={(e) => handleChange('category_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Select category...</option>
                  {existingCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category_name && <p className="text-xs text-red-500 mt-1">{errors.category_name}</p>}
              </div>
            ) : (
              <div>
                <Input
                  value={form.new_category_name}
                  onChange={(e) => handleChange('new_category_name', e.target.value)}
                  placeholder="Enter new category name"
                />
                {errors.new_category_name && <p className="text-xs text-red-500 mt-1">{errors.new_category_name}</p>}
              </div>
            )}
          </div>

          {/* Line Item Name */}
          <div>
            <Label className="mb-1">Line Item Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Architectural Fees"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <Label className="mb-1">Description</Label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
              rows={2}
              placeholder="Optional description"
            />
          </div>

          {/* Calculation Type */}
          <div>
            <Label className="mb-1">Calculation Type</Label>
            <select
              value={form.calculation_type}
              onChange={(e) => handleChange('calculation_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {CALCULATION_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Conditional fields based on calculation type */}
          {form.calculation_type === 'calculated' && (
            <div>
              <Label className="mb-1">Formula</Label>
              <Input
                value={form.calculation_formula}
                onChange={(e) => handleChange('calculation_formula', e.target.value)}
                placeholder="e.g., hard_costs * 0.05"
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use field names from other line items. Operators: +, -, *, /, ()
              </p>
              {errors.calculation_formula && <p className="text-xs text-red-500 mt-1">{errors.calculation_formula}</p>}
            </div>
          )}

          {form.calculation_type === 'from_budget' && (
            <div>
              <Label className="mb-1">Budget Line Item</Label>
              <select
                value={form.source_field}
                onChange={(e) => handleChange('source_field', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Select budget line item...</option>
              </select>
            </div>
          )}

          {form.calculation_type === 'percentage' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1">Percentage Of</Label>
                <select
                  value={form.percentage_of_field}
                  onChange={(e) => handleChange('percentage_of_field', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Select field...</option>
                  {PERCENTAGE_OF_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {errors.percentage_of_field && <p className="text-xs text-red-500 mt-1">{errors.percentage_of_field}</p>}
              </div>
              <div>
                <Label className="mb-1">Percentage Rate</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.percentage_rate}
                    onChange={(e) => handleChange('percentage_rate', e.target.value)}
                    placeholder="5.00"
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
                </div>
              </div>
            </div>
          )}

          {(form.calculation_type === 'per_unit' || form.calculation_type === 'per_sf') && (
            <div>
              <Label className="mb-1">
                Rate {form.calculation_type === 'per_unit' ? 'Per Unit' : 'Per SF'}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
                <Input
                  type="number"
                  step="0.01"
                  value={form.default_value}
                  onChange={(e) => handleChange('default_value', e.target.value)}
                  placeholder="0.00"
                  className="pl-8"
                />
              </div>
            </div>
          )}

          {form.calculation_type === 'input' && (
            <div>
              <Label className="mb-1">Default Value</Label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
                <Input
                  type="number"
                  step="0.01"
                  value={form.default_value}
                  onChange={(e) => handleChange('default_value', e.target.value)}
                  placeholder="0.00"
                  className="pl-8"
                />
              </div>
            </div>
          )}

          {/* Display Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1">Display Format</Label>
              <select
                value={form.display_format}
                onChange={(e) => handleChange('display_format', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {DISPLAY_FORMATS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col justify-end space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.show_per_unit}
                  onChange={(e) => handleChange('show_per_unit', e.target.checked)}
                />
                Show per unit
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.show_per_sf}
                  onChange={(e) => handleChange('show_per_sf', e.target.checked)}
                />
                Show per SF
              </label>
            </div>
          </div>

          {/* Behavior Options */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.include_in_totals}
                onChange={(e) => handleChange('include_in_totals', e.target.checked)}
              />
              Include in category totals
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_required}
                onChange={(e) => handleChange('is_required', e.target.checked)}
              />
              Required field
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-[#2F855A] hover:bg-[#276749] text-white">
              Add Line Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
