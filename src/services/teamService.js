// src/services/teamService.js
// Team Management Service with Supabase Integration

import { supabase, isDemoMode } from '@/lib/supabase';

// ============================================
// MOCK DATA (for demo mode)
// ============================================

const mockTeams = [
  {
    id: 'team-1',
    name: 'Development',
    description: 'Land development and entitlement team',
    color: '#047857',
    is_active: true,
    created_at: '2024-01-15T00:00:00Z',
    members: [
      { id: 'tm-1', user_id: 'user-1', team_role: 'lead', full_name: 'Bryan De Bruin', email: 'bryan@vanrock.com' },
      { id: 'tm-2', user_id: 'user-2', team_role: 'member', full_name: 'John Smith', email: 'john@vanrock.com' },
      { id: 'tm-3', user_id: 'user-3', team_role: 'member', full_name: 'Sarah Johnson', email: 'sarah@vanrock.com' },
    ],
  },
  {
    id: 'team-2',
    name: 'Construction',
    description: 'Construction management and oversight',
    color: '#2563eb',
    is_active: true,
    created_at: '2024-02-01T00:00:00Z',
    members: [
      { id: 'tm-4', user_id: 'user-4', team_role: 'lead', full_name: 'Mike Williams', email: 'mike@vanrock.com' },
      { id: 'tm-5', user_id: 'user-5', team_role: 'member', full_name: 'Emily Davis', email: 'emily@vanrock.com' },
    ],
  },
  {
    id: 'team-3',
    name: 'Finance',
    description: 'Accounting and investor relations',
    color: '#7c3aed',
    is_active: true,
    created_at: '2024-01-20T00:00:00Z',
    members: [
      { id: 'tm-6', user_id: 'user-3', team_role: 'lead', full_name: 'Sarah Johnson', email: 'sarah@vanrock.com' },
    ],
  },
  {
    id: 'team-4',
    name: 'Sales',
    description: 'Property sales and disposition',
    color: '#dc2626',
    is_active: true,
    created_at: '2024-03-01T00:00:00Z',
    members: [],
  },
];

const mockAvailableUsers = [
  { id: 'user-1', full_name: 'Bryan De Bruin', email: 'bryan@vanrock.com' },
  { id: 'user-2', full_name: 'John Smith', email: 'john@vanrock.com' },
  { id: 'user-3', full_name: 'Sarah Johnson', email: 'sarah@vanrock.com' },
  { id: 'user-4', full_name: 'Mike Williams', email: 'mike@vanrock.com' },
  { id: 'user-5', full_name: 'Emily Davis', email: 'emily@vanrock.com' },
  { id: 'user-6', full_name: 'Robert Brown', email: 'robert@vanrock.com' },
  { id: 'user-7', full_name: 'Lisa Anderson', email: 'lisa@vanrock.com' },
  { id: 'user-8', full_name: 'Jennifer Taylor', email: 'jen@vanrock.com' },
];

// ============================================
// TEAM CRUD OPERATIONS
// ============================================

export async function getTeams(filters = {}) {
  try {
    if (isDemoMode) {
      return filterMockTeams(filters);
    }

    let query = supabase
      .from('teams')
      .select(`
        *,
        members:team_members(
          id,
          user_id,
          team_role,
          joined_at,
          user:user_profiles(id, email, full_name, avatar_url)
        )
      `)
      .order('name');

    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    } else {
      query = query.eq('is_active', true);
    }

    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform the data to flatten member info
    const teams = (data || []).map(team => ({
      ...team,
      members: (team.members || []).map(m => ({
        id: m.id,
        user_id: m.user_id,
        team_role: m.team_role,
        joined_at: m.joined_at,
        full_name: m.user?.full_name,
        email: m.user?.email,
        avatar_url: m.user?.avatar_url,
      })),
    }));

    return teams;
  } catch (error) {
    console.error('Error fetching teams:', error);
    return filterMockTeams(filters);
  }
}

function filterMockTeams(filters) {
  let filtered = [...mockTeams];

  if (filters.isActive !== undefined) {
    filtered = filtered.filter(t => t.is_active === filters.isActive);
  }

  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(t =>
      t.name.toLowerCase().includes(search) ||
      t.description?.toLowerCase().includes(search)
    );
  }

  return filtered;
}

export async function getTeamById(teamId) {
  try {
    if (isDemoMode) {
      return mockTeams.find(t => t.id === teamId) || null;
    }

    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        members:team_members(
          id,
          user_id,
          team_role,
          joined_at,
          user:user_profiles(id, email, full_name, avatar_url)
        )
      `)
      .eq('id', teamId)
      .single();

    if (error) throw error;

    // Transform member data
    return {
      ...data,
      members: (data.members || []).map(m => ({
        id: m.id,
        user_id: m.user_id,
        team_role: m.team_role,
        joined_at: m.joined_at,
        full_name: m.user?.full_name,
        email: m.user?.email,
        avatar_url: m.user?.avatar_url,
      })),
    };
  } catch (error) {
    console.error('Error fetching team:', error);
    return mockTeams.find(t => t.id === teamId) || null;
  }
}

export async function createTeam(teamData) {
  try {
    if (isDemoMode) {
      const newTeam = {
        id: `team-${Date.now()}`,
        ...teamData,
        is_active: true,
        created_at: new Date().toISOString(),
        members: [],
      };
      mockTeams.push(newTeam);
      return { data: newTeam, error: null };
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('teams')
      .insert([{
        name: teamData.name,
        description: teamData.description,
        color: teamData.color || '#047857',
        created_by: user?.id,
      }])
      .select()
      .single();

    if (error) throw error;

    return { data: { ...data, members: [] }, error: null };
  } catch (error) {
    console.error('Error creating team:', error);
    return { data: null, error };
  }
}

export async function updateTeam(teamId, updates) {
  try {
    if (isDemoMode) {
      const idx = mockTeams.findIndex(t => t.id === teamId);
      if (idx >= 0) {
        mockTeams[idx] = { ...mockTeams[idx], ...updates };
        return { data: mockTeams[idx], error: null };
      }
      return { data: null, error: { message: 'Team not found' } };
    }

    const { data, error } = await supabase
      .from('teams')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', teamId)
      .select()
      .single();

    if (error) throw error;

    // Fetch full team with members
    const team = await getTeamById(teamId);
    return { data: team, error: null };
  } catch (error) {
    console.error('Error updating team:', error);
    return { data: null, error };
  }
}

export async function deleteTeam(teamId) {
  try {
    if (isDemoMode) {
      const idx = mockTeams.findIndex(t => t.id === teamId);
      if (idx >= 0) {
        mockTeams[idx].is_active = false;
        return { success: true, error: null };
      }
      return { success: false, error: { message: 'Team not found' } };
    }

    // Soft delete
    const { error } = await supabase
      .from('teams')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', teamId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting team:', error);
    return { success: false, error };
  }
}

export async function hardDeleteTeam(teamId) {
  try {
    if (isDemoMode) {
      const idx = mockTeams.findIndex(t => t.id === teamId);
      if (idx >= 0) {
        mockTeams.splice(idx, 1);
        return { success: true, error: null };
      }
      return { success: false, error: { message: 'Team not found' } };
    }

    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error hard deleting team:', error);
    return { success: false, error };
  }
}

// ============================================
// TEAM MEMBER OPERATIONS
// ============================================

export async function addTeamMember(teamId, userId, teamRole = 'member') {
  try {
    if (isDemoMode) {
      const team = mockTeams.find(t => t.id === teamId);
      const user = mockAvailableUsers.find(u => u.id === userId);
      if (team && user) {
        const newMember = {
          id: `tm-${Date.now()}`,
          user_id: userId,
          team_role: teamRole,
          full_name: user.full_name,
          email: user.email,
          joined_at: new Date().toISOString(),
        };
        team.members.push(newMember);
        return { data: newMember, error: null };
      }
      return { data: null, error: { message: 'Team or user not found' } };
    }

    const { data, error } = await supabase
      .from('team_members')
      .insert([{
        team_id: teamId,
        user_id: userId,
        team_role: teamRole,
      }])
      .select(`
        *,
        user:user_profiles(id, email, full_name, avatar_url)
      `)
      .single();

    if (error) throw error;

    return {
      data: {
        id: data.id,
        user_id: data.user_id,
        team_role: data.team_role,
        joined_at: data.joined_at,
        full_name: data.user?.full_name,
        email: data.user?.email,
        avatar_url: data.user?.avatar_url,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error adding team member:', error);
    return { data: null, error };
  }
}

export async function removeTeamMember(teamId, userId) {
  try {
    if (isDemoMode) {
      const team = mockTeams.find(t => t.id === teamId);
      if (team) {
        const idx = team.members.findIndex(m => m.user_id === userId);
        if (idx >= 0) {
          team.members.splice(idx, 1);
          return { success: true, error: null };
        }
      }
      return { success: false, error: { message: 'Team member not found' } };
    }

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error removing team member:', error);
    return { success: false, error };
  }
}

export async function updateTeamMemberRole(teamId, userId, newRole) {
  try {
    if (isDemoMode) {
      const team = mockTeams.find(t => t.id === teamId);
      if (team) {
        const member = team.members.find(m => m.user_id === userId);
        if (member) {
          member.team_role = newRole;
          return { data: member, error: null };
        }
      }
      return { data: null, error: { message: 'Team member not found' } };
    }

    const { data, error } = await supabase
      .from('team_members')
      .update({ team_role: newRole })
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error updating team member role:', error);
    return { data: null, error };
  }
}

export async function getTeamMembers(teamId) {
  try {
    if (isDemoMode) {
      const team = mockTeams.find(t => t.id === teamId);
      return team?.members || [];
    }

    const { data, error } = await supabase
      .from('team_members_with_details')
      .select('*')
      .eq('team_id', teamId);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching team members:', error);
    const team = mockTeams.find(t => t.id === teamId);
    return team?.members || [];
  }
}

// ============================================
// USER TEAM ASSIGNMENTS
// ============================================

export async function getUserTeams(userId) {
  try {
    if (isDemoMode) {
      return mockTeams.filter(t =>
        t.members.some(m => m.user_id === userId)
      ).map(t => ({
        team_id: t.id,
        team_name: t.name,
        team_color: t.color,
        team_role: t.members.find(m => m.user_id === userId)?.team_role,
      }));
    }

    const { data, error } = await supabase
      .from('team_members')
      .select(`
        team_id,
        team_role,
        team:teams(id, name, color, description)
      `)
      .eq('user_id', userId);

    if (error) throw error;

    return (data || []).map(d => ({
      team_id: d.team_id,
      team_name: d.team?.name,
      team_color: d.team?.color,
      team_role: d.team_role,
    }));
  } catch (error) {
    console.error('Error fetching user teams:', error);
    return [];
  }
}

export async function getAvailableUsersForTeam(teamId) {
  try {
    if (isDemoMode) {
      const team = mockTeams.find(t => t.id === teamId);
      const existingUserIds = team?.members.map(m => m.user_id) || [];
      return mockAvailableUsers.filter(u => !existingUserIds.includes(u.id));
    }

    // Get users not already in this team
    const { data: teamMembers } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('team_id', teamId);

    const existingUserIds = (teamMembers || []).map(m => m.user_id);

    let query = supabase
      .from('user_profiles')
      .select('id, email, full_name, avatar_url')
      .eq('status', 'active')
      .order('full_name');

    if (existingUserIds.length > 0) {
      query = query.not('id', 'in', `(${existingUserIds.join(',')})`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching available users:', error);
    const team = mockTeams.find(t => t.id === teamId);
    const existingUserIds = team?.members.map(m => m.user_id) || [];
    return mockAvailableUsers.filter(u => !existingUserIds.includes(u.id));
  }
}

// ============================================
// PROJECT TEAM ASSIGNMENTS
// ============================================

export async function assignTeamToProject(projectId, teamId) {
  try {
    if (isDemoMode) {
      return { success: true, error: null };
    }

    // Get all team members and add them to the project
    const team = await getTeamById(teamId);
    if (!team) {
      return { success: false, error: { message: 'Team not found' } };
    }

    const insertData = team.members.map(member => ({
      project_id: projectId,
      user_id: member.user_id,
      project_role: member.team_role === 'lead' ? 'manager' : 'member',
    }));

    const { error } = await supabase
      .from('project_team_members')
      .upsert(insertData, { onConflict: 'project_id,user_id' });

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error assigning team to project:', error);
    return { success: false, error };
  }
}

export async function assignTeamToOpportunity(opportunityId, teamId) {
  try {
    if (isDemoMode) {
      return { success: true, error: null };
    }

    // Get all team members and add them to the opportunity
    const team = await getTeamById(teamId);
    if (!team) {
      return { success: false, error: { message: 'Team not found' } };
    }

    const insertData = team.members.map(member => ({
      opportunity_id: opportunityId,
      user_id: member.user_id,
      team_id: teamId,
      role: member.team_role,
    }));

    const { error } = await supabase
      .from('opportunity_team_members')
      .upsert(insertData, { onConflict: 'opportunity_id,user_id' });

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error assigning team to opportunity:', error);
    return { success: false, error };
  }
}

// ============================================
// TEAM STATISTICS
// ============================================

export async function getTeamStats() {
  try {
    if (isDemoMode) {
      return {
        total: mockTeams.length,
        active: mockTeams.filter(t => t.is_active).length,
        totalMembers: mockTeams.reduce((sum, t) => sum + t.members.length, 0),
        avgMembersPerTeam: mockTeams.length > 0
          ? Math.round(mockTeams.reduce((sum, t) => sum + t.members.length, 0) / mockTeams.length * 10) / 10
          : 0,
      };
    }

    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, is_active');

    if (teamsError) throw teamsError;

    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select('team_id');

    if (membersError) throw membersError;

    const activeTeams = teams.filter(t => t.is_active).length;

    return {
      total: teams.length,
      active: activeTeams,
      totalMembers: members.length,
      avgMembersPerTeam: activeTeams > 0 ? Math.round(members.length / activeTeams * 10) / 10 : 0,
    };
  } catch (error) {
    console.error('Error getting team stats:', error);
    return { total: 0, active: 0, totalMembers: 0, avgMembersPerTeam: 0 };
  }
}

// ============================================
// HELPERS
// ============================================

export function getInitials(name) {
  if (!name) return '??';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const TEAM_COLORS = [
  '#047857', // Emerald
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#dc2626', // Red
  '#ea580c', // Orange
  '#0891b2', // Cyan
  '#4f46e5', // Indigo
  '#be185d', // Pink
];

export const TEAM_ROLES = [
  { value: 'lead', label: 'Team Lead' },
  { value: 'member', label: 'Member' },
];

// ============================================
// EXPORTS
// ============================================

export default {
  // Teams
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  hardDeleteTeam,

  // Team members
  addTeamMember,
  removeTeamMember,
  updateTeamMemberRole,
  getTeamMembers,

  // User teams
  getUserTeams,
  getAvailableUsersForTeam,

  // Project/Opportunity assignments
  assignTeamToProject,
  assignTeamToOpportunity,

  // Stats
  getTeamStats,

  // Helpers
  getInitials,
  TEAM_COLORS,
  TEAM_ROLES,
};
