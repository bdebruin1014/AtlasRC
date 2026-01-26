-- ============================================================================
-- ATLAS PROJECT MODULES - Complete Schema
-- Run this in Supabase SQL Editor to enable all project features
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROJECT LOANS
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  loan_type TEXT NOT NULL CHECK (loan_type IN ('construction', 'acquisition', 'bridge', 'permanent', 'mezzanine', 'other')),
  lender_name TEXT NOT NULL,
  loan_amount DECIMAL(14,2) NOT NULL,
  interest_rate DECIMAL(5,3),
  term_months INTEGER,
  origination_date DATE,
  maturity_date DATE,
  loan_to_value DECIMAL(5,2),
  loan_to_cost DECIMAL(5,2),
  retainage_percentage DECIMAL(5,2) DEFAULT 5,
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'paid_off', 'defaulted')),
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_loans_project ON project_loans(project_id);

-- ============================================================================
-- DRAW REQUESTS (AIA G702/G703 Standard)
-- ============================================================================
CREATE TABLE IF NOT EXISTS draw_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  loan_id UUID REFERENCES project_loans(id) ON DELETE SET NULL,
  draw_number INTEGER NOT NULL,
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  period_start DATE,
  period_end DATE,
  submitted_date TIMESTAMPTZ,
  approved_date TIMESTAMPTZ,
  funded_date TIMESTAMPTZ,
  requested_amount DECIMAL(14,2) NOT NULL,
  approved_amount DECIMAL(14,2),
  funded_amount DECIMAL(14,2),
  retainage_percentage DECIMAL(5,2) DEFAULT 5,
  retainage_amount DECIMAL(14,2),
  net_amount DECIMAL(14,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'requested', 'under_review', 'approved', 'denied', 'funded')),
  inspector_name TEXT,
  inspection_date DATE,
  inspection_notes TEXT,
  denial_reason TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, draw_number)
);

CREATE INDEX IF NOT EXISTS idx_draw_requests_project ON draw_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_draw_requests_status ON draw_requests(status);

-- Draw Request Line Items (AIA G703 - Schedule of Values)
CREATE TABLE IF NOT EXISTS draw_request_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_request_id UUID NOT NULL REFERENCES draw_requests(id) ON DELETE CASCADE,
  budget_item_id UUID,
  cost_code TEXT,
  description TEXT NOT NULL,
  scheduled_value DECIMAL(14,2) DEFAULT 0,
  previous_applications DECIMAL(14,2) DEFAULT 0,
  current_request DECIMAL(14,2) DEFAULT 0,
  approved_amount DECIMAL(14,2),
  materials_stored DECIMAL(14,2) DEFAULT 0,
  total_completed DECIMAL(14,2) DEFAULT 0,
  percent_complete DECIMAL(5,2) DEFAULT 0,
  balance_to_finish DECIMAL(14,2) DEFAULT 0,
  retainage DECIMAL(14,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_draw_request_items_draw ON draw_request_items(draw_request_id);

-- Draw Request Documents
CREATE TABLE IF NOT EXISTS draw_request_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_request_id UUID NOT NULL REFERENCES draw_requests(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('invoice', 'lien_waiver', 'inspection_report', 'photo', 'aia_g702', 'aia_g703', 'other')),
  file_name TEXT NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CHANGE ORDERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS change_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  contract_id UUID,
  change_order_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  reason TEXT CHECK (reason IN ('owner_request', 'design_change', 'field_condition', 'code_requirement', 'value_engineering', 'error_omission', 'other')),
  requested_by TEXT,
  requested_date DATE DEFAULT CURRENT_DATE,
  cost_impact DECIMAL(14,2) DEFAULT 0,
  schedule_impact_days INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'void')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  submitted_date TIMESTAMPTZ,
  reviewed_date TIMESTAMPTZ,
  approved_date TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  approval_notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_change_orders_project ON change_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_change_orders_status ON change_orders(status);

-- Change Order Line Items
CREATE TABLE IF NOT EXISTS change_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  change_order_id UUID NOT NULL REFERENCES change_orders(id) ON DELETE CASCADE,
  cost_code TEXT,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit TEXT DEFAULT 'LS',
  unit_cost DECIMAL(14,2) DEFAULT 0,
  total_cost DECIMAL(14,2) DEFAULT 0,
  markup_percentage DECIMAL(5,2) DEFAULT 0,
  markup_amount DECIMAL(14,2) DEFAULT 0,
  extended_cost DECIMAL(14,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PERMITS & INSPECTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_permits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  permit_type TEXT NOT NULL CHECK (permit_type IN ('building', 'grading', 'electrical', 'plumbing', 'mechanical', 'fire', 'demolition', 'zoning', 'environmental', 'other')),
  permit_number TEXT,
  description TEXT,
  issuing_authority TEXT,
  application_date DATE,
  issued_date DATE,
  expiration_date DATE,
  fee_amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('not_started', 'pending', 'submitted', 'in_review', 'approved', 'issued', 'expired', 'rejected')),
  file_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_permits_project ON project_permits(project_id);
CREATE INDEX IF NOT EXISTS idx_project_permits_status ON project_permits(status);

-- Permit Inspections
CREATE TABLE IF NOT EXISTS permit_inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  permit_id UUID NOT NULL REFERENCES project_permits(id) ON DELETE CASCADE,
  inspection_type TEXT NOT NULL,
  scheduled_date DATE,
  completed_date DATE,
  inspector_name TEXT,
  result TEXT CHECK (result IN ('pending', 'passed', 'failed', 'partial', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- BIDS & CONTRACTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  bid_package_name TEXT NOT NULL,
  scope_of_work TEXT,
  trade_category TEXT,
  vendor_id UUID REFERENCES contacts(id),
  vendor_name TEXT,
  bid_amount DECIMAL(14,2),
  bid_date DATE,
  valid_until DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('draft', 'sent', 'pending', 'received', 'under_review', 'selected', 'rejected', 'expired')),
  is_selected BOOLEAN DEFAULT false,
  selection_reason TEXT,
  submitted_by UUID REFERENCES profiles(id),
  reviewed_by UUID REFERENCES profiles(id),
  review_notes TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_bids_project ON project_bids(project_id);
CREATE INDEX IF NOT EXISTS idx_project_bids_status ON project_bids(status);

-- Bid Items (Line-item breakdown)
CREATE TABLE IF NOT EXISTS bid_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bid_id UUID NOT NULL REFERENCES project_bids(id) ON DELETE CASCADE,
  cost_code TEXT,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2),
  unit TEXT,
  unit_price DECIMAL(14,2),
  total_price DECIMAL(14,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- BUDGET & EXPENSES
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Main Budget',
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'locked')),
  total_budget DECIMAL(14,2) DEFAULT 0,
  contingency_percentage DECIMAL(5,2) DEFAULT 5,
  approved_date TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_budgets_project ON project_budgets(project_id);

-- Budget Line Items
CREATE TABLE IF NOT EXISTS budget_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id UUID NOT NULL REFERENCES project_budgets(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES budget_items(id) ON DELETE CASCADE,
  cost_code TEXT,
  category TEXT,
  description TEXT NOT NULL,
  budgeted_amount DECIMAL(14,2) DEFAULT 0,
  committed_amount DECIMAL(14,2) DEFAULT 0,
  actual_amount DECIMAL(14,2) DEFAULT 0,
  variance DECIMAL(14,2) DEFAULT 0,
  percent_complete DECIMAL(5,2) DEFAULT 0,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_budget_items_budget ON budget_items(budget_id);

-- Project Expenses
CREATE TABLE IF NOT EXISTS project_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  budget_item_id UUID REFERENCES budget_items(id) ON DELETE SET NULL,
  vendor_id UUID REFERENCES contacts(id),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  category TEXT,
  cost_code TEXT,
  amount DECIMAL(14,2) NOT NULL,
  payment_method TEXT,
  invoice_number TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  receipt_url TEXT,
  notes TEXT,
  submitted_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_expenses_project ON project_expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_project_expenses_date ON project_expenses(expense_date);

-- ============================================================================
-- REVENUE & SALES
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_revenue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  unit_id UUID,
  revenue_type TEXT CHECK (revenue_type IN ('lot_sale', 'home_sale', 'rental_income', 'other')),
  description TEXT,
  buyer_name TEXT,
  contract_date DATE,
  closing_date DATE,
  contract_price DECIMAL(14,2),
  closing_price DECIMAL(14,2),
  commission_rate DECIMAL(5,2),
  commission_amount DECIMAL(14,2),
  closing_costs DECIMAL(14,2),
  net_proceeds DECIMAL(14,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_contract', 'closed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_revenue_project ON project_revenue(project_id);

-- ============================================================================
-- CASHFLOW PROJECTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_cashflow (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  period_date DATE NOT NULL,
  period_type TEXT DEFAULT 'month' CHECK (period_type IN ('week', 'month', 'quarter')),
  projected_inflows DECIMAL(14,2) DEFAULT 0,
  actual_inflows DECIMAL(14,2) DEFAULT 0,
  projected_outflows DECIMAL(14,2) DEFAULT 0,
  actual_outflows DECIMAL(14,2) DEFAULT 0,
  projected_balance DECIMAL(14,2) DEFAULT 0,
  actual_balance DECIMAL(14,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_cashflow_project ON project_cashflow(project_id);
CREATE INDEX IF NOT EXISTS idx_project_cashflow_date ON project_cashflow(period_date);

-- ============================================================================
-- SCHEDULE & MILESTONES
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Master Schedule',
  template_id UUID,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'on_hold')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedule Tasks/Activities
CREATE TABLE IF NOT EXISTS schedule_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID NOT NULL REFERENCES project_schedules(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES schedule_tasks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  duration_days INTEGER,
  percent_complete DECIMAL(5,2) DEFAULT 0,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'delayed', 'blocked')),
  assigned_to UUID REFERENCES profiles(id),
  predecessors TEXT[],
  is_milestone BOOLEAN DEFAULT false,
  is_critical_path BOOLEAN DEFAULT false,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schedule_tasks_schedule ON schedule_tasks(schedule_id);

-- ============================================================================
-- PROFORMA
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_proforma (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  template_id UUID,
  name TEXT NOT NULL DEFAULT 'Project Proforma',
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'final')),
  -- Land Costs
  land_acquisition DECIMAL(14,2) DEFAULT 0,
  closing_costs DECIMAL(14,2) DEFAULT 0,
  -- Development Costs
  site_work DECIMAL(14,2) DEFAULT 0,
  hard_costs DECIMAL(14,2) DEFAULT 0,
  soft_costs DECIMAL(14,2) DEFAULT 0,
  contingency DECIMAL(14,2) DEFAULT 0,
  -- Financing
  loan_amount DECIMAL(14,2) DEFAULT 0,
  interest_reserve DECIMAL(14,2) DEFAULT 0,
  loan_fees DECIMAL(14,2) DEFAULT 0,
  -- Revenue
  total_revenue DECIMAL(14,2) DEFAULT 0,
  -- Calculated
  total_cost DECIMAL(14,2) DEFAULT 0,
  gross_profit DECIMAL(14,2) DEFAULT 0,
  profit_margin DECIMAL(5,2) DEFAULT 0,
  roi DECIMAL(5,2) DEFAULT 0,
  irr DECIMAL(5,2),
  equity_multiple DECIMAL(5,2),
  notes TEXT,
  approved_by UUID REFERENCES profiles(id),
  approved_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_proforma_project ON project_proforma(project_id);

-- ============================================================================
-- PROJECT PROPERTIES (Multi-parcel support)
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  county TEXT,
  parcel_id TEXT,
  lot_number TEXT,
  acreage DECIMAL(10,4),
  zoning TEXT,
  land_use TEXT,
  acquisition_price DECIMAL(14,2),
  acquisition_date DATE,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_properties_project ON project_properties(project_id);

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================
ALTER TABLE project_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_request_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE permit_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE bid_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_cashflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_proforma ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_properties ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - Allow authenticated users full access
-- ============================================================================
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'project_loans', 'draw_requests', 'draw_request_items', 'draw_request_documents',
    'change_orders', 'change_order_items', 'project_permits', 'permit_inspections',
    'project_bids', 'bid_items', 'project_budgets', 'budget_items', 'project_expenses',
    'project_revenue', 'project_cashflow', 'project_schedules', 'schedule_tasks',
    'project_proforma', 'project_properties'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "auth_%s" ON %I', tbl, tbl);
    EXECUTE format('CREATE POLICY "auth_%s" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)', tbl, tbl);
    EXECUTE format('GRANT ALL ON %I TO authenticated', tbl);
  END LOOP;
END $$;

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'project_loans', 'draw_requests', 'change_orders', 'project_permits',
    'project_bids', 'project_budgets', 'budget_items', 'project_expenses',
    'project_revenue', 'project_schedules', 'schedule_tasks', 'project_proforma',
    'project_properties'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON %I', tbl, tbl);
    EXECUTE format('CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', tbl, tbl);
  END LOOP;
END $$;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
SELECT 'Project modules schema created successfully!' as result;
