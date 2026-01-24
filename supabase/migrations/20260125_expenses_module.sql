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
