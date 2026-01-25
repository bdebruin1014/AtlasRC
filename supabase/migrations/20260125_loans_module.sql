-- ============================================
-- LOANS MODULE
-- Comprehensive loan tracking with amortization
-- ============================================

-- loans table
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  -- Basic Info
  name TEXT NOT NULL,
  loan_type TEXT NOT NULL, -- construction, bridge, permanent, mezzanine, preferred_equity, line_of_credit
  position TEXT NOT NULL, -- first, second, third, unsecured

  -- Lender
  lender_name TEXT,
  lender_id UUID REFERENCES contacts(id),
  loan_officer TEXT,

  -- Terms
  commitment_amount DECIMAL(14,2) NOT NULL,
  funded_amount DECIMAL(14,2) DEFAULT 0,

  -- Rates
  interest_rate DECIMAL(6,4) NOT NULL,
  rate_type TEXT DEFAULT 'fixed', -- fixed, floating
  index_rate TEXT, -- prime, sofr, libor
  spread DECIMAL(6,4),
  floor_rate DECIMAL(6,4),

  -- Schedule
  term_months INTEGER NOT NULL,
  amortization_months INTEGER,
  io_period_months INTEGER DEFAULT 0,

  -- Dates
  effective_date DATE,
  maturity_date DATE,
  first_payment_date DATE,

  -- Fees
  origination_fee_percent DECIMAL(5,4),
  origination_fee_amount DECIMAL(12,2),
  exit_fee_percent DECIMAL(5,4),
  annual_fee DECIMAL(10,2),

  -- Reserves
  interest_reserve DECIMAL(12,2) DEFAULT 0,
  operating_reserve DECIMAL(12,2) DEFAULT 0,
  replacement_reserve DECIMAL(12,2) DEFAULT 0,

  -- LTV/LTC
  max_ltv DECIMAL(5,4),
  max_ltc DECIMAL(5,4),

  -- Status
  status TEXT DEFAULT 'proposed', -- proposed, term_sheet, application, underwriting,
                                   -- approved, closed, active, paid_off, defaulted

  -- Documents
  term_sheet_path TEXT,
  commitment_letter_path TEXT,
  loan_agreement_path TEXT,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- loan_draws table
CREATE TABLE IF NOT EXISTS loan_draws (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
  draw_request_id UUID REFERENCES draw_requests(id),

  draw_number INTEGER,
  draw_date DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,

  status TEXT DEFAULT 'requested', -- requested, approved, funded

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- loan_payments table
CREATE TABLE IF NOT EXISTS loan_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,

  payment_date DATE NOT NULL,
  payment_number INTEGER,

  -- Amounts
  total_payment DECIMAL(12,2) NOT NULL,
  principal_payment DECIMAL(12,2) DEFAULT 0,
  interest_payment DECIMAL(12,2) DEFAULT 0,
  fees DECIMAL(10,2) DEFAULT 0,

  -- Balance
  beginning_balance DECIMAL(14,2),
  ending_balance DECIMAL(14,2),

  status TEXT DEFAULT 'scheduled', -- scheduled, paid, late, missed

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_loans_project ON loans(project_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_type ON loans(loan_type);
CREATE INDEX IF NOT EXISTS idx_loan_draws_loan ON loan_draws(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_payments_loan ON loan_payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_payments_date ON loan_payments(payment_date);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_loan_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_loan_updated_at
  BEFORE UPDATE ON loans
  FOR EACH ROW
  EXECUTE FUNCTION update_loan_updated_at();

-- Update funded_amount when draw is funded
CREATE OR REPLACE FUNCTION update_loan_funded_on_draw()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'funded' AND (OLD.status IS NULL OR OLD.status != 'funded') THEN
    UPDATE loans
    SET funded_amount = funded_amount + NEW.amount
    WHERE id = NEW.loan_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_loan_draw_funded
  AFTER INSERT OR UPDATE ON loan_draws
  FOR EACH ROW
  EXECUTE FUNCTION update_loan_funded_on_draw();
