// src/services/workflowTemplateService.js
// Workflow Template Service — Templates with milestones, task groups, and tasks
// Tables: workflow_templates, workflow_template_milestones, workflow_template_task_groups, workflow_template_tasks

import { supabase } from '@/lib/supabase';

// ============================================
// CONSTANTS
// ============================================

export const MODULES = [
  { id: 'opportunities', label: 'Opportunities' },
  { id: 'projects', label: 'Projects' },
  { id: 'construction', label: 'Construction' },
  { id: 'accounting', label: 'Accounting' },
];

export const TASK_PRIORITIES = [
  { id: 'low', label: 'Low', color: 'bg-gray-100 text-gray-700' },
  { id: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  { id: 'high', label: 'High', color: 'bg-amber-100 text-amber-700' },
  { id: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' },
];

export const TASK_CATEGORIES = [
  { id: 'admin', label: 'Administrative', color: 'bg-gray-100 text-gray-700' },
  { id: 'legal', label: 'Legal', color: 'bg-purple-100 text-purple-700' },
  { id: 'finance', label: 'Finance', color: 'bg-green-100 text-green-700' },
  { id: 'construction', label: 'Construction', color: 'bg-orange-100 text-orange-700' },
  { id: 'due-diligence', label: 'Due Diligence', color: 'bg-blue-100 text-blue-700' },
  { id: 'sales', label: 'Sales', color: 'bg-pink-100 text-pink-700' },
  { id: 'inspection', label: 'Inspection', color: 'bg-amber-100 text-amber-700' },
  { id: 'other', label: 'Other', color: 'bg-slate-100 text-slate-700' },
];

export const ASSIGNABLE_ROLES = [
  'Project Manager', 'Superintendent', 'Attorney', 'Title Company',
  'Lender', 'Inspector', 'Appraiser', 'Real Estate Agent',
  'Accountant', 'Sales Manager', 'Contractor', 'Architect',
];

// ============================================
// MOCK / DEMO DATA
// ============================================

let mockTemplates = [
  // ---- 1. Acquisition Due Diligence ----
  {
    id: 'wt-acq-dd-001',
    name: 'Acquisition Due Diligence',
    description: 'Standard due diligence checklist for property acquisitions, covering initial review through contract execution.',
    module: 'opportunities',
    project_type: null,
    is_active: true,
    is_default: true,
    created_by: 'demo-user',
    created_at: '2025-01-15T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
  },
  // ---- 2. New Construction Workflow ----
  {
    id: 'wt-const-001',
    name: 'New Construction Workflow',
    description: 'End-to-end workflow for new home construction from pre-construction through final inspection.',
    module: 'construction',
    project_type: 'spec-home',
    is_active: true,
    is_default: true,
    created_by: 'demo-user',
    created_at: '2025-02-01T00:00:00Z',
    updated_at: '2025-02-01T00:00:00Z',
  },
  // ---- 3. Project Setup Checklist ----
  {
    id: 'wt-proj-setup-001',
    name: 'Project Setup Checklist',
    description: 'Administrative, compliance, and financial setup tasks for new projects.',
    module: 'projects',
    project_type: null,
    is_active: true,
    is_default: true,
    created_by: 'demo-user',
    created_at: '2025-03-01T00:00:00Z',
    updated_at: '2025-03-01T00:00:00Z',
  },
  // ---- 4. Entity Onboarding ----
  {
    id: 'wt-acct-entity-001',
    name: 'Entity Onboarding',
    description: 'Formation and compliance checklist for new legal entities.',
    module: 'accounting',
    project_type: null,
    is_active: true,
    is_default: true,
    created_by: 'demo-user',
    created_at: '2025-04-01T00:00:00Z',
    updated_at: '2025-04-01T00:00:00Z',
  },
];

let mockMilestones = [
  // --- Acquisition Due Diligence milestones ---
  { id: 'wm-acq-1', template_id: 'wt-acq-dd-001', name: 'Initial Review', description: 'Preliminary property and financial research', sort_order: 1, offset_days: 0, is_critical: false, color: '#3B82F6' },
  { id: 'wm-acq-2', template_id: 'wt-acq-dd-001', name: 'Under Contract', description: 'Post-contract execution due diligence', sort_order: 2, offset_days: 14, is_critical: true, color: '#10B981' },

  // --- New Construction Workflow milestones ---
  { id: 'wm-const-1', template_id: 'wt-const-001', name: 'Pre-Construction', description: 'Planning, permitting, and subcontractor coordination', sort_order: 1, offset_days: 0, is_critical: false, color: '#6366F1' },
  { id: 'wm-const-2', template_id: 'wt-const-001', name: 'Foundation', description: 'Survey, foundation pour, and inspection', sort_order: 2, offset_days: 30, is_critical: true, color: '#F59E0B' },
  { id: 'wm-const-3', template_id: 'wt-const-001', name: 'Framing', description: 'Framing, inspection, and rough-in MEP', sort_order: 3, offset_days: 60, is_critical: true, color: '#EF4444' },
  { id: 'wm-const-4', template_id: 'wt-const-001', name: 'Finish', description: 'Interior finishes and final inspection', sort_order: 4, offset_days: 120, is_critical: true, color: '#10B981' },
];

let mockTaskGroups = [
  // --- Acquisition Due Diligence groups ---
  { id: 'wg-acq-1', template_id: 'wt-acq-dd-001', milestone_id: 'wm-acq-1', name: 'Property Research', description: 'Initial property research and verification', sort_order: 1 },
  { id: 'wg-acq-2', template_id: 'wt-acq-dd-001', milestone_id: 'wm-acq-1', name: 'Financial Analysis', description: 'Valuation and cost analysis', sort_order: 2 },
  { id: 'wg-acq-3', template_id: 'wt-acq-dd-001', milestone_id: 'wm-acq-2', name: 'Inspection & Reports', description: 'Third-party inspections and reports', sort_order: 3 },
  { id: 'wg-acq-4', template_id: 'wt-acq-dd-001', milestone_id: 'wm-acq-2', name: 'Legal Review', description: 'Contract and title review', sort_order: 4 },

  // --- Project Setup Checklist groups (no milestones) ---
  { id: 'wg-proj-1', template_id: 'wt-proj-setup-001', milestone_id: null, name: 'Administrative Setup', description: 'Project folder, team, budget, and schedule setup', sort_order: 1 },
  { id: 'wg-proj-2', template_id: 'wt-proj-setup-001', milestone_id: null, name: 'Compliance', description: 'Permits, insurance, and bond verification', sort_order: 2 },
  { id: 'wg-proj-3', template_id: 'wt-proj-setup-001', milestone_id: null, name: 'Financial Setup', description: 'Banking, draw schedule, and chart of accounts', sort_order: 3 },

  // --- Entity Onboarding groups (no milestones) ---
  { id: 'wg-acct-1', template_id: 'wt-acct-entity-001', milestone_id: null, name: 'Entity Formation', description: 'Legal formation and banking setup', sort_order: 1 },
  { id: 'wg-acct-2', template_id: 'wt-acct-entity-001', milestone_id: null, name: 'Compliance', description: 'State registration and insurance', sort_order: 2 },
];

let mockTasks = [
  // ===== Acquisition Due Diligence tasks =====
  // Property Research group
  { id: 'wtask-acq-01', template_id: 'wt-acq-dd-001', group_id: 'wg-acq-1', milestone_id: 'wm-acq-1', title: 'Title search', description: 'Order and review preliminary title report', sort_order: 1, priority: 'high', category: 'legal', assigned_role: 'Title Company', duration_days: 5, offset_days: 0, is_required: true, depends_on_task_id: null },
  { id: 'wtask-acq-02', template_id: 'wt-acq-dd-001', group_id: 'wg-acq-1', milestone_id: 'wm-acq-1', title: 'Tax verification', description: 'Verify current property taxes, delinquencies, and special assessments', sort_order: 2, priority: 'medium', category: 'finance', assigned_role: 'Project Manager', duration_days: 2, offset_days: 0, is_required: true, depends_on_task_id: null },
  { id: 'wtask-acq-03', template_id: 'wt-acq-dd-001', group_id: 'wg-acq-1', milestone_id: 'wm-acq-1', title: 'Zoning check', description: 'Confirm zoning classification and allowed uses with local jurisdiction', sort_order: 3, priority: 'high', category: 'due-diligence', assigned_role: 'Project Manager', duration_days: 3, offset_days: 0, is_required: true, depends_on_task_id: null },
  { id: 'wtask-acq-04', template_id: 'wt-acq-dd-001', group_id: 'wg-acq-1', milestone_id: 'wm-acq-1', title: 'Survey review', description: 'Review existing survey or order new ALTA survey', sort_order: 4, priority: 'medium', category: 'due-diligence', assigned_role: 'Project Manager', duration_days: 7, offset_days: 2, is_required: false, depends_on_task_id: null },

  // Financial Analysis group
  { id: 'wtask-acq-05', template_id: 'wt-acq-dd-001', group_id: 'wg-acq-2', milestone_id: 'wm-acq-1', title: 'Run comps', description: 'Pull comparable sales (6 months, 0.5-mile radius) and analyze pricing trends', sort_order: 5, priority: 'high', category: 'finance', assigned_role: 'Real Estate Agent', duration_days: 2, offset_days: 0, is_required: true, depends_on_task_id: null },
  { id: 'wtask-acq-06', template_id: 'wt-acq-dd-001', group_id: 'wg-acq-2', milestone_id: 'wm-acq-1', title: 'Calculate MAO', description: 'Determine Maximum Allowable Offer using 70% rule or build analysis', sort_order: 6, priority: 'high', category: 'finance', assigned_role: 'Project Manager', duration_days: 1, offset_days: 2, is_required: true, depends_on_task_id: 'wtask-acq-05' },
  { id: 'wtask-acq-07', template_id: 'wt-acq-dd-001', group_id: 'wg-acq-2', milestone_id: 'wm-acq-1', title: 'Evaluate rehab costs', description: 'Estimate renovation or construction costs based on scope of work', sort_order: 7, priority: 'high', category: 'construction', assigned_role: 'Contractor', duration_days: 3, offset_days: 0, is_required: true, depends_on_task_id: null },

  // Inspection & Reports group
  { id: 'wtask-acq-08', template_id: 'wt-acq-dd-001', group_id: 'wg-acq-3', milestone_id: 'wm-acq-2', title: 'Schedule property inspection', description: 'Schedule and coordinate general property inspection with licensed inspector', sort_order: 8, priority: 'urgent', category: 'inspection', assigned_role: 'Inspector', duration_days: 3, offset_days: 0, is_required: true, depends_on_task_id: null },
  { id: 'wtask-acq-09', template_id: 'wt-acq-dd-001', group_id: 'wg-acq-3', milestone_id: 'wm-acq-2', title: 'Order appraisal', description: 'Order property appraisal if required by lender', sort_order: 9, priority: 'high', category: 'finance', assigned_role: 'Appraiser', duration_days: 10, offset_days: 0, is_required: false, depends_on_task_id: null },
  { id: 'wtask-acq-10', template_id: 'wt-acq-dd-001', group_id: 'wg-acq-3', milestone_id: 'wm-acq-2', title: 'Review environmental report', description: 'Review Phase I Environmental Site Assessment for contamination risks', sort_order: 10, priority: 'medium', category: 'due-diligence', assigned_role: 'Project Manager', duration_days: 5, offset_days: 2, is_required: false, depends_on_task_id: null },

  // Legal Review group
  { id: 'wtask-acq-11', template_id: 'wt-acq-dd-001', group_id: 'wg-acq-4', milestone_id: 'wm-acq-2', title: 'Review contract', description: 'Attorney review of purchase and sale agreement', sort_order: 11, priority: 'urgent', category: 'legal', assigned_role: 'Attorney', duration_days: 3, offset_days: 0, is_required: true, depends_on_task_id: null },
  { id: 'wtask-acq-12', template_id: 'wt-acq-dd-001', group_id: 'wg-acq-4', milestone_id: 'wm-acq-2', title: 'Title commitment review', description: 'Review title commitment for exceptions and requirements', sort_order: 12, priority: 'high', category: 'legal', assigned_role: 'Attorney', duration_days: 3, offset_days: 5, is_required: true, depends_on_task_id: 'wtask-acq-11' },
  { id: 'wtask-acq-13', template_id: 'wt-acq-dd-001', group_id: 'wg-acq-4', milestone_id: 'wm-acq-2', title: 'Review seller disclosures', description: 'Review all seller-provided disclosures and property condition reports', sort_order: 13, priority: 'medium', category: 'legal', assigned_role: 'Attorney', duration_days: 2, offset_days: 0, is_required: true, depends_on_task_id: null },

  // ===== New Construction Workflow tasks =====
  // Pre-Construction milestone (no group)
  { id: 'wtask-const-01', template_id: 'wt-const-001', group_id: null, milestone_id: 'wm-const-1', title: 'Review plans', description: 'Review architectural and engineering plans for constructability', sort_order: 1, priority: 'high', category: 'construction', assigned_role: 'Superintendent', duration_days: 3, offset_days: 0, is_required: true, depends_on_task_id: null },
  { id: 'wtask-const-02', template_id: 'wt-const-001', group_id: null, milestone_id: 'wm-const-1', title: 'Confirm subcontractor availability', description: 'Verify key subcontractors are available for project timeline', sort_order: 2, priority: 'high', category: 'construction', assigned_role: 'Superintendent', duration_days: 5, offset_days: 0, is_required: true, depends_on_task_id: null },
  { id: 'wtask-const-03', template_id: 'wt-const-001', group_id: null, milestone_id: 'wm-const-1', title: 'Order materials', description: 'Place orders for long-lead materials (trusses, windows, etc.)', sort_order: 3, priority: 'medium', category: 'construction', assigned_role: 'Superintendent', duration_days: 2, offset_days: 3, is_required: true, depends_on_task_id: 'wtask-const-01' },
  { id: 'wtask-const-04', template_id: 'wt-const-001', group_id: null, milestone_id: 'wm-const-1', title: 'Set up job site', description: 'Install temporary utilities, dumpster, portable toilet, and signage', sort_order: 4, priority: 'medium', category: 'construction', assigned_role: 'Superintendent', duration_days: 2, offset_days: 0, is_required: true, depends_on_task_id: null },

  // Foundation milestone
  { id: 'wtask-const-05', template_id: 'wt-const-001', group_id: null, milestone_id: 'wm-const-2', title: 'Survey complete', description: 'Boundary and foundation stakeout survey completed', sort_order: 5, priority: 'high', category: 'construction', assigned_role: 'Contractor', duration_days: 2, offset_days: 0, is_required: true, depends_on_task_id: null },
  { id: 'wtask-const-06', template_id: 'wt-const-001', group_id: null, milestone_id: 'wm-const-2', title: 'Foundation poured', description: 'Concrete foundation poured and cured', sort_order: 6, priority: 'urgent', category: 'construction', assigned_role: 'Contractor', duration_days: 7, offset_days: 2, is_required: true, depends_on_task_id: 'wtask-const-05' },
  { id: 'wtask-const-07', template_id: 'wt-const-001', group_id: null, milestone_id: 'wm-const-2', title: 'Foundation inspection', description: 'Pass municipal foundation inspection', sort_order: 7, priority: 'urgent', category: 'inspection', assigned_role: 'Inspector', duration_days: 1, offset_days: 7, is_required: true, depends_on_task_id: 'wtask-const-06' },

  // Framing milestone
  { id: 'wtask-const-08', template_id: 'wt-const-001', group_id: null, milestone_id: 'wm-const-3', title: 'Framing complete', description: 'All structural framing including roof trusses installed', sort_order: 8, priority: 'high', category: 'construction', assigned_role: 'Contractor', duration_days: 14, offset_days: 0, is_required: true, depends_on_task_id: null },
  { id: 'wtask-const-09', template_id: 'wt-const-001', group_id: null, milestone_id: 'wm-const-3', title: 'Framing inspection', description: 'Pass municipal framing inspection', sort_order: 9, priority: 'urgent', category: 'inspection', assigned_role: 'Inspector', duration_days: 1, offset_days: 14, is_required: true, depends_on_task_id: 'wtask-const-08' },
  { id: 'wtask-const-10', template_id: 'wt-const-001', group_id: null, milestone_id: 'wm-const-3', title: 'Rough-in MEP', description: 'Complete rough-in for mechanical, electrical, and plumbing systems', sort_order: 10, priority: 'high', category: 'construction', assigned_role: 'Contractor', duration_days: 10, offset_days: 15, is_required: true, depends_on_task_id: 'wtask-const-09' },

  // Finish milestone
  { id: 'wtask-const-11', template_id: 'wt-const-001', group_id: null, milestone_id: 'wm-const-4', title: 'Drywall', description: 'Hang, tape, and finish drywall throughout', sort_order: 11, priority: 'medium', category: 'construction', assigned_role: 'Contractor', duration_days: 7, offset_days: 0, is_required: true, depends_on_task_id: null },
  { id: 'wtask-const-12', template_id: 'wt-const-001', group_id: null, milestone_id: 'wm-const-4', title: 'Paint', description: 'Interior and exterior painting', sort_order: 12, priority: 'medium', category: 'construction', assigned_role: 'Contractor', duration_days: 5, offset_days: 7, is_required: true, depends_on_task_id: 'wtask-const-11' },
  { id: 'wtask-const-13', template_id: 'wt-const-001', group_id: null, milestone_id: 'wm-const-4', title: 'Flooring', description: 'Install all flooring (tile, hardwood, carpet, LVP)', sort_order: 13, priority: 'medium', category: 'construction', assigned_role: 'Contractor', duration_days: 5, offset_days: 12, is_required: true, depends_on_task_id: 'wtask-const-12' },
  { id: 'wtask-const-14', template_id: 'wt-const-001', group_id: null, milestone_id: 'wm-const-4', title: 'Fixtures', description: 'Install light fixtures, plumbing fixtures, hardware, and appliances', sort_order: 14, priority: 'medium', category: 'construction', assigned_role: 'Contractor', duration_days: 3, offset_days: 17, is_required: true, depends_on_task_id: 'wtask-const-13' },
  { id: 'wtask-const-15', template_id: 'wt-const-001', group_id: null, milestone_id: 'wm-const-4', title: 'Final inspection', description: 'Pass final municipal inspection and obtain certificate of occupancy', sort_order: 15, priority: 'urgent', category: 'inspection', assigned_role: 'Inspector', duration_days: 2, offset_days: 20, is_required: true, depends_on_task_id: 'wtask-const-14' },

  // ===== Project Setup Checklist tasks =====
  // Administrative Setup group
  { id: 'wtask-proj-01', template_id: 'wt-proj-setup-001', group_id: 'wg-proj-1', milestone_id: null, title: 'Create project folder', description: 'Set up project folder structure in document management system', sort_order: 1, priority: 'high', category: 'admin', assigned_role: 'Project Manager', duration_days: 1, offset_days: 0, is_required: true, depends_on_task_id: null },
  { id: 'wtask-proj-02', template_id: 'wt-proj-setup-001', group_id: 'wg-proj-1', milestone_id: null, title: 'Add team members', description: 'Assign team members and set permissions for the project', sort_order: 2, priority: 'high', category: 'admin', assigned_role: 'Project Manager', duration_days: 1, offset_days: 0, is_required: true, depends_on_task_id: null },
  { id: 'wtask-proj-03', template_id: 'wt-proj-setup-001', group_id: 'wg-proj-1', milestone_id: null, title: 'Set budget', description: 'Establish initial project budget from template or proforma', sort_order: 3, priority: 'high', category: 'finance', assigned_role: 'Project Manager', duration_days: 2, offset_days: 1, is_required: true, depends_on_task_id: null },
  { id: 'wtask-proj-04', template_id: 'wt-proj-setup-001', group_id: 'wg-proj-1', milestone_id: null, title: 'Define schedule', description: 'Create project schedule with key milestones and target dates', sort_order: 4, priority: 'high', category: 'admin', assigned_role: 'Project Manager', duration_days: 2, offset_days: 1, is_required: true, depends_on_task_id: null },

  // Compliance group
  { id: 'wtask-proj-05', template_id: 'wt-proj-setup-001', group_id: 'wg-proj-2', milestone_id: null, title: 'Verify permits', description: 'Confirm all required permits are identified and applications submitted', sort_order: 5, priority: 'high', category: 'admin', assigned_role: 'Project Manager', duration_days: 3, offset_days: 0, is_required: true, depends_on_task_id: null },
  { id: 'wtask-proj-06', template_id: 'wt-proj-setup-001', group_id: 'wg-proj-2', milestone_id: null, title: 'Insurance certificates', description: 'Collect certificates of insurance from all contractors and subs', sort_order: 6, priority: 'medium', category: 'admin', assigned_role: 'Project Manager', duration_days: 5, offset_days: 0, is_required: true, depends_on_task_id: null },
  { id: 'wtask-proj-07', template_id: 'wt-proj-setup-001', group_id: 'wg-proj-2', milestone_id: null, title: 'Bond requirements', description: 'Review and fulfill any performance or payment bond requirements', sort_order: 7, priority: 'medium', category: 'legal', assigned_role: 'Project Manager', duration_days: 5, offset_days: 0, is_required: false, depends_on_task_id: null },

  // Financial Setup group
  { id: 'wtask-proj-08', template_id: 'wt-proj-setup-001', group_id: 'wg-proj-3', milestone_id: null, title: 'Open bank account', description: 'Open dedicated project bank account or sub-account', sort_order: 8, priority: 'high', category: 'finance', assigned_role: 'Accountant', duration_days: 3, offset_days: 0, is_required: true, depends_on_task_id: null },
  { id: 'wtask-proj-09', template_id: 'wt-proj-setup-001', group_id: 'wg-proj-3', milestone_id: null, title: 'Set up draw schedule', description: 'Configure construction draw schedule aligned with project milestones', sort_order: 9, priority: 'high', category: 'finance', assigned_role: 'Project Manager', duration_days: 2, offset_days: 3, is_required: true, depends_on_task_id: 'wtask-proj-08' },
  { id: 'wtask-proj-10', template_id: 'wt-proj-setup-001', group_id: 'wg-proj-3', milestone_id: null, title: 'Configure chart of accounts', description: 'Set up project-specific chart of accounts in accounting system', sort_order: 10, priority: 'medium', category: 'finance', assigned_role: 'Accountant', duration_days: 2, offset_days: 0, is_required: true, depends_on_task_id: null },

  // ===== Entity Onboarding tasks =====
  // Entity Formation group
  { id: 'wtask-acct-01', template_id: 'wt-acct-entity-001', group_id: 'wg-acct-1', milestone_id: null, title: 'File articles of organization', description: 'File articles of organization / incorporation with the Secretary of State', sort_order: 1, priority: 'urgent', category: 'legal', assigned_role: 'Attorney', duration_days: 3, offset_days: 0, is_required: true, depends_on_task_id: null },
  { id: 'wtask-acct-02', template_id: 'wt-acct-entity-001', group_id: 'wg-acct-1', milestone_id: null, title: 'Obtain EIN', description: 'Apply for Employer Identification Number from the IRS', sort_order: 2, priority: 'high', category: 'finance', assigned_role: 'Accountant', duration_days: 1, offset_days: 3, is_required: true, depends_on_task_id: 'wtask-acct-01' },
  { id: 'wtask-acct-03', template_id: 'wt-acct-entity-001', group_id: 'wg-acct-1', milestone_id: null, title: 'Open bank account', description: 'Open business bank account with EIN and articles', sort_order: 3, priority: 'high', category: 'finance', assigned_role: 'Accountant', duration_days: 3, offset_days: 4, is_required: true, depends_on_task_id: 'wtask-acct-02' },
  { id: 'wtask-acct-04', template_id: 'wt-acct-entity-001', group_id: 'wg-acct-1', milestone_id: null, title: 'Setup accounting', description: 'Configure entity in accounting system with chart of accounts', sort_order: 4, priority: 'medium', category: 'finance', assigned_role: 'Accountant', duration_days: 2, offset_days: 7, is_required: true, depends_on_task_id: 'wtask-acct-03' },

  // Compliance group
  { id: 'wtask-acct-05', template_id: 'wt-acct-entity-001', group_id: 'wg-acct-2', milestone_id: null, title: 'Register with state', description: 'Register entity for state tax purposes (sales tax, franchise tax, etc.)', sort_order: 5, priority: 'high', category: 'legal', assigned_role: 'Accountant', duration_days: 3, offset_days: 3, is_required: true, depends_on_task_id: 'wtask-acct-01' },
  { id: 'wtask-acct-06', template_id: 'wt-acct-entity-001', group_id: 'wg-acct-2', milestone_id: null, title: 'Annual report filing', description: 'Set up reminders and calendar entries for annual report deadlines', sort_order: 6, priority: 'medium', category: 'admin', assigned_role: 'Accountant', duration_days: 1, offset_days: 10, is_required: true, depends_on_task_id: null },
  { id: 'wtask-acct-07', template_id: 'wt-acct-entity-001', group_id: 'wg-acct-2', milestone_id: null, title: 'Insurance setup', description: 'Obtain general liability, property, and any required professional insurance', sort_order: 7, priority: 'high', category: 'admin', assigned_role: 'Project Manager', duration_days: 5, offset_days: 0, is_required: true, depends_on_task_id: null },
];

// ============================================
// HELPERS
// ============================================

function generateId(prefix = 'wt') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Assemble a full template object with nested milestones, groups, and tasks
 */
function assembleTemplate(template) {
  const milestones = mockMilestones
    .filter(m => m.template_id === template.id)
    .sort((a, b) => a.sort_order - b.sort_order);

  const groups = mockTaskGroups
    .filter(g => g.template_id === template.id)
    .sort((a, b) => a.sort_order - b.sort_order);

  const tasks = mockTasks
    .filter(t => t.template_id === template.id)
    .sort((a, b) => a.sort_order - b.sort_order);

  return { ...template, milestones, task_groups: groups, tasks };
}

// ============================================
// TEMPLATE CRUD
// ============================================

/**
 * Get templates with optional filters
 * @param {Object} filters - { module, project_type, is_active }
 */
export async function getTemplates(filters = {}) {
  try {
    let query = supabase
      .from('workflow_templates')
      .select('*')
      .order('name');

    if (filters.module) query = query.eq('module', filters.module);
    if (filters.project_type) query = query.eq('project_type', filters.project_type);
    if (filters.is_active !== undefined) query = query.eq('is_active', filters.is_active);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching workflow templates:', err);
    let templates = [...mockTemplates];
    if (filters.module) templates = templates.filter(t => t.module === filters.module);
    if (filters.project_type) templates = templates.filter(t => t.project_type === filters.project_type);
    if (filters.is_active !== undefined) templates = templates.filter(t => t.is_active === filters.is_active);
    return templates;
  }
}

/**
 * Get a single template by ID with all milestones, groups, and tasks
 * @param {string} templateId
 */
export async function getTemplateById(templateId) {
  try {
    const { data: template, error: templateError } = await supabase
      .from('workflow_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError) throw templateError;

    // Fetch related data in parallel
    const [milestonesRes, groupsRes, tasksRes] = await Promise.all([
      supabase
        .from('workflow_template_milestones')
        .select('*')
        .eq('template_id', templateId)
        .order('sort_order'),
      supabase
        .from('workflow_template_task_groups')
        .select('*')
        .eq('template_id', templateId)
        .order('sort_order'),
      supabase
        .from('workflow_template_tasks')
        .select('*')
        .eq('template_id', templateId)
        .order('sort_order'),
    ]);

    return {
      ...template,
      milestones: milestonesRes.data || [],
      task_groups: groupsRes.data || [],
      tasks: tasksRes.data || [],
    };
  } catch (err) {
    console.error('Error fetching workflow template by ID:', err);
    const template = mockTemplates.find(t => t.id === templateId);
    if (!template) return null;
    return assembleTemplate(template);
  }
}

/**
 * Create a new template (header only)
 * @param {Object} templateData - { name, description, module, project_type, is_default }
 */
export async function createTemplate(templateData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('workflow_templates')
      .insert({
        name: templateData.name,
        description: templateData.description || '',
        module: templateData.module,
        project_type: templateData.project_type || null,
        is_active: true,
        is_default: templateData.is_default || false,
        created_by: user?.id || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error creating workflow template:', err);
    const newTemplate = {
      id: generateId('wt'),
      name: templateData.name,
      description: templateData.description || '',
      module: templateData.module,
      project_type: templateData.project_type || null,
      is_active: true,
      is_default: templateData.is_default || false,
      created_by: 'demo-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockTemplates.push(newTemplate);
    return newTemplate;
  }
}

/**
 * Update a template header
 * @param {string} templateId
 * @param {Object} updates
 */
export async function updateTemplate(templateId, updates) {
  try {
    const { data, error } = await supabase
      .from('workflow_templates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', templateId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating workflow template:', err);
    const idx = mockTemplates.findIndex(t => t.id === templateId);
    if (idx >= 0) {
      mockTemplates[idx] = { ...mockTemplates[idx], ...updates, updated_at: new Date().toISOString() };
      return mockTemplates[idx];
    }
    return null;
  }
}

/**
 * Soft delete a template (set is_active = false)
 * @param {string} templateId
 */
export async function deleteTemplate(templateId) {
  try {
    const { error } = await supabase
      .from('workflow_templates')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', templateId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting workflow template:', err);
    const idx = mockTemplates.findIndex(t => t.id === templateId);
    if (idx >= 0) {
      mockTemplates[idx].is_active = false;
      mockTemplates[idx].updated_at = new Date().toISOString();
    }
    return true;
  }
}

/**
 * Deep copy a template with all milestones, groups, and tasks
 * @param {string} templateId
 * @param {string} newName
 */
export async function duplicateTemplate(templateId, newName) {
  const original = await getTemplateById(templateId);
  if (!original) throw new Error('Template not found');

  // Create the new template header
  const newTemplate = await createTemplate({
    name: newName || `${original.name} (Copy)`,
    description: original.description,
    module: original.module,
    project_type: original.project_type,
    is_default: false,
  });

  // Map old IDs to new IDs for reference integrity
  const milestoneIdMap = {};
  const groupIdMap = {};
  const taskIdMap = {};

  // Duplicate milestones
  if (original.milestones?.length) {
    for (const milestone of original.milestones) {
      const { id: _oldId, template_id: _oldTplId, ...milestoneData } = milestone;
      const newMilestone = await addMilestone(newTemplate.id, milestoneData);
      milestoneIdMap[milestone.id] = newMilestone.id;
    }
  }

  // Duplicate task groups
  if (original.task_groups?.length) {
    for (const group of original.task_groups) {
      const { id: _oldId, template_id: _oldTplId, ...groupData } = group;
      const newGroup = await addTaskGroup(newTemplate.id, {
        ...groupData,
        milestone_id: group.milestone_id ? milestoneIdMap[group.milestone_id] || null : null,
      });
      groupIdMap[group.id] = newGroup.id;
    }
  }

  // Duplicate tasks (two passes: first create all, then update depends_on references)
  const createdTasks = [];
  if (original.tasks?.length) {
    for (const task of original.tasks) {
      const { id: _oldId, template_id: _oldTplId, depends_on_task_id, ...taskData } = task;
      const newTask = await addTask(newTemplate.id, {
        ...taskData,
        group_id: task.group_id ? groupIdMap[task.group_id] || null : null,
        milestone_id: task.milestone_id ? milestoneIdMap[task.milestone_id] || null : null,
        depends_on_task_id: null, // will update in second pass
      });
      taskIdMap[task.id] = newTask.id;
      createdTasks.push({ original: task, created: newTask });
    }

    // Second pass: update dependency references
    for (const { original: origTask, created: newTask } of createdTasks) {
      if (origTask.depends_on_task_id && taskIdMap[origTask.depends_on_task_id]) {
        await updateTask(newTask.id, {
          depends_on_task_id: taskIdMap[origTask.depends_on_task_id],
        });
      }
    }
  }

  return getTemplateById(newTemplate.id);
}

// ============================================
// MILESTONE CRUD
// ============================================

/**
 * Add a milestone to a template
 * @param {string} templateId
 * @param {Object} milestoneData
 */
export async function addMilestone(templateId, milestoneData) {
  try {
    const { data, error } = await supabase
      .from('workflow_template_milestones')
      .insert({
        template_id: templateId,
        name: milestoneData.name,
        description: milestoneData.description || '',
        sort_order: milestoneData.sort_order || 0,
        offset_days: milestoneData.offset_days || 0,
        is_critical: milestoneData.is_critical || false,
        color: milestoneData.color || '#3B82F6',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error adding milestone:', err);
    const newMilestone = {
      id: generateId('wm'),
      template_id: templateId,
      name: milestoneData.name,
      description: milestoneData.description || '',
      sort_order: milestoneData.sort_order || 0,
      offset_days: milestoneData.offset_days || 0,
      is_critical: milestoneData.is_critical || false,
      color: milestoneData.color || '#3B82F6',
    };
    mockMilestones.push(newMilestone);
    return newMilestone;
  }
}

/**
 * Update a milestone
 * @param {string} milestoneId
 * @param {Object} updates
 */
export async function updateMilestone(milestoneId, updates) {
  try {
    const { data, error } = await supabase
      .from('workflow_template_milestones')
      .update(updates)
      .eq('id', milestoneId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating milestone:', err);
    const idx = mockMilestones.findIndex(m => m.id === milestoneId);
    if (idx >= 0) {
      mockMilestones[idx] = { ...mockMilestones[idx], ...updates };
      return mockMilestones[idx];
    }
    return null;
  }
}

/**
 * Delete a milestone
 * @param {string} milestoneId
 */
export async function deleteMilestone(milestoneId) {
  try {
    const { error } = await supabase
      .from('workflow_template_milestones')
      .delete()
      .eq('id', milestoneId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting milestone:', err);
    const idx = mockMilestones.findIndex(m => m.id === milestoneId);
    if (idx >= 0) {
      // Unlink any task groups and tasks referencing this milestone
      mockTaskGroups.forEach(g => { if (g.milestone_id === milestoneId) g.milestone_id = null; });
      mockTasks.forEach(t => { if (t.milestone_id === milestoneId) t.milestone_id = null; });
      mockMilestones.splice(idx, 1);
    }
    return true;
  }
}

// ============================================
// TASK GROUP CRUD
// ============================================

/**
 * Add a task group to a template
 * @param {string} templateId
 * @param {Object} groupData - includes optional milestone_id
 */
export async function addTaskGroup(templateId, groupData) {
  try {
    const { data, error } = await supabase
      .from('workflow_template_task_groups')
      .insert({
        template_id: templateId,
        milestone_id: groupData.milestone_id || null,
        name: groupData.name,
        description: groupData.description || '',
        sort_order: groupData.sort_order || 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error adding task group:', err);
    const newGroup = {
      id: generateId('wg'),
      template_id: templateId,
      milestone_id: groupData.milestone_id || null,
      name: groupData.name,
      description: groupData.description || '',
      sort_order: groupData.sort_order || 0,
    };
    mockTaskGroups.push(newGroup);
    return newGroup;
  }
}

/**
 * Update a task group
 * @param {string} groupId
 * @param {Object} updates
 */
export async function updateTaskGroup(groupId, updates) {
  try {
    const { data, error } = await supabase
      .from('workflow_template_task_groups')
      .update(updates)
      .eq('id', groupId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating task group:', err);
    const idx = mockTaskGroups.findIndex(g => g.id === groupId);
    if (idx >= 0) {
      mockTaskGroups[idx] = { ...mockTaskGroups[idx], ...updates };
      return mockTaskGroups[idx];
    }
    return null;
  }
}

/**
 * Delete a task group
 * @param {string} groupId
 */
export async function deleteTaskGroup(groupId) {
  try {
    const { error } = await supabase
      .from('workflow_template_task_groups')
      .delete()
      .eq('id', groupId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting task group:', err);
    const idx = mockTaskGroups.findIndex(g => g.id === groupId);
    if (idx >= 0) {
      // Unlink any tasks referencing this group
      mockTasks.forEach(t => { if (t.group_id === groupId) t.group_id = null; });
      mockTaskGroups.splice(idx, 1);
    }
    return true;
  }
}

// ============================================
// TASK CRUD
// ============================================

/**
 * Add a task to a template
 * @param {string} templateId
 * @param {Object} taskData - includes optional group_id and milestone_id
 */
export async function addTask(templateId, taskData) {
  try {
    const { data, error } = await supabase
      .from('workflow_template_tasks')
      .insert({
        template_id: templateId,
        group_id: taskData.group_id || null,
        milestone_id: taskData.milestone_id || null,
        title: taskData.title,
        description: taskData.description || '',
        sort_order: taskData.sort_order || 0,
        priority: taskData.priority || 'medium',
        category: taskData.category || 'other',
        assigned_role: taskData.assigned_role || null,
        duration_days: taskData.duration_days || null,
        offset_days: taskData.offset_days || null,
        is_required: taskData.is_required !== undefined ? taskData.is_required : true,
        depends_on_task_id: taskData.depends_on_task_id || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error adding task:', err);
    const newTask = {
      id: generateId('wtask'),
      template_id: templateId,
      group_id: taskData.group_id || null,
      milestone_id: taskData.milestone_id || null,
      title: taskData.title,
      description: taskData.description || '',
      sort_order: taskData.sort_order || 0,
      priority: taskData.priority || 'medium',
      category: taskData.category || 'other',
      assigned_role: taskData.assigned_role || null,
      duration_days: taskData.duration_days || null,
      offset_days: taskData.offset_days || null,
      is_required: taskData.is_required !== undefined ? taskData.is_required : true,
      depends_on_task_id: taskData.depends_on_task_id || null,
    };
    mockTasks.push(newTask);
    return newTask;
  }
}

/**
 * Update a task
 * @param {string} taskId
 * @param {Object} updates
 */
export async function updateTask(taskId, updates) {
  try {
    const { data, error } = await supabase
      .from('workflow_template_tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating task:', err);
    const idx = mockTasks.findIndex(t => t.id === taskId);
    if (idx >= 0) {
      mockTasks[idx] = { ...mockTasks[idx], ...updates };
      return mockTasks[idx];
    }
    return null;
  }
}

/**
 * Delete a task
 * @param {string} taskId
 */
export async function deleteTask(taskId) {
  try {
    const { error } = await supabase
      .from('workflow_template_tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting task:', err);
    const idx = mockTasks.findIndex(t => t.id === taskId);
    if (idx >= 0) {
      // Clear any depends_on references to this task
      mockTasks.forEach(t => { if (t.depends_on_task_id === taskId) t.depends_on_task_id = null; });
      mockTasks.splice(idx, 1);
    }
    return true;
  }
}

/**
 * Reorder tasks by updating sort_order for a list of task IDs
 * @param {string[]} taskIds - ordered list of task IDs
 */
export async function reorderTasks(taskIds) {
  try {
    const updates = taskIds.map((id, index) =>
      supabase
        .from('workflow_template_tasks')
        .update({ sort_order: index + 1 })
        .eq('id', id)
    );

    const results = await Promise.all(updates);
    const errors = results.filter(r => r.error);
    if (errors.length > 0) throw errors[0].error;

    return true;
  } catch (err) {
    console.error('Error reordering tasks:', err);
    taskIds.forEach((id, index) => {
      const task = mockTasks.find(t => t.id === id);
      if (task) task.sort_order = index + 1;
    });
    return true;
  }
}

// ============================================
// TEMPLATE APPLICATION
// ============================================

/**
 * Get all active templates for a specific module
 * @param {string} module - 'opportunities' | 'projects' | 'construction' | 'accounting'
 */
export async function getTemplatesForModule(module) {
  try {
    const { data, error } = await supabase
      .from('workflow_templates')
      .select('*')
      .eq('module', module)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching templates for module:', err);
    return mockTemplates.filter(t => t.module === module && t.is_active);
  }
}

/**
 * Get the default template for a module (optionally filtered by project type)
 * @param {string} module
 * @param {string|null} projectType
 */
export async function getDefaultTemplateForModule(module, projectType = null) {
  try {
    let query = supabase
      .from('workflow_templates')
      .select('*')
      .eq('module', module)
      .eq('is_active', true)
      .eq('is_default', true);

    if (projectType) {
      query = query.eq('project_type', projectType);
    }

    const { data, error } = await query.limit(1).single();
    if (error) throw error;

    // If we got a template, fetch the full version with children
    if (data) {
      return getTemplateById(data.id);
    }
    return null;
  } catch (err) {
    console.error('Error fetching default template for module:', err);
    let template = mockTemplates.find(t =>
      t.module === module &&
      t.is_active &&
      t.is_default &&
      (projectType ? t.project_type === projectType : true)
    );
    if (!template) {
      // Fall back to any active template for the module
      template = mockTemplates.find(t => t.module === module && t.is_active);
    }
    if (template) return assembleTemplate(template);
    return null;
  }
}
