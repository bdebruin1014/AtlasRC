-- ============================================================================
-- ENTITY ACCOUNTING CORE TABLES
-- ============================================================================
-- This migration adds:
-- 1. Entity Accounting Settings (per-entity configuration)
-- 2. Chart of Accounts (alternative structure)
-- 3. Fiscal Periods (period tracking and closing)
-- ============================================================================

-- =============================================
-- ENTITY ACCOUNTING SETTINGS
-- =============================================
CREATE TABLE IF NOT EXISTS entity_accounting_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,

  -- Accounting Configuration
  accounting_method TEXT DEFAULT 'accrual' CHECK (accounting_method IN ('cash', 'accrual')),
  fiscal_year_end_month INTEGER DEFAULT 12 CHECK (fiscal_year_end_month BETWEEN 1 AND 12),
  fiscal_year_end_day INTEGER DEFAULT 31 CHECK (fiscal_year_end_day BETWEEN 1 AND 31),
  default_payment_terms TEXT DEFAULT 'NET_30',
  base_currency TEXT DEFAULT 'USD',

  -- Late Fee Settings
  late_fee_enabled BOOLEAN DEFAULT false,
  late_fee_percent DECIMAL(5,2) DEFAULT 1.5,
  late_fee_grace_days INTEGER DEFAULT 15,

  -- 1099 Settings
  alert_1099_threshold BOOLEAN DEFAULT true,
  require_w9_before_payment BOOLEAN DEFAULT true,

  -- Notifications
  notify_bill_due_days INTEGER DEFAULT 7,
  notify_invoice_overdue BOOLEAN DEFAULT true,
  low_balance_alert_threshold DECIMAL(15,2) DEFAULT 1000.00,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(entity_id)
);

-- =============================================
-- CHART OF ACCOUNTS (Simplified Structure)
-- =============================================
-- Note: This complements the existing 'accounts' table with a more
-- traditional chart_of_accounts structure for reporting
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

CREATE INDEX IF NOT EXISTS idx_coa_entity ON chart_of_accounts(entity_id);
CREATE INDEX IF NOT EXISTS idx_coa_type ON chart_of_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_coa_parent ON chart_of_accounts(parent_account_id);

-- =============================================
-- FISCAL PERIODS
-- =============================================
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

CREATE INDEX IF NOT EXISTS idx_fiscal_periods_entity ON fiscal_periods(entity_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_periods_year ON fiscal_periods(period_year);
CREATE INDEX IF NOT EXISTS idx_fiscal_periods_status ON fiscal_periods(status);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE entity_accounting_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_periods ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================
-- Allow authenticated users full access (can be refined later with user_entity_access)

CREATE POLICY "Allow authenticated access to entity_accounting_settings"
  ON entity_accounting_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated access to chart_of_accounts"
  ON chart_of_accounts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated access to fiscal_periods"
  ON fiscal_periods FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

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

DROP TRIGGER IF EXISTS update_entity_accounting_settings_updated_at ON entity_accounting_settings;
CREATE TRIGGER update_entity_accounting_settings_updated_at
  BEFORE UPDATE ON entity_accounting_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chart_of_accounts_updated_at ON chart_of_accounts;
CREATE TRIGGER update_chart_of_accounts_updated_at
  BEFORE UPDATE ON chart_of_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to create fiscal periods for an entity
CREATE OR REPLACE FUNCTION create_fiscal_periods_for_year(
  p_entity_id UUID,
  p_year INTEGER
)
RETURNS VOID AS $$
DECLARE
  v_month INTEGER;
  v_start_date DATE;
  v_end_date DATE;
  v_period_name TEXT;
BEGIN
  FOR v_month IN 1..12 LOOP
    v_start_date := make_date(p_year, v_month, 1);
    v_end_date := (v_start_date + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
    v_period_name := TO_CHAR(v_start_date, 'Mon YYYY');

    INSERT INTO fiscal_periods (entity_id, period_name, period_year, period_month, start_date, end_date)
    VALUES (p_entity_id, v_period_name, p_year, v_month, v_start_date, v_end_date)
    ON CONFLICT (entity_id, period_year, period_month) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to close a fiscal period
CREATE OR REPLACE FUNCTION close_fiscal_period(
  p_period_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE fiscal_periods
  SET status = 'closed',
      closed_at = NOW(),
      closed_by = p_user_id
  WHERE id = p_period_id
    AND status = 'open';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to get default accounting settings for an entity
CREATE OR REPLACE FUNCTION get_or_create_entity_accounting_settings(p_entity_id UUID)
RETURNS entity_accounting_settings AS $$
DECLARE
  v_settings entity_accounting_settings;
BEGIN
  SELECT * INTO v_settings
  FROM entity_accounting_settings
  WHERE entity_id = p_entity_id;

  IF NOT FOUND THEN
    INSERT INTO entity_accounting_settings (entity_id)
    VALUES (p_entity_id)
    RETURNING * INTO v_settings;
  END IF;

  RETURN v_settings;
END;
$$ LANGUAGE plpgsql;
