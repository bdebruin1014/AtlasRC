import React, { createContext, useState, useCallback } from 'react';

export const TransactionEntryContext = createContext();

export const TransactionEntryProvider = ({ children }) => {
  const [activeModal, setActiveModal] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedEntity, setSelectedEntity] = useState(null);

  const openModal = useCallback((type, entity) => {
    setActiveModal(type);
    setSelectedEntity(entity);
    setFormData({});
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setFormData({});
    setSelectedEntity(null);
  }, []);

  const updateFormData = useCallback((data) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  const value = {
    activeModal,
    formData,
    selectedEntity,
    openModal,
    closeModal,
    updateFormData
  };

  return (
    <TransactionEntryContext.Provider value={value}>
      {children}
    </TransactionEntryContext.Provider>
  );
};
