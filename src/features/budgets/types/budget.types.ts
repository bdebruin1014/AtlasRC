// AtlasDev Budget Module - Type Definitions
// VanRock Holdings LLC

// ============================================
// COMMON TYPES
// ============================================

export type ProjectType = 
  | 'horizontal_lot_development'
  | 'build_to_rent'
  | 'build_to_sell'
  | 'individual_spec';

export type BudgetStatus = 'draft' | 'approved' | 'in_progress' | 'complete';

export interface BudgetLineItem {
  id: string;
  description: string;
  budgetAmount: number;
  actualAmount?: number;
  notes?: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  lineItems: BudgetLineItem[];
  expanded?: boolean;
}

export interface BudgetSummary {
  totalBudget: number;
  totalActual: number;
  variance: number;
  percentComplete: number;
}

// ============================================
// HORIZONTAL LOT DEVELOPMENT
// ============================================

export interface HorizontalLotBudget {
  projectInfo: {
    projectName: string;
    location: string;
    totalAcreage: number;
    totalLots: number;
    avgLotSize: number;
    developableAcres: number;
  };
  categories: {
    landAcquisition: BudgetCategory;
    entitlementEngineering: BudgetCategory;
    siteWorkGrading: BudgetCategory;
    infrastructureRoads: BudgetCategory;
    infrastructureUtilities: BudgetCategory;
    amenitiesLandscaping: BudgetCategory;
    softCosts: BudgetCategory;
    financingCosts: BudgetCategory;
    contingency: BudgetCategory;
  };
}

export interface HorizontalDrawScheduleItem {
  drawNumber: number;
  month: number;
  category: string;
  amount: number;
  inspectorApproval?: string;
  dateFunded?: string;
}

// ============================================
// BUILD TO RENT COMMUNITY
// ============================================

export interface BTRBudget {
  projectInfo: {
    projectName: string;
    location: string;
    totalAcreage: number;
    totalHomes: number;
    avgHomeSF: number;
    density: number;
    avgMonthlyRent: number;
  };
  categories: {
    landAcquisition: BudgetCategory;
    horizontalDevelopment: BudgetCategory;
    verticalConstruction: BudgetCategory;
    communityAmenities: BudgetCategory;
    landscapingCommonAreas: BudgetCategory;
    preOpeningLeaseUp: BudgetCategory;
    softCosts: BudgetCategory;
    financingCosts: BudgetCategory;
    contingency: BudgetCategory;
  };
  unitMix: BTRUnitMixItem[];
}

export interface BTRUnitMixItem {
  planName: string;
  type: 'SFH' | 'TH';
  sqFt: number;
  bedBath: string;
  units: number;
  monthlyRent: number;
}

export interface BTRMetrics {
  totalDevelopmentCost: number;
  costPerHome: number;
  costPerSF: number;
  grossPotentialIncome: number;
  developmentYield: number;
  stabilizedNOI: number;
  impliedExitValue: number;
}

// ============================================
// BUILD TO SELL COMMUNITY
// ============================================

export interface BTSBudget {
  projectInfo: {
    projectName: string;
    location: string;
    totalAcreage: number;
    totalHomes: number;
    avgHomeSF: number;
    avgSalePrice: number;
    absorptionRate: number;
  };
  categories: {
    landAcquisition: BudgetCategory;
    horizontalDevelopment: BudgetCategory;
    verticalConstruction: BudgetCategory;
    modelHomeComplex: BudgetCategory;
    salesMarketing: BudgetCategory;
    softCostsDevelopment: BudgetCategory;
    financingCosts: BudgetCategory;
    contingency: BudgetCategory;
  };
  productMix: BTSProductMixItem[];
  absorptionSchedule: BTSAbsorptionItem[];
}

export interface BTSProductMixItem {
  planName: string;
  type: 'SFH' | 'TH';
  sqFt: number;
  bedBath: string;
  numHomes: number;
  basePrice: number;
  avgUpgrades: number;
}

export interface BTSAbsorptionItem {
  month: number;
  starts: number;
  completions: number;
  sales: number;
  closings: number;
}

export interface BTSMetrics {
  totalRevenue: number;
  totalProjectCost: number;
  grossProfit: number;
  grossMargin: number;
  profitPerHome: number;
  requiredEquity: number;
  returnOnEquity: number;
}

// ============================================
// INDIVIDUAL SPEC HOME
// ============================================

export interface SpecHomeBudget {
  projectInfo: {
    projectName: string;
    address: string;
    cityStateZip: string;
    parcelNumber: string;
  };
  planSelection: {
    planName: string;
    heatedSqFt: number;
    bedsBaths: string;
    garage: string;
    upgradePackage: 'none' | 'classic' | 'elegance' | 'harmony';
  };
  categories: {
    lotAcquisition: BudgetCategory;
    siteSpecificCosts: BudgetCategory;
    verticalConstruction: BudgetCategory;
    upgradePackage: BudgetCategory;
    softCosts: BudgetCategory;
    builderProfit: BudgetCategory;
    financingCosts: BudgetCategory;
    contingency: BudgetCategory;
  };
  profitAnalysis: {
    projectedSalePrice: number;
    salesCommissionRate: number;
    sellerClosingRate: number;
    incentives: number;
  };
}

export interface SpecHomeMetrics {
  totalProjectCost: number;
  netSalesProceeds: number;
  grossProfit: number;
  grossMargin: number;
  requiredEquity: number;
  returnOnEquity: number;
  cashMultiple: number;
  costPerSF: number;
  salePricePerSF: number;
}

// ============================================
// PIPELINE DEAL ANALYZER
// ============================================

export interface DealAnalysis {
  projectInfo: {
    projectName: string;
    address: string;
    parcelNumber: string;
    homeType: 'SFH' | 'TH';
    units: number;
  };
  planSelection: {
    planName: string;
    sqFt: number;
    bedsBaths: string;
    lotWidth: number;
    lotDepth: number;
    upgradePackage: 'none' | 'classic' | 'elegance' | 'harmony';
  };
  acquisitionCosts: {
    landPrice: number;
    closingCostRate: number;
    acquisitionFeeRate: number;
    ddFee: number;
    phcFees: number;
  };
  siteHorizontalCosts: {
    grading: number;
    subdivision: number;
    utilities: number;
    driveway: number;
    other: number;
  };
  verticalBuildCosts: {
    sticksAndBricks: number;
    softCosts: number;
    siteSpecific: number;
    upgrades: number;
    builderProfitRate: number;
  };
  financing: {
    ltcRate: number;
    interestRate: number;
    termMonths: number;
    originationRate: number;
  };
  salesProjections: {
    salePrice: number;
    commissionRate: number;
    closingCostRate: number;
    incentives: number;
  };
}

export interface DealMetrics {
  totalAcquisitionCost: number;
  totalSiteCost: number;
  totalVerticalCost: number;
  totalDevelopmentCost: number;
  loanAmount: number;
  interestReserve: number;
  requiredEquity: number;
  netProceeds: number;
  grossProfit: number;
  grossMargin: number;
  netProfitAfterFinancing: number;
  roi: number;
  costPerSF: number;
  salePricePerSF: number;
  cashMultiple: number;
}

export interface TimelineMilestone {
  id: string;
  name: string;
  targetDate?: string;
  actualDate?: string;
  notes?: string;
}

// ============================================
// CONSTRUCTION BUDGET (SOV)
// ============================================

export interface ConstructionBudget {
  projectInfo: {
    projectName: string;
    address: string;
    planName: string;
    sqFt: number;
  };
  categories: BudgetCategory[];
}

export interface SOVLineItem {
  itemNumber: number;
  description: string;
  contractAmount: number;
  priorDraws: number;
  thisDraw: number;
}

// ============================================
// UTILITY TYPES
// ============================================

export interface CurrencyFormatOptions {
  showCents?: boolean;
  showSign?: boolean;
}

export interface PercentFormatOptions {
  decimals?: number;
}

export type SortDirection = 'asc' | 'desc';

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  format?: 'currency' | 'percent' | 'number' | 'text';
  width?: string;
  sortable?: boolean;
  editable?: boolean;
}
