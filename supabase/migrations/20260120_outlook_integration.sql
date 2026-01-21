-- Atlas Real Estate Development - Outlook Email Integration Schema
-- Created: 2026-01-20

-- ============================================================================
-- OUTLOOK USER CONNECTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS outlook_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  email TEXT,
  display_name TEXT,
  is_connected BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_outlook_connections_user ON outlook_connections(user_id);

-- ============================================================================
-- PROJECT EMAILS (Linked emails to projects - Qualia-style)
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  email_id TEXT NOT NULL,
  conversation_id TEXT,
  subject TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_emails JSONB DEFAULT '[]'::jsonb,
  cc_emails JSONB DEFAULT '[]'::jsonb,
  received_at TIMESTAMPTZ NOT NULL,
  has_attachments BOOLEAN DEFAULT false,
  notes TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  linked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  linked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, email_id)
);

-- Indexes for project emails
CREATE INDEX IF NOT EXISTS idx_project_emails_project ON project_emails(project_id);
CREATE INDEX IF NOT EXISTS idx_project_emails_conversation ON project_emails(conversation_id);
CREATE INDEX IF NOT EXISTS idx_project_emails_from ON project_emails(from_email);
CREATE INDEX IF NOT EXISTS idx_project_emails_received ON project_emails(received_at DESC);

-- ============================================================================
-- EMAIL TEMPLATES (For quick responses)
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT,
  is_html BOOLEAN DEFAULT false,
  tags JSONB DEFAULT '[]'::jsonb,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for email templates
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);

-- ============================================================================
-- EMAIL ACTIVITY LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  email_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for activity log
CREATE INDEX IF NOT EXISTS idx_email_activity_user ON email_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_email_activity_project ON email_activity_log(project_id);
CREATE INDEX IF NOT EXISTS idx_email_activity_action ON email_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_email_activity_created ON email_activity_log(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE outlook_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_activity_log ENABLE ROW LEVEL SECURITY;

-- Outlook connections: Users can only access their own
CREATE POLICY "Users can manage their own Outlook connection"
  ON outlook_connections FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Project emails: Authenticated users can access
CREATE POLICY "Users can view project emails"
  ON project_emails FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage project emails"
  ON project_emails FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Email templates: Authenticated users can access
CREATE POLICY "Users can view email templates"
  ON email_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage email templates"
  ON email_templates FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Email activity log
CREATE POLICY "Users can view email activity"
  ON email_activity_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert email activity"
  ON email_activity_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_outlook_connections_updated_at BEFORE UPDATE ON outlook_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED EMAIL TEMPLATES
-- ============================================================================

INSERT INTO email_templates (name, subject, body, category, is_html) VALUES
('Construction Update Request', 'Construction Update Request - {{project_name}}', 'Hi {{contact_name}},

I hope this email finds you well. Could you please provide an update on the current construction progress for {{project_name}}?

Specifically, I would like to know:
1. Current completion percentage
2. Any delays or issues encountered
3. Expected completion timeline

Thank you for your continued partnership.

Best regards,
{{sender_name}}', 'construction', false),

('Document Request', 'Document Request - {{project_name}}', 'Hi {{contact_name}},

We are requesting the following documents for {{project_name}}:

- {{document_list}}

Please send these at your earliest convenience.

Thank you,
{{sender_name}}', 'general', false),

('Payment Notification', 'Payment Notification - {{project_name}}', 'Hi {{contact_name}},

This is to confirm that payment in the amount of {{amount}} has been processed for {{project_name}}.

Transaction details:
- Amount: {{amount}}
- Date: {{date}}
- Reference: {{reference}}

Please let us know if you have any questions.

Best regards,
{{sender_name}}', 'financial', false),

('Meeting Request', 'Meeting Request - {{project_name}}', 'Hi {{contact_name}},

I would like to schedule a meeting to discuss {{project_name}}.

Proposed time: {{proposed_time}}
Location: {{location}}

Please let me know if this works for your schedule or suggest alternative times.

Thank you,
{{sender_name}}', 'general', false)

ON CONFLICT DO NOTHING;
