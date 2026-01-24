-- ============================================
-- PRO FORMA MODULE
-- Professional financial modeling with templates
-- ============================================

-- proformas table
CREATE TABLE IF NOT EXISTS proformas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  budget_id UUID REFERENCES project_budgets(id),

  name TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT false,

  -- Project Assumptions (JSON)
  assumptions JSONB DEFAULT '{}',

  -- Costs pulled from budget with overrides
  costs JSONB DEFAULT '{}',

  -- Financing Structure
  financing JSONB DEFAULT '{}',

  -- Revenue Projections
  revenue JSONB DEFAULT '{}',

  -- Calculated Results
  results JSONB DEFAULT '{}',

  -- Monthly Cash Flow Array
  cash_flows JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_proformas_project ON proformas(project_id);
CREATE INDEX IF NOT EXISTS idx_proformas_active ON proformas(is_active);
CREATE INDEX IF NOT EXISTS idx_proformas_version ON proformas(project_id, version);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_proforma_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_proforma_updated_at
  BEFORE UPDATE ON proformas
  FOR EACH ROW
  EXECUTE FUNCTION update_proforma_updated_at();

-- Ensure only one active proforma per project
CREATE OR REPLACE FUNCTION ensure_single_active_proforma()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE proformas
    SET is_active = false
    WHERE project_id = NEW.project_id AND id != NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_single_active_proforma
  BEFORE INSERT OR UPDATE ON proformas
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_active_proforma();
