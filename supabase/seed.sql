-- Seed data for Atlas Development

-- Insert your company entities
INSERT INTO entities (id, name, type, parent_entity_id) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Olive Brynn LLC', 'holding', NULL),
  ('00000000-0000-0000-0000-000000000002', 'VanRock Holdings LLC', 'operating', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000003', 'Red Cedar Homes', 'operating', '00000000-0000-0000-0000-000000000002');

-- Insert sample opportunities
INSERT INTO opportunities (deal_number, address, stage, assigned_to, estimated_value, assignment_fee, property_type) VALUES
  ('25-001-123 Main St', '123 Main Street, Greenville, SC', 'Prospecting', 'John', 250000, 10000, 'vacant-lot'),
  ('25-002-456 Oak Ave', '456 Oak Avenue, Greenville, SC', 'Contacted', 'Bryan', 180000, 7000, 'flip-property'),
  ('25-003-789 Pine Rd', '789 Pine Road, Greenville, SC', 'Qualified', 'John', 320000, 10000, 'vacant-lot');

-- Insert sample contacts
INSERT INTO contacts (id, first_name, last_name, contact_type, phone, email) VALUES
  ('00000000-0000-0000-0001-000000000001', 'John', 'Smith', 'seller', '864-555-0101', 'john.smith@example.com'),
  ('00000000-0000-0000-0001-000000000002', 'Sarah', 'Johnson', 'contractor', '864-555-0102', 'sarah.j@example.com'),
  ('00000000-0000-0000-0001-000000000003', 'Mike', 'Williams', 'vendor', '864-555-0103', 'mike.w@example.com');

-- Insert sample vendors
INSERT INTO vendors (id, name, contact_name, email, phone, vendor_type, is_active) VALUES
  ('00000000-0000-0000-0002-000000000001', 'ABC Lumber Supply', 'Tom Roberts', 'tom@abclumber.com', '864-555-0201', 'supplier', true),
  ('00000000-0000-0000-0002-000000000002', 'GreenTech Surveying', 'Lisa Chen', 'lisa@greentech.com', '864-555-0202', 'professional', true),
  ('00000000-0000-0000-0002-000000000003', 'FastTrack Excavation', 'Mark Davis', 'mark@fasttrack.com', '864-555-0203', 'contractor', true);

-- Insert standard chart of accounts
INSERT INTO accounts (id, account_number, name, account_type, parent_account_id, is_active, is_system, normal_balance, current_balance) VALUES
  -- Assets
  ('00000000-0000-0000-0003-000000000001', '1000', 'Assets', 'asset', NULL, true, true, 'debit', 0),
  ('00000000-0000-0000-0003-000000000002', '1100', 'Cash and Cash Equivalents', 'asset', '00000000-0000-0000-0003-000000000001', true, true, 'debit', 0),
  ('00000000-0000-0000-0003-000000000003', '1110', 'Operating Cash', 'asset', '00000000-0000-0000-0003-000000000002', true, false, 'debit', 125000),
  ('00000000-0000-0000-0003-000000000004', '1120', 'Reserve Account', 'asset', '00000000-0000-0000-0003-000000000002', true, false, 'debit', 50000),
  ('00000000-0000-0000-0003-000000000005', '1200', 'Accounts Receivable', 'asset', '00000000-0000-0000-0003-000000000001', true, true, 'debit', 35000),
  ('00000000-0000-0000-0003-000000000006', '1500', 'Fixed Assets', 'asset', '00000000-0000-0000-0003-000000000001', true, true, 'debit', 0),
  ('00000000-0000-0000-0003-000000000007', '1510', 'Land', 'asset', '00000000-0000-0000-0003-000000000006', true, false, 'debit', 500000),
  ('00000000-0000-0000-0003-000000000008', '1520', 'Buildings', 'asset', '00000000-0000-0000-0003-000000000006', true, false, 'debit', 1200000),
  -- Liabilities
  ('00000000-0000-0000-0003-000000000010', '2000', 'Liabilities', 'liability', NULL, true, true, 'credit', 0),
  ('00000000-0000-0000-0003-000000000011', '2100', 'Accounts Payable', 'liability', '00000000-0000-0000-0003-000000000010', true, true, 'credit', 45000),
  ('00000000-0000-0000-0003-000000000012', '2200', 'Notes Payable', 'liability', '00000000-0000-0000-0003-000000000010', true, true, 'credit', 750000),
  -- Equity
  ('00000000-0000-0000-0003-000000000020', '3000', 'Equity', 'equity', NULL, true, true, 'credit', 0),
  ('00000000-0000-0000-0003-000000000021', '3100', 'Member Capital', 'equity', '00000000-0000-0000-0003-000000000020', true, true, 'credit', 1000000),
  ('00000000-0000-0000-0003-000000000022', '3200', 'Retained Earnings', 'equity', '00000000-0000-0000-0003-000000000020', true, true, 'credit', 115000),
  -- Income
  ('00000000-0000-0000-0003-000000000030', '4000', 'Income', 'income', NULL, true, true, 'credit', 0),
  ('00000000-0000-0000-0003-000000000031', '4100', 'Rental Income', 'income', '00000000-0000-0000-0003-000000000030', true, false, 'credit', 180000),
  ('00000000-0000-0000-0003-000000000032', '4200', 'Property Sales', 'income', '00000000-0000-0000-0003-000000000030', true, false, 'credit', 450000),
  ('00000000-0000-0000-0003-000000000033', '4300', 'Management Fees', 'income', '00000000-0000-0000-0003-000000000030', true, false, 'credit', 25000),
  -- Expenses
  ('00000000-0000-0000-0003-000000000040', '5000', 'Expenses', 'expense', NULL, true, true, 'debit', 0),
  ('00000000-0000-0000-0003-000000000041', '5100', 'Property Operations', 'expense', '00000000-0000-0000-0003-000000000040', true, false, 'debit', 45000),
  ('00000000-0000-0000-0003-000000000042', '5200', 'Professional Fees', 'expense', '00000000-0000-0000-0003-000000000040', true, false, 'debit', 18000),
  ('00000000-0000-0000-0003-000000000043', '5300', 'Insurance', 'expense', '00000000-0000-0000-0003-000000000040', true, false, 'debit', 12000),
  ('00000000-0000-0000-0003-000000000044', '5400', 'Property Taxes', 'expense', '00000000-0000-0000-0003-000000000040', true, false, 'debit', 28000),
  ('00000000-0000-0000-0003-000000000045', '5500', 'Interest Expense', 'expense', '00000000-0000-0000-0003-000000000040', true, false, 'debit', 35000);
