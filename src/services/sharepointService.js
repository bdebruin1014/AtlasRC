// src/services/sharepointService.js
// SharePoint Integration Service with Microsoft Graph API
// Handles OAuth authentication and file management

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
// OAUTH AUTHENTICATION
// ============================================

export function getAuthorizationUrl(state = '') {
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
  });

  return `https://login.microsoftonline.com/${MS_TENANT_ID}/oauth2/v2.0/authorize?${params}`;
}

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
// TOKEN STORAGE (in Supabase)
// ============================================

export async function saveSharePointConnection(userId, tokens, siteInfo) {
  const { data, error } = await supabase
    .from('sharepoint_connections')
    .upsert({
      user_id: userId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      site_id: siteInfo?.id,
      site_name: siteInfo?.displayName,
      site_url: siteInfo?.webUrl,
      drive_id: siteInfo?.driveId,
      is_connected: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select()
    .single();

  return { data, error };
}

export async function getSharePointConnection(userId) {
  const { data, error } = await supabase
    .from('sharepoint_connections')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    return { data: null, error };
  }

  return { data, error: null };
}

export async function disconnectSharePoint(userId) {
  const { error } = await supabase
    .from('sharepoint_connections')
    .update({
      is_connected: false,
      access_token: null,
      refresh_token: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  return { success: !error, error };
}

// Get valid access token (refresh if needed)
async function getValidAccessToken(userId) {
  const { data: connection, error } = await getSharePointConnection(userId);

  if (error || !connection || !connection.is_connected) {
    throw new Error('SharePoint not connected');
  }

  // Check if token is expired or about to expire (5 min buffer)
  const expiresAt = new Date(connection.token_expires_at);
  const now = new Date();
  const bufferMs = 5 * 60 * 1000;

  if (expiresAt.getTime() - now.getTime() < bufferMs) {
    // Refresh the token
    const tokens = await refreshAccessToken(connection.refresh_token);
    await saveSharePointConnection(userId, tokens, {
      id: connection.site_id,
      displayName: connection.site_name,
      webUrl: connection.site_url,
      driveId: connection.drive_id,
    });
    return tokens.access_token;
  }

  return connection.access_token;
}

// ============================================
// GRAPH API HELPERS
// ============================================

async function graphRequest(userId, endpoint, options = {}) {
  const accessToken = await getValidAccessToken(userId);

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
// SITE & DRIVE DISCOVERY
// ============================================

export async function getUserSites(userId) {
  try {
    const result = await graphRequest(userId, '/sites?search=*');
    return { data: result.value || [], error: null };
  } catch (error) {
    console.error('Error fetching sites:', error);
    return { data: [], error };
  }
}

export async function getSiteDrives(userId, siteId) {
  try {
    const result = await graphRequest(userId, `/sites/${siteId}/drives`);
    return { data: result.value || [], error: null };
  } catch (error) {
    console.error('Error fetching drives:', error);
    return { data: [], error };
  }
}

export async function getMyDrive(userId) {
  try {
    const result = await graphRequest(userId, '/me/drive');
    return { data: result, error: null };
  } catch (error) {
    console.error('Error fetching my drive:', error);
    return { data: null, error };
  }
}

// ============================================
// FILE BROWSER
// ============================================

export async function listFolder(userId, driveId, folderId = 'root') {
  try {
    const endpoint = folderId === 'root'
      ? `/drives/${driveId}/root/children`
      : `/drives/${driveId}/items/${folderId}/children`;

    const result = await graphRequest(userId, `${endpoint}?$orderby=name&$top=100`);

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

export async function getFolderPath(userId, driveId, folderId) {
  if (folderId === 'root') {
    return { data: [{ id: 'root', name: 'Root' }], error: null };
  }

  try {
    const item = await graphRequest(userId, `/drives/${driveId}/items/${folderId}`);

    const path = [];
    if (item.parentReference?.path) {
      const pathParts = item.parentReference.path.split('/').filter(Boolean);
      // Remove 'drive/root:' prefix
      const startIndex = pathParts.findIndex(p => p === 'root:');
      if (startIndex >= 0) {
        pathParts.splice(0, startIndex + 1);
      }

      // Build breadcrumb
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

export async function searchFiles(userId, driveId, query) {
  try {
    const result = await graphRequest(userId, `/drives/${driveId}/root/search(q='${encodeURIComponent(query)}')`);

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

export async function uploadFileToSharePoint(userId, driveId, folderId, file, fileName) {
  try {
    const accessToken = await getValidAccessToken(userId);

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

export async function createFolder(userId, driveId, parentFolderId, folderName) {
  try {
    const endpoint = parentFolderId === 'root'
      ? `/drives/${driveId}/root/children`
      : `/drives/${driveId}/items/${parentFolderId}/children`;

    const result = await graphRequest(userId, endpoint, {
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

export async function deleteItem(userId, driveId, itemId) {
  try {
    await graphRequest(userId, `/drives/${driveId}/items/${itemId}`, {
      method: 'DELETE',
    });
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting item:', error);
    return { success: false, error };
  }
}

export async function renameItem(userId, driveId, itemId, newName) {
  try {
    const result = await graphRequest(userId, `/drives/${driveId}/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: newName }),
    });
    return { data: result, error: null };
  } catch (error) {
    console.error('Error renaming item:', error);
    return { data: null, error };
  }
}

export async function copyItem(userId, driveId, itemId, destinationFolderId) {
  try {
    await graphRequest(userId, `/drives/${driveId}/items/${itemId}/copy`, {
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

export async function moveItem(userId, driveId, itemId, destinationFolderId) {
  try {
    const result = await graphRequest(userId, `/drives/${driveId}/items/${itemId}`, {
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

export async function getDownloadUrl(userId, driveId, itemId) {
  try {
    const result = await graphRequest(userId, `/drives/${driveId}/items/${itemId}`);
    return { url: result['@microsoft.graph.downloadUrl'], error: null };
  } catch (error) {
    console.error('Error getting download URL:', error);
    return { url: null, error };
  }
}

export async function createShareLink(userId, driveId, itemId, type = 'view', expirationHours = null) {
  try {
    const body = {
      type: type, // 'view' or 'edit'
      scope: 'anonymous',
    };

    if (expirationHours) {
      body.expirationDateTime = new Date(Date.now() + expirationHours * 60 * 60 * 1000).toISOString();
    }

    const result = await graphRequest(userId, `/drives/${driveId}/items/${itemId}/createLink`, {
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

export async function setupProjectFolder(userId, driveId, projectId, projectName) {
  try {
    // Create base folder structure for project
    const baseFolderName = `${projectName} (${projectId})`.replace(/[<>:"/\\|?*]/g, '-');

    // Create project root folder
    const { data: projectFolder, error: folderError } = await createFolder(userId, driveId, 'root', baseFolderName);
    if (folderError) throw folderError;

    // Create standard subfolders
    const subfolders = ['Contracts', 'Legal', 'Financial', 'Correspondence', 'Photos', 'Reports', 'Inspections'];

    for (const subfolder of subfolders) {
      await createFolder(userId, driveId, projectFolder.id, subfolder);
    }

    // Save project-SharePoint mapping
    await supabase.from('project_sharepoint_mappings').upsert({
      project_id: projectId,
      drive_id: driveId,
      folder_id: projectFolder.id,
      folder_name: baseFolderName,
      folder_url: projectFolder.webUrl,
      created_by: userId,
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
  // Auth
  isSharePointConfigured,
  getAuthorizationUrl,
  exchangeCodeForTokens,
  refreshAccessToken,

  // Connection
  saveSharePointConnection,
  getSharePointConnection,
  disconnectSharePoint,

  // Discovery
  getUserSites,
  getSiteDrives,
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
