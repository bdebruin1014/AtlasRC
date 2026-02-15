-- ============================================================================
-- CONSTRUCTION CONTRACTS TABLE
-- Tracks generated contracts per house for Red Cedar Homes
-- ============================================================================

CREATE TABLE IF NOT EXISTS construction_contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  house_id UUID NOT NULL REFERENCES construction_houses(id) ON DELETE CASCADE,
  contract_number TEXT,  -- auto: RCH-2026-001
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'sent', 'signed', 'amended', 'cancelled')),

  -- Contract terms (snapshot at time of generation)
  contract_date DATE,
  estimated_start_date DATE,
  estimated_completion_date DATE,
  build_duration_days INTEGER DEFAULT 180,
  contract_price DECIMAL(12,2),

  -- 5-draw schedule
  draw_schedule JSONB DEFAULT '[]'::jsonb,
  -- Format: [{"draw":1,"milestone":"Pre-Construction","pct":10,"amount":25000},...]

  -- Warranty
  warranty_period_months INTEGER DEFAULT 12,
  structural_warranty_years INTEGER DEFAULT 0,

  -- Allowances
  allowances JSONB DEFAULT '{}'::jsonb,
  -- Format: {"lighting":2500,"appliance":3000,"landscaping":5000,"flooring":0}

  -- Terms
  change_order_policy TEXT,
  dispute_resolution TEXT,
  jurisdiction TEXT DEFAULT 'Greenville County, South Carolina',
  builders_risk TEXT DEFAULT 'Included by Builder',
  permit_responsibility TEXT DEFAULT 'Builder obtains all permits',

  -- Lot condition report (snapshot)
  lot_condition_report JSONB DEFAULT '{}'::jsonb,
  lot_condition_photos TEXT[] DEFAULT '{}',
  site_cost_adjustment DECIMAL(12,2) DEFAULT 0,
  site_cost_adjustment_reason TEXT,

  -- Budget snapshot (frozen at contract time)
  budget_snapshot JSONB DEFAULT '[]'::jsonb,
  -- Full line-item budget as of contract generation

  -- Selections snapshot
  selections_snapshot JSONB DEFAULT '{}'::jsonb,

  -- Document references
  generated_pdf_url TEXT,
  generated_docx_url TEXT,
  docuseal_submission_id TEXT,
  signed_document_url TEXT,

  -- Signatures
  builder_signed_at TIMESTAMPTZ,
  owner_signed_at TIMESTAMPTZ,

  -- Meta
  generated_by UUID,
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cc_house ON construction_contracts(house_id);
CREATE INDEX IF NOT EXISTS idx_cc_status ON construction_contracts(status);

ALTER TABLE construction_contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage construction_contracts"
  ON construction_contracts FOR ALL TO authenticated USING (true) WITH CHECK (true);
GRANT ALL ON construction_contracts TO authenticated;

-- Auto-generate contract number
CREATE OR REPLACE FUNCTION generate_contract_number()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
  year_str TEXT;
BEGIN
  year_str := EXTRACT(YEAR FROM COALESCE(NEW.contract_date, NOW()))::TEXT;
  SELECT COALESCE(MAX(
    CAST(SPLIT_PART(contract_number, '-', 3) AS INTEGER)
  ), 0) + 1 INTO next_num
  FROM construction_contracts
  WHERE contract_number LIKE 'RCH-' || year_str || '-%';

  NEW.contract_number := 'RCH-' || year_str || '-' || LPAD(next_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_contract_number ON construction_contracts;
CREATE TRIGGER trigger_contract_number
  BEFORE INSERT ON construction_contracts
  FOR EACH ROW
  WHEN (NEW.contract_number IS NULL)
  EXECUTE FUNCTION generate_contract_number();

-- updated_at trigger (reuse existing function if available)
CREATE OR REPLACE FUNCTION update_construction_contracts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_construction_contracts_updated_at ON construction_contracts;
CREATE TRIGGER update_construction_contracts_updated_at
  BEFORE UPDATE ON construction_contracts
  FOR EACH ROW EXECUTE FUNCTION update_construction_contracts_updated_at();
