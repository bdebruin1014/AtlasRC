// src/contexts/PermissionContext.jsx
// React Context for Role-Based Access Control

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  loadUserPermissions,
  hasPermission as checkPermission,
  hasAnyPermission as checkAnyPermission,
  hasAllPermissions as checkAllPermissions,
  getCurrentRole,
  getCurrentPermissions,
  isAdmin as checkIsAdmin,
  isSuperAdmin as checkIsSuperAdmin,
  ROLES,
  PERMISSIONS,
} from '@/services/permissionService';

const PermissionContext = createContext(null);

export const PermissionProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Load permissions when user changes
  useEffect(() => {
    const loadPermissions = async () => {
      if (authLoading) return;

      setLoading(true);
      
      if (user) {
        const result = await loadUserPermissions(user.id);
        setPermissions(result.permissions);
        setRole(result.role);
      } else {
        setPermissions([]);
        setRole(null);
      }
      
      setLoading(false);
      setInitialized(true);
    };

    loadPermissions();
  }, [user, authLoading]);

  // Refresh permissions (call after role changes)
  const refreshPermissions = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    const result = await loadUserPermissions(user.id);
    setPermissions(result.permissions);
    setRole(result.role);
    setLoading(false);
  }, [user]);

  // Permission check functions
  const hasPermission = useCallback((permission) => {
    return permissions.includes(permission);
  }, [permissions]);

  const hasAnyPermission = useCallback((perms) => {
    return perms.some(p => permissions.includes(p));
  }, [permissions]);

  const hasAllPermissions = useCallback((perms) => {
    return perms.every(p => permissions.includes(p));
  }, [permissions]);

  const isAdmin = useCallback(() => {
    return [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(role);
  }, [role]);

  const isSuperAdmin = useCallback(() => {
    return role === ROLES.SUPER_ADMIN;
  }, [role]);

  // Can access specific module
  const canAccessModule = useCallback((module) => {
    const modulePermissions = {
      projects: [PERMISSIONS.PROJECTS_VIEW],
      pipeline: [PERMISSIONS.PIPELINE_VIEW],
      accounting: [PERMISSIONS.ACCOUNTING_VIEW],
      investors: [PERMISSIONS.INVESTORS_VIEW],
      investments: [PERMISSIONS.INVESTMENTS_VIEW],
      properties: [PERMISSIONS.PROPERTIES_VIEW],
      documents: [PERMISSIONS.DOCUMENTS_VIEW],
      contacts: [PERMISSIONS.CONTACTS_VIEW],
      admin: [PERMISSIONS.ADMIN_SETTINGS],
      users: [PERMISSIONS.USERS_VIEW],
    };

    const required = modulePermissions[module];
    if (!required) return true; // Unknown module, allow access
    
    return hasAnyPermission(required);
  }, [hasAnyPermission]);

  const value = {
    permissions,
    role,
    loading,
    initialized,
    refreshPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isSuperAdmin,
    canAccessModule,
    ROLES,
    PERMISSIONS,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

// ============================================
// PERMISSION-AWARE COMPONENTS
// ============================================

// Gate component - renders children only if user has permission
export const PermissionGate = ({ 
  permission, 
  permissions, 
  requireAll = false,
  fallback = null, 
  children 
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();

  if (loading) return null;

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  } else {
    hasAccess = true;
  }

  return hasAccess ? children : fallback;
};

// Role gate - renders children only if user has specific role
export const RoleGate = ({
  role,
  roles,
  fallback = null,
  children
}) => {
  const { role: userRole, loading } = usePermissions();

  if (loading) return null;

  let hasAccess = false;

  if (role) {
    hasAccess = userRole === role;
  } else if (roles) {
    hasAccess = roles.includes(userRole);
  } else {
    hasAccess = true;
  }

  return hasAccess ? children : fallback;
};

// Admin gate - renders children only if user is admin
export const AdminGate = ({ fallback = null, children }) => {
  const { isAdmin, loading } = usePermissions();

  if (loading) return null;

  return isAdmin() ? children : fallback;
};

// Module gate - renders children only if user can access module
export const ModuleGate = ({ module, fallback = null, children }) => {
  const { canAccessModule, loading } = usePermissions();

  if (loading) return null;

  return canAccessModule(module) ? children : fallback;
};

export default PermissionContext;
