// AtlasDev Budget Module - Utility Functions

export const formatCurrency = (amount, options = {}) => {
  const { showCents = false, compact = false } = options;
  
  if (compact && Math.abs(amount) >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (compact && Math.abs(amount) >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(amount);
};

export const formatPercent = (value, options = {}) => {
  const { decimals = 1 } = options;
  return `${(value * 100).toFixed(decimals)}%`;
};

export const formatNumber = (value, options = {}) => {
  const { decimals = 0 } = options;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const parseCurrency = (value) => {
  const cleaned = String(value).replace(/[$,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const parsePercent = (value) => {
  const cleaned = String(value).replace(/[%\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed / 100;
};

export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const DEFAULT_FINANCING = {
  constructionLoanLTC: 0.90,
  interestRate: 0.1025,
  loanTermMonths: 7,
  originationFee: 0.01,
  builderProfit: 0.20,
  salesCommission: 0.05,
  closingCosts: 0.005,
  acquisitionFee: 0.03,
};
