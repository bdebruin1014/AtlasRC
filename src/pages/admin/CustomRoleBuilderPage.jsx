import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Shield, Plus, Edit2, Trash2, Copy, Search, Users, CheckCircle,
  AlertTriangle, Save, RefreshCw, ChevronDown, ChevronRight, Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Permission categories and permissions
const permissionCategories = [
  {
    name: 'User Management',
    id: 'users',
    permissions: [
      { id: 'users.view', label: 'View Users', description: 'View user list and profiles' },
      { id: 'users.create', label: 'Create Users', description: 'Create new user accounts' },
      { id: 'users.edit', label: 'Edit Users', description: 'Modify user information' },
      { id: 'users.delete', label: 'Delete Users', description: 'Remove user accounts' },
      { id: 'users.roles', label: 'Manage Roles', description: 'Assign and modify user roles' },
    ],
  },
  {
    name: 'Projects',
    id: 'projects',
    permissions: [
      { id: 'projects.view', label: 'View Projects', description: 'View project list and details' },
      { id: 'projects.create', label: 'Create Projects', description: 'Create new projects' },
      { id: 'projects.edit', label: 'Edit Projects', description: 'Modify project information' },
      { id: 'projects.delete', label: 'Delete Projects', description: 'Remove projects' },
      { id: 'projects.manage_team', label: 'Manage Team', description: 'Add/remove project members' },
    ],
  },
  {
    name: 'Accounting',
    id: 'accounting',
    permissions: [
      { id: 'accounting.view', label: 'View Transactions', description: 'View financial transactions' },
      { id: 'accounting.create', label: 'Create Transactions', description: 'Create journal entries and transactions' },
      { id: 'accounting.edit', label: 'Edit Transactions', description: 'Modify transactions' },
      { id: 'accounting.delete', label: 'Delete Transactions', description: 'Remove transactions' },
      { id: 'accounting.approve', label: 'Approve Transactions', description: 'Approve pending transactions' },
      { id: 'accounting.reports', label: 'View Reports', description: 'Access financial reports' },
    ],
  },
  {
    name: 'Documents',
    id: 'documents',
    permissions: [
      { id: 'documents.view', label: 'View Documents', description: 'View and download documents' },
      { id: 'documents.upload', label: 'Upload Documents', description: 'Upload new documents' },
      { id: 'documents.edit', label: 'Edit Documents', description: 'Modify document metadata' },
      { id: 'documents.delete', label: 'Delete Documents', description: 'Remove documents' },
      { id: 'documents.share', label: 'Share Documents', description: 'Share documents externally' },
    ],
  },
  {
    name: 'Investors',
    id: 'investors',
    permissions: [
      { id: 'investors.view', label: 'View Investors', description: 'View investor profiles' },
      { id: 'investors.create', label: 'Create Investors', description: 'Add new investors' },
      { id: 'investors.edit', label: 'Edit Investors', description: 'Modify investor information' },
      { id: 'investors.delete', label: 'Delete Investors', description: 'Remove investors' },
      { id: 'investors.distributions', label: 'Manage Distributions', description: 'Handle investor distributions' },
    ],
  },
  {
    name: 'Admin',
    id: 'admin',
    permissions: [
      { id: 'admin.settings', label: 'System Settings', description: 'Modify system configuration' },
      { id: 'admin.audit', label: 'View Audit Logs', description: 'Access audit trail' },
      { id: 'admin.integrations', label: 'Manage Integrations', description: 'Configure third-party integrations' },
      { id: 'admin.billing', label: 'Billing & Subscription', description: 'Manage billing settings' },
    ],
  },
];

// Mock existing roles
const mockRoles = [
  {
    id: 'role_super_admin',
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    isSystem: true,
    userCount: 2,
    permissions: permissionCategories.flatMap(c => c.permissions.map(p => p.id)),
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'role_admin',
    name: 'Admin',
    description: 'Administrative access without user deletion',
    isSystem: true,
    userCount: 5,
    permissions: permissionCategories.flatMap(c => c.permissions.map(p => p.id)).filter(p => p !== 'users.delete'),
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'role_manager',
    name: 'Manager',
    description: 'Project and team management',
    isSystem: true,
    userCount: 12,
    permissions: ['users.view', 'projects.view', 'projects.create', 'projects.edit', 'projects.manage_team', 'accounting.view', 'accounting.reports', 'documents.view', 'documents.upload'],
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'role_accountant',
    name: 'Accountant',
    description: 'Full accounting access',
    isSystem: true,
    userCount: 4,
    permissions: ['accounting.view', 'accounting.create', 'accounting.edit', 'accounting.approve', 'accounting.reports', 'documents.view', 'documents.upload'],
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'role_custom_1',
    name: 'Project Coordinator',
    description: 'Custom role for project coordination',
    isSystem: false,
    userCount: 8,
    permissions: ['projects.view', 'projects.edit', 'documents.view', 'documents.upload', 'documents.share'],
    createdAt: '2024-01-10T10:00:00Z',
  },
];

const CustomRoleBuilderPage = () => {
  const { toast } = useToast();
  const [roles, setRoles] = useState(mockRoles);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(permissionCategories.map(c => c.id));
  const [saving, setSaving] = useState(false);

  const [roleData, setRoleData] = useState({
    name: '',
    description: '',
    permissions: [],
  });

  const filteredRoles = roles.filter(role =>
    !searchQuery ||
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const togglePermission = (permissionId) => {
    setRoleData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const toggleAllInCategory = (category) => {
    const categoryPermissions = category.permissions.map(p => p.id);
    const allSelected = categoryPermissions.every(p => roleData.permissions.includes(p));

    setRoleData(prev => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter(p => !categoryPermissions.includes(p))
        : [...new Set([...prev.permissions, ...categoryPermissions])],
    }));
  };

  const handleAddRole = () => {
    setEditingRole(null);
    setRoleData({
      name: '',
      description: '',
      permissions: [],
    });
    setShowRoleDialog(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setRoleData({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions],
    });
    setShowRoleDialog(true);
  };

  const handleDuplicateRole = (role) => {
    setEditingRole(null);
    setRoleData({
      name: `${role.name} (Copy)`,
      description: role.description,
      permissions: [...role.permissions],
    });
    setShowRoleDialog(true);
  };

  const handleSaveRole = async () => {
    if (!roleData.name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Invalid Input',
        description: 'Please enter a role name',
      });
      return;
    }

    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (editingRole) {
      setRoles(prev => prev.map(r =>
        r.id === editingRole.id
          ? { ...r, name: roleData.name, description: roleData.description, permissions: roleData.permissions }
          : r
      ));
      toast({
        title: 'Role Updated',
        description: `${roleData.name} has been updated successfully`,
      });
    } else {
      const newRole = {
        id: `role_custom_${Date.now()}`,
        name: roleData.name,
        description: roleData.description,
        isSystem: false,
        userCount: 0,
        permissions: roleData.permissions,
        createdAt: new Date().toISOString(),
      };
      setRoles(prev => [...prev, newRole]);
      toast({
        title: 'Role Created',
        description: `${roleData.name} has been created successfully`,
      });
    }

    setSaving(false);
    setShowRoleDialog(false);
  };

  const handleDeleteRole = () => {
    if (!selectedRole) return;

    setRoles(prev => prev.filter(r => r.id !== selectedRole.id));
    setShowDeleteDialog(false);
    setSelectedRole(null);

    toast({
      title: 'Role Deleted',
      description: `${selectedRole.name} has been deleted`,
    });
  };

  const getCategoryPermissionCount = (category, permissions) => {
    const selected = category.permissions.filter(p => permissions.includes(p.id)).length;
    return `${selected}/${category.permissions.length}`;
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Custom Role Builder | Admin</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Custom Role Builder</h1>
          <p className="text-gray-600 mt-2">Create and manage custom roles with granular permissions</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddRole}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Role
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Roles</p>
                <p className="text-2xl font-bold">{roles.length}</p>
              </div>
              <Shield className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">System Roles</p>
                <p className="text-2xl font-bold">{roles.filter(r => r.isSystem).length}</p>
              </div>
              <Lock className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Custom Roles</p>
                <p className="text-2xl font-bold">{roles.filter(r => !r.isSystem).length}</p>
              </div>
              <Edit2 className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Permissions</p>
                <p className="text-2xl font-bold">{permissionCategories.flatMap(c => c.permissions).length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search roles..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
          <CardDescription>Manage system and custom roles</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No roles found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{role.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{role.description}</TableCell>
                    <TableCell>
                      {role.isSystem ? (
                        <Badge className="bg-blue-100 text-blue-800">
                          <Lock className="w-3 h-3 mr-1" />
                          System
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800">Custom</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{role.userCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{role.permissions.length} permissions</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDateTime(role.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDuplicateRole(role)}
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRole(role)}
                          disabled={role.isSystem}
                          title={role.isSystem ? 'System roles cannot be edited' : 'Edit'}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRole(role);
                            setShowDeleteDialog(true);
                          }}
                          disabled={role.isSystem || role.userCount > 0}
                          className="text-red-600 hover:text-red-700"
                          title={role.isSystem ? 'System roles cannot be deleted' : role.userCount > 0 ? 'Cannot delete role with assigned users' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingRole ? 'Edit Role' : 'Create New Role'}</DialogTitle>
            <DialogDescription>
              {editingRole
                ? 'Modify role settings and permissions'
                : 'Define a new custom role with specific permissions'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roleName">Role Name *</Label>
                <Input
                  id="roleName"
                  placeholder="e.g., Project Coordinator"
                  value={roleData.name}
                  onChange={(e) => setRoleData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roleDescription">Description</Label>
                <Input
                  id="roleDescription"
                  placeholder="Brief description of this role"
                  value={roleData.description}
                  onChange={(e) => setRoleData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Permissions ({roleData.permissions.length} selected)</Label>
              <ScrollArea className="h-[400px] border rounded-lg p-4">
                <div className="space-y-4">
                  {permissionCategories.map((category) => {
                    const isExpanded = expandedCategories.includes(category.id);
                    const categoryPermissions = category.permissions.map(p => p.id);
                    const selectedCount = categoryPermissions.filter(p => roleData.permissions.includes(p)).length;
                    const allSelected = selectedCount === category.permissions.length;
                    const someSelected = selectedCount > 0 && !allSelected;

                    return (
                      <div key={category.id} className="border rounded-lg">
                        <div
                          className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer"
                          onClick={() => toggleCategory(category.id)}
                        >
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                            <Checkbox
                              checked={allSelected}
                              ref={(el) => el && (el.indeterminate = someSelected)}
                              onCheckedChange={() => toggleAllInCategory(category)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="font-medium">{category.name}</span>
                          </div>
                          <Badge variant="outline">
                            {getCategoryPermissionCount(category, roleData.permissions)}
                          </Badge>
                        </div>

                        {isExpanded && (
                          <div className="p-3 space-y-2">
                            {category.permissions.map((permission) => (
                              <div
                                key={permission.id}
                                className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50"
                              >
                                <Checkbox
                                  id={permission.id}
                                  checked={roleData.permissions.includes(permission.id)}
                                  onCheckedChange={() => togglePermission(permission.id)}
                                />
                                <div className="flex-1">
                                  <Label
                                    htmlFor={permission.id}
                                    className="font-normal cursor-pointer"
                                  >
                                    {permission.label}
                                  </Label>
                                  <p className="text-xs text-gray-500">{permission.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveRole}
              disabled={saving || !roleData.name.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {editingRole ? 'Update Role' : 'Create Role'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Delete Role
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this role? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <div className="py-4 space-y-2 text-sm">
              <div><strong>Role:</strong> {selectedRole.name}</div>
              <div><strong>Description:</strong> {selectedRole.description}</div>
              <div><strong>Permissions:</strong> {selectedRole.permissions.length}</div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRole}>
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomRoleBuilderPage;
