// src/services/esignService.js
// E-Signature Service with Document Storage & Contact Linking

import { supabase } from '@/lib/supabase';

const DOCUSEAL_URL = import.meta.env.VITE_DOCUSEAL_URL || 'https://sign.yourdomain.com';
const DOCUSEAL_API_KEY = import.meta.env.VITE_DOCUSEAL_API_KEY || '';

const headers = {
  'X-Auth-Token': DOCUSEAL_API_KEY,
  'Content-Type': 'application/json'
};

// ============================================
// STORAGE BUCKET MAPPING
// ============================================

const STORAGE_CONFIG = {
  project: {
    bucket: 'project-documents',
    table: 'project_documents',
    idField: 'project_id'
  },
  opportunity: {
    bucket: 'opportunity-documents',
    table: 'opportunity_documents',
    idField: 'opportunity_id'
  },
  investor: {
    bucket: 'investor-documents',
    table: 'investor_documents',
    idField: 'investor_id'
  },
  investment_deal: {
    bucket: 'investor-documents',
    table: 'investor_documents',
    idField: 'investment_deal_id'
  },
  asset: {
    bucket: 'asset-documents',
    table: 'asset_documents',
    idField: 'asset_id'
  },
  general: {
    bucket: 'general-documents',
    table: 'general_documents',
    idField: null
  }
};

// ============================================
// TEMPLATE MANAGEMENT
// ============================================

export async function getTemplatesForModule(module) {
  const { data, error } = await supabase
    .from('document_templates')
    .select('*')
    .eq('is_active', true)
    .contains('available_for', [module])
    .order('name');

  return { data, error };
}

export async function getAllTemplates() {
  const { data, error } = await supabase
    .from('document_templates')
    .select('*')
    .eq('is_active', true)
    .order('name');

  return { data, error };
}

export async function getDocuSealTemplates() {
  try {
    const response = await fetch(`${DOCUSEAL_URL}/api/templates`, {
      method: 'GET',
      headers
    });
    if (!response.ok) throw new Error('Failed to fetch DocuSeal templates');
    return await response.json();
  } catch (error) {
    console.error('Error fetching DocuSeal templates:', error);
    return [];
  }
}

// ============================================
// CREATE TEMPLATE FROM PDF (In-App Generation)
// ============================================

/**
 * Create a DocuSeal template from PDF content generated in Atlas
 * This allows generating contracts in Atlas and sending for e-sign
 */
export async function createTemplateFromPDF(pdfBase64, templateName, signerRoles = ['Signer']) {
  try {
    // Build signature fields for each role
    const fields = signerRoles.map((role, index) => ({
      name: `signature_${role.toLowerCase().replace(/\s/g, '_')}`,
      role: role,
      type: 'signature',
      required: true
    }));

    // Add date fields for each signer
    signerRoles.forEach(role => {
      fields.push({
        name: `date_${role.toLowerCase().replace(/\s/g, '_')}`,
        role: role,
        type: 'date',
        required: true
      });
    });

    const response = await fetch(`${DOCUSEAL_URL}/api/templates/pdf`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: templateName,
        documents: [{
          name: `${templateName}.pdf`,
          file: pdfBase64
        }],
        fields
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DocuSeal template creation failed: ${errorText}`);
    }

    const template = await response.json();
    return { data: template, error: null };
  } catch (error) {
    console.error('Error creating template from PDF:', error);
    return { data: null, error };
  }
}

/**
 * Create a DocuSeal template from HTML content
 */
export async function createTemplateFromHTML(htmlContent, templateName, signerRoles = ['Signer']) {
  try {
    const response = await fetch(`${DOCUSEAL_URL}/api/templates/html`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: templateName,
        html: htmlContent,
        fields: signerRoles.map(role => ({
          name: role.toLowerCase().replace(/\s/g, '_'),
          role: role,
          type: 'signature',
          required: true
        }))
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DocuSeal template creation failed: ${errorText}`);
    }

    const template = await response.json();
    return { data: template, error: null };
  } catch (error) {
    console.error('Error creating template from HTML:', error);
    return { data: null, error };
  }
}

/**
 * Send document for signature using in-app generated content
 * Creates a template on-the-fly and sends for signature
 */
export async function sendGeneratedDocument({
  entityType,
  entityId,
  entityName,
  documentName,
  pdfBase64,
  signers,
  prefillData = {},
  sendEmail = true,
  notes = ''
}) {
  try {
    // 1. Match signers to contacts
    const matchedSigners = await matchSignersToContacts(signers);
    const signerRoles = matchedSigners.map(s => s.role || 'Signer');

    // 2. Create DocuSeal template from PDF
    const { data: template, error: templateError } = await createTemplateFromPDF(
      pdfBase64,
      documentName,
      signerRoles
    );

    if (templateError) {
      throw templateError;
    }

    // 3. Create submission with the new template
    const submissionPayload = {
      template_id: template.id,
      send_email: sendEmail,
      submitters: matchedSigners.map((signer, index) => ({
        role: signer.role || signerRoles[index] || `Signer ${index + 1}`,
        email: signer.email,
        name: signer.name,
        phone: signer.phone || undefined,
        fields: prefillData
      }))
    };

    const submissionResponse = await fetch(`${DOCUSEAL_URL}/api/submissions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(submissionPayload)
    });

    if (!submissionResponse.ok) {
      const errorText = await submissionResponse.text();
      throw new Error(`DocuSeal submission failed: ${errorText}`);
    }

    const submission = await submissionResponse.json();

    // 4. Create signing request record in database
    const { data: signingRequest, error: requestError } = await supabase
      .from('document_signing_requests')
      .insert({
        entity_type: entityType,
        entity_id: entityId || null,
        entity_name: entityName,
        template_id: `generated-${Date.now()}`,
        docuseal_submission_id: submission.id || submission[0]?.submission_id,
        docuseal_template_id: template.id,
        document_name: documentName,
        status: 'sent',
        prefill_data: prefillData,
        sent_at: new Date().toISOString(),
        notes
      })
      .select()
      .single();

    if (requestError) throw requestError;

    // 5. Create signer records
    const signerRecords = matchedSigners.map((signer, index) => ({
      signing_request_id: signingRequest.id,
      role: signer.role || `Signer ${index + 1}`,
      name: signer.name,
      email: signer.email,
      phone: signer.phone,
      company: signer.company,
      contact_id: signer.contact_id,
      contact_auto_matched: signer.contact_auto_matched,
      docuseal_submitter_id: Array.isArray(submission)
        ? submission[index]?.id
        : submission.submitters?.[index]?.id,
      embed_src: Array.isArray(submission)
        ? submission[index]?.embed_src
        : submission.submitters?.[index]?.embed_src,
      status: 'sent',
      signing_order: index + 1
    }));

    await supabase.from('document_signers').insert(signerRecords);

    // 6. Create document_contacts junction records
    for (const signer of matchedSigners) {
      if (signer.contact_id) {
        await supabase.from('document_contacts').upsert({
          document_type: entityType,
          document_id: signingRequest.id,
          contact_id: signer.contact_id,
          role: signer.role
        }, { onConflict: 'document_type,document_id,contact_id' });
      }
    }

    return { data: signingRequest, error: null };
  } catch (error) {
    console.error('Error sending generated document:', error);
    return { data: null, error };
  }
}

// ============================================
// CONTACT MATCHING
// ============================================

async function findContactByEmail(email) {
  const { data } = await supabase
    .from('contacts')
    .select('id, first_name, last_name, email, company')
    .ilike('email', email)
    .limit(1)
    .single();

  return data;
}

async function matchSignersToContacts(signers) {
  const matchedSigners = [];
  
  for (const signer of signers) {
    const contact = await findContactByEmail(signer.email);
    matchedSigners.push({
      ...signer,
      contact_id: contact?.id || signer.contact_id || null,
      contact_auto_matched: !!contact && !signer.contact_id
    });
  }
  
  return matchedSigners;
}

export async function searchContacts(searchTerm) {
  const { data, error } = await supabase
    .from('contacts')
    .select('id, first_name, last_name, email, company, phone')
    .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`)
    .limit(10);

  return { data, error };
}

// ============================================
// SEND FOR SIGNATURE
// ============================================

export async function sendForSignature({
  entityType,
  entityId,
  entityName,
  templateId,
  docusealTemplateId,
  documentName,
  signers,
  prefillData = {},
  sendEmail = true,
  notes = ''
}) {
  try {
    // 1. Match signers to contacts
    const matchedSigners = await matchSignersToContacts(signers);

    // 2. Create DocuSeal submission
    const submissionPayload = {
      template_id: docusealTemplateId,
      send_email: sendEmail,
      submitters: matchedSigners.map((signer, index) => ({
        role: signer.role || `Signer ${index + 1}`,
        email: signer.email,
        name: signer.name,
        phone: signer.phone || undefined,
        fields: prefillData
      }))
    };

    const docusealResponse = await fetch(`${DOCUSEAL_URL}/api/submissions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(submissionPayload)
    });

    if (!docusealResponse.ok) {
      const errorText = await docusealResponse.text();
      throw new Error(`DocuSeal error: ${errorText}`);
    }

    const submission = await docusealResponse.json();

    // 3. Create signing request record
    const { data: signingRequest, error: requestError } = await supabase
      .from('document_signing_requests')
      .insert({
        entity_type: entityType,
        entity_id: entityId || null,
        entity_name: entityName,
        template_id: templateId,
        docuseal_submission_id: submission.id || submission[0]?.submission_id,
        docuseal_template_id: docusealTemplateId,
        document_name: documentName,
        status: 'sent',
        prefill_data: prefillData,
        sent_at: new Date().toISOString(),
        notes
      })
      .select()
      .single();

    if (requestError) throw requestError;

    // 4. Create signer records
    const signerRecords = matchedSigners.map((signer, index) => ({
      signing_request_id: signingRequest.id,
      role: signer.role || `Signer ${index + 1}`,
      name: signer.name,
      email: signer.email,
      phone: signer.phone,
      company: signer.company,
      contact_id: signer.contact_id,
      contact_auto_matched: signer.contact_auto_matched,
      docuseal_submitter_id: Array.isArray(submission) 
        ? submission[index]?.id 
        : submission.submitters?.[index]?.id,
      embed_src: Array.isArray(submission)
        ? submission[index]?.embed_src
        : submission.submitters?.[index]?.embed_src,
      status: 'sent',
      signing_order: index + 1
    }));

    const { error: signersError } = await supabase
      .from('document_signers')
      .insert(signerRecords);

    if (signersError) throw signersError;

    // 5. Create document_contacts junction records
    for (const signer of matchedSigners) {
      if (signer.contact_id) {
        await supabase.from('document_contacts').upsert({
          document_type: entityType,
          document_id: signingRequest.id,
          contact_id: signer.contact_id,
          role: signer.role
        }, { onConflict: 'document_type,document_id,contact_id' });
      }
    }

    return { data: signingRequest, error: null };
  } catch (error) {
    console.error('Error sending for signature:', error);
    return { data: null, error };
  }
}

// ============================================
// DOCUMENT COMPLETION PROCESSING
// ============================================

export async function processCompletedDocument(signingRequestId) {
  try {
    // 1. Get signing request details
    const { data: request, error: requestError } = await supabase
      .from('document_signing_requests')
      .select('*, document_signers(*)')
      .eq('id', signingRequestId)
      .single();

    if (requestError) throw requestError;
    if (!request.docuseal_submission_id) throw new Error('No DocuSeal submission ID');

    // 2. Get submission from DocuSeal
    const submissionResponse = await fetch(
      `${DOCUSEAL_URL}/api/submissions/${request.docuseal_submission_id}`,
      { headers }
    );

    if (!submissionResponse.ok) throw new Error('Failed to fetch submission');
    const submission = await submissionResponse.json();

    // 3. Download the signed PDF
    const documentUrl = submission.documents?.[0]?.url || submission.combined_document_url;
    if (!documentUrl) throw new Error('No document URL found');

    const pdfResponse = await fetch(documentUrl);
    if (!pdfResponse.ok) throw new Error('Failed to download PDF');
    const pdfBlob = await pdfResponse.blob();

    // 4. Upload to Supabase Storage
    const config = STORAGE_CONFIG[request.entity_type] || STORAGE_CONFIG.general;
    const fileName = `${request.document_name.replace(/[^a-zA-Z0-9]/g, '_')}_signed.pdf`;
    const storagePath = request.entity_id 
      ? `${request.entity_id}/${fileName}`
      : `general/${Date.now()}_${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(config.bucket)
      .upload(storagePath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // 5. Get public URL
    const { data: urlData } = supabase.storage
      .from(config.bucket)
      .getPublicUrl(storagePath);

    // 6. Create document record in appropriate table
    const documentRecord = {
      name: `${request.document_name} (Signed)`,
      description: `E-signed document completed on ${new Date().toLocaleDateString()}`,
      file_path: storagePath,
      file_url: urlData.publicUrl,
      file_type: 'pdf',
      file_size: pdfBlob.size,
      category: 'e-signed',
      signing_request_id: signingRequestId
    };

    if (config.idField && request.entity_id) {
      documentRecord[config.idField] = request.entity_id;
    }

    // Add contact_id for primary signer if available
    const primarySigner = request.document_signers?.find(s => s.signing_order === 1);
    if (primarySigner?.contact_id) {
      documentRecord.contact_id = primarySigner.contact_id;
    }

    const { data: docRecord, error: docError } = await supabase
      .from(config.table)
      .insert(documentRecord)
      .select()
      .single();

    if (docError) throw docError;

    // 7. Update signing request with storage info
    await supabase
      .from('document_signing_requests')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        storage_path: storagePath,
        storage_url: urlData.publicUrl,
        linked_document_id: docRecord.id,
        docuseal_document_url: documentUrl
      })
      .eq('id', signingRequestId);

    // 8. Update document_contacts with signed_at
    for (const signer of request.document_signers || []) {
      if (signer.contact_id) {
        await supabase
          .from('document_contacts')
          .update({ signed_at: new Date().toISOString() })
          .eq('document_id', signingRequestId)
          .eq('contact_id', signer.contact_id);
      }
    }

    return { data: docRecord, error: null };
  } catch (error) {
    console.error('Error processing completed document:', error);
    return { data: null, error };
  }
}

// ============================================
// STATUS SYNC
// ============================================

export async function syncDocumentStatus(signingRequestId) {
  try {
    const { data: request } = await supabase
      .from('document_signing_requests')
      .select('docuseal_submission_id')
      .eq('id', signingRequestId)
      .single();

    if (!request?.docuseal_submission_id) {
      return { data: null, error: new Error('No submission ID') };
    }

    // Fetch from DocuSeal
    const response = await fetch(
      `${DOCUSEAL_URL}/api/submissions/${request.docuseal_submission_id}`,
      { headers }
    );

    if (!response.ok) throw new Error('Failed to fetch submission status');
    const submission = await response.json();

    // Map DocuSeal status to our status
    let status = 'sent';
    if (submission.status === 'completed') status = 'completed';
    else if (submission.status === 'pending') status = 'sent';
    else if (submission.status === 'expired') status = 'expired';
    else if (submission.status === 'declined') status = 'declined';

    // Update our record
    const updates = { status };
    if (submission.completed_at) updates.completed_at = submission.completed_at;
    if (submission.viewed_at) updates.viewed_at = submission.viewed_at;

    const { data, error } = await supabase
      .from('document_signing_requests')
      .update(updates)
      .eq('id', signingRequestId)
      .select()
      .single();

    // Update individual signer statuses
    if (submission.submitters) {
      for (const submitter of submission.submitters) {
        await supabase
          .from('document_signers')
          .update({
            status: submitter.status || 'pending',
            signed_at: submitter.completed_at
          })
          .eq('docuseal_submitter_id', submitter.id);
      }
    }

    // If completed, process the document
    if (status === 'completed') {
      await processCompletedDocument(signingRequestId);
    }

    return { data, error };
  } catch (error) {
    console.error('Error syncing document status:', error);
    return { data: null, error };
  }
}

// ============================================
// QUERY FUNCTIONS
// ============================================

export async function getDocumentsForEntity(entityType, entityId) {
  const { data, error } = await supabase
    .from('document_signing_requests')
    .select(`
      *,
      document_signers(*)
    `)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function getAllDocuments(filters = {}) {
  let query = supabase
    .from('document_signing_requests')
    .select(`
      *,
      document_signers(*)
    `)
    .order('created_at', { ascending: false });

  if (filters.entityType) {
    query = query.eq('entity_type', filters.entityType);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.search) {
    query = query.or(`document_name.ilike.%${filters.search}%,entity_name.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function getDocumentsForContact(contactId) {
  const { data: junctions, error: junctionError } = await supabase
    .from('document_contacts')
    .select('document_id, document_type, role, signed_at')
    .eq('contact_id', contactId);

  if (junctionError) return { data: null, error: junctionError };

  // Get the actual documents
  const documentIds = junctions.map(j => j.document_id);
  const { data: documents, error } = await supabase
    .from('document_signing_requests')
    .select('*')
    .in('id', documentIds);

  return { data: documents, error };
}

export async function getSigningRequest(id) {
  const { data, error } = await supabase
    .from('document_signing_requests')
    .select(`
      *,
      document_signers(*)
    `)
    .eq('id', id)
    .single();

  return { data, error };
}

// ============================================
// ACTIONS
// ============================================

export async function downloadSignedDocument(signingRequestId) {
  const { data: request } = await supabase
    .from('document_signing_requests')
    .select('storage_url, document_name')
    .eq('id', signingRequestId)
    .single();

  if (request?.storage_url) {
    return { url: request.storage_url, name: request.document_name };
  }

  return { url: null, name: null };
}

export async function resendToSigner(signerId) {
  try {
    const { data: signer } = await supabase
      .from('document_signers')
      .select('docuseal_submitter_id')
      .eq('id', signerId)
      .single();

    if (!signer?.docuseal_submitter_id) {
      throw new Error('No DocuSeal submitter ID');
    }

    const response = await fetch(
      `${DOCUSEAL_URL}/api/submitters/${signer.docuseal_submitter_id}/send_email`,
      { method: 'POST', headers }
    );

    if (!response.ok) throw new Error('Failed to resend');

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

export async function cancelSigningRequest(signingRequestId) {
  try {
    const { data: request } = await supabase
      .from('document_signing_requests')
      .select('docuseal_submission_id')
      .eq('id', signingRequestId)
      .single();

    // Archive in DocuSeal if possible
    if (request?.docuseal_submission_id) {
      await fetch(
        `${DOCUSEAL_URL}/api/submissions/${request.docuseal_submission_id}`,
        { method: 'DELETE', headers }
      ).catch(() => {}); // Ignore errors
    }

    // Update our record
    const { error } = await supabase
      .from('document_signing_requests')
      .update({ status: 'cancelled' })
      .eq('id', signingRequestId);

    return { success: !error, error };
  } catch (error) {
    return { success: false, error };
  }
}

// ============================================
// STATISTICS
// ============================================

export async function getSigningStats(entityType = null, entityId = null) {
  let query = supabase
    .from('document_signing_requests')
    .select('status', { count: 'exact' });

  if (entityType) query = query.eq('entity_type', entityType);
  if (entityId) query = query.eq('entity_id', entityId);

  const { data, error } = await query;

  if (error) return { data: null, error };

  const stats = {
    total: data?.length || 0,
    sent: 0,
    viewed: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
    expired: 0
  };

  data?.forEach(doc => {
    if (doc.status === 'sent' || doc.status === 'partially_signed') stats.sent++;
    else if (doc.status === 'viewed') stats.viewed++;
    else if (doc.status === 'completed' || doc.status === 'signed') stats.completed++;
    else if (doc.status === 'cancelled') stats.cancelled++;
    else if (doc.status === 'expired') stats.expired++;
    else stats.pending++;
  });

  return { data: stats, error: null };
}

export default {
  getTemplatesForModule,
  getAllTemplates,
  getDocuSealTemplates,
  createTemplateFromPDF,
  createTemplateFromHTML,
  sendGeneratedDocument,
  searchContacts,
  sendForSignature,
  processCompletedDocument,
  syncDocumentStatus,
  getDocumentsForEntity,
  getAllDocuments,
  getDocumentsForContact,
  getSigningRequest,
  downloadSignedDocument,
  resendToSigner,
  cancelSigningRequest,
  getSigningStats
};
