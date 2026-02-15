// src/pages/admin/IntegrationsPage.jsx
// Admin page for managing org-wide Office 365 integrations (SharePoint, Outlook, Calendar)

import React, { useState, useEffect, useCallback } from 'react';
import {
  Cloud,
  Check,
  X,
  RefreshCw,
  Link2,
  Unlink,
  ExternalLink,
  Shield,
  FolderOpen,
  AlertTriangle,
  Mail,
  Calendar,
  Users,
  Building2,
  ChevronRight,
  Search,
  Clock,
  Globe,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Send,
  Info
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  getSharePointStatus,
  getAdminAuthorizationUrl,
  disconnectOrgSharePoint,
  isSharePointConfigured,
} from '@/services/sharepointService';
import {
  isOutlookConfigured,
  getAuthorizationUrl as getOutlookAuthUrl,
} from '@/services/outlookService';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// ============================================
// SUB-COMPONENTS
// ============================================

const StatusBadge = ({ connected, label }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
    connected
      ? 'bg-green-50 text-green-700 border border-green-200'
      : 'bg-gray-50 text-gray-500 border border-gray-200'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`} />
    {label || (connected ? 'Connected' : 'Not Connected')}
  </span>
);

const ServiceIcon = ({ service, size = 'md' }) => {
  const sizeClasses = size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const iconSize = size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

  const configs = {
    microsoft: { bg: 'bg-gradient-to-br from-blue-500 to-blue-600', icon: <Building2 className={`${iconSize} text-white`} /> },
    sharepoint: { bg: 'bg-gradient-to-br from-teal-500 to-teal-600', icon: <Cloud className={`${iconSize} text-white`} /> },
    outlook: { bg: 'bg-gradient-to-br from-blue-500 to-indigo-600', icon: <Mail className={`${iconSize} text-white`} /> },
    calendar: { bg: 'bg-gradient-to-br from-sky-500 to-blue-600', icon: <Calendar className={`${iconSize} text-white`} /> },
  };

  const config = configs[service] || configs.microsoft;

  return (
    <div className={`${sizeClasses} ${config.bg} rounded-xl flex items-center justify-center shadow-sm`}>
      {config.icon}
    </div>
  );
};

const IntegrationCard = ({ service, title, description, status, children, onAction, actionLabel, actionLoading, actionVariant = 'primary' }) => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ServiceIcon service={service} />
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <StatusBadge connected={status === 'connected'} label={status === 'connected' ? 'Connected' : status === 'partial' ? 'Partially Connected' : 'Not Connected'} />
      </div>
    </div>
    <div className="p-6">
      {children}
    </div>
    {onAction && (
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
        <button
          onClick={onAction}
          disabled={actionLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            actionVariant === 'danger'
              ? 'text-red-600 hover:bg-red-50 border border-red-200'
              : actionVariant === 'secondary'
              ? 'text-gray-700 hover:bg-gray-100 border border-gray-200'
              : 'bg-emerald-700 text-white hover:bg-emerald-800'
          }`}
        >
          {actionLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
          {actionLabel}
        </button>
      </div>
    )}
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================

const IntegrationsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sharePointStatus, setSharePointStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [outlookConnections, setOutlookConnections] = useState([]);
  const [teamSearch, setTeamSearch] = useState('');
  const [sendingInvite, setSendingInvite] = useState(null);

  // Calendar settings (stored locally for admin preferences)
  const [calendarSettings, setCalendarSettings] = useState({
    syncEnabled: false,
    defaultReminder: 15,
    showDeclined: false,
    workingHoursOnly: true,
  });

  // Load data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSharePointStatus(),
        loadTeamConnections(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadSharePointStatus = async () => {
    try {
      const status = await getSharePointStatus();
      setSharePointStatus(status);
    } catch (error) {
      console.error('Error loading SharePoint status:', error);
    }
  };

  const loadTeamConnections = async () => {
    try {
      // Get all team members
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, status, avatar_url')
        .eq('status', 'active')
        .order('full_name');

      if (profilesError) throw profilesError;

      // Get all outlook connections
      const { data: connections, error: connectionsError } = await supabase
        .from('outlook_connections')
        .select('user_id, email, display_name, is_connected, updated_at');

      if (connectionsError && connectionsError.code !== 'PGRST116') {
        throw connectionsError;
      }

      setTeamMembers(profiles || []);
      setOutlookConnections(connections || []);
    } catch (error) {
      console.error('Error loading team connections:', error);
    }
  };

  // SharePoint handlers
  const handleConnectSharePoint = () => {
    if (!isSharePointConfigured()) {
      alert('SharePoint is not configured. Please add VITE_MS_TENANT_ID and VITE_MS_CLIENT_ID to your environment variables.');
      return;
    }

    setConnecting(true);
    const state = crypto.randomUUID();
    sessionStorage.setItem('sharepoint_auth_state', state);
    const authUrl = getAdminAuthorizationUrl(state);
    const popup = window.open(authUrl, 'SharePoint Login', 'width=600,height=700');

    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'sharepoint-auth-success') {
        window.removeEventListener('message', handleMessage);
        setConnecting(false);
        loadSharePointStatus();
        loadTeamConnections();
      }
    };

    window.addEventListener('message', handleMessage);

    const pollInterval = setInterval(() => {
      if (popup?.closed) {
        clearInterval(pollInterval);
        window.removeEventListener('message', handleMessage);
        setConnecting(false);
        loadSharePointStatus();
      }
    }, 1000);
  };

  const handleDisconnectSharePoint = async () => {
    if (!confirm('Are you sure you want to disconnect SharePoint? This will affect all users in your organization.')) {
      return;
    }

    setDisconnecting(true);
    try {
      await disconnectOrgSharePoint();
      await loadSharePointStatus();
    } catch (error) {
      console.error('Error disconnecting SharePoint:', error);
      alert('Failed to disconnect SharePoint');
    } finally {
      setDisconnecting(false);
    }
  };

  // Team notification helpers
  const handleNotifyUser = async (userId) => {
    setSendingInvite(userId);
    // Simulate sending a notification (in production this would send an email or in-app notification)
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSendingInvite(null);
    alert('Integration setup reminder sent to user.');
  };

  // Derived data
  const msConfigured = isSharePointConfigured() && isOutlookConfigured();

  const outlookConnectionMap = {};
  outlookConnections.forEach(conn => {
    outlookConnectionMap[conn.user_id] = conn;
  });

  const connectedOutlookCount = outlookConnections.filter(c => c.is_connected).length;

  const filteredTeamMembers = teamMembers.filter(member =>
    !teamSearch ||
    member.full_name?.toLowerCase().includes(teamSearch.toLowerCase()) ||
    member.email?.toLowerCase().includes(teamSearch.toLowerCase())
  );

  const overallStats = {
    totalMembers: teamMembers.length,
    sharePointConnected: sharePointStatus?.connected ? teamMembers.length : 0,
    outlookConnected: connectedOutlookCount,
    calendarConnected: connectedOutlookCount, // Calendar uses same Outlook OAuth
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="p-6 bg-gray-50 min-h-full overflow-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-xl font-semibold text-gray-900">Microsoft 365 Integrations</h1>
          {msConfigured ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" />
              Configured
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
              <AlertTriangle className="w-3 h-3" />
              Setup Required
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">
          Connect your organization's Microsoft 365 services to enable SharePoint, Outlook, and Calendar for your team.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border mb-6">
          <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
            <Globe className="w-4 h-4 mr-1.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="sharepoint" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
            <Cloud className="w-4 h-4 mr-1.5" />
            SharePoint
          </TabsTrigger>
          <TabsTrigger value="outlook" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
            <Mail className="w-4 h-4 mr-1.5" />
            Outlook
          </TabsTrigger>
          <TabsTrigger value="calendar" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
            <Calendar className="w-4 h-4 mr-1.5" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="team" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
            <Users className="w-4 h-4 mr-1.5" />
            Team Connections
          </TabsTrigger>
        </TabsList>

        {/* ==================== OVERVIEW TAB ==================== */}
        <TabsContent value="overview">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Azure AD Configuration */}
              {!msConfigured && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <h3 className="font-medium text-amber-800">Azure AD Configuration Required</h3>
                      <p className="text-sm text-amber-700 mt-1">
                        To enable Microsoft 365 integrations, you need to configure your Azure AD application. Add these environment variables:
                      </p>
                      <div className="mt-3 flex gap-3">
                        <code className="px-2 py-1 bg-amber-100 rounded text-xs font-mono text-amber-800">VITE_MS_TENANT_ID</code>
                        <code className="px-2 py-1 bg-amber-100 rounded text-xs font-mono text-amber-800">VITE_MS_CLIENT_ID</code>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <ServiceIcon service="microsoft" />
                    <div className="text-sm font-medium text-gray-500">Team Members</div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{overallStats.totalMembers}</div>
                  <p className="text-xs text-gray-500 mt-1">Active users</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <ServiceIcon service="sharepoint" />
                    <div className="text-sm font-medium text-gray-500">SharePoint</div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {sharePointStatus?.connected ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-gray-400">Off</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Org-wide connection</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <ServiceIcon service="outlook" />
                    <div className="text-sm font-medium text-gray-500">Outlook</div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {overallStats.outlookConnected}<span className="text-sm font-normal text-gray-400">/{overallStats.totalMembers}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Users connected</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <ServiceIcon service="calendar" />
                    <div className="text-sm font-medium text-gray-500">Calendar</div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {overallStats.calendarConnected}<span className="text-sm font-normal text-gray-400">/{overallStats.totalMembers}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Users with calendar</p>
                </div>
              </div>

              {/* Quick Actions / Integration Cards */}
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('sharepoint')}
                  className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:border-emerald-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <ServiceIcon service="sharepoint" />
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <h3 className="font-semibold text-gray-900">SharePoint</h3>
                  <p className="text-sm text-gray-500 mt-1">Document storage & file management for all projects</p>
                  <div className="mt-3">
                    <StatusBadge connected={sharePointStatus?.connected} />
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('outlook')}
                  className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:border-emerald-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <ServiceIcon service="outlook" />
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Outlook</h3>
                  <p className="text-sm text-gray-500 mt-1">Email integration for project communication</p>
                  <div className="mt-3">
                    <StatusBadge
                      connected={connectedOutlookCount > 0}
                      label={connectedOutlookCount > 0 ? `${connectedOutlookCount} Connected` : 'Not Connected'}
                    />
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('calendar')}
                  className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:border-emerald-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <ServiceIcon service="calendar" />
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Calendar</h3>
                  <p className="text-sm text-gray-500 mt-1">Schedule meetings & sync team calendars</p>
                  <div className="mt-3">
                    <StatusBadge
                      connected={connectedOutlookCount > 0}
                      label={connectedOutlookCount > 0 ? `${connectedOutlookCount} Synced` : 'Not Synced'}
                    />
                  </div>
                </button>
              </div>

              {/* How It Works */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">How Microsoft 365 Integration Works</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-emerald-700">1</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Admin Connects SharePoint</h4>
                      <p className="text-xs text-gray-500 mt-1">Connect your organization's SharePoint site once. All team members automatically get access to project documents.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-emerald-700">2</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Users Connect Outlook</h4>
                      <p className="text-xs text-gray-500 mt-1">Each team member connects their own Outlook account to enable email and calendar features within Atlas.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-emerald-700">3</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Collaborate Seamlessly</h4>
                      <p className="text-xs text-gray-500 mt-1">Files, emails, and calendar events are linked to projects, enabling a unified workspace for your team.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ==================== SHAREPOINT TAB ==================== */}
        <TabsContent value="sharepoint">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-6">
              <IntegrationCard
                service="sharepoint"
                title="Microsoft SharePoint"
                description="Organization-wide document storage and file management"
                status={sharePointStatus?.connected ? 'connected' : 'disconnected'}
                onAction={sharePointStatus?.connected ? handleDisconnectSharePoint : handleConnectSharePoint}
                actionLabel={sharePointStatus?.connected ? 'Disconnect SharePoint' : 'Connect SharePoint'}
                actionLoading={connecting || disconnecting}
                actionVariant={sharePointStatus?.connected ? 'danger' : 'primary'}
              >
                {!sharePointStatus?.configured ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-amber-800">Configuration Required</h3>
                        <p className="text-sm text-amber-700 mt-1">
                          SharePoint integration requires Azure AD configuration. Add the following environment variables:
                        </p>
                        <ul className="text-sm text-amber-700 mt-2 list-disc list-inside">
                          <li>VITE_MS_TENANT_ID</li>
                          <li>VITE_MS_CLIENT_ID</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : sharePointStatus?.connected ? (
                  <div className="space-y-4">
                    {/* Connected Status */}
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-green-800">SharePoint is connected for your organization</p>
                        <p className="text-sm text-green-600">
                          All team members can access documents through Atlas
                        </p>
                      </div>
                    </div>

                    {/* Connection Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                          <FolderOpen className="w-4 h-4" />
                          <span className="text-sm">Site</span>
                        </div>
                        <p className="font-medium text-gray-900">
                          {sharePointStatus.siteName || 'Default Site'}
                        </p>
                        {sharePointStatus.siteUrl && (
                          <a
                            href={sharePointStatus.siteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1"
                          >
                            Open in SharePoint
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                          <Shield className="w-4 h-4" />
                          <span className="text-sm">Connected By</span>
                        </div>
                        <p className="font-medium text-gray-900">Admin</p>
                        <p className="text-sm text-gray-500">
                          {sharePointStatus.connectedAt &&
                            new Date(sharePointStatus.connectedAt).toLocaleDateString()
                          }
                        </p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Active Features</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5" /> All users can browse and upload files to SharePoint</li>
                        <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5" /> Project folders are automatically created when needed</li>
                        <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5" /> Files are synced between Atlas and SharePoint</li>
                        <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5" /> Share files with external parties via secure links</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <X className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Not Connected</p>
                        <p className="text-sm text-gray-500">Connect SharePoint to enable document management for your organization</p>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-2">Benefits of connecting SharePoint</h4>
                      <ul className="text-sm text-gray-600 space-y-1.5">
                        <li className="flex items-center gap-2"><FolderOpen className="w-4 h-4 text-teal-500" /> Centralized document storage for all projects</li>
                        <li className="flex items-center gap-2"><FolderOpen className="w-4 h-4 text-teal-500" /> Automatic folder structure for each project</li>
                        <li className="flex items-center gap-2"><FolderOpen className="w-4 h-4 text-teal-500" /> Share files with external parties securely</li>
                        <li className="flex items-center gap-2"><FolderOpen className="w-4 h-4 text-teal-500" /> Full Microsoft 365 integration</li>
                      </ul>
                    </div>
                  </div>
                )}
              </IntegrationCard>
            </div>
          )}
        </TabsContent>

        {/* ==================== OUTLOOK TAB ==================== */}
        <TabsContent value="outlook">
          <div className="space-y-6">
            <IntegrationCard
              service="outlook"
              title="Microsoft Outlook"
              description="Email integration for project communication"
              status={connectedOutlookCount > 0 ? 'connected' : 'disconnected'}
            >
              <div className="space-y-4">
                {/* Info Banner */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-800">Per-User Connection</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Outlook email integration is connected individually by each user from their profile settings. This ensures each user only sees their own emails within project portals. As admin, you can monitor connection status below and send reminders to team members.
                    </p>
                  </div>
                </div>

                {/* Connection Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-900">{overallStats.totalMembers}</div>
                    <p className="text-xs text-gray-500 mt-1">Total Members</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{connectedOutlookCount}</div>
                    <p className="text-xs text-gray-500 mt-1">Connected</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-amber-600">{overallStats.totalMembers - connectedOutlookCount}</div>
                    <p className="text-xs text-gray-500 mt-1">Pending Setup</p>
                  </div>
                </div>

                {/* Team Members Outlook Status */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Team Member Connections</h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left text-xs font-medium text-gray-500 px-4 py-2.5">User</th>
                          <th className="text-left text-xs font-medium text-gray-500 px-4 py-2.5">Outlook Email</th>
                          <th className="text-left text-xs font-medium text-gray-500 px-4 py-2.5">Status</th>
                          <th className="text-left text-xs font-medium text-gray-500 px-4 py-2.5">Connected</th>
                          <th className="text-right text-xs font-medium text-gray-500 px-4 py-2.5">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {teamMembers.slice(0, 10).map(member => {
                          const conn = outlookConnectionMap[member.id];
                          const isConnected = conn?.is_connected;
                          return (
                            <tr key={member.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <span className="text-xs font-medium text-emerald-700">
                                      {member.full_name?.charAt(0)?.toUpperCase() || '?'}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{member.full_name}</p>
                                    <p className="text-xs text-gray-500">{member.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm text-gray-600">{conn?.email || '—'}</span>
                              </td>
                              <td className="px-4 py-3">
                                {isConnected ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                                    <CheckCircle2 className="w-3 h-3" /> Connected
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                    <MinusCircle className="w-3 h-3" /> Not Connected
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-xs text-gray-500">
                                  {conn?.updated_at ? new Date(conn.updated_at).toLocaleDateString() : '—'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                {!isConnected && (
                                  <button
                                    onClick={() => handleNotifyUser(member.id)}
                                    disabled={sendingInvite === member.id}
                                    className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-medium"
                                  >
                                    {sendingInvite === member.id ? (
                                      <RefreshCw className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Send className="w-3 h-3" />
                                    )}
                                    Send Reminder
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        {teamMembers.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                              No team members found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Outlook Features */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Outlook Features</h4>
                  <ul className="text-sm text-gray-600 space-y-1.5">
                    <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-blue-500" /> View and send emails directly from project portals</li>
                    <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-blue-500" /> Link emails to projects for centralized communication</li>
                    <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-blue-500" /> Smart search to find relevant project emails</li>
                    <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-blue-500" /> Reply, forward, and manage emails without leaving Atlas</li>
                  </ul>
                </div>
              </div>
            </IntegrationCard>
          </div>
        </TabsContent>

        {/* ==================== CALENDAR TAB ==================== */}
        <TabsContent value="calendar">
          <div className="space-y-6">
            <IntegrationCard
              service="calendar"
              title="Microsoft 365 Calendar"
              description="Team scheduling and calendar sync via Outlook"
              status={connectedOutlookCount > 0 ? 'connected' : 'disconnected'}
            >
              <div className="space-y-4">
                {/* Info Banner */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-800">Calendar uses Outlook Connection</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Calendar access is included with the Outlook integration. When a team member connects their Outlook account, calendar features are automatically enabled. Calendar permissions (<code className="px-1 py-0.5 bg-blue-100 rounded text-xs">Calendars.ReadWrite</code>) are requested during Outlook OAuth.
                    </p>
                  </div>
                </div>

                {/* Calendar Settings */}
                <div className="border border-gray-200 rounded-lg">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-700">Calendar Preferences</h4>
                  </div>
                  <div className="divide-y divide-gray-100">
                    <div className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Enable Calendar Sync</p>
                        <p className="text-xs text-gray-500">Show Outlook calendar events within Atlas projects</p>
                      </div>
                      <Switch
                        checked={calendarSettings.syncEnabled}
                        onCheckedChange={(checked) => setCalendarSettings(s => ({ ...s, syncEnabled: checked }))}
                        className="data-[state=checked]:bg-emerald-600"
                      />
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Working Hours Only</p>
                        <p className="text-xs text-gray-500">Only display events during business hours (8 AM - 6 PM)</p>
                      </div>
                      <Switch
                        checked={calendarSettings.workingHoursOnly}
                        onCheckedChange={(checked) => setCalendarSettings(s => ({ ...s, workingHoursOnly: checked }))}
                        className="data-[state=checked]:bg-emerald-600"
                      />
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Show Declined Events</p>
                        <p className="text-xs text-gray-500">Include events the user has declined in calendar views</p>
                      </div>
                      <Switch
                        checked={calendarSettings.showDeclined}
                        onCheckedChange={(checked) => setCalendarSettings(s => ({ ...s, showDeclined: checked }))}
                        className="data-[state=checked]:bg-emerald-600"
                      />
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Default Reminder</p>
                        <p className="text-xs text-gray-500">Default reminder time for new events created in Atlas</p>
                      </div>
                      <select
                        value={calendarSettings.defaultReminder}
                        onChange={(e) => setCalendarSettings(s => ({ ...s, defaultReminder: Number(e.target.value) }))}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value={5}>5 minutes</option>
                        <option value={10}>10 minutes</option>
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Calendar Connection Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <Calendar className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">{connectedOutlookCount}</div>
                    <p className="text-xs text-gray-500 mt-1">Users with calendar sync</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg text-center">
                    <Clock className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-amber-600">{overallStats.totalMembers - connectedOutlookCount}</div>
                    <p className="text-xs text-gray-500 mt-1">Awaiting Outlook connection</p>
                  </div>
                </div>

                {/* Calendar Features */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Calendar Features</h4>
                  <ul className="text-sm text-gray-600 space-y-1.5">
                    <li className="flex items-center gap-2"><Calendar className="w-4 h-4 text-sky-500" /> View upcoming events and meetings from Outlook</li>
                    <li className="flex items-center gap-2"><Calendar className="w-4 h-4 text-sky-500" /> Create new calendar events directly from Atlas</li>
                    <li className="flex items-center gap-2"><Calendar className="w-4 h-4 text-sky-500" /> Schedule project meetings with team members</li>
                    <li className="flex items-center gap-2"><Calendar className="w-4 h-4 text-sky-500" /> Attendee management with RSVP status tracking</li>
                  </ul>
                </div>
              </div>
            </IntegrationCard>
          </div>
        </TabsContent>

        {/* ==================== TEAM CONNECTIONS TAB ==================== */}
        <TabsContent value="team">
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Team Integration Status</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Monitor which team members have connected their Microsoft 365 services</p>
                  </div>
                  <button
                    onClick={loadTeamConnections}
                    className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
                <div className="relative max-w-sm">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search team members..."
                    value={teamSearch}
                    onChange={(e) => setTeamSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Team Member</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Role</th>
                      <th className="text-center text-xs font-medium text-gray-500 px-6 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Cloud className="w-3.5 h-3.5" />
                          SharePoint
                        </div>
                      </th>
                      <th className="text-center text-xs font-medium text-gray-500 px-6 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          Outlook
                        </div>
                      </th>
                      <th className="text-center text-xs font-medium text-gray-500 px-6 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Calendar
                        </div>
                      </th>
                      <th className="text-right text-xs font-medium text-gray-500 px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTeamMembers.map(member => {
                      const conn = outlookConnectionMap[member.id];
                      const hasOutlook = conn?.is_connected;
                      const hasSharePoint = sharePointStatus?.connected; // Org-wide
                      const hasCalendar = hasOutlook; // Calendar comes with Outlook

                      return (
                        <tr key={member.id} className="hover:bg-gray-50">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                <span className="text-xs font-medium text-emerald-700">
                                  {member.full_name?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{member.full_name}</p>
                                <p className="text-xs text-gray-500">{member.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              member.role === 'admin' ? 'bg-purple-50 text-purple-700' :
                              member.role === 'manager' ? 'bg-blue-50 text-blue-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {member.role?.charAt(0).toUpperCase() + member.role?.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-center">
                            {hasSharePoint ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                            )}
                          </td>
                          <td className="px-6 py-3 text-center">
                            {hasOutlook ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                            )}
                          </td>
                          <td className="px-6 py-3 text-center">
                            {hasCalendar ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                            )}
                          </td>
                          <td className="px-6 py-3 text-right">
                            {(!hasOutlook) && (
                              <button
                                onClick={() => handleNotifyUser(member.id)}
                                disabled={sendingInvite === member.id}
                                className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-medium px-2 py-1 rounded hover:bg-emerald-50 transition-colors"
                              >
                                {sendingInvite === member.id ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Send className="w-3 h-3" />
                                )}
                                Remind
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredTeamMembers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">
                            {teamSearch ? 'No team members match your search' : 'No active team members found'}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary Footer */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                <span>{filteredTeamMembers.length} team member{filteredTeamMembers.length !== 1 ? 's' : ''}</span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Connected</span>
                  <span className="flex items-center gap-1"><XCircle className="w-3.5 h-3.5 text-gray-300" /> Not Connected</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationsPage;
