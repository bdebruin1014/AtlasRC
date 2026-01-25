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
