-- Migration: Auto-generate project numbers (YY-XXX format)
-- Creates a sequence and function to generate project numbers

-- Create sequence for project numbers per year
CREATE TABLE IF NOT EXISTS project_number_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  year INTEGER NOT NULL,
  last_number INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, year)
);

-- Add project_number column to projects table if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'project_number') THEN
    ALTER TABLE projects ADD COLUMN project_number VARCHAR(10);
  END IF;
END $$;

-- Create index on project_number
CREATE INDEX IF NOT EXISTS idx_projects_project_number ON projects(project_number);

-- Function to generate next project number
CREATE OR REPLACE FUNCTION generate_project_number(org_id UUID)
RETURNS VARCHAR(10) AS $$
DECLARE
  current_year INTEGER;
  year_suffix VARCHAR(2);
  next_num INTEGER;
  result VARCHAR(10);
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  year_suffix := LPAD(MOD(current_year, 100)::TEXT, 2, '0');

  -- Insert or update the sequence for this year
  INSERT INTO project_number_sequences (organization_id, year, last_number)
  VALUES (org_id, current_year, 1)
  ON CONFLICT (organization_id, year)
  DO UPDATE SET last_number = project_number_sequences.last_number + 1, updated_at = now()
  RETURNING last_number INTO next_num;

  result := year_suffix || '-' || LPAD(next_num::TEXT, 3, '0');
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- RLS policies
ALTER TABLE project_number_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org sequences" ON project_number_sequences
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update their org sequences" ON project_number_sequences
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));
