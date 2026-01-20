import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, ChevronDown, ChevronRight, X, Eye, EyeOff, Download, Upload, FolderOpen, FileText, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const ChartOfAccountsPage = ({ selectedEntity, flatEntities }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(['assets', 'liabilities', 'equity', 'revenue', 'expenses']);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const [accounts, setAccounts] = useState([
    // Assets
    { id: '1000', number: '1000', name: 'Cash - Operating', type: 'asset', category: 'assets', subCategory: 'Current Assets', balance: 2450000, isActive: true, description: 'Main operating cash account' },
    { id: '1010', number: '1010', name: 'Cash - Payroll', type: 'asset', category: 'assets', subCategory: 'Current Assets', balance: 125000, isActive: true },
    { id: '1020', number: '1020', name: 'Cash - Construction', type: 'asset', category: 'assets', subCategory: 'Current Assets', balance: 1850000, isActive: true },
    { id: '1100', number: '1100', name: 'Accounts Receivable', type: 'asset', category: 'assets', subCategory: 'Current Assets', balance: 1860000, isActive: true },
    { id: '1150', number: '1150', name: 'Intercompany Receivable', type: 'asset', category: 'assets', subCategory: 'Current Assets', balance: 540000, isActive: true, isIntercompany: true },
    { id: '1200', number: '1200', name: 'Inventory - Work in Progress', type: 'asset', category: 'assets', subCategory: 'Current Assets', balance: 8500000, isActive: true },
    { id: '1250', number: '1250', name: 'Prepaid Expenses', type: 'asset', category: 'assets', subCategory: 'Current Assets', balance: 125000, isActive: true },
    { id: '1500', number: '1500', name: 'Land', type: 'asset', category: 'assets', subCategory: 'Fixed Assets', balance: 4500000, isActive: true },
    { id: '1510', number: '1510', name: 'Buildings', type: 'asset', category: 'assets', subCategory: 'Fixed Assets', balance: 12500000, isActive: true },
    { id: '1520', number: '1520', name: 'Accumulated Depreciation - Buildings', type: 'asset', category: 'assets', subCategory: 'Fixed Assets', balance: -1250000, isActive: true, isContra: true },
    { id: '1530', number: '1530', name: 'Equipment', type: 'asset', category: 'assets', subCategory: 'Fixed Assets', balance: 350000, isActive: true },
    { id: '1600', number: '1600', name: 'Investment in Subsidiaries', type: 'asset', category: 'assets', subCategory: 'Other Assets', balance: 7500000, isActive: true },
    // Liabilities
    { id: '2000', number: '2000', name: 'Accounts Payable', type: 'liability', category: 'liabilities', subCategory: 'Current Liabilities', balance: 1270000, isActive: true },
    { id: '2050', number: '2050', name: 'Accrued Expenses', type: 'liability', category: 'liabilities', subCategory: 'Current Liabilities', balance: 485000, isActive: true },
    { id: '2100', number: '2100', name: 'Intercompany Payable', type: 'liability', category: 'liabilities', subCategory: 'Current Liabilities', balance: 540000, isActive: true, isIntercompany: true },
    { id: '2150', number: '2150', name: 'Current Portion - Long Term Debt', type: 'liability', category: 'liabilities', subCategory: 'Current Liabilities', balance: 450000, isActive: true },
    { id: '2500', number: '2500', name: 'Construction Loans Payable', type: 'liability', category: 'liabilities', subCategory: 'Long-Term Liabilities', balance: 10200000, isActive: true },
    { id: '2510', number: '2510', name: 'Mortgage Payable', type: 'liability', category: 'liabilities', subCategory: 'Long-Term Liabilities', balance: 2500000, isActive: true },
    // Equity
    { id: '3000', number: '3000', name: "Member's Capital", type: 'equity', category: 'equity', subCategory: 'Capital', balance: 5500000, isActive: true },
    { id: '3100', number: '3100', name: 'Retained Earnings', type: 'equity', category: 'equity', subCategory: 'Retained Earnings', balance: 2150000, isActive: true },
    { id: '3200', number: '3200', name: 'Current Year Net Income', type: 'equity', category: 'equity', subCategory: 'Current Year', balance: 3479000, isActive: true },
    // Revenue
    { id: '4000', number: '4000', name: 'Rental Income', type: 'revenue', category: 'revenue', subCategory: 'Operating Revenue', balance: 1850000, isActive: true },
    { id: '4100', number: '4100', name: 'Home Sales Revenue', type: 'revenue', category: 'revenue', subCategory: 'Operating Revenue', balance: 6950000, isActive: true },
    { id: '4150', number: '4150', name: 'Lot Sales Revenue', type: 'revenue', category: 'revenue', subCategory: 'Operating Revenue', balance: 0, isActive: true },
    { id: '4200', number: '4200', name: 'Management Fee Income', type: 'revenue', category: 'revenue', subCategory: 'Operating Revenue', balance: 420000, isActive: true, isIntercompany: true },
    { id: '4300', number: '4300', name: 'Interest Income', type: 'revenue', category: 'revenue', subCategory: 'Other Revenue', balance: 1270000, isActive: true },
    // Expenses
    { id: '5000', number: '5000', name: 'Cost of Goods Sold - Land', type: 'expense', category: 'expenses', subCategory: 'Cost of Goods Sold', balance: 2850000, isActive: true },
    { id: '5100', number: '5100', name: 'Cost of Goods Sold - Construction', type: 'expense', category: 'expenses', subCategory: 'Cost of Goods Sold', balance: 1800000, isActive: true },
    { id: '6000', number: '6000', name: 'Salaries & Wages', type: 'expense', category: 'expenses', subCategory: 'Operating Expenses', balance: 480000, isActive: true },
    { id: '6100', number: '6100', name: 'Property Taxes', type: 'expense', category: 'expenses', subCategory: 'Operating Expenses', balance: 185000, isActive: true },
    { id: '6200', number: '6200', name: 'Insurance', type: 'expense', category: 'expenses', subCategory: 'Operating Expenses', balance: 125000, isActive: true },
    { id: '6300', number: '6300', name: 'Utilities', type: 'expense', category: 'expenses', subCategory: 'Operating Expenses', balance: 45000, isActive: true },
    { id: '6400', number: '6400', name: 'Repairs & Maintenance', type: 'expense', category: 'expenses', subCategory: 'Operating Expenses', balance: 92000, isActive: true },
    { id: '6500', number: '6500', name: 'Management Fees', type: 'expense', category: 'expenses', subCategory: 'Operating Expenses', balance: 420000, isActive: true, isIntercompany: true },
    { id: '6600', number: '6600', name: 'Professional Services', type: 'expense', category: 'expenses', subCategory: 'Operating Expenses', balance: 150000, isActive: true },
    { id: '6700', number: '6700', name: 'Depreciation Expense', type: 'expense', category: 'expenses', subCategory: 'Operating Expenses', balance: 150000, isActive: true },
    { id: '7000', number: '7000', name: 'Interest Expense', type: 'expense', category: 'expenses', subCategory: 'Other Expenses', balance: 864000, isActive: true },
  ]);

  const [formData, setFormData] = useState({
    number: '',
    name: '',
    type: 'asset',
    category: 'assets',
    subCategory: '',
    description: '',
    isActive: true,
    isIntercompany: false,
  });

  const categories = {
    assets: { label: 'Assets', color: 'blue', subCategories: ['Current Assets', 'Fixed Assets', 'Other Assets'] },
    liabilities: { label: 'Liabilities', color: 'red', subCategories: ['Current Liabilities', 'Long-Term Liabilities'] },
    equity: { label: 'Equity', color: 'green', subCategories: ['Capital', 'Retained Earnings', 'Current Year'] },
    revenue: { label: 'Revenue', color: 'emerald', subCategories: ['Operating Revenue', 'Other Revenue'] },
    expenses: { label: 'Expenses', color: 'orange', subCategories: ['Cost of Goods Sold', 'Operating Expenses', 'Other Expenses'] },
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  };

  const getCategoryTotal = (category) => {
    return accounts.filter(a => a.category === category && a.isActive).reduce((sum, a) => sum + a.balance, 0);
  };

  const getSubCategoryAccounts = (category, subCategory) => {
    return accounts.filter(a => a.category === category && a.subCategory === subCategory && (showInactive || a.isActive));
  };

  const filteredAccounts = accounts.filter(a => {
    if (!showInactive && !a.isActive) return false;
    if (searchTerm) {
      return a.number.includes(searchTerm) || a.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const handleSave = () => {
    if (editingAccount) {
      setAccounts(prev => prev.map(a => a.id === editingAccount.id ? { ...a, ...formData } : a));
    } else {
      setAccounts(prev => [...prev, { ...formData, id: formData.number, balance: 0 }]);
    }
    setShowModal(false);
    setEditingAccount(null);
    setFormData({ number: '', name: '', type: 'asset', category: 'assets', subCategory: '', description: '', isActive: true, isIntercompany: false });
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData(account);
    setShowModal(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Chart of Accounts</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button variant="outline" size="sm"><Upload className="w-4 h-4 mr-1" />Import</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-1" />Add Account
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {Object.entries(categories).map(([key, cat]) => (
          <div key={key} className={cn("bg-white border rounded-lg p-4", `border-l-4 border-l-${cat.color}-500`)}>
            <p className="text-sm text-gray-500">{cat.label}</p>
            <p className="text-xl font-semibold">${(Math.abs(getCategoryTotal(key)) / 1000000).toFixed(2)}M</p>
            <p className="text-xs text-gray-400">{accounts.filter(a => a.category === key && a.isActive).length} accounts</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search by account number or name..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowInactive(!showInactive)}>
            {showInactive ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
            {showInactive ? 'Showing Inactive' : 'Show Inactive'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setExpandedCategories(Object.keys(categories))}>Expand All</Button>
          <Button variant="outline" size="sm" onClick={() => setExpandedCategories([])}>Collapse All</Button>
        </div>
      </div>

      {/* Accounts Tree */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {Object.entries(categories).map(([categoryKey, category]) => (
          <div key={categoryKey}>
            {/* Category Header */}
            <div
              onClick={() => toggleCategory(categoryKey)}
              className={cn("flex items-center justify-between px-4 py-3 bg-gray-50 border-b cursor-pointer hover:bg-gray-100", `border-l-4 border-l-${category.color}-500`)}
            >
              <div className="flex items-center gap-2">
                {expandedCategories.includes(categoryKey) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <FolderOpen className={cn("w-4 h-4", `text-${category.color}-500`)} />
                <span className="font-semibold">{category.label}</span>
                <span className="text-xs text-gray-500">({accounts.filter(a => a.category === categoryKey && a.isActive).length} accounts)</span>
              </div>
              <span className="font-semibold">${(Math.abs(getCategoryTotal(categoryKey)) / 1000000).toFixed(2)}M</span>
            </div>

            {/* Sub-categories and accounts */}
            {expandedCategories.includes(categoryKey) && (
              <div>
                {category.subCategories.map((subCat) => {
                  const subAccounts = getSubCategoryAccounts(categoryKey, subCat);
                  if (subAccounts.length === 0 && !searchTerm) return null;
                  return (
                    <div key={subCat}>
                      <div className="flex items-center justify-between px-8 py-2 bg-gray-50/50 border-b text-sm">
                        <span className="font-medium text-gray-600">{subCat}</span>
                        <span className="text-gray-500">${(Math.abs(subAccounts.reduce((s, a) => s + a.balance, 0)) / 1000).toFixed(0)}K</span>
                      </div>
                      {subAccounts.map((account) => (
                        <div key={account.id} className={cn("flex items-center justify-between px-12 py-2 border-b hover:bg-gray-50", !account.isActive && "opacity-50")}>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm text-gray-500 w-12">{account.number}</span>
                            <span className={cn("text-sm", account.isContra && "text-red-600")}>{account.name}</span>
                            {account.isIntercompany && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">IC</span>}
                            {!account.isActive && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Inactive</span>}
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={cn("font-medium text-sm", account.balance < 0 ? "text-red-600" : "text-gray-900")}>
                              ${Math.abs(account.balance).toLocaleString()}
                            </span>
                            <div className="flex gap-1">
                              <button onClick={() => handleEdit(account)} className="p-1 hover:bg-gray-100 rounded" title="Edit">
                                <Edit2 className="w-4 h-4 text-gray-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add/Edit Account Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">{editingAccount ? 'Edit Account' : 'Add Account'}</h3>
              <button onClick={() => { setShowModal(false); setEditingAccount(null); }}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Account Number *</label>
                  <Input value={formData.number} onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))} placeholder="e.g., 1000" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Account Type *</label>
                  <select className="w-full border rounded-md px-3 py-2" value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value, subCategory: categories[e.target.value].subCategories[0] }))}>
                    {Object.entries(categories).map(([key, cat]) => (
                      <option key={key} value={key}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Account Name *</label>
                <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g., Cash - Operating" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Sub-Category *</label>
                <select className="w-full border rounded-md px-3 py-2" value={formData.subCategory} onChange={(e) => setFormData(prev => ({ ...prev, subCategory: e.target.value }))}>
                  {categories[formData.category].subCategories.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description</label>
                <textarea className="w-full border rounded-md px-3 py-2" rows={2} value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Optional description..." />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} className="rounded" />
                  <span className="text-sm">Active</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.isIntercompany} onChange={(e) => setFormData(prev => ({ ...prev, isIntercompany: e.target.checked }))} className="rounded" />
                  <span className="text-sm">Intercompany Account</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => { setShowModal(false); setEditingAccount(null); }}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleSave}>
                {editingAccount ? 'Save Changes' : 'Add Account'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartOfAccountsPage;
