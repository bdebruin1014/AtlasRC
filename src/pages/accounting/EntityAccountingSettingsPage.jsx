// src/pages/accounting/EntityAccountingSettingsPage.jsx
// Entity accounting settings including Cash/Accrual method selection

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Settings, DollarSign, Calendar, Clock, AlertTriangle, CheckCircle2,
  Save, Building2, FileText, CreditCard, Percent, Bell, BookOpen, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  getEntityAccountingSettings,
  updateEntityAccountingSettings,
  ACCOUNTING_METHOD,
  PAYMENT_TERMS,
} from '@/services/accountingEnhancedService';

const EntityAccountingSettingsPage = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-7 h-7 text-gray-600" />
            Entity Settings
          </h1>
          <p className="text-gray-500 mt-1">Configure accounting preferences for this entity</p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow border-2"
          onClick={() => navigate(`/accounting/${entityId}/settings/chart-of-accounts`)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Chart of Accounts</h3>
                  <p className="text-sm text-gray-500">Manage account structure & templates</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow border-2"
          onClick={() => navigate(`/accounting/${entityId}/settings/bank-accounts`)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Bank Accounts</h3>
                  <p className="text-sm text-gray-500">Setup & manage bank connections</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold mb-4">Accounting Preferences</h2>
      </div>

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
                  <strong>Example:</strong> A {formatPercent(settings?.late_fee_percent || 1.5)} late fee 
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

      {/* Save Button (bottom) */}
      {hasChanges && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      )}
    </div>
  );
};

const formatPercent = (value) => {
  return `${value}%`;
};

export default EntityAccountingSettingsPage;
