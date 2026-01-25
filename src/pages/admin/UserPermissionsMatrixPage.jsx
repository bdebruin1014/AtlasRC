import React, { useState, useMemo } from 'react';
import {
  Shield,
  Users,
  Search,
  Filter,
  Download,
  Plus,
  Edit3,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Save,
  AlertCircle,
  Eye,
  FileText,
  DollarSign,
  Building2,
  Briefcase,
  Settings,
  Calendar,
  BarChart3,
  Home,
  FolderOpen,
  UserPlus,
  Lock,
  Unlock,
  Copy,
  MoreHorizontal
} from 'lucide-react';

const UserPermissionsMatrixPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedModule, setSelectedModule] = useState('all');
  const [expandedModules, setExpandedModules] = useState(new Set(['projects', 'opportunities']));
  const [editMode, setEditMode] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Permission levels
  const permissionLevels = {
    none: { label: 'None', color: 'bg-gray-100 text-gray-400', icon: X },
    view: { label: 'View', color: 'bg-blue-100 text-blue-700', icon: Eye },
    edit: { label: 'Edit', color: 'bg-yellow-100 text-yellow-700', icon: Edit3 },
    full: { label: 'Full', color: 'bg-green-100 text-green-700', icon: Check },
  };

  // Roles
  const roles = [
    { id: 'admin', name: 'Administrator', description: 'Full system access', users: 3, color: 'bg-red-100 text-red-700' },
    { id: 'manager', name: 'Manager', description: 'Department-level access', users: 8, color: 'bg-purple-100 text-purple-700' },
    { id: 'analyst', name: 'Analyst', description: 'Read and analyze data', users: 12, color: 'bg-blue-100 text-blue-700' },
    { id: 'acquisitions', name: 'Acquisitions Team', description: 'Deal sourcing and analysis', users: 6, color: 'bg-green-100 text-green-700' },
    { id: 'construction', name: 'Construction Team', description: 'Project execution', users: 15, color: 'bg-orange-100 text-orange-700' },
    { id: 'finance', name: 'Finance Team', description: 'Accounting and reporting', users: 5, color: 'bg-cyan-100 text-cyan-700' },
    { id: 'viewer', name: 'Viewer', description: 'Read-only access', users: 10, color: 'bg-gray-100 text-gray-700' },
  ];

  // Modules with permissions
  const modules = [
    {
      id: 'projects',
      name: 'Projects',
      icon: Building2,
      permissions: [
        { id: 'projects.view', name: 'View Projects' },
        { id: 'projects.create', name: 'Create Projects' },
        { id: 'projects.edit', name: 'Edit Projects' },
        { id: 'projects.delete', name: 'Delete Projects' },
        { id: 'projects.budget', name: 'Manage Budgets' },
        { id: 'projects.schedule', name: 'Manage Schedules' },
        { id: 'projects.documents', name: 'Manage Documents' },
      ]
    },
    {
      id: 'opportunities',
      name: 'Opportunities',
      icon: Briefcase,
      permissions: [
        { id: 'opportunities.view', name: 'View Opportunities' },
        { id: 'opportunities.create', name: 'Create Opportunities' },
        { id: 'opportunities.edit', name: 'Edit Opportunities' },
        { id: 'opportunities.delete', name: 'Delete Opportunities' },
        { id: 'opportunities.convert', name: 'Convert to Project' },
        { id: 'opportunities.analysis', name: 'Run Analysis' },
      ]
    },
    {
      id: 'accounting',
      name: 'Accounting',
      icon: DollarSign,
      permissions: [
        { id: 'accounting.view', name: 'View Transactions' },
        { id: 'accounting.create', name: 'Create Transactions' },
        { id: 'accounting.approve', name: 'Approve Transactions' },
        { id: 'accounting.reports', name: 'Run Reports' },
        { id: 'accounting.reconcile', name: 'Bank Reconciliation' },
        { id: 'accounting.settings', name: 'Accounting Settings' },
      ]
    },
    {
      id: 'contacts',
      name: 'Contacts',
      icon: Users,
      permissions: [
        { id: 'contacts.view', name: 'View Contacts' },
        { id: 'contacts.create', name: 'Create Contacts' },
        { id: 'contacts.edit', name: 'Edit Contacts' },
        { id: 'contacts.delete', name: 'Delete Contacts' },
        { id: 'contacts.export', name: 'Export Contacts' },
      ]
    },
    {
      id: 'entities',
      name: 'Entities',
      icon: Home,
      permissions: [
        { id: 'entities.view', name: 'View Entities' },
        { id: 'entities.create', name: 'Create Entities' },
        { id: 'entities.edit', name: 'Edit Entities' },
        { id: 'entities.ownership', name: 'Manage Ownership' },
      ]
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: BarChart3,
      permissions: [
        { id: 'reports.view', name: 'View Reports' },
        { id: 'reports.create', name: 'Create Custom Reports' },
        { id: 'reports.schedule', name: 'Schedule Reports' },
        { id: 'reports.export', name: 'Export Reports' },
      ]
    },
    {
      id: 'documents',
      name: 'Documents',
      icon: FolderOpen,
      permissions: [
        { id: 'documents.view', name: 'View Documents' },
        { id: 'documents.upload', name: 'Upload Documents' },
        { id: 'documents.delete', name: 'Delete Documents' },
        { id: 'documents.share', name: 'Share Documents' },
      ]
    },
    {
      id: 'admin',
      name: 'Administration',
      icon: Settings,
      permissions: [
        { id: 'admin.users', name: 'Manage Users' },
        { id: 'admin.roles', name: 'Manage Roles' },
        { id: 'admin.settings', name: 'System Settings' },
        { id: 'admin.integrations', name: 'Manage Integrations' },
        { id: 'admin.audit', name: 'View Audit Logs' },
      ]
    },
  ];

  // Permission matrix (role -> permission -> level)
  const [permissionMatrix, setPermissionMatrix] = useState({
    admin: {
      'projects.view': 'full', 'projects.create': 'full', 'projects.edit': 'full', 'projects.delete': 'full',
      'projects.budget': 'full', 'projects.schedule': 'full', 'projects.documents': 'full',
      'opportunities.view': 'full', 'opportunities.create': 'full', 'opportunities.edit': 'full',
      'opportunities.delete': 'full', 'opportunities.convert': 'full', 'opportunities.analysis': 'full',
      'accounting.view': 'full', 'accounting.create': 'full', 'accounting.approve': 'full',
      'accounting.reports': 'full', 'accounting.reconcile': 'full', 'accounting.settings': 'full',
      'contacts.view': 'full', 'contacts.create': 'full', 'contacts.edit': 'full',
      'contacts.delete': 'full', 'contacts.export': 'full',
      'entities.view': 'full', 'entities.create': 'full', 'entities.edit': 'full', 'entities.ownership': 'full',
      'reports.view': 'full', 'reports.create': 'full', 'reports.schedule': 'full', 'reports.export': 'full',
      'documents.view': 'full', 'documents.upload': 'full', 'documents.delete': 'full', 'documents.share': 'full',
      'admin.users': 'full', 'admin.roles': 'full', 'admin.settings': 'full',
      'admin.integrations': 'full', 'admin.audit': 'full',
    },
    manager: {
      'projects.view': 'full', 'projects.create': 'full', 'projects.edit': 'full', 'projects.delete': 'edit',
      'projects.budget': 'full', 'projects.schedule': 'full', 'projects.documents': 'full',
      'opportunities.view': 'full', 'opportunities.create': 'full', 'opportunities.edit': 'full',
      'opportunities.delete': 'edit', 'opportunities.convert': 'full', 'opportunities.analysis': 'full',
      'accounting.view': 'full', 'accounting.create': 'edit', 'accounting.approve': 'full',
      'accounting.reports': 'full', 'accounting.reconcile': 'view', 'accounting.settings': 'view',
      'contacts.view': 'full', 'contacts.create': 'full', 'contacts.edit': 'full',
      'contacts.delete': 'edit', 'contacts.export': 'full',
      'entities.view': 'full', 'entities.create': 'edit', 'entities.edit': 'full', 'entities.ownership': 'view',
      'reports.view': 'full', 'reports.create': 'full', 'reports.schedule': 'full', 'reports.export': 'full',
      'documents.view': 'full', 'documents.upload': 'full', 'documents.delete': 'edit', 'documents.share': 'full',
      'admin.users': 'view', 'admin.roles': 'view', 'admin.settings': 'view',
      'admin.integrations': 'view', 'admin.audit': 'view',
    },
    analyst: {
      'projects.view': 'full', 'projects.create': 'none', 'projects.edit': 'view', 'projects.delete': 'none',
      'projects.budget': 'view', 'projects.schedule': 'view', 'projects.documents': 'view',
      'opportunities.view': 'full', 'opportunities.create': 'none', 'opportunities.edit': 'view',
      'opportunities.delete': 'none', 'opportunities.convert': 'none', 'opportunities.analysis': 'full',
      'accounting.view': 'full', 'accounting.create': 'none', 'accounting.approve': 'none',
      'accounting.reports': 'full', 'accounting.reconcile': 'none', 'accounting.settings': 'none',
      'contacts.view': 'full', 'contacts.create': 'none', 'contacts.edit': 'none',
      'contacts.delete': 'none', 'contacts.export': 'view',
      'entities.view': 'full', 'entities.create': 'none', 'entities.edit': 'none', 'entities.ownership': 'view',
      'reports.view': 'full', 'reports.create': 'edit', 'reports.schedule': 'none', 'reports.export': 'full',
      'documents.view': 'full', 'documents.upload': 'none', 'documents.delete': 'none', 'documents.share': 'view',
      'admin.users': 'none', 'admin.roles': 'none', 'admin.settings': 'none',
      'admin.integrations': 'none', 'admin.audit': 'none',
    },
    acquisitions: {
      'projects.view': 'full', 'projects.create': 'edit', 'projects.edit': 'edit', 'projects.delete': 'none',
      'projects.budget': 'view', 'projects.schedule': 'view', 'projects.documents': 'full',
      'opportunities.view': 'full', 'opportunities.create': 'full', 'opportunities.edit': 'full',
      'opportunities.delete': 'edit', 'opportunities.convert': 'full', 'opportunities.analysis': 'full',
      'accounting.view': 'view', 'accounting.create': 'none', 'accounting.approve': 'none',
      'accounting.reports': 'view', 'accounting.reconcile': 'none', 'accounting.settings': 'none',
      'contacts.view': 'full', 'contacts.create': 'full', 'contacts.edit': 'full',
      'contacts.delete': 'none', 'contacts.export': 'edit',
      'entities.view': 'full', 'entities.create': 'edit', 'entities.edit': 'edit', 'entities.ownership': 'view',
      'reports.view': 'full', 'reports.create': 'none', 'reports.schedule': 'none', 'reports.export': 'edit',
      'documents.view': 'full', 'documents.upload': 'full', 'documents.delete': 'edit', 'documents.share': 'full',
      'admin.users': 'none', 'admin.roles': 'none', 'admin.settings': 'none',
      'admin.integrations': 'none', 'admin.audit': 'none',
    },
    construction: {
      'projects.view': 'full', 'projects.create': 'none', 'projects.edit': 'full', 'projects.delete': 'none',
      'projects.budget': 'full', 'projects.schedule': 'full', 'projects.documents': 'full',
      'opportunities.view': 'view', 'opportunities.create': 'none', 'opportunities.edit': 'none',
      'opportunities.delete': 'none', 'opportunities.convert': 'none', 'opportunities.analysis': 'none',
      'accounting.view': 'view', 'accounting.create': 'edit', 'accounting.approve': 'none',
      'accounting.reports': 'view', 'accounting.reconcile': 'none', 'accounting.settings': 'none',
      'contacts.view': 'full', 'contacts.create': 'edit', 'contacts.edit': 'edit',
      'contacts.delete': 'none', 'contacts.export': 'none',
      'entities.view': 'view', 'entities.create': 'none', 'entities.edit': 'none', 'entities.ownership': 'none',
      'reports.view': 'edit', 'reports.create': 'none', 'reports.schedule': 'none', 'reports.export': 'edit',
      'documents.view': 'full', 'documents.upload': 'full', 'documents.delete': 'edit', 'documents.share': 'edit',
      'admin.users': 'none', 'admin.roles': 'none', 'admin.settings': 'none',
      'admin.integrations': 'none', 'admin.audit': 'none',
    },
    finance: {
      'projects.view': 'full', 'projects.create': 'none', 'projects.edit': 'view', 'projects.delete': 'none',
      'projects.budget': 'full', 'projects.schedule': 'view', 'projects.documents': 'full',
      'opportunities.view': 'full', 'opportunities.create': 'none', 'opportunities.edit': 'view',
      'opportunities.delete': 'none', 'opportunities.convert': 'none', 'opportunities.analysis': 'full',
      'accounting.view': 'full', 'accounting.create': 'full', 'accounting.approve': 'full',
      'accounting.reports': 'full', 'accounting.reconcile': 'full', 'accounting.settings': 'edit',
      'contacts.view': 'full', 'contacts.create': 'edit', 'contacts.edit': 'edit',
      'contacts.delete': 'none', 'contacts.export': 'full',
      'entities.view': 'full', 'entities.create': 'edit', 'entities.edit': 'full', 'entities.ownership': 'full',
      'reports.view': 'full', 'reports.create': 'full', 'reports.schedule': 'full', 'reports.export': 'full',
      'documents.view': 'full', 'documents.upload': 'full', 'documents.delete': 'edit', 'documents.share': 'full',
      'admin.users': 'none', 'admin.roles': 'none', 'admin.settings': 'none',
      'admin.integrations': 'view', 'admin.audit': 'view',
    },
    viewer: {
      'projects.view': 'view', 'projects.create': 'none', 'projects.edit': 'none', 'projects.delete': 'none',
      'projects.budget': 'view', 'projects.schedule': 'view', 'projects.documents': 'view',
      'opportunities.view': 'view', 'opportunities.create': 'none', 'opportunities.edit': 'none',
      'opportunities.delete': 'none', 'opportunities.convert': 'none', 'opportunities.analysis': 'none',
      'accounting.view': 'view', 'accounting.create': 'none', 'accounting.approve': 'none',
      'accounting.reports': 'view', 'accounting.reconcile': 'none', 'accounting.settings': 'none',
      'contacts.view': 'view', 'contacts.create': 'none', 'contacts.edit': 'none',
      'contacts.delete': 'none', 'contacts.export': 'none',
      'entities.view': 'view', 'entities.create': 'none', 'entities.edit': 'none', 'entities.ownership': 'none',
      'reports.view': 'view', 'reports.create': 'none', 'reports.schedule': 'none', 'reports.export': 'none',
      'documents.view': 'view', 'documents.upload': 'none', 'documents.delete': 'none', 'documents.share': 'none',
      'admin.users': 'none', 'admin.roles': 'none', 'admin.settings': 'none',
      'admin.integrations': 'none', 'admin.audit': 'none',
    },
  });

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const cyclePermission = (roleId, permissionId) => {
    if (!editMode) return;

    const levels = ['none', 'view', 'edit', 'full'];
    const currentLevel = permissionMatrix[roleId]?.[permissionId] || 'none';
    const currentIndex = levels.indexOf(currentLevel);
    const nextIndex = (currentIndex + 1) % levels.length;

    setPermissionMatrix(prev => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        [permissionId]: levels[nextIndex],
      }
    }));
  };

  const getPermissionBadge = (level) => {
    const info = permissionLevels[level] || permissionLevels.none;
    const IconComponent = info.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${info.color}`}>
        <IconComponent className="w-3 h-3" />
        {info.label}
      </span>
    );
  };

  const filteredRoles = roles.filter(role =>
    selectedRole === 'all' || role.id === selectedRole
  );

  const filteredModules = modules.filter(module =>
    selectedModule === 'all' || module.id === selectedModule
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="w-7 h-7 text-blue-600" />
                User Permissions Matrix
              </h1>
              <p className="text-gray-600 mt-1">
                Configure role-based access controls across all modules
              </p>
            </div>
            <div className="flex items-center gap-3">
              {editMode ? (
                <>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <button
                    onClick={() => setShowRoleModal(true)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                    New Role
                  </button>
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Permissions
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Modules</option>
              {modules.map(module => (
                <option key={module.id} value={module.id}>{module.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Roles Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          {roles.map(role => (
            <div
              key={role.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedRole === role.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => setSelectedRole(selectedRole === role.id ? 'all' : role.id)}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${role.color}`}>
                  {role.users}
                </span>
              </div>
              <p className="font-medium text-sm text-gray-900">{role.name}</p>
              <p className="text-xs text-gray-500 truncate">{role.description}</p>
            </div>
          ))}
        </div>

        {/* Edit Mode Banner */}
        {editMode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800">Edit Mode Active</p>
              <p className="text-sm text-yellow-700">Click on any permission badge to cycle through permission levels</p>
            </div>
          </div>
        )}

        {/* Permission Matrix */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900 sticky left-0 bg-gray-50 min-w-[200px]">
                    Module / Permission
                  </th>
                  {filteredRoles.map(role => (
                    <th key={role.id} className="text-center px-3 py-3 text-sm font-semibold text-gray-900 min-w-[100px]">
                      <div className="flex flex-col items-center gap-1">
                        <span>{role.name}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${role.color}`}>{role.users} users</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredModules.map(module => {
                  const ModuleIcon = module.icon;
                  const isExpanded = expandedModules.has(module.id);

                  return (
                    <React.Fragment key={module.id}>
                      {/* Module Header Row */}
                      <tr
                        className="bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                        onClick={() => toggleModule(module.id)}
                      >
                        <td className="px-4 py-3 sticky left-0 bg-gray-50">
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                            <ModuleIcon className="w-4 h-4 text-gray-600" />
                            <span className="font-medium text-gray-900">{module.name}</span>
                            <span className="text-xs text-gray-500">({module.permissions.length})</span>
                          </div>
                        </td>
                        {filteredRoles.map(role => (
                          <td key={role.id} className="text-center px-3 py-3">
                            {/* Could show aggregate permission level here */}
                          </td>
                        ))}
                      </tr>

                      {/* Permission Rows */}
                      {isExpanded && module.permissions.map(permission => (
                        <tr key={permission.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-2 pl-10 sticky left-0 bg-white">
                            <span className="text-sm text-gray-700">{permission.name}</span>
                          </td>
                          {filteredRoles.map(role => {
                            const level = permissionMatrix[role.id]?.[permission.id] || 'none';
                            return (
                              <td
                                key={role.id}
                                className={`text-center px-3 py-2 ${editMode ? 'cursor-pointer' : ''}`}
                                onClick={() => cyclePermission(role.id, permission.id)}
                              >
                                {getPermissionBadge(level)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Permission Levels</h4>
          <div className="flex flex-wrap gap-4">
            {Object.entries(permissionLevels).map(([key, info]) => {
              const IconComponent = info.icon;
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${info.color}`}>
                    <IconComponent className="w-3 h-3" />
                    {info.label}
                  </span>
                  <span className="text-sm text-gray-600">
                    {key === 'none' && '- No access'}
                    {key === 'view' && '- Read-only access'}
                    {key === 'edit' && '- Can view and modify'}
                    {key === 'full' && '- Full access including delete'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPermissionsMatrixPage;
