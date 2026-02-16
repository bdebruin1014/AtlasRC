-- Admin Settings table for storing admin-configurable preferences
-- Used for calendar preferences, integration settings, etc.

CREATE TABLE IF NOT EXISTS admin_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Any authenticated user can read admin settings
CREATE POLICY "Anyone can read admin settings"
  ON admin_settings FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only admins can insert/update admin settings
CREATE POLICY "Admins can manage admin settings"
  ON admin_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Seed default calendar preferences
INSERT INTO admin_settings (key, value)
VALUES ('calendar_preferences', '{"syncEnabled": false, "defaultReminder": 15, "showDeclined": false, "workingHoursOnly": true}')
ON CONFLICT (key) DO NOTHING;
