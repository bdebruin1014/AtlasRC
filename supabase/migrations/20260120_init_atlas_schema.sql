-- Atlas Real Estate Development Database Schema
-- Created: 2026-01-20

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENTITIES (Your company structure: Olive Brynn -> VanRock -> Projects)
-- ============================================================================
CREATE TABLE entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('holding', 'operating', 'project')),
  parent_entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  tax_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Entity indexes
CREATE INDEX idx_entities_type ON entities(type);
CREATE INDEX idx_entities_parent ON entities(parent_entity_id);

-- ============================================================================
-- OPPORTUNITIES (Your wholesale pipeline)
-- ============================================================================
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_number TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  city TEXT DEFAULT 'Greenville',
  state TEXT DEFAULT 'SC',
  zip_code TEXT,
  stage TEXT DEFAULT 'Prospecting' CHECK (
    stage IN ('Prospecting', 'Contacted', 'Qualified', 'Negotiating', 'Under Contract')
  ),
  property_type TEXT CHECK (property_type IN ('vacant-lot', 'flip-property', 'other')),
  assigned_to TEXT,
  estimated_value DECIMAL(12,2),
  assignment_fee DECIMAL(12,2),
  seller_name TEXT,
  seller_phone TEXT,
  seller_email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Opportunity indexes
CREATE INDEX idx_opportunities_stage ON opportunities(stage);
CREATE INDEX idx_opportunities_assigned_to ON opportunities(assigned_to);
CREATE INDEX idx_opportunities_created_at ON opportunities(created_at DESC);

-- ============================================================================
-- PROJECTS (Active developments)
-- ============================================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  address TEXT,
  status TEXT DEFAULT 'active' CHECK (
    status IN ('active', 'completed', 'on-hold', 'cancelled')
  ),
  project_type TEXT CHECK (
    project_type IN ('lot-development', 'spec-build', 'fix-flip', 'build-to-rent')
  ),
  start_date DATE,
  target_completion_date DATE,
  actual_completion_date DATE,
  budget DECIMAL(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project indexes
CREATE INDEX idx_projects_entity_id ON projects(entity_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- ============================================================================
-- CONTACTS (Sellers, buyers, contractors, etc.)
-- ============================================================================
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  email TEXT,
  phone TEXT,
  contact_type TEXT CHECK (
    contact_type IN ('seller', 'buyer', 'contractor', 'vendor', 'investor', 'other')
  ),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact indexes
CREATE INDEX idx_contacts_type ON contacts(contact_type);
CREATE INDEX idx_contacts_email ON contacts(email);

-- ============================================================================
-- TRANSACTIONS (Financial records)
-- ============================================================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  transaction_date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense')),
  category TEXT,
  vendor_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transaction indexes
CREATE INDEX idx_transactions_entity_id ON transactions(entity_id);
CREATE INDEX idx_transactions_project_id ON transactions(project_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- For now: Allow authenticated users to do everything
-- (We'll refine permissions later for team members vs. admin)

CREATE POLICY "Allow authenticated users full access to entities"
  ON entities FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to opportunities"
  ON opportunities FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to projects"
  ON projects FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to contacts"
  ON contacts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to transactions"
  ON transactions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS & TRIGGERS (Auto-update timestamps)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_entities_updated_at BEFORE UPDATE ON entities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
