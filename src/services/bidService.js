// src/services/bidService.js
// Service layer for Bids Module

import { supabase } from '@/lib/supabase';

// ─── Constants ────────────────────────────────────────────────────────────────

export const BID_TYPES = [
  { value: 'general_contractor', label: 'General Contractor' },
  { value: 'subcontractor', label: 'Subcontractor' },
  { value: 'supplier', label: 'Supplier' },
  { value: 'professional_services', label: 'Professional Services' },
];

export const SCOPE_CATEGORIES = [
  { value: 'foundation', label: 'Foundation' },
  { value: 'framing', label: 'Framing' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'drywall', label: 'Drywall' },
  { value: 'painting', label: 'Painting' },
  { value: 'flooring', label: 'Flooring' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'concrete', label: 'Concrete/Flatwork' },
  { value: 'sitework', label: 'Sitework' },
  { value: 'insulation', label: 'Insulation' },
  { value: 'windows_doors', label: 'Windows & Doors' },
  { value: 'cabinetry', label: 'Cabinetry & Countertops' },
  { value: 'appliances', label: 'Appliances' },
  { value: 'fire_protection', label: 'Fire Protection' },
  { value: 'demolition', label: 'Demolition' },
  { value: 'surveying', label: 'Surveying' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'architecture', label: 'Architecture' },
  { value: 'other', label: 'Other' },
];

export const BID_STATUSES = [
  { value: 'submitted', label: 'Submitted', color: 'bg-blue-50 text-blue-700 border-blue-300' },
  { value: 'under_review', label: 'Under Review', color: 'bg-amber-50 text-amber-700 border-amber-300' },
  { value: 'approved', label: 'Approved', color: 'bg-green-50 text-green-700 border-green-300' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-50 text-red-700 border-red-300' },
  { value: 'expired', label: 'Expired', color: 'bg-gray-100 text-gray-700 border-gray-300' },
];

export const BID_DOCUMENT_TYPES = [
  { value: 'proposal', label: 'Proposal' },
  { value: 'breakdown', label: 'Cost Breakdown' },
  { value: 'insurance', label: 'Insurance Certificate' },
  { value: 'license', label: 'License/Certification' },
  { value: 'bond', label: 'Bond' },
  { value: 'reference', label: 'References' },
  { value: 'other', label: 'Other' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getBidTypeLabel(type) {
  return BID_TYPES.find(t => t.value === type)?.label || type;
}

export function getScopeCategoryLabel(scope) {
  return SCOPE_CATEGORIES.find(s => s.value === scope)?.label || scope;
}

export function getStatusConfig(status) {
  return BID_STATUSES.find(s => s.value === status) || BID_STATUSES[0];
}

export function calculateBidTotals(bids) {
  const totalBids = bids.length;
  const submittedCount = bids.filter(b => b.status === 'submitted').length;
  const underReviewCount = bids.filter(b => b.status === 'under_review').length;
  const approvedCount = bids.filter(b => b.status === 'approved').length;
  const rejectedCount = bids.filter(b => b.status === 'rejected').length;
  const awardedCount = bids.filter(b => b.awarded).length;
  const totalBidAmount = bids.reduce((s, b) => s + (b.bid_amount || 0), 0);
  const awardedAmount = bids.filter(b => b.awarded).reduce((s, b) => s + (b.bid_amount || 0), 0);
  const avgScore = bids.filter(b => b.score).reduce((s, b, _, arr) => s + b.score / arr.length, 0);

  return { totalBids, submittedCount, underReviewCount, approvedCount, rejectedCount, awardedCount, totalBidAmount, awardedAmount, avgScore };
}

export function getBidsByScope(bids) {
  const grouped = {};
  bids.forEach(bid => {
    if (!grouped[bid.scope_category]) grouped[bid.scope_category] = [];
    grouped[bid.scope_category].push(bid);
  });
  return grouped;
}

// ─── CRUD Operations ──────────────────────────────────────────────────────────

export async function getBids(projectId) {
  const { data, error } = await supabase
    .from('bids')
    .select('*')
    .eq('project_id', projectId);

  if (error) throw error;
  return data;
}

export async function getBid(bidId) {
  const { data, error } = await supabase
    .from('bids')
    .select('*')
    .eq('id', bidId)
    .single();

  if (error) throw error;
  return data;
}

export async function createBid(projectId, bidData) {
  const { data, error } = await supabase
    .from('bids')
    .insert([{
      project_id: projectId,
      ...bidData,
      bid_amount: parseFloat(bidData.bid_amount) || 0,
      alternate_amount: bidData.alternate_amount ? parseFloat(bidData.alternate_amount) : null,
      status: 'submitted',
      awarded: false,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBid(bidId, updates) {
  const { data, error } = await supabase
    .from('bids')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', bidId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBid(bidId) {
  const { error } = await supabase
    .from('bids')
    .delete()
    .eq('id', bidId);

  if (error) throw error;
  return true;
}

// ─── Status & Award ───────────────────────────────────────────────────────────

export async function updateBidStatus(bidId, newStatus, notes) {
  const updates = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };
  if (notes) updates.evaluation_notes = notes;

  const { data, error } = await supabase
    .from('bids')
    .update(updates)
    .eq('id', bidId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function awardBid(bidId) {
  const { data, error } = await supabase
    .from('bids')
    .update({
      awarded: true,
      awarded_date: new Date().toISOString().split('T')[0],
      status: 'approved',
      updated_at: new Date().toISOString(),
    })
    .eq('id', bidId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function scoreBid(bidId, score, notes) {
  const updates = {
    score,
    updated_at: new Date().toISOString(),
  };
  if (notes) updates.evaluation_notes = notes;

  const { data, error } = await supabase
    .from('bids')
    .update(updates)
    .eq('id', bidId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Documents ────────────────────────────────────────────────────────────────

export async function getBidDocuments(bidId) {
  const { data, error } = await supabase
    .from('bid_documents')
    .select('*')
    .eq('bid_id', bidId);

  if (error) throw error;
  return data;
}

export async function addBidDocument(bidId, docData) {
  const { data, error } = await supabase
    .from('bid_documents')
    .insert([{
      bid_id: bidId,
      ...docData,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}
