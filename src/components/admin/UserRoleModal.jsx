// src/components/admin/UserRoleModal.jsx
// Modal for editing user roles and custom permissions

import React, { useState, useEffect } from 'react';
import { 
  X, Shield, Check, ChevronDown, ChevronRight, Loader2, 
  AlertCircle, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ROLES,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  ROLE_PERMISSIONS,
  PERMISSION_GROUPS,
  PERMISSIONS,
} from '@/services/permissionService';

const ROLE_COLORS = {
  [ROLES.SUPER_ADMIN]: 'border-purple-500 bg-purple-50',
  [ROLES.ADMIN]: 'border-red-500 bg-red-50',
  [ROLES.MANAGER]: 'border-blue-500 bg-blue-50',
  [ROLES.ACCOUNTANT]: 'border-green-500 bg-green-50',
  [ROLES.PROJECT_MANAGER]: 'border-amber-500 bg-amber-50',
  [ROLES.PROPERTY_MANAGER]: 'border-teal-500 bg-teal-50',
  [ROLES.INVESTOR_RELATIONS]: 'border-indigo-500 bg-indigo-50',
  [ROLES.TEAM_MEMBER]: 'border-gray-500 bg-gray-50',
  [ROLES.VIEWER]: 'border-slate-500 bg-slate-50',
  [ROLES.EXTERNAL]: 'border-orange-500 bg-orange-50',
};

const UserRoleModal = ({
  isOpen,
  onClose,
  user,
  onSave,
}) => {
  const [selectedRole, setSelectedRole] = useState(user?.role || ROLES.TEAM_MEMBER);
  const [customPermissions, setCustomPermissions] = useState(user?.custom_permissions || []);
  const [showCustomPermissions, setShowCustomPermissions] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role || ROLES.TEAM_MEMBER);
      setCustomPermissions(user.custom_permissions || []);
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    
    try {
      await onSave(user.id, selectedRole, customPermissions);
    } catch (err) {
      setError(err.message || 'Failed to save role');
      setSaving(false);
    }
  };

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const toggleCustomPermission = (permissionId) => {
    setCustomPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(p => p !== permissionId);
      }
      return [...prev, permissionId];
    });
  };

  const getRolePermissions = () => {
    return ROLE_PERMISSIONS[selectedRole] || [];
  };

  const isPermissionInRole = (permissionId) => {
    return getRolePermissions().includes(permissionId);
  };

  const isPermissionEnabled = (permissionId) => {
    return isPermissionInRole(permissionId) || customPermissions.includes(permissionId);
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Edit User Role</h2>
              <p className="text-sm text-gray-500">{user.full_name || user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Role Selection */}
          <div>
            <h3 className="font-medium mb-3">Select Role</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(ROLES).map(([key, roleId]) => {
                // Don't show super_admin unless user is already one
                if (roleId === ROLES.SUPER_ADMIN && user.role !== ROLES.SUPER_ADMIN) {
                  return null;
                }
                
                return (
                  <button
                    key={roleId}
                    onClick={() => setSelectedRole(roleId)}
                    className={cn(
                      "p-3 border-2 rounded-lg text-left transition-all",
                      selectedRole === roleId
                        ? ROLE_COLORS[roleId]
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{ROLE_LABELS[roleId]}</span>
                      {selectedRole === roleId && (
                        <Check className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {ROLE_DESCRIPTIONS[roleId]}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role Permissions Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Role Permissions</h4>
              <span className="text-xs text-gray-500">
                {getRolePermissions().length} permissions
              </span>
            </div>
            <p className="text-xs text-gray-500">
              This role includes access to: {' '}
              {PERMISSION_GROUPS
                .filter(g => g.permissions.some(p => isPermissionInRole(p.id)))
                .map(g => g.name)
                .join(', ') || 'None'}
            </p>
          </div>

          {/* Custom Permissions */}
          <div>
            <button
              onClick={() => setShowCustomPermissions(!showCustomPermissions)}
              className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700"
            >
              {showCustomPermissions ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              Add Custom Permissions
              {customPermissions.length > 0 && (
                <span className="px-1.5 py-0.5 bg-purple-100 rounded text-xs">
                  {customPermissions.length}
                </span>
              )}
            </button>

            {showCustomPermissions && (
              <div className="mt-3 space-y-3">
                <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    Custom permissions are added on top of the role's base permissions. 
                    Grayed out items are already included in the selected role.
                  </p>
                </div>

                {PERMISSION_GROUPS.map((group) => (
                  <div key={group.name} className="border rounded-lg">
                    <button
                      onClick={() => toggleGroup(group.name)}
                      className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50"
                    >
                      <span className="text-sm font-medium">{group.name}</span>
                      {expandedGroups[group.name] ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </button>

                    {expandedGroups[group.name] && (
                      <div className="px-3 pb-3 space-y-1">
                        {group.permissions.map((perm) => {
                          const inRole = isPermissionInRole(perm.id);
                          const isCustom = customPermissions.includes(perm.id);
                          
                          return (
                            <label
                              key={perm.id}
                              className={cn(
                                "flex items-center gap-2 p-2 rounded cursor-pointer",
                                inRole 
                                  ? "bg-gray-100 cursor-not-allowed" 
                                  : "hover:bg-gray-50"
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={inRole || isCustom}
                                disabled={inRole}
                                onChange={() => !inRole && toggleCustomPermission(perm.id)}
                                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                              />
                              <span className={cn(
                                "text-sm",
                                inRole && "text-gray-400"
                              )}>
                                {perm.label}
                              </span>
                              {inRole && (
                                <span className="text-xs text-gray-400">(in role)</span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Changes will take effect immediately
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRoleModal;
