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
