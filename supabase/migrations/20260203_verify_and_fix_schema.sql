-- ============================================================================
-- ENTITY ACCOUNTING SCHEMA VERIFICATION AND FIX
-- ============================================================================
-- Run this in Supabase SQL Editor to verify all tables exist and create missing ones
-- ============================================================================

-- STEP 1: Check which tables exist
-- ============================================================================
DO $$
DECLARE
  missing_tables TEXT := '';
  table_check RECORD;
BEGIN
  RAISE NOTICE '=== CHECKING REQUIRED TABLES ===';

  FOR table_check IN
    SELECT unnest(ARRAY[
      'entities', 'contacts', 'projects', 'users',
      'chart_of_accounts', 'coa_templates', 'fiscal_periods', 'accounting_periods',
      'bank_accounts', 'bank_transactions', 'bank_reconciliations', 'reconciliation_items',
      'customers', 'invoices', 'invoice_lines', 'invoice_payments',
      'vendors', 'vendor_w9s', 'bills', 'bill_lines', 'bill_payments', 'bill_payment_applications',
      'expenses', 'expense_line_items',
      'journal_entries', 'journal_entry_lines',
      'month_end_checklist_templates', 'month_end_template_items',
      'period_close_checklists', 'period_close_checklist_items',
      'closing_entries', 'period_account_balances',
      'loans', 'loan_amortization_schedule', 'loan_draws', 'loan_transactions',
      'intercompany_transactions', 'entity_ownership', 'entity_tasks',
      'vendor_1099_tracking', 'vendor_1099_payments', 'filing_1099_batches',
      'employees', 'payroll_runs', 'payroll_items',
      'entity_files', 'entity_communications', 'entity_contacts'
    ]) as table_name
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = table_check.table_name
    ) THEN
      missing_tables := missing_tables || table_check.table_name || ', ';
      RAISE NOTICE 'MISSING: %', table_check.table_name;
    ELSE
      RAISE NOTICE 'EXISTS: %', table_check.table_name;
    END IF;
  END LOOP;

  IF missing_tables = '' THEN
    RAISE NOTICE '=== ALL TABLES EXIST ===';
  ELSE
    RAISE NOTICE '=== MISSING TABLES: % ===', missing_tables;
  END IF;
END $$;

-- STEP 2: Create any missing core tables
-- ============================================================================

-- Tasks table (entity-specific tasks)
CREATE TABLE IF NOT EXISTS entity_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

  title VARCHAR(255) NOT NULL,
  description TEXT,

  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

  due_date DATE,
  completed_at TIMESTAMPTZ,

  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),

  tags TEXT[],
  related_record_type VARCHAR(50),
  related_record_id UUID,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entity_tasks_entity ON entity_tasks(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_tasks_status ON entity_tasks(status);
CREATE INDEX IF NOT EXISTS idx_entity_tasks_assigned ON entity_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_entity_tasks_due ON entity_tasks(due_date);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,

  customer_name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  customer_type VARCHAR(50) DEFAULT 'business',

  email VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(255),

  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'USA',

  payment_terms VARCHAR(20) DEFAULT 'NET_30',
  credit_limit DECIMAL(15,2),
  tax_exempt BOOLEAN DEFAULT false,
  tax_id VARCHAR(50),

  default_ar_account_id UUID REFERENCES chart_of_accounts(id),
  default_revenue_account_id UUID REFERENCES chart_of_accounts(id),

  is_active BOOLEAN DEFAULT true,
  contact_id UUID REFERENCES contacts(id),

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_entity ON customers(entity_id);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(customer_name);
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(entity_id, is_active);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id),

  invoice_number VARCHAR(50) NOT NULL,
  po_number VARCHAR(50),

  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,

  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(15,2) DEFAULT 0,
  balance_due DECIMAL(15,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,

  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'void')),

  project_id UUID REFERENCES projects(id),

  memo TEXT,
  terms TEXT,
  footer_note TEXT,

  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,

  ar_account_id UUID REFERENCES chart_of_accounts(id),
  journal_entry_id UUID REFERENCES journal_entries(id),

  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_number ON invoices(entity_id, invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_entity ON invoices(entity_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(entity_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_due ON invoices(entity_id, due_date);

-- Invoice Line Items
CREATE TABLE IF NOT EXISTS invoice_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

  line_number INTEGER NOT NULL,
  description TEXT,

  quantity DECIMAL(15,4) DEFAULT 1,
  unit_price DECIMAL(15,4) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,

  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,

  revenue_account_id UUID REFERENCES chart_of_accounts(id),
  project_id UUID REFERENCES projects(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_lines_invoice ON invoice_lines(invoice_id);

-- Invoice Payments
CREATE TABLE IF NOT EXISTS invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

  payment_date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  payment_method VARCHAR(50),
  reference_number VARCHAR(100),

  bank_account_id UUID REFERENCES bank_accounts(id),
  journal_entry_id UUID REFERENCES journal_entries(id),

  memo TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice ON invoice_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_entity ON invoice_payments(entity_id);

-- Loans table
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,

  loan_name VARCHAR(255) NOT NULL,
  loan_number VARCHAR(100),

  lender_name VARCHAR(255) NOT NULL,
  lender_contact VARCHAR(255),
  lender_phone VARCHAR(50),
  lender_email VARCHAR(255),

  loan_type VARCHAR(50) NOT NULL CHECK (loan_type IN (
    'term_loan', 'line_of_credit', 'mortgage', 'construction_loan',
    'equipment_loan', 'sba_loan', 'bridge_loan', 'mezzanine', 'other'
  )),

  original_amount DECIMAL(15,2) NOT NULL,
  current_balance DECIMAL(15,2) NOT NULL,
  credit_limit DECIMAL(15,2),
  available_credit DECIMAL(15,2),

  interest_rate DECIMAL(8,5) NOT NULL,
  rate_type VARCHAR(20) DEFAULT 'fixed' CHECK (rate_type IN ('fixed', 'variable')),
  rate_index VARCHAR(50),
  rate_spread DECIMAL(8,5),

  origination_date DATE NOT NULL,
  maturity_date DATE NOT NULL,
  first_payment_date DATE,

  payment_frequency VARCHAR(20) DEFAULT 'monthly' CHECK (payment_frequency IN (
    'weekly', 'biweekly', 'monthly', 'quarterly', 'annually', 'interest_only', 'balloon'
  )),
  monthly_payment DECIMAL(15,2),

  liability_account_id UUID REFERENCES chart_of_accounts(id),
  interest_expense_account_id UUID REFERENCES chart_of_accounts(id),

  collateral_description TEXT,

  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paid_off', 'refinanced', 'default')),

  project_id UUID REFERENCES projects(id),

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loans_entity ON loans(entity_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(entity_id, status);
CREATE INDEX IF NOT EXISTS idx_loans_project ON loans(project_id);

-- Loan Transactions
CREATE TABLE IF NOT EXISTS loan_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,

  transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN (
    'disbursement', 'draw', 'payment', 'interest_accrual',
    'principal_payment', 'interest_payment', 'fee', 'adjustment'
  )),

  transaction_date DATE NOT NULL,

  principal_amount DECIMAL(15,2) DEFAULT 0,
  interest_amount DECIMAL(15,2) DEFAULT 0,
  fee_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,

  balance_after DECIMAL(15,2) NOT NULL,

  bank_account_id UUID REFERENCES bank_accounts(id),
  reference_number VARCHAR(100),
  journal_entry_id UUID REFERENCES journal_entries(id),

  memo TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loan_txns_loan ON loan_transactions(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_txns_date ON loan_transactions(transaction_date);

-- Loan Amortization Schedule
CREATE TABLE IF NOT EXISTS loan_amortization_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,

  payment_number INTEGER NOT NULL,
  payment_date DATE NOT NULL,

  beginning_balance DECIMAL(15,2) NOT NULL,
  scheduled_payment DECIMAL(15,2) NOT NULL,
  principal_amount DECIMAL(15,2) NOT NULL,
  interest_amount DECIMAL(15,2) NOT NULL,
  ending_balance DECIMAL(15,2) NOT NULL,

  actual_payment DECIMAL(15,2),
  actual_payment_date DATE,
  loan_transaction_id UUID REFERENCES loan_transactions(id),

  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'paid', 'partial', 'missed')),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_amortization_loan ON loan_amortization_schedule(loan_id);
CREATE INDEX IF NOT EXISTS idx_amortization_date ON loan_amortization_schedule(payment_date);

-- Loan Draws (for construction/LOC)
CREATE TABLE IF NOT EXISTS loan_draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,

  draw_number VARCHAR(20),
  draw_date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,

  purpose TEXT,

  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'funded', 'rejected')),

  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  funded_at TIMESTAMPTZ,

  bank_account_id UUID REFERENCES bank_accounts(id),
  loan_transaction_id UUID REFERENCES loan_transactions(id),

  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loan_draws_loan ON loan_draws(loan_id);

-- Intercompany Transactions
CREATE TABLE IF NOT EXISTS intercompany_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  from_entity_id UUID NOT NULL REFERENCES entities(id),
  to_entity_id UUID NOT NULL REFERENCES entities(id),

  transaction_date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  reference_number VARCHAR(100),

  transaction_type VARCHAR(50) DEFAULT 'transfer' CHECK (transaction_type IN (
    'transfer', 'loan', 'loan_repayment', 'expense_allocation',
    'revenue_share', 'capital_contribution', 'distribution', 'other'
  )),

  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'posted', 'void')),

  from_journal_entry_id UUID REFERENCES journal_entries(id),
  to_journal_entry_id UUID REFERENCES journal_entries(id),

  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT different_entities CHECK (from_entity_id != to_entity_id)
);

CREATE INDEX IF NOT EXISTS idx_interco_from ON intercompany_transactions(from_entity_id);
CREATE INDEX IF NOT EXISTS idx_interco_to ON intercompany_transactions(to_entity_id);
CREATE INDEX IF NOT EXISTS idx_interco_date ON intercompany_transactions(transaction_date);

-- Entity Ownership
CREATE TABLE IF NOT EXISTS entity_ownership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,

  owner_entity_id UUID REFERENCES entities(id),
  owner_contact_id UUID REFERENCES contacts(id),
  owner_name VARCHAR(255),
  owner_type VARCHAR(50) DEFAULT 'individual' CHECK (owner_type IN ('individual', 'entity')),

  ownership_percentage DECIMAL(8,5) NOT NULL CHECK (ownership_percentage > 0 AND ownership_percentage <= 100),
  ownership_class VARCHAR(50) DEFAULT 'member' CHECK (ownership_class IN (
    'member', 'shareholder', 'partner', 'limited_partner', 'general_partner', 'beneficiary', 'other'
  )),

  effective_date DATE NOT NULL,
  end_date DATE,

  capital_account_balance DECIMAL(15,2) DEFAULT 0,
  profit_sharing_percentage DECIMAL(8,5),
  loss_sharing_percentage DECIMAL(8,5),

  tax_classification VARCHAR(50),
  tax_id VARCHAR(50),

  voting_percentage DECIMAL(8,5),
  is_managing_member BOOLEAN DEFAULT false,
  voting_rights BOOLEAN DEFAULT true,

  is_active BOOLEAN DEFAULT true,

  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ownership_entity ON entity_ownership(entity_id);
CREATE INDEX IF NOT EXISTS idx_ownership_owner_entity ON entity_ownership(owner_entity_id);
CREATE INDEX IF NOT EXISTS idx_ownership_owner_contact ON entity_ownership(owner_contact_id);

-- Entity Files
CREATE TABLE IF NOT EXISTS entity_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,

  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100),
  file_size INTEGER,
  file_url TEXT NOT NULL,

  folder_path VARCHAR(500) DEFAULT '/',
  category VARCHAR(100),

  description TEXT,
  tags TEXT[],

  sharepoint_id VARCHAR(255),
  sharepoint_drive_id VARCHAR(255),

  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entity_files_entity ON entity_files(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_files_folder ON entity_files(entity_id, folder_path);
CREATE INDEX IF NOT EXISTS idx_entity_files_category ON entity_files(entity_id, category);

-- Entity Communications
CREATE TABLE IF NOT EXISTS entity_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,

  type VARCHAR(50) NOT NULL CHECK (type IN (
    'email', 'phone_call', 'video_call', 'meeting', 'note', 'letter', 'other'
  )),

  direction VARCHAR(20) DEFAULT 'outbound' CHECK (direction IN ('inbound', 'outbound', 'internal')),

  subject VARCHAR(500),
  notes TEXT,

  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),

  communication_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_minutes INTEGER,

  outcome VARCHAR(50),
  follow_up_date DATE,
  follow_up_notes TEXT,

  outlook_message_id VARCHAR(255),
  attachment_urls TEXT[],

  contact_id UUID REFERENCES contacts(id),
  logged_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entity_comms_entity ON entity_communications(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_comms_date ON entity_communications(entity_id, communication_date);
CREATE INDEX IF NOT EXISTS idx_entity_comms_contact ON entity_communications(contact_id);

-- Entity Contacts (linking table)
CREATE TABLE IF NOT EXISTS entity_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,

  role VARCHAR(100),
  is_primary BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(entity_id, contact_id)
);

CREATE INDEX IF NOT EXISTS idx_entity_contacts_entity ON entity_contacts(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_contacts_contact ON entity_contacts(contact_id);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,

  employee_number VARCHAR(20),

  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),

  email VARCHAR(255),
  phone VARCHAR(50),

  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),

  ssn_last_four VARCHAR(4),
  date_of_birth DATE,

  hire_date DATE NOT NULL,
  termination_date DATE,

  employment_type VARCHAR(20) DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contractor', 'temporary')),
  pay_type VARCHAR(20) DEFAULT 'hourly' CHECK (pay_type IN ('hourly', 'salary', 'commission')),
  pay_rate DECIMAL(15,2),
  pay_frequency VARCHAR(20) DEFAULT 'biweekly' CHECK (pay_frequency IN ('weekly', 'biweekly', 'semimonthly', 'monthly')),

  department VARCHAR(100),
  job_title VARCHAR(100),
  manager_id UUID REFERENCES employees(id),

  federal_filing_status VARCHAR(20),
  federal_allowances INTEGER DEFAULT 0,
  state_filing_status VARCHAR(20),
  state_allowances INTEGER DEFAULT 0,
  additional_withholding DECIMAL(15,2) DEFAULT 0,

  bank_name VARCHAR(100),
  bank_routing VARCHAR(20),
  bank_account VARCHAR(30),
  bank_account_type VARCHAR(20) DEFAULT 'checking',

  expense_account_id UUID REFERENCES chart_of_accounts(id),

  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated', 'leave')),

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_employees_number ON employees(entity_id, employee_number);
CREATE INDEX IF NOT EXISTS idx_employees_entity ON employees(entity_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(entity_id, status);
CREATE INDEX IF NOT EXISTS idx_employees_name ON employees(last_name, first_name);

-- Payroll Runs
CREATE TABLE IF NOT EXISTS payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,

  payroll_number VARCHAR(20) NOT NULL,

  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  pay_date DATE NOT NULL,

  total_gross DECIMAL(15,2) DEFAULT 0,
  total_employer_taxes DECIMAL(15,2) DEFAULT 0,
  total_employee_taxes DECIMAL(15,2) DEFAULT 0,
  total_deductions DECIMAL(15,2) DEFAULT 0,
  total_net DECIMAL(15,2) DEFAULT 0,

  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'processed', 'voided')),

  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES auth.users(id),

  bank_account_id UUID REFERENCES bank_accounts(id),
  journal_entry_id UUID REFERENCES journal_entries(id),

  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_payroll_number ON payroll_runs(entity_id, payroll_number);
CREATE INDEX IF NOT EXISTS idx_payroll_entity ON payroll_runs(entity_id);
CREATE INDEX IF NOT EXISTS idx_payroll_date ON payroll_runs(pay_date);

-- Payroll Items
CREATE TABLE IF NOT EXISTS payroll_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id),

  regular_hours DECIMAL(10,2) DEFAULT 0,
  overtime_hours DECIMAL(10,2) DEFAULT 0,
  holiday_hours DECIMAL(10,2) DEFAULT 0,
  pto_hours DECIMAL(10,2) DEFAULT 0,
  sick_hours DECIMAL(10,2) DEFAULT 0,

  regular_pay DECIMAL(15,2) DEFAULT 0,
  overtime_pay DECIMAL(15,2) DEFAULT 0,
  holiday_pay DECIMAL(15,2) DEFAULT 0,
  pto_pay DECIMAL(15,2) DEFAULT 0,
  sick_pay DECIMAL(15,2) DEFAULT 0,
  bonus DECIMAL(15,2) DEFAULT 0,
  commission DECIMAL(15,2) DEFAULT 0,
  other_pay DECIMAL(15,2) DEFAULT 0,

  gross_pay DECIMAL(15,2) NOT NULL DEFAULT 0,

  federal_withholding DECIMAL(15,2) DEFAULT 0,
  state_withholding DECIMAL(15,2) DEFAULT 0,
  local_withholding DECIMAL(15,2) DEFAULT 0,
  social_security_employee DECIMAL(15,2) DEFAULT 0,
  medicare_employee DECIMAL(15,2) DEFAULT 0,

  social_security_employer DECIMAL(15,2) DEFAULT 0,
  medicare_employer DECIMAL(15,2) DEFAULT 0,
  futa DECIMAL(15,2) DEFAULT 0,
  suta DECIMAL(15,2) DEFAULT 0,

  health_insurance DECIMAL(15,2) DEFAULT 0,
  dental_insurance DECIMAL(15,2) DEFAULT 0,
  vision_insurance DECIMAL(15,2) DEFAULT 0,
  retirement_401k DECIMAL(15,2) DEFAULT 0,
  other_deductions DECIMAL(15,2) DEFAULT 0,

  total_taxes DECIMAL(15,2) DEFAULT 0,
  total_deductions DECIMAL(15,2) DEFAULT 0,
  net_pay DECIMAL(15,2) NOT NULL DEFAULT 0,

  payment_method VARCHAR(20) DEFAULT 'direct_deposit' CHECK (payment_method IN ('direct_deposit', 'check', 'manual')),
  check_number VARCHAR(20),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payroll_items_run ON payroll_items(payroll_run_id);
CREATE INDEX IF NOT EXISTS idx_payroll_items_employee ON payroll_items(employee_id);

-- STEP 3: Enable RLS on all tables
-- ============================================================================
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    AND table_name IN (
      'entity_tasks', 'customers', 'invoices', 'invoice_lines', 'invoice_payments',
      'loans', 'loan_transactions', 'loan_amortization_schedule', 'loan_draws',
      'intercompany_transactions', 'entity_ownership', 'entity_files',
      'entity_communications', 'entity_contacts', 'employees', 'payroll_runs', 'payroll_items'
    )
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    RAISE NOTICE 'Enabled RLS on %', tbl;
  END LOOP;
END $$;

-- STEP 4: Create updated_at triggers
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
BEGIN
  FOR tbl IN
    SELECT table_name
    FROM information_schema.columns
    WHERE column_name = 'updated_at'
    AND table_schema = 'public'
  LOOP
    BEGIN
      EXECUTE format('
        DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
        CREATE TRIGGER update_%I_updated_at
          BEFORE UPDATE ON %I
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      ', tbl, tbl, tbl, tbl);
      RAISE NOTICE 'Created updated_at trigger on %', tbl;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not create trigger on %: %', tbl, SQLERRM;
    END;
  END LOOP;
END $$;

-- STEP 5: Final verification
-- ============================================================================
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
AND table_name IN (
  'entities', 'chart_of_accounts', 'bank_accounts', 'vendors', 'customers',
  'bills', 'invoices', 'journal_entries', 'expenses', 'loans',
  'entity_tasks', 'employees', 'payroll_runs', 'entity_files', 'entity_communications',
  'intercompany_transactions', 'entity_ownership'
)
ORDER BY table_name;

RAISE NOTICE '=== SCHEMA VERIFICATION COMPLETE ===';
