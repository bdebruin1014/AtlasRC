import React, { useState } from 'react';
import { Plus, Search, Edit2, X, DollarSign, Download, Upload, ChevronDown, ChevronRight, Trash2, Copy, Lock, Unlock, Save, History, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const BudgetPage = ({ projectId }) => {
  const [showLineItemModal, setShowLineItemModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(['land', 'hard-costs', 'soft-costs', 'financing']);
  const [editMode, setEditMode] = useState(false);

  const [budgetVersion, setBudgetVersion] = useState({
    version: 'v3.2',
    status: 'current',
    createdDate: '2024-12-15',
    createdBy: 'Bryan VanRock',
    notes: 'Updated with final subcontractor bids',
  });

  const versions = [
    { version: 'v3.2', status: 'current', date: '2024-12-15', notes: 'Updated with final subcontractor bids' },
    { version: 'v3.1', status: 'locked', date: '2024-11-01', notes: 'Post-foundation revisions' },
    { version: 'v3.0', status: 'locked', date: '2024-09-15', notes: 'Construction start budget' },
    { version: 'v2.0', status: 'locked', date: '2024-03-01', notes: 'Bank approved budget' },
    { version: 'v1.0', status: 'locked', date: '2024-01-15', notes: 'Initial proforma budget' },
  ];

  const [budget, setBudget] = useState({
    categories: [
      {
        id: 'land',
        name: 'Land & Acquisition',
        code: '01',
        lineItems: [
          { id: '01-001', code: '01-001', description: 'Land Purchase', budget: 1200000, contingency: 0 },
          { id: '01-002', code: '01-002', description: 'Closing Costs', budget: 24000, contingency: 0 },
          { id: '01-003', code: '01-003', description: 'Due Diligence', budget: 15000, contingency: 0 },
          { id: '01-004', code: '01-004', description: 'Survey', budget: 8500, contingency: 0 },
          { id: '01-005', code: '01-005', description: 'Environmental', budget: 5000, contingency: 0 },
          { id: '01-006', code: '01-006', description: 'Legal - Acquisition', budget: 12000, contingency: 0 },
          { id: '01-007', code: '01-007', description: 'Carrying Costs', budget: 45000, contingency: 0 },
        ],
      },
      {
        id: 'hard-costs',
        name: 'Hard Costs',
        code: '02',
        lineItems: [
          { id: '02-001', code: '02-001', description: 'Site Work & Grading', budget: 185000, contingency: 9250 },
          { id: '02-002', code: '02-002', description: 'Utilities & Infrastructure', budget: 145000, contingency: 7250 },
          { id: '02-003', code: '02-003', description: 'Foundation', budget: 312000, contingency: 15600 },
          { id: '02-004', code: '02-004', description: 'Framing & Structural', budget: 624000, contingency: 31200 },
          { id: '02-005', code: '02-005', description: 'Roofing', budget: 156000, contingency: 7800 },
          { id: '02-006', code: '02-006', description: 'Exterior Finishes', budget: 234000, contingency: 11700 },
          { id: '02-007', code: '02-007', description: 'Windows & Doors', budget: 168000, contingency: 8400 },
          { id: '02-008', code: '02-008', description: 'Plumbing', budget: 192000, contingency: 9600 },
          { id: '02-009', code: '02-009', description: 'Electrical', budget: 204000, contingency: 10200 },
          { id: '02-010', code: '02-010', description: 'HVAC', budget: 216000, contingency: 10800 },
          { id: '02-011', code: '02-011', description: 'Insulation', budget: 72000, contingency: 3600 },
          { id: '02-012', code: '02-012', description: 'Drywall', budget: 144000, contingency: 7200 },
          { id: '02-013', code: '02-013', description: 'Interior Finishes', budget: 288000, contingency: 14400 },
          { id: '02-014', code: '02-014', description: 'Flooring', budget: 180000, contingency: 9000 },
          { id: '02-015', code: '02-015', description: 'Cabinets & Countertops', budget: 264000, contingency: 13200 },
          { id: '02-016', code: '02-016', description: 'Appliances', budget: 108000, contingency: 5400 },
          { id: '02-017', code: '02-017', description: 'Painting', budget: 96000, contingency: 4800 },
          { id: '02-018', code: '02-018', description: 'Landscaping', budget: 132000, contingency: 6600 },
          { id: '02-019', code: '02-019', description: 'Driveways & Concrete', budget: 84000, contingency: 4200 },
          { id: '02-020', code: '02-020', description: 'Cleanup & Dumpsters', budget: 36000, contingency: 1800 },
          { id: '02-021', code: '02-021', description: 'General Conditions', budget: 120000, contingency: 6000 },
        ],
      },
      {
        id: 'soft-costs',
        name: 'Soft Costs',
        code: '03',
        lineItems: [
          { id: '03-001', code: '03-001', description: 'Architecture & Design', budget: 85000, contingency: 0 },
          { id: '03-002', code: '03-002', description: 'Engineering - Structural', budget: 32000, contingency: 0 },
          { id: '03-003', code: '03-003', description: 'Engineering - Civil', budget: 28000, contingency: 0 },
          { id: '03-004', code: '03-004', description: 'Engineering - MEP', budget: 24000, contingency: 0 },
          { id: '03-005', code: '03-005', description: 'Permits & Fees', budget: 68000, contingency: 0 },
          { id: '03-006', code: '03-006', description: 'Impact Fees', budget: 96000, contingency: 0 },
          { id: '03-007', code: '03-007', description: 'Insurance - Builder Risk', budget: 42000, contingency: 0 },
          { id: '03-008', code: '03-008', description: 'Insurance - GL', budget: 18000, contingency: 0 },
          { id: '03-009', code: '03-009', description: 'Legal - Project', budget: 25000, contingency: 0 },
          { id: '03-010', code: '03-010', description: 'Accounting', budget: 15000, contingency: 0 },
          { id: '03-011', code: '03-011', description: 'Marketing & Sales', budget: 85000, contingency: 0 },
          { id: '03-012', code: '03-012', description: 'Realtor Commissions', budget: 242000, contingency: 0 },
          { id: '03-013', code: '03-013', description: 'Project Management', budget: 120000, contingency: 0 },
          { id: '03-014', code: '03-014', description: 'Miscellaneous', budget: 35000, contingency: 0 },
        ],
      },
      {
        id: 'financing',
        name: 'Financing Costs',
        code: '04',
        lineItems: [
          { id: '04-001', code: '04-001', description: 'Loan Origination Fee', budget: 58000, contingency: 0 },
          { id: '04-002', code: '04-002', description: 'Construction Interest', budget: 435000, contingency: 0 },
          { id: '04-003', code: '04-003', description: 'Loan Fees & Costs', budget: 12000, contingency: 0 },
          { id: '04-004', code: '04-004', description: 'Title & Escrow', budget: 8500, contingency: 0 },
        ],
      },
    ],
  });

  const [newLineItem, setNewLineItem] = useState({
    code: '',
    description: '',
    budget: '',
    contingency: '',
  });

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(c => c !== categoryId) : [...prev, categoryId]
    );
  };

  const getCategoryTotal = (category) => {
    return category.lineItems.reduce((sum, item) => sum + item.budget, 0);
  };

  const getCategoryContingency = (category) => {
    return category.lineItems.reduce((sum, item) => sum + (item.contingency || 0), 0);
  };

  const getTotalBudget = () => {
    return budget.categories.reduce((sum, cat) => sum + getCategoryTotal(cat), 0);
  };

  const getTotalContingency = () => {
    return budget.categories.reduce((sum, cat) => sum + getCategoryContingency(cat), 0);
  };

  const formatCurrency = (value) => {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  const handleAddLineItem = () => {
    if (selectedCategory) {
      const updatedBudget = { ...budget };
      const categoryIndex = updatedBudget.categories.findIndex(c => c.id === selectedCategory);
      if (categoryIndex !== -1) {
        const newItem = {
          id: `${updatedBudget.categories[categoryIndex].code}-${String(updatedBudget.categories[categoryIndex].lineItems.length + 1).padStart(3, '0')}`,
          code: newLineItem.code || `${updatedBudget.categories[categoryIndex].code}-${String(updatedBudget.categories[categoryIndex].lineItems.length + 1).padStart(3, '0')}`,
          description: newLineItem.description,
          budget: parseFloat(newLineItem.budget) || 0,
          contingency: parseFloat(newLineItem.contingency) || 0,
        };
        updatedBudget.categories[categoryIndex].lineItems.push(newItem);
        setBudget(updatedBudget);
      }
    }
    setShowLineItemModal(false);
    setNewLineItem({ code: '', description: '', budget: '', contingency: '' });
    setSelectedCategory(null);
  };

  const totalBudget = getTotalBudget();
  const totalContingency = getTotalContingency();
  const grandTotal = totalBudget + totalContingency;

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Budget</h1>
          <p className="text-sm text-gray-500">Version {budgetVersion.version} • Last updated {budgetVersion.createdDate}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowVersionModal(true)}>
            <History className="w-4 h-4 mr-1" />Versions
          </Button>
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button variant="outline" size="sm"><Upload className="w-4 h-4 mr-1" />Import</Button>
          {editMode ? (
            <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setEditMode(false)}>
              <Save className="w-4 h-4 mr-1" />Save Changes
            </Button>
          ) : (
            <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setEditMode(true)}>
              <Edit2 className="w-4 h-4 mr-1" />Edit Budget
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Base Budget</p>
          <p className="text-2xl font-semibold">{formatCurrency(totalBudget)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Contingency</p>
          <p className="text-2xl font-semibold text-amber-600">{formatCurrency(totalContingency)}</p>
          <p className="text-xs text-gray-400">{((totalContingency / totalBudget) * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-[#047857]">
          <p className="text-xs text-gray-500">Total Budget</p>
          <p className="text-2xl font-semibold text-[#047857]">{formatCurrency(grandTotal)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Cost Per Unit</p>
          <p className="text-2xl font-semibold">{formatCurrency(grandTotal / 12)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Cost Per SF</p>
          <p className="text-2xl font-semibold">${(grandTotal / 26400).toFixed(0)}</p>
          <p className="text-xs text-gray-400">26,400 total SF</p>
        </div>
      </div>

      {/* Budget Breakdown Bar */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Budget Breakdown</span>
          <span className="text-sm text-gray-500">{formatCurrency(grandTotal)}</span>
        </div>
        <div className="h-6 bg-gray-200 rounded-full overflow-hidden flex">
          {budget.categories.map((cat, idx) => {
            const catTotal = getCategoryTotal(cat) + getCategoryContingency(cat);
            const pct = (catTotal / grandTotal) * 100;
            const colors = ['bg-blue-500', 'bg-orange-500', 'bg-purple-500', 'bg-green-500'];
            return (
              <div
                key={cat.id}
                className={cn("h-full", colors[idx % colors.length])}
                style={{ width: `${pct}%` }}
                title={`${cat.name}: ${formatCurrency(catTotal)} (${pct.toFixed(1)}%)`}
              ></div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-2 text-xs">
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded"></div>Land & Acquisition</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-500 rounded"></div>Hard Costs</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-purple-500 rounded"></div>Soft Costs</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded"></div>Financing</span>
        </div>
      </div>

      {/* Budget Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium w-24">Code</th>
              <th className="text-left px-4 py-3 font-medium">Description</th>
              <th className="text-right px-4 py-3 font-medium w-32">Budget</th>
              <th className="text-right px-4 py-3 font-medium w-32">Contingency</th>
              <th className="text-right px-4 py-3 font-medium w-32">Total</th>
              {editMode && <th className="text-left px-4 py-3 font-medium w-20">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {budget.categories.map((category) => {
              const catTotal = getCategoryTotal(category);
              const catContingency = getCategoryContingency(category);
              const isExpanded = expandedCategories.includes(category.id);

              return (
                <React.Fragment key={category.id}>
                  {/* Category Row */}
                  <tr className="bg-gray-100 font-semibold border-b cursor-pointer hover:bg-gray-200" onClick={() => toggleCategory(category.id)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        {category.code}
                      </div>
                    </td>
                    <td className="px-4 py-3">{category.name}</td>
                    <td className="px-4 py-3 text-right">${catTotal.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-amber-600">${catContingency.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">${(catTotal + catContingency).toLocaleString()}</td>
                    {editMode && (
                      <td className="px-4 py-3">
                        <button
                          className="p-1 hover:bg-gray-300 rounded"
                          onClick={(e) => { e.stopPropagation(); setSelectedCategory(category.id); setShowLineItemModal(true); }}
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </td>
                    )}
                  </tr>

                  {/* Line Items */}
                  {isExpanded && category.lineItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 pl-10 text-gray-500 font-mono text-xs">{item.code}</td>
                      <td className="px-4 py-2">{item.description}</td>
                      <td className="px-4 py-2 text-right">
                        {editMode ? (
                          <Input type="number" className="w-28 text-right h-8 text-sm" defaultValue={item.budget} />
                        ) : (
                          `$${item.budget.toLocaleString()}`
                        )}
                      </td>
                      <td className="px-4 py-2 text-right text-amber-600">
                        {editMode ? (
                          <Input type="number" className="w-28 text-right h-8 text-sm" defaultValue={item.contingency} />
                        ) : (
                          item.contingency > 0 ? `$${item.contingency.toLocaleString()}` : '-'
                        )}
                      </td>
                      <td className="px-4 py-2 text-right font-medium">${(item.budget + (item.contingency || 0)).toLocaleString()}</td>
                      {editMode && (
                        <td className="px-4 py-2">
                          <button className="p-1 hover:bg-red-100 rounded">
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}

            {/* Grand Total */}
            <tr className="bg-[#047857] text-white font-semibold">
              <td className="px-4 py-3"></td>
              <td className="px-4 py-3">GRAND TOTAL</td>
              <td className="px-4 py-3 text-right">${totalBudget.toLocaleString()}</td>
              <td className="px-4 py-3 text-right">${totalContingency.toLocaleString()}</td>
              <td className="px-4 py-3 text-right">${grandTotal.toLocaleString()}</td>
              {editMode && <td></td>}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Add Line Item Modal */}
      {showLineItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Add Line Item</h3>
              <button onClick={() => { setShowLineItemModal(false); setSelectedCategory(null); }}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Cost Code</label>
                <Input value={newLineItem.code} onChange={(e) => setNewLineItem(prev => ({ ...prev, code: e.target.value }))} placeholder="Auto-generated if blank" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description *</label>
                <Input value={newLineItem.description} onChange={(e) => setNewLineItem(prev => ({ ...prev, description: e.target.value }))} placeholder="Line item description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Budget Amount *</label>
                  <Input type="number" value={newLineItem.budget} onChange={(e) => setNewLineItem(prev => ({ ...prev, budget: e.target.value }))} placeholder="0.00" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Contingency</label>
                  <Input type="number" value={newLineItem.contingency} onChange={(e) => setNewLineItem(prev => ({ ...prev, contingency: e.target.value }))} placeholder="0.00" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => { setShowLineItemModal(false); setSelectedCategory(null); }}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleAddLineItem}>Add Line Item</Button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Budget Versions</h3>
              <button onClick={() => setShowVersionModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {versions.map((ver, idx) => (
                <div key={ver.version} className={cn("flex items-center justify-between p-3 border rounded-lg", ver.status === 'current' && "bg-green-50 border-green-200")}>
                  <div className="flex items-center gap-3">
                    {ver.status === 'current' ? (
                      <Unlock className="w-4 h-4 text-green-500" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium">{ver.version}</p>
                      <p className="text-xs text-gray-500">{ver.date} - {ver.notes}</p>
                    </div>
                  </div>
                  {ver.status === 'current' ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Current</span>
                  ) : (
                    <Button variant="outline" size="sm">View</Button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
              <Button variant="outline" size="sm"><Copy className="w-4 h-4 mr-1" />Create New Version</Button>
              <Button variant="outline" onClick={() => setShowVersionModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetPage;
