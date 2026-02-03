-- ============================================================================
-- COMPLETE ENTITY ACCOUNTING SCHEMA
-- ============================================================================
-- This is a consolidated migration file containing ALL tables, indexes,
-- RLS policies, and functions required for the Entity Accounting Module.
--
-- Run this in Supabase SQL Editor to create/update the complete schema.
-- ============================================================================

-- ============================================================================
-- PART 1: CORE ENTITY & ACCOUNTING SETTINGS
-- ============================================================================

-- Entity Accounting Settings
CREATE TABLE IF NOT EXISTS entity_accounting_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  accounting_method TEXT DEFAULT 'accrual' CHECK (accounting_method IN ('cash', 'accrual')),
  fiscal_year_end_month INTEGER DEFAULT 12 CHECK (fiscal_year_end_month BETWEEN 1 AND 12),
  fiscal_year_end_day INTEGER DEFAULT 31 CHECK (fiscal_year_end_day BETWEEN 1 AND 31),
  default_payment_terms TEXT DEFAULT 'NET_30',
  base_currency TEXT DEFAULT 'USD',
  late_fee_enabled BOOLEAN DEFAULT false,
  late_fee_percent DECIMAL(5,2) DEFAULT 1.5,
  late_fee_grace_days INTEGER DEFAULT 15,
  alert_1099_threshold BOOLEAN DEFAULT true,
  require_w9_before_payment BOOLEAN DEFAULT true,
  notify_bill_due_days INTEGER DEFAULT 7,
  notify_invoice_overdue BOOLEAN DEFAULT true,
  low_balance_alert_threshold DECIMAL(15,2) DEFAULT 1000.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_id)
);

-- Chart of Accounts
CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  account_number VARCHAR(10) NOT NULL,
  account_name VARCHAR(100) NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN (
    'asset', 'liability', 'equity', 'revenue', 'cogs', 'expense', 'other_income', 'other_expense'
  )),
  account_subtype VARCHAR(50),
  parent_account_id UUID REFERENCES chart_of_accounts(id),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_system_account BOOLEAN DEFAULT false,
  normal_balance TEXT DEFAULT 'debit' CHECK (normal_balance IN ('debit', 'credit')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_id, account_number)
);

-- Fiscal Periods
CREATE TABLE IF NOT EXISTS fiscal_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  period_name VARCHAR(50) NOT NULL,
  period_year INTEGER NOT NULL,
  period_month INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'locked')),
  closed_at TIMESTAMPTZ,
  closed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_id, period_year, period_month)
);

-- ============================================================================
-- PART 2: VENDORS & ACCOUNTS PAYABLE
-- ============================================================================

-- Vendors (add columns if table exists)
DO $$ BEGIN
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS entity_id UUID REFERENCES entities(id) ON DELETE CASCADE;
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS company_name VARCHAR(200);
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS display_name VARCHAR(200);
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS address_line1 VARCHAR(200);
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS address_line2 VARCHAR(200);
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'USA';
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS is_1099_vendor BOOLEAN DEFAULT false;
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS w9_on_file BOOLEAN DEFAULT false;
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS w9_received_date DATE;
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS default_payment_terms TEXT DEFAULT 'NET_30';
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS default_expense_account_id UUID REFERENCES chart_of_accounts(id);
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100);
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS bank_routing VARCHAR(20);
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS bank_account VARCHAR(30);
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id);
EXCEPTION WHEN undefined_table THEN
  CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    company_name VARCHAR(200),
    display_name VARCHAR(200),
    email VARCHAR(255),
    phone VARCHAR(50),
    address_line1 VARCHAR(200),
    address_line2 VARCHAR(200),
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',
    is_1099_vendor BOOLEAN DEFAULT false,
    w9_on_file BOOLEAN DEFAULT false,
    w9_received_date DATE,
    default_payment_terms TEXT DEFAULT 'NET_30',
    default_expense_account_id UUID,
    bank_name VARCHAR(100),
    bank_routing VARCHAR(20),
    bank_account VARCHAR(30),
    contact_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
END $$;

-- Vendor W9s
CREATE TABLE IF NOT EXISTS vendor_w9s (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  legal_name VARCHAR(200) NOT NULL,
  business_name VARCHAR(200),
  federal_tax_classification TEXT CHECK (federal_tax_classification IN (
    'individual', 'sole_proprietor', 'c_corp', 's_corp', 'partnership', 'trust_estate', 'llc', 'other'
  )),
  llc_tax_classification TEXT CHECK (llc_tax_classification IN ('c', 's', 'p')),
  tin_type TEXT NOT NULL CHECK (tin_type IN ('ssn', 'ein')),
  tin_last_four VARCHAR(4) NOT NULL,
  tin_encrypted TEXT,
  address_line1 VARCHAR(200),
  address_line2 VARCHAR(200),
  city VARCHAR(100),
  state VARCHAR(50),
  zip VARCHAR(20),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'verified', 'expired', 'rejected')),
  received_date DATE,
  verified_date DATE,
  verified_by UUID REFERENCES auth.users(id),
  expiration_date DATE,
  rejection_reason TEXT,
  document_path TEXT,
  document_name VARCHAR(255),
  exempt_payee_code VARCHAR(10),
  fatca_exemption_code VARCHAR(10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bills
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  bill_number VARCHAR(50),
  bill_date DATE NOT NULL,
  due_date DATE NOT NULL,
  payment_terms TEXT,
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(15,2) DEFAULT 0,
  balance_due DECIMAL(15,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'partial', 'paid', 'voided')),
  memo TEXT,
  journal_entry_id UUID,
  ap_account_id UUID REFERENCES chart_of_accounts(id),
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bill Lines
CREATE TABLE IF NOT EXISTS bill_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
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

-- Bill Payments
CREATE TABLE IF NOT EXISTS bill_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  payment_number VARCHAR(20) NOT NULL,
  payment_date DATE NOT NULL,
  bank_account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('check', 'ach', 'wire', 'credit_card', 'cash')),
  check_number VARCHAR(20),
  reference_number VARCHAR(50),
  total_amount DECIMAL(15,2) NOT NULL,
  memo TEXT,
  journal_entry_id UUID,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'voided')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bill Payment Applications
CREATE TABLE IF NOT EXISTS bill_payment_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_payment_id UUID NOT NULL REFERENCES bill_payments(id) ON DELETE CASCADE,
  bill_id UUID NOT NULL REFERENCES bills(id),
  amount_applied DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 3: CUSTOMERS & ACCOUNTS RECEIVABLE
-- ============================================================================

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  company_name VARCHAR(200),
  contact_name VARCHAR(100),
  customer_type VARCHAR(50) DEFAULT 'business',
  email VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(255),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  billing_address_line1 VARCHAR(200),
  billing_address_line2 VARCHAR(200),
  billing_city VARCHAR(100),
  billing_state VARCHAR(50),
  billing_zip VARCHAR(20),
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'USA',
  payment_terms VARCHAR(20) DEFAULT 'NET_30',
  default_payment_terms TEXT DEFAULT 'NET_30',
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

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id),
  invoice_number VARCHAR(50) NOT NULL,
  po_number VARCHAR(50),
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  payment_terms TEXT,
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(15,2) DEFAULT 0,
  balance_due DECIMAL(15,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'void', 'voided')),
  project_id UUID REFERENCES projects(id),
  memo TEXT,
  terms TEXT,
  footer_note TEXT,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  ar_account_id UUID REFERENCES chart_of_accounts(id),
  journal_entry_id UUID,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice Lines
CREATE TABLE IF NOT EXISTS invoice_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  account_id UUID REFERENCES chart_of_accounts(id),
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

-- Invoice Payments
CREATE TABLE IF NOT EXISTS invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  payment_number VARCHAR(20),
  payment_date DATE NOT NULL,
  deposit_account_id UUID REFERENCES chart_of_accounts(id),
  bank_account_id UUID REFERENCES bank_accounts(id),
  payment_method TEXT CHECK (payment_method IN ('check', 'ach', 'wire', 'credit_card', 'cash')),
  reference_number VARCHAR(100),
  total_amount DECIMAL(15,2) NOT NULL,
  amount DECIMAL(15,2),
  memo TEXT,
  journal_entry_id UUID,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice Payment Applications
CREATE TABLE IF NOT EXISTS invoice_payment_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_payment_id UUID NOT NULL REFERENCES invoice_payments(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  amount_applied DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 4: BANKING
-- ============================================================================

-- Plaid Connections
CREATE TABLE IF NOT EXISTS plaid_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  plaid_item_id VARCHAR(100) NOT NULL,
  plaid_access_token TEXT NOT NULL,
  plaid_institution_id VARCHAR(50),
  institution_name VARCHAR(100),
  institution_logo TEXT,
  institution_color VARCHAR(10),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'error', 'disconnected')),
  error_code VARCHAR(50),
  error_message TEXT,
  consent_expiration TIMESTAMPTZ,
  last_successful_sync TIMESTAMPTZ,
  transactions_cursor TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_id, plaid_item_id)
);

-- Bank Accounts
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  account_name VARCHAR(100) NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('checking', 'savings', 'money_market', 'credit_card')),
  bank_name VARCHAR(100),
  account_number_last4 VARCHAR(4),
  routing_number VARCHAR(9),
  gl_account_id UUID REFERENCES chart_of_accounts(id),
  current_balance DECIMAL(15,2) DEFAULT 0,
  available_balance DECIMAL(15,2) DEFAULT 0,
  balance_as_of TIMESTAMPTZ,
  credit_limit DECIMAL(15,2),
  statement_close_day INTEGER CHECK (statement_close_day BETWEEN 1 AND 31),
  payment_due_day INTEGER CHECK (payment_due_day BETWEEN 1 AND 31),
  plaid_account_id VARCHAR(100),
  plaid_item_id UUID REFERENCES plaid_connections(id),
  is_connected BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'never' CHECK (sync_status IN ('never', 'syncing', 'success', 'error')),
  sync_error TEXT,
  is_active BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  auto_import_transactions BOOLEAN DEFAULT true,
  next_check_number INTEGER DEFAULT 1001,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank Transactions
DO $$ BEGIN
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS entity_id UUID REFERENCES entities(id) ON DELETE CASCADE;
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS posted_date DATE;
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS original_description TEXT;
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS plaid_category TEXT[];
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS plaid_merchant_name VARCHAR(200);
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS plaid_payment_channel TEXT;
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS check_number VARCHAR(20);
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS is_categorized BOOLEAN DEFAULT false;
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES chart_of_accounts(id);
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS match_status TEXT DEFAULT 'unmatched';
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS matched_bill_id UUID REFERENCES bills(id);
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS matched_invoice_id UUID REFERENCES invoices(id);
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS matched_expense_id UUID;
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS matched_transfer_id UUID;
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS journal_entry_id UUID;
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS is_reconciled BOOLEAN DEFAULT false;
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS reconciliation_id UUID;
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS reconciled_at TIMESTAMPTZ;
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES vendors(id);
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS memo TEXT;
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS is_split BOOLEAN DEFAULT false;
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS parent_transaction_id UUID;
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN undefined_table THEN
  CREATE TABLE bank_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
    entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    plaid_transaction_id VARCHAR(100),
    transaction_date DATE NOT NULL,
    posted_date DATE,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    original_description TEXT,
    plaid_category TEXT[],
    plaid_merchant_name VARCHAR(200),
    plaid_payment_channel TEXT,
    check_number VARCHAR(20),
    is_categorized BOOLEAN DEFAULT false,
    account_id UUID REFERENCES chart_of_accounts(id),
    match_status TEXT DEFAULT 'unmatched',
    matched_bill_id UUID,
    matched_invoice_id UUID,
    matched_expense_id UUID,
    matched_transfer_id UUID,
    journal_entry_id UUID,
    is_reconciled BOOLEAN DEFAULT false,
    reconciliation_id UUID,
    reconciled_at TIMESTAMPTZ,
    project_id UUID,
    vendor_id UUID,
    customer_id UUID,
    memo TEXT,
    is_split BOOLEAN DEFAULT false,
    parent_transaction_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
END $$;

-- Bank Transaction Splits
CREATE TABLE IF NOT EXISTS bank_transaction_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_transaction_id UUID NOT NULL REFERENCES bank_transactions(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
  description TEXT,
  project_id UUID REFERENCES projects(id),
  cost_code_id UUID,
  vendor_id UUID REFERENCES vendors(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank Reconciliations
CREATE TABLE IF NOT EXISTS bank_reconciliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  statement_date DATE NOT NULL,
  statement_ending_balance DECIMAL(15,2) NOT NULL,
  period_start_date DATE NOT NULL,
  period_end_date DATE NOT NULL,
  beginning_balance DECIMAL(15,2) NOT NULL,
  total_deposits DECIMAL(15,2) DEFAULT 0,
  total_withdrawals DECIMAL(15,2) DEFAULT 0,
  cleared_balance DECIMAL(15,2),
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'voided')),
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id),
  adjustment_journal_entry_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reconciliation Items
CREATE TABLE IF NOT EXISTS reconciliation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reconciliation_id UUID NOT NULL REFERENCES bank_reconciliations(id) ON DELETE CASCADE,
  bank_transaction_id UUID NOT NULL REFERENCES bank_transactions(id),
  is_cleared BOOLEAN DEFAULT false,
  cleared_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank Matching Rules
CREATE TABLE IF NOT EXISTS bank_matching_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  rule_name VARCHAR(100) NOT NULL,
  priority INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  match_description_contains TEXT,
  match_description_exact TEXT,
  match_amount_min DECIMAL(15,2),
  match_amount_max DECIMAL(15,2),
  match_amount_exact DECIMAL(15,2),
  match_merchant_name TEXT,
  match_transaction_type TEXT CHECK (match_transaction_type IN ('inflow', 'outflow', 'any')),
  assign_account_id UUID REFERENCES chart_of_accounts(id),
  assign_vendor_id UUID REFERENCES vendors(id),
  assign_customer_id UUID REFERENCES customers(id),
  assign_project_id UUID REFERENCES projects(id),
  assign_memo TEXT,
  auto_approve BOOLEAN DEFAULT false,
  times_applied INTEGER DEFAULT 0,
  last_applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 5: JOURNAL ENTRIES & GENERAL LEDGER
-- ============================================================================

-- Journal Entries (add columns if exists)
DO $$ BEGIN
  ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS entry_number VARCHAR(20);
  ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS entry_type TEXT DEFAULT 'standard';
  ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS source_type TEXT;
  ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS source_id UUID;
  ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);
  ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS total_debits DECIMAL(15,2) DEFAULT 0;
  ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS total_credits DECIMAL(15,2) DEFAULT 0;
  ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS posted_by UUID REFERENCES auth.users(id);
  ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS posted_at TIMESTAMPTZ;
  ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS voided_by UUID REFERENCES auth.users(id);
  ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS voided_at TIMESTAMPTZ;
  ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS void_reason TEXT;
EXCEPTION WHEN undefined_table THEN
  CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    entry_number VARCHAR(20),
    entry_date DATE NOT NULL,
    entry_type TEXT DEFAULT 'standard',
    description TEXT,
    source_type TEXT,
    source_id UUID,
    project_id UUID,
    total_debits DECIMAL(15,2) DEFAULT 0,
    total_credits DECIMAL(15,2) DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'voided')),
    posted_by UUID,
    posted_at TIMESTAMPTZ,
    voided_by UUID,
    voided_at TIMESTAMPTZ,
    void_reason TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
END $$;

-- Journal Entry Lines
CREATE TABLE IF NOT EXISTS journal_entry_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
  description TEXT,
  debit_amount DECIMAL(15,2) DEFAULT 0,
  credit_amount DECIMAL(15,2) DEFAULT 0,
  project_id UUID REFERENCES projects(id),
  cost_code_id UUID,
  vendor_id UUID REFERENCES contacts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT debit_xor_credit CHECK (
    (debit_amount > 0 AND credit_amount = 0) OR
    (debit_amount = 0 AND credit_amount > 0) OR
    (debit_amount = 0 AND credit_amount = 0)
  )
);

-- General Ledger
CREATE TABLE IF NOT EXISTS general_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
  journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
  journal_entry_line_id UUID REFERENCES journal_entry_lines(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  posting_date DATE NOT NULL,
  description TEXT,
  entry_number VARCHAR(20),
  debit_amount DECIMAL(15,2) DEFAULT 0,
  credit_amount DECIMAL(15,2) DEFAULT 0,
  running_balance DECIMAL(15,2),
  fiscal_year INTEGER,
  fiscal_month INTEGER,
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 6: EXPENSES
-- ============================================================================

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  expense_date DATE NOT NULL,
  vendor_id UUID REFERENCES vendors(id),
  vendor_name VARCHAR(200),
  amount DECIMAL(15,2) NOT NULL,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2),
  payment_method TEXT NOT NULL CHECK (payment_method IN (
    'cash', 'company_card', 'personal_card', 'check', 'ach', 'reimbursable'
  )),
  category TEXT,
  account_id UUID REFERENCES chart_of_accounts(id),
  expense_account_id UUID REFERENCES chart_of_accounts(id),
  bank_account_id UUID REFERENCES bank_accounts(id),
  description TEXT,
  merchant VARCHAR(255),
  project_id UUID REFERENCES projects(id),
  cost_code_id UUID,
  receipt_url TEXT,
  receipt_file_name VARCHAR(255),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'reimbursed', 'voided', 'paid')),
  submitted_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  reimbursed_at TIMESTAMPTZ,
  reimbursement_method TEXT,
  reimbursement_reference VARCHAR(100),
  bill_id UUID REFERENCES bills(id),
  journal_entry_id UUID,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expense Line Items
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

-- Expense Categories
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES entities(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  default_account_id UUID REFERENCES chart_of_accounts(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 7: LOANS
-- ============================================================================

-- Loans
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
  commitment_amount DECIMAL(15,2),
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
  term_months INTEGER,
  amortization_months INTEGER,
  io_period_months INTEGER,
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

-- Loan Payments
CREATE TABLE IF NOT EXISTS loan_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL,
  principal_amount DECIMAL(15,2) DEFAULT 0,
  interest_amount DECIMAL(15,2) DEFAULT 0,
  fee_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  balance_after DECIMAL(15,2) NOT NULL,
  bank_account_id UUID REFERENCES bank_accounts(id),
  reference_number VARCHAR(100),
  journal_entry_id UUID,
  memo TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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
  journal_entry_id UUID,
  memo TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Loan Amortization Schedule
CREATE TABLE IF NOT EXISTS loan_amortization_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  payment_number INTEGER NOT NULL,
  payment_date DATE NOT NULL,
  scheduled_payment DECIMAL(15,2) NOT NULL,
  principal_amount DECIMAL(15,2) NOT NULL,
  interest_amount DECIMAL(15,2) NOT NULL,
  beginning_balance DECIMAL(15,2) NOT NULL,
  ending_balance DECIMAL(15,2) NOT NULL,
  actual_payment_date DATE,
  actual_payment_amount DECIMAL(15,2),
  actual_principal DECIMAL(15,2),
  actual_interest DECIMAL(15,2),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'paid', 'partial', 'late', 'missed')),
  loan_payment_id UUID REFERENCES loan_payments(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(loan_id, payment_number)
);

-- Loan Draws
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

-- ============================================================================
-- PART 8: INTERCOMPANY
-- ============================================================================

-- Entity Hierarchy
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

-- Intercompany Transfers
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
  from_expense_account_id UUID REFERENCES chart_of_accounts(id),
  from_cash_account_id UUID REFERENCES chart_of_accounts(id),
  to_cash_account_id UUID REFERENCES chart_of_accounts(id),
  to_income_account_id UUID REFERENCES chart_of_accounts(id),
  from_journal_entry_id UUID,
  to_journal_entry_id UUID,
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

-- Intercompany Balances
CREATE TABLE IF NOT EXISTS intercompany_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity1_id UUID NOT NULL REFERENCES entities(id),
  entity2_id UUID NOT NULL REFERENCES entities(id),
  receivable_amount DECIMAL(15,2) DEFAULT 0,
  payable_amount DECIMAL(15,2) DEFAULT 0,
  net_balance DECIMAL(15,2) GENERATED ALWAYS AS (receivable_amount - payable_amount) STORED,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity1_id, entity2_id),
  CONSTRAINT ordered_entities CHECK (entity1_id < entity2_id)
);

-- ============================================================================
-- PART 9: OWNERSHIP
-- ============================================================================

-- Entity Ownership
CREATE TABLE IF NOT EXISTS entity_ownership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  owner_type TEXT NOT NULL CHECK (owner_type IN ('individual', 'entity', 'trust')),
  owner_entity_id UUID REFERENCES entities(id),
  owner_contact_id UUID REFERENCES contacts(id),
  owner_name VARCHAR(200),
  owner_email VARCHAR(200),
  owner_phone VARCHAR(50),
  owner_address TEXT,
  owner_tin_type TEXT CHECK (owner_tin_type IN ('ssn', 'ein')),
  owner_tin_last_four VARCHAR(4),
  ownership_percentage DECIMAL(6,4) NOT NULL CHECK (ownership_percentage >= 0 AND ownership_percentage <= 100),
  ownership_class TEXT,
  profit_sharing_percentage DECIMAL(6,4),
  loss_sharing_percentage DECIMAL(6,4),
  initial_contribution DECIMAL(15,2) DEFAULT 0,
  capital_account_balance DECIMAL(15,2) DEFAULT 0,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  preferred_return_rate DECIMAL(6,4),
  distribution_priority INTEGER,
  is_managing_member BOOLEAN DEFAULT false,
  voting_rights BOOLEAN DEFAULT true,
  voting_percentage DECIMAL(6,4),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 10: 1099 TRACKING
-- ============================================================================

-- Vendor 1099 Tracking
CREATE TABLE IF NOT EXISTS vendor_1099_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,
  is_1099_eligible BOOLEAN DEFAULT true,
  form_type TEXT DEFAULT '1099-NEC' CHECK (form_type IN ('1099-NEC', '1099-MISC', '1099-INT', '1099-DIV')),
  total_payments DECIMAL(15,2) DEFAULT 0,
  threshold_amount DECIMAL(15,2) DEFAULT 600.00,
  exceeds_threshold BOOLEAN GENERATED ALWAYS AS (total_payments >= threshold_amount) STORED,
  w9_id UUID REFERENCES vendor_w9s(id),
  w9_status TEXT DEFAULT 'missing' CHECK (w9_status IN ('missing', 'pending', 'received', 'verified')),
  filing_status TEXT DEFAULT 'pending' CHECK (filing_status IN ('pending', 'ready', 'filed', 'corrected', 'excluded')),
  excluded_reason TEXT,
  filed_date DATE,
  filed_batch_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vendor_id, entity_id, tax_year)
);

-- Vendor 1099 Payments
CREATE TABLE IF NOT EXISTS vendor_1099_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id UUID NOT NULL REFERENCES vendor_1099_tracking(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  entity_id UUID NOT NULL REFERENCES entities(id),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('bill_payment', 'expense', 'manual')),
  bill_payment_id UUID REFERENCES bill_payments(id),
  expense_id UUID REFERENCES expenses(id),
  payment_date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  box_number INTEGER DEFAULT 1,
  is_included BOOLEAN DEFAULT true,
  exclusion_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1099 Filing Batches
CREATE TABLE IF NOT EXISTS filing_1099_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  batch_number VARCHAR(20) NOT NULL,
  tax_year INTEGER NOT NULL,
  form_type TEXT DEFAULT '1099-NEC',
  filing_date DATE,
  filing_method TEXT CHECK (filing_method IN ('electronic', 'paper', 'service')),
  total_forms INTEGER DEFAULT 0,
  total_amount DECIMAL(15,2) DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'submitted', 'accepted', 'rejected', 'corrected')),
  irs_submission_id VARCHAR(50),
  irs_receipt_id VARCHAR(50),
  irs_status TEXT,
  irs_status_date TIMESTAMPTZ,
  original_batch_id UUID REFERENCES filing_1099_batches(id),
  is_correction BOOLEAN DEFAULT false,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_id, batch_number)
);

-- ============================================================================
-- PART 11: MONTH-END CLOSE
-- ============================================================================

-- Month-End Checklist Templates
CREATE TABLE IF NOT EXISTS month_end_checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
  template_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Month-End Template Items
CREATE TABLE IF NOT EXISTS month_end_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES month_end_checklist_templates(id) ON DELETE CASCADE,
  item_order INTEGER NOT NULL,
  category VARCHAR(100) NOT NULL,
  task_name VARCHAR(200) NOT NULL,
  description TEXT,
  instructions TEXT,
  default_assignee_role VARCHAR(50),
  depends_on_item_id UUID REFERENCES month_end_template_items(id),
  typical_duration_hours DECIMAL(4,1),
  deadline_day INTEGER,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Period Close Checklists
CREATE TABLE IF NOT EXISTS period_close_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  fiscal_period_id UUID NOT NULL REFERENCES fiscal_periods(id),
  template_id UUID REFERENCES month_end_checklist_templates(id),
  period_name VARCHAR(50) NOT NULL,
  target_completion_date DATE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'review', 'completed', 'locked')),
  total_items INTEGER DEFAULT 0,
  completed_items INTEGER DEFAULT 0,
  progress_percent DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN total_items > 0 THEN (completed_items::DECIMAL / total_items * 100) ELSE 0 END
  ) STORED,
  assigned_to UUID REFERENCES auth.users(id),
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_id, fiscal_period_id)
);

-- Period Close Checklist Items
CREATE TABLE IF NOT EXISTS period_close_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID NOT NULL REFERENCES period_close_checklists(id) ON DELETE CASCADE,
  template_item_id UUID REFERENCES month_end_template_items(id),
  item_order INTEGER NOT NULL,
  category VARCHAR(100) NOT NULL,
  task_name VARCHAR(200) NOT NULL,
  description TEXT,
  instructions TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'skipped')),
  assigned_to UUID REFERENCES auth.users(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id),
  blocked_reason TEXT,
  blocked_by_item_id UUID REFERENCES period_close_checklist_items(id),
  notes TEXT,
  attachment_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Closing Entries
CREATE TABLE IF NOT EXISTS closing_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  fiscal_period_id UUID NOT NULL REFERENCES fiscal_periods(id),
  entry_type TEXT NOT NULL CHECK (entry_type IN (
    'revenue_close', 'expense_close', 'income_summary', 'dividend_close', 'adjustment'
  )),
  journal_entry_id UUID NOT NULL,
  description TEXT,
  is_auto_generated BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(fiscal_period_id, entry_type)
);

-- Period Account Balances
CREATE TABLE IF NOT EXISTS period_account_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  fiscal_period_id UUID NOT NULL REFERENCES fiscal_periods(id),
  account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
  beginning_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  period_debits DECIMAL(15,2) NOT NULL DEFAULT 0,
  period_credits DECIMAL(15,2) NOT NULL DEFAULT 0,
  ending_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  snapshot_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(fiscal_period_id, account_id)
);

-- ============================================================================
-- PART 12: EMPLOYEES & PAYROLL
-- ============================================================================

-- Employees
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
  journal_entry_id UUID,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- ============================================================================
-- PART 13: ENTITY TASKS, FILES, COMMUNICATIONS
-- ============================================================================

-- Entity Tasks
CREATE TABLE IF NOT EXISTS entity_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  task_number VARCHAR(20),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('accounting', 'tax', 'compliance', 'audit', 'reporting', 'banking', 'other')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  reminder_date DATE,
  assigned_to UUID REFERENCES auth.users(id),
  assigned_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'review', 'completed', 'cancelled')),
  related_type TEXT,
  related_id UUID,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id),
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  recurrence_end_date DATE,
  parent_task_id UUID REFERENCES entity_tasks(id),
  tags TEXT[],
  related_record_type VARCHAR(50),
  related_record_id UUID,
  project_id UUID REFERENCES projects(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Entity Communications
CREATE TABLE IF NOT EXISTS entity_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'phone_call', 'video_call', 'meeting', 'note', 'letter', 'other')),
  direction VARCHAR(20) DEFAULT 'outbound' CHECK (direction IN ('inbound', 'outbound', 'internal')),
  subject VARCHAR(500),
  notes TEXT,
  body TEXT,
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  from_address VARCHAR(255),
  to_addresses TEXT[],
  cc_addresses TEXT[],
  communication_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  comm_date TIMESTAMPTZ,
  duration_minutes INTEGER,
  outcome VARCHAR(50),
  follow_up_date DATE,
  follow_up_notes TEXT,
  outlook_message_id VARCHAR(255),
  attachment_urls TEXT[],
  contact_id UUID REFERENCES contacts(id),
  logged_by UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Entity Contacts (linking table)
CREATE TABLE IF NOT EXISTS entity_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  role VARCHAR(100),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_id, contact_id)
);

-- ============================================================================
-- PART 14: COA TEMPLATES
-- ============================================================================

-- COA Templates (add columns if exists)
DO $$ BEGIN
  ALTER TABLE coa_templates ADD COLUMN IF NOT EXISTS template_name VARCHAR(100);
  ALTER TABLE coa_templates ADD COLUMN IF NOT EXISTS template_type TEXT;
  ALTER TABLE coa_templates ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
EXCEPTION WHEN undefined_table THEN
  CREATE TABLE coa_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    template_name VARCHAR(100),
    template_type TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
END $$;

-- COA Template Accounts (add columns if exists)
DO $$ BEGIN
  ALTER TABLE coa_template_accounts ADD COLUMN IF NOT EXISTS account_name VARCHAR(100);
  ALTER TABLE coa_template_accounts ADD COLUMN IF NOT EXISTS account_subtype VARCHAR(50);
  ALTER TABLE coa_template_accounts ADD COLUMN IF NOT EXISTS description TEXT;
  ALTER TABLE coa_template_accounts ADD COLUMN IF NOT EXISTS is_system_account BOOLEAN DEFAULT false;
EXCEPTION WHEN undefined_table THEN
  CREATE TABLE coa_template_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES coa_templates(id) ON DELETE CASCADE,
    account_number VARCHAR(10) NOT NULL,
    name VARCHAR(100) NOT NULL,
    account_name VARCHAR(100),
    account_type TEXT NOT NULL,
    account_subtype VARCHAR(50),
    normal_balance TEXT DEFAULT 'debit',
    parent_account_number VARCHAR(10),
    description TEXT,
    is_system_account BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
END $$;

-- ============================================================================
-- PART 15: INDEXES
-- ============================================================================

-- Core indexes
CREATE INDEX IF NOT EXISTS idx_coa_entity ON chart_of_accounts(entity_id);
CREATE INDEX IF NOT EXISTS idx_coa_type ON chart_of_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_coa_parent ON chart_of_accounts(parent_account_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_periods_entity ON fiscal_periods(entity_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_periods_year ON fiscal_periods(period_year);
CREATE INDEX IF NOT EXISTS idx_fiscal_periods_status ON fiscal_periods(status);

-- Vendor/AP indexes
CREATE INDEX IF NOT EXISTS idx_vendors_entity ON vendors(entity_id);
CREATE INDEX IF NOT EXISTS idx_vendor_w9s_vendor ON vendor_w9s(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_w9s_entity ON vendor_w9s(entity_id);
CREATE INDEX IF NOT EXISTS idx_bills_entity ON bills(entity_id);
CREATE INDEX IF NOT EXISTS idx_bills_vendor ON bills(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_due ON bills(due_date);
CREATE INDEX IF NOT EXISTS idx_bill_lines_bill ON bill_lines(bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_payments_entity ON bill_payments(entity_id);

-- Customer/AR indexes
CREATE INDEX IF NOT EXISTS idx_customers_entity ON customers(entity_id);
CREATE INDEX IF NOT EXISTS idx_invoices_entity ON invoices(entity_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_lines_invoice ON invoice_lines(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_entity ON invoice_payments(entity_id);

-- Banking indexes
CREATE INDEX IF NOT EXISTS idx_bank_accounts_entity ON bank_accounts(entity_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_plaid ON bank_accounts(plaid_account_id);
CREATE INDEX IF NOT EXISTS idx_plaid_connections_entity ON plaid_connections(entity_id);
CREATE INDEX IF NOT EXISTS idx_bank_txn_account ON bank_transactions(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_txn_date ON bank_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_bank_txn_status ON bank_transactions(match_status);
CREATE INDEX IF NOT EXISTS idx_recon_account ON bank_reconciliations(bank_account_id);

-- Journal/GL indexes
CREATE INDEX IF NOT EXISTS idx_je_entity ON journal_entries(entity_id);
CREATE INDEX IF NOT EXISTS idx_je_date ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_je_status ON journal_entries(status);
CREATE INDEX IF NOT EXISTS idx_jel_entry ON journal_entry_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_jel_account ON journal_entry_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_gl_entity_account ON general_ledger(entity_id, account_id);
CREATE INDEX IF NOT EXISTS idx_gl_date ON general_ledger(transaction_date);

-- Expense indexes
CREATE INDEX IF NOT EXISTS idx_expenses_entity ON expenses(entity_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expense_line_items_expense ON expense_line_items(expense_id);

-- Loan indexes
CREATE INDEX IF NOT EXISTS idx_loans_entity ON loans(entity_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(entity_id, status);
CREATE INDEX IF NOT EXISTS idx_loan_txns_loan ON loan_transactions(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_amort_loan ON loan_amortization_schedule(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_draws_loan ON loan_draws(loan_id);

-- Intercompany indexes
CREATE INDEX IF NOT EXISTS idx_entity_hierarchy_parent ON entity_hierarchy(parent_entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_hierarchy_child ON entity_hierarchy(child_entity_id);
CREATE INDEX IF NOT EXISTS idx_ic_transfers_from ON intercompany_transfers(from_entity_id);
CREATE INDEX IF NOT EXISTS idx_ic_transfers_to ON intercompany_transfers(to_entity_id);
CREATE INDEX IF NOT EXISTS idx_ic_balances_entity1 ON intercompany_balances(entity1_id);

-- Ownership indexes
CREATE INDEX IF NOT EXISTS idx_entity_ownership_entity ON entity_ownership(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_ownership_active ON entity_ownership(is_active);

-- 1099 indexes
CREATE INDEX IF NOT EXISTS idx_vendor_1099_tracking_vendor ON vendor_1099_tracking(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_1099_tracking_year ON vendor_1099_tracking(tax_year);
CREATE INDEX IF NOT EXISTS idx_vendor_1099_payments_tracking ON vendor_1099_payments(tracking_id);
CREATE INDEX IF NOT EXISTS idx_filing_1099_batches_entity ON filing_1099_batches(entity_id);

-- Month-end indexes
CREATE INDEX IF NOT EXISTS idx_month_end_templates_entity ON month_end_checklist_templates(entity_id);
CREATE INDEX IF NOT EXISTS idx_month_end_items_template ON month_end_template_items(template_id);
CREATE INDEX IF NOT EXISTS idx_period_close_checklists_entity ON period_close_checklists(entity_id);
CREATE INDEX IF NOT EXISTS idx_period_close_items_checklist ON period_close_checklist_items(checklist_id);
CREATE INDEX IF NOT EXISTS idx_closing_entries_entity ON closing_entries(entity_id);
CREATE INDEX IF NOT EXISTS idx_period_account_balances_entity ON period_account_balances(entity_id);

-- Employee/Payroll indexes
CREATE INDEX IF NOT EXISTS idx_employees_entity ON employees(entity_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(entity_id, status);
CREATE INDEX IF NOT EXISTS idx_payroll_entity ON payroll_runs(entity_id);
CREATE INDEX IF NOT EXISTS idx_payroll_items_run ON payroll_items(payroll_run_id);
CREATE INDEX IF NOT EXISTS idx_payroll_items_employee ON payroll_items(employee_id);

-- Tasks/Files/Communications indexes
CREATE INDEX IF NOT EXISTS idx_entity_tasks_entity ON entity_tasks(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_tasks_status ON entity_tasks(status);
CREATE INDEX IF NOT EXISTS idx_entity_tasks_due ON entity_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_entity_files_entity ON entity_files(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_files_folder ON entity_files(entity_id, folder_path);
CREATE INDEX IF NOT EXISTS idx_entity_comms_entity ON entity_communications(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_comms_date ON entity_communications(entity_id, communication_date);
CREATE INDEX IF NOT EXISTS idx_entity_contacts_entity ON entity_contacts(entity_id);

-- ============================================================================
-- PART 16: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE entity_accounting_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_w9s ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_payment_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payment_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE plaid_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transaction_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_matching_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE general_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_amortization_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE intercompany_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE intercompany_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_1099_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_1099_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE filing_1099_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE month_end_checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE month_end_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE period_close_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE period_close_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE closing_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE period_account_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_contacts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 17: RLS POLICIES (Allow authenticated access)
-- ============================================================================

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'entity_accounting_settings', 'chart_of_accounts', 'fiscal_periods',
    'vendors', 'vendor_w9s', 'bills', 'bill_lines', 'bill_payments', 'bill_payment_applications',
    'customers', 'invoices', 'invoice_lines', 'invoice_payments', 'invoice_payment_applications',
    'plaid_connections', 'bank_accounts', 'bank_transactions', 'bank_transaction_splits',
    'bank_reconciliations', 'reconciliation_items', 'bank_matching_rules',
    'journal_entries', 'journal_entry_lines', 'general_ledger',
    'expenses', 'expense_line_items', 'expense_categories',
    'loans', 'loan_payments', 'loan_transactions', 'loan_amortization_schedule', 'loan_draws',
    'entity_hierarchy', 'intercompany_transfers', 'intercompany_balances',
    'entity_ownership', 'vendor_1099_tracking', 'vendor_1099_payments', 'filing_1099_batches',
    'month_end_checklist_templates', 'month_end_template_items',
    'period_close_checklists', 'period_close_checklist_items',
    'closing_entries', 'period_account_balances',
    'employees', 'payroll_runs', 'payroll_items',
    'entity_tasks', 'entity_files', 'entity_communications', 'entity_contacts'
  ])
  LOOP
    BEGIN
      EXECUTE format('
        DROP POLICY IF EXISTS "Allow authenticated access to %I" ON %I;
        CREATE POLICY "Allow authenticated access to %I" ON %I
          FOR ALL TO authenticated USING (true) WITH CHECK (true);
      ', tbl, tbl, tbl, tbl);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not create policy for %: %', tbl, SQLERRM;
    END;
  END LOOP;
END $$;

-- ============================================================================
-- PART 18: UPDATED_AT TRIGGERS
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
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END LOOP;
END $$;

-- ============================================================================
-- PART 19: HELPER FUNCTIONS
-- ============================================================================

-- Generate entry numbers
CREATE OR REPLACE FUNCTION generate_entry_number(p_entity_id UUID, p_prefix TEXT)
RETURNS TEXT AS $$
DECLARE
  v_year TEXT;
  v_sequence INTEGER;
BEGIN
  v_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(entry_number FROM p_prefix || '-' || v_year || '-(.*)') AS INTEGER)
  ), 0) + 1
  INTO v_sequence
  FROM journal_entries
  WHERE entity_id = p_entity_id
    AND entry_number LIKE p_prefix || '-' || v_year || '-%';
  RETURN p_prefix || '-' || v_year || '-' || LPAD(v_sequence::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create fiscal periods for a year
CREATE OR REPLACE FUNCTION create_fiscal_periods_for_year(p_entity_id UUID, p_year INTEGER)
RETURNS VOID AS $$
DECLARE
  v_month INTEGER;
  v_start_date DATE;
  v_end_date DATE;
BEGIN
  FOR v_month IN 1..12 LOOP
    v_start_date := make_date(p_year, v_month, 1);
    v_end_date := (v_start_date + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
    INSERT INTO fiscal_periods (entity_id, period_name, period_year, period_month, start_date, end_date)
    VALUES (p_entity_id, TO_CHAR(v_start_date, 'Mon YYYY'), p_year, v_month, v_start_date, v_end_date)
    ON CONFLICT (entity_id, period_year, period_month) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Close fiscal period
CREATE OR REPLACE FUNCTION close_fiscal_period(p_period_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE fiscal_periods
  SET status = 'closed', closed_at = NOW(), closed_by = p_user_id
  WHERE id = p_period_id AND status = 'open';
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Get account balance
CREATE OR REPLACE FUNCTION get_account_balance(
  p_entity_id UUID,
  p_account_id UUID,
  p_as_of_date DATE DEFAULT CURRENT_DATE
)
RETURNS DECIMAL(15,2) AS $$
DECLARE
  v_balance DECIMAL(15,2);
  v_normal_balance TEXT;
BEGIN
  SELECT normal_balance INTO v_normal_balance FROM chart_of_accounts WHERE id = p_account_id;
  SELECT
    CASE
      WHEN v_normal_balance = 'debit' THEN COALESCE(SUM(debit_amount - credit_amount), 0)
      ELSE COALESCE(SUM(credit_amount - debit_amount), 0)
    END
  INTO v_balance
  FROM general_ledger
  WHERE entity_id = p_entity_id AND account_id = p_account_id AND transaction_date <= p_as_of_date;
  RETURN COALESCE(v_balance, 0);
END;
$$ LANGUAGE plpgsql;

-- Post journal entry to GL
CREATE OR REPLACE FUNCTION post_journal_entry_to_gl(p_journal_entry_id UUID)
RETURNS VOID AS $$
DECLARE
  v_entry RECORD;
  v_line RECORD;
BEGIN
  SELECT * INTO v_entry FROM journal_entries WHERE id = p_journal_entry_id;
  IF v_entry.status <> 'posted' THEN
    RAISE EXCEPTION 'Journal entry must be posted first';
  END IF;
  DELETE FROM general_ledger WHERE journal_entry_id = p_journal_entry_id;
  FOR v_line IN SELECT * FROM journal_entry_lines WHERE journal_entry_id = p_journal_entry_id
  LOOP
    INSERT INTO general_ledger (
      entity_id, account_id, journal_entry_id, journal_entry_line_id,
      transaction_date, posting_date, description, entry_number,
      debit_amount, credit_amount, fiscal_year, fiscal_month, project_id
    ) VALUES (
      v_entry.entity_id, v_line.account_id, v_entry.id, v_line.id,
      v_entry.entry_date, NOW()::DATE, COALESCE(v_line.description, v_entry.description), v_entry.entry_number,
      v_line.debit_amount, v_line.credit_amount,
      EXTRACT(YEAR FROM v_entry.entry_date), EXTRACT(MONTH FROM v_entry.entry_date),
      COALESCE(v_line.project_id, v_entry.project_id)
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Initialize COA from template
CREATE OR REPLACE FUNCTION initialize_coa_from_template(p_entity_id UUID, p_template_type TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_template_id UUID;
  v_count INTEGER := 0;
  v_account RECORD;
BEGIN
  SELECT id INTO v_template_id FROM coa_templates WHERE template_type = p_template_type LIMIT 1;
  IF v_template_id IS NULL THEN
    RAISE EXCEPTION 'Template not found: %', p_template_type;
  END IF;
  IF EXISTS (SELECT 1 FROM chart_of_accounts WHERE entity_id = p_entity_id LIMIT 1) THEN
    RAISE EXCEPTION 'Entity already has chart of accounts';
  END IF;
  FOR v_account IN SELECT * FROM coa_template_accounts WHERE template_id = v_template_id ORDER BY account_number
  LOOP
    INSERT INTO chart_of_accounts (
      entity_id, account_number, account_name, account_type, account_subtype,
      description, normal_balance, is_system_account
    ) VALUES (
      p_entity_id, v_account.account_number, COALESCE(v_account.account_name, v_account.name), v_account.account_type,
      v_account.account_subtype, v_account.description, v_account.normal_balance, COALESCE(v_account.is_system_account, false)
    );
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 20: AUTOMATION TRIGGERS
-- ============================================================================

-- Auto-generate journal entry number
CREATE OR REPLACE FUNCTION set_journal_entry_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.entry_number IS NULL OR NEW.entry_number = '' THEN
    NEW.entry_number := generate_entry_number(NEW.entity_id, 'JE');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_journal_entry_number ON journal_entries;
CREATE TRIGGER trg_journal_entry_number
  BEFORE INSERT ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION set_journal_entry_number();

-- Update journal entry totals
CREATE OR REPLACE FUNCTION update_journal_entry_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE journal_entries
  SET
    total_debits = (SELECT COALESCE(SUM(debit_amount), 0) FROM journal_entry_lines WHERE journal_entry_id = COALESCE(NEW.journal_entry_id, OLD.journal_entry_id)),
    total_credits = (SELECT COALESCE(SUM(credit_amount), 0) FROM journal_entry_lines WHERE journal_entry_id = COALESCE(NEW.journal_entry_id, OLD.journal_entry_id)),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.journal_entry_id, OLD.journal_entry_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_je_totals ON journal_entry_lines;
CREATE TRIGGER trg_update_je_totals
  AFTER INSERT OR UPDATE OR DELETE ON journal_entry_lines
  FOR EACH ROW
  EXECUTE FUNCTION update_journal_entry_totals();

-- Update bill totals
CREATE OR REPLACE FUNCTION update_bill_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE bills
  SET
    subtotal = (SELECT COALESCE(SUM(amount), 0) FROM bill_lines WHERE bill_id = COALESCE(NEW.bill_id, OLD.bill_id)),
    total_amount = (SELECT COALESCE(SUM(amount), 0) FROM bill_lines WHERE bill_id = COALESCE(NEW.bill_id, OLD.bill_id)) + COALESCE(tax_amount, 0),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.bill_id, OLD.bill_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_bill_totals ON bill_lines;
CREATE TRIGGER trg_update_bill_totals
  AFTER INSERT OR UPDATE OR DELETE ON bill_lines
  FOR EACH ROW
  EXECUTE FUNCTION update_bill_totals();

-- Update invoice totals
CREATE OR REPLACE FUNCTION update_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE invoices
  SET
    subtotal = (SELECT COALESCE(SUM(amount), 0) FROM invoice_lines WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)),
    total_amount = (SELECT COALESCE(SUM(amount), 0) FROM invoice_lines WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)) + COALESCE(tax_amount, 0),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_invoice_totals ON invoice_lines;
CREATE TRIGGER trg_update_invoice_totals
  AFTER INSERT OR UPDATE OR DELETE ON invoice_lines
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_totals();

-- Update bill status on payment
CREATE OR REPLACE FUNCTION update_bill_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  v_bill_total DECIMAL(15,2);
  v_amount_paid DECIMAL(15,2);
BEGIN
  SELECT total_amount INTO v_bill_total FROM bills WHERE id = NEW.bill_id;
  SELECT COALESCE(SUM(amount_applied), 0) INTO v_amount_paid FROM bill_payment_applications WHERE bill_id = NEW.bill_id;
  UPDATE bills
  SET
    amount_paid = v_amount_paid,
    status = CASE
      WHEN v_amount_paid >= v_bill_total THEN 'paid'
      WHEN v_amount_paid > 0 THEN 'partial'
      ELSE 'open'
    END,
    updated_at = NOW()
  WHERE id = NEW.bill_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_bill_on_payment ON bill_payment_applications;
CREATE TRIGGER trg_update_bill_on_payment
  AFTER INSERT OR UPDATE ON bill_payment_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_bill_on_payment();

-- Update invoice status on payment
CREATE OR REPLACE FUNCTION update_invoice_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  v_invoice_total DECIMAL(15,2);
  v_amount_paid DECIMAL(15,2);
BEGIN
  SELECT total_amount INTO v_invoice_total FROM invoices WHERE id = NEW.invoice_id;
  SELECT COALESCE(SUM(amount_applied), 0) INTO v_amount_paid FROM invoice_payment_applications WHERE invoice_id = NEW.invoice_id;
  UPDATE invoices
  SET
    amount_paid = v_amount_paid,
    status = CASE
      WHEN v_amount_paid >= v_invoice_total THEN 'paid'
      WHEN v_amount_paid > 0 THEN 'partial'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = NEW.invoice_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_invoice_on_payment ON invoice_payment_applications;
CREATE TRIGGER trg_update_invoice_on_payment
  AFTER INSERT OR UPDATE ON invoice_payment_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_on_payment();

-- Update 1099 tracking totals
CREATE OR REPLACE FUNCTION update_vendor_1099_totals()
RETURNS TRIGGER AS $$
BEGIN
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

DROP TRIGGER IF EXISTS update_1099_totals_on_payment ON vendor_1099_payments;
CREATE TRIGGER update_1099_totals_on_payment
  AFTER INSERT OR UPDATE OR DELETE ON vendor_1099_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_vendor_1099_totals();

-- ============================================================================
-- COMPLETE!
-- ============================================================================
SELECT 'Entity Accounting Schema Complete!' as status;
