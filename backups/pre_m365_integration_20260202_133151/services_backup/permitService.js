// src/services/permitService.js
// Service layer for Permits Module with demo data

import { isDemoMode } from '@/lib/supabase';

// ─── Constants ────────────────────────────────────────────────────────────────

export const PERMIT_TYPES = [
  { value: 'building', label: 'Building Permit' },
  { value: 'electrical', label: 'Electrical Permit' },
  { value: 'plumbing', label: 'Plumbing Permit' },
  { value: 'mechanical', label: 'Mechanical/HVAC Permit' },
  { value: 'grading', label: 'Grading Permit' },
  { value: 'demolition', label: 'Demolition Permit' },
  { value: 'fire', label: 'Fire Department Permit' },
  { value: 'health', label: 'Health Department Permit' },
  { value: 'zoning', label: 'Zoning Permit/Approval' },
  { value: 'environmental', label: 'Environmental Permit' },
  { value: 'encroachment', label: 'Encroachment Permit' },
  { value: 'other', label: 'Other' },
];

export const PERMIT_STATUSES = [
  { value: 'not_applied', label: 'Not Applied', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  { value: 'applied', label: 'Applied', color: 'bg-blue-50 text-blue-700 border-blue-300' },
  { value: 'under_review', label: 'Under Review', color: 'bg-amber-50 text-amber-700 border-amber-300' },
  { value: 'revisions_required', label: 'Revisions Required', color: 'bg-orange-50 text-orange-700 border-orange-300' },
  { value: 'approved', label: 'Approved', color: 'bg-green-50 text-green-700 border-green-300' },
  { value: 'issued', label: 'Issued', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  { value: 'expired', label: 'Expired', color: 'bg-red-50 text-red-700 border-red-300' },
  { value: 'denied', label: 'Denied', color: 'bg-red-100 text-red-800 border-red-400' },
];

export const JURISDICTIONS = [
  { value: 'city', label: 'City' },
  { value: 'county', label: 'County' },
  { value: 'state', label: 'State' },
  { value: 'federal', label: 'Federal' },
];

export const INSPECTION_RESULTS = [
  { value: 'passed', label: 'Passed', color: 'text-green-700 bg-green-50' },
  { value: 'failed', label: 'Failed', color: 'text-red-700 bg-red-50' },
  { value: 'partial', label: 'Partial', color: 'text-amber-700 bg-amber-50' },
  { value: 'cancelled', label: 'Cancelled', color: 'text-gray-700 bg-gray-50' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getPermitTypeLabel(type) {
  return PERMIT_TYPES.find(t => t.value === type)?.label || type;
}

export function getStatusConfig(status) {
  return PERMIT_STATUSES.find(s => s.value === status) || PERMIT_STATUSES[0];
}

export function getInspectionResultConfig(result) {
  return INSPECTION_RESULTS.find(r => r.value === result) || { label: result, color: 'text-gray-600 bg-gray-50' };
}

export function calculatePermitTotals(permits) {
  const totalFees = permits.reduce((s, p) => s + (p.total_fees || 0), 0);
  const paidFees = permits.filter(p => p.fees_paid).reduce((s, p) => s + (p.total_fees || 0), 0);
  const unpaidFees = totalFees - paidFees;
  const issuedCount = permits.filter(p => p.status === 'issued').length;
  const pendingCount = permits.filter(p => ['applied', 'under_review', 'revisions_required'].includes(p.status)).length;
  const expiredCount = permits.filter(p => p.status === 'expired').length;
  const notAppliedCount = permits.filter(p => p.status === 'not_applied').length;

  return { totalFees, paidFees, unpaidFees, issuedCount, pendingCount, expiredCount, notAppliedCount, totalCount: permits.length };
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

const DEMO_PERMITS = [
  {
    id: 'permit-1',
    project_id: 'demo-project-1',
    permit_type: 'building',
    permit_number: 'BLD-2025-04521',
    issuing_authority: 'City of Austin',
    jurisdiction: 'city',
    application_date: '2025-02-15',
    submitted_date: '2025-02-15',
    approved_date: '2025-04-10',
    issued_date: '2025-04-12',
    expiration_date: '2026-04-12',
    status: 'issued',
    application_fee: 500,
    permit_fee: 12500,
    impact_fees: 28000,
    total_fees: 41000,
    fees_paid: true,
    requires_inspections: true,
    inspection_count: 4,
    notes: 'Main building permit for 24-unit residential development. Approved with standard conditions.',
  },
  {
    id: 'permit-2',
    project_id: 'demo-project-1',
    permit_type: 'grading',
    permit_number: 'GRD-2025-01822',
    issuing_authority: 'Travis County',
    jurisdiction: 'county',
    application_date: '2025-01-20',
    submitted_date: '2025-01-22',
    approved_date: '2025-03-05',
    issued_date: '2025-03-07',
    expiration_date: '2025-09-07',
    status: 'issued',
    application_fee: 250,
    permit_fee: 3500,
    impact_fees: 0,
    total_fees: 3750,
    fees_paid: true,
    requires_inspections: true,
    inspection_count: 2,
    notes: 'Site grading and drainage permit. Erosion control plan approved.',
  },
  {
    id: 'permit-3',
    project_id: 'demo-project-1',
    permit_type: 'electrical',
    permit_number: 'ELE-2025-08934',
    issuing_authority: 'City of Austin',
    jurisdiction: 'city',
    application_date: '2025-05-01',
    submitted_date: '2025-05-01',
    approved_date: '2025-05-20',
    issued_date: '2025-05-22',
    expiration_date: '2026-05-22',
    status: 'issued',
    application_fee: 200,
    permit_fee: 4200,
    impact_fees: 0,
    total_fees: 4400,
    fees_paid: true,
    requires_inspections: true,
    inspection_count: 3,
    notes: 'Electrical service for all 24 units plus common areas. 400A main service.',
  },
  {
    id: 'permit-4',
    project_id: 'demo-project-1',
    permit_type: 'plumbing',
    permit_number: 'PLB-2025-05678',
    issuing_authority: 'City of Austin',
    jurisdiction: 'city',
    application_date: '2025-05-01',
    submitted_date: '2025-05-01',
    approved_date: '2025-05-18',
    issued_date: '2025-05-20',
    expiration_date: '2026-05-20',
    status: 'issued',
    application_fee: 200,
    permit_fee: 3800,
    impact_fees: 5500,
    total_fees: 9500,
    fees_paid: true,
    requires_inspections: true,
    inspection_count: 2,
    notes: 'Plumbing for all units. Water and sewer tap fees included in impact fees.',
  },
  {
    id: 'permit-5',
    project_id: 'demo-project-1',
    permit_type: 'mechanical',
    permit_number: null,
    issuing_authority: 'City of Austin',
    jurisdiction: 'city',
    application_date: '2025-06-10',
    submitted_date: '2025-06-10',
    approved_date: null,
    issued_date: null,
    expiration_date: null,
    status: 'under_review',
    application_fee: 200,
    permit_fee: 3200,
    impact_fees: 0,
    total_fees: 3400,
    fees_paid: false,
    requires_inspections: true,
    inspection_count: 0,
    notes: 'HVAC permit for 24 individual mini-split systems and common area units.',
  },
  {
    id: 'permit-6',
    project_id: 'demo-project-1',
    permit_type: 'fire',
    permit_number: 'FD-2025-02341',
    issuing_authority: 'Austin Fire Department',
    jurisdiction: 'city',
    application_date: '2025-03-15',
    submitted_date: '2025-03-15',
    approved_date: '2025-05-01',
    issued_date: '2025-05-05',
    expiration_date: '2026-05-05',
    status: 'issued',
    application_fee: 300,
    permit_fee: 2800,
    impact_fees: 0,
    total_fees: 3100,
    fees_paid: true,
    requires_inspections: true,
    inspection_count: 1,
    notes: 'Fire sprinkler and alarm system permit. NFPA 13R compliant design.',
  },
  {
    id: 'permit-7',
    project_id: 'demo-project-1',
    permit_type: 'environmental',
    permit_number: 'ENV-2025-00456',
    issuing_authority: 'Texas Commission on Environmental Quality',
    jurisdiction: 'state',
    application_date: '2024-12-01',
    submitted_date: '2024-12-05',
    approved_date: '2025-02-28',
    issued_date: '2025-03-01',
    expiration_date: '2026-03-01',
    status: 'issued',
    application_fee: 750,
    permit_fee: 5000,
    impact_fees: 0,
    total_fees: 5750,
    fees_paid: true,
    requires_inspections: false,
    inspection_count: 0,
    notes: 'Stormwater management permit. Construction General Permit (CGP) coverage.',
  },
  {
    id: 'permit-8',
    project_id: 'demo-project-1',
    permit_type: 'zoning',
    permit_number: 'ZN-2024-08123',
    issuing_authority: 'City of Austin Planning',
    jurisdiction: 'city',
    application_date: '2024-09-15',
    submitted_date: '2024-09-20',
    approved_date: '2024-12-15',
    issued_date: '2024-12-18',
    expiration_date: '2025-12-18',
    status: 'issued',
    application_fee: 1000,
    permit_fee: 2500,
    impact_fees: 15000,
    total_fees: 18500,
    fees_paid: true,
    requires_inspections: false,
    inspection_count: 0,
    notes: 'Zoning variance approved for increased density. MF-4 to MF-6 conditional use.',
  },
  {
    id: 'permit-9',
    project_id: 'demo-project-1',
    permit_type: 'demolition',
    permit_number: 'DEM-2025-00987',
    issuing_authority: 'City of Austin',
    jurisdiction: 'city',
    application_date: '2025-01-10',
    submitted_date: '2025-01-10',
    approved_date: '2025-01-25',
    issued_date: '2025-01-28',
    expiration_date: '2025-07-28',
    status: 'expired',
    application_fee: 150,
    permit_fee: 1200,
    impact_fees: 0,
    total_fees: 1350,
    fees_paid: true,
    requires_inspections: true,
    inspection_count: 1,
    notes: 'Demolition of existing single-family structure. Asbestos abatement completed prior.',
  },
  {
    id: 'permit-10',
    project_id: 'demo-project-1',
    permit_type: 'encroachment',
    permit_number: null,
    issuing_authority: 'City of Austin Public Works',
    jurisdiction: 'city',
    application_date: null,
    submitted_date: null,
    approved_date: null,
    issued_date: null,
    expiration_date: null,
    status: 'not_applied',
    application_fee: 500,
    permit_fee: 2000,
    impact_fees: 0,
    total_fees: 2500,
    fees_paid: false,
    requires_inspections: false,
    inspection_count: 0,
    notes: 'Sidewalk encroachment for temporary construction staging. Need to apply before Phase 2.',
  },
  {
    id: 'permit-11',
    project_id: 'demo-project-1',
    permit_type: 'health',
    permit_number: null,
    issuing_authority: 'Austin Public Health',
    jurisdiction: 'city',
    application_date: '2025-07-01',
    submitted_date: '2025-07-01',
    approved_date: null,
    issued_date: null,
    expiration_date: null,
    status: 'revisions_required',
    application_fee: 300,
    permit_fee: 1500,
    impact_fees: 0,
    total_fees: 1800,
    fees_paid: false,
    requires_inspections: true,
    inspection_count: 0,
    notes: 'Pool/spa permit for community amenity area. Revisions needed for drain safety compliance.',
  },
];

const DEMO_INSPECTIONS = [
  // Building permit inspections
  { id: 'insp-1', permit_id: 'permit-1', inspection_type: 'Foundation', scheduled_date: '2025-05-15', actual_date: '2025-05-15', inspector_name: 'Mike Rodriguez', result: 'passed', notes: 'Footings and rebar per plans. Approved to pour.' },
  { id: 'insp-2', permit_id: 'permit-1', inspection_type: 'Framing', scheduled_date: '2025-07-20', actual_date: '2025-07-22', inspector_name: 'Mike Rodriguez', result: 'passed', notes: 'All structural framing complete. Minor shear wall correction noted but approved.' },
  { id: 'insp-3', permit_id: 'permit-1', inspection_type: 'Insulation', scheduled_date: '2025-09-01', actual_date: '2025-09-01', inspector_name: 'Sarah Chen', result: 'passed', notes: 'R-38 attic, R-13 walls. Vapor barrier installed correctly.' },
  { id: 'insp-4', permit_id: 'permit-1', inspection_type: 'Final', scheduled_date: '2026-01-15', actual_date: null, inspector_name: null, result: null, notes: null },
  // Grading permit inspections
  { id: 'insp-5', permit_id: 'permit-2', inspection_type: 'Erosion Control', scheduled_date: '2025-03-15', actual_date: '2025-03-15', inspector_name: 'Tom Williams', result: 'passed', notes: 'Silt fences and inlet protection in place.' },
  { id: 'insp-6', permit_id: 'permit-2', inspection_type: 'Final Grade', scheduled_date: '2025-06-01', actual_date: '2025-06-03', inspector_name: 'Tom Williams', result: 'passed', notes: 'Drainage patterns confirmed per civil plans.' },
  // Electrical inspections
  { id: 'insp-7', permit_id: 'permit-3', inspection_type: 'Underground/Slab', scheduled_date: '2025-06-10', actual_date: '2025-06-10', inspector_name: 'James Park', result: 'passed', notes: 'Conduit and ground grid approved.' },
  { id: 'insp-8', permit_id: 'permit-3', inspection_type: 'Rough-In', scheduled_date: '2025-08-15', actual_date: '2025-08-15', inspector_name: 'James Park', result: 'failed', notes: 'Junction box cover missing in Unit 12. Two circuits on wrong breaker.', correction_required: 'Install missing cover. Re-route circuits per panel schedule.', reinspection_date: '2025-08-22' },
  { id: 'insp-9', permit_id: 'permit-3', inspection_type: 'Rough-In Re-inspection', scheduled_date: '2025-08-22', actual_date: '2025-08-22', inspector_name: 'James Park', result: 'passed', notes: 'Corrections verified. Approved for drywall.' },
  // Plumbing inspections
  { id: 'insp-10', permit_id: 'permit-4', inspection_type: 'Underground', scheduled_date: '2025-05-28', actual_date: '2025-05-28', inspector_name: 'Carlos Mendez', result: 'passed', notes: 'Sewer and water lines tested. No leaks.' },
  { id: 'insp-11', permit_id: 'permit-4', inspection_type: 'Top-Out', scheduled_date: '2025-08-10', actual_date: '2025-08-12', inspector_name: 'Carlos Mendez', result: 'passed', notes: 'Vent and drain-waste system approved. Water pressure test passed.' },
  // Fire inspection
  { id: 'insp-12', permit_id: 'permit-6', inspection_type: 'Sprinkler Rough-In', scheduled_date: '2025-09-15', actual_date: '2025-09-15', inspector_name: 'Lt. Amy Foster', result: 'passed', notes: 'NFPA 13R compliance confirmed. Heads and piping per approved plans.' },
  // Demolition inspection
  { id: 'insp-13', permit_id: 'permit-9', inspection_type: 'Final Demolition', scheduled_date: '2025-02-10', actual_date: '2025-02-10', inspector_name: 'Mike Rodriguez', result: 'passed', notes: 'Structure fully removed. Site cleared. Utilities capped.' },
];

// ─── CRUD Operations ──────────────────────────────────────────────────────────

export async function getPermits(projectId) {
  if (isDemoMode) {
    return DEMO_PERMITS.filter(p => p.project_id === projectId);
  }
  // Supabase query
}

export async function getPermit(permitId) {
  if (isDemoMode) {
    return DEMO_PERMITS.find(p => p.id === permitId) || null;
  }
}

export async function createPermit(projectId, permitData) {
  if (isDemoMode) {
    const newPermit = {
      id: `permit-${Date.now()}`,
      project_id: projectId,
      ...permitData,
      total_fees: (parseFloat(permitData.application_fee) || 0) +
                  (parseFloat(permitData.permit_fee) || 0) +
                  (parseFloat(permitData.impact_fees) || 0),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    DEMO_PERMITS.push(newPermit);
    return newPermit;
  }
}

export async function updatePermit(permitId, updates) {
  if (isDemoMode) {
    const idx = DEMO_PERMITS.findIndex(p => p.id === permitId);
    if (idx === -1) throw new Error('Permit not found');
    DEMO_PERMITS[idx] = { ...DEMO_PERMITS[idx], ...updates, updated_at: new Date().toISOString() };
    return DEMO_PERMITS[idx];
  }
}

export async function deletePermit(permitId) {
  if (isDemoMode) {
    const idx = DEMO_PERMITS.findIndex(p => p.id === permitId);
    if (idx !== -1) DEMO_PERMITS.splice(idx, 1);
    return true;
  }
}

// ─── Status Transitions ───────────────────────────────────────────────────────

export async function updatePermitStatus(permitId, newStatus, dateFields = {}) {
  if (isDemoMode) {
    const idx = DEMO_PERMITS.findIndex(p => p.id === permitId);
    if (idx === -1) throw new Error('Permit not found');
    DEMO_PERMITS[idx] = {
      ...DEMO_PERMITS[idx],
      status: newStatus,
      ...dateFields,
      updated_at: new Date().toISOString(),
    };
    return DEMO_PERMITS[idx];
  }
}

// ─── Inspections ──────────────────────────────────────────────────────────────

export async function getPermitInspections(permitId) {
  if (isDemoMode) {
    return DEMO_INSPECTIONS.filter(i => i.permit_id === permitId);
  }
}

export async function addInspection(permitId, inspectionData) {
  if (isDemoMode) {
    const inspection = {
      id: `insp-${Date.now()}`,
      permit_id: permitId,
      ...inspectionData,
      created_at: new Date().toISOString(),
    };
    DEMO_INSPECTIONS.push(inspection);
    // Update count
    const permit = DEMO_PERMITS.find(p => p.id === permitId);
    if (permit) permit.inspection_count = DEMO_INSPECTIONS.filter(i => i.permit_id === permitId).length;
    return inspection;
  }
}

export async function updateInspection(inspectionId, updates) {
  if (isDemoMode) {
    const idx = DEMO_INSPECTIONS.findIndex(i => i.id === inspectionId);
    if (idx === -1) throw new Error('Inspection not found');
    DEMO_INSPECTIONS[idx] = { ...DEMO_INSPECTIONS[idx], ...updates };
    return DEMO_INSPECTIONS[idx];
  }
}
