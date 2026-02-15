// Property Types
export const PROPERTY_TYPES = [
  { value: 'sfr', label: 'Single Family Residential (SFR)' },
  { value: 'multi_2_4', label: 'Multi-Family (2-4 units)' },
  { value: 'multi_5_plus', label: 'Multi-Family (5+ units)' },
  { value: 'land_vacant', label: 'Land - Vacant' },
  { value: 'land_structure', label: 'Land - With Structure' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'mixed_use', label: 'Mixed-Use' },
  { value: 'industrial', label: 'Industrial' },
];

// Lead Sources
export const LEAD_SOURCES = [
  { value: 'mls', label: 'MLS' },
  { value: 'wholesaler', label: 'Wholesaler' },
  { value: 'direct_mail', label: 'Direct Mail' },
  { value: 'driving_for_dollars', label: 'Driving for Dollars' },
  { value: 'referral', label: 'Referral' },
  { value: 'county_records', label: 'County Records' },
  { value: 'auction', label: 'Auction' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'website', label: 'Website' },
  { value: 'other', label: 'Other' },
];

// Pipeline Stages
export const PIPELINE_STAGES = [
  { value: 'lead', label: 'Lead' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'analysis', label: 'Analysis' },
  { value: 'offer', label: 'Offer' },
  { value: 'contract', label: 'Under Contract' },
  { value: 'due_diligence', label: 'Due Diligence' },
  { value: 'closed_won', label: 'Closed Won' },
  { value: 'closed_lost', label: 'Closed Lost' },
];

// Priority Levels
export const PRIORITY_LEVELS = [
  { value: 'hot', label: 'Hot' },
  { value: 'warm', label: 'Warm' },
  { value: 'cold', label: 'Cold' },
];

// Project Types — canonical definitions used across the app
export const PROJECT_TYPES = [
  { value: 'scattered-lot', label: 'Scattered Lot' },
  { value: 'lot-development', label: 'Lot Development' },
  { value: 'lot-purchase-development', label: 'Lot Purchase Development' },
  { value: 'community-development', label: 'Community Development' },
];

// Project type configuration — controls which modules/sidebar sections are visible per type
export const PROJECT_TYPE_CONFIG = {
  'scattered-lot': {
    label: 'Scattered Lot',
    description: 'Buy an individual lot, build a spec home, sell it',
    icon: 'Home',
    budgetType: 'individual-spec-home',
    sections: {
      overview: true,
      acquisition: true,
      construction: true,
      finance: true,
      documents: true,
    },
    sidebarOverrides: {
      acquisition: [
        { id: 'purchase-contract', label: 'Purchase Contract' },
        { id: 'due-diligence', label: 'Due Diligence' },
        { id: 'closing', label: 'Closing' },
      ],
      construction: [
        { id: 'budget', label: 'Budget' },
        { id: 'schedule', label: 'Schedule' },
        { id: 'draws', label: 'Build / Draw' },
        { id: 'change-orders', label: 'Change Orders' },
      ],
    },
  },
  'lot-development': {
    label: 'Lot Development',
    description: 'Buy raw land, develop horizontal infrastructure, sell finished lots',
    icon: 'Map',
    budgetType: 'horizontal-lot',
    sections: {
      overview: true,
      acquisition: true,
      entitlements: true,
      horizontal: true,
      lotSales: true,
      finance: true,
      documents: true,
    },
    sidebarOverrides: {
      acquisition: [
        { id: 'purchase-contract', label: 'Land Purchase Contract' },
        { id: 'due-diligence', label: 'Due Diligence' },
        { id: 'closing', label: 'Closing' },
      ],
      entitlements: [
        { id: 'zoning', label: 'Zoning & Entitlements' },
        { id: 'plat', label: 'Plat / Subdivision' },
        { id: 'permits-site', label: 'Site Permits' },
      ],
      horizontal: [
        { id: 'budget', label: 'Site Development Budget' },
        { id: 'schedule', label: 'Site Work Schedule' },
        { id: 'draws', label: 'Draws' },
        { id: 'change-orders', label: 'Change Orders' },
      ],
      lotSales: [
        { id: 'lot-inventory', label: 'Lot Inventory' },
        { id: 'lot-sales', label: 'Lot Sales' },
      ],
    },
  },
  'lot-purchase-development': {
    label: 'Lot Purchase Development',
    description: 'Buy finished lots and build homes for sale',
    icon: 'Hammer',
    budgetType: 'bts',
    sections: {
      overview: true,
      acquisition: true,
      construction: true,
      disposition: true,
      finance: true,
      documents: true,
    },
    sidebarOverrides: {
      acquisition: [
        { id: 'purchase-contract', label: 'Lot Purchase' },
        { id: 'due-diligence', label: 'Due Diligence' },
        { id: 'closing', label: 'Closing' },
      ],
      construction: [
        { id: 'houses', label: 'Houses' },
        { id: 'budget', label: 'Budget' },
        { id: 'schedule', label: 'Schedule' },
        { id: 'draws', label: 'Draws' },
        { id: 'change-orders', label: 'Change Orders' },
      ],
      disposition: [
        { id: 'sales-pipeline', label: 'Sales Pipeline' },
        { id: 'closings', label: 'Closings' },
      ],
    },
  },
  'community-development': {
    label: 'Community Development',
    description: 'Full subdivision — raw land through finished homes and sales',
    icon: 'Building2',
    budgetType: 'horizontal-lot',
    sections: {
      overview: true,
      acquisition: true,
      entitlements: true,
      horizontal: true,
      construction: true,
      disposition: true,
      finance: true,
      documents: true,
    },
    sidebarOverrides: {
      acquisition: [
        { id: 'purchase-contract', label: 'Land Purchase Contract' },
        { id: 'due-diligence', label: 'Due Diligence' },
        { id: 'closing', label: 'Land Closing' },
      ],
      entitlements: [
        { id: 'zoning', label: 'Zoning & Entitlements' },
        { id: 'plat', label: 'Plat / Subdivision' },
        { id: 'permits-site', label: 'Site Permits' },
      ],
      horizontal: [
        { id: 'budget', label: 'Site Development Budget' },
        { id: 'schedule', label: 'Site Work Schedule' },
        { id: 'draws', label: 'Site Draws' },
      ],
      construction: [
        { id: 'houses', label: 'Houses' },
        { id: 'vertical-budget', label: 'Vertical Budget' },
        { id: 'vertical-schedule', label: 'Build Schedule' },
        { id: 'vertical-draws', label: 'Construction Draws' },
        { id: 'change-orders', label: 'Change Orders' },
      ],
      disposition: [
        { id: 'sales-pipeline', label: 'Sales Pipeline' },
        { id: 'closings', label: 'Closings' },
      ],
    },
  },
};

// Development Options (for BTR, Lot Dev, For Sale)
export const DEVELOPMENT_OPTIONS = [
  { value: 'full_development', label: 'Full Development' },
  { value: 'buy_entitled', label: 'Buy Entitled' },
  { value: 'buy_finished_lots', label: 'Buy Finished Lots' },
];

// Potential Strategies
export const POTENTIAL_STRATEGIES = [
  { value: 'scattered_lot', label: 'Scattered Lot' },
  { value: 'btr_development', label: 'BTR Development' },
  { value: 'lot_development', label: 'Lot Development' },
  { value: 'for_sale_community', label: 'For Sale Community' },
  { value: 'fix_flip', label: 'Fix & Flip' },
  { value: 'wholesale', label: 'Wholesale' },
  { value: 'land_bank', label: 'Land Bank' },
  { value: 'pass', label: 'Pass' },
];

// Current Property Use
export const CURRENT_USE_OPTIONS = [
  { value: 'vacant', label: 'Vacant' },
  { value: 'owner_occupied', label: 'Owner-Occupied' },
  { value: 'tenant_occupied', label: 'Tenant-Occupied' },
  { value: 'rental_vacant', label: 'Rental (Vacant)' },
  { value: 'unknown', label: 'Unknown' },
];

// Utility Availability
export const UTILITY_AVAILABILITY = [
  { value: 'at_site', label: 'Available at Site' },
  { value: 'at_street', label: 'Available at Street' },
  { value: 'extension_short', label: 'Extension Required (< 500ft)' },
  { value: 'extension_long', label: 'Extension Required (> 500ft)' },
  { value: 'well_septic', label: 'Well/Septic Required' },
  { value: 'unknown', label: 'Unknown' },
];

// Zoning/Entitlement Status
export const ENTITLEMENT_STATUS = [
  { value: 'not_entitled', label: 'Not Entitled' },
  { value: 'partially_entitled', label: 'Partially Entitled' },
  { value: 'fully_entitled', label: 'Fully Entitled' },
  { value: 'by_right', label: 'By-Right' },
];

// Flood Zones
export const FLOOD_ZONES = [
  { value: 'x_minimal', label: 'X (Minimal Risk)' },
  { value: 'x500', label: 'X500 (Moderate Risk)' },
  { value: 'a', label: 'A (High Risk)' },
  { value: 'ae', label: 'AE (High Risk w/ BFE)' },
  { value: 'ao', label: 'AO' },
  { value: 'v', label: 'V (Coastal)' },
  { value: 've', label: 'VE (Coastal w/ BFE)' },
  { value: 'd', label: 'D (Undetermined)' },
  { value: 'unknown', label: 'Unknown' },
];

// Seller Types
export const SELLER_TYPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'married_couple', label: 'Married Couple' },
  { value: 'llc', label: 'LLC' },
  { value: 'corporation', label: 'Corporation' },
  { value: 'trust', label: 'Trust' },
  { value: 'estate', label: 'Estate' },
  { value: 'bank_reo', label: 'Bank/REO' },
  { value: 'government', label: 'Government' },
];

// Seller Motivation
export const MOTIVATION_REASONS = [
  { value: 'relocation', label: 'Relocation' },
  { value: 'divorce', label: 'Divorce' },
  { value: 'estate_probate', label: 'Estate/Probate' },
  { value: 'financial_distress', label: 'Financial Distress' },
  { value: 'tired_landlord', label: 'Tired Landlord' },
  { value: 'downsizing', label: 'Downsizing' },
  { value: '1031_exchange', label: '1031 Exchange' },
  { value: 'retirement', label: 'Retirement' },
  { value: 'health_issues', label: 'Health Issues' },
  { value: 'inherited', label: 'Inherited' },
];

// Communication Types
export const COMMUNICATION_TYPES = [
  { value: 'email', label: 'Email' },
  { value: 'phone_call', label: 'Phone Call' },
  { value: 'text_message', label: 'Text Message' },
  { value: 'in_person', label: 'In-Person Meeting' },
  { value: 'video_call', label: 'Video Call' },
  { value: 'site_visit', label: 'Site Visit' },
  { value: 'mail', label: 'Mail/Letter' },
  { value: 'other', label: 'Other' },
];

// Task Statuses
export const TASK_STATUSES = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'complete', label: 'Complete' },
  { value: 'cancelled', label: 'Cancelled' },
];

// Contact Roles (Pipeline)
export const PIPELINE_CONTACT_ROLES = [
  { value: 'seller', label: 'Seller' },
  { value: 'co_seller', label: 'Co-Seller' },
  { value: 'seller_attorney', label: 'Seller Attorney' },
  { value: 'listing_agent', label: 'Listing Agent' },
  { value: 'selling_agent', label: 'Selling Agent' },
  { value: 'title_company', label: 'Title Company' },
  { value: 'escrow_officer', label: 'Escrow Officer' },
  { value: 'lender', label: 'Lender' },
  { value: 'appraiser', label: 'Appraiser' },
  { value: 'inspector', label: 'Inspector' },
  { value: 'surveyor', label: 'Surveyor' },
  { value: 'wholesaler', label: 'Wholesaler' },
  { value: 'other', label: 'Other' },
];

// Contact Roles (Project)
export const PROJECT_CONTACT_ROLES = [
  { value: 'seller', label: 'Seller' },
  { value: 'buyer', label: 'Buyer' },
  { value: 'lender', label: 'Lender' },
  { value: 'title_company', label: 'Title Company' },
  { value: 'attorney', label: 'Attorney' },
  { value: 'architect', label: 'Architect' },
  { value: 'engineer_civil', label: 'Engineer - Civil' },
  { value: 'engineer_structural', label: 'Engineer - Structural' },
  { value: 'surveyor', label: 'Surveyor' },
  { value: 'general_contractor', label: 'General Contractor' },
  { value: 'real_estate_agent', label: 'Real Estate Agent' },
  { value: 'appraiser', label: 'Appraiser' },
  { value: 'inspector', label: 'Inspector' },
  { value: 'hoa_contact', label: 'HOA Contact' },
  { value: 'city_county', label: 'City/County Contact' },
  { value: 'utility', label: 'Utility Contact' },
  { value: 'other', label: 'Other' },
];

// US States (for dropdowns)
export const US_STATES = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' }, { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' }, { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' }, { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' }, { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' }, { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' }, { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' }, { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' },
];
