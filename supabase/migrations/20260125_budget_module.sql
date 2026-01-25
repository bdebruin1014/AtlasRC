-- Budget Module: project_budgets, budget_line_items, plans tables
-- Adds version-controlled budgets with template and plan integration

-- Plans table (building plans for vertical construction)
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID,
  name TEXT NOT NULL,
  description TEXT,

  -- Plan Details
  square_footage INTEGER,
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  garage_spaces INTEGER,
  stories INTEGER,

  -- Applicable project types
  project_types TEXT[] NOT NULL DEFAULT '{}',

  -- Cost Information
  base_cost DECIMAL(12,2),
  cost_per_sf DECIMAL(8,2),

  -- Detailed cost breakdown (JSON)
  cost_breakdown JSONB DEFAULT '{}',

  -- Documents
  floor_plan_url TEXT,
  elevation_urls JSONB DEFAULT '[]',
  spec_sheet_url TEXT,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Budgets (version-controlled budgets per project)
CREATE TABLE IF NOT EXISTS project_budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  -- Identification
  budget_name TEXT NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  plan_id UUID REFERENCES plans(id),
  template_id UUID REFERENCES budget_templates(id),

  -- Status
  is_active BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft', -- draft, approved, locked

  -- Totals (calculated)
  total_budget DECIMAL(14,2) DEFAULT 0,
  total_actual DECIMAL(14,2) DEFAULT 0,
  total_variance DECIMAL(14,2) DEFAULT 0,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  created_by_name TEXT,
  approved_by UUID,
  approved_at TIMESTAMPTZ,

  UNIQUE(project_id, version_number)
);

-- Trigger to ensure only one active budget per project
CREATE OR REPLACE FUNCTION ensure_single_active_budget()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE project_budgets
    SET is_active = false
    WHERE project_id = NEW.project_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_single_active_budget
BEFORE INSERT OR UPDATE ON project_budgets
FOR EACH ROW EXECUTE FUNCTION ensure_single_active_budget();

-- Budget Line Items
CREATE TABLE IF NOT EXISTS budget_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id UUID REFERENCES project_budgets(id) ON DELETE CASCADE,

  -- Categorization
  category TEXT NOT NULL,
  subcategory TEXT,
  line_item_code TEXT,
  line_item_name TEXT NOT NULL,
  description TEXT,

  -- Amounts
  budget_amount DECIMAL(12,2) DEFAULT 0,
  actual_amount DECIMAL(12,2) DEFAULT 0,
  committed_amount DECIMAL(12,2) DEFAULT 0,

  -- Calculation basis
  calculation_type TEXT DEFAULT 'fixed', -- fixed, per_unit, per_sf, percentage
  calculation_basis TEXT,
  unit_cost DECIMAL(12,2),
  quantity DECIMAL(10,2),

  -- Tracking
  is_from_template BOOLEAN DEFAULT false,
  is_from_plan BOOLEAN DEFAULT false,
  source_field TEXT, -- e.g., 'purchase_contract.price'

  -- Ordering
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_budgets_project ON project_budgets(project_id);
CREATE INDEX IF NOT EXISTS idx_project_budgets_active ON project_budgets(project_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_budget_line_items_budget ON budget_line_items(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_line_items_category ON budget_line_items(budget_id, category);
CREATE INDEX IF NOT EXISTS idx_plans_project_types ON plans USING GIN(project_types);

-- Enable RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_line_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies (permissive for authenticated users)
CREATE POLICY "plans_select" ON plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "plans_insert" ON plans FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "plans_update" ON plans FOR UPDATE TO authenticated USING (true);
CREATE POLICY "plans_delete" ON plans FOR DELETE TO authenticated USING (true);

CREATE POLICY "project_budgets_select" ON project_budgets FOR SELECT TO authenticated USING (true);
CREATE POLICY "project_budgets_insert" ON project_budgets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "project_budgets_update" ON project_budgets FOR UPDATE TO authenticated USING (true);
CREATE POLICY "project_budgets_delete" ON project_budgets FOR DELETE TO authenticated USING (true);

CREATE POLICY "budget_line_items_select" ON budget_line_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "budget_line_items_insert" ON budget_line_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "budget_line_items_update" ON budget_line_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "budget_line_items_delete" ON budget_line_items FOR DELETE TO authenticated USING (true);
