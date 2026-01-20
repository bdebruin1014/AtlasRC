-- Atlas Extended Schema Migration
-- Add tables for new features: Accounting, Activity Logs, Pipeline Details
-- Created: 2026-01-20

-- ============================================================================
-- USER PROFILES (extends Supabase auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member', 'viewer')),
  phone TEXT,
  title TEXT,
  department TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================================================
-- CHART OF ACCOUNTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'income', 'expense')),
  parent_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,
  normal_balance TEXT NOT NULL CHECK (normal_balance IN ('debit', 'credit')),
  current_balance DECIMAL(14,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_accounts_parent ON accounts(parent_account_id);
CREATE INDEX IF NOT EXISTS idx_accounts_number ON accounts(account_number);

-- ============================================================================
-- ACTIVITY LOGS (Audit trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'view', 'login', 'logout', 'export', 'import')),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('opportunity', 'project', 'transaction', 'entity', 'contact', 'document', 'user', 'settings')),
  resource_id TEXT NOT NULL,
  resource_name TEXT NOT NULL,
  details TEXT,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource ON activity_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp DESC);

-- ============================================================================
-- OPPORTUNITY ACTIVITIES (Notes, calls, tasks for opportunities)
-- ============================================================================
CREATE TABLE IF NOT EXISTS opportunity_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('note', 'call', 'email', 'meeting', 'task', 'stage_change')),
  title TEXT,
  description TEXT,
  outcome TEXT,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opportunity_activities_opp ON opportunity_activities(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_activities_user ON opportunity_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_activities_type ON opportunity_activities(activity_type);

-- ============================================================================
-- OPPORTUNITY COMPARABLES (Comp sales for valuation)
-- ============================================================================
CREATE TABLE IF NOT EXISTS opportunity_comparables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  city TEXT,
  state TEXT DEFAULT 'SC',
  comp_type TEXT CHECK (comp_type IN ('lot-sale', 'finished-lot', 'land-sale')),
  acres DECIMAL(10,2),
  sale_price DECIMAL(12,2),
  price_per_acre DECIMAL(12,2),
  sale_date DATE,
  potential_lots INTEGER,
  price_per_lot DECIMAL(12,2),
  notes TEXT,
  distance DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comparables_opportunity ON opportunity_comparables(opportunity_id);

-- ============================================================================
-- OPPORTUNITY CONTRACTS (Purchase agreements, amendments)
-- ============================================================================
CREATE TABLE IF NOT EXISTS opportunity_contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'signed', 'expired', 'terminated')),
  purchase_price DECIMAL(12,2),
  earnest_money DECIMAL(12,2),
  dd_period INTEGER,
  closing_date DATE,
  special_terms TEXT,
  created_date DATE,
  sent_date DATE,
  signed_date DATE,
  document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contracts_opportunity ON opportunity_contracts(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON opportunity_contracts(status);

-- ============================================================================
-- OPPORTUNITY FEASIBILITY ITEMS (Due diligence checklist)
-- ============================================================================
CREATE TABLE IF NOT EXISTS opportunity_feasibility_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'complete')),
  due_date DATE,
  completed_date DATE,
  cost DECIMAL(12,2) DEFAULT 0,
  vendor TEXT,
  notes TEXT,
  documents TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feasibility_opportunity ON opportunity_feasibility_items(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_feasibility_status ON opportunity_feasibility_items(status);

-- ============================================================================
-- OPPORTUNITY TIMELINE MILESTONES
-- ============================================================================
CREATE TABLE IF NOT EXISTS opportunity_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  milestone_type TEXT CHECK (milestone_type IN ('contract', 'feasibility', 'financing', 'closing', 'custom')),
  target_date DATE NOT NULL,
  completed_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'complete', 'overdue')),
  description TEXT,
  is_critical BOOLEAN DEFAULT false,
  reminder_days INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_milestones_opportunity ON opportunity_milestones(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_milestones_date ON opportunity_milestones(target_date);

-- ============================================================================
-- VENDORS (Extended contacts for accounting)
-- ============================================================================
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  tax_id TEXT,
  payment_terms TEXT,
  vendor_type TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendors_name ON vendors(name);
CREATE INDEX IF NOT EXISTS idx_vendors_type ON vendors(vendor_type);

-- ============================================================================
-- BILLS (Payables)
-- ============================================================================
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  bill_number TEXT,
  bill_date DATE NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'approved', 'paid', 'void')),
  subtotal DECIMAL(12,2),
  tax DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2),
  paid_amount DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bills_entity ON bills(entity_id);
CREATE INDEX IF NOT EXISTS idx_bills_vendor ON bills(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);

-- ============================================================================
-- BILL LINE ITEMS
-- ============================================================================
CREATE TABLE IF NOT EXISTS bill_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  description TEXT,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(12,2),
  amount DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bill_lines_bill ON bill_line_items(bill_id);

-- ============================================================================
-- ENTITY MEMBERS (Ownership/investors)
-- ============================================================================
CREATE TABLE IF NOT EXISTS entity_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  member_name TEXT NOT NULL,
  ownership_percentage DECIMAL(5,2),
  capital_account_balance DECIMAL(14,2) DEFAULT 0,
  member_type TEXT CHECK (member_type IN ('managing', 'limited', 'investor')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  joined_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entity_members_entity ON entity_members(entity_id);

-- ============================================================================
-- CAPITAL CONTRIBUTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS capital_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES entity_members(id) ON DELETE CASCADE,
  contribution_date DATE NOT NULL,
  amount DECIMAL(14,2) NOT NULL,
  contribution_type TEXT CHECK (contribution_type IN ('cash', 'property', 'services')),
  description TEXT,
  reference_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contributions_entity ON capital_contributions(entity_id);
CREATE INDEX IF NOT EXISTS idx_contributions_member ON capital_contributions(member_id);

-- ============================================================================
-- DISTRIBUTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS distributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES entity_members(id) ON DELETE CASCADE,
  distribution_date DATE NOT NULL,
  amount DECIMAL(14,2) NOT NULL,
  distribution_type TEXT CHECK (distribution_type IN ('profit', 'return_of_capital', 'guaranteed_payment')),
  description TEXT,
  reference_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_distributions_entity ON distributions(entity_id);
CREATE INDEX IF NOT EXISTS idx_distributions_member ON distributions(member_id);

-- ============================================================================
-- DOCUMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  document_type TEXT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_entity ON documents(entity_id);
CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_opportunity ON documents(opportunity_id);

-- ============================================================================
-- DOCUMENT ACCESS LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_access_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('view', 'download', 'share')),
  ip_address TEXT,
  accessed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doc_access_document ON document_access_log(document_id);

-- ============================================================================
-- ROW LEVEL SECURITY FOR NEW TABLES
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_comparables ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_feasibility_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE capital_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_log ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (allow authenticated users full access)
CREATE POLICY "profiles_all" ON profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "accounts_all" ON accounts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "activity_logs_all" ON activity_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "opportunity_activities_all" ON opportunity_activities FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "opportunity_comparables_all" ON opportunity_comparables FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "opportunity_contracts_all" ON opportunity_contracts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "opportunity_feasibility_items_all" ON opportunity_feasibility_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "opportunity_milestones_all" ON opportunity_milestones FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "vendors_all" ON vendors FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "bills_all" ON bills FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "bill_line_items_all" ON bill_line_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "entity_members_all" ON entity_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "capital_contributions_all" ON capital_contributions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "distributions_all" ON distributions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "documents_all" ON documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "document_access_log_all" ON document_access_log FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunity_contracts_updated_at BEFORE UPDATE ON opportunity_contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunity_feasibility_updated_at BEFORE UPDATE ON opportunity_feasibility_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunity_milestones_updated_at BEFORE UPDATE ON opportunity_milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entity_members_updated_at BEFORE UPDATE ON entity_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PROFILE AUTO-CREATION ON USER SIGNUP
-- ============================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- ADD ADDITIONAL COLUMNS TO OPPORTUNITIES TABLE
-- ============================================================================
ALTER TABLE opportunities
  ADD COLUMN IF NOT EXISTS asking_price DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS next_follow_up DATE,
  ADD COLUMN IF NOT EXISTS stage_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stage_history JSONB DEFAULT '[]';

-- Update stage check constraint
ALTER TABLE opportunities DROP CONSTRAINT IF EXISTS opportunities_stage_check;
ALTER TABLE opportunities ADD CONSTRAINT opportunities_stage_check
  CHECK (stage IN ('lead', 'qualified', 'analysis', 'loi', 'due_diligence', 'contract', 'closed_won', 'closed_lost', 'Prospecting', 'Contacted', 'Qualified', 'Negotiating', 'Under Contract'));
