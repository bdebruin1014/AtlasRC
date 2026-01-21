// src/pages/auth/SharePointCallback.jsx
// OAuth callback handler for SharePoint integration

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileText, Check, X, RefreshCw } from 'lucide-react';
import { exchangeCodeForTokens } from '@/services/sharepointService';
import { supabase } from '@/lib/supabase';

const SharePointCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);

  useEffect(() => {
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

        // Exchange code for tokens
        const result = await exchangeCodeForTokens(code, user.id);

        if (result.error) {
          setStatus('error');
          setError(result.error);
          return;
        }

        setStatus('success');

        // Notify parent window if opened as popup
        if (window.opener) {
          window.opener.postMessage({ type: 'sharepoint-auth-success' }, window.location.origin);
          setTimeout(() => window.close(), 2000);
        } else {
          // Redirect to settings if opened directly
          setTimeout(() => navigate('/settings'), 2000);
        }
      } catch (err) {
        console.error('SharePoint callback error:', err);
        setStatus('error');
        setError('Failed to complete authentication');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

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
          {status === 'success' && 'Your SharePoint account has been successfully connected. This window will close automatically.'}
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
          <FileText className="w-4 h-4" />
          <span>Microsoft SharePoint Integration</span>
        </div>
      </div>
    </div>
  );
};

export default SharePointCallback;
