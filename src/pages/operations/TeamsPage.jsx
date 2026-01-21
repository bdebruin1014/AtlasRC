import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, MoreHorizontal, Edit2, UserPlus, ChevronDown, X, Trash2, RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  updateTeamMemberRole,
  getAvailableUsersForTeam,
  getTeamStats,
  getInitials,
  TEAM_COLORS,
  TEAM_ROLES,
} from '@/services/teamService';

const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, totalMembers: 0, avgMembersPerTeam: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTeam, setExpandedTeam] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);
  const [saving, setSaving] = useState(false);

  const [teamData, setTeamData] = useState({
    name: '',
    description: '',
    color: '#047857',
  });

  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Load teams
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [teamsData, statsData] = await Promise.all([
        getTeams(),
        getTeamStats(),
      ]);
      setTeams(teamsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  // Filter teams
  const filteredTeams = teams.filter(team => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      team.name.toLowerCase().includes(search) ||
      team.description?.toLowerCase().includes(search)
    );
  });

  // Load available users when opening add member modal
  const handleOpenAddMemberModal = async (team) => {
    setShowAddMemberModal(team);
    setSelectedUsers([]);
    setLoadingUsers(true);
    try {
      const users = await getAvailableUsersForTeam(team.id);
      setAvailableUsers(users);
    } catch (error) {
      console.error('Error loading available users:', error);
      setAvailableUsers([]);
    }
    setLoadingUsers(false);
  };

  const handleCreateTeam = () => {
    setEditingTeam(null);
    setTeamData({ name: '', description: '', color: '#047857' });
    setShowCreateModal(true);
  };

  const handleEditTeam = (team) => {
    setEditingTeam(team);
    setTeamData({
      name: team.name,
      description: team.description || '',
      color: team.color || '#047857',
    });
    setShowEditModal(true);
  };

  const handleSaveTeam = async () => {
    if (!teamData.name) return;

    setSaving(true);
    try {
      if (editingTeam) {
        const { error } = await updateTeam(editingTeam.id, teamData);
        if (error) throw error;
        setShowEditModal(false);
      } else {
        const { error } = await createTeam(teamData);
        if (error) throw error;
        setShowCreateModal(false);
      }
      loadData();
    } catch (error) {
      console.error('Error saving team:', error);
      alert('Error saving team: ' + (error.message || 'Unknown error'));
    }
    setSaving(false);
  };

  const handleDeleteTeam = async (teamId) => {
    if (!confirm('Are you sure you want to delete this team?')) return;

    try {
      const { error } = await deleteTeam(teamId);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Error deleting team');
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddMembers = async () => {
    if (!showAddMemberModal || selectedUsers.length === 0) return;

    setSaving(true);
    try {
      await Promise.all(
        selectedUsers.map(userId => addTeamMember(showAddMemberModal.id, userId, 'member'))
      );
      setShowAddMemberModal(null);
      setSelectedUsers([]);
      loadData();
    } catch (error) {
      console.error('Error adding members:', error);
      alert('Error adding members');
    }
    setSaving(false);
  };

  const handleRemoveMember = async (teamId, userId) => {
    if (!confirm('Remove this member from the team?')) return;

    try {
      const { error } = await removeTeamMember(teamId, userId);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Error removing member');
    }
  };

  const handleUpdateMemberRole = async (teamId, userId, newRole) => {
    try {
      const { error } = await updateTeamMemberRole(teamId, userId, newRole);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error updating member role:', error);
      alert('Error updating role');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Teams</h1>
          <p className="text-sm text-gray-500">Manage teams and team membership</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleCreateTeam}>
            <Plus className="w-4 h-4 mr-1" />New Team
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Teams</p>
          <p className="text-2xl font-semibold">{stats.total}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Active Teams</p>
          <p className="text-2xl font-semibold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Members</p>
          <p className="text-2xl font-semibold">{stats.totalMembers}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Avg per Team</p>
          <p className="text-2xl font-semibold">{stats.avgMembersPerTeam}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search teams..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No teams found</p>
          <Button variant="outline" className="mt-4" onClick={handleCreateTeam}>
            Create your first team
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTeams.map((team) => (
            <div key={team.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: team.color + '20' }}
                  >
                    <Users className="w-5 h-5" style={{ color: team.color }} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{team.name}</h3>
                    <p className="text-sm text-gray-500">{team.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {team.members?.slice(0, 4).map((member) => (
                      <div
                        key={member.id || member.user_id}
                        className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium"
                        title={member.full_name}
                      >
                        {member.avatar_url ? (
                          <img src={member.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                        ) : (
                          getInitials(member.full_name)
                        )}
                      </div>
                    ))}
                    {(team.members?.length || 0) > 4 && (
                      <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium">
                        +{team.members.length - 4}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{team.members?.length || 0} members</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditTeam(team); }}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Team
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenAddMemberModal(team); }}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Members
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); handleDeleteTeam(team.id); }}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <ChevronDown
                    className={cn("w-5 h-5 text-gray-400 transition-transform", expandedTeam === team.id && "rotate-180")}
                  />
                </div>
              </div>

              {expandedTeam === team.id && (
                <div className="border-t border-gray-200">
                  <div className="p-4 bg-gray-50 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Team Members</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenAddMemberModal(team); }}>
                        <UserPlus className="w-4 h-4 mr-1" />Add Member
                      </Button>
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleEditTeam(team); }}>
                        <Edit2 className="w-4 h-4 mr-1" />Edit Team
                      </Button>
                    </div>
                  </div>
                  {team.members?.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No members yet</p>
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => handleOpenAddMemberModal(team)}>
                        Add the first member
                      </Button>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50 border-y border-gray-200">
                        <tr>
                          <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Member</th>
                          <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Role</th>
                          <th className="w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {team.members?.map((member) => (
                          <tr key={member.id || member.user_id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                                  {member.avatar_url ? (
                                    <img src={member.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                                  ) : (
                                    getInitials(member.full_name)
                                  )}
                                </div>
                                <span className="font-medium text-gray-900">{member.full_name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{member.email}</td>
                            <td className="px-4 py-3">
                              <Select
                                value={member.team_role}
                                onValueChange={(value) => handleUpdateMemberRole(team.id, member.user_id, value)}
                              >
                                <SelectTrigger className="w-32 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {TEAM_ROLES.map((role) => (
                                    <SelectItem key={role.value} value={role.value}>
                                      {role.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                className="text-gray-400 hover:text-red-600"
                                onClick={() => handleRemoveMember(team.id, member.user_id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Team Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{editingTeam ? 'Edit Team' : 'Create New Team'}</h2>
              <button
                onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">Team Name *</Label>
                <Input
                  placeholder="e.g., Acquisitions"
                  value={teamData.name}
                  onChange={(e) => setTeamData({ ...teamData, name: e.target.value })}
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">Description</Label>
                <Input
                  placeholder="What does this team do?"
                  value={teamData.description}
                  onChange={(e) => setTeamData({ ...teamData, description: e.target.value })}
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">Color</Label>
                <div className="flex gap-2">
                  {TEAM_COLORS.map((c) => (
                    <button
                      key={c}
                      className={cn(
                        "w-8 h-8 rounded-full transition-transform",
                        teamData.color === c && "ring-2 ring-offset-2 ring-gray-400 scale-110"
                      )}
                      style={{ backgroundColor: c }}
                      onClick={() => setTeamData({ ...teamData, color: c })}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}>
                Cancel
              </Button>
              <Button
                className="bg-[#047857] hover:bg-[#065f46]"
                onClick={handleSaveTeam}
                disabled={!teamData.name || saving}
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingTeam ? 'Update Team' : 'Create Team'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Add Members to {showAddMemberModal.name}</h2>
              <button onClick={() => setShowAddMemberModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <Label className="block text-sm font-medium text-gray-700 mb-2">Select Users</Label>
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No available users to add</p>
                  <p className="text-xs mt-1">All users are already members of this team</p>
                </div>
              ) : (
                <div className="border rounded-md divide-y max-h-64 overflow-auto">
                  {availableUsers.map((user) => (
                    <button
                      key={user.id}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50",
                        selectedUsers.includes(user.id) && "bg-emerald-50"
                      )}
                      onClick={() => toggleUserSelection(user.id)}
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                        ) : (
                          getInitials(user.full_name)
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      {selectedUsers.includes(user.id) && (
                        <Check className="w-5 h-5 text-emerald-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
              {selectedUsers.length > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  {selectedUsers.length} user(s) selected
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setShowAddMemberModal(null)}>
                Cancel
              </Button>
              <Button
                className="bg-[#047857] hover:bg-[#065f46]"
                onClick={handleAddMembers}
                disabled={selectedUsers.length === 0 || saving}
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                    Adding...
                  </>
                ) : (
                  `Add ${selectedUsers.length} Member${selectedUsers.length !== 1 ? 's' : ''}`
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
