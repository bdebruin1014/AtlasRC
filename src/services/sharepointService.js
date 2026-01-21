// src/services/sharepointService.js
// SharePoint Integration Service with Microsoft Graph API
// Supports ORG-WIDE admin connection (all users share same SharePoint access)

import { supabase } from '@/lib/supabase';

// ============================================
// CONFIGURATION
// ============================================

const MS_TENANT_ID = import.meta.env.VITE_MS_TENANT_ID;
const MS_CLIENT_ID = import.meta.env.VITE_MS_CLIENT_ID;
const GRAPH_API_URL = 'https://graph.microsoft.com/v1.0';
const REDIRECT_URI = `${window.location.origin}/auth/sharepoint/callback`;

// Scopes needed for SharePoint access (admin connects once for org)
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
// OAUTH AUTHENTICATION (Admin Only)
// ============================================

export function getAdminAuthorizationUrl(state = '') {
  if (!isSharePointConfigured()) {
    throw new Error('SharePoint is not configured. Please set VITE_MS_TENANT_ID and VITE_MS_CLIENT_ID environment variables.');
  }

  // Request admin consent for org-wide access
  const params = new URLSearchParams({
    client_id: MS_CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    response_mode: 'query',
    scope: SHAREPOINT_SCOPES,
    state: state,
    prompt: 'consent', // Force consent to ensure admin grants permissions
  });

  return `https://login.microsoftonline.com/${MS_TENANT_ID}/oauth2/v2.0/authorize?${params}`;
}

// Alias for backward compatibility
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
// ORG-WIDE TOKEN STORAGE (in Supabase)
// ============================================

// Save org-wide SharePoint connection (admin only)
export async function saveOrgSharePointConnection(adminUserId, tokens, siteInfo) {
  const { data, error } = await supabase
    .from('sharepoint_connections')
    .upsert({
      id: 'org-wide', // Single org-wide connection
      user_id: adminUserId,
      connection_type: 'organization',
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

// Alias for backward compatibility
export const saveSharePointConnection = async (userId, tokens, siteInfo) => {
  return saveOrgSharePointConnection(userId, tokens, siteInfo);
};

// Get org-wide SharePoint connection (any user can read)
export async function getOrgSharePointConnection() {
  const { data, error } = await supabase
    .from('sharepoint_connections')
    .select('*')
    .eq('id', 'org-wide')
    .single();

  if (error && error.code !== 'PGRST116') {
    return { data: null, error };
  }

  return { data, error: null };
}

// Alias for backward compatibility (ignores userId, returns org connection)
export const getSharePointConnection = async (userId) => {
  return getOrgSharePointConnection();
};

// Disconnect org-wide SharePoint (admin only)
export async function disconnectOrgSharePoint() {
  const { error } = await supabase
    .from('sharepoint_connections')
    .update({
      is_connected: false,
      access_token: null,
      refresh_token: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 'org-wide');

  return { success: !error, error };
}

// Alias for backward compatibility
export const disconnectSharePoint = async (userId) => {
  return disconnectOrgSharePoint();
};

// Get valid access token (refresh if needed) - uses org-wide connection
async function getValidAccessToken() {
  const { data: connection, error } = await getOrgSharePointConnection();

  if (error || !connection || !connection.is_connected) {
    throw new Error('SharePoint not connected. Please ask your admin to connect SharePoint.');
  }

  // Check if token is expired or about to expire (5 min buffer)
  const expiresAt = new Date(connection.token_expires_at);
  const now = new Date();
  const bufferMs = 5 * 60 * 1000;

  if (expiresAt.getTime() - now.getTime() < bufferMs) {
    // Refresh the token
    const tokens = await refreshAccessToken(connection.refresh_token);
    await supabase
      .from('sharepoint_connections')
      .update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || connection.refresh_token,
        token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', 'org-wide');
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

// Legacy wrapper that accepts userId but doesn't use it
async function graphRequestWithUser(userId, endpoint, options = {}) {
  return graphRequest(endpoint, options);
}

// ============================================
// SITE & DRIVE DISCOVERY
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

// Legacy alias
export const getUserSites = async (userId) => getAvailableSites();

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
    const { data: connection } = await getOrgSharePointConnection();
    if (connection?.drive_id) {
      const result = await graphRequest(`/drives/${connection.drive_id}`);
      return { data: result, error: null };
    }
    // Fallback to first available drive
    const result = await graphRequest('/me/drive');
    return { data: result, error: null };
  } catch (error) {
    console.error('Error fetching default drive:', error);
    return { data: null, error };
  }
}

// Legacy alias
export const getMyDrive = async (userId) => getDefaultDrive();

// ============================================
// FILE BROWSER (Any User)
// ============================================

export async function listFolder(driveIdOrUserId, folderIdOrDriveId = 'root', maybeFolderId) {
  // Handle both old signature (userId, driveId, folderId) and new signature (driveId, folderId)
  let driveId, folderId;
  if (maybeFolderId !== undefined) {
    // Old signature: (userId, driveId, folderId)
    driveId = folderIdOrDriveId;
    folderId = maybeFolderId;
  } else {
    // New signature: (driveId, folderId)
    driveId = driveIdOrUserId;
    folderId = folderIdOrDriveId;
  }

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

export async function getFolderPath(driveIdOrUserId, folderIdOrDriveId, maybeFolderId) {
  // Handle both signatures
  let driveId, folderId;
  if (maybeFolderId !== undefined) {
    driveId = folderIdOrDriveId;
    folderId = maybeFolderId;
  } else {
    driveId = driveIdOrUserId;
    folderId = folderIdOrDriveId;
  }

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

export async function searchFiles(driveIdOrUserId, queryOrDriveId, maybeQuery) {
  // Handle both signatures
  let driveId, query;
  if (maybeQuery !== undefined) {
    driveId = queryOrDriveId;
    query = maybeQuery;
  } else {
    driveId = driveIdOrUserId;
    query = queryOrDriveId;
  }

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
// FILE OPERATIONS (Any User)
// ============================================

export async function uploadFileToSharePoint(driveIdOrUserId, folderIdOrDriveId, fileOrFolderId, fileNameOrFile, maybeFileName) {
  // Handle both signatures
  let driveId, folderId, file, fileName;
  if (maybeFileName !== undefined) {
    // Old: (userId, driveId, folderId, file, fileName)
    driveId = folderIdOrDriveId;
    folderId = fileOrFolderId;
    file = fileNameOrFile;
    fileName = maybeFileName;
  } else {
    // New: (driveId, folderId, file, fileName)
    driveId = driveIdOrUserId;
    folderId = folderIdOrDriveId;
    file = fileOrFolderId;
    fileName = fileNameOrFile;
  }

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

export async function createFolder(driveIdOrUserId, parentFolderIdOrDriveId, folderNameOrParentFolderId, maybeFolderName) {
  // Handle both signatures
  let driveId, parentFolderId, folderName;
  if (maybeFolderName !== undefined) {
    driveId = parentFolderIdOrDriveId;
    parentFolderId = folderNameOrParentFolderId;
    folderName = maybeFolderName;
  } else {
    driveId = driveIdOrUserId;
    parentFolderId = parentFolderIdOrDriveId;
    folderName = folderNameOrParentFolderId;
  }

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

export async function deleteItem(driveIdOrUserId, itemIdOrDriveId, maybeItemId) {
  let driveId, itemId;
  if (maybeItemId !== undefined) {
    driveId = itemIdOrDriveId;
    itemId = maybeItemId;
  } else {
    driveId = driveIdOrUserId;
    itemId = itemIdOrDriveId;
  }

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

export async function renameItem(driveIdOrUserId, itemIdOrDriveId, newNameOrItemId, maybeNewName) {
  let driveId, itemId, newName;
  if (maybeNewName !== undefined) {
    driveId = itemIdOrDriveId;
    itemId = newNameOrItemId;
    newName = maybeNewName;
  } else {
    driveId = driveIdOrUserId;
    itemId = itemIdOrDriveId;
    newName = newNameOrItemId;
  }

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

export async function copyItem(driveIdOrUserId, itemIdOrDriveId, destinationFolderIdOrItemId, maybeDestinationFolderId) {
  let driveId, itemId, destinationFolderId;
  if (maybeDestinationFolderId !== undefined) {
    driveId = itemIdOrDriveId;
    itemId = destinationFolderIdOrItemId;
    destinationFolderId = maybeDestinationFolderId;
  } else {
    driveId = driveIdOrUserId;
    itemId = itemIdOrDriveId;
    destinationFolderId = destinationFolderIdOrItemId;
  }

  try {
    await graphRequest(`/drives/${driveId}/items/${itemId}/copy`, {
      method: 'POST',
      body: JSON.stringify({
        parentReference: {
          driveId,
          id: destinationFolderId,
        },
      }),
    });
    return { success: true, error: null };
  } catch (error) {
    console.error('Error copying item:', error);
    return { success: false, error };
  }
}

export async function moveItem(driveIdOrUserId, itemIdOrDriveId, destinationFolderIdOrItemId, maybeDestinationFolderId) {
  let driveId, itemId, destinationFolderId;
  if (maybeDestinationFolderId !== undefined) {
    driveId = itemIdOrDriveId;
    itemId = destinationFolderIdOrItemId;
    destinationFolderId = maybeDestinationFolderId;
  } else {
    driveId = driveIdOrUserId;
    itemId = itemIdOrDriveId;
    destinationFolderId = destinationFolderIdOrItemId;
  }

  try {
    const result = await graphRequest(`/drives/${driveId}/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        parentReference: {
          id: destinationFolderId,
        },
      }),
    });
    return { data: result, error: null };
  } catch (error) {
    console.error('Error moving item:', error);
    return { data: null, error };
  }
}

export async function getDownloadUrl(driveIdOrUserId, itemIdOrDriveId, maybeItemId) {
  let driveId, itemId;
  if (maybeItemId !== undefined) {
    driveId = itemIdOrDriveId;
    itemId = maybeItemId;
  } else {
    driveId = driveIdOrUserId;
    itemId = itemIdOrDriveId;
  }

  try {
    const result = await graphRequest(`/drives/${driveId}/items/${itemId}`);
    return { url: result['@microsoft.graph.downloadUrl'], error: null };
  } catch (error) {
    console.error('Error getting download URL:', error);
    return { url: null, error };
  }
}

export async function createShareLink(driveIdOrUserId, itemIdOrDriveId, typeOrItemId, expirationHoursOrType, maybeExpirationHours) {
  let driveId, itemId, type, expirationHours;
  if (maybeExpirationHours !== undefined || typeof expirationHoursOrType === 'string') {
    // Old signature
    driveId = itemIdOrDriveId;
    itemId = typeOrItemId;
    type = expirationHoursOrType || 'view';
    expirationHours = maybeExpirationHours;
  } else {
    // New signature
    driveId = driveIdOrUserId;
    itemId = itemIdOrDriveId;
    type = typeOrItemId || 'view';
    expirationHours = expirationHoursOrType;
  }

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
// PROJECT FOLDER SYNC
// ============================================

export async function setupProjectFolder(driveIdOrUserId, projectIdOrDriveId, projectNameOrProjectId, maybeProjectName) {
  let driveId, projectId, projectName;
  if (maybeProjectName !== undefined) {
    driveId = projectIdOrDriveId;
    projectId = projectNameOrProjectId;
    projectName = maybeProjectName;
  } else {
    driveId = driveIdOrUserId;
    projectId = projectIdOrDriveId;
    projectName = projectNameOrProjectId;
  }

  try {
    const baseFolderName = `${projectName} (${projectId})`.replace(/[<>:"/\\|?*]/g, '-');

    const { data: projectFolder, error: folderError } = await createFolder(driveId, 'root', baseFolderName);
    if (folderError) throw folderError;

    const subfolders = ['Contracts', 'Legal', 'Financial', 'Correspondence', 'Photos', 'Reports', 'Inspections'];

    for (const subfolder of subfolders) {
      await createFolder(driveId, projectFolder.id, subfolder);
    }

    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('project_sharepoint_mappings').upsert({
      project_id: projectId,
      drive_id: driveId,
      folder_id: projectFolder.id,
      folder_name: baseFolderName,
      folder_url: projectFolder.webUrl,
      created_by: user?.id,
    }, { onConflict: 'project_id' });

    return { data: projectFolder, error: null };
  } catch (error) {
    console.error('Error setting up project folder:', error);
    return { data: null, error };
  }
}

export async function getProjectSharePointMapping(projectId) {
  const { data, error } = await supabase
    .from('project_sharepoint_mappings')
    .select('*')
    .eq('project_id', projectId)
    .single();

  return { data, error };
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

export async function isSharePointConnected() {
  const { data } = await getOrgSharePointConnection();
  return data?.is_connected === true;
}

export async function getSharePointStatus() {
  const { data, error } = await getOrgSharePointConnection();

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
// EXPORTS
// ============================================

export default {
  // Auth (Admin)
  isSharePointConfigured,
  getAdminAuthorizationUrl,
  getAuthorizationUrl,
  exchangeCodeForTokens,
  refreshAccessToken,

  // Connection (Org-wide)
  saveOrgSharePointConnection,
  saveSharePointConnection,
  getOrgSharePointConnection,
  getSharePointConnection,
  disconnectOrgSharePoint,
  disconnectSharePoint,
  isSharePointConnected,
  getSharePointStatus,

  // Discovery
  getAvailableSites,
  getUserSites,
  getSiteDrives,
  getDefaultDrive,
  getMyDrive,

  // Browser
  listFolder,
  getFolderPath,
  searchFiles,

  // Operations
  uploadFileToSharePoint,
  createFolder,
  deleteItem,
  renameItem,
  copyItem,
  moveItem,
  getDownloadUrl,
  createShareLink,

  // Project
  setupProjectFolder,
  getProjectSharePointMapping,

  // Helpers
  formatFileSize,
  getFileIcon,
};
