// src/services/chatService.js
// Team chat service with Supabase real-time

import { supabase } from '@/lib/supabase';

// ============================================
// TEAM MEMBERS
// ============================================

export async function getTeamMembers() {
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
