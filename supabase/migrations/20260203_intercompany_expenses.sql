-- ============================================================================
-- INTERCOMPANY TRANSFERS AND EXPENSE TRACKING
-- ============================================================================
-- This migration adds:
-- 1. Entity Hierarchy (ownership relationships)
-- 2. Intercompany Transfers (developer fees, management fees, etc.)
-- 3. Intercompany Balances (running totals)
-- 4. Expenses / Receipts
-- 5. Expense Categories
-- ============================================================================

-- =============================================
-- ENTITY HIERARCHY (Ownership Relationships)
-- =============================================
CREATE TABLE IF NOT EXISTS entity_hierarchy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  parent_entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  child_entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,

  ownership_percentage DECIMAL(5,2) NOT NULL CHECK (ownership_percentage > 0 AND ownership_percentage <= 100),

  consolidation_method TEXT DEFAULT 'full' CHECK (consolidation_method IN ('full', 'equity', 'cost', 'none')),

  effective_date DATE NOT NULL,
  end_date DATE,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(parent_entity_id, child_entity_id),
  CONSTRAINT no_self_ownership CHECK (parent_entity_id != child_entity_id)
);

-- =============================================
-- INTERCOMPANY TRANSFERS
-- =============================================
CREATE TABLE IF NOT EXISTS intercompany_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  transfer_number VARCHAR(20) NOT NULL,
  transfer_date DATE NOT NULL,

  from_entity_id UUID NOT NULL REFERENCES entities(id),
  to_entity_id UUID NOT NULL REFERENCES entities(id),

  transfer_type TEXT NOT NULL CHECK (transfer_type IN (
    'developer_fee', 'management_fee', 'capital_contribution', 'distribution',
    'loan_advance', 'loan_repayment', 'expense_allocation', 'other'
  )),

  amount DECIMAL(15,2) NOT NULL,
  description TEXT NOT NULL,

  project_id UUID REFERENCES projects(id),

  -- GL Accounts for From Entity
  from_expense_account_id UUID REFERENCES chart_of_accounts(id),
  from_cash_account_id UUID REFERENCES chart_of_accounts(id),

  -- GL Accounts for To Entity
  to_cash_account_id UUID REFERENCES chart_of_accounts(id),
  to_income_account_id UUID REFERENCES chart_of_accounts(id),

  -- Journal Entry References
  from_journal_entry_id UUID REFERENCES journal_entries(id),
  to_journal_entry_id UUID REFERENCES journal_entries(id),

  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'voided')),

  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency TEXT CHECK (recurring_frequency IN ('monthly', 'quarterly', 'annually')),
  recurring_day INTEGER,
  recurring_end_date DATE,

  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT different_entities CHECK (from_entity_id <> to_entity_id)
);

-- =============================================
-- INTERCOMPANY BALANCES (Running Totals)
-- =============================================
CREATE TABLE IF NOT EXISTS intercompany_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  entity1_id UUID NOT NULL REFERENCES entities(id),
  entity2_id UUID NOT NULL REFERENCES entities(id),

  -- From entity1's perspective
  receivable_amount DECIMAL(15,2) DEFAULT 0, -- Entity2 owes Entity1
  payable_amount DECIMAL(15,2) DEFAULT 0,    -- Entity1 owes Entity2
  net_balance DECIMAL(15,2) GENERATED ALWAYS AS (receivable_amount - payable_amount) STORED,

  last_updated TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(entity1_id, entity2_id),
  CONSTRAINT ordered_entities CHECK (entity1_id < entity2_id)
);

-- =============================================
-- EXPENSES / RECEIPTS
-- =============================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,

  expense_date DATE NOT NULL,

  vendor_id UUID REFERENCES vendors(id),
  vendor_name VARCHAR(200), -- For quick entry without vendor record

  amount DECIMAL(15,2) NOT NULL,

  payment_method TEXT NOT NULL CHECK (payment_method IN (
    'cash', 'company_card', 'personal_card', 'check', 'ach', 'reimbursable'
  )),

  category TEXT,
  account_id UUID REFERENCES chart_of_accounts(id),

  description TEXT,

  project_id UUID REFERENCES projects(id),
  cost_code_id UUID,

  -- Receipt
  receipt_url TEXT,
  receipt_file_name VARCHAR(255),

  -- Approval Workflow
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'reimbursed', 'voided')),
  submitted_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- If reimbursable
  reimbursed_at TIMESTAMPTZ,
  reimbursement_method TEXT,
  reimbursement_reference VARCHAR(100),

  -- Link to bill if converted
  bill_id UUID REFERENCES bills(id),

  journal_entry_id UUID REFERENCES journal_entries(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- EXPENSE CATEGORIES
-- =============================================
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES entities(id), -- NULL = global template

  name VARCHAR(100) NOT NULL,
  description TEXT,
  default_account_id UUID REFERENCES chart_of_accounts(id),

  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_entity_hierarchy_parent ON entity_hierarchy(parent_entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_hierarchy_child ON entity_hierarchy(child_entity_id);

CREATE INDEX IF NOT EXISTS idx_ic_transfers_from ON intercompany_transfers(from_entity_id);
CREATE INDEX IF NOT EXISTS idx_ic_transfers_to ON intercompany_transfers(to_entity_id);
CREATE INDEX IF NOT EXISTS idx_ic_transfers_date ON intercompany_transfers(transfer_date);
CREATE INDEX IF NOT EXISTS idx_ic_transfers_type ON intercompany_transfers(transfer_type);

CREATE INDEX IF NOT EXISTS idx_ic_balances_entity1 ON intercompany_balances(entity1_id);
CREATE INDEX IF NOT EXISTS idx_ic_balances_entity2 ON intercompany_balances(entity2_id);

CREATE INDEX IF NOT EXISTS idx_expenses_entity ON expenses(entity_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_project ON expenses(project_id);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE entity_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE intercompany_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE intercompany_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================
CREATE POLICY "Allow authenticated access to entity_hierarchy"
  ON entity_hierarchy FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to intercompany_transfers"
  ON intercompany_transfers FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to intercompany_balances"
  ON intercompany_balances FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to expenses"
  ON expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to expense_categories"
  ON expense_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
