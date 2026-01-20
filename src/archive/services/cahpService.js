// src/services/cahpService.js
// CAHP Safe Harbor Tax Abatement Compliance Service

import { supabase } from '@/lib/supabase';

// ============================================
// NONPROFIT ENTITY INFORMATION
// ============================================

export const CAHP_ENTITY_INFO = {
  parent: {
    name: 'Carolina Affordable Housing Project, Inc.',
    type: 'South Carolina nonprofit corporation',
    irsStatus: '501(c)(3) tax-exempt organization',
    address: '333 Wade Hampton Blvd, Greenville, SC 29609',
  },
  subsidiary: {
    name: 'CAHP SC, LLC',
    type: 'South Carolina limited liability company',
    ownership: '100% wholly-owned by Carolina Affordable Housing Project, Inc.',
    role: 'Managing Member / Nonprofit Managing Member for qualified properties',
    address: '333 Wade Hampton Blvd, Greenville, SC 29609',
  },
  legalReferences: {
    scStatute: 'S.C. Code § 12-37-220(B)(11)(e)',
    irsRevProc: 'IRS Revenue Procedure 96-32',
    hudIncomeLimits: 'https://www.huduser.gov/portal/datasets/il.html',
    scDorForms: 'https://dor.sc.gov/forms',
  },
};

// ============================================
// CONSTANTS & DEFINITIONS
// ============================================

export const INCOME_CATEGORIES = {
  VERY_LOW: 'very_low',      // ≤50% AMI
  LOW: 'low',                 // 51-80% AMI
  OVER_INCOME: 'over_income', // >80% AMI but was previously qualifying
  MARKET_RATE: 'market_rate', // >80% AMI, not previously qualifying
  VACANT: 'vacant',           // No tenant
};

export const INCOME_CATEGORY_LABELS = {
  [INCOME_CATEGORIES.VERY_LOW]: 'Very Low Income (≤50% AMI)',
  [INCOME_CATEGORIES.LOW]: 'Low Income (51-80% AMI)',
  [INCOME_CATEGORIES.OVER_INCOME]: 'Over-Income (Pending Cure)',
  [INCOME_CATEGORIES.MARKET_RATE]: 'Market Rate',
};

export const INCOME_CATEGORY_COLORS = {
  [INCOME_CATEGORIES.VERY_LOW]: 'emerald',
  [INCOME_CATEGORIES.LOW]: 'blue',
  [INCOME_CATEGORIES.OVER_INCOME]: 'orange',
  [INCOME_CATEGORIES.MARKET_RATE]: 'gray',
};

export const EXEMPTION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  ACTIVE: 'active',
  EXPIRED: 'expired',
  REVOKED: 'revoked',
};

export const CERTIFICATION_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const COMPLIANCE_STATUS = {
  COMPLIANT: 'compliant',
  AT_RISK: 'at_risk',
  NON_COMPLIANT: 'non_compliant',
};

// Safe Harbor thresholds per IRS Revenue Procedure 96-32
// Must meet: 75% at ≤80% AMI AND (20% at ≤50% AMI OR 40% at ≤60% AMI)
export const SAFE_HARBOR_THRESHOLDS = {
  QUALIFYING_MIN_PCT: 75,        // At least 75% must be ≤80% AMI
  MARKET_RATE_MAX_PCT: 25,       // Maximum 25% can be market rate (>80% AMI)
  OVER_INCOME_TRIGGER: 140,      // Tenant becomes over-income at 140% of limit
  
  // Deep affordability options (choose one):
  OPTION_A: {
    name: '20% at 50% AMI',
    threshold_pct: 20,
    ami_limit: 50,
    description: '20% of units at ≤50% AMI (Very Low Income)',
  },
  OPTION_B: {
    name: '40% at 60% AMI', 
    threshold_pct: 40,
    ami_limit: 60,
    description: '40% of units at ≤60% AMI (Low Income)',
  },
};

// CAHP Fee Structure
export const FEE_STRUCTURE = {
  ONBOARDING_FEE: 3500,           // One-time onboarding fee
  ANNUAL_FEE_PERCENTAGE: 0.20,    // 20% of tax savings
  // Lump sum reimbursement due at SCDOR approval
  // Ongoing: 20% invoiced evenly over 12 months
};

// ============================================
// AMI LIMITS (2024 Greenville-Anderson MSA)
// These should be updated annually from HUD
// ============================================

export const AMI_LIMITS_2024 = {
  area: 'Greenville-Anderson-Mauldin, SC MSA',
  median_income: 82900,
  limits_by_household_size: {
    // very_low = 50% AMI, low_60 = 60% AMI, low = 80% AMI
    1: { very_low: 29050, low_60: 34860, low: 46450 },
    2: { very_low: 33200, low_60: 39840, low: 53100 },
    3: { very_low: 37350, low_60: 44820, low: 59750 },
    4: { very_low: 41500, low_60: 49800, low: 66350 },
    5: { very_low: 44850, low_60: 53820, low: 71700 },
    6: { very_low: 48150, low_60: 57780, low: 77000 },
    7: { very_low: 51450, low_60: 61740, low: 82300 },
    8: { very_low: 54750, low_60: 65700, low: 87650 },
  }
};

// Income category enum - updated for 60% threshold
export const INCOME_CATEGORIES_DETAILED = {
  VERY_LOW_50: 'very_low_50',   // ≤50% AMI
  LOW_60: 'low_60',              // 51-60% AMI
  LOW_80: 'low_80',              // 61-80% AMI
  OVER_INCOME: 'over_income',    // >80% AMI but was previously qualifying
  MARKET_RATE: 'market_rate',    // >80% AMI
};

// ============================================
// PROPERTY CRUD
// ============================================

export async function createCAHPProperty({
  propertyName,
  propertyAddress,
  county,
  parcelNumber,
  totalUnits,
  effectiveDate,
  llcEntity,
  cahpOwnershipPercentage = 1.0,
  annualAssessedValue,
  standardTaxRate = 0.06,
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const estimatedTaxSavings = annualAssessedValue * standardTaxRate;

    const { data, error } = await supabase
      .from('cahp_properties')
      .insert({
        property_name: propertyName,
        property_address: propertyAddress,
        county,
        parcel_number: parcelNumber,
        total_units: totalUnits,
        effective_date: effectiveDate,
        llc_entity: llcEntity,
        cahp_ownership_percentage: cahpOwnershipPercentage,
        annual_assessed_value: annualAssessedValue,
        standard_tax_rate: standardTaxRate,
        estimated_tax_savings: estimatedTaxSavings,
        dor_exemption_status: EXEMPTION_STATUS.PENDING,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating CAHP property:', error);
    return { data: null, error };
  }
}

export async function getCAHPProperty(propertyId) {
  const { data, error } = await supabase
    .from('cahp_properties')
    .select(`
      *,
      tenants:cahp_tenants(*),
      certifications:cahp_certifications(*)
    `)
    .eq('id', propertyId)
    .single();

  return { data, error };
}

export async function getAllCAHPProperties() {
  const { data, error } = await supabase
    .from('cahp_properties')
    .select('*')
    .order('property_name');

  return { data, error };
}

export async function updateCAHPProperty(propertyId, updates) {
  // Recalculate tax savings if assessed value or rate changed
  if (updates.annual_assessed_value || updates.standard_tax_rate) {
    const { data: current } = await supabase
      .from('cahp_properties')
      .select('annual_assessed_value, standard_tax_rate')
      .eq('id', propertyId)
      .single();

    const assessedValue = updates.annual_assessed_value || current.annual_assessed_value;
    const taxRate = updates.standard_tax_rate || current.standard_tax_rate;
    updates.estimated_tax_savings = assessedValue * taxRate;
  }

  const { data, error } = await supabase
    .from('cahp_properties')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', propertyId)
    .select()
    .single();

  return { data, error };
}

export async function deleteCAHPProperty(propertyId) {
  const { error } = await supabase
    .from('cahp_properties')
    .delete()
    .eq('id', propertyId);

  return { success: !error, error };
}

// ============================================
// TENANT CRUD
// ============================================

export async function createTenant({
  propertyId,
  unitNumber,
  tenantName,
  moveInDate,
  leaseExpiration,
  householdSize,
  grossAnnualIncome,
  monthlyRent,
  utilityAllowance = 0,
}) {
  try {
    // Calculate AMI percentage and category
    const amiData = calculateAMIStatus(grossAnnualIncome, householdSize);

    const { data, error } = await supabase
      .from('cahp_tenants')
      .insert({
        property_id: propertyId,
        unit_number: unitNumber,
        tenant_name: tenantName,
        move_in_date: moveInDate,
        lease_expiration: leaseExpiration,
        household_size: householdSize,
        gross_annual_income: grossAnnualIncome,
        ami_percentage: amiData.amiPercentage,
        income_category: amiData.category,
        last_certification_date: new Date().toISOString().split('T')[0],
        next_recertification_due: calculateNextRecertDate(moveInDate),
        monthly_rent: monthlyRent,
        utility_allowance: utilityAllowance,
      })
      .select()
      .single();

    if (error) throw error;

    // Update property compliance after tenant change
    await updatePropertyCompliance(propertyId);

    return { data, error: null };
  } catch (error) {
    console.error('Error creating tenant:', error);
    return { data: null, error };
  }
}

export async function getTenant(tenantId) {
  const { data, error } = await supabase
    .from('cahp_tenants')
    .select(`
      *,
      property:cahp_properties(property_name, property_address)
    `)
    .eq('id', tenantId)
    .single();

  return { data, error };
}

export async function getPropertyTenants(propertyId) {
  const { data, error } = await supabase
    .from('cahp_tenants')
    .select('*')
    .eq('property_id', propertyId)
    .order('unit_number');

  return { data, error };
}

export async function updateTenant(tenantId, updates) {
  // Recalculate AMI if income or household size changed
  if (updates.gross_annual_income !== undefined || updates.household_size !== undefined) {
    const { data: current } = await supabase
      .from('cahp_tenants')
      .select('gross_annual_income, household_size, ami_percentage, income_category')
      .eq('id', tenantId)
      .single();

    const income = updates.gross_annual_income ?? current.gross_annual_income;
    const householdSize = updates.household_size ?? current.household_size;
    const previousCategory = current.income_category;

    const amiData = calculateAMIStatus(income, householdSize);
    updates.ami_percentage = amiData.amiPercentage;
    
    // Handle over-income transitions
    if (previousCategory !== INCOME_CATEGORIES.MARKET_RATE && 
        amiData.category === INCOME_CATEGORIES.MARKET_RATE) {
      // Was qualifying, now over 80% - mark as over-income
      updates.income_category = INCOME_CATEGORIES.OVER_INCOME;
    } else {
      updates.income_category = amiData.category;
    }
  }

  const { data, error } = await supabase
    .from('cahp_tenants')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', tenantId)
    .select()
    .single();

  if (data) {
    // Update property compliance
    await updatePropertyCompliance(data.property_id);
  }

  return { data, error };
}

export async function deleteTenant(tenantId) {
  // Get property ID first
  const { data: tenant } = await supabase
    .from('cahp_tenants')
    .select('property_id')
    .eq('id', tenantId)
    .single();

  const { error } = await supabase
    .from('cahp_tenants')
    .delete()
    .eq('id', tenantId);

  if (!error && tenant) {
    await updatePropertyCompliance(tenant.property_id);
  }

  return { success: !error, error };
}

export async function recertifyTenant(tenantId, {
  grossAnnualIncome,
  householdSize,
  documentationNotes,
}) {
  const amiData = calculateAMIStatus(grossAnnualIncome, householdSize);
  
  const { data: current } = await supabase
    .from('cahp_tenants')
    .select('income_category, move_in_date')
    .eq('id', tenantId)
    .single();

  let newCategory = amiData.category;
  
  // Handle over-income at 140% threshold
  if (current.income_category !== INCOME_CATEGORIES.MARKET_RATE && 
      amiData.amiPercentage > SAFE_HARBOR_THRESHOLDS.OVER_INCOME_TRIGGER) {
    newCategory = INCOME_CATEGORIES.OVER_INCOME;
  }

  const { data, error } = await supabase
    .from('cahp_tenants')
    .update({
      gross_annual_income: grossAnnualIncome,
      household_size: householdSize,
      ami_percentage: amiData.amiPercentage,
      income_category: newCategory,
      last_certification_date: new Date().toISOString().split('T')[0],
      next_recertification_due: calculateNextRecertDate(current.move_in_date),
      recertification_notes: documentationNotes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', tenantId)
    .select()
    .single();

  if (data) {
    // Log recertification
    await logTenantCertification(tenantId, {
      certification_type: 'annual_recert',
      income: grossAnnualIncome,
      household_size: householdSize,
      ami_percentage: amiData.amiPercentage,
      category: newCategory,
    });

    await updatePropertyCompliance(data.property_id);
  }

  return { data, error };
}

// ============================================
// COMPLIANCE CALCULATIONS
// ============================================

export function calculateAMIStatus(grossAnnualIncome, householdSize) {
  const limits = AMI_LIMITS_2024.limits_by_household_size[householdSize] || 
                 AMI_LIMITS_2024.limits_by_household_size[4]; // Default to 4-person if invalid

  const amiPercentage = (grossAnnualIncome / AMI_LIMITS_2024.median_income) * 100;

  let category;
  let detailedCategory;
  
  if (grossAnnualIncome <= limits.very_low) {
    category = INCOME_CATEGORIES.VERY_LOW;
    detailedCategory = INCOME_CATEGORIES_DETAILED.VERY_LOW_50;
  } else if (grossAnnualIncome <= limits.low_60) {
    category = INCOME_CATEGORIES.LOW;
    detailedCategory = INCOME_CATEGORIES_DETAILED.LOW_60;
  } else if (grossAnnualIncome <= limits.low) {
    category = INCOME_CATEGORIES.LOW;
    detailedCategory = INCOME_CATEGORIES_DETAILED.LOW_80;
  } else {
    category = INCOME_CATEGORIES.MARKET_RATE;
    detailedCategory = INCOME_CATEGORIES_DETAILED.MARKET_RATE;
  }

  return {
    amiPercentage: Math.round(amiPercentage * 10) / 10,
    category,
    detailedCategory,
    limits,
    qualifiesAt50: grossAnnualIncome <= limits.very_low,
    qualifiesAt60: grossAnnualIncome <= limits.low_60,
    qualifiesAt80: grossAnnualIncome <= limits.low,
  };
}

export function calculateNextRecertDate(moveInDate) {
  const moveIn = new Date(moveInDate);
  const nextYear = new Date(moveIn);
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  
  // Due 90 days before anniversary
  nextYear.setDate(nextYear.getDate() - 90);
  
  // If already past, push to next year
  if (nextYear < new Date()) {
    nextYear.setFullYear(nextYear.getFullYear() + 1);
  }
  
  return nextYear.toISOString().split('T')[0];
}

export async function calculatePropertyCompliance(propertyId) {
  const { data: property } = await supabase
    .from('cahp_properties')
    .select('total_units')
    .eq('id', propertyId)
    .single();

  const { data: tenants } = await supabase
    .from('cahp_tenants')
    .select('income_category, ami_percentage, gross_annual_income, household_size')
    .eq('property_id', propertyId)
    .eq('is_active', true);

  if (!property || !tenants) {
    return null;
  }

  return calculateComplianceFromTenants(tenants, property.total_units);
}

// Standalone compliance calculator for rent roll analysis
export function calculateComplianceFromTenants(tenants, totalUnits) {
  const occupiedUnits = tenants.length;
  const vacantUnits = totalUnits - occupiedUnits;

  // Count by detailed category
  let at50AMI = 0;      // ≤50% AMI
  let at51to60AMI = 0;  // 51-60% AMI
  let at61to80AMI = 0;  // 61-80% AMI
  let overIncomeCount = 0;
  let marketRateCount = 0;

  for (const tenant of tenants) {
    // Recalculate if we have raw income data
    if (tenant.gross_annual_income && tenant.household_size) {
      const status = calculateAMIStatus(tenant.gross_annual_income, tenant.household_size);
      if (status.qualifiesAt50) {
        at50AMI++;
      } else if (status.qualifiesAt60) {
        at51to60AMI++;
      } else if (status.qualifiesAt80) {
        at61to80AMI++;
      } else {
        marketRateCount++;
      }
    } else {
      // Fall back to stored category
      switch (tenant.income_category) {
        case INCOME_CATEGORIES.VERY_LOW:
          at50AMI++;
          break;
        case INCOME_CATEGORIES.LOW:
          // Assume 51-80% range if no detailed breakdown
          at61to80AMI++;
          break;
        case INCOME_CATEGORIES.OVER_INCOME:
          overIncomeCount++;
          break;
        case INCOME_CATEGORIES.MARKET_RATE:
        default:
          marketRateCount++;
      }
    }
  }

  // Calculate totals
  const at60AMIOrLess = at50AMI + at51to60AMI;
  const at80AMIOrLess = at60AMIOrLess + at61to80AMI;
  const totalMarketRate = marketRateCount + overIncomeCount;

  // For Safe Harbor, use total units as denominator (not just occupied)
  const denominator = totalUnits > 0 ? totalUnits : 1;
  
  // Calculate percentages
  const pct50AMI = (at50AMI / denominator) * 100;
  const pct60AMI = (at60AMIOrLess / denominator) * 100;
  const pct80AMI = (at80AMIOrLess / denominator) * 100;
  const pctMarketRate = (totalMarketRate / denominator) * 100;

  // Check thresholds
  const meetsQualifyingThreshold = pct80AMI >= SAFE_HARBOR_THRESHOLDS.QUALIFYING_MIN_PCT;
  const meetsMarketRateLimit = pctMarketRate <= SAFE_HARBOR_THRESHOLDS.MARKET_RATE_MAX_PCT;
  
  // Deep affordability options
  const meetsOptionA = pct50AMI >= SAFE_HARBOR_THRESHOLDS.OPTION_A.threshold_pct;
  const meetsOptionB = pct60AMI >= SAFE_HARBOR_THRESHOLDS.OPTION_B.threshold_pct;
  const meetsDeepAffordability = meetsOptionA || meetsOptionB;

  // Overall compliance
  const isCompliant = meetsQualifyingThreshold && meetsMarketRateLimit && meetsDeepAffordability;

  // Determine status
  let status = COMPLIANCE_STATUS.COMPLIANT;
  
  if (!isCompliant) {
    status = COMPLIANCE_STATUS.NON_COMPLIANT;
  } else if (
    pct80AMI < SAFE_HARBOR_THRESHOLDS.QUALIFYING_MIN_PCT + 5 ||
    (!meetsOptionA && !meetsOptionB) ||
    (meetsOptionA && pct50AMI < SAFE_HARBOR_THRESHOLDS.OPTION_A.threshold_pct + 3) ||
    (meetsOptionB && pct60AMI < SAFE_HARBOR_THRESHOLDS.OPTION_B.threshold_pct + 5)
  ) {
    status = COMPLIANCE_STATUS.AT_RISK;
  }

  return {
    totalUnits,
    occupiedUnits,
    vacantUnits,
    
    // Counts by category
    unitsAt50AMI: at50AMI,
    unitsAt51to60AMI: at51to60AMI,
    unitsAt61to80AMI: at61to80AMI,
    unitsAt60AMIOrLess: at60AMIOrLess,
    unitsAt80AMIOrLess: at80AMIOrLess,
    overIncomeUnits: overIncomeCount,
    marketRateUnits: totalMarketRate,
    
    // Percentages
    pct50AMI: Math.round(pct50AMI * 10) / 10,
    pct60AMI: Math.round(pct60AMI * 10) / 10,
    pct80AMI: Math.round(pct80AMI * 10) / 10,
    pctMarketRate: Math.round(pctMarketRate * 10) / 10,
    
    // Threshold checks
    meetsQualifyingThreshold,    // 75% at ≤80% AMI
    meetsMarketRateLimit,        // ≤25% market rate
    meetsOptionA,                // 20% at ≤50% AMI
    meetsOptionB,                // 40% at ≤60% AMI
    meetsDeepAffordability,      // Either Option A or B
    
    // Which option is being used
    deepAffordabilityOption: meetsOptionA ? 'A' : (meetsOptionB ? 'B' : null),
    
    // Overall
    isCompliant,
    complianceStatus: status,
    
    // For backward compatibility
    veryLowIncomeUnits: at50AMI,
    lowIncomeUnits: at60AMIOrLess + at61to80AMI,
    pctVeryLowIncome: Math.round(pct50AMI * 10) / 10,
    pctLowIncome: Math.round(pct80AMI * 10) / 10,
  };
}

export async function updatePropertyCompliance(propertyId) {
  const compliance = await calculatePropertyCompliance(propertyId);
  if (!compliance) return;

  // Save compliance snapshot
  await supabase
    .from('cahp_compliance_snapshots')
    .insert({
      property_id: propertyId,
      snapshot_date: new Date().toISOString().split('T')[0],
      total_occupied_units: compliance.occupiedUnits,
      very_low_income_units: compliance.veryLowIncomeUnits,
      low_income_units: compliance.lowIncomeUnits,
      over_income_units: compliance.overIncomeUnits,
      market_rate_units: compliance.marketRateUnits,
      vacant_units: compliance.vacantUnits,
      pct_low_income: compliance.pctLowIncome,
      pct_very_low_income: compliance.pctVeryLowIncome,
      compliance_status: compliance.complianceStatus,
    });

  // Update property's current compliance status
  await supabase
    .from('cahp_properties')
    .update({
      current_compliance_status: compliance.complianceStatus,
      last_compliance_check: new Date().toISOString(),
    })
    .eq('id', propertyId);

  return compliance;
}

// ============================================
// CERTIFICATIONS
// ============================================

export async function createCertification(propertyId, certificationYear) {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Calculate current compliance
  const compliance = await calculatePropertyCompliance(propertyId);
  
  const { data, error } = await supabase
    .from('cahp_certifications')
    .insert({
      property_id: propertyId,
      certification_year: certificationYear,
      status: CERTIFICATION_STATUS.DRAFT,
      compliance_snapshot: compliance,
      created_by: user?.id,
    })
    .select()
    .single();

  return { data, error };
}

export async function getCertification(certificationId) {
  const { data, error } = await supabase
    .from('cahp_certifications')
    .select(`
      *,
      property:cahp_properties(property_name, property_address, llc_entity, cahp_ownership_percentage)
    `)
    .eq('id', certificationId)
    .single();

  return { data, error };
}

export async function getPropertyCertifications(propertyId) {
  const { data, error } = await supabase
    .from('cahp_certifications')
    .select('*')
    .eq('property_id', propertyId)
    .order('certification_year', { ascending: false });

  return { data, error };
}

export async function submitCertification(certificationId, {
  submissionDate,
  dorConfirmationNumber,
  ownershipPercentageCertified,
  complianceDocumentationAttached,
}) {
  const { data, error } = await supabase
    .from('cahp_certifications')
    .update({
      submission_date: submissionDate,
      dor_confirmation_number: dorConfirmationNumber,
      ownership_percentage_certified: ownershipPercentageCertified,
      compliance_documentation_attached: complianceDocumentationAttached,
      status: CERTIFICATION_STATUS.SUBMITTED,
      updated_at: new Date().toISOString(),
    })
    .eq('id', certificationId)
    .select()
    .single();

  return { data, error };
}

export async function updateCertificationStatus(certificationId, status, notes = null) {
  const { data, error } = await supabase
    .from('cahp_certifications')
    .update({
      status,
      status_notes: notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', certificationId)
    .select()
    .single();

  return { data, error };
}

// ============================================
// ALERTS & NOTIFICATIONS
// ============================================

export async function getComplianceAlerts() {
  const alerts = [];

  // Get all properties
  const { data: properties } = await supabase
    .from('cahp_properties')
    .select('*');

  if (!properties) return alerts;

  for (const property of properties) {
    const compliance = await calculatePropertyCompliance(property.id);
    
    // Critical: Non-compliant
    if (compliance?.complianceStatus === COMPLIANCE_STATUS.NON_COMPLIANT) {
      alerts.push({
        type: 'critical',
        propertyId: property.id,
        propertyName: property.property_name,
        message: `Non-compliant: ${compliance.pctLowIncome}% low-income (need 75%), ${compliance.pctVeryLowIncome}% very low-income (need 20%)`,
      });
    }
    
    // Warning: At risk
    if (compliance?.complianceStatus === COMPLIANCE_STATUS.AT_RISK) {
      alerts.push({
        type: 'warning',
        propertyId: property.id,
        propertyName: property.property_name,
        message: `At risk: Compliance margins are thin. Monitor closely.`,
      });
    }

    // Check certification due date
    const now = new Date();
    const certDue = new Date(now.getFullYear(), 9, 1); // October 1
    const daysUntilCert = Math.ceil((certDue - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilCert > 0 && daysUntilCert <= 30) {
      alerts.push({
        type: 'warning',
        propertyId: property.id,
        propertyName: property.property_name,
        message: `Annual DOR certification due in ${daysUntilCert} days`,
      });
    }
  }

  // Get tenants needing recertification
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  const { data: tenantsDue } = await supabase
    .from('cahp_tenants')
    .select(`
      *,
      property:cahp_properties(property_name)
    `)
    .lte('next_recertification_due', thirtyDaysFromNow.toISOString().split('T')[0]);

  if (tenantsDue) {
    for (const tenant of tenantsDue) {
      alerts.push({
        type: 'warning',
        propertyId: tenant.property_id,
        propertyName: tenant.property?.property_name,
        tenantId: tenant.id,
        message: `Tenant recertification due: Unit ${tenant.unit_number} by ${tenant.next_recertification_due}`,
      });
    }
  }

  // Get over-income tenants
  const { data: overIncome } = await supabase
    .from('cahp_tenants')
    .select(`
      *,
      property:cahp_properties(property_name)
    `)
    .eq('income_category', INCOME_CATEGORIES.OVER_INCOME);

  if (overIncome) {
    for (const tenant of overIncome) {
      alerts.push({
        type: 'critical',
        propertyId: tenant.property_id,
        propertyName: tenant.property?.property_name,
        tenantId: tenant.id,
        message: `Over-income tenant: Unit ${tenant.unit_number} - Next available unit must go to qualifying tenant`,
      });
    }
  }

  return alerts;
}

export async function getTenantRecertificationsDue(daysAhead = 90) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  const { data, error } = await supabase
    .from('cahp_tenants')
    .select(`
      *,
      property:cahp_properties(property_name, property_address)
    `)
    .lte('next_recertification_due', futureDate.toISOString().split('T')[0])
    .order('next_recertification_due');

  return { data, error };
}

// ============================================
// REPORTING
// ============================================

export async function getPortfolioSummary() {
  const { data: properties } = await supabase
    .from('cahp_properties')
    .select('*');

  if (!properties) return null;

  let totalUnits = 0;
  let totalOccupied = 0;
  let totalVeryLow = 0;
  let totalLow = 0;
  let totalTaxSavings = 0;
  let compliantCount = 0;
  let atRiskCount = 0;
  let nonCompliantCount = 0;

  for (const property of properties) {
    const compliance = await calculatePropertyCompliance(property.id);
    if (compliance) {
      totalUnits += compliance.totalUnits;
      totalOccupied += compliance.occupiedUnits;
      totalVeryLow += compliance.veryLowIncomeUnits;
      totalLow += compliance.lowIncomeUnits;
      
      if (compliance.complianceStatus === COMPLIANCE_STATUS.COMPLIANT) compliantCount++;
      if (compliance.complianceStatus === COMPLIANCE_STATUS.AT_RISK) atRiskCount++;
      if (compliance.complianceStatus === COMPLIANCE_STATUS.NON_COMPLIANT) nonCompliantCount++;
    }
    totalTaxSavings += property.estimated_tax_savings || 0;
  }

  return {
    propertyCount: properties.length,
    totalUnits,
    totalOccupied,
    totalVeryLow,
    totalLow,
    totalTaxSavings,
    annualCAHPFees: totalTaxSavings * FEE_STRUCTURE.ANNUAL_FEE_PERCENTAGE,
    compliantCount,
    atRiskCount,
    nonCompliantCount,
    overallPctVeryLow: totalOccupied > 0 ? (totalVeryLow / totalOccupied) * 100 : 0,
    overallPctLow: totalOccupied > 0 ? ((totalVeryLow + totalLow) / totalOccupied) * 100 : 0,
  };
}

export async function getComplianceHistory(propertyId, months = 12) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const { data, error } = await supabase
    .from('cahp_compliance_snapshots')
    .select('*')
    .eq('property_id', propertyId)
    .gte('snapshot_date', startDate.toISOString().split('T')[0])
    .order('snapshot_date');

  return { data, error };
}

export async function generateRentRoll(propertyId) {
  const { data: property } = await supabase
    .from('cahp_properties')
    .select('*')
    .eq('id', propertyId)
    .single();

  const { data: tenants } = await supabase
    .from('cahp_tenants')
    .select('*')
    .eq('property_id', propertyId)
    .order('unit_number');

  if (!property || !tenants) return null;

  return {
    property,
    tenants,
    generatedAt: new Date().toISOString(),
    summary: await calculatePropertyCompliance(propertyId),
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function calculateMaxRent(householdSize, incomeCategory, amiLimits = AMI_LIMITS_2024) {
  const limits = amiLimits.limits_by_household_size[householdSize] || 
                 amiLimits.limits_by_household_size[4];
  
  let applicableIncome;
  if (incomeCategory === INCOME_CATEGORIES.VERY_LOW) {
    applicableIncome = limits.very_low;
  } else {
    applicableIncome = limits.low;
  }
  
  // 30% of monthly income
  return Math.round((applicableIncome / 12) * 0.30);
}

async function logTenantCertification(tenantId, certificationData) {
  try {
    await supabase
      .from('cahp_tenant_certifications')
      .insert({
        tenant_id: tenantId,
        certification_date: new Date().toISOString().split('T')[0],
        ...certificationData,
      });
  } catch (error) {
    console.error('Error logging tenant certification:', error);
  }
}

// ============================================
// RENT ROLL ANALYZER
// ============================================

/**
 * Analyze a rent roll for Safe Harbor compliance
 * @param {Array} units - Array of unit objects with: unitNumber, monthlyRent, householdSize, grossAnnualIncome
 * @param {number} totalUnits - Total units in property (for vacancy consideration)
 * @returns {Object} Compliance analysis with unit details and threshold results
 */
export function analyzeRentRoll(units, totalUnits = null) {
  const effectiveTotalUnits = totalUnits || units.length;
  
  // Analyze each unit
  const analyzedUnits = units.map((unit, index) => {
    const amiStatus = calculateAMIStatus(
      unit.grossAnnualIncome || unit.gross_annual_income || 0, 
      unit.householdSize || unit.household_size || 1
    );
    
    const rent = unit.monthlyRent || unit.monthly_rent || 0;
    const income = unit.grossAnnualIncome || unit.gross_annual_income || 0;
    
    // Calculate rent as % of income
    const annualRent = rent * 12;
    const rentToIncomeRatio = income > 0 ? (annualRent / income) * 100 : 0;
    
    // Determine category
    let category;
    let categoryLabel;
    if (amiStatus.qualifiesAt50) {
      category = '50_AMI';
      categoryLabel = '≤50% AMI';
    } else if (amiStatus.qualifiesAt60) {
      category = '60_AMI';
      categoryLabel = '51-60% AMI';
    } else if (amiStatus.qualifiesAt80) {
      category = '80_AMI';
      categoryLabel = '61-80% AMI';
    } else {
      category = 'MARKET';
      categoryLabel = '>80% AMI (Market Rate)';
    }
    
    return {
      unitNumber: unit.unitNumber || unit.unit_number || `Unit ${index + 1}`,
      tenantName: unit.tenantName || unit.tenant_name || '',
      householdSize: unit.householdSize || unit.household_size || 1,
      grossAnnualIncome: income,
      monthlyRent: rent,
      amiPercentage: amiStatus.amiPercentage,
      category,
      categoryLabel,
      qualifiesAt50: amiStatus.qualifiesAt50,
      qualifiesAt60: amiStatus.qualifiesAt60,
      qualifiesAt80: amiStatus.qualifiesAt80,
      rentToIncomeRatio: Math.round(rentToIncomeRatio * 10) / 10,
      rentExceeds30Pct: rentToIncomeRatio > 30,
      limits: amiStatus.limits,
    };
  });

  // Calculate totals
  const at50 = analyzedUnits.filter(u => u.qualifiesAt50).length;
  const at51to60 = analyzedUnits.filter(u => u.qualifiesAt60 && !u.qualifiesAt50).length;
  const at61to80 = analyzedUnits.filter(u => u.qualifiesAt80 && !u.qualifiesAt60).length;
  const marketRate = analyzedUnits.filter(u => !u.qualifiesAt80).length;

  const at60OrLess = at50 + at51to60;
  const at80OrLess = at60OrLess + at61to80;

  // Percentages based on total units
  const pct50 = (at50 / effectiveTotalUnits) * 100;
  const pct60 = (at60OrLess / effectiveTotalUnits) * 100;
  const pct80 = (at80OrLess / effectiveTotalUnits) * 100;
  const pctMarket = (marketRate / effectiveTotalUnits) * 100;

  // Check thresholds
  const meetsQualifyingThreshold = pct80 >= SAFE_HARBOR_THRESHOLDS.QUALIFYING_MIN_PCT;
  const meetsMarketRateLimit = pctMarket <= SAFE_HARBOR_THRESHOLDS.MARKET_RATE_MAX_PCT;
  const meetsOptionA = pct50 >= SAFE_HARBOR_THRESHOLDS.OPTION_A.threshold_pct;
  const meetsOptionB = pct60 >= SAFE_HARBOR_THRESHOLDS.OPTION_B.threshold_pct;
  const meetsDeepAffordability = meetsOptionA || meetsOptionB;

  const isCompliant = meetsQualifyingThreshold && meetsMarketRateLimit && meetsDeepAffordability;

  // Generate recommendations
  const recommendations = [];
  
  if (!meetsQualifyingThreshold) {
    const needed = Math.ceil(effectiveTotalUnits * 0.75) - at80OrLess;
    recommendations.push({
      type: 'critical',
      message: `Need ${needed} more unit(s) at ≤80% AMI to meet 75% threshold`,
    });
  }
  
  if (!meetsDeepAffordability) {
    const neededA = Math.ceil(effectiveTotalUnits * 0.20) - at50;
    const neededB = Math.ceil(effectiveTotalUnits * 0.40) - at60OrLess;
    
    recommendations.push({
      type: 'critical',
      message: `Deep affordability not met. Either need ${neededA} more at ≤50% AMI (Option A) or ${neededB} more at ≤60% AMI (Option B)`,
    });
  }

  if (pctMarket > SAFE_HARBOR_THRESHOLDS.MARKET_RATE_MAX_PCT) {
    const excess = marketRate - Math.floor(effectiveTotalUnits * 0.25);
    recommendations.push({
      type: 'critical',
      message: `${excess} market rate unit(s) exceed 25% limit`,
    });
  }

  const rentIssues = analyzedUnits.filter(u => u.rentExceeds30Pct && u.qualifiesAt80);
  if (rentIssues.length > 0) {
    recommendations.push({
      type: 'warning',
      message: `${rentIssues.length} qualifying unit(s) have rent >30% of income limit`,
    });
  }

  return {
    // Input summary
    totalUnits: effectiveTotalUnits,
    analyzedUnits: units.length,
    vacantUnits: effectiveTotalUnits - units.length,

    // Analyzed units with details
    units: analyzedUnits,

    // Summary counts
    counts: {
      at50AMI: at50,
      at51to60AMI: at51to60,
      at61to80AMI: at61to80,
      at60OrLess: at60OrLess,
      at80OrLess: at80OrLess,
      marketRate: marketRate,
    },

    // Percentages
    percentages: {
      at50AMI: Math.round(pct50 * 10) / 10,
      at60AMI: Math.round(pct60 * 10) / 10,
      at80AMI: Math.round(pct80 * 10) / 10,
      marketRate: Math.round(pctMarket * 10) / 10,
    },

    // Threshold results
    thresholds: {
      qualifying: {
        required: `${SAFE_HARBOR_THRESHOLDS.QUALIFYING_MIN_PCT}% at ≤80% AMI`,
        actual: `${Math.round(pct80 * 10) / 10}%`,
        met: meetsQualifyingThreshold,
        unitsNeeded: meetsQualifyingThreshold ? 0 : Math.ceil(effectiveTotalUnits * 0.75) - at80OrLess,
      },
      marketRate: {
        required: `≤${SAFE_HARBOR_THRESHOLDS.MARKET_RATE_MAX_PCT}% market rate`,
        actual: `${Math.round(pctMarket * 10) / 10}%`,
        met: meetsMarketRateLimit,
        unitsExcess: meetsMarketRateLimit ? 0 : marketRate - Math.floor(effectiveTotalUnits * 0.25),
      },
      optionA: {
        required: `${SAFE_HARBOR_THRESHOLDS.OPTION_A.threshold_pct}% at ≤${SAFE_HARBOR_THRESHOLDS.OPTION_A.ami_limit}% AMI`,
        actual: `${Math.round(pct50 * 10) / 10}%`,
        met: meetsOptionA,
        unitsNeeded: meetsOptionA ? 0 : Math.ceil(effectiveTotalUnits * 0.20) - at50,
      },
      optionB: {
        required: `${SAFE_HARBOR_THRESHOLDS.OPTION_B.threshold_pct}% at ≤${SAFE_HARBOR_THRESHOLDS.OPTION_B.ami_limit}% AMI`,
        actual: `${Math.round(pct60 * 10) / 10}%`,
        met: meetsOptionB,
        unitsNeeded: meetsOptionB ? 0 : Math.ceil(effectiveTotalUnits * 0.40) - at60OrLess,
      },
    },

    // Overall compliance
    compliance: {
      isCompliant,
      meetsDeepAffordability,
      deepAffordabilityOption: meetsOptionA ? 'A (20% at 50% AMI)' : (meetsOptionB ? 'B (40% at 60% AMI)' : 'Neither'),
      status: isCompliant ? COMPLIANCE_STATUS.COMPLIANT : COMPLIANCE_STATUS.NON_COMPLIANT,
    },

    // Recommendations
    recommendations,
  };
}

/**
 * Parse CSV rent roll data
 * Expected columns: Unit, Tenant Name, Household Size, Annual Income, Monthly Rent
 */
export function parseRentRollCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  // Find column indices
  const unitIdx = headers.findIndex(h => h.includes('unit'));
  const nameIdx = headers.findIndex(h => h.includes('tenant') || h.includes('name'));
  const sizeIdx = headers.findIndex(h => h.includes('household') || h.includes('size') || h.includes('persons'));
  const incomeIdx = headers.findIndex(h => h.includes('income') || h.includes('annual'));
  const rentIdx = headers.findIndex(h => h.includes('rent') || h.includes('monthly'));

  const units = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/["$,]/g, ''));
    
    if (values.length < 3) continue;
    
    const income = parseFloat(values[incomeIdx]) || 0;
    if (income <= 0) continue; // Skip vacant units or invalid rows
    
    units.push({
      unitNumber: unitIdx >= 0 ? values[unitIdx] : `Unit ${i}`,
      tenantName: nameIdx >= 0 ? values[nameIdx] : '',
      householdSize: sizeIdx >= 0 ? parseInt(values[sizeIdx]) || 1 : 1,
      grossAnnualIncome: income,
      monthlyRent: rentIdx >= 0 ? parseFloat(values[rentIdx]) || 0 : 0,
    });
  }

  return units;
}

// ============================================
// EXPORTS
// ============================================

export default {
  // Constants
  INCOME_CATEGORIES,
  INCOME_CATEGORIES_DETAILED,
  INCOME_CATEGORY_LABELS,
  INCOME_CATEGORY_COLORS,
  EXEMPTION_STATUS,
  CERTIFICATION_STATUS,
  COMPLIANCE_STATUS,
  SAFE_HARBOR_THRESHOLDS,
  FEE_STRUCTURE,
  AMI_LIMITS_2024,
  CAHP_ENTITY_INFO,

  // Property CRUD
  createCAHPProperty,
  getCAHPProperty,
  getAllCAHPProperties,
  updateCAHPProperty,
  deleteCAHPProperty,

  // Tenant CRUD
  createTenant,
  getTenant,
  getPropertyTenants,
  updateTenant,
  deleteTenant,
  recertifyTenant,

  // Compliance
  calculateAMIStatus,
  calculatePropertyCompliance,
  calculateComplianceFromTenants,
  updatePropertyCompliance,

  // Rent Roll Analysis
  analyzeRentRoll,
  parseRentRollCSV,

  // Certifications
  createCertification,
  getCertification,
  getPropertyCertifications,
  submitCertification,
  updateCertificationStatus,

  // Alerts
  getComplianceAlerts,
  getTenantRecertificationsDue,

  // Reporting
  getPortfolioSummary,
  getComplianceHistory,
  generateRentRoll,

  // Utilities
  calculateMaxRent,
  calculateNextRecertDate,
};
