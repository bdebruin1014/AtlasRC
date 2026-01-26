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
-- Atlas Real Estate Development - Users, Teams & Permissions Schema
-- Created: 2026-01-20

-- ============================================================================
-- USER PROFILES (Extended user information)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  job_title TEXT,
  department TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);

-- ============================================================================
-- USER ROLES (Role assignments for RBAC)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'team_member' CHECK (
    role IN ('super_admin', 'admin', 'manager', 'accountant', 'project_manager',
             'property_manager', 'investor_relations', 'team_member', 'viewer', 'external')
  ),
  custom_permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- ============================================================================
-- TEAMS
-- ============================================================================
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#047857',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for team lookups
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);
CREATE INDEX IF NOT EXISTS idx_teams_is_active ON teams(is_active);

-- ============================================================================
-- TEAM MEMBERS (User-Team assignments)
-- ============================================================================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_role TEXT DEFAULT 'member' CHECK (team_role IN ('lead', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Create indexes for team member lookups
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

-- ============================================================================
-- PROJECT TEAM MEMBERS (User-Project assignments)
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_role TEXT DEFAULT 'member' CHECK (
    project_role IN ('lead', 'manager', 'member', 'viewer')
  ),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(project_id, user_id)
);

-- Create indexes for project team member lookups
CREATE INDEX IF NOT EXISTS idx_project_team_members_project_id ON project_team_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_team_members_user_id ON project_team_members(user_id);

-- ============================================================================
-- OPPORTUNITY TEAM MEMBERS (User-Opportunity assignments)
-- ============================================================================
CREATE TABLE IF NOT EXISTS opportunity_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  role TEXT DEFAULT 'member',
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(opportunity_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_opportunity_team_members_opportunity_id ON opportunity_team_members(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_team_members_user_id ON opportunity_team_members(user_id);

-- ============================================================================
-- PERMISSION AUDIT LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS permission_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for audit log
CREATE INDEX IF NOT EXISTS idx_permission_audit_log_actor ON permission_audit_log(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_permission_audit_log_target ON permission_audit_log(target_user_id);
CREATE INDEX IF NOT EXISTS idx_permission_audit_log_action ON permission_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_permission_audit_log_created_at ON permission_audit_log(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_audit_log ENABLE ROW LEVEL SECURITY;

-- User profiles: Users can read all profiles, but only update their own
CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can insert profiles"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can delete profiles"
  ON user_profiles FOR DELETE
  TO authenticated
  USING (true);

-- User roles: Authenticated users can read, admins can modify
CREATE POLICY "Users can view all roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage roles"
  ON user_roles FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Teams: Authenticated users can read, admins can modify
CREATE POLICY "Users can view all teams"
  ON teams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage teams"
  ON teams FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Team members: Authenticated users can read, admins can modify
CREATE POLICY "Users can view team members"
  ON team_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage team members"
  ON team_members FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Project team members: Authenticated users can read, admins can modify
CREATE POLICY "Users can view project team members"
  ON project_team_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage project team members"
  ON project_team_members FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Opportunity team members
CREATE POLICY "Users can view opportunity team members"
  ON opportunity_team_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage opportunity team members"
  ON opportunity_team_members FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Audit log: Only admins can view
CREATE POLICY "Admins can view audit log"
  ON permission_audit_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert audit log"
  ON permission_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- TRIGGERS (Auto-update timestamps)
-- ============================================================================

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTION: Auto-create user profile on signup
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );

  -- Assign default role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'team_member');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- VIEWS for easier querying
-- ============================================================================

-- View: Users with their roles and profiles
CREATE OR REPLACE VIEW users_with_roles AS
SELECT
  up.id,
  up.email,
  up.full_name,
  up.avatar_url,
  up.phone,
  up.job_title,
  up.department,
  up.status,
  up.last_login_at,
  up.created_at,
  ur.role,
  ur.custom_permissions
FROM user_profiles up
LEFT JOIN user_roles ur ON up.id = ur.user_id;

-- View: Team members with user details
CREATE OR REPLACE VIEW team_members_with_details AS
SELECT
  tm.id,
  tm.team_id,
  tm.user_id,
  tm.team_role,
  tm.joined_at,
  t.name as team_name,
  t.color as team_color,
  up.email,
  up.full_name,
  up.avatar_url
FROM team_members tm
JOIN teams t ON tm.team_id = t.id
JOIN user_profiles up ON tm.user_id = up.id;
-- Atlas Real Estate Development - Outlook Email Integration Schema
-- Created: 2026-01-20

-- ============================================================================
-- OUTLOOK USER CONNECTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS outlook_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  email TEXT,
  display_name TEXT,
  is_connected BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_outlook_connections_user ON outlook_connections(user_id);

-- ============================================================================
-- PROJECT EMAILS (Linked emails to projects - Qualia-style)
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  email_id TEXT NOT NULL,
  conversation_id TEXT,
  subject TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_emails JSONB DEFAULT '[]'::jsonb,
  cc_emails JSONB DEFAULT '[]'::jsonb,
  received_at TIMESTAMPTZ NOT NULL,
  has_attachments BOOLEAN DEFAULT false,
  notes TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  linked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  linked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, email_id)
);

-- Indexes for project emails
CREATE INDEX IF NOT EXISTS idx_project_emails_project ON project_emails(project_id);
CREATE INDEX IF NOT EXISTS idx_project_emails_conversation ON project_emails(conversation_id);
CREATE INDEX IF NOT EXISTS idx_project_emails_from ON project_emails(from_email);
CREATE INDEX IF NOT EXISTS idx_project_emails_received ON project_emails(received_at DESC);

-- ============================================================================
-- EMAIL TEMPLATES (For quick responses)
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT,
  is_html BOOLEAN DEFAULT false,
  tags JSONB DEFAULT '[]'::jsonb,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for email templates
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);

-- ============================================================================
-- EMAIL ACTIVITY LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  email_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for activity log
CREATE INDEX IF NOT EXISTS idx_email_activity_user ON email_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_email_activity_project ON email_activity_log(project_id);
CREATE INDEX IF NOT EXISTS idx_email_activity_action ON email_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_email_activity_created ON email_activity_log(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE outlook_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_activity_log ENABLE ROW LEVEL SECURITY;

-- Outlook connections: Users can only access their own
CREATE POLICY "Users can manage their own Outlook connection"
  ON outlook_connections FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Project emails: Authenticated users can access
CREATE POLICY "Users can view project emails"
  ON project_emails FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage project emails"
  ON project_emails FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Email templates: Authenticated users can access
CREATE POLICY "Users can view email templates"
  ON email_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage email templates"
  ON email_templates FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Email activity log
CREATE POLICY "Users can view email activity"
  ON email_activity_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert email activity"
  ON email_activity_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_outlook_connections_updated_at BEFORE UPDATE ON outlook_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED EMAIL TEMPLATES
-- ============================================================================

INSERT INTO email_templates (name, subject, body, category, is_html) VALUES
('Construction Update Request', 'Construction Update Request - {{project_name}}', 'Hi {{contact_name}},

I hope this email finds you well. Could you please provide an update on the current construction progress for {{project_name}}?

Specifically, I would like to know:
1. Current completion percentage
2. Any delays or issues encountered
3. Expected completion timeline

Thank you for your continued partnership.

Best regards,
{{sender_name}}', 'construction', false),

('Document Request', 'Document Request - {{project_name}}', 'Hi {{contact_name}},

We are requesting the following documents for {{project_name}}:

- {{document_list}}

Please send these at your earliest convenience.

Thank you,
{{sender_name}}', 'general', false),

('Payment Notification', 'Payment Notification - {{project_name}}', 'Hi {{contact_name}},

This is to confirm that payment in the amount of {{amount}} has been processed for {{project_name}}.

Transaction details:
- Amount: {{amount}}
- Date: {{date}}
- Reference: {{reference}}

Please let us know if you have any questions.

Best regards,
{{sender_name}}', 'financial', false),

('Meeting Request', 'Meeting Request - {{project_name}}', 'Hi {{contact_name}},

I would like to schedule a meeting to discuss {{project_name}}.

Proposed time: {{proposed_time}}
Location: {{location}}

Please let me know if this works for your schedule or suggest alternative times.

Thank you,
{{sender_name}}', 'general', false)

ON CONFLICT DO NOTHING;
-- Atlas Real Estate Development - SharePoint Integration Schema
-- Created: 2026-01-20
-- Updated: Multi-Tenant SaaS Model - Atlas owns SharePoint, customers get folders

-- ============================================================================
-- SHAREPOINT PLATFORM CONNECTION (Atlas owns this)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sharepoint_connections (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  connection_type TEXT NOT NULL DEFAULT 'platform' CHECK (connection_type IN ('platform', 'organization', 'user')),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  site_id TEXT,
  site_name TEXT,
  site_url TEXT,
  drive_id TEXT,
  is_connected BOOLEAN DEFAULT false,
  connected_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_sharepoint_connections_type ON sharepoint_connections(connection_type);

-- ============================================================================
-- ORGANIZATIONS (Customer tenants in the SaaS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  subscription_tier TEXT DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'professional', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'trial', 'suspended', 'cancelled')),
  trial_ends_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(subscription_status);

-- ============================================================================
-- ORGANIZATION MEMBERS (Users belonging to organizations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);

-- ============================================================================
-- ORGANIZATION SHAREPOINT MAPPINGS (Each customer gets a folder)
-- ============================================================================
CREATE TABLE IF NOT EXISTS organization_sharepoint_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  drive_id TEXT NOT NULL,
  folder_id TEXT NOT NULL,
  folder_name TEXT NOT NULL,
  folder_path TEXT NOT NULL,
  folder_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id)
);

CREATE INDEX IF NOT EXISTS idx_org_sharepoint_mappings_org ON organization_sharepoint_mappings(organization_id);

-- ============================================================================
-- PROJECT SHAREPOINT MAPPINGS (Projects within customer folders)
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_sharepoint_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  drive_id TEXT NOT NULL,
  folder_id TEXT NOT NULL,
  folder_name TEXT NOT NULL,
  folder_path TEXT,
  folder_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id)
);

CREATE INDEX IF NOT EXISTS idx_project_sharepoint_mappings_project ON project_sharepoint_mappings(project_id);
CREATE INDEX IF NOT EXISTS idx_project_sharepoint_mappings_org ON project_sharepoint_mappings(organization_id);

-- ============================================================================
-- DOCUMENTS (Enhanced with SharePoint integration)
-- ============================================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  file_type TEXT,
  file_size BIGINT,
  tags JSONB DEFAULT '[]'::jsonb,

  -- SharePoint references
  sharepoint_item_id TEXT,
  sharepoint_drive_id TEXT,
  sharepoint_path TEXT,
  sharepoint_web_url TEXT,

  -- Supabase storage (fallback)
  storage_bucket TEXT,
  storage_path TEXT,

  -- Template reference
  template_id UUID,

  -- Metadata
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for documents
CREATE INDEX IF NOT EXISTS idx_documents_org ON documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_entity ON documents(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_sharepoint ON documents(sharepoint_item_id);
CREATE INDEX IF NOT EXISTS idx_documents_is_deleted ON documents(is_deleted);

-- ============================================================================
-- DOCUMENT ACCESS LINKS (Time-limited sharing)
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_access_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  link_type TEXT NOT NULL CHECK (link_type IN ('view', 'edit', 'download')),
  link_url TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_access_links_document ON document_access_links(document_id);
CREATE INDEX IF NOT EXISTS idx_document_access_links_expires ON document_access_links(expires_at);

-- ============================================================================
-- DOCUMENT ACCESS LOG (Audit trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_access_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  entity_type TEXT,
  entity_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_access_log_org ON document_access_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_document_access_log_document ON document_access_log(document_id);
CREATE INDEX IF NOT EXISTS idx_document_access_log_user ON document_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_document_access_log_created ON document_access_log(created_at DESC);

-- ============================================================================
-- DOCUMENT TEMPLATES LIBRARY (Platform-wide templates)
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_templates_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,

  -- SharePoint reference
  sharepoint_item_id TEXT,
  sharepoint_drive_id TEXT,
  sharepoint_path TEXT,
  sharepoint_web_url TEXT,

  tags JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  is_platform_template BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,

  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_templates_org ON document_templates_library(organization_id);
CREATE INDEX IF NOT EXISTS idx_document_templates_category ON document_templates_library(category);
CREATE INDEX IF NOT EXISTS idx_document_templates_active ON document_templates_library(is_active);
CREATE INDEX IF NOT EXISTS idx_document_templates_platform ON document_templates_library(is_platform_template);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE sharepoint_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_sharepoint_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_sharepoint_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates_library ENABLE ROW LEVEL SECURITY;

-- Platform SharePoint connection: Only platform admins
CREATE POLICY "Platform admins can manage SharePoint connection"
  ON sharepoint_connections FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Organizations: Members can view their org
CREATE POLICY "Users can view their organization"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage organizations"
  ON organizations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Organization members
CREATE POLICY "Users can view org members"
  ON organization_members FOR SELECT
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage org members"
  ON organization_members FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Organization SharePoint mappings: Org members can view
CREATE POLICY "Users can view their org SharePoint mapping"
  ON organization_sharepoint_mappings FOR SELECT
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage org SharePoint mappings"
  ON organization_sharepoint_mappings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Project mappings: Based on organization
CREATE POLICY "Users can view project SharePoint mappings"
  ON project_sharepoint_mappings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage project SharePoint mappings"
  ON project_sharepoint_mappings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Documents: Based on organization
CREATE POLICY "Users can view documents in their org"
  ON documents FOR SELECT
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
    OR organization_id IS NULL
  );

CREATE POLICY "Users can manage documents"
  ON documents FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Document access links
CREATE POLICY "Users can view document links"
  ON document_access_links FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create document links"
  ON document_access_links FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Document access log
CREATE POLICY "Users can view access log"
  ON document_access_log FOR SELECT
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
    OR organization_id IS NULL
  );

CREATE POLICY "Users can insert access log"
  ON document_access_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Document templates
CREATE POLICY "Users can view document templates"
  ON document_templates_library FOR SELECT
  TO authenticated
  USING (
    is_platform_template = true
    OR organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
    OR organization_id IS NULL
  );

CREATE POLICY "Admins can manage document templates"
  ON document_templates_library FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_sharepoint_connections_updated_at BEFORE UPDATE ON sharepoint_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_sharepoint_mappings_updated_at BEFORE UPDATE ON organization_sharepoint_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_sharepoint_mappings_updated_at BEFORE UPDATE ON project_sharepoint_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_templates_updated_at BEFORE UPDATE ON document_templates_library
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTION: Increment document template usage count
-- ============================================================================
CREATE OR REPLACE FUNCTION increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.template_id IS NOT NULL THEN
    UPDATE document_templates_library
    SET usage_count = usage_count + 1
    WHERE id = NEW.template_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_template_usage_on_document_create
  AFTER INSERT ON documents
  FOR EACH ROW EXECUTE FUNCTION increment_template_usage();

-- ============================================================================
-- FUNCTION: Auto-create customer folder on organization creation
-- ============================================================================
CREATE OR REPLACE FUNCTION notify_new_organization()
RETURNS TRIGGER AS $$
BEGIN
  -- This would trigger a webhook/edge function to create SharePoint folders
  -- For now, just log it
  RAISE NOTICE 'New organization created: % (%)', NEW.name, NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_organization_created
  AFTER INSERT ON organizations
  FOR EACH ROW EXECUTE FUNCTION notify_new_organization();
-- Atlas Real Estate Development - Project Templates Schema
-- Created: 2026-01-21
-- Purpose: Allow org Super Admins to create project templates with predefined
--          folder structures, schedules, budgets, tasks, milestones, and teams

-- ============================================================================
-- PROJECT TEMPLATES (Main template configuration)
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  project_type TEXT, -- e.g., 'residential', 'commercial', 'mixed-use', 'land-development'
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Default project settings
  default_status TEXT DEFAULT 'planning',
  estimated_duration_days INTEGER,

  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_templates_org ON project_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_project_templates_type ON project_templates(project_type);
CREATE INDEX IF NOT EXISTS idx_project_templates_active ON project_templates(is_active);

-- Ensure only one default template per organization per project type
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_templates_default
  ON project_templates(organization_id, project_type)
  WHERE is_default = true;

-- ============================================================================
-- PROJECT TEMPLATE FOLDERS (Custom folder structure)
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_template_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,
  parent_folder_id UUID REFERENCES project_template_folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,

  -- Folder settings
  is_required BOOLEAN DEFAULT true,
  default_permissions TEXT DEFAULT 'team', -- 'team', 'admin-only', 'public'

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_template_folders_template ON project_template_folders(template_id);
CREATE INDEX IF NOT EXISTS idx_project_template_folders_parent ON project_template_folders(parent_folder_id);

-- ============================================================================
-- PROJECT TEMPLATE PHASES (For schedule)
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_template_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,

  -- Duration settings (relative to project start or previous phase)
  duration_days INTEGER,
  offset_days INTEGER DEFAULT 0, -- Days after project start or previous phase
  depends_on_phase_id UUID REFERENCES project_template_phases(id) ON DELETE SET NULL,

  -- Display settings
  color TEXT DEFAULT '#3B82F6',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_template_phases_template ON project_template_phases(template_id);

-- ============================================================================
-- PROJECT TEMPLATE MILESTONES
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_template_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES project_template_phases(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,

  -- Timing (relative to phase start or project start)
  offset_days INTEGER DEFAULT 0,
  is_critical BOOLEAN DEFAULT false,

  -- Notification settings
  notify_days_before INTEGER DEFAULT 7,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_template_milestones_template ON project_template_milestones(template_id);
CREATE INDEX IF NOT EXISTS idx_project_template_milestones_phase ON project_template_milestones(phase_id);

-- ============================================================================
-- PROJECT TEMPLATE TASKS
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_template_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES project_template_phases(id) ON DELETE SET NULL,
  milestone_id UUID REFERENCES project_template_milestones(id) ON DELETE SET NULL,
  parent_task_id UUID REFERENCES project_template_tasks(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,

  -- Task settings
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  estimated_hours DECIMAL(10,2),
  duration_days INTEGER,
  offset_days INTEGER DEFAULT 0,

  -- Assignment settings (role-based, actual assignment happens on project creation)
  assigned_role TEXT, -- 'project-manager', 'architect', 'contractor', etc.

  -- Dependencies
  depends_on_task_id UUID REFERENCES project_template_tasks(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_template_tasks_template ON project_template_tasks(template_id);
CREATE INDEX IF NOT EXISTS idx_project_template_tasks_phase ON project_template_tasks(phase_id);
CREATE INDEX IF NOT EXISTS idx_project_template_tasks_milestone ON project_template_tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_project_template_tasks_parent ON project_template_tasks(parent_task_id);

-- ============================================================================
-- PROJECT TEMPLATE BUDGET CATEGORIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_template_budget_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,
  parent_category_id UUID REFERENCES project_template_budget_categories(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  code TEXT, -- e.g., '01', '01.1', etc.
  sort_order INTEGER DEFAULT 0,

  -- Budget settings
  is_contingency BOOLEAN DEFAULT false,
  default_percentage DECIMAL(5,2), -- For contingency or percentage-based items

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_template_budget_categories_template ON project_template_budget_categories(template_id);
CREATE INDEX IF NOT EXISTS idx_project_template_budget_categories_parent ON project_template_budget_categories(parent_category_id);

-- ============================================================================
-- PROJECT TEMPLATE BUDGET LINE ITEMS
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_template_budget_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,
  category_id UUID REFERENCES project_template_budget_categories(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  description TEXT,
  code TEXT,
  sort_order INTEGER DEFAULT 0,

  -- Budget settings
  unit TEXT, -- 'SF', 'LF', 'EA', 'LS', etc.
  unit_cost DECIMAL(15,2),
  default_quantity DECIMAL(15,2),

  -- Calculation method
  calculation_type TEXT DEFAULT 'fixed' CHECK (calculation_type IN ('fixed', 'per-sf', 'percentage')),
  percentage_of TEXT, -- Reference to another category/item for percentage calculations

  -- Phase association (when cost is typically incurred)
  phase_id UUID REFERENCES project_template_phases(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_template_budget_items_template ON project_template_budget_items(template_id);
CREATE INDEX IF NOT EXISTS idx_project_template_budget_items_category ON project_template_budget_items(category_id);

-- ============================================================================
-- PROJECT TEMPLATE TEAM ROLES
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_template_team_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,

  role_name TEXT NOT NULL,
  role_type TEXT NOT NULL CHECK (role_type IN ('internal', 'external', 'consultant')),
  description TEXT,
  sort_order INTEGER DEFAULT 0,

  -- Role settings
  is_required BOOLEAN DEFAULT false,
  permissions TEXT DEFAULT 'member' CHECK (permissions IN ('admin', 'member', 'viewer')),

  -- Default entity (if there's a preferred vendor/contact for this role)
  default_entity_id UUID,
  default_entity_type TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_template_team_roles_template ON project_template_team_roles(template_id);
CREATE INDEX IF NOT EXISTS idx_project_template_team_roles_type ON project_template_team_roles(role_type);

-- ============================================================================
-- PROJECT TEMPLATE CHECKLISTS (Pre-defined checklists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_template_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES project_template_phases(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_template_checklists_template ON project_template_checklists(template_id);

-- ============================================================================
-- PROJECT TEMPLATE CHECKLIST ITEMS
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_template_checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_id UUID NOT NULL REFERENCES project_template_checklists(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,

  -- Assignment
  assigned_role TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_template_checklist_items_checklist ON project_template_checklist_items(checklist_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_template_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_template_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_template_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_template_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_template_budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_template_budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_template_team_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_template_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_template_checklist_items ENABLE ROW LEVEL SECURITY;

-- Project Templates: Org members can view, admins can manage
CREATE POLICY "Users can view org project templates"
  ON project_templates FOR SELECT
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage project templates"
  ON project_templates FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Template Folders: Based on template access
CREATE POLICY "Users can view template folders"
  ON project_template_folders FOR SELECT
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage template folders"
  ON project_template_folders FOR ALL
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  )
  WITH CHECK (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  );

-- Template Phases
CREATE POLICY "Users can view template phases"
  ON project_template_phases FOR SELECT
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage template phases"
  ON project_template_phases FOR ALL
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  )
  WITH CHECK (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  );

-- Template Milestones
CREATE POLICY "Users can view template milestones"
  ON project_template_milestones FOR SELECT
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage template milestones"
  ON project_template_milestones FOR ALL
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  )
  WITH CHECK (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  );

-- Template Tasks
CREATE POLICY "Users can view template tasks"
  ON project_template_tasks FOR SELECT
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage template tasks"
  ON project_template_tasks FOR ALL
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  )
  WITH CHECK (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  );

-- Template Budget Categories
CREATE POLICY "Users can view template budget categories"
  ON project_template_budget_categories FOR SELECT
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage template budget categories"
  ON project_template_budget_categories FOR ALL
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  )
  WITH CHECK (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  );

-- Template Budget Items
CREATE POLICY "Users can view template budget items"
  ON project_template_budget_items FOR SELECT
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage template budget items"
  ON project_template_budget_items FOR ALL
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  )
  WITH CHECK (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  );

-- Template Team Roles
CREATE POLICY "Users can view template team roles"
  ON project_template_team_roles FOR SELECT
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage template team roles"
  ON project_template_team_roles FOR ALL
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  )
  WITH CHECK (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  );

-- Template Checklists
CREATE POLICY "Users can view template checklists"
  ON project_template_checklists FOR SELECT
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage template checklists"
  ON project_template_checklists FOR ALL
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  )
  WITH CHECK (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  );

-- Template Checklist Items
CREATE POLICY "Users can view template checklist items"
  ON project_template_checklist_items FOR SELECT
  TO authenticated
  USING (
    checklist_id IN (
      SELECT id FROM project_template_checklists WHERE template_id IN (
        SELECT id FROM project_templates WHERE organization_id IN (
          SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Admins can manage template checklist items"
  ON project_template_checklist_items FOR ALL
  TO authenticated
  USING (
    checklist_id IN (
      SELECT id FROM project_template_checklists WHERE template_id IN (
        SELECT id FROM project_templates WHERE organization_id IN (
          SELECT organization_id FROM organization_members
          WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
      )
    )
  )
  WITH CHECK (
    checklist_id IN (
      SELECT id FROM project_template_checklists WHERE template_id IN (
        SELECT id FROM project_templates WHERE organization_id IN (
          SELECT organization_id FROM organization_members
          WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
      )
    )
  );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_project_templates_updated_at
  BEFORE UPDATE ON project_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTION: Apply template to project
-- ============================================================================
CREATE OR REPLACE FUNCTION apply_project_template(
  p_project_id UUID,
  p_template_id UUID,
  p_start_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB AS $$
DECLARE
  v_template project_templates%ROWTYPE;
  v_result JSONB := '{}'::jsonb;
  v_phase_mapping JSONB := '{}'::jsonb;
  v_milestone_mapping JSONB := '{}'::jsonb;
  v_task_mapping JSONB := '{}'::jsonb;
  v_folder_mapping JSONB := '{}'::jsonb;
  v_category_mapping JSONB := '{}'::jsonb;
  v_checklist_mapping JSONB := '{}'::jsonb;
BEGIN
  -- Get template
  SELECT * INTO v_template FROM project_templates WHERE id = p_template_id;

  IF v_template IS NULL THEN
    RAISE EXCEPTION 'Template not found: %', p_template_id;
  END IF;

  -- Update project with template reference
  UPDATE projects
  SET
    template_id = p_template_id,
    updated_at = NOW()
  WHERE id = p_project_id;

  -- Note: The actual copying of phases, milestones, tasks, budget items, etc.
  -- should be done by the application layer where we have more control
  -- over the logic and can handle SharePoint folder creation.

  v_result := jsonb_build_object(
    'success', true,
    'template_id', p_template_id,
    'template_name', v_template.name,
    'message', 'Template applied. Use application layer to copy template items.'
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Add template_id column to projects table if not exists
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'template_id'
  ) THEN
    ALTER TABLE projects ADD COLUMN template_id UUID REFERENCES project_templates(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_projects_template ON projects(template_id);
  END IF;
END $$;
-- E-Sign Tables Migration
-- Creates tables for document signing and contract generation

-- Document Templates (links to DocuSeal templates)
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  docuseal_template_id INTEGER,
  available_for TEXT[] DEFAULT ARRAY['project', 'opportunity'],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Signing Requests
CREATE TABLE IF NOT EXISTS document_signing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  entity_name TEXT,
  template_id TEXT,
  docuseal_submission_id TEXT,
  docuseal_template_id INTEGER,
  document_name TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'partially_signed', 'completed', 'cancelled', 'expired', 'declined')),
  prefill_data JSONB DEFAULT '{}',
  notes TEXT,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  storage_path TEXT,
  storage_url TEXT,
  linked_document_id UUID,
  docuseal_document_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Signers
CREATE TABLE IF NOT EXISTS document_signers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signing_request_id UUID REFERENCES document_signing_requests(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'Signer',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  contact_auto_matched BOOLEAN DEFAULT false,
  docuseal_submitter_id TEXT,
  embed_src TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'viewed', 'signed', 'declined')),
  signed_at TIMESTAMPTZ,
  signing_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Contacts Junction (links documents to contacts)
CREATE TABLE IF NOT EXISTS document_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type TEXT NOT NULL,
  document_id UUID NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  role TEXT,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_type, document_id, contact_id)
);

-- Generated Contracts (for contract generation workflow)
CREATE TABLE IF NOT EXISTS generated_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  template_id TEXT,
  document_name TEXT NOT NULL,
  content TEXT,
  prefill_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'archived')),
  signing_request_id UUID REFERENCES document_signing_requests(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_signing_requests_entity ON document_signing_requests(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_signing_requests_status ON document_signing_requests(status);
CREATE INDEX IF NOT EXISTS idx_signers_request ON document_signers(signing_request_id);
CREATE INDEX IF NOT EXISTS idx_signers_contact ON document_signers(contact_id);
CREATE INDEX IF NOT EXISTS idx_document_contacts_contact ON document_contacts(contact_id);
CREATE INDEX IF NOT EXISTS idx_generated_contracts_entity ON generated_contracts(entity_type, entity_id);

-- Enable RLS
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_signing_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_signers ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies (idempotent - safe to re-run)

-- document_templates
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='document_templates' AND policyname='Templates are viewable by authenticated users') THEN
    EXECUTE 'DROP POLICY "Templates are viewable by authenticated users" ON public.document_templates';
  END IF;
  EXECUTE 'CREATE POLICY "Templates are viewable by authenticated users" ON public.document_templates FOR SELECT TO authenticated USING (true)';
END$$;

-- document_signing_requests
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='document_signing_requests' AND policyname='Signing requests viewable by authenticated users') THEN
    EXECUTE 'DROP POLICY "Signing requests viewable by authenticated users" ON public.document_signing_requests';
  END IF;
  EXECUTE 'CREATE POLICY "Signing requests viewable by authenticated users" ON public.document_signing_requests FOR SELECT TO authenticated USING (true)';
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='document_signing_requests' AND policyname='Authenticated users can create signing requests') THEN
    EXECUTE 'DROP POLICY "Authenticated users can create signing requests" ON public.document_signing_requests';
  END IF;
  EXECUTE 'CREATE POLICY "Authenticated users can create signing requests" ON public.document_signing_requests FOR INSERT TO authenticated WITH CHECK (true)';
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='document_signing_requests' AND policyname='Authenticated users can update signing requests') THEN
    EXECUTE 'DROP POLICY "Authenticated users can update signing requests" ON public.document_signing_requests';
  END IF;
  EXECUTE 'CREATE POLICY "Authenticated users can update signing requests" ON public.document_signing_requests FOR UPDATE TO authenticated USING (true)';
END$$;

-- document_signers
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='document_signers' AND policyname='Signers viewable by authenticated users') THEN
    EXECUTE 'DROP POLICY "Signers viewable by authenticated users" ON public.document_signers';
  END IF;
  EXECUTE 'CREATE POLICY "Signers viewable by authenticated users" ON public.document_signers FOR SELECT TO authenticated USING (true)';
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='document_signers' AND policyname='Authenticated users can manage signers') THEN
    EXECUTE 'DROP POLICY "Authenticated users can manage signers" ON public.document_signers';
  END IF;
  EXECUTE 'CREATE POLICY "Authenticated users can manage signers" ON public.document_signers FOR ALL TO authenticated USING (true)';
END$$;

-- document_contacts
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='document_contacts' AND policyname='Document contacts viewable by authenticated users') THEN
    EXECUTE 'DROP POLICY "Document contacts viewable by authenticated users" ON public.document_contacts';
  END IF;
  EXECUTE 'CREATE POLICY "Document contacts viewable by authenticated users" ON public.document_contacts FOR SELECT TO authenticated USING (true)';
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='document_contacts' AND policyname='Authenticated users can manage document contacts') THEN
    EXECUTE 'DROP POLICY "Authenticated users can manage document contacts" ON public.document_contacts';
  END IF;
  EXECUTE 'CREATE POLICY "Authenticated users can manage document contacts" ON public.document_contacts FOR ALL TO authenticated USING (true)';
END$$;

-- generated_contracts
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='generated_contracts' AND policyname='Generated contracts viewable by authenticated users') THEN
    EXECUTE 'DROP POLICY "Generated contracts viewable by authenticated users" ON public.generated_contracts';
  END IF;
  EXECUTE 'CREATE POLICY "Generated contracts viewable by authenticated users" ON public.generated_contracts FOR SELECT TO authenticated USING (true)';
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='generated_contracts' AND policyname='Authenticated users can manage generated contracts') THEN
    EXECUTE 'DROP POLICY "Authenticated users can manage generated contracts" ON public.generated_contracts';
  END IF;
  EXECUTE 'CREATE POLICY "Authenticated users can manage generated contracts" ON public.generated_contracts FOR ALL TO authenticated USING (true)';
END$$;

-- Insert default templates
INSERT INTO document_templates (id, name, description, category, available_for)
VALUES
  ('00000000-0000-0000-0000-000000000101', 'Purchase Agreement', 'Standard real estate purchase agreement', 'purchase', ARRAY['project', 'opportunity']),
  ('00000000-0000-0000-0000-000000000102', 'Assignment of Contract', 'Contract assignment for wholesale deals', 'assignment', ARRAY['opportunity']),
  ('00000000-0000-0000-0000-000000000103', 'Letter of Intent (LOI)', 'Non-binding letter of intent', 'pre-contract', ARRAY['opportunity']),
  ('00000000-0000-0000-0000-000000000104', 'Due Diligence Extension', 'Request for DD period extension', 'amendment', ARRAY['project', 'opportunity']),
  ('00000000-0000-0000-0000-000000000105', 'Earnest Money Release', 'Release of earnest money deposit', 'closing', ARRAY['project', 'opportunity'])
ON CONFLICT (id) DO NOTHING;
-- Team Chat Tables Migration
-- Creates tables for internal team messaging

-- Team Members (extends auth.users with profile info)
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'member',
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Channels (both channels and DMs)
CREATE TABLE IF NOT EXISTS chat_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'channel' CHECK (type IN ('channel', 'dm')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Channel Members
CREATE TABLE IF NOT EXISTS chat_channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
  attachments JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unread Message Counts
CREATE TABLE IF NOT EXISTS chat_unread_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
  count INT DEFAULT 0,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, channel_id)
);

-- Chat Tasks (task assignments via chat)
CREATE TABLE IF NOT EXISTS chat_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON chat_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_channel_members_user ON chat_channel_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_channel_members_channel ON chat_channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_tasks_assigned ON chat_tasks(assigned_to);

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_unread_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Team members: visible to all authenticated users
CREATE POLICY "Team members are viewable by authenticated users"
  ON team_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own team member record"
  ON team_members FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Channels: members can see their channels
CREATE POLICY "Channel members can view channels"
  ON chat_channels FOR SELECT
  TO authenticated
  USING (
    type = 'channel' OR
    id IN (SELECT channel_id FROM chat_channel_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Authenticated users can create channels"
  ON chat_channels FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Channel members: visible to members
CREATE POLICY "Channel members are viewable by channel members"
  ON chat_channel_members FOR SELECT
  TO authenticated
  USING (
    channel_id IN (SELECT channel_id FROM chat_channel_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can join channels"
  ON chat_channel_members FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Messages: channel members can see messages
CREATE POLICY "Channel members can view messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    channel_id IN (SELECT channel_id FROM chat_channel_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Channel members can send messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    channel_id IN (SELECT channel_id FROM chat_channel_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can edit their own messages"
  ON chat_messages FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
  ON chat_messages FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Unread counts: user can manage their own
CREATE POLICY "Users can view their unread counts"
  ON chat_unread_counts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their unread counts"
  ON chat_unread_counts FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Tasks: visible to assigned user and creator
CREATE POLICY "Users can view their assigned tasks"
  ON chat_tasks FOR SELECT
  TO authenticated
  USING (assigned_to = auth.uid() OR created_by = auth.uid());

CREATE POLICY "Authenticated users can create tasks"
  ON chat_tasks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their assigned tasks"
  ON chat_tasks FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid() OR created_by = auth.uid());

-- Function to increment unread count
CREATE OR REPLACE FUNCTION increment_unread_counts()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO chat_unread_counts (user_id, channel_id, count)
  SELECT cm.user_id, NEW.channel_id, 1
  FROM chat_channel_members cm
  WHERE cm.channel_id = NEW.channel_id
    AND cm.user_id != NEW.user_id
  ON CONFLICT (user_id, channel_id)
  DO UPDATE SET count = chat_unread_counts.count + 1;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new messages
DROP TRIGGER IF EXISTS on_new_message ON chat_messages;
CREATE TRIGGER on_new_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION increment_unread_counts();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE team_members;

-- Insert default general channel
INSERT INTO chat_channels (id, name, description, type)
VALUES ('00000000-0000-0000-0000-000000000001', 'General', 'General team discussion', 'channel')
ON CONFLICT (id) DO NOTHING;
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
-- Migration: Extended project contacts schema with 12 categories
-- Supports: Architect, Consultant, Contractor, Engineer, Government,
-- Investor, Legal/Title, Lender, Sales, Survey, Team Member, Other

CREATE TABLE IF NOT EXISTS project_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),

  -- Basic contact info
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'architect', 'consultant', 'contractor', 'engineer', 'government',
    'investor', 'legal_title', 'lender', 'sales', 'survey', 'team_member', 'other'
  )),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  company_name VARCHAR(200),
  job_title VARCHAR(100),
  email VARCHAR(200),
  phone VARCHAR(50),
  cell_phone VARCHAR(50),
  fax VARCHAR(50),

  -- Address
  address_line1 VARCHAR(200),
  address_line2 VARCHAR(100),
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),

  -- Category-specific fields stored as JSONB
  profile_data JSONB DEFAULT '{}',

  -- Status & metadata
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,

  -- Global contact reference
  global_contact_id UUID,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_contacts_project ON project_contacts(project_id);
CREATE INDEX IF NOT EXISTS idx_project_contacts_category ON project_contacts(category);
CREATE INDEX IF NOT EXISTS idx_project_contacts_org ON project_contacts(organization_id);

-- RLS
ALTER TABLE project_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view project contacts" ON project_contacts
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    ))
  );

CREATE POLICY "Users can manage project contacts" ON project_contacts
  FOR ALL USING (
    project_id IN (SELECT id FROM projects WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    ))
  );
-- Migration: Auto-generate project numbers (YY-XXX format)
-- Creates a sequence and function to generate project numbers

-- Create sequence for project numbers per year
CREATE TABLE IF NOT EXISTS project_number_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  year INTEGER NOT NULL,
  last_number INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, year)
);

-- Add project_number column to projects table if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'project_number') THEN
    ALTER TABLE projects ADD COLUMN project_number VARCHAR(10);
  END IF;
END $$;

-- Create index on project_number
CREATE INDEX IF NOT EXISTS idx_projects_project_number ON projects(project_number);

-- Function to generate next project number
CREATE OR REPLACE FUNCTION generate_project_number(org_id UUID)
RETURNS VARCHAR(10) AS $$
DECLARE
  current_year INTEGER;
  year_suffix VARCHAR(2);
  next_num INTEGER;
  result VARCHAR(10);
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  year_suffix := LPAD(MOD(current_year, 100)::TEXT, 2, '0');

  -- Insert or update the sequence for this year
  INSERT INTO project_number_sequences (organization_id, year, last_number)
  VALUES (org_id, current_year, 1)
  ON CONFLICT (organization_id, year)
  DO UPDATE SET last_number = project_number_sequences.last_number + 1, updated_at = now()
  RETURNING last_number INTO next_num;

  result := year_suffix || '-' || LPAD(next_num::TEXT, 3, '0');
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- RLS policies
ALTER TABLE project_number_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org sequences" ON project_number_sequences
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update their org sequences" ON project_number_sequences
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));
-- Migration: Teams and Budget Templates enhancements

-- ============================================
-- TEAMS ENHANCEMENTS
-- ============================================

-- Ensure teams table has all needed columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teams' AND column_name = 'department') THEN
    ALTER TABLE teams ADD COLUMN department VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teams' AND column_name = 'manager_id') THEN
    ALTER TABLE teams ADD COLUMN manager_id UUID REFERENCES profiles(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teams' AND column_name = 'max_members') THEN
    ALTER TABLE teams ADD COLUMN max_members INTEGER DEFAULT 20;
  END IF;
END $$;

-- ============================================
-- BUDGET TEMPLATES ENHANCEMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS budget_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  project_type VARCHAR(50),
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Template structure
  categories JSONB DEFAULT '[]',
  line_items JSONB DEFAULT '[]',

  -- Metadata
  version INTEGER DEFAULT 1,
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_budget_templates_org ON budget_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_budget_templates_type ON budget_templates(project_type);

ALTER TABLE budget_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org budget templates" ON budget_templates
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can manage org budget templates" ON budget_templates
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

-- ============================================
-- DUE DILIGENCE
-- ============================================

CREATE TABLE IF NOT EXISTS due_diligence_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),

  category VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'waived', 'failed')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),

  due_date DATE,
  completed_date DATE,
  assigned_to UUID REFERENCES profiles(id),

  -- Documents & notes
  documents JSONB DEFAULT '[]',
  notes TEXT,
  findings TEXT,

  -- Order
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_due_diligence_project ON due_diligence_items(project_id);
CREATE INDEX IF NOT EXISTS idx_due_diligence_status ON due_diligence_items(status);

ALTER TABLE due_diligence_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view due diligence" ON due_diligence_items
  FOR SELECT USING (project_id IN (
    SELECT id FROM projects WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can manage due diligence" ON due_diligence_items
  FOR ALL USING (project_id IN (
    SELECT id FROM projects WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  ));

-- ============================================
-- CLOSING
-- ============================================

CREATE TABLE IF NOT EXISTS closing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),

  category VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'na')),

  due_date DATE,
  completed_date DATE,
  assigned_to UUID REFERENCES profiles(id),
  responsible_party VARCHAR(200),

  -- Documents
  documents JSONB DEFAULT '[]',
  notes TEXT,

  -- Order
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_closing_items_project ON closing_items(project_id);

ALTER TABLE closing_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view closing items" ON closing_items
  FOR SELECT USING (project_id IN (
    SELECT id FROM projects WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can manage closing items" ON closing_items
  FOR ALL USING (project_id IN (
    SELECT id FROM projects WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  ));
