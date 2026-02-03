import React, { useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { useQuery } from '@tanstack/react-query';
import * as plaidService from '@/services/plaidService';

export function PlaidLinkButton({ entityId, onSuccess, onExit, children }) {
  // Get link token from backend
  const { data: linkToken, isLoading } = useQuery({
    queryKey: ['plaid-link-token', entityId],
    queryFn: () => plaidService.createLinkToken(entityId, 'current-user-id'),
    staleTime: 1000 * 60 * 30 // 30 minutes
  });

  const handleSuccess = useCallback((publicToken, metadata) => {
    onSuccess?.(publicToken, metadata);
  }, [onSuccess]);

  const handleExit = useCallback((err, metadata) => {
    onExit?.(err, metadata);
  }, [onExit]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: handleSuccess,
    onExit: handleExit,
  });

  const handleClick = () => {
    if (ready) {
      open();
    }
  };

  // Clone children and add onClick handler
  return React.cloneElement(children, {
    onClick: handleClick,
    disabled: isLoading || !ready
  });
}
