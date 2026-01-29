// src/pages/accounting/BankRulesEnginePage.jsx
// Automatic Bank Transaction Categorization Rules

import React, { useState } from 'react';
import {
  Plus, Edit2, Trash2, Search, Settings, Play, Pause, Copy,
  ArrowRight, CheckCircle, AlertTriangle, Zap, Filter, MoreHorizontal,
  ChevronDown, ChevronRight, Save, X, RefreshCw, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const BankRulesEnginePage = () => {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [rules, setRules] = useState([
    {
      id: 'rule-1',
      name: 'Home Depot Purchases',
      status: 'active',
      priority: 1,
      conditions: [
        { field: 'description', operator: 'contains', value: 'HOME DEPOT' },
      ],
      actions: {
        category: '6300 - Repairs & Maintenance',
        vendor: 'Home Depot',
        memo: 'Construction materials',
        projectAllocation: 'current',
      },
      matchCount: 45,
      lastMatch: '2025-01-28',
      createdBy: 'John Smith',
    },
    {
      id: 'rule-2',
      name: 'Utility Payments',
      status: 'active',
      priority: 2,
      conditions: [
        { field: 'description', operator: 'contains', value: 'XCEL ENERGY' },
        { field: 'amount', operator: 'lessThan', value: 5000 },
      ],
      actions: {
        category: '6200 - Utilities',
        vendor: 'Xcel Energy',
        memo: 'Monthly utility bill',
      },
      matchCount: 24,
      lastMatch: '2025-01-25',
      createdBy: 'Sarah Johnson',
    },
    {
      id: 'rule-3',
      name: 'Insurance Payments',
      status: 'active',
      priority: 3,
      conditions: [
        { field: 'description', operator: 'contains', value: 'STATE FARM' },
      ],
      actions: {
        category: '6400 - Insurance',
        vendor: 'State Farm',
        memo: 'Insurance premium',
      },
      matchCount: 12,
      lastMatch: '2025-01-15',
      createdBy: 'John Smith',
    },
    {
      id: 'rule-4',
      name: 'Bank Fees',
      status: 'active',
      priority: 4,
      conditions: [
        { field: 'description', operator: 'contains', value: 'SERVICE CHARGE' },
        { field: 'amount', operator: 'lessThan', value: 100 },
      ],
      actions: {
        category: '6500 - Bank Charges',
        memo: 'Monthly service fee',
      },
      matchCount: 36,
      lastMatch: '2025-01-28',
      createdBy: 'System',
    },
    {
      id: 'rule-5',
      name: 'Lowes Purchases',
      status: 'paused',
      priority: 5,
      conditions: [
        { field: 'description', operator: 'contains', value: 'LOWES' },
      ],
      actions: {
        category: '6300 - Repairs & Maintenance',
        vendor: 'Lowes',
        memo: 'Construction supplies',
      },
      matchCount: 28,
      lastMatch: '2025-01-10',
      createdBy: 'John Smith',
    },
    {
      id: 'rule-6',
      name: 'Wire Transfers - Revenue',
      status: 'active',
      priority: 6,
      conditions: [
        { field: 'description', operator: 'contains', value: 'WIRE' },
        { field: 'amount', operator: 'greaterThan', value: 0 },
        { field: 'type', operator: 'equals', value: 'credit' },
      ],
      actions: {
        category: '4000 - Sales Revenue',
        memo: 'Incoming wire transfer',
        requiresReview: true,
      },
      matchCount: 18,
      lastMatch: '2025-01-27',
      createdBy: 'Sarah Johnson',
    },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    priority: 10,
    conditions: [{ field: 'description', operator: 'contains', value: '' }],
    actions: {
      category: '',
      vendor: '',
      memo: '',
      projectAllocation: '',
      requiresReview: false,
    },
  });

  const conditionFields = [
    { value: 'description', label: 'Description' },
    { value: 'amount', label: 'Amount' },
    { value: 'type', label: 'Transaction Type' },
    { value: 'reference', label: 'Reference Number' },
  ];

  const conditionOperators = {
    description: [
      { value: 'contains', label: 'Contains' },
      { value: 'startsWith', label: 'Starts With' },
      { value: 'endsWith', label: 'Ends With' },
      { value: 'equals', label: 'Equals' },
      { value: 'notContains', label: 'Does Not Contain' },
    ],
    amount: [
      { value: 'equals', label: 'Equals' },
      { value: 'greaterThan', label: 'Greater Than' },
      { value: 'lessThan', label: 'Less Than' },
      { value: 'between', label: 'Between' },
    ],
    type: [
      { value: 'equals', label: 'Equals' },
    ],
    reference: [
      { value: 'contains', label: 'Contains' },
      { value: 'startsWith', label: 'Starts With' },
    ],
  };

  const categories = [
    '4000 - Sales Revenue',
    '4100 - Service Revenue',
    '5000 - Cost of Goods Sold',
    '6000 - Operating Expenses',
    '6100 - Depreciation Expense',
    '6200 - Utilities',
    '6300 - Repairs & Maintenance',
    '6400 - Insurance',
    '6500 - Bank Charges',
    '6600 - Professional Fees',
  ];

  const filteredRules = rules.filter(rule =>
    rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.conditions.some(c => c.value.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenModal = (rule = null) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        name: rule.name,
        priority: rule.priority,
        conditions: [...rule.conditions],
        actions: { ...rule.actions },
      });
    } else {
      setEditingRule(null);
      setFormData({
        name: '',
        priority: rules.length + 1,
        conditions: [{ field: 'description', operator: 'contains', value: '' }],
        actions: {
          category: '',
          vendor: '',
          memo: '',
          projectAllocation: '',
          requiresReview: false,
        },
      });
    }
    setShowModal(true);
  };

  const handleAddCondition = () => {
    setFormData(prev => ({
      ...prev,
      conditions: [...prev.conditions, { field: 'description', operator: 'contains', value: '' }],
    }));
  };

  const handleRemoveCondition = (index) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index),
    }));
  };

  const handleConditionChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.map((cond, i) => {
        if (i !== index) return cond;
        if (field === 'field') {
          // Reset operator when field changes
          const newOps = conditionOperators[value] || conditionOperators.description;
          return { ...cond, field: value, operator: newOps[0].value };
        }
        return { ...cond, [field]: value };
      }),
    }));
  };

  const handleSave = () => {
    if (!formData.name || formData.conditions.some(c => !c.value)) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please fill in all required fields.' });
      return;
    }

    const rule = {
      id: editingRule?.id || `rule-${Date.now()}`,
      name: formData.name,
      status: editingRule?.status || 'active',
      priority: formData.priority,
      conditions: formData.conditions,
      actions: formData.actions,
      matchCount: editingRule?.matchCount || 0,
      lastMatch: editingRule?.lastMatch || null,
      createdBy: editingRule?.createdBy || 'Current User',
    };

    if (editingRule) {
      setRules(prev => prev.map(r => r.id === editingRule.id ? rule : r));
      toast({ title: 'Rule Updated', description: `${rule.name} has been updated.` });
    } else {
      setRules(prev => [rule, ...prev]);
      toast({ title: 'Rule Created', description: `${rule.name} has been created.` });
    }

    setShowModal(false);
  };

  const handleToggleStatus = (rule) => {
    setRules(prev => prev.map(r => {
      if (r.id !== rule.id) return r;
      return { ...r, status: r.status === 'active' ? 'paused' : 'active' };
    }));
  };

  const handleDelete = (rule) => {
    if (window.confirm(`Are you sure you want to delete the rule "${rule.name}"?`)) {
      setRules(prev => prev.filter(r => r.id !== rule.id));
      toast({ title: 'Rule Deleted', description: `${rule.name} has been deleted.` });
    }
  };

  const handleRunRules = () => {
    toast({ title: 'Rules Applied', description: 'Bank transaction rules have been applied to unmatched transactions.' });
  };

  const activeRules = rules.filter(r => r.status === 'active').length;
  const totalMatches = rules.reduce((sum, r) => sum + r.matchCount, 0);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            Bank Rules Engine
          </h1>
          <p className="text-sm text-gray-500">Automatically categorize bank transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRunRules}>
            <Play className="w-4 h-4 mr-1" />Run Rules Now
          </Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-1" />New Rule
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Rules</p>
              <p className="text-2xl font-bold">{rules.length}</p>
            </div>
            <Settings className="w-8 h-8 text-gray-300" />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Rules</p>
              <p className="text-2xl font-bold text-green-600">{activeRules}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-300" />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Matches</p>
              <p className="text-2xl font-bold text-blue-600">{totalMatches}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-300" />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">8</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-300" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border rounded-lg p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search rules..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {filteredRules.map((rule, index) => (
          <div
            key={rule.id}
            className={cn(
              "bg-white border rounded-lg overflow-hidden",
              rule.status === 'paused' && "opacity-60"
            )}
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded flex items-center justify-center text-sm font-bold",
                    rule.status === 'active' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  )}>
                    {rule.priority}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{rule.name}</h3>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-xs",
                        rule.status === 'active' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      )}>
                        {rule.status}
                      </span>
                    </div>

                    {/* Conditions */}
                    <div className="mt-2 space-y-1">
                      {rule.conditions.map((cond, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                          {idx > 0 && <span className="text-xs font-medium text-gray-400">AND</span>}
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{cond.field}</span>
                          <span className="text-gray-400">{cond.operator}</span>
                          <span className="font-medium">"{cond.value}"</span>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="mt-2 flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">
                        {rule.actions.category}
                      </span>
                      {rule.actions.vendor && (
                        <span className="text-xs text-gray-500">Vendor: {rule.actions.vendor}</span>
                      )}
                      {rule.actions.requiresReview && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">
                          Requires Review
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Matched {rule.matchCount} transactions</span>
                      {rule.lastMatch && <span>Last match: {rule.lastMatch}</span>}
                      <span>Created by {rule.createdBy}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(rule)}>
                    {rule.status === 'active' ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleOpenModal(rule)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(rule)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold text-lg">
                {editingRule ? 'Edit Rule' : 'New Bank Rule'}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Rule Name *</Label>
                  <Input
                    placeholder="e.g., Home Depot Purchases"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Priority</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">Lower number = higher priority</p>
                </div>
              </div>

              {/* Conditions */}
              <div>
                <Label className="mb-2 block">Conditions (ALL must match)</Label>
                <div className="space-y-2">
                  {formData.conditions.map((condition, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                      {index > 0 && (
                        <span className="text-xs font-medium text-gray-500 w-10">AND</span>
                      )}
                      <select
                        className="border rounded px-2 py-1.5 text-sm"
                        value={condition.field}
                        onChange={(e) => handleConditionChange(index, 'field', e.target.value)}
                      >
                        {conditionFields.map(f => (
                          <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                      </select>
                      <select
                        className="border rounded px-2 py-1.5 text-sm"
                        value={condition.operator}
                        onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
                      >
                        {(conditionOperators[condition.field] || conditionOperators.description).map(op => (
                          <option key={op.value} value={op.value}>{op.label}</option>
                        ))}
                      </select>
                      <Input
                        className="flex-1"
                        placeholder="Value..."
                        value={condition.value}
                        onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                      />
                      {formData.conditions.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveCondition(index)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="mt-2" onClick={handleAddCondition}>
                  <Plus className="w-4 h-4 mr-1" />Add Condition
                </Button>
              </div>

              {/* Actions */}
              <div>
                <Label className="mb-2 block">Actions (Apply when matched)</Label>
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Assign Category *</Label>
                      <select
                        className="w-full border rounded-md px-3 py-2"
                        value={formData.actions.category}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          actions: { ...prev.actions, category: e.target.value }
                        }))}
                      >
                        <option value="">Select category...</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Assign Vendor</Label>
                      <Input
                        placeholder="Optional vendor name"
                        value={formData.actions.vendor}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          actions: { ...prev.actions, vendor: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Default Memo</Label>
                    <Input
                      placeholder="Optional memo text"
                      value={formData.actions.memo}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        actions: { ...prev.actions, memo: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="requiresReview"
                      checked={formData.actions.requiresReview}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        actions: { ...prev.actions, requiresReview: e.target.checked }
                      }))}
                    />
                    <label htmlFor="requiresReview" className="text-sm">
                      Flag for manual review (don't auto-categorize)
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 sticky bottom-0">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleSave}>
                <Save className="w-4 h-4 mr-1" />
                {editingRule ? 'Update Rule' : 'Create Rule'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankRulesEnginePage;
