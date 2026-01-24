// src/hooks/useDependentField.js
// Hook to track field dependencies and highlight fields needing re-verification

import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Hook to manage dependent field relationships.
 * When a "parent" field changes, dependent "child" fields are flagged
 * as needing re-verification (highlighted yellow).
 *
 * @param {Object} dependencies - Map of field names to arrays of dependent field names
 *   e.g., { projectType: ['budgetType', 'templateId'], address: ['city', 'state', 'zip'] }
 * @param {Object} formData - Current form data object
 * @returns {Object} { highlightedFields, clearHighlight, clearAllHighlights, isHighlighted }
 */
export function useDependentField(dependencies = {}, formData = {}) {
  const [highlightedFields, setHighlightedFields] = useState(new Set());
  const prevFormData = useRef(formData);

  useEffect(() => {
    const prev = prevFormData.current;
    const newHighlights = new Set(highlightedFields);
    let changed = false;

    Object.entries(dependencies).forEach(([parentField, childFields]) => {
      if (prev[parentField] !== undefined && prev[parentField] !== formData[parentField]) {
        childFields.forEach(field => {
          if (!newHighlights.has(field)) {
            newHighlights.add(field);
            changed = true;
          }
        });
      }
    });

    if (changed) {
      setHighlightedFields(newHighlights);
    }

    prevFormData.current = { ...formData };
  }, [formData, dependencies]);

  const clearHighlight = useCallback((fieldName) => {
    setHighlightedFields(prev => {
      const next = new Set(prev);
      next.delete(fieldName);
      return next;
    });
  }, []);

  const clearAllHighlights = useCallback(() => {
    setHighlightedFields(new Set());
  }, []);

  const isHighlighted = useCallback((fieldName) => {
    return highlightedFields.has(fieldName);
  }, [highlightedFields]);

  return {
    highlightedFields,
    clearHighlight,
    clearAllHighlights,
    isHighlighted,
  };
}

export default useDependentField;
