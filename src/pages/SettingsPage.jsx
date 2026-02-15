import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import {
  User, Building, Users, Bell, Plug, Palette, CreditCard,
  Save, Lock, Monitor, Mail, Settings, Plus, Edit2, Trash2,
  Check, X, Sun, Moon, Loader2, ExternalLink, Shield,
  Calendar, Cloud, RefreshCw, Unlink, Link2, CheckCircle2, Info
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import EditableField from '@/components/EditableField';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  isOutlookConfigured,
  getAuthorizationUrl as getOutlookAuthUrl,
  getOutlookConnection,
  disconnectOutlook,
} from '@/services/outlookService';
import { isSharePointConfigured, getSharePointStatus } from '@/services/sharepointService';

const SettingsPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  // Company settings state
  const [companyData, setCompanyData] = useState({
    name: 'Atlas Development Co.',
    legalName: 'Atlas Development Corporation',
    ein: '12-3456789',
    address: '123 Main Street, Suite 400',
    city: 'San Francisco',
    state: 'CA',
    zip: '94105',
    phone: '(555) 123-4567',
    website: 'https://atlasdev.com',
    fiscalYearEnd: '12',
  });

  // Team members state
  const [teamMembers, setTeamMembers] = useState([
    { id: '1', name: 'Alex Johnson', email: 'alex@atlasdev.com', role: 'admin', status: 'active' },
    { id: '2', name: 'Sarah Miller', email: 'sarah@atlasdev.com', role: 'manager', status: 'active' },
    { id: '3', name: 'Mike Chen', email: 'mike@atlasdev.com', role: 'analyst', status: 'active' },
    { id: '4', name: 'Emily Davis', email: 'emily@atlasdev.com', role: 'viewer', status: 'pending' },
  ]);

  // Integrations state
  const [integrations, setIntegrations] = useState([
    { id: 'quickbooks', name: 'QuickBooks', description: 'Accounting & invoicing', connected: true, icon: '📊' },
    { id: 'docusign', name: 'DocuSign', description: 'E-signatures', connected: false, icon: '✍️' },
    { id: 'dropbox', name: 'Dropbox', description: 'File storage', connected: true, icon: '📁' },
    { id: 'slack', name: 'Slack', description: 'Team communication', connected: false, icon: '💬' },
    { id: 'google', name: 'Google Workspace', description: 'Email & calendar', connected: true, icon: '📧' },
    { id: 'zillow', name: 'Zillow', description: 'Property data', connected: false, icon: '🏠' },
  ]);

  // Appearance state
  const [appearance, setAppearance] = useState({
    theme: 'light',
    accentColor: 'emerald',
    compactMode: false,
    animations: true,
    sidebarCollapsed: false,
  });

  // Billing state
  const [billingPlan, setBillingPlan] = useState('professional');

  // Microsoft 365 integration state
  const { user } = useAuth();
  const [outlookConnection, setOutlookConnection] = useState(null);
  const [sharePointStatus, setSharePointStatus] = useState(null);
  const [outlookLoading, setOutlookLoading] = useState(false);
  const [outlookConnecting, setOutlookConnecting] = useState(false);
  const [outlookDisconnecting, setOutlookDisconnecting] = useState(false);

  // Load saved settings on mount
  useEffect(() => {
    const loadSavedSettings = async () => {
      if (!user?.id) return;
      try {
        // Load user profile settings
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('settings')
          .eq('id', user.id)
          .single();

        if (profile?.settings?.appearance) {
          setAppearance(prev => ({ ...prev, ...profile.settings.appearance }));
        }

        // Load company settings
        const { data: companySettings } = await supabase
          .from('admin_settings')
          .select('value')
          .eq('key', 'company_settings')
          .single();

        if (companySettings?.value) {
          setCompanyData(prev => ({ ...prev, ...companySettings.value }));
        }
      } catch (err) {
        // Silently fall back to defaults for demo mode
        console.debug('Using default settings');
      }
    };

    loadSavedSettings();
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadOutlookConnection();
    }
    loadSharePointStatus();
  }, [user?.id]);

  const loadOutlookConnection = async () => {
    if (!user?.id) return;
    setOutlookLoading(true);
    try {
      const { data } = await getOutlookConnection(user.id);
      setOutlookConnection(data);
    } catch (err) {
      console.error('Error loading Outlook connection:', err);
    } finally {
      setOutlookLoading(false);
    }
  };

  const loadSharePointStatus = async () => {
    try {
      const status = await getSharePointStatus();
      setSharePointStatus(status);
    } catch (err) {
      console.error('Error loading SharePoint status:', err);
    }
  };

  const handleConnectOutlook = () => {
    if (!isOutlookConfigured()) {
      toast({ title: 'Not Configured', description: 'Outlook integration is not configured by your administrator.', variant: 'destructive' });
      return;
    }
    setOutlookConnecting(true);
    const state = crypto.randomUUID();
    sessionStorage.setItem('outlook_auth_state', state);
    const authUrl = getOutlookAuthUrl(state);
    const popup = window.open(authUrl, 'Outlook Login', 'width=600,height=700');

    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'outlook-auth-success') {
        window.removeEventListener('message', handleMessage);
        setOutlookConnecting(false);
        loadOutlookConnection();
        toast({ title: 'Outlook Connected', description: 'Your Outlook account has been linked. Email and calendar features are now active.' });
      }
    };
    window.addEventListener('message', handleMessage);

    const pollInterval = setInterval(() => {
      if (popup?.closed) {
        clearInterval(pollInterval);
        window.removeEventListener('message', handleMessage);
        setOutlookConnecting(false);
        loadOutlookConnection();
      }
    }, 1000);
  };

  const handleDisconnectOutlook = async () => {
    if (!confirm('Disconnect your Outlook account? You will lose access to email and calendar features.')) return;
    setOutlookDisconnecting(true);
    try {
      await disconnectOutlook(user.id);
      setOutlookConnection(null);
      toast({ title: 'Outlook Disconnected', description: 'Your Outlook account has been unlinked.' });
    } catch (err) {
      console.error('Error disconnecting Outlook:', err);
      toast({ title: 'Error', description: 'Failed to disconnect Outlook.', variant: 'destructive' });
    } finally {
      setOutlookDisconnecting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save user profile settings
      if (user?.id) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: user.id,
            settings: {
              appearance,
              notifications: activeTab === 'notifications' ? true : undefined,
            },
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });

        if (profileError) {
          console.error('Error saving profile settings:', profileError);
        }

        // Save organization/company settings
        const { error: orgError } = await supabase
          .from('admin_settings')
          .upsert({
            key: 'company_settings',
            value: companyData,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'key' });

        if (orgError) {
          console.error('Error saving company settings:', orgError);
        }
      }

      toast({
        title: 'Settings Saved',
        description: 'Your changes have been saved successfully.',
      });
    } catch (err) {
      console.error('Error saving settings:', err);
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleIntegration = (integrationId) => {
    setIntegrations(prev =>
      prev.map(int =>
        int.id === integrationId
          ? { ...int, connected: !int.connected }
          : int
      )
    );
  };

  const handleRemoveTeamMember = (memberId) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    setTeamMembers(prev => prev.filter(m => m.id !== memberId));
    toast({
      title: 'Member Removed',
      description: 'Team member has been removed.',
    });
  };

  // Invite member state & handler
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({ name: '', email: '', role: 'viewer' });
  const [inviting, setInviting] = useState(false);

  const handleInviteMember = async () => {
    if (!inviteData.name || !inviteData.email) return;
    setInviting(true);
    try {
      // Add to local state immediately
      const newMember = {
        id: crypto.randomUUID(),
        name: inviteData.name,
        email: inviteData.email,
        role: inviteData.role,
        status: 'pending',
      };
      setTeamMembers(prev => [...prev, newMember]);

      // Persist to Supabase
      if (user?.id) {
        await supabase.from('team_members').insert({
          id: newMember.id,
          name: inviteData.name,
          email: inviteData.email,
          role: inviteData.role,
          status: 'pending',
          invited_by: user.id,
        });
      }

      toast({ title: 'Invitation Sent', description: `${inviteData.name} has been invited to join the team.` });
      setShowInviteModal(false);
      setInviteData({ name: '', email: '', role: 'viewer' });
    } catch (err) {
      console.error('Error inviting member:', err);
      toast({ title: 'Error', description: 'Failed to send invitation.', variant: 'destructive' });
    } finally {
      setInviting(false);
    }
  };

  // Avatar upload handler
  const handleAvatarUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'File too large', description: 'Avatar must be under 5MB.', variant: 'destructive' });
        return;
      }

      try {
        if (user?.id) {
          const fileExt = file.name.split('.').pop();
          const filePath = `avatars/${user.id}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true });

          if (!uploadError) {
            toast({ title: 'Avatar Updated', description: 'Your profile photo has been updated.' });
          }
        }
      } catch (err) {
        console.debug('Avatar upload - using local preview only');
      }

      // Show local preview immediately
      const reader = new FileReader();
      reader.onload = (ev) => {
        const avatarEl = document.querySelector('[data-avatar]');
        if (avatarEl) {
          avatarEl.style.backgroundImage = `url(${ev.target.result})`;
          avatarEl.style.backgroundSize = 'cover';
          avatarEl.textContent = '';
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const TABS = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'company', label: 'Company Settings', icon: Building },
    { id: 'team', label: 'Team & Permissions', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Plug },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
  ];

  return (
    <>
      <Helmet>
        <title>Settings | AtlasDev</title>
      </Helmet>

      <div className="flex h-full bg-[#EDF2F7] overflow-hidden">
         {/* Sidebar */}
         <div className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
            <div className="p-6 border-b border-gray-200">
               <h2 className="text-xl font-bold text-gray-900">Settings</h2>
            </div>
            <div className="p-4 space-y-1 overflow-y-auto">
               {TABS.map(tab => (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                        activeTab === tab.id 
                           ? "bg-emerald-50 text-emerald-700" 
                           : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                     )}
                  >
                     <tab.icon className="w-4 h-4" />
                     {tab.label}
                  </button>
               ))}
            </div>
         </div>

         {/* Content */}
         <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-3xl mx-auto">
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                     <h2 className="text-xl font-bold text-gray-900">{TABS.find(t => t.id === activeTab)?.label}</h2>
                     <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {saving ? 'Saving...' : 'Save Changes'}
                     </Button>
                  </div>

                  <div className="p-8">
                     {activeTab === 'profile' && (
                        <div className="space-y-8">
                           <div className="flex items-center gap-6">
                              <div data-avatar className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-2xl font-bold text-emerald-600 border-4 border-white shadow-sm">
                                 AJ
                              </div>
                              <div>
                                 <Button variant="outline" size="sm" className="mr-2" onClick={handleAvatarUpload}>Change Avatar</Button>
                                 <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => {
                                    const avatarEl = document.querySelector('[data-avatar]');
                                    if (avatarEl) {
                                       avatarEl.style.backgroundImage = '';
                                       avatarEl.textContent = 'AJ';
                                    }
                                    toast({ title: 'Avatar Removed', description: 'Your profile photo has been removed.' });
                                 }}>Remove</Button>
                              </div>
                           </div>
                           
                           <div className="grid grid-cols-2 gap-6">
                              <EditableField label="First Name" defaultValue="Alex" />
                              <EditableField label="Last Name" defaultValue="Johnson" />
                              <EditableField label="Email Address" defaultValue="alex@atlasdev.com" />
                              <EditableField label="Phone Number" defaultValue="(555) 123-4567" />
                           </div>

                           <div className="pt-6 border-t border-gray-100">
                              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                 <Lock className="w-4 h-4 text-gray-400" /> Security
                              </h3>
                              <Button variant="outline" className="w-full sm:w-auto">Change Password</Button>
                           </div>
                        </div>
                     )}

                     {activeTab === 'notifications' && (
                        <div className="space-y-6">
                           <div className="space-y-4">
                              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Email Notifications</h3>
                              {['Daily Digest', 'New Project Assignments', 'Task Due Reminders', 'Mentioned in Comments'].map((item, i) => (
                                 <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50">
                                    <div className="flex items-center gap-3">
                                       <Mail className="w-4 h-4 text-gray-400" />
                                       <span className="text-sm text-gray-700">{item}</span>
                                    </div>
                                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {activeTab === 'company' && (
                        <div className="space-y-6">
                           <div className="grid grid-cols-2 gap-6">
                              <div className="col-span-2 sm:col-span-1">
                                 <Label htmlFor="companyName">Company Name</Label>
                                 <Input
                                    id="companyName"
                                    value={companyData.name}
                                    onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                                    className="mt-1"
                                 />
                              </div>
                              <div className="col-span-2 sm:col-span-1">
                                 <Label htmlFor="legalName">Legal Name</Label>
                                 <Input
                                    id="legalName"
                                    value={companyData.legalName}
                                    onChange={(e) => setCompanyData({ ...companyData, legalName: e.target.value })}
                                    className="mt-1"
                                 />
                              </div>
                              <div className="col-span-2 sm:col-span-1">
                                 <Label htmlFor="ein">EIN / Tax ID</Label>
                                 <Input
                                    id="ein"
                                    value={companyData.ein}
                                    onChange={(e) => setCompanyData({ ...companyData, ein: e.target.value })}
                                    className="mt-1"
                                 />
                              </div>
                              <div className="col-span-2 sm:col-span-1">
                                 <Label htmlFor="phone">Phone Number</Label>
                                 <Input
                                    id="phone"
                                    value={companyData.phone}
                                    onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                                    className="mt-1"
                                 />
                              </div>
                           </div>

                           <div className="pt-6 border-t border-gray-100">
                              <h3 className="text-sm font-bold text-gray-900 mb-4">Address</h3>
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="col-span-2">
                                    <Label htmlFor="address">Street Address</Label>
                                    <Input
                                       id="address"
                                       value={companyData.address}
                                       onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                                       className="mt-1"
                                    />
                                 </div>
                                 <div>
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                       id="city"
                                       value={companyData.city}
                                       onChange={(e) => setCompanyData({ ...companyData, city: e.target.value })}
                                       className="mt-1"
                                    />
                                 </div>
                                 <div className="grid grid-cols-2 gap-4">
                                    <div>
                                       <Label htmlFor="state">State</Label>
                                       <Input
                                          id="state"
                                          value={companyData.state}
                                          onChange={(e) => setCompanyData({ ...companyData, state: e.target.value })}
                                          className="mt-1"
                                       />
                                    </div>
                                    <div>
                                       <Label htmlFor="zip">ZIP</Label>
                                       <Input
                                          id="zip"
                                          value={companyData.zip}
                                          onChange={(e) => setCompanyData({ ...companyData, zip: e.target.value })}
                                          className="mt-1"
                                       />
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="pt-6 border-t border-gray-100">
                              <h3 className="text-sm font-bold text-gray-900 mb-4">Other</h3>
                              <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <Label htmlFor="website">Website</Label>
                                    <Input
                                       id="website"
                                       value={companyData.website}
                                       onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                                       className="mt-1"
                                    />
                                 </div>
                                 <div>
                                    <Label htmlFor="fiscalYear">Fiscal Year End</Label>
                                    <Select
                                       value={companyData.fiscalYearEnd}
                                       onValueChange={(value) => setCompanyData({ ...companyData, fiscalYearEnd: value })}
                                    >
                                       <SelectTrigger className="mt-1">
                                          <SelectValue />
                                       </SelectTrigger>
                                       <SelectContent>
                                          {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, i) => (
                                             <SelectItem key={i} value={String(i + 1)}>{month}</SelectItem>
                                          ))}
                                       </SelectContent>
                                    </Select>
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}

                     {activeTab === 'team' && (
                        <div className="space-y-6">
                           <div className="flex justify-between items-center">
                              <p className="text-sm text-gray-500">Manage team members and their permissions</p>
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowInviteModal(true)}>
                                 <Plus className="w-4 h-4 mr-1" /> Invite Member
                              </Button>
                           </div>

                           <div className="border rounded-lg overflow-hidden">
                              <table className="w-full">
                                 <thead className="bg-gray-50">
                                    <tr>
                                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                       <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-gray-100">
                                    {teamMembers.map((member) => (
                                       <tr key={member.id} className="hover:bg-gray-50">
                                          <td className="px-4 py-3">
                                             <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-medium text-emerald-600">
                                                   {member.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                   <div className="font-medium text-gray-900 text-sm">{member.name}</div>
                                                   <div className="text-xs text-gray-500">{member.email}</div>
                                                </div>
                                             </div>
                                          </td>
                                          <td className="px-4 py-3">
                                             <Select
                                                value={member.role}
                                                onValueChange={(value) => {
                                                   setTeamMembers(prev => prev.map(m =>
                                                      m.id === member.id ? { ...m, role: value } : m
                                                   ));
                                                }}
                                             >
                                                <SelectTrigger className="w-28 h-8 text-xs">
                                                   <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                   <SelectItem value="admin">Admin</SelectItem>
                                                   <SelectItem value="manager">Manager</SelectItem>
                                                   <SelectItem value="analyst">Analyst</SelectItem>
                                                   <SelectItem value="viewer">Viewer</SelectItem>
                                                </SelectContent>
                                             </Select>
                                          </td>
                                          <td className="px-4 py-3">
                                             <Badge className={member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                                {member.status}
                                             </Badge>
                                          </td>
                                          <td className="px-4 py-3 text-right">
                                             <Button variant="ghost" size="sm" onClick={() => handleRemoveTeamMember(member.id)}>
                                                <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
                                             </Button>
                                          </td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>

                           <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-start gap-3">
                                 <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
                                 <div>
                                    <h4 className="text-sm font-medium text-gray-900">Role Permissions</h4>
                                    <p className="text-xs text-gray-500 mt-1">
                                       <strong>Admin:</strong> Full access | <strong>Manager:</strong> Create & edit | <strong>Analyst:</strong> Edit assigned | <strong>Viewer:</strong> Read-only
                                    </p>
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}

                     {activeTab === 'integrations' && (
                        <div className="space-y-6">
                           <p className="text-sm text-gray-500">Connect your Microsoft 365 account to enable email, calendar, and file features</p>

                           {/* Microsoft 365 - Outlook & Calendar */}
                           <div className="space-y-4">
                              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Microsoft 365</h3>

                              {/* Outlook / Email + Calendar */}
                              <div className="border rounded-lg overflow-hidden">
                                 <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                          <Mail className="w-5 h-5 text-white" />
                                       </div>
                                       <div>
                                          <div className="font-medium text-gray-900">Outlook Email & Calendar</div>
                                          <div className="text-sm text-gray-500">Access your emails and calendar events within Atlas</div>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                       {outlookConnection?.is_connected ? (
                                          <>
                                             <Badge className="bg-green-100 text-green-800">
                                                <Check className="w-3 h-3 mr-1" /> Connected
                                             </Badge>
                                             <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleDisconnectOutlook}
                                                disabled={outlookDisconnecting}
                                                className="text-red-600 hover:bg-red-50 border-red-200"
                                             >
                                                {outlookDisconnecting ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Unlink className="w-3 h-3 mr-1" />}
                                                Disconnect
                                             </Button>
                                          </>
                                       ) : (
                                          <Button
                                             size="sm"
                                             onClick={handleConnectOutlook}
                                             disabled={outlookConnecting}
                                             className="bg-emerald-600 hover:bg-emerald-700"
                                          >
                                             {outlookConnecting ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Link2 className="w-3 h-3 mr-1" />}
                                             Connect Outlook
                                          </Button>
                                       )}
                                    </div>
                                 </div>

                                 {outlookConnection?.is_connected ? (
                                    <div className="p-4 space-y-3">
                                       <div className="grid grid-cols-2 gap-4">
                                          <div className="p-3 bg-gray-50 rounded-lg">
                                             <div className="text-xs text-gray-500 mb-1">Connected Account</div>
                                             <div className="text-sm font-medium text-gray-900">{outlookConnection.display_name || outlookConnection.email}</div>
                                             <div className="text-xs text-gray-500">{outlookConnection.email}</div>
                                          </div>
                                          <div className="p-3 bg-gray-50 rounded-lg">
                                             <div className="text-xs text-gray-500 mb-1">Connected Since</div>
                                             <div className="text-sm font-medium text-gray-900">
                                                {outlookConnection.updated_at ? new Date(outlookConnection.updated_at).toLocaleDateString() : '—'}
                                             </div>
                                          </div>
                                       </div>
                                       <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                          <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                          <div className="text-xs text-blue-700">
                                             <strong>Active features:</strong> View/send emails from projects, calendar event sync, create meetings, link emails to projects.
                                          </div>
                                       </div>
                                    </div>
                                 ) : (
                                    <div className="p-4">
                                       <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                                          <Info className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                          <div className="text-xs text-gray-600">
                                             Connect your Outlook account to view emails, manage your calendar, and link communications to projects — all from within Atlas.
                                          </div>
                                       </div>
                                    </div>
                                 )}
                              </div>

                              {/* SharePoint - Org-wide (read-only for users) */}
                              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                                       <Cloud className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                       <div className="font-medium text-gray-900">SharePoint</div>
                                       <div className="text-sm text-gray-500">Organization document storage (managed by admin)</div>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-3">
                                    {sharePointStatus?.connected ? (
                                       <Badge className="bg-green-100 text-green-800">
                                          <Check className="w-3 h-3 mr-1" /> Active
                                       </Badge>
                                    ) : (
                                       <Badge className="bg-gray-100 text-gray-600">
                                          Not Connected
                                       </Badge>
                                    )}
                                 </div>
                              </div>
                           </div>

                           {/* Other Integrations */}
                           <div className="space-y-4">
                              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Other Integrations</h3>
                              <div className="grid gap-4">
                                 {integrations.map((integration) => (
                                    <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                       <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl">
                                             {integration.icon}
                                          </div>
                                          <div>
                                             <div className="font-medium text-gray-900">{integration.name}</div>
                                             <div className="text-sm text-gray-500">{integration.description}</div>
                                          </div>
                                       </div>
                                       <div className="flex items-center gap-3">
                                          {integration.connected && (
                                             <Badge className="bg-green-100 text-green-800">
                                                <Check className="w-3 h-3 mr-1" /> Connected
                                             </Badge>
                                          )}
                                          <Button
                                             variant={integration.connected ? "outline" : "default"}
                                             size="sm"
                                             onClick={() => handleToggleIntegration(integration.id)}
                                             className={!integration.connected ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                                          >
                                             {integration.connected ? 'Configure' : 'Connect'}
                                          </Button>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                     )}

                     {activeTab === 'appearance' && (
                        <div className="space-y-6">
                           <div className="space-y-4">
                              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Theme</h3>
                              <div className="flex gap-4">
                                 <button
                                    onClick={() => setAppearance({ ...appearance, theme: 'light' })}
                                    className={cn(
                                       "flex-1 p-4 rounded-lg border-2 transition-all",
                                       appearance.theme === 'light' ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"
                                    )}
                                 >
                                    <Sun className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                                    <div className="text-sm font-medium">Light</div>
                                 </button>
                                 <button
                                    onClick={() => setAppearance({ ...appearance, theme: 'dark' })}
                                    className={cn(
                                       "flex-1 p-4 rounded-lg border-2 transition-all",
                                       appearance.theme === 'dark' ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"
                                    )}
                                 >
                                    <Moon className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                                    <div className="text-sm font-medium">Dark</div>
                                 </button>
                                 <button
                                    onClick={() => setAppearance({ ...appearance, theme: 'system' })}
                                    className={cn(
                                       "flex-1 p-4 rounded-lg border-2 transition-all",
                                       appearance.theme === 'system' ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"
                                    )}
                                 >
                                    <Monitor className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                                    <div className="text-sm font-medium">System</div>
                                 </button>
                              </div>
                           </div>

                           <div className="pt-6 border-t border-gray-100 space-y-4">
                              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Accent Color</h3>
                              <div className="flex gap-3">
                                 {[
                                    { id: 'emerald', color: 'bg-emerald-500' },
                                    { id: 'blue', color: 'bg-blue-500' },
                                    { id: 'purple', color: 'bg-purple-500' },
                                    { id: 'orange', color: 'bg-orange-500' },
                                    { id: 'pink', color: 'bg-pink-500' },
                                 ].map((c) => (
                                    <button
                                       key={c.id}
                                       onClick={() => setAppearance({ ...appearance, accentColor: c.id })}
                                       className={cn(
                                          "w-10 h-10 rounded-full transition-all",
                                          c.color,
                                          appearance.accentColor === c.id ? "ring-2 ring-offset-2 ring-gray-400" : ""
                                       )}
                                    />
                                 ))}
                              </div>
                           </div>

                           <div className="pt-6 border-t border-gray-100 space-y-4">
                              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Display Options</h3>
                              <div className="space-y-4">
                                 <div className="flex items-center justify-between">
                                    <div>
                                       <div className="text-sm font-medium text-gray-900">Compact Mode</div>
                                       <div className="text-xs text-gray-500">Reduce spacing for more content</div>
                                    </div>
                                    <Switch
                                       checked={appearance.compactMode}
                                       onCheckedChange={(checked) => setAppearance({ ...appearance, compactMode: checked })}
                                    />
                                 </div>
                                 <div className="flex items-center justify-between">
                                    <div>
                                       <div className="text-sm font-medium text-gray-900">Animations</div>
                                       <div className="text-xs text-gray-500">Enable smooth transitions</div>
                                    </div>
                                    <Switch
                                       checked={appearance.animations}
                                       onCheckedChange={(checked) => setAppearance({ ...appearance, animations: checked })}
                                    />
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}

                     {activeTab === 'billing' && (
                        <div className="space-y-6">
                           <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                 <div>
                                    <div className="text-sm text-emerald-600 font-medium">Current Plan</div>
                                    <div className="text-2xl font-bold text-emerald-700">Professional</div>
                                    <div className="text-sm text-emerald-600">$99/month • Billed annually</div>
                                 </div>
                                 <Badge className="bg-emerald-600 text-white">Active</Badge>
                              </div>
                           </div>

                           <div className="pt-6 border-t border-gray-100">
                              <h3 className="text-sm font-bold text-gray-900 mb-4">Available Plans</h3>
                              <div className="grid gap-4">
                                 {[
                                    { id: 'starter', name: 'Starter', price: '$29', features: ['5 Projects', '2 Team Members', 'Basic Reports'] },
                                    { id: 'professional', name: 'Professional', price: '$99', features: ['Unlimited Projects', '10 Team Members', 'Advanced Analytics', 'API Access'] },
                                    { id: 'enterprise', name: 'Enterprise', price: 'Custom', features: ['Unlimited Everything', 'Dedicated Support', 'Custom Integrations', 'SLA'] },
                                 ].map((plan) => (
                                    <div
                                       key={plan.id}
                                       className={cn(
                                          "p-4 rounded-lg border-2 transition-all cursor-pointer",
                                          billingPlan === plan.id ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"
                                       )}
                                       onClick={() => setBillingPlan(plan.id)}
                                    >
                                       <div className="flex items-center justify-between">
                                          <div>
                                             <div className="font-bold text-gray-900">{plan.name}</div>
                                             <div className="text-sm text-gray-500">{plan.features.join(' • ')}</div>
                                          </div>
                                          <div className="text-right">
                                             <div className="text-xl font-bold text-gray-900">{plan.price}</div>
                                             {plan.price !== 'Custom' && <div className="text-xs text-gray-500">/month</div>}
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>

                           <div className="pt-6 border-t border-gray-100">
                              <h3 className="text-sm font-bold text-gray-900 mb-4">Payment Method</h3>
                              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>
                                    <div>
                                       <div className="text-sm font-medium">•••• •••• •••• 4242</div>
                                       <div className="text-xs text-gray-500">Expires 12/26</div>
                                    </div>
                                 </div>
                                 <Button variant="outline" size="sm">Update</Button>
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-gray-900">Invite Team Member</h3>
              <p className="text-sm text-gray-500 mt-1">Send an invitation to join your team</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label htmlFor="inviteName">Full Name</Label>
                <Input
                  id="inviteName"
                  value={inviteData.name}
                  onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                  placeholder="Enter full name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="inviteEmail">Email Address</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  placeholder="Enter email address"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="inviteRole">Role</Label>
                <Select value={inviteData.role} onValueChange={(value) => setInviteData({ ...inviteData, role: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="analyst">Analyst</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 rounded-b-lg">
              <Button variant="outline" onClick={() => { setShowInviteModal(false); setInviteData({ name: '', email: '', role: 'viewer' }); }}>
                Cancel
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleInviteMember}
                disabled={inviting || !inviteData.name || !inviteData.email}
              >
                {inviting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                {inviting ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsPage;