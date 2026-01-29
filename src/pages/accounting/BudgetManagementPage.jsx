// src/pages/accounting/BudgetManagementPage.jsx
// Budget Creation and Management for Entities

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus, Edit2, Trash2, Copy, Download, Upload, Save, X, ChevronDown, ChevronRight,
  DollarSign, TrendingUp, TrendingDown, Calendar, AlertTriangle, CheckCircle,
  FileSpreadsheet, BarChart3, Target, Percent
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { cn, formatCurrency } from '@/lib/utils';

const BudgetManagementPage = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [budgets, setBudgets] = useState([
    {
      id: 'budget-1',
      name: '2025 Operating Budget',
      fiscalYear: 2025,
      status: 'active',
      type: 'operating',
      totalBudget: 2450000,
      totalActual: 1850000,
      variance: 600000,
      variancePercent: 24.5,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      createdBy: 'John Smith',
      createdAt: '2024-11-15',
      lastModified: '2025-01-20',
    },
    {
      id: 'budget-2',
      name: '2024 Operating Budget',
      fiscalYear: 2024,
      status: 'closed',
      type: 'operating',
      totalBudget: 2200000,
      totalActual: 2150000,
      variance: 50000,
      variancePercent: 2.3,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      createdBy: 'John Smith',
      createdAt: '2023-11-10',
      lastModified: '2024-12-31',
    },
    {
      id: 'budget-3',
      name: 'Q1 2025 Project Budget',
      fiscalYear: 2025,
      status: 'draft',
      type: 'project',
      totalBudget: 850000,
      totalActual: 0,
      variance: 850000,
      variancePercent: 100,
      startDate: '2025-01-01',
      endDate: '2025-03-31',
      createdBy: 'Sarah Johnson',
      createdAt: '2025-01-05',
      lastModified: '2025-01-18',
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  const [newBudget, setNewBudget] = useState({
    name: '',
    fiscalYear: new Date().getFullYear(),
    type: 'operating',
    startDate: '',
    endDate: '',
    copyFrom: '',
  });

  const [budgetCategories, setBudgetCategories] = useState([
    {
      id: 'cat-1',
      name: 'Revenue',
      type: 'income',
      expanded: true,
      items: [
        { id: 'item-1', account: '4000 - Sales Revenue', jan: 200000, feb: 210000, mar: 225000, apr: 215000, may: 230000, jun: 240000, jul: 235000, aug: 245000, sep: 250000, oct: 240000, nov: 235000, dec: 275000 },
        { id: 'item-2', account: '4100 - Service Revenue', jan: 25000, feb: 25000, mar: 27000, apr: 26000, may: 28000, jun: 30000, jul: 29000, aug: 31000, sep: 32000, oct: 30000, nov: 28000, dec: 35000 },
        { id: 'item-3', account: '4200 - Management Fees', jan: 15000, feb: 15000, mar: 15000, apr: 15000, may: 15000, jun: 15000, jul: 15000, aug: 15000, sep: 15000, oct: 15000, nov: 15000, dec: 15000 },
      ],
    },
    {
      id: 'cat-2',
      name: 'Cost of Goods Sold',
      type: 'expense',
      expanded: true,
      items: [
        { id: 'item-4', account: '5000 - Direct Labor', jan: 80000, feb: 82000, mar: 85000, apr: 83000, may: 87000, jun: 90000, jul: 88000, aug: 92000, sep: 95000, oct: 90000, nov: 88000, dec: 100000 },
        { id: 'item-5', account: '5100 - Materials', jan: 45000, feb: 47000, mar: 50000, apr: 48000, may: 52000, jun: 55000, jul: 53000, aug: 57000, sep: 60000, oct: 55000, nov: 52000, dec: 65000 },
      ],
    },
    {
      id: 'cat-3',
      name: 'Operating Expenses',
      type: 'expense',
      expanded: false,
      items: [
        { id: 'item-6', account: '6000 - Salaries & Wages', jan: 50000, feb: 50000, mar: 52000, apr: 52000, may: 52000, jun: 55000, jul: 55000, aug: 55000, sep: 55000, oct: 55000, nov: 55000, dec: 60000 },
        { id: 'item-7', account: '6100 - Rent', jan: 15000, feb: 15000, mar: 15000, apr: 15000, may: 15000, jun: 15000, jul: 15000, aug: 15000, sep: 15000, oct: 15000, nov: 15000, dec: 15000 },
        { id: 'item-8', account: '6200 - Utilities', jan: 3500, feb: 3200, mar: 2800, apr: 2500, may: 2800, jun: 3500, jul: 4000, aug: 4200, sep: 3800, oct: 3200, nov: 3000, dec: 3500 },
        { id: 'item-9', account: '6300 - Insurance', jan: 8000, feb: 8000, mar: 8000, apr: 8000, may: 8000, jun: 8000, jul: 8000, aug: 8000, sep: 8000, oct: 8000, nov: 8000, dec: 8000 },
        { id: 'item-10', account: '6400 - Professional Fees', jan: 5000, feb: 5000, mar: 7500, apr: 5000, may: 5000, jun: 5000, jul: 5000, aug: 5000, sep: 7500, oct: 5000, nov: 5000, dec: 10000 },
      ],
    },
  ]);

  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const toggleCategory = (catId) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const calculateCategoryTotal = (category, month) => {
    return category.items.reduce((sum, item) => sum + (item[month] || 0), 0);
  };

  const calculateYearTotal = (item) => {
    return months.reduce((sum, month) => sum + (item[month] || 0), 0);
  };

  const handleCreateBudget = () => {
    const budget = {
      id: `budget-${Date.now()}`,
      name: newBudget.name,
      fiscalYear: newBudget.fiscalYear,
      status: 'draft',
      type: newBudget.type,
      totalBudget: 0,
      totalActual: 0,
      variance: 0,
      variancePercent: 0,
      startDate: newBudget.startDate,
      endDate: newBudget.endDate,
      createdBy: 'Current User',
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
    };
    setBudgets(prev => [budget, ...prev]);
    setShowCreateModal(false);
    setNewBudget({ name: '', fiscalYear: new Date().getFullYear(), type: 'operating', startDate: '', endDate: '', copyFrom: '' });
    toast({ title: 'Budget Created', description: `${budget.name} has been created as a draft.` });
  };

  const handleItemChange = (catId, itemId, month, value) => {
    setBudgetCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        items: cat.items.map(item => {
          if (item.id !== itemId) return item;
          return { ...item, [month]: parseFloat(value) || 0 };
        }),
      };
    }));
  };

  const handleAddLineItem = (catId) => {
    setBudgetCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      const newItem = {
        id: `item-${Date.now()}`,
        account: '',
        ...Object.fromEntries(months.map(m => [m, 0])),
      };
      return { ...cat, items: [...cat.items, newItem] };
    }));
  };

  const activeBudget = budgets.find(b => b.status === 'active');

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-600" />
              Budget Management
            </h1>
            <p className="text-sm text-gray-500">Create and manage entity budgets</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-1" />Import
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />Export
            </Button>
            <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-1" />New Budget
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Active Budget</p>
                <p className="text-lg font-bold text-blue-700">{activeBudget?.name || 'None'}</p>
              </div>
              <FileSpreadsheet className="w-8 h-8 text-blue-300" />
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Budget</p>
                <p className="text-lg font-bold text-green-700">{formatCurrency(activeBudget?.totalBudget || 0)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-300" />
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">YTD Actual</p>
                <p className="text-lg font-bold text-purple-700">{formatCurrency(activeBudget?.totalActual || 0)}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-300" />
            </div>
          </div>
          <div className={cn("rounded-lg p-3", (activeBudget?.variance || 0) >= 0 ? "bg-emerald-50" : "bg-red-50")}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Variance</p>
                <p className={cn("text-lg font-bold", (activeBudget?.variance || 0) >= 0 ? "text-emerald-700" : "text-red-700")}>
                  {formatCurrency(Math.abs(activeBudget?.variance || 0))}
                  <span className="text-sm ml-1">({activeBudget?.variancePercent || 0}%)</span>
                </p>
              </div>
              {(activeBudget?.variance || 0) >= 0 ? (
                <TrendingUp className="w-8 h-8 text-emerald-300" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-300" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Budget List */}
      <div className="p-4">
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Budget Name</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Period</th>
                <th className="text-right px-4 py-3 font-medium">Budget</th>
                <th className="text-right px-4 py-3 font-medium">Actual</th>
                <th className="text-right px-4 py-3 font-medium">Variance</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
                <th className="text-center px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {budgets.map((budget) => (
                <tr key={budget.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{budget.name}</p>
                    <p className="text-xs text-gray-500">Created {budget.createdAt}</p>
                  </td>
                  <td className="px-4 py-3 capitalize">{budget.type}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs">{budget.startDate} - {budget.endDate}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(budget.totalBudget)}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(budget.totalActual)}</td>
                  <td className={cn("px-4 py-3 text-right font-medium", budget.variance >= 0 ? "text-green-600" : "text-red-600")}>
                    {budget.variance >= 0 ? '+' : '-'}{formatCurrency(Math.abs(budget.variance))}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(budget.status))}>
                      {budget.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedBudget(budget); setShowEditModal(true); }}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Budget Detail/Edit Modal */}
      {showEditModal && selectedBudget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="font-semibold text-lg">{selectedBudget.name}</h3>
                <p className="text-sm text-gray-500">{selectedBudget.startDate} - {selectedBudget.endDate}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(selectedBudget.status))}>
                  {selectedBudget.status}
                </span>
                <Button variant="ghost" size="sm" onClick={() => setShowEditModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {/* Budget Grid */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium border min-w-[250px]">Account</th>
                      {monthLabels.map((month, idx) => (
                        <th key={month} className="text-right px-3 py-2 font-medium border min-w-[100px]">{month}</th>
                      ))}
                      <th className="text-right px-3 py-2 font-medium border min-w-[120px] bg-blue-50">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgetCategories.map((category) => (
                      <React.Fragment key={category.id}>
                        {/* Category Header */}
                        <tr className="bg-gray-100">
                          <td
                            className="px-3 py-2 font-semibold border cursor-pointer"
                            onClick={() => toggleCategory(category.id)}
                          >
                            <div className="flex items-center gap-2">
                              {expandedCategories[category.id] !== false ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                              {category.name}
                            </div>
                          </td>
                          {months.map((month) => (
                            <td key={month} className="text-right px-3 py-2 border font-semibold">
                              {formatCurrency(calculateCategoryTotal(category, month))}
                            </td>
                          ))}
                          <td className="text-right px-3 py-2 border font-semibold bg-blue-50">
                            {formatCurrency(category.items.reduce((sum, item) => sum + calculateYearTotal(item), 0))}
                          </td>
                        </tr>

                        {/* Category Items */}
                        {expandedCategories[category.id] !== false && category.items.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-3 py-1 border">
                              <Input
                                value={item.account}
                                className="border-0 h-8 text-sm"
                                placeholder="Select account..."
                                onChange={(e) => {
                                  setBudgetCategories(prev => prev.map(cat => ({
                                    ...cat,
                                    items: cat.items.map(i => i.id === item.id ? { ...i, account: e.target.value } : i)
                                  })));
                                }}
                              />
                            </td>
                            {months.map((month) => (
                              <td key={month} className="px-1 py-1 border">
                                <Input
                                  type="number"
                                  value={item[month] || ''}
                                  onChange={(e) => handleItemChange(category.id, item.id, month, e.target.value)}
                                  className="border-0 h-8 text-right text-sm"
                                />
                              </td>
                            ))}
                            <td className="text-right px-3 py-1 border font-medium bg-blue-50">
                              {formatCurrency(calculateYearTotal(item))}
                            </td>
                          </tr>
                        ))}

                        {/* Add Line Button */}
                        {expandedCategories[category.id] !== false && (
                          <tr>
                            <td colSpan={14} className="px-3 py-1 border">
                              <Button variant="ghost" size="sm" onClick={() => handleAddLineItem(category.id)}>
                                <Plus className="w-4 h-4 mr-1" />Add Line Item
                              </Button>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
              <div className="text-sm text-gray-500">
                Last modified: {selectedBudget.lastModified} by {selectedBudget.createdBy}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                {selectedBudget.status === 'draft' && (
                  <Button variant="outline" className="text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />Activate Budget
                  </Button>
                )}
                <Button className="bg-[#047857] hover:bg-[#065f46]">
                  <Save className="w-4 h-4 mr-1" />Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Budget Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">Create New Budget</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label>Budget Name *</Label>
                <Input
                  placeholder="e.g., 2025 Operating Budget"
                  value={newBudget.name}
                  onChange={(e) => setNewBudget(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fiscal Year *</Label>
                  <select
                    className="w-full border rounded-md px-3 py-2"
                    value={newBudget.fiscalYear}
                    onChange={(e) => setNewBudget(prev => ({ ...prev, fiscalYear: parseInt(e.target.value) }))}
                  >
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                  </select>
                </div>
                <div>
                  <Label>Budget Type *</Label>
                  <select
                    className="w-full border rounded-md px-3 py-2"
                    value={newBudget.type}
                    onChange={(e) => setNewBudget(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="operating">Operating</option>
                    <option value="capital">Capital</option>
                    <option value="project">Project</option>
                    <option value="departmental">Departmental</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={newBudget.startDate}
                    onChange={(e) => setNewBudget(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>End Date *</Label>
                  <Input
                    type="date"
                    value={newBudget.endDate}
                    onChange={(e) => setNewBudget(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label>Copy From (Optional)</Label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={newBudget.copyFrom}
                  onChange={(e) => setNewBudget(prev => ({ ...prev, copyFrom: e.target.value }))}
                >
                  <option value="">Start from scratch</option>
                  {budgets.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleCreateBudget}>
                Create Budget
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetManagementPage;
