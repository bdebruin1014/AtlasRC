// src/services/sharepointService.js
// SharePoint Integration Service - Multi-Tenant SaaS Model
// Atlas owns SharePoint, customers get isolated folder structures

import { supabase } from '@/lib/supabase';

// ============================================
// CONFIGURATION
// ============================================

const MS_TENANT_ID = import.meta.env.VITE_MS_TENANT_ID;
const MS_CLIENT_ID = import.meta.env.VITE_MS_CLIENT_ID;
const GRAPH_API_URL = 'https://graph.microsoft.com/v1.0';
const REDIRECT_URI = `${window.location.origin}/auth/sharepoint/callback`;

// Scopes needed for SharePoint access
const SHAREPOINT_SCOPES = [
  'Files.ReadWrite.All',
  'Sites.ReadWrite.All',
  'User.Read',
  'offline_access',
].join(' ');

// Check if SharePoint is configured
export function isSharePointConfigured() {
  return !!(MS_TENANT_ID && MS_CLIENT_ID);
}

// ============================================
// OAUTH AUTHENTICATION (Atlas Admin Only)
// ============================================

export function getAdminAuthorizationUrl(state = '') {
  if (!isSharePointConfigured()) {
    throw new Error('SharePoint is not configured. Please set VITE_MS_TENANT_ID and VITE_MS_CLIENT_ID environment variables.');
  }

  const params = new URLSearchParams({
    client_id: MS_CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    response_mode: 'query',
    scope: SHAREPOINT_SCOPES,
    state: state,
    prompt: 'consent',
  });

  return `https://login.microsoftonline.com/${MS_TENANT_ID}/oauth2/v2.0/authorize?${params}`;
}

export const getAuthorizationUrl = getAdminAuthorizationUrl;

export async function exchangeCodeForTokens(code) {
  const tokenUrl = `https://login.microsoftonline.com/${MS_TENANT_ID}/oauth2/v2.0/token`;

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: MS_CLIENT_ID,
      scope: SHAREPOINT_SCOPES,
      code: code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || 'Failed to exchange code for tokens');
  }

  return response.json();
}

export async function refreshAccessToken(refreshToken) {
  const tokenUrl = `https://login.microsoftonline.com/${MS_TENANT_ID}/oauth2/v2.0/token`;

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: MS_CLIENT_ID,
      scope: SHAREPOINT_SCOPES,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }

  return response.json();
}

// ============================================
// ATLAS PLATFORM TOKEN STORAGE
// ============================================

export async function saveAtlasSharePointConnection(adminUserId, tokens, siteInfo) {
  const { data, error } = await supabase
    .from('sharepoint_connections')
    .upsert({
      id: 'atlas-platform',
      user_id: adminUserId,
      connection_type: 'platform',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      site_id: siteInfo?.id,
      site_name: siteInfo?.displayName,
      site_url: siteInfo?.webUrl,
      drive_id: siteInfo?.driveId,
      is_connected: true,
      connected_by: adminUserId,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    .select()
    .single();

  return { data, error };
}

// Aliases for backward compatibility
export const saveOrgSharePointConnection = saveAtlasSharePointConnection;
export const saveSharePointConnection = saveAtlasSharePointConnection;

export async function getAtlasSharePointConnection() {
  const { data, error } = await supabase
    .from('sharepoint_connections')
    .select('*')
    .eq('id', 'atlas-platform')
    .single();

  if (error && error.code !== 'PGRST116') {
    return { data: null, error };
  }

  return { data, error: null };
}

export const getOrgSharePointConnection = getAtlasSharePointConnection;
export const getSharePointConnection = async () => getAtlasSharePointConnection();

export async function disconnectAtlasSharePoint() {
  const { error } = await supabase
    .from('sharepoint_connections')
    .update({
      is_connected: false,
      access_token: null,
      refresh_token: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 'atlas-platform');

  return { success: !error, error };
}

export const disconnectOrgSharePoint = disconnectAtlasSharePoint;
export const disconnectSharePoint = async () => disconnectAtlasSharePoint();

// Get valid access token (refresh if needed)
async function getValidAccessToken() {
  const { data: connection, error } = await getAtlasSharePointConnection();

  if (error || !connection || !connection.is_connected) {
    throw new Error('Atlas SharePoint not connected. Platform admin must configure SharePoint.');
  }

  const expiresAt = new Date(connection.token_expires_at);
  const now = new Date();
  const bufferMs = 5 * 60 * 1000;

  if (expiresAt.getTime() - now.getTime() < bufferMs) {
    const tokens = await refreshAccessToken(connection.refresh_token);
    await supabase
      .from('sharepoint_connections')
      .update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || connection.refresh_token,
        token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', 'atlas-platform');
    return tokens.access_token;
  }

  return connection.access_token;
}

// ============================================
// GRAPH API HELPERS
// ============================================

async function graphRequest(endpoint, options = {}) {
  const accessToken = await getValidAccessToken();

  const response = await fetch(`${GRAPH_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Graph API error: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// ============================================
// MULTI-TENANT CUSTOMER FOLDER MANAGEMENT
// ============================================

// Standard folder structure for each customer organization
const CUSTOMER_FOLDER_STRUCTURE = [
  'Projects',
  'Company Documents',
  'Templates',
  'Contracts',
  'Legal',
  'Financial Records',
];

// Standard folder structure for each project (default if no template)
const PROJECT_FOLDER_STRUCTURE = [
  'Contracts',
  'Legal',
  'Financial',
  'Correspondence',
  'Photos',
  'Reports',
  'Inspections',
  'Permits',
  'Insurance',
];

/**
 * Get template folder structure from database
 */
async function getTemplateFolderStructure(templateId) {
  const { data: folders, error } = await supabase
    .from('project_template_folders')
    .select('*')
    .eq('template_id', templateId)
    .order('sort_order', { ascending: true });

  if (error || !folders?.length) {
    return null;
  }

  return folders;
}

/**
 * Build folder tree from flat list
 */
function buildFolderTree(folders) {
  const folderMap = new Map();
  const rootFolders = [];

  // First pass: create folder objects
  folders.forEach(folder => {
    folderMap.set(folder.id, { ...folder, children: [] });
  });

  // Second pass: build tree
  folders.forEach(folder => {
    const folderObj = folderMap.get(folder.id);
    if (folder.parent_folder_id) {
      const parent = folderMap.get(folder.parent_folder_id);
      if (parent) {
        parent.children.push(folderObj);
      } else {
        rootFolders.push(folderObj);
      }
    } else {
      rootFolders.push(folderObj);
    }
  });

  return rootFolders;
}

/**
 * Recursively create folders from template structure
 */
async function createFoldersFromTemplate(driveId, parentFolderId, folderTree, createdFolders = {}) {
  for (const folder of folderTree) {
    const { data: created, error } = await createFolder(driveId, parentFolderId, folder.name);
    if (error) {
      console.error(`Error creating folder ${folder.name}:`, error);
      continue;
    }

    createdFolders[folder.id] = {
      templateFolderId: folder.id,
      sharePointFolderId: created.id,
      name: folder.name,
      webUrl: created.webUrl,
    };

    // Recursively create children
    if (folder.children?.length > 0) {
      await createFoldersFromTemplate(driveId, created.id, folder.children, createdFolders);
    }
  }

  return createdFolders;
}

/**
 * Initialize folder structure for a new customer organization
 * Called when a new organization signs up for Atlas
 */
export async function initializeCustomerFolders(organizationId, organizationName) {
  try {
    const { data: connection } = await getAtlasSharePointConnection();
    if (!connection?.drive_id) {
      throw new Error('Atlas SharePoint not configured');
    }

    const driveId = connection.drive_id;
    const sanitizedName = organizationName.replace(/[<>:"/\\|?*]/g, '-');

    // Create customer root folder under "Customers"
    const customersFolder = await ensureFolder(driveId, 'root', 'Customers');
    const customerRoot = await createFolder(driveId, customersFolder.id, sanitizedName);

    // Create standard subfolders
    for (const folderName of CUSTOMER_FOLDER_STRUCTURE) {
      await createFolder(driveId, customerRoot.id, folderName);
    }

    // Save mapping to database
    await supabase.from('organization_sharepoint_mappings').upsert({
      organization_id: organizationId,
      drive_id: driveId,
      folder_id: customerRoot.id,
      folder_name: sanitizedName,
      folder_path: `/Customers/${sanitizedName}`,
      folder_url: customerRoot.webUrl,
      created_at: new Date().toISOString(),
    }, { onConflict: 'organization_id' });

    return { data: customerRoot, error: null };
  } catch (error) {
    console.error('Error initializing customer folders:', error);
    return { data: null, error };
  }
}

/**
 * Get the SharePoint folder mapping for an organization
 */
export async function getOrganizationFolderMapping(organizationId) {
  const { data, error } = await supabase
    .from('organization_sharepoint_mappings')
    .select('*')
    .eq('organization_id', organizationId)
    .single();

  return { data, error };
}

/**
 * Create project folder structure within a customer's folder
 * @param {string} organizationId - Organization UUID
 * @param {string} projectId - Project UUID
 * @param {string} projectName - Display name for the project
 * @param {string} templateId - Optional template ID for custom folder structure
 */
export async function createProjectFolders(organizationId, projectId, projectName, templateId = null) {
  try {
    // Get organization's root folder
    const { data: orgMapping, error: orgError } = await getOrganizationFolderMapping(organizationId);
    if (orgError || !orgMapping) {
      throw new Error('Organization folder not found');
    }

    const driveId = orgMapping.drive_id;
    const sanitizedName = `${projectName}`.replace(/[<>:"/\\|?*]/g, '-');

    // Get or create Projects folder
    const projectsFolder = await ensureFolder(driveId, orgMapping.folder_id, 'Projects');

    // Create project folder
    const projectFolder = await createFolder(driveId, projectsFolder.id, sanitizedName);

    let createdFolders = {};

    // Check if using template
    if (templateId) {
      const templateFolders = await getTemplateFolderStructure(templateId);
      if (templateFolders?.length > 0) {
        const folderTree = buildFolderTree(templateFolders);
        createdFolders = await createFoldersFromTemplate(driveId, projectFolder.data.id, folderTree);
      } else {
        // Fallback to default structure
        for (const folderName of PROJECT_FOLDER_STRUCTURE) {
          await createFolder(driveId, projectFolder.data.id, folderName);
        }
      }
    } else {
      // Use default project folder structure
      for (const folderName of PROJECT_FOLDER_STRUCTURE) {
        await createFolder(driveId, projectFolder.data.id, folderName);
      }
    }

    // Save project mapping
    await supabase.from('project_sharepoint_mappings').upsert({
      project_id: projectId,
      organization_id: organizationId,
      drive_id: driveId,
      folder_id: projectFolder.data.id,
      folder_name: sanitizedName,
      folder_path: `${orgMapping.folder_path}/Projects/${sanitizedName}`,
      folder_url: projectFolder.data.webUrl,
      template_id: templateId,
      created_folders: createdFolders,
      created_at: new Date().toISOString(),
    }, { onConflict: 'project_id' });

    return { data: projectFolder.data, createdFolders, error: null };
  } catch (error) {
    console.error('Error creating project folders:', error);
    return { data: null, error };
  }
}

/**
 * Create folders from a template for an existing project
 * Used when adding template folders to existing project
 */
export async function addTemplateFoldersToProject(projectId, templateId) {
  try {
    const { data: projectMapping } = await getProjectFolderMapping(projectId);
    if (!projectMapping) {
      throw new Error('Project folder not found');
    }

    const templateFolders = await getTemplateFolderStructure(templateId);
    if (!templateFolders?.length) {
      throw new Error('Template has no folders defined');
    }

    const folderTree = buildFolderTree(templateFolders);
    const createdFolders = await createFoldersFromTemplate(
      projectMapping.drive_id,
      projectMapping.folder_id,
      folderTree
    );

    return { data: createdFolders, error: null };
  } catch (error) {
    console.error('Error adding template folders to project:', error);
    return { data: null, error };
  }
}

/**
 * Get project folder mapping
 */
export async function getProjectFolderMapping(projectId) {
  const { data, error } = await supabase
    .from('project_sharepoint_mappings')
    .select('*')
    .eq('project_id', projectId)
    .single();

  return { data, error };
}

// Helper: Ensure a folder exists, create if not
async function ensureFolder(driveId, parentFolderId, folderName) {
  try {
    // Try to find existing folder
    const { data: items } = await listFolder(driveId, parentFolderId);
    const existingFolder = items?.find(item => item.name === folderName && item.type === 'folder');

    if (existingFolder) {
      return { id: existingFolder.id, name: existingFolder.name, webUrl: existingFolder.webUrl };
    }

    // Create new folder
    const result = await createFolder(driveId, parentFolderId, folderName);
    return result.data;
  } catch (error) {
    console.error('Error ensuring folder:', error);
    throw error;
  }
}

// ============================================
// FILE BROWSER (Scoped to Organization)
// ============================================

export async function listFolder(driveId, folderId = 'root') {
  try {
    const endpoint = folderId === 'root'
      ? `/drives/${driveId}/root/children`
      : `/drives/${driveId}/items/${folderId}/children`;

    const result = await graphRequest(`${endpoint}?$orderby=name&$top=100`);

    const items = (result.value || []).map(item => ({
      id: item.id,
      name: item.name,
      type: item.folder ? 'folder' : 'file',
      size: item.size,
      mimeType: item.file?.mimeType,
      webUrl: item.webUrl,
      createdDateTime: item.createdDateTime,
      lastModifiedDateTime: item.lastModifiedDateTime,
      createdBy: item.createdBy?.user?.displayName,
      lastModifiedBy: item.lastModifiedBy?.user?.displayName,
      downloadUrl: item['@microsoft.graph.downloadUrl'],
      parentReference: item.parentReference,
    }));

    return { data: items, error: null };
  } catch (error) {
    console.error('Error listing folder:', error);
    return { data: [], error };
  }
}

/**
 * List folder contents scoped to an organization
 * Users can only browse within their organization's folder
 */
export async function listOrganizationFolder(organizationId, folderId = null) {
  try {
    const { data: orgMapping, error: orgError } = await getOrganizationFolderMapping(organizationId);
    if (orgError || !orgMapping) {
      throw new Error('Organization folder not found');
    }

    // Default to org root folder
    const targetFolderId = folderId || orgMapping.folder_id;

    // Security check: Ensure folder is within org's folder tree
    // (In production, add path validation)

    return await listFolder(orgMapping.drive_id, targetFolderId);
  } catch (error) {
    console.error('Error listing organization folder:', error);
    return { data: [], error };
  }
}

/**
 * List folder contents scoped to a project
 */
export async function listProjectFolder(projectId, folderId = null) {
  try {
    const { data: projectMapping, error: projError } = await getProjectFolderMapping(projectId);
    if (projError || !projectMapping) {
      throw new Error('Project folder not found');
    }

    const targetFolderId = folderId || projectMapping.folder_id;

    return await listFolder(projectMapping.drive_id, targetFolderId);
  } catch (error) {
    console.error('Error listing project folder:', error);
    return { data: [], error };
  }
}

export async function getFolderPath(driveId, folderId) {
  if (folderId === 'root') {
    return { data: [{ id: 'root', name: 'Root' }], error: null };
  }

  try {
    const item = await graphRequest(`/drives/${driveId}/items/${folderId}`);

    const path = [];
    if (item.parentReference?.path) {
      const pathParts = item.parentReference.path.split('/').filter(Boolean);
      const startIndex = pathParts.findIndex(p => p === 'root:');
      if (startIndex >= 0) {
        pathParts.splice(0, startIndex + 1);
      }

      let currentPath = '';
      for (const part of pathParts) {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        path.push({ name: decodeURIComponent(part), path: currentPath });
      }
    }

    path.push({ id: item.id, name: item.name });

    return { data: [{ id: 'root', name: 'Root' }, ...path], error: null };
  } catch (error) {
    console.error('Error getting folder path:', error);
    return { data: [{ id: 'root', name: 'Root' }], error };
  }
}

export async function searchFiles(driveId, query) {
  try {
    const result = await graphRequest(`/drives/${driveId}/root/search(q='${encodeURIComponent(query)}')`);

    const items = (result.value || []).map(item => ({
      id: item.id,
      name: item.name,
      type: item.folder ? 'folder' : 'file',
      size: item.size,
      webUrl: item.webUrl,
      path: item.parentReference?.path?.replace('/drive/root:', '') || '',
    }));

    return { data: items, error: null };
  } catch (error) {
    console.error('Error searching files:', error);
    return { data: [], error };
  }
}

// ============================================
// FILE OPERATIONS
// ============================================

export async function createFolder(driveId, parentFolderId, folderName) {
  try {
    const endpoint = parentFolderId === 'root'
      ? `/drives/${driveId}/root/children`
      : `/drives/${driveId}/items/${parentFolderId}/children`;

    const result = await graphRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        name: folderName,
        folder: {},
        '@microsoft.graph.conflictBehavior': 'rename',
      }),
    });

    return {
      data: {
        id: result.id,
        name: result.name,
        webUrl: result.webUrl,
      },
      error: null
    };
  } catch (error) {
    console.error('Error creating folder:', error);
    return { data: null, error };
  }
}

export async function uploadFile(driveId, folderId, file, fileName) {
  try {
    const accessToken = await getValidAccessToken();

    const endpoint = folderId === 'root'
      ? `/drives/${driveId}/root:/${fileName}:/content`
      : `/drives/${driveId}/items/${folderId}:/${fileName}:/content`;

    const response = await fetch(`${GRAPH_API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    const result = await response.json();

    return {
      data: {
        id: result.id,
        name: result.name,
        webUrl: result.webUrl,
        size: result.size,
        downloadUrl: result['@microsoft.graph.downloadUrl'],
      },
      error: null
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { data: null, error };
  }
}

// Alias for backward compatibility
export const uploadFileToSharePoint = uploadFile;

/**
 * Upload file to organization folder
 */
export async function uploadToOrganization(organizationId, folderId, file, fileName) {
  const { data: orgMapping } = await getOrganizationFolderMapping(organizationId);
  if (!orgMapping) {
    return { data: null, error: new Error('Organization folder not found') };
  }

  const targetFolderId = folderId || orgMapping.folder_id;
  return await uploadFile(orgMapping.drive_id, targetFolderId, file, fileName);
}

/**
 * Upload file to project folder
 */
export async function uploadToProject(projectId, folderId, file, fileName) {
  const { data: projectMapping } = await getProjectFolderMapping(projectId);
  if (!projectMapping) {
    return { data: null, error: new Error('Project folder not found') };
  }

  const targetFolderId = folderId || projectMapping.folder_id;
  return await uploadFile(projectMapping.drive_id, targetFolderId, file, fileName);
}

export async function deleteItem(driveId, itemId) {
  try {
    await graphRequest(`/drives/${driveId}/items/${itemId}`, {
      method: 'DELETE',
    });
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting item:', error);
    return { success: false, error };
  }
}

export async function renameItem(driveId, itemId, newName) {
  try {
    const result = await graphRequest(`/drives/${driveId}/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: newName }),
    });
    return { data: result, error: null };
  } catch (error) {
    console.error('Error renaming item:', error);
    return { data: null, error };
  }
}

export async function getDownloadUrl(driveId, itemId) {
  try {
    const result = await graphRequest(`/drives/${driveId}/items/${itemId}`);
    return { url: result['@microsoft.graph.downloadUrl'], error: null };
  } catch (error) {
    console.error('Error getting download URL:', error);
    return { url: null, error };
  }
}

export async function createShareLink(driveId, itemId, type = 'view', expirationHours = null) {
  try {
    const body = {
      type: type,
      scope: 'anonymous',
    };

    if (expirationHours) {
      body.expirationDateTime = new Date(Date.now() + expirationHours * 60 * 60 * 1000).toISOString();
    }

    const result = await graphRequest(`/drives/${driveId}/items/${itemId}/createLink`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return {
      data: {
        url: result.link?.webUrl,
        type: result.link?.type,
        scope: result.link?.scope,
        expirationDateTime: result.expirationDateTime,
      },
      error: null
    };
  } catch (error) {
    console.error('Error creating share link:', error);
    return { data: null, error };
  }
}

// ============================================
// SITE & DRIVE DISCOVERY (Atlas Admin Only)
// ============================================

export async function getAvailableSites() {
  try {
    const result = await graphRequest('/sites?search=*');
    return { data: result.value || [], error: null };
  } catch (error) {
    console.error('Error fetching sites:', error);
    return { data: [], error };
  }
}

export const getUserSites = getAvailableSites;

export async function getSiteDrives(siteId) {
  try {
    const result = await graphRequest(`/sites/${siteId}/drives`);
    return { data: result.value || [], error: null };
  } catch (error) {
    console.error('Error fetching drives:', error);
    return { data: [], error };
  }
}

export async function getDefaultDrive() {
  try {
    const { data: connection } = await getAtlasSharePointConnection();
    if (connection?.drive_id) {
      const result = await graphRequest(`/drives/${connection.drive_id}`);
      return { data: result, error: null };
    }
    return { data: null, error: new Error('No drive configured') };
  } catch (error) {
    console.error('Error fetching default drive:', error);
    return { data: null, error };
  }
}

export const getMyDrive = getDefaultDrive;

// ============================================
// STATUS & ADMIN FUNCTIONS
// ============================================

export async function isSharePointConnected() {
  const { data } = await getAtlasSharePointConnection();
  return data?.is_connected === true;
}

export async function getSharePointStatus() {
  const { data, error } = await getAtlasSharePointConnection();

  if (error || !data) {
    return {
      connected: false,
      configured: isSharePointConfigured(),
      siteName: null,
      siteUrl: null,
      connectedBy: null,
      connectedAt: null,
    };
  }

  return {
    connected: data.is_connected,
    configured: isSharePointConfigured(),
    siteName: data.site_name,
    siteUrl: data.site_url,
    driveId: data.drive_id,
    connectedBy: data.connected_by,
    connectedAt: data.updated_at,
  };
}

// ============================================
// HELPERS
// ============================================

export function formatFileSize(bytes) {
  if (!bytes) return '-';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let size = bytes;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function getFileIcon(mimeType, isFolder) {
  if (isFolder) return 'folder';
  if (!mimeType) return 'file';

  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'word';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'excel';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'powerpoint';
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'archive';

  return 'file';
}

// ============================================
// LEGACY COMPATIBILITY (for existing components)
// ============================================

// These functions maintain backward compatibility with existing code
export async function setupProjectFolder(driveIdOrUserId, projectIdOrDriveId, projectNameOrProjectId, maybeProjectName) {
  // Simplified: just call createProjectFolders with proper params
  // This assumes organizationId is available in context
  console.warn('setupProjectFolder is deprecated. Use createProjectFolders instead.');
  return { data: null, error: new Error('Use createProjectFolders with organizationId') };
}

export async function getProjectSharePointMapping(projectId) {
  return getProjectFolderMapping(projectId);
}

// ============================================
// EXPORTS
// ============================================

export default {
  // Auth (Atlas Admin)
  isSharePointConfigured,
  getAdminAuthorizationUrl,
  getAuthorizationUrl,
  exchangeCodeForTokens,
  refreshAccessToken,

  // Platform Connection
  saveAtlasSharePointConnection,
  saveOrgSharePointConnection,
  saveSharePointConnection,
  getAtlasSharePointConnection,
  getOrgSharePointConnection,
  getSharePointConnection,
  disconnectAtlasSharePoint,
  disconnectOrgSharePoint,
  disconnectSharePoint,
  isSharePointConnected,
  getSharePointStatus,

  // Multi-tenant Management
  initializeCustomerFolders,
  getOrganizationFolderMapping,
  createProjectFolders,
  getProjectFolderMapping,
  addTemplateFoldersToProject,

  // Discovery (Admin)
  getAvailableSites,
  getUserSites,
  getSiteDrives,
  getDefaultDrive,
  getMyDrive,

  // Browser
  listFolder,
  listOrganizationFolder,
  listProjectFolder,
  getFolderPath,
  searchFiles,

  // Operations
  createFolder,
  uploadFile,
  uploadFileToSharePoint,
  uploadToOrganization,
  uploadToProject,
  deleteItem,
  renameItem,
  getDownloadUrl,
  createShareLink,

  // Legacy
  setupProjectFolder,
  getProjectSharePointMapping,

  // Helpers
  formatFileSize,
  getFileIcon,
};
