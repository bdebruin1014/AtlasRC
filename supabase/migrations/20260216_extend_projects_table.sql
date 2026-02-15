-- ============================================================================
-- EXTEND PROJECTS TABLE
-- Add columns for acquisition, address, closing, and property details
-- that ProjectDetailPage.jsx and BasicInfoPage.jsx reference
-- ============================================================================

-- Address fields (split from single 'address' text)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Greenville';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'SC';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS county TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS parcel_id TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS lot_size DECIMAL(10,2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS zoning TEXT;

-- Acquisition / Purchase Contract
ALTER TABLE projects ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(12,2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS earnest_money DECIMAL(12,2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS contract_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS dd_deadline DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS dd_notes TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS purchase_status TEXT DEFAULT 'under-contract'
  CHECK (purchase_status IN ('prospecting', 'under-contract', 'due-diligence', 'closing', 'closed', 'dead'));

-- Seller info
ALTER TABLE projects ADD COLUMN IF NOT EXISTS seller_name TEXT;

-- Closing
ALTER TABLE projects ADD COLUMN IF NOT EXISTS closing_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS closing_agent TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS closing_costs DECIMAL(12,2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS closing_notes TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS title_company TEXT;

-- Budget type (for matching budget template)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS budget_type TEXT;

-- Team assignment (FK to teams table)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS team_id UUID;

-- Units to develop
ALTER TABLE projects ADD COLUMN IF NOT EXISTS units_to_develop INTEGER DEFAULT 1;

-- Description (may already exist as notes, but UI uses description)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_city ON projects(city);
CREATE INDEX IF NOT EXISTS idx_projects_purchase_status ON projects(purchase_status);
CREATE INDEX IF NOT EXISTS idx_projects_team_id ON projects(team_id);
