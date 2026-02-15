// src/services/permissionService.js
// Role-Based Access Control (RBAC) Service

import { supabase } from '@/lib/supabase';

// ============================================
// ROLE DEFINITIONS
// ============================================

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  ACCOUNTANT: 'accountant',
  PROJECT_MANAGER: 'project_manager',
  PROPERTY_MANAGER: 'property_manager',
  INVESTOR_RELATIONS: 'investor_relations',
  TEAM_MEMBER: 'team_member',
  VIEWER: 'viewer',
  EXTERNAL: 'external',
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.ACCOUNTANT]: 'Accountant',
  [ROLES.PROJECT_MANAGER]: 'Project Manager',
  [ROLES.PROPERTY_MANAGER]: 'Property Manager',
  [ROLES.INVESTOR_RELATIONS]: 'Investor Relations',
  [ROLES.TEAM_MEMBER]: 'Team Member',
  [ROLES.VIEWER]: 'Viewer',
  [ROLES.EXTERNAL]: 'External User',
};

export const ROLE_DESCRIPTIONS = {
  [ROLES.SUPER_ADMIN]: 'Full system access, can manage all settings and users',
  [ROLES.ADMIN]: 'Administrative access, can manage users and most settings',
  [ROLES.MANAGER]: 'Can manage projects, deals, and team members',
  [ROLES.ACCOUNTANT]: 'Full access to accounting, limited access to other modules',
  [ROLES.PROJECT_MANAGER]: 'Can manage assigned projects and related data',
  [ROLES.PROPERTY_MANAGER]: 'Can manage properties, inspections, and tenants',
  [ROLES.INVESTOR_RELATIONS]: 'Can manage investor communications and reports',
  [ROLES.TEAM_MEMBER]: 'Standard access to assigned projects and tasks',
  [ROLES.VIEWER]: 'Read-only access to permitted areas',
  [ROLES.EXTERNAL]: 'Limited access for external partners/contractors',
};

// ============================================
// PERMISSION DEFINITIONS
// ============================================

export const PERMISSIONS = {
  // User Management
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_EDIT: 'users:edit',
  USERS_DELETE: 'users:delete',
  USERS_MANAGE_ROLES: 'users:manage_roles',

  // Projects
  PROJECTS_VIEW: 'projects:view',
  PROJECTS_CREATE: 'projects:create',
  PROJECTS_EDIT: 'projects:edit',
  PROJECTS_DELETE: 'projects:delete',
  PROJECTS_MANAGE_TEAM: 'projects:manage_team',

  // Pipeline/Opportunities
  PIPELINE_VIEW: 'pipeline:view',
  PIPELINE_CREATE: 'pipeline:create',
  PIPELINE_EDIT: 'pipeline:edit',
  PIPELINE_DELETE: 'pipeline:delete',

  // Accounting
  ACCOUNTING_VIEW: 'accounting:view',
  ACCOUNTING_CREATE: 'accounting:create',
  ACCOUNTING_EDIT: 'accounting:edit',
  ACCOUNTING_DELETE: 'accounting:delete',
  ACCOUNTING_APPROVE: 'accounting:approve',
  ACCOUNTING_REPORTS: 'accounting:reports',

  // Entities
  ENTITIES_VIEW: 'entities:view',
  ENTITIES_CREATE: 'entities:create',
  ENTITIES_EDIT: 'entities:edit',
  ENTITIES_DELETE: 'entities:delete',

  // Investors
  INVESTORS_VIEW: 'investors:view',
  INVESTORS_CREATE: 'investors:create',
  INVESTORS_EDIT: 'investors:edit',
  INVESTORS_DELETE: 'investors:delete',
  INVESTORS_DISTRIBUTIONS: 'investors:distributions',

  // Investments/Deals
  INVESTMENTS_VIEW: 'investments:view',
  INVESTMENTS_CREATE: 'investments:create',
  INVESTMENTS_EDIT: 'investments:edit',
  INVESTMENTS_DELETE: 'investments:delete',

  // Property Management
  PROPERTIES_VIEW: 'properties:view',
  PROPERTIES_CREATE: 'properties:create',
  PROPERTIES_EDIT: 'properties:edit',
  PROPERTIES_DELETE: 'properties:delete',
  INSPECTIONS_CONDUCT: 'inspections:conduct',

  // Documents
  DOCUMENTS_VIEW: 'documents:view',
  DOCUMENTS_UPLOAD: 'documents:upload',
  DOCUMENTS_DELETE: 'documents:delete',
  DOCUMENTS_SEND_ESIGN: 'documents:send_esign',

  // Contacts
  CONTACTS_VIEW: 'contacts:view',
  CONTACTS_CREATE: 'contacts:create',
  CONTACTS_EDIT: 'contacts:edit',
  CONTACTS_DELETE: 'contacts:delete',

  // Tasks
  TASKS_VIEW: 'tasks:view',
  TASKS_CREATE: 'tasks:create',
  TASKS_EDIT: 'tasks:edit',
  TASKS_DELETE: 'tasks:delete',
  TASKS_ASSIGN: 'tasks:assign',

  // Construction Management
  CONSTRUCTION_VIEW: 'construction:view',
  CONSTRUCTION_CREATE: 'construction:create',
  CONSTRUCTION_EDIT: 'construction:edit',
  CONSTRUCTION_DELETE: 'construction:delete',
  CONSTRUCTION_ADVANCE_MILESTONE: 'construction:advance_milestone',
  CONSTRUCTION_ADMIN: 'construction:admin',

  // Operations
  OPERATIONS_VIEW: 'operations:view',
  OPERATIONS_MANAGE_TEMPLATES: 'operations:manage_templates',
  OPERATIONS_MANAGE_TEAMS: 'operations:manage_teams',

  // Calendar
  CALENDAR_VIEW: 'calendar:view',
  CALENDAR_CREATE: 'calendar:create',
  CALENDAR_EDIT: 'calendar:edit',

  // Reports
  REPORTS_VIEW: 'reports:view',
  REPORTS_CREATE: 'reports:create',
  REPORTS_EXPORT: 'reports:export',

  // Admin
  ADMIN_SETTINGS: 'admin:settings',
  ADMIN_TEMPLATES: 'admin:templates',
  ADMIN_AUDIT_LOG: 'admin:audit_log',
};

// ============================================
// ROLE-PERMISSION MAPPING
// ============================================

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS), // All permissions

  [ROLES.ADMIN]: [
    // Users (except delete)
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_EDIT,
    PERMISSIONS.USERS_MANAGE_ROLES,
    // All module access
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.PROJECTS_CREATE,
    PERMISSIONS.PROJECTS_EDIT,
    PERMISSIONS.PROJECTS_DELETE,
    PERMISSIONS.PROJECTS_MANAGE_TEAM,
    PERMISSIONS.PIPELINE_VIEW,
    PERMISSIONS.PIPELINE_CREATE,
    PERMISSIONS.PIPELINE_EDIT,
    PERMISSIONS.PIPELINE_DELETE,
    PERMISSIONS.ACCOUNTING_VIEW,
    PERMISSIONS.ACCOUNTING_CREATE,
    PERMISSIONS.ACCOUNTING_EDIT,
    PERMISSIONS.ACCOUNTING_APPROVE,
    PERMISSIONS.ACCOUNTING_REPORTS,
    PERMISSIONS.ENTITIES_VIEW,
    PERMISSIONS.ENTITIES_CREATE,
    PERMISSIONS.ENTITIES_EDIT,
    PERMISSIONS.INVESTORS_VIEW,
    PERMISSIONS.INVESTORS_CREATE,
    PERMISSIONS.INVESTORS_EDIT,
    PERMISSIONS.INVESTORS_DISTRIBUTIONS,
    PERMISSIONS.INVESTMENTS_VIEW,
    PERMISSIONS.INVESTMENTS_CREATE,
    PERMISSIONS.INVESTMENTS_EDIT,
    PERMISSIONS.PROPERTIES_VIEW,
    PERMISSIONS.PROPERTIES_CREATE,
    PERMISSIONS.PROPERTIES_EDIT,
    PERMISSIONS.INSPECTIONS_CONDUCT,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.DOCUMENTS_DELETE,
    PERMISSIONS.DOCUMENTS_SEND_ESIGN,
    PERMISSIONS.CONTACTS_VIEW,
    PERMISSIONS.CONTACTS_CREATE,
    PERMISSIONS.CONTACTS_EDIT,
    PERMISSIONS.CONTACTS_DELETE,
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_EDIT,
    PERMISSIONS.TASKS_DELETE,
    PERMISSIONS.TASKS_ASSIGN,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_CREATE,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.ADMIN_SETTINGS,
    PERMISSIONS.ADMIN_TEMPLATES,
    PERMISSIONS.ADMIN_AUDIT_LOG,
    // Construction
    PERMISSIONS.CONSTRUCTION_VIEW,
    PERMISSIONS.CONSTRUCTION_CREATE,
    PERMISSIONS.CONSTRUCTION_EDIT,
    PERMISSIONS.CONSTRUCTION_DELETE,
    PERMISSIONS.CONSTRUCTION_ADVANCE_MILESTONE,
    PERMISSIONS.CONSTRUCTION_ADMIN,
    // Operations
    PERMISSIONS.OPERATIONS_VIEW,
    PERMISSIONS.OPERATIONS_MANAGE_TEMPLATES,
    PERMISSIONS.OPERATIONS_MANAGE_TEAMS,
    // Calendar
    PERMISSIONS.CALENDAR_VIEW,
    PERMISSIONS.CALENDAR_CREATE,
    PERMISSIONS.CALENDAR_EDIT,
  ],

  [ROLES.MANAGER]: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.PROJECTS_CREATE,
    PERMISSIONS.PROJECTS_EDIT,
    PERMISSIONS.PROJECTS_MANAGE_TEAM,
    PERMISSIONS.PIPELINE_VIEW,
    PERMISSIONS.PIPELINE_CREATE,
    PERMISSIONS.PIPELINE_EDIT,
    PERMISSIONS.ACCOUNTING_VIEW,
    PERMISSIONS.ACCOUNTING_REPORTS,
    PERMISSIONS.ENTITIES_VIEW,
    PERMISSIONS.INVESTORS_VIEW,
    PERMISSIONS.INVESTMENTS_VIEW,
    PERMISSIONS.INVESTMENTS_CREATE,
    PERMISSIONS.INVESTMENTS_EDIT,
    PERMISSIONS.PROPERTIES_VIEW,
    PERMISSIONS.INSPECTIONS_CONDUCT,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.DOCUMENTS_SEND_ESIGN,
    PERMISSIONS.CONTACTS_VIEW,
    PERMISSIONS.CONTACTS_CREATE,
    PERMISSIONS.CONTACTS_EDIT,
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_EDIT,
    PERMISSIONS.TASKS_ASSIGN,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    // Construction
    PERMISSIONS.CONSTRUCTION_VIEW,
    PERMISSIONS.CONSTRUCTION_CREATE,
    PERMISSIONS.CONSTRUCTION_EDIT,
    PERMISSIONS.CONSTRUCTION_ADVANCE_MILESTONE,
    // Operations & Calendar
    PERMISSIONS.OPERATIONS_VIEW,
    PERMISSIONS.CALENDAR_VIEW,
    PERMISSIONS.CALENDAR_CREATE,
    PERMISSIONS.CALENDAR_EDIT,
  ],

  [ROLES.ACCOUNTANT]: [
    PERMISSIONS.ACCOUNTING_VIEW,
    PERMISSIONS.ACCOUNTING_CREATE,
    PERMISSIONS.ACCOUNTING_EDIT,
    PERMISSIONS.ACCOUNTING_DELETE,
    PERMISSIONS.ACCOUNTING_APPROVE,
    PERMISSIONS.ACCOUNTING_REPORTS,
    PERMISSIONS.ENTITIES_VIEW,
    PERMISSIONS.ENTITIES_CREATE,
    PERMISSIONS.ENTITIES_EDIT,
    PERMISSIONS.INVESTORS_VIEW,
    PERMISSIONS.INVESTORS_DISTRIBUTIONS,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.CONTACTS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_CREATE,
    PERMISSIONS.REPORTS_EXPORT,
    // Construction & Calendar
    PERMISSIONS.CONSTRUCTION_VIEW,
    PERMISSIONS.CALENDAR_VIEW,
  ],

  [ROLES.PROJECT_MANAGER]: [
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.PROJECTS_EDIT,
    PERMISSIONS.PROJECTS_MANAGE_TEAM,
    PERMISSIONS.PIPELINE_VIEW,
    PERMISSIONS.ACCOUNTING_VIEW,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.DOCUMENTS_SEND_ESIGN,
    PERMISSIONS.CONTACTS_VIEW,
    PERMISSIONS.CONTACTS_CREATE,
    PERMISSIONS.CONTACTS_EDIT,
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_EDIT,
    PERMISSIONS.TASKS_ASSIGN,
    PERMISSIONS.REPORTS_VIEW,
    // Construction & Calendar
    PERMISSIONS.CONSTRUCTION_VIEW,
    PERMISSIONS.CONSTRUCTION_EDIT,
    PERMISSIONS.CONSTRUCTION_ADVANCE_MILESTONE,
    PERMISSIONS.CALENDAR_VIEW,
    PERMISSIONS.CALENDAR_CREATE,
  ],

  [ROLES.PROPERTY_MANAGER]: [
    PERMISSIONS.PROPERTIES_VIEW,
    PERMISSIONS.PROPERTIES_CREATE,
    PERMISSIONS.PROPERTIES_EDIT,
    PERMISSIONS.INSPECTIONS_CONDUCT,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.CONTACTS_VIEW,
    PERMISSIONS.CONTACTS_CREATE,
    PERMISSIONS.CONTACTS_EDIT,
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_EDIT,
    PERMISSIONS.REPORTS_VIEW,
  ],

  [ROLES.INVESTOR_RELATIONS]: [
    PERMISSIONS.INVESTORS_VIEW,
    PERMISSIONS.INVESTORS_CREATE,
    PERMISSIONS.INVESTORS_EDIT,
    PERMISSIONS.INVESTORS_DISTRIBUTIONS,
    PERMISSIONS.INVESTMENTS_VIEW,
    PERMISSIONS.INVESTMENTS_CREATE,
    PERMISSIONS.INVESTMENTS_EDIT,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.DOCUMENTS_SEND_ESIGN,
    PERMISSIONS.CONTACTS_VIEW,
    PERMISSIONS.CONTACTS_CREATE,
    PERMISSIONS.CONTACTS_EDIT,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
  ],

  [ROLES.TEAM_MEMBER]: [
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.PIPELINE_VIEW,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.CONTACTS_VIEW,
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_EDIT,
    PERMISSIONS.REPORTS_VIEW,
    // Construction, Operations & Calendar
    PERMISSIONS.CONSTRUCTION_VIEW,
    PERMISSIONS.OPERATIONS_VIEW,
    PERMISSIONS.CALENDAR_VIEW,
    PERMISSIONS.CALENDAR_CREATE,
  ],

  [ROLES.VIEWER]: [
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.PIPELINE_VIEW,
    PERMISSIONS.ACCOUNTING_VIEW,
    PERMISSIONS.ENTITIES_VIEW,
    PERMISSIONS.INVESTORS_VIEW,
    PERMISSIONS.INVESTMENTS_VIEW,
    PERMISSIONS.PROPERTIES_VIEW,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.CONTACTS_VIEW,
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    // Construction, Operations & Calendar
    PERMISSIONS.CONSTRUCTION_VIEW,
    PERMISSIONS.OPERATIONS_VIEW,
    PERMISSIONS.CALENDAR_VIEW,
  ],

  [ROLES.EXTERNAL]: [
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.CONSTRUCTION_VIEW,
  ],
};

// ============================================
// PERMISSION GROUPS (for UI)
// ============================================

export const PERMISSION_GROUPS = [
  {
    name: 'Opportunities',
    module: 'opportunities',
    icon: 'FolderKanban',
    permissions: [
      { id: PERMISSIONS.PIPELINE_VIEW, label: 'View', description: 'See all opportunities' },
      { id: PERMISSIONS.PIPELINE_CREATE, label: 'Create', description: 'Add new opportunities' },
      { id: PERMISSIONS.PIPELINE_EDIT, label: 'Edit', description: 'Modify opportunity details' },
      { id: PERMISSIONS.PIPELINE_DELETE, label: 'Delete', description: 'Remove opportunities' },
    ]
  },
  {
    name: 'Projects',
    module: 'projects',
    icon: 'Building2',
    permissions: [
      { id: PERMISSIONS.PROJECTS_VIEW, label: 'View', description: 'See all projects' },
      { id: PERMISSIONS.PROJECTS_CREATE, label: 'Create', description: 'Add new projects' },
      { id: PERMISSIONS.PROJECTS_EDIT, label: 'Edit', description: 'Modify project details' },
      { id: PERMISSIONS.PROJECTS_DELETE, label: 'Delete', description: 'Remove projects' },
      { id: PERMISSIONS.PROJECTS_MANAGE_TEAM, label: 'Manage Team', description: 'Add/remove team members on projects' },
    ]
  },
  {
    name: 'Contacts',
    module: 'contacts',
    icon: 'Users',
    permissions: [
      { id: PERMISSIONS.CONTACTS_VIEW, label: 'View', description: 'See all contacts' },
      { id: PERMISSIONS.CONTACTS_CREATE, label: 'Create', description: 'Add new contacts' },
      { id: PERMISSIONS.CONTACTS_EDIT, label: 'Edit', description: 'Modify contact details' },
      { id: PERMISSIONS.CONTACTS_DELETE, label: 'Delete', description: 'Remove contacts' },
    ]
  },
  {
    name: 'Calendar',
    module: 'calendar',
    icon: 'Calendar',
    permissions: [
      { id: PERMISSIONS.CALENDAR_VIEW, label: 'View', description: 'See all calendar events' },
      { id: PERMISSIONS.CALENDAR_CREATE, label: 'Create', description: 'Add events' },
      { id: PERMISSIONS.CALENDAR_EDIT, label: 'Edit', description: 'Modify events' },
    ]
  },
  {
    name: 'Construction Management',
    module: 'construction',
    icon: 'Hammer',
    permissions: [
      { id: PERMISSIONS.CONSTRUCTION_VIEW, label: 'View', description: 'See all houses and construction data' },
      { id: PERMISSIONS.CONSTRUCTION_CREATE, label: 'Create', description: 'Add new houses' },
      { id: PERMISSIONS.CONSTRUCTION_EDIT, label: 'Edit', description: 'Modify house details, POs, logs' },
      { id: PERMISSIONS.CONSTRUCTION_DELETE, label: 'Delete', description: 'Remove houses' },
      { id: PERMISSIONS.CONSTRUCTION_ADVANCE_MILESTONE, label: 'Advance Milestone', description: 'Move houses through construction stages' },
      { id: PERMISSIONS.CONSTRUCTION_ADMIN, label: 'Construction Admin', description: 'Manage floor plans, pricing, templates' },
    ]
  },
  {
    name: 'Accounting',
    module: 'accounting',
    icon: 'DollarSign',
    permissions: [
      { id: PERMISSIONS.ACCOUNTING_VIEW, label: 'View', description: 'See financial data' },
      { id: PERMISSIONS.ACCOUNTING_CREATE, label: 'Create', description: 'Record transactions' },
      { id: PERMISSIONS.ACCOUNTING_EDIT, label: 'Edit', description: 'Modify transactions' },
      { id: PERMISSIONS.ACCOUNTING_DELETE, label: 'Delete', description: 'Remove transactions' },
      { id: PERMISSIONS.ACCOUNTING_APPROVE, label: 'Approve', description: 'Approve journal entries and payments' },
      { id: PERMISSIONS.ACCOUNTING_REPORTS, label: 'Reports', description: 'Run financial reports' },
    ]
  },
  {
    name: 'Operations',
    module: 'operations',
    icon: 'Cog',
    permissions: [
      { id: PERMISSIONS.OPERATIONS_VIEW, label: 'View', description: 'Access operations dashboard' },
      { id: PERMISSIONS.OPERATIONS_MANAGE_TEMPLATES, label: 'Manage Templates', description: 'Create/edit workflow and document templates' },
      { id: PERMISSIONS.OPERATIONS_MANAGE_TEAMS, label: 'Manage Teams', description: 'Create and manage team assignments' },
      { id: PERMISSIONS.TASKS_VIEW, label: 'View Tasks', description: 'See assigned tasks' },
      { id: PERMISSIONS.TASKS_CREATE, label: 'Create Tasks', description: 'Create new tasks' },
      { id: PERMISSIONS.TASKS_EDIT, label: 'Edit Tasks', description: 'Modify task details' },
      { id: PERMISSIONS.TASKS_DELETE, label: 'Delete Tasks', description: 'Remove tasks' },
      { id: PERMISSIONS.TASKS_ASSIGN, label: 'Assign Tasks', description: 'Assign tasks to team members' },
    ]
  },
  {
    name: 'Documents',
    module: 'documents',
    icon: 'FileText',
    permissions: [
      { id: PERMISSIONS.DOCUMENTS_VIEW, label: 'View', description: 'See documents' },
      { id: PERMISSIONS.DOCUMENTS_UPLOAD, label: 'Upload', description: 'Upload new documents' },
      { id: PERMISSIONS.DOCUMENTS_DELETE, label: 'Delete', description: 'Remove documents' },
      { id: PERMISSIONS.DOCUMENTS_SEND_ESIGN, label: 'E-Signature', description: 'Send documents for signing' },
    ]
  },
  {
    name: 'Reports',
    module: 'reports',
    icon: 'BarChart3',
    permissions: [
      { id: PERMISSIONS.REPORTS_VIEW, label: 'View', description: 'View reports' },
      { id: PERMISSIONS.REPORTS_CREATE, label: 'Create', description: 'Build custom reports' },
      { id: PERMISSIONS.REPORTS_EXPORT, label: 'Export', description: 'Export report data' },
    ]
  },
  {
    name: 'Administration',
    module: 'admin',
    icon: 'Settings',
    permissions: [
      { id: PERMISSIONS.USERS_VIEW, label: 'View Users', description: 'See user list' },
      { id: PERMISSIONS.USERS_CREATE, label: 'Create Users', description: 'Invite new users' },
      { id: PERMISSIONS.USERS_EDIT, label: 'Edit Users', description: 'Modify user profiles' },
      { id: PERMISSIONS.USERS_DELETE, label: 'Delete Users', description: 'Remove users' },
      { id: PERMISSIONS.USERS_MANAGE_ROLES, label: 'Manage Roles', description: 'Assign roles and permissions' },
      { id: PERMISSIONS.ADMIN_SETTINGS, label: 'System Settings', description: 'Modify system configuration' },
      { id: PERMISSIONS.ADMIN_TEMPLATES, label: 'Manage Templates', description: 'Create/edit templates' },
      { id: PERMISSIONS.ADMIN_AUDIT_LOG, label: 'Audit Log', description: 'View system audit trail' },
    ]
  },
];

// ============================================
// PERMISSION TEMPLATES (pre-built custom permission sets)
// ============================================

export const PERMISSION_TEMPLATES = [
  {
    id: 'wholesale_acquisitions',
    name: 'Wholesale / Acquisitions',
    description: 'Full access to opportunities pipeline, contacts, and documents. Read-only on projects and accounting.',
    permissions: [
      PERMISSIONS.PIPELINE_VIEW, PERMISSIONS.PIPELINE_CREATE, PERMISSIONS.PIPELINE_EDIT, PERMISSIONS.PIPELINE_DELETE,
      PERMISSIONS.CONTACTS_VIEW, PERMISSIONS.CONTACTS_CREATE, PERMISSIONS.CONTACTS_EDIT,
      PERMISSIONS.DOCUMENTS_VIEW, PERMISSIONS.DOCUMENTS_UPLOAD, PERMISSIONS.DOCUMENTS_SEND_ESIGN,
      PERMISSIONS.PROJECTS_VIEW,
      PERMISSIONS.ACCOUNTING_VIEW,
      PERMISSIONS.TASKS_VIEW, PERMISSIONS.TASKS_CREATE, PERMISSIONS.TASKS_EDIT,
      PERMISSIONS.CALENDAR_VIEW, PERMISSIONS.CALENDAR_CREATE, PERMISSIONS.CALENDAR_EDIT,
      PERMISSIONS.REPORTS_VIEW,
    ]
  },
  {
    id: 'construction_superintendent',
    name: 'Construction Superintendent',
    description: 'Full construction management access. Can advance milestones, manage POs, and log daily activities. Read-only on finance.',
    permissions: [
      PERMISSIONS.CONSTRUCTION_VIEW, PERMISSIONS.CONSTRUCTION_CREATE, PERMISSIONS.CONSTRUCTION_EDIT, PERMISSIONS.CONSTRUCTION_ADVANCE_MILESTONE,
      PERMISSIONS.PROJECTS_VIEW,
      PERMISSIONS.CONTACTS_VIEW, PERMISSIONS.CONTACTS_CREATE,
      PERMISSIONS.DOCUMENTS_VIEW, PERMISSIONS.DOCUMENTS_UPLOAD,
      PERMISSIONS.TASKS_VIEW, PERMISSIONS.TASKS_CREATE, PERMISSIONS.TASKS_EDIT,
      PERMISSIONS.CALENDAR_VIEW, PERMISSIONS.CALENDAR_CREATE,
      PERMISSIONS.ACCOUNTING_VIEW,
    ]
  },
  {
    id: 'bookkeeper',
    name: 'Bookkeeper',
    description: 'Full accounting access across all entities. Can create transactions, reconcile, and run reports. No project management.',
    permissions: [
      PERMISSIONS.ACCOUNTING_VIEW, PERMISSIONS.ACCOUNTING_CREATE, PERMISSIONS.ACCOUNTING_EDIT, PERMISSIONS.ACCOUNTING_REPORTS,
      PERMISSIONS.CONTACTS_VIEW, PERMISSIONS.CONTACTS_CREATE, PERMISSIONS.CONTACTS_EDIT,
      PERMISSIONS.DOCUMENTS_VIEW, PERMISSIONS.DOCUMENTS_UPLOAD,
      PERMISSIONS.REPORTS_VIEW, PERMISSIONS.REPORTS_CREATE, PERMISSIONS.REPORTS_EXPORT,
      PERMISSIONS.PROJECTS_VIEW,
      PERMISSIONS.CALENDAR_VIEW,
    ]
  },
  {
    id: 'project_coordinator',
    name: 'Project Coordinator',
    description: 'Manage project details, tasks, and schedules. View-only on construction and accounting.',
    permissions: [
      PERMISSIONS.PROJECTS_VIEW, PERMISSIONS.PROJECTS_EDIT, PERMISSIONS.PROJECTS_MANAGE_TEAM,
      PERMISSIONS.CONSTRUCTION_VIEW,
      PERMISSIONS.CONTACTS_VIEW, PERMISSIONS.CONTACTS_CREATE, PERMISSIONS.CONTACTS_EDIT,
      PERMISSIONS.DOCUMENTS_VIEW, PERMISSIONS.DOCUMENTS_UPLOAD, PERMISSIONS.DOCUMENTS_SEND_ESIGN,
      PERMISSIONS.TASKS_VIEW, PERMISSIONS.TASKS_CREATE, PERMISSIONS.TASKS_EDIT, PERMISSIONS.TASKS_ASSIGN,
      PERMISSIONS.CALENDAR_VIEW, PERMISSIONS.CALENDAR_CREATE, PERMISSIONS.CALENDAR_EDIT,
      PERMISSIONS.ACCOUNTING_VIEW,
      PERMISSIONS.REPORTS_VIEW,
    ]
  },
  {
    id: 'sales_agent',
    name: 'Sales Agent',
    description: 'Access to contacts, project sales data, and documents. Limited view of construction progress.',
    permissions: [
      PERMISSIONS.CONTACTS_VIEW, PERMISSIONS.CONTACTS_CREATE, PERMISSIONS.CONTACTS_EDIT,
      PERMISSIONS.PROJECTS_VIEW,
      PERMISSIONS.CONSTRUCTION_VIEW,
      PERMISSIONS.DOCUMENTS_VIEW, PERMISSIONS.DOCUMENTS_UPLOAD, PERMISSIONS.DOCUMENTS_SEND_ESIGN,
      PERMISSIONS.CALENDAR_VIEW, PERMISSIONS.CALENDAR_CREATE,
      PERMISSIONS.TASKS_VIEW, PERMISSIONS.TASKS_CREATE,
      PERMISSIONS.REPORTS_VIEW,
    ]
  },
  {
    id: 'executive_readonly',
    name: 'Executive (Read-Only)',
    description: 'View everything across all modules. No create/edit/delete access.',
    permissions: [
      PERMISSIONS.PIPELINE_VIEW,
      PERMISSIONS.PROJECTS_VIEW,
      PERMISSIONS.CONTACTS_VIEW,
      PERMISSIONS.CALENDAR_VIEW,
      PERMISSIONS.CONSTRUCTION_VIEW,
      PERMISSIONS.ACCOUNTING_VIEW, PERMISSIONS.ACCOUNTING_REPORTS,
      PERMISSIONS.OPERATIONS_VIEW,
      PERMISSIONS.DOCUMENTS_VIEW,
      PERMISSIONS.TASKS_VIEW,
      PERMISSIONS.REPORTS_VIEW, PERMISSIONS.REPORTS_EXPORT,
    ]
  },
];

// ============================================
// CURRENT USER PERMISSIONS (cached)
// ============================================

let currentUserPermissions = null;
let currentUserRole = null;

// ============================================
// PERMISSION CHECKING
// ============================================

export async function loadUserPermissions(userId = null) {
  try {
    let uid = userId;

    if (!uid) {
      const { data: { user } } = await supabase.auth.getUser();
      uid = user?.id;
    }

    if (!uid) {
      currentUserPermissions = [];
      currentUserRole = null;
      return { permissions: [], role: null };
    }

    // Get user's role
    const { data: userRole, error } = await supabase
      .from('user_roles')
      .select('role, custom_permissions')
      .eq('user_id', uid)
      .single();

    // Handle errors gracefully:
    // PGRST116 = no rows found (expected for new users)
    // 42P01 = table doesn't exist
    // 400/404 = table or schema issues
    if (error && error.code !== 'PGRST116') {
      // Silently handle missing table or schema errors - use defaults
      const isTableMissing = error.code === '42P01' ||
                             error.message?.includes('does not exist') ||
                             error.code === 'PGRST204';
      if (!isTableMissing) {
        // Only log unexpected errors in development
        if (import.meta.env.DEV) {
          console.debug('Permission service: using default role (table may not exist)');
        }
      }
      // Fall through to use default role instead of returning empty
    }

    // Default to team_member if no role assigned
    const role = userRole?.role || ROLES.TEAM_MEMBER;
    const basePermissions = ROLE_PERMISSIONS[role] || [];
    const customPermissions = userRole?.custom_permissions || [];

    // Merge base role permissions with any custom permissions
    const allPermissions = [...new Set([...basePermissions, ...customPermissions])];

    currentUserPermissions = allPermissions;
    currentUserRole = role;

    return { permissions: allPermissions, role };
  } catch (error) {
    console.error('Error loading user permissions:', error);
    currentUserPermissions = [];
    currentUserRole = null;
    return { permissions: [], role: null };
  }
}

export function hasPermission(permission) {
  if (!currentUserPermissions) {
    console.warn('Permissions not loaded. Call loadUserPermissions first.');
    return false;
  }
  return currentUserPermissions.includes(permission);
}

export function hasAnyPermission(permissions) {
  if (!currentUserPermissions) return false;
  return permissions.some(p => currentUserPermissions.includes(p));
}

export function hasAllPermissions(permissions) {
  if (!currentUserPermissions) return false;
  return permissions.every(p => currentUserPermissions.includes(p));
}

export function getCurrentRole() {
  return currentUserRole;
}

export function getCurrentPermissions() {
  return currentUserPermissions || [];
}

export function isAdmin() {
  return [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(currentUserRole);
}

export function isSuperAdmin() {
  return currentUserRole === ROLES.SUPER_ADMIN;
}

// ============================================
// USER ROLE MANAGEMENT
// ============================================

export async function getUserRole(userId) {
  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId)
    .single();

  return { data, error };
}

export async function setUserRole(userId, role, customPermissions = []) {
  // Check if role record exists
  const { data: existing } = await supabase
    .from('user_roles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('user_roles')
      .update({
        role,
        custom_permissions: customPermissions,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    return { data, error };
  } else {
    // Insert new
    const { data, error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role,
        custom_permissions: customPermissions,
      })
      .select()
      .single();

    return { data, error };
  }
}

export async function removeUserRole(userId) {
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId);

  return { success: !error, error };
}

// ============================================
// TEAM/PROJECT PERMISSIONS
// ============================================

export async function getProjectTeamMembers(projectId) {
  const { data, error } = await supabase
    .from('project_team_members')
    .select(`
      *,
      user:user_id (
        id,
        email,
        raw_user_meta_data
      )
    `)
    .eq('project_id', projectId);

  return { data, error };
}

export async function addProjectTeamMember(projectId, userId, projectRole = 'member') {
  const { data, error } = await supabase
    .from('project_team_members')
    .insert({
      project_id: projectId,
      user_id: userId,
      project_role: projectRole,
    })
    .select()
    .single();

  return { data, error };
}

export async function updateProjectTeamMember(projectId, userId, projectRole) {
  const { data, error } = await supabase
    .from('project_team_members')
    .update({ project_role: projectRole })
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .select()
    .single();

  return { data, error };
}

export async function removeProjectTeamMember(projectId, userId) {
  const { error } = await supabase
    .from('project_team_members')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', userId);

  return { success: !error, error };
}

export async function getUserProjects(userId) {
  const { data, error } = await supabase
    .from('project_team_members')
    .select(`
      project_id,
      project_role,
      project:projects (
        id,
        name,
        status
      )
    `)
    .eq('user_id', userId);

  return { data, error };
}

// ============================================
// ALL USERS WITH ROLES
// ============================================

export async function getAllUsersWithRoles() {
  // Get all users from auth.users via a function or view
  const { data: users, error: usersError } = await supabase
    .from('user_profiles')
    .select('*');

  if (usersError) return { data: null, error: usersError };

  // Get all roles
  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('*');

  if (rolesError) return { data: null, error: rolesError };

  // Merge
  const rolesMap = {};
  roles?.forEach(r => {
    rolesMap[r.user_id] = r;
  });

  const usersWithRoles = users?.map(user => ({
    ...user,
    role: rolesMap[user.id]?.role || ROLES.TEAM_MEMBER,
    custom_permissions: rolesMap[user.id]?.custom_permissions || [],
  }));

  return { data: usersWithRoles, error: null };
}

// ============================================
// AUDIT LOGGING
// ============================================

export async function logPermissionChange({
  targetUserId,
  action,
  oldValue,
  newValue,
  details = {}
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('permission_audit_log').insert({
      actor_user_id: user?.id,
      target_user_id: targetUserId,
      action,
      old_value: oldValue,
      new_value: newValue,
      details,
    });
  } catch (error) {
    console.error('Error logging permission change:', error);
  }
}

export async function getPermissionAuditLog(filters = {}) {
  let query = supabase
    .from('permission_audit_log')
    .select(`
      *,
      actor:actor_user_id (email, raw_user_meta_data),
      target:target_user_id (email, raw_user_meta_data)
    `)
    .order('created_at', { ascending: false });

  if (filters.targetUserId) {
    query = query.eq('target_user_id', filters.targetUserId);
  }

  if (filters.action) {
    query = query.eq('action', filters.action);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  return { data, error };
}

// ============================================
// EXPORTS
// ============================================

export default {
  // Constants
  ROLES,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  PERMISSION_GROUPS,
  PERMISSION_TEMPLATES,

  // Permission checking
  loadUserPermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getCurrentRole,
  getCurrentPermissions,
  isAdmin,
  isSuperAdmin,

  // User role management
  getUserRole,
  setUserRole,
  removeUserRole,
  getAllUsersWithRoles,

  // Project teams
  getProjectTeamMembers,
  addProjectTeamMember,
  updateProjectTeamMember,
  removeProjectTeamMember,
  getUserProjects,

  // Audit
  logPermissionChange,
  getPermissionAuditLog,
};
