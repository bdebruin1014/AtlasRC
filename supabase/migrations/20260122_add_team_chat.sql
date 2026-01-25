-- Team Chat Tables Migration
-- Creates tables for internal team messaging

-- Team Members (extends auth.users with profile info)
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'member',
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Channels (both channels and DMs)
CREATE TABLE IF NOT EXISTS chat_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'channel' CHECK (type IN ('channel', 'dm')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Channel Members
CREATE TABLE IF NOT EXISTS chat_channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
  attachments JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unread Message Counts
CREATE TABLE IF NOT EXISTS chat_unread_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
  count INT DEFAULT 0,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, channel_id)
);

-- Chat Tasks (task assignments via chat)
CREATE TABLE IF NOT EXISTS chat_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON chat_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_channel_members_user ON chat_channel_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_channel_members_channel ON chat_channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_tasks_assigned ON chat_tasks(assigned_to);

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_unread_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Team members: visible to all authenticated users
CREATE POLICY "Team members are viewable by authenticated users"
  ON team_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own team member record"
  ON team_members FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Channels: members can see their channels
CREATE POLICY "Channel members can view channels"
  ON chat_channels FOR SELECT
  TO authenticated
  USING (
    type = 'channel' OR
    id IN (SELECT channel_id FROM chat_channel_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Authenticated users can create channels"
  ON chat_channels FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Channel members: visible to members
CREATE POLICY "Channel members are viewable by channel members"
  ON chat_channel_members FOR SELECT
  TO authenticated
  USING (
    channel_id IN (SELECT channel_id FROM chat_channel_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can join channels"
  ON chat_channel_members FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Messages: channel members can see messages
CREATE POLICY "Channel members can view messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    channel_id IN (SELECT channel_id FROM chat_channel_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Channel members can send messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    channel_id IN (SELECT channel_id FROM chat_channel_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can edit their own messages"
  ON chat_messages FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
  ON chat_messages FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Unread counts: user can manage their own
CREATE POLICY "Users can view their unread counts"
  ON chat_unread_counts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their unread counts"
  ON chat_unread_counts FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Tasks: visible to assigned user and creator
CREATE POLICY "Users can view their assigned tasks"
  ON chat_tasks FOR SELECT
  TO authenticated
  USING (assigned_to = auth.uid() OR created_by = auth.uid());

CREATE POLICY "Authenticated users can create tasks"
  ON chat_tasks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their assigned tasks"
  ON chat_tasks FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid() OR created_by = auth.uid());

-- Function to increment unread count
CREATE OR REPLACE FUNCTION increment_unread_counts()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO chat_unread_counts (user_id, channel_id, count)
  SELECT cm.user_id, NEW.channel_id, 1
  FROM chat_channel_members cm
  WHERE cm.channel_id = NEW.channel_id
    AND cm.user_id != NEW.user_id
  ON CONFLICT (user_id, channel_id)
  DO UPDATE SET count = chat_unread_counts.count + 1;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new messages
DROP TRIGGER IF EXISTS on_new_message ON chat_messages;
CREATE TRIGGER on_new_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION increment_unread_counts();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE team_members;

-- Insert default general channel
INSERT INTO chat_channels (id, name, description, type)
VALUES ('00000000-0000-0000-0000-000000000001', 'General', 'General team discussion', 'channel')
ON CONFLICT DO NOTHING;
