-- ============================================================================
-- ENHANCED SEED DATA
-- Realistic data for VanRock Holdings operations
-- Run after all schema migrations
-- ============================================================================

-- Update existing projects with new columns (if they exist from seed.sql)
UPDATE projects SET
  city = 'Greenville',
  state = 'SC',
  zip_code = '29601',
  county = 'Greenville County',
  purchase_status = 'closed',
  units_to_develop = 1,
  description = notes
WHERE city IS NULL AND address IS NOT NULL;

-- ============================================================================
-- Driftwood BTR (58-unit) — Flagship Project
-- ============================================================================
INSERT INTO projects (
  id, name, address, city, state, zip_code, county,
  status, project_type, budget, start_date, target_completion_date,
  purchase_price, contract_date, closing_date, purchase_status,
  units_to_develop, description, parcel_id, lot_size, zoning
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Driftwood Hilton Head Island',
  '123 Driftwood Lane',
  'Hilton Head Island', 'SC', '29928', 'Beaufort County',
  'active', 'build-to-rent', 18500000,
  '2025-03-01', '2027-06-30',
  4200000, '2024-11-15', '2025-02-28', 'closed',
  58, '58-unit build-to-rent community on Hilton Head Island. Premium finishes, resort-style amenities.',
  'R600-016-000-0123', 12.4, 'PD'
) ON CONFLICT (id) DO UPDATE SET
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  zip_code = EXCLUDED.zip_code,
  county = EXCLUDED.county,
  purchase_price = EXCLUDED.purchase_price,
  units_to_develop = EXCLUDED.units_to_develop,
  description = EXCLUDED.description;

-- ============================================================================
-- Ambleside (227-lot subdivision)
-- ============================================================================
INSERT INTO projects (
  id, name, address, city, state, zip_code, county,
  status, project_type, budget, start_date, target_completion_date,
  purchase_price, contract_date, closing_date, purchase_status,
  units_to_develop, description, lot_size, zoning
) VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'Ambleside',
  '456 Ambleside Drive',
  'Greer', 'SC', '29650', 'Greenville County',
  'active', 'lot-development', 9800000,
  '2024-06-01', '2026-12-31',
  3100000, '2024-03-01', '2024-05-30', 'closed',
  227, '227-lot subdivision development with Empire Homes pre-sales. Phase 1 (82 lots) delivering.',
  85.0, 'R-S'
) ON CONFLICT (id) DO UPDATE SET
  city = EXCLUDED.city,
  units_to_develop = EXCLUDED.units_to_develop,
  description = EXCLUDED.description;

-- ============================================================================
-- Magnolia Scattered Lot
-- ============================================================================
INSERT INTO projects (
  id, name, address, city, state, zip_code, county,
  status, project_type, budget, start_date, target_completion_date,
  purchase_price, purchase_status, units_to_develop, description, zoning
) VALUES (
  'a0000000-0000-0000-0000-000000000003',
  'Magnolia',
  '789 Magnolia Court',
  'Simpsonville', 'SC', '29681', 'Greenville County',
  'active', 'spec-build', 385000,
  '2025-01-15', '2025-08-30',
  62000, 'closed', 1, 'Scattered lot spec build — Magnolia plan, 2,400 sqft, 4BR/3BA',
  'R-1'
) ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description;

-- ============================================================================
-- Atlas Scattered Lot
-- ============================================================================
INSERT INTO projects (
  id, name, address, city, state, zip_code, county,
  status, project_type, budget, start_date, target_completion_date,
  purchase_price, purchase_status, units_to_develop, description, zoning
) VALUES (
  'a0000000-0000-0000-0000-000000000004',
  'Atlas',
  '321 Atlas Way',
  'Greenville', 'SC', '29607', 'Greenville County',
  'active', 'spec-build', 410000,
  '2025-02-01', '2025-09-15',
  68000, 'due-diligence', 1, 'Scattered lot spec build — Atlas plan, 2,650 sqft, 4BR/2.5BA',
  'R-1'
) ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description;

-- ============================================================================
-- Dogwood Scattered Lot
-- ============================================================================
INSERT INTO projects (
  id, name, address, city, state, zip_code, county,
  status, project_type, budget, start_date, target_completion_date,
  purchase_price, purchase_status, units_to_develop, description
) VALUES (
  'a0000000-0000-0000-0000-000000000005',
  'Dogwood',
  '555 Dogwood Lane',
  'Mauldin', 'SC', '29662', 'Greenville County',
  'active', 'spec-build', 355000,
  '2025-03-01', '2025-10-30',
  55000, 'under-contract', 1, 'Scattered lot spec build — Dogwood plan, 2,200 sqft, 3BR/2BA'
) ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description;

-- ============================================================================
-- SAMPLE TASKS for Driftwood
-- ============================================================================
INSERT INTO project_tasks (project_id, title, category, status, priority, assigned_to_name, due_date, description, checklist) VALUES
('a0000000-0000-0000-0000-000000000001', 'Finalize site plan with civil engineer', 'construction', 'in-progress', 'high', 'Mike Williams', '2026-02-20', 'Civil engineer revisions for stormwater management. Need final approval before grading.', '[{"text": "Review drainage calculations", "done": true}, {"text": "Submit to county", "done": false}, {"text": "Get approval letter", "done": false}]'::jsonb),
('a0000000-0000-0000-0000-000000000001', 'Submit Phase 1 building permits', 'construction', 'todo', 'high', 'Mike Williams', '2026-03-01', 'Permits for units 1-12. Plans are complete.', '[]'::jsonb),
('a0000000-0000-0000-0000-000000000001', 'Negotiate HOA management contract', 'admin', 'in-progress', 'medium', 'Bryan De Bruin', '2026-03-15', 'Getting proposals from 3 management companies.', '[{"text": "Get proposal from FirstService", "done": true}, {"text": "Get proposal from Associa", "done": true}, {"text": "Get proposal from RealManage", "done": false}, {"text": "Compare and select", "done": false}]'::jsonb),
('a0000000-0000-0000-0000-000000000001', 'Set up construction loan draw schedule', 'finance', 'todo', 'high', 'Bryan De Bruin', '2026-02-28', 'Work with lender to establish draw milestones and schedule.', '[]'::jsonb),
('a0000000-0000-0000-0000-000000000001', 'Order utility connections for Phase 1', 'construction', 'todo', 'medium', 'Mike Williams', '2026-03-10', 'Electric, water, sewer connections for first 12 units.', '[]'::jsonb);

-- SAMPLE TASKS for Magnolia
INSERT INTO project_tasks (project_id, title, category, status, priority, assigned_to_name, due_date, description, checklist) VALUES
('a0000000-0000-0000-0000-000000000003', 'Schedule framing inspection', 'construction', 'in-progress', 'high', 'Mike Williams', '2026-02-18', 'Framing complete, need city inspection before sheetrock.', '[{"text": "Verify framing complete", "done": true}, {"text": "Call building dept", "done": true}, {"text": "Confirm inspection date", "done": false}]'::jsonb),
('a0000000-0000-0000-0000-000000000003', 'Coordinate HVAC rough-in', 'construction', 'todo', 'high', 'Mike Williams', '2026-02-22', 'HVAC contractor ready to start after framing inspection passes.', '[]'::jsonb),
('a0000000-0000-0000-0000-000000000003', 'Order appliances', 'construction', 'todo', 'medium', 'Bryan De Bruin', '2026-03-01', 'Finalize appliance package selection. 4 week lead time.', '[{"text": "Confirm selections", "done": false}, {"text": "Get final pricing", "done": false}, {"text": "Place order", "done": false}]'::jsonb),
('a0000000-0000-0000-0000-000000000003', 'List property on MLS', 'sales', 'todo', 'medium', 'Bryan De Bruin', '2026-04-01', 'Pre-list once sheetrock is hung. Get professional photos at CO.', '[]'::jsonb);

-- SAMPLE TASKS for Atlas
INSERT INTO project_tasks (project_id, title, category, status, priority, assigned_to_name, due_date, description) VALUES
('a0000000-0000-0000-0000-000000000004', 'Complete due diligence', 'admin', 'in-progress', 'urgent', 'Bryan De Bruin', '2026-02-25', 'DD period expires 2/25. Need soil test results and survey back.'),
('a0000000-0000-0000-0000-000000000004', 'Order survey', 'admin', 'completed', 'high', 'Bryan De Bruin', '2026-02-10', 'ALTA survey ordered from Greenville Land Surveying.'),
('a0000000-0000-0000-0000-000000000004', 'Submit building plans to county', 'construction', 'todo', 'high', 'Mike Williams', '2026-03-15', 'Plans ready, submit once lot is closed.');

-- SAMPLE TASKS for Dogwood
INSERT INTO project_tasks (project_id, title, category, status, priority, assigned_to_name, due_date, description) VALUES
('a0000000-0000-0000-0000-000000000005', 'Execute purchase contract', 'admin', 'in-progress', 'urgent', 'Bryan De Bruin', '2026-02-17', 'Contract pending seller signature.'),
('a0000000-0000-0000-0000-000000000005', 'Schedule soil test', 'construction', 'todo', 'high', 'Mike Williams', '2026-03-01', 'Need geotech report before foundation design.');
