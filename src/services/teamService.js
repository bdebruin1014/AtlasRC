// src/services/teamService.js
// Team Management Service with Supabase Integration

import { supabase } from '@/lib/supabase';

// ============================================
// TEAM CRUD OPERATIONS
// ============================================

export async function getTeams(filters = {}) {
  try {
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
    return [];
  }
}

export async function getTeamById(teamId) {
  try {
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
    return null;
  }
}

export async function createTeam(teamData) {
  try {
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
    const { data, error } = await supabase
      .from('team_members_with_details')
      .select('*')
      .eq('team_id', teamId);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
}

// ============================================
// USER TEAM ASSIGNMENTS
// ============================================

export async function getUserTeams(userId) {
  try {
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
    return [];
  }
}

// ============================================
// PROJECT TEAM ASSIGNMENTS
// ============================================

export async function assignTeamToProject(projectId, teamId) {
  try {
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
