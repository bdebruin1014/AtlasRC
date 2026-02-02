// src/services/outlookService.js
// Outlook Email Integration Service with Microsoft Graph API
// Provides Qualia-style email integration within project portals

import { supabase } from '@/lib/supabase';

// ============================================
// CONFIGURATION
// ============================================

const MS_TENANT_ID = import.meta.env.VITE_MS_TENANT_ID;
const MS_CLIENT_ID = import.meta.env.VITE_MS_CLIENT_ID;
const GRAPH_API_URL = 'https://graph.microsoft.com/v1.0';
const REDIRECT_URI = `${window.location.origin}/auth/outlook/callback`;

// Scopes needed for Outlook access
const OUTLOOK_SCOPES = [
  'Mail.ReadWrite',
  'Mail.Send',
  'Calendars.ReadWrite',
  'User.Read',
  'offline_access',
].join(' ');

// Check if Outlook is configured
export function isOutlookConfigured() {
  return !!(MS_TENANT_ID && MS_CLIENT_ID);
}

// ============================================
// OAUTH AUTHENTICATION
// ============================================

export function getAuthorizationUrl(state = '') {
  if (!isOutlookConfigured()) {
    throw new Error('Outlook is not configured. Please set VITE_MS_TENANT_ID and VITE_MS_CLIENT_ID environment variables.');
  }

  const params = new URLSearchParams({
    client_id: MS_CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    response_mode: 'query',
    scope: OUTLOOK_SCOPES,
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
      scope: OUTLOOK_SCOPES,
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
      scope: OUTLOOK_SCOPES,
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

export async function saveOutlookConnection(userId, tokens, userInfo) {
  const { data, error } = await supabase
    .from('outlook_connections')
    .upsert({
      user_id: userId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      email: userInfo?.mail || userInfo?.userPrincipalName,
      display_name: userInfo?.displayName,
      is_connected: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select()
    .single();

  return { data, error };
}

export async function getOutlookConnection(userId) {
  const { data, error } = await supabase
    .from('outlook_connections')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    return { data: null, error };
  }

  return { data, error: null };
}

export async function disconnectOutlook(userId) {
  const { error } = await supabase
    .from('outlook_connections')
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
  const { data: connection, error } = await getOutlookConnection(userId);

  if (error || !connection || !connection.is_connected) {
    throw new Error('Outlook not connected');
  }

  // Check if token is expired or about to expire (5 min buffer)
  const expiresAt = new Date(connection.token_expires_at);
  const now = new Date();
  const bufferMs = 5 * 60 * 1000;

  if (expiresAt.getTime() - now.getTime() < bufferMs) {
    const tokens = await refreshAccessToken(connection.refresh_token);
    await saveOutlookConnection(userId, tokens, {
      mail: connection.email,
      displayName: connection.display_name,
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
// EMAIL OPERATIONS
// ============================================

export async function getEmails(userId, options = {}) {
  try {
    const {
      folder = 'inbox',
      top = 50,
      skip = 0,
      search = '',
      filter = '',
      orderBy = 'receivedDateTime desc',
    } = options;

    let endpoint = `/me/mailFolders/${folder}/messages?$top=${top}&$skip=${skip}&$orderby=${orderBy}`;

    if (search) {
      endpoint += `&$search="${encodeURIComponent(search)}"`;
    }

    if (filter) {
      endpoint += `&$filter=${encodeURIComponent(filter)}`;
    }

    // Select specific fields to reduce payload
    endpoint += '&$select=id,subject,bodyPreview,from,toRecipients,ccRecipients,receivedDateTime,sentDateTime,hasAttachments,isRead,importance,flag,conversationId';

    const result = await graphRequest(userId, endpoint);

    const emails = (result.value || []).map(email => ({
      id: email.id,
      subject: email.subject,
      preview: email.bodyPreview,
      from: {
        name: email.from?.emailAddress?.name,
        email: email.from?.emailAddress?.address,
      },
      to: (email.toRecipients || []).map(r => ({
        name: r.emailAddress?.name,
        email: r.emailAddress?.address,
      })),
      cc: (email.ccRecipients || []).map(r => ({
        name: r.emailAddress?.name,
        email: r.emailAddress?.address,
      })),
      receivedDateTime: email.receivedDateTime,
      sentDateTime: email.sentDateTime,
      hasAttachments: email.hasAttachments,
      isRead: email.isRead,
      importance: email.importance,
      isFlagged: email.flag?.flagStatus === 'flagged',
      conversationId: email.conversationId,
    }));

    return {
      data: emails,
      hasMore: result['@odata.nextLink'] ? true : false,
      error: null,
    };
  } catch (error) {
    console.error('Error fetching emails:', error);
    return { data: [], hasMore: false, error };
  }
}

export async function getEmail(userId, emailId) {
  try {
    const email = await graphRequest(userId, `/me/messages/${emailId}`);

    return {
      data: {
        id: email.id,
        subject: email.subject,
        body: email.body?.content,
        bodyType: email.body?.contentType,
        from: {
          name: email.from?.emailAddress?.name,
          email: email.from?.emailAddress?.address,
        },
        to: (email.toRecipients || []).map(r => ({
          name: r.emailAddress?.name,
          email: r.emailAddress?.address,
        })),
        cc: (email.ccRecipients || []).map(r => ({
          name: r.emailAddress?.name,
          email: r.emailAddress?.address,
        })),
        bcc: (email.bccRecipients || []).map(r => ({
          name: r.emailAddress?.name,
          email: r.emailAddress?.address,
        })),
        receivedDateTime: email.receivedDateTime,
        sentDateTime: email.sentDateTime,
        hasAttachments: email.hasAttachments,
        isRead: email.isRead,
        importance: email.importance,
        conversationId: email.conversationId,
        internetMessageId: email.internetMessageId,
        webLink: email.webLink,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error fetching email:', error);
    return { data: null, error };
  }
}

export async function getEmailAttachments(userId, emailId) {
  try {
    const result = await graphRequest(userId, `/me/messages/${emailId}/attachments`);

    const attachments = (result.value || []).map(att => ({
      id: att.id,
      name: att.name,
      contentType: att.contentType,
      size: att.size,
      isInline: att.isInline,
      contentId: att.contentId,
      contentBytes: att.contentBytes,
    }));

    return { data: attachments, error: null };
  } catch (error) {
    console.error('Error fetching attachments:', error);
    return { data: [], error };
  }
}

export async function sendEmail(userId, email) {
  try {
    const message = {
      subject: email.subject,
      body: {
        contentType: email.isHtml ? 'HTML' : 'Text',
        content: email.body,
      },
      toRecipients: email.to.map(addr => ({
        emailAddress: { address: addr.email, name: addr.name },
      })),
    };

    if (email.cc && email.cc.length > 0) {
      message.ccRecipients = email.cc.map(addr => ({
        emailAddress: { address: addr.email, name: addr.name },
      }));
    }

    if (email.bcc && email.bcc.length > 0) {
      message.bccRecipients = email.bcc.map(addr => ({
        emailAddress: { address: addr.email, name: addr.name },
      }));
    }

    if (email.importance) {
      message.importance = email.importance;
    }

    // If replying, include internet message headers
    if (email.inReplyTo) {
      message.internetMessageHeaders = [
        { name: 'In-Reply-To', value: email.inReplyTo },
      ];
    }

    const payload = { message, saveToSentItems: true };

    // Handle attachments
    if (email.attachments && email.attachments.length > 0) {
      message.attachments = email.attachments.map(att => ({
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: att.name,
        contentType: att.contentType,
        contentBytes: att.contentBytes, // Base64 encoded
      }));
    }

    await graphRequest(userId, '/me/sendMail', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return { success: true, error: null };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export async function replyToEmail(userId, emailId, reply) {
  try {
    const payload = {
      message: {
        body: {
          contentType: reply.isHtml ? 'HTML' : 'Text',
          content: reply.body,
        },
      },
    };

    // Reply or Reply All
    const endpoint = reply.replyAll
      ? `/me/messages/${emailId}/replyAll`
      : `/me/messages/${emailId}/reply`;

    await graphRequest(userId, endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return { success: true, error: null };
  } catch (error) {
    console.error('Error replying to email:', error);
    return { success: false, error };
  }
}

export async function forwardEmail(userId, emailId, forward) {
  try {
    const payload = {
      message: {
        body: {
          contentType: forward.isHtml ? 'HTML' : 'Text',
          content: forward.comment || '',
        },
      },
      toRecipients: forward.to.map(addr => ({
        emailAddress: { address: addr.email, name: addr.name },
      })),
    };

    await graphRequest(userId, `/me/messages/${emailId}/forward`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return { success: true, error: null };
  } catch (error) {
    console.error('Error forwarding email:', error);
    return { success: false, error };
  }
}

export async function markAsRead(userId, emailId, isRead = true) {
  try {
    await graphRequest(userId, `/me/messages/${emailId}`, {
      method: 'PATCH',
      body: JSON.stringify({ isRead }),
    });

    return { success: true, error: null };
  } catch (error) {
    console.error('Error marking email:', error);
    return { success: false, error };
  }
}

export async function deleteEmail(userId, emailId) {
  try {
    await graphRequest(userId, `/me/messages/${emailId}`, {
      method: 'DELETE',
    });

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting email:', error);
    return { success: false, error };
  }
}

export async function moveEmail(userId, emailId, destinationFolderId) {
  try {
    await graphRequest(userId, `/me/messages/${emailId}/move`, {
      method: 'POST',
      body: JSON.stringify({ destinationId: destinationFolderId }),
    });

    return { success: true, error: null };
  } catch (error) {
    console.error('Error moving email:', error);
    return { success: false, error };
  }
}

// ============================================
// MAIL FOLDERS
// ============================================

export async function getMailFolders(userId) {
  try {
    const result = await graphRequest(userId, '/me/mailFolders?$top=100');

    const folders = (result.value || []).map(folder => ({
      id: folder.id,
      displayName: folder.displayName,
      parentFolderId: folder.parentFolderId,
      totalItemCount: folder.totalItemCount,
      unreadItemCount: folder.unreadItemCount,
    }));

    return { data: folders, error: null };
  } catch (error) {
    console.error('Error fetching folders:', error);
    return { data: [], error };
  }
}

// ============================================
// PROJECT EMAIL LINKING
// ============================================

export async function linkEmailToProject(userId, emailId, projectId, notes = '') {
  try {
    // Get email details
    const { data: email, error: emailError } = await getEmail(userId, emailId);
    if (emailError) throw emailError;

    // Store in project_emails table
    const { data, error } = await supabase
      .from('project_emails')
      .insert({
        project_id: projectId,
        email_id: emailId,
        conversation_id: email.conversationId,
        subject: email.subject,
        from_email: email.from?.email,
        from_name: email.from?.name,
        to_emails: email.to.map(t => t.email),
        received_at: email.receivedDateTime,
        has_attachments: email.hasAttachments,
        notes,
        linked_by: userId,
      })
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error linking email to project:', error);
    return { data: null, error };
  }
}

export async function unlinkEmailFromProject(projectEmailId) {
  try {
    const { error } = await supabase
      .from('project_emails')
      .delete()
      .eq('id', projectEmailId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error unlinking email:', error);
    return { success: false, error };
  }
}

export async function getProjectEmails(projectId, options = {}) {
  try {
    let query = supabase
      .from('project_emails')
      .select('*')
      .eq('project_id', projectId)
      .order('received_at', { ascending: false });

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching project emails:', error);
    return { data: [], error };
  }
}

export async function searchEmailsForProject(userId, projectId, projectContacts = []) {
  try {
    // Get project details for smart search
    const { data: project } = await supabase
      .from('projects')
      .select('name, address')
      .eq('id', projectId)
      .single();

    if (!project) {
      return { data: [], error: { message: 'Project not found' } };
    }

    // Search by project name and address
    const searchTerms = [project.name];
    if (project.address) {
      searchTerms.push(project.address);
    }

    // Also search by contact emails
    if (projectContacts.length > 0) {
      // Build filter for contact emails
      const emailFilter = projectContacts
        .map(c => `from/emailAddress/address eq '${c}'`)
        .join(' or ');

      const { data: contactEmails } = await getEmails(userId, {
        filter: emailFilter,
        top: 20,
      });

      if (contactEmails && contactEmails.length > 0) {
        return { data: contactEmails, error: null };
      }
    }

    // Search by project name
    const { data: searchEmails } = await getEmails(userId, {
      search: project.name,
      top: 20,
    });

    return { data: searchEmails || [], error: null };
  } catch (error) {
    console.error('Error searching emails for project:', error);
    return { data: [], error };
  }
}

// ============================================
// CALENDAR INTEGRATION
// ============================================

export async function getCalendarEvents(userId, options = {}) {
  try {
    const {
      startDateTime = new Date().toISOString(),
      endDateTime = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      top = 50,
    } = options;

    const endpoint = `/me/calendarView?startDateTime=${startDateTime}&endDateTime=${endDateTime}&$top=${top}&$orderby=start/dateTime`;

    const result = await graphRequest(userId, endpoint);

    const events = (result.value || []).map(event => ({
      id: event.id,
      subject: event.subject,
      bodyPreview: event.bodyPreview,
      start: event.start,
      end: event.end,
      location: event.location?.displayName,
      isAllDay: event.isAllDay,
      organizer: event.organizer?.emailAddress,
      attendees: (event.attendees || []).map(a => ({
        name: a.emailAddress?.name,
        email: a.emailAddress?.address,
        status: a.status?.response,
      })),
      webLink: event.webLink,
    }));

    return { data: events, error: null };
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return { data: [], error };
  }
}

export async function createCalendarEvent(userId, event) {
  try {
    const eventData = {
      subject: event.subject,
      body: {
        contentType: event.isHtml ? 'HTML' : 'Text',
        content: event.body || '',
      },
      start: {
        dateTime: event.startDateTime,
        timeZone: event.timeZone || 'America/New_York',
      },
      end: {
        dateTime: event.endDateTime,
        timeZone: event.timeZone || 'America/New_York',
      },
      isAllDay: event.isAllDay || false,
    };

    if (event.location) {
      eventData.location = { displayName: event.location };
    }

    if (event.attendees && event.attendees.length > 0) {
      eventData.attendees = event.attendees.map(a => ({
        emailAddress: { address: a.email, name: a.name },
        type: 'required',
      }));
    }

    const result = await graphRequest(userId, '/me/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });

    return { data: result, error: null };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return { data: null, error };
  }
}

// ============================================
// USER INFO
// ============================================

export async function getMe(userId) {
  try {
    const user = await graphRequest(userId, '/me');
    return {
      data: {
        id: user.id,
        displayName: user.displayName,
        email: user.mail || user.userPrincipalName,
        jobTitle: user.jobTitle,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error fetching user info:', error);
    return { data: null, error };
  }
}

// ============================================
// HELPERS
// ============================================

export function formatEmailDate(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

export function getEmailInitials(email) {
  if (!email) return '??';

  const name = email.name || email.email?.split('@')[0] || '';
  const parts = name.split(' ');

  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  return name.substring(0, 2).toUpperCase();
}

// ============================================
// EXPORTS
// ============================================

export default {
  // Auth
  isOutlookConfigured,
  getAuthorizationUrl,
  exchangeCodeForTokens,
  refreshAccessToken,

  // Connection
  saveOutlookConnection,
  getOutlookConnection,
  disconnectOutlook,

  // Emails
  getEmails,
  getEmail,
  getEmailAttachments,
  sendEmail,
  replyToEmail,
  forwardEmail,
  markAsRead,
  deleteEmail,
  moveEmail,

  // Folders
  getMailFolders,

  // Project linking
  linkEmailToProject,
  unlinkEmailFromProject,
  getProjectEmails,
  searchEmailsForProject,

  // Calendar
  getCalendarEvents,
  createCalendarEvent,

  // User
  getMe,

  // Helpers
  formatEmailDate,
  getEmailInitials,
};
