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
  ],

  [ROLES.EXTERNAL]: [
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.TASKS_VIEW,
  ],
};

// ============================================
// PERMISSION GROUPS (for UI)
// ============================================

export const PERMISSION_GROUPS = [
  {
    name: 'User Management',
    permissions: [
      { id: PERMISSIONS.USERS_VIEW, label: 'View Users' },
      { id: PERMISSIONS.USERS_CREATE, label: 'Create Users' },
      { id: PERMISSIONS.USERS_EDIT, label: 'Edit Users' },
      { id: PERMISSIONS.USERS_DELETE, label: 'Delete Users' },
      { id: PERMISSIONS.USERS_MANAGE_ROLES, label: 'Manage Roles' },
    ]
  },
  {
    name: 'Projects',
    permissions: [
      { id: PERMISSIONS.PROJECTS_VIEW, label: 'View Projects' },
      { id: PERMISSIONS.PROJECTS_CREATE, label: 'Create Projects' },
      { id: PERMISSIONS.PROJECTS_EDIT, label: 'Edit Projects' },
      { id: PERMISSIONS.PROJECTS_DELETE, label: 'Delete Projects' },
      { id: PERMISSIONS.PROJECTS_MANAGE_TEAM, label: 'Manage Project Teams' },
    ]
  },
  {
    name: 'Pipeline',
    permissions: [
      { id: PERMISSIONS.PIPELINE_VIEW, label: 'View Pipeline' },
      { id: PERMISSIONS.PIPELINE_CREATE, label: 'Create Opportunities' },
      { id: PERMISSIONS.PIPELINE_EDIT, label: 'Edit Opportunities' },
      { id: PERMISSIONS.PIPELINE_DELETE, label: 'Delete Opportunities' },
    ]
  },
  {
    name: 'Accounting',
    permissions: [
      { id: PERMISSIONS.ACCOUNTING_VIEW, label: 'View Accounting' },
      { id: PERMISSIONS.ACCOUNTING_CREATE, label: 'Create Transactions' },
      { id: PERMISSIONS.ACCOUNTING_EDIT, label: 'Edit Transactions' },
      { id: PERMISSIONS.ACCOUNTING_DELETE, label: 'Delete Transactions' },
      { id: PERMISSIONS.ACCOUNTING_APPROVE, label: 'Approve Transactions' },
      { id: PERMISSIONS.ACCOUNTING_REPORTS, label: 'Financial Reports' },
    ]
  },
  {
    name: 'Investors',
    permissions: [
      { id: PERMISSIONS.INVESTORS_VIEW, label: 'View Investors' },
      { id: PERMISSIONS.INVESTORS_CREATE, label: 'Create Investors' },
      { id: PERMISSIONS.INVESTORS_EDIT, label: 'Edit Investors' },
      { id: PERMISSIONS.INVESTORS_DELETE, label: 'Delete Investors' },
      { id: PERMISSIONS.INVESTORS_DISTRIBUTIONS, label: 'Manage Distributions' },
    ]
  },
  {
    name: 'Property Management',
    permissions: [
      { id: PERMISSIONS.PROPERTIES_VIEW, label: 'View Properties' },
      { id: PERMISSIONS.PROPERTIES_CREATE, label: 'Create Properties' },
      { id: PERMISSIONS.PROPERTIES_EDIT, label: 'Edit Properties' },
      { id: PERMISSIONS.PROPERTIES_DELETE, label: 'Delete Properties' },
      { id: PERMISSIONS.INSPECTIONS_CONDUCT, label: 'Conduct Inspections' },
    ]
  },
  {
    name: 'Documents',
    permissions: [
      { id: PERMISSIONS.DOCUMENTS_VIEW, label: 'View Documents' },
      { id: PERMISSIONS.DOCUMENTS_UPLOAD, label: 'Upload Documents' },
      { id: PERMISSIONS.DOCUMENTS_DELETE, label: 'Delete Documents' },
      { id: PERMISSIONS.DOCUMENTS_SEND_ESIGN, label: 'Send for E-Signature' },
    ]
  },
  {
    name: 'Administration',
    permissions: [
      { id: PERMISSIONS.ADMIN_SETTINGS, label: 'System Settings' },
      { id: PERMISSIONS.ADMIN_TEMPLATES, label: 'Manage Templates' },
      { id: PERMISSIONS.ADMIN_AUDIT_LOG, label: 'View Audit Log' },
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

    if (error && error.code !== 'PGRST116') {
      throw error;
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
