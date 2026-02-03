-- ============================================================================
-- BANK ACCOUNTS AND RECONCILIATION
-- ============================================================================
-- This migration adds:
-- 1. Plaid Connections (bank linking)
-- 2. Bank Accounts (checking, savings, credit cards)
-- 3. Bank Transactions (imported from banks)
-- 4. Bank Transaction Splits
-- 5. Bank Reconciliations
-- 6. Reconciliation Items
-- 7. Bank Matching Rules (auto-categorization)
-- ============================================================================

-- =============================================
-- PLAID CONNECTIONS
-- =============================================
CREATE TABLE IF NOT EXISTS plaid_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,

  -- Plaid Data
  plaid_item_id VARCHAR(100) NOT NULL,
  plaid_access_token TEXT NOT NULL, -- Should be encrypted
  plaid_institution_id VARCHAR(50),

  -- Institution Info
  institution_name VARCHAR(100),
  institution_logo TEXT,
  institution_color VARCHAR(10),

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'error', 'disconnected')),
  error_code VARCHAR(50),
  error_message TEXT,

  -- Consent
  consent_expiration TIMESTAMPTZ,

  -- Sync Tracking
  last_successful_sync TIMESTAMPTZ,
  transactions_cursor TEXT, -- For incremental sync

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(entity_id, plaid_item_id)
);

-- =============================================
-- BANK ACCOUNTS
-- =============================================
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,

  -- Account Info
  account_name VARCHAR(100) NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('checking', 'savings', 'money_market', 'credit_card')),

  -- Bank Details
  bank_name VARCHAR(100),
  account_number_last4 VARCHAR(4),
  routing_number VARCHAR(9),

  -- GL Mapping
  gl_account_id UUID REFERENCES chart_of_accounts(id),

  -- Balances
  current_balance DECIMAL(15,2) DEFAULT 0,
  available_balance DECIMAL(15,2) DEFAULT 0,
  balance_as_of TIMESTAMPTZ,

  -- Credit Card Specific
  credit_limit DECIMAL(15,2),
  statement_close_day INTEGER CHECK (statement_close_day BETWEEN 1 AND 31),
  payment_due_day INTEGER CHECK (payment_due_day BETWEEN 1 AND 31),

  -- Plaid Integration
  plaid_account_id VARCHAR(100),
  plaid_item_id UUID REFERENCES plaid_connections(id),
  is_connected BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'never' CHECK (sync_status IN ('never', 'syncing', 'success', 'error')),
  sync_error TEXT,

  -- Settings
  is_active BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  auto_import_transactions BOOLEAN DEFAULT true,

  -- Check Numbering
  next_check_number INTEGER DEFAULT 1001,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BANK RECONCILIATIONS
-- =============================================
CREATE TABLE IF NOT EXISTS bank_reconciliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,

  -- Statement Info
  statement_date DATE NOT NULL,
  statement_ending_balance DECIMAL(15,2) NOT NULL,

  -- Period
  period_start_date DATE NOT NULL,
  period_end_date DATE NOT NULL,

  -- Calculated Balances
  beginning_balance DECIMAL(15,2) NOT NULL,
  total_deposits DECIMAL(15,2) DEFAULT 0,
  total_withdrawals DECIMAL(15,2) DEFAULT 0,
  cleared_balance DECIMAL(15,2),

  -- Status
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'voided')),

  -- Completion
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id),

  -- Adjusting Entry (if needed)
  adjustment_journal_entry_id UUID REFERENCES journal_entries(id),

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BANK TRANSACTIONS (Imported from Bank/Plaid)
-- =============================================
-- Note: Table may already exist; adding missing columns
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

-- =============================================
-- BANK TRANSACTION SPLITS
-- =============================================
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

-- =============================================
-- RECONCILIATION ITEMS
-- =============================================
CREATE TABLE IF NOT EXISTS reconciliation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reconciliation_id UUID NOT NULL REFERENCES bank_reconciliations(id) ON DELETE CASCADE,
  bank_transaction_id UUID NOT NULL REFERENCES bank_transactions(id),

  is_cleared BOOLEAN DEFAULT false,
  cleared_date DATE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MATCHING RULES (Auto-categorization)
-- =============================================
CREATE TABLE IF NOT EXISTS bank_matching_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,

  rule_name VARCHAR(100) NOT NULL,
  priority INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,

  -- Match Conditions
  match_description_contains TEXT,
  match_description_exact TEXT,
  match_amount_min DECIMAL(15,2),
  match_amount_max DECIMAL(15,2),
  match_amount_exact DECIMAL(15,2),
  match_merchant_name TEXT,
  match_transaction_type TEXT CHECK (match_transaction_type IN ('inflow', 'outflow', 'any')),

  -- Actions
  assign_account_id UUID REFERENCES chart_of_accounts(id),
  assign_vendor_id UUID REFERENCES vendors(id),
  assign_customer_id UUID REFERENCES customers(id),
  assign_project_id UUID REFERENCES projects(id),
  assign_memo TEXT,
  auto_approve BOOLEAN DEFAULT false,

  -- Stats
  times_applied INTEGER DEFAULT 0,
  last_applied_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_bank_accounts_entity ON bank_accounts(entity_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_plaid ON bank_accounts(plaid_account_id);
CREATE INDEX IF NOT EXISTS idx_plaid_connections_entity ON plaid_connections(entity_id);
CREATE INDEX IF NOT EXISTS idx_bank_txn_account ON bank_transactions(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_txn_date ON bank_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_bank_txn_status ON bank_transactions(match_status);
CREATE INDEX IF NOT EXISTS idx_bank_txn_reconciled ON bank_transactions(is_reconciled);
CREATE INDEX IF NOT EXISTS idx_bank_txn_plaid ON bank_transactions(plaid_transaction_id);
CREATE INDEX IF NOT EXISTS idx_recon_account ON bank_reconciliations(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_matching_rules_entity ON bank_matching_rules(entity_id);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE plaid_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transaction_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_matching_rules ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================
CREATE POLICY "Allow authenticated access to bank_accounts"
  ON bank_accounts FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to plaid_connections"
  ON plaid_connections FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to bank_transactions"
  ON bank_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to bank_transaction_splits"
  ON bank_transaction_splits FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to bank_reconciliations"
  ON bank_reconciliations FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to reconciliation_items"
  ON reconciliation_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to bank_matching_rules"
  ON bank_matching_rules FOR ALL TO authenticated USING (true) WITH CHECK (true);
