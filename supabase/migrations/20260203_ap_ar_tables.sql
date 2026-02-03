-- ============================================================================
-- ACCOUNTS PAYABLE AND ACCOUNTS RECEIVABLE TABLES
-- ============================================================================
-- This migration adds:
-- 1. Vendors (AP parties with 1099 tracking)
-- 2. Bills and Bill Lines (AP transactions)
-- 3. Bill Payments and Applications
-- 4. Customers (AR parties)
-- 5. Invoices and Invoice Lines (AR transactions)
-- 6. Invoice Payments and Applications
-- ============================================================================

-- =============================================
-- VENDORS
-- =============================================
-- Note: Table may already exist; adding missing columns
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS entity_id UUID REFERENCES entities(id) ON DELETE CASCADE;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS company_name VARCHAR(200);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS display_name VARCHAR(200);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS address_line1 VARCHAR(200);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS address_line2 VARCHAR(200);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'USA';
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS is_1099_vendor BOOLEAN DEFAULT false;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS w9_on_file BOOLEAN DEFAULT false;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS w9_received_date DATE;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS default_payment_terms TEXT DEFAULT 'NET_30';
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS default_expense_account_id UUID REFERENCES chart_of_accounts(id);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS bank_routing VARCHAR(20);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS bank_account VARCHAR(30);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id);

-- =============================================
-- BILLS (Accounts Payable)
-- =============================================
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id),

  bill_number VARCHAR(50),
  bill_date DATE NOT NULL,
  due_date DATE NOT NULL,

  payment_terms TEXT,

  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(15,2) DEFAULT 0,
  balance_due DECIMAL(15,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,

  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'partial', 'paid', 'voided')),

  memo TEXT,

  journal_entry_id UUID REFERENCES journal_entries(id),

  ap_account_id UUID REFERENCES chart_of_accounts(id),

  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BILL LINE ITEMS
-- =============================================
CREATE TABLE IF NOT EXISTS bill_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,

  line_number INTEGER NOT NULL,

  account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
  description TEXT,
  quantity DECIMAL(10,4) DEFAULT 1,
  unit_price DECIMAL(15,4),
  amount DECIMAL(15,2) NOT NULL,

  project_id UUID REFERENCES projects(id),
  cost_code_id UUID,

  is_billable BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BILL PAYMENTS
-- =============================================
CREATE TABLE IF NOT EXISTS bill_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,

  payment_number VARCHAR(20) NOT NULL,
  payment_date DATE NOT NULL,

  bank_account_id UUID NOT NULL REFERENCES chart_of_accounts(id),

  payment_method TEXT NOT NULL CHECK (payment_method IN ('check', 'ach', 'wire', 'credit_card', 'cash')),
  check_number VARCHAR(20),
  reference_number VARCHAR(50),

  total_amount DECIMAL(15,2) NOT NULL,

  memo TEXT,

  journal_entry_id UUID REFERENCES journal_entries(id),

  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'voided')),

  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BILL PAYMENT APPLICATIONS
-- =============================================
CREATE TABLE IF NOT EXISTS bill_payment_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_payment_id UUID NOT NULL REFERENCES bill_payments(id) ON DELETE CASCADE,
  bill_id UUID NOT NULL REFERENCES bills(id),

  amount_applied DECIMAL(15,2) NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CUSTOMERS
-- =============================================
-- Note: Table may already exist; adding missing columns
ALTER TABLE customers ADD COLUMN IF NOT EXISTS entity_id UUID REFERENCES entities(id) ON DELETE CASCADE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS company_name VARCHAR(200);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS display_name VARCHAR(200);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS contact_name VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS billing_address_line1 VARCHAR(200);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS billing_address_line2 VARCHAR(200);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS billing_city VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS billing_state VARCHAR(50);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS billing_zip VARCHAR(20);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS default_payment_terms TEXT DEFAULT 'NET_30';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS default_revenue_account_id UUID REFERENCES chart_of_accounts(id);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- =============================================
-- INVOICES (Accounts Receivable)
-- =============================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id),

  invoice_number VARCHAR(50) NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,

  payment_terms TEXT,

  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(15,2) DEFAULT 0,
  balance_due DECIMAL(15,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,

  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'partial', 'paid', 'voided', 'overdue')),

  memo TEXT,

  journal_entry_id UUID REFERENCES journal_entries(id),
  ar_account_id UUID REFERENCES chart_of_accounts(id),

  project_id UUID REFERENCES projects(id),

  created_by UUID REFERENCES auth.users(id),
  sent_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INVOICE LINE ITEMS
-- =============================================
CREATE TABLE IF NOT EXISTS invoice_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

  line_number INTEGER NOT NULL,

  account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
  description TEXT,
  quantity DECIMAL(10,4) DEFAULT 1,
  unit_price DECIMAL(15,4),
  amount DECIMAL(15,2) NOT NULL,

  project_id UUID REFERENCES projects(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INVOICE PAYMENTS (Receive Payments)
-- =============================================
CREATE TABLE IF NOT EXISTS invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,

  payment_number VARCHAR(20) NOT NULL,
  payment_date DATE NOT NULL,

  customer_id UUID NOT NULL REFERENCES customers(id),

  deposit_account_id UUID NOT NULL REFERENCES chart_of_accounts(id),

  payment_method TEXT NOT NULL CHECK (payment_method IN ('check', 'ach', 'wire', 'credit_card', 'cash')),
  reference_number VARCHAR(50),

  total_amount DECIMAL(15,2) NOT NULL,

  memo TEXT,

  journal_entry_id UUID REFERENCES journal_entries(id),

  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INVOICE PAYMENT APPLICATIONS
-- =============================================
CREATE TABLE IF NOT EXISTS invoice_payment_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_payment_id UUID NOT NULL REFERENCES invoice_payments(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id),

  amount_applied DECIMAL(15,2) NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_vendors_entity ON vendors(entity_id);
CREATE INDEX IF NOT EXISTS idx_bills_entity ON bills(entity_id);
CREATE INDEX IF NOT EXISTS idx_bills_vendor ON bills(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_due ON bills(due_date);
CREATE INDEX IF NOT EXISTS idx_bill_lines_bill ON bill_lines(bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_payments_entity ON bill_payments(entity_id);

CREATE INDEX IF NOT EXISTS idx_customers_entity ON customers(entity_id);
CREATE INDEX IF NOT EXISTS idx_invoices_entity ON invoices(entity_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_lines_invoice ON invoice_lines(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_entity ON invoice_payments(entity_id);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_payment_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payment_applications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================
CREATE POLICY "Allow authenticated access to vendors"
  ON vendors FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to bills"
  ON bills FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to bill_lines"
  ON bill_lines FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to bill_payments"
  ON bill_payments FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to bill_payment_applications"
  ON bill_payment_applications FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to customers"
  ON customers FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to invoices"
  ON invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to invoice_lines"
  ON invoice_lines FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to invoice_payments"
  ON invoice_payments FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to invoice_payment_applications"
  ON invoice_payment_applications FOR ALL TO authenticated USING (true) WITH CHECK (true);
