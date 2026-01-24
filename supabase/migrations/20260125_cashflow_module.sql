-- ============================================
-- CASH FLOW MODULE
-- Cash flow tracking and projections
-- ============================================

-- cash_flow_records table
CREATE TABLE IF NOT EXISTS cash_flow_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  -- Period
  period_type TEXT DEFAULT 'monthly', -- monthly, weekly
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Starting Position
  beginning_cash DECIMAL(14,2) DEFAULT 0,

  -- Inflows
  loan_draws DECIMAL(14,2) DEFAULT 0,
  equity_contributions DECIMAL(14,2) DEFAULT 0,
  sales_proceeds DECIMAL(14,2) DEFAULT 0,
  rental_income DECIMAL(14,2) DEFAULT 0,
  other_income DECIMAL(14,2) DEFAULT 0,
  total_inflows DECIMAL(14,2) GENERATED ALWAYS AS (
    loan_draws + equity_contributions + sales_proceeds + rental_income + other_income
  ) STORED,

  -- Outflows
  land_payments DECIMAL(14,2) DEFAULT 0,
  hard_cost_payments DECIMAL(14,2) DEFAULT 0,
  soft_cost_payments DECIMAL(14,2) DEFAULT 0,
  interest_payments DECIMAL(14,2) DEFAULT 0,
  loan_fees DECIMAL(14,2) DEFAULT 0,
  distributions DECIMAL(14,2) DEFAULT 0,
  other_expenses DECIMAL(14,2) DEFAULT 0,
  total_outflows DECIMAL(14,2) GENERATED ALWAYS AS (
    land_payments + hard_cost_payments + soft_cost_payments +
    interest_payments + loan_fees + distributions + other_expenses
  ) STORED,

  -- Net Change
  net_cash_flow DECIMAL(14,2) GENERATED ALWAYS AS (
    (loan_draws + equity_contributions + sales_proceeds + rental_income + other_income) -
    (land_payments + hard_cost_payments + soft_cost_payments + interest_payments + loan_fees + distributions + other_expenses)
  ) STORED,

  -- Ending Position
  ending_cash DECIMAL(14,2) DEFAULT 0,

  -- Type
  is_actual BOOLEAN DEFAULT false, -- false = projected, true = actual
  is_locked BOOLEAN DEFAULT false, -- Lock historical periods

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cashflow_project ON cash_flow_records(project_id);
CREATE INDEX IF NOT EXISTS idx_cashflow_period ON cash_flow_records(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_cashflow_actual ON cash_flow_records(is_actual);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_cashflow_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  -- Calculate ending cash
  NEW.ending_cash = COALESCE(NEW.beginning_cash, 0) +
    (COALESCE(NEW.loan_draws, 0) + COALESCE(NEW.equity_contributions, 0) +
     COALESCE(NEW.sales_proceeds, 0) + COALESCE(NEW.rental_income, 0) +
     COALESCE(NEW.other_income, 0)) -
    (COALESCE(NEW.land_payments, 0) + COALESCE(NEW.hard_cost_payments, 0) +
     COALESCE(NEW.soft_cost_payments, 0) + COALESCE(NEW.interest_payments, 0) +
     COALESCE(NEW.loan_fees, 0) + COALESCE(NEW.distributions, 0) +
     COALESCE(NEW.other_expenses, 0));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cashflow_updated_at
  BEFORE INSERT OR UPDATE ON cash_flow_records
  FOR EACH ROW
  EXECUTE FUNCTION update_cashflow_updated_at();
