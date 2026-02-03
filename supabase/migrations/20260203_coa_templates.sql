-- ============================================================================
-- CHART OF ACCOUNTS TEMPLATES
-- ============================================================================
-- This migration adds:
-- 1. COA Templates table
-- 2. COA Template Accounts table
-- 3. Real Estate Development template with 85 standard accounts
-- 4. Function to initialize entity COA from template
-- ============================================================================

-- =============================================
-- COA TEMPLATES TABLE
-- =============================================
ALTER TABLE coa_templates ADD COLUMN IF NOT EXISTS template_name VARCHAR(100);
ALTER TABLE coa_templates ADD COLUMN IF NOT EXISTS template_type TEXT;
ALTER TABLE coa_templates ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- =============================================
-- COA TEMPLATE ACCOUNTS TABLE
-- =============================================
ALTER TABLE coa_template_accounts ADD COLUMN IF NOT EXISTS account_name VARCHAR(100);
ALTER TABLE coa_template_accounts ADD COLUMN IF NOT EXISTS account_subtype VARCHAR(50);
ALTER TABLE coa_template_accounts ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE coa_template_accounts ADD COLUMN IF NOT EXISTS is_system_account BOOLEAN DEFAULT false;

-- =============================================
-- INSERT REAL ESTATE DEVELOPMENT TEMPLATE
-- =============================================
INSERT INTO coa_templates (name, template_name, template_type, description)
SELECT 'Real Estate Development', 'Real Estate Development', 'real_estate_development', 'Standard chart of accounts for real estate development SPEs'
WHERE NOT EXISTS (SELECT 1 FROM coa_templates WHERE template_type = 'real_estate_development');

-- =============================================
-- TEMPLATE ACCOUNTS - ASSETS (1000-1999)
-- =============================================
INSERT INTO coa_template_accounts (template_id, account_number, name, account_name, account_type, account_subtype, normal_balance)
SELECT t.id, a.account_number, a.account_name, a.account_name, a.account_type, a.account_subtype, a.normal_balance
FROM coa_templates t
CROSS JOIN (VALUES
  ('1000', 'Cash & Cash Equivalents', 'asset', 'cash', 'debit'),
  ('1010', 'Operating Cash', 'asset', 'cash', 'debit'),
  ('1020', 'Construction Escrow', 'asset', 'cash', 'debit'),
  ('1030', 'Reserve Account', 'asset', 'cash', 'debit'),
  ('1100', 'Accounts Receivable', 'asset', 'receivable', 'debit'),
  ('1110', 'A/R - Lot Sales', 'asset', 'receivable', 'debit'),
  ('1120', 'A/R - Home Sales', 'asset', 'receivable', 'debit'),
  ('1130', 'A/R - Other', 'asset', 'receivable', 'debit'),
  ('1200', 'Inventory - Lots', 'asset', 'inventory', 'debit'),
  ('1210', 'Finished Lots', 'asset', 'inventory', 'debit'),
  ('1220', 'Lots Under Development', 'asset', 'inventory', 'debit'),
  ('1300', 'Construction in Progress', 'asset', 'cip', 'debit'),
  ('1310', 'CIP - Land Costs', 'asset', 'cip', 'debit'),
  ('1320', 'CIP - Soft Costs', 'asset', 'cip', 'debit'),
  ('1330', 'CIP - Hard Costs', 'asset', 'cip', 'debit'),
  ('1340', 'CIP - Financing Costs', 'asset', 'cip', 'debit'),
  ('1400', 'Land & Land Improvements', 'asset', 'land', 'debit'),
  ('1500', 'Fixed Assets', 'asset', 'fixed', 'debit'),
  ('1600', 'Accumulated Depreciation', 'asset', 'contra', 'credit'),
  ('1800', 'Due From Related Entities', 'asset', 'intercompany', 'debit')
) AS a(account_number, account_name, account_type, account_subtype, normal_balance)
WHERE t.template_type = 'real_estate_development'
AND NOT EXISTS (SELECT 1 FROM coa_template_accounts WHERE template_id = t.id AND account_number = a.account_number);

-- =============================================
-- TEMPLATE ACCOUNTS - LIABILITIES (2000-2999)
-- =============================================
INSERT INTO coa_template_accounts (template_id, account_number, name, account_name, account_type, account_subtype, normal_balance)
SELECT t.id, a.account_number, a.account_name, a.account_name, a.account_type, a.account_subtype, a.normal_balance
FROM coa_templates t
CROSS JOIN (VALUES
  ('2000', 'Accounts Payable', 'liability', 'payable', 'credit'),
  ('2100', 'Accrued Expenses', 'liability', 'accrued', 'credit'),
  ('2110', 'Accrued Interest', 'liability', 'accrued', 'credit'),
  ('2120', 'Accrued Property Taxes', 'liability', 'accrued', 'credit'),
  ('2200', 'Construction Loan', 'liability', 'debt', 'credit'),
  ('2300', 'Acquisition/Development Loan', 'liability', 'debt', 'credit'),
  ('2400', 'Permanent Financing', 'liability', 'debt', 'credit'),
  ('2500', 'Investor Notes Payable', 'liability', 'debt', 'credit'),
  ('2600', 'Due To Related Entities', 'liability', 'intercompany', 'credit'),
  ('2700', 'Other Liabilities', 'liability', 'other', 'credit'),
  ('2710', 'Customer Deposits', 'liability', 'other', 'credit')
) AS a(account_number, account_name, account_type, account_subtype, normal_balance)
WHERE t.template_type = 'real_estate_development'
AND NOT EXISTS (SELECT 1 FROM coa_template_accounts WHERE template_id = t.id AND account_number = a.account_number);

-- =============================================
-- TEMPLATE ACCOUNTS - EQUITY & REVENUE (3000-4999)
-- =============================================
INSERT INTO coa_template_accounts (template_id, account_number, name, account_name, account_type, account_subtype, normal_balance)
SELECT t.id, a.account_number, a.account_name, a.account_name, a.account_type, a.account_subtype, a.normal_balance
FROM coa_templates t
CROSS JOIN (VALUES
  ('3000', 'Member Capital', 'equity', 'capital', 'credit'),
  ('3010', 'Managing Member Capital', 'equity', 'capital', 'credit'),
  ('3020', 'Class A Member Capital', 'equity', 'capital', 'credit'),
  ('3030', 'Class B Member Capital', 'equity', 'capital', 'credit'),
  ('3100', 'Investor Capital', 'equity', 'capital', 'credit'),
  ('3200', 'Preferred Returns Payable', 'equity', 'returns', 'credit'),
  ('3300', 'Retained Earnings', 'equity', 'retained', 'credit'),
  ('3400', 'Distributions', 'equity', 'distributions', 'debit'),
  ('3500', 'Current Year Earnings', 'equity', 'current', 'credit'),
  ('4000', 'Lot Sales Revenue', 'revenue', 'sales', 'credit'),
  ('4100', 'Home Sales Revenue', 'revenue', 'sales', 'credit'),
  ('4200', 'Rental Income', 'revenue', 'rental', 'credit'),
  ('4300', 'Assignment Fees', 'revenue', 'fees', 'credit'),
  ('4400', 'Management Fees', 'revenue', 'fees', 'credit'),
  ('4500', 'Development Fees', 'revenue', 'fees', 'credit'),
  ('4600', 'Other Income', 'revenue', 'other', 'credit')
) AS a(account_number, account_name, account_type, account_subtype, normal_balance)
WHERE t.template_type = 'real_estate_development'
AND NOT EXISTS (SELECT 1 FROM coa_template_accounts WHERE template_id = t.id AND account_number = a.account_number);

-- =============================================
-- TEMPLATE ACCOUNTS - COGS (5000-5999)
-- =============================================
INSERT INTO coa_template_accounts (template_id, account_number, name, account_name, account_type, account_subtype, normal_balance)
SELECT t.id, a.account_number, a.account_name, a.account_name, a.account_type, a.account_subtype, a.normal_balance
FROM coa_templates t
CROSS JOIN (VALUES
  ('5000', 'Land Costs', 'cogs', 'land', 'debit'),
  ('5010', 'Land Purchase Price', 'cogs', 'land', 'debit'),
  ('5020', 'Closing Costs - Land', 'cogs', 'land', 'debit'),
  ('5100', 'Site Development Costs', 'cogs', 'horizontal', 'debit'),
  ('5110', 'Clearing & Grading', 'cogs', 'horizontal', 'debit'),
  ('5120', 'Utilities Installation', 'cogs', 'horizontal', 'debit'),
  ('5130', 'Roads & Paving', 'cogs', 'horizontal', 'debit'),
  ('5140', 'Stormwater Management', 'cogs', 'horizontal', 'debit'),
  ('5200', 'Horizontal Improvements', 'cogs', 'horizontal', 'debit'),
  ('5300', 'Vertical Construction', 'cogs', 'vertical', 'debit'),
  ('5400', 'Soft Costs', 'cogs', 'soft', 'debit'),
  ('5410', 'Architecture & Engineering', 'cogs', 'soft', 'debit'),
  ('5420', 'Legal Fees', 'cogs', 'soft', 'debit'),
  ('5430', 'Permits & Fees', 'cogs', 'soft', 'debit'),
  ('5440', 'Surveying', 'cogs', 'soft', 'debit'),
  ('5450', 'Environmental', 'cogs', 'soft', 'debit'),
  ('5500', 'Financing Costs (Capitalized)', 'cogs', 'financing', 'debit'),
  ('5510', 'Loan Origination Fees', 'cogs', 'financing', 'debit'),
  ('5520', 'Construction Interest', 'cogs', 'financing', 'debit'),
  ('5600', 'Sales Commissions', 'cogs', 'selling', 'debit'),
  ('5700', 'Closing Costs - Sales', 'cogs', 'selling', 'debit')
) AS a(account_number, account_name, account_type, account_subtype, normal_balance)
WHERE t.template_type = 'real_estate_development'
AND NOT EXISTS (SELECT 1 FROM coa_template_accounts WHERE template_id = t.id AND account_number = a.account_number);

-- =============================================
-- TEMPLATE ACCOUNTS - OPERATING EXPENSES (6000-7999)
-- =============================================
INSERT INTO coa_template_accounts (template_id, account_number, name, account_name, account_type, account_subtype, normal_balance)
SELECT t.id, a.account_number, a.account_name, a.account_name, a.account_type, a.account_subtype, a.normal_balance
FROM coa_templates t
CROSS JOIN (VALUES
  ('6000', 'Payroll & Benefits', 'expense', 'payroll', 'debit'),
  ('6100', 'Professional Services', 'expense', 'professional', 'debit'),
  ('6110', 'Accounting Fees', 'expense', 'professional', 'debit'),
  ('6120', 'Legal Fees - Operating', 'expense', 'professional', 'debit'),
  ('6130', 'Consulting Fees', 'expense', 'professional', 'debit'),
  ('6200', 'Office & Administrative', 'expense', 'office', 'debit'),
  ('6300', 'Marketing & Advertising', 'expense', 'marketing', 'debit'),
  ('6400', 'Insurance', 'expense', 'insurance', 'debit'),
  ('6500', 'Property Taxes', 'expense', 'taxes', 'debit'),
  ('6600', 'Repairs & Maintenance', 'expense', 'maintenance', 'debit'),
  ('6700', 'Utilities', 'expense', 'utilities', 'debit'),
  ('6800', 'Travel & Entertainment', 'expense', 'travel', 'debit'),
  ('6900', 'Miscellaneous Expenses', 'expense', 'other', 'debit'),
  ('7000', 'Interest Income', 'other_income', 'interest', 'credit'),
  ('7100', 'Interest Expense', 'other_expense', 'interest', 'debit'),
  ('7200', 'Gain/Loss on Sale', 'other_income', 'gain_loss', 'credit'),
  ('7300', 'Other Non-Operating Items', 'other_expense', 'other', 'debit')
) AS a(account_number, account_name, account_type, account_subtype, normal_balance)
WHERE t.template_type = 'real_estate_development'
AND NOT EXISTS (SELECT 1 FROM coa_template_accounts WHERE template_id = t.id AND account_number = a.account_number);

-- =============================================
-- FUNCTION TO INITIALIZE COA FROM TEMPLATE
-- =============================================
CREATE OR REPLACE FUNCTION initialize_coa_from_template(
  p_entity_id UUID,
  p_template_type TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_template_id UUID;
  v_count INTEGER := 0;
  v_account RECORD;
BEGIN
  -- Get template
  SELECT id INTO v_template_id FROM coa_templates WHERE template_type = p_template_type LIMIT 1;

  IF v_template_id IS NULL THEN
    RAISE EXCEPTION 'Template not found: %', p_template_type;
  END IF;

  -- Check if entity already has accounts
  IF EXISTS (SELECT 1 FROM chart_of_accounts WHERE entity_id = p_entity_id LIMIT 1) THEN
    RAISE EXCEPTION 'Entity already has chart of accounts';
  END IF;

  -- Insert accounts from template
  FOR v_account IN
    SELECT * FROM coa_template_accounts WHERE template_id = v_template_id ORDER BY account_number
  LOOP
    INSERT INTO chart_of_accounts (
      entity_id, account_number, account_name, account_type, account_subtype,
      description, normal_balance, is_system_account
    ) VALUES (
      p_entity_id, v_account.account_number, COALESCE(v_account.account_name, v_account.name), v_account.account_type,
      v_account.account_subtype, v_account.description, v_account.normal_balance, COALESCE(v_account.is_system_account, false)
    );
    v_count := v_count + 1;
  END LOOP;

  -- Set parent relationships
  UPDATE chart_of_accounts c
  SET parent_account_id = p.id
  FROM coa_template_accounts t
  JOIN chart_of_accounts p ON p.entity_id = p_entity_id AND p.account_number = t.parent_account_number
  WHERE c.entity_id = p_entity_id
    AND c.account_number = t.account_number
    AND t.parent_account_number IS NOT NULL;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;
