// src/pages/accounting/EntityAccountingSettingsPage.jsx
// Entity accounting settings with tabbed interface

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Settings, DollarSign, Calendar, Clock, AlertTriangle, CheckCircle2,
  Save, Building2, FileText, CreditCard, Percent, Bell, BookOpen,
  Plus, Download, Upload, Users, Trash2, Archive, AlertCircle, Edit2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  getEntityAccountingSettings,
  updateEntityAccountingSettings,
  ACCOUNTING_METHOD,
  PAYMENT_TERMS,
} from '@/services/accountingEnhancedService';
import ImportAccountsModal from '@/components/accounting/ImportAccountsModal';
import AccountFormModal from '@/components/accounting/AccountFormModal';
import OwnerFormModal from '@/components/accounting/OwnerFormModal';
import BankAccountFormModal from '@/components/accounting/BankAccountFormModal';

const TABS = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'chart-of-accounts', label: 'Chart of Accounts', icon: BookOpen },
  { id: 'bank-setup', label: 'Bank Setup', icon: CreditCard },
  { id: 'ownership', label: 'Ownership', icon: Users },
  { id: 'admin', label: 'Admin', icon: AlertCircle },
];

const EntityAccountingSettingsPage = () => {
  const { entityId } = useParams();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Modal states
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedBankAccount, setSelectedBankAccount] = useState(null);

  // Chart of Accounts state
  const [accounts, setAccounts] = useState([
    { id: 1, number: '1000', name: 'Cash', type: 'Asset', subtype: 'Current Asset', balance: 125000 },
    { id: 2, number: '1100', name: 'Accounts Receivable', type: 'Asset', subtype: 'Current Asset', balance: 45000 },
    { id: 3, number: '1500', name: 'Fixed Assets', type: 'Asset', subtype: 'Non-Current Asset', balance: 850000 },
    { id: 4, number: '2000', name: 'Accounts Payable', type: 'Liability', subtype: 'Current Liability', balance: 32000 },
    { id: 5, number: '3000', name: 'Owners Equity', type: 'Equity', subtype: 'Retained Earnings', balance: 500000 },
    { id: 6, number: '4000', name: 'Revenue', type: 'Revenue', subtype: 'Operating Revenue', balance: 250000 },
    { id: 7, number: '5000', name: 'Cost of Goods Sold', type: 'Expense', subtype: 'Direct Costs', balance: 125000 },
    { id: 8, number: '6000', name: 'Operating Expenses', type: 'Expense', subtype: 'Operating Expenses', balance: 75000 },
  ]);

  // Bank Accounts state
  const [bankAccounts, setBankAccounts] = useState([
    { id: 1, name: 'Operating Account', bank: 'Chase', accountNumber: '****4521', type: 'Checking', balance: 85000, connected: true },
    { id: 2, name: 'Payroll Account', bank: 'Chase', accountNumber: '****4522', type: 'Checking', balance: 25000, connected: true },
    { id: 3, name: 'Reserve Account', bank: 'Bank of America', accountNumber: '****7890', type: 'Savings', balance: 150000, connected: false },
  ]);

  // Ownership state
  const [owners, setOwners] = useState([
    { id: 1, name: 'John Smith', ownership: 45, capitalAccount: 225000, email: 'john@example.com' },
    { id: 2, name: 'Jane Doe', ownership: 35, capitalAccount: 175000, email: 'jane@example.com' },
    { id: 3, name: 'ABC Holdings LLC', ownership: 20, capitalAccount: 100000, email: 'contact@abcholdings.com' },
  ]);

  useEffect(() => {
    loadSettings();
  }, [entityId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getEntityAccountingSettings(entityId);
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateEntityAccountingSettings(entityId, settings);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const renderActionButtons = () => {
    switch (activeTab) {
      case 'general':
        return hasChanges ? (
          <Button onClick={handleSave} disabled={saving} className="bg-[#047857] hover:bg-[#065f46]">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        ) : null;
      case 'admin':
        return (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => alert('Archive entity')}>
              <Archive className="w-4 h-4 mr-1" />Archive Entity
            </Button>
            <Button variant="destructive" size="sm" onClick={() => alert('Delete entity - this action is irreversible')}>
              <Trash2 className="w-4 h-4 mr-1" />Delete Entity
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const handleEditAccount = (account) => {
    setSelectedAccount(account);
    setShowAccountModal(true);
  };

  const handleEditOwner = (owner) => {
    setSelectedOwner(owner);
    setShowOwnerModal(true);
  };

  const handleEditBankAccount = (bankAccount) => {
    setSelectedBankAccount(bankAccount);
    setShowBankModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-7 h-7 text-gray-600" />
            Entity Settings
          </h1>
          <p className="text-gray-500 mt-1">Configure accounting preferences for this entity</p>
        </div>
        {renderActionButtons()}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4" aria-label="Tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                  activeTab === tab.id
                    ? "border-[#047857] text-[#047857]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl">
        {activeTab === 'general' && (
          <GeneralSettings settings={settings} handleChange={handleChange} />
        )}
        {activeTab === 'chart-of-accounts' && (
          <ChartOfAccountsTab
            accounts={accounts}
            onImport={() => setShowImportModal(true)}
            onAddAccount={() => { setSelectedAccount(null); setShowAccountModal(true); }}
            onEditAccount={handleEditAccount}
          />
        )}
        {activeTab === 'bank-setup' && (
          <BankSetupTab
            bankAccounts={bankAccounts}
            onAddBankAccount={() => { setSelectedBankAccount(null); setShowBankModal(true); }}
            onEditBankAccount={handleEditBankAccount}
          />
        )}
        {activeTab === 'ownership' && (
          <OwnershipTab
            owners={owners}
            onAddOwner={() => { setSelectedOwner(null); setShowOwnerModal(true); }}
            onEditOwner={handleEditOwner}
          />
        )}
        {activeTab === 'admin' && (
          <AdminTab entityId={entityId} />
        )}
      </div>

      {/* Modals */}
      <ImportAccountsModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        entityId={entityId}
      />
      <AccountFormModal
        open={showAccountModal}
        onClose={() => { setShowAccountModal(false); setSelectedAccount(null); }}
        entityId={entityId}
        account={selectedAccount}
      />
      <OwnerFormModal
        open={showOwnerModal}
        onClose={() => { setShowOwnerModal(false); setSelectedOwner(null); }}
        entityId={entityId}
        owner={selectedOwner}
      />
      <BankAccountFormModal
        open={showBankModal}
        onClose={() => { setShowBankModal(false); setSelectedBankAccount(null); }}
        entityId={entityId}
        bankAccount={selectedBankAccount}
      />
    </div>
  );
};

// General Settings Tab Component
const GeneralSettings = ({ settings, handleChange }) => (
  <div className="space-y-6">
    {/* Accounting Method */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Accounting Method
        </CardTitle>
        <CardDescription>
          Choose how revenue and expenses are recognized
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={cn(
              "p-4 border-2 rounded-lg cursor-pointer transition-all",
              settings?.accounting_method === ACCOUNTING_METHOD.CASH
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            )}
            onClick={() => handleChange('accounting_method', ACCOUNTING_METHOD.CASH)}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Cash Basis</h3>
              {settings?.accounting_method === ACCOUNTING_METHOD.CASH && (
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <p className="text-sm text-gray-600">
              Revenue is recorded when cash is received. Expenses are recorded when cash is paid.
              Simpler for small businesses.
            </p>
          </div>
          <div
            className={cn(
              "p-4 border-2 rounded-lg cursor-pointer transition-all",
              settings?.accounting_method === ACCOUNTING_METHOD.ACCRUAL
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            )}
            onClick={() => handleChange('accounting_method', ACCOUNTING_METHOD.ACCRUAL)}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Accrual Basis</h3>
              {settings?.accounting_method === ACCOUNTING_METHOD.ACCRUAL && (
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <p className="text-sm text-gray-600">
              Revenue is recorded when earned. Expenses are recorded when incurred.
              Required for GAAP and larger businesses.
            </p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Changing the accounting method affects how financial reports are generated.
            Consult with your accountant before making changes.
          </p>
        </div>
      </CardContent>
    </Card>

    {/* Fiscal Year */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Fiscal Year
        </CardTitle>
        <CardDescription>
          Set the start of your fiscal year
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-w-xs">
          <label className="block text-sm font-medium mb-2">Fiscal Year Start Month</label>
          <select
            value={settings?.fiscal_year_start_month || 1}
            onChange={(e) => handleChange('fiscal_year_start_month', parseInt(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[
              { value: 1, label: 'January' },
              { value: 2, label: 'February' },
              { value: 3, label: 'March' },
              { value: 4, label: 'April' },
              { value: 5, label: 'May' },
              { value: 6, label: 'June' },
              { value: 7, label: 'July' },
              { value: 8, label: 'August' },
              { value: 9, label: 'September' },
              { value: 10, label: 'October' },
              { value: 11, label: 'November' },
              { value: 12, label: 'December' },
            ].map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>

    {/* Default Payment Terms */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Default Payment Terms
        </CardTitle>
        <CardDescription>
          Default terms applied to new invoices and bills
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-w-xs">
          <label className="block text-sm font-medium mb-2">Payment Terms</label>
          <select
            value={settings?.default_payment_terms || 'NET_30'}
            onChange={(e) => handleChange('default_payment_terms', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(PAYMENT_TERMS).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>

    {/* Late Fees */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="w-5 h-5 text-red-600" />
          Late Payment Fees
        </CardTitle>
        <CardDescription>
          Configure automatic late fees for overdue invoices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Enable Late Fees</p>
            <p className="text-sm text-gray-500">Charge fees on overdue invoices</p>
          </div>
          <Switch
            checked={settings?.late_fee_enabled || false}
            onCheckedChange={(checked) => handleChange('late_fee_enabled', checked)}
          />
        </div>

        {settings?.late_fee_enabled && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Late Fee Percentage</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={settings?.late_fee_percent || 1.5}
                    onChange={(e) => handleChange('late_fee_percent', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Grace Period (Days)</label>
                <input
                  type="number"
                  min="0"
                  max="90"
                  value={settings?.late_fee_grace_days || 15}
                  onChange={(e) => handleChange('late_fee_grace_days', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Automatic Late Fees</p>
                <p className="text-sm text-gray-500">Automatically apply fees after grace period</p>
              </div>
              <Switch
                checked={settings?.auto_late_fees || false}
                onCheckedChange={(checked) => handleChange('auto_late_fees', checked)}
              />
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Example:</strong> A {settings?.late_fee_percent || 1.5}% late fee
                will be applied to invoices that are more than {settings?.late_fee_grace_days || 15} days
                past their due date.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>

    {/* 1099 Settings */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-orange-600" />
          1099 Reporting
        </CardTitle>
        <CardDescription>
          Configure settings for 1099 vendor tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">1099 Threshold Alerts</p>
            <p className="text-sm text-gray-500">
              Alert when vendor payments approach $600 threshold
            </p>
          </div>
          <Switch
            checked={settings?.alert_1099_threshold || false}
            onCheckedChange={(checked) => handleChange('alert_1099_threshold', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Require Tax ID for 1099 Vendors</p>
            <p className="text-sm text-gray-500">
              Warn when paying vendors without a Tax ID on file
            </p>
          </div>
          <Switch
            checked={settings?.require_1099_tax_id || false}
            onCheckedChange={(checked) => handleChange('require_1099_tax_id', checked)}
          />
        </div>
      </CardContent>
    </Card>

    {/* Notifications */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          Notifications
        </CardTitle>
        <CardDescription>
          Configure accounting alerts and reminders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Bill Due Reminders</p>
            <p className="text-sm text-gray-500">Email reminder before bills are due</p>
          </div>
          <Switch
            checked={settings?.notify_bill_due || false}
            onCheckedChange={(checked) => handleChange('notify_bill_due', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Invoice Overdue Alerts</p>
            <p className="text-sm text-gray-500">Alert when invoices become overdue</p>
          </div>
          <Switch
            checked={settings?.notify_invoice_overdue || false}
            onCheckedChange={(checked) => handleChange('notify_invoice_overdue', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Low Balance Alerts</p>
            <p className="text-sm text-gray-500">Alert when bank account balance is low</p>
          </div>
          <Switch
            checked={settings?.notify_low_balance || false}
            onCheckedChange={(checked) => handleChange('notify_low_balance', checked)}
          />
        </div>
      </CardContent>
    </Card>
  </div>
);

// Chart of Accounts Tab Component
const ChartOfAccountsTab = ({ accounts, onImport, onAddAccount, onEditAccount }) => {
  const accountTypes = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Chart of Accounts</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onImport}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button size="sm" className="bg-[#047857] hover:bg-[#065f46]" onClick={onAddAccount}>
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Structure</CardTitle>
          <CardDescription>
            Manage your chart of accounts for this entity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Account #</th>
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-left px-4 py-3 font-medium">Subtype</th>
                  <th className="text-right px-4 py-3 font-medium">Balance</th>
                  <th className="text-left px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{account.number}</td>
                    <td className="px-4 py-3 font-medium">{account.name}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "px-2 py-1 rounded text-xs",
                        account.type === 'Asset' && "bg-blue-100 text-blue-700",
                        account.type === 'Liability' && "bg-red-100 text-red-700",
                        account.type === 'Equity' && "bg-purple-100 text-purple-700",
                        account.type === 'Revenue' && "bg-green-100 text-green-700",
                        account.type === 'Expense' && "bg-orange-100 text-orange-700"
                      )}>
                        {account.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{account.subtype}</td>
                    <td className="px-4 py-3 text-right font-medium">${account.balance.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => onEditAccount(account)}>
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Templates</CardTitle>
          <CardDescription>
            Quick-start your chart of accounts with industry templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
              <Building2 className="w-8 h-8 text-blue-600 mb-2" />
              <h4 className="font-medium">Real Estate</h4>
              <p className="text-sm text-gray-500">Property management & development</p>
            </div>
            <div className="p-4 border rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
              <FileText className="w-8 h-8 text-green-600 mb-2" />
              <h4 className="font-medium">Construction</h4>
              <p className="text-sm text-gray-500">Job costing & project tracking</p>
            </div>
            <div className="p-4 border rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
              <DollarSign className="w-8 h-8 text-purple-600 mb-2" />
              <h4 className="font-medium">Standard Business</h4>
              <p className="text-sm text-gray-500">General purpose accounts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Bank Setup Tab Component
const BankSetupTab = ({ bankAccounts, onAddBankAccount, onEditBankAccount }) => (
  <div className="space-y-6">
    {/* Section Header */}
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold">Bank Setup</h3>
      <div className="flex items-center gap-2">
        <Button size="sm" className="bg-[#047857] hover:bg-[#065f46]" onClick={onAddBankAccount}>
          <Plus className="h-4 w-4 mr-2" />
          Add Bank Account
        </Button>
      </div>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Connected Bank Accounts</CardTitle>
        <CardDescription>
          Manage bank account connections for this entity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bankAccounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center",
                  account.connected ? "bg-green-100" : "bg-gray-100"
                )}>
                  <CreditCard className={cn(
                    "w-6 h-6",
                    account.connected ? "text-green-600" : "text-gray-400"
                  )} />
                </div>
                <div>
                  <h4 className="font-medium">{account.name}</h4>
                  <p className="text-sm text-gray-500">{account.bank} - {account.accountNumber}</p>
                  <p className="text-xs text-gray-400">{account.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold">${account.balance.toLocaleString()}</p>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded",
                    account.connected ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  )}>
                    {account.connected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={() => onEditBankAccount(account)}>
                  <Edit2 className="h-4 w-4 mr-1" />
                  {account.connected ? 'Settings' : 'Edit'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Bank Feed Settings</CardTitle>
        <CardDescription>
          Configure how bank transactions are imported and categorized
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Auto-import Transactions</p>
            <p className="text-sm text-gray-500">Automatically import new transactions daily</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Auto-categorize Transactions</p>
            <p className="text-sm text-gray-500">Use AI to suggest transaction categories</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Create Rules from Matches</p>
            <p className="text-sm text-gray-500">Learn from manual categorizations</p>
          </div>
          <Switch />
        </div>
      </CardContent>
    </Card>
  </div>
);

// Ownership Tab Component
const OwnershipTab = ({ owners, onAddOwner, onEditOwner }) => {
  const totalOwnership = owners.reduce((sum, o) => sum + o.ownership, 0);
  const totalCapital = owners.reduce((sum, o) => sum + o.capitalAccount, 0);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Ownership</h3>
        <div className="flex items-center gap-2">
          <Button size="sm" className="bg-[#047857] hover:bg-[#065f46]" onClick={onAddOwner}>
            <Plus className="h-4 w-4 mr-2" />
            Add Owner
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ownership Structure</CardTitle>
          <CardDescription>
            Manage owners and their equity stakes in this entity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Owner</th>
                  <th className="text-left px-4 py-3 font-medium">Email</th>
                  <th className="text-right px-4 py-3 font-medium">Ownership %</th>
                  <th className="text-right px-4 py-3 font-medium">Capital Account</th>
                  <th className="text-left px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {owners.map((owner) => (
                  <tr key={owner.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-700 font-medium text-sm">
                            {owner.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className="font-medium">{owner.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{owner.email}</td>
                    <td className="px-4 py-3 text-right font-medium">{owner.ownership}%</td>
                    <td className="px-4 py-3 text-right font-medium">${owner.capitalAccount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => onEditOwner(owner)}>
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t">
                <tr>
                  <td className="px-4 py-3 font-semibold" colSpan={2}>Total</td>
                  <td className={cn(
                    "px-4 py-3 text-right font-semibold",
                    totalOwnership !== 100 && "text-red-600"
                  )}>
                    {totalOwnership}%
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">${totalCapital.toLocaleString()}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          {totalOwnership !== 100 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-800">
                Total ownership is {totalOwnership}%. It should equal 100%.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribution Settings</CardTitle>
          <CardDescription>
            Configure how profits and losses are distributed to owners
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-calculate Distributions</p>
              <p className="text-sm text-gray-500">Calculate based on ownership percentages</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">K-1 Generation</p>
              <p className="text-sm text-gray-500">Generate K-1 schedules at year-end</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Admin Tab Component
const AdminTab = ({ entityId }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Entity Information</CardTitle>
        <CardDescription>
          Basic entity details and identifiers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Entity ID</label>
            <Input value={entityId} disabled className="bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tax ID (EIN)</label>
            <Input placeholder="XX-XXXXXXX" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">State of Formation</label>
            <select className="w-full px-3 py-2 border rounded-lg">
              <option>Delaware</option>
              <option>California</option>
              <option>Nevada</option>
              <option>Texas</option>
              <option>New York</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Entity Type</label>
            <select className="w-full px-3 py-2 border rounded-lg">
              <option>LLC</option>
              <option>Corporation</option>
              <option>S-Corporation</option>
              <option>Partnership</option>
              <option>Sole Proprietorship</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
        <CardDescription>
          Export or import entity accounting data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">Export All Data</p>
            <p className="text-sm text-gray-500">Download all transactions, accounts, and settings</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />Export
          </Button>
        </div>
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">Import Data</p>
            <p className="text-sm text-gray-500">Import transactions from CSV or other accounting software</p>
          </div>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />Import
          </Button>
        </div>
      </CardContent>
    </Card>

    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="text-red-600 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Danger Zone
        </CardTitle>
        <CardDescription>
          These actions are irreversible. Please proceed with caution.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-amber-200 bg-amber-50 rounded-lg">
          <div>
            <p className="font-medium">Archive Entity</p>
            <p className="text-sm text-gray-600">
              Archive this entity. It will be hidden from views but data will be preserved.
            </p>
          </div>
          <Button variant="outline" onClick={() => alert('Confirm archive?')}>
            <Archive className="w-4 h-4 mr-2" />Archive
          </Button>
        </div>
        <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
          <div>
            <p className="font-medium text-red-700">Delete Entity</p>
            <p className="text-sm text-red-600">
              Permanently delete this entity and all associated data. This cannot be undone.
            </p>
          </div>
          <Button variant="destructive" onClick={() => alert('This action cannot be undone. Are you sure?')}>
            <Trash2 className="w-4 h-4 mr-2" />Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default EntityAccountingSettingsPage;
