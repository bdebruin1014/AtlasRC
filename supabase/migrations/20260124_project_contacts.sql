-- Migration: Extended project contacts schema with 12 categories
-- Supports: Architect, Consultant, Contractor, Engineer, Government,
-- Investor, Legal/Title, Lender, Sales, Survey, Team Member, Other

CREATE TABLE IF NOT EXISTS project_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),

  -- Basic contact info
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'architect', 'consultant', 'contractor', 'engineer', 'government',
    'investor', 'legal_title', 'lender', 'sales', 'survey', 'team_member', 'other'
  )),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  company_name VARCHAR(200),
  job_title VARCHAR(100),
  email VARCHAR(200),
  phone VARCHAR(50),
  cell_phone VARCHAR(50),
  fax VARCHAR(50),

  -- Address
  address_line1 VARCHAR(200),
  address_line2 VARCHAR(100),
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),

  -- Category-specific fields stored as JSONB
  profile_data JSONB DEFAULT '{}',

  -- Status & metadata
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,

  -- Global contact reference
  global_contact_id UUID,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_contacts_project ON project_contacts(project_id);
CREATE INDEX IF NOT EXISTS idx_project_contacts_category ON project_contacts(category);
CREATE INDEX IF NOT EXISTS idx_project_contacts_org ON project_contacts(organization_id);

-- RLS
ALTER TABLE project_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view project contacts" ON project_contacts
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    ))
  );

CREATE POLICY "Users can manage project contacts" ON project_contacts
  FOR ALL USING (
    project_id IN (SELECT id FROM projects WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    ))
  );
