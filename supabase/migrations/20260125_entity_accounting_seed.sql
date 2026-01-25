-- ============================================================================
-- CHART OF ACCOUNTS SEED DATA - DEFAULT TEMPLATES
-- ============================================================================
-- 8 Default Templates:
-- 1. Holding Company - General
-- 2. Operating Company - General
-- 3. SPE - Lot Development
-- 4. SPE - BTR (Build-to-Rent)
-- 5. SPE - Fix & Flip
-- 6. SPE - Spec Build
-- 7. SPE - Community Development
-- 8. SPE - General
-- ============================================================================

-- ============================================================================
-- TEMPLATE 1: HOLDING COMPANY - GENERAL
-- ============================================================================
INSERT INTO coa_templates (id, name, description, entity_purpose, project_type, is_default, is_system)
VALUES (
  '10000000-0000-0000-0001-000000000001',
  'Holding Company - Standard',
  'Standard chart of accounts for holding companies managing investments and subsidiaries',
  'holding_company',
  NULL,
  true,
  true
) ON CONFLICT DO NOTHING;

-- Holding Company Accounts
INSERT INTO coa_template_accounts (template_id, account_number, account_name, account_type, sub_type, is_header, normal_balance, display_order, is_required) VALUES
-- Assets
('10000000-0000-0000-0001-000000000001', '1000', 'ASSETS', 'asset', NULL, true, 'debit', 1, true),
('10000000-0000-0000-0001-000000000001', '1100', 'Cash and Cash Equivalents', 'asset', 'current_asset', true, 'debit', 10, true),
('10000000-0000-0000-0001-000000000001', '1110', 'Operating Cash', 'asset', 'current_asset', false, 'debit', 11, true),
('10000000-0000-0000-0001-000000000001', '1120', 'Reserve Account', 'asset', 'current_asset', false, 'debit', 12, false),
('10000000-0000-0000-0001-000000000001', '1130', 'Money Market Account', 'asset', 'current_asset', false, 'debit', 13, false),
('10000000-0000-0000-0001-000000000001', '1200', 'Investments in Subsidiaries', 'asset', 'investment', true, 'debit', 20, true),
('10000000-0000-0000-0001-000000000001', '1210', 'Equity Investments', 'asset', 'investment', false, 'debit', 21, true),
('10000000-0000-0000-0001-000000000001', '1220', 'Debt Investments', 'asset', 'investment', false, 'debit', 22, false),
('10000000-0000-0000-0001-000000000001', '1300', 'Intercompany Receivables', 'asset', 'current_asset', true, 'debit', 30, true),
('10000000-0000-0000-0001-000000000001', '1310', 'Due from Subsidiaries', 'asset', 'current_asset', false, 'debit', 31, true),
('10000000-0000-0000-0001-000000000001', '1400', 'Other Assets', 'asset', 'other_asset', true, 'debit', 40, false),
('10000000-0000-0000-0001-000000000001', '1410', 'Prepaid Expenses', 'asset', 'current_asset', false, 'debit', 41, false),
('10000000-0000-0000-0001-000000000001', '1420', 'Security Deposits', 'asset', 'other_asset', false, 'debit', 42, false),
-- Liabilities
('10000000-0000-0000-0001-000000000001', '2000', 'LIABILITIES', 'liability', NULL, true, 'credit', 100, true),
('10000000-0000-0000-0001-000000000001', '2100', 'Accounts Payable', 'liability', 'current_liability', true, 'credit', 110, true),
('10000000-0000-0000-0001-000000000001', '2110', 'Trade Payables', 'liability', 'current_liability', false, 'credit', 111, true),
('10000000-0000-0000-0001-000000000001', '2200', 'Intercompany Payables', 'liability', 'current_liability', true, 'credit', 120, true),
('10000000-0000-0000-0001-000000000001', '2210', 'Due to Subsidiaries', 'liability', 'current_liability', false, 'credit', 121, true),
('10000000-0000-0000-0001-000000000001', '2300', 'Notes Payable', 'liability', 'long_term_liability', true, 'credit', 130, false),
('10000000-0000-0000-0001-000000000001', '2310', 'Bank Lines of Credit', 'liability', 'current_liability', false, 'credit', 131, false),
('10000000-0000-0000-0001-000000000001', '2320', 'Long-term Debt', 'liability', 'long_term_liability', false, 'credit', 132, false),
('10000000-0000-0000-0001-000000000001', '2400', 'Accrued Liabilities', 'liability', 'current_liability', true, 'credit', 140, false),
('10000000-0000-0000-0001-000000000001', '2410', 'Accrued Interest', 'liability', 'current_liability', false, 'credit', 141, false),
-- Equity
('10000000-0000-0000-0001-000000000001', '3000', 'EQUITY', 'equity', NULL, true, 'credit', 200, true),
('10000000-0000-0000-0001-000000000001', '3100', 'Member/Shareholder Capital', 'equity', 'contributed_capital', true, 'credit', 210, true),
('10000000-0000-0000-0001-000000000001', '3110', 'Member Contributions', 'equity', 'contributed_capital', false, 'credit', 211, true),
('10000000-0000-0000-0001-000000000001', '3120', 'Member Distributions', 'equity', 'distributions', false, 'debit', 212, true),
('10000000-0000-0000-0001-000000000001', '3200', 'Retained Earnings', 'equity', 'retained_earnings', false, 'credit', 220, true),
('10000000-0000-0000-0001-000000000001', '3300', 'Current Year Earnings', 'equity', 'current_earnings', false, 'credit', 230, true),
-- Revenue
('10000000-0000-0000-0001-000000000001', '4000', 'REVENUE', 'revenue', NULL, true, 'credit', 300, true),
('10000000-0000-0000-0001-000000000001', '4100', 'Dividend Income', 'revenue', 'investment_income', false, 'credit', 310, true),
('10000000-0000-0000-0001-000000000001', '4200', 'Interest Income', 'revenue', 'investment_income', false, 'credit', 320, true),
('10000000-0000-0000-0001-000000000001', '4300', 'Management Fee Income', 'revenue', 'fee_income', false, 'credit', 330, false),
('10000000-0000-0000-0001-000000000001', '4400', 'Gain on Investment Sale', 'revenue', 'gain_loss', false, 'credit', 340, false),
-- Operating Expenses
('10000000-0000-0000-0001-000000000001', '6000', 'OPERATING EXPENSES', 'expense', NULL, true, 'debit', 400, true),
('10000000-0000-0000-0001-000000000001', '6100', 'Professional Services', 'expense', 'professional', true, 'debit', 410, true),
('10000000-0000-0000-0001-000000000001', '6110', 'Legal Fees', 'expense', 'professional', false, 'debit', 411, true),
('10000000-0000-0000-0001-000000000001', '6120', 'Accounting Fees', 'expense', 'professional', false, 'debit', 412, true),
('10000000-0000-0000-0001-000000000001', '6130', 'Tax Preparation', 'expense', 'professional', false, 'debit', 413, false),
('10000000-0000-0000-0001-000000000001', '6200', 'Administrative Expenses', 'expense', 'administrative', true, 'debit', 420, true),
('10000000-0000-0000-0001-000000000001', '6210', 'Office Supplies', 'expense', 'administrative', false, 'debit', 421, false),
('10000000-0000-0000-0001-000000000001', '6220', 'Bank Fees', 'expense', 'administrative', false, 'debit', 422, true),
('10000000-0000-0000-0001-000000000001', '6230', 'State Filing Fees', 'expense', 'administrative', false, 'debit', 423, true),
('10000000-0000-0000-0001-000000000001', '6300', 'Insurance', 'expense', 'insurance', false, 'debit', 430, false),
('10000000-0000-0000-0001-000000000001', '6400', 'Interest Expense', 'expense', 'interest', false, 'debit', 440, false)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TEMPLATE 2: OPERATING COMPANY - GENERAL
-- ============================================================================
INSERT INTO coa_templates (id, name, description, entity_purpose, project_type, is_default, is_system)
VALUES (
  '10000000-0000-0000-0001-000000000002',
  'Operating Company - Standard',
  'Standard chart of accounts for operating companies with multiple revenue streams',
  'operating_company',
  NULL,
  true,
  true
) ON CONFLICT DO NOTHING;

-- Operating Company Accounts
INSERT INTO coa_template_accounts (template_id, account_number, account_name, account_type, sub_type, is_header, normal_balance, display_order, is_required) VALUES
-- Assets
('10000000-0000-0000-0001-000000000002', '1000', 'ASSETS', 'asset', NULL, true, 'debit', 1, true),
('10000000-0000-0000-0001-000000000002', '1100', 'Cash and Cash Equivalents', 'asset', 'current_asset', true, 'debit', 10, true),
('10000000-0000-0000-0001-000000000002', '1110', 'Operating Cash', 'asset', 'current_asset', false, 'debit', 11, true),
('10000000-0000-0000-0001-000000000002', '1120', 'Payroll Account', 'asset', 'current_asset', false, 'debit', 12, false),
('10000000-0000-0000-0001-000000000002', '1130', 'Savings Account', 'asset', 'current_asset', false, 'debit', 13, false),
('10000000-0000-0000-0001-000000000002', '1200', 'Accounts Receivable', 'asset', 'current_asset', true, 'debit', 20, true),
('10000000-0000-0000-0001-000000000002', '1210', 'Trade Receivables', 'asset', 'current_asset', false, 'debit', 21, true),
('10000000-0000-0000-0001-000000000002', '1220', 'Intercompany Receivables', 'asset', 'current_asset', false, 'debit', 22, true),
('10000000-0000-0000-0001-000000000002', '1230', 'Allowance for Doubtful Accounts', 'asset', 'current_asset', false, 'credit', 23, false),
('10000000-0000-0000-0001-000000000002', '1300', 'Inventory', 'asset', 'current_asset', true, 'debit', 30, false),
('10000000-0000-0000-0001-000000000002', '1310', 'Raw Materials', 'asset', 'current_asset', false, 'debit', 31, false),
('10000000-0000-0000-0001-000000000002', '1320', 'Work in Progress', 'asset', 'current_asset', false, 'debit', 32, false),
('10000000-0000-0000-0001-000000000002', '1330', 'Finished Goods', 'asset', 'current_asset', false, 'debit', 33, false),
('10000000-0000-0000-0001-000000000002', '1400', 'Prepaid Expenses', 'asset', 'current_asset', true, 'debit', 40, true),
('10000000-0000-0000-0001-000000000002', '1410', 'Prepaid Insurance', 'asset', 'current_asset', false, 'debit', 41, false),
('10000000-0000-0000-0001-000000000002', '1420', 'Prepaid Rent', 'asset', 'current_asset', false, 'debit', 42, false),
('10000000-0000-0000-0001-000000000002', '1500', 'Fixed Assets', 'asset', 'fixed_asset', true, 'debit', 50, true),
('10000000-0000-0000-0001-000000000002', '1510', 'Vehicles', 'asset', 'fixed_asset', false, 'debit', 51, false),
('10000000-0000-0000-0001-000000000002', '1520', 'Equipment', 'asset', 'fixed_asset', false, 'debit', 52, false),
('10000000-0000-0000-0001-000000000002', '1530', 'Furniture & Fixtures', 'asset', 'fixed_asset', false, 'debit', 53, false),
('10000000-0000-0000-0001-000000000002', '1540', 'Leasehold Improvements', 'asset', 'fixed_asset', false, 'debit', 54, false),
('10000000-0000-0000-0001-000000000002', '1590', 'Accumulated Depreciation', 'asset', 'fixed_asset', false, 'credit', 59, true),
-- Liabilities
('10000000-0000-0000-0001-000000000002', '2000', 'LIABILITIES', 'liability', NULL, true, 'credit', 100, true),
('10000000-0000-0000-0001-000000000002', '2100', 'Accounts Payable', 'liability', 'current_liability', true, 'credit', 110, true),
('10000000-0000-0000-0001-000000000002', '2110', 'Trade Payables', 'liability', 'current_liability', false, 'credit', 111, true),
('10000000-0000-0000-0001-000000000002', '2120', 'Intercompany Payables', 'liability', 'current_liability', false, 'credit', 112, true),
('10000000-0000-0000-0001-000000000002', '2200', 'Accrued Liabilities', 'liability', 'current_liability', true, 'credit', 120, true),
('10000000-0000-0000-0001-000000000002', '2210', 'Accrued Wages', 'liability', 'current_liability', false, 'credit', 121, false),
('10000000-0000-0000-0001-000000000002', '2220', 'Accrued Payroll Taxes', 'liability', 'current_liability', false, 'credit', 122, false),
('10000000-0000-0000-0001-000000000002', '2230', 'Accrued Interest', 'liability', 'current_liability', false, 'credit', 123, false),
('10000000-0000-0000-0001-000000000002', '2300', 'Credit Cards Payable', 'liability', 'current_liability', false, 'credit', 130, false),
('10000000-0000-0000-0001-000000000002', '2400', 'Notes Payable - Current', 'liability', 'current_liability', false, 'credit', 140, false),
('10000000-0000-0000-0001-000000000002', '2500', 'Long-term Debt', 'liability', 'long_term_liability', true, 'credit', 150, false),
('10000000-0000-0000-0001-000000000002', '2510', 'Bank Loans', 'liability', 'long_term_liability', false, 'credit', 151, false),
('10000000-0000-0000-0001-000000000002', '2520', 'Equipment Loans', 'liability', 'long_term_liability', false, 'credit', 152, false),
-- Equity
('10000000-0000-0000-0001-000000000002', '3000', 'EQUITY', 'equity', NULL, true, 'credit', 200, true),
('10000000-0000-0000-0001-000000000002', '3100', 'Owner/Member Capital', 'equity', 'contributed_capital', true, 'credit', 210, true),
('10000000-0000-0000-0001-000000000002', '3110', 'Capital Contributions', 'equity', 'contributed_capital', false, 'credit', 211, true),
('10000000-0000-0000-0001-000000000002', '3120', 'Owner Distributions', 'equity', 'distributions', false, 'debit', 212, true),
('10000000-0000-0000-0001-000000000002', '3200', 'Retained Earnings', 'equity', 'retained_earnings', false, 'credit', 220, true),
('10000000-0000-0000-0001-000000000002', '3300', 'Current Year Earnings', 'equity', 'current_earnings', false, 'credit', 230, true),
-- Revenue
('10000000-0000-0000-0001-000000000002', '4000', 'REVENUE', 'revenue', NULL, true, 'credit', 300, true),
('10000000-0000-0000-0001-000000000002', '4100', 'Service Revenue', 'revenue', 'operating_revenue', false, 'credit', 310, true),
('10000000-0000-0000-0001-000000000002', '4200', 'Product Revenue', 'revenue', 'operating_revenue', false, 'credit', 320, false),
('10000000-0000-0000-0001-000000000002', '4300', 'Management Fee Revenue', 'revenue', 'fee_income', false, 'credit', 330, false),
('10000000-0000-0000-0001-000000000002', '4900', 'Other Income', 'revenue', 'other_income', false, 'credit', 390, false),
-- COGS
('10000000-0000-0000-0001-000000000002', '5000', 'COST OF GOODS SOLD', 'cogs', NULL, true, 'debit', 350, false),
('10000000-0000-0000-0001-000000000002', '5100', 'Direct Labor', 'cogs', 'direct_cost', false, 'debit', 351, false),
('10000000-0000-0000-0001-000000000002', '5200', 'Direct Materials', 'cogs', 'direct_cost', false, 'debit', 352, false),
('10000000-0000-0000-0001-000000000002', '5300', 'Subcontractor Costs', 'cogs', 'direct_cost', false, 'debit', 353, false),
-- Operating Expenses
('10000000-0000-0000-0001-000000000002', '6000', 'OPERATING EXPENSES', 'expense', NULL, true, 'debit', 400, true),
('10000000-0000-0000-0001-000000000002', '6100', 'Payroll Expenses', 'expense', 'payroll', true, 'debit', 410, true),
('10000000-0000-0000-0001-000000000002', '6110', 'Salaries & Wages', 'expense', 'payroll', false, 'debit', 411, true),
('10000000-0000-0000-0001-000000000002', '6120', 'Payroll Taxes', 'expense', 'payroll', false, 'debit', 412, true),
('10000000-0000-0000-0001-000000000002', '6130', 'Employee Benefits', 'expense', 'payroll', false, 'debit', 413, false),
('10000000-0000-0000-0001-000000000002', '6200', 'Rent & Occupancy', 'expense', 'occupancy', true, 'debit', 420, false),
('10000000-0000-0000-0001-000000000002', '6210', 'Rent', 'expense', 'occupancy', false, 'debit', 421, false),
('10000000-0000-0000-0001-000000000002', '6220', 'Utilities', 'expense', 'occupancy', false, 'debit', 422, false),
('10000000-0000-0000-0001-000000000002', '6300', 'Professional Services', 'expense', 'professional', true, 'debit', 430, true),
('10000000-0000-0000-0001-000000000002', '6310', 'Legal Fees', 'expense', 'professional', false, 'debit', 431, true),
('10000000-0000-0000-0001-000000000002', '6320', 'Accounting Fees', 'expense', 'professional', false, 'debit', 432, true),
('10000000-0000-0000-0001-000000000002', '6330', 'Consulting Fees', 'expense', 'professional', false, 'debit', 433, false),
('10000000-0000-0000-0001-000000000002', '6400', 'Marketing & Advertising', 'expense', 'marketing', true, 'debit', 440, false),
('10000000-0000-0000-0001-000000000002', '6410', 'Advertising', 'expense', 'marketing', false, 'debit', 441, false),
('10000000-0000-0000-0001-000000000002', '6420', 'Website & Online Marketing', 'expense', 'marketing', false, 'debit', 442, false),
('10000000-0000-0000-0001-000000000002', '6500', 'Insurance', 'expense', 'insurance', false, 'debit', 450, true),
('10000000-0000-0000-0001-000000000002', '6600', 'Depreciation', 'expense', 'depreciation', false, 'debit', 460, true),
('10000000-0000-0000-0001-000000000002', '6700', 'Office & Admin', 'expense', 'administrative', true, 'debit', 470, true),
('10000000-0000-0000-0001-000000000002', '6710', 'Office Supplies', 'expense', 'administrative', false, 'debit', 471, false),
('10000000-0000-0000-0001-000000000002', '6720', 'Software & Subscriptions', 'expense', 'administrative', false, 'debit', 472, false),
('10000000-0000-0000-0001-000000000002', '6730', 'Bank & Merchant Fees', 'expense', 'administrative', false, 'debit', 473, true),
('10000000-0000-0000-0001-000000000002', '6800', 'Travel & Entertainment', 'expense', 'travel', true, 'debit', 480, false),
('10000000-0000-0000-0001-000000000002', '6810', 'Travel', 'expense', 'travel', false, 'debit', 481, false),
('10000000-0000-0000-0001-000000000002', '6820', 'Meals & Entertainment', 'expense', 'travel', false, 'debit', 482, false),
-- Other Income/Expense
('10000000-0000-0000-0001-000000000002', '7000', 'OTHER INCOME/EXPENSE', 'other_expense', NULL, true, 'debit', 500, true),
('10000000-0000-0000-0001-000000000002', '7100', 'Interest Income', 'other_income', NULL, false, 'credit', 510, false),
('10000000-0000-0000-0001-000000000002', '7200', 'Interest Expense', 'other_expense', NULL, false, 'debit', 520, true),
('10000000-0000-0000-0001-000000000002', '7300', 'Gain/Loss on Asset Sale', 'other_expense', NULL, false, 'debit', 530, false)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TEMPLATE 3: SPE - LOT DEVELOPMENT
-- ============================================================================
INSERT INTO coa_templates (id, name, description, entity_purpose, project_type, is_default, is_system)
VALUES (
  '10000000-0000-0000-0001-000000000003',
  'SPE - Lot Development',
  'Chart of accounts for single-purpose entities focused on lot development and sales',
  'spe',
  'lot_development',
  true,
  true
) ON CONFLICT DO NOTHING;

-- Lot Development Accounts
INSERT INTO coa_template_accounts (template_id, account_number, account_name, account_type, sub_type, is_header, normal_balance, display_order, is_required) VALUES
-- Assets
('10000000-0000-0000-0001-000000000003', '1000', 'ASSETS', 'asset', NULL, true, 'debit', 1, true),
('10000000-0000-0000-0001-000000000003', '1100', 'Cash and Cash Equivalents', 'asset', 'current_asset', true, 'debit', 10, true),
('10000000-0000-0000-0001-000000000003', '1110', 'Operating Cash', 'asset', 'current_asset', false, 'debit', 11, true),
('10000000-0000-0000-0001-000000000003', '1120', 'Construction Escrow', 'asset', 'current_asset', false, 'debit', 12, false),
('10000000-0000-0000-0001-000000000003', '1200', 'Receivables', 'asset', 'current_asset', true, 'debit', 20, true),
('10000000-0000-0000-0001-000000000003', '1210', 'Lot Sale Receivables', 'asset', 'current_asset', false, 'debit', 21, true),
('10000000-0000-0000-0001-000000000003', '1220', 'Intercompany Receivables', 'asset', 'current_asset', false, 'debit', 22, true),
('10000000-0000-0000-0001-000000000003', '1300', 'Land and Development', 'asset', 'inventory', true, 'debit', 30, true),
('10000000-0000-0000-0001-000000000003', '1310', 'Land Acquisition Cost', 'asset', 'inventory', false, 'debit', 31, true),
('10000000-0000-0000-0001-000000000003', '1320', 'Due Diligence Costs', 'asset', 'inventory', false, 'debit', 32, true),
('10000000-0000-0000-0001-000000000003', '1330', 'Entitlement Costs', 'asset', 'inventory', false, 'debit', 33, true),
('10000000-0000-0000-0001-000000000003', '1340', 'Engineering & Surveying', 'asset', 'inventory', false, 'debit', 34, true),
('10000000-0000-0000-0001-000000000003', '1350', 'Impact & Permit Fees', 'asset', 'inventory', false, 'debit', 35, true),
('10000000-0000-0000-0001-000000000003', '1360', 'Site Development - Civil', 'asset', 'inventory', false, 'debit', 36, true),
('10000000-0000-0000-0001-000000000003', '1370', 'Site Development - Utilities', 'asset', 'inventory', false, 'debit', 37, true),
('10000000-0000-0000-0001-000000000003', '1380', 'Landscaping & Common Areas', 'asset', 'inventory', false, 'debit', 38, false),
('10000000-0000-0000-0001-000000000003', '1390', 'Capitalized Interest', 'asset', 'inventory', false, 'debit', 39, true),
('10000000-0000-0000-0001-000000000003', '1400', 'Developed Lots Inventory', 'asset', 'inventory', true, 'debit', 40, true),
('10000000-0000-0000-0001-000000000003', '1410', 'Finished Lots - Available', 'asset', 'inventory', false, 'debit', 41, true),
('10000000-0000-0000-0001-000000000003', '1420', 'Lots Under Contract', 'asset', 'inventory', false, 'debit', 42, false),
-- Liabilities
('10000000-0000-0000-0001-000000000003', '2000', 'LIABILITIES', 'liability', NULL, true, 'credit', 100, true),
('10000000-0000-0000-0001-000000000003', '2100', 'Accounts Payable', 'liability', 'current_liability', true, 'credit', 110, true),
('10000000-0000-0000-0001-000000000003', '2110', 'Trade Payables', 'liability', 'current_liability', false, 'credit', 111, true),
('10000000-0000-0000-0001-000000000003', '2120', 'Retainage Payable', 'liability', 'current_liability', false, 'credit', 112, true),
('10000000-0000-0000-0001-000000000003', '2130', 'Intercompany Payables', 'liability', 'current_liability', false, 'credit', 113, true),
('10000000-0000-0000-0001-000000000003', '2200', 'Accrued Liabilities', 'liability', 'current_liability', true, 'credit', 120, true),
('10000000-0000-0000-0001-000000000003', '2210', 'Accrued Interest', 'liability', 'current_liability', false, 'credit', 121, true),
('10000000-0000-0000-0001-000000000003', '2220', 'Accrued Property Taxes', 'liability', 'current_liability', false, 'credit', 122, false),
('10000000-0000-0000-0001-000000000003', '2300', 'Construction Loans', 'liability', 'long_term_liability', true, 'credit', 130, true),
('10000000-0000-0000-0001-000000000003', '2310', 'Acquisition Loan', 'liability', 'long_term_liability', false, 'credit', 131, true),
('10000000-0000-0000-0001-000000000003', '2320', 'Development Loan', 'liability', 'long_term_liability', false, 'credit', 132, true),
('10000000-0000-0000-0001-000000000003', '2400', 'Deposits & Earnest Money', 'liability', 'current_liability', false, 'credit', 140, true),
-- Equity
('10000000-0000-0000-0001-000000000003', '3000', 'EQUITY', 'equity', NULL, true, 'credit', 200, true),
('10000000-0000-0000-0001-000000000003', '3100', 'Member Capital', 'equity', 'contributed_capital', true, 'credit', 210, true),
('10000000-0000-0000-0001-000000000003', '3110', 'Member Contributions', 'equity', 'contributed_capital', false, 'credit', 211, true),
('10000000-0000-0000-0001-000000000003', '3120', 'Member Distributions', 'equity', 'distributions', false, 'debit', 212, true),
('10000000-0000-0000-0001-000000000003', '3200', 'Retained Earnings', 'equity', 'retained_earnings', false, 'credit', 220, true),
('10000000-0000-0000-0001-000000000003', '3300', 'Current Year Earnings', 'equity', 'current_earnings', false, 'credit', 230, true),
-- Revenue
('10000000-0000-0000-0001-000000000003', '4000', 'REVENUE', 'revenue', NULL, true, 'credit', 300, true),
('10000000-0000-0000-0001-000000000003', '4100', 'Lot Sales Revenue', 'revenue', 'lot_sales', false, 'credit', 310, true),
('10000000-0000-0000-0001-000000000003', '4200', 'Builder Fee Income', 'revenue', 'fee_income', false, 'credit', 320, false),
('10000000-0000-0000-0001-000000000003', '4300', 'Option Fee Income', 'revenue', 'fee_income', false, 'credit', 330, false),
-- COGS
('10000000-0000-0000-0001-000000000003', '5000', 'COST OF LOTS SOLD', 'cogs', NULL, true, 'debit', 350, true),
('10000000-0000-0000-0001-000000000003', '5100', 'Land Cost - Lots Sold', 'cogs', 'direct_cost', false, 'debit', 351, true),
('10000000-0000-0000-0001-000000000003', '5200', 'Development Cost - Lots Sold', 'cogs', 'direct_cost', false, 'debit', 352, true),
('10000000-0000-0000-0001-000000000003', '5300', 'Capitalized Interest - Lots Sold', 'cogs', 'direct_cost', false, 'debit', 353, true),
-- Operating Expenses
('10000000-0000-0000-0001-000000000003', '6000', 'OPERATING EXPENSES', 'expense', NULL, true, 'debit', 400, true),
('10000000-0000-0000-0001-000000000003', '6100', 'Professional Services', 'expense', 'professional', true, 'debit', 410, true),
('10000000-0000-0000-0001-000000000003', '6110', 'Legal Fees', 'expense', 'professional', false, 'debit', 411, true),
('10000000-0000-0000-0001-000000000003', '6120', 'Accounting Fees', 'expense', 'professional', false, 'debit', 412, true),
('10000000-0000-0000-0001-000000000003', '6130', 'Engineering Consulting', 'expense', 'professional', false, 'debit', 413, false),
('10000000-0000-0000-0001-000000000003', '6200', 'Sales & Marketing', 'expense', 'marketing', true, 'debit', 420, true),
('10000000-0000-0000-0001-000000000003', '6210', 'Sales Commissions', 'expense', 'marketing', false, 'debit', 421, true),
('10000000-0000-0000-0001-000000000003', '6220', 'Marketing Materials', 'expense', 'marketing', false, 'debit', 422, false),
('10000000-0000-0000-0001-000000000003', '6300', 'Property Operations', 'expense', 'property', true, 'debit', 430, true),
('10000000-0000-0000-0001-000000000003', '6310', 'Property Taxes', 'expense', 'property', false, 'debit', 431, true),
('10000000-0000-0000-0001-000000000003', '6320', 'Insurance', 'expense', 'property', false, 'debit', 432, true),
('10000000-0000-0000-0001-000000000003', '6330', 'HOA & Common Area Maintenance', 'expense', 'property', false, 'debit', 433, false),
('10000000-0000-0000-0001-000000000003', '6400', 'Administrative', 'expense', 'administrative', true, 'debit', 440, true),
('10000000-0000-0000-0001-000000000003', '6410', 'Bank Fees', 'expense', 'administrative', false, 'debit', 441, true),
('10000000-0000-0000-0001-000000000003', '6420', 'State Filing Fees', 'expense', 'administrative', false, 'debit', 442, true),
-- Other Income/Expense
('10000000-0000-0000-0001-000000000003', '7000', 'OTHER INCOME/EXPENSE', 'other_expense', NULL, true, 'debit', 500, true),
('10000000-0000-0000-0001-000000000003', '7100', 'Interest Income', 'other_income', NULL, false, 'credit', 510, false),
('10000000-0000-0000-0001-000000000003', '7200', 'Interest Expense', 'other_expense', NULL, false, 'debit', 520, true),
('10000000-0000-0000-0001-000000000003', '7300', 'Loan Fees & Closing Costs', 'other_expense', NULL, false, 'debit', 530, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TEMPLATE 4: SPE - BUILD-TO-RENT (BTR)
-- ============================================================================
INSERT INTO coa_templates (id, name, description, entity_purpose, project_type, is_default, is_system)
VALUES (
  '10000000-0000-0000-0001-000000000004',
  'SPE - Build-to-Rent',
  'Chart of accounts for BTR projects with construction and ongoing rental operations',
  'spe',
  'btr',
  true,
  true
) ON CONFLICT DO NOTHING;

-- BTR Accounts
INSERT INTO coa_template_accounts (template_id, account_number, account_name, account_type, sub_type, is_header, normal_balance, display_order, is_required) VALUES
-- Assets
('10000000-0000-0000-0001-000000000004', '1000', 'ASSETS', 'asset', NULL, true, 'debit', 1, true),
('10000000-0000-0000-0001-000000000004', '1100', 'Cash and Cash Equivalents', 'asset', 'current_asset', true, 'debit', 10, true),
('10000000-0000-0000-0001-000000000004', '1110', 'Operating Cash', 'asset', 'current_asset', false, 'debit', 11, true),
('10000000-0000-0000-0001-000000000004', '1120', 'Replacement Reserve', 'asset', 'current_asset', false, 'debit', 12, true),
('10000000-0000-0000-0001-000000000004', '1130', 'Security Deposit Account', 'asset', 'current_asset', false, 'debit', 13, true),
('10000000-0000-0000-0001-000000000004', '1200', 'Receivables', 'asset', 'current_asset', true, 'debit', 20, true),
('10000000-0000-0000-0001-000000000004', '1210', 'Rent Receivables', 'asset', 'current_asset', false, 'debit', 21, true),
('10000000-0000-0000-0001-000000000004', '1220', 'Intercompany Receivables', 'asset', 'current_asset', false, 'debit', 22, true),
('10000000-0000-0000-0001-000000000004', '1300', 'Construction in Progress', 'asset', 'wip', true, 'debit', 30, true),
('10000000-0000-0000-0001-000000000004', '1310', 'Land Cost', 'asset', 'wip', false, 'debit', 31, true),
('10000000-0000-0000-0001-000000000004', '1320', 'Site Development', 'asset', 'wip', false, 'debit', 32, true),
('10000000-0000-0000-0001-000000000004', '1330', 'Vertical Construction', 'asset', 'wip', false, 'debit', 33, true),
('10000000-0000-0000-0001-000000000004', '1340', 'Soft Costs', 'asset', 'wip', false, 'debit', 34, true),
('10000000-0000-0000-0001-000000000004', '1350', 'Capitalized Interest', 'asset', 'wip', false, 'debit', 35, true),
('10000000-0000-0000-0001-000000000004', '1400', 'Rental Property', 'asset', 'fixed_asset', true, 'debit', 40, true),
('10000000-0000-0000-0001-000000000004', '1410', 'Land', 'asset', 'fixed_asset', false, 'debit', 41, true),
('10000000-0000-0000-0001-000000000004', '1420', 'Buildings', 'asset', 'fixed_asset', false, 'debit', 42, true),
('10000000-0000-0000-0001-000000000004', '1430', 'Site Improvements', 'asset', 'fixed_asset', false, 'debit', 43, true),
('10000000-0000-0000-0001-000000000004', '1490', 'Accumulated Depreciation', 'asset', 'fixed_asset', false, 'credit', 49, true),
-- Liabilities
('10000000-0000-0000-0001-000000000004', '2000', 'LIABILITIES', 'liability', NULL, true, 'credit', 100, true),
('10000000-0000-0000-0001-000000000004', '2100', 'Accounts Payable', 'liability', 'current_liability', true, 'credit', 110, true),
('10000000-0000-0000-0001-000000000004', '2110', 'Trade Payables', 'liability', 'current_liability', false, 'credit', 111, true),
('10000000-0000-0000-0001-000000000004', '2120', 'Retainage Payable', 'liability', 'current_liability', false, 'credit', 112, true),
('10000000-0000-0000-0001-000000000004', '2130', 'Intercompany Payables', 'liability', 'current_liability', false, 'credit', 113, true),
('10000000-0000-0000-0001-000000000004', '2200', 'Security Deposits Liability', 'liability', 'current_liability', false, 'credit', 120, true),
('10000000-0000-0000-0001-000000000004', '2300', 'Prepaid Rent', 'liability', 'current_liability', false, 'credit', 130, true),
('10000000-0000-0000-0001-000000000004', '2400', 'Accrued Liabilities', 'liability', 'current_liability', true, 'credit', 140, true),
('10000000-0000-0000-0001-000000000004', '2410', 'Accrued Interest', 'liability', 'current_liability', false, 'credit', 141, true),
('10000000-0000-0000-0001-000000000004', '2420', 'Accrued Property Taxes', 'liability', 'current_liability', false, 'credit', 142, true),
('10000000-0000-0000-0001-000000000004', '2500', 'Mortgage Loans', 'liability', 'long_term_liability', true, 'credit', 150, true),
('10000000-0000-0000-0001-000000000004', '2510', 'Construction Loan', 'liability', 'long_term_liability', false, 'credit', 151, true),
('10000000-0000-0000-0001-000000000004', '2520', 'Permanent Loan', 'liability', 'long_term_liability', false, 'credit', 152, true),
-- Equity
('10000000-0000-0000-0001-000000000004', '3000', 'EQUITY', 'equity', NULL, true, 'credit', 200, true),
('10000000-0000-0000-0001-000000000004', '3100', 'Member Capital', 'equity', 'contributed_capital', true, 'credit', 210, true),
('10000000-0000-0000-0001-000000000004', '3110', 'Member Contributions', 'equity', 'contributed_capital', false, 'credit', 211, true),
('10000000-0000-0000-0001-000000000004', '3120', 'Member Distributions', 'equity', 'distributions', false, 'debit', 212, true),
('10000000-0000-0000-0001-000000000004', '3200', 'Retained Earnings', 'equity', 'retained_earnings', false, 'credit', 220, true),
('10000000-0000-0000-0001-000000000004', '3300', 'Current Year Earnings', 'equity', 'current_earnings', false, 'credit', 230, true),
-- Revenue
('10000000-0000-0000-0001-000000000004', '4000', 'REVENUE', 'revenue', NULL, true, 'credit', 300, true),
('10000000-0000-0000-0001-000000000004', '4100', 'Rental Income', 'revenue', 'rental_income', true, 'credit', 310, true),
('10000000-0000-0000-0001-000000000004', '4110', 'Base Rent', 'revenue', 'rental_income', false, 'credit', 311, true),
('10000000-0000-0000-0001-000000000004', '4120', 'Late Fees', 'revenue', 'rental_income', false, 'credit', 312, false),
('10000000-0000-0000-0001-000000000004', '4130', 'Pet Rent', 'revenue', 'rental_income', false, 'credit', 313, false),
('10000000-0000-0000-0001-000000000004', '4200', 'Other Property Income', 'revenue', 'other_income', true, 'credit', 320, false),
('10000000-0000-0000-0001-000000000004', '4210', 'Application Fees', 'revenue', 'other_income', false, 'credit', 321, false),
('10000000-0000-0000-0001-000000000004', '4220', 'Utility Reimbursements', 'revenue', 'other_income', false, 'credit', 322, false),
('10000000-0000-0000-0001-000000000004', '4230', 'Parking Income', 'revenue', 'other_income', false, 'credit', 323, false),
-- Operating Expenses
('10000000-0000-0000-0001-000000000004', '6000', 'OPERATING EXPENSES', 'expense', NULL, true, 'debit', 400, true),
('10000000-0000-0000-0001-000000000004', '6100', 'Property Management', 'expense', 'management', true, 'debit', 410, true),
('10000000-0000-0000-0001-000000000004', '6110', 'Management Fees', 'expense', 'management', false, 'debit', 411, true),
('10000000-0000-0000-0001-000000000004', '6120', 'Leasing Commissions', 'expense', 'management', false, 'debit', 412, false),
('10000000-0000-0000-0001-000000000004', '6200', 'Repairs & Maintenance', 'expense', 'maintenance', true, 'debit', 420, true),
('10000000-0000-0000-0001-000000000004', '6210', 'General Repairs', 'expense', 'maintenance', false, 'debit', 421, true),
('10000000-0000-0000-0001-000000000004', '6220', 'HVAC Maintenance', 'expense', 'maintenance', false, 'debit', 422, false),
('10000000-0000-0000-0001-000000000004', '6230', 'Landscaping', 'expense', 'maintenance', false, 'debit', 423, true),
('10000000-0000-0000-0001-000000000004', '6240', 'Snow Removal', 'expense', 'maintenance', false, 'debit', 424, false),
('10000000-0000-0000-0001-000000000004', '6250', 'Pest Control', 'expense', 'maintenance', false, 'debit', 425, false),
('10000000-0000-0000-0001-000000000004', '6300', 'Utilities', 'expense', 'utilities', true, 'debit', 430, true),
('10000000-0000-0000-0001-000000000004', '6310', 'Electric', 'expense', 'utilities', false, 'debit', 431, true),
('10000000-0000-0000-0001-000000000004', '6320', 'Gas', 'expense', 'utilities', false, 'debit', 432, false),
('10000000-0000-0000-0001-000000000004', '6330', 'Water & Sewer', 'expense', 'utilities', false, 'debit', 433, true),
('10000000-0000-0000-0001-000000000004', '6340', 'Trash Removal', 'expense', 'utilities', false, 'debit', 434, true),
('10000000-0000-0000-0001-000000000004', '6400', 'Taxes & Insurance', 'expense', 'tax_insurance', true, 'debit', 440, true),
('10000000-0000-0000-0001-000000000004', '6410', 'Property Taxes', 'expense', 'tax_insurance', false, 'debit', 441, true),
('10000000-0000-0000-0001-000000000004', '6420', 'Property Insurance', 'expense', 'tax_insurance', false, 'debit', 442, true),
('10000000-0000-0000-0001-000000000004', '6500', 'Professional Services', 'expense', 'professional', true, 'debit', 450, true),
('10000000-0000-0000-0001-000000000004', '6510', 'Legal Fees', 'expense', 'professional', false, 'debit', 451, true),
('10000000-0000-0000-0001-000000000004', '6520', 'Accounting Fees', 'expense', 'professional', false, 'debit', 452, true),
('10000000-0000-0000-0001-000000000004', '6600', 'Marketing & Advertising', 'expense', 'marketing', false, 'debit', 460, true),
('10000000-0000-0000-0001-000000000004', '6700', 'Administrative', 'expense', 'administrative', true, 'debit', 470, true),
('10000000-0000-0000-0001-000000000004', '6710', 'Bank Fees', 'expense', 'administrative', false, 'debit', 471, true),
('10000000-0000-0000-0001-000000000004', '6720', 'State Filing Fees', 'expense', 'administrative', false, 'debit', 472, true),
('10000000-0000-0000-0001-000000000004', '6800', 'Depreciation', 'expense', 'depreciation', false, 'debit', 480, true),
-- Other Income/Expense
('10000000-0000-0000-0001-000000000004', '7000', 'OTHER INCOME/EXPENSE', 'other_expense', NULL, true, 'debit', 500, true),
('10000000-0000-0000-0001-000000000004', '7100', 'Interest Income', 'other_income', NULL, false, 'credit', 510, false),
('10000000-0000-0000-0001-000000000004', '7200', 'Interest Expense', 'other_expense', NULL, false, 'debit', 520, true),
('10000000-0000-0000-0001-000000000004', '7300', 'Loan Fees & Closing Costs', 'other_expense', NULL, false, 'debit', 530, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TEMPLATE 5: SPE - FIX & FLIP
-- ============================================================================
INSERT INTO coa_templates (id, name, description, entity_purpose, project_type, is_default, is_system)
VALUES (
  '10000000-0000-0000-0001-000000000005',
  'SPE - Fix & Flip',
  'Chart of accounts for fix and flip projects with acquisition, rehab, and sale',
  'spe',
  'fix_and_flip',
  true,
  true
) ON CONFLICT DO NOTHING;

-- Fix & Flip Accounts
INSERT INTO coa_template_accounts (template_id, account_number, account_name, account_type, sub_type, is_header, normal_balance, display_order, is_required) VALUES
-- Assets
('10000000-0000-0000-0001-000000000005', '1000', 'ASSETS', 'asset', NULL, true, 'debit', 1, true),
('10000000-0000-0000-0001-000000000005', '1100', 'Cash', 'asset', 'current_asset', true, 'debit', 10, true),
('10000000-0000-0000-0001-000000000005', '1110', 'Operating Cash', 'asset', 'current_asset', false, 'debit', 11, true),
('10000000-0000-0000-0001-000000000005', '1200', 'Receivables', 'asset', 'current_asset', true, 'debit', 20, true),
('10000000-0000-0000-0001-000000000005', '1210', 'Sale Proceeds Receivable', 'asset', 'current_asset', false, 'debit', 21, true),
('10000000-0000-0000-0001-000000000005', '1220', 'Intercompany Receivables', 'asset', 'current_asset', false, 'debit', 22, true),
('10000000-0000-0000-0001-000000000005', '1300', 'Property Inventory', 'asset', 'inventory', true, 'debit', 30, true),
('10000000-0000-0000-0001-000000000005', '1310', 'Acquisition Cost', 'asset', 'inventory', false, 'debit', 31, true),
('10000000-0000-0000-0001-000000000005', '1320', 'Closing & Due Diligence', 'asset', 'inventory', false, 'debit', 32, true),
('10000000-0000-0000-0001-000000000005', '1330', 'Renovation - Permits', 'asset', 'inventory', false, 'debit', 33, true),
('10000000-0000-0000-0001-000000000005', '1340', 'Renovation - Demo', 'asset', 'inventory', false, 'debit', 34, true),
('10000000-0000-0000-0001-000000000005', '1350', 'Renovation - Structural', 'asset', 'inventory', false, 'debit', 35, true),
('10000000-0000-0000-0001-000000000005', '1360', 'Renovation - MEP', 'asset', 'inventory', false, 'debit', 36, true),
('10000000-0000-0000-0001-000000000005', '1370', 'Renovation - Finishes', 'asset', 'inventory', false, 'debit', 37, true),
('10000000-0000-0000-0001-000000000005', '1380', 'Renovation - Exterior', 'asset', 'inventory', false, 'debit', 38, true),
('10000000-0000-0000-0001-000000000005', '1390', 'Capitalized Interest', 'asset', 'inventory', false, 'debit', 39, true),
-- Liabilities
('10000000-0000-0000-0001-000000000005', '2000', 'LIABILITIES', 'liability', NULL, true, 'credit', 100, true),
('10000000-0000-0000-0001-000000000005', '2100', 'Accounts Payable', 'liability', 'current_liability', true, 'credit', 110, true),
('10000000-0000-0000-0001-000000000005', '2110', 'Contractor Payables', 'liability', 'current_liability', false, 'credit', 111, true),
('10000000-0000-0000-0001-000000000005', '2120', 'Intercompany Payables', 'liability', 'current_liability', false, 'credit', 112, true),
('10000000-0000-0000-0001-000000000005', '2200', 'Accrued Liabilities', 'liability', 'current_liability', true, 'credit', 120, true),
('10000000-0000-0000-0001-000000000005', '2210', 'Accrued Interest', 'liability', 'current_liability', false, 'credit', 121, true),
('10000000-0000-0000-0001-000000000005', '2300', 'Hard Money Loan', 'liability', 'current_liability', false, 'credit', 130, true),
('10000000-0000-0000-0001-000000000005', '2400', 'Private Lender Notes', 'liability', 'current_liability', false, 'credit', 140, false),
-- Equity
('10000000-0000-0000-0001-000000000005', '3000', 'EQUITY', 'equity', NULL, true, 'credit', 200, true),
('10000000-0000-0000-0001-000000000005', '3100', 'Member Capital', 'equity', 'contributed_capital', true, 'credit', 210, true),
('10000000-0000-0000-0001-000000000005', '3110', 'Member Contributions', 'equity', 'contributed_capital', false, 'credit', 211, true),
('10000000-0000-0000-0001-000000000005', '3120', 'Member Distributions', 'equity', 'distributions', false, 'debit', 212, true),
('10000000-0000-0000-0001-000000000005', '3200', 'Retained Earnings', 'equity', 'retained_earnings', false, 'credit', 220, true),
('10000000-0000-0000-0001-000000000005', '3300', 'Current Year Earnings', 'equity', 'current_earnings', false, 'credit', 230, true),
-- Revenue
('10000000-0000-0000-0001-000000000005', '4000', 'REVENUE', 'revenue', NULL, true, 'credit', 300, true),
('10000000-0000-0000-0001-000000000005', '4100', 'Property Sale Revenue', 'revenue', 'sale_revenue', false, 'credit', 310, true),
-- COGS
('10000000-0000-0000-0001-000000000005', '5000', 'COST OF PROPERTY SOLD', 'cogs', NULL, true, 'debit', 350, true),
('10000000-0000-0000-0001-000000000005', '5100', 'Acquisition Cost - Sold', 'cogs', 'direct_cost', false, 'debit', 351, true),
('10000000-0000-0000-0001-000000000005', '5200', 'Renovation Cost - Sold', 'cogs', 'direct_cost', false, 'debit', 352, true),
('10000000-0000-0000-0001-000000000005', '5300', 'Capitalized Interest - Sold', 'cogs', 'direct_cost', false, 'debit', 353, true),
-- Operating Expenses
('10000000-0000-0000-0001-000000000005', '6000', 'OPERATING EXPENSES', 'expense', NULL, true, 'debit', 400, true),
('10000000-0000-0000-0001-000000000005', '6100', 'Holding Costs', 'expense', 'holding', true, 'debit', 410, true),
('10000000-0000-0000-0001-000000000005', '6110', 'Property Taxes', 'expense', 'holding', false, 'debit', 411, true),
('10000000-0000-0000-0001-000000000005', '6120', 'Insurance', 'expense', 'holding', false, 'debit', 412, true),
('10000000-0000-0000-0001-000000000005', '6130', 'Utilities', 'expense', 'holding', false, 'debit', 413, true),
('10000000-0000-0000-0001-000000000005', '6140', 'HOA Dues', 'expense', 'holding', false, 'debit', 414, false),
('10000000-0000-0000-0001-000000000005', '6200', 'Sales Expenses', 'expense', 'sales', true, 'debit', 420, true),
('10000000-0000-0000-0001-000000000005', '6210', 'Realtor Commission', 'expense', 'sales', false, 'debit', 421, true),
('10000000-0000-0000-0001-000000000005', '6220', 'Closing Costs - Sale', 'expense', 'sales', false, 'debit', 422, true),
('10000000-0000-0000-0001-000000000005', '6230', 'Staging & Photography', 'expense', 'sales', false, 'debit', 423, false),
('10000000-0000-0000-0001-000000000005', '6300', 'Professional Services', 'expense', 'professional', true, 'debit', 430, true),
('10000000-0000-0000-0001-000000000005', '6310', 'Legal Fees', 'expense', 'professional', false, 'debit', 431, true),
('10000000-0000-0000-0001-000000000005', '6320', 'Accounting Fees', 'expense', 'professional', false, 'debit', 432, true),
('10000000-0000-0000-0001-000000000005', '6400', 'Administrative', 'expense', 'administrative', true, 'debit', 440, true),
('10000000-0000-0000-0001-000000000005', '6410', 'Bank Fees', 'expense', 'administrative', false, 'debit', 441, true),
('10000000-0000-0000-0001-000000000005', '6420', 'State Filing Fees', 'expense', 'administrative', false, 'debit', 442, true),
-- Other Income/Expense
('10000000-0000-0000-0001-000000000005', '7000', 'OTHER INCOME/EXPENSE', 'other_expense', NULL, true, 'debit', 500, true),
('10000000-0000-0000-0001-000000000005', '7100', 'Interest Expense', 'other_expense', NULL, false, 'debit', 510, true),
('10000000-0000-0000-0001-000000000005', '7200', 'Loan Fees & Points', 'other_expense', NULL, false, 'debit', 520, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TEMPLATE 6: SPE - SPEC BUILD
-- ============================================================================
INSERT INTO coa_templates (id, name, description, entity_purpose, project_type, is_default, is_system)
VALUES (
  '10000000-0000-0000-0001-000000000006',
  'SPE - Spec Build',
  'Chart of accounts for speculative single-family home construction',
  'spe',
  'spec_build',
  true,
  true
) ON CONFLICT DO NOTHING;

-- Spec Build Accounts
INSERT INTO coa_template_accounts (template_id, account_number, account_name, account_type, sub_type, is_header, normal_balance, display_order, is_required) VALUES
-- Assets
('10000000-0000-0000-0001-000000000006', '1000', 'ASSETS', 'asset', NULL, true, 'debit', 1, true),
('10000000-0000-0000-0001-000000000006', '1100', 'Cash', 'asset', 'current_asset', true, 'debit', 10, true),
('10000000-0000-0000-0001-000000000006', '1110', 'Operating Cash', 'asset', 'current_asset', false, 'debit', 11, true),
('10000000-0000-0000-0001-000000000006', '1200', 'Receivables', 'asset', 'current_asset', true, 'debit', 20, true),
('10000000-0000-0000-0001-000000000006', '1210', 'Sale Proceeds Receivable', 'asset', 'current_asset', false, 'debit', 21, true),
('10000000-0000-0000-0001-000000000006', '1220', 'Intercompany Receivables', 'asset', 'current_asset', false, 'debit', 22, true),
('10000000-0000-0000-0001-000000000006', '1300', 'Construction in Progress', 'asset', 'wip', true, 'debit', 30, true),
('10000000-0000-0000-0001-000000000006', '1310', 'Lot Cost', 'asset', 'wip', false, 'debit', 31, true),
('10000000-0000-0000-0001-000000000006', '1320', 'Permits & Fees', 'asset', 'wip', false, 'debit', 32, true),
('10000000-0000-0000-0001-000000000006', '1330', 'Site Prep & Foundation', 'asset', 'wip', false, 'debit', 33, true),
('10000000-0000-0000-0001-000000000006', '1340', 'Framing & Roofing', 'asset', 'wip', false, 'debit', 34, true),
('10000000-0000-0000-0001-000000000006', '1350', 'Mechanical Systems', 'asset', 'wip', false, 'debit', 35, true),
('10000000-0000-0000-0001-000000000006', '1360', 'Interior Finishes', 'asset', 'wip', false, 'debit', 36, true),
('10000000-0000-0000-0001-000000000006', '1370', 'Exterior Finishes', 'asset', 'wip', false, 'debit', 37, true),
('10000000-0000-0000-0001-000000000006', '1380', 'Landscaping', 'asset', 'wip', false, 'debit', 38, true),
('10000000-0000-0000-0001-000000000006', '1390', 'Capitalized Interest', 'asset', 'wip', false, 'debit', 39, true),
-- Liabilities
('10000000-0000-0000-0001-000000000006', '2000', 'LIABILITIES', 'liability', NULL, true, 'credit', 100, true),
('10000000-0000-0000-0001-000000000006', '2100', 'Accounts Payable', 'liability', 'current_liability', true, 'credit', 110, true),
('10000000-0000-0000-0001-000000000006', '2110', 'Trade Payables', 'liability', 'current_liability', false, 'credit', 111, true),
('10000000-0000-0000-0001-000000000006', '2120', 'Retainage Payable', 'liability', 'current_liability', false, 'credit', 112, true),
('10000000-0000-0000-0001-000000000006', '2130', 'Intercompany Payables', 'liability', 'current_liability', false, 'credit', 113, true),
('10000000-0000-0000-0001-000000000006', '2200', 'Accrued Liabilities', 'liability', 'current_liability', true, 'credit', 120, true),
('10000000-0000-0000-0001-000000000006', '2210', 'Accrued Interest', 'liability', 'current_liability', false, 'credit', 121, true),
('10000000-0000-0000-0001-000000000006', '2300', 'Construction Loan', 'liability', 'current_liability', false, 'credit', 130, true),
-- Equity
('10000000-0000-0000-0001-000000000006', '3000', 'EQUITY', 'equity', NULL, true, 'credit', 200, true),
('10000000-0000-0000-0001-000000000006', '3100', 'Member Capital', 'equity', 'contributed_capital', true, 'credit', 210, true),
('10000000-0000-0000-0001-000000000006', '3110', 'Member Contributions', 'equity', 'contributed_capital', false, 'credit', 211, true),
('10000000-0000-0000-0001-000000000006', '3120', 'Member Distributions', 'equity', 'distributions', false, 'debit', 212, true),
('10000000-0000-0000-0001-000000000006', '3200', 'Retained Earnings', 'equity', 'retained_earnings', false, 'credit', 220, true),
('10000000-0000-0000-0001-000000000006', '3300', 'Current Year Earnings', 'equity', 'current_earnings', false, 'credit', 230, true),
-- Revenue
('10000000-0000-0000-0001-000000000006', '4000', 'REVENUE', 'revenue', NULL, true, 'credit', 300, true),
('10000000-0000-0000-0001-000000000006', '4100', 'Home Sale Revenue', 'revenue', 'sale_revenue', false, 'credit', 310, true),
-- COGS
('10000000-0000-0000-0001-000000000006', '5000', 'COST OF HOME SOLD', 'cogs', NULL, true, 'debit', 350, true),
('10000000-0000-0000-0001-000000000006', '5100', 'Lot Cost - Sold', 'cogs', 'direct_cost', false, 'debit', 351, true),
('10000000-0000-0000-0001-000000000006', '5200', 'Construction Cost - Sold', 'cogs', 'direct_cost', false, 'debit', 352, true),
('10000000-0000-0000-0001-000000000006', '5300', 'Capitalized Interest - Sold', 'cogs', 'direct_cost', false, 'debit', 353, true),
-- Operating Expenses
('10000000-0000-0000-0001-000000000006', '6000', 'OPERATING EXPENSES', 'expense', NULL, true, 'debit', 400, true),
('10000000-0000-0000-0001-000000000006', '6100', 'Sales & Closing', 'expense', 'sales', true, 'debit', 410, true),
('10000000-0000-0000-0001-000000000006', '6110', 'Realtor Commission', 'expense', 'sales', false, 'debit', 411, true),
('10000000-0000-0000-0001-000000000006', '6120', 'Closing Costs', 'expense', 'sales', false, 'debit', 412, true),
('10000000-0000-0000-0001-000000000006', '6200', 'Marketing', 'expense', 'marketing', true, 'debit', 420, false),
('10000000-0000-0000-0001-000000000006', '6210', 'Staging & Photography', 'expense', 'marketing', false, 'debit', 421, false),
('10000000-0000-0000-0001-000000000006', '6220', 'Advertising', 'expense', 'marketing', false, 'debit', 422, false),
('10000000-0000-0000-0001-000000000006', '6300', 'Warranty Expense', 'expense', 'warranty', false, 'debit', 430, true),
('10000000-0000-0000-0001-000000000006', '6400', 'Professional Services', 'expense', 'professional', true, 'debit', 440, true),
('10000000-0000-0000-0001-000000000006', '6410', 'Legal Fees', 'expense', 'professional', false, 'debit', 441, true),
('10000000-0000-0000-0001-000000000006', '6420', 'Accounting Fees', 'expense', 'professional', false, 'debit', 442, true),
('10000000-0000-0000-0001-000000000006', '6500', 'Administrative', 'expense', 'administrative', true, 'debit', 450, true),
('10000000-0000-0000-0001-000000000006', '6510', 'Bank Fees', 'expense', 'administrative', false, 'debit', 451, true),
('10000000-0000-0000-0001-000000000006', '6520', 'State Filing Fees', 'expense', 'administrative', false, 'debit', 452, true),
-- Other Income/Expense
('10000000-0000-0000-0001-000000000006', '7000', 'OTHER INCOME/EXPENSE', 'other_expense', NULL, true, 'debit', 500, true),
('10000000-0000-0000-0001-000000000006', '7100', 'Interest Expense', 'other_expense', NULL, false, 'debit', 510, true),
('10000000-0000-0000-0001-000000000006', '7200', 'Loan Fees & Points', 'other_expense', NULL, false, 'debit', 520, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TEMPLATE 7: SPE - COMMUNITY DEVELOPMENT
-- ============================================================================
INSERT INTO coa_templates (id, name, description, entity_purpose, project_type, is_default, is_system)
VALUES (
  '10000000-0000-0000-0001-000000000007',
  'SPE - Community Development',
  'Chart of accounts for large-scale community/master-planned development',
  'spe',
  'community_development',
  true,
  true
) ON CONFLICT DO NOTHING;

-- Community Development Accounts
INSERT INTO coa_template_accounts (template_id, account_number, account_name, account_type, sub_type, is_header, normal_balance, display_order, is_required) VALUES
-- Assets
('10000000-0000-0000-0001-000000000007', '1000', 'ASSETS', 'asset', NULL, true, 'debit', 1, true),
('10000000-0000-0000-0001-000000000007', '1100', 'Cash and Cash Equivalents', 'asset', 'current_asset', true, 'debit', 10, true),
('10000000-0000-0000-0001-000000000007', '1110', 'Operating Cash', 'asset', 'current_asset', false, 'debit', 11, true),
('10000000-0000-0000-0001-000000000007', '1120', 'HOA Reserve Fund', 'asset', 'current_asset', false, 'debit', 12, false),
('10000000-0000-0000-0001-000000000007', '1200', 'Receivables', 'asset', 'current_asset', true, 'debit', 20, true),
('10000000-0000-0000-0001-000000000007', '1210', 'Lot/Home Sale Receivables', 'asset', 'current_asset', false, 'debit', 21, true),
('10000000-0000-0000-0001-000000000007', '1220', 'Builder Deposits', 'asset', 'current_asset', false, 'debit', 22, false),
('10000000-0000-0000-0001-000000000007', '1230', 'Intercompany Receivables', 'asset', 'current_asset', false, 'debit', 23, true),
('10000000-0000-0000-0001-000000000007', '1300', 'Land Inventory', 'asset', 'inventory', true, 'debit', 30, true),
('10000000-0000-0000-0001-000000000007', '1310', 'Raw Land Acquisition', 'asset', 'inventory', false, 'debit', 31, true),
('10000000-0000-0000-0001-000000000007', '1320', 'Master Planning & Entitlements', 'asset', 'inventory', false, 'debit', 32, true),
('10000000-0000-0000-0001-000000000007', '1330', 'Engineering & Design', 'asset', 'inventory', false, 'debit', 33, true),
('10000000-0000-0000-0001-000000000007', '1400', 'Infrastructure Development', 'asset', 'inventory', true, 'debit', 40, true),
('10000000-0000-0000-0001-000000000007', '1410', 'Roads & Streets', 'asset', 'inventory', false, 'debit', 41, true),
('10000000-0000-0000-0001-000000000007', '1420', 'Water Infrastructure', 'asset', 'inventory', false, 'debit', 42, true),
('10000000-0000-0000-0001-000000000007', '1430', 'Sewer Infrastructure', 'asset', 'inventory', false, 'debit', 43, true),
('10000000-0000-0000-0001-000000000007', '1440', 'Electric & Gas', 'asset', 'inventory', false, 'debit', 44, true),
('10000000-0000-0000-0001-000000000007', '1450', 'Stormwater Management', 'asset', 'inventory', false, 'debit', 45, true),
('10000000-0000-0000-0001-000000000007', '1500', 'Amenity Development', 'asset', 'inventory', true, 'debit', 50, false),
('10000000-0000-0000-0001-000000000007', '1510', 'Clubhouse/Amenity Center', 'asset', 'inventory', false, 'debit', 51, false),
('10000000-0000-0000-0001-000000000007', '1520', 'Pool & Recreation', 'asset', 'inventory', false, 'debit', 52, false),
('10000000-0000-0000-0001-000000000007', '1530', 'Parks & Open Space', 'asset', 'inventory', false, 'debit', 53, false),
('10000000-0000-0000-0001-000000000007', '1540', 'Trails & Walking Paths', 'asset', 'inventory', false, 'debit', 54, false),
('10000000-0000-0000-0001-000000000007', '1600', 'Finished Lot Inventory', 'asset', 'inventory', true, 'debit', 60, true),
('10000000-0000-0000-0001-000000000007', '1610', 'Phase 1 Lots', 'asset', 'inventory', false, 'debit', 61, true),
('10000000-0000-0000-0001-000000000007', '1620', 'Phase 2 Lots', 'asset', 'inventory', false, 'debit', 62, false),
('10000000-0000-0000-0001-000000000007', '1630', 'Phase 3+ Lots', 'asset', 'inventory', false, 'debit', 63, false),
('10000000-0000-0000-0001-000000000007', '1700', 'Capitalized Costs', 'asset', 'inventory', true, 'debit', 70, true),
('10000000-0000-0000-0001-000000000007', '1710', 'Capitalized Interest', 'asset', 'inventory', false, 'debit', 71, true),
('10000000-0000-0000-0001-000000000007', '1720', 'Capitalized Taxes', 'asset', 'inventory', false, 'debit', 72, true),
-- Liabilities
('10000000-0000-0000-0001-000000000007', '2000', 'LIABILITIES', 'liability', NULL, true, 'credit', 100, true),
('10000000-0000-0000-0001-000000000007', '2100', 'Accounts Payable', 'liability', 'current_liability', true, 'credit', 110, true),
('10000000-0000-0000-0001-000000000007', '2110', 'Trade Payables', 'liability', 'current_liability', false, 'credit', 111, true),
('10000000-0000-0000-0001-000000000007', '2120', 'Retainage Payable', 'liability', 'current_liability', false, 'credit', 112, true),
('10000000-0000-0000-0001-000000000007', '2130', 'Intercompany Payables', 'liability', 'current_liability', false, 'credit', 113, true),
('10000000-0000-0000-0001-000000000007', '2200', 'Deposits & Earnest Money', 'liability', 'current_liability', true, 'credit', 120, true),
('10000000-0000-0000-0001-000000000007', '2210', 'Builder Lot Deposits', 'liability', 'current_liability', false, 'credit', 121, true),
('10000000-0000-0000-0001-000000000007', '2220', 'Homebuyer Deposits', 'liability', 'current_liability', false, 'credit', 122, false),
('10000000-0000-0000-0001-000000000007', '2300', 'Accrued Liabilities', 'liability', 'current_liability', true, 'credit', 130, true),
('10000000-0000-0000-0001-000000000007', '2310', 'Accrued Interest', 'liability', 'current_liability', false, 'credit', 131, true),
('10000000-0000-0000-0001-000000000007', '2320', 'Accrued Property Taxes', 'liability', 'current_liability', false, 'credit', 132, true),
('10000000-0000-0000-0001-000000000007', '2400', 'Development Loans', 'liability', 'long_term_liability', true, 'credit', 140, true),
('10000000-0000-0000-0001-000000000007', '2410', 'Land Acquisition Loan', 'liability', 'long_term_liability', false, 'credit', 141, true),
('10000000-0000-0000-0001-000000000007', '2420', 'Development Facility', 'liability', 'long_term_liability', false, 'credit', 142, true),
('10000000-0000-0000-0001-000000000007', '2430', 'Mezzanine Financing', 'liability', 'long_term_liability', false, 'credit', 143, false),
-- Equity
('10000000-0000-0000-0001-000000000007', '3000', 'EQUITY', 'equity', NULL, true, 'credit', 200, true),
('10000000-0000-0000-0001-000000000007', '3100', 'Member Capital', 'equity', 'contributed_capital', true, 'credit', 210, true),
('10000000-0000-0000-0001-000000000007', '3110', 'Member Contributions', 'equity', 'contributed_capital', false, 'credit', 211, true),
('10000000-0000-0000-0001-000000000007', '3120', 'Member Distributions', 'equity', 'distributions', false, 'debit', 212, true),
('10000000-0000-0000-0001-000000000007', '3200', 'Retained Earnings', 'equity', 'retained_earnings', false, 'credit', 220, true),
('10000000-0000-0000-0001-000000000007', '3300', 'Current Year Earnings', 'equity', 'current_earnings', false, 'credit', 230, true),
-- Revenue
('10000000-0000-0000-0001-000000000007', '4000', 'REVENUE', 'revenue', NULL, true, 'credit', 300, true),
('10000000-0000-0000-0001-000000000007', '4100', 'Lot Sales', 'revenue', 'lot_sales', true, 'credit', 310, true),
('10000000-0000-0000-0001-000000000007', '4110', 'Builder Lot Sales', 'revenue', 'lot_sales', false, 'credit', 311, true),
('10000000-0000-0000-0001-000000000007', '4120', 'Retail Lot Sales', 'revenue', 'lot_sales', false, 'credit', 312, false),
('10000000-0000-0000-0001-000000000007', '4200', 'Fee Income', 'revenue', 'fee_income', true, 'credit', 320, false),
('10000000-0000-0000-0001-000000000007', '4210', 'Builder Participation Fees', 'revenue', 'fee_income', false, 'credit', 321, false),
('10000000-0000-0000-0001-000000000007', '4220', 'Marketing Contribution Fees', 'revenue', 'fee_income', false, 'credit', 322, false),
('10000000-0000-0000-0001-000000000007', '4300', 'HOA Income', 'revenue', 'hoa_income', false, 'credit', 330, false),
-- COGS
('10000000-0000-0000-0001-000000000007', '5000', 'COST OF LOTS SOLD', 'cogs', NULL, true, 'debit', 350, true),
('10000000-0000-0000-0001-000000000007', '5100', 'Land Cost - Sold', 'cogs', 'direct_cost', false, 'debit', 351, true),
('10000000-0000-0000-0001-000000000007', '5200', 'Infrastructure Cost - Sold', 'cogs', 'direct_cost', false, 'debit', 352, true),
('10000000-0000-0000-0001-000000000007', '5300', 'Amenity Cost - Sold', 'cogs', 'direct_cost', false, 'debit', 353, false),
('10000000-0000-0000-0001-000000000007', '5400', 'Capitalized Costs - Sold', 'cogs', 'direct_cost', false, 'debit', 354, true),
-- Operating Expenses
('10000000-0000-0000-0001-000000000007', '6000', 'OPERATING EXPENSES', 'expense', NULL, true, 'debit', 400, true),
('10000000-0000-0000-0001-000000000007', '6100', 'Professional Services', 'expense', 'professional', true, 'debit', 410, true),
('10000000-0000-0000-0001-000000000007', '6110', 'Legal Fees', 'expense', 'professional', false, 'debit', 411, true),
('10000000-0000-0000-0001-000000000007', '6120', 'Accounting Fees', 'expense', 'professional', false, 'debit', 412, true),
('10000000-0000-0000-0001-000000000007', '6130', 'Consulting Fees', 'expense', 'professional', false, 'debit', 413, false),
('10000000-0000-0000-0001-000000000007', '6200', 'Sales & Marketing', 'expense', 'marketing', true, 'debit', 420, true),
('10000000-0000-0000-0001-000000000007', '6210', 'Sales Commissions', 'expense', 'marketing', false, 'debit', 421, true),
('10000000-0000-0000-0001-000000000007', '6220', 'Marketing & Advertising', 'expense', 'marketing', false, 'debit', 422, true),
('10000000-0000-0000-0001-000000000007', '6230', 'Model Home Operations', 'expense', 'marketing', false, 'debit', 423, false),
('10000000-0000-0000-0001-000000000007', '6300', 'Property Operations', 'expense', 'property', true, 'debit', 430, true),
('10000000-0000-0000-0001-000000000007', '6310', 'Property Taxes', 'expense', 'property', false, 'debit', 431, true),
('10000000-0000-0000-0001-000000000007', '6320', 'Insurance', 'expense', 'property', false, 'debit', 432, true),
('10000000-0000-0000-0001-000000000007', '6330', 'Common Area Maintenance', 'expense', 'property', false, 'debit', 433, true),
('10000000-0000-0000-0001-000000000007', '6340', 'Security', 'expense', 'property', false, 'debit', 434, false),
('10000000-0000-0000-0001-000000000007', '6400', 'Administrative', 'expense', 'administrative', true, 'debit', 440, true),
('10000000-0000-0000-0001-000000000007', '6410', 'Bank Fees', 'expense', 'administrative', false, 'debit', 441, true),
('10000000-0000-0000-0001-000000000007', '6420', 'State Filing Fees', 'expense', 'administrative', false, 'debit', 442, true),
('10000000-0000-0000-0001-000000000007', '6430', 'Office & Admin', 'expense', 'administrative', false, 'debit', 443, false),
-- Other Income/Expense
('10000000-0000-0000-0001-000000000007', '7000', 'OTHER INCOME/EXPENSE', 'other_expense', NULL, true, 'debit', 500, true),
('10000000-0000-0000-0001-000000000007', '7100', 'Interest Income', 'other_income', NULL, false, 'credit', 510, false),
('10000000-0000-0000-0001-000000000007', '7200', 'Interest Expense', 'other_expense', NULL, false, 'debit', 520, true),
('10000000-0000-0000-0001-000000000007', '7300', 'Loan Fees & Closing Costs', 'other_expense', NULL, false, 'debit', 530, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TEMPLATE 8: SPE - GENERAL
-- ============================================================================
INSERT INTO coa_templates (id, name, description, entity_purpose, project_type, is_default, is_system)
VALUES (
  '10000000-0000-0000-0001-000000000008',
  'SPE - General',
  'Generic chart of accounts for single-purpose entities with no specific project type',
  'spe',
  'none',
  true,
  true
) ON CONFLICT DO NOTHING;

-- General SPE Accounts
INSERT INTO coa_template_accounts (template_id, account_number, account_name, account_type, sub_type, is_header, normal_balance, display_order, is_required) VALUES
-- Assets
('10000000-0000-0000-0001-000000000008', '1000', 'ASSETS', 'asset', NULL, true, 'debit', 1, true),
('10000000-0000-0000-0001-000000000008', '1100', 'Cash', 'asset', 'current_asset', true, 'debit', 10, true),
('10000000-0000-0000-0001-000000000008', '1110', 'Operating Cash', 'asset', 'current_asset', false, 'debit', 11, true),
('10000000-0000-0000-0001-000000000008', '1200', 'Receivables', 'asset', 'current_asset', true, 'debit', 20, true),
('10000000-0000-0000-0001-000000000008', '1210', 'Accounts Receivable', 'asset', 'current_asset', false, 'debit', 21, true),
('10000000-0000-0000-0001-000000000008', '1220', 'Intercompany Receivables', 'asset', 'current_asset', false, 'debit', 22, true),
('10000000-0000-0000-0001-000000000008', '1300', 'Property & Inventory', 'asset', 'inventory', true, 'debit', 30, true),
('10000000-0000-0000-0001-000000000008', '1310', 'Land', 'asset', 'inventory', false, 'debit', 31, true),
('10000000-0000-0000-0001-000000000008', '1320', 'Buildings', 'asset', 'inventory', false, 'debit', 32, false),
('10000000-0000-0000-0001-000000000008', '1330', 'Improvements', 'asset', 'inventory', false, 'debit', 33, false),
('10000000-0000-0000-0001-000000000008', '1340', 'Work in Progress', 'asset', 'inventory', false, 'debit', 34, false),
('10000000-0000-0000-0001-000000000008', '1400', 'Fixed Assets', 'asset', 'fixed_asset', true, 'debit', 40, false),
('10000000-0000-0000-0001-000000000008', '1410', 'Equipment', 'asset', 'fixed_asset', false, 'debit', 41, false),
('10000000-0000-0000-0001-000000000008', '1490', 'Accumulated Depreciation', 'asset', 'fixed_asset', false, 'credit', 49, false),
-- Liabilities
('10000000-0000-0000-0001-000000000008', '2000', 'LIABILITIES', 'liability', NULL, true, 'credit', 100, true),
('10000000-0000-0000-0001-000000000008', '2100', 'Accounts Payable', 'liability', 'current_liability', true, 'credit', 110, true),
('10000000-0000-0000-0001-000000000008', '2110', 'Trade Payables', 'liability', 'current_liability', false, 'credit', 111, true),
('10000000-0000-0000-0001-000000000008', '2120', 'Intercompany Payables', 'liability', 'current_liability', false, 'credit', 112, true),
('10000000-0000-0000-0001-000000000008', '2200', 'Accrued Liabilities', 'liability', 'current_liability', true, 'credit', 120, true),
('10000000-0000-0000-0001-000000000008', '2210', 'Accrued Interest', 'liability', 'current_liability', false, 'credit', 121, true),
('10000000-0000-0000-0001-000000000008', '2300', 'Notes Payable', 'liability', 'long_term_liability', true, 'credit', 130, true),
('10000000-0000-0000-0001-000000000008', '2310', 'Bank Loans', 'liability', 'long_term_liability', false, 'credit', 131, true),
('10000000-0000-0000-0001-000000000008', '2320', 'Private Notes', 'liability', 'long_term_liability', false, 'credit', 132, false),
-- Equity
('10000000-0000-0000-0001-000000000008', '3000', 'EQUITY', 'equity', NULL, true, 'credit', 200, true),
('10000000-0000-0000-0001-000000000008', '3100', 'Member Capital', 'equity', 'contributed_capital', true, 'credit', 210, true),
('10000000-0000-0000-0001-000000000008', '3110', 'Member Contributions', 'equity', 'contributed_capital', false, 'credit', 211, true),
('10000000-0000-0000-0001-000000000008', '3120', 'Member Distributions', 'equity', 'distributions', false, 'debit', 212, true),
('10000000-0000-0000-0001-000000000008', '3200', 'Retained Earnings', 'equity', 'retained_earnings', false, 'credit', 220, true),
('10000000-0000-0000-0001-000000000008', '3300', 'Current Year Earnings', 'equity', 'current_earnings', false, 'credit', 230, true),
-- Revenue
('10000000-0000-0000-0001-000000000008', '4000', 'REVENUE', 'revenue', NULL, true, 'credit', 300, true),
('10000000-0000-0000-0001-000000000008', '4100', 'Sales Revenue', 'revenue', 'sale_revenue', false, 'credit', 310, true),
('10000000-0000-0000-0001-000000000008', '4200', 'Fee Income', 'revenue', 'fee_income', false, 'credit', 320, false),
('10000000-0000-0000-0001-000000000008', '4300', 'Other Income', 'revenue', 'other_income', false, 'credit', 330, false),
-- COGS
('10000000-0000-0000-0001-000000000008', '5000', 'COST OF SALES', 'cogs', NULL, true, 'debit', 350, true),
('10000000-0000-0000-0001-000000000008', '5100', 'Direct Costs', 'cogs', 'direct_cost', false, 'debit', 351, true),
-- Operating Expenses
('10000000-0000-0000-0001-000000000008', '6000', 'OPERATING EXPENSES', 'expense', NULL, true, 'debit', 400, true),
('10000000-0000-0000-0001-000000000008', '6100', 'Professional Services', 'expense', 'professional', true, 'debit', 410, true),
('10000000-0000-0000-0001-000000000008', '6110', 'Legal Fees', 'expense', 'professional', false, 'debit', 411, true),
('10000000-0000-0000-0001-000000000008', '6120', 'Accounting Fees', 'expense', 'professional', false, 'debit', 412, true),
('10000000-0000-0000-0001-000000000008', '6200', 'Property Expenses', 'expense', 'property', true, 'debit', 420, true),
('10000000-0000-0000-0001-000000000008', '6210', 'Property Taxes', 'expense', 'property', false, 'debit', 421, true),
('10000000-0000-0000-0001-000000000008', '6220', 'Insurance', 'expense', 'property', false, 'debit', 422, true),
('10000000-0000-0000-0001-000000000008', '6300', 'Administrative', 'expense', 'administrative', true, 'debit', 430, true),
('10000000-0000-0000-0001-000000000008', '6310', 'Bank Fees', 'expense', 'administrative', false, 'debit', 431, true),
('10000000-0000-0000-0001-000000000008', '6320', 'State Filing Fees', 'expense', 'administrative', false, 'debit', 432, true),
-- Other Income/Expense
('10000000-0000-0000-0001-000000000008', '7000', 'OTHER INCOME/EXPENSE', 'other_expense', NULL, true, 'debit', 500, true),
('10000000-0000-0000-0001-000000000008', '7100', 'Interest Income', 'other_income', NULL, false, 'credit', 510, false),
('10000000-0000-0000-0001-000000000008', '7200', 'Interest Expense', 'other_expense', NULL, false, 'debit', 520, true),
('10000000-0000-0000-0001-000000000008', '7300', 'Loan Fees', 'other_expense', NULL, false, 'debit', 530, true)
ON CONFLICT DO NOTHING;
