// src/services/constructionService.js
// Construction Management Service - Contractor Operations (Red Cedar)
// Handles jobs, subcontractors, purchase orders, job costing, and field operations

import { supabase } from '@/lib/supabase';

// ============================================
// JOB STATUS CONSTANTS
// ============================================

export const JOB_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  CLOSED: 'closed',
};

export const JOB_STATUS_LABELS = {
  [JOB_STATUS.PENDING]: 'Pending',
  [JOB_STATUS.ACTIVE]: 'Active',
  [JOB_STATUS.ON_HOLD]: 'On Hold',
  [JOB_STATUS.COMPLETED]: 'Completed',
  [JOB_STATUS.CLOSED]: 'Closed',
};

export const PO_STATUS = {
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  PARTIALLY_RECEIVED: 'partially_received',
  RECEIVED: 'received',
  CANCELLED: 'cancelled',
};

export const PO_STATUS_LABELS = {
  [PO_STATUS.DRAFT]: 'Draft',
  [PO_STATUS.PENDING_APPROVAL]: 'Pending Approval',
  [PO_STATUS.APPROVED]: 'Approved',
  [PO_STATUS.PARTIALLY_RECEIVED]: 'Partially Received',
  [PO_STATUS.RECEIVED]: 'Received',
  [PO_STATUS.CANCELLED]: 'Cancelled',
};

export const INSPECTION_TYPE = {
  FOOTING: 'footing',
  FOUNDATION: 'foundation',
  SLAB: 'slab',
  FRAMING: 'framing',
  ROUGH_IN: 'rough_in',
  ELECTRICAL: 'electrical',
  PLUMBING: 'plumbing',
  HVAC: 'hvac',
  INSULATION: 'insulation',
  DRYWALL: 'drywall',
  FINAL: 'final',
  OTHER: 'other',
};

export const INSPECTION_TYPE_LABELS = {
  [INSPECTION_TYPE.FOOTING]: 'Footing',
  [INSPECTION_TYPE.FOUNDATION]: 'Foundation',
  [INSPECTION_TYPE.SLAB]: 'Slab',
  [INSPECTION_TYPE.FRAMING]: 'Framing',
  [INSPECTION_TYPE.ROUGH_IN]: 'Rough-In',
  [INSPECTION_TYPE.ELECTRICAL]: 'Electrical',
  [INSPECTION_TYPE.PLUMBING]: 'Plumbing',
  [INSPECTION_TYPE.HVAC]: 'HVAC',
  [INSPECTION_TYPE.INSULATION]: 'Insulation',
  [INSPECTION_TYPE.DRYWALL]: 'Drywall',
  [INSPECTION_TYPE.FINAL]: 'Final',
  [INSPECTION_TYPE.OTHER]: 'Other',
};

export const INSPECTION_RESULT = {
  PASSED: 'passed',
  FAILED: 'failed',
  PARTIAL: 'partial',
  CANCELLED: 'cancelled',
};

export const PERMIT_STATUS = {
  NOT_APPLIED: 'not_applied',
  APPLIED: 'applied',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  ISSUED: 'issued',
  EXPIRED: 'expired',
  CLOSED: 'closed',
};

export const RFI_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  IN_REVIEW: 'in_review',
  ANSWERED: 'answered',
  CLOSED: 'closed',
};

export const SUBMITTAL_STATUS = {
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  APPROVED_AS_NOTED: 'approved_as_noted',
  REVISE_RESUBMIT: 'revise_resubmit',
  REJECTED: 'rejected',
};

export const PUNCH_ITEM_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  VERIFIED: 'verified',
};

export const WARRANTY_STATUS = {
  ACTIVE: 'active',
  CLAIM_OPEN: 'claim_open',
  CLAIM_IN_PROGRESS: 'claim_in_progress',
  CLAIM_RESOLVED: 'claim_resolved',
  EXPIRED: 'expired',
};

// ============================================
// COST CODE CATEGORIES (CSI MasterFormat Based)
// ============================================

export const COST_CODE_DIVISIONS = {
  '00': 'Procurement & Contracting',
  '01': 'General Requirements',
  '02': 'Existing Conditions',
  '03': 'Concrete',
  '04': 'Masonry',
  '05': 'Metals',
  '06': 'Wood, Plastics & Composites',
  '07': 'Thermal & Moisture Protection',
  '08': 'Openings',
  '09': 'Finishes',
  '10': 'Specialties',
  '11': 'Equipment',
  '12': 'Furnishings',
  '21': 'Fire Suppression',
  '22': 'Plumbing',
  '23': 'HVAC',
  '26': 'Electrical',
  '27': 'Communications',
  '31': 'Earthwork',
  '32': 'Exterior Improvements',
  '33': 'Utilities',
};

// ============================================
// JOBS CRUD
// ============================================

export const getJobs = async (filters = {}) => {
  let query = supabase
    .from('construction_jobs')
    .select(`
      *,
      project:projects(id, name, address, status),
      contractor_entity:entities!contractor_entity_id(id, name),
      owner_entity:entities!owner_entity_id(id, name),
      project_manager:user_profiles!project_manager_id(id, full_name, email),
      superintendent:user_profiles!superintendent_id(id, full_name, email)
    `)
    .order('created_at', { ascending: false });

  if (filters.contractor_entity_id) {
    query = query.eq('contractor_entity_id', filters.contractor_entity_id);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.project_id) {
    query = query.eq('project_id', filters.project_id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getJobById = async (jobId) => {
  const { data, error } = await supabase
    .from('construction_jobs')
    .select(`
      *,
      project:projects(id, name, address, status, owner_entity_id),
      contractor_entity:entities!contractor_entity_id(id, name),
      owner_entity:entities!owner_entity_id(id, name),
      project_manager:user_profiles!project_manager_id(id, full_name, email),
      superintendent:user_profiles!superintendent_id(id, full_name, email)
    `)
    .eq('id', jobId)
    .single();

  if (error) throw error;
  return data;
};

export const createJob = async (jobData) => {
  // Generate job number
  const { data: lastJob } = await supabase
    .from('construction_jobs')
    .select('job_number')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const nextNumber = lastJob 
    ? parseInt(lastJob.job_number.replace('JOB-', '')) + 1 
    : 1001;

  const { data, error } = await supabase
    .from('construction_jobs')
    .insert({
      ...jobData,
      job_number: `JOB-${nextNumber}`,
      status: JOB_STATUS.PENDING,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateJob = async (jobId, updates) => {
  const { data, error } = await supabase
    .from('construction_jobs')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteJob = async (jobId) => {
  const { error } = await supabase
    .from('construction_jobs')
    .delete()
    .eq('id', jobId);

  if (error) throw error;
  return true;
};

// ============================================
// COST CODES
// ============================================

export const getCostCodes = async (jobId) => {
  const { data, error } = await supabase
    .from('job_cost_codes')
    .select('*')
    .eq('job_id', jobId)
    .order('code', { ascending: true });

  if (error) throw error;
  return data;
};

export const createCostCode = async (costCodeData) => {
  const { data, error } = await supabase
    .from('job_cost_codes')
    .insert(costCodeData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateCostCode = async (costCodeId, updates) => {
  const { data, error } = await supabase
    .from('job_cost_codes')
    .update(updates)
    .eq('id', costCodeId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getJobCostSummary = async (jobId) => {
  const { data: costCodes, error } = await supabase
    .from('job_cost_codes')
    .select('*')
    .eq('job_id', jobId);

  if (error) throw error;

  const summary = {
    total_budget: 0,
    total_committed: 0,
    total_actual: 0,
    total_remaining: 0,
    variance: 0,
    by_division: {},
  };

  costCodes.forEach(cc => {
    summary.total_budget += cc.budget_amount || 0;
    summary.total_committed += cc.committed_amount || 0;
    summary.total_actual += cc.actual_amount || 0;

    const division = cc.code.substring(0, 2);
    if (!summary.by_division[division]) {
      summary.by_division[division] = {
        name: COST_CODE_DIVISIONS[division] || 'Other',
        budget: 0,
        committed: 0,
        actual: 0,
      };
    }
    summary.by_division[division].budget += cc.budget_amount || 0;
    summary.by_division[division].committed += cc.committed_amount || 0;
    summary.by_division[division].actual += cc.actual_amount || 0;
  });

  summary.total_remaining = summary.total_budget - summary.total_actual;
  summary.variance = summary.total_budget - summary.total_committed;

  return summary;
};

// ============================================
// SUBCONTRACTORS
// ============================================

export const getSubcontractors = async (filters = {}) => {
  let query = supabase
    .from('subcontractors')
    .select(`
      *,
      contact:contacts(id, first_name, last_name, email, phone, company)
    `)
    .order('company_name', { ascending: true });

  if (filters.trade) {
    query = query.eq('trade', filters.trade);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.entity_id) {
    query = query.eq('entity_id', filters.entity_id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getSubcontractorById = async (subId) => {
  const { data, error } = await supabase
    .from('subcontractors')
    .select(`
      *,
      contact:contacts(id, first_name, last_name, email, phone, company),
      insurance_certificates:subcontractor_insurance(*),
      lien_waivers:subcontractor_lien_waivers(*)
    `)
    .eq('id', subId)
    .single();

  if (error) throw error;
  return data;
};

export const createSubcontractor = async (subData) => {
  const { data, error } = await supabase
    .from('subcontractors')
    .insert({
      ...subData,
      status: 'active',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateSubcontractor = async (subId, updates) => {
  const { data, error } = await supabase
    .from('subcontractors')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', subId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// INSURANCE CERTIFICATES (COIs)
// ============================================

export const getInsuranceCertificates = async (subcontractorId) => {
  const { data, error } = await supabase
    .from('subcontractor_insurance')
    .select('*')
    .eq('subcontractor_id', subcontractorId)
    .order('expiration_date', { ascending: true });

  if (error) throw error;
  return data;
};

export const createInsuranceCertificate = async (certData) => {
  const { data, error } = await supabase
    .from('subcontractor_insurance')
    .insert(certData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getExpiringInsurance = async (daysAhead = 30) => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  const { data, error } = await supabase
    .from('subcontractor_insurance')
    .select(`
      *,
      subcontractor:subcontractors(id, company_name, trade)
    `)
    .lte('expiration_date', futureDate.toISOString())
    .gte('expiration_date', new Date().toISOString())
    .order('expiration_date', { ascending: true });

  if (error) throw error;
  return data;
};

// ============================================
// LIEN WAIVERS
// ============================================

export const getLienWaivers = async (filters = {}) => {
  let query = supabase
    .from('subcontractor_lien_waivers')
    .select(`
      *,
      subcontractor:subcontractors(id, company_name),
      job:construction_jobs(id, job_number, name)
    `)
    .order('created_at', { ascending: false });

  if (filters.subcontractor_id) {
    query = query.eq('subcontractor_id', filters.subcontractor_id);
  }
  if (filters.job_id) {
    query = query.eq('job_id', filters.job_id);
  }
  if (filters.type) {
    query = query.eq('waiver_type', filters.type);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const createLienWaiver = async (waiverData) => {
  const { data, error } = await supabase
    .from('subcontractor_lien_waivers')
    .insert(waiverData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// PURCHASE ORDERS
// ============================================

export const getPurchaseOrders = async (filters = {}) => {
  let query = supabase
    .from('purchase_orders')
    .select(`
      *,
      job:construction_jobs(id, job_number, name),
      vendor:contacts(id, first_name, last_name, company),
      cost_code:job_cost_codes(id, code, description),
      created_by:user_profiles!created_by(id, full_name),
      approved_by:user_profiles!approved_by(id, full_name)
    `)
    .order('created_at', { ascending: false });

  if (filters.job_id) {
    query = query.eq('job_id', filters.job_id);
  }
  if (filters.vendor_id) {
    query = query.eq('vendor_id', filters.vendor_id);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.entity_id) {
    query = query.eq('entity_id', filters.entity_id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getPurchaseOrderById = async (poId) => {
  const { data, error } = await supabase
    .from('purchase_orders')
    .select(`
      *,
      job:construction_jobs(id, job_number, name, project_id),
      vendor:contacts(id, first_name, last_name, company, email, phone),
      cost_code:job_cost_codes(id, code, description),
      line_items:purchase_order_items(*),
      created_by:user_profiles!created_by(id, full_name),
      approved_by:user_profiles!approved_by(id, full_name)
    `)
    .eq('id', poId)
    .single();

  if (error) throw error;
  return data;
};

export const createPurchaseOrder = async (poData) => {
  // Generate PO number
  const { data: lastPO } = await supabase
    .from('purchase_orders')
    .select('po_number')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const nextNumber = lastPO 
    ? parseInt(lastPO.po_number.replace('PO-', '')) + 1 
    : 10001;

  const { data, error } = await supabase
    .from('purchase_orders')
    .insert({
      ...poData,
      po_number: `PO-${nextNumber}`,
      status: PO_STATUS.DRAFT,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePurchaseOrder = async (poId, updates) => {
  const { data, error } = await supabase
    .from('purchase_orders')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', poId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const approvePurchaseOrder = async (poId, approverId) => {
  const { data, error } = await supabase
    .from('purchase_orders')
    .update({
      status: PO_STATUS.APPROVED,
      approved_by: approverId,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', poId)
    .select()
    .single();

  if (error) throw error;

  // Update committed cost on cost code
  if (data.cost_code_id) {
    await supabase.rpc('update_cost_code_committed', {
      p_cost_code_id: data.cost_code_id,
      p_amount: data.total_amount,
    });
  }

  return data;
};

export const addPurchaseOrderItem = async (itemData) => {
  const { data, error } = await supabase
    .from('purchase_order_items')
    .insert(itemData)
    .select()
    .single();

  if (error) throw error;

  // Recalculate PO total
  await recalculatePOTotal(itemData.purchase_order_id);

  return data;
};

const recalculatePOTotal = async (poId) => {
  const { data: items } = await supabase
    .from('purchase_order_items')
    .select('quantity, unit_price')
    .eq('purchase_order_id', poId);

  const total = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

  await supabase
    .from('purchase_orders')
    .update({ total_amount: total })
    .eq('id', poId);
};

// ============================================
// DAILY LOGS
// ============================================

export const getDailyLogs = async (jobId, filters = {}) => {
  let query = supabase
    .from('daily_logs')
    .select(`
      *,
      created_by:user_profiles!created_by(id, full_name)
    `)
    .eq('job_id', jobId)
    .order('log_date', { ascending: false });

  if (filters.start_date) {
    query = query.gte('log_date', filters.start_date);
  }
  if (filters.end_date) {
    query = query.lte('log_date', filters.end_date);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getDailyLogById = async (logId) => {
  const { data, error } = await supabase
    .from('daily_logs')
    .select(`
      *,
      created_by:user_profiles!created_by(id, full_name),
      labor_entries:daily_log_labor(*),
      equipment_entries:daily_log_equipment(*),
      material_entries:daily_log_materials(*),
      photos:daily_log_photos(*)
    `)
    .eq('id', logId)
    .single();

  if (error) throw error;
  return data;
};

export const createDailyLog = async (logData) => {
  const { data, error } = await supabase
    .from('daily_logs')
    .insert(logData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateDailyLog = async (logId, updates) => {
  const { data, error } = await supabase
    .from('daily_logs')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', logId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// CONSTRUCTION INSPECTIONS
// ============================================

export const getConstructionInspections = async (jobId, filters = {}) => {
  let query = supabase
    .from('construction_inspections')
    .select(`
      *,
      requested_by:user_profiles!requested_by(id, full_name)
    `)
    .eq('job_id', jobId)
    .order('scheduled_date', { ascending: true });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.type) {
    query = query.eq('inspection_type', filters.type);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const createConstructionInspection = async (inspectionData) => {
  const { data, error } = await supabase
    .from('construction_inspections')
    .insert({
      ...inspectionData,
      status: 'scheduled',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateConstructionInspection = async (inspectionId, updates) => {
  const { data, error } = await supabase
    .from('construction_inspections')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', inspectionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const recordInspectionResult = async (inspectionId, result, notes, failureItems = []) => {
  const { data, error } = await supabase
    .from('construction_inspections')
    .update({
      result,
      result_notes: notes,
      failure_items: failureItems,
      completed_at: new Date().toISOString(),
      status: 'completed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', inspectionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// PERMITS
// ============================================

export const getPermits = async (jobId) => {
  const { data, error } = await supabase
    .from('job_permits')
    .select('*')
    .eq('job_id', jobId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createPermit = async (permitData) => {
  const { data, error } = await supabase
    .from('job_permits')
    .insert({
      ...permitData,
      status: PERMIT_STATUS.NOT_APPLIED,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePermit = async (permitId, updates) => {
  const { data, error } = await supabase
    .from('job_permits')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', permitId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// PUNCH LISTS
// ============================================

export const getPunchLists = async (jobId) => {
  const { data, error } = await supabase
    .from('punch_lists')
    .select(`
      *,
      items:punch_list_items(*)
    `)
    .eq('job_id', jobId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createPunchList = async (punchListData) => {
  const { data, error } = await supabase
    .from('punch_lists')
    .insert(punchListData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const addPunchListItem = async (itemData) => {
  const { data, error } = await supabase
    .from('punch_list_items')
    .insert({
      ...itemData,
      status: PUNCH_ITEM_STATUS.OPEN,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePunchListItem = async (itemId, updates) => {
  const { data, error } = await supabase
    .from('punch_list_items')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getPunchListSummary = async (jobId) => {
  const { data, error } = await supabase
    .from('punch_list_items')
    .select('status')
    .eq('job_id', jobId);

  if (error) throw error;

  const summary = {
    total: data.length,
    open: 0,
    in_progress: 0,
    completed: 0,
    verified: 0,
  };

  data.forEach(item => {
    summary[item.status]++;
  });

  return summary;
};

// ============================================
// RFIs (Requests for Information)
// ============================================

export const getRFIs = async (jobId, filters = {}) => {
  let query = supabase
    .from('rfis')
    .select(`
      *,
      submitted_by:user_profiles!submitted_by(id, full_name),
      assigned_to:user_profiles!assigned_to(id, full_name)
    `)
    .eq('job_id', jobId)
    .order('created_at', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const createRFI = async (rfiData) => {
  // Generate RFI number
  const { data: lastRFI } = await supabase
    .from('rfis')
    .select('rfi_number')
    .eq('job_id', rfiData.job_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const nextNumber = lastRFI 
    ? parseInt(lastRFI.rfi_number.split('-').pop()) + 1 
    : 1;

  const { data: job } = await supabase
    .from('construction_jobs')
    .select('job_number')
    .eq('id', rfiData.job_id)
    .single();

  const { data, error } = await supabase
    .from('rfis')
    .insert({
      ...rfiData,
      rfi_number: `${job.job_number}-RFI-${String(nextNumber).padStart(3, '0')}`,
      status: RFI_STATUS.DRAFT,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateRFI = async (rfiId, updates) => {
  const { data, error } = await supabase
    .from('rfis')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', rfiId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const answerRFI = async (rfiId, answer, answeredBy) => {
  const { data, error } = await supabase
    .from('rfis')
    .update({
      answer,
      answered_by: answeredBy,
      answered_at: new Date().toISOString(),
      status: RFI_STATUS.ANSWERED,
      updated_at: new Date().toISOString(),
    })
    .eq('id', rfiId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// SUBMITTALS
// ============================================

export const getSubmittals = async (jobId, filters = {}) => {
  let query = supabase
    .from('submittals')
    .select(`
      *,
      submitted_by:user_profiles!submitted_by(id, full_name),
      reviewed_by:user_profiles!reviewed_by(id, full_name)
    `)
    .eq('job_id', jobId)
    .order('created_at', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.spec_section) {
    query = query.eq('spec_section', filters.spec_section);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const createSubmittal = async (submittalData) => {
  // Generate submittal number
  const { data: lastSubmittal } = await supabase
    .from('submittals')
    .select('submittal_number')
    .eq('job_id', submittalData.job_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const nextNumber = lastSubmittal 
    ? parseInt(lastSubmittal.submittal_number.split('-').pop()) + 1 
    : 1;

  const { data: job } = await supabase
    .from('construction_jobs')
    .select('job_number')
    .eq('id', submittalData.job_id)
    .single();

  const { data, error } = await supabase
    .from('submittals')
    .insert({
      ...submittalData,
      submittal_number: `${job.job_number}-SUB-${String(nextNumber).padStart(3, '0')}`,
      status: SUBMITTAL_STATUS.PENDING,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const reviewSubmittal = async (submittalId, status, comments, reviewedBy) => {
  const { data, error } = await supabase
    .from('submittals')
    .update({
      status,
      review_comments: comments,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', submittalId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// WARRANTY
// ============================================

export const getWarrantyItems = async (jobId) => {
  const { data, error } = await supabase
    .from('warranty_items')
    .select(`
      *,
      claims:warranty_claims(*)
    `)
    .eq('job_id', jobId)
    .order('expiration_date', { ascending: true });

  if (error) throw error;
  return data;
};

export const createWarrantyItem = async (warrantyData) => {
  const { data, error } = await supabase
    .from('warranty_items')
    .insert({
      ...warrantyData,
      status: WARRANTY_STATUS.ACTIVE,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createWarrantyClaim = async (claimData) => {
  const { data, error } = await supabase
    .from('warranty_claims')
    .insert({
      ...claimData,
      status: 'open',
    })
    .select()
    .single();

  if (error) throw error;

  // Update warranty item status
  await supabase
    .from('warranty_items')
    .update({ status: WARRANTY_STATUS.CLAIM_OPEN })
    .eq('id', claimData.warranty_item_id);

  return data;
};

export const getExpiringWarranties = async (jobId, daysAhead = 90) => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  const { data, error } = await supabase
    .from('warranty_items')
    .select('*')
    .eq('job_id', jobId)
    .eq('status', WARRANTY_STATUS.ACTIVE)
    .lte('expiration_date', futureDate.toISOString())
    .order('expiration_date', { ascending: true });

  if (error) throw error;
  return data;
};

// ============================================
// PAY APPLICATIONS
// ============================================

export const getPayApplications = async (jobId) => {
  const { data, error } = await supabase
    .from('pay_applications')
    .select(`
      *,
      created_by:user_profiles!created_by(id, full_name),
      approved_by:user_profiles!approved_by(id, full_name)
    `)
    .eq('job_id', jobId)
    .order('application_number', { ascending: false });

  if (error) throw error;
  return data;
};

export const createPayApplication = async (payAppData) => {
  // Get next application number
  const { data: lastApp } = await supabase
    .from('pay_applications')
    .select('application_number')
    .eq('job_id', payAppData.job_id)
    .order('application_number', { ascending: false })
    .limit(1)
    .single();

  const nextNumber = lastApp ? lastApp.application_number + 1 : 1;

  const { data, error } = await supabase
    .from('pay_applications')
    .insert({
      ...payAppData,
      application_number: nextNumber,
      status: 'draft',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePayApplication = async (payAppId, updates) => {
  const { data, error } = await supabase
    .from('pay_applications')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payAppId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const submitPayApplication = async (payAppId) => {
  const { data, error } = await supabase
    .from('pay_applications')
    .update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', payAppId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// SCHEDULE OF VALUES
// ============================================

export const getScheduleOfValues = async (jobId) => {
  const { data, error } = await supabase
    .from('schedule_of_values')
    .select('*')
    .eq('job_id', jobId)
    .order('line_number', { ascending: true });

  if (error) throw error;
  return data;
};

export const updateScheduleOfValuesProgress = async (sovId, percentComplete, workCompleted) => {
  const { data, error } = await supabase
    .from('schedule_of_values')
    .update({
      percent_complete: percentComplete,
      work_completed_this_period: workCompleted,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sovId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// DASHBOARD METRICS
// ============================================

export const getJobDashboardMetrics = async (jobId) => {
  const [
    costSummary,
    punchSummary,
    { data: openRFIs },
    { data: pendingInspections },
    { data: expiringWarranties },
  ] = await Promise.all([
    getJobCostSummary(jobId),
    getPunchListSummary(jobId),
    supabase
      .from('rfis')
      .select('id')
      .eq('job_id', jobId)
      .in('status', [RFI_STATUS.SUBMITTED, RFI_STATUS.IN_REVIEW]),
    supabase
      .from('construction_inspections')
      .select('id')
      .eq('job_id', jobId)
      .eq('status', 'scheduled'),
    getExpiringWarranties(jobId, 30),
  ]);

  return {
    budget: costSummary,
    punch_items: punchSummary,
    open_rfis: openRFIs?.length || 0,
    pending_inspections: pendingInspections?.length || 0,
    expiring_warranties: expiringWarranties?.length || 0,
  };
};

export const getContractorDashboardMetrics = async (entityId) => {
  const { data: jobs } = await supabase
    .from('construction_jobs')
    .select('id, status')
    .eq('contractor_entity_id', entityId);

  const { data: pendingPOs } = await supabase
    .from('purchase_orders')
    .select('id')
    .eq('entity_id', entityId)
    .eq('status', PO_STATUS.PENDING_APPROVAL);

  const { data: openRFIs } = await supabase
    .from('rfis')
    .select('id, job_id')
    .in('job_id', jobs?.map(j => j.id) || [])
    .in('status', [RFI_STATUS.SUBMITTED, RFI_STATUS.IN_REVIEW]);

  const expiringInsurance = await getExpiringInsurance(30);

  return {
    total_jobs: jobs?.length || 0,
    active_jobs: jobs?.filter(j => j.status === JOB_STATUS.ACTIVE).length || 0,
    pending_pos: pendingPOs?.length || 0,
    open_rfis: openRFIs?.length || 0,
    expiring_insurance: expiringInsurance?.length || 0,
  };
};

export default {
  // Jobs
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  
  // Cost Codes
  getCostCodes,
  createCostCode,
  updateCostCode,
  getJobCostSummary,
  
  // Subcontractors
  getSubcontractors,
  getSubcontractorById,
  createSubcontractor,
  updateSubcontractor,
  
  // Insurance
  getInsuranceCertificates,
  createInsuranceCertificate,
  getExpiringInsurance,
  
  // Lien Waivers
  getLienWaivers,
  createLienWaiver,
  
  // Purchase Orders
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  approvePurchaseOrder,
  addPurchaseOrderItem,
  
  // Daily Logs
  getDailyLogs,
  getDailyLogById,
  createDailyLog,
  updateDailyLog,
  
  // Inspections
  getConstructionInspections,
  createConstructionInspection,
  updateConstructionInspection,
  recordInspectionResult,
  
  // Permits
  getPermits,
  createPermit,
  updatePermit,
  
  // Punch Lists
  getPunchLists,
  createPunchList,
  addPunchListItem,
  updatePunchListItem,
  getPunchListSummary,
  
  // RFIs
  getRFIs,
  createRFI,
  updateRFI,
  answerRFI,
  
  // Submittals
  getSubmittals,
  createSubmittal,
  reviewSubmittal,
  
  // Warranty
  getWarrantyItems,
  createWarrantyItem,
  createWarrantyClaim,
  getExpiringWarranties,
  
  // Pay Applications
  getPayApplications,
  createPayApplication,
  updatePayApplication,
  submitPayApplication,
  
  // Schedule of Values
  getScheduleOfValues,
  updateScheduleOfValuesProgress,
  
  // Dashboard
  getJobDashboardMetrics,
  getContractorDashboardMetrics,
  
  // Constants
  JOB_STATUS,
  JOB_STATUS_LABELS,
  PO_STATUS,
  PO_STATUS_LABELS,
  INSPECTION_TYPE,
  INSPECTION_TYPE_LABELS,
  INSPECTION_RESULT,
  PERMIT_STATUS,
  RFI_STATUS,
  SUBMITTAL_STATUS,
  PUNCH_ITEM_STATUS,
  WARRANTY_STATUS,
  COST_CODE_DIVISIONS,
};
