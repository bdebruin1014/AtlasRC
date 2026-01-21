// hooks/useAutoSave.js
// Provides debounced auto-save functionality for form fields

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook for auto-saving form data with debounce
 * @param {Object} initialData - Initial form data
 * @param {Function} saveFunction - Async function to save data (receives data as argument)
 * @param {number} debounceMs - Debounce delay in milliseconds (default: 1000)
 * @returns {Object} - { formData, setField, saveStatus, isSaving, lastSaved, forceSave }
 */
export function useAutoSave(initialData, saveFunction, debounceMs = 1000) {
  const [formData, setFormData] = useState(initialData || {});
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState(null);

  const timeoutRef = useRef(null);
  const pendingChangesRef = useRef(false);
  const initialDataRef = useRef(initialData);

  // Update form data when initial data changes (e.g., from database fetch)
  useEffect(() => {
    if (initialData && JSON.stringify(initialData) !== JSON.stringify(initialDataRef.current)) {
      setFormData(initialData);
      initialDataRef.current = initialData;
    }
  }, [initialData]);

  // The actual save function
  const performSave = useCallback(async (dataToSave) => {
    if (!saveFunction) return;

    setIsSaving(true);
    setSaveStatus('saving');
    setError(null);

    try {
      await saveFunction(dataToSave);
      setSaveStatus('saved');
      setLastSaved(new Date());
      pendingChangesRef.current = false;

      // Reset to idle after showing "saved" briefly
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (err) {
      console.error('Auto-save error:', err);
      setSaveStatus('error');
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }, [saveFunction]);

  // Set a single field and trigger debounced save
  const setField = useCallback((field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Mark that we have pending changes
      pendingChangesRef.current = true;
      setSaveStatus('idle');

      // Set new timeout for debounced save
      timeoutRef.current = setTimeout(() => {
        performSave(newData);
      }, debounceMs);

      return newData;
    });
  }, [debounceMs, performSave]);

  // Set multiple fields at once
  const setFields = useCallback((fields) => {
    setFormData(prev => {
      const newData = { ...prev, ...fields };

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      pendingChangesRef.current = true;
      setSaveStatus('idle');

      timeoutRef.current = setTimeout(() => {
        performSave(newData);
      }, debounceMs);

      return newData;
    });
  }, [debounceMs, performSave]);

  // Force immediate save
  const forceSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    performSave(formData);
  }, [formData, performSave]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = pendingChangesRef.current;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    formData,
    setField,
    setFields,
    saveStatus,
    isSaving,
    lastSaved,
    error,
    forceSave,
    hasUnsavedChanges,
  };
}

/**
 * Save status indicator component
 */
export function SaveStatusIndicator({ status, lastSaved, error }) {
  const getStatusDisplay = () => {
    switch (status) {
      case 'saving':
        return (
          <span className="flex items-center gap-1 text-sm text-gray-500">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            Saving...
          </span>
        );
      case 'saved':
        return (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            Saved
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1 text-sm text-red-600">
            <span className="w-2 h-2 bg-red-500 rounded-full" />
            Error: {error}
          </span>
        );
      default:
        if (lastSaved) {
          return (
            <span className="text-xs text-gray-400">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          );
        }
        return null;
    }
  };

  return <div className="h-5">{getStatusDisplay()}</div>;
}

export default useAutoSave;
