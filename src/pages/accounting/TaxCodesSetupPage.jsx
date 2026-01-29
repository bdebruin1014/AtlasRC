// src/pages/accounting/TaxCodesSetupPage.jsx
// Tax Codes Configuration for Transactions

import React, { useState } from 'react';
import {
  Plus, Edit2, Trash2, Search, Settings, AlertTriangle, CheckCircle,
  Percent, DollarSign, MapPin, Building2, FileText, Save, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const TaxCodesSetupPage = () => {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingTaxCode, setEditingTaxCode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const [taxCodes, setTaxCodes] = useState([
    {
      id: 'tax-1',
      code: 'ST-CO',
      name: 'Colorado State Sales Tax',
      type: 'sales',
      rate: 2.9,
      jurisdiction: 'Colorado',
      effectiveDate: '2024-01-01',
      status: 'active',
      description: 'Colorado state sales tax',
      glAccount: '2100 - Sales Tax Payable',
      isDefault: false,
    },
    {
      id: 'tax-2',
      code: 'ST-CO-DEN',
      name: 'Denver City Sales Tax',
      type: 'sales',
      rate: 4.81,
      jurisdiction: 'Denver, CO',
      effectiveDate: '2024-01-01',
      status: 'active',
      description: 'Denver city sales tax (combined with state)',
      glAccount: '2100 - Sales Tax Payable',
      isDefault: true,
    },
    {
      id: 'tax-3',
      code: 'USE-CO',
      name: 'Colorado Use Tax',
      type: 'use',
      rate: 2.9,
      jurisdiction: 'Colorado',
      effectiveDate: '2024-01-01',
      status: 'active',
      description: 'Use tax for out-of-state purchases',
      glAccount: '2110 - Use Tax Payable',
      isDefault: false,
    },
    {
      id: 'tax-4',
      code: 'EXEMPT',
      name: 'Tax Exempt',
      type: 'exempt',
      rate: 0,
      jurisdiction: 'All',
      effectiveDate: '2020-01-01',
      status: 'active',
      description: 'No tax applies (exempt transactions)',
      glAccount: null,
      isDefault: false,
    },
    {
      id: 'tax-5',
      code: 'PT-CO',
      name: 'Property Tax - Colorado',
      type: 'property',
      rate: 0.55,
      jurisdiction: 'Colorado',
      effectiveDate: '2024-01-01',
      status: 'active',
      description: 'Colorado property tax rate (assessed value)',
      glAccount: '2200 - Property Tax Payable',
      isDefault: false,
    },
    {
      id: 'tax-6',
      code: 'WHD-FED',
      name: 'Federal Withholding',
      type: 'withholding',
      rate: 22,
      jurisdiction: 'Federal',
      effectiveDate: '2024-01-01',
      status: 'active',
      description: 'Standard federal income tax withholding',
      glAccount: '2300 - Federal Withholding Payable',
      isDefault: false,
    },
    {
      id: 'tax-7',
      code: 'OLD-ST',
      name: 'Old Sales Tax Rate',
      type: 'sales',
      rate: 2.5,
      jurisdiction: 'Colorado',
      effectiveDate: '2020-01-01',
      expirationDate: '2023-12-31',
      status: 'inactive',
      description: 'Previous Colorado sales tax rate',
      glAccount: '2100 - Sales Tax Payable',
      isDefault: false,
    },
  ]);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'sales',
    rate: '',
    jurisdiction: '',
    effectiveDate: '',
    expirationDate: '',
    description: '',
    glAccount: '',
    isDefault: false,
  });

  const taxTypes = [
    { value: 'sales', label: 'Sales Tax', color: 'bg-blue-100 text-blue-800' },
    { value: 'use', label: 'Use Tax', color: 'bg-purple-100 text-purple-800' },
    { value: 'property', label: 'Property Tax', color: 'bg-green-100 text-green-800' },
    { value: 'withholding', label: 'Withholding', color: 'bg-orange-100 text-orange-800' },
    { value: 'exempt', label: 'Exempt', color: 'bg-gray-100 text-gray-800' },
  ];

  const glAccounts = [
    '2100 - Sales Tax Payable',
    '2110 - Use Tax Payable',
    '2200 - Property Tax Payable',
    '2300 - Federal Withholding Payable',
    '2310 - State Withholding Payable',
    '2320 - FICA Payable',
  ];

  const filteredTaxCodes = taxCodes.filter(tc => {
    const matchesSearch = tc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tc.jurisdiction.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || tc.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleOpenModal = (taxCode = null) => {
    if (taxCode) {
      setEditingTaxCode(taxCode);
      setFormData({
        code: taxCode.code,
        name: taxCode.name,
        type: taxCode.type,
        rate: taxCode.rate.toString(),
        jurisdiction: taxCode.jurisdiction,
        effectiveDate: taxCode.effectiveDate,
        expirationDate: taxCode.expirationDate || '',
        description: taxCode.description,
        glAccount: taxCode.glAccount || '',
        isDefault: taxCode.isDefault,
      });
    } else {
      setEditingTaxCode(null);
      setFormData({
        code: '',
        name: '',
        type: 'sales',
        rate: '',
        jurisdiction: '',
        effectiveDate: new Date().toISOString().split('T')[0],
        expirationDate: '',
        description: '',
        glAccount: '',
        isDefault: false,
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.code || !formData.name || !formData.rate) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please fill in required fields.' });
      return;
    }

    const taxCode = {
      id: editingTaxCode?.id || `tax-${Date.now()}`,
      code: formData.code,
      name: formData.name,
      type: formData.type,
      rate: parseFloat(formData.rate),
      jurisdiction: formData.jurisdiction,
      effectiveDate: formData.effectiveDate,
      expirationDate: formData.expirationDate || null,
      status: formData.expirationDate && new Date(formData.expirationDate) < new Date() ? 'inactive' : 'active',
      description: formData.description,
      glAccount: formData.glAccount || null,
      isDefault: formData.isDefault,
    };

    if (editingTaxCode) {
      setTaxCodes(prev => prev.map(tc => tc.id === editingTaxCode.id ? taxCode : tc));
      toast({ title: 'Tax Code Updated', description: `${taxCode.name} has been updated.` });
    } else {
      setTaxCodes(prev => [taxCode, ...prev]);
      toast({ title: 'Tax Code Created', description: `${taxCode.name} has been created.` });
    }

    setShowModal(false);
  };

  const handleDelete = (taxCode) => {
    if (window.confirm(`Are you sure you want to delete ${taxCode.name}?`)) {
      setTaxCodes(prev => prev.filter(tc => tc.id !== taxCode.id));
      toast({ title: 'Tax Code Deleted', description: `${taxCode.name} has been deleted.` });
    }
  };

  const getTypeConfig = (type) => {
    return taxTypes.find(t => t.value === type) || taxTypes[0];
  };

  const activeCount = taxCodes.filter(tc => tc.status === 'active').length;
  const salesTaxCount = taxCodes.filter(tc => tc.type === 'sales' && tc.status === 'active').length;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Percent className="w-6 h-6 text-blue-600" />
            Tax Codes Setup
          </h1>
          <p className="text-sm text-gray-500">Configure tax codes for transactions</p>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-1" />New Tax Code
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Tax Codes</p>
              <p className="text-2xl font-bold">{taxCodes.length}</p>
            </div>
            <Settings className="w-8 h-8 text-gray-300" />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-300" />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Sales Tax Codes</p>
              <p className="text-2xl font-bold text-blue-600">{salesTaxCount}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-300" />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Jurisdictions</p>
              <p className="text-2xl font-bold text-purple-600">
                {new Set(taxCodes.map(tc => tc.jurisdiction)).size}
              </p>
            </div>
            <MapPin className="w-8 h-8 text-purple-300" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search tax codes..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            {taxTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tax Codes Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Code</th>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-right px-4 py-3 font-medium">Rate</th>
              <th className="text-left px-4 py-3 font-medium">Jurisdiction</th>
              <th className="text-left px-4 py-3 font-medium">GL Account</th>
              <th className="text-center px-4 py-3 font-medium">Status</th>
              <th className="text-center px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredTaxCodes.map((taxCode) => {
              const typeConfig = getTypeConfig(taxCode.type);
              return (
                <tr key={taxCode.id} className={cn("hover:bg-gray-50", taxCode.status === 'inactive' && "opacity-50")}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">{taxCode.code}</span>
                      {taxCode.isDefault && (
                        <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">Default</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{taxCode.name}</p>
                    <p className="text-xs text-gray-500">{taxCode.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-1 rounded text-xs", typeConfig.color)}>
                      {typeConfig.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {taxCode.rate}%
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      {taxCode.jurisdiction}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">{taxCode.glAccount || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "px-2 py-1 rounded text-xs",
                      taxCode.status === 'active' ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                    )}>
                      {taxCode.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenModal(taxCode)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(taxCode)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">
                {editingTaxCode ? 'Edit Tax Code' : 'New Tax Code'}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tax Code *</Label>
                  <Input
                    placeholder="e.g., ST-CO"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  />
                </div>
                <div>
                  <Label>Tax Type *</Label>
                  <select
                    className="w-full border rounded-md px-3 py-2"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  >
                    {taxTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label>Name *</Label>
                <Input
                  placeholder="e.g., Colorado State Sales Tax"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tax Rate (%) *</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.rate}
                      onChange={(e) => setFormData(prev => ({ ...prev, rate: e.target.value }))}
                    />
                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div>
                  <Label>Jurisdiction</Label>
                  <Input
                    placeholder="e.g., Colorado"
                    value={formData.jurisdiction}
                    onChange={(e) => setFormData(prev => ({ ...prev, jurisdiction: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Effective Date *</Label>
                  <Input
                    type="date"
                    value={formData.effectiveDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, effectiveDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Expiration Date</Label>
                  <Input
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expirationDate: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label>GL Account</Label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={formData.glAccount}
                  onChange={(e) => setFormData(prev => ({ ...prev, glAccount: e.target.value }))}
                >
                  <option value="">None</option>
                  {glAccounts.map(acc => (
                    <option key={acc} value={acc}>{acc}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Description</Label>
                <textarea
                  className="w-full border rounded-md px-3 py-2"
                  rows={2}
                  placeholder="Optional description..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                />
                <label htmlFor="isDefault" className="text-sm">Set as default for this tax type</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleSave}>
                <Save className="w-4 h-4 mr-1" />
                {editingTaxCode ? 'Update Tax Code' : 'Create Tax Code'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxCodesSetupPage;
