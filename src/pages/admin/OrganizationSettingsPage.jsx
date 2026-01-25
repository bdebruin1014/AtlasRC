import React, { useState } from 'react';
import {
  Building2,
  Save,
  Settings,
  Users,
  Bell,
  Shield,
  Database,
  Link,
  Mail,
  Phone,
  MapPin,
  Globe,
  Clock,
  DollarSign,
  FileText,
  CheckCircle,
  AlertCircle,
  Upload,
  Image,
  Palette,
  Calendar,
  Briefcase,
  Home,
  CreditCard,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  X,
  Plus,
  Trash2,
  Edit3
} from 'lucide-react';

const OrganizationSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [saveStatus, setSaveStatus] = useState(null);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);

  // Organization settings state
  const [settings, setSettings] = useState({
    // General
    companyName: 'Atlas Real Capital',
    legalName: 'Atlas Real Capital, LLC',
    ein: '12-3456789',
    address: '123 Main Street, Suite 400',
    city: 'Charlotte',
    state: 'NC',
    zipCode: '28202',
    phone: '(704) 555-0123',
    email: 'info@atlasrealcapital.com',
    website: 'https://atlasrealcapital.com',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    fiscalYearStart: 'January',

    // Branding
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af',
    logoUrl: '/logo.png',

    // Notifications
    emailNotifications: true,
    dealAlerts: true,
    taskReminders: true,
    weeklyDigest: true,
    projectUpdates: true,
    financialAlerts: true,

    // Security
    twoFactorRequired: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    minPasswordLength: 12,

    // Defaults
    defaultPipelineStage: 'new_lead',
    defaultDueDiligenceDays: 30,
    defaultClosingDays: 45,
    autoAssignTasks: true,
    requireApprovalThreshold: 100000,

    // Departments
    departments: [
      { id: 1, name: 'Acquisitions', head: 'John Smith', members: 8 },
      { id: 2, name: 'Operations', head: 'Sarah Johnson', members: 12 },
      { id: 3, name: 'Finance', head: 'Michael Chen', members: 6 },
      { id: 4, name: 'Construction', head: 'David Wilson', members: 15 },
      { id: 5, name: 'Asset Management', head: 'Emily Brown', members: 5 },
    ],

    // Integrations
    integrations: [
      { id: 1, name: 'QuickBooks Online', type: 'accounting', status: 'connected', lastSync: '2025-01-25T10:30:00' },
      { id: 2, name: 'Salesforce', type: 'crm', status: 'connected', lastSync: '2025-01-25T09:15:00' },
      { id: 3, name: 'DocuSign', type: 'documents', status: 'connected', lastSync: '2025-01-24T16:45:00' },
      { id: 4, name: 'Procore', type: 'construction', status: 'disconnected', lastSync: null },
      { id: 5, name: 'Google Workspace', type: 'productivity', status: 'connected', lastSync: '2025-01-25T11:00:00' },
    ],
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Building2 },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'defaults', label: 'Defaults', icon: Settings },
    { id: 'departments', label: 'Departments', icon: Users },
    { id: 'integrations', label: 'Integrations', icon: Link },
  ];

  const handleSave = () => {
    setSaveStatus('saving');
    // Simulate save
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 3000);
    }, 1000);
  };

  const handleToggle = (field) => {
    setSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const integrationTypes = {
    accounting: { label: 'Accounting', icon: DollarSign, color: 'text-green-600' },
    crm: { label: 'CRM', icon: Users, color: 'text-blue-600' },
    documents: { label: 'Documents', icon: FileText, color: 'text-purple-600' },
    construction: { label: 'Construction', icon: Briefcase, color: 'text-orange-600' },
    productivity: { label: 'Productivity', icon: Calendar, color: 'text-cyan-600' },
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          Company Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Legal Name</label>
            <input
              type="text"
              value={settings.legalName}
              onChange={(e) => handleChange('legalName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">EIN / Tax ID</label>
            <input
              type="text"
              value={settings.ein}
              onChange={(e) => handleChange('ein', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Address
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={settings.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={settings.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
              <input
                type="text"
                value={settings.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600" />
          Contact & Web
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={settings.website}
                onChange={(e) => handleChange('website', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Regional Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
            <select
              value={settings.dateFormat}
              onChange={(e) => handleChange('dateFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fiscal Year Start</label>
            <select
              value={settings.fiscalYearStart}
              onChange={(e) => handleChange('fiscalYearStart', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBrandingSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Image className="w-5 h-5 text-blue-600" />
          Logo
        </h3>
        <div className="flex items-start gap-6">
          <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <Building2 className="w-12 h-12 text-gray-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-4">
              Upload your company logo. Recommended size: 200x200px. Supported formats: PNG, JPG, SVG.
            </p>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Upload className="w-4 h-4" />
              Upload Logo
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-blue-600" />
          Brand Colors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer border border-gray-300"
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Used for buttons, links, and key UI elements</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.secondaryColor}
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer border border-gray-300"
              />
              <input
                type="text"
                value={settings.secondaryColor}
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Used for accents and secondary elements</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
          <div className="flex items-center gap-4">
            <button
              style={{ backgroundColor: settings.primaryColor }}
              className="px-4 py-2 text-white rounded-lg"
            >
              Primary Button
            </button>
            <button
              style={{ backgroundColor: settings.secondaryColor }}
              className="px-4 py-2 text-white rounded-lg"
            >
              Secondary Button
            </button>
            <span style={{ color: settings.primaryColor }} className="font-medium">Primary Link</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-600" />
          Email Notifications
        </h3>
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
            { key: 'dealAlerts', label: 'Deal Alerts', description: 'Get notified when deals reach key stages' },
            { key: 'taskReminders', label: 'Task Reminders', description: 'Receive reminders for upcoming tasks' },
            { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Get a weekly summary of activity' },
            { key: 'projectUpdates', label: 'Project Updates', description: 'Receive updates on project milestones' },
            { key: 'financialAlerts', label: 'Financial Alerts', description: 'Get notified of budget overruns and financial changes' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <button
                onClick={() => handleToggle(item.key)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings[item.key] ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings[item.key] ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Authentication Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">Require Two-Factor Authentication</p>
              <p className="text-sm text-gray-500">All users must enable 2FA to access the system</p>
            </div>
            <button
              onClick={() => handleToggle('twoFactorRequired')}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.twoFactorRequired ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.twoFactorRequired ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Expiry (days)</label>
              <input
                type="number"
                value={settings.passwordExpiry}
                onChange={(e) => handleChange('passwordExpiry', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Password Length</label>
              <input
                type="number"
                value={settings.minPasswordLength}
                onChange={(e) => handleChange('minPasswordLength', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Security Recommendations</h4>
            <ul className="text-sm text-yellow-700 mt-2 space-y-1">
              <li>Enable two-factor authentication for all users</li>
              <li>Set session timeout to 30 minutes or less</li>
              <li>Require password changes every 90 days</li>
              <li>Use minimum password length of 12 characters</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDefaultsSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Home className="w-5 h-5 text-blue-600" />
          Deal Defaults
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Pipeline Stage</label>
            <select
              value={settings.defaultPipelineStage}
              onChange={(e) => handleChange('defaultPipelineStage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="new_lead">New Lead</option>
              <option value="qualification">Qualification</option>
              <option value="analysis">Analysis</option>
              <option value="loi">LOI</option>
              <option value="due_diligence">Due Diligence</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Due Diligence Period (days)</label>
            <input
              type="number"
              value={settings.defaultDueDiligenceDays}
              onChange={(e) => handleChange('defaultDueDiligenceDays', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Closing Period (days)</label>
            <input
              type="number"
              value={settings.defaultClosingDays}
              onChange={(e) => handleChange('defaultClosingDays', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Approval Threshold ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={settings.requireApprovalThreshold}
                onChange={(e) => handleChange('requireApprovalThreshold', parseInt(e.target.value))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Deals above this amount require approval</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          Automation Settings
        </h3>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-gray-900">Auto-assign Tasks</p>
            <p className="text-sm text-gray-500">Automatically assign tasks based on workflow templates</p>
          </div>
          <button
            onClick={() => handleToggle('autoAssignTasks')}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.autoAssignTasks ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                settings.autoAssignTasks ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderDepartments = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Departments
          </h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Add Department
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Department</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Department Head</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Members</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {settings.departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">{dept.name}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{dept.head}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {dept.members} members
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1 text-gray-400 hover:text-blue-600">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Link className="w-5 h-5 text-blue-600" />
            Connected Integrations
          </h3>
          <button
            onClick={() => setShowIntegrationModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Integration
          </button>
        </div>

        <div className="space-y-3">
          {settings.integrations.map((integration) => {
            const typeInfo = integrationTypes[integration.type];
            const TypeIcon = typeInfo?.icon || Link;

            return (
              <div
                key={integration.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-gray-200`}>
                    <TypeIcon className={`w-5 h-5 ${typeInfo?.color || 'text-gray-600'}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{integration.name}</h4>
                    <p className="text-sm text-gray-500">{typeInfo?.label || 'Integration'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {integration.status === 'connected' ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Disconnected</span>
                    </div>
                  )}

                  {integration.lastSync && (
                    <span className="text-xs text-gray-500">
                      Last sync: {new Date(integration.lastSync).toLocaleString()}
                    </span>
                  )}

                  <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-100">
                    {integration.status === 'connected' ? 'Configure' : 'Connect'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          Available Integrations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Yardi', type: 'accounting', description: 'Property management & accounting' },
            { name: 'AppFolio', type: 'accounting', description: 'Property management software' },
            { name: 'HubSpot', type: 'crm', description: 'CRM & marketing automation' },
            { name: 'Slack', type: 'productivity', description: 'Team communication' },
            { name: 'Dropbox', type: 'documents', description: 'Cloud file storage' },
            { name: 'CoStar', type: 'crm', description: 'Commercial real estate data' },
          ].map((item, idx) => {
            const typeInfo = integrationTypes[item.type];
            const TypeIcon = typeInfo?.icon || Link;

            return (
              <div
                key={idx}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center`}>
                    <TypeIcon className={`w-5 h-5 ${typeInfo?.color || 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'branding':
        return renderBrandingSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      case 'defaults':
        return renderDefaultsSettings();
      case 'departments':
        return renderDepartments();
      case 'integrations':
        return renderIntegrations();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Settings className="w-7 h-7 text-blue-600" />
                Organization Settings
              </h1>
              <p className="text-gray-600 mt-1">
                Configure company-wide settings, integrations, and preferences
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saveStatus === 'saving' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : saveStatus === 'saved' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg border border-gray-200 p-2">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <TabIcon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSettingsPage;
