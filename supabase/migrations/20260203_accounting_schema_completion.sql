-- ============================================================================
-- ACCOUNTING SCHEMA COMPLETION
-- ============================================================================
-- This migration adds missing tables required by Section 4 of the Entity
-- Accounting Module Architecture specification.
--
-- TABLES ADDED:
-- 1. vendor_w9s - W9 form tracking for vendors
-- 2. vendor_1099_tracking - 1099 vendor qualification tracking
-- 3. vendor_1099_payments - Individual 1099-eligible payments
-- 4. filing_1099_batches - 1099 filing batch tracking
-- 5. expense_line_items - Expense receipt line items
-- 6. month_end_checklist_templates - Month-end close templates
-- 7. month_end_template_items - Items within close templates
-- 8. period_close_checklists - Period-specific close checklists
-- 9. period_close_checklist_items - Individual checklist items
-- 10. closing_entries - Period closing journal entries
-- 11. period_account_balances - Snapshot of balances at period close
-- 12. loan_amortization_schedule - Loan amortization schedules
-- 13. intercompany_transactions - Standardized name for IC transfers
-- 14. entity_ownership - Individual owner tracking
-- 15. entity_tasks - Entity-specific task management
-- ============================================================================

-- =============================================
-- VENDOR W9 TRACKING
-- =============================================
CREATE TABLE IF NOT EXISTS vendor_w9s (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,

  -- W9 Form Data
  legal_name VARCHAR(200) NOT NULL,
  business_name VARCHAR(200),
  federal_tax_classification TEXT CHECK (federal_tax_classification IN (
    'individual', 'sole_proprietor', 'c_corp', 's_corp', 'partnership',
    'trust_estate', 'llc', 'other'
  )),
  llc_tax_classification TEXT CHECK (llc_tax_classification IN ('c', 's', 'p')),

  -- Tax ID
  tin_type TEXT NOT NULL CHECK (tin_type IN ('ssn', 'ein')),
  tin_last_four VARCHAR(4) NOT NULL, -- Only store last 4 for display
  tin_encrypted TEXT, -- Encrypted full TIN

  -- Address
  address_line1 VARCHAR(200),
  address_line2 VARCHAR(200),
  city VARCHAR(100),
  state VARCHAR(50),
  zip VARCHAR(20),

  -- Form Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'verified', 'expired', 'rejected')),
  received_date DATE,
  verified_date DATE,
  verified_by UUID REFERENCES auth.users(id),
  expiration_date DATE,
  rejection_reason TEXT,

  -- Document
  document_path TEXT,
  document_name VARCHAR(255),

  -- Exempt Status
  exempt_payee_code VARCHAR(10),
  fatca_exemption_code VARCHAR(10),

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- VENDOR 1099 TRACKING (Qualification Status)
-- =============================================
CREATE TABLE IF NOT EXISTS vendor_1099_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,

  -- 1099 Status
  is_1099_eligible BOOLEAN DEFAULT true,
  form_type TEXT DEFAULT '1099-NEC' CHECK (form_type IN ('1099-NEC', '1099-MISC', '1099-INT', '1099-DIV')),

  -- Totals for the Year
  total_payments DECIMAL(15,2) DEFAULT 0,
  threshold_amount DECIMAL(15,2) DEFAULT 600.00,
  exceeds_threshold BOOLEAN GENERATED ALWAYS AS (total_payments >= threshold_amount) STORED,

  -- W9 Reference
  w9_id UUID REFERENCES vendor_w9s(id),
  w9_status TEXT DEFAULT 'missing' CHECK (w9_status IN ('missing', 'pending', 'received', 'verified')),

  -- 1099 Filing Status
  filing_status TEXT DEFAULT 'pending' CHECK (filing_status IN (
    'pending', 'ready', 'filed', 'corrected', 'excluded'
  )),
  excluded_reason TEXT,

  -- Filing Info
  filed_date DATE,
  filed_batch_id UUID,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(vendor_id, entity_id, tax_year)
);

-- =============================================
-- VENDOR 1099 PAYMENTS (Individual Payments)
-- =============================================
CREATE TABLE IF NOT EXISTS vendor_1099_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id UUID NOT NULL REFERENCES vendor_1099_tracking(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  entity_id UUID NOT NULL REFERENCES entities(id),

  -- Payment Reference
  payment_type TEXT NOT NULL CHECK (payment_type IN ('bill_payment', 'expense', 'manual')),
  bill_payment_id UUID REFERENCES bill_payments(id),
  expense_id UUID REFERENCES expenses(id),

  payment_date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,

  -- 1099 Box Assignment
  box_number INTEGER DEFAULT 1, -- Box 1 = Nonemployee Compensation for 1099-NEC

  -- Inclusion Status
  is_included BOOLEAN DEFAULT true,
  exclusion_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 1099 FILING BATCHES
-- =============================================
CREATE TABLE IF NOT EXISTS filing_1099_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,

  batch_number VARCHAR(20) NOT NULL,
  tax_year INTEGER NOT NULL,
  form_type TEXT DEFAULT '1099-NEC',

  -- Filing Info
  filing_date DATE,
  filing_method TEXT CHECK (filing_method IN ('electronic', 'paper', 'service')),

  -- Counts
  total_forms INTEGER DEFAULT 0,
  total_amount DECIMAL(15,2) DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'submitted', 'accepted', 'rejected', 'corrected')),

  -- IRS Info
  irs_submission_id VARCHAR(50),
  irs_receipt_id VARCHAR(50),
  irs_status TEXT,
  irs_status_date TIMESTAMPTZ,

  -- Correction
  original_batch_id UUID REFERENCES filing_1099_batches(id),
  is_correction BOOLEAN DEFAULT false,

  notes TEXT,

  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(entity_id, batch_number)
);

-- =============================================
-- EXPENSE LINE ITEMS
-- =============================================
CREATE TABLE IF NOT EXISTS expense_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,

  line_number INTEGER NOT NULL,

  account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
  description TEXT,
  quantity DECIMAL(10,4) DEFAULT 1,
  unit_price DECIMAL(15,4),
  amount DECIMAL(15,2) NOT NULL,

  project_id UUID REFERENCES projects(id),
  cost_code_id UUID,

  is_billable BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MONTH-END CHECKLIST TEMPLATES
-- =============================================
CREATE TABLE IF NOT EXISTS month_end_checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES entities(id) ON DELETE CASCADE, -- NULL = global template

  template_name VARCHAR(100) NOT NULL,
  description TEXT,

  is_system BOOLEAN DEFAULT false, -- System templates can't be deleted
  is_active BOOLEAN DEFAULT true,

  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MONTH-END TEMPLATE ITEMS
-- =============================================
CREATE TABLE IF NOT EXISTS month_end_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES month_end_checklist_templates(id) ON DELETE CASCADE,

  item_order INTEGER NOT NULL,
  category VARCHAR(100) NOT NULL, -- e.g., 'Accounts Receivable', 'Accounts Payable', 'Cash & Bank'

  task_name VARCHAR(200) NOT NULL,
  description TEXT,
  instructions TEXT,

  -- Assignment
  default_assignee_role VARCHAR(50), -- e.g., 'ar_specialist', 'ap_specialist', 'controller'

  -- Dependencies
  depends_on_item_id UUID REFERENCES month_end_template_items(id),

  -- Timing
  typical_duration_hours DECIMAL(4,1),
  deadline_day INTEGER, -- Day of month (negative = days before month end)

  is_required BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PERIOD CLOSE CHECKLISTS
-- =============================================
CREATE TABLE IF NOT EXISTS period_close_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  fiscal_period_id UUID NOT NULL REFERENCES fiscal_periods(id),

  -- Source Template
  template_id UUID REFERENCES month_end_checklist_templates(id),

  -- Period Info
  period_name VARCHAR(50) NOT NULL,
  target_completion_date DATE,

  -- Status
  status TEXT DEFAULT 'not_started' CHECK (status IN (
    'not_started', 'in_progress', 'review', 'completed', 'locked'
  )),

  -- Progress
  total_items INTEGER DEFAULT 0,
  completed_items INTEGER DEFAULT 0,
  progress_percent DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN total_items > 0 THEN (completed_items::DECIMAL / total_items * 100) ELSE 0 END
  ) STORED,

  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),

  -- Completion
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(entity_id, fiscal_period_id)
);

-- =============================================
-- PERIOD CLOSE CHECKLIST ITEMS
-- =============================================
CREATE TABLE IF NOT EXISTS period_close_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID NOT NULL REFERENCES period_close_checklists(id) ON DELETE CASCADE,
  template_item_id UUID REFERENCES month_end_template_items(id),

  item_order INTEGER NOT NULL,
  category VARCHAR(100) NOT NULL,

  task_name VARCHAR(200) NOT NULL,
  description TEXT,
  instructions TEXT,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'skipped')),

  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),

  -- Completion
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id),

  -- Blocking/Issues
  blocked_reason TEXT,
  blocked_by_item_id UUID REFERENCES period_close_checklist_items(id),

  -- Attachments/Notes
  notes TEXT,
  attachment_path TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CLOSING ENTRIES
-- =============================================
CREATE TABLE IF NOT EXISTS closing_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  fiscal_period_id UUID NOT NULL REFERENCES fiscal_periods(id),

  entry_type TEXT NOT NULL CHECK (entry_type IN (
    'revenue_close', 'expense_close', 'income_summary', 'dividend_close', 'adjustment'
  )),

  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id),

  description TEXT,

  -- Automation
  is_auto_generated BOOLEAN DEFAULT false,

  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(fiscal_period_id, entry_type)
);

-- =============================================
-- PERIOD ACCOUNT BALANCES (Snapshot at Period Close)
-- =============================================
CREATE TABLE IF NOT EXISTS period_account_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  fiscal_period_id UUID NOT NULL REFERENCES fiscal_periods(id),
  account_id UUID NOT NULL REFERENCES chart_of_accounts(id),

  -- Balances
  beginning_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  period_debits DECIMAL(15,2) NOT NULL DEFAULT 0,
  period_credits DECIMAL(15,2) NOT NULL DEFAULT 0,
  ending_balance DECIMAL(15,2) NOT NULL DEFAULT 0,

  -- Activity counts
  transaction_count INTEGER DEFAULT 0,

  -- Snapshot Info
  snapshot_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(fiscal_period_id, account_id)
);

-- =============================================
-- LOAN AMORTIZATION SCHEDULE
-- =============================================
CREATE TABLE IF NOT EXISTS loan_amortization_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,

  payment_number INTEGER NOT NULL,
  payment_date DATE NOT NULL,

  -- Scheduled Amounts
  scheduled_payment DECIMAL(15,2) NOT NULL,
  principal_amount DECIMAL(15,2) NOT NULL,
  interest_amount DECIMAL(15,2) NOT NULL,

  -- Balances
  beginning_balance DECIMAL(15,2) NOT NULL,
  ending_balance DECIMAL(15,2) NOT NULL,

  -- Actual Payment Tracking
  actual_payment_date DATE,
  actual_payment_amount DECIMAL(15,2),
  actual_principal DECIMAL(15,2),
  actual_interest DECIMAL(15,2),

  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'paid', 'partial', 'late', 'missed')),

  -- Link to actual payment
  loan_payment_id UUID REFERENCES loan_payments(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(loan_id, payment_number)
);

-- =============================================
-- INTERCOMPANY TRANSACTIONS (View/Alias for consistency)
-- =============================================
-- Note: We already have intercompany_transfers, so create a view for API compatibility
CREATE OR REPLACE VIEW intercompany_transactions AS
SELECT
  id,
  transfer_number AS transaction_number,
  transfer_date AS transaction_date,
  from_entity_id,
  to_entity_id,
  transfer_type AS transaction_type,
  amount,
  description,
  project_id,
  from_journal_entry_id,
  to_journal_entry_id,
  status,
  created_by,
  created_at,
  updated_at
FROM intercompany_transfers;

-- =============================================
-- ENTITY OWNERSHIP (Individual Owners)
-- =============================================
CREATE TABLE IF NOT EXISTS entity_ownership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,

  -- Owner Info (can be an individual or another entity)
  owner_type TEXT NOT NULL CHECK (owner_type IN ('individual', 'entity', 'trust')),
  owner_entity_id UUID REFERENCES entities(id), -- If owner is another entity
  owner_contact_id UUID REFERENCES contacts(id), -- If owner is an individual

  -- Owner Details (for individuals not in contacts)
  owner_name VARCHAR(200),
  owner_email VARCHAR(200),
  owner_phone VARCHAR(50),
  owner_address TEXT,

  -- Tax Info
  owner_tin_type TEXT CHECK (owner_tin_type IN ('ssn', 'ein')),
  owner_tin_last_four VARCHAR(4),

  -- Ownership
  ownership_percentage DECIMAL(6,4) NOT NULL CHECK (ownership_percentage >= 0 AND ownership_percentage <= 100),
  ownership_class TEXT, -- e.g., 'Class A', 'Class B', 'Managing Member'

  -- Capital Account
  initial_contribution DECIMAL(15,2) DEFAULT 0,
  capital_account_balance DECIMAL(15,2) DEFAULT 0,

  -- Dates
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,

  -- Distribution Preferences
  preferred_return_rate DECIMAL(6,4),
  distribution_priority INTEGER,

  -- Status
  is_active BOOLEAN DEFAULT true,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ENTITY TASKS (Entity-Specific Task Management)
-- =============================================
CREATE TABLE IF NOT EXISTS entity_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,

  -- Task Info
  task_number VARCHAR(20),
  title VARCHAR(200) NOT NULL,
  description TEXT,

  -- Categorization
  category TEXT CHECK (category IN (
    'accounting', 'tax', 'compliance', 'audit', 'reporting', 'banking', 'other'
  )),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

  -- Dates
  due_date DATE,
  reminder_date DATE,

  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  assigned_by UUID REFERENCES auth.users(id),

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'review', 'completed', 'cancelled'
  )),

  -- Related Records
  related_type TEXT, -- e.g., 'invoice', 'bill', 'reconciliation', 'period_close'
  related_id UUID,

  -- Completion
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id),

  -- Recurrence
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT, -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
  recurrence_end_date DATE,
  parent_task_id UUID REFERENCES entity_tasks(id),

  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_vendor_w9s_vendor ON vendor_w9s(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_w9s_entity ON vendor_w9s(entity_id);
CREATE INDEX IF NOT EXISTS idx_vendor_w9s_status ON vendor_w9s(status);

CREATE INDEX IF NOT EXISTS idx_vendor_1099_tracking_vendor ON vendor_1099_tracking(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_1099_tracking_entity ON vendor_1099_tracking(entity_id);
CREATE INDEX IF NOT EXISTS idx_vendor_1099_tracking_year ON vendor_1099_tracking(tax_year);
CREATE INDEX IF NOT EXISTS idx_vendor_1099_tracking_status ON vendor_1099_tracking(filing_status);

CREATE INDEX IF NOT EXISTS idx_vendor_1099_payments_tracking ON vendor_1099_payments(tracking_id);
CREATE INDEX IF NOT EXISTS idx_vendor_1099_payments_vendor ON vendor_1099_payments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_1099_payments_date ON vendor_1099_payments(payment_date);

CREATE INDEX IF NOT EXISTS idx_filing_1099_batches_entity ON filing_1099_batches(entity_id);
CREATE INDEX IF NOT EXISTS idx_filing_1099_batches_year ON filing_1099_batches(tax_year);
CREATE INDEX IF NOT EXISTS idx_filing_1099_batches_status ON filing_1099_batches(status);

CREATE INDEX IF NOT EXISTS idx_expense_line_items_expense ON expense_line_items(expense_id);

CREATE INDEX IF NOT EXISTS idx_month_end_templates_entity ON month_end_checklist_templates(entity_id);
CREATE INDEX IF NOT EXISTS idx_month_end_items_template ON month_end_template_items(template_id);

CREATE INDEX IF NOT EXISTS idx_period_close_checklists_entity ON period_close_checklists(entity_id);
CREATE INDEX IF NOT EXISTS idx_period_close_checklists_period ON period_close_checklists(fiscal_period_id);
CREATE INDEX IF NOT EXISTS idx_period_close_checklists_status ON period_close_checklists(status);

CREATE INDEX IF NOT EXISTS idx_period_close_items_checklist ON period_close_checklist_items(checklist_id);
CREATE INDEX IF NOT EXISTS idx_period_close_items_status ON period_close_checklist_items(status);
CREATE INDEX IF NOT EXISTS idx_period_close_items_assigned ON period_close_checklist_items(assigned_to);

CREATE INDEX IF NOT EXISTS idx_closing_entries_entity ON closing_entries(entity_id);
CREATE INDEX IF NOT EXISTS idx_closing_entries_period ON closing_entries(fiscal_period_id);

CREATE INDEX IF NOT EXISTS idx_period_account_balances_entity ON period_account_balances(entity_id);
CREATE INDEX IF NOT EXISTS idx_period_account_balances_period ON period_account_balances(fiscal_period_id);
CREATE INDEX IF NOT EXISTS idx_period_account_balances_account ON period_account_balances(account_id);

CREATE INDEX IF NOT EXISTS idx_loan_amort_loan ON loan_amortization_schedule(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_amort_date ON loan_amortization_schedule(payment_date);
CREATE INDEX IF NOT EXISTS idx_loan_amort_status ON loan_amortization_schedule(status);

CREATE INDEX IF NOT EXISTS idx_entity_ownership_entity ON entity_ownership(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_ownership_owner_entity ON entity_ownership(owner_entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_ownership_contact ON entity_ownership(owner_contact_id);
CREATE INDEX IF NOT EXISTS idx_entity_ownership_active ON entity_ownership(is_active);

CREATE INDEX IF NOT EXISTS idx_entity_tasks_entity ON entity_tasks(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_tasks_assigned ON entity_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_entity_tasks_status ON entity_tasks(status);
CREATE INDEX IF NOT EXISTS idx_entity_tasks_due ON entity_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_entity_tasks_category ON entity_tasks(category);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE vendor_w9s ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_1099_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_1099_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE filing_1099_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE month_end_checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE month_end_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE period_close_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE period_close_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE closing_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE period_account_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_amortization_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_tasks ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================
CREATE POLICY "Allow authenticated access to vendor_w9s"
  ON vendor_w9s FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to vendor_1099_tracking"
  ON vendor_1099_tracking FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to vendor_1099_payments"
  ON vendor_1099_payments FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to filing_1099_batches"
  ON filing_1099_batches FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to expense_line_items"
  ON expense_line_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to month_end_checklist_templates"
  ON month_end_checklist_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to month_end_template_items"
  ON month_end_template_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to period_close_checklists"
  ON period_close_checklists FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to period_close_checklist_items"
  ON period_close_checklist_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to closing_entries"
  ON closing_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to period_account_balances"
  ON period_account_balances FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to loan_amortization_schedule"
  ON loan_amortization_schedule FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to entity_ownership"
  ON entity_ownership FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to entity_tasks"
  ON entity_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================
-- DEFAULT MONTH-END CHECKLIST TEMPLATE
-- =============================================
INSERT INTO month_end_checklist_templates (template_name, description, is_system, is_active)
SELECT 'Standard Month-End Close', 'Default month-end close checklist for real estate entities', true, true
WHERE NOT EXISTS (SELECT 1 FROM month_end_checklist_templates WHERE template_name = 'Standard Month-End Close');

-- Insert template items
INSERT INTO month_end_template_items (template_id, item_order, category, task_name, description, default_assignee_role, is_required)
SELECT t.id, i.item_order, i.category, i.task_name, i.description, i.default_assignee_role, i.is_required
FROM month_end_checklist_templates t
CROSS JOIN (VALUES
  (1, 'Accounts Receivable', 'Review and post all cash receipts', 'Ensure all customer payments are recorded', 'ar_specialist', true),
  (2, 'Accounts Receivable', 'Reconcile AR subledger to GL', 'Verify AR balance matches general ledger', 'ar_specialist', true),
  (3, 'Accounts Receivable', 'Review AR aging and bad debt allowance', 'Analyze aged receivables and adjust allowance', 'ar_specialist', true),
  (4, 'Accounts Receivable', 'Post AR adjustments', 'Record any necessary adjustments', 'ar_specialist', true),
  (5, 'Accounts Payable', 'Review and post all invoices received', 'Ensure all vendor invoices are recorded', 'ap_specialist', true),
  (6, 'Accounts Payable', 'Reconcile AP subledger to GL', 'Verify AP balance matches general ledger', 'ap_specialist', true),
  (7, 'Accounts Payable', 'Review accrued expenses', 'Identify and record accruals', 'ap_specialist', true),
  (8, 'Accounts Payable', 'Verify vendor statement reconciliations', 'Reconcile key vendor statements', 'ap_specialist', true),
  (9, 'Cash & Bank', 'Complete all bank reconciliations', 'Reconcile all bank accounts', 'controller', true),
  (10, 'Cash & Bank', 'Record bank fees and interest', 'Post bank charges and interest income', 'controller', true),
  (11, 'Cash & Bank', 'Review outstanding checks', 'Follow up on stale checks', 'controller', true),
  (12, 'Fixed Assets', 'Post depreciation entries', 'Record monthly depreciation', 'controller', true),
  (13, 'Fixed Assets', 'Review asset additions/disposals', 'Record any asset changes', 'controller', true),
  (14, 'Fixed Assets', 'Reconcile fixed asset register to GL', 'Verify asset balances', 'controller', true),
  (15, 'Intercompany', 'Review intercompany transactions', 'Verify IC transactions are balanced', 'controller', true),
  (16, 'Intercompany', 'Reconcile due to/from balances', 'Ensure IC balances match across entities', 'controller', true),
  (17, 'Final Review', 'Run trial balance and review for anomalies', 'Identify unusual balances or variances', 'cfo', true),
  (18, 'Final Review', 'Review intercompany eliminations', 'Prepare consolidation entries if needed', 'cfo', true),
  (19, 'Final Review', 'CFO final review and sign-off', 'Management approval of close', 'cfo', true),
  (20, 'Final Review', 'Lock period in system', 'Close the accounting period', 'controller', true)
) AS i(item_order, category, task_name, description, default_assignee_role, is_required)
WHERE t.template_name = 'Standard Month-End Close'
AND NOT EXISTS (SELECT 1 FROM month_end_template_items WHERE template_id = t.id);

-- =============================================
-- UPDATED_AT TRIGGERS
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_vendor_w9s_updated_at ON vendor_w9s;
CREATE TRIGGER update_vendor_w9s_updated_at
  BEFORE UPDATE ON vendor_w9s FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vendor_1099_tracking_updated_at ON vendor_1099_tracking;
CREATE TRIGGER update_vendor_1099_tracking_updated_at
  BEFORE UPDATE ON vendor_1099_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_filing_1099_batches_updated_at ON filing_1099_batches;
CREATE TRIGGER update_filing_1099_batches_updated_at
  BEFORE UPDATE ON filing_1099_batches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_month_end_templates_updated_at ON month_end_checklist_templates;
CREATE TRIGGER update_month_end_templates_updated_at
  BEFORE UPDATE ON month_end_checklist_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_period_close_checklists_updated_at ON period_close_checklists;
CREATE TRIGGER update_period_close_checklists_updated_at
  BEFORE UPDATE ON period_close_checklists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_period_close_items_updated_at ON period_close_checklist_items;
CREATE TRIGGER update_period_close_items_updated_at
  BEFORE UPDATE ON period_close_checklist_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_entity_ownership_updated_at ON entity_ownership;
CREATE TRIGGER update_entity_ownership_updated_at
  BEFORE UPDATE ON entity_ownership FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_entity_tasks_updated_at ON entity_tasks;
CREATE TRIGGER update_entity_tasks_updated_at
  BEFORE UPDATE ON entity_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to generate loan amortization schedule
CREATE OR REPLACE FUNCTION generate_loan_amortization(
  p_loan_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_loan RECORD;
  v_payment_num INTEGER := 1;
  v_balance DECIMAL(15,2);
  v_payment DECIMAL(15,2);
  v_interest DECIMAL(15,2);
  v_principal DECIMAL(15,2);
  v_monthly_rate DECIMAL(10,8);
  v_payment_date DATE;
  v_count INTEGER := 0;
BEGIN
  -- Get loan details
  SELECT * INTO v_loan FROM loans WHERE id = p_loan_id;

  IF v_loan IS NULL THEN
    RAISE EXCEPTION 'Loan not found';
  END IF;

  -- Delete existing schedule
  DELETE FROM loan_amortization_schedule WHERE loan_id = p_loan_id;

  -- Initialize
  v_balance := v_loan.commitment_amount;
  v_monthly_rate := v_loan.interest_rate / 12 / 100;
  v_payment_date := v_loan.first_payment_date;

  -- Calculate monthly payment (if amortizing)
  IF v_loan.amortization_months IS NOT NULL AND v_loan.amortization_months > 0 THEN
    v_payment := v_balance * (v_monthly_rate * POWER(1 + v_monthly_rate, v_loan.amortization_months))
                 / (POWER(1 + v_monthly_rate, v_loan.amortization_months) - 1);
  ELSE
    v_payment := v_balance * v_monthly_rate; -- Interest only
  END IF;

  -- Generate schedule
  WHILE v_payment_num <= COALESCE(v_loan.amortization_months, v_loan.term_months) AND v_balance > 0.01 LOOP
    v_interest := v_balance * v_monthly_rate;

    -- Check if in IO period
    IF v_loan.io_period_months IS NOT NULL AND v_payment_num <= v_loan.io_period_months THEN
      v_principal := 0;
      v_payment := v_interest;
    ELSE
      v_principal := v_payment - v_interest;
      IF v_principal > v_balance THEN
        v_principal := v_balance;
        v_payment := v_principal + v_interest;
      END IF;
    END IF;

    INSERT INTO loan_amortization_schedule (
      loan_id, payment_number, payment_date,
      scheduled_payment, principal_amount, interest_amount,
      beginning_balance, ending_balance
    ) VALUES (
      p_loan_id, v_payment_num, v_payment_date,
      ROUND(v_payment, 2), ROUND(v_principal, 2), ROUND(v_interest, 2),
      ROUND(v_balance, 2), ROUND(v_balance - v_principal, 2)
    );

    v_balance := v_balance - v_principal;
    v_payment_date := v_payment_date + INTERVAL '1 month';
    v_payment_num := v_payment_num + 1;
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function to create period close checklist from template
CREATE OR REPLACE FUNCTION create_period_close_checklist(
  p_entity_id UUID,
  p_fiscal_period_id UUID,
  p_template_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_checklist_id UUID;
  v_template_id UUID;
  v_period RECORD;
  v_item RECORD;
BEGIN
  -- Get period info
  SELECT * INTO v_period FROM fiscal_periods WHERE id = p_fiscal_period_id;

  -- Find template
  IF p_template_id IS NOT NULL THEN
    v_template_id := p_template_id;
  ELSE
    SELECT id INTO v_template_id
    FROM month_end_checklist_templates
    WHERE (entity_id = p_entity_id OR entity_id IS NULL)
      AND is_active = true
    ORDER BY entity_id NULLS LAST
    LIMIT 1;
  END IF;

  -- Create checklist
  INSERT INTO period_close_checklists (
    entity_id, fiscal_period_id, template_id, period_name,
    target_completion_date, total_items
  )
  SELECT
    p_entity_id, p_fiscal_period_id, v_template_id, v_period.period_name,
    v_period.end_date + 10, -- Default 10 days after period end
    (SELECT COUNT(*) FROM month_end_template_items WHERE template_id = v_template_id)
  RETURNING id INTO v_checklist_id;

  -- Create checklist items from template
  INSERT INTO period_close_checklist_items (
    checklist_id, template_item_id, item_order, category,
    task_name, description, instructions
  )
  SELECT
    v_checklist_id, id, item_order, category,
    task_name, description, instructions
  FROM month_end_template_items
  WHERE template_id = v_template_id
  ORDER BY item_order;

  RETURN v_checklist_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update 1099 tracking totals
CREATE OR REPLACE FUNCTION update_vendor_1099_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the tracking record total
  UPDATE vendor_1099_tracking
  SET total_payments = (
    SELECT COALESCE(SUM(amount), 0)
    FROM vendor_1099_payments
    WHERE tracking_id = COALESCE(NEW.tracking_id, OLD.tracking_id)
      AND is_included = true
  )
  WHERE id = COALESCE(NEW.tracking_id, OLD.tracking_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_1099_totals_on_payment
  AFTER INSERT OR UPDATE OR DELETE ON vendor_1099_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_vendor_1099_totals();
