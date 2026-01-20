import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

/**
 * EditableField - A versatile component that works in two modes:
 * 
 * 1. INLINE MODE (when `value` prop is provided without `label`):
 *    - Click to edit, displays value normally when not editing
 *    - Used for inline text editing in tables, cards, etc.
 *    
 * 2. FORM MODE (when `label` prop is provided):
 *    - Standard form field with label
 *    - Supports: text, select, textarea, date, number
 *    - Used in dialogs, forms, etc.
 */
const EditableField = ({
  // Inline editing props
  value,
  onSave,
  editable = true,
  showEditIcon = true,
  formatDisplay,
  validate,
  onCancel,
  displayClassName = '',
  
  // Form field props (for use in dialogs/forms)
  label,
  type = 'text',
  placeholder = '',
  options = [],
  onChange,
  defaultValue = '',
  rows = 4,
  
  // Common props
  className = '',
  inputClassName = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || defaultValue);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  // Determine which mode we're in
  const isFormMode = label !== undefined;

  useEffect(() => {
    if (!isFormMode) {
      setEditValue(value);
    }
  }, [value, isFormMode]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current.select) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    if (!editable) return;
    setIsEditing(true);
    setEditValue(value);
    setError(null);
  };

  const handleSave = async () => {
    if (validate) {
      const validationError = validate(editValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    try {
      if (onSave) {
        await onSave(editValue);
      }
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to save');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(value);
    setError(null);
    if (onCancel) onCancel();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && type !== 'textarea') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleChange = (newValue) => {
    setEditValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  // =====================
  // FORM MODE RENDERING
  // =====================
  if (isFormMode) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
        
        {type === 'select' && options.length > 0 ? (
          <Select value={editValue} onValueChange={handleChange}>
            <SelectTrigger className={inputClassName}>
              <SelectValue placeholder={placeholder || `Select ${label}...`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : type === 'textarea' ? (
          <Textarea
            ref={inputRef}
            value={editValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className={cn("resize-none", inputClassName)}
          />
        ) : (
          <Input
            ref={inputRef}
            type={type}
            value={editValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            className={inputClassName}
          />
        )}
      </div>
    );
  }

  // =====================
  // INLINE MODE RENDERING
  // =====================
  
  // Display mode (not editing)
  if (!isEditing) {
    const displayValue = formatDisplay ? formatDisplay(value) : value;
    
    return (
      <div 
        className={cn(
          "group flex items-center gap-2",
          editable && "cursor-pointer hover:bg-gray-50 rounded px-2 py-1 -mx-2 -my-1",
          className
        )}
        onClick={handleStartEdit}
      >
        <span className={cn("text-gray-900", displayClassName)}>
          {displayValue || <span className="text-gray-400">{placeholder || 'Click to edit'}</span>}
        </span>
        {editable && showEditIcon && (
          <Pencil className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    );
  }

  // Edit mode
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Input
        ref={inputRef}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn("h-8", error && "border-red-500", inputClassName)}
      />
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
        onClick={handleSave}
      >
        <Check className="w-4 h-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
        onClick={handleCancel}
      >
        <X className="w-4 h-4" />
      </Button>
      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  );
};

export default EditableField;
