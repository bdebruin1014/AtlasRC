-- ============================================================================
-- Migration: Update project types and add activity log
-- Date: 2026-02-15
-- Description:
--   1. Expand project_type CHECK constraint to include the 4 canonical types
--   2. Add units_to_develop column if missing
--   3. Create activity_log table for entity change tracking
-- ============================================================================

-- 1. Update project_type CHECK constraint to include all valid types
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_project_type_check;
ALTER TABLE projects ADD CONSTRAINT projects_project_type_check
  CHECK (project_type IN (
    'scattered-lot',
    'lot-development',
    'lot-purchase-development',
    'community-development',
    -- Legacy types (backwards compatible)
    'spec-build',
    'fix-flip',
    'build-to-rent',
    'btr-development'
  ));

-- 2. Add units_to_develop if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'units_to_develop'
  ) THEN
    ALTER TABLE projects ADD COLUMN units_to_develop INTEGER DEFAULT 1;
  END IF;
END $$;

-- 3. Add budget_type if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'budget_type'
  ) THEN
    ALTER TABLE projects ADD COLUMN budget_type TEXT;
  END IF;
END $$;

-- 4. Create activity_log table
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,       -- 'project', 'opportunity', 'contact', 'entity', 'house'
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,            -- 'created', 'updated', 'status_changed', 'deleted', 'converted'
  field_changed TEXT,              -- which field was modified
  old_value TEXT,                  -- previous value (as text)
  new_value TEXT,                  -- new value (as text)
  performed_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for activity_log
CREATE INDEX IF NOT EXISTS idx_activity_log_entity
  ON activity_log (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_performed_by
  ON activity_log (performed_by);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at
  ON activity_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_action
  ON activity_log (action);

-- RLS for activity_log
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read all activity logs
CREATE POLICY activity_log_select ON activity_log
  FOR SELECT TO authenticated
  USING (true);

-- Policy: Authenticated users can insert their own activity logs
CREATE POLICY activity_log_insert ON activity_log
  FOR INSERT TO authenticated
  WITH CHECK (performed_by = auth.uid() OR performed_by IS NULL);
