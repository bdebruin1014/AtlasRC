// src/services/userService.js
// User Management Service with Supabase Integration

import { supabase, isDemoMode } from '@/lib/supabase';
import { ROLES, ROLE_LABELS, setUserRole, logPermissionChange } from './permissionService';
import { upsertTeamMember, deleteTeamMember } from './chatService';

// ============================================
// MOCK DATA (for demo mode)
// ============================================

const mockUsers = [
  {
    id: 'user-1',
    email: 'bryan@vanrock.com',
    full_name: 'Bryan De Bruin',
    phone: '(864) 555-0100',
    job_title: 'CEO',
    department: 'Executive',
    status: 'active',
    role: 'super_admin',
    custom_permissions: [],
    created_at: '2024-01-15T00:00:00Z',
    last_login_at: '2026-01-20T08:30:00Z',
  },
  {
    id: 'user-2',
    email: 'john@vanrock.com',
    full_name: 'John Smith',
    phone: '(864) 555-0101',
    job_title: 'Project Manager',
    department: 'Development',
    status: 'active',
    role: 'project_manager',
    custom_permissions: [],
    created_at: '2024-02-20T00:00:00Z',
    last_login_at: '2026-01-19T14:22:00Z',
  },
  {
    id: 'user-3',
    email: 'sarah@vanrock.com',
    full_name: 'Sarah Johnson',
    phone: '(864) 555-0102',
    job_title: 'Accountant',
    department: 'Finance',
    status: 'active',
    role: 'accountant',
    custom_permissions: [],
    created_at: '2024-01-10T00:00:00Z',
    last_login_at: '2026-01-20T09:15:00Z',
  },
  {
    id: 'user-4',
    email: 'mike@vanrock.com',
    full_name: 'Mike Williams',
    phone: '(864) 555-0103',
    job_title: 'Construction Manager',
    department: 'Construction',
    status: 'active',
    role: 'manager',
    custom_permissions: [],
    created_at: '2024-03-05T00:00:00Z',
    last_login_at: '2026-01-18T11:45:00Z',
  },
  {
    id: 'user-5',
    email: 'emily@vanrock.com',
    full_name: 'Emily Davis',
    phone: '(864) 555-0104',
    job_title: 'Site Manager',
    department: 'Construction',
    status: 'inactive',
    role: 'team_member',
    custom_permissions: [],
    created_at: '2024-04-12T00:00:00Z',
    last_login_at: '2025-12-01T16:30:00Z',
  },
];

// ============================================
// USER CRUD OPERATIONS
// ============================================

export async function getUsers(filters = {}) {
  try {
    if (isDemoMode) {
      return filterMockUsers(filters);
    }

    // Use the view that joins profiles with roles
    let query = supabase
      .from('users_with_roles')
      .select('*')
      .order('full_name');

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.role) {
      query = query.eq('role', filters.role);
    }

    if (filters.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    // Fallback to mock data
    return filterMockUsers(filters);
  }
}

function filterMockUsers(filters) {
  let filtered = [...mockUsers];

  if (filters.status) {
    filtered = filtered.filter(u => u.status === filters.status);
  }

  if (filters.role) {
    filtered = filtered.filter(u => u.role === filters.role);
  }

  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(u =>
      u.full_name?.toLowerCase().includes(search) ||
      u.email?.toLowerCase().includes(search)
    );
  }

  return filtered;
}

export async function getUserById(userId) {
  try {
    if (isDemoMode) {
      return mockUsers.find(u => u.id === userId) || null;
    }

    const { data, error } = await supabase
      .from('users_with_roles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    return mockUsers.find(u => u.id === userId) || null;
  }
}

export async function createUser(userData) {
  try {
    if (isDemoMode) {
      const newUser = {
        id: `user-${Date.now()}`,
        ...userData,
        status: 'active',
        created_at: new Date().toISOString(),
        last_login_at: null,
      };
      mockUsers.push(newUser);

      // Sync to team_members for chat
      await upsertTeamMember({
        userId: newUser.id,
        displayName: newUser.full_name,
        email: newUser.email,
        avatarUrl: newUser.avatar_url,
        role: newUser.role === 'super_admin' || newUser.role === 'admin' ? 'admin' : 'member'
      });

      return { data: newUser, error: null };
    }

    // Create the user in Supabase Auth
    // Note: In production, you'd use the admin API or invite system
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password || generateTempPassword(),
      email_confirm: true,
      user_metadata: {
        full_name: userData.full_name,
      },
    });

    if (authError) {
      // If admin API is not available, try invite
      const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(userData.email, {
        data: { full_name: userData.full_name },
      });

      if (inviteError) throw inviteError;

      // Update profile with additional info
      if (inviteData?.user?.id) {
        await updateUserProfile(inviteData.user.id, {
          phone: userData.phone,
          job_title: userData.job_title,
          department: userData.department,
        });

        // Set role
        if (userData.role) {
          await setUserRole(inviteData.user.id, userData.role, userData.custom_permissions || []);
        }

        // Sync to team_members for chat
        await upsertTeamMember({
          userId: inviteData.user.id,
          displayName: userData.full_name,
          email: userData.email,
          avatarUrl: null,
          role: userData.role === 'super_admin' || userData.role === 'admin' ? 'admin' : 'member'
        });
      }

      return { data: inviteData?.user, error: null };
    }

    // Update profile with additional info
    if (authData?.user?.id) {
      await updateUserProfile(authData.user.id, {
        phone: userData.phone,
        job_title: userData.job_title,
        department: userData.department,
      });

      // Set role
      if (userData.role) {
        await setUserRole(authData.user.id, userData.role, userData.custom_permissions || []);
      }

      // Sync to team_members for chat
      await upsertTeamMember({
        userId: authData.user.id,
        displayName: userData.full_name,
        email: userData.email,
        avatarUrl: null,
        role: userData.role === 'super_admin' || userData.role === 'admin' ? 'admin' : 'member'
      });

      // Log the action
      await logPermissionChange({
        targetUserId: authData.user.id,
        action: 'user_created',
        oldValue: null,
        newValue: { email: userData.email, role: userData.role },
      });
    }

    return { data: authData?.user, error: null };
  } catch (error) {
    console.error('Error creating user:', error);
    return { data: null, error };
  }
}

export async function updateUser(userId, updates) {
  try {
    if (isDemoMode) {
      const idx = mockUsers.findIndex(u => u.id === userId);
      if (idx >= 0) {
        mockUsers[idx] = { ...mockUsers[idx], ...updates };

        // Sync to team_members for chat
        if (updates.full_name || updates.avatar_url || updates.role) {
          await upsertTeamMember({
            userId: userId,
            displayName: mockUsers[idx].full_name,
            email: mockUsers[idx].email,
            avatarUrl: mockUsers[idx].avatar_url,
            role: mockUsers[idx].role === 'super_admin' || mockUsers[idx].role === 'admin' ? 'admin' : 'member'
          });
        }

        return { data: mockUsers[idx], error: null };
      }
      return { data: null, error: { message: 'User not found' } };
    }

    // Update profile
    const profileUpdates = {};
    if (updates.full_name !== undefined) profileUpdates.full_name = updates.full_name;
    if (updates.phone !== undefined) profileUpdates.phone = updates.phone;
    if (updates.job_title !== undefined) profileUpdates.job_title = updates.job_title;
    if (updates.department !== undefined) profileUpdates.department = updates.department;
    if (updates.status !== undefined) profileUpdates.status = updates.status;
    if (updates.avatar_url !== undefined) profileUpdates.avatar_url = updates.avatar_url;

    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ ...profileUpdates, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (profileError) throw profileError;
    }

    // Update role if provided
    if (updates.role) {
      await setUserRole(userId, updates.role, updates.custom_permissions || []);
    }

    // Fetch updated user
    const updatedUser = await getUserById(userId);

    // Sync to team_members for chat (if name, avatar, or role changed)
    if (updatedUser && (updates.full_name || updates.avatar_url || updates.role)) {
      await upsertTeamMember({
        userId: userId,
        displayName: updatedUser.full_name,
        email: updatedUser.email,
        avatarUrl: updatedUser.avatar_url,
        role: updatedUser.role === 'super_admin' || updatedUser.role === 'admin' ? 'admin' : 'member'
      });
    }

    // Log the action
    await logPermissionChange({
      targetUserId: userId,
      action: 'user_updated',
      oldValue: null,
      newValue: updates,
    });

    return { data: updatedUser, error: null };
  } catch (error) {
    console.error('Error updating user:', error);
    return { data: null, error };
  }
}

export async function updateUserProfile(userId, profileData) {
  try {
    if (isDemoMode) {
      const idx = mockUsers.findIndex(u => u.id === userId);
      if (idx >= 0) {
        mockUsers[idx] = { ...mockUsers[idx], ...profileData };
        return { data: mockUsers[idx], error: null };
      }
      return { data: null, error: null };
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ ...profileData, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { data: null, error };
  }
}

export async function deleteUser(userId) {
  try {
    if (isDemoMode) {
      const idx = mockUsers.findIndex(u => u.id === userId);
      if (idx >= 0) {
        mockUsers.splice(idx, 1);
        // Also remove from team_members
        await deleteTeamMember(userId);
        return { success: true, error: null };
      }
      return { success: false, error: { message: 'User not found' } };
    }

    // Soft delete: set status to inactive
    const { error } = await supabase
      .from('user_profiles')
      .update({ status: 'inactive', updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw error;

    // Also remove from team_members (so they don't appear in chat)
    await deleteTeamMember(userId);

    // Log the action
    await logPermissionChange({
      targetUserId: userId,
      action: 'user_deleted',
      oldValue: null,
      newValue: { status: 'inactive' },
    });

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error };
  }
}

export async function hardDeleteUser(userId) {
  try {
    if (isDemoMode) {
      const idx = mockUsers.findIndex(u => u.id === userId);
      if (idx >= 0) {
        mockUsers.splice(idx, 1);
        // Also remove from team_members
        await deleteTeamMember(userId);
        return { success: true, error: null };
      }
      return { success: false, error: { message: 'User not found' } };
    }

    // Remove from team_members first
    await deleteTeamMember(userId);

    // Delete from auth (this will cascade to profiles via FK)
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error hard deleting user:', error);
    return { success: false, error };
  }
}

// ============================================
// USER STATUS MANAGEMENT
// ============================================

export async function activateUser(userId) {
  return updateUser(userId, { status: 'active' });
}

export async function deactivateUser(userId) {
  return updateUser(userId, { status: 'inactive' });
}

export async function toggleUserStatus(userId) {
  try {
    const user = await getUserById(userId);
    if (!user) {
      return { data: null, error: { message: 'User not found' } };
    }

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    return updateUser(userId, { status: newStatus });
  } catch (error) {
    console.error('Error toggling user status:', error);
    return { data: null, error };
  }
}

// ============================================
// PASSWORD MANAGEMENT
// ============================================

export async function resetUserPassword(userId) {
  try {
    if (isDemoMode) {
      return { success: true, error: null };
    }

    const user = await getUserById(userId);
    if (!user?.email) {
      return { success: false, error: { message: 'User not found' } };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { success: false, error };
  }
}

export async function inviteUser(email, userData = {}) {
  try {
    if (isDemoMode) {
      const newUser = {
        id: `user-${Date.now()}`,
        email,
        full_name: userData.full_name || email.split('@')[0],
        status: 'pending',
        role: userData.role || 'team_member',
        created_at: new Date().toISOString(),
        ...userData,
      };
      mockUsers.push(newUser);

      // Sync to team_members for chat
      await upsertTeamMember({
        userId: newUser.id,
        displayName: newUser.full_name,
        email: newUser.email,
        avatarUrl: null,
        role: newUser.role === 'super_admin' || newUser.role === 'admin' ? 'admin' : 'member'
      });

      return { data: newUser, error: null };
    }

    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: userData.full_name,
      },
    });

    if (error) throw error;

    // Set role after invite
    if (data?.user?.id && userData.role) {
      await setUserRole(data.user.id, userData.role);
    }

    // Sync to team_members for chat
    if (data?.user?.id) {
      await upsertTeamMember({
        userId: data.user.id,
        displayName: userData.full_name || email.split('@')[0],
        email: email,
        avatarUrl: null,
        role: userData.role === 'super_admin' || userData.role === 'admin' ? 'admin' : 'member'
      });
    }

    return { data: data?.user, error: null };
  } catch (error) {
    console.error('Error inviting user:', error);
    return { data: null, error };
  }
}

// ============================================
// BULK OPERATIONS
// ============================================

export async function bulkUpdateUsers(userIds, updates) {
  const results = await Promise.all(
    userIds.map(id => updateUser(id, updates))
  );
  return results;
}

export async function bulkDeleteUsers(userIds) {
  const results = await Promise.all(
    userIds.map(id => deleteUser(id))
  );
  return results;
}

// ============================================
// USER STATISTICS
// ============================================

export async function getUserStats() {
  try {
    if (isDemoMode) {
      return {
        total: mockUsers.length,
        active: mockUsers.filter(u => u.status === 'active').length,
        inactive: mockUsers.filter(u => u.status === 'inactive').length,
        pending: mockUsers.filter(u => u.status === 'pending').length,
        byRole: Object.values(ROLES).reduce((acc, role) => {
          acc[role] = mockUsers.filter(u => u.role === role).length;
          return acc;
        }, {}),
      };
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('status, user_roles(role)');

    if (error) throw error;

    const stats = {
      total: data.length,
      active: data.filter(u => u.status === 'active').length,
      inactive: data.filter(u => u.status === 'inactive').length,
      pending: data.filter(u => u.status === 'pending').length,
      byRole: {},
    };

    // Count by role
    data.forEach(u => {
      const role = u.user_roles?.[0]?.role || 'team_member';
      stats.byRole[role] = (stats.byRole[role] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Error getting user stats:', error);
    return { total: 0, active: 0, inactive: 0, pending: 0, byRole: {} };
  }
}

// ============================================
// HELPERS
// ============================================

function generateTempPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export function getRoleLabel(role) {
  return ROLE_LABELS[role] || role;
}

export function getInitials(name) {
  if (!name) return '??';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function formatLastLogin(date) {
  if (!date) return 'Never';
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return d.toLocaleDateString();
}

// ============================================
// SYNC USERS TO TEAM MEMBERS (for chat)
// ============================================

/**
 * Sync all active users to the team_members table for chat
 * This is useful when initializing the chat system or after bulk user imports
 */
export async function syncUsersToChat() {
  try {
    const users = await getUsers({ status: 'active' });

    for (const user of users) {
      await upsertTeamMember({
        userId: user.id,
        displayName: user.full_name,
        email: user.email,
        avatarUrl: user.avatar_url,
        role: user.role === 'super_admin' || user.role === 'admin' ? 'admin' : 'member'
      });
    }

    return { success: true, synced: users.length, error: null };
  } catch (error) {
    console.error('Error syncing users to chat:', error);
    return { success: false, synced: 0, error };
  }
}

// ============================================
// EXPORTS
// ============================================

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserProfile,
  deleteUser,
  hardDeleteUser,
  activateUser,
  deactivateUser,
  toggleUserStatus,
  resetUserPassword,
  inviteUser,
  bulkUpdateUsers,
  bulkDeleteUsers,
  getUserStats,
  getRoleLabel,
  getInitials,
  formatLastLogin,
  syncUsersToChat,
};
