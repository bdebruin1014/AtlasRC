import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Check if the app is running in demo mode
 * Demo mode uses mock data instead of real database calls
 * @returns {boolean} True if in demo mode
 */
export function isDemoMode() {
  return import.meta.env.VITE_DEMO_MODE === 'true' || 
         import.meta.env.VITE_DEMO_MODE === true ||
         !import.meta.env.VITE_SUPABASE_URL;
}

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency
 * @param {number} value - The value to format
 * @param {Object} options - Formatting options
 * @param {boolean} options.compact - Use compact notation (e.g., $1.2M)
 * @param {string} options.currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, options = {}) {
  const { compact = false, currency = 'USD' } = options;
  
  if (value === null || value === undefined) return '-';
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 2,
  });
  
  return formatter.format(value);
}

/**
 * Format a date string
 * @param {string|Date} date - The date to format
 * @param {Object} options - Formatting options
 * @param {string} options.format - Format type: 'short', 'medium', 'long'
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  if (!date) return '-';
  
  const { format = 'medium' } = options;
  const d = new Date(date);
  
  if (isNaN(d.getTime())) return '-';
  
  const formats = {
    short: { month: 'numeric', day: 'numeric', year: '2-digit' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
  };
  
  return d.toLocaleDateString('en-US', formats[format] || formats.medium);
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 * @param {string|Date} date - The date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  if (!date) return '-';
  
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return formatDate(date, { format: 'short' });
}

/**
 * Format a number with commas
 * @param {number} value - The value to format
 * @returns {string} Formatted number string
 */
export function formatNumber(value) {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Format a percentage
 * @param {number} value - The value to format (0-100 or 0-1)
 * @param {Object} options - Formatting options
 * @param {boolean} options.decimal - If true, treat value as decimal (0-1)
 * @returns {string} Formatted percentage string
 */
export function formatPercent(value, options = {}) {
  if (value === null || value === undefined) return '-';
  
  const { decimal = false } = options;
  const pct = decimal ? value * 100 : value;
  
  return `${pct.toFixed(1)}%`;
}

/**
 * Truncate text to a maximum length
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncate(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Generate a unique ID
 * @param {string} prefix - Optional prefix
 * @returns {string} Unique ID
 */
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce a function
 * @param {Function} func - The function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Deep clone an object
 * @param {Object} obj - The object to clone
 * @returns {Object} Cloned object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param {*} value - The value to check
 * @returns {boolean} True if empty
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Capitalize the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert a string to title case
 * @param {string} str - The string to convert
 * @returns {string} Title case string
 */
export function toTitleCase(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Parse query string to object
 * @param {string} queryString - The query string to parse
 * @returns {Object} Parsed query object
 */
export function parseQueryString(queryString) {
  if (!queryString) return {};
  const query = queryString.startsWith('?') ? queryString.slice(1) : queryString;
  return Object.fromEntries(new URLSearchParams(query));
}

/**
 * Build query string from object
 * @param {Object} params - The parameters object
 * @returns {string} Query string
 */
export function buildQueryString(params) {
  if (!params || Object.keys(params).length === 0) return '';
  return '?' + new URLSearchParams(params).toString();
}
