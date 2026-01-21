// src/components/sharepoint/SharePointConnect.jsx
// SharePoint Connection Component with OAuth

import React, { useState, useEffect } from 'react';
import { FileText, Check, X, RefreshCw, ExternalLink, Unlink, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  isSharePointConfigured,
  getAuthorizationUrl,
  getSharePointConnection,
  disconnectSharePoint,
  getMyDrive,
  getUserSites,
  getSiteDrives,
} from '@/services/sharepointService';
import { supabase } from '@/lib/supabase';

const SharePointConnect = ({
  onConnect,
  onDisconnect,
  showBrowser = false,
  className,
}) => {
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [connection, setConnection] = useState(null);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);
  const [showSiteSelector, setShowSiteSelector] = useState(false);
  const [sites, setSites] = useState([]);
  const [drives, setDrives] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);

  // Get current user and check connection
  useEffect(() => {
    const checkConnection = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const { data } = await getSharePointConnection(user.id);
          setConnection(data);
        }
      } catch (err) {
        console.error('Error checking connection:', err);
      }
      setLoading(false);
    };

    checkConnection();

    // Listen for OAuth callback
    const handleMessage = async (event) => {
      if (event.data?.type === 'sharepoint-auth-success') {
        setConnecting(true);
        try {
          const { data } = await getSharePointConnection(userId);
          setConnection(data);
          onConnect?.(data);
        } catch (err) {
          setError('Failed to complete connection');
        }
        setConnecting(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [userId, onConnect]);

  // Handle connect click
  const handleConnect = () => {
    if (!isSharePointConfigured()) {
      setError('SharePoint is not configured. Please contact your administrator.');
      return;
    }

    setConnecting(true);
    setError(null);

    // Generate state for CSRF protection
    const state = crypto.randomUUID();
    sessionStorage.setItem('sharepoint_auth_state', state);

    // Open OAuth popup
    const authUrl = getAuthorizationUrl(state);
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    window.open(
      authUrl,
      'SharePoint Login',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  // Handle disconnect
  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect SharePoint?')) return;

    setLoading(true);
    try {
      await disconnectSharePoint(userId);
      setConnection(null);
      onDisconnect?.();
    } catch (err) {
      console.error('Error disconnecting:', err);
      setError('Failed to disconnect');
    }
    setLoading(false);
  };

  // Load sites for site selector
  const loadSites = async () => {
    setShowSiteSelector(true);
    try {
      const { data } = await getUserSites(userId);
      setSites(data);

      // Also load OneDrive
      const { data: myDrive } = await getMyDrive(userId);
      if (myDrive) {
        setSites(prev => [{ id: 'personal', displayName: 'My OneDrive', driveId: myDrive.id }, ...prev]);
      }
    } catch (err) {
      console.error('Error loading sites:', err);
    }
  };

  // Load drives for selected site
  const loadDrives = async (siteId) => {
    if (siteId === 'personal') {
      const { data: myDrive } = await getMyDrive(userId);
      setDrives([myDrive]);
      return;
    }

    try {
      const { data } = await getSiteDrives(userId, siteId);
      setDrives(data);
    } catch (err) {
      console.error('Error loading drives:', err);
    }
  };

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center p-6", className)}>
        <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={cn("bg-white border rounded-lg overflow-hidden", className)}>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            connection?.is_connected ? "bg-green-100" : "bg-blue-100"
          )}>
            <FileText className={cn(
              "w-6 h-6",
              connection?.is_connected ? "text-green-600" : "text-blue-600"
            )} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Microsoft SharePoint</h3>
            <p className="text-sm text-gray-500">
              {connection?.is_connected
                ? 'Connected - Document storage enabled'
                : 'Connect to sync and manage documents'}
            </p>
          </div>
          {connection?.is_connected ? (
            <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
              <Check className="w-4 h-4" />
              Connected
            </span>
          ) : (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
              Not Connected
            </span>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
            <button onClick={() => setError(null)} className="ml-2 text-red-500 hover:text-red-700">
              <X className="w-4 h-4 inline" />
            </button>
          </div>
        )}

        {connection?.is_connected ? (
          <div className="space-y-3">
            {connection.site_name && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Connected Site</p>
                  <p className="text-xs text-gray-500">{connection.site_name}</p>
                </div>
                {connection.site_url && (
                  <Button variant="ghost" size="sm" onClick={() => window.open(connection.site_url, '_blank')}>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}

            <div className="flex gap-2">
              {showBrowser && (
                <Button variant="outline" className="flex-1" onClick={loadSites}>
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Browse Files
                </Button>
              )}
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleDisconnect}
              >
                <Unlink className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Connect your Microsoft account to enable SharePoint document storage.
              This allows you to:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Automatically sync project documents</li>
              <li>Access files from anywhere</li>
              <li>Share documents with team members</li>
              <li>Track document versions</li>
            </ul>
            <Button
              className="w-full"
              onClick={handleConnect}
              disabled={connecting || !isSharePointConfigured()}
            >
              {connecting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Connect SharePoint
                </>
              )}
            </Button>
            {!isSharePointConfigured() && (
              <p className="text-xs text-amber-600">
                SharePoint integration is not configured. Please contact your administrator.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Site Selector Modal */}
      {showSiteSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">
                {selectedSite ? 'Select Document Library' : 'Select Site'}
              </h3>
              <button
                onClick={() => {
                  setShowSiteSelector(false);
                  setSelectedSite(null);
                  setDrives([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-96">
              {selectedSite ? (
                // Show drives
                drives.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setSelectedSite(null);
                        setDrives([]);
                      }}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline mb-4"
                    >
                      ← Back to sites
                    </button>
                    {drives.map(drive => (
                      <button
                        key={drive.id}
                        onClick={() => {
                          // Save selected drive and close
                          setShowSiteSelector(false);
                          // Could trigger browse callback here
                        }}
                        className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 text-left"
                      >
                        <FileText className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium">{drive.name}</p>
                          <p className="text-xs text-gray-500">
                            {drive.quota ? `${Math.round(drive.quota.used / 1024 / 1024)} MB used` : ''}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )
              ) : (
                // Show sites
                sites.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sites.map(site => (
                      <button
                        key={site.id}
                        onClick={() => {
                          setSelectedSite(site);
                          loadDrives(site.id);
                        }}
                        className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 text-left"
                      >
                        <FileText className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium">{site.displayName}</p>
                          <p className="text-xs text-gray-500 truncate">{site.webUrl}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharePointConnect;
