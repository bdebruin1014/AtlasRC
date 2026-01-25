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
-- ============================================
-- BIDS MODULE
-- Bid tracking for contractor and vendor proposals
-- ============================================

-- bids table
CREATE TABLE IF NOT EXISTS bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  -- Bid Info
  bid_type TEXT NOT NULL, -- general_contractor, subcontractor, supplier, professional_services
  scope_category TEXT NOT NULL, -- foundation, framing, roofing, plumbing, electrical, hvac, etc.

  -- Bidder
  bidder_id UUID REFERENCES contacts(id),
  bidder_name TEXT NOT NULL,
  bidder_contact_name TEXT,

  -- Amounts
  bid_amount DECIMAL(12,2) NOT NULL,
  alternate_amount DECIMAL(12,2),

  -- Details
  scope_description TEXT,
  inclusions TEXT,
  exclusions TEXT,
  qualifications TEXT,

  -- Dates
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,

  -- Status
  status TEXT DEFAULT 'submitted', -- submitted, under_review, approved, rejected, expired

  -- Evaluation
  evaluated_by UUID REFERENCES auth.users(id),
  evaluation_notes TEXT,
  score INTEGER, -- 1-100

  -- Award
  awarded BOOLEAN DEFAULT false,
  awarded_date DATE,
  contract_id UUID,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- bid_documents table
CREATE TABLE IF NOT EXISTS bid_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bid_id UUID REFERENCES bids(id) ON DELETE CASCADE,

  document_type TEXT, -- proposal, breakdown, insurance, license, bond, reference, other
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,

  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bids_project ON bids(project_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);
CREATE INDEX IF NOT EXISTS idx_bids_scope ON bids(scope_category);
CREATE INDEX IF NOT EXISTS idx_bids_bidder ON bids(bidder_name);
CREATE INDEX IF NOT EXISTS idx_bids_awarded ON bids(awarded);
CREATE INDEX IF NOT EXISTS idx_bid_documents_bid ON bid_documents(bid_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_bid_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_bid_updated_at
  BEFORE UPDATE ON bids
  FOR EACH ROW
  EXECUTE FUNCTION update_bid_updated_at();
-- ============================================
-- CASH FLOW MODULE
-- Cash flow tracking and projections
-- ============================================

-- cash_flow_records table
CREATE TABLE IF NOT EXISTS cash_flow_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  -- Period
  period_type TEXT DEFAULT 'monthly', -- monthly, weekly
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Starting Position
  beginning_cash DECIMAL(14,2) DEFAULT 0,

  -- Inflows
  loan_draws DECIMAL(14,2) DEFAULT 0,
  equity_contributions DECIMAL(14,2) DEFAULT 0,
  sales_proceeds DECIMAL(14,2) DEFAULT 0,
  rental_income DECIMAL(14,2) DEFAULT 0,
  other_income DECIMAL(14,2) DEFAULT 0,
  total_inflows DECIMAL(14,2) GENERATED ALWAYS AS (
    loan_draws + equity_contributions + sales_proceeds + rental_income + other_income
  ) STORED,

  -- Outflows
  land_payments DECIMAL(14,2) DEFAULT 0,
  hard_cost_payments DECIMAL(14,2) DEFAULT 0,
  soft_cost_payments DECIMAL(14,2) DEFAULT 0,
  interest_payments DECIMAL(14,2) DEFAULT 0,
  loan_fees DECIMAL(14,2) DEFAULT 0,
  distributions DECIMAL(14,2) DEFAULT 0,
  other_expenses DECIMAL(14,2) DEFAULT 0,
  total_outflows DECIMAL(14,2) GENERATED ALWAYS AS (
    land_payments + hard_cost_payments + soft_cost_payments +
    interest_payments + loan_fees + distributions + other_expenses
  ) STORED,

  -- Net Change
  net_cash_flow DECIMAL(14,2) GENERATED ALWAYS AS (
    (loan_draws + equity_contributions + sales_proceeds + rental_income + other_income) -
    (land_payments + hard_cost_payments + soft_cost_payments + interest_payments + loan_fees + distributions + other_expenses)
  ) STORED,

  -- Ending Position
  ending_cash DECIMAL(14,2) DEFAULT 0,

  -- Type
  is_actual BOOLEAN DEFAULT false, -- false = projected, true = actual
  is_locked BOOLEAN DEFAULT false, -- Lock historical periods

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cashflow_project ON cash_flow_records(project_id);
CREATE INDEX IF NOT EXISTS idx_cashflow_period ON cash_flow_records(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_cashflow_actual ON cash_flow_records(is_actual);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_cashflow_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  -- Calculate ending cash
  NEW.ending_cash = COALESCE(NEW.beginning_cash, 0) +
    (COALESCE(NEW.loan_draws, 0) + COALESCE(NEW.equity_contributions, 0) +
     COALESCE(NEW.sales_proceeds, 0) + COALESCE(NEW.rental_income, 0) +
     COALESCE(NEW.other_income, 0)) -
    (COALESCE(NEW.land_payments, 0) + COALESCE(NEW.hard_cost_payments, 0) +
     COALESCE(NEW.soft_cost_payments, 0) + COALESCE(NEW.interest_payments, 0) +
     COALESCE(NEW.loan_fees, 0) + COALESCE(NEW.distributions, 0) +
     COALESCE(NEW.other_expenses, 0));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cashflow_updated_at
  BEFORE INSERT OR UPDATE ON cash_flow_records
  FOR EACH ROW
  EXECUTE FUNCTION update_cashflow_updated_at();
-- Change Orders Module
-- Tracks change orders with approval workflow and budget integration

-- ─── CHANGE ORDERS TABLE ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS change_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  budget_id UUID REFERENCES project_budgets(id),

  -- Identification
  co_number INTEGER NOT NULL,

  -- Details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reason TEXT NOT NULL, -- owner_request, unforeseen_condition, design_change, code_requirement, value_engineering, other

  -- Contractor
  contractor_id UUID REFERENCES contacts(id),
  contractor_name TEXT NOT NULL,
  contractor_reference TEXT, -- Contractor's CO number/reference

  -- Amounts (positive = cost increase, negative = credit/deduction)
  amount DECIMAL(12,2) NOT NULL,

  -- Budget Line Item
  budget_line_item_id UUID REFERENCES budget_line_items(id),
  budget_line_item_name TEXT,

  -- Dates
  submitted_date DATE NOT NULL DEFAULT CURRENT_DATE,
  approval_deadline DATE,
  approved_date DATE,

  -- Status: pending, approved, denied
  status TEXT DEFAULT 'pending',

  -- Approval
  approver_id UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approval_notes TEXT,
  denial_reason TEXT,

  -- Payment Tracking
  is_paid BOOLEAN DEFAULT false,
  paid_date DATE,
  paid_amount DECIMAL(12,2),

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  UNIQUE(project_id, co_number)
);

-- ─── CHANGE ORDER DOCUMENTS ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS change_order_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  change_order_id UUID REFERENCES change_orders(id) ON DELETE CASCADE,

  -- document_type: proposal, backup, photo, correspondence, other
  document_type TEXT DEFAULT 'other',
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,

  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- ─── TRIGGER: UPDATE BUDGET ON CO APPROVAL ────────────────────────────────────

CREATE OR REPLACE FUNCTION update_budget_on_co_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    -- Update budget line item committed amount
    IF NEW.budget_line_item_id IS NOT NULL THEN
      UPDATE budget_line_items
      SET committed_amount = COALESCE(committed_amount, 0) + NEW.amount
      WHERE id = NEW.budget_line_item_id;
    END IF;

    -- Update budget totals
    IF NEW.budget_id IS NOT NULL THEN
      UPDATE project_budgets pb
      SET
        total_budget = (
          SELECT COALESCE(SUM(budget_amount), 0)
          FROM budget_line_items
          WHERE budget_id = pb.id
        ),
        updated_at = NOW()
      WHERE pb.id = NEW.budget_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_co_approval
AFTER UPDATE ON change_orders
FOR EACH ROW EXECUTE FUNCTION update_budget_on_co_approval();

-- ─── TRIGGER: UPDATE BUDGET ON CO PAYMENT ─────────────────────────────────────

CREATE OR REPLACE FUNCTION update_budget_on_co_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_paid = true AND OLD.is_paid = false THEN
    -- Update budget line item actual amount
    IF NEW.budget_line_item_id IS NOT NULL THEN
      UPDATE budget_line_items
      SET actual_amount = COALESCE(actual_amount, 0) + COALESCE(NEW.paid_amount, NEW.amount)
      WHERE id = NEW.budget_line_item_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_co_payment
AFTER UPDATE ON change_orders
FOR EACH ROW EXECUTE FUNCTION update_budget_on_co_payment();

-- ─── INDEXES ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_change_orders_project ON change_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_change_orders_budget ON change_orders(budget_id);
CREATE INDEX IF NOT EXISTS idx_change_orders_status ON change_orders(status);
CREATE INDEX IF NOT EXISTS idx_change_orders_contractor ON change_orders(contractor_id);
CREATE INDEX IF NOT EXISTS idx_change_order_documents_co ON change_order_documents(change_order_id);

-- ─── RLS POLICIES ─────────────────────────────────────────────────────────────

ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_order_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view change orders" ON change_orders FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage change orders" ON change_orders FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view change order documents" ON change_order_documents FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage change order documents" ON change_order_documents FOR ALL USING (auth.uid() IS NOT NULL);
-- ============================================
-- DOCUMENT EXPIRATION & WORK ORDER SYSTEM
-- Track document expirations and vendor work orders
-- ============================================

-- Document expiration tracking
CREATE TABLE IF NOT EXISTS document_expirations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  project_id UUID,
  entity_id UUID,

  -- Document info
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'insurance_gl', 'insurance_builders_risk', 'insurance_workers_comp',
    'insurance_auto', 'insurance_umbrella', 'insurance_professional',
    'permit_building', 'permit_electrical', 'permit_plumbing', 'permit_mechanical',
    'permit_grading', 'permit_demolition', 'permit_zoning', 'permit_environmental',
    'license_contractor', 'license_business', 'license_professional',
    'bond_performance', 'bond_payment', 'bond_license',
    'certificate_occupancy', 'certificate_completion',
    'warranty', 'lease', 'contract', 'other'
  )),
  document_category TEXT DEFAULT 'other' CHECK (document_category IN (
    'insurance', 'permit', 'license', 'bond', 'certificate', 'warranty', 'contract', 'other'
  )),

  -- Related vendor/contact
  vendor_id UUID,
  vendor_name TEXT,

  -- Dates
  issue_date DATE,
  expiration_date DATE NOT NULL,
  renewal_date DATE,

  -- File reference
  file_url TEXT,
  file_name TEXT,

  -- Tracking
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expiring_soon', 'expired', 'renewed', 'cancelled')),
  reminder_days INTEGER[] DEFAULT '{90, 60, 30, 14, 7}',
  last_reminder_sent TIMESTAMPTZ,

  -- Coverage details (for insurance)
  coverage_amount DECIMAL(15,2),
  policy_number TEXT,

  -- Notes
  notes TEXT,
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Work orders for vendors
CREATE TABLE IF NOT EXISTS work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  project_id UUID NOT NULL,

  -- Work order info
  work_order_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  work_type TEXT CHECK (work_type IN (
    'repair', 'maintenance', 'installation', 'inspection',
    'punch_list', 'warranty_work', 'change_order', 'rework', 'other'
  )),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- Vendor assignment
  vendor_id UUID,
  vendor_name TEXT,
  vendor_contact TEXT,
  vendor_phone TEXT,
  vendor_email TEXT,

  -- Location
  location TEXT,
  unit_number TEXT,

  -- Dates
  requested_date DATE DEFAULT CURRENT_DATE,
  scheduled_date DATE,
  started_date DATE,
  completed_date DATE,
  due_date DATE,

  -- Financials
  estimated_cost DECIMAL(15,2),
  actual_cost DECIMAL(15,2),
  budget_line_id UUID,

  -- Status tracking
  status TEXT DEFAULT 'open' CHECK (status IN (
    'draft', 'open', 'assigned', 'scheduled', 'in_progress',
    'on_hold', 'completed', 'verified', 'closed', 'cancelled'
  )),

  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  assigned_by UUID REFERENCES auth.users(id),

  -- Completion
  completion_notes TEXT,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,

  -- Attachments & photos
  attachments JSONB DEFAULT '[]',
  before_photos JSONB DEFAULT '[]',
  after_photos JSONB DEFAULT '[]',

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Work order comments/activity
CREATE TABLE IF NOT EXISTS work_order_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,

  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'comment', 'status_change', 'assignment', 'photo_added',
    'cost_update', 'schedule_change', 'vendor_response'
  )),

  -- Content
  message TEXT,
  old_value TEXT,
  new_value TEXT,

  -- Attachments
  attachments JSONB DEFAULT '[]',

  -- User
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit trail for all changes
CREATE TABLE IF NOT EXISTS audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,

  -- What changed
  entity_type TEXT NOT NULL, -- 'project', 'budget', 'draw_request', etc.
  entity_id UUID NOT NULL,
  entity_name TEXT,

  -- Change details
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'archive', 'restore', 'approve', 'reject', 'submit')),
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,

  -- Full change object for complex updates
  changes JSONB,

  -- Who made the change
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  user_email TEXT,

  -- Context
  ip_address INET,
  user_agent TEXT,

  -- Related entities
  project_id UUID,
  parent_entity_type TEXT,
  parent_entity_id UUID,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_doc_expirations_project ON document_expirations(project_id);
CREATE INDEX IF NOT EXISTS idx_doc_expirations_expiry ON document_expirations(expiration_date);
CREATE INDEX IF NOT EXISTS idx_doc_expirations_status ON document_expirations(status);
CREATE INDEX IF NOT EXISTS idx_doc_expirations_type ON document_expirations(document_type);

CREATE INDEX IF NOT EXISTS idx_work_orders_project ON work_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_vendor ON work_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_assigned ON work_orders(assigned_to);

CREATE INDEX IF NOT EXISTS idx_audit_trail_entity ON audit_trail(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_user ON audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_project ON audit_trail(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_created ON audit_trail(created_at DESC);

-- RLS Policies
ALTER TABLE document_expirations ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

CREATE POLICY document_expirations_team ON document_expirations
  FOR ALL USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()));

CREATE POLICY work_orders_team ON work_orders
  FOR ALL USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()));

CREATE POLICY work_order_activity_access ON work_order_activity
  FOR ALL USING (work_order_id IN (SELECT id FROM work_orders WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())));

CREATE POLICY audit_trail_team ON audit_trail
  FOR SELECT USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()));

-- Function to update document expiration status
CREATE OR REPLACE FUNCTION update_document_expiration_status()
RETURNS void AS $$
BEGIN
  -- Mark as expiring soon (within 30 days)
  UPDATE document_expirations
  SET status = 'expiring_soon', updated_at = NOW()
  WHERE status = 'active'
    AND expiration_date <= CURRENT_DATE + INTERVAL '30 days'
    AND expiration_date > CURRENT_DATE;

  -- Mark as expired
  UPDATE document_expirations
  SET status = 'expired', updated_at = NOW()
  WHERE status IN ('active', 'expiring_soon')
    AND expiration_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate next work order number
CREATE OR REPLACE FUNCTION generate_work_order_number(p_project_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_count INTEGER;
  v_prefix TEXT;
BEGIN
  SELECT COUNT(*) + 1 INTO v_count
  FROM work_orders
  WHERE project_id = p_project_id;

  v_prefix := 'WO-' || TO_CHAR(CURRENT_DATE, 'YYMM') || '-';

  RETURN v_prefix || LPAD(v_count::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to log audit trail
CREATE OR REPLACE FUNCTION log_audit_trail(
  p_team_id UUID,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_entity_name TEXT,
  p_action TEXT,
  p_changes JSONB,
  p_project_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_audit_id UUID;
  v_user_id UUID;
  v_user_name TEXT;
  v_user_email TEXT;
BEGIN
  v_user_id := auth.uid();

  SELECT raw_user_meta_data->>'full_name', email
  INTO v_user_name, v_user_email
  FROM auth.users
  WHERE id = v_user_id;

  INSERT INTO audit_trail (
    team_id, entity_type, entity_id, entity_name, action, changes,
    user_id, user_name, user_email, project_id
  ) VALUES (
    p_team_id, p_entity_type, p_entity_id, p_entity_name, p_action, p_changes,
    v_user_id, v_user_name, v_user_email, p_project_id
  ) RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE document_expirations IS 'Track expiring documents like insurance, permits, and licenses';
COMMENT ON TABLE work_orders IS 'Work orders for vendor assignments and tracking';
COMMENT ON TABLE audit_trail IS 'Comprehensive audit trail for all data changes';
-- Draw Requests Module
-- Tracks construction loan draw requests with budget integration

-- ─── DRAW REQUESTS TABLE ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS draw_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  budget_id UUID REFERENCES project_budgets(id),

  -- Identification
  draw_number INTEGER NOT NULL,

  -- Dates
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  period_start DATE,
  period_end DATE,
  submitted_date TIMESTAMPTZ,
  approved_date TIMESTAMPTZ,
  funded_date TIMESTAMPTZ,

  -- Amounts
  requested_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  approved_amount DECIMAL(12,2),
  funded_amount DECIMAL(12,2),

  -- Retainage
  retainage_percentage DECIMAL(5,2) DEFAULT 10,
  retainage_amount DECIMAL(12,2) DEFAULT 0,
  net_amount DECIMAL(12,2),

  -- Status: draft, requested, under_review, approved, denied, funded
  status TEXT DEFAULT 'draft',

  -- Lender Info
  lender_id UUID REFERENCES contacts(id),
  lender_name TEXT,
  inspector_name TEXT,
  inspection_date DATE,
  inspection_notes TEXT,

  -- Approval
  approved_by UUID REFERENCES auth.users(id),
  denial_reason TEXT,

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  UNIQUE(project_id, draw_number)
);

-- ─── DRAW REQUEST LINE ITEMS ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS draw_request_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_request_id UUID REFERENCES draw_requests(id) ON DELETE CASCADE,
  budget_line_item_id UUID REFERENCES budget_line_items(id),

  -- Line item reference
  cost_code TEXT,
  description TEXT,

  -- Amounts
  budget_amount DECIMAL(12,2) DEFAULT 0,
  previously_drawn DECIMAL(12,2) DEFAULT 0,
  current_request DECIMAL(12,2) NOT NULL DEFAULT 0,
  percent_complete DECIMAL(5,2) DEFAULT 0,

  -- Approval
  approved_amount DECIMAL(12,2),

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DRAW REQUEST DOCUMENTS ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS draw_request_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_request_id UUID REFERENCES draw_requests(id) ON DELETE CASCADE,

  -- document_type: invoice, lien_waiver, inspection_report, photo, other
  document_type TEXT DEFAULT 'other',
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,

  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- ─── TRIGGER: UPDATE BUDGET ON DRAW FUNDED ────────────────────────────────────

CREATE OR REPLACE FUNCTION update_budget_on_draw_funded()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'funded' AND OLD.status != 'funded' THEN
    -- Update each budget line item's actual amount
    UPDATE budget_line_items bli
    SET actual_amount = COALESCE(actual_amount, 0) + COALESCE(dri.approved_amount, dri.current_request)
    FROM draw_request_items dri
    WHERE dri.draw_request_id = NEW.id
      AND bli.id = dri.budget_line_item_id
      AND dri.budget_line_item_id IS NOT NULL;

    -- Update budget totals
    UPDATE project_budgets pb
    SET
      total_actual = (
        SELECT COALESCE(SUM(actual_amount), 0)
        FROM budget_line_items
        WHERE budget_id = pb.id
      ),
      total_variance = COALESCE(total_budget, 0) - (
        SELECT COALESCE(SUM(actual_amount), 0)
        FROM budget_line_items
        WHERE budget_id = pb.id
      ),
      updated_at = NOW()
    WHERE pb.id = NEW.budget_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_budget_on_draw
AFTER UPDATE ON draw_requests
FOR EACH ROW EXECUTE FUNCTION update_budget_on_draw_funded();

-- ─── INDEXES ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_draw_requests_project ON draw_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_draw_requests_budget ON draw_requests(budget_id);
CREATE INDEX IF NOT EXISTS idx_draw_requests_status ON draw_requests(status);
CREATE INDEX IF NOT EXISTS idx_draw_request_items_draw ON draw_request_items(draw_request_id);
CREATE INDEX IF NOT EXISTS idx_draw_request_items_budget_line ON draw_request_items(budget_line_item_id);
CREATE INDEX IF NOT EXISTS idx_draw_request_documents_draw ON draw_request_documents(draw_request_id);

-- ─── RLS POLICIES ─────────────────────────────────────────────────────────────

ALTER TABLE draw_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_request_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view draw requests" ON draw_requests FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage draw requests" ON draw_requests FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view draw request items" ON draw_request_items FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage draw request items" ON draw_request_items FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view draw request documents" ON draw_request_documents FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage draw request documents" ON draw_request_documents FOR ALL USING (auth.uid() IS NOT NULL);
-- ============================================================================
-- ENTITY & ACCOUNTING ARCHITECTURE MIGRATION
-- ============================================================================
-- This migration adds:
-- 1. Extended entity fields (legal structure, purpose, project type, syndication)
-- 2. Chart of Accounts template system
-- 3. Entity-specific accounts
-- 4. Journal entries and lines
-- 5. Entity ownership relationships
-- 6. Duplicate detection alerts
-- ============================================================================

-- ============================================================================
-- PART 1: EXTEND ENTITIES TABLE
-- ============================================================================

-- Add new entity fields
-- Note: The existing 'type' field will be renamed to avoid confusion
-- We're adding entity_type (legal structure), entity_purpose (operational role)

ALTER TABLE entities
ADD COLUMN IF NOT EXISTS entity_type TEXT CHECK (entity_type IN (
  'llc', 's_corp', 'c_corp', 'sole_proprietorship', 'partnership', 'lp', 'trust', 'individual', 'other'
)),
ADD COLUMN IF NOT EXISTS entity_purpose TEXT CHECK (entity_purpose IN (
  'holding_company', 'operating_company', 'spe'
)),
ADD COLUMN IF NOT EXISTS project_type TEXT CHECK (project_type IN (
  'lot_development', 'btr', 'fix_and_flip', 'spec_build', 'community_development', 'none'
)),
ADD COLUMN IF NOT EXISTS is_syndication BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sec_exemption TEXT CHECK (sec_exemption IN (
  '506b', '506c', 'reg_a', 'reg_cf', 'other'
)),
ADD COLUMN IF NOT EXISTS state_of_formation TEXT,
ADD COLUMN IF NOT EXISTS formation_date DATE,
ADD COLUMN IF NOT EXISTS legal_name TEXT,
ADD COLUMN IF NOT EXISTS dba_name TEXT,
ADD COLUMN IF NOT EXISTS fiscal_year_end TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS address_line1 TEXT,
ADD COLUMN IF NOT EXISTS address_line2 TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
ADD COLUMN IF NOT EXISTS bank_routing_number TEXT;

-- Create index for new fields
CREATE INDEX IF NOT EXISTS idx_entities_entity_type ON entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_entities_entity_purpose ON entities(entity_purpose);
CREATE INDEX IF NOT EXISTS idx_entities_project_type ON entities(project_type);
CREATE INDEX IF NOT EXISTS idx_entities_is_syndication ON entities(is_syndication);

-- ============================================================================
-- PART 2: CHART OF ACCOUNTS TEMPLATE SYSTEM
-- ============================================================================

-- Templates table - stores predefined CoA templates
CREATE TABLE IF NOT EXISTS coa_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  entity_purpose TEXT NOT NULL CHECK (entity_purpose IN (
    'holding_company', 'operating_company', 'spe'
  )),
  project_type TEXT CHECK (project_type IN (
    'lot_development', 'btr', 'fix_and_flip', 'spec_build', 'community_development', 'none'
  )),
  is_default BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT true, -- System templates can't be deleted
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Template accounts - accounts within a template
CREATE TABLE IF NOT EXISTS coa_template_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES coa_templates(id) ON DELETE CASCADE,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN (
    'asset', 'liability', 'equity', 'revenue', 'cogs', 'expense', 'other_income', 'other_expense'
  )),
  sub_type TEXT, -- e.g., 'current_asset', 'fixed_asset', 'long_term_liability'
  parent_account_number TEXT, -- For hierarchical accounts
  description TEXT,
  is_header BOOLEAN DEFAULT false, -- Header accounts for grouping
  is_required BOOLEAN DEFAULT false, -- Required accounts can't be removed
  normal_balance TEXT CHECK (normal_balance IN ('debit', 'credit')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, account_number)
);

-- Indexes for templates
CREATE INDEX IF NOT EXISTS idx_coa_templates_purpose ON coa_templates(entity_purpose);
CREATE INDEX IF NOT EXISTS idx_coa_templates_project_type ON coa_templates(project_type);
CREATE INDEX IF NOT EXISTS idx_coa_templates_default ON coa_templates(is_default);
CREATE INDEX IF NOT EXISTS idx_coa_template_accounts_template ON coa_template_accounts(template_id);
CREATE INDEX IF NOT EXISTS idx_coa_template_accounts_type ON coa_template_accounts(account_type);

-- ============================================================================
-- PART 3: ENTITY-SPECIFIC ACCOUNTS (CHART OF ACCOUNTS)
-- ============================================================================

-- Entity accounts - actual CoA for each entity
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN (
    'asset', 'liability', 'equity', 'revenue', 'cogs', 'expense', 'other_income', 'other_expense'
  )),
  sub_type TEXT,
  parent_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  description TEXT,
  is_header BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  normal_balance TEXT CHECK (normal_balance IN ('debit', 'credit')),
  opening_balance NUMERIC(15,2) DEFAULT 0,
  current_balance NUMERIC(15,2) DEFAULT 0,
  bank_account_id UUID, -- Link to banking module if applicable
  display_order INTEGER DEFAULT 0,
  template_account_id UUID REFERENCES coa_template_accounts(id), -- Track origin template
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_id, account_number)
);

-- Indexes for accounts
CREATE INDEX IF NOT EXISTS idx_accounts_entity ON accounts(entity_id);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_accounts_parent ON accounts(parent_account_id);
CREATE INDEX IF NOT EXISTS idx_accounts_active ON accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_accounts_number ON accounts(account_number);

-- ============================================================================
-- PART 4: JOURNAL ENTRIES
-- ============================================================================

-- Journal entries header
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  entry_number TEXT NOT NULL,
  entry_date DATE NOT NULL,
  description TEXT,
  memo TEXT,
  reference_type TEXT, -- 'invoice', 'bill', 'payment', 'adjustment', 'transfer'
  reference_id UUID, -- ID of related record
  is_adjusting BOOLEAN DEFAULT false,
  is_closing BOOLEAN DEFAULT false,
  is_reversing BOOLEAN DEFAULT false,
  reversed_entry_id UUID REFERENCES journal_entries(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'void')),
  posted_at TIMESTAMPTZ,
  posted_by UUID REFERENCES auth.users(id),
  voided_at TIMESTAMPTZ,
  voided_by UUID REFERENCES auth.users(id),
  void_reason TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_id, entry_number)
);

-- Journal entry lines (debits and credits)
CREATE TABLE IF NOT EXISTS journal_entry_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id),
  description TEXT,
  debit_amount NUMERIC(15,2) DEFAULT 0,
  credit_amount NUMERIC(15,2) DEFAULT 0,
  project_id UUID REFERENCES projects(id), -- Optional project allocation
  cost_code TEXT, -- Optional cost code for project tracking
  vendor_id UUID, -- Reference to vendor if applicable
  line_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for journal entries
CREATE INDEX IF NOT EXISTS idx_journal_entries_entity ON journal_entries(entity_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_status ON journal_entries(status);
CREATE INDEX IF NOT EXISTS idx_journal_entries_reference ON journal_entries(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_entry ON journal_entry_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_account ON journal_entry_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_project ON journal_entry_lines(project_id);

-- ============================================================================
-- PART 5: ENTITY OWNERSHIP RELATIONSHIPS
-- ============================================================================

-- Track ownership percentages between entities
CREATE TABLE IF NOT EXISTS entity_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  child_entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  ownership_percentage NUMERIC(5,2) NOT NULL CHECK (ownership_percentage >= 0 AND ownership_percentage <= 100),
  relationship_type TEXT DEFAULT 'ownership' CHECK (relationship_type IN (
    'ownership', 'management', 'investment'
  )),
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_entity_id, child_entity_id, effective_date),
  CHECK (parent_entity_id != child_entity_id)
);

-- Indexes for entity relationships
CREATE INDEX IF NOT EXISTS idx_entity_relationships_parent ON entity_relationships(parent_entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_relationships_child ON entity_relationships(child_entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_relationships_type ON entity_relationships(relationship_type);
CREATE INDEX IF NOT EXISTS idx_entity_relationships_effective ON entity_relationships(effective_date);

-- ============================================================================
-- PART 6: DUPLICATE DETECTION ALERTS
-- ============================================================================

-- Track potential duplicate accounts across entities
CREATE TABLE IF NOT EXISTS coa_duplicate_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  duplicate_account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  duplicate_entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  match_type TEXT NOT NULL CHECK (match_type IN (
    'exact_number', 'similar_name', 'exact_match'
  )),
  confidence_score NUMERIC(3,2) DEFAULT 0.00, -- 0.00 to 1.00
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'dismissed', 'merged'
  )),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, duplicate_account_id)
);

-- Indexes for duplicate alerts
CREATE INDEX IF NOT EXISTS idx_coa_duplicate_alerts_entity ON coa_duplicate_alerts(entity_id);
CREATE INDEX IF NOT EXISTS idx_coa_duplicate_alerts_status ON coa_duplicate_alerts(status);
CREATE INDEX IF NOT EXISTS idx_coa_duplicate_alerts_match ON coa_duplicate_alerts(match_type);

-- ============================================================================
-- PART 7: ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE coa_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE coa_template_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE coa_duplicate_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow authenticated users full access (can be refined later)
CREATE POLICY "Allow authenticated users full access to coa_templates"
  ON coa_templates FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to coa_template_accounts"
  ON coa_template_accounts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to accounts"
  ON accounts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to journal_entries"
  ON journal_entries FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to journal_entry_lines"
  ON journal_entry_lines FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to entity_relationships"
  ON entity_relationships FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to coa_duplicate_alerts"
  ON coa_duplicate_alerts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- PART 8: HELPER FUNCTIONS
-- ============================================================================

-- Function to validate ownership percentages don't exceed 100% for a child entity
CREATE OR REPLACE FUNCTION check_ownership_total()
RETURNS TRIGGER AS $$
DECLARE
  total_ownership NUMERIC(5,2);
BEGIN
  SELECT COALESCE(SUM(ownership_percentage), 0) INTO total_ownership
  FROM entity_relationships
  WHERE child_entity_id = NEW.child_entity_id
    AND relationship_type = 'ownership'
    AND (end_date IS NULL OR end_date >= CURRENT_DATE)
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);

  IF (total_ownership + NEW.ownership_percentage) > 100 THEN
    RAISE EXCEPTION 'Total ownership percentage for entity cannot exceed 100%%. Current: %, Attempting to add: %',
      total_ownership, NEW.ownership_percentage;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for ownership validation
DROP TRIGGER IF EXISTS validate_ownership_total ON entity_relationships;
CREATE TRIGGER validate_ownership_total
  BEFORE INSERT OR UPDATE ON entity_relationships
  FOR EACH ROW
  WHEN (NEW.relationship_type = 'ownership')
  EXECUTE FUNCTION check_ownership_total();

-- Function to generate next journal entry number
CREATE OR REPLACE FUNCTION generate_journal_entry_number(p_entity_id UUID)
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  prefix TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(entry_number FROM 4) AS INTEGER)), 0) + 1
  INTO next_num
  FROM journal_entries
  WHERE entity_id = p_entity_id
    AND entry_number LIKE 'JE-%';

  RETURN 'JE-' || LPAD(next_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to update account balances after journal entry posting
CREATE OR REPLACE FUNCTION update_account_balances()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Update account balance based on normal balance
    UPDATE accounts a
    SET current_balance = (
      SELECT COALESCE(SUM(
        CASE
          WHEN a.normal_balance = 'debit' THEN jel.debit_amount - jel.credit_amount
          ELSE jel.credit_amount - jel.debit_amount
        END
      ), 0) + a.opening_balance
      FROM journal_entry_lines jel
      JOIN journal_entries je ON je.id = jel.journal_entry_id
      WHERE jel.account_id = a.id
        AND je.status = 'posted'
    ),
    updated_at = NOW()
    WHERE a.id = NEW.account_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 9: UPDATED_AT TRIGGERS
-- ============================================================================

-- Update triggers for new tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_coa_templates_updated_at ON coa_templates;
CREATE TRIGGER update_coa_templates_updated_at
  BEFORE UPDATE ON coa_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_journal_entries_updated_at ON journal_entries;
CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_entity_relationships_updated_at ON entity_relationships;
CREATE TRIGGER update_entity_relationships_updated_at
  BEFORE UPDATE ON entity_relationships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
-- ============================================
-- EXPENSES MODULE
-- Expense tracking with approval workflow and budget integration
-- ============================================

-- expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  budget_id UUID REFERENCES project_budgets(id),
  budget_line_item_id UUID REFERENCES budget_line_items(id),

  -- Details
  description TEXT NOT NULL,
  expense_type TEXT NOT NULL, -- labor, materials, equipment, subcontractor,
                               -- professional_fees, permits, insurance, other

  -- Vendor
  vendor_name TEXT,
  vendor_id UUID REFERENCES contacts(id),
  invoice_number TEXT,

  -- Amounts
  amount DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(12,2),

  -- Dates
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_date DATE,

  -- Status
  status TEXT DEFAULT 'pending', -- pending, waiting_approval, approved, denied, paid

  -- Approval
  requires_approval BOOLEAN DEFAULT true,
  approver_id UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  approval_notes TEXT,
  denial_reason TEXT,

  -- Payment
  payment_method TEXT, -- check, ach, wire, credit_card, cash
  payment_reference TEXT,

  -- Source tracking
  source_type TEXT, -- manual, change_order, draw_request
  source_id UUID,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_expenses_project ON expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(expense_type);
CREATE INDEX IF NOT EXISTS idx_expenses_vendor ON expenses(vendor_name);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_budget_item ON expenses(budget_line_item_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_expense_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.total_amount = NEW.amount + COALESCE(NEW.tax_amount, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_expense_updated_at
  BEFORE INSERT OR UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_expense_updated_at();

-- Update budget actuals when expense is paid
CREATE OR REPLACE FUNCTION update_budget_on_expense_paid()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND OLD.status != 'paid' AND NEW.budget_line_item_id IS NOT NULL THEN
    UPDATE budget_line_items
    SET actual_amount = actual_amount + NEW.total_amount
    WHERE id = NEW.budget_line_item_id;

    UPDATE project_budgets pb
    SET
      total_actual = (SELECT COALESCE(SUM(actual_amount), 0) FROM budget_line_items WHERE budget_id = pb.id),
      total_variance = total_budget - total_actual
    WHERE pb.id = NEW.budget_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_expense_paid
  AFTER UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_on_expense_paid();
-- ============================================
-- LOANS MODULE
-- Comprehensive loan tracking with amortization
-- ============================================

-- loans table
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  -- Basic Info
  name TEXT NOT NULL,
  loan_type TEXT NOT NULL, -- construction, bridge, permanent, mezzanine, preferred_equity, line_of_credit
  position TEXT NOT NULL, -- first, second, third, unsecured

  -- Lender
  lender_name TEXT,
  lender_id UUID REFERENCES contacts(id),
  loan_officer TEXT,

  -- Terms
  commitment_amount DECIMAL(14,2) NOT NULL,
  funded_amount DECIMAL(14,2) DEFAULT 0,

  -- Rates
  interest_rate DECIMAL(6,4) NOT NULL,
  rate_type TEXT DEFAULT 'fixed', -- fixed, floating
  index_rate TEXT, -- prime, sofr, libor
  spread DECIMAL(6,4),
  floor_rate DECIMAL(6,4),

  -- Schedule
  term_months INTEGER NOT NULL,
  amortization_months INTEGER,
  io_period_months INTEGER DEFAULT 0,

  -- Dates
  effective_date DATE,
  maturity_date DATE,
  first_payment_date DATE,

  -- Fees
  origination_fee_percent DECIMAL(5,4),
  origination_fee_amount DECIMAL(12,2),
  exit_fee_percent DECIMAL(5,4),
  annual_fee DECIMAL(10,2),

  -- Reserves
  interest_reserve DECIMAL(12,2) DEFAULT 0,
  operating_reserve DECIMAL(12,2) DEFAULT 0,
  replacement_reserve DECIMAL(12,2) DEFAULT 0,

  -- LTV/LTC
  max_ltv DECIMAL(5,4),
  max_ltc DECIMAL(5,4),

  -- Status
  status TEXT DEFAULT 'proposed', -- proposed, term_sheet, application, underwriting,
                                   -- approved, closed, active, paid_off, defaulted

  -- Documents
  term_sheet_path TEXT,
  commitment_letter_path TEXT,
  loan_agreement_path TEXT,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- loan_draws table
CREATE TABLE IF NOT EXISTS loan_draws (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
  draw_request_id UUID REFERENCES draw_requests(id),

  draw_number INTEGER,
  draw_date DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,

  status TEXT DEFAULT 'requested', -- requested, approved, funded

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- loan_payments table
CREATE TABLE IF NOT EXISTS loan_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,

  payment_date DATE NOT NULL,
  payment_number INTEGER,

  -- Amounts
  total_payment DECIMAL(12,2) NOT NULL,
  principal_payment DECIMAL(12,2) DEFAULT 0,
  interest_payment DECIMAL(12,2) DEFAULT 0,
  fees DECIMAL(10,2) DEFAULT 0,

  -- Balance
  beginning_balance DECIMAL(14,2),
  ending_balance DECIMAL(14,2),

  status TEXT DEFAULT 'scheduled', -- scheduled, paid, late, missed

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_loans_project ON loans(project_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_type ON loans(loan_type);
CREATE INDEX IF NOT EXISTS idx_loan_draws_loan ON loan_draws(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_payments_loan ON loan_payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_payments_date ON loan_payments(payment_date);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_loan_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_loan_updated_at
  BEFORE UPDATE ON loans
  FOR EACH ROW
  EXECUTE FUNCTION update_loan_updated_at();

-- Update funded_amount when draw is funded
CREATE OR REPLACE FUNCTION update_loan_funded_on_draw()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'funded' AND (OLD.status IS NULL OR OLD.status != 'funded') THEN
    UPDATE loans
    SET funded_amount = funded_amount + NEW.amount
    WHERE id = NEW.loan_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_loan_draw_funded
  AFTER INSERT OR UPDATE ON loan_draws
  FOR EACH ROW
  EXECUTE FUNCTION update_loan_funded_on_draw();
-- ============================================
-- NOTIFICATIONS SYSTEM
-- Centralized notification management for Atlas
-- ============================================

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Notification content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'info', 'success', 'warning', 'error', 'alert',
    'budget_alert', 'approval_request', 'task_due', 'document_signed',
    'draw_request', 'change_order', 'permit_expiring', 'milestone_complete'
  )),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- Related entity references
  entity_type TEXT, -- 'project', 'budget', 'draw_request', 'change_order', 'permit', 'task', etc.
  entity_id UUID,
  action_url TEXT, -- URL to navigate to when clicked

  -- Status tracking
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  is_archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ -- Optional expiration for time-sensitive notifications
);

-- Notification preferences per user
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Email notification settings
  email_enabled BOOLEAN DEFAULT TRUE,
  email_digest_frequency TEXT DEFAULT 'daily' CHECK (email_digest_frequency IN ('immediate', 'hourly', 'daily', 'weekly', 'none')),

  -- Notification type preferences (which types to receive)
  budget_alerts BOOLEAN DEFAULT TRUE,
  approval_requests BOOLEAN DEFAULT TRUE,
  task_reminders BOOLEAN DEFAULT TRUE,
  document_updates BOOLEAN DEFAULT TRUE,
  permit_alerts BOOLEAN DEFAULT TRUE,
  milestone_updates BOOLEAN DEFAULT TRUE,
  system_announcements BOOLEAN DEFAULT TRUE,

  -- Threshold settings
  budget_alert_threshold DECIMAL(5,2) DEFAULT 80.00, -- Alert when budget line item reaches this % spent
  permit_expiry_days INTEGER DEFAULT 30, -- Days before permit expiry to alert
  task_reminder_hours INTEGER DEFAULT 24, -- Hours before task due date to remind

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budget alert configurations (per project/budget)
CREATE TABLE IF NOT EXISTS budget_alert_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  project_id UUID,
  budget_id UUID,

  -- Alert settings
  is_enabled BOOLEAN DEFAULT TRUE,
  alert_threshold_warning DECIMAL(5,2) DEFAULT 80.00,
  alert_threshold_critical DECIMAL(5,2) DEFAULT 95.00,
  alert_on_overbudget BOOLEAN DEFAULT TRUE,

  -- Line item specific thresholds (optional overrides)
  line_item_thresholds JSONB DEFAULT '{}', -- { "line_item_id": { "warning": 75, "critical": 90 } }

  -- Notification recipients
  notify_project_manager BOOLEAN DEFAULT TRUE,
  notify_finance_team BOOLEAN DEFAULT TRUE,
  additional_recipients UUID[] DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_team ON notifications(team_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_entity ON notifications(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_budget_alert_configs_project ON budget_alert_configs(project_id);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_alert_configs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications or team-wide notifications
CREATE POLICY notifications_select ON notifications
  FOR SELECT USING (
    user_id = auth.uid() OR
    (user_id IS NULL AND team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
  );

CREATE POLICY notifications_update ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Users can only manage their own preferences
CREATE POLICY notification_preferences_all ON notification_preferences
  FOR ALL USING (user_id = auth.uid());

-- Team members can view and manage budget alert configs for their team
CREATE POLICY budget_alert_configs_select ON budget_alert_configs
  FOR SELECT USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()));

CREATE POLICY budget_alert_configs_modify ON budget_alert_configs
  FOR ALL USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  p_team_id UUID,
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_priority TEXT DEFAULT 'normal',
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    team_id, user_id, title, message, type, priority,
    entity_type, entity_id, action_url, metadata
  ) VALUES (
    p_team_id, p_user_id, p_title, p_message, p_type, p_priority,
    p_entity_type, p_entity_id, p_action_url, p_metadata
  ) RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_read(p_notification_ids UUID[])
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE id = ANY(p_notification_ids)
    AND user_id = auth.uid()
    AND is_read = FALSE;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check budget thresholds and create alerts
CREATE OR REPLACE FUNCTION check_budget_thresholds()
RETURNS TRIGGER AS $$
DECLARE
  v_config budget_alert_configs%ROWTYPE;
  v_spent_percent DECIMAL(5,2);
  v_budget_total DECIMAL(15,2);
  v_spent_total DECIMAL(15,2);
BEGIN
  -- Get budget alert config for this budget
  SELECT * INTO v_config
  FROM budget_alert_configs
  WHERE budget_id = NEW.budget_id AND is_enabled = TRUE
  LIMIT 1;

  IF v_config IS NULL THEN
    RETURN NEW;
  END IF;

  -- Calculate spent percentage (simplified - would need actual spent calculation)
  v_budget_total := NEW.amount;
  v_spent_total := COALESCE(NEW.spent, 0);

  IF v_budget_total > 0 THEN
    v_spent_percent := (v_spent_total / v_budget_total) * 100;

    -- Check thresholds
    IF v_spent_percent >= v_config.alert_threshold_critical THEN
      PERFORM create_notification(
        v_config.team_id,
        NULL, -- Team-wide notification
        'Budget Critical: ' || NEW.name,
        'Line item "' || NEW.name || '" has reached ' || ROUND(v_spent_percent, 1) || '% of budget',
        'budget_alert',
        'urgent',
        'budget',
        NEW.budget_id,
        '/projects/' || v_config.project_id || '/budget',
        jsonb_build_object('line_item_id', NEW.id, 'spent_percent', v_spent_percent)
      );
    ELSIF v_spent_percent >= v_config.alert_threshold_warning THEN
      PERFORM create_notification(
        v_config.team_id,
        NULL,
        'Budget Warning: ' || NEW.name,
        'Line item "' || NEW.name || '" has reached ' || ROUND(v_spent_percent, 1) || '% of budget',
        'budget_alert',
        'high',
        'budget',
        NEW.budget_id,
        '/projects/' || v_config.project_id || '/budget',
        jsonb_build_object('line_item_id', NEW.id, 'spent_percent', v_spent_percent)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for budget line item updates (commented out - needs actual table name)
-- CREATE TRIGGER budget_threshold_check
--   AFTER UPDATE OF spent ON budget_line_items
--   FOR EACH ROW
--   EXECUTE FUNCTION check_budget_thresholds();

COMMENT ON TABLE notifications IS 'Centralized notification system for all Atlas alerts and updates';
COMMENT ON TABLE notification_preferences IS 'User-specific notification preferences and thresholds';
COMMENT ON TABLE budget_alert_configs IS 'Project/budget-level alert configurations';
-- ============================================
-- PERMITS MODULE
-- Permit tracking with inspections
-- ============================================

-- permits table
CREATE TABLE IF NOT EXISTS permits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  -- Permit Info
  permit_type TEXT NOT NULL, -- building, electrical, plumbing, mechanical, grading, demolition,
                              -- fire, health, zoning, environmental, encroachment, other
  permit_number TEXT,

  -- Jurisdiction
  issuing_authority TEXT NOT NULL,
  jurisdiction TEXT, -- city, county, state, federal

  -- Dates
  application_date DATE,
  submitted_date DATE,
  approved_date DATE,
  issued_date DATE,
  expiration_date DATE,

  -- Status
  status TEXT DEFAULT 'not_applied', -- not_applied, applied, under_review,
                                      -- revisions_required, approved, issued, expired, denied

  -- Costs
  application_fee DECIMAL(10,2),
  permit_fee DECIMAL(10,2),
  impact_fees DECIMAL(12,2),
  total_fees DECIMAL(12,2),
  fees_paid BOOLEAN DEFAULT false,

  -- Inspections
  requires_inspections BOOLEAN DEFAULT true,
  inspection_count INTEGER DEFAULT 0,

  -- Documents
  application_doc_path TEXT,
  approval_doc_path TEXT,
  permit_doc_path TEXT,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- permit_inspections table
CREATE TABLE IF NOT EXISTS permit_inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  permit_id UUID REFERENCES permits(id) ON DELETE CASCADE,

  inspection_type TEXT NOT NULL,
  scheduled_date DATE,
  actual_date DATE,
  inspector_name TEXT,

  result TEXT, -- passed, failed, partial, cancelled
  notes TEXT,
  correction_required TEXT,
  reinspection_date DATE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_permits_project ON permits(project_id);
CREATE INDEX IF NOT EXISTS idx_permits_status ON permits(status);
CREATE INDEX IF NOT EXISTS idx_permits_type ON permits(permit_type);
CREATE INDEX IF NOT EXISTS idx_permits_expiration ON permits(expiration_date);
CREATE INDEX IF NOT EXISTS idx_permit_inspections_permit ON permit_inspections(permit_id);
CREATE INDEX IF NOT EXISTS idx_permit_inspections_date ON permit_inspections(scheduled_date);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_permit_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_permit_updated_at
  BEFORE UPDATE ON permits
  FOR EACH ROW
  EXECUTE FUNCTION update_permit_updated_at();

-- Update inspection count trigger
CREATE OR REPLACE FUNCTION update_permit_inspection_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'DELETE' THEN
    UPDATE permits
    SET inspection_count = (
      SELECT COUNT(*) FROM permit_inspections WHERE permit_id = COALESCE(NEW.permit_id, OLD.permit_id)
    )
    WHERE id = COALESCE(NEW.permit_id, OLD.permit_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inspection_count
  AFTER INSERT OR DELETE ON permit_inspections
  FOR EACH ROW
  EXECUTE FUNCTION update_permit_inspection_count();
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
-- ============================================
-- WATERFALL & RETURNS TABLES
-- ============================================

-- Waterfall structures (can be saved as templates or per-proforma)
CREATE TABLE IF NOT EXISTS proforma_waterfall_structures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Can belong to template OR proforma
  template_id UUID REFERENCES proforma_templates(id) ON DELETE CASCADE,
  proforma_id UUID REFERENCES proformas(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,

  -- Structure Type
  structure_type TEXT NOT NULL DEFAULT 'american',
  -- american: Distributions at each tier as earned
  -- european: Return of capital first, then promote
  -- hybrid: Custom combination

  -- Capital Structure
  capital_structure JSONB NOT NULL DEFAULT '{}',
  /*
  {
    "total_equity": 1000000,
    "lp_equity": 900000,
    "lp_equity_percent": 90,
    "gp_equity": 100000,
    "gp_equity_percent": 10,
    "gp_co_invest_required": true,
    "gp_co_invest_percent": 10
  }
  */

  -- Preferred Return
  preferred_return JSONB NOT NULL DEFAULT '{}',
  /*
  {
    "enabled": true,
    "rate": 0.08, // 8% annual
    "type": "cumulative", // cumulative, non_cumulative, compounding
    "compounding_frequency": "annual", // annual, quarterly, monthly
    "accrues_during_construction": true,
    "payment_frequency": "at_exit", // monthly, quarterly, annual, at_exit
    "lp_pref_rate": 0.08,
    "gp_pref_rate": 0.08, // Can be different or same as LP
    "catch_up_enabled": true,
    "catch_up_percent": 1.0, // 100% to GP until caught up
    "catch_up_target": 0.20 // GP catches up to 20% of profits
  }
  */

  -- Promote Tiers (IRR or Multiple based hurdles)
  promote_tiers JSONB NOT NULL DEFAULT '[]',
  /*
  [
    {
      "id": "uuid",
      "tier_number": 1,
      "name": "Tier 1 - Base",
      "hurdle_type": "irr", // irr, equity_multiple, or both
      "irr_hurdle": null, // No IRR hurdle for first tier
      "multiple_hurdle": null,
      "lp_share": 0.90,
      "gp_share": 0.10, // GP promote starts at co-invest level
      "description": "Base split up to preferred return"
    },
    {
      "id": "uuid",
      "tier_number": 2,
      "name": "Tier 2 - First Promote",
      "hurdle_type": "irr",
      "irr_hurdle": 0.12, // 12% IRR
      "multiple_hurdle": 1.5, // 1.5x multiple (can use both)
      "lp_share": 0.80,
      "gp_share": 0.20,
      "description": "After 12% IRR or 1.5x multiple"
    },
    {
      "id": "uuid",
      "tier_number": 3,
      "name": "Tier 3 - Second Promote",
      "hurdle_type": "irr",
      "irr_hurdle": 0.18, // 18% IRR
      "multiple_hurdle": 2.0,
      "lp_share": 0.70,
      "gp_share": 0.30,
      "description": "After 18% IRR or 2.0x multiple"
    },
    {
      "id": "uuid",
      "tier_number": 4,
      "name": "Tier 4 - Final Promote",
      "hurdle_type": "irr",
      "irr_hurdle": 0.25, // 25% IRR
      "multiple_hurdle": 2.5,
      "lp_share": 0.60,
      "gp_share": 0.40,
      "description": "After 25% IRR or 2.5x multiple"
    }
  ]
  */

  -- Clawback & True-Up Provisions
  clawback_provisions JSONB DEFAULT '{}',
  /*
  {
    "gp_clawback_enabled": true,
    "lp_clawback_enabled": false,
    "true_up_frequency": "at_exit", // annual, at_exit
    "escrow_percent": 0.10 // 10% of GP promote held in escrow
  }
  */

  -- Management Fees (affects returns)
  management_fees JSONB DEFAULT '{}',
  /*
  {
    "acquisition_fee_percent": 0.01,
    "asset_management_fee_percent": 0.02, // Annual on equity
    "disposition_fee_percent": 0.01,
    "construction_management_fee_percent": 0.05, // On hard costs
    "fees_paid_from": "operating_cash_flow" // operating_cash_flow, capital
  }
  */

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT check_single_parent CHECK (
    (template_id IS NOT NULL AND proforma_id IS NULL) OR
    (template_id IS NULL AND proforma_id IS NOT NULL)
  )
);

-- Return metrics configuration
CREATE TABLE IF NOT EXISTS proforma_return_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES proforma_templates(id) ON DELETE CASCADE,
  proforma_id UUID REFERENCES proformas(id) ON DELETE CASCADE,

  -- Metric Definition
  metric_key TEXT NOT NULL, -- Unique identifier
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- project, lp, gp, deal

  -- Calculation
  formula TEXT, -- For custom metrics

  -- Display
  display_format TEXT DEFAULT 'percent', -- percent, multiple, currency, number
  decimal_places INTEGER DEFAULT 2,
  show_in_summary BOOLEAN DEFAULT true,
  show_in_waterfall BOOLEAN DEFAULT true,

  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT check_single_parent_metrics CHECK (
    (template_id IS NOT NULL AND proforma_id IS NULL) OR
    (template_id IS NULL AND proforma_id IS NOT NULL)
  )
);

-- Calculated waterfall results (cached)
CREATE TABLE IF NOT EXISTS proforma_waterfall_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proforma_id UUID REFERENCES proformas(id) ON DELETE CASCADE,
  scenario TEXT DEFAULT 'base', -- base, upside, downside

  -- Input Summary
  inputs JSONB NOT NULL DEFAULT '{}',
  /*
  {
    "total_equity_invested": 1000000,
    "lp_equity_invested": 900000,
    "gp_equity_invested": 100000,
    "hold_period_years": 3.5,
    "total_distributions": 1800000,
    "cash_flows": [...] // Monthly cash flows for IRR calc
  }
  */

  -- Tier-by-Tier Results
  tier_results JSONB NOT NULL DEFAULT '[]',
  /*
  [
    {
      "tier_number": 0,
      "tier_name": "Return of Capital",
      "lp_distribution": 900000,
      "gp_distribution": 100000,
      "total_distribution": 1000000,
      "cumulative_lp": 900000,
      "cumulative_gp": 100000,
      "lp_irr_at_tier": 0,
      "lp_multiple_at_tier": 1.0
    },
    {
      "tier_number": 1,
      "tier_name": "Preferred Return",
      "lp_distribution": 216000, // 8% x 3 years x 900k
      "gp_distribution": 24000,
      "total_distribution": 240000,
      "cumulative_lp": 1116000,
      "cumulative_gp": 124000,
      "lp_irr_at_tier": 0.08,
      "lp_multiple_at_tier": 1.24
    },
    // ... more tiers
  ]
  */

  -- Final Results
  final_results JSONB NOT NULL DEFAULT '{}',
  /*
  {
    "lp": {
      "total_invested": 900000,
      "total_distributed": 1440000,
      "profit": 540000,
      "irr": 0.156,
      "equity_multiple": 1.60,
      "cash_on_cash_avg": 0.12,
      "peak_equity": 900000,
      "distribution_yield": 0.48
    },
    "gp": {
      "total_invested": 100000,
      "total_distributed": 360000,
      "profit": 260000,
      "irr": 0.312,
      "equity_multiple": 3.60,
      "promote_earned": 200000,
      "management_fees_earned": 60000
    },
    "project": {
      "total_cost": 5000000,
      "total_equity": 1000000,
      "total_debt": 4000000,
      "gross_revenue": 6500000,
      "net_revenue": 6200000,
      "gross_profit": 1200000,
      "net_profit": 800000,
      "project_irr": 0.234,
      "unlevered_irr": 0.145,
      "equity_multiple": 1.80,
      "yield_on_cost": 0.064,
      "development_spread": 0.015,
      "return_on_cost": 0.16,
      "return_on_equity": 0.80
    }
  }
  */

  calculated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(proforma_id, scenario)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_waterfall_template ON proforma_waterfall_structures(template_id) WHERE template_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_waterfall_proforma ON proforma_waterfall_structures(proforma_id) WHERE proforma_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_return_metrics_template ON proforma_return_metrics(template_id) WHERE template_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_return_metrics_proforma ON proforma_return_metrics(proforma_id) WHERE proforma_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_waterfall_results_proforma ON proforma_waterfall_results(proforma_id);

-- RLS Policies
ALTER TABLE proforma_waterfall_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE proforma_return_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE proforma_waterfall_results ENABLE ROW LEVEL SECURITY;

-- Policies for waterfall structures
CREATE POLICY "Users can view waterfall structures for their proformas"
  ON proforma_waterfall_structures FOR SELECT
  USING (
    proforma_id IN (
      SELECT p.id FROM proformas p
      JOIN projects proj ON p.project_id = proj.id
      WHERE proj.team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
    OR template_id IN (
      SELECT id FROM proforma_templates WHERE is_public = true
    )
  );

CREATE POLICY "Users can manage waterfall structures for their proformas"
  ON proforma_waterfall_structures FOR ALL
  USING (
    proforma_id IN (
      SELECT p.id FROM proformas p
      JOIN projects proj ON p.project_id = proj.id
      WHERE proj.team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );

-- Policies for return metrics
CREATE POLICY "Users can view return metrics for their proformas"
  ON proforma_return_metrics FOR SELECT
  USING (
    proforma_id IN (
      SELECT p.id FROM proformas p
      JOIN projects proj ON p.project_id = proj.id
      WHERE proj.team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
    OR template_id IN (
      SELECT id FROM proforma_templates WHERE is_public = true
    )
  );

CREATE POLICY "Users can manage return metrics for their proformas"
  ON proforma_return_metrics FOR ALL
  USING (
    proforma_id IN (
      SELECT p.id FROM proformas p
      JOIN projects proj ON p.project_id = proj.id
      WHERE proj.team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );

-- Policies for waterfall results
CREATE POLICY "Users can view waterfall results for their proformas"
  ON proforma_waterfall_results FOR SELECT
  USING (
    proforma_id IN (
      SELECT p.id FROM proformas p
      JOIN projects proj ON p.project_id = proj.id
      WHERE proj.team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage waterfall results for their proformas"
  ON proforma_waterfall_results FOR ALL
  USING (
    proforma_id IN (
      SELECT p.id FROM proformas p
      JOIN projects proj ON p.project_id = proj.id
      WHERE proj.team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );
-- ============================================
-- REVENUE & SALES MODULE
-- Sales tracking for all project types
-- ============================================

-- sales table
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  -- Property/Unit
  unit_identifier TEXT,
  property_type TEXT, -- lot, home, unit, commercial

  -- Buyer
  buyer_name TEXT,
  buyer_contact_id UUID REFERENCES contacts(id),
  buyer_agent_id UUID REFERENCES contacts(id),

  -- Sale Details
  list_price DECIMAL(12,2),
  sale_price DECIMAL(12,2),
  price_psf DECIMAL(8,2),
  square_footage INTEGER,

  -- Dates
  listing_date DATE,
  contract_date DATE,
  closing_date DATE,
  actual_closing_date DATE,

  -- Status
  status TEXT DEFAULT 'available', -- available, pending, under_contract, closed, cancelled

  -- Costs
  broker_commission DECIMAL(10,2),
  closing_costs DECIMAL(10,2),
  concessions DECIMAL(10,2),

  -- Net
  gross_proceeds DECIMAL(12,2),
  net_proceeds DECIMAL(12,2),

  -- Financing
  buyer_financing_type TEXT, -- cash, conventional, fha, va, hard_money
  earnest_money DECIMAL(10,2),
  option_period_days INTEGER,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sales_project ON sales(project_id);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_unit ON sales(unit_identifier);
CREATE INDEX IF NOT EXISTS idx_sales_closing ON sales(closing_date);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_sale_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  -- Calculate net proceeds
  NEW.gross_proceeds = COALESCE(NEW.sale_price, NEW.list_price, 0);
  NEW.net_proceeds = NEW.gross_proceeds
    - COALESCE(NEW.broker_commission, 0)
    - COALESCE(NEW.closing_costs, 0)
    - COALESCE(NEW.concessions, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sale_updated_at
  BEFORE INSERT OR UPDATE ON sales
  FOR EACH ROW
  EXECUTE FUNCTION update_sale_updated_at();
-- Schedule Module: schedule_templates, project_schedules, schedule_phases, schedule_tasks
-- Rule-based templated scheduling with dependency management

-- Schedule Templates (Admin module)
CREATE TABLE IF NOT EXISTS schedule_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL,
  region TEXT,

  -- Template structure (phases and tasks as JSON)
  phases JSONB NOT NULL DEFAULT '[]',

  total_duration_days INTEGER,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Schedules (one per project)
CREATE TABLE IF NOT EXISTS project_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE UNIQUE,
  template_id UUID REFERENCES schedule_templates(id),

  -- Project dates
  project_start_date DATE,
  projected_end_date DATE,
  actual_end_date DATE,

  -- Status
  status TEXT DEFAULT 'draft', -- draft, active, completed, on_hold

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedule Phases
CREATE TABLE IF NOT EXISTS schedule_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID REFERENCES project_schedules(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,

  -- Calculated dates
  start_date DATE,
  end_date DATE,

  -- Progress
  percent_complete DECIMAL(5,2) DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedule Tasks
CREATE TABLE IF NOT EXISTS schedule_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID REFERENCES project_schedules(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES schedule_phases(id) ON DELETE CASCADE,

  -- Task info
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,

  -- Duration
  duration_days INTEGER NOT NULL DEFAULT 1,
  duration_type TEXT DEFAULT 'calculated', -- fixed, calculated

  -- Dependency
  predecessor_id UUID REFERENCES schedule_tasks(id),
  predecessor_type TEXT, -- FS, SS, FF, SF
  lag_days INTEGER DEFAULT 0,

  -- Dates
  scheduled_start DATE,
  scheduled_end DATE,
  actual_start DATE,
  actual_end DATE,

  -- Date override
  fixed_date DATE,
  is_date_fixed BOOLEAN DEFAULT false,

  -- Status
  status TEXT DEFAULT 'not_started', -- not_started, in_progress, completed, delayed, blocked
  percent_complete DECIMAL(5,2) DEFAULT 0,
  is_milestone BOOLEAN DEFAULT false,
  is_critical_path BOOLEAN DEFAULT false,

  -- Assignments
  assigned_to UUID,
  assigned_to_name TEXT,
  assigned_contractor_id UUID,

  -- Tracking
  notes TEXT,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_schedule_templates_type ON schedule_templates(project_type);
CREATE INDEX IF NOT EXISTS idx_project_schedules_project ON project_schedules(project_id);
CREATE INDEX IF NOT EXISTS idx_schedule_phases_schedule ON schedule_phases(schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_schedule ON schedule_tasks(schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_phase ON schedule_tasks(phase_id);
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_predecessor ON schedule_tasks(predecessor_id);

-- Function to recalculate schedule dates based on dependencies
CREATE OR REPLACE FUNCTION recalculate_schedule_dates(p_schedule_id UUID)
RETURNS VOID AS $$
DECLARE
  v_task RECORD;
  v_predecessor_end DATE;
  v_predecessor_start DATE;
  v_start_date DATE;
  v_project_start DATE;
BEGIN
  SELECT project_start_date INTO v_project_start
  FROM project_schedules WHERE id = p_schedule_id;

  IF v_project_start IS NULL THEN
    v_project_start := CURRENT_DATE;
  END IF;

  -- Process tasks without predecessors first, then with predecessors
  FOR v_task IN (
    SELECT * FROM schedule_tasks
    WHERE schedule_id = p_schedule_id
    ORDER BY
      CASE WHEN predecessor_id IS NULL THEN 0 ELSE 1 END,
      sort_order
  ) LOOP
    IF v_task.is_date_fixed AND v_task.fixed_date IS NOT NULL THEN
      v_start_date := v_task.fixed_date;
    ELSIF v_task.predecessor_id IS NOT NULL THEN
      SELECT scheduled_end, scheduled_start
      INTO v_predecessor_end, v_predecessor_start
      FROM schedule_tasks WHERE id = v_task.predecessor_id;

      IF v_predecessor_end IS NULL THEN
        v_start_date := v_project_start;
      ELSE
        CASE v_task.predecessor_type
          WHEN 'FS' THEN
            v_start_date := v_predecessor_end + v_task.lag_days;
          WHEN 'SS' THEN
            v_start_date := v_predecessor_start + v_task.lag_days;
          WHEN 'FF' THEN
            v_start_date := v_predecessor_end + v_task.lag_days - v_task.duration_days;
          WHEN 'SF' THEN
            v_start_date := v_predecessor_start + v_task.lag_days - v_task.duration_days;
          ELSE
            v_start_date := v_predecessor_end + v_task.lag_days;
        END CASE;
      END IF;
    ELSE
      v_start_date := v_project_start;
    END IF;

    UPDATE schedule_tasks
    SET scheduled_start = v_start_date,
        scheduled_end = v_start_date + duration_days
    WHERE id = v_task.id;
  END LOOP;

  -- Update projected end date
  UPDATE project_schedules
  SET projected_end_date = (
    SELECT MAX(scheduled_end) FROM schedule_tasks WHERE schedule_id = p_schedule_id
  ),
  updated_at = NOW()
  WHERE id = p_schedule_id;

  -- Update phase dates
  UPDATE schedule_phases sp
  SET start_date = sub.min_start,
      end_date = sub.max_end
  FROM (
    SELECT phase_id, MIN(scheduled_start) AS min_start, MAX(scheduled_end) AS max_end
    FROM schedule_tasks
    WHERE schedule_id = p_schedule_id
    GROUP BY phase_id
  ) sub
  WHERE sp.id = sub.phase_id;
END;
$$ LANGUAGE plpgsql;

-- RLS
ALTER TABLE schedule_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "schedule_templates_select" ON schedule_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "schedule_templates_insert" ON schedule_templates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "schedule_templates_update" ON schedule_templates FOR UPDATE TO authenticated USING (true);
CREATE POLICY "schedule_templates_delete" ON schedule_templates FOR DELETE TO authenticated USING (true);

CREATE POLICY "project_schedules_select" ON project_schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "project_schedules_insert" ON project_schedules FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "project_schedules_update" ON project_schedules FOR UPDATE TO authenticated USING (true);
CREATE POLICY "project_schedules_delete" ON project_schedules FOR DELETE TO authenticated USING (true);

CREATE POLICY "schedule_phases_select" ON schedule_phases FOR SELECT TO authenticated USING (true);
CREATE POLICY "schedule_phases_insert" ON schedule_phases FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "schedule_phases_update" ON schedule_phases FOR UPDATE TO authenticated USING (true);
CREATE POLICY "schedule_phases_delete" ON schedule_phases FOR DELETE TO authenticated USING (true);

CREATE POLICY "schedule_tasks_select" ON schedule_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "schedule_tasks_insert" ON schedule_tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "schedule_tasks_update" ON schedule_tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "schedule_tasks_delete" ON schedule_tasks FOR DELETE TO authenticated USING (true);
