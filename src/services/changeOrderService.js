// src/services/changeOrderService.js
// Change Orders Module Service - CRUD, approval workflow, and budget integration

import { supabase, isDemoMode } from '@/lib/supabase';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

export const CO_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'denied', label: 'Denied', color: 'bg-red-100 text-red-700 border-red-200' },
];

export const CO_REASONS = [
  { value: 'owner_request', label: 'Owner Request' },
  { value: 'unforeseen_condition', label: 'Unforeseen Site Condition' },
  { value: 'design_change', label: 'Design Change' },
  { value: 'code_requirement', label: 'Code Requirement' },
  { value: 'value_engineering', label: 'Value Engineering' },
  { value: 'other', label: 'Other' },
];

export const CO_DOCUMENT_TYPES = [
  { value: 'proposal', label: 'Proposal' },
  { value: 'backup', label: 'Backup/Estimate' },
  { value: 'photo', label: 'Photo' },
  { value: 'correspondence', label: 'Correspondence' },
  { value: 'other', label: 'Other' },
];

// ─── DEMO DATA ────────────────────────────────────────────────────────────────

const DEMO_CONTRACTORS = [
  { id: 'contractor-1', name: 'Summit Builders LLC' },
  { id: 'contractor-2', name: 'Elite Plumbing Co.' },
  { id: 'contractor-3', name: 'Pro Electric Inc.' },
  { id: 'contractor-4', name: 'Precision Framing' },
  { id: 'contractor-5', name: 'AllWeather Roofing' },
  { id: 'contractor-6', name: 'GreenScape Landscaping' },
];

const DEMO_CHANGE_ORDERS = [
  {
    id: 'co-1',
    project_id: 'demo-project-1',
    budget_id: 'budget-1',
    co_number: 1,
    title: 'Upgrade to tankless water heater',
    description: 'Replace standard 50-gallon tank water heater with Rinnai RU199iN tankless unit. Includes additional gas line and venting modifications.',
    reason: 'owner_request',
    contractor_id: 'contractor-2',
    contractor_name: 'Elite Plumbing Co.',
    contractor_reference: 'EP-2024-089',
    amount: 4200,
    budget_line_item_id: 'li-9',
    budget_line_item_name: 'Plumbing (Rough & Finish)',
    submitted_date: '2024-06-15',
    approval_deadline: '2024-06-22',
    approved_date: '2024-06-18',
    status: 'approved',
    approved_by: 'user-1',
    approval_notes: 'Approved - owner confirmed upgrade at last meeting',
    is_paid: true,
    paid_date: '2024-07-15',
    paid_amount: 4200,
    notes: 'Owner requested during walkthrough on 6/12',
    created_at: '2024-06-15T10:00:00Z',
  },
  {
    id: 'co-2',
    project_id: 'demo-project-1',
    budget_id: 'budget-1',
    co_number: 2,
    title: 'Additional electrical outlets in garage',
    description: 'Add 4 additional 20A circuits in garage: 2 for EV charger prep, 1 for workbench, 1 for freezer. Includes sub-panel upgrade.',
    reason: 'owner_request',
    contractor_id: 'contractor-3',
    contractor_name: 'Pro Electric Inc.',
    contractor_reference: 'PE-CO-2024-12',
    amount: 3800,
    budget_line_item_id: 'li-10',
    budget_line_item_name: 'Electrical (Rough & Finish)',
    submitted_date: '2024-07-02',
    approval_deadline: '2024-07-09',
    approved_date: '2024-07-05',
    status: 'approved',
    approved_by: 'user-1',
    approval_notes: 'Good value add for resale - approved',
    is_paid: true,
    paid_date: '2024-08-01',
    paid_amount: 3800,
    notes: 'EV charger prep becoming standard in market',
    created_at: '2024-07-02T10:00:00Z',
  },
  {
    id: 'co-3',
    project_id: 'demo-project-1',
    budget_id: 'budget-1',
    co_number: 3,
    title: 'Rock removal during foundation excavation',
    description: 'Encountered unexpected rock shelf at 4ft depth. Requires hydraulic hammering and haul-off of approximately 15 cubic yards of rock.',
    reason: 'unforeseen_condition',
    contractor_id: 'contractor-1',
    contractor_name: 'Summit Builders LLC',
    contractor_reference: 'SB-CO-003',
    amount: 8500,
    budget_line_item_id: 'li-6',
    budget_line_item_name: 'Foundation',
    submitted_date: '2024-05-20',
    approval_deadline: '2024-05-23',
    approved_date: '2024-05-21',
    status: 'approved',
    approved_by: 'user-1',
    approval_notes: 'Verified by site visit - rock confirmed. Price is reasonable.',
    is_paid: true,
    paid_date: '2024-06-15',
    paid_amount: 8500,
    notes: 'Geotech report did not indicate rock at this depth',
    created_at: '2024-05-20T08:00:00Z',
  },
  {
    id: 'co-4',
    project_id: 'demo-project-1',
    budget_id: 'budget-1',
    co_number: 4,
    title: 'Roof pitch change from 6/12 to 8/12',
    description: 'Modify roof pitch on front elevation from 6/12 to 8/12 per architect revision. Affects approximately 1,200 SF of roof area. Additional trusses and sheathing required.',
    reason: 'design_change',
    contractor_id: 'contractor-4',
    contractor_name: 'Precision Framing',
    contractor_reference: 'PF-2024-CO-7',
    amount: 6200,
    budget_line_item_id: 'li-7',
    budget_line_item_name: 'Framing',
    submitted_date: '2024-06-28',
    approval_deadline: '2024-07-05',
    approved_date: '2024-07-01',
    status: 'approved',
    approved_by: 'user-1',
    approval_notes: 'Architect confirmed this improves curb appeal significantly',
    is_paid: false,
    paid_date: null,
    paid_amount: null,
    notes: 'Architect Rev 3 dated 6/25',
    created_at: '2024-06-28T10:00:00Z',
  },
  {
    id: 'co-5',
    project_id: 'demo-project-1',
    budget_id: 'budget-1',
    co_number: 5,
    title: 'Upgraded impact-rated windows',
    description: 'Replace standard Low-E windows with impact-rated windows per updated county code requirement effective 7/1/2024. Affects 24 window units.',
    reason: 'code_requirement',
    contractor_id: 'contractor-1',
    contractor_name: 'Summit Builders LLC',
    contractor_reference: 'SB-CO-005',
    amount: 12800,
    budget_line_item_id: 'li-13',
    budget_line_item_name: 'Interior Finishes',
    submitted_date: '2024-07-08',
    approval_deadline: '2024-07-12',
    approved_date: '2024-07-10',
    status: 'approved',
    approved_by: 'user-1',
    approval_notes: 'Code requirement - must comply. Good insurance discount benefit.',
    is_paid: false,
    paid_date: null,
    paid_amount: null,
    notes: 'County ordinance 2024-178 effective 7/1/2024',
    created_at: '2024-07-08T10:00:00Z',
  },
  {
    id: 'co-6',
    project_id: 'demo-project-1',
    budget_id: 'budget-1',
    co_number: 6,
    title: 'Value engineering - alternate countertop material',
    description: 'Switch from granite to upgraded quartz for kitchen and bath countertops. Quartz is more durable with lower maintenance. Net credit to project.',
    reason: 'value_engineering',
    contractor_id: 'contractor-1',
    contractor_name: 'Summit Builders LLC',
    contractor_reference: 'SB-CO-006',
    amount: -2400,
    budget_line_item_id: 'li-13',
    budget_line_item_name: 'Interior Finishes',
    submitted_date: '2024-08-05',
    approval_deadline: '2024-08-12',
    approved_date: '2024-08-07',
    status: 'approved',
    approved_by: 'user-1',
    approval_notes: 'Good VE item - better product at lower cost',
    is_paid: false,
    paid_date: null,
    paid_amount: null,
    notes: 'Quartz vendor offering bulk pricing through Q3',
    created_at: '2024-08-05T10:00:00Z',
  },
  {
    id: 'co-7',
    project_id: 'demo-project-1',
    budget_id: 'budget-1',
    co_number: 7,
    title: 'Extended landscape package with irrigation',
    description: 'Add full front and backyard irrigation system with smart controller, expand landscape bed areas, add 3 shade trees and privacy hedge along east property line.',
    reason: 'owner_request',
    contractor_id: 'contractor-6',
    contractor_name: 'GreenScape Landscaping',
    contractor_reference: 'GS-2024-045',
    amount: 9500,
    budget_line_item_id: 'li-14',
    budget_line_item_name: 'Exterior & Landscaping',
    submitted_date: '2024-10-15',
    approval_deadline: '2024-10-22',
    approved_date: null,
    status: 'pending',
    approved_by: null,
    approval_notes: null,
    is_paid: false,
    paid_date: null,
    paid_amount: null,
    notes: 'Pricing valid through 11/30/2024',
    created_at: '2024-10-15T10:00:00Z',
  },
  {
    id: 'co-8',
    project_id: 'demo-project-1',
    budget_id: 'budget-1',
    co_number: 8,
    title: 'Repair water-damaged subfloor section',
    description: 'Replace 120 SF of water-damaged OSB subfloor in master bedroom area. Damage occurred from overnight rain before roof was completed. Includes mold treatment.',
    reason: 'unforeseen_condition',
    contractor_id: 'contractor-4',
    contractor_name: 'Precision Framing',
    contractor_reference: 'PF-2024-CO-11',
    amount: 3200,
    budget_line_item_id: 'li-7',
    budget_line_item_name: 'Framing',
    submitted_date: '2024-11-02',
    approval_deadline: '2024-11-05',
    approved_date: null,
    status: 'pending',
    approved_by: null,
    approval_notes: null,
    is_paid: false,
    paid_date: null,
    paid_amount: null,
    notes: 'Photos documented on 10/30. Insurance claim being filed.',
    created_at: '2024-11-02T10:00:00Z',
  },
  {
    id: 'co-9',
    project_id: 'demo-project-1',
    budget_id: 'budget-1',
    co_number: 9,
    title: 'Add whole-house surge protector',
    description: 'Install Eaton CHSPT2ULTRA whole-house surge protector at main panel. Required per updated electrical code.',
    reason: 'code_requirement',
    contractor_id: 'contractor-3',
    contractor_name: 'Pro Electric Inc.',
    contractor_reference: 'PE-CO-2024-18',
    amount: 850,
    budget_line_item_id: 'li-10',
    budget_line_item_name: 'Electrical (Rough & Finish)',
    submitted_date: '2024-09-10',
    approval_deadline: '2024-09-17',
    approved_date: null,
    status: 'denied',
    approved_by: 'user-1',
    denial_reason: 'Already included in original scope per spec sheet item E-14. Contractor confirmed this was an error.',
    is_paid: false,
    paid_date: null,
    paid_amount: null,
    notes: 'Retracted by contractor',
    created_at: '2024-09-10T10:00:00Z',
  },
  {
    id: 'co-10',
    project_id: 'demo-project-1',
    budget_id: 'budget-1',
    co_number: 10,
    title: 'Permit redlines rework and resubmittal',
    description: 'City plan review returned redlines requiring updated lateral calculations, shear wall nailing schedule, and revised site drainage detail. Includes design team time and resubmittal fees.',
    reason: 'code_requirement',
    contractor_id: 'contractor-1',
    contractor_name: 'Summit Builders LLC',
    contractor_reference: 'SB-CO-010',
    amount: 5600,
    budget_line_item_id: 'li-5',
    budget_line_item_name: 'Permitting & Engineering',
    submitted_date: '2024-11-12',
    approval_deadline: '2024-11-19',
    approved_date: null,
    status: 'pending',
    approved_by: null,
    approval_notes: null,
    is_paid: false,
    paid_date: null,
    paid_amount: null,
    notes: 'Redlines issued 11/10; resubmittal targeting 11/18',
    created_at: '2024-11-12T09:00:00Z',
  },
];

const parseCloneMeta = (changeOrderId) => {
  const parts = changeOrderId.split('-');
  if (parts.length <= 2) return { baseId: changeOrderId, projectId: null };
  const baseId = `${parts[0]}-${parts[1]}`;
  const projectId = parts.slice(2, -1).join('-') || null;
  return { baseId, projectId };
};

const cloneChangeOrderDataForProject = (projectId) => {
  const idMap = new Map();
  const changeOrders = DEMO_CHANGE_ORDERS.map((co, idx) => {
    const newId = `${co.id}-${projectId}-${idx}`;
    idMap.set(co.id, newId);
    return {
      ...co,
      id: newId,
      project_id: projectId,
    };
  });

  const documents = DEMO_CO_DOCUMENTS.map((doc, idx) => {
    const mappedId = idMap.get(doc.change_order_id);
    if (!mappedId) return null;
    return {
      ...doc,
      id: `${doc.id}-${projectId}-${idx}`,
      change_order_id: mappedId,
    };
  }).filter(Boolean);

  return { changeOrders, documents };
};

const DEMO_CO_DOCUMENTS = [
  { id: 'cod-1', change_order_id: 'co-1', document_type: 'proposal', file_name: 'tankless_heater_proposal.pdf', file_path: '/docs/co-1/proposal.pdf', file_size: 245000, uploaded_at: '2024-06-15T10:00:00Z' },
  { id: 'cod-2', change_order_id: 'co-3', document_type: 'photo', file_name: 'rock_shelf_photo_1.jpg', file_path: '/docs/co-3/photo1.jpg', file_size: 3200000, uploaded_at: '2024-05-20T08:30:00Z' },
  { id: 'cod-3', change_order_id: 'co-3', document_type: 'photo', file_name: 'rock_shelf_photo_2.jpg', file_path: '/docs/co-3/photo2.jpg', file_size: 2800000, uploaded_at: '2024-05-20T08:35:00Z' },
  { id: 'cod-4', change_order_id: 'co-3', document_type: 'backup', file_name: 'rock_removal_estimate.pdf', file_path: '/docs/co-3/estimate.pdf', file_size: 158000, uploaded_at: '2024-05-20T09:00:00Z' },
  { id: 'cod-5', change_order_id: 'co-4', document_type: 'correspondence', file_name: 'architect_revision_email.pdf', file_path: '/docs/co-4/email.pdf', file_size: 95000, uploaded_at: '2024-06-28T10:15:00Z' },
  { id: 'cod-6', change_order_id: 'co-5', document_type: 'backup', file_name: 'window_specs_impact_rated.pdf', file_path: '/docs/co-5/specs.pdf', file_size: 520000, uploaded_at: '2024-07-08T10:30:00Z' },
  { id: 'cod-7', change_order_id: 'co-7', document_type: 'proposal', file_name: 'landscape_proposal_extended.pdf', file_path: '/docs/co-7/proposal.pdf', file_size: 1200000, uploaded_at: '2024-10-15T10:00:00Z' },
  { id: 'cod-8', change_order_id: 'co-8', document_type: 'photo', file_name: 'water_damage_master_bedroom.jpg', file_path: '/docs/co-8/photo1.jpg', file_size: 4100000, uploaded_at: '2024-11-02T10:00:00Z' },
  { id: 'cod-9', change_order_id: 'co-10', document_type: 'proposal', file_name: 'permit_redline_rework_quote.pdf', file_path: '/docs/co-10/quote.pdf', file_size: 265000, uploaded_at: '2024-11-12T09:05:00Z' },
];

// ─── CRUD OPERATIONS ──────────────────────────────────────────────────────────

export async function getChangeOrders(projectId) {
  if (isDemoMode) {
    return DEMO_CHANGE_ORDERS
      .filter(co => co.project_id === projectId || projectId === 'demo-project-1')
      .sort((a, b) => a.co_number - b.co_number);
  }
  const { data, error } = await supabase
    .from('change_orders')
    .select('*')
    .eq('project_id', projectId)
    .order('co_number');
  if (!error && data && data.length) return data;
  const { changeOrders } = cloneChangeOrderDataForProject(projectId);
  return changeOrders;
}

export async function getChangeOrder(coId) {
  if (isDemoMode) {
    return DEMO_CHANGE_ORDERS.find(co => co.id === coId) || null;
  }
  const { data, error } = await supabase
    .from('change_orders')
    .select('*')
    .eq('id', coId)
    .single();
  if (!error && data) return data;

  const { baseId, projectId } = parseCloneMeta(coId);
  const demoMatch = DEMO_CHANGE_ORDERS.find(co => co.id === baseId);
  if (!demoMatch) return null;

  if (projectId) {
    return { ...demoMatch, id: coId, project_id: projectId };
  }

  const { changeOrders } = cloneChangeOrderDataForProject('demo-project-1');
  return changeOrders.find(co => co.id === coId) || demoMatch;
}

export async function createChangeOrder(projectId, coData) {
  if (isDemoMode) {
    const newCO = {
      id: `co-${Date.now()}`,
      project_id: projectId,
      ...coData,
      status: 'pending',
      is_paid: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    DEMO_CHANGE_ORDERS.push(newCO);
    return newCO;
  }
  const { data, error } = await supabase
    .from('change_orders')
    .insert({ project_id: projectId, ...coData })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateChangeOrder(coId, updates) {
  if (isDemoMode) {
    const idx = DEMO_CHANGE_ORDERS.findIndex(co => co.id === coId);
    if (idx >= 0) {
      Object.assign(DEMO_CHANGE_ORDERS[idx], updates, { updated_at: new Date().toISOString() });
      return DEMO_CHANGE_ORDERS[idx];
    }
    return { id: coId, ...updates };
  }
  const { data, error } = await supabase
    .from('change_orders')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', coId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteChangeOrder(coId) {
  if (isDemoMode) {
    const idx = DEMO_CHANGE_ORDERS.findIndex(co => co.id === coId);
    if (idx >= 0) DEMO_CHANGE_ORDERS.splice(idx, 1);
    return true;
  }
  const { error } = await supabase.from('change_orders').delete().eq('id', coId);
  if (error) throw error;
  return true;
}

// ─── APPROVAL WORKFLOW ────────────────────────────────────────────────────────

export async function approveChangeOrder(coId, notes) {
  return updateChangeOrder(coId, {
    status: 'approved',
    approved_date: new Date().toISOString().split('T')[0],
    approved_by: 'user-1', // In production, from auth context
    approval_notes: notes || '',
  });
}

export async function denyChangeOrder(coId, reason) {
  return updateChangeOrder(coId, {
    status: 'denied',
    denial_reason: reason,
    approved_by: 'user-1',
  });
}

export async function markCOPaid(coId, paidAmount, paidDate) {
  return updateChangeOrder(coId, {
    is_paid: true,
    paid_date: paidDate || new Date().toISOString().split('T')[0],
    paid_amount: paidAmount,
  });
}

// ─── DOCUMENTS ────────────────────────────────────────────────────────────────

export async function getCODocuments(changeOrderId) {
  if (isDemoMode) {
    return DEMO_CO_DOCUMENTS.filter(d => d.change_order_id === changeOrderId);
  }
  const { data, error } = await supabase
    .from('change_order_documents')
    .select('*')
    .eq('change_order_id', changeOrderId)
    .order('uploaded_at', { ascending: false });
  if (!error && data && data.length) return data;

  const { baseId, projectId } = parseCloneMeta(changeOrderId);
  if (!projectId) {
    return DEMO_CO_DOCUMENTS.filter(d => d.change_order_id === baseId);
  }

  const { documents } = cloneChangeOrderDataForProject(projectId);
  return documents.filter(d => d.change_order_id === changeOrderId || d.change_order_id === baseId);
}

export async function addCODocument(changeOrderId, docData) {
  if (isDemoMode) {
    const newDoc = {
      id: `cod-${Date.now()}`,
      change_order_id: changeOrderId,
      ...docData,
      uploaded_at: new Date().toISOString(),
    };
    DEMO_CO_DOCUMENTS.push(newDoc);
    return newDoc;
  }
  const { data, error } = await supabase
    .from('change_order_documents')
    .insert({ change_order_id: changeOrderId, ...docData })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export function calculateCOTotals(changeOrders) {
  const pending = changeOrders.filter(co => co.status === 'pending');
  const approved = changeOrders.filter(co => co.status === 'approved');
  const denied = changeOrders.filter(co => co.status === 'denied');

  const pendingAmount = pending.reduce((s, co) => s + co.amount, 0);
  const approvedAmount = approved.reduce((s, co) => s + co.amount, 0);
  const netChange = [...pending, ...approved].reduce((s, co) => s + co.amount, 0);
  const paidAmount = approved.filter(co => co.is_paid).reduce((s, co) => s + (co.paid_amount || co.amount), 0);
  const unpaidAmount = approved.filter(co => !co.is_paid).reduce((s, co) => s + co.amount, 0);

  return {
    pendingCount: pending.length,
    pendingAmount,
    approvedCount: approved.length,
    approvedAmount,
    deniedCount: denied.length,
    netChange,
    paidAmount,
    unpaidAmount,
    totalCount: changeOrders.length,
  };
}

export function getNextCONumber(changeOrders) {
  if (!changeOrders || changeOrders.length === 0) return 1;
  return Math.max(...changeOrders.map(co => co.co_number)) + 1;
}

export function formatCONumber(num) {
  return `CO-${String(num).padStart(3, '0')}`;
}

export function getStatusConfig(status) {
  return CO_STATUSES.find(s => s.value === status) || CO_STATUSES[0];
}

export function getReasonLabel(reason) {
  const found = CO_REASONS.find(r => r.value === reason);
  return found?.label || reason?.replace(/_/g, ' ') || 'Unknown';
}

export function getContractors() {
  return DEMO_CONTRACTORS;
}
