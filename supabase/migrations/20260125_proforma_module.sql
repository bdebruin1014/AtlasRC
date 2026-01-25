-- ============================================
-- PRO FORMA MODULE (Enhanced)
-- Professional-grade financial modeling with templates and scenarios
-- ============================================

-- proforma_templates (Admin-managed)
CREATE TABLE IF NOT EXISTS proforma_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL, -- scattered_lot, multifamily, commercial, subdivision, mixed_use
  region TEXT,

  -- Template structure (sections, fields, calculations, defaults)
  structure JSONB NOT NULL DEFAULT '{}',

  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- proformas table (enhanced)
CREATE TABLE IF NOT EXISTS proformas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  budget_id UUID REFERENCES project_budgets(id),
  template_id UUID REFERENCES proforma_templates(id),

  -- Identification
  name TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft', -- draft, in_review, approved, locked

  -- All data stored as JSONB for flexibility
  inputs JSONB NOT NULL DEFAULT '{}',
  assumptions JSONB NOT NULL DEFAULT '{}',
  uses_of_funds JSONB NOT NULL DEFAULT '{}',
  sources_of_funds JSONB NOT NULL DEFAULT '{}',
  revenue_projections JSONB NOT NULL DEFAULT '{}',
  operating_expenses JSONB DEFAULT '{}',
  financing_details JSONB NOT NULL DEFAULT '{}',
  cash_flows JSONB NOT NULL DEFAULT '[]',
  returns_analysis JSONB NOT NULL DEFAULT '{}',
  sensitivity_analysis JSONB DEFAULT '{}',

  -- Legacy compatibility
  costs JSONB DEFAULT '{}',
  financing JSONB DEFAULT '{}',
  revenue JSONB DEFAULT '{}',
  results JSONB DEFAULT '{}',

  -- Approval
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- proforma_scenarios (for comparison)
CREATE TABLE IF NOT EXISTS proforma_scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proforma_id UUID REFERENCES proformas(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,

  -- Scenario-specific overrides
  assumption_overrides JSONB DEFAULT '{}',

  -- Calculated results
  results JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_proformas_project ON proformas(project_id);
CREATE INDEX IF NOT EXISTS idx_proformas_active ON proformas(is_active);
CREATE INDEX IF NOT EXISTS idx_proformas_status ON proformas(status);
CREATE INDEX IF NOT EXISTS idx_proformas_version ON proformas(project_id, version);
CREATE INDEX IF NOT EXISTS idx_proforma_templates_type ON proforma_templates(project_type);
CREATE INDEX IF NOT EXISTS idx_proforma_scenarios_pf ON proforma_scenarios(proforma_id);

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

-- Single active proforma per project
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
