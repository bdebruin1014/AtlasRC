-- ============================================================================
-- FINAL SCHEMA COMPLETION MIGRATION
-- ============================================================================
-- Run this in Supabase SQL Editor to ensure all required tables exist.
-- This migration is idempotent - safe to run multiple times.
-- ============================================================================

-- ============================================================================
-- PART 1: BANK TRANSACTIONS (Core banking table)
-- ============================================================================

-- Create bank_transactions if it doesn't exist
CREATE TABLE IF NOT EXISTS bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,

  -- Plaid Data
  plaid_transaction_id VARCHAR(100) UNIQUE,

  -- Transaction Details
  transaction_date DATE NOT NULL,
  posted_date DATE,
  amount DECIMAL(15,2) NOT NULL,
  transaction_type TEXT CHECK (transaction_type IN ('inflow', 'outflow')),

  -- Description
  description TEXT,
  original_description TEXT,

  -- Plaid Categories
  plaid_category TEXT[],
  plaid_merchant_name VARCHAR(200),
  plaid_payment_channel TEXT,

  -- Check Info
  check_number VARCHAR(20),

  -- Categorization
  is_categorized BOOLEAN DEFAULT false,
  account_id UUID REFERENCES chart_of_accounts(id),

  -- Matching
  match_status TEXT DEFAULT 'unmatched' CHECK (match_status IN ('unmatched', 'matched', 'excluded', 'split')),
  matched_bill_id UUID REFERENCES bills(id),
  matched_invoice_id UUID REFERENCES invoices(id),
  matched_expense_id UUID REFERENCES expenses(id),
  matched_transfer_id UUID,

  -- Journal Entry
  journal_entry_id UUID REFERENCES journal_entries(id),

  -- Reconciliation
  is_reconciled BOOLEAN DEFAULT false,
  reconciliation_id UUID REFERENCES bank_reconciliations(id),
  reconciled_at TIMESTAMPTZ,

  -- Project/Contact Mapping
  project_id UUID REFERENCES projects(id),
  vendor_id UUID REFERENCES vendors(id),
  customer_id UUID REFERENCES customers(id),

  -- Notes
  memo TEXT,

  -- Splits
  is_split BOOLEAN DEFAULT false,
  parent_transaction_id UUID REFERENCES bank_transactions(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table already exists
DO $$
BEGIN
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
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS matched_expense_id UUID REFERENCES expenses(id);
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS matched_transfer_id UUID;
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS journal_entry_id UUID REFERENCES journal_entries(id);
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS is_reconciled BOOLEAN DEFAULT false;
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS reconciliation_id UUID REFERENCES bank_reconciliations(id);
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS reconciled_at TIMESTAMPTZ;
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES vendors(id);
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS memo TEXT;
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS is_split BOOLEAN DEFAULT false;
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS parent_transaction_id UUID REFERENCES bank_transactions(id);
  ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN OTHERS THEN NULL;
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

-- ============================================================================
-- PART 2: TRANSACTIONS TABLE (For general ledger transactions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,

  -- Transaction Info
  transaction_date DATE NOT NULL,
  description TEXT,
  reference_number VARCHAR(100),

  -- Transaction Type
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'income', 'expense', 'transfer', 'journal', 'bill', 'invoice', 'payment'
  )),

  -- Amounts
  amount DECIMAL(15,2) NOT NULL,

  -- Account References
  account_id UUID REFERENCES chart_of_accounts(id),

  -- Category
  category VARCHAR(100),

  -- Project Allocation
  project_id UUID REFERENCES projects(id),

  -- Contact References
  vendor_id UUID REFERENCES vendors(id),
  customer_id UUID REFERENCES customers(id),
  contact_id UUID REFERENCES contacts(id),

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'posted', 'void', 'reconciled')),

  -- Journal Entry Link
  journal_entry_id UUID REFERENCES journal_entries(id),

  -- Bank Transaction Link
  bank_transaction_id UUID REFERENCES bank_transactions(id),

  -- Notes
  memo TEXT,
  notes TEXT,

  -- Attachments
  attachments TEXT[],

  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 3: ACCOUNTS TABLE (Legacy accounts table for transactions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,

  name VARCHAR(200) NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN (
    'asset', 'liability', 'equity', 'revenue', 'expense', 'bank', 'credit_card'
  )),

  -- Balance tracking
  current_balance DECIMAL(15,2) DEFAULT 0,

  -- Bank Account Details (if type is bank or credit_card)
  bank_name VARCHAR(100),
  account_number_last4 VARCHAR(4),
  routing_number VARCHAR(9),

  -- GL Mapping
  gl_account_id UUID REFERENCES chart_of_accounts(id),

  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 4: ACTIVITY LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,

  -- Who
  user_id UUID REFERENCES auth.users(id),
  user_email VARCHAR(255),
  user_name VARCHAR(255),

  -- What
  action TEXT NOT NULL,
  action_type TEXT CHECK (action_type IN (
    'create', 'update', 'delete', 'view', 'login', 'logout', 'export', 'import', 'other'
  )),

  -- Target
  resource_type VARCHAR(100),
  resource_id UUID,
  resource_name VARCHAR(255),

  -- Details
  description TEXT,
  details JSONB,
  old_values JSONB,
  new_values JSONB,

  -- Context
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(100),

  -- Project context
  project_id UUID REFERENCES projects(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 5: USER PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  email VARCHAR(255),
  full_name VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),

  avatar_url TEXT,
  phone VARCHAR(50),

  -- Settings
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  locale VARCHAR(10) DEFAULT 'en-US',

  -- Organization
  organization_id UUID REFERENCES organizations(id),
  default_entity_id UUID REFERENCES entities(id),

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 6: MISSING COA TEMPLATES COLUMNS
-- ============================================================================

DO $$
BEGIN
  ALTER TABLE coa_templates ADD COLUMN IF NOT EXISTS entity_type TEXT;
  ALTER TABLE coa_templates ADD COLUMN IF NOT EXISTS industry VARCHAR(100);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ============================================================================
-- PART 7: INDEXES
-- ============================================================================

-- Bank Transactions Indexes
CREATE INDEX IF NOT EXISTS idx_bank_txn_account ON bank_transactions(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_txn_entity ON bank_transactions(entity_id);
CREATE INDEX IF NOT EXISTS idx_bank_txn_date ON bank_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_bank_txn_plaid ON bank_transactions(plaid_transaction_id);
CREATE INDEX IF NOT EXISTS idx_bank_txn_status ON bank_transactions(match_status);
CREATE INDEX IF NOT EXISTS idx_bank_txn_reconciled ON bank_transactions(is_reconciled);

-- Transactions Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_entity ON transactions(entity_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_project ON transactions(project_id);

-- Accounts Indexes
CREATE INDEX IF NOT EXISTS idx_accounts_entity ON accounts(entity_id);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(account_type);

-- Activity Logs Indexes
CREATE INDEX IF NOT EXISTS idx_activity_entity ON activity_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_date ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_resource ON activity_logs(resource_type, resource_id);

-- Profiles Index
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_org ON profiles(organization_id);

-- ============================================================================
-- PART 8: ENABLE RLS
-- ============================================================================

ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transaction_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 9: RLS POLICIES
-- ============================================================================

-- Drop existing policies to avoid conflicts
DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow authenticated access to bank_transactions" ON bank_transactions;
  DROP POLICY IF EXISTS "Allow authenticated access to bank_transaction_splits" ON bank_transaction_splits;
  DROP POLICY IF EXISTS "Allow authenticated access to transactions" ON transactions;
  DROP POLICY IF EXISTS "Allow authenticated access to accounts" ON accounts;
  DROP POLICY IF EXISTS "Allow authenticated access to activity_logs" ON activity_logs;
  DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Create policies
CREATE POLICY "Allow authenticated access to bank_transactions"
  ON bank_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to bank_transaction_splits"
  ON bank_transaction_splits FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to transactions"
  ON transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to accounts"
  ON accounts FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to activity_logs"
  ON activity_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow insert on profiles"
  ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- ============================================================================
-- PART 10: UPDATED_AT TRIGGERS
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
  FOR tbl IN SELECT unnest(ARRAY[
    'bank_transactions', 'transactions', 'accounts', 'profiles'
  ]) LOOP
    BEGIN
      EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON %I', tbl, tbl);
      EXECUTE format('
        CREATE TRIGGER update_%I_updated_at
          BEFORE UPDATE ON %I
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column()
      ', tbl, tbl);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;
END $$;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.table_schema = 'public') as columns
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
AND table_name IN (
  'bank_transactions', 'bank_transaction_splits', 'transactions',
  'accounts', 'activity_logs', 'profiles'
)
ORDER BY table_name;
