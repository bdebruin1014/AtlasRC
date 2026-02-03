import React, { useCallback, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link2, Building2, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import * as plaidService from '@/services/plaidService';

export default function PlaidLinkModal({ open, onClose, entityId }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('idle'); // idle, linking, success, error
  const [error, setError] = useState(null);

  // Get link token from backend
  const { data: linkToken, isLoading: tokenLoading, error: tokenError } = useQuery({
    queryKey: ['plaid-link-token', entityId],
    queryFn: () => plaidService.createLinkToken(entityId, 'current-user-id'),
    enabled: open && !!entityId,
    staleTime: 1000 * 60 * 30 // 30 minutes
  });

  const exchangeMutation = useMutation({
    mutationFn: ({ publicToken, metadata }) =>
      plaidService.exchangePublicToken(entityId, publicToken, metadata),
    onSuccess: () => {
      setStatus('success');
      queryClient.invalidateQueries(['bank-accounts', entityId]);
      queryClient.invalidateQueries(['plaid-connections', entityId]);
      setTimeout(() => {
        onClose();
        setStatus('idle');
      }, 1500);
    },
    onError: (err) => {
      setStatus('error');
      setError(err.message || 'Failed to connect bank account');
    }
  });

  const handleSuccess = useCallback((publicToken, metadata) => {
    setStatus('linking');
    exchangeMutation.mutate({ publicToken, metadata });
  }, [exchangeMutation]);

  const handleExit = useCallback((err, metadata) => {
    if (err) {
      setStatus('error');
      setError(err.message || 'Connection was cancelled');
    }
  }, []);

  const { open: openPlaid, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: handleSuccess,
    onExit: handleExit,
  });

  const handleConnect = () => {
    if (ready) {
      setError(null);
      openPlaid();
    }
  };

  const handleClose = () => {
    setStatus('idle');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Connect Bank Account
          </DialogTitle>
          <DialogDescription>
            Securely connect your bank account to automatically import transactions.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {status === 'idle' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-medium mb-2">Connect via Plaid</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We use Plaid to securely connect to your bank. Your credentials are never stored on our servers.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  256-bit encryption
                </p>
                <p className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Read-only access
                </p>
                <p className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Disconnect anytime
                </p>
              </div>
            </div>
          )}

          {status === 'linking' && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="font-medium">Connecting your account...</p>
              <p className="text-sm text-muted-foreground">This may take a moment</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="font-medium text-green-600">Successfully connected!</p>
              <p className="text-sm text-muted-foreground">Your transactions will be imported shortly</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <p className="font-medium text-red-600">Connection Failed</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            {status === 'success' ? 'Close' : 'Cancel'}
          </Button>
          {(status === 'idle' || status === 'error') && (
            <Button
              onClick={handleConnect}
              disabled={tokenLoading || !ready}
            >
              {tokenLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-2" />
                  {status === 'error' ? 'Try Again' : 'Connect Bank'}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
