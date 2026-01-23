import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive' | 'pending';
  avatar_url?: string;
  phone?: string;
  department?: string;
  created_at: string;
  updated_at?: string;
  last_login?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  role?: 'admin' | 'manager' | 'user';
  phone?: string;
  department?: string;
}

export interface UpdateUserData {
  full_name?: string;
  role?: 'admin' | 'manager' | 'user';
  status?: 'active' | 'inactive';
  phone?: string;
  department?: string;
  avatar_url?: string;
}

/**
 * User Service - Handles user management operations
 */
export const userService = {
  /**
   * Get all users with optional filtering
   */
  async getAll(filters: {
    status?: 'active' | 'inactive' | 'pending';
    role?: string;
    search?: string;
  } = {}): Promise<User[]> {
    let query = supabase
      .from('profiles')
      .select('*');

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.role) {
      query = query.eq('role', filters.role);
    }
    if (filters.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  /**
   * Get a single user by ID
   */
  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Get user by email
   */
  async getByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Create a new user (invite)
   * This creates an auth user and profile
   */
  async create(userData: CreateUserData): Promise<User> {
    // Create auth user via admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        full_name: userData.full_name,
      },
    });

    if (authError) throw authError;

    // Create profile record
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id: authData.user.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role || 'user',
        status: 'active',
        phone: userData.phone,
        department: userData.department,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing user
   */
  async update(id: string, updates: UpdateUserData): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete (deactivate) a user
   */
  async delete(id: string): Promise<boolean> {
    // Soft delete by setting status to inactive
    const { error } = await supabase
      .from('profiles')
      .update({
        status: 'inactive',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  /**
   * Hard delete a user (admin only)
   */
  async hardDelete(id: string): Promise<boolean> {
    // Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    if (authError) throw authError;

    // Delete profile
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  /**
   * Toggle user status (activate/deactivate)
   */
  async toggleStatus(id: string): Promise<User> {
    const user = await this.getById(id);
    if (!user) throw new Error('User not found');

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    return this.update(id, { status: newStatus });
  },

  /**
   * Update user role
   */
  async updateRole(id: string, role: 'admin' | 'manager' | 'user'): Promise<User> {
    return this.update(id, { role });
  },

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  },

  /**
   * Update user's own profile
   */
  async updateProfile(updates: {
    full_name?: string;
    phone?: string;
    avatar_url?: string;
  }): Promise<User> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    return this.update(user.id, updates);
  },

  /**
   * Get user statistics
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    pending: number;
    byRole: Record<string, number>;
  }> {
    const { data, error } = await supabase
      .from('profiles')
      .select('status, role');

    if (error) throw error;

    const stats = {
      total: data.length,
      active: data.filter(u => u.status === 'active').length,
      inactive: data.filter(u => u.status === 'inactive').length,
      pending: data.filter(u => u.status === 'pending').length,
      byRole: {} as Record<string, number>,
    };

    data.forEach(u => {
      stats.byRole[u.role] = (stats.byRole[u.role] || 0) + 1;
    });

    return stats;
  },

  /**
   * Search users
   */
  async search(query: string, limit = 10): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, avatar_url')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .eq('status', 'active')
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return this.getById(user.id);
  },

  /**
   * Invite user by email
   */
  async inviteUser(email: string, role: 'admin' | 'manager' | 'user' = 'user'): Promise<void> {
    const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { role },
      redirectTo: `${window.location.origin}/auth/setup-password`,
    });
    if (error) throw error;
  },
};

export default userService;
