// AtlasDev Budget Module - Utility Functions
// VanRock Holdings LLC

import { BudgetCategory, BudgetLineItem, BudgetSummary } from '../types/budget.types';

// ============================================
// FORMATTING UTILITIES
// ============================================

export const formatCurrency = (
  amount: number,
  options: { showCents?: boolean; showSign?: boolean; compact?: boolean } = {}
): string => {
  const { showCents = false, showSign = false, compact = false } = options;
  
  if (compact && Math.abs(amount) >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (compact && Math.abs(amount) >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(Math.abs(amount));
  
  if (showSign && amount > 0) return `+${formatted}`;
  if (amount < 0) return `-${formatted.replace('-', '')}`;
  return formatted;
};

export const formatPercent = (
  value: number,
  options: { decimals?: number; showSign?: boolean } = {}
): string => {
  const { decimals = 1, showSign = false } = options;
  const formatted = `${(value * 100).toFixed(decimals)}%`;
  if (showSign && value > 0) return `+${formatted}`;
  return formatted;
};

export const formatNumber = (
  value: number,
  options: { decimals?: number; compact?: boolean } = {}
): string => {
  const { decimals = 0, compact = false } = options;
  
  if (compact && Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (compact && Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatMultiple = (value: number): string => {
  return `${value.toFixed(2)}x`;
};

// ============================================
// PARSING UTILITIES
// ============================================

export const parseCurrency = (value: string): number => {
  const cleaned = value.replace(/[$,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const parsePercent = (value: string): number => {
  const cleaned = value.replace(/[%\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed / 100;
};

// ============================================
// CALCULATION UTILITIES
// ============================================

export const calculateCategoryTotal = (category: BudgetCategory): number => {
  return category.lineItems.reduce((sum, item) => sum + (item.budgetAmount || 0), 0);
};

export const calculateCategoryActual = (category: BudgetCategory): number => {
  return category.lineItems.reduce((sum, item) => sum + (item.actualAmount || 0), 0);
};

export const calculateBudgetSummary = (categories: BudgetCategory[]): BudgetSummary => {
  const totalBudget = categories.reduce((sum, cat) => sum + calculateCategoryTotal(cat), 0);
  const totalActual = categories.reduce((sum, cat) => sum + calculateCategoryActual(cat), 0);
  const variance = totalActual - totalBudget;
  const percentComplete = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;
  
  return { totalBudget, totalActual, variance, percentComplete };
};

export const calculatePerUnit = (total: number, units: number): number => {
  return units > 0 ? total / units : 0;
};

export const calculatePerSF = (total: number, sqft: number): number => {
  return sqft > 0 ? total / sqft : 0;
};

export const calculatePercentOfTotal = (amount: number, total: number): number => {
  return total > 0 ? amount / total : 0;
};

// ============================================
// DEAL ANALYSIS CALCULATIONS
// ============================================

export const calculateAcquisitionCosts = (
  landPrice: number,
  closingCostRate: number,
  acquisitionFeeRate: number,
  ddFee: number,
  phcFees: number
): number => {
  const closingCosts = landPrice * closingCostRate;
  const acquisitionFee = landPrice * acquisitionFeeRate;
  return landPrice + closingCosts + acquisitionFee + ddFee + phcFees;
};

export const calculateSiteHorizontalCosts = (
  grading: number,
  subdivision: number,
  utilities: number,
  driveway: number,
  other: number
): number => {
  return grading + subdivision + utilities + driveway + other;
};

export const calculateVerticalCosts = (
  sticksAndBricks: number,
  softCosts: number,
  siteSpecific: number,
  upgrades: number,
  builderProfitRate: number
): number => {
  const baseCost = sticksAndBricks + softCosts + siteSpecific + upgrades;
  const builderProfit = sticksAndBricks * builderProfitRate;
  return baseCost + builderProfit;
};

export const calculateFinancingCosts = (
  loanAmount: number,
  interestRate: number,
  termMonths: number,
  originationRate: number
): { origination: number; interestReserve: number; total: number } => {
  const origination = loanAmount * originationRate;
  const interestReserve = loanAmount * (interestRate / 12) * termMonths;
  return {
    origination,
    interestReserve,
    total: origination + interestReserve,
  };
};

export const calculateNetProceeds = (
  salePrice: number,
  commissionRate: number,
  closingCostRate: number,
  incentives: number
): number => {
  const commission = salePrice * commissionRate;
  const closingCosts = salePrice * closingCostRate;
  return salePrice - commission - closingCosts - incentives;
};

export const calculateProfit = (
  netProceeds: number,
  totalCost: number
): { grossProfit: number; grossMargin: number } => {
  const grossProfit = netProceeds - totalCost;
  const grossMargin = totalCost > 0 ? grossProfit / totalCost : 0;
  return { grossProfit, grossMargin };
};

export const calculateROI = (profit: number, equity: number): number => {
  return equity > 0 ? profit / equity : 0;
};

export const calculateCashMultiple = (profit: number, equity: number): number => {
  return equity > 0 ? (equity + profit) / equity : 0;
};

// ============================================
// BTR-SPECIFIC CALCULATIONS
// ============================================

export const calculateGrossPotentialIncome = (
  units: number,
  avgMonthlyRent: number
): number => {
  return units * avgMonthlyRent * 12;
};

export const calculateDevelopmentYield = (
  gpi: number,
  totalCost: number
): number => {
  return totalCost > 0 ? gpi / totalCost : 0;
};

export const calculateStabilizedNOI = (
  gpi: number,
  operatingMargin: number = 0.6
): number => {
  return gpi * operatingMargin;
};

export const calculateImpliedValue = (
  noi: number,
  capRate: number
): number => {
  return capRate > 0 ? noi / capRate : 0;
};

// ============================================
// BTS-SPECIFIC CALCULATIONS
// ============================================

export const calculateAbsorptionSchedule = (
  totalHomes: number,
  absorptionRate: number,
  constructionLag: number = 6
): { month: number; starts: number; completions: number; sales: number; closings: number }[] => {
  const schedule = [];
  let cumulativeStarts = 0;
  let cumulativeCompletions = 0;
  let cumulativeSales = 0;
  let cumulativeClosings = 0;
  
  const totalMonths = Math.ceil(totalHomes / absorptionRate) + constructionLag + 2;
  
  for (let month = 1; month <= totalMonths; month++) {
    const starts = cumulativeStarts < totalHomes ? Math.min(absorptionRate, totalHomes - cumulativeStarts) : 0;
    const completions = month > constructionLag && cumulativeCompletions < totalHomes 
      ? Math.min(absorptionRate, totalHomes - cumulativeCompletions) : 0;
    const sales = cumulativeSales < totalHomes ? Math.min(absorptionRate, totalHomes - cumulativeSales) : 0;
    const closings = month > constructionLag + 1 && cumulativeClosings < totalHomes
      ? Math.min(absorptionRate, totalHomes - cumulativeClosings) : 0;
    
    cumulativeStarts += starts;
    cumulativeCompletions += completions;
    cumulativeSales += sales;
    cumulativeClosings += closings;
    
    schedule.push({ month, starts, completions, sales, closings });
    
    if (cumulativeClosings >= totalHomes) break;
  }
  
  return schedule;
};

// ============================================
// ID GENERATION
// ============================================

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// ============================================
// VALIDATION
// ============================================

export const validatePositiveNumber = (value: number): boolean => {
  return typeof value === 'number' && value >= 0 && isFinite(value);
};

export const validatePercentage = (value: number): boolean => {
  return typeof value === 'number' && value >= 0 && value <= 1;
};

// ============================================
// DEFAULT VALUES
// ============================================

export const DEFAULT_FINANCING = {
  constructionLoanLTC: 0.90,
  interestRate: 0.1025,
  loanTermMonths: 7,
  originationFee: 0.01,
  builderProfit: 0.20,
  salesCommission: 0.05,
  closingCosts: 0.005,
  acquisitionFee: 0.03,
  buyerClosingCosts: 0.015,
};

export const DEFAULT_BTR_ASSUMPTIONS = {
  operatingMargin: 0.60,
  exitCapRate: 0.055,
  constructionMonths: 24,
};

export const DEFAULT_BTS_ASSUMPTIONS = {
  absorptionRate: 4,
  constructionLagMonths: 6,
  realtorCoopRate: 0.025,
  inHouseSalesRate: 0.015,
};
