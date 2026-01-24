-- Migration: Enhanced global contacts with flexible schema

-- Add new columns to contacts table if they don't exist
DO $$
BEGIN
  -- Category field for filtering
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'category') THEN
    ALTER TABLE contacts ADD COLUMN category VARCHAR(50);
  END IF;

  -- Extended profile data
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'profile_data') THEN
    ALTER TABLE contacts ADD COLUMN profile_data JSONB DEFAULT '{}';
  END IF;

  -- Tags for flexible categorization
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'tags') THEN
    ALTER TABLE contacts ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;

  -- License/certification info
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'license_number') THEN
    ALTER TABLE contacts ADD COLUMN license_number VARCHAR(100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'license_state') THEN
    ALTER TABLE contacts ADD COLUMN license_state VARCHAR(10);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'insurance_expiry') THEN
    ALTER TABLE contacts ADD COLUMN insurance_expiry DATE;
  END IF;

  -- Website
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'website') THEN
    ALTER TABLE contacts ADD COLUMN website VARCHAR(300);
  END IF;

  -- Secondary contact
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'secondary_phone') THEN
    ALTER TABLE contacts ADD COLUMN secondary_phone VARCHAR(50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'secondary_email') THEN
    ALTER TABLE contacts ADD COLUMN secondary_email VARCHAR(200);
  END IF;
END $$;

-- Create index on category
CREATE INDEX IF NOT EXISTS idx_contacts_category ON contacts(category);
CREATE INDEX IF NOT EXISTS idx_contacts_tags ON contacts USING gin(tags);

-- Purchase contracts table
CREATE TABLE IF NOT EXISTS purchase_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),

  -- Contract details
  contract_date DATE,
  effective_date DATE,
  closing_date DATE,
  expiration_date DATE,

  -- Parties
  buyer_name VARCHAR(200),
  buyer_entity VARCHAR(200),
  seller_name VARCHAR(200),
  seller_entity VARCHAR(200),

  -- Financial
  purchase_price DECIMAL(15,2),
  earnest_money DECIMAL(15,2),
  earnest_money_due_date DATE,

  -- Terms
  financing_type VARCHAR(50),
  inspection_period_days INTEGER,
  inspection_deadline DATE,
  due_diligence_deadline DATE,

  -- Contingencies
  contingencies JSONB DEFAULT '[]',

  -- Documents
  document_url TEXT,
  parsed_data JSONB DEFAULT '{}',
  parsing_status VARCHAR(50) DEFAULT 'pending',

  -- Status
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'executed', 'expired', 'terminated')),
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_purchase_contracts_project ON purchase_contracts(project_id);

ALTER TABLE purchase_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view purchase contracts" ON purchase_contracts
  FOR SELECT USING (project_id IN (
    SELECT id FROM projects WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can manage purchase contracts" ON purchase_contracts
  FOR ALL USING (project_id IN (
    SELECT id FROM projects WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  ));
