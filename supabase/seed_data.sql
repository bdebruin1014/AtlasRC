-- Atlas RC - Sample Seed Data
-- Run this AFTER all migrations to populate sample data

-- ============================================================================
-- SAMPLE ENTITIES (Company Structure)
-- ============================================================================

INSERT INTO entities (id, name, type, tax_id, parent_entity_id) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Olive Brynn Holdings LLC', 'holding', '12-3456789', NULL),
  ('00000000-0000-0000-0000-000000000002', 'VanRock Developers LLC', 'operating', '23-4567890', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000003', 'Atlas Acquisitions LLC', 'operating', '34-5678901', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000004', '123 Oak Street LLC', 'project', '45-6789012', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000005', '456 Pine Avenue LLC', 'project', '56-7890123', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000006', 'Riverside Lots LLC', 'project', '67-8901234', '00000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SAMPLE CONTACTS
-- ============================================================================

INSERT INTO contacts (id, first_name, last_name, company, email, phone, contact_type) VALUES
  ('00000000-0000-0000-0001-000000000001', 'John', 'Smith', 'Smith Construction', 'john@smithconstruction.com', '864-555-0101', 'contractor'),
  ('00000000-0000-0000-0001-000000000002', 'Sarah', 'Johnson', 'Johnson Realty', 'sarah@johnsonrealty.com', '864-555-0102', 'buyer'),
  ('00000000-0000-0000-0001-000000000003', 'Mike', 'Williams', 'Williams Electric', 'mike@williamselectric.com', '864-555-0103', 'contractor'),
  ('00000000-0000-0000-0001-000000000004', 'Lisa', 'Brown', NULL, 'lisa.brown@email.com', '864-555-0104', 'seller'),
  ('00000000-0000-0000-0001-000000000005', 'David', 'Miller', 'Miller Plumbing', 'david@millerplumbing.com', '864-555-0105', 'contractor'),
  ('00000000-0000-0000-0001-000000000006', 'Emily', 'Davis', 'Davis Title Company', 'emily@davistittle.com', '864-555-0106', 'vendor'),
  ('00000000-0000-0000-0001-000000000007', 'James', 'Wilson', 'Wilson Investments', 'james@wilsoninvest.com', '864-555-0107', 'investor'),
  ('00000000-0000-0000-0001-000000000008', 'Amanda', 'Taylor', 'ABC Architecture', 'amanda@abcarch.com', '864-555-0108', 'vendor')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SAMPLE OPPORTUNITIES (Pipeline)
-- ============================================================================

INSERT INTO opportunities (id, deal_number, address, city, state, zip_code, stage, property_type, estimated_value, assignment_fee, seller_name, seller_phone) VALUES
  ('00000000-0000-0000-0002-000000000001', 'OPP-2024-001', '789 Maple Drive', 'Greenville', 'SC', '29601', 'Qualified', 'vacant-lot', 85000.00, 8500.00, 'Robert Jones', '864-555-0201'),
  ('00000000-0000-0000-0002-000000000002', 'OPP-2024-002', '321 Cedar Lane', 'Greenville', 'SC', '29605', 'Negotiating', 'flip-property', 145000.00, 12000.00, 'Patricia White', '864-555-0202'),
  ('00000000-0000-0000-0002-000000000003', 'OPP-2024-003', '555 Birch Street', 'Simpsonville', 'SC', '29681', 'Prospecting', 'vacant-lot', 62000.00, 6000.00, 'Thomas Anderson', '864-555-0203'),
  ('00000000-0000-0000-0002-000000000004', 'OPP-2024-004', '888 Elm Road', 'Mauldin', 'SC', '29662', 'Under Contract', 'vacant-lot', 95000.00, 10000.00, 'Jennifer Martinez', '864-555-0204'),
  ('00000000-0000-0000-0002-000000000005', 'OPP-2024-005', '222 Walnut Ave', 'Greer', 'SC', '29650', 'Contacted', 'flip-property', 175000.00, 15000.00, 'Michael Garcia', '864-555-0205')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SAMPLE PROJECTS
-- ============================================================================

INSERT INTO projects (id, name, entity_id, address, status, project_type, start_date, target_completion_date, budget) VALUES
  ('00000000-0000-0000-0003-000000000001', '123 Oak Street Development', '00000000-0000-0000-0000-000000000004', '123 Oak Street, Greenville, SC 29601', 'active', 'lot-development', '2024-01-15', '2024-06-30', 250000.00),
  ('00000000-0000-0000-0003-000000000002', '456 Pine Avenue Spec Build', '00000000-0000-0000-0000-000000000005', '456 Pine Avenue, Greenville, SC 29605', 'active', 'spec-build', '2024-02-01', '2024-09-30', 450000.00),
  ('00000000-0000-0000-0003-000000000003', 'Riverside Lots Subdivision', '00000000-0000-0000-0000-000000000006', 'Riverside Dr, Simpsonville, SC 29681', 'active', 'lot-development', '2024-03-01', '2024-12-31', 850000.00)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SAMPLE TRANSACTIONS
-- ============================================================================

INSERT INTO transactions (id, entity_id, project_id, transaction_date, description, amount, transaction_type, category) VALUES
  ('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0003-000000000001', '2024-01-15', 'Land Acquisition', 75000.00, 'expense', 'Materials'),
  ('00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0003-000000000001', '2024-01-20', 'Site Survey', 2500.00, 'expense', 'Professional Fees'),
  ('00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0003-000000000001', '2024-02-01', 'Permit Fees', 3500.00, 'expense', 'Permits & Fees'),
  ('00000000-0000-0000-0004-000000000004', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0003-000000000002', '2024-02-01', 'Land Acquisition', 120000.00, 'expense', 'Materials'),
  ('00000000-0000-0000-0004-000000000005', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0003-000000000002', '2024-02-15', 'Architecture Plans', 8500.00, 'expense', 'Professional Fees'),
  ('00000000-0000-0000-0004-000000000006', '00000000-0000-0000-0000-000000000002', NULL, '2024-01-10', 'Lot Sale - 789 Maple', 95000.00, 'income', 'Sale'),
  ('00000000-0000-0000-0004-000000000007', '00000000-0000-0000-0000-000000000003', NULL, '2024-02-05', 'Assignment Fee - 321 Cedar', 12000.00, 'income', 'Sale')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SAMPLE CALENDAR EVENTS (if table exists)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'calendar_events') THEN
    INSERT INTO calendar_events (id, title, description, start_time, end_time, event_type) VALUES
      ('00000000-0000-0000-0005-000000000001', 'Site Visit - Oak Street', 'Walk-through with contractor', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '2 hours', 'site_visit'),
      ('00000000-0000-0000-0005-000000000002', 'Team Meeting', 'Weekly project status update', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '1 hour', 'meeting'),
      ('00000000-0000-0000-0005-000000000003', 'Permit Inspection', '456 Pine Avenue rough-in inspection', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '1 hour', 'inspection')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

SELECT
  'entities' as table_name, COUNT(*) as record_count FROM entities
UNION ALL
SELECT 'contacts', COUNT(*) FROM contacts
UNION ALL
SELECT 'opportunities', COUNT(*) FROM opportunities
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions;
