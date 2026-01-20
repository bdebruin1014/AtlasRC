import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  placeholder,
  options = [], // For select type
  rows = 3, // For textarea
  min,
  max,
  step,
  className,
  helpText,
  prefix, // For currency/percent
  suffix,
  ...props
}) {
  const id = `field-${name}`;
  
  const handleChange = (e) => {
    if (type === 'checkbox') {
      onChange({ target: { name, value: e } });
    } else if (type === 'select') {
      onChange({ target: { name, value: e } });
    } else {
      onChange(e);
    }
  };

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            id={id}
            name={name}
            value={value || ''}
            onChange={handleChange}
            onBlur={onBlur}
            disabled={disabled}
            placeholder={placeholder}
            rows={rows}
            className={cn(error && 'border-red-500')}
            {...props}
          />
        );

      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={handleChange}
            disabled={disabled}
          >
            <SelectTrigger className={cn(error && 'border-red-500')}>
              <SelectValue placeholder={placeholder || 'Select...'} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={id}
              checked={value || false}
              onCheckedChange={handleChange}
              disabled={disabled}
            />
            {label && (
              <label
                htmlFor={id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {label}
              </label>
            )}
          </div>
        );

      case 'currency':
        return (
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {prefix || '$'}
            </span>
            <Input
              id={id}
              name={name}
              type="number"
              value={value || ''}
              onChange={handleChange}
              onBlur={onBlur}
              disabled={disabled}
              placeholder={placeholder || '0.00'}
              min={min || 0}
              step={step || '0.01'}
              className={cn('pl-7', error && 'border-red-500')}
              {...props}
            />
          </div>
        );

      case 'percent':
        return (
          <div className="relative">
            <Input
              id={id}
              name={name}
              type="number"
              value={value || ''}
              onChange={handleChange}
              onBlur={onBlur}
              disabled={disabled}
              placeholder={placeholder || '0'}
              min={min || 0}
              max={max || 100}
              step={step || '0.01'}
              className={cn('pr-7', error && 'border-red-500')}
              {...props}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {suffix || '%'}
            </span>
          </div>
        );

      case 'phone':
        return (
          <Input
            id={id}
            name={name}
            type="tel"
            value={value || ''}
            onChange={handleChange}
            onBlur={onBlur}
            disabled={disabled}
            placeholder={placeholder || '(555) 555-5555'}
            className={cn(error && 'border-red-500')}
            {...props}
          />
        );

      case 'email':
        return (
          <Input
            id={id}
            name={name}
            type="email"
            value={value || ''}
            onChange={handleChange}
            onBlur={onBlur}
            disabled={disabled}
            placeholder={placeholder || 'email@example.com'}
            className={cn(error && 'border-red-500')}
            {...props}
          />
        );

      case 'date':
        return (
          <Input
            id={id}
            name={name}
            type="date"
            value={value || ''}
            onChange={handleChange}
            onBlur={onBlur}
            disabled={disabled}
            min={min}
            max={max}
            className={cn(error && 'border-red-500')}
            {...props}
          />
        );

      case 'number':
        return (
          <Input
            id={id}
            name={name}
            type="number"
            value={value || ''}
            onChange={handleChange}
            onBlur={onBlur}
            disabled={disabled}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            className={cn(error && 'border-red-500')}
            {...props}
          />
        );

      default:
        return (
          <Input
            id={id}
            name={name}
            type={type}
            value={value || ''}
            onChange={handleChange}
            onBlur={onBlur}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(error && 'border-red-500')}
            {...props}
          />
        );
    }
  };

  // Checkbox has label inline
  if (type === 'checkbox') {
    return (
      <div className={cn('space-y-1', className)}>
        {renderInput()}
        {error && <p className="text-xs text-red-500">{error}</p>}
        {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={id} className={cn(required && 'after:content-["*"] after:ml-0.5 after:text-red-500')}>
          {label}
        </Label>
      )}
      {renderInput()}
      {error && <p className="text-xs text-red-500">{error}</p>}
      {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
    </div>
  );
}

export default FormField;
