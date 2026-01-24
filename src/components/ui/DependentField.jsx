// src/components/ui/DependentField.jsx
// Wrapper component that highlights fields yellow when a dependent field changes

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * DependentField - Wraps a form field and highlights it when a parent dependency changes.
 * Shows a yellow highlight and a small warning badge prompting the user to re-verify.
 *
 * @param {Object} props
 * @param {boolean} props.isHighlighted - Whether this field should be highlighted
 * @param {function} props.onVerify - Callback to mark the field as verified (clears highlight)
 * @param {string} props.label - Label for the field
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - The form field to wrap
 */
const DependentField = ({ isHighlighted, onVerify, label, className, children }) => {
  return (
    <div className={cn('relative', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {isHighlighted && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs text-amber-700">
              <AlertTriangle className="w-3 h-3" />
              Verify
            </span>
          )}
        </label>
      )}
      <div
        className={cn(
          'transition-all duration-300 rounded-lg',
          isHighlighted && 'ring-2 ring-amber-400 bg-amber-50'
        )}
      >
        {children}
      </div>
      {isHighlighted && (
        <button
          type="button"
          onClick={onVerify}
          className="mt-1 text-xs text-amber-700 hover:text-amber-900 underline"
        >
          Mark as verified
        </button>
      )}
    </div>
  );
};

export default DependentField;
