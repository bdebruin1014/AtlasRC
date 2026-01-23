// src/pages/admin/IntegrationsPage.jsx
// Admin page for managing org-wide integrations (SharePoint, etc.)

import React, { useState, useEffect } from 'react';
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
  Settings,
  AlertTriangle
} from 'lucide-react';
import {
  getSharePointStatus,
  getAdminAuthorizationUrl,
  disconnectOrgSharePoint,
  isSharePointConfigured,
  getAvailableSites,
  getSiteDrives
} from '@/services/sharepointService';
import { useAuth } from '@/contexts/AuthContext';

const IntegrationsPage = () => {
  const { user } = useAuth();
  const [sharePointStatus, setSharePointStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [sites, setSites] = useState([]);
  const [drives, setDrives] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [showSiteSelector, setShowSiteSelector] = useState(false);

  useEffect(() => {
    loadSharePointStatus();
  }, []);

  const loadSharePointStatus = async () => {
    setLoading(true);
    try {
      const status = await getSharePointStatus();
      setSharePointStatus(status);
    } catch (error) {
      console.error('Error loading SharePoint status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectSharePoint = () => {
    if (!isSharePointConfigured()) {
      alert('SharePoint is not configured. Please add VITE_MS_TENANT_ID and VITE_MS_CLIENT_ID to your environment variables.');
      return;
    }

    setConnecting(true);

    // Generate state for CSRF protection
    const state = crypto.randomUUID();
    sessionStorage.setItem('sharepoint_auth_state', state);

    // Open auth URL
    const authUrl = getAdminAuthorizationUrl(state);

    // Open in popup for better UX
    const popup = window.open(authUrl, 'SharePoint Login', 'width=600,height=700');

    // Listen for completion
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'sharepoint-auth-success') {
        window.removeEventListener('message', handleMessage);
        setConnecting(false);
        loadSharePointStatus();
      }
    };

    window.addEventListener('message', handleMessage);

    // Also poll in case popup closes without message
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

  const loadSites = async () => {
    try {
      const { data } = await getAvailableSites();
      setSites(data);
      setShowSiteSelector(true);
    } catch (error) {
      console.error('Error loading sites:', error);
    }
  };

  const loadDrives = async (siteId) => {
    try {
      const { data } = await getSiteDrives(siteId);
      setDrives(data);
    } catch (error) {
      console.error('Error loading drives:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-600 mt-1">
          Manage organization-wide integrations and connections
        </p>
      </div>

      {/* SharePoint Integration */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Cloud className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Microsoft SharePoint</h2>
              <p className="text-sm text-gray-500">Document storage and file management</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : !sharePointStatus?.configured ? (
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
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-800">Connected</p>
                    <p className="text-sm text-green-600">
                      All users in your organization can access SharePoint
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDisconnectSharePoint}
                  disabled={disconnecting}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  {disconnecting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Unlink className="w-4 h-4" />
                  )}
                  Disconnect
                </button>
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

              {/* Usage Info */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">How it works</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• All users can browse and upload files to SharePoint</li>
                  <li>• Project folders are automatically created when needed</li>
                  <li>• Files are synced between Atlas and SharePoint</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Not Connected */}
              <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <X className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Not Connected</p>
                    <p className="text-sm text-gray-500">
                      Connect SharePoint to enable document management
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleConnectSharePoint}
                  disabled={connecting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {connecting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Link2 className="w-4 h-4" />
                  )}
                  Connect SharePoint
                </button>
              </div>

              {/* Benefits */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Benefits of connecting SharePoint</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Centralized document storage for all projects</li>
                  <li>• Automatic folder structure for each project</li>
                  <li>• Share files with external parties securely</li>
                  <li>• Full Microsoft 365 integration</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Outlook Integration Note */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/>
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Microsoft Outlook</h2>
              <p className="text-sm text-gray-500">Email integration for projects</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Per-User Connection</h4>
            <p className="text-sm text-blue-700">
              Outlook email integration is connected individually by each user from their profile settings.
              This ensures users only see their own emails within project portals.
            </p>
            <p className="text-sm text-blue-700 mt-2">
              Users can connect their Outlook account from <strong>Settings → Integrations</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;
