-- Draw Requests Module
-- Tracks construction loan draw requests with budget integration

-- ─── DRAW REQUESTS TABLE ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS draw_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  budget_id UUID REFERENCES project_budgets(id),

  -- Identification
  draw_number INTEGER NOT NULL,

  -- Dates
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  period_start DATE,
  period_end DATE,
  submitted_date TIMESTAMPTZ,
  approved_date TIMESTAMPTZ,
  funded_date TIMESTAMPTZ,

  -- Amounts
  requested_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  approved_amount DECIMAL(12,2),
  funded_amount DECIMAL(12,2),

  -- Retainage
  retainage_percentage DECIMAL(5,2) DEFAULT 10,
  retainage_amount DECIMAL(12,2) DEFAULT 0,
  net_amount DECIMAL(12,2),

  -- Status: draft, requested, under_review, approved, denied, funded
  status TEXT DEFAULT 'draft',

  -- Lender Info
  lender_id UUID REFERENCES contacts(id),
  lender_name TEXT,
  inspector_name TEXT,
  inspection_date DATE,
  inspection_notes TEXT,

  -- Approval
  approved_by UUID REFERENCES auth.users(id),
  denial_reason TEXT,

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  UNIQUE(project_id, draw_number)
);

-- ─── DRAW REQUEST LINE ITEMS ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS draw_request_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_request_id UUID REFERENCES draw_requests(id) ON DELETE CASCADE,
  budget_line_item_id UUID REFERENCES budget_line_items(id),

  -- Line item reference
  cost_code TEXT,
  description TEXT,

  -- Amounts
  budget_amount DECIMAL(12,2) DEFAULT 0,
  previously_drawn DECIMAL(12,2) DEFAULT 0,
  current_request DECIMAL(12,2) NOT NULL DEFAULT 0,
  percent_complete DECIMAL(5,2) DEFAULT 0,

  -- Approval
  approved_amount DECIMAL(12,2),

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DRAW REQUEST DOCUMENTS ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS draw_request_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_request_id UUID REFERENCES draw_requests(id) ON DELETE CASCADE,

  -- document_type: invoice, lien_waiver, inspection_report, photo, other
  document_type TEXT DEFAULT 'other',
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,

  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- ─── TRIGGER: UPDATE BUDGET ON DRAW FUNDED ────────────────────────────────────

CREATE OR REPLACE FUNCTION update_budget_on_draw_funded()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'funded' AND OLD.status != 'funded' THEN
    -- Update each budget line item's actual amount
    UPDATE budget_line_items bli
    SET actual_amount = COALESCE(actual_amount, 0) + COALESCE(dri.approved_amount, dri.current_request)
    FROM draw_request_items dri
    WHERE dri.draw_request_id = NEW.id
      AND bli.id = dri.budget_line_item_id
      AND dri.budget_line_item_id IS NOT NULL;

    -- Update budget totals
    UPDATE project_budgets pb
    SET
      total_actual = (
        SELECT COALESCE(SUM(actual_amount), 0)
        FROM budget_line_items
        WHERE budget_id = pb.id
      ),
      total_variance = COALESCE(total_budget, 0) - (
        SELECT COALESCE(SUM(actual_amount), 0)
        FROM budget_line_items
        WHERE budget_id = pb.id
      ),
      updated_at = NOW()
    WHERE pb.id = NEW.budget_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_budget_on_draw
AFTER UPDATE ON draw_requests
FOR EACH ROW EXECUTE FUNCTION update_budget_on_draw_funded();

-- ─── INDEXES ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_draw_requests_project ON draw_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_draw_requests_budget ON draw_requests(budget_id);
CREATE INDEX IF NOT EXISTS idx_draw_requests_status ON draw_requests(status);
CREATE INDEX IF NOT EXISTS idx_draw_request_items_draw ON draw_request_items(draw_request_id);
CREATE INDEX IF NOT EXISTS idx_draw_request_items_budget_line ON draw_request_items(budget_line_item_id);
CREATE INDEX IF NOT EXISTS idx_draw_request_documents_draw ON draw_request_documents(draw_request_id);

-- ─── RLS POLICIES ─────────────────────────────────────────────────────────────

ALTER TABLE draw_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_request_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view draw requests" ON draw_requests FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage draw requests" ON draw_requests FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view draw request items" ON draw_request_items FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage draw request items" ON draw_request_items FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view draw request documents" ON draw_request_documents FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage draw request documents" ON draw_request_documents FOR ALL USING (auth.uid() IS NOT NULL);
