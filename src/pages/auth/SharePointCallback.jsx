// src/pages/auth/SharePointCallback.jsx
// OAuth callback handler for SharePoint integration (Org-wide admin connection)

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Cloud, Check, X, RefreshCw, FolderOpen } from 'lucide-react';
import { exchangeCodeForTokens, saveOrgSharePointConnection, getAvailableSites, getSiteDrives } from '@/services/sharepointService';
import { supabase } from '@/lib/supabase';

const SharePointCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);
  const [step, setStep] = useState('auth'); // auth, sites, drives, complete

  // Site selection state
  const [sites, setSites] = useState([]);
  const [drives, setDrives] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    handleCallback();
  }, [searchParams]);

  const handleCallback = async () => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Check for OAuth errors
    if (errorParam) {
      setStatus('error');
      setError(errorDescription || 'Authentication was denied');
      return;
    }

    // Validate state parameter (CSRF protection)
    const savedState = sessionStorage.getItem('sharepoint_auth_state');
    if (state !== savedState) {
      setStatus('error');
      setError('Invalid state parameter. Please try again.');
      return;
    }

    // Clear the saved state
    sessionStorage.removeItem('sharepoint_auth_state');

    if (!code) {
      setStatus('error');
      setError('No authorization code received');
      return;
    }

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStatus('error');
        setError('User not authenticated');
        return;
      }
      setUserId(user.id);

      // Exchange code for tokens
      const tokenData = await exchangeCodeForTokens(code);
      setTokens(tokenData);

      // Temporarily save connection to enable API calls
      await saveOrgSharePointConnection(user.id, tokenData, null);

      // Load available sites
      const { data: sitesData, error: sitesError } = await getAvailableSites();

      if (sitesError || !sitesData?.length) {
        // No sites found, use default
        await finalizeSiteSelection({ id: 'default', displayName: 'OneDrive', webUrl: null }, null);
        return;
      }

      setSites(sitesData);
      setStep('sites');
      setStatus('selecting');
    } catch (err) {
      console.error('SharePoint callback error:', err);
      setStatus('error');
      setError(err.message || 'Failed to complete authentication');
    }
  };

  const handleSiteSelect = async (site) => {
    setSelectedSite(site);

    try {
      const { data: drivesData } = await getSiteDrives(site.id);
      if (drivesData?.length > 1) {
        setDrives(drivesData);
        setStep('drives');
      } else if (drivesData?.length === 1) {
        // Only one drive, auto-select
        await finalizeSiteSelection(site, drivesData[0]);
      } else {
        // No drives, just use the site
        await finalizeSiteSelection(site, null);
      }
    } catch (err) {
      console.error('Error loading drives:', err);
      await finalizeSiteSelection(site, null);
    }
  };

  const handleDriveSelect = async (drive) => {
    await finalizeSiteSelection(selectedSite, drive);
  };

  const finalizeSiteSelection = async (site, drive) => {
    try {
      await saveOrgSharePointConnection(userId, tokens, {
        id: site.id,
        displayName: site.displayName,
        webUrl: site.webUrl,
        driveId: drive?.id || null,
      });

      setStatus('success');
      setStep('complete');

      // Notify parent window if opened as popup
      if (window.opener) {
        window.opener.postMessage({ type: 'sharepoint-auth-success' }, window.location.origin);
        setTimeout(() => window.close(), 2000);
      } else {
        // Redirect to admin integrations if opened directly
        setTimeout(() => navigate('/admin/integrations'), 2000);
      }
    } catch (err) {
      console.error('Error saving connection:', err);
      setStatus('error');
      setError('Failed to save SharePoint connection');
    }
  };

  // Site selection UI
  if (step === 'sites' && status === 'selecting') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-blue-100">
            <Cloud className="w-8 h-8 text-blue-600" />
          </div>

          <h1 className="text-xl font-semibold text-center mb-2">Select SharePoint Site</h1>
          <p className="text-gray-600 text-center mb-6">
            Choose the SharePoint site for your organization's documents
          </p>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sites.map((site) => (
              <button
                key={site.id}
                onClick={() => handleSiteSelect(site)}
                className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <p className="font-medium text-gray-900">{site.displayName}</p>
                <p className="text-sm text-gray-500 truncate">{site.webUrl}</p>
              </button>
            ))}
          </div>

          <button
            onClick={() => finalizeSiteSelection({ id: 'default', displayName: 'OneDrive', webUrl: null }, null)}
            className="w-full mt-4 p-3 text-gray-600 hover:text-gray-800 text-sm"
          >
            Skip - Use default storage
          </button>
        </div>
      </div>
    );
  }

  // Drive selection UI
  if (step === 'drives' && status === 'selecting') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-blue-100">
            <FolderOpen className="w-8 h-8 text-blue-600" />
          </div>

          <h1 className="text-xl font-semibold text-center mb-2">Select Document Library</h1>
          <p className="text-gray-600 text-center mb-6">
            Choose which document library to use on {selectedSite?.displayName}
          </p>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {drives.map((drive) => (
              <button
                key={drive.id}
                onClick={() => handleDriveSelect(drive)}
                className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <p className="font-medium text-gray-900">{drive.name}</p>
                <p className="text-sm text-gray-500">{drive.driveType}</p>
              </button>
            ))}
          </div>

          <button
            onClick={() => finalizeSiteSelection(selectedSite, null)}
            className="w-full mt-4 p-3 text-gray-600 hover:text-gray-800 text-sm"
          >
            Skip - Use default library
          </button>
        </div>
      </div>
    );
  }

  // Default status display (processing/success/error)
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
          status === 'success' ? 'bg-green-100' :
          status === 'error' ? 'bg-red-100' :
          'bg-blue-100'
        }`}>
          {status === 'processing' && (
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          )}
          {status === 'success' && (
            <Check className="w-8 h-8 text-green-600" />
          )}
          {status === 'error' && (
            <X className="w-8 h-8 text-red-600" />
          )}
        </div>

        <h1 className="text-xl font-semibold mb-2">
          {status === 'processing' && 'Connecting to SharePoint...'}
          {status === 'success' && 'SharePoint Connected!'}
          {status === 'error' && 'Connection Failed'}
        </h1>

        <p className="text-gray-600 mb-4">
          {status === 'processing' && 'Please wait while we complete the connection.'}
          {status === 'success' && 'SharePoint has been connected for your organization. This window will close automatically.'}
          {status === 'error' && error}
        </p>

        {status === 'error' && (
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
          >
            Close Window
          </button>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
          <Cloud className="w-4 h-4" />
          <span>Microsoft SharePoint Integration</span>
        </div>
      </div>
    </div>
  );
};

export default SharePointCallback;
