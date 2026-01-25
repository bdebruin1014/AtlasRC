-- ============================================
-- NOTIFICATIONS SYSTEM
-- Centralized notification management for Atlas
-- ============================================

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Notification content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'info', 'success', 'warning', 'error', 'alert',
    'budget_alert', 'approval_request', 'task_due', 'document_signed',
    'draw_request', 'change_order', 'permit_expiring', 'milestone_complete'
  )),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- Related entity references
  entity_type TEXT, -- 'project', 'budget', 'draw_request', 'change_order', 'permit', 'task', etc.
  entity_id UUID,
  action_url TEXT, -- URL to navigate to when clicked

  -- Status tracking
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  is_archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ -- Optional expiration for time-sensitive notifications
);

-- Notification preferences per user
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Email notification settings
  email_enabled BOOLEAN DEFAULT TRUE,
  email_digest_frequency TEXT DEFAULT 'daily' CHECK (email_digest_frequency IN ('immediate', 'hourly', 'daily', 'weekly', 'none')),

  -- Notification type preferences (which types to receive)
  budget_alerts BOOLEAN DEFAULT TRUE,
  approval_requests BOOLEAN DEFAULT TRUE,
  task_reminders BOOLEAN DEFAULT TRUE,
  document_updates BOOLEAN DEFAULT TRUE,
  permit_alerts BOOLEAN DEFAULT TRUE,
  milestone_updates BOOLEAN DEFAULT TRUE,
  system_announcements BOOLEAN DEFAULT TRUE,

  -- Threshold settings
  budget_alert_threshold DECIMAL(5,2) DEFAULT 80.00, -- Alert when budget line item reaches this % spent
  permit_expiry_days INTEGER DEFAULT 30, -- Days before permit expiry to alert
  task_reminder_hours INTEGER DEFAULT 24, -- Hours before task due date to remind

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budget alert configurations (per project/budget)
CREATE TABLE IF NOT EXISTS budget_alert_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  project_id UUID,
  budget_id UUID,

  -- Alert settings
  is_enabled BOOLEAN DEFAULT TRUE,
  alert_threshold_warning DECIMAL(5,2) DEFAULT 80.00,
  alert_threshold_critical DECIMAL(5,2) DEFAULT 95.00,
  alert_on_overbudget BOOLEAN DEFAULT TRUE,

  -- Line item specific thresholds (optional overrides)
  line_item_thresholds JSONB DEFAULT '{}', -- { "line_item_id": { "warning": 75, "critical": 90 } }

  -- Notification recipients
  notify_project_manager BOOLEAN DEFAULT TRUE,
  notify_finance_team BOOLEAN DEFAULT TRUE,
  additional_recipients UUID[] DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_team ON notifications(team_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_entity ON notifications(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_budget_alert_configs_project ON budget_alert_configs(project_id);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_alert_configs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications or team-wide notifications
CREATE POLICY notifications_select ON notifications
  FOR SELECT USING (
    user_id = auth.uid() OR
    (user_id IS NULL AND team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
  );

CREATE POLICY notifications_update ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Users can only manage their own preferences
CREATE POLICY notification_preferences_all ON notification_preferences
  FOR ALL USING (user_id = auth.uid());

-- Team members can view and manage budget alert configs for their team
CREATE POLICY budget_alert_configs_select ON budget_alert_configs
  FOR SELECT USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()));

CREATE POLICY budget_alert_configs_modify ON budget_alert_configs
  FOR ALL USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  p_team_id UUID,
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_priority TEXT DEFAULT 'normal',
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    team_id, user_id, title, message, type, priority,
    entity_type, entity_id, action_url, metadata
  ) VALUES (
    p_team_id, p_user_id, p_title, p_message, p_type, p_priority,
    p_entity_type, p_entity_id, p_action_url, p_metadata
  ) RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_read(p_notification_ids UUID[])
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE id = ANY(p_notification_ids)
    AND user_id = auth.uid()
    AND is_read = FALSE;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check budget thresholds and create alerts
CREATE OR REPLACE FUNCTION check_budget_thresholds()
RETURNS TRIGGER AS $$
DECLARE
  v_config budget_alert_configs%ROWTYPE;
  v_spent_percent DECIMAL(5,2);
  v_budget_total DECIMAL(15,2);
  v_spent_total DECIMAL(15,2);
BEGIN
  -- Get budget alert config for this budget
  SELECT * INTO v_config
  FROM budget_alert_configs
  WHERE budget_id = NEW.budget_id AND is_enabled = TRUE
  LIMIT 1;

  IF v_config IS NULL THEN
    RETURN NEW;
  END IF;

  -- Calculate spent percentage (simplified - would need actual spent calculation)
  v_budget_total := NEW.amount;
  v_spent_total := COALESCE(NEW.spent, 0);

  IF v_budget_total > 0 THEN
    v_spent_percent := (v_spent_total / v_budget_total) * 100;

    -- Check thresholds
    IF v_spent_percent >= v_config.alert_threshold_critical THEN
      PERFORM create_notification(
        v_config.team_id,
        NULL, -- Team-wide notification
        'Budget Critical: ' || NEW.name,
        'Line item "' || NEW.name || '" has reached ' || ROUND(v_spent_percent, 1) || '% of budget',
        'budget_alert',
        'urgent',
        'budget',
        NEW.budget_id,
        '/projects/' || v_config.project_id || '/budget',
        jsonb_build_object('line_item_id', NEW.id, 'spent_percent', v_spent_percent)
      );
    ELSIF v_spent_percent >= v_config.alert_threshold_warning THEN
      PERFORM create_notification(
        v_config.team_id,
        NULL,
        'Budget Warning: ' || NEW.name,
        'Line item "' || NEW.name || '" has reached ' || ROUND(v_spent_percent, 1) || '% of budget',
        'budget_alert',
        'high',
        'budget',
        NEW.budget_id,
        '/projects/' || v_config.project_id || '/budget',
        jsonb_build_object('line_item_id', NEW.id, 'spent_percent', v_spent_percent)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for budget line item updates (commented out - needs actual table name)
-- CREATE TRIGGER budget_threshold_check
--   AFTER UPDATE OF spent ON budget_line_items
--   FOR EACH ROW
--   EXECUTE FUNCTION check_budget_thresholds();

COMMENT ON TABLE notifications IS 'Centralized notification system for all Atlas alerts and updates';
COMMENT ON TABLE notification_preferences IS 'User-specific notification preferences and thresholds';
COMMENT ON TABLE budget_alert_configs IS 'Project/budget-level alert configurations';
