import React, { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users, Users2, Shield, Key, ClipboardList, Search, Plus,
  ChevronDown, ChevronRight, Check, Lock, X, MoreHorizontal,
  Mail, RefreshCw, UserMinus, UserPlus, Edit, Trash2, Eye,
  Loader2, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

import {
  getUsers, getUserStats, updateUser, deactivateUser, activateUser,
  resetUserPassword, formatLastLogin, getInitials,
} from '@/services/userService';
import {
  getTeams, createTeam, updateTeam, deleteTeam,
  addTeamMember, removeTeamMember, updateTeamMemberRole,
  getAvailableUsersForTeam, getUserTeams, TEAM_COLORS,
} from '@/services/teamService';
import {
  ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS, PERMISSIONS,
  ROLE_PERMISSIONS, PERMISSION_GROUPS, PERMISSION_TEMPLATES,
  setUserRole, getPermissionAuditLog,
} from '@/services/permissionService';
import InviteUserModal from '@/components/admin/InviteUserModal';

// ============================================
// ROLE COLORS
// ============================================
const ROLE_COLORS = {
  super_admin: 'bg-red-100 text-red-800 border-red-300',
  admin: 'bg-purple-100 text-purple-800 border-purple-300',
  manager: 'bg-blue-100 text-blue-800 border-blue-300',
  accountant: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  project_manager: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  property_manager: 'bg-teal-100 text-teal-800 border-teal-300',
  investor_relations: 'bg-amber-100 text-amber-800 border-amber-300',
  team_member: 'bg-gray-100 text-gray-800 border-gray-300',
  viewer: 'bg-slate-100 text-slate-700 border-slate-300',
  external: 'bg-orange-100 text-orange-800 border-orange-300',
};

const ROLE_BORDER_COLORS = {
  super_admin: 'border-l-red-500',
  admin: 'border-l-purple-500',
  manager: 'border-l-blue-500',
  accountant: 'border-l-emerald-500',
  project_manager: 'border-l-indigo-500',
  property_manager: 'border-l-teal-500',
  investor_relations: 'border-l-amber-500',
  team_member: 'border-l-gray-500',
  viewer: 'border-l-slate-500',
  external: 'border-l-orange-500',
};

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-600',
  pending: 'bg-yellow-100 text-yellow-700',
};

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500',
  'bg-red-500', 'bg-teal-500', 'bg-indigo-500', 'bg-pink-500',
];

function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ============================================
// USERS TAB
// ============================================
function UsersTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const { data: usersResult, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => getUsers(),
  });
  const { data: statsResult } = useQuery({
    queryKey: ['admin-user-stats'],
    queryFn: () => getUserStats(),
  });

  const users = usersResult?.data || [];
  const stats = statsResult?.data || { total: 0, active: 0, inactive: 0, pending: 0 };

  const deactivateMutation = useMutation({
    mutationFn: (userId) => deactivateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-stats'] });
      toast({ title: 'User deactivated' });
    },
  });

  const activateMutation = useMutation({
    mutationFn: (userId) => activateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-stats'] });
      toast({ title: 'User activated' });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (userId) => resetUserPassword(userId),
    onSuccess: () => toast({ title: 'Password reset email sent' }),
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ userId, role, customPermissions }) => setUserRole(userId, role, customPermissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowRoleModal(false);
      setSelectedUser(null);
      toast({ title: 'Role updated successfully' });
    },
  });

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (search) {
        const q = search.toLowerCase();
        if (!u.full_name?.toLowerCase().includes(q) && !u.email?.toLowerCase().includes(q)) return false;
      }
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (statusFilter !== 'all' && u.status !== statusFilter) return false;
      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  const roleCounts = useMemo(() => {
    const counts = {};
    Object.values(ROLES).forEach(r => { counts[r] = 0; });
    users.forEach(u => { if (u.role && counts[u.role] !== undefined) counts[u.role]++; });
    return counts;
  }, [users]);

  const openChangeRole = (user) => {
    setSelectedUser(user);
    setSelectedRole(user.role || ROLES.TEAM_MEMBER);
    setSelectedTemplate(null);
    setShowRoleModal(true);
  };

  const handleSaveRole = () => {
    if (!selectedUser) return;
    const customPerms = selectedTemplate ? selectedTemplate.permissions : [];
    changeRoleMutation.mutate({ userId: selectedUser.id, role: selectedRole, customPermissions: customPerms });
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.total, color: 'text-gray-900' },
          { label: 'Active', value: stats.active, color: 'text-green-600' },
          { label: 'Inactive', value: stats.inactive, color: 'text-gray-500' },
          { label: 'Pending', value: stats.pending, color: 'text-yellow-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border rounded-lg p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search users..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Roles" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {Object.entries(ROLE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Button className="bg-emerald-700 hover:bg-emerald-800 ml-auto" onClick={() => setShowInviteModal(true)}>
          <UserPlus className="w-4 h-4 mr-2" />Invite User
        </Button>
      </div>

      {/* Users Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading users...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Last Login</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map(user => {
                const roleColor = ROLE_COLORS[user.role] || ROLE_COLORS.team_member;
                const statusColor = STATUS_COLORS[user.status] || STATUS_COLORS.active;
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-medium', getAvatarColor(user.full_name))}>
                          {getInitials(user.full_name || user.email)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.full_name || 'Unnamed'}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={cn('text-xs', roleColor)}>{ROLE_LABELS[user.role] || 'Team Member'}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={cn('text-xs capitalize', statusColor)}>{user.status || 'active'}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatLastLogin(user.last_sign_in_at)}</td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openChangeRole(user)}>
                            <Shield className="w-4 h-4 mr-2" />Change Role
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.status === 'active' ? (
                            <DropdownMenuItem onClick={() => deactivateMutation.mutate(user.id)}>
                              <UserMinus className="w-4 h-4 mr-2" />Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => activateMutation.mutate(user.id)}>
                              <UserPlus className="w-4 h-4 mr-2" />Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => resetPasswordMutation.mutate(user.id)}>
                            <RefreshCw className="w-4 h-4 mr-2" />Reset Password
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!isLoading && filteredUsers.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-400">No users match your filters</div>
        )}
      </div>

      {/* Invite User Modal */}
      <InviteUserModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={() => {
          setShowInviteModal(false);
          queryClient.invalidateQueries({ queryKey: ['admin-users'] });
          queryClient.invalidateQueries({ queryKey: ['admin-user-stats'] });
        }}
      />

      {/* Change Role Dialog */}
      <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Change Role — {selectedUser?.full_name || selectedUser?.email}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-4">
            {/* Left: Roles */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Select Role</h4>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {Object.entries(ROLES).map(([key, value]) => (
                  <button
                    key={value}
                    onClick={() => { setSelectedRole(value); setSelectedTemplate(null); }}
                    className={cn(
                      'w-full text-left p-3 border rounded-lg transition-all',
                      selectedRole === value ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' : 'hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{ROLE_LABELS[value]}</span>
                      <Badge variant="outline" className="text-xs">{roleCounts[value]} users</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{ROLE_DESCRIPTIONS[value]}</p>
                  </button>
                ))}
              </div>
            </div>
            {/* Right: Templates */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Or Apply Template</h4>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {PERMISSION_TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTemplate(t); setSelectedRole(ROLES.TEAM_MEMBER); }}
                    className={cn(
                      'w-full text-left p-3 border rounded-lg transition-all',
                      selectedTemplate?.id === t.id ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' : 'hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{t.name}</span>
                      <Badge variant="outline" className="text-xs">{t.permissions.length} perms</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleModal(false)}>Cancel</Button>
            <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={handleSaveRole} disabled={changeRoleMutation.isPending}>
              {changeRoleMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================
// TEAMS TAB
// ============================================
function TeamsTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [newTeam, setNewTeam] = useState({ name: '', description: '', color: TEAM_COLORS?.[0] || '#047857' });

  const { data: teamsResult, isLoading } = useQuery({
    queryKey: ['admin-teams'],
    queryFn: () => getTeams(),
  });
  const { data: usersResult } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => getUsers(),
  });

  const teams = teamsResult?.data || [];
  const allUsers = usersResult?.data || [];

  const createMutation = useMutation({
    mutationFn: (data) => createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-teams'] });
      setShowCreateModal(false);
      setNewTeam({ name: '', description: '', color: TEAM_COLORS?.[0] || '#047857' });
      toast({ title: 'Team created' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (teamId) => deleteTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-teams'] });
      toast({ title: 'Team deleted' });
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: ({ teamId, userId, role }) => addTeamMember(teamId, userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-teams'] }),
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ teamId, userId }) => removeTeamMember(teamId, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-teams'] }),
  });

  const roleChangeMutation = useMutation({
    mutationFn: ({ teamId, userId, role }) => updateTeamMemberRole(teamId, userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-teams'] }),
  });

  const [addMemberUserId, setAddMemberUserId] = useState('');

  const presetColors = ['#047857', '#2563eb', '#7c3aed', '#dc2626', '#d97706', '#0d9488', '#4f46e5', '#ec4899'];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{teams.length} team{teams.length !== 1 ? 's' : ''}</p>
        <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />Create Team
        </Button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {teams.map(team => {
            const members = team.members || team.team_members || [];
            return (
              <div key={team.id} className="bg-white border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: team.color || '#047857' }} />
                  <h3 className="font-semibold text-sm flex-1">{team.name}</h3>
                  <Badge variant="outline" className="text-xs">{members.length} members</Badge>
                </div>
                {team.description && <p className="text-xs text-gray-500 mb-3">{team.description}</p>}
                {/* Member avatars */}
                <div className="flex items-center gap-1 mb-3">
                  {members.slice(0, 5).map((m, i) => {
                    const name = m.user?.full_name || m.full_name || m.email || '';
                    return (
                      <div key={i} className={cn('w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-medium', getAvatarColor(name))} title={name}>
                        {getInitials(name)}
                      </div>
                    );
                  })}
                  {members.length > 5 && (
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-600 font-medium">
                      +{members.length - 5}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => { setSelectedTeam(team); setShowMembersModal(true); }}>
                    Manage Members
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs text-red-600 hover:text-red-700" onClick={() => deleteMutation.mutate(team.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {teams.length === 0 && !isLoading && (
        <div className="p-8 text-center text-sm text-gray-400">No teams yet. Create your first team to get started.</div>
      )}

      {/* Create Team Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Team</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Team Name *</Label>
              <Input className="mt-1" value={newTeam.name} onChange={e => setNewTeam(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Construction Crew" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea className="mt-1" value={newTeam.description} onChange={e => setNewTeam(p => ({ ...p, description: e.target.value }))} rows={2} />
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex gap-2 mt-2">
                {presetColors.map(c => (
                  <button key={c} onClick={() => setNewTeam(p => ({ ...p, color: c }))}
                    className={cn('w-8 h-8 rounded-full border-2 transition-all', newTeam.color === c ? 'border-gray-900 scale-110' : 'border-transparent')}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => createMutation.mutate(newTeam)} disabled={!newTeam.name.trim() || createMutation.isPending}>
              Create Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Members Modal */}
      <Dialog open={showMembersModal} onOpenChange={setShowMembersModal}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedTeam?.color || '#047857' }} />
              {selectedTeam?.name} — Members
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {(selectedTeam?.members || selectedTeam?.team_members || []).map((m, i) => {
              const name = m.user?.full_name || m.full_name || m.email || '';
              return (
                <div key={i} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium', getAvatarColor(name))}>
                    {getInitials(name)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs text-gray-500">{m.user?.email || m.email || ''}</p>
                  </div>
                  <Select defaultValue={m.team_role || m.role || 'member'} onValueChange={val => roleChangeMutation.mutate({ teamId: selectedTeam.id, userId: m.user_id || m.user?.id, role: val })}>
                    <SelectTrigger className="w-[100px] h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    onClick={() => removeMemberMutation.mutate({ teamId: selectedTeam.id, userId: m.user_id || m.user?.id })}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
          {/* Add member */}
          <div className="border-t pt-3">
            <Label className="text-xs">Add Member</Label>
            <div className="flex gap-2 mt-1">
              <Select value={addMemberUserId} onValueChange={setAddMemberUserId}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Select user..." /></SelectTrigger>
                <SelectContent>
                  {allUsers.filter(u => {
                    const members = selectedTeam?.members || selectedTeam?.team_members || [];
                    return !members.some(m => (m.user_id || m.user?.id) === u.id);
                  }).map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800" disabled={!addMemberUserId}
                onClick={() => { addMemberMutation.mutate({ teamId: selectedTeam.id, userId: addMemberUserId, role: 'member' }); setAddMemberUserId(''); }}>
                Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================
// ROLES TAB
// ============================================
function RolesTab() {
  const [expandedRole, setExpandedRole] = useState(null);

  const { data: usersResult } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => getUsers(),
  });
  const users = usersResult?.data || [];

  const roleCounts = useMemo(() => {
    const counts = {};
    Object.values(ROLES).forEach(r => { counts[r] = 0; });
    users.forEach(u => { if (u.role && counts[u.role] !== undefined) counts[u.role]++; });
    return counts;
  }, [users]);

  return (
    <div className="space-y-6">
      {/* Built-in Roles */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Built-in Roles</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(ROLES).map(([key, value]) => {
            const isExpanded = expandedRole === value;
            const rolePerms = ROLE_PERMISSIONS[value] || [];
            return (
              <div key={value} className={cn('bg-white border rounded-lg overflow-hidden border-l-4', ROLE_BORDER_COLORS[value] || 'border-l-gray-400')}>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-sm">{ROLE_LABELS[value]}</h4>
                    <Badge variant="outline" className="text-xs">{roleCounts[value]} users</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{ROLE_DESCRIPTIONS[value]}</p>
                  <button onClick={() => setExpandedRole(isExpanded ? null : value)}
                    className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    {isExpanded ? 'Hide' : 'View'} Permissions ({rolePerms.length})
                  </button>
                </div>
                {isExpanded && (
                  <div className="border-t bg-gray-50 p-4 space-y-2">
                    {PERMISSION_GROUPS.map(group => {
                      const groupPerms = group.permissions.filter(p => rolePerms.includes(p.id));
                      if (groupPerms.length === 0) return null;
                      return (
                        <div key={group.name}>
                          <p className="text-xs font-semibold text-gray-600 mb-1">{group.name}</p>
                          <div className="flex flex-wrap gap-1">
                            {groupPerms.map(p => (
                              <span key={p.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px]">
                                <Check className="w-3 h-3" />{p.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Permission Templates */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Permission Templates</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {PERMISSION_TEMPLATES.map(t => (
            <div key={t.id} className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-sm">{t.name}</h4>
                <Badge variant="outline" className="text-xs">{t.permissions.length} permissions</Badge>
              </div>
              <p className="text-xs text-gray-500">{t.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// PERMISSIONS TAB
// ============================================
function PermissionsTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [customPerms, setCustomPerms] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: usersResult } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => getUsers(),
  });
  const users = usersResult?.data || [];

  const selectedUser = users.find(u => u.id === selectedUserId) || users[0];
  const userRole = selectedUser?.role || ROLES.TEAM_MEMBER;
  const basePerms = ROLE_PERMISSIONS[userRole] || [];

  // Initialize custom perms when user changes
  React.useEffect(() => {
    if (selectedUser) {
      setSelectedUserId(selectedUser.id);
      setCustomPerms(selectedUser.custom_permissions || []);
      setHasChanges(false);
    }
  }, [selectedUser?.id]);

  const saveMutation = useMutation({
    mutationFn: ({ userId, role, perms }) => setUserRole(userId, role, perms),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setHasChanges(false);
      toast({ title: 'Permissions saved successfully' });
    },
  });

  const toggleCustomPerm = (permId) => {
    if (basePerms.includes(permId)) return; // Can't toggle base role perms
    setCustomPerms(prev => {
      const next = prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId];
      setHasChanges(true);
      return next;
    });
  };

  const resetToDefaults = () => {
    setCustomPerms([]);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!selectedUser) return;
    saveMutation.mutate({ userId: selectedUser.id, role: userRole, perms: customPerms });
  };

  const allUserPerms = [...new Set([...basePerms, ...customPerms])];

  return (
    <div className="space-y-4">
      {/* User Selector */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label className="text-xs text-gray-500">Select User</Label>
            <Select value={selectedUserId || selectedUser?.id || ''} onValueChange={setSelectedUserId}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Choose a user..." /></SelectTrigger>
              <SelectContent>
                {users.map(u => (
                  <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedUser && (
            <div className="flex items-center gap-3 pt-4">
              <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium', getAvatarColor(selectedUser.full_name))}>
                {getInitials(selectedUser.full_name || selectedUser.email)}
              </div>
              <div>
                <p className="font-medium text-sm">{selectedUser.full_name || 'Unnamed'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge className={cn('text-xs', ROLE_COLORS[userRole])}>{ROLE_LABELS[userRole]}</Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Permission Grid */}
      {selectedUser && (
        <div className="bg-white border rounded-lg overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-[200px]">Module</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase" colSpan={10}>Permissions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {PERMISSION_GROUPS.map(group => (
                <tr key={group.name} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{group.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-3">
                      {group.permissions.map(perm => {
                        const isBase = basePerms.includes(perm.id);
                        const isCustom = customPerms.includes(perm.id) && !isBase;
                        const isGranted = isBase || isCustom;

                        return (
                          <button
                            key={perm.id}
                            onClick={() => toggleCustomPerm(perm.id)}
                            disabled={isBase}
                            className={cn(
                              'flex items-center gap-1.5 px-2 py-1 rounded border text-xs transition-all',
                              isBase && 'bg-blue-50 border-blue-200 text-blue-700 cursor-default',
                              isCustom && 'bg-green-50 border-green-300 text-green-700',
                              !isGranted && 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600',
                            )}
                            title={isBase ? `From ${ROLE_LABELS[userRole]} role` : perm.description}
                          >
                            {isBase && <Lock className="w-3 h-3" />}
                            {isCustom && <Check className="w-3 h-3" />}
                            {!isGranted && <div className="w-3 h-3 rounded border border-gray-300" />}
                            {perm.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary & Actions */}
      {selectedUser && (
        <div className="bg-white border rounded-lg p-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Base role: <span className="font-medium">{ROLE_LABELS[userRole]}</span> ({basePerms.length} permissions)
            {customPerms.length > 0 && <span className="text-green-600"> + {customPerms.length} custom</span>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetToDefaults} disabled={customPerms.length === 0}>
              Reset to Defaults
            </Button>
            <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800" onClick={handleSave}
              disabled={!hasChanges || saveMutation.isPending}>
              {saveMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Permissions'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// AUDIT LOG TAB
// ============================================
function AuditLogTab() {
  const [actionFilter, setActionFilter] = useState('all');

  const { data: logsResult, isLoading } = useQuery({
    queryKey: ['admin-audit-log', { limit: 100 }],
    queryFn: () => getPermissionAuditLog({ limit: 100 }),
  });

  const logs = logsResult?.data || [];

  const ACTION_BADGES = {
    role_changed: 'bg-blue-100 text-blue-700',
    permission_added: 'bg-green-100 text-green-700',
    permission_removed: 'bg-red-100 text-red-700',
    user_invited: 'bg-purple-100 text-purple-700',
    user_deactivated: 'bg-gray-100 text-gray-700',
    template_applied: 'bg-amber-100 text-amber-700',
  };

  const filteredLogs = actionFilter === 'all' ? logs : logs.filter(l => l.action === actionFilter);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Actions" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="role_changed">Role Changed</SelectItem>
            <SelectItem value="permission_added">Permission Added</SelectItem>
            <SelectItem value="permission_removed">Permission Removed</SelectItem>
            <SelectItem value="user_invited">User Invited</SelectItem>
            <SelectItem value="user_deactivated">User Deactivated</SelectItem>
            <SelectItem value="template_applied">Template Applied</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center">
            <ClipboardList className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">No permission changes recorded yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Target</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredLogs.map(log => {
                const actorName = log.actor?.raw_user_meta_data?.full_name || log.actor?.email || '—';
                const targetName = log.target?.raw_user_meta_data?.full_name || log.target?.email || '—';
                const actionColor = ACTION_BADGES[log.action] || 'bg-gray-100 text-gray-700';
                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 text-sm">{actorName}</td>
                    <td className="px-4 py-3 text-sm">{targetName}</td>
                    <td className="px-4 py-3">
                      <Badge className={cn('text-xs capitalize', actionColor)}>{log.action?.replace(/_/g, ' ')}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate">
                      {log.old_value && log.new_value ? `${log.old_value} → ${log.new_value}` : log.details?.summary || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ============================================
// MAIN SETTINGS HUB PAGE
// ============================================
const SettingsHubPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'users';

  const handleTabChange = (value) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full overflow-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Manage users, teams, roles, and permissions</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="bg-white border mb-6">
          <TabsTrigger value="users" className="flex items-center gap-1.5 text-sm">
            <Users className="w-4 h-4" />Users
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-1.5 text-sm">
            <Users2 className="w-4 h-4" />Teams
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-1.5 text-sm">
            <Shield className="w-4 h-4" />Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-1.5 text-sm">
            <Key className="w-4 h-4" />Permissions
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-1.5 text-sm">
            <ClipboardList className="w-4 h-4" />Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users"><UsersTab /></TabsContent>
        <TabsContent value="teams"><TeamsTab /></TabsContent>
        <TabsContent value="roles"><RolesTab /></TabsContent>
        <TabsContent value="permissions"><PermissionsTab /></TabsContent>
        <TabsContent value="audit"><AuditLogTab /></TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsHubPage;
