/**
 * AtlasDev Project Template Service
 * Manages project templates, workflows, schedules, and budgets for various real estate scenarios
 * 
 * Supports:
 * - Single Family Spec Homes (build to sell)
 * - Lot Development (horizontal development with takedown schedules)
 * - Build-to-Rent Communities (develop, build, lease-up, asset management)
 * - Build-to-Sell Communities (develop, build, sell lots/homes)
 * - Fix & Flip Properties
 * - Custom Homes
 */

// ============================================
// PROJECT TYPE DEFINITIONS
// ============================================
export const PROJECT_TYPES = {
  SPEC_HOME: {
    id: 'spec-home',
    name: 'Spec Home',
    description: 'Single family home built speculatively for sale',
    category: 'Residential',
    defaultModules: ['overview', 'acquisition', 'construction', 'finance', 'disposition'],
    budgetType: 'spec-home',
    hasUnits: false,
    hasTakedown: false,
    hasLeaseUp: false,
    icon: '🏠',
    color: 'bg-blue-500'
  },
  CUSTOM_HOME: {
    id: 'custom-home',
    name: 'Custom Home',
    description: 'Client-contracted home construction',
    category: 'Residential',
    defaultModules: ['overview', 'acquisition', 'construction', 'finance', 'client-portal'],
    budgetType: 'spec-home',
    hasUnits: false,
    hasTakedown: false,
    hasLeaseUp: false,
    icon: '🏡',
    color: 'bg-indigo-500'
  },
  LOT_DEVELOPMENT: {
    id: 'lot-development',
    name: 'Lot Development',
    description: 'Horizontal development - subdivide and sell lots',
    category: 'Land Development',
    defaultModules: ['overview', 'acquisition', 'entitlement', 'horizontal-development', 'finance', 'lot-sales'],
    budgetType: 'horizontal-lot',
    hasUnits: true,
    unitType: 'lots',
    hasTakedown: true,
    hasLeaseUp: false,
    icon: '🗺️',
    color: 'bg-green-500'
  },
  BTR_COMMUNITY: {
    id: 'btr-community',
    name: 'Build-to-Rent Community',
    description: 'Develop land, build homes, lease-up, hold as assets',
    category: 'BTR',
    defaultModules: ['overview', 'acquisition', 'entitlement', 'construction', 'finance', 'lease-up', 'asset-management'],
    budgetType: 'btr',
    hasUnits: true,
    unitType: 'homes',
    hasTakedown: false,
    hasLeaseUp: true,
    icon: '🏘️',
    color: 'bg-purple-500'
  },
  BTS_COMMUNITY: {
    id: 'bts-community',
    name: 'Build-to-Sell Community',
    description: 'Develop land and build homes for sale',
    category: 'BTS',
    defaultModules: ['overview', 'acquisition', 'entitlement', 'construction', 'finance', 'home-sales'],
    budgetType: 'bts',
    hasUnits: true,
    unitType: 'homes',
    hasTakedown: true,
    hasLeaseUp: false,
    icon: '🏗️',
    color: 'bg-amber-500'
  },
  LOT_PURCHASE_BUILD: {
    id: 'lot-purchase-build',
    name: 'Lot Purchase & Build',
    description: 'Purchase finished lots and build homes to sell',
    category: 'Residential',
    defaultModules: ['overview', 'lot-acquisition', 'construction', 'finance', 'home-sales'],
    budgetType: 'bts',
    hasUnits: true,
    unitType: 'homes',
    hasTakedown: true,
    hasLeaseUp: false,
    icon: '📋',
    color: 'bg-teal-500'
  },
  LOT_PURCHASE_RENT: {
    id: 'lot-purchase-rent',
    name: 'Lot Purchase & Rent',
    description: 'Purchase finished lots, build homes, and rent',
    category: 'BTR',
    defaultModules: ['overview', 'lot-acquisition', 'construction', 'finance', 'lease-up', 'asset-management'],
    budgetType: 'btr',
    hasUnits: true,
    unitType: 'homes',
    hasTakedown: true,
    hasLeaseUp: true,
    icon: '🔑',
    color: 'bg-rose-500'
  },
  FIX_FLIP: {
    id: 'fix-flip',
    name: 'Fix & Flip',
    description: 'Purchase, renovate, and sell property',
    category: 'Renovation',
    defaultModules: ['overview', 'acquisition', 'renovation', 'finance', 'disposition'],
    budgetType: 'spec-home',
    hasUnits: false,
    hasTakedown: false,
    hasLeaseUp: false,
    icon: '🔨',
    color: 'bg-orange-500'
  }
};

// ============================================
// MODULE DEFINITIONS
// ============================================
export const PROJECT_MODULES = {
  overview: {
    id: 'overview',
    name: 'Overview',
    description: 'Project dashboard and basic information',
    required: true,
    icon: 'LayoutDashboard',
    pages: ['dashboard', 'basic-info', 'property-details', 'contacts', 'settings']
  },
  acquisition: {
    id: 'acquisition',
    name: 'Acquisition',
    description: 'Land/property acquisition tracking',
    required: false,
    icon: 'FileCheck',
    pages: ['deal-analysis', 'due-diligence', 'purchase-contract', 'closing-checklist']
  },
  'lot-acquisition': {
    id: 'lot-acquisition',
    name: 'Lot Acquisition',
    description: 'Finished lot purchases with takedown schedule',
    required: false,
    icon: 'Map',
    pages: ['lot-selection', 'takedown-schedule', 'lot-closings', 'lot-inventory']
  },
  entitlement: {
    id: 'entitlement',
    name: 'Entitlement',
    description: 'Zoning, permits, and approvals',
    required: false,
    icon: 'Shield',
    pages: ['zoning', 'site-plan', 'engineering', 'permits', 'utility-agreements']
  },
  'horizontal-development': {
    id: 'horizontal-development',
    name: 'Horizontal Development',
    description: 'Site work and infrastructure',
    required: false,
    icon: 'Layers',
    pages: ['site-work', 'utilities', 'roads', 'amenities', 'lot-platting']
  },
  construction: {
    id: 'construction',
    name: 'Construction',
    description: 'Building and construction management',
    required: false,
    icon: 'HardHat',
    pages: ['budget', 'schedule', 'draws', 'change-orders', 'inspections', 'permits', 'contractors']
  },
  renovation: {
    id: 'renovation',
    name: 'Renovation',
    description: 'Property renovation tracking',
    required: false,
    icon: 'Hammer',
    pages: ['scope-of-work', 'budget', 'schedule', 'contractors', 'inspections']
  },
  finance: {
    id: 'finance',
    name: 'Finance',
    description: 'Financial tracking and reporting',
    required: true,
    icon: 'DollarSign',
    pages: ['proforma', 'budget-vs-actual', 'cash-flow', 'loans', 'equity', 'distributions']
  },
  'lot-sales': {
    id: 'lot-sales',
    name: 'Lot Sales',
    description: 'Lot inventory and sales tracking',
    required: false,
    icon: 'ShoppingCart',
    pages: ['lot-inventory', 'pricing', 'contracts', 'closings', 'takedown-schedule']
  },
  'home-sales': {
    id: 'home-sales',
    name: 'Home Sales',
    description: 'Home sales and disposition',
    required: false,
    icon: 'Home',
    pages: ['inventory', 'pricing', 'marketing', 'offers', 'contracts', 'closings']
  },
  disposition: {
    id: 'disposition',
    name: 'Disposition',
    description: 'Property sale process',
    required: false,
    icon: 'TrendingUp',
    pages: ['marketing', 'offers', 'contract', 'closing']
  },
  'lease-up': {
    id: 'lease-up',
    name: 'Lease-Up',
    description: 'Rental marketing and leasing',
    required: false,
    icon: 'Key',
    pages: ['marketing', 'applications', 'leases', 'move-ins', 'occupancy-tracking']
  },
  'asset-management': {
    id: 'asset-management',
    name: 'Asset Management',
    description: 'Property management and operations',
    required: false,
    icon: 'Building2',
    pages: ['rent-roll', 'maintenance', 'financials', 'performance']
  },
  'client-portal': {
    id: 'client-portal',
    name: 'Client Portal',
    description: 'Custom home client communication',
    required: false,
    icon: 'Users',
    pages: ['selections', 'change-orders', 'progress-photos', 'payments', 'documents']
  },
  'investor-portal': {
    id: 'investor-portal',
    name: 'Investor Portal',
    description: 'Investor communication and reporting',
    required: false,
    icon: 'Briefcase',
    pages: ['updates', 'documents', 'distributions', 'performance']
  }
};

// ============================================
// WORKFLOW TEMPLATES
// ============================================
export const WORKFLOW_TEMPLATES = {
  'spec-home-standard': {
    id: 'spec-home-standard',
    name: 'Standard Spec Home Workflow',
    projectType: 'spec-home',
    phases: [
      {
        id: 'land-acquisition',
        name: 'Land Acquisition',
        order: 1,
        duration: 45,
        tasks: [
          { name: 'Site identification', duration: 7, dependencies: [] },
          { name: 'Deal analysis', duration: 3, dependencies: ['Site identification'] },
          { name: 'Make offer', duration: 2, dependencies: ['Deal analysis'] },
          { name: 'Due diligence', duration: 21, dependencies: ['Make offer'] },
          { name: 'Closing', duration: 7, dependencies: ['Due diligence'] }
        ]
      },
      {
        id: 'pre-construction',
        name: 'Pre-Construction',
        order: 2,
        duration: 30,
        tasks: [
          { name: 'Plan selection', duration: 3, dependencies: [] },
          { name: 'Engineering', duration: 14, dependencies: ['Plan selection'] },
          { name: 'Permit application', duration: 7, dependencies: ['Engineering'] },
          { name: 'Permit approval', duration: 21, dependencies: ['Permit application'] }
        ]
      },
      {
        id: 'construction',
        name: 'Construction',
        order: 3,
        duration: 120,
        tasks: [
          { name: 'Site prep', duration: 7, dependencies: [] },
          { name: 'Foundation', duration: 14, dependencies: ['Site prep'] },
          { name: 'Framing', duration: 21, dependencies: ['Foundation'] },
          { name: 'MEP rough-in', duration: 14, dependencies: ['Framing'] },
          { name: 'Insulation & drywall', duration: 14, dependencies: ['MEP rough-in'] },
          { name: 'Interior finishes', duration: 28, dependencies: ['Insulation & drywall'] },
          { name: 'Final inspections', duration: 7, dependencies: ['Interior finishes'] },
          { name: 'Punch list', duration: 7, dependencies: ['Final inspections'] }
        ]
      },
      {
        id: 'disposition',
        name: 'Disposition',
        order: 4,
        duration: 60,
        tasks: [
          { name: 'Marketing prep', duration: 7, dependencies: [] },
          { name: 'List property', duration: 1, dependencies: ['Marketing prep'] },
          { name: 'Showings & offers', duration: 30, dependencies: ['List property'] },
          { name: 'Contract to close', duration: 30, dependencies: ['Showings & offers'] }
        ]
      }
    ],
    // AI Agent hooks - define what agents can automate
    aiAgentHooks: {
      taskCompletion: true,
      documentGeneration: true,
      inspectionScheduling: true,
      drawRequestPreparation: true,
      reportGeneration: true
    }
  },
  'lot-development-standard': {
    id: 'lot-development-standard',
    name: 'Standard Lot Development Workflow',
    projectType: 'lot-development',
    phases: [
      {
        id: 'land-acquisition',
        name: 'Land Acquisition',
        order: 1,
        duration: 90,
        tasks: [
          { name: 'Site identification', duration: 14, dependencies: [] },
          { name: 'Feasibility analysis', duration: 14, dependencies: ['Site identification'] },
          { name: 'Environmental assessment', duration: 30, dependencies: ['Site identification'] },
          { name: 'Make offer', duration: 3, dependencies: ['Feasibility analysis'] },
          { name: 'Due diligence', duration: 45, dependencies: ['Make offer'] },
          { name: 'Closing', duration: 14, dependencies: ['Due diligence', 'Environmental assessment'] }
        ]
      },
      {
        id: 'entitlement',
        name: 'Entitlement',
        order: 2,
        duration: 180,
        tasks: [
          { name: 'Zoning analysis', duration: 14, dependencies: [] },
          { name: 'Site planning', duration: 30, dependencies: ['Zoning analysis'] },
          { name: 'Preliminary plat', duration: 21, dependencies: ['Site planning'] },
          { name: 'Engineering design', duration: 60, dependencies: ['Preliminary plat'] },
          { name: 'Utility agreements', duration: 45, dependencies: ['Engineering design'] },
          { name: 'Final plat approval', duration: 30, dependencies: ['Engineering design', 'Utility agreements'] }
        ]
      },
      {
        id: 'horizontal-development',
        name: 'Horizontal Development',
        order: 3,
        duration: 180,
        tasks: [
          { name: 'Mass grading', duration: 30, dependencies: [] },
          { name: 'Storm water systems', duration: 45, dependencies: ['Mass grading'] },
          { name: 'Utilities installation', duration: 60, dependencies: ['Mass grading'] },
          { name: 'Road construction', duration: 45, dependencies: ['Utilities installation'] },
          { name: 'Amenities', duration: 60, dependencies: ['Road construction'] },
          { name: 'Final inspections', duration: 14, dependencies: ['Road construction', 'Amenities'] }
        ]
      },
      {
        id: 'lot-sales',
        name: 'Lot Sales',
        order: 4,
        duration: 365,
        tasks: [
          { name: 'Pricing strategy', duration: 7, dependencies: [] },
          { name: 'Marketing launch', duration: 14, dependencies: ['Pricing strategy'] },
          { name: 'Builder outreach', duration: 30, dependencies: ['Marketing launch'] },
          { name: 'Contract negotiations', duration: 0, dependencies: ['Builder outreach'], recurring: true },
          { name: 'Lot closings', duration: 0, dependencies: ['Contract negotiations'], recurring: true }
        ]
      }
    ],
    aiAgentHooks: {
      taskCompletion: true,
      documentGeneration: true,
      takedownScheduleTracking: true,
      reportGeneration: true,
      complianceMonitoring: true
    }
  },
  'btr-community-standard': {
    id: 'btr-community-standard',
    name: 'Standard BTR Community Workflow',
    projectType: 'btr-community',
    phases: [
      { id: 'land-acquisition', name: 'Land Acquisition', order: 1, duration: 90 },
      { id: 'entitlement', name: 'Entitlement', order: 2, duration: 180 },
      { id: 'horizontal-development', name: 'Horizontal Development', order: 3, duration: 150 },
      { id: 'vertical-construction', name: 'Vertical Construction', order: 4, duration: 240 },
      { id: 'lease-up', name: 'Lease-Up', order: 5, duration: 180 },
      { id: 'stabilization', name: 'Stabilization', order: 6, duration: 90 }
    ],
    aiAgentHooks: {
      taskCompletion: true,
      documentGeneration: true,
      constructionScheduling: true,
      leaseUpTracking: true,
      reportGeneration: true,
      maintenanceScheduling: true
    }
  }
};

// ============================================
// TAKEDOWN SCHEDULE SERVICE
// ============================================
export const TakedownScheduleService = {
  /**
   * Create a new takedown schedule for lot purchases or lot sales
   */
  createSchedule: (projectId, config) => {
    const { 
      totalUnits, 
      startDate, 
      frequency, // monthly, quarterly, custom
      unitsPerPeriod,
      pricePerUnit,
      escalationRate = 0,
      customSchedule = null
    } = config;

    let schedule = [];
    
    if (customSchedule) {
      schedule = customSchedule;
    } else {
      let currentDate = new Date(startDate);
      let remainingUnits = totalUnits;
      let currentPrice = pricePerUnit;
      let takedownNumber = 1;

      while (remainingUnits > 0) {
        const unitsThisTakedown = Math.min(unitsPerPeriod, remainingUnits);
        
        schedule.push({
          takedownNumber,
          scheduledDate: new Date(currentDate),
          units: unitsThisTakedown,
          pricePerUnit: currentPrice,
          totalAmount: unitsThisTakedown * currentPrice,
          status: 'scheduled', // scheduled, completed, modified
          actualDate: null,
          actualUnits: null,
          actualAmount: null,
          notes: ''
        });

        remainingUnits -= unitsThisTakedown;
        takedownNumber++;
        
        // Advance date based on frequency
        if (frequency === 'monthly') {
          currentDate.setMonth(currentDate.getMonth() + 1);
        } else if (frequency === 'quarterly') {
          currentDate.setMonth(currentDate.getMonth() + 3);
        }
        
        // Apply escalation
        currentPrice = currentPrice * (1 + escalationRate);
      }
    }

    return {
      projectId,
      totalUnits,
      scheduledTakedowns: schedule.length,
      schedule,
      summary: {
        totalScheduledAmount: schedule.reduce((sum, t) => sum + t.totalAmount, 0),
        averagePricePerUnit: schedule.reduce((sum, t) => sum + t.pricePerUnit, 0) / schedule.length,
        completedTakedowns: 0,
        remainingUnits: totalUnits
      }
    };
  },

  /**
   * Record a completed takedown
   */
  completeTakedown: (schedule, takedownNumber, actualData) => {
    const takedown = schedule.schedule.find(t => t.takedownNumber === takedownNumber);
    if (takedown) {
      takedown.status = 'completed';
      takedown.actualDate = actualData.date;
      takedown.actualUnits = actualData.units;
      takedown.actualAmount = actualData.amount;
      takedown.notes = actualData.notes || '';
      
      // Update summary
      schedule.summary.completedTakedowns++;
      schedule.summary.remainingUnits -= actualData.units;
    }
    return schedule;
  },

  /**
   * Modify future takedown
   */
  modifyTakedown: (schedule, takedownNumber, modifications) => {
    const takedown = schedule.schedule.find(t => t.takedownNumber === takedownNumber);
    if (takedown && takedown.status === 'scheduled') {
      Object.assign(takedown, modifications);
      takedown.status = 'modified';
    }
    return schedule;
  }
};

// ============================================
// UNIT/LOT MANAGEMENT SERVICE
// ============================================
export const UnitManagementService = {
  /**
   * Initialize units for a project
   */
  initializeUnits: (projectId, projectType, config) => {
    const { totalUnits, unitPrefix = '', naming = 'sequential' } = config;
    
    const units = [];
    for (let i = 1; i <= totalUnits; i++) {
      const unitNumber = naming === 'sequential' 
        ? `${unitPrefix}${i.toString().padStart(3, '0')}`
        : `${unitPrefix}${i}`;
      
      units.push({
        id: `${projectId}-unit-${i}`,
        projectId,
        unitNumber,
        type: PROJECT_TYPES[projectType.toUpperCase()]?.unitType || 'unit',
        status: 'planned', // planned, in-progress, completed, sold, leased
        phase: null,
        lot: null,
        block: null,
        address: null,
        sqft: null,
        bedrooms: null,
        bathrooms: null,
        homePlan: null,
        estimatedCost: null,
        actualCost: null,
        listPrice: null,
        salePrice: null,
        buyer: null,
        tenant: null,
        constructionStart: null,
        constructionEnd: null,
        closingDate: null,
        leaseStart: null,
        leaseEnd: null,
        monthlyRent: null,
        notes: ''
      });
    }
    
    return {
      projectId,
      totalUnits,
      units,
      summary: {
        planned: totalUnits,
        inProgress: 0,
        completed: 0,
        sold: 0,
        leased: 0,
        available: totalUnits
      }
    };
  },

  /**
   * Update unit status
   */
  updateUnit: (unitData, unitId, updates) => {
    const unit = unitData.units.find(u => u.id === unitId);
    if (unit) {
      const oldStatus = unit.status;
      Object.assign(unit, updates);
      
      // Update summary if status changed
      if (updates.status && updates.status !== oldStatus) {
        unitData.summary[oldStatus]--;
        unitData.summary[updates.status]++;
        
        // Update available count
        const soldOrLeased = ['sold', 'leased'].includes(updates.status);
        if (soldOrLeased) {
          unitData.summary.available--;
        }
      }
    }
    return unitData;
  },

  /**
   * Assign home plan to unit
   */
  assignHomePlan: (unitData, unitId, homePlan) => {
    const unit = unitData.units.find(u => u.id === unitId);
    if (unit) {
      unit.homePlan = homePlan.id;
      unit.sqft = homePlan.sqft;
      unit.bedrooms = homePlan.bedrooms;
      unit.bathrooms = homePlan.bathrooms;
      unit.estimatedCost = homePlan.baseCost;
    }
    return unitData;
  },

  /**
   * Get units by status
   */
  getUnitsByStatus: (unitData, status) => {
    return unitData.units.filter(u => u.status === status);
  },

  /**
   * Get construction schedule
   */
  getConstructionSchedule: (unitData) => {
    return unitData.units
      .filter(u => u.constructionStart)
      .sort((a, b) => new Date(a.constructionStart) - new Date(b.constructionStart));
  },

  /**
   * Get disposition schedule
   */
  getDispositionSchedule: (unitData) => {
    return unitData.units
      .filter(u => u.closingDate || u.leaseStart)
      .sort((a, b) => {
        const dateA = new Date(a.closingDate || a.leaseStart);
        const dateB = new Date(b.closingDate || b.leaseStart);
        return dateA - dateB;
      });
  }
};

// ============================================
// PROJECT TEMPLATE SERVICE
// ============================================
export const ProjectTemplateService = {
  /**
   * Get all project types
   */
  getProjectTypes: () => Object.values(PROJECT_TYPES),

  /**
   * Get project type by ID
   */
  getProjectType: (id) => PROJECT_TYPES[id.toUpperCase().replace(/-/g, '_')],

  /**
   * Get modules for a project type
   */
  getModulesForProjectType: (projectTypeId) => {
    const projectType = Object.values(PROJECT_TYPES).find(pt => pt.id === projectTypeId);
    if (!projectType) return [];
    
    return projectType.defaultModules.map(moduleId => ({
      ...PROJECT_MODULES[moduleId],
      enabled: true
    }));
  },

  /**
   * Get all available modules
   */
  getAllModules: () => Object.values(PROJECT_MODULES),

  /**
   * Get workflow templates for a project type
   */
  getWorkflowTemplates: (projectTypeId) => {
    return Object.values(WORKFLOW_TEMPLATES).filter(wt => wt.projectType === projectTypeId);
  },

  /**
   * Create project from template
   */
  createProjectFromTemplate: (templateId, projectData) => {
    const template = WORKFLOW_TEMPLATES[templateId];
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const projectType = Object.values(PROJECT_TYPES).find(pt => pt.id === template.projectType);
    
    return {
      ...projectData,
      projectType: template.projectType,
      budgetType: projectType.budgetType,
      modules: projectType.defaultModules,
      workflow: template,
      hasUnits: projectType.hasUnits,
      hasTakedown: projectType.hasTakedown,
      hasLeaseUp: projectType.hasLeaseUp,
      aiAgentHooks: template.aiAgentHooks,
      createdFromTemplate: templateId,
      createdAt: new Date().toISOString()
    };
  },

  /**
   * Get AI agent capabilities for project
   */
  getAIAgentCapabilities: (projectTypeId) => {
    const workflows = Object.values(WORKFLOW_TEMPLATES).filter(wt => wt.projectType === projectTypeId);
    if (workflows.length === 0) return {};
    
    // Merge all AI agent hooks from matching workflows
    return workflows.reduce((caps, wf) => ({
      ...caps,
      ...wf.aiAgentHooks
    }), {});
  }
};

export default {
  PROJECT_TYPES,
  PROJECT_MODULES,
  WORKFLOW_TEMPLATES,
  TakedownScheduleService,
  UnitManagementService,
  ProjectTemplateService
};
