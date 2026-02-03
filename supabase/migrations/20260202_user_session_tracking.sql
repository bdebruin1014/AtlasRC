-- User Session Tracking Module
-- Tracks user sessions, activity metrics, and processes session data for analytics

-- User Sessions Table
-- Tracks individual user sessions from login to logout/timeout
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER, -- Calculated on session end
  ip_address INET,
  user_agent TEXT,
  device_type TEXT, -- 'desktop', 'tablet', 'mobile'
  browser TEXT,
  os TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  pages_viewed INTEGER DEFAULT 0,
  actions_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session Activity Log
-- Detailed log of activities within a session
CREATE TABLE IF NOT EXISTS session_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'page_view', 'click', 'form_submit', 'api_call', 'export', 'create', 'update', 'delete'
  module TEXT NOT NULL, -- 'projects', 'opportunities', 'accounting', 'documents', 'contacts', 'admin', etc.
  page_path TEXT,
  resource_type TEXT, -- 'project', 'opportunity', 'transaction', 'document', etc.
  resource_id UUID,
  resource_name TEXT,
  action_details JSONB, -- Additional action-specific data
  duration_ms INTEGER, -- Time spent on this action
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Activity Summary
-- Aggregated daily/weekly/monthly activity stats per user
CREATE TABLE IF NOT EXISTS user_activity_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_sessions INTEGER DEFAULT 0,
  total_duration_seconds INTEGER DEFAULT 0,
  total_pages_viewed INTEGER DEFAULT 0,
  total_actions INTEGER DEFAULT 0,
  avg_session_duration_seconds INTEGER DEFAULT 0,
  module_breakdown JSONB DEFAULT '{}', -- { "projects": { "time": 1200, "actions": 45 }, ... }
  action_breakdown JSONB DEFAULT '{}', -- { "create": 10, "update": 25, ... }
  peak_hours JSONB DEFAULT '[]', -- Most active hours
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, period_type, period_start)
);

-- Module Usage Stats
-- Tracks usage statistics per module
CREATE TABLE IF NOT EXISTS module_usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  period_start DATE NOT NULL,
  module TEXT NOT NULL,
  unique_users INTEGER DEFAULT 0,
  total_time_seconds INTEGER DEFAULT 0,
  total_actions INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  action_breakdown JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(period_type, period_start, module)
);

-- Hourly Activity Stats
-- Tracks activity by hour for pattern analysis
CREATE TABLE IF NOT EXISTS hourly_activity_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
  unique_users INTEGER DEFAULT 0,
  total_actions INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, hour)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON user_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_session_activities_session_id ON session_activities(session_id);
CREATE INDEX IF NOT EXISTS idx_session_activities_user_id ON session_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_session_activities_module ON session_activities(module);
CREATE INDEX IF NOT EXISTS idx_session_activities_timestamp ON session_activities(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_activity_summary_user_period ON user_activity_summary(user_id, period_type, period_start);
CREATE INDEX IF NOT EXISTS idx_module_usage_stats_period ON module_usage_stats(period_type, period_start);
CREATE INDEX IF NOT EXISTS idx_hourly_activity_date ON hourly_activity_stats(date);

-- Function to update session on activity
CREATE OR REPLACE FUNCTION update_session_on_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_sessions
  SET
    last_activity_at = NEW.timestamp,
    pages_viewed = pages_viewed + CASE WHEN NEW.action_type = 'page_view' THEN 1 ELSE 0 END,
    actions_count = actions_count + 1,
    updated_at = NOW()
  WHERE id = NEW.session_id AND is_active = TRUE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update session metrics when activity is logged
DROP TRIGGER IF EXISTS trg_update_session_on_activity ON session_activities;
CREATE TRIGGER trg_update_session_on_activity
  AFTER INSERT ON session_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_session_on_activity();

-- Function to end session and calculate duration
CREATE OR REPLACE FUNCTION end_user_session(p_session_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE user_sessions
  SET
    is_active = FALSE,
    ended_at = NOW(),
    duration_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER,
    updated_at = NOW()
  WHERE id = p_session_id AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to process and aggregate session data daily
CREATE OR REPLACE FUNCTION process_session_data_daily(p_date DATE DEFAULT CURRENT_DATE - INTERVAL '1 day')
RETURNS void AS $$
DECLARE
  v_user RECORD;
  v_module RECORD;
  v_hour RECORD;
BEGIN
  -- Process user activity summaries
  FOR v_user IN
    SELECT DISTINCT user_id
    FROM user_sessions
    WHERE DATE(started_at) = p_date
  LOOP
    INSERT INTO user_activity_summary (
      user_id,
      period_type,
      period_start,
      period_end,
      total_sessions,
      total_duration_seconds,
      total_pages_viewed,
      total_actions,
      avg_session_duration_seconds,
      module_breakdown,
      action_breakdown
    )
    SELECT
      v_user.user_id,
      'daily',
      p_date,
      p_date,
      COUNT(DISTINCT us.id),
      COALESCE(SUM(us.duration_seconds), 0),
      COALESCE(SUM(us.pages_viewed), 0),
      COALESCE(SUM(us.actions_count), 0),
      COALESCE(AVG(us.duration_seconds)::INTEGER, 0),
      COALESCE((
        SELECT jsonb_object_agg(module, jsonb_build_object('time', time_seconds, 'actions', action_count))
        FROM (
          SELECT
            sa.module,
            COALESCE(SUM(sa.duration_ms) / 1000, 0) as time_seconds,
            COUNT(*) as action_count
          FROM session_activities sa
          JOIN user_sessions us2 ON sa.session_id = us2.id
          WHERE us2.user_id = v_user.user_id AND DATE(us2.started_at) = p_date
          GROUP BY sa.module
        ) sub
      ), '{}'),
      COALESCE((
        SELECT jsonb_object_agg(action_type, action_count)
        FROM (
          SELECT
            sa.action_type,
            COUNT(*) as action_count
          FROM session_activities sa
          JOIN user_sessions us2 ON sa.session_id = us2.id
          WHERE us2.user_id = v_user.user_id AND DATE(us2.started_at) = p_date
          GROUP BY sa.action_type
        ) sub
      ), '{}')
    FROM user_sessions us
    WHERE us.user_id = v_user.user_id AND DATE(us.started_at) = p_date
    ON CONFLICT (user_id, period_type, period_start)
    DO UPDATE SET
      total_sessions = EXCLUDED.total_sessions,
      total_duration_seconds = EXCLUDED.total_duration_seconds,
      total_pages_viewed = EXCLUDED.total_pages_viewed,
      total_actions = EXCLUDED.total_actions,
      avg_session_duration_seconds = EXCLUDED.avg_session_duration_seconds,
      module_breakdown = EXCLUDED.module_breakdown,
      action_breakdown = EXCLUDED.action_breakdown,
      updated_at = NOW();
  END LOOP;

  -- Process module usage stats
  FOR v_module IN
    SELECT DISTINCT sa.module
    FROM session_activities sa
    JOIN user_sessions us ON sa.session_id = us.id
    WHERE DATE(us.started_at) = p_date
  LOOP
    INSERT INTO module_usage_stats (
      period_type,
      period_start,
      module,
      unique_users,
      total_time_seconds,
      total_actions,
      page_views,
      action_breakdown
    )
    SELECT
      'daily',
      p_date,
      v_module.module,
      COUNT(DISTINCT us.user_id),
      COALESCE(SUM(sa.duration_ms) / 1000, 0),
      COUNT(sa.id),
      COUNT(CASE WHEN sa.action_type = 'page_view' THEN 1 END),
      COALESCE((
        SELECT jsonb_object_agg(action_type, action_count)
        FROM (
          SELECT action_type, COUNT(*) as action_count
          FROM session_activities sa2
          JOIN user_sessions us2 ON sa2.session_id = us2.id
          WHERE sa2.module = v_module.module AND DATE(us2.started_at) = p_date
          GROUP BY action_type
        ) sub
      ), '{}')
    FROM session_activities sa
    JOIN user_sessions us ON sa.session_id = us.id
    WHERE sa.module = v_module.module AND DATE(us.started_at) = p_date
    ON CONFLICT (period_type, period_start, module)
    DO UPDATE SET
      unique_users = EXCLUDED.unique_users,
      total_time_seconds = EXCLUDED.total_time_seconds,
      total_actions = EXCLUDED.total_actions,
      page_views = EXCLUDED.page_views,
      action_breakdown = EXCLUDED.action_breakdown,
      updated_at = NOW();
  END LOOP;

  -- Process hourly activity stats
  FOR v_hour IN SELECT generate_series(0, 23) as hour
  LOOP
    INSERT INTO hourly_activity_stats (
      date,
      hour,
      unique_users,
      total_actions,
      total_sessions
    )
    SELECT
      p_date,
      v_hour.hour,
      COUNT(DISTINCT us.user_id),
      COALESCE(SUM(us.actions_count), 0),
      COUNT(DISTINCT us.id)
    FROM user_sessions us
    WHERE DATE(us.started_at) = p_date
      AND EXTRACT(HOUR FROM us.started_at) = v_hour.hour
    ON CONFLICT (date, hour)
    DO UPDATE SET
      unique_users = EXCLUDED.unique_users,
      total_actions = EXCLUDED.total_actions,
      total_sessions = EXCLUDED.total_sessions;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- View for real-time session data
CREATE OR REPLACE VIEW active_user_sessions AS
SELECT
  us.id as session_id,
  us.user_id,
  p.full_name as user_name,
  p.email,
  p.avatar_url,
  us.started_at,
  us.last_activity_at,
  EXTRACT(EPOCH FROM (NOW() - us.started_at))::INTEGER as duration_seconds,
  us.pages_viewed,
  us.actions_count,
  us.device_type,
  us.browser,
  us.os,
  us.ip_address
FROM user_sessions us
LEFT JOIN profiles p ON us.user_id = p.id
WHERE us.is_active = TRUE
ORDER BY us.last_activity_at DESC;

-- View for user activity dashboard
CREATE OR REPLACE VIEW user_activity_dashboard AS
SELECT
  p.id as user_id,
  p.full_name,
  p.email,
  p.avatar_url,
  COALESCE(today.sessions, 0) as sessions_today,
  COALESCE(today.duration_seconds, 0) as time_today_seconds,
  COALESCE(today.pages_viewed, 0) as pages_today,
  COALESCE(today.actions_count, 0) as actions_today,
  COALESCE(week.sessions, 0) as sessions_week,
  COALESCE(week.duration_seconds, 0) as time_week_seconds,
  COALESCE(week.actions_count, 0) as actions_week,
  (
    SELECT last_activity_at
    FROM user_sessions
    WHERE user_id = p.id
    ORDER BY last_activity_at DESC
    LIMIT 1
  ) as last_active_at
FROM profiles p
LEFT JOIN (
  SELECT
    user_id,
    COUNT(*) as sessions,
    SUM(duration_seconds) as duration_seconds,
    SUM(pages_viewed) as pages_viewed,
    SUM(actions_count) as actions_count
  FROM user_sessions
  WHERE DATE(started_at) = CURRENT_DATE
  GROUP BY user_id
) today ON p.id = today.user_id
LEFT JOIN (
  SELECT
    user_id,
    COUNT(*) as sessions,
    SUM(duration_seconds) as duration_seconds,
    SUM(actions_count) as actions_count
  FROM user_sessions
  WHERE started_at >= CURRENT_DATE - INTERVAL '7 days'
  GROUP BY user_id
) week ON p.id = week.user_id
WHERE p.id IN (SELECT DISTINCT user_id FROM user_sessions);

-- Enable RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE hourly_activity_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can see their own session data
CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can create own sessions" ON user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own active sessions
CREATE POLICY "Users can update own sessions" ON user_sessions
  FOR UPDATE USING (auth.uid() = user_id AND is_active = TRUE);

-- Session activities follow session ownership
CREATE POLICY "Users can view own session activities" ON session_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can log own activities" ON session_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Summary data is viewable by the user
CREATE POLICY "Users can view own activity summary" ON user_activity_summary
  FOR SELECT USING (auth.uid() = user_id);

-- Module stats are readable by all authenticated users
CREATE POLICY "Authenticated users can view module stats" ON module_usage_stats
  FOR SELECT USING (auth.role() = 'authenticated');

-- Hourly stats are readable by all authenticated users
CREATE POLICY "Authenticated users can view hourly stats" ON hourly_activity_stats
  FOR SELECT USING (auth.role() = 'authenticated');

-- Grant admin full access (assuming admin role check)
CREATE POLICY "Admins can view all sessions" ON user_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can view all session activities" ON session_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can view all activity summaries" ON user_activity_summary
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

-- Comments
COMMENT ON TABLE user_sessions IS 'Tracks individual user sessions from login to logout/timeout';
COMMENT ON TABLE session_activities IS 'Detailed log of user activities within a session';
COMMENT ON TABLE user_activity_summary IS 'Aggregated activity statistics per user per period';
COMMENT ON TABLE module_usage_stats IS 'Aggregated usage statistics per module per period';
COMMENT ON TABLE hourly_activity_stats IS 'Hourly activity patterns for analysis';
COMMENT ON FUNCTION process_session_data_daily IS 'Processes and aggregates session data for the specified date';
COMMENT ON FUNCTION end_user_session IS 'Ends a user session and calculates final duration';
