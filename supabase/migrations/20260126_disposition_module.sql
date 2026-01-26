-- Disposition Module Migration
-- Tables for tracking property sales, contracts, takedowns, and settlements

-- ============================================================================
-- DISPOSITION CONTRACTS
-- Main purchase/sale agreements
-- ============================================================================
CREATE TABLE IF NOT EXISTS disposition_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  contract_number TEXT,

  -- Buyer info
  buyer_name TEXT NOT NULL,
  buyer_contact_name TEXT,
  buyer_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  buyer_email TEXT,
  buyer_phone TEXT,

  -- Contract type and details
  contract_type TEXT DEFAULT 'bulk-sale' CHECK (contract_type IN ('bulk-sale', 'individual-sale', 'lease', 'assignment')),
  disposition_type TEXT CHECK (disposition_type IN ('lot-development', 'btr-development', 'for-sale-development', 'fix-flip', 'scattered-lot')),

  -- Units/Lots
  total_units INTEGER DEFAULT 1,
  unit_type TEXT DEFAULT 'lot', -- lot, home, unit, property
  price_per_unit DECIMAL(15,2),

  -- Pricing
  contract_price DECIMAL(15,2) NOT NULL,
  earnest_money DECIMAL(15,2) DEFAULT 0,

  -- Key dates
  contract_date DATE,
  effective_date DATE,
  dd_deadline DATE,
  financing_deadline DATE,
  scheduled_close_date DATE,
  actual_close_date DATE,

  -- Terms
  escalation_rate DECIMAL(5,4) DEFAULT 0, -- e.g., 0.02 for 2%
  escalation_period TEXT, -- 'monthly', 'quarterly', 'per-takedown'

  -- Status tracking
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'negotiating', 'pending', 'active', 'closed', 'cancelled', 'expired')),
  signed_date DATE,

  -- Seller info
  seller_entity TEXT,
  seller_entity_id UUID,

  -- Notes and metadata
  notes TEXT,
  terms_summary TEXT,

  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DISPOSITION TAKEDOWNS
-- Scheduled takedown closings for bulk sales
-- ============================================================================
CREATE TABLE IF NOT EXISTS disposition_takedowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES disposition_contracts(id) ON DELETE CASCADE,
  takedown_number INTEGER NOT NULL,

  -- Scheduled details
  scheduled_date DATE NOT NULL,
  scheduled_units INTEGER NOT NULL,
  scheduled_amount DECIMAL(15,2) NOT NULL,

  -- Actual details (filled when completed)
  actual_date DATE,
  actual_units INTEGER,
  actual_amount DECIMAL(15,2),

  -- Lot/unit details
  unit_identifiers TEXT[], -- Array of lot numbers, unit numbers, etc.

  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'upcoming', 'pending', 'completed', 'cancelled', 'delayed')),

  -- Settlement reference
  settlement_id UUID,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DISPOSITION SETTLEMENTS
-- Settlement statements (HUD-1/CD style)
-- ============================================================================
CREATE TABLE IF NOT EXISTS disposition_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES disposition_contracts(id) ON DELETE SET NULL,
  takedown_id UUID REFERENCES disposition_takedowns(id) ON DELETE SET NULL,

  settlement_number TEXT,

  -- Parties
  buyer_name TEXT NOT NULL,
  seller_name TEXT NOT NULL,

  -- Property details
  units_conveyed INTEGER DEFAULT 1,
  unit_identifiers TEXT[],
  property_description TEXT,

  -- Title company
  title_company TEXT,
  escrow_number TEXT,
  escrow_officer TEXT,

  -- Key dates
  closing_date DATE NOT NULL,
  funding_date DATE,
  recording_date DATE,

  -- Financials
  gross_sale_price DECIMAL(15,2) NOT NULL,
  total_seller_credits DECIMAL(15,2) DEFAULT 0,
  total_seller_debits DECIMAL(15,2) DEFAULT 0,
  net_to_seller DECIMAL(15,2),

  total_buyer_credits DECIMAL(15,2) DEFAULT 0,
  total_buyer_debits DECIMAL(15,2) DEFAULT 0,
  cash_from_buyer DECIMAL(15,2),

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'closed', 'funded', 'recorded', 'cancelled')),
  funds_received BOOLEAN DEFAULT false,
  funds_received_date DATE,

  -- Document storage
  settlement_statement_url TEXT,
  deed_url TEXT,

  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DISPOSITION SETTLEMENT ITEMS
-- Line items on settlement statements
-- ============================================================================
CREATE TABLE IF NOT EXISTS disposition_settlement_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_id UUID REFERENCES disposition_settlements(id) ON DELETE CASCADE,

  -- Item details
  line_number INTEGER,
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,

  -- Type: credit or debit, and for which party
  item_type TEXT NOT NULL CHECK (item_type IN ('seller_credit', 'seller_debit', 'buyer_credit', 'buyer_debit')),

  -- Category for reporting
  category TEXT, -- 'commission', 'title', 'recording', 'taxes', 'hoa', 'prorations', 'other'

  -- Payee info (for disbursements)
  payee_name TEXT,
  payee_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DISPOSITION UNITS
-- Individual lots/units being sold (for tracking inventory)
-- ============================================================================
CREATE TABLE IF NOT EXISTS disposition_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  -- Unit identification
  unit_number TEXT NOT NULL,
  unit_type TEXT DEFAULT 'lot', -- lot, home, unit, condo, townhome
  phase TEXT,
  block TEXT,

  -- Address
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,

  -- Pricing
  list_price DECIMAL(15,2),
  sale_price DECIMAL(15,2),

  -- Size/specs
  square_feet INTEGER,
  lot_size DECIMAL(10,2),
  lot_size_unit TEXT DEFAULT 'acres', -- acres, sqft
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),

  -- Status tracking
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'under-contract', 'sold', 'not-released')),

  -- Contract/buyer linkage
  contract_id UUID REFERENCES disposition_contracts(id) ON DELETE SET NULL,
  buyer_name TEXT,

  -- Dates
  release_date DATE,
  contract_date DATE,
  close_date DATE,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_disposition_contracts_project ON disposition_contracts(project_id);
CREATE INDEX IF NOT EXISTS idx_disposition_contracts_status ON disposition_contracts(status);
CREATE INDEX IF NOT EXISTS idx_disposition_contracts_buyer ON disposition_contracts(buyer_contact_id);
CREATE INDEX IF NOT EXISTS idx_disposition_takedowns_contract ON disposition_takedowns(contract_id);
CREATE INDEX IF NOT EXISTS idx_disposition_takedowns_status ON disposition_takedowns(status);
CREATE INDEX IF NOT EXISTS idx_disposition_settlements_project ON disposition_settlements(project_id);
CREATE INDEX IF NOT EXISTS idx_disposition_settlements_contract ON disposition_settlements(contract_id);
CREATE INDEX IF NOT EXISTS idx_disposition_settlement_items_settlement ON disposition_settlement_items(settlement_id);
CREATE INDEX IF NOT EXISTS idx_disposition_units_project ON disposition_units(project_id);
CREATE INDEX IF NOT EXISTS idx_disposition_units_status ON disposition_units(status);
CREATE INDEX IF NOT EXISTS idx_disposition_units_contract ON disposition_units(contract_id);

-- ============================================================================
-- ENABLE RLS
-- ============================================================================
ALTER TABLE disposition_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE disposition_takedowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE disposition_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE disposition_settlement_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE disposition_units ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES (idempotent)
-- ============================================================================

-- disposition_contracts policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='disposition_contracts' AND policyname='Disposition contracts viewable by authenticated users') THEN
    EXECUTE 'DROP POLICY "Disposition contracts viewable by authenticated users" ON public.disposition_contracts';
  END IF;
  EXECUTE 'CREATE POLICY "Disposition contracts viewable by authenticated users" ON public.disposition_contracts FOR SELECT TO authenticated USING (true)';
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='disposition_contracts' AND policyname='Authenticated users can manage disposition contracts') THEN
    EXECUTE 'DROP POLICY "Authenticated users can manage disposition contracts" ON public.disposition_contracts';
  END IF;
  EXECUTE 'CREATE POLICY "Authenticated users can manage disposition contracts" ON public.disposition_contracts FOR ALL TO authenticated USING (true)';
END$$;

-- disposition_takedowns policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='disposition_takedowns' AND policyname='Disposition takedowns viewable by authenticated users') THEN
    EXECUTE 'DROP POLICY "Disposition takedowns viewable by authenticated users" ON public.disposition_takedowns';
  END IF;
  EXECUTE 'CREATE POLICY "Disposition takedowns viewable by authenticated users" ON public.disposition_takedowns FOR SELECT TO authenticated USING (true)';
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='disposition_takedowns' AND policyname='Authenticated users can manage disposition takedowns') THEN
    EXECUTE 'DROP POLICY "Authenticated users can manage disposition takedowns" ON public.disposition_takedowns';
  END IF;
  EXECUTE 'CREATE POLICY "Authenticated users can manage disposition takedowns" ON public.disposition_takedowns FOR ALL TO authenticated USING (true)';
END$$;

-- disposition_settlements policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='disposition_settlements' AND policyname='Disposition settlements viewable by authenticated users') THEN
    EXECUTE 'DROP POLICY "Disposition settlements viewable by authenticated users" ON public.disposition_settlements';
  END IF;
  EXECUTE 'CREATE POLICY "Disposition settlements viewable by authenticated users" ON public.disposition_settlements FOR SELECT TO authenticated USING (true)';
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='disposition_settlements' AND policyname='Authenticated users can manage disposition settlements') THEN
    EXECUTE 'DROP POLICY "Authenticated users can manage disposition settlements" ON public.disposition_settlements';
  END IF;
  EXECUTE 'CREATE POLICY "Authenticated users can manage disposition settlements" ON public.disposition_settlements FOR ALL TO authenticated USING (true)';
END$$;

-- disposition_settlement_items policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='disposition_settlement_items' AND policyname='Settlement items viewable by authenticated users') THEN
    EXECUTE 'DROP POLICY "Settlement items viewable by authenticated users" ON public.disposition_settlement_items';
  END IF;
  EXECUTE 'CREATE POLICY "Settlement items viewable by authenticated users" ON public.disposition_settlement_items FOR SELECT TO authenticated USING (true)';
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='disposition_settlement_items' AND policyname='Authenticated users can manage settlement items') THEN
    EXECUTE 'DROP POLICY "Authenticated users can manage settlement items" ON public.disposition_settlement_items';
  END IF;
  EXECUTE 'CREATE POLICY "Authenticated users can manage settlement items" ON public.disposition_settlement_items FOR ALL TO authenticated USING (true)';
END$$;

-- disposition_units policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='disposition_units' AND policyname='Disposition units viewable by authenticated users') THEN
    EXECUTE 'DROP POLICY "Disposition units viewable by authenticated users" ON public.disposition_units';
  END IF;
  EXECUTE 'CREATE POLICY "Disposition units viewable by authenticated users" ON public.disposition_units FOR SELECT TO authenticated USING (true)';
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='disposition_units' AND policyname='Authenticated users can manage disposition units') THEN
    EXECUTE 'DROP POLICY "Authenticated users can manage disposition units" ON public.disposition_units';
  END IF;
  EXECUTE 'CREATE POLICY "Authenticated users can manage disposition units" ON public.disposition_units FOR ALL TO authenticated USING (true)';
END$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update takedown settlement reference
CREATE OR REPLACE FUNCTION update_takedown_settlement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.takedown_id IS NOT NULL THEN
    UPDATE disposition_takedowns
    SET settlement_id = NEW.id,
        status = 'completed',
        actual_date = NEW.closing_date,
        updated_at = NOW()
    WHERE id = NEW.takedown_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_takedown_settlement ON disposition_settlements;
CREATE TRIGGER trg_update_takedown_settlement
  AFTER INSERT OR UPDATE ON disposition_settlements
  FOR EACH ROW
  EXECUTE FUNCTION update_takedown_settlement();

-- Auto-calculate net to seller
CREATE OR REPLACE FUNCTION calculate_settlement_net()
RETURNS TRIGGER AS $$
BEGIN
  NEW.net_to_seller := COALESCE(NEW.gross_sale_price, 0) + COALESCE(NEW.total_seller_credits, 0) - COALESCE(NEW.total_seller_debits, 0);
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calculate_settlement_net ON disposition_settlements;
CREATE TRIGGER trg_calculate_settlement_net
  BEFORE INSERT OR UPDATE ON disposition_settlements
  FOR EACH ROW
  EXECUTE FUNCTION calculate_settlement_net();

-- Update settlement totals when items change
CREATE OR REPLACE FUNCTION update_settlement_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_settlement_id UUID;
  v_seller_credits DECIMAL(15,2);
  v_seller_debits DECIMAL(15,2);
  v_buyer_credits DECIMAL(15,2);
  v_buyer_debits DECIMAL(15,2);
BEGIN
  v_settlement_id := COALESCE(NEW.settlement_id, OLD.settlement_id);

  SELECT
    COALESCE(SUM(CASE WHEN item_type = 'seller_credit' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN item_type = 'seller_debit' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN item_type = 'buyer_credit' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN item_type = 'buyer_debit' THEN amount ELSE 0 END), 0)
  INTO v_seller_credits, v_seller_debits, v_buyer_credits, v_buyer_debits
  FROM disposition_settlement_items
  WHERE settlement_id = v_settlement_id;

  UPDATE disposition_settlements
  SET total_seller_credits = v_seller_credits,
      total_seller_debits = v_seller_debits,
      total_buyer_credits = v_buyer_credits,
      total_buyer_debits = v_buyer_debits,
      updated_at = NOW()
  WHERE id = v_settlement_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_settlement_totals ON disposition_settlement_items;
CREATE TRIGGER trg_update_settlement_totals
  AFTER INSERT OR UPDATE OR DELETE ON disposition_settlement_items
  FOR EACH ROW
  EXECUTE FUNCTION update_settlement_totals();

-- Updated_at triggers
CREATE TRIGGER update_disposition_contracts_updated_at BEFORE UPDATE ON disposition_contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disposition_takedowns_updated_at BEFORE UPDATE ON disposition_takedowns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disposition_units_updated_at BEFORE UPDATE ON disposition_units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
