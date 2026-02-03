-- ============================================================================
-- JOURNAL ENTRIES FOR DOUBLE-ENTRY ACCOUNTING
-- ============================================================================
-- This migration adds:
-- 1. Journal Entries (header records)
-- 2. Journal Entry Lines (debit/credit lines)
-- 3. General Ledger (materialized for performance)
-- ============================================================================

-- =============================================
-- JOURNAL ENTRIES
-- =============================================
-- Note: Table may already exist; adding missing columns
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

-- =============================================
-- JOURNAL ENTRY LINES
-- =============================================
CREATE TABLE IF NOT EXISTS journal_entry_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,

  line_number INTEGER NOT NULL,
  account_id UUID NOT NULL REFERENCES chart_of_accounts(id),

  description TEXT,

  debit_amount DECIMAL(15,2) DEFAULT 0,
  credit_amount DECIMAL(15,2) DEFAULT 0,

  project_id UUID REFERENCES projects(id),
  cost_code_id UUID REFERENCES cost_codes(id),
  vendor_id UUID REFERENCES contacts(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT debit_xor_credit CHECK (
    (debit_amount > 0 AND credit_amount = 0) OR
    (debit_amount = 0 AND credit_amount > 0) OR
    (debit_amount = 0 AND credit_amount = 0)
  )
);

-- =============================================
-- GENERAL LEDGER (Materialized for Performance)
-- =============================================
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

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_je_entity ON journal_entries(entity_id);
CREATE INDEX IF NOT EXISTS idx_je_date ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_je_status ON journal_entries(status);
CREATE INDEX IF NOT EXISTS idx_je_source ON journal_entries(source_type, source_id);

CREATE INDEX IF NOT EXISTS idx_jel_entry ON journal_entry_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_jel_account ON journal_entry_lines(account_id);

CREATE INDEX IF NOT EXISTS idx_gl_entity_account ON general_ledger(entity_id, account_id);
CREATE INDEX IF NOT EXISTS idx_gl_date ON general_ledger(transaction_date);
CREATE INDEX IF NOT EXISTS idx_gl_fiscal ON general_ledger(fiscal_year, fiscal_month);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE general_ledger ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================
CREATE POLICY "Allow authenticated access to journal_entries"
  ON journal_entries FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated access to journal_entry_lines"
  ON journal_entry_lines FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated access to general_ledger"
  ON general_ledger FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
