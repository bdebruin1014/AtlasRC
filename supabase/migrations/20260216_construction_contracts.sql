-- =====================================================
-- Construction Contracts Table
-- Stores assembled contract packages for construction houses
-- =====================================================

-- Create the construction_contracts table
CREATE TABLE IF NOT EXISTS construction_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Auto-generated contract number (e.g., CC-2026-0001)
  contract_number TEXT UNIQUE,

  -- Foreign keys
  house_id UUID NOT NULL REFERENCES construction_houses(id) ON DELETE CASCADE,
  buyer_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  plan_id UUID REFERENCES floor_plans(id) ON DELETE SET NULL,
  upgrade_package_id UUID REFERENCES upgrade_packages(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

  -- Contract status workflow
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'generated', 'sent', 'viewed', 'signed', 'countersigned', 'executed', 'cancelled', 'expired')),

  -- Pricing
  base_price NUMERIC(12,2),
  upgrade_total NUMERIC(12,2) DEFAULT 0,
  lot_premium NUMERIC(12,2) DEFAULT 0,
  total_contract_price NUMERIC(12,2),

  -- 5-Draw schedule JSONB
  -- Array of: { draw: 1, milestone: "Pre-Construction", pct: 10, amount: 35000.00, due_description: "Upon contract execution" }
  draw_schedule JSONB DEFAULT '[]'::jsonb,

  -- Lot condition report JSONB
  -- { lot_number: "14", subdivision: "Magnolia Ridge", lot_size_sqft: 12500, topography: "level", ... }
  lot_condition_report JSONB DEFAULT '{}'::jsonb,

  -- Budget snapshot JSONB (frozen at contract generation time)
  -- Array of budget items with category, description, amount
  budget_snapshot JSONB DEFAULT '[]'::jsonb,

  -- Selections snapshot JSONB (frozen at contract generation time)
  -- { upgrades: [...], standard_selections: [...], allowances: [...] }
  selections_snapshot JSONB DEFAULT '{}'::jsonb,

  -- Terms & conditions
  terms_and_conditions TEXT,
  warranty_terms TEXT,
  special_provisions TEXT,
  contingencies TEXT,

  -- Document references (URLs to generated PDFs, uploaded docs, etc.)
  contract_pdf_url TEXT,
  exhibit_a_url TEXT,
  exhibit_b_url TEXT,
  lot_survey_url TEXT,
  site_plan_url TEXT,
  additional_documents JSONB DEFAULT '[]'::jsonb,

  -- DocuSeal e-signature integration
  docuseal_submission_id TEXT,
  docuseal_template_id TEXT,

  -- Signature timestamps
  buyer_signed_at TIMESTAMPTZ,
  buyer_signer_name TEXT,
  buyer_signer_email TEXT,
  builder_signed_at TIMESTAMPTZ,
  builder_signer_name TEXT,
  builder_signer_email TEXT,

  -- Generation tracking
  generated_at TIMESTAMPTZ,
  generated_by UUID REFERENCES auth.users(id),
  sent_at TIMESTAMPTZ,
  sent_by UUID REFERENCES auth.users(id),
  executed_at TIMESTAMPTZ,

  -- Cancellation
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES auth.users(id),
  cancellation_reason TEXT,

  -- Expiration
  expires_at TIMESTAMPTZ,

  -- Notes / internal
  internal_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- Contract number auto-generation trigger
-- Format: CC-YYYY-NNNN (e.g., CC-2026-0001)
-- =====================================================

CREATE SEQUENCE IF NOT EXISTS construction_contract_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_contract_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT;
  seq_part TEXT;
BEGIN
  IF NEW.contract_number IS NULL THEN
    year_part := to_char(now(), 'YYYY');
    seq_part := lpad(nextval('construction_contract_number_seq')::text, 4, '0');
    NEW.contract_number := 'CC-' || year_part || '-' || seq_part;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_contract_number
  BEFORE INSERT ON construction_contracts
  FOR EACH ROW
  EXECUTE FUNCTION generate_contract_number();

-- =====================================================
-- Auto-update updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_construction_contracts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_construction_contracts_updated_at
  BEFORE UPDATE ON construction_contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_construction_contracts_updated_at();

-- =====================================================
-- Indexes
-- =====================================================

CREATE INDEX idx_construction_contracts_house_id ON construction_contracts(house_id);
CREATE INDEX idx_construction_contracts_status ON construction_contracts(status);
CREATE INDEX idx_construction_contracts_buyer ON construction_contracts(buyer_contact_id);
CREATE INDEX idx_construction_contracts_project ON construction_contracts(project_id);
CREATE INDEX idx_construction_contracts_contract_number ON construction_contracts(contract_number);
CREATE INDEX idx_construction_contracts_docuseal ON construction_contracts(docuseal_submission_id);

-- =====================================================
-- Row Level Security
-- =====================================================

ALTER TABLE construction_contracts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (adjust as needed for your RLS model)
CREATE POLICY "Authenticated users can view construction contracts"
  ON construction_contracts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert construction contracts"
  ON construction_contracts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update construction contracts"
  ON construction_contracts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete construction contracts"
  ON construction_contracts FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE construction_contracts IS 'Assembled contract packages for construction house sales';
COMMENT ON COLUMN construction_contracts.draw_schedule IS 'JSONB array of 5 draw milestones: [{draw, milestone, pct, amount, due_description}]';
COMMENT ON COLUMN construction_contracts.lot_condition_report IS 'JSONB snapshot of lot conditions at contract time';
COMMENT ON COLUMN construction_contracts.budget_snapshot IS 'JSONB snapshot of construction budget items frozen at generation';
COMMENT ON COLUMN construction_contracts.selections_snapshot IS 'JSONB snapshot of buyer selections/upgrades frozen at generation';
COMMENT ON COLUMN construction_contracts.docuseal_submission_id IS 'DocuSeal submission ID for e-signature tracking';
