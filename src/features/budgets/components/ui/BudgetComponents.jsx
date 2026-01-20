// AtlasDev Budget Module - Shared UI Components
import React, { useState } from 'react';
import { formatCurrency, formatPercent, parseCurrency } from '../../utils/budgetCalculations';

// Currency Input
export const CurrencyInput = ({ value, onChange, label, disabled = false, className = '', size = 'md' }) => {
  const [focused, setFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState(formatCurrency(value));

  const sizeClasses = {
    sm: 'h-7 text-xs px-2',
    md: 'h-8 text-sm px-3',
    lg: 'h-10 text-base px-4',
  };

  const handleFocus = () => {
    setFocused(true);
    setDisplayValue(value.toString());
  };

  const handleBlur = () => {
    setFocused(false);
    const parsed = parseCurrency(displayValue);
    onChange(parsed);
    setDisplayValue(formatCurrency(parsed));
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="text-xs font-medium text-slate-500 mb-1">{label}</label>}
      <input
        type="text"
        value={focused ? displayValue : formatCurrency(value)}
        onChange={(e) => setDisplayValue(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        className={`${sizeClasses[size]} bg-emerald-50 border border-emerald-200 rounded text-right font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-500`}
      />
    </div>
  );
};

// Percent Input
export const PercentInput = ({ value, onChange, label, disabled = false, className = '' }) => {
  const [focused, setFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState((value * 100).toString());

  const handleFocus = () => {
    setFocused(true);
    setDisplayValue((value * 100).toString());
  };

  const handleBlur = () => {
    setFocused(false);
    const parsed = parseFloat(displayValue) / 100;
    onChange(isNaN(parsed) ? 0 : parsed);
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="text-xs font-medium text-slate-500 mb-1">{label}</label>}
      <div className="relative">
        <input
          type="text"
          value={focused ? displayValue : (value * 100).toFixed(2)}
          onChange={(e) => setDisplayValue(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className="h-8 w-full text-sm px-3 pr-6 bg-emerald-50 border border-emerald-200 rounded text-right font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-sm">%</span>
      </div>
    </div>
  );
};

// Number Input
export const NumberInput = ({ value, onChange, label, disabled = false, className = '', min, max, step = 1 }) => (
  <div className={`flex flex-col ${className}`}>
    {label && <label className="text-xs font-medium text-slate-500 mb-1">{label}</label>}
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      className="h-8 text-sm px-3 bg-emerald-50 border border-emerald-200 rounded text-right font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
    />
  </div>
);

// Text Input
export const TextInput = ({ value, onChange, label, placeholder, disabled = false, className = '' }) => (
  <div className={`flex flex-col ${className}`}>
    {label && <label className="text-xs font-medium text-slate-500 mb-1">{label}</label>}
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="h-8 text-sm px-3 bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
    />
  </div>
);

// Section Header
export const SectionHeader = ({ title, subtitle, color = 'green', collapsible = false, expanded = true, onToggle }) => {
  const colorClasses = {
    green: 'bg-emerald-700 text-white',
    blue: 'bg-blue-700 text-white',
    purple: 'bg-purple-700 text-white',
    slate: 'bg-slate-700 text-white',
  };

  return (
    <div
      className={`${colorClasses[color]} px-4 py-2 rounded-t flex items-center justify-between ${collapsible ? 'cursor-pointer hover:opacity-90' : ''}`}
      onClick={collapsible ? onToggle : undefined}
    >
      <div>
        <h3 className="font-semibold text-sm tracking-wide">{title}</h3>
        {subtitle && <p className="text-xs opacity-80">{subtitle}</p>}
      </div>
      {collapsible && (
        <svg className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      )}
    </div>
  );
};

// Category Section
export const CategorySection = ({ title, children, color = 'green', defaultExpanded = true }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="mb-3">
      <SectionHeader title={title} color={color} collapsible expanded={expanded} onToggle={() => setExpanded(!expanded)} />
      {expanded && <div className="border border-t-0 border-slate-200 rounded-b bg-white">{children}</div>}
    </div>
  );
};

// Subtotal Row
export const SubtotalRow = ({ label, budgetTotal, actualTotal, showVariance = false, perUnit, percentOfTotal }) => {
  const variance = (actualTotal || 0) - budgetTotal;

  return (
    <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-amber-50 border-b-2 border-amber-200 items-center">
      <div className="col-span-4 text-sm font-semibold text-slate-700 italic">{label}</div>
      <div className="col-span-2">
        <div className="h-7 bg-amber-100 border border-amber-200 rounded px-2 flex items-center justify-end font-mono text-sm font-semibold">
          {formatCurrency(budgetTotal)}
        </div>
      </div>
      {actualTotal !== undefined && (
        <div className="col-span-2">
          <div className="h-7 bg-amber-100 border border-amber-200 rounded px-2 flex items-center justify-end font-mono text-sm">
            {formatCurrency(actualTotal)}
          </div>
        </div>
      )}
      {showVariance && (
        <div className={`col-span-1 text-right text-sm font-mono font-semibold ${variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
          {formatCurrency(variance)}
        </div>
      )}
      {perUnit !== undefined && (
        <div className="col-span-1 text-right text-sm font-mono text-slate-600">{formatCurrency(perUnit)}</div>
      )}
      {percentOfTotal !== undefined && (
        <div className="col-span-2 text-right text-sm font-mono text-slate-600">{formatPercent(percentOfTotal)}</div>
      )}
    </div>
  );
};

// Grand Total Row
export const GrandTotalRow = ({ label, budgetTotal, actualTotal, perUnit, perSF }) => (
  <div className="bg-emerald-700 text-white px-4 py-3 rounded-b flex items-center justify-between">
    <span className="font-bold text-lg">{label}</span>
    <div className="flex items-center gap-6">
      {perUnit !== undefined && (
        <div className="text-right">
          <div className="text-xs opacity-70">Per Unit</div>
          <div className="font-mono font-semibold">{formatCurrency(perUnit)}</div>
        </div>
      )}
      {perSF !== undefined && (
        <div className="text-right">
          <div className="text-xs opacity-70">Per SF</div>
          <div className="font-mono font-semibold">{formatCurrency(perSF, { showCents: true })}</div>
        </div>
      )}
      <div className="text-right">
        <div className="text-xs opacity-70">Budget</div>
        <div className="font-mono font-bold text-xl">{formatCurrency(budgetTotal)}</div>
      </div>
      {actualTotal !== undefined && (
        <div className="text-right">
          <div className="text-xs opacity-70">Actual</div>
          <div className="font-mono font-bold text-xl">{formatCurrency(actualTotal)}</div>
        </div>
      )}
    </div>
  </div>
);

// Metric Card
export const MetricCard = ({ label, value, format = 'currency', trend, size = 'md', className = '' }) => {
  const formatValue = () => {
    switch (format) {
      case 'currency': return formatCurrency(value);
      case 'percent': return formatPercent(value);
      case 'multiple': return `${value.toFixed(2)}x`;
      default: return value.toLocaleString();
    }
  };

  const sizeClasses = { sm: 'p-2', md: 'p-3', lg: 'p-4' };
  const valueSizeClasses = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' };
  const trendColors = { up: 'text-green-600', down: 'text-red-600', neutral: 'text-slate-600' };

  return (
    <div className={`bg-white border border-slate-200 rounded-lg ${sizeClasses[size]} ${className}`}>
      <div className="text-xs text-slate-500 font-medium mb-1">{label}</div>
      <div className={`font-mono font-bold ${valueSizeClasses[size]} ${trend ? trendColors[trend] : 'text-slate-800'}`}>
        {formatValue()}
      </div>
    </div>
  );
};

// Tab Navigation
export const TabNavigation = ({ tabs, activeTab, onTabChange }) => (
  <div className="flex border-b border-slate-200">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
          activeTab === tab.id
            ? 'border-emerald-600 text-emerald-700'
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

// Action Buttons
export const ActionButtons = ({ onSave, onExport, onPrint, saving = false }) => (
  <div className="flex items-center gap-2">
    {onPrint && (
      <button onClick={onPrint} className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print
      </button>
    )}
    {onExport && (
      <button onClick={onExport} className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 rounded flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export
      </button>
    )}
    {onSave && (
      <button onClick={onSave} disabled={saving} className="px-4 py-1.5 text-sm bg-emerald-600 text-white hover:bg-emerald-700 rounded flex items-center gap-1 disabled:opacity-50">
        {saving ? 'Saving...' : 'Save'}
      </button>
    )}
  </div>
);

export default {
  CurrencyInput, PercentInput, NumberInput, TextInput,
  SectionHeader, CategorySection, SubtotalRow, GrandTotalRow,
  MetricCard, TabNavigation, ActionButtons,
};
