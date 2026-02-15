-- ============================================================================
-- CONSTRUCTION MANAGEMENT MODULE
-- Migration: 20260215_construction_management.sql
-- Tracks individual houses from pre-contract through completion
-- ============================================================================

-- CONSTRUCTION HOUSES (core table — one row per house)
CREATE TABLE IF NOT EXISTS construction_houses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Identity
  house_name TEXT NOT NULL,                    -- e.g. "Lot 14 - Magnolia Plan"
  house_number TEXT,                           -- e.g. "14", "A-3"
  address TEXT,
  city TEXT DEFAULT 'Greenville',
  state TEXT DEFAULT 'SC',
  zip_code TEXT,
  -- Relationships
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  plan_id UUID,                                -- references admin floor plan
  entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,  -- Red Cedar Homes entity
  -- Milestone tracking
  current_milestone TEXT NOT NULL DEFAULT 'pre_contract' CHECK (
    current_milestone IN ('pre_contract', 'permitting', 'mobilized', 'foundation', 'framing', 'sheetrock', 'co', 'warranty', 'complete')
  ),
  -- Key dates
  contract_date DATE,
  permit_submitted_date DATE,
  permit_approved_date DATE,
  mobilization_date DATE,
  foundation_date DATE,
  framing_date DATE,
  sheetrock_date DATE,
  co_date DATE,
  warranty_start_date DATE,
  warranty_end_date DATE,
  completion_date DATE,
  -- Financials
  contract_price DECIMAL(12,2),
  estimated_cost DECIMAL(12,2),
  actual_cost DECIMAL(12,2) DEFAULT 0,
  -- Buyer info
  buyer_name TEXT,
  buyer_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_hold', 'cancelled', 'complete')),
  notes TEXT,
  -- Plan details
  plan_name TEXT,
  plan_sqft INTEGER,
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  garage_spaces INTEGER DEFAULT 2,
  lot_premium DECIMAL(12,2) DEFAULT 0,
  upgrade_total DECIMAL(12,2) DEFAULT 0,
  -- Meta
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_construction_houses_project ON construction_houses(project_id);
CREATE INDEX IF NOT EXISTS idx_construction_houses_milestone ON construction_houses(current_milestone);
CREATE INDEX IF NOT EXISTS idx_construction_houses_status ON construction_houses(status);
CREATE INDEX IF NOT EXISTS idx_construction_houses_entity ON construction_houses(entity_id);

-- CONSTRUCTION MILESTONE LOG (audit trail of milestone changes)
CREATE TABLE IF NOT EXISTS construction_milestone_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  house_id UUID NOT NULL REFERENCES construction_houses(id) ON DELETE CASCADE,
  milestone TEXT NOT NULL CHECK (
    milestone IN ('pre_contract', 'permitting', 'mobilized', 'foundation', 'framing', 'sheetrock', 'co', 'warranty', 'complete')
  ),
  previous_milestone TEXT,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  milestone_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_milestone_log_house ON construction_milestone_log(house_id);
CREATE INDEX IF NOT EXISTS idx_milestone_log_milestone ON construction_milestone_log(milestone);

-- CONSTRUCTION DAILY LOGS
CREATE TABLE IF NOT EXISTS construction_daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  house_id UUID NOT NULL REFERENCES construction_houses(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  weather TEXT,
  temperature_high INTEGER,
  temperature_low INTEGER,
  crew_count INTEGER,
  work_performed TEXT,
  materials_delivered TEXT,
  issues TEXT,
  safety_incidents TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  logged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_logs_house ON construction_daily_logs(house_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON construction_daily_logs(log_date DESC);

-- CONSTRUCTION PURCHASE ORDERS (renamed from Bids)
CREATE TABLE IF NOT EXISTS construction_purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  house_id UUID NOT NULL REFERENCES construction_houses(id) ON DELETE CASCADE,
  po_number TEXT NOT NULL,
  vendor_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  vendor_name TEXT,
  description TEXT NOT NULL,
  category TEXT,                              -- e.g. "Framing", "Plumbing", "Electrical"
  amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'in_progress', 'complete', 'cancelled')),
  issued_date DATE,
  due_date DATE,
  completed_date DATE,
  notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_house ON construction_purchase_orders(house_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor ON construction_purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON construction_purchase_orders(status);

-- CONSTRUCTION INSPECTIONS
CREATE TABLE IF NOT EXISTS construction_inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  house_id UUID NOT NULL REFERENCES construction_houses(id) ON DELETE CASCADE,
  inspection_type TEXT NOT NULL,              -- e.g. "Foundation", "Framing", "Final", "Rough-in"
  inspector_name TEXT,
  inspector_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  scheduled_date DATE,
  completed_date DATE,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'passed', 'failed', 'conditional', 'cancelled')),
  result_notes TEXT,
  deficiencies JSONB DEFAULT '[]'::jsonb,
  photos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inspections_house ON construction_inspections(house_id);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON construction_inspections(status);

-- CONSTRUCTION WARRANTY ITEMS
CREATE TABLE IF NOT EXISTS construction_warranty_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  house_id UUID NOT NULL REFERENCES construction_houses(id) ON DELETE CASCADE,
  reported_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT,                              -- e.g. "Plumbing", "HVAC", "Structural"
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'reported' CHECK (status IN ('reported', 'scheduled', 'in_progress', 'complete', 'denied')),
  assigned_vendor_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  scheduled_date DATE,
  completed_date DATE,
  resolution_notes TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  cost DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_warranty_items_house ON construction_warranty_items(house_id);
CREATE INDEX IF NOT EXISTS idx_warranty_items_status ON construction_warranty_items(status);

-- Enable RLS on all new tables
ALTER TABLE construction_houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_milestone_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_warranty_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies (same pattern as other Atlas tables — all authenticated users have full access)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Authenticated users can manage construction_houses" ON construction_houses;
  CREATE POLICY "Authenticated users can manage construction_houses"
    ON construction_houses FOR ALL TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Authenticated users can manage construction_milestone_log" ON construction_milestone_log;
  CREATE POLICY "Authenticated users can manage construction_milestone_log"
    ON construction_milestone_log FOR ALL TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Authenticated users can manage construction_daily_logs" ON construction_daily_logs;
  CREATE POLICY "Authenticated users can manage construction_daily_logs"
    ON construction_daily_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Authenticated users can manage construction_purchase_orders" ON construction_purchase_orders;
  CREATE POLICY "Authenticated users can manage construction_purchase_orders"
    ON construction_purchase_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Authenticated users can manage construction_inspections" ON construction_inspections;
  CREATE POLICY "Authenticated users can manage construction_inspections"
    ON construction_inspections FOR ALL TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Authenticated users can manage construction_warranty_items" ON construction_warranty_items;
  CREATE POLICY "Authenticated users can manage construction_warranty_items"
    ON construction_warranty_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
END $$;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_construction_houses_updated_at ON construction_houses;
CREATE TRIGGER update_construction_houses_updated_at BEFORE UPDATE ON construction_houses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_construction_daily_logs_updated_at ON construction_daily_logs;
CREATE TRIGGER update_construction_daily_logs_updated_at BEFORE UPDATE ON construction_daily_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_construction_purchase_orders_updated_at ON construction_purchase_orders;
CREATE TRIGGER update_construction_purchase_orders_updated_at BEFORE UPDATE ON construction_purchase_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_construction_inspections_updated_at ON construction_inspections;
CREATE TRIGGER update_construction_inspections_updated_at BEFORE UPDATE ON construction_inspections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_construction_warranty_items_updated_at ON construction_warranty_items;
CREATE TRIGGER update_construction_warranty_items_updated_at BEFORE UPDATE ON construction_warranty_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-log milestone changes
CREATE OR REPLACE FUNCTION log_milestone_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.current_milestone IS DISTINCT FROM NEW.current_milestone THEN
    INSERT INTO construction_milestone_log (house_id, milestone, previous_milestone, milestone_date)
    VALUES (NEW.id, NEW.current_milestone, OLD.current_milestone, CURRENT_DATE);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_milestone_change ON construction_houses;
CREATE TRIGGER trigger_log_milestone_change
  AFTER UPDATE ON construction_houses
  FOR EACH ROW EXECUTE FUNCTION log_milestone_change();

-- Seed data: a few sample houses
INSERT INTO construction_houses (house_name, house_number, address, city, state, current_milestone, plan_name, plan_sqft, bedrooms, bathrooms, contract_price, estimated_cost, status)
VALUES
  ('Lot 1 - Magnolia', '1', '101 Magnolia Way', 'Greenville', 'SC', 'framing', 'Magnolia', 2400, 4, 2.5, 425000, 310000, 'active'),
  ('Lot 2 - Dogwood', '2', '102 Magnolia Way', 'Greenville', 'SC', 'foundation', 'Dogwood', 1800, 3, 2.0, 375000, 275000, 'active'),
  ('Lot 3 - Palmetto', '3', '103 Magnolia Way', 'Greenville', 'SC', 'permitting', 'Palmetto', 2100, 3, 2.5, 395000, 290000, 'active'),
  ('Lot 4 - Atlas', '4', '104 Magnolia Way', 'Greenville', 'SC', 'pre_contract', 'Atlas', 2800, 4, 3.0, 475000, 350000, 'active'),
  ('Lot 5 - Juniper', '5', '105 Magnolia Way', 'Greenville', 'SC', 'sheetrock', 'Juniper', 2200, 3, 2.5, 410000, 300000, 'active'),
  ('Lot 6 - Magnolia', '6', '106 Magnolia Way', 'Greenville', 'SC', 'co', 'Magnolia', 2400, 4, 2.5, 430000, 315000, 'active'),
  ('Lot 7 - Dogwood', '7', '107 Magnolia Way', 'Greenville', 'SC', 'warranty', 'Dogwood', 1800, 3, 2.0, 380000, 278000, 'active'),
  ('Lot 8 - Palmetto', '8', '108 Magnolia Way', 'Greenville', 'SC', 'complete', 'Palmetto', 2100, 3, 2.5, 400000, 292000, 'complete')
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT ALL ON construction_houses TO authenticated;
GRANT ALL ON construction_milestone_log TO authenticated;
GRANT ALL ON construction_daily_logs TO authenticated;
GRANT ALL ON construction_purchase_orders TO authenticated;
GRANT ALL ON construction_inspections TO authenticated;
GRANT ALL ON construction_warranty_items TO authenticated;
