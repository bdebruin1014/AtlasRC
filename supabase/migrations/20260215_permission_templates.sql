-- ============================================================================
-- PERMISSION TEMPLATES
-- Save custom permission sets as reusable templates
-- ============================================================================

CREATE TABLE IF NOT EXISTS permission_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_system BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_permission_templates_name ON permission_templates(name);

ALTER TABLE permission_templates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can manage permission_templates" ON permission_templates;
  CREATE POLICY "Authenticated users can manage permission_templates"
    ON permission_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);
END $$;

DROP TRIGGER IF EXISTS update_permission_templates_updated_at ON permission_templates;
CREATE TRIGGER update_permission_templates_updated_at BEFORE UPDATE ON permission_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Extend user_profiles with invitation tracking
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMPTZ;

-- Allow team-level permission overrides
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS permissions_override JSONB DEFAULT NULL;

GRANT ALL ON permission_templates TO authenticated;
