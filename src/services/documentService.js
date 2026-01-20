// src/services/documentService.js
// Document Management Service with SharePoint Integration via Microsoft Graph API

import { supabase } from '@/lib/supabase';

// Microsoft Graph API Configuration
const GRAPH_API_URL = 'https://graph.microsoft.com/v1.0';
const TENANT_ID = import.meta.env.VITE_MS_TENANT_ID;
const CLIENT_ID = import.meta.env.VITE_MS_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_MS_CLIENT_SECRET;
const SHAREPOINT_SITE_ID = import.meta.env.VITE_SHAREPOINT_SITE_ID;
const SHAREPOINT_DRIVE_ID = import.meta.env.VITE_SHAREPOINT_DRIVE_ID;

// Token cache
let accessToken = null;
let tokenExpiry = null;

// ============================================
// AUTHENTICATION
// ============================================

async function getAccessToken() {
  // Return cached token if still valid
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get access token');
    }

    const data = await response.json();
    accessToken = data.access_token;
    // Set expiry 5 minutes before actual expiry for safety
    tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
    
    return accessToken;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

async function graphRequest(endpoint, options = {}) {
  const token = await getAccessToken();
  
  const response = await fetch(`${GRAPH_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Graph API error: ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// ============================================
// FOLDER STRUCTURE
// ============================================

const FOLDER_STRUCTURE = {
  root: 'AtlasDev',
  subfolders: {
    projects: 'Projects',
    opportunities: 'Opportunities',
    investments: 'Investments',
    entities: 'Entities',
    contacts: 'Contacts',
    templates: 'Templates',
  },
  categories: {
    contracts: 'Contracts',
    legal: 'Legal',
    financial: 'Financial',
    correspondence: 'Correspondence',
    photos: 'Photos',
    reports: 'Reports',
    misc: 'Miscellaneous',
  }
};

// Build SharePoint path for entity
function buildSharePointPath(entityType, entityId, category = null) {
  const basePath = `${FOLDER_STRUCTURE.root}/${FOLDER_STRUCTURE.subfolders[entityType] || 'General'}`;
  
  if (entityId) {
    return category 
      ? `${basePath}/${entityId}/${category}`
      : `${basePath}/${entityId}`;
  }
  
  return basePath;
}

// ============================================
// FOLDER MANAGEMENT
// ============================================

export async function ensureFolderExists(folderPath) {
  try {
    const pathParts = folderPath.split('/').filter(Boolean);
    let currentPath = '';

    for (const part of pathParts) {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      
      try {
        await graphRequest(
          `/sites/${SHAREPOINT_SITE_ID}/drives/${SHAREPOINT_DRIVE_ID}/root:/${currentPath}`
        );
      } catch (error) {
        // Folder doesn't exist, create it
        const parentPath = currentPath.split('/').slice(0, -1).join('/') || 'root';
        const endpoint = parentPath === 'root'
          ? `/sites/${SHAREPOINT_SITE_ID}/drives/${SHAREPOINT_DRIVE_ID}/root/children`
          : `/sites/${SHAREPOINT_SITE_ID}/drives/${SHAREPOINT_DRIVE_ID}/root:/${parentPath}:/children`;

        await graphRequest(endpoint, {
          method: 'POST',
          body: JSON.stringify({
            name: part,
            folder: {},
            '@microsoft.graph.conflictBehavior': 'fail'
          }),
        });
      }
    }

    return { success: true, path: folderPath };
  } catch (error) {
    console.error('Error ensuring folder exists:', error);
    return { success: false, error };
  }
}

export async function createEntityFolder(entityType, entityId, entityName) {
  const basePath = buildSharePointPath(entityType, entityId);
  
  // Ensure base folder exists
  await ensureFolderExists(basePath);

  // Create category subfolders
  for (const category of Object.values(FOLDER_STRUCTURE.categories)) {
    await ensureFolderExists(`${basePath}/${category}`);
  }

  // Log folder creation
  await logDocumentActivity({
    action: 'folder_created',
    entity_type: entityType,
    entity_id: entityId,
    details: { folder_path: basePath, entity_name: entityName }
  });

  return { success: true, path: basePath };
}

// ============================================
// FILE OPERATIONS
// ============================================

export async function uploadFile({
  entityType,
  entityId,
  category = 'Miscellaneous',
  file,
  fileName,
  description = '',
  tags = []
}) {
  try {
    const folderPath = buildSharePointPath(entityType, entityId, category);
    
    // Ensure folder exists
    await ensureFolderExists(folderPath);

    // Upload to SharePoint
    const uploadEndpoint = `/sites/${SHAREPOINT_SITE_ID}/drives/${SHAREPOINT_DRIVE_ID}/root:/${folderPath}/${fileName}:/content`;
    
    const token = await getAccessToken();
    const uploadResponse = await fetch(`${GRAPH_API_URL}${uploadEndpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to SharePoint');
    }

    const sharePointFile = await uploadResponse.json();

    // Create document record in Supabase
    const { data: docRecord, error: dbError } = await supabase
      .from('documents')
      .insert({
        entity_type: entityType,
        entity_id: entityId,
        name: fileName,
        description,
        category,
        file_type: file.type,
        file_size: file.size,
        sharepoint_item_id: sharePointFile.id,
        sharepoint_drive_id: SHAREPOINT_DRIVE_ID,
        sharepoint_path: `${folderPath}/${fileName}`,
        sharepoint_web_url: sharePointFile.webUrl,
        tags,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // Log activity
    await logDocumentActivity({
      action: 'file_uploaded',
      document_id: docRecord.id,
      entity_type: entityType,
      entity_id: entityId,
      details: { file_name: fileName, category, file_size: file.size }
    });

    return { data: docRecord, error: null };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { data: null, error };
  }
}

export async function downloadFile(documentId) {
  try {
    const { data: doc, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error) throw error;

    // Get download URL from SharePoint
    const downloadUrl = await graphRequest(
      `/sites/${SHAREPOINT_SITE_ID}/drives/${doc.sharepoint_drive_id}/items/${doc.sharepoint_item_id}/content`,
      { method: 'GET' }
    );

    // Log activity
    await logDocumentActivity({
      action: 'file_downloaded',
      document_id: documentId,
      entity_type: doc.entity_type,
      entity_id: doc.entity_id,
    });

    return { url: downloadUrl, document: doc };
  } catch (error) {
    console.error('Error downloading file:', error);
    return { url: null, error };
  }
}

export async function deleteFile(documentId) {
  try {
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (fetchError) throw fetchError;

    // Delete from SharePoint
    await graphRequest(
      `/sites/${SHAREPOINT_SITE_ID}/drives/${doc.sharepoint_drive_id}/items/${doc.sharepoint_item_id}`,
      { method: 'DELETE' }
    );

    // Soft delete in Supabase (keep record for audit)
    const { error: deleteError } = await supabase
      .from('documents')
      .update({ 
        is_deleted: true, 
        deleted_at: new Date().toISOString() 
      })
      .eq('id', documentId);

    if (deleteError) throw deleteError;

    // Log activity
    await logDocumentActivity({
      action: 'file_deleted',
      document_id: documentId,
      entity_type: doc.entity_type,
      entity_id: doc.entity_id,
      details: { file_name: doc.name }
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { success: false, error };
  }
}

export async function moveFile(documentId, newEntityType, newEntityId, newCategory) {
  try {
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (fetchError) throw fetchError;

    const newPath = buildSharePointPath(newEntityType, newEntityId, newCategory);
    await ensureFolderExists(newPath);

    // Move in SharePoint
    const moveResult = await graphRequest(
      `/sites/${SHAREPOINT_SITE_ID}/drives/${doc.sharepoint_drive_id}/items/${doc.sharepoint_item_id}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          parentReference: {
            path: `/drives/${SHAREPOINT_DRIVE_ID}/root:/${newPath}`
          }
        })
      }
    );

    // Update Supabase record
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        entity_type: newEntityType,
        entity_id: newEntityId,
        category: newCategory,
        sharepoint_path: `${newPath}/${doc.name}`,
        sharepoint_web_url: moveResult.webUrl,
      })
      .eq('id', documentId);

    if (updateError) throw updateError;

    // Log activity
    await logDocumentActivity({
      action: 'file_moved',
      document_id: documentId,
      entity_type: newEntityType,
      entity_id: newEntityId,
      details: { 
        from_path: doc.sharepoint_path, 
        to_path: `${newPath}/${doc.name}` 
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error moving file:', error);
    return { success: false, error };
  }
}

// ============================================
// EDIT LINKS (Time-Limited)
// ============================================

export async function getEditLink(documentId, expirationHours = 8) {
  try {
    const { data: doc, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error) throw error;

    // Create sharing link with edit permissions
    const expirationDateTime = new Date(Date.now() + expirationHours * 60 * 60 * 1000).toISOString();
    
    const shareLink = await graphRequest(
      `/sites/${SHAREPOINT_SITE_ID}/drives/${doc.sharepoint_drive_id}/items/${doc.sharepoint_item_id}/createLink`,
      {
        method: 'POST',
        body: JSON.stringify({
          type: 'edit',
          scope: 'anonymous',
          expirationDateTime,
        })
      }
    );

    // Store the link in document_access_links
    await supabase.from('document_access_links').insert({
      document_id: documentId,
      link_type: 'edit',
      link_url: shareLink.link.webUrl,
      expires_at: expirationDateTime,
    });

    // Log activity
    await logDocumentActivity({
      action: 'edit_link_created',
      document_id: documentId,
      entity_type: doc.entity_type,
      entity_id: doc.entity_id,
      details: { expires_at: expirationDateTime }
    });

    return { 
      url: shareLink.link.webUrl, 
      expiresAt: expirationDateTime,
      error: null 
    };
  } catch (error) {
    console.error('Error creating edit link:', error);
    return { url: null, error };
  }
}

export async function getViewLink(documentId) {
  try {
    const { data: doc, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error) throw error;

    // Create view-only sharing link
    const shareLink = await graphRequest(
      `/sites/${SHAREPOINT_SITE_ID}/drives/${doc.sharepoint_drive_id}/items/${doc.sharepoint_item_id}/createLink`,
      {
        method: 'POST',
        body: JSON.stringify({
          type: 'view',
          scope: 'anonymous',
        })
      }
    );

    // Log activity
    await logDocumentActivity({
      action: 'view_link_created',
      document_id: documentId,
      entity_type: doc.entity_type,
      entity_id: doc.entity_id,
    });

    return { url: shareLink.link.webUrl, error: null };
  } catch (error) {
    console.error('Error creating view link:', error);
    return { url: null, error };
  }
}

// ============================================
// QUERY FUNCTIONS
// ============================================

export async function getDocumentsForEntity(entityType, entityId, options = {}) {
  let query = supabase
    .from('documents')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (options.category) {
    query = query.eq('category', options.category);
  }

  if (options.search) {
    query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function getAllDocuments(filters = {}) {
  let query = supabase
    .from('documents')
    .select('*')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (filters.entityType) {
    query = query.eq('entity_type', filters.entityType);
  }

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  if (filters.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function getDocument(documentId) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single();

  return { data, error };
}

export async function getRecentDocuments(limit = 10) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data, error };
}

// ============================================
// TEMPLATES
// ============================================

export async function getTemplates(category = null) {
  let query = supabase
    .from('document_templates_library')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function createFromTemplate(templateId, entityType, entityId, customName = null) {
  try {
    const { data: template, error: templateError } = await supabase
      .from('document_templates_library')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError) throw templateError;

    // Copy template file in SharePoint
    const destPath = buildSharePointPath(entityType, entityId, template.category);
    await ensureFolderExists(destPath);

    const fileName = customName || template.name;
    
    const copyResult = await graphRequest(
      `/sites/${SHAREPOINT_SITE_ID}/drives/${template.sharepoint_drive_id}/items/${template.sharepoint_item_id}/copy`,
      {
        method: 'POST',
        body: JSON.stringify({
          parentReference: {
            driveId: SHAREPOINT_DRIVE_ID,
            path: `/drives/${SHAREPOINT_DRIVE_ID}/root:/${destPath}`
          },
          name: fileName
        })
      }
    );

    // Wait for copy operation to complete
    // SharePoint copy is async, need to poll for completion
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get the new file info
    const newFile = await graphRequest(
      `/sites/${SHAREPOINT_SITE_ID}/drives/${SHAREPOINT_DRIVE_ID}/root:/${destPath}/${fileName}`
    );

    // Create document record
    const { data: docRecord, error: dbError } = await supabase
      .from('documents')
      .insert({
        entity_type: entityType,
        entity_id: entityId,
        name: fileName,
        description: `Created from template: ${template.name}`,
        category: template.category,
        file_type: template.file_type,
        file_size: template.file_size,
        sharepoint_item_id: newFile.id,
        sharepoint_drive_id: SHAREPOINT_DRIVE_ID,
        sharepoint_path: `${destPath}/${fileName}`,
        sharepoint_web_url: newFile.webUrl,
        template_id: templateId,
        tags: template.tags || [],
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // Log activity
    await logDocumentActivity({
      action: 'created_from_template',
      document_id: docRecord.id,
      entity_type: entityType,
      entity_id: entityId,
      details: { template_name: template.name, template_id: templateId }
    });

    return { data: docRecord, error: null };
  } catch (error) {
    console.error('Error creating from template:', error);
    return { data: null, error };
  }
}

// ============================================
// UPDATE DOCUMENT
// ============================================

export async function updateDocument(documentId, updates) {
  const { data, error } = await supabase
    .from('documents')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', documentId)
    .select()
    .single();

  if (!error) {
    await logDocumentActivity({
      action: 'document_updated',
      document_id: documentId,
      details: { updated_fields: Object.keys(updates) }
    });
  }

  return { data, error };
}

// ============================================
// ACTIVITY LOGGING
// ============================================

async function logDocumentActivity({
  action,
  document_id = null,
  entity_type = null,
  entity_id = null,
  details = {}
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('document_access_log').insert({
      action,
      document_id,
      entity_type,
      entity_id,
      user_id: user?.id,
      details,
      ip_address: null, // Would need server-side to capture
    });
  } catch (error) {
    console.error('Error logging document activity:', error);
  }
}

export async function getDocumentActivity(documentId, limit = 50) {
  const { data, error } = await supabase
    .from('document_access_log')
    .select(`
      *,
      users:user_id (
        email,
        raw_user_meta_data
      )
    `)
    .eq('document_id', documentId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data, error };
}

// ============================================
// STATISTICS
// ============================================

export async function getDocumentStats(entityType = null, entityId = null) {
  let query = supabase
    .from('documents')
    .select('category, file_size')
    .eq('is_deleted', false);

  if (entityType) query = query.eq('entity_type', entityType);
  if (entityId) query = query.eq('entity_id', entityId);

  const { data, error } = await query;

  if (error) return { data: null, error };

  const stats = {
    total: data.length,
    totalSize: data.reduce((sum, d) => sum + (d.file_size || 0), 0),
    byCategory: {},
  };

  data.forEach(doc => {
    const cat = doc.category || 'Uncategorized';
    if (!stats.byCategory[cat]) {
      stats.byCategory[cat] = { count: 0, size: 0 };
    }
    stats.byCategory[cat].count++;
    stats.byCategory[cat].size += doc.file_size || 0;
  });

  return { data: stats, error: null };
}

// ============================================
// EXPORTS
// ============================================

export default {
  // Folders
  ensureFolderExists,
  createEntityFolder,
  
  // Files
  uploadFile,
  downloadFile,
  deleteFile,
  moveFile,
  
  // Links
  getEditLink,
  getViewLink,
  
  // Queries
  getDocumentsForEntity,
  getAllDocuments,
  getDocument,
  getRecentDocuments,
  
  // Templates
  getTemplates,
  createFromTemplate,
  
  // Updates
  updateDocument,
  
  // Activity
  getDocumentActivity,
  
  // Stats
  getDocumentStats,
};
