// src/components/esign/ESignButton.jsx
// Reusable E-Sign button that opens the signing modal

import React, { useState } from 'react';
import { FileSignature } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ESignModal from './ESignModal';

const ESignButton = ({
  entityType = 'general',
  entityId = null,
  entityName = '',
  defaultSigners = [],
  prefillData = {},
  buttonText = 'Send for E-Sign',
  buttonVariant = 'outline',
  buttonSize = 'default',
  icon = true,
  className = '',
  onSuccess = () => {},
  onError = () => {}
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleSuccess = (result) => {
    setShowModal(false);
    onSuccess(result);
  };

  return (
    <>
      <Button
        variant={buttonVariant}
        size={buttonSize}
        onClick={() => setShowModal(true)}
        className={cn(className)}
      >
        {icon && <FileSignature className="w-4 h-4 mr-2" />}
        {buttonText}
      </Button>

      {showModal && (
        <ESignModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          entityType={entityType}
          entityId={entityId}
          entityName={entityName}
          defaultSigners={defaultSigners}
          prefillData={prefillData}
          onSuccess={handleSuccess}
          onError={onError}
        />
      )}
    </>
  );
};

export default ESignButton;
