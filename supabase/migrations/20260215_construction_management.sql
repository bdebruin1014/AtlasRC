-- ============================================================================
-- CONSTRUCTION MANAGEMENT MODULE (V2 — Spec Homebuilding)
-- Migration: 20260215_construction_management.sql
-- Tracks individual houses from pre-contract through completion
-- Budget = contractor scope (cost to build), NOT sale price
-- ============================================================================

-- CONSTRUCTION HOUSES (core table — one row per house)
CREATE TABLE IF NOT EXISTS construction_houses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity
  house_name TEXT NOT NULL,                    -- e.g. "Lot 14 - Magnolia A"
  house_number TEXT,                           -- Lot number: "14", "A-3"
  address TEXT,
  city TEXT DEFAULT 'Greenville',
  state TEXT DEFAULT 'SC',
  zip_code TEXT,
  county TEXT,
  subdivision TEXT,                            -- e.g. "Ambleside Phase 1"

  -- Relationships
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,  -- Red Cedar Homes

  -- Plan & Configuration (the spec builder's core decisions)
  plan_id UUID,                                -- FK to floor_plans library
  plan_name TEXT,                              -- denormalized: "Magnolia"
  elevation TEXT,                              -- e.g. "A", "B", "C", "Craftsman", "Farmhouse"
  plan_sqft INTEGER,
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  garage_spaces INTEGER DEFAULT 2,
  stories INTEGER DEFAULT 1,

  -- Upgrade & Selections
  upgrade_package TEXT,                        -- e.g. "Standard", "Classic", "Elegance"
  upgrade_package_id UUID,                     -- FK to upgrade packages if exists
  color_selections JSONB DEFAULT '{}'::jsonb,  -- e.g. {"exterior_siding": "SW Dovetail", "interior_walls": "SW Agreeable Gray", "cabinets": "White Shaker", "countertops": "Level 3 Granite", "flooring_main": "LVP - Aged Hickory", "tile_primary_bath": "Carrara Hex", ...}

  -- Lot Details
  lot_size_acres DECIMAL(6,3),
  lot_premium DECIMAL(12,2) DEFAULT 0,        -- extra cost for premium lot (view, corner, etc.)
  lot_cost DECIMAL(12,2) DEFAULT 0,           -- what was paid FOR the lot (land acquisition)

  -- Milestone Tracking (9 milestones)
  current_milestone TEXT NOT NULL DEFAULT 'pre_contract' CHECK (
    current_milestone IN ('pre_contract', 'permitting', 'mobilized', 'foundation', 'framing', 'sheetrock', 'co', 'warranty', 'complete')
  ),

  -- Key Dates
  contract_date DATE,                          -- when construction contract signed (builder ↔ entity)
  permit_submitted_date DATE,
  permit_approved_date DATE,
  permit_number TEXT,
  mobilization_date DATE,
  foundation_pour_date DATE,
  framing_start_date DATE,
  framing_complete_date DATE,
  sheetrock_start_date DATE,
  sheetrock_complete_date DATE,
  co_date DATE,
  closing_date DATE,                           -- buyer closing (triggers warranty start)
  warranty_start_date DATE,
  warranty_end_date DATE,                      -- typically closing_date + 1 year
  completion_date DATE,

  -- Budget (CONTRACTOR SCOPE — cost to build, not sale price)
  base_build_cost DECIMAL(12,2) DEFAULT 0,     -- from plan sticks & bricks template
  lot_prep_cost DECIMAL(12,2) DEFAULT 0,       -- site work, clearing, grading
  soft_costs DECIMAL(12,2) DEFAULT 0,          -- permits, engineering, survey, insurance
  upgrade_cost DECIMAL(12,2) DEFAULT 0,        -- delta over standard package
  total_budget DECIMAL(12,2) GENERATED ALWAYS AS (
    base_build_cost + lot_prep_cost + soft_costs + upgrade_cost + lot_premium
  ) STORED,
  actual_cost DECIMAL(12,2) DEFAULT 0,         -- sum of POs paid
  change_order_total DECIMAL(12,2) DEFAULT 0,  -- running total of approved COs

  -- Buyer info (populated when sold, NOT relevant to construction budget)
  buyer_name TEXT,
  buyer_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  buyer_agent TEXT,
  sale_price DECIMAL(12,2),                    -- tracked here for reference but NOT used in construction budget

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_hold', 'cancelled', 'complete')),
  notes TEXT,

  -- Municipality (for fee lookups)
  municipality TEXT,                           -- e.g. "City of Greenville", "Greenville County", "City of Greer"

  -- Meta
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ch_project ON construction_houses(project_id);
CREATE INDEX IF NOT EXISTS idx_ch_milestone ON construction_houses(current_milestone);
CREATE INDEX IF NOT EXISTS idx_ch_status ON construction_houses(status);
CREATE INDEX IF NOT EXISTS idx_ch_entity ON construction_houses(entity_id);
CREATE INDEX IF NOT EXISTS idx_ch_plan ON construction_houses(plan_id);

-- ============================================================================
-- CONSTRUCTION BUDGET LINE ITEMS (per-house, from plan template)
-- These are the sticks & bricks scope items, one row per trade/scope
-- ============================================================================

CREATE TABLE IF NOT EXISTS construction_budget_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  house_id UUID NOT NULL REFERENCES construction_houses(id) ON DELETE CASCADE,

  -- Scope item
  category TEXT NOT NULL,                      -- "Site Work", "Foundation", "Framing", "Plumbing", etc.
  subcategory TEXT,                            -- "Rough-In", "Finish", "Labor", "Material"
  description TEXT NOT NULL,                   -- "Framing Labor - 2,400 sqft Magnolia"
  cost_code TEXT,                              -- optional: "03-100", "04-200" (CSI or custom)
  display_order INTEGER DEFAULT 0,

  -- Amounts
  budgeted_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  committed_amount DECIMAL(12,2) DEFAULT 0,    -- POs issued
  actual_amount DECIMAL(12,2) DEFAULT 0,       -- POs paid/invoiced
  variance DECIMAL(12,2) GENERATED ALWAYS AS (budgeted_amount - actual_amount) STORED,

  -- Vendor assignment
  vendor_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  vendor_name TEXT,

  -- PO tracking
  po_id UUID,                                  -- link to construction_purchase_orders
  po_number TEXT,
  po_status TEXT,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'committed', 'in_progress', 'complete', 'over_budget')),
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cbi_house ON construction_budget_items(house_id);
CREATE INDEX IF NOT EXISTS idx_cbi_category ON construction_budget_items(category);
CREATE INDEX IF NOT EXISTS idx_cbi_vendor ON construction_budget_items(vendor_id);

-- ============================================================================
-- CONSTRUCTION MILESTONE LOG (audit trail)
-- ============================================================================

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

CREATE INDEX IF NOT EXISTS idx_ml_house ON construction_milestone_log(house_id);

-- ============================================================================
-- CONSTRUCTION DAILY LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS construction_daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  house_id UUID NOT NULL REFERENCES construction_houses(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  weather TEXT,                                -- "Sunny", "Rain", "Cloudy"
  temperature_high INTEGER,
  temperature_low INTEGER,
  wind TEXT,                                   -- "Calm", "10-20 mph"
  crew_count INTEGER,
  trades_on_site TEXT[],                       -- ["Framing", "Plumbing", "Electrical"]
  work_performed TEXT,
  materials_delivered TEXT,
  issues TEXT,
  delays TEXT,                                 -- weather delays, material delays, etc.
  safety_incidents TEXT,
  visitors TEXT,                               -- inspector visits, owner visits
  photos JSONB DEFAULT '[]'::jsonb,
  logged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dl_house ON construction_daily_logs(house_id);
CREATE INDEX IF NOT EXISTS idx_dl_date ON construction_daily_logs(log_date DESC);

-- ============================================================================
-- CONSTRUCTION PURCHASE ORDERS
-- Each PO = one scope of work to one sub/vendor for one house
-- ============================================================================

CREATE TABLE IF NOT EXISTS construction_purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  house_id UUID NOT NULL REFERENCES construction_houses(id) ON DELETE CASCADE,
  budget_item_id UUID REFERENCES construction_budget_items(id) ON DELETE SET NULL,

  po_number TEXT NOT NULL,
  vendor_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  vendor_name TEXT,
  scope_description TEXT NOT NULL,             -- "Framing Labor & Material - Lot 14 Magnolia"
  category TEXT,                               -- matches budget category

  -- Amounts
  amount DECIMAL(12,2) NOT NULL,
  amount_paid DECIMAL(12,2) DEFAULT 0,
  retention_pct DECIMAL(5,2) DEFAULT 0,        -- % held back until completion
  retention_amount DECIMAL(12,2) DEFAULT 0,

  -- Payment schedule
  payment_terms TEXT DEFAULT 'completion',      -- "50/50", "completion", "draw-based", "progress"
  draws JSONB DEFAULT '[]'::jsonb,             -- [{"draw_number": 1, "amount": 5000, "paid": true, "paid_date": "2026-02-01"}, ...]

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'in_progress', 'complete', 'cancelled', 'back_charged')),
  issued_date DATE,
  start_date DATE,
  due_date DATE,
  completed_date DATE,

  -- Scope details
  scope_of_work TEXT,                          -- detailed scope document text
  exclusions TEXT,                             -- what's NOT included
  notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,

  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_po_house ON construction_purchase_orders(house_id);
CREATE INDEX IF NOT EXISTS idx_po_vendor ON construction_purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_po_status ON construction_purchase_orders(status);

-- ============================================================================
-- CONSTRUCTION INSPECTIONS
-- Tied to milestone gates — required inspections per jurisdiction
-- ============================================================================

CREATE TABLE IF NOT EXISTS construction_inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  house_id UUID NOT NULL REFERENCES construction_houses(id) ON DELETE CASCADE,

  -- Inspection details
  inspection_type TEXT NOT NULL,               -- "Foundation", "Framing", "Rough-In Plumbing", "Rough-In Electrical", "Rough-In HVAC", "Insulation", "Drywall", "Final", "Final Plumbing", "Final Electrical", "Final HVAC", "Final Building"
  milestone_gate TEXT,                         -- which milestone this inspection gates (e.g. "foundation" gates moving to "framing")
  inspector_name TEXT,
  inspector_agency TEXT,                       -- "City of Greenville Building Dept", "Greenville County"

  -- Scheduling
  requested_date DATE,
  scheduled_date DATE,
  completed_date DATE,

  -- Results
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'passed', 'failed', 'conditional', 'cancelled', 're_inspect')),
  result_notes TEXT,
  deficiencies JSONB DEFAULT '[]'::jsonb,      -- [{"item": "Missing fire blocking at stair", "resolved": false}, ...]
  re_inspection_date DATE,
  re_inspection_passed BOOLEAN,
  photos JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insp_house ON construction_inspections(house_id);
CREATE INDEX IF NOT EXISTS idx_insp_status ON construction_inspections(status);
CREATE INDEX IF NOT EXISTS idx_insp_type ON construction_inspections(inspection_type);

-- ============================================================================
-- CONSTRUCTION WARRANTY ITEMS (per-house, post-closing)
-- 1-year builder warranty standard in SC
-- ============================================================================

CREATE TABLE IF NOT EXISTS construction_warranty_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  house_id UUID NOT NULL REFERENCES construction_houses(id) ON DELETE CASCADE,

  -- Warranty item
  item_number TEXT,                            -- auto-generated: "W-001"
  reported_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reported_by TEXT,                            -- homeowner name or "30-day walkthrough"
  category TEXT,                               -- "Plumbing", "HVAC", "Electrical", "Drywall", "Exterior", "Doors/Windows", "Flooring", "Paint", "Appliances", "Structural", "Grading/Drainage", "Other"
  room_location TEXT,                          -- "Master Bath", "Kitchen", "Garage", etc.
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'emergency')),

  -- Assignment & resolution
  assigned_vendor_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  assigned_vendor_name TEXT,
  status TEXT DEFAULT 'reported' CHECK (status IN ('reported', 'scheduled', 'in_progress', 'complete', 'denied', 'owner_damage')),
  scheduled_date DATE,
  completed_date DATE,
  resolution_notes TEXT,

  -- Cost (builder absorbs or back-charges sub)
  cost DECIMAL(12,2) DEFAULT 0,
  back_charge_vendor_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  back_charge_po_id UUID REFERENCES construction_purchase_orders(id) ON DELETE SET NULL,

  -- Source
  source TEXT DEFAULT 'homeowner' CHECK (source IN ('homeowner', '30_day_walk', '11_month_walk', 'builder_identified', 'other')),
  photos JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wi_house ON construction_warranty_items(house_id);
CREATE INDEX IF NOT EXISTS idx_wi_status ON construction_warranty_items(status);
CREATE INDEX IF NOT EXISTS idx_wi_category ON construction_warranty_items(category);

-- ============================================================================
-- CONSTRUCTION CHANGE ORDERS (per-house)
-- ============================================================================

CREATE TABLE IF NOT EXISTS construction_change_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  house_id UUID NOT NULL REFERENCES construction_houses(id) ON DELETE CASCADE,

  co_number TEXT NOT NULL,                     -- "CO-001"
  description TEXT NOT NULL,
  reason TEXT,                                 -- "Field condition", "Design change", "Owner request", "Code requirement"
  category TEXT,                               -- scope category affected

  -- Amounts
  amount DECIMAL(12,2) NOT NULL,               -- positive = cost increase, negative = credit
  original_budget_item_id UUID REFERENCES construction_budget_items(id),

  -- Approval
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'voided')),
  requested_date DATE DEFAULT CURRENT_DATE,
  approved_date DATE,
  approved_by TEXT,

  -- Impact
  schedule_impact_days INTEGER DEFAULT 0,
  notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,

  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_co_house ON construction_change_orders(house_id);
CREATE INDEX IF NOT EXISTS idx_co_status ON construction_change_orders(status);

-- ============================================================================
-- PUNCH LIST ITEMS (per-house, pre-CO)
-- ============================================================================

CREATE TABLE IF NOT EXISTS construction_punch_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  house_id UUID NOT NULL REFERENCES construction_houses(id) ON DELETE CASCADE,

  item_number TEXT,                            -- "P-001"
  room_location TEXT NOT NULL,                 -- "Kitchen", "Master Bath", "Exterior Front"
  description TEXT NOT NULL,
  category TEXT,                               -- "Paint", "Drywall", "Trim", "Flooring", "Plumbing", "Electrical", "HVAC", "Cleaning", "Exterior", "Landscaping"
  assigned_vendor_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  assigned_vendor_name TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'complete', 'not_applicable')),
  completed_date DATE,
  verified_by TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pi_house ON construction_punch_items(house_id);
CREATE INDEX IF NOT EXISTS idx_pi_status ON construction_punch_items(status);

-- ============================================================================
-- RLS, TRIGGERS, GRANTS
-- ============================================================================

ALTER TABLE construction_houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_milestone_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_warranty_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_punch_items ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['construction_houses', 'construction_budget_items', 'construction_milestone_log', 'construction_daily_logs', 'construction_purchase_orders', 'construction_inspections', 'construction_warranty_items', 'construction_change_orders', 'construction_punch_items']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can manage %I" ON %I', t, t);
    EXECUTE format('CREATE POLICY "Authenticated users can manage %I" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t, t);
    EXECUTE format('GRANT ALL ON %I TO authenticated', t);
  END LOOP;
END $$;

-- updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['construction_houses', 'construction_budget_items', 'construction_daily_logs', 'construction_purchase_orders', 'construction_inspections', 'construction_warranty_items', 'construction_change_orders', 'construction_punch_items']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON %I', t, t);
    EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
  END LOOP;
END $$;

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

-- Auto-generate warranty item numbers
CREATE OR REPLACE FUNCTION generate_warranty_item_number()
RETURNS TRIGGER AS $$
DECLARE next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(REPLACE(item_number, 'W-', '') AS INTEGER)), 0) + 1
  INTO next_num FROM construction_warranty_items WHERE house_id = NEW.house_id;
  NEW.item_number := 'W-' || LPAD(next_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_warranty_item_number ON construction_warranty_items;
CREATE TRIGGER set_warranty_item_number BEFORE INSERT ON construction_warranty_items
  FOR EACH ROW WHEN (NEW.item_number IS NULL)
  EXECUTE FUNCTION generate_warranty_item_number();

-- Auto-generate punch item numbers
CREATE OR REPLACE FUNCTION generate_punch_item_number()
RETURNS TRIGGER AS $$
DECLARE next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(REPLACE(item_number, 'P-', '') AS INTEGER)), 0) + 1
  INTO next_num FROM construction_punch_items WHERE house_id = NEW.house_id;
  NEW.item_number := 'P-' || LPAD(next_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_punch_item_number ON construction_punch_items;
CREATE TRIGGER set_punch_item_number BEFORE INSERT ON construction_punch_items
  FOR EACH ROW WHEN (NEW.item_number IS NULL)
  EXECUTE FUNCTION generate_punch_item_number();

-- ============================================================================
-- SEED DATA — 8 sample houses across milestones
-- ============================================================================

INSERT INTO construction_houses (
  house_name, house_number, address, city, state, county, subdivision,
  current_milestone, plan_name, elevation, plan_sqft, bedrooms, bathrooms, garage_spaces, stories,
  upgrade_package, base_build_cost, lot_prep_cost, soft_costs, upgrade_cost, lot_premium, lot_cost,
  actual_cost, municipality, status
) VALUES
  ('Lot 1 - Magnolia A', '1', '101 Magnolia Way', 'Greenville', 'SC', 'Greenville County', 'Ambleside Phase 1',
   'framing', 'Magnolia', 'A', 2400, 4, 2.5, 2, 2, 'Classic',
   245000, 18000, 22000, 12000, 5000, 62000, 168000, 'City of Greenville', 'active'),

  ('Lot 2 - Dogwood B', '2', '102 Magnolia Way', 'Greenville', 'SC', 'Greenville County', 'Ambleside Phase 1',
   'foundation', 'Dogwood', 'B', 1800, 3, 2.0, 2, 1, 'Standard',
   198000, 15000, 20000, 0, 0, 55000, 42000, 'City of Greenville', 'active'),

  ('Lot 3 - Palmetto A', '3', '103 Magnolia Way', 'Greenville', 'SC', 'Greenville County', 'Ambleside Phase 1',
   'permitting', 'Palmetto', 'A', 2100, 3, 2.5, 2, 2, 'Elegance',
   218000, 16000, 21000, 24000, 3000, 58000, 0, 'City of Greenville', 'active'),

  ('Lot 4 - Atlas C', '4', '104 Magnolia Way', 'Greenville', 'SC', 'Greenville County', 'Ambleside Phase 1',
   'pre_contract', 'Atlas', 'C', 2800, 4, 3.0, 3, 2, 'Classic',
   285000, 20000, 24000, 12000, 8000, 68000, 0, 'City of Greenville', 'active'),

  ('Lot 5 - Juniper A', '5', '105 Magnolia Way', 'Greenville', 'SC', 'Greenville County', 'Ambleside Phase 1',
   'sheetrock', 'Juniper', 'A', 2200, 3, 2.5, 2, 1, 'Standard',
   225000, 17000, 21000, 0, 0, 60000, 212000, 'City of Greenville', 'active'),

  ('Lot 6 - Magnolia B', '6', '106 Magnolia Way', 'Greenville', 'SC', 'Greenville County', 'Ambleside Phase 1',
   'co', 'Magnolia', 'B', 2400, 4, 2.5, 2, 2, 'Elegance',
   248000, 18000, 22000, 24000, 5000, 62000, 308000, 'City of Greenville', 'active'),

  ('Lot 7 - Dogwood A', '7', '107 Magnolia Way', 'Greenville', 'SC', 'Greenville County', 'Ambleside Phase 1',
   'warranty', 'Dogwood', 'A', 1800, 3, 2.0, 2, 1, 'Classic',
   200000, 15000, 20000, 12000, 0, 55000, 244000, 'City of Greenville', 'active'),

  ('Lot 8 - Palmetto B', '8', '108 Magnolia Way', 'Greenville', 'SC', 'Greenville County', 'Ambleside Phase 1',
   'complete', 'Palmetto', 'B', 2100, 3, 2.5, 2, 2, 'Standard',
   220000, 16000, 21000, 0, 0, 58000, 255000, 'City of Greenville', 'complete')
ON CONFLICT DO NOTHING;
