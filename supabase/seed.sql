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
INSERT INTO contacts (first_name, last_name, contact_type, phone, email) VALUES
  ('John', 'Smith', 'seller', '864-555-0101', 'john.smith@example.com'),
  ('Sarah', 'Johnson', 'contractor', '864-555-0102', 'sarah.j@example.com'),
  ('Mike', 'Williams', 'vendor', '864-555-0103', 'mike.w@example.com');
