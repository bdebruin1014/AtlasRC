-- ============================================================================
-- PROJECT DUE DILIGENCE ITEMS
-- Persistent checklist for project acquisition due diligence
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_dd_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN (
    'title_legal', 'survey_environmental', 'zoning_permitting', 'utilities_infrastructure', 'physical_site'
  )),
  item_text TEXT NOT NULL,
  is_complete BOOLEAN DEFAULT false,
  is_required BOOLEAN DEFAULT false,
  completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  due_date DATE,
  responsible_party TEXT,
  notes TEXT,
  document_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pdd_project ON project_dd_items(project_id);
CREATE INDEX IF NOT EXISTS idx_pdd_category ON project_dd_items(category);
ALTER TABLE project_dd_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage project_dd_items"
  ON project_dd_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
GRANT ALL ON project_dd_items TO authenticated;
-- DD Item Templates (auto-populated when project enters Due Diligence)
CREATE TABLE IF NOT EXISTS project_dd_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  item_text TEXT NOT NULL,
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);
ALTER TABLE project_dd_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage project_dd_templates"
  ON project_dd_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);
GRANT ALL ON project_dd_templates TO authenticated;
-- Seed DD templates
INSERT INTO project_dd_templates (category, item_text, is_required, display_order) VALUES
  -- TITLE & LEGAL
  ('title_legal', 'Title search ordered', true, 1),
  ('title_legal', 'Title commitment received', true, 2),
  ('title_legal', 'Liens/encumbrances reviewed', true, 3),
  ('title_legal', 'Legal description verified', false, 4),
  ('title_legal', 'Easements reviewed', false, 5),
  ('title_legal', 'HOA docs reviewed (if applicable)', false, 6),
  -- SURVEY & ENVIRONMENTAL
  ('survey_environmental', 'Survey ordered', true, 1),
  ('survey_environmental', 'Survey received and reviewed', true, 2),
  ('survey_environmental', 'Environmental Phase 1 ordered (if needed)', false, 3),
  ('survey_environmental', 'Soil test / geotech ordered', false, 4),
  ('survey_environmental', 'Wetlands delineation (if applicable)', false, 5),
  ('survey_environmental', 'Perc test completed (if septic)', false, 6),
  -- ZONING & PERMITTING
  ('zoning_permitting', 'Zoning designation verified', true, 1),
  ('zoning_permitting', 'Setbacks confirmed (front/side/rear)', true, 2),
  ('zoning_permitting', 'Building height limits confirmed', false, 3),
  ('zoning_permitting', 'Max lot coverage / impervious confirmed', false, 4),
  ('zoning_permitting', 'Variance or rezoning needed assessment', false, 5),
  ('zoning_permitting', 'Preliminary plan reviewed by municipality', false, 6),
  ('zoning_permitting', 'Impact fees researched', false, 7),
  -- UTILITIES & INFRASTRUCTURE
  ('utilities_infrastructure', 'Water availability confirmed', true, 1),
  ('utilities_infrastructure', 'Sewer availability confirmed', true, 2),
  ('utilities_infrastructure', 'Electric service confirmed', true, 3),
  ('utilities_infrastructure', 'Gas service confirmed', false, 4),
  ('utilities_infrastructure', 'Stormwater management requirements', false, 5),
  ('utilities_infrastructure', 'Tap fees researched', false, 6),
  -- PHYSICAL / SITE
  ('physical_site', 'Site visit completed', true, 1),
  ('physical_site', 'Photos taken and uploaded', false, 2),
  ('physical_site', 'Adjacent properties reviewed', false, 3),
  ('physical_site', 'Traffic / access assessment', false, 4),
  ('physical_site', 'Demolition assessment (if applicable)', false, 5),
  ('physical_site', 'Tree removal assessment', false, 6)
ON CONFLICT DO NOTHING;
-- Trigger: updated_at
DROP TRIGGER IF EXISTS update_project_dd_items_updated_at ON project_dd_items;
CREATE TRIGGER update_project_dd_items_updated_at BEFORE UPDATE ON project_dd_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
