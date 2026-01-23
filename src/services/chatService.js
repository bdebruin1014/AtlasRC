// src/services/chatService.js
// Team chat service with Supabase real-time

import { supabase, isDemoMode } from '@/lib/supabase';

// ============================================
// TEAM MEMBERS
// ============================================

export async function getTeamMembers() {
  if (isDemoMode) {
    return { data: getMockTeamMembers(), error: null };
  }

  const { data, error } = await supabase
    .from('team_members')
    .select(`
      id,
      user_id,
      display_name,
      email,
      avatar_url,
      role,
      status,
      last_seen_at
    `)
    .order('display_name');

  return { data: data || [], error };
}

export async function updateMemberStatus(userId, status) {
  if (isDemoMode) {
    return { data: { user_id: userId, status }, error: null };
  }

  const { data, error } = await supabase
    .from('team_members')
    .update({
      status,
      last_seen_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single();

  return { data, error };
}

// ============================================
// ADMIN: TEAM MEMBER MANAGEMENT
// ============================================

/**
 * Create or update a team member (synced from user management)
 */
export async function upsertTeamMember({ userId, displayName, email, avatarUrl, role }) {
  if (isDemoMode) {
    return { data: { user_id: userId, display_name: displayName, email }, error: null };
  }

  const { data, error } = await supabase
    .from('team_members')
    .upsert({
      user_id: userId,
      display_name: displayName,
      email: email,
      avatar_url: avatarUrl || null,
      role: role || 'member',
      status: 'offline',
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Delete a team member
 */
export async function deleteTeamMember(userId) {
  if (isDemoMode) {
    return { success: true, error: null };
  }

  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('user_id', userId);

  return { success: !error, error };
}

/**
 * Get a single team member by user ID
 */
export async function getTeamMemberByUserId(userId) {
  if (isDemoMode) {
    const members = getMockTeamMembers();
    return { data: members.find(m => m.user_id === userId) || null, error: null };
  }

  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('user_id', userId)
    .single();

  return { data, error };
}

/**
 * Sync all users from user_profiles to team_members
 * Call this to initialize team members from existing users
 */
export async function syncAllUsersToTeamMembers() {
  if (isDemoMode) {
    return { success: true, synced: 0, error: null };
  }

  try {
    // Get all users from user_profiles
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, full_name, email, avatar_url')
      .eq('status', 'active');

    if (usersError) throw usersError;

    if (!users || users.length === 0) {
      return { success: true, synced: 0, error: null };
    }

    // Upsert all users to team_members
    const teamMembers = users.map(user => ({
      user_id: user.id,
      display_name: user.full_name || user.email?.split('@')[0] || 'Unknown',
      email: user.email,
      avatar_url: user.avatar_url,
      role: 'member',
      status: 'offline',
      updated_at: new Date().toISOString()
    }));

    const { error: upsertError } = await supabase
      .from('team_members')
      .upsert(teamMembers, { onConflict: 'user_id' });

    if (upsertError) throw upsertError;

    return { success: true, synced: users.length, error: null };
  } catch (error) {
    console.error('Error syncing users to team members:', error);
    return { success: false, synced: 0, error };
  }
}

// Mock data for demo mode
function getMockTeamMembers() {
  return [
    { id: 'tm-1', user_id: 'user-1', display_name: 'Bryan De Bruin', email: 'bryan@vanrock.com', avatar_url: null, role: 'admin', status: 'online', last_seen_at: new Date().toISOString() },
    { id: 'tm-2', user_id: 'user-2', display_name: 'John Smith', email: 'john@vanrock.com', avatar_url: null, role: 'member', status: 'away', last_seen_at: new Date().toISOString() },
    { id: 'tm-3', user_id: 'user-3', display_name: 'Sarah Johnson', email: 'sarah@vanrock.com', avatar_url: null, role: 'member', status: 'offline', last_seen_at: new Date().toISOString() },
    { id: 'tm-4', user_id: 'user-4', display_name: 'Mike Williams', email: 'mike@vanrock.com', avatar_url: null, role: 'member', status: 'online', last_seen_at: new Date().toISOString() },
  ];
}

// ============================================
// CHANNELS
// ============================================

export async function getChannels() {
  const { data, error } = await supabase
    .from('chat_channels')
    .select(`
      id,
      name,
      description,
      type,
      created_at,
      created_by
    `)
    .eq('type', 'channel')
    .order('name');

  return { data: data || [], error };
}

export async function createChannel(name, description = '') {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('chat_channels')
    .insert({
      name,
      description,
      type: 'channel',
      created_by: user?.id
    })
    .select()
    .single();

  return { data, error };
}

// ============================================
// DIRECT MESSAGES
// ============================================

export async function getOrCreateDirectMessage(otherUserId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Not authenticated') };

  // Check if DM already exists
  const { data: existing } = await supabase
    .from('chat_channel_members')
    .select('channel_id')
    .eq('user_id', user.id)
    .eq('channel_id', (
      await supabase
        .from('chat_channel_members')
        .select('channel_id')
        .eq('user_id', otherUserId)
    ).data?.map(m => m.channel_id) || []);

  if (existing && existing.length > 0) {
    // Verify it's a DM channel
    const { data: channel } = await supabase
      .from('chat_channels')
      .select('*')
      .eq('id', existing[0].channel_id)
      .eq('type', 'dm')
      .single();

    if (channel) return { data: channel, error: null };
  }

  // Create new DM channel
  const { data: channel, error } = await supabase
    .from('chat_channels')
    .insert({
      type: 'dm',
      created_by: user.id
    })
    .select()
    .single();

  if (error) return { data: null, error };

  // Add both users to channel
  await supabase.from('chat_channel_members').insert([
    { channel_id: channel.id, user_id: user.id },
    { channel_id: channel.id, user_id: otherUserId }
  ]);

  return { data: channel, error: null };
}

export async function getDirectMessages() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: null };

  const { data: memberships } = await supabase
    .from('chat_channel_members')
    .select('channel_id')
    .eq('user_id', user.id);

  if (!memberships || memberships.length === 0) return { data: [], error: null };

  const channelIds = memberships.map(m => m.channel_id);

  const { data, error } = await supabase
    .from('chat_channels')
    .select(`
      id,
      type,
      created_at,
      chat_channel_members(
        user_id,
        team_members:user_id(
          id,
          display_name,
          avatar_url,
          status
        )
      )
    `)
    .in('id', channelIds)
    .eq('type', 'dm');

  return { data: data || [], error };
}

// ============================================
// MESSAGES
// ============================================

export async function getMessages(channelId, limit = 50) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select(`
      id,
      channel_id,
      user_id,
      content,
      message_type,
      attachments,
      created_at,
      updated_at,
      team_members:user_id(
        id,
        display_name,
        avatar_url
      )
    `)
    .eq('channel_id', channelId)
    .order('created_at', { ascending: false })
    .limit(limit);

  // Reverse to get chronological order
  return { data: (data || []).reverse(), error };
}

export async function sendMessage(channelId, content, messageType = 'text', attachments = null) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Not authenticated') };

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      channel_id: channelId,
      user_id: user.id,
      content,
      message_type: messageType,
      attachments
    })
    .select(`
      id,
      channel_id,
      user_id,
      content,
      message_type,
      attachments,
      created_at,
      team_members:user_id(
        id,
        display_name,
        avatar_url
      )
    `)
    .single();

  return { data, error };
}

export async function editMessage(messageId, content) {
  const { data, error } = await supabase
    .from('chat_messages')
    .update({
      content,
      updated_at: new Date().toISOString()
    })
    .eq('id', messageId)
    .select()
    .single();

  return { data, error };
}

export async function deleteMessage(messageId) {
  const { error } = await supabase
    .from('chat_messages')
    .delete()
    .eq('id', messageId);

  return { success: !error, error };
}

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

export function subscribeToChannel(channelId, onMessage) {
  const subscription = supabase
    .channel(`chat:${channelId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `channel_id=eq.${channelId}`
      },
      async (payload) => {
        // Fetch full message with user info
        const { data } = await supabase
          .from('chat_messages')
          .select(`
            id,
            channel_id,
            user_id,
            content,
            message_type,
            attachments,
            created_at,
            team_members:user_id(
              id,
              display_name,
              avatar_url
            )
          `)
          .eq('id', payload.new.id)
          .single();

        if (data) {
          onMessage(data);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
}

export function subscribeToPresence(onPresenceChange) {
  const subscription = supabase
    .channel('team:presence')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'team_members'
      },
      (payload) => {
        onPresenceChange(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
}

// ============================================
// UNREAD COUNTS
// ============================================

export async function getUnreadCounts() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: {}, error: null };

  const { data, error } = await supabase
    .from('chat_unread_counts')
    .select('channel_id, count')
    .eq('user_id', user.id);

  const counts = {};
  (data || []).forEach(item => {
    counts[item.channel_id] = item.count;
  });

  return { data: counts, error };
}

export async function markAsRead(channelId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: null };

  const { error } = await supabase
    .from('chat_unread_counts')
    .upsert({
      user_id: user.id,
      channel_id: channelId,
      count: 0,
      last_read_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,channel_id'
    });

  return { error };
}

// ============================================
// TASKS (from screenshot)
// ============================================

export async function getTasks(assignedTo = null) {
  let query = supabase
    .from('chat_tasks')
    .select(`
      id,
      title,
      description,
      status,
      priority,
      assigned_to,
      due_date,
      created_at,
      created_by,
      team_members:assigned_to(
        id,
        display_name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false });

  if (assignedTo) {
    query = query.eq('assigned_to', assignedTo);
  }

  const { data, error } = await query;
  return { data: data || [], error };
}

export async function createTask(title, assignedTo, dueDate = null, description = '') {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('chat_tasks')
    .insert({
      title,
      description,
      assigned_to: assignedTo,
      due_date: dueDate,
      created_by: user?.id,
      status: 'pending'
    })
    .select()
    .single();

  return { data, error };
}

export async function updateTaskStatus(taskId, status) {
  const { data, error } = await supabase
    .from('chat_tasks')
    .update({ status })
    .eq('id', taskId)
    .select()
    .single();

  return { data, error };
}

export default {
  getTeamMembers,
  updateMemberStatus,
  upsertTeamMember,
  deleteTeamMember,
  getTeamMemberByUserId,
  syncAllUsersToTeamMembers,
  getChannels,
  createChannel,
  getOrCreateDirectMessage,
  getDirectMessages,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  subscribeToChannel,
  subscribeToPresence,
  getUnreadCounts,
  markAsRead,
  getTasks,
  createTask,
  updateTaskStatus
};
