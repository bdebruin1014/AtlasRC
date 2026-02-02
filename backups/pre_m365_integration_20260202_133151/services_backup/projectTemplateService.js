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

// ============================================
// DATABASE-BACKED TEMPLATE OPERATIONS
// ============================================

import { supabase } from '@/lib/supabase';
import { addTemplateFoldersToProject } from './sharepointService';

/**
 * Get all templates for an organization from database
 */
export async function getOrganizationTemplates(organizationId) {
  const { data, error } = await supabase
    .from('project_templates')
    .select(`
      *,
      created_by_user:created_by(email, raw_user_meta_data)
    `)
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('name');

  return { data, error };
}

/**
 * Get a single template with all its components from database
 */
export async function getTemplateById(templateId) {
  const { data, error } = await supabase
    .from('project_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (error) return { data: null, error };

  // Fetch all related data in parallel
  const [folders, phases, milestones, tasks, budgetCategories, budgetItems, teamRoles, checklists] = await Promise.all([
    supabase.from('project_template_folders').select('*').eq('template_id', templateId).order('sort_order'),
    supabase.from('project_template_phases').select('*').eq('template_id', templateId).order('sort_order'),
    supabase.from('project_template_milestones').select('*').eq('template_id', templateId).order('sort_order'),
    supabase.from('project_template_tasks').select('*').eq('template_id', templateId).order('sort_order'),
    supabase.from('project_template_budget_categories').select('*').eq('template_id', templateId).order('sort_order'),
    supabase.from('project_template_budget_items').select('*').eq('template_id', templateId).order('sort_order'),
    supabase.from('project_template_team_roles').select('*').eq('template_id', templateId).order('sort_order'),
    supabase.from('project_template_checklists').select(`
      *,
      items:project_template_checklist_items(*)
    `).eq('template_id', templateId).order('sort_order'),
  ]);

  return {
    data: {
      ...data,
      folders: folders.data || [],
      phases: phases.data || [],
      milestones: milestones.data || [],
      tasks: tasks.data || [],
      budgetCategories: budgetCategories.data || [],
      budgetItems: budgetItems.data || [],
      teamRoles: teamRoles.data || [],
      checklists: checklists.data || [],
    },
    error: null,
  };
}

/**
 * Create a new project template in database
 */
export async function createTemplate(organizationId, templateData) {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('project_templates')
    .insert({
      organization_id: organizationId,
      name: templateData.name,
      description: templateData.description,
      project_type: templateData.project_type,
      is_default: templateData.is_default || false,
      estimated_duration_days: templateData.estimated_duration_days,
      created_by: user?.id,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Update a template in database
 */
export async function updateTemplate(templateId, updates) {
  const { data, error } = await supabase
    .from('project_templates')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', templateId)
    .select()
    .single();

  return { data, error };
}

/**
 * Delete a template (soft delete by setting is_active = false)
 */
export async function deleteTemplate(templateId) {
  const { error } = await supabase
    .from('project_templates')
    .update({ is_active: false })
    .eq('id', templateId);

  return { success: !error, error };
}

/**
 * Add folder to template
 */
export async function addTemplateFolder(templateId, folderData) {
  const { data, error } = await supabase
    .from('project_template_folders')
    .insert({
      template_id: templateId,
      parent_folder_id: folderData.parent_folder_id,
      name: folderData.name,
      description: folderData.description,
      sort_order: folderData.sort_order || 0,
      is_required: folderData.is_required ?? true,
      default_permissions: folderData.default_permissions || 'team',
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Update template folder
 */
export async function updateTemplateFolder(folderId, updates) {
  const { data, error } = await supabase
    .from('project_template_folders')
    .update(updates)
    .eq('id', folderId)
    .select()
    .single();

  return { data, error };
}

/**
 * Delete template folder
 */
export async function deleteTemplateFolder(folderId) {
  const { error } = await supabase
    .from('project_template_folders')
    .delete()
    .eq('id', folderId);

  return { success: !error, error };
}

/**
 * Add phase to template
 */
export async function addTemplatePhase(templateId, phaseData) {
  const { data, error } = await supabase
    .from('project_template_phases')
    .insert({
      template_id: templateId,
      name: phaseData.name,
      description: phaseData.description,
      sort_order: phaseData.sort_order || 0,
      duration_days: phaseData.duration_days,
      offset_days: phaseData.offset_days || 0,
      color: phaseData.color || '#3B82F6',
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Add milestone to template
 */
export async function addTemplateMilestone(templateId, milestoneData) {
  const { data, error } = await supabase
    .from('project_template_milestones')
    .insert({
      template_id: templateId,
      phase_id: milestoneData.phase_id,
      name: milestoneData.name,
      description: milestoneData.description,
      sort_order: milestoneData.sort_order || 0,
      offset_days: milestoneData.offset_days || 0,
      is_critical: milestoneData.is_critical || false,
      notify_days_before: milestoneData.notify_days_before || 7,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Add task to template
 */
export async function addTemplateTask(templateId, taskData) {
  const { data, error } = await supabase
    .from('project_template_tasks')
    .insert({
      template_id: templateId,
      phase_id: taskData.phase_id,
      milestone_id: taskData.milestone_id,
      parent_task_id: taskData.parent_task_id,
      name: taskData.name,
      description: taskData.description,
      sort_order: taskData.sort_order || 0,
      priority: taskData.priority || 'medium',
      estimated_hours: taskData.estimated_hours,
      duration_days: taskData.duration_days,
      offset_days: taskData.offset_days || 0,
      assigned_role: taskData.assigned_role,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Add budget category to template
 */
export async function addTemplateBudgetCategory(templateId, categoryData) {
  const { data, error } = await supabase
    .from('project_template_budget_categories')
    .insert({
      template_id: templateId,
      parent_category_id: categoryData.parent_category_id,
      name: categoryData.name,
      description: categoryData.description,
      code: categoryData.code,
      sort_order: categoryData.sort_order || 0,
      is_contingency: categoryData.is_contingency || false,
      default_percentage: categoryData.default_percentage,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Add team role to template
 */
export async function addTemplateTeamRole(templateId, roleData) {
  const { data, error } = await supabase
    .from('project_template_team_roles')
    .insert({
      template_id: templateId,
      role_name: roleData.role_name,
      role_type: roleData.role_type || 'internal',
      description: roleData.description,
      sort_order: roleData.sort_order || 0,
      is_required: roleData.is_required || false,
      permissions: roleData.permissions || 'member',
      default_entity_id: roleData.default_entity_id,
      default_entity_type: roleData.default_entity_type,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Apply a database template to a new project
 */
export async function applyTemplateToProject(projectId, templateId, options = {}) {
  const { startDate = new Date(), organizationId } = options;

  const { data: template, error: templateError } = await getTemplateById(templateId);
  if (templateError || !template) {
    return { success: false, error: templateError || new Error('Template not found') };
  }

  const result = {
    success: true,
    phases: [],
    milestones: [],
    tasks: [],
    budgetItems: [],
    teamRoles: [],
    folders: null,
  };

  try {
    // Update project with template reference
    await supabase
      .from('projects')
      .update({ template_id: templateId })
      .eq('id', projectId);

    const idMappings = { phases: {}, milestones: {}, categories: {} };

    // 1. Create phases
    if (template.phases?.length) {
      let currentStartDate = new Date(startDate);

      for (const phase of template.phases) {
        const phaseStartDate = new Date(currentStartDate);
        phaseStartDate.setDate(phaseStartDate.getDate() + (phase.offset_days || 0));

        const phaseEndDate = new Date(phaseStartDate);
        if (phase.duration_days) {
          phaseEndDate.setDate(phaseEndDate.getDate() + phase.duration_days);
        }

        const { data: newPhase } = await supabase
          .from('project_phases')
          .insert({
            project_id: projectId,
            name: phase.name,
            description: phase.description,
            start_date: phaseStartDate.toISOString().split('T')[0],
            end_date: phaseEndDate.toISOString().split('T')[0],
            color: phase.color,
            sort_order: phase.sort_order,
          })
          .select()
          .single();

        if (newPhase) {
          idMappings.phases[phase.id] = newPhase.id;
          result.phases.push(newPhase);
          currentStartDate = phaseEndDate;
        }
      }
    }

    // 2. Create milestones
    if (template.milestones?.length) {
      for (const milestone of template.milestones) {
        const milestoneDate = new Date(startDate);
        milestoneDate.setDate(milestoneDate.getDate() + (milestone.offset_days || 0));

        const { data: newMilestone } = await supabase
          .from('project_milestones')
          .insert({
            project_id: projectId,
            phase_id: milestone.phase_id ? idMappings.phases[milestone.phase_id] : null,
            name: milestone.name,
            description: milestone.description,
            target_date: milestoneDate.toISOString().split('T')[0],
            is_critical: milestone.is_critical,
            status: 'pending',
          })
          .select()
          .single();

        if (newMilestone) {
          idMappings.milestones[milestone.id] = newMilestone.id;
          result.milestones.push(newMilestone);
        }
      }
    }

    // 3. Create tasks
    if (template.tasks?.length) {
      const taskIdMappings = {};
      const tasksSorted = [...template.tasks].sort((a, b) => (a.parent_task_id ? 1 : -1));

      for (const task of tasksSorted) {
        const taskDueDate = new Date(startDate);
        taskDueDate.setDate(taskDueDate.getDate() + (task.offset_days || 0) + (task.duration_days || 7));

        const { data: newTask } = await supabase
          .from('tasks')
          .insert({
            project_id: projectId,
            phase_id: task.phase_id ? idMappings.phases[task.phase_id] : null,
            milestone_id: task.milestone_id ? idMappings.milestones[task.milestone_id] : null,
            parent_task_id: task.parent_task_id ? taskIdMappings[task.parent_task_id] : null,
            title: task.name,
            description: task.description,
            priority: task.priority,
            estimated_hours: task.estimated_hours,
            due_date: taskDueDate.toISOString().split('T')[0],
            status: 'todo',
          })
          .select()
          .single();

        if (newTask) {
          taskIdMappings[task.id] = newTask.id;
          result.tasks.push(newTask);
        }
      }
    }

    // 4. Create budget items
    if (template.budgetItems?.length) {
      for (const item of template.budgetItems) {
        const { data: newItem } = await supabase
          .from('budget_items')
          .insert({
            project_id: projectId,
            category_id: item.category_id ? idMappings.categories[item.category_id] : null,
            name: item.name,
            description: item.description,
            unit: item.unit,
            unit_cost: item.unit_cost,
            quantity: item.default_quantity,
            estimated_cost: (item.unit_cost || 0) * (item.default_quantity || 1),
          })
          .select()
          .single();

        if (newItem) {
          result.budgetItems.push(newItem);
        }
      }
    }

    // 5. Create team roles
    if (template.teamRoles?.length) {
      for (const role of template.teamRoles) {
        const { data: newRole } = await supabase
          .from('project_team_members')
          .insert({
            project_id: projectId,
            role: role.role_name,
            role_type: role.role_type,
            permissions: role.permissions,
            entity_id: role.default_entity_id,
            entity_type: role.default_entity_type,
          })
          .select()
          .single();

        if (newRole) {
          result.teamRoles.push(newRole);
        }
      }
    }

    // 6. Create SharePoint folders from template (if connected)
    if (organizationId && template.folders?.length) {
      try {
        const { data: folders } = await addTemplateFoldersToProject(projectId, templateId);
        result.folders = folders;
      } catch (folderError) {
        console.warn('Could not create SharePoint folders:', folderError);
      }
    }

    return result;
  } catch (error) {
    console.error('Error applying template to project:', error);
    return { success: false, error };
  }
}

/**
 * Get default template for an organization and project type
 */
export async function getDefaultTemplate(organizationId, projectType = null) {
  let query = supabase
    .from('project_templates')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .eq('is_default', true);

  if (projectType) {
    query = query.eq('project_type', projectType);
  }

  const { data, error } = await query.single();

  return { data, error };
}

// ============================================
// EXPORTS
// ============================================

export default {
  PROJECT_TYPES,
  PROJECT_MODULES,
  WORKFLOW_TEMPLATES,
  TakedownScheduleService,
  UnitManagementService,
  ProjectTemplateService,

  // Database-backed operations
  getOrganizationTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  addTemplateFolder,
  updateTemplateFolder,
  deleteTemplateFolder,
  addTemplatePhase,
  addTemplateMilestone,
  addTemplateTask,
  addTemplateBudgetCategory,
  addTemplateTeamRole,
  applyTemplateToProject,
  getDefaultTemplate,
};
