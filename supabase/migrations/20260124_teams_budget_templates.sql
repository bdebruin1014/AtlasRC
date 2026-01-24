-- Migration: Teams and Budget Templates enhancements

-- ============================================
-- TEAMS ENHANCEMENTS
-- ============================================

-- Ensure teams table has all needed columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teams' AND column_name = 'department') THEN
    ALTER TABLE teams ADD COLUMN department VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teams' AND column_name = 'manager_id') THEN
    ALTER TABLE teams ADD COLUMN manager_id UUID REFERENCES profiles(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teams' AND column_name = 'max_members') THEN
    ALTER TABLE teams ADD COLUMN max_members INTEGER DEFAULT 20;
  END IF;
END $$;

-- ============================================
-- BUDGET TEMPLATES ENHANCEMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS budget_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  project_type VARCHAR(50),
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Template structure
  categories JSONB DEFAULT '[]',
  line_items JSONB DEFAULT '[]',

  -- Metadata
  version INTEGER DEFAULT 1,
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_budget_templates_org ON budget_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_budget_templates_type ON budget_templates(project_type);

ALTER TABLE budget_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org budget templates" ON budget_templates
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can manage org budget templates" ON budget_templates
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

-- ============================================
-- DUE DILIGENCE
-- ============================================

CREATE TABLE IF NOT EXISTS due_diligence_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),

  category VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'waived', 'failed')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),

  due_date DATE,
  completed_date DATE,
  assigned_to UUID REFERENCES profiles(id),

  -- Documents & notes
  documents JSONB DEFAULT '[]',
  notes TEXT,
  findings TEXT,

  -- Order
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_due_diligence_project ON due_diligence_items(project_id);
CREATE INDEX IF NOT EXISTS idx_due_diligence_status ON due_diligence_items(status);

ALTER TABLE due_diligence_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view due diligence" ON due_diligence_items
  FOR SELECT USING (project_id IN (
    SELECT id FROM projects WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can manage due diligence" ON due_diligence_items
  FOR ALL USING (project_id IN (
    SELECT id FROM projects WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  ));

-- ============================================
-- CLOSING
-- ============================================

CREATE TABLE IF NOT EXISTS closing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),

  category VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'na')),

  due_date DATE,
  completed_date DATE,
  assigned_to UUID REFERENCES profiles(id),
  responsible_party VARCHAR(200),

  -- Documents
  documents JSONB DEFAULT '[]',
  notes TEXT,

  -- Order
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_closing_items_project ON closing_items(project_id);

ALTER TABLE closing_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view closing items" ON closing_items
  FOR SELECT USING (project_id IN (
    SELECT id FROM projects WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can manage closing items" ON closing_items
  FOR ALL USING (project_id IN (
    SELECT id FROM projects WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  ));
