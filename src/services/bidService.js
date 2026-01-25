// src/services/bidService.js
// Service layer for Bids Module with demo data

import { isDemoMode } from '@/lib/supabase';

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

// ─── Demo Data ────────────────────────────────────────────────────────────────

const DEMO_BIDS = [
  {
    id: 'bid-1',
    project_id: 'demo-project-1',
    bid_type: 'subcontractor',
    scope_category: 'foundation',
    bidder_name: 'Solid Ground Foundations LLC',
    bidder_contact_name: 'Robert Martinez',
    bid_amount: 185000,
    alternate_amount: 195000,
    scope_description: 'Complete foundation system including footings, stem walls, and slab-on-grade for 24-unit development.',
    inclusions: 'Excavation, forming, rebar, concrete pour, waterproofing, anchor bolts',
    exclusions: 'Soil testing, engineering, dewatering if required',
    qualifications: '15 years multifamily experience. Licensed and bonded.',
    received_date: '2025-01-15',
    valid_until: '2025-03-15',
    status: 'approved',
    evaluation_notes: 'Lowest qualified bid. Strong references on similar projects.',
    score: 88,
    awarded: true,
    awarded_date: '2025-02-01',
    notes: 'Includes 90-day warranty on workmanship.',
  },
  {
    id: 'bid-2',
    project_id: 'demo-project-1',
    bid_type: 'subcontractor',
    scope_category: 'foundation',
    bidder_name: 'Texas Foundation Pros',
    bidder_contact_name: 'Angela Torres',
    bid_amount: 210000,
    alternate_amount: null,
    scope_description: 'Foundation work for 24-unit residential complex. Post-tension slab alternate available.',
    inclusions: 'All concrete work, forming, rebar, vapor barrier, grade beams',
    exclusions: 'Soil preparation, backfill, grading',
    qualifications: '20 years in central Texas. A+ BBB rating.',
    received_date: '2025-01-18',
    valid_until: '2025-03-18',
    status: 'rejected',
    evaluation_notes: 'Higher price. Good quality but not competitive on this scope.',
    score: 75,
    awarded: false,
    notes: null,
  },
  {
    id: 'bid-3',
    project_id: 'demo-project-1',
    bid_type: 'subcontractor',
    scope_category: 'framing',
    bidder_name: 'Hill Country Framing Inc.',
    bidder_contact_name: 'Dave Wilson',
    bid_amount: 425000,
    alternate_amount: 445000,
    scope_description: 'Complete wood framing package for 24-unit multifamily. 2-story wood frame over concrete podium.',
    inclusions: 'All lumber, hardware, trusses, sheathing, labor, equipment',
    exclusions: 'Windows, exterior siding, balcony railings',
    qualifications: 'Crew of 18. OSHA certified. 10 projects completed 2024.',
    received_date: '2025-02-10',
    valid_until: '2025-04-10',
    status: 'approved',
    evaluation_notes: 'Best value. Proven track record on similar buildings. Fast timeline.',
    score: 92,
    awarded: true,
    awarded_date: '2025-03-01',
    notes: '8-week completion timeline committed.',
  },
  {
    id: 'bid-4',
    project_id: 'demo-project-1',
    bid_type: 'subcontractor',
    scope_category: 'framing',
    bidder_name: 'Precision Carpentry Co.',
    bidder_contact_name: 'Mark Johnson',
    bid_amount: 465000,
    alternate_amount: null,
    scope_description: 'Full framing scope for 24 residential units.',
    inclusions: 'Framing labor, materials, trusses, hardware',
    exclusions: 'Sheathing, blocking for fixtures',
    qualifications: '12 years experience. Currently on 3 active projects.',
    received_date: '2025-02-12',
    valid_until: '2025-04-12',
    status: 'rejected',
    evaluation_notes: 'Higher price, excludes sheathing which adds cost. Schedule concerns.',
    score: 68,
    awarded: false,
    notes: 'Bidder has capacity constraints in Q2.',
  },
  {
    id: 'bid-5',
    project_id: 'demo-project-1',
    bid_type: 'subcontractor',
    scope_category: 'electrical',
    bidder_name: 'Spark Electric LLC',
    bidder_contact_name: 'James Park',
    bid_amount: 312000,
    alternate_amount: 328000,
    scope_description: 'Complete electrical installation for 24-unit development including service, distribution, and unit wiring.',
    inclusions: 'Main service, panels, all wiring, fixtures, outlets, switches, data/comm rough-in',
    exclusions: 'Utility company fees, low voltage security, solar',
    qualifications: 'Master electrician. 8 multifamily projects in Austin area.',
    received_date: '2025-03-01',
    valid_until: '2025-05-01',
    status: 'approved',
    evaluation_notes: 'Competitive pricing, excellent past work quality. Fast response time.',
    score: 90,
    awarded: true,
    awarded_date: '2025-03-20',
    notes: 'Alternate includes EV charging infrastructure for 6 spaces.',
  },
  {
    id: 'bid-6',
    project_id: 'demo-project-1',
    bid_type: 'subcontractor',
    scope_category: 'plumbing',
    bidder_name: 'Lone Star Plumbing Services',
    bidder_contact_name: 'Carlos Mendez',
    bid_amount: 278000,
    alternate_amount: null,
    scope_description: 'Full plumbing package: water, waste, vent, and gas for 24 residential units.',
    inclusions: 'All pipe, fittings, fixtures, water heaters, gas lines, testing',
    exclusions: 'Tap fees, meter installation, fire sprinkler',
    qualifications: 'Licensed master plumber. 25 years experience.',
    received_date: '2025-03-05',
    valid_until: '2025-05-05',
    status: 'under_review',
    evaluation_notes: 'Strong bid. Need to verify insurance limits meet project requirements.',
    score: 85,
    awarded: false,
    notes: 'Awaiting updated COI.',
  },
  {
    id: 'bid-7',
    project_id: 'demo-project-1',
    bid_type: 'subcontractor',
    scope_category: 'plumbing',
    bidder_name: 'AquaFlow Plumbing Inc.',
    bidder_contact_name: 'Patricia Nguyen',
    bid_amount: 295000,
    alternate_amount: 305000,
    scope_description: 'Complete plumbing scope for 24-unit multifamily with tankless water heaters.',
    inclusions: 'Pipe, fittings, fixtures, tankless heaters, gas, testing, warranty',
    exclusions: 'Utility fees, speciality fixtures by owner',
    qualifications: 'Licensed. Bonded $2M. 5 similar projects in 2024.',
    received_date: '2025-03-08',
    valid_until: '2025-05-08',
    status: 'submitted',
    evaluation_notes: null,
    score: null,
    awarded: false,
    notes: 'Alternate includes recirculation pumps for hot water.',
  },
  {
    id: 'bid-8',
    project_id: 'demo-project-1',
    bid_type: 'subcontractor',
    scope_category: 'hvac',
    bidder_name: 'CoolBreeze Mechanical',
    bidder_contact_name: 'Steve Anderson',
    bid_amount: 198000,
    alternate_amount: 215000,
    scope_description: 'HVAC installation: 24 individual ductless mini-split systems plus common area units.',
    inclusions: 'Equipment, refrigerant lines, condensate drains, electrical connections, startup',
    exclusions: 'Electrical service to units, ductwork (ductless system)',
    qualifications: 'Certified Mitsubishi Diamond Contractor. EPA certified.',
    received_date: '2025-04-01',
    valid_until: '2025-06-01',
    status: 'under_review',
    evaluation_notes: 'Good price for ductless. Need to compare with ducted alternatives.',
    score: 82,
    awarded: false,
    notes: 'Alternate includes 2-zone systems for larger units.',
  },
  {
    id: 'bid-9',
    project_id: 'demo-project-1',
    bid_type: 'subcontractor',
    scope_category: 'roofing',
    bidder_name: 'Peak Performance Roofing',
    bidder_contact_name: 'Lisa Chang',
    bid_amount: 156000,
    alternate_amount: 172000,
    scope_description: '30-year architectural shingle roof system for all buildings.',
    inclusions: 'Underlayment, shingles, flashing, ridge vents, gutters, downspouts',
    exclusions: 'Structural repairs, skylights',
    qualifications: 'GAF Master Elite Contractor. 50-year warranty available.',
    received_date: '2025-04-15',
    valid_until: '2025-06-15',
    status: 'submitted',
    evaluation_notes: null,
    score: null,
    awarded: false,
    notes: 'Alternate includes standing seam metal at community building.',
  },
  {
    id: 'bid-10',
    project_id: 'demo-project-1',
    bid_type: 'subcontractor',
    scope_category: 'landscaping',
    bidder_name: 'Green Valley Landscaping',
    bidder_contact_name: 'Maria Santos',
    bid_amount: 95000,
    alternate_amount: 110000,
    scope_description: 'Complete landscape installation including irrigation, plantings, and hardscape.',
    inclusions: 'Irrigation system, trees, shrubs, groundcover, mulch, sod, walkways',
    exclusions: 'Pool area landscape, retaining walls over 4ft',
    qualifications: 'Licensed irrigator. Sustainable landscape specialist.',
    received_date: '2025-05-01',
    valid_until: '2025-07-01',
    status: 'submitted',
    evaluation_notes: null,
    score: null,
    awarded: false,
    notes: 'Alternate includes native plant upgrade and rain garden.',
  },
  {
    id: 'bid-11',
    project_id: 'demo-project-1',
    bid_type: 'professional_services',
    scope_category: 'engineering',
    bidder_name: 'Structural Solutions Engineering',
    bidder_contact_name: 'Dr. Kevin Wright',
    bid_amount: 45000,
    alternate_amount: null,
    scope_description: 'Structural engineering services: design, calculations, shop drawing review.',
    inclusions: 'Foundation design, framing plans, calculations, 3 site visits, RFI response',
    exclusions: 'Special inspections, geotechnical, additional site visits ($500/each)',
    qualifications: 'PE licensed in Texas. 30 years structural experience.',
    received_date: '2024-11-15',
    valid_until: '2025-01-15',
    status: 'approved',
    evaluation_notes: 'Best qualified. Previous work together on 2 projects.',
    score: 95,
    awarded: true,
    awarded_date: '2024-12-01',
    notes: 'Retainer agreement signed.',
  },
  {
    id: 'bid-12',
    project_id: 'demo-project-1',
    bid_type: 'supplier',
    scope_category: 'windows_doors',
    bidder_name: 'Anderson Windows Austin',
    bidder_contact_name: 'Tom Bradley',
    bid_amount: 142000,
    alternate_amount: 168000,
    scope_description: 'Window and exterior door package for 24 units. Anderson 400 Series.',
    inclusions: 'All windows, sliding doors, entry doors, hardware, delivery',
    exclusions: 'Installation labor, interior doors, garage doors',
    qualifications: 'Authorized Anderson dealer. 12-week lead time.',
    received_date: '2025-03-20',
    valid_until: '2025-05-20',
    status: 'approved',
    evaluation_notes: 'Good product quality. Price competitive with alternatives.',
    score: 87,
    awarded: true,
    awarded_date: '2025-04-05',
    notes: 'Alternate for triple-pane energy upgrade. Lead time confirmed 12 weeks from order.',
  },
];

const DEMO_BID_DOCUMENTS = [
  { id: 'bdoc-1', bid_id: 'bid-1', document_type: 'proposal', file_name: 'Solid_Ground_Foundation_Proposal.pdf', file_path: '/docs/bids/bid-1/proposal.pdf' },
  { id: 'bdoc-2', bid_id: 'bid-1', document_type: 'insurance', file_name: 'COI_Solid_Ground_2025.pdf', file_path: '/docs/bids/bid-1/coi.pdf' },
  { id: 'bdoc-3', bid_id: 'bid-3', document_type: 'proposal', file_name: 'HillCountry_Framing_Bid.pdf', file_path: '/docs/bids/bid-3/proposal.pdf' },
  { id: 'bdoc-4', bid_id: 'bid-3', document_type: 'breakdown', file_name: 'Framing_Cost_Breakdown.xlsx', file_path: '/docs/bids/bid-3/breakdown.xlsx' },
  { id: 'bdoc-5', bid_id: 'bid-5', document_type: 'proposal', file_name: 'Spark_Electric_Proposal.pdf', file_path: '/docs/bids/bid-5/proposal.pdf' },
  { id: 'bdoc-6', bid_id: 'bid-5', document_type: 'license', file_name: 'Master_Electrician_License.pdf', file_path: '/docs/bids/bid-5/license.pdf' },
  { id: 'bdoc-7', bid_id: 'bid-11', document_type: 'proposal', file_name: 'Structural_Solutions_Proposal.pdf', file_path: '/docs/bids/bid-11/proposal.pdf' },
  { id: 'bdoc-8', bid_id: 'bid-11', document_type: 'insurance', file_name: 'E&O_Insurance_Cert.pdf', file_path: '/docs/bids/bid-11/insurance.pdf' },
  { id: 'bdoc-9', bid_id: 'bid-12', document_type: 'proposal', file_name: 'Anderson_Windows_Quote.pdf', file_path: '/docs/bids/bid-12/quote.pdf' },
  { id: 'bdoc-10', bid_id: 'bid-12', document_type: 'breakdown', file_name: 'Window_Schedule_Pricing.xlsx', file_path: '/docs/bids/bid-12/schedule.xlsx' },
];

// ─── CRUD Operations ──────────────────────────────────────────────────────────

export async function getBids(projectId) {
  if (isDemoMode) {
    return DEMO_BIDS.filter(b => b.project_id === projectId);
  }
}

export async function getBid(bidId) {
  if (isDemoMode) {
    return DEMO_BIDS.find(b => b.id === bidId) || null;
  }
}

export async function createBid(projectId, bidData) {
  if (isDemoMode) {
    const newBid = {
      id: `bid-${Date.now()}`,
      project_id: projectId,
      ...bidData,
      bid_amount: parseFloat(bidData.bid_amount) || 0,
      alternate_amount: bidData.alternate_amount ? parseFloat(bidData.alternate_amount) : null,
      status: 'submitted',
      awarded: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    DEMO_BIDS.push(newBid);
    return newBid;
  }
}

export async function updateBid(bidId, updates) {
  if (isDemoMode) {
    const idx = DEMO_BIDS.findIndex(b => b.id === bidId);
    if (idx === -1) throw new Error('Bid not found');
    DEMO_BIDS[idx] = { ...DEMO_BIDS[idx], ...updates, updated_at: new Date().toISOString() };
    return DEMO_BIDS[idx];
  }
}

export async function deleteBid(bidId) {
  if (isDemoMode) {
    const idx = DEMO_BIDS.findIndex(b => b.id === bidId);
    if (idx !== -1) DEMO_BIDS.splice(idx, 1);
    return true;
  }
}

// ─── Status & Award ───────────────────────────────────────────────────────────

export async function updateBidStatus(bidId, newStatus, notes) {
  if (isDemoMode) {
    const idx = DEMO_BIDS.findIndex(b => b.id === bidId);
    if (idx === -1) throw new Error('Bid not found');
    DEMO_BIDS[idx] = {
      ...DEMO_BIDS[idx],
      status: newStatus,
      evaluation_notes: notes || DEMO_BIDS[idx].evaluation_notes,
      updated_at: new Date().toISOString(),
    };
    return DEMO_BIDS[idx];
  }
}

export async function awardBid(bidId) {
  if (isDemoMode) {
    const idx = DEMO_BIDS.findIndex(b => b.id === bidId);
    if (idx === -1) throw new Error('Bid not found');
    DEMO_BIDS[idx] = {
      ...DEMO_BIDS[idx],
      awarded: true,
      awarded_date: new Date().toISOString().split('T')[0],
      status: 'approved',
      updated_at: new Date().toISOString(),
    };
    return DEMO_BIDS[idx];
  }
}

export async function scoreBid(bidId, score, notes) {
  if (isDemoMode) {
    const idx = DEMO_BIDS.findIndex(b => b.id === bidId);
    if (idx === -1) throw new Error('Bid not found');
    DEMO_BIDS[idx] = {
      ...DEMO_BIDS[idx],
      score,
      evaluation_notes: notes || DEMO_BIDS[idx].evaluation_notes,
      updated_at: new Date().toISOString(),
    };
    return DEMO_BIDS[idx];
  }
}

// ─── Documents ────────────────────────────────────────────────────────────────

export async function getBidDocuments(bidId) {
  if (isDemoMode) {
    return DEMO_BID_DOCUMENTS.filter(d => d.bid_id === bidId);
  }
}

export async function addBidDocument(bidId, docData) {
  if (isDemoMode) {
    const doc = {
      id: `bdoc-${Date.now()}`,
      bid_id: bidId,
      ...docData,
      uploaded_at: new Date().toISOString(),
    };
    DEMO_BID_DOCUMENTS.push(doc);
    return doc;
  }
}
