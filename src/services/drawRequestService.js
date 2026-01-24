// src/services/drawRequestService.js
// Draw Requests Module Service - CRUD and budget integration

import { supabase, isDemoMode } from '@/lib/supabase';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

export const DRAW_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  { value: 'requested', label: 'Requested', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'under_review', label: 'Under Review', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'denied', label: 'Denied', color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'funded', label: 'Funded', color: 'bg-purple-100 text-purple-700 border-purple-200' },
];

export const DOCUMENT_TYPES = [
  { value: 'invoice', label: 'Invoice' },
  { value: 'lien_waiver', label: 'Lien Waiver' },
  { value: 'inspection_report', label: 'Inspection Report' },
  { value: 'photo', label: 'Progress Photo' },
  { value: 'other', label: 'Other' },
];

// ─── DEMO DATA ────────────────────────────────────────────────────────────────

const DEMO_LOAN_INFO = {
  lender_name: 'First National Bank',
  loan_amount: 5800000,
  interest_rate: 8.5,
  term_months: 24,
  maturity_date: '2026-01-15',
  loan_to_value: 65,
  retainage_percentage: 5,
};

const DEMO_DRAW_REQUESTS = [
  {
    id: 'draw-1',
    project_id: 'demo-project-1',
    budget_id: 'budget-1',
    draw_number: 1,
    request_date: '2024-03-20',
    period_start: '2024-03-01',
    period_end: '2024-03-31',
    submitted_date: '2024-03-20T10:00:00Z',
    approved_date: '2024-03-28T14:00:00Z',
    funded_date: '2024-04-01T09:00:00Z',
    requested_amount: 485000,
    approved_amount: 485000,
    funded_amount: 485000,
    retainage_percentage: 5,
    retainage_amount: 24250,
    net_amount: 460750,
    status: 'funded',
    lender_name: 'First National Bank',
    inspector_name: 'J. Williams',
    inspection_date: '2024-03-28',
    inspection_notes: 'Site ready, land acquisition verified',
    notes: 'Initial draw - land acquisition and soft costs',
    created_at: '2024-03-18T08:00:00Z',
  },
  {
    id: 'draw-2',
    project_id: 'demo-project-1',
    budget_id: 'budget-1',
    draw_number: 2,
    request_date: '2024-04-25',
    period_start: '2024-04-01',
    period_end: '2024-04-30',
    submitted_date: '2024-04-25T10:00:00Z',
    approved_date: '2024-05-02T14:00:00Z',
    funded_date: '2024-05-05T09:00:00Z',
    requested_amount: 320000,
    approved_amount: 320000,
    funded_amount: 320000,
    retainage_percentage: 5,
    retainage_amount: 16000,
    net_amount: 304000,
    status: 'funded',
    lender_name: 'First National Bank',
    inspector_name: 'J. Williams',
    inspection_date: '2024-05-02',
    inspection_notes: 'Grading complete, utilities marked',
    notes: 'Site work and remaining land costs',
    created_at: '2024-04-23T08:00:00Z',
  },
  {
    id: 'draw-3',
    project_id: 'demo-project-1',
    budget_id: 'budget-1',
    draw_number: 3,
    request_date: '2024-05-22',
    period_start: '2024-05-01',
    period_end: '2024-05-31',
    submitted_date: '2024-05-22T10:00:00Z',
    approved_date: '2024-05-29T14:00:00Z',
    funded_date: '2024-06-02T09:00:00Z',
    requested_amount: 395000,
    approved_amount: 395000,
    funded_amount: 395000,
    retainage_percentage: 5,
    retainage_amount: 19750,
    net_amount: 375250,
    status: 'funded',
    lender_name: 'First National Bank',
    inspector_name: 'J. Williams',
    inspection_date: '2024-05-29',
    inspection_notes: 'Foundation poured and cured, framing started',
    notes: 'Foundation and early framing',
    created_at: '2024-05-20T08:00:00Z',
  },
  {
    id: 'draw-4',
    project_id: 'demo-project-1',
    budget_id: 'budget-1',
    draw_number: 4,
    request_date: '2024-06-24',
    period_start: '2024-06-01',
    period_end: '2024-06-30',
    submitted_date: '2024-06-24T10:00:00Z',
    approved_date: '2024-07-01T14:00:00Z',
    funded_date: '2024-07-03T09:00:00Z',
    requested_amount: 410000,
    approved_amount: 410000,
    funded_amount: 410000,
    retainage_percentage: 5,
    retainage_amount: 20500,
    net_amount: 389500,
    status: 'funded',
    lender_name: 'First National Bank',
    inspector_name: 'J. Williams',
    inspection_date: '2024-07-01',
    inspection_notes: 'Framing 85% complete, roof trusses set',
    notes: 'Framing progress and roof',
    created_at: '2024-06-22T08:00:00Z',
  },
  {
    id: 'draw-5',
    project_id: 'demo-project-1',
    budget_id: 'budget-1',
    draw_number: 5,
    request_date: '2024-07-25',
    period_start: '2024-07-01',
    period_end: '2024-07-31',
    submitted_date: '2024-07-25T10:00:00Z',
    approved_date: '2024-08-01T14:00:00Z',
    funded_date: '2024-08-04T09:00:00Z',
    requested_amount: 445000,
    approved_amount: 445000,
    funded_amount: 445000,
    retainage_percentage: 5,
    retainage_amount: 22250,
    net_amount: 422750,
    status: 'funded',
    lender_name: 'First National Bank',
    inspector_name: 'J. Williams',
    inspection_date: '2024-08-01',
    inspection_notes: 'Roofing complete, windows installed, MEP rough-in started',
    notes: 'Roofing, windows, and MEP rough-in',
    created_at: '2024-07-23T08:00:00Z',
  },
  {
    id: 'draw-6',
    project_id: 'demo-project-1',
    budget_id: 'budget-1',
    draw_number: 6,
    request_date: '2024-08-26',
    period_start: '2024-08-01',
    period_end: '2024-08-31',
    submitted_date: '2024-08-26T10:00:00Z',
    approved_date: '2024-09-03T14:00:00Z',
    funded_date: '2024-09-05T09:00:00Z',
    requested_amount: 420000,
    approved_amount: 420000,
    funded_amount: 420000,
    retainage_percentage: 5,
    retainage_amount: 21000,
    net_amount: 399000,
    status: 'funded',
    lender_name: 'First National Bank',
    inspector_name: 'J. Williams',
    inspection_date: '2024-09-03',
    inspection_notes: 'MEP rough-in complete, insulation installed, drywall started',
    notes: 'MEP completion and insulation',
    created_at: '2024-08-24T08:00:00Z',
  },
  {
    id: 'draw-7',
    project_id: 'demo-project-1',
    budget_id: 'budget-1',
    draw_number: 7,
    request_date: '2024-09-23',
    period_start: '2024-09-01',
    period_end: '2024-09-30',
    submitted_date: '2024-09-23T10:00:00Z',
    approved_date: '2024-09-30T14:00:00Z',
    funded_date: '2024-10-02T09:00:00Z',
    requested_amount: 365000,
    approved_amount: 365000,
    funded_amount: 365000,
    retainage_percentage: 5,
    retainage_amount: 18250,
    net_amount: 346750,
    status: 'funded',
    lender_name: 'First National Bank',
    inspector_name: 'J. Williams',
    inspection_date: '2024-09-30',
    inspection_notes: 'Drywall hung and finished, paint started',
    notes: 'Drywall and paint',
    created_at: '2024-09-21T08:00:00Z',
  },
  {
    id: 'draw-8',
    project_id: 'demo-project-1',
    budget_id: 'budget-1',
    draw_number: 8,
    request_date: '2024-10-24',
    period_start: '2024-10-01',
    period_end: '2024-10-31',
    submitted_date: '2024-10-24T10:00:00Z',
    approved_date: '2024-10-31T14:00:00Z',
    funded_date: '2024-11-03T09:00:00Z',
    requested_amount: 340000,
    approved_amount: 340000,
    funded_amount: 340000,
    retainage_percentage: 5,
    retainage_amount: 17000,
    net_amount: 323000,
    status: 'funded',
    lender_name: 'First National Bank',
    inspector_name: 'J. Williams',
    inspection_date: '2024-10-31',
    inspection_notes: 'Interior trim, cabinets being installed',
    notes: 'Interior trim and cabinets',
    created_at: '2024-10-22T08:00:00Z',
  },
  {
    id: 'draw-9',
    project_id: 'demo-project-1',
    budget_id: 'budget-1',
    draw_number: 9,
    request_date: '2024-11-22',
    period_start: '2024-11-01',
    period_end: '2024-11-30',
    submitted_date: '2024-11-22T10:00:00Z',
    approved_date: '2024-11-29T14:00:00Z',
    funded_date: '2024-12-02T09:00:00Z',
    requested_amount: 325000,
    approved_amount: 325000,
    funded_amount: 325000,
    retainage_percentage: 5,
    retainage_amount: 16250,
    net_amount: 308750,
    status: 'funded',
    lender_name: 'First National Bank',
    inspector_name: 'J. Williams',
    inspection_date: '2024-11-29',
    inspection_notes: 'Flooring installed, countertops set, fixtures going in',
    notes: 'Flooring, countertops, and fixtures',
    created_at: '2024-11-20T08:00:00Z',
  },
  {
    id: 'draw-10',
    project_id: 'demo-project-1',
    budget_id: 'budget-1',
    draw_number: 10,
    request_date: '2024-12-20',
    period_start: '2024-12-01',
    period_end: '2024-12-31',
    submitted_date: '2024-12-20T10:00:00Z',
    approved_date: '2024-12-27T14:00:00Z',
    funded_date: '2024-12-30T09:00:00Z',
    requested_amount: 445000,
    approved_amount: 445000,
    funded_amount: 445000,
    retainage_percentage: 5,
    retainage_amount: 22250,
    net_amount: 422750,
    status: 'funded',
    lender_name: 'First National Bank',
    inspector_name: 'J. Williams',
    inspection_date: '2024-12-27',
    inspection_notes: 'Appliances, exterior siding progress, landscaping started',
    notes: 'Appliances, exterior, landscaping start',
    created_at: '2024-12-18T08:00:00Z',
  },
  {
    id: 'draw-11',
    project_id: 'demo-project-1',
    budget_id: 'budget-1',
    draw_number: 11,
    request_date: '2025-01-20',
    period_start: '2025-01-01',
    period_end: '2025-01-31',
    submitted_date: '2025-01-20T10:00:00Z',
    approved_date: '2025-01-27T14:00:00Z',
    funded_date: null,
    requested_amount: 380000,
    approved_amount: 380000,
    funded_amount: null,
    retainage_percentage: 5,
    retainage_amount: 19000,
    net_amount: null,
    status: 'approved',
    lender_name: 'First National Bank',
    inspector_name: 'J. Williams',
    inspection_date: '2025-01-27',
    inspection_notes: 'Final exterior, landscaping, punch list items',
    notes: 'Final exterior work and punch list',
    created_at: '2025-01-18T08:00:00Z',
  },
  {
    id: 'draw-12',
    project_id: 'demo-project-1',
    budget_id: 'budget-1',
    draw_number: 12,
    request_date: '2025-01-22',
    period_start: '2025-02-01',
    period_end: '2025-02-28',
    submitted_date: null,
    approved_date: null,
    funded_date: null,
    requested_amount: 420000,
    approved_amount: null,
    funded_amount: null,
    retainage_percentage: 5,
    retainage_amount: 21000,
    net_amount: null,
    status: 'draft',
    lender_name: 'First National Bank',
    inspector_name: null,
    inspection_date: null,
    inspection_notes: null,
    notes: 'Final draw - closeout and remaining retainage',
    created_at: '2025-01-22T08:00:00Z',
  },
];

const DEMO_DRAW_ITEMS = [
  // Draw 1 - Land and Soft Costs
  { id: 'dri-1', draw_request_id: 'draw-1', budget_line_item_id: 'li-1', cost_code: '01-001', description: 'Land Purchase', budget_amount: 1200000, previously_drawn: 0, current_request: 400000, percent_complete: 33, approved_amount: 400000 },
  { id: 'dri-2', draw_request_id: 'draw-1', budget_line_item_id: 'li-15', cost_code: '03-001', description: 'Architecture & Design', budget_amount: 35000, previously_drawn: 0, current_request: 35000, percent_complete: 100, approved_amount: 35000 },
  { id: 'dri-3', draw_request_id: 'draw-1', budget_line_item_id: 'li-17', cost_code: '03-003', description: 'Permits & Fees', budget_amount: 22000, previously_drawn: 0, current_request: 22000, percent_complete: 100, approved_amount: 22000 },
  { id: 'dri-4', draw_request_id: 'draw-1', budget_line_item_id: 'li-21', cost_code: '04-002', description: 'Loan Origination Fee', budget_amount: 18000, previously_drawn: 0, current_request: 18000, percent_complete: 100, approved_amount: 18000 },
  { id: 'dri-5', draw_request_id: 'draw-1', budget_line_item_id: 'li-20', cost_code: '04-001', description: 'Construction Loan Interest', budget_amount: 85000, previously_drawn: 0, current_request: 10000, percent_complete: 12, approved_amount: 10000 },
  // Draw 2 - Land balance and site work
  { id: 'dri-6', draw_request_id: 'draw-2', budget_line_item_id: 'li-1', cost_code: '01-001', description: 'Land Purchase', budget_amount: 1200000, previously_drawn: 400000, current_request: 800000, percent_complete: 100, approved_amount: 800000 },
  { id: 'dri-7', draw_request_id: 'draw-2', budget_line_item_id: 'li-2', cost_code: '01-002', description: 'Buyer Closing Costs', budget_amount: 24000, previously_drawn: 0, current_request: 23500, percent_complete: 98, approved_amount: 23500 },
  { id: 'dri-8', draw_request_id: 'draw-2', budget_line_item_id: 'li-3', cost_code: '01-003', description: 'Due Diligence', budget_amount: 15000, previously_drawn: 0, current_request: 12800, percent_complete: 85, approved_amount: 12800 },
  { id: 'dri-9', draw_request_id: 'draw-2', budget_line_item_id: 'li-4', cost_code: '01-004', description: 'Survey', budget_amount: 8500, previously_drawn: 0, current_request: 8500, percent_complete: 100, approved_amount: 8500 },
  // Draw 3 - Foundation
  { id: 'dri-10', draw_request_id: 'draw-3', budget_line_item_id: 'li-5', cost_code: '02-001', description: 'Site Work & Grading', budget_amount: 45000, previously_drawn: 0, current_request: 42000, percent_complete: 93, approved_amount: 42000 },
  { id: 'dri-11', draw_request_id: 'draw-3', budget_line_item_id: 'li-6', cost_code: '02-002', description: 'Foundation', budget_amount: 18000, previously_drawn: 0, current_request: 18000, percent_complete: 100, approved_amount: 18000 },
  { id: 'dri-12', draw_request_id: 'draw-3', budget_line_item_id: 'li-7', cost_code: '02-003', description: 'Framing', budget_amount: 52000, previously_drawn: 0, current_request: 15000, percent_complete: 29, approved_amount: 15000 },
  { id: 'dri-13', draw_request_id: 'draw-3', budget_line_item_id: 'li-20', cost_code: '04-001', description: 'Construction Loan Interest', budget_amount: 85000, previously_drawn: 10000, current_request: 8000, percent_complete: 21, approved_amount: 8000 },
  // Draw 4 - Framing
  { id: 'dri-14', draw_request_id: 'draw-4', budget_line_item_id: 'li-7', cost_code: '02-003', description: 'Framing', budget_amount: 52000, previously_drawn: 15000, current_request: 37000, percent_complete: 100, approved_amount: 37000 },
  { id: 'dri-15', draw_request_id: 'draw-4', budget_line_item_id: 'li-8', cost_code: '02-004', description: 'Roofing', budget_amount: 14000, previously_drawn: 0, current_request: 14000, percent_complete: 100, approved_amount: 14000 },
  { id: 'dri-16', draw_request_id: 'draw-4', budget_line_item_id: 'li-20', cost_code: '04-001', description: 'Construction Loan Interest', budget_amount: 85000, previously_drawn: 18000, current_request: 8000, percent_complete: 31, approved_amount: 8000 },
  // Draw 5 - MEP Rough
  { id: 'dri-17', draw_request_id: 'draw-5', budget_line_item_id: 'li-9', cost_code: '02-005', description: 'Plumbing (Rough & Finish)', budget_amount: 16500, previously_drawn: 0, current_request: 9500, percent_complete: 58, approved_amount: 9500 },
  { id: 'dri-18', draw_request_id: 'draw-5', budget_line_item_id: 'li-10', cost_code: '02-006', description: 'Electrical (Rough & Finish)', budget_amount: 15000, previously_drawn: 0, current_request: 8000, percent_complete: 53, approved_amount: 8000 },
  { id: 'dri-19', draw_request_id: 'draw-5', budget_line_item_id: 'li-11', cost_code: '02-007', description: 'HVAC', budget_amount: 14500, previously_drawn: 0, current_request: 10000, percent_complete: 69, approved_amount: 10000 },
  { id: 'dri-20', draw_request_id: 'draw-5', budget_line_item_id: 'li-18', cost_code: '03-004', description: 'Insurance', budget_amount: 12000, previously_drawn: 0, current_request: 11800, percent_complete: 98, approved_amount: 11800 },
  { id: 'dri-21', draw_request_id: 'draw-5', budget_line_item_id: 'li-20', cost_code: '04-001', description: 'Construction Loan Interest', budget_amount: 85000, previously_drawn: 26000, current_request: 8000, percent_complete: 40, approved_amount: 8000 },
  // Draw 6 - Insulation & Drywall
  { id: 'dri-22', draw_request_id: 'draw-6', budget_line_item_id: 'li-12', cost_code: '02-008', description: 'Insulation & Drywall', budget_amount: 27500, previously_drawn: 0, current_request: 27500, percent_complete: 100, approved_amount: 27500 },
  { id: 'dri-23', draw_request_id: 'draw-6', budget_line_item_id: 'li-9', cost_code: '02-005', description: 'Plumbing (Rough & Finish)', budget_amount: 16500, previously_drawn: 9500, current_request: 5700, percent_complete: 92, approved_amount: 5700 },
  { id: 'dri-24', draw_request_id: 'draw-6', budget_line_item_id: 'li-10', cost_code: '02-006', description: 'Electrical (Rough & Finish)', budget_amount: 15000, previously_drawn: 8000, current_request: 6800, percent_complete: 99, approved_amount: 6800 },
  { id: 'dri-25', draw_request_id: 'draw-6', budget_line_item_id: 'li-11', cost_code: '02-007', description: 'HVAC', budget_amount: 14500, previously_drawn: 10000, current_request: 4500, percent_complete: 100, approved_amount: 4500 },
  { id: 'dri-26', draw_request_id: 'draw-6', budget_line_item_id: 'li-20', cost_code: '04-001', description: 'Construction Loan Interest', budget_amount: 85000, previously_drawn: 34000, current_request: 8000, percent_complete: 49, approved_amount: 8000 },
  // Draw 11 - Approved, not yet funded
  { id: 'dri-27', draw_request_id: 'draw-11', budget_line_item_id: 'li-14', cost_code: '02-010', description: 'Exterior & Landscaping', budget_amount: 25000, previously_drawn: 12000, current_request: 6000, percent_complete: 72, approved_amount: 6000 },
  { id: 'dri-28', draw_request_id: 'draw-11', budget_line_item_id: 'li-13', cost_code: '02-009', description: 'Interior Finishes', budget_amount: 62000, previously_drawn: 52000, current_request: 6000, percent_complete: 94, approved_amount: 6000 },
  { id: 'dri-29', draw_request_id: 'draw-11', budget_line_item_id: 'li-20', cost_code: '04-001', description: 'Construction Loan Interest', budget_amount: 85000, previously_drawn: 54000, current_request: 8000, percent_complete: 73, approved_amount: 8000 },
  // Draw 12 - Draft
  { id: 'dri-30', draw_request_id: 'draw-12', budget_line_item_id: 'li-14', cost_code: '02-010', description: 'Exterior & Landscaping', budget_amount: 25000, previously_drawn: 18000, current_request: 7000, percent_complete: 100, approved_amount: null },
  { id: 'dri-31', draw_request_id: 'draw-12', budget_line_item_id: 'li-19', cost_code: '03-005', description: 'Legal', budget_amount: 15000, previously_drawn: 0, current_request: 9200, percent_complete: 61, approved_amount: null },
  { id: 'dri-32', draw_request_id: 'draw-12', budget_line_item_id: 'li-20', cost_code: '04-001', description: 'Construction Loan Interest', budget_amount: 85000, previously_drawn: 62000, current_request: 8000, percent_complete: 82, approved_amount: null },
];

const DEMO_DRAW_DOCUMENTS = [
  { id: 'doc-1', draw_request_id: 'draw-1', document_type: 'invoice', file_name: 'land_purchase_invoice.pdf', file_path: '/docs/draw-1/land_purchase.pdf', file_size: 245000, uploaded_at: '2024-03-19T10:00:00Z' },
  { id: 'doc-2', draw_request_id: 'draw-1', document_type: 'lien_waiver', file_name: 'lien_waiver_march.pdf', file_path: '/docs/draw-1/lien_waiver.pdf', file_size: 128000, uploaded_at: '2024-03-19T10:05:00Z' },
  { id: 'doc-3', draw_request_id: 'draw-3', document_type: 'inspection_report', file_name: 'foundation_inspection.pdf', file_path: '/docs/draw-3/inspection.pdf', file_size: 512000, uploaded_at: '2024-05-30T14:00:00Z' },
  { id: 'doc-4', draw_request_id: 'draw-3', document_type: 'photo', file_name: 'foundation_complete.jpg', file_path: '/docs/draw-3/photo1.jpg', file_size: 3200000, uploaded_at: '2024-05-28T16:00:00Z' },
  { id: 'doc-5', draw_request_id: 'draw-5', document_type: 'invoice', file_name: 'plumbing_rough_invoice.pdf', file_path: '/docs/draw-5/plumbing.pdf', file_size: 180000, uploaded_at: '2024-07-24T09:00:00Z' },
  { id: 'doc-6', draw_request_id: 'draw-5', document_type: 'invoice', file_name: 'electrical_rough_invoice.pdf', file_path: '/docs/draw-5/electrical.pdf', file_size: 195000, uploaded_at: '2024-07-24T09:05:00Z' },
];

const DEMO_DRAW_SCHEDULE = [
  { month: 'Mar 2024', projected: 485000, actual: 485000 },
  { month: 'Apr 2024', projected: 350000, actual: 320000 },
  { month: 'May 2024', projected: 380000, actual: 395000 },
  { month: 'Jun 2024', projected: 420000, actual: 410000 },
  { month: 'Jul 2024', projected: 450000, actual: 445000 },
  { month: 'Aug 2024', projected: 400000, actual: 420000 },
  { month: 'Sep 2024', projected: 380000, actual: 365000 },
  { month: 'Oct 2024', projected: 350000, actual: 340000 },
  { month: 'Nov 2024', projected: 320000, actual: 325000 },
  { month: 'Dec 2024', projected: 450000, actual: 445000 },
  { month: 'Jan 2025', projected: 400000, actual: null },
  { month: 'Feb 2025', projected: 350000, actual: null },
];

// ─── CRUD OPERATIONS ──────────────────────────────────────────────────────────

export async function getDrawRequests(projectId) {
  if (isDemoMode) {
    return DEMO_DRAW_REQUESTS
      .filter(d => d.project_id === projectId || projectId === 'demo-project-1')
      .sort((a, b) => a.draw_number - b.draw_number);
  }
  const { data, error } = await supabase
    .from('draw_requests')
    .select('*')
    .eq('project_id', projectId)
    .order('draw_number');
  if (error) throw error;
  return data || [];
}

export async function getDrawRequest(drawId) {
  if (isDemoMode) {
    return DEMO_DRAW_REQUESTS.find(d => d.id === drawId) || null;
  }
  const { data, error } = await supabase
    .from('draw_requests')
    .select('*')
    .eq('id', drawId)
    .single();
  if (error) throw error;
  return data;
}

export async function createDrawRequest(projectId, drawData) {
  if (isDemoMode) {
    const newDraw = {
      id: `draw-${Date.now()}`,
      project_id: projectId,
      ...drawData,
      status: drawData.status || 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    DEMO_DRAW_REQUESTS.push(newDraw);
    return newDraw;
  }
  const { data, error } = await supabase
    .from('draw_requests')
    .insert({ project_id: projectId, ...drawData })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateDrawRequest(drawId, updates) {
  if (isDemoMode) {
    const idx = DEMO_DRAW_REQUESTS.findIndex(d => d.id === drawId);
    if (idx >= 0) {
      Object.assign(DEMO_DRAW_REQUESTS[idx], updates, { updated_at: new Date().toISOString() });
      return DEMO_DRAW_REQUESTS[idx];
    }
    return { id: drawId, ...updates };
  }
  const { data, error } = await supabase
    .from('draw_requests')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', drawId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDrawRequest(drawId) {
  if (isDemoMode) {
    const idx = DEMO_DRAW_REQUESTS.findIndex(d => d.id === drawId);
    if (idx >= 0) DEMO_DRAW_REQUESTS.splice(idx, 1);
    return true;
  }
  const { error } = await supabase.from('draw_requests').delete().eq('id', drawId);
  if (error) throw error;
  return true;
}

// ─── DRAW REQUEST ITEMS ───────────────────────────────────────────────────────

export async function getDrawRequestItems(drawRequestId) {
  if (isDemoMode) {
    return DEMO_DRAW_ITEMS.filter(i => i.draw_request_id === drawRequestId);
  }
  const { data, error } = await supabase
    .from('draw_request_items')
    .select('*')
    .eq('draw_request_id', drawRequestId);
  if (error) throw error;
  return data || [];
}

export async function createDrawRequestItem(drawRequestId, itemData) {
  if (isDemoMode) {
    const newItem = {
      id: `dri-${Date.now()}`,
      draw_request_id: drawRequestId,
      ...itemData,
      created_at: new Date().toISOString(),
    };
    DEMO_DRAW_ITEMS.push(newItem);
    return newItem;
  }
  const { data, error } = await supabase
    .from('draw_request_items')
    .insert({ draw_request_id: drawRequestId, ...itemData })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateDrawRequestItem(itemId, updates) {
  if (isDemoMode) {
    const idx = DEMO_DRAW_ITEMS.findIndex(i => i.id === itemId);
    if (idx >= 0) Object.assign(DEMO_DRAW_ITEMS[idx], updates);
    return DEMO_DRAW_ITEMS[idx] || { id: itemId, ...updates };
  }
  const { data, error } = await supabase
    .from('draw_request_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDrawRequestItem(itemId) {
  if (isDemoMode) {
    const idx = DEMO_DRAW_ITEMS.findIndex(i => i.id === itemId);
    if (idx >= 0) DEMO_DRAW_ITEMS.splice(idx, 1);
    return true;
  }
  const { error } = await supabase.from('draw_request_items').delete().eq('id', itemId);
  if (error) throw error;
  return true;
}

// ─── DRAW REQUEST DOCUMENTS ──────────────────────────────────────────────────

export async function getDrawRequestDocuments(drawRequestId) {
  if (isDemoMode) {
    return DEMO_DRAW_DOCUMENTS.filter(d => d.draw_request_id === drawRequestId);
  }
  const { data, error } = await supabase
    .from('draw_request_documents')
    .select('*')
    .eq('draw_request_id', drawRequestId)
    .order('uploaded_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addDrawRequestDocument(drawRequestId, docData) {
  if (isDemoMode) {
    const newDoc = {
      id: `doc-${Date.now()}`,
      draw_request_id: drawRequestId,
      ...docData,
      uploaded_at: new Date().toISOString(),
    };
    DEMO_DRAW_DOCUMENTS.push(newDoc);
    return newDoc;
  }
  const { data, error } = await supabase
    .from('draw_request_documents')
    .insert({ draw_request_id: drawRequestId, ...docData })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── STATUS TRANSITIONS ───────────────────────────────────────────────────────

export async function submitDrawRequest(drawId) {
  return updateDrawRequest(drawId, {
    status: 'requested',
    submitted_date: new Date().toISOString(),
  });
}

export async function approveDrawRequest(drawId, approvedAmount) {
  return updateDrawRequest(drawId, {
    status: 'approved',
    approved_date: new Date().toISOString(),
    approved_amount: approvedAmount,
  });
}

export async function denyDrawRequest(drawId, reason) {
  return updateDrawRequest(drawId, {
    status: 'denied',
    denial_reason: reason,
  });
}

export async function fundDrawRequest(drawId, fundedAmount) {
  return updateDrawRequest(drawId, {
    status: 'funded',
    funded_date: new Date().toISOString(),
    funded_amount: fundedAmount,
    net_amount: fundedAmount,
  });
}

// ─── CALCULATION HELPERS ──────────────────────────────────────────────────────

export function calculateDrawTotals(drawRequests) {
  const funded = drawRequests.filter(d => d.status === 'funded');
  const totalRequested = drawRequests.reduce((s, d) => s + (d.requested_amount || 0), 0);
  const totalApproved = drawRequests.reduce((s, d) => s + (d.approved_amount || 0), 0);
  const totalFunded = funded.reduce((s, d) => s + (d.funded_amount || 0), 0);
  const totalRetainage = funded.reduce((s, d) => s + (d.retainage_amount || 0), 0);
  const totalNetFunded = funded.reduce((s, d) => s + (d.net_amount || 0), 0);

  return {
    totalRequested,
    totalApproved,
    totalFunded,
    totalRetainage,
    totalNetFunded,
    drawCount: drawRequests.length,
    fundedCount: funded.length,
  };
}

export function calculateBudgetIntegration(drawRequests, budgetTotal) {
  const totals = calculateDrawTotals(drawRequests);
  const remaining = budgetTotal - totals.totalFunded;
  const percentDrawn = budgetTotal > 0 ? (totals.totalFunded / budgetTotal) * 100 : 0;

  return {
    ...totals,
    budgetTotal,
    remaining: Math.max(0, remaining),
    percentDrawn,
  };
}

export function calculateLineItemDrawHistory(drawItems, budgetLineItemId) {
  const items = drawItems.filter(i => i.budget_line_item_id === budgetLineItemId);
  const totalDrawn = items.reduce((s, i) => s + (i.approved_amount || i.current_request || 0), 0);
  return { items, totalDrawn };
}

export function getNextDrawNumber(drawRequests) {
  if (!drawRequests || drawRequests.length === 0) return 1;
  return Math.max(...drawRequests.map(d => d.draw_number)) + 1;
}

export function getLoanInfo() {
  // In production, this would come from project loan data
  return DEMO_LOAN_INFO;
}

export function getDrawSchedule(projectId) {
  // In production, this would be calculated from actual draw data
  return DEMO_DRAW_SCHEDULE;
}

export function getStatusConfig(status) {
  return DRAW_STATUSES.find(s => s.value === status) || DRAW_STATUSES[0];
}
