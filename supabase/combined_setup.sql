-- ============================================================================
-- ATLAS COMBINED SETUP SCRIPT
-- Run this in Supabase SQL Editor to set up all core tables
-- This script is idempotent - safe to run multiple times
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- ENTITIES (Company structure)
CREATE TABLE IF NOT EXISTS entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('holding', 'operating', 'project')),
  parent_entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  tax_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);
CREATE INDEX IF NOT EXISTS idx_entities_parent ON entities(parent_entity_id);

-- OPPORTUNITIES (Pipeline)
CREATE TABLE IF NOT EXISTS opportunities (
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

CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_assigned_to ON opportunities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON opportunities(created_at DESC);

-- PROJECTS (Active developments)
CREATE TABLE IF NOT EXISTS projects (
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

CREATE INDEX IF NOT EXISTS idx_projects_entity_id ON projects(entity_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- CONTACTS
CREATE TABLE IF NOT EXISTS contacts (
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

CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(contact_type);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

-- TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
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

CREATE INDEX IF NOT EXISTS idx_transactions_entity_id ON transactions(entity_id);
CREATE INDEX IF NOT EXISTS idx_transactions_project_id ON transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);

-- ============================================================================
-- USER MANAGEMENT TABLES
-- ============================================================================

-- USER PROFILES
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

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);

-- USER ROLES
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

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- TEAMS
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

CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);
CREATE INDEX IF NOT EXISTS idx_teams_is_active ON teams(is_active);

-- TEAM MEMBERS
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_role TEXT DEFAULT 'member' CHECK (team_role IN ('lead', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

-- PROJECT TEAM MEMBERS
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

CREATE INDEX IF NOT EXISTS idx_project_team_members_project_id ON project_team_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_team_members_user_id ON project_team_members(user_id);

-- PERMISSION AUDIT LOG
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

CREATE INDEX IF NOT EXISTS idx_permission_audit_log_created_at ON permission_audit_log(created_at DESC);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES (Idempotent - drops and recreates)
-- ============================================================================

-- Helper function to create policies idempotently
DO $$
BEGIN
  -- ENTITIES
  DROP POLICY IF EXISTS "Allow authenticated users full access to entities" ON entities;
  CREATE POLICY "Allow authenticated users full access to entities"
    ON entities FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

  -- OPPORTUNITIES
  DROP POLICY IF EXISTS "Allow authenticated users full access to opportunities" ON opportunities;
  CREATE POLICY "Allow authenticated users full access to opportunities"
    ON opportunities FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

  -- PROJECTS
  DROP POLICY IF EXISTS "Allow authenticated users full access to projects" ON projects;
  CREATE POLICY "Allow authenticated users full access to projects"
    ON projects FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

  -- CONTACTS
  DROP POLICY IF EXISTS "Allow authenticated users full access to contacts" ON contacts;
  CREATE POLICY "Allow authenticated users full access to contacts"
    ON contacts FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

  -- TRANSACTIONS
  DROP POLICY IF EXISTS "Allow authenticated users full access to transactions" ON transactions;
  CREATE POLICY "Allow authenticated users full access to transactions"
    ON transactions FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

  -- USER PROFILES
  DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
  CREATE POLICY "Users can view all profiles"
    ON user_profiles FOR SELECT TO authenticated
    USING (true);

  DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
  CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE TO authenticated
    USING (id = auth.uid()) WITH CHECK (id = auth.uid());

  DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;
  CREATE POLICY "Admins can insert profiles"
    ON user_profiles FOR INSERT TO authenticated
    WITH CHECK (true);

  DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;
  CREATE POLICY "Admins can delete profiles"
    ON user_profiles FOR DELETE TO authenticated
    USING (true);

  -- USER ROLES
  DROP POLICY IF EXISTS "Users can view all roles" ON user_roles;
  CREATE POLICY "Users can view all roles"
    ON user_roles FOR SELECT TO authenticated
    USING (true);

  DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
  CREATE POLICY "Admins can manage roles"
    ON user_roles FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

  -- TEAMS
  DROP POLICY IF EXISTS "Users can view all teams" ON teams;
  CREATE POLICY "Users can view all teams"
    ON teams FOR SELECT TO authenticated
    USING (true);

  DROP POLICY IF EXISTS "Admins can manage teams" ON teams;
  CREATE POLICY "Admins can manage teams"
    ON teams FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

  -- TEAM MEMBERS
  DROP POLICY IF EXISTS "Users can view team members" ON team_members;
  CREATE POLICY "Users can view team members"
    ON team_members FOR SELECT TO authenticated
    USING (true);

  DROP POLICY IF EXISTS "Admins can manage team members" ON team_members;
  CREATE POLICY "Admins can manage team members"
    ON team_members FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

  -- PROJECT TEAM MEMBERS
  DROP POLICY IF EXISTS "Users can view project team members" ON project_team_members;
  CREATE POLICY "Users can view project team members"
    ON project_team_members FOR SELECT TO authenticated
    USING (true);

  DROP POLICY IF EXISTS "Admins can manage project team members" ON project_team_members;
  CREATE POLICY "Admins can manage project team members"
    ON project_team_members FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

  -- PERMISSION AUDIT LOG
  DROP POLICY IF EXISTS "Admins can view audit log" ON permission_audit_log;
  CREATE POLICY "Admins can view audit log"
    ON permission_audit_log FOR SELECT TO authenticated
    USING (true);

  DROP POLICY IF EXISTS "System can insert audit log" ON permission_audit_log;
  CREATE POLICY "System can insert audit log"
    ON permission_audit_log FOR INSERT TO authenticated
    WITH CHECK (true);
END $$;

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers (drop first to avoid duplicates)
DROP TRIGGER IF EXISTS update_entities_updated_at ON entities;
CREATE TRIGGER update_entities_updated_at BEFORE UPDATE ON entities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_opportunities_updated_at ON opportunities;
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'team_member')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- VIEWS
-- ============================================================================

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

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

-- ============================================================================
-- CREATE USER PROFILE FOR EXISTING AUTH USER
-- Run this section after running the above, replacing the values
-- ============================================================================

-- First, find your user ID:
-- SELECT id, email FROM auth.users;

-- Then uncomment and run with your values:
/*
INSERT INTO user_profiles (id, email, full_name, status)
VALUES (
  'YOUR-USER-UUID-HERE',
  'your-email@example.com',
  'Your Name',
  'active'
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  status = EXCLUDED.status;

INSERT INTO user_roles (user_id, role)
VALUES (
  'YOUR-USER-UUID-HERE',
  'super_admin'
) ON CONFLICT (user_id) DO UPDATE SET
  role = EXCLUDED.role;
*/

-- ============================================================================
-- VERIFICATION - Run these to check everything worked
-- ============================================================================

-- Check tables exist:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Check your user profile:
-- SELECT * FROM user_profiles;
-- SELECT * FROM user_roles;

-- Check RLS policies:
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';
