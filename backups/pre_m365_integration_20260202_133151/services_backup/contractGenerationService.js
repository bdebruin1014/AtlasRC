// src/services/contractGenerationService.js
// Contract Generation Service with template variable substitution

import { supabase } from '@/lib/supabase';

// Default contract templates
const DEFAULT_TEMPLATES = [
  {
    id: 'purchase-agreement',
    name: 'Purchase Agreement',
    description: 'Standard real estate purchase agreement',
    category: 'purchase',
    available_for: ['project', 'opportunity']
  },
  {
    id: 'assignment-contract',
    name: 'Assignment of Contract',
    description: 'Contract assignment for wholesale deals',
    category: 'assignment',
    available_for: ['opportunity']
  },
  {
    id: 'letter-of-intent',
    name: 'Letter of Intent (LOI)',
    description: 'Non-binding letter of intent',
    category: 'pre-contract',
    available_for: ['opportunity']
  },
  {
    id: 'due-diligence-extension',
    name: 'Due Diligence Extension',
    description: 'Request for DD period extension',
    category: 'amendment',
    available_for: ['project', 'opportunity']
  },
  {
    id: 'earnest-money-release',
    name: 'Earnest Money Release',
    description: 'Release of earnest money deposit',
    category: 'closing',
    available_for: ['project', 'opportunity']
  }
];

// Variable mapping for different entity types
const VARIABLE_MAPPINGS = {
  project: {
    // Property Info
    '{{property_address}}': (data) => data.address || '',
    '{{property_city}}': (data) => data.city || '',
    '{{property_state}}': (data) => data.state || '',
    '{{property_zip}}': (data) => data.zip_code || '',
    '{{property_full_address}}': (data) =>
      `${data.address || ''}, ${data.city || ''}, ${data.state || ''} ${data.zip_code || ''}`.trim().replace(/^,\s*/, ''),
    '{{property_county}}': (data) => data.county || '',
    '{{property_parcel_id}}': (data) => data.parcel_id || '',
    '{{property_acres}}': (data) => data.acres || '',
    '{{property_sqft}}': (data) => data.sqft || '',
    '{{property_zoning}}': (data) => data.zoning || '',
    '{{property_legal_description}}': (data) => data.legal_description || '',

    // Project Info
    '{{project_name}}': (data) => data.name || '',
    '{{project_type}}': (data) => data.project_type || '',
    '{{project_status}}': (data) => data.status || '',

    // Financial
    '{{purchase_price}}': (data) => formatCurrency(data.purchase_price),
    '{{earnest_money}}': (data) => formatCurrency(data.earnest_money),
    '{{budget}}': (data) => formatCurrency(data.budget),
    '{{closing_costs}}': (data) => formatCurrency(data.closing_costs),

    // Dates
    '{{contract_date}}': (data) => formatDate(data.contract_date),
    '{{dd_deadline}}': (data) => formatDate(data.dd_deadline),
    '{{closing_date}}': (data) => formatDate(data.closing_date),
    '{{start_date}}': (data) => formatDate(data.start_date),
    '{{target_completion_date}}': (data) => formatDate(data.target_completion_date),
    '{{current_date}}': () => formatDate(new Date().toISOString()),

    // Parties
    '{{seller_name}}': (data) => data.seller_name || '',
    '{{buyer_name}}': (data) => data.entity_name || data.entity?.name || '',
    '{{entity_name}}': (data) => data.entity_name || data.entity?.name || '',
    '{{title_company}}': (data) => data.title_company || '',
    '{{closing_agent}}': (data) => data.closing_agent || '',
    '{{project_manager}}': (data) => data.project_manager || '',
    '{{general_contractor}}': (data) => data.general_contractor || '',
  },

  opportunity: {
    // Property Info
    '{{property_address}}': (data) => data.address || '',
    '{{property_city}}': (data) => data.city || '',
    '{{property_state}}': (data) => data.state || '',
    '{{property_zip}}': (data) => data.zip_code || '',
    '{{property_full_address}}': (data) =>
      `${data.address || ''}, ${data.city || ''}, ${data.state || ''} ${data.zip_code || ''}`.trim().replace(/^,\s*/, ''),
    '{{property_county}}': (data) => data.county || '',
    '{{property_parcel_id}}': (data) => data.parcel_id || '',
    '{{property_acres}}': (data) => data.acres || '',
    '{{property_zoning}}': (data) => data.zoning || '',

    // Deal Info
    '{{deal_number}}': (data) => data.deal_number || '',
    '{{deal_stage}}': (data) => data.stage || '',
    '{{property_type}}': (data) => data.property_type || '',
    '{{source}}': (data) => data.source || '',

    // Financial
    '{{asking_price}}': (data) => formatCurrency(data.asking_price),
    '{{estimated_value}}': (data) => formatCurrency(data.estimated_value),
    '{{assignment_fee}}': (data) => formatCurrency(data.assignment_fee),
    '{{earnest_money}}': (data) => formatCurrency(data.earnest_money),
    '{{purchase_price}}': (data) => formatCurrency(data.asking_price), // Use asking as purchase for opportunities

    // Dates
    '{{dd_deadline}}': (data) => formatDate(data.dd_deadline),
    '{{close_date}}': (data) => formatDate(data.close_date),
    '{{closing_date}}': (data) => formatDate(data.close_date),
    '{{current_date}}': () => formatDate(new Date().toISOString()),

    // Parties
    '{{seller_name}}': (data) => data.seller_name || '',
    '{{seller_phone}}': (data) => data.seller_phone || '',
    '{{seller_email}}': (data) => data.seller_email || '',
    '{{buyer_name}}': (data) => data.buyer_name || 'Buyer',
    '{{assigned_to}}': (data) => data.assigned_to || '',
  }
};

// Helper functions
function formatCurrency(value) {
  if (!value) return '$0.00';
  const num = parseFloat(value);
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

// ============================================
// CONTRACT GENERATION
// ============================================

/**
 * Get available templates for an entity type
 */
export function getContractTemplates(entityType = 'project') {
  return DEFAULT_TEMPLATES.filter(t => t.available_for.includes(entityType));
}

/**
 * Get all available variables for an entity type
 */
export function getAvailableVariables(entityType = 'project') {
  const mapping = VARIABLE_MAPPINGS[entityType] || VARIABLE_MAPPINGS.project;
  return Object.keys(mapping);
}

/**
 * Preview contract with variable substitution
 */
export function generateContractPreview(templateContent, entityType, entityData, customOverrides = {}) {
  const mapping = VARIABLE_MAPPINGS[entityType] || VARIABLE_MAPPINGS.project;
  const mergedData = { ...entityData, ...customOverrides };

  let content = templateContent;

  // Replace all variables
  for (const [variable, resolver] of Object.entries(mapping)) {
    const value = resolver(mergedData);
    content = content.replace(new RegExp(escapeRegex(variable), 'g'), value);
  }

  return content;
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build prefill data for DocuSeal from entity data
 */
export function buildPrefillData(entityType, entityData, customOverrides = {}) {
  const mapping = VARIABLE_MAPPINGS[entityType] || VARIABLE_MAPPINGS.project;
  const mergedData = { ...entityData, ...customOverrides };
  const prefillData = {};

  for (const [variable, resolver] of Object.entries(mapping)) {
    // Convert {{variable_name}} to variable_name for DocuSeal fields
    const fieldName = variable.replace(/\{\{|\}\}/g, '');
    prefillData[fieldName] = resolver(mergedData);
  }

  return prefillData;
}

/**
 * Get signers from entity data
 */
export function getDefaultSigners(entityType, entityData) {
  const signers = [];

  if (entityType === 'opportunity') {
    // Seller signer
    if (entityData.seller_name && entityData.seller_email) {
      signers.push({
        role: 'Seller',
        name: entityData.seller_name,
        email: entityData.seller_email,
        phone: entityData.seller_phone || ''
      });
    }
  }

  if (entityType === 'project') {
    // Seller signer
    if (entityData.seller_name) {
      signers.push({
        role: 'Seller',
        name: entityData.seller_name,
        email: '', // Would need to be filled in
        phone: ''
      });
    }
  }

  return signers;
}

// ============================================
// DATABASE OPERATIONS
// ============================================

/**
 * Save generated contract to database
 */
export async function saveGeneratedContract({
  entityType,
  entityId,
  templateId,
  documentName,
  content,
  prefillData,
  status = 'draft'
}) {
  const { data, error } = await supabase
    .from('generated_contracts')
    .insert({
      entity_type: entityType,
      entity_id: entityId,
      template_id: templateId,
      document_name: documentName,
      content,
      prefill_data: prefillData,
      status,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Get generated contracts for an entity
 */
export async function getGeneratedContracts(entityType, entityId) {
  const { data, error } = await supabase
    .from('generated_contracts')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false });

  return { data: data || [], error };
}

/**
 * Update generated contract status
 */
export async function updateContractStatus(contractId, status) {
  const { data, error } = await supabase
    .from('generated_contracts')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', contractId)
    .select()
    .single();

  return { data, error };
}

// ============================================
// TEMPLATE CONTENT (Sample templates)
// ============================================

export const SAMPLE_TEMPLATES = {
  'purchase-agreement': `
REAL ESTATE PURCHASE AGREEMENT

This Purchase Agreement ("Agreement") is made and entered into as of {{current_date}}, by and between:

SELLER: {{seller_name}}
BUYER: {{buyer_name}}

PROPERTY:
Address: {{property_full_address}}
County: {{property_county}}
Parcel ID: {{property_parcel_id}}
Legal Description: {{property_legal_description}}

TERMS:
1. Purchase Price: {{purchase_price}}
2. Earnest Money Deposit: {{earnest_money}}
3. Due Diligence Period Ends: {{dd_deadline}}
4. Closing Date: {{closing_date}}

Title Company: {{title_company}}
Closing Agent: {{closing_agent}}

This Agreement is contingent upon satisfactory completion of due diligence by Buyer.

________________________          ________________________
Seller Signature                  Buyer Signature
Date: _______________            Date: _______________
`,

  'assignment-contract': `
ASSIGNMENT OF CONTRACT

Date: {{current_date}}

Original Buyer (Assignor): {{assigned_to}}
New Buyer (Assignee): _________________________

PROPERTY:
{{property_full_address}}

ORIGINAL CONTRACT:
Purchase Price: {{asking_price}}
Original Contract Date: {{current_date}}

ASSIGNMENT FEE: {{assignment_fee}}

The Assignor hereby assigns all rights, title, and interest in the above-referenced Purchase Agreement to the Assignee.

________________________
Assignor Signature
Date: _______________

________________________
Assignee Signature
Date: _______________
`,

  'letter-of-intent': `
LETTER OF INTENT

Date: {{current_date}}

To: {{seller_name}}
From: {{buyer_name}}
Re: {{property_full_address}}

Dear {{seller_name}},

This Letter of Intent outlines the basic terms under which we propose to purchase the property located at:

{{property_full_address}}
{{property_county}} County
Parcel ID: {{property_parcel_id}}
Acreage: {{property_acres}} acres
Zoning: {{property_zoning}}

PROPOSED TERMS:
- Purchase Price: {{asking_price}}
- Earnest Money: {{earnest_money}}
- Due Diligence Period: 30 days from contract execution
- Target Closing: {{close_date}}

This Letter of Intent is non-binding and subject to the execution of a definitive Purchase Agreement.

Sincerely,

________________________
{{buyer_name}}
`,

  'due-diligence-extension': `
DUE DILIGENCE EXTENSION REQUEST

Date: {{current_date}}

Property: {{property_full_address}}
Original DD Deadline: {{dd_deadline}}

Dear {{seller_name}},

The undersigned Buyer hereby requests an extension of the Due Diligence Period for the above-referenced property.

Requested Extension: 14 additional days
New DD Deadline: _________________________

Reason for Extension:
_____________________________________________
_____________________________________________

________________________          ________________________
Seller Approval                   Buyer Signature
Date: _______________            Date: _______________
`,

  'earnest-money-release': `
EARNEST MONEY RELEASE

Date: {{current_date}}

Property: {{property_full_address}}
Earnest Money Amount: {{earnest_money}}
Escrow Agent: {{title_company}}

The undersigned parties hereby authorize the release of the earnest money deposit held in escrow for the above property.

Release To: [ ] Buyer  [ ] Seller  [ ] Split (specify): __________

Reason: _____________________________________________

________________________          ________________________
Seller Signature                  Buyer Signature
Date: _______________            Date: _______________

________________________
Escrow Agent Acknowledgment
Date: _______________
`
};

export default {
  getContractTemplates,
  getAvailableVariables,
  generateContractPreview,
  buildPrefillData,
  getDefaultSigners,
  saveGeneratedContract,
  getGeneratedContracts,
  updateContractStatus,
  SAMPLE_TEMPLATES
};
