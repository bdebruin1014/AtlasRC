-- ============================================================================
-- OPPORTUNITY ENHANCEMENTS
-- Migration: 20260216_opportunity_enhancements.sql
-- Adds wholesale-specific fields and persistent stage task tracking
-- ============================================================================

-- A. ADD MISSING COLUMNS TO OPPORTUNITIES
-- These fields are referenced in the UI but don't exist in the table

-- Property identification
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS county TEXT;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS parcel_id TEXT;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS legal_description TEXT;

-- Land evaluation (critical for vacant lot deals)
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS zoning TEXT;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS lot_size_sf DECIMAL(12,2);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS municipality TEXT;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS flood_zone TEXT;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS topography TEXT;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS wetlands_pct DECIMAL(5,2) DEFAULT 0;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS tree_coverage TEXT;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS road_access TEXT;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS utilities_available TEXT[] DEFAULT '{}';
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS setbacks JSONB DEFAULT '{}';
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS school_district TEXT;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS hoa_amount DECIMAL(8,2);

-- Seller / motivation tracking (core of wholesale)
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS seller_type TEXT;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS motivation_level INTEGER;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS motivation_types TEXT[] DEFAULT '{}';
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS mortgage_balance DECIMAL(12,2);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS timeline_to_sell TEXT;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS seller_address TEXT;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS seller_phone_2 TEXT;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS ownership_duration_years INTEGER;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS agent_involved BOOLEAN DEFAULT false;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS agent_name TEXT;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS agent_company TEXT;

-- Deal structure
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS deal_type TEXT DEFAULT 'assignment';
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS initial_offer DECIMAL(12,2);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS counter_offer DECIMAL(12,2);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS final_price DECIMAL(12,2);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS negotiation_notes TEXT;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS earnest_money DECIMAL(12,2);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS dd_period_days INTEGER DEFAULT 14;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS inspection_period_days INTEGER;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS financing_contingency BOOLEAN DEFAULT false;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS contract_date DATE;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS dd_deadline DATE;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS closing_date DATE;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS title_company TEXT;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS closing_attorney TEXT;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS end_buyer_id UUID REFERENCES contacts(id) ON DELETE SET NULL;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS end_buyer_offer DECIMAL(12,2);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'warm';
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS tax_assessed_value DECIMAL(12,2);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS annual_taxes DECIMAL(8,2);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_opp_county ON opportunities(county);
CREATE INDEX IF NOT EXISTS idx_opp_municipality ON opportunities(municipality);
CREATE INDEX IF NOT EXISTS idx_opp_priority ON opportunities(priority);
CREATE INDEX IF NOT EXISTS idx_opp_deal_type ON opportunities(deal_type);


-- B. OPPORTUNITY STAGE TASKS (persistent per-deal checklist)
CREATE TABLE IF NOT EXISTS opportunity_stage_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  task_text TEXT NOT NULL,
  is_required BOOLEAN DEFAULT false,
  is_complete BOOLEAN DEFAULT false,
  completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  display_order INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ost_opportunity ON opportunity_stage_tasks(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_ost_stage ON opportunity_stage_tasks(stage);

ALTER TABLE opportunity_stage_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage opportunity_stage_tasks"
  ON opportunity_stage_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
GRANT ALL ON opportunity_stage_tasks TO authenticated;


-- C. STAGE TASK TEMPLATES (admin-configurable defaults)
CREATE TABLE IF NOT EXISTS opportunity_stage_task_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stage TEXT NOT NULL,
  task_text TEXT NOT NULL,
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE opportunity_stage_task_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage opportunity_stage_task_templates"
  ON opportunity_stage_task_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);
GRANT ALL ON opportunity_stage_task_templates TO authenticated;


-- D. SEED DEFAULT TASK TEMPLATES

INSERT INTO opportunity_stage_task_templates (stage, task_text, is_required, display_order) VALUES
  -- PROSPECTING
  ('Prospecting', 'Property details verified in county records', true, 1),
  ('Prospecting', 'Ownership confirmed (who is on title)', true, 2),
  ('Prospecting', 'Initial skip trace completed', false, 3),
  ('Prospecting', 'Comparable sales pulled (6 months, 0.5 mile)', true, 4),
  ('Prospecting', 'Drive-by property inspection done', false, 5),
  ('Prospecting', 'Estimated value determined', true, 6),
  ('Prospecting', 'Mail piece / marketing sent', false, 7),

  -- CONTACTED
  ('Contacted', 'Initial contact made (call/text/door knock)', true, 1),
  ('Contacted', 'Seller motivation discussed and rated', true, 2),
  ('Contacted', 'Property condition assessed (seller description)', false, 3),
  ('Contacted', 'Seller asking price obtained', true, 4),
  ('Contacted', 'Timeline to sell established', false, 5),
  ('Contacted', 'Follow-up date scheduled', true, 6),
  ('Contacted', 'Added to CRM follow-up sequence', false, 7),

  -- QUALIFIED
  ('Qualified', 'Seller motivation confirmed (score >= 6)', true, 1),
  ('Qualified', 'Price expectations are within range', true, 2),
  ('Qualified', 'Property meets investment criteria', true, 3),
  ('Qualified', 'Preliminary title check (no major liens)', false, 4),
  ('Qualified', 'MAO calculated (70% rule or build analysis)', true, 5),
  ('Qualified', 'Comparable analysis completed', true, 6),
  ('Qualified', 'Exit strategy determined (wholesale/flip/develop/hold)', true, 7),
  ('Qualified', 'Offer prepared', false, 8),

  -- NEGOTIATING
  ('Negotiating', 'Initial offer presented to seller', true, 1),
  ('Negotiating', 'Offer follow-up call made', false, 2),
  ('Negotiating', 'Counter offer received/addressed', false, 3),
  ('Negotiating', 'Final price agreed', true, 4),
  ('Negotiating', 'Earnest money amount confirmed', true, 5),
  ('Negotiating', 'Contract terms discussed (DD period, closing date)', true, 6),
  ('Negotiating', 'Contract prepared for signatures', true, 7),

  -- UNDER CONTRACT
  ('Under Contract', 'Purchase contract fully executed', true, 1),
  ('Under Contract', 'Earnest money deposited', true, 2),
  ('Under Contract', 'Title search ordered', true, 3),
  ('Under Contract', 'Survey ordered (if needed)', false, 4),
  ('Under Contract', 'Due diligence inspection completed', true, 5),
  ('Under Contract', 'Soil/geotech test ordered (if vacant lot)', false, 6),
  ('Under Contract', 'Zoning verification completed', true, 7),
  ('Under Contract', 'Utility availability confirmed', false, 8),
  ('Under Contract', 'End buyer identified (if wholesale)', false, 9),
  ('Under Contract', 'Assignment contract executed (if wholesale)', false, 10),
  ('Under Contract', 'Closing scheduled', true, 11),
  ('Under Contract', 'Funds wired / closing completed', true, 12)
ON CONFLICT DO NOTHING;


-- E. AUTO-POPULATE TASKS WHEN STAGE CHANGES
CREATE OR REPLACE FUNCTION populate_stage_tasks()
RETURNS TRIGGER AS $$
BEGIN
  -- When stage changes, add tasks for the new stage (if they don't already exist)
  IF OLD.stage IS DISTINCT FROM NEW.stage THEN
    INSERT INTO opportunity_stage_tasks (opportunity_id, stage, task_text, is_required, display_order)
    SELECT NEW.id, t.stage, t.task_text, t.is_required, t.display_order
    FROM opportunity_stage_task_templates t
    WHERE t.stage = NEW.stage AND t.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM opportunity_stage_tasks s
      WHERE s.opportunity_id = NEW.id AND s.stage = NEW.stage AND s.task_text = t.task_text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_populate_stage_tasks ON opportunities;
CREATE TRIGGER trigger_populate_stage_tasks
  AFTER UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION populate_stage_tasks();

-- Also populate on insert for new opportunities
CREATE OR REPLACE FUNCTION populate_initial_stage_tasks()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO opportunity_stage_tasks (opportunity_id, stage, task_text, is_required, display_order)
  SELECT NEW.id, t.stage, t.task_text, t.is_required, t.display_order
  FROM opportunity_stage_task_templates t
  WHERE t.stage = COALESCE(NEW.stage, 'Prospecting') AND t.is_active = true;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_populate_initial_tasks ON opportunities;
CREATE TRIGGER trigger_populate_initial_tasks
  AFTER INSERT ON opportunities
  FOR EACH ROW EXECUTE FUNCTION populate_initial_stage_tasks();
