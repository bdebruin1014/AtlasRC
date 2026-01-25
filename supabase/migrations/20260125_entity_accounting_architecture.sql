-- ============================================================================
-- ENTITY & ACCOUNTING ARCHITECTURE MIGRATION
-- ============================================================================
-- This migration adds:
-- 1. Extended entity fields (legal structure, purpose, project type, syndication)
-- 2. Chart of Accounts template system
-- 3. Entity-specific accounts
-- 4. Journal entries and lines
-- 5. Entity ownership relationships
-- 6. Duplicate detection alerts
-- ============================================================================

-- ============================================================================
-- PART 1: EXTEND ENTITIES TABLE
-- ============================================================================

-- Add new entity fields
-- Note: The existing 'type' field will be renamed to avoid confusion
-- We're adding entity_type (legal structure), entity_purpose (operational role)

ALTER TABLE entities
ADD COLUMN IF NOT EXISTS entity_type TEXT CHECK (entity_type IN (
  'llc', 's_corp', 'c_corp', 'sole_proprietorship', 'partnership', 'lp', 'trust', 'individual', 'other'
)),
ADD COLUMN IF NOT EXISTS entity_purpose TEXT CHECK (entity_purpose IN (
  'holding_company', 'operating_company', 'spe'
)),
ADD COLUMN IF NOT EXISTS project_type TEXT CHECK (project_type IN (
  'lot_development', 'btr', 'fix_and_flip', 'spec_build', 'community_development', 'none'
)),
ADD COLUMN IF NOT EXISTS is_syndication BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sec_exemption TEXT CHECK (sec_exemption IN (
  '506b', '506c', 'reg_a', 'reg_cf', 'other'
)),
ADD COLUMN IF NOT EXISTS state_of_formation TEXT,
ADD COLUMN IF NOT EXISTS formation_date DATE,
ADD COLUMN IF NOT EXISTS legal_name TEXT,
ADD COLUMN IF NOT EXISTS dba_name TEXT,
ADD COLUMN IF NOT EXISTS fiscal_year_end TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS address_line1 TEXT,
ADD COLUMN IF NOT EXISTS address_line2 TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
ADD COLUMN IF NOT EXISTS bank_routing_number TEXT;

-- Create index for new fields
CREATE INDEX IF NOT EXISTS idx_entities_entity_type ON entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_entities_entity_purpose ON entities(entity_purpose);
CREATE INDEX IF NOT EXISTS idx_entities_project_type ON entities(project_type);
CREATE INDEX IF NOT EXISTS idx_entities_is_syndication ON entities(is_syndication);

-- ============================================================================
-- PART 2: CHART OF ACCOUNTS TEMPLATE SYSTEM
-- ============================================================================

-- Templates table - stores predefined CoA templates
CREATE TABLE IF NOT EXISTS coa_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  entity_purpose TEXT NOT NULL CHECK (entity_purpose IN (
    'holding_company', 'operating_company', 'spe'
  )),
  project_type TEXT CHECK (project_type IN (
    'lot_development', 'btr', 'fix_and_flip', 'spec_build', 'community_development', 'none'
  )),
  is_default BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT true, -- System templates can't be deleted
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Template accounts - accounts within a template
CREATE TABLE IF NOT EXISTS coa_template_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES coa_templates(id) ON DELETE CASCADE,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN (
    'asset', 'liability', 'equity', 'revenue', 'cogs', 'expense', 'other_income', 'other_expense'
  )),
  sub_type TEXT, -- e.g., 'current_asset', 'fixed_asset', 'long_term_liability'
  parent_account_number TEXT, -- For hierarchical accounts
  description TEXT,
  is_header BOOLEAN DEFAULT false, -- Header accounts for grouping
  is_required BOOLEAN DEFAULT false, -- Required accounts can't be removed
  normal_balance TEXT CHECK (normal_balance IN ('debit', 'credit')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, account_number)
);

-- Indexes for templates
CREATE INDEX IF NOT EXISTS idx_coa_templates_purpose ON coa_templates(entity_purpose);
CREATE INDEX IF NOT EXISTS idx_coa_templates_project_type ON coa_templates(project_type);
CREATE INDEX IF NOT EXISTS idx_coa_templates_default ON coa_templates(is_default);
CREATE INDEX IF NOT EXISTS idx_coa_template_accounts_template ON coa_template_accounts(template_id);
CREATE INDEX IF NOT EXISTS idx_coa_template_accounts_type ON coa_template_accounts(account_type);

-- ============================================================================
-- PART 3: ENTITY-SPECIFIC ACCOUNTS (CHART OF ACCOUNTS)
-- ============================================================================

-- Entity accounts - actual CoA for each entity
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN (
    'asset', 'liability', 'equity', 'revenue', 'cogs', 'expense', 'other_income', 'other_expense'
  )),
  sub_type TEXT,
  parent_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  description TEXT,
  is_header BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  normal_balance TEXT CHECK (normal_balance IN ('debit', 'credit')),
  opening_balance NUMERIC(15,2) DEFAULT 0,
  current_balance NUMERIC(15,2) DEFAULT 0,
  bank_account_id UUID, -- Link to banking module if applicable
  display_order INTEGER DEFAULT 0,
  template_account_id UUID REFERENCES coa_template_accounts(id), -- Track origin template
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_id, account_number)
);

-- Indexes for accounts
CREATE INDEX IF NOT EXISTS idx_accounts_entity ON accounts(entity_id);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_accounts_parent ON accounts(parent_account_id);
CREATE INDEX IF NOT EXISTS idx_accounts_active ON accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_accounts_number ON accounts(account_number);

-- ============================================================================
-- PART 4: JOURNAL ENTRIES
-- ============================================================================

-- Journal entries header
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  entry_number TEXT NOT NULL,
  entry_date DATE NOT NULL,
  description TEXT,
  memo TEXT,
  reference_type TEXT, -- 'invoice', 'bill', 'payment', 'adjustment', 'transfer'
  reference_id UUID, -- ID of related record
  is_adjusting BOOLEAN DEFAULT false,
  is_closing BOOLEAN DEFAULT false,
  is_reversing BOOLEAN DEFAULT false,
  reversed_entry_id UUID REFERENCES journal_entries(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'void')),
  posted_at TIMESTAMPTZ,
  posted_by UUID REFERENCES auth.users(id),
  voided_at TIMESTAMPTZ,
  voided_by UUID REFERENCES auth.users(id),
  void_reason TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_id, entry_number)
);

-- Journal entry lines (debits and credits)
CREATE TABLE IF NOT EXISTS journal_entry_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id),
  description TEXT,
  debit_amount NUMERIC(15,2) DEFAULT 0,
  credit_amount NUMERIC(15,2) DEFAULT 0,
  project_id UUID REFERENCES projects(id), -- Optional project allocation
  cost_code TEXT, -- Optional cost code for project tracking
  vendor_id UUID, -- Reference to vendor if applicable
  line_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for journal entries
CREATE INDEX IF NOT EXISTS idx_journal_entries_entity ON journal_entries(entity_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_status ON journal_entries(status);
CREATE INDEX IF NOT EXISTS idx_journal_entries_reference ON journal_entries(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_entry ON journal_entry_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_account ON journal_entry_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_project ON journal_entry_lines(project_id);

-- ============================================================================
-- PART 5: ENTITY OWNERSHIP RELATIONSHIPS
-- ============================================================================

-- Track ownership percentages between entities
CREATE TABLE IF NOT EXISTS entity_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  child_entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  ownership_percentage NUMERIC(5,2) NOT NULL CHECK (ownership_percentage >= 0 AND ownership_percentage <= 100),
  relationship_type TEXT DEFAULT 'ownership' CHECK (relationship_type IN (
    'ownership', 'management', 'investment'
  )),
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_entity_id, child_entity_id, effective_date),
  CHECK (parent_entity_id != child_entity_id)
);

-- Indexes for entity relationships
CREATE INDEX IF NOT EXISTS idx_entity_relationships_parent ON entity_relationships(parent_entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_relationships_child ON entity_relationships(child_entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_relationships_type ON entity_relationships(relationship_type);
CREATE INDEX IF NOT EXISTS idx_entity_relationships_effective ON entity_relationships(effective_date);

-- ============================================================================
-- PART 6: DUPLICATE DETECTION ALERTS
-- ============================================================================

-- Track potential duplicate accounts across entities
CREATE TABLE IF NOT EXISTS coa_duplicate_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  duplicate_account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  duplicate_entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  match_type TEXT NOT NULL CHECK (match_type IN (
    'exact_number', 'similar_name', 'exact_match'
  )),
  confidence_score NUMERIC(3,2) DEFAULT 0.00, -- 0.00 to 1.00
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'dismissed', 'merged'
  )),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, duplicate_account_id)
);

-- Indexes for duplicate alerts
CREATE INDEX IF NOT EXISTS idx_coa_duplicate_alerts_entity ON coa_duplicate_alerts(entity_id);
CREATE INDEX IF NOT EXISTS idx_coa_duplicate_alerts_status ON coa_duplicate_alerts(status);
CREATE INDEX IF NOT EXISTS idx_coa_duplicate_alerts_match ON coa_duplicate_alerts(match_type);

-- ============================================================================
-- PART 7: ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE coa_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE coa_template_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE coa_duplicate_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow authenticated users full access (can be refined later)
CREATE POLICY "Allow authenticated users full access to coa_templates"
  ON coa_templates FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to coa_template_accounts"
  ON coa_template_accounts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to accounts"
  ON accounts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to journal_entries"
  ON journal_entries FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to journal_entry_lines"
  ON journal_entry_lines FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to entity_relationships"
  ON entity_relationships FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to coa_duplicate_alerts"
  ON coa_duplicate_alerts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- PART 8: HELPER FUNCTIONS
-- ============================================================================

-- Function to validate ownership percentages don't exceed 100% for a child entity
CREATE OR REPLACE FUNCTION check_ownership_total()
RETURNS TRIGGER AS $$
DECLARE
  total_ownership NUMERIC(5,2);
BEGIN
  SELECT COALESCE(SUM(ownership_percentage), 0) INTO total_ownership
  FROM entity_relationships
  WHERE child_entity_id = NEW.child_entity_id
    AND relationship_type = 'ownership'
    AND (end_date IS NULL OR end_date >= CURRENT_DATE)
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);

  IF (total_ownership + NEW.ownership_percentage) > 100 THEN
    RAISE EXCEPTION 'Total ownership percentage for entity cannot exceed 100%%. Current: %, Attempting to add: %',
      total_ownership, NEW.ownership_percentage;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for ownership validation
DROP TRIGGER IF EXISTS validate_ownership_total ON entity_relationships;
CREATE TRIGGER validate_ownership_total
  BEFORE INSERT OR UPDATE ON entity_relationships
  FOR EACH ROW
  WHEN (NEW.relationship_type = 'ownership')
  EXECUTE FUNCTION check_ownership_total();

-- Function to generate next journal entry number
CREATE OR REPLACE FUNCTION generate_journal_entry_number(p_entity_id UUID)
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  prefix TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(entry_number FROM 4) AS INTEGER)), 0) + 1
  INTO next_num
  FROM journal_entries
  WHERE entity_id = p_entity_id
    AND entry_number LIKE 'JE-%';

  RETURN 'JE-' || LPAD(next_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to update account balances after journal entry posting
CREATE OR REPLACE FUNCTION update_account_balances()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Update account balance based on normal balance
    UPDATE accounts a
    SET current_balance = (
      SELECT COALESCE(SUM(
        CASE
          WHEN a.normal_balance = 'debit' THEN jel.debit_amount - jel.credit_amount
          ELSE jel.credit_amount - jel.debit_amount
        END
      ), 0) + a.opening_balance
      FROM journal_entry_lines jel
      JOIN journal_entries je ON je.id = jel.journal_entry_id
      WHERE jel.account_id = a.id
        AND je.status = 'posted'
    ),
    updated_at = NOW()
    WHERE a.id = NEW.account_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 9: UPDATED_AT TRIGGERS
-- ============================================================================

-- Update triggers for new tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_coa_templates_updated_at ON coa_templates;
CREATE TRIGGER update_coa_templates_updated_at
  BEFORE UPDATE ON coa_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_journal_entries_updated_at ON journal_entries;
CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_entity_relationships_updated_at ON entity_relationships;
CREATE TRIGGER update_entity_relationships_updated_at
  BEFORE UPDATE ON entity_relationships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
