import React, { useState } from 'react';
import { Settings, Save, Building2, Users, DollarSign, Bell, Lock, Link2, Calendar, MapPin, FileText, Mail, Shield, Eye, EyeOff, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const SettingsPage = ({ projectId }) => {
  const [activeSection, setActiveSection] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);

  const [settings, setSettings] = useState({
    // General
    projectName: 'Oakridge Estates',
    projectCode: 'OAK-2024-001',
    projectType: 'residential-development',
    projectStatus: 'active',
    description: '12-unit residential development in Greenville, SC. Mix of 3BR and 4BR single-family homes.',
    address: '1250 Oakridge Drive',
    city: 'Greenville',
    state: 'SC',
    zip: '29601',
    county: 'Greenville County',
    parcelId: 'GC-2024-45678',
    acreage: '4.5',
    zoning: 'R-2 Residential',
    
    // Entity & Ownership
    projectEntity: 'Oakridge Estates LLC',
    projectEntityEin: '87-1234567',
    sponsor: 'VanRock Holdings LLC',
    sponsorOwnership: '72',
    parentEntity: 'VanRock Holdings LLC',
    
    // Financial Settings
    fiscalYearEnd: '12',
    currency: 'USD',
    budgetVersion: 'v3.2',
    contingencyPercent: '5',
    preferredReturnRate: '10',
    promoteSplit: '20',
    
    // Timeline
    acquisitionDate: '2024-01-15',
    constructionStart: '2024-03-15',
    estimatedCompletion: '2025-06-30',
    projectedSellout: '2025-09-30',
    
    // Notifications
    emailNotifications: true,
    weeklyDigest: true,
    budgetAlerts: true,
    budgetAlertThreshold: '5',
    milestoneNotifications: true,
    investorUpdates: true,
    
    // Access & Permissions
    defaultAccess: 'team-only',
    investorPortalEnabled: true,
    documentSharing: true,
    
    // Integrations
    quickbooksConnected: true,
    quickbooksLastSync: '2024-12-28 08:30 AM',
    sharepointConnected: true,
    sharepointFolder: '/VanRock/Projects/Oakridge Estates',
  });

  const sections = [
    { id: 'general', name: 'General', icon: Building2 },
    { id: 'entity', name: 'Entity & Ownership', icon: Users },
    { id: 'financial', name: 'Financial Settings', icon: DollarSign },
    { id: 'timeline', name: 'Timeline', icon: Calendar },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'access', name: 'Access & Permissions', icon: Lock },
    { id: 'integrations', name: 'Integrations', icon: Link2 },
    { id: 'danger', name: 'Danger Zone', icon: AlertTriangle },
  ];

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Save logic here
    setHasChanges(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Project Settings</h1>
          <p className="text-sm text-gray-500">Configure project settings and preferences</p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <span className="text-sm text-amber-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />Unsaved changes
            </span>
          )}
          <Button className="bg-[#047857] hover:bg-[#065f46]" disabled={!hasChanges} onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" />Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Sidebar Navigation */}
        <div className="bg-white border rounded-lg p-4">
          <nav className="space-y-1">
            {sections.map(section => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm",
                    activeSection === section.id ? "bg-[#047857] text-white" : "hover:bg-gray-100",
                    section.id === 'danger' && activeSection !== section.id && "text-red-600"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {section.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="col-span-4">
          {/* General Settings */}
          {activeSection === 'general' && (
            <div className="bg-white border rounded-lg p-6 space-y-6">
              <h3 className="font-semibold text-lg border-b pb-2">General Settings</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Project Name *</label>
                  <Input value={settings.projectName} onChange={(e) => handleChange('projectName', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Project Code</label>
                  <Input value={settings.projectCode} onChange={(e) => handleChange('projectCode', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Project Type</label>
                  <select className="w-full border rounded-md px-3 py-2" value={settings.projectType} onChange={(e) => handleChange('projectType', e.target.value)}>
                    <option value="residential-development">Residential Development</option>
                    <option value="lot-development">Lot Development</option>
                    <option value="spec-build">Spec Build</option>
                    <option value="fix-flip">Fix & Flip</option>
                    <option value="build-to-rent">Build to Rent</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Status</label>
                  <select className="w-full border rounded-md px-3 py-2" value={settings.projectStatus} onChange={(e) => handleChange('projectStatus', e.target.value)}>
                    <option value="planning">Planning</option>
                    <option value="acquisition">Acquisition</option>
                    <option value="active">Active / Construction</option>
                    <option value="sales">Sales / Disposition</option>
                    <option value="closed">Closed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Description</label>
                <textarea className="w-full border rounded-md px-3 py-2" rows={3} value={settings.description} onChange={(e) => handleChange('description', e.target.value)} />
              </div>

              <h4 className="font-medium pt-4 border-t">Property Location</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Street Address</label>
                  <Input value={settings.address} onChange={(e) => handleChange('address', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">City</label>
                  <Input value={settings.city} onChange={(e) => handleChange('city', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">State</label>
                  <Input value={settings.state} onChange={(e) => handleChange('state', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">ZIP Code</label>
                  <Input value={settings.zip} onChange={(e) => handleChange('zip', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">County</label>
                  <Input value={settings.county} onChange={(e) => handleChange('county', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Parcel ID</label>
                  <Input value={settings.parcelId} onChange={(e) => handleChange('parcelId', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Acreage</label>
                  <Input value={settings.acreage} onChange={(e) => handleChange('acreage', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Zoning</label>
                  <Input value={settings.zoning} onChange={(e) => handleChange('zoning', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Entity & Ownership */}
          {activeSection === 'entity' && (
            <div className="bg-white border rounded-lg p-6 space-y-6">
              <h3 className="font-semibold text-lg border-b pb-2">Entity & Ownership</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Project Entity (SPE)</label>
                  <Input value={settings.projectEntity} onChange={(e) => handleChange('projectEntity', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Entity EIN</label>
                  <Input value={settings.projectEntityEin} onChange={(e) => handleChange('projectEntityEin', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Sponsor / Developer</label>
                  <Input value={settings.sponsor} onChange={(e) => handleChange('sponsor', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Sponsor Ownership %</label>
                  <Input type="number" value={settings.sponsorOwnership} onChange={(e) => handleChange('sponsorOwnership', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Parent Entity</label>
                  <Input value={settings.parentEntity} onChange={(e) => handleChange('parentEntity', e.target.value)} />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Ownership Structure:</strong> This project is owned by {settings.projectEntity}, which is a subsidiary of {settings.parentEntity}. 
                  Sponsor ownership is {settings.sponsorOwnership}%, with the remaining {100 - parseInt(settings.sponsorOwnership)}% held by LP investors.
                </p>
              </div>
            </div>
          )}

          {/* Financial Settings */}
          {activeSection === 'financial' && (
            <div className="bg-white border rounded-lg p-6 space-y-6">
              <h3 className="font-semibold text-lg border-b pb-2">Financial Settings</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Fiscal Year End Month</label>
                  <select className="w-full border rounded-md px-3 py-2" value={settings.fiscalYearEnd} onChange={(e) => handleChange('fiscalYearEnd', e.target.value)}>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1)}>{new Date(2024, i).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Currency</label>
                  <select className="w-full border rounded-md px-3 py-2" value={settings.currency} onChange={(e) => handleChange('currency', e.target.value)}>
                    <option value="USD">USD - US Dollar</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Current Budget Version</label>
                  <Input value={settings.budgetVersion} onChange={(e) => handleChange('budgetVersion', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Default Contingency %</label>
                  <Input type="number" value={settings.contingencyPercent} onChange={(e) => handleChange('contingencyPercent', e.target.value)} />
                </div>
              </div>

              <h4 className="font-medium pt-4 border-t">Waterfall Settings</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">LP Preferred Return %</label>
                  <Input type="number" value={settings.preferredReturnRate} onChange={(e) => handleChange('preferredReturnRate', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Sponsor Promote %</label>
                  <Input type="number" value={settings.promoteSplit} onChange={(e) => handleChange('promoteSplit', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          {activeSection === 'timeline' && (
            <div className="bg-white border rounded-lg p-6 space-y-6">
              <h3 className="font-semibold text-lg border-b pb-2">Project Timeline</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Acquisition Date</label>
                  <Input type="date" value={settings.acquisitionDate} onChange={(e) => handleChange('acquisitionDate', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Construction Start</label>
                  <Input type="date" value={settings.constructionStart} onChange={(e) => handleChange('constructionStart', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Estimated Completion</label>
                  <Input type="date" value={settings.estimatedCompletion} onChange={(e) => handleChange('estimatedCompletion', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Projected Sellout</label>
                  <Input type="date" value={settings.projectedSellout} onChange={(e) => handleChange('projectedSellout', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <div className="bg-white border rounded-lg p-6 space-y-6">
              <h3 className="font-semibold text-lg border-b pb-2">Notification Settings</h3>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Email Notifications</p>
                    <p className="text-xs text-gray-500">Receive email updates about project activity</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5" checked={settings.emailNotifications} onChange={(e) => handleChange('emailNotifications', e.target.checked)} />
                </label>

                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Weekly Digest</p>
                    <p className="text-xs text-gray-500">Receive a weekly summary email every Monday</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5" checked={settings.weeklyDigest} onChange={(e) => handleChange('weeklyDigest', e.target.checked)} />
                </label>

                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Budget Alerts</p>
                    <p className="text-xs text-gray-500">Alert when budget variance exceeds threshold</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input type="number" className="w-16" value={settings.budgetAlertThreshold} onChange={(e) => handleChange('budgetAlertThreshold', e.target.value)} />
                    <span className="text-sm">%</span>
                    <input type="checkbox" className="w-5 h-5" checked={settings.budgetAlerts} onChange={(e) => handleChange('budgetAlerts', e.target.checked)} />
                  </div>
                </label>

                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Milestone Notifications</p>
                    <p className="text-xs text-gray-500">Notify when project milestones are reached</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5" checked={settings.milestoneNotifications} onChange={(e) => handleChange('milestoneNotifications', e.target.checked)} />
                </label>

                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Investor Updates</p>
                    <p className="text-xs text-gray-500">Include investors on project updates</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5" checked={settings.investorUpdates} onChange={(e) => handleChange('investorUpdates', e.target.checked)} />
                </label>
              </div>
            </div>
          )}

          {/* Access & Permissions */}
          {activeSection === 'access' && (
            <div className="bg-white border rounded-lg p-6 space-y-6">
              <h3 className="font-semibold text-lg border-b pb-2">Access & Permissions</h3>
              
              <div>
                <label className="text-sm font-medium block mb-1">Default Access Level</label>
                <select className="w-full border rounded-md px-3 py-2" value={settings.defaultAccess} onChange={(e) => handleChange('defaultAccess', e.target.value)}>
                  <option value="private">Private - Only owner</option>
                  <option value="team-only">Team Only - Project team members</option>
                  <option value="organization">Organization - All company members</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Investor Portal</p>
                    <p className="text-xs text-gray-500">Enable investor portal access for LP investors</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5" checked={settings.investorPortalEnabled} onChange={(e) => handleChange('investorPortalEnabled', e.target.checked)} />
                </label>

                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Document Sharing</p>
                    <p className="text-xs text-gray-500">Allow documents to be shared externally</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5" checked={settings.documentSharing} onChange={(e) => handleChange('documentSharing', e.target.checked)} />
                </label>
              </div>
            </div>
          )}

          {/* Integrations */}
          {activeSection === 'integrations' && (
            <div className="bg-white border rounded-lg p-6 space-y-6">
              <h3 className="font-semibold text-lg border-b pb-2">Integrations</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">QuickBooks</p>
                      <p className="text-xs text-gray-500">Accounting integration</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {settings.quickbooksConnected ? (
                      <>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Connected</span>
                        <p className="text-xs text-gray-400 mt-1">Last sync: {settings.quickbooksLastSync}</p>
                      </>
                    ) : (
                      <Button size="sm" variant="outline">Connect</Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">SharePoint</p>
                      <p className="text-xs text-gray-500">Document storage</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {settings.sharepointConnected ? (
                      <>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Connected</span>
                        <p className="text-xs text-gray-400 mt-1">{settings.sharepointFolder}</p>
                      </>
                    ) : (
                      <Button size="sm" variant="outline">Connect</Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Danger Zone */}
          {activeSection === 'danger' && (
            <div className="bg-white border border-red-200 rounded-lg p-6 space-y-6">
              <h3 className="font-semibold text-lg text-red-600 border-b border-red-200 pb-2">Danger Zone</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                  <div>
                    <p className="font-medium">Archive Project</p>
                    <p className="text-sm text-gray-500">Mark this project as archived. It will be hidden from active views.</p>
                  </div>
                  <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">Archive</Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                  <div>
                    <p className="font-medium">Export All Data</p>
                    <p className="text-sm text-gray-500">Download all project data as a ZIP file.</p>
                  </div>
                  <Button variant="outline">Export Data</Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-red-300 rounded-lg bg-red-50">
                  <div>
                    <p className="font-medium text-red-700">Delete Project</p>
                    <p className="text-sm text-red-600">Permanently delete this project and all associated data. This cannot be undone.</p>
                  </div>
                  <Button variant="outline" className="border-red-500 text-red-600 hover:bg-red-100">
                    <Trash2 className="w-4 h-4 mr-1" />Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
