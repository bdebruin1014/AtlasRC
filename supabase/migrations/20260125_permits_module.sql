-- ============================================
-- PERMITS MODULE
-- Permit tracking with inspections
-- ============================================

-- permits table
CREATE TABLE IF NOT EXISTS permits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  -- Permit Info
  permit_type TEXT NOT NULL, -- building, electrical, plumbing, mechanical, grading, demolition,
                              -- fire, health, zoning, environmental, encroachment, other
  permit_number TEXT,

  -- Jurisdiction
  issuing_authority TEXT NOT NULL,
  jurisdiction TEXT, -- city, county, state, federal

  -- Dates
  application_date DATE,
  submitted_date DATE,
  approved_date DATE,
  issued_date DATE,
  expiration_date DATE,

  -- Status
  status TEXT DEFAULT 'not_applied', -- not_applied, applied, under_review,
                                      -- revisions_required, approved, issued, expired, denied

  -- Costs
  application_fee DECIMAL(10,2),
  permit_fee DECIMAL(10,2),
  impact_fees DECIMAL(12,2),
  total_fees DECIMAL(12,2),
  fees_paid BOOLEAN DEFAULT false,

  -- Inspections
  requires_inspections BOOLEAN DEFAULT true,
  inspection_count INTEGER DEFAULT 0,

  -- Documents
  application_doc_path TEXT,
  approval_doc_path TEXT,
  permit_doc_path TEXT,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- permit_inspections table
CREATE TABLE IF NOT EXISTS permit_inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  permit_id UUID REFERENCES permits(id) ON DELETE CASCADE,

  inspection_type TEXT NOT NULL,
  scheduled_date DATE,
  actual_date DATE,
  inspector_name TEXT,

  result TEXT, -- passed, failed, partial, cancelled
  notes TEXT,
  correction_required TEXT,
  reinspection_date DATE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_permits_project ON permits(project_id);
CREATE INDEX IF NOT EXISTS idx_permits_status ON permits(status);
CREATE INDEX IF NOT EXISTS idx_permits_type ON permits(permit_type);
CREATE INDEX IF NOT EXISTS idx_permits_expiration ON permits(expiration_date);
CREATE INDEX IF NOT EXISTS idx_permit_inspections_permit ON permit_inspections(permit_id);
CREATE INDEX IF NOT EXISTS idx_permit_inspections_date ON permit_inspections(scheduled_date);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_permit_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_permit_updated_at
  BEFORE UPDATE ON permits
  FOR EACH ROW
  EXECUTE FUNCTION update_permit_updated_at();

-- Update inspection count trigger
CREATE OR REPLACE FUNCTION update_permit_inspection_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'DELETE' THEN
    UPDATE permits
    SET inspection_count = (
      SELECT COUNT(*) FROM permit_inspections WHERE permit_id = COALESCE(NEW.permit_id, OLD.permit_id)
    )
    WHERE id = COALESCE(NEW.permit_id, OLD.permit_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inspection_count
  AFTER INSERT OR DELETE ON permit_inspections
  FOR EACH ROW
  EXECUTE FUNCTION update_permit_inspection_count();
