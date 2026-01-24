-- ============================================
-- BIDS MODULE
-- Bid tracking for contractor and vendor proposals
-- ============================================

-- bids table
CREATE TABLE IF NOT EXISTS bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  -- Bid Info
  bid_type TEXT NOT NULL, -- general_contractor, subcontractor, supplier, professional_services
  scope_category TEXT NOT NULL, -- foundation, framing, roofing, plumbing, electrical, hvac, etc.

  -- Bidder
  bidder_id UUID REFERENCES contacts(id),
  bidder_name TEXT NOT NULL,
  bidder_contact_name TEXT,

  -- Amounts
  bid_amount DECIMAL(12,2) NOT NULL,
  alternate_amount DECIMAL(12,2),

  -- Details
  scope_description TEXT,
  inclusions TEXT,
  exclusions TEXT,
  qualifications TEXT,

  -- Dates
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,

  -- Status
  status TEXT DEFAULT 'submitted', -- submitted, under_review, approved, rejected, expired

  -- Evaluation
  evaluated_by UUID REFERENCES auth.users(id),
  evaluation_notes TEXT,
  score INTEGER, -- 1-100

  -- Award
  awarded BOOLEAN DEFAULT false,
  awarded_date DATE,
  contract_id UUID,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- bid_documents table
CREATE TABLE IF NOT EXISTS bid_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bid_id UUID REFERENCES bids(id) ON DELETE CASCADE,

  document_type TEXT, -- proposal, breakdown, insurance, license, bond, reference, other
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,

  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bids_project ON bids(project_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);
CREATE INDEX IF NOT EXISTS idx_bids_scope ON bids(scope_category);
CREATE INDEX IF NOT EXISTS idx_bids_bidder ON bids(bidder_name);
CREATE INDEX IF NOT EXISTS idx_bids_awarded ON bids(awarded);
CREATE INDEX IF NOT EXISTS idx_bid_documents_bid ON bid_documents(bid_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_bid_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_bid_updated_at
  BEFORE UPDATE ON bids
  FOR EACH ROW
  EXECUTE FUNCTION update_bid_updated_at();
