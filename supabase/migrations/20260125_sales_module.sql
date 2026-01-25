-- ============================================
-- REVENUE & SALES MODULE
-- Sales tracking for all project types
-- ============================================

-- sales table
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  -- Property/Unit
  unit_identifier TEXT,
  property_type TEXT, -- lot, home, unit, commercial

  -- Buyer
  buyer_name TEXT,
  buyer_contact_id UUID REFERENCES contacts(id),
  buyer_agent_id UUID REFERENCES contacts(id),

  -- Sale Details
  list_price DECIMAL(12,2),
  sale_price DECIMAL(12,2),
  price_psf DECIMAL(8,2),
  square_footage INTEGER,

  -- Dates
  listing_date DATE,
  contract_date DATE,
  closing_date DATE,
  actual_closing_date DATE,

  -- Status
  status TEXT DEFAULT 'available', -- available, pending, under_contract, closed, cancelled

  -- Costs
  broker_commission DECIMAL(10,2),
  closing_costs DECIMAL(10,2),
  concessions DECIMAL(10,2),

  -- Net
  gross_proceeds DECIMAL(12,2),
  net_proceeds DECIMAL(12,2),

  -- Financing
  buyer_financing_type TEXT, -- cash, conventional, fha, va, hard_money
  earnest_money DECIMAL(10,2),
  option_period_days INTEGER,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sales_project ON sales(project_id);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_unit ON sales(unit_identifier);
CREATE INDEX IF NOT EXISTS idx_sales_closing ON sales(closing_date);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_sale_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  -- Calculate net proceeds
  NEW.gross_proceeds = COALESCE(NEW.sale_price, NEW.list_price, 0);
  NEW.net_proceeds = NEW.gross_proceeds
    - COALESCE(NEW.broker_commission, 0)
    - COALESCE(NEW.closing_costs, 0)
    - COALESCE(NEW.concessions, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sale_updated_at
  BEFORE INSERT OR UPDATE ON sales
  FOR EACH ROW
  EXECUTE FUNCTION update_sale_updated_at();
